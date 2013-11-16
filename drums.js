// test for git! (again)
// why is this not working?
tmp = null;
/* 
TODOS:
- Github.
- Choke/mute groups from interface
- clear row
- improve panning response (similar to volume)
- test out different audio formats (for smaller file sizes)
	(mp3 seems to work well enough in Chrome/Safari - will probably go with that)
- panning per row
- panning?
- 32nd note resolution
- variable steps
- time signatures?
- save/load patterns: working (sort of) through urls, maybe make server based?
- variable drum sets
- code cleanup
- interface controls for iPhone size (ok for now, needs work)
- fallbacks for file types?
- faster clicks for ios (better on grid, buttons need help)
- Envelope per cell?
- Ruffrider kit - velocity mapping?
- Refactor background color changing (not hardcoding!)
- Remove jquery?
- Better design (responsive?)
- Save/export
- multiple LFOs?
- flexible fx routing (per row?)
- export (browser :( )
- fix LFO update on tempo change from UI
- add LFO to save/load routine
- LFO routing
- Wet/Dry for FX
- Think about how the overall routing looks
- stop button resyncs from start of measure
- Fix LFO Frequency modulation (and calculation from tempo)
- think about multiple LFOs controlling an individual slider (will work from audio, but how to visually represent?)
- constrain tempo
- wrap ALL UI updates in requestAnimFrame
- wet/dry
- basic editing on sound rows (attack/decay, etc)
*/
var audio = true;
var numSteps = 16;
var steps = [];
var mutes = [];
var solos = [];
var volumes = [];
var rowVolumes = [];
var isSettingVolume = false; // remove
var isSettingPan = false; // remove
var pans = [];
var envs = {};
var currentStep = 0;
var buffers = []; // holds the loaded sounds
var context = null; // audio context
var scheduleAhead = .1 // buffer in seconds, to set ahead 
var d = null; // TODO: rename (this is the animation timeout variable)
var tempo = 120;
var nextStepTime = 0;
var startTime = 0; // TODO: Is this used?
var queue = []; // used to match up the drawing timing with the sound
var lastStepDrawn = -1;
var currentSound = null; // remove?
var amp = null;
var lfo = null;
var lfo_gain = null;
var filter = null;
var viz = null;
var lfo_buffers = {}
var lfos = []
var tmp = true;
var delay, delayGain, shaper, curves = [];
var sounds = [ // TODO: add colors here?
	{
		name:"kick",
		source:"Ruffrider/Kick 3.mp3",
		mute:null
	},
	{
		name:"snare",
		source:"Ruffrider/Snare base 4.mp3",
		mute:null
	},
	{
		name:"rim",
		source:"Ruffrider/Snare rim 3.mp3",
		mute:null
	},
	{
		name:"cl hat",
		source:"Ruffrider/hihat base 3.mp3",
		mute:1
	},
	{
		name:"op hat",
		source:"Ruffrider/hihat open 3.mp3",
		mute:1
	},
	{
		name:"ride",
		source:"Ruffrider/ride 3.mp3",
		mute:2
	}
];
var fx_str = [];
var show = 0;
var frameSkip = 0;

// 1 beat in seconds = 60/tempo
// 1 measure in seconds = 60/tempo*4

var nodes = []; // keeps track of the sound nodes, used for the choke groups
var default_pattern = "?t=98&r=100,100,42,100,33,100&s=0.0.75,0.3.24,0.5.23,0.6.75,0.9.48,0.11.75,0.13.59,1.4.75,1.7.21,1.12.75,1.15.33,2.1.39,2.8.49,3.0.75,3.4.75,3.6.75,3.9.28,3.12.75,4.2.75,4.10.75,5.1.0,5.3.30,5.14.41&fx=,,,,,,,";
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback ){
        window.setTimeout(callback, 1000 / 60);
    };
})();
window.cancelAnimFrame = (function(){
	return window.cancelAnimationFrame ||
	window.webkitCancelAnimationFrame;
})();


function log(text) {
	$("#log").text(text);
}

