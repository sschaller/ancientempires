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

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Interaction = (function () {
    function Interaction(alliance, map, delegate) {
        this.alliance = alliance;
        this.map = map;
        this.delegate = delegate;
    }
    Interaction.prototype.isPlayer = function () {
        return false;
    };
    Interaction.prototype.isActive = function () {
        return !!this.getCursorPosition();
    };
    Interaction.prototype.setCursorPosition = function (position) {
        this.cursor_position = position.copy();
    };
    Interaction.prototype.getCursorPosition = function () {
        if (!!this.cursor_position) {
            return this.cursor_position.copy();
        }
        var king = this.map.getKingPosition(this.alliance);
        if (!!king) {
            return king.copy();
        }
        var own_entities = this.map.getEntitiesWith(this.alliance);
        if (own_entities.length > 0) {
            return own_entities[0].position;
        }
        return null;
    };
    Interaction.prototype.start = function () {
        // implement
    };
    Interaction.prototype.run = function () {
        // implemented
    };
    Interaction.prototype.entityDidMove = function (entity) {
        // implement
    };
    Interaction.prototype.entityDidAnimation = function (entity) {
        // implement
    };
    Interaction.prototype.openMenu = function (context) {
        // implement
    };
    Interaction.prototype.closeMenu = function (context) {
        // implement
    };
    return Interaction;
}());
var NoAI = (function (_super) {
    __extends(NoAI, _super);
    function NoAI() {
        _super.apply(this, arguments);
    }
    NoAI.prototype.run = function () {
        this.delegate.nextTurn();
    };
    return NoAI;
}(Interaction));

/// <reference path="interaction.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var AIState;
(function (AIState) {
    AIState[AIState["None"] = 0] = "None";
    AIState[AIState["Select"] = 1] = "Select";
    AIState[AIState["Moving"] = 2] = "Moving";
    AIState[AIState["Action"] = 3] = "Action";
    AIState[AIState["Attack"] = 4] = "Attack";
    AIState[AIState["Raise"] = 5] = "Raise";
    AIState[AIState["Deselect"] = 6] = "Deselect";
})(AIState || (AIState = {}));
var AI = (function (_super) {
    __extends(AI, _super);
    function AI(alliance, map, delegate) {
        _super.call(this, alliance, map, delegate);
        this.state = AIState.None;
        this.pause = false;
        this.test = [EntityType.Wizard, EntityType.Lizard];
    }
    AI.getTileScore = function (tile) {
        switch (tile) {
            case Tile.Forest:
            case Tile.Hill:
                return 2;
            case Tile.Mountain:
            case Tile.Water:
                return 3;
        }
        return 1;
    };
    AI.prototype.openMenu = function (context) {
        if (context == InputContext.Wait) {
            this.pause = true;
        }
    };
    AI.prototype.closeMenu = function (context) {
        if (context == InputContext.Wait) {
            this.pause = false;
        }
    };
    AI.prototype.entityDidMove = function (entity) {
        this.state = AIState.Action;
    };
    AI.prototype.entityDidAnimation = function (entity) {
        this.delegate.cursor.show();
        this.state = AIState.Deselect;
    };
    AI.prototype.run = function () {
        // wait for no movement
        if (!this.delegate.camera_still || !this.delegate.cursor_still || this.pause) {
            return;
        }
        if (this.state != AIState.None) {
            switch (this.state) {
                case AIState.Select:
                    if (this.delegate.cursor_target.match(this.entity_target)) {
                        this.delegate.moveEntity(this.selected_entity, this.entity_target, true);
                        this.state = AIState.Moving;
                    }
                    else {
                        this.delegate.cursor_target = this.entity_target.copy();
                    }
                    break;
                case AIState.Action:
                    if (!!this.entity_attack) {
                        if (this.delegate.cursor_target.match(this.entity_attack.position)) {
                            this.delegate.attackEntity(this.selected_entity, this.entity_attack);
                            this.state = AIState.Attack;
                        }
                        else {
                            this.delegate.cursor_target = this.entity_attack.position.copy();
                            this.delegate.cursor.hide();
                            this.delegate.showRange(EntityRangeType.Attack, this.selected_entity);
                            this.map.selectTargetInRange(this.entity_attack);
                        }
                        return;
                    }
                    if (!!this.entity_raise) {
                        if (this.delegate.cursor_target.match(this.entity_raise.position)) {
                            this.delegate.raiseEntity(this.selected_entity, this.entity_raise);
                            this.state = AIState.Raise;
                        }
                        else {
                            this.delegate.showRange(EntityRangeType.Raise, this.selected_entity);
                            this.delegate.cursor_target = this.entity_raise.position.copy();
                        }
                        return;
                    }
                    if (this.selected_entity.hasFlag(EntityFlags.CanOccupyHouse) && this.map.getTileAt(this.entity_target) == Tile.House && this.map.getAllianceAt(this.entity_target) != this.alliance) {
                        this.delegate.occupy(this.entity_target, this.alliance);
                    }
                    this.state = AIState.Deselect;
                    break;
                case AIState.Deselect:
                    this.selected_entity.updateState(EntityState.Moved, true);
                    this.delegate.deselectEntity(true);
                    this.state = AIState.None;
                    break;
            }
            return;
        }
        for (var _i = 0, _a = this.map.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance != this.alliance || entity.state != EntityState.Ready) {
                continue;
            }
            if (entity.type == 9) {
                // king always last
                if (this.map.countEntitiesWith(this.alliance, EntityState.Ready) != 1) {
                    continue;
                }
                if (this.map.getTileAt(entity.position) == Tile.Castle && this.map.getAllianceAt(entity.position) == entity.alliance) {
                    // king is in castle owned by him
                    if (this.map.countEntitiesWith(this.alliance, undefined, EntityType.Soldier) < 2 && this.checkCostAndSpace(entity.position, EntityType.Soldier)) {
                        // if less than two soldiers, buy one if enough cost and space around castle
                        entity = this.delegate.buyEntity(entity, EntityType.Soldier);
                    }
                    else if (this.test.length > 0) {
                        if (this.delegate.getGoldForAlliance(this.alliance) >= AncientEmpires.ENTITIES[this.test[0]].cost) {
                            entity = this.delegate.buyEntity(entity, this.test[0]);
                            this.test.shift();
                        }
                    }
                    else {
                        var possible = [];
                        for (var type = 1; type < AncientEmpires.ENTITIES.length; type++) {
                            if (this.map.countEntitiesWith(this.alliance, undefined, type) >= 1 && AncientEmpires.ENTITIES[type].cost < 600) {
                                continue;
                            }
                            if (!this.checkCostAndSpace(entity.position, type)) {
                                continue;
                            }
                            possible.push(type);
                        }
                        if (possible.length > 0) {
                            var choice = possible[Math.floor(Math.random() * possible.length)];
                            entity = this.delegate.buyEntity(entity, choice);
                        }
                    }
                }
            }
            this.delegate.cursor_target = entity.position.copy();
            this.state = AIState.Select;
            this.entity_selected = entity;
            this.selectEntity(entity);
            var entity_range = this.delegate.showRange(EntityRangeType.Move, entity);
            entity_range.sort();
            this.soldiers = this.map.getEntitiesWith(this.alliance, undefined, EntityType.Soldier);
            this.nearest_house = this.map.getNearestHouseForEntity(entity);
            var best_move_score = 0;
            for (var _b = 0, _c = entity_range.waypoints; _b < _c.length; _b++) {
                var waypoint = _c[_b];
                var e = this.map.getEntityAt(waypoint.position);
                if (!!e && e != entity) {
                    continue;
                }
                if (!entity.hasFlag(EntityFlags.CantAttackAfterMoving) || e == entity) {
                    var targets = this.map.getAttackTargets(entity, waypoint.position);
                    for (var _d = 0, targets_1 = targets; _d < targets_1.length; _d++) {
                        var target = targets_1[_d];
                        var score_1 = this.getScore(entity, waypoint.position, target, null);
                        if (score_1 <= best_move_score) {
                            continue;
                        }
                        best_move_score = score_1;
                        this.entity_raise = null;
                        this.entity_attack = target;
                        this.entity_target = waypoint.position.copy();
                    }
                }
                if (entity.hasFlag(EntityFlags.CanRaise)) {
                    var targets = this.map.getRaiseTargets(entity, waypoint.position);
                    for (var _e = 0, targets_2 = targets; _e < targets_2.length; _e++) {
                        var target = targets_2[_e];
                        var score_2 = this.getScore(entity, waypoint.position, null, target);
                        if (score_2 <= best_move_score) {
                            continue;
                        }
                        best_move_score = score_2;
                        this.entity_attack = null;
                        this.entity_raise = target;
                        this.entity_target = waypoint.position.copy();
                    }
                }
                var score = this.getScore(entity, waypoint.position, null, null);
                if (score <= best_move_score) {
                    continue;
                }
                best_move_score = score;
                this.entity_attack = null;
                this.entity_raise = null;
                this.entity_target = waypoint.position.copy();
            }
            return;
        }
        this.soldiers = null;
        this.delegate.nextTurn();
    };
    AI.prototype.selectEntity = function (entity) {
        this.selected_entity = entity;
        this.delegate.selectEntity(entity);
    };
    AI.prototype.checkCostAndSpace = function (position, type) {
        // check for enough gold
        if (this.delegate.getGoldForAlliance(this.alliance) < AncientEmpires.ENTITIES[type].cost) {
            return false;
        }
        // check for empty space around castle
        var waypoints = this.map.entity_range.calculateWaypoints(position, this.alliance, type, AncientEmpires.ENTITIES[type].mov, true);
        // cant be on castle -> min 2 waypoints
        if (waypoints.length < 2) {
            return false;
        }
        return true;
    };
    AI.prototype.getScore = function (entity, position, attack, raise) {
        var score = 0;
        switch (entity.type) {
            case EntityType.Soldier:
                // move towards nearest house (unoccupied for soldiers)
                if (!!this.map.getKingPosition(this.alliance) && !!this.nearest_house) {
                    var score_house = this.map.width + this.map.height - position.distanceTo(this.nearest_house.position);
                    score += score_house * score_house;
                }
                // give advantages to certain tiles (stay away from difficult terrain)
                if (AI.getTileScore(this.map.getTileAt(position)) <= 1) {
                    score += 5;
                }
                // spread soldiers
                for (var _i = 0, _a = this.soldiers; _i < _a.length; _i++) {
                    var soldier = _a[_i];
                    if (soldier == entity) {
                        continue;
                    }
                    var score_soldiers = entity.getDistanceToEntity(soldier);
                    score += score_soldiers * score_soldiers;
                }
                // able to occupy house
                if (this.map.getTileAt(position) == Tile.House && this.map.getAllianceAt(position) != entity.alliance && !attack) {
                    score += 200;
                }
                break;
            case EntityType.Wizard:
                // able to raise unit
                if (!!raise) {
                    score += 100;
                }
                break;
            case EntityType.King:
                // keep still
                if (position.match(entity.position)) {
                    score += 200;
                }
                break;
        }
        // get score for attack
        if (!!attack) {
            if (attack.shouldCounter(position)) {
                score += entity.getPowerEstimate(position, this.map) - attack.getPowerEstimate(position, this.map) + 10 - attack.health;
            }
            else {
                score += entity.getPowerEstimate(position, this.map) * 2;
            }
            if (attack.type == EntityType.King) {
                score += 10;
            }
        }
        score += this.map.getDefAt(position, entity.type) * 2;
        var enemy_king_pos = this.map.getKingPosition(this.alliance == Alliance.Red ? Alliance.Blue : Alliance.Red);
        if (!!enemy_king_pos) {
            score += (this.map.width + this.map.height - position.distanceTo(enemy_king_pos)) * 2;
        }
        // get score if injured on house (healing effect)
        if (this.map.getTileAt(position) == Tile.House && this.map.getAllianceAt(position) == entity.alliance) {
            score += (10 - entity.health) * 2;
        }
        // if injured, move towards next house
        if (entity.health < 5 && entity.type != EntityType.Soldier && !!this.nearest_house) {
            var score_inj = this.map.width + this.map.height - position.distanceTo(this.nearest_house.position);
            score += score_inj * score_inj;
        }
        if (this.map.getMap() == 2 && !!this.nearest_house) {
            var dx = Math.abs(this.nearest_house.position.x - position.x) - 1;
            var dy = Math.abs(this.nearest_house.position.y - position.y) - 3;
            if (dx < 0) {
                dx = 0;
            }
            if (dy < 0) {
                dy = 0;
            }
            var score_m2 = this.map.width + this.map.height - 2 * (dx + dy);
            score += score_m2 * score_m2;
        }
        score += 10 * entity.position.distanceTo(position) / (entity.data.mov - 1);
        return Math.floor(score);
    };
    return AI;
}(Interaction));

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
    Pos.prototype.distanceTo = function (p) {
        return Math.abs(p.x - this.x) + Math.abs(p.y - this.y);
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
    Pos.prototype.getI = function () {
        return { x: this.x, y: this.y };
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

var Sprite = (function () {
    function Sprite() {
    }
    Sprite.prototype.init = function (world_position, group, name, frames) {
        if (frames === void 0) { frames = []; }
        this.world_position = world_position;
        this.offset_x = 0;
        this.offset_y = 0;
        this.name = name;
        this.frames = frames;
        this.sprite = group.game.add.sprite(this.world_position.x, this.world_position.y, this.name);
        this.sprite.frame = this.frames[0];
        group.add(this.sprite);
    };
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

/// <reference path="pngloader.ts" />
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
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        this.game.scale.setUserScale(2, 2);
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
        PNGLoader.loadImage(waiter, "splash");
        PNGLoader.loadImage(waiter, "splashbg");
        PNGLoader.loadImage(waiter, "splashfg");
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
    Frame.prototype.show = function (animate, offset_y) {
        if (animate === void 0) { animate = false; }
        if (offset_y === void 0) { offset_y = 0; }
        this.animation = FrameAnimation.None;
        this.target = this.getAlignmentRect(offset_y);
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
    Frame.prototype.getAlignmentRect = function (offset_y) {
        if (offset_y === void 0) { offset_y = 0; }
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
        // exception for main menu ..
        if (offset_y > 0) {
            rect.y = offset_y;
            return rect;
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

/// <reference path="frame.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MiniMap = (function (_super) {
    __extends(MiniMap, _super);
    function MiniMap(map, group, menu_delegate) {
        _super.call(this);
        this.map = map;
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
        for (var _i = 0, _a = this.map.entities; _i < _a.length; _i++) {
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

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="interaction.ts" />
/// <reference path="minimap.ts" />
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(alliance, map, delegate, keys) {
        _super.call(this, alliance, map, delegate);
        this.keys = keys;
        this.context = [InputContext.Map];
    }
    Player.prototype.isPlayer = function () {
        return true;
    };
    Player.prototype.start = function () {
        this.keys.all_keys = Key.None;
    };
    Player.prototype.run = function () {
        this.keys.update();
        if (this.keys.all_keys == Key.None) {
            return;
        }
        switch (this.context[this.context.length - 1]) {
            case InputContext.Map:
                var cursor_still = this.delegate.cursor.world_position.x % 24 == 0 && this.delegate.cursor.world_position.y % 24 == 0;
                if (this.keys.isKeyPressed(Key.Up) && cursor_still && this.delegate.cursor_target.y > 0) {
                    this.delegate.cursor_target.move(Direction.Up);
                }
                else if (this.keys.isKeyPressed(Key.Right) && cursor_still && this.delegate.cursor_target.x < this.map.width - 1) {
                    this.delegate.cursor_target.move(Direction.Right);
                }
                else if (this.keys.isKeyPressed(Key.Down) && cursor_still && this.delegate.cursor_target.y < this.map.height - 1) {
                    this.delegate.cursor_target.move(Direction.Down);
                }
                else if (this.keys.isKeyPressed(Key.Left) && cursor_still && this.delegate.cursor_target.x > 0) {
                    this.delegate.cursor_target.move(Direction.Left);
                }
                else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.pickPosition(this.delegate.cursor_target);
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    var entity = this.selected_entity;
                    this.deselectEntity(false);
                    if (!!entity && entity.position.match(this.map.getKingPosition(this.alliance)) && entity.data.cost <= 1000) {
                        // entity was bought, add gold back and remove entity
                        var gold = this.delegate.getGoldForAlliance(this.alliance);
                        this.delegate.setGoldForAlliance(this.alliance, gold + entity.data.cost);
                        this.map.removeEntity(entity);
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
                if (this.keys.isKeyPressed(Key.Up) && this.delegate.cursor_target.y > 0) {
                    this.keys.clearKeyPressed(Key.Up);
                    var entity = this.map.nextTargetInRange(Direction.Up);
                    this.delegate.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Right) && this.delegate.cursor_target.x < this.map.width - 1) {
                    this.keys.clearKeyPressed(Key.Right);
                    var entity = this.map.nextTargetInRange(Direction.Right);
                    this.delegate.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Down) && this.delegate.cursor_target.y < this.map.height - 1) {
                    this.keys.clearKeyPressed(Key.Down);
                    var entity = this.map.nextTargetInRange(Direction.Down);
                    this.delegate.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Left) && this.delegate.cursor_target.x > 0) {
                    this.keys.clearKeyPressed(Key.Left);
                    var entity = this.map.nextTargetInRange(Direction.Left);
                    this.delegate.cursor_target = entity.position.copy();
                }
                else if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    this.delegate.cursor.show();
                    this.context.pop();
                    var entity = this.map.nextTargetInRange(Direction.None);
                    this.pickEntity(entity);
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    this.delegate.cursor_target = this.selected_entity.position.copy();
                    this.delegate.cursor.show();
                    this.context.pop();
                    var entity = this.selected_entity;
                    this.delegate.deselectEntity(false);
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
                    var entity = this.delegate.buyEntity(this.selected_entity, entity_type);
                    if (!!entity) {
                        this.deselectEntity(false);
                        this.closeShop();
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
                    if (!!this.fullscreen_group) {
                        this.fullscreen_group.destroy(true);
                        this.fullscreen_group = null;
                        this.context.pop();
                    }
                    else {
                        this.closeMap();
                    }
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    if (!!this.fullscreen_group) {
                        this.fullscreen_group.destroy(true);
                        this.fullscreen_group = null;
                        this.context.pop();
                    }
                    else {
                        this.closeMap();
                    }
                }
                break;
            case InputContext.Instructions:
                if (this.keys.isKeyPressed(Key.Enter)) {
                    this.keys.clearKeyPressed(Key.Enter);
                    if (!this.fullscreen_group) {
                        break;
                    }
                    var next = this.instruction_nr + 1;
                    if (next <= 17) {
                        this.instruction_nr = next;
                        MainMenu.showInstructions(this.fullscreen_group, next);
                    }
                }
                else if (this.keys.isKeyPressed(Key.Right)) {
                    this.keys.clearKeyPressed(Key.Right);
                    if (!this.fullscreen_group) {
                        break;
                    }
                    var next = this.instruction_nr + 1;
                    if (next <= 17) {
                        this.instruction_nr = next;
                        MainMenu.showInstructions(this.fullscreen_group, next);
                    }
                }
                else if (this.keys.isKeyPressed(Key.Left)) {
                    this.keys.clearKeyPressed(Key.Left);
                    if (!this.fullscreen_group) {
                        break;
                    }
                    var prev = this.instruction_nr - 1;
                    if (prev >= 0) {
                        this.instruction_nr = prev;
                        MainMenu.showInstructions(this.fullscreen_group, prev);
                    }
                }
                else if (this.keys.isKeyPressed(Key.Esc)) {
                    this.keys.clearKeyPressed(Key.Esc);
                    if (!this.fullscreen_group) {
                        break;
                    }
                    this.fullscreen_group.destroy(true);
                    this.fullscreen_group = null;
                    this.context.pop();
                }
                break;
        }
    };
    Player.prototype.openMenu = function (context) {
        if (context == InputContext.Wait) {
            this.context.push(context);
        }
        else if (context == InputContext.Shop) {
            this.delegate.hideInfo(false);
        }
        else {
            this.delegate.hideInfo(true);
        }
    };
    Player.prototype.closeMenu = function (context) {
        if (context == InputContext.Wait && context == this.context[this.context.length - 1]) {
            this.context.pop();
        }
        var active_context = this.context[this.context.length - 1];
        switch (active_context) {
            case InputContext.Map:
            case InputContext.Selection:
                this.delegate.showInfo(true);
                break;
            case InputContext.Shop:
                this.delegate.showInfo(false);
                break;
        }
    };
    Player.prototype.entityDidMove = function (entity) {
        var options = this.map.getEntityOptions(entity, true);
        if (options.length < 1) {
            return;
        }
        this.showOptionMenu(options);
    };
    Player.prototype.entityDidAnimation = function (entity) {
        this.context.pop();
        this.selected_entity.updateState(EntityState.Moved, true);
        this.deselectEntity(true);
    };
    Player.prototype.selectEntity = function (entity) {
        var options = this.map.getEntityOptions(entity, false);
        // no options mean: not in alliance or already moved
        if (options.length < 1) {
            return false;
        }
        // so method can be used to show options for entity again -> must be same entity as selected
        if (!this.selected_entity) {
            this.selected_entity = entity;
            this.delegate.selectEntity(entity);
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
    Player.prototype.deselectEntity = function (changed) {
        this.delegate.deselectEntity(changed);
        this.last_entity_position = null;
        this.selected_entity = null;
    };
    Player.prototype.showOptionMenu = function (options) {
        this.options_menu = new MenuOptions(this.delegate.frame_manager.group, Direction.Right, options, this);
        this.delegate.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    };
    Player.prototype.showMainMenu = function (actions) {
        this.options_menu = new MenuOptions(this.delegate.frame_manager.group, Direction.None, actions, this, Direction.Up);
        this.delegate.frame_manager.addFrame(this.options_menu);
        this.options_menu.show(true);
        this.context.push(InputContext.Options);
    };
    Player.prototype.selectOption = function (option) {
        switch (option) {
            case Action.OCCUPY:
                this.delegate.occupy(this.selected_entity.position, this.selected_entity.alliance);
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity(true);
                break;
            case Action.ATTACK:
                this.context.push(InputContext.Selection);
                this.delegate.showRange(EntityRangeType.Attack, this.selected_entity);
                this.delegate.cursor_target = this.map.nextTargetInRange(Direction.None).position.copy();
                this.delegate.cursor.hide();
                break;
            case Action.RAISE:
                this.context.push(InputContext.Selection);
                this.delegate.showRange(EntityRangeType.Raise, this.selected_entity);
                this.delegate.cursor_target = this.map.nextTargetInRange(Direction.None).position.copy();
                break;
            case Action.MOVE:
                this.delegate.showRange(EntityRangeType.Move, this.selected_entity);
                break;
            case Action.BUY:
                this.openShop(this.selected_entity.alliance);
                break;
            case Action.END_MOVE:
                this.selected_entity.updateState(EntityState.Moved, true);
                this.deselectEntity(true);
                break;
            case Action.END_TURN:
                this.delegate.nextTurn();
                break;
            case Action.MAIN_MENU:
                this.showMainMenu(MenuOptions.getMainMenuOptions(true));
                break;
            case Action.MAP:
                this.openMap();
                break;
            case Action.SAVE_GAME:
                this.delegate.saveGame();
                break;
            case Action.LOAD_GAME:
                this.delegate.loadGame();
                break;
            case Action.EXIT:
                this.delegate.exitGame();
                break;
            case Action.ABOUT:
                this.context.push(InputContext.Ack);
                this.fullscreen_group = MainMenu.showAbout(this.delegate.game);
                break;
            case Action.INSTRUCTIONS:
                this.context.push(InputContext.Instructions);
                this.fullscreen_group = this.delegate.game.add.group();
                this.fullscreen_group.fixedToCamera = true;
                this.instruction_nr = 0;
                MainMenu.showInstructions(this.fullscreen_group);
                break;
            case Action.CANCEL:
                if (!!this.last_entity_position) {
                    // last action was walking. reset entity & set cursor to current position
                    this.delegate.cursor_target = this.selected_entity.position;
                    this.delegate.moveEntity(this.selected_entity, this.last_entity_position, false);
                    this.last_entity_position = null;
                    this.delegate.showRange(EntityRangeType.Move, this.selected_entity);
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
    Player.prototype.pickEntity = function (entity) {
        this.context.push(InputContext.Animation);
        switch (this.map.getTypeOfRange()) {
            case EntityRangeType.Attack:
                this.delegate.attackEntity(this.selected_entity, entity);
                break;
            case EntityRangeType.Raise:
                this.delegate.raiseEntity(this.selected_entity, entity);
                break;
        }
        this.delegate.hideRange();
        this.delegate.cursor.show();
    };
    Player.prototype.pickPosition = function (position) {
        if (this.selected_entity) {
            switch (this.map.getTypeOfRange()) {
                case EntityRangeType.Move:
                    this.last_entity_position = this.selected_entity.position.copy();
                    this.delegate.moveEntity(this.selected_entity, position, true);
                    break;
            }
            return;
        }
        var entity = this.map.getEntityAt(position);
        if (!!entity) {
            // no entity selected, clicked on entity - try to select it
            var success = this.selectEntity(entity);
            if (success) {
                return;
            }
        }
        this.showOptionMenu(MenuOptions.getOffMenuOptions());
    };
    Player.prototype.openShop = function (alliance) {
        this.context.push(InputContext.Shop);
        if (!this.shop_units) {
            this.shop_units = new MenuShopUnits(this.delegate.frame_manager.group, this);
            this.delegate.frame_manager.addFrame(this.shop_units);
        }
        this.shop_units.updateContent(alliance, this.delegate.getGoldForAlliance(alliance));
        this.shop_units.show(true);
        this.shop_info = new MenuShopInfo(this.delegate.frame_manager.group, alliance);
        this.shop_info.updateContent(EntityType.Soldier);
        this.delegate.frame_manager.addFrame(this.shop_info);
        this.shop_info.show(true);
    };
    Player.prototype.closeShop = function () {
        this.context.pop();
        this.shop_units.hide(true, true);
        this.shop_units = null;
        this.shop_info.hide(true, true);
        this.shop_info = null;
    };
    Player.prototype.openMap = function () {
        this.context.push(InputContext.Ack);
        this.mini_map = new MiniMap(this.map, this.delegate.frame_manager.group, this);
        this.delegate.frame_manager.addFrame(this.mini_map);
        this.mini_map.show(true);
    };
    Player.prototype.closeMap = function () {
        this.context.pop();
        this.mini_map.hide(true, true);
        this.mini_map = null;
    };
    return Player;
}(Interaction));

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

/// <reference path="animation.ts" />
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
    function Entity(type, alliance, position) {
        _super.call(this);
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
    }
    Entity.prototype.init = function (group) {
        _super.prototype.init.call(this, this.position.getWorldPosition(), group, "unit_icons_" + this.alliance, [this.type, this.type + AncientEmpires.ENTITIES.length]);
        this.icon_moved = group.game.add.image(0, 0, "chars", 4, group);
        this.icon_moved.visible = false;
        this.icon_health = group.game.add.image(0, 0, "chars", 0, group);
        this.icon_health.visible = false;
    };
    Entity.prototype.isDead = function () {
        return this.health == 0;
    };
    Entity.prototype.hasFlag = function (flag) {
        return (this.data.flags & flag) != 0;
    };
    Entity.prototype.getDistanceToEntity = function (entity) {
        return this.position.distanceTo(entity.position);
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
        var red_health = Math.floor((atk - (def + map.getDefAt(target.position, target.type)) * (2 / 3)) * this.health / 10);
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
    Entity.prototype.getPowerEstimate = function (position, map) {
        return Math.floor((this.rank + this.data.atk + this.data.def + map.getDefAt(position, this.type)) * this.health);
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
    Entity.prototype.move = function (target, line, delegate) {
        this.path = {
            progress: 0,
            line: line,
            delegate: delegate,
            target: target
        };
    };
    Entity.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        _super.prototype.update.call(this, steps);
        if (!!this.path) {
            this.path.progress += steps;
            // first check is so we can stay at the same place
            if (this.path.line.length > 0 && this.path.progress >= this.path.line[0].length * AncientEmpires.TILE_SIZE) {
                this.path.progress -= this.path.line[0].length * AncientEmpires.TILE_SIZE;
                this.path.line.shift();
            }
            if (this.path.line.length > 0) {
                var diff = new Pos(0, 0).move(this.path.line[0].direction);
                this.world_position.x = this.path.line[0].position.x * AncientEmpires.TILE_SIZE + diff.x * this.path.progress;
                this.world_position.y = this.path.line[0].position.y * AncientEmpires.TILE_SIZE + diff.y * this.path.progress;
            }
            else {
                this.position = this.path.target;
                this.world_position = this.path.target.getWorldPosition();
                var delegate = this.path.delegate;
                this.path = null;
                delegate.entityDidMove(this);
            }
        }
        else if (!!this.animation) {
            this.animation.run(steps);
        }
        this.icon_health.x = this.sprite.x;
        this.icon_health.y = this.sprite.y + AncientEmpires.TILE_SIZE - 7;
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
        return this.data.mov + this.mov_boost;
    };
    Entity.prototype.shouldCounter = function (target) {
        return (this.health > 0 && this.position.distanceTo(target) < 2 && this.data.min < 2);
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

var EntityRangeType;
(function (EntityRangeType) {
    EntityRangeType[EntityRangeType["None"] = 0] = "None";
    EntityRangeType[EntityRangeType["Move"] = 1] = "Move";
    EntityRangeType[EntityRangeType["Attack"] = 2] = "Attack";
    EntityRangeType[EntityRangeType["Raise"] = 3] = "Raise";
})(EntityRangeType || (EntityRangeType = {}));
var EntityRange = (function () {
    function EntityRange(map) {
        this.map = map;
        this.type = EntityRangeType.None;
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
    EntityRange.prototype.init = function (group) {
        this.extra_cursor = new Sprite();
        this.extra_cursor.init({ x: 0, y: 0 }, group, "cursor", [4]);
        this.extra_cursor.hide();
    };
    EntityRange.prototype.getWaypointAt = function (position) {
        return EntityRange.findPositionInList(position, this.waypoints);
    };
    EntityRange.prototype.sort = function () {
        this.waypoints.sort(function (a, b) {
            if (a.position.x == b.position.x) {
                return a.position.y - b.position.y;
            }
            return a.position.x - b.position.x;
        });
    };
    EntityRange.prototype.createRange = function (type, entity, targets) {
        this.type = type;
        this.targets_x = targets;
        this.targets_y = null;
        this.target = null;
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
                this.waypoints = this.calculateWaypoints(entity.position, entity.alliance, entity.type, max, false);
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
                this.waypoints = this.calculateWaypoints(entity.position, entity.alliance, entity.type, entity.getMovement(), !entity.hasFlag(EntityFlags.CanFly));
                this.addForm();
                this.extra_cursor.setFrames([4]);
                this.extra_cursor.setOffset(-1, -4);
                this.extra_cursor.show();
                break;
        }
    };
    EntityRange.prototype.nextTargetInRange = function (direction) {
        if (this.targets_x.length < 1) {
            return null;
        }
        if (!this.targets_y) {
            this.sortTargets();
        }
        if (direction == Direction.None) {
            return this.target;
        }
        var pos = new Pos(0, 0).move(direction);
        if (pos.x != 0) {
            var index_x = this.targets_x.indexOf(this.target);
            index_x += pos.x;
            if (index_x < 0) {
                index_x = this.targets_x.length - 1;
            }
            else if (index_x >= this.targets_x.length) {
                index_x = 0;
            }
            this.target = this.targets_x[index_x];
            return this.target;
        }
        // pos.y != 0
        var index_y = this.targets_y.indexOf(this.target);
        index_y += pos.y;
        if (index_y < 0) {
            index_y = this.targets_y.length - 1;
        }
        else if (index_y >= this.targets_y.length) {
            index_y = 0;
        }
        this.target = this.targets_y[index_y];
        return this.target;
    };
    EntityRange.prototype.selectTarget = function (entity) {
        if (!this.getWaypointAt(entity.position)) {
            return false;
        }
        this.target = entity;
        return true;
    };
    EntityRange.prototype.sortTargets = function () {
        this.targets_y = this.targets_x.slice();
        this.targets_x.sort(function (a, b) {
            if (a.position.x == b.position.x) {
                return a.position.y - b.position.y;
            }
            return a.position.x - b.position.x;
        });
        this.targets_y.sort(function (a, b) {
            if (a.position.y == b.position.y) {
                return a.position.x - b.position.x;
            }
            return a.position.y - b.position.y;
        });
        // take the entity most right
        this.target = this.targets_x.length > 0 ? this.targets_x[this.targets_x.length - 1] : null;
    };
    EntityRange.prototype.draw = function (range_graphics) {
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
        range_graphics.clear();
        range_graphics.beginFill(color);
        for (var _i = 0, _a = this.waypoints; _i < _a.length; _i++) {
            var waypoint = _a[_i];
            var position = waypoint.position.getWorldPosition();
            if ((waypoint.form & Direction.Up) != 0) {
                range_graphics.drawRect(position.x, position.y, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Right) != 0) {
                range_graphics.drawRect(position.x + AncientEmpires.TILE_SIZE - 4, position.y, 4, AncientEmpires.TILE_SIZE);
            }
            if ((waypoint.form & Direction.Down) != 0) {
                range_graphics.drawRect(position.x, position.y + AncientEmpires.TILE_SIZE - 4, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Left) != 0) {
                range_graphics.drawRect(position.x, position.y, 4, AncientEmpires.TILE_SIZE);
            }
        }
        range_graphics.endFill();
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
    EntityRange.prototype.calculateWaypoints = function (position, entity_alliance, entity_type, max_cost, use_terrain) {
        // cost for origin point is always 1
        var open = [{ position: position, cost: (use_terrain ? 1 : 0), form: 0, parent: null }];
        var closed = [];
        while (open.length > 0) {
            var current = open.shift();
            closed.push(current);
            var adjacent_positions = this.map.getAdjacentPositionsAt(current.position);
            for (var _i = 0, adjacent_positions_1 = adjacent_positions; _i < adjacent_positions_1.length; _i++) {
                var p = adjacent_positions_1[_i];
                this.checkPosition(p, current, open, closed, max_cost, use_terrain, entity_alliance, entity_type);
            }
        }
        return closed;
    };
    EntityRange.prototype.checkPosition = function (position, parent, open, closed, max_cost, use_terrain, entity_alliance, entity_type) {
        // already is the lowest possible
        if (!!EntityRange.findPositionInList(position, closed)) {
            return false;
        }
        if (use_terrain) {
            var is_occupied = this.map.getEntityAt(position);
            if (!!is_occupied && !is_occupied.isDead() && is_occupied.alliance != entity_alliance) {
                return false;
            }
        }
        var tile_cost = 1;
        if (use_terrain) {
            tile_cost = this.map.getCostAt(position, entity_type);
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

/// <reference path="entity.ts" />
/// <reference path="entityrange.ts" />
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
        this.entity_range = new EntityRange(this);
        this.load();
    }
    Map.getTileForCode = function (code) {
        return AncientEmpires.TILES_PROP[code];
    };
    Map.getCostForTile = function (tile, entity_type) {
        if (tile == Tile.Water && entity_type == EntityType.Lizard) {
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
        if (entity_type == EntityType.Lizard) {
            // Lizard for everything except water
            return cost * 2;
        }
        return cost;
    };
    Map.getDefForTile = function (tile, entity_type) {
        if (tile == Tile.Mountain || tile == Tile.House || tile == Tile.Castle) {
            return 3;
        }
        if (tile == Tile.Forest || tile == Tile.Hill) {
            return 2;
        }
        if (tile == Tile.Water && typeof entity_type != "undefined" && entity_type == EntityType.Lizard) {
            return 2;
        }
        if (tile == Tile.Grass) {
            return 1;
        }
        return 0;
    };
    /*

        - DATA OPERATIONS

     */
    Map.prototype.load = function () {
        if (!AncientEmpires.game.cache.checkBinaryKey(this.name)) {
            console.log("Could not find map: " + this.name);
            return false;
        }
        this.buildings = [];
        this.entities = [];
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
            this.entities.push(new Entity(type, alliance, new Pos(x, y)));
        }
    };
    Map.prototype.importEntities = function (entities) {
        this.entities = [];
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            var e = this.createEntity(entity.type, entity.alliance, new Pos(entity.x, entity.y));
            e.health = entity.health;
            e.state = entity.state;
            e.status = entity.status;
            e.ep = entity.ep;
            e.rank = entity.rank;
            e.death_count = entity.death_count;
        }
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
    Map.prototype.exportEntities = function () {
        var exp = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            exp.push(entity.export());
        }
        return exp;
    };
    Map.prototype.exportBuildings = function () {
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
    /*

        ENTITY OPERATIONS

     */
    Map.prototype.createEntity = function (type, alliance, position) {
        var entity = new Entity(type, alliance, position);
        this.entities.push(entity);
        return entity;
    };
    Map.prototype.removeEntity = function (entity) {
        for (var i = 0; i < this.entities.length; i++) {
            if (entity == this.entities[i]) {
                this.entities.splice(i, 1);
                break;
            }
        }
        entity.destroy();
    };
    Map.prototype.getEntityAt = function (position) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.position.match(position)) {
                return entity;
            }
        }
        return null;
    };
    Map.prototype.getKingPosition = function (alliance) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance == alliance && entity.type == EntityType.King) {
                return entity.position.copy();
            }
        }
        return null;
    };
    Map.prototype.getEntitiesWith = function (alliance, state, type) {
        var ret = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance != alliance) {
                continue;
            }
            if (typeof type != "undefined" && entity.type != type) {
                continue;
            }
            if (typeof state != "undefined" && entity.state != state) {
                continue;
            }
            if (typeof state == "undefined" && entity.state == EntityState.Dead) {
                continue;
            }
            ret.push(entity);
        }
        return ret;
    };
    Map.prototype.countEntitiesWith = function (alliance, state, type) {
        return this.getEntitiesWith(alliance, state, type).length;
    };
    Map.prototype.nextTurn = function (alliance) {
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
                if (this.getAllianceAt(entity.position) == entity.alliance) {
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
    /*

        - TILE OPERATIONS

     */
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
    Map.prototype.getNearestHouseForEntity = function (entity) {
        var min_dist = -1;
        var min_building = null;
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (building.castle) {
                continue;
            }
            var distance = Math.abs(building.position.x - entity.position.x) + Math.abs(building.position.y - entity.position.y);
            if (min_dist >= 0 && distance >= min_dist) {
                continue;
            }
            if (this.getMap() == 2 || (entity.type == EntityType.Soldier && building.alliance != entity.alliance) || (entity.type != EntityType.Soldier && building.alliance == entity.alliance)) {
                min_dist = distance;
                min_building = building;
            }
        }
        return min_building;
    };
    Map.prototype.getGoldGainForAlliance = function (alliance) {
        var gain = 0;
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (building.alliance != alliance) {
                continue;
            }
            gain += building.castle ? 50 : 30;
        }
        return gain;
    };
    Map.prototype.getCostAt = function (position, entity_type) {
        return Map.getCostForTile(this.getTileAt(position), entity_type);
    };
    Map.prototype.getDefAt = function (position, entity_type) {
        return Map.getDefForTile(this.getTileAt(position), entity_type);
    };
    Map.prototype.isCampaign = function () {
        return this.name.charAt(0) == "m";
    };
    Map.prototype.getMap = function () {
        return parseInt(this.name.charAt(1), 10);
    };
    Map.prototype.getEntityOptions = function (entity, moved) {
        if (moved === void 0) { moved = false; }
        if (entity.state != EntityState.Ready) {
            return [];
        }
        if (this.getEntityAt(entity.position) != entity) {
            return [Action.MOVE];
        }
        var options = [];
        if (!moved && entity.hasFlag(EntityFlags.CanBuy) && this.getTileAt(entity.position) == Tile.Castle) {
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
        if (this.getAllianceAt(entity.position) != entity.alliance && ((entity.hasFlag(EntityFlags.CanOccupyHouse) && this.getTileAt(entity.position) == Tile.House) || (entity.hasFlag(EntityFlags.CanOccupyCastle) && this.getTileAt(entity.position) == Tile.Castle))) {
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
    /*

        RANGE

     */
    Map.prototype.getAttackTargets = function (entity, position) {
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
            if (typeof position != "undefined") {
                distance = position.distanceTo(enemy.position);
            }
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
    Map.prototype.getRaiseTargets = function (entity, position) {
        var targets = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var dead = _a[_i];
            if (!dead.isDead()) {
                continue;
            }
            var distance = entity.getDistanceToEntity(dead);
            if (typeof position != "undefined") {
                distance = position.distanceTo(dead.position);
            }
            if (distance != 1) {
                continue;
            }
            targets.push(dead);
        }
        return targets;
    };
    Map.prototype.resetWisp = function (alliance) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.alliance != alliance) {
                continue;
            }
            entity.clearStatus(EntityStatus.Wisped);
            if (this.hasWispInRange(entity)) {
                entity.setStatus(EntityStatus.Wisped);
            }
        }
    };
    Map.prototype.hasWispInRange = function (entity) {
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var wisp = _a[_i];
            if (wisp.alliance != entity.alliance) {
                continue;
            }
            if (!wisp.hasFlag(EntityFlags.CanWisp)) {
                continue;
            }
            if (wisp.isDead()) {
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
    Map.prototype.showRange = function (type, entity) {
        var targets = null;
        if (type == EntityRangeType.Attack || type == EntityRangeType.Raise) {
            if (type == EntityRangeType.Attack) {
                targets = this.getAttackTargets(entity);
            }
            else if (type == EntityRangeType.Raise) {
                targets = this.getRaiseTargets(entity);
            }
        }
        this.entity_range.createRange(type, entity, targets);
        return this.entity_range;
    };
    Map.prototype.moveEntity = function (entity, target, delegate, animate) {
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
        entity.move(target, line, delegate);
        return true;
    };
    Map.prototype.nextTargetInRange = function (direction) {
        return this.entity_range.nextTargetInRange(direction);
    };
    Map.prototype.selectTargetInRange = function (entity) {
        return this.entity_range.selectTarget(entity);
    };
    Map.prototype.getTypeOfRange = function () {
        return this.entity_range.type;
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
        this.anim_idle_state = 0;
        this.map.entity_range.init(this.interaction_group);
        for (var _i = 0, _a = this.map.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            this.createEntity(entity);
        }
    }
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
    EntityManager.prototype.showRange = function () {
        this.show_range = true;
        this.map.entity_range.draw(this.selection_graphics);
    };
    EntityManager.prototype.hideRange = function () {
        this.show_range = false;
        this.map.entity_range.clear(this.selection_graphics, this.interaction_graphics);
    };
    EntityManager.prototype.update = function (steps, cursor_position, anim_state) {
        for (var _i = 0, _a = this.map.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (this.anim_idle_state != anim_state) {
                entity.setFrame(this.anim_idle_state);
            }
            entity.update(steps);
        }
        this.anim_idle_state = anim_state;
        if (this.show_range) {
            this.map.entity_range.update(steps, cursor_position, anim_state, this.selection_graphics, this.interaction_graphics);
        }
    };
    /*

        ----- RANGE

     */
    EntityManager.prototype.animationDidEnd = function (animation) {
        animation.entity.animation = null;
        switch (animation.type) {
            case EntityAnimationType.Attack:
                var attack = animation;
                if (attack.first && attack.entity.shouldCounter(attack.attacker.position)) {
                    this.attackEntity(attack.entity, attack.attacker, false);
                    return;
                }
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
                this.delegate.entityDidAnimation(attack.entity);
                break;
            case EntityAnimationType.Status:
                animation.entity.status_animation = -1;
                break;
            case EntityAnimationType.Raise:
                this.delegate.entityDidAnimation(animation.entity);
                break;
        }
    };
    EntityManager.prototype.showWisped = function () {
        for (var _i = 0, _a = this.map.entities; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.status != EntityStatus.Wisped) {
                continue;
            }
            if (!!entity.animation) {
                continue;
            }
            entity.startAnimation(new StatusAnimation(entity, this, this.anim_group, 1));
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
    EntityManager.prototype.createEntity = function (entity) {
        entity.init(this.entity_group);
    };
    return EntityManager;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Smoke = (function (_super) {
    __extends(Smoke, _super);
    function Smoke(position, group, name, frames) {
        _super.call(this);
        this.position = position;
        _super.prototype.init.call(this, new Pos(position.x * AncientEmpires.TILE_SIZE + 16, position.y * AncientEmpires.TILE_SIZE), group, name, frames);
    }
    return Smoke;
}(Sprite));

/// <reference path="smoke.ts" />
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

/// <reference path="frame.ts" />
var FrameManager = (function () {
    function FrameManager(group) {
        this.group = group;
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

/// <reference path="frame.ts" />
/// <reference path="aefont.ts" />
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
    MenuDefInfo.prototype.updateContent = function (position, map) {
        // update information inside menu
        var tile = map.getTileAt(position);
        var entity = map.getEntityAt(position);
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
        this.def_amount.setText(Map.getDefForTile(tile, entity ? entity.type : undefined).toString());
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
    MenuOptions.getMainMenuOptions = function (ingame) {
        var options;
        if (ingame) {
            options = [Action.SAVE_GAME, Action.LOAD_GAME, Action.INSTRUCTIONS, Action.ABOUT, Action.EXIT];
        }
        else {
            options = [Action.NEW_GAME, Action.LOAD_GAME, Action.SKIRMISH, Action.INSTRUCTIONS, Action.ABOUT, Action.EXIT];
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
    MenuOptions.prototype.show = function (animate, offset_y) {
        if (animate === void 0) { animate = false; }
        if (offset_y === void 0) { offset_y = 0; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(InputContext.Options);
        }
        _super.prototype.show.call(this, animate, offset_y);
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
var MenuSelect = (function (_super) {
    __extends(MenuSelect, _super);
    function MenuSelect(options, group, delegate, align, anim_direction) {
        _super.call(this);
        this.menu_delegate = delegate;
        this.options = options;
        this.selected = 0;
        var max_length = 0;
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var text = _a[_i];
            if (text.length > max_length) {
                max_length = text.length;
            }
        }
        var height = this.options.length * 13 + 16;
        var width = max_length * 7 + 31 + 13;
        this.initialize(width, height, group, align, Direction.All & ~align, anim_direction);
        this.drawContent();
    }
    MenuSelect.prototype.drawContent = function () {
        var y = 5;
        this.fonts = [];
        for (var _i = 0, _a = this.options; _i < _a.length; _i++) {
            var text = _a[_i];
            var font = this.group.game.add.bitmapText(25, y, "font7", text, 7, this.content_group);
            this.fonts.push(font);
            y += 13;
        }
        this.pointer = this.group.game.add.image(4, 4, "pointer", null, this.content_group);
        this.pointer_state = 2;
        this.pointer_slow = 0;
    };
    MenuSelect.prototype.hide = function (animate, destroy_on_finish, update_on_finish) {
        if (animate === void 0) { animate = false; }
        if (destroy_on_finish === void 0) { destroy_on_finish = false; }
        if (update_on_finish === void 0) { update_on_finish = false; }
        if (!!this.menu_delegate) {
            this.menu_delegate.closeMenu(InputContext.Options);
        }
        _super.prototype.hide.call(this, animate, destroy_on_finish, update_on_finish);
    };
    MenuSelect.prototype.show = function (animate, offset_y) {
        if (animate === void 0) { animate = false; }
        if (offset_y === void 0) { offset_y = 0; }
        if (!!this.menu_delegate) {
            this.menu_delegate.openMenu(InputContext.Options);
        }
        _super.prototype.show.call(this, animate, offset_y);
    };
    MenuSelect.prototype.next = function () {
        this.selected++;
        if (this.selected >= this.options.length) {
            this.selected = 0;
        }
    };
    MenuSelect.prototype.prev = function () {
        this.selected--;
        if (this.selected < 0) {
            this.selected = this.options.length - 1;
        }
    };
    MenuSelect.prototype.getSelected = function () {
        return this.options[this.selected];
    };
    MenuSelect.prototype.update = function (steps) {
        _super.prototype.update.call(this, steps);
        this.pointer_slow++;
        if (this.pointer_slow > 10) {
            this.pointer_slow = 0;
            this.pointer_state = 2 - this.pointer_state;
        }
        this.pointer.y = 4 + this.selected * 13;
        this.pointer.x = 4 + this.pointer_state;
    };
    return MenuSelect;
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

/// <reference path="input.ts" />
/// <reference path="player.ts" />
/// <reference path="ai.ts" />
/// <reference path="map.ts" />
/// <reference path="tilemanager.ts" />
/// <reference path="entitymanager.ts" />
/// <reference path="smokemanager.ts" />
/// <reference path="framemanager.ts" />
/// <reference path="menu.ts" />
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
    InputContext[InputContext["Instructions"] = 7] = "Instructions";
})(InputContext || (InputContext = {}));
var GameController = (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        _super.call(this);
        this.acc = 0;
    }
    GameController.prototype.init = function (save) {
        this.map = new Map((save.campaign ? "m" : "s") + save.map);
        this.players = [];
        this.game_over = false;
        var keys;
        var alliance = Alliance.Blue;
        for (var _i = 0, _a = save.players; _i < _a.length; _i++) {
            var p = _a[_i];
            if (p) {
                if (!keys) {
                    keys = new Input(this.game.input);
                }
                this.players.push(new Player(alliance, this.map, this, keys));
            }
            else {
                this.players.push(new AI(alliance, this.map, this));
            }
            alliance = (alliance + 1);
        }
        try {
            this.turn = save.turn;
            this.gold = save.gold;
            this.map.importBuildings(save.buildings);
            this.map.importEntities(save.entities);
            var i = 0;
            for (var _b = 0, _c = save.cursors; _b < _c.length; _b++) {
                var target = _c[_b];
                if (!!target) {
                    this.players[i].cursor_position = new Pos(target.x, target.y);
                }
                i++;
            }
        }
        catch (e) {
            this.turn = Alliance.Blue;
            this.gold = [];
            if (save.campaign) {
                this.gold[0] = 300;
                this.gold[1] = 300;
            }
            else {
                this.gold[0] = 1000;
                this.gold[1] = 1000;
            }
        }
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
        var frame_group = this.game.add.group();
        frame_group.fixedToCamera = true;
        this.tile_manager = new TileManager(this.map, tilemap, tilemap_group);
        this.entity_manager = new EntityManager(this.map, entity_group, selection_group, interaction_group, animation_group, this);
        this.smoke_manager = new SmokeManager(this.map, smoke_group);
        this.frame_manager = new FrameManager(frame_group);
        this.tile_manager.draw();
        this.frame_def_info = new MenuDefInfo(frame_group);
        this.frame_manager.addFrame(this.frame_def_info);
        this.frame_def_info.show(true);
        this.frame_gold_info = new MenuGoldInfo(frame_group);
        this.frame_manager.addFrame(this.frame_gold_info);
        this.frame_gold_info.show(true);
        this.cursor = new Sprite();
        this.cursor.init({ x: 0, y: 0 }, cursor_group, "cursor", [0, 1]);
        this.cursor.setOffset(-1, -1);
        this.camera.x = this.getOffsetX(this.cursor.world_position.x);
        this.camera.y = this.getOffsetY(this.cursor.world_position.y);
        this.anim_cursor_state = 0;
        this.anim_cursor_slow = 0;
        this.startTurn(this.turn);
        this.showMessage("GAME LOADED");
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
        var cursor_position = this.cursor_target.getWorldPosition();
        var diff_x = cursor_position.x - this.cursor.world_position.x;
        var diff_y = cursor_position.y - this.cursor.world_position.y;
        var dx = 0;
        var dy = 0;
        this.cursor_still = diff_x == 0 && diff_y == 0;
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
        // track moving entity, otherwise cursor
        this.updateOffsetForPosition(!!this.selected_entity && !!this.selected_entity.path ? this.selected_entity.world_position : this.cursor.world_position);
        // input
        this.checkWinLose();
        if (!this.game_over) {
            this.players[(this.turn - 1)].run();
            this.players[(this.turn - 1)].setCursorPosition(this.cursor_target);
        }
        if (!this.cursor_target.match(this.last_cursor_position)) {
            this.last_cursor_position = this.cursor_target.copy();
            // update def info
            this.frame_def_info.updateContent(this.cursor_target, this.map);
        }
        this.frame_manager.update(steps);
        // Pause ANIMATION
        this.anim_cursor_slow += steps;
        if (this.anim_cursor_slow > 30) {
            this.anim_cursor_slow -= 30;
            this.anim_cursor_state = 1 - this.anim_cursor_state;
            this.cursor.setFrame(this.anim_cursor_state);
        }
        this.tile_manager.update(steps);
        this.smoke_manager.update(steps);
        this.entity_manager.update(steps, this.cursor_target, this.anim_cursor_state);
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
    // -----------------------
    // ---- MENU DELEGATE ----
    // -----------------------
    GameController.prototype.openMenu = function (context) {
        this.players[this.turn - 1].openMenu(context);
    };
    GameController.prototype.closeMenu = function (context) {
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.closeMenu(context);
        }
    };
    // ---------------------------------
    // ---- ENTITY MANAGER DELEGATE ----
    // ---------------------------------
    GameController.prototype.entityDidMove = function (entity) {
        this.players[this.turn - 1].entityDidMove(entity);
    };
    GameController.prototype.entityDidAnimation = function (entity) {
        this.players[this.turn - 1].entityDidAnimation(entity);
    };
    // --------------
    // ---- MENU ----
    // --------------
    GameController.prototype.showMessage = function (text) {
        var menu = new Notification(this.frame_manager.group, text, this);
        this.frame_manager.addFrame(menu);
        menu.show(true);
    };
    GameController.prototype.showInfo = function (all) {
        this.frame_def_info.show(true);
        if (all) {
            this.frame_gold_info.show(true);
        }
    };
    GameController.prototype.hideInfo = function (all) {
        this.frame_def_info.hide(true);
        if (all) {
            this.frame_gold_info.hide(true);
        }
    };
    // ---------------------
    // ---- LOAD / SAVE ----
    // ---------------------
    GameController.prototype.loadGame = function () {
        if (!MainMenu.loadGame(this.game)) {
            this.showMessage(AncientEmpires.LANG[43]);
            return false;
        }
        return true;
    };
    GameController.prototype.saveGame = function () {
        var cursors = [];
        var players = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            cursors.push(player.getCursorPosition());
            players.push(player.isPlayer());
        }
        var save = {
            campaign: this.map.isCampaign(),
            map: this.map.getMap(),
            turn: this.turn,
            gold: this.gold,
            players: players,
            entities: this.map.exportEntities(),
            buildings: this.map.exportBuildings(),
            cursors: cursors
        };
        localStorage.setItem("save.rs", JSON.stringify(save));
        this.showMessage(AncientEmpires.LANG[41]);
    };
    GameController.prototype.exitGame = function () {
        this.game.state.start("MainMenu", true, false);
    };
    // -----------------
    // ---- GENERAL ----
    // -----------------
    GameController.prototype.checkWinLose = function () {
        if (this.game_over) {
            return;
        }
        if (this.map.countEntitiesWith(Alliance.Blue, EntityState.Dead, EntityType.King) > 0) {
            this.showMessage(AncientEmpires.LANG[38]);
            this.game_over = true;
        }
        else if (this.map.countEntitiesWith(Alliance.Red, EntityState.Dead, EntityType.King) > 0) {
            this.showMessage(AncientEmpires.LANG[24]);
            this.game_over = true;
        }
    };
    GameController.prototype.nextTurn = function () {
        this.showMessage(AncientEmpires.LANG[40]);
        var next_turn = Alliance.Blue;
        if (this.turn == Alliance.Blue) {
            next_turn = Alliance.Red;
        }
        if (!this.players[next_turn - 1].isActive()) {
            next_turn = this.turn;
        }
        this.gold[next_turn == Alliance.Blue ? 0 : 1] += this.map.getGoldGainForAlliance(next_turn);
        this.map.nextTurn(next_turn);
        this.startTurn(next_turn);
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
    // ------------------
    // ---- ENTITITY ----
    // ------------------
    GameController.prototype.buyEntity = function (king, type) {
        var data = AncientEmpires.ENTITIES[type];
        var gold = this.getGoldForAlliance(king.alliance) - data.cost;
        if (gold < 0) {
            return null;
        }
        this.setGoldForAlliance(king.alliance, gold);
        var entity = this.map.createEntity(type, king.alliance, king.position.copy());
        this.entity_manager.createEntity(entity);
        return entity;
    };
    GameController.prototype.selectEntity = function (entity) {
        if (!!this.selected_entity) {
            return false;
        }
        this.selected_entity = entity;
        this.entity_manager.selectEntity(entity);
        return true;
    };
    GameController.prototype.moveEntity = function (entity, target, animate) {
        if (this.map.moveEntity(entity, target, this, animate)) {
            this.hideRange();
            return true;
        }
        return false;
    };
    GameController.prototype.occupy = function (position, alliance) {
        this.map.setAllianceAt(position, alliance);
        this.tile_manager.drawTileAt(position);
        this.showMessage(AncientEmpires.LANG[39]);
    };
    GameController.prototype.showRange = function (type, entity) {
        this.map.showRange(type, entity);
        this.entity_manager.showRange();
        return this.map.entity_range;
    };
    GameController.prototype.hideRange = function () {
        this.entity_manager.hideRange();
    };
    GameController.prototype.attackEntity = function (entity, target) {
        this.entity_manager.attackEntity(entity, target);
    };
    GameController.prototype.raiseEntity = function (wizard, dead) {
        this.entity_manager.raiseEntity(wizard, dead);
    };
    GameController.prototype.deselectEntity = function (changed) {
        if (!this.selected_entity) {
            return;
        }
        this.cursor_target = this.selected_entity.position.copy();
        this.hideRange();
        this.entity_manager.deselectEntity(this.selected_entity);
        this.selected_entity = null;
        // if something changed
        if (changed) {
            this.map.resetWisp(this.turn);
            this.entity_manager.showWisped();
            this.frame_def_info.updateContent(this.cursor_target, this.map);
        }
    };
    // -------------------------
    // ---- PRIVATE GENERAL ----
    // -------------------------
    GameController.prototype.startTurn = function (alliance) {
        this.turn = alliance;
        var player = this.players[alliance - 1];
        player.start();
        this.cursor_target = player.getCursorPosition();
        var wp = this.cursor_target.getWorldPosition();
        this.cursor.setWorldPosition(wp);
        this.frame_gold_info.updateContent(alliance, this.getGoldForAlliance(alliance));
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
        this.camera_still = diff_x == 0 && diff_y == 0;
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
    return GameController;
}(Phaser.State));

/// <reference path="gamecontroller.ts" />
/// <reference path="menu.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ActiveMenuType;
(function (ActiveMenuType) {
    ActiveMenuType[ActiveMenuType["CampaignMaps"] = 0] = "CampaignMaps";
    ActiveMenuType[ActiveMenuType["SkirmishMaps"] = 1] = "SkirmishMaps";
    ActiveMenuType[ActiveMenuType["SkirmishPlayers"] = 2] = "SkirmishPlayers";
})(ActiveMenuType || (ActiveMenuType = {}));
var MainMenu = (function (_super) {
    __extends(MainMenu, _super);
    function MainMenu() {
        _super.call(this);
    }
    MainMenu.drawTransition = function (progress, max_progress, graphics, image_width, image_height) {
        var max_segment_width = Math.ceil(image_width / 4);
        var max_segment_height = Math.ceil(image_height / 2);
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
            for (var y = 0; y < 2; y++) {
                var offset_y = y * max_segment_height + margin_y;
                graphics.drawRect(offset_x, offset_y, width, height);
            }
        }
    };
    MainMenu.loadGame = function (game) {
        var save;
        try {
            var data = localStorage.getItem("save.rs");
            save = JSON.parse(data);
        }
        catch (e) {
            return false;
        }
        if (!save) {
            return false;
        }
        game.state.start("Game", true, false, save);
        return true;
    };
    MainMenu.startGame = function (game, campaign, map, players) {
        if (players === void 0) { players = [true, false]; }
        var save = {
            campaign: campaign,
            map: map,
            players: players
        };
        game.state.start("Game", true, false, save);
    };
    MainMenu.showAbout = function (game) {
        var group = game.add.group();
        group.fixedToCamera = true;
        var background = game.add.graphics(0, 0, group);
        background.beginFill(0xffffff);
        background.drawRect(0, 0, game.width, game.height);
        background.endFill();
        background.beginFill(0x000000);
        background.drawRect(0, 37, game.width, 1);
        background.endFill();
        game.add.bitmapText(10, 26, "font7", AncientEmpires.LANG[8], 7, group);
        var text = game.add.bitmapText(10, 42, "font7", AncientEmpires.LANG[0] + AncientEmpires.LANG[14], 7, group);
        text.maxWidth = game.width - 20;
        return group;
    };
    MainMenu.showInstructions = function (group, page) {
        if (page === void 0) { page = 0; }
        group.removeChildren();
        var background = group.game.add.graphics(0, 0, group);
        background.beginFill(0xffffff);
        background.drawRect(0, 0, group.game.width, group.game.height);
        background.endFill();
        background.beginFill(0x000000);
        background.drawRect(0, 37, group.game.width, 1);
        background.endFill();
        group.game.add.bitmapText(10, 26, "font7", AncientEmpires.LANG[7] + (page > 0 ? (" - " + page) : ""), 7, group);
        var text = group.game.add.bitmapText(10, 42, "font7", AncientEmpires.LANG[page > 0 ? (86 + page) : 13], 7, group);
        text.maxWidth = group.game.width - 20;
    };
    MainMenu.prototype.openMenu = function (context) {
        if (context == InputContext.Wait) {
            this.notification_shown = true;
        }
    };
    MainMenu.prototype.closeMenu = function (context) {
        if (context == InputContext.Wait) {
            this.notification_shown = false;
        }
    };
    MainMenu.prototype.create = function () {
        // this.loadMap("s0");
        this.notification_shown = false;
        this.intro = true;
        this.intro_acc = 0;
        this.intro_progress = 0;
        this.game.add.image(0, 0, "splashbg");
        this.knights = this.game.add.image(0, 26, "splashfg");
        this.title = this.game.add.image(0, 8, "splash");
        this.title.x = Math.floor((this.game.width - this.title.width) / 2);
        this.title.visible = false;
        this.title_mask = this.game.add.graphics(this.title.x, this.title.y);
        this.title.mask = this.title_mask;
        var frame_group = this.game.add.group();
        this.frame_manager = new FrameManager(frame_group);
        this.keys = new Input(this.game.input);
    };
    MainMenu.prototype.update = function () {
        if (!this.intro) {
            this.keys.update();
            this.frame_manager.update(1);
            if (this.notification_shown) {
                return;
            }
            if (this.keys.isKeyPressed(Key.Up)) {
                this.keys.clearKeyPressed(Key.Up);
                if (!!this.menu_select) {
                    this.menu_select.prev();
                }
                else {
                    this.main.prev();
                }
            }
            else if (this.keys.isKeyPressed(Key.Down)) {
                this.keys.clearKeyPressed(Key.Down);
                if (!!this.menu_select) {
                    this.menu_select.next();
                }
                else {
                    this.main.next();
                }
            }
            else if (this.keys.isKeyPressed(Key.Enter)) {
                this.keys.clearKeyPressed(Key.Enter);
                if (!!this.active_about) {
                    this.active_about.destroy(true);
                    this.active_about = null;
                }
                else if (!!this.active_instructions) {
                    var next = this.active_instruction_nr + 1;
                    if (next <= 17) {
                        this.active_instruction_nr = next;
                        MainMenu.showInstructions(this.active_instructions, this.active_instruction_nr);
                    }
                }
                else if (!!this.menu_select) {
                    this.selectChoice(this.menu_select.selected);
                }
                else {
                    var action = this.main.getSelected();
                    this.executeAction(action);
                }
            }
            else if (this.keys.isKeyPressed(Key.Esc)) {
                if (!!this.active_about) {
                    this.active_about.destroy(true);
                    this.active_about = null;
                }
                else if (!!this.active_instructions) {
                    this.active_instructions.destroy(true);
                    this.active_instructions = null;
                }
                else if (!!this.menu_select) {
                    this.menu_select.hide(false, true);
                    this.menu_select = null;
                    this.main.show(true, 72);
                }
            }
            else if (this.keys.isKeyPressed(Key.Right)) {
                this.keys.clearKeyPressed(Key.Right);
                if (!!this.active_instructions) {
                    var next = this.active_instruction_nr + 1;
                    if (next <= 17) {
                        this.active_instruction_nr = next;
                        MainMenu.showInstructions(this.active_instructions, this.active_instruction_nr);
                    }
                }
            }
            else if (this.keys.isKeyPressed(Key.Left)) {
                this.keys.clearKeyPressed(Key.Left);
                if (!!this.active_instructions) {
                    var prev = this.active_instruction_nr - 1;
                    if (prev >= 0) {
                        this.active_instruction_nr = prev;
                        MainMenu.showInstructions(this.active_instructions, this.active_instruction_nr);
                    }
                }
            }
            return;
        }
        this.intro_acc++;
        if (this.intro_acc < 2) {
            return;
        }
        this.intro_acc = 0;
        this.intro_progress++;
        if (this.intro_progress <= 30) {
            this.knights.y = 26 - this.intro_progress;
        }
        else if (this.intro_progress <= 60) {
            this.title.visible = true;
            this.title_mask.clear();
            this.title_mask.beginFill();
            MainMenu.drawTransition(Math.ceil((this.intro_progress - 30) / 2), 15, this.title_mask, this.title.width, this.title.height);
            this.title_mask.endFill();
        }
        else {
            this.title_mask.clear();
            this.main = new MenuOptions(this.frame_manager.group, Direction.None, MenuOptions.getMainMenuOptions(false), this, Direction.Up);
            this.frame_manager.addFrame(this.main);
            this.main.show(true, 72);
            this.intro = false;
        }
    };
    MainMenu.prototype.showMessage = function (text) {
        var menu = new Notification(this.frame_manager.group, text, this);
        this.frame_manager.addFrame(menu);
        menu.show(true);
    };
    MainMenu.prototype.executeAction = function (action) {
        switch (action) {
            case Action.LOAD_GAME:
                if (MainMenu.loadGame(this.game)) {
                    this.main.hide(false);
                }
                else {
                    this.showMessage(AncientEmpires.LANG[43]);
                }
                break;
            case Action.NEW_GAME:
                this.main.hide(false);
                MainMenu.startGame(this.game, false, 0);
                break;
            case Action.SELECT_LEVEL:
                var maps = [];
                for (var i = 0; i < 7; i++) {
                    maps.push(AncientEmpires.LANG[49 + i]);
                }
                this.main.hide(false);
                this.active_select = ActiveMenuType.CampaignMaps;
                this.menu_select = new MenuSelect(maps, this.frame_manager.group, this, Direction.None, Direction.Up);
                this.frame_manager.addFrame(this.menu_select);
                this.menu_select.show(true, 72);
                break;
            case Action.SKIRMISH:
                this.main.hide(false);
                this.active_select = ActiveMenuType.SkirmishMaps;
                this.menu_select = new MenuSelect(["Island Cross", "Rocky Bay"], this.frame_manager.group, this, Direction.None, Direction.Up);
                this.frame_manager.addFrame(this.menu_select);
                this.menu_select.show(true, 72);
                break;
            case Action.ABOUT:
                this.active_about = MainMenu.showAbout(this.game);
                break;
            case Action.INSTRUCTIONS:
                this.active_instructions = this.game.add.group();
                this.active_instruction_nr = 0;
                MainMenu.showInstructions(this.active_instructions);
                break;
        }
    };
    MainMenu.prototype.selectChoice = function (choice) {
        this.menu_select.hide(false, true);
        this.menu_select = null;
        switch (this.active_select) {
            case ActiveMenuType.CampaignMaps:
                MainMenu.startGame(this.game, true, choice);
                break;
            case ActiveMenuType.SkirmishMaps:
                this.active_skirmish = choice;
                this.active_select = ActiveMenuType.SkirmishPlayers;
                this.menu_select = new MenuSelect(["1 PLAYER", "2 PLAYER", "AI ONLY"], this.frame_manager.group, this, Direction.None, Direction.Up);
                this.frame_manager.addFrame(this.menu_select);
                this.menu_select.show(true, 72);
                break;
            case ActiveMenuType.SkirmishPlayers:
                var players = [choice != 2, choice == 1];
                MainMenu.startGame(this.game, false, this.active_skirmish, players);
                break;
        }
    };
    return MainMenu;
}(Phaser.State));

/// <reference path="vendor/phaser.d.ts" />
/// <reference path="util.ts" />
/// <reference path="sprite.ts" />
/// <reference path="loader.ts" />
/// <reference path="mainmenu.ts" />
/// <reference path="gamecontroller.ts" />
var AncientEmpires = (function () {
    function AncientEmpires(div_id) {
        this.width = 176;
        this.height = 204;
        AncientEmpires.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, div_id, this, false, false);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsImludGVyYWN0aW9uLnRzIiwiYWkudHMiLCJ1dGlsLnRzIiwic3ByaXRlLnRzIiwicG5nbG9hZGVyLnRzIiwibG9hZGVyLnRzIiwiaW5wdXQudHMiLCJmcmFtZS50cyIsIm1pbmltYXAudHMiLCJwbGF5ZXIudHMiLCJhbmltYXRpb24udHMiLCJlbnRpdHkudHMiLCJlbnRpdHlyYW5nZS50cyIsIm1hcC50cyIsInRpbGVtYW5hZ2VyLnRzIiwiZW50aXR5bWFuYWdlci50cyIsInNtb2tlLnRzIiwic21va2VtYW5hZ2VyLnRzIiwiZnJhbWVtYW5hZ2VyLnRzIiwibWVudS50cyIsImdhbWVjb250cm9sbGVyLnRzIiwibWFpbm1lbnUudHMiLCJhbmNpZW50ZW1waXJlcy50cyIsImF0dGFja3NjcmVlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFLLFdBR0o7QUFIRCxXQUFLLFdBQVc7SUFDWiw2Q0FBSSxDQUFBO0lBQ0osK0NBQUssQ0FBQTtBQUNULENBQUMsRUFISSxXQUFXLEtBQVgsV0FBVyxRQUdmO0FBQ0Q7SUEwQ0ksZ0JBQVksQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFtQixFQUFFLEtBQWtCLEVBQUUsSUFBYTtRQUNwRixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBMUNNLGVBQVEsR0FBZixVQUFnQixLQUFrQixFQUFFLE1BQWM7UUFDOUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3RCLENBQUM7UUFDRCxNQUFNLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBQ00sbUJBQVksR0FBbkIsVUFBb0IsS0FBa0IsRUFBRSxJQUFZO1FBRWhELEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QixhQUFhO1lBQ2IsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDM0IsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7WUFDckIsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsNEJBQTRCLEdBQUcsSUFBSSxHQUFHLGlCQUFpQixDQUFDLENBQUM7WUFDckUsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxZQUFZO1FBRVosRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMxQixNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFdBQVc7UUFDMUIsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFBLElBQUksQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsR0FBRyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztJQUNMLENBQUM7SUFVRCx3QkFBTyxHQUFQLFVBQVEsSUFBWTtRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQUNELCtCQUFjLEdBQWQsVUFBZSxDQUFTLEVBQUUsQ0FBUztRQUMvQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRVgsR0FBRyxDQUFDLENBQWUsVUFBWSxFQUFaLEtBQUEsSUFBSSxDQUFDLE9BQU8sRUFBWixjQUFZLEVBQVosSUFBWSxDQUFDO1lBQTNCLElBQUksTUFBTSxTQUFBO1lBQ1gsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDYixNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNiLENBQUMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDO1NBQ3JCO0lBRUwsQ0FBQztJQUNELDhCQUFhLEdBQWIsVUFBYyxPQUFnQjtRQUMxQixHQUFHLENBQUMsQ0FBZSxVQUFZLEVBQVosS0FBQSxJQUFJLENBQUMsT0FBTyxFQUFaLGNBQVksRUFBWixJQUFZLENBQUM7WUFBM0IsSUFBSSxNQUFNLFNBQUE7WUFDWCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFDTyxxQkFBSSxHQUFaO1FBQ0ksSUFBSSxDQUFDLEdBQW1CLEVBQUUsQ0FBQztRQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ2YsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3hDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztZQUVsRCxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDWixDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxRQUFRLENBQUM7WUFDYixDQUFDO1lBRUQsSUFBSSxTQUFTLFNBQVEsQ0FBQztZQUN0QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxTQUFTLEdBQUcsT0FBTyxDQUFDO1lBQ3hCLENBQUM7WUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDekMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUN6QixDQUFDO1lBRUQsSUFBSSxLQUFLLFNBQWMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNqQyxDQUFDO1lBQUEsSUFBSSxDQUFDLENBQUM7Z0JBQ0gsS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRixDQUFDO1lBQ0QsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7WUFDcEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNkLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3JCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQzdCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbEMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3JCLENBQUM7UUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ0wsYUFBQztBQUFELENBMUdBLEFBMEdDLElBQUE7Ozs7Ozs7QUMvRUQ7SUFTSSxxQkFBWSxRQUFrQixFQUFFLEdBQVEsRUFBRSxRQUE2QjtRQUNuRSxJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQzdCLENBQUM7SUFDRCw4QkFBUSxHQUFSO1FBQ0ksTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0QsOEJBQVEsR0FBUjtRQUNJLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDdEMsQ0FBQztJQUNELHVDQUFpQixHQUFqQixVQUFrQixRQUFhO1FBQzNCLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFDRCx1Q0FBaUIsR0FBakI7UUFDSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkMsQ0FBQztRQUNELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUNELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMzRCxFQUFFLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDcEMsQ0FBQztRQUNELE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUNELDJCQUFLLEdBQUw7UUFDSSxZQUFZO0lBQ2hCLENBQUM7SUFDRCx5QkFBRyxHQUFIO1FBQ0ksY0FBYztJQUNsQixDQUFDO0lBQ0QsbUNBQWEsR0FBYixVQUFjLE1BQWM7UUFDeEIsWUFBWTtJQUNoQixDQUFDO0lBQ0Qsd0NBQWtCLEdBQWxCLFVBQW1CLE1BQWM7UUFDN0IsWUFBWTtJQUNoQixDQUFDO0lBQ0QsOEJBQVEsR0FBUixVQUFTLE9BQXFCO1FBQzFCLFlBQVk7SUFDaEIsQ0FBQztJQUNELCtCQUFTLEdBQVQsVUFBVSxPQUFxQjtRQUMzQixZQUFZO0lBQ2hCLENBQUM7SUFDTCxrQkFBQztBQUFELENBdkRBLEFBdURDLElBQUE7QUFFRDtJQUFtQix3QkFBVztJQUE5QjtRQUFtQiw4QkFBVztJQUk5QixDQUFDO0lBSEcsa0JBQUcsR0FBSDtRQUNJLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUNMLFdBQUM7QUFBRCxDQUpBLEFBSUMsQ0FKa0IsV0FBVyxHQUk3Qjs7QUM1RkQsdUNBQXVDOzs7Ozs7QUFFdkMsSUFBSyxPQVFKO0FBUkQsV0FBSyxPQUFPO0lBQ1IscUNBQUksQ0FBQTtJQUNKLHlDQUFNLENBQUE7SUFDTix5Q0FBTSxDQUFBO0lBQ04seUNBQU0sQ0FBQTtJQUNOLHlDQUFNLENBQUE7SUFDTix1Q0FBSyxDQUFBO0lBQ0wsNkNBQVEsQ0FBQTtBQUNaLENBQUMsRUFSSSxPQUFPLEtBQVAsT0FBTyxRQVFYO0FBRUQ7SUFBaUIsc0JBQVc7SUEwQnhCLFlBQVksUUFBa0IsRUFBRSxHQUFRLEVBQUUsUUFBNkI7UUFDbkUsa0JBQU0sUUFBUSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZELENBQUM7SUFsQk0sZUFBWSxHQUFuQixVQUFvQixJQUFVO1FBQzFCLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDWCxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDakIsS0FBSyxJQUFJLENBQUMsSUFBSTtnQkFDVixNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ2IsS0FBSyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ25CLEtBQUssSUFBSSxDQUFDLEtBQUs7Z0JBQ1gsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFVRCxxQkFBUSxHQUFSLFVBQVMsT0FBcUI7UUFDMUIsRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7SUFDTCxDQUFDO0lBQ0Qsc0JBQVMsR0FBVCxVQUFVLE9BQXFCO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUN2QixDQUFDO0lBQ0wsQ0FBQztJQUVELDBCQUFhLEdBQWIsVUFBYyxNQUFjO1FBQ3hCLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztJQUNoQyxDQUFDO0lBQ0QsK0JBQWtCLEdBQWxCLFVBQW1CLE1BQWM7UUFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0lBQ2xDLENBQUM7SUFDRCxnQkFBRyxHQUFIO1FBRUksdUJBQXVCO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUM7UUFDWCxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUM3QixNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDakIsS0FBSyxPQUFPLENBQUMsTUFBTTtvQkFDZixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUN6RSxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7b0JBQ2hDLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDNUQsQ0FBQztvQkFDRCxLQUFLLENBQUM7Z0JBQ1YsS0FBSyxPQUFPLENBQUMsTUFBTTtvQkFDZixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7d0JBQ3ZCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7NEJBQ3JFLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzt3QkFDaEMsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFDakUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQzVCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDOzRCQUN0RSxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQzt3QkFDckQsQ0FBQzt3QkFDRCxNQUFNLENBQUM7b0JBQ1gsQ0FBQztvQkFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3RCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7NEJBQ25FLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQzt3QkFDL0IsQ0FBQzt3QkFBQyxJQUFJLENBQUMsQ0FBQzs0QkFDSixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQzs0QkFDckUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ3BFLENBQUM7d0JBQ0QsTUFBTSxDQUFDO29CQUNYLENBQUM7b0JBRUQsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDbEwsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQzVELENBQUM7b0JBQ0QsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO29CQUM5QixLQUFLLENBQUM7Z0JBQ1YsS0FBSyxPQUFPLENBQUMsUUFBUTtvQkFDakIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDMUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztvQkFDMUIsS0FBSyxDQUFDO1lBQ2QsQ0FBQztZQUNELE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxHQUFHLENBQUMsQ0FBZSxVQUFpQixFQUFqQixLQUFBLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFqQixjQUFpQixFQUFqQixJQUFpQixDQUFDO1lBQWhDLElBQUksTUFBTSxTQUFBO1lBQ1gsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQUMsUUFBUSxDQUFDO1lBQUMsQ0FBQztZQUN4RixFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRW5CLG1CQUFtQjtnQkFDbkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUFDLFFBQVEsQ0FBQztnQkFBQyxDQUFDO2dCQUVwRixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7b0JBQ25ILGlDQUFpQztvQkFFakMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzlJLDRFQUE0RTt3QkFDNUUsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2pFLENBQUM7b0JBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzlCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7NEJBQ2hHLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN2RCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUN0QixDQUFDO29CQUNMLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osSUFBSSxRQUFRLEdBQWlCLEVBQUUsQ0FBQzt3QkFDaEMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLElBQUksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDOzRCQUMvRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dDQUMzSCxRQUFRLENBQUM7NEJBQ2IsQ0FBQzs0QkFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFlLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FDOUQsUUFBUSxDQUFDOzRCQUNiLENBQUM7NEJBQ0QsUUFBUSxDQUFDLElBQUksQ0FBYyxJQUFJLENBQUMsQ0FBQzt3QkFDckMsQ0FBQzt3QkFDRCxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3RCLElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQzs0QkFDbkUsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDckQsQ0FBQztvQkFDTCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVyRCxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7WUFDOUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3pFLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUVwQixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2RixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0QsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDO1lBRXhCLEdBQUcsQ0FBQyxDQUFpQixVQUFzQixFQUF0QixLQUFBLFlBQVksQ0FBQyxTQUFTLEVBQXRCLGNBQXNCLEVBQXRCLElBQXNCLENBQUM7Z0JBQXZDLElBQUksUUFBUSxTQUFBO2dCQUNiLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFBQyxRQUFRLENBQUM7Z0JBQUMsQ0FBQztnQkFFckMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUNwRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ25FLEdBQUcsQ0FBQyxDQUFlLFVBQU8sRUFBUCxtQkFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTyxDQUFDO3dCQUF0QixJQUFJLE1BQU0sZ0JBQUE7d0JBQ1gsSUFBSSxPQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQ25FLEVBQUUsQ0FBQyxDQUFDLE9BQUssSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDOzRCQUFDLFFBQVEsQ0FBQzt3QkFBQyxDQUFDO3dCQUMzQyxlQUFlLEdBQUcsT0FBSyxDQUFDO3dCQUN4QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQzt3QkFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUM7d0JBQzVCLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDakQ7Z0JBQ0wsQ0FBQztnQkFDRCxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQ2xFLEdBQUcsQ0FBQyxDQUFlLFVBQU8sRUFBUCxtQkFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTyxDQUFDO3dCQUF0QixJQUFJLE1BQU0sZ0JBQUE7d0JBQ1gsSUFBSSxPQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ25FLEVBQUUsQ0FBQyxDQUFDLE9BQUssSUFBSSxlQUFlLENBQUMsQ0FBQyxDQUFDOzRCQUFDLFFBQVEsQ0FBQzt3QkFBQyxDQUFDO3dCQUMzQyxlQUFlLEdBQUcsT0FBSyxDQUFDO3dCQUN4QixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQzt3QkFDMUIsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7d0JBQzNCLElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztxQkFDakQ7Z0JBQ0wsQ0FBQztnQkFDRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDakUsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUM7b0JBQUMsUUFBUSxDQUFDO2dCQUFDLENBQUM7Z0JBQzNDLGVBQWUsR0FBRyxLQUFLLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2pEO1lBQ0QsTUFBTSxDQUFDO1NBQ1Y7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFTyx5QkFBWSxHQUFwQixVQUFxQixNQUFjO1FBQy9CLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDO1FBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTyw4QkFBaUIsR0FBekIsVUFBMEIsUUFBYSxFQUFFLElBQWdCO1FBRXJELHdCQUF3QjtRQUN4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFVLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQUMsQ0FBQztRQUVwSCxzQ0FBc0M7UUFDdEMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQVUsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFJLHVDQUF1QztRQUN2QyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQUMsQ0FBQztRQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFDTyxxQkFBUSxHQUFoQixVQUFpQixNQUFjLEVBQUUsUUFBYSxFQUFFLE1BQWMsRUFBRSxLQUFhO1FBQ3pFLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLEtBQUssVUFBVSxDQUFDLE9BQU87Z0JBRW5CLHVEQUF1RDtnQkFDdkQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBQ3BFLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFDdEcsS0FBSyxJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUM7Z0JBQ3ZDLENBQUM7Z0JBRUQsc0VBQXNFO2dCQUN0RSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckQsS0FBSyxJQUFJLENBQUMsQ0FBQztnQkFDZixDQUFDO2dCQUVELGtCQUFrQjtnQkFDbEIsR0FBRyxDQUFDLENBQWdCLFVBQWEsRUFBYixLQUFBLElBQUksQ0FBQyxRQUFRLEVBQWIsY0FBYSxFQUFiLElBQWEsQ0FBQztvQkFBN0IsSUFBSSxPQUFPLFNBQUE7b0JBQ1osRUFBRSxDQUFDLENBQUMsT0FBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUM7d0JBQUMsUUFBUSxDQUFDO29CQUFDLENBQUM7b0JBQ3BDLElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDekQsS0FBSyxJQUFJLGNBQWMsR0FBRyxjQUFjLENBQUM7aUJBQzVDO2dCQUVELHVCQUF1QjtnQkFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDL0csS0FBSyxJQUFJLEdBQUcsQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxLQUFLLENBQUM7WUFDVixLQUFLLFVBQVUsQ0FBQyxNQUFNO2dCQUVsQixxQkFBcUI7Z0JBQ3JCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNWLEtBQUssSUFBSSxHQUFHLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQ0QsS0FBSyxDQUFDO1lBQ1YsS0FBSyxVQUFVLENBQUMsSUFBSTtnQkFFaEIsYUFBYTtnQkFDYixFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLEtBQUssSUFBSSxHQUFHLENBQUM7Z0JBQ2pCLENBQUM7Z0JBQ0QsS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUVELHVCQUF1QjtRQUN2QixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxLQUFLLElBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDNUgsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEtBQUssSUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLEtBQUssSUFBSSxFQUFFLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7UUFFRCxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEQsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO1lBQ25CLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUYsQ0FBQztRQUdELGlEQUFpRDtRQUNqRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxzQ0FBc0M7UUFDdEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEcsS0FBSyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDbkMsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEUsRUFBRSxD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QVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFJNUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxTQUFTLENB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QyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDeEQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BILENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0ksQ0FBQztRQUVELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztJ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RztnQkFDakIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEgsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDbkQsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdEQsQ0FBQztnQkFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLFlBQVksSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakgsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNB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QUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUMxQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRWpDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUVqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDakMsS0FBSyxDQUFDO1lBQ1YsS0FBSyxDQUFDO2dCQUNGLElBQUksQ0FBQyxNQUFNLENBQUMs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LElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQzNCLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQzlHLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2xILENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQzFELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENB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QU0sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdkYsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDNUUsQ0FBQztJQUVOLENBQUM7SUFDRCxvQ0FBc0IsR0FBdEIsVUFBdUIsQ0FBTTtRQUN6QixJQUFJLEdBQUcsR0FBVSxFQUFFLENBQUM7UUFFcEIsMkJBQTJCO1FBQzNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDOUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFD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UUFFN0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzNGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUNqRSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTlFLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDN0UsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENB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LENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUIsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QixDQUFDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUMvRyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDNUIsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RCLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFB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QUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvSCxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyx3RkFBd0Y7Z0JBQ3hGLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUM5QixDQUFDO1FBQ0wsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8sdUNBQWdCLEdBQXhCLFVBQXlCLFVBQTRCO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVaLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7SUFDNUMsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0F0TEEsQUFzTEMsSUFBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZW51bSBBRUZvbnRTdHlsZSB7XHJcbiAgICBCb2xkLFxyXG4gICAgTGFyZ2VcclxufVxyXG5jbGFzcyBBRUZvbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgdGV4dDogc3RyaW5nO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGxldHRlcnM6IFBoYXNlci5JbWFnZVtdO1xyXG4gICAgcHJpdmF0ZSBzdHlsZTogQUVGb250U3R5bGU7XHJcblxyXG4gICAgc3RhdGljIGdldFdpZHRoKHN0eWxlOiBBRUZvbnRTdHlsZSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gNyAqIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDEwICogbGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldEZvbnRJbmRleChzdHlsZTogQUVGb250U3R5bGUsIGNoYXI6IG51bWJlcik6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmIChzdHlsZSA9PSBBRUZvbnRTdHlsZS5MYXJnZSkge1xyXG4gICAgICAgICAgICAvLyBsYXJnZSBmb250XHJcbiAgICAgICAgICAgIGlmIChjaGFyID49IDQ4ICYmIGNoYXIgPD0gNTcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEb24ndCByZWNvZ25pemUgY2hhciBjb2RlIFwiICsgY2hhciArIFwiIGZvciBmb250IGxhcmdlXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJvbGQgZm9udFxyXG5cclxuICAgICAgICBpZiAoY2hhciA+PSA2NSAmJiBjaGFyIDwgOTApIHsgLy8gY2FwaXRhbCBsZXR0ZXJzIHdpdGhvdXQgWlxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDY1O1xyXG4gICAgICAgIH1lbHNlIGlmIChjaGFyID49IDQ5ICYmIGNoYXIgPD0gNTcpIHsgLy8gYWxsIG51bWJlcnMgd2l0aG91dCAwXHJcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDkgKyAyNztcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0OCkgeyAvLyAwXHJcbiAgICAgICAgICAgIHJldHVybiAxNDsgLy8gcmV0dXJuIE9cclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0NSkgeyAvLyAtXHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0MykgeyAvLyArXHJcbiAgICAgICAgICAgIHJldHVybiAyNjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9uJ3QgcmVjb2duaXplIGNoYXIgY29kZSBcIiArIGNoYXIgKyBcIiBmb3IgZm9udCBib2xkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgc3R5bGU6IEFFRm9udFN0eWxlLCB0ZXh0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxldHRlciBvZiB0aGlzLmxldHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0dGVyLnggPSB4O1xyXG4gICAgICAgICAgICBsZXR0ZXIueSA9IHk7XHJcbiAgICAgICAgICAgIHggKz0gbGV0dGVyLndpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzZXRWaXNpYmlsaXR5KHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBmb3IgKGxldCBsZXR0ZXIgb2YgdGhpcy5sZXR0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldHRlci52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGw6IFBoYXNlci5JbWFnZVtdID0gW107XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLng7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoYXIgPSB0aGlzLnRleHQuY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gQUVGb250LmdldEZvbnRJbmRleCh0aGlzLnN0eWxlLCBjaGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHggKz0gQUVGb250LmdldFdpZHRoKHRoaXMuc3R5bGUsIDEpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmb250X25hbWU6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICAgICAgZm9udF9uYW1lID0gXCJjaGFyc1wiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuTGFyZ2UpIHtcclxuICAgICAgICAgICAgICAgIGZvbnRfbmFtZSA9IFwibGNoYXJzXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZTogUGhhc2VyLkltYWdlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sZXR0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuaW1hZ2UoeCwgdGhpcy55LCBmb250X25hbWUsIG51bGwsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltYWdlLmZyYW1lID0gaW5kZXg7XHJcbiAgICAgICAgICAgIGwucHVzaChpbWFnZSk7XHJcbiAgICAgICAgICAgIHggKz0gaW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGV0dGVyID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGxldHRlci5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IGw7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEludGVyYWN0aW9uRGVsZWdhdGUge1xyXG5cclxuICAgIGdhbWU6IFBoYXNlci5HYW1lO1xyXG5cclxuICAgIGZyYW1lX21hbmFnZXI6IEZyYW1lTWFuYWdlcjtcclxuICAgIGN1cnNvcl9zdGlsbDogYm9vbGVhbjtcclxuICAgIGNhbWVyYV9zdGlsbDogYm9vbGVhbjtcclxuICAgIGN1cnNvcl90YXJnZXQ6IFBvcztcclxuICAgIGN1cnNvcjogU3ByaXRlO1xyXG5cclxuICAgIGJ1eUVudGl0eShraW5nOiBFbnRpdHksIHR5cGU6IEVudGl0eVR5cGUpOiBFbnRpdHk7XHJcbiAgICBuZXh0VHVybigpOiB2b2lkO1xyXG4gICAgZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlOiBBbGxpYW5jZSk6IG51bWJlcjtcclxuICAgIHNldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UsIGdvbGQ6IG51bWJlcik6IHZvaWQ7XHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBib29sZWFuO1xyXG4gICAgZGVzZWxlY3RFbnRpdHkoY2hhbmdlZDogYm9vbGVhbik6IHZvaWQ7XHJcbiAgICBzaG93UmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVJhbmdlO1xyXG4gICAgaGlkZVJhbmdlKCk6IHZvaWQ7XHJcblxyXG4gICAgbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSwgdGFyZ2V0OiBQb3MsIGFuaW1hdGU6IGJvb2xlYW4pOiBib29sZWFuO1xyXG4gICAgb2NjdXB5KHBvc2l0aW9uOiBQb3MsIGFsbGlhbmNlOiBBbGxpYW5jZSk6IHZvaWQ7XHJcbiAgICBhdHRhY2tFbnRpdHkoZW50aXR5OiBFbnRpdHksIHRhcmdldDogRW50aXR5KTogdm9pZDtcclxuICAgIHJhaXNlRW50aXR5KHdpemFyZDogRW50aXR5LCBkZWFkOiBFbnRpdHkpOiB2b2lkO1xyXG4gICAgc2hvd0luZm8oYWxsOiBib29sZWFuKTogdm9pZDtcclxuICAgIGhpZGVJbmZvKGFsbDogYm9vbGVhbik6IHZvaWQ7XHJcblxyXG4gICAgbG9hZEdhbWUoKTogYm9vbGVhbjtcclxuICAgIHNhdmVHYW1lKCk6IHZvaWQ7XHJcbiAgICBleGl0R2FtZSgpOiB2b2lkO1xyXG59XHJcblxyXG5jbGFzcyBJbnRlcmFjdGlvbiBpbXBsZW1lbnRzIEVudGl0eU1hbmFnZXJEZWxlZ2F0ZSwgTWVudURlbGVnYXRlIHtcclxuICAgIGN1cnNvcl9wb3NpdGlvbjogUG9zO1xyXG5cclxuICAgIHByb3RlY3RlZCBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbiAgICBwcm90ZWN0ZWQgbWFwOiBNYXA7XHJcbiAgICBwcm90ZWN0ZWQgZGVsZWdhdGU6IEludGVyYWN0aW9uRGVsZWdhdGU7XHJcblxyXG4gICAgcHJvdGVjdGVkIHNlbGVjdGVkX2VudGl0eTogRW50aXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFsbGlhbmNlOiBBbGxpYW5jZSwgbWFwOiBNYXAsIGRlbGVnYXRlOiBJbnRlcmFjdGlvbkRlbGVnYXRlKSB7XHJcbiAgICAgICAgdGhpcy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuICAgIH1cclxuICAgIGlzUGxheWVyKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlzQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuZ2V0Q3Vyc29yUG9zaXRpb24oKTtcclxuICAgIH1cclxuICAgIHNldEN1cnNvclBvc2l0aW9uKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLmN1cnNvcl9wb3NpdGlvbiA9IHBvc2l0aW9uLmNvcHkoKTtcclxuICAgIH1cclxuICAgIGdldEN1cnNvclBvc2l0aW9uKCk6IFBvcyB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5jdXJzb3JfcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3Vyc29yX3Bvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtpbmcgPSB0aGlzLm1hcC5nZXRLaW5nUG9zaXRpb24odGhpcy5hbGxpYW5jZSk7XHJcbiAgICAgICAgaWYgKCEha2luZykge1xyXG4gICAgICAgICAgICByZXR1cm4ga2luZy5jb3B5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvd25fZW50aXRpZXMgPSB0aGlzLm1hcC5nZXRFbnRpdGllc1dpdGgodGhpcy5hbGxpYW5jZSk7XHJcbiAgICAgICAgaWYgKG93bl9lbnRpdGllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvd25fZW50aXRpZXNbMF0ucG9zaXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50XHJcbiAgICB9XHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50ZWRcclxuICAgIH1cclxuICAgIGVudGl0eURpZE1vdmUoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyBpbXBsZW1lbnRcclxuICAgIH1cclxuICAgIGVudGl0eURpZEFuaW1hdGlvbihlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIGltcGxlbWVudFxyXG4gICAgfVxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50XHJcbiAgICB9XHJcbiAgICBjbG9zZU1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE5vQUkgZXh0ZW5kcyBJbnRlcmFjdGlvbiB7XHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5uZXh0VHVybigpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpbnRlcmFjdGlvbi50c1wiIC8+XHJcblxyXG5lbnVtIEFJU3RhdGUge1xyXG4gICAgTm9uZSxcclxuICAgIFNlbGVjdCxcclxuICAgIE1vdmluZyxcclxuICAgIEFjdGlvbixcclxuICAgIEF0dGFjayxcclxuICAgIFJhaXNlLFxyXG4gICAgRGVzZWxlY3RcclxufVxyXG5cclxuY2xhc3MgQUkgZXh0ZW5kcyBJbnRlcmFjdGlvbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfc2VsZWN0ZWQ6IEVudGl0eTtcclxuICAgIHByaXZhdGUgZW50aXR5X2F0dGFjazogRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBlbnRpdHlfcmFpc2U6IEVudGl0eTtcclxuICAgIHByaXZhdGUgZW50aXR5X3RhcmdldDogUG9zO1xyXG5cclxuICAgIHByaXZhdGUgc29sZGllcnM6IEVudGl0eVtdO1xyXG4gICAgcHJpdmF0ZSBuZWFyZXN0X2hvdXNlOiBCdWlsZGluZztcclxuXHJcbiAgICBwcml2YXRlIHN0YXRlOiBBSVN0YXRlO1xyXG4gICAgcHJpdmF0ZSBwYXVzZTogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgdGVzdDogRW50aXR5VHlwZVtdO1xyXG5cclxuICAgIHN0YXRpYyBnZXRUaWxlU2NvcmUodGlsZTogVGlsZSkge1xyXG4gICAgICAgIHN3aXRjaCAodGlsZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhbGxpYW5jZTogQWxsaWFuY2UsIG1hcDogTWFwLCBkZWxlZ2F0ZTogSW50ZXJhY3Rpb25EZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKGFsbGlhbmNlLCBtYXAsIGRlbGVnYXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuTm9uZTtcclxuICAgICAgICB0aGlzLnBhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50ZXN0ID0gW0VudGl0eVR5cGUuV2l6YXJkLCBFbnRpdHlUeXBlLkxpemFyZF07XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LldhaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ID09IElucHV0Q29udGV4dC5XYWl0KSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2UgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLkFjdGlvbjtcclxuICAgIH1cclxuICAgIGVudGl0eURpZEFuaW1hdGlvbihlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yLnNob3coKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gQUlTdGF0ZS5EZXNlbGVjdDtcclxuICAgIH1cclxuICAgIHJ1bigpIHtcclxuXHJcbiAgICAgICAgLy8gd2FpdCBmb3Igbm8gbW92ZW1lbnRcclxuICAgICAgICBpZiAoIXRoaXMuZGVsZWdhdGUuY2FtZXJhX3N0aWxsIHx8ICF0aGlzLmRlbGVnYXRlLmN1cnNvcl9zdGlsbCB8fCB0aGlzLnBhdXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9IEFJU3RhdGUuTm9uZSkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgQUlTdGF0ZS5TZWxlY3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmVudGl0eV90YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUubW92ZUVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgdGhpcy5lbnRpdHlfdGFyZ2V0LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuTW92aW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X3RhcmdldC5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBBSVN0YXRlLkFjdGlvbjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISF0aGlzLmVudGl0eV9hdHRhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmVudGl0eV9hdHRhY2sucG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmF0dGFja0VudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgdGhpcy5lbnRpdHlfYXR0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLkF0dGFjaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X2F0dGFjay5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuQXR0YWNrLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZWxlY3RUYXJnZXRJblJhbmdlKHRoaXMuZW50aXR5X2F0dGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5lbnRpdHlfcmFpc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmVudGl0eV9yYWlzZS5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUucmFpc2VFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIHRoaXMuZW50aXR5X3JhaXNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLlJhaXNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLlJhaXNlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSB0aGlzLmVudGl0eV9yYWlzZS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRfZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuT2NjdXB5SG91c2UpICYmIHRoaXMubWFwLmdldFRpbGVBdCh0aGlzLmVudGl0eV90YXJnZXQpID09IFRpbGUuSG91c2UgJiYgdGhpcy5tYXAuZ2V0QWxsaWFuY2VBdCh0aGlzLmVudGl0eV90YXJnZXQpICE9IHRoaXMuYWxsaWFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5vY2N1cHkodGhpcy5lbnRpdHlfdGFyZ2V0LCB0aGlzLmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuRGVzZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEFJU3RhdGUuRGVzZWxlY3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZGVzZWxlY3RFbnRpdHkodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuTm9uZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5tYXAuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSAhPSB0aGlzLmFsbGlhbmNlIHx8IGVudGl0eS5zdGF0ZSAhPSBFbnRpdHlTdGF0ZS5SZWFkeSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnR5cGUgPT0gOSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGtpbmcgYWx3YXlzIGxhc3RcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5jb3VudEVudGl0aWVzV2l0aCh0aGlzLmFsbGlhbmNlLCBFbnRpdHlTdGF0ZS5SZWFkeSkgIT0gMSkgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkNhc3RsZSAmJiB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ga2luZyBpcyBpbiBjYXN0bGUgb3duZWQgYnkgaGltXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5jb3VudEVudGl0aWVzV2l0aCh0aGlzLmFsbGlhbmNlLCB1bmRlZmluZWQsIEVudGl0eVR5cGUuU29sZGllcikgPCAyICYmIHRoaXMuY2hlY2tDb3N0QW5kU3BhY2UoZW50aXR5LnBvc2l0aW9uLCBFbnRpdHlUeXBlLlNvbGRpZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGxlc3MgdGhhbiB0d28gc29sZGllcnMsIGJ1eSBvbmUgaWYgZW5vdWdoIGNvc3QgYW5kIHNwYWNlIGFyb3VuZCBjYXN0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5ID0gdGhpcy5kZWxlZ2F0ZS5idXlFbnRpdHkoZW50aXR5LCBFbnRpdHlUeXBlLlNvbGRpZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuZ2V0R29sZEZvckFsbGlhbmNlKHRoaXMuYWxsaWFuY2UpID49IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTW3RoaXMudGVzdFswXV0uY29zdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5ID0gdGhpcy5kZWxlZ2F0ZS5idXlFbnRpdHkoZW50aXR5LCB0aGlzLnRlc3RbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zc2libGU6IEVudGl0eVR5cGVbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlID0gMTsgdHlwZSA8IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aDsgdHlwZSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXAuY291bnRFbnRpdGllc1dpdGgodGhpcy5hbGxpYW5jZSwgdW5kZWZpbmVkLCA8RW50aXR5VHlwZT4gdHlwZSkgPj0gMSAmJiBBbmNpZW50RW1waXJlcy5FTlRJVElFU1t0eXBlXS5jb3N0IDwgNjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2hlY2tDb3N0QW5kU3BhY2UoZW50aXR5LnBvc2l0aW9uLCA8RW50aXR5VHlwZT4gdHlwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlLnB1c2goPEVudGl0eVR5cGU+IHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hvaWNlID0gcG9zc2libGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSB0aGlzLmRlbGVnYXRlLmJ1eUVudGl0eShlbnRpdHksIGNob2ljZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLlNlbGVjdDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfc2VsZWN0ZWQgPSBlbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgIGxldCBlbnRpdHlfcmFuZ2UgPSB0aGlzLmRlbGVnYXRlLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuTW92ZSwgZW50aXR5KTtcclxuICAgICAgICAgICAgZW50aXR5X3JhbmdlLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc29sZGllcnMgPSB0aGlzLm1hcC5nZXRFbnRpdGllc1dpdGgodGhpcy5hbGxpYW5jZSwgdW5kZWZpbmVkLCBFbnRpdHlUeXBlLlNvbGRpZXIpO1xyXG4gICAgICAgICAgICB0aGlzLm5lYXJlc3RfaG91c2UgPSB0aGlzLm1hcC5nZXROZWFyZXN0SG91c2VGb3JFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgbGV0IGJlc3RfbW92ZV9zY29yZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiBlbnRpdHlfcmFuZ2Uud2F5cG9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZSA9IHRoaXMubWFwLmdldEVudGl0eUF0KHdheXBvaW50LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmICghIWUgJiYgZSAhPSBlbnRpdHkpIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbnRBdHRhY2tBZnRlck1vdmluZykgfHwgZSA9PSBlbnRpdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0cyA9IHRoaXMubWFwLmdldEF0dGFja1RhcmdldHMoZW50aXR5LCB3YXlwb2ludC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5nZXRTY29yZShlbnRpdHksIHdheXBvaW50LnBvc2l0aW9uLCB0YXJnZXQsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPD0gYmVzdF9tb3ZlX3Njb3JlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RfbW92ZV9zY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9yYWlzZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X2F0dGFjayA9IHRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfdGFyZ2V0ID0gd2F5cG9pbnQucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5SYWlzZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0cyA9IHRoaXMubWFwLmdldFJhaXNlVGFyZ2V0cyhlbnRpdHksIHdheXBvaW50LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0YXJnZXQgb2YgdGFyZ2V0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2NvcmUgPSB0aGlzLmdldFNjb3JlKGVudGl0eSwgd2F5cG9pbnQucG9zaXRpb24sIG51bGwsIHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29yZSA8PSBiZXN0X21vdmVfc2NvcmUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdF9tb3ZlX3Njb3JlID0gc2NvcmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X2F0dGFjayA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X3JhaXNlID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV90YXJnZXQgPSB3YXlwb2ludC5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5nZXRTY29yZShlbnRpdHksIHdheXBvaW50LnBvc2l0aW9uLCBudWxsLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA8PSBiZXN0X21vdmVfc2NvcmUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgIGJlc3RfbW92ZV9zY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfYXR0YWNrID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X3JhaXNlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X3RhcmdldCA9IHdheXBvaW50LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29sZGllcnMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUubmV4dFR1cm4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gZW50aXR5O1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0Nvc3RBbmRTcGFjZShwb3NpdGlvbjogUG9zLCB0eXBlOiBFbnRpdHlUeXBlKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBlbm91Z2ggZ29sZFxyXG4gICAgICAgIGlmICh0aGlzLmRlbGVnYXRlLmdldEdvbGRGb3JBbGxpYW5jZSh0aGlzLmFsbGlhbmNlKSA8IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTWzxudW1iZXI+IHR5cGVdLmNvc3QpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBlbXB0eSBzcGFjZSBhcm91bmQgY2FzdGxlXHJcbiAgICAgICAgbGV0IHdheXBvaW50cyA9IHRoaXMubWFwLmVudGl0eV9yYW5nZS5jYWxjdWxhdGVXYXlwb2ludHMocG9zaXRpb24sIHRoaXMuYWxsaWFuY2UsIHR5cGUsIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTWzxudW1iZXI+IHR5cGVdLm1vdiwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gY2FudCBiZSBvbiBjYXN0bGUgLT4gbWluIDIgd2F5cG9pbnRzXHJcbiAgICAgICAgaWYgKHdheXBvaW50cy5sZW5ndGggPCAyKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRTY29yZShlbnRpdHk6IEVudGl0eSwgcG9zaXRpb246IFBvcywgYXR0YWNrOiBFbnRpdHksIHJhaXNlOiBFbnRpdHkpIHtcclxuICAgICAgICBsZXQgc2NvcmUgPSAwO1xyXG4gICAgICAgIHN3aXRjaCAoZW50aXR5LnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlUeXBlLlNvbGRpZXI6XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbW92ZSB0b3dhcmRzIG5lYXJlc3QgaG91c2UgKHVub2NjdXBpZWQgZm9yIHNvbGRpZXJzKVxyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5tYXAuZ2V0S2luZ1Bvc2l0aW9uKHRoaXMuYWxsaWFuY2UpICYmICEhdGhpcy5uZWFyZXN0X2hvdXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNjb3JlX2hvdXNlID0gdGhpcy5tYXAud2lkdGggKyB0aGlzLm1hcC5oZWlnaHQgLSBwb3NpdGlvbi5kaXN0YW5jZVRvKHRoaXMubmVhcmVzdF9ob3VzZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgKz0gc2NvcmVfaG91c2UgKiBzY29yZV9ob3VzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnaXZlIGFkdmFudGFnZXMgdG8gY2VydGFpbiB0aWxlcyAoc3RheSBhd2F5IGZyb20gZGlmZmljdWx0IHRlcnJhaW4pXHJcbiAgICAgICAgICAgICAgICBpZiAoQUkuZ2V0VGlsZVNjb3JlKHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbikpIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSA1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNwcmVhZCBzb2xkaWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc29sZGllciBvZiB0aGlzLnNvbGRpZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvbGRpZXIgPT0gZW50aXR5KSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNjb3JlX3NvbGRpZXJzID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkoc29sZGllcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgKz0gc2NvcmVfc29sZGllcnMgKiBzY29yZV9zb2xkaWVycztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhYmxlIHRvIG9jY3VweSBob3VzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbikgPT0gVGlsZS5Ib3VzZSAmJiB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKSAhPSBlbnRpdHkuYWxsaWFuY2UgJiYgIWF0dGFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlICs9IDIwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVR5cGUuV2l6YXJkOlxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFibGUgdG8gcmFpc2UgdW5pdFxyXG4gICAgICAgICAgICAgICAgaWYgKCEhcmFpc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlUeXBlLktpbmc6XHJcblxyXG4gICAgICAgICAgICAgICAgLy8ga2VlcCBzdGlsbFxyXG4gICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uLm1hdGNoKGVudGl0eS5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSAyMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGdldCBzY29yZSBmb3IgYXR0YWNrXHJcbiAgICAgICAgaWYgKCEhYXR0YWNrKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRhY2suc2hvdWxkQ291bnRlcihwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHNjb3JlICs9IGVudGl0eS5nZXRQb3dlckVzdGltYXRlKHBvc2l0aW9uLCB0aGlzLm1hcCkgLSBhdHRhY2suZ2V0UG93ZXJFc3RpbWF0ZShwb3NpdGlvbiwgdGhpcy5tYXApICsgMTAgLSBhdHRhY2suaGVhbHRoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUgKz0gZW50aXR5LmdldFBvd2VyRXN0aW1hdGUocG9zaXRpb24sIHRoaXMubWFwKSAqIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlID09IEVudGl0eVR5cGUuS2luZykge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUgKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3JlICs9IHRoaXMubWFwLmdldERlZkF0KHBvc2l0aW9uLCBlbnRpdHkudHlwZSkgKiAyO1xyXG4gICAgICAgIGxldCBlbmVteV9raW5nX3BvcyA9IHRoaXMubWFwLmdldEtpbmdQb3NpdGlvbih0aGlzLmFsbGlhbmNlID09IEFsbGlhbmNlLlJlZCA/IEFsbGlhbmNlLkJsdWUgOiBBbGxpYW5jZS5SZWQpO1xyXG4gICAgICAgIGlmICghIWVuZW15X2tpbmdfcG9zKSB7XHJcbiAgICAgICAgICAgIHNjb3JlICs9ICh0aGlzLm1hcC53aWR0aCArIHRoaXMubWFwLmhlaWdodCAtIHBvc2l0aW9uLmRpc3RhbmNlVG8oZW5lbXlfa2luZ19wb3MpKSAqIDI7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gZ2V0IHNjb3JlIGlmIGluanVyZWQgb24gaG91c2UgKGhlYWxpbmcgZWZmZWN0KVxyXG4gICAgICAgIGlmICh0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pID09IFRpbGUuSG91c2UgJiYgdGhpcy5tYXAuZ2V0QWxsaWFuY2VBdChwb3NpdGlvbikgPT0gZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIHNjb3JlICs9ICgxMCAtIGVudGl0eS5oZWFsdGgpICogMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGluanVyZWQsIG1vdmUgdG93YXJkcyBuZXh0IGhvdXNlXHJcbiAgICAgICAgaWYgKGVudGl0eS5oZWFsdGggPCA1ICYmIGVudGl0eS50eXBlICE9IEVudGl0eVR5cGUuU29sZGllciAmJiAhIXRoaXMubmVhcmVzdF9ob3VzZSkge1xyXG4gICAgICAgICAgICBsZXQgc2NvcmVfaW5qID0gdGhpcy5tYXAud2lkdGggKyB0aGlzLm1hcC5oZWlnaHQgLSBwb3NpdGlvbi5kaXN0YW5jZVRvKHRoaXMubmVhcmVzdF9ob3VzZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHNjb3JlICs9IHNjb3JlX2luaiAqIHNjb3JlX2luajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1hcC5nZXRNYXAoKSA9PSAyICYmICEhdGhpcy5uZWFyZXN0X2hvdXNlKSB7XHJcbiAgICAgICAgICAgIGxldCBkeCA9IE1hdGguYWJzKHRoaXMubmVhcmVzdF9ob3VzZS5wb3NpdGlvbi54IC0gcG9zaXRpb24ueCkgLSAxO1xyXG4gICAgICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyh0aGlzLm5lYXJlc3RfaG91c2UucG9zaXRpb24ueSAtIHBvc2l0aW9uLnkpIC0gMztcclxuICAgICAgICAgICAgaWYgKGR4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkeSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgc2NvcmVfbTIgPSB0aGlzLm1hcC53aWR0aCArIHRoaXMubWFwLmhlaWdodCAtIDIgKiAoZHggKyBkeSk7XHJcbiAgICAgICAgICAgIHNjb3JlICs9IHNjb3JlX20yICogc2NvcmVfbTI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjb3JlICs9IDEwICogZW50aXR5LnBvc2l0aW9uLmRpc3RhbmNlVG8ocG9zaXRpb24pIC8gKGVudGl0eS5kYXRhLm1vdiAtIDEpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNjb3JlKTtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuY2xhc3MgUG9zIGltcGxlbWVudHMgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIG1hdGNoKHA6IElQb3MpIHtcclxuICAgICAgICByZXR1cm4gKCEhcCAmJiB0aGlzLnggPT0gcC54ICYmIHRoaXMueSA9PSBwLnkpO1xyXG4gICAgfVxyXG4gICAgY29weShkaXJlY3Rpb246IERpcmVjdGlvbiA9IERpcmVjdGlvbi5Ob25lKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55IC0gMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICsgMSwgdGhpcy55KTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55ICsgMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggLSAxLCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMueS0tO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54Kys7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMueSsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLngtLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGRpc3RhbmNlVG8gKHA6IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHAueCAtIHRoaXMueCkgKyBNYXRoLmFicyhwLnkgLSB0aGlzLnkpO1xyXG4gICAgfVxyXG4gICAgZ2V0RGlyZWN0aW9uVG8gKHA6IFBvcyk6IERpcmVjdGlvbiB7XHJcbiAgICAgICAgaWYgKHAueCA+IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLlJpZ2h0OyB9XHJcbiAgICAgICAgaWYgKHAueCA8IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLkxlZnQ7IH1cclxuICAgICAgICBpZiAocC55ID4gdGhpcy55KSB7IHJldHVybiBEaXJlY3Rpb24uRG93bjsgfVxyXG4gICAgICAgIGlmIChwLnkgPCB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5VcDsgfVxyXG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uTm9uZTtcclxuICAgIH1cclxuICAgIGdldFdvcmxkUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCB0aGlzLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgfVxyXG4gICAgZ2V0SSgpOiBJUG9zIHtcclxuICAgICAgICByZXR1cm4ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcclxuICAgIH1cclxufVxyXG5lbnVtIERpcmVjdGlvbiB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFVwID0gMSxcclxuICAgIFJpZ2h0ID0gMixcclxuICAgIERvd24gPSA0LFxyXG4gICAgTGVmdCA9IDgsXHJcbiAgICBBbGwgPSAxNVxyXG59XHJcbiIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgd29ybGRfcG9zaXRpb246IElQb3M7XHJcbiAgICBzcHJpdGU6IFBoYXNlci5TcHJpdGU7XHJcbiAgICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGZyYW1lczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIG9mZnNldF94OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG9mZnNldF95OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGZyYW1lOiBudW1iZXI7XHJcblxyXG4gICAgaW5pdCh3b3JsZF9wb3NpdGlvbjogSVBvcywgZ3JvdXA6IFBoYXNlci5Hcm91cCwgbmFtZTogc3RyaW5nLCBmcmFtZXM6IG51bWJlcltdID0gW10pIHtcclxuICAgICAgICB0aGlzLndvcmxkX3Bvc2l0aW9uID0gd29ybGRfcG9zaXRpb247XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSAwO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gZnJhbWVzO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZSA9IGdyb3VwLmdhbWUuYWRkLnNwcml0ZSh0aGlzLndvcmxkX3Bvc2l0aW9uLngsIHRoaXMud29ybGRfcG9zaXRpb24ueSwgdGhpcy5uYW1lKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5mcmFtZSA9IHRoaXMuZnJhbWVzWzBdO1xyXG4gICAgICAgIGdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZXMoZnJhbWVzOiBudW1iZXJbXSwgZnJhbWU6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcclxuICAgICAgICB0aGlzLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lICUgdGhpcy5mcmFtZXMubGVuZ3RoXTtcclxuICAgIH1cclxuICAgIHNldE9mZnNldCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSB4O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSB5O1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZShmcmFtZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWUpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5mcmFtZSAlIHRoaXMuZnJhbWVzLmxlbmd0aF07XHJcbiAgICB9XHJcbiAgICBzZXRXb3JsZFBvc2l0aW9uKHdvcmxkX3Bvc2l0aW9uOiBJUG9zKSB7XHJcbiAgICAgICAgdGhpcy53b3JsZF9wb3NpdGlvbiA9IHdvcmxkX3Bvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy53b3JsZF9wb3NpdGlvbi54ICsgdGhpcy5vZmZzZXRfeDtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy53b3JsZF9wb3NpdGlvbi55ICsgdGhpcy5vZmZzZXRfeTtcclxuICAgIH1cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFBOR1dhaXRlciB7XHJcblxyXG4gICAgYXdhaXRpbmc6IGJvb2xlYW47XHJcbiAgICBjb3VudGVyOiBudW1iZXI7XHJcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XHJcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cclxuICAgIH1cclxuICAgIGF3YWl0KCkge1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAvLyBpZiBpbWcub25sb2FkIGlzIHN5bmNocm9ub3VzXHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyKys7XHJcbiAgICB9XHJcbiAgICByZXQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyLS07XHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA+IDAgfHwgIXRoaXMuYXdhaXRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG5cclxuICAgIH07XHJcbn1cclxuY2xhc3MgUE5HTG9hZGVyIHtcclxuICAgIHN0YXRpYyBidWZmZXJUb0Jhc2U2NChidWY6IFVpbnQ4QXJyYXkpIHtcclxuICAgICAgICBsZXQgYmluc3RyID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGJ1ZiwgZnVuY3Rpb24gKGNoOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY2gpO1xyXG4gICAgICAgIH0pLmpvaW4oXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIGJ0b2EoYmluc3RyKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbG9hZFNwcml0ZVNoZWV0KHdhaXRlcjogUE5HV2FpdGVyLCBuYW1lOiBzdHJpbmcsIHRpbGVfd2lkdGg/OiBudW1iZXIsIHRpbGVfaGVpZ2h0PzogbnVtYmVyLCBudW1iZXJfb2ZfdGlsZXM/OiBudW1iZXIsIHZhcmlhdGlvbj86IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgc3ByaXRlc2hlZXRfbmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiB0aWxlX2hlaWdodCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBcIi5zcHJpdGVcIik7XHJcbiAgICAgICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikgeyBudW1iZXJfb2ZfdGlsZXMgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiKSB7IHRpbGVfd2lkdGggPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV9oZWlnaHQgPT0gXCJ1bmRlZmluZWRcIikgeyB0aWxlX2hlaWdodCA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KG5hbWUgKyBcIi5wbmdcIikpIHtcclxuICAgICAgICAgICAgLy8gYWxsIHRpbGVzIGFyZSBpbiBvbmUgZmlsZVxyXG4gICAgICAgICAgICBsZXQgcG5nX2J1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgXCIucG5nXCIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhcmlhdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlc2hlZXRfbmFtZSArPSBcIl9cIiArIHZhcmlhdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICAgICAgd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBpbWcsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgUE5HTG9hZGVyLmJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHBuZ19idWZmZXIpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGlsZXMgYXJlIGluIG11bHRpcGxlIGZpbGVzIHdpdGggbmFtZXMgbmFtZV8wMC5wbmcsIG5hbWVfMDEucG5nLCAuLi5cclxuXHJcbiAgICAgICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICAgICAgbGV0IGlubmVyX3dhaXRlciA9IG5ldyBQTkdXYWl0ZXIod2FpdGVyLnJldCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3F1YXJlID0gTWF0aC5jZWlsKE1hdGguc3FydChudW1iZXJfb2ZfdGlsZXMpKTtcclxuICAgICAgICAgICAgbGV0IHNwcml0ZXNoZWV0ID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuYml0bWFwRGF0YShzcXVhcmUgKiB0aWxlX3dpZHRoLCBzcXVhcmUgKiB0aWxlX2hlaWdodCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX3RpbGVzOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZHg6IHN0cmluZyA9IGkgPCAxMCA/IChcIl8wXCIgKyBpKSA6IChcIl9cIiArIGkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIGlkeCArIFwiLnBuZ1wiKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0X25hbWUgKz0gXCJfXCIgKyB2YXJpYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbm5lcl93YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0LmN0eC5kcmF3SW1hZ2UoaW1nLCAoaSAlIHNxdWFyZSkgKiB0aWxlX3dpZHRoLCBNYXRoLmZsb29yKGkgLyBzcXVhcmUpICogdGlsZV9oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyX3dhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBQTkdMb2FkZXIuYnVmZmVyVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkocG5nX2J1ZmZlcikpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlubmVyX3dhaXRlci5hd2FpdCgpO1xyXG5cclxuICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBzcHJpdGVzaGVldC5jYW52YXMsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0LCBudW1iZXJfb2ZfdGlsZXMpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvYWRJbWFnZSh3YWl0ZXI6IFBOR1dhaXRlciwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIFwiLnBuZ1wiKTtcclxuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmFkZEltYWdlKG5hbWUsIG51bGwsIGltZyk7XHJcbiAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIFBOR0xvYWRlci5idWZmZXJUb0Jhc2U2NChuZXcgVWludDhBcnJheShwbmdfYnVmZmVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNyZWF0ZVZhcmlhdGlvbihidWZmZXI6IEFycmF5QnVmZmVyLCB2YXJpYXRpb24/OiBudW1iZXIpOiBBcnJheUJ1ZmZlciB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uID09IFwidW5kZWZpbmVkXCIpIHsgcmV0dXJuIGJ1ZmZlcjsgfVxyXG5cclxuICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCk7IC8vIGNvcHkgYnVmZmVyIChvdGhlcndpc2Ugd2UgbW9kaWZ5IG9yaWdpbmFsIGRhdGEsIHNhbWUgYXMgaW4gY2FjaGUpXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBsZXQgc3RhcnRfcGx0ZSA9IDA7XHJcblxyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGRhdGEuYnl0ZUxlbmd0aCAtIDM7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuZ2V0VWludDgoaW5kZXgpICE9IDgwIHx8IGRhdGEuZ2V0VWludDgoaW5kZXggKyAxKSAhPSA3NiB8fCBkYXRhLmdldFVpbnQ4KGluZGV4ICsgMikgIT0gODQpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgc3RhcnRfcGx0ZSA9IGluZGV4IC0gNDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gc3RhcnRfcGx0ZTtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aF9wbHRlID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGxldCBjcmMgPSAtMTsgLy8gMzIgYml0XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGluZGV4ICsgaSksIGNyYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBpbmRleDsgaSA8IGluZGV4ICsgbGVuZ3RoX3BsdGU7IGkgKz0gMykge1xyXG4gICAgICAgICAgICBsZXQgcmVkOiBudW1iZXIgPSBkYXRhLmdldFVpbnQ4KGkpO1xyXG4gICAgICAgICAgICBsZXQgZ3JlZW46IG51bWJlciA9IGRhdGEuZ2V0VWludDgoaSArIDEpO1xyXG4gICAgICAgICAgICBsZXQgYmx1ZTogbnVtYmVyID0gZGF0YS5nZXRVaW50OChpICsgMik7XHJcblxyXG4gICAgICAgICAgICBpZiAoYmx1ZSA+IHJlZCAmJiBibHVlID4gZ3JlZW4pIHtcclxuICAgICAgICAgICAgICAgIC8vIGJsdWUgY29sb3JcclxuICAgICAgICAgICAgICAgIGlmICh2YXJpYXRpb24gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0byByZWQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG1wID0gcmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHRtcDtcclxuICAgICAgICAgICAgICAgICAgICBncmVlbiAvPSAyO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHZhcmlhdGlvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVjb2xvcml6ZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBibHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpLCByZWQpO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMSwgZ3JlZW4pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMiwgYmx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAxKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAyKSwgY3JjKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY3JjIGZpZWxkXHJcbiAgICAgICAgY3JjIF49IC0xO1xyXG4gICAgICAgIGxldCBpbmRleF9jcmMgPSBzdGFydF9wbHRlICsgOCArIGxlbmd0aF9wbHRlO1xyXG4gICAgICAgIGRhdGEuc2V0VWludDMyKGluZGV4X2NyYywgY3JjKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyB1cGRhdGVQTkdDUkModmFsdWU6IG51bWJlciwgY3JjOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGNyYyBePSB2YWx1ZSAmIDI1NTsgLy8gYml0d2lzZSBvciAod2l0aG91dCBhbmQpXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKChjcmMgJiAxKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjcmMgPSBjcmMgPj4+IDEgXiAtMzA2Njc0OTEyO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3JjID4+Pj0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNyYztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicG5nbG9hZGVyLnRzXCIgLz5cclxuXHJcbmludGVyZmFjZSBEYXRhRW50cnkge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG5jbGFzcyBMb2FkZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZCgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lLnNjYWxlLnNjYWxlTW9kZSA9IFBoYXNlci5TY2FsZU1hbmFnZXIuVVNFUl9TQ0FMRTtcclxuICAgICAgICB0aGlzLmdhbWUuc2NhbGUuc2V0VXNlclNjYWxlKDIsIDIpO1xyXG5cclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KFwiZm9udDdcIiwgXCJkYXRhL2ZvbnQucG5nXCIsIFwiZGF0YS9mb250LnhtbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJkYXRhXCIsIFwiZGF0YS8xLnBha1wiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJsYW5nXCIsIFwiZGF0YS9sYW5nLmRhdFwiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgdGhpcy51bnBhY2tSZXNvdXJjZURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvYWRFbnRpdHlEYXRhKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwVGlsZXNQcm9wKCk7XHJcbiAgICAgICAgdGhpcy51bnBhY2tMYW5nRGF0YSgpO1xyXG5cclxuICAgICAgICBsZXQgd2FpdGVyID0gbmV3IFBOR1dhaXRlcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIk1haW5NZW51XCIsIGZhbHNlLCBmYWxzZSwgbmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcInNwbGFzaFwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJzcGxhc2hiZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJzcGxhc2hmZ1wiKTtcclxuXHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidGlsZXMwXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwic3RpbGVzMFwiLCAxMCwgMTApO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDApO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDEpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNcIiwgMjQsIDI0LCAwLCAxKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ1bml0X2ljb25zXCIsIDI0LCAyNCwgMCwgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc19zXCIsIDEwLCAxMCwgMCwgMSk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc19zXCIsIDEwLCAxMCwgMCwgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiY3Vyc29yXCIsIDI2LCAyNik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYl9zbW9rZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJtZW51XCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInBvcnRyYWl0XCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImNoYXJzXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcImdvbGRcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwicG9pbnRlclwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJyZWRzcGFya1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzcGFya1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzbW9rZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzdGF0dXNcIik7XHJcblxyXG5cclxuXHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwicm9hZFwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImdyYXNzXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwibW91bnRhaW5cIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ3YXRlclwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInRvd25cIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJ3b29kc19iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJoaWxsX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcIm1vdW50YWluX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcImJyaWRnZV9iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJ0b3duX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcInRvbWJzdG9uZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJtYXNrXCIpO1xyXG5cclxuICAgICAgICB3YWl0ZXIuYXdhaXQoKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdW5wYWNrUmVzb3VyY2VEYXRhKCkge1xyXG4gICAgICAgIGxldCBhcnJheTogVWludDhBcnJheSA9IHRoaXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkoXCJkYXRhXCIpO1xyXG4gICAgICAgIGxldCBkYXRhID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDI7IC8vIGRvZXMgbm90IHNlZW0gaW1wb3J0YW50XHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRyaWVzID0gZGF0YS5nZXRVaW50MTYoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDI7XHJcblxyXG4gICAgICAgIGxldCBlbnRyaWVzOiBEYXRhRW50cnlbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRyaWVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN0cl9sZW4gPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzdHJfbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhLmdldFVpbnQ4KGluZGV4KyspKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCArPSA0OyAvLyBkb2VzIG5vdCBzZWVtIGltcG9ydGFudFxyXG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgZW50cmllcy5wdXNoKHtuYW1lOiBuYW1lLCBzaXplOiBzaXplfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRyeV9kYXRhOiBBcnJheUJ1ZmZlciA9IGFycmF5LmJ1ZmZlci5zbGljZShpbmRleCwgaW5kZXggKyBlbnRyeS5zaXplKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmNhY2hlLmFkZEJpbmFyeShlbnRyeS5uYW1lLCBlbnRyeV9kYXRhKTtcclxuICAgICAgICAgICAgaW5kZXggKz0gZW50cnkuc2l6ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRFbnRpdHlEYXRhKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInVuaXRzLmJpblwiKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMgPSBbXTtcclxuICAgICAgICBsZXQgbmFtZXMgPSBbXCJTb2xkaWVyXCIsIFwiQXJjaGVyXCIsIFwiTGl6YXJkXCIsIFwiV2l6YXJkXCIsIFwiV2lzcFwiLCBcIlNwaWRlclwiLCBcIkdvbGVtXCIsIFwiQ2F0YXB1bHRcIiwgXCJXeXZlcm5cIiwgXCJLaW5nXCIsIFwiU2tlbGV0b25cIl07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVudGl0eTogRW50aXR5RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldLFxyXG4gICAgICAgICAgICAgICAgbW92OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgYXRrOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgZGVmOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWluOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgY29zdDogZGF0YS5nZXRVaW50MTYoaW5kZXgpLFxyXG4gICAgICAgICAgICAgICAgYmF0dGxlX3Bvc2l0aW9uczogW10sXHJcbiAgICAgICAgICAgICAgICBmbGFnczogRW50aXR5RmxhZ3MuTm9uZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgbGV0IG51bWJlcl9wb3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9wb3M7IGorKykge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmJhdHRsZV9wb3NpdGlvbnMucHVzaCh7eDogZGF0YS5nZXRVaW50OChpbmRleCsrKSwgeTogZGF0YS5nZXRVaW50OChpbmRleCsrKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBudW1iZXJfZmxhZ3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9mbGFnczsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuZmxhZ3MgfD0gMSA8PCBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLnB1c2goZW50aXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRNYXBUaWxlc1Byb3AoKSB7XHJcbiAgICAgICAgbGV0IGJ1ZmZlcjogQXJyYXlCdWZmZXIgPSB0aGlzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KFwidGlsZXMwLnByb3BcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0OyAvLyAyIGFyZSB1bnJlbGV2YW50XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AucHVzaCg8VGlsZT4gZGF0YS5nZXRVaW50OChpbmRleCsrKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHByaXZhdGUgdW5wYWNrTGFuZ0RhdGEoKSB7XHJcbiAgICAgICAgbGV0IGFycmF5OiBVaW50OEFycmF5ID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcImxhbmdcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBudW1iZXIgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuTEFORyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcjsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkxBTkcucHVzaCh0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbiIsImVudW0gS2V5IHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgVXAgPSAxLFxyXG4gICAgUmlnaHQgPSAyLFxyXG4gICAgRG93biA9IDQsXHJcbiAgICBMZWZ0ID0gOCxcclxuICAgIEVudGVyID0gMTYsXHJcbiAgICBFc2MgPSAzMlxyXG59O1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwdWJsaWMgYWxsX2tleXM6IEtleTtcclxuXHJcbiAgICBwcml2YXRlIGtleV91cDogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X3JpZ2h0OiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfZG93bjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2xlZnQ6IFBoYXNlci5LZXk7XHJcbiAgICBwcml2YXRlIGtleV9lbnRlcjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2VzYzogUGhhc2VyLktleTtcclxuXHJcbiAgICBwcml2YXRlIGxhc3Rfa2V5czogS2V5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBQaGFzZXIuSW5wdXQpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyA9IEtleS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmtleV91cCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xyXG4gICAgICAgIHRoaXMua2V5X2Rvd24gPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xyXG4gICAgICAgIHRoaXMua2V5X3JpZ2h0ID0gaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfbGVmdCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfZW50ZXIgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVOVEVSKTtcclxuICAgICAgICB0aGlzLmtleV9lc2MgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVTQyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFsbF9rZXlzICYga2V5KSAhPSAwO1xyXG4gICAgfVxyXG4gICAgY2xlYXJLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyAmPSB+a2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY3VycmVudF9rZXlzOiBLZXkgPSBLZXkuTm9uZTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LlVwLCB0aGlzLmtleV91cC5pc0Rvd24pO1xyXG4gICAgICAgIGN1cnJlbnRfa2V5cyB8PSB0aGlzLnVwZGF0ZUtleShLZXkuUmlnaHQsIHRoaXMua2V5X3JpZ2h0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5Eb3duLCB0aGlzLmtleV9kb3duLmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5MZWZ0LCB0aGlzLmtleV9sZWZ0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5FbnRlciwgdGhpcy5rZXlfZW50ZXIuaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkVzYywgdGhpcy5rZXlfZXNjLmlzRG93bik7XHJcbiAgICAgICAgdGhpcy5sYXN0X2tleXMgPSBjdXJyZW50X2tleXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHNldEtleShrZXk6IEtleSwgeWVzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyBePSAoLXllcyBeIHRoaXMuYWxsX2tleXMpICYga2V5O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB3YXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmxhc3Rfa2V5cyAmIGtleSkgIT0gMDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlS2V5KGtleTogS2V5LCBpc19kb3duOiBib29sZWFuKTogS2V5IHtcclxuICAgICAgICBpZiAoaXNfZG93biAhPSB0aGlzLndhc0tleVByZXNzZWQoa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEtleShrZXksIGlzX2Rvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNfZG93biA/IGtleSA6IDA7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEZyYW1lUmVjdCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XHJcbn1cclxuaW50ZXJmYWNlIEZyYW1lRGVsZWdhdGUge1xyXG4gICAgZnJhbWVXaWxsRGVzdHJveShmcmFtZTogRnJhbWUpOiB2b2lkO1xyXG59XHJcbmVudW0gRnJhbWVBbmltYXRpb24ge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBTaG93ID0gMSxcclxuICAgIEhpZGUgPSAyLFxyXG4gICAgQ2hhbmdlID0gNCxcclxuICAgIFdpcmUgPSA4LFxyXG4gICAgRGVzdHJveSA9IDE2LFxyXG4gICAgVXBkYXRlID0gMzJcclxufVxyXG5jbGFzcyBGcmFtZSB7XHJcbiAgICBzdGF0aWMgQk9SREVSX1NJWkU6IG51bWJlciA9IDI0O1xyXG4gICAgc3RhdGljIEFOSU1fU1RFUFM6IG51bWJlciA9IDE1O1xyXG5cclxuICAgIGRlbGVnYXRlOiBGcmFtZURlbGVnYXRlO1xyXG5cclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBib3JkZXJfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGNvbnRlbnRfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGNvbnRlbnRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIGJvcmRlcl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG5cclxuICAgIHJldXNlX3RpbGVzOiBQaGFzZXIuSW1hZ2VbXTtcclxuXHJcbiAgICBhbGlnbjogRGlyZWN0aW9uO1xyXG4gICAgYW5pbWF0aW9uX2RpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgYm9yZGVyOiBEaXJlY3Rpb247XHJcblxyXG4gICAgYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbjtcclxuXHJcbiAgICBnYW1lX3dpZHRoOiBudW1iZXI7XHJcbiAgICBnYW1lX2hlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50OiBGcmFtZVJlY3Q7XHJcbiAgICB0YXJnZXQ6IEZyYW1lUmVjdDtcclxuICAgIHNwZWVkOiBGcmFtZVJlY3Q7XHJcbiAgICBhY2M6IEZyYW1lUmVjdDtcclxuICAgIHByaXZhdGUgbmV3X2FsaWduOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19ib3JkZXI6IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGU6IGJvb2xlYW47XHJcblxyXG4gICAgc3RhdGljIGdldFJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNvcHlSZWN0KGZyOiBGcmFtZVJlY3QpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIHJldHVybiB7eDogZnIueCwgeTogZnIueSwgd2lkdGg6IGZyLndpZHRoLCBoZWlnaHQ6IGZyLmhlaWdodH07XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA3O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIGFsaWduOiBEaXJlY3Rpb24sIGJvcmRlcjogRGlyZWN0aW9uLCBhbmltX2Rpcj86IERpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYWxpZ24gPSBhbGlnbjtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPSB0eXBlb2YgYW5pbV9kaXIgIT0gXCJ1bmRlZmluZWRcIiA/IGFuaW1fZGlyIDogYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSBib3JkZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZV93aWR0aCA9IHRoaXMuZ3JvdXAuZ2FtZS53aWR0aDtcclxuICAgICAgICB0aGlzLmdhbWVfaGVpZ2h0ID0gdGhpcy5ncm91cC5nYW1lLmhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgb2Zmc2V0X3k6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KG9mZnNldF95KTtcclxuXHJcbiAgICAgICAgaWYgKGFuaW1hdGUpIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHN0YXJ0aW5nIG9mZnNldCB1c2luZyB0aGUgYW5pbV9kaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5TaG93O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5XaXJlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlU3BlZWQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcblxyXG4gICAgICAgIGlmICghYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uSGlkZTtcclxuICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uRGVzdHJveTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uVXBkYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy53aWR0aCA9PSB3aWR0aCAmJiB0aGlzLmhlaWdodCA9PSBoZWlnaHQpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvbGRfd2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGxldCBvbGRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLkNoYW5nZTtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGFrZSB0aGUgYmlnZ2VzdCByZWN0IHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIG9sZF93aWR0aCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgb2xkX2hlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuY3VycmVudCBpcyB0aGUgb2xkIHJlY3QgKG9mZnNldCAmIHNpemUpXHJcbiAgICAgICAgLy8gdXBkYXRlIHRoaXMuY3VycmVudCBzbyB0aGUgc2FtZSBwb3J0aW9uIG9mIHRoZSBmcmFtZSBpcyByZW5kZXJlZCwgYWx0aG91Z2ggaXQgY2hhbmdlZCBpbiBzaXplXHJcbiAgICAgICAgLy8gY2hhbmdlIHRhcmdldCB0byBhbGlnbm1lbnQgcG9zaXRpb24gZm9yIGNoYW5nZWQgcmVjdFxyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC54IC09IHdpZHRoIC0gb2xkX3dpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC54IC09IHdpZHRoIC0gdGhpcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC55IC09IGhlaWdodCAtIG9sZF9oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgLT0gaGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZURpcmVjdGlvbnMoYWxpZ246IERpcmVjdGlvbiwgYm9yZGVyOiBEaXJlY3Rpb24sIGFuaW1fZGlyZWN0aW9uOiBEaXJlY3Rpb24sIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5uZXdfYWxpZ24gPT09IGFsaWduICYmIHRoaXMubmV3X2JvcmRlciA9PSBib3JkZXIgJiYgdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbiA9PSBhbmltX2RpcmVjdGlvbiAmJiB0aGlzLm5ld19hbmltYXRlID09IGFuaW1hdGUpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMubmV3X2FsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5uZXdfYm9yZGVyID0gYm9yZGVyO1xyXG4gICAgICAgIHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb24gPSBhbmltX2RpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLm5ld19hbmltYXRlID0gYW5pbWF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlKHRydWUsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24gPT0gRnJhbWVBbmltYXRpb24uTm9uZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX3ggPSB0aGlzLmFkZEdhaW4oXCJ4XCIsIHN0ZXBzKTtcclxuICAgICAgICBsZXQgZmluaXNoZWRfeSA9IHRoaXMuYWRkR2FpbihcInlcIiwgc3RlcHMpO1xyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfd2lkdGggPSB0cnVlO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF9oZWlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIHNpemUgd2l0aCB0aGUgd2lyZSBhbmltYXRpb25cclxuICAgICAgICAgICAgZmluaXNoZWRfd2lkdGggPSB0aGlzLmFkZEdhaW4oXCJ3aWR0aFwiLCBzdGVwcyk7XHJcbiAgICAgICAgICAgIGZpbmlzaGVkX2hlaWdodCA9IHRoaXMuYWRkR2FpbihcImhlaWdodFwiLCBzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmluaXNoZWRfeCAmJiBmaW5pc2hlZF95ICYmIGZpbmlzaGVkX3dpZHRoICYmIGZpbmlzaGVkX2hlaWdodCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25EaWRFbmQodGhpcy5hbmltYXRpb24pO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uSGlkZSkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkNoYW5nZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgb2Zmc2V0IGFuZCByZW1vdmUgdGlsZXMgb3V0IG9mIHNpZ2h0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkhpZGUpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5EZXN0cm95KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlEaXJlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAvLyBuaWNlIGFuaW1hdGlvbiBmb3IgZnJhbWUgd2l0aCBubyBhbGlnbm1lbnQgJiBubyBhbmltYXRpb24gZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmxpbmVTdHlsZSgxLCAweGZmZmZmZik7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHRoaXMuY3VycmVudC53aWR0aCwgdGhpcy5jdXJyZW50LmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIGlmICghIXRoaXMuZGVsZWdhdGUpIHsgdGhpcy5kZWxlZ2F0ZS5mcmFtZVdpbGxEZXN0cm95KHRoaXMpOyB9XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRnJhbWVBbmltYXRpb24pIHtcclxuICAgICAgICAvLyBpbXBsZW1lbnRlZCBpbiBzdWIgY2xhc3NlcyBpZiBuZWVkZWQgLSBkZWZhdWx0OiBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseURpcmVjdGlvbnMoKSB7XHJcbiAgICAgICAgdGhpcy5hbGlnbiA9IHRoaXMubmV3X2FsaWduO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyID0gdGhpcy5uZXdfYm9yZGVyO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiA9IHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcbiAgICAgICAgdGhpcy5zaG93KHRoaXMubmV3X2FuaW1hdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWxpZ25tZW50UmVjdChvZmZzZXRfeTogbnVtYmVyID0gMCk6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgdXNpbmcgdGhlIGFsaWdubWVudFxyXG4gICAgICAgIGxldCByZWN0ID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IHRoaXMuZ2FtZV93aWR0aCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lX3dpZHRoIC0gdGhpcy53aWR0aCkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZXhjZXB0aW9uIGZvciBtYWluIG1lbnUgLi5cclxuICAgICAgICBpZiAob2Zmc2V0X3kgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IG9mZnNldF95O1xyXG4gICAgICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IHRoaXMuZ2FtZV9oZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWN0LnkgPSBNYXRoLmZsb29yKCh0aGlzLmdhbWVfaGVpZ2h0IC0gdGhpcy5oZWlnaHQpIC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmV0cmFjdGVkUmVjdCgpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZyYW1lLmdldFJlY3QoTWF0aC5mbG9vcih0aGlzLmdhbWVfd2lkdGggLyAyKSwgTWF0aC5mbG9vcih0aGlzLmdhbWVfaGVpZ2h0IC8gMiksIDAsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IC10aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSB0aGlzLmdhbWVfd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IC10aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSB0aGlzLmdhbWVfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlT2Zmc2V0KCkge1xyXG4gICAgICAgIGxldCB4ID0gdGhpcy5jdXJyZW50Lng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLmN1cnJlbnQueTtcclxuXHJcbiAgICAgICAgbGV0IGNfeCA9IDA7XHJcbiAgICAgICAgbGV0IGNfeSA9IDA7XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfeCA9IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgY195ID0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnggPSB4O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC54ID0geCArIGNfeDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAueSA9IHkgKyBjX3k7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdGcmFtZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgY193aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGxldCBjX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY193aWR0aCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfd2lkdGggLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX2hlaWdodCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgY19oZWlnaHQgLT0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3ggPSBNYXRoLmNlaWwod2lkdGggLyBGcmFtZS5CT1JERVJfU0laRSkgLSAyO1xyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3kgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gRnJhbWUuQk9SREVSX1NJWkUpIC0gMjtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmxpbmVTdHlsZSgwKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4Y2ViZWE1KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgY193aWR0aCwgY19oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIGxldCB0aWxlczogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG93X3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgMCwgRGlyZWN0aW9uLlVwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIERpcmVjdGlvbi5Eb3duKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0X3ggKz0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNob3dfdGlsZXNfeTsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgb2Zmc2V0X3ksIERpcmVjdGlvbi5MZWZ0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgb2Zmc2V0X3ksIERpcmVjdGlvbi5SaWdodCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9mZnNldF95ICs9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IHRpbGVzO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVGcmFtZSgpIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdCb3JkZXJUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xyXG4gICAgICAgIGxldCByZXVzZTogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldXNlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZXVzZS5icmluZ1RvVG9wKCk7XHJcbiAgICAgICAgICAgIHJldXNlLnggPSB4O1xyXG4gICAgICAgICAgICByZXVzZS55ID0geTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXVzZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJtZW51XCIsIG51bGwsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV1c2UuZnJhbWUgPSBGcmFtZS5nZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHJldXNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhZGRHYWluKHZhcl9uYW1lOiBzdHJpbmcsIHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5zcGVlZFt2YXJfbmFtZV0gPT0gMCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gKz0gdGhpcy5zcGVlZFt2YXJfbmFtZV0gKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IGQgPSBNYXRoLmZsb29yKHRoaXMuYWNjW3Zhcl9uYW1lXSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSArPSBkO1xyXG4gICAgICAgIHRoaXMuYWNjW3Zhcl9uYW1lXSAtPSBkO1xyXG4gICAgICAgIGlmIChkIDwgMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdIDwgdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1lbHNlIGlmIChkID4gMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID4gdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVNwZWVkKCkge1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBGcmFtZS5nZXRSZWN0KCh0aGlzLnRhcmdldC54IC0gdGhpcy5jdXJyZW50LngpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LnkgLSB0aGlzLmN1cnJlbnQueSkgLyBGcmFtZS5BTklNX1NURVBTLCAodGhpcy50YXJnZXQud2lkdGggLSB0aGlzLmN1cnJlbnQud2lkdGgpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LmhlaWdodCAtIHRoaXMuY3VycmVudC5oZWlnaHQpIC8gRnJhbWUuQU5JTV9TVEVQUyk7XHJcbiAgICAgICAgdGhpcy5hY2MgPSBGcmFtZS5nZXRSZWN0KDAsIDAsIDAsIDApO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVUaWxlcygpIHtcclxuICAgICAgICB3aGlsZSAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICB0aWxlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZyYW1lLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1pbmlNYXAgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdGllczogUGhhc2VyLkltYWdlW107XHJcbiAgICBwcml2YXRlIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZTtcclxuICAgIHByaXZhdGUgbWFwOiBNYXA7XHJcblxyXG4gICAgcHJpdmF0ZSBzbG93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHVuaXRzX3Zpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gbWVudV9kZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zbG93ID0gMDtcclxuICAgICAgICB0aGlzLnVuaXRzX3Zpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUobWFwLndpZHRoICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFICsgMTIsIG1hcC5oZWlnaHQgKiBBbmNpZW50RW1waXJlcy5NSU5JX1NJWkUgKyAxMiwgZ3JvdXAsIERpcmVjdGlvbi5Ob25lLCBEaXJlY3Rpb24uQWxsLCBEaXJlY3Rpb24uTm9uZSk7XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KElucHV0Q29udGV4dC5BY2spOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLmNsb3NlTWVudShJbnB1dENvbnRleHQuQWNrKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnNsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuc2xvdyA+PSAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNsb3cgLT0gMzA7XHJcbiAgICAgICAgICAgIHRoaXMudW5pdHNfdmlzaWJsZSA9ICF0aGlzLnVuaXRzX3Zpc2libGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlLnZpc2libGUgPSB0aGlzLnVuaXRzX3Zpc2libGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMubWFwLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLm1hcC5oZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5nZXRUaWxlSW5kZXhBdChuZXcgUG9zKHgsIHkpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCAqIEFuY2llbnRFbXBpcmVzLk1JTklfU0laRSwgeSAqIEFuY2llbnRFbXBpcmVzLk1JTklfU0laRSwgXCJzdGlsZXMwXCIsIGluZGV4LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMubWFwLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoZW50aXR5LnBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5NSU5JX1NJWkUsIGVudGl0eS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFLCBcInVuaXRfaWNvbnNfc19cIiArICg8bnVtYmVyPiBlbnRpdHkuYWxsaWFuY2UpLCA8bnVtYmVyPiBlbnRpdHkudHlwZSwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5wdXNoKGltYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGdldFRpbGVJbmRleEF0KHBvc2l0aW9uOiBQb3MpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLlBhdGg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkdyYXNzOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiA1O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDY7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIGxldCBhbGxpYW5jZSA9IHRoaXMubWFwLmdldEFsbGlhbmNlQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aWxlID09IFRpbGUuQ2FzdGxlID8gOCA6IDcpICsgKDxudW1iZXI+IGFsbGlhbmNlKSAqIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpbnRlcmFjdGlvbi50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJtaW5pbWFwLnRzXCIgLz5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgSW50ZXJhY3Rpb24ge1xyXG5cclxuICAgIHByaXZhdGUgY29udGV4dDogSW5wdXRDb250ZXh0W107XHJcbiAgICBwcml2YXRlIGtleXM6IElucHV0O1xyXG5cclxuICAgIHByaXZhdGUgb3B0aW9uc19tZW51OiBNZW51T3B0aW9ucztcclxuICAgIHByaXZhdGUgc2hvcF91bml0czogTWVudVNob3BVbml0cztcclxuICAgIHByaXZhdGUgc2hvcF9pbmZvOiBNZW51U2hvcEluZm87XHJcbiAgICBwcml2YXRlIG1pbmlfbWFwOiBNaW5pTWFwO1xyXG5cclxuICAgIHByaXZhdGUgbGFzdF9lbnRpdHlfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGZ1bGxzY3JlZW5fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgaW5zdHJ1Y3Rpb25fbnI6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhbGxpYW5jZTogQWxsaWFuY2UsIG1hcDogTWFwLCBkZWxlZ2F0ZTogSW50ZXJhY3Rpb25EZWxlZ2F0ZSwga2V5czogSW5wdXQpIHtcclxuICAgICAgICBzdXBlcihhbGxpYW5jZSwgbWFwLCBkZWxlZ2F0ZSk7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuICAgICAgICB0aGlzLmNvbnRleHQgPSBbSW5wdXRDb250ZXh0Lk1hcF07XHJcbiAgICB9XHJcblxyXG4gICAgaXNQbGF5ZXIoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzLmFsbF9rZXlzID0gS2V5Lk5vbmU7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIHRoaXMua2V5cy51cGRhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5rZXlzLmFsbF9rZXlzID09IEtleS5Ob25lKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuTWFwOlxyXG4gICAgICAgICAgICAgICAgbGV0IGN1cnNvcl9zdGlsbCA9IHRoaXMuZGVsZWdhdGUuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggJSAyNCA9PSAwICYmIHRoaXMuZGVsZWdhdGUuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnkgJSAyNCA9PSAwO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSAmJiBjdXJzb3Jfc3RpbGwgJiYgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0LnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0Lm1vdmUoRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuUmlnaHQpICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueCA8IHRoaXMubWFwLndpZHRoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tb3ZlKERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkRvd24pICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueSA8IHRoaXMubWFwLmhlaWdodCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uRG93bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkxlZnQpICYmIGN1cnNvcl9zdGlsbCAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uTGVmdCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBpY2tQb3NpdGlvbih0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhZW50aXR5ICYmIGVudGl0eS5wb3NpdGlvbi5tYXRjaCh0aGlzLm1hcC5nZXRLaW5nUG9zaXRpb24odGhpcy5hbGxpYW5jZSkpICYmIGVudGl0eS5kYXRhLmNvc3QgPD0gMTAwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlbnRpdHkgd2FzIGJvdWdodCwgYWRkIGdvbGQgYmFjayBhbmQgcmVtb3ZlIGVudGl0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZ29sZCA9IHRoaXMuZGVsZWdhdGUuZ2V0R29sZEZvckFsbGlhbmNlKHRoaXMuYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnNldEdvbGRGb3JBbGxpYW5jZSh0aGlzLmFsbGlhbmNlLCBnb2xkICsgZW50aXR5LmRhdGEuY29zdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuT3B0aW9uczpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5VcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUucHJldigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkRvd24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51Lm5leHQoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnNfbWVudS5nZXRTZWxlY3RlZCgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKHNlbGVjdGVkKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRXNjKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVzYyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdE9wdGlvbihBY3Rpb24uQ0FOQ0VMKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5TZWxlY3Rpb246XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuVXApICYmIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlVwKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkgJiYgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0LnggPCB0aGlzLm1hcC53aWR0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMubWFwLm5leHRUYXJnZXRJblJhbmdlKERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikgJiYgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0LnkgPCB0aGlzLm1hcC5oZWlnaHQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRG93bik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMubWFwLm5leHRUYXJnZXRJblJhbmdlKERpcmVjdGlvbi5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5MZWZ0KSAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5MZWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLk5vbmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlja0VudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLnNlbGVjdGVkX2VudGl0eTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmRlc2VsZWN0RW50aXR5KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LlNob3A6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuVXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cy5wcmV2KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF9pbmZvLnVwZGF0ZUNvbnRlbnQodGhpcy5zaG9wX3VuaXRzLmdldFNlbGVjdGVkKCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX3VuaXRzLm5leHQoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF9pbmZvLnVwZGF0ZUNvbnRlbnQodGhpcy5zaG9wX3VuaXRzLmdldFNlbGVjdGVkKCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkRvd24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cy5uZXh0KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF9pbmZvLnVwZGF0ZUNvbnRlbnQodGhpcy5zaG9wX3VuaXRzLmdldFNlbGVjdGVkKCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5MZWZ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cy5wcmV2KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KHRoaXMuc2hvcF91bml0cy5nZXRTZWxlY3RlZCgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHlfdHlwZTogbnVtYmVyID0gdGhpcy5zaG9wX3VuaXRzLmdldFNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuZGVsZWdhdGUuYnV5RW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBlbnRpdHlfdHlwZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhZW50aXR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlU2hvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRXNjKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVzYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZVNob3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5BY2s6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghIXRoaXMuZnVsbHNjcmVlbl9ncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghIXRoaXMuZnVsbHNjcmVlbl9ncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VNYXAoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuSW5zdHJ1Y3Rpb25zOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVudGVyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZnVsbHNjcmVlbl9ncm91cCkgeyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnN0cnVjdGlvbl9uciArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPD0gMTcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0cnVjdGlvbl9uciA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1haW5NZW51LnNob3dJbnN0cnVjdGlvbnModGhpcy5mdWxsc2NyZWVuX2dyb3VwLCBuZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlJpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZnVsbHNjcmVlbl9ncm91cCkgeyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5pbnN0cnVjdGlvbl9uciArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPD0gMTcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0cnVjdGlvbl9uciA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1haW5NZW51LnNob3dJbnN0cnVjdGlvbnModGhpcy5mdWxsc2NyZWVuX2dyb3VwLCBuZXh0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZ1bGxzY3JlZW5fZ3JvdXApIHsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldiA9IHRoaXMuaW5zdHJ1Y3Rpb25fbnIgLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwcmV2ID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnN0cnVjdGlvbl9uciA9IHByZXY7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1haW5NZW51LnNob3dJbnN0cnVjdGlvbnModGhpcy5mdWxsc2NyZWVuX2dyb3VwLCBwcmV2KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5mdWxsc2NyZWVuX2dyb3VwKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwLmRlc3Ryb3kodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LldhaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goY29udGV4dCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb250ZXh0ID09IElucHV0Q29udGV4dC5TaG9wKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuaGlkZUluZm8oZmFsc2UpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuaGlkZUluZm8odHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ID09IElucHV0Q29udGV4dC5XYWl0ICYmIGNvbnRleHQgPT0gdGhpcy5jb250ZXh0W3RoaXMuY29udGV4dC5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBhY3RpdmVfY29udGV4dCA9IHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV07XHJcbiAgICAgICAgc3dpdGNoIChhY3RpdmVfY29udGV4dCkge1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5NYXA6XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LlNlbGVjdGlvbjpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2hvd0luZm8odHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuU2hvcDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2hvd0luZm8oZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGVudGl0eURpZE1vdmUoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICBsZXQgb3B0aW9ucyA9IHRoaXMubWFwLmdldEVudGl0eU9wdGlvbnMoZW50aXR5LCB0cnVlKTtcclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPCAxKSB7IHJldHVybjsgfVxyXG4gICAgICAgIHRoaXMuc2hvd09wdGlvbk1lbnUob3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgZW50aXR5RGlkQW5pbWF0aW9uKGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5LnVwZGF0ZVN0YXRlKEVudGl0eVN0YXRlLk1vdmVkLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0RW50aXR5KGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IG9wdGlvbnMgPSB0aGlzLm1hcC5nZXRFbnRpdHlPcHRpb25zKGVudGl0eSwgZmFsc2UpO1xyXG5cclxuICAgICAgICAvLyBubyBvcHRpb25zIG1lYW46IG5vdCBpbiBhbGxpYW5jZSBvciBhbHJlYWR5IG1vdmVkXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzbyBtZXRob2QgY2FuIGJlIHVzZWQgdG8gc2hvdyBvcHRpb25zIGZvciBlbnRpdHkgYWdhaW4gLT4gbXVzdCBiZSBzYW1lIGVudGl0eSBhcyBzZWxlY3RlZFxyXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZF9lbnRpdHkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkgPSBlbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNlbGVjdGVkX2VudGl0eSAhPSBlbnRpdHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dPcHRpb25NZW51KG9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKG9wdGlvbnNbMF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGRlc2VsZWN0RW50aXR5KGNoYW5nZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmRlc2VsZWN0RW50aXR5KGNoYW5nZWQpO1xyXG4gICAgICAgIHRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNob3dPcHRpb25NZW51KG9wdGlvbnM6IEFjdGlvbltdKSB7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbmV3IE1lbnVPcHRpb25zKHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5ncm91cCwgRGlyZWN0aW9uLlJpZ2h0LCBvcHRpb25zLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5vcHRpb25zX21lbnUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51LnNob3codHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0Lk9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd01haW5NZW51KGFjdGlvbnM6IEFjdGlvbltdKSB7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbmV3IE1lbnVPcHRpb25zKHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5ncm91cCwgRGlyZWN0aW9uLk5vbmUsIGFjdGlvbnMsIHRoaXMsIERpcmVjdGlvbi5VcCk7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMub3B0aW9uc19tZW51KTtcclxuICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5zaG93KHRydWUpO1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5PcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdE9wdGlvbihvcHRpb246IEFjdGlvbikge1xyXG4gICAgICAgIHN3aXRjaCAob3B0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk9DQ1VQWTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUub2NjdXB5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LnBvc2l0aW9uLCB0aGlzLnNlbGVjdGVkX2VudGl0eS5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eS51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5Nb3ZlZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkFUVEFDSzpcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5TZWxlY3Rpb24pO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5BdHRhY2ssIHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IHRoaXMubWFwLm5leHRUYXJnZXRJblJhbmdlKERpcmVjdGlvbi5Ob25lKS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uUkFJU0U6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucHVzaChJbnB1dENvbnRleHQuU2VsZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5SYWlzZSwgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLk5vbmUpLnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5NT1ZFOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLk1vdmUsIHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5CVVk6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5TaG9wKHRoaXMuc2VsZWN0ZWRfZW50aXR5LmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FTkRfTU9WRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5LnVwZGF0ZVN0YXRlKEVudGl0eVN0YXRlLk1vdmVkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRU5EX1RVUk46XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLm5leHRUdXJuKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uTUFJTl9NRU5VOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93TWFpbk1lbnUoTWVudU9wdGlvbnMuZ2V0TWFpbk1lbnVPcHRpb25zKHRydWUpKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5NQVA6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9wZW5NYXAoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5TQVZFX0dBTUU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnNhdmVHYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uTE9BRF9HQU1FOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5sb2FkR2FtZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkVYSVQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmV4aXRHYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQUJPVVQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucHVzaChJbnB1dENvbnRleHQuQWNrKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbl9ncm91cCA9IE1haW5NZW51LnNob3dBYm91dCh0aGlzLmRlbGVnYXRlLmdhbWUpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLklOU1RSVUNUSU9OUzpcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5JbnN0cnVjdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwID0gdGhpcy5kZWxlZ2F0ZS5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zdHJ1Y3Rpb25fbnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmZ1bGxzY3JlZW5fZ3JvdXApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkNBTkNFTDpcclxuICAgICAgICAgICAgICAgIGlmICghIXRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBsYXN0IGFjdGlvbiB3YXMgd2Fsa2luZy4gcmVzZXQgZW50aXR5ICYgc2V0IGN1cnNvciB0byBjdXJyZW50IHBvc2l0aW9uXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb247XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUubW92ZUVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24gPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuTW92ZSwgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWN0aW9uIFwiICsgTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbikgKyBcIiBub3QgeWV0IGltcGxlbWVudGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGlja0VudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG5cclxuICAgICAgICB0aGlzLmNvbnRleHQucHVzaChJbnB1dENvbnRleHQuQW5pbWF0aW9uKTtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMubWFwLmdldFR5cGVPZlJhbmdlKCkpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hdHRhY2tFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuUmFpc2U6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnJhaXNlRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuaGlkZVJhbmdlKCk7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3Iuc2hvdygpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcGlja1Bvc2l0aW9uKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZF9lbnRpdHkpIHtcclxuICAgICAgICAgICAgc3dpdGNoICh0aGlzLm1hcC5nZXRUeXBlT2ZSYW5nZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5Nb3ZlOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdF9lbnRpdHlfcG9zaXRpb24gPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5tb3ZlRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCBwb3NpdGlvbiwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMubWFwLmdldEVudGl0eUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoISFlbnRpdHkpIHtcclxuICAgICAgICAgICAgLy8gbm8gZW50aXR5IHNlbGVjdGVkLCBjbGlja2VkIG9uIGVudGl0eSAtIHRyeSB0byBzZWxlY3QgaXRcclxuICAgICAgICAgICAgbGV0IHN1Y2Nlc3MgPSB0aGlzLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAoc3VjY2VzcykgeyByZXR1cm47IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG93T3B0aW9uTWVudShNZW51T3B0aW9ucy5nZXRPZmZNZW51T3B0aW9ucygpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIG9wZW5TaG9wKGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5TaG9wKTtcclxuICAgICAgICBpZiAoIXRoaXMuc2hvcF91bml0cykge1xyXG4gICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMgPSBuZXcgTWVudVNob3BVbml0cyh0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuZ3JvdXAsIHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5zaG9wX3VuaXRzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIHRoaXMuZGVsZWdhdGUuZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlKSk7XHJcbiAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnNob3codHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvID0gbmV3IE1lbnVTaG9wSW5mbyh0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuZ3JvdXAsIGFsbGlhbmNlKTtcclxuICAgICAgICB0aGlzLnNob3BfaW5mby51cGRhdGVDb250ZW50KEVudGl0eVR5cGUuU29sZGllcik7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMuc2hvcF9pbmZvKTtcclxuICAgICAgICB0aGlzLnNob3BfaW5mby5zaG93KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xvc2VTaG9wKCkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICB0aGlzLnNob3BfdW5pdHMuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLnNob3BfdW5pdHMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvLmhpZGUodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5zaG9wX2luZm8gPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb3Blbk1hcCgpIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQucHVzaChJbnB1dENvbnRleHQuQWNrKTtcclxuICAgICAgICB0aGlzLm1pbmlfbWFwID0gbmV3IE1pbmlNYXAodGhpcy5tYXAsIHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5ncm91cCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMubWluaV9tYXApO1xyXG4gICAgICAgIHRoaXMubWluaV9tYXAuc2hvdyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNsb3NlTWFwKCkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICB0aGlzLm1pbmlfbWFwLmhpZGUodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5taW5pX21hcCA9IG51bGw7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBFbnRpdHlBbmltYXRpb25UeXBlIHtcclxuICAgIEF0dGFjayxcclxuICAgIFN0YXR1cyxcclxuICAgIFJhaXNlXHJcbn1cclxuaW50ZXJmYWNlIEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlIHtcclxuICAgIGFuaW1hdGlvbkRpZEVuZChhbmltYXRpb246IEVudGl0eUFuaW1hdGlvbik6IHZvaWQ7XHJcbn1cclxuY2xhc3MgRW50aXR5QW5pbWF0aW9uIHtcclxuXHJcbiAgICB0eXBlOiBFbnRpdHlBbmltYXRpb25UeXBlO1xyXG4gICAgZW50aXR5OiBFbnRpdHk7XHJcblxyXG4gICAgcHJvdGVjdGVkIGRlbGVnYXRlOiBFbnRpdHlBbmltYXRpb25EZWxlZ2F0ZTtcclxuXHJcbiAgICBwcml2YXRlIHByb2dyZXNzOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGN1cnJlbnRfc3RlcDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBzdGVwczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIGFjYzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHN0ZXBzOiBudW1iZXJbXSwgZW50aXR5OiBFbnRpdHksIGRlbGVnYXRlOiBFbnRpdHlBbmltYXRpb25EZWxlZ2F0ZSkge1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgIHRoaXMuY3VycmVudF9zdGVwID0gLTE7XHJcbiAgICAgICAgdGhpcy5zdGVwcyA9IHN0ZXBzO1xyXG4gICAgICAgIHRoaXMuYWNjID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG4gICAgICAgIHRoaXMuZW50aXR5ID0gZW50aXR5O1xyXG4gICAgfVxyXG4gICAgc3RlcChpbml0OiBib29sZWFuLCBzdGVwOiBudW1iZXIsIHByb2dyZXNzOiBudW1iZXIpIHtcclxuICAgICAgICAvLyByZXR1cm4gdHJ1ZSBpZiB3ZSBzaG91bGQgY29udGludWUsIGZhbHNlIGlmIHdlIHNob3VsZCBzdG9wIGV4ZWN1dGlvblxyXG4gICAgfVxyXG4gICAgcnVuKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hY2MgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYWNjIDwgNSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWNjIC09IDU7XHJcblxyXG4gICAgICAgIGxldCBzdGVwID0gMDtcclxuICAgICAgICB3aGlsZSAoc3RlcCA8IHRoaXMuc3RlcHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnByb2dyZXNzIDwgdGhpcy5zdGVwc1tzdGVwXSkge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc3RlcCsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaW5pdCA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChzdGVwID4gdGhpcy5jdXJyZW50X3N0ZXApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50X3N0ZXAgPSBzdGVwO1xyXG4gICAgICAgICAgICBpbml0ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHByb2dyZXNzID0gdGhpcy5jdXJyZW50X3N0ZXAgPiAwID8gdGhpcy5wcm9ncmVzcyAtIHRoaXMuc3RlcHNbKHRoaXMuY3VycmVudF9zdGVwIC0gMSldIDogdGhpcy5wcm9ncmVzcztcclxuICAgICAgICB0aGlzLnByb2dyZXNzKys7XHJcbiAgICAgICAgdGhpcy5zdGVwKGluaXQsIHRoaXMuY3VycmVudF9zdGVwLCBwcm9ncmVzcyk7XHJcbiAgICB9XHJcbn1cclxuY2xhc3MgQXR0YWNrQW5pbWF0aW9uIGV4dGVuZHMgRW50aXR5QW5pbWF0aW9uIHtcclxuXHJcbiAgICBmaXJzdDogYm9vbGVhbjtcclxuICAgIGF0dGFja2VyOiBFbnRpdHk7XHJcblxyXG4gICAgcHJpdmF0ZSBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBpbWFnZTogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudGl0eTogRW50aXR5LCBkZWxlZ2F0ZTogRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIGF0dGFja2VyOiBFbnRpdHksIGZpcnN0OiBib29sZWFuKSB7XHJcbiAgICAgICAgc3VwZXIoWzYsIDhdLCBlbnRpdHksIGRlbGVnYXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5QW5pbWF0aW9uVHlwZS5BdHRhY2s7XHJcblxyXG4gICAgICAgIHRoaXMuZmlyc3QgPSBmaXJzdDtcclxuICAgICAgICB0aGlzLmF0dGFja2VyID0gYXR0YWNrZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuICAgIH1cclxuICAgIHN0ZXAoaW5pdDogYm9vbGVhbiwgc3RlcDogbnVtYmVyLCBwcm9ncmVzczogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG1pZGRsZSA9IHRoaXMuZW50aXR5LnBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgc3dpdGNoIChzdGVwKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UobWlkZGxlLngsIG1pZGRsZS55LCBcInJlZHNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZS5mcmFtZSA9IHByb2dyZXNzICUgMztcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnNldFdvcmxkUG9zaXRpb24oe3g6IG1pZGRsZS54ICsgMiAtIHByb2dyZXNzICUgMiAqIDQsIHk6IG1pZGRsZS55fSk7IC8vIDAgLSAycHggcmlnaHQsIDEgLSAycHggbGVmdCwgMiAtIDJweCByaWdodFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eS5zZXRXb3JsZFBvc2l0aW9uKHt4OiBtaWRkbGUueCArIDIgLSBwcm9ncmVzcyAlIDIgKiA0LCB5OiBtaWRkbGUueX0pOyAvLyA3IC0gMnB4IGxlZnQsIDggLSAycHggcmlnaHRcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eS5zZXRXb3JsZFBvc2l0aW9uKHRoaXMuZW50aXR5LnBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuYW5pbWF0aW9uRGlkRW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5jbGFzcyBTdGF0dXNBbmltYXRpb24gZXh0ZW5kcyBFbnRpdHlBbmltYXRpb24ge1xyXG4gICAgc3RhdHVzOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBpbWFnZTogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBpbWFnZTI6IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdHk6IEVudGl0eSwgZGVsZWdhdGU6IEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlLCBncm91cDogUGhhc2VyLkdyb3VwLCBzdGF0dXM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHN0YXR1cyA9PSAxID8gWzAsIDYsIDE0XSA6IFsxMCwgMTYsIDI0XSwgZW50aXR5LCBkZWxlZ2F0ZSk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5QW5pbWF0aW9uVHlwZS5TdGF0dXM7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuICAgIH1cclxuICAgIHN0ZXAoaW5pdDogYm9vbGVhbiwgc3RlcDogbnVtYmVyLCBwcm9ncmVzczogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IG1pZGRsZSA9IHRoaXMuZW50aXR5LnBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKTtcclxuICAgICAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgLy8gd2FpdFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDAgfHwgdGhpcy5zdGF0dXMgPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlMiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UobWlkZGxlLnggKyA0LCBtaWRkbGUueSArIDQsIFwic3RhdHVzXCIsIHRoaXMuc3RhdHVzLCB0aGlzLmdyb3VwKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UobWlkZGxlLngsIG1pZGRsZS55LCBcInNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZS5mcmFtZSA9IHByb2dyZXNzO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmxvYWRUZXh0dXJlKFwic21va2VcIiwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlcGxhY2Ugd2l0aCB0b21iIGdyYXBoaWNcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuRGVhZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UueSA9IG1pZGRsZS55IC0gcHJvZ3Jlc3MgKiAzOyAvLyAwLCAzLCA2XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZS5mcmFtZSA9IE1hdGguZmxvb3IocHJvZ3Jlc3MgLyAyKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1lbHNlIGlmICh0aGlzLnN0YXR1cyA9PSAwIHx8IHRoaXMuc3RhdHVzID09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlMi5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmFuaW1hdGlvbkRpZEVuZCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuYW5pbWF0aW9uRGlkRW5kKHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5jbGFzcyBSYWlzZUFuaW1hdGlvbiBleHRlbmRzIEVudGl0eUFuaW1hdGlvbiB7XHJcbiAgICBuZXdfYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG5cclxuICAgIHByaXZhdGUgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgaW1hZ2VzOiBQaGFzZXIuSW1hZ2VbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihlbnRpdHk6IEVudGl0eSwgZGVsZWdhdGU6IEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlLCBncm91cDogUGhhc2VyLkdyb3VwLCBuZXdfYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgc3VwZXIoWzgsIDE4XSwgZW50aXR5LCBkZWxlZ2F0ZSk7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5QW5pbWF0aW9uVHlwZS5SYWlzZTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubmV3X2FsbGlhbmNlID0gbmV3X2FsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMuaW1hZ2VzID0gW107XHJcblxyXG4gICAgfVxyXG4gICAgc3RlcChpbml0OiBib29sZWFuLCBzdGVwOiBudW1iZXIsIHByb2dyZXNzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbWlkZGxlID0gdGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzLnB1c2godGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCAtIDgsIG1pZGRsZS55IC0gOCwgXCJzcGFya1wiLCAwLCB0aGlzLmdyb3VwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZXMucHVzaCh0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKG1pZGRsZS54ICsgOCwgbWlkZGxlLnkgLSA4LCBcInNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlcy5wdXNoKHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UobWlkZGxlLnggLSA4LCBtaWRkbGUueSArIDgsIFwic3BhcmtcIiwgMCwgdGhpcy5ncm91cCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzLnB1c2godGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCArIDgsIG1pZGRsZS55ICsgOCwgXCJzcGFya1wiLCAwLCB0aGlzLmdyb3VwKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgZCA9IDggLSBwcm9ncmVzcztcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS5mcmFtZSA9IHByb2dyZXNzICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLnggPSBtaWRkbGUueCAtIGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS55ID0gbWlkZGxlLnkgLSBkO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLmZyYW1lID0gcHJvZ3Jlc3MgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ueCA9IG1pZGRsZS54ICsgZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnkgPSBtaWRkbGUueSAtIGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMl0uZnJhbWUgPSBwcm9ncmVzcyAlIDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS54ID0gbWlkZGxlLnggLSBkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMl0ueSA9IG1pZGRsZS55ICsgZDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS5mcmFtZSA9IHByb2dyZXNzICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLnggPSBtaWRkbGUueCArIGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS55ID0gbWlkZGxlLnkgKyBkO1xyXG5cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnJhaXNlKHRoaXMubmV3X2FsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBkMiA9IC1wcm9ncmVzcztcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS5mcmFtZSA9IChwcm9ncmVzcyArIDIpICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLnggPSBtaWRkbGUueCAtIGQyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ueSA9IG1pZGRsZS55IC0gZDI7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0uZnJhbWUgPSAocHJvZ3Jlc3MgKyAyKSAlIDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS54ID0gbWlkZGxlLnggKyBkMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnkgPSBtaWRkbGUueSAtIGQyO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzJdLmZyYW1lID0gKHByb2dyZXNzICsgMikgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMl0ueCA9IG1pZGRsZS54IC0gZDI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS55ID0gbWlkZGxlLnkgKyBkMjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS5mcmFtZSA9IChwcm9ncmVzcyArIDIpICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLnggPSBtaWRkbGUueCArIGQyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbM10ueSA9IG1pZGRsZS55ICsgZDI7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMl0uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbM10uZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hbmltYXRpb25EaWRFbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhbmltYXRpb24udHNcIiAvPlxyXG5cclxuaW50ZXJmYWNlIEVudGl0eURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgbW92OiBudW1iZXI7XHJcbiAgICBhdGs6IG51bWJlcjtcclxuICAgIGRlZjogbnVtYmVyO1xyXG4gICAgbWF4OiBudW1iZXI7XHJcbiAgICBtaW46IG51bWJlcjtcclxuICAgIGNvc3Q6IG51bWJlcjtcclxuICAgIGJhdHRsZV9wb3NpdGlvbnM6IElQb3NbXTtcclxuICAgIGZsYWdzOiBFbnRpdHlGbGFncztcclxufVxyXG5lbnVtIEVudGl0eUZsYWdzIHtcclxuICAgIE5vbmUgPSAwLCAvLyBHb2xlbSwgU2tlbGV0b25cclxuICAgIENhbkZseSA9IDEsXHJcbiAgICBXYXRlckJvb3N0ID0gMixcclxuICAgIENhbkJ1eSA9IDQsXHJcbiAgICBDYW5PY2N1cHlIb3VzZSA9IDgsXHJcbiAgICBDYW5PY2N1cHlDYXN0bGUgPSAxNixcclxuICAgIENhblJhaXNlID0gMzIsXHJcbiAgICBBbnRpRmx5aW5nID0gNjQsXHJcbiAgICBDYW5Qb2lzb24gPSAxMjgsXHJcbiAgICBDYW5XaXNwID0gMjU2LFxyXG4gICAgQ2FudEF0dGFja0FmdGVyTW92aW5nID0gNTEyXHJcbn1cclxuXHJcbmludGVyZmFjZSBJRW50aXR5IHtcclxuICAgIHR5cGU6IEVudGl0eVR5cGU7XHJcbiAgICBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbiAgICB4PzogbnVtYmVyO1xyXG4gICAgeT86IG51bWJlcjtcclxuICAgIHJhbms/OiBudW1iZXI7XHJcbiAgICBlcD86IG51bWJlcjtcclxuICAgIHN0YXRlPzogRW50aXR5U3RhdGU7XHJcbiAgICBzdGF0dXM/OiBFbnRpdHlTdGF0dXM7XHJcbiAgICBoZWFsdGg/OiBudW1iZXI7XHJcbiAgICBkZWF0aF9jb3VudD86IG51bWJlcjtcclxufVxyXG5lbnVtIEVudGl0eVR5cGUge1xyXG4gICAgU29sZGllcixcclxuICAgIEFyY2hlcixcclxuICAgIExpemFyZCxcclxuICAgIFdpemFyZCxcclxuICAgIFdpc3AsXHJcbiAgICBTcGlkZXIsXHJcbiAgICBHb2xlbSxcclxuICAgIENhdGFwdWx0LFxyXG4gICAgV3l2ZXJuLFxyXG4gICAgS2luZyxcclxuICAgIFNrZWxldG9uXHJcbn1cclxuZW51bSBFbnRpdHlTdGF0dXMge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBQb2lzb25lZCA9IDEgPDwgMCxcclxuICAgIFdpc3BlZCA9IDEgPDwgMVxyXG59XHJcbmVudW0gRW50aXR5U3RhdGUge1xyXG4gICAgUmVhZHkgPSAwLFxyXG4gICAgTW92ZWQgPSAxLFxyXG4gICAgRGVhZCA9IDJcclxufVxyXG5cclxuaW50ZXJmYWNlIEVudGl0eVBhdGgge1xyXG4gICAgZGVsZWdhdGU6IEVudGl0eU1hbmFnZXJEZWxlZ2F0ZTtcclxuICAgIGxpbmU6IExpbmVQYXJ0W107XHJcbiAgICB0YXJnZXQ6IFBvcztcclxuICAgIHByb2dyZXNzOiBudW1iZXI7XHJcbn1cclxuXHJcbmNsYXNzIEVudGl0eSBleHRlbmRzIFNwcml0ZSB7XHJcblxyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBkYXRhOiBFbnRpdHlEYXRhO1xyXG5cclxuICAgIGljb25faGVhbHRoOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgaGVhbHRoOiBudW1iZXI7XHJcbiAgICByYW5rOiBudW1iZXI7XHJcbiAgICBlcDogbnVtYmVyO1xyXG5cclxuICAgIGRlYXRoX2NvdW50OiBudW1iZXI7XHJcblxyXG4gICAgc3RhdHVzOiBFbnRpdHlTdGF0dXM7XHJcbiAgICBzdGF0ZTogRW50aXR5U3RhdGU7XHJcblxyXG4gICAgYXRrX2Jvb3N0OiBudW1iZXIgPSAwO1xyXG4gICAgZGVmX2Jvb3N0OiBudW1iZXIgPSAwO1xyXG4gICAgbW92X2Jvb3N0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHBhdGg6IEVudGl0eVBhdGg7XHJcbiAgICBhbmltYXRpb246IEVudGl0eUFuaW1hdGlvbjtcclxuXHJcbiAgICBzdGF0dXNfYW5pbWF0aW9uOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGljb25fbW92ZWQ6IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBFbnRpdHlUeXBlLCBhbGxpYW5jZTogQWxsaWFuY2UsIHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmRhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1t0eXBlXTtcclxuICAgICAgICB0aGlzLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XHJcblxyXG4gICAgICAgIHRoaXMuZGVhdGhfY291bnQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmhlYWx0aCA9IDEwO1xyXG4gICAgICAgIHRoaXMucmFuayA9IDA7XHJcbiAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAwO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXNfYW5pbWF0aW9uID0gLTE7XHJcbiAgICB9XHJcbiAgICBpbml0KGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICAgc3VwZXIuaW5pdCh0aGlzLnBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSwgZ3JvdXAsIFwidW5pdF9pY29uc19cIiArICg8bnVtYmVyPiB0aGlzLmFsbGlhbmNlKSwgW3RoaXMudHlwZSwgdGhpcy50eXBlICsgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMubGVuZ3RoXSk7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZCA9IGdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDAsIFwiY2hhcnNcIiwgNCwgZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGggPSBncm91cC5nYW1lLmFkZC5pbWFnZSgwLCAwLCBcImNoYXJzXCIsIDAsIGdyb3VwKTtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIGlzRGVhZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5oZWFsdGggPT0gMDtcclxuICAgIH1cclxuICAgIGhhc0ZsYWcoZmxhZzogRW50aXR5RmxhZ3MpIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuZGF0YS5mbGFncyAmIGZsYWcpICE9IDA7XHJcbiAgICB9XHJcbiAgICBnZXREaXN0YW5jZVRvRW50aXR5KGVudGl0eTogRW50aXR5KTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5wb3NpdGlvbi5kaXN0YW5jZVRvKGVudGl0eS5wb3NpdGlvbik7XHJcbiAgICB9XHJcbiAgICBzaG91bGRSYW5rVXAoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMucmFuayA8IDMgJiYgdGhpcy5lcCA+PSA3NSA8PCB0aGlzLnJhbmspIHtcclxuICAgICAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucmFuaysrO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgYXR0YWNrKHRhcmdldDogRW50aXR5LCBtYXA6IE1hcCkge1xyXG5cclxuICAgICAgICBsZXQgbjogbnVtYmVyO1xyXG5cclxuICAgICAgICAvLyBnZXQgYmFzZSBkYW1hZ2VcclxuICAgICAgICBsZXQgYXRrID0gdGhpcy5kYXRhLmF0ayArIHRoaXMuYXRrX2Jvb3N0O1xyXG5cclxuICAgICAgICBpZiAodGhpcy50eXBlID09IEVudGl0eVR5cGUuQXJjaGVyICYmIHRhcmdldC50eXBlID09IEVudGl0eVR5cGUuV3l2ZXJuKSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFbnRpdHlUeXBlLldpc3AgJiYgdGFyZ2V0LnR5cGUgPT0gRW50aXR5VHlwZS5Ta2VsZXRvbikge1xyXG4gICAgICAgICAgICBhdGsgKz0gMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG4gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzOSkgLSAxOSArIHRoaXMucmFuazsgLy8gLTE5IC0gMTkgcmFuZG9tXHJcblxyXG4gICAgICAgIGlmIChuID49IDE5KSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuID49IDE3KSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAxO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xOSkge1xyXG4gICAgICAgICAgICBhdGsgLT0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTcpIHtcclxuICAgICAgICAgICAgYXRrIC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZGVmID0gdGFyZ2V0LmRhdGEuZGVmICsgdGFyZ2V0LmRlZl9ib29zdDtcclxuXHJcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM5KSAtIDE5ICsgdGFyZ2V0LnJhbms7IC8vIC0xOSAtIDE5IHJhbmRvbVxyXG5cclxuICAgICAgICBpZiAobiA+PSAxOSkge1xyXG4gICAgICAgICAgICBkZWYgKz0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA+PSAxNykge1xyXG4gICAgICAgICAgICBkZWYgKz0gMTtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTkpIHtcclxuICAgICAgICAgICAgZGVmIC09IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE3KSB7XHJcbiAgICAgICAgICAgIGRlZiAtPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlZF9oZWFsdGggPSBNYXRoLmZsb29yKChhdGsgLSAoZGVmICsgbWFwLmdldERlZkF0KHRhcmdldC5wb3NpdGlvbiwgdGFyZ2V0LnR5cGUpKSAqICgyIC8gMykpICogdGhpcy5oZWFsdGggLyAxMCk7XHJcbiAgICAgICAgaWYgKHJlZF9oZWFsdGggPiB0YXJnZXQuaGVhbHRoKSB7XHJcbiAgICAgICAgICAgIHJlZF9oZWFsdGggPSB0YXJnZXQuaGVhbHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGFyZ2V0LnNldEhlYWx0aCh0YXJnZXQuaGVhbHRoIC0gcmVkX2hlYWx0aCk7XHJcbiAgICAgICAgdGhpcy5lcCArPSAodGFyZ2V0LmRhdGEuYXRrICsgdGFyZ2V0LmRhdGEuZGVmKSAqIHJlZF9oZWFsdGg7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVTdGF0dXMoKSB7XHJcbiAgICAgICAgdGhpcy5hdGtfYm9vc3QgPSAwO1xyXG4gICAgICAgIHRoaXMuZGVmX2Jvb3N0ID0gMDtcclxuICAgICAgICB0aGlzLm1vdl9ib29zdCA9IDA7XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzICYgRW50aXR5U3RhdHVzLlBvaXNvbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXRrX2Jvb3N0LS07XHJcbiAgICAgICAgICAgIHRoaXMuZGVmX2Jvb3N0LS07XHJcbiAgICAgICAgICAgIHRoaXMubW92X2Jvb3N0LS07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyAmIEVudGl0eVN0YXR1cy5XaXNwZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hdGtfYm9vc3QrKztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXRTdGF0dXMoc3RhdHVzOiBFbnRpdHlTdGF0dXMpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyB8PSBzdGF0dXM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0dXMoKTtcclxuICAgIH1cclxuICAgIGNsZWFyU3RhdHVzKHN0YXR1czogRW50aXR5U3RhdHVzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgJj0gfnN0YXR1cztcclxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXR1cygpO1xyXG4gICAgfVxyXG4gICAgZ2V0UG93ZXJFc3RpbWF0ZShwb3NpdGlvbjogUG9zLCBtYXA6IE1hcCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoKHRoaXMucmFuayArIHRoaXMuZGF0YS5hdGsgKyB0aGlzLmRhdGEuZGVmICsgbWFwLmdldERlZkF0KHBvc2l0aW9uLCB0aGlzLnR5cGUpKSAqIHRoaXMuaGVhbHRoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVTdGF0ZShzdGF0ZTogRW50aXR5U3RhdGUsIHNob3c6IGJvb2xlYW4pIHtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG5cclxuICAgICAgICBpZiAoc3RhdGUgPT0gRW50aXR5U3RhdGUuRGVhZCkge1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5sb2FkVGV4dHVyZShcInRvbWJzdG9uZVwiLCAwKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRGcmFtZXMoWzBdKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5sb2FkVGV4dHVyZShcInVuaXRfaWNvbnNfXCIgKyAoPG51bWJlcj4gdGhpcy5hbGxpYW5jZSksICg8bnVtYmVyPiB0aGlzLnR5cGUpKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRGcmFtZXMoW3RoaXMudHlwZSwgdGhpcy50eXBlICsgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMubGVuZ3RoXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2hvd19pY29uID0gKHNob3cgJiYgc3RhdGUgPT0gRW50aXR5U3RhdGUuTW92ZWQpO1xyXG5cclxuICAgICAgICB0aGlzLmljb25fbW92ZWQueCA9IHRoaXMuc3ByaXRlLnggKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC55ID0gdGhpcy5zcHJpdGUueSArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDc7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnZpc2libGUgPSBzaG93X2ljb247XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLmJyaW5nVG9Ub3AoKTtcclxuICAgIH1cclxuICAgIHN0YXJ0QW5pbWF0aW9uKGFuaW1hdGlvbjogRW50aXR5QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBhbmltYXRpb247XHJcbiAgICB9XHJcbiAgICBtb3ZlKHRhcmdldDogUG9zLCBsaW5lOiBMaW5lUGFydFtdLCBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlKSB7XHJcbiAgICAgICAgdGhpcy5wYXRoID0ge1xyXG4gICAgICAgICAgICBwcm9ncmVzczogMCxcclxuICAgICAgICAgICAgbGluZTogbGluZSxcclxuICAgICAgICAgICAgZGVsZWdhdGU6IGRlbGVnYXRlLFxyXG4gICAgICAgICAgICB0YXJnZXQ6IHRhcmdldFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICBpZiAoISF0aGlzLnBhdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXRoLnByb2dyZXNzICs9IHN0ZXBzO1xyXG5cclxuICAgICAgICAgICAgLy8gZmlyc3QgY2hlY2sgaXMgc28gd2UgY2FuIHN0YXkgYXQgdGhlIHNhbWUgcGxhY2VcclxuICAgICAgICAgICAgaWYgKHRoaXMucGF0aC5saW5lLmxlbmd0aCA+IDAgJiYgdGhpcy5wYXRoLnByb2dyZXNzID49IHRoaXMucGF0aC5saW5lWzBdLmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXRoLnByb2dyZXNzIC09IHRoaXMucGF0aC5saW5lWzBdLmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICAgICAgICAgIHRoaXMucGF0aC5saW5lLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMucGF0aC5saW5lLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxldCBkaWZmID0gbmV3IFBvcygwLCAwKS5tb3ZlKHRoaXMucGF0aC5saW5lWzBdLmRpcmVjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkX3Bvc2l0aW9uLnggPSB0aGlzLnBhdGgubGluZVswXS5wb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi54ICogdGhpcy5wYXRoLnByb2dyZXNzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZF9wb3NpdGlvbi55ID0gdGhpcy5wYXRoLmxpbmVbMF0ucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSArIGRpZmYueSAqIHRoaXMucGF0aC5wcm9ncmVzcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb24gPSB0aGlzLnBhdGgudGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZF9wb3NpdGlvbiA9IHRoaXMucGF0aC50YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGRlbGVnYXRlID0gdGhpcy5wYXRoLmRlbGVnYXRlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXRoID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGRlbGVnYXRlLmVudGl0eURpZE1vdmUodGhpcyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoISF0aGlzLmFuaW1hdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbi5ydW4oc3RlcHMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pY29uX2hlYWx0aC54ID0gdGhpcy5zcHJpdGUueDtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnkgPSB0aGlzLnNwcml0ZS55ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNztcclxuICAgIH1cclxuICAgIHNldEhlYWx0aChoZWFsdGg6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gaGVhbHRoO1xyXG4gICAgICAgIGlmIChoZWFsdGggPiA5IHx8IGhlYWx0aCA8IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5pY29uX2hlYWx0aC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pY29uX2hlYWx0aC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLmZyYW1lID0gMjcgKyAoaGVhbHRoIC0gMSk7XHJcbiAgICAgICAgdGhpcy5pY29uX2hlYWx0aC54ID0gdGhpcy5zcHJpdGUueDtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnkgPSB0aGlzLnNwcml0ZS55ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNztcclxuICAgIH1cclxuICAgIHJhaXNlKGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVR5cGUuU2tlbGV0b247XHJcbiAgICAgICAgdGhpcy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMucmFuayA9IDA7XHJcbiAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgdGhpcy5kZWF0aF9jb3VudCA9IDA7XHJcbiAgICAgICAgdGhpcy5zZXRIZWFsdGgoMTApO1xyXG4gICAgICAgIHRoaXMuY2xlYXJTdGF0dXMoRW50aXR5U3RhdHVzLlBvaXNvbmVkKTtcclxuICAgICAgICB0aGlzLmNsZWFyU3RhdHVzKEVudGl0eVN0YXR1cy5XaXNwZWQpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1vdmVtZW50KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5tb3YgKyB0aGlzLm1vdl9ib29zdDtcclxuICAgIH1cclxuICAgIHNob3VsZENvdW50ZXIodGFyZ2V0OiBQb3MpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuaGVhbHRoID4gMCAmJiB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlVG8odGFyZ2V0KSA8IDIgJiYgdGhpcy5kYXRhLm1pbiA8IDIpO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5pY29uX2hlYWx0aC5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLmRlc3Ryb3koKTtcclxuICAgICAgICBzdXBlci5kZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhwb3J0KCk6IElFbnRpdHkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHR5cGU6IHRoaXMudHlwZSxcclxuICAgICAgICAgICAgYWxsaWFuY2U6IHRoaXMuYWxsaWFuY2UsXHJcbiAgICAgICAgICAgIHg6IHRoaXMucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgeTogdGhpcy5wb3NpdGlvbi55LFxyXG4gICAgICAgICAgICByYW5rIDogdGhpcy5yYW5rLFxyXG4gICAgICAgICAgICBlcDogdGhpcy5lcCxcclxuICAgICAgICAgICAgc3RhdGU6IHRoaXMuc3RhdGUsXHJcbiAgICAgICAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXHJcbiAgICAgICAgICAgIGhlYWx0aDogdGhpcy5oZWFsdGgsXHJcbiAgICAgICAgICAgIGRlYXRoX2NvdW50OiB0aGlzLmRlYXRoX2NvdW50XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVdheXBvaW50IHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb3N0OiBudW1iZXI7XHJcbiAgICBmb3JtOiBudW1iZXI7XHJcbiAgICBwYXJlbnQ6IElXYXlwb2ludDtcclxufVxyXG5pbnRlcmZhY2UgTGluZVBhcnQge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgbGVuZ3RoOiBudW1iZXI7XHJcbn1cclxuZW51bSBFbnRpdHlSYW5nZVR5cGUge1xyXG4gICAgTm9uZSxcclxuICAgIE1vdmUsXHJcbiAgICBBdHRhY2ssXHJcbiAgICBSYWlzZVxyXG59XHJcbmNsYXNzIEVudGl0eVJhbmdlIHtcclxuXHJcbiAgICB3YXlwb2ludHM6IElXYXlwb2ludFtdO1xyXG4gICAgbWFwOiBNYXA7XHJcblxyXG4gICAgdHlwZTogRW50aXR5UmFuZ2VUeXBlO1xyXG5cclxuICAgIHJhbmdlX2xpZ2h0ZW46IGJvb2xlYW47XHJcbiAgICByYW5nZV9wcm9ncmVzczogbnVtYmVyO1xyXG5cclxuICAgIGxpbmU6IExpbmVQYXJ0W107XHJcbiAgICBsaW5lX29mZnNldDogbnVtYmVyO1xyXG4gICAgbGluZV9lbmRfcG9zaXRpb246IFBvcztcclxuICAgIGxpbmVfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZXh0cmFfY3Vyc29yOiBTcHJpdGU7XHJcblxyXG4gICAgcHJpdmF0ZSB0YXJnZXRzX3g6IEVudGl0eVtdO1xyXG4gICAgcHJpdmF0ZSB0YXJnZXRzX3k6IEVudGl0eVtdO1xyXG5cclxuICAgIHByaXZhdGUgdGFyZ2V0OiBFbnRpdHk7XHJcblxyXG5cclxuICAgIHN0YXRpYyBmaW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb246IFBvcywgd2F5cG9pbnRzOiBJV2F5cG9pbnRbXSkge1xyXG4gICAgICAgIGZvciAobGV0IHdheXBvaW50IG9mIHdheXBvaW50cyl7XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHsgcmV0dXJuIHdheXBvaW50OyB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldExpbmVUb1dheXBvaW50KHdheXBvaW50OiBJV2F5cG9pbnQpOiBMaW5lUGFydFtdIHtcclxuICAgICAgICBsZXQgbGluZTogTGluZVBhcnRbXSA9IFtdO1xyXG4gICAgICAgIHdoaWxlICh3YXlwb2ludC5wYXJlbnQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICBsZXQgbmV4dCA9IHdheXBvaW50O1xyXG4gICAgICAgICAgICB3YXlwb2ludCA9IHdheXBvaW50LnBhcmVudDtcclxuXHJcbiAgICAgICAgICAgIGxldCBkaXJlY3Rpb24gPSB3YXlwb2ludC5wb3NpdGlvbi5nZXREaXJlY3Rpb25UbyhuZXh0LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKGxpbmUubGVuZ3RoID4gMCAmJiBsaW5lWzBdLmRpcmVjdGlvbiA9PSBkaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGxpbmVbMF0ucG9zaXRpb24gPSB3YXlwb2ludC5wb3NpdGlvbjtcclxuICAgICAgICAgICAgICAgIGxpbmVbMF0ubGVuZ3RoKys7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsaW5lLnVuc2hpZnQoe3Bvc2l0aW9uOiB3YXlwb2ludC5wb3NpdGlvbiwgZGlyZWN0aW9uOiBkaXJlY3Rpb24sIGxlbmd0aDogMX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbGluZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IEVudGl0eVJhbmdlVHlwZS5Ob25lO1xyXG4gICAgfVxyXG4gICAgaW5pdChncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5leHRyYV9jdXJzb3IgPSBuZXcgU3ByaXRlKCk7XHJcbiAgICAgICAgdGhpcy5leHRyYV9jdXJzb3IuaW5pdCh7eDogMCwgeTogMH0sIGdyb3VwLCBcImN1cnNvclwiLCBbNF0pO1xyXG4gICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRXYXlwb2ludEF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICByZXR1cm4gRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCB0aGlzLndheXBvaW50cyk7XHJcbiAgICB9XHJcbiAgICBzb3J0KCkge1xyXG4gICAgICAgIHRoaXMud2F5cG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYik6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGlmIChhLnBvc2l0aW9uLnggPT0gYi5wb3NpdGlvbi54KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5wb3NpdGlvbi55IC0gYi5wb3NpdGlvbi55O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvc2l0aW9uLnggLSBiLnBvc2l0aW9uLng7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlUmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSwgdGFyZ2V0czogRW50aXR5W10pIHtcclxuXHJcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXRzX3ggPSB0YXJnZXRzO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0c195ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IG51bGw7XHJcblxyXG4gICAgICAgIHRoaXMucmFuZ2VfbGlnaHRlbiA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgPSAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMubGluZV9lbmRfcG9zaXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMubGluZV9zbG93ID0gMDtcclxuICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gMDtcclxuXHJcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLlJhaXNlOlxyXG4gICAgICAgICAgICAgICAgdGhpcy53YXlwb2ludHMgPSBbXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uVXApLCBjb3N0OiAwLCBmb3JtOiBEaXJlY3Rpb24uQWxsLCBwYXJlbnQ6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtwb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlJpZ2h0KSwgY29zdDogMCwgZm9ybTogRGlyZWN0aW9uLkFsbCwgcGFyZW50OiBudWxsfSxcclxuICAgICAgICAgICAgICAgICAgICB7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5Eb3duKSwgY29zdDogMCwgZm9ybTogRGlyZWN0aW9uLkFsbCwgcGFyZW50OiBudWxsfSxcclxuICAgICAgICAgICAgICAgICAgICB7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5MZWZ0KSwgY29zdDogMCwgZm9ybTogRGlyZWN0aW9uLkFsbCwgcGFyZW50OiBudWxsfVxyXG4gICAgICAgICAgICAgICAgXTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5BdHRhY2s6XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IG1pbiA9IGVudGl0eS5kYXRhLm1pbjtcclxuICAgICAgICAgICAgICAgIGxldCBtYXggPSBlbnRpdHkuZGF0YS5tYXg7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy53YXlwb2ludHMgPSB0aGlzLmNhbGN1bGF0ZVdheXBvaW50cyhlbnRpdHkucG9zaXRpb24sIGVudGl0eS5hbGxpYW5jZSwgZW50aXR5LnR5cGUsIG1heCwgZmFsc2UpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBhbGwgd2F5cG9pbnRzIHRoYXQgYXJlIG5lYXJlciB0aGFuIG1pbmltdW0gcmFuZ2VcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLndheXBvaW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCB3YXlwb2ludCA9IHRoaXMud2F5cG9pbnRzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXlwb2ludC5jb3N0IDwgbWluKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFkZEZvcm0oKTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZXMoWzIsIDNdKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldE9mZnNldCgtMSwgLTEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLk1vdmU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cyA9IHRoaXMuY2FsY3VsYXRlV2F5cG9pbnRzKGVudGl0eS5wb3NpdGlvbiwgZW50aXR5LmFsbGlhbmNlLCBlbnRpdHkudHlwZSwgZW50aXR5LmdldE1vdmVtZW50KCksICFlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5GbHkpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRm9ybSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldEZyYW1lcyhbNF0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2V0T2Zmc2V0KC0xLCAtNCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmV4dFRhcmdldEluUmFuZ2UoZGlyZWN0aW9uOiBEaXJlY3Rpb24pOiBFbnRpdHkge1xyXG4gICAgICAgIGlmICh0aGlzLnRhcmdldHNfeC5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIXRoaXMudGFyZ2V0c195KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydFRhcmdldHMoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA9PSBEaXJlY3Rpb24uTm9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcG9zID0gbmV3IFBvcygwLCAwKS5tb3ZlKGRpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIGlmIChwb3MueCAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxldCBpbmRleF94ID0gdGhpcy50YXJnZXRzX3guaW5kZXhPZih0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIGluZGV4X3ggKz0gcG9zLng7XHJcbiAgICAgICAgICAgIGlmIChpbmRleF94IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXhfeCA9IHRoaXMudGFyZ2V0c194Lmxlbmd0aCAtIDE7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmIChpbmRleF94ID49IHRoaXMudGFyZ2V0c194Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaW5kZXhfeCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnRhcmdldHNfeFtpbmRleF94XTtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBwb3MueSAhPSAwXHJcbiAgICAgICAgbGV0IGluZGV4X3kgPSB0aGlzLnRhcmdldHNfeS5pbmRleE9mKHRoaXMudGFyZ2V0KTtcclxuICAgICAgICBpbmRleF95ICs9IHBvcy55O1xyXG4gICAgICAgIGlmIChpbmRleF95IDwgMCkge1xyXG4gICAgICAgICAgICBpbmRleF95ID0gdGhpcy50YXJnZXRzX3kubGVuZ3RoIC0gMTtcclxuICAgICAgICB9ZWxzZSBpZiAoaW5kZXhfeSA+PSB0aGlzLnRhcmdldHNfeS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaW5kZXhfeSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy50YXJnZXRzX3lbaW5kZXhfeV07XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdFRhcmdldChlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghdGhpcy5nZXRXYXlwb2ludEF0KGVudGl0eS5wb3NpdGlvbikpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBlbnRpdHk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc29ydFRhcmdldHMoKSB7XHJcbiAgICAgICAgdGhpcy50YXJnZXRzX3kgPSB0aGlzLnRhcmdldHNfeC5zbGljZSgpO1xyXG5cclxuICAgICAgICB0aGlzLnRhcmdldHNfeC5zb3J0KChhOiBFbnRpdHksIGI6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYS5wb3NpdGlvbi54ID09IGIucG9zaXRpb24ueCkgeyByZXR1cm4gYS5wb3NpdGlvbi55IC0gYi5wb3NpdGlvbi55OyB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvc2l0aW9uLnggLSBiLnBvc2l0aW9uLng7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy50YXJnZXRzX3kuc29ydCgoYTogRW50aXR5LCBiOiBFbnRpdHkpID0+IHtcclxuICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueSA9PSBiLnBvc2l0aW9uLnkpIHsgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDsgfVxyXG4gICAgICAgICAgICByZXR1cm4gYS5wb3NpdGlvbi55IC0gYi5wb3NpdGlvbi55O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyB0YWtlIHRoZSBlbnRpdHkgbW9zdCByaWdodFxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy50YXJnZXRzX3gubGVuZ3RoID4gMCA/IHRoaXMudGFyZ2V0c194W3RoaXMudGFyZ2V0c194Lmxlbmd0aCAtIDFdIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3KHJhbmdlX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MpIHtcclxuXHJcbiAgICAgICAgbGV0IGNvbG9yOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuTW92ZTpcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuUmFpc2U6XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IDB4ZmZmZmZmO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLkF0dGFjazpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gMHhmZjAwMDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJhbmdlX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuYmVnaW5GaWxsKGNvbG9yKTtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB0aGlzLndheXBvaW50cykge1xyXG4gICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB3YXlwb2ludC5wb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCA0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIHJhbmdlX2dyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLnggKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA0LCBwb3NpdGlvbi55LCA0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZV9ncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCA0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHdheXBvaW50LmZvcm0gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCwgcG9zaXRpb24ueSwgNCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByYW5nZV9ncmFwaGljcy5lbmRGaWxsKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIsIGN1cnNvcl9wb3NpdGlvbjogUG9zLCBhbmltX3N0YXRlOiBudW1iZXIsIHJhbmdlX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIGxpbmVfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG5cclxuICAgICAgICBpZiAodGhpcy50eXBlID09IEVudGl0eVJhbmdlVHlwZS5Ob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJhbmdlX2xpZ2h0ZW4pIHtcclxuICAgICAgICAgICAgdGhpcy5yYW5nZV9wcm9ncmVzcyArPSBzdGVwcztcclxuICAgICAgICAgICAgaWYgKHRoaXMucmFuZ2VfcHJvZ3Jlc3MgPj0gMTAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gMTAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZV9saWdodGVuID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzIC09IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yYW5nZV9wcm9ncmVzcyA8PSA0MCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZV9wcm9ncmVzcyA9IDQwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZV9saWdodGVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2V0RnJhbWUoYW5pbV9zdGF0ZSk7XHJcblxyXG4gICAgICAgIGlmICghY3Vyc29yX3Bvc2l0aW9uLm1hdGNoKHRoaXMubGluZV9lbmRfcG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGluZV9lbmRfcG9zaXRpb24gPSBjdXJzb3JfcG9zaXRpb24uY29weSgpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGVuZHBvaW50ID0gdGhpcy5nZXRXYXlwb2ludEF0KGN1cnNvcl9wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmICghIWVuZHBvaW50KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRXb3JsZFBvc2l0aW9uKGN1cnNvcl9wb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saW5lID0gRW50aXR5UmFuZ2UuZ2V0TGluZVRvV2F5cG9pbnQoZW5kcG9pbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50eXBlID09IEVudGl0eVJhbmdlVHlwZS5Nb3ZlKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxpbmVfc2xvdyArPSBzdGVwcztcclxuICAgICAgICAgICAgaWYgKHRoaXMubGluZV9zbG93ID49IDUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGluZV9zbG93IC09IDU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5saW5lX29mZnNldCAtPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZV9vZmZzZXQgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lX29mZnNldCA9IEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORyAtIDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBsaW5lX2dyYXBoaWNzLmJlZ2luRmlsbCgweGZmZmZmZik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgdGhpcy5saW5lKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmF3U2VnbWVudChsaW5lX2dyYXBoaWNzLCBwYXJ0LCB0aGlzLmxpbmVfb2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5saW5lX29mZnNldCA9ICh0aGlzLmxpbmVfb2Zmc2V0ICsgcGFydC5sZW5ndGggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpICUgKEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBncmV5ID0gdGhpcy5yYW5nZV9wcm9ncmVzcyAvIDEwMCAqIDB4RkYgfCAwO1xyXG4gICAgICAgIHJhbmdlX2dyYXBoaWNzLnRpbnQgPSAoZ3JleSA8PCAxNikgfCAoZ3JleSA8PCA4KSB8IGdyZXk7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIocmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgbGluZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5UmFuZ2VUeXBlLk5vbmU7XHJcbiAgICAgICAgdGhpcy53YXlwb2ludHMgPSBbXTtcclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICBsaW5lX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2FsY3VsYXRlV2F5cG9pbnRzKHBvc2l0aW9uOiBQb3MsIGVudGl0eV9hbGxpYW5jZTogQWxsaWFuY2UsIGVudGl0eV90eXBlOiBFbnRpdHlUeXBlLCBtYXhfY29zdDogbnVtYmVyLCB1c2VfdGVycmFpbjogYm9vbGVhbik6IElXYXlwb2ludFtdIHtcclxuICAgICAgICAvLyBjb3N0IGZvciBvcmlnaW4gcG9pbnQgaXMgYWx3YXlzIDFcclxuICAgICAgICBsZXQgb3BlbjogSVdheXBvaW50W10gPSBbe3Bvc2l0aW9uOiBwb3NpdGlvbiwgY29zdDogKHVzZV90ZXJyYWluID8gMSA6IDApLCBmb3JtOiAwLCBwYXJlbnQ6IG51bGx9XTtcclxuICAgICAgICBsZXQgY2xvc2VkOiBJV2F5cG9pbnRbXSA9IFtdO1xyXG4gICAgICAgIHdoaWxlIChvcGVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGN1cnJlbnQgPSBvcGVuLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGNsb3NlZC5wdXNoKGN1cnJlbnQpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGFkamFjZW50X3Bvc2l0aW9ucyA9IHRoaXMubWFwLmdldEFkamFjZW50UG9zaXRpb25zQXQoY3VycmVudC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHAgb2YgYWRqYWNlbnRfcG9zaXRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoZWNrUG9zaXRpb24ocCwgY3VycmVudCwgb3BlbiwgY2xvc2VkLCBtYXhfY29zdCwgdXNlX3RlcnJhaW4sIGVudGl0eV9hbGxpYW5jZSwgZW50aXR5X3R5cGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjbG9zZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja1Bvc2l0aW9uKHBvc2l0aW9uOiBQb3MsIHBhcmVudDogSVdheXBvaW50LCBvcGVuOiBJV2F5cG9pbnRbXSwgY2xvc2VkOiBJV2F5cG9pbnRbXSwgbWF4X2Nvc3Q6IG51bWJlciwgdXNlX3RlcnJhaW46IGJvb2xlYW4sIGVudGl0eV9hbGxpYW5jZTogQWxsaWFuY2UsIGVudGl0eV90eXBlOiBFbnRpdHlUeXBlKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIC8vIGFscmVhZHkgaXMgdGhlIGxvd2VzdCBwb3NzaWJsZVxyXG4gICAgICAgIGlmICghIUVudGl0eVJhbmdlLmZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbiwgY2xvc2VkKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICAgICAgaWYgKHVzZV90ZXJyYWluKSB7XHJcbiAgICAgICAgICAgIGxldCBpc19vY2N1cGllZCA9IHRoaXMubWFwLmdldEVudGl0eUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhaXNfb2NjdXBpZWQgJiYgIWlzX29jY3VwaWVkLmlzRGVhZCgpICYmIGlzX29jY3VwaWVkLmFsbGlhbmNlICE9IGVudGl0eV9hbGxpYW5jZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCB0aWxlX2Nvc3QgPSAxO1xyXG4gICAgICAgIGlmICh1c2VfdGVycmFpbikge1xyXG4gICAgICAgICAgICB0aWxlX2Nvc3QgPSB0aGlzLm1hcC5nZXRDb3N0QXQocG9zaXRpb24sIGVudGl0eV90eXBlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBuZXdfY29zdCA9IHBhcmVudC5jb3N0ICsgdGlsZV9jb3N0O1xyXG4gICAgICAgIGlmIChuZXdfY29zdCA+IG1heF9jb3N0KSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBsZXQgaW5fb3BlbiA9IEVudGl0eVJhbmdlLmZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbiwgb3Blbik7XHJcbiAgICAgICAgLy8gY2hlY2sgaWYgaW4gb3BlbiBzdGFjayBhbmQgd2UgYXJlIGxvd2VyXHJcbiAgICAgICAgaWYgKCEhaW5fb3Blbikge1xyXG4gICAgICAgICAgICBpZiAoaW5fb3Blbi5jb3N0IDw9IG5ld19jb3N0KSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgICAgICBpbl9vcGVuLmNvc3QgPSBuZXdfY29zdDtcclxuICAgICAgICAgICAgaW5fb3Blbi5wYXJlbnQgPSBwYXJlbnQ7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBvcGVuLnB1c2goe3Bvc2l0aW9uOiBwb3NpdGlvbiwgcGFyZW50OiBwYXJlbnQsIGZvcm06IDAsIGNvc3Q6IG5ld19jb3N0fSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGFkZEZvcm0oKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2YgdGhpcy53YXlwb2ludHMpIHtcclxuICAgICAgICAgICAgd2F5cG9pbnQuZm9ybSA9IDA7XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi55ID4gMCAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlVwKSkpIHsgd2F5cG9pbnQuZm9ybSArPSAxOyB9XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi54IDwgdGhpcy5tYXAud2lkdGggLSAxICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uUmlnaHQpKSkgeyB3YXlwb2ludC5mb3JtICs9IDI7IH1cclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnkgPCB0aGlzLm1hcC5oZWlnaHQgLSAxICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uRG93bikpKSB7IHdheXBvaW50LmZvcm0gKz0gNDsgfVxyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueCA+IDAgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5MZWZ0KSkpIHsgd2F5cG9pbnQuZm9ybSArPSA4OyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3U2VnbWVudChncmFwaGljczogUGhhc2VyLkdyYXBoaWNzLCBwYXJ0OiBMaW5lUGFydCwgb2Zmc2V0OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgZGlzdGFuY2UgPSBwYXJ0Lmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeCA9IChwYXJ0LnBvc2l0aW9uLnggKyAwLjUpICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgIGxldCB5ID0gKHBhcnQucG9zaXRpb24ueSArIDAuNSkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcblxyXG4gICAgICAgIHdoaWxlIChkaXN0YW5jZSA+IDApIHtcclxuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEg7XHJcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZW5ndGggLT0gb2Zmc2V0O1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBsZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aCA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHBhcnQuZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyBncmFwaGljcy5kcmF3UmVjdCh4IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgeSAtIGxlbmd0aCwgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRILCBsZW5ndGgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeSAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHgsIHkgLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB4ICs9IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyBncmFwaGljcy5kcmF3UmVjdCh4IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgeSwgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRILCBsZW5ndGgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeSArPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCAtIGxlbmd0aCwgeSAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIGxlbmd0aCwgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHggLT0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGlzdGFuY2UgLT0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHkudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5cmFuZ2UudHNcIiAvPlxyXG5cclxuZW51bSBUaWxlIHtcclxuICAgIFBhdGgsXHJcbiAgICBHcmFzcyxcclxuICAgIEZvcmVzdCxcclxuICAgIEhpbGwsXHJcbiAgICBNb3VudGFpbixcclxuICAgIFdhdGVyLFxyXG4gICAgQnJpZGdlLFxyXG4gICAgSG91c2UsXHJcbiAgICBDYXN0bGVcclxufVxyXG5pbnRlcmZhY2UgQnVpbGRpbmcge1xyXG4gICAgY2FzdGxlOiBib29sZWFuO1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxufVxyXG5pbnRlcmZhY2UgSUJ1aWxkaW5nIHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxufVxyXG5cclxuY2xhc3MgTWFwIHtcclxuXHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcblxyXG4gICAgZW50aXRpZXM6IEVudGl0eVtdO1xyXG4gICAgZW50aXR5X3JhbmdlOiBFbnRpdHlSYW5nZTtcclxuXHJcbiAgICBwcml2YXRlIHRpbGVzOiBUaWxlW11bXTtcclxuICAgIHByaXZhdGUgYnVpbGRpbmdzOiBCdWlsZGluZ1tdO1xyXG5cclxuICAgIHN0YXRpYyBnZXRUaWxlRm9yQ29kZShjb2RlOiBudW1iZXIpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuVElMRVNfUFJPUFtjb2RlXTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIGdldENvc3RGb3JUaWxlKHRpbGU6IFRpbGUsIGVudGl0eV90eXBlOiBFbnRpdHlUeXBlKTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5XYXRlciAmJiBlbnRpdHlfdHlwZSA9PSBFbnRpdHlUeXBlLkxpemFyZCkge1xyXG4gICAgICAgICAgICAvLyBMaXphcmQgb24gd2F0ZXJcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgY29zdCA9IDA7XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbiB8fCB0aWxlID09IFRpbGUuV2F0ZXIpIHtcclxuICAgICAgICAgICAgY29zdCA9IDM7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aWxlID09IFRpbGUuRm9yZXN0IHx8IHRpbGUgPT0gVGlsZS5IaWxsKSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAyO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvc3QgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW50aXR5X3R5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHtcclxuICAgICAgICAgICAgLy8gTGl6YXJkIGZvciBldmVyeXRoaW5nIGV4Y2VwdCB3YXRlclxyXG4gICAgICAgICAgICByZXR1cm4gY29zdCAqIDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29zdDtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXREZWZGb3JUaWxlKHRpbGU6IFRpbGUsIGVudGl0eV90eXBlPzogRW50aXR5VHlwZSk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbiB8fCB0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkgeyByZXR1cm4gMzsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuRm9yZXN0IHx8IHRpbGUgPT0gVGlsZS5IaWxsKSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5XYXRlciAmJiB0eXBlb2YgZW50aXR5X3R5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbnRpdHlfdHlwZSA9PSBFbnRpdHlUeXBlLkxpemFyZCkgeyByZXR1cm4gMjsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuR3Jhc3MpIHsgcmV0dXJuIDE7IH1cclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X3JhbmdlID0gbmV3IEVudGl0eVJhbmdlKHRoaXMpO1xyXG4gICAgICAgIHRoaXMubG9hZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcblxyXG4gICAgICAgIC0gREFUQSBPUEVSQVRJT05TXHJcblxyXG4gICAgICovXHJcblxyXG4gICAgbG9hZCgpIHtcclxuICAgICAgICBpZiAoIUFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuY2hlY2tCaW5hcnlLZXkodGhpcy5uYW1lKSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvdWxkIG5vdCBmaW5kIG1hcDogXCIgKyB0aGlzLm5hbWUpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkaW5ncyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSBbXTtcclxuICAgICAgICB0aGlzLnRpbGVzID0gW107XHJcblxyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkodGhpcy5uYW1lKTtcclxuICAgICAgICBsZXQgZGF0YSA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMud2lkdGggPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuICAgICAgICB0aGlzLmhlaWdodCA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0O1xyXG5cclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVzW3hdID0gW107XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGNvZGUgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRpbGUgPSBNYXAuZ2V0VGlsZUZvckNvZGUoY29kZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbGVzW3hdW3ldID0gdGlsZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVpbGRpbmdzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXN0bGU6ICh0aWxlID09IFRpbGUuQ2FzdGxlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IG5ldyBQb3MoeCwgeSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsbGlhbmNlOiA8QWxsaWFuY2U+IE1hdGguZmxvb3IoKGNvZGUgLSBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMpIC8gMylcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNraXAgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNCArIHNraXAgKiA0O1xyXG5cclxuICAgICAgICBsZXQgbnVtYmVyX29mX2VudGl0aWVzID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX2VudGl0aWVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGRlc2MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBsZXQgdHlwZTogRW50aXR5VHlwZSA9IGRlc2MgJSAxMTtcclxuICAgICAgICAgICAgbGV0IGFsbGlhbmNlOiBBbGxpYW5jZSA9IE1hdGguZmxvb3IoZGVzYyAvIDExKSArIDE7XHJcblxyXG4gICAgICAgICAgICBsZXQgeCA9IE1hdGguZmxvb3IoZGF0YS5nZXRVaW50MTYoaW5kZXgpIC8gMTYpO1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG4gICAgICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoZGF0YS5nZXRVaW50MTYoaW5kZXgpIC8gMTYpO1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5wdXNoKG5ldyBFbnRpdHkodHlwZSwgYWxsaWFuY2UsIG5ldyBQb3MoeCwgeSkpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbXBvcnRFbnRpdGllcyhlbnRpdGllczogSUVudGl0eVtdKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiBlbnRpdGllcykge1xyXG4gICAgICAgICAgICBsZXQgZSA9IHRoaXMuY3JlYXRlRW50aXR5KGVudGl0eS50eXBlLCBlbnRpdHkuYWxsaWFuY2UsIG5ldyBQb3MoZW50aXR5LngsIGVudGl0eS55KSk7XHJcbiAgICAgICAgICAgIGUuaGVhbHRoID0gZW50aXR5LmhlYWx0aDtcclxuICAgICAgICAgICAgZS5zdGF0ZSA9IGVudGl0eS5zdGF0ZTtcclxuICAgICAgICAgICAgZS5zdGF0dXMgPSBlbnRpdHkuc3RhdHVzO1xyXG4gICAgICAgICAgICBlLmVwID0gZW50aXR5LmVwO1xyXG4gICAgICAgICAgICBlLnJhbmsgPSBlbnRpdHkucmFuaztcclxuICAgICAgICAgICAgZS5kZWF0aF9jb3VudCA9IGVudGl0eS5kZWF0aF9jb3VudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBpbXBvcnRCdWlsZGluZ3MoYnVpbGRpbmdzOiBJQnVpbGRpbmdbXSkge1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIGJ1aWxkaW5ncykge1xyXG4gICAgICAgICAgICBsZXQgbWF0Y2ggPSB0aGlzLmdldEJ1aWxkaW5nQXQobmV3IFBvcyhidWlsZGluZy54LCBidWlsZGluZy55KSk7XHJcbiAgICAgICAgICAgIGlmICghbWF0Y2gpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbWF0Y2guYWxsaWFuY2UgPSBidWlsZGluZy5hbGxpYW5jZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBleHBvcnRFbnRpdGllcygpOiBJRW50aXR5W10ge1xyXG4gICAgICAgIGxldCBleHA6IElFbnRpdHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGV4cC5wdXNoKGVudGl0eS5leHBvcnQoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBleHA7XHJcbiAgICB9XHJcbiAgICBleHBvcnRCdWlsZGluZ3MoKTogSUJ1aWxkaW5nW10ge1xyXG4gICAgICAgIGxldCBleHA6IElCdWlsZGluZ1tdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgdGhpcy5idWlsZGluZ3MpIHtcclxuICAgICAgICAgICAgaWYgKGJ1aWxkaW5nLmFsbGlhbmNlID09IEFsbGlhbmNlLk5vbmUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgZXhwLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgeDogYnVpbGRpbmcucG9zaXRpb24ueCxcclxuICAgICAgICAgICAgICAgIHk6IGJ1aWxkaW5nLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgICAgICBhbGxpYW5jZTogYnVpbGRpbmcuYWxsaWFuY2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBleHA7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuXHJcbiAgICAgICAgRU5USVRZIE9QRVJBVElPTlNcclxuXHJcbiAgICAgKi9cclxuXHJcbiAgICBjcmVhdGVFbnRpdHkodHlwZTogRW50aXR5VHlwZSwgYWxsaWFuY2U6IEFsbGlhbmNlLCBwb3NpdGlvbjogUG9zKTogRW50aXR5IHtcclxuICAgICAgICBsZXQgZW50aXR5ID0gbmV3IEVudGl0eSh0eXBlLCBhbGxpYW5jZSwgcG9zaXRpb24pO1xyXG4gICAgICAgIHRoaXMuZW50aXRpZXMucHVzaChlbnRpdHkpO1xyXG4gICAgICAgIHJldHVybiBlbnRpdHk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZW50aXRpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eSA9PSB0aGlzLmVudGl0aWVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0aWVzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVudGl0eS5kZXN0cm95KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RW50aXR5QXQocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEtpbmdQb3NpdGlvbihhbGxpYW5jZTogQWxsaWFuY2UpOiBQb3Mge1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkuYWxsaWFuY2UgPT0gYWxsaWFuY2UgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5LaW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBnZXRFbnRpdGllc1dpdGgoYWxsaWFuY2U6IEFsbGlhbmNlLCBzdGF0ZT86IEVudGl0eVN0YXRlLCB0eXBlPzogRW50aXR5VHlwZSk6IEVudGl0eVtdIHtcclxuICAgICAgICBsZXQgcmV0OiBFbnRpdHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkuYWxsaWFuY2UgIT0gYWxsaWFuY2UpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlICE9IFwidW5kZWZpbmVkXCIgJiYgZW50aXR5LnR5cGUgIT0gdHlwZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0YXRlICE9IFwidW5kZWZpbmVkXCIgJiYgZW50aXR5LnN0YXRlICE9IHN0YXRlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgPT0gXCJ1bmRlZmluZWRcIiAmJiBlbnRpdHkuc3RhdGUgPT0gRW50aXR5U3RhdGUuRGVhZCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICByZXQucHVzaChlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvdW50RW50aXRpZXNXaXRoKGFsbGlhbmNlOiBBbGxpYW5jZSwgc3RhdGU/OiBFbnRpdHlTdGF0ZSwgdHlwZT86IEVudGl0eVR5cGUpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEVudGl0aWVzV2l0aChhbGxpYW5jZSwgc3RhdGUsIHR5cGUpLmxlbmd0aDtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0VHVybihhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gdGhpcy5lbnRpdGllcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tpXTtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5pc0RlYWQoKSkge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmRlYXRoX2NvdW50Kys7XHJcbiAgICAgICAgICAgICAgICBpZiAoZW50aXR5LmRlYXRoX2NvdW50ID49IEFuY2llbnRFbXBpcmVzLkRFQVRIX0NPVU5UKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkuYWxsaWFuY2UgPT0gYWxsaWFuY2UpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zdGF0ZSA9IEVudGl0eVN0YXRlLlJlYWR5O1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0QWxsaWFuY2VBdChlbnRpdHkucG9zaXRpb24pID09IGVudGl0eS5hbGxpYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuaCA9IE1hdGgubWluKGVudGl0eS5oZWFsdGggKyAyLCAxMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5LnNldEhlYWx0aChuaCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc3RhdGUgPSBFbnRpdHlTdGF0ZS5Nb3ZlZDtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5jbGVhclN0YXR1cyhFbnRpdHlTdGF0dXMuUG9pc29uZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBzaG93ID0gKGVudGl0eS5hbGxpYW5jZSA9PSBhbGxpYW5jZSk7XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGVTdGF0ZShlbnRpdHkuc3RhdGUsIHNob3cpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG5cclxuICAgICAgICAtIFRJTEUgT1BFUkFUSU9OU1xyXG5cclxuICAgICAqL1xyXG5cclxuICAgIGdldFRpbGVBdChwb3NpdGlvbjogUG9zKTogVGlsZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbcG9zaXRpb24ueF1bcG9zaXRpb24ueV07XHJcbiAgICB9XHJcbiAgICBnZXRBZGphY2VudFRpbGVzQXQocG9zaXRpb246IFBvcyk6IFRpbGVbXSB7XHJcblxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPiAwID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54LCBwb3NpdGlvbi55IC0gMSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPCB0aGlzLndpZHRoIC0gMSA/IHRoaXMuZ2V0VGlsZUF0KG5ldyBQb3MocG9zaXRpb24ueCArIDEsIHBvc2l0aW9uLnkpKSA6IC0xLFxyXG4gICAgICAgICAgICBwb3NpdGlvbi55IDwgdGhpcy5oZWlnaHQgLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54LCBwb3NpdGlvbi55ICsgMSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnggPiAwID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54IC0gMSwgcG9zaXRpb24ueSkpIDogLTFcclxuICAgICAgICBdO1xyXG5cclxuICAgIH1cclxuICAgIGdldEFkamFjZW50UG9zaXRpb25zQXQocDogUG9zKTogUG9zW10ge1xyXG4gICAgICAgIGxldCByZXQ6IFBvc1tdID0gW107XHJcblxyXG4gICAgICAgIC8vIHRvcCwgcmlnaHQsIGJvdHRvbSwgbGVmdFxyXG4gICAgICAgIGlmIChwLnkgPiAwKSB7IHJldC5wdXNoKG5ldyBQb3MocC54LCBwLnkgLSAxKSk7IH1cclxuICAgICAgICBpZiAocC54IDwgdGhpcy53aWR0aCAtIDEpIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggKyAxLCBwLnkpKTsgfVxyXG4gICAgICAgIGlmIChwLnkgPCB0aGlzLmhlaWdodCAtIDEpIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSArIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPiAwKSB7IHJldC5wdXNoKG5ldyBQb3MocC54IC0gMSwgcC55KSk7IH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgIH1cclxuICAgIHNldEFsbGlhbmNlQXQocG9zaXRpb246IFBvcywgYWxsaWFuY2U6IEFsbGlhbmNlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgdGhpcy5idWlsZGluZ3Mpe1xyXG4gICAgICAgICAgICBpZiAoYnVpbGRpbmcucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICBidWlsZGluZy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgZ2V0QnVpbGRpbmdBdChwb3NpdGlvbjogUG9zKTogQnVpbGRpbmcge1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKXtcclxuICAgICAgICAgICAgaWYgKGJ1aWxkaW5nLnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1aWxkaW5nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgZ2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgbGV0IGJ1aWxkaW5nID0gdGhpcy5nZXRCdWlsZGluZ0F0KHBvc2l0aW9uKTtcclxuICAgICAgICBpZiAoISFidWlsZGluZykgeyByZXR1cm4gYnVpbGRpbmcuYWxsaWFuY2U7IH1cclxuICAgICAgICByZXR1cm4gQWxsaWFuY2UuTm9uZTtcclxuICAgIH1cclxuICAgIGdldE9jY3VwaWVkSG91c2VzKCk6IEJ1aWxkaW5nW10ge1xyXG4gICAgICAgIGxldCBob3VzZXM6IEJ1aWxkaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmICghYnVpbGRpbmcuY2FzdGxlICYmIGJ1aWxkaW5nLmFsbGlhbmNlICE9IEFsbGlhbmNlLk5vbmUpIHtcclxuICAgICAgICAgICAgICAgIGhvdXNlcy5wdXNoKGJ1aWxkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaG91c2VzO1xyXG4gICAgfVxyXG4gICAgZ2V0TmVhcmVzdEhvdXNlRm9yRW50aXR5KGVudGl0eTogRW50aXR5KTogQnVpbGRpbmcge1xyXG4gICAgICAgIGxldCBtaW5fZGlzdCA9IC0xO1xyXG4gICAgICAgIGxldCBtaW5fYnVpbGRpbmc6IEJ1aWxkaW5nID0gbnVsbDtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncykge1xyXG4gICAgICAgICAgICBpZiAoYnVpbGRpbmcuY2FzdGxlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IE1hdGguYWJzKGJ1aWxkaW5nLnBvc2l0aW9uLnggLSBlbnRpdHkucG9zaXRpb24ueCkgKyBNYXRoLmFicyhidWlsZGluZy5wb3NpdGlvbi55IC0gZW50aXR5LnBvc2l0aW9uLnkpO1xyXG4gICAgICAgICAgICBpZiAobWluX2Rpc3QgPj0gMCAmJiBkaXN0YW5jZSA+PSBtaW5fZGlzdCkgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0TWFwKCkgPT0gMiB8fCAoZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5Tb2xkaWVyICYmIGJ1aWxkaW5nLmFsbGlhbmNlICE9IGVudGl0eS5hbGxpYW5jZSkgfHwgKGVudGl0eS50eXBlICE9IEVudGl0eVR5cGUuU29sZGllciAmJiBidWlsZGluZy5hbGxpYW5jZSA9PSBlbnRpdHkuYWxsaWFuY2UpKSB7XHJcbiAgICAgICAgICAgICAgICBtaW5fZGlzdCA9IGRpc3RhbmNlO1xyXG4gICAgICAgICAgICAgICAgbWluX2J1aWxkaW5nID0gYnVpbGRpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG1pbl9idWlsZGluZztcclxuICAgIH1cclxuICAgIGdldEdvbGRHYWluRm9yQWxsaWFuY2UoYWxsaWFuY2U6IEFsbGlhbmNlKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgZ2FpbiA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgdGhpcy5idWlsZGluZ3MpIHtcclxuICAgICAgICAgICAgaWYgKGJ1aWxkaW5nLmFsbGlhbmNlICE9IGFsbGlhbmNlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGdhaW4gKz0gYnVpbGRpbmcuY2FzdGxlID8gNTAgOiAzMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGdhaW47XHJcbiAgICB9XHJcbiAgICBnZXRDb3N0QXQocG9zaXRpb246IFBvcywgZW50aXR5X3R5cGU6IEVudGl0eVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gTWFwLmdldENvc3RGb3JUaWxlKHRoaXMuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5X3R5cGUpO1xyXG4gICAgfVxyXG4gICAgZ2V0RGVmQXQocG9zaXRpb246IFBvcywgZW50aXR5X3R5cGU6IEVudGl0eVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gTWFwLmdldERlZkZvclRpbGUodGhpcy5nZXRUaWxlQXQocG9zaXRpb24pLCBlbnRpdHlfdHlwZSk7XHJcbiAgICB9XHJcbiAgICBpc0NhbXBhaWduKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm5hbWUuY2hhckF0KDApID09IFwibVwiO1xyXG4gICAgfVxyXG4gICAgZ2V0TWFwKCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlSW50KHRoaXMubmFtZS5jaGFyQXQoMSksIDEwKTtcclxuICAgIH1cclxuXHJcblxyXG5cclxuICAgIGdldEVudGl0eU9wdGlvbnMoZW50aXR5OiBFbnRpdHksIG1vdmVkOiBib29sZWFuID0gZmFsc2UpOiBBY3Rpb25bXSB7XHJcblxyXG4gICAgICAgIGlmIChlbnRpdHkuc3RhdGUgIT0gRW50aXR5U3RhdGUuUmVhZHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5nZXRFbnRpdHlBdChlbnRpdHkucG9zaXRpb24pICE9IGVudGl0eSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW0FjdGlvbi5NT1ZFXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvcHRpb25zOiBBY3Rpb25bXSA9IFtdO1xyXG5cclxuICAgICAgICBpZiAoIW1vdmVkICYmIGVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbkJ1eSkgJiYgdGhpcy5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLkJVWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbnRBdHRhY2tBZnRlck1vdmluZykgfHwgIW1vdmVkKSB7XHJcbiAgICAgICAgICAgIGxldCBhdHRhY2tfdGFyZ2V0cyA9IHRoaXMuZ2V0QXR0YWNrVGFyZ2V0cyhlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAoYXR0YWNrX3RhcmdldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5BVFRBQ0spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuUmFpc2UpKSB7XHJcbiAgICAgICAgICAgIGxldCByYWlzZV90YXJnZXRzID0gdGhpcy5nZXRSYWlzZVRhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgaWYgKHJhaXNlX3RhcmdldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5SQUlTRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmdldEFsbGlhbmNlQXQoZW50aXR5LnBvc2l0aW9uKSAhPSBlbnRpdHkuYWxsaWFuY2UgJiYgKChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5PY2N1cHlIb3VzZSkgJiYgdGhpcy5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkhvdXNlKSB8fCAoZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuT2NjdXB5Q2FzdGxlKSAmJiB0aGlzLmdldFRpbGVBdChlbnRpdHkucG9zaXRpb24pID09IFRpbGUuQ2FzdGxlKSkpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5PQ0NVUFkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG1vdmVkKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uRU5EX01PVkUpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uTU9WRSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcblxyXG4gICAgICAgIFJBTkdFXHJcblxyXG4gICAgICovXHJcblxyXG4gICAgZ2V0QXR0YWNrVGFyZ2V0cyhlbnRpdHk6IEVudGl0eSwgcG9zaXRpb24/OiBQb3MpIHtcclxuICAgICAgICBsZXQgdGFyZ2V0czogRW50aXR5W10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBlbmVteSBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbmVteS5hbGxpYW5jZSA9PSBlbnRpdHkuYWxsaWFuY2UpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKGVuZW15LmlzRGVhZCgpKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IGVudGl0eS5nZXREaXN0YW5jZVRvRW50aXR5KGVuZW15KTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwb3NpdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IHBvc2l0aW9uLmRpc3RhbmNlVG8oZW5lbXkucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IGVudGl0eS5kYXRhLm1heCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPCBlbnRpdHkuZGF0YS5taW4pIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgICAgIHRhcmdldHMucHVzaChlbmVteSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0YXJnZXRzO1xyXG4gICAgfVxyXG4gICAgZ2V0UmFpc2VUYXJnZXRzKGVudGl0eTogRW50aXR5LCBwb3NpdGlvbj86IFBvcykge1xyXG4gICAgICAgIGxldCB0YXJnZXRzOiBFbnRpdHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGRlYWQgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoIWRlYWQuaXNEZWFkKCkpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkoZGVhZCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcG9zaXRpb24gIT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBwb3NpdGlvbi5kaXN0YW5jZVRvKGRlYWQucG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSAhPSAxKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIHRhcmdldHMucHVzaChkZWFkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldHM7XHJcbiAgICB9XHJcbiAgICByZXNldFdpc3AoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSAhPSBhbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBlbnRpdHkuY2xlYXJTdGF0dXMoRW50aXR5U3RhdHVzLldpc3BlZCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmhhc1dpc3BJblJhbmdlKGVudGl0eSkpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zZXRTdGF0dXMoRW50aXR5U3RhdHVzLldpc3BlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoYXNXaXNwSW5SYW5nZShlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGZvciAobGV0IHdpc3Agb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAod2lzcC5hbGxpYW5jZSAhPSBlbnRpdHkuYWxsaWFuY2UpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKCF3aXNwLmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuV2lzcCkpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKHdpc3AuaXNEZWFkKCkpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkod2lzcCk7XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IDEgfHwgZGlzdGFuY2UgPiAyKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1JhbmdlKHR5cGU6IEVudGl0eVJhbmdlVHlwZSwgZW50aXR5OiBFbnRpdHkpOiBFbnRpdHlSYW5nZSB7XHJcblxyXG4gICAgICAgIGxldCB0YXJnZXRzOiBFbnRpdHlbXSA9IG51bGw7XHJcbiAgICAgICAgaWYgKHR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLkF0dGFjayB8fCB0eXBlID09IEVudGl0eVJhbmdlVHlwZS5SYWlzZSkge1xyXG4gICAgICAgICAgICBpZiAodHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzID0gdGhpcy5nZXRBdHRhY2tUYXJnZXRzKGVudGl0eSk7XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0eXBlID09IEVudGl0eVJhbmdlVHlwZS5SYWlzZSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0cyA9IHRoaXMuZ2V0UmFpc2VUYXJnZXRzKGVudGl0eSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X3JhbmdlLmNyZWF0ZVJhbmdlKHR5cGUsIGVudGl0eSwgdGFyZ2V0cyk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5X3JhbmdlO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5LCB0YXJnZXQ6IFBvcywgZGVsZWdhdGU6IEVudGl0eU1hbmFnZXJEZWxlZ2F0ZSwgYW5pbWF0ZTogYm9vbGVhbiA9IHRydWUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgICAgICAgZW50aXR5LnBvc2l0aW9uID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICBlbnRpdHkuc2V0V29ybGRQb3NpdGlvbih0YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIXRoaXMuZ2V0RW50aXR5QXQodGFyZ2V0KSAmJiAhdGFyZ2V0Lm1hdGNoKGVudGl0eS5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgLy8gQ2FudCBtb3ZlIHdoZXJlIGFub3RoZXIgdW5pdCBpc1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB3YXlwb2ludCA9IHRoaXMuZW50aXR5X3JhbmdlLmdldFdheXBvaW50QXQodGFyZ2V0KTtcclxuICAgICAgICBpZiAoIXdheXBvaW50KSB7XHJcbiAgICAgICAgICAgIC8vIHRhcmdldCBub3QgaW4gcmFuZ2VcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgbGluZSA9IEVudGl0eVJhbmdlLmdldExpbmVUb1dheXBvaW50KHdheXBvaW50KTtcclxuICAgICAgICBlbnRpdHkubW92ZSh0YXJnZXQsIGxpbmUsIGRlbGVnYXRlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBuZXh0VGFyZ2V0SW5SYW5nZShkaXJlY3Rpb246IERpcmVjdGlvbik6IEVudGl0eSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5X3JhbmdlLm5leHRUYXJnZXRJblJhbmdlKGRpcmVjdGlvbik7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0VGFyZ2V0SW5SYW5nZShlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eV9yYW5nZS5zZWxlY3RUYXJnZXQoZW50aXR5KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUeXBlT2ZSYW5nZSgpOiBFbnRpdHlSYW5nZVR5cGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eV9yYW5nZS50eXBlO1xyXG4gICAgfVxyXG59XHJcbiIsImVudW0gQWxsaWFuY2Uge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBCbHVlID0gMSxcclxuICAgIFJlZCA9IDJcclxufVxyXG5jbGFzcyBUaWxlTWFuYWdlciB7XHJcblxyXG4gICAgbWFwOiBNYXA7XHJcbiAgICB3YXRlclN0YXRlOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHRpbGVtYXA6IFBoYXNlci5UaWxlbWFwO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuXHJcbiAgICBiYWNrZ3JvdW5kTGF5ZXI6IFBoYXNlci5UaWxlbWFwTGF5ZXI7XHJcbiAgICBidWlsZGluZ0xheWVyOiBQaGFzZXIuVGlsZW1hcExheWVyO1xyXG5cclxuICAgIHdhdGVyVGltZXI6IG51bWJlciA9IDA7XHJcblxyXG4gICAgc3RhdGljIGRvZXNUaWxlQ3V0R3Jhc3ModGlsZTogVGlsZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAodGlsZSA9PSBUaWxlLlBhdGggfHwgdGlsZSA9PSBUaWxlLldhdGVyIHx8IHRpbGUgPT0gVGlsZS5CcmlkZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRJbWFnZUluZGV4Rm9yT2JqZWN0VGlsZSh0aWxlOiBUaWxlKTogbnVtYmVyIHtcclxuXHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Nb3VudGFpbikge1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Gb3Jlc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuSGlsbCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Ib3VzZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTICsgMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRCYXNlSW1hZ2VJbmRleEZvclRpbGUodGlsZTogVGlsZSk6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoICh0aWxlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyMTtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxOTtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLlBhdGg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTg7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBUaWxlTWFuYWdlci5nZXRJbWFnZUluZGV4Rm9yT2JqZWN0VGlsZSh0aWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIHRpbGVtYXA6IFBoYXNlci5UaWxlbWFwLCB0aWxlbWFwX2dyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgICB0aGlzLnRpbGVtYXAgPSB0aWxlbWFwO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSB0aWxlbWFwX2dyb3VwO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVtYXAuYWRkVGlsZXNldEltYWdlKFwidGlsZXMwXCIsIG51bGwsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBudWxsLCBudWxsLCAwKTtcclxuICAgICAgICB0aGlzLnRpbGVtYXAuYWRkVGlsZXNldEltYWdlKFwiYnVpbGRpbmdzXzBcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyk7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwLmFkZFRpbGVzZXRJbWFnZShcImJ1aWxkaW5nc18xXCIsIG51bGwsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBudWxsLCBudWxsLCBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMgKyAzKTtcclxuICAgICAgICB0aGlzLnRpbGVtYXAuYWRkVGlsZXNldEltYWdlKFwiYnVpbGRpbmdzXzJcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyArIDYpO1xyXG5cclxuICAgICAgICB0aGlzLmJhY2tncm91bmRMYXllciA9IHRoaXMudGlsZW1hcC5jcmVhdGUoXCJiYWNrZ3JvdW5kXCIsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCB0aGlzLmdyb3VwKTtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRMYXllci5yZXNpemVXb3JsZCgpO1xyXG5cclxuICAgICAgICB0aGlzLmJ1aWxkaW5nTGF5ZXIgPSB0aGlzLnRpbGVtYXAuY3JlYXRlQmxhbmtMYXllcihcImJ1aWxkaW5nXCIsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCB0aGlzLmdyb3VwKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMubWFwLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLm1hcC5oZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3VGlsZUF0KG5ldyBQb3MoeCwgeSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMud2F0ZXJUaW1lciArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy53YXRlclRpbWVyID4gMzApIHtcclxuICAgICAgICAgICAgdGhpcy53YXRlclRpbWVyID0gMDtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVXYXRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlV2F0ZXIoKSB7XHJcbiAgICAgICAgbGV0IG9sZFN0YXRlID0gdGhpcy53YXRlclN0YXRlO1xyXG4gICAgICAgIHRoaXMud2F0ZXJTdGF0ZSA9IDEgLSB0aGlzLndhdGVyU3RhdGU7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZW1hcC5yZXBsYWNlKDIxICsgb2xkU3RhdGUsIDIxICsgdGhpcy53YXRlclN0YXRlLCAwLCAwLCB0aGlzLm1hcC53aWR0aCwgdGhpcy5tYXAuaGVpZ2h0LCB0aGlzLmJhY2tncm91bmRMYXllcik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd1RpbGVBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUodGhpcy5nZXRJbWFnZUluZGV4Rm9yQmFja2dyb3VuZEF0KHBvc2l0aW9uKSwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIpO1xyXG4gICAgICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgb2JqID0gVGlsZU1hbmFnZXIuZ2V0SW1hZ2VJbmRleEZvck9iamVjdFRpbGUodGlsZSk7XHJcbiAgICAgICAgaWYgKG9iaiA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGFsbGlhbmNlID0gdGhpcy5tYXAuZ2V0QWxsaWFuY2VBdChwb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICBvYmogKz0gYWxsaWFuY2UgKiAzO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5DYXN0bGUgJiYgcG9zaXRpb24ueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyByb29mIG9mIGNhc3RsZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGlsZW1hcC5wdXRUaWxlKG9iaiArIDEsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxLCB0aGlzLmJ1aWxkaW5nTGF5ZXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGlsZW1hcC5wdXRUaWxlKG9iaiwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSwgdGhpcy5idWlsZGluZ0xheWVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRJbWFnZUluZGV4Rm9yQmFja2dyb3VuZEF0KHBvc2l0aW9uOiBQb3MpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5tYXAuZ2V0VGlsZUF0KHBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuV2F0ZXI6XHJcbiAgICAgICAgICAgICAgICAvLyBXYXRlclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDIxO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgLy8gQnJpZGdlXHJcbiAgICAgICAgICAgICAgICBsZXQgYWRqID0gdGhpcy5tYXAuZ2V0QWRqYWNlbnRUaWxlc0F0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmIChhZGpbMF0gIT0gVGlsZS5XYXRlciB8fCBhZGpbMl0gIT0gVGlsZS5XYXRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAyMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAxOTtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLlBhdGg6XHJcbiAgICAgICAgICAgICAgICAvLyBQYXRoXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTg7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5HcmFzczpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhvdXNlOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQ2FzdGxlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SW1hZ2VJbmRleEZvckdyYXNzQXQocG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMjtcclxuICAgIH1cclxuICAgIGdldEltYWdlSW5kZXhGb3JHcmFzc0F0KHBvc2l0aW9uOiBQb3MpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBhZGogPSB0aGlzLm1hcC5nZXRBZGphY2VudFRpbGVzQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBjdXQgPSAwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWRqLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGN1dCArPSBNYXRoLnBvdygyLCBpKSAqIChUaWxlTWFuYWdlci5kb2VzVGlsZUN1dEdyYXNzKGFkaltpXSkgPyAxIDogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDQgKyAyICsgMSkgeyByZXR1cm4gMzsgfSAvLyBhbGwgLSBub3Qgc3VwcGxpZWRcclxuICAgICAgICBpZiAoY3V0ID09IDggKyA0ICsgMSkgeyByZXR1cm4gMTY7IH0gLy8gdG9wIGJvdHRvbSBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgNCArIDIpIHsgcmV0dXJuIDEwOyB9IC8vIHJpZ2h0IGJvdHRvbSBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0ICsgMiArIDEpIHsgcmV0dXJuIDE3OyB9IC8vIHRvcCByaWdodCBib3R0b21cclxuICAgICAgICBpZiAoY3V0ID09IDggKyAyICsgMSkgeyByZXR1cm4gMTQ7IH0gLy8gdG9wIHJpZ2h0IGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDEgKyA4KSB7IHJldHVybiAxMjsgfSAvLyB0b3AgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gNCArIDgpIHsgcmV0dXJuIDg7IH0gLy8gYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDIgKyA0KSB7IHJldHVybiA5OyB9IC8vIHJpZ2h0IGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMSArIDIpIHsgcmV0dXJuIDEzOyB9IC8vIHRvcCByaWdodFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSArIDQpIHsgcmV0dXJuIDE1OyB9IC8vIHRvcCBib3R0b21cclxuICAgICAgICBpZiAoY3V0ID09IDIgKyA4KSB7IHJldHVybiA2OyB9IC8vIHJpZ2h0IGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDgpIHsgcmV0dXJuIDQ7IH0gLy8gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gNCkgeyByZXR1cm4gNzsgfSAvLyBib3R0b21cclxuICAgICAgICBpZiAoY3V0ID09IDIpIHsgcmV0dXJuIDU7IH0gLy8gcmlnaHRcclxuICAgICAgICBpZiAoY3V0ID09IDEpIHsgcmV0dXJuIDExOyB9IC8vIHRvcFxyXG4gICAgICAgIHJldHVybiAzO1xyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBFbnRpdHlNYW5hZ2VyRGVsZWdhdGUge1xyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSk6IHZvaWQ7XHJcbiAgICBlbnRpdHlEaWRBbmltYXRpb24oZW50aXR5OiBFbnRpdHkpOiB2b2lkO1xyXG59XHJcblxyXG5jbGFzcyBFbnRpdHlNYW5hZ2VyIHtcclxuXHJcbiAgICBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlO1xyXG5cclxuICAgIHByaXZhdGUgbWFwOiBNYXA7XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltX2lkbGVfc3RhdGU6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGVudGl0eV9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgaW50ZXJhY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgYW5pbV9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0aW9uX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGludGVyYWN0aW9uX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIHNob3dfcmFuZ2U6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGVudGl0eV9ncm91cDogUGhhc2VyLkdyb3VwLCBzZWxlY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cCwgaW50ZXJhY3Rpb25fZ3JvdXA6IFBoYXNlci5Hcm91cCwgYW5pbV9ncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlKSB7XHJcblxyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwID0gZW50aXR5X2dyb3VwO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0aW9uX2dyb3VwID0gc2VsZWN0aW9uX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAgPSBpbnRlcmFjdGlvbl9ncm91cDtcclxuICAgICAgICB0aGlzLmFuaW1fZ3JvdXAgPSBhbmltX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MgPSBzZWxlY3Rpb25fZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgc2VsZWN0aW9uX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzID0gaW50ZXJhY3Rpb25fZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgaW50ZXJhY3Rpb25fZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1faWRsZV9zdGF0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5tYXAuZW50aXR5X3JhbmdlLmluaXQodGhpcy5pbnRlcmFjdGlvbl9ncm91cCk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLm1hcC5lbnRpdGllcykge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0RW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgLy8gbW92ZSBzZWxlY3RlZCBlbnRpdHkgaW4gYSBoaWdoZXIgZ3JvdXBcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5yZW1vdmUoZW50aXR5LnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAucmVtb3ZlKGVudGl0eS5pY29uX2hlYWx0aCk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5hZGQoZW50aXR5LnNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cC5hZGQoZW50aXR5Lmljb25faGVhbHRoKTtcclxuICAgIH1cclxuICAgIGRlc2VsZWN0RW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgLy8gbW92ZSBzZWxlY3RlZCBlbnRpdHkgYmFjayB0byBhbGwgb3RoZXIgZW50aXRpZXNcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLnJlbW92ZShlbnRpdHkuc3ByaXRlKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLnJlbW92ZShlbnRpdHkuaWNvbl9oZWFsdGgpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwLmFkZEF0KGVudGl0eS5pY29uX2hlYWx0aCwgMCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAuYWRkQXQoZW50aXR5LnNwcml0ZSwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd1JhbmdlKCkge1xyXG4gICAgICAgIHRoaXMuc2hvd19yYW5nZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5tYXAuZW50aXR5X3JhbmdlLmRyYXcodGhpcy5zZWxlY3Rpb25fZ3JhcGhpY3MpO1xyXG4gICAgfVxyXG4gICAgaGlkZVJhbmdlKCkge1xyXG4gICAgICAgIHRoaXMuc2hvd19yYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubWFwLmVudGl0eV9yYW5nZS5jbGVhcih0aGlzLnNlbGVjdGlvbl9ncmFwaGljcywgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIsIGN1cnNvcl9wb3NpdGlvbjogUG9zLCBhbmltX3N0YXRlOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMubWFwLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1faWRsZV9zdGF0ZSAhPSBhbmltX3N0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuc2V0RnJhbWUodGhpcy5hbmltX2lkbGVfc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudGl0eS51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFuaW1faWRsZV9zdGF0ZSA9IGFuaW1fc3RhdGU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3dfcmFuZ2UpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXAuZW50aXR5X3JhbmdlLnVwZGF0ZShzdGVwcywgY3Vyc29yX3Bvc2l0aW9uLCBhbmltX3N0YXRlLCB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcywgdGhpcy5pbnRlcmFjdGlvbl9ncmFwaGljcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG5cclxuICAgICAgICAtLS0tLSBSQU5HRVxyXG5cclxuICAgICAqL1xyXG5cclxuICAgIGFuaW1hdGlvbkRpZEVuZChhbmltYXRpb246IEVudGl0eUFuaW1hdGlvbikge1xyXG4gICAgICAgIGFuaW1hdGlvbi5lbnRpdHkuYW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICBzd2l0Y2ggKGFuaW1hdGlvbi50eXBlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5QW5pbWF0aW9uVHlwZS5BdHRhY2s6XHJcbiAgICAgICAgICAgICAgICBsZXQgYXR0YWNrID0gPEF0dGFja0FuaW1hdGlvbj4gYW5pbWF0aW9uO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2suZmlyc3QgJiYgYXR0YWNrLmVudGl0eS5zaG91bGRDb3VudGVyKGF0dGFjay5hdHRhY2tlci5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmF0dGFja0VudGl0eShhdHRhY2suZW50aXR5LCBhdHRhY2suYXR0YWNrZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGF0dGFja2VyID0gYXR0YWNrLmZpcnN0ID8gYXR0YWNrLmF0dGFja2VyIDogYXR0YWNrLmVudGl0eTtcclxuICAgICAgICAgICAgICAgIGxldCB0YXJnZXQgPSBhdHRhY2suZmlyc3QgPyBhdHRhY2suZW50aXR5IDogYXR0YWNrLmF0dGFja2VyO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZXIuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5Qb2lzb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnNldFN0YXR1cyhFbnRpdHlTdGF0dXMuUG9pc29uZWQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5zdGF0dXNfYW5pbWF0aW9uID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2tlci5zaG91bGRSYW5rVXAoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF0dGFja2VyLnN0YXR1c19hbmltYXRpb24gPSAyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5zaG91bGRSYW5rVXAoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhcmdldC5zdGF0dXNfYW5pbWF0aW9uID0gMjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZXIuaXNEZWFkKCkgfHwgYXR0YWNrZXIuc3RhdHVzX2FuaW1hdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNrZXIuc3RhcnRBbmltYXRpb24obmV3IFN0YXR1c0FuaW1hdGlvbihhdHRhY2tlciwgdGhpcywgdGhpcy5hbmltX2dyb3VwLCBhdHRhY2tlci5pc0RlYWQoKSA/IC0xIDogYXR0YWNrZXIuc3RhdHVzX2FuaW1hdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5pc0RlYWQoKSB8fCB0YXJnZXQuc3RhdHVzX2FuaW1hdGlvbiA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnN0YXJ0QW5pbWF0aW9uKG5ldyBTdGF0dXNBbmltYXRpb24odGFyZ2V0LCB0aGlzLCB0aGlzLmFuaW1fZ3JvdXAsIHRhcmdldC5pc0RlYWQoKSA/IC0xIDogdGFyZ2V0LnN0YXR1c19hbmltYXRpb24pKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZW50aXR5RGlkQW5pbWF0aW9uKGF0dGFjay5lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5QW5pbWF0aW9uVHlwZS5TdGF0dXM6XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb24uZW50aXR5LnN0YXR1c19hbmltYXRpb24gPSAtMTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eUFuaW1hdGlvblR5cGUuUmFpc2U6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmVudGl0eURpZEFuaW1hdGlvbihhbmltYXRpb24uZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93V2lzcGVkKCkge1xyXG4gICAgICAgIGZvciAobGV0IGVudGl0eSBvZiB0aGlzLm1hcC5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnN0YXR1cyAhPSBFbnRpdHlTdGF0dXMuV2lzcGVkKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmICghIWVudGl0eS5hbmltYXRpb24pIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgZW50aXR5LnN0YXJ0QW5pbWF0aW9uKG5ldyBTdGF0dXNBbmltYXRpb24oZW50aXR5LCB0aGlzLCB0aGlzLmFuaW1fZ3JvdXAsIDEpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXR0YWNrRW50aXR5KGF0dGFja2VyOiBFbnRpdHksIHRhcmdldDogRW50aXR5LCBmaXJzdDogYm9vbGVhbiA9IHRydWUpIHtcclxuICAgICAgICBhdHRhY2tlci5hdHRhY2sodGFyZ2V0LCB0aGlzLm1hcCk7XHJcbiAgICAgICAgdGFyZ2V0LnN0YXJ0QW5pbWF0aW9uKG5ldyBBdHRhY2tBbmltYXRpb24odGFyZ2V0LCB0aGlzLCB0aGlzLmFuaW1fZ3JvdXAsIGF0dGFja2VyLCBmaXJzdCkpO1xyXG4gICAgfVxyXG4gICAgcmFpc2VFbnRpdHkod2l6YXJkOiBFbnRpdHksIHRvbWI6IEVudGl0eSkge1xyXG4gICAgICAgIHRvbWIuc3RhcnRBbmltYXRpb24obmV3IFJhaXNlQW5pbWF0aW9uKHRvbWIsIHRoaXMsIHRoaXMuYW5pbV9ncm91cCwgd2l6YXJkLmFsbGlhbmNlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlRW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgZW50aXR5LmluaXQodGhpcy5lbnRpdHlfZ3JvdXApO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFNtb2tlIGV4dGVuZHMgU3ByaXRlIHtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9zLCBncm91cDogUGhhc2VyLkdyb3VwLCBuYW1lOiBzdHJpbmcsIGZyYW1lczogbnVtYmVyW10pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgICAgICBzdXBlci5pbml0KG5ldyBQb3MocG9zaXRpb24ueCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSArIDE2LCBwb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKSwgZ3JvdXAsIG5hbWUsIGZyYW1lcyk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNtb2tlLnRzXCIgLz5cclxuXHJcbmNsYXNzIFNtb2tlTWFuYWdlciB7XHJcbiAgICBzbW9rZTogU21va2VbXTtcclxuICAgIG1hcDogTWFwO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuXHJcbiAgICBhbmltX3Nsb3c6IG51bWJlcjtcclxuICAgIGFuaW1fc3RhdGU6IG51bWJlcjtcclxuICAgIGFuaW1fb2Zmc2V0OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9zbG93ID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9vZmZzZXQgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnNtb2tlID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaG91c2Ugb2YgbWFwLmdldE9jY3VwaWVkSG91c2VzKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTbW9rZShob3VzZS5wb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY3JlYXRlU21va2UobmV3IFBvcygzLCAxMykpO1xyXG4gICAgfVxyXG4gICAgY3JlYXRlU21va2UocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIHRoaXMuc21va2UucHVzaChuZXcgU21va2UocG9zaXRpb24sIHRoaXMuZ3JvdXAsIFwiYl9zbW9rZVwiLCBbMCwgMSwgMiwgM10pKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9zbG93ICs9IHN0ZXBzO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1fc2xvdyA8IDUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmFuaW1fc2xvdyA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9vZmZzZXQrKztcclxuICAgICAgICBpZiAodGhpcy5hbmltX29mZnNldCA+IDI3KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9vZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDIyICYmIHRoaXMuYW5pbV9zdGF0ZSA9PSAzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDQ7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDE3ICYmIHRoaXMuYW5pbV9zdGF0ZSA9PSAyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDM7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMTIgJiYgdGhpcy5hbmltX3N0YXRlID09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMjtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiA3ICYmIHRoaXMuYW5pbV9zdGF0ZSA9PSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBzbW9rZSBvZiB0aGlzLnNtb2tlKSB7XHJcbiAgICAgICAgICAgIHNtb2tlLnNldEZyYW1lKHRoaXMuYW5pbV9zdGF0ZSk7XHJcbiAgICAgICAgICAgIHNtb2tlLndvcmxkX3Bvc2l0aW9uLnkgPSBzbW9rZS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gdGhpcy5hbmltX29mZnNldCAtIDI7XHJcbiAgICAgICAgICAgIHNtb2tlLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZyYW1lLnRzXCIgLz5cclxuXHJcbmNsYXNzIEZyYW1lTWFuYWdlciBpbXBsZW1lbnRzIEZyYW1lRGVsZWdhdGUge1xyXG4gICAgZnJhbWVzOiBGcmFtZVtdO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gW107XHJcbiAgICB9XHJcbiAgICBhZGRGcmFtZShmcmFtZTogRnJhbWUpIHtcclxuICAgICAgICBmcmFtZS5kZWxlZ2F0ZSA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChmcmFtZSk7XHJcbiAgICB9XHJcbiAgICByZW1vdmVGcmFtZShmcmFtZTogRnJhbWUpIHtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZnJhbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChmcmFtZSA9PSB0aGlzLmZyYW1lc1tpXSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIGZvciAobGV0IGZyYW1lIG9mIHRoaXMuZnJhbWVzKSB7XHJcbiAgICAgICAgICAgIGZyYW1lLnVwZGF0ZShzdGVwcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnJhbWVXaWxsRGVzdHJveShmcmFtZTogRnJhbWUpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUZyYW1lKGZyYW1lKTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZnJhbWUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiYWVmb250LnRzXCIgLz5cclxuXHJcbmludGVyZmFjZSBNZW51RGVsZWdhdGUge1xyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KTogdm9pZDtcclxuICAgIGNsb3NlTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpOiB2b2lkO1xyXG59XHJcbmNsYXNzIE1lbnVHb2xkSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBnb2xkX2Ftb3VudDogQUVGb250O1xyXG4gICAgaGVhZF9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgaGVhZF9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg2NCwgNDAsIGdyb3VwLCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgLy8gZHJhdyBjb250ZW50XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudChhbGxpYW5jZTogQWxsaWFuY2UsIGdvbGQ6IG51bWJlcikge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvcm1hdGlvbiBpbnNpZGUgbWVudVxyXG5cclxuICAgICAgICBsZXQgY29sb3I6IG51bWJlcjtcclxuICAgICAgICBsZXQgZnJhbWU6IG51bWJlcjtcclxuICAgICAgICBsZXQgeDogbnVtYmVyO1xyXG4gICAgICAgIGlmIChhbGxpYW5jZSA9PSBBbGxpYW5jZS5CbHVlKSB7XHJcbiAgICAgICAgICAgIGNvbG9yID0gMHgwMDAwZmY7XHJcbiAgICAgICAgICAgIGZyYW1lID0gMDtcclxuICAgICAgICAgICAgeCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29sb3IgPSAweGZmMDAwMDtcclxuICAgICAgICAgICAgZnJhbWUgPSAxO1xyXG4gICAgICAgICAgICB4ID0gMjU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuYmVnaW5GaWxsKGNvbG9yKTtcclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMTcsIHRoaXMud2lkdGggLSA2LCAxNyk7XHJcbiAgICAgICAgdGhpcy5oZWFkX2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuXHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24uZnJhbWUgPSBmcmFtZTtcclxuICAgICAgICB0aGlzLmhlYWRfaWNvbi54ID0geDtcclxuXHJcbiAgICAgICAgdGhpcy5nb2xkX2Ftb3VudC5zZXRUZXh0KGdvbGQudG9TdHJpbmcoKSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIC8vIGluaXRpYWxpemUgY29udGVudCAoc3ByaXRlcywgdGV4dCBldGMpXHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcyA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgyLCAyLCBcImdvbGRcIiwgbnVsbCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLmhlYWRfaWNvbiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMCwgMTYsIFwicG9ydHJhaXRcIiwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICBsZXQgaGVhZF9jcm9wID0gbmV3IFBoYXNlci5SZWN0YW5nbGUoMCwgMTAsIHRoaXMuaGVhZF9pY29uLndpZHRoLCAxOCk7XHJcbiAgICAgICAgdGhpcy5oZWFkX2ljb24uY3JvcChoZWFkX2Nyb3ApO1xyXG5cclxuICAgICAgICB0aGlzLmdvbGRfYW1vdW50ID0gbmV3IEFFRm9udCgyOCwgNSwgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuXHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lbnVEZWZJbmZvIGV4dGVuZHMgRnJhbWUge1xyXG4gICAgcHJpdmF0ZSB0aWxlX2ljb246IFBoYXNlci5JbWFnZTtcclxuICAgIHByaXZhdGUgZGVmX2Ftb3VudDogQUVGb250O1xyXG4gICAgcHJpdmF0ZSBlbnRpdHlfaWNvbjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBzdGF0dXNfaWNvbnM6IFBoYXNlci5JbWFnZVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoNDAsIDUyLCBncm91cCwgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgIC8vIGRyYXcgY29udGVudFxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQocG9zaXRpb246IFBvcywgbWFwOiBNYXApIHtcclxuICAgICAgICAvLyB1cGRhdGUgaW5mb3JtYXRpb24gaW5zaWRlIG1lbnVcclxuXHJcbiAgICAgICAgbGV0IHRpbGUgPSBtYXAuZ2V0VGlsZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBsZXQgZW50aXR5ID0gbWFwLmdldEVudGl0eUF0KHBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgIGxldCBhbGxpYW5jZSA9IG1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGlsZV9pY29uLmtleSAhPSBcImJ1aWxkaW5nc19cIiArICg8bnVtYmVyPiBhbGxpYW5jZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGlsZV9pY29uLmxvYWRUZXh0dXJlKFwiYnVpbGRpbmdzX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aWxlX2ljb24uZnJhbWUgPSB0aWxlID09IFRpbGUuSG91c2UgPyAwIDogMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aWxlX2ljb24ua2V5ICE9IFwidGlsZXMwXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudGlsZV9pY29uLmxvYWRUZXh0dXJlKFwidGlsZXMwXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMudGlsZV9pY29uLmZyYW1lID0gVGlsZU1hbmFnZXIuZ2V0QmFzZUltYWdlSW5kZXhGb3JUaWxlKHRpbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kZWZfYW1vdW50LnNldFRleHQoTWFwLmdldERlZkZvclRpbGUodGlsZSwgZW50aXR5ID8gZW50aXR5LnR5cGUgOiB1bmRlZmluZWQpLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgICBpZiAoISFlbnRpdHkgJiYgIWVudGl0eS5pc0RlYWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNpemUoNjgsIDUyKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZW50aXR5X2ljb24ua2V5ICE9IFwidW5pdF9pY29uc19cIiArIGVudGl0eS5hbGxpYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi5sb2FkVGV4dHVyZShcInVuaXRfaWNvbnNfXCIgKyBlbnRpdHkuYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X2ljb24uZnJhbWUgPSBlbnRpdHkudHlwZTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVNpemUoNDAsIDUyKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0U3RhdHVzSWNvbnMoZW50aXR5KTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBjb250ZW50IChzcHJpdGVzLCB0ZXh0IGV0YylcclxuXHJcbiAgICAgICAgbGV0IHRpbGVfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGlsZV9ncmFwaGljcy5saW5lU3R5bGUoMSwgMHgwMDAwMDApO1xyXG4gICAgICAgIHRpbGVfZ3JhcGhpY3MuZHJhd1JlY3QoNiwgMiwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gMSk7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9pY29uID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg3LCAzLCBcInRpbGVzMFwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIGxldCB0aWxlX2Nyb3AgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZSgxLCAxLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAyLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAyKTtcclxuICAgICAgICB0aGlzLnRpbGVfaWNvbi5jcm9wKHRpbGVfY3JvcCk7XHJcblxyXG4gICAgICAgIGxldCBkZWZfZm9udCA9IG5ldyBBRUZvbnQoNywgMjgsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcbiAgICAgICAgZGVmX2ZvbnQuc2V0VGV4dChcIkRFRlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy5kZWZfYW1vdW50ID0gbmV3IEFFRm9udCgxNCwgMzcsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDM1LCAyLCBcInVuaXRfaWNvbnNfMVwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X2ljb24udmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1c19pY29ucyA9IFtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgzMSwgMjIsIFwic3RhdHVzXCIsIDIsIHRoaXMuY29udGVudF9ncm91cCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMzksIDIyLCBcInN0YXR1c1wiLCAyLCB0aGlzLmNvbnRlbnRfZ3JvdXApLFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDQ3LCAyMiwgXCJzdGF0dXNcIiwgMiwgdGhpcy5jb250ZW50X2dyb3VwKSxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgzMSwgMzIsIFwic3RhdHVzXCIsIDAsIHRoaXMuY29udGVudF9ncm91cCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNDYsIDMyLCBcInN0YXR1c1wiLCAxLCB0aGlzLmNvbnRlbnRfZ3JvdXApXHJcbiAgICAgICAgXTtcclxuICAgICAgICB0aGlzLnNldFN0YXR1c0ljb25zKG51bGwpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBzZXRTdGF0dXNJY29ucyhlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzBdLnZpc2libGUgPSAoZW50aXR5ICYmIGVudGl0eS5yYW5rID4gMCkgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zdGF0dXNfaWNvbnNbMV0udmlzaWJsZSA9IChlbnRpdHkgJiYgZW50aXR5LnJhbmsgPiAxKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1c19pY29uc1syXS52aXNpYmxlID0gKGVudGl0eSAmJiBlbnRpdHkucmFuayA+IDIpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1c19pY29uc1szXS52aXNpYmxlID0gKGVudGl0eSAmJiBlbnRpdHkuc3RhdHVzICE9IEVudGl0eVN0YXR1cy5Ob25lKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1c19pY29uc1szXS5mcmFtZSA9IChlbnRpdHkgJiYgKGVudGl0eS5zdGF0dXMgJiBFbnRpdHlTdGF0dXMuUG9pc29uZWQpICE9IDApID8gMCA6IDE7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzRdLnZpc2libGUgPSAoZW50aXR5ICYmIGVudGl0eS5zdGF0dXMgPT0gKEVudGl0eVN0YXR1cy5XaXNwZWQgfCBFbnRpdHlTdGF0dXMuUG9pc29uZWQpKSA/IHRydWUgOiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5lbnVtIEFjdGlvbiB7XHJcbiAgICBOb25lLFxyXG4gICAgTUFJTl9NRU5VLFxyXG4gICAgTU9WRSxcclxuICAgIEFUVEFDSyxcclxuICAgIEJVWSxcclxuICAgIEVORF9NT1ZFLFxyXG4gICAgQ0FOQ0VMLFxyXG4gICAgRU5EX1RVUk4sXHJcbiAgICBPQ0NVUFksXHJcbiAgICBSQUlTRSxcclxuICAgIE1BUCxcclxuICAgIE9CSkVDVElWRSxcclxuICAgIE5FV19HQU1FLFxyXG4gICAgU0VMRUNUX0xFVkVMLFxyXG4gICAgU0FWRV9HQU1FLFxyXG4gICAgTE9BRF9HQU1FLFxyXG4gICAgU0tJUk1JU0gsXHJcbiAgICBTRVRUSU5HUyxcclxuICAgIElOU1RSVUNUSU9OUyxcclxuICAgIEFCT1VULFxyXG4gICAgRVhJVFxyXG59XHJcbmNsYXNzIE1lbnVPcHRpb25zIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIHNlbGVjdGVkOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBvcHRpb25zOiBBY3Rpb25bXTtcclxuICAgIHByaXZhdGUgZm9udHM6IFBoYXNlci5CaXRtYXBUZXh0W107XHJcbiAgICBwcml2YXRlIHBvaW50ZXI6IFBoYXNlci5JbWFnZTtcclxuICAgIHByaXZhdGUgcG9pbnRlcl9zdGF0ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZTtcclxuXHJcbiAgICBzdGF0aWMgZ2V0TWFpbk1lbnVPcHRpb25zKGluZ2FtZTogYm9vbGVhbik6IEFjdGlvbltdIHtcclxuICAgICAgICBsZXQgb3B0aW9uczogQWN0aW9uW107XHJcbiAgICAgICAgaWYgKGluZ2FtZSkge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gW0FjdGlvbi5TQVZFX0dBTUUsIEFjdGlvbi5MT0FEX0dBTUUsIEFjdGlvbi5JTlNUUlVDVElPTlMsIEFjdGlvbi5BQk9VVCwgQWN0aW9uLkVYSVRdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBbQWN0aW9uLk5FV19HQU1FLCBBY3Rpb24uTE9BRF9HQU1FLCBBY3Rpb24uU0tJUk1JU0gsIEFjdGlvbi5JTlNUUlVDVElPTlMsIEFjdGlvbi5BQk9VVCwgQWN0aW9uLkVYSVRdO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb3B0aW9ucztcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRPZmZNZW51T3B0aW9ucygpOiBBY3Rpb25bXSB7XHJcbiAgICAgICAgcmV0dXJuIFtBY3Rpb24uRU5EX1RVUk4sIEFjdGlvbi5NQVAsIEFjdGlvbi5PQkpFQ1RJVkUsIEFjdGlvbi5NQUlOX01FTlVdO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE9wdGlvblN0cmluZyhvcHRpb246IEFjdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgaWYgKG9wdGlvbiA9PSBBY3Rpb24uTm9uZSkgeyByZXR1cm4gXCJcIjsgfVxyXG4gICAgICAgIGlmIChvcHRpb24gPj0gMTIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEFuY2llbnRFbXBpcmVzLkxBTkdbKDxudW1iZXI+IG9wdGlvbiAtIDEyICsgMSldO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuTEFOR1syNiArIDxudW1iZXI+IG9wdGlvbl07XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3RvciAoZ3JvdXA6IFBoYXNlci5Hcm91cCwgYWxpZ246IERpcmVjdGlvbiwgb3B0aW9uczogQWN0aW9uW10sIGRlbGVnYXRlOiBNZW51RGVsZWdhdGUsIGFuaW1fZGlyZWN0aW9uPzogRGlyZWN0aW9uKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKCFhbmltX2RpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBhbmltX2RpcmVjdGlvbiA9IGFsaWduO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBtYXhfbGVuZ3RoID0gMDtcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbik7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG1heF9sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAqIDEzICsgMTY7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gbWF4X2xlbmd0aCAqIDcgKyAzMSArIDEzO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUod2lkdGgsIGhlaWdodCwgZ3JvdXAsIGFsaWduLCBEaXJlY3Rpb24uQWxsICYgfmFsaWduLCBhbmltX2RpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIGxldCB5ID0gNTtcclxuICAgICAgICB0aGlzLmZvbnRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgb3B0aW9uIG9mIHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgdGV4dCA9IE1lbnVPcHRpb25zLmdldE9wdGlvblN0cmluZyhvcHRpb24pO1xyXG4gICAgICAgICAgICBsZXQgZm9udCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgyNSwgeSwgXCJmb250N1wiLCB0ZXh0LCA3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmZvbnRzLnB1c2goZm9udCk7XHJcbiAgICAgICAgICAgIHkgKz0gMTM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXIgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDQsIDQsIFwicG9pbnRlclwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zdGF0ZSA9IDI7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG5cclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLmNsb3NlTWVudShJbnB1dENvbnRleHQuT3B0aW9ucyk7IH1cclxuICAgICAgICBzdXBlci5oaWRlKGFuaW1hdGUsIGRlc3Ryb3lfb25fZmluaXNoLCB1cGRhdGVfb25fZmluaXNoKTtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBvZmZzZXRfeTogbnVtYmVyID0gMCkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUub3Blbk1lbnUoSW5wdXRDb250ZXh0Lk9wdGlvbnMpOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlLCBvZmZzZXRfeSk7XHJcbiAgICB9XHJcbiAgICBuZXh0KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQrKztcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA+PSB0aGlzLm9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXYoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkIDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0U2VsZWN0ZWQoKTogQWN0aW9uIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRdO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdysrO1xyXG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJfc2xvdyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMiAtIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlci55ID0gNCArIHRoaXMuc2VsZWN0ZWQgKiAxMztcclxuICAgICAgICB0aGlzLnBvaW50ZXIueCA9IDQgKyB0aGlzLnBvaW50ZXJfc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lbnVTZWxlY3QgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgc2VsZWN0ZWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG9wdGlvbnM6IHN0cmluZ1tdO1xyXG4gICAgcHJpdmF0ZSBmb250czogUGhhc2VyLkJpdG1hcFRleHRbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChvcHRpb25zOiBzdHJpbmdbXSwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSwgYWxpZ246IERpcmVjdGlvbiwgYW5pbV9kaXJlY3Rpb24/OiBEaXJlY3Rpb24pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLm1lbnVfZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gMDtcclxuXHJcbiAgICAgICAgbGV0IG1heF9sZW5ndGggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IHRleHQgb2YgdGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGlmICh0ZXh0Lmxlbmd0aCA+IG1heF9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIG1heF9sZW5ndGggPSB0ZXh0Lmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLmxlbmd0aCAqIDEzICsgMTY7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gbWF4X2xlbmd0aCAqIDcgKyAzMSArIDEzO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUod2lkdGgsIGhlaWdodCwgZ3JvdXAsIGFsaWduLCBEaXJlY3Rpb24uQWxsICYgfmFsaWduLCBhbmltX2RpcmVjdGlvbik7XHJcblxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIGRyYXdDb250ZW50KCkge1xyXG4gICAgICAgIGxldCB5ID0gNTtcclxuICAgICAgICB0aGlzLmZvbnRzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgdGV4dCBvZiB0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IGZvbnQgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoMjUsIHksIFwiZm9udDdcIiwgdGV4dCwgNywgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5mb250cy5wdXNoKGZvbnQpO1xyXG4gICAgICAgICAgICB5ICs9IDEzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg0LCA0LCBcInBvaW50ZXJcIiwgbnVsbCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc3RhdGUgPSAyO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuXHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5jbG9zZU1lbnUoSW5wdXRDb250ZXh0Lk9wdGlvbnMpOyB9XHJcbiAgICAgICAgc3VwZXIuaGlkZShhbmltYXRlLCBkZXN0cm95X29uX2ZpbmlzaCwgdXBkYXRlX29uX2ZpbmlzaCk7XHJcbiAgICB9XHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgb2Zmc2V0X3k6IG51bWJlciA9IDApIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KElucHV0Q29udGV4dC5PcHRpb25zKTsgfVxyXG4gICAgICAgIHN1cGVyLnNob3coYW5pbWF0ZSwgb2Zmc2V0X3kpO1xyXG4gICAgfVxyXG4gICAgbmV4dCgpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkKys7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPj0gdGhpcy5vcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcmV2KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQtLTtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IHRoaXMub3B0aW9ucy5sZW5ndGggLSAxO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFNlbGVjdGVkKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1t0aGlzLnNlbGVjdGVkXTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIudXBkYXRlKHN0ZXBzKTtcclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3crKztcclxuICAgICAgICBpZiAodGhpcy5wb2ludGVyX3Nsb3cgPiAxMCkge1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zdGF0ZSA9IDIgLSB0aGlzLnBvaW50ZXJfc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXIueSA9IDQgKyB0aGlzLnNlbGVjdGVkICogMTM7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnggPSA0ICsgdGhpcy5wb2ludGVyX3N0YXRlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBOb3RpZmljYXRpb24gZXh0ZW5kcyBGcmFtZSB7XHJcbiAgICBwcml2YXRlIGZvbnQ6IFBoYXNlci5CaXRtYXBUZXh0O1xyXG4gICAgcHJpdmF0ZSBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGdyb3VwOiBQaGFzZXIuR3JvdXAsIHRleHQ6IHN0cmluZywgZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudV9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG5cclxuICAgICAgICB0aGlzLmZvbnQgPSBncm91cC5nYW1lLmFkZC5iaXRtYXBUZXh0KDksIDUsIFwiZm9udDdcIiwgdGV4dCwgNyk7XHJcbiAgICAgICAgdGhpcy5mb250LnVwZGF0ZVRyYW5zZm9ybSgpO1xyXG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuZm9udC50ZXh0V2lkdGggKyAzMDtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemUod2lkdGgsIDI5LCBncm91cCwgRGlyZWN0aW9uLk5vbmUsIERpcmVjdGlvbi5BbGwsIERpcmVjdGlvbi5Ob25lKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAuYWRkKHRoaXMuZm9udCk7XHJcbiAgICB9XHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUub3Blbk1lbnUoSW5wdXRDb250ZXh0LldhaXQpOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIHByb3RlY3RlZCBhbmltYXRpb25EaWRFbmQoYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbikge1xyXG4gICAgICAgIGlmICgoYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uU2hvdykgIT0gMCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgfWVsc2UgaWYgKChhbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5EZXN0cm95KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5XYWl0KTsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWVudVNob3BVbml0cyBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBzZWxlY3RlZDogbnVtYmVyO1xyXG4gICAgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIHByaXZhdGUgZW50aXR5X2ltYWdlczogUGhhc2VyLkltYWdlW107XHJcbiAgICBwcml2YXRlIG1hc2tzOiBQaGFzZXIuSW1hZ2VbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yIChncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogTWVudURlbGVnYXRlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg2NCwgZ3JvdXAuZ2FtZS5oZWlnaHQgLSA0MCwgZ3JvdXAsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgIC8vIGRyYXcgY29udGVudFxyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUNvbnRlbnQoYWxsaWFuY2U6IEFsbGlhbmNlLCBnb2xkOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaW1hZ2Ugb2YgdGhpcy5lbnRpdHlfaW1hZ2VzKSB7XHJcbiAgICAgICAgICAgIGxldCBjb3N0ID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbaV0uY29zdDtcclxuICAgICAgICAgICAgaW1hZ2UubG9hZFRleHR1cmUoXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSwgaW1hZ2UuZnJhbWUpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tzW2ldLnZpc2libGUgPSBjb3N0ID4gZ29sZDtcclxuICAgICAgICAgICAgaSsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldFNlbGVjdGVkKCk6IEVudGl0eVR5cGUge1xyXG4gICAgICAgIHJldHVybiA8RW50aXR5VHlwZT4gdGhpcy5zZWxlY3RlZDtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShJbnB1dENvbnRleHQuU2hvcCk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUpO1xyXG4gICAgfVxyXG4gICAgaGlkZShhbmltYXRlOiBib29sZWFuID0gZmFsc2UsIGRlc3Ryb3lfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UsIHVwZGF0ZV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5TaG9wKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdysrO1xyXG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJfc2xvdyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMiAtIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlci55ID0gNSArIE1hdGguZmxvb3IodGhpcy5zZWxlY3RlZCAvIDIpICogMjk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnggPSAtOSArICh0aGlzLnNlbGVjdGVkICUgMikgKiAyOCArIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgIH1cclxuICAgIHByZXYodmVydGljYWw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtPSAyO1xyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKz0gdGhpcy5lbnRpdHlfaW1hZ2VzLmxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBuZXh0KHZlcnRpY2FsOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKHZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKz0gMjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkID49IHRoaXMuZW50aXR5X2ltYWdlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCAtPSB0aGlzLmVudGl0eV9pbWFnZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X2ltYWdlcyA9IFtdO1xyXG4gICAgICAgIHRoaXMubWFza3MgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5sZW5ndGg7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgbGV0IGRhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLmNvc3QgPiAxMDAwKSB7IGNvbnRpbnVlOyB9XHJcblxyXG4gICAgICAgICAgICBsZXQgeCA9IChpICUgMikgKiAyNyArIDM7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihpIC8gMikgKiAyOSArIDU7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW1hZ2UgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKHgsIHksIFwidW5pdF9pY29uc18xXCIsIGksIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X2ltYWdlcy5wdXNoKGltYWdlKTtcclxuICAgICAgICAgICAgbGV0IG1hc2sgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKHgsIHksIFwibWFza1wiLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tzLnB1c2gobWFzayk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucG9pbnRlciA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNCwgNCwgXCJwb2ludGVyXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMjtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdyA9IDA7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE1lbnVTaG9wSW5mbyBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBwcml2YXRlIHVuaXRfaWNvbjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSB1bml0X25hbWU6IFBoYXNlci5CaXRtYXBUZXh0O1xyXG4gICAgcHJpdmF0ZSB1bml0X2Nvc3Q6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF9hdGs6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF9kZWY6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF9tb3Y6IEFFRm9udDtcclxuICAgIHByaXZhdGUgdW5pdF90ZXh0OiBQaGFzZXIuQml0bWFwVGV4dDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwLCBhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUoZ3JvdXAuZ2FtZS53aWR0aCAtIDY0LCBncm91cC5nYW1lLmhlaWdodCwgZ3JvdXAsIERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLkxlZnQpO1xyXG4gICAgICAgIHRoaXMuZHJhd0NvbnRlbnQoYWxsaWFuY2UpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudCh0eXBlOiBFbnRpdHlUeXBlKSB7XHJcbiAgICAgICAgbGV0IGRhdGE6IEVudGl0eURhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1soPG51bWJlcj4gdHlwZSldO1xyXG4gICAgICAgIHRoaXMudW5pdF9pY29uLmZyYW1lID0gPG51bWJlcj4gdHlwZTtcclxuICAgICAgICB0aGlzLnVuaXRfbmFtZS5zZXRUZXh0KGRhdGEubmFtZS50b1VwcGVyQ2FzZSgpKTtcclxuICAgICAgICB0aGlzLnVuaXRfY29zdC5zZXRUZXh0KGRhdGEuY29zdC50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLnVuaXRfYXRrLnNldFRleHQoZGF0YS5hdGsudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy51bml0X2RlZi5zZXRUZXh0KGRhdGEuZGVmLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMudW5pdF9tb3Yuc2V0VGV4dChkYXRhLm1vdi50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLnVuaXRfdGV4dC5zZXRUZXh0KEFuY2llbnRFbXBpcmVzLkxBTkdbNzUgKyAoPG51bWJlcj4gdHlwZSldKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy51bml0X2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDIsIDIsIFwidW5pdF9pY29uc19cIiArIChhbGxpYW5jZSA9PSBBbGxpYW5jZS5CbHVlID8gMSA6IDIpLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLnVuaXRfbmFtZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgyOSwgNCwgXCJmb250N1wiLCBcIlwiLCA3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMjgsIDEzLCBcImdvbGRcIiwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnVuaXRfY29zdCA9IG5ldyBBRUZvbnQoNTQsIDE2LCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiXCIpO1xyXG5cclxuICAgICAgICBuZXcgQUVGb250KDIsIDMzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiQVRLXCIpO1xyXG4gICAgICAgIHRoaXMudW5pdF9hdGsgPSBuZXcgQUVGb250KDk1LCAzMywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuICAgICAgICBuZXcgQUVGb250KDIsIDQzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiREVGXCIpO1xyXG4gICAgICAgIHRoaXMudW5pdF9kZWYgPSBuZXcgQUVGb250KDk1LCA0MywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuICAgICAgICBuZXcgQUVGb250KDIsIDUzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiTU9WXCIpO1xyXG4gICAgICAgIHRoaXMudW5pdF9tb3YgPSBuZXcgQUVGb250KDk1LCA1MywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkLCBcIlwiKTtcclxuXHJcbiAgICAgICAgdGhpcy51bml0X3RleHQgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoNiwgNjksIFwiZm9udDdcIiwgXCJcIiwgNywgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnVuaXRfdGV4dC5tYXhXaWR0aCA9IHRoaXMuZ3JvdXAuZ2FtZS53aWR0aCAtIDY0IC0gMTg7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImlucHV0LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBsYXllci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhaS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJtYXAudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidGlsZW1hbmFnZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5bWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzbW9rZW1hbmFnZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZnJhbWVtYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1lbnUudHNcIiAvPlxyXG5cclxuZW51bSBJbnB1dENvbnRleHQge1xyXG4gICAgV2FpdCxcclxuICAgIFNob3AsXHJcbiAgICBPcHRpb25zLFxyXG4gICAgTWFwLFxyXG4gICAgU2VsZWN0aW9uLFxyXG4gICAgQW5pbWF0aW9uLFxyXG4gICAgQWNrLFxyXG4gICAgSW5zdHJ1Y3Rpb25zXHJcbn1cclxuaW50ZXJmYWNlIEdhbWVTYXZlIHtcclxuICAgIGNhbXBhaWduOiBib29sZWFuO1xyXG4gICAgbWFwOiBudW1iZXI7XHJcbiAgICBwbGF5ZXJzOiBib29sZWFuW107XHJcblxyXG4gICAgdHVybj86IEFsbGlhbmNlO1xyXG4gICAgZ29sZD86IG51bWJlcltdO1xyXG4gICAgYnVpbGRpbmdzPzogSUJ1aWxkaW5nW107XHJcbiAgICBlbnRpdGllcz86IElFbnRpdHlbXTtcclxuICAgIGN1cnNvcnM/OiBJUG9zW107XHJcbn1cclxuY2xhc3MgR2FtZUNvbnRyb2xsZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUgaW1wbGVtZW50cyBFbnRpdHlNYW5hZ2VyRGVsZWdhdGUsIEludGVyYWN0aW9uRGVsZWdhdGUsIE1lbnVEZWxlZ2F0ZSB7XHJcblxyXG4gICAgbWFwOiBNYXA7XHJcblxyXG4gICAgdGlsZV9tYW5hZ2VyOiBUaWxlTWFuYWdlcjtcclxuICAgIGVudGl0eV9tYW5hZ2VyOiBFbnRpdHlNYW5hZ2VyO1xyXG4gICAgc21va2VfbWFuYWdlcjogU21va2VNYW5hZ2VyO1xyXG4gICAgZnJhbWVfbWFuYWdlcjogRnJhbWVNYW5hZ2VyO1xyXG5cclxuICAgIGZyYW1lX2dvbGRfaW5mbzogTWVudUdvbGRJbmZvO1xyXG4gICAgZnJhbWVfZGVmX2luZm86IE1lbnVEZWZJbmZvO1xyXG5cclxuICAgIHR1cm46IEFsbGlhbmNlO1xyXG4gICAgZ29sZDogbnVtYmVyW107XHJcblxyXG4gICAgcGxheWVyczogSW50ZXJhY3Rpb25bXTtcclxuXHJcbiAgICBjdXJzb3JfdGFyZ2V0OiBQb3M7XHJcbiAgICBjdXJzb3I6IFNwcml0ZTtcclxuICAgIGN1cnNvcl9zdGlsbDogYm9vbGVhbjtcclxuICAgIGNhbWVyYV9zdGlsbDogYm9vbGVhbjtcclxuXHJcbiAgICBnYW1lX292ZXI6IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBhY2M6IG51bWJlciA9IDA7XHJcbiAgICBwcml2YXRlIGxhc3RfY3Vyc29yX3Bvc2l0aW9uOiBQb3M7XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltX2N1cnNvcl9zdGF0ZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBhbmltX2N1cnNvcl9zbG93OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3RlZF9lbnRpdHk6IEVudGl0eTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoc2F2ZTogR2FtZVNhdmUpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG5ldyBNYXAoKHNhdmUuY2FtcGFpZ24gPyBcIm1cIiA6IFwic1wiKSArIHNhdmUubWFwKTtcclxuICAgICAgICB0aGlzLnBsYXllcnMgPSBbXTtcclxuICAgICAgICB0aGlzLmdhbWVfb3ZlciA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQga2V5czogSW5wdXQ7XHJcbiAgICAgICAgbGV0IGFsbGlhbmNlID0gQWxsaWFuY2UuQmx1ZTtcclxuICAgICAgICBmb3IgKGxldCBwIG9mIHNhdmUucGxheWVycykge1xyXG4gICAgICAgICAgICBpZiAocCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFrZXlzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAga2V5cyA9IG5ldyBJbnB1dCh0aGlzLmdhbWUuaW5wdXQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IFBsYXllcihhbGxpYW5jZSwgdGhpcy5tYXAsIHRoaXMsIGtleXMpKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucGxheWVycy5wdXNoKG5ldyBBSShhbGxpYW5jZSwgdGhpcy5tYXAsIHRoaXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhbGxpYW5jZSA9IDxBbGxpYW5jZT4gKDxudW1iZXI+IGFsbGlhbmNlICsgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICB0aGlzLnR1cm4gPSBzYXZlLnR1cm47XHJcbiAgICAgICAgICAgIHRoaXMuZ29sZCA9IHNhdmUuZ29sZDtcclxuICAgICAgICAgICAgdGhpcy5tYXAuaW1wb3J0QnVpbGRpbmdzKHNhdmUuYnVpbGRpbmdzKTtcclxuICAgICAgICAgICAgdGhpcy5tYXAuaW1wb3J0RW50aXRpZXMoc2F2ZS5lbnRpdGllcyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHRhcmdldCBvZiBzYXZlLmN1cnNvcnMpIHtcclxuICAgICAgICAgICAgICAgIGlmICghIXRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxheWVyc1tpXS5jdXJzb3JfcG9zaXRpb24gPSBuZXcgUG9zKHRhcmdldC54LCB0YXJnZXQueSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpKys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9Y2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgdGhpcy50dXJuID0gQWxsaWFuY2UuQmx1ZTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZ29sZCA9IFtdO1xyXG4gICAgICAgICAgICBpZiAoc2F2ZS5jYW1wYWlnbikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkWzBdID0gMzAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkWzFdID0gMzAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkWzBdID0gMTAwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ29sZFsxXSA9IDEwMDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlKCkge1xyXG5cclxuICAgICAgICBsZXQgdGlsZW1hcCA9IHRoaXMuZ2FtZS5hZGQudGlsZW1hcCgpO1xyXG4gICAgICAgIGxldCB0aWxlbWFwX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBzbW9rZV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgc2VsZWN0aW9uX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBlbnRpdHlfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGludGVyYWN0aW9uX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBjdXJzb3JfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGFuaW1hdGlvbl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgZnJhbWVfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgZnJhbWVfZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKHRoaXMubWFwLCB0aWxlbWFwLCB0aWxlbWFwX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlciA9IG5ldyBFbnRpdHlNYW5hZ2VyKHRoaXMubWFwLCBlbnRpdHlfZ3JvdXAsIHNlbGVjdGlvbl9ncm91cCwgaW50ZXJhY3Rpb25fZ3JvdXAsIGFuaW1hdGlvbl9ncm91cCwgdGhpcyk7XHJcblxyXG4gICAgICAgIHRoaXMuc21va2VfbWFuYWdlciA9IG5ldyBTbW9rZU1hbmFnZXIodGhpcy5tYXAsIHNtb2tlX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIgPSBuZXcgRnJhbWVNYW5hZ2VyKGZyYW1lX2dyb3VwKTtcclxuXHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyLmRyYXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mbyA9IG5ldyBNZW51RGVmSW5mbyhmcmFtZV9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMuZnJhbWVfZGVmX2luZm8pO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8gPSBuZXcgTWVudUdvbGRJbmZvKGZyYW1lX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5mcmFtZV9nb2xkX2luZm8pO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnNob3codHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gbmV3IFNwcml0ZSgpO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yLmluaXQoe3g6IDAsIHk6IDB9LCBjdXJzb3JfZ3JvdXAsIFwiY3Vyc29yXCIsIFswLCAxXSk7XHJcbiAgICAgICAgdGhpcy5jdXJzb3Iuc2V0T2Zmc2V0KC0xLCAtMSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhLnggPSB0aGlzLmdldE9mZnNldFgodGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCk7XHJcbiAgICAgICAgdGhpcy5jYW1lcmEueSA9IHRoaXMuZ2V0T2Zmc2V0WSh0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55KTtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zbG93ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFydFR1cm4odGhpcy50dXJuKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TWVzc2FnZShcIkdBTUUgTE9BREVEXCIpO1xyXG5cclxuICAgIH1cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICAvLyAxIHN0ZXAgaXMgMS82MCBzZWNcclxuXHJcbiAgICAgICAgdGhpcy5hY2MgKz0gdGhpcy50aW1lLmVsYXBzZWQ7XHJcbiAgICAgICAgbGV0IHN0ZXBzID0gTWF0aC5mbG9vcih0aGlzLmFjYyAvIDE2KTtcclxuICAgICAgICBpZiAoc3RlcHMgPD0gMCkgeyByZXR1cm47IH1cclxuICAgICAgICB0aGlzLmFjYyAtPSBzdGVwcyAqIDE2O1xyXG4gICAgICAgIGlmIChzdGVwcyA+IDIpIHsgc3RlcHMgPSAyOyB9XHJcblxyXG4gICAgICAgIGxldCBjdXJzb3JfcG9zaXRpb24gPSB0aGlzLmN1cnNvcl90YXJnZXQuZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgIGxldCBkaWZmX3ggPSBjdXJzb3JfcG9zaXRpb24ueCAtIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLng7XHJcbiAgICAgICAgbGV0IGRpZmZfeSA9IGN1cnNvcl9wb3NpdGlvbi55IC0gdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueTtcclxuXHJcbiAgICAgICAgbGV0IGR4ID0gMDtcclxuICAgICAgICBsZXQgZHkgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmN1cnNvcl9zdGlsbCA9IGRpZmZfeCA9PSAwICYmIGRpZmZfeSA9PSAwO1xyXG4gICAgICAgIGlmIChkaWZmX3ggIT0gMCkge1xyXG4gICAgICAgICAgICBkeCA9IE1hdGguZmxvb3IoZGlmZl94IC8gNCk7XHJcbiAgICAgICAgICAgIGlmIChkeCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIC00KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIDQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jdXJzb3Iuc2V0V29ybGRQb3NpdGlvbih7eDogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCArIGR4LCB5OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55ICsgZHl9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpZmZfeSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGR5ID0gTWF0aC5mbG9vcihkaWZmX3kgLyA0KTtcclxuICAgICAgICAgICAgaWYgKGR5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgLTQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1pbihkeSwgLTEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1pbihkeSwgNCk7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWF4KGR5LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRXb3JsZFBvc2l0aW9uKHt4OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54ICsgZHgsIHk6IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnkgKyBkeX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyB0cmFjayBtb3ZpbmcgZW50aXR5LCBvdGhlcndpc2UgY3Vyc29yXHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXRGb3JQb3NpdGlvbighIXRoaXMuc2VsZWN0ZWRfZW50aXR5ICYmICEhdGhpcy5zZWxlY3RlZF9lbnRpdHkucGF0aCA/IHRoaXMuc2VsZWN0ZWRfZW50aXR5LndvcmxkX3Bvc2l0aW9uIDogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24pO1xyXG5cclxuICAgICAgICAvLyBpbnB1dFxyXG5cclxuICAgICAgICB0aGlzLmNoZWNrV2luTG9zZSgpO1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuZ2FtZV9vdmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1soPG51bWJlcj4gdGhpcy50dXJuIC0gMSldLnJ1bigpO1xyXG4gICAgICAgICAgICB0aGlzLnBsYXllcnNbKDxudW1iZXI+IHRoaXMudHVybiAtIDEpXS5zZXRDdXJzb3JQb3NpdGlvbih0aGlzLmN1cnNvcl90YXJnZXQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmN1cnNvcl90YXJnZXQubWF0Y2godGhpcy5sYXN0X2N1cnNvcl9wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5sYXN0X2N1cnNvcl9wb3NpdGlvbiA9IHRoaXMuY3Vyc29yX3RhcmdldC5jb3B5KCk7XHJcblxyXG4gICAgICAgICAgICAvLyB1cGRhdGUgZGVmIGluZm9cclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby51cGRhdGVDb250ZW50KHRoaXMuY3Vyc29yX3RhcmdldCwgdGhpcy5tYXApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIC8vIFBhdXNlIEFOSU1BVElPTlxyXG5cclxuICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyA+IDMwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyAtPSAzMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zdGF0ZSA9IDEgLSB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRGcmFtZSh0aGlzLmFuaW1fY3Vyc29yX3N0YXRlKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIHRoaXMuc21va2VfbWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnVwZGF0ZShzdGVwcywgdGhpcy5jdXJzb3JfdGFyZ2V0LCB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlKTtcclxuXHJcbiAgICAgICAgbGV0IGluZm9faXNfcmlnaHQgPSAodGhpcy5mcmFtZV9nb2xkX2luZm8uYWxpZ24gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDA7XHJcbiAgICAgICAgaWYgKCFpbmZvX2lzX3JpZ2h0ICYmIHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggLSAxIC0gdGhpcy5jYW1lcmEueCA8PSB0aGlzLmdhbWUud2lkdGggLyAyIC0gMjQgLSAxMikge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLkxlZnQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLlJpZ2h0LCB0cnVlKTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uTGVmdCB8IERpcmVjdGlvbi5VcCwgRGlyZWN0aW9uLlJpZ2h0LCB0cnVlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGluZm9faXNfcmlnaHQgJiYgdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCArIDEgLSB0aGlzLmNhbWVyYS54ID49IHRoaXMuZ2FtZS53aWR0aCAvIDIgKyAxMikge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby51cGRhdGVEaXJlY3Rpb25zKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uRG93biwgRGlyZWN0aW9uLkxlZnQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0IHwgRGlyZWN0aW9uLlVwLCBEaXJlY3Rpb24uTGVmdCwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIC0tLS0gTUVOVSBERUxFR0FURSAtLS0tXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIG9wZW5NZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIHRoaXMucGxheWVyc1s8bnVtYmVyPiB0aGlzLnR1cm4gLSAxXS5vcGVuTWVudShjb250ZXh0KTtcclxuICAgIH1cclxuICAgIGNsb3NlTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpIHtcclxuICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgIHBsYXllci5jbG9zZU1lbnUoY29udGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIC0tLS0gRU5USVRZIE1BTkFHRVIgREVMRUdBVEUgLS0tLVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMucGxheWVyc1s8bnVtYmVyPiB0aGlzLnR1cm4gLSAxXS5lbnRpdHlEaWRNb3ZlKGVudGl0eSk7XHJcbiAgICB9XHJcbiAgICBlbnRpdHlEaWRBbmltYXRpb24oZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICB0aGlzLnBsYXllcnNbPG51bWJlcj4gdGhpcy50dXJuIC0gMV0uZW50aXR5RGlkQW5pbWF0aW9uKGVudGl0eSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAtLS0tIE1FTlUgLS0tLVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBzaG93TWVzc2FnZSh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgbWVudSA9IG5ldyBOb3RpZmljYXRpb24odGhpcy5mcmFtZV9tYW5hZ2VyLmdyb3VwLCB0ZXh0LCB0aGlzKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUobWVudSk7XHJcbiAgICAgICAgbWVudS5zaG93KHRydWUpO1xyXG4gICAgfVxyXG4gICAgc2hvd0luZm8oYWxsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby5zaG93KHRydWUpO1xyXG4gICAgICAgIGlmIChhbGwpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8uc2hvdyh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoaWRlSW5mbyhhbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLmhpZGUodHJ1ZSk7XHJcbiAgICAgICAgaWYgKGFsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby5oaWRlKHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAtLS0tIExPQUQgLyBTQVZFIC0tLS1cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgbG9hZEdhbWUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFNYWluTWVudS5sb2FkR2FtZSh0aGlzLmdhbWUpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoQW5jaWVudEVtcGlyZXMuTEFOR1s0M10pO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgc2F2ZUdhbWUoKSB7XHJcblxyXG4gICAgICAgIGxldCBjdXJzb3JzOiBJUG9zW10gPSBbXTtcclxuICAgICAgICBsZXQgcGxheWVyczogYm9vbGVhbltdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgcGxheWVyIG9mIHRoaXMucGxheWVycykge1xyXG4gICAgICAgICAgICBjdXJzb3JzLnB1c2gocGxheWVyLmdldEN1cnNvclBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyLmlzUGxheWVyKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHNhdmU6IEdhbWVTYXZlID0ge1xyXG4gICAgICAgICAgICBjYW1wYWlnbjogdGhpcy5tYXAuaXNDYW1wYWlnbigpLFxyXG4gICAgICAgICAgICBtYXA6IHRoaXMubWFwLmdldE1hcCgpLFxyXG4gICAgICAgICAgICB0dXJuOiB0aGlzLnR1cm4sXHJcbiAgICAgICAgICAgIGdvbGQ6IHRoaXMuZ29sZCxcclxuICAgICAgICAgICAgcGxheWVyczogcGxheWVycyxcclxuICAgICAgICAgICAgZW50aXRpZXM6IHRoaXMubWFwLmV4cG9ydEVudGl0aWVzKCksXHJcbiAgICAgICAgICAgIGJ1aWxkaW5nczogdGhpcy5tYXAuZXhwb3J0QnVpbGRpbmdzKCksXHJcbiAgICAgICAgICAgIGN1cnNvcnM6IGN1cnNvcnNcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInNhdmUucnNcIiwgSlNPTi5zdHJpbmdpZnkoc2F2ZSkpO1xyXG4gICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoQW5jaWVudEVtcGlyZXMuTEFOR1s0MV0pO1xyXG4gICAgfVxyXG4gICAgZXhpdEdhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5nYW1lLnN0YXRlLnN0YXJ0KFwiTWFpbk1lbnVcIiwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gLS0tLSBHRU5FUkFMIC0tLS1cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgY2hlY2tXaW5Mb3NlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWVfb3Zlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm1hcC5jb3VudEVudGl0aWVzV2l0aChBbGxpYW5jZS5CbHVlLCBFbnRpdHlTdGF0ZS5EZWFkLCBFbnRpdHlUeXBlLktpbmcpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlKEFuY2llbnRFbXBpcmVzLkxBTkdbMzhdKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lX292ZXIgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tYXAuY291bnRFbnRpdGllc1dpdGgoQWxsaWFuY2UuUmVkLCBFbnRpdHlTdGF0ZS5EZWFkLCBFbnRpdHlUeXBlLktpbmcpID4gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlKEFuY2llbnRFbXBpcmVzLkxBTkdbMjRdKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lX292ZXIgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZXh0VHVybigpIHtcclxuXHJcbiAgICAgICAgdGhpcy5zaG93TWVzc2FnZShBbmNpZW50RW1waXJlcy5MQU5HWzQwXSk7XHJcblxyXG4gICAgICAgIGxldCBuZXh0X3R1cm4gPSBBbGxpYW5jZS5CbHVlO1xyXG4gICAgICAgIGlmICh0aGlzLnR1cm4gPT0gQWxsaWFuY2UuQmx1ZSkge1xyXG4gICAgICAgICAgICBuZXh0X3R1cm4gPSBBbGxpYW5jZS5SZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy5wbGF5ZXJzWzxudW1iZXI+IG5leHRfdHVybiAtIDFdLmlzQWN0aXZlKCkpIHtcclxuICAgICAgICAgICAgbmV4dF90dXJuID0gdGhpcy50dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5nb2xkW25leHRfdHVybiA9PSBBbGxpYW5jZS5CbHVlID8gMCA6IDFdICs9IHRoaXMubWFwLmdldEdvbGRHYWluRm9yQWxsaWFuY2UobmV4dF90dXJuKTtcclxuICAgICAgICB0aGlzLm1hcC5uZXh0VHVybihuZXh0X3R1cm4pO1xyXG4gICAgICAgIHRoaXMuc3RhcnRUdXJuKG5leHRfdHVybik7XHJcbiAgICB9XHJcbiAgICBnZXRHb2xkRm9yQWxsaWFuY2UoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgc3dpdGNoIChhbGxpYW5jZSkge1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLkJsdWU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nb2xkWzBdO1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLlJlZDpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRbMV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuICAgIHNldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UsIGFtb3VudDogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGFsbGlhbmNlX2lkOiBudW1iZXI7XHJcbiAgICAgICAgc3dpdGNoIChhbGxpYW5jZSkge1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLkJsdWU6XHJcbiAgICAgICAgICAgICAgICBhbGxpYW5jZV9pZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBbGxpYW5jZS5SZWQ6XHJcbiAgICAgICAgICAgICAgICBhbGxpYW5jZV9pZCA9IDE7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5nb2xkW2FsbGlhbmNlX2lkXSA9IGFtb3VudDtcclxuICAgICAgICBpZiAodGhpcy50dXJuID09IGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIGFtb3VudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIC0tLS0gRU5USVRJVFkgLS0tLVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgYnV5RW50aXR5KGtpbmc6IEVudGl0eSwgdHlwZTogRW50aXR5VHlwZSk6IEVudGl0eSB7XHJcbiAgICAgICAgbGV0IGRhdGEgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1s8bnVtYmVyPiB0eXBlXTtcclxuICAgICAgICBsZXQgZ29sZCA9IHRoaXMuZ2V0R29sZEZvckFsbGlhbmNlKGtpbmcuYWxsaWFuY2UpIC0gZGF0YS5jb3N0O1xyXG4gICAgICAgIGlmIChnb2xkIDwgMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRHb2xkRm9yQWxsaWFuY2Uoa2luZy5hbGxpYW5jZSwgZ29sZCk7XHJcbiAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMubWFwLmNyZWF0ZUVudGl0eSh0eXBlLCBraW5nLmFsbGlhbmNlLCBraW5nLnBvc2l0aW9uLmNvcHkoKSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5jcmVhdGVFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICByZXR1cm4gZW50aXR5O1xyXG4gICAgfVxyXG4gICAgc2VsZWN0RW50aXR5KGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5zZWxlY3RlZF9lbnRpdHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eSA9IGVudGl0eTtcclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSwgdGFyZ2V0OiBQb3MsIGFuaW1hdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5tYXAubW92ZUVudGl0eShlbnRpdHksIHRhcmdldCwgdGhpcywgYW5pbWF0ZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlUmFuZ2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIG9jY3VweShwb3NpdGlvbjogUG9zLCBhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICB0aGlzLm1hcC5zZXRBbGxpYW5jZUF0KHBvc2l0aW9uLCBhbGxpYW5jZSk7XHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIuZHJhd1RpbGVBdChwb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5zaG93TWVzc2FnZShBbmNpZW50RW1waXJlcy5MQU5HWzM5XSk7XHJcbiAgICB9XHJcbiAgICBzaG93UmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVJhbmdlIHtcclxuICAgICAgICB0aGlzLm1hcC5zaG93UmFuZ2UodHlwZSwgZW50aXR5KTtcclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnNob3dSYW5nZSgpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLm1hcC5lbnRpdHlfcmFuZ2U7XHJcbiAgICB9XHJcbiAgICBoaWRlUmFuZ2UoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5oaWRlUmFuZ2UoKTtcclxuICAgIH1cclxuICAgIGF0dGFja0VudGl0eShlbnRpdHk6IEVudGl0eSwgdGFyZ2V0OiBFbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLmF0dGFja0VudGl0eShlbnRpdHksIHRhcmdldCk7XHJcbiAgICB9XHJcbiAgICByYWlzZUVudGl0eSh3aXphcmQ6IEVudGl0eSwgZGVhZDogRW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5yYWlzZUVudGl0eSh3aXphcmQsIGRlYWQpO1xyXG4gICAgfVxyXG4gICAgZGVzZWxlY3RFbnRpdHkoY2hhbmdlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RlZF9lbnRpdHkpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yX3RhcmdldCA9IHRoaXMuc2VsZWN0ZWRfZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICB0aGlzLmhpZGVSYW5nZSgpO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLmRlc2VsZWN0RW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5KTtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eSA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIGlmIHNvbWV0aGluZyBjaGFuZ2VkXHJcbiAgICAgICAgaWYgKGNoYW5nZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXAucmVzZXRXaXNwKHRoaXMudHVybik7XHJcbiAgICAgICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1dpc3BlZCgpO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnVwZGF0ZUNvbnRlbnQodGhpcy5jdXJzb3JfdGFyZ2V0LCB0aGlzLm1hcCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAtLS0tIFBSSVZBVEUgR0VORVJBTCAtLS0tXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgcHJpdmF0ZSBzdGFydFR1cm4oYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcblxyXG4gICAgICAgIHRoaXMudHVybiA9IGFsbGlhbmNlO1xyXG5cclxuICAgICAgICBsZXQgcGxheWVyID0gdGhpcy5wbGF5ZXJzWzxudW1iZXI+IGFsbGlhbmNlIC0gMV07XHJcbiAgICAgICAgcGxheWVyLnN0YXJ0KCk7XHJcbiAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gcGxheWVyLmdldEN1cnNvclBvc2l0aW9uKCk7XHJcblxyXG4gICAgICAgIGxldCB3cCA9IHRoaXMuY3Vyc29yX3RhcmdldC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgdGhpcy5jdXJzb3Iuc2V0V29ybGRQb3NpdGlvbih3cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZUNvbnRlbnQoYWxsaWFuY2UsIHRoaXMuZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlKSk7XHJcblxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXRGb3JQb3NpdGlvbihwb3NpdGlvbjogSVBvcykge1xyXG4gICAgICAgIGxldCB4ID0gcG9zaXRpb24ueCArIDAuNSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICBsZXQgeSA9IHBvc2l0aW9uLnkgKyAwLjUgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KHgsIHkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSB0aGlzLmdldE9mZnNldFgoeCk7XHJcbiAgICAgICAgbGV0IG9mZnNldF95ID0gdGhpcy5nZXRPZmZzZXRZKHkpO1xyXG5cclxuICAgICAgICBsZXQgZGlmZl94ID0gb2Zmc2V0X3ggLSB0aGlzLmNhbWVyYS54O1xyXG4gICAgICAgIGxldCBkaWZmX3kgPSBvZmZzZXRfeSAtIHRoaXMuY2FtZXJhLnk7XHJcblxyXG4gICAgICAgIHRoaXMuY2FtZXJhX3N0aWxsID0gZGlmZl94ID09IDAgJiYgZGlmZl95ID09IDA7XHJcbiAgICAgICAgaWYgKGRpZmZfeCAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxldCBkeCA9IE1hdGguZmxvb3IoZGlmZl94IC8gMTIpO1xyXG4gICAgICAgICAgICBpZiAoZHggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWF4KGR4LCAtNCk7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWluKGR4LCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWluKGR4LCA0KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnggKz0gZHg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkaWZmX3kgIT0gMCkge1xyXG4gICAgICAgICAgICBsZXQgZHkgPSBNYXRoLmZsb29yKGRpZmZfeSAvIDEyKTtcclxuICAgICAgICAgICAgaWYgKGR5IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1heChkeSwgLTQpO1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1pbihkeSwgLTEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHkgPSBNYXRoLm1pbihkeSwgNCk7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWF4KGR5LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmNhbWVyYS55ICs9IGR5O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgZ2V0T2Zmc2V0WCh4OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBvZmZzZXRfeCA9IHggLSB0aGlzLmdhbWUud2lkdGggLyAyO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWUud2lkdGggPCB0aGlzLndvcmxkLndpZHRoKSB7XHJcbiAgICAgICAgICAgIG9mZnNldF94ID0gTWF0aC5tYXgob2Zmc2V0X3gsIDApO1xyXG4gICAgICAgICAgICBvZmZzZXRfeCA9IE1hdGgubWluKG9mZnNldF94LCB0aGlzLndvcmxkLndpZHRoIC0gdGhpcy5nYW1lLndpZHRoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBvZmZzZXRfeCA9ICh0aGlzLmdhbWUud2lkdGggLSB0aGlzLndvcmxkLndpZHRoKSAvIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRfeDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZ2V0T2Zmc2V0WSh5OiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBvZmZzZXRfeSA9IHkgLSB0aGlzLmdhbWUuaGVpZ2h0IC8gMjtcclxuICAgICAgICBpZiAodGhpcy5nYW1lLmhlaWdodCA8IHRoaXMud29ybGQuaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIG9mZnNldF95ID0gTWF0aC5tYXgob2Zmc2V0X3ksIDApO1xyXG4gICAgICAgICAgICBvZmZzZXRfeSA9IE1hdGgubWluKG9mZnNldF95LCB0aGlzLndvcmxkLmhlaWdodCAtIHRoaXMuZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9mZnNldF95ID0gKHRoaXMuZ2FtZS5oZWlnaHQgLSB0aGlzLndvcmxkLmhlaWdodCkgLyAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2Zmc2V0X3k7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImdhbWVjb250cm9sbGVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1lbnUudHNcIiAvPlxyXG5cclxuZW51bSBBY3RpdmVNZW51VHlwZSB7XHJcbiAgICBDYW1wYWlnbk1hcHMsXHJcbiAgICBTa2lybWlzaE1hcHMsXHJcbiAgICBTa2lybWlzaFBsYXllcnNcclxufVxyXG5cclxuY2xhc3MgTWFpbk1lbnUgZXh0ZW5kcyBQaGFzZXIuU3RhdGUgaW1wbGVtZW50cyBNZW51RGVsZWdhdGUge1xyXG5cclxuICAgIHByaXZhdGUga25pZ2h0czogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSB0aXRsZTogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSB0aXRsZV9tYXNrOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGludHJvOiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBpbnRyb19hY2M6IG51bWJlcjtcclxuICAgIHByaXZhdGUgaW50cm9fcHJvZ3Jlc3M6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG1haW46IE1lbnVPcHRpb25zO1xyXG4gICAgcHJpdmF0ZSBtZW51X3NlbGVjdDogTWVudVNlbGVjdDtcclxuXHJcbiAgICBwcml2YXRlIGZyYW1lX21hbmFnZXI6IEZyYW1lTWFuYWdlcjtcclxuICAgIHByaXZhdGUgbm90aWZpY2F0aW9uX3Nob3duOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUga2V5czogSW5wdXQ7XHJcblxyXG4gICAgcHJpdmF0ZSBhY3RpdmVfYWJvdXQ6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgYWN0aXZlX2luc3RydWN0aW9uczogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBhY3RpdmVfaW5zdHJ1Y3Rpb25fbnI6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGFjdGl2ZV9zZWxlY3Q6IEFjdGl2ZU1lbnVUeXBlO1xyXG4gICAgcHJpdmF0ZSBhY3RpdmVfc2tpcm1pc2g6IG51bWJlcjtcclxuXHJcbiAgICBzdGF0aWMgZHJhd1RyYW5zaXRpb24ocHJvZ3Jlc3M6IG51bWJlciwgbWF4X3Byb2dyZXNzOiBudW1iZXIsIGdyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIGltYWdlX3dpZHRoOiBudW1iZXIsIGltYWdlX2hlaWdodDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGxldCBtYXhfc2VnbWVudF93aWR0aCA9IE1hdGguY2VpbChpbWFnZV93aWR0aCAvIDQpO1xyXG4gICAgICAgIGxldCBtYXhfc2VnbWVudF9oZWlnaHQgPSBNYXRoLmNlaWwoaW1hZ2VfaGVpZ2h0IC8gMik7XHJcblxyXG4gICAgICAgIGxldCB1bnRpbF9hbGwgPSBtYXhfcHJvZ3Jlc3MgLSA2O1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgNDsgeCsrKSB7XHJcbiAgICAgICAgICAgIGxldCBzaG93ID0gTWF0aC5mbG9vcihwcm9ncmVzcyAtIHggKiAyKTtcclxuICAgICAgICAgICAgaWYgKHNob3cgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gbm90aGluZyB0byBkcmF3IGFmdGVyIHRoaXMgcG9pbnRcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCB3aWR0aDogbnVtYmVyO1xyXG4gICAgICAgICAgICBsZXQgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICAgICAgICAgIGlmIChzaG93ID49IHVudGlsX2FsbCkge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBtYXhfc2VnbWVudF93aWR0aDtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IG1heF9zZWdtZW50X2hlaWdodDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gTWF0aC5mbG9vcihzaG93ICogbWF4X3NlZ21lbnRfd2lkdGggLyB1bnRpbF9hbGwpO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gTWF0aC5mbG9vcihzaG93ICogbWF4X3NlZ21lbnRfaGVpZ2h0IC8gdW50aWxfYWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgbWFyZ2luX3ggPSBNYXRoLmZsb29yKChtYXhfc2VnbWVudF93aWR0aCAtIHdpZHRoKSAvIDIpO1xyXG4gICAgICAgICAgICBsZXQgbWFyZ2luX3kgPSBNYXRoLmZsb29yKChtYXhfc2VnbWVudF9oZWlnaHQgLSBoZWlnaHQpIC8gMik7XHJcbiAgICAgICAgICAgIGxldCBvZmZzZXRfeCA9IHggKiBtYXhfc2VnbWVudF93aWR0aCArIG1hcmdpbl94O1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IDI7IHkgKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBvZmZzZXRfeSA9IHkgKiBtYXhfc2VnbWVudF9oZWlnaHQgKyBtYXJnaW5feTtcclxuICAgICAgICAgICAgICAgIGdyYXBoaWNzLmRyYXdSZWN0KG9mZnNldF94LCBvZmZzZXRfeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBsb2FkR2FtZShnYW1lOiBQaGFzZXIuR2FtZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzYXZlOiBHYW1lU2F2ZTtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwic2F2ZS5yc1wiKTtcclxuICAgICAgICAgICAgc2F2ZSA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghc2F2ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJHYW1lXCIsIHRydWUsIGZhbHNlLCBzYXZlKTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICAgc3RhdGljIHN0YXJ0R2FtZShnYW1lOiBQaGFzZXIuR2FtZSwgY2FtcGFpZ246IGJvb2xlYW4sIG1hcDogbnVtYmVyLCBwbGF5ZXJzOiBib29sZWFuW10gPSBbdHJ1ZSwgZmFsc2VdKSB7XHJcbiAgICAgICAgbGV0IHNhdmU6IEdhbWVTYXZlID0ge1xyXG4gICAgICAgICAgICBjYW1wYWlnbjogY2FtcGFpZ24sXHJcbiAgICAgICAgICAgIG1hcDogbWFwLFxyXG4gICAgICAgICAgICBwbGF5ZXJzOiBwbGF5ZXJzXHJcbiAgICAgICAgfTtcclxuICAgICAgICBnYW1lLnN0YXRlLnN0YXJ0KFwiR2FtZVwiLCB0cnVlLCBmYWxzZSwgc2F2ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dBYm91dChnYW1lOiBQaGFzZXIuR2FtZSk6IFBoYXNlci5Hcm91cCB7XHJcbiAgICAgICAgbGV0IGdyb3VwID0gZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBncm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgbGV0IGJhY2tncm91bmQgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwLCBncm91cCk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5iZWdpbkZpbGwoMHhmZmZmZmYpO1xyXG4gICAgICAgIGJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgIGJhY2tncm91bmQuZW5kRmlsbCgpO1xyXG4gICAgICAgIGJhY2tncm91bmQuYmVnaW5GaWxsKDB4MDAwMDAwKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmRyYXdSZWN0KDAsIDM3LCBnYW1lLndpZHRoLCAxKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmVuZEZpbGwoKTtcclxuXHJcbiAgICAgICAgZ2FtZS5hZGQuYml0bWFwVGV4dCgxMCwgMjYsIFwiZm9udDdcIiwgQW5jaWVudEVtcGlyZXMuTEFOR1s4XSwgNywgZ3JvdXApO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gZ2FtZS5hZGQuYml0bWFwVGV4dCgxMCwgNDIsIFwiZm9udDdcIiwgQW5jaWVudEVtcGlyZXMuTEFOR1swXSArIEFuY2llbnRFbXBpcmVzLkxBTkdbMTRdLCA3LCBncm91cCk7XHJcbiAgICAgICAgdGV4dC5tYXhXaWR0aCA9IGdhbWUud2lkdGggLSAyMDtcclxuICAgICAgICByZXR1cm4gZ3JvdXA7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJbnN0cnVjdGlvbnMoZ3JvdXA6IFBoYXNlci5Hcm91cCwgcGFnZTogbnVtYmVyID0gMCkge1xyXG4gICAgICAgIGdyb3VwLnJlbW92ZUNoaWxkcmVuKCk7XHJcblxyXG4gICAgICAgIGxldCBiYWNrZ3JvdW5kID0gZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgZ3JvdXApO1xyXG4gICAgICAgIGJhY2tncm91bmQuYmVnaW5GaWxsKDB4ZmZmZmZmKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmRyYXdSZWN0KDAsIDAsIGdyb3VwLmdhbWUud2lkdGgsIGdyb3VwLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmVuZEZpbGwoKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmJlZ2luRmlsbCgweDAwMDAwMCk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5kcmF3UmVjdCgwLCAzNywgZ3JvdXAuZ2FtZS53aWR0aCwgMSk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIGdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoMTAsIDI2LCBcImZvbnQ3XCIsIEFuY2llbnRFbXBpcmVzLkxBTkdbN10gKyAocGFnZSA+IDAgPyAoXCIgLSBcIiArIHBhZ2UpIDogXCJcIiksIDcsIGdyb3VwKTtcclxuICAgICAgICBsZXQgdGV4dCA9IGdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoMTAsIDQyLCBcImZvbnQ3XCIsIEFuY2llbnRFbXBpcmVzLkxBTkdbcGFnZSA+IDAgPyAoODYgKyBwYWdlKSA6IDEzXSwgNywgZ3JvdXApO1xyXG4gICAgICAgIHRleHQubWF4V2lkdGggPSBncm91cC5nYW1lLndpZHRoIC0gMjA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LldhaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5ub3RpZmljYXRpb25fc2hvd24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGNsb3NlTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpIHtcclxuICAgICAgICBpZiAoY29udGV4dCA9PSBJbnB1dENvbnRleHQuV2FpdCkge1xyXG4gICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbl9zaG93biA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUgKCkge1xyXG4gICAgICAgIC8vIHRoaXMubG9hZE1hcChcInMwXCIpO1xyXG5cclxuICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbl9zaG93biA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaW50cm8gPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaW50cm9fYWNjID0gMDtcclxuICAgICAgICB0aGlzLmludHJvX3Byb2dyZXNzID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5nYW1lLmFkZC5pbWFnZSgwLCAwLCBcInNwbGFzaGJnXCIpO1xyXG4gICAgICAgIHRoaXMua25pZ2h0cyA9IHRoaXMuZ2FtZS5hZGQuaW1hZ2UoMCwgMjYsIFwic3BsYXNoZmdcIik7XHJcblxyXG4gICAgICAgIHRoaXMudGl0bGUgPSB0aGlzLmdhbWUuYWRkLmltYWdlKDAsIDgsIFwic3BsYXNoXCIpO1xyXG4gICAgICAgIHRoaXMudGl0bGUueCA9IE1hdGguZmxvb3IoKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMudGl0bGUud2lkdGgpIC8gMik7XHJcbiAgICAgICAgdGhpcy50aXRsZS52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudGl0bGVfbWFzayA9IHRoaXMuZ2FtZS5hZGQuZ3JhcGhpY3ModGhpcy50aXRsZS54LCB0aGlzLnRpdGxlLnkpO1xyXG4gICAgICAgIHRoaXMudGl0bGUubWFzayA9IHRoaXMudGl0bGVfbWFzaztcclxuXHJcbiAgICAgICAgbGV0IGZyYW1lX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlciA9IG5ldyBGcmFtZU1hbmFnZXIoZnJhbWVfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmtleXMgPSBuZXcgSW5wdXQodGhpcy5nYW1lLmlucHV0KTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKCkge1xyXG5cclxuICAgICAgICBpZiAoIXRoaXMuaW50cm8pIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMua2V5cy51cGRhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLnVwZGF0ZSgxKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLm5vdGlmaWNhdGlvbl9zaG93bikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuVXApKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5VcCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLm1lbnVfc2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5wcmV2KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbi5wcmV2KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRG93bik7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLm1lbnVfc2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFpbi5uZXh0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5FbnRlcikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVudGVyKTtcclxuICAgICAgICAgICAgICAgIGlmICghIXRoaXMuYWN0aXZlX2Fib3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfYWJvdXQuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9hYm91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEhdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9uciArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQgPD0gMTcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25fbnIgPSBuZXh0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBNYWluTWVudS5zaG93SW5zdHJ1Y3Rpb25zKHRoaXMuYWN0aXZlX2luc3RydWN0aW9ucywgdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25fbnIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoISF0aGlzLm1lbnVfc2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RDaG9pY2UodGhpcy5tZW51X3NlbGVjdC5zZWxlY3RlZCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBhY3Rpb24gPSB0aGlzLm1haW4uZ2V0U2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4ZWN1dGVBY3Rpb24oYWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfWVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgIGlmICghIXRoaXMuYWN0aXZlX2Fib3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfYWJvdXQuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9hYm91dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEhdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zLmRlc3Ryb3kodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoISF0aGlzLm1lbnVfc2VsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5oaWRlKGZhbHNlLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1lbnVfc2VsZWN0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW4uc2hvdyh0cnVlLCA3Mik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgIGlmICghIXRoaXMuYWN0aXZlX2luc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25fbnIgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0IDw9IDE3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yID0gbmV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMsIHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5MZWZ0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuTGVmdCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgcHJldiA9IHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yIC0gMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocHJldiA+PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yID0gcHJldjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMsIHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yICk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmludHJvX2FjYysrO1xyXG4gICAgICAgIGlmICh0aGlzLmludHJvX2FjYyA8IDIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmludHJvX2FjYyA9IDA7XHJcbiAgICAgICAgdGhpcy5pbnRyb19wcm9ncmVzcysrO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pbnRyb19wcm9ncmVzcyA8PSAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLmtuaWdodHMueSA9IDI2IC0gdGhpcy5pbnRyb19wcm9ncmVzcztcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaW50cm9fcHJvZ3Jlc3MgPD0gNjApIHtcclxuICAgICAgICAgICAgdGhpcy50aXRsZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy50aXRsZV9tYXNrLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVfbWFzay5iZWdpbkZpbGwoKTtcclxuICAgICAgICAgICAgTWFpbk1lbnUuZHJhd1RyYW5zaXRpb24oTWF0aC5jZWlsKCh0aGlzLmludHJvX3Byb2dyZXNzIC0gMzApIC8gMiksIDE1LCB0aGlzLnRpdGxlX21hc2ssIHRoaXMudGl0bGUud2lkdGgsIHRoaXMudGl0bGUuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy50aXRsZV9tYXNrLmVuZEZpbGwoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRpdGxlX21hc2suY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy5tYWluID0gbmV3IE1lbnVPcHRpb25zKHRoaXMuZnJhbWVfbWFuYWdlci5ncm91cCwgRGlyZWN0aW9uLk5vbmUsIE1lbnVPcHRpb25zLmdldE1haW5NZW51T3B0aW9ucyhmYWxzZSksIHRoaXMsIERpcmVjdGlvbi5VcCk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLm1haW4pO1xyXG4gICAgICAgICAgICB0aGlzLm1haW4uc2hvdyh0cnVlLCA3Mik7XHJcbiAgICAgICAgICAgIHRoaXMuaW50cm8gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2hvd01lc3NhZ2UodGV4dDogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IG1lbnUgPSBuZXcgTm90aWZpY2F0aW9uKHRoaXMuZnJhbWVfbWFuYWdlci5ncm91cCwgdGV4dCwgdGhpcyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKG1lbnUpO1xyXG4gICAgICAgIG1lbnUuc2hvdyh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBleGVjdXRlQWN0aW9uKGFjdGlvbjogQWN0aW9uKSB7XHJcbiAgICAgICAgc3dpdGNoIChhY3Rpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uTE9BRF9HQU1FOlxyXG4gICAgICAgICAgICAgICAgaWYgKE1haW5NZW51LmxvYWRHYW1lKHRoaXMuZ2FtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW4uaGlkZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoQW5jaWVudEVtcGlyZXMuTEFOR1s0M10pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk5FV19HQU1FOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5tYWluLmhpZGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgTWFpbk1lbnUuc3RhcnRHYW1lKHRoaXMuZ2FtZSwgZmFsc2UsIDApO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNFTEVDVF9MRVZFTDpcclxuICAgICAgICAgICAgICAgIGxldCBtYXBzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXBzLnB1c2goQW5jaWVudEVtcGlyZXMuTEFOR1s0OSArIGldKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMubWFpbi5oaWRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX3NlbGVjdCA9IEFjdGl2ZU1lbnVUeXBlLkNhbXBhaWduTWFwcztcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudV9zZWxlY3QgPSBuZXcgTWVudVNlbGVjdChtYXBzLCB0aGlzLmZyYW1lX21hbmFnZXIuZ3JvdXAsIHRoaXMsIERpcmVjdGlvbi5Ob25lLCBEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMubWVudV9zZWxlY3QpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5zaG93KHRydWUsIDcyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5TS0lSTUlTSDpcclxuICAgICAgICAgICAgICAgIHRoaXMubWFpbi5oaWRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX3NlbGVjdCA9IEFjdGl2ZU1lbnVUeXBlLlNraXJtaXNoTWFwcztcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudV9zZWxlY3QgPSBuZXcgTWVudVNlbGVjdChbXCJJc2xhbmQgQ3Jvc3NcIiwgXCJSb2NreSBCYXlcIl0sIHRoaXMuZnJhbWVfbWFuYWdlci5ncm91cCwgdGhpcywgRGlyZWN0aW9uLk5vbmUsIERpcmVjdGlvbi5VcCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5tZW51X3NlbGVjdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVfc2VsZWN0LnNob3codHJ1ZSwgNzIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkFCT1VUOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfYWJvdXQgPSBNYWluTWVudS5zaG93QWJvdXQodGhpcy5nYW1lKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5JTlNUUlVDVElPTlM6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9uciA9IDA7XHJcbiAgICAgICAgICAgICAgICBNYWluTWVudS5zaG93SW5zdHJ1Y3Rpb25zKHRoaXMuYWN0aXZlX2luc3RydWN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0Q2hvaWNlKGNob2ljZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5oaWRlKGZhbHNlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLm1lbnVfc2VsZWN0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmFjdGl2ZV9zZWxlY3QpIHtcclxuICAgICAgICAgICAgY2FzZSBBY3RpdmVNZW51VHlwZS5DYW1wYWlnbk1hcHM6XHJcbiAgICAgICAgICAgICAgICBNYWluTWVudS5zdGFydEdhbWUodGhpcy5nYW1lLCB0cnVlLCBjaG9pY2UpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aXZlTWVudVR5cGUuU2tpcm1pc2hNYXBzOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfc2tpcm1pc2ggPSBjaG9pY2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9zZWxlY3QgPSBBY3RpdmVNZW51VHlwZS5Ta2lybWlzaFBsYXllcnM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVfc2VsZWN0ID0gbmV3IE1lbnVTZWxlY3QoW1wiMSBQTEFZRVJcIiwgXCIyIFBMQVlFUlwiLCBcIkFJIE9OTFlcIl0sIHRoaXMuZnJhbWVfbWFuYWdlci5ncm91cCwgdGhpcywgRGlyZWN0aW9uLk5vbmUsIERpcmVjdGlvbi5VcCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5tZW51X3NlbGVjdCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVfc2VsZWN0LnNob3codHJ1ZSwgNzIpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aXZlTWVudVR5cGUuU2tpcm1pc2hQbGF5ZXJzOlxyXG4gICAgICAgICAgICAgICAgbGV0IHBsYXllcnM6IGJvb2xlYW5bXSA9IFtjaG9pY2UgIT0gMiwgY2hvaWNlID09IDFdO1xyXG4gICAgICAgICAgICAgICAgTWFpbk1lbnUuc3RhcnRHYW1lKHRoaXMuZ2FtZSwgZmFsc2UsIHRoaXMuYWN0aXZlX3NraXJtaXNoLCBwbGF5ZXJzKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwidmVuZG9yL3BoYXNlci5kLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInV0aWwudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwic3ByaXRlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImxvYWRlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJtYWlubWVudS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJnYW1lY29udHJvbGxlci50c1wiIC8+XHJcbmNsYXNzIEFuY2llbnRFbXBpcmVzIHtcclxuXHJcbiAgICBzdGF0aWMgVElMRV9TSVpFOiBudW1iZXIgPSAyNDtcclxuICAgIHN0YXRpYyBNSU5JX1NJWkU6IG51bWJlciA9IDEwO1xyXG4gICAgc3RhdGljIEVOVElUSUVTOiBFbnRpdHlEYXRhW107XHJcblxyXG4gICAgc3RhdGljIExJTkVfU0VHTUVOVF9MRU5HVEggPSAxMDtcclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfV0lEVEggPSA0O1xyXG4gICAgc3RhdGljIExJTkVfU0VHTUVOVF9TUEFDSU5HID0gMjtcclxuICAgIHN0YXRpYyBERUFUSF9DT1VOVCA9IDM7XHJcblxyXG4gICAgc3RhdGljIE5VTUJFUl9PRl9USUxFUzogbnVtYmVyID0gMjM7XHJcbiAgICBzdGF0aWMgVElMRVNfUFJPUDogVGlsZVtdO1xyXG4gICAgc3RhdGljIExBTkc6IHN0cmluZ1tdO1xyXG5cclxuICAgIHN0YXRpYyBnYW1lOiBQaGFzZXIuR2FtZTtcclxuICAgIGxvYWRlcjogTG9hZGVyO1xyXG4gICAgbWFpbk1lbnU6IE1haW5NZW51O1xyXG4gICAgY29udHJvbGxlcjogR2FtZUNvbnRyb2xsZXI7XHJcblxyXG4gICAgd2lkdGg6IG51bWJlciA9IDE3NjtcclxuICAgIGhlaWdodDogbnVtYmVyID0gIDIwNDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihkaXZfaWQ6IHN0cmluZykge1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUgPSBuZXcgUGhhc2VyLkdhbWUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIFBoYXNlci5BVVRPLCBkaXZfaWQsIHRoaXMsIGZhbHNlLCBmYWxzZSk7XHJcblxyXG4gICAgICAgIHRoaXMubG9hZGVyID0gbmV3IExvYWRlcigpO1xyXG4gICAgICAgIHRoaXMubWFpbk1lbnUgPSBuZXcgTWFpbk1lbnUoKTtcclxuICAgICAgICB0aGlzLmNvbnRyb2xsZXIgPSBuZXcgR2FtZUNvbnRyb2xsZXIoKTtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJMb2FkZXJcIiwgdGhpcy5sb2FkZXIpO1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiTWFpbk1lbnVcIiwgdGhpcy5tYWluTWVudSk7XHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJHYW1lXCIsIHRoaXMuY29udHJvbGxlcik7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuc3RhcnQoXCJMb2FkZXJcIik7XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuIiwiZW51bSBTY3JlZW5UcmFuc2l0aW9uIHtcclxuICAgIE5vbmUsXHJcbiAgICBIaWRlLFxyXG4gICAgU2hvd1xyXG59XHJcbmNsYXNzIEF0dGFja1NjcmVlbiB7XHJcbiAgICBwcml2YXRlIHRyYW5zaXRpb246IFNjcmVlblRyYW5zaXRpb247XHJcbiAgICBwcml2YXRlIHRyYW5zaXRpb25fcHJvZ3Jlc3M6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGJhY2tncm91bmRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgY29udGVudF9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uX21hc2s6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgYXR0YWNrZXI6IEVudGl0eTtcclxuICAgIHByaXZhdGUgdGFyZ2V0OiBFbnRpdHk7XHJcbiAgICBwcml2YXRlIG1hcDogTWFwO1xyXG5cclxuICAgIHN0YXRpYyBkcmF3VHJhbnNpdGlvbihwcm9ncmVzczogbnVtYmVyLCBtYXhfcHJvZ3Jlc3M6IG51bWJlciwgZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgc2NyZWVuX3dpZHRoOiBudW1iZXIsIHNjcmVlbl9oZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgbWF4X3NlZ21lbnRfd2lkdGggPSBNYXRoLmZsb29yKHNjcmVlbl93aWR0aCAvIDQpICsgMTtcclxuICAgICAgICBsZXQgbWF4X3NlZ21lbnRfaGVpZ2h0ID0gTWF0aC5mbG9vcihzY3JlZW5faGVpZ2h0IC8gNCkgKyAxO1xyXG5cclxuICAgICAgICBsZXQgdW50aWxfYWxsID0gbWF4X3Byb2dyZXNzIC0gNjtcclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IDQ7IHgrKykge1xyXG4gICAgICAgICAgICBsZXQgc2hvdyA9IE1hdGguZmxvb3IocHJvZ3Jlc3MgLSB4ICogMik7XHJcbiAgICAgICAgICAgIGlmIChzaG93IDw9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIG5vdGhpbmcgdG8gZHJhdyBhZnRlciB0aGlzIHBvaW50XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgd2lkdGg6IG51bWJlcjtcclxuICAgICAgICAgICAgbGV0IGhlaWdodDogbnVtYmVyO1xyXG4gICAgICAgICAgICBpZiAoc2hvdyA+PSB1bnRpbF9hbGwpIHtcclxuICAgICAgICAgICAgICAgIHdpZHRoID0gbWF4X3NlZ21lbnRfd2lkdGg7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBtYXhfc2VnbWVudF9oZWlnaHQ7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IE1hdGguZmxvb3Ioc2hvdyAqIG1heF9zZWdtZW50X3dpZHRoIC8gdW50aWxfYWxsKTtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3Ioc2hvdyAqIG1heF9zZWdtZW50X2hlaWdodCAvIHVudGlsX2FsbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IG1hcmdpbl94ID0gTWF0aC5mbG9vcigobWF4X3NlZ21lbnRfd2lkdGggLSB3aWR0aCkgLyAyKTtcclxuICAgICAgICAgICAgbGV0IG1hcmdpbl95ID0gTWF0aC5mbG9vcigobWF4X3NlZ21lbnRfaGVpZ2h0IC0gaGVpZ2h0KSAvIDIpO1xyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0X3ggPSB4ICogbWF4X3NlZ21lbnRfd2lkdGggKyBtYXJnaW5feDtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCA0OyB5ICsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0X3kgPSB5ICogbWF4X3NlZ21lbnRfaGVpZ2h0ICsgbWFyZ2luX3k7XHJcbiAgICAgICAgICAgICAgICBncmFwaGljcy5kcmF3UmVjdChvZmZzZXRfeCwgb2Zmc2V0X3ksIHdpZHRoLCBoZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRCYWNrZ3JvdW5kUHJlZml4Rm9yVGlsZSh0aWxlOiBUaWxlKTogc3RyaW5nIHtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIndvb2RzXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiaGlsbFwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJtb3VudGFpblwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuV2F0ZXI6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ3YXRlclwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiYnJpZGdlXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcInRvd25cIjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0TmFtZUZvclRpbGUodGlsZTogVGlsZSk6IHN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoICh0aWxlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5HcmFzczpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJncmFzc1wiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcInJvYWRcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibW91bnRhaW5cIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwid2F0ZXJcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImJyaWRnZVwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ0b3duXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgY29uc3RydWN0b3IoZ2FtZTogUGhhc2VyLkdhbWUsIGF0dGFja2VyOiBFbnRpdHksIHRhcmdldDogRW50aXR5LCBtYXA6IE1hcCkge1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcyA9IGdhbWUuYWRkLmdyYXBoaWNzKDAsIDApO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcy5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmdyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX21hc2sgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLm1hc2sgPSB0aGlzLnRyYW5zaXRpb25fbWFzaztcclxuXHJcbiAgICAgICAgdGhpcy5hdHRhY2tlciA9IGF0dGFja2VyO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG5cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLk5vbmU7XHJcbiAgICB9XHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIC8vIHN0YXJ0IHRyYW5zaXRpb25cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9IFNjcmVlblRyYW5zaXRpb24uSGlkZTtcclxuICAgIH1cclxuICAgIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGF0dGFja2VyX3RpbGUgPSB0aGlzLm1hcC5nZXRUaWxlQXQodGhpcy5hdHRhY2tlci5wb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IHRhcmdldF90aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHRoaXMudGFyZ2V0LnBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kSGFsZihhdHRhY2tlcl90aWxlLCAwKTtcclxuICAgICAgICB0aGlzLmRyYXdCYWNrZ3JvdW5kSGFsZih0YXJnZXRfdGlsZSwgMSk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5icmluZ1RvVG9wKHRoaXMuY29udGVudF9ncmFwaGljcyk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmJlZ2luRmlsbCgweDAwMDAwMCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmRyYXdSZWN0KE1hdGguZmxvb3IodGhpcy5ncm91cC5nYW1lLndpZHRoIC8gMikgLSAxLCAwLCAyLCB0aGlzLmdyb3VwLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgfVxyXG4gICAgZHJhd0JhY2tncm91bmRIYWxmKHRpbGU6IFRpbGUsIGhhbGY6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBoYWxmX3dpZHRoID0gTWF0aC5mbG9vcih0aGlzLmdyb3VwLmdhbWUud2lkdGggLyAyKTtcclxuICAgICAgICBsZXQgaGFsZl9oZWlnaHQgPSB0aGlzLmdyb3VwLmdhbWUuaGVpZ2h0O1xyXG4gICAgICAgIGxldCBvZmZzZXRfeCA9IGhhbGYgKiBoYWxmX3dpZHRoO1xyXG5cclxuICAgICAgICBsZXQgYmdfaW1hZ2UgPSBBdHRhY2tTY3JlZW4uZ2V0QmFja2dyb3VuZFByZWZpeEZvclRpbGUodGlsZSk7XHJcbiAgICAgICAgbGV0IGJnX2hlaWdodCA9IDA7XHJcbiAgICAgICAgaWYgKGJnX2ltYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgYmdfaGVpZ2h0ID0gNDg7XHJcbiAgICAgICAgICAgIGxldCBiZ190aWxlc194ID0gTWF0aC5jZWlsKGhhbGZfd2lkdGggLyAoMiAqIDg4KSk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYmdfdGlsZXNfeDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLnNwcml0ZShvZmZzZXRfeCArIGkgKiA4OCwgMCwgYmdfaW1hZ2UgKyBcIl9iZ1wiLCAwLCB0aGlzLmdyb3VwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgdGlsZXNfeCA9IE1hdGguY2VpbChoYWxmX3dpZHRoIC8gMjQpO1xyXG4gICAgICAgIGxldCB0aWxlc195ID0gTWF0aC5jZWlsKChoYWxmX2hlaWdodCAtIGJnX2hlaWdodCkgLyAyNCk7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCB0aWxlc194OyB4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aWxlc195OyB5KyspIHtcclxuICAgICAgICAgICAgICAgIGxldCByYW5kID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTApO1xyXG4gICAgICAgICAgICAgICAgbGV0IHZhcmlhbnQgPSByYW5kID49IDkgPyAyIDogKHJhbmQgPj0gOCA/IDEgOiAwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuc3ByaXRlKG9mZnNldF94ICsgeCAqIDI0LCBiZ19oZWlnaHQgKyB5ICogMjQsIEF0dGFja1NjcmVlbi5nZXROYW1lRm9yVGlsZSh0aWxlKSwgdmFyaWFudCwgdGhpcy5ncm91cCk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb24gPT0gU2NyZWVuVHJhbnNpdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbiA9PSBTY3JlZW5UcmFuc2l0aW9uLkhpZGUpIHtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcy5iZWdpbkZpbGwoMHgwMDAwMDApO1xyXG4gICAgICAgICAgICBBdHRhY2tTY3JlZW4uZHJhd1RyYW5zaXRpb24odGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzLCAzMCwgdGhpcy5iYWNrZ3JvdW5kX2dyYXBoaWNzLCB0aGlzLmdyb3VwLmdhbWUud2lkdGgsIHRoaXMuZ3JvdXAuZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmJlZ2luRmlsbCgpO1xyXG4gICAgICAgICAgICBBdHRhY2tTY3JlZW4uZHJhd1RyYW5zaXRpb24odGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzLCAzMCwgdGhpcy50cmFuc2l0aW9uX21hc2ssIHRoaXMuZ3JvdXAuZ2FtZS53aWR0aCwgdGhpcy5ncm91cC5nYW1lLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrLmVuZEZpbGwoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcyA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB0cmFuc2l0aW9uIG1hc2sgbXVzdCBoYXZlIGEgZHJhd1JlY3QgY2FsbCB0byBiZSBhIG1hc2ssIG90aGVyd2lzZSBldmVyeXRoaW5nIGlzIHNob3duXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzID49IDMwKSB7XHJcbiAgICAgICAgICAgIGxldCB0cmFuc2l0aW9uID0gdGhpcy50cmFuc2l0aW9uO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLk5vbmU7XHJcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbkRpZEVuZCh0cmFuc2l0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MrKztcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyYW5zaXRpb25EaWRFbmQodHJhbnNpdGlvbjogU2NyZWVuVHJhbnNpdGlvbikge1xyXG4gICAgICAgIGlmICh0cmFuc2l0aW9uID09IFNjcmVlblRyYW5zaXRpb24uU2hvdykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZpbmlzaGVkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG5cclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MgPSAwO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbiA9IFNjcmVlblRyYW5zaXRpb24uU2hvdztcclxuICAgIH1cclxufVxyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
