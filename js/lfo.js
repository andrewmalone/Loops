/*global context, params, STEPS_PER_BEAT, tempo, config */

var lfo_curves = {};
// var lfo;
var lfos = [];

function initLFObuffers()
{	
	if (!config.lfo) { return; }
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
}

function makeLFOCurve(lfo)
{
	// amount will be constrained between 1 and -1
	
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
		lower = Math.max(parseFloat(p.value) + parseFloat(lfo.amount) * range, parseFloat(p.min));
	}
	
	lfo_range = upper - lower;

	// set the curve
	for (i = 0; i < 100; i++)
	{
		lfo.curve[i] = (lfo.amount > 0 ? lfo_curves[lfo.type][i] : 1 - lfo_curves[lfo.type][i]) * lfo_range + lower;
	}
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

function addLFO(p)
{
	if (!config.lfo) { return; }
	var lfo = {};
	lfo.param = params[p].param;
	lfo.stepCount = -1;
	lfo.stepStart = 0;
	lfo.slider = p;
	lfo.len = 8;
	//debugger;
	lfo.amount = 0;
	lfo.type = "sine";
	
	params[p + "-lfo-rate"] = {
		max: 32,
		min: 2,
		step: 1,
		value: lfo.len,
		param: function (value)
		{
			lfo.len = parseFloat(value);
		}	
	};
	
	params[p + "-lfo-amount"] = {
		max: 1,
		min: -1,
		step: "any",
		value: lfo.amount,
		name: p,
		param: function (value)
		{
			lfo.amount = parseFloat(value);
			makeLFOCurve(lfo);
		}	
	};
	
	makeLFOCurve(lfo);
	lfos.push(lfo);
	params[p].lfo = lfo;
	
	document.addEventListener('triggerStep', checkLFO(lfo));
}

function checkLFO(lfo)
{
	var fn = function (e)
	{
		if (lfo.amount === 0) { return; }
		
		var time = e.detail.time,
			step = e.detail.step,
			stepTime = (60 / STEPS_PER_BEAT) / tempo;
			
		if ((lfo.stepCount + 1) % lfo.len === 0)
		{
			// schedule it
			lfo.param.setValueCurveAtTime(lfo.curve, time - 0.00001, stepTime * lfo.len - 0.00001);
			lfo.stepCount = 0;
		}
		else
		{
			lfo.stepCount++;
		}
	};
	return fn;
}


function resetLFOs()
{
	if (!config.lfo) { return; }
}