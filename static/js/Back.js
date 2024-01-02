import {Mesh} from 'three';

import {cm1} from './common.js';
import {Stuff} from './Stuff.js';

export class Back extends Stuff {
  constructor(info) {
    super(info);

    cm1.gltfLoader
        .load(
            '../models/scene.glb',
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
              cm1.scene.add(this.modelMesh);

              console.log(this.modelMesh.rotation);
            })

            this.mesh = new Mesh(this.geometry, this.material);
    this.mesh.position.set(this.x, this.y, this.z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    cm1.scene.add(this.mesh);
  }
}