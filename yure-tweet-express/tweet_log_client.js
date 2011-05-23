var mysql = require('mysql');

exports.Client = Client;

function Client() {
  var host = 'HOST';
  var port = 1234;
  var db = 'DB';
  var user = 'USER';
  var dbpasswd = 'PASSWORD';
  this.table = 'TABLE';

  this.client = new mysql.Client();
  this.client.host = host;
  this.client.port = port;
  this.client.database = db;
  this.client.user = user;
  this.client.password = dbpasswd;

  this.client.connect();
}

// https://github.com/felixge/node-mysql
Client.prototype.show_tables = function () {
  this.client.query(
    'SHOW TABLES',
    function (err, results, fields) {
      console.log(results);
    });
}

Client.prototype.all_data = function () {
  this.client.query(
    'SELECT * FROM ' + table,
    function (err, results, fields) {
      if (err)
        throw err;
    
      console.log(results);
      console.log(fields);
    });
}

Client.prototype.get_tweet = function (limit, cb) {
  this.client.query(
    'SELECT * FROM ' + this.table + ' order by id desc limit ' + limit,
    function (err, results, fields) {
      if (err)
        throw err;
      cb(results);
      //console.log(fields);
    });
}

Client.prototype.get_latest_tweet = function (id, cb) {
  this.client.query(
    'SELECT * FROM ' + this.table + ' where id > ' + id + ' order by id desc',
    function (err, results, fields) {
      if (err)
        throw err;
      cb(results);
      //console.log(fields);
    });
}

Client.prototype.get_range_tweet = function (start_id, end_id, cb) {
  this.client.query(
    'SELECT * FROM ' + this.table + ' where id <= ' + end_id + ' and id >= ' + start_id + ' order by id desc',
    function (err, results, fields) {
      if (err)
        throw err;
      cb(results);
      //console.log(fields);
    });
}


Client.prototype.close = function() {
  this.client.end();
}