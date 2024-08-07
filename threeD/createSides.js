// creates the sides of 3d object from two cross sections

// bottom and top are cross sections
// they are objects with points and tris

// non-negative mod
function mod(n, m) {
  return ((n % m) + m) % m;
}

const get2dDistance = (a, b) => {
  let xdis = a[0] - b[0];
  let ydis = a[1] - b[1];
  return Math.sqrt(xdis * xdis + ydis * ydis);
};

class Graph {
  constructor() {
    this.adjacencyList = {};
  }

  // Add a new vertex to the graph
  addVertex(vertex) {
    const vertexKey = JSON.stringify(vertex);
    if (!this.adjacencyList[vertexKey]) {
      this.adjacencyList[vertexKey] = [];
    }
  }

  // Add an edge between two vertices
  addEdge(vertex1, vertex2) {
    const vertex1Key = JSON.stringify(vertex1);
    const vertex2Key = JSON.stringify(vertex2);
    if (!this.adjacencyList[vertex1Key]) {
      this.addVertex(vertex1);
    }
    if (!this.adjacencyList[vertex2Key]) {
      this.addVertex(vertex2);
    }
    if (
      !this.adjacencyList[vertex1Key].some(
        (v) => JSON.stringify(v) === vertex2Key
      )
    ) {
      this.adjacencyList[vertex1Key].push(vertex2);
    }
    if (
      !this.adjacencyList[vertex2Key].some(
        (v) => JSON.stringify(v) === vertex1Key
      )
    ) {
      this.adjacencyList[vertex2Key].push(vertex1);
    }
  }

  getAdjsFromKey(vertexKey) {
    return this.adjacencyList[vertexKey];
  }

  getAdjs(vertex) {
    let vertexKey = JSON.stringify(vertex);
    return this.getAdjsFromKey(vertexKey);
  }

  // think these two will be useful for constructing the triangles
  removeEdge(vertex1, vertex2) {
    const vertex1Key = JSON.stringify(vertex1);
    const vertex2Key = JSON.stringify(vertex2);
    if (this.adjacencyList[vertex1Key]) {
      this.adjacencyList[vertex1Key] = this.adjacencyList[vertex1Key].filter(
        (v) => JSON.stringify(v) !== vertex2Key
      );
    }
    if (this.adjacencyList[vertex2Key]) {
      this.adjacencyList[vertex2Key] = this.adjacencyList[vertex2Key].filter(
        (v) => JSON.stringify(v) !== vertex1Key
      );
    }
  }

  // Remove a vertex and all its edges
  removeVertex(vertex) {
    const vertexKey = JSON.stringify(vertex);
    if (!this.adjacencyList[vertexKey]) {
      return;
    }
    while (this.adjacencyList[vertexKey].length) {
      const adjacentVertex = this.adjacencyList[vertexKey].pop();
      this.removeEdge(vertex, adjacentVertex);
    }
    delete this.adjacencyList[vertexKey];
  }

  // Check if a vertex exists in the graph
  hasVertex(vertex) {
    const vertexKey = JSON.stringify(vertex);
    return !!this.adjacencyList[vertexKey];
  }
}

// once the graph is traingulated
const processGraph = (graph) => {
  let tris = [];
  let verticesToProcess = Object.keys(graph.adjacencyList);
  // console.log(verticesToProcess);
  // go through all vertices
  while (verticesToProcess.length > 2) {
    // get a vertex
    let vertexKey = verticesToProcess.pop();
    let adjs = graph.getAdjsFromKey(vertexKey);
    let adjStrs = adjs.map((adj) => JSON.stringify(adj));
    let vertex = JSON.parse(vertexKey);
    let adjsStrsToProcess = adjStrs;
    while (adjsStrsToProcess.length > 0) {
      let adjStr = adjsStrsToProcess.pop();
      let adj = JSON.parse(adjStr);
      let secondLevelAdjs = graph.getAdjs(adj);

      secondLevelAdjs.forEach((secondLevelAdj) => {
        let secondLevelAdjStr = JSON.stringify(secondLevelAdj);
        if (adjStrs.indexOf(secondLevelAdjStr) !== -1) {
          tris.push([vertex, secondLevelAdj, adj]);
          // remove the second level adj from the adjs
          // adjsStrsToProcess.splice(secondLevelAdjStr, 1);
        }
      });
    }
  }
  return tris;
};

