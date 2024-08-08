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
