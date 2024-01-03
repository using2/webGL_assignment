import {AnimationMixer, Mesh} from 'three';

import {cm1} from './common.js';
import {KeyController} from './KeyController.js';
import {Stuff} from './Stuff.js';

export class Player extends Stuff {
  constructor(info) {
    super(info);
    this.keyController = new KeyController();

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
              cm1.scene.add(this.modelMesh);

              this.modelMesh.animations = glb.animations;
              cm1.mixer = new AnimationMixer(this.modelMesh);
              this.actions = [];
              this.actions[0] =
                  cm1.mixer.clipAction(this.modelMesh.animations[0]);
              this.actions[1] =
                  cm1.mixer.clipAction(this.modelMesh.animations[1]);

              console.log(this.modelMesh.rotation);
              this.setCannonBody();
            })

            this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    cm1.scene.add(this.mesh);
  }

  walk() {
    if (this.keyController.keys['ArrowUp']) {
      this.z += 0.2;
      this.cannonBody.position.set(this.x, this.y, this.z);
    }
    if (this.keyController.keys['ArrowDown']) {
      this.z -= 0.2;
      this.cannonBody.position.set(this.x, this.y, this.z);
    }
    if (this.keyController.keys['ArrowLeft']) {
      this.x += 0.2;
      this.cannonBody.position.set(this.x, this.y, this.z);
    }
    if (this.keyController.keys['ArrowRight']) {
      this.x -= 0.2;
      this.cannonBody.position.set(this.x, this.y, this.z);
    }
  }
}