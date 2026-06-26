/**

 * 独立桌面壳（Electron 内置 Chromium）

 * 不依赖用户本机安装的 Chrome / Edge

 */

const { app, BrowserWindow, shell, session, ipcMain, net } = require('electron');

const path = require('path');

const fs = require('fs');

const http = require('http');

const { spawn } = require('child_process');



const ROOT = path.join(__dirname, '..');

const DIST = path.join(ROOT, 'dist');

const PORT = Number(process.env.DESKTOP_PORT || 4173);

const APP_URL = `http://127.0.0.1:${PORT}/`;

const isDev = process.env.DESKTOP_DEV === '1';



let mainWindow = null;

let serverChild = null;

let httpServer = null;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
};



app.setPath('userData', path.join(ROOT, '.app-data'));



const SETTINGS_PATH = path.join(app.getPath('userData'), 'coach-settings.json');

const LOG_DIR = path.join(app.getPath('userData'), 'logs');

const LOG_FILE = path.join(LOG_DIR, 'app.log');

const MAX_LOG_BYTES = 2 * 1024 * 1024;

let logStream = null;

function initLogger() {

  try {

    fs.mkdirSync(LOG_DIR, { recursive: true });

    try {

      if (fs.statSync(LOG_FILE).size > MAX_LOG_BYTES) fs.rmSync(LOG_FILE);

    } catch {

      /* 文件不存在则忽略 */

    }

    logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

  } catch {

    logStream = null;

  }

}

function writeLog(level, args) {

  const text = args

    .map((a) => (a instanceof Error ? a.stack || a.message : typeof a === 'object' ? JSON.stringify(a) : String(a)))

    .join(' ');

  const line = `[${new Date().toISOString()}] [${level}] ${text}\n`;

  try {

    logStream && logStream.write(line);

  } catch {

    /* ignore */

  }

}

initLogger();

console.log = (...a) => writeLog('INFO', a);

console.error = (...a) => writeLog('ERROR', a);

console.warn = (...a) => writeLog('WARN', a);

writeLog('INFO', ['========== 应用启动 ==========']);



function loadSettings() {

  try {

    return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));

  } catch {

    return {};

  }

}



function saveSettings(data) {

  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });

  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), 'utf8');

}



function getSetting(key) {

  const data = loadSettings();

  return data[key] ?? null;

}



function setSetting(key, value) {

  const data = loadSettings();

  data[key] = value;

  saveSettings(data);

}



ipcMain.on('get-setting-sync', (event, key) => {

  event.returnValue = getSetting(key);

});



ipcMain.on('set-setting-sync', (event, key, value) => {

  setSetting(key, value);

  event.returnValue = true;

});

ipcMain.on('open-logs', () => {

  void shell.openPath(LOG_DIR);

});



// OpenAI 代理：在主进程用 electron net 发起请求，绕过渲染进程 CORS。

