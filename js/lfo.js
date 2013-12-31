/*global context */

var lfo_buffers = {};
var lfo;

function initLFObuffers()
{
	// build each buffer for one second
	["sine", "square", "triangle", "sawtooth", "noise"].forEach(function (type)
	{
		var lfo_data, i;
		lfo_buffers[type] = context.createBuffer(1, context.sampleRate, context.sampleRate);
		// build the buffer data
		lfo_data = lfo_buffers[type].getChannelData(0);
		for (i = 0; i < lfo_data.length; i++)
		{
			lfo_data[i] = getLFOSample(type, i / lfo_data.length);
		}
	});
	
	// build an LFO for something to test...
	lfo = context.createBufferSource();
	lfo.buffer = lfo_buffers.sine;
	lfo.loop = true;
	lfo.connect(context.graph.masterFx.filter.filter.frequency);
	lfo.gain = -20000;
}

function getLFOSample(type, phase)
{
	switch (type)
	{
	case "square":
		return phase > 0.5 ? 1 : 0;
	case "triangle":
		return phase > 0.5 ? 1 - (phase - 0.5) * 2 : phase * 2;
	case "sawtooth":
		return phase;
	case "noise":
		return Math.random();
	case "sine":
		return Math.sin(phase * Math.PI * 2) / 2 + 0.5;
	}
}