/**
* gridInteractions.js
* Defines all the interactions in the drum and bass grids,
* and the pattern drag/drop
*/

/**
* Define the drum grid interactions
* Click to toggle on/off
* Drag up/down to set volume and opacity of step
*/
function drumInteractions()
{
	return {
		init: function(element) {
			// get the row/column...
			var index = element.index("#drumseq .cell-inner");
			var row = getRow(index);
			var col = getCol(index);
			var vol = drumPatterns[currentDrumPattern].volumes[row][col];
			var isTurningOn = false;
			var cellValue = drumPatterns[currentDrumPattern].steps[row][col];
			if (cellValue == 0)
			{
				// turn on the cell!
				isTurningOn = true;
				requestAnimFrame(function() {			
					element.children(".note").css("opacity", vol);
					element.addClass("on");
				});		
				drumPatterns[currentDrumPattern].steps[row][col] = 1;
			}
			return {
				row: row,
				col: col,
				isTurningOn: isTurningOn,
				startV: vol
			};
		},
		drag: function(data) {
			// set the volume and opacity...
			var vol = calcVolume(data.startV, data.deltaY);
			requestAnimFrame(function() {
				data.element.children(".note").css("opacity", vol);
			});
			
			drumPatterns[currentDrumPattern].volumes[data.row][data.col] = vol;
		},
		click: function(data) {
			if (data.isTurningOn == false) {
				// turn the cell off
				drumPatterns[currentDrumPattern].steps[data.row][data.col] = 0;
				data.element.removeClass("on");
			}
		}
	};
}

/**
* Define the bass grid interactions
* Click to toggle on/off
* Drag up/down to change volume/opacity
* Drag left/right to adjust duration and size
*/
function bassInteractions()
{
	return {
		init: function(element) {
			// get the row/column...		
			var index = element.index("#bseq .cell-inner");
			var row = BASS_MIN + (BASS_RANGE - getRow(index));
			var col = getCol(index);
			var note = bassPatterns[currentBassPattern][col].note;
			var duration = bassPatterns[currentBassPattern][col].duration;
			var volume = bassPatterns[currentBassPattern][col].volume;
			var isTurningOn = false;
			
			// set up some variables for snapping to cells
			var right = parseFloat(element.css("right"));
			var next = $("#bseq .cell").eq(index + duration);
			var nextWidth = next.outerWidth();
			var nextSnap = nextWidth / 2;
			var prev = $("#bseq .cell").eq(index + duration - 1);
			var prevWidth = prev.outerWidth() * -1;
			var prevSnap = duration == 1 ? 0 : prevWidth / 2;
			
			if (note != row)
			{
				// turn it on!
				if (bassPatterns[currentBassPattern][col].note != 0)
				{
					// remove the existing note from the grid...
					var currNote = (BASS_MAX - bassPatterns[currentBassPattern][col].note) * NUMSTEPS + col;
					$("#bseq .cell-inner").eq(currNote).css("right", 0).removeClass("on");
				}
				bassPatterns[currentBassPattern][col].note = row;
				bassPatterns[currentBassPattern][col].duration = duration;
				bassPatterns[currentBassPattern][col].volume = .8;
				isTurningOn = true;
				element.addClass("on");
				element.children(".note").css("opacity", volume);
			}
			return {
				row: row,
				col: col,
				right: right,
				next: next,
				duration: duration,
				nextWidth: nextWidth,
				nextSnap: nextSnap,
				prev: prev,
				prevWidth: prevWidth,
				prevSnap: prevSnap,
				isTurningOn: isTurningOn,
				startV: volume
			};
		},
		drag: function(data) {
			// adjust the duration - move left/right
			if (data.nextSnap != 0 && data.deltaX > data.nextSnap)
			{
				// snap to the next cell		
				data.element.css("right", data.right - data.nextWidth);
				data.prevWidth = data.nextWidth - data.next.outerWidth();
				data.prev = data.next;
				data.prevSnap = data.nextSnap;
				data.next = data.next.next();
				data.nextSnap = data.nextWidth + data.next.outerWidth() / 2;
				data.nextWidth += data.next.outerWidth();
				data.duration++;
				bassPatterns[currentBassPattern][data.col].duration = data.duration;
			}
			else if (data.prevSnap != 0 && data.deltaX < data.prevSnap)
			{
				// snap to the prior cell
				data.element.css("right", data.right - data.prevWidth);
				data.duration--;
				data.next = data.prev;
				data.nextSnap = data.prevSnap;
				data.nextWidth = data.prevWidth + data.prev.outerWidth();
				data.prev = data.prev.prev();
				data.prevSnap = data.duration == 1 ? 0 : data.prevWidth - data.prev.outerWidth() / 2;
				data.prevWidth -= data.prev.outerWidth();
				bassPatterns[currentBassPattern][data.col].duration = data.duration;
			}
			
			// change the volume if needed
			var vol = calcVolume(data.startV, data.deltaY);
			requestAnimFrame(function() {
				data.element.children(".note").css("opacity", vol);
			});
			bassPatterns[currentBassPattern][data.col].volume = vol;
		},
		click: function(data) {
			if (data.isTurningOn == false)
			{
				// turn it off
				data.element.removeClass("on");
				data.element.css("right", 0);
				bassPatterns[currentBassPattern][data.col].duration = 1;
				bassPatterns[currentBassPattern][data.col].note = 0;
				bassPatterns[currentBassPattern][data.col].volume = .8;
			}
		}
	};
}

