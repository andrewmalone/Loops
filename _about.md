# Loops
[Loops](./) is an audio loop builder built using the [Web Audio API][api], created as a final project for [CS50][cs50].

## Features
Loops has two instrument tracks, one for bass and one for drums. Each track can have 8 different patterns and has an 8 step sequencer to arrange patterns into longer chains.

Each track has its own set of audio effects that can be applied.

Loops and sequences can be rendered to .wav files and downloaded locally, or saved as a url for sharing.

### Pattern Grids
The pattern grids for each track represent one measure (4 beats), split into 16 steps (16th notes). Individual steps can be toggled on and off by clicking. Dragging up or down on a step adjusts the volume for that step. Steps with lower volumes are displayed lighter, higher volumes will be darker.

#### Drum grid
On the drum grid, each row represents one drum sound. Currently available sounds are:

* bass drum
* snare drum
* snare rimshot
* closed high hat cymbal
* open high hat cymbal
* crash cymbal

The closed high hat cymbal "chokes" the open high hat - when the closed sound plays any open sounds stop playing. This gives a more realistic sound, since a real high hat cymbal can't play both sounds at the same time. The crash cymbal also chokes itself.

#### Bass grid
On the bass grid each row represents a different note in the scale. Unlike the drums, notes can be held for longer than one step - dragging a note to the right will increase the length of that note. Only one note can be selected for any given step.

### Patterns and Sequencing

#### Patterns
Each instrument track has 8 different patterns that can be created. To switch patterns, click on one of the pattern numbers. A pattern can be be copied into another slot by dragging and dropping one pattern onto another.

#### Sequencer
Each instrument also has a sequencer with 8 slots to chain patterns together. To add a pattern into the sequencer, drag from the pattern row into the sequencer row.

The playback mode button controls whether the sequencer is on or off. In loop mode, only the active pattern is played. In sequence mode, each step of the sequence is played in order before looping back to the beginning of the sequence.

### Effects

### Examples

## Browser support

## Implementation details
[Technical and implementation details for Loops](design.html)

## Credits
Loops was created by Andrew Malone.

* email: <andrew@andrewmalone.com>
* twitter: [@andrewmalone](https://twitter.com/andrewmalone)
* web: [andrewmalone.com](http://andrewmalone.com)

Audio samples used:

* Drums: Michael Kingston's [Ruffrider][ruffrider] drums
* Bass: [KVR audio forum][kvr] user Project16's [Rickenbacker 4001][bass]


[cs50]: http://cs50.net
[api]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
[ruffrider]: http://www.michaelkingston.fi/kingstondrums/ruffrider.html
[kvr]: http://www.kvraudio.com/
[bass]: http://bedroomproducersblog.com/2012/05/18/free-rickenbacker-4001-bass-guitar-sample-pack-by-project16/