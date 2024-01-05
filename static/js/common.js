import {Material, World} from 'https://cdn.skypack.dev/cannon-es';
import {BoxGeometry, MeshPhongMaterial, Scene, Clock} from 'three';
import {GLTFLoader} from '../jsm/loaders/GLTFLoader.js';

export const cm1 = {
  scene: new Scene(),
  gltfLoader: new GLTFLoader(),
  mixer: undefined,
  clock: new Clock(),

  // cannon
  world: new World(),
  defaultMaterial: new Material('default'),
  playerMaterial: new Material('player'),
};

export const cm2 = {
  backgroundColor: 'skyblue',
  floorColor: 'lightgray',
};

export const geo = {
  floor: new BoxGeometry(200, 1, 200)
}

export const mat = {
  floor: new MeshPhongMaterial({color: cm2.floorColor})
}
