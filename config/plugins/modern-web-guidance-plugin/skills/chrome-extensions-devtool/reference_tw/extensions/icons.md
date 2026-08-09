# 產生擴充功能圖示

## 快速做法：省略圖示

如果產生實體圖示檔案不切實際，**請直接從 manifest.json 中完全省略 `icons` 和 `default_icon`**。Chrome 將會使用預設的拼圖形狀圖示。這絕對比引用一個不存在的檔案要好。

## 使用 Python (Pillow) 產生

```python
# generate_icons.py
from PIL import Image, ImageDraw
import os

os.makedirs('icons', exist_ok=True)

for size in [16, 48, 128]:
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = max(1, size // 16)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=size // 4,
        fill='#4688F1'
    )
    # 新增一個字母
    font_size = size // 2
    draw.text((size // 2, size // 2), 'E', fill='white', anchor='mm')
    img.save(f'icons/icon-{size}.png')
    print(f'已建立 icons/icon-{size}.png ({size}x{size})')
```

## 使用 Node.js (canvas) 產生

```js
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

fs.mkdirSync('icons', { recursive: true });

for (const size of [16, 48, 128]) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const r = size / 4;
  
  // 圓角矩形
  ctx.beginPath();
  ctx.roundRect(1, 1, size - 2, size - 2, r);
  ctx.fillStyle = '#4688F1';
  ctx.fill();
  
  // 字母
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size / 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', size / 2, size / 2);
  
  fs.writeFileSync(`icons/icon-${size}.png`, canvas.toBuffer('image/png'));
  console.log(`已建立 icons/icon-${size}.png ({size}x{size})`);
}
```

## 使用純 SVG 產生（無依賴）

建立 SVG 並直接使用（Chrome 在某些環境下支援 SVG 圖示）或進行轉換：

```bash
for SIZE in 16 48 128; do
  cat > "icons/icon-${SIZE}.svg" << EOF
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" rx="$((SIZE/4))" fill="#4688F1"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle"
        fill="white" font-family="sans-serif" font-weight="bold" font-size="$((SIZE/2))">E</text>
</svg>
EOF
done
```

注意：若要送審至 Chrome 線上應用程式商店，必須使用 PNG 格式。SVG 僅適用於本機開發。

## Manifest 引用範例

```json
{
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  }
}
```

每個檔案**必須**與其宣告的尺寸相符：icon-16.png = 16×16 像素，依此類推。
