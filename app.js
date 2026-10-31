/**
 * Date & Trip Planner — Application Logic
 * Date Activity Randomizer & Multi-Day Trip Planning Decider
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Audio Synthesizer (Web Audio API) - Zero External Assets
  // =========================================================================
  class SoundFX {
    constructor() {
      const stored = localStorage.getItem('app_sound_enabled') ?? localStorage.getItem('sync_sway_sound');
      this.enabled = stored !== '0';
      this.ctx = null;
    }

    init() {
      try {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      } catch (e) {}
    }

    // Helper: generate procedural white noise buffer for whooshes, card snaps, and paper rustles
    createNoiseBuffer(duration = 0.25) {
      if (!this.ctx) return null;
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * duration);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        return buffer;
      } catch (e) {
        return null;
      }
    }

    // 1. Soft UI Tap (Filter pills, interactive chips, toggles)
    tap(pitch = 1) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const startFreq = Math.max(100, Math.min(1800, 520 * pitch));
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(startFreq * 0.45, t + 0.035);
        gain.gain.setValueAtTime(0.045, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.035);
      } catch (e) {}
    }

    // 2. Bubble Pop (Clicking badges, counter chips with natural random variation)
    pop(customFreq = null) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const baseFreq = customFreq || (340 + Math.random() * 160);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.1, t + 0.045);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.045);
      } catch (e) {}
    }

    // 3. Shimmer / Magic Sparkle (AI generation success, atmosphere theme changes)
    sparkle() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Pentatonic magic arpeggio: E6, G#6, B6, E7, G#7
        const freqs = [1318.5, 1661.2, 1975.5, 2637.0, 3322.4];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = t + idx * 0.032;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.04, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0005, startTime + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.28);
        });
      } catch (e) {}
    }

    // 4. Aerodynamic Whoosh (Tab switches, modal slide-ins, map flight)
    whoosh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const duration = 0.22;
        const noise = this.createNoiseBuffer(duration);
        if (noise) {
          const source = this.ctx.createBufferSource();
          source.buffer = noise;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(260, t);
          filter.frequency.exponentialRampToValueAtTime(1400, t + duration * 0.45);
          filter.frequency.exponentialRampToValueAtTime(320, t + duration);
          filter.Q.value = 2.5;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0.005, t);
          gain.gain.linearRampToValueAtTime(0.06, t + duration * 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

          source.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);
          source.start(t);
          source.stop(t + duration);
        }
      } catch (e) {}
    }

    // 5. Paper Card Flip (Card randomizer, eliminator veto)
    cardFlip() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Low tactile card thud
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(65, t + 0.05);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);

        // Paper flutter snap
        const noise = this.createNoiseBuffer(0.04);
        if (noise) {
          const source = this.ctx.createBufferSource();
          source.buffer = noise;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1200, t);
          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.025, t);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
          source.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);
          source.start(t);
          source.stop(t + 0.04);
        }
      } catch (e) {}
    }

    // 6. Slot Machine Wheel Click (Decelerating clicks during spinning)
    slotTick(speedRatio = 1) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        const startFreq = 650 + (1 - Math.min(1, speedRatio)) * 300;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.022);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.022);
      } catch (e) {}
    }

    // 7. Stamp / Success Affirmation (Checking date completed or destination visited)
    stamp() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Tactile body thud
        const thud = this.ctx.createOscillator();
        const thudGain = this.ctx.createGain();
        thud.type = 'sine';
        thud.frequency.setValueAtTime(180, t);
        thud.frequency.exponentialRampToValueAtTime(55, t + 0.06);
        thudGain.gain.setValueAtTime(0.07, t);
        thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        thud.connect(thudGain);
        thudGain.connect(this.ctx.destination);
        thud.start(t);
        thud.stop(t + 0.06);

        // Crystal confirm bell (C6 & G6)
        [1046.5, 1567.98].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + 0.02);
          gain.gain.setValueAtTime(0.045, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.02 + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + 0.02);
          osc.stop(t + 0.02 + 0.35);
        });
      } catch (e) {}
    }

    // 8. Soft Undo / Uncheck
    uncheck() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.06);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
      } catch (e) {}
    }

    // 9. Celebratory Chime / Major 9th Arpeggio (Winner chosen, spot saved, confetti)
    chime() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Lush Major 9th flourish: C5, E5, G5, B5, D6
        const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = t + idx * 0.065;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.07, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.45);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.45);
        });
      } catch (e) {}
    }

    // 10. Sonar / Radar Ping (Map radar scanner & live cloud partner sync)
    radarPing() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Fundamental C6
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1046.5, t);
        gain1.gain.setValueAtTime(0.065, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.4);

        // Resonant harmonic overtone
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2093.0, t);
        gain2.gain.setValueAtTime(0.02, t);
        gain2.gain.exponentialRampToValueAtTime(0.0005, t + 0.25);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(t);
        osc2.stop(t + 0.25);
      } catch (e) {}
    }

    // 11. Mechanical Lock Latch (Locking the space)
    lockLatch() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // First micro-click
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(750, t);
        osc1.frequency.exponentialRampToValueAtTime(300, t + 0.015);
        gain1.gain.setValueAtTime(0.05, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.015);
        osc1.connect(gain1);
        gain1.connect(this.ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.015);

        // Second resonant latch click
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(450, t + 0.035);
        osc2.frequency.exponentialRampToValueAtTime(180, t + 0.075);
        gain2.gain.setValueAtTime(0.06, t + 0.035);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(t + 0.035);
        osc2.stop(t + 0.075);
      } catch (e) {}
    }

    // 12. Warm Welcome Harmony (Passcode verified / login unlock)
    unlockHarmony() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        // Warm romantic Dmaj9 chord: D4, A4, C#5, F#5, A5
        const chord = [293.66, 440.0, 554.37, 739.99, 880.0];
        chord.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = t + idx * 0.05;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.055, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0006, startTime + 0.55);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.55);
        });
      } catch (e) {}
    }

    // 13. Gentle Error Nudge (Wrong passcode, invalid range input)
    errorNudge() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        [0, 0.065].forEach((offset) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(220, t + offset);
          gain.gain.setValueAtTime(0.045, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.05);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + offset);
          osc.stop(t + offset + 0.05);
        });
      } catch (e) {}
    }

    // 14. Trash / Deletion Sweep (Item deleted)
    trash() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.09);
        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.09);
      } catch (e) {}
    }

    // 15. Dice Roll / Multi-Tumble Rattle (Card spin initiation)
    diceRoll() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        [0, 0.045, 0.085, 0.12].forEach((offset, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          const freq = 440 + Math.random() * 260 - idx * 40;
          osc.frequency.setValueAtTime(freq, t + offset);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.4, t + offset + 0.025);
          gain.gain.setValueAtTime(0.04 - idx * 0.006, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.025);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + offset);
          osc.stop(t + offset + 0.025);
        });
      } catch (e) {}
    }

    // 16. Pure High Bell Shimmer / Coin Toss Ring
    coinToss() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1864.66, t);
        osc.frequency.exponentialRampToValueAtTime(2349.32, t + 0.08);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      } catch (e) {}
    }

    // Legacy alias
    tick() {
      this.tap();
    }
  }

  const sfx = new SoundFX();

  // HTML Entity Sanitizer to prevent XSS (S1)
  function escapeHTML(str) {
    if (typeof str !== 'string') return str == null ? '' : String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =========================================================================
  // 2. Confetti Particle System
  // =========================================================================
  class Confetti {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.particles = [];
      this.animationFrame = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    burst(x = window.innerWidth / 2, y = window.innerHeight / 2) {
      const colors = ['#22d3ee', '#fb7185', '#34d399', '#facc15', '#a855f7'];
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 4;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          rotation: Math.random() * 360,
          rotSpeed: Math.random() * 10 - 5
        });
      }
      if (!this.animationFrame) {
        this.loop();
      }
    }

    loop() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // gravity
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      }

      if (this.particles.length > 0) {
        this.animationFrame = requestAnimationFrame(() => this.loop());
      } else {
        this.animationFrame = null;
      }
    }
  }

  const confetti = new Confetti('confettiCanvas');

  // =========================================================================
  // Toast Notification System
  // =========================================================================
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 260);
    }, duration);
  }

  // =========================================================================
  // Theme & Atmosphere Style Engine (5 Palettes)
  // =========================================================================
  const THEMES = [
    { id: 'obsidian', name: 'Midnight Obsidian', desc: 'Cyber Neon • Cyan & Rose', icon: '🌌' },
    { id: 'sakura', name: 'Sakura Sunset', desc: 'Romantic Dusk • Pink & Gold', icon: '🌸' },
    { id: 'ocean', name: 'Bioluminescent Ocean', desc: 'Deep Sea • Azure & Seafoam', icon: '🌊' },
    { id: 'amber', name: 'Warm Amber Coffee', desc: 'Cozy Vintage • Honey & Terracotta', icon: '☕' },
    { id: 'lavender', name: 'Moonlit Lavender', desc: 'Velvet Dream • Violet & Starlight', icon: '🔮' }
  ];

  const themeManager = {
    current: 'obsidian',

    init() {
      const themeKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.THEME) ? STORAGE_KEYS.THEME : 'app_theme';
      const stored = localStorage.getItem(themeKey) || localStorage.getItem('app_theme') || localStorage.getItem('sync_sway_theme');
      if (stored && THEMES.some(t => t.id === stored)) {
        this.applyTheme(stored, false);
      } else {
        const defaultTheme = (state.currentCouple && state.currentCouple.theme) ? state.currentCouple.theme : 'obsidian';
        this.applyTheme(defaultTheme, false);
      }
    },

    applyTheme(themeId, notify = true) {
      this.current = themeId;
      document.documentElement.setAttribute('data-theme', themeId);
      const themeKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.THEME) ? STORAGE_KEYS.THEME : 'app_theme';
      localStorage.setItem(themeKey, themeId);

      document.querySelectorAll('.theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === themeId);
      });

      if (typeof updateDualDaysSliderUI === 'function') {
        updateDualDaysSliderUI();
      }

      if (notify) {
        const theme = THEMES.find(t => t.id === themeId);
        showToast(`${theme.icon} Atmosphere switched to <strong>${theme.name}</strong>!`);
        sfx.sparkle();
      }
    },

    openModal() {
      const modal = document.getElementById('themeModal');
      if (modal) {
        document.querySelectorAll('.theme-card').forEach(card => {
          card.classList.toggle('active', card.dataset.theme === this.current);
        });
        modal.style.display = 'flex';
        sfx.whoosh();
      }
    },

    closeModal() {
      const modal = document.getElementById('themeModal');
      if (modal) {
        modal.style.display = 'none';
        sfx.tap();
      }
    }
  };

  // =========================================================================
  // Passcode Gate & Cryptographic Auth (SHA-256)
  // =========================================================================
  // =========================================================================
  // Couple Profiles & Cryptographic Cloud Auth (Firebase Auth)
  // =========================================================================
  const COUPLE_PROFILES = {
    seb_lynn: {
      id: 'seb_lynn',
      names: 'Seb & Lynn',
      roomId: 'shared',
      storagePrefix: 'app_',
      theme: 'cosmic',
      icon: '🪐'
    },
    vincent_alice: {
      id: 'vincent_alice',
      names: 'Vincent & Alice',
      roomId: 'vincent_alice',
      storagePrefix: 'va_',
      theme: 'emerald',
      icon: '🌿'
    }
  };

  let activeCoupleProfile = COUPLE_PROFILES.seb_lynn;

  function getCoupleNames() {
    return (state.currentCouple && state.currentCouple.names)
      ? state.currentCouple.names
      : (activeCoupleProfile ? activeCoupleProfile.names : 'Seb & Lynn');
  }

  function setCoupleProfile(coupleId) {
    activeCoupleProfile = COUPLE_PROFILES[coupleId] || COUPLE_PROFILES.seb_lynn;
    state.currentCouple = activeCoupleProfile;
    updateStorageKeys();
  }

  let STORAGE_KEYS = {
    ACTIVITIES: 'app_activities_v4',
    TRIPS: 'app_trips_v4',
    DELETED_TRIPS: 'app_deleted_trips_v4',
    DELETED_ACTIVITIES: 'app_deleted_activities_v4',
    EMERGENCY_BACKUP: 'app_emergency_backup_v4',
    GEMINI_KEY: 'app_gemini_api_key',
    GEMINI_MODEL: 'app_gemini_active_model',
    USAGE_STATS: 'app_gemini_usage_stats',
    RPD_LIMIT: 'app_gemini_custom_rpd_limit',
    DETECTED_MODELS: 'app_gemini_detected_models',
    MODELS_META: 'app_gemini_models_meta',
    THEME: 'app_theme'
  };

  function updateStorageKeys() {
    const prefix = (state.currentCouple || activeCoupleProfile || COUPLE_PROFILES.seb_lynn).storagePrefix;
    STORAGE_KEYS = {
      ACTIVITIES: `${prefix}activities_v4`,
      TRIPS: `${prefix}trips_v4`,
      DELETED_TRIPS: `${prefix}deleted_trips_v4`,
      DELETED_ACTIVITIES: `${prefix}deleted_activities_v4`,
      EMERGENCY_BACKUP: `${prefix}emergency_backup_v4`,
      GEMINI_KEY: `${prefix}gemini_api_key`,
      GEMINI_MODEL: `${prefix}gemini_active_model`,
      USAGE_STATS: `${prefix}gemini_usage_stats`,
      RPD_LIMIT: `${prefix}gemini_custom_rpd_limit`,
      DETECTED_MODELS: `${prefix}gemini_detected_models`,
      MODELS_META: `${prefix}gemini_models_meta`,
      THEME: `${prefix}theme`
    };
  }

  const AUTH_ACCOUNTS = [
    {
      id: 'seb',
      email: 'seb@syncandsway.couple',
      name: 'Seb',
      avatar: '✨',
      coupleId: 'seb_lynn'
    },
    {
      id: 'lynn',
      email: 'lynn@syncandsway.couple',
      name: 'Lynn',
      avatar: '🌸',
      coupleId: 'seb_lynn'
    },
    {
      id: 'vincent',
      email: 'vincent@syncandsway.couple',
      name: 'Vincent',
      avatar: '🌿',
      coupleId: 'vincent_alice'
    },
    {
      id: 'alice',
      email: 'alice@syncandsway.couple',
      name: 'Alice',
      avatar: '🐰',
      coupleId: 'vincent_alice'
    }
  ];

  let authListenerAttached = false;

  function migrateLegacyDataIfNeeded() {
    try {
      const v4Trips = localStorage.getItem('app_trips_v4');
      if (!v4Trips) {
        const legacyTrips = localStorage.getItem('sync_sway_trips_v4') || localStorage.getItem('sync_trips_v3');
        if (legacyTrips) {
          const parsed = JSON.parse(legacyTrips);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem('app_trips_v4', JSON.stringify(parsed));
          }
        }
      }
      const v4Acts = localStorage.getItem('app_activities_v4');
      if (!v4Acts) {
        const legacyActs = localStorage.getItem('sync_sway_activities_v4') || localStorage.getItem('sync_activities_v3');
        if (legacyActs) {
          const parsed = JSON.parse(legacyActs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localStorage.setItem('app_activities_v4', JSON.stringify(parsed));
          }
        }
      }
      const v4DelTrips = localStorage.getItem('app_deleted_trips_v4');
      if (!v4DelTrips) {
        const legacyDelTrips = localStorage.getItem('sync_sway_deleted_trips_v4');
        if (legacyDelTrips) localStorage.setItem('app_deleted_trips_v4', legacyDelTrips);
      }
      const v4DelActs = localStorage.getItem('app_deleted_activities_v4');
      if (!v4DelActs) {
        const legacyDelActs = localStorage.getItem('sync_sway_deleted_activities_v4');
        if (legacyDelActs) localStorage.setItem('app_deleted_activities_v4', legacyDelActs);
      }
    } catch (e) {
      console.warn('Migration notice:', e);
    }
  }

  function purgeLegacyLocalStorage() {
    migrateLegacyDataIfNeeded();
    const legacyKeysToPurge = [
      'sync_activities_v3',
      'sync_trips_v3',
      'sync_emergency_backup',
      'sync_v3_migrated',
      'sync_auth_token',
      'sync_auth_user'
    ];
    legacyKeysToPurge.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch (e) {}
    });
  }

  function ensureFirebase() {
    if (typeof firebase === 'undefined') return null;
    if (!firebase.apps || !firebase.apps.length) {
      if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.projectId) {
        try {
          return firebase.initializeApp(window.FIREBASE_CONFIG);
        } catch (e) {
          console.warn('ensureFirebase notice:', e);
        }
      }
    }
    return (firebase.apps && firebase.apps.length) ? firebase.app() : null;
  }

  async function attemptAuth(password, targetUserId, remember = false) {
    ensureFirebase();
    if (typeof firebase === 'undefined' || !firebase.auth) {
      throw new Error('Firebase Auth SDK is not available.');
    }

    try {
      const persistence = remember
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;
      await firebase.auth().setPersistence(persistence);
    } catch (persistErr) {
      console.warn('Firebase setPersistence notice:', persistErr);
    }

    const trimmed = (password || '').trim();
    if (!trimmed) return null;

    // Find target account(s)
    let candidateAccounts = [];
    if (targetUserId) {
      const specific = AUTH_ACCOUNTS.find(a => a.id === targetUserId);
      if (specific) candidateAccounts = [specific];
    }
    if (!candidateAccounts.length) {
      const selectedCoupleId = localStorage.getItem('active_couple_space') || 'seb_lynn';
      candidateAccounts = AUTH_ACCOUNTS.filter(a => a.coupleId === selectedCoupleId);
    }

    // Direct Firebase Authentication using the user's typed password
    for (const account of candidateAccounts) {
      const email = account.email;
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, trimmed);
        return { account, user: userCredential.user };
      } catch (err) {
        // If account does not exist in Firebase yet (e.g. initial setup for Vincent or Alice), auto-create
        // Modern Firebase returns 'auth/invalid-credential' for non-existent users when enumeration protection is active
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          if (trimmed.length < 6) {
            const weakErr = new Error('Password must be at least 6 characters.');
            weakErr.code = 'auth/weak-password';
            throw weakErr;
          }
          try {
            const newCredential = await firebase.auth().createUserWithEmailAndPassword(email, trimmed);
            return { account, user: newCredential.user };
          } catch (createErr) {
            if (createErr.code === 'auth/email-already-in-use') {
              // Account already exists with a different password -> incorrect password
              continue;
            }
            if (createErr.code === 'auth/weak-password') {
              throw createErr;
            }
            console.warn('createUser notice:', createErr);
          }
        }
        if (err.code === 'auth/configuration-not-found') {
          console.error('Firebase Auth is not enabled in Firebase Console.');
          throw new Error('AUTH_CONFIG_NOT_FOUND');
        }
        if (err.code === 'auth/weak-password') {
          throw err;
        }
      }
    }

    return null;
  }

  let eventsInitialized = false;

  function bootApplication(account, animate = true) {
    state.isAuthenticated = true;
    state.currentUser = account;
    setCoupleProfile(account.coupleId || 'seb_lynn');
    localStorage.setItem('active_couple_space', state.currentCouple.id);

    document.body.classList.remove('is-locked');

    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
      appContainer.style.display = 'block';
    }

    unlockUI(account, animate);
    updateCoupleBranding(state.currentCouple, account);
    if (typeof themeManager !== 'undefined') {
      themeManager.init();
    }

    // Setup application events once
    if (!eventsInitialized) {
      setupEvents();
      eventsInitialized = true;
    }

    // Gated Data Loading: only loads into memory & DOM after passcode verified
    loadData();
    initMap();
    updateCounters();

    if (state.trips.length > 0) {
      selectTrip(state.trips[0]);
    } else {
      state.selectedTrip = null;
      renderSelectedTripCard();
    }
    if (state.activities.length > 0) {
      const initialAct = getRandomActivity(true) || state.activities[0];
      renderActivityCard(initialAct);
    } else {
      state.selectedActivity = null;
      renderActivityCard(null);
    }

    // Start cloud sync
    cloudSync.autoSync();

    // Initialize AI Model UI & quick-tweak indicators
    updateModelUI();
  }

  function updateCoupleBranding(couple, account) {
    if (!couple) return;

    // 1. Header User Pill
    const userPill = document.getElementById('userPill');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    if (userPill) userPill.style.display = 'inline-flex';
    if (userAvatar && account) userAvatar.textContent = account.avatar || '✨';
    if (userName && account) userName.textContent = account.name || 'User';

    // 2. Footer Brand
    const footerBrand = document.getElementById('footerBrand');
    if (footerBrand) footerBrand.textContent = couple.names;

    // 3. Document Title
    document.title = `Sync & Sway — ${couple.names}`;

    // 4. Cloud Modal Subtitle & Title Badge
    const cloudModalSubtitle = document.getElementById('cloudModalSubtitle');
    if (cloudModalSubtitle) {
      cloudModalSubtitle.textContent = `Real-time automatic sync between ${couple.names}`;
    }
    const cloudRoomTitle = document.getElementById('cloudRoomTitle');
    if (cloudRoomTitle) {
      cloudRoomTitle.textContent = `${couple.icon} ${couple.names}'s Cloud`;
    }

    // 5. Cloud Status Detail
    const statusDetail = document.getElementById('statusDetail');
    if (statusDetail) {
      statusDetail.textContent = `Connected. All items are synchronized between ${couple.names}.`;
    }

    // 6. Settings AI sync note
    const aiSyncSubtitle = document.getElementById('aiSyncSubtitle');
    if (aiSyncSubtitle) {
      aiSyncSubtitle.textContent = `Preference immediately syncs across ${couple.names}'s devices.`;
    }

    // 7. Theme modal subtitle
    const themeModalSubtitle = document.getElementById('themeModalSubtitle');
    if (themeModalSubtitle) {
      themeModalSubtitle.textContent = `Pick an aesthetic vibe for ${couple.names}'s space`;
    }
  }

  function checkStoredAuth() {
    purgeLegacyLocalStorage();
    ensureFirebase();

    if (typeof firebase !== 'undefined' && firebase.auth) {
      if (!authListenerAttached) {
        authListenerAttached = true;
        firebase.auth().onAuthStateChanged((user) => {
          if (user && user.email) {
            const matchedAccount = AUTH_ACCOUNTS.find(a => a.email.toLowerCase() === user.email.toLowerCase());
            if (matchedAccount) {
              bootApplication(matchedAccount, false);
              return;
            }
          }
          lockUI(false);
        });
      }
    } else {
      lockUI(false);
    }
  }

  function unlockUI(user, animate = true) {
    const overlay = document.getElementById('lockscreenOverlay');
    const userPill = document.getElementById('userPill');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');

    if (overlay) overlay.classList.add('unlocked');
    if (userPill) userPill.style.display = 'inline-flex';
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.avatar;

    if (animate) {
      sfx.unlockHarmony();
      confetti.burst();
      showToast(`Welcome back, <strong>${user.name}</strong>! ${user.avatar}`);
    }
  }

  function lockUI(notify = true) {
    state.isAuthenticated = false;
    state.currentUser = null;
    document.body.classList.add('is-locked');

    // Sign out from Firebase Auth
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        firebase.auth().signOut().catch(e => console.warn('SignOut notice:', e));
      } catch (e) {}
    }

    // Detach Firestore listeners
    if (cloudSync && cloudSync.unsubscribe) {
      cloudSync.unsubscribe();
      cloudSync.unsubscribe = null;
    }

    const appContainer = document.getElementById('appContainer');
    if (appContainer) {
      appContainer.style.display = 'none';
    }

    // Wipe all sensitive date & trip items from JavaScript memory (RAM)
    state.activities = [];
    state.trips = [];
    state.selectedActivity = null;
    state.selectedTrip = null;

    // Wipe sensitive rows & text from DOM to prevent DevTools inspection
    const actTbody = document.getElementById('tbodyActivities');
    if (actTbody) actTbody.innerHTML = '';
    const tripTbody = document.getElementById('tbodyTrips');
    if (tripTbody) tripTbody.innerHTML = '';
    const cardTitle = document.getElementById('cardTitle');
    if (cardTitle) cardTitle.textContent = '';
    const selectedTripName = document.getElementById('selectedTripName');
    if (selectedTripName) selectedTripName.textContent = '';
    const selectedTripDesc = document.getElementById('selectedTripDesc');
    if (selectedTripDesc) selectedTripDesc.textContent = '';

    if (markersLayer) {
      markersLayer.clearLayers();
    }

    // Restore lockscreen overlay
    const overlay = document.getElementById('lockscreenOverlay');
    if (overlay) {
      overlay.classList.remove('unlocked');
      overlay.style.removeProperty('display');
      overlay.style.removeProperty('opacity');
      overlay.style.removeProperty('visibility');
    }
    const userPill = document.getElementById('userPill');
    if (userPill) userPill.style.display = 'none';
    const input = document.getElementById('inputPasscode');
    if (input) {
      input.value = '';
      input.focus();
    }
    const errorMsg = document.getElementById('lockErrorMsg');
    if (errorMsg) errorMsg.style.display = 'none';

    if (notify) {
      showToast('🔒 Space locked.');
      sfx.lockLatch();
    }
  }

  let currentLockUser = 'seb';

  function switchLockUserTab(userId) {
    currentLockUser = userId || 'seb';
    const tab1 = document.getElementById('userTab1');
    const tab2 = document.getElementById('userTab2');
    const input = document.getElementById('inputPasscode');
    const acct = AUTH_ACCOUNTS.find(a => a.id === currentLockUser);

    if (tab1) {
      const isTab1 = tab1.dataset.user === currentLockUser;
      tab1.classList.toggle('active', isTab1);
      tab1.setAttribute('aria-selected', isTab1 ? 'true' : 'false');
    }
    if (tab2) {
      const isTab2 = tab2.dataset.user === currentLockUser;
      tab2.classList.toggle('active', isTab2);
      tab2.setAttribute('aria-selected', isTab2 ? 'true' : 'false');
    }

    if (input && acct) {
      input.placeholder = `Enter password for ${acct.name}...`;
    }
  }

  function switchLockCoupleTab(coupleId) {
    localStorage.setItem('active_couple_space', coupleId);
    const tabSeb = document.getElementById('tabSebLynn');
    const tabVA = document.getElementById('tabVincentAlice');
    const subtitle = document.getElementById('lockSubtitle');
    const tab1 = document.getElementById('userTab1');
    const tab1Avatar = document.getElementById('userTab1Avatar');
    const tab1Name = document.getElementById('userTab1Name');
    const tab2 = document.getElementById('userTab2');
    const tab2Avatar = document.getElementById('userTab2Avatar');
    const tab2Name = document.getElementById('userTab2Name');

    if (coupleId === 'vincent_alice') {
      if (tabSeb) {
        tabSeb.classList.remove('active');
        tabSeb.setAttribute('aria-selected', 'false');
      }
      if (tabVA) {
        tabVA.classList.add('active');
        tabVA.setAttribute('aria-selected', 'true');
      }
      if (subtitle) subtitle.textContent = "Select your profile and enter password";
      if (tab1) {
        tab1.dataset.user = 'vincent';
        if (tab1Avatar) tab1Avatar.textContent = '🌿';
        if (tab1Name) tab1Name.textContent = 'Vincent';
      }
      if (tab2) {
        tab2.dataset.user = 'alice';
        if (tab2Avatar) tab2Avatar.textContent = '🐰';
        if (tab2Name) tab2Name.textContent = 'Alice';
      }
      switchLockUserTab('vincent');
    } else {
      if (tabSeb) {
        tabSeb.classList.add('active');
        tabSeb.setAttribute('aria-selected', 'true');
      }
      if (tabVA) {
        tabVA.classList.remove('active');
        tabVA.setAttribute('aria-selected', 'false');
      }
      if (subtitle) subtitle.textContent = "Select your profile and enter password";
      if (tab1) {
        tab1.dataset.user = 'seb';
        if (tab1Avatar) tab1Avatar.textContent = '✨';
        if (tab1Name) tab1Name.textContent = 'Seb';
      }
      if (tab2) {
        tab2.dataset.user = 'lynn';
        if (tab2Avatar) tab2Avatar.textContent = '🌸';
        if (tab2Name) tab2Name.textContent = 'Lynn';
      }
      switchLockUserTab('seb');
    }
  }

  function setupLockscreen() {
    const lockForm = document.getElementById('lockscreenForm');
    if (lockForm) lockForm.addEventListener('submit', handleUnlockSubmit);

    // Couple Tab Switcher Initialization
    const savedSpace = localStorage.getItem('active_couple_space') || 'seb_lynn';
    switchLockCoupleTab(savedSpace);

    const tabSeb = document.getElementById('tabSebLynn');
    if (tabSeb) tabSeb.addEventListener('click', () => {
      switchLockCoupleTab('seb_lynn');
      sfx.tap();
      const input = document.getElementById('inputPasscode');
      if (input) input.focus();
    });

    const tabVA = document.getElementById('tabVincentAlice');
    if (tabVA) tabVA.addEventListener('click', () => {
      switchLockCoupleTab('vincent_alice');
      sfx.tap();
      const input = document.getElementById('inputPasscode');
      if (input) input.focus();
    });

    // User Tab Switchers
    const tab1 = document.getElementById('userTab1');
    if (tab1) tab1.addEventListener('click', () => {
      switchLockUserTab(tab1.dataset.user);
      sfx.tap();
      const input = document.getElementById('inputPasscode');
      if (input) input.focus();
    });

    const tab2 = document.getElementById('userTab2');
    if (tab2) tab2.addEventListener('click', () => {
      switchLockUserTab(tab2.dataset.user);
      sfx.tap();
      const input = document.getElementById('inputPasscode');
      if (input) input.focus();
    });

    const btnTogglePass = document.getElementById('btnTogglePass');
    if (btnTogglePass) {
      btnTogglePass.addEventListener('click', () => {
        const input = document.getElementById('inputPasscode');
        if (input) {
          const isPass = input.type === 'password';
          input.type = isPass ? 'text' : 'password';
          btnTogglePass.textContent = isPass ? '🙈' : '👁️';
        }
      });
    }

    setupAntiTamperGuard();
  }

  function setupAntiTamperGuard() {
    // 1. Observe document body for removal of lockscreenOverlay
    const bodyObserver = new MutationObserver(() => {
      if (state.isAuthenticated) return;
      const overlay = document.getElementById('lockscreenOverlay');
      if (!overlay) {
        console.warn('Tampering detected: lockscreenOverlay removed from DOM.');
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
          appContainer.style.setProperty('display', 'none', 'important');
          appContainer.innerHTML = '';
        }
        window.location.reload();
      }
    });
    bodyObserver.observe(document.body, { childList: true, subtree: false });

    // 2. Observe lockscreenOverlay directly for style/class tampering
    const overlay = document.getElementById('lockscreenOverlay');
    if (overlay) {
      const overlayObserver = new MutationObserver(() => {
        if (state.isAuthenticated) return;
        if (overlay.classList.contains('unlocked') ||
            overlay.style.display === 'none' ||
            overlay.style.opacity === '0' ||
            overlay.style.visibility === 'hidden') {
          console.warn('Tampering detected: lockscreenOverlay visibility altered.');
          overlay.classList.remove('unlocked');
          overlay.style.removeProperty('display');
          overlay.style.removeProperty('opacity');
          overlay.style.removeProperty('visibility');
          const appContainer = document.getElementById('appContainer');
          if (appContainer) {
            appContainer.style.setProperty('display', 'none', 'important');
          }
        }
      });
      overlayObserver.observe(overlay, { attributes: true, attributeFilter: ['style', 'class'] });
    }
  }

  async function handleUnlockSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('inputPasscode');
    const card = document.getElementById('lockscreenCard');
    const errorMsg = document.getElementById('lockErrorMsg');
    const remember = document.getElementById('chkRememberDevice')?.checked;

    const val = input.value.trim();
    if (!val) return;

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying...';
    }

    try {
      const result = await attemptAuth(val, currentLockUser, remember);
      if (result && result.account) {
        if (errorMsg) errorMsg.style.display = 'none';
        bootApplication(result.account, true);
        input.value = '';
      } else {
        throw new Error('INVALID_PASSCODE');
      }
    } catch (err) {
      console.error('Authentication attempt failed:', err);
      if (err.message === 'AUTH_CONFIG_NOT_FOUND') {
        if (errorMsg) {
          errorMsg.innerHTML = '⚠️ Firebase Auth not enabled in console yet.<br><small>Enable "Email/Password" in Firebase Console &gt; Authentication.</small>';
          errorMsg.style.display = 'block';
        }
      } else if (err.code === 'auth/weak-password') {
        if (errorMsg) {
          errorMsg.textContent = 'Password must be at least 6 characters.';
          errorMsg.style.display = 'block';
        }
      } else {
        if (errorMsg) {
          errorMsg.textContent = 'Incorrect password. Try again.';
          errorMsg.style.display = 'block';
        }
      }
      if (card) {
        card.classList.remove('shake');
        void card.offsetWidth;
        card.classList.add('shake');
      }
      input.select();
      sfx.errorNudge();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Unlock Space →';
      }
    }
  }

  // =========================================================================
  // 3. State & Real-time Cloud Sync
  // =========================================================================
  const state = {
    isAuthenticated: false,
    currentUser: null,
    currentCouple: COUPLE_PROFILES.seb_lynn,
    activities: [],
    trips: [],
    deletedTripIds: new Set(),
    deletedActivityIds: new Set(),
    selectedTrip: null,
    selectedActivity: null,
    dateMode: 'single', // 'single' | 'eliminator'
    eliminatorCandidates: [],
    // Trip filters (Dual range days slider + Multiple choice budget/season)
    tripFilters: {
      daysRange: { min: 1, max: 15, isAll: true },
      budget: ['all'],
      season: ['all'],
      unvisitedOnly: true
    },
    // Date filters (Multiple choice)
    dateFilters: {
      occasion: ['all'],
      budget: ['all'],
      env: ['all'],
      undoneOnly: true
    }
  };

  function trackDeletedTrip(tripId) {
    if (!tripId) return;
    if (!state.deletedTripIds) state.deletedTripIds = new Set();
    state.deletedTripIds.add(tripId);
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_TRIPS, JSON.stringify(Array.from(state.deletedTripIds).slice(-300)));
    } catch (e) {}
  }

  function trackDeletedActivity(actId) {
    if (!actId) return;
    if (!state.deletedActivityIds) state.deletedActivityIds = new Set();
    state.deletedActivityIds.add(actId);
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_ACTIVITIES, JSON.stringify(Array.from(state.deletedActivityIds).slice(-300)));
    } catch (e) {}
  }

  function saveLocalData() {
    try {
      if (Array.isArray(state.trips)) {
        localStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(state.trips));
      }
      if (Array.isArray(state.activities)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(state.activities));
      }
      if (state.deletedTripIds) {
        localStorage.setItem(STORAGE_KEYS.DELETED_TRIPS, JSON.stringify(Array.from(state.deletedTripIds).slice(-300)));
      }
      if (state.deletedActivityIds) {
        localStorage.setItem(STORAGE_KEYS.DELETED_ACTIVITIES, JSON.stringify(Array.from(state.deletedActivityIds).slice(-300)));
      }
    } catch (e) {
      console.warn('LocalStorage save notice:', e);
    }
  }

  function loadLocalData() {
    const isSebLynn = !state.currentCouple || state.currentCouple.id === 'seb_lynn';

    // Auto-clean: Purge any accidental bleed of Seb's defaults from Vincent & Alice's space
    if (!isSebLynn) {
      try {
        const rawVaActs = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
        const rawVaTrips = localStorage.getItem(STORAGE_KEYS.TRIPS);
        const hasBleedActs = rawVaActs && (rawVaActs.includes('act_1') || rawVaActs.includes('買一套上班的衣服'));
        const hasBleedTrips = rawVaTrips && (rawVaTrips.includes('trip_1793202088746') || rawVaTrips.includes('trip_hokkaido'));
        if (hasBleedActs || hasBleedTrips || localStorage.getItem('va_purged_seb_bleed_v2') !== 'done') {
          localStorage.setItem(STORAGE_KEYS.ACTIVITIES, '[]');
          localStorage.setItem(STORAGE_KEYS.TRIPS, '[]');
          localStorage.setItem(STORAGE_KEYS.DELETED_TRIPS, '[]');
          localStorage.setItem(STORAGE_KEYS.DELETED_ACTIVITIES, '[]');
          localStorage.setItem('va_purged_seb_bleed_v2', 'done');
        }
      } catch (cleanErr) {
        console.warn('VA clean error:', cleanErr);
      }
    }

    try {
      const rawTrips = localStorage.getItem(STORAGE_KEYS.TRIPS) || (isSebLynn ? localStorage.getItem('sync_sway_trips_v4') : null);
      if (rawTrips) {
        const parsed = JSON.parse(rawTrips);
        if (Array.isArray(parsed)) {
          state.trips = parsed;
        } else {
          state.trips = [];
        }
      } else {
        state.trips = [];
      }
    } catch (e) {
      console.warn('Failed to parse cached trips:', e);
      state.trips = [];
    }

    try {
      const rawActs = localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || (isSebLynn ? localStorage.getItem('sync_sway_activities_v4') : null);
      if (rawActs) {
        const parsed = JSON.parse(rawActs);
        if (Array.isArray(parsed)) {
          state.activities = parsed;
        } else {
          state.activities = [];
        }
      } else {
        state.activities = [];
      }
    } catch (e) {
      console.warn('Failed to parse cached activities:', e);
      state.activities = [];
    }

    try {
      const rawDelTrips = localStorage.getItem(STORAGE_KEYS.DELETED_TRIPS) || (isSebLynn ? localStorage.getItem('sync_sway_deleted_trips_v4') : null);
      if (rawDelTrips) {
        const parsed = JSON.parse(rawDelTrips);
        if (Array.isArray(parsed)) {
          state.deletedTripIds = new Set(parsed);
        }
      } else {
        state.deletedTripIds = new Set();
      }
    } catch (e) {
      state.deletedTripIds = new Set();
    }

    try {
      const rawDelActs = localStorage.getItem(STORAGE_KEYS.DELETED_ACTIVITIES) || (isSebLynn ? localStorage.getItem('sync_sway_deleted_activities_v4') : null);
      if (rawDelActs) {
        const parsed = JSON.parse(rawDelActs);
        if (Array.isArray(parsed)) {
          state.deletedActivityIds = new Set(parsed);
        }
      } else {
        state.deletedActivityIds = new Set();
      }
    } catch (e) {
      state.deletedActivityIds = new Set();
    }

    // Fall back to defaults ONLY for Seb & Lynn if local cache has nothing
    if (isSebLynn) {
      if (!state.trips || state.trips.length === 0) {
        state.trips = cloneDefaults(window.DEFAULT_TRIPS).map(t => ({
          ...t,
          updatedAt: t.updatedAt || 1
        }));
      } else {
        state.trips.forEach(t => {
          if (!t.updatedAt) t.updatedAt = 1;
        });
      }

      if (!state.activities || state.activities.length === 0) {
        state.activities = cloneDefaults(window.DEFAULT_ACTIVITIES).map(a => ({
          ...a,
          updatedAt: a.updatedAt || 1
        }));
        const { result } = sanitizeActivitiesList(state.activities);
        state.activities = result;
      } else {
        state.activities.forEach(a => {
          if (!a.updatedAt) a.updatedAt = 1;
        });
      }
    } else {
      // Vincent & Alice space is isolated and starts completely empty
      if (!Array.isArray(state.trips)) state.trips = [];
      if (!Array.isArray(state.activities)) state.activities = [];
    }
  }

  // Non-destructive 3-Way Merge for Trips
  function mergeTrips(localList, remoteList, remoteDeletedIds = []) {
    const remoteDelSet = new Set(Array.isArray(remoteDeletedIds) ? remoteDeletedIds : []);
    const localDelSet = state.deletedTripIds || new Set();
    const allDeleted = new Set([...localDelSet, ...remoteDelSet]);

    // Keep union of deletions
    state.deletedTripIds = allDeleted;

    const tripMap = new Map();

    // 1. Add valid local trips
    if (Array.isArray(localList)) {
      for (const t of localList) {
        if (!t || !t.id || allDeleted.has(t.id)) continue;
        tripMap.set(t.id, {
          ...t,
          updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : 1
        });
      }
    }

    let needsPush = false;
    let hasRemoteChanges = false;

    // 2. Merge remote trips
    if (Array.isArray(remoteList)) {
      for (const rt of remoteList) {
        if (!rt || !rt.id || allDeleted.has(rt.id)) continue;
        const lt = tripMap.get(rt.id);
        if (!lt) {
          // Remote has a trip local does not have
          tripMap.set(rt.id, {
            ...rt,
            updatedAt: typeof rt.updatedAt === 'number' ? rt.updatedAt : 1
          });
          hasRemoteChanges = true;
        } else {
          // Both have this trip: compare updatedAt
          const remoteTime = typeof rt.updatedAt === 'number' ? rt.updatedAt : 0;
          const localTime = typeof lt.updatedAt === 'number' ? lt.updatedAt : 0;

          if (remoteTime > localTime) {
            // Remote is newer
            tripMap.set(rt.id, rt);
            hasRemoteChanges = true;
          } else if (localTime > remoteTime) {
            // Local is newer: preserve local and signal cloud push
            needsPush = true;
          } else {
            // Timestamps equal: merge safely (preserve visited if either marked it)
            const merged = {
              ...lt,
              ...rt,
              visited: Boolean(lt.visited || rt.visited),
              updatedAt: Math.max(localTime, remoteTime) || 1
            };
            tripMap.set(rt.id, merged);
          }
        }
      }
    }

    // 3. Check if local has trips that remote lacks
    if (Array.isArray(remoteList)) {
      const remoteIds = new Set(remoteList.map(r => r && r.id));
      for (const [id] of tripMap) {
        if (!remoteIds.has(id)) {
          needsPush = true;
        }
      }
    }

    const mergedTrips = Array.from(tripMap.values());
    return { mergedTrips, needsPush, hasRemoteChanges };
  }

  // Non-destructive 3-Way Merge for Activities
  function mergeActivities(localList, remoteList, remoteDeletedIds = []) {
    const remoteDelSet = new Set(Array.isArray(remoteDeletedIds) ? remoteDeletedIds : []);
    const localDelSet = state.deletedActivityIds || new Set();
    const allDeleted = new Set([...localDelSet, ...remoteDelSet]);

    state.deletedActivityIds = allDeleted;

    const actMap = new Map();

    if (Array.isArray(localList)) {
      for (const a of localList) {
        if (!a || !a.id || allDeleted.has(a.id)) continue;
        actMap.set(a.id, {
          ...a,
          updatedAt: typeof a.updatedAt === 'number' ? a.updatedAt : 1
        });
      }
    }

    let needsPush = false;
    let hasRemoteChanges = false;

    if (Array.isArray(remoteList)) {
      for (const ra of remoteList) {
        if (!ra || !ra.id || allDeleted.has(ra.id)) continue;
        const la = actMap.get(ra.id);
        if (!la) {
          actMap.set(ra.id, {
            ...ra,
            updatedAt: typeof ra.updatedAt === 'number' ? ra.updatedAt : 1
          });
          hasRemoteChanges = true;
        } else {
          const remoteTime = typeof ra.updatedAt === 'number' ? ra.updatedAt : 0;
          const localTime = typeof la.updatedAt === 'number' ? la.updatedAt : 0;

          if (remoteTime > localTime) {
            actMap.set(ra.id, ra);
            hasRemoteChanges = true;
          } else if (localTime > remoteTime) {
            needsPush = true;
          } else {
            const mergedDone = Boolean(la.completed || ra.completed);
            const mergedDoneAt = la.completedAt || ra.completedAt || null;
            const merged = {
              ...la,
              ...ra,
              completed: mergedDone,
              completedAt: mergedDone ? mergedDoneAt : null,
              updatedAt: Math.max(localTime, remoteTime) || 1
            };
            actMap.set(ra.id, merged);
          }
        }
      }
    }

    if (Array.isArray(remoteList)) {
      const remoteIds = new Set(remoteList.map(r => r && r.id));
      for (const [id] of actMap) {
        if (!remoteIds.has(id)) {
          needsPush = true;
        }
      }
    }

    const { result: sanitizedActs } = sanitizeActivitiesList(Array.from(actMap.values()));
    return { mergedActs: sanitizedActs, needsPush, hasRemoteChanges };
  }

  // Real-Time BaaS Synchronization Engine (Firebase Firestore)
  const cloudSync = {
    db: null,
    unsubscribe: null,
    deviceId: null,
    isReceivingRemote: false,
    pushTimer: null,
    connected: false,
    hasPendingPush: false,

    getDeviceId() {
      if (!this.deviceId) {
        let id = localStorage.getItem('sync_device_id');
        if (!id) {
          id = 'dev_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
          localStorage.setItem('sync_device_id', id);
        }
        this.deviceId = id;
      }
      return this.deviceId;
    },

    getEffectiveConfig() {
      if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.projectId) {
        return window.FIREBASE_CONFIG;
      }
      return null;
    },

    initFirebase() {
      const config = this.getEffectiveConfig();
      if (!config) {
        this.updateStatusUI('offline', 'Local Mode (Offline)', 'Operating locally with device storage.');
        return false;
      }

      if (typeof firebase === 'undefined') {
        this.updateStatusUI('error', 'Firebase Offline', 'Could not reach Firebase CDN.');
        return false;
      }

      try {
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(config);
        }
        this.db = firebase.firestore();
        return true;
      } catch (err) {
        console.error('Firebase init error:', err);
        this.updateStatusUI('error', 'Config Error', err.message || 'Firebase initialization failed.');
        return false;
      }
    },

    getRoomDoc() {
      if (!this.db) {
        if (!this.initFirebase()) return null;
      }
      const roomId = (state.currentCouple && state.currentCouple.roomId) ? state.currentCouple.roomId : 'shared';
      return this.db.collection('couples_rooms').doc(roomId);
    },

    updateStatusUI(stateName, title, detail) {
      const dot = document.getElementById('cloudDot');
      const text = document.getElementById('cloudStatusText');
      const orb = document.getElementById('statusOrb');
      const titleEl = document.getElementById('statusTitle');
      const detailEl = document.getElementById('statusDetail');

      if (dot) {
        dot.className = `cloud-dot ${stateName}`;
      }
      if (text) {
        if (stateName === 'connected') {
          text.textContent = 'Live Sync';
        } else if (stateName === 'connecting') {
          text.textContent = 'Connecting...';
        } else if (stateName === 'syncing') {
          text.textContent = 'Syncing...';
        } else {
          text.textContent = 'Local Only';
        }
      }
      if (orb) {
        orb.className = `status-orb ${stateName}`;
      }
      if (titleEl) titleEl.textContent = title;
      if (detailEl) detailEl.textContent = detail;
    },

    applyRemoteData(data, isInitial = false) {
      if (!data) return { needsPush: false, hasChanges: false };

      // Data Loss Guard: only protect Seb & Lynn from unexpected empty payloads; allow Vincent & Alice to start clean
      const isSebLynn = !state.currentCouple || state.currentCouple.id === 'seb_lynn';
      if (isSebLynn) {
        if (Array.isArray(data.activities) && data.activities.length === 0 && state.activities && state.activities.length > 5) {
          console.warn('Blocked suspicious empty cloud payload to protect activities.');
          return { needsPush: false, hasChanges: false };
        }
        if (Array.isArray(data.trips) && data.trips.length === 0 && state.trips && state.trips.length > 5) {
          console.warn('Blocked suspicious empty cloud payload to protect destinations.');
          return { needsPush: false, hasChanges: false };
        }
      }

      this.isReceivingRemote = true;
      try {
        const { mergedTrips, needsPush: tripsNeedPush, hasRemoteChanges: tripsChanged } = mergeTrips(
          state.trips,
          data.trips || [],
          data.deletedTripIds || []
        );

        const { mergedActs, needsPush: actsNeedPush, hasRemoteChanges: actsChanged } = mergeActivities(
          state.activities,
          data.activities || [],
          data.deletedActivityIds || []
        );

        state.trips = mergedTrips;
        state.activities = mergedActs;

        // Auto-sync Gemini API key & verified model across authenticated devices
        const geminiKeyProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_KEY) ? STORAGE_KEYS.GEMINI_KEY : 'app_gemini_api_key';
        const geminiModelProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_MODEL) ? STORAGE_KEYS.GEMINI_MODEL : 'app_gemini_active_model';
        const aiUsageProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.USAGE_STATS) ? STORAGE_KEYS.USAGE_STATS : 'app_gemini_usage_stats';
        const rpdLimitProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.RPD_LIMIT) ? STORAGE_KEYS.RPD_LIMIT : 'app_gemini_custom_rpd_limit';

        if (typeof data.geminiApiKey === 'string' && data.geminiApiKey.trim()) {
          const cloudGeminiKey = data.geminiApiKey.trim();
          const currentLocalKey = localStorage.getItem(geminiKeyProp);
          if (cloudGeminiKey !== currentLocalKey) {
            localStorage.setItem(geminiKeyProp, cloudGeminiKey);
            const inputEl = document.getElementById('inputGeminiApiKey');
            if (inputEl) inputEl.value = cloudGeminiKey;
          }
        }
        if (typeof data.geminiModel === 'string' && data.geminiModel.trim()) {
          const cloudModel = data.geminiModel.trim();
          localStorage.setItem(geminiModelProp, cloudModel);
          updateModelUI(cloudModel);
        }
        if (data.aiUsage && typeof data.aiUsage === 'object') {
          const today = new Date().toISOString().slice(0, 10);
          if (data.aiUsage.todayDate === today && typeof aiUsageTracker !== 'undefined') {
            const local = aiUsageTracker.getStats();
            const remoteReq = typeof data.aiUsage.todayRequests === 'number' ? data.aiUsage.todayRequests : 0;
            const remoteTokens = typeof data.aiUsage.todayTokens === 'number' ? data.aiUsage.todayTokens : 0;
            const remoteUpdatedAt = data.aiUsage.updatedAt || 0;
            const localUpdatedAt = local.updatedAt || 0;

            let finalReq = local.todayRequests;
            let finalTokens = local.todayTokens;
            let finalLastCall = local.lastCall;

            if (remoteUpdatedAt > localUpdatedAt) {
              finalReq = remoteReq;
              finalTokens = remoteTokens;
              finalLastCall = data.aiUsage.lastCall || local.lastCall;
            } else {
              finalReq = Math.max(local.todayRequests || 0, remoteReq);
              finalTokens = Math.max(local.todayTokens || 0, remoteTokens);
            }

            const mergedStats = {
              ...local,
              todayRequests: finalReq,
              todayTokens: finalTokens,
              lastCall: finalLastCall,
              updatedAt: Math.max(localUpdatedAt, remoteUpdatedAt)
            };
            localStorage.setItem(aiUsageProp, JSON.stringify(mergedStats));
            if (typeof data.aiUsage.customRpdLimit === 'number' && data.aiUsage.customRpdLimit > 0) {
              localStorage.setItem(rpdLimitProp, data.aiUsage.customRpdLimit);
            }
            aiUsageTracker.updateUI();
          }
        }
        if (typeof data.aiRpdLimit === 'number' && data.aiRpdLimit > 0) {
          localStorage.setItem(rpdLimitProp, data.aiRpdLimit);
          if (typeof aiUsageTracker !== 'undefined') {
            aiUsageTracker.updateUI();
          }
        }

        // Persist merged state to local storage immediately
        saveLocalData();

        updateCounters();
        renderMapMarkers();
        renderActivitiesTable();
        renderTripsTable();

        if (state.selectedTrip) {
          const freshTrip = state.trips.find(t => t.id === state.selectedTrip.id);
          if (freshTrip) {
            state.selectedTrip = freshTrip;
            renderSelectedTripCard();
          } else if (state.trips.length > 0) {
            state.selectedTrip = state.trips[0];
            renderSelectedTripCard();
          }
        }

        if (state.selectedActivity) {
          const freshAct = state.activities.find(a => a.id === state.selectedActivity.id);
          if (freshAct) renderActivityCard(freshAct);
        } else if (state.activities.length > 0) {
          const initialAct = getRandomActivity(true) || state.activities[0];
          renderActivityCard(initialAct);
        }

        return {
          needsPush: tripsNeedPush || actsNeedPush,
          hasChanges: tripsChanged || actsChanged
        };
      } catch (err) {
        console.error('Error applying remote sync', err);
        return { needsPush: false, hasChanges: false };
      } finally {
        this.isReceivingRemote = false;
      }
    },

    autoSync() {
      if (!this.initFirebase()) return;

      if (this.unsubscribe) {
        this.unsubscribe();
        this.unsubscribe = null;
      }

      this.updateStatusUI('connecting', 'Connecting...', 'Establishing live connection with cloud...');

      const docRef = this.getRoomDoc();
      if (!docRef) return;
      let isInitialSnapshot = true;

      // Real-time listener for live updates from partner
      this.unsubscribe = docRef.onSnapshot((doc) => {
        this.connected = true;
        const coupleNames = getCoupleNames();
        this.updateStatusUI('connected', 'Auto-Sync Active', `Connected. All items are synchronized between ${coupleNames}.`);

        const isSebLynn = !state.currentCouple || state.currentCouple.id === 'seb_lynn';

        if (!doc.exists) {
          // Document does not exist yet; seed it with current state
          docRef.set({
            activities: isSebLynn ? (state.activities && state.activities.length ? state.activities : cloneDefaults(window.DEFAULT_ACTIVITIES)) : (state.activities || []),
            trips: isSebLynn ? (state.trips && state.trips.length ? state.trips : cloneDefaults(window.DEFAULT_TRIPS)) : (state.trips || []),
            deletedTripIds: Array.from(state.deletedTripIds || []),
            deletedActivityIds: Array.from(state.deletedActivityIds || []),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastUpdatedBy: this.getDeviceId()
          });
          isInitialSnapshot = false;
          return;
        }

        const data = doc.data();
        if (!data) return;

        // Auto-purge polluted cloud room for Vincent & Alice if it contains Seb's leaked data
        if (!isSebLynn) {
          const hasSebBleedActs = Array.isArray(data.activities) && data.activities.some(a => a && a.id === 'act_1' && a.title === '買一套上班的衣服');
          const hasSebBleedTrips = Array.isArray(data.trips) && data.trips.some(t => t && (t.id === 'trip_1793202088746' || t.id === 'trip_hokkaido'));
          if (hasSebBleedActs || hasSebBleedTrips) {
            console.log('Purging leaked Seb data from Vincent & Alice cloud room...');
            docRef.set({
              activities: [],
              trips: [],
              deletedTripIds: [],
              deletedActivityIds: [],
              updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
              lastUpdatedBy: this.getDeviceId()
            });
            state.activities = [];
            state.trips = [];
            state.deletedTripIds = new Set();
            state.deletedActivityIds = new Set();
            saveLocalData();
            updateCounters();
            renderMapMarkers();
            renderActivitiesTable();
            renderTripsTable();
            renderSelectedTripCard();
            renderActivityCard(null);
            isInitialSnapshot = false;
            return;
          }
        }

        // Skip echoes on subsequent updates from self
        if (!isInitialSnapshot && data.lastUpdatedBy === this.getDeviceId()) {
          return;
        }

        const wasInitial = isInitialSnapshot;
        isInitialSnapshot = false;

        const mergeResult = this.applyRemoteData(data, wasInitial);

        // If local had pending writes or merge revealed local is ahead, push merged superset
        if (this.hasPendingPush || (mergeResult && mergeResult.needsPush)) {
          this.hasPendingPush = false;
          this.schedulePush();
        }

        if (!wasInitial && mergeResult && mergeResult.hasChanges) {
          showToast(`☁️ Synced live update from partner!`);
          sfx.radarPing();
        }
      }, (err) => {
        console.error('Firestore listener error', err);
        if (!this.connected) {
          this.updateStatusUI('error', 'Connection Notice', err.message || 'Firestore connection paused.');
        }
      });
    },

    schedulePush() {
      if (this.isReceivingRemote) return;
      if (!this.connected || !this.db) {
        this.hasPendingPush = true;
        return;
      }

      if (this.pushTimer) clearTimeout(this.pushTimer);

      const dot = document.getElementById('cloudDot');
      if (dot) dot.className = 'cloud-dot syncing';

      this.pushTimer = setTimeout(() => {
        const docRef = this.getRoomDoc();
        if (!docRef) return;
        const payload = {
          activities: state.activities,
          trips: state.trips,
          deletedTripIds: Array.from(state.deletedTripIds || []).slice(-300),
          deletedActivityIds: Array.from(state.deletedActivityIds || []).slice(-300),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastUpdatedBy: this.getDeviceId(),
          deviceVersion: Date.now()
        };
        const geminiKeyProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_KEY) ? STORAGE_KEYS.GEMINI_KEY : 'app_gemini_api_key';
        const currentGeminiKey = localStorage.getItem(geminiKeyProp);
        if (currentGeminiKey) {
          payload.geminiApiKey = currentGeminiKey.trim();
        }
        docRef.set(payload, { merge: true }).then(() => {
          if (dot) dot.className = 'cloud-dot connected';
        }).catch((err) => {
          console.error('Firestore push error:', err);
          if (dot) dot.className = 'cloud-dot error';
          showToast(`Sync push failed: ${err.message}`, 'error');
        });
      }, 400);
    },

    forcePush() {
      if (!this.db) {
        if (!this.initFirebase()) return;
      }
      const dot = document.getElementById('cloudDot');
      if (dot) dot.className = 'cloud-dot syncing';

      const docRef = this.getRoomDoc();
      if (!docRef) return;
      docRef.set({
        activities: state.activities,
        trips: state.trips,
        deletedTripIds: Array.from(state.deletedTripIds || []).slice(-300),
        deletedActivityIds: Array.from(state.deletedActivityIds || []).slice(-300),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdatedBy: this.getDeviceId()
      }, { merge: true }).then(() => {
        if (dot) dot.className = 'cloud-dot connected';
        showToast('☁️ Successfully pushed local collection to cloud!');
      }).catch(err => {
        alert('Push failed: ' + err.message);
      });
    },

    forcePull() {
      if (!this.db) {
        if (!this.initFirebase()) return;
      }
      const docRef = this.getRoomDoc();
      if (!docRef) return;
      docRef.get().then(doc => {
        if (!doc.exists) {
          showToast('No cloud data found yet.');
          return;
        }
        this.applyRemoteData(doc.data(), false);
        saveData(true);
        showToast('🔄 Pulled & merged latest data from cloud!');
        sfx.sparkle();
      }).catch(err => {
        alert('Pull failed: ' + err.message);
      });
    }
  };

  const DEPRECATED_ACTIVITY_TITLES = new Set([
    // Group 2: Chores & Housework & Errands (16 items)
    '掃廁所', '洗電扇', '擦家裡的鏡子', '清理電腦鍵盤', '燙衣服',
    '整理書桌', '整理衣櫃', '整理冰箱', '把廢紙摺成垃圾紙盒',
    '粉刷牆壁', '改變房間格局', '重拍證件照', '把存錢筒的錢拿去銀行存錢',
    '整理youtube頻道', '去捐血', '換新床單',

    // Group 5: Dietary Constraints (5 items)
    '吃素一天', '以水代替飲料', '整天吃原型食物', '吃圓形食物', '吃一天速食',

    // Group 6: Ultra-Brief Actions (7 items)
    '花100塊買手搖飲', '喝一瓶羊奶', '喝青草茶', '吃紅豆餅', '吃潤餅', '吃大麵羹', '吃麻薏湯',

    // Group 1: Large group sports / gatherings (12 items)
    '約朋友打桌球', '約朋友去桌遊店', '約朋友打壁球', '找朋友打漆彈',
    '約朋友打羽球', '約朋友去國小打籃球', '打麻將', '和一群人玩跳跳床',
    '約朋友烤肉', '去學校打躲避球', '去國小踢足球', '找朋友玩五子棋',

    // Group 5: Multi-day novels & drama marathons (6 items)
    '讀紅樓夢', '看一部武俠網路小說', '看宮鬥劇', '看韓劇', '看一部日劇', '看選秀節目',

    // Group 6: Quirky, high-cost, or niche errands (18 items)
    '不帶錢包手機去散步', '去公園畫三隻鳥', '寫國小數學題', '去家庭理髮院洗頭',
    '去國術館', '體驗家中長輩的一天(五點甩手超慢跑、串門子、傍晚買菜)',
    '練習溜溜球招式', '摺星星', '疊杯子', '偷偷送長輩500元的禮物',
    '去百貨公司一樓買一件商品', '清空購物車', '到家具行買家具',
    '做紅豆冰棒炊飯', '自製麵條', '刺繡', '曬太陽', '洗車',

    // Individual tasks: 110, 122, 215, 124, 77, 202 (6 items)
    '找出最吵的蟬', '挖蛤蠣', '看日出', '當志工', '露營', '在家露營'
  ]);

  const ACTIVITY_TITLE_FIXES = {
    'Otaru Music Box Museum買一套上班的衣服': '買一套上班的衣服',
    '間羅波高': '煎蘿蔔糕',
    '完密室逃脫': '玩密室逃脫',
    '買異國零時吃': '買異國零食吃',
    '去泳游池游泳': '去游泳池游泳',
    '嘗試沒剪過ㄉ髮型': '嘗試沒剪過的髮型'
  };

  let migrationApplied = false;

  function sanitizeActivitiesList(list) {
    if (!Array.isArray(list)) return { result: [], changed: false };
    let changed = false;
    const result = [];

    for (const item of list) {
      if (!migrationApplied && DEPRECATED_ACTIVITY_TITLES.has(item.title)) {
        changed = true;
        continue;
      }
      if (ACTIVITY_TITLE_FIXES[item.title]) {
        changed = true;
        result.push({ ...item, title: ACTIVITY_TITLE_FIXES[item.title] });
      } else {
        result.push(item);
      }
    }
    migrationApplied = true;
    return { result, changed };
  }

  function cloneDefaults(obj) {
    return Array.isArray(obj) ? JSON.parse(JSON.stringify(obj)) : [];
  }

  function loadData() {
    loadLocalData();
  }

  function saveData(skipCloudPush = false) {
    saveLocalData();
    updateCounters();
    if (!skipCloudPush) {
      cloudSync.schedulePush();
    }
  }

  function updateCounters() {
    const actTotal = state.activities.length;
    const actDone = state.activities.filter(a => a.completed).length;
    const actRemaining = actTotal - actDone;
    const tripTotal = state.trips.length;
    const tripVisited = state.trips.filter(t => t.visited).length;
    const tripWishlist = tripTotal - tripVisited;

    document.getElementById('collectionCount').textContent = actTotal;
    document.getElementById('modalActCount').textContent = actTotal;
    document.getElementById('modalTripCount').textContent = tripTotal;
    document.getElementById('statCompletedCount').textContent = actDone;
    document.getElementById('statRemainingCount').textContent = actRemaining;
    document.getElementById('statTripsCount').textContent = tripTotal;
    document.getElementById('tripCountBadge').textContent = `${tripTotal} Saved Spots`;

    const elWishlist = document.getElementById('legendWishlistCount');
    if (elWishlist) elWishlist.textContent = tripWishlist;
    const elVisited = document.getElementById('legendVisitedCount');
    if (elVisited) elVisited.textContent = tripVisited;
  }

  // =========================================================================
  // 4. Interactive Dark Line Map (Leaflet)
  // =========================================================================
  let mapInstance = null;
  let markersLayer = null;

  function initMap() {
    const mapEl = document.getElementById('tripMap');
    if (!mapEl) return;

    if (mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 50);
      renderMapMarkers();
      return;
    }

    // Center map around East Asia / World overview with seamless world wrapping
    mapInstance = L.map('tripMap', {
      center: [26.0, 120.0],
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: true
    });

    // 100% Free Dark Line Canvas Map (No API Key Required)
    const esriBase = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16,
      maxZoom: 18,
      attribution: '&copy; Esri'
    });

    const esriLabels = L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxNativeZoom: 16,
      maxZoom: 18
    });

    esriBase.addTo(mapInstance);
    esriLabels.addTo(mapInstance);

    // Zoom control at top right
    L.control.zoom({ position: 'topright' }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);

    // Click map to drop place (normalized longitude)
    mapInstance.on('click', (e) => {
      const wrappedLng = L.latLng(e.latlng.lat, e.latlng.lng).wrap().lng;
      openAddTripModal(e.latlng.lat, wrappedLng);
    });

    renderMapMarkers();
  }

  function renderMapMarkers() {
    if (!mapInstance || !markersLayer) return;
    markersLayer.clearLayers();

    // World offsets for seamless infinite horizontal wrapping across adjacent copies of the world
    const worldOffsets = [-720, -360, 0, 360, 720];

    state.trips.forEach((trip) => {
      if (trip.lat == null || isNaN(trip.lat) || trip.lng == null || isNaN(trip.lng)) return;

      const baseLng = L.latLng(trip.lat, trip.lng).wrap().lng;
      const isVisited = !!trip.visited;
      const isSelected = state.selectedTrip && state.selectedTrip.id === trip.id;
      const shortName = trip.name.length > 7 ? trip.name.slice(0, 6) + '…' : trip.name;

      worldOffsets.forEach((offset) => {
        const markerLng = baseLng + offset;

        const iconHtml = `
          <div class="custom-pin ${isVisited ? 'visited' : 'wishlist'} ${isSelected ? 'selected' : ''}" data-id="${escapeHTML(trip.id)}" title="${escapeHTML(trip.name)} (${isVisited ? 'Visited ✓' : 'Wishlist ✦'})">
            <div class="pin-ring"></div>
            <div class="pin-badge">
              <span class="pin-glyph">${isVisited ? '✓' : '✦'}</span>
            </div>
            <div class="pin-tag-label">${escapeHTML(shortName)}</div>
          </div>
        `;

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([trip.lat, markerLng], { icon: customIcon });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          selectTrip(trip, markerLng);
          sfx.pop();
        });

        markersLayer.addLayer(marker);
      });
    });
  }

  function selectTrip(trip, targetLng) {
    state.selectedTrip = trip;
    renderSelectedTripCard();
    renderMapMarkers();

    if (mapInstance && trip.lat != null && !isNaN(trip.lat) && trip.lng != null && !isNaN(trip.lng)) {
      let flyLng = targetLng;
      if (flyLng == null) {
        const centerLng = mapInstance.getCenter().lng;
        const baseLng = L.latLng(trip.lat, trip.lng).wrap().lng;
        const candidates = [-720, -360, 0, 360, 720].map(offset => baseLng + offset);
        candidates.sort((a, b) => Math.abs(a - centerLng) - Math.abs(b - centerLng));
        flyLng = candidates[0];
      }

      mapInstance.flyTo([trip.lat, flyLng], 6, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }

  function renderSelectedTripCard() {
    const card = document.getElementById('selectedTripCard');
    const trip = state.selectedTrip;
    if (!trip) {
      card.style.display = 'none';
      return;
    }
    card.style.display = 'block';

    const isVisited = !!trip.visited;
    card.classList.toggle('trip-visited', isVisited);
    card.classList.toggle('trip-wishlist', !isVisited);

    const statusPill = document.getElementById('stStatusPill');
    if (statusPill) {
      statusPill.className = `st-status-pill ${isVisited ? 'visited' : 'wishlist'}`;
      statusPill.textContent = isVisited ? '✓ Visited Memory' : '✦ On Wishlist';
    }

    document.getElementById('stTitle').textContent = trip.name;
    document.getElementById('stLocationName').textContent = trip.locationName || 'Travel Destination';
    document.getElementById('stDesc').textContent = trip.description || 'No description provided.';
    document.getElementById('stDurationPill').textContent = `${trip.minDays} - ${trip.maxDays} Days`;
    const costStr = trip.costEstimate ? ` · ${trip.costEstimate}` : '';
    document.getElementById('stBudgetPill').textContent = `${trip.budget}${costStr}`;

    // Seasons format
    let seasonsStr = '';
    if (!trip.seasons || trip.seasons.length === 0 || trip.seasons.includes('all')) {
      seasonsStr = '✨ All Seasons (Year-round)';
    } else {
      const seasonEmojiMap = {
        all: '✨ Year-round',
        spring: '🌸 Spring',
        summer: '☀️ Summer',
        autumn: '🍁 Autumn',
        winter: '❄️ Winter'
      };
      seasonsStr = trip.seasons.map(s => seasonEmojiMap[s] || s).join(', ');
    }
    document.getElementById('stSeasonPill').textContent = seasonsStr || 'Year-round';

    // Tags
    const tagsContainer = document.getElementById('stTags');
    tagsContainer.innerHTML = '';
    (trip.tags || []).forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t.startsWith('#') ? t : `#${t}`;
      tagsContainer.appendChild(span);
    });

    // Visited toggle
    const visitedBtn = document.getElementById('stVisitedBtn');
    const visitedText = document.getElementById('stVisitedText');
    if (isVisited) {
      visitedBtn.classList.add('visited');
      visitedText.textContent = 'Visited ✓';
    } else {
      visitedBtn.classList.remove('visited');
      visitedText.textContent = 'Wishlist ✦';
    }
  }

  // =========================================================================
  // 6. Trip Decider Engine (Radar Scan & Pick)
  // =========================================================================
  function updateDualDaysSliderUI() {
    const minSlider = document.getElementById('tripDaysMinSlider');
    const maxSlider = document.getElementById('tripDaysMaxSlider');
    const highlight = document.getElementById('dualSliderHighlight');
    const badge = document.getElementById('tripDaysBadge');
    if (!minSlider || !maxSlider || !highlight || !badge) return;

    let minVal = parseInt(minSlider.value, 10);
    let maxVal = parseInt(maxSlider.value, 10);
    if (isNaN(minVal)) minVal = 1;
    if (isNaN(maxVal)) maxVal = 15;

    // Guard crossover
    if (minVal > maxVal) {
      minVal = maxVal;
      minSlider.value = minVal;
    }

    const minScale = parseInt(minSlider.min, 10) || 1;
    const maxScale = parseInt(minSlider.max, 10) || 15;

    const leftPercent = ((minVal - minScale) / (maxScale - minScale)) * 100;
    const rightPercent = ((maxScale - maxVal) / (maxScale - minScale)) * 100;

    highlight.style.left = `${leftPercent}%`;
    highlight.style.right = `${rightPercent}%`;

    if (minVal <= 1 && maxVal >= 15) {
      state.tripFilters.daysRange = { min: 1, max: 15, isAll: true };
      badge.textContent = 'Any Duration ✨';
      badge.classList.remove('filtered');
    } else {
      state.tripFilters.daysRange = { min: minVal, max: maxVal, isAll: false };
      badge.classList.add('filtered');

      if (minVal === maxVal) {
        if (minVal >= 15) {
          badge.textContent = '15+ Days 🗺️';
        } else {
          badge.textContent = `${minVal} Days Trip ✈️`;
        }
      } else if (maxVal >= 15) {
        badge.textContent = `${minVal}+ Days ✈️`;
      } else {
        badge.textContent = `${minVal} – ${maxVal} Days ✈️`;
      }
    }
  }

  function resetDualDaysSliderUI() {
    const minSlider = document.getElementById('tripDaysMinSlider');
    const maxSlider = document.getElementById('tripDaysMaxSlider');
    if (minSlider) minSlider.value = '1';
    if (maxSlider) maxSlider.value = '15';
    updateDualDaysSliderUI();
  }

  let isSpinningTrip = false;
  let isSpinningDate = false;

  function decideTrip() {
    if (isSpinningTrip) return;

    const { daysRange, budget, season, unvisitedOnly } = state.tripFilters;
    const budgetList = Array.isArray(budget) ? budget : [budget];
    const seasonList = Array.isArray(season) ? season : [season];

    let pool = state.trips.filter((t) => {
      if (unvisitedOnly && t.visited) return false;

      // Budget filter (Multiple choice)
      if (!budgetList.includes('all')) {
        if (!budgetList.includes(t.budget)) return false;
      }

      // Best Season filter (Multiple choice)
      if (!seasonList.includes('all')) {
        const tripSeasons = (!t.seasons || t.seasons.length === 0) ? ['all'] : t.seasons;
        const matchesSeason = tripSeasons.includes('all') || tripSeasons.some(s => seasonList.includes(s));
        if (!matchesSeason) return false;
      }

      // Days to Travel filter (Dual range overlap: tripMax >= userMin && tripMin <= userMax)
      if (daysRange && !daysRange.isAll) {
        const userMin = daysRange.min;
        const userMax = daysRange.max >= 15 ? 999 : daysRange.max;
        const tripMin = t.minDays || 1;
        const tripMax = t.maxDays || tripMin;

        // Range Overlap
        const overlaps = tripMax >= userMin && tripMin <= userMax;
        if (!overlaps) return false;
      }

      return true;
    });

    if (pool.length === 0) {
      alert('No destinations match all selected filters! Try broadening your budget, season, or days filters.');
      return;
    }

    isSpinningTrip = true;
    const btnDecide = document.getElementById('btnDecideTrip');
    if (btnDecide) btnDecide.disabled = true;

    // Trigger Radar Scan Animation
    const radar = document.getElementById('radarOverlay');
    const radarText = document.getElementById('radarText');
    radar.classList.add('active');
    radarText.textContent = 'Scanning Coordinates...';

    let pingCount = 0;
    const interval = setInterval(() => {
      sfx.radarPing();
      pingCount++;
      if (pingCount === 1) radarText.textContent = 'Calculating Optimal Weather...';
      if (pingCount === 2) radarText.textContent = 'Matching Couples Vibes...';
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      radar.classList.remove('active');
      isSpinningTrip = false;
      if (btnDecide) btnDecide.disabled = false;

      const winner = pool[Math.floor(Math.random() * pool.length)];
      sfx.whoosh();
      selectTrip(winner);
      sfx.chime();
      confetti.burst();
    }, 1500);
  }

  // =========================================================================
  // 7. Date Activity Randomizer Engine (Slot Roll & Eliminator)
  // =========================================================================
  function filterActivities() {
    const { occasion, budget, env, undoneOnly } = state.dateFilters;
    const occasionList = Array.isArray(occasion) ? occasion : [occasion];
    const budgetList = Array.isArray(budget) ? budget : [budget];
    const envList = Array.isArray(env) ? env : [env];

    return state.activities.filter((act) => {
      if (undoneOnly && act.completed) return false;

      // Occasion filter (Multiple choice)
      if (!occasionList.includes('all')) {
        if (!occasionList.includes(act.occasion)) return false;
      }

      // Budget filter (Multiple choice)
      if (!budgetList.includes('all')) {
        if (!budgetList.includes(act.budget)) return false;
      }

      // Environment filter (Multiple choice)
      if (!envList.includes('all')) {
        if (act.environment !== 'any' && !envList.includes(act.environment)) {
          return false;
        }
      }

      return true;
    });
  }

  function getRandomActivity(respectFilters = true) {
    if (!state.activities || state.activities.length === 0) return null;
    if (respectFilters) {
      const pool = filterActivities();
      if (pool.length > 0) {
        return pool[Math.floor(Math.random() * pool.length)];
      }
    }
    const undone = state.activities.filter(a => !a.completed);
    const fallbackPool = undone.length > 0 ? undone : state.activities;
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
  }

  function spinDateIdea() {
    if (isSpinningDate) return;

    const pool = filterActivities();
    if (pool.length === 0) {
      alert('No date ideas match your current filters! Try setting "Environment" to Any or disabling "Undone Only".');
      return;
    }

    if (state.dateMode === 'eliminator') {
      spinEliminator(pool);
      return;
    }

    isSpinningDate = true;
    const btnSpin = document.getElementById('btnSpinDate');
    if (btnSpin) btnSpin.disabled = true;

    // Single Mode Slot-Machine Roll
    const cardEl = document.getElementById('dateActiveCard');
    const titleEl = document.getElementById('cardActivityTitle');
    cardEl.classList.add('rolling');
    titleEl.classList.add('rolling');
    sfx.diceRoll();

    let rollCount = 0;
    const maxRolls = 18;
    const rollInterval = 65;

    const interval = setInterval(() => {
      const tempItem = pool[Math.floor(Math.random() * pool.length)];
      titleEl.textContent = tempItem.title;
      sfx.slotTick(rollCount / maxRolls);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        cardEl.classList.remove('rolling');
        titleEl.classList.remove('rolling');
        isSpinningDate = false;
        if (btnSpin) btnSpin.disabled = false;

        // Pick final winner
        const winner = pool[Math.floor(Math.random() * pool.length)];
        renderActivityCard(winner);
        sfx.chime();
        confetti.burst();
      }
    }, rollInterval);
  }

  function renderActivityCard(act) {
    if (!act) {
      state.selectedActivity = null;
      const titleEl = document.getElementById('cardActivityTitle');
      if (titleEl) titleEl.textContent = 'No date ideas yet ✨';
      const idTag = document.getElementById('cardIdTag');
      if (idTag) idTag.textContent = '—';
      const occBadge = document.getElementById('cardOccasionBadge');
      if (occBadge) occBadge.textContent = 'Date Idea';
      const budBadge = document.getElementById('cardBudgetBadge');
      if (budBadge) budBadge.textContent = '—';
      const envBadge = document.getElementById('cardEnvBadge');
      if (envBadge) envBadge.textContent = '—';
      const statusEl = document.getElementById('cardStatusIndicator');
      if (statusEl) {
        statusEl.textContent = 'Add your first date below!';
        statusEl.className = 'status-indicator';
      }
      const doneDateEl = document.getElementById('cardDoneDate');
      if (doneDateEl) doneDateEl.textContent = '';
      return;
    }
    state.selectedActivity = act;

    document.getElementById('cardActivityTitle').textContent = act.title;
    document.getElementById('cardIdTag').textContent = act.id;

    // Badges
    const occasionMap = {
      short: '⚡ Short Date',
      dateNight: '🌙 Date Night',
      wholeDay: '☀️ Whole Day'
    };
    document.getElementById('cardOccasionBadge').textContent = occasionMap[act.occasion] || 'Date';
    document.getElementById('cardBudgetBadge').textContent = act.budget || '$$';

    const envMap = {
      indoor: '🌧️ Indoor',
      outdoor: '🌳 Outdoor',
      any: '✨ Any Spot'
    };
    document.getElementById('cardEnvBadge').textContent = envMap[act.environment] || 'Any';

    // Status
    const statusEl = document.getElementById('cardStatusIndicator');
    const doneDateEl = document.getElementById('cardDoneDate');
    if (act.completed) {
      statusEl.textContent = 'Completed ✓';
      statusEl.className = 'status-indicator done';
      const formattedDate = act.completedAt ? act.completedAt.slice(0, 10) : 'Done';
      doneDateEl.textContent = `Finished on ${formattedDate}`;
    } else {
      statusEl.textContent = 'Waiting to Go';
      statusEl.className = 'status-indicator';
      doneDateEl.textContent = '';
    }
  }

  // Draw 3 Couple's Eliminator Mode
  function spinEliminator(pool) {
    if (pool.length < 3) {
      alert('Need at least 3 matching date ideas to play Couple\'s Eliminator! Relax your filters.');
      return;
    }

    // Pick 3 unique items with Fisher-Yates shuffle (B28)
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    state.eliminatorCandidates = shuffled.slice(0, 3);

    const grid = document.getElementById('eliminatorGrid');
    grid.innerHTML = '';

    state.eliminatorCandidates.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'el-card';
      card.id = `elCard_${idx}`;

      const occasionMap = { short: '⚡ Short', dateNight: '🌙 Night', wholeDay: '☀️ All-day' };

      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span class="badge badge-occasion" style="font-size:0.68rem; padding:3px 8px;">${occasionMap[item.occasion] || 'Date'}</span>
            <span class="badge badge-budget" style="font-size:0.68rem; padding:3px 8px;">${escapeHTML(item.budget)}</span>
          </div>
          <h4 class="el-card-title">${escapeHTML(item.title)}</h4>
        </div>
        <button class="btn-veto" data-idx="${idx}">🚫 Partner Veto</button>
      `;

      card.querySelector('.btn-veto').addEventListener('click', (e) => {
        e.stopPropagation();
        card.classList.add('eliminated');
        sfx.cardFlip();
        checkEliminatorWinner();
      });

      grid.appendChild(card);
    });

    sfx.cardFlip();
  }

  function checkEliminatorWinner() {
    const cards = document.querySelectorAll('.el-card:not(.eliminated)');
    if (cards.length === 1) {
      // Disable all veto buttons immediately so winner cannot be vetoed during celebration delay (B15)
      document.querySelectorAll('.btn-veto').forEach(b => b.disabled = true);

      const winnerCard = cards[0];
      const winnerIdx = Number(winnerCard.querySelector('.btn-veto').dataset.idx);
      const winner = state.eliminatorCandidates[winnerIdx];

      winnerCard.style.borderColor = 'var(--neon-rose)';
      winnerCard.style.boxShadow = '0 0 20px var(--neon-rose-glow)';

      sfx.chime();
      confetti.burst();

      setTimeout(() => {
        // Clear candidates so subsequent draw is fresh, switch back to single card
        state.eliminatorCandidates = [];
        setMode('single');
        renderActivityCard(winner);
      }, 900);
    }
  }

  function toggleDateCompleted() {
    if (!state.selectedActivity) return;
    const act = state.selectedActivity;
    act.completed = !act.completed;
    act.completedAt = act.completed ? new Date().toISOString() : null;
    act.updatedAt = Date.now();

    saveData();
    renderActivityCard(act);

    if (act.completed) {
      sfx.stamp();
      confetti.burst();
    } else {
      sfx.uncheck();
    }
  }

  // =========================================================================
  // 8. View Navigation & Mode Switcher
  // =========================================================================
  function setView(viewName) {
    if (viewName === 'manage') {
      openManageModal();
      return;
    }
    sfx.whoosh();
    state.currentView = viewName;
    const main = document.getElementById('mainContainer');
    main.className = `main-container view-${viewName}`;

    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === viewName);
    });

    if (mapInstance) {
      setTimeout(() => mapInstance.invalidateSize(), 200);
    }
  }

  function setMode(mode) {
    state.dateMode = mode;
    sfx.cardFlip();
    document.getElementById('btnModeSingle').classList.toggle('active', mode === 'single');
    document.getElementById('btnModeEliminator').classList.toggle('active', mode === 'eliminator');

    document.getElementById('singleCardView').style.display = mode === 'single' ? 'block' : 'none';
    document.getElementById('eliminatorView').style.display = mode === 'eliminator' ? 'flex' : 'none';

    if (mode === 'eliminator' && state.eliminatorCandidates.length === 0) {
      spinDateIdea();
    }
  }

  // =========================================================================
  // 9. Manage & Hub Modal
  // =========================================================================
  function switchManageSubtab(target) {
    sfx.tap();
    document.querySelectorAll('.modal-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.subtab === target);
    });
    const subActivities = document.getElementById('subtabActivities');
    const subTrips = document.getElementById('subtabTrips');
    const subImport = document.getElementById('subtabImportExport');
    if (subActivities) subActivities.style.display = target === 'activitiesList' ? 'block' : 'none';
    if (subTrips) subTrips.style.display = target === 'tripsList' ? 'block' : 'none';
    if (subImport) subImport.style.display = target === 'importExport' ? 'block' : 'none';
  }

  function openManageModal(subtab = 'activitiesList', filterStatus = null) {
    const modal = document.getElementById('manageModal');
    if (modal) modal.style.display = 'flex';
    sfx.whoosh();
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === 'manage');
    });

    switchManageSubtab(subtab);

    if (subtab === 'tripsList') {
      const tripFilter = document.getElementById('tripFilterStatus');
      if (tripFilter && filterStatus) tripFilter.value = filterStatus;
      const searchInput = document.getElementById('tripSearchInput');
      if (searchInput) searchInput.value = '';
    }

    renderActivitiesTable();
    renderTripsTable();
  }

  function closeManageModal() {
    const modal = document.getElementById('manageModal');
    if (modal) {
      modal.style.display = 'none';
      sfx.tap();
    }
    const activeView = state.currentView || 'trips';
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === activeView);
    });
  }

  function renderActivitiesTable() {
    const tbody = document.getElementById('activityTableBody');
    if (!tbody) return;
    const searchVal = document.getElementById('actSearchInput').value.trim().toLowerCase();
    const statusVal = document.getElementById('actFilterStatus').value;

    const filtered = state.activities.filter(act => {
      if (searchVal && !act.title.toLowerCase().includes(searchVal)) return false;
      if (statusVal === 'undone' && act.completed) return false;
      if (statusVal === 'done' && !act.completed) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.95rem;">No date ideas found. Click <strong>+ Add Date Idea</strong> to add one!</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(act => `
      <tr>
        <td style="text-align:center;">
          <input type="checkbox" ${act.completed ? 'checked' : ''} data-id="${escapeHTML(act.id)}" class="act-chk-done">
        </td>
        <td><strong>${escapeHTML(act.title)}</strong></td>
        <td><span class="pill">${escapeHTML(act.occasion)}</span></td>
        <td><span class="pill pill-budget">${escapeHTML(act.budget)}</span></td>
        <td><span class="pill">${escapeHTML(act.environment)}</span></td>
        <td class="table-actions-cell">
          <div class="table-actions-wrap">
            <button class="btn-edit-table btn-edit-act-table" data-id="${escapeHTML(act.id)}" title="Edit Date Idea">✏️</button>
            <button class="btn-del" data-id="${escapeHTML(act.id)}" title="Delete">✕</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderTripsTable() {
    const tbody = document.getElementById('tripTableBody');
    if (!tbody) return;
    const searchVal = document.getElementById('tripSearchInput').value.trim().toLowerCase();
    const statusVal = document.getElementById('tripFilterStatus') ? document.getElementById('tripFilterStatus').value : 'all';

    const filtered = state.trips.filter(t => {
      if (statusVal === 'wishlist' && t.visited) return false;
      if (statusVal === 'visited' && !t.visited) return false;
      if (searchVal && !t.name.toLowerCase().includes(searchVal) && !(t.locationName || '').toLowerCase().includes(searchVal)) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem 1rem; color: var(--text-muted); font-size: 0.95rem;">No destinations saved yet. Click <strong>+ Add Spot</strong> to add your first trip!</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(t => {
      const isVisited = !!t.visited;
      const seasonEmojiMap = {
        spring: '🌸 Spring',
        summer: '☀️ Summer',
        autumn: '🍁 Autumn',
        winter: '❄️ Winter',
        all: '✨ All Seasons'
      };
      const normS = normalizeSeasons(t.seasons);
      const seasonsText = normS.includes('all')
        ? '✨ All Seasons'
        : normS.map(s => seasonEmojiMap[s] || s).join(', ');
      return `
        <tr class="${isVisited ? 'tr-visited' : 'tr-wishlist'}">
          <td style="text-align:center;">
            <input type="checkbox" ${isVisited ? 'checked' : ''} data-id="${escapeHTML(t.id)}" class="trip-chk-visited" title="Toggle Visited">
          </td>
          <td>
            <div class="trip-table-name-wrap trip-fly-trigger" data-id="${escapeHTML(t.id)}" role="button" title="View destination on map" style="cursor: pointer;">
              <span class="table-status-pill ${isVisited ? 'visited' : 'wishlist'}">
                ${isVisited ? '✓ Visited' : '✦ Wishlist'}
              </span>
              <strong>${escapeHTML(t.name)}</strong>
            </div>
          </td>
          <td>${escapeHTML(t.locationName || '-')}</td>
          <td>${t.minDays}-${t.maxDays}d</td>
          <td>
            <div class="table-budget-wrap">
              <span class="pill pill-budget">${escapeHTML(t.budget)}</span>
              ${t.costEstimate ? `<span class="table-cost-sub">${escapeHTML(t.costEstimate)}</span>` : ''}
            </div>
          </td>
          <td>${escapeHTML(seasonsText)}</td>
          <td class="table-actions-cell">
            <div class="table-actions-wrap">
              <button class="btn-locate-trip trip-fly-trigger" data-id="${escapeHTML(t.id)}" title="Locate & Fly to Map">🗺️</button>
              <button class="btn-edit-table" data-id="${escapeHTML(t.id)}" title="Edit Destination">✏️</button>
              <button class="btn-del" data-id="${escapeHTML(t.id)}" title="Delete">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // 10. Dedicated Add & Edit Modals (Trips & Activities)
  // =========================================================================
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

  function getModalTripSeasons() {
    const container = document.getElementById('formTripSeasonChips');
    if (!container) return ['all'];
    const activeChips = container.querySelectorAll('.season-chip.active');
    const seasons = Array.from(activeChips).map(c => c.dataset.season);
    if (seasons.length === 0 || seasons.includes('all')) {
      return ['all'];
    }
    return normalizeSeasons(seasons);
  }

  function setModalTripSeasons(seasons) {
    const container = document.getElementById('formTripSeasonChips');
    if (!container) return;
    const list = normalizeSeasons(seasons);
    const chips = container.querySelectorAll('.season-chip');
    chips.forEach(chip => {
      const val = chip.dataset.season;
      if (list.includes('all')) {
        chip.classList.toggle('active', val === 'all');
      } else {
        chip.classList.toggle('active', list.includes(val));
      }
    });
  }

  function openAddTripModal(lat, lng) {
    const modal = document.getElementById('addTripModal');
    if (!modal) return;

    const titleEl = document.getElementById('modalTripTitle');
    if (titleEl) titleEl.textContent = 'Add New Destination';
    const submitBtn = document.getElementById('btnSubmitTrip');
    if (submitBtn) submitBtn.textContent = 'Save Destination';
    const idInput = document.getElementById('formTripId');
    if (idInput) idInput.value = '';

    const aiTripIn = document.getElementById('aiTripInput');
    if (aiTripIn) aiTripIn.value = '';
    const aiTripHint = document.getElementById('aiTripStatusHint');
    if (aiTripHint) aiTripHint.textContent = 'AI geolocates GPS, estimates budget, duration, tags & notes';

    document.getElementById('formTripName').value = '';
    document.getElementById('formTripRegion').value = '';
    document.getElementById('formTripDesc').value = '';
    const tagsInput = document.getElementById('formTripTags');
    if (tagsInput) tagsInput.value = '';
    
    const minDaysInput = document.getElementById('formTripMinDays');
    if (minDaysInput) minDaysInput.value = '2';
    const maxDaysInput = document.getElementById('formTripMaxDays');
    if (maxDaysInput) maxDaysInput.value = '3';

    const budgetSelect = document.getElementById('formTripBudget');
    if (budgetSelect) budgetSelect.value = '$$';
    const costEstimateInput = document.getElementById('formTripCostEstimate');
    if (costEstimateInput) costEstimateInput.value = '';

    setModalTripSeasons(['all']);

    if (lat !== undefined && lng !== undefined) {
      document.getElementById('formTripLat').value = Number(lat).toFixed(4);
      document.getElementById('formTripLng').value = Number(lng).toFixed(4);
    } else {
      document.getElementById('formTripLat').value = '';
      document.getElementById('formTripLng').value = '';
    }

    modal.style.display = 'flex';
    sfx.whoosh();
  }

  function openEditTripModal(tripId) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    const modal = document.getElementById('addTripModal');
    if (!modal) return;

    const titleEl = document.getElementById('modalTripTitle');
    if (titleEl) titleEl.textContent = 'Edit Destination';
    const submitBtn = document.getElementById('btnSubmitTrip');
    if (submitBtn) submitBtn.textContent = 'Update Destination';
    const idInput = document.getElementById('formTripId');
    if (idInput) idInput.value = trip.id;

    document.getElementById('formTripName').value = trip.name || '';
    document.getElementById('formTripRegion').value = trip.locationName || '';
    document.getElementById('formTripMinDays').value = trip.minDays || 2;
    document.getElementById('formTripMaxDays').value = trip.maxDays || 3;
    document.getElementById('formTripLat').value = (trip.lat !== undefined && trip.lat !== null) ? Number(trip.lat).toFixed(4) : '';
    document.getElementById('formTripLng').value = (trip.lng !== undefined && trip.lng !== null) ? Number(trip.lng).toFixed(4) : '';
    document.getElementById('formTripBudget').value = trip.budget || '$$';
    const editCostInput = document.getElementById('formTripCostEstimate');
    if (editCostInput) editCostInput.value = trip.costEstimate || '';
    document.getElementById('formTripDesc').value = trip.description || '';
    
    const tagsInput = document.getElementById('formTripTags');
    if (tagsInput) {
      tagsInput.value = (trip.tags && Array.isArray(trip.tags)) ? trip.tags.map(t => t.replace(/^#/, '')).join(', ') : '';
    }

    const tripSeasons = (!trip.seasons || trip.seasons.length === 0) ? ['all'] : trip.seasons;
    setModalTripSeasons(tripSeasons);

    modal.style.display = 'flex';
    sfx.whoosh();
  }

  function closeAddTripModal() {
    const modal = document.getElementById('addTripModal');
    if (modal) {
      modal.style.display = 'none';
      sfx.tap();
    }
  }

  function openAddActivityModal() {
    const modal = document.getElementById('addActivityModal');
    if (!modal) return;
    const titleEl = document.getElementById('modalActTitle');
    if (titleEl) titleEl.textContent = 'Add New Date Idea';
    const submitBtn = document.getElementById('btnSubmitAct');
    if (submitBtn) submitBtn.textContent = 'Save Date Idea';
    const idInput = document.getElementById('formActId');
    if (idInput) idInput.value = '';

    const aiActIn = document.getElementById('aiActInput');
    if (aiActIn) aiActIn.value = '';
    const aiActHint = document.getElementById('aiActStatusHint');
    if (aiActHint) aiActHint.textContent = 'AI auto-categorizes occasion, budget tier, and indoor/outdoor';

    document.getElementById('formActTitle').value = '';
    document.getElementById('formActOccasion').value = 'dateNight';
    document.getElementById('formActBudget').value = '$$';
    document.getElementById('formActEnv').value = 'any';

    modal.style.display = 'flex';
    sfx.whoosh();
  }

  function openEditActivityModal(actId) {
    const act = state.activities.find(a => a.id === actId);
    if (!act) return;

    const modal = document.getElementById('addActivityModal');
    if (!modal) return;

    const titleEl = document.getElementById('modalActTitle');
    if (titleEl) titleEl.textContent = 'Edit Date Idea';
    const submitBtn = document.getElementById('btnSubmitAct');
    if (submitBtn) submitBtn.textContent = 'Update Date Idea';
    const idInput = document.getElementById('formActId');
    if (idInput) idInput.value = act.id;

    document.getElementById('formActTitle').value = act.title || '';
    document.getElementById('formActOccasion').value = act.occasion || 'dateNight';
    document.getElementById('formActBudget').value = act.budget || '$$';
    document.getElementById('formActEnv').value = act.environment || 'any';

    modal.style.display = 'flex';
    sfx.whoosh();
  }

  function closeAddActivityModal() {
    const modal = document.getElementById('addActivityModal');
    if (modal) {
      modal.style.display = 'none';
      sfx.tap();
    }
  }

  // ============================================
  // Gemini Model Preference, Limits & Usage Monitor
  // ============================================
  function formatModelRpdBadge(modelId, todayRequests) {
    let rpd = 500;
    try {
      if (typeof aiUsageTracker !== 'undefined' && aiUsageTracker.getModelLimits) {
        const limits = aiUsageTracker.getModelLimits(modelId);
        if (limits && limits.rpd) rpd = limits.rpd;
      } else {
        const savedLimit = parseInt(localStorage.getItem('app_gemini_custom_rpd_limit'), 10);
        if (savedLimit > 0) {
          rpd = savedLimit;
        } else {
          const lower = (modelId || '').toLowerCase();
          if (lower.includes('pro')) rpd = 50;
        }
      }
    } catch (e) {}

    let req = 0;
    try {
      if (typeof todayRequests === 'number') {
        req = todayRequests;
      } else if (typeof aiUsageTracker !== 'undefined' && aiUsageTracker.getStats) {
        req = aiUsageTracker.getStats().todayRequests || 0;
      }
    } catch (e) {}

    return `(rpd ${req}/${rpd})`;
  }

  function classifyModelTier(modelId) {
    const lower = (modelId || '').toLowerCase();
    if (lower.includes('lite') || lower.includes('flash-lite')) {
      return 'lite';
    }
    if (lower.includes('flash')) {
      return 'flash';
    }
    return 'other';
  }

  function formatModelDisplayName(modelName) {
    if (modelName === 'gemini-3.8-flash') return '🧠 Gemini 3.8 Flash (Accurate Geography & Budget)';
    if (modelName === 'gemini-3.5-flash-lite') return '⚡ Gemini 3.5 Flash Lite';
    if (modelName === 'gemini-3.7-flash') return '✨ Gemini 3.7 Flash (Balanced & Multimodal)';
    if (modelName === 'gemini-3.5-flash') return '💎 Gemini 3.5 Flash (Standard)';
    if (modelName === 'gemma-4-26b-a4b-it') return '🌿 Gemma 4 26B (Open Weights MoE)';
    if (modelName === 'gemini-2.5-pro') return '🔬 Gemini 2.5 Pro (Deep Reasoning)';
    if (modelName.includes('lite')) return `⚡ ${modelName} (Fast Lite)`;
    if (modelName.includes('pro')) return `🔬 ${modelName} (Pro Reasoning)`;
    return `🤖 ${modelName}`;
  }

  function formatModelShortPill(modelName, todayRequests) {
    let base = '🤖 Model';
    if (modelName === 'gemini-3.8-flash') base = '🧠 3.8 Flash';
    else if (modelName === 'gemini-3.5-flash-lite') base = '⚡ 3.5 Lite';
    else if (modelName === 'gemini-3.7-flash') base = '✨ 3.7 Flash';
    else if (modelName === 'gemini-3.5-flash') base = '💎 3.5 Flash';
    else if (modelName === 'gemma-4-26b-a4b-it') base = '🌿 Gemma 26B';
    else if (modelName === 'gemini-2.5-pro') base = '🔬 2.5 Pro';
    else {
      const clean = (modelName || '').replace(/^gemini-/, '');
      base = `🤖 ${clean.length > 10 ? clean.substring(0, 9) + '…' : clean}`;
    }
    const rpdBadge = formatModelRpdBadge(modelName, todayRequests);
    return `${base} ${rpdBadge}`;
  }

  // Live AI Quota Limits & Daily Usage Tracker
  const aiUsageTracker = {
    getStats() {
      const today = new Date().toISOString().slice(0, 10);
      let stats = {
        todayDate: today,
        todayRequests: 0,
        todayTokens: 0,
        recentCalls: [],
        lastCall: null,
        totalRequests: 0,
        updatedAt: Date.now()
      };
      try {
        const statsKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.USAGE_STATS) ? STORAGE_KEYS.USAGE_STATS : 'app_gemini_usage_stats';
        const saved = JSON.parse(localStorage.getItem(statsKey) || '{}');
        if (saved && saved.todayDate === today) {
          stats = {
            ...stats,
            ...saved,
            recentCalls: Array.isArray(saved.recentCalls) ? saved.recentCalls : []
          };
        } else if (saved && saved.todayDate) {
          stats.totalRequests = saved.totalRequests || 0;
        }
      } catch (e) {
        console.warn('Error reading AI usage stats:', e);
      }
      const now = Date.now();
      stats.recentCalls = (stats.recentCalls || []).filter(ts => now - ts < 60000);
      return stats;
    },

    saveStats(stats) {
      try {
        stats.updatedAt = stats.updatedAt || Date.now();
        const statsKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.USAGE_STATS) ? STORAGE_KEYS.USAGE_STATS : 'app_gemini_usage_stats';
        localStorage.setItem(statsKey, JSON.stringify(stats));
        const docRef = (cloudSync && typeof cloudSync.getRoomDoc === 'function') ? cloudSync.getRoomDoc() : null;
        if (docRef) {
          const rpdLimitKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.RPD_LIMIT) ? STORAGE_KEYS.RPD_LIMIT : 'app_gemini_custom_rpd_limit';
          const customLimit = parseInt(localStorage.getItem(rpdLimitKey), 10) || 500;
          docRef.set({
            aiUsage: {
              todayDate: stats.todayDate,
              todayRequests: stats.todayRequests,
              todayTokens: stats.todayTokens,
              lastCall: stats.lastCall,
              updatedAt: stats.updatedAt,
              customRpdLimit: customLimit
            }
          }, { merge: true }).catch(() => {});
        }
      } catch (e) {
        console.warn('Error saving AI usage stats:', e);
      }
    },

    recordCall(modelName, usageMetadata) {
      const stats = this.getStats();
      stats.todayRequests = (stats.todayRequests || 0) + 1;
      stats.totalRequests = (stats.totalRequests || 0) + 1;
      stats.updatedAt = Date.now();

      const tokens = (usageMetadata && typeof usageMetadata.totalTokenCount === 'number')
        ? usageMetadata.totalTokenCount
        : 0;
      stats.todayTokens = (stats.todayTokens || 0) + tokens;

      const now = Date.now();
      stats.recentCalls = (stats.recentCalls || []).filter(ts => now - ts < 60000);
      stats.recentCalls.push(now);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const cleanModel = (modelName || 'gemini').replace(/^models\//, '');
      stats.lastCall = `${timeStr} (${cleanModel})`;

      this.saveStats(stats);
      this.updateUI();
    },

    setTodayRequests(count) {
      const num = Math.max(0, parseInt(count, 10) || 0);
      const stats = this.getStats();
      stats.todayRequests = num;
      stats.updatedAt = Date.now();
      stats.lastCall = `Calibrated to ${num} manually`;
      this.saveStats(stats);
      this.updateUI();
      if (typeof sfx !== 'undefined' && sfx.click) sfx.click();
      if (typeof showToast === 'function') showToast(`Calibrated AI usage to ${num} requests today. 🎯`);
    },

    adjustTodayRequests(delta) {
      const stats = this.getStats();
      const current = stats.todayRequests || 0;
      const next = Math.max(0, current + delta);
      this.setTodayRequests(next);
    },

    setRpdLimit(limit) {
      const num = Math.max(1, parseInt(limit, 10) || 500);
      const rpdLimitKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.RPD_LIMIT) ? STORAGE_KEYS.RPD_LIMIT : 'app_gemini_custom_rpd_limit';
      localStorage.setItem(rpdLimitKey, num);
      const docRef = (cloudSync && typeof cloudSync.getRoomDoc === 'function') ? cloudSync.getRoomDoc() : null;
      if (docRef) {
        docRef.set({
          aiRpdLimit: num
        }, { merge: true }).catch(() => {});
      }
      this.updateUI();
      if (typeof sfx !== 'undefined' && sfx.tap) sfx.tap();
      if (typeof showToast === 'function') showToast(`RPD quota tier set to ${num.toLocaleString()} requests/day.`);
    },

    resetStats() {
      const today = new Date().toISOString().slice(0, 10);
      const stats = {
        todayDate: today,
        todayRequests: 0,
        todayTokens: 0,
        recentCalls: [],
        lastCall: 'Reset just now',
        totalRequests: (this.getStats().totalRequests || 0),
        updatedAt: Date.now()
      };
      this.saveStats(stats);
      this.updateUI();
      if (typeof sfx !== 'undefined' && sfx.trash) sfx.trash();
      if (typeof showToast === 'function') showToast('AI usage counter reset for today.');
    },

    getModelLimits(modelName) {
      const modelProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_MODEL) ? STORAGE_KEYS.GEMINI_MODEL : 'app_gemini_active_model';
      const model = modelName || localStorage.getItem(modelProp) || 'gemini-3.8-flash';
      let meta = {};
      try {
        const metaProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.MODELS_META) ? STORAGE_KEYS.MODELS_META : 'app_gemini_models_meta';
        const allMeta = JSON.parse(localStorage.getItem(metaProp) || '{}');
        if (allMeta && allMeta[model]) meta = allMeta[model];
      } catch (e) {}

      const lower = (model || '').toLowerCase();
      const rpdLimitKey = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.RPD_LIMIT) ? STORAGE_KEYS.RPD_LIMIT : 'app_gemini_custom_rpd_limit';
      const savedCustomLimit = parseInt(localStorage.getItem(rpdLimitKey), 10);
      const defaultFlashRpd = (savedCustomLimit > 0) ? savedCustomLimit : 500;

      let rpd = defaultFlashRpd;
      let rpm = 15;
      let inputTokens = meta.inputTokenLimit || 1048576;
      let outputTokens = meta.outputTokenLimit || 65536;

      if (lower.includes('pro')) {
        rpm = 2;
        rpd = (savedCustomLimit && savedCustomLimit <= 100) ? savedCustomLimit : 50;
        if (!meta.inputTokenLimit) inputTokens = 1048576;
        if (!meta.outputTokenLimit) outputTokens = 65536;
      } else if (lower.includes('lite')) {
        rpm = 30;
        rpd = defaultFlashRpd;
        if (!meta.inputTokenLimit) inputTokens = 1048576;
        if (!meta.outputTokenLimit) outputTokens = 65536;
      } else if (lower.includes('gemma')) {
        rpm = 30;
        rpd = defaultFlashRpd;
        if (!meta.inputTokenLimit) inputTokens = 131072;
        if (!meta.outputTokenLimit) outputTokens = 8192;
      } else {
        rpm = 15;
        rpd = defaultFlashRpd;
      }

      return {
        rpd,
        rpm,
        inputTokens,
        outputTokens
      };
    },

    updateUI() {
      const stats = this.getStats();
      const modelProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_MODEL) ? STORAGE_KEYS.GEMINI_MODEL : 'app_gemini_active_model';
      const activeModel = localStorage.getItem(modelProp) || 'gemini-3.8-flash';
      const limits = this.getModelLimits(activeModel);

      const elTodayReq = document.getElementById('aiUsageTodayReq');
      const elRpdLimit = document.getElementById('aiUsageRpdLimit');
      const elRpmLive = document.getElementById('aiUsageRpmLive');
      const elRpmLimit = document.getElementById('aiUsageRpmLimit');
      const elProgressBar = document.getElementById('aiUsageProgressBar');
      const elTokens = document.getElementById('aiUsageTokens');
      const elLimitContext = document.getElementById('aiLimitContext');
      const elLimitOutput = document.getElementById('aiLimitOutput');
      const elLastCall = document.getElementById('aiUsageLastCall');

      if (elTodayReq) elTodayReq.textContent = (stats.todayRequests || 0).toLocaleString();
      if (elRpdLimit) elRpdLimit.textContent = limits.rpd.toLocaleString();

      const liveRpm = (stats.recentCalls || []).length;
      if (elRpmLive) elRpmLive.textContent = liveRpm;
      if (elRpmLimit) elRpmLimit.textContent = limits.rpm;

      if (elTokens) elTokens.textContent = (stats.todayTokens || 0) > 0 ? (stats.todayTokens).toLocaleString() : '0';

      if (elLimitContext) {
        elLimitContext.textContent = formatModelRpdBadge(activeModel, stats.todayRequests);
      }

      if (elLimitOutput) {
        elLimitOutput.textContent = `${limits.outputTokens.toLocaleString()} tokens`;
      }

      if (elLastCall) {
        elLastCall.textContent = stats.lastCall || 'None yet today';
      }

      if (elProgressBar) {
        const pct = limits.rpd > 0 ? Math.min(100, Math.max(1, ((stats.todayRequests || 0) / limits.rpd) * 100)) : 0;
        elProgressBar.style.width = `${pct}%`;
        if (pct > 80) {
          elProgressBar.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        } else {
          elProgressBar.style.background = 'linear-gradient(90deg, #06b6d4, #a855f7)';
        }
      }

      // Update calibration input and tier select if present
      const inputCalibrate = document.getElementById('inputCalibrateReq');
      if (inputCalibrate && document.activeElement !== inputCalibrate) {
        inputCalibrate.value = stats.todayRequests || 0;
      }

      const selectTier = document.getElementById('selectCustomRpdTier');
      if (selectTier) {
        const customLimit = parseInt(localStorage.getItem('app_gemini_custom_rpd_limit'), 10) || 500;
        if (['500', '1500', '50'].includes(String(customLimit))) {
          selectTier.value = String(customLimit);
        } else {
          selectTier.value = 'custom';
        }
      }

      // Update all option labels in selectGeminiModel with live RPD counts
      const selectEl = document.getElementById('selectGeminiModel');
      if (selectEl) {
        Array.from(selectEl.options).forEach(opt => {
          const m = opt.value;
          opt.textContent = `${formatModelDisplayName(m)} ${formatModelRpdBadge(m, stats.todayRequests)}`;
        });
      }

      // Update quick model pills on Trip & Activity modals
      const tripPill = document.getElementById('labelTripActiveModel');
      const actPill = document.getElementById('labelActActiveModel');
      const pillText = formatModelShortPill(activeModel, stats.todayRequests);
      if (tripPill) tripPill.textContent = pillText;
      if (actPill) actPill.textContent = pillText;
    }
  };

  // Periodic ticker to refresh live RPM while cloudSyncModal is open
  setInterval(() => {
    const modal = document.getElementById('cloudSyncModal');
    if (modal && modal.style.display !== 'none' && typeof aiUsageTracker !== 'undefined') {
      aiUsageTracker.updateUI();
    }
  }, 10000);

  function updateModelUI(activeModel) {
    const model = activeModel || localStorage.getItem('app_gemini_active_model') || 'gemini-3.8-flash';
    const stats = (typeof aiUsageTracker !== 'undefined' && aiUsageTracker.getStats) ? aiUsageTracker.getStats() : { todayRequests: 0 };
    const shortText = formatModelShortPill(model, stats.todayRequests);
    const tripPill = document.getElementById('labelTripActiveModel');
    const actPill = document.getElementById('labelActActiveModel');
    if (tripPill) tripPill.textContent = shortText;
    if (actPill) actPill.textContent = shortText;

    const selectEl = document.getElementById('selectGeminiModel');
    if (selectEl && selectEl.value !== model) {
      let optionExists = Array.from(selectEl.options).some(o => o.value === model);
      if (!optionExists) {
        const tier = classifyModelTier(model);
        let targetGroup = selectEl.querySelector(`optgroup[data-tier="${tier}"]`);
        if (!targetGroup) targetGroup = selectEl.querySelector('optgroup') || selectEl;
        const opt = document.createElement('option');
        opt.value = model;
        const rpdBadge = formatModelRpdBadge(model, stats.todayRequests);
        opt.textContent = `${formatModelDisplayName(model)} ${rpdBadge}`;
        targetGroup.prepend(opt);
      }
      selectEl.value = model;
    }

    const descEl = document.getElementById('modelDetailText');
    if (descEl) {
      if (model.includes('3.8') || model.includes('3.7')) {
        descEl.innerHTML = '🧠 <strong>Accurate Geography & Budget:</strong> Calibrated for Taiwan flight times and realistic NT$ costs.';
      } else if (model.includes('lite')) {
        descEl.innerHTML = '⚡ <strong>Ultra Fast / Lowest Latency:</strong> Generates within milliseconds.';
      } else {
        descEl.innerHTML = `🤖 Active model: <code>${escapeHTML(model)}</code> (synced across devices).`;
      }
    }

    if (typeof aiUsageTracker !== 'undefined') {
      aiUsageTracker.updateUI();
    }
  }

  function populateModelSelect(modelsList, modelsMetaArg) {
    const selectEl = document.getElementById('selectGeminiModel');
    if (!selectEl) return;

    let modelsMeta = modelsMetaArg;
    if (!modelsMeta) {
      try {
        modelsMeta = JSON.parse(localStorage.getItem('app_gemini_models_meta') || '{}');
      } catch (e) {
        modelsMeta = {};
      }
    }

    const currentActive = localStorage.getItem('app_gemini_active_model') || 'gemini-3.8-flash';
    const baseModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-2.5-pro', 'gemma-4-26b-a4b-it'];
    const merged = [...new Set([...(modelsList || []), ...baseModels, currentActive])];

    const stats = (typeof aiUsageTracker !== 'undefined' && aiUsageTracker.getStats) ? aiUsageTracker.getStats() : { todayRequests: 0 };

    const groups = {
      lite: [],
      flash: [],
      other: []
    };

    merged.forEach(m => {
      const tier = classifyModelTier(m);
      groups[tier].push(m);
    });

    selectEl.innerHTML = '';

    const groupDefs = [
      { key: 'lite', label: '⚡ Flash Lite (Ultra Fast / Lowest Latency)' },
      { key: 'flash', label: '🧠 Flash (High Accuracy & Balanced)' },
      { key: 'other', label: '🔬 Pro & Other Models (Deep Reasoning / Special)' }
    ];

    groupDefs.forEach(gDef => {
      const list = groups[gDef.key];
      if (list && list.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = gDef.label;
        optgroup.setAttribute('data-tier', gDef.key);
        list.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m;
          const rpdBadge = formatModelRpdBadge(m, stats.todayRequests);
          opt.textContent = `${formatModelDisplayName(m)} ${rpdBadge}`;
          if (m === currentActive) opt.selected = true;
          optgroup.appendChild(opt);
        });
        selectEl.appendChild(optgroup);
      }
    });

    selectEl.value = currentActive;
    updateModelUI(currentActive);
  }

  async function autoDetectGeminiModels(key, showFeedback = true) {
    const apiKey = key || localStorage.getItem('app_gemini_api_key') || '';
    if (!apiKey) {
      if (showFeedback) showToast('Please enter an API key first to auto-detect models.', 'warning');
      return [];
    }

    const statusEl = document.getElementById('geminiKeyStatus');
    if (statusEl && showFeedback) {
      statusEl.innerHTML = '⏳ Auto-detecting authorized models from Google ModelService...';
    }

    try {
      const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        const errMsg = data?.error?.message || `HTTP ${resp.status}`;
        if (statusEl && showFeedback) {
          statusEl.innerHTML = `❌ <strong>Detection Error (${resp.status}):</strong> ${escapeHTML(errMsg)}`;
        }
        return [];
      }

      const available = (data.models || [])
        .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => (m.name || '').replace(/^models\//, ''))
        .filter(Boolean);

      const modelsMeta = {};
      (data.models || []).forEach(m => {
        const id = (m.name || '').replace(/^models\//, '');
        if (id) {
          modelsMeta[id] = {
            displayName: m.displayName || id,
            inputTokenLimit: m.inputTokenLimit,
            outputTokenLimit: m.outputTokenLimit,
            description: m.description
          };
        }
      });

      if (available.length > 0) {
        localStorage.setItem('app_gemini_detected_models', JSON.stringify(available));
        localStorage.setItem('app_gemini_models_meta', JSON.stringify(modelsMeta));
        populateModelSelect(available, modelsMeta);
        if (statusEl && showFeedback) {
          statusEl.innerHTML = `✅ <strong>Auto-Detected ${available.length} models!</strong> Grouped by Flash Lite, Flash, and Pro/Other with context limits.`;
        }
        if (showFeedback) {
          showToast(`Auto-detected ${available.length} available Gemini models! ✨`);
          sfx.chime();
        }
      }
      return available;
    } catch (err) {
      if (statusEl && showFeedback) {
        statusEl.innerHTML = `❌ <strong>Network failed:</strong> ${escapeHTML(err.message)}`;
      }
      return [];
    }
  }

  function openCloudSyncModal() {
    const modal = document.getElementById('cloudSyncModal');
    if (modal) {
      modal.style.display = 'flex';
      sfx.whoosh();
      const input = document.getElementById('inputGeminiApiKey');
      const statusEl = document.getElementById('geminiKeyStatus');
      const savedKey = localStorage.getItem('app_gemini_api_key') || '';
      if (input) input.value = savedKey;

      // Populate detected models in select dropdown
      let detectedModels = [];
      try {
        detectedModels = JSON.parse(localStorage.getItem('app_gemini_detected_models') || '[]');
      } catch (e) {}
      let modelsMeta = null;
      try {
        modelsMeta = JSON.parse(localStorage.getItem('app_gemini_models_meta') || 'null');
      } catch (e) {}
      populateModelSelect(detectedModels, modelsMeta);

      const activeModel = localStorage.getItem('app_gemini_active_model') || 'gemini-3.8-flash';
      updateModelUI(activeModel);

      // Auto-detect models in background if key is present
      if (savedKey && detectedModels.length === 0) {
        autoDetectGeminiModels(savedKey, false);
      }

      if (typeof aiUsageTracker !== 'undefined') {
        aiUsageTracker.updateUI();
      }

      if (statusEl) {
        if (savedKey) {
          statusEl.innerHTML = `✨ <strong>Gemini API Key active.</strong> Live queries use <code>${escapeHTML(activeModel)}</code>. Tweak your model anytime above.`;
        } else {
          statusEl.textContent = 'No key entered. Currently using the free built-in local geocoding engine (0 API calls).';
        }
      }
    }
  }

  function closeCloudSyncModal() {
    const modal = document.getElementById('cloudSyncModal');
    if (modal) {
      modal.style.display = 'none';
      sfx.tap();
    }
  }

  function handleAddActivity(e) {
    e.preventDefault();
    const title = document.getElementById('formActTitle').value.trim();
    if (!title) return;

    const editId = document.getElementById('formActId') ? document.getElementById('formActId').value : '';
    const occasion = document.getElementById('formActOccasion').value;
    const budget = document.getElementById('formActBudget').value;
    const environment = document.getElementById('formActEnv').value;

    if (editId) {
      const act = state.activities.find(a => a.id === editId);
      if (act) {
        act.title = title;
        act.occasion = occasion;
        act.budget = budget;
        act.environment = environment;
        act.updatedAt = Date.now();

        saveData();
        closeAddActivityModal();
        renderActivitiesTable();
        if (state.selectedActivity && state.selectedActivity.id === act.id) {
          renderActivityCard(act);
        }
        sfx.stamp();
        showToast(`Updated "<strong>${escapeHTML(act.title)}</strong>"! ✏️`);
        return;
      }
    }

    const newAct = {
      id: 'act_' + (Date.now()),
      title,
      occasion,
      budget,
      environment,
      completed: false,
      completedAt: null,
      updatedAt: Date.now()
    };

    state.activities.unshift(newAct);
    saveData();
    closeAddActivityModal();
    renderActivitiesTable();
    renderActivityCard(newAct);
    sfx.chime();
    confetti.burst();
    showToast(`Added "<strong>${escapeHTML(newAct.title)}</strong>"! ✨`);
    e.target.reset();
  }

  function handleAddTrip(e) {
    e.preventDefault();
    const name = document.getElementById('formTripName').value.trim();
    const locationName = document.getElementById('formTripRegion').value.trim();
    if (!name) return;

    const editId = document.getElementById('formTripId').value;
    const latRaw = document.getElementById('formTripLat').value.trim();
    const lngRaw = document.getElementById('formTripLng').value.trim();
    const lat = (latRaw !== '' && !isNaN(parseFloat(latRaw))) ? parseFloat(latRaw) : 25.0;
    const rawLng = (lngRaw !== '' && !isNaN(parseFloat(lngRaw))) ? parseFloat(lngRaw) : 121.5;
    const lng = L.latLng(lat, rawLng).wrap().lng;
    const minDays = parseInt(document.getElementById('formTripMinDays').value, 10) || 2;
    const maxDays = parseInt(document.getElementById('formTripMaxDays').value, 10) || 3;

    if (minDays > maxDays) {
      sfx.errorNudge();
      alert('Minimum days cannot exceed maximum days.');
      return;
    }

    const budget = document.getElementById('formTripBudget').value;
    const costEstimate = document.getElementById('formTripCostEstimate') ? document.getElementById('formTripCostEstimate').value.trim() : '';
    const seasons = getModalTripSeasons();

    const desc = document.getElementById('formTripDesc').value.trim();
    const rawTags = document.getElementById('formTripTags') ? document.getElementById('formTripTags').value.trim() : '';
    const parsedTags = rawTags
      ? rawTags.split(/[,，]+/).map(t => t.trim().replace(/^#/, '')).filter(Boolean).map(t => `#${t}`)
      : [];

    if (editId) {
      const trip = state.trips.find(t => t.id === editId);
      if (trip) {
        trip.name = name;
        trip.locationName = locationName;
        trip.lat = lat;
        trip.lng = lng;
        trip.minDays = minDays;
        trip.maxDays = maxDays;
        trip.budget = budget;
        trip.costEstimate = costEstimate;
        trip.seasons = seasons;
        trip.description = desc;
        trip.tags = parsedTags;
        trip.updatedAt = Date.now();

        saveData();
        closeAddTripModal();
        renderMapMarkers();
        renderTripsTable();
        if (state.selectedTrip && state.selectedTrip.id === trip.id) {
          selectTrip(trip);
        }
        sfx.stamp();
        showToast(`Updated "<strong>${escapeHTML(trip.name)}</strong>"! ✏️`);
        return;
      }
    }

    const defaultCostByBudget = budget === '$'
      ? '~NT$3,000 - 8,000 /人'
      : budget === '$$'
      ? '~NT$10,000 - 25,000 /人'
      : budget === '$$$'
      ? '~NT$25,000 - 55,000 /人'
      : '~NT$65,000 - 120,000 /人';

    const newTrip = {
      id: 'trip_' + (Date.now()),
      name,
      locationName,
      lat,
      lng,
      minDays,
      maxDays,
      budget,
      costEstimate: costEstimate || defaultCostByBudget,
      seasons,
      visited: false,
      tags: parsedTags.length > 0 ? parsedTags : ['#New Spot'],
      description: desc || 'Exciting travel destination waiting to be explored!',
      updatedAt: Date.now()
    };

    state.trips.unshift(newTrip);
    saveData();
    closeAddTripModal();
    renderMapMarkers();
    renderTripsTable();
    selectTrip(newTrip);
    sfx.chime();
    confetti.burst();
    showToast(`Added "<strong>${escapeHTML(newTrip.name)}</strong>"! ✈️`);
    e.target.reset();
    setModalTripSeasons(['all']);
  }

  // =========================================================================
  // 11. Import / Export / Backup
  // =========================================================================
  function classifyActivity(title) {
    let occasion = 'dateNight';
    let budget = '$$';
    let environment = 'indoor';

    if (/看夕陽|賞花|看夜景|散步|爬山|踏青|露營|海邊|野餐|看星星|騎腳踏車|吹海風|逛公園|植物園|動物園|滑雪|賞櫻|花海|煙火|釣魚|日月潭|沙堡|騎馬|滑翔翼|農場|跑步|棒球|泥火山|摩天輪|直排輪/.test(title)) {
      environment = 'outdoor';
    } else if (/逛老街|逛夜市|傳統市場|漁港|拜拜|集章|市集/.test(title)) {
      environment = 'any';
    }

    if (/高級餐廳|米其林|飯店|渡假|泡溫泉|無菜單|SPA|郵輪|直升機|滑翔翼/.test(title)) {
      occasion = 'wholeDay';
      budget = '$$$';
    } else if (/散步|看夕陽|吹海風|逛公園|慢跑|看星星|爬山|踏青/.test(title)) {
      occasion = 'casual';
      budget = '$';
    } else if (/一日遊|露營|野餐|遊樂園|滑雪|包車|日月潭/.test(title)) {
      occasion = 'dayTrip';
      budget = '$$';
    } else if (/下午茶|早午餐|咖啡廳|吃冰|甜點|手搖/.test(title)) {
      occasion = 'short';
      budget = '$';
    }

    return { occasion, budget, environment };
  }

  function importTextLines() {
    const text = document.getElementById('txtImportArea').value.trim();
    if (!text) return;

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    const now = Date.now();
    const newItems = lines.map((title, idx) => {
      const { occasion, budget, environment } = classifyActivity(title);
      return {
        id: 'act_' + now + '_' + idx,
        title,
        occasion,
        budget,
        environment,
        completed: false,
        completedAt: null,
        updatedAt: now
      };
    });

    state.activities = [...newItems, ...state.activities];
    saveData();
    alert(`Successfully imported ${newItems.length} activities!`);
    document.getElementById('txtImportArea').value = '';
    renderActivitiesTable();
  }

  function exportJSONBackup() {
    const data = {
      activities: state.activities,
      trips: state.trips,
      deletedTripIds: Array.from(state.deletedTripIds || []),
      deletedActivityIds: Array.from(state.deletedActivityIds || []),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function importJSONBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Root must be an object');
        }
        const now = Date.now();
        if (Array.isArray(parsed.activities)) {
          state.activities = parsed.activities
            .filter(a => a && typeof a.title === 'string')
            .map(a => ({ ...a, updatedAt: a.updatedAt || now }));
        }
        if (Array.isArray(parsed.trips)) {
          state.trips = parsed.trips
            .filter(t => t && typeof t.name === 'string')
            .map(t => ({ ...t, updatedAt: t.updatedAt || now }));
        }
        if (Array.isArray(parsed.deletedTripIds)) {
          state.deletedTripIds = new Set(parsed.deletedTripIds);
        }
        if (Array.isArray(parsed.deletedActivityIds)) {
          state.deletedActivityIds = new Set(parsed.deletedActivityIds);
        }
        saveData();
        renderMapMarkers();
        renderActivitiesTable();
        renderTripsTable();

        if (state.trips.length > 0) {
          selectTrip(state.trips[0]);
        } else {
          state.selectedTrip = null;
          renderSelectedTripCard();
        }

        if (state.activities.length > 0) {
          const initialAct = getRandomActivity(true) || state.activities[0];
          renderActivityCard(initialAct);
        } else {
          state.selectedActivity = null;
        }

        alert('Backup successfully restored & synchronized!');
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      } finally {
        const fileInput = document.getElementById('fileImportJSON');
        if (fileInput) fileInput.value = '';
      }
    };
    reader.readAsText(file);
  }

  // =========================================================================
  // 12. AI Smart Assistant Engine (Gemini 2.5 Flash + OpenStreetMap Nominatim)
  // =========================================================================
  const aiEngine = {
    // Great-Circle distance formula (km) between two coordinates
    calcDistanceKm(lat1, lon1, lat2, lon2) {
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },

    // Curated high-accuracy dream landmarks & extreme geography (instant zero-latency match & polar disambiguation)
    KNOWN_LANDMARKS: [
      {
        aliases: ['北極', '北極點', '北極海', '北極圈', '北冰洋', 'north pole', 'the north pole', 'arctic', 'arctic ocean', '北极', '北极点', '北极圈'],
        spec: {
          lat: 85.0,
          lng: 0.0,
          locationName: 'Arctic Ocean / North Pole ❄️',
          minDays: 10,
          maxDays: 16,
          budget: '$$$$',
          costEstimate: '~NT$280,000 - 550,000 /人',
          seasons: ['winter', 'summer'],
          tags: ['#北極點90度', '#破冰船巡航', '#極光玻璃屋', '#無垠冰原', '#北極熊出沒', '#極致探險'],
          nameTemplates: [
            '北極頂峰極地破冰巡航與極光之約 🚢🌌',
            '北極圈夢幻冰原與午夜陽光探險 ❄️☀️',
            '北極點無垠純白世界與藍冰星空假期 ❄️✨',
            '極地破冰船漫遊與北極光玻璃屋私語 🚢❄️'
          ],
          descriptionTemplates: [
            '搭乘頂級極地破冰船航向世界頂端90度北極點，在無垠純白冰原上與最愛的人相擁舉杯，仰望躍動的夢幻極光帷幕。夜幕降臨時入住暖心探險艙，在冷冽純淨的空氣中感受遠離塵囂、屬於兩個人的純粹感動。',
            '穿梭在萬年湛藍浮冰與靜謐極地海域間，尋訪北極熊與白鯨足跡。夜宿全景極光玻璃艙，在壁爐柴火微光中共享熱湯，將世界之巔的壯闊與溫柔深印兩人心中。',
            '置身地球頂端的冰洋盡頭，在午夜永晝暖陽或燦爛星河下漫步厚實冰蓋，吹著極地純淨冷風，在天地大美前見證專屬彼此的永恆浪漫。'
          ]
        }
      },
      {
        aliases: ['南極', '南極點', '南極洲', '南極大陸', 'south pole', 'the south pole', 'antarctica', 'antarctic', '南极', '南极点', '南极洲'],
        spec: {
          lat: -82.0,
          lng: 0.0,
          locationName: 'Antarctica 🇦🇶',
          minDays: 12,
          maxDays: 18,
          budget: '$$$$',
          costEstimate: '~NT$320,000 - 620,000 /人',
          seasons: ['summer'],
          tags: ['#第七大陸', '#世界盡頭', '#國王企鵝', '#德瑞克海峽', '#藍冰露營', '#白色大陸'],
          nameTemplates: [
            '南極冰川巡航與企鵝王國世界盡頭之旅 🐧❄️',
            '南極半島極地探險與夢幻藍冰露營 🇦🇶',
            '航向第七大陸：南極冰海與純白世界誓言 🚢❄️',
            '世界盡頭冰原漫步與南十字星空之約 🌌🐧'
          ],
          descriptionTemplates: [
            '穿越傳奇德瑞克海峽登上白色第七大陸，在成千上萬可愛企鵝圍繞下漫步冰原，在靜謐藍色冰山前許下世界盡頭的永恆誓言。夜晚在零下純淨空氣中相伴依偎，仰望浩瀚無垠的南十字星空。',
            '划著探險獨木舟穿行於幽藍巨大冰山裂隙間，聆聽浮冰碎裂清脆聲響與鯨魚噴氣音。夜宿雪地專屬帳篷，體驗一生一次世界盡頭的極致靜謐與心動。'
          ]
        }
      },
      {
        aliases: ['聖誕老人村', '羅瓦涅米', '拉普蘭', '芬蘭聖誕老人村', 'rovaniemi', 'lapland', 'santa claus village'],
        spec: {
          lat: 66.5436,
          lng: 25.8473,
          locationName: 'Lapland, Finland 🇫🇮',
          minDays: 7,
          maxDays: 10,
          budget: '$$$$',
          costEstimate: '~NT$90,000 - 150,000 /人',
          seasons: ['winter'],
          tags: ['#聖誕老人村', '#北極圈跨線', '#極光玻璃屋', '#馴鹿雪橇', '#哈士奇拉雪橇'],
          nameTemplates: [
            '芬蘭聖誕老人村童話與極光玻璃屋假期 🎅✨',
            '拉普蘭雪國馴鹿漫步與北極圈極光之約 🦌🌌',
            '羅瓦涅米純白童話森林與夢幻雪橇漫遊 ❄️🌲'
          ],
          descriptionTemplates: [
            '跨越北極圈緯度線造訪聖誕老人辦公室寄出心願明信片，搭乘馴鹿雪橇穿越靜謐積雪黑森林。夜晚躺在恆溫全景玻璃屋中，牽手等待綠色極光如彩帶般在夜空輕盈舞動。'
          ]
        }
      },
      {
        aliases: ['格陵蘭', '格陵蘭島', '伊盧利薩特', 'greenland', 'ilulissat'],
        spec: {
          lat: 69.2198,
          lng: -51.0986,
          locationName: 'Ilulissat, Greenland 🇬🇱',
          minDays: 8,
          maxDays: 12,
          budget: '$$$$',
          costEstimate: '~NT$120,000 - 180,000 /人',
          seasons: ['summer', 'winter'],
          tags: ['#伊盧利薩特冰峽灣', '#彩色小木屋', '#萬年藍冰', '#狗拉雪橇', '#午夜太陽'],
          nameTemplates: [
            '格陵蘭冰峽灣壯闊巡航與彩色木屋漫遊 🇬🇱🧊',
            '伊盧利薩特萬年巨型浮冰與純白極地秘境 ❄️✨'
          ],
          descriptionTemplates: [
            '漫步於世界自然遺產伊盧利薩特冰峽灣木棧道，俯瞰數十公尺高的蔚藍浮冰在海面靜靜漂移。在繽紛彩色木屋前喝一杯熱巧克力，感受世界邊緣最純淨空靈的兩人時光。'
          ]
        }
      },
      {
        aliases: ['馬爾地夫', '馬爾代夫', 'maldives'],
        spec: {
          lat: 3.2028,
          lng: 73.2207,
          locationName: 'Maldives 🇲🇻',
          minDays: 5,
          maxDays: 8,
          budget: '$$$$',
          costEstimate: '~NT$85,000 - 160,000 /人',
          seasons: ['winter', 'spring', 'all'],
          tags: ['#水上Villa', '#玻璃海', '#漂浮早餐', '#魔鬼氈浮潛', '#私人沙灘夕陽'],
          nameTemplates: [
            '馬爾地夫水上Villa與果凍海落日微醺之行 🇲🇻🏝️',
            '馬爾地夫蔚藍珊瑚海與無邊星空蜜月假期 🌊🍹',
            '印度洋珍珠島嶼：無邊際海景與雙人放空之旅 🏝️✨'
          ],
          descriptionTemplates: [
            '推開水上Villa落地窗直接躍入果凍般透明的印度洋潟湖，與熱帶魚和溫柔魟魚同游。黃昏在無邊際泳池享用香檳與雙人燭光晚餐，在滿天星斗下聆聽微波拍岸的輕柔催眠曲。'
          ]
        }
      },
      {
        aliases: ['夏威夷', 'hawaii', 'oahu', 'honolulu', '檀香山'],
        spec: {
          lat: 21.3069,
          lng: -157.8583,
          locationName: 'Hawaii, USA 🇺🇸',
          minDays: 6,
          maxDays: 9,
          budget: '$$$$',
          costEstimate: '~NT$75,000 - 120,000 /人',
          seasons: ['all', 'summer'],
          tags: ['#威基基海灘', '#鑽石頭山日出', '#恐龍灣浮潛', '#阿囉哈熱情', '#海邊落日晚餐'],
          nameTemplates: [
            '夏威夷威基基海灘漫步與落日微風公路巡禮 🌺🚗',
            '夏威夷蔚藍浪花衝浪與火山星空浪漫漫遊 🏝️✨'
          ],
          descriptionTemplates: [
            '沿著歐胡島絕美海岸線敞篷自駕，在鑽石頭山頂俯瞰太平洋無垠蔚藍與威基基金色沙灘。傍晚戴上海島花圈伴著烏克麗麗琴聲漫步海邊，在橘紅色晚霞裡感受最溫暖的Aloha愛意。'
          ]
        }
      },
      {
        aliases: ['富士山', '河口湖', 'mount fuji', 'mt fuji'],
        spec: {
          lat: 35.3606,
          lng: 138.7274,
          locationName: 'Mount Fuji & Lake Kawaguchi, Japan 🇯🇵',
          minDays: 3,
          maxDays: 5,
          budget: '$$$',
          costEstimate: '~NT$32,000 - 52,000 /人',
          seasons: ['autumn', 'spring', 'winter'],
          tags: ['#河口湖逆富士', '#露天溫泉飯店', '#楓葉迴廊', '#富士急樂園', '#芝櫻季'],
          nameTemplates: [
            '河口湖富士山晨曦倒影與露天溫泉漫遊 🗻♨️',
            '富士山麓四季花海與日式溫泉旅宿巡禮 🌸🗻'
          ],
          descriptionTemplates: [
            '清晨在河口湖畔露台遠眺初升朝陽染紅富士山雪頂，在如鏡水面上捕捉珍貴的逆富士奇景。夜宿純日式溫泉旅館享用精緻懷石料理，在熱氣氤氳的露天風呂中相擁放鬆。'
          ]
        }
      },
      {
        aliases: ['黃石公園', '黃石國家公園', 'yellowstone'],
        spec: {
          lat: 44.4280,
          lng: -110.5885,
          locationName: 'Yellowstone National Park, USA 🇺🇸',
          minDays: 6,
          maxDays: 9,
          budget: '$$$$',
          costEstimate: '~NT$85,000 - 140,000 /人',
          seasons: ['summer', 'autumn'],
          tags: ['#大稜鏡溫泉', '#老忠實間歇泉', '#野生美洲野牛', '#峽谷瀑布', '#星空露營'],
          nameTemplates: [
            '黃石公園大稜鏡七彩溫泉與壯麗峽谷自駕探險 🦬🌈',
            '黃石國家公園野生曠野與間歇泉奇觀漫遊 🌲✨'
          ],
          descriptionTemplates: [
            '自駕穿越壯闊的原野森林，在彩虹般絢爛的大稜鏡溫泉前驚嘆大自然的奇蹟調色盤。黃昏在草原邊緣靜靜等待野牛群踏著暮色踱步，仰望無光害的浩瀚銀河沉醉天地浩瀚。'
          ]
        }
      },
      {
        aliases: ['馬丘比丘', '印加古道', 'machu picchu'],
        spec: {
          lat: -13.1631,
          lng: -72.5450,
          locationName: 'Machu Picchu, Peru 🇵🇪',
          minDays: 8,
          maxDays: 12,
          budget: '$$$$',
          costEstimate: '~NT$110,000 - 180,000 /人',
          seasons: ['summer', 'spring', 'autumn'],
          tags: ['#天空之城', '#印加失落之城', '#全景景觀火車', '#庫斯科古城', '#草泥馬同框'],
          nameTemplates: [
            '秘魯馬丘比丘天空之城與印加古道神秘探秘 🇵🇪🦙',
            '庫斯科高山古城與馬丘比丘晨曦雲海巡禮 ⛰️✨'
          ],
          descriptionTemplates: [
            '搭乘全景玻璃景觀火車穿過安地斯山脈奔騰河谷，清晨登上馬丘比丘石砌露台，看晨霧散去展現壯麗的天空之城。在可愛羊駝好奇圍繞下並肩前行，感受古老文明的神秘與震撼。'
          ]
        }
      },
      {
        aliases: ['天空之鏡', '烏尤尼鹽沼', '烏尤尼', 'uyuni', 'salar de uyuni'],
        spec: {
          lat: -20.1338,
          lng: -67.4891,
          locationName: 'Salar de Uyuni, Bolivia 🇧🇴',
          minDays: 7,
          maxDays: 10,
          budget: '$$$$',
          costEstimate: '~NT$120,000 - 190,000 /人',
          seasons: ['winter', 'spring'],
          tags: ['#天空之鏡', '#極致星空倒影', '#鹽晶旅館', '#仙人掌島', '#日落倒影'],
          nameTemplates: [
            '玻利維亞烏尤尼天空之鏡與浩瀚星河倒影之夜 🇧🇴🌌',
            '純白萬里鹽沼與夢幻天空之鏡日落巡航 🪞✨'
          ],
          descriptionTemplates: [
            '站在水天相連的無邊白色鏡面上，黃昏時分看漫天晚霞如畫筆般倒映於腳下，彷彿置身雲端漫步。深夜仰望無邊星空與腳底銀河融為一體，在天地倒影裡許下最深刻的浪漫回憶。'
          ]
        }
      },
      {
        aliases: ['聖托里尼', '伊亞', '費拉', 'santorini', 'oia'],
        spec: {
          lat: 36.3932,
          lng: 25.4615,
          locationName: 'Santorini, Greece 🇬🇷',
          minDays: 5,
          maxDays: 8,
          budget: '$$$$',
          costEstimate: '~NT$85,000 - 145,000 /人',
          seasons: ['spring', 'summer', 'autumn'],
          tags: ['#藍頂教堂', '#伊亞世界最美夕陽', '#白雪洞穴屋', '#愛琴海藍', '#懸崖泳池'],
          nameTemplates: [
            '聖托里尼藍頂教堂與伊亞世界最美落日假期 🇬🇷🌅',
            '愛琴海純白懸崖洞穴屋與無邊海景微醺之約 🍷🌊'
          ],
          descriptionTemplates: [
            '穿梭在愛琴海峭壁上如糖霜般潔白的洞穴小屋與湛藍圓頂教堂之間，空氣中瀰漫著九重葛花香與海風。黃昏在伊亞懸崖露台端起白葡萄酒，並肩凝視被譽為全球最美的金色夕陽沉入海平面。'
          ]
        }
      },
      {
        aliases: ['威尼斯', '威尼斯運河', 'venice', 'venezia'],
        spec: {
          lat: 45.4408,
          lng: 12.3155,
          locationName: 'Venice, Italy 🇮🇹',
          minDays: 4,
          maxDays: 6,
          budget: '$$$$',
          costEstimate: '~NT$75,000 - 120,000 /人',
          seasons: ['spring', 'autumn'],
          tags: ['#貢多拉遊船', '#聖馬可廣場', '#嘆息橋', '#彩色島Burano', '#水都迷宮'],
          nameTemplates: [
            '威尼斯水都貢多拉浪漫穿梭與聖馬可廣場微醺 🛶🎭',
            '水上之都運河迷宮與彩色島童話石板漫遊 🇮🇹✨'
          ],
          descriptionTemplates: [
            '並肩乘著優雅的黑色貢多拉划過靜謐古老水巷，在船夫悠揚歌聲中穿過一座座石拱橋與水中倒影。黃昏漫步至聖馬可廣場露天咖啡座聆聽古典樂合奏，在微光水波映照中沈醉於水都柔情。'
          ]
        }
      },
      {
        aliases: ['杜拜', 'dubai'],
        spec: {
          lat: 25.2048,
          lng: 55.2708,
          locationName: 'Dubai, UAE 🇦🇪',
          minDays: 4,
          maxDays: 6,
          budget: '$$$$',
          costEstimate: '~NT$65,000 - 110,000 /人',
          seasons: ['winter', 'spring', 'autumn'],
          tags: ['#哈里發塔', '#金色沙漠衝沙', '#未來博物館', '#帆船飯店', '#噴泉水舞秀'],
          nameTemplates: [
            '杜拜哈里發塔天際奇蹟與金色沙漠星空營火之夜 🇦🇪🐪',
            '未來建築美學與海灣帆船酒店奢華漫遊 ✨🏙️'
          ],
          descriptionTemplates: [
            '登上世界第一高樓哈里發塔俯瞰現代阿拉伯海灣的奢華天際線與璀璨水舞秀。黃昏乘四驅車馳騁於金色沙丘體驗刺激衝沙，夜晚在沙漠營火與貝都因帳篷下品味香濃咖啡與漫天繁星。'
          ]
        }
      }
    ],

    findKnownLandmark(query) {
      const norm = query.toLowerCase().replace(/[\s\-_,，。！？!]/g, '');
      if (!norm) return null;
      for (const item of this.KNOWN_LANDMARKS) {
        if (item.aliases.some(a => {
          const aNorm = a.toLowerCase().replace(/[\s\-_,，。！？!]/g, '');
          return norm === aNorm || (aNorm.length >= 2 && norm.includes(aNorm));
        })) {
          return item.spec;
        }
      }
      return null;
    },

    async geocodeNominatim(place) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&accept-language=en,zh-TW,zh&q=${encodeURIComponent(place)}`;
      const resp = await fetch(url, {
        headers: { 'Accept': 'application/json' }
      });
      if (!resp.ok) throw new Error('Geocoding service unavailable');
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error(`Location "${place}" not found on map.`);
      }

      let best = data[0];
      let lat = parseFloat(best.lat);
      let lng = parseFloat(best.lon);
      let displayName = best.display_name;

      // Polar & Extreme Geography Safety Guard
      if (/北極|north\s*pole|arctic/i.test(place)) {
        if (lat < 65) {
          lat = 85.0;
          lng = 0.0;
          displayName = 'Arctic Ocean / North Pole ❄️';
        }
      } else if (/南極|south\s*pole|antarctica/i.test(place)) {
        if (lat > -60) {
          lat = -82.0;
          lng = 0.0;
          displayName = 'Antarctica 🇦🇶';
        }
      }

      return {
        lat: Math.max(-85.0, Math.min(85.0, lat)),
        lng: Math.max(-180.0, Math.min(180.0, lng)),
        displayName
      };
    },

    detectTheme(query, locationName) {
      const text = `${query} ${locationName}`.toLowerCase();
      if (/北極|南極|極地|格陵蘭|冰島|挪威|哈爾濱|雪|滑雪|冰川|極光|破冰|snow|ski|aurora|arctic|antarctic|glacier/i.test(text)) {
        return 'polar';
      }
      if (/沖繩|澎湖|綠島|蘭嶼|小琉球|墾丁|峇里島|巴厘島|普吉島|蘇美島|長灘島|馬爾地夫|夏威夷|關島|塞席爾|帛琉|宿霧|海|沙灘|島|浮潛|潛水|珊瑚|浪|beach|island|ocean|surf|dive/i.test(text)) {
        return 'beach';
      }
      if (/阿里山|杉林溪|太平山|清境|日月潭|太魯閣|陽明山|瑞士|少女峰|洛磯山脈|班夫|優勝美地|黃石|山|峰|峽谷|森林|步道|神木|瀑布|湖|露營|mountain|lake|canyon|alpine|forest|trail/i.test(text)) {
        return 'mountain';
      }
      if (/法國|巴黎|義大利|羅馬|威尼斯|佛羅倫斯|英國|倫敦|奧地利|維也納|捷克|布拉格|希臘|聖托里尼|西班牙|巴塞隆納|葡萄牙|里斯本|歐洲|古堡|塞納河|europe|france|paris|italy|venice|greece|spain|london/i.test(text)) {
        return 'european';
      }
      if (/日本|京都|奈良|金澤|淺草|鎌倉|首爾|北村|台南|鹿港|大稻埕|九份|老街|古都|古蹟|寺|宮殿|抹茶|溫泉|懷舊|japan|kyoto|korea|seoul|taiwan/i.test(text)) {
        return 'eastAsian';
      }
      if (/東京|紐約|曼哈頓|香港|新加坡|芝加哥|雪梨|上海|台北|信義區|天際線|夜景|摩登|都會|酒吧|百貨|skyline|city|manhattan|new york|tokyo|sydney/i.test(text)) {
        return 'metropolis';
      }
      return 'universal';
    },

    generateCreativeTripTitle(place, theme, flagEmoji) {
      let core = place.replace(/[0-9\-_,，。！？!]/g, '').trim();
      if (core.length > 4) {
        core = core.replace(/(風景區|國家公園|渡假區|景區|觀光區|特區|旅遊區|之旅|旅行)$/g, '');
      }

      const collections = {
        polar: [
          `${core}極地破冰巡航與極光玻璃屋之約 🚢🌌`,
          `${core}純白雪景童話與雪見露天溫泉假期 ❄️♨️`,
          `${core}萬年藍冰洞探訪與夢幻雪原漫遊 ❄️✨`,
          `${core}午夜陽光與極光之吻冰原冒險 🧊☀️`,
          `${core}銀白世界漫步與壁爐暖心夜曲 ❄️🍷`
        ],
        beach: [
          `${core}蔚藍玻璃海跳島與落日微醺之行 🏝️🍹`,
          `${core}果凍海海龜共游與無邊際Villa假期 🌊🐢`,
          `${core}海風微醺公路自駕與金黃晚霞漫步 🚗🌅`,
          `${core}細白沙灘漫步與星空浪花慢漫遊 🏝️✨`,
          `${core}珊瑚礁秘境浮潛與海景落日巡禮 🐠🍹`
        ],
        mountain: [
          `${core}高山森林鐵道與浩瀚雲海晨曦之約 🌲🚂`,
          `${core}壯闊峽谷探訪與湖畔隱世慢活之旅 🏔️🌿`,
          `${core}巨木芬多精健行與星空露營假期 🏕️🌌`,
          `${core}山林溪流深呼吸與私房秘境散策 🍃✨`,
          `${core}翠綠縱谷公路奔馳與溫泉療癒行 🚗♨️`
        ],
        european: [
          `${core}塞納河畔藝術巡禮與石階左岸漫步 ☕🎨`,
          `${core}中世紀古堡漫步與湖光山色童話假期 🏰✨`,
          `${core}石板巷弄黃昏散策與微醺酒莊之約 🍷🏛️`,
          `${core}百年運河水波漫遊與文藝復興巡禮 🛶✨`,
          `${core}露天咖啡座午後小憩與浪漫街角探尋 ☕🥐`
        ],
        eastAsian: [
          `${core}古都石板巷弄慢步與在地私房美饌 🏮🍵`,
          `${core}百年日式官舍漫步與抹茶庭園散策 🍵🌸`,
          `${core}文創老街手作尋幽與燈海夜市漫遊 🎨🏮`,
          `${core}晨光古寺巡禮與隱密茶席悠閒時光 🌿🏮`,
          `${core}懷舊木造町家與米其林私廚約會 🥢✨`
        ],
        metropolis: [
          `${core}璀璨天際線夜景與頂樓酒吧微醺之約 🌃🍸`,
          `${core}當代建築美學與特色風格選物散策 ✨☕`,
          `${core}海港繁華夜色與浪漫景觀餐廳盛宴 🥂🏙️`,
          `${core}現代都市漫步與街角藝文探索之旅 🏙️💫`,
          `${core}摩登天際光影與雙人漫遊地圖 🌃✨`
        ],
        universal: [
          `${core}雙人專屬慢步調與秘境風光巡禮 ✨`,
          `${core}山海美景探訪與心動雙人微旅行 🌿`,
          `${core}療癒私房景點與慢活甜點漫遊地圖 🍰💫`,
          `${core}悠閒自在步調與溫暖回憶假期 🍃`,
          `${core}甜蜜兩人世界與浪漫私房地圖 💫`
        ]
      };

      const list = collections[theme] || collections.universal;
      const picked = list[Math.floor(Math.random() * list.length)];
      if (flagEmoji && flagEmoji !== '✈️' && !picked.includes(flagEmoji)) {
        return `${picked} ${flagEmoji}`;
      }
      return picked;
    },

    generateCreativeTripDescription(place, theme) {
      const openers = {
        polar: [
          `在無垠純白世界與晶瑩剔透的極地空氣中，與最愛的人手牽手並肩前行，感受萬年冰川與冷冽天地裡的純粹寧靜。`,
          `遠離喧囂置身極淨壯麗的冰原天地，踏著柔軟白雪聆聽極光在夜空低語，沉浸在天地最純淨空靈的氛圍裡。`,
          `穿梭在銀裝素裹的純白童話國度，呵出一口白霧握緊彼此微溫的手掌，將眼前的冰霜奇景化作永恆。`,
          `搭乘靜音破冰遊船緩緩穿行於浮冰峽灣間，捧著冒著白煙的熱可可，屏息凝望兩岸冰封的壯麗峭壁。`,
          `清晨在木屋窗畔被初升朝陽映照的粉金雪景喚醒，穿上防寒雪靴踩出兩人專屬的咯吱踏雪腳印。`
        ],
        beach: [
          `迎著帶有鹹甜海潮氣息的溫暖微風與拍岸浪濤聲，赤足漫步在綿延細軟的沙灘上，捕捉夕陽漸層沉入蔚藍海面的魔幻時刻。`,
          `在果凍般清澈透明的漸層湛藍海水中浮潛，看熱帶魚群在五彩珊瑚間輕快穿梭，享受最舒心愜意的海島時光。`,
          `開著車沿著無敵海景公路隨性奔馳，吹著微熱海風看浪花拍打礁岩，在橘粉色晚霞映照下感受島嶼悠緩步調。`,
          `午後在搖曳椰影下並肩躺在純白吊床上，聽著微風拂動棕櫚葉與陣陣海浪聲，享受毫無催促的慵懶放空。`,
          `清晨迎著初醒海平線的微光騎著單車沿海漫遊，在鹹涼晨風中深呼吸，感受海島剛剛甦醒的清新純淨。`
        ],
        mountain: [
          `走入被晨曦薄霧與高山芬多精環繞的幽靜山林，踩著松針小徑聆聽林梢風聲與遠處潺潺流水。`,
          `開車穿梭在壯闊的山巒與蓊鬱森林公路，迎著撲面而來的清涼山風，感受遠離塵囂的開闊與寧靜。`,
          `站在俯瞰整座山谷的懸崖觀景台，看遠方群山在雲海翻騰間若隱若現，感受大自然帶來的無限療癒。`,
          `乘著復古高山鐵道穿過蒼翠針葉林與飛瀑深谷，在木造車廂窗前肩並肩凝視大自然的鬼斧神工。`,
          `走上鋪滿落葉的森林木棧步道，陽光透過樹冠灑下斑駁金光，在鳥鳴清脆處停下腳步分享彼此微笑。`
        ],
        european: [
          `牽手穿梭在典雅古典建築與石板小巷之間，在街角露天咖啡座聞著烘焙麵包與濃縮咖啡香氣悠閒消磨午後。`,
          `漫步於歷史悠久的石造拱橋與古老廣場，在街頭藝人悠揚琴聲中駐足，細細品味老城獨有的浪漫底蘊。`,
          `黃昏搭乘遊船掠過兩岸華麗的古堡與教堂尖頂，看金色餘暉灑落水面，把整座城市的優雅溫柔深印心底。`,
          `穿梭於古老拱廊街區的二手黑膠店與文藝小書店，在撲鼻的紙頁香與復古氛圍中找尋彼此喜愛的小驚喜。`,
          `晨光熹微中漫步於靜謐河畔舊書攤前，在教堂鐘聲伴隨下分享剛出爐的酥脆可頌與熱拿鐵。`
        ],
        eastAsian: [
          `穿梭於古色古香的木造老宅與紅燈籠照耀的石板街弄，在撲鼻的在地小吃香氣與茶香中找尋隱密私房角落。`,
          `漫步在綠意盎然的日式庭園與百年古蹟迴廊，在微風拂動樹影的婆娑聲中找回專屬兩人的安寧與從容。`,
          `踩著悠閒腳步走進充滿文創活力的人文聚落，在特色小店與手作工坊裡發掘驚喜，細品歲月沉澱的美好。`,
          `午後鑽進掛著亞麻暖簾的木造町家咖啡館，在焙茶與抹茶甜點的濃醇香氣中享受靜謐時光。`,
          `迎著徐徐晚風騎單車沿著柳樹垂蔭的河堤漫遊，看水面波光粼粼與對岸民居漸次亮起的溫暖燈火。`
        ],
        metropolis: [
          `並肩穿梭在充滿摩登活力的繁華街區，在當代建築美學與隱密設計選品店間探索城市的獨特魅力。`,
          `在璀璨流動的城市夜色與霓虹光影下漫步，感受都會特有的節奏感，並在街角小酒館享受專屬兩人的私密時光。`,
          `搭乘地鐵穿梭在摩登大樓與文青小區之間，用雙腳丈量這座城市的每一面精彩，留下滿滿心動足跡。`,
          `雨後的城市街道倒映著繽紛霓虹，牽手走進充滿黑膠樂聲的地下隱密酒吧，感受都會微醺的迷人節奏。`,
          `清晨漫步於摩天大樓腳下的林蔭大道與當代美術館，在挑高玻璃帷幕的天光下共度藝文早晨。`
        ],
        universal: [
          `以專屬兩人的自在步調慢行於心動風景之間，發掘沿途隱藏的秘境角落與在地私房美味。`,
          `牽著彼此的手探訪這座充滿故事的迷人地方，在每一個駐足凝望的瞬間相視微笑，享受毫無催促的純粹假期。`,
          `放下日常繁瑣與喧囂，在宜人景色與舒適氛圍中慢慢散步，感受專屬彼此最真實的溫暖與陪伴。`,
          `沿著蜿蜒的小路探訪不期而遇的絕美風景，在充滿驚喜的轉角記錄下兩人最自然真摯的開朗笑顏。`,
          `清晨伴隨清新的微風展開屬於彼此的慢旅地圖，在不設限的探索中發現這座城鎮獨有的溫潤底蘊。`
        ]
      };

      const closers = {
        polar: [
          `夜幕降臨時入住暖心景觀旅宿，在壁爐柴火微光中共享熱湯或熱紅酒，仰望窗外跳動的夢幻極光與璀璨星河。`,
          `夜宿溫暖極地玻璃艙，在零下世界裡相擁入眠，將這份屬於兩個人的極致純粹刻印進生命記憶。`,
          `在熱氣氤氳的露天溫泉中洗去寒意，抬頭凝視漫天飛雪與無邊夜空，在心底許下相伴一生的溫暖誓言。`,
          `深夜圍坐在暖和的原木桌前手捧熱湯談心，窗外繁星如鑽石般在黑夜中閃爍，時間彷彿在此靜止。`,
          `在暖暖的北歐羽絨被裡相擁醒來，推開窗門迎接無光害純白大地上的第一縷淡金色日光。`
        ],
        beach: [
          `午後在海景無邊際泳池畔輕啜熱帶特調，夜晚伴著海潮低語沉醉於專屬兩人的浪漫放空時光。`,
          `黃昏並肩坐在沙灘上看夕陽染紅整片天空，在微醺夜風中聽著海浪輕拍，把這一刻的溫柔永遠留存。`,
          `入夜後造訪海邊露天小酒吧聽著現場爵士樂，在星光與燭光交織的氛圍中相視微笑、輕碰酒杯。`,
          `赤足走過退潮時泛著月光的淺灘，抬頭看漫天璀璨南十字星，將海潮的溫柔低語深藏心底。`,
          `在靠海的露台小餐館共享現烤海鮮晚餐，海風輕拂髮梢，在微醺歡笑中度過最愜意的島嶼之夜。`
        ],
        mountain: [
          `清晨在木屋露台端著熱咖啡迎接翻騰雲海間的第一道金色曙光，在天地大美前相擁許下甜蜜諾言。`,
          `夜幕降臨時圍坐在溫暖的營火旁烤棉花糖、仰望滿天星斗，在無光害的浩瀚銀河下分享彼此心聲。`,
          `在隱蔽山間溫泉湯屋中舒緩身心，聽窗外蟲鳴鳥叫與林風輕拂，享受專屬兩人的靜謐天地。`,
          `入夜後在原木山莊壁爐前蓋著毛毯輕聲交談，窗外松林在微涼夜風中輕吟，安謐得令人沉醉。`,
          `傍晚在觀景平台看夕陽將遠方山巒染成紫金色晚霞，在天地遼闊間感受彼此手心傳來的踏實暖意。`
        ],
        european: [
          `黃昏搭乘遊船仰望微光點綴的歷史古橋與金色夕陽，夜宿百年古典旅店，把整座城市的浪漫與溫柔收進雙人旅行記憶。`,
          `夜晚在隱密燭光餐酒館品嚐地道佳餚與陳年紅酒，在悠揚小提琴聲中度過最難忘的微醺夜晚。`,
          `清晨漫步在晨光灑落的古老石階上互拍照片，在飄散牛角可頌香氣的小店展開美好的一天。`,
          `暮色降臨時坐在街角小酒館的紅色露天椅上，看路燈一盞盞亮起，把微醺的幸福感寫入雙人回憶。`,
          `夜宿俯瞰古城紅瓦屋頂的復古閣樓，在微涼夜風與街角悠遠手風琴樂音中，溫柔相擁入眠。`
        ],
        eastAsian: [
          `午後在靜謐庭院共享一壺溫熱好茶與精緻甜食，在從容悠緩的時光流轉裡享受最平凡也最深切的陪伴。`,
          `夜晚漫步至燈火溫暖的特色夜市大快朵頤，在熱鬧人煙中牽緊雙手，收穫舌尖與心靈的雙重滿足。`,
          `入住日式溫泉榻榻米旅宿享用豐盛會席料理，在榻榻米清香與溫暖泉水中徹底療癒身心。`,
          `黃昏在老街街角的木作小茶館依窗而坐，看燈籠在漸暗暮色中映照水面，在茶香裊裊中分享心事。`,
          `深夜踩著木屐在石板小徑散步回旅宿，晚風沁涼、星空澄澈，把這份歲月靜好的溫柔化作心靈養分。`
        ],
        metropolis: [
          `入夜後登上高空景觀酒吧在爵士樂聲中輕碰酒杯，俯瞰腳下如銀河般鋪展的璀璨天際線，沉醉於微醺浪漫夜色。`,
          `夜晚在米其林私廚餐館共享精緻盛宴，在落地窗外的萬家燈火映襯下，慶祝屬於兩人的美好時光。`,
          `在街區特色甜點店享受招牌舒芙蕾與手沖咖啡，在繁華與優雅並存的都市角落留下最甜蜜的合照。`,
          `深夜鑽進老巷裡的深夜食堂共享一碗熱騰騰拉麵，在溫暖的氤氳白煙與喧囂人聲中牽緊彼此雙手。`,
          `漫步在燈火漸稀的河濱景觀步道，夜風輕拂微涼，在璀璨大橋倒影下輕聲許下未來更多的浪漫約定。`
        ],
        universal: [
          `在沿途美景與在地道地美食中慢嚐生活滋味，把每一刻平凡又溫暖的笑容，化作彼此心中最珍貴的甜蜜回憶。`,
          `迎著徐徐微風漫談未來憧憬，在專屬兩人的自在步調中，重新遇見生活最美好的心動模樣。`,
          `在每一處風景前記錄兩人的甜蜜身影，把這些溫暖細碎的片刻，細心珍藏成往後歲月中最值得回味的篇章。`,
          `黃昏在景觀餐廳的露天座並肩品味當地特色晚餐，在霞光漸暗的溫柔時刻裡舉杯慶祝相伴時光。`,
          `在靜謐的夜宿空間裡洗去旅途疲憊，互相分享手機裡拍下的心動照片，在甜蜜滿足中相擁入眠。`
        ]
      };

      const oList = openers[theme] || openers.universal;
      const cList = closers[theme] || closers.universal;
      const opener = oList[Math.floor(Math.random() * oList.length)];
      const closer = cList[Math.floor(Math.random() * cList.length)];

      return `${opener} ${closer}`;
    },

    generateThematicTags(cleanWord, theme, seasons, budget, distKm) {
      const themeTags = {
        polar: ['#極光玻璃屋', '#萬年藍冰', '#雪國童話', '#破冰巡航'],
        beach: ['#玻璃海', '#海景Villa', '#落日微醺', '#珊瑚浮潛'],
        mountain: ['#雲海日出', '#森林芬多精', '#高山鐵道', '#星空露營'],
        european: ['#百年古堡', '#左岸咖啡', '#塞納河遊船', '#古都巡禮'],
        eastAsian: ['#古都散策', '#老街尋幽', '#在地私房美饌', '#和風茶席'],
        metropolis: ['#璀璨夜景', '#天際酒吧', '#米其林摘星', '#藝文散步'],
        universal: ['#秘境探索', '#心動旅程', '#雙人漫步', '#浪漫時光']
      };

      const pool = themeTags[theme] || themeTags.universal;
      const pickedTags = pool.slice(0, 2);
      return [
        `#${cleanWord}`,
        ...pickedTags,
        distKm < 400 ? '#島內放風' : '#異國巡禮',
        budget === '$$$$' ? '#極致夢想' : budget === '$$$' ? '#度假時光' : '#說走就走',
        '#雙人記憶'
      ];
    },

    getServerlessEndpoint() {
      const host = (typeof window !== 'undefined' && window.location && window.location.hostname) || '';
      if (host.endsWith('web.app') || host.endsWith('firebaseapp.com')) {
        return '/api/aiGenerate';
      }
      return 'https://us-central1-couplelist-71b7a.cloudfunctions.net/aiGenerate';
    },

    getGeminiApiKey() {
      const keyProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_KEY) ? STORAGE_KEYS.GEMINI_KEY : 'app_gemini_api_key';
      return (
        localStorage.getItem(keyProp) ||
        localStorage.getItem('app_gemini_api_key') ||
        (typeof window !== 'undefined' && window.GEMINI_API_KEY) ||
        ''
      ).trim();
    },

    lastGeminiError: null,

    async callGeminiDirect(prompt, customModels) {
      const apiKey = this.getGeminiApiKey();
      if (!apiKey) {
        this.lastGeminiError = 'No Gemini API key set (enter in ☁️ Sync or Firebase).';
        return null;
      }

      // Check for user-selected model preference or verified model
      const modelProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_MODEL) ? STORAGE_KEYS.GEMINI_MODEL : 'app_gemini_active_model';
      const cachedModel = localStorage.getItem(modelProp) || localStorage.getItem('app_gemini_active_model') || 'gemini-3.8-flash';
      const candidateModels = customModels || [
        cachedModel,
        'gemini-3.8-flash',
        'gemini-3.7-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.5-flash',
        'gemini-3-flash',
        'gemini-flash-latest',
        'gemma-4-26b-a4b-it',
        'gemini-2.5-pro'
      ].filter(Boolean);

      const uniqueModels = [...new Set(candidateModels.map(m => m.replace(/^models\//, '')))];

      for (const model of uniqueModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.85
              }
            })
          });

          if (!resp.ok) {
            const errJson = await resp.json().catch(() => null);
            const errMsg = errJson?.error?.message || `HTTP ${resp.status}`;
            this.lastGeminiError = `Gemini (${model}) ${errMsg}`;
            console.warn(`Gemini direct call notice (${model}):`, errJson);
            continue;
          }

          const data = await resp.json();
          const rawText = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            parsed._source = `Google Gemini (${model})`;
            this.lastGeminiError = null;
            localStorage.setItem(modelProp, model);
            if (typeof aiUsageTracker !== 'undefined') {
              aiUsageTracker.recordCall(model, data.usageMetadata);
            }
            return parsed;
          }
        } catch (err) {
          this.lastGeminiError = `Gemini network error: ${err.message}`;
          console.warn(`Gemini direct fetch failure (${model}):`, err);
        }
      }

      // Fallback: If no candidate succeeded and no cached model was verified, dynamically discover models via ListModels
      if (!cachedModel && !customModels) {
        try {
          const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
          if (listResp.ok) {
            const listData = await listResp.json();
            const supported = (listData.models || [])
              .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
              .map(m => (m.name || '').replace(/^models\//, ''))
              .filter(Boolean);
            const discovered = supported.find(m => m.includes('flash')) || supported[0];
            if (discovered && !uniqueModels.includes(discovered)) {
              return await this.callGeminiDirect(prompt, [discovered]);
            }
          }
        } catch (e) {
          console.warn('Dynamic ListModels fallback notice:', e);
        }
      }

      return null;
    },

    async generateTrip(userInput) {
      const query = userInput.trim();
      if (!query) throw new Error('Please enter a destination place name.');

      // 1. Try Direct Google Gemini API (if user configured a Gemini key)
      const directKey = this.getGeminiApiKey();
      if (directKey) {
        const varietyThemes = [
          'Sensory & Atmospheric (tangible weather, fragrances, sounds, morning or twilight light)',
          'Culinary & Hidden Spots (local delicacies, cozy cafes, intimate eateries, street food)',
          'Romantic Micro-Moments (sweet unscripted memories, candid couple warmth, sharing warmth)',
          'Slow Living Retreat (unhurried rhythms, tranquil viewpoints, peaceful relaxation, quiet walks)',
          'Epic Landscapes & Scenic Wonder (dramatic vistas, golden hour, nature colors, panoramic awe)',
          'Cultural & Vintage Nostalgia (historic alleys, local crafts, timeless architecture, retro charm)'
        ];
        const randomFocus = varietyThemes[Math.floor(Math.random() * varietyThemes.length)];

        const coupleNames = getCoupleNames();
        const tripPrompt = `You are an expert romantic travel planner and geographical curator for ${coupleNames}, a loving couple from Taiwan.
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
     * Rule of Thumb: Only restrict to a single season if the destination is strictly seasonal (e.g. high-winter ski only, or polar sea-ice expedition). Otherwise, recommend all relevant seasons so ${coupleNames} have maximum flexibility!
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

        const directSpec = await this.callGeminiDirect(tripPrompt);
        if (directSpec && directSpec.name && directSpec.lat != null && directSpec.lng != null) {
          if (directSpec.seasons) directSpec.seasons = normalizeSeasons(directSpec.seasons);
          return directSpec;
        }
      }

      // 2. Try serverless backend (/api/aiGenerate or direct Cloud Function)
      try {
        const srvResp = await fetch(this.getServerlessEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'trip', query, coupleNames: getCoupleNames() })
        });
        if (srvResp.ok) {
          const srvData = await srvResp.json();
          if (srvData && srvData.success && srvData.spec) {
            if (srvData.spec.seasons) srvData.spec.seasons = normalizeSeasons(srvData.spec.seasons);
            srvData.spec._source = 'Firebase Cloud Function (Gemini)';
            if (typeof aiUsageTracker !== 'undefined') {
              aiUsageTracker.recordCall('serverless-gemini');
            }
            return srvData.spec;
          }
        }
      } catch (e) {
        // Serverless offline; proceed to Client Heuristics
      }

      // 3. Curated Landmark Fast-Path (guarantees perfect coordinates & rich creative leeway)
      const landmark = this.findKnownLandmark(query);
      if (landmark) {
        const name = landmark.nameTemplates[Math.floor(Math.random() * landmark.nameTemplates.length)];
        const description = landmark.descriptionTemplates[Math.floor(Math.random() * landmark.descriptionTemplates.length)];
        return {
          name,
          locationName: landmark.locationName,
          lat: landmark.lat,
          lng: landmark.lng,
          minDays: landmark.minDays,
          maxDays: landmark.maxDays,
          budget: landmark.budget,
          costEstimate: landmark.costEstimate,
          seasons: normalizeSeasons(landmark.seasons),
          tags: [...landmark.tags],
          description,
          _source: 'Local Curated Landmark Engine'
        };
      }

      // 4. Client-side Nominatim Geocoding + Dynamic Creative Leeway Engine
      const geo = await this.geocodeNominatim(query);
      const taiwanCenter = { lat: 23.8, lng: 120.9 };
      const distKm = this.calcDistanceKm(taiwanCenter.lat, taiwanCenter.lng, geo.lat, geo.lng);

      // Determine Region / Country label
      const parts = geo.displayName.split(',').map(s => s.trim());
      const country = parts[parts.length - 1] || 'Global';
      const city = parts[0] || query;
      const locationName = parts.length > 2 ? `${city}, ${country}` : geo.displayName.substring(0, 45);

      // Detect Theme
      const theme = this.detectTheme(query, locationName);

      // Duration & Budget Heuristics based on Distance & Theme
      let minDays = 2, maxDays = 3, budget = '$', costEstimate = '~NT$4,000 - 8,000 /人';
      let seasons = ['all'];

      if (theme === 'polar') {
        budget = '$$$$';
        costEstimate = '~NT$120,000 - 250,000 /人';
        minDays = 8;
        maxDays = 14;
        seasons = ['winter', 'summer'];
      } else if (distKm < 400) {
        // Domestic Taiwan
        if (/溫泉|villa|渡假|奢華|包棟/i.test(query)) {
          budget = '$$';
          costEstimate = '~NT$8,500 - 15,000 /人';
        } else {
          budget = '$';
          costEstimate = '~NT$3,500 - 7,500 /人';
        }
        minDays = 2;
        maxDays = distKm > 200 ? 4 : 3;

        // Tailored Taiwan domestic seasons
        if (/溫泉|泡湯|湯屋|溫泉會館/i.test(query)) {
          seasons = ['autumn', 'winter', 'spring'];
        } else if (theme === 'beach' || /墾丁|澎湖|小琉球|綠島|蘭嶼|海|沙灘|浪/i.test(query)) {
          seasons = ['spring', 'summer', 'autumn'];
        } else if (theme === 'mountain' || /阿里山|清境|合歡山|太平山|日月潭|杉林溪/i.test(query)) {
          seasons = ['spring', 'summer', 'autumn'];
        } else {
          seasons = ['all'];
        }
      } else if (distKm < 4200) {
        // East Asia & Southeast Asia (Japan, Korea, Thailand, Vietnam, Bali)
        if (/泰國|清邁|曼谷|越南|河內|東南亞/i.test(query) || /thailand|vietnam|bali/i.test(locationName)) {
          budget = '$$';
          costEstimate = '~NT$18,000 - 28,000 /人';
          seasons = ['autumn', 'winter', 'spring']; // Pleasant dry season for SE Asia
        } else {
          budget = '$$$';
          costEstimate = '~NT$32,000 - 52,000 /人';
          seasons = ['spring', 'summer', 'autumn'];
        }
        minDays = 4;
        maxDays = 7;
      } else {
        // Long-haul (Europe, Americas, Oceania, Iceland, Switzerland)
        budget = '$$$$';
        costEstimate = '~NT$75,000 - 130,000 /人';
        minDays = 8;
        maxDays = 14;
        seasons = ['spring', 'summer', 'autumn'];
      }

      // Keyword Season Overrides (Lenient)
      if (theme === 'polar' || /雪|snow|ski|滑雪|冰川/i.test(query)) {
        seasons = ['winter', 'spring'];
      } else if (/極光|aurora/i.test(query)) {
        seasons = ['autumn', 'winter'];
      } else if (/溫泉|泡湯|湯屋|onsen|hot spring/i.test(query)) {
        seasons = ['autumn', 'winter', 'spring'];
      } else if (/櫻花|花海|sakura/i.test(query)) {
        seasons = ['spring'];
      } else if (theme === 'beach' || /海|沙灘|浮潛|潛水|sup|跳島|花火|beach|island/i.test(query)) {
        seasons = ['spring', 'summer', 'autumn'];
      } else if (/楓|紅葉|水杉|落羽松/i.test(query)) {
        seasons = ['autumn'];
      }

      // Flag Emoji Detection
      const flags = {
        '日本': '🇯🇵', 'japan': '🇯🇵',
        '韓國': '🇰🇷', 'korea': '🇰🇷',
        '泰國': '🇹🇭', 'thailand': '🇹🇭',
        '法國': '🇫🇷', 'france': '🇫🇷',
        '英國': '🇬🇧', 'england': '🇬🇧',
        '冰島': '🇮🇸', 'iceland': '🇮🇸',
        '瑞士': '🇨🇭', 'switzerland': '🇨🇭',
        '加拿大': '🇨🇦', 'canada': '🇨🇦',
        '澳洲': '🇦🇺', 'australia': '🇦🇺',
        '紐西蘭': '🇳🇿', 'new zealand': '🇳🇿',
        '美國': '🇺🇸', 'usa': '🇺🇸',
        '義大利': '🇮🇹', 'italy': '🇮🇹',
        '希臘': '🇬🇷', 'greece': '🇬🇷',
        '台灣': '🇹🇼', 'taiwan': '🇹🇼'
      };
      let flagEmoji = '✈️';
      for (const [k, v] of Object.entries(flags)) {
        if (query.toLowerCase().includes(k) || locationName.toLowerCase().includes(k)) {
          flagEmoji = v;
          break;
        }
      }

      // High-leeway Dynamic Title & Description
      const cleanWord = query.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '');
      const name = this.generateCreativeTripTitle(cleanWord, theme, flagEmoji);
      const description = this.generateCreativeTripDescription(cleanWord, theme);
      const tags = this.generateThematicTags(cleanWord, theme, seasons, budget, distKm);

      return {
        name,
        locationName,
        lat: geo.lat,
        lng: geo.lng,
        minDays,
        maxDays,
        budget,
        costEstimate,
        seasons: normalizeSeasons(seasons),
        tags,
        description,
        _source: 'OpenStreetMap Nominatim & Local Engine'
      };
    },

    async generateAlternateTripDescription(placeName, currentDesc = '') {
      const query = (placeName || '').trim();
      if (!query) throw new Error('Please enter a destination name first.');

      const directKey = this.getGeminiApiKey();
      if (directKey) {
        const varietyThemes = [
          'Sensory & Atmospheric (tangible weather, fragrances, sounds, morning or twilight light)',
          'Culinary & Hidden Spots (local delicacies, cozy cafes, intimate eateries, street food)',
          'Romantic Micro-Moments (sweet unscripted memories, candid couple warmth, sharing warmth)',
          'Slow Living Retreat (unhurried rhythms, tranquil viewpoints, peaceful relaxation, quiet walks)',
          'Epic Landscapes & Scenic Wonder (dramatic vistas, golden hour, nature colors, panoramic awe)',
          'Cultural & Vintage Nostalgia (historic alleys, local crafts, timeless architecture, retro charm)'
        ];
        const randomFocus = varietyThemes[Math.floor(Math.random() * varietyThemes.length)];

        const coupleNames = getCoupleNames();
        const descPrompt = `You are a romantic travel writer for ${coupleNames}, a loving couple from Taiwan.
Write a fresh, evocative, and distinctly different travel description in Traditional Chinese for "${query}".
Focus Style: ${randomFocus}.
${currentDesc ? `Previous description was: "${currentDesc.slice(0, 80)}...". Do NOT repeat the previous wording or sentence structure.` : ''}
Return ONLY a valid JSON object matching this exact schema:
{
  "description": "2 to 3 vivid, deeply evocative sentences in Traditional Chinese (80-140 chars) tailored uniquely to ${query}. Tangible local sights, authentic scents/flavors, and tender couple micro-moments. NEVER use generic clichés."
}
BANNED CLICHÉS: NEVER use formulaic phrases like "漫步在充滿浪漫氛圍的街道", "留下難忘的回憶", "享受兩人專屬的浪漫世界", "是情侶旅遊的絕佳選擇", "沉浸在滿滿的幸福中".`;

        const spec = await this.callGeminiDirect(descPrompt);
        if (spec && spec.description) {
          return spec.description;
        }
      }

      // Fallback: local heuristic engine with theme detection
      const theme = this.detectPlaceTheme(query);
      return this.generateCreativeTripDescription(query, theme);
    },

    async generateActivity(userInput) {
      const query = userInput.trim();
      if (!query) throw new Error('Please enter a date activity thought.');

      // 1. Try Direct Google Gemini API (if user configured a Gemini key)
      const directKey = this.getGeminiApiKey();
      if (directKey) {
        const coupleNames = getCoupleNames();
        const actPrompt = `You are an imaginative romantic date activity assistant for ${coupleNames} from Taiwan.
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

        const directSpec = await this.callGeminiDirect(actPrompt);
        if (directSpec && directSpec.title) {
          return directSpec;
        }
      }

      // 2. Try serverless backend (/api/aiGenerate or direct Cloud Function)
      try {
        const srvResp = await fetch(this.getServerlessEndpoint(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'activity', query, coupleNames: getCoupleNames() })
        });
        if (srvResp.ok) {
          const srvData = await srvResp.json();
          if (srvData && srvData.success && srvData.spec) {
            srvData.spec._source = 'Firebase Cloud Function (Gemini)';
            if (typeof aiUsageTracker !== 'undefined') {
              aiUsageTracker.recordCall('serverless-gemini');
            }
            return srvData.spec;
          }
        }
      } catch (e) {}

      // 3. Client-side Heuristic Spec Classifier
      let occasion = 'short';
      if (/夜|微醺|酒吧|浪漫|燭光|晚餐|看夜景|bar|movie|星空|電影/i.test(query)) {
        occasion = 'dateNight';
      } else if (/日遊|露營|爬山|遠足|遊樂園|滑雪|浮潛|淨灘|離島|day trip/i.test(query)) {
        occasion = 'wholeDay';
      }

      let environment = 'indoor';
      if (/戶外|山|海|公園|跑|騎|步道|草皮|露營|沙灘|溪|森林/i.test(query)) {
        environment = 'outdoor';
      } else if (/逛|老街|夜市|市集|集章|拜拜|漁港/i.test(query)) {
        environment = 'any';
      }

      let budget = '$';
      if (/餐酒館|SPA|滑雪|飯店|大餐|米其林|牛排|鐵板燒|珠寶|金工/i.test(query)) {
        budget = '$$$';
      } else if (/咖啡|下午茶|電影|展|手作|體驗|拉麵|火鍋|烤肉|溜冰|釣蝦|KTV/i.test(query)) {
        budget = '$$';
      }

      // Add poetic flair to bare short phrases if needed
      let polishedTitle = query;
      if (query === '看夜景') polishedTitle = '景觀觀景台浪漫看夜景與熱飲 🌃';
      else if (query === '泡溫泉') polishedTitle = '雙人景觀露天溫泉與暖心熱湯 ♨️';
      else if (query === '做甜點' || query === '烘焙') polishedTitle = '手作烘焙工作坊：兩人專屬甜點時光 🍰';
      else if (query === '溜冰') polishedTitle = '冰上牽手漫滑與熱可可約會 ⛸️☕';
      else if (query === '露營') polishedTitle = '星空森林露營與營火烤棉花糖 🏕️🔥';

      return {
        title: polishedTitle,
        occasion,
        budget,
        environment,
        _source: 'Local Rule Engine'
      };
    }
  };

  function applyTripAiSpec(spec) {
    const nameEl = document.getElementById('formTripName');
    const regionEl = document.getElementById('formTripRegion');
    const minEl = document.getElementById('formTripMinDays');
    const maxEl = document.getElementById('formTripMaxDays');
    const latEl = document.getElementById('formTripLat');
    const lngEl = document.getElementById('formTripLng');
    const budgetEl = document.getElementById('formTripBudget');
    const costEl = document.getElementById('formTripCostEstimate');
    const descEl = document.getElementById('formTripDesc');
    const tagsEl = document.getElementById('formTripTags');

    if (nameEl) { nameEl.value = spec.name; nameEl.classList.add('ai-field-highlight'); }
    if (regionEl) { regionEl.value = spec.locationName; regionEl.classList.add('ai-field-highlight'); }
    if (minEl) { minEl.value = spec.minDays; minEl.classList.add('ai-field-highlight'); }
    if (maxEl) { maxEl.value = spec.maxDays; maxEl.classList.add('ai-field-highlight'); }
    if (latEl && !isNaN(spec.lat)) { latEl.value = Number(spec.lat).toFixed(4); latEl.classList.add('ai-field-highlight'); }
    if (lngEl && !isNaN(spec.lng)) { lngEl.value = Number(spec.lng).toFixed(4); lngEl.classList.add('ai-field-highlight'); }
    if (budgetEl) { budgetEl.value = spec.budget; budgetEl.classList.add('ai-field-highlight'); }
    if (costEl) { costEl.value = spec.costEstimate; costEl.classList.add('ai-field-highlight'); }
    if (descEl) { descEl.value = spec.description; descEl.classList.add('ai-field-highlight'); }
    if (tagsEl) {
      tagsEl.value = Array.isArray(spec.tags) ? spec.tags.join(', ') : spec.tags;
      tagsEl.classList.add('ai-field-highlight');
    }

    // Update Best Season chips with normalization & visual pop feedback
    const modalSeasonContainer = document.getElementById('formTripSeasonChips');
    if (modalSeasonContainer) {
      const normSeasons = normalizeSeasons(spec.seasons);
      setModalTripSeasons(normSeasons);

      modalSeasonContainer.classList.add('ai-field-highlight');
      const activeChips = modalSeasonContainer.querySelectorAll('.season-chip.active');
      activeChips.forEach(chip => {
        chip.classList.add('ai-field-highlight');
        chip.classList.add('season-chip-popped');
      });
      setTimeout(() => {
        activeChips.forEach(chip => chip.classList.remove('season-chip-popped'));
      }, 900);
    }

    setTimeout(() => {
      document.querySelectorAll('.ai-field-highlight').forEach(el => el.classList.remove('ai-field-highlight'));
    }, 1600);
  }

  function applyActivityAiSpec(spec) {
    const titleEl = document.getElementById('formActTitle');
    const occEl = document.getElementById('formActOccasion');
    const budgetEl = document.getElementById('formActBudget');
    const envEl = document.getElementById('formActEnv');

    if (titleEl) { titleEl.value = spec.title; titleEl.classList.add('ai-field-highlight'); }
    if (occEl) { occEl.value = spec.occasion; occEl.classList.add('ai-field-highlight'); }
    if (budgetEl) { budgetEl.value = spec.budget; budgetEl.classList.add('ai-field-highlight'); }
    if (envEl) { envEl.value = spec.environment; envEl.classList.add('ai-field-highlight'); }

    setTimeout(() => {
      document.querySelectorAll('.ai-field-highlight').forEach(el => el.classList.remove('ai-field-highlight'));
    }, 1600);
  }

  // =========================================================================
  // 13. Event Listeners Wiring
  // =========================================================================
  function setupEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => setView(tab.dataset.view));
    });

    // Sound Toggle
    document.getElementById('btnSoundToggle').addEventListener('click', () => {
      sfx.enabled = !sfx.enabled;
      localStorage.setItem('app_sound_enabled', sfx.enabled ? '1' : '0');
      document.getElementById('soundIcon').textContent = sfx.enabled ? '🔊' : '🔇';
      if (sfx.enabled) sfx.pop(540);
    });

    // Randomizers
    document.getElementById('btnDecideTrip').addEventListener('click', decideTrip);
    document.getElementById('btnSpinDate').addEventListener('click', spinDateIdea);
    document.getElementById('btnMarkDateDone').addEventListener('click', toggleDateCompleted);

    const btnEditDate = document.getElementById('btnEditCurrentDate');
    if (btnEditDate) {
      btnEditDate.addEventListener('click', () => {
        if (!state.selectedActivity) return;
        openEditActivityModal(state.selectedActivity.id);
      });
    }

    // Selected Trip Card Visited Toggle
    document.getElementById('stVisitedBtn').addEventListener('click', () => {
      if (!state.selectedTrip) return;
      state.selectedTrip.visited = !state.selectedTrip.visited;
      saveData();
      renderSelectedTripCard();
      renderMapMarkers();
      renderTripsTable();
      if (state.selectedTrip.visited) {
        sfx.stamp();
        confetti.burst();
      } else {
        sfx.uncheck();
      }
    });

    // Selected Trip Card Edit Button
    const stEditBtn = document.getElementById('stEditBtn');
    if (stEditBtn) {
      stEditBtn.addEventListener('click', () => {
        if (!state.selectedTrip) return;
        openEditTripModal(state.selectedTrip.id);
      });
    }

    // Mode Toggle (Single vs Eliminator)
    document.getElementById('btnModeSingle').addEventListener('click', () => setMode('single'));
    document.getElementById('btnModeEliminator').addEventListener('click', () => setMode('eliminator'));

    // Helper to wire multi-select filter chip groups
    function wireMultiSelectChips(containerId, filterKey, stateObj, dataAttr) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const chips = container.querySelectorAll('.chip');

      chips.forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.dataset[dataAttr];
          let current = Array.isArray(stateObj[filterKey]) ? [...stateObj[filterKey]] : [stateObj[filterKey]];

          if (val === 'all') {
            stateObj[filterKey] = ['all'];
          } else {
            // Remove 'all' when specific item is picked
            current = current.filter(x => x !== 'all');

            // Toggle specific selection
            if (current.includes(val)) {
              current = current.filter(x => x !== val);
            } else {
              current.push(val);
            }

            // Default back to 'all' if all deselected
            if (current.length === 0) {
              current = ['all'];
            }
            stateObj[filterKey] = current;
          }

          // Refresh active chip classes
          chips.forEach(b => {
            const bVal = b.dataset[dataAttr];
            b.classList.toggle('active', stateObj[filterKey].includes(bVal));
          });

          sfx.tap();
        });
      });
    }

    // Days to Travel Dual-Handle Range Slider
    const minDaysSlider = document.getElementById('tripDaysMinSlider');
    const maxDaysSlider = document.getElementById('tripDaysMaxSlider');
    const daysBadge = document.getElementById('tripDaysBadge');

    if (minDaysSlider && maxDaysSlider) {
      let lastMin = parseInt(minDaysSlider.value, 10);
      let lastMax = parseInt(maxDaysSlider.value, 10);

      minDaysSlider.addEventListener('input', () => {
        let minVal = parseInt(minDaysSlider.value, 10);
        const maxVal = parseInt(maxDaysSlider.value, 10);
        if (minVal > maxVal) {
          minDaysSlider.value = maxVal;
          minVal = maxVal;
        }
        minDaysSlider.style.zIndex = '4';
        maxDaysSlider.style.zIndex = '2';
        updateDualDaysSliderUI();
        if (minVal !== lastMin) {
          sfx.tap(minVal / 8);
          lastMin = minVal;
        }
      });

      maxDaysSlider.addEventListener('input', () => {
        const minVal = parseInt(minDaysSlider.value, 10);
        let maxVal = parseInt(maxDaysSlider.value, 10);
        if (maxVal < minVal) {
          maxDaysSlider.value = minVal;
          maxVal = minVal;
        }
        maxDaysSlider.style.zIndex = '4';
        minDaysSlider.style.zIndex = '2';
        updateDualDaysSliderUI();
        if (maxVal !== lastMax) {
          sfx.tap(maxVal / 8);
          lastMax = maxVal;
        }
      });

      minDaysSlider.addEventListener('pointerdown', () => {
        minDaysSlider.style.zIndex = '4';
        maxDaysSlider.style.zIndex = '2';
      });

      maxDaysSlider.addEventListener('pointerdown', () => {
        maxDaysSlider.style.zIndex = '4';
        minDaysSlider.style.zIndex = '2';
      });
    }

    if (daysBadge) {
      daysBadge.addEventListener('click', () => {
        resetDualDaysSliderUI();
        sfx.pop(440);
      });
    }

    // Initialize dual slider fill & state
    updateDualDaysSliderUI();

    // Trip Filter Chips (Multiple Choice)
    wireMultiSelectChips('tripBudgetSelect', 'budget', state.tripFilters, 'budget');
    wireMultiSelectChips('tripSeasonSelect', 'season', state.tripFilters, 'season');

    document.getElementById('chkTripUnvisitedOnly').addEventListener('change', (e) => {
      state.tripFilters.unvisitedOnly = e.target.checked;
      if (e.target.checked) {
        sfx.tap(1.2);
      } else {
        sfx.uncheck();
      }
    });

    // Date Filter Chips (Multiple Choice)
    wireMultiSelectChips('dateOccasionSelect', 'occasion', state.dateFilters, 'occasion');
    wireMultiSelectChips('dateBudgetSelect', 'budget', state.dateFilters, 'budget');
    wireMultiSelectChips('dateEnvSelect', 'env', state.dateFilters, 'env');

    document.getElementById('chkDateUndoneOnly').addEventListener('change', (e) => {
      state.dateFilters.undoneOnly = e.target.checked;
      if (e.target.checked) {
        sfx.tap(1.2);
      } else {
        sfx.uncheck();
      }
    });

    // Reset Map View
    document.getElementById('btnResetMapView').addEventListener('click', () => {
      sfx.whoosh();
      if (mapInstance) mapInstance.flyTo([26.0, 120.0], 4);
    });

    // Dedicated Modals Wiring
    const btnOpenTrip = document.getElementById('btnOpenAddTripModal');
    if (btnOpenTrip) btnOpenTrip.addEventListener('click', () => openAddTripModal());
    const btnOpenTripManage = document.getElementById('btnOpenAddTripModalManage');
    if (btnOpenTripManage) btnOpenTripManage.addEventListener('click', () => openAddTripModal());
    document.getElementById('btnCloseAddTripModal').addEventListener('click', closeAddTripModal);

    // AI Trip Autofill Trigger
    const btnMapAi = document.getElementById('btnMapAiAdd');
    if (btnMapAi) {
      btnMapAi.addEventListener('click', () => {
        openAddTripModal();
        const input = document.getElementById('aiTripInput');
        if (input) {
          input.focus();
          input.select();
        }
      });
    }

    const btnAiTrip = document.getElementById('btnAiAutofillTrip');
    const aiTripInput = document.getElementById('aiTripInput');
    const handleAiTripAction = async () => {
      const query = aiTripInput ? aiTripInput.value.trim() : '';
      if (!query) {
        showToast('Please type a destination name first!', 'error');
        if (aiTripInput) aiTripInput.focus();
        return;
      }

      const btnText = document.getElementById('btnAiTripText');
      const spinner = document.getElementById('btnAiTripSpinner');
      const hint = document.getElementById('aiTripStatusHint');

      if (btnText) btnText.style.display = 'none';
      if (spinner) spinner.style.display = 'inline';
      if (btnAiTrip) btnAiTrip.disabled = true;
      if (hint) hint.textContent = '⏳ AI is analyzing location, calculating GPS coordinates and specs...';

      try {
        const spec = await aiEngine.generateTrip(query);
        applyTripAiSpec(spec);
        sfx.sparkle();
        confetti.burst();
        const sourceLabel = spec._source || 'AI Engine';
        if (hint) {
          if (aiEngine.lastGeminiError && !sourceLabel.includes('Gemini')) {
            hint.innerHTML = `⚠️ <small>${escapeHTML(aiEngine.lastGeminiError)}</small><br>✨ Fallback generated via <strong>[${escapeHTML(sourceLabel)}]</strong> for "${escapeHTML(spec.name)}"!`;
          } else {
            hint.innerHTML = `✨ <strong>[${escapeHTML(sourceLabel)}]</strong> Specs generated for "${escapeHTML(spec.name)}"! Click "Save Destination" below.`;
          }
        }
        if (aiEngine.lastGeminiError && !sourceLabel.includes('Gemini')) {
          showToast(`Gemini Notice: ${aiEngine.lastGeminiError}`, 'warning');
        } else {
          showToast(`AI analyzed <strong>${escapeHTML(spec.name)}</strong> via ${escapeHTML(sourceLabel)}! 📍`);
        }
      } catch (err) {
        console.error('AI trip generation error:', err);
        if (hint) hint.textContent = `⚠️ ${err.message || 'Could not find location. Try another query.'}`;
        showToast(`AI Notice: ${err.message}`, 'error');
        sfx.errorNudge();
      } finally {
        if (btnText) btnText.style.display = 'inline';
        if (spinner) spinner.style.display = 'none';
        if (btnAiTrip) btnAiTrip.disabled = false;
      }
    };

    if (btnAiTrip) btnAiTrip.addEventListener('click', handleAiTripAction);
    if (aiTripInput) {
      aiTripInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAiTripAction();
        }
      });
    }

    // Dynamic Description Variety Trigger
    const btnMoreDesc = document.getElementById('btnAiMoreDescVarieties');
    if (btnMoreDesc) {
      btnMoreDesc.addEventListener('click', async () => {
        const placeName = document.getElementById('formTripName')?.value.trim() ||
                          document.getElementById('aiTripInput')?.value.trim() ||
                          document.getElementById('formTripRegion')?.value.trim();
        if (!placeName) {
          showToast('Please enter a destination name or generate a trip first!', 'warning');
          sfx.errorNudge();
          return;
        }

        const btnText = document.getElementById('btnAiMoreDescText');
        const spinner = document.getElementById('btnAiMoreDescSpinner');
        const descEl = document.getElementById('formTripDesc');

        if (btnText) btnText.style.display = 'none';
        if (spinner) spinner.style.display = 'inline';
        btnMoreDesc.disabled = true;

        try {
          const currentDesc = descEl ? descEl.value.trim() : '';
          const newDesc = await aiEngine.generateAlternateTripDescription(placeName, currentDesc);
          if (descEl && newDesc) {
            descEl.value = newDesc;
            descEl.classList.remove('ai-field-highlight');
            void descEl.offsetWidth; // trigger reflow for pulse animation
            descEl.classList.add('ai-field-highlight');
            showToast('New description flavor generated! ✨');
            sfx.sparkle();
          }
        } catch (err) {
          console.error('Alternate description error:', err);
          showToast(err.message || 'Could not generate alternate flavor.', 'error');
          sfx.errorNudge();
        } finally {
          if (btnText) btnText.style.display = 'inline';
          if (spinner) spinner.style.display = 'none';
          btnMoreDesc.disabled = false;
        }
      });
    }

    // AI Activity Autofill Trigger
    const btnAiAct = document.getElementById('btnAiAutofillAct');
    const aiActInput = document.getElementById('aiActInput');
    const handleAiActAction = async () => {
      const query = aiActInput ? aiActInput.value.trim() : '';
      if (!query) {
        showToast('Please type a date activity idea first!', 'error');
        if (aiActInput) aiActInput.focus();
        return;
      }

      const btnText = document.getElementById('btnAiActText');
      const spinner = document.getElementById('btnAiActSpinner');
      const hint = document.getElementById('aiActStatusHint');

      if (btnText) btnText.style.display = 'none';
      if (spinner) spinner.style.display = 'inline';
      if (btnAiAct) btnAiAct.disabled = true;
      if (hint) hint.textContent = '⏳ AI is classifying date occasion, budget tier, and setting...';

      try {
        const spec = await aiEngine.generateActivity(query);
        applyActivityAiSpec(spec);
        sfx.sparkle();
        const sourceLabel = spec._source || 'AI Engine';
        if (hint) {
          if (aiEngine.lastGeminiError && !sourceLabel.includes('Gemini')) {
            hint.innerHTML = `⚠️ <small>${escapeHTML(aiEngine.lastGeminiError)}</small><br>✨ Fallback categorized via <strong>[${escapeHTML(sourceLabel)}]</strong> for "${escapeHTML(spec.title)}"!`;
          } else {
            hint.innerHTML = `✨ <strong>[${escapeHTML(sourceLabel)}]</strong> Categorized "${escapeHTML(spec.title)}"! Click "Save Date Idea" below.`;
          }
        }
        if (aiEngine.lastGeminiError && !sourceLabel.includes('Gemini')) {
          showToast(`Gemini Notice: ${aiEngine.lastGeminiError}`, 'warning');
        } else {
          showToast(`Categorized "<strong>${escapeHTML(spec.title)}</strong>" via ${escapeHTML(sourceLabel)}! ✨`);
        }
      } catch (err) {
        console.error('AI activity generation error:', err);
        if (hint) hint.textContent = `⚠️ ${err.message || 'Could not classify idea.'}`;
        showToast(`AI Notice: ${err.message}`, 'error');
        sfx.errorNudge();
      } finally {
        if (btnText) btnText.style.display = 'inline';
        if (spinner) spinner.style.display = 'none';
        if (btnAiAct) btnAiAct.disabled = false;
      }
    };

    if (btnAiAct) btnAiAct.addEventListener('click', handleAiActAction);
    if (aiActInput) {
      aiActInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAiActAction();
        }
      });
    }

    // Multi-select toggle chips for Best Season in Add/Edit Destination modal
    const modalSeasonContainer = document.getElementById('formTripSeasonChips');
    if (modalSeasonContainer) {
      const chips = modalSeasonContainer.querySelectorAll('.season-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const season = chip.dataset.season;
          const allChip = modalSeasonContainer.querySelector('.season-chip[data-season="all"]');

          if (season === 'all') {
            chips.forEach(c => c.classList.remove('active'));
            allChip.classList.add('active');
          } else {
            if (allChip) allChip.classList.remove('active');
            chip.classList.toggle('active');
            const activeSpecific = Array.from(chips).filter(c => c.dataset.season !== 'all' && c.classList.contains('active'));
            if (activeSpecific.length === 0) {
              if (allChip) allChip.classList.add('active');
            } else if (activeSpecific.length === 4) {
              chips.forEach(c => c.classList.remove('active'));
              if (allChip) allChip.classList.add('active');
            }
          }
          sfx.tap();
        });
      });
    }

    const btnOpenAct = document.getElementById('btnOpenAddActivityModal');
    if (btnOpenAct) btnOpenAct.addEventListener('click', openAddActivityModal);
    document.getElementById('btnCloseAddActivityModal').addEventListener('click', closeAddActivityModal);

    document.getElementById('btnCloseManageModal').addEventListener('click', closeManageModal);

    // Cloud Sync Modal Wiring
    const btnCloudSync = document.getElementById('btnCloudSync');
    if (btnCloudSync) btnCloudSync.addEventListener('click', openCloudSyncModal);
    const btnCloseCloudSync = document.getElementById('btnCloseCloudSyncModal');
    if (btnCloseCloudSync) btnCloseCloudSync.addEventListener('click', closeCloudSyncModal);

    // Gemini API Key Save & Test Buttons
    const btnSaveGeminiKey = document.getElementById('btnSaveGeminiKey');
    const inputGeminiApiKey = document.getElementById('inputGeminiApiKey');
    const geminiKeyStatus = document.getElementById('geminiKeyStatus');
    if (btnSaveGeminiKey && inputGeminiApiKey) {
      btnSaveGeminiKey.addEventListener('click', () => {
        const key = inputGeminiApiKey.value.trim();
        const geminiKeyProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_KEY) ? STORAGE_KEYS.GEMINI_KEY : 'app_gemini_api_key';
        if (key) {
          localStorage.setItem(geminiKeyProp, key);
          if (geminiKeyStatus) geminiKeyStatus.innerHTML = '💾 <strong>Key saved & synced!</strong> AI Autofill will now call Google Gemini directly and sync across your devices.';
          showToast('Gemini API key saved & synced! ✨');
          sfx.stamp();
          // Push key to secure Firestore couple room
          const docRef = (cloudSync && typeof cloudSync.getRoomDoc === 'function') ? cloudSync.getRoomDoc() : null;
          if (docRef) {
            docRef.set({
              geminiApiKey: key
            }, { merge: true }).catch(e => console.warn('Cloud sync of key notice:', e));
          }
        } else {
          localStorage.removeItem(geminiKeyProp);
          if (geminiKeyStatus) geminiKeyStatus.textContent = 'Cleared. App will use the free built-in local geocoding engine.';
          showToast('Gemini API key cleared.');
          sfx.tap();
          const docRef = (cloudSync && typeof cloudSync.getRoomDoc === 'function') ? cloudSync.getRoomDoc() : null;
          if (docRef) {
            docRef.set({
              geminiApiKey: ''
            }, { merge: true }).catch(e => console.warn('Cloud clear of key notice:', e));
          }
        }
      });
    }

    // Model Select Dropdown & Quick Tweak Trigger Listeners
    const selectModel = document.getElementById('selectGeminiModel');
    if (selectModel) {
      selectModel.addEventListener('change', () => {
        const chosen = selectModel.value;
        const modelProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_MODEL) ? STORAGE_KEYS.GEMINI_MODEL : 'app_gemini_active_model';
        localStorage.setItem(modelProp, chosen);
        updateModelUI(chosen);
        if (typeof aiUsageTracker !== 'undefined') {
          aiUsageTracker.updateUI();
        }
        showToast(`AI Model set to ${formatModelShortPill(chosen)} & synced! ☁️`);
        sfx.tap();
        const docRef = (cloudSync && typeof cloudSync.getRoomDoc === 'function') ? cloudSync.getRoomDoc() : null;
        if (docRef) {
          docRef.set({
            geminiModel: chosen
          }, { merge: true }).catch(e => console.warn('Cloud sync of model notice:', e));
        }
      });
    }

    const btnResetAiUsage = document.getElementById('btnResetAiUsage');
    if (btnResetAiUsage) {
      btnResetAiUsage.addEventListener('click', () => {
        if (typeof aiUsageTracker !== 'undefined') {
          aiUsageTracker.resetStats();
        }
      });
    }

    const btnCalibrateAiUsage = document.getElementById('btnCalibrateAiUsage');
    if (btnCalibrateAiUsage) {
      btnCalibrateAiUsage.addEventListener('click', () => {
        const inputField = document.getElementById('inputCalibrateReq');
        if (inputField) {
          inputField.focus();
          inputField.select();
        } else if (typeof aiUsageTracker !== 'undefined') {
          const current = aiUsageTracker.getStats().todayRequests || 0;
          const input = prompt("Enter today's real-world used requests count (e.g. from Google AI Studio):", current);
          if (input !== null && !isNaN(parseInt(input, 10))) {
            aiUsageTracker.setTodayRequests(parseInt(input, 10));
          }
        }
      });
    }

    const btnApplyCalibrateReq = document.getElementById('btnApplyCalibrateReq');
    const inputCalibrateReq = document.getElementById('inputCalibrateReq');
    if (btnApplyCalibrateReq && inputCalibrateReq) {
      btnApplyCalibrateReq.addEventListener('click', () => {
        if (typeof aiUsageTracker !== 'undefined') {
          aiUsageTracker.setTodayRequests(inputCalibrateReq.value);
        }
      });
      inputCalibrateReq.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (typeof aiUsageTracker !== 'undefined') {
            aiUsageTracker.setTodayRequests(inputCalibrateReq.value);
          }
        }
      });
    }

    const btnIncAiReq = document.getElementById('btnIncAiReq');
    if (btnIncAiReq) {
      btnIncAiReq.addEventListener('click', () => {
        if (typeof aiUsageTracker !== 'undefined') {
          aiUsageTracker.adjustTodayRequests(1);
        }
      });
    }

    const btnDecAiReq = document.getElementById('btnDecAiReq');
    if (btnDecAiReq) {
      btnDecAiReq.addEventListener('click', () => {
        if (typeof aiUsageTracker !== 'undefined') {
          aiUsageTracker.adjustTodayRequests(-1);
        }
      });
    }

    const selectCustomRpdTier = document.getElementById('selectCustomRpdTier');
    if (selectCustomRpdTier) {
      selectCustomRpdTier.addEventListener('change', () => {
        const val = selectCustomRpdTier.value;
        if (val === 'custom') {
          const currentLimit = parseInt(localStorage.getItem('app_gemini_custom_rpd_limit'), 10) || 500;
          const input = prompt('Enter your custom daily requests per day (RPD) quota limit:', currentLimit);
          if (input !== null && !isNaN(parseInt(input, 10))) {
            aiUsageTracker.setRpdLimit(parseInt(input, 10));
          } else {
            aiUsageTracker.updateUI();
          }
        } else {
          aiUsageTracker.setRpdLimit(parseInt(val, 10));
        }
      });
    }

    const btnRefresh = document.getElementById('btnRefreshModels');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        const key = inputGeminiApiKey.value.trim() || localStorage.getItem('app_gemini_api_key');
        autoDetectGeminiModels(key, true);
      });
    }

    const btnQuickTrip = document.getElementById('btnQuickModelTrip');
    const btnQuickAct = document.getElementById('btnQuickModelAct');
    const openModelQuickSettings = () => {
      openCloudSyncModal();
      const selectBox = document.getElementById('selectGeminiModel');
      if (selectBox) {
        setTimeout(() => {
          selectBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
          selectBox.focus();
        }, 320);
      }
    };
    if (btnQuickTrip) btnQuickTrip.addEventListener('click', openModelQuickSettings);
    if (btnQuickAct) btnQuickAct.addEventListener('click', openModelQuickSettings);

    const btnTestGeminiKey = document.getElementById('btnTestGeminiKey');
    if (btnTestGeminiKey && inputGeminiApiKey) {
      btnTestGeminiKey.addEventListener('click', async () => {
        const key = inputGeminiApiKey.value.trim() || localStorage.getItem('app_gemini_api_key');
        if (!key) {
          if (geminiKeyStatus) geminiKeyStatus.innerHTML = '⚠️ Please paste your API key from Google AI Studio first.';
          sfx.errorNudge();
          return;
        }
        if (geminiKeyStatus) geminiKeyStatus.innerHTML = '⏳ Querying Google ModelService (ListModels)...';
        btnTestGeminiKey.disabled = true;

        try {
          // Step 1: Query ModelService.ListModels to check key validity & discover supported models
          const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`;
          const listResp = await fetch(listUrl);
          const listData = await listResp.json().catch(() => ({}));

          if (!listResp.ok) {
            const errMsg = listData?.error?.message || `HTTP ${listResp.status}`;
            if (geminiKeyStatus) {
              geminiKeyStatus.innerHTML = `❌ <strong>Google API Error (${listResp.status}):</strong> ${escapeHTML(errMsg)}<br><small>Tip: Verify your key at <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color:var(--color-accent-teal);text-decoration:underline;">Google AI Studio</a> and ensure "Generative Language API" is enabled.</small>`;
            }
            sfx.errorNudge();
            btnTestGeminiKey.disabled = false;
            return;
          }

          // Step 2: Filter models supporting generateContent from ListModels
          const availableModels = (listData.models || [])
            .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
            .map(m => (m.name || '').replace(/^models\//, ''))
            .filter(Boolean);

          const modelsMeta = {};
          (listData.models || []).forEach(m => {
            const id = (m.name || '').replace(/^models\//, '');
            if (id) {
              modelsMeta[id] = {
                displayName: m.displayName || id,
                inputTokenLimit: m.inputTokenLimit,
                outputTokenLimit: m.outputTokenLimit,
                description: m.description
              };
            }
          });

          // Update cached detected models and populate select dropdown!
          if (availableModels.length > 0) {
            localStorage.setItem('app_gemini_detected_models', JSON.stringify(availableModels));
            localStorage.setItem('app_gemini_models_meta', JSON.stringify(modelsMeta));
            populateModelSelect(availableModels, modelsMeta);
          }

          // Preferred model from select dropdown or cached preference
          const preferredModel = (document.getElementById('selectGeminiModel')?.value) ||
                                 localStorage.getItem('app_gemini_active_model') ||
                                 'gemini-3.8-flash';

          // Build prioritized test queue: Preferred model first, then smart & fast candidates
          const candidatesToTry = [
            preferredModel,
            'gemini-3.8-flash',
            'gemini-3.7-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.5-flash',
            'gemini-3-flash',
            ...availableModels.filter(m => !m.includes('tts') && !m.includes('image') && m !== 'gemini-2.5-flash'),
            'gemma-4-26b-a4b-it'
          ];
          const testQueue = [...new Set(candidatesToTry.map(m => m.replace(/^models\//, '')))];

          // Step 3: Loop through candidates until one returns HTTP 200
          let verifiedModel = null;
          let lastErrorMessage = '';
          let lastStatus = 404;

          for (const targetModel of testQueue) {
            if (geminiKeyStatus) {
              geminiKeyStatus.innerHTML = `⏳ Testing generation with <code>${escapeHTML(targetModel)}</code>...`;
            }

            try {
              const testResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(key)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
              });
              const testData = await testResp.json().catch(() => ({}));

              if (testResp.ok) {
                verifiedModel = targetModel;
                if (typeof aiUsageTracker !== 'undefined') {
                  aiUsageTracker.recordCall(targetModel, testData.usageMetadata);
                }
                break;
              } else {
                lastStatus = testResp.status;
                lastErrorMessage = testData?.error?.message || `HTTP ${testResp.status}`;
                console.warn(`Model probe [${targetModel}] rejected (${testResp.status}):`, lastErrorMessage);
              }
            } catch (probeErr) {
              lastErrorMessage = probeErr.message;
            }
          }

          if (verifiedModel) {
            const geminiKeyProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_KEY) ? STORAGE_KEYS.GEMINI_KEY : 'app_gemini_api_key';
            const modelProp = (typeof STORAGE_KEYS !== 'undefined' && STORAGE_KEYS.GEMINI_MODEL) ? STORAGE_KEYS.GEMINI_MODEL : 'app_gemini_active_model';
            localStorage.setItem(geminiKeyProp, key);
            localStorage.setItem(modelProp, verifiedModel);
            updateModelUI(verifiedModel);

            const modelBadge = `<span style="background:rgba(126,231,135,0.15);color:#7ee787;padding:2px 8px;border-radius:12px;font-family:monospace;font-size:0.8rem;border:1px solid rgba(126,231,135,0.3);">${escapeHTML(verifiedModel)}</span>`;
            
            if (geminiKeyStatus) {
              geminiKeyStatus.innerHTML = `✅ <strong>Connected & Active!</strong> Google Gemini responded (Status 200) using ${modelBadge}.<br><small style="color:var(--color-text-muted)">1 test request registered on your Google AI Studio quota. Auto-selected from ${availableModels.length} discovered models.</small>`;
            }
            sfx.chime();
            confetti.burst();
            showToast(`Gemini verified! Connected to ${verifiedModel} ✨`);

            // Push verified key and model to secure Firestore room
            const docRef = (cloudSync && typeof cloudSync.getRoomDoc === 'function') ? cloudSync.getRoomDoc() : null;
            if (docRef) {
              docRef.set({
                geminiApiKey: key,
                geminiModel: verifiedModel
              }, { merge: true }).catch(e => console.warn('Cloud sync of verified key notice:', e));
            }
          } else {
            if (geminiKeyStatus) {
              geminiKeyStatus.innerHTML = `❌ <strong>Model Error (${lastStatus}):</strong> ${escapeHTML(lastErrorMessage)}<br><small>Tested ${testQueue.length} models. Discovered: ${escapeHTML(availableModels.slice(0, 6).join(', ') || 'none')}</small>`;
            }
            sfx.errorNudge();
          }
        } catch (err) {
          if (geminiKeyStatus) {
            geminiKeyStatus.innerHTML = `❌ <strong>Network request failed:</strong> ${escapeHTML(err.message)}`;
          }
          sfx.errorNudge();
        } finally {
          btnTestGeminiKey.disabled = false;
        }
      });
    }

    // Atmosphere & Theme Picker Wiring
    const btnTheme = document.getElementById('btnThemeSelector');
    if (btnTheme) btnTheme.addEventListener('click', () => themeManager.openModal());
    const btnCloseTheme = document.getElementById('btnCloseThemeModal');
    if (btnCloseTheme) btnCloseTheme.addEventListener('click', () => themeManager.closeModal());

    document.querySelectorAll('.theme-card').forEach(card => {
      card.addEventListener('click', () => {
        const themeId = card.dataset.theme;
        themeManager.applyTheme(themeId, true);
        setTimeout(() => themeManager.closeModal(), 320);
      });
    });

    // Modal close helper (B8)
    function closeModalById(id) {
      if (id === 'manageModal') {
        closeManageModal();
      } else if (id === 'addTripModal') {
        closeAddTripModal();
      } else if (id === 'addActivityModal') {
        closeAddActivityModal();
      } else if (id === 'cloudSyncModal') {
        closeCloudSyncModal();
      } else if (id === 'themeModal') {
        themeManager.closeModal();
      } else {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
      }
    }

    // Close on backdrop click for all modals
    ['addTripModal', 'addActivityModal', 'manageModal', 'cloudSyncModal', 'themeModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target === el) {
            closeModalById(id);
          }
        });
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        ['addTripModal', 'addActivityModal', 'manageModal', 'cloudSyncModal', 'themeModal'].forEach(id => {
          const el = document.getElementById(id);
          if (el && el.style.display !== 'none') {
            closeModalById(id);
          }
        });
      }
    });

    // Window resize handler for Leaflet map recalibration
    window.addEventListener('resize', () => {
      if (mapInstance) {
        mapInstance.invalidateSize();
      }
    });

    const btnPush = document.getElementById('btnManualPushCloud');
    if (btnPush) btnPush.addEventListener('click', () => cloudSync.forcePush());

    const btnPull = document.getElementById('btnManualPullCloud');
    if (btnPull) btnPull.addEventListener('click', () => cloudSync.forcePull());

    const btnLockApp = document.getElementById('btnLockApp');
    if (btnLockApp) btnLockApp.addEventListener('click', () => lockUI(true));

    // Modal Subtabs
    document.querySelectorAll('.modal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        switchManageSubtab(tab.dataset.subtab);
      });
    });

    // Form Submissions
    document.getElementById('formActivity').addEventListener('submit', handleAddActivity);
    document.getElementById('formTrip').addEventListener('submit', handleAddTrip);

    // Table Search & Filter
    document.getElementById('actSearchInput').addEventListener('input', renderActivitiesTable);
    document.getElementById('actFilterStatus').addEventListener('change', renderActivitiesTable);
    document.getElementById('tripSearchInput').addEventListener('input', renderTripsTable);
    const tripFilterStatus = document.getElementById('tripFilterStatus');
    if (tripFilterStatus) {
      tripFilterStatus.addEventListener('change', renderTripsTable);
    }

    // Clickable Destination Badges -> Open Destinations List
    const tripCountBadge = document.getElementById('tripCountBadge');
    if (tripCountBadge) {
      tripCountBadge.addEventListener('click', () => {
        try { sfx.pop(); } catch (e) {}
        openManageModal('tripsList', 'all');
      });
      tripCountBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          try { sfx.pop(); } catch (e) {}
          openManageModal('tripsList', 'all');
        }
      });
    }

    const legendWishlistBtn = document.getElementById('legendWishlistBtn');
    if (legendWishlistBtn) {
      legendWishlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { sfx.pop(); } catch (e) {}
        openManageModal('tripsList', 'wishlist');
      });
      legendWishlistBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          try { sfx.pop(); } catch (e) {}
          openManageModal('tripsList', 'wishlist');
        }
      });
    }

    const legendVisitedBtn = document.getElementById('legendVisitedBtn');
    if (legendVisitedBtn) {
      legendVisitedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        try { sfx.pop(); } catch (e) {}
        openManageModal('tripsList', 'visited');
      });
      legendVisitedBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          try { sfx.pop(); } catch (e) {}
          openManageModal('tripsList', 'visited');
        }
      });
    }

    // Delegated Event Handlers for Tables (B6, Optimization)
    const actTbody = document.getElementById('activityTableBody');
    if (actTbody) {
      actTbody.addEventListener('change', (e) => {
        if (e.target.matches('.act-chk-done')) {
          const actId = e.target.dataset.id;
          const act = state.activities.find(a => a.id === actId);
          if (!act) return;
          act.completed = e.target.checked;
          act.completedAt = act.completed ? new Date().toISOString() : null;
          act.updatedAt = Date.now();
          saveData();
          if (act.completed) {
            sfx.stamp();
          } else {
            sfx.uncheck();
          }
          if (state.selectedActivity && state.selectedActivity.id === act.id) {
            renderActivityCard(act);
          }
        }
      });

      actTbody.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit-act-table');
        if (editBtn) {
          const actId = editBtn.dataset.id;
          openEditActivityModal(actId);
          return;
        }
        const delBtn = e.target.closest('.btn-del');
        if (delBtn) {
          const actId = delBtn.dataset.id;
          const act = state.activities.find(a => a.id === actId);
          if (!act) return;
          if (confirm(`Delete activity: "${act.title}"?`)) {
            sfx.trash();
            trackDeletedActivity(actId);
            state.activities = state.activities.filter(a => a.id !== act.id);
            saveData();
            renderActivitiesTable();
            if (state.selectedActivity && state.selectedActivity.id === actId) {
              state.selectedActivity = state.activities.length > 0 ? (getRandomActivity(true) || state.activities[0]) : null;
              if (state.selectedActivity) renderActivityCard(state.selectedActivity);
            }
          }
        }
      });
    }

    const tripTbody = document.getElementById('tripTableBody');
    if (tripTbody) {
      tripTbody.addEventListener('change', (e) => {
        if (e.target.matches('.trip-chk-visited')) {
          const tripId = e.target.dataset.id;
          const t = state.trips.find(trip => trip.id === tripId);
          if (!t) return;
          t.visited = e.target.checked;
          t.updatedAt = Date.now();
          saveData();
          if (t.visited) {
            sfx.stamp();
          } else {
            sfx.uncheck();
          }
          renderTripsTable();
          renderMapMarkers();
          if (state.selectedTrip && state.selectedTrip.id === t.id) {
            renderSelectedTripCard();
          }
        }
      });

      tripTbody.addEventListener('click', (e) => {
        const flyTrigger = e.target.closest('.trip-fly-trigger');
        if (flyTrigger) {
          const tripId = flyTrigger.dataset.id;
          const trip = state.trips.find(t => t.id === tripId);
          if (trip) {
            sfx.whoosh();
            closeManageModal();
            setView('trips');
            selectTrip(trip);
          }
          return;
        }
        const editBtn = e.target.closest('.btn-edit-table');
        if (editBtn) {
          const tripId = editBtn.dataset.id;
          openEditTripModal(tripId);
          return;
        }
        const delBtn = e.target.closest('.btn-del');
        if (delBtn) {
          const tripId = delBtn.dataset.id;
          const t = state.trips.find(trip => trip.id === tripId);
          if (!t) return;
          if (confirm(`Delete destination: "${t.name}"?`)) {
            sfx.trash();
            trackDeletedTrip(tripId);
            state.trips = state.trips.filter(trip => trip.id !== tripId);
            saveData();
            renderTripsTable();
            renderMapMarkers();
            if (state.selectedTrip && state.selectedTrip.id === tripId) {
              state.selectedTrip = state.trips.length > 0 ? state.trips[0] : null;
              renderSelectedTripCard();
            }
          }
        }
      });
    }

    // Backup & Restore
    document.getElementById('btnRunTxtImport').addEventListener('click', importTextLines);
    document.getElementById('btnExportJSON').addEventListener('click', exportJSONBackup);
    document.getElementById('fileImportJSON').addEventListener('change', (e) => {
      if (e.target.files.length > 0) importJSONBackup(e.target.files[0]);
    });

    document.getElementById('btnReloadSeedData').addEventListener('click', () => {
      const isSebLynn = !state.currentCouple || state.currentCouple.id === 'seb_lynn';
      if (!isSebLynn) {
        if (confirm('Clear all activities and trips in Vincent & Alice\'s space?')) {
          try {
            localStorage.setItem(STORAGE_KEYS.EMERGENCY_BACKUP, JSON.stringify({
              activities: state.activities,
              trips: state.trips,
              savedAt: new Date().toISOString()
            }));
          } catch (e) {}

          if (state.deletedTripIds) state.deletedTripIds.clear();
          if (state.deletedActivityIds) state.deletedActivityIds.clear();
          state.activities = [];
          state.trips = [];
          saveData();
          renderMapMarkers();
          renderSelectedTripCard();
          renderActivityCard(null);
          renderActivitiesTable();
          renderTripsTable();
          alert('Vincent & Alice space cleared! (A safety backup was saved locally)');
        }
        return;
      }
      if (confirm('Reset all activities and trips to default ThingsToDo.txt list?')) {
        try {
          localStorage.setItem(STORAGE_KEYS.EMERGENCY_BACKUP, JSON.stringify({
            activities: state.activities,
            trips: state.trips,
            savedAt: new Date().toISOString()
          }));
        } catch (e) {}

        if (state.deletedTripIds) state.deletedTripIds.clear();
        if (state.deletedActivityIds) state.deletedActivityIds.clear();
        const now = Date.now();
        state.activities = cloneDefaults(window.DEFAULT_ACTIVITIES).map(a => ({ ...a, updatedAt: now }));
        state.trips = cloneDefaults(window.DEFAULT_TRIPS).map(t => ({ ...t, updatedAt: now }));
        saveData();
        renderMapMarkers();
        if (state.trips.length > 0) selectTrip(state.trips[0]);
        if (state.activities.length > 0) {
          const initialAct = getRandomActivity(true) || state.activities[0];
          renderActivityCard(initialAct);
        }
        renderActivitiesTable();
        renderTripsTable();
        alert('Reset complete & synchronized with cloud! (A safety backup of previous items was saved locally)');
      }
    });
  }

  // =========================================================================
  // 13. App Bootstrap
  // =========================================================================
  function init() {
    // Purge legacy local storage items on boot
    purgeLegacyLocalStorage();

    // Initialize chosen aesthetic theme style
    themeManager.init();

    // Sound icon state
    const soundIcon = document.getElementById('soundIcon');
    if (soundIcon) soundIcon.textContent = sfx.enabled ? '🔊' : '🔇';

    // Setup lockscreen controls and anti-tamper security
    setupLockscreen();

    // Check lockscreen status (boots app if remembered, or locks down if not)
    checkStoredAuth();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
