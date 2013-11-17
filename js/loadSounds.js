// global array to hold the loaded sounds
var buffers = [];

function loadSounds() 
{
	// @todo create some sort of loader, to prevent playback from starting before all sounds are loaded
	SOUNDS.forEach(function(sound) {
		loadSound(sound);
	});
}

function loadSound(sound) 
{
	var request = new XMLHttpRequest();
	request.open('GET',sound.source, true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		context.decodeAudioData(request.response,function(buffer){
			buffer._mute = sound.mute;
			buffers[sound.name] = buffer;
		}, function() {
			console.log("Error")
		});
	}
	request.send();
}