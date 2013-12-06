function load()
{
	var num = location.hash.slice(1);
	// @todo - verify this is really an int...
    
	$.ajax({
		dataType: "json",
		url: "save/" + num + ".json",
		success: function(data)
		{
			// console.log(data);
			// load the data
			for (var i in data)
			{
			   window[i] = data[i];
			}
			// update the interface!
			
			// drum grid
			//drawCurrentDrumPattern();
			
			// bass grid
			//drawCurrentBassPattern();
			
			// switch pattern indicators...
			//switchActivePatter
			// deactivate any patterns
			$(".pattern.active").removeClass("active");
			
			// pattern sequences and sequence modes
			["bass","drum"].forEach(function(name) {
				// active pattern
				switchActivePattern(window["current" + initCap(name) + "Pattern"], name)
				
				// sequence
				var sequence = window[name + "Sequence"];
				for (var i = 0; i < sequence.length; i++)
				{
					// get the correct element
					var element = $("#" + name + "-sequence .pattern").eq(i);
					
					// set the text and class
					var text = "";
					if (sequence.length > 1 || sequence[0] != 0)
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
		},
		error: function(error) 
		{
			console.log("error!");
		}
	});
}

function save()
{
	// define all the data to save...
	var data = {};
	var objects = [
		"tempo",
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
	objects.forEach(function(element) {
		data[element] = window[element]
	});
	
	// @todo = get fx params!
	data = JSON.stringify(data);
	
	// make the ajax call
	$.ajax({
      dataType: "json",
      url: "save/save.py",
      data: {data:data},
      type: 'POST',
      success: function(data) {
        // @todo - add feedback here!
        console.log(data);
      }
    });
}