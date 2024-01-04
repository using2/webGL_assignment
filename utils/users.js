const users = [];

function userJoin(id, username, room, x, y, z) {
  const user = {id, username, room, x, y, z};
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function userLeave(id) {
  const index = users.findIndex(user => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function setPosition(username, x, y, z){
  const index = users.findIndex(user => user.username === username);
  if(index !== -1){
    users[index].x = x;
    users[index].y = y;
    users[index].z = z;
  }
}

function getRoomUsers(room) {
  return users.filter(user => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  setPosition
}