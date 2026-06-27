/**
 * 手动打包成可独立运行的 Windows 应用目录（无需 Node/npm，双击 exe 即用）。
 * 复制 Electron 运行时 -> 重命名为中文应用名 -> 写图标与版本信息 -> 注入应用代码。
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const pkg = require(path.join(root, 'package.json'));
const APPNAME = pkg.productName || pkg.name;
const distElectron = path.join(root, 'node_modules', 'electron', 'dist');
const releaseRoot = path.join(root, 'release');
const outDir = path.join(releaseRoot, APPNAME + '-win32-x64');
const icon = path.join(root, 'build', 'icon.ico');

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

(async () => {
  if (!fs.existsSync(path.join(distElectron, 'electron.exe'))) {
    throw new Error('未找到 node_modules/electron/dist/electron.exe，请先 npm install');
  }
  if (!fs.existsSync(path.join(root, 'dist', 'index.html'))) {
    throw new Error('未找到 dist/index.html，请先 npm run build');
  }

  console.log('清理旧产物...');
  fs.rmSync(releaseRoot, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  console.log('复制 Electron 运行时...');
  copyDir(distElectron, outDir);

  console.log('重命名可执行文件 -> ' + APPNAME + '.exe');
  const exePath = path.join(outDir, APPNAME + '.exe');
  fs.renameSync(path.join(outDir, 'electron.exe'), exePath);

  // 移除默认应用，使 Electron 加载我们的 resources/app
  fs.rmSync(path.join(outDir, 'resources', 'default_app.asar'), { force: true });

  console.log('注入应用代码 resources/app ...');
  const appDir = path.join(outDir, 'resources', 'app');
  fs.mkdirSync(appDir, { recursive: true });
  copyDir(path.join(root, 'dist'), path.join(appDir, 'dist'));
  copyDir(path.join(root, 'electron'), path.join(appDir, 'electron'));
  fs.mkdirSync(path.join(appDir, 'build'), { recursive: true });
  fs.copyFileSync(icon, path.join(appDir, 'build', 'icon.ico'));
  const slim = {
    name: pkg.name,
    version: pkg.version,
    main: pkg.main,
    productName: pkg.productName,
    description: pkg.description,
    author: pkg.author,
  };
  fs.writeFileSync(path.join(appDir, 'package.json'), JSON.stringify(slim, null, 2));

  console.log('写入图标与版本信息到 exe ...');
  const m = require('rcedit');
  const rcedit = m.default || m;
  await rcedit(exePath, {
    icon,
    'version-string': {
      ProductName: APPNAME,
      FileDescription: APPNAME,
      CompanyName: pkg.author || 'secure-artifacts',
      LegalCopyright: 'secure-artifacts',
    },
    'file-version': pkg.version,
    'product-version': pkg.version,
  });

  console.log('打包完成 ->', outDir);
  console.log('可执行文件 ->', exePath);
})().catch((e) => {
  console.error('打包失败:', (e && e.stack) || e);
  process.exit(1);
});
