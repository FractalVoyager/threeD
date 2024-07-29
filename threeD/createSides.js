// creates the sides of 3d object from two cross sections

// bottom and top are cross sections
// they are objects with points and tris

// non-negative mod
function mod(n, m) {
  return ((n % m) + m) % m;
}

// ponts, tris
const createSides = (bottom, top) => {
  const findClosestInSmallerPlane = (point) => {
    let distances = smallerPlane.map((p) => {
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
    return smallerPlane[closestPointIdx];
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

  connectAll(top.points, true);
  connectAll(bottom.points, false);

  largerPlane.forEach((point) => {
    let connector = findClosestInSmallerPlane(point);
    let topPoint = topIsLarger ? point : connector;
    let bottomPoint = topIsLarger ? connector : point;
    add2DPointsToGraph(topPoint, bottomPoint);
  });

  // test
  // console.log(Object.keys(graph.adjacencyList).length);
  // console.log(largerPlane.length + smallerPlane.length);
  // Object.entries(graph.adjacencyList).forEach((obj) => {
  //   if (obj[1].length === 2) {
  //     console.log("key", obj[0], "val", obj[1]);
  //   }
  // });
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
}

module.exports = { createSides };
