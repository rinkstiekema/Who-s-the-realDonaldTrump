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

app.get('/', (req, res) => {
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

//retrieve tweets
T.get('trends/place', { id: '23424909' }, function(err, data, response) {
	tweetsWithVolume = data[0].trends.filter(tweet => tweet.tweet_volume)
	tweets = tweetsWithVolume
})

io.on('connection', client => {
	var clientTweets = tweets
	console.log('new connection')
	//send 4 random tweets to client
	var personalTweets = helpers.getRandom(clientTweets, 4)

	client.emit('tweets', personalTweets.map(tweet => tweet.name))
	client.on('answer', answer => {
		//check if answer is right
		var pick = personalTweets.find(tweet => tweet.name == answer)
		var highest = helpers.getMax(personalTweets)
		console.log('personalTweets = ', personalTweets)
		console.log('pick = ', pick)
		console.log('highest = ', highest)
		if (pick.tweet_volume >= highest) {
			clientTweets = clientTweets.filter(value => value != pick)
			console.log('clientTweets = ', clientTweets)
			personalTweets = personalTweets.filter(value => value != pick)
			console.log('personalTweets = ', personalTweets)
			var newTweet = helpers.getRandom(clientTweets, 1)[0]
			if (newTweet == 'winner') {
				client.emit('winner')
				return
			}
			console.log('newTweet = ', newTweet)
			personalTweets.push(newTweet)
			console.log('personalTweets = ', personalTweets)
			client.emit('correct', personalTweets.map(tweet => tweet.name))
			//code to assign points here
		} else {
			client.emit('wrong', answer)
		}
	})

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
		if (n > len) return ['winner']
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
	},
	filter: (array, filter) => array.filter(tweet => tweet.name !== filter)
}
