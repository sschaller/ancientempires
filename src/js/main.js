var AEFontStyle;
(function (AEFontStyle) {
    AEFontStyle[AEFontStyle["Normal"] = 0] = "Normal";
    AEFontStyle[AEFontStyle["Bold"] = 1] = "Bold";
    AEFontStyle[AEFontStyle["Large"] = 2] = "Large";
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
        if (style == AEFontStyle.Normal) {
            return 6 * length;
        }
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
        if (style == AEFontStyle.Normal) {
            // normal font
            if (char >= 65 && char <= 90) {
                return char - 65;
            }
            if (char == 32) {
                return -1;
            }
            console.log("Don't recognize char code " + char + " for font normal");
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
            if (this.style == AEFontStyle.Normal) {
                font_name = "font7";
            }
            else if (this.style == AEFontStyle.Bold) {
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
        this.game.load.spritesheet("font7", "img/font7.png", 6, 7);
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
var GameContext;
(function (GameContext) {
    GameContext[GameContext["Notification"] = 0] = "Notification";
    GameContext[GameContext["Menu"] = 1] = "Menu";
    GameContext[GameContext["Shop"] = 2] = "Shop";
    GameContext[GameContext["Options"] = 3] = "Options";
    GameContext[GameContext["Map"] = 4] = "Map";
    GameContext[GameContext["Selection"] = 5] = "Selection";
})(GameContext || (GameContext = {}));
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
        this.entity_manager.createEntity(EntityType.Soldier, Alliance.Red, new Pos(4, 13));
        this.cursor_target = this.entity_manager.getKingPosition(Alliance.Blue);
        this.cursor = new Sprite(this.cursor_target.getWorldPosition(), cursor_group, "cursor", [0, 1]);
        this.cursor.setOffset(-1, -1);
        this.camera.x = this.getOffsetX(this.cursor.world_position.x);
        this.camera.y = this.getOffsetY(this.cursor.world_position.y);
        this.current_context = GameContext.Map;
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
        var focus_position;
        if (!!this.selected_entity) {
            focus_position = this.selected_entity.world_position;
        }
        else {
            focus_position = this.cursor.world_position;
        }
        this.updateOffsetForPosition(focus_position);
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
        if (options.length > 1) {
            this.showOptionMenu(options);
        }
        else {
            this.selectOption(options[0]);
        }
    };
    GameController.prototype.openMenu = function (context) {
        this.last_context = this.current_context;
        this.current_context = context;
    };
    GameController.prototype.closeMenu = function () {
        this.current_context = this.last_context;
    };
    GameController.prototype.selectEntity = function (entity) {
        var options = this.entity_manager.getEntityOptions(entity, false);
        if (options.length < 1) {
            return false;
        }
        if (options.length > 1) {
            this.showOptionMenu(options);
        }
        else {
            this.selectOption(options[0]);
        }
        this.selected_entity = entity;
        this.entity_manager.selectEntity(entity);
        return true;
    };
    GameController.prototype.deselectEntity = function () {
        this.entity_manager.deselectEntity(this.selected_entity);
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
        if (!this.frame_gold_info) {
            this.frame_gold_info = new MenuGoldInfo(this.frame_group);
            this.frame_manager.addFrame(this.frame_gold_info);
        }
        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));
        this.frame_gold_info.show(true);
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
    GameController.prototype.showOptionMenu = function (options) {
        this.frame_def_info.hide(true);
        this.frame_gold_info.hide(true);
        this.options_menu = new MenuOptions(this.frame_group, Direction.Right, options, this);
        this.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
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
                this.entity_manager.showRange(EntityRangeType.Attack, this.selected_entity);
                break;
            case Action.RAISE:
                this.entity_manager.showRange(EntityRangeType.Raise, this.selected_entity);
                break;
            case Action.MOVE:
                this.entity_manager.showRange(EntityRangeType.Move, this.selected_entity);
                break;
            case Action.BUY:
                console.log("Open the shop");
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
                this.deselectEntity();
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
        switch (this.current_context) {
            case GameContext.Map:
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
                    this.selectPosition(this.cursor_target);
                }
                break;
            case GameContext.Options:
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
                    this.selectOption(this.options_menu.getSelected());
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.selectOption(Action.CANCEL);
                    this.options_menu.hide(true, true);
                    this.options_menu = null;
                }
                break;
        }
    };
    GameController.prototype.selectPosition = function (position) {
        if (this.selected_entity) {
            switch (this.active_action) {
                case Action.MOVE:
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
    EntityManager.prototype.selectEntity = function (entity) {
        // move selected entity in a higher group
        this.entity_group.remove(entity.sprite);
        this.interaction_group.add(entity.sprite);
    };
    EntityManager.prototype.deselectEntity = function (entity) {
        // move selected entity back to all other entities
        this.interaction_group.remove(entity.sprite);
        this.entity_group.addAt(entity.sprite, 0);
    };
    EntityManager.prototype.showRange = function (type, entity) {
        this.entity_range.createRange(type, entity, this.selection_graphics);
    };
    EntityManager.prototype.hideRange = function () {
        this.entity_range.clear(this.selection_graphics, this.interaction_graphics);
    };
    EntityManager.prototype.moveEntity = function (entity, target) {
        if (!!this.getEntityAt(target)) {
            // entity at place
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
    EntityManager.prototype.getKingPosition = function (alliance) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance == alliance && entity.type == EntityType.King) {
                return entity.position.copy();
            }
        }
        return new Pos(0, 0);
    };
    EntityManager.prototype.animateMovingEntity = function (steps) {
        if (!this.moving) {
            return;
        }
        var move = this.moving;
        var entity = move.entity;
        move.progress += steps;
        if (move.progress >= move.line[0].length * AncientEmpires.TILE_SIZE) {
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
                this.addForm(false);
                this.extra_cursor.setFrames([2, 3]);
                this.extra_cursor.setOffset(-1, -1);
                this.extra_cursor.show();
                break;
            case EntityRangeType.Move:
                this.waypoints = this.calculateWaypoints(entity, entity.getMovement(), !entity.hasFlag(EntityFlags.CanFly));
                this.addForm(true);
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
            this.extra_cursor.setWorldPosition(cursor_position.getWorldPosition());
            var endpoint = this.getWaypointAt(cursor_position);
            if (!!endpoint) {
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
    EntityRange.prototype.addForm = function (use_terrain) {
        for (var _i = 0, _a = this.waypoints; _i < _a.length; _i++) {
            var waypoint = _a[_i];
            waypoint.form = 0;
            if ((!use_terrain || waypoint.position.y > 0) && !this.getWaypointAt(waypoint.position.copy(Direction.Up))) {
                waypoint.form += 1;
            }
            if ((!use_terrain || waypoint.position.x < this.map.width - 1) && !this.getWaypointAt(waypoint.position.copy(Direction.Right))) {
                waypoint.form += 2;
            }
            if ((!use_terrain || waypoint.position.y < this.map.height - 1) && !this.getWaypointAt(waypoint.position.copy(Direction.Down))) {
                waypoint.form += 4;
            }
            if ((!use_terrain || waypoint.position.x > 0) && !this.getWaypointAt(waypoint.position.copy(Direction.Left))) {
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
    Entity.prototype.updateState = function (state, show) {
        this.state = state;
        var show_icon = (show && state == EntityState.Moved);
        this.icon_moved.x = this.sprite.x + AncientEmpires.TILE_SIZE - 7;
        this.icon_moved.y = this.sprite.y + AncientEmpires.TILE_SIZE - 7;
        this.icon_moved.visible = show_icon;
        this.icon_moved.bringToTop();
    };
    Entity.prototype.getMovement = function () {
        // if poisoned, less -> apply here
        return this.data.mov;
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
        this.content_graphics = this.group.game.add.graphics(0, 0, this.content_group);
        this.border_group = this.group.game.add.group();
        this.group.add(this.border_group);
        this.border_group.visible = false;
        this.border_graphics = this.group.game.add.graphics(0, 0, this.border_group);
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
        var width = AEFont.getWidth(AEFontStyle.Normal, max_length) + 31 + 13;
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
        var y = 6;
        var fonts = [];
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var option = _a[_i];
            var text = MenuOptions.getOptionString(option);
            fonts.push(new AEFont(25, y, this.content_group, AEFontStyle.Normal, text));
            y += 13;
        }
        this.fonts = fonts;
        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;
    };
    MenuOptions.prototype.hide = function (animate, destroy_on_finish, update_on_finish) {
        if (animate === void 0) { animate = false; }
        if (destroy_on_finish === void 0) { destroy_on_finish = false; }
        if (update_on_finish === void 0) { update_on_finish = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.closeMenu();
        }
        _super.prototype.hide.call(this, animate, destroy_on_finish, update_on_finish);
    };
    MenuOptions.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(GameContext.Options);
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
        this.pointer.visible = true;
    };
    return MenuOptions;
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
var Notification = (function (_super) {
    __extends(Notification, _super);
    function Notification(group, text, delegate) {
        _super.call(this);
        this.menu_delegate = delegate;
        var width = AEFont.getWidth(AEFontStyle.Normal, text.length);
        this.initialize(width + 30, 29, group, Direction.None, Direction.All, Direction.None);
        this.drawContent(text);
    }
    Notification.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(GameContext.Notification);
        }
        _super.prototype.show.call(this, animate);
    };
    Notification.prototype.updateContent = function (text) {
        var width = AEFont.getWidth(AEFontStyle.Normal, text.length);
        this.updateSize(width + 30, 29, false);
        this.font.setText(text);
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
                this.menu_delegate.closeMenu();
            }
        }
    };
    Notification.prototype.drawContent = function (text) {
        this.font = new AEFont(9, 6, this.content_group, AEFontStyle.Normal, text);
    };
    return Notification;
}(Frame));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsInV0aWwudHMiLCJsb2FkZXIudHMiLCJwbmdsb2FkZXIudHMiLCJtYWlubWVudS50cyIsImdhbWVjb250cm9sbGVyLnRzIiwibWFwLnRzIiwidGlsZW1hbmFnZXIudHMiLCJlbnRpdHltYW5hZ2VyLnRzIiwiZW50aXR5cmFuZ2UudHMiLCJzbW9rZW1hbmFnZXIudHMiLCJzcHJpdGUudHMiLCJzbW9rZS50cyIsImVudGl0eS50cyIsImZyYW1lLnRzIiwiYW5jaWVudGVtcGlyZXMudHMiLCJmcmFtZW1hbmFnZXIudHMiLCJpbnB1dC50cyIsIm1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSyxXQUlKO0FBSkQsV0FBSyxXQUFXO0lBQ1osaURBQU0sQ0FBQTtJQUNOLDZDQUFJLENBQUE7SUFDSiwrQ0FBSyxDQUFBO0FBQ1QsQ0FBQyxFQUpJLFdBQVcsS0FBWCxXQUFXLFFBSWY7QUFDRDtJQXdESSxnQkFBWSxDQUFTLEVBQUUsQ0FBUyxFQUFFLEtBQW1CLEVBQUUsS0FBa0IsRUFBRSxJQUFhO1FBQ3BGLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDdkIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUF4RE0sZUFBUSxHQUFmLFVBQWdCLEtBQWtCLEVBQUUsTUFBYztRQUM5QyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDOUIsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7UUFDdEIs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QUFJLElBQUksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDMUMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzVDLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FB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QUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDaEIsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNPLDhCQUFjLEdBQXRCO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDalEsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDTywyQkFBVyxHQUFuQjtRQUNJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7WUFDakMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDbkIsQ0FBQztJQUNMLENBQUM7SUFoZE0saUJBQVcsR0FBVyxFQUFFLENBQUM7SUFDekIsZ0JBQVUsR0FBVyxFQUFFLENBQUM7SUFnZG5DLFlBQUM7QUFBRCxDQWxkQSxBQWtkQyxJQUFBOztBQ3JlRCwyQ0FBMkM7QUFDM0MsZ0NBQWdDO0FBQ2hDLGtDQUFrQztBQUNsQyxxQ0FBcUM7QUFDckMsb0NBQW9DO0FBQ3BDLDBDQUEwQztBQUMxQywrQkFBK0I7QUFDL0IsdUNBQXVDO0FBQ3ZDLHlDQUF5QztBQUN6Qyx1Q0FBdUM7QUFDdkMsd0NBQXdDO0FBQ3hDLGtDQUFrQztBQUNsQyxpQ0FBaUM7QUFDakMsa0NBQWtDO0FBQ2xDLGlDQUFpQztBQUNqQyxrQ0FBa0M7QUFDbEM7SUFzQkksd0JBQVksTUFBYztRQUgxQixVQUFLLEdBQVcsR0FBRyxDQUFDO1FBQ3BCLFdBQU0sR0FBWSxHQUFHLENBQUM7UUFHbEIsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUM7UUFDL0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBRXZDLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JELGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3pELGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXZELGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUU5QyxDQUFDO0lBaENNLHdCQUFTLEdBQVcsRUFBRSxDQUFDO0lBR3ZCLGtDQUFtQixHQUFHLEVBQUUsQ0FBQztJQUN6QixpQ0FBa0IsR0FBRyxDQUFDLENBQUM7SUFDdkIsbUNBQW9CLEdBQUcsQ0FBQyxDQUFDO0lBQ3pCLDBCQUFXLEdBQUcsQ0FBQyxDQUFDO0lBRWhCLDhCQUFlLEdBQVcsRUFBRSxDQUFDO0lBMkJ4QyxxQkFBQztBQUFELENBckNBLEFBcUNDLElBQUE7O0FDckREO0lBR0k7UUFDSSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBQ0QsK0JBQVEsR0FBUixVQUFTLEtBQVk7UUFDakIsS0FBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUNELGtDQUFXLEdBQVgsVUFBWSxLQUFZO1FBQ3BCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMxQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDekIsS0FBSyxDQUFDO1lBQ1YsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBQ0QsNkJBQU0sR0FBTixVQUFPLEtBQWE7UUFDaEIsR0FBRyxDQUFDLENBQWMsVUFBVyxFQUFYLEtBQUEsSUFBSSxDQUFDLE1BQU0sRUFBWCxjQUFXLEVBQVgsSUFBVyxDQUFDO1lBQXpCLElBQUksS0FBSyxTQUFBO1lBQ1YsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN2QjtJQUNMLENBQUM7SUFDRCx1Q0FBZ0IsR0FBaEIsVUFBaUIsS0FBWTtRQUN6QixJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFDTCxtQkFBQztBQUFELENBMUJBLEFBMEJDLElBQUE7O0FDMUJELElBQUssR0FRSjtBQVJELFdBQUssR0FBRztJQUNKLDZCQUFRLENBQUE7SUFDUix5QkFBTSxDQUFBO0lBQ04sK0JBQVMsQ0FBQTtJQUNULDZCQUFRLENBQUE7SUFDUiw2QkFBUSxDQUFBO0lBQ1IsZ0NBQVUsQ0FBQTtJQUNWLDRCQUFRLENBQUE7QUFDWixDQUFDLEVBUkksR0FBRyxLQUFILEdBQUcsUUFRUDtBQUFBLENBQUM7QUFDRjtJQVlJLGVBQVksS0FBbUI7UUFFM0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBRXpCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN4RCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDOUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFFRCw0QkFBWSxHQUFaLFVBQWEsR0FBUTtRQUNqQixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsK0JBQWUsR0FBZixVQUFnQixHQUFRO1FBQ3BCLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDMUIsQ0FBQztJQUVELHNCQUFNLEdBQU47UUFDSSxJQUFJLFlBQVksR0FBUSxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ2pDLFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzRCxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakUsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQy9ELFlBQVksSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvRCxZQUFZLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakUsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdELElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBQ2xDLENBQUM7SUFDTyxzQkFBTSxHQUFkLFVBQWUsR0FBUSxFQUFFLEdBQVk7UUFDakMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDbEQsQ0FBQztJQUNPLDZCQUFhLEdBQXJCLFVBQXNCLEdBQVE7UUFDMUIsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNPLHlCQUFTLEdBQWpCLFVBQWtCLEdBQVEsRUFBRSxPQUFnQjtRQUN4QyxFQUFFLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0wsWUFBQztBQUFELENBckRBLEFBcURDLElBQUE7Ozs7Ozs7QUM5REQ7SUFBMkIsZ0NBQUs7SUFNNUIsc0JBQVksS0FBbUI7UUFDM0IsaUJBQU8sQ0FBQztRQUVSLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakgsZUFBZTtRQUNmLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBQ0Qsb0NBQWEsR0FBYixVQUFjLFFBQWtCLEVBQUUsSUFBWTtRQUMxQyxpQ0FBaUM7UUFFakMsSUFBSSxLQUFhLENBQUM7UUFDbEIsSUFBSSxLQUFhLENBQUM7UUFDbEIsSUFBSSxDQUFTLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDNUIsS0FBSyxHQUFHLFFBQVEsQ0FBQztZQUNqQixLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ1YsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEtBQUssR0FBRyxRQUFRLENBQUM7WUFDakIsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNWLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUU3QixJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFDTyxrQ0FBVyxHQUFuQjtRQUNJLHlDQUF5QztRQUV6QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFNUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2xFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3JGLElBQUksU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUUvRSxDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQXBEQSxBQW9EQyxDQXBEMEIsS0FBSyxHQW9EL0I7QUFFRDtJQUEwQiwrQkFBSztJQUszQixxQkFBWSxLQUFtQjtRQUMzQixpQkFBTyxDQUFDO1FBRVIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqSCxlQUFlO1FBQ2YsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFDRCxtQ0FBYSxHQUFiLFVBQWMsUUFBYSxFQUFFLEdBQVEsRUFBRSxNQUFjO1FBQ2pELGlDQUFpQztRQUVqQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM1QyxJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLFlBQVksR0FBYSxRQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEdBQWEsUUFBUyxDQUFDLENBQUM7WUFDbkUsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDakMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekMsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RSxDQUFDO1FBRUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUVwRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDMUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNsRSxDQUFDO1lBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUNyQyxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7UUFDcEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDeEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLENBQUM7SUFFTCxDQUFDO0lBQ08saUNBQVcsR0FBbkI7UUFDSSx5Q0FBeUM7UUFFekMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzRSxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNyQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsY0FBYyxDQUFDLFNBQVMsR0FBRyxDQUFDLEVBQUUsY0FBYyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUV6RixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNyRixJQUFJLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLENBQUMsU0FBUyxHQUFHLENBQUMsRUFBRSxjQUFjLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRS9CLElBQUksUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUV4QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0UsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDOUYsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBRXJDLENBQUM7SUFDTCxrQkFBQztBQUFELENBaEVBLEFBZ0VDLENBaEV5QixLQUFLLEdBZ0U5QjtBQUNELElBQUssTUFhSjtBQWJELFdBQUssTUFBTTtJQUNQLG1DQUFJLENBQUE7SUFDSiw2Q0FBUyxDQUFBO0lBQ1QsbUNBQUksQ0FBQTtJQUNKLHVDQUFNLENBQUE7SUFDTixpQ0FBRyxDQUFBO0lBQ0gsMkNBQVEsQ0FBQTtJQUNSLHVDQUFNLENBQUE7SUFDTiwyQ0FBUSxDQUFBO0lBQ1IsdUNBQU0sQ0FBQTtJQUNOLHFDQUFLLENBQUE7SUFDTCxrQ0FBRyxDQUFBO0lBQ0gsOENBQVMsQ0FBQTtBQUNiLENBQUMsRUFiSSxNQUFNLEtBQU4sTUFBTSxRQWFWO0FBQ0Q7SUFBMEIsK0JBQUs7SUFtQjNCLHFCQUFhLEtBQW1CLEVBQUUsS0FBZ0IsRUFBRSxPQUFpQixFQUFFLFFBQXNCO1FBQ3pGLGlCQUFPLENBQUM7UUFFUixJQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQTtRQUU3QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUVsQixJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDbkIsR0FBRyxDQUFDLENBQWUsVUFBWSxFQUFaLEtBQUEsSUFBSSxDQUFDLE9BQU8sRUFBWixjQUFZLEVBQVosSUFBWSxDQUFDO1lBQTNCLElBQUksTUFBTSxTQUFBO1lBQ1gsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzdCLENBQUM7U0FDSjtRQUNELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFDM0MsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUM7UUFFdEUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU1RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQTVCTSw4QkFBa0IsR0FBekI7UUFDSSxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUNNLDJCQUFlLEdBQXRCLFVBQXVCLE1BQWM7UUFDakMsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUFDLENBQUM7UUFDekMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFZLE1BQU0sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUF1QkQsaUNBQVcsR0FBWDtRQUNJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNWLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztRQUN6QixHQUFHLENBQUMsQ0FBZSxVQUFZLEVBQVosS0FBQSxJQUFJLENBQUMsT0FBTyxFQUFaLGNBQVksRUFBWixJQUFZLENBQUM7WUFBM0IsSUFBSSxNQUFNLFNBQUE7WUFDWCxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM1RSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ1g7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUVuQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztJQUUxQixDQUFDO0lBQ0QsMEJBQUksR0FBSixVQUFLLE9BQXdCLEVBQUUsaUJBQWtDLEVBQUUsZ0JBQWlDO1FBQS9GLHVCQUF3QixHQUF4QixlQUF3QjtRQUFFLGlDQUFrQyxHQUFsQyx5QkFBa0M7UUFBRSxnQ0FBaUMsR0FBakMsd0JBQWlDO1FBQ2hHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUM7UUFBQyxDQUFDO1FBQzdELGdCQUFLLENBQUMsSUFBSSxZQUFDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFDRCwwQkFBSSxHQUFKLFVBQUssT0FBd0I7UUFBeEIsdUJBQXdCLEdBQXhCLGVBQXdCO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDL0UsZ0JBQUssQ0FBQyxJQUFJLFlBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELDBCQUFJLEdBQUo7UUFDSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDdkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDdEIsQ0FBQztJQUNMLENBQUM7SUFDRCwwQkFBSSxHQUFKO1FBQ0ksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUM1QyxDQUFDO0lBQ0wsQ0FBQztJQUNELGlDQUFXLEdBQVg7UUFDSSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUNELDRCQUFNLEdBQU4sVUFBTyxLQUFhO1FBQ2hCLGdCQUFLLENBQUMsTUFBTSxZQUFDLEtBQUssQ0FBQyxDQUFDO1FBRXBCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7WUFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUNoRCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztJQUNoQyxDQUFDO0lBQ0wsa0JBQUM7QUFBRCxDQTVGQSxBQTRGQyxDQTVGeUIsS0FBSyxHQTRGOUI7QUFFRDtJQUE0QixpQ0FBSztJQUk3Qix1QkFBYSxLQUFtQjtRQUM1QixpQkFBTyxDQUFDO1FBRVIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RKLGVBQWU7UUFDZixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUNELHFDQUFhLEdBQWIsVUFBYyxRQUFrQjtRQUM1QixHQUFHLENBQUMsQ0FBYyxVQUFrQixFQUFsQixLQUFBLElBQUksQ0FBQyxhQUFhLEVBQWxCLGNBQWtCLEVBQWxCLElBQWtCLENBQUM7WUFBaEMsSUFBSSxLQUFLLFNBQUE7WUFDVixLQUFLLENBQUMsV0FBVyxDQUFDLGFBQWEsR0FBYSxRQUFTLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZFO0lBQ0wsQ0FBQztJQUNPLG1DQUFXLEdBQW5CO1FBRUksSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFFeEIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBRXRELElBQUksSUFBSSxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdEMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUFDLFFBQVEsQ0FBQztZQUFDLENBQUM7WUFFbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRW5DLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNuRixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuQyxDQUFDO0lBQ0wsQ0FBQztJQUNMLG9CQUFDO0FBQUQsQ0FqQ0EsQUFpQ0MsQ0FqQzJCLEtBQUssR0FpQ2hDO0FBT0Q7SUFBMkIsZ0NBQUs7SUFJNUIsc0JBQWEsS0FBbUIsRUFBRSxJQUFZLEVBQUUsUUFBc0I7UUFDbEUsaUJBQU8sQ0FBQztRQUVSLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDO1FBRTlCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCwyQkFBSSxHQUFKLFVBQUssT0FBd0I7UUFBeEIsdUJBQXdCLEdBQXhCLGVBQXdCO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDcEYsZ0JBQUssQ0FBQyxJQUFJLFlBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNELG9DQUFhLEdBQWIsVUFBYyxJQUFZO1FBQ3RCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBQ1Msc0NBQWUsR0FBekIsVUFBMEIsU0FBeUI7UUFBbkQsaUJBUUM7UUFQRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6QyxVQUFVLENBQUM7Z0JBQ1AsS0FBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUIsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7Z0JBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUFDLENBQUM7UUFDakUsQ0FBQztJQUNMLENBQUM7SUFDTyxrQ0FBVyxHQUFuQixVQUFvQixJQUFZO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0FsQ0EsQUFrQ0MsQ0FsQzBCLEtBQUssR0FrQy9CIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJlbnVtIEFFRm9udFN0eWxlIHtcclxuICAgIE5vcm1hbCxcclxuICAgIEJvbGQsXHJcbiAgICBMYXJnZVxyXG59XHJcbmNsYXNzIEFFRm9udCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB0ZXh0OiBzdHJpbmc7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgbGV0dGVyczogUGhhc2VyLkltYWdlW107XHJcbiAgICBwcml2YXRlIHN0eWxlOiBBRUZvbnRTdHlsZTtcclxuXHJcbiAgICBzdGF0aWMgZ2V0V2lkdGgoc3R5bGU6IEFFRm9udFN0eWxlLCBsZW5ndGg6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChzdHlsZSA9PSBBRUZvbnRTdHlsZS5Ob3JtYWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDYgKiBsZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChzdHlsZSA9PSBBRUZvbnRTdHlsZS5Cb2xkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiA3ICogbGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMTAgKiBsZW5ndGg7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0Rm9udEluZGV4KHN0eWxlOiBBRUZvbnRTdHlsZSwgY2hhcjogbnVtYmVyKTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgaWYgKHN0eWxlID09IEFFRm9udFN0eWxlLkxhcmdlKSB7XHJcbiAgICAgICAgICAgIC8vIGxhcmdlIGZvbnRcclxuICAgICAgICAgICAgaWYgKGNoYXIgPj0gNDggJiYgY2hhciA8PSA1Nykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNoYXIgLSA0ODtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRvbid0IHJlY29nbml6ZSBjaGFyIGNvZGUgXCIgKyBjaGFyICsgXCIgZm9yIGZvbnQgbGFyZ2VcIik7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3R5bGUgPT0gQUVGb250U3R5bGUuTm9ybWFsKSB7XHJcbiAgICAgICAgICAgIC8vIG5vcm1hbCBmb250XHJcbiAgICAgICAgICAgIGlmIChjaGFyID49IDY1ICYmIGNoYXIgPD0gOTApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNjU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNoYXIgPT0gMzIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkRvbid0IHJlY29nbml6ZSBjaGFyIGNvZGUgXCIgKyBjaGFyICsgXCIgZm9yIGZvbnQgbm9ybWFsXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJvbGQgZm9udFxyXG5cclxuICAgICAgICBpZiAoY2hhciA+PSA2NSAmJiBjaGFyIDwgOTApIHsgLy8gY2FwaXRhbCBsZXR0ZXJzIHdpdGhvdXQgWlxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDY1O1xyXG4gICAgICAgIH1lbHNlIGlmIChjaGFyID49IDQ5ICYmIGNoYXIgPD0gNTcpIHsgLy8gYWxsIG51bWJlcnMgd2l0aG91dCAwXHJcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDkgKyAyNztcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0OCkgeyAvLyAwXHJcbiAgICAgICAgICAgIHJldHVybiAxNDsgLy8gcmV0dXJuIE9cclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0NSkgeyAvLyAtXHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0MykgeyAvLyArXHJcbiAgICAgICAgICAgIHJldHVybiAyNjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9uJ3QgcmVjb2duaXplIGNoYXIgY29kZSBcIiArIGNoYXIgKyBcIiBmb3IgZm9udCBib2xkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgc3R5bGU6IEFFRm9udFN0eWxlLCB0ZXh0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxldHRlciBvZiB0aGlzLmxldHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0dGVyLnggPSB4O1xyXG4gICAgICAgICAgICBsZXR0ZXIueSA9IHk7XHJcbiAgICAgICAgICAgIHggKz0gbGV0dGVyLndpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzZXRWaXNpYmlsaXR5KHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBmb3IgKGxldCBsZXR0ZXIgb2YgdGhpcy5sZXR0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldHRlci52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGw6IFBoYXNlci5JbWFnZVtdID0gW107XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLng7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoYXIgPSB0aGlzLnRleHQuY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gQUVGb250LmdldEZvbnRJbmRleCh0aGlzLnN0eWxlLCBjaGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHggKz0gQUVGb250LmdldFdpZHRoKHRoaXMuc3R5bGUsIDEpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmb250X25hbWU6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuTm9ybWFsKSB7XHJcbiAgICAgICAgICAgICAgICBmb250X25hbWUgPSBcImZvbnQ3XCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdHlsZSA9PSBBRUZvbnRTdHlsZS5Cb2xkKSB7XHJcbiAgICAgICAgICAgICAgICBmb250X25hbWUgPSBcImNoYXJzXCI7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zdHlsZSA9PSBBRUZvbnRTdHlsZS5MYXJnZSkge1xyXG4gICAgICAgICAgICAgICAgZm9udF9uYW1lID0gXCJsY2hhcnNcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLmxldHRlcnMuc2hpZnQoKTtcclxuICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBBbmNpZW50RW1waXJlcy5nYW1lLmFkZC5pbWFnZSh4LCB0aGlzLnksIGZvbnRfbmFtZSwgbnVsbCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaW1hZ2UuZnJhbWUgPSBpbmRleDtcclxuICAgICAgICAgICAgbC5wdXNoKGltYWdlKTtcclxuICAgICAgICAgICAgeCArPSBpbWFnZS53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgd2hpbGUgKHRoaXMubGV0dGVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCBsZXR0ZXIgPSB0aGlzLmxldHRlcnMuc2hpZnQoKTtcclxuICAgICAgICAgICAgbGV0dGVyLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sZXR0ZXJzID0gbDtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuY2xhc3MgUG9zIGltcGxlbWVudHMgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIG1hdGNoKHA6IElQb3MpIHtcclxuICAgICAgICByZXR1cm4gKCEhcCAmJiB0aGlzLnggPT0gcC54ICYmIHRoaXMueSA9PSBwLnkpO1xyXG4gICAgfVxyXG4gICAgY29weShkaXJlY3Rpb246IERpcmVjdGlvbiA9IERpcmVjdGlvbi5Ob25lKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55IC0gMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICsgMSwgdGhpcy55KTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55ICsgMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggLSAxLCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMueS0tO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54Kys7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMueSsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLngtLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXREaXJlY3Rpb25UbyAocDogUG9zKTogRGlyZWN0aW9uIHtcclxuICAgICAgICBpZiAocC54ID4gdGhpcy54KSB7IHJldHVybiBEaXJlY3Rpb24uUmlnaHQ7IH1cclxuICAgICAgICBpZiAocC54IDwgdGhpcy54KSB7IHJldHVybiBEaXJlY3Rpb24uTGVmdDsgfVxyXG4gICAgICAgIGlmIChwLnkgPiB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5Eb3duOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMueSkgeyByZXR1cm4gRGlyZWN0aW9uLlVwOyB9XHJcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5Ob25lO1xyXG4gICAgfVxyXG4gICAgZ2V0V29ybGRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICB9XHJcbiAgICBnZXRJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiBcInt4OiBcIiArIHRoaXMueCArIFwiLCB5OiBcIiArIHRoaXMueSArIFwifVwiO1xyXG4gICAgfVxyXG59XHJcbmVudW0gRGlyZWN0aW9uIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgVXAgPSAxLFxyXG4gICAgUmlnaHQgPSAyLFxyXG4gICAgRG93biA9IDQsXHJcbiAgICBMZWZ0ID0gOCxcclxuICAgIEFsbCA9IDE1XHJcbn1cclxuIiwiaW50ZXJmYWNlIERhdGFFbnRyeSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBzaXplOiBudW1iZXI7XHJcbn1cclxuXHJcbmNsYXNzIExvYWRlciBleHRlbmRzIFBoYXNlci5TdGF0ZSB7XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkKCkge1xyXG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLnNwcml0ZXNoZWV0KFwiZm9udDdcIiwgXCJpbWcvZm9udDcucG5nXCIsIDYsIDcpO1xyXG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmJpbmFyeShcImRhdGFcIiwgXCJkYXRhLzEucGFrXCIsIGZ1bmN0aW9uKGtleTogc3RyaW5nLCBkYXRhOiBhbnkpOiBVaW50OEFycmF5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmJpbmFyeShcImxhbmdcIiwgXCJkYXRhL2xhbmcuZGF0XCIsIGZ1bmN0aW9uKGtleTogc3RyaW5nLCBkYXRhOiBhbnkpOiBVaW50OEFycmF5IHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGRhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZSgpIHtcclxuICAgICAgICB0aGlzLnVucGFja1Jlc291cmNlRGF0YSgpO1xyXG4gICAgICAgIHRoaXMubG9hZEVudGl0eURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvYWRNYXBUaWxlc1Byb3AoKTtcclxuICAgICAgICB0aGlzLnVucGFja0xhbmdEYXRhKCk7XHJcblxyXG4gICAgICAgIGxldCB3YWl0ZXIgPSBuZXcgUE5HV2FpdGVyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiTWFpbk1lbnVcIiwgZmFsc2UsIGZhbHNlLCBuYW1lKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidGlsZXMwXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYnVpbGRpbmdzXCIsIDI0LCAyNCwgMywgMCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYnVpbGRpbmdzXCIsIDI0LCAyNCwgMywgMSk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYnVpbGRpbmdzXCIsIDI0LCAyNCwgMywgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc1wiLCAyNCwgMjQsIDAsIDEpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNcIiwgMjQsIDI0LCAwLCAyKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJjdXJzb3JcIiwgMjYsIDI2KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJiX3Ntb2tlXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcIm1lbnVcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwicG9ydHJhaXRcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiY2hhcnNcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwiZ29sZFwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJwb2ludGVyXCIpO1xyXG5cclxuICAgICAgICB3YWl0ZXIuYXdhaXQoKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdW5wYWNrUmVzb3VyY2VEYXRhKCkge1xyXG4gICAgICAgIGxldCBhcnJheTogVWludDhBcnJheSA9IHRoaXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkoXCJkYXRhXCIpO1xyXG4gICAgICAgIGxldCBkYXRhID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDI7IC8vIGRvZXMgbm90IHNlZW0gaW1wb3J0YW50XHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRyaWVzID0gZGF0YS5nZXRVaW50MTYoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDI7XHJcblxyXG4gICAgICAgIGxldCBlbnRyaWVzOiBEYXRhRW50cnlbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRyaWVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN0cl9sZW4gPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzdHJfbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhLmdldFVpbnQ4KGluZGV4KyspKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCArPSA0OyAvLyBkb2VzIG5vdCBzZWVtIGltcG9ydGFudFxyXG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgZW50cmllcy5wdXNoKHtuYW1lOiBuYW1lLCBzaXplOiBzaXplfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRyeV9kYXRhOiBBcnJheUJ1ZmZlciA9IGFycmF5LmJ1ZmZlci5zbGljZShpbmRleCwgaW5kZXggKyBlbnRyeS5zaXplKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmNhY2hlLmFkZEJpbmFyeShlbnRyeS5uYW1lLCBlbnRyeV9kYXRhKTtcclxuICAgICAgICAgICAgaW5kZXggKz0gZW50cnkuc2l6ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRFbnRpdHlEYXRhKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInVuaXRzLmJpblwiKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMgPSBbXTtcclxuICAgICAgICBsZXQgbmFtZXMgPSBbXCJTb2xkaWVyXCIsIFwiQXJjaGVyXCIsIFwiTGl6YXJkXCIsIFwiV2l6YXJkXCIsIFwiV2lzcFwiLCBcIlNwaWRlclwiLCBcIkdvbGVtXCIsIFwiQ2F0YXB1bHRcIiwgXCJXeXZlcm5cIiwgXCJLaW5nXCIsIFwiU2tlbGV0b25cIl07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVudGl0eTogRW50aXR5RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldLFxyXG4gICAgICAgICAgICAgICAgbW92OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgYXRrOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgZGVmOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWluOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgY29zdDogZGF0YS5nZXRVaW50MTYoaW5kZXgpLFxyXG4gICAgICAgICAgICAgICAgYmF0dGxlX3Bvc2l0aW9uczogW10sXHJcbiAgICAgICAgICAgICAgICBmbGFnczogRW50aXR5RmxhZ3MuTm9uZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgbGV0IG51bWJlcl9wb3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9wb3M7IGorKykge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmJhdHRsZV9wb3NpdGlvbnMucHVzaCh7eDogZGF0YS5nZXRVaW50OChpbmRleCsrKSwgeTogZGF0YS5nZXRVaW50OChpbmRleCsrKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBudW1iZXJfZmxhZ3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9mbGFnczsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuZmxhZ3MgfD0gMSA8PCBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLnB1c2goZW50aXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRNYXBUaWxlc1Byb3AoKSB7XHJcbiAgICAgICAgbGV0IGJ1ZmZlcjogQXJyYXlCdWZmZXIgPSB0aGlzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KFwidGlsZXMwLnByb3BcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0OyAvLyAyIGFyZSB1bnJlbGV2YW50XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AucHVzaCg8VGlsZT4gZGF0YS5nZXRVaW50OChpbmRleCsrKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHByaXZhdGUgdW5wYWNrTGFuZ0RhdGEoKSB7XHJcbiAgICAgICAgbGV0IGFycmF5OiBVaW50OEFycmF5ID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcImxhbmdcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBudW1iZXIgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuTEFORyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcjsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkxBTkcucHVzaCh0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFBOR1dhaXRlciB7XHJcblxyXG4gICAgYXdhaXRpbmc6IGJvb2xlYW47XHJcbiAgICBjb3VudGVyOiBudW1iZXI7XHJcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XHJcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cclxuICAgIH1cclxuICAgIGF3YWl0KCkge1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAvLyBpZiBpbWcub25sb2FkIGlzIHN5bmNocm9ub3VzXHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyKys7XHJcbiAgICB9XHJcbiAgICByZXQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyLS07XHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA+IDAgfHwgIXRoaXMuYXdhaXRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG5cclxuICAgIH07XHJcbn1cclxuY2xhc3MgUE5HTG9hZGVyIHtcclxuICAgIHN0YXRpYyBidWZmZXJUb0Jhc2U2NChidWY6IFVpbnQ4QXJyYXkpIHtcclxuICAgICAgICBsZXQgYmluc3RyID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGJ1ZiwgZnVuY3Rpb24gKGNoOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY2gpO1xyXG4gICAgICAgIH0pLmpvaW4oXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIGJ0b2EoYmluc3RyKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbG9hZFNwcml0ZVNoZWV0KHdhaXRlcjogUE5HV2FpdGVyLCBuYW1lOiBzdHJpbmcsIHRpbGVfd2lkdGg/OiBudW1iZXIsIHRpbGVfaGVpZ2h0PzogbnVtYmVyLCBudW1iZXJfb2ZfdGlsZXM/OiBudW1iZXIsIHZhcmlhdGlvbj86IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgc3ByaXRlc2hlZXRfbmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiB0aWxlX2hlaWdodCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBcIi5zcHJpdGVcIik7XHJcbiAgICAgICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikgeyBudW1iZXJfb2ZfdGlsZXMgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiKSB7IHRpbGVfd2lkdGggPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV9oZWlnaHQgPT0gXCJ1bmRlZmluZWRcIikgeyB0aWxlX2hlaWdodCA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KG5hbWUgKyBcIi5wbmdcIikpIHtcclxuICAgICAgICAgICAgLy8gYWxsIHRpbGVzIGFyZSBpbiBvbmUgZmlsZVxyXG4gICAgICAgICAgICBsZXQgcG5nX2J1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgXCIucG5nXCIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhcmlhdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlc2hlZXRfbmFtZSArPSBcIl9cIiArIHZhcmlhdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICAgICAgd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBpbWcsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgUE5HTG9hZGVyLmJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHBuZ19idWZmZXIpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGlsZXMgYXJlIGluIG11bHRpcGxlIGZpbGVzIHdpdGggbmFtZXMgbmFtZV8wMC5wbmcsIG5hbWVfMDEucG5nLCAuLi5cclxuXHJcbiAgICAgICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICAgICAgbGV0IGlubmVyX3dhaXRlciA9IG5ldyBQTkdXYWl0ZXIod2FpdGVyLnJldCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3F1YXJlID0gTWF0aC5jZWlsKE1hdGguc3FydChudW1iZXJfb2ZfdGlsZXMpKTtcclxuICAgICAgICAgICAgbGV0IHNwcml0ZXNoZWV0ID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuYml0bWFwRGF0YShzcXVhcmUgKiB0aWxlX3dpZHRoLCBzcXVhcmUgKiB0aWxlX2hlaWdodCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX3RpbGVzOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZHg6IHN0cmluZyA9IGkgPCAxMCA/IChcIl8wXCIgKyBpKSA6IChcIl9cIiArIGkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIGlkeCArIFwiLnBuZ1wiKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0X25hbWUgKz0gXCJfXCIgKyB2YXJpYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbm5lcl93YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0LmN0eC5kcmF3SW1hZ2UoaW1nLCAoaSAlIHNxdWFyZSkgKiB0aWxlX3dpZHRoLCBNYXRoLmZsb29yKGkgLyBzcXVhcmUpICogdGlsZV9oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyX3dhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBQTkdMb2FkZXIuYnVmZmVyVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkocG5nX2J1ZmZlcikpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlubmVyX3dhaXRlci5hd2FpdCgpO1xyXG5cclxuICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBzcHJpdGVzaGVldC5jYW52YXMsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0LCBudW1iZXJfb2ZfdGlsZXMpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvYWRJbWFnZSh3YWl0ZXI6IFBOR1dhaXRlciwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIFwiLnBuZ1wiKTtcclxuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmFkZEltYWdlKG5hbWUsIG51bGwsIGltZyk7XHJcbiAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIFBOR0xvYWRlci5idWZmZXJUb0Jhc2U2NChuZXcgVWludDhBcnJheShwbmdfYnVmZmVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNyZWF0ZVZhcmlhdGlvbihidWZmZXI6IEFycmF5QnVmZmVyLCB2YXJpYXRpb24/OiBudW1iZXIpOiBBcnJheUJ1ZmZlciB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uID09IFwidW5kZWZpbmVkXCIpIHsgcmV0dXJuIGJ1ZmZlcjsgfVxyXG5cclxuICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCk7IC8vIGNvcHkgYnVmZmVyIChvdGhlcndpc2Ugd2UgbW9kaWZ5IG9yaWdpbmFsIGRhdGEsIHNhbWUgYXMgaW4gY2FjaGUpXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBsZXQgc3RhcnRfcGx0ZSA9IDA7XHJcblxyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGRhdGEuYnl0ZUxlbmd0aCAtIDM7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuZ2V0VWludDgoaW5kZXgpICE9IDgwIHx8IGRhdGEuZ2V0VWludDgoaW5kZXggKyAxKSAhPSA3NiB8fCBkYXRhLmdldFVpbnQ4KGluZGV4ICsgMikgIT0gODQpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgc3RhcnRfcGx0ZSA9IGluZGV4IC0gNDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gc3RhcnRfcGx0ZTtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aF9wbHRlID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGxldCBjcmMgPSAtMTsgLy8gMzIgYml0XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGluZGV4ICsgaSksIGNyYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBpbmRleDsgaSA8IGluZGV4ICsgbGVuZ3RoX3BsdGU7IGkgKz0gMykge1xyXG4gICAgICAgICAgICBsZXQgcmVkOiBudW1iZXIgPSBkYXRhLmdldFVpbnQ4KGkpO1xyXG4gICAgICAgICAgICBsZXQgZ3JlZW46IG51bWJlciA9IGRhdGEuZ2V0VWludDgoaSArIDEpO1xyXG4gICAgICAgICAgICBsZXQgYmx1ZTogbnVtYmVyID0gZGF0YS5nZXRVaW50OChpICsgMik7XHJcblxyXG4gICAgICAgICAgICBpZiAoYmx1ZSA+IHJlZCAmJiBibHVlID4gZ3JlZW4pIHtcclxuICAgICAgICAgICAgICAgIC8vIGJsdWUgY29sb3JcclxuICAgICAgICAgICAgICAgIGlmICh2YXJpYXRpb24gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0byByZWQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG1wID0gcmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHRtcDtcclxuICAgICAgICAgICAgICAgICAgICBncmVlbiAvPSAyO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHZhcmlhdGlvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVjb2xvcml6ZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBibHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpLCByZWQpO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMSwgZ3JlZW4pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMiwgYmx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAxKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAyKSwgY3JjKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY3JjIGZpZWxkXHJcbiAgICAgICAgY3JjIF49IC0xO1xyXG4gICAgICAgIGxldCBpbmRleF9jcmMgPSBzdGFydF9wbHRlICsgOCArIGxlbmd0aF9wbHRlO1xyXG4gICAgICAgIGRhdGEuc2V0VWludDMyKGluZGV4X2NyYywgY3JjKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyB1cGRhdGVQTkdDUkModmFsdWU6IG51bWJlciwgY3JjOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGNyYyBePSB2YWx1ZSAmIDI1NTsgLy8gYml0d2lzZSBvciAod2l0aG91dCBhbmQpXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKChjcmMgJiAxKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjcmMgPSBjcmMgPj4+IDEgXiAtMzA2Njc0OTEyO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3JjID4+Pj0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNyYztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidmVuZG9yL3BoYXNlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFuY2llbnRlbXBpcmVzLnRzXCIgLz5cclxuY2xhc3MgTWFpbk1lbnUgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZSAoKSB7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwKFwiczBcIik7XHJcbiAgICB9XHJcblxyXG4gICAgbG9hZE1hcCAobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiR2FtZVwiLCBmYWxzZSwgZmFsc2UsIG5hbWUpO1xyXG4gICAgfVxyXG59XHJcbiIsImVudW0gR2FtZUNvbnRleHQge1xyXG4gICAgTm90aWZpY2F0aW9uLFxyXG4gICAgTWVudSxcclxuICAgIFNob3AsXHJcbiAgICBPcHRpb25zLFxyXG4gICAgTWFwLFxyXG4gICAgU2VsZWN0aW9uXHJcbn1cclxuY2xhc3MgR2FtZUNvbnRyb2xsZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUgaW1wbGVtZW50cyBFbnRpdHlNYW5hZ2VyRGVsZWdhdGUsIE1lbnVEZWxlZ2F0ZSB7XHJcblxyXG4gICAga2V5czogSW5wdXQ7XHJcbiAgICBtYXA6IE1hcDtcclxuXHJcbiAgICB0aWxlX21hbmFnZXI6IFRpbGVNYW5hZ2VyO1xyXG4gICAgZW50aXR5X21hbmFnZXI6IEVudGl0eU1hbmFnZXI7XHJcbiAgICBzbW9rZV9tYW5hZ2VyOiBTbW9rZU1hbmFnZXI7XHJcbiAgICBmcmFtZV9tYW5hZ2VyOiBGcmFtZU1hbmFnZXI7XHJcblxyXG4gICAgZnJhbWVfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGZyYW1lX2dvbGRfaW5mbzogTWVudUdvbGRJbmZvO1xyXG4gICAgZnJhbWVfZGVmX2luZm86IE1lbnVEZWZJbmZvO1xyXG5cclxuICAgIHR1cm46IEFsbGlhbmNlO1xyXG4gICAgZ29sZDogbnVtYmVyW107XHJcblxyXG4gICAgY3Vyc29yOiBTcHJpdGU7XHJcblxyXG5cclxuICAgIGFjYzogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgY3Vyc29yX3RhcmdldDogUG9zO1xyXG4gICAgcHJpdmF0ZSBsYXN0X2N1cnNvcl9wb3NpdGlvbjogUG9zO1xyXG5cclxuICAgIHByaXZhdGUgYW5pbV9jdXJzb3Jfc3RhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgYW5pbV9jdXJzb3Jfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgb3B0aW9uc19tZW51OiBNZW51T3B0aW9ucztcclxuXHJcbiAgICBwcml2YXRlIGFjdGl2ZV9hY3Rpb246IEFjdGlvbjtcclxuICAgIHByaXZhdGUgc2VsZWN0ZWRfZW50aXR5OiBFbnRpdHk7XHJcblxyXG4gICAgcHJpdmF0ZSBjdXJyZW50X2NvbnRleHQ6IEdhbWVDb250ZXh0O1xyXG4gICAgcHJpdmF0ZSBsYXN0X2NvbnRleHQ6IEdhbWVDb250ZXh0O1xyXG5cclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKG5hbWUpO1xyXG4gICAgICAgIHRoaXMua2V5cyA9IG5ldyBJbnB1dCh0aGlzLmdhbWUuaW5wdXQpO1xyXG5cclxuICAgICAgICB0aGlzLnR1cm4gPSBBbGxpYW5jZS5CbHVlO1xyXG4gICAgICAgIHRoaXMuZ29sZCA9IFtdO1xyXG5cclxuICAgICAgICBpZiAobmFtZS5jaGFyQXQoMCkgPT0gXCJzXCIpIHtcclxuICAgICAgICAgICAgdGhpcy5nb2xkWzBdID0gMTAwMDtcclxuICAgICAgICAgICAgdGhpcy5nb2xkWzFdID0gMTAwMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmdvbGRbMF0gPSAzMDA7XHJcbiAgICAgICAgICAgIHRoaXMuZ29sZFsxXSA9IDMwMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyA9IDA7XHJcbiAgICB9XHJcbiAgICBjcmVhdGUoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aWxlbWFwID0gdGhpcy5nYW1lLmFkZC50aWxlbWFwKCk7XHJcbiAgICAgICAgbGV0IHRpbGVtYXBfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IHNtb2tlX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBzZWxlY3Rpb25fZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGVudGl0eV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgaW50ZXJhY3Rpb25fZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGN1cnNvcl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmZyYW1lX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKHRoaXMubWFwLCB0aWxlbWFwLCB0aWxlbWFwX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5zbW9rZV9tYW5hZ2VyID0gbmV3IFNtb2tlTWFuYWdlcih0aGlzLm1hcCwgc21va2VfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyID0gbmV3IEVudGl0eU1hbmFnZXIodGhpcy5tYXAsIGVudGl0eV9ncm91cCwgc2VsZWN0aW9uX2dyb3VwLCBpbnRlcmFjdGlvbl9ncm91cCwgdGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlciA9IG5ldyBGcmFtZU1hbmFnZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIuZHJhdygpO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvID0gbmV3IE1lbnVEZWZJbmZvKHRoaXMuZnJhbWVfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLmZyYW1lX2RlZl9pbmZvKTtcclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnNob3codHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuY3JlYXRlRW50aXR5KEVudGl0eVR5cGUuU29sZGllciwgQWxsaWFuY2UuUmVkLCBuZXcgUG9zKDQsIDEzKSk7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X21hbmFnZXIuZ2V0S2luZ1Bvc2l0aW9uKEFsbGlhbmNlLkJsdWUpO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gbmV3IFNwcml0ZSh0aGlzLmN1cnNvcl90YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpLCBjdXJzb3JfZ3JvdXAsIFwiY3Vyc29yXCIsIFswLCAxXSk7XHJcbiAgICAgICAgdGhpcy5jdXJzb3Iuc2V0T2Zmc2V0KC0xLCAtMSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLnggPSB0aGlzLmdldE9mZnNldFgodGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEueSA9IHRoaXMuZ2V0T2Zmc2V0WSh0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50X2NvbnRleHQgPSBHYW1lQ29udGV4dC5NYXA7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhcnRUdXJuKEFsbGlhbmNlLkJsdWUpO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dNZXNzYWdlKFwiR0FNRSBMT0FERURcIik7XHJcblxyXG4gICAgfVxyXG4gICAgc2hvd01lc3NhZ2UodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSBuZXcgTm90aWZpY2F0aW9uKHRoaXMuZnJhbWVfZ3JvdXAsIHRleHQsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZShtZW51KTtcclxuICAgICAgICBtZW51LnNob3codHJ1ZSk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gMSBzdGVwIGlzIDEvNjAgc2VjXHJcblxyXG4gICAgICAgIHRoaXMuYWNjICs9IHRoaXMudGltZS5lbGFwc2VkO1xyXG4gICAgICAgIGxldCBzdGVwcyA9IE1hdGguZmxvb3IodGhpcy5hY2MgLyAxNik7XHJcbiAgICAgICAgaWYgKHN0ZXBzIDw9IDApIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5hY2MgLT0gc3RlcHMgKiAxNjtcclxuICAgICAgICBpZiAoc3RlcHMgPiAyKSB7IHN0ZXBzID0gMjsgfVxyXG5cclxuICAgICAgICB0aGlzLmtleXMudXBkYXRlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FwdHVyZUlucHV0KCk7XHJcblxyXG4gICAgICAgIGxldCBjdXJzb3JfcG9zaXRpb24gPSB0aGlzLmN1cnNvcl90YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgIGxldCBkaWZmX3ggPSBjdXJzb3JfcG9zaXRpb24ueCAtIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLng7XHJcbiAgICAgICAgbGV0IGRpZmZfeSA9IGN1cnNvcl9wb3NpdGlvbi55IC0gdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgbGV0IGR4ID0gMDtcclxuICAgICAgICBsZXQgZHkgPSAwO1xyXG5cclxuICAgICAgICBpZiAoZGlmZl94ICE9IDApIHtcclxuICAgICAgICAgICAgZHggPSBNYXRoLmZsb29yKGRpZmZfeCAvIDQpO1xyXG4gICAgICAgICAgICBpZiAoZHggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWF4KGR4LCAtNCk7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWluKGR4LCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWluKGR4LCA0KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oe3g6IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggKyBkeCwgeTogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueSArIGR5fSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaWZmX3kgIT0gMCkge1xyXG4gICAgICAgICAgICBkeSA9IE1hdGguZmxvb3IoZGlmZl95IC8gNCk7XHJcbiAgICAgICAgICAgIGlmIChkeSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIC00KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIDQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2V0V29ybGRQb3NpdGlvbih7eDogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCArIGR4LCB5OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55ICsgZHl9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5jdXJzb3JfdGFyZ2V0Lm1hdGNoKHRoaXMubGFzdF9jdXJzb3JfcG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFzdF9jdXJzb3JfcG9zaXRpb24gPSB0aGlzLmN1cnNvcl90YXJnZXQuY29weSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gdXBkYXRlIGRlZiBpbmZvXHJcbiAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEVudGl0eUF0KHRoaXMuY3Vyc29yX3RhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlQ29udGVudCh0aGlzLmN1cnNvcl90YXJnZXQsIHRoaXMubWFwLCBlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8vIGlucHV0XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICBpZiAoISF0aGlzLm9wdGlvbnNfbWVudSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyA+IDMwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyAtPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSA9IDEgLSB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRGcmFtZSh0aGlzLmFuaW1fY3Vyc29yX3N0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIHRoaXMuc21va2VfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnVwZGF0ZShzdGVwcywgdGhpcy5jdXJzb3JfdGFyZ2V0LCB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlKTtcclxuXHJcbiAgICAgICAgbGV0IGZvY3VzX3Bvc2l0aW9uOiBJUG9zO1xyXG4gICAgICAgIGlmICghIXRoaXMuc2VsZWN0ZWRfZW50aXR5KSB7XHJcbiAgICAgICAgICAgIGZvY3VzX3Bvc2l0aW9uID0gdGhpcy5zZWxlY3RlZF9lbnRpdHkud29ybGRfcG9zaXRpb247XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZm9jdXNfcG9zaXRpb24gPSB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXRGb3JQb3NpdGlvbihmb2N1c19wb3NpdGlvbik7XHJcblxyXG4gICAgICAgIGxldCBpbmZvX2lzX3JpZ2h0ID0gKHRoaXMuZnJhbWVfZ29sZF9pbmZvLmFsaWduICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwO1xyXG4gICAgICAgIGlmICghaW5mb19pc19yaWdodCAmJiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54IC0gMSAtIHRoaXMuY2FtZXJhLnggPD0gdGhpcy5nYW1lLndpZHRoIC8gMiAtIDI0IC0gMTIpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5MZWZ0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5SaWdodCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLkxlZnQgfCBEaXJlY3Rpb24uVXAsIERpcmVjdGlvbi5SaWdodCwgdHJ1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpbmZvX2lzX3JpZ2h0ICYmIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggKyAxIC0gdGhpcy5jYW1lcmEueCA+PSB0aGlzLmdhbWUud2lkdGggLyAyICsgMTIpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5MZWZ0LCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5VcCwgRGlyZWN0aW9uLkxlZnQsIHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlPcHRpb25zKGVudGl0eSwgdHJ1ZSk7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoIDwgMSkgeyByZXR1cm47IH1cclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbk1lbnUob3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24ob3B0aW9uc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9wZW5NZW51KGNvbnRleHQ6IEdhbWVDb250ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5sYXN0X2NvbnRleHQgPSB0aGlzLmN1cnJlbnRfY29udGV4dDtcclxuICAgICAgICB0aGlzLmN1cnJlbnRfY29udGV4dCA9IGNvbnRleHQ7XHJcbiAgICB9XHJcbiAgICBjbG9zZU1lbnUoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50X2NvbnRleHQgPSB0aGlzLmxhc3RfY29udGV4dDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdEVudGl0eShlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5lbnRpdHlfbWFuYWdlci5nZXRFbnRpdHlPcHRpb25zKGVudGl0eSwgZmFsc2UpO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbk1lbnUob3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24ob3B0aW9uc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gZW50aXR5O1xyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRlc2VsZWN0RW50aXR5KCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuZGVzZWxlY3RFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG5leHRUdXJuKCkge1xyXG4gICAgICAgIGxldCBuZXh0X3R1cm4gPSBBbGxpYW5jZS5CbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLnR1cm4gPT0gQWxsaWFuY2UuQmx1ZSkge1xyXG4gICAgICAgICAgICBuZXh0X3R1cm4gPSBBbGxpYW5jZS5SZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc3RhcnRUdXJuKG5leHRfdHVybik7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFR1cm4oYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcblxyXG4gICAgICAgIHRoaXMudHVybiA9IGFsbGlhbmNlO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZnJhbWVfZ29sZF9pbmZvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvID0gbmV3IE1lbnVHb2xkSW5mbyh0aGlzLmZyYW1lX2dyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMuZnJhbWVfZ29sZF9pbmZvKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIHRoaXMuZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlKSk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5zdGFydFR1cm4oYWxsaWFuY2UpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGdldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzd2l0Y2ggKGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRbMF07XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuUmVkOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29sZFsxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd09wdGlvbk1lbnUob3B0aW9uczogQWN0aW9uW10pIHtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby5oaWRlKHRydWUpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLmhpZGUodHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbmV3IE1lbnVPcHRpb25zKHRoaXMuZnJhbWVfZ3JvdXAsIERpcmVjdGlvbi5SaWdodCwgb3B0aW9ucywgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMub3B0aW9uc19tZW51KTtcclxuICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5zaG93KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0T3B0aW9uKG9wdGlvbjogQWN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5hY3RpdmVfYWN0aW9uID0gb3B0aW9uO1xyXG4gICAgICAgIHN3aXRjaCAob3B0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9DQ1VQWTpcclxuICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEFsbGlhbmNlQXQodGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb24sIHRoaXMuc2VsZWN0ZWRfZW50aXR5LmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyLmRyYXdUaWxlQXQodGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TWVzc2FnZShcIk9DQ1VQSUVEXCIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkFUVEFDSzpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5BdHRhY2ssIHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5SQUlTRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5SYWlzZSwgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk1PVkU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuTW92ZSwgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkJVWTpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiT3BlbiB0aGUgc2hvcFwiKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FTkRfTU9WRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5LnVwZGF0ZVN0YXRlKEVudGl0eVN0YXRlLk1vdmVkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FTkRfVFVSTjpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoXCJFTkQgVFVSTlwiKTtcclxuICAgICAgICAgICAgICAgIHRoaXMubmV4dFR1cm4oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5DQU5DRUw6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXRGb3JQb3NpdGlvbihwb3NpdGlvbjogSVBvcykge1xyXG4gICAgICAgIGxldCB4ID0gcG9zaXRpb24ueCArIDAuNSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeSA9IHBvc2l0aW9uLnkgKyAwLjUgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KHgsIHkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSB0aGlzLmdldE9mZnNldFgoeCk7XHJcbiAgICAgICAgbGV0IG9mZnNldF95ID0gdGhpcy5nZXRPZmZzZXRZKHkpO1xyXG5cclxuICAgICAgICBsZXQgZGlmZl94ID0gb2Zmc2V0X3ggLSB0aGlzLmNhbWVyYS54O1xyXG4gICAgICAgIGxldCBkaWZmX3kgPSBvZmZzZXRfeSAtIHRoaXMuY2FtZXJhLnk7XHJcblxyXG4gICAgICAgIGlmIChkaWZmX3ggIT0gMCkge1xyXG4gICAgICAgICAgICBsZXQgZHggPSBNYXRoLmZsb29yKGRpZmZfeCAvIDEyKTtcclxuICAgICAgICAgICAgaWYgKGR4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgLTQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1pbihkeCwgLTEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1pbihkeCwgNCk7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWF4KGR4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS54ICs9IGR4O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlmZl95ICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGR5ID0gTWF0aC5mbG9vcihkaWZmX3kgLyAxMik7XHJcbiAgICAgICAgICAgIGlmIChkeSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIC00KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5taW4oZHksIDQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueSArPSBkeTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGdldE9mZnNldFgoeDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSB4IC0gdGhpcy5nYW1lLndpZHRoIC8gMjtcclxuICAgICAgICBpZiAodGhpcy5nYW1lLndpZHRoIDwgdGhpcy53b3JsZC53aWR0aCkge1xyXG4gICAgICAgICAgICBvZmZzZXRfeCA9IE1hdGgubWF4KG9mZnNldF94LCAwKTtcclxuICAgICAgICAgICAgb2Zmc2V0X3ggPSBNYXRoLm1pbihvZmZzZXRfeCwgdGhpcy53b3JsZC53aWR0aCAtIHRoaXMuZ2FtZS53aWR0aCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3ggPSAodGhpcy5nYW1lLndpZHRoIC0gdGhpcy53b3JsZC53aWR0aCkgLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0X3g7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGdldE9mZnNldFkoeTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSB5IC0gdGhpcy5nYW1lLmhlaWdodCAvIDI7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5oZWlnaHQgPCB0aGlzLndvcmxkLmhlaWdodCkge1xyXG4gICAgICAgICAgICBvZmZzZXRfeSA9IE1hdGgubWF4KG9mZnNldF95LCAwKTtcclxuICAgICAgICAgICAgb2Zmc2V0X3kgPSBNYXRoLm1pbihvZmZzZXRfeSwgdGhpcy53b3JsZC5oZWlnaHQgLSB0aGlzLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvZmZzZXRfeSA9ICh0aGlzLmdhbWUuaGVpZ2h0IC0gdGhpcy53b3JsZC5oZWlnaHQpIC8gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldF95O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBjYXB0dXJlSW5wdXQoKSB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmN1cnJlbnRfY29udGV4dCkge1xyXG4gICAgICAgICAgICBjYXNlIEdhbWVDb250ZXh0Lk1hcDpcclxuICAgICAgICAgICAgICAgIGxldCBjdXJzb3Jfc3RpbGwgPSB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54ICUgMjQgPT0gMCAmJiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55ICUgMjQgPT0gMDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5VcCkgJiYgY3Vyc29yX3N0aWxsICYmIHRoaXMuY3Vyc29yX3RhcmdldC55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldC5tb3ZlKERpcmVjdGlvbi5VcCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlJpZ2h0KSAmJiBjdXJzb3Jfc3RpbGwgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnggPCB0aGlzLm1hcC53aWR0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSAmJiBjdXJzb3Jfc3RpbGwgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnkgPCB0aGlzLm1hcC5oZWlnaHQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0Lm1vdmUoRGlyZWN0aW9uLkRvd24pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5MZWZ0KSAmJiBjdXJzb3Jfc3RpbGwgJiYgdGhpcy5jdXJzb3JfdGFyZ2V0LnggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0Lm1vdmUoRGlyZWN0aW9uLkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5FbnRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5FbnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RQb3NpdGlvbih0aGlzLmN1cnNvcl90YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgR2FtZUNvbnRleHQuT3B0aW9uczpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5VcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUucHJldigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkRvd24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51Lm5leHQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKHRoaXMub3B0aW9uc19tZW51LmdldFNlbGVjdGVkKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51LmhpZGUodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdE9wdGlvbihBY3Rpb24uQ0FOQ0VMKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdFBvc2l0aW9uKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZF9lbnRpdHkpIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLmFjdGl2ZV9hY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgQWN0aW9uLk1PVkU6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5tb3ZlRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEVudGl0eUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoISFlbnRpdHkpIHtcclxuICAgICAgICAgICAgLy8gbm8gZW50aXR5IHNlbGVjdGVkLCBjbGlja2VkIG9uIGVudGl0eSAtIHRyeSB0byBzZWxlY3QgaXRcclxuICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0aGlzLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAoc3VjY2VzcykgeyByZXR1cm47IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93T3B0aW9uTWVudShNZW51T3B0aW9ucy5nZXRNYWluTWVudU9wdGlvbnMoKSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBUaWxlIHtcclxuICAgIFBhdGgsXHJcbiAgICBHcmFzcyxcclxuICAgIEZvcmVzdCxcclxuICAgIEhpbGwsXHJcbiAgICBNb3VudGFpbixcclxuICAgIFdhdGVyLFxyXG4gICAgQnJpZGdlLFxyXG4gICAgSG91c2UsXHJcbiAgICBDYXN0bGVcclxufVxyXG5pbnRlcmZhY2UgSUJ1aWxkaW5nIHtcclxuICAgIGNhc3RsZTogYm9vbGVhbjtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbn1cclxuXHJcbmNsYXNzIE1hcCB7XHJcblxyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gICAgc3RhcnRfZW50aXRpZXM6IElFbnRpdHlbXTtcclxuXHJcbiAgICBwcml2YXRlIHRpbGVzOiBUaWxlW11bXTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmdzOiBJQnVpbGRpbmdbXTtcclxuXHJcbiAgICBzdGF0aWMgZ2V0VGlsZUZvckNvZGUoY29kZTogbnVtYmVyKTogVGlsZSB7XHJcbiAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1BbY29kZV07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIHN0YXRpYyBnZXRDb3N0Rm9yVGlsZSh0aWxlOiBUaWxlLCBlbnRpdHk6IEVudGl0eSk6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuV2F0ZXIgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHtcclxuICAgICAgICAgICAgLy8gTGl6YXJkIG9uIHdhdGVyXHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGNvc3QgPSAwO1xyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuTW91bnRhaW4gfHwgdGlsZSA9PSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAzO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCB8fCB0aWxlID09IFRpbGUuSGlsbCkge1xyXG4gICAgICAgICAgICBjb3N0ID0gMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb3N0ID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuTGl6YXJkKSB7XHJcbiAgICAgICAgICAgIC8vIExpemFyZCBmb3IgZXZlcnl0aGluZyBleGNlcHQgd2F0ZXJcclxuICAgICAgICAgICAgcmV0dXJuIGNvc3QgKiAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNvc3Q7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0RGVmRm9yVGlsZSh0aWxlOiBUaWxlLCBlbnRpdHk6IEVudGl0eSk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbiB8fCB0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkgeyByZXR1cm4gMzsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuRm9yZXN0IHx8IHRpbGUgPT0gVGlsZS5IaWxsKSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5XYXRlciAmJiBlbnRpdHkgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHsgcmV0dXJuIDI7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkdyYXNzKSB7IHJldHVybiAxOyB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcclxuICAgICAgICB0aGlzLmxvYWQoKTtcclxuICAgIH1cclxuICAgIGxvYWQoKSB7XHJcbiAgICAgICAgaWYgKCFBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KHRoaXMubmFtZSkpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDb3VsZCBub3QgZmluZCBtYXA6IFwiICsgdGhpcy5uYW1lKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZ3MgPSBbXTtcclxuICAgICAgICB0aGlzLnN0YXJ0X2VudGl0aWVzID0gW107XHJcbiAgICAgICAgdGhpcy50aWxlcyA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KHRoaXMubmFtZSk7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICB0aGlzLndpZHRoID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgdGhpcy50aWxlc1t4XSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBjb2RlID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgICAgIGxldCB0aWxlID0gTWFwLmdldFRpbGVGb3JDb2RlKGNvZGUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlc1t4XVt5XSA9IHRpbGU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1aWxkaW5ncy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzdGxlOiAodGlsZSA9PSBUaWxlLkNhc3RsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBuZXcgUG9zKHgsIHkpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGxpYW5jZTogPEFsbGlhbmNlPiBNYXRoLmZsb29yKChjb2RlIC0gQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTKSAvIDMpXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBza2lwID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQgKyBza2lwICogNDtcclxuXHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRpdGllcyA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRpdGllczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBkZXNjID0gZGF0YS5nZXRVaW50OChpbmRleCsrKTtcclxuICAgICAgICAgICAgbGV0IHR5cGU6IEVudGl0eVR5cGUgPSBkZXNjICUgMTE7XHJcbiAgICAgICAgICAgIGxldCBhbGxpYW5jZTogQWxsaWFuY2UgPSBNYXRoLmZsb29yKGRlc2MgLyAxMSkgKyAxO1xyXG5cclxuICAgICAgICAgICAgbGV0IHggPSBNYXRoLmZsb29yKGRhdGEuZ2V0VWludDE2KGluZGV4KSAvIDE2KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGRhdGEuZ2V0VWludDE2KGluZGV4KSAvIDE2KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRfZW50aXRpZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICAgICAgYWxsaWFuY2U6IGFsbGlhbmNlLFxyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBQb3MoeCwgeSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0VGlsZUF0KHBvc2l0aW9uOiBQb3MpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcclxuICAgIH1cclxuICAgIGdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbjogUG9zKTogVGlsZVtdIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgcG9zaXRpb24ueSA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA8IHRoaXMud2lkdGggLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPCB0aGlzLmhlaWdodCAtIDEgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSkgOiAtMVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChwOiBQb3MpOiBQb3NbXSB7XHJcbiAgICAgICAgbGV0IHJldDogUG9zW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XHJcbiAgICAgICAgaWYgKHAueSA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSAtIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPCB0aGlzLndpZHRoIC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCArIDEsIHAueSkpOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMuaGVpZ2h0IC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCwgcC55ICsgMSkpOyB9XHJcbiAgICAgICAgaWYgKHAueCA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggLSAxLCBwLnkpKTsgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgc2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zLCBhbGxpYW5jZTogQWxsaWFuY2UpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIGJ1aWxkaW5nLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxpYW5jZUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZGluZy5hbGxpYW5jZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQWxsaWFuY2UuTm9uZTtcclxuICAgIH1cclxuICAgIGdldE9jY3VwaWVkSG91c2VzKCk6IElCdWlsZGluZ1tdIHtcclxuICAgICAgICBsZXQgaG91c2VzOiBJQnVpbGRpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKXtcclxuICAgICAgICAgICAgaWYgKCFidWlsZGluZy5jYXN0bGUgJiYgYnVpbGRpbmcuYWxsaWFuY2UgIT0gQWxsaWFuY2UuTm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaG91c2VzLnB1c2goYnVpbGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBob3VzZXM7XHJcbiAgICB9XHJcbiAgICBnZXRTdGFydEVudGl0aWVzKCk6IElFbnRpdHlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhcnRfZW50aXRpZXM7XHJcbiAgICB9XHJcbiAgICBnZXRDb3N0QXQocG9zaXRpb246IFBvcywgZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICByZXR1cm4gTWFwLmdldENvc3RGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxuICAgIGdldERlZkF0KHBvc2l0aW9uOiBQb3MsIGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgcmV0dXJuIE1hcC5nZXREZWZGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxufVxyXG4iLCJlbnVtIEFsbGlhbmNlIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgQmx1ZSA9IDEsXHJcbiAgICBSZWQgPSAyXHJcbn1cclxuY2xhc3MgVGlsZU1hbmFnZXIge1xyXG5cclxuICAgIG1hcDogTWFwO1xyXG4gICAgd2F0ZXJTdGF0ZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICB0aWxlbWFwOiBQaGFzZXIuVGlsZW1hcDtcclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblxyXG4gICAgYmFja2dyb3VuZExheWVyOiBQaGFzZXIuVGlsZW1hcExheWVyO1xyXG4gICAgYnVpbGRpbmdMYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuXHJcbiAgICB3YXRlclRpbWVyOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHN0YXRpYyBkb2VzVGlsZUN1dEdyYXNzKHRpbGU6IFRpbGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRpbGUgPT0gVGlsZS5QYXRoIHx8IHRpbGUgPT0gVGlsZS5XYXRlciB8fCB0aWxlID09IFRpbGUuQnJpZGdlKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0SW1hZ2VJbmRleEZvck9iamVjdFRpbGUodGlsZTogVGlsZSk6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuTW91bnRhaW4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuRm9yZXN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhpbGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0QmFzZUltYWdlSW5kZXhGb3JUaWxlKHRpbGU6IFRpbGUpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAodGlsZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuV2F0ZXI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTk7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5QYXRoOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE4O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gVGlsZU1hbmFnZXIuZ2V0SW1hZ2VJbmRleEZvck9iamVjdFRpbGUodGlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAzO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogTWFwLCB0aWxlbWFwOiBQaGFzZXIuVGlsZW1hcCwgdGlsZW1hcF9ncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwID0gdGlsZW1hcDtcclxuICAgICAgICB0aGlzLmdyb3VwID0gdGlsZW1hcF9ncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcInRpbGVzMFwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgMCk7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcImJ1aWxkaW5nc18wXCIsIG51bGwsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBudWxsLCBudWxsLCBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMpO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMVwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTICsgMyk7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcImJ1aWxkaW5nc18yXCIsIG51bGwsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBudWxsLCBudWxsLCBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMgKyA2KTtcclxuXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIgPSB0aGlzLnRpbGVtYXAuY3JlYXRlKFwiYmFja2dyb3VuZFwiLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIucmVzaXplV29ybGQoKTtcclxuXHJcbiAgICAgICAgdGhpcy5idWlsZGluZ0xheWVyID0gdGhpcy50aWxlbWFwLmNyZWF0ZUJsYW5rTGF5ZXIoXCJidWlsZGluZ1wiLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgdGhpcy5ncm91cCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aGlzLm1hcC53aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5tYXAuaGVpZ2h0OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd1RpbGVBdChuZXcgUG9zKHgsIHkpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLndhdGVyVGltZXIgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMud2F0ZXJUaW1lciA+IDMwKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2F0ZXJUaW1lciA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlV2F0ZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVdhdGVyKCkge1xyXG4gICAgICAgIGxldCBvbGRTdGF0ZSA9IHRoaXMud2F0ZXJTdGF0ZTtcclxuICAgICAgICB0aGlzLndhdGVyU3RhdGUgPSAxIC0gdGhpcy53YXRlclN0YXRlO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVtYXAucmVwbGFjZSgyMSArIG9sZFN0YXRlLCAyMSArIHRoaXMud2F0ZXJTdGF0ZSwgMCwgMCwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXdUaWxlQXQocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5wdXRUaWxlKHRoaXMuZ2V0SW1hZ2VJbmRleEZvckJhY2tncm91bmRBdChwb3NpdGlvbiksIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHRoaXMuYmFja2dyb3VuZExheWVyKTtcclxuICAgICAgICBsZXQgdGlsZSA9IHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IG9iaiA9IFRpbGVNYW5hZ2VyLmdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGUpO1xyXG4gICAgICAgIGlmIChvYmogPj0gMCkge1xyXG4gICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhbGxpYW5jZSA9IHRoaXMubWFwLmdldEFsbGlhbmNlQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgb2JqICs9IGFsbGlhbmNlICogMztcclxuICAgICAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuQ2FzdGxlICYmIHBvc2l0aW9uLnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gcm9vZiBvZiBjYXN0bGVcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZShvYmogKyAxLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSwgdGhpcy5idWlsZGluZ0xheWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZShvYmosIHBvc2l0aW9uLngsIHBvc2l0aW9uLnksIHRoaXMuYnVpbGRpbmdMYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0SW1hZ2VJbmRleEZvckJhY2tncm91bmRBdChwb3NpdGlvbjogUG9zKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgLy8gV2F0ZXJcclxuICAgICAgICAgICAgICAgIHJldHVybiAyMTtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIC8vIEJyaWRnZVxyXG4gICAgICAgICAgICAgICAgbGV0IGFkaiA9IHRoaXMubWFwLmdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBpZiAoYWRqWzBdICE9IFRpbGUuV2F0ZXIgfHwgYWRqWzJdICE9IFRpbGUuV2F0ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMjA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTk7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5QYXRoOlxyXG4gICAgICAgICAgICAgICAgLy8gUGF0aFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE4O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuR3Jhc3M6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEltYWdlSW5kZXhGb3JHcmFzc0F0KHBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDI7XHJcbiAgICB9XHJcbiAgICBnZXRJbWFnZUluZGV4Rm9yR3Jhc3NBdChwb3NpdGlvbjogUG9zKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgYWRqID0gdGhpcy5tYXAuZ2V0QWRqYWNlbnRUaWxlc0F0KHBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgY3V0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkai5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjdXQgKz0gTWF0aC5wb3coMiwgaSkgKiAoVGlsZU1hbmFnZXIuZG9lc1RpbGVDdXRHcmFzcyhhZGpbaV0pID8gMSA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY3V0ID09IDggKyA0ICsgMiArIDEpIHsgcmV0dXJuIDM7IH0gLy8gYWxsIC0gbm90IHN1cHBsaWVkXHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgNCArIDEpIHsgcmV0dXJuIDE2OyB9IC8vIHRvcCBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDQgKyAyKSB7IHJldHVybiAxMDsgfSAvLyByaWdodCBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gNCArIDIgKyAxKSB7IHJldHVybiAxNzsgfSAvLyB0b3AgcmlnaHQgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgMiArIDEpIHsgcmV0dXJuIDE0OyB9IC8vIHRvcCByaWdodCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgOCkgeyByZXR1cm4gMTI7IH0gLy8gdG9wIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQgKyA4KSB7IHJldHVybiA4OyB9IC8vIGJvdHRvbSBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAyICsgNCkgeyByZXR1cm4gOTsgfSAvLyByaWdodCBib3R0b21cclxuICAgICAgICBpZiAoY3V0ID09IDEgKyAyKSB7IHJldHVybiAxMzsgfSAvLyB0b3AgcmlnaHRcclxuICAgICAgICBpZiAoY3V0ID09IDEgKyA0KSB7IHJldHVybiAxNTsgfSAvLyB0b3AgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAyICsgOCkgeyByZXR1cm4gNjsgfSAvLyByaWdodCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA4KSB7IHJldHVybiA0OyB9IC8vIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQpIHsgcmV0dXJuIDc7IH0gLy8gYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAyKSB7IHJldHVybiA1OyB9IC8vIHJpZ2h0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxKSB7IHJldHVybiAxMTsgfSAvLyB0b3BcclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgTGluZVBhcnQge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgbGVuZ3RoOiBudW1iZXI7XHJcbn1cclxuaW50ZXJmYWNlIEVudGl0eU1vdmUge1xyXG4gICAgZW50aXR5OiBFbnRpdHk7XHJcbiAgICB0YXJnZXQ6IFBvcztcclxuICAgIGxpbmU6IExpbmVQYXJ0W107XHJcbiAgICBwcm9ncmVzczogbnVtYmVyO1xyXG59XHJcbmludGVyZmFjZSBFbnRpdHlNYW5hZ2VyRGVsZWdhdGUge1xyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSk6IHZvaWQ7XHJcbn1cclxuXHJcbmNsYXNzIEVudGl0eU1hbmFnZXIge1xyXG5cclxuICAgIHByaXZhdGUgZW50aXRpZXM6IEVudGl0eVtdO1xyXG4gICAgcHJpdmF0ZSBtYXA6IE1hcDtcclxuXHJcbiAgICBwcml2YXRlIG1vdmluZzogRW50aXR5TW92ZTtcclxuXHJcbiAgICBwcml2YXRlIGFuaW1faWRsZV9jb3VudGVyOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFuaW1faWRsZV9zdGF0ZTogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZW50aXR5X2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBpbnRlcmFjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0aW9uX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGludGVyYWN0aW9uX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfcmFuZ2U6IEVudGl0eVJhbmdlO1xyXG5cclxuICAgIHByaXZhdGUgZGVsZWdhdGU6IEVudGl0eU1hbmFnZXJEZWxlZ2F0ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgZW50aXR5X2dyb3VwOiBQaGFzZXIuR3JvdXAsIHNlbGVjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwLCBpbnRlcmFjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlKSB7XHJcblxyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwID0gZW50aXR5X2dyb3VwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyb3VwID0gc2VsZWN0aW9uX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAgPSBpbnRlcmFjdGlvbl9ncm91cDtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzID0gc2VsZWN0aW9uX2dyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHNlbGVjdGlvbl9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyA9IGludGVyYWN0aW9uX2dyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIGludGVyYWN0aW9uX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5tb3ZpbmcgPSBudWxsO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1faWRsZV9jb3VudGVyID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1faWRsZV9zdGF0ZSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgbWFwLmdldFN0YXJ0RW50aXRpZXMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUVudGl0eShlbnRpdHkudHlwZSwgZW50aXR5LmFsbGlhbmNlLCBlbnRpdHkucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UgPSBuZXcgRW50aXR5UmFuZ2UodGhpcy5tYXAsIHRoaXMsIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXApO1xyXG5cclxuICAgIH1cclxuICAgIGNyZWF0ZUVudGl0eSh0eXBlOiBFbnRpdHlUeXBlLCBhbGxpYW5jZTogQWxsaWFuY2UsIHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3IEVudGl0eSh0eXBlLCBhbGxpYW5jZSwgcG9zaXRpb24sIHRoaXMuZW50aXR5X2dyb3VwKSk7XHJcbiAgICB9XHJcbiAgICBnZXRFbnRpdHlBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbnRpdHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRUdXJuKGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmVudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnN0YXRlID09IEVudGl0eVN0YXRlLkRlYWQpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5kZWF0aF9jb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVudGl0eS5kZWF0aF9jb3VudCA+PSBBbmNpZW50RW1waXJlcy5ERUFUSF9DT1VOVCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5zcGxpY2UoaSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zdGF0ZSA9IEVudGl0eVN0YXRlLk1vdmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzaG93ID0gKGVudGl0eS5hbGxpYW5jZSA9PSBhbGxpYW5jZSk7XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGVTdGF0ZShlbnRpdHkuc3RhdGUsIHNob3cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRBdHRhY2tUYXJnZXRzKGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgbGV0IHRhcmdldHM6IEVudGl0eVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW5lbXkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW5lbXkuYWxsaWFuY2UgPT0gZW50aXR5LmFsbGlhbmNlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGVudGl0eS5nZXREaXN0YW5jZVRvRW50aXR5KGVuZW15KTtcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gZW50aXR5LmRhdGEubWF4KSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IGVudGl0eS5kYXRhLm1pbikgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKGVuZW15KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldHM7XHJcbiAgICB9XHJcbiAgICBnZXRSYWlzZVRhcmdldHMoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICBsZXQgdGFyZ2V0czogRW50aXR5W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBkZWFkIG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKCFkZWFkLmlzRGVhZCgpKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGVudGl0eS5nZXREaXN0YW5jZVRvRW50aXR5KGRlYWQpO1xyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgIT0gMSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICB0YXJnZXRzLnB1c2goZGVhZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0YXJnZXRzO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyLCBjdXJzb3JfcG9zaXRpb246IFBvcywgYW5pbV9zdGF0ZTogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGlmIChhbmltX3N0YXRlICE9IHRoaXMuYW5pbV9pZGxlX3N0YXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9pZGxlX3N0YXRlID0gYW5pbV9zdGF0ZTtcclxuICAgICAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zZXRGcmFtZSh0aGlzLmFuaW1faWRsZV9zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X3JhbmdlLnVwZGF0ZShzdGVwcywgY3Vyc29yX3Bvc2l0aW9uLCBhbmltX3N0YXRlLCB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcywgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyk7XHJcbiAgICAgICAgdGhpcy5hbmltYXRlTW92aW5nRW50aXR5KHN0ZXBzKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RW50aXR5T3B0aW9ucyhlbnRpdHk6IEVudGl0eSwgbW92ZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IEFjdGlvbltdIHtcclxuXHJcbiAgICAgICAgaWYgKGVudGl0eS5zdGF0ZSAhPSBFbnRpdHlTdGF0ZS5SZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb3B0aW9uczogQWN0aW9uW10gPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKCFtb3ZlZCAmJiBlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5CdXkpICYmIHRoaXMubWFwLmdldFRpbGVBdChlbnRpdHkucG9zaXRpb24pID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uQlVZKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FudEF0dGFja0FmdGVyTW92aW5nKSB8fCAhbW92ZWQpIHtcclxuICAgICAgICAgICAgbGV0IGF0dGFja190YXJnZXRzID0gdGhpcy5nZXRBdHRhY2tUYXJnZXRzKGVudGl0eSk7XHJcbiAgICAgICAgICAgIGlmIChhdHRhY2tfdGFyZ2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLkFUVEFDSyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5SYWlzZSkpIHtcclxuICAgICAgICAgICAgbGV0IHJhaXNlX3RhcmdldHMgPSB0aGlzLmdldFJhaXNlVGFyZ2V0cyhlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAocmFpc2VfdGFyZ2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLlJBSVNFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWFwLmdldEFsbGlhbmNlQXQoZW50aXR5LnBvc2l0aW9uKSAhPSBlbnRpdHkuYWxsaWFuY2UgJiYgKChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5PY2N1cHlIb3VzZSkgJiYgdGhpcy5tYXAuZ2V0VGlsZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gVGlsZS5Ib3VzZSkgfHwgKGVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbk9jY3VweUNhc3RsZSkgJiYgdGhpcy5tYXAuZ2V0VGlsZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gVGlsZS5DYXN0bGUpKSkge1xyXG4gICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLk9DQ1VQWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobW92ZWQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5FTkRfTU9WRSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5NT1ZFKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0RW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgLy8gbW92ZSBzZWxlY3RlZCBlbnRpdHkgaW4gYSBoaWdoZXIgZ3JvdXBcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5yZW1vdmUoZW50aXR5LnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5hZGQoZW50aXR5LnNwcml0ZSk7XHJcbiAgICB9XHJcbiAgICBkZXNlbGVjdEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIG1vdmUgc2VsZWN0ZWQgZW50aXR5IGJhY2sgdG8gYWxsIG90aGVyIGVudGl0aWVzXHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5yZW1vdmUoZW50aXR5LnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAuYWRkQXQoZW50aXR5LnNwcml0ZSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1JhbmdlKHR5cGU6IEVudGl0eVJhbmdlVHlwZSwgZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmVudGl0eV9yYW5nZS5jcmVhdGVSYW5nZSh0eXBlLCBlbnRpdHksIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlUmFuZ2UoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UuY2xlYXIodGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MsIHRoaXMuaW50ZXJhY3Rpb25fZ3JhcGhpY3MpO1xyXG4gICAgfVxyXG5cclxuICAgIG1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHksIHRhcmdldDogUG9zKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5nZXRFbnRpdHlBdCh0YXJnZXQpKSB7XHJcbiAgICAgICAgICAgIC8vIGVudGl0eSBhdCBwbGFjZVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB3YXlwb2ludCA9IHRoaXMuZW50aXR5X3JhbmdlLmdldFdheXBvaW50QXQodGFyZ2V0KTtcclxuICAgICAgICBpZiAoIXdheXBvaW50KSB7XHJcbiAgICAgICAgICAgIC8vIHRhcmdldCBub3QgaW4gcmFuZ2VcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbGluZSA9IEVudGl0eVJhbmdlLmdldExpbmVUb1dheXBvaW50KHdheXBvaW50KTtcclxuICAgICAgICB0aGlzLm1vdmluZyA9IHtcclxuICAgICAgICAgICAgZW50aXR5OiBlbnRpdHksXHJcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0LFxyXG4gICAgICAgICAgICBsaW5lOiBsaW5lLFxyXG4gICAgICAgICAgICBwcm9ncmVzczogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5oaWRlUmFuZ2UoKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRLaW5nUG9zaXRpb24oYWxsaWFuY2U6IEFsbGlhbmNlKTogUG9zIHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlICYmIGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuS2luZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3MoMCwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltYXRlTW92aW5nRW50aXR5KHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoIXRoaXMubW92aW5nKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgbW92ZSA9IHRoaXMubW92aW5nO1xyXG4gICAgICAgIGxldCBlbnRpdHkgPSBtb3ZlLmVudGl0eTtcclxuXHJcbiAgICAgICAgbW92ZS5wcm9ncmVzcyArPSBzdGVwcztcclxuXHJcbiAgICAgICAgaWYgKG1vdmUucHJvZ3Jlc3MgPj0gbW92ZS5saW5lWzBdLmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkge1xyXG4gICAgICAgICAgICBtb3ZlLnByb2dyZXNzIC09IG1vdmUubGluZVswXS5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgICAgIG1vdmUubGluZS5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobW92ZS5saW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGRpZmYgPSBuZXcgUG9zKDAsIDApLm1vdmUobW92ZS5saW5lWzBdLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgIGVudGl0eS53b3JsZF9wb3NpdGlvbi54ID0gbW92ZS5saW5lWzBdLnBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgKyBkaWZmLnggKiBtb3ZlLnByb2dyZXNzO1xyXG4gICAgICAgICAgICBlbnRpdHkud29ybGRfcG9zaXRpb24ueSA9IG1vdmUubGluZVswXS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi55ICogbW92ZS5wcm9ncmVzcztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbnRpdHkucG9zaXRpb24gPSBtb3ZlLnRhcmdldDtcclxuICAgICAgICAgICAgZW50aXR5LndvcmxkX3Bvc2l0aW9uID0gbW92ZS50YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmluZyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZW50aXR5RGlkTW92ZShlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbnRpdHkudXBkYXRlKHN0ZXBzKTtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVdheXBvaW50IHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb3N0OiBudW1iZXI7XHJcbiAgICBmb3JtOiBudW1iZXI7XHJcbiAgICBwYXJlbnQ6IElXYXlwb2ludDtcclxufVxyXG5lbnVtIEVudGl0eVJhbmdlVHlwZSB7XHJcbiAgICBOb25lLFxyXG4gICAgTW92ZSxcclxuICAgIEF0dGFjayxcclxuICAgIFJhaXNlXHJcbn1cclxuY2xhc3MgRW50aXR5UmFuZ2Uge1xyXG5cclxuICAgIHdheXBvaW50czogSVdheXBvaW50W107XHJcbiAgICBtYXA6IE1hcDtcclxuICAgIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyO1xyXG5cclxuICAgIHR5cGU6IEVudGl0eVJhbmdlVHlwZTtcclxuXHJcbiAgICByYW5nZV9saWdodGVuOiBib29sZWFuO1xyXG4gICAgcmFuZ2VfcHJvZ3Jlc3M6IG51bWJlcjtcclxuXHJcbiAgICBsaW5lOiBMaW5lUGFydFtdO1xyXG4gICAgbGluZV9vZmZzZXQ6IG51bWJlcjtcclxuICAgIGxpbmVfZW5kX3Bvc2l0aW9uOiBQb3M7XHJcbiAgICBsaW5lX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGV4dHJhX2N1cnNvcjogU3ByaXRlO1xyXG5cclxuXHJcbiAgICBzdGF0aWMgZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uOiBQb3MsIHdheXBvaW50czogSVdheXBvaW50W10pIHtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB3YXlwb2ludHMpe1xyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7IHJldHVybiB3YXlwb2ludDsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRMaW5lVG9XYXlwb2ludCh3YXlwb2ludDogSVdheXBvaW50KTogTGluZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IGxpbmU6IExpbmVQYXJ0W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAod2F5cG9pbnQucGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSB3YXlwb2ludDtcclxuICAgICAgICAgICAgd2F5cG9pbnQgPSB3YXlwb2ludC5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gd2F5cG9pbnQucG9zaXRpb24uZ2V0RGlyZWN0aW9uVG8obmV4dC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDAgJiYgbGluZVswXS5kaXJlY3Rpb24gPT0gZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLnBvc2l0aW9uID0gd2F5cG9pbnQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLmxlbmd0aCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluZS51bnNoaWZ0KHtwb3NpdGlvbjogd2F5cG9pbnQucG9zaXRpb24sIGRpcmVjdGlvbjogZGlyZWN0aW9uLCBsZW5ndGg6IDF9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlciA9IGVudGl0eV9tYW5hZ2VyO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVJhbmdlVHlwZS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvciA9IG5ldyBTcHJpdGUoe3g6IDAsIHk6IDB9LCBncm91cCwgXCJjdXJzb3JcIiwgWzRdKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRXYXlwb2ludEF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICByZXR1cm4gRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCB0aGlzLndheXBvaW50cyk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gMTAwO1xyXG5cclxuICAgICAgICB0aGlzLmxpbmVfZW5kX3Bvc2l0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxpbmVfc2xvdyA9IDA7XHJcbiAgICAgICAgdGhpcy5saW5lX29mZnNldCA9IDA7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gW1xyXG4gICAgICAgICAgICAgICAgICAgIHtwb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlVwKSwgY29zdDogMCwgZm9ybTogRGlyZWN0aW9uLkFsbCwgcGFyZW50OiBudWxsfSxcclxuICAgICAgICAgICAgICAgICAgICB7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5SaWdodCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uRG93biksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uTGVmdCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH1cclxuICAgICAgICAgICAgICAgIF07XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrOlxyXG5cclxuICAgICAgICAgICAgICAgIGxldCBtaW4gPSBlbnRpdHkuZGF0YS5taW47XHJcbiAgICAgICAgICAgICAgICBsZXQgbWF4ID0gZW50aXR5LmRhdGEubWF4O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gdGhpcy5jYWxjdWxhdGVXYXlwb2ludHMoZW50aXR5LCBtYXgsIGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyByZW1vdmUgYWxsIHdheXBvaW50cyB0aGF0IGFyZSBuZWFyZXIgdGhhbiBtaW5pbXVtIHJhbmdlXHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gdGhpcy53YXlwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgd2F5cG9pbnQgPSB0aGlzLndheXBvaW50c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAod2F5cG9pbnQuY29zdCA8IG1pbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGb3JtKGZhbHNlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZXMoWzIsIDNdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldE9mZnNldCgtMSwgLTEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLk1vdmU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cyA9IHRoaXMuY2FsY3VsYXRlV2F5cG9pbnRzKGVudGl0eSwgZW50aXR5LmdldE1vdmVtZW50KCksICFlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5GbHkpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRm9ybSh0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZXMoWzRdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldE9mZnNldCgtMSwgLTQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRyYXcocmFuZ2VfZ3JhcGhpY3MpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MsIGFuaW1fc3RhdGU6IG51bWJlciwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgbGluZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmFuZ2VfbGlnaHRlbikge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yYW5nZV9wcm9ncmVzcyA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgLT0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJhbmdlX3Byb2dyZXNzIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gNDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZShhbmltX3N0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFjdXJzb3JfcG9zaXRpb24ubWF0Y2godGhpcy5saW5lX2VuZF9wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5saW5lX2VuZF9wb3NpdGlvbiA9IGN1cnNvcl9wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oY3Vyc29yX3Bvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZW5kcG9pbnQgPSB0aGlzLmdldFdheXBvaW50QXQoY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhZW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGluZSA9IEVudGl0eVJhbmdlLmdldExpbmVUb1dheXBvaW50KGVuZHBvaW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuTW92ZSkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5saW5lX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmVfc2xvdyA+PSA1KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmVfc2xvdyAtPSA1O1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMubGluZV9vZmZzZXQgLT0gMTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpbmVfb2Zmc2V0IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGluZV9vZmZzZXQgPSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfTEVOR1RIICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkcgLSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxpbmUpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaW5lX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5iZWdpbkZpbGwoMHhmZmZmZmYpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBwYXJ0IG9mIHRoaXMubGluZSl7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd1NlZ21lbnQobGluZV9ncmFwaGljcywgcGFydCwgdGhpcy5saW5lX29mZnNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGluZV9vZmZzZXQgPSAodGhpcy5saW5lX29mZnNldCArIHBhcnQubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKSAlIChBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfTEVOR1RIICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsaW5lX2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBncmV5ID0gdGhpcy5yYW5nZV9wcm9ncmVzcyAvIDEwMCAqIDB4RkYgfCAwO1xyXG4gICAgICAgIHJhbmdlX2dyYXBoaWNzLnRpbnQgPSAoZ3JleSA8PCAxNikgfCAoZ3JleSA8PCA4KSB8IGdyZXk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIocmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgbGluZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5UmFuZ2VUeXBlLk5vbmU7XHJcbiAgICAgICAgdGhpcy53YXlwb2ludHMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICBsaW5lX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBkcmF3KGdyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MpIHtcclxuXHJcbiAgICAgICAgbGV0IGNvbG9yOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuTW92ZTpcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuUmFpc2U6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLkF0dGFjazpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gMHhmZjAwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGdyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgZ3JhcGhpY3MuYmVnaW5GaWxsKGNvbG9yKTtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB0aGlzLndheXBvaW50cykge1xyXG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB3YXlwb2ludC5wb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCA0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLnggKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA0LCBwb3NpdGlvbi55LCA0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCA0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgNCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBncmFwaGljcy5lbmRGaWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVXYXlwb2ludHMoZW50aXR5OiBFbnRpdHksIG1heF9jb3N0OiBudW1iZXIsIHVzZV90ZXJyYWluOiBib29sZWFuKTogSVdheXBvaW50W10ge1xyXG4gICAgICAgIC8vIGNvc3QgZm9yIG9yaWdpbiBwb2ludCBpcyBhbHdheXMgMVxyXG4gICAgICAgIGxldCBvcGVuOiBJV2F5cG9pbnRbXSA9IFt7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbiwgY29zdDogKHVzZV90ZXJyYWluID8gMSA6IDApLCBmb3JtOiAwLCBwYXJlbnQ6IG51bGx9XTtcclxuICAgICAgICBsZXQgY2xvc2VkOiBJV2F5cG9pbnRbXSA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChvcGVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcGVuLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGNsb3NlZC5wdXNoKGN1cnJlbnQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGFkamFjZW50X3Bvc2l0aW9ucyA9IHRoaXMubWFwLmdldEFkamFjZW50UG9zaXRpb25zQXQoY3VycmVudC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBvc2l0aW9uIG9mIGFkamFjZW50X3Bvc2l0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jaGVja1Bvc2l0aW9uKHBvc2l0aW9uLCBjdXJyZW50LCBvcGVuLCBjbG9zZWQsIG1heF9jb3N0LCB1c2VfdGVycmFpbiwgZW50aXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2xvc2VkO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2hlY2tQb3NpdGlvbihwb3NpdGlvbjogUG9zLCBwYXJlbnQ6IElXYXlwb2ludCwgb3BlbjogSVdheXBvaW50W10sIGNsb3NlZDogSVdheXBvaW50W10sIG1heF9jb3N0OiBudW1iZXIsIHVzZV90ZXJyYWluOiBib29sZWFuLCBlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xyXG5cclxuICAgICAgICAvLyBhbHJlYWR5IGlzIHRoZSBsb3dlc3QgcG9zc2libGVcclxuICAgICAgICBpZiAoISFFbnRpdHlSYW5nZS5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIGNsb3NlZCkpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgIGlmICh1c2VfdGVycmFpbikge1xyXG4gICAgICAgICAgICBsZXQgaXNfb2NjdXBpZWQgPSB0aGlzLmVudGl0eV9tYW5hZ2VyLmdldEVudGl0eUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhaXNfb2NjdXBpZWQgJiYgaXNfb2NjdXBpZWQuYWxsaWFuY2UgIT0gZW50aXR5LmFsbGlhbmNlKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRpbGVfY29zdCA9IDE7XHJcbiAgICAgICAgaWYgKHVzZV90ZXJyYWluKSB7XHJcbiAgICAgICAgICAgIHRpbGVfY29zdCA9IHRoaXMubWFwLmdldENvc3RBdChwb3NpdGlvbiwgZW50aXR5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXdfY29zdCA9IHBhcmVudC5jb3N0ICsgdGlsZV9jb3N0O1xyXG4gICAgICAgIGlmIChuZXdfY29zdCA+IG1heF9jb3N0KSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBsZXQgaW5fb3BlbiA9IEVudGl0eVJhbmdlLmZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbiwgb3Blbik7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgaW4gb3BlbiBzdGFjayBhbmQgd2UgYXJlIGxvd2VyXHJcbiAgICAgICAgaWYgKCEhaW5fb3Blbikge1xyXG4gICAgICAgICAgICBpZiAoaW5fb3Blbi5jb3N0IDw9IG5ld19jb3N0KSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgICAgICBpbl9vcGVuLmNvc3QgPSBuZXdfY29zdDtcclxuICAgICAgICAgICAgaW5fb3Blbi5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcGVuLnB1c2goe3Bvc2l0aW9uOiBwb3NpdGlvbiwgcGFyZW50OiBwYXJlbnQsIGZvcm06IDAsIGNvc3Q6IG5ld19jb3N0fSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFkZEZvcm0odXNlX3RlcnJhaW46IGJvb2xlYW4pIHtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB0aGlzLndheXBvaW50cykge1xyXG4gICAgICAgICAgICB3YXlwb2ludC5mb3JtID0gMDtcclxuICAgICAgICAgICAgaWYgKCghdXNlX3RlcnJhaW4gfHwgd2F5cG9pbnQucG9zaXRpb24ueSA+IDApICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uVXApKSkgeyB3YXlwb2ludC5mb3JtICs9IDE7IH1cclxuICAgICAgICAgICAgaWYgKCghdXNlX3RlcnJhaW4gfHwgd2F5cG9pbnQucG9zaXRpb24ueCA8IHRoaXMubWFwLndpZHRoIC0gMSkgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5SaWdodCkpKSB7IHdheXBvaW50LmZvcm0gKz0gMjsgfVxyXG4gICAgICAgICAgICBpZiAoKCF1c2VfdGVycmFpbiB8fCB3YXlwb2ludC5wb3NpdGlvbi55IDwgdGhpcy5tYXAuaGVpZ2h0IC0gMSkgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5Eb3duKSkpIHsgd2F5cG9pbnQuZm9ybSArPSA0OyB9XHJcbiAgICAgICAgICAgIGlmICgoIXVzZV90ZXJyYWluIHx8IHdheXBvaW50LnBvc2l0aW9uLnggPiAwKSAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkxlZnQpKSkgeyB3YXlwb2ludC5mb3JtICs9IDg7IH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdTZWdtZW50KGdyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIHBhcnQ6IExpbmVQYXJ0LCBvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHBhcnQubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgIGxldCB4ID0gKHBhcnQucG9zaXRpb24ueCArIDAuNSkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgbGV0IHkgPSAocGFydC5wb3NpdGlvbi55ICsgMC41KSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuXHJcbiAgICAgICAgd2hpbGUgKGRpc3RhbmNlID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSDtcclxuICAgICAgICAgICAgaWYgKG9mZnNldCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aCAtPSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAocGFydC5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlVwOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHggLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCB5IC0gbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgsIGxlbmd0aCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB5IC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCwgeSAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIGxlbmd0aCwgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHggKz0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHggLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCB5LCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgsIGxlbmd0aCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB5ICs9IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uTGVmdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyBncmFwaGljcy5kcmF3UmVjdCh4IC0gbGVuZ3RoLCB5IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkaXN0YW5jZSAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgU21va2VNYW5hZ2VyIHtcclxuICAgIHNtb2tlOiBTbW9rZVtdO1xyXG4gICAgbWFwOiBNYXA7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGFuaW1fc2xvdzogbnVtYmVyO1xyXG4gICAgYW5pbV9zdGF0ZTogbnVtYmVyO1xyXG4gICAgYW5pbV9vZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX29mZnNldCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuc21va2UgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBob3VzZSBvZiBtYXAuZ2V0T2NjdXBpZWRIb3VzZXMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNtb2tlKGhvdXNlLnBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jcmVhdGVTbW9rZShuZXcgUG9zKDMsIDEzKSk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVTbW9rZShwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgdGhpcy5zbW9rZS5wdXNoKG5ldyBTbW9rZShwb3NpdGlvbiwgdGhpcy5ncm91cCwgXCJiX3Ntb2tlXCIsIFswLCAxLCAyLCAzXSkpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9zbG93IDwgNSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbV9zbG93ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX29mZnNldCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMjcpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltX29mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMjIgJiYgdGhpcy5hbmltX3N0YXRlID09IDMpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gNDtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMTcgJiYgdGhpcy5hbmltX3N0YXRlID09IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMztcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAxMiAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDcgJiYgdGhpcy5hbmltX3N0YXRlID09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHNtb2tlIG9mIHRoaXMuc21va2UpIHtcclxuICAgICAgICAgICAgc21va2Uuc2V0RnJhbWUodGhpcy5hbmltX3N0YXRlKTtcclxuICAgICAgICAgICAgc21va2Uud29ybGRfcG9zaXRpb24ueSA9IHNtb2tlLnBvc2l0aW9uLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSB0aGlzLmFuaW1fb2Zmc2V0IC0gMjtcclxuICAgICAgICAgICAgc21va2UudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG4iLCJjbGFzcyBTcHJpdGUge1xyXG5cclxuICAgIHdvcmxkX3Bvc2l0aW9uOiBJUG9zO1xyXG4gICAgc3ByaXRlOiBQaGFzZXIuU3ByaXRlO1xyXG4gICAgcHJvdGVjdGVkIG5hbWU6IHN0cmluZztcclxuICAgIHByb3RlY3RlZCBmcmFtZXM6IG51bWJlcltdO1xyXG4gICAgcHJpdmF0ZSBvZmZzZXRfeDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBvZmZzZXRfeTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBmcmFtZTogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdvcmxkX3Bvc2l0aW9uOiBJUG9zLCBncm91cDogUGhhc2VyLkdyb3VwLCBuYW1lOiBzdHJpbmcsIGZyYW1lczogbnVtYmVyW10gPSBbXSkge1xyXG5cclxuICAgICAgICB0aGlzLndvcmxkX3Bvc2l0aW9uID0gd29ybGRfcG9zaXRpb247XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSAwO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gZnJhbWVzO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZSA9IGdyb3VwLmdhbWUuYWRkLnNwcml0ZSh0aGlzLndvcmxkX3Bvc2l0aW9uLngsIHRoaXMud29ybGRfcG9zaXRpb24ueSwgdGhpcy5uYW1lKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5mcmFtZSA9IHRoaXMuZnJhbWVzWzBdO1xyXG4gICAgICAgIGdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcblxyXG4gICAgfVxyXG4gICAgc2V0RnJhbWVzKGZyYW1lczogbnVtYmVyW10sIGZyYW1lOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBmcmFtZXM7XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5mcmFtZSAlIHRoaXMuZnJhbWVzLmxlbmd0aF07XHJcbiAgICB9XHJcbiAgICBzZXRPZmZzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm9mZnNldF94ID0geDtcclxuICAgICAgICB0aGlzLm9mZnNldF95ID0geTtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgc2V0RnJhbWUoZnJhbWU6IG51bWJlcikge1xyXG4gICAgICAgIGlmIChmcmFtZSA9PSB0aGlzLmZyYW1lKSB7IHJldHVybjsgfVxyXG4gICAgICAgIHRoaXMuZnJhbWUgPSBmcmFtZTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5mcmFtZSA9IHRoaXMuZnJhbWVzW3RoaXMuZnJhbWUgJSB0aGlzLmZyYW1lcy5sZW5ndGhdO1xyXG4gICAgfVxyXG4gICAgc2V0V29ybGRQb3NpdGlvbih3b3JsZF9wb3NpdGlvbjogSVBvcykge1xyXG4gICAgICAgIHRoaXMud29ybGRfcG9zaXRpb24gPSB3b3JsZF9wb3NpdGlvbjtcclxuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIgPSAxKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUueCA9IHRoaXMud29ybGRfcG9zaXRpb24ueCArIHRoaXMub2Zmc2V0X3g7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUueSA9IHRoaXMud29ybGRfcG9zaXRpb24ueSArIHRoaXMub2Zmc2V0X3k7XHJcbiAgICB9XHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHNob3coKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmRlc3Ryb3koKTtcclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBTbW9rZSBleHRlbmRzIFNwcml0ZSB7XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFBvcywgZ3JvdXA6IFBoYXNlci5Hcm91cCwgbmFtZTogc3RyaW5nLCBmcmFtZXM6IG51bWJlcltdKSB7XHJcbiAgICAgICAgc3VwZXIobmV3IFBvcyhwb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgMTYsIHBvc2l0aW9uLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpLCBncm91cCwgbmFtZSwgZnJhbWVzKTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEVudGl0eURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgbW92OiBudW1iZXI7XHJcbiAgICBhdGs6IG51bWJlcjtcclxuICAgIGRlZjogbnVtYmVyO1xyXG4gICAgbWF4OiBudW1iZXI7XHJcbiAgICBtaW46IG51bWJlcjtcclxuICAgIGNvc3Q6IG51bWJlcjtcclxuICAgIGJhdHRsZV9wb3NpdGlvbnM6IElQb3NbXTtcclxuICAgIGZsYWdzOiBFbnRpdHlGbGFncztcclxufVxyXG5lbnVtIEVudGl0eUZsYWdzIHtcclxuICAgIE5vbmUgPSAwLCAvLyBHb2xlbSwgU2tlbGV0b25cclxuICAgIENhbkZseSA9IDEsXHJcbiAgICBXYXRlckJvb3N0ID0gMixcclxuICAgIENhbkJ1eSA9IDQsXHJcbiAgICBDYW5PY2N1cHlIb3VzZSA9IDgsXHJcbiAgICBDYW5PY2N1cHlDYXN0bGUgPSAxNixcclxuICAgIENhblJhaXNlID0gMzIsXHJcbiAgICBBbnRpRmx5aW5nID0gNjQsXHJcbiAgICBDYW5Qb2lzb24gPSAxMjgsXHJcbiAgICBDYW5XaXNwID0gMjU2LFxyXG4gICAgQ2FudEF0dGFja0FmdGVyTW92aW5nID0gNTEyXHJcbn1cclxuaW50ZXJmYWNlIElFbnRpdHkge1xyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbn1cclxuZW51bSBFbnRpdHlUeXBlIHtcclxuICAgIFNvbGRpZXIsXHJcbiAgICBBcmNoZXIsXHJcbiAgICBMaXphcmQsXHJcbiAgICBXaXphcmQsXHJcbiAgICBXaXNwLFxyXG4gICAgU3BpZGVyLFxyXG4gICAgR29sZW0sXHJcbiAgICBDYXRhcHVsdCxcclxuICAgIFd5dmVybixcclxuICAgIEtpbmcsXHJcbiAgICBTa2VsZXRvblxyXG59XHJcbmVudW0gRW50aXR5U3RhdHVzIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgUG9pc29uZWQgPSAxIDw8IDAsXHJcbiAgICBXaXNwZWQgPSAxIDw8IDFcclxufVxyXG5lbnVtIEVudGl0eVN0YXRlIHtcclxuICAgIFJlYWR5ID0gMCxcclxuICAgIE1vdmVkID0gMSxcclxuICAgIERlYWQgPSAyXHJcbn1cclxuXHJcbmNsYXNzIEVudGl0eSBleHRlbmRzIFNwcml0ZSB7XHJcblxyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBkYXRhOiBFbnRpdHlEYXRhO1xyXG5cclxuICAgIGhlYWx0aDogbnVtYmVyO1xyXG4gICAgcmFuazogbnVtYmVyO1xyXG4gICAgZXA6IG51bWJlcjtcclxuXHJcbiAgICBkZWF0aF9jb3VudDogbnVtYmVyO1xyXG5cclxuICAgIHN0YXR1czogRW50aXR5U3RhdHVzO1xyXG4gICAgc3RhdGU6IEVudGl0eVN0YXRlO1xyXG4gICAgaWNvbl9tb3ZlZDogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGF0a19ib29zdDogbnVtYmVyID0gMDtcclxuICAgIGRlZl9ib29zdDogbnVtYmVyID0gMDtcclxuICAgIG1vdl9ib29zdDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBFbnRpdHlUeXBlLCBhbGxpYW5jZTogQWxsaWFuY2UsIHBvc2l0aW9uOiBQb3MsIGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICBzdXBlcihwb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCksIGdyb3VwLCBcInVuaXRfaWNvbnNfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpLCBbdHlwZSwgdHlwZSArIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aF0pO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1t0eXBlXTtcclxuICAgICAgICB0aGlzLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblxyXG4gICAgICAgIHRoaXMuZGVhdGhfY291bnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwO1xyXG4gICAgICAgIHRoaXMucmFuayA9IDA7XHJcbiAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAwO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkID0gZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMCwgMCwgXCJjaGFyc1wiLCA0LCBncm91cCk7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlzRGVhZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWFsdGggPT0gMDtcclxuICAgIH1cclxuICAgIGhhc0ZsYWcoZmxhZzogRW50aXR5RmxhZ3MpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YS5mbGFncyAmIGZsYWcpICE9IDA7XHJcbiAgICB9XHJcbiAgICBnZXREaXN0YW5jZVRvRW50aXR5KGVudGl0eTogRW50aXR5KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hYnMoZW50aXR5LnBvc2l0aW9uLnggLSB0aGlzLnBvc2l0aW9uLngpICsgTWF0aC5hYnMoZW50aXR5LnBvc2l0aW9uLnkgLSB0aGlzLnBvc2l0aW9uLnkpO1xyXG4gICAgfVxyXG4gICAgZGlkUmFua1VwKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLnJhbmsgPCAzICYmIHRoaXMuZXAgPj0gNzUgPDwgdGhpcy5yYW5rKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZXAgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnJhbmsrKztcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGF0dGFjayh0YXJnZXQ6IEVudGl0eSwgbWFwOiBNYXApIHtcclxuXHJcbiAgICAgICAgbGV0IG46IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gZ2V0IGJhc2UgZGFtYWdlXHJcbiAgICAgICAgbGV0IGF0ayA9IHRoaXMuZGF0YS5hdGsgKyB0aGlzLmF0a19ib29zdDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFbnRpdHlUeXBlLkFyY2hlciAmJiB0YXJnZXQudHlwZSA9PSBFbnRpdHlUeXBlLld5dmVybikge1xyXG4gICAgICAgICAgICBhdGsgKz0gMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5VHlwZS5XaXNwICYmIHRhcmdldC50eXBlID09IEVudGl0eVR5cGUuU2tlbGV0b24pIHtcclxuICAgICAgICAgICAgYXRrICs9IDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgdGhpcy5yYW5rO1xyXG4gICAgICAgIGlmIChuID4gMTkpIHtcclxuICAgICAgICAgICAgYXRrICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgYXRrICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGF0ayAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBhdGsgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWYgPSB0YXJnZXQuZGF0YS5kZWYgKyB0YXJnZXQuZGVmX2Jvb3N0O1xyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgdGFyZ2V0LnJhbms7XHJcblxyXG4gICAgICAgIGlmIChuID4gMTkpIHtcclxuICAgICAgICAgICAgZGVmICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgZGVmICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGRlZiAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBkZWYgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZWRfaGVhbHRoID0gTWF0aC5mbG9vcigoYXRrIC0gKGRlZiArIG1hcC5nZXREZWZBdCh0YXJnZXQucG9zaXRpb24sIHRhcmdldCkpICogKDIgLyAzKSkgKiB0aGlzLmhlYWx0aCAvIDEwKTtcclxuICAgICAgICBpZiAocmVkX2hlYWx0aCA+IHRhcmdldC5oZWFsdGgpIHtcclxuICAgICAgICAgICAgcmVkX2hlYWx0aCA9IHRhcmdldC5oZWFsdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhcmdldC5oZWFsdGggPSB0YXJnZXQuaGVhbHRoIC0gcmVkX2hlYWx0aDtcclxuICAgICAgICB0aGlzLmVwICs9ICh0YXJnZXQuZGF0YS5hdGsgKyB0YXJnZXQuZGF0YS5kZWYpICogcmVkX2hlYWx0aDtcclxuICAgIH1cclxuICAgIHVwZGF0ZVN0YXR1cygpIHtcclxuICAgICAgICB0aGlzLmF0a19ib29zdCA9IDA7XHJcbiAgICAgICAgdGhpcy5kZWZfYm9vc3QgPSAwO1xyXG4gICAgICAgIHRoaXMubW92X2Jvb3N0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgJiBFbnRpdHlTdGF0dXMuUG9pc29uZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hdGtfYm9vc3QtLTtcclxuICAgICAgICAgICAgdGhpcy5kZWZfYm9vc3QtLTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZfYm9vc3QtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzICYgRW50aXR5U3RhdHVzLldpc3BlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0a19ib29zdCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldFN0YXR1cyhzdGF0dXM6IEVudGl0eVN0YXR1cykge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzIHw9IHN0YXR1cztcclxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXR1cygpO1xyXG4gICAgfVxyXG4gICAgY2xlYXJTdGF0dXMoc3RhdHVzOiBFbnRpdHlTdGF0dXMpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyAmPSB+c3RhdHVzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzKCk7XHJcbiAgICB9XHJcbiAgICBnZXRJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEubmFtZSArIFwiLCBhbGxpYW5jZSBcIiArIHRoaXMuYWxsaWFuY2UgKyBcIjogXCIgKyB0aGlzLnBvc2l0aW9uLnggKyBcIiAtIFwiICsgdGhpcy5wb3NpdGlvbi55O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVN0YXRlKHN0YXRlOiBFbnRpdHlTdGF0ZSwgc2hvdzogYm9vbGVhbikge1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcblxyXG4gICAgICAgIGxldCBzaG93X2ljb24gPSAoc2hvdyAmJiBzdGF0ZSA9PSBFbnRpdHlTdGF0ZS5Nb3ZlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC54ID0gdGhpcy5zcHJpdGUueCArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDc7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnkgPSB0aGlzLnNwcml0ZS55ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNztcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQudmlzaWJsZSA9IHNob3dfaWNvbjtcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQuYnJpbmdUb1RvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1vdmVtZW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgLy8gaWYgcG9pc29uZWQsIGxlc3MgLT4gYXBwbHkgaGVyZVxyXG4gICAgICAgIHJldHVybiB0aGlzLmRhdGEubW92O1xyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBGcmFtZVJlY3Qge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG4gICAgW2tleTogc3RyaW5nXTogbnVtYmVyO1xyXG59XHJcbmludGVyZmFjZSBGcmFtZURlbGVnYXRlIHtcclxuICAgIGZyYW1lV2lsbERlc3Ryb3koZnJhbWU6IEZyYW1lKTogdm9pZDtcclxufVxyXG5lbnVtIEZyYW1lQW5pbWF0aW9uIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgU2hvdyA9IDEsXHJcbiAgICBIaWRlID0gMixcclxuICAgIENoYW5nZSA9IDQsXHJcbiAgICBXaXJlID0gOCxcclxuICAgIERlc3Ryb3kgPSAxNixcclxuICAgIFVwZGF0ZSA9IDMyXHJcbn1cclxuY2xhc3MgRnJhbWUge1xyXG4gICAgc3RhdGljIEJPUkRFUl9TSVpFOiBudW1iZXIgPSAyNDtcclxuICAgIHN0YXRpYyBBTklNX1NURVBTOiBudW1iZXIgPSAxNTtcclxuXHJcbiAgICBkZWxlZ2F0ZTogRnJhbWVEZWxlZ2F0ZTtcclxuXHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgYm9yZGVyX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBjb250ZW50X2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBjb250ZW50X2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBib3JkZXJfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuXHJcbiAgICByZXVzZV90aWxlczogUGhhc2VyLkltYWdlW107XHJcblxyXG4gICAgYWxpZ246IERpcmVjdGlvbjtcclxuICAgIGFuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIGJvcmRlcjogRGlyZWN0aW9uO1xyXG5cclxuICAgIGFuaW1hdGlvbjogRnJhbWVBbmltYXRpb247XHJcblxyXG4gICAgZ2FtZV93aWR0aDogbnVtYmVyO1xyXG4gICAgZ2FtZV9oZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgY3VycmVudDogRnJhbWVSZWN0O1xyXG4gICAgdGFyZ2V0OiBGcmFtZVJlY3Q7XHJcbiAgICBzcGVlZDogRnJhbWVSZWN0O1xyXG4gICAgYWNjOiBGcmFtZVJlY3Q7XHJcbiAgICBwcml2YXRlIG5ld19hbGlnbjogRGlyZWN0aW9uO1xyXG4gICAgcHJpdmF0ZSBuZXdfYm9yZGVyOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19hbmltYXRpb25fZGlyZWN0aW9uOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19hbmltYXRlOiBib29sZWFuO1xyXG5cclxuICAgIHN0YXRpYyBnZXRSZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBjb3B5UmVjdChmcjogRnJhbWVSZWN0KTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IGZyLngsIHk6IGZyLnksIHdpZHRoOiBmci53aWR0aCwgaGVpZ2h0OiBmci5oZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGlsZUZvckRpcmVjdGlvbihkaXJlY3Rpb246IERpcmVjdGlvbik6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoIChkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDU7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHRoaXMucmV1c2VfdGlsZXMgPSBbXTtcclxuICAgIH1cclxuXHJcbiAgICBpbml0aWFsaXplKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBncm91cDogUGhhc2VyLkdyb3VwLCBhbGlnbjogRGlyZWN0aW9uLCBib3JkZXI6IERpcmVjdGlvbiwgYW5pbV9kaXI/OiBEaXJlY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmFsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID0gdHlwZW9mIGFuaW1fZGlyICE9IFwidW5kZWZpbmVkXCIgPyBhbmltX2RpciA6IGFsaWduO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyID0gYm9yZGVyO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmdyb3VwLmFkZCh0aGlzLmJvcmRlcl9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmJvcmRlcl9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZV93aWR0aCA9IHRoaXMuZ3JvdXAuZ2FtZS53aWR0aDtcclxuICAgICAgICB0aGlzLmdhbWVfaGVpZ2h0ID0gdGhpcy5ncm91cC5nYW1lLmhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMuZ2V0QWxpZ25tZW50UmVjdCgpO1xyXG5cclxuICAgICAgICBpZiAoYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICAvLyBjYWxjdWxhdGUgc3RhcnRpbmcgb2Zmc2V0IHVzaW5nIHRoZSBhbmltX2RpcmVjdGlvblxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLlNob3c7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcmFtZSgpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuXHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgIGlmIChkZXN0cm95X29uX2ZpbmlzaCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5IaWRlO1xyXG4gICAgICAgIGlmIChkZXN0cm95X29uX2ZpbmlzaCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5EZXN0cm95O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXBkYXRlX29uX2ZpbmlzaCkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5VcGRhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uV2lyZTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcmFtZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVNwZWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlU2l6ZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLndpZHRoID09IHdpZHRoICYmIHRoaXMuaGVpZ2h0ID09IGhlaWdodCkgeyByZXR1cm47IH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uVXBkYXRlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gRnJhbWUuY29weVJlY3QodGhpcy50YXJnZXQpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9sZF93aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgbGV0IG9sZF9oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uQ2hhbmdlO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uV2lyZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyB0YWtlIHRoZSBiaWdnZXN0IHJlY3QgcG9zc2libGVcclxuICAgICAgICAgICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgb2xkX3dpZHRoKTtcclxuICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5tYXgoaGVpZ2h0LCBvbGRfaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5jdXJyZW50IGlzIHRoZSBvbGQgcmVjdCAob2Zmc2V0ICYgc2l6ZSlcclxuICAgICAgICAvLyB1cGRhdGUgdGhpcy5jdXJyZW50IHNvIHRoZSBzYW1lIHBvcnRpb24gb2YgdGhlIGZyYW1lIGlzIHJlbmRlcmVkLCBhbHRob3VnaCBpdCBjaGFuZ2VkIGluIHNpemVcclxuICAgICAgICAvLyBjaGFuZ2UgdGFyZ2V0IHRvIGFsaWdubWVudCBwb3NpdGlvbiBmb3IgY2hhbmdlZCByZWN0XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnggLT0gd2lkdGggLSBvbGRfd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnggLT0gd2lkdGggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnkgLT0gaGVpZ2h0IC0gb2xkX2hlaWdodDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueSAtPSBoZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVGcmFtZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZVNwZWVkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlRGlyZWN0aW9ucyhhbGlnbjogRGlyZWN0aW9uLCBib3JkZXI6IERpcmVjdGlvbiwgYW5pbV9kaXJlY3Rpb246IERpcmVjdGlvbiwgYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm5ld19hbGlnbiA9PT0gYWxpZ24gJiYgdGhpcy5uZXdfYm9yZGVyID09IGJvcmRlciAmJiB0aGlzLm5ld19hbmltYXRpb25fZGlyZWN0aW9uID09IGFuaW1fZGlyZWN0aW9uICYmIHRoaXMubmV3X2FuaW1hdGUgPT0gYW5pbWF0ZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgdGhpcy5uZXdfYWxpZ24gPSBhbGlnbjtcclxuICAgICAgICB0aGlzLm5ld19ib3JkZXIgPSBib3JkZXI7XHJcbiAgICAgICAgdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbiA9IGFuaW1fZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMubmV3X2FuaW1hdGUgPSBhbmltYXRlO1xyXG5cclxuICAgICAgICB0aGlzLmhpZGUodHJ1ZSwgZmFsc2UsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbiA9PSBGcmFtZUFuaW1hdGlvbi5Ob25lKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfeCA9IHRoaXMuYWRkR2FpbihcInhcIiwgc3RlcHMpO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF95ID0gdGhpcy5hZGRHYWluKFwieVwiLCBzdGVwcyk7XHJcblxyXG4gICAgICAgIGxldCBmaW5pc2hlZF93aWR0aCA9IHRydWU7XHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX2hlaWdodCA9IHRydWU7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpICE9IDApIHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2Ugc2l6ZSB3aXRoIHRoZSB3aXJlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICBmaW5pc2hlZF93aWR0aCA9IHRoaXMuYWRkR2FpbihcIndpZHRoXCIsIHN0ZXBzKTtcclxuICAgICAgICAgICAgZmluaXNoZWRfaGVpZ2h0ID0gdGhpcy5hZGRHYWluKFwiaGVpZ2h0XCIsIHN0ZXBzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChmaW5pc2hlZF94ICYmIGZpbmlzaGVkX3kgJiYgZmluaXNoZWRfd2lkdGggJiYgZmluaXNoZWRfaGVpZ2h0KSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbkRpZEVuZCh0aGlzLmFuaW1hdGlvbik7XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmRlcl9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5IaWRlKSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uQ2hhbmdlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB1cGRhdGUgY3VycmVudCBvZmZzZXQgYW5kIHJlbW92ZSB0aWxlcyBvdXQgb2Ygc2lnaHRcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LndpZHRoID0gdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LmhlaWdodCA9IHRoaXMuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC54ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50ID0gRnJhbWUuY29weVJlY3QodGhpcy50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uSGlkZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkRlc3Ryb3kpICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uVXBkYXRlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBseURpcmVjdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG5pY2UgYW5pbWF0aW9uIGZvciBmcmFtZSB3aXRoIG5vIGFsaWdubWVudCAmIG5vIGFuaW1hdGlvbiBkaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MubGluZVN0eWxlKDEsIDB4ZmZmZmZmKTtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgdGhpcy5jdXJyZW50LndpZHRoLCB0aGlzLmN1cnJlbnQuaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5kZWxlZ2F0ZSkgeyB0aGlzLmRlbGVnYXRlLmZyYW1lV2lsbERlc3Ryb3kodGhpcyk7IH1cclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBhbmltYXRpb25EaWRFbmQoYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbikge1xyXG4gICAgICAgIC8vIGltcGxlbWVudGVkIGluIHN1YiBjbGFzc2VzIGlmIG5lZWRlZCAtIGRlZmF1bHQ6IGRvIG5vdGhpbmdcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGFwcGx5RGlyZWN0aW9ucygpIHtcclxuICAgICAgICB0aGlzLmFsaWduID0gdGhpcy5uZXdfYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSB0aGlzLm5ld19ib3JkZXI7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID0gdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuICAgICAgICB0aGlzLnNob3codGhpcy5uZXdfYW5pbWF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBnZXRBbGlnbm1lbnRSZWN0KCk6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgdXNpbmcgdGhlIGFsaWdubWVudFxyXG4gICAgICAgIGxldCByZWN0ID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IHRoaXMuZ2FtZV93aWR0aCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lX3dpZHRoIC0gdGhpcy53aWR0aCkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IHRoaXMuZ2FtZV9oZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWN0LnkgPSBNYXRoLmZsb29yKCh0aGlzLmdhbWVfaGVpZ2h0IC0gdGhpcy5oZWlnaHQpIC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmV0cmFjdGVkUmVjdCgpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZyYW1lLmdldFJlY3QoTWF0aC5mbG9vcih0aGlzLmdhbWVfd2lkdGggLyAyKSwgTWF0aC5mbG9vcih0aGlzLmdhbWVfaGVpZ2h0IC8gMiksIDAsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IC10aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSB0aGlzLmdhbWVfd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IC10aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSB0aGlzLmdhbWVfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlT2Zmc2V0KCkge1xyXG4gICAgICAgIGxldCB4ID0gdGhpcy5jdXJyZW50Lng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLmN1cnJlbnQueTtcclxuXHJcbiAgICAgICAgbGV0IGNfeCA9IDA7XHJcbiAgICAgICAgbGV0IGNfeSA9IDA7XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfeCA9IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgY195ID0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnggPSB4O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC54ID0geCArIGNfeDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAueSA9IHkgKyBjX3k7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdGcmFtZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgY193aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGxldCBjX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY193aWR0aCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfd2lkdGggLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX2hlaWdodCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgY19oZWlnaHQgLT0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3ggPSBNYXRoLmNlaWwod2lkdGggLyBGcmFtZS5CT1JERVJfU0laRSkgLSAyO1xyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3kgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gRnJhbWUuQk9SREVSX1NJWkUpIC0gMjtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmxpbmVTdHlsZSgwKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4Y2ViZWE1KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgY193aWR0aCwgY19oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIGxldCB0aWxlczogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG93X3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgMCwgRGlyZWN0aW9uLlVwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIERpcmVjdGlvbi5Eb3duKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0X3ggKz0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNob3dfdGlsZXNfeTsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgb2Zmc2V0X3ksIERpcmVjdGlvbi5MZWZ0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgb2Zmc2V0X3ksIERpcmVjdGlvbi5SaWdodCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9mZnNldF95ICs9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IHRpbGVzO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVGcmFtZSgpIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdCb3JkZXJUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xyXG4gICAgICAgIGxldCByZXVzZTogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldXNlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZXVzZS5icmluZ1RvVG9wKCk7XHJcbiAgICAgICAgICAgIHJldXNlLnggPSB4O1xyXG4gICAgICAgICAgICByZXVzZS55ID0geTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXVzZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJtZW51XCIsIG51bGwsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV1c2UuZnJhbWUgPSBGcmFtZS5nZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHJldXNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhZGRHYWluKHZhcl9uYW1lOiBzdHJpbmcsIHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5zcGVlZFt2YXJfbmFtZV0gPT0gMCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gKz0gdGhpcy5zcGVlZFt2YXJfbmFtZV0gKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IGQgPSBNYXRoLmZsb29yKHRoaXMuYWNjW3Zhcl9uYW1lXSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSArPSBkO1xyXG4gICAgICAgIHRoaXMuYWNjW3Zhcl9uYW1lXSAtPSBkO1xyXG4gICAgICAgIGlmIChkIDwgMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdIDwgdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1lbHNlIGlmIChkID4gMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID4gdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVNwZWVkKCkge1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBGcmFtZS5nZXRSZWN0KCh0aGlzLnRhcmdldC54IC0gdGhpcy5jdXJyZW50LngpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LnkgLSB0aGlzLmN1cnJlbnQueSkgLyBGcmFtZS5BTklNX1NURVBTLCAodGhpcy50YXJnZXQud2lkdGggLSB0aGlzLmN1cnJlbnQud2lkdGgpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LmhlaWdodCAtIHRoaXMuY3VycmVudC5oZWlnaHQpIC8gRnJhbWUuQU5JTV9TVEVQUyk7XHJcbiAgICAgICAgdGhpcy5hY2MgPSBGcmFtZS5nZXRSZWN0KDAsIDAsIDAsIDApO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVUaWxlcygpIHtcclxuICAgICAgICB3aGlsZSAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICB0aWxlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImxvYWRlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJwbmdsb2FkZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWFpbm1lbnUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2FtZWNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWFwLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRpbGVtYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImVudGl0eW1hbmFnZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5cmFuZ2UudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic21va2VtYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNwcml0ZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzbW9rZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHkudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZnJhbWUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiYWVmb250LnRzXCIgLz5cclxuY2xhc3MgQW5jaWVudEVtcGlyZXMge1xyXG5cclxuICAgIHN0YXRpYyBUSUxFX1NJWkU6IG51bWJlciA9IDI0O1xyXG4gICAgc3RhdGljIEVOVElUSUVTOiBFbnRpdHlEYXRhW107XHJcblxyXG4gICAgc3RhdGljIExJTkVfU0VHTUVOVF9MRU5HVEggPSAxMDtcclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfV0lEVEggPSA0O1xyXG4gICAgc3RhdGljIExJTkVfU0VHTUVOVF9TUEFDSU5HID0gMjtcclxuICAgIHN0YXRpYyBERUFUSF9DT1VOVCA9IDM7XHJcblxyXG4gICAgc3RhdGljIE5VTUJFUl9PRl9USUxFUzogbnVtYmVyID0gMjM7XHJcbiAgICBzdGF0aWMgVElMRVNfUFJPUDogVGlsZVtdO1xyXG4gICAgc3RhdGljIExBTkc6IHN0cmluZ1tdO1xyXG5cclxuICAgIHN0YXRpYyBnYW1lOiBQaGFzZXIuR2FtZTtcclxuICAgIGxvYWRlcjogTG9hZGVyO1xyXG4gICAgbWFpbk1lbnU6IE1haW5NZW51O1xyXG4gICAgY29udHJvbGxlcjogR2FtZUNvbnRyb2xsZXI7XHJcblxyXG4gICAgd2lkdGg6IG51bWJlciA9IDE3NjtcclxuICAgIGhlaWdodDogbnVtYmVyID0gIDIwNDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkaXZfaWQ6IHN0cmluZykge1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIFBoYXNlci5BVVRPLCBkaXZfaWQsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMubG9hZGVyID0gbmV3IExvYWRlcigpO1xyXG4gICAgICAgIHRoaXMubWFpbk1lbnUgPSBuZXcgTWFpbk1lbnUoKTtcclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgR2FtZUNvbnRyb2xsZXIoKTtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJMb2FkZXJcIiwgdGhpcy5sb2FkZXIpO1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiTWFpbk1lbnVcIiwgdGhpcy5tYWluTWVudSk7XHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJHYW1lXCIsIHRoaXMuY29udHJvbGxlcik7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuc3RhcnQoXCJMb2FkZXJcIik7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuIiwiY2xhc3MgRnJhbWVNYW5hZ2VyIGltcGxlbWVudHMgRnJhbWVEZWxlZ2F0ZSB7XHJcbiAgICBmcmFtZXM6IEZyYW1lW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgIH1cclxuICAgIGFkZEZyYW1lKGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIGZyYW1lLmRlbGVnYXRlID0gdGhpcztcclxuICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUZyYW1lKGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5mcmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZnJhbWUgb2YgdGhpcy5mcmFtZXMpIHtcclxuICAgICAgICAgICAgZnJhbWUudXBkYXRlKHN0ZXBzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmcmFtZVdpbGxEZXN0cm95KGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoZnJhbWUpO1xyXG4gICAgfVxyXG59XHJcbiIsImVudW0gS2V5IHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgVXAgPSAxLFxyXG4gICAgUmlnaHQgPSAyLFxyXG4gICAgRG93biA9IDQsXHJcbiAgICBMZWZ0ID0gOCxcclxuICAgIEVudGVyID0gMTYsXHJcbiAgICBFc2MgPSAzMlxyXG59O1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwdWJsaWMgYWxsX2tleXM6IEtleTtcclxuXHJcbiAgICBwcml2YXRlIGtleV91cDogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X3JpZ2h0OiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfZG93bjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2xlZnQ6IFBoYXNlci5LZXk7XHJcbiAgICBwcml2YXRlIGtleV9lbnRlcjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2VzYzogUGhhc2VyLktleTtcclxuXHJcbiAgICBwcml2YXRlIGxhc3Rfa2V5czogS2V5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBQaGFzZXIuSW5wdXQpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyA9IEtleS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmtleV91cCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xyXG4gICAgICAgIHRoaXMua2V5X2Rvd24gPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xyXG4gICAgICAgIHRoaXMua2V5X3JpZ2h0ID0gaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfbGVmdCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfZW50ZXIgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVOVEVSKTtcclxuICAgICAgICB0aGlzLmtleV9lc2MgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVTQyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFsbF9rZXlzICYga2V5KSAhPSAwO1xyXG4gICAgfVxyXG4gICAgY2xlYXJLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyAmPSB+a2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY3VycmVudF9rZXlzOiBLZXkgPSBLZXkuTm9uZTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LlVwLCB0aGlzLmtleV91cC5pc0Rvd24pO1xyXG4gICAgICAgIGN1cnJlbnRfa2V5cyB8PSB0aGlzLnVwZGF0ZUtleShLZXkuUmlnaHQsIHRoaXMua2V5X3JpZ2h0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5Eb3duLCB0aGlzLmtleV9kb3duLmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5MZWZ0LCB0aGlzLmtleV9sZWZ0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5FbnRlciwgdGhpcy5rZXlfZW50ZXIuaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkVzYywgdGhpcy5rZXlfZXNjLmlzRG93bik7XHJcbiAgICAgICAgdGhpcy5sYXN0X2tleXMgPSBjdXJyZW50X2tleXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHNldEtleShrZXk6IEtleSwgeWVzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyBePSAoLXllcyBeIHRoaXMuYWxsX2tleXMpICYga2V5O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB3YXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmxhc3Rfa2V5cyAmIGtleSkgIT0gMDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlS2V5KGtleTogS2V5LCBpc19kb3duOiBib29sZWFuKTogS2V5IHtcclxuICAgICAgICBpZiAoaXNfZG93biAhPSB0aGlzLndhc0tleVByZXNzZWQoa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEtleShrZXksIGlzX2Rvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNfZG93biA/IGtleSA6IDA7XHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgTWVudUdvbGRJbmZvIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIGdvbGRfYW1vdW50OiBBRUZvbnQ7XHJcbiAgICBoZWFkX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBoZWFkX2ljb246IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDY0LCA0MCwgZ3JvdXAsIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KGFsbGlhbmNlOiBBbGxpYW5jZSwgZ29sZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIGluZm9ybWF0aW9uIGluc2lkZSBtZW51XHJcblxyXG4gICAgICAgIGxldCBjb2xvcjogbnVtYmVyO1xyXG4gICAgICAgIGxldCBmcmFtZTogbnVtYmVyO1xyXG4gICAgICAgIGxldCB4OiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGFsbGlhbmNlID09IEFsbGlhbmNlLkJsdWUpIHtcclxuICAgICAgICAgICAgY29sb3IgPSAweDAwMDBmZjtcclxuICAgICAgICAgICAgZnJhbWUgPSAwO1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2xvciA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICBmcmFtZSA9IDE7XHJcbiAgICAgICAgICAgIHggPSAyNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5iZWdpbkZpbGwoY29sb3IpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5kcmF3UmVjdCgwLCAxNywgdGhpcy53aWR0aCwgMTcpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24ueCA9IHg7XHJcblxyXG4gICAgICAgIHRoaXMuZ29sZF9hbW91bnQuc2V0VGV4dChnb2xkLnRvU3RyaW5nKCkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGNvbnRlbnQgKHNwcml0ZXMsIHRleHQgZXRjKVxyXG5cclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMiwgMiwgXCJnb2xkXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDE2LCBcInBvcnRyYWl0XCIsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgbGV0IGhlYWRfY3JvcCA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKDAsIDEwLCB0aGlzLmhlYWRfaWNvbi53aWR0aCwgMTgpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLmNyb3AoaGVhZF9jcm9wKTtcclxuXHJcbiAgICAgICAgdGhpcy5nb2xkX2Ftb3VudCA9IG5ldyBBRUZvbnQoMjgsIDUsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNZW51RGVmSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuICAgIHByaXZhdGUgdGlsZV9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIGRlZl9hbW91bnQ6IEFFRm9udDtcclxuICAgIHByaXZhdGUgZW50aXR5X2ljb246IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDQwLCA1MiwgZ3JvdXAsIERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KHBvc2l0aW9uOiBQb3MsIG1hcDogTWFwLCBlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvcm1hdGlvbiBpbnNpZGUgbWVudVxyXG5cclxuICAgICAgICBsZXQgdGlsZSA9IG1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSBtYXAuZ2V0QWxsaWFuY2VBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVfaWNvbi5rZXkgIT0gXCJidWlsZGluZ3NfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5sb2FkVGV4dHVyZShcImJ1aWxkaW5nc19cIiArICg8bnVtYmVyPiBhbGxpYW5jZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGlsZV9pY29uLmZyYW1lID0gdGlsZSA9PSBUaWxlLkhvdXNlID8gMCA6IDE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGlsZV9pY29uLmtleSAhPSBcInRpbGVzMFwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5sb2FkVGV4dHVyZShcInRpbGVzMFwiKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5mcmFtZSA9IFRpbGVNYW5hZ2VyLmdldEJhc2VJbWFnZUluZGV4Rm9yVGlsZSh0aWxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGVmX2Ftb3VudC5zZXRUZXh0KE1hcC5nZXREZWZGb3JUaWxlKHRpbGUsIGVudGl0eSkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIGlmICghIWVudGl0eSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNpemUoNjgsIDUyKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW50aXR5X2ljb24ua2V5ICE9IFwidW5pdF9pY29uc19cIiArIGVudGl0eS5hbGxpYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi5sb2FkVGV4dHVyZShcInVuaXRfaWNvbnNfXCIgKyBlbnRpdHkuYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X2ljb24uZnJhbWUgPSBlbnRpdHkudHlwZTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNpemUoNDAsIDUyKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBjb250ZW50IChzcHJpdGVzLCB0ZXh0IGV0YylcclxuXHJcbiAgICAgICAgbGV0IHRpbGVfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGlsZV9ncmFwaGljcy5saW5lU3R5bGUoMSwgMHgwMDAwMDApO1xyXG4gICAgICAgIHRpbGVfZ3JhcGhpY3MuZHJhd1JlY3QoNiwgMiwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMSk7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9pY29uID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg3LCAzLCBcInRpbGVzMFwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIGxldCB0aWxlX2Nyb3AgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZSgxLCAxLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAyLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAyKTtcclxuICAgICAgICB0aGlzLnRpbGVfaWNvbi5jcm9wKHRpbGVfY3JvcCk7XHJcblxyXG4gICAgICAgIGxldCBkZWZfZm9udCA9IG5ldyBBRUZvbnQoNywgMjgsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcbiAgICAgICAgZGVmX2ZvbnQuc2V0VGV4dChcIkRFRlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWZfYW1vdW50ID0gbmV3IEFFRm9udCgxNCwgMzcsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDM1LCAyLCBcInVuaXRfaWNvbnNfMVwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2ljb24udmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgIH1cclxufVxyXG5lbnVtIEFjdGlvbiB7XHJcbiAgICBOb25lLFxyXG4gICAgTUFJTl9NRU5VLFxyXG4gICAgTU9WRSxcclxuICAgIEFUVEFDSyxcclxuICAgIEJVWSxcclxuICAgIEVORF9NT1ZFLFxyXG4gICAgQ0FOQ0VMLFxyXG4gICAgRU5EX1RVUk4sXHJcbiAgICBPQ0NVUFksXHJcbiAgICBSQUlTRSxcclxuICAgIE1BUCxcclxuICAgIE9CSkVDVElWRVxyXG59XHJcbmNsYXNzIE1lbnVPcHRpb25zIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIHNlbGVjdGVkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBBY3Rpb25bXTtcclxuICAgIHByaXZhdGUgZm9udHM6IEFFRm9udFtdO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc3RhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcG9pbnRlcl9zbG93OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGU7XHJcblxyXG4gICAgc3RhdGljIGdldE1haW5NZW51T3B0aW9ucygpOiBBY3Rpb25bXSB7XHJcbiAgICAgICAgcmV0dXJuIFtBY3Rpb24uRU5EX1RVUk4sIEFjdGlvbi5NQVAsIEFjdGlvbi5PQkpFQ1RJVkUsIEFjdGlvbi5NQUlOX01FTlVdO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE9wdGlvblN0cmluZyhvcHRpb246IEFjdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKG9wdGlvbiA9PSBBY3Rpb24uTm9uZSkgeyByZXR1cm4gXCJcIjsgfVxyXG4gICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5MQU5HWzI2ICsgPG51bWJlcj4gb3B0aW9uXTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yIChncm91cDogUGhhc2VyLkdyb3VwLCBhbGlnbjogRGlyZWN0aW9uLCBvcHRpb25zOiBBY3Rpb25bXSwgZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudV9kZWxlZ2F0ZSA9IGRlbGVnYXRlXHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBtYXhfbGVuZ3RoID0gMDtcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbik7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG1heF9sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAqIDEzICsgMTY7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gQUVGb250LmdldFdpZHRoKEFFRm9udFN0eWxlLk5vcm1hbCwgbWF4X2xlbmd0aCkgKyAzMSArIDEzO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUod2lkdGgsIGhlaWdodCwgZ3JvdXAsIGFsaWduLCBEaXJlY3Rpb24uQWxsICYgfmFsaWduLCBhbGlnbik7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIGxldCB5ID0gNjtcclxuICAgICAgICBsZXQgZm9udHM6IEFFRm9udFtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIG9mIHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IE1lbnVPcHRpb25zLmdldE9wdGlvblN0cmluZyhvcHRpb24pO1xyXG4gICAgICAgICAgICBmb250cy5wdXNoKG5ldyBBRUZvbnQoMjUsIHksIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuTm9ybWFsLCB0ZXh0KSk7XHJcbiAgICAgICAgICAgIHkgKz0gMTM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZm9udHMgPSBmb250cztcclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg0LCA0LCBcInBvaW50ZXJcIiwgbnVsbCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc3RhdGUgPSAyO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuXHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5jbG9zZU1lbnUoKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KEdhbWVDb250ZXh0Lk9wdGlvbnMpOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIG5leHQoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCsrO1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkID49IHRoaXMub3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJldigpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkLS07XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRTZWxlY3RlZCgpOiBBY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZF07XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zbG93Kys7XHJcbiAgICAgICAgaWYgKHRoaXMucG9pbnRlcl9zbG93ID4gMTApIHtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJfc3RhdGUgPSAyIC0gdGhpcy5wb2ludGVyX3N0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnkgPSA0ICsgdGhpcy5zZWxlY3RlZCAqIDEzO1xyXG4gICAgICAgIHRoaXMucG9pbnRlci54ID0gNCArIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB0aGlzLnBvaW50ZXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lbnVTaG9wVW5pdHMgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgZW50aXR5X2ltYWdlczogUGhhc2VyLkltYWdlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoNjQsIGdyb3VwLmdhbWUuaGVpZ2h0IC0gNDAsIGdyb3VwLCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGltYWdlIG9mIHRoaXMuZW50aXR5X2ltYWdlcykge1xyXG4gICAgICAgICAgICBpbWFnZS5sb2FkVGV4dHVyZShcInVuaXRfaWNvbnNfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpLCBpbWFnZS5mcmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaW1hZ2VzID0gW107XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbaV07XHJcblxyXG4gICAgICAgICAgICBpZiAoZGF0YS5jb3N0ID4gMTAwMCkgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgbGV0IHggPSAoaSAlIDIpICogMjcgKyAzO1xyXG4gICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoaSAvIDIpICogMjkgKyA1O1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSh4LCB5LCBcInVuaXRfaWNvbnNfMFwiLCBpLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pbWFnZXMucHVzaChpbWFnZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5pbnRlcmZhY2UgTWVudURlbGVnYXRlIHtcclxuICAgIG9wZW5NZW51KGNvbnRleHQ6IEdhbWVDb250ZXh0KTogdm9pZDtcclxuICAgIGNsb3NlTWVudSgpOiB2b2lkO1xyXG59XHJcblxyXG5jbGFzcyBOb3RpZmljYXRpb24gZXh0ZW5kcyBGcmFtZSB7XHJcbiAgICBwcml2YXRlIGZvbnQ6IEFFRm9udDtcclxuICAgIHByaXZhdGUgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChncm91cDogUGhhc2VyLkdyb3VwLCB0ZXh0OiBzdHJpbmcsIGRlbGVnYXRlOiBNZW51RGVsZWdhdGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVfZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgbGV0IHdpZHRoID0gQUVGb250LmdldFdpZHRoKEFFRm9udFN0eWxlLk5vcm1hbCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSh3aWR0aCArIDMwLCAyOSwgZ3JvdXAsIERpcmVjdGlvbi5Ob25lLCBEaXJlY3Rpb24uQWxsLCBEaXJlY3Rpb24uTm9uZSk7XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCh0ZXh0KTtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShHYW1lQ29udGV4dC5Ob3RpZmljYXRpb24pOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gQUVGb250LmdldFdpZHRoKEFFRm9udFN0eWxlLk5vcm1hbCwgdGV4dC5sZW5ndGgpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU2l6ZSh3aWR0aCArIDMwLCAyOSwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuZm9udC5zZXRUZXh0KHRleHQpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGFuaW1hdGlvbkRpZEVuZChhbmltYXRpb246IEZyYW1lQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgaWYgKChhbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5TaG93KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICB9ZWxzZSBpZiAoKGFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkRlc3Ryb3kpICE9IDApIHtcclxuICAgICAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5jbG9zZU1lbnUoKTsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5mb250ID0gbmV3IEFFRm9udCg5LCA2LCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLk5vcm1hbCwgdGV4dCk7XHJcbiAgICB9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
