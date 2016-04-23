var fs = require("fs");
var BufferReader = require("buffer-reader");

function readMap(name, ret){
    var fileName = "data/" + name;
    fs.exists(fileName, function(exists) {
        if (exists) {
            fs.stat(fileName, function(error, stats) {
                fs.open(fileName, "r", function(error, fd) {
                    var buffer = new Buffer(stats.size);

                    fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {

                        var reader = new BufferReader(buffer);

                        var width = reader.nextUInt32BE();
                        var height = reader.nextUInt32BE();

                        var map = [];
                        var y, x;
                        for(x=0; x<width; x++) {
                            map.push([]);
                        }
                        for(x=0; x<width; x++) {
                            for(y=0; y<height; y++){
                                map[x][y] = reader.nextUInt8();
                            }
                        }
                        ret(map, width, height);
                    });
                });
            });
        }
    });
}

function listMap(map, width, height) {
    for(var o, x, y=0; y < height; y++){
        o = '';
        for(x=0; x < width; x++){
            o += map[x][y] < 10 ? '0'+map[x][y] : ''+map[x][y];
            o += ' ';
        }
        console.log(o);
    }
}

module.exports = {
    readMap: readMap,
    listMap: listMap
};

readMap('s0', function(map, w, h) {
    listMap(map, w, h);
});
