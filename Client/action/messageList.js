/**
 * @author      Thomas Richard
 * @published   Jul 31 2022
 * @description Actions to manage messages the users send or receive
 */

/**
 * Action to store message
 * @param {Object} data 
 * @returns Object
 */
export const newMessage = (data) => ({
	type: "NEW_MESSAGE",
	data
})

/**
 * Action to show unread messages on the chat interface
 * @param {Array} data 
 * @returns unread message
 */
 export const showMessage = (data) => ({
	type: "SHOW_MESSAGE",
	data
})

/**
 * Action to show history messages on the chat interface
 * @param {Array} data 
 * @returns 
 */
 export const historyMessage = (data) => ({
	type: "HISTORY_MESSAGE",
	data
})

/**
 * Action to pop the user read message in readers
 * @param {Number} id 
 * @returns id of user read message
 */
export const popUnreadUser = (id) => ({
	type: "READ_MESSAGE",
	id
})

/**
 * Actione to initiate messages whenever select user is changed  
 * @returns 
 */
export const initMessage = () => ({
	type: "INIT_MESSAGE"
})