// once the graph is all built up
// this creates traingles from squares
const squaresToTris = (graph) => {
  // probably can add the traingles as we go
  let misses = false;

  let additional = 0;

  Object.entries(graph.adjacencyList).forEach((obj) => {
    // step 1
    let adjs = obj[1];
    let vertex = JSON.parse(obj[0]);
    let vertexKey = obj[0];
    // step 2
    let secondLevelAdjs = new Set();
    adjs.forEach((firstLevelAdj) => {
      graph.getAdjs(firstLevelAdj).forEach((secondLevelAdj) => {
        secondLevelAdjs.add(JSON.stringify(secondLevelAdj));
      });
    });
    secondLevelAdjs.delete(vertexKey);

    // find all the original adjs that are not in the second level adjs
    // if an element is in here, this means there is not a three cycle from vertex
    // that includes this adj, i.e. needs a triangle
    let difference = [];
    adjs.forEach((firstLevelAdj) => {
      if (!secondLevelAdjs.has(JSON.stringify(firstLevelAdj))) {
        // in the difference
        difference.push(firstLevelAdj);
      }
    });

    // step 3
    if (difference.length === 0) {
      // console.log("all triangles for ", vertex);
      return;
    }
    misses = true;

    difference.forEach((strandedPoint) => {
      // only want to draw lines between top plane and bottom plane
      // every vertex here must have an adj that is adj to one of the initial adjs BIG CLAIM - thought through it a lot but a proof would be nice and tested below, test passed
      // this means all squares or tris
      let strandedAjs = graph.getAdjs(strandedPoint);

      // remove original point
      strandedAjs = strandedAjs.filter(
        (adj) => JSON.stringify(adj) !== vertexKey
      );

      let connectors = [];

      strandedAjs.forEach((strandedAdj) => {
        if (
          secondLevelAdjs.has(JSON.stringify(strandedAdj)) &&
          // dont see why I need this anymore but seems like I do
          strandedAdj[2] !== vertex[2]
        ) {
          connectors.push(strandedAdj);
        }
      });

      // now have a connector vertex

      // if (connectors.length > 2) {
      //   console.log("more than one connector found");
      // }
      // if (connectors.length === 0) {
      //   console.log("no connectors foud");
      // }

      connectors.forEach((connector) => {
        // console.log(connector, vertex);
        graph.addEdge(connector, vertex);
      });

      // let adjsStr = adjs.map((adj) => JSON.stringify(adj));

      // // big claim test
      // let newPointIdx = -1;

      // strandedAjs.forEach((strandedAdj) => {
      //   let strandedAdjAdjs = graph.getAdjs(strandedAdj);
      //   strandedAdjAdjs.forEach((adj) => {
      //     let connectorIdx = adjsStr.indexOf(JSON.stringify(adj));
      //     if (connectorIdx !== -1) {
      //       // console.log("stranded adj connector", strandedAdj);
      //       if (newPointIdx !== -1) {
      //         // console.log("two connectors found");
      //       }
      //       newPointIdx = connectorIdx;

      //     }
      //   });
      //   if (newPointIdx === -1) {
      //     console.log("none found!!!");
      //   }
      // });

      // console.log(myin);
    });
  });
  // console.log("additonal", additional);

  console.log(misses);
};

