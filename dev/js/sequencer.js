/**
 * sequencer.js
 *
 * functions for looping and audio playback
 */

/*global context, buffers, setActiveSequence, switchActivePattern, SOUNDS, requestAnimFrame, cancelAnimFrame, BASS_MAPPING, drawStep, resetLFOs, checkLFOs, checkShuffler */

// set some global variables
var BEATS_PER_MEASURE = 4;
var STEPS_PER_BEAT = 4;
var NUMSTEPS = BEATS_PER_MEASURE * STEPS_PER_BEAT;
var NUMPATTERNS = 8;
var SEQUENCE_LENGTH = 8;

// create a default empty drum and bass pattern
var drumPatterns = [];
for (var i = 0; i < NUMPATTERNS; i++)
{
	drumPatterns.push(createDrumPattern());
}

// modes for switching loop/sequence
var drumMode = "loop";

// initialize the sequences
var drumSequence = [0];
var drumSequencePosition = 0;

// set the current pattern to the default
var currentDrumPattern = 0;

// sequencer variables
var currentStep = 0;
// time to schedule sounds ahead
var scheduleAhead = 0.1; 
// variable used for requestAnimationFrame
var looper = null;
var tempo = 120;
var nextStepTime = 0;
// scheduled sounds array (for mute groups)
var scheduledSounds = [];

// keep track of drawing queue for updating the interface
var lastStepDrawn = -1;
var drawingQueue = [];

// shim for cross browser requestAnimationFrame
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();
window.cancelAnimFrame = (function () {
	return window.cancelAnimationFrame ||
	window.webkitCancelAnimationFrame;
})();


/**
 *	Starts the sequencer
 */
function start()
{
	var s, volume;

	// INIT FOR iOS - sounds won't play unless first directly triggered
	// see http://www.html5rocks.com/en/tutorials/webaudio/intro/
	s = context.createBufferSource();
	s.buffer = buffers[SOUNDS[0].name];
	volume = context.createGain();
	volume.gain.value = 0;
	s.connect(volume);
	volume.connect(context.destination);
	s.start(0);
	
	nextStepTime = context.currentTime;
	
	// switch to the first sequence position if in sequence mode...
	if (drumMode == "sequence")
	{
		drumSequencePosition = 0;
		setActiveSequence(0, "drum");
		switchActivePattern(drumSequence[0], "drum");
	}
	
	// start looping
	looper = requestAnimFrame(loop);
}

/**
 *	Stops the sequencer and resets to position 0
 */
function stop()
{
	cancelAnimFrame(looper);
	looper = null;
	currentStep = 0;
	scheduledSounds = [];
	$(".sequence .active").removeClass("active");
	$(".playing").removeClass("playing");
	// @todo - broadcast an event here
	resetLFOs();
}

/**
 *	Schedules an individual drum sound for playback
 */
function playDrumSound(buffer, time, volume)
{
	var source, v;
	source = context.createBufferSource();
	source.buffer = buffer;
	
	v = context.createGain();
	v.gain.value = volume;
	// @todo - change this to an exponential volume curve instead of linear
	
	source.connect(v);
	v.connect(context.graph.input.drum[buffer._name]);
	source.start(time);
	scheduledSounds.push(source);	
}

/**
 *	Main loop controller
 */
