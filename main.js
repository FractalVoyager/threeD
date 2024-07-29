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
const { earClip } = require("./shapes/earClipTriangulate");

function hasRepeatingElements(arr) {
  const seen = new Set();
  for (let element of arr) {
    if (seen.has(element)) {
      return true;
    }
    seen.add(element);
  }
  return false;
}

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
  writeFile(arrayOfPointsToJSON(twoDPixelArr, "orig"), "./webViewer/orig.js");
  const ordering = outliner(twoDPixelArr, length);
  console.log("repeating elements? " + hasRepeatingElements(ordering));
  writeFile(arrayOfPointsToJSON(ordering, "outline"), "./webViewer/outline.js");
  const triangles = earClip(ordering);
  console.log("tri repeats", hasRepeatingElements(triangles));
  console.log("tris", triangles.length);
  writeFile(arrayOfPointsToJSON(triangles, "triangles"), "./webViewer/tris.js");
};

main();
