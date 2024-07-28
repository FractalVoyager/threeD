// console.log(arr);

const drawFromPoints = (points) => {
  // Get the canvas element and its context
  const canvas = document.getElementById("can");
  const ctx = canvas.getContext("2d");

  // Function to draw points on the canvas
  const drawPoints = (arr) => {
    arr.forEach((point) => {
      const [x, y] = point;
      ctx.fillStyle = "black"; // Set the color for the point
      ctx.fillRect(y, x, 1, 1); // Draw a 1x1 pixel at the (x, y) coordinate
    });
  };

  // Draw the points array on the canvas
  drawPoints(points);
};

const drawFrom2dArr = (arr) => {
  // Get the canvas element and its context
  const canvas = document.getElementById("can");
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

// drawFrom2dArr(arr);
console.log(arr);
drawFromPoints(arr);
