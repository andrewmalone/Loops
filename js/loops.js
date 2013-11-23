var context; // = new AudioContext();
var amp;
//

// Initialize things after the page loads
$(function(){
	// load the sounds
	context = new AudioContext();
	loadSounds();
	
	// set up some audio stuff
	// this will all get moved
	amp = context.createGain()
	amp.connect(context.destination)
	
	// connect the buttons
	$("#play").click(start);
	$("#stop").click(stop);
	$("#addPattern").click(function() {
		// @todo - prevent duplicate names
		var name = $("#newPatternName").val();
		console.log(name);
		if (name != "")
		{
			addDrumPattern(name);
		}
	});
	$("#switchPattern").click(function() {
		switchDrumPattern($("#switch").val());
	});
	
	// build the interface...
	initInterface();
	
	// add a default pattern
	addDrumPattern("p1")
	
});