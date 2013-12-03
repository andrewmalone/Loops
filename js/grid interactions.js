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
					element.css("opacity", vol);
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
				data.element.css("opacity", vol);
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