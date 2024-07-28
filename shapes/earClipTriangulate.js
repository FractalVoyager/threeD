// our vertices are arranged in a clockwise order, so we want clockwise orientation - means convex
const earClip = (orderedArr) => {
  let allRemaining = JSON.parse(JSON.stringify(orderedArr));
  // remaining reflex vertices - angle formed > 180 degrees
  let reflexs = [];
  // reaming convex vertices - the good ones we want < 180
  // all initial convexs will stay convexs CLAIM
  let convexs = [];
  // colinear - don't need to check if they are inside another point,
  // but can't be an ear, or vise versa, but need to check this once
  // TODO - maybe simplfy everything by considering colinears reflexs
  let colinears = [];
  // the intial ears
  // all initial ears will stay ears CLAIM
  let ears = [];
  // list of made triangles
  let tris = [];

  const orientation = (a, b, c) => {
    const val = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
    if (val === 0) return 0; // collinear
    return val > 0 ? 1 : 2; // clockwise or counterclockwise
  };

  // tri is [a,b,c]
  const pointInTri = (point, tri) => {
    const ori1 = orientation(point, tri[0], tri[1]);
    const ori2 = orientation(point, tri[1], tri[2]);
    const ori3 = orientation(point, tri[2], tri[0]);
    return ori1 === ori2 && ori2 === ori3;
  };

  // check if triangle has other points inside it
  const hasPointsInside = (a, b, c) => {
    // only need to check reflex verticies CLAIM - especially questionable that you don't need to check colinear vertices but at one point I was confident
    for (let i = 0; i < reflexs.length; i++) {
      if (pointInTri(reflexs[i], [a, b, c])) {
        return true;
      }
    }
    return false;
  };

  // pre organize all vertices into the groups
  let length = orderedArr.length;
  for (let i = 0; i < length; i++) {
    let tri = [
      orderedArr[(i - 1) % length],
      orderedArr[i],
      orderedArr[(i + 1) % 4],
    ];

    let ori = orientation(tri[0], tri[1], tri[2]);
    switch (ori) {
      case 0:
        colinears.push(orderedArr[i]);
      case 1:
        convexs.push(orderedArr[i]);
      case 2:
        reflexs.push(orderedArr[i]);
    }
  }
  // check convexs for ears
  length = convexs.length;
  for (let i = 0; i < length; convexs++) {
    // WRONG need the points next to it in original array

    if (
      !hasPointsInside(
        convexs[(i - 1) % length],
        convexs[i],
        convexs[(i + 1) % length]
      )
    ) {
      ears.push(convexs[i]);
    }
  }

  // now have them all organized

  // main loop... while there are more than three points left
  while (allRemaining.length > 3) {}
};
