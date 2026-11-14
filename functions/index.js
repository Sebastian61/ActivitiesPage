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
    roomId: 'seb_lynn',
    hashes: getEnvHashes(process.env.SEB_HASH)
  },
  {
    uid: 'lynn_user',
    name: 'Lynn',
    avatar: '🌸',
    coupleId: 'seb_lynn',
    roomId: 'seb_lynn',
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
    'seb_user': 'seb_lynn',
    'lynn_user': 'seb_lynn',
    'vincent_user': 'vincent_alice',
    'alice_user': 'vincent_alice'
  };
  const roomId = roomMap[decodedToken.uid] || 'seb_lynn';
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

  const { type, query, coupleNames, geminiKey: bodyKey, destinationName } = req.body || {};
  const activeQuery = (typeof query === 'string' && query.trim()) || (typeof destinationName === 'string' && destinationName.trim()) || '';
  if (!activeQuery) {
    return res.status(400).json({ error: 'Query or destinationName is required.' });
  }

  const couple = (typeof coupleNames === 'string' && coupleNames.trim()) ? coupleNames.trim() : 'Seb and Lynn';
  const geminiKey = (typeof bodyKey === 'string' && bodyKey.trim())
    ? bodyKey.trim().replace(/^["']|["']$/g, '')
    : (process.env.GEMINI_API_KEY || (functions.config().gemini && functions.config().gemini.key));

  if (geminiKey) {
    try {
      const https = require('https');
      if (type === 'itinerary') {
        const { mode, targetDays, pace, locationName, seasons, destinationName } = req.body || {};
        const itinMode = ['daily', 'area', 'vibe', 'foodie', 'highlights'].includes(mode) ? mode : 'daily';
        const daysCount = parseInt(targetDays, 10) || 5;
        const paceStr = pace || 'relaxed';
        const dest = destinationName || query;
        const loc = locationName || '';
        const seasonInfo = Array.isArray(seasons) ? seasons.join(', ') : 'all';

        if (itinMode === 'area') {
          prompt = `You are an elite romantic travel designer for ${couple}, a loving couple departing from Taiwan.
Create a flexible, area-by-area exploration guide for "${dest}" (${loc}).
Do NOT organize by Day 1 / Day 2—group recommended sights, cozy cafes, local restaurants, and scenic walks by neighborhood / district / area.
Seasons: ${seasonInfo}

Return ONLY a valid JSON object matching this exact schema:
{
  "mode": "area",
  "summary": "1-2 inspiring sentences in Traditional Chinese capturing the neighborhood character of ${dest}.",
  "areas": [
    {
      "name": "Area / District Name in Traditional Chinese with emoji",
      "vibe": "Short atmospheric tagline in Traditional Chinese",
      "bestTime": "Best time of day to visit in Traditional Chinese",
      "gettingAround": "Practical transit & walking tip in Traditional Chinese",
      "places": [
        { "name": "Specific Place Name", "category": "景點 | 咖啡廳 | 美食 | 散步 | 購物 | 體驗", "note": "Concise 1-sentence reason to visit in Traditional Chinese" }
      ],
      "coupleHighlight": "A tender couple micro-moment in this area in Traditional Chinese"
    }
  ],
  "mustTryFoods": ["Specific dish 1", "Specific dish 2", "Specific dish 3", "Specific dish 4"],
  "tips": "2-3 practical tips for Taiwanese travelers in Traditional Chinese."
}
CRITICAL RULES: Provide 4 to 6 distinct areas, each with 3 to 5 real places. Output all prose in Traditional Chinese (繁體中文).`;
        } else if (itinMode === 'vibe') {
          prompt = `You are an elite romantic travel designer for ${couple}, a loving couple departing from Taiwan.
Curate a mood-and-weather-based travel guide for "${dest}" (${loc}) grouped by VIBE rather than by day.
Seasons: ${seasonInfo}

Return ONLY a valid JSON object matching this exact schema:
{
  "mode": "vibe",
  "summary": "1-2 inspiring sentences in Traditional Chinese about exploring ${dest} by mood and weather.",
  "groups": [
    {
      "title": "Mood / Vibe Category in Traditional Chinese with emoji (cover Golden Hour & Scenic Views, Cozy Cafés, Culture & Markets, Romantic Evenings, and Rainy-Day Indoor Hideaways)",
      "subtitle": "When to pick this vibe in Traditional Chinese",
      "items": [
        { "name": "Specific Place or Activity", "area": "District tag", "note": "Specific 1-sentence highlight in Traditional Chinese" }
      ]
    }
  ],
  "mustTryFoods": ["Specific dish 1", "Specific dish 2", "Specific dish 3", "Specific dish 4"],
  "tips": "2-3 practical mood/weather planning tips in Traditional Chinese."
}
CRITICAL RULES: Provide 4 to 5 mood groups with 3 to 4 real items each. Output all prose in Traditional Chinese (繁體中文).`;
        } else if (itinMode === 'foodie') {
          prompt = `You are a romantic culinary & cafe travel curator for ${couple}, a loving couple departing from Taiwan.
Create a dedicated Foodie & Café Trail for "${dest}" (${loc}) organized by culinary occasion.
Seasons: ${seasonInfo}

Return ONLY a valid JSON object matching this exact schema:
{
  "mode": "foodie",
  "summary": "1-2 appetizing sentences in Traditional Chinese capturing the food & cafe soul of ${dest}.",
  "groups": [
    {
      "title": "Culinary Category in Traditional Chinese with emoji (Morning Coffee & Bakeries, Iconic Local Eats, Street Food & Markets, Desserts & Souvenirs, Date-Night Dining & Bars)",
      "subtitle": "Occasion note in Traditional Chinese",
      "items": [
        { "name": "Specific Spot Name", "area": "District tag", "mustOrder": "Signature item to order", "note": "1-sentence highlight or reservation tip in Traditional Chinese" }
      ]
    }
  ],
  "mustTryFoods": ["Specific dish 1", "Specific dish 2", "Specific dish 3", "Specific dish 4", "Specific dish 5"],
  "tips": "2-3 practical dining tips in Traditional Chinese."
}
CRITICAL RULES: Provide 4 to 5 culinary groups with 3 to 4 real spots each. Output all prose in Traditional Chinese (繁體中文).`;
        } else if (itinMode === 'highlights') {
          prompt = `You are an insider romantic travel strategist for ${couple}, a loving couple departing from Taiwan.
Create a high-signal "Must-Dos & Hidden Gems" cheat sheet for "${dest}" (${loc}).
Seasons: ${seasonInfo}

Return ONLY a valid JSON object matching this exact schema:
{
  "mode": "highlights",
  "summary": "1-2 sharp sentences in Traditional Chinese summarizing what makes ${dest} unforgettable.",
  "groups": [
    {
      "title": "Section Title in Traditional Chinese with emoji (provide 4 sections: 🏆 不可錯過的經典必去, 💎 避開人潮的私房秘境, 💖 情侶專屬浪漫儀式感, 🚫 聰明避雷與替代方案)",
      "subtitle": "How to use this section in Traditional Chinese",
      "items": [
        { "name": "Specific Landmark, Secret Spot, Couple Ritual, or Trap-to-Swap", "area": "District or quick tag", "note": "Actionable 1-2 sentence insider advice in Traditional Chinese" }
      ]
    }
  ],
  "mustTryFoods": ["Specific dish 1", "Specific dish 2", "Specific dish 3", "Specific dish 4"],
  "tips": "2-3 high-value logistics tips in Traditional Chinese."
}
CRITICAL RULES: Provide 4 sections with 3 to 4 specific items each. Output all prose in Traditional Chinese (繁體中文).`;
        } else {
          prompt = `You are an elite romantic travel designer creating an inspiring, stress-free day-by-day travel itinerary starting point for ${couple}, a loving couple departing from Taiwan.

Destination: "${dest}" (${loc})
Duration: ${daysCount} Days
Pace: ${paceStr} (Prioritize unhurried rhythms, authentic local eateries, and scenic romance over tourist traps)
Seasons: ${seasonInfo}

Return ONLY a valid JSON object matching this exact schema:
{
  "mode": "daily",
  "summary": "1 to 2 evocative sentences in Traditional Chinese capturing the romantic essence and mood of this journey",
  "pace": "${paceStr}",
  "totalDays": ${daysCount},
  "bestTimeToVisit": "Best months / season details in Traditional Chinese",
  "days": [
    {
      "day": 1,
      "title": "Evocative Day Title in Traditional Chinese (with relevant emoji)",
      "morning": "Morning activities & transportation (accounting for Taiwan departure flight/arrival on Day 1)",
      "afternoon": "Afternoon exploration & cozy cafe stop",
      "evening": "Dinner recommendation & romantic evening experience",
      "coupleHighlight": "One specific, tender couple micro-moment"
    }
  ],
  "foodMustTry": ["3 to 5 must-eat authentic local dishes, snacks or drinks"],
  "packingTips": ["3 to 4 practical, destination-specific packing reminders"]
}

CRITICAL RULES:
1. Provide exactly ${daysCount} days in the "days" array (Day 1 to Day ${daysCount}).
2. Day 1 Logistics: Reflect realistic Taiwan departure flight times (e.g. 3-4 hr flight for Japan/Korea; 12-16 hr flight for Europe/Americas where arrival is late afternoon/night).
3. Pacing: Never cram more than 2-3 main scenic areas or neighborhood strolls per day so the couple can truly relax.
4. Language: Output all values in Traditional Chinese (繁體中文).`;
        }
      } else if (type === 'trip') {
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
        'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
        'gemini-3.5-flash',
        'gemini-flash-lite-latest',
        'gemini-flash-latest',
        'gemini-3.7-flash',
        'gemini-pro-latest'
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
              } else if (type === 'itinerary' && spec) {
                const reqMode = (req.body && req.body.mode) || spec.mode || 'daily';
                spec.mode = ['daily', 'area', 'vibe', 'foodie', 'highlights'].includes(reqMode) ? reqMode : 'daily';
                spec.mustTryFoods = spec.mustTryFoods || spec.foodMustTry || [];
                spec.tips = spec.tips || (Array.isArray(spec.packingTips) ? spec.packingTips.join('；') : spec.packingTips) || '';
                if (spec.mode === 'daily') {
                  spec.targetDays = spec.targetDays || spec.totalDays || (spec.days && spec.days.length);
                  if (Array.isArray(spec.days)) {
                    spec.days.forEach((d, idx) => {
                      d.day = d.day || (idx + 1);
                      d.theme = d.theme || d.title || '';
                    });
                  }
                } else if (spec.mode === 'area' && Array.isArray(spec.areas)) {
                  spec.areas.forEach(a => {
                    a.name = a.name || a.area || a.title || '';
                    a.places = Array.isArray(a.places) ? a.places : (Array.isArray(a.items) ? a.items : []);
                  });
                } else if (Array.isArray(spec.groups)) {
                  spec.groups.forEach(g => {
                    g.title = g.title || g.name || '';
                    g.items = Array.isArray(g.items) ? g.items : (Array.isArray(g.places) ? g.places : []);
                  });
                }
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

