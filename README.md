#chat-ws
chat-ws (chat websocket) works with my [chat-fe](https://github.com/MartinClement/chat-fe/) project

This is a simple node server using websocket package.

## Pull and Start

If NodeJs you have NodeJs installed, just push then run : 
```
npm install
node chat-ws.js
```

By default the socket listens on port `80`


## Deploy

You can deploy the server on [openode.io](https://openode.io)
Once you registered just run :
```
npm install -g openode
openode template node-minimal
openode deploy
