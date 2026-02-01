// Change this password to something only she would know (e.g. your inside joke)
const CORRECT_PASSWORD = "mostest";

// ═══════════════════════════════════════════════════════════════════════════════
// Adding Your Own Background Music 🎵
// 1. Get a free account at Cloudinary.com
// 2. Upload your MP3 (under 10MB) → Media Library → "..." on file → Copy URL
//    → "Copy Original URL with options"
// 3. Paste the URL below in musicUrl (e.g. https://res.cloudinary.com/.../video/upload/v123.../your-file.mp3)
// ═══════════════════════════════════════════════════════════════════════════════
const MUSIC_CONFIG = {
  enabled: true,
  autoplay: true,
  musicUrl: "https://res.cloudinary.com/drmdyvy5i/video/upload/v1769757469/grentperez_-_Cherry_Wine__Official_Lyric_Video__128k_faddzy.mp3",
  startText: "🎵 Play Music",
  stopText: "🔇 Stop Music",
  volume: 0.5,
};

// Floating emojis (same idea as reference)
const FLOATING_EMOJIS = ["❤️", "💖", "💝", "💗", "💓", "💕", "🧸"];

const screens = {
  lock: document.getElementById("screen-lock"),
  question: document.getElementById("screen-question"),
  loveMeter: document.getElementById("screen-love-meter"),
  loveLetter: document.getElementById("screen-love-letter"),
  yes: document.getElementById("screen-yes"),
};

// Love meter messages (like reference)
const LOVE_MESSAGES = {
  normal: "And beyond! 💕",
  high: "To infinity and beyond! 🚀💝",
  extreme: "WOOOOW You love me that much?? 🥰🚀💝",
};

function showScreen(name) {
  Object.values(screens).forEach((s) => {
    if (s) s.classList.remove("active");
  });
  if (screens[name]) screens[name].classList.add("active");
  if (name === "question") {
    requestAnimationFrame(() => requestAnimationFrame(initScratchCard));
  }
  if (name === "yes") createHeartExplosion();
}

function setRandomPosition(el) {
  el.style.left = Math.random() * 100 + "vw";
  el.style.animationDelay = Math.random() * 5 + "s";
  el.style.animationDuration = 10 + Math.random() * 20 + "s";
}

function createFloatingElements() {
  const container = document.getElementById("floatingElements");
  if (!container) return;
  for (let i = 0; i < 18; i++) {
    const div = document.createElement("div");
    div.className = "float-item";
    div.innerHTML = FLOATING_EMOJIS[Math.floor(Math.random() * FLOATING_EMOJIS.length)];
    setRandomPosition(div);
    container.appendChild(div);
  }
}

function createHeartExplosion() {
  const container = document.getElementById("floatingElements");
  if (!container) return;
  for (let i = 0; i < 50; i++) {
    const heart = document.createElement("div");
    heart.className = "float-item hearts-explosion";
    heart.innerHTML = FLOATING_EMOJIS[Math.floor(Math.random() * 5)]; // hearts only
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.animationDelay = Math.random() * 0.3 + "s";
    container.appendChild(heart);
  }
}

document.addEventListener("DOMContentLoaded", createFloatingElements);

