/**
* gridInteractions.js
* Defines all the interactions in the drum and bass grids,
* and the pattern drag/drop
*/

/*global getRow, getCol, requestAnimFrame, calcVolume, switchActivePattern */
/*global drumPatterns, currentDrumPattern, NUMSTEPS */

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
* Defines the interactions for drum patterns
* Click to switch patterns
* Drag to another pattern to copy
* Drag to sequence
*/
function drumPatternInteractions()
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
			switchActivePattern(data.element, "drum");
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
