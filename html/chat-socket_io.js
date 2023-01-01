let socket = io()

let messageTextField = document.getElementById('message')
let loggedInUserId = ''

// This function is called when the user clicks on the "Connect As" button
// and if the user is verified
function emitConnectionInfoToServer(userId) {
    loggedInUserId = userId
    userLoggedIn = true

    console.log(`Sending user info to server: [${userId}]`)
    // Emit and on receiving acknowledgement from server, display it
    socket.emit('connectUserInfo', userId, (ack) => {
        console.log(`Showing server ACK -> [${JSON.stringify(ack)}]...`)
        let chatConnectInfo = document.getElementById("chat-connect-info");
        chatConnectInfo.innerHTML = ack.message
        console.log(`On chatServerConnectHeader: socket.id=${socket.id}`)
    });
}

// handling the server responses for chat messages
socket.on("chat message", function (serverData) {
    if (userLoggedIn) {
        // take out different attributes from serverData obj
        let msg = serverData.data
        let fromUserId = serverData.fromUserId
        let typeOfMessage = serverData.type

        console.log(`On chat message: socket.id=${socket.id}`)
        console.log(`type=${typeOfMessage}`)
        console.log(`Creating a "li" element for ${typeOfMessage} message=[${msg}]. Sender=[${fromUserId}]`)

        // creating new "li" element and setting the correct class on it
        // to set the color and indentation based on server reply
        let newLi = document.createElement('li')
        newLi.innerHTML = msg
        if (typeOfMessage === 'private') {
            // the message is a private one - use red color for displaying it
            newLi.className = 'private'
        } else if (fromUserId === loggedInUserId) {
            // the message is from current user - use blue color for displaying it
            newLi.className = 'self'
        } else {
            // normal message
            newLi.className = 'others'
        }

        console.log(`New LI=${newLi}`)

        // append the new "li" to chat messages
        let chatMessagesUl = document.getElementById('chat-messages');
        chatMessagesUl.appendChild(newLi);

        // scrolling to the bottom of the chat messages area
        chatMessagesUl.scrollTop = chatMessagesUl.scrollHeight
    }
})

