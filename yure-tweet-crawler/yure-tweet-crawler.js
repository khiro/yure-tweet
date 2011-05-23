var mysql = require('mysql');
var sys = require('sys');
var twitternode = require('twitter-node');

var twit = new twitternode.TwitterNode({
  user: 'USER',
  password: 'PASSWORD',
  track: ['ゆれ', 'ゆれてる', 'ゆれた', '揺れ', '揺れてる', '揺れた']
//  track: ['test']
});

var host = 'HOST';
var port = 1234;
var db = 'DB';
var user = 'USER';
var dbpasswd = 'PASSWORD';
var table = 'TABLE';

var client = new mysql.Client();
client.host = host;
client.port = port;
client.database = db;
client.user = user;
client.password = dbpasswd;
client.connect();

// CREATE TABLE `tweet_table` (
//  `id` int(11) NOT NULL AUTO_INCREMENT,
//  `ts` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
//  `user_id` int(100) DEFAULT NULL,
//  `screen_name` varchar(255) DEFAULT NULL,
//  `tweet` varchar(255) DEFAULT NULL,
//  `tweet_id` int(200) DEFAULT NULL,
//  `raw_data` text,
//  PRIMARY KEY (`id`)
//) ENGINE=InnoDB DEFAULT CHARSET=utf8 |

twit.addListener('tweet', function(tweet) {
  //console.log(sys.inspect(tweet));
  tweet_text = tweet.user.id + ' ' + tweet.user.screen_name + ': ' + tweet.text + ' ' + tweet.id;
  sys.puts("TWEET: " + tweet_text);

  client.query(
    'INSERT INTO ' + table + ' '+
    'SET user_id = ?, screen_name = ?, tweet = ?, tweet_id = ?, raw_data = ?',
    [tweet.user.id, tweet.user.screen_name, tweet.text, tweet.id, JSON.stringify(tweet)]
  );
});

twit.addListener('limit', function(limit) {
  sys.puts("LIMIT: " + sys.inspect(limit));
});

twit.addListener('delete', function(del) {
  sys.puts("DELETE: " + sys.inspect(del));
});

twit.addListener('end', function(resp) {
  sys.puts("wave goodbye... " + resp.statusCode);
  twit.stream();
});

twit.stream();
