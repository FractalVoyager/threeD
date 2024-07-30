// creates the sides of 3d object from two cross sections

// bottom and top are cross sections
// they are objects with points and tris

// non-negative mod
function mod(n, m) {
  return ((n % m) + m) % m;
}

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

// once the graph is all built up
// this creates tris from squares
const squaresToTris = (graph) => {
  // probably can add the traingles as we go

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
      return;
    }

    difference.forEach((strandedPoint) => {
      // only want to draw lines between top plane and bottom plane
      // every vertex here must have an adj that is adj to one of the initial adjs BIG CLAIM - though through it a lot but a proof would be nice and tested below
      let strandedAjs = graph.getAdjs(strandedPoint);
      let myin = false;
      // console.log("stranded", strandedPoint);
      // console.log("its adjs", strandedAjs);
      // console.log("original adjs", adjs);
      // console.log("original point", vertex);

      // console.log(strandedSecondLevelAjs, adjs);
      // big claim test
      strandedAjs.forEach((strandedAdj) => {
        let strandedAdjAdjs = graph.getAdjs(strandedAdj);
        strandedAdjAdjs.forEach((adj) => {
          if (adjs.indexOf(adj) !== -1) {
            myin = true;
          }
        });
      });
      if (myin !== true) {
        console.log(myin);
      }
      // console.log(myin);
    });
  });
};

// ponts, tris
const createSides = (bottom, top) => {
  const findClosestInPlane = (point, isLargerPlane) => {
    let plane = isLargerPlane ? largerPlane : smallerPlane;
    let distances = plane.map((p) => {
      let xdis = p[0] - point[0];
      let ydis = p[1] - point[1];
      return Math.sqrt(xdis * xdis + ydis * ydis);
    });
    let shortest = null;
    let closestPointIdx = null;
    // what to do if there are points that are the same distance apart????? how much does it matter?? maybe perfer points that haven't been matched
    distances.forEach((dis, idx) => {
      if (shortest === null || dis < shortest) {
        shortest = dis;
        closestPointIdx = idx;
      }
    });
    return plane[closestPointIdx];
  };

  const graph = new Graph();

  const connectAll = (shape, isTop) => {
    // need the z value only so there is no repeating elements, not 3d yet
    const z = isTop ? 1 : 0;
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
      [topPoint[0], topPoint[1], 1],
      [bottomPoint[0], bottomPoint[1], 0]
    );
  };

  const topIsLarger = top.points.length > bottom.points.length;

  const largerPlane = topIsLarger ? top.points : bottom.points;
  const smallerPlane = topIsLarger ? bottom.points : top.points;

  // step 3
  largerPlane.forEach((point) => {
    let connector = findClosestInPlane(point, false);
    let topPoint = topIsLarger ? point : connector;
    let bottomPoint = topIsLarger ? connector : point;
    add2DPointsToGraph(topPoint, bottomPoint);
  });

  // go through points in smaller plane
  smallerPlane.forEach((point) => {
    if (!graph.hasVertex([point[0], point[1], topIsLarger ? 0 : 1])) {
      let connector = findClosestInPlane(point, true);
      let topPoint = topIsLarger ? connector : point;
      let bottomPoint = topIsLarger ? point : connector;
      add2DPointsToGraph(topPoint, bottomPoint);
    }
  });

  // need to connect adj points in each plane
  connectAll(top.points, true);
  connectAll(bottom.points, false);

  // smallerPlane.forEach(())

  squaresToTris(graph);

  // test
  console.log(Object.keys(graph.adjacencyList).length);
  console.log(largerPlane.length + smallerPlane.length);
  // Object.entries(graph.adjacencyList).forEach((obj) => {
  //   if (obj[1].length === 7) {
  //     console.log("key", obj[0], "val", obj[1]);
  //   }
  // });
};

module.exports = { createSides };
