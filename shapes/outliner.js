// arr is array of points that all the black points
// length is width and height of gird (always square for now)
// could do this with array of points or twoD array of black and white values, going with two D array of black and white values

const { dir } = require("console");

const getNextStartPointStart = (x, y, len) => {
  if (x === len) {
    return [x, y + 1];
  } else {
    return [x + 1, y];
  }
};

const isColinear = (a, b, c) => {
  const val = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  if (val === 0) {
    return true;
  } // collinear
  return false; // clockwise or counterclockwise --- want clockwise - 1
};

const handlePointsAlongLine = (ordering) => {
  // todo handle first point - use mods
  let newPoints = [];
  for (let i = 1; i < ordering.length - 1; i++) {
    // if the direction from prev point to this point is opposite of dir from this point to next we want to get rid of it
    if (isColinear(ordering[i - 1], ordering[i], ordering[i + 1])) {
      // console.log("is colinear");
      let dotProd =
        (ordering[i][0] - ordering[i - 1][0]) *
          (ordering[i + 1][0] - ordering[i][0]) +
        (ordering[i][1] - ordering[i - 1][1]) *
          (ordering[i + 1][1] - ordering[i][1]);
      // B.x - A.x * C.x - B.x, +B.y - A.y * C.y - B.y;
      if (dotProd < 0) {
        // console.log("real one");
      } else {
        newPoints.push(ordering[i - 1]);
      }

      // if (dotProduct < 0) {
      //   // Directions are opposite, skip point B
      //   console.log("really colinear");
      // }
    } else {
      newPoints.push(ordering[i - 1]);
    }
  }
  return newPoints;
};

