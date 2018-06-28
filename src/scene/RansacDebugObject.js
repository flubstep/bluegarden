/* global THREE */

import _ from 'lodash';

import { MATERIAL_500 } from './colors';

import { randomSample, ransac3D, ransacIteration3D } from '../helpers/ransac';

const POINT_SAMPLE_SIZE = 10000;


export default class RansacDebugObject {

  constructor(pointCloud) {
    this.pointCloud = pointCloud;
    this.processedPoints = [];
    this.previousInliers = [];
    this._childMeshes = {};
    this.makeSampledPointCloud();
  }

  addToScene(scene) {
    this._scene = scene;
  }

  makeSampledPointCloud() {
    if (!POINT_SAMPLE_SIZE) {
      return;
    }
    if (this.pointCloud.length > POINT_SAMPLE_SIZE) {
      this.pointCloudSampled = randomSample(this.pointCloud, POINT_SAMPLE_SIZE);
    } else {
      this.pointCloudSampled = this.pointCloud;
    }
  }

  makePointsMesh(points, color, size) {
    const material = new THREE.PointsMaterial( { color, size } );
    const geometry = new THREE.Geometry();
    geometry.vertices = points;
    return new THREE.Points(geometry, material);
  }

  runRansac(epsilon = 15, iterations = 50) {
    const { plane, inliers, outliers } = ransac3D(this.pointCloud, epsilon, iterations);

    this.pointCloud = outliers;
    this.makeSampledPointCloud();
    this.processedPoints = _.concat(this.processedPoints, this.previousInliers);
    this.previousInliers = inliers;

    console.log('RANSAC plane points:', plane);
    console.log(`Inliers: ${inliers.length}`);

    this.updateMeshes({
      plane: this.makePointsMesh(plane, MATERIAL_500.DEEP_PURPLE, 200),
      inliers: this.makePointsMesh(inliers, MATERIAL_500.YELLOW, 30),
      processed: this.makePointsMesh(this.processedPoints, MATERIAL_500.BLUE, 30),
      outliers: this.makePointsMesh(outliers, MATERIAL_500.WHITE, 20)
    });

    this.showInliers();
  }

  runRansacIteractionAsync(epsilon, iterations, currentBest, callback) {

    if (iterations === 0) {
      return callback(null, currentBest);
    }

    const result = ransacIteration3D(this.pointCloud, epsilon, iterations);
    const { plane, inliers, score } = result;

    if (!currentBest || score > currentBest.score) {
      console.log(`Updating current best score: ${score}`);
      currentBest = result;
      this.updateMeshes({
        plane: this.makePointsMesh(plane, MATERIAL_500.DEEP_PURPLE, 200),
        inliers: this.makePointsMesh(inliers, MATERIAL_500.LIME, 30)
      });
    }
    setImmediate(() => {
      this.runRansacIteractionAsync(epsilon, iterations - 1, currentBest, callback);
    });
  }

  runRansacIteraction(epsilon, iterations) {
    return new Promise((resolve, reject) => {
      this.runRansacIteractionAsync(epsilon, iterations, null, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      });
    });
  }


  async runRansacLive(epsilon = 15, iterations = 400) {

    this.processedPoints = _.concat(this.processedPoints, this.previousInliers);
    this.updateMeshes({
      processed: this.makePointsMesh(this.processedPoints, MATERIAL_500.BLUE, 30)
    });

    const { plane, inliers, outliers } = await this.runRansacIteraction(epsilon, iterations)

    this.pointCloud = outliers;
    this.makeSampledPointCloud();

    this.previousInliers = inliers;

    this.updateMeshes({
      plane: this.makePointsMesh(plane, MATERIAL_500.DEEP_PURPLE, 200),
      inliers: this.makePointsMesh(inliers, MATERIAL_500.GREEN, 30),
      outliers: this.makePointsMesh(outliers, MATERIAL_500.WHITE, 20)
    });

    this.showInliers()

    return { plane, inliers, outliers };
  }

  showInliers() {
    ['plane', 'inliers', 'processed'].forEach(key => {
      if (this._childMeshes[key]) {
        this._childMeshes[key].visible = true;
      }
    });
    ['outliers'].forEach(key => {
      if (this._childMeshes[key]) {
        this._childMeshes[key].visible = false;
      }
    });
  }

  showOutliers() {
    ['plane', 'inliers', 'processed'].forEach(key => {
      if (this._childMeshes[key]) {
        this._childMeshes[key].visible = false;
      }
    });
    ['outliers'].forEach(key => {
      if (this._childMeshes[key]) {
        this._childMeshes[key].visible = true;
      }
    });
  }

  updateMeshes(newMeshes) {
    if (!this._scene) {
      return;
    }
    ['plane', 'inliers', 'outliers', 'processed'].forEach(key => {
      const newMesh = newMeshes[key];
      if (newMesh) {
        if (this._childMeshes[key]) {
          this._scene.remove(this._childMeshes[key]);
          delete this._childMeshes[key];
        }
        this._childMeshes[key] = newMesh;
        this._scene.add(newMesh);
      }
    });
  }

  update() {
    // TODO: anything?
  }
}
