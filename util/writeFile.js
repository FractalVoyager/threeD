const fs = require("fs");

const writeFile = (formattedData, fileName) => {
  try {
    fs.writeFile(fileName, formattedData, (err) => {
      if (err) throw err;
      console.log("The file has been saved!");
    });
  } catch (error) {
    console.error("Error reading or processing the file:", error);
  }
};

// is three D means each point has three vals
// false means two D so each point has two vals
// for wolfram alphaInput
const arrayofPointsToTxt = (arr, isThreeD) => {
  return arr
    .map((pair) => `${pair[0]}, ${pair[1]}${isThreeD ? `, ${pair[2]}` : ""}`)
    .join("\n");
};

const arrayOfPointsToJSON = (arr, name) => {
  const jsonString = JSON.stringify(arr);
  return `const ${name} = ` + jsonString;
};

module.exports = { writeFile, arrayofPointsToTxt, arrayOfPointsToJSON };
