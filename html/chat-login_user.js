let userName = document.getElementById('userName');
let userLoggedIn = false

function handleKeyDown(event) {
    const ENTER_KEY = 13 //keycode for enter key
    if (event.keyCode === ENTER_KEY) {
        console.log(`userLoggedIn=${userLoggedIn}`)
        if (userLoggedIn) {
            sendMessage();
        } else {
            // Connect Enter with "Connect As"
            verifyUser(event)
        }
        return false //don't propagate event
    }
}

// this function verifies the user based on starting with a letter and 
// having no spaces in them
function verifyUser(e) {
    if (userName.value) {
        // Found some value in user name. Checking if it is starting with a letter and doesn't contain a space
        const alphabets = /^[a-zA-Z]/      // checking if the first character is a letter by using a regex
        let userId = userName.value
        console.log(`user=${userId}, user.length=${userId.length}, user.indexOf(" ")=${userId.indexOf(" ")}, alphabets.test(user)=${alphabets.test(userId)}`)
        if (userId.length > 0 && userId.indexOf(' ') === -1 && alphabets.test(userId)) {
            userId = userId.trim()
            showChatArea(e)
            hideConnectArea()
            emitConnectionInfoToServer(userId)
        } else {
            userName.value = ""     // blanking the text field as username doesn't comply
        }
    }
}

// this function displays the chat area by making all the necessary elements visible 
function showChatArea(e) {
    e.preventDefault();

    // Set the display to "block" to display these fields
    let chatMessagesHeading = document.getElementById('chat-messages-heading')
    let chatConnectArea = document.getElementById('chat-connect-info')
    let chatMessages = document.getElementById('chat-messages')
    let messageTextField = document.getElementById('message')
    let sendMessageButton = document.getElementById('send_message')
    let clearMessagesButton = document.getElementById('clear_messages')

    chatMessagesHeading.style.visibility = 'visible'
    chatConnectArea.style.visibility = 'visible'
    chatMessages.style.visibility = 'visible'
    messageTextField.style.visibility = 'visible'
    sendMessageButton.style.visibility = 'visible'
    clearMessagesButton.style.visibility = 'visible'

    // Put focus on the message text field
    messageTextField.focus()
}

// this function hides the connect area by making all the necessary elements invisible
function hideConnectArea() {
    let userNameTextField = document.getElementById('userName')
    let connectAsButton = document.getElementById('connect_as')

    // Set the visibility to "hidden" to hide these fields
    userNameTextField.style.visibility = 'hidden'
    connectAsButton.style.visibility = 'hidden'
}
