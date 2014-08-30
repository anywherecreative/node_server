var http = require('http');
var fs = require('fs');
var url = require('url');
var websiteDir = "./site";
//a json array of mime types
var mimeTable = {
	'html':'text/html',
	'txt':'text/plain',
	'css':'text/css',
	'js':'text/javascript',
	'jpg':'image/jpeg',
	'jpeg':'image/jpeg',
	'gif':'image/gif',
	'png':'image/png',
	'bmp':'image/bmp'
}
var server = http.createServer(function (request, res) {
	if(request.method == 'GET') {
		console.log('le request'); //log the request
		fillRequest(url.parse(request.url, true).pathname,res); //get the raw content, and mime
	}
});
server.listen(8080);

function fillRequest(url,res) {
	var mime = 'text/html';
	var HTTPcode = 200;
	if(url == "/") {
		url = "/index.html"; //default file
	}
	fs.readFile('./site'+url,function(err,data) {
		if(err) {
			//couldn't get the file so we'll send back 404
			HTTPcode = 404;
			var badChar = new Array("&","<",">"); //ampersan (&) needs to go first, to avoid double escape
			var goodChar = new Array("&amp;","&lt;","&gt;");
			var friendlyUrl = url;
			for(var a = 0;a < badChar.length;a++) {
				friendlyUrl = friendlyUrl.replace(badChar[a],goodChar[a]);
			}
			data =  "<h1>Where could it have gone??</h1>\
			<p>Well.. we couldn't find " + friendlyUrl + " anywhere on this fine server, and we're dearly sorry. So instead have a cactus</p>\
			<p><img src=\"http://anywhere-apps.com/images/cactus.png\" /></p>";
		}
		else {
			if(url.lastIndexOf(".") != -1) {
				var ext = url.substring(url.lastIndexOf(".")+1);
				if(ext in mimeTable) {
					mime = mimeTable[ext];
				}
				else {
					console.log(ext);
				}
			}
		}
		if(mime == 'text/html') {
			data = loadWrapper(data);
		}
		res.writeHead(HTTPcode, { 'Content-Type': mime });
		res.end(data);
	});
	
}
function loadWrapper(content) {
	return fs.readFileSync("./header.html","utf-8") + content + fs.readFileSync("./footer.html","utf-8");
}