// Background music – Play / Stop (only shown if MUSIC_CONFIG.enabled and musicUrl is set)
function setupMusic() {
  const controls = document.getElementById("musicControls");
  const toggle = document.getElementById("musicToggle");
  const audio = document.getElementById("bgMusic");
  const source = document.getElementById("musicSource");
  if (!controls || !toggle || !audio || !source) return;
  if (!MUSIC_CONFIG.enabled || !MUSIC_CONFIG.musicUrl) {
    controls.style.display = "none";
    return;
  }
  source.src = MUSIC_CONFIG.musicUrl;
  audio.volume = MUSIC_CONFIG.volume;
  audio.load();
  toggle.textContent = MUSIC_CONFIG.startText;

  // Show user if music failed to load (bad URL, CORS, etc.)
  audio.addEventListener("error", () => {
    toggle.textContent = "🎵 Music failed to load";
    console.warn("Music failed to load. Check musicUrl in script.js and that the file exists (e.g. .mp3 on Cloudinary).");
  });

  toggle.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().then(() => {
        toggle.textContent = MUSIC_CONFIG.stopText;
      }).catch((err) => {
        // Browsers block autoplay; first play must be after user click—so this is rare
        toggle.textContent = "🎵 Play Music";
        console.warn("Play failed:", err);
      });
    } else {
      audio.pause();
      toggle.textContent = MUSIC_CONFIG.startText;
    }
  });
  audio.addEventListener("ended", () => {
    toggle.textContent = MUSIC_CONFIG.startText;
  });
  // Autoplay is usually blocked until user taps "Play Music"—so we don't auto-play on load
  if (MUSIC_CONFIG.autoplay) {
    audio.play().catch(() => {
      toggle.textContent = MUSIC_CONFIG.startText;
    });
  }
}
document.addEventListener("DOMContentLoaded", setupMusic);

function initScratchCard() {
  const canvas = document.getElementById("scratchCanvas");
  const container = canvas && canvas.closest(".scratch-card");
  if (!canvas || !container) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.scale(dpr, dpr);

  // Scratch-off surface (silver/gray)
  const gradient = ctx.createLinearGradient(0, 0, w, h);
  gradient.addColorStop(0, "#c0c0c0");
  gradient.addColorStop(0.5, "#a8a8a8");
  gradient.addColorStop(1, "#909090");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillRect(0, 0, w, h);

  let isDrawing = false;
  const radius = 24;

  function getPos(e) {
    const r = container.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - r.left, y: e.touches[0].clientY - r.top };
    }
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function scratch(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function start(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  }

  function move(e) {
    e.preventDefault();
    if (!isDrawing) return;
    const pos = getPos(e);
    scratch(pos.x, pos.y);
  }

  function end() {
    isDrawing = false;
  }

  canvas.removeEventListener("mousedown", start);
  canvas.removeEventListener("mousemove", move);
  canvas.removeEventListener("mouseup", end);
  canvas.removeEventListener("mouseleave", end);
  canvas.removeEventListener("touchstart", start, { passive: false });
  canvas.removeEventListener("touchmove", move, { passive: false });
  canvas.removeEventListener("touchend", end);

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mousemove", move);
  canvas.addEventListener("mouseup", end);
  canvas.addEventListener("mouseleave", end);
  canvas.addEventListener("touchstart", start, { passive: false });
  canvas.addEventListener("touchmove", move, { passive: false });
  canvas.addEventListener("touchend", end);
}

const passwordInput = document.getElementById("password");
const unlockBtn = document.getElementById("unlockBtn");
const errorEl = document.getElementById("error");
const envelope = document.getElementById("envelope");

function tryUnlock() {
  const val = passwordInput.value.trim();
  if (val === CORRECT_PASSWORD) {
    errorEl.textContent = "";
    if (envelope) envelope.classList.add("opened");
    // After flap opens: go to letter card page (Page 2)
    setTimeout(() => {
      showScreen("question");
    }, 1000);
  } else {
    errorEl.textContent = "Wrong password 😭 try again";
    passwordInput.select();
  }
}

if (unlockBtn) unlockBtn.addEventListener("click", tryUnlock);
if (passwordInput) {
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryUnlock();
  });
}

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");

if (yesBtn) {
  yesBtn.addEventListener("click", () => {
    showScreen("loveMeter");
  });
}

const nextBtn = document.getElementById("nextBtn");
if (nextBtn) {
  nextBtn.addEventListener("click", () => showScreen("loveLetter"));
}

const loveLetterNextBtn = document.getElementById("loveLetterNextBtn");
if (loveLetterNextBtn) {
  loveLetterNextBtn.addEventListener("click", () => showScreen("yes"));
}

// Love meter: show percentage + extra message when > 100%; scale "breaks the window"
const loveMeterEl = document.getElementById("loveMeter");
const loveValueEl = document.getElementById("loveValue");
const extraLoveEl = document.getElementById("extraLove");

