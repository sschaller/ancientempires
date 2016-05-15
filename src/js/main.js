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
        PNGLoader.loadImage(waiter, "pointer");
        PNGLoader.loadSpriteSheet(waiter, "redspark");
        PNGLoader.loadSpriteSheet(waiter, "spark");
        PNGLoader.loadSpriteSheet(waiter, "smoke");
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
        this.game.state.start("Game", false, false, name);
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
})(InputContext || (InputContext = {}));
var GameController = (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        _super.call(this);
        this.acc = 0;
    }
    GameController.prototype.init = function (name) {
        this.map = new Map(name);
        this.keys = new Input(this.game.input);
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
        this.context = [InputContext.Map];
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
        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group, this);
        this.frame_manager = new FrameManager();
        this.tile_manager.draw();
        this.frame_def_info = new MenuDefInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);
        this.frame_gold_info = new MenuGoldInfo(this.frame_group);
        this.frame_manager.addFrame(this.frame_gold_info);
        this.frame_gold_info.show(true);
        var soldier = this.entity_manager.createEntity(EntityType.Soldier, Alliance.Red, new Pos(4, 13));
        soldier.setHealth(2);
        this.cursor_target = this.entity_manager.getKingPosition(Alliance.Blue);
        this.cursor = new Sprite(this.cursor_target.getWorldPosition(), cursor_group, "cursor", [0, 1]);
        this.cursor.setOffset(-1, -1);
        this.camera.x = this.getOffsetX(this.cursor.world_position.x);
        this.camera.y = this.getOffsetY(this.cursor.world_position.y);
        this.startTurn(Alliance.Blue);
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
            var entity = this.entity_manager.getEntityAt(this.cursor_target);
            this.frame_def_info.updateContent(this.cursor_target, this.map, entity);
        }
        // input
        this.frame_manager.update(steps);
        if (!!this.options_menu) {
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
    GameController.prototype.entityDidAttack = function (entity) {
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
    GameController.prototype.deselectEntity = function () {
        if (!this.selected_entity) {
            return;
        }
        this.cursor_target = this.selected_entity.position.copy();
        this.entity_manager.hideRange();
        this.entity_manager.deselectEntity(this.selected_entity);
        this.last_entity_position = null;
        this.selected_entity = null;
    };
    GameController.prototype.nextTurn = function () {
        var next_turn = Alliance.Blue;
        if (this.turn == Alliance.Blue) {
            next_turn = Alliance.Red;
        }
        this.startTurn(next_turn);
    };
    GameController.prototype.startTurn = function (alliance) {
        this.turn = alliance;
        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));
        this.entity_manager.startTurn(alliance);
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
        if (!!this.frame_gold_info) {
            this.frame_gold_info.updateContent(alliance, amount);
        }
    };
    GameController.prototype.showOptionMenu = function (options) {
        this.options_menu = new MenuOptions(this.frame_group, Direction.Right, options, this);
        this.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    };
    GameController.prototype.selectOption = function (option) {
        this.active_action = option;
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
                this.cursor.hide();
                this.entity_manager.showRange(EntityRangeType.Attack, this.selected_entity);
                this.cursor_target = this.entity_manager.nextTargetInRange(Direction.None).position.copy();
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
            case Action.CANCEL:
                if (!!this.last_entity_position) {
                    // last action was walking. reset entity & set cursor to current position
                    this.active_action = Action.MOVE;
                    this.cursor_target = this.selected_entity.position;
                    this.entity_manager.moveEntity(this.selected_entity, this.last_entity_position, false);
                    this.last_entity_position = null;
                    this.entity_manager.showRange(EntityRangeType.Move, this.selected_entity);
                }
                else {
                    this.deselectEntity();
                }
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
                    this.deselectEntity();
                    if (entity.position.match(this.entity_manager.getKingPosition(this.turn)) && entity.data.cost <= 1000) {
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
                    this.context.pop();
                    this.selectOption(this.options_menu.getSelected());
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.context.pop();
                    this.selectOption(Action.CANCEL);
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
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
                        this.deselectEntity();
                        this.closeShop();
                        this.setGoldForAlliance(this.turn, gold);
                        var entity = this.entity_manager.createEntity(entity_type, this.turn, this.entity_manager.getKingPosition(this.turn));
                        this.selectEntity(entity);
                    }
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.deselectEntity();
                    this.closeShop();
                }
                break;
        }
    };
    GameController.prototype.pickEntity = function (entity) {
        this.entity_manager.hideRange();
        this.cursor.show();
        this.context.push(InputContext.Wait);
        switch (this.active_action) {
            case Action.ATTACK:
                this.entity_manager.attackEntity(this.selected_entity, entity);
                console.log("Attack Entity!", entity.getInfo());
                break;
            case Action.RAISE:
                console.log("Raise Entity", entity.getInfo());
                break;
        }
    };
    GameController.prototype.pickPosition = function (position) {
        if (this.selected_entity) {
            switch (this.active_action) {
                case Action.MOVE:
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
        this.showOptionMenu(MenuOptions.getMainMenuOptions());
    };
    GameController.prototype.openShop = function (alliance) {
        this.context.push(InputContext.Shop);
        if (!this.shop_units) {
            this.shop_units = new MenuShopUnits(this.frame_group, this);
            this.frame_manager.addFrame(this.shop_units);
        }
        this.shop_units.updateContent(alliance);
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
    function EntityManager(map, entity_group, selection_group, interaction_group, delegate) {
        this.map = map;
        this.entity_group = entity_group;
        this.selection_group = selection_group;
        this.interaction_group = interaction_group;
        this.delegate = delegate;
        this.selection_graphics = selection_group.game.add.graphics(0, 0, selection_group);
        this.interaction_graphics = interaction_group.game.add.graphics(0, 0, interaction_group);
        this.moving = null;
        this.anim_idle_counter = 0;
        this.anim_idle_state = 0;
        this.entities = [];
        for (var _i = 0, _a = map.getStartEntities(); _i < _a.length; _i++) {
            var entity = _a[_i];
            this.createEntity(entity.type, entity.alliance, entity.position);
        }
        this.entity_range = new EntityRange(this.map, this, this.interaction_group);
    }
    EntityManager.prototype.createEntity = function (type, alliance, position) {
        var entity = new Entity(type, alliance, position, this.entity_group);
        this.entities.push(entity);
        return entity;
    };
    EntityManager.prototype.removeEntity = function (entity) {
        entity.destroy();
        for (var i = 0; i < this.entities.length; i++) {
            if (entity == this.entities[i]) {
                this.entities.splice(i, 1);
                break;
            }
        }
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
    EntityManager.prototype.startTurn = function (alliance) {
        for (var i = this.entities.length - 1; i >= 0; i--) {
            var entity = this.entities[i];
            if (entity.state == EntityState.Dead) {
                entity.death_count++;
                if (entity.death_count >= AncientEmpires.DEATH_COUNT) {
                    entity.destroy();
                    this.entities.splice(i);
                }
                continue;
            }
            if (entity.alliance == alliance) {
                entity.state = EntityState.Ready;
            }
            else {
                entity.state = EntityState.Moved;
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
        if (anim_state != this.anim_idle_state) {
            this.anim_idle_state = anim_state;
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var entity = _a[_i];
                entity.setFrame(this.anim_idle_state);
            }
        }
        this.entity_range.update(steps, cursor_position, anim_state, this.selection_graphics, this.interaction_graphics);
        this.animateMovingEntity(steps);
        this.animateAttackedEntity(steps);
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
    EntityManager.prototype.getAttackTargets = function (entity) {
        var targets = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var enemy = _a[_i];
            if (enemy.alliance == entity.alliance) {
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
    EntityManager.prototype.attackEntity = function (attacker, target, first) {
        if (first === void 0) { first = true; }
        var position = target.position.getWorldPosition();
        attacker.attack(target, this.map);
        this.attacked = {
            target: target,
            attacker: attacker,
            anim_id: 0,
            progress: 0,
            acc: 0,
            first: first,
            sprite: this.entity_group.game.add.sprite(position.x, position.y, "redspark", 0, this.interaction_group)
        };
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
        if (!!this.getEntityAt(target)) {
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
    EntityManager.prototype.animateAttackedEntity = function (steps) {
        if (!this.attacked) {
            return;
        }
        var attacked = this.attacked;
        attacked.acc++;
        if (attacked.acc >= 5) {
            attacked.acc -= 5;
            var middle = this.attacked.target.position.getWorldPosition();
            if (attacked.progress >= 30) {
                if (attacked.anim_id < 5) {
                    attacked.anim_id = 5;
                    attacked.sprite.destroy();
                    this.attacked = null;
                    this.delegate.entityDidAttack(attacked.attacker);
                }
            }
            else if (attacked.progress >= 22) {
                if (attacked.anim_id < 4) {
                    attacked.anim_id = 4;
                    attacked.sprite.loadTexture("smoke", 0);
                    // replace with tomb graphic
                    attacked.target.updateState(EntityState.Dead, true);
                }
                attacked.sprite.y = middle.y - (attacked.progress - 22) * 3; // 0, 3, 6
                attacked.sprite.frame = Math.floor((attacked.progress - 22) / 2);
            }
            else if (attacked.progress >= 16) {
                if (attacked.anim_id < 3) {
                    attacked.anim_id = 3;
                    attacked.sprite.loadTexture("spark", 0);
                    attacked.sprite.visible = true; // show sprite
                }
                attacked.sprite.frame = attacked.progress - 16;
            }
            else if (attacked.progress >= 8) {
                if (attacked.anim_id < 2) {
                    attacked.anim_id = 2;
                    // reset position
                    attacked.target.setWorldPosition(attacked.target.position.getWorldPosition());
                    if (!attacked.target.isDead()) {
                        attacked.sprite.destroy();
                        this.attacked = null; // stop animation if not dead
                        if (attacked.first) {
                            var should_counter = this.shouldCounter(attacked.target, attacked.attacker);
                            if (should_counter) {
                                this.attackEntity(attacked.target, attacked.attacker, false);
                                return;
                            }
                        }
                        this.delegate.entityDidAttack(attacked.first ? attacked.attacker : attacked.target);
                    }
                }
            }
            else if (attacked.progress >= 6) {
                if (attacked.anim_id < 1) {
                    attacked.anim_id = 1;
                    // hide sprite
                    attacked.sprite.visible = false;
                }
                attacked.target.setWorldPosition({ x: middle.x + 2 - attacked.progress % 2 * 4, y: middle.y }); // 7 - 2px left, 8 - 2px right
            }
            else {
                // Animate spark over target & shake target
                attacked.sprite.frame = attacked.progress % 3;
                attacked.target.setWorldPosition({ x: middle.x + 2 - attacked.progress % 2 * 4, y: middle.y }); // 0 - 2px right, 1 - 2px left, 2 - 2px right
            }
            attacked.progress++;
        }
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
    Entity.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
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
    Entity.prototype.getMovement = function () {
        // if poisoned, less -> apply here
        return this.data.mov;
    };
    Entity.prototype.destroy = function () {
        this.icon_health.destroy();
        this.icon_moved.destroy();
        _super.prototype.destroy.call(this);
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
    AncientEmpires.LINE_SEGMENT_LENGTH = 10;
    AncientEmpires.LINE_SEGMENT_WIDTH = 4;
    AncientEmpires.LINE_SEGMENT_SPACING = 2;
    AncientEmpires.DEATH_COUNT = 3;
    AncientEmpires.NUMBER_OF_TILES = 23;
    return AncientEmpires;
}());

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
})(Action || (Action = {}));
var MenuOptions = (function (_super) {
    __extends(MenuOptions, _super);
    function MenuOptions(group, align, options, delegate) {
        _super.call(this);
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
        this.initialize(width, height, group, align, Direction.All & ~align, align);
        this.drawContent();
    }
    MenuOptions.getMainMenuOptions = function () {
        return [Action.END_TURN, Action.MAP, Action.OBJECTIVE, Action.MAIN_MENU];
    };
    MenuOptions.getOptionString = function (option) {
        if (option == Action.None) {
            return "";
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
    MenuShopUnits.prototype.updateContent = function (alliance) {
        for (var _i = 0, _a = this.entity_images; _i < _a.length; _i++) {
            var image = _a[_i];
            image.loadTexture("unit_icons_" + alliance, image.frame);
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
            this.menu_delegate.openMenu(InputContext.Shop);
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
        for (var i = 0; i < AncientEmpires.ENTITIES.length; i++) {
            var data = AncientEmpires.ENTITIES[i];
            if (data.cost > 1000) {
                continue;
            }
            var x = (i % 2) * 27 + 3;
            var y = Math.floor(i / 2) * 29 + 5;
            var image = this.group.game.add.image(x, y, "unit_icons_1", i, this.content_group);
            this.entity_images.push(image);
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
        this.group = group;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsInV0aWwudHMiLCJsb2FkZXIudHMiLCJwbmdsb2FkZXIudHMiLCJtYWlubWVudS50cyIsImdhbWVjb250cm9sbGVyLnRzIiwibWFwLnRzIiwidGlsZW1hbmFnZXIudHMiLCJlbnRpdHltYW5hZ2VyLnRzIiwiZW50aXR5cmFuZ2UudHMiLCJzbW9rZW1hbmFnZXIudHMiLCJzcHJpdGUudHMiLCJzbW9rZS50cyIsImVudGl0eS50cyIsImZyYW1lLnRzIiwiYW5jaWVudGVtcGlyZXMudHMiLCJhdHRhY2tzY3JlZW4udHMiLCJmcmFtZW1hbmFnZXIudHMiLCJpbnB1dC50cyIsIm1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSyxXQUdKO0FBSEQsV0FBSyxXQUFXO0lBQ1osNkNBQUksQ0FBQTtJQUNKLCtDQUFLLENBQUE7QUFDVCxDQUFDLEVBSEksV0FBVyxLQUFYLFdBQVcsUUFHZjtBQUNEO0lBMENJLGdCQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsS0FBbUIsRUFBRSxLQUFrQixFQUFFLElBQWE7UUFDcEYsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQTFDTSxlQUFRLEdBQWYsVUFBZ0IsS0FBa0IsRUFBRSxNQUFjO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUN0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RUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzdDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3BDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQzlDLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLFNBQVMsQ0FBQyxl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QUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUMvRyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUIsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FB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Q0FBQyxDQUFDLGlCQUFpQjtRQUN0RCxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQUMsQ0FBQyxDQUFDLFdBQVc7UUFDNUMsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsQ0FBQyxjQUFjO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsZUFBZTtRQUMvQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQUMsQ0FBQyxDQUFDLFlBQVk7UUFDN0MsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUFDLENBQUMsQ0FBQyxhQUFhO1FBQzlDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsYUFBYTtRQUM3QyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsT0FBTztRQUNuQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDLENBQUMsU0FBUztRQUNyQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFD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RSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBRUQsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDL0MsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDVCxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQixHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakIsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRTdDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRWpELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1QsR0FBRyxJQUFJLENBQUMsQ0FBQztR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QUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsSCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3pELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwSCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdJLENBQUM7UUFFRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7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bSBBRUZvbnRTdHlsZSB7XHJcbiAgICBCb2xkLFxyXG4gICAgTGFyZ2VcclxufVxyXG5jbGFzcyBBRUZvbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgdGV4dDogc3RyaW5nO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGxldHRlcnM6IFBoYXNlci5JbWFnZVtdO1xyXG4gICAgcHJpdmF0ZSBzdHlsZTogQUVGb250U3R5bGU7XHJcblxyXG4gICAgc3RhdGljIGdldFdpZHRoKHN0eWxlOiBBRUZvbnRTdHlsZSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gNyAqIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDEwICogbGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldEZvbnRJbmRleChzdHlsZTogQUVGb250U3R5bGUsIGNoYXI6IG51bWJlcik6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmIChzdHlsZSA9PSBBRUZvbnRTdHlsZS5MYXJnZSkge1xyXG4gICAgICAgICAgICAvLyBsYXJnZSBmb250XHJcbiAgICAgICAgICAgIGlmIChjaGFyID49IDQ4ICYmIGNoYXIgPD0gNTcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEb24ndCByZWNvZ25pemUgY2hhciBjb2RlIFwiICsgY2hhciArIFwiIGZvciBmb250IGxhcmdlXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJvbGQgZm9udFxyXG5cclxuICAgICAgICBpZiAoY2hhciA+PSA2NSAmJiBjaGFyIDwgOTApIHsgLy8gY2FwaXRhbCBsZXR0ZXJzIHdpdGhvdXQgWlxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDY1O1xyXG4gICAgICAgIH1lbHNlIGlmIChjaGFyID49IDQ5ICYmIGNoYXIgPD0gNTcpIHsgLy8gYWxsIG51bWJlcnMgd2l0aG91dCAwXHJcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDkgKyAyNztcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0OCkgeyAvLyAwXHJcbiAgICAgICAgICAgIHJldHVybiAxNDsgLy8gcmV0dXJuIE9cclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0NSkgeyAvLyAtXHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0MykgeyAvLyArXHJcbiAgICAgICAgICAgIHJldHVybiAyNjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9uJ3QgcmVjb2duaXplIGNoYXIgY29kZSBcIiArIGNoYXIgKyBcIiBmb3IgZm9udCBib2xkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgc3R5bGU6IEFFRm9udFN0eWxlLCB0ZXh0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxldHRlciBvZiB0aGlzLmxldHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0dGVyLnggPSB4O1xyXG4gICAgICAgICAgICBsZXR0ZXIueSA9IHk7XHJcbiAgICAgICAgICAgIHggKz0gbGV0dGVyLndpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzZXRWaXNpYmlsaXR5KHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBmb3IgKGxldCBsZXR0ZXIgb2YgdGhpcy5sZXR0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldHRlci52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGw6IFBoYXNlci5JbWFnZVtdID0gW107XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLng7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoYXIgPSB0aGlzLnRleHQuY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gQUVGb250LmdldEZvbnRJbmRleCh0aGlzLnN0eWxlLCBjaGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHggKz0gQUVGb250LmdldFdpZHRoKHRoaXMuc3R5bGUsIDEpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmb250X25hbWU6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICAgICAgZm9udF9uYW1lID0gXCJjaGFyc1wiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuTGFyZ2UpIHtcclxuICAgICAgICAgICAgICAgIGZvbnRfbmFtZSA9IFwibGNoYXJzXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZTogUGhhc2VyLkltYWdlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sZXR0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuaW1hZ2UoeCwgdGhpcy55LCBmb250X25hbWUsIG51bGwsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltYWdlLmZyYW1lID0gaW5kZXg7XHJcbiAgICAgICAgICAgIGwucHVzaChpbWFnZSk7XHJcbiAgICAgICAgICAgIHggKz0gaW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGV0dGVyID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGxldHRlci5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IGw7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIElQb3Mge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG59XHJcbmNsYXNzIFBvcyBpbXBsZW1lbnRzIElQb3Mge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcbiAgICB9XHJcbiAgICBtYXRjaChwOiBJUG9zKSB7XHJcbiAgICAgICAgcmV0dXJuICghIXAgJiYgdGhpcy54ID09IHAueCAmJiB0aGlzLnkgPT0gcC55KTtcclxuICAgIH1cclxuICAgIGNvcHkoZGlyZWN0aW9uOiBEaXJlY3Rpb24gPSBEaXJlY3Rpb24uTm9uZSk6IFBvcyB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSAtIDEpO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCArIDEsIHRoaXMueSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSArIDEpO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54IC0gMSwgdGhpcy55KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54LCB0aGlzLnkpO1xyXG4gICAgfVxyXG4gICAgbW92ZShkaXJlY3Rpb246IERpcmVjdGlvbik6IFBvcyB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnktLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHRoaXMueCsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICB0aGlzLnkrKztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54LS07XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGlyZWN0aW9uVG8gKHA6IFBvcyk6IERpcmVjdGlvbiB7XHJcbiAgICAgICAgaWYgKHAueCA+IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLlJpZ2h0OyB9XHJcbiAgICAgICAgaWYgKHAueCA8IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLkxlZnQ7IH1cclxuICAgICAgICBpZiAocC55ID4gdGhpcy55KSB7IHJldHVybiBEaXJlY3Rpb24uRG93bjsgfVxyXG4gICAgICAgIGlmIChwLnkgPCB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5VcDsgfVxyXG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uTm9uZTtcclxuICAgIH1cclxuICAgIGdldFdvcmxkUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCB0aGlzLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgfVxyXG4gICAgZ2V0SW5mbygpIHtcclxuICAgICAgICByZXR1cm4gXCJ7eDogXCIgKyB0aGlzLnggKyBcIiwgeTogXCIgKyB0aGlzLnkgKyBcIn1cIjtcclxuICAgIH1cclxufVxyXG5lbnVtIERpcmVjdGlvbiB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFVwID0gMSxcclxuICAgIFJpZ2h0ID0gMixcclxuICAgIERvd24gPSA0LFxyXG4gICAgTGVmdCA9IDgsXHJcbiAgICBBbGwgPSAxNVxyXG59XHJcbiIsImludGVyZmFjZSBEYXRhRW50cnkge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG5jbGFzcyBMb2FkZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZCgpIHtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KFwiZm9udDdcIiwgXCJkYXRhL2ZvbnQucG5nXCIsIFwiZGF0YS9mb250LnhtbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJkYXRhXCIsIFwiZGF0YS8xLnBha1wiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJsYW5nXCIsIFwiZGF0YS9sYW5nLmRhdFwiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgdGhpcy51bnBhY2tSZXNvdXJjZURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvYWRFbnRpdHlEYXRhKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwVGlsZXNQcm9wKCk7XHJcbiAgICAgICAgdGhpcy51bnBhY2tMYW5nRGF0YSgpO1xyXG5cclxuICAgICAgICBsZXQgd2FpdGVyID0gbmV3IFBOR1dhaXRlcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIk1haW5NZW51XCIsIGZhbHNlLCBmYWxzZSwgbmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInRpbGVzMFwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDApO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDEpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNcIiwgMjQsIDI0LCAwLCAxKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ1bml0X2ljb25zXCIsIDI0LCAyNCwgMCwgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiY3Vyc29yXCIsIDI2LCAyNik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYl9zbW9rZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJtZW51XCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInBvcnRyYWl0XCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImNoYXJzXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcImdvbGRcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwicG9pbnRlclwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJyZWRzcGFya1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzcGFya1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzbW9rZVwiKTtcclxuXHJcblxyXG5cclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJyb2FkXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiZ3Jhc3NcIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJtb3VudGFpblwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcIndhdGVyXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidG93blwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcIndvb2RzX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcImhpbGxfYmdcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwibW91bnRhaW5fYmdcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwiYnJpZGdlX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcInRvd25fYmdcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwidG9tYnN0b25lXCIpO1xyXG5cclxuICAgICAgICB3YWl0ZXIuYXdhaXQoKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdW5wYWNrUmVzb3VyY2VEYXRhKCkge1xyXG4gICAgICAgIGxldCBhcnJheTogVWludDhBcnJheSA9IHRoaXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkoXCJkYXRhXCIpO1xyXG4gICAgICAgIGxldCBkYXRhID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDI7IC8vIGRvZXMgbm90IHNlZW0gaW1wb3J0YW50XHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRyaWVzID0gZGF0YS5nZXRVaW50MTYoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDI7XHJcblxyXG4gICAgICAgIGxldCBlbnRyaWVzOiBEYXRhRW50cnlbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRyaWVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN0cl9sZW4gPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzdHJfbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhLmdldFVpbnQ4KGluZGV4KyspKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCArPSA0OyAvLyBkb2VzIG5vdCBzZWVtIGltcG9ydGFudFxyXG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgZW50cmllcy5wdXNoKHtuYW1lOiBuYW1lLCBzaXplOiBzaXplfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRyeV9kYXRhOiBBcnJheUJ1ZmZlciA9IGFycmF5LmJ1ZmZlci5zbGljZShpbmRleCwgaW5kZXggKyBlbnRyeS5zaXplKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmNhY2hlLmFkZEJpbmFyeShlbnRyeS5uYW1lLCBlbnRyeV9kYXRhKTtcclxuICAgICAgICAgICAgaW5kZXggKz0gZW50cnkuc2l6ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRFbnRpdHlEYXRhKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInVuaXRzLmJpblwiKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMgPSBbXTtcclxuICAgICAgICBsZXQgbmFtZXMgPSBbXCJTb2xkaWVyXCIsIFwiQXJjaGVyXCIsIFwiTGl6YXJkXCIsIFwiV2l6YXJkXCIsIFwiV2lzcFwiLCBcIlNwaWRlclwiLCBcIkdvbGVtXCIsIFwiQ2F0YXB1bHRcIiwgXCJXeXZlcm5cIiwgXCJLaW5nXCIsIFwiU2tlbGV0b25cIl07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVudGl0eTogRW50aXR5RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldLFxyXG4gICAgICAgICAgICAgICAgbW92OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgYXRrOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgZGVmOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWluOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgY29zdDogZGF0YS5nZXRVaW50MTYoaW5kZXgpLFxyXG4gICAgICAgICAgICAgICAgYmF0dGxlX3Bvc2l0aW9uczogW10sXHJcbiAgICAgICAgICAgICAgICBmbGFnczogRW50aXR5RmxhZ3MuTm9uZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgbGV0IG51bWJlcl9wb3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9wb3M7IGorKykge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmJhdHRsZV9wb3NpdGlvbnMucHVzaCh7eDogZGF0YS5nZXRVaW50OChpbmRleCsrKSwgeTogZGF0YS5nZXRVaW50OChpbmRleCsrKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBudW1iZXJfZmxhZ3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9mbGFnczsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuZmxhZ3MgfD0gMSA8PCBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLnB1c2goZW50aXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRNYXBUaWxlc1Byb3AoKSB7XHJcbiAgICAgICAgbGV0IGJ1ZmZlcjogQXJyYXlCdWZmZXIgPSB0aGlzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KFwidGlsZXMwLnByb3BcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0OyAvLyAyIGFyZSB1bnJlbGV2YW50XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AucHVzaCg8VGlsZT4gZGF0YS5nZXRVaW50OChpbmRleCsrKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHByaXZhdGUgdW5wYWNrTGFuZ0RhdGEoKSB7XHJcbiAgICAgICAgbGV0IGFycmF5OiBVaW50OEFycmF5ID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcImxhbmdcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBudW1iZXIgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuTEFORyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcjsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkxBTkcucHVzaCh0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFBOR1dhaXRlciB7XHJcblxyXG4gICAgYXdhaXRpbmc6IGJvb2xlYW47XHJcbiAgICBjb3VudGVyOiBudW1iZXI7XHJcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XHJcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cclxuICAgIH1cclxuICAgIGF3YWl0KCkge1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAvLyBpZiBpbWcub25sb2FkIGlzIHN5bmNocm9ub3VzXHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyKys7XHJcbiAgICB9XHJcbiAgICByZXQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyLS07XHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA+IDAgfHwgIXRoaXMuYXdhaXRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG5cclxuICAgIH07XHJcbn1cclxuY2xhc3MgUE5HTG9hZGVyIHtcclxuICAgIHN0YXRpYyBidWZmZXJUb0Jhc2U2NChidWY6IFVpbnQ4QXJyYXkpIHtcclxuICAgICAgICBsZXQgYmluc3RyID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGJ1ZiwgZnVuY3Rpb24gKGNoOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY2gpO1xyXG4gICAgICAgIH0pLmpvaW4oXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIGJ0b2EoYmluc3RyKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbG9hZFNwcml0ZVNoZWV0KHdhaXRlcjogUE5HV2FpdGVyLCBuYW1lOiBzdHJpbmcsIHRpbGVfd2lkdGg/OiBudW1iZXIsIHRpbGVfaGVpZ2h0PzogbnVtYmVyLCBudW1iZXJfb2ZfdGlsZXM/OiBudW1iZXIsIHZhcmlhdGlvbj86IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgc3ByaXRlc2hlZXRfbmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiB0aWxlX2hlaWdodCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBcIi5zcHJpdGVcIik7XHJcbiAgICAgICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikgeyBudW1iZXJfb2ZfdGlsZXMgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiKSB7IHRpbGVfd2lkdGggPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV9oZWlnaHQgPT0gXCJ1bmRlZmluZWRcIikgeyB0aWxlX2hlaWdodCA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KG5hbWUgKyBcIi5wbmdcIikpIHtcclxuICAgICAgICAgICAgLy8gYWxsIHRpbGVzIGFyZSBpbiBvbmUgZmlsZVxyXG4gICAgICAgICAgICBsZXQgcG5nX2J1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgXCIucG5nXCIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhcmlhdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlc2hlZXRfbmFtZSArPSBcIl9cIiArIHZhcmlhdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICAgICAgd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBpbWcsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgUE5HTG9hZGVyLmJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHBuZ19idWZmZXIpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGlsZXMgYXJlIGluIG11bHRpcGxlIGZpbGVzIHdpdGggbmFtZXMgbmFtZV8wMC5wbmcsIG5hbWVfMDEucG5nLCAuLi5cclxuXHJcbiAgICAgICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICAgICAgbGV0IGlubmVyX3dhaXRlciA9IG5ldyBQTkdXYWl0ZXIod2FpdGVyLnJldCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3F1YXJlID0gTWF0aC5jZWlsKE1hdGguc3FydChudW1iZXJfb2ZfdGlsZXMpKTtcclxuICAgICAgICAgICAgbGV0IHNwcml0ZXNoZWV0ID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuYml0bWFwRGF0YShzcXVhcmUgKiB0aWxlX3dpZHRoLCBzcXVhcmUgKiB0aWxlX2hlaWdodCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX3RpbGVzOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZHg6IHN0cmluZyA9IGkgPCAxMCA/IChcIl8wXCIgKyBpKSA6IChcIl9cIiArIGkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIGlkeCArIFwiLnBuZ1wiKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0X25hbWUgKz0gXCJfXCIgKyB2YXJpYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbm5lcl93YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0LmN0eC5kcmF3SW1hZ2UoaW1nLCAoaSAlIHNxdWFyZSkgKiB0aWxlX3dpZHRoLCBNYXRoLmZsb29yKGkgLyBzcXVhcmUpICogdGlsZV9oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyX3dhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBQTkdMb2FkZXIuYnVmZmVyVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkocG5nX2J1ZmZlcikpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlubmVyX3dhaXRlci5hd2FpdCgpO1xyXG5cclxuICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBzcHJpdGVzaGVldC5jYW52YXMsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0LCBudW1iZXJfb2ZfdGlsZXMpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvYWRJbWFnZSh3YWl0ZXI6IFBOR1dhaXRlciwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIFwiLnBuZ1wiKTtcclxuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmFkZEltYWdlKG5hbWUsIG51bGwsIGltZyk7XHJcbiAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIFBOR0xvYWRlci5idWZmZXJUb0Jhc2U2NChuZXcgVWludDhBcnJheShwbmdfYnVmZmVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNyZWF0ZVZhcmlhdGlvbihidWZmZXI6IEFycmF5QnVmZmVyLCB2YXJpYXRpb24/OiBudW1iZXIpOiBBcnJheUJ1ZmZlciB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uID09IFwidW5kZWZpbmVkXCIpIHsgcmV0dXJuIGJ1ZmZlcjsgfVxyXG5cclxuICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCk7IC8vIGNvcHkgYnVmZmVyIChvdGhlcndpc2Ugd2UgbW9kaWZ5IG9yaWdpbmFsIGRhdGEsIHNhbWUgYXMgaW4gY2FjaGUpXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBsZXQgc3RhcnRfcGx0ZSA9IDA7XHJcblxyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGRhdGEuYnl0ZUxlbmd0aCAtIDM7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuZ2V0VWludDgoaW5kZXgpICE9IDgwIHx8IGRhdGEuZ2V0VWludDgoaW5kZXggKyAxKSAhPSA3NiB8fCBkYXRhLmdldFVpbnQ4KGluZGV4ICsgMikgIT0gODQpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgc3RhcnRfcGx0ZSA9IGluZGV4IC0gNDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gc3RhcnRfcGx0ZTtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aF9wbHRlID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGxldCBjcmMgPSAtMTsgLy8gMzIgYml0XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGluZGV4ICsgaSksIGNyYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBpbmRleDsgaSA8IGluZGV4ICsgbGVuZ3RoX3BsdGU7IGkgKz0gMykge1xyXG4gICAgICAgICAgICBsZXQgcmVkOiBudW1iZXIgPSBkYXRhLmdldFVpbnQ4KGkpO1xyXG4gICAgICAgICAgICBsZXQgZ3JlZW46IG51bWJlciA9IGRhdGEuZ2V0VWludDgoaSArIDEpO1xyXG4gICAgICAgICAgICBsZXQgYmx1ZTogbnVtYmVyID0gZGF0YS5nZXRVaW50OChpICsgMik7XHJcblxyXG4gICAgICAgICAgICBpZiAoYmx1ZSA+IHJlZCAmJiBibHVlID4gZ3JlZW4pIHtcclxuICAgICAgICAgICAgICAgIC8vIGJsdWUgY29sb3JcclxuICAgICAgICAgICAgICAgIGlmICh2YXJpYXRpb24gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0byByZWQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG1wID0gcmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHRtcDtcclxuICAgICAgICAgICAgICAgICAgICBncmVlbiAvPSAyO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHZhcmlhdGlvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVjb2xvcml6ZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBibHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpLCByZWQpO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMSwgZ3JlZW4pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMiwgYmx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAxKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAyKSwgY3JjKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY3JjIGZpZWxkXHJcbiAgICAgICAgY3JjIF49IC0xO1xyXG4gICAgICAgIGxldCBpbmRleF9jcmMgPSBzdGFydF9wbHRlICsgOCArIGxlbmd0aF9wbHRlO1xyXG4gICAgICAgIGRhdGEuc2V0VWludDMyKGluZGV4X2NyYywgY3JjKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyB1cGRhdGVQTkdDUkModmFsdWU6IG51bWJlciwgY3JjOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGNyYyBePSB2YWx1ZSAmIDI1NTsgLy8gYml0d2lzZSBvciAod2l0aG91dCBhbmQpXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKChjcmMgJiAxKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjcmMgPSBjcmMgPj4+IDEgXiAtMzA2Njc0OTEyO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3JjID4+Pj0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNyYztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidmVuZG9yL3BoYXNlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFuY2llbnRlbXBpcmVzLnRzXCIgLz5cclxuY2xhc3MgTWFpbk1lbnUgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZSAoKSB7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwKFwiczBcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE1hcCAobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiR2FtZVwiLCBmYWxzZSwgZmFsc2UsIG5hbWUpO1xyXG4gICAgfVxyXG59XHJcbiIsImVudW0gSW5wdXRDb250ZXh0IHtcclxuICAgIFdhaXQsXHJcbiAgICBTaG9wLFxyXG4gICAgT3B0aW9ucyxcclxuICAgIE1hcCxcclxuICAgIFNlbGVjdGlvblxyXG59XHJcbmNsYXNzIEdhbWVDb250cm9sbGVyIGV4dGVuZHMgUGhhc2VyLlN0YXRlIGltcGxlbWVudHMgRW50aXR5TWFuYWdlckRlbGVnYXRlLCBNZW51RGVsZWdhdGUge1xyXG5cclxuICAgIGtleXM6IElucHV0O1xyXG4gICAgbWFwOiBNYXA7XHJcblxyXG4gICAgdGlsZV9tYW5hZ2VyOiBUaWxlTWFuYWdlcjtcclxuICAgIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyO1xyXG4gICAgc21va2VfbWFuYWdlcjogU21va2VNYW5hZ2VyO1xyXG4gICAgZnJhbWVfbWFuYWdlcjogRnJhbWVNYW5hZ2VyO1xyXG5cclxuICAgIGZyYW1lX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBmcmFtZV9nb2xkX2luZm86IE1lbnVHb2xkSW5mbztcclxuICAgIGZyYW1lX2RlZl9pbmZvOiBNZW51RGVmSW5mbztcclxuXHJcbiAgICB0dXJuOiBBbGxpYW5jZTtcclxuICAgIGdvbGQ6IG51bWJlcltdO1xyXG5cclxuICAgIGN1cnNvcjogU3ByaXRlO1xyXG5cclxuXHJcbiAgICBhY2M6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGN1cnNvcl90YXJnZXQ6IFBvcztcclxuICAgIHByaXZhdGUgbGFzdF9jdXJzb3JfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG9wdGlvbnNfbWVudTogTWVudU9wdGlvbnM7XHJcblxyXG4gICAgcHJpdmF0ZSBhY3RpdmVfYWN0aW9uOiBBY3Rpb247XHJcbiAgICBwcml2YXRlIHNlbGVjdGVkX2VudGl0eTogRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBsYXN0X2VudGl0eV9wb3NpdGlvbjogUG9zO1xyXG5cclxuICAgIHByaXZhdGUgY29udGV4dDogSW5wdXRDb250ZXh0W107XHJcbiAgICBwcml2YXRlIHNob3BfdW5pdHM6IE1lbnVTaG9wVW5pdHM7XHJcbiAgICBwcml2YXRlIHNob3BfaW5mbzogTWVudVNob3BJbmZvO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdChuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG5ldyBNYXAobmFtZSk7XHJcbiAgICAgICAgdGhpcy5rZXlzID0gbmV3IElucHV0KHRoaXMuZ2FtZS5pbnB1dCk7XHJcblxyXG4gICAgICAgIHRoaXMudHVybiA9IEFsbGlhbmNlLkJsdWU7XHJcbiAgICAgICAgdGhpcy5nb2xkID0gW107XHJcblxyXG4gICAgICAgIGlmIChuYW1lLmNoYXJBdCgwKSA9PSBcInNcIikge1xyXG4gICAgICAgICAgICB0aGlzLmdvbGRbMF0gPSAxMDAwO1xyXG4gICAgICAgICAgICB0aGlzLmdvbGRbMV0gPSAxMDAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ29sZFswXSA9IDMwMDtcclxuICAgICAgICAgICAgdGhpcy5nb2xkWzFdID0gMzAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zbG93ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gW0lucHV0Q29udGV4dC5NYXBdO1xyXG5cclxuICAgIH1cclxuICAgIGNyZWF0ZSgpIHtcclxuXHJcbiAgICAgICAgbGV0IHRpbGVtYXAgPSB0aGlzLmdhbWUuYWRkLnRpbGVtYXAoKTtcclxuICAgICAgICBsZXQgdGlsZW1hcF9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgc21va2VfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IHNlbGVjdGlvbl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgZW50aXR5X2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBpbnRlcmFjdGlvbl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgY3Vyc29yX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9ncm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIodGhpcy5tYXAsIHRpbGVtYXAsIHRpbGVtYXBfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLnNtb2tlX21hbmFnZXIgPSBuZXcgU21va2VNYW5hZ2VyKHRoaXMubWFwLCBzbW9rZV9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIgPSBuZXcgRW50aXR5TWFuYWdlcih0aGlzLm1hcCwgZW50aXR5X2dyb3VwLCBzZWxlY3Rpb25fZ3JvdXAsIGludGVyYWN0aW9uX2dyb3VwLCB0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyID0gbmV3IEZyYW1lTWFuYWdlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci5kcmF3KCk7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8gPSBuZXcgTWVudURlZkluZm8odGhpcy5mcmFtZV9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMuZnJhbWVfZGVmX2luZm8pO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8gPSBuZXcgTWVudUdvbGRJbmZvKHRoaXMuZnJhbWVfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLmZyYW1lX2dvbGRfaW5mbyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgbGV0IHNvbGRpZXIgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmNyZWF0ZUVudGl0eShFbnRpdHlUeXBlLlNvbGRpZXIsIEFsbGlhbmNlLlJlZCwgbmV3IFBvcyg0LCAxMykpO1xyXG4gICAgICAgIHNvbGRpZXIuc2V0SGVhbHRoKDIpO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEtpbmdQb3NpdGlvbihBbGxpYW5jZS5CbHVlKTtcclxuICAgICAgICB0aGlzLmN1cnNvciA9IG5ldyBTcHJpdGUodGhpcy5jdXJzb3JfdGFyZ2V0LmdldFdvcmxkUG9zaXRpb24oKSwgY3Vyc29yX2dyb3VwLCBcImN1cnNvclwiLCBbMCwgMV0pO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yLnNldE9mZnNldCgtMSwgLTEpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbWVyYS54ID0gdGhpcy5nZXRPZmZzZXRYKHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLngpO1xyXG4gICAgICAgIHRoaXMuY2FtZXJhLnkgPSB0aGlzLmdldE9mZnNldFkodGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueSk7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhcnRUdXJuKEFsbGlhbmNlLkJsdWUpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dNZXNzYWdlKFwiR0FNRSBMT0FERURcIik7XHJcblxyXG4gICAgfVxyXG4gICAgc2hvd01lc3NhZ2UodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSBuZXcgTm90aWZpY2F0aW9uKHRoaXMuZnJhbWVfZ3JvdXAsIHRleHQsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZShtZW51KTtcclxuICAgICAgICBtZW51LnNob3codHJ1ZSk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gMSBzdGVwIGlzIDEvNjAgc2VjXHJcblxyXG4gICAgICAgIHRoaXMuYWNjICs9IHRoaXMudGltZS5lbGFwc2VkO1xyXG4gICAgICAgIGxldCBzdGVwcyA9IE1hdGguZmxvb3IodGhpcy5hY2MgLyAxNik7XHJcbiAgICAgICAgaWYgKHN0ZXBzIDw9IDApIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5hY2MgLT0gc3RlcHMgKiAxNjtcclxuICAgICAgICBpZiAoc3RlcHMgPiAyKSB7IHN0ZXBzID0gMjsgfVxyXG5cclxuICAgICAgICB0aGlzLmtleXMudXBkYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FwdHVyZUlucHV0KCk7XHJcblxyXG4gICAgICAgIGxldCBjdXJzb3JfcG9zaXRpb24gPSB0aGlzLmN1cnNvcl90YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgIGxldCBkaWZmX3ggPSBjdXJzb3JfcG9zaXRpb24ueCAtIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLng7XHJcbiAgICAgICAgbGV0IGRpZmZfeSA9IGN1cnNvcl9wb3NpdGlvbi55IC0gdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgbGV0IGR4ID0gMDtcclxuICAgICAgICBsZXQgZHkgPSAwO1xyXG5cclxuICAgICAgICBpZiAoZGlmZl94ICE9IDApIHtcclxuICAgICAgICAgICAgZHggPSBNYXRoLmZsb29yKGRpZmZfeCAvIDQpO1xyXG4gICAgICAgICAgICBpZiAoZHggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWF4KGR4LCAtNCk7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWluKGR4LCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWluKGR4LCA0KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oe3g6IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggKyBkeCwgeTogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueSArIGR5fSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaWZmX3kgIT0gMCkge1xyXG4gICAgICAgICAgICBkeSA9IE1hdGguZmxvb3IoZGlmZl95IC8gNCk7XHJcbiAgICAgICAgICAgIGlmIChkeSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIC00KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIDQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2V0V29ybGRQb3NpdGlvbih7eDogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCArIGR4LCB5OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55ICsgZHl9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5jdXJzb3JfdGFyZ2V0Lm1hdGNoKHRoaXMubGFzdF9jdXJzb3JfcG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdF9jdXJzb3JfcG9zaXRpb24gPSB0aGlzLmN1cnNvcl90YXJnZXQuY29weSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGRlZiBpbmZvXHJcbiAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEVudGl0eUF0KHRoaXMuY3Vyc29yX3RhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlQ29udGVudCh0aGlzLmN1cnNvcl90YXJnZXQsIHRoaXMubWFwLCBlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIGlucHV0XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICBpZiAoISF0aGlzLm9wdGlvbnNfbWVudSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyA+IDMwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyAtPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSA9IDEgLSB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRGcmFtZSh0aGlzLmFuaW1fY3Vyc29yX3N0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIHRoaXMuc21va2VfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnVwZGF0ZShzdGVwcywgdGhpcy5jdXJzb3JfdGFyZ2V0LCB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXRGb3JQb3NpdGlvbih0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBpbmZvX2lzX3JpZ2h0ID0gKHRoaXMuZnJhbWVfZ29sZF9pbmZvLmFsaWduICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwO1xyXG4gICAgICAgIGlmICghaW5mb19pc19yaWdodCAmJiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54IC0gMSAtIHRoaXMuY2FtZXJhLnggPD0gdGhpcy5nYW1lLndpZHRoIC8gMiAtIDI0IC0gMTIpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5MZWZ0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5SaWdodCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLkxlZnQgfCBEaXJlY3Rpb24uVXAsIERpcmVjdGlvbi5SaWdodCwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbmZvX2lzX3JpZ2h0ICYmIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggKyAxIC0gdGhpcy5jYW1lcmEueCA+PSB0aGlzLmdhbWUud2lkdGggLyAyICsgMTIpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5MZWZ0LCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5VcCwgRGlyZWN0aW9uLkxlZnQsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlPcHRpb25zKGVudGl0eSwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoIDwgMSkgeyByZXR1cm47IH1cclxuICAgICAgICB0aGlzLnNob3dPcHRpb25NZW51KG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIGVudGl0eURpZEF0dGFjayhlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eS51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5Nb3ZlZCwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eSgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9wZW5NZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ID09IElucHV0Q29udGV4dC5XYWl0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5wdXNoKGNvbnRleHQpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY29udGV4dCA9PSBJbnB1dENvbnRleHQuU2hvcCkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLmhpZGUodHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8uaGlkZSh0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby5oaWRlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNsb3NlTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpIHtcclxuICAgICAgICBpZiAoY29udGV4dCA9PSBJbnB1dENvbnRleHQuV2FpdCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhY3RpdmVfY29udGV4dCA9IHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgc3dpdGNoIChhY3RpdmVfY29udGV4dCkge1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5NYXA6XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LlNlbGVjdGlvbjpcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnNob3codHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnNob3codHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuU2hvcDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnNob3codHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEVudGl0eU9wdGlvbnMoZW50aXR5LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIC8vIG5vIG9wdGlvbnMgbWVhbjogbm90IGluIGFsbGlhbmNlIG9yIGFscmVhZHkgbW92ZWRcclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNvIG1ldGhvZCBjYW4gYmUgdXNlZCB0byBzaG93IG9wdGlvbnMgZm9yIGVudGl0eSBhZ2FpbiAtPiBtdXN0IGJlIHNhbWUgZW50aXR5IGFzIHNlbGVjdGVkXHJcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkX2VudGl0eSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eSA9IGVudGl0eTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5zZWxlY3RFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2VsZWN0ZWRfZW50aXR5ICE9IGVudGl0eSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbk1lbnUob3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24ob3B0aW9uc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkZXNlbGVjdEVudGl0eSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0ZWRfZW50aXR5KSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5oaWRlUmFuZ2UoKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5kZXNlbGVjdEVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgbmV4dFR1cm4oKSB7XHJcbiAgICAgICAgbGV0IG5leHRfdHVybiA9IEFsbGlhbmNlLkJsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMudHVybiA9PSBBbGxpYW5jZS5CbHVlKSB7XHJcbiAgICAgICAgICAgIG5leHRfdHVybiA9IEFsbGlhbmNlLlJlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zdGFydFR1cm4obmV4dF90dXJuKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0VHVybihhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy50dXJuID0gYWxsaWFuY2U7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIHRoaXMuZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlKSk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc3RhcnRUdXJuKGFsbGlhbmNlKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRHb2xkRm9yQWxsaWFuY2UoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgc3dpdGNoIChhbGxpYW5jZSkge1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLkJsdWU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb2xkWzBdO1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLlJlZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgc2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlOiBBbGxpYW5jZSwgYW1vdW50OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgYWxsaWFuY2VfaWQ6IG51bWJlcjtcclxuICAgICAgICBzd2l0Y2ggKGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuQmx1ZTpcclxuICAgICAgICAgICAgICAgIGFsbGlhbmNlX2lkID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLlJlZDpcclxuICAgICAgICAgICAgICAgIGFsbGlhbmNlX2lkID0gMTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdvbGRbYWxsaWFuY2VfaWRdID0gYW1vdW50O1xyXG4gICAgICAgIGlmICghIXRoaXMuZnJhbWVfZ29sZF9pbmZvKSB7IHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIGFtb3VudCk7IH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNob3dPcHRpb25NZW51KG9wdGlvbnM6IEFjdGlvbltdKSB7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbmV3IE1lbnVPcHRpb25zKHRoaXMuZnJhbWVfZ3JvdXAsIERpcmVjdGlvbi5SaWdodCwgb3B0aW9ucywgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMub3B0aW9uc19tZW51KTtcclxuICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5zaG93KHRydWUpO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdE9wdGlvbihvcHRpb246IEFjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYWN0aXZlX2FjdGlvbiA9IG9wdGlvbjtcclxuICAgICAgICBzd2l0Y2ggKG9wdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5PQ0NVUFk6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRBbGxpYW5jZUF0KHRoaXMuc2VsZWN0ZWRfZW50aXR5LnBvc2l0aW9uLCB0aGlzLnNlbGVjdGVkX2VudGl0eS5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci5kcmF3VGlsZUF0KHRoaXMuc2VsZWN0ZWRfZW50aXR5LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoXCJPQ0NVUElFRFwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5LnVwZGF0ZVN0YXRlKEVudGl0eVN0YXRlLk1vdmVkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5BVFRBQ0s6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucHVzaChJbnB1dENvbnRleHQuU2VsZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5BdHRhY2ssIHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLk5vbmUpLnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5SQUlTRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5TZWxlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLlJhaXNlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLm5leHRUYXJnZXRJblJhbmdlKERpcmVjdGlvbi5Ob25lKS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uTU9WRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5Nb3ZlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQlVZOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuU2hvcCh0aGlzLnNlbGVjdGVkX2VudGl0eS5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRU5EX01PVkU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eS51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5Nb3ZlZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRU5EX1RVUk46XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlKFwiRU5EIFRVUk5cIik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRUdXJuKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQ0FOQ0VMOlxyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxhc3QgYWN0aW9uIHdhcyB3YWxraW5nLiByZXNldCBlbnRpdHkgJiBzZXQgY3Vyc29yIHRvIGN1cnJlbnQgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9hY3Rpb24gPSBBY3Rpb24uTU9WRTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5tb3ZlRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCB0aGlzLmxhc3RfZW50aXR5X3Bvc2l0aW9uLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5Nb3ZlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXRGb3JQb3NpdGlvbihwb3NpdGlvbjogSVBvcykge1xyXG4gICAgICAgIGxldCB4ID0gcG9zaXRpb24ueCArIDAuNSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeSA9IHBvc2l0aW9uLnkgKyAwLjUgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KHgsIHkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSB0aGlzLmdldE9mZnNldFgoeCk7XHJcbiAgICAgICAgbGV0IG9mZnNldF95ID0gdGhpcy5nZXRPZmZzZXRZKHkpO1xyXG5cclxuICAgICAgICBsZXQgZGlmZl94ID0gb2Zmc2V0X3ggLSB0aGlzLmNhbWVyYS54O1xyXG4gICAgICAgIGxldCBkaWZmX3kgPSBvZmZzZXRfeSAtIHRoaXMuY2FtZXJhLnk7XHJcblxyXG4gICAgICAgIGlmIChkaWZmX3ggIT0gMCkge1xyXG4gICAgICAgICAgICBsZXQgZHggPSBNYXRoLmZsb29yKGRpZmZfeCAvIDEyKTtcclxuICAgICAgICAgICAgaWYgKGR4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgLTQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1pbihkeCwgLTEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1pbihkeCwgNCk7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWF4KGR4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS54ICs9IGR4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlmZl95ICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGR5ID0gTWF0aC5mbG9vcihkaWZmX3kgLyAxMik7XHJcbiAgICAgICAgICAgIGlmIChkeSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIC00KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIDQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueSArPSBkeTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGdldE9mZnNldFgoeDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSB4IC0gdGhpcy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICBpZiAodGhpcy5nYW1lLndpZHRoIDwgdGhpcy53b3JsZC53aWR0aCkge1xyXG4gICAgICAgICAgICBvZmZzZXRfeCA9IE1hdGgubWF4KG9mZnNldF94LCAwKTtcclxuICAgICAgICAgICAgb2Zmc2V0X3ggPSBNYXRoLm1pbihvZmZzZXRfeCwgdGhpcy53b3JsZC53aWR0aCAtIHRoaXMuZ2FtZS53aWR0aCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3ggPSAodGhpcy5nYW1lLndpZHRoIC0gdGhpcy53b3JsZC53aWR0aCkgLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0X3g7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGdldE9mZnNldFkoeTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSB5IC0gdGhpcy5nYW1lLmhlaWdodCAvIDI7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5oZWlnaHQgPCB0aGlzLndvcmxkLmhlaWdodCkge1xyXG4gICAgICAgICAgICBvZmZzZXRfeSA9IE1hdGgubWF4KG9mZnNldF95LCAwKTtcclxuICAgICAgICAgICAgb2Zmc2V0X3kgPSBNYXRoLm1pbihvZmZzZXRfeSwgdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvZmZzZXRfeSA9ICh0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy53b3JsZC5oZWlnaHQpIC8gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldF95O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBjYXB0dXJlSW5wdXQoKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmtleXMuYWxsX2tleXMgPT0gS2V5Lk5vbmUpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5jb250ZXh0W3RoaXMuY29udGV4dC5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5NYXA6XHJcbiAgICAgICAgICAgICAgICBsZXQgY3Vyc29yX3N0aWxsID0gdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCAlIDI0ID09IDAgJiYgdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueSAlIDI0ID09IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuVXApICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmN1cnNvcl90YXJnZXQueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkgJiYgY3Vyc29yX3N0aWxsICYmIHRoaXMuY3Vyc29yX3RhcmdldC54IDwgdGhpcy5tYXAud2lkdGggLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0Lm1vdmUoRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikgJiYgY3Vyc29yX3N0aWxsICYmIHRoaXMuY3Vyc29yX3RhcmdldC55IDwgdGhpcy5tYXAuaGVpZ2h0IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldC5tb3ZlKERpcmVjdGlvbi5Eb3duKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkgJiYgY3Vyc29yX3N0aWxsICYmIHRoaXMuY3Vyc29yX3RhcmdldC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldC5tb3ZlKERpcmVjdGlvbi5MZWZ0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlja1Bvc2l0aW9uKHRoaXMuY3Vyc29yX3RhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLnNlbGVjdGVkX2VudGl0eTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVudGl0eS5wb3NpdGlvbi5tYXRjaCh0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEtpbmdQb3NpdGlvbih0aGlzLnR1cm4pKSAmJiBlbnRpdHkuZGF0YS5jb3N0IDw9IDEwMDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZW50aXR5IHdhcyBib3VnaHQsIGFkZCBnb2xkIGJhY2sgYW5kIHJlbW92ZSBlbnRpdHlcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGdvbGQgPSB0aGlzLmdldEdvbGRGb3JBbGxpYW5jZSh0aGlzLnR1cm4pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEdvbGRGb3JBbGxpYW5jZSh0aGlzLnR1cm4sIGdvbGQgKyBlbnRpdHkuZGF0YS5jb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5yZW1vdmVFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0Lk9wdGlvbnM6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuVXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51LnByZXYoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24odGhpcy5vcHRpb25zX21lbnUuZ2V0U2VsZWN0ZWQoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24oQWN0aW9uLkNBTkNFTCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuU2VsZWN0aW9uOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSAmJiB0aGlzLmN1cnNvcl90YXJnZXQueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5VcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnggPCB0aGlzLm1hcC53aWR0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSAmJiB0aGlzLmN1cnNvcl90YXJnZXQueSA8IHRoaXMubWFwLmhlaWdodCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uRG93bik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldCA9IGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uTm9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrRW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5oaWRlUmFuZ2UoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5TaG9wOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlVwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMucHJldih0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuUmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cy5uZXh0KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMubmV4dCh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5MZWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMucHJldihmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX2luZm8udXBkYXRlQ29udGVudCh0aGlzLnNob3BfdW5pdHMuZ2V0U2VsZWN0ZWQoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5X3R5cGU6IG51bWJlciA9IHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBkYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbZW50aXR5X3R5cGVdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBnb2xkID0gdGhpcy5nZXRHb2xkRm9yQWxsaWFuY2UodGhpcy50dXJuKSAtIGRhdGEuY29zdDtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZ29sZCA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVNob3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRHb2xkRm9yQWxsaWFuY2UodGhpcy50dXJuLCBnb2xkKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZW50aXR5X21hbmFnZXIuY3JlYXRlRW50aXR5KGVudGl0eV90eXBlLCB0aGlzLnR1cm4sIHRoaXMuZW50aXR5X21hbmFnZXIuZ2V0S2luZ1Bvc2l0aW9uKHRoaXMudHVybikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRXNjKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVzYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VTaG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwaWNrRW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5oaWRlUmFuZ2UoKTtcclxuICAgICAgICB0aGlzLmN1cnNvci5zaG93KCk7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LldhaXQpO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5hY3RpdmVfYWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkFUVEFDSzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuYXR0YWNrRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBdHRhY2sgRW50aXR5IVwiLCBlbnRpdHkuZ2V0SW5mbygpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5SQUlTRTpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiUmFpc2UgRW50aXR5XCIsIGVudGl0eS5nZXRJbmZvKCkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGlja1Bvc2l0aW9uKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZF9lbnRpdHkpIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmFjdGl2ZV9hY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uLk1PVkU6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IHRoaXMuc2VsZWN0ZWRfZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLm1vdmVFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlBdChwb3NpdGlvbik7XHJcbiAgICAgICAgaWYgKCEhZW50aXR5KSB7XHJcbiAgICAgICAgICAgIC8vIG5vIGVudGl0eSBzZWxlY3RlZCwgY2xpY2tlZCBvbiBlbnRpdHkgLSB0cnkgdG8gc2VsZWN0IGl0XHJcbiAgICAgICAgICAgIGxldCBzdWNjZXNzID0gdGhpcy5zZWxlY3RFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgaWYgKHN1Y2Nlc3MpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2hvd09wdGlvbk1lbnUoTWVudU9wdGlvbnMuZ2V0TWFpbk1lbnVPcHRpb25zKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb3BlblNob3AoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LlNob3ApO1xyXG4gICAgICAgIGlmICghdGhpcy5zaG9wX3VuaXRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cyA9IG5ldyBNZW51U2hvcFVuaXRzKHRoaXMuZnJhbWVfZ3JvdXAsIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5zaG9wX3VuaXRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UpO1xyXG4gICAgICAgIHRoaXMuc2hvcF91bml0cy5zaG93KHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3BfaW5mbyA9IG5ldyBNZW51U2hvcEluZm8odGhpcy5mcmFtZV9ncm91cCwgYWxsaWFuY2UpO1xyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvLnVwZGF0ZUNvbnRlbnQoRW50aXR5VHlwZS5Tb2xkaWVyKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5zaG9wX2luZm8pO1xyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvLnNob3codHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjbG9zZVNob3AoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgIHRoaXMuc2hvcF91bml0cy5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2hvcF91bml0cyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zaG9wX2luZm8uaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLnNob3BfaW5mbyA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBUaWxlIHtcclxuICAgIFBhdGgsXHJcbiAgICBHcmFzcyxcclxuICAgIEZvcmVzdCxcclxuICAgIEhpbGwsXHJcbiAgICBNb3VudGFpbixcclxuICAgIFdhdGVyLFxyXG4gICAgQnJpZGdlLFxyXG4gICAgSG91c2UsXHJcbiAgICBDYXN0bGVcclxufVxyXG5pbnRlcmZhY2UgSUJ1aWxkaW5nIHtcclxuICAgIGNhc3RsZTogYm9vbGVhbjtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbn1cclxuXHJcbmNsYXNzIE1hcCB7XHJcblxyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gICAgc3RhcnRfZW50aXRpZXM6IElFbnRpdHlbXTtcclxuXHJcbiAgICBwcml2YXRlIHRpbGVzOiBUaWxlW11bXTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmdzOiBJQnVpbGRpbmdbXTtcclxuXHJcbiAgICBzdGF0aWMgZ2V0VGlsZUZvckNvZGUoY29kZTogbnVtYmVyKTogVGlsZSB7XHJcbiAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1BbY29kZV07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHN0YXRpYyBnZXRDb3N0Rm9yVGlsZSh0aWxlOiBUaWxlLCBlbnRpdHk6IEVudGl0eSk6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuV2F0ZXIgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHtcclxuICAgICAgICAgICAgLy8gTGl6YXJkIG9uIHdhdGVyXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvc3QgPSAwO1xyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuTW91bnRhaW4gfHwgdGlsZSA9PSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCB8fCB0aWxlID09IFRpbGUuSGlsbCkge1xyXG4gICAgICAgICAgICBjb3N0ID0gMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb3N0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuTGl6YXJkKSB7XHJcbiAgICAgICAgICAgIC8vIExpemFyZCBmb3IgZXZlcnl0aGluZyBleGNlcHQgd2F0ZXJcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgKiAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvc3Q7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0RGVmRm9yVGlsZSh0aWxlOiBUaWxlLCBlbnRpdHk6IEVudGl0eSk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbiB8fCB0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkgeyByZXR1cm4gMzsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuRm9yZXN0IHx8IHRpbGUgPT0gVGlsZS5IaWxsKSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5XYXRlciAmJiBlbnRpdHkgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHsgcmV0dXJuIDI7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkdyYXNzKSB7IHJldHVybiAxOyB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmxvYWQoKTtcclxuICAgIH1cclxuICAgIGxvYWQoKSB7XHJcbiAgICAgICAgaWYgKCFBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KHRoaXMubmFtZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBtYXA6IFwiICsgdGhpcy5uYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZ3MgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXJ0X2VudGl0aWVzID0gW107XHJcbiAgICAgICAgdGhpcy50aWxlcyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KHRoaXMubmFtZSk7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgdGhpcy50aWxlc1t4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb2RlID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgICAgIGxldCB0aWxlID0gTWFwLmdldFRpbGVGb3JDb2RlKGNvZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlc1t4XVt5XSA9IHRpbGU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkaW5ncy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzdGxlOiAodGlsZSA9PSBUaWxlLkNhc3RsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgUG9zKHgsIHkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxpYW5jZTogPEFsbGlhbmNlPiBNYXRoLmZsb29yKChjb2RlIC0gQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTKSAvIDMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBza2lwID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQgKyBza2lwICogNDtcclxuXHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRpdGllcyA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRpdGllczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXNjID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgbGV0IHR5cGU6IEVudGl0eVR5cGUgPSBkZXNjICUgMTE7XHJcbiAgICAgICAgICAgIGxldCBhbGxpYW5jZTogQWxsaWFuY2UgPSBNYXRoLmZsb29yKGRlc2MgLyAxMSkgKyAxO1xyXG5cclxuICAgICAgICAgICAgbGV0IHggPSBNYXRoLmZsb29yKGRhdGEuZ2V0VWludDE2KGluZGV4KSAvIDE2KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGRhdGEuZ2V0VWludDE2KGluZGV4KSAvIDE2KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRfZW50aXRpZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICAgICAgYWxsaWFuY2U6IGFsbGlhbmNlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBQb3MoeCwgeSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0VGlsZUF0KHBvc2l0aW9uOiBQb3MpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcclxuICAgIH1cclxuICAgIGdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbjogUG9zKTogVGlsZVtdIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgcG9zaXRpb24ueSA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA8IHRoaXMud2lkdGggLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPCB0aGlzLmhlaWdodCAtIDEgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSkgOiAtMVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChwOiBQb3MpOiBQb3NbXSB7XHJcbiAgICAgICAgbGV0IHJldDogUG9zW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XHJcbiAgICAgICAgaWYgKHAueSA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSAtIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPCB0aGlzLndpZHRoIC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCArIDEsIHAueSkpOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMuaGVpZ2h0IC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCwgcC55ICsgMSkpOyB9XHJcbiAgICAgICAgaWYgKHAueCA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggLSAxLCBwLnkpKTsgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgc2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zLCBhbGxpYW5jZTogQWxsaWFuY2UpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIGJ1aWxkaW5nLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxpYW5jZUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZGluZy5hbGxpYW5jZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQWxsaWFuY2UuTm9uZTtcclxuICAgIH1cclxuICAgIGdldE9jY3VwaWVkSG91c2VzKCk6IElCdWlsZGluZ1tdIHtcclxuICAgICAgICBsZXQgaG91c2VzOiBJQnVpbGRpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKXtcclxuICAgICAgICAgICAgaWYgKCFidWlsZGluZy5jYXN0bGUgJiYgYnVpbGRpbmcuYWxsaWFuY2UgIT0gQWxsaWFuY2UuTm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaG91c2VzLnB1c2goYnVpbGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBob3VzZXM7XHJcbiAgICB9XHJcbiAgICBnZXRTdGFydEVudGl0aWVzKCk6IElFbnRpdHlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRfZW50aXRpZXM7XHJcbiAgICB9XHJcbiAgICBnZXRDb3N0QXQocG9zaXRpb246IFBvcywgZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICByZXR1cm4gTWFwLmdldENvc3RGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxuICAgIGdldERlZkF0KHBvc2l0aW9uOiBQb3MsIGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hcC5nZXREZWZGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxufVxyXG4iLCJlbnVtIEFsbGlhbmNlIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgQmx1ZSA9IDEsXHJcbiAgICBSZWQgPSAyXHJcbn1cclxuY2xhc3MgVGlsZU1hbmFnZXIge1xyXG5cclxuICAgIG1hcDogTWFwO1xyXG4gICAgd2F0ZXJTdGF0ZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICB0aWxlbWFwOiBQaGFzZXIuVGlsZW1hcDtcclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblxyXG4gICAgYmFja2dyb3VuZExheWVyOiBQaGFzZXIuVGlsZW1hcExheWVyO1xyXG4gICAgYnVpbGRpbmdMYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuXHJcbiAgICB3YXRlclRpbWVyOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHN0YXRpYyBkb2VzVGlsZUN1dEdyYXNzKHRpbGU6IFRpbGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRpbGUgPT0gVGlsZS5QYXRoIHx8IHRpbGUgPT0gVGlsZS5XYXRlciB8fCB0aWxlID09IFRpbGUuQnJpZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0SW1hZ2VJbmRleEZvck9iamVjdFRpbGUodGlsZTogVGlsZSk6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuTW91bnRhaW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuRm9yZXN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhpbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0QmFzZUltYWdlSW5kZXhGb3JUaWxlKHRpbGU6IFRpbGUpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAodGlsZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuV2F0ZXI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTk7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5QYXRoOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE4O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVGlsZU1hbmFnZXIuZ2V0SW1hZ2VJbmRleEZvck9iamVjdFRpbGUodGlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogTWFwLCB0aWxlbWFwOiBQaGFzZXIuVGlsZW1hcCwgdGlsZW1hcF9ncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwID0gdGlsZW1hcDtcclxuICAgICAgICB0aGlzLmdyb3VwID0gdGlsZW1hcF9ncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcInRpbGVzMFwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgMCk7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcImJ1aWxkaW5nc18wXCIsIG51bGwsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBudWxsLCBudWxsLCBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMpO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMVwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTICsgMyk7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcImJ1aWxkaW5nc18yXCIsIG51bGwsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBudWxsLCBudWxsLCBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMgKyA2KTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIgPSB0aGlzLnRpbGVtYXAuY3JlYXRlKFwiYmFja2dyb3VuZFwiLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIucmVzaXplV29ybGQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZ0xheWVyID0gdGhpcy50aWxlbWFwLmNyZWF0ZUJsYW5rTGF5ZXIoXCJidWlsZGluZ1wiLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgdGhpcy5ncm91cCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLm1hcC53aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5tYXAuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RpbGVBdChuZXcgUG9zKHgsIHkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLndhdGVyVGltZXIgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMud2F0ZXJUaW1lciA+IDMwKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2F0ZXJUaW1lciA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2F0ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVdhdGVyKCkge1xyXG4gICAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMud2F0ZXJTdGF0ZTtcclxuICAgICAgICB0aGlzLndhdGVyU3RhdGUgPSAxIC0gdGhpcy53YXRlclN0YXRlO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVtYXAucmVwbGFjZSgyMSArIG9sZFN0YXRlLCAyMSArIHRoaXMud2F0ZXJTdGF0ZSwgMCwgMCwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdUaWxlQXQocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5wdXRUaWxlKHRoaXMuZ2V0SW1hZ2VJbmRleEZvckJhY2tncm91bmRBdChwb3NpdGlvbiksIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHRoaXMuYmFja2dyb3VuZExheWVyKTtcclxuICAgICAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IG9iaiA9IFRpbGVNYW5hZ2VyLmdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGUpO1xyXG4gICAgICAgIGlmIChvYmogPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhbGxpYW5jZSA9IHRoaXMubWFwLmdldEFsbGlhbmNlQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgb2JqICs9IGFsbGlhbmNlICogMztcclxuICAgICAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuQ2FzdGxlICYmIHBvc2l0aW9uLnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcm9vZiBvZiBjYXN0bGVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZShvYmogKyAxLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSwgdGhpcy5idWlsZGluZ0xheWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZShvYmosIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHRoaXMuYnVpbGRpbmdMYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0SW1hZ2VJbmRleEZvckJhY2tncm91bmRBdChwb3NpdGlvbjogUG9zKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgLy8gV2F0ZXJcclxuICAgICAgICAgICAgICAgIHJldHVybiAyMTtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIC8vIEJyaWRnZVxyXG4gICAgICAgICAgICAgICAgbGV0IGFkaiA9IHRoaXMubWFwLmdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWRqWzBdICE9IFRpbGUuV2F0ZXIgfHwgYWRqWzJdICE9IFRpbGUuV2F0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTk7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5QYXRoOlxyXG4gICAgICAgICAgICAgICAgLy8gUGF0aFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE4O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuR3Jhc3M6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEltYWdlSW5kZXhGb3JHcmFzc0F0KHBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDI7XHJcbiAgICB9XHJcbiAgICBnZXRJbWFnZUluZGV4Rm9yR3Jhc3NBdChwb3NpdGlvbjogUG9zKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgYWRqID0gdGhpcy5tYXAuZ2V0QWRqYWNlbnRUaWxlc0F0KHBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgY3V0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkai5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjdXQgKz0gTWF0aC5wb3coMiwgaSkgKiAoVGlsZU1hbmFnZXIuZG9lc1RpbGVDdXRHcmFzcyhhZGpbaV0pID8gMSA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3V0ID09IDggKyA0ICsgMiArIDEpIHsgcmV0dXJuIDM7IH0gLy8gYWxsIC0gbm90IHN1cHBsaWVkXHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgNCArIDEpIHsgcmV0dXJuIDE2OyB9IC8vIHRvcCBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDQgKyAyKSB7IHJldHVybiAxMDsgfSAvLyByaWdodCBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gNCArIDIgKyAxKSB7IHJldHVybiAxNzsgfSAvLyB0b3AgcmlnaHQgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgMiArIDEpIHsgcmV0dXJuIDE0OyB9IC8vIHRvcCByaWdodCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgOCkgeyByZXR1cm4gMTI7IH0gLy8gdG9wIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQgKyA4KSB7IHJldHVybiA4OyB9IC8vIGJvdHRvbSBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAyICsgNCkgeyByZXR1cm4gOTsgfSAvLyByaWdodCBib3R0b21cclxuICAgICAgICBpZiAoY3V0ID09IDEgKyAyKSB7IHJldHVybiAxMzsgfSAvLyB0b3AgcmlnaHRcclxuICAgICAgICBpZiAoY3V0ID09IDEgKyA0KSB7IHJldHVybiAxNTsgfSAvLyB0b3AgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAyICsgOCkgeyByZXR1cm4gNjsgfSAvLyByaWdodCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA4KSB7IHJldHVybiA0OyB9IC8vIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQpIHsgcmV0dXJuIDc7IH0gLy8gYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAyKSB7IHJldHVybiA1OyB9IC8vIHJpZ2h0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxKSB7IHJldHVybiAxMTsgfSAvLyB0b3BcclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgTGluZVBhcnQge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgbGVuZ3RoOiBudW1iZXI7XHJcbn1cclxuaW50ZXJmYWNlIEVudGl0eU1vdmUge1xyXG4gICAgZW50aXR5OiBFbnRpdHk7XHJcbiAgICB0YXJnZXQ6IFBvcztcclxuICAgIGxpbmU6IExpbmVQYXJ0W107XHJcbiAgICBwcm9ncmVzczogbnVtYmVyO1xyXG59XHJcbmludGVyZmFjZSBFbnRpdHlBdHRhY2sge1xyXG4gICAgYXR0YWNrZXI6IEVudGl0eTtcclxuICAgIHRhcmdldDogRW50aXR5O1xyXG4gICAgYW5pbV9pZDogbnVtYmVyO1xyXG4gICAgYWNjOiBudW1iZXI7XHJcbiAgICBwcm9ncmVzczogbnVtYmVyO1xyXG4gICAgZmlyc3Q6IGJvb2xlYW47XHJcbiAgICBzcHJpdGU6IFBoYXNlci5JbWFnZTtcclxufVxyXG5pbnRlcmZhY2UgRW50aXR5TWFuYWdlckRlbGVnYXRlIHtcclxuICAgIGVudGl0eURpZE1vdmUoZW50aXR5OiBFbnRpdHkpOiB2b2lkO1xyXG4gICAgZW50aXR5RGlkQXR0YWNrKGVudGl0eTogRW50aXR5KTogdm9pZDtcclxufVxyXG5cclxuY2xhc3MgRW50aXR5TWFuYWdlciB7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdGllczogRW50aXR5W107XHJcbiAgICBwcml2YXRlIG1hcDogTWFwO1xyXG5cclxuICAgIHByaXZhdGUgbW92aW5nOiBFbnRpdHlNb3ZlO1xyXG5cclxuICAgIHByaXZhdGUgYW5pbV9pZGxlX2NvdW50ZXI6IG51bWJlcjtcclxuICAgIHByaXZhdGUgYW5pbV9pZGxlX3N0YXRlOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgc2VsZWN0aW9uX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGludGVyYWN0aW9uX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25fZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgaW50ZXJhY3Rpb25fZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuXHJcbiAgICBwcml2YXRlIGVudGl0eV9yYW5nZTogRW50aXR5UmFuZ2U7XHJcblxyXG4gICAgcHJpdmF0ZSBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlO1xyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0aW9uX3RhcmdldHNfeDogRW50aXR5W107XHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl90YXJnZXRzX3k6IEVudGl0eVtdO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25faW5kZXhfeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25faW5kZXhfeTogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgYXR0YWNrZWQ6IEVudGl0eUF0dGFjaztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgZW50aXR5X2dyb3VwOiBQaGFzZXIuR3JvdXAsIHNlbGVjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwLCBpbnRlcmFjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlKSB7XHJcblxyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwID0gZW50aXR5X2dyb3VwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyb3VwID0gc2VsZWN0aW9uX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAgPSBpbnRlcmFjdGlvbl9ncm91cDtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzID0gc2VsZWN0aW9uX2dyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHNlbGVjdGlvbl9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyA9IGludGVyYWN0aW9uX2dyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIGludGVyYWN0aW9uX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1faWRsZV9jb3VudGVyID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1faWRsZV9zdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgbWFwLmdldFN0YXJ0RW50aXRpZXMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUVudGl0eShlbnRpdHkudHlwZSwgZW50aXR5LmFsbGlhbmNlLCBlbnRpdHkucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UgPSBuZXcgRW50aXR5UmFuZ2UodGhpcy5tYXAsIHRoaXMsIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVFbnRpdHkodHlwZTogRW50aXR5VHlwZSwgYWxsaWFuY2U6IEFsbGlhbmNlLCBwb3NpdGlvbjogUG9zKTogRW50aXR5IHtcclxuICAgICAgICBsZXQgZW50aXR5ID0gbmV3IEVudGl0eSh0eXBlLCBhbGxpYW5jZSwgcG9zaXRpb24sIHRoaXMuZW50aXR5X2dyb3VwKTtcclxuICAgICAgICB0aGlzLmVudGl0aWVzLnB1c2goZW50aXR5KTtcclxuICAgICAgICByZXR1cm4gZW50aXR5O1xyXG4gICAgfVxyXG4gICAgcmVtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgZW50aXR5LmRlc3Ryb3koKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eSA9PSB0aGlzLmVudGl0aWVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEVudGl0eUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRLaW5nUG9zaXRpb24oYWxsaWFuY2U6IEFsbGlhbmNlKTogUG9zIHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlICYmIGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuS2luZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3MoMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRUdXJuKGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmVudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnN0YXRlID09IEVudGl0eVN0YXRlLkRlYWQpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5kZWF0aF9jb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVudGl0eS5kZWF0aF9jb3VudCA+PSBBbmNpZW50RW1waXJlcy5ERUFUSF9DT1VOVCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zdGF0ZSA9IEVudGl0eVN0YXRlLk1vdmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzaG93ID0gKGVudGl0eS5hbGxpYW5jZSA9PSBhbGxpYW5jZSk7XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGVTdGF0ZShlbnRpdHkuc3RhdGUsIHNob3cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyBtb3ZlIHNlbGVjdGVkIGVudGl0eSBpbiBhIGhpZ2hlciBncm91cFxyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwLnJlbW92ZShlbnRpdHkuc3ByaXRlKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5yZW1vdmUoZW50aXR5Lmljb25faGVhbHRoKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLmFkZChlbnRpdHkuc3ByaXRlKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLmFkZChlbnRpdHkuaWNvbl9oZWFsdGgpO1xyXG4gICAgfVxyXG4gICAgZGVzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyBtb3ZlIHNlbGVjdGVkIGVudGl0eSBiYWNrIHRvIGFsbCBvdGhlciBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAucmVtb3ZlKGVudGl0eS5zcHJpdGUpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAucmVtb3ZlKGVudGl0eS5pY29uX2hlYWx0aCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAuYWRkQXQoZW50aXR5Lmljb25faGVhbHRoLCAwKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5hZGRBdChlbnRpdHkuc3ByaXRlLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRFbnRpdHlPcHRpb25zKGVudGl0eTogRW50aXR5LCBtb3ZlZDogYm9vbGVhbiA9IGZhbHNlKTogQWN0aW9uW10ge1xyXG5cclxuICAgICAgICBpZiAoZW50aXR5LnN0YXRlICE9IEVudGl0eVN0YXRlLlJlYWR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvcHRpb25zOiBBY3Rpb25bXSA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoIW1vdmVkICYmIGVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbkJ1eSkgJiYgdGhpcy5tYXAuZ2V0VGlsZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5CVVkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW50QXR0YWNrQWZ0ZXJNb3ZpbmcpIHx8ICFtb3ZlZCkge1xyXG4gICAgICAgICAgICBsZXQgYXR0YWNrX3RhcmdldHMgPSB0aGlzLmdldEF0dGFja1RhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgaWYgKGF0dGFja190YXJnZXRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uQVRUQUNLKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhblJhaXNlKSkge1xyXG4gICAgICAgICAgICBsZXQgcmFpc2VfdGFyZ2V0cyA9IHRoaXMuZ2V0UmFpc2VUYXJnZXRzKGVudGl0eSk7XHJcbiAgICAgICAgICAgIGlmIChyYWlzZV90YXJnZXRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uUkFJU0UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tYXAuZ2V0QWxsaWFuY2VBdChlbnRpdHkucG9zaXRpb24pICE9IGVudGl0eS5hbGxpYW5jZSAmJiAoKGVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbk9jY3VweUhvdXNlKSAmJiB0aGlzLm1hcC5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkhvdXNlKSB8fCAoZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuT2NjdXB5Q2FzdGxlKSAmJiB0aGlzLm1hcC5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkNhc3RsZSkpKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uT0NDVVBZKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChtb3ZlZCkge1xyXG4gICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLkVORF9NT1ZFKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLk1PVkUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MsIGFuaW1fc3RhdGU6IG51bWJlcikge1xyXG5cclxuICAgICAgICBpZiAoYW5pbV9zdGF0ZSAhPSB0aGlzLmFuaW1faWRsZV9zdGF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1faWRsZV9zdGF0ZSA9IGFuaW1fc3RhdGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc2V0RnJhbWUodGhpcy5hbmltX2lkbGVfc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9yYW5nZS51cGRhdGUoc3RlcHMsIGN1cnNvcl9wb3NpdGlvbiwgYW5pbV9zdGF0ZSwgdGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MsIHRoaXMuaW50ZXJhY3Rpb25fZ3JhcGhpY3MpO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0ZU1vdmluZ0VudGl0eShzdGVwcyk7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlQXR0YWNrZWRFbnRpdHkoc3RlcHMpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG5cclxuICAgICAgICAtLS0tLSBSQU5HRVxyXG5cclxuICAgICAqL1xyXG5cclxuICAgIHNob3dSYW5nZSh0eXBlOiBFbnRpdHlSYW5nZVR5cGUsIGVudGl0eTogRW50aXR5KSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09IEVudGl0eVJhbmdlVHlwZS5BdHRhY2sgfHwgdHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuUmFpc2UpIHtcclxuICAgICAgICAgICAgbGV0IHRhcmdldHNfeDogRW50aXR5W107XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXRzX3k6IEVudGl0eVtdO1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzX3ggPSB0aGlzLmdldEF0dGFja1RhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLlJhaXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzX3ggPSB0aGlzLmdldFJhaXNlVGFyZ2V0cyhlbnRpdHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0YXJnZXRzX3kgPSB0YXJnZXRzX3guc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgIHRhcmdldHNfeC5zb3J0KChhOiBFbnRpdHksIGI6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueCA9PSBiLnBvc2l0aW9uLngpIHsgcmV0dXJuIGEucG9zaXRpb24ueSAtIGIucG9zaXRpb24ueTsgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRhcmdldHNfeS5zb3J0KChhOiBFbnRpdHksIGI6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueSA9PSBiLnBvc2l0aW9uLnkpIHsgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDsgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueSAtIGIucG9zaXRpb24ueTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeCA9IHRhcmdldHNfeDtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c195ID0gdGFyZ2V0c195O1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2luZGV4X3kgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UuY3JlYXRlUmFuZ2UodHlwZSwgZW50aXR5LCB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcyk7XHJcbiAgICB9XHJcblxyXG4gICAgaGlkZVJhbmdlKCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c195ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVudGl0eV9yYW5nZS5jbGVhcih0aGlzLnNlbGVjdGlvbl9ncmFwaGljcywgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyk7XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFRhcmdldEluUmFuZ2UoZGlyZWN0aW9uOiBEaXJlY3Rpb24pOiBFbnRpdHkge1xyXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c194IHx8ICF0aGlzLnNlbGVjdGlvbl90YXJnZXRzX3kpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcG9zID0gbmV3IFBvcygwLCAwKS5tb3ZlKGRpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIGlmIChwb3MueCAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2luZGV4X3ggKz0gcG9zLng7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbl9pbmRleF94IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeCA9IHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeC5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2VsZWN0aW9uX2luZGV4X3ggPj0gdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c194Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeFt0aGlzLnNlbGVjdGlvbl9pbmRleF94XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeSArPSBwb3MueTtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb25faW5kZXhfeSA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3Rpb25faW5kZXhfeSA9IHRoaXMuc2VsZWN0aW9uX3RhcmdldHNfeS5sZW5ndGggLSAxO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5zZWxlY3Rpb25faW5kZXhfeSA+PSB0aGlzLnNlbGVjdGlvbl90YXJnZXRzX3kubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0aW9uX2luZGV4X3kgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb25fdGFyZ2V0c195W3RoaXMuc2VsZWN0aW9uX2luZGV4X3ldO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBnZXRBdHRhY2tUYXJnZXRzKGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgbGV0IHRhcmdldHM6IEVudGl0eVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW5lbXkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW5lbXkuYWxsaWFuY2UgPT0gZW50aXR5LmFsbGlhbmNlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGVudGl0eS5nZXREaXN0YW5jZVRvRW50aXR5KGVuZW15KTtcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gZW50aXR5LmRhdGEubWF4KSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IGVudGl0eS5kYXRhLm1pbikgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKGVuZW15KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldHM7XHJcbiAgICB9XHJcbiAgICBnZXRSYWlzZVRhcmdldHMoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICBsZXQgdGFyZ2V0czogRW50aXR5W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBkZWFkIG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKCFkZWFkLmlzRGVhZCgpKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGVudGl0eS5nZXREaXN0YW5jZVRvRW50aXR5KGRlYWQpO1xyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgIT0gMSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICB0YXJnZXRzLnB1c2goZGVhZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0YXJnZXRzO1xyXG4gICAgfVxyXG4gICAgYXR0YWNrRW50aXR5KGF0dGFja2VyOiBFbnRpdHksIHRhcmdldDogRW50aXR5LCBmaXJzdDogYm9vbGVhbiA9IHRydWUpIHtcclxuICAgICAgICBsZXQgcG9zaXRpb24gPSB0YXJnZXQucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBhdHRhY2tlci5hdHRhY2sodGFyZ2V0LCB0aGlzLm1hcCk7XHJcbiAgICAgICAgdGhpcy5hdHRhY2tlZCA9IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXHJcbiAgICAgICAgICAgIGF0dGFja2VyOiBhdHRhY2tlcixcclxuICAgICAgICAgICAgYW5pbV9pZDogMCxcclxuICAgICAgICAgICAgcHJvZ3Jlc3M6IDAsXHJcbiAgICAgICAgICAgIGFjYzogMCxcclxuICAgICAgICAgICAgZmlyc3Q6IGZpcnN0LFxyXG4gICAgICAgICAgICBzcHJpdGU6IHRoaXMuZW50aXR5X2dyb3VwLmdhbWUuYWRkLnNwcml0ZShwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBcInJlZHNwYXJrXCIsIDAsIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXApXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHNob3VsZENvdW50ZXIoYXR0YWNrZXI6IEVudGl0eSwgdGFyZ2V0OiBFbnRpdHkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoYXR0YWNrZXIuaGVhbHRoID4gMCAmJiBhdHRhY2tlci5nZXREaXN0YW5jZVRvRW50aXR5KHRhcmdldCkgPCAyICYmIGF0dGFja2VyLmRhdGEubWluIDwgMikge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcblxyXG4gICAgICAgIC0tLS0tIE1PVkUgRU5USVRZXHJcblxyXG4gICAgICovXHJcblxyXG4gICAgbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSwgdGFyZ2V0OiBQb3MsIGFuaW1hdGU6IGJvb2xlYW4gPSB0cnVlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIGVudGl0eS5wb3NpdGlvbiA9IHRhcmdldDtcclxuICAgICAgICAgICAgZW50aXR5LnNldFdvcmxkUG9zaXRpb24odGFyZ2V0LmdldFdvcmxkUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISF0aGlzLmdldEVudGl0eUF0KHRhcmdldCkpIHtcclxuICAgICAgICAgICAgLy8gQ2FudCBtb3ZlIHdoZXJlIGFub3RoZXIgdW5pdCBpc1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB3YXlwb2ludCA9IHRoaXMuZW50aXR5X3JhbmdlLmdldFdheXBvaW50QXQodGFyZ2V0KTtcclxuICAgICAgICBpZiAoIXdheXBvaW50KSB7XHJcbiAgICAgICAgICAgIC8vIHRhcmdldCBub3QgaW4gcmFuZ2VcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbGluZSA9IEVudGl0eVJhbmdlLmdldExpbmVUb1dheXBvaW50KHdheXBvaW50KTtcclxuICAgICAgICB0aGlzLm1vdmluZyA9IHtcclxuICAgICAgICAgICAgZW50aXR5OiBlbnRpdHksXHJcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxyXG4gICAgICAgICAgICBsaW5lOiBsaW5lLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5oaWRlUmFuZ2UoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFuaW1hdGVNb3ZpbmdFbnRpdHkoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5tb3ZpbmcpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIGxldCBtb3ZlID0gdGhpcy5tb3Zpbmc7XHJcbiAgICAgICAgbGV0IGVudGl0eSA9IG1vdmUuZW50aXR5O1xyXG5cclxuICAgICAgICBtb3ZlLnByb2dyZXNzICs9IHN0ZXBzO1xyXG5cclxuICAgICAgICAvLyBmaXJzdCBjaGVjayBpcyBzbyB3ZSBjYW4gc3RheSBhdCB0aGUgc2FtZSBwbGFjZVxyXG4gICAgICAgIGlmIChtb3ZlLmxpbmUubGVuZ3RoID4gMCAmJiBtb3ZlLnByb2dyZXNzID49IG1vdmUubGluZVswXS5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpIHtcclxuICAgICAgICAgICAgbW92ZS5wcm9ncmVzcyAtPSBtb3ZlLmxpbmVbMF0ubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgICAgICBtb3ZlLmxpbmUuc2hpZnQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG1vdmUubGluZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBkaWZmID0gbmV3IFBvcygwLCAwKS5tb3ZlKG1vdmUubGluZVswXS5kaXJlY3Rpb24pO1xyXG4gICAgICAgICAgICBlbnRpdHkud29ybGRfcG9zaXRpb24ueCA9IG1vdmUubGluZVswXS5wb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi54ICogbW92ZS5wcm9ncmVzcztcclxuICAgICAgICAgICAgZW50aXR5LndvcmxkX3Bvc2l0aW9uLnkgPSBtb3ZlLmxpbmVbMF0ucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSArIGRpZmYueSAqIG1vdmUucHJvZ3Jlc3M7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZW50aXR5LnBvc2l0aW9uID0gbW92ZS50YXJnZXQ7XHJcbiAgICAgICAgICAgIGVudGl0eS53b3JsZF9wb3NpdGlvbiA9IG1vdmUudGFyZ2V0LmdldFdvcmxkUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZpbmcgPSBudWxsO1xyXG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmVudGl0eURpZE1vdmUoZW50aXR5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZW50aXR5LnVwZGF0ZShzdGVwcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltYXRlQXR0YWNrZWRFbnRpdHkoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5hdHRhY2tlZCkgeyByZXR1cm47IH1cclxuICAgICAgICBsZXQgYXR0YWNrZWQgPSB0aGlzLmF0dGFja2VkO1xyXG5cclxuICAgICAgICBhdHRhY2tlZC5hY2MrKztcclxuICAgICAgICBpZiAoYXR0YWNrZWQuYWNjID49IDUpIHtcclxuICAgICAgICAgICAgYXR0YWNrZWQuYWNjIC09IDU7XHJcblxyXG4gICAgICAgICAgICBsZXQgbWlkZGxlID0gdGhpcy5hdHRhY2tlZC50YXJnZXQucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICAgICAgaWYgKGF0dGFja2VkLnByb2dyZXNzID49IDMwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZWQuYW5pbV9pZCA8IDUpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlZC5hbmltX2lkID0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNrZWQuc3ByaXRlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFja2VkID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmVudGl0eURpZEF0dGFjayhhdHRhY2tlZC5hdHRhY2tlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChhdHRhY2tlZC5wcm9ncmVzcyA+PSAyMikge1xyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VkLmFuaW1faWQgPCA0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNrZWQuYW5pbV9pZCA9IDQ7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFja2VkLnNwcml0ZS5sb2FkVGV4dHVyZShcInNtb2tlXCIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJlcGxhY2Ugd2l0aCB0b21iIGdyYXBoaWNcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlZC50YXJnZXQudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuRGVhZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgYXR0YWNrZWQuc3ByaXRlLnkgPSBtaWRkbGUueSAtIChhdHRhY2tlZC5wcm9ncmVzcyAtIDIyKSAqIDM7IC8vIDAsIDMsIDZcclxuICAgICAgICAgICAgICAgIGF0dGFja2VkLnNwcml0ZS5mcmFtZSA9IE1hdGguZmxvb3IoKGF0dGFja2VkLnByb2dyZXNzIC0gMjIpIC8gMik7XHJcblxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAoYXR0YWNrZWQucHJvZ3Jlc3MgPj0gMTYpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2tlZC5hbmltX2lkIDwgMykge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFja2VkLmFuaW1faWQgPSAzO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlZC5zcHJpdGUubG9hZFRleHR1cmUoXCJzcGFya1wiLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlZC5zcHJpdGUudmlzaWJsZSA9IHRydWU7IC8vIHNob3cgc3ByaXRlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBhdHRhY2tlZC5zcHJpdGUuZnJhbWUgPSBhdHRhY2tlZC5wcm9ncmVzcyAtIDE2O1xyXG5cclxuICAgICAgICAgICAgfWVsc2UgaWYgKGF0dGFja2VkLnByb2dyZXNzID49IDgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2tlZC5hbmltX2lkIDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFja2VkLmFuaW1faWQgPSAyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyByZXNldCBwb3NpdGlvblxyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFja2VkLnRhcmdldC5zZXRXb3JsZFBvc2l0aW9uKGF0dGFja2VkLnRhcmdldC5wb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXR0YWNrZWQudGFyZ2V0LmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dGFja2VkLnNwcml0ZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNrZWQgPSBudWxsOyAvLyBzdG9wIGFuaW1hdGlvbiBpZiBub3QgZGVhZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZWQuZmlyc3QpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzaG91bGRfY291bnRlciA9IHRoaXMuc2hvdWxkQ291bnRlcihhdHRhY2tlZC50YXJnZXQsIGF0dGFja2VkLmF0dGFja2VyKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzaG91bGRfY291bnRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNrRW50aXR5KGF0dGFja2VkLnRhcmdldCwgYXR0YWNrZWQuYXR0YWNrZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5lbnRpdHlEaWRBdHRhY2soYXR0YWNrZWQuZmlyc3QgPyBhdHRhY2tlZC5hdHRhY2tlciA6IGF0dGFja2VkLnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gd2FpdCAtIGRvIG5vdGhpbmdcclxuXHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChhdHRhY2tlZC5wcm9ncmVzcyA+PSA2KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZWQuYW5pbV9pZCA8IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlZC5hbmltX2lkID0gMTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaGlkZSBzcHJpdGVcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlZC5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYXR0YWNrZWQudGFyZ2V0LnNldFdvcmxkUG9zaXRpb24oe3g6IG1pZGRsZS54ICsgMiAtIGF0dGFja2VkLnByb2dyZXNzICUgMiAqIDQsIHk6IG1pZGRsZS55fSk7IC8vIDcgLSAycHggbGVmdCwgOCAtIDJweCByaWdodFxyXG5cclxuICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gQW5pbWF0ZSBzcGFyayBvdmVyIHRhcmdldCAmIHNoYWtlIHRhcmdldFxyXG4gICAgICAgICAgICAgICAgYXR0YWNrZWQuc3ByaXRlLmZyYW1lID0gYXR0YWNrZWQucHJvZ3Jlc3MgJSAzO1xyXG4gICAgICAgICAgICAgICAgYXR0YWNrZWQudGFyZ2V0LnNldFdvcmxkUG9zaXRpb24oe3g6IG1pZGRsZS54ICsgMiAtIGF0dGFja2VkLnByb2dyZXNzICUgMiAqIDQsIHk6IG1pZGRsZS55fSk7IC8vIDAgLSAycHggcmlnaHQsIDEgLSAycHggbGVmdCwgMiAtIDJweCByaWdodFxyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhdHRhY2tlZC5wcm9ncmVzcysrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVdheXBvaW50IHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb3N0OiBudW1iZXI7XHJcbiAgICBmb3JtOiBudW1iZXI7XHJcbiAgICBwYXJlbnQ6IElXYXlwb2ludDtcclxufVxyXG5lbnVtIEVudGl0eVJhbmdlVHlwZSB7XHJcbiAgICBOb25lLFxyXG4gICAgTW92ZSxcclxuICAgIEF0dGFjayxcclxuICAgIFJhaXNlXHJcbn1cclxuY2xhc3MgRW50aXR5UmFuZ2Uge1xyXG5cclxuICAgIHdheXBvaW50czogSVdheXBvaW50W107XHJcbiAgICBtYXA6IE1hcDtcclxuICAgIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyO1xyXG5cclxuICAgIHR5cGU6IEVudGl0eVJhbmdlVHlwZTtcclxuXHJcbiAgICByYW5nZV9saWdodGVuOiBib29sZWFuO1xyXG4gICAgcmFuZ2VfcHJvZ3Jlc3M6IG51bWJlcjtcclxuXHJcbiAgICBsaW5lOiBMaW5lUGFydFtdO1xyXG4gICAgbGluZV9vZmZzZXQ6IG51bWJlcjtcclxuICAgIGxpbmVfZW5kX3Bvc2l0aW9uOiBQb3M7XHJcbiAgICBsaW5lX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4dHJhX2N1cnNvcjogU3ByaXRlO1xyXG5cclxuXHJcbiAgICBzdGF0aWMgZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uOiBQb3MsIHdheXBvaW50czogSVdheXBvaW50W10pIHtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB3YXlwb2ludHMpe1xyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7IHJldHVybiB3YXlwb2ludDsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRMaW5lVG9XYXlwb2ludCh3YXlwb2ludDogSVdheXBvaW50KTogTGluZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IGxpbmU6IExpbmVQYXJ0W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAod2F5cG9pbnQucGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSB3YXlwb2ludDtcclxuICAgICAgICAgICAgd2F5cG9pbnQgPSB3YXlwb2ludC5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gd2F5cG9pbnQucG9zaXRpb24uZ2V0RGlyZWN0aW9uVG8obmV4dC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDAgJiYgbGluZVswXS5kaXJlY3Rpb24gPT0gZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLnBvc2l0aW9uID0gd2F5cG9pbnQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLmxlbmd0aCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluZS51bnNoaWZ0KHtwb3NpdGlvbjogd2F5cG9pbnQucG9zaXRpb24sIGRpcmVjdGlvbjogZGlyZWN0aW9uLCBsZW5ndGg6IDF9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlciA9IGVudGl0eV9tYW5hZ2VyO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVJhbmdlVHlwZS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvciA9IG5ldyBTcHJpdGUoe3g6IDAsIHk6IDB9LCBncm91cCwgXCJjdXJzb3JcIiwgWzRdKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRXYXlwb2ludEF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICByZXR1cm4gRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCB0aGlzLndheXBvaW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gMTAwO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmVfZW5kX3Bvc2l0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxpbmVfc2xvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5saW5lX29mZnNldCA9IDA7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtwb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlVwKSwgY29zdDogMCwgZm9ybTogRGlyZWN0aW9uLkFsbCwgcGFyZW50OiBudWxsfSxcclxuICAgICAgICAgICAgICAgICAgICB7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5SaWdodCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uRG93biksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uTGVmdCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrOlxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW4gPSBlbnRpdHkuZGF0YS5taW47XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gZW50aXR5LmRhdGEubWF4O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gdGhpcy5jYWxjdWxhdGVXYXlwb2ludHMoZW50aXR5LCBtYXgsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgYWxsIHdheXBvaW50cyB0aGF0IGFyZSBuZWFyZXIgdGhhbiBtaW5pbXVtIHJhbmdlXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2F5cG9pbnQuY29zdCA8IG1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGb3JtKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2V0RnJhbWVzKFsyLCAzXSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRPZmZzZXQoLTEsIC0xKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNob3coKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5Nb3ZlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy53YXlwb2ludHMgPSB0aGlzLmNhbGN1bGF0ZVdheXBvaW50cyhlbnRpdHksIGVudGl0eS5nZXRNb3ZlbWVudCgpLCAhZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuRmx5KSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEZvcm0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZXMoWzRdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldE9mZnNldCgtMSwgLTQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRyYXcocmFuZ2VfZ3JhcGhpY3MpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MsIGFuaW1fc3RhdGU6IG51bWJlciwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgbGluZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmFuZ2VfbGlnaHRlbikge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yYW5nZV9wcm9ncmVzcyA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgLT0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJhbmdlX3Byb2dyZXNzIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gNDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZShhbmltX3N0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFjdXJzb3JfcG9zaXRpb24ubWF0Y2godGhpcy5saW5lX2VuZF9wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5saW5lX2VuZF9wb3NpdGlvbiA9IGN1cnNvcl9wb3NpdGlvbi5jb3B5KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZW5kcG9pbnQgPSB0aGlzLmdldFdheXBvaW50QXQoY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhZW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oY3Vyc29yX3Bvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmUgPSBFbnRpdHlSYW5nZS5nZXRMaW5lVG9XYXlwb2ludChlbmRwb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk1vdmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGluZV9zbG93ICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saW5lX3Nsb3cgPj0gNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saW5lX3Nsb3cgLT0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0IC09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lX29mZnNldCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HIC0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4ZmZmZmZmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcGFydCBvZiB0aGlzLmxpbmUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdTZWdtZW50KGxpbmVfZ3JhcGhpY3MsIHBhcnQsIHRoaXMubGluZV9vZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gKHRoaXMubGluZV9vZmZzZXQgKyBwYXJ0Lmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkgJSAoQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5lbmRGaWxsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgZ3JleSA9IHRoaXMucmFuZ2VfcHJvZ3Jlc3MgLyAxMDAgKiAweEZGIHwgMDtcclxuICAgICAgICByYW5nZV9ncmFwaGljcy50aW50ID0gKGdyZXkgPDwgMTYpIHwgKGdyZXkgPDwgOCkgfCBncmV5O1xyXG4gICAgfVxyXG5cclxuICAgIGNsZWFyKHJhbmdlX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIGxpbmVfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVJhbmdlVHlwZS5Ob25lO1xyXG4gICAgICAgIHRoaXMud2F5cG9pbnRzID0gW107XHJcbiAgICAgICAgdGhpcy5leHRyYV9jdXJzb3IuaGlkZSgpO1xyXG4gICAgICAgIHJhbmdlX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgbGluZV9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhdyhncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcblxyXG4gICAgICAgIGxldCBjb2xvcjogbnVtYmVyO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLk1vdmU6XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLlJhaXNlOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSAweGZmZmZmZjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5BdHRhY2s6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIGdyYXBoaWNzLmJlZ2luRmlsbChjb2xvcik7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2YgdGhpcy53YXlwb2ludHMpIHtcclxuICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gd2F5cG9pbnQucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNCwgcG9zaXRpb24ueSwgNCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCwgcG9zaXRpb24ueSArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgNCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIDQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2FsY3VsYXRlV2F5cG9pbnRzKGVudGl0eTogRW50aXR5LCBtYXhfY29zdDogbnVtYmVyLCB1c2VfdGVycmFpbjogYm9vbGVhbik6IElXYXlwb2ludFtdIHtcclxuICAgICAgICAvLyBjb3N0IGZvciBvcmlnaW4gcG9pbnQgaXMgYWx3YXlzIDFcclxuICAgICAgICBsZXQgb3BlbjogSVdheXBvaW50W10gPSBbe3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24sIGNvc3Q6ICh1c2VfdGVycmFpbiA/IDEgOiAwKSwgZm9ybTogMCwgcGFyZW50OiBudWxsfV07XHJcbiAgICAgICAgbGV0IGNsb3NlZDogSVdheXBvaW50W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAob3Blbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gb3Blbi5zaGlmdCgpO1xyXG4gICAgICAgICAgICBjbG9zZWQucHVzaChjdXJyZW50KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBhZGphY2VudF9wb3NpdGlvbnMgPSB0aGlzLm1hcC5nZXRBZGphY2VudFBvc2l0aW9uc0F0KGN1cnJlbnQucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwb3NpdGlvbiBvZiBhZGphY2VudF9wb3NpdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tQb3NpdGlvbihwb3NpdGlvbiwgY3VycmVudCwgb3BlbiwgY2xvc2VkLCBtYXhfY29zdCwgdXNlX3RlcnJhaW4sIGVudGl0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNsb3NlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrUG9zaXRpb24ocG9zaXRpb246IFBvcywgcGFyZW50OiBJV2F5cG9pbnQsIG9wZW46IElXYXlwb2ludFtdLCBjbG9zZWQ6IElXYXlwb2ludFtdLCBtYXhfY29zdDogbnVtYmVyLCB1c2VfdGVycmFpbjogYm9vbGVhbiwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgLy8gYWxyZWFkeSBpcyB0aGUgbG93ZXN0IHBvc3NpYmxlXHJcbiAgICAgICAgaWYgKCEhRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCBjbG9zZWQpKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBpZiAodXNlX3RlcnJhaW4pIHtcclxuICAgICAgICAgICAgbGV0IGlzX29jY3VwaWVkID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmICghIWlzX29jY3VwaWVkICYmIGlzX29jY3VwaWVkLmFsbGlhbmNlICE9IGVudGl0eS5hbGxpYW5jZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0aWxlX2Nvc3QgPSAxO1xyXG4gICAgICAgIGlmICh1c2VfdGVycmFpbikge1xyXG4gICAgICAgICAgICB0aWxlX2Nvc3QgPSB0aGlzLm1hcC5nZXRDb3N0QXQocG9zaXRpb24sIGVudGl0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgbmV3X2Nvc3QgPSBwYXJlbnQuY29zdCArIHRpbGVfY29zdDtcclxuICAgICAgICBpZiAobmV3X2Nvc3QgPiBtYXhfY29zdCkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICAgICAgbGV0IGluX29wZW4gPSBFbnRpdHlSYW5nZS5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIG9wZW4pO1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIGluIG9wZW4gc3RhY2sgYW5kIHdlIGFyZSBsb3dlclxyXG4gICAgICAgIGlmICghIWluX29wZW4pIHtcclxuICAgICAgICAgICAgaWYgKGluX29wZW4uY29zdCA8PSBuZXdfY29zdCkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICAgICAgaW5fb3Blbi5jb3N0ID0gbmV3X2Nvc3Q7XHJcbiAgICAgICAgICAgIGluX29wZW4ucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3Blbi5wdXNoKHtwb3NpdGlvbjogcG9zaXRpb24sIHBhcmVudDogcGFyZW50LCBmb3JtOiAwLCBjb3N0OiBuZXdfY29zdH0pO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhZGRGb3JtKCkge1xyXG4gICAgICAgIGZvciAobGV0IHdheXBvaW50IG9mIHRoaXMud2F5cG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHdheXBvaW50LmZvcm0gPSAwO1xyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueSA+IDAgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5VcCkpKSB7IHdheXBvaW50LmZvcm0gKz0gMTsgfVxyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueCA8IHRoaXMubWFwLndpZHRoIC0gMSAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlJpZ2h0KSkpIHsgd2F5cG9pbnQuZm9ybSArPSAyOyB9XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi55IDwgdGhpcy5tYXAuaGVpZ2h0IC0gMSAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkRvd24pKSkgeyB3YXlwb2ludC5mb3JtICs9IDQ7IH1cclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnggPiAwICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uTGVmdCkpKSB7IHdheXBvaW50LmZvcm0gKz0gODsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd1NlZ21lbnQoZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgcGFydDogTGluZVBhcnQsIG9mZnNldDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRpc3RhbmNlID0gcGFydC5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgbGV0IHggPSAocGFydC5wb3NpdGlvbi54ICsgMC41KSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeSA9IChwYXJ0LnBvc2l0aW9uLnkgKyAwLjUpICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG5cclxuICAgICAgICB3aGlsZSAoZGlzdGFuY2UgPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBsZW5ndGggPSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfTEVOR1RIO1xyXG4gICAgICAgICAgICBpZiAob2Zmc2V0ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoIC09IG9mZnNldDtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGggPSBkaXN0YW5jZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChwYXJ0LmRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIHkgLSBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCwgbGVuZ3RoKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHkgLT0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyBncmFwaGljcy5kcmF3UmVjdCh4LCB5IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeCArPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIHksIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCwgbGVuZ3RoKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHkgKz0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHggLSBsZW5ndGgsIHkgLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB4IC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGRpc3RhbmNlIC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBTbW9rZU1hbmFnZXIge1xyXG4gICAgc21va2U6IFNtb2tlW107XHJcbiAgICBtYXA6IE1hcDtcclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblxyXG4gICAgYW5pbV9zbG93OiBudW1iZXI7XHJcbiAgICBhbmltX3N0YXRlOiBudW1iZXI7XHJcbiAgICBhbmltX29mZnNldDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogTWFwLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fc2xvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1fb2Zmc2V0ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5zbW9rZSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGhvdXNlIG9mIG1hcC5nZXRPY2N1cGllZEhvdXNlcygpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU21va2UoaG91c2UucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNyZWF0ZVNtb2tlKG5ldyBQb3MoMywgMTMpKTtcclxuICAgIH1cclxuICAgIGNyZWF0ZVNtb2tlKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLnNtb2tlLnB1c2gobmV3IFNtb2tlKHBvc2l0aW9uLCB0aGlzLmdyb3VwLCBcImJfc21va2VcIiwgWzAsIDEsIDIsIDNdKSk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fc2xvdyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5hbmltX3Nsb3cgPCA1KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fb2Zmc2V0Kys7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAyNykge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAyMiAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMykge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSA0O1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAxNyAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMikge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDEyICYmIHRoaXMuYW5pbV9zdGF0ZSA9PSAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDI7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gNyAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgc21va2Ugb2YgdGhpcy5zbW9rZSkge1xyXG4gICAgICAgICAgICBzbW9rZS5zZXRGcmFtZSh0aGlzLmFuaW1fc3RhdGUpO1xyXG4gICAgICAgICAgICBzbW9rZS53b3JsZF9wb3NpdGlvbi55ID0gc21va2UucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIHRoaXMuYW5pbV9vZmZzZXQgLSAyO1xyXG4gICAgICAgICAgICBzbW9rZS51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcbiIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgd29ybGRfcG9zaXRpb246IElQb3M7XHJcbiAgICBzcHJpdGU6IFBoYXNlci5TcHJpdGU7XHJcbiAgICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGZyYW1lczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIG9mZnNldF94OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG9mZnNldF95OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGZyYW1lOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iod29ybGRfcG9zaXRpb246IElQb3MsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG5hbWU6IHN0cmluZywgZnJhbWVzOiBudW1iZXJbXSA9IFtdKSB7XHJcblxyXG4gICAgICAgIHRoaXMud29ybGRfcG9zaXRpb24gPSB3b3JsZF9wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5vZmZzZXRfeCA9IDA7XHJcbiAgICAgICAgdGhpcy5vZmZzZXRfeSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBmcmFtZXM7XHJcblxyXG4gICAgICAgIHRoaXMuc3ByaXRlID0gZ3JvdXAuZ2FtZS5hZGQuc3ByaXRlKHRoaXMud29ybGRfcG9zaXRpb24ueCwgdGhpcy53b3JsZF9wb3NpdGlvbi55LCB0aGlzLm5hbWUpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbMF07XHJcbiAgICAgICAgZ3JvdXAuYWRkKHRoaXMuc3ByaXRlKTtcclxuXHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZXMoZnJhbWVzOiBudW1iZXJbXSwgZnJhbWU6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcclxuICAgICAgICB0aGlzLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lICUgdGhpcy5mcmFtZXMubGVuZ3RoXTtcclxuICAgIH1cclxuICAgIHNldE9mZnNldCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSB4O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSB5O1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZShmcmFtZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWUpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5mcmFtZSAlIHRoaXMuZnJhbWVzLmxlbmd0aF07XHJcbiAgICB9XHJcbiAgICBzZXRXb3JsZFBvc2l0aW9uKHdvcmxkX3Bvc2l0aW9uOiBJUG9zKSB7XHJcbiAgICAgICAgdGhpcy53b3JsZF9wb3NpdGlvbiA9IHdvcmxkX3Bvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy53b3JsZF9wb3NpdGlvbi54ICsgdGhpcy5vZmZzZXRfeDtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy53b3JsZF9wb3NpdGlvbi55ICsgdGhpcy5vZmZzZXRfeTtcclxuICAgIH1cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFNtb2tlIGV4dGVuZHMgU3ByaXRlIHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9zLCBncm91cDogUGhhc2VyLkdyb3VwLCBuYW1lOiBzdHJpbmcsIGZyYW1lczogbnVtYmVyW10pIHtcclxuICAgICAgICBzdXBlcihuZXcgUG9zKHBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgKyAxNiwgcG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSksIGdyb3VwLCBuYW1lLCBmcmFtZXMpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgRW50aXR5RGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBtb3Y6IG51bWJlcjtcclxuICAgIGF0azogbnVtYmVyO1xyXG4gICAgZGVmOiBudW1iZXI7XHJcbiAgICBtYXg6IG51bWJlcjtcclxuICAgIG1pbjogbnVtYmVyO1xyXG4gICAgY29zdDogbnVtYmVyO1xyXG4gICAgYmF0dGxlX3Bvc2l0aW9uczogSVBvc1tdO1xyXG4gICAgZmxhZ3M6IEVudGl0eUZsYWdzO1xyXG59XHJcbmVudW0gRW50aXR5RmxhZ3Mge1xyXG4gICAgTm9uZSA9IDAsIC8vIEdvbGVtLCBTa2VsZXRvblxyXG4gICAgQ2FuRmx5ID0gMSxcclxuICAgIFdhdGVyQm9vc3QgPSAyLFxyXG4gICAgQ2FuQnV5ID0gNCxcclxuICAgIENhbk9jY3VweUhvdXNlID0gOCxcclxuICAgIENhbk9jY3VweUNhc3RsZSA9IDE2LFxyXG4gICAgQ2FuUmFpc2UgPSAzMixcclxuICAgIEFudGlGbHlpbmcgPSA2NCxcclxuICAgIENhblBvaXNvbiA9IDEyOCxcclxuICAgIENhbldpc3AgPSAyNTYsXHJcbiAgICBDYW50QXR0YWNrQWZ0ZXJNb3ZpbmcgPSA1MTJcclxufVxyXG5pbnRlcmZhY2UgSUVudGl0eSB7XHJcbiAgICB0eXBlOiBFbnRpdHlUeXBlO1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG4gICAgcG9zaXRpb246IFBvcztcclxufVxyXG5lbnVtIEVudGl0eVR5cGUge1xyXG4gICAgU29sZGllcixcclxuICAgIEFyY2hlcixcclxuICAgIExpemFyZCxcclxuICAgIFdpemFyZCxcclxuICAgIFdpc3AsXHJcbiAgICBTcGlkZXIsXHJcbiAgICBHb2xlbSxcclxuICAgIENhdGFwdWx0LFxyXG4gICAgV3l2ZXJuLFxyXG4gICAgS2luZyxcclxuICAgIFNrZWxldG9uXHJcbn1cclxuZW51bSBFbnRpdHlTdGF0dXMge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBQb2lzb25lZCA9IDEgPDwgMCxcclxuICAgIFdpc3BlZCA9IDEgPDwgMVxyXG59XHJcbmVudW0gRW50aXR5U3RhdGUge1xyXG4gICAgUmVhZHkgPSAwLFxyXG4gICAgTW92ZWQgPSAxLFxyXG4gICAgRGVhZCA9IDJcclxufVxyXG5cclxuY2xhc3MgRW50aXR5IGV4dGVuZHMgU3ByaXRlIHtcclxuXHJcbiAgICB0eXBlOiBFbnRpdHlUeXBlO1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGRhdGE6IEVudGl0eURhdGE7XHJcblxyXG4gICAgaWNvbl9oZWFsdGg6IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBoZWFsdGg6IG51bWJlcjtcclxuICAgIHJhbms6IG51bWJlcjtcclxuICAgIGVwOiBudW1iZXI7XHJcblxyXG4gICAgZGVhdGhfY291bnQ6IG51bWJlcjtcclxuXHJcbiAgICBzdGF0dXM6IEVudGl0eVN0YXR1cztcclxuICAgIHN0YXRlOiBFbnRpdHlTdGF0ZTtcclxuXHJcbiAgICBhdGtfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBkZWZfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBtb3ZfYm9vc3Q6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBpY29uX21vdmVkOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IodHlwZTogRW50aXR5VHlwZSwgYWxsaWFuY2U6IEFsbGlhbmNlLCBwb3NpdGlvbjogUG9zLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIocG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpLCBncm91cCwgXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSwgW3R5cGUsIHR5cGUgKyBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5sZW5ndGhdKTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbdHlwZV07XHJcbiAgICAgICAgdGhpcy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG5cclxuICAgICAgICB0aGlzLmRlYXRoX2NvdW50ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSAxMDtcclxuICAgICAgICB0aGlzLnJhbmsgPSAwO1xyXG4gICAgICAgIHRoaXMuZXAgPSAwO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gMDtcclxuICAgICAgICB0aGlzLnN0YXRlID0gRW50aXR5U3RhdGUuUmVhZHk7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZCA9IGdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDAsIFwiY2hhcnNcIiwgNCwgZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGggPSBncm91cC5nYW1lLmFkZC5pbWFnZSgwLCAwLCBcImNoYXJzXCIsIDAsIGdyb3VwKTtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlzRGVhZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWFsdGggPT0gMDtcclxuICAgIH1cclxuICAgIGhhc0ZsYWcoZmxhZzogRW50aXR5RmxhZ3MpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YS5mbGFncyAmIGZsYWcpICE9IDA7XHJcbiAgICB9XHJcbiAgICBnZXREaXN0YW5jZVRvRW50aXR5KGVudGl0eTogRW50aXR5KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoZW50aXR5LnBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngpICsgTWF0aC5hYnMoZW50aXR5LnBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgfVxyXG4gICAgZGlkUmFua1VwKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLnJhbmsgPCAzICYmIHRoaXMuZXAgPj0gNzUgPDwgdGhpcy5yYW5rKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXAgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnJhbmsrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGF0dGFjayh0YXJnZXQ6IEVudGl0eSwgbWFwOiBNYXApIHtcclxuXHJcbiAgICAgICAgbGV0IG46IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gZ2V0IGJhc2UgZGFtYWdlXHJcbiAgICAgICAgbGV0IGF0ayA9IHRoaXMuZGF0YS5hdGsgKyB0aGlzLmF0a19ib29zdDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFbnRpdHlUeXBlLkFyY2hlciAmJiB0YXJnZXQudHlwZSA9PSBFbnRpdHlUeXBlLld5dmVybikge1xyXG4gICAgICAgICAgICBhdGsgKz0gMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5VHlwZS5XaXNwICYmIHRhcmdldC50eXBlID09IEVudGl0eVR5cGUuU2tlbGV0b24pIHtcclxuICAgICAgICAgICAgYXRrICs9IDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgdGhpcy5yYW5rO1xyXG4gICAgICAgIGlmIChuID4gMTkpIHtcclxuICAgICAgICAgICAgYXRrICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgYXRrICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGF0ayAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBhdGsgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWYgPSB0YXJnZXQuZGF0YS5kZWYgKyB0YXJnZXQuZGVmX2Jvb3N0O1xyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgdGFyZ2V0LnJhbms7XHJcblxyXG4gICAgICAgIGlmIChuID4gMTkpIHtcclxuICAgICAgICAgICAgZGVmICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgZGVmICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGRlZiAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBkZWYgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZWRfaGVhbHRoID0gTWF0aC5mbG9vcigoYXRrIC0gKGRlZiArIG1hcC5nZXREZWZBdCh0YXJnZXQucG9zaXRpb24sIHRhcmdldCkpICogKDIgLyAzKSkgKiB0aGlzLmhlYWx0aCAvIDEwKTtcclxuICAgICAgICBpZiAocmVkX2hlYWx0aCA+IHRhcmdldC5oZWFsdGgpIHtcclxuICAgICAgICAgICAgcmVkX2hlYWx0aCA9IHRhcmdldC5oZWFsdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhcmdldC5zZXRIZWFsdGgodGFyZ2V0LmhlYWx0aCAtIHJlZF9oZWFsdGgpO1xyXG4gICAgICAgIHRoaXMuZXAgKz0gKHRhcmdldC5kYXRhLmF0ayArIHRhcmdldC5kYXRhLmRlZikgKiByZWRfaGVhbHRoO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlU3RhdHVzKCkge1xyXG4gICAgICAgIHRoaXMuYXRrX2Jvb3N0ID0gMDtcclxuICAgICAgICB0aGlzLmRlZl9ib29zdCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZfYm9vc3QgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyAmIEVudGl0eVN0YXR1cy5Qb2lzb25lZCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0a19ib29zdC0tO1xyXG4gICAgICAgICAgICB0aGlzLmRlZl9ib29zdC0tO1xyXG4gICAgICAgICAgICB0aGlzLm1vdl9ib29zdC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgJiBFbnRpdHlTdGF0dXMuV2lzcGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXRrX2Jvb3N0Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0U3RhdHVzKHN0YXR1czogRW50aXR5U3RhdHVzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgfD0gc3RhdHVzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzKCk7XHJcbiAgICB9XHJcbiAgICBjbGVhclN0YXR1cyhzdGF0dXM6IEVudGl0eVN0YXR1cykge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzICY9IH5zdGF0dXM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0dXMoKTtcclxuICAgIH1cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5uYW1lICsgXCIsIGFsbGlhbmNlIFwiICsgdGhpcy5hbGxpYW5jZSArIFwiOiBcIiArIHRoaXMucG9zaXRpb24ueCArIFwiIC0gXCIgKyB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU3RhdGUoc3RhdGU6IEVudGl0eVN0YXRlLCBzaG93OiBib29sZWFuKSB7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBzdGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKHN0YXRlID09IEVudGl0eVN0YXRlLkRlYWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUubG9hZFRleHR1cmUoXCJ0b21ic3RvbmVcIiwgMCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVzKFswXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUubG9hZFRleHR1cmUoXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IHRoaXMuYWxsaWFuY2UpLCAoPG51bWJlcj4gdGhpcy50eXBlKSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVzKFt0aGlzLnR5cGUsIHRoaXMudHlwZSArIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aF0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNob3dfaWNvbiA9IChzaG93ICYmIHN0YXRlID09IEVudGl0eVN0YXRlLk1vdmVkKTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnggPSB0aGlzLnNwcml0ZS54ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNztcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC52aXNpYmxlID0gc2hvd19pY29uO1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC5icmluZ1RvVG9wKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG5cclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG4gICAgfVxyXG4gICAgc2V0SGVhbHRoKGhlYWx0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSBoZWFsdGg7XHJcbiAgICAgICAgaWYgKGhlYWx0aCA+IDkgfHwgaGVhbHRoIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGguZnJhbWUgPSAyNyArIChoZWFsdGggLSAxKTtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgfVxyXG4gICAgZ2V0TW92ZW1lbnQoKTogbnVtYmVyIHtcclxuICAgICAgICAvLyBpZiBwb2lzb25lZCwgbGVzcyAtPiBhcHBseSBoZXJlXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5tb3Y7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGguZGVzdHJveSgpO1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC5kZXN0cm95KCk7XHJcbiAgICAgICAgc3VwZXIuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBGcmFtZVJlY3Qge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xyXG59XHJcbmludGVyZmFjZSBGcmFtZURlbGVnYXRlIHtcclxuICAgIGZyYW1lV2lsbERlc3Ryb3koZnJhbWU6IEZyYW1lKTogdm9pZDtcclxufVxyXG5lbnVtIEZyYW1lQW5pbWF0aW9uIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgU2hvdyA9IDEsXHJcbiAgICBIaWRlID0gMixcclxuICAgIENoYW5nZSA9IDQsXHJcbiAgICBXaXJlID0gOCxcclxuICAgIERlc3Ryb3kgPSAxNixcclxuICAgIFVwZGF0ZSA9IDMyXHJcbn1cclxuY2xhc3MgRnJhbWUge1xyXG4gICAgc3RhdGljIEJPUkRFUl9TSVpFOiBudW1iZXIgPSAyNDtcclxuICAgIHN0YXRpYyBBTklNX1NURVBTOiBudW1iZXIgPSAxNTtcclxuXHJcbiAgICBkZWxlZ2F0ZTogRnJhbWVEZWxlZ2F0ZTtcclxuXHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgYm9yZGVyX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBjb250ZW50X2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBjb250ZW50X2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBib3JkZXJfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuXHJcbiAgICByZXVzZV90aWxlczogUGhhc2VyLkltYWdlW107XHJcblxyXG4gICAgYWxpZ246IERpcmVjdGlvbjtcclxuICAgIGFuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIGJvcmRlcjogRGlyZWN0aW9uO1xyXG5cclxuICAgIGFuaW1hdGlvbjogRnJhbWVBbmltYXRpb247XHJcblxyXG4gICAgZ2FtZV93aWR0aDogbnVtYmVyO1xyXG4gICAgZ2FtZV9oZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgY3VycmVudDogRnJhbWVSZWN0O1xyXG4gICAgdGFyZ2V0OiBGcmFtZVJlY3Q7XHJcbiAgICBzcGVlZDogRnJhbWVSZWN0O1xyXG4gICAgYWNjOiBGcmFtZVJlY3Q7XHJcbiAgICBwcml2YXRlIG5ld19hbGlnbjogRGlyZWN0aW9uO1xyXG4gICAgcHJpdmF0ZSBuZXdfYm9yZGVyOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19hbmltYXRpb25fZGlyZWN0aW9uOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19hbmltYXRlOiBib29sZWFuO1xyXG5cclxuICAgIHN0YXRpYyBnZXRSZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBjb3B5UmVjdChmcjogRnJhbWVSZWN0KTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IGZyLngsIHk6IGZyLnksIHdpZHRoOiBmci53aWR0aCwgaGVpZ2h0OiBmci5oZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGlsZUZvckRpcmVjdGlvbihkaXJlY3Rpb246IERpcmVjdGlvbik6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDU7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucmV1c2VfdGlsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBncm91cDogUGhhc2VyLkdyb3VwLCBhbGlnbjogRGlyZWN0aW9uLCBib3JkZXI6IERpcmVjdGlvbiwgYW5pbV9kaXI/OiBEaXJlY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmFsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID0gdHlwZW9mIGFuaW1fZGlyICE9IFwidW5kZWZpbmVkXCIgPyBhbmltX2RpciA6IGFsaWduO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyID0gYm9yZGVyO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XHJcblxyXG5cclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmJvcmRlcl9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmJvcmRlcl9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWVfd2lkdGggPSB0aGlzLmdyb3VwLmdhbWUud2lkdGg7XHJcbiAgICAgICAgdGhpcy5nYW1lX2hlaWdodCA9IHRoaXMuZ3JvdXAuZ2FtZS5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgaWYgKGFuaW1hdGUpIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHN0YXJ0aW5nIG9mZnNldCB1c2luZyB0aGUgYW5pbV9kaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5TaG93O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5XaXJlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlU3BlZWQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcblxyXG4gICAgICAgIGlmICghYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uSGlkZTtcclxuICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uRGVzdHJveTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uVXBkYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy53aWR0aCA9PSB3aWR0aCAmJiB0aGlzLmhlaWdodCA9PSBoZWlnaHQpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvbGRfd2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGxldCBvbGRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLkNoYW5nZTtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGFrZSB0aGUgYmlnZ2VzdCByZWN0IHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIG9sZF93aWR0aCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgb2xkX2hlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuY3VycmVudCBpcyB0aGUgb2xkIHJlY3QgKG9mZnNldCAmIHNpemUpXHJcbiAgICAgICAgLy8gdXBkYXRlIHRoaXMuY3VycmVudCBzbyB0aGUgc2FtZSBwb3J0aW9uIG9mIHRoZSBmcmFtZSBpcyByZW5kZXJlZCwgYWx0aG91Z2ggaXQgY2hhbmdlZCBpbiBzaXplXHJcbiAgICAgICAgLy8gY2hhbmdlIHRhcmdldCB0byBhbGlnbm1lbnQgcG9zaXRpb24gZm9yIGNoYW5nZWQgcmVjdFxyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC54IC09IHdpZHRoIC0gb2xkX3dpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC54IC09IHdpZHRoIC0gdGhpcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC55IC09IGhlaWdodCAtIG9sZF9oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgLT0gaGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZURpcmVjdGlvbnMoYWxpZ246IERpcmVjdGlvbiwgYm9yZGVyOiBEaXJlY3Rpb24sIGFuaW1fZGlyZWN0aW9uOiBEaXJlY3Rpb24sIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5uZXdfYWxpZ24gPT09IGFsaWduICYmIHRoaXMubmV3X2JvcmRlciA9PSBib3JkZXIgJiYgdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbiA9PSBhbmltX2RpcmVjdGlvbiAmJiB0aGlzLm5ld19hbmltYXRlID09IGFuaW1hdGUpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMubmV3X2FsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5uZXdfYm9yZGVyID0gYm9yZGVyO1xyXG4gICAgICAgIHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb24gPSBhbmltX2RpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLm5ld19hbmltYXRlID0gYW5pbWF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlKHRydWUsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24gPT0gRnJhbWVBbmltYXRpb24uTm9uZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX3ggPSB0aGlzLmFkZEdhaW4oXCJ4XCIsIHN0ZXBzKTtcclxuICAgICAgICBsZXQgZmluaXNoZWRfeSA9IHRoaXMuYWRkR2FpbihcInlcIiwgc3RlcHMpO1xyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfd2lkdGggPSB0cnVlO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF9oZWlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIHNpemUgd2l0aCB0aGUgd2lyZSBhbmltYXRpb25cclxuICAgICAgICAgICAgZmluaXNoZWRfd2lkdGggPSB0aGlzLmFkZEdhaW4oXCJ3aWR0aFwiLCBzdGVwcyk7XHJcbiAgICAgICAgICAgIGZpbmlzaGVkX2hlaWdodCA9IHRoaXMuYWRkR2FpbihcImhlaWdodFwiLCBzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmluaXNoZWRfeCAmJiBmaW5pc2hlZF95ICYmIGZpbmlzaGVkX3dpZHRoICYmIGZpbmlzaGVkX2hlaWdodCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25EaWRFbmQodGhpcy5hbmltYXRpb24pO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uSGlkZSkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkNoYW5nZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgb2Zmc2V0IGFuZCByZW1vdmUgdGlsZXMgb3V0IG9mIHNpZ2h0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkhpZGUpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5EZXN0cm95KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlEaXJlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAvLyBuaWNlIGFuaW1hdGlvbiBmb3IgZnJhbWUgd2l0aCBubyBhbGlnbm1lbnQgJiBubyBhbmltYXRpb24gZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmxpbmVTdHlsZSgxLCAweGZmZmZmZik7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHRoaXMuY3VycmVudC53aWR0aCwgdGhpcy5jdXJyZW50LmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIGlmICghIXRoaXMuZGVsZWdhdGUpIHsgdGhpcy5kZWxlZ2F0ZS5mcmFtZVdpbGxEZXN0cm95KHRoaXMpOyB9XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRnJhbWVBbmltYXRpb24pIHtcclxuICAgICAgICAvLyBpbXBsZW1lbnRlZCBpbiBzdWIgY2xhc3NlcyBpZiBuZWVkZWQgLSBkZWZhdWx0OiBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseURpcmVjdGlvbnMoKSB7XHJcbiAgICAgICAgdGhpcy5hbGlnbiA9IHRoaXMubmV3X2FsaWduO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyID0gdGhpcy5uZXdfYm9yZGVyO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiA9IHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcbiAgICAgICAgdGhpcy5zaG93KHRoaXMubmV3X2FuaW1hdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWxpZ25tZW50UmVjdCgpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IHVzaW5nIHRoZSBhbGlnbm1lbnRcclxuICAgICAgICBsZXQgcmVjdCA9IEZyYW1lLmdldFJlY3QoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSB0aGlzLmdhbWVfd2lkdGggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IE1hdGguZmxvb3IoKHRoaXMuZ2FtZV93aWR0aCAtIHRoaXMud2lkdGgpIC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSB0aGlzLmdhbWVfaGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVjdC55ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lX2hlaWdodCAtIHRoaXMuaGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldFJldHJhY3RlZFJlY3QoKTogRnJhbWVSZWN0IHtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBGcmFtZS5nZXRSZWN0KE1hdGguZmxvb3IodGhpcy5nYW1lX3dpZHRoIC8gMiksIE1hdGguZmxvb3IodGhpcy5nYW1lX2hlaWdodCAvIDIpLCAwLCAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZWN0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSAtdGhpcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gdGhpcy5nYW1lX3dpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSAtdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC55ID0gdGhpcy5nYW1lX2hlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJlY3Q7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHVwZGF0ZU9mZnNldCgpIHtcclxuICAgICAgICBsZXQgeCA9IHRoaXMuY3VycmVudC54O1xyXG4gICAgICAgIGxldCB5ID0gdGhpcy5jdXJyZW50Lnk7XHJcblxyXG4gICAgICAgIGxldCBjX3ggPSAwO1xyXG4gICAgICAgIGxldCBjX3kgPSAwO1xyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX3ggPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfeSA9IDY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC54ID0geDtcclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC55ID0geTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAueCA9IHggKyBjX3g7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnkgPSB5ICsgY195O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3RnJhbWUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IGNfd2lkdGggPSB3aWR0aDtcclxuICAgICAgICBsZXQgY19oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfd2lkdGggLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX3dpZHRoIC09IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgY19oZWlnaHQgLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfaGVpZ2h0IC09IDY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2hvd190aWxlc194ID0gTWF0aC5jZWlsKHdpZHRoIC8gRnJhbWUuQk9SREVSX1NJWkUpIC0gMjtcclxuICAgICAgICBsZXQgc2hvd190aWxlc195ID0gTWF0aC5jZWlsKGhlaWdodCAvIEZyYW1lLkJPUkRFUl9TSVpFKSAtIDI7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5saW5lU3R5bGUoMCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmJlZ2luRmlsbCgweGNlYmVhNSk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIGNfd2lkdGgsIGNfaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG5cclxuICAgICAgICBsZXQgdGlsZXM6IFBoYXNlci5JbWFnZVtdID0gW107XHJcblxyXG4gICAgICAgIGxldCBvZmZzZXRfeCA9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hvd190aWxlc194OyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUob2Zmc2V0X3gsIDAsIERpcmVjdGlvbi5VcCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5Eb3duKSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUob2Zmc2V0X3gsIGhlaWdodCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBEaXJlY3Rpb24uRG93bikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9mZnNldF94ICs9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9mZnNldF95ID0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaG93X3RpbGVzX3k7IGorKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uTGVmdCkge1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIG9mZnNldF95LCBEaXJlY3Rpb24uTGVmdCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5SaWdodCkge1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIG9mZnNldF95LCBEaXJlY3Rpb24uUmlnaHQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvZmZzZXRfeSArPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkxlZnQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSgwLCAwLCB0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCAwLCB0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIGhlaWdodCAtIEZyYW1lLkJPUkRFUl9TSVpFLCB0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLlJpZ2h0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLlJpZ2h0KSkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgICAgIHRoaXMucmV1c2VfdGlsZXMgPSB0aWxlcztcclxuICAgIH1cclxuICAgIHByaXZhdGUgcmVtb3ZlRnJhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Qm9yZGVyVGlsZSh4OiBudW1iZXIsIHk6IG51bWJlciwgZGlyZWN0aW9uOiBEaXJlY3Rpb24pIHtcclxuICAgICAgICBsZXQgcmV1c2U6IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmV1c2VfdGlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICByZXVzZSA9IHRoaXMucmV1c2VfdGlsZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcmV1c2UuYnJpbmdUb1RvcCgpO1xyXG4gICAgICAgICAgICByZXVzZS54ID0geDtcclxuICAgICAgICAgICAgcmV1c2UueSA9IHk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV1c2UgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKHgsIHksIFwibWVudVwiLCBudWxsLCB0aGlzLmJvcmRlcl9ncm91cCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldXNlLmZyYW1lID0gRnJhbWUuZ2V0VGlsZUZvckRpcmVjdGlvbihkaXJlY3Rpb24pO1xyXG4gICAgICAgIHJldHVybiByZXVzZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYWRkR2Fpbih2YXJfbmFtZTogc3RyaW5nLCBzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3BlZWRbdmFyX25hbWVdID09IDApIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgICAgICAgdGhpcy5hY2NbdmFyX25hbWVdICs9IHRoaXMuc3BlZWRbdmFyX25hbWVdICogc3RlcHM7XHJcblxyXG4gICAgICAgIGxldCBkID0gTWF0aC5mbG9vcih0aGlzLmFjY1t2YXJfbmFtZV0pO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gKz0gZDtcclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gLT0gZDtcclxuICAgICAgICBpZiAoZCA8IDAgJiYgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSA8IHRoaXMudGFyZ2V0W3Zhcl9uYW1lXSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID0gdGhpcy50YXJnZXRbdmFyX25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9ZWxzZSBpZiAoZCA+IDAgJiYgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSA+IHRoaXMudGFyZ2V0W3Zhcl9uYW1lXSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID0gdGhpcy50YXJnZXRbdmFyX25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTcGVlZCgpIHtcclxuICAgICAgICB0aGlzLnNwZWVkID0gRnJhbWUuZ2V0UmVjdCgodGhpcy50YXJnZXQueCAtIHRoaXMuY3VycmVudC54KSAvIEZyYW1lLkFOSU1fU1RFUFMsICh0aGlzLnRhcmdldC55IC0gdGhpcy5jdXJyZW50LnkpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LndpZHRoIC0gdGhpcy5jdXJyZW50LndpZHRoKSAvIEZyYW1lLkFOSU1fU1RFUFMsICh0aGlzLnRhcmdldC5oZWlnaHQgLSB0aGlzLmN1cnJlbnQuaGVpZ2h0KSAvIEZyYW1lLkFOSU1fU1RFUFMpO1xyXG4gICAgICAgIHRoaXMuYWNjID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCAwLCAwKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcmVtb3ZlVGlsZXMoKSB7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMucmV1c2VfdGlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgdGlsZSA9IHRoaXMucmV1c2VfdGlsZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgdGlsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ2ZW5kb3IvcGhhc2VyLmQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJsb2FkZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicG5nbG9hZGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1haW5tZW51LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdhbWVjb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1hcC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0aWxlbWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHltYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImVudGl0eXJhbmdlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNtb2tlbWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzcHJpdGUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic21va2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZyYW1lLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFlZm9udC50c1wiIC8+XHJcbmNsYXNzIEFuY2llbnRFbXBpcmVzIHtcclxuXHJcbiAgICBzdGF0aWMgVElMRV9TSVpFOiBudW1iZXIgPSAyNDtcclxuICAgIHN0YXRpYyBFTlRJVElFUzogRW50aXR5RGF0YVtdO1xyXG5cclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfTEVOR1RIID0gMTA7XHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX1dJRFRIID0gNDtcclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfU1BBQ0lORyA9IDI7XHJcbiAgICBzdGF0aWMgREVBVEhfQ09VTlQgPSAzO1xyXG5cclxuICAgIHN0YXRpYyBOVU1CRVJfT0ZfVElMRVM6IG51bWJlciA9IDIzO1xyXG4gICAgc3RhdGljIFRJTEVTX1BST1A6IFRpbGVbXTtcclxuICAgIHN0YXRpYyBMQU5HOiBzdHJpbmdbXTtcclxuXHJcbiAgICBzdGF0aWMgZ2FtZTogUGhhc2VyLkdhbWU7XHJcbiAgICBsb2FkZXI6IExvYWRlcjtcclxuICAgIG1haW5NZW51OiBNYWluTWVudTtcclxuICAgIGNvbnRyb2xsZXI6IEdhbWVDb250cm9sbGVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXIgPSAxNzY7XHJcbiAgICBoZWlnaHQ6IG51bWJlciA9ICAyMDQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGl2X2lkOiBzdHJpbmcpIHtcclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBQaGFzZXIuQVVUTywgZGl2X2lkLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmxvYWRlciA9IG5ldyBMb2FkZXIoKTtcclxuICAgICAgICB0aGlzLm1haW5NZW51ID0gbmV3IE1haW5NZW51KCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKCk7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiTG9hZGVyXCIsIHRoaXMubG9hZGVyKTtcclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLnN0YXRlLmFkZChcIk1haW5NZW51XCIsIHRoaXMubWFpbk1lbnUpO1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiR2FtZVwiLCB0aGlzLmNvbnRyb2xsZXIpO1xyXG5cclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLnN0YXRlLnN0YXJ0KFwiTG9hZGVyXCIpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG59XHJcbiIsImVudW0gU2NyZWVuVHJhbnNpdGlvbiB7XHJcbiAgICBOb25lLFxyXG4gICAgSGlkZSxcclxuICAgIFNob3dcclxufVxyXG5jbGFzcyBBdHRhY2tTY3JlZW4ge1xyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uOiBTY3JlZW5UcmFuc2l0aW9uO1xyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uX3Byb2dyZXNzOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBiYWNrZ3JvdW5kX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGNvbnRlbnRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgdHJhbnNpdGlvbl9tYXNrOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGF0dGFja2VyOiBFbnRpdHk7XHJcbiAgICBwcml2YXRlIHRhcmdldDogRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBtYXA6IE1hcDtcclxuXHJcbiAgICBzdGF0aWMgZHJhd1RyYW5zaXRpb24ocHJvZ3Jlc3M6IG51bWJlciwgbWF4X3Byb2dyZXNzOiBudW1iZXIsIGdyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIHNjcmVlbl93aWR0aDogbnVtYmVyLCBzY3JlZW5faGVpZ2h0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IG1heF9zZWdtZW50X3dpZHRoID0gTWF0aC5mbG9vcihzY3JlZW5fd2lkdGggLyA0KSArIDE7XHJcbiAgICAgICAgbGV0IG1heF9zZWdtZW50X2hlaWdodCA9IE1hdGguZmxvb3Ioc2NyZWVuX2hlaWdodCAvIDQpICsgMTtcclxuXHJcbiAgICAgICAgbGV0IHVudGlsX2FsbCA9IG1heF9wcm9ncmVzcyAtIDY7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCA0OyB4KyspIHtcclxuICAgICAgICAgICAgbGV0IHNob3cgPSBNYXRoLmZsb29yKHByb2dyZXNzIC0geCAqIDIpO1xyXG4gICAgICAgICAgICBpZiAoc2hvdyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRyYXcgYWZ0ZXIgdGhpcyBwb2ludFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHdpZHRoOiBudW1iZXI7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICAgICAgaWYgKHNob3cgPj0gdW50aWxfYWxsKSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IG1heF9zZWdtZW50X3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gbWF4X3NlZ21lbnRfaGVpZ2h0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHNob3cgKiBtYXhfc2VnbWVudF93aWR0aCAvIHVudGlsX2FsbCk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmZsb29yKHNob3cgKiBtYXhfc2VnbWVudF9oZWlnaHQgLyB1bnRpbF9hbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5feCA9IE1hdGguZmxvb3IoKG1heF9zZWdtZW50X3dpZHRoIC0gd2lkdGgpIC8gMik7XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5feSA9IE1hdGguZmxvb3IoKG1heF9zZWdtZW50X2hlaWdodCAtIGhlaWdodCkgLyAyKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldF94ID0geCAqIG1heF9zZWdtZW50X3dpZHRoICsgbWFyZ2luX3g7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgNDsgeSArKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldF95ID0geSAqIG1heF9zZWdtZW50X2hlaWdodCArIG1hcmdpbl95O1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3Qob2Zmc2V0X3gsIG9mZnNldF95LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0QmFja2dyb3VuZFByZWZpeEZvclRpbGUodGlsZTogVGlsZSk6IHN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoICh0aWxlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ3b29kc1wiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImhpbGxcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibW91bnRhaW5cIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwid2F0ZXJcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImJyaWRnZVwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ0b3duXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE5hbWVGb3JUaWxlKHRpbGU6IFRpbGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAodGlsZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuR3Jhc3M6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiZ3Jhc3NcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLlBhdGg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJyb2FkXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIm1vdW50YWluXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIndhdGVyXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJicmlkZ2VcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhvdXNlOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQ2FzdGxlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwidG93blwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lLCBhdHRhY2tlcjogRW50aXR5LCB0YXJnZXQ6IEVudGl0eSwgbWFwOiBNYXApIHtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcyA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrID0gZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX21hc2suY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC5tYXNrID0gdGhpcy50cmFuc2l0aW9uX21hc2s7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uID0gU2NyZWVuVHJhbnNpdGlvbi5Ob25lO1xyXG4gICAgfVxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICAvLyBzdGFydCB0cmFuc2l0aW9uXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzID0gMDtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLkhpZGU7XHJcbiAgICB9XHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGxldCBhdHRhY2tlcl90aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHRoaXMuYXR0YWNrZXIucG9zaXRpb24pO1xyXG4gICAgICAgIGxldCB0YXJnZXRfdGlsZSA9IHRoaXMubWFwLmdldFRpbGVBdCh0aGlzLnRhcmdldC5wb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5kcmF3QmFja2dyb3VuZEhhbGYoYXR0YWNrZXJfdGlsZSwgMCk7XHJcbiAgICAgICAgdGhpcy5kcmF3QmFja2dyb3VuZEhhbGYodGFyZ2V0X3RpbGUsIDEpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYnJpbmdUb1RvcCh0aGlzLmNvbnRlbnRfZ3JhcGhpY3MpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5iZWdpbkZpbGwoMHgwMDAwMDApO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5kcmF3UmVjdChNYXRoLmZsb29yKHRoaXMuZ3JvdXAuZ2FtZS53aWR0aCAvIDIpIC0gMSwgMCwgMiwgdGhpcy5ncm91cC5nYW1lLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgIH1cclxuICAgIGRyYXdCYWNrZ3JvdW5kSGFsZih0aWxlOiBUaWxlLCBoYWxmOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgaGFsZl93aWR0aCA9IE1hdGguZmxvb3IodGhpcy5ncm91cC5nYW1lLndpZHRoIC8gMik7XHJcbiAgICAgICAgbGV0IGhhbGZfaGVpZ2h0ID0gdGhpcy5ncm91cC5nYW1lLmhlaWdodDtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSBoYWxmICogaGFsZl93aWR0aDtcclxuXHJcbiAgICAgICAgbGV0IGJnX2ltYWdlID0gQXR0YWNrU2NyZWVuLmdldEJhY2tncm91bmRQcmVmaXhGb3JUaWxlKHRpbGUpO1xyXG4gICAgICAgIGxldCBiZ19oZWlnaHQgPSAwO1xyXG4gICAgICAgIGlmIChiZ19pbWFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGJnX2hlaWdodCA9IDQ4O1xyXG4gICAgICAgICAgICBsZXQgYmdfdGlsZXNfeCA9IE1hdGguY2VpbChoYWxmX3dpZHRoIC8gKDIgKiA4OCkpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJnX3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5zcHJpdGUob2Zmc2V0X3ggKyBpICogODgsIDAsIGJnX2ltYWdlICsgXCJfYmdcIiwgMCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRpbGVzX3ggPSBNYXRoLmNlaWwoaGFsZl93aWR0aCAvIDI0KTtcclxuICAgICAgICBsZXQgdGlsZXNfeSA9IE1hdGguY2VpbCgoaGFsZl9oZWlnaHQgLSBiZ19oZWlnaHQpIC8gMjQpO1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGlsZXNfeDsgeCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZXNfeTsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcclxuICAgICAgICAgICAgICAgIGxldCB2YXJpYW50ID0gcmFuZCA+PSA5ID8gMiA6IChyYW5kID49IDggPyAxIDogMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLnNwcml0ZShvZmZzZXRfeCArIHggKiAyNCwgYmdfaGVpZ2h0ICsgeSAqIDI0LCBBdHRhY2tTY3JlZW4uZ2V0TmFtZUZvclRpbGUodGlsZSksIHZhcmlhbnQsIHRoaXMuZ3JvdXApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy50cmFuc2l0aW9uID09IFNjcmVlblRyYW5zaXRpb24uTm9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb24gPT0gU2NyZWVuVHJhbnNpdGlvbi5IaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4MDAwMDAwKTtcclxuICAgICAgICAgICAgQXR0YWNrU2NyZWVuLmRyYXdUcmFuc2l0aW9uKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcywgMzAsIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcywgdGhpcy5ncm91cC5nYW1lLndpZHRoLCB0aGlzLmdyb3VwLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kX2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5iZWdpbkZpbGwoKTtcclxuICAgICAgICAgICAgQXR0YWNrU2NyZWVuLmRyYXdUcmFuc2l0aW9uKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcywgMzAsIHRoaXMudHJhbnNpdGlvbl9tYXNrLCB0aGlzLmdyb3VwLmdhbWUud2lkdGgsIHRoaXMuZ3JvdXAuZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5lbmRGaWxsKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiBtYXNrIG11c3QgaGF2ZSBhIGRyYXdSZWN0IGNhbGwgdG8gYmUgYSBtYXNrLCBvdGhlcndpc2UgZXZlcnl0aGluZyBpcyBzaG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcyA+PSAzMCkge1xyXG4gICAgICAgICAgICBsZXQgdHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbjtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uID0gU2NyZWVuVHJhbnNpdGlvbi5Ob25lO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25EaWRFbmQodHJhbnNpdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzKys7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uRGlkRW5kKHRyYW5zaXRpb246IFNjcmVlblRyYW5zaXRpb24pIHtcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PSBTY3JlZW5UcmFuc2l0aW9uLlNob3cpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGaW5pc2hlZFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzID0gMDtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLlNob3c7XHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgRnJhbWVNYW5hZ2VyIGltcGxlbWVudHMgRnJhbWVEZWxlZ2F0ZSB7XHJcbiAgICBmcmFtZXM6IEZyYW1lW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgIH1cclxuICAgIGFkZEZyYW1lKGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIGZyYW1lLmRlbGVnYXRlID0gdGhpcztcclxuICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUZyYW1lKGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5mcmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZnJhbWUgb2YgdGhpcy5mcmFtZXMpIHtcclxuICAgICAgICAgICAgZnJhbWUudXBkYXRlKHN0ZXBzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmcmFtZVdpbGxEZXN0cm95KGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoZnJhbWUpO1xyXG4gICAgfVxyXG59XHJcbiIsImVudW0gS2V5IHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgVXAgPSAxLFxyXG4gICAgUmlnaHQgPSAyLFxyXG4gICAgRG93biA9IDQsXHJcbiAgICBMZWZ0ID0gOCxcclxuICAgIEVudGVyID0gMTYsXHJcbiAgICBFc2MgPSAzMlxyXG59O1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwdWJsaWMgYWxsX2tleXM6IEtleTtcclxuXHJcbiAgICBwcml2YXRlIGtleV91cDogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X3JpZ2h0OiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfZG93bjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2xlZnQ6IFBoYXNlci5LZXk7XHJcbiAgICBwcml2YXRlIGtleV9lbnRlcjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2VzYzogUGhhc2VyLktleTtcclxuXHJcbiAgICBwcml2YXRlIGxhc3Rfa2V5czogS2V5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBQaGFzZXIuSW5wdXQpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyA9IEtleS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmtleV91cCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xyXG4gICAgICAgIHRoaXMua2V5X2Rvd24gPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xyXG4gICAgICAgIHRoaXMua2V5X3JpZ2h0ID0gaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfbGVmdCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfZW50ZXIgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVOVEVSKTtcclxuICAgICAgICB0aGlzLmtleV9lc2MgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVTQyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFsbF9rZXlzICYga2V5KSAhPSAwO1xyXG4gICAgfVxyXG4gICAgY2xlYXJLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyAmPSB+a2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY3VycmVudF9rZXlzOiBLZXkgPSBLZXkuTm9uZTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LlVwLCB0aGlzLmtleV91cC5pc0Rvd24pO1xyXG4gICAgICAgIGN1cnJlbnRfa2V5cyB8PSB0aGlzLnVwZGF0ZUtleShLZXkuUmlnaHQsIHRoaXMua2V5X3JpZ2h0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5Eb3duLCB0aGlzLmtleV9kb3duLmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5MZWZ0LCB0aGlzLmtleV9sZWZ0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5FbnRlciwgdGhpcy5rZXlfZW50ZXIuaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkVzYywgdGhpcy5rZXlfZXNjLmlzRG93bik7XHJcbiAgICAgICAgdGhpcy5sYXN0X2tleXMgPSBjdXJyZW50X2tleXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHNldEtleShrZXk6IEtleSwgeWVzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyBePSAoLXllcyBeIHRoaXMuYWxsX2tleXMpICYga2V5O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB3YXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmxhc3Rfa2V5cyAmIGtleSkgIT0gMDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlS2V5KGtleTogS2V5LCBpc19kb3duOiBib29sZWFuKTogS2V5IHtcclxuICAgICAgICBpZiAoaXNfZG93biAhPSB0aGlzLndhc0tleVByZXNzZWQoa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEtleShrZXksIGlzX2Rvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNfZG93biA/IGtleSA6IDA7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIE1lbnVEZWxlZ2F0ZSB7XHJcbiAgICBvcGVuTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpOiB2b2lkO1xyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCk6IHZvaWQ7XHJcbn1cclxuY2xhc3MgTWVudUdvbGRJbmZvIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIGdvbGRfYW1vdW50OiBBRUZvbnQ7XHJcbiAgICBoZWFkX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBoZWFkX2ljb246IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDY0LCA0MCwgZ3JvdXAsIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KGFsbGlhbmNlOiBBbGxpYW5jZSwgZ29sZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIGluZm9ybWF0aW9uIGluc2lkZSBtZW51XHJcblxyXG4gICAgICAgIGxldCBjb2xvcjogbnVtYmVyO1xyXG4gICAgICAgIGxldCBmcmFtZTogbnVtYmVyO1xyXG4gICAgICAgIGxldCB4OiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGFsbGlhbmNlID09IEFsbGlhbmNlLkJsdWUpIHtcclxuICAgICAgICAgICAgY29sb3IgPSAweDAwMDBmZjtcclxuICAgICAgICAgICAgZnJhbWUgPSAwO1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2xvciA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICBmcmFtZSA9IDE7XHJcbiAgICAgICAgICAgIHggPSAyNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5iZWdpbkZpbGwoY29sb3IpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5kcmF3UmVjdCgwLCAxNywgdGhpcy53aWR0aCwgMTcpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24ueCA9IHg7XHJcblxyXG4gICAgICAgIHRoaXMuZ29sZF9hbW91bnQuc2V0VGV4dChnb2xkLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGNvbnRlbnQgKHNwcml0ZXMsIHRleHQgZXRjKVxyXG5cclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMiwgMiwgXCJnb2xkXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDE2LCBcInBvcnRyYWl0XCIsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgbGV0IGhlYWRfY3JvcCA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKDAsIDEwLCB0aGlzLmhlYWRfaWNvbi53aWR0aCwgMTgpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLmNyb3AoaGVhZF9jcm9wKTtcclxuXHJcbiAgICAgICAgdGhpcy5nb2xkX2Ftb3VudCA9IG5ldyBBRUZvbnQoMjgsIDUsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNZW51RGVmSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuICAgIHByaXZhdGUgdGlsZV9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIGRlZl9hbW91bnQ6IEFFRm9udDtcclxuICAgIHByaXZhdGUgZW50aXR5X2ljb246IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDQwLCA1MiwgZ3JvdXAsIERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KHBvc2l0aW9uOiBQb3MsIG1hcDogTWFwLCBlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvcm1hdGlvbiBpbnNpZGUgbWVudVxyXG5cclxuICAgICAgICBsZXQgdGlsZSA9IG1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSBtYXAuZ2V0QWxsaWFuY2VBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVfaWNvbi5rZXkgIT0gXCJidWlsZGluZ3NfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5sb2FkVGV4dHVyZShcImJ1aWxkaW5nc19cIiArICg8bnVtYmVyPiBhbGxpYW5jZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGlsZV9pY29uLmZyYW1lID0gdGlsZSA9PSBUaWxlLkhvdXNlID8gMCA6IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGlsZV9pY29uLmtleSAhPSBcInRpbGVzMFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5sb2FkVGV4dHVyZShcInRpbGVzMFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5mcmFtZSA9IFRpbGVNYW5hZ2VyLmdldEJhc2VJbWFnZUluZGV4Rm9yVGlsZSh0aWxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGVmX2Ftb3VudC5zZXRUZXh0KE1hcC5nZXREZWZGb3JUaWxlKHRpbGUsIGVudGl0eSkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIGlmICghIWVudGl0eSAmJiAhZW50aXR5LmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2l6ZSg2OCwgNTIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbnRpdHlfaWNvbi5rZXkgIT0gXCJ1bml0X2ljb25zX1wiICsgZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLmxvYWRUZXh0dXJlKFwidW5pdF9pY29uc19cIiArIGVudGl0eS5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi5mcmFtZSA9IGVudGl0eS50eXBlO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2l6ZSg0MCwgNTIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGNvbnRlbnQgKHNwcml0ZXMsIHRleHQgZXRjKVxyXG5cclxuICAgICAgICBsZXQgdGlsZV9ncmFwaGljcyA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aWxlX2dyYXBoaWNzLmxpbmVTdHlsZSgxLCAweDAwMDAwMCk7XHJcbiAgICAgICAgdGlsZV9ncmFwaGljcy5kcmF3UmVjdCg2LCAyLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAxLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAxKTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlX2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDcsIDMsIFwidGlsZXMwXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgbGV0IHRpbGVfY3JvcCA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKDEsIDEsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDIsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDIpO1xyXG4gICAgICAgIHRoaXMudGlsZV9pY29uLmNyb3AodGlsZV9jcm9wKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZl9mb250ID0gbmV3IEFFRm9udCg3LCAyOCwgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuICAgICAgICBkZWZfZm9udC5zZXRUZXh0KFwiREVGXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmRlZl9hbW91bnQgPSBuZXcgQUVGb250KDE0LCAzNywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaWNvbiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMzUsIDIsIFwidW5pdF9pY29uc18xXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgfVxyXG59XHJcbmVudW0gQWN0aW9uIHtcclxuICAgIE5vbmUsXHJcbiAgICBNQUlOX01FTlUsXHJcbiAgICBNT1ZFLFxyXG4gICAgQVRUQUNLLFxyXG4gICAgQlVZLFxyXG4gICAgRU5EX01PVkUsXHJcbiAgICBDQU5DRUwsXHJcbiAgICBFTkRfVFVSTixcclxuICAgIE9DQ1VQWSxcclxuICAgIFJBSVNFLFxyXG4gICAgTUFQLFxyXG4gICAgT0JKRUNUSVZFXHJcbn1cclxuY2xhc3MgTWVudU9wdGlvbnMgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgc2VsZWN0ZWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG9wdGlvbnM6IEFjdGlvbltdO1xyXG4gICAgcHJpdmF0ZSBmb250czogUGhhc2VyLkJpdG1hcFRleHRbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIHN0YXRpYyBnZXRNYWluTWVudU9wdGlvbnMoKTogQWN0aW9uW10ge1xyXG4gICAgICAgIHJldHVybiBbQWN0aW9uLkVORF9UVVJOLCBBY3Rpb24uTUFQLCBBY3Rpb24uT0JKRUNUSVZFLCBBY3Rpb24uTUFJTl9NRU5VXTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRPcHRpb25TdHJpbmcob3B0aW9uOiBBY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIGlmIChvcHRpb24gPT0gQWN0aW9uLk5vbmUpIHsgcmV0dXJuIFwiXCI7IH1cclxuICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuTEFOR1syNiArIDxudW1iZXI+IG9wdGlvbl07XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3RvciAoZ3JvdXA6IFBoYXNlci5Hcm91cCwgYWxpZ246IERpcmVjdGlvbiwgb3B0aW9uczogQWN0aW9uW10sIGRlbGVnYXRlOiBNZW51RGVsZWdhdGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVfZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gMDtcclxuXHJcbiAgICAgICAgbGV0IG1heF9sZW5ndGggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IHRleHQgPSBNZW51T3B0aW9ucy5nZXRPcHRpb25TdHJpbmcob3B0aW9uKTtcclxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gbWF4X2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbWF4X2xlbmd0aCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMubGVuZ3RoICogMTMgKyAxNjtcclxuICAgICAgICBsZXQgd2lkdGggPSBtYXhfbGVuZ3RoICogNyArIDMxICsgMTM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSh3aWR0aCwgaGVpZ2h0LCBncm91cCwgYWxpZ24sIERpcmVjdGlvbi5BbGwgJiB+YWxpZ24sIGFsaWduKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgbGV0IHkgPSA1O1xyXG4gICAgICAgIHRoaXMuZm9udHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBmb250ID0gdGhpcy5ncm91cC5nYW1lLmFkZC5iaXRtYXBUZXh0KDI1LCB5LCBcImZvbnQ3XCIsIHRleHQsIDcsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9udHMucHVzaChmb250KTtcclxuICAgICAgICAgICAgeSArPSAxMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlciA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNCwgNCwgXCJwb2ludGVyXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMjtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdyA9IDA7XHJcblxyXG4gICAgfVxyXG4gICAgaGlkZShhbmltYXRlOiBib29sZWFuID0gZmFsc2UsIGRlc3Ryb3lfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UsIHVwZGF0ZV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5PcHRpb25zKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KElucHV0Q29udGV4dC5PcHRpb25zKTsgfVxyXG4gICAgICAgIHN1cGVyLnNob3coYW5pbWF0ZSk7XHJcbiAgICB9XHJcbiAgICBuZXh0KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQrKztcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA+PSB0aGlzLm9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXYoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkIDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0U2VsZWN0ZWQoKTogQWN0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRdO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdysrO1xyXG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJfc2xvdyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMiAtIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlci55ID0gNCArIHRoaXMuc2VsZWN0ZWQgKiAxMztcclxuICAgICAgICB0aGlzLnBvaW50ZXIueCA9IDQgKyB0aGlzLnBvaW50ZXJfc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE5vdGlmaWNhdGlvbiBleHRlbmRzIEZyYW1lIHtcclxuICAgIHByaXZhdGUgZm9udDogUGhhc2VyLkJpdG1hcFRleHQ7XHJcbiAgICBwcml2YXRlIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoZ3JvdXA6IFBoYXNlci5Hcm91cCwgdGV4dDogc3RyaW5nLCBkZWxlZ2F0ZTogTWVudURlbGVnYXRlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuZm9udCA9IGdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoOSwgNSwgXCJmb250N1wiLCB0ZXh0LCA3KTtcclxuICAgICAgICB0aGlzLmZvbnQudXBkYXRlVHJhbnNmb3JtKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5mb250LnRleHRXaWR0aCArIDMwO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSh3aWR0aCwgMjksIGdyb3VwLCBEaXJlY3Rpb24uTm9uZSwgRGlyZWN0aW9uLkFsbCwgRGlyZWN0aW9uLk5vbmUpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC5hZGQodGhpcy5mb250KTtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShJbnB1dENvbnRleHQuV2FpdCk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGFuaW1hdGlvbkRpZEVuZChhbmltYXRpb246IEZyYW1lQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgaWYgKChhbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5TaG93KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICB9ZWxzZSBpZiAoKGFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkRlc3Ryb3kpICE9IDApIHtcclxuICAgICAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5jbG9zZU1lbnUoSW5wdXRDb250ZXh0LldhaXQpOyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNZW51U2hvcFVuaXRzIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIHNlbGVjdGVkOiBudW1iZXI7XHJcbiAgICBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGU7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfaW1hZ2VzOiBQaGFzZXIuSW1hZ2VbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogTWVudURlbGVnYXRlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg2NCwgZ3JvdXAuZ2FtZS5oZWlnaHQgLSA0MCwgZ3JvdXAsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgIC8vIGRyYXcgY29udGVudFxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaW1hZ2Ugb2YgdGhpcy5lbnRpdHlfaW1hZ2VzKSB7XHJcbiAgICAgICAgICAgIGltYWdlLmxvYWRUZXh0dXJlKFwidW5pdF9pY29uc19cIiArICg8bnVtYmVyPiBhbGxpYW5jZSksIGltYWdlLmZyYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRTZWxlY3RlZCgpOiBFbnRpdHlUeXBlIHtcclxuICAgICAgICByZXR1cm4gPEVudGl0eVR5cGU+IHRoaXMuc2VsZWN0ZWQ7XHJcbiAgICB9XHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUub3Blbk1lbnUoSW5wdXRDb250ZXh0LlNob3ApOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KElucHV0Q29udGV4dC5TaG9wKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdysrO1xyXG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJfc2xvdyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMiAtIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlci55ID0gNSArIE1hdGguZmxvb3IodGhpcy5zZWxlY3RlZCAvIDIpICogMjk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnggPSAtOSArICh0aGlzLnNlbGVjdGVkICUgMikgKiAyOCArIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgIH1cclxuICAgIHByZXYodmVydGljYWw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtPSAyO1xyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKz0gdGhpcy5lbnRpdHlfaW1hZ2VzLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBuZXh0KHZlcnRpY2FsOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKz0gMjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkID49IHRoaXMuZW50aXR5X2ltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtPSB0aGlzLmVudGl0eV9pbWFnZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X2ltYWdlcyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEuY29zdCA+IDEwMDApIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgICAgIGxldCB4ID0gKGkgJSAyKSAqIDI3ICsgMztcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGkgLyAyKSAqIDI5ICsgNTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJ1bml0X2ljb25zXzFcIiwgaSwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaW1hZ2VzLnB1c2goaW1hZ2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBvaW50ZXIgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDQsIDQsIFwicG9pbnRlclwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zdGF0ZSA9IDI7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNZW51U2hvcEluZm8gZXh0ZW5kcyBGcmFtZSB7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIHByaXZhdGUgdW5pdF9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHVuaXRfbmFtZTogUGhhc2VyLkJpdG1hcFRleHQ7XHJcbiAgICBwcml2YXRlIHVuaXRfY29zdDogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X2F0azogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X2RlZjogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X21vdjogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X3RleHQ6IFBoYXNlci5CaXRtYXBUZXh0O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyb3VwOiBQaGFzZXIuR3JvdXAsIGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKGdyb3VwLmdhbWUud2lkdGggLSA2NCwgZ3JvdXAuZ2FtZS5oZWlnaHQsIGdyb3VwLCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5MZWZ0KTtcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KGFsbGlhbmNlKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQodHlwZTogRW50aXR5VHlwZSkge1xyXG4gICAgICAgIGxldCBkYXRhOiBFbnRpdHlEYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbKDxudW1iZXI+IHR5cGUpXTtcclxuICAgICAgICB0aGlzLnVuaXRfaWNvbi5mcmFtZSA9IDxudW1iZXI+IHR5cGU7XHJcbiAgICAgICAgdGhpcy51bml0X25hbWUuc2V0VGV4dChkYXRhLm5hbWUudG9VcHBlckNhc2UoKSk7XHJcbiAgICAgICAgdGhpcy51bml0X2Nvc3Quc2V0VGV4dChkYXRhLmNvc3QudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy51bml0X2F0ay5zZXRUZXh0KGRhdGEuYXRrLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMudW5pdF9kZWYuc2V0VGV4dChkYXRhLmRlZi50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLnVuaXRfbW92LnNldFRleHQoZGF0YS5tb3YudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy51bml0X3RleHQuc2V0VGV4dChBbmNpZW50RW1waXJlcy5MQU5HWzc1ICsgKDxudW1iZXI+IHR5cGUpXSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdDb250ZW50KGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIHRoaXMudW5pdF9pY29uID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgyLCAyLCBcInVuaXRfaWNvbnNfXCIgKyAoYWxsaWFuY2UgPT0gQWxsaWFuY2UuQmx1ZSA/IDEgOiAyKSwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy51bml0X25hbWUgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoMjksIDQsIFwiZm9udDdcIiwgXCJcIiwgNywgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDI4LCAxMywgXCJnb2xkXCIsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy51bml0X2Nvc3QgPSBuZXcgQUVGb250KDU0LCAxNiwgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuXHJcbiAgICAgICAgbmV3IEFFRm9udCgyLCAzMywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIkFUS1wiKTtcclxuICAgICAgICB0aGlzLnVuaXRfYXRrID0gbmV3IEFFRm9udCg5NSwgMzMsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJcIik7XHJcbiAgICAgICAgbmV3IEFFRm9udCgyLCA0MywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIkRFRlwiKTtcclxuICAgICAgICB0aGlzLnVuaXRfZGVmID0gbmV3IEFFRm9udCg5NSwgNDMsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJcIik7XHJcbiAgICAgICAgbmV3IEFFRm9udCgyLCA1MywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIk1PVlwiKTtcclxuICAgICAgICB0aGlzLnVuaXRfbW92ID0gbmV3IEFFRm9udCg5NSwgNTMsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJcIik7XHJcblxyXG4gICAgICAgIHRoaXMudW5pdF90ZXh0ID0gdGhpcy5ncm91cC5nYW1lLmFkZC5iaXRtYXBUZXh0KDYsIDY5LCBcImZvbnQ3XCIsIFwiXCIsIDcsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy51bml0X3RleHQubWF4V2lkdGggPSB0aGlzLmdyb3VwLmdhbWUud2lkdGggLSA2NCAtIDE4O1xyXG4gICAgfVxyXG59XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
