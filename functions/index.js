const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

/**
 * Salted Credential Store.
 * In production, these can be set via Firebase Environment Config:
 *   firebase functions:config:set auth.seb_hash="..." auth.lynn_hash="..."
 * or stored in a secured private collection in Firestore (accessible only by admin SDK).
 */
function getEnvHashes(envVal) {
  if (!envVal) return [];
  return envVal.split(',').map(s => s.trim()).filter(Boolean);
}

const SALT_USERS = [
  {
    uid: 'seb_user',
    name: 'Seb',
    avatar: '✨',
    coupleId: 'seb_lynn',
    roomId: 'shared',
    hashes: getEnvHashes(process.env.SEB_HASH)
  },
  {
    uid: 'lynn_user',
    name: 'Lynn',
    avatar: '🌸',
    coupleId: 'seb_lynn',
    roomId: 'shared',
    hashes: getEnvHashes(process.env.LYNN_HASH)
  },
  {
    uid: 'vincent_user',
    name: 'Vincent',
    avatar: '🌿',
    coupleId: 'vincent_alice',
    roomId: 'vincent_alice',
    hashes: getEnvHashes(process.env.VINCENT_HASH)
  },
  {
    uid: 'alice_user',
    name: 'Alice',
    avatar: '🐰',
    coupleId: 'vincent_alice',
    roomId: 'vincent_alice',
    hashes: getEnvHashes(process.env.ALICE_HASH)
  }
];

// In-memory rate limiting against brute force attacks
const loginAttempts = new Map();

function verifySingleHash(plainPasscode, storedHash) {
  if (!storedHash || !plainPasscode) return false;

  // 1. Salted Scrypt format: scrypt:<salt>:<hash>
  if (storedHash.startsWith('scrypt:')) {
    const [, salt, expectedHash] = storedHash.split(':');
    if (!salt || !expectedHash) return false;
    const computedHash = crypto.scryptSync(plainPasscode, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'utf8'), Buffer.from(expectedHash, 'utf8'));
  }

  // 2. Bcrypt format ($2a$, $2b$, $2y$)
  if (storedHash.startsWith('$2')) {
    try {
      const bcrypt = require('bcryptjs');
      return bcrypt.compareSync(plainPasscode, storedHash);
    } catch (e) {
      console.warn('bcryptjs not loaded, skipping bcrypt verification', e);
      return false;
    }
  }

  // 3. Timing-safe comparison for standard hex hashes (e.g. SHA-256)
  if (/^[a-f0-9]{64}$/i.test(storedHash)) {
    const computed = crypto.createHash('sha256').update(plainPasscode).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(storedHash, 'utf8'));
  }

  return false;
}

function verifyHash(plainPasscode, hashOrHashes) {
  if (!hashOrHashes || !plainPasscode) return false;
  const list = Array.isArray(hashOrHashes) ? hashOrHashes : [hashOrHashes];
  return list.some(h => verifySingleHash(plainPasscode, h));
}

/**
 * Serverless API: /verifyPasscode
 * Verifies salted passcode, enforces rate limiting, and issues Firebase Custom Auth Token.
 */
exports.verifyPasscode = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const attempts = loginAttempts.get(clientIp) || { count: 0, resetAt: now + 15 * 60 * 1000 };

  // Rate limiting: 5 failed attempts per 15 minutes
  if (attempts.count >= 5 && now < attempts.resetAt) {
    const waitSec = Math.ceil((attempts.resetAt - now) / 1000);
    return res.status(429).json({
      error: `Too many attempts. Please wait ${waitSec} seconds before retrying.`
    });
  }

  const { passcode } = req.body || {};
  if (!passcode || typeof passcode !== 'string') {
    return res.status(400).json({ error: 'Passcode is required.' });
  }

  // Find matching user with timing-safe comparison
  let matchedUser = null;
  for (const user of SALT_USERS) {
    if (verifyHash(passcode, user.hashes || user.hash)) {
      matchedUser = user;
      break;
    }
  }

  if (!matchedUser) {
    attempts.count++;
    loginAttempts.set(clientIp, attempts);
    return res.status(401).json({ error: 'Incorrect passcode.' });
  }

  // Reset rate limiting on success
  loginAttempts.delete(clientIp);

  try {
    // Generate secure Firebase Custom Auth Token with user claims
    const customToken = await admin.auth().createCustomToken(matchedUser.uid, {
      name: matchedUser.name,
      avatar: matchedUser.avatar,
      isCoupleMember: true
    });

    return res.json({
      success: true,
      token: customToken,
      user: {
        uid: matchedUser.uid,
        name: matchedUser.name,
        avatar: matchedUser.avatar
      }
    });
  } catch (err) {
    console.error('Custom token generation failed:', err);
    return res.status(500).json({ error: 'Internal authentication error.' });
  }
});

