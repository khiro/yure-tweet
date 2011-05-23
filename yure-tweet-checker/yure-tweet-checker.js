var irc = require('irc');
var tweet_log_client = require('./tweet_log_client');
var shorter = require('./shorter');

var key = 'AIzaSyDXjrXrqpwBUmnhsL8s7DnD5GSHWQKYXbk';

var channel = '#CHANNEL';
var server = 'SERVER';
var name = 'NAME';

var bot = new irc.Client(server, name, {
  debug: true,
  password: 'PASSWORD',
  channels: [channel]
});

bot.addListener('error', function(message) {
  console.log('ERROR: ' + message.command + ': ' + message.args.join(' '));
});

var YURE_THRESHOLD = 10;
var INTERVAL = 60000; // mili sec
var latest_tweet_id = 0;

function check_tweet_log() {
  var client = new tweet_log_client.Client();
  //client.show_tables();

  if (latest_tweet_id == 0) {
    client.get_tweet(5, function(results) {
      latest_tweet_id = results[0].id;
      console.log(results[0].id);
    });
  } else {
    client.get_latest_tweet(latest_tweet_id, function(results) {
      console.log(results.length);
      if (results.length > 0) {
        latest_tweet_id = results[0].id;
      }
      if (results.length >= YURE_THRESHOLD) {
        // send messge to irc?
        var s = new shorter.Shorter();
        var url = 'http://yure.khiro.dotcloud.com/yuretweet?start_id='+ results[results.length-1].id + '&end_id=' + results[0].id;
        console.log(url);
        s.google(url, key, function(result) {
          console.log(url);
          bot.say(channel, results.length + ' yure tweet/min ' + result.id);
        });
        console.log('over threshold');
      }
      results.forEach( function (tweet) {
        // setup yure tweet list html
        console.log(tweet.ts + ' ' + tweet.screen_name + ' ' + tweet.tweet);
      });
    });
  }
  client.close();
}

//check_tweet_log();
var timer = setInterval(check_tweet_log, INTERVAL);
