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
// this creates tris from squares
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
  const findClosestInPlane = (point, isBottomPlane) => {
    let plane = isBottomPlane ? bottom : top;
    let distances = plane.map((p) => {
      let xdis = p[0] - point[0];
      let ydis = p[1] - point[1];
      return Math.sqrt(xdis * xdis + ydis * ydis);
    });
    let shortest = null;
    let closestPointIdxs = [];
    // what to do if there are points that are the same distance apart????? how much does it matter?? maybe perfer points that haven't been matched
    distances.forEach((dis, idx) => {
      if (shortest === null || dis < shortest) {
        shortest = dis;
        closestPointIdxs = [idx];
      } else if (dis === shortest) {
        closestPointIdxs.push(idx);
      }
    });
    return closestPointIdxs.map((idx) => {
      return plane[idx];
    });
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

  // step 3
  let countOfLargerToSmaller = 0;
  top.forEach((point) => {
    let connectors = findClosestInPlane(point, true);
    connectors.forEach((connector) => {
      countOfLargerToSmaller++;
      let topPoint = point;
      let bottomPoint = connector;
      add2DPointsToGraph(topPoint, bottomPoint);
    });
  });

  // go through points in smaller plane
  let countOfSmallerToLarger = 0;

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
  bottom.forEach((point, idx) => {
    if (!graph.hasVertex([point[0], point[1], currZ])) {
      // here, we found one that has no adj
      // prev will always have adj UNLESS we are at the start
      // special case for first vertex
      if (idx === 0) {
        let newIdx = idx;
        let prev = bottom[mod(newIdx - 1, bottom.length)];
        while (!graph.hasVertex([prev[0], prev[1], currZ])) {
          newIdx--;
          prev = bottom[mod(newIdx - 1, bottom.length)];
        }
        let prevAdjs = graph.getAdjs([prev[0], prev[1], currZ]);
        // console.log("prev adjs", prevAdjs);
        // console.log([prevAdjs[0][0], prevAdjs[0][1]]);
        // big claim here saying that they will always be added in order - CHECK CHECK
        // find idx of last one in smaller plane
        // this is e
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
        // hopefully, e will always be adj to point in larger plane that is next
        console.log(top[prevAdjIdx]);
        console.log(
          graph.getAdjs([top[prevAdjIdx][0], top[prevAdjIdx][1], currZ + zDiff])
        );
      }

      let connectors = findClosestInPlane(point, false);

      connectors.forEach((connector) => {
        countOfSmallerToLarger++;
        let topPoint = connector;
        let bottomPoint = point;
        add2DPointsToGraph(topPoint, bottomPoint);
      });
    }
  });

  console.log("larger to smaller", countOfLargerToSmaller);
  console.log("smaller to larger", countOfSmallerToLarger);
  console.log("larger size", bottom.length);
  console.log("smaller size", top.length);

  // need to connect adj points in each plane
  connectAll(top, true);
  connectAll(bottom, false);

  // console.log(graph.adjacencyList);

  // smallerPlane.forEach(())

  triangulateSides(graph);
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
