const { Graph, processGraph } = require("../threeD/graph");
const { connectAll } = require("../threeD/connectWithinShape");
const { triangulateSides } = require("../threeD/triangulate");

// now just connecting points at the same index

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

  /// more advanced inter fcn ///

  const connectPlanes = () => {
    bottom.forEach((btmPoint, idx) => {
      add2DPointsToGraph(top[idx], btmPoint);

      // this is to make it staggerted instead of all the tris facing the same way
      // could maybe add randomness for this
      if (idx % 2 === 1) {
        add2DPointsToGraph(top[idx - 1], btmPoint);
        if (idx !== bottom.length - 1) {
          add2DPointsToGraph(top[idx + 1], btmPoint);
        }
      }
    });
  };

  // TODO - no longer need the graph because just know the 3d points were adding , do that later, big speedup

  console.log("connnecting palnes");
  connectPlanes();
  console.log("connecting points within");
  connectPointsWithinShape(top, true);
  connectPointsWithinShape(bottom, false);
  console.log("processing graph");
  const tris = processGraph(graph);
  console.log(tris.length);
  return tris;
};

module.exports = { createSides };
