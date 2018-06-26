import _ from 'lodash';

const randomSample = (collection, sampleSize) => {
  const N = collection.length;
  const seen = {};
  const sample = [];
  while (sample.length < sampleSize) {
    const index = Math.floor(Math.random() * N);
    if (!seen[index]) {
      seen[index] = true;
      sample.push(collection[index]);
    }
  }
  return sample;
}

export const ransac3D = (pointCloud, epsilon = 0.1, iterations = 500) => {
  const results = _.range(iterations).map(() => (
    ransacIteration3D(pointCloud, epsilon)
  ));
  return _.maxBy(results, (it => it.inliers.length));
}


export const ransacIteration3D = (pointCloud, epsilon = 0.1) => {
  // Pick three random points
  const [p1, p2, p3] = randomSample(pointCloud, 3);

  // Create the distance to plane function based on the three points
  const distanceToPlane = makePlanarDistanceFunction(p1, p2, p3);

  // Calculate and return inliers
  const [inliers, outliers] = _.partition(pointCloud, p => (Math.abs(distanceToPlane(p)) <= epsilon));
  return {
    plane: [p1, p2, p3],
    inliers: inliers,
    outliers: outliers,
    score: inliers.length
  }
}

const makePlanarDistanceFunction = (p1, p2, p3) => {
  const v1 = p1.clone();
  const v2 = p2.clone();
  v1.sub(p3);
  v2.sub(p3);
  const cross = v1.cross(v2);

  /* Just for reference, even though this is covered more efficiently below.
  const a = cross.x;
  const b = cross.y;
  const c = cross.z;
  */
  const d = -cross.dot(p1);

  const dem = Math.sqrt(cross.dot(cross));
  return p0 => ((cross.dot(p0) + d) / dem);
}
