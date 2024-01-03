import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import * as THREE from 'three';

import {OrbitControls} from '../jsm/controls/OrbitControls.js';

import {Back} from './Back.js'
import {cm1, cm2} from './common.js';
import {Floor} from './Floor.js';
import {Player} from './Player.js';

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

cm1.scene.background = new THREE.Color(cm2.backgroundColor);

const camera = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = -10;
camera.position.y = 3;
camera.position.z = -25;

cm1.scene.add(camera);

const light = new THREE.AmbientLight('white', 2);
cm1.scene.add(light);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

cm1.world.gravity.set(0, -10, 0);

const defaultContactMaterial = new CANNON.ContactMaterial(
    cm1.defaultMaterial, cm1.defaultMaterial,
    {friction: 0.3, restitution: 0.2});
const playerGlassContactMaterial = new CANNON.ContactMaterial(
    cm1.defaultMaterial, cm1.defaultMaterial, {friction: 1, restitution: 0});
cm1.world.defaultContactMaterial = defaultContactMaterial;
cm1.world.addContactMaterial(playerGlassContactMaterial);

const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0);
cannonWorld.broadphase = new CANNON.SAPBroadphase(cannonWorld);

const floor = new Floor({name: 'floor'});

let meshs = [];

const back = new Back({
  name: 'background',
  x: 0,
  y: 1,
  z: 0,
  rotationX: -Math.PI/2,
  cannonMaterial: cm1.defaultMaterial,
  mass: 30
});
meshs.push(back);

const player = new Player({
  name: 'player',
  x: 0,
  y: 1,
  z: 30,
  rotationY: Math.PI,
  cannonMaterial: cm1.playerMaterial,
  mass: 30
});
meshs.push(player);

const clock = new THREE.Clock();

function draw() {
  const delta = clock.getDelta();

  player.walk();

  let cannonStepTime = 1 / 60;
  if (delta < 0.01) cannonStepTime = 1 / 120;

  cannonWorld.step(cannonStepTime, delta, 3);

  meshs.forEach(item => {
    if (item.cannonBody) {
      item.modelMesh.position.copy(item.cannonBody.position);
      item.modelMesh.quaternion.copy(item.cannonBody.quaternion);
    }
  });

  renderer.render(cm1.scene, camera);
  renderer.setAnimationLoop(draw);
}

function setSize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(cm1.scene, camera);
};

window.addEventListener('resize', setSize);

draw();