const { Graph, processGraph } = require("./graph");
const { squaresToTris } = require("./triangulate");
const { connectToOtherShapeFirst } = require("./connectToOtherShapeFirst");
const { mod, get2dDistance } = require("../util/util");
const { connectAll } = require("./connectWithinShape");
const { connectToOtherShapeSecond } = require("./connectToOtherShapeSecond");

// creates the sides of 3d object from two cross sections

// bottom and top are cross sections
// they are objects with points and tris

// once the graph is all built up
// this creates traingles from squares

// ponts, tris
const createSides = (bottom, top, currZ, zDiff) => {
  const graph = new Graph();

  //////// intermindate functions ///////
  const connectPointsWithinShape = (shape, isTop) => {
    const z = isTop ? currZ + zDiff : currZ;
    connectAll(shape, z, graph);
  };

  const add2DPointsToGraph = (topPoint, bottomPoint) => {
    graph.add2DPoints(topPoint, bottomPoint, currZ, zDiff);
  };
  ///////////////////////////////////////

  connectToOtherShapeFirst(top, bottom, add2DPointsToGraph);

  let counter = 0;

  connectToOtherShapeSecond(
    top,
    bottom,
    graph,
    currZ,
    zDiff,
    add2DPointsToGraph
  );

  console.log("bottom to top", counter);
  console.log("bottom size", bottom.length);
  console.log("top size", top.length);

  // need to connect adj points in each plane

  connectPointsWithinShape(top, true);
  connectPointsWithinShape(bottom, false);

  // console.log(graph.adjacencyList);

  // smallerPlane.forEach(())

  squaresToTris(graph);
  // if you run again and they're are misses (true logged), then not all tris

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
