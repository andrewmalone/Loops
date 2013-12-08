/**
* render.js
* Switches audio processing to offline mode and renders to .wav
*/

/**
* Main render function
* Note - may be able to refactor common code from the main sequencer loop
*/
function render()
{
	// stop playback
	stop();
	
	// calculate length based on sequence modes
	var bassLength = bassMode == "loop" ? 1 : bassSequence.length;
	var drumLength = drumMode == "loop" ? 1 : drumSequence.length;
	var measures = Math.max(bassLength, drumLength);	
	
	// switch to offline mode
	context = new OfflineAudioContext(2, ((60 / tempo) * (BEATS_PER_MEASURE * measures)) * context.sampleRate, context.sampleRate);
	context.graph = createAudioGraph();
	
	// set all params based on current values...
	$(".param").each(function() {
		setParam(params[$(this).attr("name")], $(this).val());
	});
	
	var stepTime = (60 / STEPS_PER_BEAT) / tempo;
	var steps = drumPatterns[currentDrumPattern].steps;
	var time = 0;
	
	// set the starting patterns...
	if (drumMode == "sequence")
	{
		drumSequencePosition = 0;
		currentDrumPattern = drumSequence[0];
	}
	if (bassMode == "sequence")
	{
		bassSequencePosition = 0;
		currentDrumPattern = bassSequence[0];
	}

	// loop through the measures and schedule all the sounds
	for (var measureCount = 0; measureCount < measures; measureCount++)
	{
		var steps = drumPatterns[currentDrumPattern].steps;
		var volumes = drumPatterns[currentDrumPattern].volumes;
		var bass = bassPatterns[currentBassPattern];
		
		// loop through the steps
		for (var step = 0; step < NUMSTEPS; step++)
		{
			// loop through the drum sounds
			for (i = 0; i < SOUNDS.length; i++)
			{
				if (steps[i][step] == 1)
				{
					var name = SOUNDS[i].name;
					for (var j = 0, len_j = scheduledSounds.length; j < len_j; j++) 
					{
						if (scheduledSounds[j].buffer._mute == buffers[name]._mute) 
						{
							scheduledSounds[j].stop(time + 5/tempo);
						}
					}
					playDrumSound(buffers[name], time, volumes[i][step]);
				}
			}
			
			// check for bass
			if (bass[step].note != 0)
			{
				// play the note...
				var note = BASS_MAPPING[bass[step].note];
				playBassSound(
					buffers[note.sample],
					time,
					bass[step].volume,
					bass[step].duration * stepTime,
					note.pitch,
					note.tune
				);
			}
			time += stepTime;	
		}
		
		if (drumMode == "sequence")
		{
			drumSequencePosition = (drumSequencePosition + 1) % drumSequence.length;
			if (drumSequence[drumSequencePosition] == null)
			{
				drumSequencePosition = 0;
			}
			currentDrumPattern = drumSequence[drumSequencePosition];
		}
		if (bassMode == "sequence")
		{
			bassSequencePosition = (bassSequencePosition + 1) % bassSequence.length;
			if (bassSequence[bassSequencePosition] == null)
			{
				bassSequencePosition = 0;
			}
			currentBassPattern = bassSequence[bassSequencePosition];
		}
	}
	
	// set the rendering callback function
	context.oncomplete = function(event) {
		// switch the audio context back from offline
		context = new AudioContext();
		context.graph = createAudioGraph();
		$(".param").each(function() {
			setParam(params[$(this).attr("name")], $(this).val());
		});
		scheduledSounds = [];
		
		// convert the rendered PCM data buffer to a .wav
		var buffer = event.renderedBuffer;
		var interleaved = interleave(buffer.getChannelData(0),buffer.getChannelData(1));
		var dataview = encodeWAV(interleaved);
		var audioBlob = new Blob([dataview], {type: 'audio/wav'});
		
		// convert the blob into a data URI
		var reader = new FileReader();
		reader.onloadend = function()
		{
			var content = $("<div>");
			var text = "";
			// detect if download attr will work and add extra text if needed
			if ("download" in document.createElement("a"))
			{
				text = "Click to download .wav file.";
			}
			else
			{
				text = "Right click and 'download as..' to save .wav file";
			}
			$("<p>").text(text).appendTo(content);
			$("<a>").attr("href", reader.result).attr("download", "loops_export.wav").text("loops_export.wav").appendTo(content);
			showModal(content);
		}
		reader.readAsDataURL(audioBlob);
	}
	
	// start rendering
	context.startRendering();
}


/**
* All wave rendering and header functions below adapted from  https://github.com/mattdiamond/Recorderjs
*/
function interleave(inputL, inputR){
  var length = inputL.length + inputR.length;
  var result = new Float32Array(length);

  var index = 0,
    inputIndex = 0;

  while (index < length){
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeString(view, offset, string){
  for (var i = 0; i < string.length; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input){
  for (var i = 0; i < input.length; i++, offset+=2){
    var s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function encodeWAV(samples){
  var sampleRate = context.sampleRate;
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);

  return view;
}