/**
 * sequencer.js
 *
 * functions for looping and audio playback
 */

// set some global variables
// number of steps
// @todo Add better comments here
var BEATS_PER_MEASURE = 4;
var STEPS_PER_BEAT = 4;
var NUMSTEPS = BEATS_PER_MEASURE * STEPS_PER_BEAT;
var NUMPATTERNS = 8;
var SEQUENCE_LENGTH = 16;

// create a default empty drum pattern
var drumPatterns = [];
var bassPatterns = [];
for (var i = 0; i < NUMPATTERNS; i++)
{
	drumPatterns.push(createDrumPattern());
	bassPatterns.push(createBassPattern());
}

// modes for switching loop/sequence
var bassMode = "loop";
var drumMode = "loop";

// initialize the sequences
var drumSequence = [0];
var drumSequencePosition = 0;
var bassSequence = [0];
var bassSequencePosition = 0;

// set the current pattern to the default
var currentDrumPattern = 0;
var currentBassPattern = 0;

var currentStep = 0;
var scheduleAhead = .1 // buffer in seconds, to set ahead 
// variable used for requestAnimate
var looper = null;
var tempo = 120;
var nextStepTime = 0;
//var queue = []; // used to match up the drawing timing with the sound
//var lastStepDrawn = -1;
var scheduledSounds = [];

// shim for cross browser requestAnimationFrame
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();
window.cancelAnimFrame = (function(){
	return window.cancelAnimationFrame ||
	window.webkitCancelAnimationFrame;
})();

/**
 *	Starts the sequencer
 */
function start()
{
	// INIT FOR iOS
	// @todo - see if this can be refactored
	var s = context.createBufferSource();
	s.buffer = buffers[SOUNDS[0].name];
	var volume = context.createGain();
	volume.gain.value = 0;
	s.connect(volume);
	volume.connect(context.graph.in["drum"]);
	s.start(0);
	nextStepTime = context.currentTime;
	
	// switch to the first sequence position if in sequence mode...
	if (drumMode == "sequence")
	{
		drumSequencePosition = 0;
		setActiveSequence(0, "drum");
		switchActivePattern(drumSequence[0], "drum");
	}
	if (bassMode == "sequence")
	{
		bassSequencePosition = 0;
		setActiveSequence(0, "bass");
		switchActivePattern(bassSequence[0], "bass");
	}
	looper = requestAnimFrame(loop);
}

/**
 *	Stops the sequencer and resets to position 0
 */
function stop()
{
	cancelAnimFrame(looper);
	currentStep = 0;
	scheduledSounds = [];
	$(".sequence .active").removeClass("active");
}

/**
 *	Schedules an individual sound for playback
 */
function playDrumSound(buffer, time, volume)
{
	var source = context.createBufferSource();
	source.buffer = buffer;
	
	var v = context.createGain();
	v.gain.value = volume;
	// @todo - Figure out exponential volume curve!
	
	source.connect(v);
	v.connect(context.graph.in["drum"])
	source.start(time);
	scheduledSounds.push(source);	
}

function playBassSound(buffer, time, volume, duration, pitch, tune)
{
	// var now = context.currentTime;
	var source = context.createBufferSource();
	source.buffer = buffer;
	var v = context.createGain();
	v.gain.value = volume;
	v.gain.setTargetAtTime(0, time + duration, .005);
	source.connect(v);
	v.connect(context.graph.in["bass"]);
	// @todo - comment this formula (or move to a constant);
	var step = .059463094359295;
	source.playbackRate.value = 1 + (step/100 * tune) + (step * pitch);
	source.start(time);
	source.stop(time + duration + .1);
}

/**
 *	Main loop controller
 */
