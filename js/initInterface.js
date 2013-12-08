/*
* init-interface.js
* Initializes the interface. Dynamically draws the pattern grids, creates the pattern and
* sequence rows, and creates all the parameter sliders
*/

// global constants
var BASS_MAX = 52;
var BASS_MIN = 36;
var BASS_RANGE = BASS_MAX - BASS_MIN;

/**
* Build everything
*/
function initInterface()
{
	initDrumGrid();
	initBassGrid();
	initPatterns();
	initSequence();
	initSliders();
}

/**
* Creates the grid for drums
*/
function initDrumGrid()
{
	var seq = $("#drumseq");
	var labels = $("<div id='drum-labels'>");
	var grid = $("<div id='drum-grid'>");
	for (var i = 0, len = SOUNDS.length; i < len; i++)
	{
		var row = $("<div class='row'>");
		var label = $("<div class='label'>").text(SOUNDS[i].name);
		labels.append(label);
		for (var j = 0; j < NUMSTEPS; j++)
		{
			var cell = $("<div class='cell'><div class='cell-inner'><div class='note'></div></div>");
			row.append(cell);
		}
		grid.append(row);
	}
	seq.append(labels).append(grid);
	seq.addInteraction(".cell-inner", drumInteractions());	
}

/**
* Creates the grid for bass
*/
function initBassGrid()
{
	var bass = $("#bseq");
	labels = $("<div id='bass-labels'>");
	grid = $("<div id='bass-grid'>");
	for (var i = BASS_MAX; i >= BASS_MIN; i--)
	{
		var row = $("<div class='row'>");
		// http://stackoverflow.com/questions/712679/convert-midi-note-numbers-to-name-and-octave
		var notename = "C C#D D#E F F#G G#A A#B ".substr((i % 12) * 2, 2);
		if (notename.indexOf("#") != -1)
		{
			row.addClass("blackNote");
		}
		var label = $("<div class='label'>").text(notename);
		labels.append(label);
		for (var j = 0; j < NUMSTEPS; j++)
		{
			var cell = $("<div class='cell'><div class='cell-inner'><div class='note'></div></div></div>");
			row.append(cell);
		}
		grid.append(row);
	}
	bass.append(labels).append(grid);
	bass.addInteraction(".cell-inner", bassInteractions());
}

/**
* Creates the pattern rows for drum/bass
*/
function initPatterns()
{
	var plist = $(".patterns");
	var label = $("<div class='label'>").text("patterns");
	plist.append(label);
	for (var i = 0; i < NUMPATTERNS; i++)
	{
		var div = $("<div class='pattern'>").text(i + 1);
		if (i == 0)
		{
			div.addClass("active");
		}
		plist.append(div);
	}
	
	$("#drum-patterns").addInteraction(".pattern", drumPatternInteractions());	
	$("#bass-patterns").addInteraction(".pattern", bassPatternInteractions());
}

/**
* Creates the sequence rows for drum/bass
*/
function initSequence()
{
	var sequence = $(".sequence")
	var label = $("<div class='label'>").text("sequence");
	sequence.append(label);
	for (var i = 0; i < SEQUENCE_LENGTH; i++)
	{
		var div = $("<div class='pattern'>");
		if (i == 0)
		{
			div.addClass("open");
		}
		else
		{
			div.addClass("closed");
		}
		sequence.append(div);
	}
	
	// playback mode button
	var buttonlabel = $("<div class='mode'>").text("Playback mode: ");
	var button = $("<button>").text("loop").appendTo(buttonlabel);
	button.addInteraction({
		click: function(data)
		{
			var type = data.element.parent().parent().attr("id").split("-")[0];
			window[type + "Mode"] = window[type + "Mode"] == "sequence" ? "loop" : "sequence";
			data.element.text(window[type + "Mode"]);
		}
	});
	sequence.append(buttonlabel);
}

/**
* Create all the sliders, based on what parameters have been defined
* in the params object
* Relies on aaa-bbb-ccc naming convention in params
*/
function initSliders()
{
	var getParam = function(element, param)
	{
		var name = element.attr("name");
		if (params[name] && params[name][param])
		{
			return params[name][param];
		}
	}
	
	// add some sliders to the fx panel
	var fxPanel = $("#fx-panel");
	var subPanel = $("#sub-panel");

	var fxlist = {};
	for (var parameter in params)
	{
		// get the three components of the name
		var param = parameter.split("-");
		if (!(param[0] in fxlist))
		{
			fxlist[param[0]] = {}
		}
		if (!(param[1] in fxlist[param[0]]))
		{
			fxlist[param[0]][param[1]] = {}
		}
		fxlist[param[0]][param[1]][param[2]] = parameter;
	}
	
	// create the fx sections
	for (var section in fxlist)
	{
		sectionDiv = $("<div class='fx-section'>").attr("name", section);
		$("<h4>").text(initCap(section)).appendTo(sectionDiv);
		
		for (var fx in fxlist[section])
		{
			$("<h5>").text(initCap(fx)).appendTo(sectionDiv);
			for (var i in fxlist[section][fx])
			{
				var slider = $("<div>")
				$("<label>").text(i).appendTo(slider);
				$("<input class='param' type='range'>").attr("name", fxlist[section][fx][i]).appendTo(slider);
				slider.appendTo(sectionDiv);
			}
			
		}
		
		// decide if this goes on the main fx section or the subsection
		if (["drum","bass","master"].indexOf(section) == -1)
		{
			subPanel.append(sectionDiv);
		}
		else {
			fxPanel.append(sectionDiv);
		}
	}
	
	
	// slider setup
	$(".param").attr({
		min: function() {return getParam($(this), "min")},
		max: function() {return getParam($(this), "max")},
		step: function() {return getParam($(this), "step")},
		value: function() {return getParam($(this), "value")}
	}).on("change", function() {
		// set the value when moving the slider
		setParam(params[$(this).attr("name")], $(this).val());
		return false;	
	});
}