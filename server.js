const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const PORT = Number(process.env.PORT || 4173);
const MINECRAFT_HOST = process.env.MINECRAFT_HOST || '169.155.122.96';
const MINECRAFT_PORT = Number(process.env.MINECRAFT_PORT || 9130);
const files = new Map([['/', 'index.html'], ['/index.html', 'index.html'], ['/styles.css', 'styles.css'], ['/app.js', 'app.js']]);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8' };

function serverStatus() {
  return new Promise((resolve, reject) => {
    const address = encodeURIComponent(`${MINECRAFT_HOST}:${MINECRAFT_PORT}`);
    const request = https.get(`https://api.mcsrvstat.us/3/${address}`, { headers: { 'User-Agent': 'Minecraft-Status-Dashboard' } }, apiResponse => {
      let body = '';
      apiResponse.setEncoding('utf8');
      apiResponse.on('data', chunk => { body += chunk; });
      apiResponse.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (apiResponse.statusCode !== 200) return reject(new Error(`Status service returned ${apiResponse.statusCode}`));
          resolve(data);
        } catch { reject(new Error('Could not parse status service response')); }
      });
    });
    request.setTimeout(7000, () => request.destroy(new Error('Status service timed out')));
    request.once('error', reject);
  });
}

http.createServer(async (request, response) => {
  if (request.url === '/api/status') {
    try {
      const data = await serverStatus(), list = data.players?.list || [];
      response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ online: Boolean(data.online), host: MINECRAFT_HOST, port: MINECRAFT_PORT, version: data.version || 'Unknown', players: { online: data.players?.online || 0, max: data.players?.max || 0, list } }));
    } catch (error) {
      response.writeHead(503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify({ online: false, host: MINECRAFT_HOST, port: MINECRAFT_PORT, error: error.message }));
    }
    return;
  }
  const name = files.get(request.url);
  if (!name) { response.writeHead(404); return response.end('Not found'); }
  const file = path.join(__dirname, name);
  response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'text/plain' });
  fs.createReadStream(file).pipe(response);
}).listen(PORT, () => console.log(`Dashboard: http://localhost:${PORT}`));
