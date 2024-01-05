/**
 * @author      Gunderson Paul & Gasolin swayer
 * @published   Jul 31 2022
 * @modified    Aug  2 2022
 * @description Create socket object
 */

import { addUser, popSocket, setUserList, setLoggedUser } from "../../actions/userList"
import { dispatcher } from "../../reducers/store"
import { setUnreadMsg, delUnreadMsg, setTotalMsgCnt } from "../../actions/messageStatus"
import httpCode from "../../resource/const/httpCode"
import { newMessage, showMessage, popUnreadUser, historyMessage, initMessage } from "../../actions/messageList";
import { allRefresh } from '../../actions/notification'
import {
  EXPIRED, NEW_USER, USER_OUT, USER_REGISTER, LOGGED_NEW_USER, GET_MSG,
  READ_MSG, REFRESH, SEND_MSG, SEND_USERS, GET_HISTORY, UNREAD, FORBIDDEN, ALL_REFRESH
} from "../../resource/const/values"
import { recoverText } from "../../resource/general"
import {
  chatUserLogged, msgConvert, chatGetUserList,
  chatSendMsg, chatGetMessageList, chatGetHistory
} from "./chat"
import { now, convertDateUTC2Local } from "../../resource/time"
import { ALARM } from "../../resource/const/values"
import errorHandler from "../../components/HOCs/errorHandler"
import { showAlert } from "../../actions/alert"
import { addAlarm } from "../../actions/alarm"

const io = require("socket.io-client")

const SERVER_URL = sessionStorage.getItem("aff-server")
const socket = io(SERVER_URL)

//Event handler happening when user's token is expired
socket.on(EXPIRED, async (data) => {
  const Email = sessionStorage.getItem("aff-Email")
  const Password = sessionStorage.getItem("aff-Password")

  try {
    let res = await fetch("auth/login", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Email, Password, socket: socket.id }),
    })

    if (res.status === httpCode.SUCCESS) {
      res = await res.json()
      sessionStorage.setItem("aff-token", res.Token)

      data.data.token = sessionStorage.getItem("aff-token")

      socket.emit(data.event, data.data);
    } else
      logOut()
  } catch (err) {
    errorHandler(err, (Type, Text) => dispatcher(showAlert({ Type, Message: Text })))
  }
})

//Event handler to get the new registered user
socket.on(NEW_USER, (data) => dispatcher(addUser(data)))

//Event handler to pop socket of the disconnected user
socket.on(USER_OUT, (data) => dispatcher(popSocket(data)))

//Handler to receiver registered users
socket.on(SEND_USERS, (data) => dispatcher(setUserList(data)))

//Handler to put the socket.id of new logged user in users
socket.on(LOGGED_NEW_USER, (data) => dispatcher(setLoggedUser(data)))

//Event handler to check earlier logged users
socket.on(REFRESH, () => userLogged())

//Event handler to get history message
socket.on(GET_HISTORY, (data) => {
  let msgs = msgConvert(data.historyMsg)
  msgs.length > 0 ? dispatcher(historyMessage(msgs)) : dispatcher(initMessage())
  dispatcher(setTotalMsgCnt(data.msgCount))
})

//Event handler to receiver
socket.on(SEND_MSG, (data) => {
  data.time = now("Y-m-D H:M:S", convertDateUTC2Local(new Date(data.time)))
  let chat = sessionStorage.getItem("chat")
  let token = sessionStorage.getItem("aff-token")
  if (chat === "true") {
    socket.emit(READ_MSG, { token })
    data.msg = recoverText(data.msg)
    dispatcher(newMessage(data))
  } else {
    let id = sessionStorage.getItem("aff-id")
    if (id) dispatcher(setUnreadMsg(id, 1))
  }
})

//Event handler to get the users read the message
socket.on(READ_MSG, (id) => {
  dispatcher(delUnreadMsg(id))
  dispatcher(popUnreadUser(id))
})

//Event hanler to get the number of unread message
socket.on(UNREAD, (cnt) => {
  let id = sessionStorage.getItem("aff-id")
  if (id) dispatcher(setUnreadMsg(id, cnt))
})

//Event handler for refresh
socket.on(ALL_REFRESH, () => {
  dispatcher(allRefresh())
})

//Event handler to get unread message
socket.on(GET_MSG, (data) => {
  let msgs = msgConvert(data)
  if (msgs.length > 0) dispatcher(showMessage(msgs))
})

//Event hadler to get forbidden signal
socket.on(FORBIDDEN, () => errorHandler(httpCode.FORBIDDEN,
  (Type, Text) => dispatcher(showAlert({ Type, Message: Text }))))

//Function to send the new registered user
export const userRegistered = () => socket.emit(USER_REGISTER)

//Function to send log-out
export const logOut = () => socket.emit(USER_OUT)

//Function to call the function in chat.js
export const getUserList = () => chatGetUserList(socket)

//Function to call the function in chat.js
export const userLogged = () => chatUserLogged(socket)

//Function to call the function in chat.js
export const sendMsg = (receivers, msg) => chatSendMsg(socket, receivers, msg)

//Function to call the function in chat.js
export const getMessageList = () => chatGetMessageList(socket)

//Function to call the function in chat.js
export const getHistory = (receiver, offSet, cnt) => chatGetHistory(socket, receiver, offSet, cnt)

//Function to call the function in Loin.js and authAPI
export const getSocketId = async () => socket.id

// Function for instance notification
export const instance = async () => {
  dispatcher(allRefresh())
  socket.emit('allRefresh', { token: sessionStorage.getItem("aff-token") })
}
//Event handler when receive alarm-signal
socket.on(ALARM, (Data) => dispatcher(addAlarm(Data)))
