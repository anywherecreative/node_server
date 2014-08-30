var http = require('http');
var url = require('url');
var fs = require('fs');
var count = 0;
var error = false;
var pieces = new Array();
var server = http.createServer(function (request, res) {
	if (request.method == 'POST') {
		return res.end('send me a GET\n')
	}
	if(request.method == 'GET') {
		console.log('le request');
		var theurl = url.parse(request.url, true);
		if(theurl.pathname.indexOf('.php') != -1) { //php easter egg
			sendStatic(res,'./php.txt','text/plain',200,false);
		}
		if(theurl.pathname == '/' || theurl.pathname == '/index.html') {
			sendStatic(res,'./index.html');
		}
		if(theurl.pathname == '/about' || theurl.pathname == '/about.html') {
			sendStatic(res,'./about.html');
		}
		if(theurl.pathname == '/contact' || theurl.pathname == '/contact.html') {
			sendStatic(res,'./contact.html');
		}
		if(theurl.pathname == '/main.css') {
			sendStatic(res,'./css/main.css','text/css',200,false);
		}
		else {
			//page not found 
			sendStatic(res,'./404.html','text/html',404);
		}
	}
});

server.listen(8080);

function showError(res) {
	//we don't want to made calls to readFile here, since it may throw an additional error, putting us in a logic loop so 
	//a static web page will do
	res.writeHead(500, { 'Content-Type': 'text/html' })
	res.end('<html><head><title>Error</title><body><h1>Uh-Oh!</h1><p>It seems we have broken the interwebs!  The slacker responsible for letting this happen has been notified, and will be looking into this.</p></body></html>');
}

function sendStatic(res,file,contentType,statusCode,sendWrapper) {
	contentType = typeof contentType !== 'undefined' ? contentType : 'text/html';
	statusCode = typeof statusCode !== 'undefined' ? statusCode : 200;
	sendWrapper = typeof sendWrapper !== 'undefined' ? sendWrapper : true;
	//the file
	fs.readFile(file,function(err,data) {
		if(err) {
			showError(res);
		}
		else {
			staticCollect(data,1,contentType,res,statusCode,!sendWrapper);
		}
	});
	if(sendWrapper) {
		//header
		fs.readFile("./header.html",function(err,data) {
			if(err) {
				showError(res);
			}
			else {
				staticCollect(data,0,contentType, res,statusCode);
			}
		});
		//footer
		fs.readFile("./footer.html",function(err,data) {
			if(err) {
				showError(res);
			}
			else {
				staticCollect(data,2,contentType,res,statusCode);
			}
		});
	}
}
function staticCollect(data,pos,contentType,res,statusCode,shortCircut) {
	contentType = typeof contentType !== 'undefined' ? contentType : 'text/html';
	statusCode = typeof statusCode !== 'undefined' ? statusCode : 200;
	shortCircut = typeof shortCircut !== 'undefined' ? shortCircut : false;
	count++;
	pieces[pos] = data;
	if(shortCircut) {
		res.writeHead(statusCode, { 'Content-Type': contentType });
		res.end(data);
		count = 0;
		pieces = new Array();
	}
	if(count == 3 && error != true) {
		res.writeHead(statusCode, { 'Content-Type': contentType });
		res.end(pieces[0]+pieces[1]+pieces[2]);
		count = 0;
		pieces = new Array();
	}
	else if(count == 3) {
		error = false;
	}
}