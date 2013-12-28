/**
* interaction.js
* Creates a jquery function to add interactions to any element
* Interactions can be click, drag, and up
* Combines mouse and touch events into common behaviors
*/

$.fn.addInteraction = function (selector, cb)
{
	if (cb === undefined)
	{
		cb = selector;
		selector = undefined;
	}
	this.on("mousedown touchstart", selector, function (e) {
		e = touchify(e);
		var data = {};
		if (cb.init)
		{
			data = cb.init($(this), e);
		}
		data.startX = e.pageX;
		data.startY = e.pageY;
		data.element = $(this);
		
		$(document)
			.on("mousemove touchmove", function (e) {
				if (cb.drag) {					
					e = touchify(e);
					// to the right is positive change, left is negative
					data.deltaX = e.pageX - data.startX;
					// up is positive change, down is negative
					data.deltaY = data.startY - e.pageY;
					cb.drag(data, e);
				}
				return false;
			})
			.on("mouseup touchend", function (e) {
				e = touchify(e);
				$(document).off("mousemove touchmove mouseup touchend");
				if (e.pageY == data.startY && e.pageX == data.startX)
				{
					if (cb.click)
					{
						cb.click(data, e);
					}
				}
				else if (cb.up)
				{
					cb.up(data, e);
				}
				return false;
			});
		return false;
	});
};

/**
* fix for jquery touch event handling
* adapted from http://www.the-xavi.com/articles/trouble-with-touch-events-jquery
*/
function touchify(e) {
	var new_event;
	if (e.originalEvent.touches && e.originalEvent.touches.length) {
		new_event = e.originalEvent.touches[0];
		if (e.data) {
			new_event.data = e.data;
		}
		return new_event;
	}
	else if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
		new_event = e.originalEvent.changedTouches[0];
		if (e.data) {
			new_event.data = e.data;
		}
		return new_event;
	}
	else { return e; }
}
