// Function to calculate the normal vector of a triangle
function calcNorm(p1, p2, p3) {
  // p1, p2, and p3 are the vertices of the triangle, each being an array of [x, y, z]

  // Calculate the edge vectors
  const edge1 = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

  const edge2 = [p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]];

  // Calculate the cross product of edge1 and edge2
  const normal = [
    edge1[1] * edge2[2] - edge1[2] * edge2[1],
    edge1[2] * edge2[0] - edge1[0] * edge2[2],
    edge1[0] * edge2[1] - edge1[1] * edge2[0],
  ];

  // Calculate the length (magnitude) of the normal vector
  const length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2 + normal[2] ** 2);

  // Normalize the normal vector
  const normalizedNormal = [
    normal[0] / length,
    normal[1] / length,
    normal[2] / length,
  ];

  return normalizedNormal;
}

// fcn for gpt gen
function extrudeVertices(vertices, normal, distance) {
  return vertices.map((vertex) => [
    vertex[0] + normal[0] * distance,
    vertex[1] + normal[1] * distance,
    vertex[2] + normal[2] * distance,
  ]);
}
const makeStlForTris = (tris) => {
  let str = "";
  tris.forEach((tri) => {
    let norm = calcNorm(tri[0], tri[1], tri[2]);
    str += "facet normal " + norm[0] + " " + norm[1] + " " + norm[2] + "\n";
    str += "outer loop\n";

    tri.forEach((point) => {
      str += "vertex " + point[0] + " " + point[1] + " " + point[2] + "\n";
    });
    str += "endloop\nendfacet\n";
  });

  return str;
};

// original one to take list of triangles and make stil out of it
const makeStlFromTrisList = (trisList) => {
  let str = "solid name\n";
  trisList.forEach((tris) => {
    str += makeStlForTris(tris);
  });
  str += "endsolid name\n";
  return str;
};

module.exports = { makeStlFromTrisList };
