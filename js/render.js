function render()
{
	var tmpContext = context;
	// get the length
	context = new OfflineAudioContext(2, ((60/tempo)*4) * 44100, 44100);
	context.graph = createAudioGraph();
	// set all params based on current values...
	$(".param").each(function() {
		setParam(params[$(this).attr("name")], $(this).val());
	});

	var stepTime = (60 / STEPS_PER_BEAT) / tempo;
	var steps = drumPatterns[currentDrumPattern].steps;
	var time = 0;
	
	for (var i = 0; i < 16; i++)
	{
		if (steps[0][i] == 1)
		{
			playDrumSound(buffers[SOUNDS[0].name], time, .8);
		}
		time += stepTime;
	}
	// @todo - add all drum/bass sounds and choke groups
	
	context.oncomplete = function(event) {
		// console.log("done!", event);
		context = tmpContext;
		context.graph = createAudioGraph();
		$(".param").each(function() {
			setParam(params[$(this).attr("name")], $(this).val());
		});
		var buffer = event.renderedBuffer;
		var interleaved = interleave(buffer.getChannelData(0),buffer.getChannelData(1));
		var dataview = encodeWAV(interleaved);
		var audioBlob = new Blob([dataview], {type: 'audio/wav'});
		forceDownload(audioBlob);
	}
	
	context.startRendering();
}


/**
* Wave rendering functions adapted from  https://github.com/mattdiamond/Recorderjs
*/
forceDownload = function(blob, filename){
	// console.log(blob)
    var url = (window.URL || window.webkitURL).createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    //var dataUrl = 
    link.download = filename || 'output.wav';
    //link.appendChild(document.createTextNode("test"))
    //document.body.appendChild(link);
    // @todo - work on some cross browser stuff here...
    var click = document.createEvent("Event");
    click.initEvent("click", true, true);
    link.dispatchEvent(click);
}

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
	var sampleRate = 44100;
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