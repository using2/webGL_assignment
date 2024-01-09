import { AnimationMixer, Mesh } from 'three';
import { cm1 } from './common.js';
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
        this.modelMesh.rotation.set(this.rotationX, this.rotationY, this.rotationZ);
        this.modelMesh.castShadow = true;
        this.modelMesh.scale.set(0.02, 0.02, 0.02);
        this.modelMesh.name = this.name;
        cm1.scene.add(this.modelMesh);

        this.modelMesh.animations = glb.animations;
        cm1.mixer = new AnimationMixer(this.modelMesh);
        console.log(this.modelMesh.animations);
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

  walk() {
    let previousAnimationAction = this._currentAnimationAction;

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      console.log(e.code + ' 누름');
    });

    window.addEventListener('keyup', (e) => {
      delete this.keys[e.code];
      console.log(e.code + ' 땜');
    });

    if (
      this.keys['ArrowUp'] ||
      this.keys['ArrowDown'] ||
      this.keys['ArrowLeft'] ||
      this.keys['ArrowRight']
    ) {
      if (this.keys['ArrowUp']) {
        if(this.keys['ShiftLeft'] || this.keys['ShiftRight']){
          this.z -= 0.13;
          this._currentAnimationAction = 2;
        } else {
          this.z -= 0.06;
          this._currentAnimationAction = 1;
        }
      }
      if (this.keys['ArrowDown']) {
        if(this.keys['ShiftLeft'] || this.keys['ShiftRight']){
          this.z += 0.13;
          this._currentAnimationAction = 2;
        } else {
          this.z += 0.06;
          this._currentAnimationAction = 1;
        }
      }
      if (this.keys['ArrowLeft']) {
        if(this.keys['ShiftLeft'] || this.keys['ShiftRight']){
          this.x -= 0.13;
          this._currentAnimationAction = 2;
        } else {
          this.x -= 0.06;
          this._currentAnimationAction = 1;
        }
      }
      if (this.keys['ArrowRight']) {
        if(this.keys['ShiftLeft'] || this.keys['ShiftRight']){
          this.x += 0.13;
          this._currentAnimationAction = 2;
        } else {
          this.x += 0.06;
          this._currentAnimationAction = 1;
        }
      }

      this.cannonBody.position.set(this.x, this.y, this.z);
    } else {
      this._currentAnimationAction = 0;
    }

    if (previousAnimationAction !== this._currentAnimationAction) {
      this.actions[previousAnimationAction].fadeOut(0.5);
      this.actions[this._currentAnimationAction].reset().fadeIn(0.5).play();
    }
  }
}
