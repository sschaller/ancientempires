var AEFontStyle;
(function (AEFontStyle) {
    AEFontStyle[AEFontStyle["Bold"] = 0] = "Bold";
    AEFontStyle[AEFontStyle["Large"] = 1] = "Large";
})(AEFontStyle || (AEFontStyle = {}));
var AEFont = (function () {
    function AEFont(x, y, group, style, text) {
        this.x = x;
        this.y = y;
        this.style = style;
        this.text = text || "";
        this.group = group;
        this.letters = [];
        this.draw();
    }
    AEFont.getWidth = function (style, length) {
        if (style == AEFontStyle.Bold) {
            return 7 * length;
        }
        return 10 * length;
    };
    AEFont.getFontIndex = function (style, char) {
        if (style == AEFontStyle.Large) {
            // large font
            if (char >= 48 && char <= 57) {
                return char - 48;
            }
            console.log("Don't recognize char code " + char + " for font large");
            return 0;
        }
        // bold font
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
            console.log("Don't recognize char code " + char + " for font bold");
            return 0;
        }
    };
    AEFont.prototype.setText = function (text) {
        this.text = text;
        this.draw();
    };
    AEFont.prototype.updatePosition = function (x, y) {
        this.x = x;
        this.y = y;
        for (var _i = 0, _a = this.letters; _i < _a.length; _i++) {
            var letter = _a[_i];
            letter.x = x;
            letter.y = y;
            x += letter.width;
        }
    };
    AEFont.prototype.setVisibility = function (visible) {
        for (var _i = 0, _a = this.letters; _i < _a.length; _i++) {
            var letter = _a[_i];
            letter.visible = visible;
        }
    };
    AEFont.prototype.draw = function () {
        var l = [];
        var x = this.x;
        for (var i = 0; i < this.text.length; i++) {
            var char = this.text.charCodeAt(i);
            var index = AEFont.getFontIndex(this.style, char);
            if (index < 0) {
                x += AEFont.getWidth(this.style, 1);
                continue;
            }
            var font_name = void 0;
            if (this.style == AEFontStyle.Bold) {
                font_name = "chars";
            }
            else if (this.style == AEFontStyle.Large) {
                font_name = "lchars";
            }
            var image = void 0;
            if (this.letters.length > 0) {
                image = this.letters.shift();
            }
            else {
                image = AncientEmpires.game.add.image(x, this.y, font_name, null, this.group);
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
    Direction[Direction["All"] = 15] = "All";
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
        this.game.load.bitmapFont("font7", "data/font.png", "data/font.xml");
        this.game.load.binary("data", "data/1.pak", function (key, data) {
            return new Uint8Array(data);
        });
        this.game.load.binary("lang", "data/lang.dat", function (key, data) {
            return new Uint8Array(data);
        });
    };
    Loader.prototype.create = function () {
        var _this = this;
        this.unpackResourceData();
        this.loadEntityData();
        this.loadMapTilesProp();
        this.unpackLangData();
        var waiter = new PNGWaiter(function () {
            _this.game.state.start("MainMenu", false, false, name);
        });
        PNGLoader.loadSpriteSheet(waiter, "tiles0", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "stiles0", 10, 10);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 0);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 1);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 2);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons", 24, 24, 0, 1);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons", 24, 24, 0, 2);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons_s", 10, 10, 0, 1);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons_s", 10, 10, 0, 2);
        PNGLoader.loadSpriteSheet(waiter, "cursor", 26, 26);
        PNGLoader.loadSpriteSheet(waiter, "b_smoke");
        PNGLoader.loadSpriteSheet(waiter, "menu");
        PNGLoader.loadSpriteSheet(waiter, "portrait");
        PNGLoader.loadSpriteSheet(waiter, "chars");
        PNGLoader.loadImage(waiter, "gold");
        PNGLoader.loadImage(waiter, "pointer");
        PNGLoader.loadSpriteSheet(waiter, "redspark");
        PNGLoader.loadSpriteSheet(waiter, "spark");
        PNGLoader.loadSpriteSheet(waiter, "smoke");
        PNGLoader.loadSpriteSheet(waiter, "status");
        PNGLoader.loadSpriteSheet(waiter, "road", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "grass", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "mountain", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "water", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "town", 24, 24);
        PNGLoader.loadImage(waiter, "woods_bg");
        PNGLoader.loadImage(waiter, "hill_bg");
        PNGLoader.loadImage(waiter, "mountain_bg");
        PNGLoader.loadImage(waiter, "bridge_bg");
        PNGLoader.loadImage(waiter, "town_bg");
        PNGLoader.loadImage(waiter, "tombstone");
        PNGLoader.loadImage(waiter, "mask");
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
    Loader.prototype.unpackLangData = function () {
        var array = this.game.cache.getBinary("lang");
        var data = new DataView(array.buffer);
        var index = 0;
        var number = data.getUint32(index);
        index += 4;
        AncientEmpires.LANG = [];
        for (var i = 0; i < number; i++) {
            var len = data.getUint16(index);
            index += 2;
            var text = "";
            for (var j = 0; j < len; j++) {
                text += String.fromCharCode(data.getUint8(index++));
            }
            AncientEmpires.LANG.push(text);
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
        this.game.state.start("Game", true, false, name);
    };
    return MainMenu;
}(Phaser.State));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var InputContext;
(function (InputContext) {
    InputContext[InputContext["Wait"] = 0] = "Wait";
    InputContext[InputContext["Shop"] = 1] = "Shop";
    InputContext[InputContext["Options"] = 2] = "Options";
    InputContext[InputContext["Map"] = 3] = "Map";
    InputContext[InputContext["Selection"] = 4] = "Selection";
    InputContext[InputContext["Animation"] = 5] = "Animation";
    InputContext[InputContext["Ack"] = 6] = "Ack";
})(InputContext || (InputContext = {}));
var GameController = (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        _super.call(this);
        this.acc = 0;
    }
    GameController.prototype.init = function (name, save) {
        this.map = new Map(name);
        this.keys = new Input(this.game.input);
        this.cursor_targets = [];
        try {
            this.turn = save.turn;
            this.gold = save.gold;
            this.map.importBuildings(save.buildings);
            this.map.importEntities(save.entities);
            for (var _i = 0, _a = save.cursors; _i < _a.length; _i++) {
                var target = _a[_i];
                this.cursor_targets.push(new Pos(target.x, target.y));
            }
        }
        catch (e) {
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
        }
    };
    GameController.prototype.loadGame = function () {
        var data = localStorage.getItem("save.rs");
        if (!data) {
            return false;
        }
        if (typeof JSON.parse != "function") {
            console.error("Browser does not support JSON.parse");
            return false;
        }
        var save = JSON.parse(data);
        var name = (save.campaign ? "m" : "s") + save.map;
        this.game.state.start("Game", true, false, name, save);
        return true;
    };
    GameController.prototype.saveGame = function () {
        var cursors = [];
        for (var _i = 0, _a = this.cursor_targets; _i < _a.length; _i++) {
            var target = _a[_i];
            cursors.push({ x: target.x, y: target.y });
        }
        var save = {
            entities: this.entity_manager.exportEntities(),
            buildings: this.map.exportBuildingAlliances(),
            gold: this.gold,
            turn: this.turn,
            campaign: this.map.isCampaign(),
            map: this.map.getMap(),
            cursors: cursors
        };
        console.log(save);
        localStorage.setItem("save.rs", JSON.stringify(save));
    };
    GameController.prototype.create = function () {
        var tilemap = this.game.add.tilemap();
        var tilemap_group = this.game.add.group();
        var smoke_group = this.game.add.group();
        var selection_group = this.game.add.group();
        var entity_group = this.game.add.group();
        var interaction_group = this.game.add.group();
        var cursor_group = this.game.add.group();
        var animation_group = this.game.add.group();
        this.frame_group = this.game.add.group();
        this.frame_group.fixedToCamera = true;
        this.tile_manager = new TileManager(this.map, tilemap, tilemap_group);
        this.smoke_manager = new SmokeManager(this.map, smoke_group);
        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group, animation_group, this);
        this.frame_manager = new FrameManager();
        this.tile_manager.draw();
        this.frame_def_info = new MenuDefInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);
        this.frame_gold_info = new MenuGoldInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_gold_info);
        this.frame_gold_info.show(true);
        this.cursor = new Sprite({ x: 0, y: 0 }, cursor_group, "cursor", [0, 1]);
        this.cursor.setOffset(-1, -1);
        this.camera.x = this.getOffsetX(this.cursor.world_position.x);
        this.camera.y = this.getOffsetY(this.cursor.world_position.y);
        this.anim_cursor_state = 0;
        this.anim_cursor_slow = 0;
        this.context = [InputContext.Map];
        this.keys = new Input(this.game.input);
        if (this.cursor_targets.length < 1) {
            this.cursor_targets.push(this.entity_manager.getKingPosition(Alliance.Blue));
            this.cursor_targets.push(this.entity_manager.getKingPosition(Alliance.Red));
        }
        this.startTurn(this.turn);
        this.showMessage("GAME LOADED");
    };
    GameController.prototype.showMessage = function (text) {
        var menu = new Notification(this.frame_group, text, this);
        this.frame_manager.addFrame(menu);
        menu.show(true);
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
        this.keys.update();
        this.captureInput();
        var cursor_position = this.cursor_target.getWorldPosition();
        var diff_x = cursor_position.x - this.cursor.world_position.x;
        var diff_y = cursor_position.y - this.cursor.world_position.y;
        var dx = 0;
        var dy = 0;
        if (diff_x != 0) {
            dx = Math.floor(diff_x / 4);
            if (dx < 0) {
                dx = Math.max(dx, -4);
                dx = Math.min(dx, -1);
            }
            else {
                dx = Math.min(dx, 4);
                dx = Math.max(dx, 1);
            }
            this.cursor.setWorldPosition({ x: this.cursor.world_position.x + dx, y: this.cursor.world_position.y + dy });
        }
        if (diff_y != 0) {
            dy = Math.floor(diff_y / 4);
            if (dy < 0) {
                dy = Math.max(dy, -4);
                dy = Math.min(dy, -1);
            }
            else {
                dy = Math.min(dy, 4);
                dy = Math.max(dy, 1);
            }
            this.cursor.setWorldPosition({ x: this.cursor.world_position.x + dx, y: this.cursor.world_position.y + dy });
        }
        if (!this.cursor_target.match(this.last_cursor_position)) {
            this.last_cursor_position = this.cursor_target.copy();
            // update def info
            this.frame_def_info.updateContent(this.cursor_target, this.map, this.entity_manager);
        }
        // input
        this.frame_manager.update(steps);
        if (this.context[this.context.length - 1] != InputContext.Map && this.context[this.context.length - 1] != InputContext.Selection && this.context[this.context.length - 1] != InputContext.Animation) {
            return;
        }
        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }
        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);
        this.entity_manager.update(steps, this.cursor_target, this.anim_cursor_state);
        this.updateOffsetForPosition(this.cursor.world_position);
        var info_is_right = (this.frame_gold_info.align & Direction.Right) != 0;
        if (!info_is_right && this.cursor.world_position.x - 1 - this.camera.x <= this.game.width / 2 - 24 - 12) {
            this.frame_gold_info.updateDirections(Direction.Up | Direction.Right, Direction.Left | Direction.Down, Direction.Right, true);
            this.frame_def_info.updateDirections(Direction.Down | Direction.Right, Direction.Left | Direction.Up, Direction.Right, true);
        }
        else if (info_is_right && this.cursor.world_position.x + 1 - this.camera.x >= this.game.width / 2 + 12) {
            this.frame_gold_info.updateDirections(Direction.Up | Direction.Left, Direction.Right | Direction.Down, Direction.Left, true);
            this.frame_def_info.updateDirections(Direction.Down | Direction.Left, Direction.Right | Direction.Up, Direction.Left, true);
        }
    };
    GameController.prototype.entityDidMove = function (entity) {
        var options = this.entity_manager.getEntityOptions(entity, true);
        if (options.length < 1) {
            return;
        }
        this.showOptionMenu(options);
    };
    GameController.prototype.entityDidAnimation = function (entity) {
        this.context.pop();
        this.selected_entity.updateState(EntityState.Moved, true);
        this.deselectEntity();
    };
    GameController.prototype.openMenu = function (context) {
        if (context == InputContext.Wait) {
            this.context.push(context);
        }
        else if (context == InputContext.Shop) {
            this.frame_def_info.hide(true);
        }
        else {
            this.frame_gold_info.hide(true);
            this.frame_def_info.hide(true);
        }
    };
    GameController.prototype.closeMenu = function (context) {
        if (context == InputContext.Wait) {
            this.context.pop();
        }
        var active_context = this.context[this.context.length - 1];
        switch (active_context) {
            case InputContext.Map:
            case InputContext.Selection:
                this.frame_gold_info.show(true);
                this.frame_def_info.show(true);
                break;
            case InputContext.Shop:
                this.frame_gold_info.show(true);
                break;
        }
    };
    GameController.prototype.selectEntity = function (entity) {
        var options = this.entity_manager.getEntityOptions(entity, false);
        // no options mean: not in alliance or already moved
        if (options.length < 1) {
            return false;
        }
        // so method can be used to show options for entity again -> must be same entity as selected
        if (!this.selected_entity) {
            this.selected_entity = entity;
            this.entity_manager.selectEntity(entity);
        }
        else if (this.selected_entity != entity) {
            return false;
        }
        if (options.length > 1) {
            this.showOptionMenu(options);
        }
        else {
            this.selectOption(options[0]);
        }
        return true;
    };
    GameController.prototype.deselectEntity = function (changed) {
        if (changed === void 0) { changed = true; }
        if (!this.selected_entity) {
            return;
        }
        this.cursor_target = this.selected_entity.position.copy();
        this.entity_manager.hideRange();
        this.entity_manager.deselectEntity(this.selected_entity);
        this.last_entity_position = null;
        this.selected_entity = null;
        // if something changed
        if (changed) {
            this.entity_manager.resetWisp(this.turn, true);
            this.frame_def_info.updateContent(this.cursor_target, this.map, this.entity_manager);
        }
    };
    GameController.prototype.nextTurn = function () {
        var next_turn = Alliance.Blue;
        if (this.turn == Alliance.Blue) {
            next_turn = Alliance.Red;
        }
        this.cursor_targets[this.turn == Alliance.Blue ? 0 : 1] = this.cursor_target;
        this.entity_manager.nextTurn(next_turn);
        this.startTurn(next_turn, true);
    };
    GameController.prototype.startTurn = function (alliance, animate) {
        if (animate === void 0) { animate = false; }
        this.turn = alliance;
        this.cursor_target = this.cursor_targets[alliance == Alliance.Blue ? 0 : 1];
        if (!animate) {
            var wp = this.cursor_target.getWorldPosition();
            this.cursor.setWorldPosition(wp);
            this.camera.x = this.getOffsetX(wp.x);
            this.camera.y = this.getOffsetX(wp.y);
        }
        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));
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
    GameController.prototype.setGoldForAlliance = function (alliance, amount) {
        var alliance_id;
        switch (alliance) {
            case Alliance.Blue:
                alliance_id = 0;
                break;
            case Alliance.Red:
                alliance_id = 1;
                break;
        }
        this.gold[alliance_id] = amount;
        if (this.turn == alliance) {
            this.frame_gold_info.updateContent(alliance, amount);
        }
    };
    GameController.prototype.showOptionMenu = function (options) {
        this.options_menu = new MenuOptions(this.frame_group, Direction.Right, options, this);
        this.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    };
    GameController.prototype.showMainMenu = function (actions) {
        this.options_menu = new MenuOptions(this.frame_group, Direction.None, actions, this, Direction.Up);
        this.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    };
    GameController.prototype.selectOption = function (option) {
        switch (option) {
            case Action.OCCUPY:
                this.map.setAllianceAt(this.selected_entity.position, this.selected_entity.alliance);
                this.tile_manager.drawTileAt(this.selected_entity.position);
                this.showMessage("OCCUPIED");
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity();
                break;
            case Action.ATTACK:
                this.context.push(InputContext.Selection);
                this.entity_manager.showRange(EntityRangeType.Attack, this.selected_entity);
                this.cursor_target = this.entity_manager.nextTargetInRange(Direction.None).position.copy();
                this.cursor.hide();
                break;
            case Action.RAISE:
                this.context.push(InputContext.Selection);
                this.entity_manager.showRange(EntityRangeType.Raise, this.selected_entity);
                this.cursor_target = this.entity_manager.nextTargetInRange(Direction.None).position.copy();
                break;
            case Action.MOVE:
                this.entity_manager.showRange(EntityRangeType.Move, this.selected_entity);
                break;
            case Action.BUY:
                this.openShop(this.selected_entity.alliance);
                break;
            case Action.END_MOVE:
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity();
                break;
            case Action.END_TURN:
                this.showMessage("END TURN");
                this.nextTurn();
                break;
            case Action.MAIN_MENU:
                this.showMainMenu(MenuOptions.getMainMenuOptions(true));
                break;
            case Action.MAP:
                this.openMap();
                break;
            case Action.SAVE_GAME:
                this.saveGame();
                this.showMessage(AncientEmpires.LANG[41]);
                break;
            case Action.LOAD_GAME:
                this.loadGame();
                break;
            case Action.SELECT_LEVEL:
                break;
            case Action.SKIRMISH:
                break;
            case Action.EXIT:
                this.game.state.start("MainMenu", true, false);
                break;
            case Action.CANCEL:
                if (!!this.last_entity_position) {
                    // last action was walking. reset entity & set cursor to current position
                    this.cursor_target = this.selected_entity.position;
                    this.entity_manager.moveEntity(this.selected_entity, this.last_entity_position, false);
                    this.last_entity_position = null;
                    this.entity_manager.showRange(EntityRangeType.Move, this.selected_entity);
                }
                else {
                    this.deselectEntity(false);
                }
                break;
            default:
                console.log("Action " + MenuOptions.getOptionString(option) + " not yet implemented");
                break;
        }
    };
    GameController.prototype.updateOffsetForPosition = function (position) {
        var x = position.x + 0.5 * AncientEmpires.TILE_SIZE;
        var y = position.y + 0.5 * AncientEmpires.TILE_SIZE;
        this.updateOffset(x, y);
    };
    GameController.prototype.updateOffset = function (x, y) {
        var offset_x = this.getOffsetX(x);
        var offset_y = this.getOffsetY(y);
        var diff_x = offset_x - this.camera.x;
        var diff_y = offset_y - this.camera.y;
        if (diff_x != 0) {
            var dx = Math.floor(diff_x / 12);
            if (dx < 0) {
                dx = Math.max(dx, -4);
                dx = Math.min(dx, -1);
            }
            else {
                dx = Math.min(dx, 4);
                dx = Math.max(dx, 1);
            }
            this.camera.x += dx;
        }
        if (diff_y != 0) {
            var dy = Math.floor(diff_y / 12);
            if (dy < 0) {
                dy = Math.max(dy, -4);
                dy = Math.min(dy, -1);
            }
            else {
                dy = Math.min(dy, 4);
                dy = Math.max(dy, 1);
            }
            this.camera.y += dy;
        }
    };
    GameController.prototype.getOffsetX = function (x) {
        var offset_x = x - this.game.width / 2;
        if (this.game.width < this.world.width) {
            offset_x = Math.max(offset_x, 0);
            offset_x = Math.min(offset_x, this.world.width - this.game.width);
        }
        else {
            offset_x = (this.game.width - this.world.width) / 2;
        }
        return offset_x;
    };
    GameController.prototype.getOffsetY = function (y) {
        var offset_y = y - this.game.height / 2;
        if (this.game.height < this.world.height) {
            offset_y = Math.max(offset_y, 0);
            offset_y = Math.min(offset_y, this.world.height - this.game.height);
        }
        else {
            offset_y = (this.game.height - this.world.height) / 2;
        }
        return offset_y;
    };
    GameController.prototype.captureInput = function () {
        if (this.keys.all_keys == Key.None) {
            return;
        }
        switch (this.context[this.context.length - 1]) {
            case InputContext.Map:
                var cursor_still = this.cursor.world_position.x % 24 == 0 && this.cursor.world_position.y % 24 == 0;
                if (this.keys.isKeyPressed(Key.Up) && cursor_still && this.cursor_target.y > 0) {
                    this.cursor_target.move(Direction.Up);
                }
                else if (this.keys.isKeyPressed(Key.Right) && cursor_still && this.cursor_target.x < this.map.width - 1) {
                    this.cursor_target.move(Direction.Right);
                }
                else if (this.keys.isKeyPressed(Key.Down) && cursor_still && this.cursor_target.y < this.map.height - 1) {
                    this.cursor_target.move(Direction.Down);
                }
                else if (this.keys.isKeyPressed(Key.Left) && cursor_still && this.cursor_target.x > 0) {
                    this.cursor_target.move(Direction.Left);
                }
                else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.pickPosition(this.cursor_target);
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    var entity = this.selected_entity;
                    this.deselectEntity(false);
                    if (!!entity && entity.position.match(this.entity_manager.getKingPosition(this.turn)) && entity.data.cost <= 1000) {
                        // entity was bought, add gold back and remove entity
                        var gold = this.getGoldForAlliance(this.turn);
                        this.setGoldForAlliance(this.turn, gold + entity.data.cost);
                        this.entity_manager.removeEntity(entity);
                    }
                }
                break;
            case InputContext.Options:
                if (this.keys.isKeyPressed(Key.Up)) {
                    this.keys.clearKeyPressed(Key.Up);
                    this.options_menu.prev();
                }
                else if (this.keys.isKeyPressed(Key.Down)) {
                    this.keys.clearKeyPressed(Key.Down);
                    this.options_menu.next();
                }
                else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    var selected = this.options_menu.getSelected();
                    this.context.pop();
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                    this.selectOption(selected);
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.context.pop();
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                    this.selectOption(Action.CANCEL);
                }
                break;
            case InputContext.Selection:
                if (this.keys.isKeyPressed(Key.Up) && this.cursor_target.y > 0) {
                    this.keys.clearKeyPressed(Key.Up);
                    var entity = this.entity_manager.nextTargetInRange(Direction.Up);
                    this.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Right) && this.cursor_target.x < this.map.width - 1) {
                    this.keys.clearKeyPressed(Key.Right);
                    var entity = this.entity_manager.nextTargetInRange(Direction.Right);
                    this.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Down) && this.cursor_target.y < this.map.height - 1) {
                    this.keys.clearKeyPressed(Key.Down);
                    var entity = this.entity_manager.nextTargetInRange(Direction.Down);
                    this.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Left) && this.cursor_target.x > 0) {
                    this.keys.clearKeyPressed(Key.Left);
                    var entity = this.entity_manager.nextTargetInRange(Direction.Left);
                    this.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.cursor.show();
                    this.context.pop();
                    var entity = this.entity_manager.nextTargetInRange(Direction.None);
                    this.pickEntity(entity);
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.cursor_target = this.selected_entity.position.copy();
                    this.cursor.show();
                    this.context.pop();
                    var entity = this.selected_entity;
                    this.entity_manager.hideRange();
                    this.selectEntity(entity);
                }
                break;
            case InputContext.Shop:
                if (this.keys.isKeyPressed(Key.Up)) {
                    this.keys.clearKeyPressed(Key.Up);
                    this.shop_units.prev(true);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                }
                else if (this.keys.isKeyPressed(Key.Right)) {
                    this.keys.clearKeyPressed(Key.Right);
                    this.shop_units.next(false);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                }
                else if (this.keys.isKeyPressed(Key.Down)) {
                    this.keys.clearKeyPressed(Key.Down);
                    this.shop_units.next(true);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                }
                else if (this.keys.isKeyPressed(Key.Left)) {
                    this.keys.clearKeyPressed(Key.Left);
                    this.shop_units.prev(false);
                    this.shop_info.updateContent(this.shop_units.getSelected());
                }
                else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    var entity_type = this.shop_units.getSelected();
                    var data = AncientEmpires.ENTITIES[entity_type];
                    var gold = this.getGoldForAlliance(this.turn) - data.cost;
                    if (gold >= 0) {
                        this.deselectEntity(false);
                        this.closeShop();
                        this.setGoldForAlliance(this.turn, gold);
                        var entity = this.entity_manager.createEntity(entity_type, this.turn, this.entity_manager.getKingPosition(this.turn));
                        this.selectEntity(entity);
                    }
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.deselectEntity(false);
                    this.closeShop();
                }
                break;
            case InputContext.Ack:
                if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.closeMap();
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.closeMap();
                }
                break;
        }
    };
    GameController.prototype.pickEntity = function (entity) {
        this.context.push(InputContext.Animation);
        switch (this.entity_manager.getTypeOfRange()) {
            case EntityRangeType.Attack:
                this.entity_manager.attackEntity(this.selected_entity, entity);
                break;
            case EntityRangeType.Raise:
                this.entity_manager.raiseEntity(this.selected_entity, entity);
                break;
        }
        this.entity_manager.hideRange();
        this.cursor.show();
    };
    GameController.prototype.pickPosition = function (position) {
        if (this.selected_entity) {
            switch (this.entity_manager.getTypeOfRange()) {
                case EntityRangeType.Move:
                    this.last_entity_position = this.selected_entity.position.copy();
                    this.entity_manager.moveEntity(this.selected_entity, position);
                    break;
            }
            return;
        }
        var entity = this.entity_manager.getEntityAt(position);
        if (!!entity) {
            // no entity selected, clicked on entity - try to select it
            var success = this.selectEntity(entity);
            if (success) {
                return;
            }
        }
        this.showOptionMenu(MenuOptions.getOffMenuOptions());
    };
    GameController.prototype.openShop = function (alliance) {
        this.context.push(InputContext.Shop);
        if (!this.shop_units) {
            this.shop_units = new MenuShopUnits(this.frame_group, this);
            this.frame_manager.addFrame(this.shop_units);
        }
        this.shop_units.updateContent(alliance, this.getGoldForAlliance(alliance));
        this.shop_units.show(true);
        this.shop_info = new MenuShopInfo(this.frame_group, alliance);
        this.shop_info.updateContent(EntityType.Soldier);
        this.frame_manager.addFrame(this.shop_info);
        this.shop_info.show(true);
    };
    GameController.prototype.closeShop = function () {
        this.context.pop();
        this.shop_units.hide(true, true);
        this.shop_units = null;
        this.shop_info.hide(true, true);
        this.shop_info = null;
    };
    GameController.prototype.openMap = function () {
        this.context.push(InputContext.Ack);
        this.mini_map = new MiniMap(this.map, this.entity_manager, this.frame_group, this);
        this.frame_manager.addFrame(this.mini_map);
        this.mini_map.show(true);
    };
    GameController.prototype.closeMap = function () {
        this.context.pop();
        this.mini_map.hide(true, true);
        this.mini_map = null;
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
                x: x,
                y: y
            });
        }
    };
    Map.prototype.importEntities = function (entities) {
        this.start_entities = entities;
    };
    Map.prototype.importBuildings = function (buildings) {
        for (var _i = 0, buildings_1 = buildings; _i < buildings_1.length; _i++) {
            var building = buildings_1[_i];
            var match = this.getBuildingAt(new Pos(building.x, building.y));
            if (!match) {
                continue;
            }
            match.alliance = building.alliance;
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
    Map.prototype.setAllianceAt = function (position, alliance) {
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (building.position.match(position)) {
                building.alliance = alliance;
                return true;
            }
        }
        return false;
    };
    Map.prototype.getBuildingAt = function (position) {
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (building.position.match(position)) {
                return building;
            }
        }
        return null;
    };
    Map.prototype.getAllianceAt = function (position) {
        var building = this.getBuildingAt(position);
        if (!!building) {
            return building.alliance;
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
    Map.prototype.exportBuildingAlliances = function () {
        var exp = [];
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (building.alliance == Alliance.None) {
                continue;
            }
            exp.push({
                x: building.position.x,
                y: building.position.y,
                alliance: building.alliance
            });
        }
        return exp;
    };
    Map.prototype.isCampaign = function () {
        return this.name.charAt(0) == "m";
    };
    Map.prototype.getMap = function () {
        return parseInt(this.name.charAt(1), 10);
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
    function EntityManager(map, entity_group, selection_group, interaction_group, anim_group, delegate) {
        this.map = map;
        this.entity_group = entity_group;
        this.selection_group = selection_group;
        this.interaction_group = interaction_group;
        this.anim_group = anim_group;
        this.delegate = delegate;
        this.selection_graphics = selection_group.game.add.graphics(0, 0, selection_group);
        this.interaction_graphics = interaction_group.game.add.graphics(0, 0, interaction_group);
        this.moving = null;
        this.anim_idle_state = 0;
        this.entities = [];
        for (var _i = 0, _a = map.getStartEntities(); _i < _a.length; _i++) {
            var entity = _a[_i];
            var e = this.createEntity(entity.type, entity.alliance, new Pos(entity.x, entity.y));
            if (typeof entity.rank != "undefined") {
                e.rank = entity.rank;
            }
            if (typeof entity.ep != "undefined") {
                e.ep = entity.ep;
            }
            if (typeof entity.death_count != "undefined") {
                e.death_count = entity.death_count;
            }
            if (typeof entity.status != "undefined") {
                e.status = entity.status;
                e.updateStatus();
            }
            if (typeof entity.health != "undefined") {
                e.setHealth(entity.health);
            }
            if (typeof entity.state != "undefined") {
                e.updateState(entity.state, true);
            }
        }
        this.entity_range = new EntityRange(this.map, this, this.interaction_group);
    }
    EntityManager.prototype.createEntity = function (type, alliance, position) {
        var entity = new Entity(type, alliance, position, this.entity_group);
        this.entities.push(entity);
        return entity;
    };
    EntityManager.prototype.removeEntity = function (entity) {
        for (var i = 0; i < this.entities.length; i++) {
            if (entity == this.entities[i]) {
                this.entities.splice(i, 1);
                break;
            }
        }
        entity.destroy();
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
    EntityManager.prototype.getKingPosition = function (alliance) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance == alliance && entity.type == EntityType.King) {
                return entity.position.copy();
            }
        }
        return new Pos(0, 0);
    };
    EntityManager.prototype.nextTurn = function (alliance) {
        for (var i = this.entities.length - 1; i >= 0; i--) {
            var entity = this.entities[i];
            if (entity.isDead()) {
                entity.death_count++;
                if (entity.death_count >= AncientEmpires.DEATH_COUNT) {
                    this.removeEntity(entity);
                }
                continue;
            }
            if (entity.alliance == alliance) {
                entity.state = EntityState.Ready;
                if (this.map.getAllianceAt(entity.position) == entity.alliance) {
                    var nh = Math.min(entity.health + 2, 10);
                    entity.setHealth(nh);
                }
            }
            else {
                entity.state = EntityState.Moved;
                entity.clearStatus(EntityStatus.Poisoned);
            }
            var show = (entity.alliance == alliance);
            entity.updateState(entity.state, show);
        }
    };
    EntityManager.prototype.selectEntity = function (entity) {
        // move selected entity in a higher group
        this.entity_group.remove(entity.sprite);
        this.entity_group.remove(entity.icon_health);
        this.interaction_group.add(entity.sprite);
        this.interaction_group.add(entity.icon_health);
    };
    EntityManager.prototype.deselectEntity = function (entity) {
        // move selected entity back to all other entities
        this.interaction_group.remove(entity.sprite);
        this.interaction_group.remove(entity.icon_health);
        this.entity_group.addAt(entity.icon_health, 0);
        this.entity_group.addAt(entity.sprite, 0);
    };
    EntityManager.prototype.getEntityOptions = function (entity, moved) {
        if (moved === void 0) { moved = false; }
        if (entity.state != EntityState.Ready) {
            return [];
        }
        var options = [];
        if (!moved && entity.hasFlag(EntityFlags.CanBuy) && this.map.getTileAt(entity.position) == Tile.Castle) {
            options.push(Action.BUY);
        }
        if (!entity.hasFlag(EntityFlags.CantAttackAfterMoving) || !moved) {
            var attack_targets = this.getAttackTargets(entity);
            if (attack_targets.length > 0) {
                options.push(Action.ATTACK);
            }
        }
        if (entity.hasFlag(EntityFlags.CanRaise)) {
            var raise_targets = this.getRaiseTargets(entity);
            if (raise_targets.length > 0) {
                options.push(Action.RAISE);
            }
        }
        if (this.map.getAllianceAt(entity.position) != entity.alliance && ((entity.hasFlag(EntityFlags.CanOccupyHouse) && this.map.getTileAt(entity.position) == Tile.House) || (entity.hasFlag(EntityFlags.CanOccupyCastle) && this.map.getTileAt(entity.position) == Tile.Castle))) {
            options.push(Action.OCCUPY);
        }
        if (moved) {
            options.push(Action.END_MOVE);
        }
        else {
            options.push(Action.MOVE);
        }
        return options;
    };
    EntityManager.prototype.update = function (steps, cursor_position, anim_state) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (this.anim_idle_state != anim_state) {
                entity.setFrame(this.anim_idle_state);
            }
            entity.update(steps);
        }
        this.entity_range.update(steps, cursor_position, anim_state, this.selection_graphics, this.interaction_graphics);
        this.animateMovingEntity(steps);
    };
    /*

        ----- RANGE

     */
    EntityManager.prototype.showRange = function (type, entity) {
        if (type == EntityRangeType.Attack || type == EntityRangeType.Raise) {
            var targets_x = void 0;
            var targets_y = void 0;
            if (type == EntityRangeType.Attack) {
                targets_x = this.getAttackTargets(entity);
            }
            else if (type == EntityRangeType.Raise) {
                targets_x = this.getRaiseTargets(entity);
            }
            targets_y = targets_x.slice();
            targets_x.sort(function (a, b) {
                if (a.position.x == b.position.x) {
                    return a.position.y - b.position.y;
                }
                return a.position.x - b.position.x;
            });
            targets_y.sort(function (a, b) {
                if (a.position.y == b.position.y) {
                    return a.position.x - b.position.x;
                }
                return a.position.y - b.position.y;
            });
            this.selection_targets_x = targets_x;
            this.selection_targets_y = targets_y;
            this.selection_index_x = 0;
            this.selection_index_y = 0;
        }
        this.entity_range.createRange(type, entity, this.selection_graphics);
    };
    EntityManager.prototype.hideRange = function () {
        this.selection_targets_x = null;
        this.selection_targets_y = null;
        this.entity_range.clear(this.selection_graphics, this.interaction_graphics);
    };
    EntityManager.prototype.nextTargetInRange = function (direction) {
        if (!this.selection_targets_x || !this.selection_targets_y) {
            return null;
        }
        var pos = new Pos(0, 0).move(direction);
        if (pos.x != 0) {
            this.selection_index_x += pos.x;
            if (this.selection_index_x < 0) {
                this.selection_index_x = this.selection_targets_x.length - 1;
            }
            else if (this.selection_index_x >= this.selection_targets_x.length) {
                this.selection_index_x = 0;
            }
            return this.selection_targets_x[this.selection_index_x];
        }
        this.selection_index_y += pos.y;
        if (this.selection_index_y < 0) {
            this.selection_index_y = this.selection_targets_y.length - 1;
        }
        else if (this.selection_index_y >= this.selection_targets_y.length) {
            this.selection_index_y = 0;
        }
        return this.selection_targets_y[this.selection_index_y];
    };
    EntityManager.prototype.getTypeOfRange = function () {
        return this.entity_range.type;
    };
    EntityManager.prototype.getAttackTargets = function (entity) {
        var targets = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (enemy.alliance == entity.alliance) {
                continue;
            }
            if (enemy.isDead()) {
                continue;
            }
            var distance = entity.getDistanceToEntity(enemy);
            if (distance > entity.data.max) {
                continue;
            }
            if (distance < entity.data.min) {
                continue;
            }
            targets.push(enemy);
        }
        return targets;
    };
    EntityManager.prototype.getRaiseTargets = function (entity) {
        var targets = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var dead = _a[_i];
            if (!dead.isDead()) {
                continue;
            }
            var distance = entity.getDistanceToEntity(dead);
            if (distance != 1) {
                continue;
            }
            targets.push(dead);
        }
        return targets;
    };
    EntityManager.prototype.animationDidEnd = function (animation) {
        animation.entity.animation = null;
        switch (animation.type) {
            case EntityAnimationType.Attack:
                var attack = animation;
                if (attack.first && this.shouldCounter(attack.entity, attack.attacker)) {
                    this.attackEntity(attack.entity, attack.attacker, false);
                    return;
                }
                this.delegate.entityDidAnimation(attack.entity);
                var attacker = attack.first ? attack.attacker : attack.entity;
                var target = attack.first ? attack.entity : attack.attacker;
                if (attacker.hasFlag(EntityFlags.CanPoison)) {
                    target.setStatus(EntityStatus.Poisoned);
                    target.status_animation = 0;
                }
                if (attacker.shouldRankUp()) {
                    attacker.status_animation = 2;
                }
                if (target.shouldRankUp()) {
                    target.status_animation = 2;
                }
                if (attacker.isDead() || attacker.status_animation >= 0) {
                    attacker.startAnimation(new StatusAnimation(attacker, this, this.anim_group, attacker.isDead() ? -1 : attacker.status_animation));
                }
                if (target.isDead() || target.status_animation >= 0) {
                    target.startAnimation(new StatusAnimation(target, this, this.anim_group, target.isDead() ? -1 : target.status_animation));
                }
                break;
            case EntityAnimationType.Status:
                animation.entity.status_animation = -1;
                break;
            case EntityAnimationType.Raise:
                this.delegate.entityDidAnimation(animation.entity);
                break;
        }
    };
    EntityManager.prototype.attackEntity = function (attacker, target, first) {
        if (first === void 0) { first = true; }
        attacker.attack(target, this.map);
        target.startAnimation(new AttackAnimation(target, this, this.anim_group, attacker, first));
    };
    EntityManager.prototype.raiseEntity = function (wizard, tomb) {
        tomb.startAnimation(new RaiseAnimation(tomb, this, this.anim_group, wizard.alliance));
    };
    EntityManager.prototype.shouldCounter = function (attacker, target) {
        if (attacker.health > 0 && attacker.getDistanceToEntity(target) < 2 && attacker.data.min < 2) {
            return true;
        }
        return false;
    };
    /*

        ----- MOVE ENTITY

     */
    EntityManager.prototype.moveEntity = function (entity, target, animate) {
        if (animate === void 0) { animate = true; }
        if (!animate) {
            entity.position = target;
            entity.setWorldPosition(target.getWorldPosition());
            return true;
        }
        if (!!this.getEntityAt(target) && !target.match(entity.position)) {
            // Cant move where another unit is
            return false;
        }
        var waypoint = this.entity_range.getWaypointAt(target);
        if (!waypoint) {
            // target not in range
            return false;
        }
        var line = EntityRange.getLineToWaypoint(waypoint);
        this.moving = {
            entity: entity,
            target: target,
            line: line,
            progress: 0
        };
        this.hideRange();
        return true;
    };
    EntityManager.prototype.resetWisp = function (alliance, show) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance != alliance) {
                continue;
            }
            entity.clearStatus(EntityStatus.Wisped);
            if (this.hasWispInRange(entity)) {
                entity.setStatus(EntityStatus.Wisped);
                if (show) {
                    entity.startAnimation(new StatusAnimation(entity, this, this.anim_group, 1));
                }
            }
        }
    };
    EntityManager.prototype.exportEntities = function () {
        var exp = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            exp.push(entity.export());
        }
        return exp;
    };
    EntityManager.prototype.animateMovingEntity = function (steps) {
        if (!this.moving) {
            return;
        }
        var move = this.moving;
        var entity = move.entity;
        move.progress += steps;
        // first check is so we can stay at the same place
        if (move.line.length > 0 && move.progress >= move.line[0].length * AncientEmpires.TILE_SIZE) {
            move.progress -= move.line[0].length * AncientEmpires.TILE_SIZE;
            move.line.shift();
        }
        if (move.line.length > 0) {
            var diff = new Pos(0, 0).move(move.line[0].direction);
            entity.world_position.x = move.line[0].position.x * AncientEmpires.TILE_SIZE + diff.x * move.progress;
            entity.world_position.y = move.line[0].position.y * AncientEmpires.TILE_SIZE + diff.y * move.progress;
        }
        else {
            entity.position = move.target;
            entity.world_position = move.target.getWorldPosition();
            this.moving = null;
            this.delegate.entityDidMove(entity);
        }
        entity.update(steps);
    };
    EntityManager.prototype.hasWispInRange = function (entity) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var wisp = _a[_i];
            if (wisp.alliance != entity.alliance) {
                continue;
            }
            if (!wisp.hasFlag(EntityFlags.CanWisp)) {
                continue;
            }
            var distance = entity.getDistanceToEntity(wisp);
            if (distance < 1 || distance > 2) {
                continue;
            }
            return true;
        }
        return false;
    };
    return EntityManager;
}());

