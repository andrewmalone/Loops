/*
* init-interface.js
* Initializes the interface. Dynamically draws the pattern grids, creates the pattern and
* sequence rows, and creates all the parameter sliders
* Don't define interactions here!
*/

/**
* Build everything
*/
function initInterface()
{
	initDrumGrid();
	initPatterns();
	initSequence();
	initSliders();
}

/**
* Creates the grid for drums
*/
function initDrumGrid()
{
	var seq, labels, grid, row, label, button, editor, cell, i, j, len;
	seq = $("#drumseq");
	labels = $("<div id='drum-labels'>");
	grid = $("<div id='drum-grid'>");
	for (i = 0, len = SOUNDS.length; i < len; i++)
	{
		row = $("<div class='row'>");
		label = $("<div class='label'>").text(SOUNDS[i].name);
		button = $("<button class='drum-edit'>").text("E").attr("name", SOUNDS[i].name);
		label.append(button).appendTo(labels);
		// add a edit window...
		editor = $("<div class='editor'>").attr("name", SOUNDS[i].name);
		$(document.body).append(editor);
		
		//labels.append(label);
		for (j = 0; j < NUMSTEPS; j++)
		{
			cell = $("<div class='cell'><div class='cell-inner'><div class='note'></div></div>");
			row.append(cell);
		}
		grid.append(row);
	}
	seq.append(labels).append(grid);
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
	sequence.append(buttonlabel);
}

/**
* Create all the sliders, based on what parameters have been defined
* in the params object
* Relies on aaa-bbb-ccc naming convention in params
*/
function initSliders()
{
	var fxPanel, subPanel, fxlist, fx, parameter, param, section, sectionDiv, subsection, subsectionDiv, i, slider;

	// add some sliders to the fx panel
	fxPanel = $("#fx-panel");
	subPanel = $("#sub-panel");
	
	// @todo - refactor into one loop?
	fxlist = {};
	for (parameter in params)
	{
		// get the three components of the name (a-b-c)
		param = parameter.split("-");
		
		// limit length to 3 to avoid lfos... (probably better way)
		if (param.length != 3) { continue; }
		
		if (!(param[0] in fxlist))
		{
			fxlist[param[0]] = {};
		}
		if (!(param[1] in fxlist[param[0]]))
		{
			fxlist[param[0]][param[1]] = {};
		}
		fxlist[param[0]][param[1]][param[2]] = parameter;
		// the actual entry has the full name
	}

	// create the fx sections
	for (section in fxlist)
	{
		sectionDiv = $("<div class='fx-section'>");
		$("<h4>").text(initCap(section)).appendTo(sectionDiv);
		subsectionDiv = $("<div class='fx-wrapper'>").appendTo(sectionDiv);

		for (fx in fxlist[section])
		{
			subsection = $("<div class='fx-subsection'>");
			$("<h5>").text(initCap(fx)).appendTo(subsection);
			for (i in fxlist[section][fx])
			{
				
				slider = $("<div>");
				$("<label>").text(i).appendTo(slider);
				// might not be the best place to do this
				// console.log(params[fxlist[section][fx][i]]);
				if (params[fxlist[section][fx][i]].lfo !== undefined)
				{
					$("<button class='lfo-edit'>").text("lfo").attr("name", fxlist[section][fx][i]).appendTo(slider);
				}
				$("<input class='param' type='range'>").attr("name", fxlist[section][fx][i]).appendTo(slider);
				slider.appendTo(subsection);
			}
			subsection.appendTo(subsectionDiv);

		}

		// decide if this goes on the main fx section or the subsection
		if (["drum", "bass", "master"].indexOf(section) == -1)
		{
			$(".editor[name='" + section + "']").append(sectionDiv);
		}
		else
		{
			fxPanel.append(sectionDiv);
		}
	}
	
	// LFO sliders
	for (i = 0; i < lfos.length; i++)
	{
		sectionDiv = $("<div class='lfo'>").attr("name", lfos[i].slider);
		var lfoParams = ["rate", "amount"];
		for (var n in lfoParams)
		{
			var name = lfoParams[n];
			slider = $("<div>");
			$("<label>").text(name).appendTo(slider);
			$("<input type='range' class='param'>").attr("name", lfos[i].slider + "-lfo-" + name).appendTo(slider);
			slider.appendTo(sectionDiv);
		}
		sectionDiv.appendTo(document.body);
	}
}