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

const { makeStlFromTrisList } = require("./stl/makeStil");

const { createSides } = require("./threeD/createSides");

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

const makeTriangles = async (filePath, z) => {
  // const filePath = "./data/firstSet.bin";

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
  return;

  const oldTrinagles = unOptimizedEarClip(ordering);
  // const triangles = earClip(ordering);
  // console.log("tri repeats? " + hasRepeatingElements(triangles));

  // console.log(
  //   "triangle arrays are same? " + arraysAreDeepEqual(oldTrinagles, triangles)
  // );
  // console.log(
  //   "correct number of tris? " +
  //     (ordering.length - triangles.length === 2 ? true : false)
  // );
  writeFile(
    arrayOfPointsToJSON(oldTrinagles, "triangles"),
    "./webViewer/tris.js"
  );
  const threeDtris = oldTrinagles.map((tri) => {
    return tri.map((point) => {
      return [point[0], point[1], z];
    });
  });
  // const stlStr = makeStlFromTrisList([threeDtris]);
  // console.log(stlStr);
  // writeFile(stlStr, "./data/stl.stl");

  return { points: ordering, tris: threeDtris };
};

const processCrosses = async () => {
  // const crosses = ["firstSet", "secondSet"].map((name) => {
  //   return await makeTriangles("./data/" + name + ".bin");
  // });
  let topFour = await makeTriangles("./data/fourthSet.bin", 30);
  return;
  let bottom = await makeTriangles("./data/secondSet.bin", 0);
  let top = await makeTriangles("./data/firstSet.bin", 10);
  let toptop = await makeTriangles("./data/thirdSet.bin", 20);
  let tris = createSides(bottom.points, top.points, 0, 10);
  let tristris = createSides(top.points, toptop.points, 10, 10);
  console.log("tri repeats? " + hasRepeatingElements(tris));
  console.log("tri repeats? " + hasRepeatingElements(tristris));

  const stlStr = makeStlFromTrisList([
    tris,
    bottom.tris,
    top.tris,
    tristris,
    toptop.tris,
  ]);
  writeFile(stlStr, "./data/stl.stl");
};

processCrosses();
