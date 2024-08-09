// file that contains two fcns
// these fcns are used when we have the lines drawn between two cross sectins

// if there are all squares or tris, this one works.
// that should always be true if the lines are made in order, never going back in the order
const squaresToTris = (graph) => {
  // probably can add the traingles as we go
  let misses = false;

  let additional = 0;

  Object.entries(graph.adjacencyList).forEach((obj) => {
    // step 1
    let adjs = obj[1];
    let vertex = JSON.parse(obj[0]);
    let vertexKey = obj[0];
    // step 2
    let secondLevelAdjs = new Set();
    adjs.forEach((firstLevelAdj) => {
      graph.getAdjs(firstLevelAdj).forEach((secondLevelAdj) => {
        secondLevelAdjs.add(JSON.stringify(secondLevelAdj));
      });
    });
    secondLevelAdjs.delete(vertexKey);

    // find all the original adjs that are not in the second level adjs
    // if an element is in here, this means there is not a three cycle from vertex
    // that includes this adj, i.e. needs a triangle
    let difference = [];
    adjs.forEach((firstLevelAdj) => {
      if (!secondLevelAdjs.has(JSON.stringify(firstLevelAdj))) {
        // in the difference
        difference.push(firstLevelAdj);
      }
    });

    // step 3
    if (difference.length === 0) {
      // console.log("all triangles for ", vertex);
      return;
    }
    misses = true;

    difference.forEach((strandedPoint) => {
      // only want to draw lines between top plane and bottom plane
      // every vertex here must have an adj that is adj to one of the initial adjs BIG CLAIM - thought through it a lot but a proof would be nice and tested below, test passed
      // this means all squares or tris
      let strandedAjs = graph.getAdjs(strandedPoint);

      // remove original point
      strandedAjs = strandedAjs.filter(
        (adj) => JSON.stringify(adj) !== vertexKey
      );

      let connectors = [];

      strandedAjs.forEach((strandedAdj) => {
        if (
          secondLevelAdjs.has(JSON.stringify(strandedAdj)) &&
          // dont see why I need this anymore but seems like I do
          strandedAdj[2] !== vertex[2]
        ) {
          connectors.push(strandedAdj);
        }
      });

      // now have a connector vertex

      // if (connectors.length > 2) {
      //   console.log("more than one connector found");
      // }
      // if (connectors.length === 0) {
      //   console.log("no connectors foud");
      // }

      connectors.forEach((connector) => {
        // console.log(connector, vertex);
        graph.addEdge(connector, vertex);
      });

      // let adjsStr = adjs.map((adj) => JSON.stringify(adj));

      // // big claim test
      // let newPointIdx = -1;

      // strandedAjs.forEach((strandedAdj) => {
      //   let strandedAdjAdjs = graph.getAdjs(strandedAdj);
      //   strandedAdjAdjs.forEach((adj) => {
      //     let connectorIdx = adjsStr.indexOf(JSON.stringify(adj));
      //     if (connectorIdx !== -1) {
      //       // console.log("stranded adj connector", strandedAdj);
      //       if (newPointIdx !== -1) {
      //         // console.log("two connectors found");
      //       }
      //       newPointIdx = connectorIdx;

      //     }
      //   });
      //   if (newPointIdx === -1) {
      //     console.log("none found!!!");
      //   }
      // });

      // console.log(myin);
    });
  });
  // console.log("additonal", additional);

  console.log(misses);
};

// once the graph is all built up
// this creates traingles from all nodes by going through the stranded nodes. It works even if it is not all squares or tris (4-cyles or 3-cyles)
const triangulateSides = (graph) => {
  // probably can add the traingles as we go
  let misses = false;

  let additional = 0;

  Object.entries(graph.adjacencyList).forEach((obj) => {
    // step 1
    let adjs = obj[1];
    let vertex = JSON.parse(obj[0]);
    let vertexKey = obj[0];
    // step 2
    let secondLevelAdjs = new Set();
    adjs.forEach((firstLevelAdj) => {
      graph.getAdjs(firstLevelAdj).forEach((secondLevelAdj) => {
        secondLevelAdjs.add(JSON.stringify(secondLevelAdj));
      });
    });
    secondLevelAdjs.delete(vertexKey);

    // find all the original adjs that are not in the second level adjs
    // if an element is in here, this means there is not a three cycle from vertex
    // that includes this adj, i.e. needs a triangle
    let difference = [];
    adjs.forEach((firstLevelAdj) => {
      if (!secondLevelAdjs.has(JSON.stringify(firstLevelAdj))) {
        // in the difference
        difference.push(firstLevelAdj);
      }
    });

    // step 3
    if (difference.length > 0) {
      misses = true;
    }
    difference.forEach((strandedPoint) => {
      // only want to draw lines between top plane and bottom plane
      // every vertex here must have an adj that is adj to one of the initial adjs BIG CLAIM - thought through it a lot but a proof would be nice and tested below, test passed
      let strandedAjs = graph.getAdjs(strandedPoint);

      // remove original point
      strandedAjs = strandedAjs.filter(
        (adj) => JSON.stringify(adj) !== vertexKey
      );
      //
      // find adj of stranded point that is in the oppiste plane as vertex and closet to vertex
      let closestAdj = null;
      let cloestDistance = null;
      strandedAjs.forEach((strandedAdj) => {
        // oppiste plane
        if (true) {
          // if (strandedAdj[2] !== strandedPoint[2]) {
          let dist = get2dDistance(strandedAdj, vertex);
          if (
            cloestDistance === null ||
            get2dDistance(strandedAdj, vertex) < cloestDistance
          ) {
            closestAdj = strandedAdj;
            cloestDistance = dist;
          }
        }
      });
      if (closestAdj[2] === strandedPoint[2]) {
        // console.log("HOLE AT ", strandedPoint);
      } else {
        // connect to the vertex
        additional++;
        graph.addEdge(closestAdj, vertex);
      }
    });
  });

  console.log("additonal", additional);

  console.log(misses);
};

module.exports = { squaresToTris, triangulateSides };
