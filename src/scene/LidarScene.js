/* global THREE */

import _ from 'lodash';
import { MATERIAL_500 } from './colors';

const vertexShader = `
  attribute float size;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

const USED_KEYS = [
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'w',
  'a',
  's',
  'd'
];

const CAMERA_SPEED = 20;
const ROTATION_SPEED = Math.PI / 2;
const SCROLL_SPEED = 0.1;
const POINT_SCALE = 100;

const CLASS_COLORS = {
  1: MATERIAL_500.GREY, // Unclassified
  2: MATERIAL_500.BROWN, // Bare earth
  7: MATERIAL_500.GREY, // Low noise
  9: MATERIAL_500.LIGHT_BLUE, // Water
  10: MATERIAL_500.BROWN, // Ignored ground
  11: MATERIAL_500.GREY, // Withheld,
  17: MATERIAL_500.BLUE_GREY, // Bridge decks
  18: MATERIAL_500.ORANGE // High noise
};

const colorToRGB = (hex) => {
  const red = ((hex & 0xff0000) >> 16) / 256;
  const green = ((hex & 0x00ff00) >> 8) / 256;
  const blue = (hex & 0x0000ff) / 256;
  return [red, green, blue];
}

window.fragmentShader = fragmentShader;

class LidarScene {

  constructor() {
    this._scene = new THREE.Scene();
    this._renderer = new THREE.WebGLRenderer();
    this._keydown = {};
  }

  addPointsFromData(data) {
    const N = data.length;
    const vertices = [];
    const colors = [];
    const sizes = [];

    data.forEach(p => {
      const color = CLASS_COLORS[p[4]] || MATERIAL_500.YELLOW;
      const [red, green, blue] = colorToRGB(color);
      colors.push(red, green, blue);
      vertices.push(p[0] / POINT_SCALE, p[1] / POINT_SCALE, p[2] / POINT_SCALE);
      sizes.push(0.2);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.addAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

    const shaderMaterial = new THREE.ShaderMaterial( {
      vertexShader:   vertexShader,
      fragmentShader: fragmentShader,
      blending:       THREE.AdditiveBlending,
      depthTest:      false,
      transparent:    true,
      vertexColors:   true
    });
    const mesh = new THREE.Points(geometry, shaderMaterial);
    this._scene.add(mesh);
    console.log(`Loaded ${N} points.`);
  }

  initialize(el) {
    const { width, height } = el.getBoundingClientRect();
    this._camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

    this._camera.rotation.order = 'ZXY';
    this._camera.rotation.x = Math.PI/2;
    this._camera.position.z = 10;

    this._renderer.setSize(width, height);
    el.appendChild(this._renderer.domElement);

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('wheel', this.handleWheel);
    window.addEventListener('visibilitychange', this.handleVisibilityChange);

    this.render();
  }

  handleVisibilityChange = (e) => {
    // Don't store keypress state if we tab away
    this._keydown = {};
  }

  handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this._camera.position.z += e.deltaY * SCROLL_SPEED;
  }

  handleKeyDown = (e) => {
    if (USED_KEYS.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      this._keydown[e.key] = true;
    }
  }

  handleKeyUp = (e) => {
    if (USED_KEYS.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
      this._keydown[e.key] = false;
    }
  }

  updateCamera(dt) {
    const UP = new THREE.Vector3(0, 0, 1);
    const FORWARD = new THREE.Vector3(0, CAMERA_SPEED * dt, 0);
    const LEFT = new THREE.Vector3(CAMERA_SPEED * dt, 0, 0);

    FORWARD.applyAxisAngle(UP, this._camera.rotation.z);
    LEFT.applyAxisAngle(UP, this._camera.rotation.z);

    if (this._keydown['ArrowLeft']) {
      this._camera.rotation.z = (this._camera.rotation.z + ROTATION_SPEED * dt) % (2 * Math.PI);
    }
    if (this._keydown['ArrowRight']) {
      this._camera.rotation.z = (this._camera.rotation.z - ROTATION_SPEED * dt) % (2 * Math.PI);
    }
    if (this._keydown['ArrowUp']) {
      this._camera.rotation.x = _.min([this._camera.rotation.x + ROTATION_SPEED * dt, Math.PI / 2]);
    }
    if (this._keydown['ArrowDown']) {
      this._camera.rotation.x = _.max([this._camera.rotation.x - ROTATION_SPEED * dt, 0]);
    }
    if (this._keydown['w']) {
      this._camera.position.add(FORWARD);
    }
    if (this._keydown['s']) {
      this._camera.position.sub(FORWARD);
    }
    if (this._keydown['a']) {
      this._camera.position.sub(LEFT);
    }
    if (this._keydown['d']) {
      this._camera.position.add(LEFT);
    }
  }

  update(dt) {
    this.updateCamera(dt);
  }

  render(previousTimestamp = null) {
    const currentTimestamp = (new Date()).getTime();
    const dt = previousTimestamp ? (currentTimestamp - previousTimestamp) / 1000 : 0.016;
    this.update(dt);
    this._renderer.render(this._scene, this._camera);
    requestAnimationFrame(this.render.bind(this, currentTimestamp));
  }
}

export default LidarScene;
