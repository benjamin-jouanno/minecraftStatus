const skins = ["linear-gradient(#4b271b 0 22%,#a9653e 22% 47%,#f0ad77 47% 83%,#82503c 83%)", "linear-gradient(#ef8b36 0 22%,#f5ba8f 22% 52%,#f4d29f 52% 80%,#6cbc69 80%)", "linear-gradient(#573823 0 23%,#926040 23% 52%,#c58e63 52% 80%,#5a3a29 80%)", "linear-gradient(#f2d271 0 24%,#f5cf91 24% 54%,#fae2b4 54% 81%,#69b4a5 81%)"];
const statusApi = 'https://api.mcsrvstat.us/3/169.155.122.96:9130';

function renderStatus(data, offline) {
  document.querySelector('.server-card').classList.toggle('is-offline', offline);
  document.querySelector('#status-text').textContent = offline ? 'OFFLINE' : 'ONLINE';
  document.querySelector('#server-address').childNodes[0].textContent = `${data.host}:${data.port}`;
  document.querySelector('#server-details').textContent = offline ? 'Server unreachable' : data.version;
  document.querySelector('#online-count').textContent = data.players?.online || 0;
  document.querySelector('#max-count').textContent = data.players?.max || 0;
  document.querySelector('#version').textContent = data.version || '—';
  if (data.icon) {
    const icon = document.querySelector('#server-icon');
    icon.style.backgroundImage = `url("${data.icon}")`;
    icon.classList.add('has-server-icon');
  }
  const players = data.players?.list || [];
  document.querySelector('#player-list').innerHTML = players.length ? players.map((name, index) => `<article class="player"><span class="avatar" style="background:${skins[index % skins.length]}"></span><span class="player-name">${name}</span><span class="status-dot" title="Online"></span></article>`).join('') : `<article class="player"><span class="player-name">${offline ? 'No connection to server' : 'No player names exposed by server'}</span></article>`;
}

async function refreshStatus() {
  const started = performance.now();
  try {
    const response = await fetch(statusApi, { cache: 'no-store' });
    const data = await response.json();
    renderStatus({ ...data, host: data.ip || '169.155.122.96', port: data.port || 9130 }, !response.ok || !data.online);
    document.querySelector('#ping').textContent = `${Math.round(performance.now() - started)} ms`;
  } catch {
    renderStatus({ host: '169.155.122.96', port: 9130, players: {} }, true);
  }
}

refreshStatus();
setInterval(refreshStatus, 5000);
document.querySelector('.close-button').addEventListener('click', () => document.querySelector('.server-card').classList.toggle('is-minimized'));
