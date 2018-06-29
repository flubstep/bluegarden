import _ from 'lodash';

const ccw = (p1, p2, p3) => (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);

const polarAngle = (p1, p2) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const theta = Math.atan(dy / dx);
    return (dx < 0) ? (theta + Math.PI) : theta;
}

const last1 = arr => arr[arr.length - 1];
const last2 = arr => arr[arr.length - 2];

export const grahamScan = (points) => {
    // find the extremal point based on the y coordinate
    const start = _.minBy(points, p => p.y);

    // sort by angle from the extremal point to all the other points
    const sortedPoints = _.sortBy(points, p => polarAngle(start, p));

    // starting from the start point, wrap the gift
    const solution = [start, sortedPoints.shift()];
    while (sortedPoints.length > 0) {
        const next = sortedPoints.shift();
        while (solution.length >= 2 && ccw(last2(solution), last1(solution), next) <= 0) {
            solution.pop();
        }
        solution.push(next);
    }
    return solution;
}
