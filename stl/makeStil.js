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
// chat gpt to add depth
const newmakeStl = (triangles, width) => {
  let str = "";
  str += "solid name\n";
  // console.log(triangles);

  triangles.forEach((tri) => {
    // Extract the vertices
    let [v0, v1, v2] = tri;

    // Compute the normal
    let norm = calcNorm(v0, v1, v2);

    // Extrude vertices
    let extrudedFront = extrudeVertices(tri, norm, width / 2);
    let extrudedBack = extrudeVertices(tri, norm, -width / 2);

    // Original face (front)
    str += "facet normal " + norm[0] + " " + norm[1] + " " + norm[2] + "\n";
    str += "outer loop\n";
    [extrudedFront[0], extrudedFront[1], extrudedFront[2]].forEach((point) => {
      str += "vertex " + point[0] + " " + point[1] + " " + point[2] + "\n";
    });
    str += "endloop\n";
    str += "endfacet\n";

    // Back face
    str += "facet normal " + -norm[0] + " " + -norm[1] + " " + -norm[2] + "\n";
    str += "outer loop";
    [extrudedBack[0], extrudedBack[1], extrudedBack[2]].forEach((point) => {
      str += "vertex " + point[0] + " " + point[1] + " " + point[2] + "\n";
    });
    str += "endloop\n";
    str += "endfacet\n";

    // Side faces
    for (let i = 0; i < 3; i++) {
      let next = (i + 1) % 3;
      str += "facet normal " + norm[0] + " " + norm[1] + " " + norm[2] + "\n";
      str += "outer loop\n";

      str +=
        "vertex " +
        extrudedFront[i][0] +
        " " +
        extrudedFront[i][1] +
        " " +
        extrudedFront[i][2] +
        "\n";

      str +=
        "vertex " +
        extrudedBack[i][0] +
        " " +
        extrudedBack[i][1] +
        " " +
        extrudedBack[i][2] +
        "\n";

      str +=
        "vertex " +
        extrudedBack[next][0] +
        " " +
        extrudedBack[next][1] +
        " " +
        extrudedBack[next][2] +
        "\n";

      str += "endloop\n";
      str += "endfacet\n";

      str += "facet normal " + norm[0] + " " + norm[1] + " " + norm[2] + "\n";
      str += "outer loop\n";

      str +=
        "vertex " +
        extrudedFront[i][0] +
        " " +
        extrudedFront[i][1] +
        " " +
        extrudedFront[i][2] +
        "\n";
      str +=
        "vertex " +
        extrudedBack[next][0] +
        " " +
        extrudedBack[next][1] +
        " " +
        extrudedBack[next][2] +
        "\n";
      str +=
        "vertex " +
        extrudedFront[next][0] +
        " " +
        extrudedFront[next][1] +
        " " +
        extrudedFront[next][2] +
        "\n";

      str += "endloop\n";
      str += "endfacet\n";
    }
  });

  str += "endsolid name\n";
  return str;
};

module.exports = { newmakeStl };
