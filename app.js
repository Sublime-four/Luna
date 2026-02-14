


















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
  t.textContent = msg;
  t.animate(
    [{transform:"translateY(6px)", opacity:.5},{transform:"translateY(0)", opacity:1}],
    {duration:220, easing:"ease-out"}
  );
}

function formatDate(d){
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`;
}

// ====== Canvas FX (hearts + confetti-ish particles) ======
const canvas = $("#fx");
const ctx = canvas.getContext("2d");
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
function spawnParticle(x, y, kind="heart"){
  const p = {
    x: x * devicePixelRatio,
    y: y * devicePixelRatio,
    vx: (Math.random()*2-1) * 1.2 * devicePixelRatio,
    vy: (-Math.random()*2 - 1.2) * devicePixelRatio,
    r: (Math.random()*10+10) * devicePixelRatio,
    a: 1,
    rot: Math.random()*Math.PI*2,
    vr: (Math.random()*2-1) * 0.04,
    kind
  };
  particles.push(p);
}

function heartPath(x,y,s){
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(s,s);
  ctx.beginPath();
  ctx.moveTo(0, 0.25);
  ctx.bezierCurveTo(0, -0.05, -0.45, -0.05, -0.45, 0.25);
  ctx.bezierCurveTo(-0.45, 0.55, 0, 0.85, 0, 1.05);
  ctx.bezierCurveTo(0, 0.85, 0.45, 0.55, 0.45, 0.25);
  ctx.bezierCurveTo(0.45, -0.05, 0, -0.05, 0, 0.25);
  ctx.closePath();
  ctx.restore();
}

function loop(){
  ctx.clearRect(0,0,W,H);

  for (let i=particles.length-1; i>=0; i--){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03 * devicePixelRatio; // gravedad suave
    p.a -= 0.008;
    p.rot += p.vr;

    ctx.save();
    ctx.globalAlpha = Math.max(p.a, 0);

    if (p.kind === "heart"){
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const grad = ctx.createLinearGradient(-p.r, -p.r, p.r, p.r);
      grad.addColorStop(0, "rgba(255,92,168,.95)");
      grad.addColorStop(1, "rgba(124,108,255,.75)");
      ctx.fillStyle = grad;
      heartPath(0,0, p.r/40);
      ctx.fill();
    } else {
      // confetti
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = "rgba(255,92,168,.8)";
      ctx.fillRect(-p.r/2, -p.r/6, p.r, p.r/3);
    }

    ctx.restore();

    if (p.a <= 0 || p.y > H + 50*devicePixelRatio) particles.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();

function burstHearts(count=26){
  const cx = window.innerWidth/2;
  const cy = window.innerHeight/2;
  for (let i=0;i<count;i++){
    spawnParticle(cx + (Math.random()*240-120), cy + (Math.random()*160-80), "heart");
  }
}

function burstConfetti(count=44){
  const cx = window.innerWidth/2;
  const cy = 120;
  for (let i=0;i<count;i++){
    spawnParticle(cx + (Math.random()*520-260), cy + (Math.random()*80-40), "confetti");
  }
}

window.addEventListener("pointermove", (e)=>{
  if (Math.random() < 0.15) spawnParticle(e.clientX, e.clientY, "heart");
});
window.addEventListener("pointerdown", (e)=>{
  for (let i=0;i<8;i++) spawnParticle(e.clientX, e.clientY, "heart");
});

// ====== Envelope ======
function toggleEnvelope(){
  $("#envelope").classList.toggle("open");
  burstHearts(18);
}
$("#envelope").addEventListener("click", toggleEnvelope);
$("#envelope").addEventListener("keydown", (e)=>{
  if (e.key === "Enter" || e.key === " ") toggleEnvelope();
});

// ====== Copy / Download letter ======
$("#copyLetter").addEventListener("click", async ()=>{
  const text = document.querySelector(".paper-inner").innerText.trim();
  try{
    await navigator.clipboard.writeText(text);
    showToast("✅ Carta copiada. Ahora solo falta entregarla con besito incluido.");
  }catch{
    showToast("⚠️ No pude copiar automáticamente. Selecciona el texto y copia manual.");
  }
});

$("#downloadLove").addEventListener("click", ()=>{
  const text = document.querySelector(".paper-inner").innerText.trim();
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
    if (cb.checked) burstHearts(10);
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

$("#toggleCountMode").addEventListener("click", ()=>{
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
$("#sparkBtn").addEventListener("click", ()=>{
  setLove(Math.min(100, love + 7));
  burstConfetti(24);
  showToast("🌟 Upgrade aplicado. El amor escaló a la nube.");
});
setLove(100);

// ====== Moments (custom timeline entries) ======
const momentsKey = "love_moments_v1";
let moments = JSON.parse(localStorage.getItem(momentsKey) || "[]");

function renderMoments(){
  const box = $("#moments");
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

$("#addMomentBtn").addEventListener("click", ()=>{
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

// ====== Gallery upload + modal ======
const gallery = $("#gallery");
const modal = $("#modal");
const modalImg = $("#modalImg");
const modalCaption = $("#modalCaption");

function openModal(src, caption){
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  modalImg.src = src;
  modalCaption.textContent = caption || "";
}
function closeModal(){
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalImg.src = "";
}
$("#closeModal").addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{ if (e.target === modal) closeModal(); });
window.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeModal(); });

gallery.addEventListener("click", (e)=>{
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

$("#photoInput").addEventListener("change", (e)=>{
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  // limpia placeholders y llena con imágenes (máx 12 para no romper performance)
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

  burstConfetti(36);
  showToast("🖼️ Fotos cargadas. Esto ya parece museo del amor.");
});

// ====== Quiz ======
$("#quiz").addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = new FormData(e.target);
  let score = 0;
  ["q1","q2","q3"].forEach(k=> score += Number(data.get(k) || 0));

  const res = $("#quizResult");
  res.hidden = false;

  const msg =
    score >= 30 ? "💯 Compatibilidad: legendaria. Esto es amor en alta disponibilidad." :
    score >= 20 ? "🔥 Compatibilidad: muy buena. Seguimos optimizando con besos." :
                  "💗 Compatibilidad: igual nos queremos, que es lo que importa.";

  res.textContent = `Score: ${score}/30 — ${msg}`;
  burstHearts(22);
});

// ====== Mini game: Catch hearts ======
let gameOn = false;
let score = 0;
let spawner = null;

function spawnInArena(){
  const arena = $("#arena");
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
    spawnParticle(
      arena.getBoundingClientRect().left + x + 24,
      arena.getBoundingClientRect().top + y + 24,
      "heart"
    );
  });

  arena.appendChild(el);
}

$("#gameBtn").addEventListener("click", ()=>{
  gameOn = !gameOn;
  const btn = $("#gameBtn");

  if (gameOn){
    score = 0;
    $("#score").textContent = score;
    btn.textContent = "⏹ Detener";
    showToast("🎯 Juego iniciado. Atrapa corazones, rápido.");
    spawner = setInterval(spawnInArena, 380);
  } else {
    btn.textContent = "▶ Iniciar";
    clearInterval(spawner);
    spawner = null;
    showToast(`🏁 Fin del juego. Puntos: ${score}. (Te debo ${score} besos).`);
    burstConfetti(28);
    // limpia arena
    $("#arena").innerHTML = "";
  }
});

// ====== Buttons: hearts/confetti/music/start/final ======
$("#confettiBtn").addEventListener("click", ()=>{
  burstConfetti(60);
  showToast("✨ Confeti desplegado. Romanticismo en modo turbo.");
});

$("#startHearts").addEventListener("click", ()=>{
  burstHearts(60);
  showToast("💞 Corazones activados. La página quedó oficialmente enamorada.");
});

$("#bigYes").addEventListener("click", ()=>{
  burstConfetti(60);
  burstHearts(40);
  showToast("😳 Beso aprobado. Procede con cariño y sonrisa.");
});

$("#resetAll").addEventListener("click", ()=>{
  // reset UI-ish, sin borrar fotos (por seguridad)
  setLove(100);
  $("#quizResult").hidden = true;
  $("#envelope").classList.remove("open");
  showToast("🔄 Magia reiniciada. Volvimos al capítulo 1.");
  burstHearts(24);
});

// ====== Music toggle ======
const bgm = $("#bgm");
let musicOn = false;

async function toggleMusic(){
  musicOn = !musicOn;
  const b = $("#musicBtn");
  b.setAttribute("aria-pressed", String(musicOn));
  b.textContent = musicOn ? "🔊 Música" : "🔈 Música";

  try{
    if (musicOn){
      await bgm.play();
      showToast("🎶 Música ON. Ambiente romántico activado.");
    } else {
      bgm.pause();
      showToast("🔇 Música OFF. Silencio, pero con amor.");
    }
  }catch{
    // algunos navegadores bloquean autoplay hasta interacción
    showToast("⚠️ Tu navegador bloqueó la música. Toca el botón otra vez después de interactuar.");
  }
}
$("#musicBtn").addEventListener("click", toggleMusic);

// ====== First load greeting ======
showToast(`💗 Bienvenida, ${girlfriendName}. Esta página es para ti.`);





















