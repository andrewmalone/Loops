#!c:/Python27/python.exe
# -*- coding: UTF-8 -*-

# enable debugging
import cgitb, cgi, json
cgitb.enable()
form = cgi.FieldStorage()
string = form.getvalue('data')

# get the current file count...
with open("save/count.txt") as file:
    count = int(file.read()) + 1

# create the new file
with open("save/%s.json" % count, "w") as file:
    file.write(string)

# increment the file count
with open("save/count.txt", "w") as file:
    file.write(str(count))

# send a response back
print "Content-Type: application/json\n"

response = {
    "data": {
        "num": count
    }
}

print json.dumps(response)