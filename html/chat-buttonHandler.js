function sendMessage(e) {
    console.log('In sendMessage...')
    if (messageTextField.value) {
        console.log(`Sending message to server: [${messageTextField.value}]`)
        socket.emit('chatMessageFromClient', messageTextField.value);  // emitting message to server
        messageTextField.value = '';
    }
}

// Clears out the whole ul element (chat-messages)
function clearMessages(e) {
    let chatMessages = document.getElementById('chat-messages')

    chatMessages.innerHTML = ''
}