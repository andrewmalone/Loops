function load()
{
	var num = location.search.slice(1);
	// @todo - verify this is really an int...

/*
        for (i in data)
        {
            window[i] = data[i]
        }
*/

    
    $.ajax({
	   dataType: "json",
	   url: "save/" + num + ".json",
	   success: function(data) {
		   console.log(data);
	   },
	   error: function(error) {
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
	data = JSON.stringify(data);
	
	// make the ajax call
	$.ajax({
      dataType: "json",
      url: "test.py",
      data: {data:data},
      type: 'POST',
      success: function(data) {
        // @todo - add feedback here!
      }
    });
}