//-------------------------------------
// INIT FUNCTIONS
//-------------------------------------
$(function() {

	// Set up the audio context
	if (typeof AudioContext !== "undefined") {
	    context = new AudioContext();
	} else if (typeof webkitAudioContext !== "undefined") {
	    context = new webkitAudioContext();
	} else {
	   // TODO some kind of graceful fail needs to go here
	}
	initAudioNodes();
	initInterface();
	initSliders();
	
	// check for a url containing a pattern
	if (location.search != "") {
		// maybe validate the pattern is correct?
		loadPattern(location.search)
	}
	else loadPattern(default_pattern);
	
});
function initSliders() {
	initSliderSetup();
	$(".slider").each(function(){
		// add the slider div
		$(this).prepend($("<div class='slider-control'>"));
		$(this).data("params").label = $(this).children("span").text();
		if ($(this).hasClass("lfo")) {
			$(this).prepend($("<div class='slider-shadow-control'>"));
			$(this).prepend($("<div class='slider-shadow'>"));
			var button = $("<button>lfo</button>");
			$(this).append(button);
			addInteraction(button, {
				click: function(data) {
					setVisibleLFO(data.t.parent());
				}
			});			
			$(this).data("params").lfo = new LFO("sine", 1, 0, $(this));
			$(this).data("params").LFOcontrol = $(this).data("params").lfo;
			lfos.push($(this).data("params").lfo)
		}
		setSliderToDefault($(this), true);
	});
	addInteraction($(".slider"), {
		init: function(t) {
			return {
				height: t.height(),
				control: t.children('div.slider-control'),
				start: t.children('div.slider-control').position().top,
				max: t.data("params").max,
				min: t.data("params").min,
				stepSize: t.data("params").stepSize,
				onDrag: t.data("params").onDrag,
				LFOtarget: t.data("params").LFOtarget
			}
		},
		drag: function(data) {
			requestAnimFrame(function(){
				var p = data.start - data.deltaY;
				if (p < 0) p = 0;
				if (p > data.height) p = data.height;
				data.control.css("top", p + "px");
				//data.control.css("-webkit-transform", "translate3d(0," + p + "px,0)");
				//data.control.css("-webkit-transform", "translateY(" + p + "px)");
				var current = getSliderValue(data.t, p);
				if (data.onDrag) data.onDrag(current);
				data.t.data("current", current);
				// p is the position of the current slider
				setSliderLFO(data.t, p);
			});
		},
		doubleclick: function(data) {
			setSliderToDefault(data.t);
			//console.log(data.t)
		},
		up: function(data) {
			s();
		}
	});
}
function initSliderSetup() {
	// Filter Frequency
	fx_str = [
		"s_filter_frequency",
		"s_filter_q",
		"s_filter_mix",
		"s_delay_time",
		"s_delay_feedback",
		"s_delay_mix",
		"s_shaper",
		"s_shaper_mix"
	];
	$("#s_filter_frequency").data("params", {
		max: context.sampleRate / 2,
		min: 10,
		stepSize: 1,
		defaultValue: context.sampleRate / 2,
		onDrag: function(value) {
			filter.frequency.value = value;
		}
	});
	
	// Filter Q
	$("#s_filter_q").data("params", {
		max: 100,
		min: 1,
		stepSize: .5,
		defaultValue: 1,
		onDrag: function(value) {
			filter.Q.value = value;
		}
	});
	
	// Filter Wet/Dry Crossfade
	$("#s_filter_mix").data("params", {
		max: 1,
		min: 0,
		stepSize: .01,
		defaultValue: 1,
		onDrag: function(value) {
			crossfade(filter, value);
		}
	});
	
	// Delay Time
	$("#s_delay_time").data("params", {
		max: 16,
		min: 0,
		stepSize: 1,
		defaultValue: 0,
		onDrag: function(value) {
			// 16th note delay (how big is one step?)
			value = Math.round(value);
			//console.log(15/tempo * value)
			delay.delayTime.value = 15/tempo * value;
		}
	});
	
	// Delay Feedback
	$("#s_delay_feedback").data("params", {
		max: 1,
		min: 0,
		stepSize: .01,
		defaultValue: 0,
		onDrag: function(value) {
			delay.feedback.gain.value = value;
		}
	});
	
	// Delay Mix
	$("#s_delay_mix").data("params", {
		max: 1,
		min: 0,
		stepSize: .01,
		defaultValue: 0,
		onDrag: function(value) {
			delayGain.gain.value = value;
		}
	});
	
	// Shaper curve
	$("#s_shaper").data("params", {
		max: 99,
		min: 0,
		stepSize: 1,
		defaultValue: 0,
		onDrag: function(value) {
			value = Math.round(value);
			shaper.curve = curves[value];
			// adjust the gain
			shaperGain.gain.value = (.8*Math.pow(-1*value/99,3))+1
			//console.log(shaperGain.gain.value)
		}
	});
	
	$("#s_shaper_mix").data("params", {
		max: 1,
		min: 0,
		stepSize: .01,
		defaultValue: 1,
		onDrag: function(value) {
			//crossfade(filter, value);
		}
	});
	/* removing LFOs for now...
	$("#lfo_type").data("params", {
		max: 3,
		min: 0,
		stepSize: 1,
		defaultValue: 0,  
		onDrag: function(value) {
			this.LFOtarget.type = ["sine", "square", "sawtooth", "triangle"][value];
			//console.log(value)
			drawLFO(this.LFOtarget);
		}
	});
	
	$("#lfo_gain").data("params", {
		max: 1,
		min: -1,
		stepSize: .01,
		defaultValue: 0,
		onDrag: function(value) {
			// TODO: make this more explicit? There is possible a nasty bug hiding here
			this.LFOtarget.gain = value;
			//console.log(this)
		}
	});
	
	$("#lfo_rate").data("params", {
		max: 20,
		min: 1,
		stepSize: 1,
		defaultValue: 1,
		onDrag: function(value) {
			this.LFOtarget.rate = value;
			setLFOfrequency();
			drawLFO(this.LFOtarget);
		}
	});
	
	$("#lfo_phase").data("params", {
		max: 1,
		min: 0,
		stepSize: .25/2,
		defaultValue: 0,
		onDrag: function(value) {
			if (value == 1) value = 0;
			this.LFOtarget.phase = value;
			drawLFO(this.LFOtarget)
		}
	});
	*/
}
function initAudioNodes() {
	amp = context.createGainNode()	

	initLFObuffers();
		
	// Create a filter (set to open by default)
	filter = context.createBiquadFilter();
	filter.frequency.value = context.sampleRate / 2;
	filter.frequency.base = filter.frequency.value;
	filter.Q.value = 1;	
	
	// ** TESTS FOR WET/DRY
	filter.wetAmp = context.createGainNode();
	filter.dryAmp = context.createGainNode();
	
	filter.dryAmp.gain.value = 0;
	filter.connect(filter.wetAmp);
	
	amp.connect(filter);
	amp.connect(filter.dryAmp);
	
	delay = context.createDelayNode(10);
	delay.feedback = context.createGainNode();
	delay.feedback.gain.value = 0;
	delay.connect(delay.feedback);
	delay.feedback.connect(delay);
	delay.delayTime.value = 0;
	delayGain = context.createGainNode();
	delayGain.gain.value = 0;
	
	// test for waveshaper...
	var len = 22050;
	for (var amt = 0; amt < 1; amt += .01) {
	
		var data = new Float32Array(len);
		var k = 2*amt/(1-amt)
		//var k = amt*20 + 1;
	
		for (var i = 0; i < len; i++) {
			var n = (i/(len-1)*2) - 1;
			// curve 1
			data[i] = (1+k)*n/(1+k*Math.abs(n))
			// http://www.musicdsp.org/archive.php?classid=4#46
			// curve 2
			//data[i] = n*(Math.abs(n) + k)/(Math.pow(n,2) + (k-1)*Math.abs(n) + 1)
		}
		curves.push(data);
	}
	
	shaper = context.createWaveShaper();
	shaperGain = context.createGainNode();
	shaper.connect(shaperGain);
	shaperGain.connect(context.destination);
	shaper.curve = curves[0];
	
	filter.dryAmp.connect(delay);
	filter.wetAmp.connect(delay);
	delay.connect(delayGain);
	delayGain.connect(context.destination);
	filter.dryAmp.connect(shaper);
	filter.wetAmp.connect(shaper);
}
function initInterface() {
	var m = $("<div class='row'></div>").appendTo($("#rows"));
	for (var i=0;i<numSteps;i++) {
		$("<div class='metronome'><div>").appendTo(m);
	}
	
	// create the holder for the sequencer rows
	//var t = $("<div class='t'>").appendTo($("#seq"));
	
	//$("<div class='label'>").html("&nbsp;").appendTo("#labels");
	for (var i = 0, len = sounds.length; i < len; i++) {
		// load the sound
		loadSound(sounds[i]);
		
		// create a sequencer row and set up the sequence
		var label = $("<div class='label'>").text(sounds[i].name);
		var vol = $("<div class='vol'>")
		vol.appendTo(label);
		addInteraction(vol, {
			init: function(t) {
				var row = t.parent().index(),
					startV = rowVolumes[row];
				return {
					row: row,
					startV: startV
				}
			},
			drag: function(data) {
				var vol = calcVolume(data.startV, data.deltaY);
				rowVolumes[data.row] = vol;
				setBackground(data.t,vol)
			},
			up: function(){
				s();
			}
		});
		setBackground(vol,1);
		
		label.appendTo("#labels");
		var r = $("<div class='row'>").appendTo($("#rows"));
		
		// initialize the control arrays
		steps[i] = [];
		volumes[i] = [];
		// pans[i] = [];
		mutes[i] = 0;
		solos[i] = 0;
		rowVolumes[i] = 1;
		
		// TODO: set volume in default variable
		for (var j = 0; j < numSteps; j++) {
			$("<div class='cell'>").data("volume",".75").appendTo(r);
			steps[i][j] = 0;
			volumes[i][j] = .75;
			// pans[i][j] = 0;
		}
	}
	
	// TODO: switch this to delegated event from the parent (need to do this in case we dynamically add more stuff)

	///*
	addInteraction($(".cell"), {
		init: function(t) {
			var row = t.parent().index() - 1;
			var cell = t.index();
			var isTurningOn = false;
			var vol = volumes[row][cell];
			if (!t.hasClass("on")) {
				t.addClass("on");
				steps[row][cell] = steps[row][cell] ? 0 : 1;
				setBackground(t,vol);
				isTurningOn = true;
				s();
			}
			return {
				cell: cell,
				row: row,
				startV: vol,
				isTurningOn: isTurningOn
			}
		},
		drag: function(data) {
			vol = calcVolume(data.startV, data.deltaY)
			volumes[data.row][data.cell] = vol;
			setBackground(data.t,vol)
		},
		up: function() {
			s();
		},
		click: function(data) {
			if (data.isTurningOn == false) {
				steps[data.row][data.cell] = steps[data.row][data.cell] ? 0 : 1;
				data.t.removeClass("on");
				setBackground(data.t,0);
				s();
			}
		}
	});
  
	$("#start").click(function(){
		
		// init for iOS
		// TODO: Confirm this is needed
		// TODO: reset the LFO
		var s = context.createBufferSource();
		s.buffer = buffers[sounds[0].name];
		var volume = context.createGainNode();
		volume.gain.value = 0;
		s.connect(volume);
		volume.connect(context.destination);
		s.noteOn(0)
		
		nextStepTime = context.currentTime;
		d = requestAnimFrame(draw)
	})
	$("#stop").click(function(){
		window.cancelAnimFrame(d);
	})

	$("[name=tempo]").change(function(){
		//tempo = parseFloat($(this).val());
		setTempo(parseFloat($(this).val()));
		s();
		return false;
	});
	
	addInteraction($("[name=tempo]"), {
		init: function() {
			return {
				startTempo: tempo
			}
		},
		drag: function(data) {
			data.t.val(data.startTempo + data.deltaY).trigger('change');	
		},
		click: function(data) {
			data.t.focus();
		}
	});
		
	$("#clear").click(clearPattern);
	
	addInteraction($("#fx"),{
		click: function() {
			$("#more").toggleClass("active");
			//$("#seq").toggleClass("hidden");
		}
	});
	//$("#fx").click(function() {
	//	$("#more").toggleClass("active");
	//});
	
	
}
function initLFObuffers() {
	// build each buffer for one second
	["sine", "square", "triangle", "sawtooth", "noise"].forEach(function(type) {
		lfo_buffers[type] = context.createBuffer(1,context.sampleRate,context.sampleRate);
		// build the buffer data
		var lfo_data = lfo_buffers[type].getChannelData(0);
		for (var i = 0; i < lfo_data.length; i++) {
			lfo_data[i] = getLFOSample(type, i/lfo_data.length)
		}
	});
}
function loadSound(sound) {
	var request = new XMLHttpRequest();
	request.open('GET',sound.source,true);
	request.responseType = 'arraybuffer';
	request._mute = sound.mute;
	request._name = sound.name;
	request.onload = function(){
		context.decodeAudioData(request.response,function(buffer){
			buffer._mute = request._mute;
			buffer._name = request._name;
			buffers[request._name] = buffer;
		})
	}
	request.send();
}

