// console.log(arr);

const drawFromPoints = (points) => {
  // Get the canvas element and its context
  const canvas = document.getElementById("outline-can");
  const ctx = canvas.getContext("2d");

  // Function to draw points on the canvas
  const drawPoints = (arr) => {
    arr.forEach((point) => {
      const [x, y] = point;
      ctx.fillStyle = "black"; // Set the color for the point
      ctx.fillRect(x * 4, y * 4, 1, 1); // Draw a 1x1 pixel at the (x, y) coordinate
    });
  };

  // Draw the points array on the canvas
  drawPoints(points);
};

const drawLinesFromPoints = (points) => {
  console.log("here");
  const canvas = document.getElementById("outline-lines-can");
  const ctx = canvas.getContext("2d");

  for (let i = 0; i < points.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(points[i][0] * 4, points[i][1] * 4);
    ctx.lineTo(points[i + 1][0] * 4, points[i + 1][1] * 4);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(
    points[points.length - 1][0] * 4,
    points[points.length - 1][1] * 4
  );
  ctx.lineTo(points[0][0] * 4, points[0][1] * 4);
  ctx.closePath();
  ctx.stroke();
};
const drawFrom2dArr = (arr) => {
  // Get the canvas element and its context
  const canvas = document.getElementById("orig-can");
  const ctx = canvas.getContext("2d");

  // Function to draw 2D array of pixels on the canvas
  const drawPixels = (arr) => {
    const size = arr.length; // Assuming a square array

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const pixel = arr[y][x];
        ctx.fillStyle = pixel === 1 ? "black" : "white"; // Set the color based on pixel value
        ctx.fillRect(x, y, 1, 1); // Draw a 1x1 pixel at the (x, y) coordinate
      }
    }
  };

  // Draw the pixel array on the canvas
  drawPixels(arr);
};

const drawTrinagles = (tris) => {
  const canvas = document.getElementById("tris-can");
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 1;

  const drawTrinagle = (tri) => {
    ctx.beginPath();
    ctx.moveTo(tri[0][0] * 4, tri[0][1] * 4);
    // line from first to second
    ctx.lineTo(tri[1][0] * 4, tri[1][1] * 4);
    // line from first to third
    ctx.lineTo(tri[2][0] * 4, tri[2][1] * 4);
    // line from third to first
    ctx.closePath();
    ctx.stroke();
  };

  tris.forEach((tri) => {
    drawTrinagle(tri);
  });
};

drawFrom2dArr(orig);
drawLinesFromPoints(outline);

drawFromPoints(outline);
drawTrinagles(triangles);
