# StarChat

StarChat is a simple live chat application supporting token authentication, private messaging and multiple users. And everybody is a character from the Star Wars™ universe!

The application consists of two parts, a server and a client. The two parties communicate with each other using socket.io and the websocket protocol.

Every connection is secured with a static JWT, which is provided in the src/static/client.js file and is the same for every client socket. If you want to find out what happens to unauthorized users, try adding a space or something to the token in the client file.


## Installation

Tested with node.js v17.7.1

Use npm to install the requirements:

```bash
npm install
```

## Configuration

### Port
By default the app runs on PORT 4000 on localhost. The port can be changed by editing the `start` script in the package.json file.

### Secret
It is recommended to change the app secret by editing the `mySecret` constant in server.js. It is important to note that if you do that however, the token used in client.js has to be changed as well. [jwt.io](https://jwt.io/) is a good place to generate a custom JWT.

## Usage

```bash
npm run start
```

Now point the browser to [http://localhost:4000](http://localhost:4000) and play around!

### Username

Every new connecting socket is given a name from the Star Wars universe. In a next version it might be possible to change that name, for now you have to reconnect to get a new name.


### Send messages
Just type into the message bar and press the  `Send` button.


### Private messages
Type `/<Receiving User Name>` into the message bar. The other users won't see the message, only the receiver
Example:

```
/Darth Maul Don't disappoint me Darth Maul
/Anakin Skywalker Hey! Don't kill so many children next time, ok?
```

What makes controlling the Empire and crushing rebel forces easier than simple, secure and private communication? That is the power of StarChat!

### Connect and disconnect messages
Whenever a user enters or leaves the chat room, every other user receives a notification message. This way nobody can sneak in and overhear important discussions without the others knowing.

## Todo

Features for a future version:
- Error message when private msg receiver does not exist
- More helpful welcome message with actual help (for example for welcome message)
- Persistent chat log
- _...is writing_ indicator
- Admin functions like `/kick`
- Autocomplete for private messages
- Chat bots

## License
[MIT](https://choosealicense.com/licenses/mit/)