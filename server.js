const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const fs = require("fs") //need to read static files
const url = require("url") //to parse url strings
const PORT = process.env.PORT || 3000

const ROOT_DIR = "html" //dir to serve static files from

let userIdToSocketIdMap = new Map()     // creating map to keep user to socket relation
let socketIdToUserIdMap = new Map()     // creating map to keep socket to user relation

const MIME_TYPES = {
    css: "text/css",
    gif: "image/gif",
    htm: "text/html",
    html: "text/html",
    ico: "image/x-icon",
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    js: "application/javascript",
    json: "application/json",
    png: "image/png",
    svg: "image/svg+xml",
    txt: "text/plain"
}

function get_mime(filename) {
    for (let ext in MIME_TYPES) {
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return MIME_TYPES[ext]
        }
    }
    return MIME_TYPES['txt']
}

function handler(request, response) {
    let urlObj = url.parse(request.url, true, false)

    if (request.method === "GET") {
        //handle GET requests as static file requests
        let filePath = ROOT_DIR + urlObj.pathname
        if (urlObj.pathname === '/') {
            filePath = ROOT_DIR + '/chat_app.html'
        }

        fs.readFile(filePath, function (err, data) {
            if (err) {
                //report error to console
                console.log("ERROR: " + JSON.stringify(err))
                //respond with not found 404 to client
                response.writeHead(404)
                return response.end(JSON.stringify(err))
                // return
            }
            response.writeHead(200, {
                "Content-Type": get_mime(filePath)
            })
            response.end(data)
        });
    }
}

// This function will return an object containing
//  the list of known users and the actual message
function getUsersIfAny(message) {
    let userIds = []
    let actualMessage = message

    const separatorIndex = message.indexOf(':')
    if (separatorIndex !== -1) {
        // Found the user and message separator
        // take everything before ":" as userid
        let userIdPart = message.substring(0, separatorIndex)
        actualMessage = message.substring(separatorIndex + 1).trim()

        let tmpUserIds = userIdPart.split(",")
        console.log(`all users: (${JSON.stringify(tmpUserIds)})`)

        // Filter out unknown users
        if (tmpUserIds.length > 0) {
            for (let i = 0; i < tmpUserIds.length; i++) {
                let userId = tmpUserIds[i].trim()
                if (doesUserExists(userId)) {
                    userIds.push(userId)
                    console.log(`user[${i}] -> [${userId}. User FOUND]`);
                } else {
                    console.log(`user[${i}] -> [${userId}. User NOT FOUND]`);
                }
            }
        }
    }

    return {userIds: userIds, message: actualMessage}
}

function getMatchingUserId(socketId) {
    return socketIdToUserIdMap.get(socketId)
}

function getMatchingSocketId(userId) {
    return userIdToSocketIdMap.get(userId)
}

function doesUserExists(userId) {
    return getMatchingSocketId(userId) != null
}

// function to remove the user and socket from corresponding map
// on a disconnect
function handleSocketDisconnect(socket) {
    socket.on('disconnect', () => {
        const userId = getMatchingUserId(socket.id)
        console.log(`Trying to remove user (${userId}) and socketId (${socket.id}) as the user has disconnected...`)

        // Remove the user id and socket id entries from the map
        userIdToSocketIdMap.delete(userId)
        socketIdToUserIdMap.delete(socket.id)
    })
}

// adds the user and socket in their corresponding map
// on a connect and uses the callback to return the server acknowledgement
function handleConnectUserInfo(socket) {
    socket.on('connectUserInfo', (userId, callback) => {
        console.log(`New user connected -> ${userId}`)

        // Store the user id and socket id with userId as key
        userIdToSocketIdMap.set(userId, socket.id)

        // Store the user id and socket id with socketId as key
        socketIdToUserIdMap.set(socket.id, userId)

        // Send back the acknowledgement from the server, using the callback
        console.log(`Sending back ACK to the client (for socketId=${socket.id})...`);
        callback({
            message: 'You are connected to CHAT SERVER'
        })
    })
}

// main function to handle client messages
function handleClientChatMessage(socket) {
    socket.on('chatMessageFromClient', function(data) {
        console.log('RECEIVED CHAT DATA: ' + data)

        const socketId = socket.id

        let usersAndMessage = getUsersIfAny(data)    // breaking down the client data to list of users and message
        let actualMessage = usersAndMessage.message

        let senderId = getMatchingUserId(socketId)        // using the socketId to find the sender
        let serverData = `${senderId}: ${actualMessage}`
        if (senderId) {
            console.log(`Got userId (${senderId}) for the socketId (${socketId})`)
        } else {
            console.log(`SHOULD NEVER HAPPEN -> userId NOT FOUND for the socketId (${socketId})`)
        }

        // handle private users if any
        let privateUserIds = usersAndMessage.userIds
        if (privateUserIds.length > 0) {
            if (privateUserIds.indexOf(senderId) === -1) {
                // add the sender's userId to the private ids as the private message should also be sent to the sender
                privateUserIds.push(senderId);
            }

            // It is a private message. Send only to the specified users
            for (let i = 0; i < privateUserIds.length; i++) {
                console.log(`Sending private message to user[${i}] -> [${privateUserIds[i]}]`)
                let privateUserSocketId = getMatchingSocketId(privateUserIds[i])
                if (privateUserSocketId) {
                    // Sending only to the specified user by using its socketId
                    io.to(privateUserSocketId).emit('chat message', {data: serverData, fromUserId: senderId, type: 'private'});
                } else {
                    console.log(`ERROR: unable to find matching socketId for the private user id: [${privateUserIds[i]}]`)
                }
            }
        } else {
            //to broadcast message to everyone including sender:
            io.emit('chat message', {data: serverData, fromUserId: senderId, type: 'public'}); //broadcast to everyone including sender
        }
    })
}

app.listen(PORT, () => {
    console.log(`server listening on ${PORT} ...`);
    console.log(`please visit http://localhost:${PORT} ...`);
})

io.on('connection', function(socket) {
    handleConnectUserInfo(socket)

    // process the client message
    handleClientChatMessage(socket)

    handleSocketDisconnect(socket)
})