if (loveMeterEl && loveValueEl && extraLoveEl) {
  loveMeterEl.addEventListener("input", () => {
    const value = parseInt(loveMeterEl.value, 10);
    loveValueEl.textContent = value;

    if (value > 100) {
      extraLoveEl.classList.remove("hidden");
      const overflowPercentage = (value - 100) / 9900;
      const extraWidth = overflowPercentage * window.innerWidth * 0.8;
      loveMeterEl.style.width = `calc(100% + ${Math.round(extraWidth)}px)`;
      loveMeterEl.style.transition = "width 0.3s ease";
      if (value >= 5000) {
        extraLoveEl.textContent = LOVE_MESSAGES.extreme;
        extraLoveEl.classList.add("super-love");
      } else if (value > 1000) {
        extraLoveEl.textContent = LOVE_MESSAGES.high;
        extraLoveEl.classList.remove("super-love");
      } else {
        extraLoveEl.textContent = LOVE_MESSAGES.normal;
        extraLoveEl.classList.remove("super-love");
      }
    } else {
      extraLoveEl.classList.add("hidden");
      extraLoveEl.classList.remove("super-love");
      loveMeterEl.style.width = "100%";
    }
  });
}

// Make "No" button escape across the ENTIRE screen - works on both desktop and mobile
if (noBtn) {
  let escapeCount = 0;
  
  function escapeNoButton(e) {
    // Prevent the tap/click from going through
    if (e.type === "touchstart" || e.type === "click") {
      e.preventDefault();
    }
    
    escapeCount++;
    
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    // Get viewport dimensions with some padding
    const padding = 20;
    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;
    
    // Generate random position anywhere on the screen
    const randomX = padding + Math.floor(Math.random() * (maxX - padding));
    const randomY = padding + Math.floor(Math.random() * (maxY - padding));
    
    // Make button fixed position so it can go anywhere on screen
    noBtn.style.position = "fixed";
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
    noBtn.style.zIndex = "9999";
    noBtn.style.transition = "left 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)";
    
    // Add a fun bounce/shake animation
    noBtn.style.animation = "none";
    noBtn.offsetHeight; // Trigger reflow
    noBtn.style.animation = "buttonEscape 0.3s ease";
    
    // After many escapes, show a teasing message
    if (escapeCount === 5) {
      noBtn.textContent = "Nope! 😜";
    } else if (escapeCount === 10) {
      noBtn.textContent = "Can't catch me! 🏃";
    } else if (escapeCount === 15) {
      noBtn.textContent = "Just say Yes! 💕";
    } else if (escapeCount >= 20) {
      noBtn.textContent = "Give up? 😏";
    }
  }
  
  // Desktop: pointerenter (works with mouse hover)
  noBtn.addEventListener("pointerenter", escapeNoButton);
  
  // Mobile: touchstart (fires before click, catches the tap attempt)
  noBtn.addEventListener("touchstart", escapeNoButton, { passive: false });
  
  // Backup: click (in case they somehow click it)
  noBtn.addEventListener("click", (e) => {
    e.preventDefault();
    escapeNoButton(e);
  });
}

const restartBtn = document.getElementById("restartBtn");
if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    if (envelope) envelope.classList.remove("opened");
    if (passwordInput) passwordInput.value = "";
    if (errorEl) errorEl.textContent = "";
    if (noBtn) {
      noBtn.style.position = "relative";
      noBtn.style.left = "0px";
      noBtn.style.top = "0px";
      noBtn.style.zIndex = "";
      noBtn.textContent = "No";
    }
    if (loveMeterEl) {
      loveMeterEl.value = 100;
      loveMeterEl.style.width = "100%";
    }
    if (loveValueEl) loveValueEl.textContent = 100;
    if (extraLoveEl) {
      extraLoveEl.classList.add("hidden");
      extraLoveEl.classList.remove("super-love");
      extraLoveEl.textContent = "";
    }
    showScreen("lock");
  });
}
