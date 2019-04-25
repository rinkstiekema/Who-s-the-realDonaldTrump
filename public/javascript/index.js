//connecting to the namespace for the right region
var socket = io('/'+account)
var lastClicked

//receiving the options
socket.on('tweets', function(tweets) {
  fillOptions(tweets)
})

socket.on('points', function(points){
  updatePoints(points);
})

//on right answer
socket.on('correct', function(points) {
  updatePoints(points);
  colorAnswer(true)
})

//on wrong answer
socket.on('wrong', function(points) {
  updatePoints(points);
  colorAnswer(false)
})

//make buttons for each of the options
function fillOptions(options) {
  clearOptions();
  for (let index = 0; index < options.length; index++) {
    var container = document.createElement('div')
    var node = document.createElement('Button')
    node.onclick = function() {
      this.onclick = ""
      lastClicked = index
      socket.emit('answer', options[index])
    }
    node.id = index+"-button"
    var textnode = document.createTextNode(options[index])
    node.appendChild(textnode)
    container.appendChild(node)
    document.getElementById('options').appendChild(container)
  }
}

function colorAnswer(correct){
  document.getElementById(lastClicked+"-button").className = correct ? "correct" : "wrong";
}

//update points on screen
function updatePoints(points) {
  document.getElementById('points').innerText = "Total Correct: "+points.correct+" Total Wrong: "+points.wrong
}

//clear the options from the DOM
function clearOptions() {
  var options = document.getElementById('options')
  while (options.firstChild) {
    options.removeChild(options.firstChild)
  }
}

//clear livestream
function clearStream() {
  var stream = document.getElementById('twitStream')
  stream.innerHTML = ''
}