function loop()
{
	looper = requestAnimFrame(loop);
	var steps = drumPatterns[currentDrumPattern].steps;
	var volumes = drumPatterns[currentDrumPattern].volumes;
	var bass = bassPatterns[currentBassPattern];
	var stepTime = (60 / STEPS_PER_BEAT) / tempo;
	
	// clean up the scheduledSounds array for anything that has finished playing...
	// @todo refactor so this makes sense - also remove the duplicate length calls
	for (var i = scheduledSounds.length;i-- > 0;) 
	{
		if (scheduledSounds[i].playbackState == 3) 
		{
			scheduledSounds.splice(i,1);
		}
	}	
	
	// schedule any upcoming sounds
	while (nextStepTime < context.currentTime + scheduleAhead) 
	{	
		// Drum sounds
		for (var i = 0, len_i = SOUNDS.length; i < len_i; i++) 
		{
			var name = SOUNDS[i].name;
			if (steps[i][currentStep] == 1) 
			{				
				// check for mute groups
				if (buffers[name]._mute != null) 
				{
				
					for (var j = 0, len_j = scheduledSounds.length; j < len_j; j++) 
					{
						if (scheduledSounds[j].buffer._mute == buffers[name]._mute) 
						{
							scheduledSounds[j].stop(nextStepTime + 5/tempo);
							// @todo is this extra time padding needed?	
						}
					}
				}
				
				// schedule the sound
				// playSound(buffers[name], nextStepTime, volumes[i][currentStep] * rowVolumes[i]);
				playDrumSound(buffers[name], nextStepTime, volumes[i][currentStep]);
			}
		}
		
		// check for the bass...
		if (bass[currentStep].note != 0)
		{
			// play the note...
			var note = BASS_MAPPING[bass[currentStep].note];
			playBassSound(
				buffers[note.sample],
				nextStepTime,
				bass[currentStep].volume,
				bass[currentStep].duration * stepTime,
				note.pitch,
				note.tune
			);
		}
		
		
		// move to the next step
		// queue.push({note:currentStep,time:nextStepTime})
		// beats/minute
		// how long is a beat?
		// 60/tempo
		// how long is a measure?
		// (60/tempo)*4
		// calculate the next step based on the current tempo...
		 
		nextStepTime += stepTime; 
		currentStep++;
		if (currentStep == NUMSTEPS) {
			currentStep = 0;
			// switch patterns if in sequence mode
			if (drumMode == "sequence")
			{
				drumSequencePosition = (drumSequencePosition + 1) % drumSequence.length;
				if (drumSequence[drumSequencePosition] == null)
				{
					drumSequencePosition = 0;
				}
				// currentDrumPattern = sequence[sequencePosition];
				setActiveSequence(drumSequencePosition, "drum");
				switchActivePattern(drumSequence[drumSequencePosition], "drum");
			}
			
			if (bassMode == "sequence")
			{
				bassSequencePosition = (bassSequencePosition + 1) % bassSequence.length;
				if (bassSequence[bassSequencePosition] == null)
				{
					bassSequencePosition = 0;
				}
				// currentDrumPattern = sequence[sequencePosition];
				setActiveSequence(bassSequencePosition, "bass");
				switchActivePattern(bassSequence[bassSequencePosition], "bass");
			}
		}
	}
}

/**
* creates and returns a measure object for the sequencer to use
* currently only for steps...
*/
function createDrumMeasure(initValue)
{
	var measure = [];
	for (var i = 0, len = SOUNDS.length; i < len; i++)
	{
		var row = [];
		for (j = 0; j < NUMSTEPS; j++)
		{
			row[j] = initValue;
		}
		measure[i] = row;
	}
	return measure;
}

function createDrumPattern(name)
{
	// create a new object...
	var pattern = {
		steps: createDrumMeasure(0),
		volumes: createDrumMeasure(.8),
		rowVolumes: []
	}
	return pattern;
}

// copies the current pattern into a new pattern with a new name
function copyDrumPattern(name)
{
	var pattern = $.extend(true,{},drumPatterns[currentDrumPattern]);
	pattern.name = name;
	addDrumPattern(name, pattern);
}

function addToSequence()
{
	sequence.push(null);
	// updateSequenceList();
}

function removeFromSequence(i)
{

}

function createBassPattern()
{
	var pattern = [];
	// need objects for... volume, duration, note
	for (var i = 0; i < NUMSTEPS; i++)
	{
		pattern[i] = {
			note: 0,
			volume: .8,
			duration: 1
		}
	}
	return pattern;
}