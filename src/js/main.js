var AEFont = (function () {
    function AEFont(x, y, group, text) {
        this.x = x;
        this.y = y;
        this.text = text || "";
        this.group = group;
        this.letters = [];
        this.draw();
    }
    AEFont.getFontIndex = function (char) {
        if (char >= 65 && char < 90) {
            return char - 65;
        }
        else if (char >= 49 && char <= 57) {
            return char - 49 + 27;
        }
        else if (char == 48) {
            return 14; // return O
        }
        else if (char == 45) {
            return 25;
        }
        else if (char == 43) {
            return 26;
        }
        else {
            console.log("Don't recognize char code " + char);
            return 0;
        }
    };
    AEFont.prototype.setText = function (text) {
        this.text = text;
        this.draw();
    };
    AEFont.prototype.draw = function () {
        var l = [];
        var x = this.x;
        for (var i = 0; i < this.text.length; i++) {
            var char = this.text.charCodeAt(i);
            var index = AEFont.getFontIndex(char);
            var image = void 0;
            if (this.letters.length > 0) {
                image = this.letters.shift();
            }
            else {
                image = AncientEmpires.game.add.image(x, this.y, "chars", null, this.group);
            }
            image.frame = index;
            l.push(image);
            x += image.width;
        }
        while (this.letters.length > 0) {
            var letter = this.letters.shift();
            letter.destroy();
        }
        this.letters = l;
    };
    return AEFont;
}());

var Pos = (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    Pos.prototype.match = function (p) {
        return (!!p && this.x == p.x && this.y == p.y);
    };
    Pos.prototype.copy = function (direction) {
        if (direction === void 0) { direction = Direction.None; }
        switch (direction) {
            case Direction.Up:
                return new Pos(this.x, this.y - 1);
            case Direction.Right:
                return new Pos(this.x + 1, this.y);
            case Direction.Down:
                return new Pos(this.x, this.y + 1);
            case Direction.Left:
                return new Pos(this.x - 1, this.y);
        }
        return new Pos(this.x, this.y);
    };
    Pos.prototype.move = function (direction) {
        switch (direction) {
            case Direction.Up:
                this.y--;
                break;
            case Direction.Right:
                this.x++;
                break;
            case Direction.Down:
                this.y++;
                break;
            case Direction.Left:
                this.x--;
                break;
        }
        return this;
    };
    Pos.prototype.getDirectionTo = function (p) {
        if (p.x > this.x) {
            return Direction.Right;
        }
        if (p.x < this.x) {
            return Direction.Left;
        }
        if (p.y > this.y) {
            return Direction.Down;
        }
        if (p.y < this.y) {
            return Direction.Up;
        }
        return Direction.None;
    };
    Pos.prototype.getWorldPosition = function () {
        return new Pos(this.x * AncientEmpires.TILE_SIZE, this.y * AncientEmpires.TILE_SIZE);
    };
    Pos.prototype.getInfo = function () {
        return "{x: " + this.x + ", y: " + this.y + "}";
    };
    return Pos;
}());
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["Down"] = 4] = "Down";
    Direction[Direction["Left"] = 8] = "Left";
})(Direction || (Direction = {}));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Loader = (function (_super) {
    __extends(Loader, _super);
    function Loader() {
        _super.call(this);
    }
    Loader.prototype.preload = function () {
        this.game.load.binary("data", "data/1.pak", function (key, data) {
            return new Uint8Array(data);
        });
    };
    Loader.prototype.create = function () {
        var _this = this;
        this.unpackResourceData();
        this.loadEntityData();
        this.loadMapTilesProp();
        var waiter = new PNGWaiter(function () {
            _this.game.state.start("MainMenu", false, false, name);
        });
        PNGLoader.loadSpriteSheet(waiter, "tiles0", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 0);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 1);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 2);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons", 24, 24, 0, 1);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons", 24, 24, 0, 2);
        PNGLoader.loadSpriteSheet(waiter, "cursor", 26, 26);
        PNGLoader.loadSpriteSheet(waiter, "b_smoke");
        PNGLoader.loadSpriteSheet(waiter, "menu");
        PNGLoader.loadSpriteSheet(waiter, "portrait");
        PNGLoader.loadSpriteSheet(waiter, "chars");
        PNGLoader.loadImage(waiter, "gold");
        waiter.await();
    };
    Loader.prototype.unpackResourceData = function () {
        var array = this.game.cache.getBinary("data");
        var data = new DataView(array.buffer);
        var index = 2; // does not seem important
        var number_of_entries = data.getUint16(index);
        index += 2;
        var entries = [];
        for (var i = 0; i < number_of_entries; i++) {
            var str_len = data.getUint16(index);
            index += 2;
            var name_1 = "";
            for (var j = 0; j < str_len; j++) {
                name_1 += String.fromCharCode(data.getUint8(index++));
            }
            index += 4; // does not seem important
            var size = data.getUint16(index);
            index += 2;
            entries.push({ name: name_1, size: size });
        }
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var entry_data = array.buffer.slice(index, index + entry.size);
            this.game.cache.addBinary(entry.name, entry_data);
            index += entry.size;
        }
    };
    Loader.prototype.loadEntityData = function () {
        var buffer = this.game.cache.getBinary("units.bin");
        var data = new DataView(buffer);
        var index = 0;
        AncientEmpires.ENTITIES = [];
        var names = ["Soldier", "Archer", "Lizard", "Wizard", "Wisp", "Spider", "Golem", "Catapult", "Wyvern", "King", "Skeleton"];
        for (var i = 0; i < names.length; i++) {
            var entity = {
                name: names[i],
                mov: data.getUint8(index++),
                atk: data.getUint8(index++),
                def: data.getUint8(index++),
                max: data.getUint8(index++),
                min: data.getUint8(index++),
                cost: data.getUint16(index),
                battle_positions: [],
                flags: EntityFlags.None
            };
            index += 2;
            var number_pos = data.getUint8(index++);
            for (var j = 0; j < number_pos; j++) {
                entity.battle_positions.push({ x: data.getUint8(index++), y: data.getUint8(index++) });
            }
            var number_flags = data.getUint8(index++);
            for (var j = 0; j < number_flags; j++) {
                entity.flags |= 1 << data.getUint8(index++);
            }
            AncientEmpires.ENTITIES.push(entity);
        }
    };
    Loader.prototype.loadMapTilesProp = function () {
        var buffer = this.game.cache.getBinary("tiles0.prop");
        var data = new DataView(buffer);
        var index = 0;
        var length = data.getUint16(index);
        index += 4; // 2 are unrelevant
        AncientEmpires.TILES_PROP = [];
        for (var i = 0; i < length; i++) {
            AncientEmpires.TILES_PROP.push(data.getUint8(index++));
        }
    };
    return Loader;
}(Phaser.State));

var PNGWaiter = (function () {
    function PNGWaiter(callback) {
        var _this = this;
        this.ret = function () {
            _this.counter--;
            if (_this.counter > 0 || !_this.awaiting) {
                return;
            }
            _this.callback();
        };
        this.counter = 0;
        this.awaiting = false;
        this.callback = callback;
    }
    PNGWaiter.prototype.await = function () {
        this.awaiting = true;
        if (this.counter <= 0) {
            // if img.onload is synchronous
            this.callback();
        }
    };
    PNGWaiter.prototype.add = function () {
        this.counter++;
    };
    return PNGWaiter;
}());
var PNGLoader = (function () {
    function PNGLoader() {
    }
    PNGLoader.bufferToBase64 = function (buf) {
        var binstr = Array.prototype.map.call(buf, function (ch) {
            return String.fromCharCode(ch);
        }).join("");
        return btoa(binstr);
    };
    PNGLoader.loadSpriteSheet = function (waiter, name, tile_width, tile_height, number_of_tiles, variation) {
        var spritesheet_name = name;
        if (typeof tile_width == "undefined" || typeof tile_height == "undefined" || typeof number_of_tiles == "undefined") {
            var buffer = AncientEmpires.game.cache.getBinary(name + ".sprite");
            var data = new DataView(buffer);
            var index = 0;
            if (typeof number_of_tiles == "undefined") {
                number_of_tiles = data.getUint8(index++);
            }
            if (typeof tile_width == "undefined") {
                tile_width = data.getUint8(index++);
            }
            if (typeof tile_height == "undefined") {
                tile_height = data.getUint8(index++);
            }
        }
        if (AncientEmpires.game.cache.checkBinaryKey(name + ".png")) {
            // all tiles are in one file
            var png_buffer = AncientEmpires.game.cache.getBinary(name + ".png");
            if (typeof variation != "undefined") {
                png_buffer = PNGLoader.createVariation(png_buffer, variation);
                spritesheet_name += "_" + variation;
            }
            var img_1 = new Image();
            waiter.add();
            img_1.onload = function () {
                AncientEmpires.game.cache.addSpriteSheet(spritesheet_name, null, img_1, tile_width, tile_height);
                waiter.ret();
            };
            img_1.src = "data:image/png;base64," + PNGLoader.bufferToBase64(new Uint8Array(png_buffer));
        }
        else {
            // tiles are in multiple files with names name_00.png, name_01.png, ...
            waiter.add();
            var inner_waiter_1 = new PNGWaiter(waiter.ret);
            var square_1 = Math.ceil(Math.sqrt(number_of_tiles));
            var spritesheet_1 = AncientEmpires.game.add.bitmapData(square_1 * tile_width, square_1 * tile_height);
            var _loop_1 = function(i) {
                var idx = i < 10 ? ("_0" + i) : ("_" + i);
                var png_buffer = AncientEmpires.game.cache.getBinary(name + idx + ".png");
                if (typeof variation != "undefined") {
                    png_buffer = PNGLoader.createVariation(png_buffer, variation);
                    spritesheet_name += "_" + variation;
                }
                var img = new Image();
                inner_waiter_1.add();
                img.onload = function () {
                    spritesheet_1.ctx.drawImage(img, (i % square_1) * tile_width, Math.floor(i / square_1) * tile_height);
                    inner_waiter_1.ret();
                };
                img.src = "data:image/png;base64," + PNGLoader.bufferToBase64(new Uint8Array(png_buffer));
            };
            for (var i = 0; i < number_of_tiles; i++) {
                _loop_1(i);
            }
            inner_waiter_1.await();
            AncientEmpires.game.cache.addSpriteSheet(spritesheet_name, null, spritesheet_1.canvas, tile_width, tile_height, number_of_tiles);
        }
    };
    PNGLoader.loadImage = function (waiter, name) {
        var png_buffer = AncientEmpires.game.cache.getBinary(name + ".png");
        var img = new Image();
        waiter.add();
        img.onload = function () {
            AncientEmpires.game.cache.addImage(name, null, img);
            waiter.ret();
        };
        img.src = "data:image/png;base64," + PNGLoader.bufferToBase64(new Uint8Array(png_buffer));
    };
    PNGLoader.createVariation = function (buffer, variation) {
        if (typeof variation == "undefined") {
            return buffer;
        }
        buffer = buffer.slice(0); // copy buffer (otherwise we modify original data, same as in cache)
        var data = new DataView(buffer);
        var index = 0;
        var start_plte = 0;
        for (; index < data.byteLength - 3; index++) {
            if (data.getUint8(index) != 80 || data.getUint8(index + 1) != 76 || data.getUint8(index + 2) != 84) {
                continue;
            }
            start_plte = index - 4;
            break;
        }
        index = start_plte;
        var length_plte = data.getUint32(index);
        index += 4;
        var crc = -1; // 32 bit
        for (var i = 0; i < 4; i++) {
            crc = PNGLoader.updatePNGCRC(data.getUint8(index + i), crc);
        }
        index += 4;
        for (var i = index; i < index + length_plte; i += 3) {
            var red = data.getUint8(i);
            var green = data.getUint8(i + 1);
            var blue = data.getUint8(i + 2);
            if (blue > red && blue > green) {
                // blue color
                if (variation == 2) {
                    // change to red color
                    var tmp = red;
                    red = blue;
                    blue = tmp;
                    green /= 2;
                }
                else if (variation == 0) {
                    // decolorize
                    red = blue;
                    green = blue;
                }
                data.setUint8(i, red);
                data.setUint8(i + 1, green);
                data.setUint8(i + 2, blue);
            }
            crc = PNGLoader.updatePNGCRC(data.getUint8(i), crc);
            crc = PNGLoader.updatePNGCRC(data.getUint8(i + 1), crc);
            crc = PNGLoader.updatePNGCRC(data.getUint8(i + 2), crc);
        }
        // update crc field
        crc ^= -1;
        var index_crc = start_plte + 8 + length_plte;
        data.setUint32(index_crc, crc);
        return buffer;
    };
    PNGLoader.updatePNGCRC = function (value, crc) {
        crc ^= value & 255; // bitwise or (without and)
        for (var j = 0; j < 8; j++) {
            if ((crc & 1) != 0) {
                crc = crc >>> 1 ^ -306674912;
                continue;
            }
            crc >>>= 1;
        }
        return crc;
    };
    return PNGLoader;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="vendor/phaser.d.ts" />
/// <reference path="ancientempires.ts" />
var MainMenu = (function (_super) {
    __extends(MainMenu, _super);
    function MainMenu() {
        _super.call(this);
    }
    MainMenu.prototype.create = function () {
        this.loadMap("s0");
    };
    MainMenu.prototype.loadMap = function (name) {
        this.game.state.start("Game", false, false, name);
    };
    return MainMenu;
}(Phaser.State));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameController = (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        _super.call(this);
        this.acc = 0;
    }
    GameController.prototype.init = function (name) {
        this.map = new Map(name);
        this.turn = Alliance.Blue;
        this.gold = [];
        if (name.charAt(0) == "s") {
            this.gold[0] = 1000;
            this.gold[1] = 1000;
        }
        else {
            this.gold[0] = 300;
            this.gold[1] = 300;
        }
        this.anim_cursor_state = 0;
        this.anim_cursor_slow = 0;
    };
    GameController.prototype.create = function () {
        var tilemap = this.game.add.tilemap();
        var tilemap_group = this.game.add.group();
        var smoke_group = this.game.add.group();
        var selection_group = this.game.add.group();
        var entity_group = this.game.add.group();
        var interaction_group = this.game.add.group();
        var cursor_group = this.game.add.group();
        this.frame_group = this.game.add.group();
        this.frame_group.fixedToCamera = true;
        this.tile_manager = new TileManager(this.map, tilemap, tilemap_group);
        this.smoke_manager = new SmokeManager(this.map, smoke_group);
        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group);
        this.cursor = new Sprite({ x: 0, y: 0 }, cursor_group, "cursor", [0, 1]);
        this.frame_manager = new FrameManager();
        this.tile_manager.draw();
        this.game.input.onDown.add(this.click, this);
        this.startTurn(Alliance.Red);
        this.frame_def_info = new MenuDefInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);
    };
    GameController.prototype.startTurn = function (alliance) {
        this.turn = alliance;
        if (!this.frame_gold_info) {
            this.frame_gold_info = new MenuGoldInfo(this.frame_group);
            this.frame_manager.addFrame(this.frame_gold_info);
        }
        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));
        this.frame_gold_info.show(true);
    };
    GameController.prototype.getGoldForAlliance = function (alliance) {
        switch (alliance) {
            case Alliance.Blue:
                return this.gold[0];
            case Alliance.Red:
                return this.gold[1];
        }
        return -1;
    };
    GameController.prototype.getActivePos = function () {
        // pos always inside canvas
        var x = Math.floor((this.game.input.activePointer.x + this.game.camera.x) / AncientEmpires.TILE_SIZE);
        var y = Math.floor((this.game.input.activePointer.y + this.game.camera.y) / AncientEmpires.TILE_SIZE);
        return new Pos(x, y);
    };
    GameController.prototype.click = function () {
        var position = this.getActivePos();
        var selected = this.entity_manager.selected;
        var entity = this.entity_manager.getEntityAt(position);
        if (!!entity) {
            // entity is there - deselect current
            this.entity_manager.deselectEntity();
        }
        else if (!!selected) {
            // no entity and selected entity
            this.entity_manager.moveSelectedEntity(position);
        }
        if (!!entity && entity != selected) {
            this.entity_manager.selectEntity(entity);
        }
    };
    GameController.prototype.update = function () {
        // 1 step is 1/60 sec
        this.acc += this.time.elapsed;
        var steps = Math.floor(this.acc / 16);
        if (steps <= 0) {
            return;
        }
        this.acc -= steps * 16;
        if (steps > 2) {
            steps = 2;
        }
        var mx = this.game.input.activePointer.x;
        var my = this.game.input.activePointer.y;
        if (mx < 50 && this.game.camera.x > 0) {
            var cx = this.game.camera.x - 2 * steps;
            if (cx < 0) {
                cx = 0;
            }
            this.game.camera.x = cx;
        }
        if (my < 50 && this.game.camera.y > 0) {
            var cy = this.game.camera.y - 2 * steps;
            if (cy < 0) {
                cy = 0;
            }
            this.game.camera.y = cy;
        }
        if (mx > this.game.width - 50 && this.game.camera.x + this.game.width < this.game.world.width) {
            var cx = this.game.camera.x + 2 * steps;
            if (cx > this.game.world.width - this.game.width) {
                cx = this.game.world.width - this.game.width;
            }
            this.game.camera.x = cx;
        }
        if (my > this.game.height - 50 && this.game.camera.y + this.game.height < this.game.world.height) {
            var cy = this.game.camera.y + 2 * steps;
            if (cy > this.game.world.height - this.game.height) {
                cy = this.game.world.height - this.game.height;
            }
            this.game.camera.y = cy;
        }
        var cursor_is_left = mx < this.game.width / 2;
        var info_is_right = (this.frame_gold_info.align & Direction.Right) != 0;
        if (cursor_is_left != info_is_right) {
            if (cursor_is_left) {
                this.frame_gold_info.updateDirections(Direction.Up | Direction.Right, Direction.Left | Direction.Down, Direction.Right, true);
                this.frame_def_info.updateDirections(Direction.Down | Direction.Right, Direction.Left | Direction.Up, Direction.Right, true);
            }
            else {
                this.frame_gold_info.updateDirections(Direction.Up | Direction.Left, Direction.Right | Direction.Down, Direction.Left, true);
                this.frame_def_info.updateDirections(Direction.Down | Direction.Left, Direction.Right | Direction.Up, Direction.Left, true);
            }
        }
        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }
        var cursor_position = this.getActivePos();
        if (!cursor_position.match(this.last_cursor_position) && cursor_position.x > -1) {
            this.last_cursor_position = cursor_position;
            this.cursor.setWorldPosition({ x: cursor_position.x * AncientEmpires.TILE_SIZE - 1, y: cursor_position.y * AncientEmpires.TILE_SIZE - 1 });
            // update def info
            var entity = this.entity_manager.getEntityAt(cursor_position);
            this.frame_def_info.updateContent(cursor_position, this.map, entity);
        }
        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);
        this.entity_manager.update(steps, cursor_position, this.anim_cursor_state);
        this.cursor.update(steps);
        this.frame_manager.update(steps);
    };
    return GameController;
}(Phaser.State));

var Tile;
(function (Tile) {
    Tile[Tile["Path"] = 0] = "Path";
    Tile[Tile["Grass"] = 1] = "Grass";
    Tile[Tile["Forest"] = 2] = "Forest";
    Tile[Tile["Hill"] = 3] = "Hill";
    Tile[Tile["Mountain"] = 4] = "Mountain";
    Tile[Tile["Water"] = 5] = "Water";
    Tile[Tile["Bridge"] = 6] = "Bridge";
    Tile[Tile["House"] = 7] = "House";
    Tile[Tile["Castle"] = 8] = "Castle";
})(Tile || (Tile = {}));
var Map = (function () {
    function Map(name) {
        this.name = name;
        this.load();
    }
    Map.getTileForCode = function (code) {
        return AncientEmpires.TILES_PROP[code];
    };
    Map.getCostForTile = function (tile, entity) {
        if (tile == Tile.Water && entity.type == EntityType.Lizard) {
            // Lizard on water
            return 1;
        }
        var cost = 0;
        if (tile == Tile.Mountain || tile == Tile.Water) {
            cost = 3;
        }
        else if (tile == Tile.Forest || tile == Tile.Hill) {
            cost = 2;
        }
        else {
            cost = 1;
        }
        if (entity.type == EntityType.Lizard) {
            // Lizard for everything except water
            return cost * 2;
        }
        return cost;
    };
    Map.getDefForTile = function (tile, entity) {
        if (tile == Tile.Mountain || tile == Tile.House || tile == Tile.Castle) {
            return 3;
        }
        if (tile == Tile.Forest || tile == Tile.Hill) {
            return 2;
        }
        if (tile == Tile.Water && entity && entity.type == EntityType.Lizard) {
            return 2;
        }
        if (tile == Tile.Grass) {
            return 1;
        }
        return 0;
    };
    Map.prototype.load = function () {
        if (!AncientEmpires.game.cache.checkBinaryKey(this.name)) {
            console.log("Could not find map: " + this.name);
            return false;
        }
        this.buildings = [];
        this.start_entities = [];
        this.tiles = [];
        var buffer = AncientEmpires.game.cache.getBinary(this.name);
        var data = new DataView(buffer);
        var index = 0;
        this.width = data.getUint32(index);
        index += 4;
        this.height = data.getUint32(index);
        index += 4;
        for (var x = 0; x < this.width; x++) {
            this.tiles[x] = [];
            for (var y = 0; y < this.height; y++) {
                var code = data.getUint8(index++);
                var tile = Map.getTileForCode(code);
                this.tiles[x][y] = tile;
                if (tile == Tile.House || tile == Tile.Castle) {
                    this.buildings.push({
                        castle: (tile == Tile.Castle),
                        position: new Pos(x, y),
                        alliance: Math.floor((code - AncientEmpires.NUMBER_OF_TILES) / 3)
                    });
                }
            }
        }
        var skip = data.getUint32(index);
        index += 4 + skip * 4;
        var number_of_entities = data.getUint32(index);
        index += 4;
        for (var i = 0; i < number_of_entities; i++) {
            var desc = data.getUint8(index++);
            var type = desc % 11;
            var alliance = Math.floor(desc / 11) + 1;
            var x = Math.floor(data.getUint16(index) / 16);
            index += 2;
            var y = Math.floor(data.getUint16(index) / 16);
            index += 2;
            this.start_entities.push({
                type: type,
                alliance: alliance,
                position: new Pos(x, y)
            });
        }
    };
    Map.prototype.getTileAt = function (position) {
        return this.tiles[position.x][position.y];
    };
    Map.prototype.getAdjacentTilesAt = function (position) {
        return [
            position.y > 0 ? this.getTileAt(new Pos(position.x, position.y - 1)) : -1,
            position.x < this.width - 1 ? this.getTileAt(new Pos(position.x + 1, position.y)) : -1,
            position.y < this.height - 1 ? this.getTileAt(new Pos(position.x, position.y + 1)) : -1,
            position.x > 0 ? this.getTileAt(new Pos(position.x - 1, position.y)) : -1
        ];
    };
    Map.prototype.getAdjacentPositionsAt = function (p) {
        var ret = [];
        // top, right, bottom, left
        if (p.y > 0) {
            ret.push(new Pos(p.x, p.y - 1));
        }
        if (p.x < this.width - 1) {
            ret.push(new Pos(p.x + 1, p.y));
        }
        if (p.y < this.height - 1) {
            ret.push(new Pos(p.x, p.y + 1));
        }
        if (p.x > 0) {
            ret.push(new Pos(p.x - 1, p.y));
        }
        return ret;
    };
    Map.prototype.getAllianceAt = function (position) {
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (building.position.match(position)) {
                return building.alliance;
            }
        }
        return Alliance.None;
    };
    Map.prototype.getOccupiedHouses = function () {
        var houses = [];
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (!building.castle && building.alliance != Alliance.None) {
                houses.push(building);
            }
        }
        return houses;
    };
    Map.prototype.getStartEntities = function () {
        return this.start_entities;
    };
    Map.prototype.getCostAt = function (position, entity) {
        return Map.getCostForTile(this.getTileAt(position), entity);
    };
    Map.prototype.getDefAt = function (position, entity) {
        return Map.getDefForTile(this.getTileAt(position), entity);
    };
    return Map;
}());

