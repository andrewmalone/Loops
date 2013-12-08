// @todo - comments
// global object to hold the loaded sounds
var buffers = {};

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
	$("#modal-close").css("display", "none");
	announce("Loading sounds...");
	var loadCheck = setInterval(function() {
		if (Object.keys(buffers).length == soundCount)
		{
			clearInterval(loadCheck);
			$("#modal").removeClass("active");
			$("#modal-close").css("display", "inline-block");
			continueSetup();
		}
	}, 50)	
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