function loop()
{
	var steps, volumes, stepTime, i, name, len_i, j, len_j, currentDrawStep, event;
	
	looper = requestAnimFrame(loop);
	steps = drumPatterns[currentDrumPattern].steps;
	volumes = drumPatterns[currentDrumPattern].volumes;
	// calculate the step time based on the current tempo...
	stepTime = (60 / STEPS_PER_BEAT) / tempo;
	
	// clean up the scheduledSounds array for anything that has finished playing...
	// @todo - make this cleaner
	for (i = scheduledSounds.length; i-- > 0;) 
	{
		if (scheduledSounds[i].playbackState == 3) 
		{
			scheduledSounds.splice(i, 1);
		}
	}	
	
	// schedule any upcoming sounds
	while (nextStepTime < context.currentTime + scheduleAhead) 
	{	
		// Drum sounds
		for (i = 0, len_i = SOUNDS.length; i < len_i; i++) 
		{
			name = SOUNDS[i].name;
			if (steps[i][currentStep] == 1) 
			{				
				// check for mute groups
				if (buffers[name]._mute !== null) 
				{
					for (j = 0, len_j = scheduledSounds.length; j < len_j; j++) 
					{
						if (scheduledSounds[j].buffer._mute == buffers[name]._mute) 
						{
							scheduledSounds[j].stop(nextStepTime + 5 / tempo);
							scheduledSounds.splice(j, 1);
							j--;
							len_j--;
						}
					}
				}
				
				// schedule the sound
				playDrumSound(buffers[name], nextStepTime, volumes[i][currentStep]);
			}
		}

		
		// LFOs
		checkLFOs(currentStep, nextStepTime);
		event = new CustomEvent('triggerStep',
			{
				detail: {
					step: currentStep,
					time: nextStepTime
				}
			}
		);
		document.dispatchEvent(event);
		
		// shuffler
		checkShuffler(currentStep, nextStepTime);
		
		drawingQueue.push({step: currentStep, time: nextStepTime});
		nextStepTime += stepTime; 
		currentStep++;
		if (currentStep == NUMSTEPS) {
			// deal with looping back to the beginning
			currentStep = 0;
			
			// switch patterns if in sequence mode
			if (drumMode == "sequence")
			{
				drumSequencePosition = (drumSequencePosition + 1) % drumSequence.length;
				if (drumSequence[drumSequencePosition] === null)
				{
					drumSequencePosition = 0;
				}
				currentDrumPattern = drumSequence[drumSequencePosition];
			}
		}
	}
	
	// check if we need to do a drawing update
	currentDrawStep = lastStepDrawn;
	while (drawingQueue.length && drawingQueue[0].time < context.currentTime)
	{
		currentDrawStep = drawingQueue[0].step;
		drawingQueue.splice(0, 1);
	}
	
	if (currentDrawStep != lastStepDrawn)
	{
		if (currentDrawStep === 0)
		{
			if (drumMode == "sequence")
			{
				setActiveSequence(drumSequencePosition, "drum");
				switchActivePattern(drumSequence[drumSequencePosition], "drum");
			}
		}
		drawStep(currentDrawStep);
		lastStepDrawn = currentDrawStep;
	}
	
}

/**
* creates and returns a drum measure object for the sequencer to use
*/
function createDrumMeasure(initValue)
{
	var measure = [],
		row, i, j, len;
	for (i = 0, len = SOUNDS.length; i < len; i++)
	{
		row = [];
		for (j = 0; j < NUMSTEPS; j++)
		{
			row[j] = initValue;
		}
		measure[i] = row;
	}
	return measure;
}

/**
* Creates an empty drum pattern
*/
function createDrumPattern(name)
{
	// create a new object...
	var pattern = {
		steps: createDrumMeasure(0),
		volumes: createDrumMeasure(0.8),
		rowVolumes: []
	};
	return pattern;
}

/**
* Creates an empty bass pattern
*/
function createBassPattern()
{
	var pattern = [], i;
	for (i = 0; i < NUMSTEPS; i++)
	{
		pattern[i] = {
			note: 0,
			volume: 0.8,
			duration: 1
		};
	}
	return pattern;
}

/**
* Utility functions for converting to seconds (based on the current tempo)
*/
function seconds_per_step()
{
	return (60 / STEPS_PER_BEAT) / tempo;
}

function seconds_per_beat()
{
	return 60 / tempo;
}

function seconds_per_measure()
{
	return 60 / tempo * BEATS_PER_MEASURE;
}