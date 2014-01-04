/**
* audioGraph.js
* Creates the audio nodes, fx and routing
*/

/*global context, SOUNDS, tempo: true, setParam, addLFO */

// set up global variables
var params = {};
// curves to use for the waveshaper;
var shaperCurves = createShaperCurves();


/**
* Build the audio graph
*/
function createAudioGraph()
{
	// set up the main nodes
	var g = {
		input: {
			drum: {},
			bass: context.createGain()
		},
		drumFx: [],
		output: context.createGain(),
		master: context.createGain(),
		drumMaster: context.createGain(),
		drumMasterFx: createFx("drum"),
		bassFx: createFx("bass"),
		masterFx: createFx("master")
	};
	
	// create the input nodes and effects for each drum sound
	SOUNDS.forEach(function (sound, index) {
		g.input.drum[sound.name] = context.createGain();
		g.drumFx[index] = createFx(sound.name);
		g.input.drum[sound.name].connect(g.drumFx[index].input);
		g.drumFx[index].output.connect(g.drumMaster);
		params[sound.name + "-master-level"] = {
			max: 1,
			min: "0",
			value: 1,
			step: 0.01,
			param: g.input.drum[sound.name].gain
		};
	});
	
	// build connections
	g.drumMaster.connect(g.drumMasterFx.input);
	g.drumMasterFx.output.connect(g.master);
	
	g.input.bass.connect(g.bassFx.input);
	g.bassFx.output.connect(g.master);
	
	g.master.connect(g.masterFx.input);
	g.masterFx.output.connect(g.output);
	
	g.output.connect(context.destination);
	
	// master level parameters
	params["drum-master-level"] = {
		max: 1,
		min: "0",
		value: 1,
		step: 0.01,
		param: g.drumMaster.gain
	};
	
	params["bass-master-level"] = {
		max: 1,
		min: "0",
		value: 1,
		step: 0.01,
		param: g.input.bass.gain
	};
		
	return g;
}

/**
* Creates and returns an fx group
*/
function createFx(name)
{
	var fx = {
		comp: createCompressor(name),
		filter: createFilter(name),
		delay: createDelay(name),
		shaper: createShaper(name)
	};
	
	fx.input = fx.filter.input;
	fx.filter.output.connect(fx.comp.input);
	fx.comp.output.connect(fx.delay.input);
	fx.delay.output.connect(fx.shaper.input);
	fx.output = fx.shaper.output;
	return fx;
}

/**
* Filter effect defenition
*/
function createFilter(name)
{
	// node setup
	var fx = {
		input: context.createGain(),
		filter: context.createBiquadFilter(),
		wet: context.createGain(),
		dry: context.createGain(),
		output: context.createGain()
	};
	
	// initial values
	fx.filter.frequency.value = context.sampleRate / 2;
	fx.wet.gain.value = 1;
	fx.dry.gain.value = 0;

	// connections
	fx.input.connect(fx.filter);
	fx.input.connect(fx.dry);
	fx.filter.connect(fx.wet);
	fx.dry.connect(fx.output);
	fx.wet.connect(fx.output);
	
	// parameters
	params[name + "-filter-frequency"] = {
		min: 10,
		max: context.sampleRate / 2,
		value: context.sampleRate / 2,
		param: fx.filter.frequency
	};
	addLFO(name + "-filter-frequency");
	
	params[name + "-filter-q"] = {
		min: 1,
		max: 50,
		step: 0.5,
		value: 1,
		param: fx.filter.Q
	};
	addLFO(name + "-filter-q");
	
	params[name + "-filter-mix"] = {
		min: "0",
		max: 1,
		step: 0.01,
		value: 1,
		param: function (value) 
		{
			crossfade(fx.wet.gain, fx.dry.gain, value);
		}
	};
	
	return fx;
}

/**
* Delay effect definition
*/
function createDelay(name)
{
	// node setup
	var fx = {
		input: context.createGain(),
		output: context.createGain(),
		wet: context.createGain(),
		dry: context.createGain(),
		feedback: context.createGain(),
		delay: context.createDelay(10)
	};

	// initial values
	fx.feedback.gain.value = 0;
	fx.delay.delayTime.value = 15 / tempo * 1;
	fx.wet.gain.value = 0;

	// connections
	fx.input.connect(fx.delay);
	fx.input.connect(fx.dry);
	fx.delay.connect(fx.wet);
	fx.delay.connect(fx.feedback);
	fx.feedback.connect(fx.delay);
	fx.wet.connect(fx.output);
	fx.dry.connect(fx.output);

	// params
	params[name + "-delay-time"] = {
		min: "0",
		max: 15,
		step: 1,
		value: 1,
		param: function (value)
		{
			fx.delay.delayTime.value = 15 / tempo * value;
		}
	};

	params[name + "-delay-feedback"] = {
		min: "0",
		max: 1,
		step: 0.1,
		value: "0",
		param: fx.feedback.gain
	};

	params[name + "-delay-level"] = {
		min: "0",
		max: 0.8,
		step: 0.1,
		value: "0",
		param: fx.wet.gain
	};

	return fx;
}

