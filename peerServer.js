var peerPort = process.env.PORT || 9000;

var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: peerPort, path: '/myapp'});
console.log("server created");