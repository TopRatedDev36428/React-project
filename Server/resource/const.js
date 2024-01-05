/**
 * CONSTs that be used in project
 * @author    Thomas Richard
 * @publised Jun 26, 2022
 * @modified  Jun 26, 2022
 * @methods
 ** ROOT: ROOT path of this project
 */

const ROOT = `${__dirname.substr(0, __dirname.lastIndexOf("\\"))}`
const ASSET_PATH = `${ROOT}/store/files/`

/**
 * Const strings to use fof chat
 */
module.exports = {
  ROOT,
  ASSET_PATH,
  ONCE_ALARM: 1, DAILY_ALARM: 2, WEEKLY_ALARM: 3, MONTHLY_ALARM: 4, YEARLY_ALARM: 5,
  ALARM_PLANNED: 1, ALARM_EXPIRED: 2, ALARM_FAILED: 3, ALARM_ACHIEVED: 4,

  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  EXPIRED: "expired",
  NEW_USER: "new user",
  USER_OUT: "user out",
  USER_REGISTER: "user register",
  GET_USERS: "get users",
  USER_LOGGED: "user logged",
  SEND_MSG: "send msg",
  GET_MSG: "get msg",
  GET_HISTORY: "get history",
  SEND_USERS: "send users",
  LOGGED_NEW_USER: "logged new user",
  REFRESH: "refresh",
  READ_MSG: "read msg",
  UNREAD: "unread",
  FORBIDDEN: "forbidden",
  ALARM: "alarm",
  ALL_REFRESH : "allRefresh"
};