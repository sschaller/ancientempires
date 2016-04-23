var fs = require("fs");
var BufferReader = require("buffer-reader");
var fileName = "1.pak";

fs.exists(fileName, function(exists) {
    if (exists) {
        fs.stat(fileName, function(error, stats) {
            fs.open(fileName, "r", function(error, fd) {
                var buffer = new Buffer(stats.size);

                fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {

                    var offset = 0;

                    var reader = new BufferReader(buffer);

                    var j = reader.nextUInt16BE();
                    var k = reader.nextUInt16BE();

                    console.log(j);
                    console.log(k);

                    var names = [];
                    var lengths = [];

                    for(var i = 0; i<k; i++){
                        var len = reader.nextUInt16BE();
                        var name = reader.nextString(len);
                        names.push(name);
                        reader.nextUInt32BE();
                        var len2 = reader.nextUInt16BE();
                        lengths.push(len2);

                        console.log(name + ': ' + len2);
                    }
                    for(var i = 0; i<k; i++){
                        var data = reader.nextBuffer(lengths[i]);

                        console.log(data);

                        (function(d){
                            fs.open('data/' + names[i], 'w', function(e, fd){
                                if(!!e){
                                    console.error(e);
                                    return;
                                }
                                fs.write(fd, d, 0, d.length, function(){
                                    console.log('written');
                                    fs.close(fd);
                                });

                            });
                        })(data);


                    }



                });
            });
        });
    }
});
