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

function render()
{
	var tmpContext = context;
	// get the length
	context = new OfflineAudioContext(2, ((60/tempo)*4) * 44100, 44100);
	amp = context.createGain();
	amp.connect(context.destination);
	var stepTime = (60 / STEPS_PER_BEAT) / tempo;
	var steps = drumPatterns[currentDrumPattern].steps;
	var time = 0;
	
	for (var i = 0; i < 16; i++)
	{
		if (steps[0][i] == 1)
		{
			playDrumSound(buffers[SOUNDS[0].name], time, .8);
		}
		time += stepTime;
	}
	
	context.oncomplete = function(event) {
		console.log("done!", event);
		context = tmpContext;
		amp = context.createGain();
		amp.connect(context.destination);
	}
	
	context.startRendering();
}

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