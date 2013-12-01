$.fn.addInteraction = function(selector, cb)
{
	if (cb == null)
	{
		cb = selector;
		selector = undefined;
	}
	this.on("mousedown touchstart", selector, function(e) {
		// Add interaction functions here...
		// init(?), click, drag, up
		e = touchify(e);
		var data = {};
		if (cb.init)
		{
			data = cb.init($(this))
		}
		data.startX = e.pageX;
		data.startY = e.pageY;
		data.element = $(this);
		
		$(document)
			.on("mousemove touchmove", function(e) {
				if (cb.drag) {
					e = touchify(e);
					// to the right is positive change, left is negative
					data.deltaX = e.pageX - data.startX;
					// up is positive change, down is negative
					data.deltaY = data.startY - e.pageY;
					data.currX = e.pageX;
					cb.drag(data);
				}
				return false;
			})
			.on("mouseup touchend", function(e) {
				e = touchify(e);
				$(document).off("mousemove touchmove mouseup touchend");
				if (e.pageY == data.startY && e.pageX == data.startX)
				{
					if (cb.click)
					{
						cb.click(data);
					}
				}
				else if (cb.up)
				{
					cb.up(data);
				}
				return false;
			})
		return false;
	});
}

function addInteraction(target, cb) {
	target.on("mousedown touchstart", function(e) {
		var data = {};
		e = touchify(e);
		if (cb.init) {
			data = cb.init($(this));
		}
		data.startX = e.pageX;
		data.startY = e.pageY;
		data.t = $(this);
		if (cb.down) { // this might not be needed!
			cb.down(data);
		}
		$(document)
			.on("mousemove touchmove", function(e) {
				e = touchify(e);
				// get the mousemove deltas...
				if (cb.drag) {
					// to the right is positive change, left is negative
					data.deltaX = e.pageX - data.startX;
					// up is positive change, down is negative
					data.deltaY = data.startY - e.pageY;
					console.log(e.pageX, data.startX);
					cb.drag(data);
				}	
				return false;				
			})
			.on("mouseup touchend", function(e) {
				e = touchify(e);
				$(document).off("mousemove touchmove mouseup touchend");
				// do a click detection
				if (e.pageY == data.startY && e.pageX == data.startX) {
					if (cb.click) {
						cb.click(data);
					}	
					if (cb.doubleclick) {
						if (typeof data.t.data("clickCount") != "number") {
							data.t.data("clickCount",0);
						}
						if (data.t.data("clickCount") > 1) {}			
						data.t.data("clickCount",data.t.data("clickCount")+1);
						if (data.t.data("clickCount") == 1) {
							setTimeout(function(){
								data.t.data("clickCount",0);
							}, 300);
						}
						if (data.t.data("clickCount") > 1) {
							//console.log("doubleclick?")
							cb.doubleclick(data);
							data.t.data("clickCount",0);
						}
					}
				}
				else if (cb.up) {
					cb.up(data);
				}
				return false;
			});
		return false;
	});
}

function touchify(e) { 
	// fix for jquery touch event handling
	// adapted from http://www.the-xavi.com/articles/trouble-with-touch-events-jquery
	if (e.originalEvent.touches && e.originalEvent.touches.length) {
		new_event = e.originalEvent.touches[0];
		if (e.data) {
			new_event.data = e.data
		}
		return new_event;
	}
	else if (e.originalEvent.changedTouches && e.originalEvent.changedTouches.length) {
		new_event = e.originalEvent.changedTouches[0];
		if (e.data) {
			new_event.data = e.data
		}
		return new_event;
	}
	else return e;
}