// once the graph is all built up
// this creates traingles from all nodes by going through the stranded nodes. It works even if it is not all squares or tris (4-cyles or 3-cyles)
const triangulateSides = (graph) => {
  // probably can add the traingles as we go
  let misses = false;

  let additional = 0;

  Object.entries(graph.adjacencyList).forEach((obj) => {
    // step 1
    let adjs = obj[1];
    let vertex = JSON.parse(obj[0]);
    let vertexKey = obj[0];
    // step 2
    let secondLevelAdjs = new Set();
    adjs.forEach((firstLevelAdj) => {
      graph.getAdjs(firstLevelAdj).forEach((secondLevelAdj) => {
        secondLevelAdjs.add(JSON.stringify(secondLevelAdj));
      });
    });
    secondLevelAdjs.delete(vertexKey);

    // find all the original adjs that are not in the second level adjs
    // if an element is in here, this means there is not a three cycle from vertex
    // that includes this adj, i.e. needs a triangle
    let difference = [];
    adjs.forEach((firstLevelAdj) => {
      if (!secondLevelAdjs.has(JSON.stringify(firstLevelAdj))) {
        // in the difference
        difference.push(firstLevelAdj);
      }
    });

    // step 3
    if (difference.length > 0) {
      misses = true;
    }
    difference.forEach((strandedPoint) => {
      // only want to draw lines between top plane and bottom plane
      // every vertex here must have an adj that is adj to one of the initial adjs BIG CLAIM - thought through it a lot but a proof would be nice and tested below, test passed
      let strandedAjs = graph.getAdjs(strandedPoint);

      // remove original point
      strandedAjs = strandedAjs.filter(
        (adj) => JSON.stringify(adj) !== vertexKey
      );
      //
      // find adj of stranded point that is in the oppiste plane as vertex and closet to vertex
      let closestAdj = null;
      let cloestDistance = null;
      strandedAjs.forEach((strandedAdj) => {
        // oppiste plane
        if (true) {
          // if (strandedAdj[2] !== strandedPoint[2]) {
          let dist = get2dDistance(strandedAdj, vertex);
          if (
            cloestDistance === null ||
            get2dDistance(strandedAdj, vertex) < cloestDistance
          ) {
            closestAdj = strandedAdj;
            cloestDistance = dist;
          }
        }
      });
      if (closestAdj[2] === strandedPoint[2]) {
        // console.log("HOLE AT ", strandedPoint);
      } else {
        // connect to the vertex
        additional++;
        graph.addEdge(closestAdj, vertex);
      }
    });
  });

  console.log("additonal", additional);

  console.log(misses);
};

