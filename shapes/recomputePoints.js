const { get2dDistance } = require("../util/util");

const computeTotalDistance = (ordering) => {
  const tmpLength = ordering.reduce((acc, curr, idx) => {
    if (idx === ordering.length - 1) {
      return acc;
    }
    return acc + get2dDistance(curr, ordering[idx + 1]);
  }, 0);

  return tmpLength + get2dDistance(ordering[ordering.length - 1], ordering[0]);
};

const recomputePoints = (ordering, newNumPoints) => {
  // first need to compute the distance
  const totalDistance = computeTotalDistance(ordering);

  // first point will always be there, not included in the amount of points you want along the distance
  // think about it like we need to put length - 1 points along the distance
  const disPerPoint = totalDistance / newNumPoints;

  const makeNewPoints = (a, b, extra) => {
    let arr = [];
    let [ax, ay] = a;
    let [bx, by] = b;
    let segDis = get2dDistance(a, b);

    let t;
    let newX;
    let newY;

    if (extra === 0) {
      console.log("HERE - SHOULDNt HAPPEN IN recompute");
      // do nothing or else adding extra points
    } else if (extra === -1) {
      // do nothing
    } else {
      t = extra / segDis;

      newX = ax + t * (bx - ax);
      newY = ay + t * (by - ay);
      arr.push([newX, newY]);

      ax = newX;
      ay = newY;
    }

    segDis = get2dDistance([ax, ay], b);

    t = disPerPoint / segDis;

    let remainingDis = segDis;

    while (remainingDis >= disPerPoint) {
      newX = ax + t * (bx - ax);
      newY = ay + t * (by - ay);
      arr.push([ax, ay]);
      ax = newX;
      ay = newY;
      remainingDis -= disPerPoint;
    }

    return [arr, disPerPoint - remainingDis];
  };

  let { arr: newPoints, extra: extra } = ordering.reduce(
    (acc, curr, idx) => {
      if (idx === 0) {
        acc.arr.push(curr);
        acc.extra = -1;
        return acc;
      }

      let [newArr, newExtra] = makeNewPoints(
        ordering[idx - 1],
        curr,
        acc.extra
      );
      acc.arr.push(...newArr);
      acc.extra = newExtra;
      return acc;
    },
    { arr: [], extra: 0 }
  );

  // do for last to first
  let [newArr, error] = makeNewPoints(
    ordering[ordering.length - 1],
    ordering[0],
    extra
  );

  newPoints.push(...newArr);

  if (newPoints.length === newNumPoints) {
    console.log(error);
    return newPoints;
  } else if (newPoints.length === newNumPoints + 1) {
    console.log("more than there should be");
    console.log(error);
    newPoints.pop();
    return newPoints;
  } else {
    console.error("weird number of points");
  }
};

module.exports = { recomputePoints };
