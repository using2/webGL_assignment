import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import { Quaternion as CannonQuaternion } from 'https://cdn.skypack.dev/cannon-es';
import * as THREE from 'three';

import {Back} from './Back.js'
import {cm1, cm2, cm3} from './common.js';
import {Floor} from './Floor.js';
import {Player} from './Player.js';

const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const urlParams = new URL(window.location.href).searchParams;

const username = urlParams.get('username');
const room = urlParams.get('room');

var socket = cm3.socket;

socket.emit('joinRoom', {username, room, position: {x:0,y:1,z:30}});

socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});

const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({canvas, antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

cm1.scene.background = new THREE.Color(cm2.backgroundColor);

const camera1 = new THREE.PerspectiveCamera(
    75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera1.position.x = -8;
camera1.position.y = 15;
camera1.position.z = -23;

// const camera2 = new THREE.PerspectiveCamera(
//   75, window.innerWidth / window.innerHeight, 0.1, 1000);

cm1.scene.add(camera1);
// cm1.scene.add(camera2);

const light = new THREE.AmbientLight('white', 2);
cm1.scene.add(light);

const shadowLight = new THREE.DirectionalLight('white', 2);
shadowLight.position.set(0, 100, 0);
shadowLight.target.position.set(0, 0, 0);
        
cm1.scene.add(shadowLight);
cm1.scene.add(shadowLight.target);

shadowLight.castShadow = true;
shadowLight.shadow.mapSize.width = 100;
shadowLight.shadow.mapSize.height = 100;
shadowLight.shadow.camera.top = shadowLight.shadow.camera.right = 700;
shadowLight.shadow.camera.bottom = shadowLight.shadow.camera.left = -700;
shadowLight.shadow.camera.near = 100;
shadowLight.shadow.camera.far = 900;
shadowLight.shadow.radius = 5;

cm1.world.gravity.set(0, -10, 0);

const defaultContactMaterial = new CANNON.ContactMaterial(
    cm1.defaultMaterial, cm1.defaultMaterial,
    {friction: 0.3, restitution: 0});
const playerContactMaterial = new CANNON.ContactMaterial(
    cm1.playerMaterial, cm1.playerMaterial,
    {friction: 0.5, restitution: 0});
const defaultPlayerContactMaterial = new CANNON.ContactMaterial(
  cm1.defaultMaterial, cm1.playerMaterial,
  {friction: 0, restitution: 0});
cm1.world.defaultContactMaterial = defaultContactMaterial;
cm1.world.addContactMaterial(playerContactMaterial);
cm1.world.addContactMaterial(defaultPlayerContactMaterial);

let meshs = [];

const floor = new Floor({
  name: 'floor'
});
meshs.push(floor);

const back = new Back({
  name: 'background',
  x: 0,
  y: 1,
  z: 0,
  rotationX: -Math.PI/2,
  cannonMaterial: cm1.defaultMaterial,
  mass: 0
});
meshs.push(back);

const player = new Player({
  name: `${username}`,
  x: 0,
  y: 1,
  z: 30,
  rotationY: Math.PI,
  cannonMaterial: cm1.playerMaterial,
  mass: 30
});
meshs.push(player);

socket.on('message', message => {
  console.log(message);
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

socket.on('oldCharacter', users => {
  users.map(user => {
    if(username != user.username){
      let other = new Player({
        name: `${user.username}`,
        x: user.x,
        y: user.y,
        z: user.z,
        rotationY: user.angle,
        cannonMaterial: cm1.playerMaterial,
        mass: 30
      });
      if(other.actions){
        other.actions[user.action].play();
      }
      meshs.push(other);
    }
  });
});

socket.on('newCharacter', position => {
  const other = new Player({
    name: `${position.name}`,
    x: position.x,
    y: position.y,
    z: position.z,
    rotationY: Math.PI,
    cannonMaterial: cm1.playerMaterial,
    mass: 30
  });
  if(other.actions){
    other.actions[position.action].play();
  }
  meshs.push(other);
});

socket.on('otherPosition', (position, action) =>{
  meshs.forEach(e => {
    if(e.name == position.name){  
      if(position.action !== action){
        e.actions[position.action].fadeOut(0.5);
        e.actions[action].reset().fadeIn(0.5).play();
        const newInfo = {
          username: position.name,
          action
        }
        socket.emit('newAnimation', newInfo);
      } 

      if(e.cannonBody){
        e.cannonBody.position.set(position.x, position.y, position.z);

        let quaternion = new CannonQuaternion();
        quaternion.setFromEuler(0, position.angle, 0, 'XYZ');
        e.cannonBody.quaternion.copy(quaternion);
        const newInfo = {
          username: position.name,
          angle: position.angle
        }
        socket.emit('newAngle', newInfo);
      }
    }
  });
});

socket.on('eraseCharacter', username => {
  meshs.forEach(e => {
    if(e.name == username){
      if (e.cannonBody) {
        cm1.world.removeBody(e.cannonBody);
      }
      var selectedObject = cm1.scene.getObjectByName(e.mesh.name);
      cm1.scene.remove(selectedObject);
      cm1.scene.remove(e.modelMesh);
      meshs = meshs.filter((element) => element.name !== username);
      draw();
    }
  })
});

const raycaster = new THREE.Raycaster();
const raycastDirection = new THREE.Vector3(0, 0, -1);

function updateCameraPosition() {
  const playerPosition = player.cannonBody.position;
  const rotation = Math.PI + player.angle;

  if(rotation < 1.57){
    camera1.position.x = playerPosition.x + 3.5;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z + 3.5;
  } else if(rotation < 2.35){
    camera1.position.x = playerPosition.x + 5;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z;
  } else if(rotation < 3.14){
    camera1.position.x = playerPosition.x + 3.5;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z - 3.5;
  } else if(rotation < 3.92){
    camera1.position.x = playerPosition.x;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z - 5;
  } else if(rotation < 4.17){
    camera1.position.x = playerPosition.x - 3.5;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z - 3.5;
  } else if(rotation < 5.49){
    camera1.position.x = playerPosition.x - 5;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z;
  } else if(rotation < 6.28){
    camera1.position.x = playerPosition.x - 3.5;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z + 3.5;
  } else {
    camera1.position.x = playerPosition.x;
    camera1.position.y = playerPosition.y + 3.3;
    camera1.position.z = playerPosition.z + 5;
  }

  const lookAtVector = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
  camera1.lookAt(lookAtVector);

  // camera2.position.x = playerPosition.x;
  // camera2.position.y = playerPosition.y + 0.6; 
  // camera2.position.z = playerPosition.z;

  camera1.rotation.set(0, rotation, 0);
  // camera2.rotation.set(0, rotation, 0);
}

const clock = new THREE.Clock();

function draw() {
  const delta = clock.getDelta();

  if (player.cannonBody) {
    updateCameraPosition();
  }

  // raycaster.setFromCamera(new THREE.Vector2(0, 0), camera2);
  // raycaster.ray.direction.copy(raycastDirection);

  // raycaster.far = 1;

  // const intersects = raycaster.intersectObjects(cm1.scene.children);

  player.walk();

  let cannonStepTime = 1 / 60;
  if (delta < 0.01) cannonStepTime = 1 / 120;

  cm1.world.step(cannonStepTime, delta, 3);

  meshs.forEach(item => {
    if (item.cannonBody) {
      item.mesh.position.copy(item.cannonBody.position);
      item.mesh.quaternion.copy(item.cannonBody.quaternion);
      
      if(item.modelMesh){
        item.modelMesh.position.copy(item.cannonBody.position);
        item.modelMesh.quaternion.copy(item.cannonBody.quaternion);
      }
    }
    if(item.mixer){
      item.mixer.update(delta);
    }
  });

  renderer.render(cm1.scene, camera1);
  renderer.setAnimationLoop(draw);
}

function setSize() {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(cm1.scene, camera1);
};

function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
    <p class="meta">${message.name} : ${message.x}</p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomName(room) {
  roomName.innerText = room;
}

function outputUsers(users) {
  userList.innerHTML = `
     ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}

window.addEventListener('resize', setSize);

draw();