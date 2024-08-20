// arr is array of points that all the black points
// length is width and height of gird (always square for now)
// could do this with array of points or twoD array of black and white values, going with two D array of black and white values

const { dir } = require("console");

// can easilly switch this back to 1d array if performance issues but for now this is easier to deal with
const outliner = (arr, length) => {
  // goal: given an array of points, find a point ordering to outline that shape
  // this is so we can process this by triangulating

  // need to find a good start point on the edge
  // Theorem 1.1
  const findStartPoint = () => {
    for (let row = 0; row < length; row++) {
      for (let col = 0; col < length; col++) {
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
      if (direction > 4) {
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

      ordering.push(reversePoint(firstPoint));
      ordering.push(reversePoint(tailEndPoint));
      ordering.push(reversePoint(secondPoint));
      // todo add directions
    };

    const handleTail = () => {
      // here, we found a point that has no adjs other than the point it came from
      // need to store the previous directions so we can pop off
      // TODO - handle the tails that change direction later

      // point we were just at is the end of the tail
      let tailEndDirection = directions.pop();
      // back to array way
      let tailEndPoint = reversePoint(ordering.pop());
      console.log("tail end", tailEndPoint, tailEndDirection);

      for (let i = 1; i < ordering.length; i++) {
        let point = reversePoint(ordering[ordering.length - i]);
        let direction = directions[directions.length - i];
        console.log("point", point, direction);
        // reason for +4
        // say we came in at 2 so going digonally up
        // want to come in one from the point that we just came from, so 7
        // do it out it works
        let [possTailEscPoint, possTailEscDir] = findNextPoint(
          point,
          (tailEndDirection + 4) % 8
        );
        if (tailEndDirection !== possTailEscDir) {
          // tail either changed direction or we found an escape
          // need to check that this tail escape isn't a point we've already been to along the tail
          // it needs to not be in the same direction as the tails
          // additonal checks here for tail direction chaning TODO
          console.log("tail esc", possTailEscPoint, possTailEscDir);
          console.log(
            "prev point",
            reversePoint(ordering[ordering.length - i - 1])
          );
          if (
            JSON.stringify(possTailEscPoint) ===
            JSON.stringify(reversePoint(ordering[ordering.length - i - 1]))
          ) {
            console.log("point already in ordering");
          }
          directions.pop();
          ordering.pop();

          createTail(point, tailEndPoint, tailEndDirection);
          // todo make this pop all

          return [possTailEscPoint, possTailEscDir];
        } else {
          console.log("OOPS");
        }
      }
      console.log("no tail esc found");
      return false;
    };

    const handleRepeatedPoint = (point, dir, oldIdx) => {
      // we want to split this point
      let oldDir = directions[oldIdx];
      console.log(point);

      // this is a case where it could be a seongle point connectiong shapes or something that isn't handled correctly with this
      if ((oldDir + 4) % 8 !== dir) {
        console.log("WEIRD SPLIT POINT");
      } else {
        console.log("not weird split point");
      }

      let [firstPoint, secondPoint] = getSplitPoints(point, (newDir + 4) % 8);
      ordering[oldIdx] = reversePoint(firstPoint);
      directions[oldIdx] = -1;
      return secondPoint;
      // return second half of split with new direction
    };

    const findNextPoint = (lastPoint, direction) => {
      // want to check adjs in order (clockwise) starting at direction (what direction the last point was found at)
      for (let i = direction; i <= direction + 6; i++) {
        let dir = i % 8;
        // point we want
        let dirPoint = adjs[dir](lastPoint);

        // found next point Theorem 1.2
        if (arr[dirPoint[0]][dirPoint[1]] === 1) {
          // our new direction is the direction we came from then up one
          // which is the opposite of current current then up one, which is where this comes from
          let newDir = (dir + 5) % 8;
          // recursive call
          return [dirPoint, newDir];
        }
      }
      // found point with no adjs to black squares other than the one we came from
      return handleTail();
      // return false;
    };
    // could also only have one call to this if I assing start to new
    let [newPoint, newDir] = findNextPoint(startPoint, direction);
    // need to swap order to switch form array of rows to x,y canvas corod
    let ordering = [[newPoint[1], newPoint[0]]];
    let directions = [newDir];
    while (true) {
      [newPoint, newDir] = findNextPoint(newPoint, newDir);
      let realPoint = newPoint;
      // check if it has already been in the ordering
      ordering.every((point, idx) => {
        if (point[0] === newPoint[1] && point[1] === newPoint[0]) {
          realPoint = handleRepeatedPoint(newPoint, newDir, idx);
          return false;
        } else {
          return true;
        }
      });

      directions.push(newDir);
      ordering.push([realPoint[1], realPoint[0]]);
      if (newPoint[0] === startPoint[0] && newPoint[1] === startPoint[1]) {
        break;
      }
      if (newPoint[0] === 144 && newPoint[1] === 221) {
        return ordering;
      }
    }
    return ordering;
  };

  // TODO delete
  // dumb thing because the data is weird
  arr[0][2] = 0;
  arr[0][3] = 0;
  const startPoint = findStartPoint();
  // the point you just came from is on the left, so you're moving right
  // so the first point to check is upper left which is at idx 5
  // these points in y,x
  // also in clockwise order
  const ordering = findPoints(startPoint, 5);
  return ordering;

  // console.log(findNextPoint(startPoint, 5));
};

// old
// point is x,y corodinate
// is black is true if looking for black adjs, false if white
const findColorAdj = (point, isBlack) => {
  // // goes through each point
  // for (let x = -1; x <= 1; x++) {
  //   for (let y = -1; y <= 1; y++) {
  //     // self
  //     if (x === 0 && y == 0) {
  //       continue;
  //     }
  //     // adjacent white point
  //     if (arr[point[0] + x][point[1] + y] === (isBlack ? 1 : 0)) {
  //       true;
  //     }
  //   }
  // }
  // no correct adjs found
  return false;
};

module.exports = { outliner };
