const { Graph, processGraph } = require("./graph");
const { squaresToTris } = require("./triangulate");
const { connectToOtherShapeFirst } = require("./connectToOtherShapeFirst");
const { connectAll } = require("./connectWithinShape");
const { connectToOtherShapeSecond } = require("./connectToOtherShapeSecond");

/*
description:
main file for creating the sides of a 3d object from two cross sections 
params: 
bottom - the bottom cross section 
top - top cross section
currZ - the z value for the bottom
zDiff - currZ+zDiff = the z value for top
what is happening: 
first, connect all points from one cross section (now top), to the cloest point in bottom to that given point. 
  The point that a given top point connects to, say t4, must be connected to a bottom point that is or after all previous bottom points that
  have been connected. Say t0 goes to b4, t1-b4, t2-b5, t3-b5,b6, then t4 must be connected to b6 or further up to b4. 
second, connect all stranded bottom points (ones that no top point ever connected to) to top. 
  this is done carefully. Given a stranded bottom point, say b3, and b2 is connected to t1, and b4 is connected to t2, b3 will be connected to one of those 
NOTE: in this version, the top points will connect to all points after or on bottom points that have been connected that are the same distance from the top point if there is a tie
  This complicates going from bottom to top: we always take the last connection of b2 and first connection of b4 because they are added in order
third, we connect all the points in order for both shapes
fourth, we are now left with all squares and tris. We triangulate the shape.
fifth, we take the graph represenation of the 3d shape we have been using, and turn it into a list of triangles. Return the list of triangles.
*/

// creates the sides of 3d object from two cross sections

// bottom and top are cross sections, they are a list of ordered points
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

  // first step
  connectToOtherShapeFirst(top, bottom, add2DPointsToGraph);

  let counter = 0;

  // second
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

  // third
  connectPointsWithinShape(top, true);
  connectPointsWithinShape(bottom, false);

  // fourth
  squaresToTris(graph);
  // note: if you run again and they're are misses (true logged), then not all tris

  console.log(Object.keys(graph.adjacencyList).length);

  // fifth
  const tris = processGraph(graph);

  console.log(tris.length);
  return tris;
};

module.exports = { createSides };
