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
  res.redirect('/menu')
})

app.get('/menu', (req, res) => {
  res.render('menu')
})

app.get('/game', (req, res) => {
  res.render('index')
})

//twitter keys
var T = new Twit({
  consumer_key: 'YFPrRu0ynMMj360eNC2jd91mS',
  consumer_secret: 'dnwqyvnXONB1ef129N6JRBSsvWZGKNGPK8kCiAIdImlY6dW8RU',
  access_token: '1118092957402456066-T3NGbV0yeWBjBMzMwdwaPhagjsuw9A',
  access_token_secret: 'unbxJzG1sZoQFMwKItp5Su5jk9wMwHIH3tPKhrdLEEwlY'
})

var tweets
var areaCode = '23424909'
getTrendsForCountry(areaCode)
//retrieve tweets
function getTrendsForCountry(areaCode) {
  T.get('trends/place', { id: areaCode }, function(err, data, response) {
    tweetsWithVolume = data[0].trends.filter(tweet => tweet.tweet_volume)
    tweets = tweetsWithVolume
  })
}

//on connection
io.on('connection', client => {
  var points = 0
  console.log('new connection')
  //get all trends for this client
  var clientTweets = tweets
  //take 4 of those
  var personalTweets = helpers.getRandom(clientTweets, 4)
  //send the name of those 4 to client and remove from all tweets
  client.emit('tweets', personalTweets.map(tweet => tweet.name))
  clientTweets = clientTweets.filter(value => !personalTweets.includes(value))
  //receive answer
  client.on('answer', answer => {
    //check if answer is right or wrong
    var pick = personalTweets.find(tweet => tweet.name == answer)
    var highest = helpers.getMax(personalTweets)
    //if right
    if (pick.tweet_volume >= highest) {
      client.emit('points', (points += 3))
      //take pick from all tweets and from the 4 options
      clientTweets = clientTweets.filter(value => value != pick)
      personalTweets = personalTweets.filter(value => value != pick)
      //take a new tweet
      var newTweet = helpers.getRandom(clientTweets, 1)[0]
      //check if game is over
      if (newTweet == 'none') {
        //check if there are any options left
        if (personalTweets.length >= 1) {
          personalTweets = personalTweets.filter(value => value != pick)
          client.emit('correct', personalTweets.map(tweet => tweet.name))
          return
          //if no options left
        } else {
          client.emit('winner')
          return
        }
      }
      //remove new tweet from the total tweets
      clientTweets = clientTweets.filter(value => value.name != newTweet.name)
      //add it to options
      personalTweets.push(newTweet)
      //send new tweets to client
      client.emit('correct', personalTweets.map(tweet => tweet.name))
      //on wrong answer
    } else {
      client.emit('wrong', answer)
      if (points > 0) {
        client.emit('points', (points -= 1))
      }
    }
  })
  //on disconnect
  client.on('disconnect', () => console.log('closed connection'))
})

http.listen(port, () => {
  console.log(`App running on port ${port}!`)
})

var helpers = {
  //https://stackoverflow.com/questions/19269545/how-to-get-n-no-elements-randomly-from-an-array
  getRandom: function getRandom(arr, n) {
    var result = new Array(n),
      len = arr.length,
      taken = new Array(len)
    if (n > len) return ['none']
    while (n--) {
      var x = Math.floor(Math.random() * len)
      result[n] = arr[x in taken ? taken[x] : x]
      taken[x] = --len in taken ? taken[len] : len
    }
    return result
  },
  //get maximum tweet volume
  getMax: array => {
    var valuesArray = array.map(option => option.tweet_volume)
    return Math.max(...valuesArray)
  }
}
