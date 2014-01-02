/*global context */

var lfo_curves = {};
var lfo;
var lfos = [];

function initLFObuffers()
{
	var lfo = {},
		tmp_array,
		len = 100,
		i;
	
	["sine", "square", "triangle", "sawtooth", "noise"].forEach(function (type)
	{
		var i,
			len = 100;
		lfo_curves[type] = new Float32Array(len);
		for (i = 0; i < len; i++)
		{
			lfo_curves[type][i] = getLFOSample(type, i / len);
		}
		
	});
	
	// set up one lfo for the filter...
	tmp_array = new Float32Array(len);
	for (i = 0; i < len; i++)
	{
		tmp_array[i] = (1 - lfo_curves.sine[i]) * (context.sampleRate / 2 - 100) + 100;
	}
	//lfo.curve = tmp_array;
	
	lfo.param = context.graph.masterFx.filter.filter.frequency;
	lfo.stepCount = -1;
	lfo.stepStart = 0;
	lfo.slider = "master-filter-frequency";
	lfo.len = 16;
	lfo.amount = -0.8;
	lfo.type = "sine";
	makeLFOCurve(lfo);
	lfos[0] = lfo;
}

function makeLFOCurve(lfo)
{
	// amount will be constrained between 1 and -1 (?)
	lfo.curve = new Float32Array(100);
	
	// need current slider value...
	var p = params[lfo.slider],
		upper, lower, range, i, lfo_range;
	
	range = parseFloat(p.max) - parseFloat(p.min);
	// get max, min, range
	if (lfo.amount > 0)
	{
		upper = Math.min(parseFloat(p.value) + lfo.amount * range, parseFloat(p.max));
		lower = parseFloat(p.value);
	}
	else
	{
		upper = parseFloat(p.value);
		console.log(parseFloat(p.value) + parseFloat(lfo.amount) * range, parseFloat(p.min));
		lower = Math.max(parseFloat(p.value) + parseFloat(lfo.amount) * range, parseFloat(p.min));
	}
	
	lfo_range = upper - lower;
	console.log("amount: " + lfo.amount);
	console.log("upper: " + upper);
	console.log("lower: " + lower);
	console.log("value: " + p.value);
	
	// set the curve
	for (i = 0; i < 100; i++)
	{
		lfo.curve[i] = (lfo.amount > 0 ? lfo_curves[lfo.type][i] : 1 - lfo_curves[lfo.type][i]) * lfo_range + lower;
	}
	
	console.log(lfo.curve);
	
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
		return -1 * Math.cos(phase * Math.PI * 2) / 2 + 0.5;
	}
}

function addLFOSliders()
{
	params["master-lfo-rate"] = {
		max: 32,
		min: 2,
		step: 1,
		value: 16,
		param: function (value)
		{
			lfos[0].len = value;
		}
	};
	
	params["master-lfo-amount"] = {
		max: 1,
		min: -1,
		step: "any",
		value: -0.8,
		param: function (value)
		{
			lfos[0].amount = value;
			makeLFOCurve(lfos[0]);
		}
	};
}

function checkLFOs(step, time)
{
	//return;
	var i,
		len = lfos.length,
		stepTime = (60 / STEPS_PER_BEAT) / tempo;
			
	for (i = 0; i < len; i++)
	{
		// lfos[i].stepCount++;
		// console.log(lfos[i].stepCount);
		if ((lfos[i].stepCount + 1) % lfos[i].len == 0)
		{
			// schedule it?
			//console.log(time, time + stepTime * lfos[0].len);
			//lfos[i].param.cancelScheduledValues(time);
			lfos[i].param.setValueCurveAtTime(lfos[0].curve, time, stepTime * lfos[0].len - 0.00001);
			lfos[i].stepCount = 0;
		}
		else
		{
			lfos[i].stepCount++;
		}
	}
}