"use strict";


// const http = require("http");

// const server = http.createServer(function (req, res) {
// 	res.end("Hello!");
// })

// server.listen(80, (err) => {
// 	if ( ! err) {
// 		console.log(`server is listening on 80`)
// 	}
// })


const http = require("http");

// websocket and http servers
var webSocketServer = require('websocket').server;


var history = [ ];
var clients = [ ];

function htmlEntities(str) {
  return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
colors.sort(function(a,b) { return Math.random() > 0.5; } );

// /**
//  * HTTP server
//  */
const server = http.createServer((req, res) => {
  res.end("Hello!");
});

server.listen(80, (err) => {
  if ( ! err ) {
        console.log((new Date()) + " Server is listening on port "
      + 80);
  }
});

/**
 * WebSocket server
 */
const wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info 
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

// // This callback function is called every time someone
// // tries to connect to the WebSocket server
wsServer.on('request', (request) => {
  console.log((new Date()) + ' Connection from origin '
      + request.origin + '.');

  // accept connection - you should check 'request.origin' to
  // make sure that client is connecting from your website
  // (http://en.wikipedia.org/wiki/Same_origin_policy)
  const connection = request.accept(null, request.origin);

  // we need to know client index to remove them on 'close' event
  const index = clients.push(connection) - 1;
  
  var userName = false;
  var userColor = false;
  
  console.log((new Date()) + ' Connection accepted.');
  
  // send back chat history
  if (history.length > 0) {
    connection.sendUTF(
        JSON.stringify({ type: 'chatHistory', data: history} ));
  }

  //user sent some message
  connection.on('message', (message) => {
    if (message.type === 'utf8') { // accept only text
    // first message sent by user is their name
     if (userName === false) {
        // remember user name
        userName = htmlEntities(message.utf8Data);

        // get random color and send it back to the user
        userColor = colors.shift();
        connection.sendUTF(
            JSON.stringify({ type:'color', data: userColor }));
        console.log((new Date()) + ' User is known as: ' + userName
                    + ' with ' + userColor + ' color.');
      } else { // log and broadcast the message
        console.log((new Date()) + ' Received Message from '
                    + userName + ': ' + message.utf8Data);
        
        // we want to keep history of all sent messages
        const obj = {
          time: (new Date()).getTime(),
          text: htmlEntities(message.utf8Data),
          author: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);

        // broadcast message to all connected clients
        const json = JSON.stringify({ type:'message', data: obj });
        clients.map(c => c.sendUTF(json))
      }
    }
  });

  // user disconnected
  connection.on('close', (connection) => {
    if (userName !== false && userColor !== false) {
      console.log((new Date()) + " Peer "
          + connection.remoteAddress + " disconnected.");
      // remove user from the list of connected clients
      clients.splice(index, 1);
      // push back user's color to be reused by another user
      colors.push(userColor);
    }
  });
});