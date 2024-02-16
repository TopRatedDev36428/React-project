/**
 * @author      Thomas Richard
 * @published   Aug 2 2022
 * @description Socket handler for chatting
 */

const { sockets } = require("../../resource/global");
const { isExpired } = require("./method");
const { saveMsg, senderList, readMsg, getMessage, getMsgHistory, getMsgCount } = require("../../controllers/chatcontroller")
const { now, error } = require("../../libs/history")
const httpCode = require("../../resource/httpCode")
const chatCode = require("../../resource/const")

//read message function When user read message
const readMessage = async (users, user) => {
  let senders = await senderList(user.id.ID)
  await readMsg(user.id.ID)

  senders.forEach(sender => {
    users.forEach(item => {
      if (item.ID === sender.Sender) {
        if (item.socket !== null)
          sockets.forEach(usersocket => {
            if (usersocket.id === item.socket)
              usersocket.emit(chatCode.READ_MSG, user.id.ID)
          })
      }
    })
  });
}

module.exports = (socket, users) => {
  //Event handler happening whenever users send new message
  socket.on(chatCode.SEND_MSG, (data) => {
    if (!data.token || !data.sender || !data.receivers || !data.msg)
      socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN)
    else {
      let res = isExpired(socket, data, chatCode.SEND_MSG)

      if (!res.expired) {
        try {
          //postgreSQL's array type  {1,2,3,4,5,6,8}
          let text = "";
          for (let i = 0; i < data.receivers.length; i++) {
            if (data.receivers.length === 1) {
              text += '{' + data.receivers[i].ID + '}'
            } else {
              if (i === 0) {
                text += '{' + data.receivers[i].ID + ','
              } else if (i === data.receivers.length - 1) {
                text += data.receivers[i].ID + '}'
              } else {
                text += data.receivers[i].ID + ','
              }
            }
          }
          // Now time (UTCtime)
          let nowtime = now("Y-m-D H:M:S", null, 1)

          //New message ->save -> database 
          saveMsg(data, text, nowtime)

          for (let i = 0; i < data.receivers.length; i++) {
            users.forEach(user => {
              if (user.ID === data.receivers[i].ID) {
                if (user.socket !== null) {
                  sockets.forEach(usersocket => {
                    if (usersocket.id === user.socket) {
                      usersocket.emit(chatCode.SEND_MSG, { sender: data.sender, receivers: data.receivers, msg: data.msg, time: nowtime })
                    }
                  })
                }
              }
            });
          }
        } catch (err) {
          error(err);
        }
      }
    }
  })

  //Event handler happening when user read message // when user send "read msg"
  socket.on(chatCode.READ_MSG, async (data) => {
    if (!data.token)
      socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN)
    else {
      let { user, expired } = isExpired(socket, data, chatCode.READ_MSG);
      if (!expired) {
        readMessage(users, user);
      }
    }
  })

  //Event handler happening when user request unread messages.
  socket.on(chatCode.GET_MSG, async (data) => {
    if (!data.token)
      socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN)
    else {
      let { user, expired } = isExpired(socket, data, chatCode.GET_MSG);
      if (!expired) {
        let messages = await getMessage(user.id.ID);
        socket.emit(chatCode.GET_MSG, messages);
        readMessage(users, user);
      }
    }
  })

  //Event handler happening whenever user request message's history
  socket.on(chatCode.GET_HISTORY, async (data) => {
    if (!data.token || !data.count || (!data.receiver && data.receiver !== 0) || (!data.offSet && data.offSet !== 0))
      socket.emit(chatCode.FORBIDDEN, httpCode.FORBIDDEN)
    else {
      let { user, expired } = isExpired(socket, data, chatCode.GET_HISTORY);
      if (!expired) {
        let msgCount = await getMsgCount(user.id.ID, data)
        let historyMsg = await getMsgHistory(user.id.ID, data)
        socket.emit(chatCode.GET_HISTORY, { msgCount, historyMsg })
      }
    }
  })
}
