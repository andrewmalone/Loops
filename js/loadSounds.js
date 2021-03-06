/**
* loadSounds.js
* loads all sounds into the buffers object for use in playback
*/

// global object to hold the loaded sounds
var buffers = {};

/**
* Initializing the loading
*/
function loadSounds() 
{
	// test for supported file types
	var type;
	var audioTest = new Audio();
	if (audioTest.canPlayType("audio/ogg") != "")
	{
		type = ".ogg";
	}
	else if (audioTest.canPlayType("audio/mp3") != "")
	{
		type = ".mp3";
	}
	else
	{
		type = ".wav";
	}
	
	
	SOUNDS.forEach(function(sound) {
		sound.source += type;
		loadSound(sound);
	});
	
	BASS_SOUNDS.forEach(function(sound) {
		loadSound({name: sound, source: "Samples/" + sound + type})
	});
	
	// wait for all sounds to be loaded before returning
	var soundCount = SOUNDS.length + BASS_SOUNDS.length;
	// temporarily hide the button in the modal
	$("#modal-close").css("display", "none");
	announce("Loading sounds...");
	var loadCheck = setInterval(function() {
		if (Object.keys(buffers).length == soundCount)
		{
			clearInterval(loadCheck);
			$("#modal").removeClass("active");
			setTimeout(function() {
				// show the button in the modal again
				$("#modal-close").css("display", "inline-block");
			}, 500);
			continueSetup();
		}
	}, 50)	
}

/**
* Load an individual sound into the buffer object
* can't use jquery $.ajax here because it doesn't support arraybuffer responses yet
*/
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