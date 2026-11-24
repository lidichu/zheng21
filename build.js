// 產生 GitHub Pages 用的 docs\ 資料夾：index.html 外面補上 doctype 外框，四個 .js 原樣複製
// 用法：node build.js（改完 zheng\ 裡的檔案後執行，再 commit、push）
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, 'zheng'), out = path.join(__dirname, 'docs');
fs.mkdirSync(out, { recursive: true });
const body = fs.readFileSync(path.join(src, 'index.html'), 'utf8');
fs.writeFileSync(path.join(out, 'index.html'),
  '<!doctype html>\n<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">\n</head><body>\n' + body + '\n</body></html>\n');
for (const f of ['avatar.js', 'data.js', 'events.js', 'game.js']) fs.copyFileSync(path.join(src, f), path.join(out, f));
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log('docs\\ 已更新');
