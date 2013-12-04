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
var amp = context.createGain();
amp.connect(context.destination);


// Initialize things after the page loads
$(function(){
	// load the sounds
	loadSounds();

	// connect the buttons
	$("#play").addInteraction({
		click: start
	});
	
	$("#stop").addInteraction({
		click: stop
	});
	$("#bass-btn").addInteraction({
		click: function() {
			switchPanel("bass-panel")
		}
	});
	$("#drum-btn").addInteraction({
		click: function() {
			switchPanel("drum-panel")
		}
	});

	// build the interface...
	initInterface();
});