/**
* Defines the interactions for bass patterns
* Click to switch patterns
* Drag to another pattern to copy
* Drag to sequence
*/
function bassPatternInteractions()
{
	return {
	    init: function(element)
	    {
	    	// initialize for drag/drop
	        var data = {};
	        data.offsetX = element.offset().left;
	        data.offsetY = element.offset().top;
	        data.isOver = false;
	        
	        // get the drop zones...
	        data.drops = []
	        element.siblings(".pattern").add(element.parent().next().children(".pattern.open")).each(function() {
	            var left = $(this).offset().left;
	            var top = $(this).offset().top;
	            var right = left + $(this).outerWidth();
	            var bottom = top + $(this).outerHeight();
	            data.drops.push([[left, right],[top, bottom], $(this)]);
	        })
	        return data;
	    },
	    click: function(data) 
	    {
	    	switchActivePattern(data.element, "bass");
		},
	    drag: function(data, e)
	    {
	    	if (!data.shadow)
	    	{
	    		// create the shadow element while dragging
		    	data.shadow = data.element.clone().addClass("shadow").appendTo(document.body);
	    	}
	        var px = data.offsetX + data.deltaX;
	        var py = data.offsetY - data.deltaY;
	        var x = e.pageX;
		    var y = e.pageY;
	        requestAnimFrame(function() {
	        	// shadow follows the mouse
	            data.shadow.css({left: px+"px", top: py+"px"});
	        });
	        // look for drop zones...
	        if (data.isOver === false)
	        {
		        for (var i = 0, len = data.drops.length; i < len; i++)
		        {
		            var drop = data.drops[i];
		            if (x > drop[0][0] && x < drop[0][1] && y > drop[1][0] && y < drop[1][1])
		            {
		                // we are over a target
		                data.isOver = i;
		                drop[2].addClass("over");
		                break;
		            }
		        }
		    }
		    else
		    {
			    // check if we are outside of the current drop zone
			    var drop = data.drops[data.isOver];
			    if (x < drop[0][0] || x > drop[0][1] || y < drop[1][0] || y > drop[1][1])
			    {
				    // not over anymore
				    drop[2].removeClass("over");
				    data.isOver = false;
			    }
		    }
	    },
	    up: function(data)
	    {
	    	if (data.isOver !== false)
	    	{
	    		// currently over a drop zone
	    		var drop = data.drops[data.isOver][2]
		    	drop.removeClass("over");
		    	
		    	// decide what to do (figure out bass or drums)
		    	var i = drop.siblings(".pattern").addBack().index(drop);
		    	var type = data.element.parent().attr("id").split("-")[0];
		    	if (drop.parent().hasClass("patterns"))
		    	{
		    		// copy the pattern
			    	window[type + "Patterns"][i] = $.extend(true, {}, window[type + "Patterns"][window["current" + initCap(type) + "Pattern"]]);
			    	switchActivePattern(drop, type);
		    	}
		    	else if (drop.parent().hasClass("sequence"))
		    	{
		    		// add to the sequence
			    	// add the number
			    	drop.text(data.element.text());
			    	// set the next one to open
			    	drop.next(".pattern").addClass("open").removeClass("closed");
			    	// add to the sequence
			    	window[type + "Sequence"][i] = data.element.siblings(".pattern").addBack().index(data.element);
		    	}
	    	}
	    	// destroy the drag shadow
	        data.shadow.remove()
	    }	
	};
}

/**
* Define drum pattern interaction
* Same as bass except for click
* (this could probably be factored out)
*/
function drumPatternInteractions()
{
	var fn = bassPatternInteractions();
	fn.click = function(data)
    {
		switchActivePattern(data.element, "drum")
	}
	return fn;
}