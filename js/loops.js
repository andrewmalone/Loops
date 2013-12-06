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

//var offlineContext = new OfflineAudioContext(2, 2 * 44100, 44100);

// Initialize things after the page loads
$(function(){
	// load the sounds
	context.graph = createAudioGraph();
	loadSounds();

	// connect the buttons
	$("#play").addInteraction({click: start});
	$("#stop").addInteraction({click: stop});
	$("#render").addInteraction({click: render})
	$("#save").addInteraction({click: save})
	$("#fx").addInteraction({click: function() {
		$("#fx-panel").toggleClass("active");
	}})

	// build the interface...
	initInterface();
	
	// load a pattern depending on url params
	if (location.hash != "")
	{
		load();
	}
});