var Alliance;
(function (Alliance) {
    Alliance[Alliance["None"] = 0] = "None";
    Alliance[Alliance["Blue"] = 1] = "Blue";
    Alliance[Alliance["Red"] = 2] = "Red";
})(Alliance || (Alliance = {}));
var TileManager = (function () {
    function TileManager(map, tilemap, tilemap_group) {
        this.waterState = 0;
        this.waterTimer = 0;
        this.map = map;
        this.tilemap = tilemap;
        this.group = tilemap_group;
        this.tilemap.addTilesetImage("tiles0", null, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE, null, null, 0);
        this.tilemap.addTilesetImage("buildings_0", null, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE, null, null, AncientEmpires.NUMBER_OF_TILES);
        this.tilemap.addTilesetImage("buildings_1", null, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE, null, null, AncientEmpires.NUMBER_OF_TILES + 3);
        this.tilemap.addTilesetImage("buildings_2", null, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE, null, null, AncientEmpires.NUMBER_OF_TILES + 6);
        this.backgroundLayer = this.tilemap.create("background", this.map.width, this.map.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE, this.group);
        this.backgroundLayer.resizeWorld();
        this.buildingLayer = this.tilemap.createBlankLayer("building", this.map.width, this.map.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE, this.group);
    }
    TileManager.doesTileCutGrass = function (tile) {
        return (tile == Tile.Path || tile == Tile.Water || tile == Tile.Bridge);
    };
    TileManager.getImageIndexForObjectTile = function (tile) {
        if (tile == Tile.Mountain) {
            return 0;
        }
        if (tile == Tile.Forest) {
            return 1;
        }
        if (tile == Tile.Hill) {
            return 2;
        }
        if (tile == Tile.House) {
            return AncientEmpires.NUMBER_OF_TILES;
        }
        if (tile == Tile.Castle) {
            return AncientEmpires.NUMBER_OF_TILES + 1;
        }
        return -1;
    };
    TileManager.getBaseImageIndexForTile = function (tile) {
        switch (tile) {
            case Tile.Water:
                return 21;
            case Tile.Bridge:
                return 19;
            case Tile.Path:
                return 18;
            case Tile.Hill:
            case Tile.Forest:
            case Tile.Mountain:
            case Tile.House:
            case Tile.Castle:
                return TileManager.getImageIndexForObjectTile(tile);
        }
        return 3;
    };
    TileManager.prototype.draw = function () {
        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                this.drawTileAt(new Pos(x, y));
            }
        }
    };
    TileManager.prototype.update = function (steps) {
        this.waterTimer += steps;
        if (this.waterTimer > 30) {
            this.waterTimer = 0;
            this.updateWater();
        }
    };
    TileManager.prototype.updateWater = function () {
        var oldState = this.waterState;
        this.waterState = 1 - this.waterState;
        this.tilemap.replace(21 + oldState, 21 + this.waterState, 0, 0, this.map.width, this.map.height, this.backgroundLayer);
    };
    TileManager.prototype.drawTileAt = function (position) {
        this.tilemap.putTile(this.getImageIndexForBackgroundAt(position), position.x, position.y, this.backgroundLayer);
        var tile = this.map.getTileAt(position);
        var obj = TileManager.getImageIndexForObjectTile(tile);
        if (obj >= 0) {
            if (tile == Tile.House || tile == Tile.Castle) {
                var alliance = this.map.getAllianceAt(position);
                obj += alliance * 3;
                if (tile == Tile.Castle && position.y > 0) {
                    // roof of castle
                    this.tilemap.putTile(obj + 1, position.x, position.y - 1, this.buildingLayer);
                }
            }
            this.tilemap.putTile(obj, position.x, position.y, this.buildingLayer);
        }
    };
    TileManager.prototype.getImageIndexForBackgroundAt = function (position) {
        switch (this.map.getTileAt(position)) {
            case Tile.Water:
                // Water
                return 21;
            case Tile.Bridge:
                // Bridge
                var adj = this.map.getAdjacentTilesAt(position);
                if (adj[0] != Tile.Water || adj[2] != Tile.Water) {
                    return 20;
                }
                return 19;
            case Tile.Path:
                // Path
                return 18;
            case Tile.Grass:
            case Tile.Hill:
            case Tile.Forest:
            case Tile.Mountain:
            case Tile.House:
            case Tile.Castle:
                return this.getImageIndexForGrassAt(position);
        }
        return 2;
    };
    TileManager.prototype.getImageIndexForGrassAt = function (position) {
        var adj = this.map.getAdjacentTilesAt(position);
        var cut = 0;
        for (var i = 0; i < adj.length; i++) {
            cut += Math.pow(2, i) * (TileManager.doesTileCutGrass(adj[i]) ? 1 : 0);
        }
        if (cut == 8 + 4 + 2 + 1) {
            return 3;
        } // all - not supplied
        if (cut == 8 + 4 + 1) {
            return 16;
        } // top bottom left
        if (cut == 8 + 4 + 2) {
            return 10;
        } // right bottom left
        if (cut == 4 + 2 + 1) {
            return 17;
        } // top right bottom
        if (cut == 8 + 2 + 1) {
            return 14;
        } // top right left
        if (cut == 1 + 8) {
            return 12;
        } // top left
        if (cut == 4 + 8) {
            return 8;
        } // bottom left
        if (cut == 2 + 4) {
            return 9;
        } // right bottom
        if (cut == 1 + 2) {
            return 13;
        } // top right
        if (cut == 1 + 4) {
            return 15;
        } // top bottom
        if (cut == 2 + 8) {
            return 6;
        } // right left
        if (cut == 8) {
            return 4;
        } // left
        if (cut == 4) {
            return 7;
        } // bottom
        if (cut == 2) {
            return 5;
        } // right
        if (cut == 1) {
            return 11;
        } // top
        return 3;
    };
    return TileManager;
}());

var EntityManager = (function () {
    function EntityManager(map, entity_group, selection_group, interaction_group) {
        this.map = map;
        this.entity_group = entity_group;
        this.selection_group = selection_group;
        this.interaction_group = interaction_group;
        this.interaction_group.visible = false;
        this.selection_graphics = selection_group.game.add.graphics(0, 0, selection_group);
        this.interaction_graphics = interaction_group.game.add.graphics(0, 0, interaction_group);
        this.selected = null;
        this.moving = null;
        this.anim_idle_counter = 0;
        this.anim_idle_state = 0;
        this.entities = [];
        for (var _i = 0, _a = map.getStartEntities(); _i < _a.length; _i++) {
            var entity = _a[_i];
            this.createEntity(entity.type, entity.alliance, entity.position);
        }
    }
    EntityManager.prototype.createEntity = function (type, alliance, position) {
        this.entities.push(new Entity(type, alliance, position, this.entity_group));
    };
    EntityManager.prototype.getEntityAt = function (position) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.position.match(position)) {
                return entity;
            }
        }
        return null;
    };
    EntityManager.prototype.update = function (steps, cursor_position, anim_state) {
        if (anim_state != this.anim_idle_state) {
            this.anim_idle_state = anim_state;
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                entity.setFrame(this.anim_idle_state);
            }
        }
        if (!!this.selection) {
            this.animateSelectionLayer(steps);
            this.animateSelectionLine(steps, cursor_position);
        }
        if (!!this.moving) {
            this.animateMovingEntity(steps);
        }
    };
    EntityManager.prototype.selectEntity = function (entity) {
        if (!!this.selected) {
            this.deselectEntity();
        }
        this.selected = entity;
        this.showSelection();
        return true;
    };
    EntityManager.prototype.deselectEntity = function () {
        if (!this.selected) {
            return false;
        }
        this.hideSelection();
        this.selected = null;
        return true;
    };
    EntityManager.prototype.showSelection = function () {
        this.interaction_group.visible = true;
        if (!this.move_sprite) {
            this.move_sprite = new Sprite({ x: 0, y: 0 }, this.interaction_group, "cursor", [4]);
        }
        this.entity_group.remove(this.selected.sprite);
        this.interaction_group.add(this.selected.sprite);
        this.selection = new EntityRange(this.selected, this.map, this);
        this.anim_selection_progress = 100;
        this.anim_selection_inc = false;
        this.drawSelection();
        this.anim_selection_slow = 0;
        this.anim_selection_offset = 0;
        this.anim_selection_pos = null;
        this.anim_selection_line = null;
    };
    EntityManager.prototype.hideSelection = function () {
        this.interaction_group.remove(this.selected.sprite);
        this.entity_group.add(this.selected.sprite);
        this.interaction_graphics.clear();
        this.interaction_group.visible = false;
        this.selection = null;
        this.selection_graphics.clear();
    };
    EntityManager.prototype.drawSelection = function () {
        this.selection_graphics.beginFill(0xffffff);
        for (var _i = 0, _a = this.selection.waypoints; _i < _a.length; _i++) {
            var waypoint = _a[_i];
            var position = waypoint.position.getWorldPosition();
            if ((waypoint.form & Direction.Up) != 0) {
                this.selection_graphics.drawRect(position.x, position.y, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Right) != 0) {
                this.selection_graphics.drawRect(position.x + AncientEmpires.TILE_SIZE - 4, position.y, 4, AncientEmpires.TILE_SIZE);
            }
            if ((waypoint.form & Direction.Down) != 0) {
                this.selection_graphics.drawRect(position.x, position.y + AncientEmpires.TILE_SIZE - 4, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Left) != 0) {
                this.selection_graphics.drawRect(position.x, position.y, 4, AncientEmpires.TILE_SIZE);
            }
        }
        this.selection_graphics.endFill();
    };
    EntityManager.prototype.moveSelectedEntity = function (target) {
        if (!!this.getEntityAt(target)) {
            // entity at place
            return false;
        }
        var waypoint = this.selection.getWaypointAt(target);
        if (!waypoint) {
            // target not in range
            return false;
        }
        var line = EntityRange.getLineToWaypoint(waypoint);
        this.moving = {
            entity: this.selected,
            target: target,
            line: line,
            progress: 0
        };
        this.deselectEntity();
        return true;
    };
    EntityManager.prototype.animateMovingEntity = function (steps) {
        var move = this.moving;
        var entity = move.entity;
        move.progress += steps;
        if (move.progress >= move.line[0].length * AncientEmpires.TILE_SIZE) {
            move.progress -= move.line[0].length * AncientEmpires.TILE_SIZE;
            move.line.shift();
        }
        if (move.line.length > 0) {
            var diff = new Pos(0, 0).move(move.line[0].direction);
            entity.worldPosition.x = move.line[0].position.x * AncientEmpires.TILE_SIZE + diff.x * move.progress;
            entity.worldPosition.y = move.line[0].position.y * AncientEmpires.TILE_SIZE + diff.y * move.progress;
        }
        else {
            entity.position = move.target;
            entity.worldPosition = move.target.getWorldPosition();
            this.moving = null;
        }
        entity.update(steps);
    };
    EntityManager.prototype.animateSelectionLayer = function (steps) {
        var value = this.anim_selection_progress / 100 * 0xFF | 0;
        this.selection_graphics.tint = (value << 16) | (value << 8) | value;
        if (this.anim_selection_inc) {
            this.anim_selection_progress += steps;
            if (this.anim_selection_progress >= 100) {
                this.anim_selection_progress = 100;
                this.anim_selection_inc = false;
            }
        }
        else {
            this.anim_selection_progress -= steps;
            if (this.anim_selection_progress <= 40) {
                this.anim_selection_progress = 40;
                this.anim_selection_inc = true;
            }
        }
    };
    EntityManager.prototype.animateSelectionLine = function (steps, cursor_position) {
        if (!cursor_position.match(this.anim_selection_pos)) {
            this.anim_selection_pos = cursor_position;
            var waypoint = this.selection.getWaypointAt(cursor_position);
            if (!!waypoint) {
                // update line if a way to cursor position exists
                this.move_sprite.setWorldPosition({ x: (cursor_position.x * AncientEmpires.TILE_SIZE - 1), y: (cursor_position.y * AncientEmpires.TILE_SIZE - 1) });
                this.anim_selection_line = EntityRange.getLineToWaypoint(waypoint);
            }
        }
        if (!this.anim_selection_line) {
            return;
        }
        this.anim_selection_slow += steps;
        if (this.anim_selection_slow < 5) {
            return;
        }
        this.anim_selection_slow -= 5;
        this.interaction_graphics.clear();
        this.interaction_graphics.beginFill(0xffffff);
        for (var _i = 0, _a = this.anim_selection_line; _i < _a.length; _i++) {
            var part = _a[_i];
            this.addSegmentsForLinePart(part, this.anim_selection_offset);
            this.anim_selection_offset = (this.anim_selection_offset + part.length * AncientEmpires.TILE_SIZE) % (AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING);
        }
        this.interaction_graphics.endFill();
        this.anim_selection_offset -= 1;
        if (this.anim_selection_offset < 0) {
            this.anim_selection_offset = AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING - 1;
        }
    };
    EntityManager.prototype.addSegmentsForLinePart = function (part, offset) {
        var distance = part.length * AncientEmpires.TILE_SIZE;
        var x = (part.position.x + 0.5) * AncientEmpires.TILE_SIZE;
        var y = (part.position.y + 0.5) * AncientEmpires.TILE_SIZE;
        while (distance > 0) {
            var length_1 = AncientEmpires.LINE_SEGMENT_LENGTH;
            if (offset > 0) {
                length_1 -= offset;
                offset = 0;
            }
            if (distance < length_1) {
                length_1 = distance;
            }
            switch (part.direction) {
                case Direction.Up:
                    if (length_1 > 0) {
                        this.interaction_graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y - length_1, AncientEmpires.LINE_SEGMENT_WIDTH, length_1);
                    }
                    y -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Right:
                    if (length_1 > 0) {
                        this.interaction_graphics.drawRect(x, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length_1, AncientEmpires.LINE_SEGMENT_WIDTH);
                    }
                    x += length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Down:
                    if (length_1 > 0) {
                        this.interaction_graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y, AncientEmpires.LINE_SEGMENT_WIDTH, length_1);
                    }
                    y += length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Left:
                    if (length_1 > 0) {
                        this.interaction_graphics.drawRect(x - length_1, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length_1, AncientEmpires.LINE_SEGMENT_WIDTH);
                    }
                    x -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
            }
            distance -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
        }
    };
    return EntityManager;
}());

var EntityRange = (function () {
    function EntityRange(entity, map, entity_manager) {
        this.map = map;
        this.entity_manager = entity_manager;
        // cost for origin point is always 1
        var open = [{ position: entity.position, cost: 1, form: 0, parent: null }];
        var closed = [];
        while (open.length > 0) {
            var current = open.shift();
            closed.push(current);
            var adjacent_positions = this.map.getAdjacentPositionsAt(current.position);
            for (var _i = 0, adjacent_positions_1 = adjacent_positions; _i < adjacent_positions_1.length; _i++) {
                var position = adjacent_positions_1[_i];
                this.checkPosition(position, current, open, closed, entity);
            }
        }
        this.waypoints = closed;
        this.addForm();
        this.dirty = true;
    }
    EntityRange.findPositionInList = function (position, waypoints) {
        for (var _i = 0, waypoints_1 = waypoints; _i < waypoints_1.length; _i++) {
            var waypoint = waypoints_1[_i];
            if (waypoint.position.match(position)) {
                return waypoint;
            }
        }
        return null;
    };
    EntityRange.getLineToWaypoint = function (waypoint) {
        var line = [];
        while (waypoint.parent != null) {
            var next = waypoint;
            waypoint = waypoint.parent;
            var direction = waypoint.position.getDirectionTo(next.position);
            if (line.length > 0 && line[0].direction == direction) {
                line[0].position = waypoint.position;
                line[0].length++;
                continue;
            }
            line.unshift({ position: waypoint.position, direction: direction, length: 1 });
        }
        return line;
    };
    EntityRange.prototype.checkPosition = function (position, parent, open, closed, entity) {
        if (!!EntityRange.findPositionInList(position, closed)) {
            return false;
        }
        var occupied = this.entity_manager.getEntityAt(position);
        if (!!occupied && occupied.alliance != entity.alliance) {
            return false;
        }
        var new_cost = parent.cost + this.map.getCostAt(position, entity);
        if (new_cost > entity.data.mov) {
            return false;
        }
        var in_open = EntityRange.findPositionInList(position, open);
        if (!!in_open) {
            if (in_open.cost <= new_cost) {
                return false;
            }
            in_open.cost = new_cost;
            in_open.parent = parent;
            return true;
        }
        open.push({ position: position, parent: parent, form: 0, cost: new_cost });
        return true;
    };
    EntityRange.prototype.addForm = function () {
        for (var _i = 0, _a = this.waypoints; _i < _a.length; _i++) {
            var waypoint = _a[_i];
            waypoint.form = 0;
            if (waypoint.position.y > 0 && !this.getWaypointAt(waypoint.position.copy(Direction.Up))) {
                waypoint.form += 1;
            }
            if (waypoint.position.x < this.map.width - 1 && !this.getWaypointAt(waypoint.position.copy(Direction.Right))) {
                waypoint.form += 2;
            }
            if (waypoint.position.y < this.map.height - 1 && !this.getWaypointAt(waypoint.position.copy(Direction.Down))) {
                waypoint.form += 4;
            }
            if (waypoint.position.x > 0 && !this.getWaypointAt(waypoint.position.copy(Direction.Left))) {
                waypoint.form += 8;
            }
        }
    };
    EntityRange.prototype.getWaypointAt = function (position) {
        return EntityRange.findPositionInList(position, this.waypoints);
    };
    EntityRange.prototype.hasWaypointAt = function (position) {
        return this.getWaypointAt(position) != null;
    };
    EntityRange.prototype.update = function (steps, cursor_position) {
        this.offset += steps;
        this.progress += steps;
        if (this.hasWaypointAt(cursor_position) && (!this.endposition || !this.endposition.match(cursor_position))) {
            // cursor position changed and cursor is inside waypoints
            this.endposition = cursor_position;
            var endpoint = this.getWaypointAt(cursor_position);
            this.line = EntityRange.getLineToWaypoint(endpoint);
        }
        if (this.dirty) {
            // draw layer for the first time
            this.dirty = false;
            console.log("Draw Layer");
            EntityRange.graphics_layer.clear();
        }
    };
    return EntityRange;
}());

var SmokeManager = (function () {
    function SmokeManager(map, group) {
        this.map = map;
        this.group = group;
        this.anim_slow = 0;
        this.anim_state = 0;
        this.anim_offset = 0;
        this.smoke = [];
        for (var _i = 0, _a = map.getOccupiedHouses(); _i < _a.length; _i++) {
            var house = _a[_i];
            this.createSmoke(house.position);
        }
        this.createSmoke(new Pos(3, 13));
    }
    SmokeManager.prototype.createSmoke = function (position) {
        this.smoke.push(new Smoke(position, this.group, "b_smoke", [0, 1, 2, 3]));
    };
    SmokeManager.prototype.update = function (steps) {
        this.anim_slow += steps;
        if (this.anim_slow < 5) {
            return;
        }
        this.anim_slow = 0;
        this.anim_offset++;
        if (this.anim_offset > 27) {
            this.anim_state = 0;
            this.anim_offset = 0;
            this.group.visible = true;
        }
        else if (this.anim_offset > 22 && this.anim_state == 3) {
            this.anim_state = 4;
            this.group.visible = false;
        }
        else if (this.anim_offset > 17 && this.anim_state == 2) {
            this.anim_state = 3;
        }
        else if (this.anim_offset > 12 && this.anim_state == 1) {
            this.anim_state = 2;
        }
        else if (this.anim_offset > 7 && this.anim_state == 0) {
            this.anim_state = 1;
        }
        for (var _i = 0, _a = this.smoke; _i < _a.length; _i++) {
            var smoke = _a[_i];
            smoke.setFrame(this.anim_state);
            smoke.worldPosition.y = smoke.position.y * AncientEmpires.TILE_SIZE - this.anim_offset - 2;
            smoke.update();
        }
    };
    return SmokeManager;
}());