ipcMain.handle('openai-chat', async (_event, args) => {

  return new Promise((resolve) => {

    try {

      const baseUrl = String((args && args.baseUrl) || 'https://api.openai.com/v1').replace(/\/+$/, '');

      const apiKey = String((args && args.apiKey) || '');

      const payload = (args && args.payload) || {};

      if (!apiKey) {

        resolve({ ok: false, error: '尚未设置 OpenAI API Key。' });

        return;

      }

      const url = `${baseUrl}/chat/completions`;

      const request = net.request({ method: 'POST', url });

      request.setHeader('Content-Type', 'application/json');

      request.setHeader('Authorization', `Bearer ${apiKey}`);

      let body = '';

      request.on('response', (response) => {

        response.on('data', (chunk) => {

          body += chunk.toString();

        });

        response.on('end', () => {

          const status = response.statusCode || 0;

          if (status < 200 || status >= 300) {

            writeLog('ERROR', [`OpenAI ${status}: ${body.slice(0, 300)}`]);

            resolve({ ok: false, error: `OpenAI ${status}: ${body.slice(0, 500)}` });

            return;

          }

          try {

            const data = JSON.parse(body);

            const content =

              (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||

              '';

            resolve({ ok: true, content });

          } catch (e) {

            resolve({ ok: false, error: '解析 OpenAI 响应失败。' });

          }

        });

      });

      request.on('error', (err) => {

        writeLog('ERROR', ['OpenAI 请求失败:', String((err && err.message) || err)]);

        resolve({ ok: false, error: String((err && err.message) || err) });

      });

      request.write(JSON.stringify(payload));

      request.end();

    } catch (err) {

      resolve({ ok: false, error: String((err && err.message) || err) });

    }

  });

});



// OpenAI 流式代理：逐块把 SSE delta 发回渲染进程，结束时回传完整内容。

ipcMain.on('openai-chat-stream', (event, args) => {

  const requestId = (args && args.requestId) || '';

  const channel = `openai-stream:${requestId}`;

  const reply = (msg) => {

    if (!event.sender.isDestroyed()) event.sender.send(channel, msg);

  };

  try {

    const baseUrl = String((args && args.baseUrl) || 'https://api.openai.com/v1').replace(/\/+$/, '');

    const apiKey = String((args && args.apiKey) || '');

    const payload = Object.assign({}, (args && args.payload) || {}, { stream: true });

    if (!apiKey) {

      reply({ type: 'error', error: '尚未设置 OpenAI API Key。' });

      return;

    }

    const request = net.request({ method: 'POST', url: `${baseUrl}/chat/completions` });

    request.setHeader('Content-Type', 'application/json');

    request.setHeader('Authorization', `Bearer ${apiKey}`);

    let full = '';

    let buffer = '';

    let errorBody = '';

    request.on('response', (response) => {

      const status = response.statusCode || 0;

      const ok = status >= 200 && status < 300;

      response.on('data', (chunk) => {

        if (!ok) {

          errorBody += chunk.toString();

          return;

        }

        buffer += chunk.toString();

        let nl;

        while ((nl = buffer.indexOf('\n')) !== -1) {

          const line = buffer.slice(0, nl).trim();

          buffer = buffer.slice(nl + 1);

          if (!line.startsWith('data:')) continue;

          const data = line.slice(5).trim();

          if (data === '[DONE]') continue;

          try {

            const json = JSON.parse(data);

            const delta = json && json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;

            if (delta) {

              full += delta;

              reply({ type: 'delta', delta });

            }

          } catch {

            /* 不完整的行，忽略 */

          }

        }

      });

      response.on('end', () => {

        if (!ok) {

          writeLog('ERROR', [`OpenAI stream ${status}: ${errorBody.slice(0, 300)}`]);

          reply({ type: 'error', error: `OpenAI ${status}: ${errorBody.slice(0, 500)}` });

          return;

        }

        reply({ type: 'done', content: full });

      });

    });

    request.on('error', (err) => {

      writeLog('ERROR', ['OpenAI 流式请求失败:', String((err && err.message) || err)]);

      reply({ type: 'error', error: String((err && err.message) || err) });

    });

    request.write(JSON.stringify(payload));

    request.end();

  } catch (err) {

    reply({ type: 'error', error: String((err && err.message) || err) });

  }

});



// Azure 发音评测代理：在主进程发送二进制 WAV，避免渲染进程 CORS 与二进制处理麻烦。

ipcMain.handle('azure-pron', async (_event, args) => {

  return new Promise((resolve) => {

    try {

      const region = String((args && args.region) || '').trim();

      const key = String((args && args.key) || '');

      const language = String((args && args.language) || 'es-ES');

      const assessment = String((args && args.assessment) || '');

      const audioBase64 = String((args && args.audioBase64) || '');

      if (!region || !key) {

        resolve({ ok: false, error: '尚未设置 Azure 语音 Key 与区域。' });

        return;

      }

      const audio = Buffer.from(audioBase64, 'base64');

      const url = `https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(language)}`;

      const request = net.request({ method: 'POST', url });

      request.setHeader('Ocp-Apim-Subscription-Key', key);

      request.setHeader('Content-Type', 'audio/wav; codecs=audio/pcm; samplerate=16000');

      request.setHeader('Pronunciation-Assessment', assessment);

      request.setHeader('Accept', 'application/json');

      let body = '';

      request.on('response', (response) => {

        response.on('data', (chunk) => {

          body += chunk.toString();

        });

        response.on('end', () => {

          const status = response.statusCode || 0;

          if (status < 200 || status >= 300) {

            writeLog('ERROR', [`Azure ${status}: ${body.slice(0, 300)}`]);

            resolve({ ok: false, error: `Azure ${status}: ${body.slice(0, 400)}` });

            return;

          }

          resolve({ ok: true, body });

        });

      });

      request.on('error', (err) => {

        writeLog('ERROR', ['Azure 发音评测失败:', String((err && err.message) || err)]);

        resolve({ ok: false, error: String((err && err.message) || err) });

      });

      request.write(audio);

      request.end();

    } catch (err) {

      resolve({ ok: false, error: String((err && err.message) || err) });

    }

  });

});



function waitForServer(maxMs = 60000) {

  const start = Date.now();

  return new Promise((resolve, reject) => {

    const tick = () => {

      const req = http.get(APP_URL, (res) => {

        res.resume();

        resolve();

      });

      req.on('error', () => {

        if (Date.now() - start > maxMs) reject(new Error('本地服务启动超时'));

        else setTimeout(tick, 300);

      });

    };

    tick();

  });

}



// 生产模式：直接在主进程内用 http 模块伺服 dist 静态文件。
// 这样不再 spawn 外部 vite 子进程，杜绝子进程残留占用端口的问题，启动也更快。
function startStaticServer() {
  return new Promise((resolve, reject) => {
    httpServer = http.createServer((req, res) => {
      try {
        const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
        let filePath = path.join(DIST, pathname);

        // 防止路径穿越
        if (filePath !== DIST && !filePath.startsWith(DIST + path.sep)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }

        let stat = null;
        try {
          stat = fs.statSync(filePath);
        } catch {
          stat = null;
        }

        if (stat && stat.isDirectory()) {
          filePath = path.join(filePath, 'index.html');
          try {
            stat = fs.statSync(filePath);
          } catch {
            stat = null;
          }
        }

        if (!stat) {
          // 没有扩展名的当作 SPA 路由，回退到 index.html
          if (!path.extname(pathname)) {
            filePath = path.join(DIST, 'index.html');
          } else {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
        }

        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } catch (e) {
        res.writeHead(500);
        res.end('Server error');
      }
    });

    httpServer.on('error', reject);
    httpServer.listen(PORT, '127.0.0.1', () => {
      writeLog('SERVER', [`内置静态服务已启动: ${APP_URL}`]);
      resolve();
    });
  });
}

function startLocalServer() {

  if (!isDev && !fs.existsSync(path.join(DIST, 'index.html'))) {

    throw new Error('请先运行 npm run build');

  }

  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

  const args = ['vite', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'];

  serverChild = spawn(cmd, args, {

    cwd: ROOT,

    shell: true,

    windowsHide: true,

    stdio: ['ignore', 'pipe', 'pipe'],

    env: { ...process.env, DESKTOP_PORT: String(PORT) },

  });

  serverChild.stdout?.on('data', (d) => writeLog('SERVER', [String(d).trimEnd()]));

  serverChild.stderr?.on('data', (d) => writeLog('SERVER', [String(d).trimEnd()]));

  serverChild.on('error', (err) => console.error('本地服务启动失败:', err));

}



function createWindow() {

  mainWindow = new BrowserWindow({

    width: 1280,

    height: 860,

    minWidth: 920,

    minHeight: 640,

    title: '多语言学习教练',

    autoHideMenuBar: true,

    webPreferences: {

      preload: path.join(__dirname, 'preload.cjs'),

      contextIsolation: true,

      nodeIntegration: false,

      sandbox: true,

      partition: 'persist:coach',

    },

  });



  mainWindow.loadURL(APP_URL);



  mainWindow.webContents.setWindowOpenHandler(({ url }) => {

    if (/^https?:\/\//i.test(url)) {

      void shell.openExternal(url);

      return { action: 'deny' };

    }

    return { action: 'allow' };

  });



  mainWindow.on('closed', () => {

    mainWindow = null;

  });

}



function shutdownServer() {

  if (serverChild && serverChild.pid && !serverChild.killed) {

    try {

      // Windows 下用 shell 启动的子进程，需用 taskkill /T 连同子进程树一起结束，

      // 否则 vite/esbuild 会残留并继续占用端口。

      if (process.platform === 'win32') {

        spawn('taskkill', ['/pid', String(serverChild.pid), '/T', '/F']);

      } else {

        serverChild.kill();

      }

    } catch {

      /* ignore */

    }

    serverChild = null;

  }

  if (httpServer) {

    try {

      httpServer.close();

    } catch {

      /* ignore */

    }

    httpServer = null;

  }

}



// 单实例锁：避免重复双击启动多个实例互相抢端口。
const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  } else if (gotSingleInstanceLock) {
    createWindow();
  }
});

if (gotSingleInstanceLock)
app.whenReady().then(async () => {

  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) => {

    if (permission === 'media' || permission === 'audioCapture' || permission === 'speaker-selection') {

      callback(true);

      return;

    }

    callback(false);

  });



  session.defaultSession.setPermissionCheckHandler((_wc, permission) => {

    return permission === 'media' || permission === 'audioCapture' || permission === 'speaker-selection';

  });



  try {

    if (isDev) {

      startLocalServer();

      await waitForServer();

    } else {

      if (!fs.existsSync(path.join(DIST, 'index.html'))) {

        throw new Error('请先运行 npm run build');

      }

      await startStaticServer();

    }

    createWindow();

  } catch (err) {

    console.error(err.message || err);

    shutdownServer();

    app.quit();

  }

});



app.on('window-all-closed', () => {

  shutdownServer();

  if (process.platform !== 'darwin') app.quit();

});



app.on('before-quit', shutdownServer);



app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) createWindow();

});


