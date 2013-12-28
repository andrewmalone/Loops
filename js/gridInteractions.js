/**
* gridInteractions.js
* Defines all the interactions in the drum and bass grids,
* and the pattern drag/drop
*/

/*global getRow, getCol, requestAnimFrame, calcVolume, switchActivePattern */
/*global drumPatterns, currentDrumPattern, bassPatterns, currentBassPattern, BASS_MIN, BASS_RANGE, BASS_MAX, NUMSTEPS */

/**
* Define the drum grid interactions
* Click to toggle on/off
* Drag up/down to set volume and opacity of step
*/
function drumInteractions()
{
	return {
		init: function (element)
		{
			var data = {},
				index = element.index("#drumseq .cell-inner");


			// get the row/column...
			data.row = getRow(index);
			data.col = getCol(index);
			data.startV = drumPatterns[currentDrumPattern].volumes[data.row][data.col];
			data.isTurningOn = false;

			// check if the clicked cell is on or off
			if (drumPatterns[currentDrumPattern].steps[data.row][data.col] === 0)
			{
				// turn on the cell!
				data.isTurningOn = true;
				requestAnimFrame(function ()
				{
					element.children(".note").css("opacity", data.startV);
					element.addClass("on");
				});
				drumPatterns[currentDrumPattern].steps[data.row][data.col] = 1;
			}
			return data;
		},
		drag: function (data) 
		{
			// set the volume and opacity...
			var vol = calcVolume(data.startV, data.deltaY);
			requestAnimFrame(function () 
			{
				data.element.children(".note").css("opacity", vol);
			});
			
			drumPatterns[currentDrumPattern].volumes[data.row][data.col] = vol;
		},
		click: function (data)
		{
			if (data.isTurningOn === false) {
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
		init: function (element) {
			// get the row/column...		
			var data = {},
				index = element.index("#bseq .cell-inner"),
				note,
				currNote;
				
			data.row = BASS_MIN + (BASS_RANGE - getRow(index));
			data.col = getCol(index);
			
			note = bassPatterns[currentBassPattern][data.col].note;
			data.duration = bassPatterns[currentBassPattern][data.col].duration;
			data.startV = bassPatterns[currentBassPattern][data.col].volume;
			data.isTurningOn = false;
			
			// set up some variables for snapping to cells
			data.right = parseFloat(element.css("right"));
			data.next = element.parent().nextAll().eq(data.duration - 1);
			data.nextWidth = data.next.outerWidth();
			data.nextSnap = data.nextWidth / 2;
			data.prev = $("#bseq .cell").eq(index + data.duration - 1);
			data.prevWidth = data.prev.outerWidth() * -1;
			data.prevSnap = data.duration == 1 ? 0 : data.prevWidth / 2;
			
			if (note != data.row)
			{
				// turn it on!
				if (bassPatterns[currentBassPattern][data.col].note !== 0)
				{
					// remove the existing note from the grid...
					currNote = (BASS_MAX - bassPatterns[currentBassPattern][data.col].note) * NUMSTEPS + data.col;
					$("#bseq .cell-inner").eq(currNote).css("right", 0).removeClass("on");
				}
				bassPatterns[currentBassPattern][data.col].note = data.row;
				bassPatterns[currentBassPattern][data.col].duration = data.duration;
				bassPatterns[currentBassPattern][data.col].volume = 0.8;
				data.startV = 0.8;
				data.isTurningOn = true;
				element.addClass("on");
				element.children(".note").css("opacity", data.startV);
			}
			return data;
		},
		drag: function (data) {
			var dur, vol;
			
			// adjust the duration - move left/right
			if (data.nextSnap !== 0 && data.deltaX > data.nextSnap)
			{
				// snap to the next cell		
				data.element.css("right", data.right - data.nextWidth);
				data.prevWidth = data.nextWidth - data.next.outerWidth();
				data.prev = data.next;
				data.prevSnap = data.nextSnap;
				data.next = data.next.next();
				if (data.next.outerWidth())
				{
					data.nextSnap = data.nextWidth + data.next.outerWidth() / 2;
				}
				else
				{
					data.nextSnap = 0;
				}
				data.nextWidth += data.next.outerWidth();
				data.duration++;
				bassPatterns[currentBassPattern][data.col].duration = data.duration;
				// adjust the class name so we can turn off at the correct time...
				// wrap to 0 at the end.
				dur = data.col + data.duration == NUMSTEPS ? 0 : data.col + data.duration;
				data.element.removeClass("d" + (data.col + data.duration - 1));
				data.element.addClass("dur d" + dur);
			}
			else if (data.prevSnap !== 0 && data.deltaX < data.prevSnap)
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
				// wrap to 0
				dur = data.col + data.duration == NUMSTEPS - 1 ? 0 : data.col + data.duration + 1;
				data.element.removeClass("d" + dur);
				data.element.addClass("dur d" + (data.col + data.duration));
			}
			// change the volume if needed
			vol = calcVolume(data.startV, data.deltaY);
			requestAnimFrame(function () {
				data.element.children(".note").css("opacity", vol);
			});
			bassPatterns[currentBassPattern][data.col].volume = vol;
		},
		click: function (data) {
			if (data.isTurningOn === false)
			{
				// turn it off
				// remove all classes
				data.element.removeClass().addClass("cell-inner");
				data.element.css("right", 0);
				bassPatterns[currentBassPattern][data.col].duration = 1;
				bassPatterns[currentBassPattern][data.col].note = 0;
				bassPatterns[currentBassPattern][data.col].volume = 0.8;
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
		init: function (element)
		{
			// initialize for drag/drop
			var data = {},
				top, bottom, right, left;
			data.offsetX = element.offset().left;
			data.offsetY = element.offset().top;
			data.isOver = false;

			// get the drop zones...
			data.drops = [];
			element.siblings(".pattern").add(element.parent().next().children(".pattern.open")).each(function ()
			{
				left = $(this).offset().left;
				top = $(this).offset().top;
				right = left + $(this).outerWidth();
				bottom = top + $(this).outerHeight();
				data.drops.push([
					[left, right],
					[top, bottom], 
					$(this)
				]);
			});
			return data;
		},
		click: function (data)
		{
			switchActivePattern(data.element, "bass");
		},
		drag: function (data, e)
		{
			var px, py, x, y, drop, i, len;
			
			if (!data.shadow)
			{
				// create the shadow element while dragging
				data.shadow = data.element.clone().addClass("shadow").appendTo(document.body);
			}
			px = data.offsetX + data.deltaX;
			py = data.offsetY - data.deltaY;
			x = e.pageX;
			y = e.pageY;
			requestAnimFrame(function ()
			{
				// shadow follows the mouse
				data.shadow.css(
				{
					left: px + "px",
					top: py + "px"
				});
			});
			// look for drop zones...
			if (data.isOver === false)
			{
				for (i = 0, len = data.drops.length; i < len; i++)
				{
					drop = data.drops[i];
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
				drop = data.drops[data.isOver];
				if (x < drop[0][0] || x > drop[0][1] || y < drop[1][0] || y > drop[1][1])
				{
					// not over anymore
					drop[2].removeClass("over");
					data.isOver = false;
				}
			}
		},
		up: function (data)
		{
			if (data.isOver !== false)
			{
				var drop, targetIndex, sourceIndex, type;
			
				// currently over a drop zone
				drop = data.drops[data.isOver][2];
				drop.removeClass("over");

				// decide what to do (figure out bass or drums)
				targetIndex = drop.siblings(".pattern").addBack().index(drop);
				sourceIndex = data.element.siblings(".pattern").addBack().index(data.element);
				type = data.element.parent().attr("id").split("-")[0];
				if (drop.parent().hasClass("patterns"))
				{
					// copy the pattern
					window[type + "Patterns"][targetIndex] = $.extend(true, {}, window[type + "Patterns"][sourceIndex]);
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
					window[type + "Sequence"][targetIndex] = sourceIndex;
				}
			}
			// destroy the drag shadow
			data.shadow.remove();
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
	fn.click = function (data)
    {
		switchActivePattern(data.element, "drum");
	};
	return fn;
}
