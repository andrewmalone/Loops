var bass;
function loadBass()
{
	//console.log("yes")
	
	var request = new XMLHttpRequest();
	request.open('GET',"Samples/E2_3.wav", true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		context.decodeAudioData(request.response,function(buffer){
			// buffer._mute = sound.mute;
			// buffers[sound.name] = buffer;
			console.log("sound loaded");
			bass = buffer;
		}, function(err){
			console.log("E", err);
		});
	}
	request.send();
}

function playBass(pitch)
{
	if (!pitch)
	{
		pitch = 0;
	}
	var midiNote = 40;
	var source = context.createBufferSource();
	source.buffer = bass;
	
	// var v = context.createGainNode();
	// v.gain.value = exp_volume(volume);
	var step = .059463094359295;
	source.playbackRate.value = 1 + (step * pitch);
	console.log(step * pitch);
	source.connect(amp);
	// v.connect(context.destination)
	// v.connect(amp)
	source.noteOn(0);

}

function Hz(midiNote)
{
	return 6.875 * Math.pow(2, ( ( 3 + midiNote ) / 12 ));
}