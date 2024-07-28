// arr is array of points that all the black points
// length is width and height of gird (always square for now)
// could do this with array of points or twoD array of black and white values, going with two D array of black and white values
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

  const findPoints = (startPoint, direction) => {
    // could also only have one call to this if I assing start to new
    let [newPoint, newDir] = findNextPoint(startPoint, direction);
    let ordering = [newPoint];
    while (true) {
      [newPoint, newDir] = findNextPoint(newPoint, newDir);
      ordering.push(newPoint);
      if (newPoint[0] === startPoint[0] && newPoint[1] === startPoint[1]) {
        break;
      }
    }
    return ordering;
  };

  // stack overflow
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
    console.log("logging false");
    return false;
  };

  // TODO delete
  // dumb thing because the data is weird
  arr[0][2] = 0;
  arr[0][3] = 0;
  const startPoint = findStartPoint();
  // the point you just came from is on the left, so you're moving right
  // so the first point to check is upper left which is at idx 5
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
