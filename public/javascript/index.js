var socket = io()

socket.on('tweets', function(tweets) {
  console.log(tweets)
  fillOptions(tweets)
})

socket.on('winner', function() {
  console.log('game over')
})

socket.on('correct', function(newTweets) {
  console.log(newTweets)
  clearOptions()
  fillOptions(newTweets)
})

socket.on('wrong', function(msg) {
  console.log(msg)
})

socket.on('points', function(points) {
  updatePoints(points)
  console.log('points ', points)
})

function fillOptions(options) {
  for (let index = 0; index < options.length; index++) {
    var node = document.createElement('Button')
    node.onclick = function() {
      socket.emit('answer', options[index])
    }
    var textnode = document.createTextNode(options[index])
    node.appendChild(textnode)
    document.getElementById('options').appendChild(node)
  }
}

function updatePoints(points) {
  document.getElementById('points').innerText = points
}

function clearOptions() {
  var options = document.getElementById('options')
  while (options.firstChild) {
    options.removeChild(options.firstChild)
  }
}
