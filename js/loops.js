/**
* loops.js
* Contains the document load function that is fired when the page first loads
*/

/*global AudioContext, createAudioGraph, loadSounds, start, stop, render, setupSave, setTempo, initInterface, load */

// global variable for the audio context
var context;

// Initialize things after the page loads
$(function () {
	
	context = new AudioContext();
	context.graph = createAudioGraph();
	
	// load the sounds	
	loadSounds();
});

function continueSetup()
{
	// set up all the buttons
	$("#play").addInteraction({click: function (data) {
		if (data.element.text() == "PLAY")
		{
			start();
			data.element.text("STOP");
		}
		else
		{
			stop();
			data.element.text("PLAY");
		}
	}});

	$("#render").addInteraction({click: render});
	$("#save").addInteraction({click: setupSave});
	$("#fx").addInteraction({click: function (data) {
		$("#fx-panel").toggleClass("active");
		var text = data.element.text() == "SHOW FX" ? "HIDE FX" : "SHOW FX";
		data.element.text(text);
	}});
	
	$("#tempo").on("change", function () {
		setTempo($(this).val());
	});
	
	$("#modal-close").addInteraction({click: function () {
		$("#modal").removeClass("active");
	}});

	$(".sub-panel").addInteraction({click: function () {
		$("#sub-panel").toggleClass("active");
	}});
	
	// build the interface...
	initInterface();
	
	// load a pattern depending on url params
	if (location.hash !== "")
	{
		load();
	}
}