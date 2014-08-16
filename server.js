var http = require('http');
var fs = require('fs');
var qs = require('querystring');
var request = require('request');
var cheerio = require('cheerio');

fs.readFile('./client.html', function (err, html) {
    if (err) {
        throw err; 
    }       
    http.createServer(function(req,res) { 
		if (req.method == 'GET')
		{	
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(html);  
			res.end();
		}
		
		if (req.method == 'POST' && req.url == '/api/links')
		{
			console.log('post request to /api/links');
			data = '';
			req.on('data', function(chunk)
			{
				data += chunk;
			});
			req.on('end', function()
			{
				var json = qs.parse(data);
				if (json.url)
				{
					getLinksInWebPage(json.url,res);
				}
			});
		}
    }).listen(9000);
});

console.log('Server running at http://127.0.0.1:9000/');


function getLinksInWebPage(url,res)
{
	var linksJson = {};
	request(url, function(err, resp, body){
		if (!err)
		{
			$ = cheerio.load(body);
			links = $('a'); //jquery get all hyperlinks
			linksText = [];
			$(links).each(function(i, link){
				linksText.push($(link).attr('href'));
			});
			var linksJsonArr = JSON.stringify(linksText);
			linksJson['links'] = linksJsonArr;
			writeLinksTofile(url,linksJsonArr);
			res.writeHeader(200, {"Content-Type": "text/html"});  
			res.write(JSON.stringify(linksJson));
			res.end();
		}
		else
		{
			res.writeHeader(500, {"Content-Type": "text/html"});  
			res.write('error has occurred');
			res.end();
		}
	});
}

function writeLinksTofile(url,links)
{
	var contents = fs.writeFile('url.txt', url +':\n' + links,
		function(error){
			console.log("written file");
  }
 );
}