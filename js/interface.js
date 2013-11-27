function initInterface()
{
	// create a table for drums...
	var table = $("#drumseq");
	for (var i = 0, len = SOUNDS.length; i < len; i++)
	{
		var tr = $("<tr>");
		for (var j = 0; j < NUMSTEPS; j++)
		{
			var td = $("<td>");
			var input = $("<input type='number' min='0' max='100' step='1'>");
			td.append(input);
			tr.append(td);
		}
		table.append(tr);
	}
	
	table.on("change", "input", function() {
		var row = $(this).parentsUntil("table","tr").index();
		var col = $(this).parentsUntil("tr").index();
		drumPatterns[currentDrumPattern].steps[row][col] = $(this).val() > 0 ? 1 : 0;
		drumPatterns[currentDrumPattern].volumes[row][col] = $(this).val() / 100;
		return false;
	});
	
	// create a table for bass...
	table = $("#bseq");
	var keys = Object.keys(BASS_MAPPING)
	for (var i = 0, len = keys.length; i < len; i++)
	{
		var tr = $("<tr>");
		var th = $("<th>").text(keys[i]);
		tr.append(th);
		for (var j = 0; j < NUMSTEPS; j++)
		{
			var td = $("<td>");
			var input = $("<input type='number'>");
			input.val(0);
			td.append(input);
			tr.append(td);
		}
		table.append(tr);
	}
	
	table.on("change", "input", function() {
		var row = $(this).parent().prevAll("th").text();
		var col = $(this).parentsUntil("tr").index() - 1; // this is ugly!
		// console.log(row, col);
		bassPatterns[0][col].note = row;
	});
	
	// set up the sequencer inputs
	$("#sequence").on("change", "input", function() {
		//console.log($(this).val(), $(this).index("#sequence input"));
		sequence[$(this).index("#sequence input")] = $(this).val();
	});
	
	$("#sequenceMode").click(function() {
		mode = mode == "sequence" ? "loop" : "sequence";
		$(this).text(mode);
	});
}

function showDrumPattern(i)
{
	// load the pattern into the interface
	// loop through the interface table...
	$("#drumseq input").val(function(index) {
		var row = Math.floor(index / NUMSTEPS);
		var col = index % NUMSTEPS;
		return drumPatterns[i].volumes[row][col] * 100;
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