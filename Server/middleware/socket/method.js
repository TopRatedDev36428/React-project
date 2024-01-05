/**
 * @author       Thomas Richard
 * @published    Jul 31, 2022
 * @modified     Aug 4, 2022
 * @description: General methods for connection using socket.io
 */

const jwt = require("jsonwebtoken");
const { error } = require("../../libs/history");

/**
 * The funtion to check token if the token is expired
 * @param {*} socket the socket whenever socket is connected
 * @param {*} data contains data including token
 * @param {*} event emit type
 * @returns true/false
 */
const isExpired = (socket, data, event) => {
  try {
    let token = data.token.slice(7);
    let user = jwt.verify(token, process.env.TOKEN_PRIVATE_KEY);
    let curTime = new Date().getTime();
    if (curTime - user.iat > process.env.AUTH_TOKEN_EXPIRE_TIME) {
      socket.emit("expired", { data, event })
      return { user, expired: true }
    }
    return { user, expired: false }
  } catch (err) {
    error(err)
  }
};

module.exports = { isExpired }
