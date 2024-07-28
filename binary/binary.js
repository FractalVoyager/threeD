const fs = require("fs");

// file path is from root level
const readBinaryFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

const convertByteArrayToPixelArray = (byteArray) => {
  const totalBits = byteArray.length * 8;
  const bitArray = new Array(totalBits);
  for (let i = 0; i < byteArray.length; i++) {
    const byte = byteArray[i];
    for (let j = 0; j < 8; j++) {
      // Extract each bit and store it in the bitArray
      bitArray[i * 8 + j] = (byte >> (7 - j)) & 1;
    }
  }
  return bitArray;
};

// checker
const checker = (pixelArray) => {
  let blackCount = 0;
  let whiteCount = 0;

  pixelArray.forEach((pixel) => {
    if (pixel === 1) {
      blackCount++;
    } else if (pixel === 0) {
      whiteCount++;
    }
  });

  const blackPercentage = (blackCount / pixelArray.length) * 100;
  const whitePercentage = (whiteCount / pixelArray.length) * 100;

  return { blackPercentage, whitePercentage };
};

const convertIdxToCord = (idx, length) => {
  // find point in terms of 2d
  let down = Math.floor(idx / length);
  let across = idx % length;

  return [across, down];

  ////////////////////////////
  ////////////////////////////
  ////////////////////////////

  // old stuff to convert to x,y corodinates, but think it'll be easiest to keep
  // the canvas corods
  // need to convert 1d idx to corodinate in -.5*length ... plane
  // weird because no zeros

  // let half = length / 2;
  // let x;
  // let y;

  // if (across >= half) {
  //   // x is positive
  //   x = across + 1 - half;
  // } else {
  //   // x is neg
  //   x = across - half;
  // }

  // if (down < half) {
  //   // y is pos
  //   y = half - down;
  // } else {
  //   // y is neg
  //   y = (down - half - 1) * -1;
  // }
  // return [x, y];

  ////////////////////////////
  ////////////////////////////
  ////////////////////////////
};

// black is 1, white is 0
// pixel array is 0,0,0,1,0,1,..
const pixelArrayToPoints = (pixelArr, keepBlack) => {
  let pointsArr = [];
  // length of canvas (assuming always square - can easilly change)
  let length = Math.sqrt(pixelArr.length);
  for (let i = 0; i < pixelArr.length; i++) {
    // white
    if (pixelArr[i] === (keepBlack ? 1 : 0)) {
      continue;
    }

    // if (!isEdge(i, length, arr)) {
    //   continue;
    // }

    // now we have an edge
    pointsArr.push(convertIdxToCord(i, length));
  }
  return pointsArr;
};

const pixelArrTo2dPixelArr = (arr) => {
  let length = Math.sqrt(arr.length);

  const twoDPixelArr = [];
  for (let i = 0; i < length; i++) {
    const row = [];
    for (let j = 0; j < length; j++) {
      row.push(arr[i * length + j]);
    }
    twoDPixelArr.push(row);
  }
  return twoDPixelArr;
};

module.exports = {
  readBinaryFile,
  convertByteArrayToPixelArray,
  checker,
  pixelArrayToPoints,
  pixelArrTo2dPixelArr,
};
