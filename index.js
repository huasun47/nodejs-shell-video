const fs = require("fs");
const { join, extname } = require("path");
const { read, intToRGBA } = require("jimp");
const { echo, exit } = require("shelljs");

const floder = `/Users/zehua/Sites/github-repositories/nodejs-shell-video/assets/images/cool-moto/`;

// 构成字符： 颜色由 深到浅, 也可以增加符号
const charts = `@&$%=+!^*~- `;

const maxIndex = charts.length - 1;
const limitIndex = (num) => (num > maxIndex ? maxIndex : num);

fs.readdir(floder, undefined, (err, data) => {
  if (err) throw err;

  // 6. 过滤非 png 并排序
  const files = data.filter((url) => extname(url) === ".png");
  files.sort((a, b) => parseInt(a) - parseInt(b));

  // 7. 递归播放
  play(files);
});

const play = (files) => {
  const printFileName = files.shift();

  print(printFileName);

  if (files.length) {
    setTimeout(() => {
      play(files);
      // ps: 在 js 中 时间函数不可使用 小数 或 负数，否则会立即执行
    }, parseInt(1000 / 15)); // 15 取决于 ffmpeg 分割的帧数

    return;
  }
  exit(1);
};

const print = (fileName) => {
  let subCharts = "";

  // 1. 读取图片
  const fileURL = join(floder, fileName);

  read(fileURL).then((image) => {
    // 2 获取宽高 ps: 方法不可结构，会报错
    const width = image.getWidth();
    const height = image.getHeight();

    // 6. 调整合适的缩放比例 很重要
    const xScale = width / 220;
    const yScale = height / 40;

    for (let y = 0; y < height; y += yScale) {
      for (let x = 0; x < width; x += xScale) {
        const { r, g, b } = intToRGBA(image.getPixelColor(x, y));

        // 3. 读取像素点 的 灰度值
        const gray = (0.3 * r + 0.59 * g + 0.11 * b).toFixed(2);

        // 4. 算出灰度值在 charts 中表达的位置
        const grayScale = parseFloat(gray / 255).toFixed(2);
        const grayDegree = parseInt(grayScale * charts.length);
        // +0.5 感觉更亮些
        const index = Math.floor(limitIndex(grayDegree + 0.5));

        // 5. 拼接
        subCharts += charts[index];
      }
      subCharts += "\n";
    }

    echo(subCharts);
  });
};

/**
 *  感谢 https://www.bilibili.com/video/BV1mW4y1a7Jn/?p=1 提供 go 版本的教程
 */
