/**
 * sequencer.js
 *
 * functions for looping and audio playback
 */

// @todo - THINK ABOUT SEQUENCER DATA STRUCTURES!

// set some global variables
// number of steps
// @todo Add better comments here
var BEATS_PER_MEASURE = 4;
var STEPS_PER_BEAT = 4;
var NUMSTEPS = BEATS_PER_MEASURE * STEPS_PER_BEAT;

// create a default empty drum pattern
var drumPatterns = [];

// set the current pattern to the default
var currentDrumPattern = 0;

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
	volume.connect(context.destination);
	s.start(0);
	nextStepTime = context.currentTime;
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
}

/**
 *	Schedules an individual sound for playback
 */
// @todo add duration here (for bass)?
function playSound(buffer, time, volume)
{
	var source = context.createBufferSource();
	source.buffer = buffer;
	
	var v = context.createGain();
	v.gain.value = volume;
	// @todo - Figure out exponential volume curve!
	
	source.connect(v);
	v.connect(amp)
	source.start(time);
	scheduledSounds.push(source);	
}

/**
 *	Main loop controller
 */
function loop()
{
	looper = requestAnimFrame(loop);
	var steps = drumPatterns[currentDrumPattern].steps;
	var volumes = drumPatterns[currentDrumPattern].volumes;
	
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
				playSound(buffers[name], nextStepTime, volumes[i][currentStep]);
			}
		}
		
		
		// move to the next step
		// queue.push({note:currentStep,time:nextStepTime})
		// calculate the next step based on the current tempo...
		var stepTime = 15/tempo; 
		nextStepTime += stepTime; 
		currentStep++;
		if (currentStep == NUMSTEPS) {
			currentStep = 0;
		}
	}
}

/**
* creates and returns a measure object for the sequencer to use
* currently only for steps...
*/
function createDrumMeasure()
{
	var measure = [];
	for (var i = 0, len = SOUNDS.length; i < len; i++)
	{
		var row = [];
		for (j = 0; j < NUMSTEPS; j++)
		{
			row[j] = 0;
		}
		measure[i] = row;
	}
	return measure;
}

function createDrumPattern(name)
{
	// create a new object...
	var pattern = {
		name: name,
		steps: createDrumMeasure(),
		volumes: createDrumMeasure(),
		rowVolumes: []
	}
	return pattern;
}

// add a pattern to the patterns array and switch to it...
function addDrumPattern(name, pattern)
{
	if (!pattern)
	{
		pattern = createDrumPattern(name);
	}
	var i = drumPatterns.push(pattern);
	updateDrumPatternList(name, i - 1);
	switchDrumPattern(i - 1);
}

function switchDrumPattern(i)
{
	currentDrumPattern = i;
	showDrumPattern(i);
}

// copies the current pattern into a new pattern with a new name
function copyDrumPattern(name)
{
	var pattern = $.extend(true,{},drumPatterns[currentDrumPattern]);
	pattern.name = name;
	addDrumPattern(name, pattern);
}