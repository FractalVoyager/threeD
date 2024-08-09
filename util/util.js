// true util fcns
// non-negative mod
function mod(n, m) {
  return ((n % m) + m) % m;
}
const get2dDistance = (a, b) => {
  let xdis = a[0] - b[0];
  let ydis = a[1] - b[1];
  return Math.sqrt(xdis * xdis + ydis * ydis);
};

module.exports = { mod, get2dDistance };
