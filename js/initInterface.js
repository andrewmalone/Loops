/*
* init-interface.js
* Initializes the interface. Dynamically draws the pattern grids, creates the pattern and
* sequence rows, and creates all the parameter sliders
*/

/*global drumInteractions, bassInteractions, drumPatternInteractions, bassPatternInteractions, initCap, setParam */
/*global SOUNDS, NUMSTEPS, NUMPATTERNS, SEQUENCE_LENGTH, params */

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
	var seq, labels, grid, row, label, cell, i, j, len;
	seq = $("#drumseq");
	labels = $("<div id='drum-labels'>");
	grid = $("<div id='drum-grid'>");
	for (i = 0, len = SOUNDS.length; i < len; i++)
	{
		row = $("<div class='row'>");
		label = $("<div class='label'>").text(SOUNDS[i].name);
		labels.append(label);
		for (j = 0; j < NUMSTEPS; j++)
		{
			cell = $("<div class='cell'><div class='cell-inner'><div class='note'></div></div>");
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
	var bass, labels, grid, row, notename, label, cell, i, j;
	bass = $("#bseq");
	labels = $("<div id='bass-labels'>");
	grid = $("<div id='bass-grid'>");
	for (i = BASS_MAX; i >= BASS_MIN; i--)
	{
		row = $("<div class='row'>");
		// http://stackoverflow.com/questions/712679/convert-midi-note-numbers-to-name-and-octave
		notename = "C C#D D#E F F#G G#A A#B ".substr((i % 12) * 2, 2);
		if (notename.indexOf("#") != -1)
		{
			row.addClass("blackNote");
		}
		label = $("<div class='label'>").text(notename);
		labels.append(label);
		for (j = 0; j < NUMSTEPS; j++)
		{
			cell = $("<div class='cell'><div class='cell-inner'><div class='note'></div></div></div>");
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
	var plist, label, div, i;
	plist = $(".patterns");
	label = $("<div class='label'>").text("patterns");
	plist.append(label);
	for (i = 0; i < NUMPATTERNS; i++)
	{
		div = $("<div class='pattern'>").text(i + 1);
		if (i === 0)
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
	var sequence, label, div, buttonlabel, button, i;
	sequence = $(".sequence");
	label = $("<div class='label'>").text("sequence");
	sequence.append(label);
	for (i = 0; i < SEQUENCE_LENGTH; i++)
	{
		div = $("<div class='pattern'>");
		if (i === 0)
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
	buttonlabel = $("<div class='mode'>").text("Playback mode: ");
	button = $("<button>").text("loop").appendTo(buttonlabel);
	button.addInteraction({
		click: function (data)
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
	var getParam, fxPanel, subPanel, fxlist, parameter, param, section, sectionDiv, fx, slider, i;
	getParam = function (element, param)
	{
		var name = element.attr("name");
		if (params[name] && params[name][param])
		{
			return params[name][param];
		}
	};
	
	// add some sliders to the fx panel
	fxPanel = $("#fx-panel");
	subPanel = $("#sub-panel");

	fxlist = {};
	for (parameter in params)
	{
		// get the three components of the name
		param = parameter.split("-");
		if (!(param[0] in fxlist))
		{
			fxlist[param[0]] = {};
		}
		if (!(param[1] in fxlist[param[0]]))
		{
			fxlist[param[0]][param[1]] = {};
		}
		fxlist[param[0]][param[1]][param[2]] = parameter;
	}
	
	// create the fx sections
	for (section in fxlist)
	{
		sectionDiv = $("<div class='fx-section'>").attr("name", section);
		$("<h4>").text(initCap(section)).appendTo(sectionDiv);
		
		for (fx in fxlist[section])
		{
			$("<h5>").text(initCap(fx)).appendTo(sectionDiv);
			for (i in fxlist[section][fx])
			{
				slider = $("<div>");
				$("<label>").text(i).appendTo(slider);
				$("<input class='param' type='range'>").attr("name", fxlist[section][fx][i]).appendTo(slider);
				slider.appendTo(sectionDiv);
			}
			
		}
		
		// decide if this goes on the main fx section or the subsection
		if (["drum", "bass", "master"].indexOf(section) == -1)
		{
			subPanel.append(sectionDiv);
		}
		else {
			fxPanel.append(sectionDiv);
		}
	}
	
	
	// slider setup
	$(".param").attr({
		min: function () { return getParam($(this), "min"); },
		max: function () { return getParam($(this), "max"); },
		step: function () { return getParam($(this), "step"); },
		value: function () { return getParam($(this), "value"); }
	}).on("change", function () {
		// set the value when moving the slider
		setParam(params[$(this).attr("name")], $(this).val());
		return false;	
	});
}