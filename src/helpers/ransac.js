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

const pointToLineDistances = (pointList, point1, point2) => {
  const [x1, y1, z1] = point1;
  const [x2, y2, z2] = point2;
  const a = (y2 - y1);
  const b = (x2 - x1);
  const c = (x2*y1 - y2*x1);
  const denominator = Math.sqrt(Math.pow(y2 - y1, 2), Math.pow(x2 - x1, 2));
  return pointList.map(([x, y, z]) => (Math.abs(a*x - b*y + c) / denominator));
}

const ransacIteration = (pointCloud, epsilon) => {
  // Pick two random points
  const [p1, p2] = randomSample(pointCloud, 2);

  // Draw a line between the two
  const distances = pointToLineDistances(pointCloud, p1, p2);

  // Determine how many inliers and how many outliers
  let inliers = [];
  pointCloud.forEach((point, idx) => {
    if (distances[idx] <= epsilon) {
      inliers.push(point);
    }
  });
  return inliers;
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
    outliers: outliers
  }
}

const makePlanarDistanceFunction = (p1, p2, p3) => {
  const v1 = p1.clone();
  const v2 = p2.clone();
  v1.sub(p3);
  v2.sub(p3);
  const cross = v1.cross(v2);

  const a = cross.x;
  const b = cross.y;
  const c = cross.z;
  const d = -cross.dot(p1);

  const dem = Math.sqrt(cross.dot(cross));
  return p0 => ((cross.dot(p0) + d) / dem);
}