var Sprite = (function () {
    function Sprite(world_position, group, name, frames) {
        if (frames === void 0) { frames = []; }
        this.worldPosition = world_position;
        this.name = name;
        this.frames = frames;
        this.sprite = group.game.add.sprite(this.worldPosition.x, this.worldPosition.y, this.name);
        this.sprite.frame = this.frames[0];
        group.add(this.sprite);
    }
    Sprite.prototype.setFrame = function (frame) {
        this.sprite.frame = this.frames[frame % this.frames.length];
    };
    Sprite.prototype.setWorldPosition = function (world_position) {
        this.worldPosition = world_position;
        this.update();
    };
    Sprite.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        this.sprite.x = this.worldPosition.x;
        this.sprite.y = this.worldPosition.y;
    };
    Sprite.prototype.destroy = function () {
        this.sprite.destroy();
    };
    return Sprite;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Smoke = (function (_super) {
    __extends(Smoke, _super);
    function Smoke(position, group, name, frames) {
        _super.call(this, new Pos(position.x * AncientEmpires.TILE_SIZE + 16, position.y * AncientEmpires.TILE_SIZE), group, name, frames);
        this.position = position;
    }
    return Smoke;
}(Sprite));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EntityFlags;
(function (EntityFlags) {
    EntityFlags[EntityFlags["None"] = 0] = "None";
    EntityFlags[EntityFlags["Flying"] = 1] = "Flying";
    EntityFlags[EntityFlags["WaterBoost"] = 2] = "WaterBoost";
    EntityFlags[EntityFlags["CanBuy"] = 4] = "CanBuy";
    EntityFlags[EntityFlags["CanOccupyHouse"] = 8] = "CanOccupyHouse";
    EntityFlags[EntityFlags["CanOccupyCastle"] = 16] = "CanOccupyCastle";
    EntityFlags[EntityFlags["CanRaise"] = 32] = "CanRaise";
    EntityFlags[EntityFlags["AntiFlying"] = 64] = "AntiFlying";
    EntityFlags[EntityFlags["CanPoison"] = 128] = "CanPoison";
    EntityFlags[EntityFlags["CanWisp"] = 256] = "CanWisp";
    EntityFlags[EntityFlags["CantAttackAfterMoving"] = 512] = "CantAttackAfterMoving";
})(EntityFlags || (EntityFlags = {}));
var EntityType;
(function (EntityType) {
    EntityType[EntityType["Soldier"] = 0] = "Soldier";
    EntityType[EntityType["Archer"] = 1] = "Archer";
    EntityType[EntityType["Lizard"] = 2] = "Lizard";
    EntityType[EntityType["Wizard"] = 3] = "Wizard";
    EntityType[EntityType["Wisp"] = 4] = "Wisp";
    EntityType[EntityType["Spider"] = 5] = "Spider";
    EntityType[EntityType["Golem"] = 6] = "Golem";
    EntityType[EntityType["Catapult"] = 7] = "Catapult";
    EntityType[EntityType["Wyvern"] = 8] = "Wyvern";
    EntityType[EntityType["King"] = 9] = "King";
    EntityType[EntityType["Skeleton"] = 10] = "Skeleton";
})(EntityType || (EntityType = {}));
var EntityStatus;
(function (EntityStatus) {
    EntityStatus[EntityStatus["None"] = 0] = "None";
    EntityStatus[EntityStatus["Poisoned"] = 1] = "Poisoned";
    EntityStatus[EntityStatus["Wisped"] = 2] = "Wisped";
})(EntityStatus || (EntityStatus = {}));
var EntityState;
(function (EntityState) {
    EntityState[EntityState["Ready"] = 0] = "Ready";
    EntityState[EntityState["Moved"] = 1] = "Moved";
    EntityState[EntityState["Dead"] = 2] = "Dead";
})(EntityState || (EntityState = {}));
var Entity = (function (_super) {
    __extends(Entity, _super);
    function Entity(type, alliance, position, group) {
        _super.call(this, position.getWorldPosition(), group, "unit_icons_" + alliance, [type, type + AncientEmpires.ENTITIES.length]);
        this.atk_boost = 0;
        this.def_boost = 0;
        this.mov_boost = 0;
        this.data = AncientEmpires.ENTITIES[type];
        this.alliance = alliance;
        this.type = type;
        this.position = position;
        this.health = 10;
        this.rank = 0;
        this.ep = 0;
        this.status = 0;
        this.state = EntityState.Ready;
    }
    Entity.prototype.didRankUp = function () {
        if (this.rank < 3 && this.ep >= 75 << this.rank) {
            this.ep = 0;
            this.rank++;
            return true;
        }
        return false;
    };
    Entity.prototype.attack = function (target, map) {
        var n;
        // get base damage
        var atk = this.data.atk + this.atk_boost;
        if (this.type == EntityType.Archer && target.type == EntityType.Wyvern) {
            atk += 2;
        }
        if (this.type == EntityType.Wisp && target.type == EntityType.Skeleton) {
            atk += 3;
        }
        n = Math.floor(Math.random() * 20) + this.rank;
        if (n > 19) {
            atk += 2;
        }
        else if (n >= 17) {
            atk += 1;
        }
        else if (n <= -19) {
            atk -= 2;
        }
        else if (n <= -17) {
            atk -= 1;
        }
        var def = target.data.def + target.def_boost;
        n = Math.floor(Math.random() * 20) + target.rank;
        if (n > 19) {
            def += 2;
        }
        else if (n >= 17) {
            def += 1;
        }
        else if (n <= -19) {
            def -= 2;
        }
        else if (n <= -17) {
            def -= 1;
        }
        var red_health = Math.floor((atk - (def + map.getDefAt(target.position, target)) * (2 / 3)) * this.health / 10);
        if (red_health > target.health) {
            red_health = target.health;
        }
        target.health = target.health - red_health;
        this.ep += (target.data.atk + target.data.def) * red_health;
    };
    Entity.prototype.updateStatus = function () {
        this.atk_boost = 0;
        this.def_boost = 0;
        this.mov_boost = 0;
        if (this.status & EntityStatus.Poisoned) {
            this.atk_boost--;
            this.def_boost--;
            this.mov_boost--;
        }
        if (this.status & EntityStatus.Wisped) {
            this.atk_boost++;
        }
    };
    Entity.prototype.setStatus = function (status) {
        this.status |= status;
        this.updateStatus();
    };
    Entity.prototype.clearStatus = function (status) {
        this.status &= ~status;
        this.updateStatus();
    };
    Entity.prototype.getInfo = function () {
        return this.data.name + ", alliance " + this.alliance + ": " + this.position.x + " - " + this.position.y;
    };
    return Entity;
}(Sprite));

var FrameAnimation;
(function (FrameAnimation) {
    FrameAnimation[FrameAnimation["None"] = 0] = "None";
    FrameAnimation[FrameAnimation["Show"] = 1] = "Show";
    FrameAnimation[FrameAnimation["Hide"] = 2] = "Hide";
    FrameAnimation[FrameAnimation["Change"] = 4] = "Change";
    FrameAnimation[FrameAnimation["Wire"] = 8] = "Wire";
    FrameAnimation[FrameAnimation["Destroy"] = 16] = "Destroy";
    FrameAnimation[FrameAnimation["Update"] = 32] = "Update";
})(FrameAnimation || (FrameAnimation = {}));
var Frame = (function () {
    function Frame() {
        this.reuse_tiles = [];
    }
    Frame.getRect = function (x, y, width, height) {
        return { x: x, y: y, width: width, height: height };
    };
    Frame.copyRect = function (fr) {
        return { x: fr.x, y: fr.y, width: fr.width, height: fr.height };
    };
    Frame.getTileForDirection = function (direction) {
        switch (direction) {
            case Direction.Up:
                return 4;
            case Direction.Up | Direction.Right:
                return 1;
            case Direction.Right:
                return 7;
            case Direction.Right | Direction.Down:
                return 3;
            case Direction.Down:
                return 5;
            case Direction.Down | Direction.Left:
                return 2;
            case Direction.Left:
                return 6;
        }
        return 0;
    };
    Frame.prototype.initialize = function (width, height, group, align, border, anim_dir) {
        this.align = align;
        this.animation_direction = typeof anim_dir != "undefined" ? anim_dir : align;
        this.border = border;
        this.group = group;
        this.content_group = this.group.game.add.group();
        this.group.add(this.content_group);
        this.content_group.visible = false;
        this.graphics = this.group.game.add.graphics(0, 0, this.content_group);
        this.border_group = this.group.game.add.group();
        this.group.add(this.border_group);
        this.border_group.visible = false;
        this.game_width = this.group.game.width;
        this.game_height = this.group.game.height;
        this.width = width;
        this.height = height;
        this.animation = FrameAnimation.None;
        this.current = this.getRetractedRect();
    };
    Frame.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        this.animation = FrameAnimation.None;
        this.target = this.getAlignmentRect();
        if (animate) {
            // calculate starting offset using the anim_direction
            this.animation = FrameAnimation.Show;
            if (this.animation_direction == Direction.None) {
                this.animation |= FrameAnimation.Wire;
            }
            this.calculateSpeed();
        }
        else {
            this.current = Frame.copyRect(this.target);
        }
        this.updateOffset();
        this.border_group.visible = true;
        if ((this.animation & FrameAnimation.Wire) != 0) {
            this.removeFrame();
            this.content_group.visible = false;
        }
        else {
            this.drawFrame(this.width, this.height);
            this.content_group.visible = true;
        }
    };
    Frame.prototype.hide = function (animate, destroy_on_finish, update_on_finish) {
        if (animate === void 0) { animate = false; }
        if (destroy_on_finish === void 0) { destroy_on_finish = false; }
        if (update_on_finish === void 0) { update_on_finish = false; }
        this.animation = FrameAnimation.None;
        this.target = this.getRetractedRect();
        if (!animate) {
            this.current = Frame.copyRect(this.target);
            this.border_group.visible = false;
            this.content_group.visible = false;
            this.removeTiles();
            this.updateOffset();
            if (destroy_on_finish) {
                this.destroy();
            }
            return;
        }
        this.animation = FrameAnimation.Hide;
        if (destroy_on_finish) {
            this.animation |= FrameAnimation.Destroy;
        }
        if (update_on_finish) {
            this.animation |= FrameAnimation.Update;
        }
        if (this.animation_direction == Direction.None) {
            this.animation |= FrameAnimation.Wire;
            this.removeFrame();
        }
        this.calculateSpeed();
    };
    Frame.prototype.updateSize = function (width, height, animate) {
        if (animate === void 0) { animate = false; }
        if (this.width == width && this.height == height) {
            return;
        }
        if ((this.animation & FrameAnimation.Update) != 0) {
            this.width = width;
            this.height = height;
            return;
        }
        this.animation = FrameAnimation.None;
        if (!animate) {
            this.width = width;
            this.height = height;
            this.target = this.getAlignmentRect();
            this.current = Frame.copyRect(this.target);
            this.updateOffset();
            this.drawFrame(width, height);
            return;
        }
        var old_width = this.width;
        var old_height = this.height;
        this.width = width;
        this.height = height;
        this.animation = FrameAnimation.Change;
        if (this.animation_direction == Direction.None) {
            this.animation |= FrameAnimation.Wire;
        }
        else {
            // take the biggest rect possible
            width = Math.max(width, old_width);
            height = Math.max(height, old_height);
            this.current.width = width;
            this.current.height = height;
        }
        this.target = this.getAlignmentRect();
        // this.current is the old rect (offset & size)
        // update this.current so the same portion of the frame is rendered, although it changed in size
        // change target to alignment position for changed rect
        if ((this.align & Direction.Left) != 0) {
            this.current.x -= width - old_width;
            this.target.x -= width - this.width;
        }
        if ((this.align & Direction.Up) != 0) {
            this.current.y -= height - old_height;
            this.target.y -= height - this.height;
        }
        this.updateOffset();
        if ((this.animation & FrameAnimation.Wire) != 0) {
            this.removeFrame();
        }
        else {
            this.drawFrame(width, height);
        }
        this.calculateSpeed();
    };
    Frame.prototype.updateDirections = function (align, border, anim_direction, animate) {
        if (animate === void 0) { animate = false; }
        if (this.new_align === align && this.new_border == border && this.new_animation_direction == anim_direction && this.new_animate == animate) {
            return;
        }
        this.new_align = align;
        this.new_border = border;
        this.new_animation_direction = anim_direction;
        this.new_animate = animate;
        this.hide(true, false, true);
    };
    Frame.prototype.update = function (steps) {
        if (this.animation == FrameAnimation.None) {
            return;
        }
        var finished_x = this.addGain("x", steps);
        var finished_y = this.addGain("y", steps);
        var finished_width = true;
        var finished_height = true;
        if ((this.animation & FrameAnimation.Wire) != 0) {
            // only change size with the wire animation
            finished_width = this.addGain("width", steps);
            finished_height = this.addGain("height", steps);
        }
        if (finished_x && finished_y && finished_width && finished_height) {
            if ((this.animation & FrameAnimation.Wire) != 0) {
                this.graphics.clear();
                if ((this.animation & FrameAnimation.Hide) == 0) {
                    this.drawFrame(this.width, this.height);
                    this.content_group.visible = true;
                }
            }
            if ((this.animation & FrameAnimation.Change) != 0) {
                // update current offset and remove tiles out of sight
                this.target.width = this.width;
                this.target.height = this.height;
                if ((this.align & Direction.Left) != 0) {
                    this.target.x = 0;
                }
                if ((this.align & Direction.Up) != 0) {
                    this.target.y = 0;
                }
                this.current = Frame.copyRect(this.target);
                this.updateOffset();
                this.drawFrame(this.width, this.height);
            }
            if ((this.animation & FrameAnimation.Hide) != 0) {
                if ((this.animation & FrameAnimation.Destroy) != 0) {
                    this.destroy();
                    return;
                }
                if ((this.animation & FrameAnimation.Update) != 0) {
                    this.applyDirections();
                    return;
                }
                this.hide();
            }
            this.animation = FrameAnimation.None;
        }
        if ((this.animation & FrameAnimation.Wire) != 0) {
            // nice animation for frame with no alignment & no animation direction
            this.graphics.clear();
            this.graphics.lineStyle(1, 0xffffff);
            this.graphics.drawRect(0, 0, this.current.width, this.current.height);
        }
        this.updateOffset();
    };
    Frame.prototype.destroy = function () {
        this.border_group.destroy(true);
        this.content_group.destroy(true);
    };
    Frame.prototype.applyDirections = function () {
        this.align = this.new_align;
        this.border = this.new_border;
        this.animation_direction = this.new_animation_direction;
        this.current = this.getRetractedRect();
        this.show(this.new_animate);
    };
    Frame.prototype.getAlignmentRect = function () {
        // calculate the offset using the alignment
        var rect = Frame.getRect(0, 0, this.width, this.height);
        if ((this.align & Direction.Left) != 0) {
            rect.x = 0;
        }
        else if ((this.align & Direction.Right) != 0) {
            rect.x = this.game_width - this.width;
        }
        else {
            rect.x = Math.floor((this.game_width - this.width) / 2);
        }
        if ((this.align & Direction.Up) != 0) {
            rect.y = 0;
        }
        else if ((this.align & Direction.Down) != 0) {
            rect.y = this.game_height - this.height;
        }
        else {
            rect.y = Math.floor((this.game_height - this.height) / 2);
        }
        return rect;
    };
    Frame.prototype.getRetractedRect = function () {
        if (this.animation_direction == Direction.None) {
            return Frame.getRect(Math.floor(this.game_width / 2), Math.floor(this.game_height / 2), 0, 0);
        }
        var rect = this.getAlignmentRect();
        if ((this.animation_direction & Direction.Left) != 0) {
            rect.x = -this.width;
        }
        if ((this.animation_direction & Direction.Right) != 0) {
            rect.x = this.game_width;
        }
        if ((this.animation_direction & Direction.Up) != 0) {
            rect.y = -this.height;
        }
        if ((this.animation_direction & Direction.Down) != 0) {
            rect.y = this.game_height;
        }
        return rect;
    };
    Frame.prototype.updateOffset = function () {
        var x = this.current.x;
        var y = this.current.y;
        var c_x = 0;
        var c_y = 0;
        if ((this.border & Direction.Left) != 0) {
            c_x = 6;
        }
        if ((this.border & Direction.Up) != 0) {
            c_y = 6;
        }
        this.border_group.x = x;
        this.border_group.y = y;
        this.content_group.x = x + c_x;
        this.content_group.y = y + c_y;
    };
    Frame.prototype.drawFrame = function (width, height) {
        var c_width = width;
        var c_height = height;
        if ((this.border & Direction.Left) != 0) {
            c_width -= 6;
        }
        if ((this.border & Direction.Right) != 0) {
            c_width -= 6;
        }
        if ((this.border & Direction.Up) != 0) {
            c_height -= 6;
        }
        if ((this.border & Direction.Down) != 0) {
            c_height -= 6;
        }
        // this.content_group.width = c_width;
        // this.content_group.height = c_height;
        var show_tiles_x = Math.ceil(width / Frame.BORDER_SIZE) - 2;
        var show_tiles_y = Math.ceil(height / Frame.BORDER_SIZE) - 2;
        this.graphics.clear();
        this.graphics.lineStyle(0);
        this.graphics.beginFill(0xcebea5);
        this.graphics.drawRect(0, 0, width, height);
        this.graphics.endFill();
        var tiles = [];
        var offset_x = Frame.BORDER_SIZE;
        for (var i = 0; i < show_tiles_x; i++) {
            if (this.border & Direction.Up) {
                tiles.push(this.drawBorderTile(offset_x, 0, Direction.Up));
            }
            if (this.border & Direction.Down) {
                tiles.push(this.drawBorderTile(offset_x, height - Frame.BORDER_SIZE, Direction.Down));
            }
            offset_x += Frame.BORDER_SIZE;
        }
        var offset_y = Frame.BORDER_SIZE;
        for (var j = 0; j < show_tiles_y; j++) {
            if (this.border & Direction.Left) {
                tiles.push(this.drawBorderTile(0, offset_y, Direction.Left));
            }
            if (this.border & Direction.Right) {
                tiles.push(this.drawBorderTile(width - Frame.BORDER_SIZE, offset_y, Direction.Right));
            }
            offset_y += Frame.BORDER_SIZE;
        }
        if ((this.border & (Direction.Up | Direction.Left)) != 0) {
            tiles.push(this.drawBorderTile(0, 0, this.border & (Direction.Up | Direction.Left)));
        }
        if ((this.border & (Direction.Up | Direction.Right)) != 0) {
            tiles.push(this.drawBorderTile(width - Frame.BORDER_SIZE, 0, this.border & (Direction.Up | Direction.Right)));
        }
        if ((this.border & (Direction.Down | Direction.Left)) != 0) {
            tiles.push(this.drawBorderTile(0, height - Frame.BORDER_SIZE, this.border & (Direction.Down | Direction.Left)));
        }
        if ((this.border & (Direction.Down | Direction.Right)) != 0) {
            tiles.push(this.drawBorderTile(width - Frame.BORDER_SIZE, height - Frame.BORDER_SIZE, this.border & (Direction.Down | Direction.Right)));
        }
        this.removeTiles();
        this.reuse_tiles = tiles;
    };
    Frame.prototype.removeFrame = function () {
        this.graphics.clear();
        this.removeTiles();
    };
    Frame.prototype.drawBorderTile = function (x, y, direction) {
        var reuse;
        if (this.reuse_tiles.length > 0) {
            reuse = this.reuse_tiles.shift();
            reuse.bringToTop();
            reuse.x = x;
            reuse.y = y;
        }
        else {
            reuse = this.group.game.add.image(x, y, "menu", null, this.border_group);
        }
        reuse.frame = Frame.getTileForDirection(direction);
        return reuse;
    };
    Frame.prototype.addGain = function (var_name, steps) {
        if (this.speed[var_name] == 0) {
            return true;
        }
        this.acc[var_name] += this.speed[var_name] * steps;
        var d = Math.floor(this.acc[var_name]);
        this.current[var_name] += d;
        this.acc[var_name] -= d;
        if (d < 0 && this.current[var_name] < this.target[var_name]) {
            this.current[var_name] = this.target[var_name];
            return true;
        }
        else if (d > 0 && this.current[var_name] > this.target[var_name]) {
            this.current[var_name] = this.target[var_name];
            return true;
        }
        return false;
    };
    Frame.prototype.calculateSpeed = function () {
        this.speed = Frame.getRect((this.target.x - this.current.x) / Frame.ANIM_STEPS, (this.target.y - this.current.y) / Frame.ANIM_STEPS, (this.target.width - this.current.width) / Frame.ANIM_STEPS, (this.target.height - this.current.height) / Frame.ANIM_STEPS);
        this.acc = Frame.getRect(0, 0, 0, 0);
    };
    Frame.prototype.removeTiles = function () {
        while (this.reuse_tiles.length > 0) {
            var tile = this.reuse_tiles.shift();
            tile.destroy();
        }
    };
    Frame.BORDER_SIZE = 24;
    Frame.ANIM_STEPS = 15;
    return Frame;
}());

/// <reference path="vendor/phaser.d.ts" />
/// <reference path="util.ts" />
/// <reference path="loader.ts" />
/// <reference path="pngloader.ts" />
/// <reference path="mainmenu.ts" />
/// <reference path="gamecontroller.ts" />
/// <reference path="map.ts" />
/// <reference path="tilemanager.ts" />
/// <reference path="entitymanager.ts" />
/// <reference path="entityrange.ts" />
/// <reference path="smokemanager.ts" />
/// <reference path="sprite.ts" />
/// <reference path="smoke.ts" />
/// <reference path="entity.ts" />
/// <reference path="frame.ts" />
/// <reference path="aefont.ts" />
var AncientEmpires = (function () {
    function AncientEmpires(div_id) {
        this.width = 176;
        this.height = 204;
        AncientEmpires.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, div_id, this);
        this.loader = new Loader();
        this.mainMenu = new MainMenu();
        this.controller = new GameController();
        AncientEmpires.game.state.add("Loader", this.loader);
        AncientEmpires.game.state.add("MainMenu", this.mainMenu);
        AncientEmpires.game.state.add("Game", this.controller);
        AncientEmpires.game.state.start("Loader");
    }
    AncientEmpires.TILE_SIZE = 24;
    AncientEmpires.LINE_SEGMENT_LENGTH = 10;
    AncientEmpires.LINE_SEGMENT_WIDTH = 4;
    AncientEmpires.LINE_SEGMENT_SPACING = 2;
    AncientEmpires.NUMBER_OF_TILES = 23;
    return AncientEmpires;
}());

