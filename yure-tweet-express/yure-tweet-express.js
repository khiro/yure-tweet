var express = require('express');
var tweet_log_client = require('./tweet_log_client');
var app = express.createServer(express.bodyParser());

app.register('.html', require('ejs'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var title = '';
var messages = [];
var latest_tweet_number = 50;

app.dynamicHelpers({
  title: function(req) {
    return title;
  },
  messages: function(req) {
    return messages;
  },
});

function embeddedTweet(tweet) {
  if (tweet.error)
    return tweet.error;

  var tweet_data = {
    id : tweet.user.id,
    screen_name : tweet.user.screen_name,
    name : tweet.user.name,
    background_url : tweet.user.profile_background_image_url,
    profile_url : tweet.user.profile_image_url,
    source : tweet.source,
    timestamp : tweet.created_at.substr(0,tweet.created_at.indexOf('+')),
    content : tweet.text,
    profile_background_color : tweet.user.profile_background_color,
    permalink : "http://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str
  };

  var textbody = "<style type='text/css'>.bbpBox{background:url({background_url})#{profile_background_color};padding:20px;}</style>"
  + "<div id='tweet_{id}' class='bbpBox' style='background:url({background_url})#{profile_background_color};padding:20px;'>"
  + "<p class='bbpTweet' style='background:#fff;padding:10px 12px 10px 12px;margin:0;min-height:48px;color:#000;font-size:16px !important;line-height:22px;-moz-border-radius:5px;-webkit-border-radius:5px;'>"
  + "{content}<span class='{timestamp}' style='font-size:12px;display:block;'><a title='{timestamp}'"
  + "href='{permalink}'>{timestamp}</a> via {source}</span>"
  + "<span class='metadata' style='display:block;width:100%;clear:both;margin-top:8px;padding-top:12px;height:40px;border-top:1px solid #fff;border-top:1px solid #e6e6e6;'>"
  + "<span class='author' style='line-height:19px;'><a href='http://twitter.com/{screen_name}'>"
  + "<img src='{profile_url}' style='float:left;margin:0 7px 0 0px;width:38px;height:38px;' />"
  + "</a><strong><a href='http://twitter.com/{screen_name}'>{name}</a></strong><br/>{screen_name}"
  + "</span></span></p></div>"

  textbody = textbody.replace(/{[^{}]+}/g, function(key){
    return tweet_data[key.replace(/[{}]+/g, "")] || "";
  });
  return textbody;
}


// show latest yure tweet
app.get('/', function(req, res) {
  var client = new tweet_log_client.Client();
  title = 'Latest Yure Tweet';
  client.get_tweet(latest_tweet_number, function(results) {
    console.log(results[0].id);
    //messages = results;
    client.close();
  
    messages = []; 
    results.forEach( function(result) {
      tweet = JSON.parse(result.raw_data);
      messages.push(embeddedTweet(tweet));
    });
    res.render('index');
  });
});

// show specific yure tweet start id and end id
app.get('/yuretweet', function(req, res) {
  console.log(req.query.start_id);
  if (req.query.start_id == undefined || req.query.end_id == undefined) {
    res.redirect('/');
    return;
  }

  var start_id = req.query.start_id;
  var end_id = req.query.end_id
  if (start_id.match(/^[0-9]{1,29}$/i) && end_id.match(/^[0-9]{1,29}$/i)) {
    if (Number(start_id) > Number(end_id)) {
      res.redirect('/');
      return;
    }

    var client = new tweet_log_client.Client();
    client.get_range_tweet(start_id, end_id, function(results) {
      if (results[0] == undefined) {
        res.redirect('/');
        return;
      }
      console.log(results[0].id);
      console.log(results.length);
      title = 'Latest ' +  results.length + ' Yure Tweet';
      //messages = results;
      client.close();
      messages = []; 
      results.forEach( function(result) {
        tweet = JSON.parse(result.raw_data);
        messages.push(embeddedTweet(tweet));
      });
      res.render('index');
    });
  } else {
    res.redirect('/');
  }
});


app.listen(8080);
console.log('Express app started on port 8080');
//var timer = setInterval(function() {console.log('timer')}, 1000);
