var params = {}

function createAudioGraph(offline)
{
	var g = {};
	g.in = {
		drum: context.createGain(),
		bass: context.createGain()
	}
	g.out = context.createGain();
	g.master = context.createGain();
	g.drumFx = createFx("drum");
	g.bassFx = createFx("bass");
	g.masterFx = createFx("master");
	
	g.in.drum.connect(g.drumFx.in);
	g.drumFx.out.connect(g.master);
	
	g.in.bass.connect(g.bassFx.in);
	g.bassFx.out.connect(g.master);
	
	g.master.connect(g.masterFx.in);
	g.masterFx.out.connect(g.out);
	
	g.out.connect(context.destination);
	return g;
}

function createFx(name)
{
	var fx = {
		filter: createFilter(name),
		delay: createDelay(name)
	}
	
	fx.in = fx.filter.in;
	fx.filter.out.connect(fx.delay.in);
	fx.out = fx.delay.out;
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
		step: .1,
		value: 1,
		param: function(value) {
			crossfade(fx.wet.gain, fx.dry.gain, value);
		}
	}
	
	return fx;
}

function createDelay(name)
{
	// node setup
	fx = {
		in: context.createGain(),
		out: context.createGain(),
		wet: context.createGain(),
		dry: context.createGain(),
		feedback: context.createGain(),
		delay: context.createDelay(10)
	}

	// initial values
	fx.feedback.gain.value = 0;
	fx.delay.delayTime.value = 0;
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
	//params[name + "-delay-time"] = {
		// @todo - tempo synced params
	//}

	params[name + "-delay-feedback"] = {
		min: "0",
		max: 1,
		step: .1,
		value: "0",
		param: fx.feedback.gain
	}

	params[name + "-delay-level"] = {
		min: "0",
		max: 1,
		step: .1,
		value: "0",
		param: fx.wet.gain
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