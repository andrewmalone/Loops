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
		drumPatterns[currentDrumPattern].steps[row][col] = $(this).val();
		return false;
	});
}

function showDrumPattern(i)
{
	// load the pattern into the interface
	// loop through the interface table...
	$("#drumseq input").val(function(index) {
		var row = Math.floor(index / NUMSTEPS);
		var col = index % NUMSTEPS;
		return drumPatterns[i].steps[row][col];
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