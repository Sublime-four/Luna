// ====== Config ======
const girlfriendName = "Luna Maria Ortiz Hortua";
// Fecha inicio novios: 12/10/2025 (dd/mm/yyyy) -> 12 Oct 2025
const startedAt = new Date(2025, 9, 12, 0, 0, 0); // meses: 0=ene ... 9=oct
let countdownMode = "since"; // since | untilAnniversary

// ====== Helpers ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function pad(n){ return String(n).padStart(2, "0"); }

function showToast(msg){
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.animate(
    [{transform:"translateY(6px)", opacity:.5},{transform:"translateY(0)", opacity:1}],
    {duration:220, easing:"ease-out"}
  );
}

function formatDate(d){
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

// ====== Canvas FX (hearts + confetti PRO) ======
const canvas = $("#fx");
const ctx = canvas.getContext("2d", { alpha: true });
let W=0, H=0;

function resize(){
  W = canvas.width = window.innerWidth * devicePixelRatio;
  H = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = window.innerWidth+"px";
  canvas.style.height = window.innerHeight+"px";
  ctx.setTransform(1,0,0,1,0,0);
}
window.addEventListener("resize", resize);
resize();

const particles = [];
const MAX_PARTICLES = 900;

function rand(min, max){ return Math.random() * (max - min) + min; }

function clamp01(v){ return Math.max(0, Math.min(1, v)); }

function spawnParticle(x, y, kind="heart"){
  if (particles.length > MAX_PARTICLES) particles.splice(0, 60);

  const dpr = devicePixelRatio;
  const p = {
    kind,
    x: x * dpr,
    y: y * dpr,
    vx: rand(-1.2, 1.2) * dpr,
    vy: rand(-2.6, -1.2) * dpr,
    g: rand(0.028, 0.055) * dpr,        // gravedad
    drag: rand(0.985, 0.995),           // aire
    r: rand(18, 34) * dpr,   // corazones visibles de verdad
    a: 1,
    life: rand(140, 220),               // frames aprox
    rot: rand(0, Math.PI*2),
    vr: rand(-0.08, 0.08),              // velocidad rotación
    wob: rand(0, Math.PI*2),            // oscilación
    wobSpeed: rand(0.02, 0.06),
    // confetti shape
    w: rand(7, 16) * dpr,
    h: rand(3, 9) * dpr,
    colorA: `rgba(255,92,168,${rand(0.55,0.95)})`,
    colorB: `rgba(124,108,255,${rand(0.45,0.9)})`,
    colorC: `rgba(255,180,210,${rand(0.45,0.9)})`,
  };

  // Confetti cae desde arriba con más variedad
  if (kind === "confetti"){
    p.vx = rand(-1.7, 1.7) * dpr;
    p.vy = rand(0.2, 1.2) * dpr;
    p.g  = rand(0.06, 0.12) * dpr;
    p.r  = rand(3, 7) * dpr;
    p.life = rand(170, 260);
  }

  particles.push(p);
}

function heartPath(s){
  ctx.beginPath();
  ctx.moveTo(0, 0.25*s);
  ctx.bezierCurveTo(0, -0.05*s, -0.45*s, -0.05*s, -0.45*s, 0.25*s);
  ctx.bezierCurveTo(-0.45*s, 0.55*s, 0, 0.85*s, 0, 1.05*s);
  ctx.bezierCurveTo(0, 0.85*s, 0.45*s, 0.55*s, 0.45*s, 0.25*s);
  ctx.bezierCurveTo(0.45*s, -0.05*s, 0, -0.05*s, 0, 0.25*s);
  ctx.closePath();
}

function loop(){
  ctx.clearRect(0,0,W,H);

  for (let i=particles.length-1; i>=0; i--){
    const p = particles[i];

    // physics
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.g;

    // wobble lateral for confetti
    p.wob += p.wobSpeed;
    p.x += p.vx + Math.sin(p.wob) * 0.35 * devicePixelRatio;
    p.y += p.vy;

    p.rot += p.vr;

    p.life -= 1;
    p.a = clamp01(p.life / 220);

    // draw
    ctx.save();
    ctx.globalAlpha = p.a;

    if (p.kind === "heart"){
      ctx.translate(p.x, p.y);
ctx.rotate(p.rot);

const grad = ctx.createLinearGradient(-p.r, -p.r, p.r, p.r);
grad.addColorStop(0, p.colorA);
grad.addColorStop(1, p.colorB);
ctx.fillStyle = grad;

// Glow romántico
ctx.shadowColor = "rgba(255,92,168,.35)";
ctx.shadowBlur  = 18 * devicePixelRatio;

// Escala del corazón (más grande)
const s = p.r / 10;

// El path del corazón está “más abajo” (0..1.05s), así que lo subimos para centrarlo
ctx.translate(0, -0.45 * s);

heartPath(s);
ctx.fill();

    } else {
      // Confetti: rect + 2 tone flip effect
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      // flip-ish (like paper turning)
      const flip = (Math.sin(p.rot*2) + 1) / 2;
      ctx.fillStyle = flip > 0.66 ? p.colorA : (flip > 0.33 ? p.colorB : p.colorC);

      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    }

    ctx.restore();

    // cleanup
    if (p.a <= 0 || p.y > H + 120*devicePixelRatio) particles.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();

// Bursts
function burstHearts(count=26, x=window.innerWidth/2, y=window.innerHeight/2){
  for (let i=0;i<count;i++){
    spawnParticle(x + rand(-160,160), y + rand(-110,110), "heart");
  }
}

function burstConfetti(count=120){
  // from top across width (pro look)
  const topY = 10;
  for (let i=0;i<count;i++){
    spawnParticle(rand(20, window.innerWidth-20), topY + rand(-10, 40), "confetti");
  }
}

// Ambient interactions
window.addEventListener("pointermove", (e)=>{
  if (Math.random() < 0.12) spawnParticle(e.clientX, e.clientY, "heart");
});
window.addEventListener("pointerdown", (e)=>{
  for (let i=0;i<10;i++) spawnParticle(e.clientX, e.clientY, "heart");
});

// ====== Envelope ======
function toggleEnvelope(){
  const env = $("#envelope");
  if (!env) return;
  env.classList.toggle("open");
  burstHearts(18, window.innerWidth/2, window.innerHeight/2);
}
$("#envelope")?.addEventListener("click", toggleEnvelope);
$("#envelope")?.addEventListener("keydown", (e)=>{
  if (e.key === "Enter" || e.key === " ") toggleEnvelope();
});

// ====== Copy / Download letter ======
$("#copyLetter")?.addEventListener("click", async ()=>{
  const el = document.querySelector(".paper-inner");
  if (!el) return;
  const text = el.innerText.trim();
  try{
    await navigator.clipboard.writeText(text);
    showToast("✅ Carta copiada. Ahora solo falta entregarla con besito incluido.");
  }catch{
    showToast("⚠️ No pude copiar automáticamente. Selecciona el texto y copia manual.");
  }
});

$("#downloadLove")?.addEventListener("click", ()=>{
  const el = document.querySelector(".paper-inner");
  if (!el) return;
  const text = el.innerText.trim();
  const blob = new Blob([text], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `Carta_para_${girlfriendName.replaceAll(" ","_")}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  showToast("💾 Guardado. Backup emocional creado.");
});

// ====== Promises (localStorage) ======
const promiseKey = "love_promises_v1";
const saved = JSON.parse(localStorage.getItem(promiseKey) || "{}");

$$('#promises input[type="checkbox"]').forEach(cb=>{
  const k = cb.dataset.key;
  cb.checked = !!saved[k];
  cb.addEventListener("change", ()=>{
    saved[k] = cb.checked;
    localStorage.setItem(promiseKey, JSON.stringify(saved));
    updatePromiseBadge();
    if (cb.checked) burstHearts(12);
  });
});

function updatePromiseBadge(){
  const total = $$('#promises input[type="checkbox"]').length;
  const on = $$('#promises input[type="checkbox"]:checked').length;
  $("#promiseBadge").textContent = `💗 ${on}/${total} activadas`;
}
updatePromiseBadge();

// ====== Counter ======
$("#sinceLabel").textContent = formatDate(startedAt);

function nextAnniversary(fromDate){
  const y = fromDate.getFullYear();
  const annThisYear = new Date(y, startedAt.getMonth(), startedAt.getDate(), 0,0,0);
  if (fromDate <= annThisYear) return annThisYear;
  return new Date(y+1, startedAt.getMonth(), startedAt.getDate(), 0,0,0);
}

function tick(){
  const now = new Date();

  let diffMs;
  if (countdownMode === "since"){
    diffMs = now - startedAt;
    if (diffMs < 0) diffMs = 0;
  } else {
    const ann = nextAnniversary(now);
    diffMs = ann - now;
    if (diffMs < 0) diffMs = 0;
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  $("#days").textContent = days;
  $("#hours").textContent = pad(hours);
  $("#minutes").textContent = pad(minutes);
  $("#seconds").textContent = pad(seconds);
}
setInterval(tick, 1000);
tick();

$("#toggleCountMode")?.addEventListener("click", ()=>{
  countdownMode = (countdownMode === "since") ? "untilAnniversary" : "since";
  showToast(countdownMode === "since"
    ? "⏱️ Modo: contando desde que empezaron."
    : "🎯 Modo: contando hasta el próximo aniversario.");
  burstHearts(14);
  tick();
});

let love = 100;
function setLove(v){
  love = Math.max(0, Math.min(100, v));
  $("#progressBar").style.width = `${love}%`;
  $("#loveLevel").textContent = `Amor: ${love}%`;
}
$("#sparkBtn")?.addEventListener("click", ()=>{
  setLove(Math.min(100, love + 7));
  burstConfetti(90);
  showToast("🌟 Upgrade aplicado. El amor escaló a la nube.");
});
setLove(100);

// ====== Moments ======
const momentsKey = "love_moments_v1";
let moments = JSON.parse(localStorage.getItem(momentsKey) || "[]");

function renderMoments(){
  const box = $("#moments");
  if (!box) return;
  box.innerHTML = "";
  if (!moments.length){
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "Aún no has agregado momentos. Dale a “Agregar momento”.";
    box.appendChild(p);
    return;
  }
  moments.slice().reverse().forEach((m, idx)=>{
    const div = document.createElement("div");
    div.className = "moment";
    div.innerHTML = `
      <div>
        <strong>${m.title}</strong>
        <small>${m.date}</small>
        <div class="muted" style="margin-top:6px; font-weight:700;">${m.note}</div>
      </div>
      <button class="btn ghost" data-del="${moments.length-1-idx}" type="button">🗑️</button>
    `;
    box.appendChild(div);
  });

  box.querySelectorAll("[data-del]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const i = Number(btn.dataset.del);
      moments.splice(i,1);
      localStorage.setItem(momentsKey, JSON.stringify(moments));
      renderMoments();
      showToast("🧹 Momento eliminado (pero el amor no).");
    });
  });
}
renderMoments();

$("#addMomentBtn")?.addEventListener("click", ()=>{
  const title = prompt("Título del momento (ej: 'Nuestra salida favorita'):");
  if (!title) return;
  const date = prompt("Fecha (ej: 14/02/2026):", "");
  const note = prompt("Mini nota (1 línea):", "Fue un día hermoso 💗") || "";
  moments.push({title, date: date || "Sin fecha", note});
  localStorage.setItem(momentsKey, JSON.stringify(moments));
  renderMoments();
  burstHearts(20);
  showToast("➕ Momento agregado. Roadmap romántico actualizado.");
});

// ====== Gallery + modal ======
const gallery = $("#gallery");
const modal = $("#modal");
const modalImg = $("#modalImg");
const modalCaption = $("#modalCaption");

function openModal(src, caption){
  if (!modal) return;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modalImg.src = src;
  modalCaption.textContent = caption || "";
}
function closeModal(){
  if (!modal) return;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
}
$("#closeModal")?.addEventListener("click", closeModal);
modal?.addEventListener("click", (e)=>{ if (e.target === modal) closeModal(); });
window.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeModal(); });

gallery?.addEventListener("click", (e)=>{
  const btn = e.target.closest(".shot");
  if (!btn) return;
  const img = btn.querySelector("img");
  if (img){
    openModal(img.src, img.alt);
  } else {
    burstHearts(10);
    showToast("📷 Aquí va una foto. Usa “Cargar fotos” para poner las reales.");
  }
});

$("#photoInput")?.addEventListener("change", (e)=>{
  const files = Array.from(e.target.files || []);
  if (!files.length || !gallery) return;

  gallery.innerHTML = "";
  files.slice(0,12).forEach((f, i)=>{
    const url = URL.createObjectURL(f);
    const b = document.createElement("button");
    b.type = "button";
    b.className = "shot";
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Recuerdo ${i+1}`;
    b.appendChild(img);
    gallery.appendChild(b);
  });

  burstConfetti(120);
  showToast("🖼️ Fotos cargadas. Esto ya parece museo del amor.");
});

// ====== Quiz ======
$("#quiz")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = new FormData(e.target);
  let score = 0;
  ["q1","q2","q3"].forEach(k=> score += Number(data.get(k) || 0));

  const res = $("#quizResult");
  if (!res) return;
  res.hidden = false;

  const msg =
    score >= 30 ? "💯 Compatibilidad: legendaria. Esto es amor en alta disponibilidad." :
    score >= 20 ? "🔥 Compatibilidad: muy buena. Seguimos optimizando con besos." :
                  "💗 Compatibilidad: igual nos queremos, que es lo que importa.";

  res.textContent = `Score: ${score}/30 — ${msg}`;
  burstHearts(28);
});

