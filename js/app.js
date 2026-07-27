'use strict';

const CELLS = ['UUR','MIN','KOP','L1','R1','L2','R2','L3','R3'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let positions = [];
let current = 0;
let busy = false;
let playToken = 0;

async function loadData() {
  const manifestResponse = await fetch('data/manifest.json', { cache: 'no-store' });
  if (!manifestResponse.ok) throw new Error(`Manifest laden mislukt (${manifestResponse.status})`);
  const manifest = await manifestResponse.json();
  const chunks = await Promise.all(manifest.chunks.map(async file => {
    const response = await fetch(file, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${file} laden mislukt (${response.status})`);
    return response.json();
  }));
  positions = chunks.flatMap(chunk => chunk.positions).sort((a,b) => a.position - b.position);
  validatePositions(positions);
  document.getElementById('version').textContent = `v${manifest.version} · ${manifest.scope}`;
}

function validatePositions(items) {
  if (!Array.isArray(items) || items.length === 0) throw new Error('Geen CTA-posities gevonden.');
  const seen = new Set();
  for (const item of items) {
    if (!Number.isInteger(item.position)) throw new Error('Positie zonder geldig nummer gevonden.');
    if (seen.has(item.position)) throw new Error(`Dubbele positie ${item.position}.`);
    seen.add(item.position);
    if (!item.cells || typeof item.cells !== 'object') throw new Error(`Positie ${item.position} mist cellen.`);
    for (const name of ['KOP','L1','R1','L2','R2','L3','R3']) {
      if (!Array.isArray(item.cells[name])) throw new Error(`Positie ${item.position} mist ${name}.`);
      if (item.cells[name].length > 2) throw new Error(`Positie ${item.position}, ${name}: meer dan twee regels.`);
      for (const line of item.cells[name]) {
        if (typeof line.text !== 'string') throw new Error(`Positie ${item.position}, ${name}: tekst ontbreekt.`);
        if (!['blue','red'].includes(line.color)) throw new Error(`Positie ${item.position}, ${name}: ongeldige kleur.`);
      }
    }
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

function timeLines(position, name) {
  if (name === 'UUR') return position.position >= 1 ? [{ text: '', color: 'blue' }] : [];
  if (name === 'MIN') return position.position === 0 ? [] : [{ text: String(position.position - 1).padStart(2,'0'), color: 'blue', size: 'large' }];
  return position.cells[name] || [];
}

function lineHtml(line) {
  const logo = line.logo ? `<span class="logo ${line.logo === 'ICE' ? 'ice' : 'cnl'}">${line.logo === 'ICE' ? 'ICE' : 'CityNightLine'}</span>` : '';
  return `${logo}<span>${escapeHtml(line.text)}</span>`;
}

function flapHtml(position, name) {
  const lines = timeLines(position, name);
  let content = '';
  if (lines.length === 1) {
    const size = lines[0].size === 'large' ? 'large' : (lines[0].text.length > 22 ? 'compact' : '');
    content = `<div class="line full ${size} ${lines[0].color || 'blue'}">${lineHtml(lines[0])}</div>`;
  } else {
    lines.slice(0,2).forEach((line,index) => {
      content += `<div class="line half ${index ? 'lower' : 'upper'} ${line.color || 'blue'}">${lineHtml(line)}</div>`;
    });
  }
  return `<div class="flap"><div class="face">${content}</div></div>`;
}

function render(index, animate = true) {
  const position = positions[index];
  CELLS.forEach(name => {
    const cell = document.querySelector(`[data-cell="${name}"]`);
    cell.innerHTML = flapHtml(position, name);
    if (animate) {
      cell.classList.remove('turning');
      void cell.offsetWidth;
      cell.classList.add('turning');
    }
  });
  current = index;
  document.getElementById('position').value = String(index);
  document.getElementById('tech').textContent = String(position.position).padStart(2,'0');
  document.getElementById('shown').textContent = position.displayedNumber;
  document.getElementById('source').textContent = position.source;
  const state = document.getElementById('state');
  state.textContent = position.status === 'review' ? 'Controle nodig' : 'Bevestigd';
  state.className = position.status === 'review' ? 'review' : 'confirmed';
  const note = document.getElementById('note');
  note.textContent = position.note || 'Deze stand is inhoudelijk bevestigd.';
  note.className = `note${position.status === 'review' ? ' warning' : ''}`;
  document.querySelectorAll('.audit-chip').forEach((chip,chipIndex) => chip.classList.toggle('active', chipIndex === index));
}

async function rotateTo(target) {
  if (busy || target < 0 || target >= positions.length) return;
  busy = true;
  document.querySelectorAll('button,select').forEach(element => element.disabled = true);
  while (current !== target) {
    render((current + 1) % positions.length, true);
    await sleep(210);
  }
  document.querySelectorAll('button,select').forEach(element => element.disabled = false);
  busy = false;
}

function buildControls() {
  const select = document.getElementById('position');
  const audit = document.getElementById('audit');
  positions.forEach((position,index) => {
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = `${String(position.position).padStart(2,'0')} · getoond ${position.displayedNumber}`;
    select.appendChild(option);
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `audit-chip${position.status === 'review' ? ' bad' : ''}`;
    chip.textContent = position.displayedNumber === '—' ? 'leeg' : position.displayedNumber;
    chip.title = `${position.source} — ${position.status === 'review' ? 'controle nodig' : 'bevestigd'}`;
    chip.addEventListener('click', () => rotateTo(index));
    audit.appendChild(chip);
  });
  render(0,false);
}

function scale() {
  const stage = document.getElementById('stage');
  const scaler = document.getElementById('scaler');
  const factor = Math.min((stage.clientWidth - 12) / 1112, (stage.clientHeight - 12) / 600, 1);
  scaler.style.transform = `scale(${Math.max(.25, factor)})`;
}

function bindEvents() {
  document.getElementById('position').addEventListener('change', event => rotateTo(Number(event.target.value)));
  document.getElementById('prev').addEventListener('click', () => rotateTo((current - 1 + positions.length) % positions.length));
  document.getElementById('next').addEventListener('click', () => rotateTo((current + 1) % positions.length));
  document.getElementById('play').addEventListener('click', async () => {
    const token = ++playToken;
    for (let index = 0; index < positions.length && token === playToken; index += 1) {
      await rotateTo(index);
      await sleep(500);
    }
  });
  addEventListener('resize', scale);
}

async function start() {
  try {
    await loadData();
    buildControls();
    bindEvents();
    requestAnimationFrame(scale);
  } catch (error) {
    console.error(error);
    const state = document.getElementById('state');
    state.textContent = 'Laadfout';
    state.className = 'error';
    document.getElementById('note').textContent = `${error.message} Start het project via Live Server of een andere lokale webserver.`;
  }
}

start();
