import {Body, Box, Vec3, Quaternion} from 'https://cdn.skypack.dev/cannon-es';
import {cm1} from './common.js'
import { RGBA_ASTC_10x10_Format } from 'three';

export class Stuff {
  constructor(info = {}) {
    this.name = info.name || '';
    this.x = info.x || 0;
    this.y = info.y || 0;
    this.z = info.z || 0;

    this.rotationY = info.rotationY || 0;
    this.rotationX = info.rotationX || 0;
    this.rotationZ = info.rotationZ || 0;

    this.mass = info.mass || 0;
    this.cannonMaterial = info.cannonMaterial || cm1.defaultMaterial;
  }

  setCannonBody() {
    const material = this.cannonMaterial;

    const shape =
        new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2));
    this.cannonBody = new Body({
      mass: this.mass,
      position: new Vec3(this.x, this.y, this.z),
      shape,
      material
    });

    if(this.rotationX != 0){
      this.cannonBody.quaternion.setFromAxisAngle(new Vec3(1,0,0),this.rotationX);
    }
    else if(this.rotationY != 0){
      this.cannonBody.quaternion.setFromAxisAngle(new Vec3(0,1,0),this.rotationY);
    }
    else if(this.rotationZ != 0){
      this.cannonBody.quaternion.setFromAxisAngle(new Vec3(0,0,1),this.rotationZ);
    }  
    console.log(this.cannonBody.quaternion);
    
    cm1.world.addBody(this.cannonBody);
  }
}