const { mod } = require("../util/util");
const connectAll = (shape, z, graph) => {
  // need the z value only so there is no repeating elements, not 3d yet
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

module.exports = { connectAll };