var EntityRangeType;
(function (EntityRangeType) {
    EntityRangeType[EntityRangeType["None"] = 0] = "None";
    EntityRangeType[EntityRangeType["Move"] = 1] = "Move";
    EntityRangeType[EntityRangeType["Attack"] = 2] = "Attack";
    EntityRangeType[EntityRangeType["Raise"] = 3] = "Raise";
})(EntityRangeType || (EntityRangeType = {}));
var EntityRange = (function () {
    function EntityRange(map, entity_manager, group) {
        this.map = map;
        this.entity_manager = entity_manager;
        this.type = EntityRangeType.None;
        this.extra_cursor = new Sprite({ x: 0, y: 0 }, group, "cursor", [4]);
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
    EntityRange.prototype.getWaypointAt = function (position) {
        return EntityRange.findPositionInList(position, this.waypoints);
    };
    EntityRange.prototype.createRange = function (type, entity, range_graphics) {
        this.type = type;
        this.range_lighten = false;
        this.range_progress = 100;
        this.line_end_position = null;
        this.line_slow = 0;
        this.line_offset = 0;
        switch (type) {
            case EntityRangeType.Raise:
                this.waypoints = [
                    { position: entity.position.copy(Direction.Up), cost: 0, form: Direction.All, parent: null },
                    { position: entity.position.copy(Direction.Right), cost: 0, form: Direction.All, parent: null },
                    { position: entity.position.copy(Direction.Down), cost: 0, form: Direction.All, parent: null },
                    { position: entity.position.copy(Direction.Left), cost: 0, form: Direction.All, parent: null }
                ];
                this.extra_cursor.hide();
                break;
            case EntityRangeType.Attack:
                var min = entity.data.min;
                var max = entity.data.max;
                this.waypoints = this.calculateWaypoints(entity, max, false);
                // remove all waypoints that are nearer than minimum range
                for (var i = this.waypoints.length - 1; i >= 0; i--) {
                    var waypoint = this.waypoints[i];
                    if (waypoint.cost < min) {
                        this.waypoints.splice(i, 1);
                    }
                }
                this.addForm();
                this.extra_cursor.setFrames([2, 3]);
                this.extra_cursor.setOffset(-1, -1);
                this.extra_cursor.show();
                break;
            case EntityRangeType.Move:
                this.waypoints = this.calculateWaypoints(entity, entity.getMovement(), !entity.hasFlag(EntityFlags.CanFly));
                this.addForm();
                this.extra_cursor.setFrames([4]);
                this.extra_cursor.setOffset(-1, -4);
                this.extra_cursor.show();
                break;
        }
        this.draw(range_graphics);
    };
    EntityRange.prototype.update = function (steps, cursor_position, anim_state, range_graphics, line_graphics) {
        if (this.type == EntityRangeType.None) {
            return;
        }
        if (this.range_lighten) {
            this.range_progress += steps;
            if (this.range_progress >= 100) {
                this.range_progress = 100;
                this.range_lighten = false;
            }
        }
        else {
            this.range_progress -= steps;
            if (this.range_progress <= 40) {
                this.range_progress = 40;
                this.range_lighten = true;
            }
        }
        this.extra_cursor.setFrame(anim_state);
        if (!cursor_position.match(this.line_end_position)) {
            this.line_end_position = cursor_position.copy();
            var endpoint = this.getWaypointAt(cursor_position);
            if (!!endpoint) {
                this.extra_cursor.setWorldPosition(cursor_position.getWorldPosition());
                this.line = EntityRange.getLineToWaypoint(endpoint);
            }
        }
        if (this.type == EntityRangeType.Move) {
            this.line_slow += steps;
            if (this.line_slow >= 5) {
                this.line_slow -= 5;
                this.line_offset -= 1;
                if (this.line_offset < 0) {
                    this.line_offset = AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING - 1;
                }
                if (this.line) {
                    line_graphics.clear();
                    line_graphics.beginFill(0xffffff);
                    for (var _i = 0, _a = this.line; _i < _a.length; _i++) {
                        var part = _a[_i];
                        this.drawSegment(line_graphics, part, this.line_offset);
                        this.line_offset = (this.line_offset + part.length * AncientEmpires.TILE_SIZE) % (AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING);
                    }
                    line_graphics.endFill();
                }
            }
        }
        var grey = this.range_progress / 100 * 0xFF | 0;
        range_graphics.tint = (grey << 16) | (grey << 8) | grey;
    };
    EntityRange.prototype.clear = function (range_graphics, line_graphics) {
        this.type = EntityRangeType.None;
        this.waypoints = [];
        this.extra_cursor.hide();
        range_graphics.clear();
        line_graphics.clear();
    };
    EntityRange.prototype.draw = function (graphics) {
        var color;
        switch (this.type) {
            case EntityRangeType.Move:
            case EntityRangeType.Raise:
                color = 0xffffff;
                break;
            case EntityRangeType.Attack:
                color = 0xff0000;
                break;
        }
        graphics.clear();
        graphics.beginFill(color);
        for (var _i = 0, _a = this.waypoints; _i < _a.length; _i++) {
            var waypoint = _a[_i];
            var position = waypoint.position.getWorldPosition();
            if ((waypoint.form & Direction.Up) != 0) {
                graphics.drawRect(position.x, position.y, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Right) != 0) {
                graphics.drawRect(position.x + AncientEmpires.TILE_SIZE - 4, position.y, 4, AncientEmpires.TILE_SIZE);
            }
            if ((waypoint.form & Direction.Down) != 0) {
                graphics.drawRect(position.x, position.y + AncientEmpires.TILE_SIZE - 4, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Left) != 0) {
                graphics.drawRect(position.x, position.y, 4, AncientEmpires.TILE_SIZE);
            }
        }
        graphics.endFill();
    };
    EntityRange.prototype.calculateWaypoints = function (entity, max_cost, use_terrain) {
        // cost for origin point is always 1
        var open = [{ position: entity.position, cost: (use_terrain ? 1 : 0), form: 0, parent: null }];
        var closed = [];
        while (open.length > 0) {
            var current = open.shift();
            closed.push(current);
            var adjacent_positions = this.map.getAdjacentPositionsAt(current.position);
            for (var _i = 0, adjacent_positions_1 = adjacent_positions; _i < adjacent_positions_1.length; _i++) {
                var position = adjacent_positions_1[_i];
                this.checkPosition(position, current, open, closed, max_cost, use_terrain, entity);
            }
        }
        return closed;
    };
    EntityRange.prototype.checkPosition = function (position, parent, open, closed, max_cost, use_terrain, entity) {
        // already is the lowest possible
        if (!!EntityRange.findPositionInList(position, closed)) {
            return false;
        }
        if (use_terrain) {
            var is_occupied = this.entity_manager.getEntityAt(position);
            if (!!is_occupied && is_occupied.alliance != entity.alliance) {
                return false;
            }
        }
        var tile_cost = 1;
        if (use_terrain) {
            tile_cost = this.map.getCostAt(position, entity);
        }
        var new_cost = parent.cost + tile_cost;
        if (new_cost > max_cost) {
            return false;
        }
        var in_open = EntityRange.findPositionInList(position, open);
        // check if in open stack and we are lower
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
    EntityRange.prototype.drawSegment = function (graphics, part, offset) {
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
                        graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y - length_1, AncientEmpires.LINE_SEGMENT_WIDTH, length_1);
                    }
                    y -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Right:
                    if (length_1 > 0) {
                        graphics.drawRect(x, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length_1, AncientEmpires.LINE_SEGMENT_WIDTH);
                    }
                    x += length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Down:
                    if (length_1 > 0) {
                        graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y, AncientEmpires.LINE_SEGMENT_WIDTH, length_1);
                    }
                    y += length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Left:
                    if (length_1 > 0) {
                        graphics.drawRect(x - length_1, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length_1, AncientEmpires.LINE_SEGMENT_WIDTH);
                    }
                    x -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
            }
            distance -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
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
            smoke.world_position.y = smoke.position.y * AncientEmpires.TILE_SIZE - this.anim_offset - 2;
            smoke.update();
        }
    };
    return SmokeManager;
}());

