var fs = require("fs");
var BufferReader = require("buffer-reader");
var fileName = "lang.dat";

fs.exists(fileName, function(exists) {
    if (exists) {
        fs.stat(fileName, function(error, stats) {
            fs.open(fileName, "r", function(error, fd) {
                var buffer = new Buffer(stats.size);

                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {

                    var reader = new BufferReader(buffer);

                    var number = reader.nextUInt32BE();

                    var whole = "";

                    for(var i = 0; i < number; i++){
                        var len = reader.nextUInt16BE();
                        var text = reader.nextString(len);
                        whole += i + ": " + text + "\r\n";
                    }

                    fs.writeFile("data/lang.txt", whole, function(err) {
                        if(err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");
                    });


                });
            });
        });
    }
});
