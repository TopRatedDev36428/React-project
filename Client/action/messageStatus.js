/**
 * @author      Thomas Richard
 * @published   Aug 1 2022
 * @description Actions to manage the status of read or unread messages
 */

/**
 * Action to increase the number of unread message
 * @param {Number} id 
 * @param {Number} cnt 
 * @returns 
 */
export const setUnreadMsg = (id, cnt) => ({
	type: "INC_UNREADMSG",
	id,
	cnt
})

/**
 * Action to delete the unread message
 * @param {*} id 
 * @returns 
 */
export const delUnreadMsg = (id) => ({
	type: "DEL_UNREADMSG",
	id
})

/**
 * Action to set the number of message rendered on the chat page now
 * @param {Number} cnt 
 * @returns number of the messages
 */
export const setMsgCnt = (cnt) => ({
	type: "SET_MSG_COUNT",
	cnt
})

/**
 * Action to set the number of all messages when read more botton is clicked
 * @param {Number} cnt 
 * @returns 
 */
export const setTotalMsgCnt = (cnt) => ({
	type: "SET_TOTAL_MSG_CNT",
	cnt
})