//-------------------------------------
// SLIDER FUNCTIONS
//-------------------------------------
function getSliderPosition(slider, val) {
	// takes an actual value and returns the corresponding pixel value based on the slider range
	// need the percentage of the value within the range (take steps into account)
	// (max - min) * steps is the range
	// 0 .5 1 1.5 2 (stepsize = .5)
	// 0 1  2  3  4 (step / stepsize)
	// num steps = (max - min) + 1 (is this always true?) 3 4 (5) 6 7 num steps = 5
	var p = slider.data("params"),
		height = slider.height(),
		steps = ((p.max - p.min)/p.stepSize) + 1,
		range = (p.max - p.min)/p.stepSize;
	//console.log("h",height)
	return height - (((val - p.min)/p.stepSize)/range * height);
}
function getSliderValue(slider, position) {
	// takes a pixel position and returns the value based on the range
	var height = slider.height(),
		p = slider.data("params"),
		max = p.max,
		min = p.min,
		stepSize = p.stepSize,
		value = 0;
	value = (height - position)/height;
	value = value * (max - min) + min;
	value = Math.round(value/stepSize) * stepSize;
	return value;
}
function setSliderToDefault(slider, init) {
	var defaultValue = slider.data("params").defaultValue;
	var p = getSliderPosition(slider, defaultValue);
	slider.data("current", defaultValue)
	//console.log(slider.data("params").defaultValue);
	slider.children('div.slider-control').css("top", p + "px");
	if (init !== true) {
		setSliderLFO(slider, p);
		if (slider.data("params").onDrag) {
			slider.data("params").onDrag(defaultValue);
		}
	}
	s();
}
function setSliderPosition(slider, value, init) {
	var p = getSliderPosition(slider, value);
	slider.children('div.slider-control').css("top", p + "px");
	if (init !== true) {
		setSliderLFO(slider, p);
		if (slider.data("params").onDrag) {
			slider.data("params").onDrag(value);
		}
	}
}
function setSliderLFO(slider, p) {
	var params = slider.data("params")
	if ((params.LFOtarget && params.sliderTarget) || params.LFOcontrol) {
		var t = params.LFOtarget == null ? false : true;
		var target = t ? params.sliderTarget : slider;
		var control = t ? slider : params.sliderControl;
		var shadow = target.children("div.slider-shadow");
		// position of the target slider
		var controlPos = t ? target.children("div.slider-control").position().top : p;
		// actual value of the controlling slider (between 1 and -1) should be able to get this from the LFO gain
		//var value = getSliderValue(control, t ? p : control.children("div.slider-control").position().top);
		var value = t ? getSliderValue(control, p) : params.LFOcontrol.gain;
		var max = target.data("params").max;
		var min = target.data("params").min;
		var mult = max - min; // multiplier
		var mod = value * mult; // how much to shift the value
		var controlValue = getSliderValue(target, controlPos);
		if (controlValue + mod > max) mod = max - controlValue;
		if (controlValue + mod < min) mod = min - controlValue;	
		var h = target.height() - getSliderPosition(target, Math.abs(mod));
		shadow.css("top", (controlPos - (value > 0 ? h : 0)) + "px")
		shadow.css("height",h + "px");
		if (t) params.LFOtarget.control.gain.value = mod;
		else params.LFOcontrol.control.gain.value = mod;
	}
}
function crossfade(fx, value) {
	fx.wetAmp.gain.value = Math.cos((1-value) * 0.5*Math.PI);
	fx.dryAmp.gain.value = Math.cos(value * 0.5*Math.PI);
}

