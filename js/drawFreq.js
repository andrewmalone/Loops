/*global AudioContext */
var context = new AudioContext();

var filters = [];

filters[0] = context.createBiquadFilter();
filters[0].type = "lowpass";
filters[0].gain.value = 0;
filters[0].Q.value = 1;
filters[0].frequency.value = 80;
/*
filters[1] = context.createBiquadFilter();
filters[1].type = "highshelf";
filters[1].gain.value = 0;
// filters[1].Q.value = 1;
filters[1].frequency.value = 10000;

filters[2] = context.createBiquadFilter();
filters[2].type = "peaking";
filters[2].gain.value = 0;
// filters[1].Q.value = 1;
filters[2].frequency.value = 2000;

filters[3] = context.createBiquadFilter();
filters[3].type = "peaking";
filters[3].gain.value = 0;
// filters[1].Q.value = 1;
filters[3].frequency.value = 200;
*/
var width = document.getElementById("svg").getAttribute("width");
var height = document.getElementById("svg").getAttribute("height");
var noctaves = 11;
var nyquist = 0.5 * context.sampleRate;

// setup the filter controllers
filters.forEach(function (filter, i)
{
	// add a circle controller...
	var c;
	c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	c.setAttribute("cx", toPercent(filter.frequency.value) * width);
	c.setAttribute("cy", (1 - ((filter.gain.value + 20) / 40)) * height);
	c.setAttribute("r", "5");
	document.getElementById("svg").appendChild(c);
	
	c.addEventListener("mousedown", function (e) {
	// get coordinates on top of svg element
	// var startX, startY, offsetX, offsetY;
	// console.log(e.pageX, this.getAttribute("cx"));
		var offsetX = e.pageX - this.getAttribute("cx"),
			offsetY = e.pageY - this.getAttribute("cy"),
			c = this,
			move, up;
		move = function (e)
		{
			//console.log(Math.min(Math.max(e.pageX - offsetX, 0), width));
			var x = constrain(e.pageX - offsetX, 0, width),
				y = constrain(e.pageY - offsetY, 0, height),
				freq = toFreq(x / width),
				db = ((height - y) / height) * 40 - 20;
			db = constrain((db / 20) * 5, .001, 5); 
			console.log(db);
			c.setAttribute("cx", x);
			c.setAttribute("cy", y);
			filter.frequency.value = freq;
			filter.Q.value = db;
			clear();
			drawFilter();
			//console.log(y, db);
		};
		up = function ()
		{
			document.removeEventListener("mousemove", move);
			document.removeEventListener("mouseup", up);
		};
		document.addEventListener("mousemove", move);
		document.addEventListener("mouseup", up);
	});

});


drawFilter();

function constrain(value, min, max)
{
	return Math.min(max, Math.max(min, value));
}

function toFreq(percent)
{
	return nyquist * Math.pow(2.0, noctaves * (percent - 1.0));
}

function toPercent(freq)
{
	return (Math.log(freq / nyquist) / (noctaves * Math.log(2)) + 1).toFixed(2);
}
//filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
function drawFilter()
{
	var i, f, j, tmp, db = [],
		frequencyHz = new Float32Array(width),
		magResponse = [],
		phaseResponse = [];
	
	for (i = 0; i < width; i++)
	{
		f = toFreq(i / width);
		frequencyHz[i] = f;
	}
	
	for (i = 0; i < filters.length; i++)
	{
		magResponse[i] = new Float32Array(width);
		phaseResponse[i] = new Float32Array(width);
		filters[i].getFrequencyResponse(frequencyHz, magResponse[i], phaseResponse[i]);		
	}
	//console.log(magResponse);
	
	//filter.getFrequencyResponse(frequencyHz, magResponse, phaseResponse);
	// magResponse to db scale
	// var dbResponse = 20.0 * Math.log(response) / Math.LN10;
	for (i = 0; i < width; i++)
	{
		tmp = 0;
		for (j = 0; j < filters.length; j++)
		{
			tmp += 20.0 * Math.log(magResponse[j][i]) / Math.LN10;
		}
		db[i] = tmp;
	}
	// draw(magResponse, 0, 2, "green");
	draw(db, -20, 20, "red");
	//console.log(db);
}

function draw(parts, mn, mx, color)
{
	var svg = document.getElementById("svg"),
		ln, i,
		x1 = 0,
		y1 = 0,
		x2 = 0,
		y2 = 100 - (100 * (parts[0] - mn) / (mx - mn)),
		g = document.createElementNS("http://www.w3.org/2000/svg", "g");
	for (i = 0; i < parts.length; i++)
	{
		ln = document.createElementNS("http://www.w3.org/2000/svg", "line");
		y1 = y2; 
		x1 = x2;
		x2 = 100 * (i / (parts.length - 1)),
		y2 = 100 - (100 * (parts[i] - mn) / (mx - mn));
		ln.setAttribute("x1", x1 + "%");
		ln.setAttribute("x2", x2 + "%");
		ln.setAttribute("y1", y1 + "%");
		ln.setAttribute("y2", y2 + "%");
		ln.setAttribute("stroke", color);
		ln.setAttribute("stroke-width", "1");
		// console.log(parts[i], x2, y2);
		// document.getElementsByTagName("svg")[0].appendChild(ln);
		g.appendChild(ln);
	}
	svg.insertBefore(g, svg.firstChild);
}

function clear()
{
	var g = document.getElementById("svg").getElementsByTagName("g");
	while (g.length)
	{
		g[0].parentNode.removeChild(g[0]);
	}
}
