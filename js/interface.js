/**
* interface.js
* Interface update functions
*/

// global variable for pattern name
var saveName = "";

/**
* Sets an fx paramater (usually called when a slider changes)
*/
function setParam(p, value)
{
	if (typeof(p.param) == "function")
	{
		p.param(value);
	}
	else
	{
		p.param.value = value;
	}
}

/**
* Draw the current drum pattern into the drum grid
*/
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
			// turn the cell on
			if (!$(this).hasClass("on"))
			{
				$(this).addClass("on");
			}
			// set the opacity
			$(this).children(".note").css("opacity", vol);
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

/**
* Draw the current bass pattern into the bass grid
*/
function drawCurrentBassPattern()
{
	$("#bseq .cell-inner").each(function(index) {
		var row = (BASS_RANGE - getRow(index)) + BASS_MIN;
		var col = getCol(index);
		var note = bassPatterns[currentBassPattern][col].note;
		var volume = bassPatterns[currentBassPattern][col].volume;
		var duration = bassPatterns[currentBassPattern][col].duration;
		// reset the cell
		$(this).removeClass().addClass("cell-inner").css("right", 0);
		
		if (note == row)
		{
			$(this).addClass("on");
			$(this).children(".note").css("opacity", volume);
			var width = 0;
			var element = $(this).parent();
			for (var i = 0; i < duration - 1; i++)
			{
				element = element.next();
				width -= element.outerWidth();
			}
			$(this).css("right", width);
			if (duration > 1)
			{
				$(this).addClass("dur d" + (col + duration == NUMSTEPS ? 0 : col + duration));
			}
		}
	});
}

/**
* Utility function to calculate a volume based on mouse movement
* Translates pixel variance to 0-1 volume range
*/
function calcVolume(startV, deltaY) 
{
	var vol = parseFloat(startV) + (deltaY / 100);
	if (vol > 1) vol = 1;
	if (vol < 0) vol = 0;
	vol = Math.round(vol * 100) / 100;
	return vol;
}

/**
* Utility function to get a row value based on a cell's index
*/
function getRow(index)
{
	return Math.floor(index / NUMSTEPS);
}

/**
* Utility function to get a column value based on a cell's index
*/
function getCol(index)
{
	return index % NUMSTEPS;
}

/**
* Utility function to convert the first character of a string to upper case
*/
function initCap(string)
{
	return string[0].toUpperCase() + string.slice(1);
}

/**
* Switches a pattern (for drum or bass) - updates the pattern list display
* and the pattern grid
*/
function switchActivePattern(index, type)
{
	var element;
	if (typeof(index) == "number")
	{
		element = $("#" + type + "-patterns .pattern").eq(index);	
	}
	else
	{
		element = index;
		index = element.siblings(".pattern").addBack().index(element);
	}
	if (!element.hasClass("active"))
	{
		element.siblings(".active").removeClass("active");
		element.addClass("active");
		window["current" + initCap(type) + "Pattern"] = index;
		window["drawCurrent" + initCap(type) + "Pattern"]();
	}
	else
	{
		// just need to redraw the pattern here
		window["drawCurrent" + initCap(type) + "Pattern"]();
	}
}

/**
* Updates the display for the active sequence when playing in sequence mode
*/
function setActiveSequence(index, type)
{
	var element = $("#" + type + "-sequence .pattern").eq(index);
	if (!element.hasClass("active"))
	{
		element.siblings(".active").removeClass("active");
		element.addClass("active");
	}
}

/**
* Shows the modal dialog with any content passed in
*/
function showModal(content)
{
	var div = $("#modal-content");
	div.html("").append(content);
	$("#modal").addClass("active");
}

/**
* Calls the modal dialog with just some text
*/
function announce(text)
{
	var p = $("<p>").text(text);
	showModal(p);
}

/**
* Update the name of the pattern
*/
function updateName(text)
{
	if (!text)
	{
		text = saveName;
	}
	else
	{
		saveName = text;
	}
	$("h2.name").text(text);
}

/**
* Highlight playing notes and grid steps
*/
function drawStep(step)
{
	// @todo - does this need to be in an animationFrame?
	$(".playing:not(.dur)").add(".d" + step).removeClass("playing");
	$(".cell:nth-child(" + (step + 1) + ") .cell-inner").addClass("playing");
}