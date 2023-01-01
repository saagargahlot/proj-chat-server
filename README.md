# Overview
This project contains a chat server written in Node.js with following features:
* allows multiple client web browsers to connect with each other
* support for public messages
* support for private messages between two clients
* support for private group messages between two or more clients
* does not check for uniqueness of the users
    * two clients with same username can send message to each other

The technology stack used for this application is:
* Node.js
* Socket.io


# Instructions to setup MovieZilla
To setup this application, please run following commands:
* `npm install`
* Start the server by running following command:
    * `node server.js`
* Open the browser and go to:
    * http://localhost:3000
* Launch other client browsers either in other browser tabs or a different browser app:
    * open url http://localhost:3000

