/* global THREE */

import _ from 'lodash';

import { MATERIAL_500 } from './colors';

import { ransacIteration3D, ransac3D } from '../helpers/ransac';

export default class RansacDebugObject {

  constructor(pointCloud) {
    this.pointCloud = pointCloud;
    this.processedPoints = [];
    this.previousInliers = [];
    this._childMeshes = {};
  }

  addToScene(scene) {
    this._scene = scene;
  }

  makePointsMesh(points, color, size) {
    const material = new THREE.PointsMaterial( { color, size } );
    const geometry = new THREE.Geometry();
    geometry.vertices = points;
    return new THREE.Points(geometry, material);
  }

  runOneIteration(epsilon = 15) {
    const { plane, inliers, outliers } = ransac3D(this.pointCloud, epsilon, 50);

    this.pointCloud = outliers;
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
      if (this._childMeshes[key]) {
        this._scene.remove(this._childMeshes[key]);
        delete this._childMeshes[key];
      }
      const newMesh = newMeshes[key];
      if (newMesh) {
        this._childMeshes[key] = newMesh;
        this._scene.add(newMesh);
      }
    });
  }

  update() {
    // TODO: anything?
  }
}