// can easilly switch this back to 1d array if performance issues but for now this is easier to deal with
const outliner = (arr, length) => {
  // goal: given an array of points, find a point ordering to outline that shape
  // this is so we can process this by triangulating

  // need to find a good start point on the edge
  // Theorem 1.1
  const findStartPoint = (startY, startX) => {
    for (let row = startY; row < length; row++) {
      if (row > startY) {
        startX = 0;
      }
      for (let col = startX; col < length; col++) {
        // found black point
        if (arr[row][col] === 1) {
          return [row, col];
        }
      }
    }
    return false;
  };

  // clockwise direction
  const adjs = [
    // right
    (point) => {
      // end of row doesn't work
      if (point[1] === length) {
        return false;
      }
      return [point[0], point[1] + 1];
    },
    // down right
    (point) => {
      // end of row or end of column doesn't work
      if (point[1] === length || point[0] === length) {
        return false;
      }
      return [point[0] + 1, point[1] + 1];
    },
    // down
    (point) => {
      // end of col doesn't work
      if (point[0] === length) {
        return false;
      }
      return [point[0] + 1, point[1]];
    },
    // down left
    (point) => {
      // end of col or start of row doesn't work
      if (point[0] === length || point[1] === 0) {
        return false;
      }
      return [point[0] + 1, point[1] - 1];
    },
    // left
    (point) => {
      // start of row doesn't work
      if (point[1] === 0) {
        return false;
      }
      return [point[0], point[1] - 1];
    },
    // up left
    (point) => {
      // start of row or start of col doesn't work
      if (point[1] === 0 || point[0] === 0) {
        return false;
      }
      return [point[0] - 1, point[1] - 1];
    },
    // up
    (point) => {
      // start of col doesn't work
      if (point[0] === 0) {
        return false;
      }
      return [point[0] - 1, point[1]];
    },
    // up right
    (point) => {
      // start of col or end of row doesn't work
      if (point[0] === 0 || point[1] === length) {
        return false;
      }
      return [point[0] - 1, point[1] + 1];
    },
  ];

  // switch x,y to y,x for array to actual point and vise versa
  const reversePoint = (point) => {
    return [point[1], point[0]];
  };

  const tailDirections = [
    // 0 and 4 - right
    // in y, x land
    (point) => {
      return [
        [point[0] - 0.5, point[1]],
        [point[0] + 0.5, point[1]],
      ];
    },
    // down right as default
    (point) => {
      return [
        [point[0] - 0.5, point[1] + 0.5],
        [point[0] + 0.5, point[1] - 0.5],
      ];
    },
    // down as deafult
    (point) => {
      return [
        [point[0], point[1] + 0.5],
        [point[0], point[1] - 0.5],
      ];
    },
    (point) => {
      return [
        [point[0] + 0.5, point[1] + 0.5],
        [point[0] - 0.5, point[1] - 0.5],
      ];
    },
  ];

  const findPoints = (startPoint, direction) => {
    const getSplitPoints = (splitPoint, direction) => {
      // direction was last direction, so 2 means dinagnoally up, which is really 5, just switching to keep it straight in my head
      direction = (direction + 3) % 8;
      // look at picures from 8/7/24 for this and tailDirections
      let simpledDirection = direction % 4;
      let firstPoint;
      let secondPoint;
      if (direction >= 4) {
        // need to reverse ordering
        [secondPoint, firstPoint] =
          tailDirections[simpledDirection](splitPoint);
      } else {
        // default ordering
        [firstPoint, secondPoint] =
          tailDirections[simpledDirection](splitPoint);
      }
      return [firstPoint, secondPoint];
    };
    const createTail = (splitPoint, tailEndPoint, direction) => {
      // this will work on all tails that don't change direction
      // it will also work on simple split tails
      // that is, split tails that aren't off of a tail, i.e. a double tail
      let [firstPoint, secondPoint] = getSplitPoints(splitPoint, direction);
      // console.log(direction, "dirrrrr");
      let interDir = direction;
      if (interDir === 0) {
        interDir = -10;
      } else {
        interDir = interDir * -1;
      }
      ordering.push(reversePoint(firstPoint));
      directions.push(-30);
      ordering.push(reversePoint(tailEndPoint));
      directions.push(-40);
      ordering.push(reversePoint(secondPoint));
      directions.push(interDir);

      // todo add directions
    };

    const handleTail = () => {
      // here, we found a point that has no adjs other than the point it came from
      // need to store the previous directions so we can pop off
      // TODO - handle the tails that change direction later

      // first point has no adjs
      if (directions.length === 0) {
        return [false, false];
      }

      // point we were just at is the end of the tail
      let tailEndDirection = directions.pop();
      // back to array way
      let tailEndPoint = reversePoint(ordering.pop());
      // console.log("tail end", tailEndPoint, tailEndDirection);
      for (let i = 1; i < ordering.length; i++) {
        let point = reversePoint(ordering[ordering.length - i]);
        let direction = directions[directions.length - i];
        // console.log("point", point, direction);
        // reason for +4
        // say we came in at 2 so going digonally up
        // want to come in one from the point that we just came from, so 7
        // do it out it works
        // console.log("1");
        // last point in ordering was a tail (second point)
        if (direction < 0) {
          // console.log("Heerere", direction);
          if (direction < -10) {
            console.error("weird spot");
            exit();
          }
          // need to reverse point this should work
          let newDir;
          if (direction === -10) {
            newDir = 0;
          } else {
            newDir = direction * -1;
          }
          newDir = (newDir + 4) % 8;
          let interDirForSplit = (newDir + 3) % 8;
          let simpledDir = interDirForSplit % 4;
          // console.log(
          //   "past",
          //   tailEndPoint,
          //   point,
          //   ordering[ordering.length - 2],
          //   ordering[ordering.length - 3]
          // );
          let newPoints = tailDirections[simpledDir](point);
          // console.log(newPoints, "newwwww", interDirForSplit);
          let newPoint;
          if (interDirForSplit >= 4) {
            newPoint = newPoints[0];
          } else {
            newPoint = newPoints[1];
          }

          // now have the real point as newPoint
          let [herePossTailEscPoint, herePossTailEscDir] = findNextPoint(
            newPoint,
            (tailEndDirection + 4) % 8
          );

          // shouldn't cause any crossing if we just got to the next point
          ordering.push(reversePoint(tailEndPoint));
          directions.push(-20);
          return [herePossTailEscPoint, herePossTailEscDir];
        }

        // getting caught here because last point was a tail, so point is weird
        // console.log("direction", direction);
        // console.log("point", point);
        // console.log(
        //   "prev",
        //   tailEndPoint,
        //   point,
        //   ordering[ordering.length - 2],
        //   ordering[ordering.length - 3],
        //   ordering[ordering.length - 4],
        //   ordering[ordering.length - 5],
        //   ordering[ordering.length - 6],
        //   ordering[ordering.length - 7]
        // );
        let [possTailEscPoint, possTailEscDir] = findNextPoint(
          point,
          (tailEndDirection + 4) % 8
        );
        // console.log("2");
        if (tailEndDirection !== possTailEscDir) {
          // tail either changed direction or we found an escape
          // need to check that this tail escape isn't a point we've already been to along the tail
          // it needs to not be in the same direction as the tails
          // additonal checks here for tail direction chaning TODO
          // console.log("tail esc", possTailEscPoint, possTailEscDir);
          // console.log(
          //   "prev point",
          //   reversePoint(ordering[ordering.length - i - 1])
          // );
          if (
            JSON.stringify(possTailEscPoint) ===
            JSON.stringify(reversePoint(ordering[ordering.length - i - 1]))
          ) {
            // console.log("point already in ordering");
            // todo this prob wont work for longer tails that change direction
            // need to create tail with point and tail endpoint, also need to split this wrong escape point
            // split wrong escape point
            let [endTailStart, endTailEnd] = getSplitPoints(
              possTailEscPoint,
              (possTailEscDir + 4) % 8
            );
            let [middleStart, middleEnd] = getSplitPoints(
              point,
              tailEndDirection
            );
            directions.pop();
            directions.pop();
            ordering.pop();
            ordering.pop();
            ordering.push(
              reversePoint(endTailStart),
              reversePoint(middleStart),
              reversePoint(tailEndPoint),
              reversePoint(middleEnd),
              reversePoint(endTailEnd)
            );
            let interDir = (possTailEscDir + 4) % 8;
            if (interDir === 0) {
              interDir = -10;
            } else {
              interDir = interDir * -1;
            }
            directions.push(-12, -13, -14, -15, interDir);

            // then find a new esc point that works - todo this just gets the next one
            let [newTailEscPoint, newTailEscDir] = findNextPoint(
              possTailEscPoint,
              possTailEscDir
            );

            if (
              JSON.stringify(newTailEscPoint) ===
              JSON.stringify(reversePoint(ordering[ordering.length - i - 2]))
            ) {
              console.log("problem");
            }
            return [newTailEscPoint, newTailEscDir];
          } else {
            directions.pop();
            ordering.pop();

            createTail(point, tailEndPoint, tailEndDirection);
            // todo make this pop all
            // console.log(possTailEscPoint, "tail esc");
            return [possTailEscPoint, possTailEscDir];
          }
        } else {
          // here we just split mid tail points
          console.log("OOPS");
          exit();
        }
      }

      if (ordering.length === 0) {
        // console.log("first found point is tail end");
        let [possTailEscPoint, possTailEscDir] = findNextPoint(
          startPoint,
          (tailEndDirection + 4) % 8
        );
        if (!possTailEscPoint) {
          // this means we picked a 2 by shape
          return [false, false];
        }

        // not sure this will work, might not ever find start or something weird
        createTail(startPoint, tailEndPoint, tailEndDirection);
        return [possTailEscPoint, possTailEscDir];
      }

      if (ordering.length === 1) {
        // console.log("second found point is tail end");
        let point = reversePoint(ordering.pop());
        let [possTailEscPoint, possTailEscDir] = findNextPoint(
          point,
          (tailEndDirection + 4) % 8
        );
        directions.pop();
        createTail(point, tailEndPoint, tailEndDirection);
        // console.log(possTailEscPoint);
        // console.log(ordering);
        return [possTailEscPoint, possTailEscDir];
      }

      // don't think I need this if properly handling skipping shapes
      // if (ordering.length === 0) {
      //   console.log("special start on middle of tail with none in ordering");
      //   // console.log(startPoint);
      //   // think this covers everything? But really not super sure, even though it looks liek it doensn't think aobut it it should, other longer tials should be covered with normal thing
      //   let [possTailEscPoint, possTailEscDir] = findNextPoint(
      //     startPoint,
      //     (tailEndDirection + 4) % 8
      //   );
      //   console.log("tail esc", possTailEscPoint, possTailEscDir);
      //   createTail(startPoint, tailEndPoint, tailEndDirection);
      //   return [possTailEscPoint, possTailEscDir];
      //   // console.log(possTailEscPoint);
      // } else {

      // or this
      // else if (ordering.length === 1) {
      //   // second or start point could be escape
      //   console.log("special start on middle of tail with 1 in ordering");
      //   let [possTailEscPoint, possTailEscDir] = findNextPoint(
      //     ordering[0],
      //     (tailEndDirection + 4) % 8
      //   );
      //   console.log(possTailEscPoint, possTailEscDir);
      //   let point = ordering.pop();
      //   directions.pop();
      //   createTail(point, tailEndPoint, tailEndDirection);
      //   return [possTailEscPoint, possTailEscDir];
      console.log("no tail esc found");
      console.error("no tail escape foud");
      exit();
      return false;
      // }
    };

    const handleRepeatedPoint = (point, dir, oldIdx) => {
      // we want to split this point
      let oldDir = directions[oldIdx];
      if (oldDir < 0) {
        console.log("old dir is less than 0");
        exit();
      }
      // console.log(point);

      // this is a case where it could be a seongle point connectiong shapes or something that isn't handled correctly with this - think that it works well enough
      if ((oldDir + 4) % 8 !== dir) {
        // console.log("WEIRD SPLIT POINT");
      } else {
        // console.log("not weird split point");
      }

      if (dir < 0) {
        console.error("adsfads");
        exit();
      }

      // old ==== realDir = (dir + 4) % 8;
      let realDir = (dir + 4) % 8;
      // if (dir < 4) {
      //   realDir = oldDir;
      // } else {
      //   realDir = (dir + 4) % 8;
      // }

      // TODO - need a better way of doing this for points that get hit 3 times asnd even 2
      let [firstPoint, secondPoint] = getSplitPoints(point, realDir);

      let interDir = realDir;
      if (interDir === 0) {
        interDir = -10;
      } else {
        interDir = interDir * -1;
      }
      ordering[oldIdx] = reversePoint(firstPoint);
      directions[oldIdx] = -12;
      return [secondPoint, interDir];
      // return second half of split with new direction
    };

    const findNextPoint = (lastPoint, direction) => {
      // want to check adjs in order (clockwise) starting at direction (what direction the last point was found at)
      // console.log("find next point last", lastPoint, direction);
      for (let i = direction; i <= direction + 6; i++) {
        let dir = i % 8;
        // point we want
        let dirPoint = adjs[dir](lastPoint);
        // console.log(dirPoint);
        // console.log(lastPoint);
        // found next point Theorem 1.2
        if (arr[dirPoint[0]][dirPoint[1]] === 1) {
          // our new direction is the direction we came from then up one
          // which is the opposite of current current then up one, which is where this comes from
          let newDir = (dir + 5) % 8;
          // recursive call
          return [dirPoint, newDir];
        }
      }
      // console.log("handling tail");
      // found point with no adjs to black squares other than the one we came from
      return handleTail();
      // return false;
    };
    let ordering = [];
    let directions = [];
    // could also only have one call to this if I assing start to new
    let [newPoint, newDir] = findNextPoint(startPoint, direction);
    if (!newPoint) {
      // start point was stranded, find a new one
      return false;
    }
    // need to swap order to switch form array of rows to x,y canvas corod
    ordering.push([newPoint[1], newPoint[0]]);
    directions.push(newDir);
    while (true) {
      // console.log(newPoint);
      [newPoint, newDir] = findNextPoint(newPoint, newDir);
      if (newPoint === false) {
        return false;
      }
      let realPoint = newPoint;
      let realDir = newDir;
      // check if it has already been in the ordering
      ordering.every((point, idx) => {
        if (point[0] === newPoint[1] && point[1] === newPoint[0]) {
          [realPoint, realDir] = handleRepeatedPoint(newPoint, newDir, idx);
          return false;
        } else {
          return true;
        }
      });
      // console.log("real point", realPoint, "new point", newPoint);

      directions.push(realDir);
      if (newDir < 0) {
        // console.log("new dir less than -00000");
      }
      ordering.push([realPoint[1], realPoint[0]]);
      if (newPoint[0] === startPoint[0] && newPoint[1] === startPoint[1]) {
        break;
      }
      // if (newPoint[0] === 144 && newPoint[1] === 221) {
      //   return ordering;
      // }
    }

    return handlePointsAlongLine(ordering);
    return ordering;
  };

  // the point you just came from is on the left, so you're moving right
  // so the first point to check is upper left which is at idx 5
  // these points in y,x
  // also in clockwise order

  /// START ////
  // console.log(arr[381][542]);
  let ordering = false;
  let startPoint;
  let startX = 0;
  let startY = 0;
  // points to start looking for next one
  while (ordering === false) {
    startPoint = findStartPoint(startY, startX);
    // console.log("start point", startPoint);
    ordering = findPoints(startPoint, 5);

    // start point had no adjs
    if (ordering === false) {
      // get new starts based on old
      // startPoint is y,x
      [startX, startY] = getNextStartPointStart(
        startPoint[1],
        startPoint[0],
        length
      );
    } else {
      // if the shape is small, prob not full shape
      if (ordering.length < length / 2) {
        let largestY = ordering.reduce((acc, point) => {
          if (point[1] > acc) {
            return point[1];
          }
          return acc;
        }, 0);
        let largestYs = ordering.filter((point) => point[1] === largestY);
        let largestX = largestYs.reduce((acc, point) => {
          if (point[0] > acc) {
            return point[0];
          }
          return acc;
        }, 0);
        // console.log(ordering);
        // todo - could run into problems with last numbers not being integers
        if (!Number.isInteger(largestX) || !Number.isInteger(largestY)) {
          console.error("starts aren't integers ");
          exit();
        }
        [startX, startY] = getNextStartPointStart(largestX, largestY, length);
        // console.log("largest x,y", largestX, largestY);
        ordering = false;
      }
    }
  }
  return ordering;
};

module.exports = { outliner };
