import { AnimationMixer, Mesh, TubeGeometry, Vector3 } from 'three';
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

  ChangeSign() {
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
  }

  walk() {
    // 일단 대각선 방향이동에 대한 처리까지 이전방식과 똑같이 수행해두었으나
    // 수정할 부분이 꽤 있음
    // angle을 통해서 sign을 결정하는데 
    // 대각선 방향에 대한 angle을 통해 sign 처리를 해두지 않으면
    // 대각선 방향일 때 이상하게 움직임
    // ex) 키를 누르고 난 후, 이전 방향에 대한 좌우 결정을 한다던가..
    this.ChangeSign();

    let previousAnimationAction = this._currentAnimationAction;

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

        if(this.keys['ArrowLeft'] ||
        this.keys['ArrowRight']){
          this.changeSign = true;
          this.ChangeSign();
        }
      }
      if (this.keys['ArrowDown']) {
        // 뒤로가기 누른 상태에서 대각선 방향 이동이랑
        // 대각선 이미 바라보고 있는 상태에서 이동이랑
        // 서로 다르게 처리가 필요
        // 안하면 하나에서 엉뚱한 방향으로 이동함
        if(this.sign == 0){
          moveDirection.z = +1;
        } else if(this.sign == 1) {
          if(this.keys['ArrowLeft'] ||
          this.keys['ArrowRight']) {
            moveDirection.z = -1;
            moveDirection.x = +1;
          } else {
            moveDirection.z = -1;
            moveDirection.x = -1;
          }
        } else if(this.sign == 2) {
          moveDirection.x = -1;
        } else if(this.sign == 3) {
          if(this.keys['ArrowLeft'] ||
          this.keys['ArrowRight']) {
            moveDirection.z = +1;
            moveDirection.x = +1;
          } else {
            moveDirection.z = -1;
            moveDirection.x = -1;
          }
        } else if(this.sign == 4) {
          moveDirection.z = -1;
        } else if(this.sign == 5) {
          if(this.keys['ArrowLeft'] ||
          this.keys['ArrowRight']) {
            moveDirection.z = +1;
            moveDirection.x = +1;
          } else {
            moveDirection.z = -1;
            moveDirection.x = +1;
          }
        } else if(this.sign == 6) {
          moveDirection.x = +1;
        } else {
          if(this.keys['ArrowLeft'] ||
          this.keys['ArrowRight']) {
            moveDirection.z = -1;
            moveDirection.x = -1;
          } else {
            moveDirection.z = +1;
            moveDirection.x = +1;
          }
        }

        this._currentAnimationAction = 1;

        if(this.keys['ArrowLeft'] ||
        this.keys['ArrowRight']){
          this.changeSign = true;
          this.ChangeSign();
        }
      }
      if (this.keys['ArrowLeft']) {
        // 대각선 방향으로 이동중일 때에 
        // 좌우 이동을 어떤 방향으로 갈 것이냐 생각 필요함
        // 그냥 90도 이동할 경우 직선->대각선 변경 후
        // 대각선->직선으로 돌아올 방법이 있나..?
        // 좀 더 생각해보고 수정해야할듯..?
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

        if(this.keys['ArrowUp'] ||
        this.keys['ArrowDown']){
          this.changeSign = true;
          this.ChangeSign();
        }
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

        if(this.keys['ArrowUp'] ||
        this.keys['ArrowDown']){
          this.changeSign = true;
          this.ChangeSign();
        }
      }

      moveDirection.normalize();

      if (moveDirection.length() > 0) {
        if(this.otherKeyOn){
          this.angle = Math.atan2(moveDirection.x, moveDirection.z);
          this.modelMesh.rotation.y = this.angle;

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