/**
* waveshaper effect definition
*/
function createShaper(name)
{
	// node setup
	var fx = {
		input: context.createGain(),
		output: context.createGain(),
		shaper: context.createWaveShaper(),
		shaperGain: context.createGain(),
		wet: context.createGain(),
		dry: context.createGain()
	};
	
	// initial values
	fx.shaper.curve = shaperCurves[0];
	fx.wet.gain.value = 1;
	fx.dry.gain.value = 0;
	
	// connections
	fx.input.connect(fx.shaper);
	fx.input.connect(fx.dry);
	
	fx.shaper.connect(fx.shaperGain);
	fx.shaperGain.connect(fx.wet);
	
	fx.wet.connect(fx.output);
	fx.dry.connect(fx.output);
	
	// parameters
	params[name + "-distortion-amount"] = {
		min: "0",
		max: 99,
		step: 1,
		value: "0",
		param: function (value)
		{
			fx.shaper.curve = shaperCurves[value];
			// lower the gain at higher curves
			fx.shaperGain.gain.value = (0.8 * Math.pow(-1 * value / 99, 3)) + 1;
		}
	};
	
	params[name + "-distortion-mix"] = {
		min: "0",
		max: 1,
		step: 0.01,
		value: 1,
		param: function (value)
		{
			crossfade(fx.wet.gain, fx.dry.gain, value);
		}
	};
	
	return fx;
}

/**
* Compressor FX
*/
function createCompressor(name)
{
	var fx = {
		input: context.createGain(),
		output: context.createGain(),
		comp: context.createDynamicsCompressor(),
		wet: context.createGain(),
		dry: context.createGain()
	};
	
	// initial values
	fx.comp.threshold.value = 0;
	fx.comp.ratio.value = 1;
	fx.comp.attack.value = 0.005;
	fx.comp.release.value = 0.005;
	fx.comp.knee.value = 30;
	
	// connections
	fx.input.connect(fx.comp);
	fx.input.connect(fx.dry);
	fx.comp.connect(fx.wet);
	fx.wet.connect(fx.output);
	fx.wet.gain.value = 1;
	fx.dry.connect(fx.output);
	fx.dry.gain.value = 0;
	
	// params
	params[name + "-compressor-threshold"] = {
		min: -100,
		max: "0",
		value: "0",
		step: "any",
		param: fx.comp.threshold
	};
	
	params[name + "-compressor-ratio"] = {
		min: 1,
		max: 30,
		step: "any",
		value: 1,
		param: fx.comp.ratio
	};
	
	params[name + "-compressor-attack"] = {
		min: 0.005,
		max: 1,
		step: "any",
		value: 0.005,
		param: fx.comp.attack
	};
	
	params[name + "-compressor-release"] = {
		min: 0.005,
		max: 1,
		step: "any",
		value: 0.005,
		param: fx.comp.release
	};
	
	return fx;
}

/**
* Equal power crossfade
* from http://www.html5rocks.com/en/tutorials/webaudio/intro/js/crossfade-sample.js
*/
function crossfade(a, b, val)
{
	// 1 = full a, 0 = full b
	a.value = Math.cos((1 - val) * 0.5 * Math.PI);
	b.value = Math.cos(val * 0.5 * Math.PI);
}

/**
* Creates the waveshaping curves
* waveshaping algorithm ported to javascript from
* http://www.musicdsp.org/archive.php?classid=4#46
*/
function createShaperCurves()
{
	var len = 22050,
		curves = [],
		amt, i, data, k, n;
	
	for (amt = 0; amt < 1; amt += 0.01) {
	
		data = new Float32Array(len);
		k = 2 * amt / (1 - amt);
	
		for (i = 0; i < len; i++) {
			n = (i / (len - 1) * 2) - 1;
			data[i] = (1 + k) * n / (1 + k * Math.abs(n));
		}
		curves.push(data);
	}
	return curves;
}

/**
* Set the tempo and update all delays to maintain tempo sync
*/
function setTempo(val)
{
	// set the tempo
	tempo = val;
	
	// set all the delays...
	$(".param[name$=delay-time]").each(function () {
		setParam(params[$(this).attr("name")], $(this).val());
	});
}