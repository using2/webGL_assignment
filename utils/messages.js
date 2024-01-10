function formatMessage(name, text) {
  return {
    name, text
  }
}

function formatChar(name, x, y, z, action){
  return {
    name, x, y, z, action
  }
}

module.exports = formatMessage;
module.exports = formatChar;