// @todo - comments
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
					//element.css("opacity", vol);
					element.children(".note").css("opacity", vol)
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
			// console.log(vol);
			requestAnimFrame(function() {
				//data.element.css("opacity", vol);
				data.element.children(".note").css("opacity", vol)
			});
			
			drumPatterns[currentDrumPattern].volumes[data.row][data.col] = vol
		},
		click: function(data) {
			if (data.isTurningOn == false) {
				// turn the cell off
				drumPatterns[currentDrumPattern].steps[data.row][data.col] = 0;
				data.element.removeClass("on");
				//s();
			}
		},
		up: function(data) {
			
		}
	};
}

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
			var right = parseFloat(element.css("right"));
			var next = $("#bseq .cell").eq(index + duration); // element.parent().next();
			var nextWidth = next.outerWidth();
			var nextSnap = nextWidth / 2;
			var prev = $("#bseq .cell").eq(index + duration - 1);
			var prevWidth = prev.outerWidth() * -1;
			var prevSnap = duration == 1 ? 0 : prevWidth / 2;
			// var prev = element.parent().prev();
			// prevSnap = 1/2 of the current cell width...
			// console.log(duration, next.index("#bseq .cell"), element.parent().next().index("#bseq .cell"));
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
			//console.log(data.deltaX, data.nextSnap);
			if (data.nextSnap != 0 && data.deltaX > data.nextSnap)
			{

						
				data.element.css("right", data.right - data.nextWidth);
				data.prevWidth = data.nextWidth - data.next.outerWidth();
				data.prev = data.next;
				data.prevSnap = data.nextSnap;
				data.next = data.next.next();
				data.nextSnap = data.nextWidth + data.next.outerWidth() / 2;
				data.nextWidth += data.next.outerWidth();
				data.duration++;
				bassPatterns[currentBassPattern][data.col].duration = data.duration;
				//console.log(data.prevWidth);			
			}
			else if (data.prevSnap != 0 && data.deltaX < data.prevSnap)
			{
				// console.log("snap back! to " + (data.right - data.prevWidth));
				data.element.css("right", data.right - data.prevWidth);
				data.duration--;
				
				data.next = data.prev;
				data.nextSnap = data.prevSnap;
				data.nextWidth = data.prevWidth + data.prev.outerWidth();
				
				data.prev = data.prev.prev();
				data.prevSnap = data.duration == 1 ? 0 : data.prevWidth - data.prev.outerWidth() / 2;
				// console.log(data.deltaX, data.prevSnap);
				data.prevWidth -= data.prev.outerWidth();
				bassPatterns[currentBassPattern][data.col].duration = data.duration;
			}
			
			var vol = calcVolume(data.startV, data.deltaY);
			// console.log(vol);
			requestAnimFrame(function() {
				data.element.children(".note").css("opacity", vol);
			});
			bassPatterns[currentBassPattern][data.col].volume = vol;
			//drumPatterns[currentDrumPattern].volumes[data.row][data.col] = vol
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

function bassPatternInteractions()
{
	return {
	    init: function(element)
	    {
	        var data = {}
	        //data.shadow = element.clone().addClass("shadow").appendTo(document.body)
	        data.offsetX = element.offset().left
	        data.offsetY = element.offset().top
	        //data.shadow.css({left: data.offsetX+"px", top: data.offsetY+"px"})
	        data.isOver = false;
	        // get the drop zones...
	        data.drops = []
	        element.siblings(".pattern").add(element.parent().next().children(".pattern.open")).each(function() {
	            var left = $(this).offset().left
	            var top = $(this).offset().top
	            var right = left + $(this).outerWidth()
	            var bottom = top + $(this).outerHeight()
	            data.drops.push([[left, right],[top, bottom], $(this)])
	        })
	        return data
	    },
	    click: function(data) 
	    {
	    	switchActivePattern(data.element, "bass");
		},
	    drag: function(data, e)
	    {
	    	if (!data.shadow)
	    	{
		    	data.shadow = data.element.clone().addClass("shadow").appendTo(document.body)
	    	}
	        var px = data.offsetX + data.deltaX
	        var py = data.offsetY - data.deltaY
	        var x = e.pageX
		    var y = e.pageY
	        requestAnimFrame(function() {
	            data.shadow.css({left: px+"px", top: py+"px"})
	        });
	        // look for drop zones...
	        if (data.isOver === false)
	        {
		        for (var i = 0, len = data.drops.length; i < len; i++)
		        {
		            var drop = data.drops[i];
		            if (x > drop[0][0] && x < drop[0][1] && y > drop[1][0] && y < drop[1][1])
		            {
		                // can this be optimized?
		                // we have an over here!
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
				    // not over anymore!
				    drop[2].removeClass("over");
				    data.isOver = false;
			    }
		    }
	    },
	    up: function(data)
	    {
	    	if (data.isOver !== false)
	    	{
	    		var drop = data.drops[data.isOver][2]
		    	drop.removeClass("over");
		    	// we had a drop! (what do we do now?)
		    	var i = drop.siblings(".pattern").addBack().index(drop);
		    	var type = data.element.parent().attr("id").split("-")[0];
		    	if (drop.parent().hasClass("patterns"))
		    	{
			    	window[type + "Patterns"][i] = $.extend(true, {}, window[type + "Patterns"][window["current" + initCap(type) + "Pattern"]]);
			    	switchActivePattern(drop, type);
		    	}
		    	else if (drop.parent().hasClass("sequence"))
		    	{
			    	// add the number
			    	drop.text(data.element.text());
			    	// set the next one to open
			    	drop.next(".pattern").addClass("open").removeClass("closed");
			    	// add to the sequence
			    	//var index = data.element.siblings(".pattern").addBack().index(data.element);
			    	window[type + "Sequence"][i] = data.element.siblings(".pattern").addBack().index(data.element);
		    	}
	    	}
	        data.shadow.remove()
	    }	
	};
}

function drumPatternInteractions()
{
	var fn = bassPatternInteractions();
	fn.click = function(data)
    {
		switchActivePattern(data.element, "drum")
	}
	return fn;
}