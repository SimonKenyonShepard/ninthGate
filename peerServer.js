var peerPort = 9000;

var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: peerPort, path: '/myapp'});