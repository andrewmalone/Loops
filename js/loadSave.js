/**
* loadSave.js
* load() and save() functions to handle saving patterns to server
* and loading saved patterns
*/

/*global setParam, switchActivePattern, initCap, updateName, announce, showModal */
/*global tempo, params */

/**
* load a pattern
*/
function load()
{
	// get the number from the url hash
	var num = location.hash.slice(1);
	// @todo - error handling here
    
	$.ajax({
		dataType: "json",
		url: "save/" + num + ".json",
		success: function (data)
		{
			var i, param;
			
			// load the data
			for (i in data)
			{
				if (i != "fxParams")
				{
					// update all the global variables
					window[i] = data[i];
				}
			}
			
			// deal with the fx params and sliders...						
			for (param in data.fxParams)
			{
				// update the slider...
				$(".param[name='" + param + "']").val(data.fxParams[param]);
				
				// update the param
				setParam(params[param], data.fxParams[param]);	
			}
			
			// update the tempo
			$("#tempo").val(tempo).change();

			
			// update the interface!
			// deactivate any patterns
			$(".pattern.active").removeClass("active");
			
			// pattern sequences and sequence modes
			["bass", "drum"].forEach(function (name) {
				var sequence, element, text, i;
				
				// active pattern
				switchActivePattern(window["current" + initCap(name) + "Pattern"], name);
				
				// sequence
				sequence = window[name + "Sequence"];
				for (i = 0; i < sequence.length; i++)
				{
					// get the correct element
					element = $("#" + name + "-sequence .pattern").eq(i);
					
					// set the text and class
					text = "";
					if (sequence.length > 1 || sequence[0] !== 0)
					{
						text = i + 1;
					}
					element.text(text).removeClass("closed").addClass("open");
					
					// deal with the rest of the elements
					element.next(".pattern").text("").removeClass("closed").addClass("open")
						.nextAll(".pattern").text("").removeClass("open").addClass("closed");
						
					// make sure the button is correct
					$("#" + name + "-sequence button").text(window[name + "Mode"]);				
				}
			});
			
			// set the name
			updateName();
		},
		error: function (error) 
		{
			announce("Sorry, something went wrong loading that pattern.");
		}
	});
}

/**
* Shows the modal dialog with text entry for pattern name
*/
function setupSave()
{
	var content = $("<div>");
    $("<p>").text("Give your pattern a name (optional)").appendTo(content);
	$("<input type='text' name='saveName'>").appendTo(content);
	$("<button type='submit'>").text("Generate url").appendTo(content).addInteraction({click: save});
	showModal(content);
}

/**
* Saves the pattern to the server
*/
function save()
{
	// set the name
	updateName($("[name=saveName]").val());
	
	// define all data to save
	var data = {},
		objects = [
			"tempo",
			"saveName",
			"drumPatterns",
			"bassPatterns",
			"drumSequence",
			"bassSequence",
			"drumMode",
			"bassMode",
			"currentDrumPattern",
			"currentBassPattern"
		];
	
	// create the combined data object
	objects.forEach(function (element) {
		data[element] = window[element];
	});
	
	// get fx params
	data.fxParams = {};
	$(".param").each(function () {
		data.fxParams[$(this).attr("name")] = $(this).val();
	});
	
	// add a version number (for future compatibility changes)
	data.version = "1.0";
	
	// convert the data object to JSON
	data = JSON.stringify(data);
	
	// make the ajax call
	$.ajax(
	{
		dataType: "json",
		url: "save/save.py",
		data: {
			data: data
		},
		type: 'POST',
		success: function (data)
		{
			var url, content;
			
			// update the url and display it in the modal dialog
			url = location.origin + location.pathname + "#" + data.data.num;
			location.hash = data.data.num;
			content = $("<div>");
			$("<p>").text("Unique url for this pattern:").appendTo(content);
			$("<a>").attr("href", url).text(url).click(function ()
			{
				$("#modal").removeClass("active");
			}).appendTo(content);
			showModal(content);
		},
		error: function (error)
		{
			announce("Sorry, there was a problem saving your pattern.");
		}
	});
}