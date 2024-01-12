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

  event = 0;
  //0: up: -z, down: +z, left: -x, right: +x
  //1: up: +x, down: -x, left: -z, right: +z
  //2: up: +z, down: -z, left: +x, right: -x
  //3: up: -x, down: +x, left: +z, right: -z
  sign = 0;

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

  walk(intersects) {
    let previousAnimationAction = this._currentAnimationAction;

    window.addEventListener('keydown', (e) => {
      this.event = 1;
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      if(this.event == 1){
        if(e.code == 'ArrowLeft') {
          this.sign = (this.sign + 3) % 4;
        } else if(e.code == 'ArrowRight') {
          this.sign = (this.sign + 1) % 4;
        } else if(e.code == 'ArrowDown') {
          this.sign = (this.sign + 2) % 4;
        }
        this.event = 0;
      }
      console.log(this.sign);
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
          moveDirection.x = +1;
        } else if(this.sign == 2) {
          moveDirection.z = +1;
        } else if(this.sign == 3) {
          moveDirection.x = -1;
        }
        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowDown']) {
        if(this.sign == 0){
          moveDirection.z = +1;
        } else if(this.sign == 1) {
          moveDirection.x = -1;
        } else if(this.sign == 2) {
          moveDirection.z = -1;
        } else if(this.sign == 3) {
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
          moveDirection.x = +1;
        } else if(this.sign == 3) {
          moveDirection.z = +1;
        }
        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowRight']) {
        if(this.sign == 0){
          moveDirection.x = +1;
        } else if(this.sign == 1) {
          moveDirection.z = +1;
        } else if(this.sign == 2) {
          moveDirection.x = -1;
        } else if(this.sign == 3) {
          moveDirection.z = -1;
        }
        this._currentAnimationAction = 1;
      }

      moveDirection.normalize();

      if (moveDirection.length() > 0) {
        this.angle = Math.atan2(moveDirection.x, moveDirection.z);
        this.modelMesh.rotation.y = this.angle;
      }

      let speed = 0.06;
      if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
        speed = 0.13;
        this._currentAnimationAction = 2;
      }

      if(intersects.length == 0){
        this.z += moveDirection.z * speed;
        this.x += moveDirection.x * speed;
      } else {
        const pushBackDistance = 2; 
        this.z -= moveDirection.z * speed * pushBackDistance;
        this.x -= moveDirection.x * speed * pushBackDistance;
      }
    } else {
      this._currentAnimationAction = 0;
    }

    if(this.cannonBody){
      this.sendPosition(previousAnimationAction);
    }
  }
}
