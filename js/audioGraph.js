// @todo - comments
var params = {}
var shaperCurves = createShaperCurves();

function createAudioGraph()
{
	var g = {};
	g.in = {
		drum: {},
		bass: context.createGain()
	}
	g.drumFx = [];
	
	g.out = context.createGain();
	g.master = context.createGain();
	g.drumMaster = context.createGain();
	g.drumMasterFx = createFx("drum");
	g.bassFx = createFx("bass");
	g.masterFx = createFx("master");
	
	//g.in.drum.connect(g.drumFx.in);
	//g.drumFx.out.connect(g.master);
	
	SOUNDS.forEach(function(sound, index) {
		g.in.drum[sound.name] = context.createGain();
		g.drumFx[index] = createFx(sound.name);
		g.in.drum[sound.name].connect(g.drumFx[index].in);
		g.drumFx[index].out.connect(g.drumMaster);
		params[sound.name + "-master-level"] = {
			max: 1,
			min: "0",
			value: 1,
			step: .01,
			param: g.in.drum[sound.name].gain
		}
	});
	
	g.drumMaster.connect(g.drumMasterFx.in);
	g.drumMasterFx.out.connect(g.master);
	
	g.in.bass.connect(g.bassFx.in);
	g.bassFx.out.connect(g.master);
	
	g.master.connect(g.masterFx.in);
	g.masterFx.out.connect(g.out);
	
	g.out.connect(context.destination);
	
	params["drum-master-level"] = {
		max: 1,
		min: "0",
		value: 1,
		step: .01,
		param: g.drumMaster.gain
	};
	
	params["bass-master-level"] = {
		max: 1,
		min: "0",
		value: 1,
		step: .01,
		param: g.in.bass.gain
	}
	
	return g;
}

function createFx(name)
{
	var fx = {
		filter: createFilter(name),
		delay: createDelay(name),
		shaper: createShaper(name)
	}
	
	fx.in = fx.filter.in;
	fx.filter.out.connect(fx.delay.in);
	fx.delay.out.connect(fx.shaper.in);
	fx.out = fx.shaper.out;
	return fx;
}

function createFilter(name)
{
	// node setup
	var fx = {
		in: context.createGain(),
		filter: context.createBiquadFilter(),
		wet: context.createGain(),
		dry: context.createGain(),
		out: context.createGain()
	}
	
	// initial values
	fx.filter.frequency.value = context.sampleRate / 2;
	fx.wet.gain.value = 1;
	fx.dry.gain.value = 0;

	// connections
	fx.in.connect(fx.filter);
	fx.in.connect(fx.dry);
	fx.filter.connect(fx.wet);
	fx.dry.connect(fx.out);
	fx.wet.connect(fx.out);
	
	// parameters
	params[name + "-filter-frequency"] = {
		min: 10,
		max: context.sampleRate / 2,
		value: context.sampleRate / 2,
		param: fx.filter.frequency
	}
	
	params[name + "-filter-q"] = {
		min: 1,
		max: 50,
		step: .5,
		value: 1,
		param: fx.filter.Q
	}
	
	params[name + "-filter-mix"] = {
		min: "0",
		max: 1,
		step: .01,
		value: 1,
		param: function(value) 
		{
			crossfade(fx.wet.gain, fx.dry.gain, value);
		}
	}
	
	return fx;
}

function createDelay(name)
{
	// node setup
	var fx = {
		in: context.createGain(),
		out: context.createGain(),
		wet: context.createGain(),
		dry: context.createGain(),
		feedback: context.createGain(),
		delay: context.createDelay(10)
	}

	// initial values
	fx.feedback.gain.value = 0;
	fx.delay.delayTime.value = 15/tempo * 1;
	fx.wet.gain.value = 0;

	// connections
	fx.in.connect(fx.delay);
	fx.in.connect(fx.dry);
	fx.delay.connect(fx.wet);
	fx.delay.connect(fx.feedback);
	fx.feedback.connect(fx.delay);
	fx.wet.connect(fx.out);
	fx.dry.connect(fx.out);

	// params
	params[name + "-delay-time"] = {
		min: "0",
		max: 15,
		step: 1,
		value: 1,
		param: function(value)
		{
			console.log(value, 15/tempo * value);
			fx.delay.delayTime.value = 15/tempo * value;
		}
	}

	params[name + "-delay-feedback"] = {
		min: "0",
		max: 1,
		step: .1,
		value: "0",
		param: fx.feedback.gain
	}

	params[name + "-delay-level"] = {
		min: "0",
		max: .8,
		step: .1,
		value: "0",
		param: fx.wet.gain
	}

	return fx;
}

function createShaper(name)
{
	// node setup
	var fx = {
		in: context.createGain(),
		out: context.createGain(),
		shaper: context.createWaveShaper(),
		shaperGain: context.createGain(),
		wet: context.createGain(),
		dry: context.createGain(),
	}
	
	// initial values
	fx.shaper.curve = shaperCurves[0];
	fx.wet.gain.value = 1;
	fx.dry.gain.value = 0;
	
	// connections
	fx.in.connect(fx.shaper);
	fx.in.connect(fx.dry);
	
	fx.shaper.connect(fx.shaperGain);
	fx.shaperGain.connect(fx.wet);
	
	fx.wet.connect(fx.out);
	fx.dry.connect(fx.out);
	
	// parameters
	params[name + "-distortion-amount"] = {
		min: "0",
		max: 99,
		step: 1,
		value: "0",
		param: function(value)
		{
			fx.shaper.curve = shaperCurves[value];
			// lower the gain at higher curves
			fx.shaperGain.gain.value = (.8 * Math.pow(-1 * value / 99, 3)) + 1;
		}
	}
	
	params[name + "-distortion-mix"] = {
		min: "0",
		max: 1,
		step: .01,
		value: 1,
		param: function(value)
		{
			crossfade(fx.wet.gain, fx.dry.gain, value);
		}
	}
	
	return fx;
}

// @todo - where is this from?
function crossfade(a, b, val)
{
	// 1 = full a, 0 = full b
	a.value = Math.cos((1-val) * 0.5*Math.PI);
	b.value = Math.cos(val * 0.5*Math.PI);
}

// http://www.musicdsp.org/archive.php?classid=4#46
function createShaperCurves()
{
	var len = 22050;
	var curves = [];
	for (var amt = 0; amt < 1; amt += .01) {
	
		var data = new Float32Array(len);
		var k = 2 * amt / (1 - amt)
	
		for (var i = 0; i < len; i++) {
			var n = (i / (len - 1) * 2) - 1;
			data[i] = (1 + k) * n / (1 + k * Math.abs(n))
		}
		curves.push(data);
	}
	return curves;
}

function setTempo(val)
{
	// set the tempo
	tempo = val;
	
	// set all the delays...
	$(".param[name$=delay-time]").each(function() {
		setParam(params[$(this).attr("name")], $(this).val());
	})
}