export class KeyController {
  constructor() {
    this.keys = [];
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      console.log(e.code + ' 누름');
    })

    window.addEventListener('keyup', e => {
      delete this.keys[e.code];
      console.log(e.code + ' 땜');
    })
  }
}
