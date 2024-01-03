function formatMessage(name, text) {
  return {
    name, text
  }
}

function formatChar(name, x, y, z){
  return {
    name, x, y, z
  }
}

module.exports = formatMessage;
module.exports = formatChar;