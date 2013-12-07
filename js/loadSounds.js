// global object to hold the loaded sounds
var buffers = {};

function loadSounds() 
{
	// @todo create some sort of loader, to prevent playback from starting before all sounds are loaded
	// @todo think about error handling for file types
	SOUNDS.forEach(function(sound) {
		loadSound(sound);
	});
	
	BASS_SOUNDS.forEach(function(sound) {
		loadSound({name: sound, source: "Samples/" + sound})
	});
}

function loadSound(sound, type) 
{
	var callback = function(buffer)
	{
		buffer._name = sound.name;
		if (sound.mute != undefined)
		{
			buffer._mute = sound.mute;
		}
		buffers[sound.name] = buffer;
	};
	
	var request = new XMLHttpRequest();
	request.open('GET', sound.source, true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		context.decodeAudioData(request.response, callback);
	}
	request.send();
}