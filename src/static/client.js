const socket = io({
    auth: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVhdGVkX2J5IjoiU3RlZmFuIFNjaG5laWRlciJ9.HXtgjubMe1KUfD5fWPbmSrSBSFTH5A9xdMV5vgw2BJU"
    }
});

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const userList = document.getElementById('userList');

// handle connection error
socket.on("connect_error", (err) => {
    messages.textContent = `Can't connect to server: ${err.message}`
});

function handlePrivateMessage() {
    /**
     * handlePrivateMessage()
     * Sends a private message to the socket of a receiving username
     * matched username. Afterwards the message is displayed to the client. If no username matches, nothing happens
     * @return {void}
     */
    let privateMsg = matchUser(input.value)

    if (privateMsg.receiver) {
        // send to server so that it can send the msg further to the receiver
        socket.emit('privateMessage', privateMsg);

        // display the message with some extras
        displayMessage(`You to ${privateMsg.receiver}: ${privateMsg.msg}`, true)
    }
};

function handleSendMessage(event) {
    /**
     * handleSendMessage()
     * Handle the sending of the message when the send button is clicked.
     * Either sends a public or private message, depending on the syntax of the message
     * @return {void}
     */
    event.preventDefault();
    if (input.value) {
        if (input.value.startsWith("/")) {
            // if it's private message, send it to only one socket
            handlePrivateMessage()
        } else {
            // for normal chat messages, broadcast the msg to everyone (except yourself)
            socket.emit('chatMessage', input.value);

            // display own message, because you aren't sending it to yourself
            displayMessage(`You: ${input.value}`)
        }
    }

    // clear input value after sending
    input.value = '';
};

// event listener to handle send message button
form.addEventListener('submit', handleSendMessage);


// handle public messages
socket.on('chatMessage', displayMessage);

// handle private messages
socket.on('privateMessage', (msg, isPrivate) => { displayMessage(msg, true) });


// update local user list element whenever server sends updated list through socket
socket.on("updateUserList", updateUserList, (users) => {
    updateUserList(users)
});

function matchUser(msg) {
     /**
     * matchUser()
     * Extract the receiving user out of a message
     * Splits the msg into two parts:
     *  - User: Tries to get the receiver out of the message by splitting the string going through
     *          the connected users "database" to find a matching user
     *  - Message: Strips the message of the slash and the username
     * @param {String} msg - Message string
     * @return {Object} privateMsg object
     */
   
    msg = msg.replace("\/", "")
    console.log(msg)
    let privateMsg = { receiver: null, msg: null }
    userList.childNodes.forEach(element => {
        console.log(element.textContent)
        if (msg.startsWith(element.textContent)) {
            privateMsg.receiver = element.textContent
            msg = msg.replace(element.textContent, "")
            privateMsg.msg = msg
        }
    })
    return privateMsg;
}

function highlightUserName() {
    /**
     * highlightUserName()
     * Goes through all usernames in the userList element and highlights yourself.
     * The username is gotten through a websocket call directly from the server and the highlighting is done
     * using a callback function that gets called once the server acknowledges the request.
     * @return {void}
     */
    socket.emit("getUserName", null, (name) => {
        userList.childNodes.forEach(element => {
            if (element.textContent == name) {
                element.innerHTML = `<strong>${element.innerHTML} (you) </strong>`
            }
        })
    })
}

function displayMessage(msg, isPrivate) {
    /**
     * displayMessage()
     * Display a message. Can display public and private messages.
     * @param {String} msg - Message that is going to be displayed
     * @param {Boolean} isPrivate - Boolean indicating if it's a private or public message
     * @return {void}
     */
    if (!isPrivate) {
        const isPrivate = false
    }
    let item = document.createElement('li');
    item.textContent = msg;
    if (isPrivate) {
        item.className = "private"
        item.textContent = `*whisper* ${msg}`
    }

    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
}

function getUserList(socket) {
    /**
     * getUserList()
     * Display a message. Can display public and private messages.
     * @param {Socket} socket - Message that is going to be displayed
     */
    socket.emit("getAllUsers", null, updateUserList)
}

function updateUserList(users) {
     /**
     * updateUserList()
     * Update user list to display all users in list. Highlights own user.
     * @param {Object} users - Map of all users
     */
    // delete all list items
    userList.innerHTML = ''
    Object.keys(users).forEach(user => {
        let item = document.createElement('li');
        item.textContent = user;
        userList.appendChild(item)
    });
    highlightUserName()
}
