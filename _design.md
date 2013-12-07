# Loops - technical design details
Loops is mostly implemented in javascript using the [Web Audio API][api] for all sound generation and processing.

## General design and organization
The code is organized into the following files:

* **loops.js** - Contains the document load function that is fired when the page first loads

* **interface.js** - functions for updating the interface based on interactions or other events.

* **initInterface.js** - Initializes the interface. Dynamically draws the pattern grids, creates the pattern and sequence rows, and creates all the parameter sliders.

* **audioGraph.js** - sets up all the audio processing nodes and effects parameters

* gridInteraction.js


The heart of the application is the sequencer loop and the audio graph. 

## Audio graph

## Sequencer loop

## External scripts/libraries
* [jQuery][jquery]

* [Audio context monkey patch][monkeypatch] - this useful script normalizes the vendor prefixes for the web audio api to make cross browser support easier.

## Tools and technology used
* [Coda][coda] for code editing.

* [Hammer][hammer] for compiling html and css files locally. This is a very cool utility for building static websites - it allows for html includes and lots of little touches to ease development. It allowed me to keep all my javascript in individual files, and then automatically combine them into one file for publishing.

* [Sass][sass] - 

* [Markdown][markdown]

**Note:** The main directory has files with the hammer specific directives and won't run without hammer. The Build folder has the compiled files that should run on any webserver.

[hammer]: http://hammerformac.com/
[coda]: http://panic.com/Coda/
[monkeypatch]: https://github.com/cwilso/AudioContext-MonkeyPatch/
[jquery]: http://jquery.com/
[sass]: http://sass-lang.com/
[timing]: http://www.html5rocks.com/en/tutorials/audio/scheduling/
[api]: http://www.w3.org/TR/webaudio/
[markdown]: http://daringfireball.net/projects/markdown/