// ====== Mini game: Catch hearts ======
let gameOn = false;
let score = 0;
let spawner = null;

function spawnInArena(){
  const arena = $("#arena");
  if (!arena) return;
  const w = arena.clientWidth;
  const h = arena.clientHeight;

  const el = document.createElement("div");
  el.className = "pop";
  el.textContent = "💗";

  const x = Math.random() * (w - 52) + 2;
  const y = Math.random() * (h - 52) + 2;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;

  const ttl = Math.random()*900 + 650;
  const kill = setTimeout(()=> el.remove(), ttl);

  el.addEventListener("click", ()=>{
    clearTimeout(kill);
    el.remove();
    score += 1;
    $("#score").textContent = score;

    const rect = arena.getBoundingClientRect();
    burstHearts(6, rect.left + x + 24, rect.top + y + 24);
  });

  arena.appendChild(el);
}

$("#gameBtn")?.addEventListener("click", ()=>{
  gameOn = !gameOn;
  const btn = $("#gameBtn");

  if (gameOn){
    score = 0;
    $("#score").textContent = score;
    btn.textContent = "⏹ Detener";
    showToast("🎯 Juego iniciado. Atrapa corazones, rápido.");
    spawner = setInterval(spawnInArena, 360);
  } else {
    btn.textContent = "▶ Iniciar";
    clearInterval(spawner);
    spawner = null;
    showToast(`🏁 Fin del juego. Puntos: ${score}. (Te debo ${score} besos).`);
    burstConfetti(120);
    $("#arena").innerHTML = "";
  }
});

