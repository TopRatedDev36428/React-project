/**
 * @author     Thomas Richard
 * @published  Aug 3  2023
 * @decription Global variables for chat socket
 */

let users = [{ ID: 0, Name: "To all", socket: "all" }]
let sockets = []

module.exports = {
  users, sockets
}