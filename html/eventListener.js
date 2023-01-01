

document.addEventListener('DOMContentLoaded', function() {
  //This is called after the browser has loaded the web page

  //add listener for "connect as" button
  document.getElementById('connect_as').addEventListener('click', verifyUser)

  //add listener to "send message" button
  document.getElementById('send_message').addEventListener('click', sendMessage)

  //add listener to "clear" button
  document.getElementById('clear_messages').addEventListener('click', clearMessages)

  document.addEventListener('keydown', handleKeyDown)
})
