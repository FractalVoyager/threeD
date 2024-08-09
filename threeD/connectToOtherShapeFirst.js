const { mod, get2dDistance } = require("../util/util");
// this file is for the initial point connection
// this function is
// this is skipping sometimes TODTODODODOOD
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

  // this is to handle the case when the first point matches to
  let biggestDistance = null;
  let biggestDistancePoints = null;
  let lastIdx = null;
  let cloestPoints = closestPointIdxs.map((idx) => {
    // first point
    if (lastIdx === null) {
      lastIdx = idx;
      // second point
    } else if (biggestDistance === null) {
      biggestDistance = mod(idx - lastIdx, plane.length);
      biggestDistancePoints = [lastIdx, idx];
      lastIdx = idx;
      // third or later
    } else {
      let distance = mod(idx - lastIdx, plane.length);
      if (distance > biggestDistance) {
        biggestDistance = distance;
        biggestDistancePoints = [lastIdx, idx];
      }
      lastIdx = idx;
    }

    return plane[idx];
  });

  if (lastIdx === null) {
    console.log("PROBLEM - no points found in find cloest in plane");
    return false;
  }

  // only one point
  if (biggestDistance === null) {
    // it is max and min
    return [cloestPoints, lastIdx, lastIdx];
  } else {
    // need to know which one is the "start" and which one is the "end"
    if (
      mod(biggestDistancePoints[0] + biggestDistance, plane.length) ===
      biggestDistancePoints[1]
    ) {
      // distance is between the two points from first to second
      // so want to start at the first and go to the second
      return [cloestPoints, biggestDistancePoints[0], biggestDistancePoints[1]];
    } else {
      // want to start at the second and go to the first
      return [cloestPoints, biggestDistancePoints[1], biggestDistancePoints[0]];
    }
  }
};

const connectToOtherShapeFirst = (top, bottom, add2DPointsToGraph) => {
  // once we have the good thing from only going one direction then traingulating (or really before taingualating)
  // don't connect to the same point twice connect only to new points or something look at picture
  let endIdx = bottom.length - 1;
  let startIdx = 0;

  // step 3
  let countOfLargerToSmaller = 0;
  top.forEach((point, idx) => {
    let [connectors, newStartIdx, newEndIdx] = findClosestInPlane(
      point,
      bottom,
      startIdx,
      endIdx
    );
    if (idx === 0) {
      endIdx = newEndIdx;
    }
    startIdx = newStartIdx;

    // maxIdx is the new starting index
    connectors.forEach((connector) => {
      countOfLargerToSmaller++;
      let topPoint = point;
      let bottomPoint = connector;
      add2DPointsToGraph(topPoint, bottomPoint);
    });
  });
  console.log("top to bottom", countOfLargerToSmaller);
};

module.exports = { connectToOtherShapeFirst };
