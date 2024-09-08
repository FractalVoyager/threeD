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

  add2DPoints = (topPoint, bottomPoint, currZ, zDiff) => {
    this.addEdge(
      [topPoint[0], topPoint[1], currZ + zDiff],
      [bottomPoint[0], bottomPoint[1], currZ]
    );
  };

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

const processSimpleGraph = (graph) => {
  // for the kind of graph we know
  // the bottom
};

// once the graph is traingulated, create triangles from graph
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

module.exports = { Graph, processGraph };
