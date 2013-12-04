var BASS_MAX = 52;
var BASS_MIN = 40;
var BASS_RANGE = BASS_MAX - BASS_MIN;
function initInterface()
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
			var cell = $("<div class='cell'><div class='cell-inner'></div></div>");
			row.append(cell);
		}
		grid.append(row);
	}
	seq.append(labels).append(grid);
	seq.addInteraction(".cell-inner", drumInteractions());
	
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
	
	// build a list for the patterns...
	var plist = $(".patterns");
	var label = $("<div class='label'>").text("patterns");
	plist.append(label);
	for (var i = 0; i < 8; i++)
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
	
	// build the sequencer
	//var slist = $(".")
	/*
	// set up the sequencer inputs
	$("#sequence").on("change", "input", function() {
		//console.log($(this).val(), $(this).index("#sequence input"));
		sequence[$(this).index("#sequence input")] = $(this).val();
	});
	
	$("#sequenceMode").click(function() {
		mode = mode == "sequence" ? "loop" : "sequence";
		$(this).text(mode);
	});
	*/
}

function drawCurrentDrumPattern()
{
	$("#drumseq .cell-inner").each(function(index) {
		var row = getRow(index);
		var col = getCol(index);
		// get the value and volume...
		var step = drumPatterns[currentDrumPattern].steps[row][col];
		var vol = drumPatterns[currentDrumPattern].volumes[row][col];
		
		if (step == 1)
		{
			if (!$(this).hasClass("on"))
			{
				$(this).addClass("on");
			}
			$(this).css("opacity", vol);
		}
		else
		{
			if ($(this).hasClass("on"))
			{
				$(this).removeClass("on");
			}
		}
	});
}

function drawCurrentBassPattern()
{
	$("#bseq .cell-inner").each(function(index) {
		// @todo - think about refactoring.
		// we don't need to go through each cell here
		var row = (BASS_RANGE - getRow(index)) + BASS_MIN;
		var col = getCol(index);
		var note = bassPatterns[currentBassPattern][col].note;
		var volume = bassPatterns[currentBassPattern][col].volume;
		var duration = bassPatterns[currentBassPattern][col].duration;
		if (note == row)
		{
			if (!$(this).hasClass("on"))
			{
				$(this).addClass("on");
			}
			$(this).children(".note").opacity = volume;
			var width = 0;
			var element = $(this).parent();
			for (var i = 0; i < duration - 1; i++)
			{
				// add to the width
				element = element.next();
				width -= element.outerWidth();
			}
			$(this).css("right", width);
		}
		else
		{
			if ($(this).hasClass("on"))
			{
				$(this).removeClass("on");
				$(this).css("right", 0);
			}
		}
	});
}
function updateDrumPatternList(name, index)
{
	// add the last item to the option group...
	var option = $("<option>");
	option.val(index);
	option.text(name);
	$("#switch").append(option);
}

function addToSequenceList()
{
	$("#sequence").append($("<input type='text'>"));
	addToSequence();	
}

function calcVolume(startV, deltaY) 
{
	var vol = parseFloat(startV) + (deltaY/100);
	if (vol > 1) vol = 1;
	if (vol < 0) vol = 0;
	vol = Math.round(vol*100)/100;
	return vol;
}

function switchPanel(panel)
{
	requestAnimFrame(function(){
		$(".panel.active").removeClass("active");
		$("#" + panel).addClass("active")
	});
}

function getRow(index)
{
	return Math.floor(index / NUMSTEPS);
}

function getCol(index)
{
	return index % NUMSTEPS;
}