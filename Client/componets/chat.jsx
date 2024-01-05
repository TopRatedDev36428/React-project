/**
 * @author      Thomas Richard
 * @published   Jul 27, 2022
 * @modified 	Jul 30, 2022
 * @description Sider Bar Component for chat
 */

import React from "react"
import emojis from "../../../resource/emojis"
import EmojiButton from "../../elements/emojiButton"
import UserList from "../../elements/userList"
import MessageList from "../../elements/messageList"
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import message from "../../../resource/const/messages"
import { getUserList, sendMsg, getMessageList, getHistory } from "../../../middlewares/socket"
import { connect } from "react-redux"
import { MESSAGE_COUNT } from "../../../resource/const/values"
import { dispatcher } from "../../../reducers/store"
import { initMessage } from "../../../actions/messageList"

var scrollDiv, bottom = true, chatMounted = false

class Chat extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			selectedUser: [],    //array of users selected in user list
			allState: false,     //status to set whether all is selected or not
			selUser: "",				 //value of user select
			badgeStatus: false,	 //when unread message exists
			preScrollHeight: 0,	 //height of scroll bar before new scroll bar is generated  
			selUserStatus: false,//when the value of user select changes
			readMore: true,			 //Status to show or hide the read more btn
			setMessge: { Type: "normal", Text: "" }
		}
	}

	/**
	 * Function to input emoji in the message input
	 * @param {String} emoji 
	 */
	inputEmoji = (emoji) => document.getElementById("message").value += emoji

	/**
	 * Function to selecte the users in user list
	 * @param {Object} user 
	 */
	setSelectedUser = (user) => {
		let selectedUser = this.state.selectedUser
		let i = selectedUser.findIndex((selUser) => selUser.ID === user.ID)
		if (i > -1) {
			this.setState({ allState: false })
			selectedUser.splice(i, 1)
		} else {
			if (user.ID === 0) {
				this.setState({ allState: !this.state.allState })
				selectedUser = []
				if (!this.state.allState)
					for (let i = 0; i < this.props.users.length; i++) {
						if (this.props.users[i].ID !== 0 &&
							Number(this.props.users[i].ID) !== Number(sessionStorage.getItem("aff-id"))) {
							let newUser = { ID: this.props.users[i].ID }
							selectedUser.push(newUser)
						}
					}
			} else
				selectedUser.push(user)
		}
		this.setState({ selectedUser: selectedUser })
	}

	/**
	 * Function to check if ther user is selected
	 * @param {Number} id 
	 * @returns 
	 */
	checkUser = (id) => {
		let selectedUser = this.state.selectedUser
		let i = selectedUser.findIndex((selUser) => selUser.ID === id)
		return i > -1 ? true : false
	}

	/**
	 * Function to send the message to ther users
	 * @param {string} msg 
	 */
	sendMsg = (msg) => {
		if (this.state.selectedUser.length === 0) {
			this.setState({ setMessge: { Type: "warning", Text: message.Chat.selectUser } })

			setTimeout(() => {
				if (chatMounted)
					this.setState({ setMessge: { Type: "warning", Text: "" } })
			}, 3000)
		} else if (!msg) {
			this.refs.message.focus()
			this.setState({ setMessge: { Type: "warning", Text: message.Chat.inputMsg } })
			setTimeout(() => {
				if (chatMounted)
					this.setState({ setMessge: { Type: "warning", Text: "" } })
			}, 3000)
		} else {
			this.setState({ setMessge: { Type: "normal", Text: 0 } })
			sendMsg(this.state.selectedUser, msg)
			this.refs.message.value = ""
		}
	}

	/**
	 * Function to get user name in users accoring to user id
	 * @param {Number} id
	 * @returns User name
	 */
	getUserName = (id) => {
		let user = this.props.users.filter((user) => Number(user.ID) === Number(id))
		if (user.length > 0) {
			let userName = user[0].Name
			return userName
		}
	}

	/**
	 * Function to get history messages
	 */
	getHistory = () => getHistory(this.state.selUser, this.props.msgCnt, MESSAGE_COUNT)

	//Functoin to set the position of scroll bar
	setScrollPos = () => {
		let nextScrollPos = 0
		nextScrollPos = scrollDiv.scrollHeight - this.state.preScrollHeight
		scrollDiv.scrollTop = nextScrollPos
	}

	//Function to handler the position of scroll bar whenever scroll bar moves
	onHandlerScroll = () => {
		bottom = false
		scrollDiv.scrollTop === 0 ? this.setState({ readMore: true }) : this.setState({ readMore: false })
	}

	componentDidMount() {
		chatMounted = true

		setTimeout(() => {
			if (chatMounted) this.refs.chatBar.style = "position: absolute"
		}, 1000)

		scrollDiv = document.getElementById("message_list")
		getUserList()
		getMessageList()
	}

	componentWillUnmount() {
		chatMounted = false
	}

	UNSAFE_componentWillUpdate(preProps) {
		//to set pre-height of scroll bar whenever the new scorll bar is generated
		if (preProps.msgCnt !== this.props.msgCnt) {
			let scrollHeight = scrollDiv.scrollHeight
			this.setState({ preScrollHeight: scrollHeight })
		}
	}

	componentDidUpdate(preProps, preState) {
		//to initiate rendered messages whenever the value of the user select is changed
		if (preState.selUser !== this.state.selUser && preState.selUser !== "")
			this.setState({ selUserStatus: true })

		//to set the status to set the position of scroll bar at top
		if (preProps.badge !== this.props.badge)
			this.setState({ badgeStatus: true })

		//to manage the position of scroll bar whenever new messages is rendered
		if (preProps.msgCnt !== this.props.msgCnt) {
			this.setScrollPos()

			if (preProps.msgCnt + 1 === this.props.msgCnt) bottom = true
			if (this.state.selUserStatus) {
				bottom = true
				this.setState({ selUserStatus: false })
			}
			if (this.state.badgeStatus) {
				scrollDiv.scrollTop = 0
				bottom = false
				this.setState({ badgeStatus: false })
			}
		} else if (bottom) {
			scrollDiv.scrollTop = scrollDiv.scrollHeight
			if (this.props.msgCnt >= MESSAGE_COUNT) {
				bottom = false
				this.setState({ readMore: false })
			}
		}

		//to set primary value of the user select
		if (preState.selUser === "" && this.props.users.length > 0)
			this.setState({ selUser: this.props.users[0].ID })
	}

	render = () => <>
		<div style={{ backgroundColor: "rgba(0, 0, 0, 0.531)", opacity: "1" }} className={"modal mask"}>
			<div ref="chatBar" className={this.props.classname + " chat-bar"}>
				<div className="title"><i className="icon-chat-inv"></i>Chatting
					<div style={{ cursor: "pointer", color: "white" }} className="right" onClick={this.props.func}>
						<i className="fa fa-arrow-right"></i>
					</div>
				</div>
				<div className="chat-container">
					<div className="chat-header">
						<div className="header-left">
							<Select value={this.state.selUser}
								onChange={(evt) => {
									dispatcher(initMessage())
									bottom = true
									this.setState({ selUser: evt.target.value })
									getHistory(evt.target.value, 0, MESSAGE_COUNT)
								}}>
								{ this.props.users.length > 0  
										? this.props.users
											.filter((user) => {
												return user.ID === Number(sessionStorage.getItem("aff-id"))
													? false : true
											}).map((user, index) => {
												return (<MenuItem value={user.ID} key={`DLG-1-${index}`}>
													<img className="user-avatar" alt="..."
														src={!user.ID ? `store/avatars/User/default` : `store/avatars/User/User-` + user.ID} />
													&nbsp;
													<span style={{ marginTop: "0.25em" }}>{user.Name}</span>
												</MenuItem>)
											})
										: ""}
							</Select>
						</div>
						<div className={"status " + this.state.setMessge.Type}>{this.state.setMessge.Text}</div>
						{this.state.readMore ?
							this.props.msgTotalCnt[0].cnt !== "" &&
								Number(this.props.msgTotalCnt[0].cnt) === Number(this.props.msgCnt) ?
								<div className="header-right disable">
									{MESSAGE_COUNT} msgs&nbsp;
									<i className="fa fa-search-plus"></i>
								</div> :
								<div className="header-right" onClick={this.getHistory}>
									{MESSAGE_COUNT} msgs&nbsp;
									<i className="fa fa-search-plus"></i>
								</div> :
							<div className="header-right"></div>}
					</div>

					<div className="chat-content">
						<UserList allState={this.state.allState} checkUser={this.checkUser}
							setSelectedUser={this.setSelectedUser} users={this.props.users}></UserList>

						<MessageList onHandlerScroll={this.onHandlerScroll} msgCnt={this.props.msgCnt}
							getUserName={this.getUserName} userNumber={this.props.users.length} ></MessageList>
					</div>
					{this.props.emojis ? (<div className="emojis">
						{emojis.length > 0 
							? emojis.map((emoji, i) => {
									return (<EmojiButton onclick={() => {
										this.inputEmoji(emoji[1])
									}} key={i} emoji={emoji}></EmojiButton>)
								})
							: ""}
					</div>) : ""}
					<div className="chat-footer">
						<div className="footer-left">
							<button onClick={this.props.handleEmojis} aria-controls="customized-menu"
								aria-haspopup="true" variant="contained" color="primary">
								<span className="title-img" role="img" aria-label="">&#128512;</span>
							</button>
						</div>
						{this.props.emojis ?
							<input onClick={this.props.handleEmojis} ref="message" id="message"
								onKeyPress={(e) => e.which === 13 ? this.sendMsg(e.target.value) : false}
								placeholder="Type here..." type="text" /> :
							<input ref="message" id="message" type="text" placeholder="Type here..."
								onKeyPress={(e) => e.which === 13 ? this.sendMsg(e.target.value) : false} />}
						<div className="footer-right">
							<button className="send-btn" onClick={() => { this.sendMsg(this.refs.message.value) }}>
								<i className="fa fa-paper-plane-o"></i>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</>
}

const mapStateToProps = (state) => ({
	users: state.userList,
	msgCnt: state.messageCount,
	msgTotalCnt: state.messageStatus
})

export default connect(mapStateToProps)(Chat)