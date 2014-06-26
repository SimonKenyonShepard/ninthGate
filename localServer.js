var express = require('express'),
	fs = require('fs');

var app = express(),
	peerList = {},
	webPort = process.env.PORT || 2000;

app.use(express.static(process.cwd() + '/public'));

app.on("render:index", function(encoding, req, res) {
	fs.readFile(__dirname+"/views/index.html", encoding, function(err, html) {
		res.contentType("text/html");
		res.send(200, html);
	});	
});

app.get("/", function(req, res, next) {

	app.emit("render:index", "UTF-8", req, res);

});

app.listen(webPort);