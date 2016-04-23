var fs = require("fs");
var util = require("util");
var BufferReader = require("buffer-reader");

function loadUnits(ret) {
    var fileName = "data/units.bin";
    fs.exists(fileName, function(exists) {
        if (exists) {
            fs.stat(fileName, function(error, stats) {
                fs.open(fileName, "r", function(error, fd) {
                    var buffer = new Buffer(stats.size);

                    fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {

                        var reader = new BufferReader(buffer);

                        var entities = [];
                        var names = ['Soldier', 'Archer', 'Lizard', 'Wizard', 'Wisp', 'Spider', 'Golem', 'Catapult', 'Wyvern', 'King', 'Skeleton'];

                        for(var j=0; j<11; j++) {
                            var entity = {};
                            entities.push(entity);

                            entity.name = names[j];

                            entity.mov = reader.nextUInt8();
                            entity.atk = reader.nextUInt8();
                            entity.def = reader.nextUInt8();
                            entity.max = reader.nextUInt8();
                            entity.min = reader.nextUInt8();
                            entity.cost = reader.nextUInt16BE();
                            entity.positions_in_battle = [];

                            var nr = reader.nextUInt8();
                            for (var i = 0; i < nr; i++) {
                                entity.positions_in_battle.push([reader.nextUInt8(), reader.nextUInt8()]);
                            }
                            var nr2 = reader.nextUInt8();
                            var test = 0;
                            entity.bits = [];
                            for(var k=0; k< nr2; k++){
                                //test = test | (1 << reader.nextUInt8());
                                entity.bits.push(1 << reader.nextUInt8());
                            }
                        }
                        if(typeof ret === 'function') ret(entities);
                        //console.log(entities);
                    });
                });
            });
        }
    });
}

module.exports = {
    loadUnits: loadUnits
};

loadUnits(function(entities) {
    console.log(util.inspect(entities, {showHidden: false, depth: null}));
})
