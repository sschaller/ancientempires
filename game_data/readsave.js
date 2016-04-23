var fs = require("fs");
var BufferReader = require("buffer-reader");
var Maps = require("./readmap");
var Units = require("./readunits");
var fileName = 'data/save.rs';

fs.exists(fileName, function(exists) {
    if (!exists) {
        console.log('File does not exist');
        return;
    }
    fs.stat(fileName, function(error, stats) {
        if(error){
            console.error(error);
            return;
        }
        fs.open(fileName, "r", function(error, fd) {
            var buffer = new Buffer(stats.size);
            if(error){
                console.error(error);
                return;
            }

            fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {

                if(error){
                    console.error(error);
                    return;
                }

                var reader = new BufferReader(buffer);

                var record_name_len = reader.nextUInt16BE();
                var record_name = reader.nextString(record_name_len);

                var version = reader.nextUInt32BE();
                var timestamp = reader.nextDoubleBE();

                var next_record_id = reader.nextUInt32BE();

                var i, record_id, record_len, record_data;
                for(i=0; i<next_record_id-1; i++){
                    data = {};
                    record_id = reader.nextUInt32BE();
                    record_len = reader.nextUInt32BE();
                    record_data = new BufferReader(reader.nextBuffer(record_len));

                    readsave(record_data);
                }


            });
        });
    });
});

function readsave(data){
    //only used for save

    var obj = {};

    Units.loadUnits(function(units){
        obj.var_byte_b = data.nextUInt8();//0 = m, 1 = s
        obj.T = data.nextUInt8();//map nr 0-...

        Maps.readMap((obj.var_byte_b==1 ? 's' : 'm') + obj.T, function(map, width, height){

            var buildings = [], x, y;
            for(x=0; x<width; x++){
                for(y=0; y<height; y++){
                    if(map[x][y] >= 23){
                        buildings.push([x, y, Math.floor(map[x][y]/3-1)]);
                    }
                }
            }

            obj.var_byte_e = data.nextUInt8();//number of players (probably includes NPC)
            obj.var_byte_c = data.nextUInt8();//whose turn

            obj.var_byte_h = [0, 1][obj.var_byte_c];

            obj.var_short_a = data.nextUInt16BE();
            obj.var_int_a = data.nextUInt8();

            obj.var_byte_arr_g = [];
            obj.var_int_arr_a = [];
            for(var i=0; i<obj.var_byte_e; i++){
                obj.var_byte_arr_g[i] = data.nextUInt8();
                obj.var_int_arr_a[i] = data.nextUInt16BE();//coins for player i
            }
            for(var j=0; j<buildings.length; j++){
                map[buildings[j][0]][buildings[j][1]] = data.nextUInt8();
            }

            var entities = [];
            var num_entities = data.nextUInt8();

            obj.num_entities = num_entities;

            var by, by2, by3, by4, by5, by6, s, s2, s3, s4;

            for(var k=0; k<num_entities; k++){

                entity = {};

                by = data.nextUInt8();//type
                by2 = data.nextUInt8();//alliance
                by3 = data.nextUInt8();//
                by4 = data.nextUInt8();//
                by5 = data.nextUInt8();//health
                by6 = data.nextUInt8();//
                s = data.nextUInt16BE();//x * 24 (genaue pixel) ? -> y nicht vorhanden??
                s2 = data.nextUInt16BE();//x
                s3 = data.nextUInt16BE();//y
                s4 = data.nextUInt16BE();//

                entity.i = s2;//x
                entity.var_short_a = s3;//y

                entity.var_byte_d = by;//type
                entity.var_byte_a = by2;//alliance to player 0, 1

                entity.l = units[by].bits;
                entity.var_byte_arr_arr_a = units[by].offsets;

                entity.var_byte_e = by3;//0 - not turn, 1 - not moved, 2 - already moved, 3 - dead
                entity.var_short_b = s; //promotion
                entity.var_short_d = by6; //rank 0-3
                entity.var_byte_b = by4;//status (bit 1 poisoned, bit 2 wisped)
                entity.h = by5;//health
                entity.var_int_b = s4;


                entities.push(entity);

            }

            obj.entities = entities;

            obj.N = data.nextUInt16BE();
            obj.var_long_a = data.nextUInt32BE();
            obj.var_int_k = data.nextUInt32BE();
            obj.var_boolean_j = data.nextUInt8() != 0;

            console.log(obj);
        });
    });

}