//-------------------------------------
// LFO FUNCTIONS
//-------------------------------------
function LFO(type, rate, phase, slider) {
	var lfo = this;
	//var lfo = makeLFO(type);
	lfo.type = type;
	lfo.rate = rate;
	lfo.phase = phase;
	lfo.gain = 0;
	lfo.control = context.createGainNode();
	lfo.control.gain.value = 0;
	lfo.slider = slider;
	lfo.makeLFO = function() {
		var node = context.createBufferSource();
		//console.log(this.type)
		node.buffer = lfo_buffers[this.type];
		node.loop = true;
		node.playbackRate.value = this.rate / (60/tempo*4);
		if (this.control) node.connect(this.control)
		this.bufferNode = node;
	}
	lfo.makeOffsetLFO = function() {
		var node = context.createBufferSource();
		node.buffer = lfo_buffers[this.type];
		node.playbackRate.value = this.rate / (60/tempo*4);
		if (this.control) node.connect(this.control)
		this.offsetBufferNode = node;	
	}
	lfo.makeLFO();
	lfo.viz = typeof context.createScriptProcessor != "undefined" ? context.createScriptProcessor(1024) : context.createJavaScriptNode(1024);
	lfo.viz.onaudioprocess = function(e) {
		requestAnimFrame(function(){
		// need to modify to not read from the target slider anymore (since it won't always be visible)
			var target = lfo.slider;
			var shadow = target.children("div.slider-shadow-control");
			var control = target.children("div.slider-control");
			var controlPos = control.position().top;
			var controlValue = getSliderValue(target, controlPos);
			var current = controlValue + e.inputBuffer.getChannelData(0)[0];
			//log(e.inputBuffer.getChannelData(0)[0]);
			if (show == 1) {
			  shadow.css("top", getSliderPosition(target, current) + "px");
			}
			// test modifying the actual param...
			//lfo.control.out.value = current; // is this the right thing to do? or, should call the slider's function?
			lfo.slider.data("params").onDrag(current);
		});
	}
	lfo.control.connect(lfo.viz)
	lfo.viz.connect(context.destination)
	return lfo;	
}
function setLFOfrequency() {
	// 1 measure = 60/tempo*4
	// need to set the playbackRate to match (1 LFO buffer = 1 second)
	for (var i = 0; i < lfos.length; i++) {
		lfos[i].bufferNode.playbackRate.value = lfos[i].rate / (60/tempo*4);
	}
	
}
function drawLFO(lfo) {
	var tmp = [];
	var offset = lfo.phase;
	var freq = lfo.rate;
	var len = 1000;
	var phase = 0;
	for (var i = 0; i < len; i++) {
		phase = (i%(len/freq))/(len/freq) + offset;
		if (phase > 1) phase -=1;
		tmp[i] = getLFOSample(lfo.type, phase)
	}
	sparkline("c1",tmp);
}
function getLFOSample(type, phase) {
	switch (type) {
		case "square":
			return phase > .5 ? 1 : 0;
		break;
		case "triangle":
			return phase > .5 ? 1 - (phase - .5) * 2 : phase * 2;
		break;
		case "sawtooth":
			return phase;
		break;
		case "noise":
			return Math.random();
		break;
		case "sine":
		default:
			return Math.sin(phase*Math.PI*2)/2 + .5;
		break
	}
}
function setVisibleLFO(slider) {
	//console.log(slider)
	// set the LFOtarget and the sliderTarget for the control slider
	$("#lfo_gain").data("params").sliderTarget = slider;
	
	["gain","rate","phase","type"].forEach(function(val) {
		$("#lfo_" + val).data("params").LFOtarget = slider.data("params").lfo;
		var value = slider.data("params").lfo[val];
		if (val == "type") {
			value = ["sine","square","sawtooth","triangle"].indexOf(value);
			//console.log(value);
		}
		setSliderPosition($("#lfo_" + val), value);
	});	
}

