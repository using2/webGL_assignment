import { AnimationMixer, Mesh, Vector3, Quaternion } from 'three';
import { Quaternion as CannonQuaternion } from 'https://cdn.skypack.dev/cannon-es';
import { cm1, cm3 } from './common.js';
import { Stuff } from './Stuff.js';

export class Player extends Stuff {
  constructor(info) {
    super(info);

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
        this.modelMesh.scale.set(0.02, 0.02, 0.02);
        this.modelMesh.name = this.name;
        cm1.scene.add(this.modelMesh);

        this.modelMesh.animations = glb.animations;
        cm1.mixer = new AnimationMixer(this.modelMesh);
        this.actions = [];
        this.actions[0] = cm1.mixer.clipAction(this.modelMesh.animations[3]);
        this.actions[1] = cm1.mixer.clipAction(this.modelMesh.animations[4]);
        this.actions[2] = cm1.mixer.clipAction(this.modelMesh.animations[1]);
        this.actions[3] = cm1.mixer.clipAction(this.modelMesh.animations[5]);
        this.actions[4] = cm1.mixer.clipAction(this.modelMesh.animations[2]);

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
  }

  keys = [];
  _currentAnimationAction = 0;

  updatePosition(data) {
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;

    this.modelMesh.position.set(this.x, this.y, this.z);
    this.cannonBody.position.set(this.x, this.y, this.z);
  }

  sendPosition() {
    const position = {
      username: this.name,
      x: this.x,
      y: this.y,
      z: this.z,
      newAction: this._currentAnimationAction
    };
    cm3.socket.emit('myPosition', position);
  }

  sendAnimation(action) {
    const data = {
      username: this.name,
      action
    };
    cm3.socket.emit('animationAction', data);
  }

  walk() {
    let previousAnimationAction = this._currentAnimationAction;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
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
        moveDirection.z = -1;
        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowDown']) {
        moveDirection.z = 1;
        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowLeft']) {
        moveDirection.x = -1;
        this._currentAnimationAction = 1;
      }
      if (this.keys['ArrowRight']) {
        moveDirection.x = 1;
        this._currentAnimationAction = 1;
      }

      moveDirection.normalize();

      if (moveDirection.length() > 0) {
        let angle = Math.atan2(moveDirection.x, moveDirection.z);
        this.modelMesh.rotation.y = angle;

        let quaternion = new CannonQuaternion();
        quaternion.setFromEuler(0, angle, 0, 'XYZ');
        this.cannonBody.quaternion.copy(quaternion);
      }

      let speed = 0.06;
      // if (this.keys['ShiftLeft'] || this.keys['ShiftRight']) {
      //   speed = 0.13;
      //   this._currentAnimationAction = 2;
      // }

      this.z += moveDirection.z * speed;
      this.x += moveDirection.x * speed;

      this.cannonBody.position.set(this.x, this.y, this.z);
    } else {
      this._currentAnimationAction = 0;
    }

    if(this.cannonBody){
      this.sendPosition(previousAnimationAction);
    }

    if (previousAnimationAction !== this._currentAnimationAction) {
      this.actions[previousAnimationAction].fadeOut(0.5);
      this.actions[this._currentAnimationAction].reset().fadeIn(0.5).play();
    }
  }
}
