context = new AudioContext();

var amp = null;
//

// Initialize things after the page loads
$(function(){
	// load the sounds
	loadSounds();
	
	// set up some audio stuff
	// this will all get moved
	amp = context.createGain()
	amp.connect(context.destination)
	
	// connect the buttons
	$("#play").click(start);
	$("#stop").click(stop);
	
});