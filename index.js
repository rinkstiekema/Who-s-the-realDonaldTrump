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

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public/views'))

//routes
app.get('/', (req, res) => {
  res.render('index')
})

let correct = 0;
let wrong = 0;
let fakeTrumpAccounts = ["realDonaldTumpf", "realdonalbtrump", "realDonaldTrody", "Plaid_DTrump", "realSportsTrump", "Writeintrump", "DonaldTrumph_", "DJarJarTrump"]

//twitter keys
var T = new Twit({
  consumer_key: 'YFPrRu0ynMMj360eNC2jd91mS',
  consumer_secret: 'dnwqyvnXONB1ef129N6JRBSsvWZGKNGPK8kCiAIdImlY6dW8RU',
  access_token: '1118092957402456066-T3NGbV0yeWBjBMzMwdwaPhagjsuw9A',
  access_token_secret: 'unbxJzG1sZoQFMwKItp5Su5jk9wMwHIH3tPKhrdLEEwlY'
})

//retrieve tweets
async function getOriginalTweets() {
  return await T.get('statuses/user_timeline', {count: 100, include_rts: false, tweet_mode: "extended", screen_name: "realDonaldTrump"}).then(tweets => tweets.data.map(tweet => tweet.full_text))
}

async function getFakeTweets() {
  promises = []
  randomTrumpAccounts = [pickRandom(fakeTrumpAccounts), pickRandom(fakeTrumpAccounts), pickRandom(fakeTrumpAccounts)]
  randomTrumpAccounts.forEach(account => {
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

async function getTweets() {
  originalTweets = await getOriginalTweets();
  fakeTweets = await getFakeTweets();
  return pickTweets([originalTweets, fakeTweets]);
}

io.on('connection', async (client) => {
  client.emit('points', {correct: correct, wrong: wrong})
  let tweets = await getTweets();
  client.emit('tweets', tweets.tweets);
  client.on('answer', async (answer) => {
    if(tweets.original == answer){
      correct += 1
      client.emit('correct', {correct: correct, wrong: wrong})
    } else {
      wrong += 1
      client.emit('wrong', {correct: correct, wrong: wrong})
    }
    tweets = await getTweets();
    client.emit('tweets', tweets.tweets);
  })
})

http.listen(port, () => {
  console.log(`App running on port ${port}!`)
})
