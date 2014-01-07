/**
* loops.js
* Contains the document load function that is fired when the page first loads
*/

/*global AudioContext, createAudioGraph, loadSounds, start, stop, render, setupSave, setTempo, initInterface, load, initLFObuffers, drumInteractions, bassInteractions, drumPatternInteractions, bassPatternInteractions, params, setParam, tempo */

// global variable for the audio context
var context;

// global config variable
var config = {
	lfo: false
	
};

// Initialize things after the page loads
$(function () {
	
	context = new AudioContext();
	initLFObuffers();
	context.graph = createAudioGraph();
	
	// build the interface...
	initInterface();
	
	// load the sounds	
	loadSounds();
});

function continueSetup()
{
	var getParam;
	
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
	
	$("#tempo")
		.on("change", function () {
			setTempo($(this).val());
			$("output[for='tempo']").val($(this).val());
		});
	
	$("#modal-close").addInteraction({click: function () {
		$("#modal").removeClass("active");
	}});	
	
	
	$("#drum-labels").addInteraction("button", {
		click: function (data) 
		{
			var editor = $(".editor[name='" + data.element.attr("name") + "']");
			editor.add("#editors").addClass("active");
		}
	});
	
	$("#editors").addInteraction({
		click: function (data, e)
		{
			// close the modal editor if clicked outside the editor
			$(".editor.active").add(data.element).removeClass("active");
		}
	});
	
	$("#drumseq").addInteraction(".cell-inner", drumInteractions());
	$("#bseq").addInteraction(".cell-inner", bassInteractions());
	$("#drum-patterns").addInteraction(".pattern", drumPatternInteractions());	
	$("#bass-patterns").addInteraction(".pattern", bassPatternInteractions());
	
	$(".mode button").addInteraction({
		click: function (data)
		{
			var type = data.element.parent().parent().attr("id").split("-")[0];
			window[type + "Mode"] = window[type + "Mode"] == "sequence" ? "loop" : "sequence";
			data.element.text(window[type + "Mode"]);
		}
	});
	
	$("button.lfo-edit").addInteraction({
		click: function (data)
		{
			var editor = $(".lfo[name='" + data.element.attr("name") + "']");
			editor.add("#lfos").addClass("active");
		}
	});
	
	$("#lfos").addInteraction({
		click: function (data, e)
		{
			// close the modal editor if clicked outside the editor
			$(".lfo.active").add(data.element).removeClass("active");
		}
	});
	
	getParam = function (element, param)
	{
		var name = element.attr("name");
		if (params[name] && params[name][param])
		{
			return params[name][param];
		}
	};
	
	// slider setup
	$(".param")
		.each(function ()
		{
			var element = $(this);
			["min", "max", "step", "value"].forEach(function (param)
			{
				var value = getParam(element, param);
				element.attr(param, value);
			});
			
			// add output element
			element.after(
				$("<output>").attr("for", element.attr("name")).val(element.val())
			);
		})
		.on("change", function ()
		{
			var name = $(this).attr("name"),
				val = $(this).val();
			// set the value when moving the slider
			setParam(params[name], val);
			$("output[for='" + name + "']").val(Math.round(val * 100) / 100);
			return false;
		});
	
	// load a pattern depending on url params
	if (location.hash !== "")
	{
		load();
	}
	
	// console.log(lfo_buffers);
}