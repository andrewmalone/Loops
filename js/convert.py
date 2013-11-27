f = open('bass.sfz')
lines = [line.strip() for line in f]
f.close()

regions = []
region = {}
notes = {}
sounds = []

# parse the sfz file
for line in lines:
    if "<region>" in line:
        # end the last region
        if len(region) > 0 and "lovel" in region:
            if region["lovel"] == '88': regions.append(region)
        
        # start a new region
        region = {}

        line = line.replace("<region> ","")

    if "=" in line:
        param = line[:line.find("=")]
        value = line[line.find("=") + 1:]
        if (param == "sample"):
            value = value[value.find("\\") + 1:].replace("#","")
        region[param] = value;

# deal with the last region
if region["lovel"] == '88': regions.append(region)

for region in regions:
    # add to the list of sounds to load...
    sounds.append(region["sample"])

    # create an entry for each note...
    if "key" in region:
        low = int(region["key"])
        high = low + 1
        center = int(region["key"])
    else:
        low = int(region["lokey"])
        high = int(region["hikey"]) + 1
        center = int(region["pitch_keycenter"])

    for i in range(low, high):
        # print region
        obj = {}
        obj["sample"] = region["sample"]
        obj["pitch"] = i - center
        obj["tune"] = int(region["tune"]) if "tune" in region else 0
        notes[i] = obj

import json
f = open("bass_sound.js", "w")
f.write("BASS_SOUNDS = " + json.dumps(sounds, indent=4, separators=(',', ': ')) + ";\n")
f.write("BASS_MAPPING = " + json.dumps(notes, indent=4, separators=(',', ': ')) + ";")
f.close()

