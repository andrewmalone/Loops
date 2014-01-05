/**
 * sequencer.js
 *
 * functions for looping and audio playback
 */

/*global context, buffers, setActiveSequence, switchActivePattern, SOUNDS, requestAnimFrame, cancelAnimFrame, BASS_MAPPING, drawStep, resetLFOs, checkLFOs */

// set some global variables
var BEATS_PER_MEASURE = 4;
var STEPS_PER_BEAT = 4;
var NUMSTEPS = BEATS_PER_MEASURE * STEPS_PER_BEAT;
var NUMPATTERNS = 8;
var SEQUENCE_LENGTH = 8;

// create a default empty drum and bass pattern
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
	if (bassMode == "sequence")
	{
		bassSequencePosition = 0;
		setActiveSequence(0, "bass");
		switchActivePattern(bassSequence[0], "bass");
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
	currentStep = 0;
	scheduledSounds = [];
	$(".sequence .active").removeClass("active");
	$(".playing").removeClass("playing");
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
* Schedules an individual bass sound for playback
*/
function playBassSound(buffer, time, volume, duration, pitch, tune)
{
	var source, v, step;
	source = context.createBufferSource();
	source.buffer = buffer;
	v = context.createGain();
	v.gain.value = volume;
	// set release value for smoother playback
	v.gain.setTargetAtTime(0, time + duration, 0.005);
	source.connect(v);
	v.connect(context.graph.input.bass);
	
	// set the tuning 
	// step = 1 semitone (based on 1 - Math.pow(1, 1/12);
	// see http://chimera.labs.oreilly.com/books/1234000001552/ch04.html#s04_2
	// @todo - try changing this to exponential instead of linear
	step = 0.059463094359295;
	
	source.playbackRate.value = 1 + (step / 100 * tune) + (step * pitch);
	source.start(time);
	// stop time is slightly delayed to let the release finish
	source.stop(time + duration + 0.1);
}

/**
 *	Main loop controller
 */
function loop()
{
	var steps, volumes, bass, stepTime, i, name, len_i, j, len_j, note, currentDrawStep;
	
	looper = requestAnimFrame(loop);
	steps = drumPatterns[currentDrumPattern].steps;
	volumes = drumPatterns[currentDrumPattern].volumes;
	bass = bassPatterns[currentBassPattern];
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
						}
					}
				}
				
				// schedule the sound
				playDrumSound(buffers[name], nextStepTime, volumes[i][currentStep]);
			}
		}
		
		// check for the bass...
		if (bass[currentStep].note !== 0)
		{
			// play the note...
			note = BASS_MAPPING[bass[currentStep].note];
			playBassSound(
				buffers[note.sample],
				nextStepTime,
				bass[currentStep].volume,
				bass[currentStep].duration * stepTime,
				note.pitch,
				note.tune
			);
		}
		
		// LFOs
		checkLFOs(currentStep, nextStepTime);
		
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
			
			if (bassMode == "sequence")
			{
				bassSequencePosition = (bassSequencePosition + 1) % bassSequence.length;
				if (bassSequence[bassSequencePosition] === null)
				{
					bassSequencePosition = 0;
				}
				currentBassPattern = bassSequence[bassSequencePosition];
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
			if (bassMode == "sequence")
			{
				setActiveSequence(bassSequencePosition, "bass");
				switchActivePattern(bassSequence[bassSequencePosition], "bass");
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