// ====== Buttons (NO duplicados) ======
$("#startHearts")?.addEventListener("click", ()=>{
  burstHearts(80);
  showToast("💞 Corazones activados. La página quedó oficialmente enamorada.");
});

$("#bigYes")?.addEventListener("click", ()=>{
  burstConfetti(160);
  burstHearts(90);
  showToast("😳 Beso aprobado. Procede con cariño y sonrisa.");
});

$("#resetAll")?.addEventListener("click", ()=>{
  setLove(100);
  $("#quizResult").hidden = true;
  $("#envelope").classList.remove("open");
  showToast("🔄 Magia reiniciada. Volvimos al capítulo 1.");
  burstHearts(30);
});

// ====== Music toggle (fade in/out) ======
const bgm = $("#bgm");
const musicBtn = $("#musicBtn");
let musicOn = false;

function fadeTo(target, ms=650){
  if (!bgm) return;
  const start = bgm.volume ?? 1;
  const t0 = performance.now();
  function step(t){
    const k = Math.min(1, (t - t0)/ms);
    bgm.volume = start + (target - start) * k;
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function toggleMusic(forceOn=null){
  if (!bgm || !musicBtn) return;
  musicOn = (forceOn === null) ? !musicOn : !!forceOn;

  musicBtn.setAttribute("aria-pressed", String(musicOn));

  try{
    if (musicOn){
      bgm.volume = 0;
      await bgm.play();
      fadeTo(0.9, 700);
      musicBtn.textContent = "🔊 Sonando...";
      showToast("🎶 Música ON. Ambiente romántico activado.");
    } else {
      fadeTo(0, 450);
      setTimeout(()=> bgm.pause(), 480);
      musicBtn.textContent = "🎵 Labios de cereza";
      showToast("🔇 Música OFF. Silencio, pero con amor.");
    }
  }catch{
    musicOn = false;
    musicBtn.textContent = "🎵 Labios de cereza";
    musicBtn.setAttribute("aria-pressed", "false");
    showToast("⚠️ El navegador bloqueó el audio. Haz clic otra vez (primero interactúa con la página).");
  }
}
musicBtn?.addEventListener("click", ()=> toggleMusic());

// Confetti button: activa música si está apagada + FX mejorados
$("#confettiBtn")?.addEventListener("click", async ()=>{
  if (!musicOn) await toggleMusic(true);

  burstConfetti(220);
  burstHearts(90);
  setLove(100);

  showToast("✨ Lluvia romántica desplegada. Esto ya es nivel concierto.");
});

// ====== Greeting ======
showToast(`💗 Bienvenida, ${girlfriendName}. Esta página es para ti.`);


// ====== Fix: Activar corazones (a prueba de todo) ======
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("startHearts");
  if (!btn) {
    console.warn("❌ No existe el botón #startHearts en el HTML");
    return;
  }

  btn.addEventListener("click", () => {
    console.log("✅ Click en Activar corazones");
    burstHearts(120, window.innerWidth / 2, window.innerHeight / 2);
    showToast("💞 Corazones activados. La página quedó oficialmente enamorada.");
  });
});
