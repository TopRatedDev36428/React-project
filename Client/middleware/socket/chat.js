/**
 * @author      Gunderson Paul
 * @published   July 30 2022
 * @description Socket handler for chatting
 */

import { dispatcher } from "../../reducers/store";
import {
  newMessage,
} from "../../actions/messageList";
import { now, convertDateUTC2Local } from "../../resource/time";
import { delUnreadMsg } from "../../actions/messageStatus";
import { makeTextSafe, recoverText } from "../../resource/general";
import { GET_HISTORY, GET_MSG, GET_USERS, SEND_MSG, USER_LOGGED }
  from "../../resource/const/values";

//Function sending socket to get registered users
export const chatGetUserList = (socket) => {
  let token = sessionStorage.getItem("aff-token");
  if (token) socket.emit(GET_USERS, { token });
};

//Function send the signal to the server when the user is logged in
export const chatUserLogged = (socket) => {
  let token = sessionStorage.getItem("aff-token");
  if (token) socket.emit(USER_LOGGED, { token });
};

/**
 * Function to send the message to the selected users
 * @param {*} socket
 * @param {Array} receivers
 * @param {string} msg
 */
export const chatSendMsg = (socket, receivers, msg) => {
  let time = now("Y-m-D H:M:S");
  let token = sessionStorage.getItem("aff-token");
  let sender = sessionStorage.getItem("aff-id");
  dispatcher(newMessage({ sender, receivers, msg, time }));
  msg = makeTextSafe(msg)
  if (token) socket.emit(SEND_MSG, { token, sender, receivers, msg });
};

//Function to get messages that the user is unread
export const chatGetMessageList = (socket) => {
  let token = sessionStorage.getItem("aff-token");
  let id = sessionStorage.getItem("aff-id");
  if (token) socket.emit(GET_MSG, { token });
  dispatcher(delUnreadMsg(id));
};

/**
 * Function to get history messages
 * @param {*} socket
 * @param {Array} receiver
 * @param {Number} cnt
 */
export const chatGetHistory = (socket, receiver, offSet, cnt) => {
  let token = sessionStorage.getItem("aff-token");
  if (token) socket.emit(GET_HISTORY, { token, count: cnt, receiver, offSet });
};

/**
 * Function to convert the array init [1, 2, ...]
 * @param {Array} data 
 * @returns new array converted format [{ ID: 1 }, { ID: 2 }, ...]
 */
export const arrayConvert = (data) => {
  let newArray = []
  for (let i = 0; i < data.length; i++) {
    let array = {
      ID: data[i],
    }
    newArray.push(array)
  }
  return newArray
}

export const msgConvert = (data) => {
  let msgs = []
  for (let i = 0; i < data.length; i++) {
    let time = now("Y-m-D H:M:S", convertDateUTC2Local(new Date(data[i].SendDate)));
    let receivers = arrayConvert(data[i].Receivers)
    let readers = arrayConvert(data[i].Reader)
    let safeMsg = recoverText(data[i].Msg)
    let msg = {
      sender: data[i].Sender,
      receivers: receivers,
      time: time,
      msg: safeMsg,
      readers: readers,
    };
    msgs.splice(0, 0, msg);
  }
  return msgs;
};
