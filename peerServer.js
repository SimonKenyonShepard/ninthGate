var peerPort = process.env.PORT || 9000;
console.log("server not create yet");
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: peerPort, path: '/myapp'});
console.log("server created");