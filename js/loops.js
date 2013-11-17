// Set up the global audio context
if (typeof AudioContext !== "undefined") {
    context = new AudioContext();
} else if (typeof webkitAudioContext !== "undefined") {
    context = new webkitAudioContext();
} else {
   // @todo some kind of graceful fail needs to go here
}

var amp = null;

// Initialize things after the page loads
$(function(){
	// load the sounds
	loadSounds();
	
	// set up some audio stuff
	// this will all get moved
	amp = context.createGainNode()
	amp.connect(context.destination)
	
	// connect the buttons
	$("#play").click(start);
	
	$("#stop").click(stop);
	
	loadBass();
});