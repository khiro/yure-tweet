var sys = require('sys');
var https = require('https');

exports.Shorter = Shorter;

function Shorter() {}

Shorter.prototype.google = function(longurl, key, callback) {
  var options = {
    host: 'www.googleapis.com',
    port: 443,
    path: '/urlshortener/v1/url',
    headers: {'Content-Type': 'application/json'},
    method: 'POST'
  };

  var req = https.request(options, function(res) {
    if (res.statusCode != 200)
      throw new Error("HTTP Status Code is not 200: " + res.statusCode);
    var data = '';
    res.on('data', function(d) {
      data += d;
    });
    res.on('error', function(e) {
      console.error(e);
    });
    res.on('end', function(e) {
      callback(JSON.parse(data));
    });
  })

  var payload = '{"longUrl":"' + longurl + '", "key":"' + key + '"}';
  req.write(payload);
  req.end();
};
