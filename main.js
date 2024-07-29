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
const { earClip, unOptimizedEarClip } = require("./shapes/earClipTriangulate");

const { newmakeStl } = require("./stl/makeStil");

const arraysAreDeepEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (Array.isArray(arr1[i]) && Array.isArray(arr2[i])) {
      if (!arraysAreDeepEqual(arr1[i], arr2[i])) {
        return false;
      }
    } else if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
};

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

  // length of canvas
  let length = Math.sqrt(pixelArray.length);
  // const pointsArr = pixelArrayToPoints(pixelArray);
  const twoDPixelArr = pixelArrTo2dPixelArr(pixelArray);
  writeFile(arrayOfPointsToJSON(twoDPixelArr, "orig"), "./webViewer/orig.js");
  const ordering = outliner(twoDPixelArr, length);
  console.log(
    "repeating elements in ordering? " + hasRepeatingElements(ordering)
  );
  writeFile(arrayOfPointsToJSON(ordering, "outline"), "./webViewer/outline.js");

  const oldTrinagles = unOptimizedEarClip(ordering);
  const triangles = earClip(ordering);
  console.log("tri repeats? " + hasRepeatingElements(triangles));

  console.log(
    "triangle arrays are same? " + arraysAreDeepEqual(oldTrinagles, triangles)
  );
  console.log(
    "correct number of tris? " +
      (ordering.length - triangles.length === 2 ? true : false)
  );
  writeFile(arrayOfPointsToJSON(triangles, "triangles"), "./webViewer/tris.js");
  const threeDtris = oldTrinagles.map((tri) => {
    return tri.map((point) => {
      return [point[0], point[1], 0];
    });
  });
  const stlStr = newmakeStl(threeDtris, length);
  // console.log(stlStr);
  writeFile(writeFile(stlStr, "./data/stl.stl"));
};

main();
