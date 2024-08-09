const { mod, get2dDistance } = require("../util/util");
// this is the new version as of s1 that only connects top points to the first bottom point that is cloest instead of all if they are the same distance
// this file is for the initial point connection
const findClosestInPlane = (point, plane, startIdx, endIdx) => {
  // TODO don't need to do this for every point now
  let distances = plane.map((p) => get2dDistance(p, point));
  let shortest = null;
  let closestPointIdxs = [];

  let maxIters = mod(endIdx - startIdx, plane.length) + 1;
  let counter = 0;
  // what to do if there are points that are the same distance apart????? how much does it matter?? maybe perfer points that haven't been matched
  for (let i = startIdx; counter <= maxIters; i = (i + 1) % plane.length) {
    counter++;
    let dis = distances[i];
    if (shortest === null || dis < shortest) {
      shortest = dis;
      closestPointIdxs = [i];
    } else if (dis === shortest) {
      closestPointIdxs.push(i);
    }
  }

  if (closestPointIdxs.length === 0) {
    console.log("PROBLEM - no cloest point");
  }

  let firstClostestIdx = closestPointIdxs[0];
  return [plane[firstClostestIdx], firstClostestIdx, firstClostestIdx];
};

const connectToOtherShapeFirst = (top, bottom, add2DPointsToGraph) => {
  // once we have the good thing from only going one direction then traingulating (or really before taingualating)
  // don't connect to the same point twice connect only to new points or something look at picture
  let endIdx = bottom.length - 1;
  let startIdx = 0;

  // step 3
  let countOfLargerToSmaller = 0;
  top.forEach((point, idx) => {
    let [connector, newStartIdx, newEndIdx] = findClosestInPlane(
      point,
      bottom,
      startIdx,
      endIdx
    );
    if (idx === 0) {
      endIdx = newEndIdx;
    }
    startIdx = newStartIdx;

    let topPoint = point;
    let bottomPoint = connector;
    add2DPointsToGraph(topPoint, bottomPoint);
  });
  // console.log("top to bottom", countOfLargerToSmaller);
};

module.exports = { connectToOtherShapeFirst };
