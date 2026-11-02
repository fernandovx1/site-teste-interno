// ---- Fundo animado (canvas): partículas ligadas por linhas, pesado de propósito ----
const cv = document.getElementById('bg');
const ctx = cv.getContext('2d');
let W, H, P = [];
function resize() {
  W = cv.width = innerWidth;
  H = cv.height = innerHeight;
  P = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6 }));
}
addEventListener('resize', resize);
resize();

(function frame() {
  ctx.clearRect(0, 0, W, H);
  for (const p of P) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(p.x, p.y, 2, 2);
  }
  for (let i = 0; i < P.length; i++) {
    for (let j = i + 1; j < P.length; j++) {
      const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y);
      if (d < 120) {
        ctx.strokeStyle = `rgba(59,130,246,${1 - d / 120})`;
        ctx.beginPath();
        ctx.moveTo(P[i].x, P[i].y);
        ctx.lineTo(P[j].x, P[j].y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(frame);
})();

// ---- Dados: baixa ~3 MB de JSON, calcula estatísticas e renderiza uma tabela grande ----
const $ = (id) => document.getElementById(id);
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
let rows = [];

async function load() {
  const t0 = performance.now();
  rows = await (await fetch('data.json')).json();
  const total = rows.reduce((s, r) => s + r.valor, 0);
  $('total').textContent = rows.length.toLocaleString('pt-BR');
  $('soma').textContent = brl(total);
  $('media').textContent = brl(total / rows.length);
  $('ativos').textContent = rows.filter((r) => r.status === 'ativo').length.toLocaleString('pt-BR');
  $('stats').textContent = `Dados carregados e processados em ${Math.round(performance.now() - t0)} ms.`;
  render();
}

function render() {
  const q = $('q').value.toLowerCase();
  const st = $('st').value;
  const view = rows.filter((r) => (!st || r.status === st) && (!q || r.nome.toLowerCase().includes(q) || r.cidade.toLowerCase().includes(q)));
  $('count').textContent = view.length.toLocaleString('pt-BR');
  $('body').innerHTML = view
    .slice(0, 1500)
    .map((r) => `<tr><td>${r.id}</td><td>${r.nome}</td><td>${r.cidade}</td><td><span class="tag ${r.status}">${r.status}</span></td><td>${brl(r.valor)}</td></tr>`)
    .join('');
}

$('q').addEventListener('input', render);
$('st').addEventListener('change', render);
$('bench').addEventListener('click', () => {
  const t0 = performance.now();
  let x = 0;
  for (let i = 0; i < 4e7; i++) x += Math.sqrt(i);
  $('stats').textContent = `Teste de CPU (40 milhões de raízes) em ${Math.round(performance.now() - t0)} ms.`;
});
load();
