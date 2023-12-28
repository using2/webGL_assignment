import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

import {KeyController} from './KeyController';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = -8;
camera.position.y = 2;
camera.position.x = 1;

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const light = new THREE.AmbientLight('white', 2);
scene.add(light);

const directionalLight = new THREE.DirectionalLight('white', 1.5);
directionalLight.position.x = -2;
directionalLight.position.z = 3;
directionalLight.castShadow = true;
scene.add(directionalLight);

const controls = new PointerLockControls(camera, renderer.domElement);
controls.domElement.addEventListener('click', () => {
  controls.lock();
});
controls.domElement.addEventListener('lock', () => {
  console.log('lock!');
});
controls.domElement.addEventListener('unlock', () => {
  console.log('unlock!');
});

const keyController = new KeyController();

function walk() {
  if (keyController.keys['KeyW'] || keyController.keys['ArrowUp']) {
    controls.moveForward(0.08);
  }
  if (keyController.keys['KeyS'] || keyController.keys['ArrowDown']) {
    controls.moveForward(-0.08);
  }
  if (keyController.keys['KeyA'] || keyController.keys['ArrowLeft']) {
    controls.moveRight(-0.08);
  }
  if (keyController.keys['KeyD'] || keyController.keys['ArrowRight']) {
    controls.moveRight(0.08);
  }
}

const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0);
cannonWorld.broadphase = new CANNON.SAPBroadphase(cannonWorld);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body(
    {mass: 10, position: new CANNON.Vec3(0, 0, 0), shape: floorShape});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);
cannonWorld.addBody(floorBody);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({color: 'white'}));
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 0);
scene.add(floor);

let meshs = [];

const loader = new GLTFLoader();
loader.load('./models/subway_interior.glb', (glb) => {
  const background = glb.scene.children[0];
  background.position.x = -10;
  background.position.y = 1;
  background.position.z = 0;
  scene.add(background);

  const subwayShape = new CANNON.Box(new CANNON.Vec3(
      background.width / 2, background.height / 2, background.depth / 2));
  const subwayBody = new CANNON.Body({
    mass: 8,
    position: new CANNON.Vec3(
        background.position.x, background.position.y, background.position.z),
    shape: subwayShape
  });
  subwayBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0);
  cannonWorld.addBody(subwayBody);

  meshs.push(background);
});

const clock = new THREE.Clock();

function draw() {
  const delta = clock.getDelta();

  walk();

  let cannonStepTime = 1 / 60;
  if (delta < 0.01) cannonStepTime = 1 / 120;

  cannonWorld.step(cannonStepTime, delta, 3);

  meshs.forEach(item => {
    if (item.cannonBody) {
      item.modelMesh.position.copy(item.cannonBody.position);
      item.modelMesh.quaternion.copy(item.cannonBody.quaternion);
    }
  });

  renderer.render(scene, camera);
  renderer.setAnimationLoop(draw);
}

function setSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
};

window.addEventListener('resize', setSize);

draw();
