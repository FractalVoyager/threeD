# written elsewhere

# don't forget about hole detection in the outliner

# for tail handling, once you find a tail by reaching the end, make the new shape,

# do the whole thing with if the tail changes directon, then once you get back to start, the direction change could have cause another perim to be missed, so call reg fcn on that point to find more stuff

# so once tail changes direction, draw triangle. Call regular fcn on that new point, you don't need to know you are on a tail (i think)

# Plan

Backlog:

Outline:

- o0: make the tail fcn work for longer straight tails
- o1: make the tail fcn work for tails that change direction
- o2: make it work for tails that split into two more tails (repeating points - need to check for)
- o3: make it work for tails that circle back to the shape (holes - write hole detection fcn)
- o4: make it work for multiple shapes and single points (think we just want to get rid of these, keep the biggest shape)
- o5: get many more samples and handle all weird parts that haven't been addressed (final check)
  3D Sides:
- s0: bug fix the initial top down sometimes not only doing points after
- s1: try different strategy in top down to only go to one point in bottom plane (first in order) instead of all
- s2: throughly test to make sure it is all working as expected
- s3: clean up createSides file

DOING:

- s3: clean up createSides file

DONE:

Notes from createSides.js
// go through points in smaller plane

// new strategy
// when we get to a vertex that has no adjacency to smaller plane, get connect to the vertex in smaller plane that comes after
// the last one here
// say a,b,c,d (ordered that way) in smaller plane is connected to y in larger
// larger plane ordering is y, z, x
// we get to z, see that has it has adjs to larger plane.
// then we see that y came before
// get all adjs of y = [a,b,c,d]
// see that d was added last (TODO check that this is really the one we want, it just needs to be last in the ordering (first vertex may be weird)) - i.e. d is the one we want, not c or any others, based on ordering in orig
// add to point after d in ordering DONE
// MAY also want to see how many points after z are also non adj to smaller plane, and split in half between the two
// THIS WAY SHOULD MAKE ALL SQAURES OR TRIS, then can do the old way of detecting sqaures are traingulating which makes more sense

// actually, just going to fully traingulate here
// when we get to y and find d...
// find point e (after ordering in smaller plane)
// TODO check - maybe hopoing that es first adj will be the next point in larger plane that doesn't have adj in ordering
// split points in larger plane in this zone between the two verticies to fully traingualte
// so say ordering is z,x,k,j,l and l is adjacent to e
// z goes to d to do that trinagle
// j goes to e to do that traingle
// x,k goes to d
// k goes to e
// maybe for split points (odd number) go by cloest distance
// could still end up with squares, handle with old fcn I came up with
