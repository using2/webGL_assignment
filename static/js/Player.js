import {AnimationMixer, Mesh} from 'three';

import {cm1} from './common.js';
import {Stuff} from './Stuff.js';

export class Player extends Stuff {
  constructor(info) {
    super(info);

    cm1.gltfLoader
        .load(
            '../models/character.glb',
            glb => {
              // shadow
              glb.scene.traverse(child => {
                if (child.isMesh) {
                  child.castShadow = true;
                }
              });

              this.modelMesh = glb.scene.children[0];
              this.modelMesh.position.set(this.x, this.y, this.z);
              this.modelMesh.rotation.set(
                  this.rotationX, this.rotationY, this.rotationZ);
              this.modelMesh.castShadow = true;
              this.modelMesh.scale.set(0.02, 0.02, 0.02);
              this.modelMesh.name = this.name;
              cm1.scene.add(this.modelMesh);

              this.modelMesh.animations = glb.animations;
              cm1.mixer = new AnimationMixer(this.modelMesh);
              this.actions = [];
              this.actions[0] =
                  cm1.mixer.clipAction(this.modelMesh.animations[0]);
              this.actions[1] =
                  cm1.mixer.clipAction(this.modelMesh.animations[1]);

              this.setCannonBody();
            })

            this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.name = this.name;
    cm1.scene.add(this.mesh);
  }

  keys = [];

  walk() {
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      console.log(e.code + ' 누름');
      if (
        this.keys['ArrowUp'] ||
        this.keys['ArrowDown'] ||
        this.keys['ArrowLeft'] ||
        this.keys['ArrowRight']
      ) {
        if (this.keys['ArrowUp']) {
          this.z -= 0.01;
        }
        if (this.keys['ArrowDown']) {
          this.z += 0.01;
        }
        if (this.keys['ArrowLeft']) {
          this.x -= 0.005;
        }
        if (this.keys['ArrowRight']) {
          this.x += 0.005;
        }
  
        this.cannonBody.position.set(this.x, this.y, this.z);
      }
    })

    window.addEventListener('keyup', e => {
      delete this.keys[e.code];
      console.log(e.code + ' 땜');
    })
  }
}