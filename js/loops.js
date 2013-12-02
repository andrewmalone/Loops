/*
- Add row volumes to playback and interface
- Volume envelopes (need to add some generic functions!)
- FX? (not yet?)

NEXT: Sequencing to interface, separate sequencing for bass

THEN:
	Master FX
	Track FX
	Drum FX
	WAV export
	Volume envelopes
	
ALSO:
	Tempo controls
	sharing (save to server)
*/

var context = new AudioContext(); // = new AudioContext();
var amp = context.createGain();
amp.connect(context.destination);

// Initialize things after the page loads
$(function(){
	// load the sounds
	// context = new AudioContext();
	loadSounds();
	
	// set up some audio stuff
	// this will all get moved
	//amp = context.createGain()
	//amp.connect(context.destination)
	
	// connect the buttons
	$("#play").addInteraction({
		click: start
	});
	
	$("#stop").addInteraction({
		click: stop
	});
	/*
	$("#addPattern").click(function() {
		// @todo - prevent duplicate names
		var name = $("#newPatternName").val();
		if (name != "")
		{
			addDrumPattern(name);
		}
	});
	$("#copyPattern").click(function() {
		var name = $("#newPatternName").val();
		if (name != "")
		{
			copyDrumPattern(name);
		}
	});
	$("#switchPattern").click(function() {
		switchDrumPattern($("#switch").val());
	});
	$("#addToSequence").click(addToSequenceList);
	*/
	// build the interface...
	initInterface();
	
	// add a default pattern
	addDrumPattern("p1")

});