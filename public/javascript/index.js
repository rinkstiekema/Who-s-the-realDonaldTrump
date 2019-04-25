//connecting to the namespace for the right region
var socket = io('/' + region)

//receiving the options
socket.on('tweets', function(tweets) {
  console.log(tweets)
  fillOptions(tweets)
})

//when the game is over
socket.on('winner', function(allTweets) {
  clearOptions()
  overview(allTweets)
  var streamSocket = io('/stream')
  //filling the feed with live tweets
  streamSocket.on('tweets', function(tweet) {
    console.log(tweet.user)
    console.log(tweet.text)
    var container = document.getElementById('twitStream')
    var tweetObject = document.createElement('div')
    var text = document.createElement('p')
    var textnode = document.createTextNode(tweet.text)
    text.appendChild(textnode)
    tweetObject.appendChild(text)
    container.appendChild(tweetObject)
  })
})

//on right answer
socket.on('correct', function(newTweets) {
  console.log(newTweets)
  clearOptions()
  fillOptions(newTweets)
})

//on wrong answer
socket.on('wrong', function(msg) {
  console.log(msg)
})

//when receiving points
socket.on('points', function(points) {
  updatePoints(points)
  console.log('points ', points)
})

//make buttons for each of the options
function fillOptions(options) {
  for (let index = 0; index < options.length; index++) {
    var container = document.createElement('div')
    var node = document.createElement('Button')
    node.onclick = function() {
      socket.emit('answer', options[index])
    }
    var textnode = document.createTextNode(options[index])
    node.appendChild(textnode)
    container.appendChild(node)
    document.getElementById('options').appendChild(container)
  }
}

//remove old DOM and add end display
function overview(tweets) {
  var twitStream = document.createElement('div')
  var trendOverview = document.createElement('div')
  document.getElementById('options').id = 'overview'
  document.getElementById('overview').appendChild(trendOverview)
  document.getElementById('overview').appendChild(twitStream)
  trendOverview.id = 'trendOverview'
  twitStream.id = 'twitStream'
  tweets.forEach(tweet => {
    console.log(tweet)
    var container = document.createElement('div')
    var name = document.createElement('p')
    var count = document.createElement('p')
    var textnodeName = document.createTextNode(tweet.name)
    var textnodeCount = document.createTextNode(tweet.tweet_volume)
    name.appendChild(textnodeName)
    count.appendChild(textnodeCount)
    container.appendChild(name)
    container.appendChild(count)
    trendOverview.appendChild(container)
  })
  document.getElementById('overview').appendChild(twitStream)
  document.getElementById('overview').appendChild(trendOverview)
}

//update points on screen
function updatePoints(points) {
  document.getElementById('points').innerText = points
}

//clear the options from the DOM
function clearOptions() {
  var options = document.getElementById('options')
  while (options.firstChild) {
    options.removeChild(options.firstChild)
  }
}
