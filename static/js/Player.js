import { AnimationMixer, Mesh, Vector3 } from 'three';
import { cm1, cm3 } from './common.js';
import { Stuff } from './Stuff.js';

export class Player extends Stuff {
  constructor(info) {
    super(info);

    this.width = 1;
    this.height = 1;
    this.depth = 1;

    cm1.gltfLoader.load(
      '../models/character.glb',
      (glb) => {
        glb.scene.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
          }
        });

        this.modelMesh = glb.scene.children[0];
        this.modelMesh.position.set(this.x, this.y, this.z);
        this.modelMesh.rotation.set(
          this.rotationX,
          this.rotationY,
          this.rotationZ
        );
        this.modelMesh.castShadow = true;
        this.modelMesh.scale.set(0.015, 0.015, 0.015);
        this.modelMesh.name = this.name;
        cm1.scene.add(this.modelMesh);

        this.modelMesh.animations = glb.animations;
        this.mixer = new AnimationMixer(this.modelMesh);
        this.actions = [];
        this.actions[0] = this.mixer.clipAction(this.modelMesh.animations[3]);
        this.actions[1] = this.mixer.clipAction(this.modelMesh.animations[4]);
        this.actions[2] = this.mixer.clipAction(this.modelMesh.animations[0]);
        this.actions[3] = this.mixer.clipAction(this.modelMesh.animations[1]);
        this.actions[4] = this.mixer.clipAction(this.modelMesh.animations[2]);

        this.actions[0].play();
        this.setCannonBody();
      }
    );

    this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.name = this.name;
    cm1.scene.add(this.mesh);

    this.angle = Math.PI;
  }

  keys = [];
  _currentAnimationAction = 0;

  //0: up: -z, down: +z, left: -x, right: +x
  //2: up: +x, down: -x, left: -z, right: +z
  //4: up: +z, down: -z, left: +x, right: -x
  //6: up: -x, down: +x, left: +z, right: -z
  //1, 3, 5, 7은 대각선 방향
  sign = 0;
  otherKeyOn = false;
  changeSign = false;
  diagonalDirection = 0;

  sendPosition() {
    const position = {
      username: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      angle: this.angle,
      newAction: this._currentAnimationAction
    };
    cm3.socket.emit('myPosition', position);
  }

  walk() {
    let previousAnimationAction = this._currentAnimationAction;

    if(this.changeSign){
      if(this.angle == Math.PI) this.sign = 0;
      else if(this.angle == Math.PI/2 + Math.PI/4) this.sign = 1;
      else if(this.angle == Math.PI/2) this.sign = 2;
      else if(this.angle == Math.PI/4) this.sign = 3;
      else if(this.angle == 0) this.sign = 4;
      else if(this.angle == -Math.PI/4) this.sign = 5;
      else if(this.angle == -Math.PI/2) this.sign = 6;
      else this.sign = 7;

      this.changeSign = false;
    }

    window.addEventListener('keydown', (e) => {
      if((e.code == 'ArrowDown' && !this.keys[e.code]) ||
      (e.code == 'ArrowLeft' && !this.keys[e.code]) ||
      (e.code == 'ArrowRight' && !this.keys[e.code])) {
        this.otherKeyOn = true;
      }

      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.changeSign = true;
      delete this.keys[e.code];
    });
    
    if (
      this.keys['ArrowUp'] ||
      this.keys['ArrowDown'] ||
      this.keys['ArrowLeft'] ||
      this.keys['ArrowRight']
    ) {
      let moveDirection = new Vector3();
      
      if (this.keys['ArrowUp']) {
        if(this.sign == 0){
          moveDirection.z = -1;
        } else if(this.sign == 1) {
          moveDirection.z = -1;
          moveDirection.x = +1;
        } else if(this.sign == 2) {
          moveDirection.x = +1;
        } else if(this.sign == 3) {
          moveDirection.z = +1;
          moveDirection.x = +1;
        } else if(this.sign == 4) {
          moveDirection.z = +1;
        } else if(this.sign == 5) {
          moveDirection.z = +1;
          moveDirection.x = -1;
        } else if(this.sign == 6) {
          moveDirection.x = -1;
        } else {
          moveDirection.z = -1;
          moveDirection.x = -1;
        }

        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowDown']) {
        if(this.sign == 0){
          moveDirection.z = +1;
        } else if(this.sign == 1) {
          moveDirection.z = +1;
          moveDirection.x = -1;
        } else if(this.sign == 2) {
          moveDirection.x = -1;
        } else if(this.sign == 3) {
          moveDirection.z = -1;
          moveDirection.x = -1;
        } else if(this.sign == 4) {
          moveDirection.z = -1;
        } else if(this.sign == 5) {
          moveDirection.z = -1;
          moveDirection.x = +1;
        } else if(this.sign == 6) {
          moveDirection.x = +1;
        } else {
          moveDirection.z = +1;
          moveDirection.x = +1;
        }

        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowLeft']) {
        if(this.sign == 0){
          moveDirection.x = -1;
        } else if(this.sign == 1) {
          moveDirection.z = -1;
        } else if(this.sign == 2) {
          moveDirection.z = -1;
        } else if(this.sign == 3) {
          moveDirection.x = +1;
        } else if(this.sign == 4) {
          moveDirection.x = +1;
        } else if(this.sign == 5) {
          moveDirection.z = +1;
        } else if(this.sign == 6) {
          moveDirection.z = +1;
        } else {
          moveDirection.x = -1;
        }

        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowRight']) {
        if(this.sign == 0){
          moveDirection.x = +1;
        } else if(this.sign == 1) {
          moveDirection.x = +1;
        } else if(this.sign == 2) {
          moveDirection.z = +1;
        } else if(this.sign == 3) {
          moveDirection.z = +1;
        } else if(this.sign == 4) {
          moveDirection.x = -1;
        } else if(this.sign == 5) {
          moveDirection.x = -1;
        } else if(this.sign == 6) {
          moveDirection.z = -1;
        } else {
          moveDirection.z = -1;
        }

        this._currentAnimationAction = 1;
      }

      moveDirection.normalize();

      if (moveDirection.length() > 0) {
        if(this.otherKeyOn){
          this.angle = Math.atan2(moveDirection.x, moveDirection.z);
          this.modelMesh.rotation.y = this.angle;

          console.log(this.angle);
          this.otherKeyOn = false;
        }
      }

      let speed = 0.06;
      if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
        speed = 0.13;
        this._currentAnimationAction = 2;
      }
      
      this.z += moveDirection.z * speed;
      this.x += moveDirection.x * speed;
    } else {
      this._currentAnimationAction = 0;
    }

    if(this.cannonBody){
      this.sendPosition(previousAnimationAction);
    }
  }
}