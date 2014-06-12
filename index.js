var express = require('express'),
	fs = require('fs'),
	md5 = require('MD5');

var app = express(),
	peerList = {};

app.use(express.static(process.cwd() + '/public'));

app.on("render:index", function(encoding, req, res) {
	fs.readFile(__dirname+"/views/index.html", encoding, function(err, html) {
		res.contentType("text/html");
		res.send(200, html);
	});	
});

app.on("render:index1", function(encoding, req, res) {
	fs.readFile(__dirname+"/views/index1.html", encoding, function(err, html) {
		res.contentType("text/html");
		res.send(200, html);
	});	
});

app.on("render:getStreamers", function(encoding, req, res) {
	var streamers = JSON.stringify(peerList);
	res.contentType("application/json");
	res.send(200, streamers);	
});

app.get("/streamers", function(req, res, next) {

	app.emit("render:getStreamers", "UTF-8", req, res);

});

app.get("/", function(req, res, next) {

	app.emit("render:index", "UTF-8", req, res);

});

app.get("/1", function(req, res, next) {

	app.emit("render:index1", "UTF-8", req, res);

});

app.listen(process.env.PORT || 2000);

/*
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({port: 9000, path: '/myapp'});

server.on('connection', function(id) {
	
	peerList[id] = Date.now();

});

server.on('disconnect', function(id) {

	delete peerList[id];

});
*/