var FrameManager = (function () {
    function FrameManager() {
        this.frames = [];
    }
    FrameManager.prototype.addFrame = function (frame) {
        this.frames.push(frame);
    };
    FrameManager.prototype.removeFrame = function (frame) {
        for (var i = 0; i < this.frames.length; i++) {
            if (frame == this.frames[i]) {
                frame.destroy();
                this.frames.splice(i);
                break;
            }
        }
    };
    FrameManager.prototype.update = function (steps) {
        for (var _i = 0, _a = this.frames; _i < _a.length; _i++) {
            var frame = _a[_i];
            frame.update(steps);
        }
    };
    return FrameManager;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MenuGoldInfo = (function (_super) {
    __extends(MenuGoldInfo, _super);
    function MenuGoldInfo(group) {
        _super.call(this);
        this.initialize(64, 40, group, Direction.Up | Direction.Right, Direction.Down | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    MenuGoldInfo.prototype.updateContent = function (alliance, gold) {
        // update information inside menu
        var color;
        var frame;
        var x;
        if (alliance == Alliance.Blue) {
            color = 0x0000ff;
            frame = 0;
            x = 0;
        }
        else {
            color = 0xff0000;
            frame = 1;
            x = 25;
        }
        this.head_graphics.clear();
        this.head_graphics.beginFill(color);
        this.head_graphics.drawRect(0, 17, this.width, 17);
        this.head_graphics.endFill();
        this.head_icon.frame = frame;
        this.head_icon.x = x;
        this.gold_amount.setText(gold.toString());
    };
    MenuGoldInfo.prototype.drawContent = function () {
        // initialize content (sprites, text etc)
        this.head_graphics = this.group.game.add.graphics(0, 0, this.content_group);
        this.group.game.add.image(2, 2, "gold", null, this.content_group);
        this.head_icon = this.group.game.add.image(0, 16, "portrait", 0, this.content_group);
        var head_crop = new Phaser.Rectangle(0, 10, this.head_icon.width, 18);
        this.head_icon.crop(head_crop);
        this.gold_amount = new AEFont(28, 5, this.content_group);
    };
    return MenuGoldInfo;
}(Frame));
var MenuDefInfo = (function (_super) {
    __extends(MenuDefInfo, _super);
    function MenuDefInfo(group) {
        _super.call(this);
        this.initialize(40, 52, group, Direction.Down | Direction.Right, Direction.Up | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    MenuDefInfo.prototype.updateContent = function (position, map, entity) {
        // update information inside menu
        var tile = map.getTileAt(position);
        if (tile == Tile.House || tile == Tile.Castle) {
            var alliance = map.getAllianceAt(position);
            if (this.tile_icon.key != "buildings_" + alliance) {
                this.tile_icon.loadTexture("buildings_" + alliance);
            }
            this.tile_icon.frame = tile == Tile.House ? 0 : 1;
        }
        else {
            if (this.tile_icon.key != "tiles0") {
                this.tile_icon.loadTexture("tiles0");
            }
            this.tile_icon.frame = TileManager.getBaseImageIndexForTile(tile);
        }
        this.def_amount.setText(Map.getDefForTile(tile, entity).toString());
        if (!!entity) {
            this.updateSize(68, 52);
            if (this.entity_icon.key != "unit_icons_" + entity.alliance) {
                this.entity_icon.loadTexture("unit_icons_" + entity.alliance);
            }
            this.entity_icon.frame = entity.type;
            this.entity_icon.visible = true;
        }
        else {
            this.updateSize(40, 52);
            this.entity_icon.visible = false;
        }
    };
    MenuDefInfo.prototype.drawContent = function () {
        // initialize content (sprites, text etc)
        var tile_graphics = this.group.game.add.graphics(0, 0, this.content_group);
        tile_graphics.lineStyle(1, 0x000000);
        tile_graphics.drawRect(6, 2, AncientEmpires.TILE_SIZE - 1, AncientEmpires.TILE_SIZE - 1);
        this.tile_icon = this.group.game.add.image(7, 3, "tiles0", null, this.content_group);
        var tile_crop = new Phaser.Rectangle(1, 1, AncientEmpires.TILE_SIZE - 2, AncientEmpires.TILE_SIZE - 2);
        this.tile_icon.crop(tile_crop);
        var def_font = new AEFont(7, 28, this.content_group);
        def_font.setText("DEF");
        this.def_amount = new AEFont(14, 37, this.content_group);
        this.entity_icon = this.group.game.add.image(35, 2, "unit_icons_1", null, this.content_group);
        this.entity_icon.visible = false;
    };
    return MenuDefInfo;
}(Frame));
var MenuShopUnits = (function (_super) {
    __extends(MenuShopUnits, _super);
    function MenuShopUnits(group) {
        _super.call(this);
        this.initialize(64, group.game.height - 40, group, Direction.Right | Direction.Down, Direction.Up | Direction.Down | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    MenuShopUnits.prototype.updateContent = function (alliance) {
        for (var _i = 0, _a = this.entity_images; _i < _a.length; _i++) {
            var image = _a[_i];
            image.loadTexture("unit_icons_" + alliance, image.frame);
        }
    };
    MenuShopUnits.prototype.drawContent = function () {
        this.entity_images = [];
        for (var i = 0; i < AncientEmpires.ENTITIES.length; i++) {
            var data = AncientEmpires.ENTITIES[i];
            if (data.cost > 1000) {
                continue;
            }
            var x = (i % 2) * 27 + 3;
            var y = Math.floor(i / 2) * 29 + 5;
            var image = this.group.game.add.image(x, y, "unit_icons_0", i, this.content_group);
            this.entity_images.push(image);
        }
    };
    return MenuShopUnits;
}(Frame));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsInV0aWwudHMiLCJsb2FkZXIudHMiLCJwbmdsb2FkZXIudHMiLCJtYWlubWVudS50cyIsImdhbWVjb250cm9sbGVyLnRzIiwibWFwLnRzIiwidGlsZW1hbmFnZXIudHMiLCJlbnRpdHltYW5hZ2VyLnRzIiwiZW50aXR5cmFuZ2UudHMiLCJzbW9rZW1hbmFnZXIudHMiLCJzcHJpdGUudHMiLCJzbW9rZS50cyIsImVudGl0eS50cyIsImZyYW1lLnRzIiwiYW5jaWVudGVtcGlyZXMudHMiLCJmcmFtZW1hbmFnZXIudHMiLCJtZW51LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBc0JJLGdCQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBbUIsRUFBRSxJQUFhO1FBQ2hFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUF2Qk0sbUJBQVksR0FBbkIsVUFBb0IsSUFBWTtRQUM1QixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDMUIsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FB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NUIsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDNUYsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDeEMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUFDLENBQUM7WUFDbkcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvRixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN4QyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUks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QUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pGLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLE1BQU0sR0FBRyxLQUFLLENBQUMs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QUFDO1lBQ25GLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLENBQUM7SUFDTCxDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQWpDQSxBQWlDQyxDQWpDMkIsS0FBSyxHQWlDaEMiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIEFFRm9udCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB0ZXh0OiBzdHJpbmc7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgbGV0dGVyczogUGhhc2VyLkltYWdlW107XHJcbiAgICBzdGF0aWMgZ2V0Rm9udEluZGV4KGNoYXI6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKGNoYXIgPj0gNjUgJiYgY2hhciA8IDkwKSB7IC8vIGNhcGl0YWwgbGV0dGVycyB3aXRob3V0IFpcclxuICAgICAgICAgICAgcmV0dXJuIGNoYXIgLSA2NTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA+PSA0OSAmJiBjaGFyIDw9IDU3KSB7IC8vIGFsbCBudW1iZXJzIHdpdGhvdXQgMFxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDQ5ICsgMjc7XHJcbiAgICAgICAgfWVsc2UgaWYgKGNoYXIgPT0gNDgpIHsgLy8gMFxyXG4gICAgICAgICAgICByZXR1cm4gMTQ7IC8vIHJldHVybiBPXHJcbiAgICAgICAgfWVsc2UgaWYgKGNoYXIgPT0gNDUpIHsgLy8gLVxyXG4gICAgICAgICAgICByZXR1cm4gMjU7XHJcbiAgICAgICAgfWVsc2UgaWYgKGNoYXIgPT0gNDMpIHsgLy8gK1xyXG4gICAgICAgICAgICByZXR1cm4gMjY7XHJcbiAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRvbid0IHJlY29nbml6ZSBjaGFyIGNvZGUgXCIgKyBjaGFyKTtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIHRleHQ/OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dCB8fCBcIlwiO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuICAgICAgICB0aGlzLmxldHRlcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgIH1cclxuICAgIHNldFRleHQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0ID0gdGV4dDtcclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhdygpIHtcclxuICAgICAgICBsZXQgbDogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuICAgICAgICBsZXQgeCA9IHRoaXMueDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGV4dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hhciA9IHRoaXMudGV4dC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBBRUZvbnQuZ2V0Rm9udEluZGV4KGNoYXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLmxldHRlcnMuc2hpZnQoKTtcclxuICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBBbmNpZW50RW1waXJlcy5nYW1lLmFkZC5pbWFnZSh4LCB0aGlzLnksIFwiY2hhcnNcIiwgbnVsbCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW1hZ2UuZnJhbWUgPSBpbmRleDtcclxuICAgICAgICAgICAgbC5wdXNoKGltYWdlKTtcclxuICAgICAgICAgICAgeCArPSBpbWFnZS53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHRoaXMubGV0dGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBsZXR0ZXIgPSB0aGlzLmxldHRlcnMuc2hpZnQoKTtcclxuICAgICAgICAgICAgbGV0dGVyLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sZXR0ZXJzID0gbDtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuY2xhc3MgUG9zIGltcGxlbWVudHMgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIG1hdGNoKHA6IElQb3MpIHtcclxuICAgICAgICByZXR1cm4gKCEhcCAmJiB0aGlzLnggPT0gcC54ICYmIHRoaXMueSA9PSBwLnkpO1xyXG4gICAgfVxyXG4gICAgY29weShkaXJlY3Rpb246IERpcmVjdGlvbiA9IERpcmVjdGlvbi5Ob25lKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55IC0gMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICsgMSwgdGhpcy55KTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55ICsgMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggLSAxLCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMueS0tO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54Kys7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMueSsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLngtLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXREaXJlY3Rpb25UbyAocDogUG9zKTogRGlyZWN0aW9uIHtcclxuICAgICAgICBpZiAocC54ID4gdGhpcy54KSB7IHJldHVybiBEaXJlY3Rpb24uUmlnaHQ7IH1cclxuICAgICAgICBpZiAocC54IDwgdGhpcy54KSB7IHJldHVybiBEaXJlY3Rpb24uTGVmdDsgfVxyXG4gICAgICAgIGlmIChwLnkgPiB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5Eb3duOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMueSkgeyByZXR1cm4gRGlyZWN0aW9uLlVwOyB9XHJcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5Ob25lO1xyXG4gICAgfVxyXG4gICAgZ2V0V29ybGRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICB9XHJcbiAgICBnZXRJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiBcInt4OiBcIiArIHRoaXMueCArIFwiLCB5OiBcIiArIHRoaXMueSArIFwifVwiO1xyXG4gICAgfVxyXG59XHJcbmVudW0gRGlyZWN0aW9uIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgVXAgPSAxLFxyXG4gICAgUmlnaHQgPSAyLFxyXG4gICAgRG93biA9IDQsXHJcbiAgICBMZWZ0ID0gOFxyXG59XHJcbiIsImludGVyZmFjZSBEYXRhRW50cnkge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG5jbGFzcyBMb2FkZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZCgpIHtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJkYXRhXCIsIFwiZGF0YS8xLnBha1wiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgdGhpcy51bnBhY2tSZXNvdXJjZURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvYWRFbnRpdHlEYXRhKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwVGlsZXNQcm9wKCk7XHJcblxyXG4gICAgICAgIGxldCB3YWl0ZXIgPSBuZXcgUE5HV2FpdGVyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiTWFpbk1lbnVcIiwgZmFsc2UsIGZhbHNlLCBuYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidGlsZXMwXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYnVpbGRpbmdzXCIsIDI0LCAyNCwgMywgMCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYnVpbGRpbmdzXCIsIDI0LCAyNCwgMywgMSk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYnVpbGRpbmdzXCIsIDI0LCAyNCwgMywgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc1wiLCAyNCwgMjQsIDAsIDEpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNcIiwgMjQsIDI0LCAwLCAyKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJjdXJzb3JcIiwgMjYsIDI2KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJiX3Ntb2tlXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcIm1lbnVcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwicG9ydHJhaXRcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiY2hhcnNcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwiZ29sZFwiKTtcclxuXHJcbiAgICAgICAgd2FpdGVyLmF3YWl0KCk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1bnBhY2tSZXNvdXJjZURhdGEoKSB7XHJcbiAgICAgICAgbGV0IGFycmF5OiBVaW50OEFycmF5ID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcImRhdGFcIik7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYXJyYXkuYnVmZmVyKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMjsgLy8gZG9lcyBub3Qgc2VlbSBpbXBvcnRhbnRcclxuICAgICAgICBsZXQgbnVtYmVyX29mX2VudHJpZXMgPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgbGV0IGVudHJpZXM6IERhdGFFbnRyeVtdID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX2VudHJpZXM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc3RyX2xlbiA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgbGV0IG5hbWUgPSBcIlwiO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHN0cl9sZW47IGorKykge1xyXG4gICAgICAgICAgICAgICAgbmFtZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDQ7IC8vIGRvZXMgbm90IHNlZW0gaW1wb3J0YW50XHJcbiAgICAgICAgICAgIGxldCBzaXplID0gZGF0YS5nZXRVaW50MTYoaW5kZXgpO1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goe25hbWU6IG5hbWUsIHNpemU6IHNpemV9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IGVudHJ5IG9mIGVudHJpZXMpIHtcclxuICAgICAgICAgICAgbGV0IGVudHJ5X2RhdGE6IEFycmF5QnVmZmVyID0gYXJyYXkuYnVmZmVyLnNsaWNlKGluZGV4LCBpbmRleCArIGVudHJ5LnNpemUpO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUuY2FjaGUuYWRkQmluYXJ5KGVudHJ5Lm5hbWUsIGVudHJ5X2RhdGEpO1xyXG4gICAgICAgICAgICBpbmRleCArPSBlbnRyeS5zaXplO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGxvYWRFbnRpdHlEYXRhKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInVuaXRzLmJpblwiKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMgPSBbXTtcclxuICAgICAgICBsZXQgbmFtZXMgPSBbXCJTb2xkaWVyXCIsIFwiQXJjaGVyXCIsIFwiTGl6YXJkXCIsIFwiV2l6YXJkXCIsIFwiV2lzcFwiLCBcIlNwaWRlclwiLCBcIkdvbGVtXCIsIFwiQ2F0YXB1bHRcIiwgXCJXeXZlcm5cIiwgXCJLaW5nXCIsIFwiU2tlbGV0b25cIl07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVudGl0eTogRW50aXR5RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldLFxyXG4gICAgICAgICAgICAgICAgbW92OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgYXRrOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgZGVmOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWluOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgY29zdDogZGF0YS5nZXRVaW50MTYoaW5kZXgpLFxyXG4gICAgICAgICAgICAgICAgYmF0dGxlX3Bvc2l0aW9uczogW10sXHJcbiAgICAgICAgICAgICAgICBmbGFnczogRW50aXR5RmxhZ3MuTm9uZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgbGV0IG51bWJlcl9wb3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9wb3M7IGorKykge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmJhdHRsZV9wb3NpdGlvbnMucHVzaCh7eDogZGF0YS5nZXRVaW50OChpbmRleCsrKSwgeTogZGF0YS5nZXRVaW50OChpbmRleCsrKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBudW1iZXJfZmxhZ3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9mbGFnczsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuZmxhZ3MgfD0gMSA8PCBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLnB1c2goZW50aXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBsb2FkTWFwVGlsZXNQcm9wKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInRpbGVzMC5wcm9wXCIpO1xyXG4gICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBsZW5ndGggPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDsgLy8gMiBhcmUgdW5yZWxldmFudFxyXG5cclxuICAgICAgICBBbmNpZW50RW1waXJlcy5USUxFU19QUk9QID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5USUxFU19QUk9QLnB1c2goPFRpbGU+IGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgUE5HV2FpdGVyIHtcclxuXHJcbiAgICBhd2FpdGluZzogYm9vbGVhbjtcclxuICAgIGNvdW50ZXI6IG51bWJlcjtcclxuICAgIGNhbGxiYWNrOiBGdW5jdGlvbjtcclxuICAgIGNvbnN0cnVjdG9yKGNhbGxiYWNrOiBGdW5jdGlvbikge1xyXG4gICAgICAgIHRoaXMuY291bnRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5hd2FpdGluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcblxyXG4gICAgfVxyXG4gICAgYXdhaXQoKSB7XHJcbiAgICAgICAgdGhpcy5hd2FpdGluZyA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA8PSAwKSB7XHJcbiAgICAgICAgICAgIC8vIGlmIGltZy5vbmxvYWQgaXMgc3luY2hyb25vdXNcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGFkZCgpIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIrKztcclxuICAgIH1cclxuICAgIHJldCA9ICgpID0+IHtcclxuICAgICAgICB0aGlzLmNvdW50ZXItLTtcclxuICAgICAgICBpZiAodGhpcy5jb3VudGVyID4gMCB8fCAhdGhpcy5hd2FpdGluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNhbGxiYWNrKCk7XHJcblxyXG4gICAgfTtcclxufVxyXG5jbGFzcyBQTkdMb2FkZXIge1xyXG4gICAgc3RhdGljIGJ1ZmZlclRvQmFzZTY0KGJ1ZjogVWludDhBcnJheSkge1xyXG4gICAgICAgIGxldCBiaW5zdHIgPSBBcnJheS5wcm90b3R5cGUubWFwLmNhbGwoYnVmLCBmdW5jdGlvbiAoY2g6IG51bWJlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShjaCk7XHJcbiAgICAgICAgfSkuam9pbihcIlwiKTtcclxuICAgICAgICByZXR1cm4gYnRvYShiaW5zdHIpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBsb2FkU3ByaXRlU2hlZXQod2FpdGVyOiBQTkdXYWl0ZXIsIG5hbWU6IHN0cmluZywgdGlsZV93aWR0aD86IG51bWJlciwgdGlsZV9oZWlnaHQ/OiBudW1iZXIsIG51bWJlcl9vZl90aWxlcz86IG51bWJlciwgdmFyaWF0aW9uPzogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGxldCBzcHJpdGVzaGVldF9uYW1lID0gbmFtZTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB0aWxlX3dpZHRoID09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIHRpbGVfaGVpZ2h0ID09IFwidW5kZWZpbmVkXCIgfHwgdHlwZW9mIG51bWJlcl9vZl90aWxlcyA9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIFwiLnNwcml0ZVwiKTtcclxuICAgICAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIG51bWJlcl9vZl90aWxlcyA9PSBcInVuZGVmaW5lZFwiKSB7IG51bWJlcl9vZl90aWxlcyA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7IH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aWxlX3dpZHRoID09IFwidW5kZWZpbmVkXCIpIHsgdGlsZV93aWR0aCA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7IH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aWxlX2hlaWdodCA9PSBcInVuZGVmaW5lZFwiKSB7IHRpbGVfaGVpZ2h0ID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuY2hlY2tCaW5hcnlLZXkobmFtZSArIFwiLnBuZ1wiKSkge1xyXG4gICAgICAgICAgICAvLyBhbGwgdGlsZXMgYXJlIGluIG9uZSBmaWxlXHJcbiAgICAgICAgICAgIGxldCBwbmdfYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBcIi5wbmdcIik7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIHBuZ19idWZmZXIgPSBQTkdMb2FkZXIuY3JlYXRlVmFyaWF0aW9uKHBuZ19idWZmZXIsIHZhcmlhdGlvbik7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGVzaGVldF9uYW1lICs9IFwiX1wiICsgdmFyaWF0aW9uO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgICAgICB3YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmFkZFNwcml0ZVNoZWV0KHNwcml0ZXNoZWV0X25hbWUsIG51bGwsIGltZywgdGlsZV93aWR0aCwgdGlsZV9oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgd2FpdGVyLnJldCgpO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBQTkdMb2FkZXIuYnVmZmVyVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkocG5nX2J1ZmZlcikpO1xyXG5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0aWxlcyBhcmUgaW4gbXVsdGlwbGUgZmlsZXMgd2l0aCBuYW1lcyBuYW1lXzAwLnBuZywgbmFtZV8wMS5wbmcsIC4uLlxyXG5cclxuICAgICAgICAgICAgd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgICAgICBsZXQgaW5uZXJfd2FpdGVyID0gbmV3IFBOR1dhaXRlcih3YWl0ZXIucmV0KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzcXVhcmUgPSBNYXRoLmNlaWwoTWF0aC5zcXJ0KG51bWJlcl9vZl90aWxlcykpO1xyXG4gICAgICAgICAgICBsZXQgc3ByaXRlc2hlZXQgPSBBbmNpZW50RW1waXJlcy5nYW1lLmFkZC5iaXRtYXBEYXRhKHNxdWFyZSAqIHRpbGVfd2lkdGgsIHNxdWFyZSAqIHRpbGVfaGVpZ2h0KTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJfb2ZfdGlsZXM7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGlkeDogc3RyaW5nID0gaSA8IDEwID8gKFwiXzBcIiArIGkpIDogKFwiX1wiICsgaSk7XHJcbiAgICAgICAgICAgICAgICBsZXQgcG5nX2J1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgaWR4ICsgXCIucG5nXCIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB2YXJpYXRpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIHBuZ19idWZmZXIgPSBQTkdMb2FkZXIuY3JlYXRlVmFyaWF0aW9uKHBuZ19idWZmZXIsIHZhcmlhdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlc2hlZXRfbmFtZSArPSBcIl9cIiArIHZhcmlhdGlvbjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgICAgICAgICAgIGlubmVyX3dhaXRlci5hZGQoKTtcclxuICAgICAgICAgICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlc2hlZXQuY3R4LmRyYXdJbWFnZShpbWcsIChpICUgc3F1YXJlKSAqIHRpbGVfd2lkdGgsIE1hdGguZmxvb3IoaSAvIHNxdWFyZSkgKiB0aWxlX2hlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5uZXJfd2FpdGVyLnJldCgpO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIFBOR0xvYWRlci5idWZmZXJUb0Jhc2U2NChuZXcgVWludDhBcnJheShwbmdfYnVmZmVyKSk7XHJcblxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaW5uZXJfd2FpdGVyLmF3YWl0KCk7XHJcblxyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmFkZFNwcml0ZVNoZWV0KHNwcml0ZXNoZWV0X25hbWUsIG51bGwsIHNwcml0ZXNoZWV0LmNhbnZhcywgdGlsZV93aWR0aCwgdGlsZV9oZWlnaHQsIG51bWJlcl9vZl90aWxlcyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbG9hZEltYWdlKHdhaXRlcjogUE5HV2FpdGVyLCBuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgcG5nX2J1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgXCIucG5nXCIpO1xyXG4gICAgICAgIGxldCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHJcbiAgICAgICAgd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgIGltZy5vbmxvYWQgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuYWRkSW1hZ2UobmFtZSwgbnVsbCwgaW1nKTtcclxuICAgICAgICAgICAgd2FpdGVyLnJldCgpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgUE5HTG9hZGVyLmJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHBuZ19idWZmZXIpKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgY3JlYXRlVmFyaWF0aW9uKGJ1ZmZlcjogQXJyYXlCdWZmZXIsIHZhcmlhdGlvbj86IG51bWJlcik6IEFycmF5QnVmZmVyIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiB2YXJpYXRpb24gPT0gXCJ1bmRlZmluZWRcIikgeyByZXR1cm4gYnVmZmVyOyB9XHJcblxyXG4gICAgICAgIGJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgwKTsgLy8gY29weSBidWZmZXIgKG90aGVyd2lzZSB3ZSBtb2RpZnkgb3JpZ2luYWwgZGF0YSwgc2FtZSBhcyBpbiBjYWNoZSlcclxuICAgICAgICBsZXQgZGF0YSA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG5cclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG4gICAgICAgIGxldCBzdGFydF9wbHRlID0gMDtcclxuXHJcbiAgICAgICAgZm9yICg7IGluZGV4IDwgZGF0YS5ieXRlTGVuZ3RoIC0gMzsgaW5kZXgrKykge1xyXG4gICAgICAgICAgICBpZiAoZGF0YS5nZXRVaW50OChpbmRleCkgIT0gODAgfHwgZGF0YS5nZXRVaW50OChpbmRleCArIDEpICE9IDc2IHx8IGRhdGEuZ2V0VWludDgoaW5kZXggKyAyKSAhPSA4NCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBzdGFydF9wbHRlID0gaW5kZXggLSA0O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgaW5kZXggPSBzdGFydF9wbHRlO1xyXG5cclxuICAgICAgICBsZXQgbGVuZ3RoX3BsdGUgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcblxyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcbiAgICAgICAgbGV0IGNyYyA9IC0xOyAvLyAzMiBiaXRcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xyXG4gICAgICAgICAgICBjcmMgPSBQTkdMb2FkZXIudXBkYXRlUE5HQ1JDKGRhdGEuZ2V0VWludDgoaW5kZXggKyBpKSwgY3JjKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IGluZGV4OyBpIDwgaW5kZXggKyBsZW5ndGhfcGx0ZTsgaSArPSAzKSB7XHJcbiAgICAgICAgICAgIGxldCByZWQ6IG51bWJlciA9IGRhdGEuZ2V0VWludDgoaSk7XHJcbiAgICAgICAgICAgIGxldCBncmVlbjogbnVtYmVyID0gZGF0YS5nZXRVaW50OChpICsgMSk7XHJcbiAgICAgICAgICAgIGxldCBibHVlOiBudW1iZXIgPSBkYXRhLmdldFVpbnQ4KGkgKyAyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChibHVlID4gcmVkICYmIGJsdWUgPiBncmVlbikge1xyXG4gICAgICAgICAgICAgICAgLy8gYmx1ZSBjb2xvclxyXG4gICAgICAgICAgICAgICAgaWYgKHZhcmlhdGlvbiA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIHRvIHJlZCBjb2xvclxyXG4gICAgICAgICAgICAgICAgICAgIGxldCB0bXAgPSByZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gYmx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBibHVlID0gdG1wO1xyXG4gICAgICAgICAgICAgICAgICAgIGdyZWVuIC89IDI7XHJcbiAgICAgICAgICAgICAgICB9ZWxzZSBpZiAodmFyaWF0aW9uID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBkZWNvbG9yaXplXHJcbiAgICAgICAgICAgICAgICAgICAgcmVkID0gYmx1ZTtcclxuICAgICAgICAgICAgICAgICAgICBncmVlbiA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBkYXRhLnNldFVpbnQ4KGksIHJlZCk7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnNldFVpbnQ4KGkgKyAxLCBncmVlbik7XHJcbiAgICAgICAgICAgICAgICBkYXRhLnNldFVpbnQ4KGkgKyAyLCBibHVlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkpLCBjcmMpO1xyXG4gICAgICAgICAgICBjcmMgPSBQTkdMb2FkZXIudXBkYXRlUE5HQ1JDKGRhdGEuZ2V0VWludDgoaSArIDEpLCBjcmMpO1xyXG4gICAgICAgICAgICBjcmMgPSBQTkdMb2FkZXIudXBkYXRlUE5HQ1JDKGRhdGEuZ2V0VWludDgoaSArIDIpLCBjcmMpO1xyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHVwZGF0ZSBjcmMgZmllbGRcclxuICAgICAgICBjcmMgXj0gLTE7XHJcbiAgICAgICAgbGV0IGluZGV4X2NyYyA9IHN0YXJ0X3BsdGUgKyA4ICsgbGVuZ3RoX3BsdGU7XHJcbiAgICAgICAgZGF0YS5zZXRVaW50MzIoaW5kZXhfY3JjLCBjcmMpO1xyXG5cclxuICAgICAgICByZXR1cm4gYnVmZmVyO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIHVwZGF0ZVBOR0NSQyh2YWx1ZTogbnVtYmVyLCBjcmM6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgY3JjIF49IHZhbHVlICYgMjU1OyAvLyBiaXR3aXNlIG9yICh3aXRob3V0IGFuZClcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDg7IGorKykge1xyXG4gICAgICAgICAgICBpZiAoKGNyYyAmIDEpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGNyYyA9IGNyYyA+Pj4gMSBeIC0zMDY2NzQ5MTI7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjcmMgPj4+PSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY3JjO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2ZW5kb3IvcGhhc2VyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiYW5jaWVudGVtcGlyZXMudHNcIiAvPlxyXG5jbGFzcyBNYWluTWVudSBleHRlbmRzIFBoYXNlci5TdGF0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlICgpIHtcclxuICAgICAgICB0aGlzLmxvYWRNYXAoXCJzMFwiKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkTWFwIChuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJHYW1lXCIsIGZhbHNlLCBmYWxzZSwgbmFtZSk7XHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgR2FtZUNvbnRyb2xsZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIG1hcDogTWFwO1xyXG5cclxuICAgIHRpbGVfbWFuYWdlcjogVGlsZU1hbmFnZXI7XHJcbiAgICBlbnRpdHlfbWFuYWdlcjogRW50aXR5TWFuYWdlcjtcclxuICAgIHNtb2tlX21hbmFnZXI6IFNtb2tlTWFuYWdlcjtcclxuICAgIGZyYW1lX21hbmFnZXI6IEZyYW1lTWFuYWdlcjtcclxuXHJcbiAgICBmcmFtZV9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgZnJhbWVfZ29sZF9pbmZvOiBNZW51R29sZEluZm87XHJcbiAgICBmcmFtZV9kZWZfaW5mbzogTWVudURlZkluZm87XHJcblxyXG4gICAgdHVybjogQWxsaWFuY2U7XHJcbiAgICBnb2xkOiBudW1iZXJbXTtcclxuXHJcbiAgICBjdXJzb3I6IFNwcml0ZTtcclxuXHJcbiAgICBzZWxlY3RlZDogRW50aXR5O1xyXG5cclxuICAgIGFjYzogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgbGFzdF9jdXJzb3JfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKG5hbWUpO1xyXG5cclxuICAgICAgICB0aGlzLnR1cm4gPSBBbGxpYW5jZS5CbHVlO1xyXG4gICAgICAgIHRoaXMuZ29sZCA9IFtdO1xyXG5cclxuICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT0gXCJzXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5nb2xkWzBdID0gMTAwMDtcclxuICAgICAgICAgICAgdGhpcy5nb2xkWzFdID0gMTAwMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmdvbGRbMF0gPSAzMDA7XHJcbiAgICAgICAgICAgIHRoaXMuZ29sZFsxXSA9IDMwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyA9IDA7XHJcbiAgICB9XHJcbiAgICBjcmVhdGUoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aWxlbWFwID0gdGhpcy5nYW1lLmFkZC50aWxlbWFwKCk7XHJcbiAgICAgICAgbGV0IHRpbGVtYXBfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IHNtb2tlX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBzZWxlY3Rpb25fZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGVudGl0eV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgaW50ZXJhY3Rpb25fZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGN1cnNvcl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmZyYW1lX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKHRoaXMubWFwLCB0aWxlbWFwLCB0aWxlbWFwX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zbW9rZV9tYW5hZ2VyID0gbmV3IFNtb2tlTWFuYWdlcih0aGlzLm1hcCwgc21va2VfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyID0gbmV3IEVudGl0eU1hbmFnZXIodGhpcy5tYXAsIGVudGl0eV9ncm91cCwgc2VsZWN0aW9uX2dyb3VwLCBpbnRlcmFjdGlvbl9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gbmV3IFNwcml0ZSh7eDogMCwgeTogMH0sIGN1cnNvcl9ncm91cCwgXCJjdXJzb3JcIiwgWzAsIDFdKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyID0gbmV3IEZyYW1lTWFuYWdlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZS5pbnB1dC5vbkRvd24uYWRkKHRoaXMuY2xpY2ssIHRoaXMpO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0VHVybihBbGxpYW5jZS5SZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvID0gbmV3IE1lbnVEZWZJbmZvKHRoaXMuZnJhbWVfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLmZyYW1lX2RlZl9pbmZvKTtcclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnNob3codHJ1ZSk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN0YXJ0VHVybihhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy50dXJuID0gYWxsaWFuY2U7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5mcmFtZV9nb2xkX2luZm8pIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8gPSBuZXcgTWVudUdvbGRJbmZvKHRoaXMuZnJhbWVfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5mcmFtZV9nb2xkX2luZm8pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlQ29udGVudChhbGxpYW5jZSwgdGhpcy5nZXRHb2xkRm9yQWxsaWFuY2UoYWxsaWFuY2UpKTtcclxuICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby5zaG93KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzd2l0Y2ggKGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRbMF07XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuUmVkOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29sZFsxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEFjdGl2ZVBvcygpOiBQb3Mge1xyXG4gICAgICAgIC8vIHBvcyBhbHdheXMgaW5zaWRlIGNhbnZhc1xyXG4gICAgICAgIGxldCB4ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIueCArIHRoaXMuZ2FtZS5jYW1lcmEueCkgLyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lLmlucHV0LmFjdGl2ZVBvaW50ZXIueSArIHRoaXMuZ2FtZS5jYW1lcmEueSkgLyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgICAgIHJldHVybiBuZXcgUG9zKHgsIHkpO1xyXG4gICAgfVxyXG4gICAgY2xpY2soKSB7XHJcblxyXG4gICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZ2V0QWN0aXZlUG9zKCk7XHJcblxyXG4gICAgICAgIGxldCBzZWxlY3RlZCA9IHRoaXMuZW50aXR5X21hbmFnZXIuc2VsZWN0ZWQ7XHJcbiAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIuZ2V0RW50aXR5QXQocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBpZiAoISFlbnRpdHkpIHtcclxuICAgICAgICAgICAgLy8gZW50aXR5IGlzIHRoZXJlIC0gZGVzZWxlY3QgY3VycmVudFxyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgfWVsc2UgaWYgKCEhc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgLy8gbm8gZW50aXR5IGFuZCBzZWxlY3RlZCBlbnRpdHlcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5tb3ZlU2VsZWN0ZWRFbnRpdHkocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEhZW50aXR5ICYmIGVudGl0eSAhPSBzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gMSBzdGVwIGlzIDEvNjAgc2VjXHJcblxyXG4gICAgICAgIHRoaXMuYWNjICs9IHRoaXMudGltZS5lbGFwc2VkO1xyXG4gICAgICAgIGxldCBzdGVwcyA9IE1hdGguZmxvb3IodGhpcy5hY2MgLyAxNik7XHJcbiAgICAgICAgaWYgKHN0ZXBzIDw9IDApIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5hY2MgLT0gc3RlcHMgKiAxNjtcclxuICAgICAgICBpZiAoc3RlcHMgPiAyKSB7IHN0ZXBzID0gMjsgfVxyXG5cclxuICAgICAgICBsZXQgbXggPSB0aGlzLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci54O1xyXG4gICAgICAgIGxldCBteSA9IHRoaXMuZ2FtZS5pbnB1dC5hY3RpdmVQb2ludGVyLnk7XHJcblxyXG4gICAgICAgIGlmIChteCA8IDUwICYmIHRoaXMuZ2FtZS5jYW1lcmEueCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGN4ID0gdGhpcy5nYW1lLmNhbWVyYS54IC0gMiAqIHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAoY3ggPCAwKSB7IGN4ID0gMDsgfVxyXG4gICAgICAgICAgICB0aGlzLmdhbWUuY2FtZXJhLnggPSBjeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG15IDwgNTAgJiYgdGhpcy5nYW1lLmNhbWVyYS55ID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgY3kgPSB0aGlzLmdhbWUuY2FtZXJhLnkgLSAyICogc3RlcHM7XHJcbiAgICAgICAgICAgIGlmIChjeSA8IDApIHsgY3kgPSAwOyB9XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5jYW1lcmEueSA9IGN5O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobXggPiB0aGlzLmdhbWUud2lkdGggLSA1MCAmJiB0aGlzLmdhbWUuY2FtZXJhLnggKyB0aGlzLmdhbWUud2lkdGggPCB0aGlzLmdhbWUud29ybGQud2lkdGgpIHtcclxuICAgICAgICAgICAgbGV0IGN4ID0gdGhpcy5nYW1lLmNhbWVyYS54ICsgMiAqIHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAoY3ggPiB0aGlzLmdhbWUud29ybGQud2lkdGggLSB0aGlzLmdhbWUud2lkdGgpIHsgY3ggPSB0aGlzLmdhbWUud29ybGQud2lkdGggLSB0aGlzLmdhbWUud2lkdGg7IH1cclxuICAgICAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS54ID0gY3g7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChteSA+IHRoaXMuZ2FtZS5oZWlnaHQgLSA1MCAmJiB0aGlzLmdhbWUuY2FtZXJhLnkgKyB0aGlzLmdhbWUuaGVpZ2h0IDwgdGhpcy5nYW1lLndvcmxkLmhlaWdodCkge1xyXG4gICAgICAgICAgICBsZXQgY3kgPSB0aGlzLmdhbWUuY2FtZXJhLnkgKyAyICogc3RlcHM7XHJcbiAgICAgICAgICAgIGlmIChjeSA+IHRoaXMuZ2FtZS53b3JsZC5oZWlnaHQgLSB0aGlzLmdhbWUuaGVpZ2h0KSB7IGN5ID0gdGhpcy5nYW1lLndvcmxkLmhlaWdodCAtIHRoaXMuZ2FtZS5oZWlnaHQ7IH1cclxuICAgICAgICAgICAgdGhpcy5nYW1lLmNhbWVyYS55ID0gY3k7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY3Vyc29yX2lzX2xlZnQgPSBteCA8IHRoaXMuZ2FtZS53aWR0aCAvIDI7XHJcbiAgICAgICAgbGV0IGluZm9faXNfcmlnaHQgPSAodGhpcy5mcmFtZV9nb2xkX2luZm8uYWxpZ24gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDA7XHJcblxyXG4gICAgICAgIGlmIChjdXJzb3JfaXNfbGVmdCAhPSBpbmZvX2lzX3JpZ2h0KSB7XHJcbiAgICAgICAgICAgIGlmIChjdXJzb3JfaXNfbGVmdCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5MZWZ0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5SaWdodCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5MZWZ0IHwgRGlyZWN0aW9uLlVwLCBEaXJlY3Rpb24uUmlnaHQsIHRydWUpO1xyXG4gICAgICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLkxlZnQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5VcCwgRGlyZWN0aW9uLkxlZnQsIHRydWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuXHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5hbmltX2N1cnNvcl9zbG93ID4gMzApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zbG93IC09IDMwO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlID0gMSAtIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yLnNldEZyYW1lKHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGN1cnNvcl9wb3NpdGlvbiA9IHRoaXMuZ2V0QWN0aXZlUG9zKCk7XHJcbiAgICAgICAgaWYgKCFjdXJzb3JfcG9zaXRpb24ubWF0Y2godGhpcy5sYXN0X2N1cnNvcl9wb3NpdGlvbikgJiYgY3Vyc29yX3Bvc2l0aW9uLnggPiAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RfY3Vyc29yX3Bvc2l0aW9uID0gY3Vyc29yX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRXb3JsZFBvc2l0aW9uKHt4OiBjdXJzb3JfcG9zaXRpb24ueCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDEsIHk6IGN1cnNvcl9wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMX0pO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGRlZiBpbmZvXHJcbiAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEVudGl0eUF0KGN1cnNvcl9wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlQ29udGVudChjdXJzb3JfcG9zaXRpb24sIHRoaXMubWFwLCBlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIudXBkYXRlKHN0ZXBzKTtcclxuICAgICAgICB0aGlzLnNtb2tlX21hbmFnZXIudXBkYXRlKHN0ZXBzKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci51cGRhdGUoc3RlcHMsIGN1cnNvcl9wb3NpdGlvbiwgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgIH1cclxuXHJcbn1cclxuIiwiZW51bSBUaWxlIHtcclxuICAgIFBhdGgsXHJcbiAgICBHcmFzcyxcclxuICAgIEZvcmVzdCxcclxuICAgIEhpbGwsXHJcbiAgICBNb3VudGFpbixcclxuICAgIFdhdGVyLFxyXG4gICAgQnJpZGdlLFxyXG4gICAgSG91c2UsXHJcbiAgICBDYXN0bGVcclxufVxyXG5pbnRlcmZhY2UgSUJ1aWxkaW5nIHtcclxuICAgIGNhc3RsZTogYm9vbGVhbjtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbn1cclxuXHJcbmNsYXNzIE1hcCB7XHJcblxyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gICAgc3RhcnRfZW50aXRpZXM6IElFbnRpdHlbXTtcclxuXHJcbiAgICBwcml2YXRlIHRpbGVzOiBUaWxlW11bXTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmdzOiBJQnVpbGRpbmdbXTtcclxuXHJcbiAgICBzdGF0aWMgZ2V0VGlsZUZvckNvZGUoY29kZTogbnVtYmVyKTogVGlsZSB7XHJcbiAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1BbY29kZV07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHN0YXRpYyBnZXRDb3N0Rm9yVGlsZSh0aWxlOiBUaWxlLCBlbnRpdHk6IEVudGl0eSk6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuV2F0ZXIgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHtcclxuICAgICAgICAgICAgLy8gTGl6YXJkIG9uIHdhdGVyXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvc3QgPSAwO1xyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuTW91bnRhaW4gfHwgdGlsZSA9PSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCB8fCB0aWxlID09IFRpbGUuSGlsbCkge1xyXG4gICAgICAgICAgICBjb3N0ID0gMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb3N0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuTGl6YXJkKSB7XHJcbiAgICAgICAgICAgIC8vIExpemFyZCBmb3IgZXZlcnl0aGluZyBleGNlcHQgd2F0ZXJcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgKiAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvc3Q7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0RGVmRm9yVGlsZSh0aWxlOiBUaWxlLCBlbnRpdHk6IEVudGl0eSk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbiB8fCB0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkgeyByZXR1cm4gMzsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuRm9yZXN0IHx8IHRpbGUgPT0gVGlsZS5IaWxsKSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5XYXRlciAmJiBlbnRpdHkgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHsgcmV0dXJuIDI7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkdyYXNzKSB7IHJldHVybiAxOyB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmxvYWQoKTtcclxuICAgIH1cclxuICAgIGxvYWQoKSB7XHJcbiAgICAgICAgaWYgKCFBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KHRoaXMubmFtZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBtYXA6IFwiICsgdGhpcy5uYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZ3MgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXJ0X2VudGl0aWVzID0gW107XHJcbiAgICAgICAgdGhpcy50aWxlcyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KHRoaXMubmFtZSk7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgdGhpcy50aWxlc1t4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb2RlID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgICAgIGxldCB0aWxlID0gTWFwLmdldFRpbGVGb3JDb2RlKGNvZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlc1t4XVt5XSA9IHRpbGU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkaW5ncy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzdGxlOiAodGlsZSA9PSBUaWxlLkNhc3RsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgUG9zKHgsIHkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxpYW5jZTogPEFsbGlhbmNlPiBNYXRoLmZsb29yKChjb2RlIC0gQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTKSAvIDMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBza2lwID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQgKyBza2lwICogNDtcclxuXHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRpdGllcyA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRpdGllczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXNjID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgbGV0IHR5cGU6IEVudGl0eVR5cGUgPSBkZXNjICUgMTE7XHJcbiAgICAgICAgICAgIGxldCBhbGxpYW5jZTogQWxsaWFuY2UgPSBNYXRoLmZsb29yKGRlc2MgLyAxMSkgKyAxO1xyXG5cclxuICAgICAgICAgICAgbGV0IHggPSBNYXRoLmZsb29yKGRhdGEuZ2V0VWludDE2KGluZGV4KSAvIDE2KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGRhdGEuZ2V0VWludDE2KGluZGV4KSAvIDE2KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRfZW50aXRpZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICAgICAgYWxsaWFuY2U6IGFsbGlhbmNlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBQb3MoeCwgeSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0VGlsZUF0KHBvc2l0aW9uOiBQb3MpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcclxuICAgIH1cclxuICAgIGdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbjogUG9zKTogVGlsZVtdIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgcG9zaXRpb24ueSA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA8IHRoaXMud2lkdGggLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPCB0aGlzLmhlaWdodCAtIDEgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSkgOiAtMVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChwOiBQb3MpOiBQb3NbXSB7XHJcbiAgICAgICAgbGV0IHJldDogUG9zW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XHJcbiAgICAgICAgaWYgKHAueSA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSAtIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPCB0aGlzLndpZHRoIC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCArIDEsIHAueSkpOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMuaGVpZ2h0IC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCwgcC55ICsgMSkpOyB9XHJcbiAgICAgICAgaWYgKHAueCA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggLSAxLCBwLnkpKTsgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgZ2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgdGhpcy5idWlsZGluZ3Mpe1xyXG4gICAgICAgICAgICBpZiAoYnVpbGRpbmcucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRpbmcuYWxsaWFuY2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEFsbGlhbmNlLk5vbmU7XHJcbiAgICB9XHJcbiAgICBnZXRPY2N1cGllZEhvdXNlcygpOiBJQnVpbGRpbmdbXSB7XHJcbiAgICAgICAgbGV0IGhvdXNlczogSUJ1aWxkaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmICghYnVpbGRpbmcuY2FzdGxlICYmIGJ1aWxkaW5nLmFsbGlhbmNlICE9IEFsbGlhbmNlLk5vbmUpIHtcclxuICAgICAgICAgICAgICAgIGhvdXNlcy5wdXNoKGJ1aWxkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaG91c2VzO1xyXG4gICAgfVxyXG4gICAgZ2V0U3RhcnRFbnRpdGllcygpOiBJRW50aXR5W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0X2VudGl0aWVzO1xyXG4gICAgfVxyXG4gICAgZ2V0Q29zdEF0KHBvc2l0aW9uOiBQb3MsIGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hcC5nZXRDb3N0Rm9yVGlsZSh0aGlzLmdldFRpbGVBdChwb3NpdGlvbiksIGVudGl0eSk7XHJcbiAgICB9XHJcbiAgICBnZXREZWZBdChwb3NpdGlvbjogUG9zLCBlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHJldHVybiBNYXAuZ2V0RGVmRm9yVGlsZSh0aGlzLmdldFRpbGVBdChwb3NpdGlvbiksIGVudGl0eSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBBbGxpYW5jZSB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIEJsdWUgPSAxLFxyXG4gICAgUmVkID0gMlxyXG59XHJcbmNsYXNzIFRpbGVNYW5hZ2VyIHtcclxuXHJcbiAgICBtYXA6IE1hcDtcclxuICAgIHdhdGVyU3RhdGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgdGlsZW1hcDogUGhhc2VyLlRpbGVtYXA7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGJhY2tncm91bmRMYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuICAgIGJ1aWxkaW5nTGF5ZXI6IFBoYXNlci5UaWxlbWFwTGF5ZXI7XHJcblxyXG4gICAgd2F0ZXJUaW1lcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBzdGF0aWMgZG9lc1RpbGVDdXRHcmFzcyh0aWxlOiBUaWxlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0aWxlID09IFRpbGUuUGF0aCB8fCB0aWxlID09IFRpbGUuV2F0ZXIgfHwgdGlsZSA9PSBUaWxlLkJyaWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGU6IFRpbGUpOiBudW1iZXIge1xyXG5cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5IaWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEJhc2VJbWFnZUluZGV4Rm9yVGlsZSh0aWxlOiBUaWxlKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDIxO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxODtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhvdXNlOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQ2FzdGxlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbGVNYW5hZ2VyLmdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgdGlsZW1hcDogUGhhc2VyLlRpbGVtYXAsIHRpbGVtYXBfZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcCA9IHRpbGVtYXA7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IHRpbGVtYXBfZ3JvdXA7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJ0aWxlczBcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIDApO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMFwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTKTtcclxuICAgICAgICB0aGlzLnRpbGVtYXAuYWRkVGlsZXNldEltYWdlKFwiYnVpbGRpbmdzXzFcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyArIDMpO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMlwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTICsgNik7XHJcblxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExheWVyID0gdGhpcy50aWxlbWFwLmNyZWF0ZShcImJhY2tncm91bmRcIiwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExheWVyLnJlc2l6ZVdvcmxkKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmdMYXllciA9IHRoaXMudGlsZW1hcC5jcmVhdGVCbGFua0xheWVyKFwiYnVpbGRpbmdcIiwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMuZ3JvdXApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5tYXAud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMubWFwLmhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUaWxlQXQobmV3IFBvcyh4LCB5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy53YXRlclRpbWVyICs9IHN0ZXBzO1xyXG4gICAgICAgIGlmICh0aGlzLndhdGVyVGltZXIgPiAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLndhdGVyVGltZXIgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdhdGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVXYXRlcigpIHtcclxuICAgICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLndhdGVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy53YXRlclN0YXRlID0gMSAtIHRoaXMud2F0ZXJTdGF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlbWFwLnJlcGxhY2UoMjEgKyBvbGRTdGF0ZSwgMjEgKyB0aGlzLndhdGVyU3RhdGUsIDAsIDAsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQsIHRoaXMuYmFja2dyb3VuZExheWVyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3VGlsZUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZSh0aGlzLmdldEltYWdlSW5kZXhGb3JCYWNrZ3JvdW5kQXQocG9zaXRpb24pLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCB0aGlzLmJhY2tncm91bmRMYXllcik7XHJcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBvYmogPSBUaWxlTWFuYWdlci5nZXRJbWFnZUluZGV4Rm9yT2JqZWN0VGlsZSh0aWxlKTtcclxuICAgICAgICBpZiAob2JqID49IDApIHtcclxuICAgICAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIG9iaiArPSBhbGxpYW5jZSAqIDM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkNhc3RsZSAmJiBwb3NpdGlvbi55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJvb2Ygb2YgY2FzdGxlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUob2JqICsgMSwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEsIHRoaXMuYnVpbGRpbmdMYXllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUob2JqLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCB0aGlzLmJ1aWxkaW5nTGF5ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldEltYWdlSW5kZXhGb3JCYWNrZ3JvdW5kQXQocG9zaXRpb246IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIC8vIFdhdGVyXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICAvLyBCcmlkZ2VcclxuICAgICAgICAgICAgICAgIGxldCBhZGogPSB0aGlzLm1hcC5nZXRBZGphY2VudFRpbGVzQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFkalswXSAhPSBUaWxlLldhdGVyIHx8IGFkalsyXSAhPSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIC8vIFBhdGhcclxuICAgICAgICAgICAgICAgIHJldHVybiAxODtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkdyYXNzOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbWFnZUluZGV4Rm9yR3Jhc3NBdChwb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfVxyXG4gICAgZ2V0SW1hZ2VJbmRleEZvckdyYXNzQXQocG9zaXRpb246IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGFkaiA9IHRoaXMubWFwLmdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGN1dCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZGoubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY3V0ICs9IE1hdGgucG93KDIsIGkpICogKFRpbGVNYW5hZ2VyLmRvZXNUaWxlQ3V0R3Jhc3MoYWRqW2ldKSA/IDEgOiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgNCArIDIgKyAxKSB7IHJldHVybiAzOyB9IC8vIGFsbCAtIG5vdCBzdXBwbGllZFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDQgKyAxKSB7IHJldHVybiAxNjsgfSAvLyB0b3AgYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDggKyA0ICsgMikgeyByZXR1cm4gMTA7IH0gLy8gcmlnaHQgYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQgKyAyICsgMSkgeyByZXR1cm4gMTc7IH0gLy8gdG9wIHJpZ2h0IGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDIgKyAxKSB7IHJldHVybiAxNDsgfSAvLyB0b3AgcmlnaHQgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSArIDgpIHsgcmV0dXJuIDEyOyB9IC8vIHRvcCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0ICsgOCkgeyByZXR1cm4gODsgfSAvLyBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gMiArIDQpIHsgcmV0dXJuIDk7IH0gLy8gcmlnaHQgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgMikgeyByZXR1cm4gMTM7IH0gLy8gdG9wIHJpZ2h0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgNCkgeyByZXR1cm4gMTU7IH0gLy8gdG9wIGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMiArIDgpIHsgcmV0dXJuIDY7IH0gLy8gcmlnaHQgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCkgeyByZXR1cm4gNDsgfSAvLyBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0KSB7IHJldHVybiA3OyB9IC8vIGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMikgeyByZXR1cm4gNTsgfSAvLyByaWdodFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSkgeyByZXR1cm4gMTE7IH0gLy8gdG9wXHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIExpbmVQYXJ0IHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBkaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIGxlbmd0aDogbnVtYmVyO1xyXG59XHJcbmludGVyZmFjZSBFbnRpdHlNb3ZlIHtcclxuICAgIGVudGl0eTogRW50aXR5O1xyXG4gICAgdGFyZ2V0OiBQb3M7XHJcbiAgICBsaW5lOiBMaW5lUGFydFtdO1xyXG4gICAgcHJvZ3Jlc3M6IG51bWJlcjtcclxufVxyXG5cclxuY2xhc3MgRW50aXR5TWFuYWdlciB7XHJcblxyXG4gICAgc2VsZWN0ZWQ6IEVudGl0eTtcclxuXHJcbiAgICBwcml2YXRlIGVudGl0aWVzOiBFbnRpdHlbXTtcclxuICAgIHByaXZhdGUgbWFwOiBNYXA7XHJcblxyXG4gICAgcHJpdmF0ZSBtb3Zpbmc6IEVudGl0eU1vdmU7XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltX2lkbGVfY291bnRlcjogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBhbmltX2lkbGVfc3RhdGU6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGVudGl0eV9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgaW50ZXJhY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgcHJpdmF0ZSBpbnRlcmFjdGlvbl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgcHJpdmF0ZSBtb3ZlX3Nwcml0ZTogU3ByaXRlO1xyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0aW9uOiBFbnRpdHlSYW5nZTtcclxuXHJcbiAgICBwcml2YXRlIGFuaW1fc2VsZWN0aW9uX3Byb2dyZXNzOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFuaW1fc2VsZWN0aW9uX2luYzogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIGFuaW1fc2VsZWN0aW9uX3BvczogUG9zO1xyXG4gICAgcHJpdmF0ZSBhbmltX3NlbGVjdGlvbl9saW5lOiBMaW5lUGFydFtdO1xyXG4gICAgcHJpdmF0ZSBhbmltX3NlbGVjdGlvbl9vZmZzZXQ6IG51bWJlcjtcclxuICAgIHByaXZhdGUgYW5pbV9zZWxlY3Rpb25fc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogTWFwLCBlbnRpdHlfZ3JvdXA6IFBoYXNlci5Hcm91cCwgc2VsZWN0aW9uX2dyb3VwOiBQaGFzZXIuR3JvdXAsIGludGVyYWN0aW9uX2dyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuXHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAgPSBlbnRpdHlfZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JvdXAgPSBzZWxlY3Rpb25fZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cCA9IGludGVyYWN0aW9uX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcyA9IHNlbGVjdGlvbl9ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCBzZWxlY3Rpb25fZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JhcGhpY3MgPSBpbnRlcmFjdGlvbl9ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCBpbnRlcmFjdGlvbl9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubW92aW5nID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX2lkbGVfY291bnRlciA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX2lkbGVfc3RhdGUgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIG1hcC5nZXRTdGFydEVudGl0aWVzKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVFbnRpdHkoZW50aXR5LnR5cGUsIGVudGl0eS5hbGxpYW5jZSwgZW50aXR5LnBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjcmVhdGVFbnRpdHkodHlwZTogRW50aXR5VHlwZSwgYWxsaWFuY2U6IEFsbGlhbmNlLCBwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5wdXNoKG5ldyBFbnRpdHkodHlwZSwgYWxsaWFuY2UsIHBvc2l0aW9uLCB0aGlzLmVudGl0eV9ncm91cCkpO1xyXG4gICAgfVxyXG4gICAgZ2V0RW50aXR5QXQocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyLCBjdXJzb3JfcG9zaXRpb246IFBvcywgYW5pbV9zdGF0ZTogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGlmIChhbmltX3N0YXRlICE9IHRoaXMuYW5pbV9pZGxlX3N0YXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9pZGxlX3N0YXRlID0gYW5pbV9zdGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zZXRGcmFtZSh0aGlzLmFuaW1faWRsZV9zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghIXRoaXMuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZVNlbGVjdGlvbkxheWVyKHN0ZXBzKTtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRlU2VsZWN0aW9uTGluZShzdGVwcywgY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghIXRoaXMubW92aW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZU1vdmluZ0VudGl0eShzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoISF0aGlzLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IGVudGl0eTtcclxuICAgICAgICB0aGlzLnNob3dTZWxlY3Rpb24oKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBkZXNlbGVjdEVudGl0eSgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmhpZGVTZWxlY3Rpb24oKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gbnVsbDtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHNob3dTZWxlY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vdmVfc3ByaXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZV9zcHJpdGUgPSBuZXcgU3ByaXRlKHt4OiAwLCB5OiAwfSwgdGhpcy5pbnRlcmFjdGlvbl9ncm91cCwgXCJjdXJzb3JcIiwgWzRdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwLnJlbW92ZSh0aGlzLnNlbGVjdGVkLnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5hZGQodGhpcy5zZWxlY3RlZC5zcHJpdGUpO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGlvbiA9IG5ldyBFbnRpdHlSYW5nZSh0aGlzLnNlbGVjdGVkLCB0aGlzLm1hcCwgdGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25fcHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9pbmMgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmRyYXdTZWxlY3Rpb24oKTtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9zbG93ID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1fc2VsZWN0aW9uX29mZnNldCA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9wb3MgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25fbGluZSA9IG51bGw7XHJcblxyXG4gICAgfVxyXG4gICAgaGlkZVNlbGVjdGlvbigpIHtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLnJlbW92ZSh0aGlzLnNlbGVjdGVkLnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAuYWRkKHRoaXMuc2VsZWN0ZWQuc3ByaXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MuY2xlYXIoKTtcclxuXHJcbiAgICB9XHJcbiAgICBkcmF3U2VsZWN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzLmJlZ2luRmlsbCgweGZmZmZmZik7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2YgdGhpcy5zZWxlY3Rpb24ud2F5cG9pbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHdheXBvaW50LnBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDQsIHBvc2l0aW9uLnksIDQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCA0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlU2VsZWN0ZWRFbnRpdHkodGFyZ2V0OiBQb3MpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoISF0aGlzLmdldEVudGl0eUF0KHRhcmdldCkpIHtcclxuICAgICAgICAgICAgLy8gZW50aXR5IGF0IHBsYWNlXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHdheXBvaW50ID0gdGhpcy5zZWxlY3Rpb24uZ2V0V2F5cG9pbnRBdCh0YXJnZXQpO1xyXG4gICAgICAgIGlmICghd2F5cG9pbnQpIHtcclxuICAgICAgICAgICAgLy8gdGFyZ2V0IG5vdCBpbiByYW5nZVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsaW5lID0gRW50aXR5UmFuZ2UuZ2V0TGluZVRvV2F5cG9pbnQod2F5cG9pbnQpO1xyXG4gICAgICAgIHRoaXMubW92aW5nID0ge1xyXG4gICAgICAgICAgICBlbnRpdHk6IHRoaXMuc2VsZWN0ZWQsXHJcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxyXG4gICAgICAgICAgICBsaW5lOiBsaW5lLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eSgpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGFuaW1hdGVNb3ZpbmdFbnRpdHkoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBtb3ZlID0gdGhpcy5tb3Zpbmc7XHJcbiAgICAgICAgbGV0IGVudGl0eSA9IG1vdmUuZW50aXR5O1xyXG5cclxuICAgICAgICBtb3ZlLnByb2dyZXNzICs9IHN0ZXBzO1xyXG5cclxuICAgICAgICBpZiAobW92ZS5wcm9ncmVzcyA+PSBtb3ZlLmxpbmVbMF0ubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKSB7XHJcbiAgICAgICAgICAgIG1vdmUucHJvZ3Jlc3MgLT0gbW92ZS5saW5lWzBdLmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICAgICAgbW92ZS5saW5lLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChtb3ZlLmxpbmUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgZGlmZiA9IG5ldyBQb3MoMCwgMCkubW92ZShtb3ZlLmxpbmVbMF0uZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgZW50aXR5LndvcmxkUG9zaXRpb24ueCA9IG1vdmUubGluZVswXS5wb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi54ICogbW92ZS5wcm9ncmVzcztcclxuICAgICAgICAgICAgZW50aXR5LndvcmxkUG9zaXRpb24ueSA9IG1vdmUubGluZVswXS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi55ICogbW92ZS5wcm9ncmVzcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbnRpdHkucG9zaXRpb24gPSBtb3ZlLnRhcmdldDtcclxuICAgICAgICAgICAgZW50aXR5LndvcmxkUG9zaXRpb24gPSBtb3ZlLnRhcmdldC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIHRoaXMubW92aW5nID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW50aXR5LnVwZGF0ZShzdGVwcyk7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWF0ZVNlbGVjdGlvbkxheWVyKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmFuaW1fc2VsZWN0aW9uX3Byb2dyZXNzIC8gMTAwICogMHhGRiB8IDA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MudGludCA9ICh2YWx1ZSA8PCAxNikgfCAodmFsdWUgPDwgOCkgfCB2YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9zZWxlY3Rpb25faW5jKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25fcHJvZ3Jlc3MgKz0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1fc2VsZWN0aW9uX3Byb2dyZXNzID49IDEwMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9wcm9ncmVzcyA9IDEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25faW5jID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc2VsZWN0aW9uX3Byb2dyZXNzIC09IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbmltX3NlbGVjdGlvbl9wcm9ncmVzcyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9wcm9ncmVzcyA9IDQwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9pbmMgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYW5pbWF0ZVNlbGVjdGlvbkxpbmUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBpZiAoIWN1cnNvcl9wb3NpdGlvbi5tYXRjaCh0aGlzLmFuaW1fc2VsZWN0aW9uX3BvcykpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9wb3MgPSBjdXJzb3JfcG9zaXRpb247XHJcbiAgICAgICAgICAgIGxldCB3YXlwb2ludCA9IHRoaXMuc2VsZWN0aW9uLmdldFdheXBvaW50QXQoY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhd2F5cG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBsaW5lIGlmIGEgd2F5IHRvIGN1cnNvciBwb3NpdGlvbiBleGlzdHNcclxuICAgICAgICAgICAgICAgIHRoaXMubW92ZV9zcHJpdGUuc2V0V29ybGRQb3NpdGlvbih7eDogKGN1cnNvcl9wb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMSksIHk6IChjdXJzb3JfcG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDEpfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1fc2VsZWN0aW9uX2xpbmUgPSBFbnRpdHlSYW5nZS5nZXRMaW5lVG9XYXlwb2ludCh3YXlwb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLmFuaW1fc2VsZWN0aW9uX2xpbmUpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5hbmltX3NlbGVjdGlvbl9zbG93ICs9IHN0ZXBzO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1fc2VsZWN0aW9uX3Nsb3cgPCA1KSB7IHJldHVybjsgfVxyXG4gICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25fc2xvdyAtPSA1O1xyXG5cclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcy5iZWdpbkZpbGwoMHhmZmZmZmYpO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBwYXJ0IG9mIHRoaXMuYW5pbV9zZWxlY3Rpb25fbGluZSl7XHJcbiAgICAgICAgICAgIHRoaXMuYWRkU2VnbWVudHNGb3JMaW5lUGFydChwYXJ0LCB0aGlzLmFuaW1fc2VsZWN0aW9uX29mZnNldCk7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25fb2Zmc2V0ID0gKHRoaXMuYW5pbV9zZWxlY3Rpb25fb2Zmc2V0ICsgcGFydC5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpICUgKEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgICAgIHRoaXMuYW5pbV9zZWxlY3Rpb25fb2Zmc2V0IC09IDE7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9zZWxlY3Rpb25fb2Zmc2V0IDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc2VsZWN0aW9uX29mZnNldCA9IEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORyAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYWRkU2VnbWVudHNGb3JMaW5lUGFydChwYXJ0OiBMaW5lUGFydCwgb2Zmc2V0OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBwYXJ0Lmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeCA9IChwYXJ0LnBvc2l0aW9uLnggKyAwLjUpICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgIGxldCB5ID0gKHBhcnQucG9zaXRpb24ueSArIDAuNSkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcblxyXG4gICAgICAgIHdoaWxlIChkaXN0YW5jZSA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEg7XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGggLT0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBsZW5ndGgpIHsgbGVuZ3RoID0gZGlzdGFuY2U7IH1cclxuXHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHBhcnQuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzLmRyYXdSZWN0KHggLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCB5IC0gbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgsIGxlbmd0aCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB5IC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcy5kcmF3UmVjdCh4LCB5IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeCArPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcy5kcmF3UmVjdCh4IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgeSwgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRILCBsZW5ndGgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeSArPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcy5kcmF3UmVjdCh4IC0gbGVuZ3RoLCB5IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGlzdGFuY2UgLT0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBJV2F5cG9pbnQge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGNvc3Q6IG51bWJlcjtcclxuICAgIGZvcm06IG51bWJlcjtcclxuICAgIHBhcmVudDogSVdheXBvaW50O1xyXG59XHJcbmludGVyZmFjZSBJT3V0bGluZSB7XHJcbiAgICBzdGFydDogUG9zO1xyXG4gICAgY291cnNlOiBEaXJlY3Rpb25bXTtcclxufVxyXG5jbGFzcyBFbnRpdHlSYW5nZSB7XHJcblxyXG4gICAgc3RhdGljIGdyYXBoaWNzX2xheWVyOiBQaGFzZXIuR3JhcGhpY3M7XHJcblxyXG4gICAgd2F5cG9pbnRzOiBJV2F5cG9pbnRbXTtcclxuICAgIG1hcDogTWFwO1xyXG4gICAgZW50aXR5X21hbmFnZXI6IEVudGl0eU1hbmFnZXI7XHJcblxyXG4gICAgZGlydHk6IGJvb2xlYW47XHJcblxyXG4gICAgb2Zmc2V0OiBudW1iZXI7XHJcbiAgICBwcm9ncmVzczogbnVtYmVyO1xyXG4gICAgZW5kcG9zaXRpb246IFBvcztcclxuICAgIGxpbmU6IExpbmVQYXJ0W107XHJcblxyXG4gICAgc3RhdGljIGZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbjogUG9zLCB3YXlwb2ludHM6IElXYXlwb2ludFtdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2Ygd2F5cG9pbnRzKXtcclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkgeyByZXR1cm4gd2F5cG9pbnQ7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0TGluZVRvV2F5cG9pbnQod2F5cG9pbnQ6IElXYXlwb2ludCk6IExpbmVQYXJ0W10ge1xyXG4gICAgICAgIGxldCBsaW5lOiBMaW5lUGFydFtdID0gW107XHJcbiAgICAgICAgd2hpbGUgKHdheXBvaW50LnBhcmVudCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gd2F5cG9pbnQ7XHJcbiAgICAgICAgICAgIHdheXBvaW50ID0gd2F5cG9pbnQucGFyZW50O1xyXG5cclxuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHdheXBvaW50LnBvc2l0aW9uLmdldERpcmVjdGlvblRvKG5leHQucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAwICYmIGxpbmVbMF0uZGlyZWN0aW9uID09IGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGluZVswXS5wb3NpdGlvbiA9IHdheXBvaW50LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgbGluZVswXS5sZW5ndGgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxpbmUudW5zaGlmdCh7cG9zaXRpb246IHdheXBvaW50LnBvc2l0aW9uLCBkaXJlY3Rpb246IGRpcmVjdGlvbiwgbGVuZ3RoOiAxfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudGl0eTogRW50aXR5LCBtYXA6IE1hcCwgZW50aXR5X21hbmFnZXI6IEVudGl0eU1hbmFnZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlciA9IGVudGl0eV9tYW5hZ2VyO1xyXG5cclxuICAgICAgICAvLyBjb3N0IGZvciBvcmlnaW4gcG9pbnQgaXMgYWx3YXlzIDFcclxuICAgICAgICBsZXQgb3BlbjogSVdheXBvaW50W10gPSBbe3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24sIGNvc3Q6IDEsIGZvcm06IDAsIHBhcmVudDogbnVsbH1dO1xyXG4gICAgICAgIGxldCBjbG9zZWQ6IElXYXlwb2ludFtdID0gW107XHJcbiAgICAgICAgd2hpbGUgKG9wZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IG9wZW4uc2hpZnQoKTtcclxuICAgICAgICAgICAgY2xvc2VkLnB1c2goY3VycmVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYWRqYWNlbnRfcG9zaXRpb25zID0gdGhpcy5tYXAuZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChjdXJyZW50LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcG9zaXRpb24gb2YgYWRqYWNlbnRfcG9zaXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrUG9zaXRpb24ocG9zaXRpb24sIGN1cnJlbnQsIG9wZW4sIGNsb3NlZCwgZW50aXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLndheXBvaW50cyA9IGNsb3NlZDtcclxuICAgICAgICB0aGlzLmFkZEZvcm0oKTtcclxuXHJcbiAgICAgICAgdGhpcy5kaXJ0eSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBjaGVja1Bvc2l0aW9uKHBvc2l0aW9uOiBQb3MsIHBhcmVudDogSVdheXBvaW50LCBvcGVuOiBJV2F5cG9pbnRbXSwgY2xvc2VkOiBJV2F5cG9pbnRbXSwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoISFFbnRpdHlSYW5nZS5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIGNsb3NlZCkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICAgICAgbGV0IG9jY3VwaWVkID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlBdChwb3NpdGlvbik7XHJcbiAgICAgICAgaWYgKCEhb2NjdXBpZWQgJiYgb2NjdXBpZWQuYWxsaWFuY2UgIT0gZW50aXR5LmFsbGlhbmNlKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBsZXQgbmV3X2Nvc3QgPSBwYXJlbnQuY29zdCArIHRoaXMubWFwLmdldENvc3RBdChwb3NpdGlvbiwgZW50aXR5KTtcclxuICAgICAgICBpZiAobmV3X2Nvc3QgPiBlbnRpdHkuZGF0YS5tb3YpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgIGxldCBpbl9vcGVuID0gRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCBvcGVuKTtcclxuICAgICAgICBpZiAoISFpbl9vcGVuKSB7XHJcbiAgICAgICAgICAgIGlmIChpbl9vcGVuLmNvc3QgPD0gbmV3X2Nvc3QpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICAgICAgICAgIGluX29wZW4uY29zdCA9IG5ld19jb3N0O1xyXG4gICAgICAgICAgICBpbl9vcGVuLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wZW4ucHVzaCh7cG9zaXRpb246IHBvc2l0aW9uLCBwYXJlbnQ6IHBhcmVudCwgZm9ybTogMCwgY29zdDogbmV3X2Nvc3R9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIGFkZEZvcm0oKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2YgdGhpcy53YXlwb2ludHMpIHtcclxuICAgICAgICAgICAgd2F5cG9pbnQuZm9ybSA9IDA7XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi55ID4gMCAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlVwKSkpIHsgd2F5cG9pbnQuZm9ybSArPSAxOyB9XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi54IDwgdGhpcy5tYXAud2lkdGggLSAxICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uUmlnaHQpKSkgeyB3YXlwb2ludC5mb3JtICs9IDI7IH1cclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnkgPCB0aGlzLm1hcC5oZWlnaHQgLSAxICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uRG93bikpKSB7IHdheXBvaW50LmZvcm0gKz0gNDsgfVxyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueCA+IDAgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5MZWZ0KSkpIHsgd2F5cG9pbnQuZm9ybSArPSA4OyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0V2F5cG9pbnRBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgcmV0dXJuIEVudGl0eVJhbmdlLmZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbiwgdGhpcy53YXlwb2ludHMpO1xyXG4gICAgfVxyXG4gICAgaGFzV2F5cG9pbnRBdChwb3NpdGlvbjogUG9zKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0V2F5cG9pbnRBdChwb3NpdGlvbikgIT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLm9mZnNldCArPSBzdGVwcztcclxuICAgICAgICB0aGlzLnByb2dyZXNzICs9IHN0ZXBzO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNXYXlwb2ludEF0KGN1cnNvcl9wb3NpdGlvbikgJiYgKCF0aGlzLmVuZHBvc2l0aW9uIHx8ICF0aGlzLmVuZHBvc2l0aW9uLm1hdGNoKGN1cnNvcl9wb3NpdGlvbikpKSB7XHJcbiAgICAgICAgICAgIC8vIGN1cnNvciBwb3NpdGlvbiBjaGFuZ2VkIGFuZCBjdXJzb3IgaXMgaW5zaWRlIHdheXBvaW50c1xyXG4gICAgICAgICAgICB0aGlzLmVuZHBvc2l0aW9uID0gY3Vyc29yX3Bvc2l0aW9uO1xyXG4gICAgICAgICAgICBsZXQgZW5kcG9pbnQgPSB0aGlzLmdldFdheXBvaW50QXQoY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5saW5lID0gRW50aXR5UmFuZ2UuZ2V0TGluZVRvV2F5cG9pbnQoZW5kcG9pbnQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlydHkpIHtcclxuICAgICAgICAgICAgLy8gZHJhdyBsYXllciBmb3IgdGhlIGZpcnN0IHRpbWVcclxuICAgICAgICAgICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRyYXcgTGF5ZXJcIik7XHJcbiAgICAgICAgICAgIEVudGl0eVJhbmdlLmdyYXBoaWNzX2xheWVyLmNsZWFyKCk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgU21va2VNYW5hZ2VyIHtcclxuICAgIHNtb2tlOiBTbW9rZVtdO1xyXG4gICAgbWFwOiBNYXA7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGFuaW1fc2xvdzogbnVtYmVyO1xyXG4gICAgYW5pbV9zdGF0ZTogbnVtYmVyO1xyXG4gICAgYW5pbV9vZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX29mZnNldCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuc21va2UgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBob3VzZSBvZiBtYXAuZ2V0T2NjdXBpZWRIb3VzZXMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNtb2tlKGhvdXNlLnBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jcmVhdGVTbW9rZShuZXcgUG9zKDMsIDEzKSk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVTbW9rZShwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgdGhpcy5zbW9rZS5wdXNoKG5ldyBTbW9rZShwb3NpdGlvbiwgdGhpcy5ncm91cCwgXCJiX3Ntb2tlXCIsIFswLCAxLCAyLCAzXSkpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9zbG93IDwgNSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbV9zbG93ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX29mZnNldCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMjcpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltX29mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMjIgJiYgdGhpcy5hbmltX3N0YXRlID09IDMpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gNDtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMTcgJiYgdGhpcy5hbmltX3N0YXRlID09IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMztcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAxMiAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDcgJiYgdGhpcy5hbmltX3N0YXRlID09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHNtb2tlIG9mIHRoaXMuc21va2UpIHtcclxuICAgICAgICAgICAgc21va2Uuc2V0RnJhbWUodGhpcy5hbmltX3N0YXRlKTtcclxuICAgICAgICAgICAgc21va2Uud29ybGRQb3NpdGlvbi55ID0gc21va2UucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIHRoaXMuYW5pbV9vZmZzZXQgLSAyO1xyXG4gICAgICAgICAgICBzbW9rZS51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbiIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgZnJhbWVzOiBudW1iZXJbXTtcclxuXHJcbiAgICBzcHJpdGU6IFBoYXNlci5TcHJpdGU7XHJcbiAgICB3b3JsZFBvc2l0aW9uOiBJUG9zO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdvcmxkX3Bvc2l0aW9uOiBJUG9zLCBncm91cDogUGhhc2VyLkdyb3VwLCBuYW1lOiBzdHJpbmcsIGZyYW1lczogbnVtYmVyW10gPSBbXSkge1xyXG5cclxuICAgICAgICB0aGlzLndvcmxkUG9zaXRpb24gPSB3b3JsZF9wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcclxuXHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBncm91cC5nYW1lLmFkZC5zcHJpdGUodGhpcy53b3JsZFBvc2l0aW9uLngsIHRoaXMud29ybGRQb3NpdGlvbi55LCB0aGlzLm5hbWUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbMF07XHJcbiAgICAgICAgZ3JvdXAuYWRkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZShmcmFtZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWUgPSB0aGlzLmZyYW1lc1tmcmFtZSAlIHRoaXMuZnJhbWVzLmxlbmd0aF07XHJcbiAgICB9XHJcbiAgICBzZXRXb3JsZFBvc2l0aW9uKHdvcmxkX3Bvc2l0aW9uOiBJUG9zKSB7XHJcbiAgICAgICAgdGhpcy53b3JsZFBvc2l0aW9uID0gd29ybGRfcG9zaXRpb247XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyID0gMSkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnggPSB0aGlzLndvcmxkUG9zaXRpb24ueDtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy53b3JsZFBvc2l0aW9uLnk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmRlc3Ryb3koKTtcclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBTbW9rZSBleHRlbmRzIFNwcml0ZSB7XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFBvcywgZ3JvdXA6IFBoYXNlci5Hcm91cCwgbmFtZTogc3RyaW5nLCBmcmFtZXM6IG51bWJlcltdKSB7XHJcbiAgICAgICAgc3VwZXIobmV3IFBvcyhwb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgMTYsIHBvc2l0aW9uLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpLCBncm91cCwgbmFtZSwgZnJhbWVzKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEVudGl0eURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgbW92OiBudW1iZXI7XHJcbiAgICBhdGs6IG51bWJlcjtcclxuICAgIGRlZjogbnVtYmVyO1xyXG4gICAgbWF4OiBudW1iZXI7XHJcbiAgICBtaW46IG51bWJlcjtcclxuICAgIGNvc3Q6IG51bWJlcjtcclxuICAgIGJhdHRsZV9wb3NpdGlvbnM6IElQb3NbXTtcclxuICAgIGZsYWdzOiBFbnRpdHlGbGFncztcclxufVxyXG5lbnVtIEVudGl0eUZsYWdzIHtcclxuICAgIE5vbmUgPSAwLCAvLyBHb2xlbSwgU2tlbGV0b25cclxuICAgIEZseWluZyA9IDEsXHJcbiAgICBXYXRlckJvb3N0ID0gMixcclxuICAgIENhbkJ1eSA9IDQsXHJcbiAgICBDYW5PY2N1cHlIb3VzZSA9IDgsXHJcbiAgICBDYW5PY2N1cHlDYXN0bGUgPSAxNixcclxuICAgIENhblJhaXNlID0gMzIsXHJcbiAgICBBbnRpRmx5aW5nID0gNjQsXHJcbiAgICBDYW5Qb2lzb24gPSAxMjgsXHJcbiAgICBDYW5XaXNwID0gMjU2LFxyXG4gICAgQ2FudEF0dGFja0FmdGVyTW92aW5nID0gNTEyXHJcbn1cclxuaW50ZXJmYWNlIElFbnRpdHkge1xyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbn1cclxuZW51bSBFbnRpdHlUeXBlIHtcclxuICAgIFNvbGRpZXIsXHJcbiAgICBBcmNoZXIsXHJcbiAgICBMaXphcmQsXHJcbiAgICBXaXphcmQsXHJcbiAgICBXaXNwLFxyXG4gICAgU3BpZGVyLFxyXG4gICAgR29sZW0sXHJcbiAgICBDYXRhcHVsdCxcclxuICAgIFd5dmVybixcclxuICAgIEtpbmcsXHJcbiAgICBTa2VsZXRvblxyXG59XHJcbmVudW0gRW50aXR5U3RhdHVzIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgUG9pc29uZWQgPSAxIDw8IDAsXHJcbiAgICBXaXNwZWQgPSAxIDw8IDFcclxufVxyXG5lbnVtIEVudGl0eVN0YXRlIHtcclxuICAgIFJlYWR5ID0gMCxcclxuICAgIE1vdmVkID0gMSxcclxuICAgIERlYWQgPSAyXHJcbn1cclxuXHJcbmNsYXNzIEVudGl0eSBleHRlbmRzIFNwcml0ZSB7XHJcblxyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBkYXRhOiBFbnRpdHlEYXRhO1xyXG5cclxuICAgIGhlYWx0aDogbnVtYmVyO1xyXG4gICAgcmFuazogbnVtYmVyO1xyXG4gICAgZXA6IG51bWJlcjtcclxuXHJcbiAgICBzdGF0dXM6IEVudGl0eVN0YXR1cztcclxuICAgIHN0YXRlOiBFbnRpdHlTdGF0ZTtcclxuXHJcbiAgICBhdGtfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBkZWZfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBtb3ZfYm9vc3Q6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogRW50aXR5VHlwZSwgYWxsaWFuY2U6IEFsbGlhbmNlLCBwb3NpdGlvbjogUG9zLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIocG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpLCBncm91cCwgXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSwgW3R5cGUsIHR5cGUgKyBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5sZW5ndGhdKTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbdHlwZV07XHJcbiAgICAgICAgdGhpcy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwO1xyXG4gICAgICAgIHRoaXMucmFuayA9IDA7XHJcbiAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAwO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuICAgIH1cclxuICAgIGRpZFJhbmtVcCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5yYW5rIDwgMyAmJiB0aGlzLmVwID49IDc1IDw8IHRoaXMucmFuaykge1xyXG4gICAgICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICAgICAgdGhpcy5yYW5rKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBhdHRhY2sodGFyZ2V0OiBFbnRpdHksIG1hcDogTWFwKSB7XHJcblxyXG4gICAgICAgIGxldCBuOiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8vIGdldCBiYXNlIGRhbWFnZVxyXG4gICAgICAgIGxldCBhdGsgPSB0aGlzLmRhdGEuYXRrICsgdGhpcy5hdGtfYm9vc3Q7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5VHlwZS5BcmNoZXIgJiYgdGFyZ2V0LnR5cGUgPT0gRW50aXR5VHlwZS5XeXZlcm4pIHtcclxuICAgICAgICAgICAgYXRrICs9IDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50eXBlID09IEVudGl0eVR5cGUuV2lzcCAmJiB0YXJnZXQudHlwZSA9PSBFbnRpdHlUeXBlLlNrZWxldG9uKSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIHRoaXMucmFuaztcclxuICAgICAgICBpZiAobiA+IDE5KSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuID49IDE3KSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAxO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xOSkge1xyXG4gICAgICAgICAgICBhdGsgLT0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTcpIHtcclxuICAgICAgICAgICAgYXRrIC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGVmID0gdGFyZ2V0LmRhdGEuZGVmICsgdGFyZ2V0LmRlZl9ib29zdDtcclxuXHJcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDIwKSArIHRhcmdldC5yYW5rO1xyXG5cclxuICAgICAgICBpZiAobiA+IDE5KSB7XHJcbiAgICAgICAgICAgIGRlZiArPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuID49IDE3KSB7XHJcbiAgICAgICAgICAgIGRlZiArPSAxO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xOSkge1xyXG4gICAgICAgICAgICBkZWYgLT0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTcpIHtcclxuICAgICAgICAgICAgZGVmIC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVkX2hlYWx0aCA9IE1hdGguZmxvb3IoKGF0ayAtIChkZWYgKyBtYXAuZ2V0RGVmQXQodGFyZ2V0LnBvc2l0aW9uLCB0YXJnZXQpKSAqICgyIC8gMykpICogdGhpcy5oZWFsdGggLyAxMCk7XHJcbiAgICAgICAgaWYgKHJlZF9oZWFsdGggPiB0YXJnZXQuaGVhbHRoKSB7XHJcbiAgICAgICAgICAgIHJlZF9oZWFsdGggPSB0YXJnZXQuaGVhbHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0YXJnZXQuaGVhbHRoID0gdGFyZ2V0LmhlYWx0aCAtIHJlZF9oZWFsdGg7XHJcbiAgICAgICAgdGhpcy5lcCArPSAodGFyZ2V0LmRhdGEuYXRrICsgdGFyZ2V0LmRhdGEuZGVmKSAqIHJlZF9oZWFsdGg7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVTdGF0dXMoKSB7XHJcbiAgICAgICAgdGhpcy5hdGtfYm9vc3QgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVmX2Jvb3N0ID0gMDtcclxuICAgICAgICB0aGlzLm1vdl9ib29zdCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzICYgRW50aXR5U3RhdHVzLlBvaXNvbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXRrX2Jvb3N0LS07XHJcbiAgICAgICAgICAgIHRoaXMuZGVmX2Jvb3N0LS07XHJcbiAgICAgICAgICAgIHRoaXMubW92X2Jvb3N0LS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyAmIEVudGl0eVN0YXR1cy5XaXNwZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hdGtfYm9vc3QrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXRTdGF0dXMoc3RhdHVzOiBFbnRpdHlTdGF0dXMpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyB8PSBzdGF0dXM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0dXMoKTtcclxuICAgIH1cclxuICAgIGNsZWFyU3RhdHVzKHN0YXR1czogRW50aXR5U3RhdHVzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgJj0gfnN0YXR1cztcclxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXR1cygpO1xyXG4gICAgfVxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLm5hbWUgKyBcIiwgYWxsaWFuY2UgXCIgKyB0aGlzLmFsbGlhbmNlICsgXCI6IFwiICsgdGhpcy5wb3NpdGlvbi54ICsgXCIgLSBcIiArIHRoaXMucG9zaXRpb24ueTtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgRnJhbWVSZWN0IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuICAgIFtrZXk6IHN0cmluZ106IG51bWJlcjtcclxufVxyXG5lbnVtIEZyYW1lQW5pbWF0aW9uIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgU2hvdyA9IDEsXHJcbiAgICBIaWRlID0gMixcclxuICAgIENoYW5nZSA9IDQsXHJcbiAgICBXaXJlID0gOCxcclxuICAgIERlc3Ryb3kgPSAxNixcclxuICAgIFVwZGF0ZSA9IDMyXHJcbn1cclxuY2xhc3MgRnJhbWUge1xyXG4gICAgc3RhdGljIEJPUkRFUl9TSVpFOiBudW1iZXIgPSAyNDtcclxuICAgIHN0YXRpYyBBTklNX1NURVBTOiBudW1iZXIgPSAxNTtcclxuXHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgYm9yZGVyX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBjb250ZW50X2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG5cclxuICAgIHJldXNlX3RpbGVzOiBQaGFzZXIuSW1hZ2VbXTtcclxuXHJcbiAgICBhbGlnbjogRGlyZWN0aW9uO1xyXG4gICAgYW5pbWF0aW9uX2RpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgYm9yZGVyOiBEaXJlY3Rpb247XHJcblxyXG4gICAgYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbjtcclxuXHJcbiAgICBnYW1lX3dpZHRoOiBudW1iZXI7XHJcbiAgICBnYW1lX2hlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50OiBGcmFtZVJlY3Q7XHJcbiAgICB0YXJnZXQ6IEZyYW1lUmVjdDtcclxuICAgIHNwZWVkOiBGcmFtZVJlY3Q7XHJcbiAgICBhY2M6IEZyYW1lUmVjdDtcclxuICAgIHByaXZhdGUgbmV3X2FsaWduOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19ib3JkZXI6IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGU6IGJvb2xlYW47XHJcblxyXG4gICAgc3RhdGljIGdldFJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNvcHlSZWN0KGZyOiBGcmFtZVJlY3QpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIHJldHVybiB7eDogZnIueCwgeTogZnIueSwgd2lkdGg6IGZyLndpZHRoLCBoZWlnaHQ6IGZyLmhlaWdodH07XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA3O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIGFsaWduOiBEaXJlY3Rpb24sIGJvcmRlcjogRGlyZWN0aW9uLCBhbmltX2Rpcj86IERpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYWxpZ24gPSBhbGlnbjtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPSB0eXBlb2YgYW5pbV9kaXIgIT0gXCJ1bmRlZmluZWRcIiA/IGFuaW1fZGlyIDogYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSBib3JkZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmdyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmJvcmRlcl9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVfd2lkdGggPSB0aGlzLmdyb3VwLmdhbWUud2lkdGg7XHJcbiAgICAgICAgdGhpcy5nYW1lX2hlaWdodCA9IHRoaXMuZ3JvdXAuZ2FtZS5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgaWYgKGFuaW1hdGUpIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHN0YXJ0aW5nIG9mZnNldCB1c2luZyB0aGUgYW5pbV9kaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5TaG93O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5XaXJlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlU3BlZWQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcblxyXG4gICAgICAgIGlmICghYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uSGlkZTtcclxuICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uRGVzdHJveTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uVXBkYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy53aWR0aCA9PSB3aWR0aCAmJiB0aGlzLmhlaWdodCA9PSBoZWlnaHQpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvbGRfd2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGxldCBvbGRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLkNoYW5nZTtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGFrZSB0aGUgYmlnZ2VzdCByZWN0IHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIG9sZF93aWR0aCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgb2xkX2hlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuY3VycmVudCBpcyB0aGUgb2xkIHJlY3QgKG9mZnNldCAmIHNpemUpXHJcbiAgICAgICAgLy8gdXBkYXRlIHRoaXMuY3VycmVudCBzbyB0aGUgc2FtZSBwb3J0aW9uIG9mIHRoZSBmcmFtZSBpcyByZW5kZXJlZCwgYWx0aG91Z2ggaXQgY2hhbmdlZCBpbiBzaXplXHJcbiAgICAgICAgLy8gY2hhbmdlIHRhcmdldCB0byBhbGlnbm1lbnQgcG9zaXRpb24gZm9yIGNoYW5nZWQgcmVjdFxyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC54IC09IHdpZHRoIC0gb2xkX3dpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC54IC09IHdpZHRoIC0gdGhpcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC55IC09IGhlaWdodCAtIG9sZF9oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgLT0gaGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZURpcmVjdGlvbnMoYWxpZ246IERpcmVjdGlvbiwgYm9yZGVyOiBEaXJlY3Rpb24sIGFuaW1fZGlyZWN0aW9uOiBEaXJlY3Rpb24sIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5uZXdfYWxpZ24gPT09IGFsaWduICYmIHRoaXMubmV3X2JvcmRlciA9PSBib3JkZXIgJiYgdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbiA9PSBhbmltX2RpcmVjdGlvbiAmJiB0aGlzLm5ld19hbmltYXRlID09IGFuaW1hdGUpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMubmV3X2FsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5uZXdfYm9yZGVyID0gYm9yZGVyO1xyXG4gICAgICAgIHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb24gPSBhbmltX2RpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLm5ld19hbmltYXRlID0gYW5pbWF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlKHRydWUsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24gPT0gRnJhbWVBbmltYXRpb24uTm9uZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX3ggPSB0aGlzLmFkZEdhaW4oXCJ4XCIsIHN0ZXBzKTtcclxuICAgICAgICBsZXQgZmluaXNoZWRfeSA9IHRoaXMuYWRkR2FpbihcInlcIiwgc3RlcHMpO1xyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfd2lkdGggPSB0cnVlO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF9oZWlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIHNpemUgd2l0aCB0aGUgd2lyZSBhbmltYXRpb25cclxuICAgICAgICAgICAgZmluaXNoZWRfd2lkdGggPSB0aGlzLmFkZEdhaW4oXCJ3aWR0aFwiLCBzdGVwcyk7XHJcbiAgICAgICAgICAgIGZpbmlzaGVkX2hlaWdodCA9IHRoaXMuYWRkR2FpbihcImhlaWdodFwiLCBzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmluaXNoZWRfeCAmJiBmaW5pc2hlZF95ICYmIGZpbmlzaGVkX3dpZHRoICYmIGZpbmlzaGVkX2hlaWdodCkge1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkhpZGUpID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5DaGFuZ2UpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIHVwZGF0ZSBjdXJyZW50IG9mZnNldCBhbmQgcmVtb3ZlIHRpbGVzIG91dCBvZiBzaWdodFxyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQud2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnggPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQueSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5IaWRlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uRGVzdHJveSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5VcGRhdGUpICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFwcGx5RGlyZWN0aW9ucygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgLy8gbmljZSBhbmltYXRpb24gZm9yIGZyYW1lIHdpdGggbm8gYWxpZ25tZW50ICYgbm8gYW5pbWF0aW9uIGRpcmVjdGlvblxyXG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MubGluZVN0eWxlKDEsIDB4ZmZmZmZmKTtcclxuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3UmVjdCgwLCAwLCB0aGlzLmN1cnJlbnQud2lkdGgsIHRoaXMuY3VycmVudC5oZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgfVxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYXBwbHlEaXJlY3Rpb25zKCkge1xyXG4gICAgICAgIHRoaXMuYWxpZ24gPSB0aGlzLm5ld19hbGlnbjtcclxuICAgICAgICB0aGlzLmJvcmRlciA9IHRoaXMubmV3X2JvcmRlcjtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPSB0aGlzLm5ld19hbmltYXRpb25fZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMuY3VycmVudCA9IHRoaXMuZ2V0UmV0cmFjdGVkUmVjdCgpO1xyXG4gICAgICAgIHRoaXMuc2hvdyh0aGlzLm5ld19hbmltYXRlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEFsaWdubWVudFJlY3QoKTogRnJhbWVSZWN0IHtcclxuICAgICAgICAvLyBjYWxjdWxhdGUgdGhlIG9mZnNldCB1c2luZyB0aGUgYWxpZ25tZW50XHJcbiAgICAgICAgbGV0IHJlY3QgPSBGcmFtZS5nZXRSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gdGhpcy5nYW1lX3dpZHRoIC0gdGhpcy53aWR0aDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWN0LnggPSBNYXRoLmZsb29yKCh0aGlzLmdhbWVfd2lkdGggLSB0aGlzLndpZHRoKSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC55ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC55ID0gdGhpcy5nYW1lX2hlaWdodCAtIHRoaXMuaGVpZ2h0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IE1hdGguZmxvb3IoKHRoaXMuZ2FtZV9oZWlnaHQgLSB0aGlzLmhlaWdodCkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlY3Q7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRSZXRyYWN0ZWRSZWN0KCk6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiA9PSBEaXJlY3Rpb24uTm9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gRnJhbWUuZ2V0UmVjdChNYXRoLmZsb29yKHRoaXMuZ2FtZV93aWR0aCAvIDIpLCBNYXRoLmZsb29yKHRoaXMuZ2FtZV9oZWlnaHQgLyAyKSwgMCwgMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuZ2V0QWxpZ25tZW50UmVjdCgpO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gLXRoaXMud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IHRoaXMuZ2FtZV93aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC55ID0gLXRoaXMuaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IHRoaXMuZ2FtZV9oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXQoKSB7XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLmN1cnJlbnQueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMuY3VycmVudC55O1xyXG5cclxuICAgICAgICBsZXQgY194ID0gMDtcclxuICAgICAgICBsZXQgY195ID0gMDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY194ID0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX3kgPSA2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAueCA9IHg7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAueSA9IHk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnggPSB4ICsgY194O1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC55ID0geSArIGNfeTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0ZyYW1lKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGxldCBjX3dpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgbGV0IGNfaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX3dpZHRoIC09IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgY193aWR0aCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfaGVpZ2h0IC09IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICBjX2hlaWdodCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0aGlzLmNvbnRlbnRfZ3JvdXAud2lkdGggPSBjX3dpZHRoO1xyXG4gICAgICAgIC8vIHRoaXMuY29udGVudF9ncm91cC5oZWlnaHQgPSBjX2hlaWdodDtcclxuXHJcbiAgICAgICAgbGV0IHNob3dfdGlsZXNfeCA9IE1hdGguY2VpbCh3aWR0aCAvIEZyYW1lLkJPUkRFUl9TSVpFKSAtIDI7XHJcbiAgICAgICAgbGV0IHNob3dfdGlsZXNfeSA9IE1hdGguY2VpbChoZWlnaHQgLyBGcmFtZS5CT1JERVJfU0laRSkgLSAyO1xyXG5cclxuICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMCk7XHJcbiAgICAgICAgdGhpcy5ncmFwaGljcy5iZWdpbkZpbGwoMHhjZWJlYTUpO1xyXG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIGxldCB0aWxlczogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG93X3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgMCwgRGlyZWN0aW9uLlVwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIERpcmVjdGlvbi5Eb3duKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0X3ggKz0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNob3dfdGlsZXNfeTsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgb2Zmc2V0X3ksIERpcmVjdGlvbi5MZWZ0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgb2Zmc2V0X3ksIERpcmVjdGlvbi5SaWdodCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9mZnNldF95ICs9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IHRpbGVzO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVGcmFtZSgpIHtcclxuICAgICAgICB0aGlzLmdyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Qm9yZGVyVGlsZSh4OiBudW1iZXIsIHk6IG51bWJlciwgZGlyZWN0aW9uOiBEaXJlY3Rpb24pIHtcclxuICAgICAgICBsZXQgcmV1c2U6IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmV1c2VfdGlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXVzZSA9IHRoaXMucmV1c2VfdGlsZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcmV1c2UuYnJpbmdUb1RvcCgpO1xyXG4gICAgICAgICAgICByZXVzZS54ID0geDtcclxuICAgICAgICAgICAgcmV1c2UueSA9IHk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV1c2UgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKHgsIHksIFwibWVudVwiLCBudWxsLCB0aGlzLmJvcmRlcl9ncm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldXNlLmZyYW1lID0gRnJhbWUuZ2V0VGlsZUZvckRpcmVjdGlvbihkaXJlY3Rpb24pO1xyXG4gICAgICAgIHJldHVybiByZXVzZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYWRkR2Fpbih2YXJfbmFtZTogc3RyaW5nLCBzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3BlZWRbdmFyX25hbWVdID09IDApIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgICAgICAgdGhpcy5hY2NbdmFyX25hbWVdICs9IHRoaXMuc3BlZWRbdmFyX25hbWVdICogc3RlcHM7XHJcblxyXG4gICAgICAgIGxldCBkID0gTWF0aC5mbG9vcih0aGlzLmFjY1t2YXJfbmFtZV0pO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gKz0gZDtcclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gLT0gZDtcclxuICAgICAgICBpZiAoZCA8IDAgJiYgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSA8IHRoaXMudGFyZ2V0W3Zhcl9uYW1lXSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID0gdGhpcy50YXJnZXRbdmFyX25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9ZWxzZSBpZiAoZCA+IDAgJiYgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSA+IHRoaXMudGFyZ2V0W3Zhcl9uYW1lXSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID0gdGhpcy50YXJnZXRbdmFyX25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTcGVlZCgpIHtcclxuICAgICAgICB0aGlzLnNwZWVkID0gRnJhbWUuZ2V0UmVjdCgodGhpcy50YXJnZXQueCAtIHRoaXMuY3VycmVudC54KSAvIEZyYW1lLkFOSU1fU1RFUFMsICh0aGlzLnRhcmdldC55IC0gdGhpcy5jdXJyZW50LnkpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LndpZHRoIC0gdGhpcy5jdXJyZW50LndpZHRoKSAvIEZyYW1lLkFOSU1fU1RFUFMsICh0aGlzLnRhcmdldC5oZWlnaHQgLSB0aGlzLmN1cnJlbnQuaGVpZ2h0KSAvIEZyYW1lLkFOSU1fU1RFUFMpO1xyXG4gICAgICAgIHRoaXMuYWNjID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCAwLCAwKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcmVtb3ZlVGlsZXMoKSB7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMucmV1c2VfdGlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgdGlsZSA9IHRoaXMucmV1c2VfdGlsZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgdGlsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2ZW5kb3IvcGhhc2VyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJsb2FkZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicG5nbG9hZGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1haW5tZW51LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdhbWVjb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1hcC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0aWxlbWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHltYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImVudGl0eXJhbmdlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNtb2tlbWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzcHJpdGUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic21va2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZyYW1lLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFlZm9udC50c1wiIC8+XHJcbmNsYXNzIEFuY2llbnRFbXBpcmVzIHtcclxuXHJcbiAgICBzdGF0aWMgVElMRV9TSVpFOiBudW1iZXIgPSAyNDtcclxuICAgIHN0YXRpYyBFTlRJVElFUzogRW50aXR5RGF0YVtdO1xyXG5cclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfTEVOR1RIID0gMTA7XHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX1dJRFRIID0gNDtcclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfU1BBQ0lORyA9IDI7XHJcblxyXG4gICAgc3RhdGljIE5VTUJFUl9PRl9USUxFUzogbnVtYmVyID0gMjM7XHJcbiAgICBzdGF0aWMgVElMRVNfUFJPUDogVGlsZVtdO1xyXG5cclxuICAgIHN0YXRpYyBnYW1lOiBQaGFzZXIuR2FtZTtcclxuICAgIGxvYWRlcjogTG9hZGVyO1xyXG4gICAgbWFpbk1lbnU6IE1haW5NZW51O1xyXG4gICAgY29udHJvbGxlcjogR2FtZUNvbnRyb2xsZXI7XHJcblxyXG4gICAgd2lkdGg6IG51bWJlciA9IDE3NjtcclxuICAgIGhlaWdodDogbnVtYmVyID0gIDIwNDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkaXZfaWQ6IHN0cmluZykge1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIFBoYXNlci5BVVRPLCBkaXZfaWQsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMubG9hZGVyID0gbmV3IExvYWRlcigpO1xyXG4gICAgICAgIHRoaXMubWFpbk1lbnUgPSBuZXcgTWFpbk1lbnUoKTtcclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgR2FtZUNvbnRyb2xsZXIoKTtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJMb2FkZXJcIiwgdGhpcy5sb2FkZXIpO1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiTWFpbk1lbnVcIiwgdGhpcy5tYWluTWVudSk7XHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJHYW1lXCIsIHRoaXMuY29udHJvbGxlcik7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuc3RhcnQoXCJMb2FkZXJcIik7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuIiwiY2xhc3MgRnJhbWVNYW5hZ2VyIHtcclxuICAgIGZyYW1lczogRnJhbWVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xyXG4gICAgfVxyXG4gICAgYWRkRnJhbWUoZnJhbWU6IEZyYW1lKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChmcmFtZSk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVGcmFtZShmcmFtZTogRnJhbWUpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZnJhbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChmcmFtZSA9PSB0aGlzLmZyYW1lc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgZnJhbWUuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXMuc3BsaWNlKGkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIGZvciAobGV0IGZyYW1lIG9mIHRoaXMuZnJhbWVzKSB7XHJcbiAgICAgICAgICAgIGZyYW1lLnVwZGF0ZShzdGVwcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIE1lbnVHb2xkSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBnb2xkX2Ftb3VudDogQUVGb250O1xyXG4gICAgaGVhZF9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgaGVhZF9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg2NCwgNDAsIGdyb3VwLCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgLy8gZHJhdyBjb250ZW50XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudChhbGxpYW5jZTogQWxsaWFuY2UsIGdvbGQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvcm1hdGlvbiBpbnNpZGUgbWVudVxyXG5cclxuICAgICAgICBsZXQgY29sb3I6IG51bWJlcjtcclxuICAgICAgICBsZXQgZnJhbWU6IG51bWJlcjtcclxuICAgICAgICBsZXQgeDogbnVtYmVyO1xyXG4gICAgICAgIGlmIChhbGxpYW5jZSA9PSBBbGxpYW5jZS5CbHVlKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gMHgwMDAwZmY7XHJcbiAgICAgICAgICAgIGZyYW1lID0gMDtcclxuICAgICAgICAgICAgeCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29sb3IgPSAweGZmMDAwMDtcclxuICAgICAgICAgICAgZnJhbWUgPSAxO1xyXG4gICAgICAgICAgICB4ID0gMjU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuYmVnaW5GaWxsKGNvbG9yKTtcclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMTcsIHRoaXMud2lkdGgsIDE3KTtcclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG5cclxuICAgICAgICB0aGlzLmhlYWRfaWNvbi5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLnggPSB4O1xyXG5cclxuICAgICAgICB0aGlzLmdvbGRfYW1vdW50LnNldFRleHQoZ29sZC50b1N0cmluZygpKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBjb250ZW50IChzcHJpdGVzLCB0ZXh0IGV0YylcclxuXHJcbiAgICAgICAgdGhpcy5oZWFkX2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDIsIDIsIFwiZ29sZFwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgwLCAxNiwgXCJwb3J0cmFpdFwiLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIGxldCBoZWFkX2Nyb3AgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZSgwLCAxMCwgdGhpcy5oZWFkX2ljb24ud2lkdGgsIDE4KTtcclxuICAgICAgICB0aGlzLmhlYWRfaWNvbi5jcm9wKGhlYWRfY3JvcCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ29sZF9hbW91bnQgPSBuZXcgQUVGb250KDI4LCA1LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWVudURlZkluZm8gZXh0ZW5kcyBGcmFtZSB7XHJcbiAgICBwcml2YXRlIHRpbGVfaWNvbjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBkZWZfYW1vdW50OiBBRUZvbnQ7XHJcbiAgICBwcml2YXRlIGVudGl0eV9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg0MCwgNTIsIGdyb3VwLCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgLy8gZHJhdyBjb250ZW50XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudChwb3NpdGlvbjogUG9zLCBtYXA6IE1hcCwgZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyB1cGRhdGUgaW5mb3JtYXRpb24gaW5zaWRlIG1lbnVcclxuXHJcbiAgICAgICAgbGV0IHRpbGUgPSBtYXAuZ2V0VGlsZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgbGV0IGFsbGlhbmNlID0gbWFwLmdldEFsbGlhbmNlQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aWxlX2ljb24ua2V5ICE9IFwiYnVpbGRpbmdzX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlX2ljb24ubG9hZFRleHR1cmUoXCJidWlsZGluZ3NfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5mcmFtZSA9IHRpbGUgPT0gVGlsZS5Ib3VzZSA/IDAgOiAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVfaWNvbi5rZXkgIT0gXCJ0aWxlczBcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlX2ljb24ubG9hZFRleHR1cmUoXCJ0aWxlczBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aWxlX2ljb24uZnJhbWUgPSBUaWxlTWFuYWdlci5nZXRCYXNlSW1hZ2VJbmRleEZvclRpbGUodGlsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRlZl9hbW91bnQuc2V0VGV4dChNYXAuZ2V0RGVmRm9yVGlsZSh0aWxlLCBlbnRpdHkpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICBpZiAoISFlbnRpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTaXplKDY4LCA1Mik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmVudGl0eV9pY29uLmtleSAhPSBcInVuaXRfaWNvbnNfXCIgKyBlbnRpdHkuYWxsaWFuY2UpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X2ljb24ubG9hZFRleHR1cmUoXCJ1bml0X2ljb25zX1wiICsgZW50aXR5LmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLmZyYW1lID0gZW50aXR5LnR5cGU7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X2ljb24udmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVTaXplKDQwLCA1Mik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X2ljb24udmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIC8vIGluaXRpYWxpemUgY29udGVudCAoc3ByaXRlcywgdGV4dCBldGMpXHJcblxyXG4gICAgICAgIGxldCB0aWxlX2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRpbGVfZ3JhcGhpY3MubGluZVN0eWxlKDEsIDB4MDAwMDAwKTtcclxuICAgICAgICB0aWxlX2dyYXBoaWNzLmRyYXdSZWN0KDYsIDIsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDEsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDEpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVfaWNvbiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNywgMywgXCJ0aWxlczBcIiwgbnVsbCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICBsZXQgdGlsZV9jcm9wID0gbmV3IFBoYXNlci5SZWN0YW5nbGUoMSwgMSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMiwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMik7XHJcbiAgICAgICAgdGhpcy50aWxlX2ljb24uY3JvcCh0aWxlX2Nyb3ApO1xyXG5cclxuICAgICAgICBsZXQgZGVmX2ZvbnQgPSBuZXcgQUVGb250KDcsIDI4LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIGRlZl9mb250LnNldFRleHQoXCJERUZcIik7XHJcblxyXG4gICAgICAgIHRoaXMuZGVmX2Ftb3VudCA9IG5ldyBBRUZvbnQoMTQsIDM3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9pY29uID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgzNSwgMiwgXCJ1bml0X2ljb25zXzFcIiwgbnVsbCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lbnVTaG9wVW5pdHMgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgZW50aXR5X2ltYWdlczogUGhhc2VyLkltYWdlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoNjQsIGdyb3VwLmdhbWUuaGVpZ2h0IC0gNDAsIGdyb3VwLCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGltYWdlIG9mIHRoaXMuZW50aXR5X2ltYWdlcykge1xyXG4gICAgICAgICAgICBpbWFnZS5sb2FkVGV4dHVyZShcInVuaXRfaWNvbnNfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpLCBpbWFnZS5mcmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaW1hZ2VzID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoZGF0YS5jb3N0ID4gMTAwMCkgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHggPSAoaSAlIDIpICogMjcgKyAzO1xyXG4gICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoaSAvIDIpICogMjkgKyA1O1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSh4LCB5LCBcInVuaXRfaWNvbnNfMFwiLCBpLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pbWFnZXMucHVzaChpbWFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
