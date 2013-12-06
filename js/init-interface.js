function initInterface()
{
	initDrumGrid();
	initBassGrid();
	initPatterns();
	initSequence();
	initSliders();
}

function initDrumGrid()
{
	// create a grid for drums...
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

function initBassGrid()
{
	// create a grid for the bass
	var bass = $("#bseq");
	labels = $("<div id='bass-labels'>");
	grid = $("<div id='bass-grid'>");
	for (var i = BASS_MAX; i >= BASS_MIN; i--)
	{
		var row = $("<div class='row'>");
		var label = $("<div class='label'>").text(i);
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

function initPatterns()
{
// build the patterns for both the drum and bass
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
	// check the params...
	var fxlist = {};
	for (var parameter in params)
	{
		//console.log(param);
		// get the three components...
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
	
	for (var section in fxlist)
	{
		sectionDiv = $("<div class='fx-section'>");
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
		
		fxPanel.append(sectionDiv);
	}
	
	// slider setup
	$(".param").attr({
		min: function() {return getParam($(this), "min")},
		max: function() {return getParam($(this), "max")},
		step: function() {return getParam($(this), "step")},
		value: function() {return getParam($(this), "value")}
	}).on("change", function() {
		// set the value!!!
		setParam(params[$(this).attr("name")], $(this).val());
		return false;
		
	});
}