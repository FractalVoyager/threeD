// non-negative mod
function mod(n, m) {
  return ((n % m) + m) % m;
}

const unOptimizedEarClip = (orderedArr) => {
  let allRemaining = JSON.parse(JSON.stringify(orderedArr));
  let tris = [];

  const orientation = (a, b, c) => {
    const val = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
    if (val === 0) {
      return 0;
    } // collinear
    return val > 0 ? 1 : 2; // clockwise or counterclockwise --- want clockwise - 1
  };

  const hasPointsInside = (a, b, c) => {
    const triangleArea = Math.abs(
      0.5 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]))
    );

    for (let i = 0; i < allRemaining.length; i++) {
      const p = allRemaining[i];

      // Skip the vertices of the triangle itself
      if (p === a || p === b || p === c) {
        continue;
      }

      const area1 = Math.abs(
        0.5 *
          (p[0] * (b[1] - c[1]) + b[0] * (c[1] - p[1]) + c[0] * (p[1] - b[1]))
      );

      const area2 = Math.abs(
        0.5 *
          (a[0] * (p[1] - c[1]) + p[0] * (c[1] - a[1]) + c[0] * (a[1] - p[1]))
      );

      const area3 = Math.abs(
        0.5 *
          (a[0] * (b[1] - p[1]) + b[0] * (p[1] - a[1]) + p[0] * (a[1] - b[1]))
      );

      const totalArea = area1 + area2 + area3;

      // If the sum of the areas equals the triangle's area, the point lies inside
      if (Math.abs(triangleArea - totalArea) < 1e-9) {
        return true;
      }
    }

    return false;
  };

  const pointInTri = (point, tri) => {
    if (point === tri[0] || point === tri[1] || point === tri[2]) {
      return false;
    }
    const ori1 = orientation(point, tri[0], tri[1]);
    const ori2 = orientation(point, tri[1], tri[2]);
    const ori3 = orientation(point, tri[2], tri[0]);
    return ori1 === ori2 && ori2 === ori3;
  };

  // check if triangle has other points inside it
  // const hasPointsInside = (a, b, c) => {
  //   // only need to check reflex verticies CLAIM - especially questionable that you don't need to check colinear vertices but at one point I was confident
  //   for (let i = 0; i < allRemaining.length; i++) {
  //     if (pointInTri(allRemaining[i], [a, b, c])) {
  //       return true;
  //     }
  //   }
  //   return false;
  // };
  let i = 0;
  console.log(allRemaining.length);
  while (allRemaining.length > 3) {
    let remainingLength = allRemaining.length;

    let clippedIdx = i % remainingLength;
    let clipped = allRemaining[clippedIdx];

    let left = allRemaining[mod(clippedIdx - 1, remainingLength)];
    let right = allRemaining[mod(clippedIdx + 1, remainingLength)];

    if (
      orientation(left, clipped, right) === 2 &&
      !hasPointsInside(left, clipped, right)
    ) {
      tris.push([left, clipped, right]);
      allRemaining.splice(clippedIdx, 1);
      // allRemaining = JSON.parse(
      //   JSON.stringify(
      //     allRemaining.filter((vertex, index) => index !== clippedIdx)
      //   )
      // );

      // if (i === 8007) {
      //   // for (let i = 0; i < allRemaining.length - 1; i++) {
      //   //   let iIdx = orderedArr.indexOf(allRemaining[i]);
      //   //   let plusIdx = orderedArr.indexOf(allRemaining[i + 1]);
      //   //   if (iIdx === -1 || plusIdx === -1) {
      //   //     console.log("WTF");
      //   //   }
      //   //   if (iIdx > plusIdx) {
      //   //     console.log(iIdx, plusIdx);
      //   //   }
      //   // }
      //   console.log(allRemaining.length);
      //   return allRemaining;
      // }
    } else {
      i++;
    }
  }
  // all last trinagle
  tris.push([allRemaining[0], allRemaining[1], allRemaining[2]]);

  return tris;
};

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
    if (val === 0) {
      return 0;
    } // collinear
    return val > 0 ? 1 : 2; // clockwise or counterclockwise --- want counterclockwise - 2
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
  let origLength = orderedArr.length;
  for (let i = 0; i < origLength; i++) {
    let tri = [
      orderedArr[mod(i - 1, origLength)],
      orderedArr[i],
      orderedArr[mod(i + 1, origLength)],
    ];

    let ori = orientation(tri[0], tri[1], tri[2]);
    switch (ori) {
      case 0:
        colinears.push(orderedArr[i]);
        break;
      case 2:
        convexs.push(orderedArr[i]);
        break;
      case 1:
        reflexs.push(orderedArr[i]);
        break;
    }
  }

  // check convexs for ears
  for (let i = 0; i < convexs.length; i++) {
    // find the location in the original array
    let idx = orderedArr.indexOf(convexs[i]);

    // TODO - make this a fcn
    if (
      !hasPointsInside(
        orderedArr[mod(idx - 1, origLength)],
        orderedArr[i],
        orderedArr[mod(idx + 1, origLength)]
      )
    ) {
      ears.push(convexs[i]);
    }
  }

  // called in main loop to handle changes to main arrays after a clip
  const handleClippedAdj = (vertex) => {
    let vertexIdx = allRemaining.indexOf(vertex);
    let remainingLength = allRemaining.length;
    let left = allRemaining[mod(vertexIdx - 1, remainingLength)];
    let right = allRemaining[mod(vertexIdx + 1, remainingLength)];

    // left stuff
    // TODO - make this a function
    // check if it was already convex, if so, stays so, but could become an ear if it wasn't, also if it was an ear it could not be not
    if (convexs.indexOf(vertex) !== -1) {
      // was convex
      if (ears.indexOf(vertex) !== -1) {
        // wasn't an ear, check if it is now
        if (!hasPointsInside(left, vertex, right)) {
          // now is an ear
          // console.log("here");
          ears.push(vertex);
        }
        // could have been an ear and no longer is TODO clean up this, don;t need this else because we are checking either way is this true?
      } else {
        if (hasPointsInside(left, vertex, right)) {
          ears.splice(ears.indexOf(vertex), 1);
        }
      }
      // was not convex
    } else {
      let ori = orientation(left, vertex, right);
      let wasColinear = colinears.indexOf(ori) !== -1;
      switch (ori) {
        // colinear
        case 0:
          // do nothing if it was colinear, otherwise, remove from reflexs and add to colinear
          if (!wasColinear) {
            reflexs.splice(reflexs.indexOf(vertex), 1);
            colinears.push(vertex);
          }
          break;
        case 2:
          // now convex, remove from what it was in, and add to convex
          if (wasColinear) {
            colinears.splice(colinears.indexOf(vertex), 1);
          } else {
            reflexs.splice(reflexs.indexOf(vertex), 1);
          }
          convexs.push(vertex);
          // check if ear now
          if (!hasPointsInside(left, vertex, right)) {
            ears.push(vertex);
          }
          break;
        case 1:
          // is reflex
          if (wasColinear) {
            // remove from colinear, add to reflex
            colinears.splice(colinears.indexOf(vertex), 1);
            reflexs.push(vertex);
          }
          break;
      }
    }
  };

  // now have them all organized

  // main loop... while there are more than three points left
  // want to go through all of the ears, but add ears along the way

  // todo - fiugre out correct condition)
  while (allRemaining.length > 3) {
    // if (ears.length === 0) {
    //   console.log("NO EARSSSSS");
    //   break;
    // }
    let remainingLength = allRemaining.length;
    // if (remainingLength === 32) {
    //   console.log(allRemaining);
    //   break;
    // }
    // go through ears and trim
    // don't think it matters that we reverse the direction of the ears, because we are still using the correct direction when we find the point on either side TODO check
    if (ears.length === 0) {
      console.log(
        "problem, no more ears when there is more than three remaining, all reaming:",
        allRemaining
      );
      break;
    }
    let clipped = ears.pop();
    let clippedIdx = allRemaining.indexOf(clipped);

    let left = allRemaining[mod(clippedIdx - 1, remainingLength)];
    let right = allRemaining[mod(clippedIdx + 1, remainingLength)];
    allRemaining.splice(clippedIdx, 1);

    // add to list of trinagles

    tris.push([left, clipped, right]);

    // handle the points on either side, if they are reflex or colinear, they could turn to convex and become ears
    // for (let v in allRemaining) {
    //   handleClippedAdj(v);
    // }
    handleClippedAdj(left);
    handleClippedAdj(right);
  }
  // all last trinagle
  tris.push([allRemaining[0], allRemaining[1], allRemaining[2]]);

  return tris;
};

module.exports = { earClip, unOptimizedEarClip };
