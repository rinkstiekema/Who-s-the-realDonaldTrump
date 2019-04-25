var Twit = require('twit')
const express = require('express')
const app = express()
const http = require('http').Server(app)

var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

const io = require('socket.io')(http)

const path = require('path')

const port = process.env.PORT || 7070

let twitterAccounts = {
  realDonaldTrump: ["realDonaldTumpf", "realdonalbtrump", "realDonaldTrody", "Plaid_DTrump", "realSportsTrump", "Writeintrump", "DonaldTrumph_", "DJarJarTrump"],
  elonmusk: ["EvilonMusk", "BoredElonMusk", "NotElonMsuk"]
}

let scores = {
  realDonaldTrump: {correct: 0, wrong: 0},
  elonmusk: {correct: 0, wrong: 0}
};

let correct = 0;
let wrong = 0;

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public/views'))

//routes
app.get('/:account', (req, res) => {
  let account = req.params.account;
  res.render('index', {account: account})
})

//twitter keys
var T = new Twit({
  consumer_key: 'YFPrRu0ynMMj360eNC2jd91mS',
  consumer_secret: 'dnwqyvnXONB1ef129N6JRBSsvWZGKNGPK8kCiAIdImlY6dW8RU',
  access_token: '1118092957402456066-T3NGbV0yeWBjBMzMwdwaPhagjsuw9A',
  access_token_secret: 'unbxJzG1sZoQFMwKItp5Su5jk9wMwHIH3tPKhrdLEEwlY'
})

//retrieve tweets
async function getOriginalTweets(account) {
  return await T.get('statuses/user_timeline', {count: 100, include_rts: false, tweet_mode: "extended", screen_name: account}).then(tweets => tweets.data.map(tweet => tweet.full_text))
}

async function getFakeTweets(account) {
  promises = []
  randomAccounts = [pickRandom(twitterAccounts[account]), pickRandom(twitterAccounts[account]), pickRandom(twitterAccounts[account])]
  randomAccounts.forEach(account => {
    promises.push(T.get('statuses/user_timeline', {count: 100, include_rts: false, tweet_mode: "extended", screen_name: account}).then(tweets => tweets.data.map(tweet => tweet.full_text)))
  })
  return await Promise.all(promises)
}

function pickRandom(ar){
  return ar[Math.floor(Math.random() * ar.length)]
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array
}

function pickTweets(tweets) {
  originalTweets = tweets[0]
  fakeTweets = tweets[1]
  result = []
  result.push(pickRandom(originalTweets))
  fakeTweets.forEach(tweets => {
    result.push(pickRandom(tweets));
  })
  return {original: result[0], tweets: shuffleArray(result)};
}

async function getTweets(account) {
  originalTweets = await getOriginalTweets(account);
  fakeTweets = await getFakeTweets(account);
  return pickTweets([originalTweets, fakeTweets]);
}

Object.keys(twitterAccounts).forEach(account => {
  let nsp = io.of('/'+account)
  nsp.on('connection', async (client) => {
    client.emit('points', scores[account])
    let tweets = await getTweets(account);
    client.emit('tweets', tweets.tweets);
    client.on('answer', async (answer) => {
      if(tweets.original == answer){
        scores[account].correct += 1;
        client.emit('correct', scores[account])
      } else {
        scores[account].wrong += 1
        client.emit('wrong', scores[account])
      }
      tweets = await getTweets(account);
      client.emit('tweets', tweets.tweets);
    })
  })
});

http.listen(port, () => {
  console.log(`App running on port ${port}!`)
})