// ponts, tris
const createSides = (bottom, top, currZ, zDiff) => {
  const findClosestInPlane = (point, isBottomPlane, startIdx, endIdx) => {
    let plane = isBottomPlane ? bottom : top;
    // TODO don't need to do this for every point now
    let distances = plane.map((p) => {
      let xdis = p[0] - point[0];
      let ydis = p[1] - point[1];
      return Math.sqrt(xdis * xdis + ydis * ydis);
    });
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
        return [
          cloestPoints,
          biggestDistancePoints[0],
          biggestDistancePoints[1],
        ];
      } else {
        // CHECKER
        if (
          mod(biggestDistancePoints[1] + biggestDistance, plane.length) !==
          biggestDistancePoints[0]
        ) {
          console.log(
            "PROBLEMMMMMMM getting order of points in find cloest in plane is wrong"
          );
        }
        // want to start at the second and go to the first
        return [
          cloestPoints,
          biggestDistancePoints[1],
          biggestDistancePoints[0],
        ];
      }
    }
  };

  const graph = new Graph();

  const connectAll = (shape, isTop) => {
    // need the z value only so there is no repeating elements, not 3d yet
    const z = isTop ? currZ + zDiff : currZ;
    for (let i = 0; i < shape.length; i++) {
      let left = shape[mod(i - 1, shape.length)];
      let right = shape[mod(i + 1, shape.length)];
      let v = shape[i];

      let left3 = [left[0], left[1], z];
      let v3 = [v[0], v[1], z];
      let right3 = [right[0], right[1], z];

      graph.addEdge(left3, v3);
      graph.addEdge(v3, right3);
    }
  };

  const add2DPointsToGraph = (topPoint, bottomPoint) => {
    graph.addEdge(
      [topPoint[0], topPoint[1], currZ + zDiff],
      [bottomPoint[0], bottomPoint[1], currZ]
    );
  };
  // once we have the good thing from only going one direction then traingulating (or really before taingualating)
  // don't connect to the same point twice connect only to new points or something look at picture
  let endIdx = bottom.length - 1;
  let startIdx = 0;

  // step 3
  let countOfLargerToSmaller = 0;
  top.forEach((point, idx) => {
    let [connectors, newStartIdx, newEndIdx] = findClosestInPlane(
      point,
      true,
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

  // go through points in smaller plane

  // new strategy
  // when we get to a vertex that has no adjacency to smaller plane, get connect to the vertex in smaller plane that comes after
  // the last one here
  // say a,b,c,d (ordered that way) in smaller plane is connected to y in larger
  // larger plane ordering is y, z, x
  // we get to z, see that has it has adjs to larger plane.
  // then we see that y came before
  // get all adjs of y = [a,b,c,d]
  // see that d was added last (TODO check that this is really the one we want, it just needs to be last in the ordering (first vertex may be weird)) - i.e. d is the one we want, not c or any others, based on ordering in orig
  // add to point after d in ordering DONE
  // MAY also want to see how many points after z are also non adj to smaller plane, and split in half between the two
  // THIS WAY SHOULD MAKE ALL SQAURES OR TRIS, then can do the old way of detecting sqaures are traingulating which makes more sense

  // actually, just going to fully traingulate here
  // when we get to y and find d...
  // find point e (after ordering in smaller plane)
  // TODO check - maybe hopoing that es first adj will be the next point in larger plane that doesn't have adj in ordering
  // split points in larger plane in this zone between the two verticies to fully traingualte
  // so say ordering is z,x,k,j,l and l is adjacent to e
  // z goes to d to do that trinagle
  // j goes to e to do that traingle
  // x,k goes to d
  // k goes to e
  // maybe for split points (odd number) go by cloest distance
  // could still end up with squares, handle with old fcn I came up with

  let counter = 0;
  const addEdgesToStrandedBottomPoints = (prevIdx) => {
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
      counter += 2;
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
          counter++;
        } else {
          // right one goes both ways
          add2DPointsToGraph(
            prevAdj,
            bottom[mod(midPoint + 0.5, bottom.length)]
          );
          counter++;
        }
      }

      for (let i = prevIdx + 1; i < nextPointInBottomIdx; i++) {
        if (i < midPoint) {
          // want to add to left side (prevAdj)
          add2DPointsToGraph(prevAdj, bottom[mod(i, bottom.length)]);

          counter++;
        } else if (i > midPoint) {
          // want to add to right side (prevAdjNextPoint)
          add2DPointsToGraph(prevAdjNextPoint, bottom[mod(i, bottom.length)]);

          counter++;
        } else {
          // equal to midpoint, add both ways, must be an even
          add2DPointsToGraph(prevAdj, bottom[mod(i, bottom.length)]);
          add2DPointsToGraph(prevAdjNextPoint, bottom[mod(i, bottom.length)]);
          // console.log("this");

          counter += 2;
        }
      }
    }
  };

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

        addEdgesToStrandedBottomPoints(prevIdx);
      } else {
        addEdgesToStrandedBottomPoints(idx - 1);
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

  console.log("top to bottom", countOfLargerToSmaller);
  console.log("bottom to top", counter);
  console.log("bottom size", bottom.length);
  console.log("top size", top.length);

  // need to connect adj points in each plane
  connectAll(top, true);
  connectAll(bottom, false);

  // console.log(graph.adjacencyList);

  // smallerPlane.forEach(())

  squaresToTris(graph);
  squaresToTris(graph);

  // triangulateSides(graph);
  // if you run it again and there are misses, the alg is failing
  // triangulateSides(graph);

  console.log(Object.keys(graph.adjacencyList).length);

  const tris = processGraph(graph);

  console.log(tris.length);
  return tris;

  // test
  // console.log(Object.keys(graph.adjacencyList).length);
  // console.log(largerPlane.length + smallerPlane.length);
  // Object.entries(graph.adjacencyList).forEach((obj) => {
  //   if (obj[1].length === 7) {
  //     console.log("key", obj[0], "val", obj[1]);
  //   }
  // });
};

module.exports = { createSides };
