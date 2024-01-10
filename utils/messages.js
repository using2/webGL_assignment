function formatMessage(name, text) {
  return {
    name, text
  }
}

function formatChar(name, x, y, z, angle, action){
  return {
    name, x, y, z, angle, action
  }
}

module.exports = formatMessage;
module.exports = formatChar;