/**
 * sounds.js
 * global declaration of sounds to use for the application
 */
 
var SOUNDS = [
	{
		name: "kick",
		source: "Ruffrider/Kick 3",
		mute: null
	}, 
	{
		name: "snare",
		source: "Ruffrider/Snare base 4",
		mute: null
	}, 
	{
		name: "rim",
		source: "Ruffrider/Snare rim 3",
		mute: null
	}, 
	{
		name: "cl hat",
		source: "Ruffrider/hihat base 3",
		mute: 1
	}, 
	{
		name: "op hat",
		source: "Ruffrider/hihat open 3",
		mute: 1
	}, 
	{
		name: "ride",
		source: "Ruffrider/ride 3",
		mute: 2
	}
];

var BASS_SOUNDS = [
    "Fingered2E1_4",
    "Fingered2F1_4",
    "Fingered2G1_4",
    "Fingered2A1_4",
    "Fingered2B1_4",
    "Fingered2C1_4",
    "Fingered2D1_4",
    "Fingered2E2_4",
    "Fingered2F2_4",
    "Fingered2G2_4",
    "Fingered2A2_4",
    "Fingered2B2_4",
    "Fingered2C2_4",
    "Fingered2D2_4",
    "Fingered2E3_4",
    "Fingered2F3_4",
    "Fingered2G3_4",
    "Fingered2A3_4",
    "Fingered2B3_4",
    "Fingered2C3_4",
    "Fingered2D3_4"
];

var BASS_MAPPING = {
    "24": {
        "sample": "Fingered2E1_4",
        "tune": 10,
        "pitch": -4
    },
    "25": {
        "sample": "Fingered2E1_4",
        "tune": 10,
        "pitch": -3
    },
    "26": {
        "sample": "Fingered2E1_4",
        "tune": 10,
        "pitch": -2
    },
    "27": {
        "sample": "Fingered2E1_4",
        "tune": 10,
        "pitch": -1
    },
    "28": {
        "sample": "Fingered2E1_4",
        "tune": 10,
        "pitch": 0
    },
    "29": {
        "sample": "Fingered2F1_4",
        "tune": -3,
        "pitch": 0
    },
    "30": {
        "sample": "Fingered2F1_4",
        "tune": -3,
        "pitch": 1
    },
    "31": {
        "sample": "Fingered2G1_4",
        "tune": -4,
        "pitch": 0
    },
    "32": {
        "sample": "Fingered2G1_4",
        "tune": -4,
        "pitch": 1
    },
    "33": {
        "sample": "Fingered2A1_4",
        "tune": 0,
        "pitch": 0
    },
    "34": {
        "sample": "Fingered2A1_4",
        "tune": 0,
        "pitch": 1
    },
    "35": {
        "sample": "Fingered2B1_4",
        "tune": 0,
        "pitch": 0
    },
    "36": {
        "sample": "Fingered2C1_4",
        "tune": 4,
        "pitch": 0
    },
    "37": {
        "sample": "Fingered2C1_4",
        "tune": 4,
        "pitch": 1
    },
    "38": {
        "sample": "Fingered2D1_4",
        "tune": 6,
        "pitch": 0
    },
    "39": {
        "sample": "Fingered2D1_4",
        "tune": 6,
        "pitch": 1
    },
    "40": {
        "sample": "Fingered2E2_4",
        "tune": -4,
        "pitch": 0
    },
    "41": {
        "sample": "Fingered2F2_4",
        "tune": -3,
        "pitch": 0
    },
    "42": {
        "sample": "Fingered2F2_4",
        "tune": -3,
        "pitch": 1
    },
    "43": {
        "sample": "Fingered2G2_4",
        "tune": 3,
        "pitch": 0
    },
    "44": {
        "sample": "Fingered2G2_4",
        "tune": 3,
        "pitch": 1
    },
    "45": {
        "sample": "Fingered2A2_4",
        "tune": -2,
        "pitch": 0
    },
    "46": {
        "sample": "Fingered2A2_4",
        "tune": -2,
        "pitch": 1
    },
    "47": {
        "sample": "Fingered2B2_4",
        "tune": -7,
        "pitch": 0
    },
    "48": {
        "sample": "Fingered2C2_4",
        "tune": -10,
        "pitch": 0
    },
    "49": {
        "sample": "Fingered2C2_4",
        "tune": -10,
        "pitch": 1
    },
    "50": {
        "sample": "Fingered2D2_4",
        "tune": -12,
        "pitch": 0
    },
    "51": {
        "sample": "Fingered2D2_4",
        "tune": -12,
        "pitch": 1
    },
    "52": {
        "sample": "Fingered2E3_4",
        "tune": -11,
        "pitch": 0
    },
    "53": {
        "sample": "Fingered2F3_4",
        "tune": -18,
        "pitch": 0
    },
    "54": {
        "sample": "Fingered2F3_4",
        "tune": -18,
        "pitch": 1
    },
    "55": {
        "sample": "Fingered2G3_4",
        "tune": -9,
        "pitch": 0
    },
    "56": {
        "sample": "Fingered2G3_4",
        "tune": -9,
        "pitch": 1
    },
    "57": {
        "sample": "Fingered2A3_4",
        "tune": -11,
        "pitch": 0
    },
    "58": {
        "sample": "Fingered2A3_4",
        "tune": -11,
        "pitch": 1
    },
    "59": {
        "sample": "Fingered2B3_4",
        "tune": -17,
        "pitch": 0
    },
    "60": {
        "sample": "Fingered2C3_4",
        "tune": -16,
        "pitch": 0
    },
    "61": {
        "sample": "Fingered2C3_4",
        "tune": -16,
        "pitch": 1
    },
    "62": {
        "sample": "Fingered2D3_4",
        "tune": -18,
        "pitch": 0
    },
    "63": {
        "sample": "Fingered2D3_4",
        "tune": -18,
        "pitch": 1
    }
};