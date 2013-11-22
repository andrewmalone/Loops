/**
 * sequencer.js
 *
 * functions for looping and audio playback
 */

// set some global variables
// number of steps
// @todo Add better comments here
var NUMSTEPS = 16;
var steps = [];
steps = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
	[0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
]
var volumes = [];
var rowVolumes = [];
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
	nextStepTime = context.currentTime;
	looper = requestAnimFrame(loop)	;
}

/**
 *	Stops the sequencer and resets to position 0
 */
function stop()
{
	cancelAnimFrame(looper);
	currentStep = 0;
	// @todo cleanup up any scheduled nodes?
}

/**
 *	Schedules an individual sound for playback
 */
// @todo add duration here (for bass)?
function playSound(buffer, time, volume)
{
	var source = context.createBufferSource();
	source.buffer = buffer;
	
	// var v = context.createGainNode();
	// v.gain.value = exp_volume(volume);

	source.connect(amp);
	// v.connect(context.destination)
	// v.connect(amp)
	source.start(time);
	scheduledSounds.push(source);	
}

/**
 *	Main loop controller
 */
function loop()
{
	looper = requestAnimFrame(loop);
	
	// clean up the scheduledSounds array for anything that has finished playing...
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
		for (var i = 0,len = steps.length; i < len; i++) 
		{
			var name = SOUNDS[i].name;
			if (steps[i][currentStep] == 1) 
			{
				
				// check for mute groups
				if (buffers[name]._mute != null) 
				{
				
					for (var j = 0; j < scheduledSounds.length; j++) 
					{
						if (scheduledSounds[j].buffer._mute == buffers[name]._mute) 
						{
							scheduledSounds[j].stop(nextStepTime + 5/tempo);
							console.log(nextStepTime);
						}
					}
				}
				
				// schedule the sound
				// playSound(buffers[name], nextStepTime, volumes[i][currentStep] * rowVolumes[i]);
				playSound(buffers[name], nextStepTime, 75)
				console.log(nextStepTime);
			}
		}
		
		
		// move to the next step
		// queue.push({note:currentStep,time:nextStepTime})
		// calculate the next step based on the current tempo...
		var stepTime = 15/tempo; 
		nextStepTime += stepTime; 
		currentStep++;
		if (currentStep == 16) {
			currentStep = 0;
		}
	}

}