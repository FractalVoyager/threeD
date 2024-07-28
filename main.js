const {
  readBinaryFile,
  convertByteArrayToPixelArray,
  checker,
  pixelArrayToPoints,
  pixelArrTo2dPixelArr,
} = require("./binary/binary");

const {
  writeFile,
  arrayofPointsToTxt,
  arrayOfPointsToJSON,
} = require("./util/writeFile");

const { outliner } = require("./shapes/outliner");
const main = async () => {
  const filePath = "./data/firstSet.bin";

  const data = await readBinaryFile(filePath);
  const pixelArray = convertByteArrayToPixelArray(data);
  // console.log(pixelArray);
  // console.log(checker(pixelArray));
  // console.log(pixelArray.length);
  // length of canvas
  let length = Math.sqrt(pixelArray.length);
  // const pointsArr = pixelArrayToPoints(pixelArray);
  const twoDPixelArr = pixelArrTo2dPixelArr(pixelArray);

  const ordering = outliner(twoDPixelArr, length);
  writeFile(arrayOfPointsToJSON(ordering), "./webViewer/test.js");
};

main();
