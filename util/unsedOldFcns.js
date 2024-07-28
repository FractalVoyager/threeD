const edgeFinder = (arr) => {
  // arr is 2d array of 1s and 0s for if it is black or not
  console.log(arr.length);
  let length = Math.sqrt(arr.length);
  // vals will be [x,y] points in -.5*length to .5*length x y plane that are on the edge of black
  let vals = [];
  for (let i = 0; i < arr.length; i++) {
    // white
    if (arr[i] === 0) {
      continue;
    }
    if (!isEdge(i, length, arr)) {
      continue;
    }

    // now we have an edge
    vals.push(convertIdxToCord(i, length));
  }
  return vals;
};

const isEdge = (idx, length, arr) => {
  // find point in terms of 2d
  let down = Math.floor(idx / length);
  let across = idx % length;

  // if it is on the edge of the plane at all, it is an edge
  if (
    down === 0 ||
    across === 0 ||
    across === length - 1 ||
    down === length - 1
  ) {
    return true;
  }
  // now it is not on the edge of the plane
  // need to find niebors
  let leftNei = arr[idx - 1];
  let rightNei = arr[idx + 1];
  let upNei = arr[idx - length];
  let downNei = arr[idx + length];
  if (leftNei === 0 || rightNei === 0 || upNei === 0 || downNei === 0) {
    return true;
  } else {
    return false;
  }
};