//-------------------------------------
// PATTERN LOAD/SAVE
//-------------------------------------
function s() {
	// sequencer steps (and step volumes)
	var s = [];
	for (var i = 0; i < steps.length; i++) {
		for (var j = 0; j < steps[i].length; j++) {
			if (steps[i][j] == 1) {
				s.push(i + "." + j + "." + Math.round(volumes[i][j]*100))
			}
		}
	}
	s = s.join(",");
	
	// row volumes
	var r = [];
	for (i = 0; i < rowVolumes.length; i++) {
		r[i] = Math.round(rowVolumes[i]*100);
	}
	
	var fx = [];
	// what order should we go in...
	fx_str.forEach(function(id) {
		// get the value...
		var slider = $("#" + id);
		var val = slider.data("current");
		var defaultValue = slider.data("params").defaultValue;
		if (val == defaultValue) {
			val = "";
		}
		// write the string
		fx.push(val);
	});
	//console.log(fx);
	
	var url = "?t=" + tempo + "&r=" + r.join(",") + "&s=" + s + "&fx=" + fx.join(",");
	//console.log(url)
	var a = document.getElementById("link");
	a.href = url;
}
function loadPattern(pattern) {
	//first get the tempo...
	pattern = pattern.split("&");
	setTempo(parseFloat(pattern[0].replace("?t=", "")));
	
	// now get the row volumes
	var tmp_steps = pattern[1].replace("r=","").split(",");
	for (var x = 0; x < tmp_steps.length; x++) {
		var v = tmp_steps[x]/100;
		rowVolumes[x] = v;
		setBackground($(".vol").eq(x),v);
	}
	
	// now do the pattern
	var tmp_steps = pattern[2].replace("s=","").split(",");
	// console.log(tmp_steps)
	for (var ii = 0; ii < tmp_steps.length; ii++) {
		if (tmp_steps[ii] == "") continue; // check for empty pattern
		var tmp_step = tmp_steps[ii].split(".")
		var i = parseInt(tmp_step[0]);
		var j = parseInt(tmp_step[1]);
		// set the step
		steps[i][j] = 1;
		volumes[i][j] = tmp_step[2]/100;
		var target = $(".row").eq(i+1).children(".cell").eq(j);
		target.addClass("on");
		setBackground(target,tmp_step[2]/100)
	}
	
	// now the fx
	var fxs = pattern[3].replace("fx=","").split(",");
	//console.log(fxs.length)
	for (var i = 0; i < fxs.length; i++) {
		var slider = $("#" + fx_str[i]);
		if (fxs[i] == "") continue;
		slider.data("current", fxs[i]);
		slider.children('div.slider-control').css("top", getSliderPosition(slider, fxs[i]) + "px");
		if (slider.data("params").onDrag) {
			slider.data("params").onDrag(fxs[i]);
		}
	}
	
	//reset the link...
	s();
}
function clearPattern() {
	//console.log("clear")
	for (var i = 0;i < steps.length;i++) {
		for (var j=0;j < steps[i].length;j++) {
			// get the target of the current cell
			var target = $(".row").eq(i+1).children(".cell").eq(j);
			target.removeClass("on");
			steps[i][j] = 0;
			volumes[i][j] = .75;
			setBackground(target,0);
		}
	}
	s();
}

