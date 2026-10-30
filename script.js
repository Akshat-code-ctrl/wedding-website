/* =========================================================
   CONFIG - yahan se details badlein
   ========================================================= */
const CONFIG = {
  weddingDate: "2026-12-12T19:30:00+05:30",
  whatsappNumber: "919999999999",   // country code ke saath, bina + ke
  coupleNames: "Aarav & Ananya"
};

/* =========================================================
   Elements
   ========================================================= */
const splash   = document.getElementById("splash");
const enterBtn = document.getElementById("enterBtn");
const musicBtn = document.getElementById("musicBtn");
const bgm      = document.getElementById("bgm");

let musicOn = false;
let usingSynth = false;

/* =========================================================
   MUSIC
   1) Pehle assets/music.mp3 chalane ki koshish
   2) Agar file nahi mili, to built-in soft instrumental (Web Audio) chalega
   ========================================================= */
let audioCtx, masterGain, synthTimer, step = 0;

// D major pentatonic style melody (Hz)
const N = { D4:293.66, E4:329.63, Fs4:369.99, A4:440, B4:493.88, D5:587.33, E5:659.25, Fs5:739.99, A5:880 };
const melody = [
  "D5","Fs5","A5","Fs5","E5","D5","B4","D5",
  "Fs5","A5","Fs5","E5","D5","B4","A4","B4",
  "D5","E5","Fs5","A5","Fs5","E5","D5","E5",
  "B4","D5","E5","Fs5","E5","D5","B4","A4"
];
const bass = [146.83,146.83,110,110,123.47,123.47,110,110]; // D3 D3 A2 A2 B2 B2 A2 A2

function note(freq, time, dur, type="sine", vol=0.12){
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(vol, time + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.connect(g); g.connect(masterGain);
  o.start(time); o.stop(time + dur + 0.05);
}

function startSynth(){
  usingSynth = true;
  if(!audioCtx){
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.0001;

    // halka reverb-jaisa delay
    const delay = audioCtx.createDelay(); delay.delayTime.value = 0.28;
    const fb = audioCtx.createGain(); fb.gain.value = 0.35;
    delay.connect(fb); fb.connect(delay);
    masterGain.connect(audioCtx.destination);
    masterGain.connect(delay); delay.connect(audioCtx.destination);
  }
  audioCtx.resume();
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setTargetAtTime(0.9, audioCtx.currentTime, 1.2);

  const beat = 0.5;                  // second per note
  let next = audioCtx.currentTime + 0.1;
  clearInterval(synthTimer);
  synthTimer = setInterval(() => {
    while(next < audioCtx.currentTime + 0.6){
      const m = melody[step % melody.length];
      note(N[m], next, beat * 1.8, "triangle", 0.13);
      if(step % 2 === 0){
        note(bass[(step/2) % bass.length], next, beat * 2, "sine", 0.16);
      }
      if(step % 8 === 0){            // soft pad
        note(293.66, next, beat * 8, "sine", 0.05);
        note(369.99, next, beat * 8, "sine", 0.04);
        note(440,    next, beat * 8, "sine", 0.04);
      }
      next += beat; step++;
    }
  }, 120);
}

function stopSynth(){
  if(!audioCtx) return;
  masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.3);
  clearInterval(synthTimer);
}

async function playMusic(){
  try{
    bgm.volume = 0.7;
    await bgm.play();               // mp3 mili to yahin chalega
    usingSynth = false;
  }catch(e){
    startSynth();                   // mp3 nahi mili -> built-in music
  }
  musicOn = true;
  musicBtn.classList.add("playing");
  musicBtn.classList.remove("muted");
}

function pauseMusic(){
  if(usingSynth) stopSynth(); else bgm.pause();
  musicOn = false;
  musicBtn.classList.remove("playing");
  musicBtn.classList.add("muted");
}

musicBtn.addEventListener("click", () => musicOn ? pauseMusic() : (usingSynth ? (startSynth(), (musicOn=true, musicBtn.classList.add("playing"), musicBtn.classList.remove("muted"))) : playMusic()));

/* =========================================================
   Enter button
   ========================================================= */
enterBtn.addEventListener("click", async () => {
  await playMusic();                // user click ke baad hi music allowed hota hai
  splash.classList.add("hide");
  document.body.classList.remove("locked");
  musicBtn.classList.add("show");
  setTimeout(() => splash.remove(), 1400);
  burstPetals(40);
});

/* =========================================================
   Falling petals
   ========================================================= */
const petalBox = document.getElementById("petals");
function makePetal(){
  const p = document.createElement("span");
  p.className = "petal" + (Math.random() > .65 ? " gold" : "");
  const size = 8 + Math.random() * 12;
  p.style.width = size + "px";
  p.style.height = size * 1.3 + "px";
  p.style.left = Math.random() * 100 + "vw";
  p.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
  p.style.animationDuration = 7 + Math.random() * 8 + "s";
  petalBox.appendChild(p);
  setTimeout(() => p.remove(), 16000);
}
function burstPetals(n){ for(let i=0;i<n;i++) setTimeout(makePetal, i*120); }
setInterval(() => { if(!document.hidden) makePetal(); }, 1100);

/* =========================================================
   Countdown
   ========================================================= */
const target = new Date(CONFIG.weddingDate).getTime();
const pad = n => String(n).padStart(2, "0");
function tick(){
  let diff = target - Date.now();
  if(diff < 0) diff = 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);
  document.getElementById("cd-d").textContent = pad(d);
  document.getElementById("cd-h").textContent = pad(h);
  document.getElementById("cd-m").textContent = pad(m);
  document.getElementById("cd-s").textContent = pad(s);
}
tick(); setInterval(tick, 1000);

/* =========================================================
   Scroll reveal
   ========================================================= */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: .15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* =========================================================
   RSVP -> WhatsApp
   ========================================================= */
document.getElementById("rsvpForm").addEventListener("submit", e => {
  e.preventDefault();
  const name   = document.getElementById("gName").value.trim();
  const attend = document.getElementById("gAttend").value;
  const count  = document.getElementById("gCount").value;
  const msg    = document.getElementById("gMsg").value.trim();
  const text =
`🙏 Namaste! RSVP for ${CONFIG.coupleNames} ki shaadi
Naam: ${name}
Status: ${attend}
Guests: ${count}
${msg ? "Sandesh: " + msg : ""}`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
});
