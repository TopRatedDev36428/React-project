/**
 * @author      Thoams Richard
 * @published   Aug 1 2022
 * @modified    Aug 4 2022
 * @description Create socket server and process of events
 */

const { getUsers, getLastUser } = require("../../controllers/userController");
const { users, sockets } = require("../../resource/global");
const { unreadMsgCount } = require("../../controllers/chatcontroller")
const httpCode = require("../../resource/httpCode")
const chatCode = require("../../resource/const")
const { isExpired } = require("./method");
const chatSocket = require("./chat")

module.exports = async (http) => {
  const io = require("socket.io")(http)

  //Putting into variable-users the registered users
  let allUsers = await getUsers()
  allUsers.rows.forEach((user) => {
    user.socket = null
    users.push(user)
  })

  io.on(chatCode.CONNECTION, (socket) => {
    chatSocket(socket, users)

    socket.emit(chatCode.REFRESH) //Event to check earlier logged users

    //Event handler for instance notification
    socket.on(chatCode.ALL_REFRESH, () => {
      socket.broadcast.emit(chatCode.ALL_REFRESH,{})
    })

    //Event handler to get all registered users
    socket.on(chatCode.GET_USERS, (data) => {
      if (!data.token) socket.emit(chatCode.SEND_USERS, httpCode.FORBIDDEN)
      else {
        let res = isExpired(socket, data, chatCode.GET_USERS);
        if (!res.expired) socket.emit(chatCode.SEND_USERS, users)
      }
    })

    //Event handler happening whenever the user logged in
    socket.on(chatCode.USER_LOGGED, async (data) => {
      if (!data.token) socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN)
      else {
        let res = isExpired(socket, data, chatCode.USER_LOGGED);
        if (!res.expired) {
          let loggedUserPos = users.findIndex((user) => user.ID === res.user.id.ID);
          if (loggedUserPos !== -1) {
            users[loggedUserPos].socket = socket.id;
            let loggedUser = users[loggedUserPos];
            let userId = loggedUser.ID;
            sockets.push(socket)
            socket.broadcast.emit(chatCode.LOGGED_NEW_USER, {
              ID: userId, socket: socket.id,
            });
            let count = await unreadMsgCount(userId)
            socket.emit(chatCode.UNREAD, count.rows[0].count);
          }
        }
      }
    })

    //Handler to get new user
    socket.on(chatCode.USER_REGISTER, async () => {
      let newUser = await getLastUser();
      newUser.rows[0].socket = null;
      users.push(newUser.rows[0]);
      socket.broadcast.emit(chatCode.NEW_USER, newUser.rows[0]);
    })

    //Event handler happening whenever User out 
    socket.on(chatCode.USER_OUT, async () => {
      let disConnectedUserPos = users.findIndex((user) => user.socket === socket.id)
      if (disConnectedUserPos !== -1) {
        users[disConnectedUserPos].socket = null;
        let disConnectedUser = users[disConnectedUserPos];
        let userId = disConnectedUser.ID;
        socket.broadcast.emit(chatCode.USER_OUT, userId);
      }
      let i = sockets.findIndex((sck) => sck.id === socket.id)
      if (i !== -1) sockets.splice(i, 1)
    })

    //Event handler happening whenever user disconnect
    socket.on(chatCode.DISCONNECT, async () => {
      let disConnectedUserPos = users.findIndex((user) => user.socket === socket.id)
      if (disConnectedUserPos !== -1) {
        users[disConnectedUserPos].socket = null;
        let disConnectedUser = users[disConnectedUserPos];
        let userId = disConnectedUser.ID;
        socket.broadcast.emit(chatCode.USER_OUT, userId);
      }
      let i = sockets.findIndex((sck) => sck.id === socket.id)
      if (i !== -1) sockets.splice(i, 1)
    })
  })
}
