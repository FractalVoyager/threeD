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

const { recomputePoints } = require("./shapes/recomputePoints");

const { outliner, handlePointsAlongLine } = require("./shapes/outliner");
const { earClip, unOptimizedEarClip } = require("./shapes/earClipTriangulate");

const { makeStlFromTrisList } = require("./stl/makeStil");

// const { createSides } = require("./threeD/createSides");

const { createSides } = require("./connectPlanes/createSides");
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

const makeTriangles = async (pixelArray, z) => {
  // const filePath = "./data/firstSet.bin";

  // const data = await readBinaryFile(filePath);
  // const pixelArray = convertByteArrayToPixelArray(data);

  // length of canvas
  let length = Math.sqrt(pixelArray.length);

  // const pointsArr = pixelArrayToPoints(pixelArray);
  const twoDPixelArr = pixelArrTo2dPixelArr(pixelArray);

  writeFile(arrayOfPointsToJSON(twoDPixelArr, "orig"), "./webViewer/orig.js");
  // console.log(twoDPixelArr);
  // return;
  const ordering = outliner(twoDPixelArr, length);
  console.log(
    "repeating elements in ordering? " + hasRepeatingElements(ordering)
  );
  writeFile(arrayOfPointsToJSON(ordering, "outline"), "./webViewer/outline.js");
  // return;

  const oldTrinagles = unOptimizedEarClip(ordering);
  writeFile(
    arrayOfPointsToJSON(oldTrinagles, "triangles"),
    "./webViewer/tris.js"
  );

  // const triangles = earClip(ordering);
  // console.log("tri repeats? " + hasRepeatingElements(triangles));

  // console.log(
  //   "triangle arrays are same? " + arraysAreDeepEqual(oldTrinagles, triangles)
  // );
  // console.log(
  //   "correct number of tris? " +
  //     (ordering.length - triangles.length === 2 ? true : false)
  // );
  // writeFile(
  //   arrayOfPointsToJSON(oldTrinagles, "triangles"),
  //   "./webViewer/tris.js"
  // );
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

const processFullBinary = async (filePath) => {
  const bin = await readBinaryFile(filePath);
  const width = (bin[bin.length - 2] << 8) | bin[bin.length - 1];
  const arrLen = width * width;
  const numSets = ((bin.length - 2) / arrLen) * 8;
  // console.log(numSets);

  const setByteLength = Math.ceil(arrLen / 8);
  // Extract each pixel array from the binary data
  let offset = 0;
  let pixelArrs = [];
  for (let i = 0; i < numSets; i++) {
    // Calculate the length of bytes for the current set

    // Extract the byte array for the current set
    let byteArray = bin.slice(offset, offset + setByteLength);

    // Convert the byte array to a bit array (pixel array)
    let pixelArray = convertByteArrayToPixelArray(byteArray);
    pixelArrs.push(pixelArray);
    // Print or process the pixel array as needed

    // Update the offset for the next set
    offset += setByteLength;
  }
  return pixelArrs;
};

const processCrosses = async () => {
  let pixelArrs = await processFullBinary("./data/curr.bin");

  // const data = await readBinaryFile("./data/hardTails.bin");
  // const pixelArray = convertByteArrayToPixelArray(data);
  // let problem = await makeTriangles(pixelArray, 0);
  // return;
  // let problem = await makeTriangles(pixelArrs[0], 0);
  // return;

  const width = Math.sqrt(pixelArrs[0].length);
  const step = Math.floor(width / 3 / pixelArrs.length);
  let orderings = pixelArrs.map((pixelArr, idx) => {
    console.log("2d layer: ", idx);
    // make 2 d arr
    let twoDPixelArr = pixelArrTo2dPixelArr(pixelArr);
    // return ordering ordering
    return outliner(twoDPixelArr, width);
  });

  const largestLength = orderings.reduce((acc, ordering) => {
    if (ordering.length > acc) {
      return ordering.length;
    }
    return acc;
  }, 0);

  console.log("largest length", largestLength);

  // TODO at 1 get weird number of points because the recompute isn't quite right, FIX
  // was 8
  const newNumPoints = largestLength * 2;

  console.log("new num points", newNumPoints);

  const newOrderings = orderings.map((ordering) =>
    recomputePoints(ordering, newNumPoints)
  );

  // console.log(orderings[0]);
  // unOptimizedEarClip(orderings[0]);
  // console.log("new");
  // console.log(newOrderings[0][]);
  // unOptimizedEarClip(handlePointsAlongLine(newOrderings[0]));
  // console.log("done");

  orderings = newOrderings;
  writeFile(
    arrayOfPointsToJSON(newOrderings[0], "outline"),
    "./webViewer/outline.js"
  );
  // return;

  orderings.forEach((ordering) => {
    console.log(ordering.length);
    console.log(hasRepeatingElements(ordering));
  });

  let allTris = [];

  for (let i = 0; i < orderings.length - 1; i++) {
    console.log("3d layer: ", i);
    let bottom = orderings[i];
    let top = orderings[i + 1];
    let sides = createSides(bottom, top, step * i, step);
    allTris.push(...sides);
    let tris;
    if (i === 0 || i === orderings.length - 2) {
      tris = unOptimizedEarClip(handlePointsAlongLine(i === 0 ? bottom : top));
      let z = i === 0 ? 0 : step * (i + 1);
      tris = tris.map((tri) => {
        return tri.map((point) => {
          return [point[0], point[1], z];
        });
      });
      allTris.push(...tris);
    }

    const stlStr = makeStlFromTrisList(allTris);
    writeFile(stlStr, "./data/stl.stl");
  }

  // const crosses = ["firstSet", "secondSet"].map((name) => {
  //   return await makeTriangles("./data/" + name + ".bin");
  // });
  // let topFour = await makeTriangles("./data/fourthSet.bin", 0);
  // let toptop = await makeTriangles("./data/thirdSet.bin", 10);
  // let tris = createSides(topFour.points, toptop.points, 0, 10);

  // let topFour = await makeTriangles("./data/fourthSet.bin", 30);
  // let bottom = await makeTriangles("./data/secondSet.bin", 0);
  // let top = await makeTriangles("./data/firstSet.bin", 10);
  // let toptop = await makeTriangles("./data/thirdSet.bin", 20);
  // let tris = createSides(bottom.points, top.points, 0, 10);
  // let tristris = createSides(top.points, toptop.points, 10, 10);
  // let topTris = createSides(toptop.points, topFour.points, 20, 10);
  // console.log("tri repeats? " + hasRepeatingElements(tris));
  // console.log("tri repeats? " + hasRepeatingElements(tristris));

  // const stlStr = makeStlFromTrisList([
  //   // tris,
  //   // bottom.tris,
  //   // top.tris,
  //   // tristris,
  //   topFour.tris,
  //   toptop.tris,
  //   tris,
  // ]);
  // writeFile(stlStr, "./data/stl.stl");
};

processCrosses();