var Sprite = (function () {
    function Sprite(world_position, group, name, frames) {
        if (frames === void 0) { frames = []; }
        this.world_position = world_position;
        this.offset_x = 0;
        this.offset_y = 0;
        this.name = name;
        this.frames = frames;
        this.sprite = group.game.add.sprite(this.world_position.x, this.world_position.y, this.name);
        this.sprite.frame = this.frames[0];
        group.add(this.sprite);
    }
    Sprite.prototype.setFrames = function (frames, frame) {
        if (frame === void 0) { frame = 0; }
        this.frames = frames;
        this.frame = frame;
        this.sprite.frame = this.frames[this.frame % this.frames.length];
    };
    Sprite.prototype.setOffset = function (x, y) {
        this.offset_x = x;
        this.offset_y = y;
        this.update();
    };
    Sprite.prototype.setFrame = function (frame) {
        if (frame == this.frame) {
            return;
        }
        this.frame = frame;
        this.sprite.frame = this.frames[this.frame % this.frames.length];
    };
    Sprite.prototype.setWorldPosition = function (world_position) {
        this.world_position = world_position;
        this.update();
    };
    Sprite.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        this.sprite.x = this.world_position.x + this.offset_x;
        this.sprite.y = this.world_position.y + this.offset_y;
    };
    Sprite.prototype.hide = function () {
        this.sprite.visible = false;
    };
    Sprite.prototype.show = function () {
        this.sprite.visible = true;
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
    EntityFlags[EntityFlags["CanFly"] = 1] = "CanFly";
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
        this.death_count = 0;
        this.health = 10;
        this.rank = 0;
        this.ep = 0;
        this.status = 0;
        this.state = EntityState.Ready;
        this.status_animation = -1;
        this.icon_moved = group.game.add.image(0, 0, "chars", 4, group);
        this.icon_moved.visible = false;
        this.icon_health = group.game.add.image(0, 0, "chars", 0, group);
        this.icon_health.visible = false;
    }
    Entity.prototype.isDead = function () {
        return this.health == 0;
    };
    Entity.prototype.hasFlag = function (flag) {
        return (this.data.flags & flag) != 0;
    };
    Entity.prototype.getDistanceToEntity = function (entity) {
        return Math.abs(entity.position.x - this.position.x) + Math.abs(entity.position.y - this.position.y);
    };
    Entity.prototype.shouldRankUp = function () {
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
        n = Math.floor(Math.random() * 39) - 19 + this.rank; // -19 - 19 random
        if (n >= 19) {
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
        n = Math.floor(Math.random() * 39) - 19 + target.rank; // -19 - 19 random
        if (n >= 19) {
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
        target.setHealth(target.health - red_health);
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
    Entity.prototype.updateState = function (state, show) {
        this.state = state;
        if (state == EntityState.Dead) {
            this.sprite.loadTexture("tombstone", 0);
            this.setFrames([0]);
        }
        else {
            this.sprite.loadTexture("unit_icons_" + this.alliance, this.type);
            this.setFrames([this.type, this.type + AncientEmpires.ENTITIES.length]);
        }
        var show_icon = (show && state == EntityState.Moved);
        this.icon_moved.x = this.sprite.x + AncientEmpires.TILE_SIZE - 7;
        this.icon_moved.y = this.sprite.y + AncientEmpires.TILE_SIZE - 7;
        this.icon_moved.visible = show_icon;
        this.icon_moved.bringToTop();
    };
    Entity.prototype.startAnimation = function (animation) {
        this.animation = animation;
    };
    Entity.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        if (!!this.animation) {
            this.animation.run(steps);
        }
        this.icon_health.x = this.sprite.x;
        this.icon_health.y = this.sprite.y + AncientEmpires.TILE_SIZE - 7;
        _super.prototype.update.call(this, steps);
    };
    Entity.prototype.setHealth = function (health) {
        this.health = health;
        if (health > 9 || health < 1) {
            this.icon_health.visible = false;
            return;
        }
        this.icon_health.visible = true;
        this.icon_health.frame = 27 + (health - 1);
        this.icon_health.x = this.sprite.x;
        this.icon_health.y = this.sprite.y + AncientEmpires.TILE_SIZE - 7;
    };
    Entity.prototype.raise = function (alliance) {
        this.type = EntityType.Skeleton;
        this.alliance = alliance;
        this.rank = 0;
        this.ep = 0;
        this.death_count = 0;
        this.setHealth(10);
        this.clearStatus(EntityStatus.Poisoned);
        this.clearStatus(EntityStatus.Wisped);
        this.updateState(EntityState.Moved, true);
    };
    Entity.prototype.getMovement = function () {
        // if poisoned, less -> apply here
        return this.data.mov;
    };
    Entity.prototype.destroy = function () {
        this.icon_health.destroy();
        this.icon_moved.destroy();
        _super.prototype.destroy.call(this);
    };
    Entity.prototype.export = function () {
        return {
            type: this.type,
            alliance: this.alliance,
            x: this.position.x,
            y: this.position.y,
            rank: this.rank,
            ep: this.ep,
            state: this.state,
            status: this.status,
            health: this.health,
            death_count: this.death_count
        };
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
        this.border_group = this.group.game.add.group();
        this.group.add(this.border_group);
        this.border_group.visible = false;
        this.border_graphics = this.group.game.add.graphics(0, 0, this.border_group);
        this.content_group = this.group.game.add.group();
        this.group.add(this.content_group);
        this.content_group.visible = false;
        this.content_graphics = this.group.game.add.graphics(0, 0, this.content_group);
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
            this.content_group.visible = false;
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
            this.animationDidEnd(this.animation);
            if ((this.animation & FrameAnimation.Wire) != 0) {
                this.border_graphics.clear();
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
            this.border_graphics.clear();
            this.border_graphics.lineStyle(1, 0xffffff);
            this.border_graphics.drawRect(0, 0, this.current.width, this.current.height);
        }
        this.updateOffset();
    };
    Frame.prototype.destroy = function () {
        if (!!this.delegate) {
            this.delegate.frameWillDestroy(this);
        }
        this.border_group.destroy(true);
        this.content_group.destroy(true);
    };
    Frame.prototype.animationDidEnd = function (animation) {
        // implemented in sub classes if needed - default: do nothing
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
        var show_tiles_x = Math.ceil(width / Frame.BORDER_SIZE) - 2;
        var show_tiles_y = Math.ceil(height / Frame.BORDER_SIZE) - 2;
        this.content_graphics.clear();
        this.content_graphics.lineStyle(0);
        this.content_graphics.beginFill(0xcebea5);
        this.content_graphics.drawRect(0, 0, c_width, c_height);
        this.content_graphics.endFill();
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
        this.content_graphics.clear();
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
    AncientEmpires.MINI_SIZE = 10;
    AncientEmpires.LINE_SEGMENT_LENGTH = 10;
    AncientEmpires.LINE_SEGMENT_WIDTH = 4;
    AncientEmpires.LINE_SEGMENT_SPACING = 2;
    AncientEmpires.DEATH_COUNT = 3;
    AncientEmpires.NUMBER_OF_TILES = 23;
    return AncientEmpires;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EntityAnimationType;
(function (EntityAnimationType) {
    EntityAnimationType[EntityAnimationType["Attack"] = 0] = "Attack";
    EntityAnimationType[EntityAnimationType["Status"] = 1] = "Status";
    EntityAnimationType[EntityAnimationType["Raise"] = 2] = "Raise";
})(EntityAnimationType || (EntityAnimationType = {}));
var EntityAnimation = (function () {
    function EntityAnimation(steps, entity, delegate) {
        this.progress = 0;
        this.current_step = -1;
        this.steps = steps;
        this.acc = 0;
        this.delegate = delegate;
        this.entity = entity;
    }
    EntityAnimation.prototype.step = function (init, step, progress) {
        // return true if we should continue, false if we should stop execution
    };
    EntityAnimation.prototype.run = function (steps) {
        this.acc += steps;
        if (this.acc < 5) {
            return;
        }
        this.acc -= 5;
        var step = 0;
        while (step < this.steps.length) {
            if (this.progress < this.steps[step]) {
                break;
            }
            step++;
        }
        var init = false;
        if (step > this.current_step) {
            this.current_step = step;
            init = true;
        }
        var progress = this.current_step > 0 ? this.progress - this.steps[(this.current_step - 1)] : this.progress;
        this.progress++;
        this.step(init, this.current_step, progress);
    };
    return EntityAnimation;
}());
var AttackAnimation = (function (_super) {
    __extends(AttackAnimation, _super);
    function AttackAnimation(entity, delegate, group, attacker, first) {
        _super.call(this, [6, 8], entity, delegate);
        this.type = EntityAnimationType.Attack;
        this.first = first;
        this.attacker = attacker;
        this.group = group;
    }
    AttackAnimation.prototype.step = function (init, step, progress) {
        var middle = this.entity.position.getWorldPosition();
        switch (step) {
            case 0:
                if (init) {
                    this.image = this.group.game.add.image(middle.x, middle.y, "redspark", 0, this.group);
                }
                this.image.frame = progress % 3;
                this.entity.setWorldPosition({ x: middle.x + 2 - progress % 2 * 4, y: middle.y }); // 0 - 2px right, 1 - 2px left, 2 - 2px right
                break;
            case 1:
                if (init) {
                    this.image.visible = false;
                }
                this.entity.setWorldPosition({ x: middle.x + 2 - progress % 2 * 4, y: middle.y }); // 7 - 2px left, 8 - 2px right
                break;
            case 2:
                this.entity.setWorldPosition(this.entity.position.getWorldPosition());
                this.image.destroy();
                this.delegate.animationDidEnd(this);
        }
    };
    return AttackAnimation;
}(EntityAnimation));
var StatusAnimation = (function (_super) {
    __extends(StatusAnimation, _super);
    function StatusAnimation(entity, delegate, group, status) {
        _super.call(this, status == 1 ? [0, 6, 14] : [10, 16, 24], entity, delegate);
        this.type = EntityAnimationType.Status;
        this.status = status;
        this.group = group;
    }
    StatusAnimation.prototype.step = function (init, step, progress) {
        var middle = this.entity.position.getWorldPosition();
        switch (step) {
            case 0:
                // wait
                break;
            case 1:
                if (init) {
                    if (this.status == 0 || this.status == 2) {
                        this.image2 = this.group.game.add.image(middle.x + 4, middle.y + 4, "status", this.status, this.group);
                    }
                    this.image = this.group.game.add.image(middle.x, middle.y, "spark", 0, this.group);
                }
                this.image.frame = progress;
                break;
            case 2:
                if (this.status < 0) {
                    if (init) {
                        this.image.loadTexture("smoke", 0);
                        // replace with tomb graphic
                        this.entity.updateState(EntityState.Dead, true);
                    }
                    this.image.y = middle.y - progress * 3; // 0, 3, 6
                    this.image.frame = Math.floor(progress / 2);
                }
                else {
                    if (init) {
                        this.image.destroy();
                    }
                }
                break;
            case 3:
                if (this.status < 0) {
                    this.image.destroy();
                }
                else if (this.status == 0 || this.status == 2) {
                    this.image2.destroy();
                }
                this.delegate.animationDidEnd(this);
                this.delegate.animationDidEnd(this);
        }
    };
    return StatusAnimation;
}(EntityAnimation));
var RaiseAnimation = (function (_super) {
    __extends(RaiseAnimation, _super);
    function RaiseAnimation(entity, delegate, group, new_alliance) {
        _super.call(this, [8, 18], entity, delegate);
        this.type = EntityAnimationType.Raise;
        this.group = group;
        this.new_alliance = new_alliance;
        this.images = [];
    }
    RaiseAnimation.prototype.step = function (init, step, progress) {
        var middle = this.entity.position.getWorldPosition();
        switch (step) {
            case 0:
                if (init) {
                    this.images.push(this.group.game.add.image(middle.x - 8, middle.y - 8, "spark", 0, this.group));
                    this.images.push(this.group.game.add.image(middle.x + 8, middle.y - 8, "spark", 0, this.group));
                    this.images.push(this.group.game.add.image(middle.x - 8, middle.y + 8, "spark", 0, this.group));
                    this.images.push(this.group.game.add.image(middle.x + 8, middle.y + 8, "spark", 0, this.group));
                }
                var d = 8 - progress;
                this.images[0].frame = progress % 6;
                this.images[0].x = middle.x - d;
                this.images[0].y = middle.y - d;
                this.images[1].frame = progress % 6;
                this.images[1].x = middle.x + d;
                this.images[1].y = middle.y - d;
                this.images[2].frame = progress % 6;
                this.images[2].x = middle.x - d;
                this.images[2].y = middle.y + d;
                this.images[3].frame = progress % 6;
                this.images[3].x = middle.x + d;
                this.images[3].y = middle.y + d;
                break;
            case 1:
                if (init) {
                    this.entity.raise(this.new_alliance);
                }
                var d2 = -progress;
                this.images[0].frame = (progress + 2) % 6;
                this.images[0].x = middle.x - d2;
                this.images[0].y = middle.y - d2;
                this.images[1].frame = (progress + 2) % 6;
                this.images[1].x = middle.x + d2;
                this.images[1].y = middle.y - d2;
                this.images[2].frame = (progress + 2) % 6;
                this.images[2].x = middle.x - d2;
                this.images[2].y = middle.y + d2;
                this.images[3].frame = (progress + 2) % 6;
                this.images[3].x = middle.x + d2;
                this.images[3].y = middle.y + d2;
                break;
            case 2:
                this.images[0].destroy();
                this.images[1].destroy();
                this.images[2].destroy();
                this.images[3].destroy();
                this.delegate.animationDidEnd(this);
        }
    };
    return RaiseAnimation;
}(EntityAnimation));

var ScreenTransition;
(function (ScreenTransition) {
    ScreenTransition[ScreenTransition["None"] = 0] = "None";
    ScreenTransition[ScreenTransition["Hide"] = 1] = "Hide";
    ScreenTransition[ScreenTransition["Show"] = 2] = "Show";
})(ScreenTransition || (ScreenTransition = {}));
var AttackScreen = (function () {
    function AttackScreen(game, attacker, target, map) {
        this.background_graphics = game.add.graphics(0, 0);
        this.background_graphics.fixedToCamera = true;
        this.group = game.add.group();
        this.group.fixedToCamera = true;
        this.group.visible = false;
        this.content_graphics = this.group.game.add.graphics(0, 0, this.group);
        this.transition_mask = game.add.graphics(0, 0);
        this.transition_mask.clear();
        this.transition_mask.fixedToCamera = true;
        this.group.mask = this.transition_mask;
        this.attacker = attacker;
        this.target = target;
        this.map = map;
        this.transition = ScreenTransition.None;
    }
    AttackScreen.drawTransition = function (progress, max_progress, graphics, screen_width, screen_height) {
        var max_segment_width = Math.floor(screen_width / 4) + 1;
        var max_segment_height = Math.floor(screen_height / 4) + 1;
        var until_all = max_progress - 6;
        for (var x = 0; x < 4; x++) {
            var show = Math.floor(progress - x * 2);
            if (show <= 0) {
                // nothing to draw after this point
                break;
            }
            var width = void 0;
            var height = void 0;
            if (show >= until_all) {
                width = max_segment_width;
                height = max_segment_height;
            }
            else {
                width = Math.floor(show * max_segment_width / until_all);
                height = Math.floor(show * max_segment_height / until_all);
            }
            var margin_x = Math.floor((max_segment_width - width) / 2);
            var margin_y = Math.floor((max_segment_height - height) / 2);
            var offset_x = x * max_segment_width + margin_x;
            for (var y = 0; y < 4; y++) {
                var offset_y = y * max_segment_height + margin_y;
                graphics.drawRect(offset_x, offset_y, width, height);
            }
        }
    };
    AttackScreen.getBackgroundPrefixForTile = function (tile) {
        switch (tile) {
            case Tile.Forest:
                return "woods";
            case Tile.Hill:
                return "hill";
            case Tile.Mountain:
                return "mountain";
            case Tile.Water:
                return "water";
            case Tile.Bridge:
                return "bridge";
            case Tile.House:
            case Tile.Castle:
                return "town";
        }
        return null;
    };
    AttackScreen.getNameForTile = function (tile) {
        switch (tile) {
            case Tile.Grass:
            case Tile.Hill:
            case Tile.Forest:
                return "grass";
            case Tile.Path:
                return "road";
            case Tile.Mountain:
                return "mountain";
            case Tile.Water:
                return "water";
            case Tile.Bridge:
                return "bridge";
            case Tile.House:
            case Tile.Castle:
                return "town";
        }
        return null;
    };
    AttackScreen.prototype.show = function () {
        // start transition
        this.transition_progress = 0;
        this.transition = ScreenTransition.Hide;
    };
    AttackScreen.prototype.draw = function () {
        var attacker_tile = this.map.getTileAt(this.attacker.position);
        var target_tile = this.map.getTileAt(this.target.position);
        this.drawBackgroundHalf(attacker_tile, 0);
        this.drawBackgroundHalf(target_tile, 1);
        this.group.bringToTop(this.content_graphics);
        this.content_graphics.beginFill(0x000000);
        this.content_graphics.drawRect(Math.floor(this.group.game.width / 2) - 1, 0, 2, this.group.game.height);
        this.content_graphics.endFill();
    };
    AttackScreen.prototype.drawBackgroundHalf = function (tile, half) {
        var half_width = Math.floor(this.group.game.width / 2);
        var half_height = this.group.game.height;
        var offset_x = half * half_width;
        var bg_image = AttackScreen.getBackgroundPrefixForTile(tile);
        var bg_height = 0;
        if (bg_image != null) {
            bg_height = 48;
            var bg_tiles_x = Math.ceil(half_width / (2 * 88));
            for (var i = 0; i < bg_tiles_x; i++) {
                this.group.game.add.sprite(offset_x + i * 88, 0, bg_image + "_bg", 0, this.group);
            }
        }
        var tiles_x = Math.ceil(half_width / 24);
        var tiles_y = Math.ceil((half_height - bg_height) / 24);
        for (var x = 0; x < tiles_x; x++) {
            for (var y = 0; y < tiles_y; y++) {
                var rand = Math.floor(Math.random() * 10);
                var variant = rand >= 9 ? 2 : (rand >= 8 ? 1 : 0);
                this.group.game.add.sprite(offset_x + x * 24, bg_height + y * 24, AttackScreen.getNameForTile(tile), variant, this.group);
            }
        }
    };
    AttackScreen.prototype.update = function () {
        if (this.transition == ScreenTransition.None) {
            return;
        }
        if (this.transition == ScreenTransition.Hide) {
            this.background_graphics.clear();
            this.background_graphics.beginFill(0x000000);
            AttackScreen.drawTransition(this.transition_progress, 30, this.background_graphics, this.group.game.width, this.group.game.height);
            this.background_graphics.endFill();
        }
        else {
            this.transition_mask.clear();
            this.transition_mask.beginFill();
            AttackScreen.drawTransition(this.transition_progress, 30, this.transition_mask, this.group.game.width, this.group.game.height);
            this.transition_mask.endFill();
            if (this.transition_progress == 1) {
                // transition mask must have a drawRect call to be a mask, otherwise everything is shown
                this.group.visible = true;
            }
        }
        if (this.transition_progress >= 30) {
            var transition = this.transition;
            this.transition = ScreenTransition.None;
            this.transitionDidEnd(transition);
            return;
        }
        this.transition_progress++;
    };
    AttackScreen.prototype.transitionDidEnd = function (transition) {
        if (transition == ScreenTransition.Show) {
            console.log("Finished");
            return;
        }
        this.draw();
        this.transition_progress = 0;
        this.transition = ScreenTransition.Show;
    };
    return AttackScreen;
}());

var FrameManager = (function () {
    function FrameManager() {
        this.frames = [];
    }
    FrameManager.prototype.addFrame = function (frame) {
        frame.delegate = this;
        this.frames.push(frame);
    };
    FrameManager.prototype.removeFrame = function (frame) {
        for (var i = 0; i < this.frames.length; i++) {
            if (frame == this.frames[i]) {
                this.frames.splice(i, 1);
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
    FrameManager.prototype.frameWillDestroy = function (frame) {
        this.removeFrame(frame);
    };
    return FrameManager;
}());

var Key;
(function (Key) {
    Key[Key["None"] = 0] = "None";
    Key[Key["Up"] = 1] = "Up";
    Key[Key["Right"] = 2] = "Right";
    Key[Key["Down"] = 4] = "Down";
    Key[Key["Left"] = 8] = "Left";
    Key[Key["Enter"] = 16] = "Enter";
    Key[Key["Esc"] = 32] = "Esc";
})(Key || (Key = {}));
;
var Input = (function () {
    function Input(input) {
        this.all_keys = Key.None;
        this.key_up = input.keyboard.addKey(Phaser.Keyboard.UP);
        this.key_down = input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.key_right = input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_left = input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_enter = input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.key_esc = input.keyboard.addKey(Phaser.Keyboard.ESC);
    }
    Input.prototype.isKeyPressed = function (key) {
        return (this.all_keys & key) != 0;
    };
    Input.prototype.clearKeyPressed = function (key) {
        this.all_keys &= ~key;
    };
    Input.prototype.update = function () {
        var current_keys = Key.None;
        current_keys |= this.updateKey(Key.Up, this.key_up.isDown);
        current_keys |= this.updateKey(Key.Right, this.key_right.isDown);
        current_keys |= this.updateKey(Key.Down, this.key_down.isDown);
        current_keys |= this.updateKey(Key.Left, this.key_left.isDown);
        current_keys |= this.updateKey(Key.Enter, this.key_enter.isDown);
        current_keys |= this.updateKey(Key.Esc, this.key_esc.isDown);
        this.last_keys = current_keys;
    };
    Input.prototype.setKey = function (key, yes) {
        this.all_keys ^= (-yes ^ this.all_keys) & key;
    };
    Input.prototype.wasKeyPressed = function (key) {
        return (this.last_keys & key) != 0;
    };
    Input.prototype.updateKey = function (key, is_down) {
        if (is_down != this.wasKeyPressed(key)) {
            this.setKey(key, is_down);
        }
        return is_down ? key : 0;
    };
    return Input;
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
        this.head_graphics.drawRect(0, 17, this.width - 6, 17);
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
        this.gold_amount = new AEFont(28, 5, this.content_group, AEFontStyle.Bold);
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
    MenuDefInfo.prototype.updateContent = function (position, map, entity_manager) {
        // update information inside menu
        var tile = map.getTileAt(position);
        var entity = entity_manager.getEntityAt(position);
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
        if (!!entity && !entity.isDead()) {
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
        this.setStatusIcons(entity);
    };
    MenuDefInfo.prototype.drawContent = function () {
        // initialize content (sprites, text etc)
        var tile_graphics = this.group.game.add.graphics(0, 0, this.content_group);
        tile_graphics.lineStyle(1, 0x000000);
        tile_graphics.drawRect(6, 2, AncientEmpires.TILE_SIZE - 1, AncientEmpires.TILE_SIZE - 1);
        this.tile_icon = this.group.game.add.image(7, 3, "tiles0", null, this.content_group);
        var tile_crop = new Phaser.Rectangle(1, 1, AncientEmpires.TILE_SIZE - 2, AncientEmpires.TILE_SIZE - 2);
        this.tile_icon.crop(tile_crop);
        var def_font = new AEFont(7, 28, this.content_group, AEFontStyle.Bold);
        def_font.setText("DEF");
        this.def_amount = new AEFont(14, 37, this.content_group, AEFontStyle.Bold);
        this.entity_icon = this.group.game.add.image(35, 2, "unit_icons_1", null, this.content_group);
        this.entity_icon.visible = false;
        this.status_icons = [
            this.group.game.add.image(31, 22, "status", 2, this.content_group),
            this.group.game.add.image(39, 22, "status", 2, this.content_group),
            this.group.game.add.image(47, 22, "status", 2, this.content_group),
            this.group.game.add.image(31, 32, "status", 0, this.content_group),
            this.group.game.add.image(46, 32, "status", 1, this.content_group)
        ];
        this.setStatusIcons(null);
    };
    MenuDefInfo.prototype.setStatusIcons = function (entity) {
        this.status_icons[0].visible = (entity && entity.rank > 0) ? true : false;
        this.status_icons[1].visible = (entity && entity.rank > 1) ? true : false;
        this.status_icons[2].visible = (entity && entity.rank > 2) ? true : false;
        this.status_icons[3].visible = (entity && entity.status != EntityStatus.None) ? true : false;
        this.status_icons[3].frame = (entity && (entity.status & EntityStatus.Poisoned) != 0) ? 0 : 1;
        this.status_icons[4].visible = (entity && entity.status == (EntityStatus.Wisped | EntityStatus.Poisoned)) ? true : false;
    };
    return MenuDefInfo;
}(Frame));
var Action;
(function (Action) {
    Action[Action["None"] = 0] = "None";
    Action[Action["MAIN_MENU"] = 1] = "MAIN_MENU";
    Action[Action["MOVE"] = 2] = "MOVE";
    Action[Action["ATTACK"] = 3] = "ATTACK";
    Action[Action["BUY"] = 4] = "BUY";
    Action[Action["END_MOVE"] = 5] = "END_MOVE";
    Action[Action["CANCEL"] = 6] = "CANCEL";
    Action[Action["END_TURN"] = 7] = "END_TURN";
    Action[Action["OCCUPY"] = 8] = "OCCUPY";
    Action[Action["RAISE"] = 9] = "RAISE";
    Action[Action["MAP"] = 10] = "MAP";
    Action[Action["OBJECTIVE"] = 11] = "OBJECTIVE";
    Action[Action["NEW_GAME"] = 12] = "NEW_GAME";
    Action[Action["SELECT_LEVEL"] = 13] = "SELECT_LEVEL";
    Action[Action["SAVE_GAME"] = 14] = "SAVE_GAME";
    Action[Action["LOAD_GAME"] = 15] = "LOAD_GAME";
    Action[Action["SKIRMISH"] = 16] = "SKIRMISH";
    Action[Action["SETTINGS"] = 17] = "SETTINGS";
    Action[Action["INSTRUCTIONS"] = 18] = "INSTRUCTIONS";
    Action[Action["ABOUT"] = 19] = "ABOUT";
    Action[Action["EXIT"] = 20] = "EXIT";
})(Action || (Action = {}));
var MenuOptions = (function (_super) {
    __extends(MenuOptions, _super);
    function MenuOptions(group, align, options, delegate, anim_direction) {
        _super.call(this);
        if (!anim_direction) {
            anim_direction = align;
        }
        this.menu_delegate = delegate;
        this.options = options;
        this.selected = 0;
        var max_length = 0;
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var option = _a[_i];
            var text = MenuOptions.getOptionString(option);
            if (text.length > max_length) {
                max_length = text.length;
            }
        }
        var height = this.options.length * 13 + 16;
        var width = max_length * 7 + 31 + 13;
        this.initialize(width, height, group, align, Direction.All & ~align, anim_direction);
        this.drawContent();
    }
    MenuOptions.getMainMenuOptions = function (save) {
        var options = [Action.NEW_GAME, Action.SELECT_LEVEL, Action.LOAD_GAME, Action.SKIRMISH, Action.SETTINGS, Action.INSTRUCTIONS, Action.ABOUT, Action.EXIT];
        if (save) {
            options.unshift(Action.SAVE_GAME);
        }
        return options;
    };
    MenuOptions.getOffMenuOptions = function () {
        return [Action.END_TURN, Action.MAP, Action.OBJECTIVE, Action.MAIN_MENU];
    };
    MenuOptions.getOptionString = function (option) {
        if (option == Action.None) {
            return "";
        }
        if (option >= 12) {
            return AncientEmpires.LANG[(option - 12 + 1)];
        }
        return AncientEmpires.LANG[26 + option];
    };
    MenuOptions.prototype.drawContent = function () {
        var y = 5;
        this.fonts = [];
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var option = _a[_i];
            var text = MenuOptions.getOptionString(option);
            var font = this.group.game.add.bitmapText(25, y, "font7", text, 7, this.content_group);
            this.fonts.push(font);
            y += 13;
        }
        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;
    };
    MenuOptions.prototype.hide = function (animate, destroy_on_finish, update_on_finish) {
        if (animate === void 0) { animate = false; }
        if (destroy_on_finish === void 0) { destroy_on_finish = false; }
        if (update_on_finish === void 0) { update_on_finish = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.closeMenu(InputContext.Options);
        }
        _super.prototype.hide.call(this, animate, destroy_on_finish, update_on_finish);
    };
    MenuOptions.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(InputContext.Options);
        }
        _super.prototype.show.call(this, animate);
    };
    MenuOptions.prototype.next = function () {
        this.selected++;
        if (this.selected >= this.options.length) {
            this.selected = 0;
        }
    };
    MenuOptions.prototype.prev = function () {
        this.selected--;
        if (this.selected < 0) {
            this.selected = this.options.length - 1;
        }
    };
    MenuOptions.prototype.getSelected = function () {
        return this.options[this.selected];
    };
    MenuOptions.prototype.update = function (steps) {
        _super.prototype.update.call(this, steps);
        this.pointer_slow++;
        if (this.pointer_slow > 10) {
            this.pointer_slow = 0;
            this.pointer_state = 2 - this.pointer_state;
        }
        this.pointer.y = 4 + this.selected * 13;
        this.pointer.x = 4 + this.pointer_state;
    };
    return MenuOptions;
}(Frame));
var Notification = (function (_super) {
    __extends(Notification, _super);
    function Notification(group, text, delegate) {
        _super.call(this);
        this.menu_delegate = delegate;
        this.font = group.game.add.bitmapText(9, 5, "font7", text, 7);
        this.font.updateTransform();
        var width = this.font.textWidth + 30;
        this.initialize(width, 29, group, Direction.None, Direction.All, Direction.None);
        this.content_group.add(this.font);
    }
    Notification.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(InputContext.Wait);
        }
        _super.prototype.show.call(this, animate);
    };
    Notification.prototype.animationDidEnd = function (animation) {
        var _this = this;
        if ((animation & FrameAnimation.Show) != 0) {
            setTimeout(function () {
                _this.hide(true, true);
            }, 1000);
        }
        else if ((animation & FrameAnimation.Destroy) != 0) {
            if (!!this.menu_delegate) {
                this.menu_delegate.closeMenu(InputContext.Wait);
            }
        }
    };
    return Notification;
}(Frame));
var MenuShopUnits = (function (_super) {
    __extends(MenuShopUnits, _super);
    function MenuShopUnits(group, delegate) {
        _super.call(this);
        this.selected = 0;
        this.menu_delegate = delegate;
        this.initialize(64, group.game.height - 40, group, Direction.Right | Direction.Down, Direction.Up | Direction.Down | Direction.Left, Direction.Right);
        // draw content
        this.drawContent();
    }
    MenuShopUnits.prototype.updateContent = function (alliance, gold) {
        var i = 0;
        for (var _i = 0, _a = this.entity_images; _i < _a.length; _i++) {
            var image = _a[_i];
            var cost = AncientEmpires.ENTITIES[i].cost;
            image.loadTexture("unit_icons_" + alliance, image.frame);
            this.masks[i].visible = cost > gold;
            i++;
        }
    };
    MenuShopUnits.prototype.getSelected = function () {
        return this.selected;
    };
    MenuShopUnits.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(InputContext.Shop);
        }
        _super.prototype.show.call(this, animate);
    };
    MenuShopUnits.prototype.hide = function (animate, destroy_on_finish, update_on_finish) {
        if (animate === void 0) { animate = false; }
        if (destroy_on_finish === void 0) { destroy_on_finish = false; }
        if (update_on_finish === void 0) { update_on_finish = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.closeMenu(InputContext.Shop);
        }
        _super.prototype.hide.call(this, animate, destroy_on_finish, update_on_finish);
    };
    MenuShopUnits.prototype.update = function (steps) {
        _super.prototype.update.call(this, steps);
        this.pointer_slow++;
        if (this.pointer_slow > 10) {
            this.pointer_slow = 0;
            this.pointer_state = 2 - this.pointer_state;
        }
        this.pointer.y = 5 + Math.floor(this.selected / 2) * 29;
        this.pointer.x = -9 + (this.selected % 2) * 28 + this.pointer_state;
    };
    MenuShopUnits.prototype.prev = function (vertical) {
        if (vertical) {
            this.selected -= 2;
        }
        else {
            this.selected--;
        }
        if (this.selected < 0) {
            this.selected += this.entity_images.length;
        }
    };
    MenuShopUnits.prototype.next = function (vertical) {
        if (vertical) {
            this.selected += 2;
        }
        else {
            this.selected++;
        }
        if (this.selected >= this.entity_images.length) {
            this.selected -= this.entity_images.length;
        }
    };
    MenuShopUnits.prototype.drawContent = function () {
        this.entity_images = [];
        this.masks = [];
        for (var i = 0; i < AncientEmpires.ENTITIES.length; i++) {
            var data = AncientEmpires.ENTITIES[i];
            if (data.cost > 1000) {
                continue;
            }
            var x = (i % 2) * 27 + 3;
            var y = Math.floor(i / 2) * 29 + 5;
            var image = this.group.game.add.image(x, y, "unit_icons_1", i, this.content_group);
            this.entity_images.push(image);
            var mask = this.group.game.add.image(x, y, "mask", 0, this.content_group);
            this.masks.push(mask);
        }
        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;
    };
    return MenuShopUnits;
}(Frame));
var MenuShopInfo = (function (_super) {
    __extends(MenuShopInfo, _super);
    function MenuShopInfo(group, alliance) {
        _super.call(this);
        this.initialize(group.game.width - 64, group.game.height, group, Direction.Left, Direction.Up | Direction.Right | Direction.Down, Direction.Left);
        this.drawContent(alliance);
    }
    MenuShopInfo.prototype.updateContent = function (type) {
        var data = AncientEmpires.ENTITIES[type];
        this.unit_icon.frame = type;
        this.unit_name.setText(data.name.toUpperCase());
        this.unit_cost.setText(data.cost.toString());
        this.unit_atk.setText(data.atk.toString());
        this.unit_def.setText(data.def.toString());
        this.unit_mov.setText(data.mov.toString());
        this.unit_text.setText(AncientEmpires.LANG[75 + type]);
    };
    MenuShopInfo.prototype.drawContent = function (alliance) {
        this.unit_icon = this.group.game.add.image(2, 2, "unit_icons_" + (alliance == Alliance.Blue ? 1 : 2), 0, this.content_group);
        this.unit_name = this.group.game.add.bitmapText(29, 4, "font7", "", 7, this.content_group);
        this.group.game.add.image(28, 13, "gold", 0, this.content_group);
        this.unit_cost = new AEFont(54, 16, this.content_group, AEFontStyle.Bold, "");
        new AEFont(2, 33, this.content_group, AEFontStyle.Bold, "ATK");
        this.unit_atk = new AEFont(95, 33, this.content_group, AEFontStyle.Bold, "");
        new AEFont(2, 43, this.content_group, AEFontStyle.Bold, "DEF");
        this.unit_def = new AEFont(95, 43, this.content_group, AEFontStyle.Bold, "");
        new AEFont(2, 53, this.content_group, AEFontStyle.Bold, "MOV");
        this.unit_mov = new AEFont(95, 53, this.content_group, AEFontStyle.Bold, "");
        this.unit_text = this.group.game.add.bitmapText(6, 69, "font7", "", 7, this.content_group);
        this.unit_text.maxWidth = this.group.game.width - 64 - 18;
    };
    return MenuShopInfo;
}(Frame));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MiniMap = (function (_super) {
    __extends(MiniMap, _super);
    function MiniMap(map, entity_manager, group, menu_delegate) {
        _super.call(this);
        this.map = map;
        this.entity_manager = entity_manager;
        this.menu_delegate = menu_delegate;
        this.slow = 0;
        this.units_visible = true;
        this.initialize(map.width * AncientEmpires.MINI_SIZE + 12, map.height * AncientEmpires.MINI_SIZE + 12, group, Direction.None, Direction.All, Direction.None);
        this.drawContent();
    }
    MiniMap.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(InputContext.Ack);
        }
        _super.prototype.show.call(this, animate);
    };
    MiniMap.prototype.hide = function (animate, destroy_on_finish, update_on_finish) {
        if (animate === void 0) { animate = false; }
        if (destroy_on_finish === void 0) { destroy_on_finish = false; }
        if (update_on_finish === void 0) { update_on_finish = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.closeMenu(InputContext.Ack);
        }
        _super.prototype.hide.call(this, animate, destroy_on_finish, update_on_finish);
    };
    MiniMap.prototype.update = function (steps) {
        _super.prototype.update.call(this, steps);
        this.slow += steps;
        if (this.slow >= 30) {
            this.slow -= 30;
            this.units_visible = !this.units_visible;
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var image = _a[_i];
                image.visible = this.units_visible;
            }
        }
    };
    MiniMap.prototype.drawContent = function () {
        for (var x = 0; x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                var index = this.getTileIndexAt(new Pos(x, y));
                this.group.game.add.image(x * AncientEmpires.MINI_SIZE, y * AncientEmpires.MINI_SIZE, "stiles0", index, this.content_group);
            }
        }
        this.entities = [];
        for (var _i = 0, _a = this.entity_manager.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            var image = this.group.game.add.image(entity.position.x * AncientEmpires.MINI_SIZE, entity.position.y * AncientEmpires.MINI_SIZE, "unit_icons_s_" + entity.alliance, entity.type, this.content_group);
            this.entities.push(image);
        }
    };
    MiniMap.prototype.getTileIndexAt = function (position) {
        var tile = this.map.getTileAt(position);
        switch (tile) {
            case Tile.Path:
                return 0;
            case Tile.Grass:
                return 1;
            case Tile.Forest:
                return 2;
            case Tile.Hill:
                return 3;
            case Tile.Mountain:
                return 4;
            case Tile.Water:
                return 5;
            case Tile.Bridge:
                return 6;
            case Tile.House:
            case Tile.Castle:
                var alliance = this.map.getAllianceAt(position);
                return (tile == Tile.Castle ? 8 : 7) + alliance * 2;
        }
        return 0;
    };
    return MiniMap;
}(Frame));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsInV0aWwudHMiLCJsb2FkZXIudHMiLCJwbmdsb2FkZXIudHMiLCJtYWlubWVudS50cyIsImdhbWVjb250cm9sbGVyLnRzIiwibWFwLnRzIiwidGlsZW1hbmFnZXIudHMiLCJlbnRpdHltYW5hZ2VyLnRzIiwiZW50aXR5cmFuZ2UudHMiLCJzbW9rZW1hbmFnZXIudHMiLCJzcHJpdGUudHMiLCJzbW9rZS50cyIsImVudGl0eS50cyIsImZyYW1lLnRzIiwiYW5jaWVudGVtcGlyZXMudHMiLCJhbmltYXRpb24udHMiLCJhdHRhY2tzY3JlZW4udHMiLCJmcmFtZW1hbmFnZXIudHMiLCJpbnB1dC50cyIsIm1lbnUudHMiLCJtaW5pbWFwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUssV0FHSjtBQUhELFdBQUssV0FBVztJQUNaLDZDQUFJLENBQUE7SUFDSiwrQ0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUhJLFdBQVcsS0FBWCxXQUFXLFFBR2Y7QUFDRDtJQTBDSSxnQkFBWSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQW1CLEVBQUUsS0FBa0IsRUFBRSxJQUFhO1FBQ3BGLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUExQ00sZUFBUSxHQUFmLFVBQWdCLEtBQWtCLEVBQUUsTUFBYztRQUM5QyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUIsTUFBTSxD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QUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFJNUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzNDLFNBQVMsQ0FBQyxTQUFTLENBQUMs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Q0FBQyxTQUFTO2dCQUN2QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDN0QsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUNsQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDakUsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDeEYsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNyQyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDcEUsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztv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O1FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoRSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQixDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ08sOEJBQWMsR0FBdEI7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FB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QUFZLENBQUMsQ0FBQztnQkFDekMsQ0FBQztnQkFDRCxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQztnQkFFbkIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRWpDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUVqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FB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LENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4RyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUNELHlDQUFrQixHQUFsQixVQUFtQixJQUFVLEVBQUUsSUFBWTtRQUN2QyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDekMsSUFBSSxRQUFRLEdBQUcsSUFBSSxHQUFHLFVBQVUsQ0FBQztRQUVqQyxJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0QsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ25CLFNBQVMsR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2xELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0RixDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDeEQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMvQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxTQUFTLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxZQUFZLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFOUgsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0QsNkJBQU0sR0FBTjtRQUNJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzQyxNQUFNLENBQUM7UUFDWCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzdDLFlBQVksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ25JLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN2QyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9ILElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2hDLHdGQUF3RjtnQkFDeEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQzlCLENBQUM7UUFDTCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLG1CQUFtQixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNqQyxJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztZQUN4QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDbEMsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFFTyx1Q0FBZ0IsR0FBeEIsVUFBeUIsVUFBNEI7UUFDakQsRUFBRSxDQUFDLENBQUMsVUFBVSxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QixNQUFNLENBQUM7UUFDWCxDQUFDO1FBQ0QsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRVosSUFBSSxDQUFDLG1CQUFtQixHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztJQUM1QyxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQXRMQSxBQXNMQyxJQUFBOztBQzNMRDtJQUdJO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDckIsQ0FBQztJQUNELCtCQUFRLEdBQVIsVUFBUyxLQUFZO1FBQ2pCLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDRCxrQ0FBVyxHQUFYLFVBQVksS0FBWTtRQUNwQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDMUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLEtBQUssQ0FBQztZQUNWLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUNELDZCQUFNLEdBQU4sVUFBTyxLQUFhO1FBQ2hCLEdBQUcsQ0FBQyxDQUFjLFVBQVcsRUFBWCxLQUFBLElBQUksQ0FBQyxNQUFNLEVBQVgsY0FBVyxFQUFYLElBQVcsQ0FBQztZQUF6QixJQUFJLEtBQUssU0FBQTtZQUNWLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkI7SUFDTCxDQUFDO0lBQ0QsdUNBQWdCLEdBQWhCLFVBQWlCLEtBQVk7UUFDekIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQTFCQSxBQTBCQyxJQUFBOztBQzFCRCxJQUFLLEdBUUo7QUFSRCxXQUFLLEdBQUc7SUFDSiw2QkFBUSxDQUFBO0lBQ1IseUJBQU0sQ0FBQTtJQUNOLCtCQUFTLENBQUE7SUFDVCw2QkFBUSxDQUFBO0lBQ1IsNkJBQVEsQ0FBQTtJQUNSLGdDQUFVLENBQUE7SUFDViw0QkFBUSxDQUFBO0FBQ1osQ0FBQyxFQVJJLEdBQUcsS0FBSCxHQUFHLFFBUVA7QUFBQSxDQUFDO0FBQ0Y7SUFZSSxlQUFZLEtBQW1CO1FBRTNCLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUV6QixJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5RCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRUQsNEJBQVksR0FBWixVQUFhLEdBQVE7UUFDakIsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUNELCtCQUFlLEdBQWYsVUFBZ0IsR0FBUTtRQUNwQixJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDO0lBQzFCLENBQUM7SUFFRCxzQkFBTSxHQUFOO1FBQ0ksSUFBSSxZQUFZLEdBQVEsR0FBRyxDQUFDLElBQUksQ0FBQztRQUNqQyxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDM0QsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvRCxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsU0FBUyxHQUFHLFlBQVksQ0FBQztJQUNsQyxDQUFDO0lBQ08sc0JBQU0sR0FBZCxVQUFlLEdBQVEsRUFBRSxHQUFZO1FBQ2pDLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ2xELENBQUM7SUFDTyw2QkFBYSxHQUFyQixVQUFzQixHQUFRO1FBQzFCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDTyx5QkFBUyxHQUFqQixVQUFrQixHQUFRLEVBQUUsT0FBZ0I7UUFDeEMsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUNMLFlBQUM7QUFBRCxDQXJEQSxBQXFEQyxJQUFBOzs7Ozs7O0FDMUREO0lBQTJCLGdDQUFLO0lBTTVCLHNCQUFZLEtBQW1CO1FBQzNCLGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pILGVBQWU7UUFDZixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNELG9DQUFhLEdBQWIsVUFBYyxRQUFrQixFQUFFLElBQVk7UUFDMUMsaUNBQWlDO1FBRWpDLElBQUksS0FBYSxDQUFDO1FBQ2xCLElBQUksS0FBYSxDQUFDO1FBQ2xCLElBQUksQ0FBUyxDQUFDO1FBQ2QsRUFBRSxDQUFDLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVCLEtBQUssR0FBRyxRQUFRLENBQUM7WUFDakIsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNWLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixLQUFLLEdBQUcsUUFBUSxDQUFDO1lBQ2pCLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDVixDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN2RCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTdCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFckIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUNPLGtDQUFXLEdBQW5CO1FBQ0kseUNBQXlDO1FBRXpDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU1RSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbEUsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDckYsSUFBSSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRS9FLENBQUM7SUFDTCxtQkFBQztBQUFELENBcERBLEFBb0RDLENBcEQwQixLQUFLLEdBb0QvQjtBQUVEO0lBQTBCLCtCQUFLO0lBTTNCLHFCQUFZLEtBQW1CO1FBQzNCLGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pILGVBQWU7UUFDZixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNELG1DQUFhLEdBQWIsVUFBYyxRQUFhLEVBQUUsR0FBUSxFQUFFLGNBQTZCO1FBQ2hFLGlDQUFpQztRQUVqQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLElBQUksTUFBTSxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFbEQsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDM0MsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksWUFBWSxHQUFhLFFBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELElBQUksQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLFlBQVksR0FBYSxRQUFTLENBQUMsQ0FBQztZQUNuRSxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN6QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLHdCQUF3QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBRXBFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRSxDQUFDO1lBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLENBQUM7UUFDRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDTyxpQ0FBVyxHQUFuQjtRQUNJLHlDQUF5QztRQUV6QyxJQUFJLGFBQWEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNFLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3JDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxjQUFjLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXpGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JGLElBQUksU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFL0IsSUFBSSxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXhCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzRSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFFakMsSUFBSSxDQUFDLFlBQVksR0FBRztZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2xFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDbEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQztZQUNsRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDO1lBQ2xFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUM7U0FDckUsQ0FBQztRQUNGLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUNPLG9DQUFjLEdBQXRCLFVBQXVCLE1BQWM7UUFDakMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQzFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUMxRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxLQUFLLENBQUM7UUFFMUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztRQUM3RixJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFOUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssQ0FBQztJQUM3SCxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQXJGQSxBQXFGQyxDQXJGeUIsS0FBSyxHQXFGOUI7QUFDRCxJQUFLLE1Bc0JKO0FBdEJELFdBQUssTUFBTTtJQUNQLG1DQUFJLENBQUE7SUFDSiw2Q0FBUyxDQUFBO0lBQ1QsbUNBQUksQ0FBQTtJQUNKLHVDQUFNLENBQUE7SUFDTixpQ0FBRyxDQUFBO0lBQ0gsMkNBQVEsQ0FBQTtJQUNSLHVDQUFNLENBQUE7SUFDTiwyQ0FBUSxDQUFBO0lBQ1IsdUNBQU0sQ0FBQTtJQUNOLHFDQUFLLENBQUE7SUFDTCxrQ0FBRyxDQUFBO0lBQ0gsOENBQVMsQ0FBQTtJQUNULDRDQUFRLENBQUE7SUFDUixvREFBWSxDQUFBO0lBQ1osOENBQVMsQ0FBQTtJQUNULDhDQUFTLENBQUE7SUFDVCw0Q0FBUSxDQUFBO0lBQ1IsNENBQVEsQ0FBQTtJQUNSLG9EQUFZLENBQUE7SUFDWixzQ0FBSyxDQUFBO0lBQ0wsb0NBQUksQ0FBQTtBQUNSLENBQUMsRUF0QkksTUFBTSxLQUFOLE1BQU0sUUFzQlY7QUFDRDtJQUEwQiwrQkFBSztJQTZCM0IscUJBQWEsS0FBbUIsRUFBRSxLQUFnQixFQUFFLE9BQWlCLEVBQUUsUUFBc0IsRUFBRSxjQUEwQjtRQUNySCxpQkFBTyxDQUFDO1FBRVIsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLGNBQWMsR0FBRyxLQUFLLENBQUM7UUFDM0IsQ0FBQztRQUVELElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO1FBRTlCLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWxCLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNuQixHQUFHLENBQUMsQ0FBZSxVQUFZLEVBQVosS0FBQSxJQUFJLENBQUMsT0FBTyxFQUFaLGNBQVksRUFBWixJQUFZLENBQUM7WUFBM0IsSUFBSSxNQUFNLFNBQUE7WUFDWCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDN0IsQ0FBQztTQUNKO1FBQ0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUMzQyxJQUFJLEtBQUssR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFckMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQztRQUVyRixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQTFDTSw4QkFBa0IsR0FBekIsVUFBMEIsSUFBYTtRQUNuQyxJQUFJLE9BQU8sR0FBYSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25LLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDUCxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBQ00sNkJBQWlCLEdBQXhCO1FBQ0ksTUFBTSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFDTSwyQkFBZSxHQUF0QixVQUF1QixNQUFjO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFBQyxDQUFDO1FBQ3pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBVSxNQUFNLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBWSxNQUFNLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBMkJELGlDQUFXLEdBQVg7UUFDSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNoQixHQUFHLENBQUMsQ0FBZSxVQUFZLEVBQVosS0FBQSxJQUFJLENBQUMsT0FBTyxFQUFaLGNBQVksRUFBWixJQUFZLENBQUM7WUFBM0IsSUFBSSxNQUFNLFNBQUE7WUFDWCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdEIsQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEYsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7SUFFMUIsQ0FBQztJQUNELDBCQUFJLEdBQUosVUFBSyxPQUF3QixFQUFFLGlCQUFrQyxFQUFFLGdCQUFpQztRQUEvRix1QkFBd0IsR0FBeEIsZUFBd0I7UUFBRSxpQ0FBa0MsR0FBbEMseUJBQWtDO1FBQUUsZ0NBQWlDLEdBQWpDLHdCQUFpQztRQUNoRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2pGLGdCQUFLLENBQUMsSUFBSSxZQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCwwQkFBSSxHQUFKLFVBQUssT0FBd0I7UUFBeEIsdUJBQXdCLEdBQXhCLGVBQXdCO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDaEYsZ0JBQUssQ0FBQyxJQUFJLFlBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELDBCQUFJLEdBQUo7UUFDSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztJQUNMLENBQUM7SUFDRCwwQkFBSSxHQUFKO1FBQ0ksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0wsQ0FBQztJQUNELGlDQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELDRCQUFNLEdBQU4sVUFBTyxLQUFhO1FBQ2hCLGdCQUFLLENBQUMsTUFBTSxZQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzVDLENBQUM7SUFDTCxrQkFBQztBQUFELENBekdBLEFBeUdDLENBekd5QixLQUFLLEdBeUc5QjtBQUVEO0lBQTJCLGdDQUFLO0lBSTVCLHNCQUFhLEtBQW1CLEVBQUUsSUFBWSxFQUFFLFFBQXNCO1FBQ2xFLGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUU5QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUM1QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7UUFDckMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pGLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsMkJBQUksR0FBSixVQUFLLE9BQXdCO1FBQXhCLHVCQUF3QixHQUF4QixlQUF3QjtRQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQzdFLGdCQUFLLENBQUMsSUFBSSxZQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFDUyxzQ0FBZSxHQUF6QixVQUEwQixTQUF5QjtRQUFuRCxpQkFRQztRQVBHLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLFVBQVUsQ0FBQztnQkFDUCxLQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQixDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztnQkFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQyxDQUFDO1FBQ2xGLENBQUM7SUFDTCxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQTVCQSxBQTRCQyxDQTVCMEIsS0FBSyxHQTRCL0I7QUFFRDtJQUE0QixpQ0FBSztJQVc3Qix1QkFBYSxLQUFtQixFQUFFLFFBQXNCO1FBQ3BELGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQztRQUU5QixJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEosZUFBZTtRQUNmLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBQ0QscUNBQWEsR0FBYixVQUFjLFFBQWtCLEVBQUUsSUFBWTtRQUMxQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDVixHQUFHLENBQUMsQ0FBYyxVQUFrQixFQUFsQixLQUFBLElBQUksQ0FBQyxhQUFhLEVBQWxCLGNBQWtCLEVBQWxCLElBQWtCLENBQUM7WUFBaEMsSUFBSSxLQUFLLFNBQUE7WUFDVixJQUFJLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUMzQyxLQUFLLENBQUMsV0FBVyxDQUFDLGFBQWEsR0FBYSxRQUFTLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7WUFDcEMsQ0FBQyxFQUFFLENBQUM7U0FDUDtJQUNMLENBQUM7SUFDRCxtQ0FBVyxHQUFYO1FBQ0ksTUFBTSxDQUFjLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDdEMsQ0FBQztJQUNELDRCQUFJLEdBQUosVUFBSyxPQUF3QjtRQUF4Qix1QkFBd0IsR0FBeEIsZUFBd0I7UUFDekIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUM3RSxnQkFBSyxDQUFDLElBQUksWUFBQyxPQUFPLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsNEJBQUksR0FBSixVQUFLLE9BQXdCLEVBQUUsaUJBQWtDLEVBQUUsZ0JBQWlDO1FBQS9GLHVCQUF3QixHQUF4QixlQUF3QjtRQUFFLGlDQUFrQyxHQUFsQyx5QkFBa0M7UUFBRSxnQ0FBaUMsR0FBakMsd0JBQWlDO1FBQ2hHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDOUUsZ0JBQUssQ0FBQyxJQUFJLFlBQUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUNELDhCQUFNLEdBQU4sVUFBTyxLQUFhO1FBQ2hCLGdCQUFLLENBQUMsTUFBTSxZQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQ3hFLENBQUM7SUFDRCw0QkFBSSxHQUFKLFVBQUssUUFBaUI7UUFDbEIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFBQSxJQUFJLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxRQUFRLEVBQUcsQ0FBQztRQUNyQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUM7UUFDL0MsQ0FBQztJQUNMLENBQUM7SUFDRCw0QkFBSSxHQUFKLFVBQUssUUFBaUI7UUFDbEIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFBQSxJQUFJLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxRQUFRLEVBQUcsQ0FBQztRQUNyQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQztRQUMvQyxDQUFDO0lBQ0wsQ0FBQztJQUNPLG1DQUFXLEdBQW5CO1FBRUksSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFFaEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBRXRELElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUFDLFFBQVEsQ0FBQztZQUFDLENBQUM7WUFFbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRW5DLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3BGLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFDTCxvQkFBQztBQUFELENBaEdBLEFBZ0dDLENBaEcyQixLQUFLLEdBZ0doQztBQUVEO0lBQTJCLGdDQUFLO0lBVTVCLHNCQUFZLEtBQW1CLEVBQUUsUUFBa0I7UUFDL0MsaUJBQU8sQ0FBQztRQUVSLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsSixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFDRCxvQ0FBYSxHQUFiLFVBQWMsSUFBZ0I7UUFDMUIsSUFBSSxJQUFJLEdBQWUsY0FBYyxDQUFDLFFBQVEsQ0FBVyxJQUFLLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBWSxJQUFJLENBQUM7UUFDckMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBYSxJQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFDTyxrQ0FBVyxHQUFuQixVQUFvQixRQUFrQjtRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFhLEdBQUcsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUU3SCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0YsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFOUUsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFN0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQzlELENBQUM7SUFDTCxtQkFBQztBQUFELENBM0NBLEFBMkNDLENBM0MwQixLQUFLLEdBMkMvQjs7Ozs7OztBQzdiRDtJQUFzQiwyQkFBSztJQVV2QixpQkFBWSxHQUFRLEVBQUUsY0FBNkIsRUFBRSxLQUFtQixFQUFFLGFBQTJCO1FBQ2pHLGlCQUFPLENBQUM7UUFDUixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBRW5DLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxTQUFTLEdBQUcsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLFNBQVMsR0FBRyxFQUFFLEVBQUUsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0osSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxzQkFBSSxHQUFKLFVBQUssT0FBd0I7UUFBeEIsdUJBQXdCLEdBQXhCLGVBQXdCO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDNUUsZ0JBQUssQ0FBQyxJQUFJLFlBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELHNCQUFJLEdBQUosVUFBSyxPQUF3QixFQUFFLGlCQUFrQyxFQUFFLGdCQUFpQztRQUEvRix1QkFBd0IsR0FBeEIsZUFBd0I7UUFBRSxpQ0FBa0MsR0FBbEMseUJBQWtDO1FBQUUsZ0NBQWlDLEdBQWpDLHdCQUFpQztRQUNoRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7WUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQzdFLGdCQUFLLENBQUMsSUFBSSxZQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCx3QkFBTSxHQUFOLFVBQU8sS0FBYTtRQUNoQixnQkFBSyxDQUFDLE1BQU0sWUFBQyxLQUFLLENBQUMsQ0FBQztRQUVwQixJQUFJLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQztRQUNuQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbEIsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDaEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7WUFDekMsR0FBRyxDQUFDLENBQWMsVUFBYSxFQUFiLEtBQUEsSUFBSSxDQUFDLFFBQVEsRUFBYixjQUFhLEVBQWIsSUFBYSxDQUFDO2dCQUEzQixJQUFJLEtBQUssU0FBQTtnQkFDVixLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7YUFDdEM7UUFDTCxDQUFDO0lBRUwsQ0FBQztJQUNPLDZCQUFXLEdBQW5CO1FBQ0ksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLFNBQVMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNoSSxDQUFDO1FBQ0wsQ0FBQztRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxDQUFlLFVBQTRCLEVBQTVCLEtBQUEsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQTVCLGNBQTRCLEVBQTVCLElBQTRCLENBQUM7WUFBM0MsSUFBSSxNQUFNLFNBQUE7WUFDWCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLEdBQWEsTUFBTSxDQUFDLFFBQVMsRUFBVyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxTixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUM3QjtJQUNMLENBQUM7SUFDTyxnQ0FBYyxHQUF0QixVQUF1QixRQUFhO1FBQ2hDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLElBQUksQ0FBQyxJQUFJO2dCQUNWLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxLQUFLO2dCQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxNQUFNO2dCQUNaLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxJQUFJO2dCQUNWLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxRQUFRO2dCQUNkLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxLQUFLO2dCQUNYLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxNQUFNO2dCQUNaLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDYixLQUFLLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDaEIsS0FBSyxJQUFJLENBQUMsTUFBTTtnQkFDWixJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFhLFFBQVMsR0FBRyxDQUFDLENBQUM7UUFDdkUsQ0FBQztRQUNELE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBQ0wsY0FBQztBQUFELENBakZBLEFBaUZDLENBakZxQixLQUFLLEdBaUYxQiIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZW51bSBBRUZvbnRTdHlsZSB7XHJcbiAgICBCb2xkLFxyXG4gICAgTGFyZ2VcclxufVxyXG5jbGFzcyBBRUZvbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgdGV4dDogc3RyaW5nO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGxldHRlcnM6IFBoYXNlci5JbWFnZVtdO1xyXG4gICAgcHJpdmF0ZSBzdHlsZTogQUVGb250U3R5bGU7XHJcblxyXG4gICAgc3RhdGljIGdldFdpZHRoKHN0eWxlOiBBRUZvbnRTdHlsZSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gNyAqIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDEwICogbGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldEZvbnRJbmRleChzdHlsZTogQUVGb250U3R5bGUsIGNoYXI6IG51bWJlcik6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmIChzdHlsZSA9PSBBRUZvbnRTdHlsZS5MYXJnZSkge1xyXG4gICAgICAgICAgICAvLyBsYXJnZSBmb250XHJcbiAgICAgICAgICAgIGlmIChjaGFyID49IDQ4ICYmIGNoYXIgPD0gNTcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEb24ndCByZWNvZ25pemUgY2hhciBjb2RlIFwiICsgY2hhciArIFwiIGZvciBmb250IGxhcmdlXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJvbGQgZm9udFxyXG5cclxuICAgICAgICBpZiAoY2hhciA+PSA2NSAmJiBjaGFyIDwgOTApIHsgLy8gY2FwaXRhbCBsZXR0ZXJzIHdpdGhvdXQgWlxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDY1O1xyXG4gICAgICAgIH1lbHNlIGlmIChjaGFyID49IDQ5ICYmIGNoYXIgPD0gNTcpIHsgLy8gYWxsIG51bWJlcnMgd2l0aG91dCAwXHJcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDkgKyAyNztcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0OCkgeyAvLyAwXHJcbiAgICAgICAgICAgIHJldHVybiAxNDsgLy8gcmV0dXJuIE9cclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0NSkgeyAvLyAtXHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0MykgeyAvLyArXHJcbiAgICAgICAgICAgIHJldHVybiAyNjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9uJ3QgcmVjb2duaXplIGNoYXIgY29kZSBcIiArIGNoYXIgKyBcIiBmb3IgZm9udCBib2xkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgc3R5bGU6IEFFRm9udFN0eWxlLCB0ZXh0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxldHRlciBvZiB0aGlzLmxldHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0dGVyLnggPSB4O1xyXG4gICAgICAgICAgICBsZXR0ZXIueSA9IHk7XHJcbiAgICAgICAgICAgIHggKz0gbGV0dGVyLndpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzZXRWaXNpYmlsaXR5KHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBmb3IgKGxldCBsZXR0ZXIgb2YgdGhpcy5sZXR0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldHRlci52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGw6IFBoYXNlci5JbWFnZVtdID0gW107XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLng7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoYXIgPSB0aGlzLnRleHQuY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gQUVGb250LmdldEZvbnRJbmRleCh0aGlzLnN0eWxlLCBjaGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHggKz0gQUVGb250LmdldFdpZHRoKHRoaXMuc3R5bGUsIDEpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmb250X25hbWU6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICAgICAgZm9udF9uYW1lID0gXCJjaGFyc1wiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuTGFyZ2UpIHtcclxuICAgICAgICAgICAgICAgIGZvbnRfbmFtZSA9IFwibGNoYXJzXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZTogUGhhc2VyLkltYWdlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sZXR0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuaW1hZ2UoeCwgdGhpcy55LCBmb250X25hbWUsIG51bGwsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltYWdlLmZyYW1lID0gaW5kZXg7XHJcbiAgICAgICAgICAgIGwucHVzaChpbWFnZSk7XHJcbiAgICAgICAgICAgIHggKz0gaW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGV0dGVyID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGxldHRlci5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IGw7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIElQb3Mge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG59XHJcbmNsYXNzIFBvcyBpbXBsZW1lbnRzIElQb3Mge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbiAgICBtYXRjaChwOiBJUG9zKSB7XHJcbiAgICAgICAgcmV0dXJuICghIXAgJiYgdGhpcy54ID09IHAueCAmJiB0aGlzLnkgPT0gcC55KTtcclxuICAgIH1cclxuICAgIGNvcHkoZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBEaXJlY3Rpb24uTm9uZSk6IFBvcyB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSAtIDEpO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCArIDEsIHRoaXMueSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSArIDEpO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54IC0gMSwgdGhpcy55KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54LCB0aGlzLnkpO1xyXG4gICAgfVxyXG4gICAgbW92ZShkaXJlY3Rpb246IERpcmVjdGlvbik6IFBvcyB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnktLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkrKztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54LS07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGlyZWN0aW9uVG8gKHA6IFBvcyk6IERpcmVjdGlvbiB7XHJcbiAgICAgICAgaWYgKHAueCA+IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLlJpZ2h0OyB9XHJcbiAgICAgICAgaWYgKHAueCA8IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLkxlZnQ7IH1cclxuICAgICAgICBpZiAocC55ID4gdGhpcy55KSB7IHJldHVybiBEaXJlY3Rpb24uRG93bjsgfVxyXG4gICAgICAgIGlmIChwLnkgPCB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5VcDsgfVxyXG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uTm9uZTtcclxuICAgIH1cclxuICAgIGdldFdvcmxkUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCB0aGlzLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgfVxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICByZXR1cm4gXCJ7eDogXCIgKyB0aGlzLnggKyBcIiwgeTogXCIgKyB0aGlzLnkgKyBcIn1cIjtcclxuICAgIH1cclxufVxyXG5lbnVtIERpcmVjdGlvbiB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFVwID0gMSxcclxuICAgIFJpZ2h0ID0gMixcclxuICAgIERvd24gPSA0LFxyXG4gICAgTGVmdCA9IDgsXHJcbiAgICBBbGwgPSAxNVxyXG59XHJcbiIsImludGVyZmFjZSBEYXRhRW50cnkge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG5jbGFzcyBMb2FkZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZCgpIHtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KFwiZm9udDdcIiwgXCJkYXRhL2ZvbnQucG5nXCIsIFwiZGF0YS9mb250LnhtbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJkYXRhXCIsIFwiZGF0YS8xLnBha1wiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJsYW5nXCIsIFwiZGF0YS9sYW5nLmRhdFwiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgdGhpcy51bnBhY2tSZXNvdXJjZURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvYWRFbnRpdHlEYXRhKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwVGlsZXNQcm9wKCk7XHJcbiAgICAgICAgdGhpcy51bnBhY2tMYW5nRGF0YSgpO1xyXG5cclxuICAgICAgICBsZXQgd2FpdGVyID0gbmV3IFBOR1dhaXRlcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIk1haW5NZW51XCIsIGZhbHNlLCBmYWxzZSwgbmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInRpbGVzMFwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInN0aWxlczBcIiwgMTAsIDEwKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJidWlsZGluZ3NcIiwgMjQsIDI0LCAzLCAwKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJidWlsZGluZ3NcIiwgMjQsIDI0LCAzLCAxKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJidWlsZGluZ3NcIiwgMjQsIDI0LCAzLCAyKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ1bml0X2ljb25zXCIsIDI0LCAyNCwgMCwgMSk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc1wiLCAyNCwgMjQsIDAsIDIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNfc1wiLCAxMCwgMTAsIDAsIDEpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNfc1wiLCAxMCwgMTAsIDAsIDIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImN1cnNvclwiLCAyNiwgMjYpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJfc21va2VcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwibWVudVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJwb3J0cmFpdFwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJjaGFyc1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJnb2xkXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcInBvaW50ZXJcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwicmVkc3BhcmtcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwic3BhcmtcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwic21va2VcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwic3RhdHVzXCIpO1xyXG5cclxuXHJcblxyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInJvYWRcIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJncmFzc1wiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcIm1vdW50YWluXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwid2F0ZXJcIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ0b3duXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwid29vZHNfYmdcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwiaGlsbF9iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJtb3VudGFpbl9iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJicmlkZ2VfYmdcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwidG93bl9iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJ0b21ic3RvbmVcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwibWFza1wiKTtcclxuXHJcbiAgICAgICAgd2FpdGVyLmF3YWl0KCk7XHJcblxyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHVucGFja1Jlc291cmNlRGF0YSgpIHtcclxuICAgICAgICBsZXQgYXJyYXk6IFVpbnQ4QXJyYXkgPSB0aGlzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KFwiZGF0YVwiKTtcclxuICAgICAgICBsZXQgZGF0YSA9IG5ldyBEYXRhVmlldyhhcnJheS5idWZmZXIpO1xyXG5cclxuICAgICAgICBsZXQgaW5kZXggPSAyOyAvLyBkb2VzIG5vdCBzZWVtIGltcG9ydGFudFxyXG4gICAgICAgIGxldCBudW1iZXJfb2ZfZW50cmllcyA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICBsZXQgZW50cmllczogRGF0YUVudHJ5W10gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJfb2ZfZW50cmllczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzdHJfbGVuID0gZGF0YS5nZXRVaW50MTYoaW5kZXgpO1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG4gICAgICAgICAgICBsZXQgbmFtZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3RyX2xlbjsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoZGF0YS5nZXRVaW50OChpbmRleCsrKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW5kZXggKz0gNDsgLy8gZG9lcyBub3Qgc2VlbSBpbXBvcnRhbnRcclxuICAgICAgICAgICAgbGV0IHNpemUgPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7bmFtZTogbmFtZSwgc2l6ZTogc2l6ZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgZW50cnkgb2YgZW50cmllcykge1xyXG4gICAgICAgICAgICBsZXQgZW50cnlfZGF0YTogQXJyYXlCdWZmZXIgPSBhcnJheS5idWZmZXIuc2xpY2UoaW5kZXgsIGluZGV4ICsgZW50cnkuc2l6ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5jYWNoZS5hZGRCaW5hcnkoZW50cnkubmFtZSwgZW50cnlfZGF0YSk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IGVudHJ5LnNpemU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBsb2FkRW50aXR5RGF0YSgpIHtcclxuICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IHRoaXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkoXCJ1bml0cy5iaW5cIik7XHJcblxyXG4gICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTID0gW107XHJcbiAgICAgICAgbGV0IG5hbWVzID0gW1wiU29sZGllclwiLCBcIkFyY2hlclwiLCBcIkxpemFyZFwiLCBcIldpemFyZFwiLCBcIldpc3BcIiwgXCJTcGlkZXJcIiwgXCJHb2xlbVwiLCBcIkNhdGFwdWx0XCIsIFwiV3l2ZXJuXCIsIFwiS2luZ1wiLCBcIlNrZWxldG9uXCJdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRpdHk6IEVudGl0eURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBuYW1lOiBuYW1lc1tpXSxcclxuICAgICAgICAgICAgICAgIG1vdjogZGF0YS5nZXRVaW50OChpbmRleCsrKSxcclxuICAgICAgICAgICAgICAgIGF0azogZGF0YS5nZXRVaW50OChpbmRleCsrKSxcclxuICAgICAgICAgICAgICAgIGRlZjogZGF0YS5nZXRVaW50OChpbmRleCsrKSxcclxuICAgICAgICAgICAgICAgIG1heDogZGF0YS5nZXRVaW50OChpbmRleCsrKSxcclxuICAgICAgICAgICAgICAgIG1pbjogZGF0YS5nZXRVaW50OChpbmRleCsrKSxcclxuICAgICAgICAgICAgICAgIGNvc3Q6IGRhdGEuZ2V0VWludDE2KGluZGV4KSxcclxuICAgICAgICAgICAgICAgIGJhdHRsZV9wb3NpdGlvbnM6IFtdLFxyXG4gICAgICAgICAgICAgICAgZmxhZ3M6IEVudGl0eUZsYWdzLk5vbmVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIGxldCBudW1iZXJfcG9zID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1iZXJfcG9zOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5iYXR0bGVfcG9zaXRpb25zLnB1c2goe3g6IGRhdGEuZ2V0VWludDgoaW5kZXgrKyksIHk6IGRhdGEuZ2V0VWludDgoaW5kZXgrKyl9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbnVtYmVyX2ZsYWdzID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBudW1iZXJfZmxhZ3M7IGorKykge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmZsYWdzIHw9IDEgPDwgZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5wdXNoKGVudGl0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBsb2FkTWFwVGlsZXNQcm9wKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInRpbGVzMC5wcm9wXCIpO1xyXG4gICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBsZW5ndGggPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDsgLy8gMiBhcmUgdW5yZWxldmFudFxyXG5cclxuICAgICAgICBBbmNpZW50RW1waXJlcy5USUxFU19QUk9QID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5USUxFU19QUk9QLnB1c2goPFRpbGU+IGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHVucGFja0xhbmdEYXRhKCkge1xyXG4gICAgICAgIGxldCBhcnJheTogVWludDhBcnJheSA9IHRoaXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkoXCJsYW5nXCIpO1xyXG4gICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhhcnJheS5idWZmZXIpO1xyXG5cclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICBsZXQgbnVtYmVyID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLkxBTkcgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXI7IGkrKyl7XHJcbiAgICAgICAgICAgIGxldCBsZW4gPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcblxyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIHRleHQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhLmdldFVpbnQ4KGluZGV4KyspKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5MQU5HLnB1c2godGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBQTkdXYWl0ZXIge1xyXG5cclxuICAgIGF3YWl0aW5nOiBib29sZWFuO1xyXG4gICAgY291bnRlcjogbnVtYmVyO1xyXG4gICAgY2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG4gICAgY29uc3RydWN0b3IoY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyID0gMDtcclxuICAgICAgICB0aGlzLmF3YWl0aW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuXHJcbiAgICB9XHJcbiAgICBhd2FpdCgpIHtcclxuICAgICAgICB0aGlzLmF3YWl0aW5nID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGhpcy5jb3VudGVyIDw9IDApIHtcclxuICAgICAgICAgICAgLy8gaWYgaW1nLm9ubG9hZCBpcyBzeW5jaHJvbm91c1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgYWRkKCkge1xyXG4gICAgICAgIHRoaXMuY291bnRlcisrO1xyXG4gICAgfVxyXG4gICAgcmV0ID0gKCkgPT4ge1xyXG4gICAgICAgIHRoaXMuY291bnRlci0tO1xyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPiAwIHx8ICF0aGlzLmF3YWl0aW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuXHJcbiAgICB9O1xyXG59XHJcbmNsYXNzIFBOR0xvYWRlciB7XHJcbiAgICBzdGF0aWMgYnVmZmVyVG9CYXNlNjQoYnVmOiBVaW50OEFycmF5KSB7XHJcbiAgICAgICAgbGV0IGJpbnN0ciA9IEFycmF5LnByb3RvdHlwZS5tYXAuY2FsbChidWYsIGZ1bmN0aW9uIChjaDogbnVtYmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKGNoKTtcclxuICAgICAgICB9KS5qb2luKFwiXCIpO1xyXG4gICAgICAgIHJldHVybiBidG9hKGJpbnN0cik7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvYWRTcHJpdGVTaGVldCh3YWl0ZXI6IFBOR1dhaXRlciwgbmFtZTogc3RyaW5nLCB0aWxlX3dpZHRoPzogbnVtYmVyLCB0aWxlX2hlaWdodD86IG51bWJlciwgbnVtYmVyX29mX3RpbGVzPzogbnVtYmVyLCB2YXJpYXRpb24/OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IHNwcml0ZXNoZWV0X25hbWUgPSBuYW1lO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHRpbGVfd2lkdGggPT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2YgdGlsZV9oZWlnaHQgPT0gXCJ1bmRlZmluZWRcIiB8fCB0eXBlb2YgbnVtYmVyX29mX3RpbGVzID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgbGV0IGJ1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgXCIuc3ByaXRlXCIpO1xyXG4gICAgICAgICAgICBsZXQgZGF0YTogRGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgbnVtYmVyX29mX3RpbGVzID09IFwidW5kZWZpbmVkXCIpIHsgbnVtYmVyX29mX3RpbGVzID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTsgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRpbGVfd2lkdGggPT0gXCJ1bmRlZmluZWRcIikgeyB0aWxlX3dpZHRoID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTsgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRpbGVfaGVpZ2h0ID09IFwidW5kZWZpbmVkXCIpIHsgdGlsZV9oZWlnaHQgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5jaGVja0JpbmFyeUtleShuYW1lICsgXCIucG5nXCIpKSB7XHJcbiAgICAgICAgICAgIC8vIGFsbCB0aWxlcyBhcmUgaW4gb25lIGZpbGVcclxuICAgICAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIFwiLnBuZ1wiKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YXJpYXRpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgcG5nX2J1ZmZlciA9IFBOR0xvYWRlci5jcmVhdGVWYXJpYXRpb24ocG5nX2J1ZmZlciwgdmFyaWF0aW9uKTtcclxuICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0X25hbWUgKz0gXCJfXCIgKyB2YXJpYXRpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWcgPSBuZXcgSW1hZ2UoKTtcclxuXHJcbiAgICAgICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuYWRkU3ByaXRlU2hlZXQoc3ByaXRlc2hlZXRfbmFtZSwgbnVsbCwgaW1nLCB0aWxlX3dpZHRoLCB0aWxlX2hlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB3YWl0ZXIucmV0KCk7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIFBOR0xvYWRlci5idWZmZXJUb0Jhc2U2NChuZXcgVWludDhBcnJheShwbmdfYnVmZmVyKSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIHRpbGVzIGFyZSBpbiBtdWx0aXBsZSBmaWxlcyB3aXRoIG5hbWVzIG5hbWVfMDAucG5nLCBuYW1lXzAxLnBuZywgLi4uXHJcblxyXG4gICAgICAgICAgICB3YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgICAgIGxldCBpbm5lcl93YWl0ZXIgPSBuZXcgUE5HV2FpdGVyKHdhaXRlci5yZXQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IHNxdWFyZSA9IE1hdGguY2VpbChNYXRoLnNxcnQobnVtYmVyX29mX3RpbGVzKSk7XHJcbiAgICAgICAgICAgIGxldCBzcHJpdGVzaGVldCA9IEFuY2llbnRFbXBpcmVzLmdhbWUuYWRkLmJpdG1hcERhdGEoc3F1YXJlICogdGlsZV93aWR0aCwgc3F1YXJlICogdGlsZV9oZWlnaHQpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl90aWxlczsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaWR4OiBzdHJpbmcgPSBpIDwgMTAgPyAoXCJfMFwiICsgaSkgOiAoXCJfXCIgKyBpKTtcclxuICAgICAgICAgICAgICAgIGxldCBwbmdfYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBpZHggKyBcIi5wbmdcIik7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhcmlhdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG5nX2J1ZmZlciA9IFBOR0xvYWRlci5jcmVhdGVWYXJpYXRpb24ocG5nX2J1ZmZlciwgdmFyaWF0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBzcHJpdGVzaGVldF9uYW1lICs9IFwiX1wiICsgdmFyaWF0aW9uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG4gICAgICAgICAgICAgICAgaW5uZXJfd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgICAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzcHJpdGVzaGVldC5jdHguZHJhd0ltYWdlKGltZywgKGkgJSBzcXVhcmUpICogdGlsZV93aWR0aCwgTWF0aC5mbG9vcihpIC8gc3F1YXJlKSAqIHRpbGVfaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBpbm5lcl93YWl0ZXIucmV0KCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgUE5HTG9hZGVyLmJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHBuZ19idWZmZXIpKTtcclxuXHJcblxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpbm5lcl93YWl0ZXIuYXdhaXQoKTtcclxuXHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuYWRkU3ByaXRlU2hlZXQoc3ByaXRlc2hlZXRfbmFtZSwgbnVsbCwgc3ByaXRlc2hlZXQuY2FudmFzLCB0aWxlX3dpZHRoLCB0aWxlX2hlaWdodCwgbnVtYmVyX29mX3RpbGVzKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBsb2FkSW1hZ2Uod2FpdGVyOiBQTkdXYWl0ZXIsIG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBwbmdfYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBcIi5wbmdcIik7XHJcbiAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICB3YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgaW1nLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRJbWFnZShuYW1lLCBudWxsLCBpbWcpO1xyXG4gICAgICAgICAgICB3YWl0ZXIucmV0KCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBQTkdMb2FkZXIuYnVmZmVyVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkocG5nX2J1ZmZlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBjcmVhdGVWYXJpYXRpb24oYnVmZmVyOiBBcnJheUJ1ZmZlciwgdmFyaWF0aW9uPzogbnVtYmVyKTogQXJyYXlCdWZmZXIge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIHZhcmlhdGlvbiA9PSBcInVuZGVmaW5lZFwiKSB7IHJldHVybiBidWZmZXI7IH1cclxuXHJcbiAgICAgICAgYnVmZmVyID0gYnVmZmVyLnNsaWNlKDApOyAvLyBjb3B5IGJ1ZmZlciAob3RoZXJ3aXNlIHdlIG1vZGlmeSBvcmlnaW5hbCBkYXRhLCBzYW1lIGFzIGluIGNhY2hlKVxyXG4gICAgICAgIGxldCBkYXRhID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcbiAgICAgICAgbGV0IHN0YXJ0X3BsdGUgPSAwO1xyXG5cclxuICAgICAgICBmb3IgKDsgaW5kZXggPCBkYXRhLmJ5dGVMZW5ndGggLSAzOyBpbmRleCsrKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLmdldFVpbnQ4KGluZGV4KSAhPSA4MCB8fCBkYXRhLmdldFVpbnQ4KGluZGV4ICsgMSkgIT0gNzYgfHwgZGF0YS5nZXRVaW50OChpbmRleCArIDIpICE9IDg0KSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIHN0YXJ0X3BsdGUgPSBpbmRleCAtIDQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbmRleCA9IHN0YXJ0X3BsdGU7XHJcblxyXG4gICAgICAgIGxldCBsZW5ndGhfcGx0ZSA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuXHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuICAgICAgICBsZXQgY3JjID0gLTE7IC8vIDMyIGJpdFxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpbmRleCArIGkpLCBjcmMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuICAgICAgICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPCBpbmRleCArIGxlbmd0aF9wbHRlOyBpICs9IDMpIHtcclxuICAgICAgICAgICAgbGV0IHJlZDogbnVtYmVyID0gZGF0YS5nZXRVaW50OChpKTtcclxuICAgICAgICAgICAgbGV0IGdyZWVuOiBudW1iZXIgPSBkYXRhLmdldFVpbnQ4KGkgKyAxKTtcclxuICAgICAgICAgICAgbGV0IGJsdWU6IG51bWJlciA9IGRhdGEuZ2V0VWludDgoaSArIDIpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGJsdWUgPiByZWQgJiYgYmx1ZSA+IGdyZWVuKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBibHVlIGNvbG9yXHJcbiAgICAgICAgICAgICAgICBpZiAodmFyaWF0aW9uID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBjaGFuZ2UgdG8gcmVkIGNvbG9yXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRtcCA9IHJlZDtcclxuICAgICAgICAgICAgICAgICAgICByZWQgPSBibHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJsdWUgPSB0bXA7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gLz0gMjtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmICh2YXJpYXRpb24gPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlY29sb3JpemVcclxuICAgICAgICAgICAgICAgICAgICByZWQgPSBibHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGdyZWVuID0gYmx1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRhdGEuc2V0VWludDgoaSwgcmVkKTtcclxuICAgICAgICAgICAgICAgIGRhdGEuc2V0VWludDgoaSArIDEsIGdyZWVuKTtcclxuICAgICAgICAgICAgICAgIGRhdGEuc2V0VWludDgoaSArIDIsIGJsdWUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjcmMgPSBQTkdMb2FkZXIudXBkYXRlUE5HQ1JDKGRhdGEuZ2V0VWludDgoaSksIGNyYyk7XHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpICsgMSksIGNyYyk7XHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpICsgMiksIGNyYyk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdXBkYXRlIGNyYyBmaWVsZFxyXG4gICAgICAgIGNyYyBePSAtMTtcclxuICAgICAgICBsZXQgaW5kZXhfY3JjID0gc3RhcnRfcGx0ZSArIDggKyBsZW5ndGhfcGx0ZTtcclxuICAgICAgICBkYXRhLnNldFVpbnQzMihpbmRleF9jcmMsIGNyYyk7XHJcblxyXG4gICAgICAgIHJldHVybiBidWZmZXI7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgdXBkYXRlUE5HQ1JDKHZhbHVlOiBudW1iZXIsIGNyYzogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBjcmMgXj0gdmFsdWUgJiAyNTU7IC8vIGJpdHdpc2Ugb3IgKHdpdGhvdXQgYW5kKVxyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgODsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICgoY3JjICYgMSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgY3JjID0gY3JjID4+PiAxIF4gLTMwNjY3NDkxMjtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNyYyA+Pj49IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjcmM7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhbmNpZW50ZW1waXJlcy50c1wiIC8+XHJcbmNsYXNzIE1haW5NZW51IGV4dGVuZHMgUGhhc2VyLlN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUgKCkge1xyXG4gICAgICAgIHRoaXMubG9hZE1hcChcInMwXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRNYXAgKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIkdhbWVcIiwgdHJ1ZSwgZmFsc2UsIG5hbWUpO1xyXG4gICAgfVxyXG59XHJcbiIsImVudW0gSW5wdXRDb250ZXh0IHtcclxuICAgIFdhaXQsXHJcbiAgICBTaG9wLFxyXG4gICAgT3B0aW9ucyxcclxuICAgIE1hcCxcclxuICAgIFNlbGVjdGlvbixcclxuICAgIEFuaW1hdGlvbixcclxuICAgIEFja1xyXG59XHJcbmludGVyZmFjZSBHYW1lU2F2ZSB7XHJcbiAgICBidWlsZGluZ3M6IEJ1aWxkaW5nU2F2ZVtdO1xyXG4gICAgZW50aXRpZXM6IElFbnRpdHlbXTtcclxuICAgIG1hcDogbnVtYmVyO1xyXG4gICAgY2FtcGFpZ246IGJvb2xlYW47XHJcbiAgICB0dXJuOiBBbGxpYW5jZTtcclxuICAgIGdvbGQ6IG51bWJlcltdO1xyXG4gICAgY3Vyc29yczogSVBvc1tdO1xyXG59XHJcbmNsYXNzIEdhbWVDb250cm9sbGVyIGV4dGVuZHMgUGhhc2VyLlN0YXRlIGltcGxlbWVudHMgRW50aXR5TWFuYWdlckRlbGVnYXRlLCBNZW51RGVsZWdhdGUge1xyXG5cclxuICAgIGtleXM6IElucHV0O1xyXG4gICAgbWFwOiBNYXA7XHJcblxyXG4gICAgdGlsZV9tYW5hZ2VyOiBUaWxlTWFuYWdlcjtcclxuICAgIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyO1xyXG4gICAgc21va2VfbWFuYWdlcjogU21va2VNYW5hZ2VyO1xyXG4gICAgZnJhbWVfbWFuYWdlcjogRnJhbWVNYW5hZ2VyO1xyXG5cclxuICAgIGZyYW1lX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBmcmFtZV9nb2xkX2luZm86IE1lbnVHb2xkSW5mbztcclxuICAgIGZyYW1lX2RlZl9pbmZvOiBNZW51RGVmSW5mbztcclxuXHJcbiAgICB0dXJuOiBBbGxpYW5jZTtcclxuICAgIGdvbGQ6IG51bWJlcltdO1xyXG5cclxuICAgIGN1cnNvcjogU3ByaXRlO1xyXG5cclxuXHJcbiAgICBhY2M6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJzb3JfdGFyZ2V0czogUG9zW107XHJcbiAgICBwcml2YXRlIGN1cnNvcl90YXJnZXQ6IFBvcztcclxuICAgIHByaXZhdGUgbGFzdF9jdXJzb3JfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG9wdGlvbnNfbWVudTogTWVudU9wdGlvbnM7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3RlZF9lbnRpdHk6IEVudGl0eTtcclxuICAgIHByaXZhdGUgbGFzdF9lbnRpdHlfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGNvbnRleHQ6IElucHV0Q29udGV4dFtdO1xyXG4gICAgcHJpdmF0ZSBzaG9wX3VuaXRzOiBNZW51U2hvcFVuaXRzO1xyXG4gICAgcHJpdmF0ZSBzaG9wX2luZm86IE1lbnVTaG9wSW5mbztcclxuICAgIHByaXZhdGUgbWluaV9tYXA6IE1pbmlNYXA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0KG5hbWU6IHN0cmluZywgc2F2ZT86IEdhbWVTYXZlKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKG5hbWUpO1xyXG4gICAgICAgIHRoaXMua2V5cyA9IG5ldyBJbnB1dCh0aGlzLmdhbWUuaW5wdXQpO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldHMgPSBbXTtcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgdGhpcy50dXJuID0gc2F2ZS50dXJuO1xyXG4gICAgICAgICAgICB0aGlzLmdvbGQgPSBzYXZlLmdvbGQ7XHJcbiAgICAgICAgICAgIHRoaXMubWFwLmltcG9ydEJ1aWxkaW5ncyhzYXZlLmJ1aWxkaW5ncyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFwLmltcG9ydEVudGl0aWVzKHNhdmUuZW50aXRpZXMpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0YXJnZXQgb2Ygc2F2ZS5jdXJzb3JzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXRzLnB1c2gobmV3IFBvcyh0YXJnZXQueCwgdGFyZ2V0LnkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1jYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLnR1cm4gPSBBbGxpYW5jZS5CbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nb2xkID0gW107XHJcbiAgICAgICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PSBcInNcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkWzBdID0gMTAwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZFsxXSA9IDEwMDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRbMF0gPSAzMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRbMV0gPSAzMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBsb2FkR2FtZSgpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgZGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2F2ZS5yc1wiKTtcclxuICAgICAgICBpZiAoIWRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZW9mIEpTT04ucGFyc2UgIT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJCcm93c2VyIGRvZXMgbm90IHN1cHBvcnQgSlNPTi5wYXJzZVwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgc2F2ZTogR2FtZVNhdmUgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG5cclxuICAgICAgICBsZXQgbmFtZSA9IChzYXZlLmNhbXBhaWduID8gXCJtXCIgOiBcInNcIikgKyBzYXZlLm1hcDtcclxuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJHYW1lXCIsIHRydWUsIGZhbHNlLCBuYW1lLCBzYXZlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHNhdmVHYW1lKCkge1xyXG5cclxuICAgICAgICBsZXQgY3Vyc29yczogSVBvc1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgdGFyZ2V0IG9mIHRoaXMuY3Vyc29yX3RhcmdldHMpIHtcclxuICAgICAgICAgICAgY3Vyc29ycy5wdXNoKHt4OiB0YXJnZXQueCwgeTogdGFyZ2V0Lnl9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHNhdmU6IEdhbWVTYXZlID0ge1xyXG4gICAgICAgICAgICBlbnRpdGllczogdGhpcy5lbnRpdHlfbWFuYWdlci5leHBvcnRFbnRpdGllcygpLFxyXG4gICAgICAgICAgICBidWlsZGluZ3M6IHRoaXMubWFwLmV4cG9ydEJ1aWxkaW5nQWxsaWFuY2VzKCksXHJcbiAgICAgICAgICAgIGdvbGQ6IHRoaXMuZ29sZCxcclxuICAgICAgICAgICAgdHVybjogdGhpcy50dXJuLFxyXG4gICAgICAgICAgICBjYW1wYWlnbjogdGhpcy5tYXAuaXNDYW1wYWlnbigpLFxyXG4gICAgICAgICAgICBtYXA6IHRoaXMubWFwLmdldE1hcCgpLFxyXG4gICAgICAgICAgICBjdXJzb3JzOiBjdXJzb3JzXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coc2F2ZSk7XHJcblxyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2F2ZS5yc1wiLCBKU09OLnN0cmluZ2lmeShzYXZlKSk7XHJcblxyXG4gICAgfVxyXG4gICAgY3JlYXRlKCkge1xyXG5cclxuICAgICAgICBsZXQgdGlsZW1hcCA9IHRoaXMuZ2FtZS5hZGQudGlsZW1hcCgpO1xyXG4gICAgICAgIGxldCB0aWxlbWFwX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBzbW9rZV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgc2VsZWN0aW9uX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBlbnRpdHlfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGludGVyYWN0aW9uX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBjdXJzb3JfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmZyYW1lX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKHRoaXMubWFwLCB0aWxlbWFwLCB0aWxlbWFwX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zbW9rZV9tYW5hZ2VyID0gbmV3IFNtb2tlTWFuYWdlcih0aGlzLm1hcCwgc21va2VfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyID0gbmV3IEVudGl0eU1hbmFnZXIodGhpcy5tYXAsIGVudGl0eV9ncm91cCwgc2VsZWN0aW9uX2dyb3VwLCBpbnRlcmFjdGlvbl9ncm91cCwgYW5pbWF0aW9uX2dyb3VwLCB0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyID0gbmV3IEZyYW1lTWFuYWdlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8gPSBuZXcgTWVudURlZkluZm8odGhpcy5mcmFtZV9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMuZnJhbWVfZGVmX2luZm8pO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8gPSBuZXcgTWVudUdvbGRJbmZvKHRoaXMuZnJhbWVfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLmZyYW1lX2dvbGRfaW5mbyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSBuZXcgU3ByaXRlKHt4OiAwLCB5OiAwfSwgY3Vyc29yX2dyb3VwLCBcImN1cnNvclwiLCBbMCwgMV0pO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yLnNldE9mZnNldCgtMSwgLTEpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbWVyYS54ID0gdGhpcy5nZXRPZmZzZXRYKHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLngpO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnkgPSB0aGlzLmdldE9mZnNldFkodGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGV4dCA9IFtJbnB1dENvbnRleHQuTWFwXTtcclxuICAgICAgICB0aGlzLmtleXMgPSBuZXcgSW5wdXQodGhpcy5nYW1lLmlucHV0KTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3Vyc29yX3RhcmdldHMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXRzLnB1c2godGhpcy5lbnRpdHlfbWFuYWdlci5nZXRLaW5nUG9zaXRpb24oQWxsaWFuY2UuQmx1ZSkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXRzLnB1c2godGhpcy5lbnRpdHlfbWFuYWdlci5nZXRLaW5nUG9zaXRpb24oQWxsaWFuY2UuUmVkKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhcnRUdXJuKHRoaXMudHVybik7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoXCJHQU1FIExPQURFRFwiKTtcclxuXHJcbiAgICB9XHJcbiAgICBzaG93TWVzc2FnZSh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgbWVudSA9IG5ldyBOb3RpZmljYXRpb24odGhpcy5mcmFtZV9ncm91cCwgdGV4dCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKG1lbnUpO1xyXG4gICAgICAgIG1lbnUuc2hvdyh0cnVlKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAvLyAxIHN0ZXAgaXMgMS82MCBzZWNcclxuXHJcbiAgICAgICAgdGhpcy5hY2MgKz0gdGhpcy50aW1lLmVsYXBzZWQ7XHJcbiAgICAgICAgbGV0IHN0ZXBzID0gTWF0aC5mbG9vcih0aGlzLmFjYyAvIDE2KTtcclxuICAgICAgICBpZiAoc3RlcHMgPD0gMCkgeyByZXR1cm47IH1cclxuICAgICAgICB0aGlzLmFjYyAtPSBzdGVwcyAqIDE2O1xyXG4gICAgICAgIGlmIChzdGVwcyA+IDIpIHsgc3RlcHMgPSAyOyB9XHJcblxyXG4gICAgICAgIHRoaXMua2V5cy51cGRhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYXB0dXJlSW5wdXQoKTtcclxuXHJcbiAgICAgICAgbGV0IGN1cnNvcl9wb3NpdGlvbiA9IHRoaXMuY3Vyc29yX3RhcmdldC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgbGV0IGRpZmZfeCA9IGN1cnNvcl9wb3NpdGlvbi54IC0gdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueDtcclxuICAgICAgICBsZXQgZGlmZl95ID0gY3Vyc29yX3Bvc2l0aW9uLnkgLSB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55O1xyXG5cclxuICAgICAgICBsZXQgZHggPSAwO1xyXG4gICAgICAgIGxldCBkeSA9IDA7XHJcblxyXG4gICAgICAgIGlmIChkaWZmX3ggIT0gMCkge1xyXG4gICAgICAgICAgICBkeCA9IE1hdGguZmxvb3IoZGlmZl94IC8gNCk7XHJcbiAgICAgICAgICAgIGlmIChkeCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIC00KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIDQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2V0V29ybGRQb3NpdGlvbih7eDogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCArIGR4LCB5OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55ICsgZHl9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpZmZfeSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGR5ID0gTWF0aC5mbG9vcihkaWZmX3kgLyA0KTtcclxuICAgICAgICAgICAgaWYgKGR5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgLTQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1pbihkeSwgLTEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1pbihkeSwgNCk7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWF4KGR5LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRXb3JsZFBvc2l0aW9uKHt4OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54ICsgZHgsIHk6IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnkgKyBkeX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmN1cnNvcl90YXJnZXQubWF0Y2godGhpcy5sYXN0X2N1cnNvcl9wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0X2N1cnNvcl9wb3NpdGlvbiA9IHRoaXMuY3Vyc29yX3RhcmdldC5jb3B5KCk7XHJcblxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgZGVmIGluZm9cclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby51cGRhdGVDb250ZW50KHRoaXMuY3Vyc29yX3RhcmdldCwgdGhpcy5tYXAsIHRoaXMuZW50aXR5X21hbmFnZXIpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIGlucHV0XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jb250ZXh0W3RoaXMuY29udGV4dC5sZW5ndGggLSAxXSAhPSBJbnB1dENvbnRleHQuTWFwICYmIHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV0gIT0gSW5wdXRDb250ZXh0LlNlbGVjdGlvbiAmJiB0aGlzLmNvbnRleHRbdGhpcy5jb250ZXh0Lmxlbmd0aCAtIDFdICE9IElucHV0Q29udGV4dC5BbmltYXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zbG93ICs9IHN0ZXBzO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1fY3Vyc29yX3Nsb3cgPiAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3Nsb3cgLT0gMzA7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUgPSAxIC0gdGhpcy5hbmltX2N1cnNvcl9zdGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2V0RnJhbWUodGhpcy5hbmltX2N1cnNvcl9zdGF0ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIudXBkYXRlKHN0ZXBzKTtcclxuICAgICAgICB0aGlzLnNtb2tlX21hbmFnZXIudXBkYXRlKHN0ZXBzKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci51cGRhdGUoc3RlcHMsIHRoaXMuY3Vyc29yX3RhcmdldCwgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0Rm9yUG9zaXRpb24odGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24pO1xyXG5cclxuICAgICAgICBsZXQgaW5mb19pc19yaWdodCA9ICh0aGlzLmZyYW1lX2dvbGRfaW5mby5hbGlnbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMDtcclxuICAgICAgICBpZiAoIWluZm9faXNfcmlnaHQgJiYgdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCAtIDEgLSB0aGlzLmNhbWVyYS54IDw9IHRoaXMuZ2FtZS53aWR0aCAvIDIgLSAyNCAtIDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uTGVmdCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uUmlnaHQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5MZWZ0IHwgRGlyZWN0aW9uLlVwLCBEaXJlY3Rpb24uUmlnaHQsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mb19pc19yaWdodCAmJiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54ICsgMSAtIHRoaXMuY2FtZXJhLnggPj0gdGhpcy5nYW1lLndpZHRoIC8gMiArIDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uTGVmdCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uVXAsIERpcmVjdGlvbi5MZWZ0LCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGVudGl0eURpZE1vdmUoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICBsZXQgb3B0aW9ucyA9IHRoaXMuZW50aXR5X21hbmFnZXIuZ2V0RW50aXR5T3B0aW9ucyhlbnRpdHksIHRydWUpO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmxlbmd0aCA8IDEpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5zaG93T3B0aW9uTWVudShvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBlbnRpdHlEaWRBbmltYXRpb24oZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpIHtcclxuICAgICAgICBpZiAoY29udGV4dCA9PSBJbnB1dENvbnRleHQuV2FpdCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucHVzaChjb250ZXh0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LlNob3ApIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby5oaWRlKHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLmhpZGUodHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8uaGlkZSh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjbG9zZU1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LldhaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYWN0aXZlX2NvbnRleHQgPSB0aGlzLmNvbnRleHRbdGhpcy5jb250ZXh0Lmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIHN3aXRjaCAoYWN0aXZlX2NvbnRleHQpIHtcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuTWFwOlxyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5TZWxlY3Rpb246XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby5zaG93KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby5zaG93KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LlNob3A6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby5zaG93KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0RW50aXR5KGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlPcHRpb25zKGVudGl0eSwgZmFsc2UpO1xyXG5cclxuICAgICAgICAvLyBubyBvcHRpb25zIG1lYW46IG5vdCBpbiBhbGxpYW5jZSBvciBhbHJlYWR5IG1vdmVkXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzbyBtZXRob2QgY2FuIGJlIHVzZWQgdG8gc2hvdyBvcHRpb25zIGZvciBlbnRpdHkgYWdhaW4gLT4gbXVzdCBiZSBzYW1lIGVudGl0eSBhcyBzZWxlY3RlZFxyXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZF9lbnRpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkgPSBlbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNlbGVjdGVkX2VudGl0eSAhPSBlbnRpdHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dPcHRpb25NZW51KG9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKG9wdGlvbnNbMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZGVzZWxlY3RFbnRpdHkoY2hhbmdlZDogYm9vbGVhbiA9IHRydWUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWRfZW50aXR5KSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5oaWRlUmFuZ2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5kZXNlbGVjdEVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkgPSBudWxsO1xyXG5cclxuICAgICAgICAvLyBpZiBzb21ldGhpbmcgY2hhbmdlZFxyXG4gICAgICAgIGlmIChjaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIucmVzZXRXaXNwKHRoaXMudHVybiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlQ29udGVudCh0aGlzLmN1cnNvcl90YXJnZXQsIHRoaXMubWFwLCB0aGlzLmVudGl0eV9tYW5hZ2VyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBuZXh0VHVybigpIHtcclxuICAgICAgICBsZXQgbmV4dF90dXJuID0gQWxsaWFuY2UuQmx1ZTtcclxuICAgICAgICBpZiAodGhpcy50dXJuID09IEFsbGlhbmNlLkJsdWUpIHtcclxuICAgICAgICAgICAgbmV4dF90dXJuID0gQWxsaWFuY2UuUmVkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0c1t0aGlzLnR1cm4gPT0gQWxsaWFuY2UuQmx1ZSA/IDAgOiAxXSA9IHRoaXMuY3Vyc29yX3RhcmdldDtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5uZXh0VHVybihuZXh0X3R1cm4pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRUdXJuKG5leHRfdHVybiwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFR1cm4oYWxsaWFuY2U6IEFsbGlhbmNlLCBhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy50dXJuID0gYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5jdXJzb3JfdGFyZ2V0c1thbGxpYW5jZSA9PSBBbGxpYW5jZS5CbHVlID8gMCA6IDFdO1xyXG5cclxuICAgICAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgICAgICAgbGV0IHdwID0gdGhpcy5jdXJzb3JfdGFyZ2V0LmdldFdvcmxkUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2V0V29ybGRQb3NpdGlvbih3cCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnggPSB0aGlzLmdldE9mZnNldFgod3AueCk7XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnkgPSB0aGlzLmdldE9mZnNldFgod3AueSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby51cGRhdGVDb250ZW50KGFsbGlhbmNlLCB0aGlzLmdldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZSkpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzd2l0Y2ggKGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRbMF07XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuUmVkOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29sZFsxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBzZXRHb2xkRm9yQWxsaWFuY2UoYWxsaWFuY2U6IEFsbGlhbmNlLCBhbW91bnQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBhbGxpYW5jZV9pZDogbnVtYmVyO1xyXG4gICAgICAgIHN3aXRjaCAoYWxsaWFuY2UpIHtcclxuICAgICAgICAgICAgY2FzZSBBbGxpYW5jZS5CbHVlOlxyXG4gICAgICAgICAgICAgICAgYWxsaWFuY2VfaWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuUmVkOlxyXG4gICAgICAgICAgICAgICAgYWxsaWFuY2VfaWQgPSAxO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZ29sZFthbGxpYW5jZV9pZF0gPSBhbW91bnQ7XHJcbiAgICAgICAgaWYgKHRoaXMudHVybiA9PSBhbGxpYW5jZSkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby51cGRhdGVDb250ZW50KGFsbGlhbmNlLCBhbW91bnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNob3dPcHRpb25NZW51KG9wdGlvbnM6IEFjdGlvbltdKSB7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbmV3IE1lbnVPcHRpb25zKHRoaXMuZnJhbWVfZ3JvdXAsIERpcmVjdGlvbi5SaWdodCwgb3B0aW9ucywgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMub3B0aW9uc19tZW51KTtcclxuICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5zaG93KHRydWUpO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNob3dNYWluTWVudShhY3Rpb25zOiBBY3Rpb25bXSkge1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnNfbWVudSA9IG5ldyBNZW51T3B0aW9ucyh0aGlzLmZyYW1lX2dyb3VwLCBEaXJlY3Rpb24uTm9uZSwgYWN0aW9ucywgdGhpcywgRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5vcHRpb25zX21lbnUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51LnNob3codHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0Lk9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0T3B0aW9uKG9wdGlvbjogQWN0aW9uKSB7XHJcbiAgICAgICAgc3dpdGNoIChvcHRpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uT0NDVVBZOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0QWxsaWFuY2VBdCh0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbiwgdGhpcy5zZWxlY3RlZF9lbnRpdHkuYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlX21hbmFnZXIuZHJhd1RpbGVBdCh0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlKFwiT0NDVVBJRURcIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eS51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5Nb3ZlZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQVRUQUNLOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LlNlbGVjdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLkF0dGFjaywgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uTm9uZSkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb3IuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlJBSVNFOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LlNlbGVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuUmFpc2UsIHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLk5vbmUpLnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5NT1ZFOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLk1vdmUsIHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5CVVk6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5TaG9wKHRoaXMuc2VsZWN0ZWRfZW50aXR5LmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FTkRfTU9WRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5LnVwZGF0ZVN0YXRlKEVudGl0eVN0YXRlLk1vdmVkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FTkRfVFVSTjpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoXCJFTkQgVFVSTlwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dFR1cm4oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5NQUlOX01FTlU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dNYWluTWVudShNZW51T3B0aW9ucy5nZXRNYWluTWVudU9wdGlvbnModHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk1BUDpcclxuICAgICAgICAgICAgICAgIHRoaXMub3Blbk1hcCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNBVkVfR0FNRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2F2ZUdhbWUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoQW5jaWVudEVtcGlyZXMuTEFOR1s0MV0pO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkxPQURfR0FNRTpcclxuICAgICAgICAgICAgICAgIHRoaXMubG9hZEdhbWUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5TRUxFQ1RfTEVWRUw6XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNLSVJNSVNIOlxyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FWElUOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiTWFpbk1lbnVcIiwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkNBTkNFTDpcclxuICAgICAgICAgICAgICAgIGlmICghIXRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBsYXN0IGFjdGlvbiB3YXMgd2Fsa2luZy4gcmVzZXQgZW50aXR5ICYgc2V0IGN1cnNvciB0byBjdXJyZW50IHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIubW92ZUVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuTW92ZSwgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWN0aW9uIFwiICsgTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbikgKyBcIiBub3QgeWV0IGltcGxlbWVudGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdXBkYXRlT2Zmc2V0Rm9yUG9zaXRpb24ocG9zaXRpb246IElQb3MpIHtcclxuICAgICAgICBsZXQgeCA9IHBvc2l0aW9uLnggKyAwLjUgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgbGV0IHkgPSBwb3NpdGlvbi55ICsgMC41ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCh4LCB5KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlT2Zmc2V0KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0gdGhpcy5nZXRPZmZzZXRYKHgpO1xyXG4gICAgICAgIGxldCBvZmZzZXRfeSA9IHRoaXMuZ2V0T2Zmc2V0WSh5KTtcclxuXHJcbiAgICAgICAgbGV0IGRpZmZfeCA9IG9mZnNldF94IC0gdGhpcy5jYW1lcmEueDtcclxuICAgICAgICBsZXQgZGlmZl95ID0gb2Zmc2V0X3kgLSB0aGlzLmNhbWVyYS55O1xyXG5cclxuICAgICAgICBpZiAoZGlmZl94ICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGR4ID0gTWF0aC5mbG9vcihkaWZmX3ggLyAxMik7XHJcbiAgICAgICAgICAgIGlmIChkeCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIC00KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIDQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueCArPSBkeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpZmZfeSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxldCBkeSA9IE1hdGguZmxvb3IoZGlmZl95IC8gMTIpO1xyXG4gICAgICAgICAgICBpZiAoZHkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWF4KGR5LCAtNCk7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWluKGR5LCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWluKGR5LCA0KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnkgKz0gZHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRPZmZzZXRYKHg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0geCAtIHRoaXMuZ2FtZS53aWR0aCAvIDI7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS53aWR0aCA8IHRoaXMud29ybGQud2lkdGgpIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3ggPSBNYXRoLm1heChvZmZzZXRfeCwgMCk7XHJcbiAgICAgICAgICAgIG9mZnNldF94ID0gTWF0aC5taW4ob2Zmc2V0X3gsIHRoaXMud29ybGQud2lkdGggLSB0aGlzLmdhbWUud2lkdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9mZnNldF94ID0gKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMud29ybGQud2lkdGgpIC8gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldF94O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRPZmZzZXRZKHk6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IG9mZnNldF95ID0geSAtIHRoaXMuZ2FtZS5oZWlnaHQgLyAyO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaGVpZ2h0IDwgdGhpcy53b3JsZC5oZWlnaHQpIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3kgPSBNYXRoLm1heChvZmZzZXRfeSwgMCk7XHJcbiAgICAgICAgICAgIG9mZnNldF95ID0gTWF0aC5taW4ob2Zmc2V0X3ksIHRoaXMud29ybGQuaGVpZ2h0IC0gdGhpcy5nYW1lLmhlaWdodCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3kgPSAodGhpcy5nYW1lLmhlaWdodCAtIHRoaXMud29ybGQuaGVpZ2h0KSAvIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRfeTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgY2FwdHVyZUlucHV0KCkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5rZXlzLmFsbF9rZXlzID09IEtleS5Ob25lKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuTWFwOlxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvcl9zdGlsbCA9IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggJSAyNCA9PSAwICYmIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnkgJSAyNCA9PSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSAmJiBjdXJzb3Jfc3RpbGwgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0Lm1vdmUoRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuUmlnaHQpICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmN1cnNvcl90YXJnZXQueCA8IHRoaXMubWFwLndpZHRoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldC5tb3ZlKERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkRvd24pICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmN1cnNvcl90YXJnZXQueSA8IHRoaXMubWFwLmhlaWdodCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uRG93bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkxlZnQpICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmN1cnNvcl90YXJnZXQueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uTGVmdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpY2tQb3NpdGlvbih0aGlzLmN1cnNvcl90YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhZW50aXR5ICYmIGVudGl0eS5wb3NpdGlvbi5tYXRjaCh0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEtpbmdQb3NpdGlvbih0aGlzLnR1cm4pKSAmJiBlbnRpdHkuZGF0YS5jb3N0IDw9IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW50aXR5IHdhcyBib3VnaHQsIGFkZCBnb2xkIGJhY2sgYW5kIHJlbW92ZSBlbnRpdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdvbGQgPSB0aGlzLmdldEdvbGRGb3JBbGxpYW5jZSh0aGlzLnR1cm4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEdvbGRGb3JBbGxpYW5jZSh0aGlzLnR1cm4sIGdvbGQgKyBlbnRpdHkuZGF0YS5jb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5yZW1vdmVFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0Lk9wdGlvbnM6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuVXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51LnByZXYoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkID0gdGhpcy5vcHRpb25zX21lbnUuZ2V0U2VsZWN0ZWQoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51LmhpZGUodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdE9wdGlvbihzZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24oQWN0aW9uLkNBTkNFTCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuU2VsZWN0aW9uOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSAmJiB0aGlzLmN1cnNvcl90YXJnZXQueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5VcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnggPCB0aGlzLm1hcC53aWR0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSAmJiB0aGlzLmN1cnNvcl90YXJnZXQueSA8IHRoaXMubWFwLmhlaWdodCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uRG93bik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldCA9IGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uTm9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrRW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5oaWRlUmFuZ2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5TaG9wOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlVwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMucHJldih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuUmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cy5uZXh0KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMubmV4dCh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5MZWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMucHJldihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX2luZm8udXBkYXRlQ29udGVudCh0aGlzLnNob3BfdW5pdHMuZ2V0U2VsZWN0ZWQoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5X3R5cGU6IG51bWJlciA9IHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbZW50aXR5X3R5cGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBnb2xkID0gdGhpcy5nZXRHb2xkRm9yQWxsaWFuY2UodGhpcy50dXJuKSAtIGRhdGEuY29zdDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ29sZCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlU2hvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEdvbGRGb3JBbGxpYW5jZSh0aGlzLnR1cm4sIGdvbGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5jcmVhdGVFbnRpdHkoZW50aXR5X3R5cGUsIHRoaXMudHVybiwgdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRLaW5nUG9zaXRpb24odGhpcy50dXJuKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlU2hvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LkFjazpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5FbnRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5FbnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlTWFwKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwaWNrRW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5BbmltYXRpb24pO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5lbnRpdHlfbWFuYWdlci5nZXRUeXBlT2ZSYW5nZSgpKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLkF0dGFjazpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuYXR0YWNrRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLlJhaXNlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5yYWlzZUVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLmhpZGVSYW5nZSgpO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yLnNob3coKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHBpY2tQb3NpdGlvbihwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRfZW50aXR5KSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAodGhpcy5lbnRpdHlfbWFuYWdlci5nZXRUeXBlT2ZSYW5nZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5Nb3ZlOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24gPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5tb3ZlRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIuZ2V0RW50aXR5QXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghIWVudGl0eSkge1xyXG4gICAgICAgICAgICAvLyBubyBlbnRpdHkgc2VsZWN0ZWQsIGNsaWNrZWQgb24gZW50aXR5IC0gdHJ5IHRvIHNlbGVjdCBpdFxyXG4gICAgICAgICAgICBsZXQgc3VjY2VzcyA9IHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7IHJldHVybjsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3dPcHRpb25NZW51KE1lbnVPcHRpb25zLmdldE9mZk1lbnVPcHRpb25zKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb3BlblNob3AoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LlNob3ApO1xyXG4gICAgICAgIGlmICghdGhpcy5zaG9wX3VuaXRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cyA9IG5ldyBNZW51U2hvcFVuaXRzKHRoaXMuZnJhbWVfZ3JvdXAsIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5zaG9wX3VuaXRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIHRoaXMuZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlKSk7XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnNob3codHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvID0gbmV3IE1lbnVTaG9wSW5mbyh0aGlzLmZyYW1lX2dyb3VwLCBhbGxpYW5jZSk7XHJcbiAgICAgICAgdGhpcy5zaG9wX2luZm8udXBkYXRlQ29udGVudChFbnRpdHlUeXBlLlNvbGRpZXIpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLnNob3BfaW5mbyk7XHJcbiAgICAgICAgdGhpcy5zaG9wX2luZm8uc2hvdyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsb3NlU2hvcCgpIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzLmhpZGUodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzID0gbnVsbDtcclxuICAgICAgICB0aGlzLnNob3BfaW5mby5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9wZW5NYXAoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LkFjayk7XHJcbiAgICAgICAgdGhpcy5taW5pX21hcCA9IG5ldyBNaW5pTWFwKHRoaXMubWFwLCB0aGlzLmVudGl0eV9tYW5hZ2VyLCB0aGlzLmZyYW1lX2dyb3VwLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5taW5pX21hcCk7XHJcbiAgICAgICAgdGhpcy5taW5pX21hcC5zaG93KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xvc2VNYXAoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgIHRoaXMubWluaV9tYXAuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLm1pbmlfbWFwID0gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJlbnVtIFRpbGUge1xyXG4gICAgUGF0aCxcclxuICAgIEdyYXNzLFxyXG4gICAgRm9yZXN0LFxyXG4gICAgSGlsbCxcclxuICAgIE1vdW50YWluLFxyXG4gICAgV2F0ZXIsXHJcbiAgICBCcmlkZ2UsXHJcbiAgICBIb3VzZSxcclxuICAgIENhc3RsZVxyXG59XHJcbmludGVyZmFjZSBJQnVpbGRpbmcge1xyXG4gICAgY2FzdGxlOiBib29sZWFuO1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxufVxyXG5pbnRlcmZhY2UgQnVpbGRpbmdTYXZlIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxufVxyXG5cclxuY2xhc3MgTWFwIHtcclxuXHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBzdGFydF9lbnRpdGllczogSUVudGl0eVtdO1xyXG5cclxuICAgIHByaXZhdGUgdGlsZXM6IFRpbGVbXVtdO1xyXG4gICAgcHJpdmF0ZSBidWlsZGluZ3M6IElCdWlsZGluZ1tdO1xyXG5cclxuICAgIHN0YXRpYyBnZXRUaWxlRm9yQ29kZShjb2RlOiBudW1iZXIpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuVElMRVNfUFJPUFtjb2RlXTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGdldENvc3RGb3JUaWxlKHRpbGU6IFRpbGUsIGVudGl0eTogRW50aXR5KTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5XYXRlciAmJiBlbnRpdHkudHlwZSA9PSBFbnRpdHlUeXBlLkxpemFyZCkge1xyXG4gICAgICAgICAgICAvLyBMaXphcmQgb24gd2F0ZXJcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29zdCA9IDA7XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbiB8fCB0aWxlID09IFRpbGUuV2F0ZXIpIHtcclxuICAgICAgICAgICAgY29zdCA9IDM7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlID09IFRpbGUuRm9yZXN0IHx8IHRpbGUgPT0gVGlsZS5IaWxsKSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHtcclxuICAgICAgICAgICAgLy8gTGl6YXJkIGZvciBldmVyeXRoaW5nIGV4Y2VwdCB3YXRlclxyXG4gICAgICAgICAgICByZXR1cm4gY29zdCAqIDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29zdDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXREZWZGb3JUaWxlKHRpbGU6IFRpbGUsIGVudGl0eTogRW50aXR5KTogbnVtYmVyIHtcclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluIHx8IHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7IHJldHVybiAzOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Gb3Jlc3QgfHwgdGlsZSA9PSBUaWxlLkhpbGwpIHsgcmV0dXJuIDI7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLldhdGVyICYmIGVudGl0eSAmJiBlbnRpdHkudHlwZSA9PSBFbnRpdHlUeXBlLkxpemFyZCkgeyByZXR1cm4gMjsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuR3Jhc3MpIHsgcmV0dXJuIDE7IH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMubG9hZCgpO1xyXG4gICAgfVxyXG4gICAgbG9hZCgpIHtcclxuICAgICAgICBpZiAoIUFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuY2hlY2tCaW5hcnlLZXkodGhpcy5uYW1lKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBmaW5kIG1hcDogXCIgKyB0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkaW5ncyA9IFtdO1xyXG4gICAgICAgIHRoaXMuc3RhcnRfZW50aXRpZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnRpbGVzID0gW107XHJcblxyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkodGhpcy5uYW1lKTtcclxuICAgICAgICBsZXQgZGF0YSA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVzW3hdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvZGUgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBNYXAuZ2V0VGlsZUZvckNvZGUoY29kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVzW3hdW3ldID0gdGlsZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRpbmdzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXN0bGU6ICh0aWxlID09IFRpbGUuQ2FzdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBQb3MoeCwgeSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbGlhbmNlOiA8QWxsaWFuY2U+IE1hdGguZmxvb3IoKGNvZGUgLSBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMpIC8gMylcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNraXAgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNCArIHNraXAgKiA0O1xyXG5cclxuICAgICAgICBsZXQgbnVtYmVyX29mX2VudGl0aWVzID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX2VudGl0aWVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRlc2MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBsZXQgdHlwZTogRW50aXR5VHlwZSA9IGRlc2MgJSAxMTtcclxuICAgICAgICAgICAgbGV0IGFsbGlhbmNlOiBBbGxpYW5jZSA9IE1hdGguZmxvb3IoZGVzYyAvIDExKSArIDE7XHJcblxyXG4gICAgICAgICAgICBsZXQgeCA9IE1hdGguZmxvb3IoZGF0YS5nZXRVaW50MTYoaW5kZXgpIC8gMTYpO1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG4gICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoZGF0YS5nZXRVaW50MTYoaW5kZXgpIC8gMTYpO1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zdGFydF9lbnRpdGllcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgICAgICBhbGxpYW5jZTogYWxsaWFuY2UsXHJcbiAgICAgICAgICAgICAgICB4OiB4LFxyXG4gICAgICAgICAgICAgICAgeTogeVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbXBvcnRFbnRpdGllcyhlbnRpdGllczogSUVudGl0eVtdKSB7XHJcbiAgICAgICAgdGhpcy5zdGFydF9lbnRpdGllcyA9IGVudGl0aWVzO1xyXG4gICAgfVxyXG4gICAgaW1wb3J0QnVpbGRpbmdzKGJ1aWxkaW5nczogQnVpbGRpbmdTYXZlW10pIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiBidWlsZGluZ3MpIHtcclxuICAgICAgICAgICAgbGV0IG1hdGNoID0gdGhpcy5nZXRCdWlsZGluZ0F0KG5ldyBQb3MoYnVpbGRpbmcueCwgYnVpbGRpbmcueSkpO1xyXG4gICAgICAgICAgICBpZiAoIW1hdGNoKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIG1hdGNoLmFsbGlhbmNlID0gYnVpbGRpbmcuYWxsaWFuY2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0VGlsZUF0KHBvc2l0aW9uOiBQb3MpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcclxuICAgIH1cclxuICAgIGdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbjogUG9zKTogVGlsZVtdIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgcG9zaXRpb24ueSA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA8IHRoaXMud2lkdGggLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPCB0aGlzLmhlaWdodCAtIDEgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSkgOiAtMVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChwOiBQb3MpOiBQb3NbXSB7XHJcbiAgICAgICAgbGV0IHJldDogUG9zW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XHJcbiAgICAgICAgaWYgKHAueSA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSAtIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPCB0aGlzLndpZHRoIC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCArIDEsIHAueSkpOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMuaGVpZ2h0IC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCwgcC55ICsgMSkpOyB9XHJcbiAgICAgICAgaWYgKHAueCA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggLSAxLCBwLnkpKTsgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgc2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zLCBhbGxpYW5jZTogQWxsaWFuY2UpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIGJ1aWxkaW5nLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBnZXRCdWlsZGluZ0F0KHBvc2l0aW9uOiBQb3MpOiBJQnVpbGRpbmcge1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKXtcclxuICAgICAgICAgICAgaWYgKGJ1aWxkaW5nLnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZ2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgbGV0IGJ1aWxkaW5nID0gdGhpcy5nZXRCdWlsZGluZ0F0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoISFidWlsZGluZykgeyByZXR1cm4gYnVpbGRpbmcuYWxsaWFuY2U7IH1cclxuICAgICAgICByZXR1cm4gQWxsaWFuY2UuTm9uZTtcclxuICAgIH1cclxuICAgIGdldE9jY3VwaWVkSG91c2VzKCk6IElCdWlsZGluZ1tdIHtcclxuICAgICAgICBsZXQgaG91c2VzOiBJQnVpbGRpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKXtcclxuICAgICAgICAgICAgaWYgKCFidWlsZGluZy5jYXN0bGUgJiYgYnVpbGRpbmcuYWxsaWFuY2UgIT0gQWxsaWFuY2UuTm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaG91c2VzLnB1c2goYnVpbGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBob3VzZXM7XHJcbiAgICB9XHJcbiAgICBnZXRTdGFydEVudGl0aWVzKCk6IElFbnRpdHlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRfZW50aXRpZXM7XHJcbiAgICB9XHJcbiAgICBnZXRDb3N0QXQocG9zaXRpb246IFBvcywgZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICByZXR1cm4gTWFwLmdldENvc3RGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxuICAgIGdldERlZkF0KHBvc2l0aW9uOiBQb3MsIGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hcC5nZXREZWZGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxuICAgIGV4cG9ydEJ1aWxkaW5nQWxsaWFuY2VzKCk6IEJ1aWxkaW5nU2F2ZVtdIHtcclxuICAgICAgICBsZXQgZXhwOiBCdWlsZGluZ1NhdmVbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5hbGxpYW5jZSA9PSBBbGxpYW5jZS5Ob25lKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGV4cC5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHg6IGJ1aWxkaW5nLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgICAgICB5OiBidWlsZGluZy5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgICAgICAgYWxsaWFuY2U6IGJ1aWxkaW5nLmFsbGlhbmNlXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhwO1xyXG4gICAgfVxyXG4gICAgaXNDYW1wYWlnbigpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5uYW1lLmNoYXJBdCgwKSA9PSBcIm1cIjtcclxuICAgIH1cclxuICAgIGdldE1hcCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLm5hbWUuY2hhckF0KDEpLCAxMCk7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBBbGxpYW5jZSB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIEJsdWUgPSAxLFxyXG4gICAgUmVkID0gMlxyXG59XHJcbmNsYXNzIFRpbGVNYW5hZ2VyIHtcclxuXHJcbiAgICBtYXA6IE1hcDtcclxuICAgIHdhdGVyU3RhdGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgdGlsZW1hcDogUGhhc2VyLlRpbGVtYXA7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGJhY2tncm91bmRMYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuICAgIGJ1aWxkaW5nTGF5ZXI6IFBoYXNlci5UaWxlbWFwTGF5ZXI7XHJcblxyXG4gICAgd2F0ZXJUaW1lcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBzdGF0aWMgZG9lc1RpbGVDdXRHcmFzcyh0aWxlOiBUaWxlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0aWxlID09IFRpbGUuUGF0aCB8fCB0aWxlID09IFRpbGUuV2F0ZXIgfHwgdGlsZSA9PSBUaWxlLkJyaWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGU6IFRpbGUpOiBudW1iZXIge1xyXG5cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5IaWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEJhc2VJbWFnZUluZGV4Rm9yVGlsZSh0aWxlOiBUaWxlKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDIxO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxODtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhvdXNlOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQ2FzdGxlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbGVNYW5hZ2VyLmdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgdGlsZW1hcDogUGhhc2VyLlRpbGVtYXAsIHRpbGVtYXBfZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcCA9IHRpbGVtYXA7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IHRpbGVtYXBfZ3JvdXA7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJ0aWxlczBcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIDApO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMFwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTKTtcclxuICAgICAgICB0aGlzLnRpbGVtYXAuYWRkVGlsZXNldEltYWdlKFwiYnVpbGRpbmdzXzFcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyArIDMpO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMlwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTICsgNik7XHJcblxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExheWVyID0gdGhpcy50aWxlbWFwLmNyZWF0ZShcImJhY2tncm91bmRcIiwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExheWVyLnJlc2l6ZVdvcmxkKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmdMYXllciA9IHRoaXMudGlsZW1hcC5jcmVhdGVCbGFua0xheWVyKFwiYnVpbGRpbmdcIiwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMuZ3JvdXApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5tYXAud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMubWFwLmhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUaWxlQXQobmV3IFBvcyh4LCB5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy53YXRlclRpbWVyICs9IHN0ZXBzO1xyXG4gICAgICAgIGlmICh0aGlzLndhdGVyVGltZXIgPiAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLndhdGVyVGltZXIgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdhdGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVXYXRlcigpIHtcclxuICAgICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLndhdGVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy53YXRlclN0YXRlID0gMSAtIHRoaXMud2F0ZXJTdGF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlbWFwLnJlcGxhY2UoMjEgKyBvbGRTdGF0ZSwgMjEgKyB0aGlzLndhdGVyU3RhdGUsIDAsIDAsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQsIHRoaXMuYmFja2dyb3VuZExheWVyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3VGlsZUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZSh0aGlzLmdldEltYWdlSW5kZXhGb3JCYWNrZ3JvdW5kQXQocG9zaXRpb24pLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCB0aGlzLmJhY2tncm91bmRMYXllcik7XHJcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBvYmogPSBUaWxlTWFuYWdlci5nZXRJbWFnZUluZGV4Rm9yT2JqZWN0VGlsZSh0aWxlKTtcclxuICAgICAgICBpZiAob2JqID49IDApIHtcclxuICAgICAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIG9iaiArPSBhbGxpYW5jZSAqIDM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkNhc3RsZSAmJiBwb3NpdGlvbi55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJvb2Ygb2YgY2FzdGxlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUob2JqICsgMSwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEsIHRoaXMuYnVpbGRpbmdMYXllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUob2JqLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCB0aGlzLmJ1aWxkaW5nTGF5ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldEltYWdlSW5kZXhGb3JCYWNrZ3JvdW5kQXQocG9zaXRpb246IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIC8vIFdhdGVyXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICAvLyBCcmlkZ2VcclxuICAgICAgICAgICAgICAgIGxldCBhZGogPSB0aGlzLm1hcC5nZXRBZGphY2VudFRpbGVzQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFkalswXSAhPSBUaWxlLldhdGVyIHx8IGFkalsyXSAhPSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIC8vIFBhdGhcclxuICAgICAgICAgICAgICAgIHJldHVybiAxODtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkdyYXNzOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbWFnZUluZGV4Rm9yR3Jhc3NBdChwb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfVxyXG4gICAgZ2V0SW1hZ2VJbmRleEZvckdyYXNzQXQocG9zaXRpb246IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGFkaiA9IHRoaXMubWFwLmdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGN1dCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZGoubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY3V0ICs9IE1hdGgucG93KDIsIGkpICogKFRpbGVNYW5hZ2VyLmRvZXNUaWxlQ3V0R3Jhc3MoYWRqW2ldKSA/IDEgOiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgNCArIDIgKyAxKSB7IHJldHVybiAzOyB9IC8vIGFsbCAtIG5vdCBzdXBwbGllZFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDQgKyAxKSB7IHJldHVybiAxNjsgfSAvLyB0b3AgYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDggKyA0ICsgMikgeyByZXR1cm4gMTA7IH0gLy8gcmlnaHQgYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQgKyAyICsgMSkgeyByZXR1cm4gMTc7IH0gLy8gdG9wIHJpZ2h0IGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDIgKyAxKSB7IHJldHVybiAxNDsgfSAvLyB0b3AgcmlnaHQgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSArIDgpIHsgcmV0dXJuIDEyOyB9IC8vIHRvcCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0ICsgOCkgeyByZXR1cm4gODsgfSAvLyBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gMiArIDQpIHsgcmV0dXJuIDk7IH0gLy8gcmlnaHQgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgMikgeyByZXR1cm4gMTM7IH0gLy8gdG9wIHJpZ2h0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgNCkgeyByZXR1cm4gMTU7IH0gLy8gdG9wIGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMiArIDgpIHsgcmV0dXJuIDY7IH0gLy8gcmlnaHQgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCkgeyByZXR1cm4gNDsgfSAvLyBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0KSB7IHJldHVybiA3OyB9IC8vIGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMikgeyByZXR1cm4gNTsgfSAvLyByaWdodFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSkgeyByZXR1cm4gMTE7IH0gLy8gdG9wXHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIExpbmVQYXJ0IHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBkaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIGxlbmd0aDogbnVtYmVyO1xyXG59XHJcbmludGVyZmFjZSBFbnRpdHlNb3ZlIHtcclxuICAgIGVudGl0eTogRW50aXR5O1xyXG4gICAgdGFyZ2V0OiBQb3M7XHJcbiAgICBsaW5lOiBMaW5lUGFydFtdO1xyXG4gICAgcHJvZ3Jlc3M6IG51bWJlcjtcclxufVxyXG5pbnRlcmZhY2UgRW50aXR5TWFuYWdlckRlbGVnYXRlIHtcclxuICAgIGVudGl0eURpZE1vdmUoZW50aXR5OiBFbnRpdHkpOiB2b2lkO1xyXG4gICAgZW50aXR5RGlkQW5pbWF0aW9uKGVudGl0eTogRW50aXR5KTogdm9pZDtcclxufVxyXG5cclxuY2xhc3MgRW50aXR5TWFuYWdlciB7XHJcblxyXG4gICAgZGVsZWdhdGU6IEVudGl0eU1hbmFnZXJEZWxlZ2F0ZTtcclxuXHJcbiAgICBlbnRpdGllczogRW50aXR5W107XHJcbiAgICBwcml2YXRlIG1hcDogTWFwO1xyXG5cclxuICAgIHByaXZhdGUgbW92aW5nOiBFbnRpdHlNb3ZlO1xyXG5cclxuICAgIHByaXZhdGUgYW5pbV9pZGxlX3N0YXRlOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgc2VsZWN0aW9uX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGludGVyYWN0aW9uX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGFuaW1fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgcHJpdmF0ZSBpbnRlcmFjdGlvbl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG5cclxuICAgIHByaXZhdGUgZW50aXR5X3JhbmdlOiBFbnRpdHlSYW5nZTtcclxuXHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25fdGFyZ2V0c194OiBFbnRpdHlbXTtcclxuICAgIHByaXZhdGUgc2VsZWN0aW9uX3RhcmdldHNfeTogRW50aXR5W107XHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl9pbmRleF94OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl9pbmRleF95OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGVudGl0eV9ncm91cDogUGhhc2VyLkdyb3VwLCBzZWxlY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cCwgaW50ZXJhY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cCwgYW5pbV9ncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlKSB7XHJcblxyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwID0gZW50aXR5X2dyb3VwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyb3VwID0gc2VsZWN0aW9uX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAgPSBpbnRlcmFjdGlvbl9ncm91cDtcclxuICAgICAgICB0aGlzLmFuaW1fZ3JvdXAgPSBhbmltX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MgPSBzZWxlY3Rpb25fZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgc2VsZWN0aW9uX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzID0gaW50ZXJhY3Rpb25fZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgaW50ZXJhY3Rpb25fZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLm1vdmluZyA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9pZGxlX3N0YXRlID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiBtYXAuZ2V0U3RhcnRFbnRpdGllcygpKSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gdGhpcy5jcmVhdGVFbnRpdHkoZW50aXR5LnR5cGUsIGVudGl0eS5hbGxpYW5jZSwgbmV3IFBvcyhlbnRpdHkueCwgZW50aXR5LnkpKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRpdHkucmFuayAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBlLnJhbmsgPSBlbnRpdHkucmFuaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGVudGl0eS5lcCAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBlLmVwID0gZW50aXR5LmVwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZW50aXR5LmRlYXRoX2NvdW50ICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGUuZGVhdGhfY291bnQgPSBlbnRpdHkuZGVhdGhfY291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRpdHkuc3RhdHVzICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGUuc3RhdHVzID0gZW50aXR5LnN0YXR1cztcclxuICAgICAgICAgICAgICAgIGUudXBkYXRlU3RhdHVzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlbnRpdHkuaGVhbHRoICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGUuc2V0SGVhbHRoKGVudGl0eS5oZWFsdGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZW50aXR5LnN0YXRlICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGUudXBkYXRlU3RhdGUoZW50aXR5LnN0YXRlLCB0cnVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UgPSBuZXcgRW50aXR5UmFuZ2UodGhpcy5tYXAsIHRoaXMsIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVFbnRpdHkodHlwZTogRW50aXR5VHlwZSwgYWxsaWFuY2U6IEFsbGlhbmNlLCBwb3NpdGlvbjogUG9zKTogRW50aXR5IHtcclxuICAgICAgICBsZXQgZW50aXR5ID0gbmV3IEVudGl0eSh0eXBlLCBhbGxpYW5jZSwgcG9zaXRpb24sIHRoaXMuZW50aXR5X2dyb3VwKTtcclxuICAgICAgICB0aGlzLmVudGl0aWVzLnB1c2goZW50aXR5KTtcclxuICAgICAgICByZXR1cm4gZW50aXR5O1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVudGl0aWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkgPT0gdGhpcy5lbnRpdGllc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbnRpdHkuZGVzdHJveSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVudGl0eUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRLaW5nUG9zaXRpb24oYWxsaWFuY2U6IEFsbGlhbmNlKTogUG9zIHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlICYmIGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuS2luZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3MoMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFR1cm4oYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuZW50aXRpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXRpZXNbaV07XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkuaXNEZWFkKCkpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5kZWF0aF9jb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVudGl0eS5kZWF0aF9jb3VudCA+PSBBbmNpZW50RW1waXJlcy5ERUFUSF9DT1VOVCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5oID0gTWF0aC5taW4oZW50aXR5LmhlYWx0aCArIDIsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkuc2V0SGVhbHRoKG5oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zdGF0ZSA9IEVudGl0eVN0YXRlLk1vdmVkO1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmNsZWFyU3RhdHVzKEVudGl0eVN0YXR1cy5Qb2lzb25lZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHNob3cgPSAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlKTtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZVN0YXRlKGVudGl0eS5zdGF0ZSwgc2hvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIG1vdmUgc2VsZWN0ZWQgZW50aXR5IGluIGEgaGlnaGVyIGdyb3VwXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAucmVtb3ZlKGVudGl0eS5zcHJpdGUpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwLnJlbW92ZShlbnRpdHkuaWNvbl9oZWFsdGgpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAuYWRkKGVudGl0eS5zcHJpdGUpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAuYWRkKGVudGl0eS5pY29uX2hlYWx0aCk7XHJcbiAgICB9XHJcbiAgICBkZXNlbGVjdEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIG1vdmUgc2VsZWN0ZWQgZW50aXR5IGJhY2sgdG8gYWxsIG90aGVyIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5yZW1vdmUoZW50aXR5LnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5yZW1vdmUoZW50aXR5Lmljb25faGVhbHRoKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5hZGRBdChlbnRpdHkuaWNvbl9oZWFsdGgsIDApO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwLmFkZEF0KGVudGl0eS5zcHJpdGUsIDApO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVudGl0eU9wdGlvbnMoZW50aXR5OiBFbnRpdHksIG1vdmVkOiBib29sZWFuID0gZmFsc2UpOiBBY3Rpb25bXSB7XHJcblxyXG4gICAgICAgIGlmIChlbnRpdHkuc3RhdGUgIT0gRW50aXR5U3RhdGUuUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9wdGlvbnM6IEFjdGlvbltdID0gW107XHJcblxyXG4gICAgICAgIGlmICghbW92ZWQgJiYgZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuQnV5KSAmJiB0aGlzLm1hcC5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLkJVWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbnRBdHRhY2tBZnRlck1vdmluZykgfHwgIW1vdmVkKSB7XHJcbiAgICAgICAgICAgIGxldCBhdHRhY2tfdGFyZ2V0cyA9IHRoaXMuZ2V0QXR0YWNrVGFyZ2V0cyhlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAoYXR0YWNrX3RhcmdldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5BVFRBQ0spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuUmFpc2UpKSB7XHJcbiAgICAgICAgICAgIGxldCByYWlzZV90YXJnZXRzID0gdGhpcy5nZXRSYWlzZVRhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgaWYgKHJhaXNlX3RhcmdldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5SQUlTRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KGVudGl0eS5wb3NpdGlvbikgIT0gZW50aXR5LmFsbGlhbmNlICYmICgoZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuT2NjdXB5SG91c2UpICYmIHRoaXMubWFwLmdldFRpbGVBdChlbnRpdHkucG9zaXRpb24pID09IFRpbGUuSG91c2UpIHx8IChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5PY2N1cHlDYXN0bGUpICYmIHRoaXMubWFwLmdldFRpbGVBdChlbnRpdHkucG9zaXRpb24pID09IFRpbGUuQ2FzdGxlKSkpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5PQ0NVUFkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1vdmVkKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uRU5EX01PVkUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uTU9WRSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyLCBjdXJzb3JfcG9zaXRpb246IFBvcywgYW5pbV9zdGF0ZTogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1faWRsZV9zdGF0ZSAhPSBhbmltX3N0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc2V0RnJhbWUodGhpcy5hbmltX2lkbGVfc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UudXBkYXRlKHN0ZXBzLCBjdXJzb3JfcG9zaXRpb24sIGFuaW1fc3RhdGUsIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzLCB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzKTtcclxuICAgICAgICB0aGlzLmFuaW1hdGVNb3ZpbmdFbnRpdHkoc3RlcHMpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG5cclxuICAgICAgICAtLS0tLSBSQU5HRVxyXG5cclxuICAgICAqL1xyXG5cclxuICAgIHNob3dSYW5nZSh0eXBlOiBFbnRpdHlSYW5nZVR5cGUsIGVudGl0eTogRW50aXR5KSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09IEVudGl0eVJhbmdlVHlwZS5BdHRhY2sgfHwgdHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuUmFpc2UpIHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldHNfeDogRW50aXR5W107XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXRzX3k6IEVudGl0eVtdO1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzX3ggPSB0aGlzLmdldEF0dGFja1RhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLlJhaXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzX3ggPSB0aGlzLmdldFJhaXNlVGFyZ2V0cyhlbnRpdHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0YXJnZXRzX3kgPSB0YXJnZXRzX3guc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgIHRhcmdldHNfeC5zb3J0KChhOiBFbnRpdHksIGI6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueCA9PSBiLnBvc2l0aW9uLngpIHsgcmV0dXJuIGEucG9zaXRpb24ueSAtIGIucG9zaXRpb24ueTsgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRhcmdldHNfeS5zb3J0KChhOiBFbnRpdHksIGI6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueSA9PSBiLnBvc2l0aW9uLnkpIHsgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDsgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueSAtIGIucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeCA9IHRhcmdldHNfeDtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c195ID0gdGFyZ2V0c195O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2luZGV4X3kgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UuY3JlYXRlUmFuZ2UodHlwZSwgZW50aXR5LCB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVJhbmdlKCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c195ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVudGl0eV9yYW5nZS5jbGVhcih0aGlzLnNlbGVjdGlvbl9ncmFwaGljcywgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFRhcmdldEluUmFuZ2UoZGlyZWN0aW9uOiBEaXJlY3Rpb24pOiBFbnRpdHkge1xyXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c194IHx8ICF0aGlzLnNlbGVjdGlvbl90YXJnZXRzX3kpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcG9zID0gbmV3IFBvcygwLCAwKS5tb3ZlKGRpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIGlmIChwb3MueCAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2luZGV4X3ggKz0gcG9zLng7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbl9pbmRleF94IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeCA9IHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2VsZWN0aW9uX2luZGV4X3ggPj0gdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c194Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeFt0aGlzLnNlbGVjdGlvbl9pbmRleF94XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeSArPSBwb3MueTtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb25faW5kZXhfeSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeSA9IHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeS5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZWxlY3Rpb25faW5kZXhfeSA+PSB0aGlzLnNlbGVjdGlvbl90YXJnZXRzX3kubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2luZGV4X3kgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c195W3RoaXMuc2VsZWN0aW9uX2luZGV4X3ldO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGVPZlJhbmdlKCk6IEVudGl0eVJhbmdlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5X3JhbmdlLnR5cGU7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0QXR0YWNrVGFyZ2V0cyhlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIGxldCB0YXJnZXRzOiBFbnRpdHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGVuZW15IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVuZW15LmFsbGlhbmNlID09IGVudGl0eS5hbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoZW5lbXkuaXNEZWFkKCkpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkoZW5lbXkpO1xyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPiBlbnRpdHkuZGF0YS5tYXgpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgZW50aXR5LmRhdGEubWluKSB7IGNvbnRpbnVlOyB9XHJcblxyXG4gICAgICAgICAgICB0YXJnZXRzLnB1c2goZW5lbXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGFyZ2V0cztcclxuICAgIH1cclxuICAgIGdldFJhaXNlVGFyZ2V0cyhlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIGxldCB0YXJnZXRzOiBFbnRpdHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGRlYWQgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoIWRlYWQuaXNEZWFkKCkpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkoZGVhZCk7XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSAhPSAxKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIHRhcmdldHMucHVzaChkZWFkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldHM7XHJcbiAgICB9XHJcblxyXG4gICAgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRW50aXR5QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgYW5pbWF0aW9uLmVudGl0eS5hbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHN3aXRjaCAoYW5pbWF0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlBbmltYXRpb25UeXBlLkF0dGFjazpcclxuICAgICAgICAgICAgICAgIGxldCBhdHRhY2sgPSA8QXR0YWNrQW5pbWF0aW9uPiBhbmltYXRpb247XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay5maXJzdCAmJiB0aGlzLnNob3VsZENvdW50ZXIoYXR0YWNrLmVudGl0eSwgYXR0YWNrLmF0dGFja2VyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNrRW50aXR5KGF0dGFjay5lbnRpdHksIGF0dGFjay5hdHRhY2tlciwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZW50aXR5RGlkQW5pbWF0aW9uKGF0dGFjay5lbnRpdHkpO1xyXG5cclxuICAgICAgICAgICAgICAgIGxldCBhdHRhY2tlciA9IGF0dGFjay5maXJzdCA/IGF0dGFjay5hdHRhY2tlciA6IGF0dGFjay5lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0ID0gYXR0YWNrLmZpcnN0ID8gYXR0YWNrLmVudGl0eSA6IGF0dGFjay5hdHRhY2tlcjtcclxuXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VyLmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuUG9pc29uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5zZXRTdGF0dXMoRW50aXR5U3RhdHVzLlBvaXNvbmVkKTtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc3RhdHVzX2FuaW1hdGlvbiA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZXIuc2hvdWxkUmFua1VwKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlci5zdGF0dXNfYW5pbWF0aW9uID0gMjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuc2hvdWxkUmFua1VwKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc3RhdHVzX2FuaW1hdGlvbiA9IDI7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VyLmlzRGVhZCgpIHx8IGF0dGFja2VyLnN0YXR1c19hbmltYXRpb24gPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFja2VyLnN0YXJ0QW5pbWF0aW9uKG5ldyBTdGF0dXNBbmltYXRpb24oYXR0YWNrZXIsIHRoaXMsIHRoaXMuYW5pbV9ncm91cCwgYXR0YWNrZXIuaXNEZWFkKCkgPyAtMSA6IGF0dGFja2VyLnN0YXR1c19hbmltYXRpb24pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQuaXNEZWFkKCkgfHwgdGFyZ2V0LnN0YXR1c19hbmltYXRpb24gPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5zdGFydEFuaW1hdGlvbihuZXcgU3RhdHVzQW5pbWF0aW9uKHRhcmdldCwgdGhpcywgdGhpcy5hbmltX2dyb3VwLCB0YXJnZXQuaXNEZWFkKCkgPyAtMSA6IHRhcmdldC5zdGF0dXNfYW5pbWF0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlBbmltYXRpb25UeXBlLlN0YXR1czpcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5lbnRpdHkuc3RhdHVzX2FuaW1hdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5QW5pbWF0aW9uVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZW50aXR5RGlkQW5pbWF0aW9uKGFuaW1hdGlvbi5lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGF0dGFja0VudGl0eShhdHRhY2tlcjogRW50aXR5LCB0YXJnZXQ6IEVudGl0eSwgZmlyc3Q6IGJvb2xlYW4gPSB0cnVlKSB7XHJcbiAgICAgICAgYXR0YWNrZXIuYXR0YWNrKHRhcmdldCwgdGhpcy5tYXApO1xyXG4gICAgICAgIHRhcmdldC5zdGFydEFuaW1hdGlvbihuZXcgQXR0YWNrQW5pbWF0aW9uKHRhcmdldCwgdGhpcywgdGhpcy5hbmltX2dyb3VwLCBhdHRhY2tlciwgZmlyc3QpKTtcclxuICAgIH1cclxuICAgIHJhaXNlRW50aXR5KHdpemFyZDogRW50aXR5LCB0b21iOiBFbnRpdHkpIHtcclxuICAgICAgICB0b21iLnN0YXJ0QW5pbWF0aW9uKG5ldyBSYWlzZUFuaW1hdGlvbih0b21iLCB0aGlzLCB0aGlzLmFuaW1fZ3JvdXAsIHdpemFyZC5hbGxpYW5jZSkpO1xyXG4gICAgfVxyXG4gICAgc2hvdWxkQ291bnRlcihhdHRhY2tlcjogRW50aXR5LCB0YXJnZXQ6IEVudGl0eSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChhdHRhY2tlci5oZWFsdGggPiAwICYmIGF0dGFja2VyLmdldERpc3RhbmNlVG9FbnRpdHkodGFyZ2V0KSA8IDIgJiYgYXR0YWNrZXIuZGF0YS5taW4gPCAyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuXHJcbiAgICAgICAgLS0tLS0gTU9WRSBFTlRJVFlcclxuXHJcbiAgICAgKi9cclxuXHJcbiAgICBtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5LCB0YXJnZXQ6IFBvcywgYW5pbWF0ZTogYm9vbGVhbiA9IHRydWUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgICAgICAgZW50aXR5LnBvc2l0aW9uID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICBlbnRpdHkuc2V0V29ybGRQb3NpdGlvbih0YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIXRoaXMuZ2V0RW50aXR5QXQodGFyZ2V0KSAmJiAhdGFyZ2V0Lm1hdGNoKGVudGl0eS5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgLy8gQ2FudCBtb3ZlIHdoZXJlIGFub3RoZXIgdW5pdCBpc1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB3YXlwb2ludCA9IHRoaXMuZW50aXR5X3JhbmdlLmdldFdheXBvaW50QXQodGFyZ2V0KTtcclxuICAgICAgICBpZiAoIXdheXBvaW50KSB7XHJcbiAgICAgICAgICAgIC8vIHRhcmdldCBub3QgaW4gcmFuZ2VcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbGluZSA9IEVudGl0eVJhbmdlLmdldExpbmVUb1dheXBvaW50KHdheXBvaW50KTtcclxuICAgICAgICB0aGlzLm1vdmluZyA9IHtcclxuICAgICAgICAgICAgZW50aXR5OiBlbnRpdHksXHJcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxyXG4gICAgICAgICAgICBsaW5lOiBsaW5lLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5oaWRlUmFuZ2UoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXNldFdpc3AoYWxsaWFuY2U6IEFsbGlhbmNlLCBzaG93OiBib29sZWFuKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSAhPSBhbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBlbnRpdHkuY2xlYXJTdGF0dXMoRW50aXR5U3RhdHVzLldpc3BlZCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1dpc3BJblJhbmdlKGVudGl0eSkpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zZXRTdGF0dXMoRW50aXR5U3RhdHVzLldpc3BlZCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2hvdykgeyBlbnRpdHkuc3RhcnRBbmltYXRpb24obmV3IFN0YXR1c0FuaW1hdGlvbihlbnRpdHksIHRoaXMsIHRoaXMuYW5pbV9ncm91cCwgMSkpOyB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0RW50aXRpZXMoKTogSUVudGl0eVtdIHtcclxuICAgICAgICBsZXQgZXhwOiBJRW50aXR5W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBleHAucHVzaChlbnRpdHkuZXhwb3J0KCkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXhwO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgYW5pbWF0ZU1vdmluZ0VudGl0eShzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1vdmluZykgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IG1vdmUgPSB0aGlzLm1vdmluZztcclxuICAgICAgICBsZXQgZW50aXR5ID0gbW92ZS5lbnRpdHk7XHJcblxyXG4gICAgICAgIG1vdmUucHJvZ3Jlc3MgKz0gc3RlcHM7XHJcblxyXG4gICAgICAgIC8vIGZpcnN0IGNoZWNrIGlzIHNvIHdlIGNhbiBzdGF5IGF0IHRoZSBzYW1lIHBsYWNlXHJcbiAgICAgICAgaWYgKG1vdmUubGluZS5sZW5ndGggPiAwICYmIG1vdmUucHJvZ3Jlc3MgPj0gbW92ZS5saW5lWzBdLmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkge1xyXG4gICAgICAgICAgICBtb3ZlLnByb2dyZXNzIC09IG1vdmUubGluZVswXS5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgICAgIG1vdmUubGluZS5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZS5saW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGRpZmYgPSBuZXcgUG9zKDAsIDApLm1vdmUobW92ZS5saW5lWzBdLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIGVudGl0eS53b3JsZF9wb3NpdGlvbi54ID0gbW92ZS5saW5lWzBdLnBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgKyBkaWZmLnggKiBtb3ZlLnByb2dyZXNzO1xyXG4gICAgICAgICAgICBlbnRpdHkud29ybGRfcG9zaXRpb24ueSA9IG1vdmUubGluZVswXS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi55ICogbW92ZS5wcm9ncmVzcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbnRpdHkucG9zaXRpb24gPSBtb3ZlLnRhcmdldDtcclxuICAgICAgICAgICAgZW50aXR5LndvcmxkX3Bvc2l0aW9uID0gbW92ZS50YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmluZyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZW50aXR5RGlkTW92ZShlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbnRpdHkudXBkYXRlKHN0ZXBzKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGhhc1dpc3BJblJhbmdlKGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgd2lzcCBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh3aXNwLmFsbGlhbmNlICE9IGVudGl0eS5hbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoIXdpc3AuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5XaXNwKSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBlbnRpdHkuZ2V0RGlzdGFuY2VUb0VudGl0eSh3aXNwKTtcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgMSB8fCBkaXN0YW5jZSA+IDIpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVdheXBvaW50IHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb3N0OiBudW1iZXI7XHJcbiAgICBmb3JtOiBudW1iZXI7XHJcbiAgICBwYXJlbnQ6IElXYXlwb2ludDtcclxufVxyXG5lbnVtIEVudGl0eVJhbmdlVHlwZSB7XHJcbiAgICBOb25lLFxyXG4gICAgTW92ZSxcclxuICAgIEF0dGFjayxcclxuICAgIFJhaXNlXHJcbn1cclxuY2xhc3MgRW50aXR5UmFuZ2Uge1xyXG5cclxuICAgIHdheXBvaW50czogSVdheXBvaW50W107XHJcbiAgICBtYXA6IE1hcDtcclxuICAgIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyO1xyXG5cclxuICAgIHR5cGU6IEVudGl0eVJhbmdlVHlwZTtcclxuXHJcbiAgICByYW5nZV9saWdodGVuOiBib29sZWFuO1xyXG4gICAgcmFuZ2VfcHJvZ3Jlc3M6IG51bWJlcjtcclxuXHJcbiAgICBsaW5lOiBMaW5lUGFydFtdO1xyXG4gICAgbGluZV9vZmZzZXQ6IG51bWJlcjtcclxuICAgIGxpbmVfZW5kX3Bvc2l0aW9uOiBQb3M7XHJcbiAgICBsaW5lX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4dHJhX2N1cnNvcjogU3ByaXRlO1xyXG5cclxuXHJcbiAgICBzdGF0aWMgZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uOiBQb3MsIHdheXBvaW50czogSVdheXBvaW50W10pIHtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB3YXlwb2ludHMpe1xyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7IHJldHVybiB3YXlwb2ludDsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRMaW5lVG9XYXlwb2ludCh3YXlwb2ludDogSVdheXBvaW50KTogTGluZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IGxpbmU6IExpbmVQYXJ0W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAod2F5cG9pbnQucGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSB3YXlwb2ludDtcclxuICAgICAgICAgICAgd2F5cG9pbnQgPSB3YXlwb2ludC5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gd2F5cG9pbnQucG9zaXRpb24uZ2V0RGlyZWN0aW9uVG8obmV4dC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDAgJiYgbGluZVswXS5kaXJlY3Rpb24gPT0gZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLnBvc2l0aW9uID0gd2F5cG9pbnQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLmxlbmd0aCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluZS51bnNoaWZ0KHtwb3NpdGlvbjogd2F5cG9pbnQucG9zaXRpb24sIGRpcmVjdGlvbjogZGlyZWN0aW9uLCBsZW5ndGg6IDF9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlciA9IGVudGl0eV9tYW5hZ2VyO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVJhbmdlVHlwZS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvciA9IG5ldyBTcHJpdGUoe3g6IDAsIHk6IDB9LCBncm91cCwgXCJjdXJzb3JcIiwgWzRdKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRXYXlwb2ludEF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICByZXR1cm4gRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCB0aGlzLndheXBvaW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gMTAwO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmVfZW5kX3Bvc2l0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxpbmVfc2xvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5saW5lX29mZnNldCA9IDA7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtwb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlVwKSwgY29zdDogMCwgZm9ybTogRGlyZWN0aW9uLkFsbCwgcGFyZW50OiBudWxsfSxcclxuICAgICAgICAgICAgICAgICAgICB7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5SaWdodCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uRG93biksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uTGVmdCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrOlxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW4gPSBlbnRpdHkuZGF0YS5taW47XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gZW50aXR5LmRhdGEubWF4O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gdGhpcy5jYWxjdWxhdGVXYXlwb2ludHMoZW50aXR5LCBtYXgsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgYWxsIHdheXBvaW50cyB0aGF0IGFyZSBuZWFyZXIgdGhhbiBtaW5pbXVtIHJhbmdlXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2F5cG9pbnQuY29zdCA8IG1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGb3JtKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2V0RnJhbWVzKFsyLCAzXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRPZmZzZXQoLTEsIC0xKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNob3coKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5Nb3ZlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy53YXlwb2ludHMgPSB0aGlzLmNhbGN1bGF0ZVdheXBvaW50cyhlbnRpdHksIGVudGl0eS5nZXRNb3ZlbWVudCgpLCAhZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuRmx5KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEZvcm0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZXMoWzRdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldE9mZnNldCgtMSwgLTQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRyYXcocmFuZ2VfZ3JhcGhpY3MpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MsIGFuaW1fc3RhdGU6IG51bWJlciwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgbGluZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmFuZ2VfbGlnaHRlbikge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yYW5nZV9wcm9ncmVzcyA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgLT0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJhbmdlX3Byb2dyZXNzIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gNDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZShhbmltX3N0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFjdXJzb3JfcG9zaXRpb24ubWF0Y2godGhpcy5saW5lX2VuZF9wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5saW5lX2VuZF9wb3NpdGlvbiA9IGN1cnNvcl9wb3NpdGlvbi5jb3B5KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZW5kcG9pbnQgPSB0aGlzLmdldFdheXBvaW50QXQoY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhZW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oY3Vyc29yX3Bvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmUgPSBFbnRpdHlSYW5nZS5nZXRMaW5lVG9XYXlwb2ludChlbmRwb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk1vdmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGluZV9zbG93ICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saW5lX3Nsb3cgPj0gNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saW5lX3Nsb3cgLT0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0IC09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lX29mZnNldCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HIC0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4ZmZmZmZmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcGFydCBvZiB0aGlzLmxpbmUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdTZWdtZW50KGxpbmVfZ3JhcGhpY3MsIHBhcnQsIHRoaXMubGluZV9vZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gKHRoaXMubGluZV9vZmZzZXQgKyBwYXJ0Lmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkgJSAoQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5lbmRGaWxsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZ3JleSA9IHRoaXMucmFuZ2VfcHJvZ3Jlc3MgLyAxMDAgKiAweEZGIHwgMDtcclxuICAgICAgICByYW5nZV9ncmFwaGljcy50aW50ID0gKGdyZXkgPDwgMTYpIHwgKGdyZXkgPDwgOCkgfCBncmV5O1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKHJhbmdlX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIGxpbmVfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVJhbmdlVHlwZS5Ob25lO1xyXG4gICAgICAgIHRoaXMud2F5cG9pbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5leHRyYV9jdXJzb3IuaGlkZSgpO1xyXG4gICAgICAgIHJhbmdlX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgbGluZV9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhdyhncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcblxyXG4gICAgICAgIGxldCBjb2xvcjogbnVtYmVyO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLk1vdmU6XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLlJhaXNlOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSAweGZmZmZmZjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5BdHRhY2s6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIGdyYXBoaWNzLmJlZ2luRmlsbChjb2xvcik7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2YgdGhpcy53YXlwb2ludHMpIHtcclxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gd2F5cG9pbnQucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNCwgcG9zaXRpb24ueSwgNCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIDQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlV2F5cG9pbnRzKGVudGl0eTogRW50aXR5LCBtYXhfY29zdDogbnVtYmVyLCB1c2VfdGVycmFpbjogYm9vbGVhbik6IElXYXlwb2ludFtdIHtcclxuICAgICAgICAvLyBjb3N0IGZvciBvcmlnaW4gcG9pbnQgaXMgYWx3YXlzIDFcclxuICAgICAgICBsZXQgb3BlbjogSVdheXBvaW50W10gPSBbe3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24sIGNvc3Q6ICh1c2VfdGVycmFpbiA/IDEgOiAwKSwgZm9ybTogMCwgcGFyZW50OiBudWxsfV07XHJcbiAgICAgICAgbGV0IGNsb3NlZDogSVdheXBvaW50W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAob3Blbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gb3Blbi5zaGlmdCgpO1xyXG4gICAgICAgICAgICBjbG9zZWQucHVzaChjdXJyZW50KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBhZGphY2VudF9wb3NpdGlvbnMgPSB0aGlzLm1hcC5nZXRBZGphY2VudFBvc2l0aW9uc0F0KGN1cnJlbnQucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwb3NpdGlvbiBvZiBhZGphY2VudF9wb3NpdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tQb3NpdGlvbihwb3NpdGlvbiwgY3VycmVudCwgb3BlbiwgY2xvc2VkLCBtYXhfY29zdCwgdXNlX3RlcnJhaW4sIGVudGl0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNsb3NlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrUG9zaXRpb24ocG9zaXRpb246IFBvcywgcGFyZW50OiBJV2F5cG9pbnQsIG9wZW46IElXYXlwb2ludFtdLCBjbG9zZWQ6IElXYXlwb2ludFtdLCBtYXhfY29zdDogbnVtYmVyLCB1c2VfdGVycmFpbjogYm9vbGVhbiwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgLy8gYWxyZWFkeSBpcyB0aGUgbG93ZXN0IHBvc3NpYmxlXHJcbiAgICAgICAgaWYgKCEhRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCBjbG9zZWQpKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBpZiAodXNlX3RlcnJhaW4pIHtcclxuICAgICAgICAgICAgbGV0IGlzX29jY3VwaWVkID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmICghIWlzX29jY3VwaWVkICYmIGlzX29jY3VwaWVkLmFsbGlhbmNlICE9IGVudGl0eS5hbGxpYW5jZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0aWxlX2Nvc3QgPSAxO1xyXG4gICAgICAgIGlmICh1c2VfdGVycmFpbikge1xyXG4gICAgICAgICAgICB0aWxlX2Nvc3QgPSB0aGlzLm1hcC5nZXRDb3N0QXQocG9zaXRpb24sIGVudGl0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmV3X2Nvc3QgPSBwYXJlbnQuY29zdCArIHRpbGVfY29zdDtcclxuICAgICAgICBpZiAobmV3X2Nvc3QgPiBtYXhfY29zdCkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICAgICAgbGV0IGluX29wZW4gPSBFbnRpdHlSYW5nZS5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIG9wZW4pO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIGluIG9wZW4gc3RhY2sgYW5kIHdlIGFyZSBsb3dlclxyXG4gICAgICAgIGlmICghIWluX29wZW4pIHtcclxuICAgICAgICAgICAgaWYgKGluX29wZW4uY29zdCA8PSBuZXdfY29zdCkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICAgICAgaW5fb3Blbi5jb3N0ID0gbmV3X2Nvc3Q7XHJcbiAgICAgICAgICAgIGluX29wZW4ucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3Blbi5wdXNoKHtwb3NpdGlvbjogcG9zaXRpb24sIHBhcmVudDogcGFyZW50LCBmb3JtOiAwLCBjb3N0OiBuZXdfY29zdH0pO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhZGRGb3JtKCkge1xyXG4gICAgICAgIGZvciAobGV0IHdheXBvaW50IG9mIHRoaXMud2F5cG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHdheXBvaW50LmZvcm0gPSAwO1xyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueSA+IDAgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5VcCkpKSB7IHdheXBvaW50LmZvcm0gKz0gMTsgfVxyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueCA8IHRoaXMubWFwLndpZHRoIC0gMSAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlJpZ2h0KSkpIHsgd2F5cG9pbnQuZm9ybSArPSAyOyB9XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi55IDwgdGhpcy5tYXAuaGVpZ2h0IC0gMSAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkRvd24pKSkgeyB3YXlwb2ludC5mb3JtICs9IDQ7IH1cclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnggPiAwICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uTGVmdCkpKSB7IHdheXBvaW50LmZvcm0gKz0gODsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd1NlZ21lbnQoZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgcGFydDogTGluZVBhcnQsIG9mZnNldDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gcGFydC5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgbGV0IHggPSAocGFydC5wb3NpdGlvbi54ICsgMC41KSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeSA9IChwYXJ0LnBvc2l0aW9uLnkgKyAwLjUpICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG5cclxuICAgICAgICB3aGlsZSAoZGlzdGFuY2UgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBsZW5ndGggPSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfTEVOR1RIO1xyXG4gICAgICAgICAgICBpZiAob2Zmc2V0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoIC09IG9mZnNldDtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBkaXN0YW5jZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChwYXJ0LmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIHkgLSBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCwgbGVuZ3RoKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHkgLT0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyBncmFwaGljcy5kcmF3UmVjdCh4LCB5IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeCArPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIHksIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCwgbGVuZ3RoKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHggLSBsZW5ndGgsIHkgLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB4IC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRpc3RhbmNlIC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBTbW9rZU1hbmFnZXIge1xyXG4gICAgc21va2U6IFNtb2tlW107XHJcbiAgICBtYXA6IE1hcDtcclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblxyXG4gICAgYW5pbV9zbG93OiBudW1iZXI7XHJcbiAgICBhbmltX3N0YXRlOiBudW1iZXI7XHJcbiAgICBhbmltX29mZnNldDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogTWFwLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fc2xvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1fb2Zmc2V0ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5zbW9rZSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhvdXNlIG9mIG1hcC5nZXRPY2N1cGllZEhvdXNlcygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU21va2UoaG91c2UucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNyZWF0ZVNtb2tlKG5ldyBQb3MoMywgMTMpKTtcclxuICAgIH1cclxuICAgIGNyZWF0ZVNtb2tlKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLnNtb2tlLnB1c2gobmV3IFNtb2tlKHBvc2l0aW9uLCB0aGlzLmdyb3VwLCBcImJfc21va2VcIiwgWzAsIDEsIDIsIDNdKSk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fc2xvdyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5hbmltX3Nsb3cgPCA1KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fb2Zmc2V0Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAyNykge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAyMiAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMykge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSA0O1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAxNyAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMikge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDEyICYmIHRoaXMuYW5pbV9zdGF0ZSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDI7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gNyAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgc21va2Ugb2YgdGhpcy5zbW9rZSkge1xyXG4gICAgICAgICAgICBzbW9rZS5zZXRGcmFtZSh0aGlzLmFuaW1fc3RhdGUpO1xyXG4gICAgICAgICAgICBzbW9rZS53b3JsZF9wb3NpdGlvbi55ID0gc21va2UucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIHRoaXMuYW5pbV9vZmZzZXQgLSAyO1xyXG4gICAgICAgICAgICBzbW9rZS51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbiIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgd29ybGRfcG9zaXRpb246IElQb3M7XHJcbiAgICBzcHJpdGU6IFBoYXNlci5TcHJpdGU7XHJcbiAgICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGZyYW1lczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIG9mZnNldF94OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG9mZnNldF95OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGZyYW1lOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iod29ybGRfcG9zaXRpb246IElQb3MsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG5hbWU6IHN0cmluZywgZnJhbWVzOiBudW1iZXJbXSA9IFtdKSB7XHJcblxyXG4gICAgICAgIHRoaXMud29ybGRfcG9zaXRpb24gPSB3b3JsZF9wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5vZmZzZXRfeCA9IDA7XHJcbiAgICAgICAgdGhpcy5vZmZzZXRfeSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBmcmFtZXM7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gZ3JvdXAuZ2FtZS5hZGQuc3ByaXRlKHRoaXMud29ybGRfcG9zaXRpb24ueCwgdGhpcy53b3JsZF9wb3NpdGlvbi55LCB0aGlzLm5hbWUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbMF07XHJcbiAgICAgICAgZ3JvdXAuYWRkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZXMoZnJhbWVzOiBudW1iZXJbXSwgZnJhbWU6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcclxuICAgICAgICB0aGlzLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lICUgdGhpcy5mcmFtZXMubGVuZ3RoXTtcclxuICAgIH1cclxuICAgIHNldE9mZnNldCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSB4O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSB5O1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZShmcmFtZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWUpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5mcmFtZSAlIHRoaXMuZnJhbWVzLmxlbmd0aF07XHJcbiAgICB9XHJcbiAgICBzZXRXb3JsZFBvc2l0aW9uKHdvcmxkX3Bvc2l0aW9uOiBJUG9zKSB7XHJcbiAgICAgICAgdGhpcy53b3JsZF9wb3NpdGlvbiA9IHdvcmxkX3Bvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy53b3JsZF9wb3NpdGlvbi54ICsgdGhpcy5vZmZzZXRfeDtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy53b3JsZF9wb3NpdGlvbi55ICsgdGhpcy5vZmZzZXRfeTtcclxuICAgIH1cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFNtb2tlIGV4dGVuZHMgU3ByaXRlIHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9zLCBncm91cDogUGhhc2VyLkdyb3VwLCBuYW1lOiBzdHJpbmcsIGZyYW1lczogbnVtYmVyW10pIHtcclxuICAgICAgICBzdXBlcihuZXcgUG9zKHBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgKyAxNiwgcG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSksIGdyb3VwLCBuYW1lLCBmcmFtZXMpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgRW50aXR5RGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBtb3Y6IG51bWJlcjtcclxuICAgIGF0azogbnVtYmVyO1xyXG4gICAgZGVmOiBudW1iZXI7XHJcbiAgICBtYXg6IG51bWJlcjtcclxuICAgIG1pbjogbnVtYmVyO1xyXG4gICAgY29zdDogbnVtYmVyO1xyXG4gICAgYmF0dGxlX3Bvc2l0aW9uczogSVBvc1tdO1xyXG4gICAgZmxhZ3M6IEVudGl0eUZsYWdzO1xyXG59XHJcbmVudW0gRW50aXR5RmxhZ3Mge1xyXG4gICAgTm9uZSA9IDAsIC8vIEdvbGVtLCBTa2VsZXRvblxyXG4gICAgQ2FuRmx5ID0gMSxcclxuICAgIFdhdGVyQm9vc3QgPSAyLFxyXG4gICAgQ2FuQnV5ID0gNCxcclxuICAgIENhbk9jY3VweUhvdXNlID0gOCxcclxuICAgIENhbk9jY3VweUNhc3RsZSA9IDE2LFxyXG4gICAgQ2FuUmFpc2UgPSAzMixcclxuICAgIEFudGlGbHlpbmcgPSA2NCxcclxuICAgIENhblBvaXNvbiA9IDEyOCxcclxuICAgIENhbldpc3AgPSAyNTYsXHJcbiAgICBDYW50QXR0YWNrQWZ0ZXJNb3ZpbmcgPSA1MTJcclxufVxyXG5cclxuaW50ZXJmYWNlIElFbnRpdHkge1xyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHg/OiBudW1iZXI7XHJcbiAgICB5PzogbnVtYmVyO1xyXG4gICAgcmFuaz86IG51bWJlcjtcclxuICAgIGVwPzogbnVtYmVyO1xyXG4gICAgc3RhdGU/OiBFbnRpdHlTdGF0ZTtcclxuICAgIHN0YXR1cz86IEVudGl0eVN0YXR1cztcclxuICAgIGhlYWx0aD86IG51bWJlcjtcclxuICAgIGRlYXRoX2NvdW50PzogbnVtYmVyO1xyXG59XHJcbmVudW0gRW50aXR5VHlwZSB7XHJcbiAgICBTb2xkaWVyLFxyXG4gICAgQXJjaGVyLFxyXG4gICAgTGl6YXJkLFxyXG4gICAgV2l6YXJkLFxyXG4gICAgV2lzcCxcclxuICAgIFNwaWRlcixcclxuICAgIEdvbGVtLFxyXG4gICAgQ2F0YXB1bHQsXHJcbiAgICBXeXZlcm4sXHJcbiAgICBLaW5nLFxyXG4gICAgU2tlbGV0b25cclxufVxyXG5lbnVtIEVudGl0eVN0YXR1cyB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFBvaXNvbmVkID0gMSA8PCAwLFxyXG4gICAgV2lzcGVkID0gMSA8PCAxXHJcbn1cclxuZW51bSBFbnRpdHlTdGF0ZSB7XHJcbiAgICBSZWFkeSA9IDAsXHJcbiAgICBNb3ZlZCA9IDEsXHJcbiAgICBEZWFkID0gMlxyXG59XHJcblxyXG5jbGFzcyBFbnRpdHkgZXh0ZW5kcyBTcHJpdGUge1xyXG5cclxuICAgIHR5cGU6IEVudGl0eVR5cGU7XHJcbiAgICBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgZGF0YTogRW50aXR5RGF0YTtcclxuXHJcbiAgICBpY29uX2hlYWx0aDogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGhlYWx0aDogbnVtYmVyO1xyXG4gICAgcmFuazogbnVtYmVyO1xyXG4gICAgZXA6IG51bWJlcjtcclxuXHJcbiAgICBkZWF0aF9jb3VudDogbnVtYmVyO1xyXG5cclxuICAgIHN0YXR1czogRW50aXR5U3RhdHVzO1xyXG4gICAgc3RhdGU6IEVudGl0eVN0YXRlO1xyXG5cclxuICAgIGF0a19ib29zdDogbnVtYmVyID0gMDtcclxuICAgIGRlZl9ib29zdDogbnVtYmVyID0gMDtcclxuICAgIG1vdl9ib29zdDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBhbmltYXRpb246IEVudGl0eUFuaW1hdGlvbjtcclxuICAgIHN0YXR1c19hbmltYXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgaWNvbl9tb3ZlZDogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IEVudGl0eVR5cGUsIGFsbGlhbmNlOiBBbGxpYW5jZSwgcG9zaXRpb246IFBvcywgZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHN1cGVyKHBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSwgZ3JvdXAsIFwidW5pdF9pY29uc19cIiArICg8bnVtYmVyPiBhbGxpYW5jZSksIFt0eXBlLCB0eXBlICsgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMubGVuZ3RoXSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTW3R5cGVdO1xyXG4gICAgICAgIHRoaXMuYWxsaWFuY2UgPSBhbGxpYW5jZTtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5kZWF0aF9jb3VudCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gMTA7XHJcbiAgICAgICAgdGhpcy5yYW5rID0gMDtcclxuICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IEVudGl0eVN0YXRlLlJlYWR5O1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1c19hbmltYXRpb24gPSAtMTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkID0gZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMCwgMCwgXCJjaGFyc1wiLCA0LCBncm91cCk7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX2hlYWx0aCA9IGdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDAsIFwiY2hhcnNcIiwgMCwgZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaXNEZWFkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhlYWx0aCA9PSAwO1xyXG4gICAgfVxyXG4gICAgaGFzRmxhZyhmbGFnOiBFbnRpdHlGbGFncykge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5kYXRhLmZsYWdzICYgZmxhZykgIT0gMDtcclxuICAgIH1cclxuICAgIGdldERpc3RhbmNlVG9FbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiBNYXRoLmFicyhlbnRpdHkucG9zaXRpb24ueCAtIHRoaXMucG9zaXRpb24ueCkgKyBNYXRoLmFicyhlbnRpdHkucG9zaXRpb24ueSAtIHRoaXMucG9zaXRpb24ueSk7XHJcbiAgICB9XHJcbiAgICBzaG91bGRSYW5rVXAoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMucmFuayA8IDMgJiYgdGhpcy5lcCA+PSA3NSA8PCB0aGlzLnJhbmspIHtcclxuICAgICAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucmFuaysrO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgYXR0YWNrKHRhcmdldDogRW50aXR5LCBtYXA6IE1hcCkge1xyXG5cclxuICAgICAgICBsZXQgbjogbnVtYmVyO1xyXG5cclxuICAgICAgICAvLyBnZXQgYmFzZSBkYW1hZ2VcclxuICAgICAgICBsZXQgYXRrID0gdGhpcy5kYXRhLmF0ayArIHRoaXMuYXRrX2Jvb3N0O1xyXG5cclxuICAgICAgICBpZiAodGhpcy50eXBlID09IEVudGl0eVR5cGUuQXJjaGVyICYmIHRhcmdldC50eXBlID09IEVudGl0eVR5cGUuV3l2ZXJuKSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFbnRpdHlUeXBlLldpc3AgJiYgdGFyZ2V0LnR5cGUgPT0gRW50aXR5VHlwZS5Ta2VsZXRvbikge1xyXG4gICAgICAgICAgICBhdGsgKz0gMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzOSkgLSAxOSArIHRoaXMucmFuazsgLy8gLTE5IC0gMTkgcmFuZG9tXHJcblxyXG4gICAgICAgIGlmIChuID49IDE5KSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuID49IDE3KSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAxO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xOSkge1xyXG4gICAgICAgICAgICBhdGsgLT0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTcpIHtcclxuICAgICAgICAgICAgYXRrIC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGVmID0gdGFyZ2V0LmRhdGEuZGVmICsgdGFyZ2V0LmRlZl9ib29zdDtcclxuXHJcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM5KSAtIDE5ICsgdGFyZ2V0LnJhbms7IC8vIC0xOSAtIDE5IHJhbmRvbVxyXG5cclxuICAgICAgICBpZiAobiA+PSAxOSkge1xyXG4gICAgICAgICAgICBkZWYgKz0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA+PSAxNykge1xyXG4gICAgICAgICAgICBkZWYgKz0gMTtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTkpIHtcclxuICAgICAgICAgICAgZGVmIC09IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE3KSB7XHJcbiAgICAgICAgICAgIGRlZiAtPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlZF9oZWFsdGggPSBNYXRoLmZsb29yKChhdGsgLSAoZGVmICsgbWFwLmdldERlZkF0KHRhcmdldC5wb3NpdGlvbiwgdGFyZ2V0KSkgKiAoMiAvIDMpKSAqIHRoaXMuaGVhbHRoIC8gMTApO1xyXG4gICAgICAgIGlmIChyZWRfaGVhbHRoID4gdGFyZ2V0LmhlYWx0aCkge1xyXG4gICAgICAgICAgICByZWRfaGVhbHRoID0gdGFyZ2V0LmhlYWx0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRhcmdldC5zZXRIZWFsdGgodGFyZ2V0LmhlYWx0aCAtIHJlZF9oZWFsdGgpO1xyXG4gICAgICAgIHRoaXMuZXAgKz0gKHRhcmdldC5kYXRhLmF0ayArIHRhcmdldC5kYXRhLmRlZikgKiByZWRfaGVhbHRoO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlU3RhdHVzKCkge1xyXG4gICAgICAgIHRoaXMuYXRrX2Jvb3N0ID0gMDtcclxuICAgICAgICB0aGlzLmRlZl9ib29zdCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZfYm9vc3QgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyAmIEVudGl0eVN0YXR1cy5Qb2lzb25lZCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0a19ib29zdC0tO1xyXG4gICAgICAgICAgICB0aGlzLmRlZl9ib29zdC0tO1xyXG4gICAgICAgICAgICB0aGlzLm1vdl9ib29zdC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgJiBFbnRpdHlTdGF0dXMuV2lzcGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXRrX2Jvb3N0Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0U3RhdHVzKHN0YXR1czogRW50aXR5U3RhdHVzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgfD0gc3RhdHVzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzKCk7XHJcbiAgICB9XHJcbiAgICBjbGVhclN0YXR1cyhzdGF0dXM6IEVudGl0eVN0YXR1cykge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzICY9IH5zdGF0dXM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0dXMoKTtcclxuICAgIH1cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5uYW1lICsgXCIsIGFsbGlhbmNlIFwiICsgdGhpcy5hbGxpYW5jZSArIFwiOiBcIiArIHRoaXMucG9zaXRpb24ueCArIFwiIC0gXCIgKyB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU3RhdGUoc3RhdGU6IEVudGl0eVN0YXRlLCBzaG93OiBib29sZWFuKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlID09IEVudGl0eVN0YXRlLkRlYWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUubG9hZFRleHR1cmUoXCJ0b21ic3RvbmVcIiwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVzKFswXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUubG9hZFRleHR1cmUoXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IHRoaXMuYWxsaWFuY2UpLCAoPG51bWJlcj4gdGhpcy50eXBlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVzKFt0aGlzLnR5cGUsIHRoaXMudHlwZSArIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNob3dfaWNvbiA9IChzaG93ICYmIHN0YXRlID09IEVudGl0eVN0YXRlLk1vdmVkKTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnggPSB0aGlzLnNwcml0ZS54ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNztcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC52aXNpYmxlID0gc2hvd19pY29uO1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC5icmluZ1RvVG9wKCk7XHJcbiAgICB9XHJcbiAgICBzdGFydEFuaW1hdGlvbihhbmltYXRpb246IEVudGl0eUFuaW1hdGlvbikge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIgPSAxKSB7XHJcblxyXG4gICAgICAgIGlmICghIXRoaXMuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uLnJ1bihzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG5cclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG4gICAgfVxyXG4gICAgc2V0SGVhbHRoKGhlYWx0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSBoZWFsdGg7XHJcbiAgICAgICAgaWYgKGhlYWx0aCA+IDkgfHwgaGVhbHRoIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGguZnJhbWUgPSAyNyArIChoZWFsdGggLSAxKTtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgfVxyXG4gICAgcmFpc2UoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5VHlwZS5Ta2VsZXRvbjtcclxuICAgICAgICB0aGlzLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy5yYW5rID0gMDtcclxuICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICB0aGlzLmRlYXRoX2NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLnNldEhlYWx0aCgxMCk7XHJcbiAgICAgICAgdGhpcy5jbGVhclN0YXR1cyhFbnRpdHlTdGF0dXMuUG9pc29uZWQpO1xyXG4gICAgICAgIHRoaXMuY2xlYXJTdGF0dXMoRW50aXR5U3RhdHVzLldpc3BlZCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5Nb3ZlZCwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TW92ZW1lbnQoKTogbnVtYmVyIHtcclxuICAgICAgICAvLyBpZiBwb2lzb25lZCwgbGVzcyAtPiBhcHBseSBoZXJlXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5tb3Y7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGguZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC5kZXN0cm95KCk7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCgpOiBJRW50aXR5IHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXHJcbiAgICAgICAgICAgIGFsbGlhbmNlOiB0aGlzLmFsbGlhbmNlLFxyXG4gICAgICAgICAgICB4OiB0aGlzLnBvc2l0aW9uLngsXHJcbiAgICAgICAgICAgIHk6IHRoaXMucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgcmFuayA6IHRoaXMucmFuayxcclxuICAgICAgICAgICAgZXA6IHRoaXMuZXAsXHJcbiAgICAgICAgICAgIHN0YXRlOiB0aGlzLnN0YXRlLFxyXG4gICAgICAgICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxyXG4gICAgICAgICAgICBoZWFsdGg6IHRoaXMuaGVhbHRoLFxyXG4gICAgICAgICAgICBkZWF0aF9jb3VudDogdGhpcy5kZWF0aF9jb3VudFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEZyYW1lUmVjdCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XHJcbn1cclxuaW50ZXJmYWNlIEZyYW1lRGVsZWdhdGUge1xyXG4gICAgZnJhbWVXaWxsRGVzdHJveShmcmFtZTogRnJhbWUpOiB2b2lkO1xyXG59XHJcbmVudW0gRnJhbWVBbmltYXRpb24ge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBTaG93ID0gMSxcclxuICAgIEhpZGUgPSAyLFxyXG4gICAgQ2hhbmdlID0gNCxcclxuICAgIFdpcmUgPSA4LFxyXG4gICAgRGVzdHJveSA9IDE2LFxyXG4gICAgVXBkYXRlID0gMzJcclxufVxyXG5jbGFzcyBGcmFtZSB7XHJcbiAgICBzdGF0aWMgQk9SREVSX1NJWkU6IG51bWJlciA9IDI0O1xyXG4gICAgc3RhdGljIEFOSU1fU1RFUFM6IG51bWJlciA9IDE1O1xyXG5cclxuICAgIGRlbGVnYXRlOiBGcmFtZURlbGVnYXRlO1xyXG5cclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBib3JkZXJfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGNvbnRlbnRfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGNvbnRlbnRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIGJvcmRlcl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG5cclxuICAgIHJldXNlX3RpbGVzOiBQaGFzZXIuSW1hZ2VbXTtcclxuXHJcbiAgICBhbGlnbjogRGlyZWN0aW9uO1xyXG4gICAgYW5pbWF0aW9uX2RpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgYm9yZGVyOiBEaXJlY3Rpb247XHJcblxyXG4gICAgYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbjtcclxuXHJcbiAgICBnYW1lX3dpZHRoOiBudW1iZXI7XHJcbiAgICBnYW1lX2hlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50OiBGcmFtZVJlY3Q7XHJcbiAgICB0YXJnZXQ6IEZyYW1lUmVjdDtcclxuICAgIHNwZWVkOiBGcmFtZVJlY3Q7XHJcbiAgICBhY2M6IEZyYW1lUmVjdDtcclxuICAgIHByaXZhdGUgbmV3X2FsaWduOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19ib3JkZXI6IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGU6IGJvb2xlYW47XHJcblxyXG4gICAgc3RhdGljIGdldFJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNvcHlSZWN0KGZyOiBGcmFtZVJlY3QpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIHJldHVybiB7eDogZnIueCwgeTogZnIueSwgd2lkdGg6IGZyLndpZHRoLCBoZWlnaHQ6IGZyLmhlaWdodH07XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA3O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIGFsaWduOiBEaXJlY3Rpb24sIGJvcmRlcjogRGlyZWN0aW9uLCBhbmltX2Rpcj86IERpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYWxpZ24gPSBhbGlnbjtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPSB0eXBlb2YgYW5pbV9kaXIgIT0gXCJ1bmRlZmluZWRcIiA/IGFuaW1fZGlyIDogYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSBib3JkZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZV93aWR0aCA9IHRoaXMuZ3JvdXAuZ2FtZS53aWR0aDtcclxuICAgICAgICB0aGlzLmdhbWVfaGVpZ2h0ID0gdGhpcy5ncm91cC5nYW1lLmhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMuZ2V0QWxpZ25tZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBpZiAoYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgc3RhcnRpbmcgb2Zmc2V0IHVzaW5nIHRoZSBhbmltX2RpcmVjdGlvblxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLlNob3c7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcmFtZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuXHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95X29uX2ZpbmlzaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5IaWRlO1xyXG4gICAgICAgIGlmIChkZXN0cm95X29uX2ZpbmlzaCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5EZXN0cm95O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlX29uX2ZpbmlzaCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5VcGRhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uV2lyZTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcmFtZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVNwZWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndpZHRoID09IHdpZHRoICYmIHRoaXMuaGVpZ2h0ID09IGhlaWdodCkgeyByZXR1cm47IH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uVXBkYXRlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gRnJhbWUuY29weVJlY3QodGhpcy50YXJnZXQpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9sZF93aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgbGV0IG9sZF9oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uQ2hhbmdlO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uV2lyZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0YWtlIHRoZSBiaWdnZXN0IHJlY3QgcG9zc2libGVcclxuICAgICAgICAgICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgb2xkX3dpZHRoKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBvbGRfaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5jdXJyZW50IGlzIHRoZSBvbGQgcmVjdCAob2Zmc2V0ICYgc2l6ZSlcclxuICAgICAgICAvLyB1cGRhdGUgdGhpcy5jdXJyZW50IHNvIHRoZSBzYW1lIHBvcnRpb24gb2YgdGhlIGZyYW1lIGlzIHJlbmRlcmVkLCBhbHRob3VnaCBpdCBjaGFuZ2VkIGluIHNpemVcclxuICAgICAgICAvLyBjaGFuZ2UgdGFyZ2V0IHRvIGFsaWdubWVudCBwb3NpdGlvbiBmb3IgY2hhbmdlZCByZWN0XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnggLT0gd2lkdGggLSBvbGRfd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnggLT0gd2lkdGggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnkgLT0gaGVpZ2h0IC0gb2xkX2hlaWdodDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueSAtPSBoZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcmFtZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVNwZWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRGlyZWN0aW9ucyhhbGlnbjogRGlyZWN0aW9uLCBib3JkZXI6IERpcmVjdGlvbiwgYW5pbV9kaXJlY3Rpb246IERpcmVjdGlvbiwgYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm5ld19hbGlnbiA9PT0gYWxpZ24gJiYgdGhpcy5uZXdfYm9yZGVyID09IGJvcmRlciAmJiB0aGlzLm5ld19hbmltYXRpb25fZGlyZWN0aW9uID09IGFuaW1fZGlyZWN0aW9uICYmIHRoaXMubmV3X2FuaW1hdGUgPT0gYW5pbWF0ZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgdGhpcy5uZXdfYWxpZ24gPSBhbGlnbjtcclxuICAgICAgICB0aGlzLm5ld19ib3JkZXIgPSBib3JkZXI7XHJcbiAgICAgICAgdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbiA9IGFuaW1fZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMubmV3X2FuaW1hdGUgPSBhbmltYXRlO1xyXG5cclxuICAgICAgICB0aGlzLmhpZGUodHJ1ZSwgZmFsc2UsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbiA9PSBGcmFtZUFuaW1hdGlvbi5Ob25lKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfeCA9IHRoaXMuYWRkR2FpbihcInhcIiwgc3RlcHMpO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF95ID0gdGhpcy5hZGRHYWluKFwieVwiLCBzdGVwcyk7XHJcblxyXG4gICAgICAgIGxldCBmaW5pc2hlZF93aWR0aCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX2hlaWdodCA9IHRydWU7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2Ugc2l6ZSB3aXRoIHRoZSB3aXJlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICBmaW5pc2hlZF93aWR0aCA9IHRoaXMuYWRkR2FpbihcIndpZHRoXCIsIHN0ZXBzKTtcclxuICAgICAgICAgICAgZmluaXNoZWRfaGVpZ2h0ID0gdGhpcy5hZGRHYWluKFwiaGVpZ2h0XCIsIHN0ZXBzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmaW5pc2hlZF94ICYmIGZpbmlzaGVkX3kgJiYgZmluaXNoZWRfd2lkdGggJiYgZmluaXNoZWRfaGVpZ2h0KSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkRpZEVuZCh0aGlzLmFuaW1hdGlvbik7XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmRlcl9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5IaWRlKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uQ2hhbmdlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgY3VycmVudCBvZmZzZXQgYW5kIHJlbW92ZSB0aWxlcyBvdXQgb2Ygc2lnaHRcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC54ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gRnJhbWUuY29weVJlY3QodGhpcy50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uSGlkZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkRlc3Ryb3kpICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uVXBkYXRlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseURpcmVjdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5pY2UgYW5pbWF0aW9uIGZvciBmcmFtZSB3aXRoIG5vIGFsaWdubWVudCAmIG5vIGFuaW1hdGlvbiBkaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MubGluZVN0eWxlKDEsIDB4ZmZmZmZmKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgdGhpcy5jdXJyZW50LndpZHRoLCB0aGlzLmN1cnJlbnQuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5kZWxlZ2F0ZSkgeyB0aGlzLmRlbGVnYXRlLmZyYW1lV2lsbERlc3Ryb3kodGhpcyk7IH1cclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhbmltYXRpb25EaWRFbmQoYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbikge1xyXG4gICAgICAgIC8vIGltcGxlbWVudGVkIGluIHN1YiBjbGFzc2VzIGlmIG5lZWRlZCAtIGRlZmF1bHQ6IGRvIG5vdGhpbmdcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5RGlyZWN0aW9ucygpIHtcclxuICAgICAgICB0aGlzLmFsaWduID0gdGhpcy5uZXdfYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSB0aGlzLm5ld19ib3JkZXI7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID0gdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuICAgICAgICB0aGlzLnNob3codGhpcy5uZXdfYW5pbWF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBbGlnbm1lbnRSZWN0KCk6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgdXNpbmcgdGhlIGFsaWdubWVudFxyXG4gICAgICAgIGxldCByZWN0ID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IHRoaXMuZ2FtZV93aWR0aCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lX3dpZHRoIC0gdGhpcy53aWR0aCkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IHRoaXMuZ2FtZV9oZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWN0LnkgPSBNYXRoLmZsb29yKCh0aGlzLmdhbWVfaGVpZ2h0IC0gdGhpcy5oZWlnaHQpIC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmV0cmFjdGVkUmVjdCgpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZyYW1lLmdldFJlY3QoTWF0aC5mbG9vcih0aGlzLmdhbWVfd2lkdGggLyAyKSwgTWF0aC5mbG9vcih0aGlzLmdhbWVfaGVpZ2h0IC8gMiksIDAsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IC10aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSB0aGlzLmdhbWVfd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IC10aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSB0aGlzLmdhbWVfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlT2Zmc2V0KCkge1xyXG4gICAgICAgIGxldCB4ID0gdGhpcy5jdXJyZW50Lng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLmN1cnJlbnQueTtcclxuXHJcbiAgICAgICAgbGV0IGNfeCA9IDA7XHJcbiAgICAgICAgbGV0IGNfeSA9IDA7XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfeCA9IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgY195ID0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnggPSB4O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC54ID0geCArIGNfeDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAueSA9IHkgKyBjX3k7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdGcmFtZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgY193aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGxldCBjX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY193aWR0aCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfd2lkdGggLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX2hlaWdodCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgY19oZWlnaHQgLT0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3ggPSBNYXRoLmNlaWwod2lkdGggLyBGcmFtZS5CT1JERVJfU0laRSkgLSAyO1xyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3kgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gRnJhbWUuQk9SREVSX1NJWkUpIC0gMjtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmxpbmVTdHlsZSgwKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4Y2ViZWE1KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgY193aWR0aCwgY19oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIGxldCB0aWxlczogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG93X3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgMCwgRGlyZWN0aW9uLlVwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIERpcmVjdGlvbi5Eb3duKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0X3ggKz0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNob3dfdGlsZXNfeTsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgb2Zmc2V0X3ksIERpcmVjdGlvbi5MZWZ0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgb2Zmc2V0X3ksIERpcmVjdGlvbi5SaWdodCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9mZnNldF95ICs9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IHRpbGVzO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVGcmFtZSgpIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdCb3JkZXJUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xyXG4gICAgICAgIGxldCByZXVzZTogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldXNlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZXVzZS5icmluZ1RvVG9wKCk7XHJcbiAgICAgICAgICAgIHJldXNlLnggPSB4O1xyXG4gICAgICAgICAgICByZXVzZS55ID0geTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXVzZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJtZW51XCIsIG51bGwsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV1c2UuZnJhbWUgPSBGcmFtZS5nZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHJldXNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhZGRHYWluKHZhcl9uYW1lOiBzdHJpbmcsIHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5zcGVlZFt2YXJfbmFtZV0gPT0gMCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gKz0gdGhpcy5zcGVlZFt2YXJfbmFtZV0gKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IGQgPSBNYXRoLmZsb29yKHRoaXMuYWNjW3Zhcl9uYW1lXSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSArPSBkO1xyXG4gICAgICAgIHRoaXMuYWNjW3Zhcl9uYW1lXSAtPSBkO1xyXG4gICAgICAgIGlmIChkIDwgMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdIDwgdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1lbHNlIGlmIChkID4gMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID4gdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVNwZWVkKCkge1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBGcmFtZS5nZXRSZWN0KCh0aGlzLnRhcmdldC54IC0gdGhpcy5jdXJyZW50LngpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LnkgLSB0aGlzLmN1cnJlbnQueSkgLyBGcmFtZS5BTklNX1NURVBTLCAodGhpcy50YXJnZXQud2lkdGggLSB0aGlzLmN1cnJlbnQud2lkdGgpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LmhlaWdodCAtIHRoaXMuY3VycmVudC5oZWlnaHQpIC8gRnJhbWUuQU5JTV9TVEVQUyk7XHJcbiAgICAgICAgdGhpcy5hY2MgPSBGcmFtZS5nZXRSZWN0KDAsIDAsIDAsIDApO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVUaWxlcygpIHtcclxuICAgICAgICB3aGlsZSAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICB0aWxlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImxvYWRlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbmdsb2FkZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWFpbm1lbnUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2FtZWNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWFwLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRpbGVtYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImVudGl0eW1hbmFnZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5cmFuZ2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic21va2VtYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNwcml0ZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzbW9rZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHkudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZnJhbWUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiYWVmb250LnRzXCIgLz5cclxuY2xhc3MgQW5jaWVudEVtcGlyZXMge1xyXG5cclxuICAgIHN0YXRpYyBUSUxFX1NJWkU6IG51bWJlciA9IDI0O1xyXG4gICAgc3RhdGljIE1JTklfU0laRTogbnVtYmVyID0gMTA7XHJcbiAgICBzdGF0aWMgRU5USVRJRVM6IEVudGl0eURhdGFbXTtcclxuXHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX0xFTkdUSCA9IDEwO1xyXG4gICAgc3RhdGljIExJTkVfU0VHTUVOVF9XSURUSCA9IDQ7XHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX1NQQUNJTkcgPSAyO1xyXG4gICAgc3RhdGljIERFQVRIX0NPVU5UID0gMztcclxuXHJcbiAgICBzdGF0aWMgTlVNQkVSX09GX1RJTEVTOiBudW1iZXIgPSAyMztcclxuICAgIHN0YXRpYyBUSUxFU19QUk9QOiBUaWxlW107XHJcbiAgICBzdGF0aWMgTEFORzogc3RyaW5nW107XHJcblxyXG4gICAgc3RhdGljIGdhbWU6IFBoYXNlci5HYW1lO1xyXG4gICAgbG9hZGVyOiBMb2FkZXI7XHJcbiAgICBtYWluTWVudTogTWFpbk1lbnU7XHJcbiAgICBjb250cm9sbGVyOiBHYW1lQ29udHJvbGxlcjtcclxuXHJcbiAgICB3aWR0aDogbnVtYmVyID0gMTc2O1xyXG4gICAgaGVpZ2h0OiBudW1iZXIgPSAgMjA0O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGRpdl9pZDogc3RyaW5nKSB7XHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZSA9IG5ldyBQaGFzZXIuR2FtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgUGhhc2VyLkFVVE8sIGRpdl9pZCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5sb2FkZXIgPSBuZXcgTG9hZGVyKCk7XHJcbiAgICAgICAgdGhpcy5tYWluTWVudSA9IG5ldyBNYWluTWVudSgpO1xyXG4gICAgICAgIHRoaXMuY29udHJvbGxlciA9IG5ldyBHYW1lQ29udHJvbGxlcigpO1xyXG5cclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLnN0YXRlLmFkZChcIkxvYWRlclwiLCB0aGlzLmxvYWRlcik7XHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJNYWluTWVudVwiLCB0aGlzLm1haW5NZW51KTtcclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLnN0YXRlLmFkZChcIkdhbWVcIiwgdGhpcy5jb250cm9sbGVyKTtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5zdGFydChcIkxvYWRlclwiKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxufVxyXG4iLCJlbnVtIEVudGl0eUFuaW1hdGlvblR5cGUge1xyXG4gICAgQXR0YWNrLFxyXG4gICAgU3RhdHVzLFxyXG4gICAgUmFpc2VcclxufVxyXG5pbnRlcmZhY2UgRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUge1xyXG4gICAgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRW50aXR5QW5pbWF0aW9uKTogdm9pZDtcclxufVxyXG5jbGFzcyBFbnRpdHlBbmltYXRpb24ge1xyXG5cclxuICAgIHR5cGU6IEVudGl0eUFuaW1hdGlvblR5cGU7XHJcbiAgICBlbnRpdHk6IEVudGl0eTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgZGVsZWdhdGU6IEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlO1xyXG5cclxuICAgIHByaXZhdGUgcHJvZ3Jlc3M6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudF9zdGVwOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHN0ZXBzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgYWNjOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3RlcHM6IG51bWJlcltdLCBlbnRpdHk6IEVudGl0eSwgZGVsZWdhdGU6IEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlKSB7XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50X3N0ZXAgPSAtMTtcclxuICAgICAgICB0aGlzLnN0ZXBzID0gc3RlcHM7XHJcbiAgICAgICAgdGhpcy5hY2MgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGU7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkgPSBlbnRpdHk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGluaXQ6IGJvb2xlYW4sIHN0ZXA6IG51bWJlciwgcHJvZ3Jlc3M6IG51bWJlcikge1xyXG4gICAgICAgIC8vIHJldHVybiB0cnVlIGlmIHdlIHNob3VsZCBjb250aW51ZSwgZmFsc2UgaWYgd2Ugc2hvdWxkIHN0b3AgZXhlY3V0aW9uXHJcbiAgICB9XHJcbiAgICBydW4oc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLmFjYyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5hY2MgPCA1KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hY2MgLT0gNTtcclxuXHJcbiAgICAgICAgbGV0IHN0ZXAgPSAwO1xyXG4gICAgICAgIHdoaWxlIChzdGVwIDwgdGhpcy5zdGVwcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgPCB0aGlzLnN0ZXBzW3N0ZXBdKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGVwKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbml0ID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHN0ZXAgPiB0aGlzLmN1cnJlbnRfc3RlcCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRfc3RlcCA9IHN0ZXA7XHJcbiAgICAgICAgICAgIGluaXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcHJvZ3Jlc3MgPSB0aGlzLmN1cnJlbnRfc3RlcCA+IDAgPyB0aGlzLnByb2dyZXNzIC0gdGhpcy5zdGVwc1sodGhpcy5jdXJyZW50X3N0ZXAgLSAxKV0gOiB0aGlzLnByb2dyZXNzO1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MrKztcclxuICAgICAgICB0aGlzLnN0ZXAoaW5pdCwgdGhpcy5jdXJyZW50X3N0ZXAsIHByb2dyZXNzKTtcclxuICAgIH1cclxufVxyXG5jbGFzcyBBdHRhY2tBbmltYXRpb24gZXh0ZW5kcyBFbnRpdHlBbmltYXRpb24ge1xyXG5cclxuICAgIGZpcnN0OiBib29sZWFuO1xyXG4gICAgYXR0YWNrZXI6IEVudGl0eTtcclxuXHJcbiAgICBwcml2YXRlIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZW50aXR5OiBFbnRpdHksIGRlbGVnYXRlOiBFbnRpdHlBbmltYXRpb25EZWxlZ2F0ZSwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgYXR0YWNrZXI6IEVudGl0eSwgZmlyc3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICBzdXBlcihbNiwgOF0sIGVudGl0eSwgZGVsZWdhdGUpO1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlBbmltYXRpb25UeXBlLkF0dGFjaztcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdCA9IGZpcnN0O1xyXG4gICAgICAgIHRoaXMuYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgfVxyXG4gICAgc3RlcChpbml0OiBib29sZWFuLCBzdGVwOiBudW1iZXIsIHByb2dyZXNzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbWlkZGxlID0gdGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCwgbWlkZGxlLnksIFwicmVkc3BhcmtcIiwgMCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmZyYW1lID0gcHJvZ3Jlc3MgJSAzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkuc2V0V29ybGRQb3NpdGlvbih7eDogbWlkZGxlLnggKyAyIC0gcHJvZ3Jlc3MgJSAyICogNCwgeTogbWlkZGxlLnl9KTsgLy8gMCAtIDJweCByaWdodCwgMSAtIDJweCBsZWZ0LCAyIC0gMnB4IHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnNldFdvcmxkUG9zaXRpb24oe3g6IG1pZGRsZS54ICsgMiAtIHByb2dyZXNzICUgMiAqIDQsIHk6IG1pZGRsZS55fSk7IC8vIDcgLSAycHggbGVmdCwgOCAtIDJweCByaWdodFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnNldFdvcmxkUG9zaXRpb24odGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hbmltYXRpb25EaWRFbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmNsYXNzIFN0YXR1c0FuaW1hdGlvbiBleHRlbmRzIEVudGl0eUFuaW1hdGlvbiB7XHJcbiAgICBzdGF0dXM6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIGltYWdlMjogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudGl0eTogRW50aXR5LCBkZWxlZ2F0ZTogRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIHN0YXR1czogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoc3RhdHVzID09IDEgPyBbMCwgNiwgMTRdIDogWzEwLCAxNiwgMjRdLCBlbnRpdHksIGRlbGVnYXRlKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlBbmltYXRpb25UeXBlLlN0YXR1cztcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgfVxyXG4gICAgc3RlcChpbml0OiBib29sZWFuLCBzdGVwOiBudW1iZXIsIHByb2dyZXNzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbWlkZGxlID0gdGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAvLyB3YWl0XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMCB8fCB0aGlzLnN0YXR1cyA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UyID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCArIDQsIG1pZGRsZS55ICsgNCwgXCJzdGF0dXNcIiwgdGhpcy5zdGF0dXMsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCwgbWlkZGxlLnksIFwic3BhcmtcIiwgMCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmZyYW1lID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UubG9hZFRleHR1cmUoXCJzbW9rZVwiLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIHRvbWIgZ3JhcGhpY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eS51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5EZWFkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZS55ID0gbWlkZGxlLnkgLSBwcm9ncmVzcyAqIDM7IC8vIDAsIDMsIDZcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmZyYW1lID0gTWF0aC5mbG9vcihwcm9ncmVzcyAvIDIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHRoaXMuc3RhdHVzID09IDAgfHwgdGhpcy5zdGF0dXMgPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UyLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuYW5pbWF0aW9uRGlkRW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hbmltYXRpb25EaWRFbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmNsYXNzIFJhaXNlQW5pbWF0aW9uIGV4dGVuZHMgRW50aXR5QW5pbWF0aW9uIHtcclxuICAgIG5ld19hbGxpYW5jZTogQWxsaWFuY2U7XHJcblxyXG4gICAgcHJpdmF0ZSBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBpbWFnZXM6IFBoYXNlci5JbWFnZVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudGl0eTogRW50aXR5LCBkZWxlZ2F0ZTogRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG5ld19hbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzdXBlcihbOCwgMThdLCBlbnRpdHksIGRlbGVnYXRlKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlBbmltYXRpb25UeXBlLlJhaXNlO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5uZXdfYWxsaWFuY2UgPSBuZXdfYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcclxuXHJcbiAgICB9XHJcbiAgICBzdGVwKGluaXQ6IGJvb2xlYW4sIHN0ZXA6IG51bWJlciwgcHJvZ3Jlc3M6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBtaWRkbGUgPSB0aGlzLmVudGl0eS5wb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgc3dpdGNoIChzdGVwKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZXMucHVzaCh0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKG1pZGRsZS54IC0gOCwgbWlkZGxlLnkgLSA4LCBcInNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlcy5wdXNoKHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UobWlkZGxlLnggKyA4LCBtaWRkbGUueSAtIDgsIFwic3BhcmtcIiwgMCwgdGhpcy5ncm91cCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzLnB1c2godGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCAtIDgsIG1pZGRsZS55ICsgOCwgXCJzcGFya1wiLCAwLCB0aGlzLmdyb3VwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZXMucHVzaCh0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKG1pZGRsZS54ICsgOCwgbWlkZGxlLnkgKyA4LCBcInNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBkID0gOCAtIHByb2dyZXNzO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLmZyYW1lID0gcHJvZ3Jlc3MgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ueCA9IG1pZGRsZS54IC0gZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLnkgPSBtaWRkbGUueSAtIGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0uZnJhbWUgPSBwcm9ncmVzcyAlIDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS54ID0gbWlkZGxlLnggKyBkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ueSA9IG1pZGRsZS55IC0gZDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS5mcmFtZSA9IHByb2dyZXNzICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzJdLnggPSBtaWRkbGUueCAtIGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS55ID0gbWlkZGxlLnkgKyBkO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLmZyYW1lID0gcHJvZ3Jlc3MgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbM10ueCA9IG1pZGRsZS54ICsgZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLnkgPSBtaWRkbGUueSArIGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkucmFpc2UodGhpcy5uZXdfYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGQyID0gLXByb2dyZXNzO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLmZyYW1lID0gKHByb2dyZXNzICsgMikgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ueCA9IG1pZGRsZS54IC0gZDI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS55ID0gbWlkZGxlLnkgLSBkMjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS5mcmFtZSA9IChwcm9ncmVzcyArIDIpICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnggPSBtaWRkbGUueCArIGQyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ueSA9IG1pZGRsZS55IC0gZDI7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMl0uZnJhbWUgPSAocHJvZ3Jlc3MgKyAyKSAlIDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS54ID0gbWlkZGxlLnggLSBkMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzJdLnkgPSBtaWRkbGUueSArIGQyO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLmZyYW1lID0gKHByb2dyZXNzICsgMikgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbM10ueCA9IG1pZGRsZS54ICsgZDI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS55ID0gbWlkZGxlLnkgKyBkMjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmFuaW1hdGlvbkRpZEVuZCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBTY3JlZW5UcmFuc2l0aW9uIHtcclxuICAgIE5vbmUsXHJcbiAgICBIaWRlLFxyXG4gICAgU2hvd1xyXG59XHJcbmNsYXNzIEF0dGFja1NjcmVlbiB7XHJcbiAgICBwcml2YXRlIHRyYW5zaXRpb246IFNjcmVlblRyYW5zaXRpb247XHJcbiAgICBwcml2YXRlIHRyYW5zaXRpb25fcHJvZ3Jlc3M6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGJhY2tncm91bmRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgY29udGVudF9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uX21hc2s6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgYXR0YWNrZXI6IEVudGl0eTtcclxuICAgIHByaXZhdGUgdGFyZ2V0OiBFbnRpdHk7XHJcbiAgICBwcml2YXRlIG1hcDogTWFwO1xyXG5cclxuICAgIHN0YXRpYyBkcmF3VHJhbnNpdGlvbihwcm9ncmVzczogbnVtYmVyLCBtYXhfcHJvZ3Jlc3M6IG51bWJlciwgZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgc2NyZWVuX3dpZHRoOiBudW1iZXIsIHNjcmVlbl9oZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgbWF4X3NlZ21lbnRfd2lkdGggPSBNYXRoLmZsb29yKHNjcmVlbl93aWR0aCAvIDQpICsgMTtcclxuICAgICAgICBsZXQgbWF4X3NlZ21lbnRfaGVpZ2h0ID0gTWF0aC5mbG9vcihzY3JlZW5faGVpZ2h0IC8gNCkgKyAxO1xyXG5cclxuICAgICAgICBsZXQgdW50aWxfYWxsID0gbWF4X3Byb2dyZXNzIC0gNjtcclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDQ7IHgrKykge1xyXG4gICAgICAgICAgICBsZXQgc2hvdyA9IE1hdGguZmxvb3IocHJvZ3Jlc3MgLSB4ICogMik7XHJcbiAgICAgICAgICAgIGlmIChzaG93IDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgdG8gZHJhdyBhZnRlciB0aGlzIHBvaW50XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgd2lkdGg6IG51bWJlcjtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoc2hvdyA+PSB1bnRpbF9hbGwpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gbWF4X3NlZ21lbnRfd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBtYXhfc2VnbWVudF9oZWlnaHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Ioc2hvdyAqIG1heF9zZWdtZW50X3dpZHRoIC8gdW50aWxfYWxsKTtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3Ioc2hvdyAqIG1heF9zZWdtZW50X2hlaWdodCAvIHVudGlsX2FsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1hcmdpbl94ID0gTWF0aC5mbG9vcigobWF4X3NlZ21lbnRfd2lkdGggLSB3aWR0aCkgLyAyKTtcclxuICAgICAgICAgICAgbGV0IG1hcmdpbl95ID0gTWF0aC5mbG9vcigobWF4X3NlZ21lbnRfaGVpZ2h0IC0gaGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0X3ggPSB4ICogbWF4X3NlZ21lbnRfd2lkdGggKyBtYXJnaW5feDtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCA0OyB5ICsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0X3kgPSB5ICogbWF4X3NlZ21lbnRfaGVpZ2h0ICsgbWFyZ2luX3k7XHJcbiAgICAgICAgICAgICAgICBncmFwaGljcy5kcmF3UmVjdChvZmZzZXRfeCwgb2Zmc2V0X3ksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRCYWNrZ3JvdW5kUHJlZml4Rm9yVGlsZSh0aWxlOiBUaWxlKTogc3RyaW5nIHtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIndvb2RzXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaGlsbFwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJtb3VudGFpblwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuV2F0ZXI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ3YXRlclwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJpZGdlXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcInRvd25cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0TmFtZUZvclRpbGUodGlsZTogVGlsZSk6IHN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoICh0aWxlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5HcmFzczpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJncmFzc1wiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcInJvYWRcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibW91bnRhaW5cIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwid2F0ZXJcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImJyaWRnZVwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ0b3duXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIGF0dGFja2VyOiBFbnRpdHksIHRhcmdldDogRW50aXR5LCBtYXA6IE1hcCkge1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcyA9IGdhbWUuYWRkLmdyYXBoaWNzKDAsIDApO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcy5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX21hc2sgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLm1hc2sgPSB0aGlzLnRyYW5zaXRpb25fbWFzaztcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2tlciA9IGF0dGFja2VyO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG5cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLk5vbmU7XHJcbiAgICB9XHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIC8vIHN0YXJ0IHRyYW5zaXRpb25cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9IFNjcmVlblRyYW5zaXRpb24uSGlkZTtcclxuICAgIH1cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGF0dGFja2VyX3RpbGUgPSB0aGlzLm1hcC5nZXRUaWxlQXQodGhpcy5hdHRhY2tlci5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IHRhcmdldF90aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHRoaXMudGFyZ2V0LnBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kSGFsZihhdHRhY2tlcl90aWxlLCAwKTtcclxuICAgICAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kSGFsZih0YXJnZXRfdGlsZSwgMSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5icmluZ1RvVG9wKHRoaXMuY29udGVudF9ncmFwaGljcyk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmJlZ2luRmlsbCgweDAwMDAwMCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmRyYXdSZWN0KE1hdGguZmxvb3IodGhpcy5ncm91cC5nYW1lLndpZHRoIC8gMikgLSAxLCAwLCAyLCB0aGlzLmdyb3VwLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgfVxyXG4gICAgZHJhd0JhY2tncm91bmRIYWxmKHRpbGU6IFRpbGUsIGhhbGY6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBoYWxmX3dpZHRoID0gTWF0aC5mbG9vcih0aGlzLmdyb3VwLmdhbWUud2lkdGggLyAyKTtcclxuICAgICAgICBsZXQgaGFsZl9oZWlnaHQgPSB0aGlzLmdyb3VwLmdhbWUuaGVpZ2h0O1xyXG4gICAgICAgIGxldCBvZmZzZXRfeCA9IGhhbGYgKiBoYWxmX3dpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYmdfaW1hZ2UgPSBBdHRhY2tTY3JlZW4uZ2V0QmFja2dyb3VuZFByZWZpeEZvclRpbGUodGlsZSk7XHJcbiAgICAgICAgbGV0IGJnX2hlaWdodCA9IDA7XHJcbiAgICAgICAgaWYgKGJnX2ltYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgYmdfaGVpZ2h0ID0gNDg7XHJcbiAgICAgICAgICAgIGxldCBiZ190aWxlc194ID0gTWF0aC5jZWlsKGhhbGZfd2lkdGggLyAoMiAqIDg4KSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmdfdGlsZXNfeDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLnNwcml0ZShvZmZzZXRfeCArIGkgKiA4OCwgMCwgYmdfaW1hZ2UgKyBcIl9iZ1wiLCAwLCB0aGlzLmdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGlsZXNfeCA9IE1hdGguY2VpbChoYWxmX3dpZHRoIC8gMjQpO1xyXG4gICAgICAgIGxldCB0aWxlc195ID0gTWF0aC5jZWlsKChoYWxmX2hlaWdodCAtIGJnX2hlaWdodCkgLyAyNCk7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlc194OyB4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aWxlc195OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhbnQgPSByYW5kID49IDkgPyAyIDogKHJhbmQgPj0gOCA/IDEgOiAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuc3ByaXRlKG9mZnNldF94ICsgeCAqIDI0LCBiZ19oZWlnaHQgKyB5ICogMjQsIEF0dGFja1NjcmVlbi5nZXROYW1lRm9yVGlsZSh0aWxlKSwgdmFyaWFudCwgdGhpcy5ncm91cCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb24gPT0gU2NyZWVuVHJhbnNpdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbiA9PSBTY3JlZW5UcmFuc2l0aW9uLkhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcy5iZWdpbkZpbGwoMHgwMDAwMDApO1xyXG4gICAgICAgICAgICBBdHRhY2tTY3JlZW4uZHJhd1RyYW5zaXRpb24odGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzLCAzMCwgdGhpcy5iYWNrZ3JvdW5kX2dyYXBoaWNzLCB0aGlzLmdyb3VwLmdhbWUud2lkdGgsIHRoaXMuZ3JvdXAuZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmJlZ2luRmlsbCgpO1xyXG4gICAgICAgICAgICBBdHRhY2tTY3JlZW4uZHJhd1RyYW5zaXRpb24odGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzLCAzMCwgdGhpcy50cmFuc2l0aW9uX21hc2ssIHRoaXMuZ3JvdXAuZ2FtZS53aWR0aCwgdGhpcy5ncm91cC5nYW1lLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmVuZEZpbGwoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcyA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB0cmFuc2l0aW9uIG1hc2sgbXVzdCBoYXZlIGEgZHJhd1JlY3QgY2FsbCB0byBiZSBhIG1hc2ssIG90aGVyd2lzZSBldmVyeXRoaW5nIGlzIHNob3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzID49IDMwKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmFuc2l0aW9uID0gdGhpcy50cmFuc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLk5vbmU7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbkRpZEVuZCh0cmFuc2l0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MrKztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyYW5zaXRpb25EaWRFbmQodHJhbnNpdGlvbjogU2NyZWVuVHJhbnNpdGlvbikge1xyXG4gICAgICAgIGlmICh0cmFuc2l0aW9uID09IFNjcmVlblRyYW5zaXRpb24uU2hvdykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZpbmlzaGVkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG5cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9IFNjcmVlblRyYW5zaXRpb24uU2hvdztcclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBGcmFtZU1hbmFnZXIgaW1wbGVtZW50cyBGcmFtZURlbGVnYXRlIHtcclxuICAgIGZyYW1lczogRnJhbWVbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IFtdO1xyXG4gICAgfVxyXG4gICAgYWRkRnJhbWUoZnJhbWU6IEZyYW1lKSB7XHJcbiAgICAgICAgZnJhbWUuZGVsZWdhdGUgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRnJhbWUoZnJhbWU6IEZyYW1lKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmZyYW1lcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZnJhbWUgPT0gdGhpcy5mcmFtZXNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBmb3IgKGxldCBmcmFtZSBvZiB0aGlzLmZyYW1lcykge1xyXG4gICAgICAgICAgICBmcmFtZS51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGZyYW1lV2lsbERlc3Ryb3koZnJhbWU6IEZyYW1lKSB7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVGcmFtZShmcmFtZSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBLZXkge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBVcCA9IDEsXHJcbiAgICBSaWdodCA9IDIsXHJcbiAgICBEb3duID0gNCxcclxuICAgIExlZnQgPSA4LFxyXG4gICAgRW50ZXIgPSAxNixcclxuICAgIEVzYyA9IDMyXHJcbn07XHJcbmNsYXNzIElucHV0IHtcclxuICAgIHB1YmxpYyBhbGxfa2V5czogS2V5O1xyXG5cclxuICAgIHByaXZhdGUga2V5X3VwOiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfcmlnaHQ6IFBoYXNlci5LZXk7XHJcbiAgICBwcml2YXRlIGtleV9kb3duOiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfbGVmdDogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2VudGVyOiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfZXNjOiBQaGFzZXIuS2V5O1xyXG5cclxuICAgIHByaXZhdGUgbGFzdF9rZXlzOiBLZXk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoaW5wdXQ6IFBoYXNlci5JbnB1dCkge1xyXG5cclxuICAgICAgICB0aGlzLmFsbF9rZXlzID0gS2V5Lk5vbmU7XHJcblxyXG4gICAgICAgIHRoaXMua2V5X3VwID0gaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5VUCk7XHJcbiAgICAgICAgdGhpcy5rZXlfZG93biA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRE9XTik7XHJcbiAgICAgICAgdGhpcy5rZXlfcmlnaHQgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLlJJR0hUKTtcclxuICAgICAgICB0aGlzLmtleV9sZWZ0ID0gaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5MRUZUKTtcclxuICAgICAgICB0aGlzLmtleV9lbnRlciA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRU5URVIpO1xyXG4gICAgICAgIHRoaXMua2V5X2VzYyA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuRVNDKTtcclxuICAgIH1cclxuXHJcbiAgICBpc0tleVByZXNzZWQoa2V5OiBLZXkpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuYWxsX2tleXMgJiBrZXkpICE9IDA7XHJcbiAgICB9XHJcbiAgICBjbGVhcktleVByZXNzZWQoa2V5OiBLZXkpIHtcclxuICAgICAgICB0aGlzLmFsbF9rZXlzICY9IH5rZXk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGxldCBjdXJyZW50X2tleXM6IEtleSA9IEtleS5Ob25lO1xyXG4gICAgICAgIGN1cnJlbnRfa2V5cyB8PSB0aGlzLnVwZGF0ZUtleShLZXkuVXAsIHRoaXMua2V5X3VwLmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5SaWdodCwgdGhpcy5rZXlfcmlnaHQuaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkRvd24sIHRoaXMua2V5X2Rvd24uaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkxlZnQsIHRoaXMua2V5X2xlZnQuaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkVudGVyLCB0aGlzLmtleV9lbnRlci5pc0Rvd24pO1xyXG4gICAgICAgIGN1cnJlbnRfa2V5cyB8PSB0aGlzLnVwZGF0ZUtleShLZXkuRXNjLCB0aGlzLmtleV9lc2MuaXNEb3duKTtcclxuICAgICAgICB0aGlzLmxhc3Rfa2V5cyA9IGN1cnJlbnRfa2V5cztcclxuICAgIH1cclxuICAgIHByaXZhdGUgc2V0S2V5KGtleTogS2V5LCB5ZXM6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmFsbF9rZXlzIF49ICgteWVzIF4gdGhpcy5hbGxfa2V5cykgJiBrZXk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHdhc0tleVByZXNzZWQoa2V5OiBLZXkpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMubGFzdF9rZXlzICYga2V5KSAhPSAwO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVLZXkoa2V5OiBLZXksIGlzX2Rvd246IGJvb2xlYW4pOiBLZXkge1xyXG4gICAgICAgIGlmIChpc19kb3duICE9IHRoaXMud2FzS2V5UHJlc3NlZChrZXkpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0S2V5KGtleSwgaXNfZG93bik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBpc19kb3duID8ga2V5IDogMDtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgTWVudURlbGVnYXRlIHtcclxuICAgIG9wZW5NZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCk6IHZvaWQ7XHJcbiAgICBjbG9zZU1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KTogdm9pZDtcclxufVxyXG5jbGFzcyBNZW51R29sZEluZm8gZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgZ29sZF9hbW91bnQ6IEFFRm9udDtcclxuICAgIGhlYWRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIGhlYWRfaWNvbjogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoNjQsIDQwLCBncm91cCwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgIC8vIGRyYXcgY29udGVudFxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQoYWxsaWFuY2U6IEFsbGlhbmNlLCBnb2xkOiBudW1iZXIpIHtcclxuICAgICAgICAvLyB1cGRhdGUgaW5mb3JtYXRpb24gaW5zaWRlIG1lbnVcclxuXHJcbiAgICAgICAgbGV0IGNvbG9yOiBudW1iZXI7XHJcbiAgICAgICAgbGV0IGZyYW1lOiBudW1iZXI7XHJcbiAgICAgICAgbGV0IHg6IG51bWJlcjtcclxuICAgICAgICBpZiAoYWxsaWFuY2UgPT0gQWxsaWFuY2UuQmx1ZSkge1xyXG4gICAgICAgICAgICBjb2xvciA9IDB4MDAwMGZmO1xyXG4gICAgICAgICAgICBmcmFtZSA9IDA7XHJcbiAgICAgICAgICAgIHggPSAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gMHhmZjAwMDA7XHJcbiAgICAgICAgICAgIGZyYW1lID0gMTtcclxuICAgICAgICAgICAgeCA9IDI1O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5oZWFkX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5oZWFkX2dyYXBoaWNzLmJlZ2luRmlsbChjb2xvcik7XHJcbiAgICAgICAgdGhpcy5oZWFkX2dyYXBoaWNzLmRyYXdSZWN0KDAsIDE3LCB0aGlzLndpZHRoIC0gNiwgMTcpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24ueCA9IHg7XHJcblxyXG4gICAgICAgIHRoaXMuZ29sZF9hbW91bnQuc2V0VGV4dChnb2xkLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGNvbnRlbnQgKHNwcml0ZXMsIHRleHQgZXRjKVxyXG5cclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMiwgMiwgXCJnb2xkXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDE2LCBcInBvcnRyYWl0XCIsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgbGV0IGhlYWRfY3JvcCA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKDAsIDEwLCB0aGlzLmhlYWRfaWNvbi53aWR0aCwgMTgpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLmNyb3AoaGVhZF9jcm9wKTtcclxuXHJcbiAgICAgICAgdGhpcy5nb2xkX2Ftb3VudCA9IG5ldyBBRUZvbnQoMjgsIDUsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNZW51RGVmSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuICAgIHByaXZhdGUgdGlsZV9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIGRlZl9hbW91bnQ6IEFFRm9udDtcclxuICAgIHByaXZhdGUgZW50aXR5X2ljb246IFBoYXNlci5JbWFnZTtcclxuICAgIHByaXZhdGUgc3RhdHVzX2ljb25zOiBQaGFzZXIuSW1hZ2VbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDQwLCA1MiwgZ3JvdXAsIERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KHBvc2l0aW9uOiBQb3MsIG1hcDogTWFwLCBlbnRpdHlfbWFuYWdlcjogRW50aXR5TWFuYWdlcikge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvcm1hdGlvbiBpbnNpZGUgbWVudVxyXG5cclxuICAgICAgICBsZXQgdGlsZSA9IG1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBlbnRpdHkgPSBlbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlBdChwb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSBtYXAuZ2V0QWxsaWFuY2VBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVfaWNvbi5rZXkgIT0gXCJidWlsZGluZ3NfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5sb2FkVGV4dHVyZShcImJ1aWxkaW5nc19cIiArICg8bnVtYmVyPiBhbGxpYW5jZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGlsZV9pY29uLmZyYW1lID0gdGlsZSA9PSBUaWxlLkhvdXNlID8gMCA6IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGlsZV9pY29uLmtleSAhPSBcInRpbGVzMFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5sb2FkVGV4dHVyZShcInRpbGVzMFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5mcmFtZSA9IFRpbGVNYW5hZ2VyLmdldEJhc2VJbWFnZUluZGV4Rm9yVGlsZSh0aWxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGVmX2Ftb3VudC5zZXRUZXh0KE1hcC5nZXREZWZGb3JUaWxlKHRpbGUsIGVudGl0eSkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIGlmICghIWVudGl0eSAmJiAhZW50aXR5LmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2l6ZSg2OCwgNTIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbnRpdHlfaWNvbi5rZXkgIT0gXCJ1bml0X2ljb25zX1wiICsgZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLmxvYWRUZXh0dXJlKFwidW5pdF9pY29uc19cIiArIGVudGl0eS5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi5mcmFtZSA9IGVudGl0eS50eXBlO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2l6ZSg0MCwgNTIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0dXNJY29ucyhlbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGNvbnRlbnQgKHNwcml0ZXMsIHRleHQgZXRjKVxyXG5cclxuICAgICAgICBsZXQgdGlsZV9ncmFwaGljcyA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aWxlX2dyYXBoaWNzLmxpbmVTdHlsZSgxLCAweDAwMDAwMCk7XHJcbiAgICAgICAgdGlsZV9ncmFwaGljcy5kcmF3UmVjdCg2LCAyLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAxLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAxKTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlX2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDcsIDMsIFwidGlsZXMwXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgbGV0IHRpbGVfY3JvcCA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKDEsIDEsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDIsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDIpO1xyXG4gICAgICAgIHRoaXMudGlsZV9pY29uLmNyb3AodGlsZV9jcm9wKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZl9mb250ID0gbmV3IEFFRm9udCg3LCAyOCwgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuICAgICAgICBkZWZfZm9udC5zZXRUZXh0KFwiREVGXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmRlZl9hbW91bnQgPSBuZXcgQUVGb250KDE0LCAzNywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaWNvbiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMzUsIDIsIFwidW5pdF9pY29uc18xXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zID0gW1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDMxLCAyMiwgXCJzdGF0dXNcIiwgMiwgdGhpcy5jb250ZW50X2dyb3VwKSxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgzOSwgMjIsIFwic3RhdHVzXCIsIDIsIHRoaXMuY29udGVudF9ncm91cCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNDcsIDIyLCBcInN0YXR1c1wiLCAyLCB0aGlzLmNvbnRlbnRfZ3JvdXApLFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDMxLCAzMiwgXCJzdGF0dXNcIiwgMCwgdGhpcy5jb250ZW50X2dyb3VwKSxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg0NiwgMzIsIFwic3RhdHVzXCIsIDEsIHRoaXMuY29udGVudF9ncm91cClcclxuICAgICAgICBdO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdHVzSWNvbnMobnVsbCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHNldFN0YXR1c0ljb25zKGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXNfaWNvbnNbMF0udmlzaWJsZSA9IChlbnRpdHkgJiYgZW50aXR5LnJhbmsgPiAwKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1c19pY29uc1sxXS52aXNpYmxlID0gKGVudGl0eSAmJiBlbnRpdHkucmFuayA+IDEpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzJdLnZpc2libGUgPSAoZW50aXR5ICYmIGVudGl0eS5yYW5rID4gMikgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzNdLnZpc2libGUgPSAoZW50aXR5ICYmIGVudGl0eS5zdGF0dXMgIT0gRW50aXR5U3RhdHVzLk5vbmUpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzNdLmZyYW1lID0gKGVudGl0eSAmJiAoZW50aXR5LnN0YXR1cyAmIEVudGl0eVN0YXR1cy5Qb2lzb25lZCkgIT0gMCkgPyAwIDogMTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXNfaWNvbnNbNF0udmlzaWJsZSA9IChlbnRpdHkgJiYgZW50aXR5LnN0YXR1cyA9PSAoRW50aXR5U3RhdHVzLldpc3BlZCB8IEVudGl0eVN0YXR1cy5Qb2lzb25lZCkpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmVudW0gQWN0aW9uIHtcclxuICAgIE5vbmUsXHJcbiAgICBNQUlOX01FTlUsXHJcbiAgICBNT1ZFLFxyXG4gICAgQVRUQUNLLFxyXG4gICAgQlVZLFxyXG4gICAgRU5EX01PVkUsXHJcbiAgICBDQU5DRUwsXHJcbiAgICBFTkRfVFVSTixcclxuICAgIE9DQ1VQWSxcclxuICAgIFJBSVNFLFxyXG4gICAgTUFQLFxyXG4gICAgT0JKRUNUSVZFLFxyXG4gICAgTkVXX0dBTUUsXHJcbiAgICBTRUxFQ1RfTEVWRUwsXHJcbiAgICBTQVZFX0dBTUUsXHJcbiAgICBMT0FEX0dBTUUsXHJcbiAgICBTS0lSTUlTSCxcclxuICAgIFNFVFRJTkdTLFxyXG4gICAgSU5TVFJVQ1RJT05TLFxyXG4gICAgQUJPVVQsXHJcbiAgICBFWElUXHJcbn1cclxuY2xhc3MgTWVudU9wdGlvbnMgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgc2VsZWN0ZWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG9wdGlvbnM6IEFjdGlvbltdO1xyXG4gICAgcHJpdmF0ZSBmb250czogUGhhc2VyLkJpdG1hcFRleHRbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIHN0YXRpYyBnZXRNYWluTWVudU9wdGlvbnMoc2F2ZTogYm9vbGVhbik6IEFjdGlvbltdIHtcclxuICAgICAgICBsZXQgb3B0aW9uczogQWN0aW9uW10gPSBbQWN0aW9uLk5FV19HQU1FLCBBY3Rpb24uU0VMRUNUX0xFVkVMLCBBY3Rpb24uTE9BRF9HQU1FLCBBY3Rpb24uU0tJUk1JU0gsIEFjdGlvbi5TRVRUSU5HUywgQWN0aW9uLklOU1RSVUNUSU9OUywgQWN0aW9uLkFCT1VULCBBY3Rpb24uRVhJVF07XHJcbiAgICAgICAgaWYgKHNhdmUpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy51bnNoaWZ0KEFjdGlvbi5TQVZFX0dBTUUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRPZmZNZW51T3B0aW9ucygpOiBBY3Rpb25bXSB7XHJcbiAgICAgICAgcmV0dXJuIFtBY3Rpb24uRU5EX1RVUk4sIEFjdGlvbi5NQVAsIEFjdGlvbi5PQkpFQ1RJVkUsIEFjdGlvbi5NQUlOX01FTlVdO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE9wdGlvblN0cmluZyhvcHRpb246IEFjdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKG9wdGlvbiA9PSBBY3Rpb24uTm9uZSkgeyByZXR1cm4gXCJcIjsgfVxyXG4gICAgICAgIGlmIChvcHRpb24gPj0gMTIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLkxBTkdbKDxudW1iZXI+IG9wdGlvbiAtIDEyICsgMSldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuTEFOR1syNiArIDxudW1iZXI+IG9wdGlvbl07XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3RvciAoZ3JvdXA6IFBoYXNlci5Hcm91cCwgYWxpZ246IERpcmVjdGlvbiwgb3B0aW9uczogQWN0aW9uW10sIGRlbGVnYXRlOiBNZW51RGVsZWdhdGUsIGFuaW1fZGlyZWN0aW9uPzogRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKCFhbmltX2RpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBhbmltX2RpcmVjdGlvbiA9IGFsaWduO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBtYXhfbGVuZ3RoID0gMDtcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbik7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG1heF9sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAqIDEzICsgMTY7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gbWF4X2xlbmd0aCAqIDcgKyAzMSArIDEzO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUod2lkdGgsIGhlaWdodCwgZ3JvdXAsIGFsaWduLCBEaXJlY3Rpb24uQWxsICYgfmFsaWduLCBhbmltX2RpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIGxldCB5ID0gNTtcclxuICAgICAgICB0aGlzLmZvbnRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIG9mIHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IE1lbnVPcHRpb25zLmdldE9wdGlvblN0cmluZyhvcHRpb24pO1xyXG4gICAgICAgICAgICBsZXQgZm9udCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgyNSwgeSwgXCJmb250N1wiLCB0ZXh0LCA3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmZvbnRzLnB1c2goZm9udCk7XHJcbiAgICAgICAgICAgIHkgKz0gMTM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXIgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDQsIDQsIFwicG9pbnRlclwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zdGF0ZSA9IDI7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG5cclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLmNsb3NlTWVudShJbnB1dENvbnRleHQuT3B0aW9ucyk7IH1cclxuICAgICAgICBzdXBlci5oaWRlKGFuaW1hdGUsIGRlc3Ryb3lfb25fZmluaXNoLCB1cGRhdGVfb25fZmluaXNoKTtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShJbnB1dENvbnRleHQuT3B0aW9ucyk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUpO1xyXG4gICAgfVxyXG4gICAgbmV4dCgpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkKys7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPj0gdGhpcy5vcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmV2KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQtLTtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFNlbGVjdGVkKCk6IEFjdGlvbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkXTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlKHN0ZXBzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3crKztcclxuICAgICAgICBpZiAodGhpcy5wb2ludGVyX3Nsb3cgPiAxMCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zdGF0ZSA9IDIgLSB0aGlzLnBvaW50ZXJfc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXIueSA9IDQgKyB0aGlzLnNlbGVjdGVkICogMTM7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnggPSA0ICsgdGhpcy5wb2ludGVyX3N0YXRlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBOb3RpZmljYXRpb24gZXh0ZW5kcyBGcmFtZSB7XHJcbiAgICBwcml2YXRlIGZvbnQ6IFBoYXNlci5CaXRtYXBUZXh0O1xyXG4gICAgcHJpdmF0ZSBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGdyb3VwOiBQaGFzZXIuR3JvdXAsIHRleHQ6IHN0cmluZywgZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudV9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG5cclxuICAgICAgICB0aGlzLmZvbnQgPSBncm91cC5nYW1lLmFkZC5iaXRtYXBUZXh0KDksIDUsIFwiZm9udDdcIiwgdGV4dCwgNyk7XHJcbiAgICAgICAgdGhpcy5mb250LnVwZGF0ZVRyYW5zZm9ybSgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuZm9udC50ZXh0V2lkdGggKyAzMDtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUod2lkdGgsIDI5LCBncm91cCwgRGlyZWN0aW9uLk5vbmUsIERpcmVjdGlvbi5BbGwsIERpcmVjdGlvbi5Ob25lKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAuYWRkKHRoaXMuZm9udCk7XHJcbiAgICB9XHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUub3Blbk1lbnUoSW5wdXRDb250ZXh0LldhaXQpOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBhbmltYXRpb25EaWRFbmQoYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbikge1xyXG4gICAgICAgIGlmICgoYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uU2hvdykgIT0gMCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgfWVsc2UgaWYgKChhbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5EZXN0cm95KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5XYWl0KTsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWVudVNob3BVbml0cyBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBzZWxlY3RlZDogbnVtYmVyO1xyXG4gICAgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIHByaXZhdGUgZW50aXR5X2ltYWdlczogUGhhc2VyLkltYWdlW107XHJcbiAgICBwcml2YXRlIG1hc2tzOiBQaGFzZXIuSW1hZ2VbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogTWVudURlbGVnYXRlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg2NCwgZ3JvdXAuZ2FtZS5oZWlnaHQgLSA0MCwgZ3JvdXAsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgIC8vIGRyYXcgY29udGVudFxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQoYWxsaWFuY2U6IEFsbGlhbmNlLCBnb2xkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaW1hZ2Ugb2YgdGhpcy5lbnRpdHlfaW1hZ2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBjb3N0ID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbaV0uY29zdDtcclxuICAgICAgICAgICAgaW1hZ2UubG9hZFRleHR1cmUoXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSwgaW1hZ2UuZnJhbWUpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tzW2ldLnZpc2libGUgPSBjb3N0ID4gZ29sZDtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFNlbGVjdGVkKCk6IEVudGl0eVR5cGUge1xyXG4gICAgICAgIHJldHVybiA8RW50aXR5VHlwZT4gdGhpcy5zZWxlY3RlZDtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShJbnB1dENvbnRleHQuU2hvcCk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUpO1xyXG4gICAgfVxyXG4gICAgaGlkZShhbmltYXRlOiBib29sZWFuID0gZmFsc2UsIGRlc3Ryb3lfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UsIHVwZGF0ZV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5TaG9wKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdysrO1xyXG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJfc2xvdyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMiAtIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlci55ID0gNSArIE1hdGguZmxvb3IodGhpcy5zZWxlY3RlZCAvIDIpICogMjk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnggPSAtOSArICh0aGlzLnNlbGVjdGVkICUgMikgKiAyOCArIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgIH1cclxuICAgIHByZXYodmVydGljYWw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtPSAyO1xyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKz0gdGhpcy5lbnRpdHlfaW1hZ2VzLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBuZXh0KHZlcnRpY2FsOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKz0gMjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkID49IHRoaXMuZW50aXR5X2ltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtPSB0aGlzLmVudGl0eV9pbWFnZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X2ltYWdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubWFza3MgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLmNvc3QgPiAxMDAwKSB7IGNvbnRpbnVlOyB9XHJcblxyXG4gICAgICAgICAgICBsZXQgeCA9IChpICUgMikgKiAyNyArIDM7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpIC8gMikgKiAyOSArIDU7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKHgsIHksIFwidW5pdF9pY29uc18xXCIsIGksIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X2ltYWdlcy5wdXNoKGltYWdlKTtcclxuICAgICAgICAgICAgbGV0IG1hc2sgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKHgsIHksIFwibWFza1wiLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tzLnB1c2gobWFzayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9pbnRlciA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNCwgNCwgXCJwb2ludGVyXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMjtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdyA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lbnVTaG9wSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBwcml2YXRlIHVuaXRfaWNvbjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSB1bml0X25hbWU6IFBoYXNlci5CaXRtYXBUZXh0O1xyXG4gICAgcHJpdmF0ZSB1bml0X2Nvc3Q6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF9hdGs6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF9kZWY6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF9tb3Y6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF90ZXh0OiBQaGFzZXIuQml0bWFwVGV4dDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwLCBhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoZ3JvdXAuZ2FtZS53aWR0aCAtIDY0LCBncm91cC5nYW1lLmhlaWdodCwgZ3JvdXAsIERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLkxlZnQpO1xyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoYWxsaWFuY2UpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudCh0eXBlOiBFbnRpdHlUeXBlKSB7XHJcbiAgICAgICAgbGV0IGRhdGE6IEVudGl0eURhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1soPG51bWJlcj4gdHlwZSldO1xyXG4gICAgICAgIHRoaXMudW5pdF9pY29uLmZyYW1lID0gPG51bWJlcj4gdHlwZTtcclxuICAgICAgICB0aGlzLnVuaXRfbmFtZS5zZXRUZXh0KGRhdGEubmFtZS50b1VwcGVyQ2FzZSgpKTtcclxuICAgICAgICB0aGlzLnVuaXRfY29zdC5zZXRUZXh0KGRhdGEuY29zdC50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLnVuaXRfYXRrLnNldFRleHQoZGF0YS5hdGsudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy51bml0X2RlZi5zZXRUZXh0KGRhdGEuZGVmLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMudW5pdF9tb3Yuc2V0VGV4dChkYXRhLm1vdi50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLnVuaXRfdGV4dC5zZXRUZXh0KEFuY2llbnRFbXBpcmVzLkxBTkdbNzUgKyAoPG51bWJlcj4gdHlwZSldKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy51bml0X2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDIsIDIsIFwidW5pdF9pY29uc19cIiArIChhbGxpYW5jZSA9PSBBbGxpYW5jZS5CbHVlID8gMSA6IDIpLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLnVuaXRfbmFtZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgyOSwgNCwgXCJmb250N1wiLCBcIlwiLCA3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMjgsIDEzLCBcImdvbGRcIiwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnVuaXRfY29zdCA9IG5ldyBBRUZvbnQoNTQsIDE2LCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiXCIpO1xyXG5cclxuICAgICAgICBuZXcgQUVGb250KDIsIDMzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiQVRLXCIpO1xyXG4gICAgICAgIHRoaXMudW5pdF9hdGsgPSBuZXcgQUVGb250KDk1LCAzMywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuICAgICAgICBuZXcgQUVGb250KDIsIDQzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiREVGXCIpO1xyXG4gICAgICAgIHRoaXMudW5pdF9kZWYgPSBuZXcgQUVGb250KDk1LCA0MywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuICAgICAgICBuZXcgQUVGb250KDIsIDUzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiTU9WXCIpO1xyXG4gICAgICAgIHRoaXMudW5pdF9tb3YgPSBuZXcgQUVGb250KDk1LCA1MywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy51bml0X3RleHQgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoNiwgNjksIFwiZm9udDdcIiwgXCJcIiwgNywgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnVuaXRfdGV4dC5tYXhXaWR0aCA9IHRoaXMuZ3JvdXAuZ2FtZS53aWR0aCAtIDY0IC0gMTg7XHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgTWluaU1hcCBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBwcml2YXRlIGVudGl0aWVzOiBQaGFzZXIuSW1hZ2VbXTtcclxuICAgIHByaXZhdGUgZW50aXR5X21hbmFnZXI6IEVudGl0eU1hbmFnZXI7XHJcbiAgICBwcml2YXRlIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZTtcclxuICAgIHByaXZhdGUgbWFwOiBNYXA7XHJcblxyXG4gICAgcHJpdmF0ZSBzbG93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHVuaXRzX3Zpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyLCBncm91cDogUGhhc2VyLkdyb3VwLCBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIgPSBlbnRpdHlfbWFuYWdlcjtcclxuICAgICAgICB0aGlzLm1lbnVfZGVsZWdhdGUgPSBtZW51X2RlbGVnYXRlO1xyXG5cclxuICAgICAgICB0aGlzLnNsb3cgPSAwO1xyXG4gICAgICAgIHRoaXMudW5pdHNfdmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZShtYXAud2lkdGggKiBBbmNpZW50RW1waXJlcy5NSU5JX1NJWkUgKyAxMiwgbWFwLmhlaWdodCAqIEFuY2llbnRFbXBpcmVzLk1JTklfU0laRSArIDEyLCBncm91cCwgRGlyZWN0aW9uLk5vbmUsIERpcmVjdGlvbi5BbGwsIERpcmVjdGlvbi5Ob25lKTtcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUub3Blbk1lbnUoSW5wdXRDb250ZXh0LkFjayk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUpO1xyXG4gICAgfVxyXG4gICAgaGlkZShhbmltYXRlOiBib29sZWFuID0gZmFsc2UsIGRlc3Ryb3lfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UsIHVwZGF0ZV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5BY2spOyB9XHJcbiAgICAgICAgc3VwZXIuaGlkZShhbmltYXRlLCBkZXN0cm95X29uX2ZpbmlzaCwgdXBkYXRlX29uX2ZpbmlzaCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIHRoaXMuc2xvdyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5zbG93ID49IDMwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2xvdyAtPSAzMDtcclxuICAgICAgICAgICAgdGhpcy51bml0c192aXNpYmxlID0gIXRoaXMudW5pdHNfdmlzaWJsZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaW1hZ2Ugb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UudmlzaWJsZSA9IHRoaXMudW5pdHNfdmlzaWJsZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5tYXAud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMubWFwLmhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmdldFRpbGVJbmRleEF0KG5ldyBQb3MoeCwgeSkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSh4ICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFLCB5ICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFLCBcInN0aWxlczBcIiwgaW5kZXgsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdHlfbWFuYWdlci5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKGVudGl0eS5wb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFLCBlbnRpdHkucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLk1JTklfU0laRSwgXCJ1bml0X2ljb25zX3NfXCIgKyAoPG51bWJlcj4gZW50aXR5LmFsbGlhbmNlKSwgPG51bWJlcj4gZW50aXR5LnR5cGUsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXRpZXMucHVzaChpbWFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRUaWxlSW5kZXhBdChwb3NpdGlvbjogUG9zKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbik7XHJcbiAgICAgICAgc3dpdGNoICh0aWxlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5QYXRoOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5HcmFzczpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuV2F0ZXI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiA2O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAodGlsZSA9PSBUaWxlLkNhc3RsZSA/IDggOiA3KSArICg8bnVtYmVyPiBhbGxpYW5jZSkgKiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
