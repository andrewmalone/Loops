/*
- Add row volumes to playback and interface
- Volume envelopes (need to add some generic functions!)
- FX? (not yet?)
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
	$("#play").click(start);
	$("#stop").click(stop);
	
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
	
	// build the interface...
	initInterface();
	
	// test bass sounds...
	for (var i = 25; i <= 50; i++)
	{
		var b = $("<button>");
		b.text(i);
		b.click(function() {
			var note = BASS_MAPPING[$(this).text()];
			// console.log(note.sample);
			playBassSound(buffers[note.sample], context.currentTime, .75, .5, note.pitch, note.tune)
		});
		$("#bass").append(b);
	}
	
	// add a default pattern
	addDrumPattern("p1")

});