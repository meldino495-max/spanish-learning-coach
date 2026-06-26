/**
 * 确保 Electron 二进制已解压（Windows 上 extract-zip 偶发失败时用 Expand-Archive）
 */
const { downloadArtifact } = require('@electron/get');
const extract = require('extract-zip');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const electronDir = path.join(__dirname, '..', 'node_modules', 'electron');
const { version } = require(path.join(electronDir, 'package.json'));
const distPath = path.join(electronDir, 'dist');
const platformPath = process.platform === 'win32' ? 'electron.exe' : 'electron';
const exePath = path.join(distPath, platformPath);

function isReady() {
  try {
    const pathTxt = path.join(electronDir, 'path.txt');
    return (
      fs.existsSync(exePath) &&
      fs.existsSync(pathTxt) &&
      fs.readFileSync(pathTxt, 'utf8') === platformPath
    );
  } catch {
    return false;
  }
}

function extractWithPowerShell(zip) {
  fs.mkdirSync(distPath, { recursive: true });
  const result = spawnSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -LiteralPath '${zip.replace(/'/g, "''")}' -DestinationPath '${distPath.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: 'inherit' },
  );
  if (result.status !== 0) {
    throw new Error('PowerShell Expand-Archive failed');
  }
}

async function main() {
  if (process.env.ELECTRON_SKIP_BINARY_DOWNLOAD === '1') return;
  if (!fs.existsSync(electronDir)) return;
  if (isReady()) {
    console.log('Electron binary already installed.');
    return;
  }

  console.log(`Installing Electron ${version}...`);
  fs.mkdirSync(distPath, { recursive: true });

  const zip = await downloadArtifact({
    version,
    artifactName: 'electron',
    platform: process.env.npm_config_platform || process.platform,
    arch: process.env.npm_config_arch || process.arch,
    force: process.argv.includes('--force'),
  });

  try {
    await extract(zip, { dir: distPath });
  } catch (err) {
    if (process.platform === 'win32') {
      console.warn('extract-zip failed, trying PowerShell Expand-Archive...');
      extractWithPowerShell(zip);
    } else {
      throw err;
    }
  }

  if (!fs.existsSync(exePath)) {
    throw new Error(`Missing ${exePath} after extract`);
  }

  await fs.promises.writeFile(path.join(electronDir, 'path.txt'), platformPath);
  console.log('Electron ready:', exePath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
