var BASS_MAX = 52;
var BASS_MIN = 40;
var BASS_RANGE = BASS_MAX - BASS_MIN;

/**
* Initialize the interface - dynamically creates the drum grid, bass grid,
* pattern switchers, and sequencers
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
			$(this).children("note").css("opacity", vol);
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
			$(this).children(".note").css("opacity", volume);
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

function calcVolume(startV, deltaY) 
{
	var vol = parseFloat(startV) + (deltaY/100);
	if (vol > 1) vol = 1;
	if (vol < 0) vol = 0;
	vol = Math.round(vol*100)/100;
	return vol;
}

function getRow(index)
{
	return Math.floor(index / NUMSTEPS);
}

function getCol(index)
{
	return index % NUMSTEPS;
}

function initCap(string)
{
	return string[0].toUpperCase() + string.slice(1);
}

function switchActivePattern(index, type)
{
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
		//type = initCap(type);
		element.siblings(".active").removeClass("active");
		element.addClass("active");
		window["current" + initCap(type) + "Pattern"] = index;
		window["drawCurrent" + initCap(type) + "Pattern"]();
	}
}

function setActiveSequence(index, type)
{
	element = $("#" + type + "-sequence .pattern").eq(index);
	if (!element.hasClass("active"))
	{
		element.siblings(".active").removeClass("active");
		element.addClass("active");
	}
}