/**
 * Serverless API: /secureSync
 * Authenticated server-side sync endpoint for reading & updating couples room.
 */
exports.secureSync = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).send('');

  // 1. Authenticate bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const idToken = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await admin.auth().verifyIdToken(idToken);
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const allowedUids = ['seb_user', 'lynn_user', 'vincent_user', 'alice_user'];
  if (!allowedUids.includes(decodedToken.uid)) {
    return res.status(403).json({ error: 'Forbidden: Access denied' });
  }

  const roomMap = {
    'seb_user': 'shared',
    'lynn_user': 'shared',
    'vincent_user': 'vincent_alice',
    'alice_user': 'vincent_alice'
  };
  const roomId = roomMap[decodedToken.uid] || 'shared';
  const docRef = admin.firestore().collection('couples_rooms').doc(roomId);

  if (req.method === 'GET') {
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.json({ activities: [], trips: [] });
    }
    return res.json(doc.data());
  }

  if (req.method === 'POST') {
    const { activities, trips, deviceId } = req.body || {};

    if (!Array.isArray(activities) || !Array.isArray(trips)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    await docRef.set({
      activities,
      trips,
      lastUpdatedBy: deviceId || decodedToken.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({ success: true, updatedAt: new Date().toISOString() });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
});

function normalizeSeasons(raw) {
  if (!raw) return ['all'];
  const tokens = [];
  if (Array.isArray(raw)) {
    raw.forEach(item => {
      if (typeof item === 'string') {
        tokens.push(...item.split(/[,\s/、，|]+/));
      }
    });
  } else if (typeof raw === 'string') {
    tokens.push(...raw.split(/[,\s/、，|]+/));
  }

  const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
  const matched = new Set();

  tokens.forEach(t => {
    const clean = t.trim().toLowerCase();
    if (!clean) return;
    if (/all|全年|四季|任何|不限/i.test(clean)) {
      matched.add('all');
    } else if (/春|spring|櫻|sakura|花季/i.test(clean)) {
      matched.add('spring');
    } else if (/夏|summer|暑|海灘|beach/i.test(clean)) {
      matched.add('summer');
    } else if (/秋|autumn|fall|紅葉|楓|銀杏/i.test(clean)) {
      matched.add('autumn');
    } else if (/冬|winter|雪|ski|滑雪|溫泉|極光|冰/i.test(clean)) {
      matched.add('winter');
    }
  });

  if (matched.has('all') || matched.size >= 4) {
    return ['all'];
  }

  if (matched.size > 0) {
    return seasonOrder.filter(s => matched.has(s));
  }
  return ['all'];
}

/**
 * Serverless API: /aiGenerate
 * Uses Google Gemini (auto-tier fallback) with structured JSON output for trips & activities.
 */
exports.aiGenerate = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).send('');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { type, query, coupleNames, geminiKey: bodyKey } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query is required.' });
  }

  const couple = (typeof coupleNames === 'string' && coupleNames.trim()) ? coupleNames.trim() : 'Seb and Lynn';
  const geminiKey = (typeof bodyKey === 'string' && bodyKey.trim())
    ? bodyKey.trim().replace(/^["']|["']$/g, '')
    : (process.env.GEMINI_API_KEY || (functions.config().gemini && functions.config().gemini.key));

  if (geminiKey) {
    try {
      const https = require('https');
      let prompt = '';

      if (type === 'trip') {
        const varietyThemes = [
          'Sensory & Atmospheric (tangible weather, fragrances, sounds, morning or twilight light)',
          'Culinary & Hidden Spots (local delicacies, cozy cafes, intimate eateries, street food)',
          'Romantic Micro-Moments (sweet unscripted memories, candid couple warmth, sharing warmth)',
          'Slow Living Retreat (unhurried rhythms, tranquil viewpoints, peaceful relaxation, quiet walks)',
          'Epic Landscapes & Scenic Wonder (dramatic vistas, golden hour, nature colors, panoramic awe)',
          'Cultural & Vintage Nostalgia (historic alleys, local crafts, timeless architecture, retro charm)'
        ];
        const randomFocus = varietyThemes[Math.floor(Math.random() * varietyThemes.length)];

        prompt = `You are an expert romantic travel planner and geographical curator for ${couple}, a loving couple from Taiwan.
Analyze the destination "${query}" and return ONLY a valid JSON object matching this exact schema:
{
  "name": "Bespoke, poetic trip title in Traditional Chinese with relevant emojis (HIGH CREATIVE LEEWAY - NEVER use generic endings like '浪漫之旅' or '[Place]之旅')",
  "locationName": "City/Region, Country (in English with flag emoji if appropriate)",
  "lat": 35.0116,
  "lng": 135.7681,
  "minDays": 5,
  "maxDays": 7,
  "budget": "$$$",
  "costEstimate": "~NT$35,000 - 55,000 /人",
  "seasons": ["spring", "summer", "autumn"],
  "tags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "description": "2 to 3 vivid, deeply evocative sentences in Traditional Chinese (80-140 chars) tailored uniquely to ${query}. Capture tangible local sights, authentic scents/flavors, and genuine shared couples micro-moments. NEVER use generic clichés."
}

REALISTIC CALIBRATION GUIDELINES (Departing from Taiwan):
1. DURATION (minDays & maxDays):
   - Taiwan Domestic / Islands (e.g. 台南, 墾丁, 宜蘭, 澎湖, 阿里山): 2 to 3 days (weekend / long weekend).
   - Short-Haul East & Southeast Asia (e.g. 日本, 韓國, 泰國, 越南, 沖繩, 香港, 宿霧): 4 to 7 days (e.g. Tokyo 5-7 days, Bangkok 4-6 days, Okinawa 4-5 days).
   - Long-Haul Americas, Europe, Africa, Oceania (e.g. 巴黎, 瑞士, 冰島, 紐約, 倫敦, 紐西蘭): 8 to 14 days minimum! Long-haul flights take 12-16 hours each way; NEVER recommend 4 or 5 days for Europe or the Americas!
   - Polar & Extreme Expeditions (e.g. 北極, 南極): 10 to 18 days.
2. BUDGET & COST ESTIMATE (Full trip flight + stay per person from Taiwan in NT$):
   - "$" (<NT$10,000 /人): Taiwan domestic getaways.
   - "$$" (NT$15,000 - 30,000 /人): Budget Southeast Asia, short Okinawa/HK trips.
   - "$$$" (NT$35,000 - 65,000 /人): Mainland Japan (Tokyo/Kyoto/Hokkaido), Korea, luxury Asian resorts.
   - "$$$$" (>NT$80,000 /人): Europe, Americas, Iceland aurora, Switzerland alpine, Nordic, Polar.
3. SEASONS (Best Time of Year - LENIENT & INCLUSIVE):
   - Return an array of lowercase strings from: ["spring", "summer", "autumn", "winter"] or ["all"].
   - BE LENIENT & GENEROUS: Couples travel throughout the year! Feel free to include 1, 2, 3, or all 4 seasons (or ["all"]) whenever the destination is pleasant, romantic, or has seasonal charms to offer.
   - Guidelines:
     * Multi-Season Versatility: For cities, cultural capitals, and diverse regions (e.g. Paris, Tokyo, Kyoto, London, Seoul, New York, Rome, Barcelona, Hokkaido), include all seasons that are enjoyable—e.g., ["spring", "summer", "autumn"], ["spring", "autumn", "winter"], or ["spring", "autumn"].
     * Mild, Tropical & Year-Round Getaways: For places with mild weather, tropical warmth, indoor romance, or year-round charms (e.g. Taiwan domestic getaways, Tainan, Taipei, Kenting, Penghu, Hawaii, Bali, Bangkok, Da Nang, Singapore, island escapes), return ["all"] or multiple comfortable seasons (e.g. ["spring", "summer", "autumn"] or ["all"]).
     * Seasonal Highlights:
       - 🌸 ["spring"]: Cherry blossoms, floral blooms, romantic canal walks, crisp fresh air.
       - ☀️ ["summer"]: Beaches, island road trips, ocean sunsets, water sports, alpine hiking, summer festivals.
       - 🍁 ["autumn"]: Red foliage, golden ginkgo, wine country, comfortable dry breezes.
       - ❄️ ["winter"]: Snowscapes, powder skiing, cozy onsens/hot springs, winter illuminations, aurora.
     * Rule of Thumb: Only restrict to a single season if the destination is strictly seasonal (e.g. high-winter ski only, or polar sea-ice expedition). Otherwise, recommend all relevant seasons so ${couple} have maximum flexibility!
4. GEOGRAPHICAL DISAMBIGUATION:
   - '北極' / 'North Pole' / 'Arctic' is the High Arctic Ocean (lat: 85.0, lng: 0.0, Region: 'Arctic Ocean / North Pole ❄️', budget: '$$$$', costEstimate: '~NT$280,000 - 550,000 /人', minDays: 10, maxDays: 16, seasons: ['winter', 'summer']). NEVER confuse with Beiji Town in China!
   - '南極' / 'South Pole' / 'Antarctica' is Antarctica (lat: -82.0, lng: 0.0, Region: 'Antarctica 🇦🇶', budget: '$$$$', costEstimate: '~NT$320,000 - 620,000 /人', minDays: 12, maxDays: 18, seasons: ['summer']).
5. Coordinates must be accurate latitude (-85 to 85) and longitude (-180 to 180) for Leaflet maps.
6. DESCRIPTION VARIETY & VIVIDNESS GUIDELINES:
   - Stylistic angle for this generation: ${randomFocus}.
   - Ground the prose in specific, recognizable landmarks, sensory scents, foods, soundscapes, or visual details unique to "${query}".
   - Vary the sentence openings and narrative cadence: do NOT repeatedly start with "漫步在..." or "在這裡，你們可以...".
   - BANNED CLICHÉS: NEVER use formulaic phrases like "漫步在充滿浪漫氛圍的街道", "留下難忘的回憶", "享受兩人專屬的浪漫世界", "是情侶旅遊的絕佳選擇", "沉浸在滿滿的幸福中".
   - Make it feel like an authentic, tender, visually captivating personal travel memoir written specifically for this couple.`;
      } else {
        prompt = `You are an imaginative romantic date activity assistant for ${couple} from Taiwan.
Analyze the date idea "${query}" and return ONLY a valid JSON object matching this exact schema:
{
  "title": "Charming, polished, and evocative Traditional Chinese date title (HIGH CREATIVE LEEWAY - e.g. '陽明山景觀露台浪漫看夜景與熱飲 🌃', '手作烘焙工作坊：兩人專屬甜點烘焙時光 🍰')",
  "occasion": "short",
  "budget": "$$",
  "environment": "indoor"
}
occasion must be one of: "short" (1-3hr date), "dateNight" (evening date), "wholeDay" (full day trip).
budget must be one of: "$" (<NT$300), "$$" (NT$300-1000), "$$$" (NT$1000-3000), "$$$$" (>NT$3000).
environment must be one of: "indoor", "outdoor", "any".`;
      }

      const postData = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.85
        }
      });

      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-flash',
        'gemini-2.5-pro',
        'gemini-1.5-pro'
      ];
      for (const model of candidateModels) {
        try {
          const geminiResp = await new Promise((resolve, reject) => {
            const gReq = https.request({
              hostname: 'generativelanguage.googleapis.com',
              path: `/v1beta/models/${model}:generateContent?key=${geminiKey}`,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
              }
            }, (gRes) => {
              let data = '';
              gRes.on('data', chunk => data += chunk);
              gRes.on('end', () => resolve({ statusCode: gRes.statusCode, data }));
            });
            gReq.on('error', reject);
            gReq.write(postData);
            gReq.end();
          });

          if (geminiResp.statusCode === 200) {
            const parsed = JSON.parse(geminiResp.data);
            const text = parsed.candidates && parsed.candidates[0] && parsed.candidates[0].content && parsed.candidates[0].content.parts && parsed.candidates[0].content.parts[0].text;
            if (text) {
              const spec = JSON.parse(text);
              if (type === 'trip' && spec.seasons) {
                spec.seasons = normalizeSeasons(spec.seasons);
              }
              return res.json({ success: true, spec, source: `Google Gemini (${model})` });
            }
          }
        } catch (mErr) {
          console.warn(`Gemini model ${model} error:`, mErr);
        }
      }
    } catch (err) {
      console.warn('Gemini serverless generation notice:', err);
    }
  }

  return res.status(503).json({ success: false, error: 'Gemini AI service is currently unavailable.' });
});

