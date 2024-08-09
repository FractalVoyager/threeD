const { mod, get2dDistance } = require("../util/util");

const addEdgesToStrandedBottomPoints = (
  prevIdx,
  bottom,
  top,
  graph,
  currZ,
  zDiff,
  add2DPointsToGraph
) => {
  let prev = bottom[mod(prevIdx, bottom.length)];
  let prevAdjs = graph.getAdjs([prev[0], prev[1], currZ]);

  // big claim here saying that they will always be added in order - CHECK CHECK - pretty sure I always want it to be in order, try to come up with a coutner example
  // find idx prevAdj in top plane that is the "last" one - last one added
  // this is d
  let prevAdjIdx = null;

  top.every((point, idx) => {
    if (
      JSON.stringify(point) ===
      JSON.stringify([
        prevAdjs[prevAdjs.length - 1][0],
        prevAdjs[prevAdjs.length - 1][1],
      ])
    ) {
      prevAdjIdx = idx;
      return false;
    } else {
      return true;
    }
  });
  // d
  let prevAdj = top[prevAdjIdx];
  // console.log("d", prevAdj);
  // e
  let prevAdjNextPoint = top[mod(prevAdjIdx + 1, top.length)];
  // console.log("e", prevAdjNextPoint);
  // console.log(
  //   "e adjs in bottom",
  //   graph.getAdjs([prevAdjNextPoint[0], prevAdjNextPoint[1], currZ + zDiff])
  // );

  // find next vertex in bottom that is connected
  let nextPointInBottomIdx = prevIdx + 2;
  while (
    !graph.hasVertex([
      bottom[mod(nextPointInBottomIdx, bottom.length)][0],
      bottom[mod(nextPointInBottomIdx, bottom.length)][1],
      currZ,
    ])
  ) {
    nextPointInBottomIdx++;
  }

  let nextPointInBottom = bottom[mod(nextPointInBottomIdx, bottom.length)];

  // first want to check if this point is connected to prevAdj
  let nextPointInBottomAdjs = graph.getAdjs([
    nextPointInBottom[0],
    nextPointInBottom[1],
    currZ,
  ]);
  let nextPointInBottomAdj = nextPointInBottomAdjs[0];

  // it will always be the first adj
  if (
    nextPointInBottomAdj[0] === prevAdj[0] &&
    nextPointInBottomAdj[1] === prevAdj[1]
  ) {
    // it is connected
    // we want all middle points to go to prevAdj
    for (let i = prevIdx + 1; i < nextPointInBottomIdx; i++) {
      add2DPointsToGraph(prevAdj, bottom[mod(i, bottom.length)]);
    }
    return;
  }

  // todo write compare function

  if (
    graph.getAdjs([
      prevAdjNextPoint[0],
      prevAdjNextPoint[1],
      currZ + zDiff,
    ])[0][0] !== nextPointInBottom[0] ||
    graph.getAdjs([
      prevAdjNextPoint[0],
      prevAdjNextPoint[1],
      currZ + zDiff,
    ])[0][1] !== nextPointInBottom[1]
  ) {
    // what can happen here is a point was skipped. prev connected to top point, which is also connected to nextPointInBottom, but curr point was skipped
    // even if the nextPointInBtootm is connected to prevAdjNextPoint, but also prevAdj, we want to connect middle points to prevAdj
    // FIXED ABOVE
    console.log("PROBLEM ___ CLIAM FALSE");
  }

  if (nextPointInBottomIdx - prevIdx === 2) {
    // there is only one point that needs to be added
    // add it to both points in top plane to create triangles
    // add to d -- idx is prevIdx + 1 or nextPointInBottomIdx - 1;
    add2DPointsToGraph(prevAdj, bottom[prevIdx + 1]);
    // console.log("this");
    // add to e
    add2DPointsToGraph(prevAdjNextPoint, bottom[prevIdx + 1]);
  } else {
    let isOdd = mod(nextPointInBottomIdx - prevIdx, 2) === 1;
    let midPoint = (nextPointInBottomIdx - prevIdx) / 2 + prevIdx;
    // console.log(prevIdx, midPoint, nextPointInBottomIdx);
    // if it is odd, there are two vs in the middle
    // one of them will go to both verticies
    // this is one way of deciding, not sure it is the best, also shouldn't really matter
    // this method should make the most equal area trinagles
    if (isOdd) {
      if (
        get2dDistance(
          bottom[mod(midPoint - 0.5, bottom.length)],
          prevAdjNextPoint
        ) > get2dDistance(bottom[mod(midPoint + 0.5, bottom.length)], prevAdj)
      ) {
        // left one goes both ways
        // only need to add to right here because going to the left will get handled in main for loop
        add2DPointsToGraph(
          prevAdjNextPoint,
          bottom[mod(midPoint - 0.5, bottom.length)]
        );
      } else {
        // right one goes both ways
        add2DPointsToGraph(prevAdj, bottom[mod(midPoint + 0.5, bottom.length)]);
      }
    }

    for (let i = prevIdx + 1; i < nextPointInBottomIdx; i++) {
      if (i < midPoint) {
        // want to add to left side (prevAdj)
        add2DPointsToGraph(prevAdj, bottom[mod(i, bottom.length)]);
      } else if (i > midPoint) {
        // want to add to right side (prevAdjNextPoint)
        add2DPointsToGraph(prevAdjNextPoint, bottom[mod(i, bottom.length)]);
      } else {
        // equal to midpoint, add both ways, must be an even
        add2DPointsToGraph(prevAdj, bottom[mod(i, bottom.length)]);
        add2DPointsToGraph(prevAdjNextPoint, bottom[mod(i, bottom.length)]);
        // console.log("this");
      }
    }
  }
};

const connectToOtherShapeSecond = (
  top,
  bottom,
  graph,
  currZ,
  zDiff,
  add2DPointsToGraph
) => {
  bottom.forEach((point, idx) => {
    if (!graph.hasVertex([point[0], point[1], currZ])) {
      // here, we found one that has no adj
      // prev will always have adj UNLESS we are at the start
      // special case for first vertex
      if (idx === 0) {
        let prevIdx = idx - 1;
        let prev = bottom[mod(prevIdx, bottom.length)];
        while (!graph.hasVertex([prev[0], prev[1], currZ])) {
          prevIdx--;
          prev = bottom[mod(prevIdx, bottom.length)];
        }

        addEdgesToStrandedBottomPoints(
          prevIdx,
          bottom,
          top,
          graph,
          currZ,
          zDiff,
          add2DPointsToGraph
        );
      } else {
        addEdgesToStrandedBottomPoints(
          idx - 1,
          bottom,
          top,
          graph,
          currZ,
          zDiff,
          add2DPointsToGraph
        );
      }
    }

    // let connectors = findClosestInPlane(point, false);

    // connectors.forEach((connector) => {
    //   countOfSmallerToLarger++;
    //   let topPoint = connector;
    //   let bottomPoint = point;
    //   add2DPointsToGraph(topPoint, bottomPoint);
    // });
  });
};

module.exports = { connectToOtherShapeSecond };