//-------------------------------------
// SEQUENCER UTILITIES
//-------------------------------------
function setTempo(t) {
	tempo = t;
	$("[name=tempo]").val(tempo);
	setLFOfrequency();
}
function setMetronome(step) {
	$(".metronome div.on").removeClass("on");
	$(".metronome div").eq(step).addClass("on");
}
function setBackground(target,vol) {
		var prop = "rgba(29,17,253," + vol + ")";
		requestAnimFrame(function(){
			target.css("background-color", prop);
		})
}
function calcVolume(startV, deltaY) {
	var vol = parseFloat(startV) + (deltaY/100);
	if (vol > 1) vol = 1;
	if (vol < 0) vol = 0;
	vol = Math.round(vol*100)/100;
	return vol;
}
function exp_volume(vol) { // convert volume to exponential curve
	return vol;
	//return Math.pow(10,-3)*Math.exp(6.908*vol);
}
function playSound(buffer, time, volume) {
	var source = context.createBufferSource();
	source.buffer = buffer;
	
	var v = context.createGainNode();
	v.gain.value = exp_volume(volume);

	source.connect(v);
	//v.connect(context.destination)
	v.connect(amp)
	source.noteOn(time);
	nodes.push(source);
}

//-------------------------------------
// MAIN SEQUENCER LOOP
//-------------------------------------
// TODO: rename this function!
function draw() {
	d = requestAnimFrame(draw);
	if (frameSkip == 1)
	{
		frameSkip = 0;
		return;
	}
	
	// clean up the nodes array for anything that has finished playing...
	for (var i = nodes.length;i-- > 0;) {
		if (nodes[i].playbackState == 3) {
			nodes.splice(i,1);
		}
	}	
	
	// find out if any rows are soloed...
	var solo = 0;
	for (var i = 0; i < solos.length; i++) {
		solo += solos[i];
	}
	
	// schedule any upcoming sounds
	while (nextStepTime < context.currentTime + scheduleAhead) {	
		for (var i = 0,len = steps.length; i < len; i++) {
			var name = sounds[i].name;
			if (steps[i][currentStep] == 1) {
				// check for mute groups
				if (buffers[name]._mute != null) {
					for (var j = 0; j < nodes.length; j++) {
						if (nodes[j].buffer._mute == buffers[name]._mute) {
							nodes[j].noteOff(nextStepTime);
						}
					}
				}
				if ( (solo == 0 || (solo > 0 && solos[i] == 1) ) && mutes[i] == 0 ) {
					// schedule the sound
					playSound(buffers[name],nextStepTime,volumes[i][currentStep] * rowVolumes[i]);
				}
			}
		}
		
		// reset all the LFOs on beat 1
		if (currentStep == 0) {
			for (var i = 0; i < lfos.length; i++) {
				lfos[i].bufferNode.noteOff(nextStepTime);
				lfos[i].makeLFO();
				var offsetTime = 0;
				if (lfos[i].phase > 0) {
					lfos[i].makeOffsetLFO();
					var o = lfos[i].phase;
					lfos[i].offsetBufferNode.noteGrainOn(nextStepTime,o,1-o);
					offsetTime = (1-o)/lfos[i].bufferNode.playbackRate.value;
				}
				lfos[i].bufferNode.noteOn(nextStepTime + offsetTime);
			}
		}
		
		// move to the next step
		queue.push({note:currentStep,time:nextStepTime})
		// calculate the next step based on the current tempo...
		var stepTime = 15/tempo; 
		nextStepTime += stepTime; 
		currentStep++;
		if (currentStep == 16) {
			currentStep = 0;
		}
	}
	
	// do the graphics updates
	var currentNote = lastStepDrawn;
	var currentTime = context.currentTime;
	while (queue.length && queue[0].time < currentTime) {
		currentNote = queue[0].note;
		queue.splice(0,1)
	}
	
	if (currentNote != lastStepDrawn) {
		setMetronome(currentNote);
		lastStepDrawn = currentNote;
	}
	
	frameSkip = 1;
}

