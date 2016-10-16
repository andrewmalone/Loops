/*global context, seconds_per_measure, looper, NUMSTEPS, config */

function createShuffler()
{
	if (!config.shuffler) { return null; }
	var fx = {
		input: context.createGain(),
		output: context.createGain(),
		dry: context.createGain(),
		wet: context.createGain(),
		capture: context.createScriptProcessor(4096),
		captureBuffers: [],
		playbackBuffers: [],
		slices: 8,
		currentSlice: 0,
		currentOffset: 0
	};

	fx.input.connect(fx.capture);
	fx.input.connect(fx.dry);
	fx.dry.connect(fx.output);
	fx.wet.connect(fx.output);
	fx.dry.gain.value = 0.5;
	fx.wet.gain.value = 1;
	
	fx.capture.connect(context.destination);
	fx.capture.onaudioprocess = function (e)
	{	
		var targetBuffer,
			sourceBuffer,
			overflowBuffer = null;
		
		if (looper === null) { return; }
		if (fx.captureBuffers.length === 0)
		{
			fx.initBuffer(0);
		}
		
		targetBuffer = fx.captureBuffers[fx.currentSlice].getChannelData(0);
		sourceBuffer = e.inputBuffer.getChannelData(0);
		if (sourceBuffer.length + fx.currentOffset > targetBuffer.length)
		{
			// overflow to the next buffer
			overflowBuffer = sourceBuffer.subarray(targetBuffer.length - fx.currentOffset);
			// console.log(sourceBuffer);
			sourceBuffer = sourceBuffer.subarray(0, targetBuffer.length - fx.currentOffset);
			//console.log(sourceBuffer.length);
			// console.log(targetBuffer);
			// return;
			
		}
		targetBuffer.set(sourceBuffer, fx.currentOffset);
		//console.log("%s: %s to %s", fx.currentSlice, fx.currentOffset, fx.currentOffset + sourceBuffer.length);
		fx.currentOffset += sourceBuffer.length;
		
		if (overflowBuffer !== null)
		{
			// move to the next buffer
			fx.currentSlice = (fx.currentSlice + 1) % fx.slices;
			fx.initBuffer(fx.currentSlice);
			targetBuffer = fx.captureBuffers[fx.currentSlice].getChannelData(0);
			targetBuffer.set(overflowBuffer);
			fx.currentOffset = overflowBuffer.length;
			// console.log("%s: 0 to %s", fx.currentSlice, fx.currentOffset);
		}		
	};
	
	
	fx.initBuffer = function (i)
	{
		// console.log("init %s", i);
		if (i === 0 && fx.captureBuffers.length !== 0)
		{
			fx.swapBuffers();
		}
		fx.captureBuffers[i] = context.createBuffer(1, context.sampleRate * seconds_per_measure() / fx.slices, context.sampleRate);
		//console.log(fx.captureBuffers[i].getChannelData(0));
	};
	
	fx.swapBuffers = function ()
	{
		var tmp = fx.captureBuffers;
		fx.playbackBuffers = tmp;
		fx.captureBuffers = [];
		//console.log("swap!", fx.playbackBuffers, fx.captureBuffers);
	};
	
	fx.playBuffer = function (buffer, time)
	{
		//console.log(buffer);
		if (fx.playbackBuffers.length === 0) { return; }
		var source, v;
		source = context.createBufferSource();
		source.buffer = fx.playbackBuffers[buffer];
		
		v = context.createGain();
		// v.gain.value = volume;
		// @todo - change this to an exponential volume curve instead of linear
		
		source.connect(v);
		v.connect(fx.wet);
		source.start(time);
		//scheduledSounds.push(source);
	};
	
	fx.scheduler = function (step, time)
	{
		// console.log(step, time);
		if (step % (NUMSTEPS / fx.slices) === 0)
		{
			//console.log(step, (NUMSTEPS / fx.slices), step / (NUMSTEPS / fx.slices));
			// for now this reverses the playback order.
			// @todo randomize!
			fx.playBuffer(fx.slices - 1 - (step / (NUMSTEPS / fx.slices)), time);
		}
		
	};
	
	return fx;
}

function checkShuffler(step, time)
{
	if (!config.shuffler) { return; }
	context.graph.shuffler.scheduler(step, time);
}