# Plan

## Backlog:

Outline: (o)

- o2: make it work for tails that split into two more tails (repeating points - need to check for)
- o3: make it work for tails that circle back to the shape (holes - write hole detection fcn)
- o4: make it work for multiple shapes and single points (think we just want to get rid of these, keep the biggest shape)
- o5: get many more samples and handle all weird parts that haven't been addressed (final check)
- o6: make it so 2-turn tails in clockwise are recongized as 1-turn tails in counter clockwise if that is the case. See pics from 8/9/24 - should be handled with handling repeated points in o7

Triangulate 2d shape: (t)

- t0: fix the optimized ear clip triangulate
- t1: refactor to abstract some stuff out

3D Sides: (s)

- s0: bug fix the initial top down sometimes not only doing points after
- s2: throughly test to make sure it is all working as expected

FV stuff: (f)

- f0: fix binary file export to not add those two random points
- f1: write wasm to return array of black and white points so we can remove the step of converting colored array to black and white
- f2: make the binary file download a list of all of the given julia sets
- f3: allow line edits: turn into paroblic curve, set start point, set end point, make straight line, add or subtract points in even spacing

## DOING:

- o0: make the tail fcn work for longer straight tails
- o7: make it work for repeated points (in o0)
- o1: make the tail fcn work for tails that change direction (in o0)

## DONE:

- s3: clean up createSides file
- s1: try different strategy in top down to only go to one point in bottom plane (first in order) instead of all

# Notes

- foruth set is 400res pic with funky stuff

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

written elsewhere

don't forget about hole detection in the outliner

for tail handling, once you find a tail by reaching the end, make the new shape,

do the whole thing with if the tail changes directon, then once you get back to start, the direction change could have cause another perim to be missed, so call reg fcn on that point to find more stuff

so once tail changes direction, draw triangle. Call regular fcn on that new point, you don't need to know you are on a tail (i think)