//-------------------------------------
// UTILITIES
//-------------------------------------
function addInteraction(target, cb) {
	target.on("mousedown touchstart", function(e) {
		var data = {};
		e = touchify(e);
		if (cb.init) {
			data = cb.init($(this));
		}
		data.startX = e.pageX;
		data.startY = e.pageY;
		data.t = $(this);
		if (cb.down) { // this might not be needed!
			cb.down(data);
		}
		$(document)
			.on("mousemove touchmove", function(e) {
				e = touchify(e);
				// get the mousemove deltas...
				if (cb.drag) {
					data.deltaX = data.startX - e.pageX;
					data.deltaY = data.startY - e.pageY;
					cb.drag(data);
				}	
				return false;				
			})
			.on("mouseup touchend", function(e) {
				e = touchify(e);
				$(document).off("mousemove touchmove mouseup touchend");
				// do a click detection
				if (e.pageY == data.startY && e.pageX == data.startX) {
					if (cb.click) {
						cb.click(data);
					}	
					if (cb.doubleclick) {
						if (typeof data.t.data("clickCount") != "number") {
							data.t.data("clickCount",0);
						}
						if (data.t.data("clickCount") > 1) {}			
						data.t.data("clickCount",data.t.data("clickCount")+1);
						if (data.t.data("clickCount") == 1) {
							setTimeout(function(){
								data.t.data("clickCount",0);
							}, 300);
						}
						if (data.t.data("clickCount") > 1) {
							//console.log("doubleclick?")
							cb.doubleclick(data);
							data.t.data("clickCount",0);
						}
					}
				}
				else if (cb.up) {
					cb.up(data);
				}
				return false;
			});
		return false;
	});
}
function touchify(e) { 
	// fix for jquery touch event handling
	// adapted from http://www.the-xavi.com/articles/trouble-with-touch-events-jquery
	if (e.originalEvent.touches && e.originalEvent.touches.length) {
		new_event = e.originalEvent.touches[0];
		if (e.data) {
			new_event.data = e.data
		}
		return new_event;
	}
	else if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
		new_event = e.originalEvent.changedTouches[0];
		if (e.data) {
			new_event.data = e.data
		}
		return new_event;
	}
	else return e;
}
// TODO: add attribution (from adactio), and move into the drawLFO method (probably)
function sparkline(canvas_id, data, endpoint) {
	if (window.HTMLCanvasElement) {
		var c = document.getElementById(canvas_id),
			ctx = c.getContext('2d'),
			height = c.height - 0.5,
			width = c.width - 0.5,
			total = data.length,
			max = 1, //Math.max.apply(Math, data),
			min = 0, //Math.min.apply(Math, data),
			xstep = width/total,
			ystep = (max-min)/height,
			offset = min < 0 ? -1*min : 0,
			x = 0,
			y = height - (data[0] + offset)/ystep,
			i;
			c.height = c.height;
		//console.log(xstep)
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(0,0,0,1)';
		ctx.moveTo(x, y);
		for (i = 1; i < total; i = i + 1) {
			x = x + xstep;
			y = height - (data[i] + offset)/ystep;
			ctx.lineTo(x, y);
		}
		ctx.stroke();
		if (endpoint) {
			ctx.beginPath();
			ctx.fillStyle = 'rgba(255,0,0,0.5)';
			ctx.arc(x, y, 1.5, 0, Math.PI*2);
			ctx.fill();
		}
	}
};