var options = ['1', '2', '3', '4']
var socket = io()

socket.on('tweets', function(tweets) {
	console.log(tweets)
	fillOptions(tweets)
})

socket.on('correct', function(newTweets) {
	console.log(newTweets)
	clearOptions()
	fillOptions(newTweets)
})

socket.on('wrong', function(msg) {
	console.log(msg)
})

function fillOptions(options) {
	for (let index = 0; index < options.length; index++) {
		var node = document.createElement('Button')
		node.onclick = function() {
			socket.emit('answer', options[index], options)
		}
		var textnode = document.createTextNode(options[index])
		node.appendChild(textnode)
		document.getElementById('options').appendChild(node)
	}
}

function clearOptions() {
	var options = document.getElementById('options')
	while (options.firstChild) {
		options.removeChild(options.firstChild)
	}
}
