const { contextBridge, shell, ipcRenderer } = require('electron');



contextBridge.exposeInMainWorld('electronAPI', {

  isElectron: true,

  openExternal: (url) => {

    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {

      void shell.openExternal(url);

    }

  },

  openSoundSettings: () => {

    void shell.openExternal('ms-settings:sound');

  },

  getSetting: (key) => ipcRenderer.sendSync('get-setting-sync', key),

  setSetting: (key, value) => ipcRenderer.sendSync('set-setting-sync', key, value),

  openLogs: () => ipcRenderer.send('open-logs'),

  openaiChat: (args) => ipcRenderer.invoke('openai-chat', args),

  openaiChatStream: (args, onDelta) =>

    new Promise((resolve) => {

      const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const channel = `openai-stream:${requestId}`;

      const listener = (_e, msg) => {

        if (!msg) return;

        if (msg.type === 'delta') {

          try {

            onDelta && onDelta(msg.delta);

          } catch {

            /* ignore */

          }

        } else if (msg.type === 'done') {

          ipcRenderer.removeListener(channel, listener);

          resolve({ ok: true, content: msg.content || '' });

        } else if (msg.type === 'error') {

          ipcRenderer.removeListener(channel, listener);

          resolve({ ok: false, error: msg.error || 'OpenAI 流式请求失败' });

        }

      };

      ipcRenderer.on(channel, listener);

      ipcRenderer.send('openai-chat-stream', Object.assign({}, args, { requestId }));

    }),

  azurePron: (args) => ipcRenderer.invoke('azure-pron', args),

});

