import * as THREE from 'three';
// eslint-disable-next-line import/no-unresolved
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import fragment from '../shaders/fragment.glsl';
import vertex from '../shaders/vertex.glsl';

const device = {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
};

export default class Three {
  constructor(canvas) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75,
      device.width / device.height,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 2);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true; // default is false
    this.controls.dampingFactor = 0.025; // This value could be adjusted to your liking
    this.controls.minPolarAngle = 0; // radians
    this.controls.maxPolarAngle = Math.PI / 2; // radians

    this.clock = new THREE.Clock();
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.setLights();
    this.setGeometry();
    this.render();
    this.setResize();
    this.raycasterListener();
  }

  setLights() {
    this.ambientLight = new THREE.AmbientLight(new THREE.Color(1, 1, 1, 1));
    this.scene.add(this.ambientLight);
  }

  setGeometry() {
    this.sphereGeometry = new THREE.SphereGeometry(1, 128, 128);
    this.sphereMaterial = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      wireframe: true,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: { type: 'f', value: 0 }
      }
    });
    this.sphereMesh = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
    this.scene.add(this.sphereMesh);

    this.planeGeometry = new THREE.PlaneGeometry(10000, 10000);
    this.planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.planeMesh = new THREE.Mesh(this.planeGeometry, this.planeMaterial);
    this.planeMesh.position.y = -1; // Set the plane at the bottom of the scene
    this.planeMesh.rotation.x = -Math.PI / 2; // Rotate the plane to be horizontal
    this.scene.add(this.planeMesh);
  }

  render() {
    const elapsedTime = this.clock.getElapsedTime();

    // this.boxMesh.rotation.x = 0.2 * elapsedTime;
    // this.boxMesh.rotation.y = 0.1 * elapsedTime;

    this.controls.update();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.render.bind(this));
  }

  raycasterListener() {
    window.addEventListener('click', this.onMouseClick.bind(this), false);
  }

  onMouseClick(event) {
    event.preventDefault();

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects([this.sphereMesh]);

    if (intersects.length > 0) {
      const markerGeometry = new THREE.SphereGeometry(0.05, 32, 32);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);

      marker.position.copy(intersects[0].point);
      this.scene.add(marker);
    }
  }

  setResize() {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    device.width = window.innerWidth;
    device.height = window.innerHeight;

    this.camera.aspect = device.width / device.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(device.width, device.height);
    this.renderer.setPixelRatio(Math.min(device.pixelRatio, 2));
  }
}
