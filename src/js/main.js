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
                if (this.keys.isKeyPressed(Key.Up) && this.delegate.cursor_still && this.delegate.cursor_target.y > 0) {
                    this.delegate.cursor_target.move(Direction.Up);
                }
                else if (this.keys.isKeyPressed(Key.Right) && this.delegate.cursor_still && this.delegate.cursor_target.x < this.map.width - 1) {
                    this.delegate.cursor_target.move(Direction.Right);
                }
                else if (this.keys.isKeyPressed(Key.Down) && this.delegate.cursor_still && this.delegate.cursor_target.y < this.map.height - 1) {
                    this.delegate.cursor_target.move(Direction.Down);
                }
                else if (this.keys.isKeyPressed(Key.Left) && this.delegate.cursor_still && this.delegate.cursor_target.x > 0) {
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
        this.intro_progress = 100;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsImludGVyYWN0aW9uLnRzIiwiYWkudHMiLCJ1dGlsLnRzIiwic3ByaXRlLnRzIiwicG5nbG9hZGVyLnRzIiwibG9hZGVyLnRzIiwiaW5wdXQudHMiLCJmcmFtZS50cyIsIm1pbmltYXAudHMiLCJwbGF5ZXIudHMiLCJhbmltYXRpb24udHMiLCJlbnRpdHkudHMiLCJlbnRpdHlyYW5nZS50cyIsIm1hcC50cyIsInRpbGVtYW5hZ2VyLnRzIiwiZW50aXR5bWFuYWdlci50cyIsInNtb2tlLnRzIiwic21va2VtYW5hZ2VyLnRzIiwiZnJhbWVtYW5hZ2VyLnRzIiwibWVudS50cyIsImdhbWVjb250cm9sbGVyLnRzIiwibWFpbm1lbnUudHMiLCJhbmNpZW50ZW1waXJlcy50cyIsImF0dGFja3NjcmVlbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxJQUFLLFdBR0o7QUFIRCxXQUFLLFdBQVc7SUFDWiw2Q0FBSSxDQUFBO0lBQ0osK0NBQUssQ0FBQTtBQUNULENBQUMsRUFISSxXQUFXLEtBQVgsV0FBVyxRQUdmO0FBQ0Q7SUEwQ0ksZ0JBQVksQ0FBUyxFQUFFLENBQVMsRUFBRSxLQUFtQixFQUFFLEtBQWtCLEVBQUUsSUFBYTtRQUNwRixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNYLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBMUNNLGVBQVEsR0FBZixVQUFnQixLQUFrQixFQUFFLE1BQWM7UUFDOUMsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLFdBQVcs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QUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLEtBQUssSUFBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxzQ0FBc0M7UUFDdEMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNqRixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEcsS0FBSyxJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDbkMsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUNqRCxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDbEUsRUFBRSxD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LEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUN0QyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4QyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUV4QyxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3BELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0QsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM5RCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDaEUsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDcEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDdkMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDOUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFJNUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNsRCxTQUFTLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25ELFNBQVMsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDdEQsU0FBUyxDQUFDLGVB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QU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFOUUsSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLE1BQU0sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM3RSxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMvRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdFLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFN0UsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFF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QUMsQ0FBQztRQUNuQixJQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQztRQUUxQixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXRELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEUsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBRTNCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUVsQyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBRW5ELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJ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LElBQUksQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7WUFDeEMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFDRCxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBRU8sdUNBQWdCLEdBQXhCLFVBQXlCLFVBQTRCO1FBQ2pELEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDeEIsTUFBTSxDQUFDO1FBQ1gsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVaLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLFVBQVUsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUM7SUFDNUMsQ0FBQztJQUNMLG1CQUFDO0FBQUQsQ0F0TEEsQUFzTEMsSUFBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZW51bSBBRUZvbnRTdHlsZSB7XHJcbiAgICBCb2xkLFxyXG4gICAgTGFyZ2VcclxufVxyXG5jbGFzcyBBRUZvbnQge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgdGV4dDogc3RyaW5nO1xyXG4gICAgZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGxldHRlcnM6IFBoYXNlci5JbWFnZVtdO1xyXG4gICAgcHJpdmF0ZSBzdHlsZTogQUVGb250U3R5bGU7XHJcblxyXG4gICAgc3RhdGljIGdldFdpZHRoKHN0eWxlOiBBRUZvbnRTdHlsZSwgbGVuZ3RoOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAoc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gNyAqIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDEwICogbGVuZ3RoO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldEZvbnRJbmRleChzdHlsZTogQUVGb250U3R5bGUsIGNoYXI6IG51bWJlcik6IG51bWJlciB7XHJcblxyXG4gICAgICAgIGlmIChzdHlsZSA9PSBBRUZvbnRTdHlsZS5MYXJnZSkge1xyXG4gICAgICAgICAgICAvLyBsYXJnZSBmb250XHJcbiAgICAgICAgICAgIGlmIChjaGFyID49IDQ4ICYmIGNoYXIgPD0gNTcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJEb24ndCByZWNvZ25pemUgY2hhciBjb2RlIFwiICsgY2hhciArIFwiIGZvciBmb250IGxhcmdlXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGJvbGQgZm9udFxyXG5cclxuICAgICAgICBpZiAoY2hhciA+PSA2NSAmJiBjaGFyIDwgOTApIHsgLy8gY2FwaXRhbCBsZXR0ZXJzIHdpdGhvdXQgWlxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDY1O1xyXG4gICAgICAgIH1lbHNlIGlmIChjaGFyID49IDQ5ICYmIGNoYXIgPD0gNTcpIHsgLy8gYWxsIG51bWJlcnMgd2l0aG91dCAwXHJcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDkgKyAyNztcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0OCkgeyAvLyAwXHJcbiAgICAgICAgICAgIHJldHVybiAxNDsgLy8gcmV0dXJuIE9cclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0NSkgeyAvLyAtXHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0MykgeyAvLyArXHJcbiAgICAgICAgICAgIHJldHVybiAyNjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9uJ3QgcmVjb2duaXplIGNoYXIgY29kZSBcIiArIGNoYXIgKyBcIiBmb3IgZm9udCBib2xkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgc3R5bGU6IEFFRm9udFN0eWxlLCB0ZXh0Pzogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0IHx8IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgc2V0VGV4dCh0ZXh0OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlUG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLnggPSB4O1xyXG4gICAgICAgIHRoaXMueSA9IHk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGxldHRlciBvZiB0aGlzLmxldHRlcnMpIHtcclxuICAgICAgICAgICAgbGV0dGVyLnggPSB4O1xyXG4gICAgICAgICAgICBsZXR0ZXIueSA9IHk7XHJcbiAgICAgICAgICAgIHggKz0gbGV0dGVyLndpZHRoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzZXRWaXNpYmlsaXR5KHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBmb3IgKGxldCBsZXR0ZXIgb2YgdGhpcy5sZXR0ZXJzKSB7XHJcbiAgICAgICAgICAgIGxldHRlci52aXNpYmxlID0gdmlzaWJsZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXcoKSB7XHJcbiAgICAgICAgbGV0IGw6IFBoYXNlci5JbWFnZVtdID0gW107XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLng7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnRleHQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGNoYXIgPSB0aGlzLnRleHQuY2hhckNvZGVBdChpKTtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gQUVGb250LmdldEZvbnRJbmRleCh0aGlzLnN0eWxlLCBjaGFyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgIHggKz0gQUVGb250LmdldFdpZHRoKHRoaXMuc3R5bGUsIDEpO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBmb250X25hbWU6IHN0cmluZztcclxuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuQm9sZCkge1xyXG4gICAgICAgICAgICAgICAgZm9udF9uYW1lID0gXCJjaGFyc1wiO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3R5bGUgPT0gQUVGb250U3R5bGUuTGFyZ2UpIHtcclxuICAgICAgICAgICAgICAgIGZvbnRfbmFtZSA9IFwibGNoYXJzXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZTogUGhhc2VyLkltYWdlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5sZXR0ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgICAgIGltYWdlID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuaW1hZ2UoeCwgdGhpcy55LCBmb250X25hbWUsIG51bGwsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGltYWdlLmZyYW1lID0gaW5kZXg7XHJcbiAgICAgICAgICAgIGwucHVzaChpbWFnZSk7XHJcbiAgICAgICAgICAgIHggKz0gaW1hZ2Uud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHdoaWxlICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGV0dGVyID0gdGhpcy5sZXR0ZXJzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIGxldHRlci5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IGw7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEludGVyYWN0aW9uRGVsZWdhdGUge1xyXG5cclxuICAgIGdhbWU6IFBoYXNlci5HYW1lO1xyXG5cclxuICAgIGZyYW1lX21hbmFnZXI6IEZyYW1lTWFuYWdlcjtcclxuICAgIGN1cnNvcl9zdGlsbDogYm9vbGVhbjtcclxuICAgIGNhbWVyYV9zdGlsbDogYm9vbGVhbjtcclxuICAgIGN1cnNvcl90YXJnZXQ6IFBvcztcclxuICAgIGN1cnNvcjogU3ByaXRlO1xyXG5cclxuICAgIGJ1eUVudGl0eShraW5nOiBFbnRpdHksIHR5cGU6IEVudGl0eVR5cGUpOiBFbnRpdHk7XHJcbiAgICBuZXh0VHVybigpOiB2b2lkO1xyXG4gICAgZ2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlOiBBbGxpYW5jZSk6IG51bWJlcjtcclxuICAgIHNldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UsIGdvbGQ6IG51bWJlcik6IHZvaWQ7XHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBib29sZWFuO1xyXG4gICAgZGVzZWxlY3RFbnRpdHkoY2hhbmdlZDogYm9vbGVhbik6IHZvaWQ7XHJcbiAgICBzaG93UmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVJhbmdlO1xyXG4gICAgaGlkZVJhbmdlKCk6IHZvaWQ7XHJcblxyXG4gICAgbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSwgdGFyZ2V0OiBQb3MsIGFuaW1hdGU6IGJvb2xlYW4pOiBib29sZWFuO1xyXG4gICAgb2NjdXB5KHBvc2l0aW9uOiBQb3MsIGFsbGlhbmNlOiBBbGxpYW5jZSk6IHZvaWQ7XHJcbiAgICBhdHRhY2tFbnRpdHkoZW50aXR5OiBFbnRpdHksIHRhcmdldDogRW50aXR5KTogdm9pZDtcclxuICAgIHJhaXNlRW50aXR5KHdpemFyZDogRW50aXR5LCBkZWFkOiBFbnRpdHkpOiB2b2lkO1xyXG4gICAgc2hvd0luZm8oYWxsOiBib29sZWFuKTogdm9pZDtcclxuICAgIGhpZGVJbmZvKGFsbDogYm9vbGVhbik6IHZvaWQ7XHJcblxyXG4gICAgbG9hZEdhbWUoKTogYm9vbGVhbjtcclxuICAgIHNhdmVHYW1lKCk6IHZvaWQ7XHJcbiAgICBleGl0R2FtZSgpOiB2b2lkO1xyXG59XHJcblxyXG5jbGFzcyBJbnRlcmFjdGlvbiBpbXBsZW1lbnRzIEVudGl0eU1hbmFnZXJEZWxlZ2F0ZSwgTWVudURlbGVnYXRlIHtcclxuICAgIGN1cnNvcl9wb3NpdGlvbjogUG9zO1xyXG5cclxuICAgIHByb3RlY3RlZCBhbGxpYW5jZTogQWxsaWFuY2U7XHJcbiAgICBwcm90ZWN0ZWQgbWFwOiBNYXA7XHJcbiAgICBwcm90ZWN0ZWQgZGVsZWdhdGU6IEludGVyYWN0aW9uRGVsZWdhdGU7XHJcblxyXG4gICAgcHJvdGVjdGVkIHNlbGVjdGVkX2VudGl0eTogRW50aXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFsbGlhbmNlOiBBbGxpYW5jZSwgbWFwOiBNYXAsIGRlbGVnYXRlOiBJbnRlcmFjdGlvbkRlbGVnYXRlKSB7XHJcbiAgICAgICAgdGhpcy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuICAgIH1cclxuICAgIGlzUGxheWVyKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGlzQWN0aXZlKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAhIXRoaXMuZ2V0Q3Vyc29yUG9zaXRpb24oKTtcclxuICAgIH1cclxuICAgIHNldEN1cnNvclBvc2l0aW9uKHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLmN1cnNvcl9wb3NpdGlvbiA9IHBvc2l0aW9uLmNvcHkoKTtcclxuICAgIH1cclxuICAgIGdldEN1cnNvclBvc2l0aW9uKCk6IFBvcyB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5jdXJzb3JfcG9zaXRpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3Vyc29yX3Bvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGtpbmcgPSB0aGlzLm1hcC5nZXRLaW5nUG9zaXRpb24odGhpcy5hbGxpYW5jZSk7XHJcbiAgICAgICAgaWYgKCEha2luZykge1xyXG4gICAgICAgICAgICByZXR1cm4ga2luZy5jb3B5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBvd25fZW50aXRpZXMgPSB0aGlzLm1hcC5nZXRFbnRpdGllc1dpdGgodGhpcy5hbGxpYW5jZSk7XHJcbiAgICAgICAgaWYgKG93bl9lbnRpdGllcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBvd25fZW50aXRpZXNbMF0ucG9zaXRpb247XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50XHJcbiAgICB9XHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50ZWRcclxuICAgIH1cclxuICAgIGVudGl0eURpZE1vdmUoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyBpbXBsZW1lbnRcclxuICAgIH1cclxuICAgIGVudGl0eURpZEFuaW1hdGlvbihlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIC8vIGltcGxlbWVudFxyXG4gICAgfVxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50XHJcbiAgICB9XHJcbiAgICBjbG9zZU1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgLy8gaW1wbGVtZW50XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE5vQUkgZXh0ZW5kcyBJbnRlcmFjdGlvbiB7XHJcbiAgICBydW4oKSB7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5uZXh0VHVybigpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpbnRlcmFjdGlvbi50c1wiIC8+XHJcblxyXG5lbnVtIEFJU3RhdGUge1xyXG4gICAgTm9uZSxcclxuICAgIFNlbGVjdCxcclxuICAgIE1vdmluZyxcclxuICAgIEFjdGlvbixcclxuICAgIEF0dGFjayxcclxuICAgIFJhaXNlLFxyXG4gICAgRGVzZWxlY3RcclxufVxyXG5cclxuY2xhc3MgQUkgZXh0ZW5kcyBJbnRlcmFjdGlvbiB7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfc2VsZWN0ZWQ6IEVudGl0eTtcclxuICAgIHByaXZhdGUgZW50aXR5X2F0dGFjazogRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBlbnRpdHlfcmFpc2U6IEVudGl0eTtcclxuICAgIHByaXZhdGUgZW50aXR5X3RhcmdldDogUG9zO1xyXG5cclxuICAgIHByaXZhdGUgc29sZGllcnM6IEVudGl0eVtdO1xyXG4gICAgcHJpdmF0ZSBuZWFyZXN0X2hvdXNlOiBCdWlsZGluZztcclxuXHJcbiAgICBwcml2YXRlIHN0YXRlOiBBSVN0YXRlO1xyXG4gICAgcHJpdmF0ZSBwYXVzZTogYm9vbGVhbjtcclxuICAgIHByaXZhdGUgdGVzdDogRW50aXR5VHlwZVtdO1xyXG5cclxuICAgIHN0YXRpYyBnZXRUaWxlU2NvcmUodGlsZTogVGlsZSkge1xyXG4gICAgICAgIHN3aXRjaCAodGlsZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuTW91bnRhaW46XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhbGxpYW5jZTogQWxsaWFuY2UsIG1hcDogTWFwLCBkZWxlZ2F0ZTogSW50ZXJhY3Rpb25EZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKGFsbGlhbmNlLCBtYXAsIGRlbGVnYXRlKTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuTm9uZTtcclxuICAgICAgICB0aGlzLnBhdXNlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50ZXN0ID0gW0VudGl0eVR5cGUuV2l6YXJkLCBFbnRpdHlUeXBlLkxpemFyZF07XHJcbiAgICB9XHJcblxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LldhaXQpIHtcclxuICAgICAgICAgICAgdGhpcy5wYXVzZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ID09IElucHV0Q29udGV4dC5XYWl0KSB7XHJcbiAgICAgICAgICAgIHRoaXMucGF1c2UgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLkFjdGlvbjtcclxuICAgIH1cclxuICAgIGVudGl0eURpZEFuaW1hdGlvbihlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yLnNob3coKTtcclxuICAgICAgICB0aGlzLnN0YXRlID0gQUlTdGF0ZS5EZXNlbGVjdDtcclxuICAgIH1cclxuICAgIHJ1bigpIHtcclxuXHJcbiAgICAgICAgLy8gd2FpdCBmb3Igbm8gbW92ZW1lbnRcclxuICAgICAgICBpZiAoIXRoaXMuZGVsZWdhdGUuY2FtZXJhX3N0aWxsIHx8ICF0aGlzLmRlbGVnYXRlLmN1cnNvcl9zdGlsbCB8fCB0aGlzLnBhdXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9IEFJU3RhdGUuTm9uZSkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMuc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgQUlTdGF0ZS5TZWxlY3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmVudGl0eV90YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUubW92ZUVudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgdGhpcy5lbnRpdHlfdGFyZ2V0LCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuTW92aW5nO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X3RhcmdldC5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBBSVN0YXRlLkFjdGlvbjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISF0aGlzLmVudGl0eV9hdHRhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmVudGl0eV9hdHRhY2sucG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmF0dGFja0VudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgdGhpcy5lbnRpdHlfYXR0YWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLkF0dGFjaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IHRoaXMuZW50aXR5X2F0dGFjay5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvci5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuQXR0YWNrLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZWxlY3RUYXJnZXRJblJhbmdlKHRoaXMuZW50aXR5X2F0dGFjayk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5lbnRpdHlfcmFpc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmVudGl0eV9yYWlzZS5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUucmFpc2VFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIHRoaXMuZW50aXR5X3JhaXNlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLlJhaXNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLlJhaXNlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSB0aGlzLmVudGl0eV9yYWlzZS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRfZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuT2NjdXB5SG91c2UpICYmIHRoaXMubWFwLmdldFRpbGVBdCh0aGlzLmVudGl0eV90YXJnZXQpID09IFRpbGUuSG91c2UgJiYgdGhpcy5tYXAuZ2V0QWxsaWFuY2VBdCh0aGlzLmVudGl0eV90YXJnZXQpICE9IHRoaXMuYWxsaWFuY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5vY2N1cHkodGhpcy5lbnRpdHlfdGFyZ2V0LCB0aGlzLmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuRGVzZWxlY3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIEFJU3RhdGUuRGVzZWxlY3Q6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZGVzZWxlY3RFbnRpdHkodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IEFJU3RhdGUuTm9uZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5tYXAuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSAhPSB0aGlzLmFsbGlhbmNlIHx8IGVudGl0eS5zdGF0ZSAhPSBFbnRpdHlTdGF0ZS5SZWFkeSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoZW50aXR5LnR5cGUgPT0gOSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIGtpbmcgYWx3YXlzIGxhc3RcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5jb3VudEVudGl0aWVzV2l0aCh0aGlzLmFsbGlhbmNlLCBFbnRpdHlTdGF0ZS5SZWFkeSkgIT0gMSkgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5nZXRUaWxlQXQoZW50aXR5LnBvc2l0aW9uKSA9PSBUaWxlLkNhc3RsZSAmJiB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8ga2luZyBpcyBpbiBjYXN0bGUgb3duZWQgYnkgaGltXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5jb3VudEVudGl0aWVzV2l0aCh0aGlzLmFsbGlhbmNlLCB1bmRlZmluZWQsIEVudGl0eVR5cGUuU29sZGllcikgPCAyICYmIHRoaXMuY2hlY2tDb3N0QW5kU3BhY2UoZW50aXR5LnBvc2l0aW9uLCBFbnRpdHlUeXBlLlNvbGRpZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGxlc3MgdGhhbiB0d28gc29sZGllcnMsIGJ1eSBvbmUgaWYgZW5vdWdoIGNvc3QgYW5kIHNwYWNlIGFyb3VuZCBjYXN0bGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5ID0gdGhpcy5kZWxlZ2F0ZS5idXlFbnRpdHkoZW50aXR5LCBFbnRpdHlUeXBlLlNvbGRpZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50ZXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZGVsZWdhdGUuZ2V0R29sZEZvckFsbGlhbmNlKHRoaXMuYWxsaWFuY2UpID49IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTW3RoaXMudGVzdFswXV0uY29zdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50aXR5ID0gdGhpcy5kZWxlZ2F0ZS5idXlFbnRpdHkoZW50aXR5LCB0aGlzLnRlc3RbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50ZXN0LnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcG9zc2libGU6IEVudGl0eVR5cGVbXSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0eXBlID0gMTsgdHlwZSA8IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aDsgdHlwZSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXAuY291bnRFbnRpdGllc1dpdGgodGhpcy5hbGxpYW5jZSwgdW5kZWZpbmVkLCA8RW50aXR5VHlwZT4gdHlwZSkgPj0gMSAmJiBBbmNpZW50RW1waXJlcy5FTlRJVElFU1t0eXBlXS5jb3N0IDwgNjAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuY2hlY2tDb3N0QW5kU3BhY2UoZW50aXR5LnBvc2l0aW9uLCA8RW50aXR5VHlwZT4gdHlwZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc3NpYmxlLnB1c2goPEVudGl0eVR5cGU+IHR5cGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwb3NzaWJsZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgY2hvaWNlID0gcG9zc2libGVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcG9zc2libGUubGVuZ3RoKV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSB0aGlzLmRlbGVnYXRlLmJ1eUVudGl0eShlbnRpdHksIGNob2ljZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBSVN0YXRlLlNlbGVjdDtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfc2VsZWN0ZWQgPSBlbnRpdHk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgIGxldCBlbnRpdHlfcmFuZ2UgPSB0aGlzLmRlbGVnYXRlLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuTW92ZSwgZW50aXR5KTtcclxuICAgICAgICAgICAgZW50aXR5X3JhbmdlLnNvcnQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc29sZGllcnMgPSB0aGlzLm1hcC5nZXRFbnRpdGllc1dpdGgodGhpcy5hbGxpYW5jZSwgdW5kZWZpbmVkLCBFbnRpdHlUeXBlLlNvbGRpZXIpO1xyXG4gICAgICAgICAgICB0aGlzLm5lYXJlc3RfaG91c2UgPSB0aGlzLm1hcC5nZXROZWFyZXN0SG91c2VGb3JFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICAgICAgbGV0IGJlc3RfbW92ZV9zY29yZSA9IDA7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiBlbnRpdHlfcmFuZ2Uud2F5cG9pbnRzKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZSA9IHRoaXMubWFwLmdldEVudGl0eUF0KHdheXBvaW50LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIGlmICghIWUgJiYgZSAhPSBlbnRpdHkpIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIWVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbnRBdHRhY2tBZnRlck1vdmluZykgfHwgZSA9PSBlbnRpdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0cyA9IHRoaXMubWFwLmdldEF0dGFja1RhcmdldHMoZW50aXR5LCB3YXlwb2ludC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdGFyZ2V0IG9mIHRhcmdldHMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5nZXRTY29yZShlbnRpdHksIHdheXBvaW50LnBvc2l0aW9uLCB0YXJnZXQsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcmUgPD0gYmVzdF9tb3ZlX3Njb3JlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlc3RfbW92ZV9zY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9yYWlzZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X2F0dGFjayA9IHRhcmdldDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfdGFyZ2V0ID0gd2F5cG9pbnQucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5SYWlzZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0cyA9IHRoaXMubWFwLmdldFJhaXNlVGFyZ2V0cyhlbnRpdHksIHdheXBvaW50LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCB0YXJnZXQgb2YgdGFyZ2V0cykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgc2NvcmUgPSB0aGlzLmdldFNjb3JlKGVudGl0eSwgd2F5cG9pbnQucG9zaXRpb24sIG51bGwsIHRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzY29yZSA8PSBiZXN0X21vdmVfc2NvcmUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYmVzdF9tb3ZlX3Njb3JlID0gc2NvcmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X2F0dGFjayA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X3JhaXNlID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV90YXJnZXQgPSB3YXlwb2ludC5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IHNjb3JlID0gdGhpcy5nZXRTY29yZShlbnRpdHksIHdheXBvaW50LnBvc2l0aW9uLCBudWxsLCBudWxsKTtcclxuICAgICAgICAgICAgICAgIGlmIChzY29yZSA8PSBiZXN0X21vdmVfc2NvcmUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgIGJlc3RfbW92ZV9zY29yZSA9IHNjb3JlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHlfYXR0YWNrID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X3JhaXNlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5X3RhcmdldCA9IHdheXBvaW50LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc29sZGllcnMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUubmV4dFR1cm4oKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gZW50aXR5O1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjaGVja0Nvc3RBbmRTcGFjZShwb3NpdGlvbjogUG9zLCB0eXBlOiBFbnRpdHlUeXBlKTogYm9vbGVhbiB7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBlbm91Z2ggZ29sZFxyXG4gICAgICAgIGlmICh0aGlzLmRlbGVnYXRlLmdldEdvbGRGb3JBbGxpYW5jZSh0aGlzLmFsbGlhbmNlKSA8IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTWzxudW1iZXI+IHR5cGVdLmNvc3QpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGZvciBlbXB0eSBzcGFjZSBhcm91bmQgY2FzdGxlXHJcbiAgICAgICAgbGV0IHdheXBvaW50cyA9IHRoaXMubWFwLmVudGl0eV9yYW5nZS5jYWxjdWxhdGVXYXlwb2ludHMocG9zaXRpb24sIHRoaXMuYWxsaWFuY2UsIHR5cGUsIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTWzxudW1iZXI+IHR5cGVdLm1vdiwgdHJ1ZSk7XHJcbiAgICAgICAgLy8gY2FudCBiZSBvbiBjYXN0bGUgLT4gbWluIDIgd2F5cG9pbnRzXHJcbiAgICAgICAgaWYgKHdheXBvaW50cy5sZW5ndGggPCAyKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRTY29yZShlbnRpdHk6IEVudGl0eSwgcG9zaXRpb246IFBvcywgYXR0YWNrOiBFbnRpdHksIHJhaXNlOiBFbnRpdHkpIHtcclxuICAgICAgICBsZXQgc2NvcmUgPSAwO1xyXG4gICAgICAgIHN3aXRjaCAoZW50aXR5LnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlUeXBlLlNvbGRpZXI6XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gbW92ZSB0b3dhcmRzIG5lYXJlc3QgaG91c2UgKHVub2NjdXBpZWQgZm9yIHNvbGRpZXJzKVxyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5tYXAuZ2V0S2luZ1Bvc2l0aW9uKHRoaXMuYWxsaWFuY2UpICYmICEhdGhpcy5uZWFyZXN0X2hvdXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNjb3JlX2hvdXNlID0gdGhpcy5tYXAud2lkdGggKyB0aGlzLm1hcC5oZWlnaHQgLSBwb3NpdGlvbi5kaXN0YW5jZVRvKHRoaXMubmVhcmVzdF9ob3VzZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgKz0gc2NvcmVfaG91c2UgKiBzY29yZV9ob3VzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBnaXZlIGFkdmFudGFnZXMgdG8gY2VydGFpbiB0aWxlcyAoc3RheSBhd2F5IGZyb20gZGlmZmljdWx0IHRlcnJhaW4pXHJcbiAgICAgICAgICAgICAgICBpZiAoQUkuZ2V0VGlsZVNjb3JlKHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbikpIDw9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSA1O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHNwcmVhZCBzb2xkaWVyc1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc29sZGllciBvZiB0aGlzLnNvbGRpZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvbGRpZXIgPT0gZW50aXR5KSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNjb3JlX3NvbGRpZXJzID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkoc29sZGllcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgKz0gc2NvcmVfc29sZGllcnMgKiBzY29yZV9zb2xkaWVycztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBhYmxlIHRvIG9jY3VweSBob3VzZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFwLmdldFRpbGVBdChwb3NpdGlvbikgPT0gVGlsZS5Ib3VzZSAmJiB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKSAhPSBlbnRpdHkuYWxsaWFuY2UgJiYgIWF0dGFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHNjb3JlICs9IDIwMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVR5cGUuV2l6YXJkOlxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGFibGUgdG8gcmFpc2UgdW5pdFxyXG4gICAgICAgICAgICAgICAgaWYgKCEhcmFpc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlUeXBlLktpbmc6XHJcblxyXG4gICAgICAgICAgICAgICAgLy8ga2VlcCBzdGlsbFxyXG4gICAgICAgICAgICAgICAgaWYgKHBvc2l0aW9uLm1hdGNoKGVudGl0eS5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29yZSArPSAyMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGdldCBzY29yZSBmb3IgYXR0YWNrXHJcbiAgICAgICAgaWYgKCEhYXR0YWNrKSB7XHJcbiAgICAgICAgICAgIGlmIChhdHRhY2suc2hvdWxkQ291bnRlcihwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHNjb3JlICs9IGVudGl0eS5nZXRQb3dlckVzdGltYXRlKHBvc2l0aW9uLCB0aGlzLm1hcCkgLSBhdHRhY2suZ2V0UG93ZXJFc3RpbWF0ZShwb3NpdGlvbiwgdGhpcy5tYXApICsgMTAgLSBhdHRhY2suaGVhbHRoO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUgKz0gZW50aXR5LmdldFBvd2VyRXN0aW1hdGUocG9zaXRpb24sIHRoaXMubWFwKSAqIDI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGF0dGFjay50eXBlID09IEVudGl0eVR5cGUuS2luZykge1xyXG4gICAgICAgICAgICAgICAgc2NvcmUgKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3JlICs9IHRoaXMubWFwLmdldERlZkF0KHBvc2l0aW9uLCBlbnRpdHkudHlwZSkgKiAyO1xyXG4gICAgICAgIGxldCBlbmVteV9raW5nX3BvcyA9IHRoaXMubWFwLmdldEtpbmdQb3NpdGlvbih0aGlzLmFsbGlhbmNlID09IEFsbGlhbmNlLlJlZCA/IEFsbGlhbmNlLkJsdWUgOiBBbGxpYW5jZS5SZWQpO1xyXG4gICAgICAgIGlmICghIWVuZW15X2tpbmdfcG9zKSB7XHJcbiAgICAgICAgICAgIHNjb3JlICs9ICh0aGlzLm1hcC53aWR0aCArIHRoaXMubWFwLmhlaWdodCAtIHBvc2l0aW9uLmRpc3RhbmNlVG8oZW5lbXlfa2luZ19wb3MpKSAqIDI7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gZ2V0IHNjb3JlIGlmIGluanVyZWQgb24gaG91c2UgKGhlYWxpbmcgZWZmZWN0KVxyXG4gICAgICAgIGlmICh0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pID09IFRpbGUuSG91c2UgJiYgdGhpcy5tYXAuZ2V0QWxsaWFuY2VBdChwb3NpdGlvbikgPT0gZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIHNjb3JlICs9ICgxMCAtIGVudGl0eS5oZWFsdGgpICogMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGlmIGluanVyZWQsIG1vdmUgdG93YXJkcyBuZXh0IGhvdXNlXHJcbiAgICAgICAgaWYgKGVudGl0eS5oZWFsdGggPCA1ICYmIGVudGl0eS50eXBlICE9IEVudGl0eVR5cGUuU29sZGllciAmJiAhIXRoaXMubmVhcmVzdF9ob3VzZSkge1xyXG4gICAgICAgICAgICBsZXQgc2NvcmVfaW5qID0gdGhpcy5tYXAud2lkdGggKyB0aGlzLm1hcC5oZWlnaHQgLSBwb3NpdGlvbi5kaXN0YW5jZVRvKHRoaXMubmVhcmVzdF9ob3VzZS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIHNjb3JlICs9IHNjb3JlX2luaiAqIHNjb3JlX2luajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1hcC5nZXRNYXAoKSA9PSAyICYmICEhdGhpcy5uZWFyZXN0X2hvdXNlKSB7XHJcbiAgICAgICAgICAgIGxldCBkeCA9IE1hdGguYWJzKHRoaXMubmVhcmVzdF9ob3VzZS5wb3NpdGlvbi54IC0gcG9zaXRpb24ueCkgLSAxO1xyXG4gICAgICAgICAgICBsZXQgZHkgPSBNYXRoLmFicyh0aGlzLm5lYXJlc3RfaG91c2UucG9zaXRpb24ueSAtIHBvc2l0aW9uLnkpIC0gMztcclxuICAgICAgICAgICAgaWYgKGR4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHggPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkeSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR5ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgc2NvcmVfbTIgPSB0aGlzLm1hcC53aWR0aCArIHRoaXMubWFwLmhlaWdodCAtIDIgKiAoZHggKyBkeSk7XHJcbiAgICAgICAgICAgIHNjb3JlICs9IHNjb3JlX20yICogc2NvcmVfbTI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNjb3JlICs9IDEwICogZW50aXR5LnBvc2l0aW9uLmRpc3RhbmNlVG8ocG9zaXRpb24pIC8gKGVudGl0eS5kYXRhLm1vdiAtIDEpO1xyXG4gICAgICAgIHJldHVybiBNYXRoLmZsb29yKHNjb3JlKTtcclxuICAgIH1cclxufVxyXG4iLCJpbnRlcmZhY2UgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbn1cclxuY2xhc3MgUG9zIGltcGxlbWVudHMgSVBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIG1hdGNoKHA6IElQb3MpIHtcclxuICAgICAgICByZXR1cm4gKCEhcCAmJiB0aGlzLnggPT0gcC54ICYmIHRoaXMueSA9PSBwLnkpO1xyXG4gICAgfVxyXG4gICAgY29weShkaXJlY3Rpb246IERpcmVjdGlvbiA9IERpcmVjdGlvbi5Ob25lKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55IC0gMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICsgMSwgdGhpcy55KTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55ICsgMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggLSAxLCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMueS0tO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54Kys7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMueSsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLngtLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuICAgIGRpc3RhbmNlVG8gKHA6IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYWJzKHAueCAtIHRoaXMueCkgKyBNYXRoLmFicyhwLnkgLSB0aGlzLnkpO1xyXG4gICAgfVxyXG4gICAgZ2V0RGlyZWN0aW9uVG8gKHA6IFBvcyk6IERpcmVjdGlvbiB7XHJcbiAgICAgICAgaWYgKHAueCA+IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLlJpZ2h0OyB9XHJcbiAgICAgICAgaWYgKHAueCA8IHRoaXMueCkgeyByZXR1cm4gRGlyZWN0aW9uLkxlZnQ7IH1cclxuICAgICAgICBpZiAocC55ID4gdGhpcy55KSB7IHJldHVybiBEaXJlY3Rpb24uRG93bjsgfVxyXG4gICAgICAgIGlmIChwLnkgPCB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5VcDsgfVxyXG4gICAgICAgIHJldHVybiBEaXJlY3Rpb24uTm9uZTtcclxuICAgIH1cclxuICAgIGdldFdvcmxkUG9zaXRpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCB0aGlzLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgfVxyXG4gICAgZ2V0SSgpOiBJUG9zIHtcclxuICAgICAgICByZXR1cm4ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcclxuICAgIH1cclxufVxyXG5lbnVtIERpcmVjdGlvbiB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFVwID0gMSxcclxuICAgIFJpZ2h0ID0gMixcclxuICAgIERvd24gPSA0LFxyXG4gICAgTGVmdCA9IDgsXHJcbiAgICBBbGwgPSAxNVxyXG59XHJcbiIsImNsYXNzIFNwcml0ZSB7XHJcblxyXG4gICAgd29ybGRfcG9zaXRpb246IElQb3M7XHJcbiAgICBzcHJpdGU6IFBoYXNlci5TcHJpdGU7XHJcbiAgICBwcm90ZWN0ZWQgbmFtZTogc3RyaW5nO1xyXG4gICAgcHJvdGVjdGVkIGZyYW1lczogbnVtYmVyW107XHJcbiAgICBwcml2YXRlIG9mZnNldF94OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG9mZnNldF95OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGZyYW1lOiBudW1iZXI7XHJcblxyXG4gICAgaW5pdCh3b3JsZF9wb3NpdGlvbjogSVBvcywgZ3JvdXA6IFBoYXNlci5Hcm91cCwgbmFtZTogc3RyaW5nLCBmcmFtZXM6IG51bWJlcltdID0gW10pIHtcclxuICAgICAgICB0aGlzLndvcmxkX3Bvc2l0aW9uID0gd29ybGRfcG9zaXRpb247XHJcblxyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSAwO1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xyXG4gICAgICAgIHRoaXMuZnJhbWVzID0gZnJhbWVzO1xyXG5cclxuICAgICAgICB0aGlzLnNwcml0ZSA9IGdyb3VwLmdhbWUuYWRkLnNwcml0ZSh0aGlzLndvcmxkX3Bvc2l0aW9uLngsIHRoaXMud29ybGRfcG9zaXRpb24ueSwgdGhpcy5uYW1lKTtcclxuICAgICAgICB0aGlzLnNwcml0ZS5mcmFtZSA9IHRoaXMuZnJhbWVzWzBdO1xyXG4gICAgICAgIGdyb3VwLmFkZCh0aGlzLnNwcml0ZSk7XHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZXMoZnJhbWVzOiBudW1iZXJbXSwgZnJhbWU6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcclxuICAgICAgICB0aGlzLmZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWUgPSB0aGlzLmZyYW1lc1t0aGlzLmZyYW1lICUgdGhpcy5mcmFtZXMubGVuZ3RoXTtcclxuICAgIH1cclxuICAgIHNldE9mZnNldCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3ggPSB4O1xyXG4gICAgICAgIHRoaXMub2Zmc2V0X3kgPSB5O1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICBzZXRGcmFtZShmcmFtZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWUpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXNbdGhpcy5mcmFtZSAlIHRoaXMuZnJhbWVzLmxlbmd0aF07XHJcbiAgICB9XHJcbiAgICBzZXRXb3JsZFBvc2l0aW9uKHdvcmxkX3Bvc2l0aW9uOiBJUG9zKSB7XHJcbiAgICAgICAgdGhpcy53b3JsZF9wb3NpdGlvbiA9IHdvcmxkX3Bvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMudXBkYXRlKCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy53b3JsZF9wb3NpdGlvbi54ICsgdGhpcy5vZmZzZXRfeDtcclxuICAgICAgICB0aGlzLnNwcml0ZS55ID0gdGhpcy53b3JsZF9wb3NpdGlvbi55ICsgdGhpcy5vZmZzZXRfeTtcclxuICAgIH1cclxuICAgIGhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZGVzdHJveSgpO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFBOR1dhaXRlciB7XHJcblxyXG4gICAgYXdhaXRpbmc6IGJvb2xlYW47XHJcbiAgICBjb3VudGVyOiBudW1iZXI7XHJcbiAgICBjYWxsYmFjazogRnVuY3Rpb247XHJcbiAgICBjb25zdHJ1Y3RvcihjYWxsYmFjazogRnVuY3Rpb24pIHtcclxuICAgICAgICB0aGlzLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG5cclxuICAgIH1cclxuICAgIGF3YWl0KCkge1xyXG4gICAgICAgIHRoaXMuYXdhaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmNvdW50ZXIgPD0gMCkge1xyXG4gICAgICAgICAgICAvLyBpZiBpbWcub25sb2FkIGlzIHN5bmNocm9ub3VzXHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGQoKSB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyKys7XHJcbiAgICB9XHJcbiAgICByZXQgPSAoKSA9PiB7XHJcbiAgICAgICAgdGhpcy5jb3VudGVyLS07XHJcbiAgICAgICAgaWYgKHRoaXMuY291bnRlciA+IDAgfHwgIXRoaXMuYXdhaXRpbmcpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jYWxsYmFjaygpO1xyXG5cclxuICAgIH07XHJcbn1cclxuY2xhc3MgUE5HTG9hZGVyIHtcclxuICAgIHN0YXRpYyBidWZmZXJUb0Jhc2U2NChidWY6IFVpbnQ4QXJyYXkpIHtcclxuICAgICAgICBsZXQgYmluc3RyID0gQXJyYXkucHJvdG90eXBlLm1hcC5jYWxsKGJ1ZiwgZnVuY3Rpb24gKGNoOiBudW1iZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUoY2gpO1xyXG4gICAgICAgIH0pLmpvaW4oXCJcIik7XHJcbiAgICAgICAgcmV0dXJuIGJ0b2EoYmluc3RyKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgbG9hZFNwcml0ZVNoZWV0KHdhaXRlcjogUE5HV2FpdGVyLCBuYW1lOiBzdHJpbmcsIHRpbGVfd2lkdGg/OiBudW1iZXIsIHRpbGVfaGVpZ2h0PzogbnVtYmVyLCBudW1iZXJfb2ZfdGlsZXM/OiBudW1iZXIsIHZhcmlhdGlvbj86IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgc3ByaXRlc2hlZXRfbmFtZSA9IG5hbWU7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiB0aWxlX2hlaWdodCA9PSBcInVuZGVmaW5lZFwiIHx8IHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgICAgICBsZXQgYnVmZmVyOiBBcnJheUJ1ZmZlciA9IEFuY2llbnRFbXBpcmVzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KG5hbWUgKyBcIi5zcHJpdGVcIik7XHJcbiAgICAgICAgICAgIGxldCBkYXRhOiBEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhidWZmZXIpO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1iZXJfb2ZfdGlsZXMgPT0gXCJ1bmRlZmluZWRcIikgeyBudW1iZXJfb2ZfdGlsZXMgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV93aWR0aCA9PSBcInVuZGVmaW5lZFwiKSB7IHRpbGVfd2lkdGggPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGlsZV9oZWlnaHQgPT0gXCJ1bmRlZmluZWRcIikgeyB0aWxlX2hlaWdodCA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7IH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmNoZWNrQmluYXJ5S2V5KG5hbWUgKyBcIi5wbmdcIikpIHtcclxuICAgICAgICAgICAgLy8gYWxsIHRpbGVzIGFyZSBpbiBvbmUgZmlsZVxyXG4gICAgICAgICAgICBsZXQgcG5nX2J1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeShuYW1lICsgXCIucG5nXCIpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhcmlhdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlc2hlZXRfbmFtZSArPSBcIl9cIiArIHZhcmlhdGlvbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbGV0IGltZyA9IG5ldyBJbWFnZSgpO1xyXG5cclxuICAgICAgICAgICAgd2FpdGVyLmFkZCgpO1xyXG4gICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBpbWcsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaW1nLnNyYyA9IFwiZGF0YTppbWFnZS9wbmc7YmFzZTY0LFwiICsgUE5HTG9hZGVyLmJ1ZmZlclRvQmFzZTY0KG5ldyBVaW50OEFycmF5KHBuZ19idWZmZXIpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGlsZXMgYXJlIGluIG11bHRpcGxlIGZpbGVzIHdpdGggbmFtZXMgbmFtZV8wMC5wbmcsIG5hbWVfMDEucG5nLCAuLi5cclxuXHJcbiAgICAgICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICAgICAgbGV0IGlubmVyX3dhaXRlciA9IG5ldyBQTkdXYWl0ZXIod2FpdGVyLnJldCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3F1YXJlID0gTWF0aC5jZWlsKE1hdGguc3FydChudW1iZXJfb2ZfdGlsZXMpKTtcclxuICAgICAgICAgICAgbGV0IHNwcml0ZXNoZWV0ID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5hZGQuYml0bWFwRGF0YShzcXVhcmUgKiB0aWxlX3dpZHRoLCBzcXVhcmUgKiB0aWxlX2hlaWdodCk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyX29mX3RpbGVzOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBpZHg6IHN0cmluZyA9IGkgPCAxMCA/IChcIl8wXCIgKyBpKSA6IChcIl9cIiArIGkpO1xyXG4gICAgICAgICAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIGlkeCArIFwiLnBuZ1wiKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBwbmdfYnVmZmVyID0gUE5HTG9hZGVyLmNyZWF0ZVZhcmlhdGlvbihwbmdfYnVmZmVyLCB2YXJpYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0X25hbWUgKz0gXCJfXCIgKyB2YXJpYXRpb247XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcbiAgICAgICAgICAgICAgICBpbm5lcl93YWl0ZXIuYWRkKCk7XHJcbiAgICAgICAgICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZXNoZWV0LmN0eC5kcmF3SW1hZ2UoaW1nLCAoaSAlIHNxdWFyZSkgKiB0aWxlX3dpZHRoLCBNYXRoLmZsb29yKGkgLyBzcXVhcmUpICogdGlsZV9oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyX3dhaXRlci5yZXQoKTtcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gXCJkYXRhOmltYWdlL3BuZztiYXNlNjQsXCIgKyBQTkdMb2FkZXIuYnVmZmVyVG9CYXNlNjQobmV3IFVpbnQ4QXJyYXkocG5nX2J1ZmZlcikpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlubmVyX3dhaXRlci5hd2FpdCgpO1xyXG5cclxuICAgICAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5hZGRTcHJpdGVTaGVldChzcHJpdGVzaGVldF9uYW1lLCBudWxsLCBzcHJpdGVzaGVldC5jYW52YXMsIHRpbGVfd2lkdGgsIHRpbGVfaGVpZ2h0LCBudW1iZXJfb2ZfdGlsZXMpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvYWRJbWFnZSh3YWl0ZXI6IFBOR1dhaXRlciwgbmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgbGV0IHBuZ19idWZmZXI6IEFycmF5QnVmZmVyID0gQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkobmFtZSArIFwiLnBuZ1wiKTtcclxuICAgICAgICBsZXQgaW1nID0gbmV3IEltYWdlKCk7XHJcblxyXG4gICAgICAgIHdhaXRlci5hZGQoKTtcclxuICAgICAgICBpbWcub25sb2FkID0gKCkgPT4ge1xyXG4gICAgICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmFkZEltYWdlKG5hbWUsIG51bGwsIGltZyk7XHJcbiAgICAgICAgICAgIHdhaXRlci5yZXQoKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGltZy5zcmMgPSBcImRhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxcIiArIFBOR0xvYWRlci5idWZmZXJUb0Jhc2U2NChuZXcgVWludDhBcnJheShwbmdfYnVmZmVyKSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGNyZWF0ZVZhcmlhdGlvbihidWZmZXI6IEFycmF5QnVmZmVyLCB2YXJpYXRpb24/OiBudW1iZXIpOiBBcnJheUJ1ZmZlciB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFyaWF0aW9uID09IFwidW5kZWZpbmVkXCIpIHsgcmV0dXJuIGJ1ZmZlcjsgfVxyXG5cclxuICAgICAgICBidWZmZXIgPSBidWZmZXIuc2xpY2UoMCk7IC8vIGNvcHkgYnVmZmVyIChvdGhlcndpc2Ugd2UgbW9kaWZ5IG9yaWdpbmFsIGRhdGEsIHNhbWUgYXMgaW4gY2FjaGUpXHJcbiAgICAgICAgbGV0IGRhdGEgPSBuZXcgRGF0YVZpZXcoYnVmZmVyKTtcclxuXHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuICAgICAgICBsZXQgc3RhcnRfcGx0ZSA9IDA7XHJcblxyXG4gICAgICAgIGZvciAoOyBpbmRleCA8IGRhdGEuYnl0ZUxlbmd0aCAtIDM7IGluZGV4KyspIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuZ2V0VWludDgoaW5kZXgpICE9IDgwIHx8IGRhdGEuZ2V0VWludDgoaW5kZXggKyAxKSAhPSA3NiB8fCBkYXRhLmdldFVpbnQ4KGluZGV4ICsgMikgIT0gODQpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgc3RhcnRfcGx0ZSA9IGluZGV4IC0gNDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGluZGV4ID0gc3RhcnRfcGx0ZTtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aF9wbHRlID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGxldCBjcmMgPSAtMTsgLy8gMzIgYml0XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGluZGV4ICsgaSksIGNyYyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBpbmRleDsgaSA8IGluZGV4ICsgbGVuZ3RoX3BsdGU7IGkgKz0gMykge1xyXG4gICAgICAgICAgICBsZXQgcmVkOiBudW1iZXIgPSBkYXRhLmdldFVpbnQ4KGkpO1xyXG4gICAgICAgICAgICBsZXQgZ3JlZW46IG51bWJlciA9IGRhdGEuZ2V0VWludDgoaSArIDEpO1xyXG4gICAgICAgICAgICBsZXQgYmx1ZTogbnVtYmVyID0gZGF0YS5nZXRVaW50OChpICsgMik7XHJcblxyXG4gICAgICAgICAgICBpZiAoYmx1ZSA+IHJlZCAmJiBibHVlID4gZ3JlZW4pIHtcclxuICAgICAgICAgICAgICAgIC8vIGJsdWUgY29sb3JcclxuICAgICAgICAgICAgICAgIGlmICh2YXJpYXRpb24gPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGNoYW5nZSB0byByZWQgY29sb3JcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdG1wID0gcmVkO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYmx1ZSA9IHRtcDtcclxuICAgICAgICAgICAgICAgICAgICBncmVlbiAvPSAyO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHZhcmlhdGlvbiA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZGVjb2xvcml6ZVxyXG4gICAgICAgICAgICAgICAgICAgIHJlZCA9IGJsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JlZW4gPSBibHVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpLCByZWQpO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMSwgZ3JlZW4pO1xyXG4gICAgICAgICAgICAgICAgZGF0YS5zZXRVaW50OChpICsgMiwgYmx1ZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNyYyA9IFBOR0xvYWRlci51cGRhdGVQTkdDUkMoZGF0YS5nZXRVaW50OChpKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAxKSwgY3JjKTtcclxuICAgICAgICAgICAgY3JjID0gUE5HTG9hZGVyLnVwZGF0ZVBOR0NSQyhkYXRhLmdldFVpbnQ4KGkgKyAyKSwgY3JjKTtcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB1cGRhdGUgY3JjIGZpZWxkXHJcbiAgICAgICAgY3JjIF49IC0xO1xyXG4gICAgICAgIGxldCBpbmRleF9jcmMgPSBzdGFydF9wbHRlICsgOCArIGxlbmd0aF9wbHRlO1xyXG4gICAgICAgIGRhdGEuc2V0VWludDMyKGluZGV4X2NyYywgY3JjKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcclxuICAgIH1cclxuICAgIHN0YXRpYyB1cGRhdGVQTkdDUkModmFsdWU6IG51bWJlciwgY3JjOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIGNyYyBePSB2YWx1ZSAmIDI1NTsgLy8gYml0d2lzZSBvciAod2l0aG91dCBhbmQpXHJcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCA4OyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKChjcmMgJiAxKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICBjcmMgPSBjcmMgPj4+IDEgXiAtMzA2Njc0OTEyO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY3JjID4+Pj0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNyYztcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwicG5nbG9hZGVyLnRzXCIgLz5cclxuXHJcbmludGVyZmFjZSBEYXRhRW50cnkge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgc2l6ZTogbnVtYmVyO1xyXG59XHJcblxyXG5jbGFzcyBMb2FkZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJlbG9hZCgpIHtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaXRtYXBGb250KFwiZm9udDdcIiwgXCJkYXRhL2ZvbnQucG5nXCIsIFwiZGF0YS9mb250LnhtbFwiKTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJkYXRhXCIsIFwiZGF0YS8xLnBha1wiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5iaW5hcnkoXCJsYW5nXCIsIFwiZGF0YS9sYW5nLmRhdFwiLCBmdW5jdGlvbihrZXk6IHN0cmluZywgZGF0YTogYW55KTogVWludDhBcnJheSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShkYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoKSB7XHJcbiAgICAgICAgdGhpcy51bnBhY2tSZXNvdXJjZURhdGEoKTtcclxuICAgICAgICB0aGlzLmxvYWRFbnRpdHlEYXRhKCk7XHJcbiAgICAgICAgdGhpcy5sb2FkTWFwVGlsZXNQcm9wKCk7XHJcbiAgICAgICAgdGhpcy51bnBhY2tMYW5nRGF0YSgpO1xyXG5cclxuICAgICAgICBsZXQgd2FpdGVyID0gbmV3IFBOR1dhaXRlcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIk1haW5NZW51XCIsIGZhbHNlLCBmYWxzZSwgbmFtZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcInNwbGFzaFwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJzcGxhc2hiZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJzcGxhc2hmZ1wiKTtcclxuXHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidGlsZXMwXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwic3RpbGVzMFwiLCAxMCwgMTApO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDApO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDEpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImJ1aWxkaW5nc1wiLCAyNCwgMjQsIDMsIDIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInVuaXRfaWNvbnNcIiwgMjQsIDI0LCAwLCAxKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ1bml0X2ljb25zXCIsIDI0LCAyNCwgMCwgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc19zXCIsIDEwLCAxMCwgMCwgMSk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwidW5pdF9pY29uc19zXCIsIDEwLCAxMCwgMCwgMik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiY3Vyc29yXCIsIDI2LCAyNik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwiYl9zbW9rZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJtZW51XCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInBvcnRyYWl0XCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImNoYXJzXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcImdvbGRcIik7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRJbWFnZSh3YWl0ZXIsIFwicG9pbnRlclwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJyZWRzcGFya1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzcGFya1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzbW9rZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJzdGF0dXNcIik7XHJcblxyXG5cclxuXHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwicm9hZFwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcImdyYXNzXCIsIDI0LCAyNCk7XHJcbiAgICAgICAgUE5HTG9hZGVyLmxvYWRTcHJpdGVTaGVldCh3YWl0ZXIsIFwibW91bnRhaW5cIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZFNwcml0ZVNoZWV0KHdhaXRlciwgXCJ3YXRlclwiLCAyNCwgMjQpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkU3ByaXRlU2hlZXQod2FpdGVyLCBcInRvd25cIiwgMjQsIDI0KTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJ3b29kc19iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJoaWxsX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcIm1vdW50YWluX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcImJyaWRnZV9iZ1wiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJ0b3duX2JnXCIpO1xyXG4gICAgICAgIFBOR0xvYWRlci5sb2FkSW1hZ2Uod2FpdGVyLCBcInRvbWJzdG9uZVwiKTtcclxuICAgICAgICBQTkdMb2FkZXIubG9hZEltYWdlKHdhaXRlciwgXCJtYXNrXCIpO1xyXG5cclxuICAgICAgICB3YWl0ZXIuYXdhaXQoKTtcclxuXHJcblxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgdW5wYWNrUmVzb3VyY2VEYXRhKCkge1xyXG4gICAgICAgIGxldCBhcnJheTogVWludDhBcnJheSA9IHRoaXMuZ2FtZS5jYWNoZS5nZXRCaW5hcnkoXCJkYXRhXCIpO1xyXG4gICAgICAgIGxldCBkYXRhID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDI7IC8vIGRvZXMgbm90IHNlZW0gaW1wb3J0YW50XHJcbiAgICAgICAgbGV0IG51bWJlcl9vZl9lbnRyaWVzID0gZGF0YS5nZXRVaW50MTYoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDI7XHJcblxyXG4gICAgICAgIGxldCBlbnRyaWVzOiBEYXRhRW50cnlbXSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcl9vZl9lbnRyaWVzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHN0cl9sZW4gPSBkYXRhLmdldFVpbnQxNihpbmRleCk7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcbiAgICAgICAgICAgIGxldCBuYW1lID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzdHJfbGVuOyBqKyspIHtcclxuICAgICAgICAgICAgICAgIG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShkYXRhLmdldFVpbnQ4KGluZGV4KyspKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpbmRleCArPSA0OyAvLyBkb2VzIG5vdCBzZWVtIGltcG9ydGFudFxyXG4gICAgICAgICAgICBsZXQgc2l6ZSA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuICAgICAgICAgICAgZW50cmllcy5wdXNoKHtuYW1lOiBuYW1lLCBzaXplOiBzaXplfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRyeV9kYXRhOiBBcnJheUJ1ZmZlciA9IGFycmF5LmJ1ZmZlci5zbGljZShpbmRleCwgaW5kZXggKyBlbnRyeS5zaXplKTtcclxuICAgICAgICAgICAgdGhpcy5nYW1lLmNhY2hlLmFkZEJpbmFyeShlbnRyeS5uYW1lLCBlbnRyeV9kYXRhKTtcclxuICAgICAgICAgICAgaW5kZXggKz0gZW50cnkuc2l6ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRFbnRpdHlEYXRhKCkge1xyXG4gICAgICAgIGxldCBidWZmZXI6IEFycmF5QnVmZmVyID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcInVuaXRzLmJpblwiKTtcclxuXHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuRU5USVRJRVMgPSBbXTtcclxuICAgICAgICBsZXQgbmFtZXMgPSBbXCJTb2xkaWVyXCIsIFwiQXJjaGVyXCIsIFwiTGl6YXJkXCIsIFwiV2l6YXJkXCIsIFwiV2lzcFwiLCBcIlNwaWRlclwiLCBcIkdvbGVtXCIsIFwiQ2F0YXB1bHRcIiwgXCJXeXZlcm5cIiwgXCJLaW5nXCIsIFwiU2tlbGV0b25cIl07XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IGVudGl0eTogRW50aXR5RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVzW2ldLFxyXG4gICAgICAgICAgICAgICAgbW92OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgYXRrOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgZGVmOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWF4OiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgbWluOiBkYXRhLmdldFVpbnQ4KGluZGV4KyspLFxyXG4gICAgICAgICAgICAgICAgY29zdDogZGF0YS5nZXRVaW50MTYoaW5kZXgpLFxyXG4gICAgICAgICAgICAgICAgYmF0dGxlX3Bvc2l0aW9uczogW10sXHJcbiAgICAgICAgICAgICAgICBmbGFnczogRW50aXR5RmxhZ3MuTm9uZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpbmRleCArPSAyO1xyXG5cclxuICAgICAgICAgICAgbGV0IG51bWJlcl9wb3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9wb3M7IGorKykge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmJhdHRsZV9wb3NpdGlvbnMucHVzaCh7eDogZGF0YS5nZXRVaW50OChpbmRleCsrKSwgeTogZGF0YS5nZXRVaW50OChpbmRleCsrKX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBudW1iZXJfZmxhZ3MgPSBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG51bWJlcl9mbGFnczsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuZmxhZ3MgfD0gMSA8PCBkYXRhLmdldFVpbnQ4KGluZGV4KyspO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLnB1c2goZW50aXR5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGxvYWRNYXBUaWxlc1Byb3AoKSB7XHJcbiAgICAgICAgbGV0IGJ1ZmZlcjogQXJyYXlCdWZmZXIgPSB0aGlzLmdhbWUuY2FjaGUuZ2V0QmluYXJ5KFwidGlsZXMwLnByb3BcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgbGV0IGxlbmd0aCA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0OyAvLyAyIGFyZSB1bnJlbGV2YW50XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLlRJTEVTX1BST1AucHVzaCg8VGlsZT4gZGF0YS5nZXRVaW50OChpbmRleCsrKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHByaXZhdGUgdW5wYWNrTGFuZ0RhdGEoKSB7XHJcbiAgICAgICAgbGV0IGFycmF5OiBVaW50OEFycmF5ID0gdGhpcy5nYW1lLmNhY2hlLmdldEJpbmFyeShcImxhbmdcIik7XHJcbiAgICAgICAgbGV0IGRhdGE6IERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGFycmF5LmJ1ZmZlcik7XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IDA7XHJcblxyXG4gICAgICAgIGxldCBudW1iZXIgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuTEFORyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG51bWJlcjsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IGxlbiA9IGRhdGEuZ2V0VWludDE2KGluZGV4KTtcclxuICAgICAgICAgICAgaW5kZXggKz0gMjtcclxuXHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gXCJcIjtcclxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBsZW47IGorKykge1xyXG4gICAgICAgICAgICAgICAgdGV4dCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGRhdGEuZ2V0VWludDgoaW5kZXgrKykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIEFuY2llbnRFbXBpcmVzLkxBTkcucHVzaCh0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG59XHJcbiIsImVudW0gS2V5IHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgVXAgPSAxLFxyXG4gICAgUmlnaHQgPSAyLFxyXG4gICAgRG93biA9IDQsXHJcbiAgICBMZWZ0ID0gOCxcclxuICAgIEVudGVyID0gMTYsXHJcbiAgICBFc2MgPSAzMlxyXG59O1xyXG5jbGFzcyBJbnB1dCB7XHJcbiAgICBwdWJsaWMgYWxsX2tleXM6IEtleTtcclxuXHJcbiAgICBwcml2YXRlIGtleV91cDogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X3JpZ2h0OiBQaGFzZXIuS2V5O1xyXG4gICAgcHJpdmF0ZSBrZXlfZG93bjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2xlZnQ6IFBoYXNlci5LZXk7XHJcbiAgICBwcml2YXRlIGtleV9lbnRlcjogUGhhc2VyLktleTtcclxuICAgIHByaXZhdGUga2V5X2VzYzogUGhhc2VyLktleTtcclxuXHJcbiAgICBwcml2YXRlIGxhc3Rfa2V5czogS2V5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGlucHV0OiBQaGFzZXIuSW5wdXQpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyA9IEtleS5Ob25lO1xyXG5cclxuICAgICAgICB0aGlzLmtleV91cCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuVVApO1xyXG4gICAgICAgIHRoaXMua2V5X2Rvd24gPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkRPV04pO1xyXG4gICAgICAgIHRoaXMua2V5X3JpZ2h0ID0gaW5wdXQua2V5Ym9hcmQuYWRkS2V5KFBoYXNlci5LZXlib2FyZC5SSUdIVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfbGVmdCA9IGlucHV0LmtleWJvYXJkLmFkZEtleShQaGFzZXIuS2V5Ym9hcmQuTEVGVCk7XHJcbiAgICAgICAgdGhpcy5rZXlfZW50ZXIgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVOVEVSKTtcclxuICAgICAgICB0aGlzLmtleV9lc2MgPSBpbnB1dC5rZXlib2FyZC5hZGRLZXkoUGhhc2VyLktleWJvYXJkLkVTQyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmFsbF9rZXlzICYga2V5KSAhPSAwO1xyXG4gICAgfVxyXG4gICAgY2xlYXJLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyAmPSB+a2V5O1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgY3VycmVudF9rZXlzOiBLZXkgPSBLZXkuTm9uZTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LlVwLCB0aGlzLmtleV91cC5pc0Rvd24pO1xyXG4gICAgICAgIGN1cnJlbnRfa2V5cyB8PSB0aGlzLnVwZGF0ZUtleShLZXkuUmlnaHQsIHRoaXMua2V5X3JpZ2h0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5Eb3duLCB0aGlzLmtleV9kb3duLmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5MZWZ0LCB0aGlzLmtleV9sZWZ0LmlzRG93bik7XHJcbiAgICAgICAgY3VycmVudF9rZXlzIHw9IHRoaXMudXBkYXRlS2V5KEtleS5FbnRlciwgdGhpcy5rZXlfZW50ZXIuaXNEb3duKTtcclxuICAgICAgICBjdXJyZW50X2tleXMgfD0gdGhpcy51cGRhdGVLZXkoS2V5LkVzYywgdGhpcy5rZXlfZXNjLmlzRG93bik7XHJcbiAgICAgICAgdGhpcy5sYXN0X2tleXMgPSBjdXJyZW50X2tleXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHNldEtleShrZXk6IEtleSwgeWVzOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5hbGxfa2V5cyBePSAoLXllcyBeIHRoaXMuYWxsX2tleXMpICYga2V5O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB3YXNLZXlQcmVzc2VkKGtleTogS2V5KSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLmxhc3Rfa2V5cyAmIGtleSkgIT0gMDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlS2V5KGtleTogS2V5LCBpc19kb3duOiBib29sZWFuKTogS2V5IHtcclxuICAgICAgICBpZiAoaXNfZG93biAhPSB0aGlzLndhc0tleVByZXNzZWQoa2V5KSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldEtleShrZXksIGlzX2Rvd24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaXNfZG93biA/IGtleSA6IDA7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEZyYW1lUmVjdCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XHJcbn1cclxuaW50ZXJmYWNlIEZyYW1lRGVsZWdhdGUge1xyXG4gICAgZnJhbWVXaWxsRGVzdHJveShmcmFtZTogRnJhbWUpOiB2b2lkO1xyXG59XHJcbmVudW0gRnJhbWVBbmltYXRpb24ge1xyXG4gICAgTm9uZSA9IDAsXHJcbiAgICBTaG93ID0gMSxcclxuICAgIEhpZGUgPSAyLFxyXG4gICAgQ2hhbmdlID0gNCxcclxuICAgIFdpcmUgPSA4LFxyXG4gICAgRGVzdHJveSA9IDE2LFxyXG4gICAgVXBkYXRlID0gMzJcclxufVxyXG5jbGFzcyBGcmFtZSB7XHJcbiAgICBzdGF0aWMgQk9SREVSX1NJWkU6IG51bWJlciA9IDI0O1xyXG4gICAgc3RhdGljIEFOSU1fU1RFUFM6IG51bWJlciA9IDE1O1xyXG5cclxuICAgIGRlbGVnYXRlOiBGcmFtZURlbGVnYXRlO1xyXG5cclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBib3JkZXJfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGNvbnRlbnRfZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIGNvbnRlbnRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIGJvcmRlcl9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG5cclxuICAgIHJldXNlX3RpbGVzOiBQaGFzZXIuSW1hZ2VbXTtcclxuXHJcbiAgICBhbGlnbjogRGlyZWN0aW9uO1xyXG4gICAgYW5pbWF0aW9uX2RpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgYm9yZGVyOiBEaXJlY3Rpb247XHJcblxyXG4gICAgYW5pbWF0aW9uOiBGcmFtZUFuaW1hdGlvbjtcclxuXHJcbiAgICBnYW1lX3dpZHRoOiBudW1iZXI7XHJcbiAgICBnYW1lX2hlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50OiBGcmFtZVJlY3Q7XHJcbiAgICB0YXJnZXQ6IEZyYW1lUmVjdDtcclxuICAgIHNwZWVkOiBGcmFtZVJlY3Q7XHJcbiAgICBhY2M6IEZyYW1lUmVjdDtcclxuICAgIHByaXZhdGUgbmV3X2FsaWduOiBEaXJlY3Rpb247XHJcbiAgICBwcml2YXRlIG5ld19ib3JkZXI6IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIHByaXZhdGUgbmV3X2FuaW1hdGU6IGJvb2xlYW47XHJcblxyXG4gICAgc3RhdGljIGdldFJlY3QoeDogbnVtYmVyLCB5OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IHgsIHk6IHksIHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHR9O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGNvcHlSZWN0KGZyOiBGcmFtZVJlY3QpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIHJldHVybiB7eDogZnIueCwgeTogZnIueSwgd2lkdGg6IGZyLndpZHRoLCBoZWlnaHQ6IGZyLmhlaWdodH07XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA0O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgIHJldHVybiA3O1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkRvd246XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IoKSB7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IFtdO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIGFsaWduOiBEaXJlY3Rpb24sIGJvcmRlcjogRGlyZWN0aW9uLCBhbmltX2Rpcj86IERpcmVjdGlvbikge1xyXG4gICAgICAgIHRoaXMuYWxpZ24gPSBhbGlnbjtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPSB0eXBlb2YgYW5pbV9kaXIgIT0gXCJ1bmRlZmluZWRcIiA/IGFuaW1fZGlyIDogYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSBib3JkZXI7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmJvcmRlcl9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYWRkKHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZV93aWR0aCA9IHRoaXMuZ3JvdXAuZ2FtZS53aWR0aDtcclxuICAgICAgICB0aGlzLmdhbWVfaGVpZ2h0ID0gdGhpcy5ncm91cC5nYW1lLmhlaWdodDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLmdldFJldHJhY3RlZFJlY3QoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgb2Zmc2V0X3k6IG51bWJlciA9IDApIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KG9mZnNldF95KTtcclxuXHJcbiAgICAgICAgaWYgKGFuaW1hdGUpIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHN0YXJ0aW5nIG9mZnNldCB1c2luZyB0aGUgYW5pbV9kaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5TaG93O1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiB8PSBGcmFtZUFuaW1hdGlvbi5XaXJlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlU3BlZWQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcblxyXG4gICAgICAgIGlmICghYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50X2dyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uSGlkZTtcclxuICAgICAgICBpZiAoZGVzdHJveV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uRGVzdHJveTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHVwZGF0ZV9vbl9maW5pc2gpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uVXBkYXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudF9ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy53aWR0aCA9PSB3aWR0aCAmJiB0aGlzLmhlaWdodCA9PSBoZWlnaHQpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLk5vbmU7XHJcbiAgICAgICAgaWYgKCFhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5kcmF3RnJhbWUod2lkdGgsIGhlaWdodCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvbGRfd2lkdGggPSB0aGlzLndpZHRoO1xyXG4gICAgICAgIGxldCBvbGRfaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLkNoYW5nZTtcclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdGFrZSB0aGUgYmlnZ2VzdCByZWN0IHBvc3NpYmxlXHJcbiAgICAgICAgICAgIHdpZHRoID0gTWF0aC5tYXgod2lkdGgsIG9sZF93aWR0aCk7XHJcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgb2xkX2hlaWdodCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gdGhpcy5nZXRBbGlnbm1lbnRSZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIHRoaXMuY3VycmVudCBpcyB0aGUgb2xkIHJlY3QgKG9mZnNldCAmIHNpemUpXHJcbiAgICAgICAgLy8gdXBkYXRlIHRoaXMuY3VycmVudCBzbyB0aGUgc2FtZSBwb3J0aW9uIG9mIHRoZSBmcmFtZSBpcyByZW5kZXJlZCwgYWx0aG91Z2ggaXQgY2hhbmdlZCBpbiBzaXplXHJcbiAgICAgICAgLy8gY2hhbmdlIHRhcmdldCB0byBhbGlnbm1lbnQgcG9zaXRpb24gZm9yIGNoYW5nZWQgcmVjdFxyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC54IC09IHdpZHRoIC0gb2xkX3dpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC54IC09IHdpZHRoIC0gdGhpcy53aWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC55IC09IGhlaWdodCAtIG9sZF9oZWlnaHQ7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgLT0gaGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldCgpO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZURpcmVjdGlvbnMoYWxpZ246IERpcmVjdGlvbiwgYm9yZGVyOiBEaXJlY3Rpb24sIGFuaW1fZGlyZWN0aW9uOiBEaXJlY3Rpb24sIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5uZXdfYWxpZ24gPT09IGFsaWduICYmIHRoaXMubmV3X2JvcmRlciA9PSBib3JkZXIgJiYgdGhpcy5uZXdfYW5pbWF0aW9uX2RpcmVjdGlvbiA9PSBhbmltX2RpcmVjdGlvbiAmJiB0aGlzLm5ld19hbmltYXRlID09IGFuaW1hdGUpIHsgcmV0dXJuOyB9XHJcblxyXG4gICAgICAgIHRoaXMubmV3X2FsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5uZXdfYm9yZGVyID0gYm9yZGVyO1xyXG4gICAgICAgIHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb24gPSBhbmltX2RpcmVjdGlvbjtcclxuICAgICAgICB0aGlzLm5ld19hbmltYXRlID0gYW5pbWF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5oaWRlKHRydWUsIGZhbHNlLCB0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRpb24gPT0gRnJhbWVBbmltYXRpb24uTm9uZSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX3ggPSB0aGlzLmFkZEdhaW4oXCJ4XCIsIHN0ZXBzKTtcclxuICAgICAgICBsZXQgZmluaXNoZWRfeSA9IHRoaXMuYWRkR2FpbihcInlcIiwgc3RlcHMpO1xyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfd2lkdGggPSB0cnVlO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF9oZWlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIHNpemUgd2l0aCB0aGUgd2lyZSBhbmltYXRpb25cclxuICAgICAgICAgICAgZmluaXNoZWRfd2lkdGggPSB0aGlzLmFkZEdhaW4oXCJ3aWR0aFwiLCBzdGVwcyk7XHJcbiAgICAgICAgICAgIGZpbmlzaGVkX2hlaWdodCA9IHRoaXMuYWRkR2FpbihcImhlaWdodFwiLCBzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmluaXNoZWRfeCAmJiBmaW5pc2hlZF95ICYmIGZpbmlzaGVkX3dpZHRoICYmIGZpbmlzaGVkX2hlaWdodCkge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25EaWRFbmQodGhpcy5hbmltYXRpb24pO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JkZXJfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uSGlkZSkgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZHJhd0ZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkNoYW5nZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gdXBkYXRlIGN1cnJlbnQgb2Zmc2V0IGFuZCByZW1vdmUgdGlsZXMgb3V0IG9mIHNpZ2h0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5oZWlnaHQgPSB0aGlzLmhlaWdodDtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXQueCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudCA9IEZyYW1lLmNvcHlSZWN0KHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdGcmFtZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkhpZGUpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5EZXN0cm95KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLlVwZGF0ZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlEaXJlY3Rpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAvLyBuaWNlIGFuaW1hdGlvbiBmb3IgZnJhbWUgd2l0aCBubyBhbGlnbm1lbnQgJiBubyBhbmltYXRpb24gZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmxpbmVTdHlsZSgxLCAweGZmZmZmZik7XHJcbiAgICAgICAgICAgIHRoaXMuYm9yZGVyX2dyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHRoaXMuY3VycmVudC53aWR0aCwgdGhpcy5jdXJyZW50LmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIGlmICghIXRoaXMuZGVsZWdhdGUpIHsgdGhpcy5kZWxlZ2F0ZS5mcmFtZVdpbGxEZXN0cm95KHRoaXMpOyB9XHJcbiAgICAgICAgdGhpcy5ib3JkZXJfZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgIH1cclxuXHJcbiAgICBwcm90ZWN0ZWQgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRnJhbWVBbmltYXRpb24pIHtcclxuICAgICAgICAvLyBpbXBsZW1lbnRlZCBpbiBzdWIgY2xhc3NlcyBpZiBuZWVkZWQgLSBkZWZhdWx0OiBkbyBub3RoaW5nXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBhcHBseURpcmVjdGlvbnMoKSB7XHJcbiAgICAgICAgdGhpcy5hbGlnbiA9IHRoaXMubmV3X2FsaWduO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyID0gdGhpcy5uZXdfYm9yZGVyO1xyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiA9IHRoaXMubmV3X2FuaW1hdGlvbl9kaXJlY3Rpb247XHJcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gdGhpcy5nZXRSZXRyYWN0ZWRSZWN0KCk7XHJcbiAgICAgICAgdGhpcy5zaG93KHRoaXMubmV3X2FuaW1hdGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0QWxpZ25tZW50UmVjdChvZmZzZXRfeTogbnVtYmVyID0gMCk6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgdXNpbmcgdGhlIGFsaWdubWVudFxyXG4gICAgICAgIGxldCByZWN0ID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IHRoaXMuZ2FtZV93aWR0aCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVjdC54ID0gTWF0aC5mbG9vcigodGhpcy5nYW1lX3dpZHRoIC0gdGhpcy53aWR0aCkgLyAyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gZXhjZXB0aW9uIGZvciBtYWluIG1lbnUgLi5cclxuICAgICAgICBpZiAob2Zmc2V0X3kgPiAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IG9mZnNldF95O1xyXG4gICAgICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IHRoaXMuZ2FtZV9oZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZWN0LnkgPSBNYXRoLmZsb29yKCh0aGlzLmdhbWVfaGVpZ2h0IC0gdGhpcy5oZWlnaHQpIC8gMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZWN0O1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZ2V0UmV0cmFjdGVkUmVjdCgpOiBGcmFtZVJlY3Qge1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEZyYW1lLmdldFJlY3QoTWF0aC5mbG9vcih0aGlzLmdhbWVfd2lkdGggLyAyKSwgTWF0aC5mbG9vcih0aGlzLmdhbWVfaGVpZ2h0IC8gMiksIDAsIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHJlY3QgPSB0aGlzLmdldEFsaWdubWVudFJlY3QoKTtcclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueCA9IC10aGlzLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnggPSB0aGlzLmdhbWVfd2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHJlY3QueSA9IC10aGlzLmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICByZWN0LnkgPSB0aGlzLmdhbWVfaGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmVjdDtcclxuICAgIH1cclxuICAgIHByaXZhdGUgdXBkYXRlT2Zmc2V0KCkge1xyXG4gICAgICAgIGxldCB4ID0gdGhpcy5jdXJyZW50Lng7XHJcbiAgICAgICAgbGV0IHkgPSB0aGlzLmN1cnJlbnQueTtcclxuXHJcbiAgICAgICAgbGV0IGNfeCA9IDA7XHJcbiAgICAgICAgbGV0IGNfeSA9IDA7XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfeCA9IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgY195ID0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnggPSB4O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyX2dyb3VwLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC54ID0geCArIGNfeDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JvdXAueSA9IHkgKyBjX3k7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdGcmFtZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgY193aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGxldCBjX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY193aWR0aCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfd2lkdGggLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX2hlaWdodCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgY19oZWlnaHQgLT0gNjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3ggPSBNYXRoLmNlaWwod2lkdGggLyBGcmFtZS5CT1JERVJfU0laRSkgLSAyO1xyXG4gICAgICAgIGxldCBzaG93X3RpbGVzX3kgPSBNYXRoLmNlaWwoaGVpZ2h0IC8gRnJhbWUuQk9SREVSX1NJWkUpIC0gMjtcclxuXHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmNsZWFyKCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmxpbmVTdHlsZSgwKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4Y2ViZWE1KTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuZHJhd1JlY3QoMCwgMCwgY193aWR0aCwgY19oZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5lbmRGaWxsKCk7XHJcblxyXG4gICAgICAgIGxldCB0aWxlczogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaG93X3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgMCwgRGlyZWN0aW9uLlVwKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZShvZmZzZXRfeCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIERpcmVjdGlvbi5Eb3duKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0X3ggKz0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNob3dfdGlsZXNfeTsgaisrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5MZWZ0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgb2Zmc2V0X3ksIERpcmVjdGlvbi5MZWZ0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgb2Zmc2V0X3ksIERpcmVjdGlvbi5SaWdodCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9mZnNldF95ICs9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uVXAgfCBEaXJlY3Rpb24uTGVmdCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKDAsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIDAsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgaGVpZ2h0IC0gRnJhbWUuQk9SREVSX1NJWkUsIHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQpKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IHRpbGVzO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVGcmFtZSgpIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnRfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdCb3JkZXJUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xyXG4gICAgICAgIGxldCByZXVzZTogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldXNlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZXVzZS5icmluZ1RvVG9wKCk7XHJcbiAgICAgICAgICAgIHJldXNlLnggPSB4O1xyXG4gICAgICAgICAgICByZXVzZS55ID0geTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXVzZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJtZW51XCIsIG51bGwsIHRoaXMuYm9yZGVyX2dyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV1c2UuZnJhbWUgPSBGcmFtZS5nZXRUaWxlRm9yRGlyZWN0aW9uKGRpcmVjdGlvbik7XHJcbiAgICAgICAgcmV0dXJuIHJldXNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBhZGRHYWluKHZhcl9uYW1lOiBzdHJpbmcsIHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5zcGVlZFt2YXJfbmFtZV0gPT0gMCkgeyByZXR1cm4gdHJ1ZTsgfVxyXG5cclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gKz0gdGhpcy5zcGVlZFt2YXJfbmFtZV0gKiBzdGVwcztcclxuXHJcbiAgICAgICAgbGV0IGQgPSBNYXRoLmZsb29yKHRoaXMuYWNjW3Zhcl9uYW1lXSk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSArPSBkO1xyXG4gICAgICAgIHRoaXMuYWNjW3Zhcl9uYW1lXSAtPSBkO1xyXG4gICAgICAgIGlmIChkIDwgMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdIDwgdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1lbHNlIGlmIChkID4gMCAmJiB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID4gdGhpcy50YXJnZXRbdmFyX25hbWVdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gPSB0aGlzLnRhcmdldFt2YXJfbmFtZV07XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGNhbGN1bGF0ZVNwZWVkKCkge1xyXG4gICAgICAgIHRoaXMuc3BlZWQgPSBGcmFtZS5nZXRSZWN0KCh0aGlzLnRhcmdldC54IC0gdGhpcy5jdXJyZW50LngpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LnkgLSB0aGlzLmN1cnJlbnQueSkgLyBGcmFtZS5BTklNX1NURVBTLCAodGhpcy50YXJnZXQud2lkdGggLSB0aGlzLmN1cnJlbnQud2lkdGgpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LmhlaWdodCAtIHRoaXMuY3VycmVudC5oZWlnaHQpIC8gRnJhbWUuQU5JTV9TVEVQUyk7XHJcbiAgICAgICAgdGhpcy5hY2MgPSBGcmFtZS5nZXRSZWN0KDAsIDAsIDAsIDApO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSByZW1vdmVUaWxlcygpIHtcclxuICAgICAgICB3aGlsZSAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGxldCB0aWxlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICB0aWxlLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZyYW1lLnRzXCIgLz5cclxuXHJcbmNsYXNzIE1pbmlNYXAgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdGllczogUGhhc2VyLkltYWdlW107XHJcbiAgICBwcml2YXRlIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZTtcclxuICAgIHByaXZhdGUgbWFwOiBNYXA7XHJcblxyXG4gICAgcHJpdmF0ZSBzbG93OiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHVuaXRzX3Zpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IobWFwOiBNYXAsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gbWVudV9kZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5zbG93ID0gMDtcclxuICAgICAgICB0aGlzLnVuaXRzX3Zpc2libGUgPSB0cnVlO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemUobWFwLndpZHRoICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFICsgMTIsIG1hcC5oZWlnaHQgKiBBbmNpZW50RW1waXJlcy5NSU5JX1NJWkUgKyAxMiwgZ3JvdXAsIERpcmVjdGlvbi5Ob25lLCBEaXJlY3Rpb24uQWxsLCBEaXJlY3Rpb24uTm9uZSk7XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KElucHV0Q29udGV4dC5BY2spOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlKTtcclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLmNsb3NlTWVudShJbnB1dENvbnRleHQuQWNrKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnNsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuc2xvdyA+PSAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNsb3cgLT0gMzA7XHJcbiAgICAgICAgICAgIHRoaXMudW5pdHNfdmlzaWJsZSA9ICF0aGlzLnVuaXRzX3Zpc2libGU7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGltYWdlIG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgICAgIGltYWdlLnZpc2libGUgPSB0aGlzLnVuaXRzX3Zpc2libGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMubWFwLndpZHRoOyB4KyspIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLm1hcC5oZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5nZXRUaWxlSW5kZXhBdChuZXcgUG9zKHgsIHkpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCAqIEFuY2llbnRFbXBpcmVzLk1JTklfU0laRSwgeSAqIEFuY2llbnRFbXBpcmVzLk1JTklfU0laRSwgXCJzdGlsZXMwXCIsIGluZGV4LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMubWFwLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoZW50aXR5LnBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5NSU5JX1NJWkUsIGVudGl0eS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuTUlOSV9TSVpFLCBcInVuaXRfaWNvbnNfc19cIiArICg8bnVtYmVyPiBlbnRpdHkuYWxsaWFuY2UpLCA8bnVtYmVyPiBlbnRpdHkudHlwZSwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdGllcy5wdXNoKGltYWdlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGdldFRpbGVJbmRleEF0KHBvc2l0aW9uOiBQb3MpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLlBhdGg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkdyYXNzOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiA1O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDY7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Ib3VzZTpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkNhc3RsZTpcclxuICAgICAgICAgICAgICAgIGxldCBhbGxpYW5jZSA9IHRoaXMubWFwLmdldEFsbGlhbmNlQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aWxlID09IFRpbGUuQ2FzdGxlID8gOCA6IDcpICsgKDxudW1iZXI+IGFsbGlhbmNlKSAqIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJpbnRlcmFjdGlvbi50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJtaW5pbWFwLnRzXCIgLz5cclxuY2xhc3MgUGxheWVyIGV4dGVuZHMgSW50ZXJhY3Rpb24ge1xyXG5cclxuICAgIHByaXZhdGUgY29udGV4dDogSW5wdXRDb250ZXh0W107XHJcbiAgICBwcml2YXRlIGtleXM6IElucHV0O1xyXG5cclxuICAgIHByaXZhdGUgb3B0aW9uc19tZW51OiBNZW51T3B0aW9ucztcclxuICAgIHByaXZhdGUgc2hvcF91bml0czogTWVudVNob3BVbml0cztcclxuICAgIHByaXZhdGUgc2hvcF9pbmZvOiBNZW51U2hvcEluZm87XHJcbiAgICBwcml2YXRlIG1pbmlfbWFwOiBNaW5pTWFwO1xyXG5cclxuICAgIHByaXZhdGUgbGFzdF9lbnRpdHlfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGZ1bGxzY3JlZW5fZ3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHByaXZhdGUgaW5zdHJ1Y3Rpb25fbnI6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihhbGxpYW5jZTogQWxsaWFuY2UsIG1hcDogTWFwLCBkZWxlZ2F0ZTogSW50ZXJhY3Rpb25EZWxlZ2F0ZSwga2V5czogSW5wdXQpIHtcclxuICAgICAgICBzdXBlcihhbGxpYW5jZSwgbWFwLCBkZWxlZ2F0ZSk7XHJcbiAgICAgICAgdGhpcy5rZXlzID0ga2V5cztcclxuICAgICAgICB0aGlzLmNvbnRleHQgPSBbSW5wdXRDb250ZXh0Lk1hcF07XHJcbiAgICB9XHJcblxyXG4gICAgaXNQbGF5ZXIoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnQoKSB7XHJcbiAgICAgICAgdGhpcy5rZXlzLmFsbF9rZXlzID0gS2V5Lk5vbmU7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuKCkge1xyXG4gICAgICAgIHRoaXMua2V5cy51cGRhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5rZXlzLmFsbF9rZXlzID09IEtleS5Ob25lKSB7IHJldHVybjsgfVxyXG5cclxuICAgICAgICBzd2l0Y2ggKHRoaXMuY29udGV4dFt0aGlzLmNvbnRleHQubGVuZ3RoIC0gMV0pIHtcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuTWFwOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl9zdGlsbCAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5SaWdodCkgJiYgdGhpcy5kZWxlZ2F0ZS5jdXJzb3Jfc3RpbGwgJiYgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0LnggPCB0aGlzLm1hcC53aWR0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl9zdGlsbCAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueSA8IHRoaXMubWFwLmhlaWdodCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQubW92ZShEaXJlY3Rpb24uRG93bik7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkxlZnQpICYmIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3N0aWxsICYmIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC5tb3ZlKERpcmVjdGlvbi5MZWZ0KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGlja1Bvc2l0aW9uKHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLnNlbGVjdGVkX2VudGl0eTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISFlbnRpdHkgJiYgZW50aXR5LnBvc2l0aW9uLm1hdGNoKHRoaXMubWFwLmdldEtpbmdQb3NpdGlvbih0aGlzLmFsbGlhbmNlKSkgJiYgZW50aXR5LmRhdGEuY29zdCA8PSAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGVudGl0eSB3YXMgYm91Z2h0LCBhZGQgZ29sZCBiYWNrIGFuZCByZW1vdmUgZW50aXR5XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBnb2xkID0gdGhpcy5kZWxlZ2F0ZS5nZXRHb2xkRm9yQWxsaWFuY2UodGhpcy5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2V0R29sZEZvckFsbGlhbmNlKHRoaXMuYWxsaWFuY2UsIGdvbGQgKyBlbnRpdHkuZGF0YS5jb3N0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlRW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5PcHRpb25zOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlVwKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5wcmV2KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRG93bik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5FbnRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5FbnRlcik7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZCA9IHRoaXMub3B0aW9uc19tZW51LmdldFNlbGVjdGVkKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wdGlvbnNfbWVudS5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51ID0gbnVsbDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24oc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3B0aW9uc19tZW51LmhpZGUodHJ1ZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcHRpb25zX21lbnUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0T3B0aW9uKEFjdGlvbi5DQU5DRUwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LlNlbGVjdGlvbjpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5VcCkgJiYgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0LnkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuVXApO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLm1hcC5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlJpZ2h0KSAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueCA8IHRoaXMubWFwLndpZHRoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Eb3duKSAmJiB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQueSA8IHRoaXMubWFwLmhlaWdodCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Eb3duKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLkRvd24pO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldCA9IGVudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkxlZnQpICYmIHRoaXMuZGVsZWdhdGUuY3Vyc29yX3RhcmdldC54ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLm1hcC5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvci5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLm1hcC5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uTm9uZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrRW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkVzYykpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5Fc2MpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbi5jb3B5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3Iuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuc2VsZWN0ZWRfZW50aXR5O1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZGVzZWxlY3RFbnRpdHkoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuU2hvcDpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5VcCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5VcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnByZXYodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX2luZm8udXBkYXRlQ29udGVudCh0aGlzLnNob3BfdW5pdHMuZ2V0U2VsZWN0ZWQoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlJpZ2h0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LlJpZ2h0KTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3BfdW5pdHMubmV4dChmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX2luZm8udXBkYXRlQ29udGVudCh0aGlzLnNob3BfdW5pdHMuZ2V0U2VsZWN0ZWQoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkRvd24pKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRG93bik7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX3VuaXRzLm5leHQodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX2luZm8udXBkYXRlQ29udGVudCh0aGlzLnNob3BfdW5pdHMuZ2V0U2VsZWN0ZWQoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LkxlZnQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuTGVmdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG9wX3VuaXRzLnByZXYoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvcF9pbmZvLnVwZGF0ZUNvbnRlbnQodGhpcy5zaG9wX3VuaXRzLmdldFNlbGVjdGVkKCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5FbnRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5FbnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGVudGl0eV90eXBlOiBudW1iZXIgPSB0aGlzLnNob3BfdW5pdHMuZ2V0U2VsZWN0ZWQoKTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5kZWxlZ2F0ZS5idXlFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIGVudGl0eV90eXBlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISFlbnRpdHkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2xvc2VTaG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRXNjKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlU2hvcCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0LkFjazpcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5FbnRlcikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5FbnRlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5mdWxsc2NyZWVuX2dyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbl9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRXNjKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVzYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5mdWxsc2NyZWVuX2dyb3VwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZnVsbHNjcmVlbl9ncm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZU1hcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5JbnN0cnVjdGlvbnM6XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuRW50ZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5mdWxsc2NyZWVuX2dyb3VwKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmluc3RydWN0aW9uX25yICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA8PSAxNykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RydWN0aW9uX25yID0gbmV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuUmlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhpcy5mdWxsc2NyZWVuX2dyb3VwKSB7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmluc3RydWN0aW9uX25yICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA8PSAxNykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RydWN0aW9uX25yID0gbmV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAsIG5leHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5MZWZ0KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZnVsbHNjcmVlbl9ncm91cCkgeyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwcmV2ID0gdGhpcy5pbnN0cnVjdGlvbl9uciAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RydWN0aW9uX25yID0gcHJldjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAsIHByZXYpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRXNjKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkVzYyk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZ1bGxzY3JlZW5fZ3JvdXApIHsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAuZGVzdHJveSh0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvcGVuTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpIHtcclxuICAgICAgICBpZiAoY29udGV4dCA9PSBJbnB1dENvbnRleHQuV2FpdCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQucHVzaChjb250ZXh0KTtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LlNob3ApIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5oaWRlSW5mbyhmYWxzZSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5oaWRlSW5mbyh0cnVlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjbG9zZU1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgaWYgKGNvbnRleHQgPT0gSW5wdXRDb250ZXh0LldhaXQgJiYgY29udGV4dCA9PSB0aGlzLmNvbnRleHRbdGhpcy5jb250ZXh0Lmxlbmd0aCAtIDFdKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGV4dC5wb3AoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGFjdGl2ZV9jb250ZXh0ID0gdGhpcy5jb250ZXh0W3RoaXMuY29udGV4dC5sZW5ndGggLSAxXTtcclxuICAgICAgICBzd2l0Y2ggKGFjdGl2ZV9jb250ZXh0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgSW5wdXRDb250ZXh0Lk1hcDpcclxuICAgICAgICAgICAgY2FzZSBJbnB1dENvbnRleHQuU2VsZWN0aW9uOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93SW5mbyh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIElucHV0Q29udGV4dC5TaG9wOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93SW5mbyhmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZW50aXR5RGlkTW92ZShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIGxldCBvcHRpb25zID0gdGhpcy5tYXAuZ2V0RW50aXR5T3B0aW9ucyhlbnRpdHksIHRydWUpO1xyXG4gICAgICAgIGlmIChvcHRpb25zLmxlbmd0aCA8IDEpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5zaG93T3B0aW9uTWVudShvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBlbnRpdHlEaWRBbmltYXRpb24oZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmNvbnRleHQucG9wKCk7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkodHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgb3B0aW9ucyA9IHRoaXMubWFwLmdldEVudGl0eU9wdGlvbnMoZW50aXR5LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIC8vIG5vIG9wdGlvbnMgbWVhbjogbm90IGluIGFsbGlhbmNlIG9yIGFscmVhZHkgbW92ZWRcclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPCAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNvIG1ldGhvZCBjYW4gYmUgdXNlZCB0byBzaG93IG9wdGlvbnMgZm9yIGVudGl0eSBhZ2FpbiAtPiBtdXN0IGJlIHNhbWUgZW50aXR5IGFzIHNlbGVjdGVkXHJcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkX2VudGl0eSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkX2VudGl0eSA9IGVudGl0eTtcclxuICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zZWxlY3RFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2VsZWN0ZWRfZW50aXR5ICE9IGVudGl0eSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAob3B0aW9ucy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd09wdGlvbk1lbnUob3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RPcHRpb24ob3B0aW9uc1swXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZGVzZWxlY3RFbnRpdHkoY2hhbmdlZDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuZGVzZWxlY3RFbnRpdHkoY2hhbmdlZCk7XHJcbiAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2hvd09wdGlvbk1lbnUob3B0aW9uczogQWN0aW9uW10pIHtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zX21lbnUgPSBuZXcgTWVudU9wdGlvbnModGhpcy5kZWxlZ2F0ZS5mcmFtZV9tYW5hZ2VyLmdyb3VwLCBEaXJlY3Rpb24uUmlnaHQsIG9wdGlvbnMsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLm9wdGlvbnNfbWVudSk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zX21lbnUuc2hvdyh0cnVlKTtcclxuICAgICAgICB0aGlzLmNvbnRleHQucHVzaChJbnB1dENvbnRleHQuT3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzaG93TWFpbk1lbnUoYWN0aW9uczogQWN0aW9uW10pIHtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zX21lbnUgPSBuZXcgTWVudU9wdGlvbnModGhpcy5kZWxlZ2F0ZS5mcmFtZV9tYW5hZ2VyLmdyb3VwLCBEaXJlY3Rpb24uTm9uZSwgYWN0aW9ucywgdGhpcywgRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5vcHRpb25zX21lbnUpO1xyXG4gICAgICAgIHRoaXMub3B0aW9uc19tZW51LnNob3codHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0Lk9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2VsZWN0T3B0aW9uKG9wdGlvbjogQWN0aW9uKSB7XHJcbiAgICAgICAgc3dpdGNoIChvcHRpb24pIHtcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uT0NDVVBZOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5vY2N1cHkodGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb24sIHRoaXMuc2VsZWN0ZWRfZW50aXR5LmFsbGlhbmNlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5LnVwZGF0ZVN0YXRlKEVudGl0eVN0YXRlLk1vdmVkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVzZWxlY3RFbnRpdHkodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQVRUQUNLOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LlNlbGVjdGlvbik7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLkF0dGFjaywgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5tYXAubmV4dFRhcmdldEluUmFuZ2UoRGlyZWN0aW9uLk5vbmUpLnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuY3Vyc29yLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5SQUlTRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5TZWxlY3Rpb24pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5zaG93UmFuZ2UoRW50aXR5UmFuZ2VUeXBlLlJhaXNlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSB0aGlzLm1hcC5uZXh0VGFyZ2V0SW5SYW5nZShEaXJlY3Rpb24uTm9uZSkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk1PVkU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLnNob3dSYW5nZShFbnRpdHlSYW5nZVR5cGUuTW92ZSwgdGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkJVWTpcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlblNob3AodGhpcy5zZWxlY3RlZF9lbnRpdHkuYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkVORF9NT1ZFOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZF9lbnRpdHkudXBkYXRlU3RhdGUoRW50aXR5U3RhdGUuTW92ZWQsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZXNlbGVjdEVudGl0eSh0cnVlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5FTkRfVFVSTjpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUubmV4dFR1cm4oKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5NQUlOX01FTlU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dNYWluTWVudShNZW51T3B0aW9ucy5nZXRNYWluTWVudU9wdGlvbnModHJ1ZSkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLk1BUDpcclxuICAgICAgICAgICAgICAgIHRoaXMub3Blbk1hcCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLlNBVkVfR0FNRTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2F2ZUdhbWUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5MT0FEX0dBTUU6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmxvYWRHYW1lKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uRVhJVDpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZXhpdEdhbWUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5BQk9VVDpcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5BY2spO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mdWxsc2NyZWVuX2dyb3VwID0gTWFpbk1lbnUuc2hvd0Fib3V0KHRoaXMuZGVsZWdhdGUuZ2FtZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uSU5TVFJVQ1RJT05TOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0Lkluc3RydWN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAgPSB0aGlzLmRlbGVnYXRlLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZ1bGxzY3JlZW5fZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnN0cnVjdGlvbl9uciA9IDA7XHJcbiAgICAgICAgICAgICAgICBNYWluTWVudS5zaG93SW5zdHJ1Y3Rpb25zKHRoaXMuZnVsbHNjcmVlbl9ncm91cCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uQ0FOQ0VMOlxyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGxhc3QgYWN0aW9uIHdhcyB3YWxraW5nLiByZXNldCBlbnRpdHkgJiBzZXQgY3Vyc29yIHRvIGN1cnJlbnQgcG9zaXRpb25cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvcl90YXJnZXQgPSB0aGlzLnNlbGVjdGVkX2VudGl0eS5wb3NpdGlvbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5tb3ZlRW50aXR5KHRoaXMuc2VsZWN0ZWRfZW50aXR5LCB0aGlzLmxhc3RfZW50aXR5X3Bvc2l0aW9uLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuc2hvd1JhbmdlKEVudGl0eVJhbmdlVHlwZS5Nb3ZlLCB0aGlzLnNlbGVjdGVkX2VudGl0eSk7XHJcblxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJBY3Rpb24gXCIgKyBNZW51T3B0aW9ucy5nZXRPcHRpb25TdHJpbmcob3B0aW9uKSArIFwiIG5vdCB5ZXQgaW1wbGVtZW50ZWRcIik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwaWNrRW50aXR5KGVudGl0eTogRW50aXR5KSB7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5BbmltYXRpb24pO1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5tYXAuZ2V0VHlwZU9mUmFuZ2UoKSkge1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5BdHRhY2s6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmF0dGFja0VudGl0eSh0aGlzLnNlbGVjdGVkX2VudGl0eSwgZW50aXR5KTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUucmFpc2VFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIGVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZS5oaWRlUmFuZ2UoKTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmN1cnNvci5zaG93KCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwaWNrUG9zaXRpb24ocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkX2VudGl0eSkge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMubWFwLmdldFR5cGVPZlJhbmdlKCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLk1vdmU6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0X2VudGl0eV9wb3NpdGlvbiA9IHRoaXMuc2VsZWN0ZWRfZW50aXR5LnBvc2l0aW9uLmNvcHkoKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLm1vdmVFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHksIHBvc2l0aW9uLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAuZ2V0RW50aXR5QXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghIWVudGl0eSkge1xyXG4gICAgICAgICAgICAvLyBubyBlbnRpdHkgc2VsZWN0ZWQsIGNsaWNrZWQgb24gZW50aXR5IC0gdHJ5IHRvIHNlbGVjdCBpdFxyXG4gICAgICAgICAgICBsZXQgc3VjY2VzcyA9IHRoaXMuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgICAgIGlmIChzdWNjZXNzKSB7IHJldHVybjsgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3dPcHRpb25NZW51KE1lbnVPcHRpb25zLmdldE9mZk1lbnVPcHRpb25zKCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgb3BlblNob3AoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnB1c2goSW5wdXRDb250ZXh0LlNob3ApO1xyXG4gICAgICAgIGlmICghdGhpcy5zaG9wX3VuaXRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvcF91bml0cyA9IG5ldyBNZW51U2hvcFVuaXRzKHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5ncm91cCwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLnNob3BfdW5pdHMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNob3BfdW5pdHMudXBkYXRlQ29udGVudChhbGxpYW5jZSwgdGhpcy5kZWxlZ2F0ZS5nZXRHb2xkRm9yQWxsaWFuY2UoYWxsaWFuY2UpKTtcclxuICAgICAgICB0aGlzLnNob3BfdW5pdHMuc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5zaG9wX2luZm8gPSBuZXcgTWVudVNob3BJbmZvKHRoaXMuZGVsZWdhdGUuZnJhbWVfbWFuYWdlci5ncm91cCwgYWxsaWFuY2UpO1xyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvLnVwZGF0ZUNvbnRlbnQoRW50aXR5VHlwZS5Tb2xkaWVyKTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5zaG9wX2luZm8pO1xyXG4gICAgICAgIHRoaXMuc2hvcF9pbmZvLnNob3codHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjbG9zZVNob3AoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgIHRoaXMuc2hvcF91bml0cy5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgIHRoaXMuc2hvcF91bml0cyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zaG9wX2luZm8uaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLnNob3BfaW5mbyA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBvcGVuTWFwKCkge1xyXG4gICAgICAgIHRoaXMuY29udGV4dC5wdXNoKElucHV0Q29udGV4dC5BY2spO1xyXG4gICAgICAgIHRoaXMubWluaV9tYXAgPSBuZXcgTWluaU1hcCh0aGlzLm1hcCwgdGhpcy5kZWxlZ2F0ZS5mcmFtZV9tYW5hZ2VyLmdyb3VwLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmRlbGVnYXRlLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5taW5pX21hcCk7XHJcbiAgICAgICAgdGhpcy5taW5pX21hcC5zaG93KHRydWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY2xvc2VNYXAoKSB7XHJcbiAgICAgICAgdGhpcy5jb250ZXh0LnBvcCgpO1xyXG4gICAgICAgIHRoaXMubWluaV9tYXAuaGlkZSh0cnVlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLm1pbmlfbWFwID0gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJlbnVtIEVudGl0eUFuaW1hdGlvblR5cGUge1xyXG4gICAgQXR0YWNrLFxyXG4gICAgU3RhdHVzLFxyXG4gICAgUmFpc2VcclxufVxyXG5pbnRlcmZhY2UgRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUge1xyXG4gICAgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRW50aXR5QW5pbWF0aW9uKTogdm9pZDtcclxufVxyXG5jbGFzcyBFbnRpdHlBbmltYXRpb24ge1xyXG5cclxuICAgIHR5cGU6IEVudGl0eUFuaW1hdGlvblR5cGU7XHJcbiAgICBlbnRpdHk6IEVudGl0eTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgZGVsZWdhdGU6IEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlO1xyXG5cclxuICAgIHByaXZhdGUgcHJvZ3Jlc3M6IG51bWJlcjtcclxuICAgIHByaXZhdGUgY3VycmVudF9zdGVwOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHN0ZXBzOiBudW1iZXJbXTtcclxuICAgIHByaXZhdGUgYWNjOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc3RlcHM6IG51bWJlcltdLCBlbnRpdHk6IEVudGl0eSwgZGVsZWdhdGU6IEVudGl0eUFuaW1hdGlvbkRlbGVnYXRlKSB7XHJcbiAgICAgICAgdGhpcy5wcm9ncmVzcyA9IDA7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50X3N0ZXAgPSAtMTtcclxuICAgICAgICB0aGlzLnN0ZXBzID0gc3RlcHM7XHJcbiAgICAgICAgdGhpcy5hY2MgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLmRlbGVnYXRlID0gZGVsZWdhdGU7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkgPSBlbnRpdHk7XHJcbiAgICB9XHJcbiAgICBzdGVwKGluaXQ6IGJvb2xlYW4sIHN0ZXA6IG51bWJlciwgcHJvZ3Jlc3M6IG51bWJlcikge1xyXG4gICAgICAgIC8vIHJldHVybiB0cnVlIGlmIHdlIHNob3VsZCBjb250aW51ZSwgZmFsc2UgaWYgd2Ugc2hvdWxkIHN0b3AgZXhlY3V0aW9uXHJcbiAgICB9XHJcbiAgICBydW4oc3RlcHM6IG51bWJlcikge1xyXG5cclxuICAgICAgICB0aGlzLmFjYyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5hY2MgPCA1KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hY2MgLT0gNTtcclxuXHJcbiAgICAgICAgbGV0IHN0ZXAgPSAwO1xyXG4gICAgICAgIHdoaWxlIChzdGVwIDwgdGhpcy5zdGVwcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucHJvZ3Jlc3MgPCB0aGlzLnN0ZXBzW3N0ZXBdKSB7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdGVwKys7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBpbml0ID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHN0ZXAgPiB0aGlzLmN1cnJlbnRfc3RlcCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRfc3RlcCA9IHN0ZXA7XHJcbiAgICAgICAgICAgIGluaXQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgcHJvZ3Jlc3MgPSB0aGlzLmN1cnJlbnRfc3RlcCA+IDAgPyB0aGlzLnByb2dyZXNzIC0gdGhpcy5zdGVwc1sodGhpcy5jdXJyZW50X3N0ZXAgLSAxKV0gOiB0aGlzLnByb2dyZXNzO1xyXG4gICAgICAgIHRoaXMucHJvZ3Jlc3MrKztcclxuICAgICAgICB0aGlzLnN0ZXAoaW5pdCwgdGhpcy5jdXJyZW50X3N0ZXAsIHByb2dyZXNzKTtcclxuICAgIH1cclxufVxyXG5jbGFzcyBBdHRhY2tBbmltYXRpb24gZXh0ZW5kcyBFbnRpdHlBbmltYXRpb24ge1xyXG5cclxuICAgIGZpcnN0OiBib29sZWFuO1xyXG4gICAgYXR0YWNrZXI6IEVudGl0eTtcclxuXHJcbiAgICBwcml2YXRlIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZW50aXR5OiBFbnRpdHksIGRlbGVnYXRlOiBFbnRpdHlBbmltYXRpb25EZWxlZ2F0ZSwgZ3JvdXA6IFBoYXNlci5Hcm91cCwgYXR0YWNrZXI6IEVudGl0eSwgZmlyc3Q6IGJvb2xlYW4pIHtcclxuICAgICAgICBzdXBlcihbNiwgOF0sIGVudGl0eSwgZGVsZWdhdGUpO1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlBbmltYXRpb25UeXBlLkF0dGFjaztcclxuXHJcbiAgICAgICAgdGhpcy5maXJzdCA9IGZpcnN0O1xyXG4gICAgICAgIHRoaXMuYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgfVxyXG4gICAgc3RlcChpbml0OiBib29sZWFuLCBzdGVwOiBudW1iZXIsIHByb2dyZXNzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbWlkZGxlID0gdGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCwgbWlkZGxlLnksIFwicmVkc3BhcmtcIiwgMCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmZyYW1lID0gcHJvZ3Jlc3MgJSAzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkuc2V0V29ybGRQb3NpdGlvbih7eDogbWlkZGxlLnggKyAyIC0gcHJvZ3Jlc3MgJSAyICogNCwgeTogbWlkZGxlLnl9KTsgLy8gMCAtIDJweCByaWdodCwgMSAtIDJweCBsZWZ0LCAyIC0gMnB4IHJpZ2h0XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnNldFdvcmxkUG9zaXRpb24oe3g6IG1pZGRsZS54ICsgMiAtIHByb2dyZXNzICUgMiAqIDQsIHk6IG1pZGRsZS55fSk7IC8vIDcgLSAycHggbGVmdCwgOCAtIDJweCByaWdodFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXR5LnNldFdvcmxkUG9zaXRpb24odGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hbmltYXRpb25EaWRFbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmNsYXNzIFN0YXR1c0FuaW1hdGlvbiBleHRlbmRzIEVudGl0eUFuaW1hdGlvbiB7XHJcbiAgICBzdGF0dXM6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIGltYWdlMjogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudGl0eTogRW50aXR5LCBkZWxlZ2F0ZTogRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIHN0YXR1czogbnVtYmVyKSB7XHJcbiAgICAgICAgc3VwZXIoc3RhdHVzID09IDEgPyBbMCwgNiwgMTRdIDogWzEwLCAxNiwgMjRdLCBlbnRpdHksIGRlbGVnYXRlKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlBbmltYXRpb25UeXBlLlN0YXR1cztcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBzdGF0dXM7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgfVxyXG4gICAgc3RlcChpbml0OiBib29sZWFuLCBzdGVwOiBudW1iZXIsIHByb2dyZXNzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbWlkZGxlID0gdGhpcy5lbnRpdHkucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpO1xyXG4gICAgICAgIHN3aXRjaCAoc3RlcCkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAvLyB3YWl0XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgaWYgKGluaXQpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMCB8fCB0aGlzLnN0YXR1cyA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UyID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCArIDQsIG1pZGRsZS55ICsgNCwgXCJzdGF0dXNcIiwgdGhpcy5zdGF0dXMsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCwgbWlkZGxlLnksIFwic3BhcmtcIiwgMCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmZyYW1lID0gcHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UubG9hZFRleHR1cmUoXCJzbW9rZVwiLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVwbGFjZSB3aXRoIHRvbWIgZ3JhcGhpY1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eS51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5EZWFkLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZS55ID0gbWlkZGxlLnkgLSBwcm9ncmVzcyAqIDM7IC8vIDAsIDMsIDZcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmZyYW1lID0gTWF0aC5mbG9vcihwcm9ncmVzcyAvIDIpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSAzOlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgfWVsc2UgaWYgKHRoaXMuc3RhdHVzID09IDAgfHwgdGhpcy5zdGF0dXMgPT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UyLmRlc3Ryb3koKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuYW5pbWF0aW9uRGlkRW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5hbmltYXRpb25EaWRFbmQodGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbmNsYXNzIFJhaXNlQW5pbWF0aW9uIGV4dGVuZHMgRW50aXR5QW5pbWF0aW9uIHtcclxuICAgIG5ld19hbGxpYW5jZTogQWxsaWFuY2U7XHJcblxyXG4gICAgcHJpdmF0ZSBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBpbWFnZXM6IFBoYXNlci5JbWFnZVtdO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGVudGl0eTogRW50aXR5LCBkZWxlZ2F0ZTogRW50aXR5QW5pbWF0aW9uRGVsZWdhdGUsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG5ld19hbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzdXBlcihbOCwgMThdLCBlbnRpdHksIGRlbGVnYXRlKTtcclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlBbmltYXRpb25UeXBlLlJhaXNlO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5uZXdfYWxsaWFuY2UgPSBuZXdfYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy5pbWFnZXMgPSBbXTtcclxuXHJcbiAgICB9XHJcbiAgICBzdGVwKGluaXQ6IGJvb2xlYW4sIHN0ZXA6IG51bWJlciwgcHJvZ3Jlc3M6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBtaWRkbGUgPSB0aGlzLmVudGl0eS5wb3NpdGlvbi5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgc3dpdGNoIChzdGVwKSB7XHJcbiAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZXMucHVzaCh0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKG1pZGRsZS54IC0gOCwgbWlkZGxlLnkgLSA4LCBcInNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmltYWdlcy5wdXNoKHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UobWlkZGxlLnggKyA4LCBtaWRkbGUueSAtIDgsIFwic3BhcmtcIiwgMCwgdGhpcy5ncm91cCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzLnB1c2godGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZShtaWRkbGUueCAtIDgsIG1pZGRsZS55ICsgOCwgXCJzcGFya1wiLCAwLCB0aGlzLmdyb3VwKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbWFnZXMucHVzaCh0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKG1pZGRsZS54ICsgOCwgbWlkZGxlLnkgKyA4LCBcInNwYXJrXCIsIDAsIHRoaXMuZ3JvdXApKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxldCBkID0gOCAtIHByb2dyZXNzO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLmZyYW1lID0gcHJvZ3Jlc3MgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ueCA9IG1pZGRsZS54IC0gZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLnkgPSBtaWRkbGUueSAtIGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0uZnJhbWUgPSBwcm9ncmVzcyAlIDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS54ID0gbWlkZGxlLnggKyBkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ueSA9IG1pZGRsZS55IC0gZDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS5mcmFtZSA9IHByb2dyZXNzICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzJdLnggPSBtaWRkbGUueCAtIGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS55ID0gbWlkZGxlLnkgKyBkO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLmZyYW1lID0gcHJvZ3Jlc3MgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbM10ueCA9IG1pZGRsZS54ICsgZDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLnkgPSBtaWRkbGUueSArIGQ7XHJcblxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIGlmIChpbml0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkucmFpc2UodGhpcy5uZXdfYWxsaWFuY2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbGV0IGQyID0gLXByb2dyZXNzO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzBdLmZyYW1lID0gKHByb2dyZXNzICsgMikgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMF0ueCA9IG1pZGRsZS54IC0gZDI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS55ID0gbWlkZGxlLnkgLSBkMjtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS5mcmFtZSA9IChwcm9ncmVzcyArIDIpICUgNjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzFdLnggPSBtaWRkbGUueCArIGQyO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMV0ueSA9IG1pZGRsZS55IC0gZDI7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbMl0uZnJhbWUgPSAocHJvZ3Jlc3MgKyAyKSAlIDY7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS54ID0gbWlkZGxlLnggLSBkMjtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzJdLnkgPSBtaWRkbGUueSArIGQyO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2VzWzNdLmZyYW1lID0gKHByb2dyZXNzICsgMikgJSA2O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNbM10ueCA9IG1pZGRsZS54ICsgZDI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS55ID0gbWlkZGxlLnkgKyBkMjtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1swXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1sxXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1syXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmltYWdlc1szXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGVnYXRlLmFuaW1hdGlvbkRpZEVuZCh0aGlzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFuaW1hdGlvbi50c1wiIC8+XHJcblxyXG5pbnRlcmZhY2UgRW50aXR5RGF0YSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBtb3Y6IG51bWJlcjtcclxuICAgIGF0azogbnVtYmVyO1xyXG4gICAgZGVmOiBudW1iZXI7XHJcbiAgICBtYXg6IG51bWJlcjtcclxuICAgIG1pbjogbnVtYmVyO1xyXG4gICAgY29zdDogbnVtYmVyO1xyXG4gICAgYmF0dGxlX3Bvc2l0aW9uczogSVBvc1tdO1xyXG4gICAgZmxhZ3M6IEVudGl0eUZsYWdzO1xyXG59XHJcbmVudW0gRW50aXR5RmxhZ3Mge1xyXG4gICAgTm9uZSA9IDAsIC8vIEdvbGVtLCBTa2VsZXRvblxyXG4gICAgQ2FuRmx5ID0gMSxcclxuICAgIFdhdGVyQm9vc3QgPSAyLFxyXG4gICAgQ2FuQnV5ID0gNCxcclxuICAgIENhbk9jY3VweUhvdXNlID0gOCxcclxuICAgIENhbk9jY3VweUNhc3RsZSA9IDE2LFxyXG4gICAgQ2FuUmFpc2UgPSAzMixcclxuICAgIEFudGlGbHlpbmcgPSA2NCxcclxuICAgIENhblBvaXNvbiA9IDEyOCxcclxuICAgIENhbldpc3AgPSAyNTYsXHJcbiAgICBDYW50QXR0YWNrQWZ0ZXJNb3ZpbmcgPSA1MTJcclxufVxyXG5cclxuaW50ZXJmYWNlIElFbnRpdHkge1xyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxuICAgIHg/OiBudW1iZXI7XHJcbiAgICB5PzogbnVtYmVyO1xyXG4gICAgcmFuaz86IG51bWJlcjtcclxuICAgIGVwPzogbnVtYmVyO1xyXG4gICAgc3RhdGU/OiBFbnRpdHlTdGF0ZTtcclxuICAgIHN0YXR1cz86IEVudGl0eVN0YXR1cztcclxuICAgIGhlYWx0aD86IG51bWJlcjtcclxuICAgIGRlYXRoX2NvdW50PzogbnVtYmVyO1xyXG59XHJcbmVudW0gRW50aXR5VHlwZSB7XHJcbiAgICBTb2xkaWVyLFxyXG4gICAgQXJjaGVyLFxyXG4gICAgTGl6YXJkLFxyXG4gICAgV2l6YXJkLFxyXG4gICAgV2lzcCxcclxuICAgIFNwaWRlcixcclxuICAgIEdvbGVtLFxyXG4gICAgQ2F0YXB1bHQsXHJcbiAgICBXeXZlcm4sXHJcbiAgICBLaW5nLFxyXG4gICAgU2tlbGV0b25cclxufVxyXG5lbnVtIEVudGl0eVN0YXR1cyB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFBvaXNvbmVkID0gMSA8PCAwLFxyXG4gICAgV2lzcGVkID0gMSA8PCAxXHJcbn1cclxuZW51bSBFbnRpdHlTdGF0ZSB7XHJcbiAgICBSZWFkeSA9IDAsXHJcbiAgICBNb3ZlZCA9IDEsXHJcbiAgICBEZWFkID0gMlxyXG59XHJcblxyXG5pbnRlcmZhY2UgRW50aXR5UGF0aCB7XHJcbiAgICBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlO1xyXG4gICAgbGluZTogTGluZVBhcnRbXTtcclxuICAgIHRhcmdldDogUG9zO1xyXG4gICAgcHJvZ3Jlc3M6IG51bWJlcjtcclxufVxyXG5cclxuY2xhc3MgRW50aXR5IGV4dGVuZHMgU3ByaXRlIHtcclxuXHJcbiAgICB0eXBlOiBFbnRpdHlUeXBlO1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGRhdGE6IEVudGl0eURhdGE7XHJcblxyXG4gICAgaWNvbl9oZWFsdGg6IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBoZWFsdGg6IG51bWJlcjtcclxuICAgIHJhbms6IG51bWJlcjtcclxuICAgIGVwOiBudW1iZXI7XHJcblxyXG4gICAgZGVhdGhfY291bnQ6IG51bWJlcjtcclxuXHJcbiAgICBzdGF0dXM6IEVudGl0eVN0YXR1cztcclxuICAgIHN0YXRlOiBFbnRpdHlTdGF0ZTtcclxuXHJcbiAgICBhdGtfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBkZWZfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBtb3ZfYm9vc3Q6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcGF0aDogRW50aXR5UGF0aDtcclxuICAgIGFuaW1hdGlvbjogRW50aXR5QW5pbWF0aW9uO1xyXG5cclxuICAgIHN0YXR1c19hbmltYXRpb246IG51bWJlcjtcclxuICAgIHByaXZhdGUgaWNvbl9tb3ZlZDogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IEVudGl0eVR5cGUsIGFsbGlhbmNlOiBBbGxpYW5jZSwgcG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YSA9IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTW3R5cGVdO1xyXG4gICAgICAgIHRoaXMuYWxsaWFuY2UgPSBhbGxpYW5jZTtcclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcclxuXHJcbiAgICAgICAgdGhpcy5kZWF0aF9jb3VudCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gMTA7XHJcbiAgICAgICAgdGhpcy5yYW5rID0gMDtcclxuICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICB0aGlzLnN0YXR1cyA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGF0ZSA9IEVudGl0eVN0YXRlLlJlYWR5O1xyXG5cclxuICAgICAgICB0aGlzLnN0YXR1c19hbmltYXRpb24gPSAtMTtcclxuICAgIH1cclxuICAgIGluaXQoZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgICBzdXBlci5pbml0KHRoaXMucG9zaXRpb24uZ2V0V29ybGRQb3NpdGlvbigpLCBncm91cCwgXCJ1bml0X2ljb25zX1wiICsgKDxudW1iZXI+IHRoaXMuYWxsaWFuY2UpLCBbdGhpcy50eXBlLCB0aGlzLnR5cGUgKyBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5sZW5ndGhdKTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkID0gZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMCwgMCwgXCJjaGFyc1wiLCA0LCBncm91cCk7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnZpc2libGUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5pY29uX2hlYWx0aCA9IGdyb3VwLmdhbWUuYWRkLmltYWdlKDAsIDAsIFwiY2hhcnNcIiwgMCwgZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgaXNEZWFkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmhlYWx0aCA9PSAwO1xyXG4gICAgfVxyXG4gICAgaGFzRmxhZyhmbGFnOiBFbnRpdHlGbGFncykge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5kYXRhLmZsYWdzICYgZmxhZykgIT0gMDtcclxuICAgIH1cclxuICAgIGdldERpc3RhbmNlVG9FbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnBvc2l0aW9uLmRpc3RhbmNlVG8oZW50aXR5LnBvc2l0aW9uKTtcclxuICAgIH1cclxuICAgIHNob3VsZFJhbmtVcCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5yYW5rIDwgMyAmJiB0aGlzLmVwID49IDc1IDw8IHRoaXMucmFuaykge1xyXG4gICAgICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICAgICAgdGhpcy5yYW5rKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBhdHRhY2sodGFyZ2V0OiBFbnRpdHksIG1hcDogTWFwKSB7XHJcblxyXG4gICAgICAgIGxldCBuOiBudW1iZXI7XHJcblxyXG4gICAgICAgIC8vIGdldCBiYXNlIGRhbWFnZVxyXG4gICAgICAgIGxldCBhdGsgPSB0aGlzLmRhdGEuYXRrICsgdGhpcy5hdGtfYm9vc3Q7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5VHlwZS5BcmNoZXIgJiYgdGFyZ2V0LnR5cGUgPT0gRW50aXR5VHlwZS5XeXZlcm4pIHtcclxuICAgICAgICAgICAgYXRrICs9IDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50eXBlID09IEVudGl0eVR5cGUuV2lzcCAmJiB0YXJnZXQudHlwZSA9PSBFbnRpdHlUeXBlLlNrZWxldG9uKSB7XHJcbiAgICAgICAgICAgIGF0ayArPSAzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDM5KSAtIDE5ICsgdGhpcy5yYW5rOyAvLyAtMTkgLSAxOSByYW5kb21cclxuXHJcbiAgICAgICAgaWYgKG4gPj0gMTkpIHtcclxuICAgICAgICAgICAgYXRrICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgYXRrICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGF0ayAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBhdGsgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWYgPSB0YXJnZXQuZGF0YS5kZWYgKyB0YXJnZXQuZGVmX2Jvb3N0O1xyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMzkpIC0gMTkgKyB0YXJnZXQucmFuazsgLy8gLTE5IC0gMTkgcmFuZG9tXHJcblxyXG4gICAgICAgIGlmIChuID49IDE5KSB7XHJcbiAgICAgICAgICAgIGRlZiArPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuID49IDE3KSB7XHJcbiAgICAgICAgICAgIGRlZiArPSAxO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xOSkge1xyXG4gICAgICAgICAgICBkZWYgLT0gMjtcclxuICAgICAgICB9ZWxzZSBpZiAobiA8PSAtMTcpIHtcclxuICAgICAgICAgICAgZGVmIC09IDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgcmVkX2hlYWx0aCA9IE1hdGguZmxvb3IoKGF0ayAtIChkZWYgKyBtYXAuZ2V0RGVmQXQodGFyZ2V0LnBvc2l0aW9uLCB0YXJnZXQudHlwZSkpICogKDIgLyAzKSkgKiB0aGlzLmhlYWx0aCAvIDEwKTtcclxuICAgICAgICBpZiAocmVkX2hlYWx0aCA+IHRhcmdldC5oZWFsdGgpIHtcclxuICAgICAgICAgICAgcmVkX2hlYWx0aCA9IHRhcmdldC5oZWFsdGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0YXJnZXQuc2V0SGVhbHRoKHRhcmdldC5oZWFsdGggLSByZWRfaGVhbHRoKTtcclxuICAgICAgICB0aGlzLmVwICs9ICh0YXJnZXQuZGF0YS5hdGsgKyB0YXJnZXQuZGF0YS5kZWYpICogcmVkX2hlYWx0aDtcclxuICAgIH1cclxuICAgIHVwZGF0ZVN0YXR1cygpIHtcclxuICAgICAgICB0aGlzLmF0a19ib29zdCA9IDA7XHJcbiAgICAgICAgdGhpcy5kZWZfYm9vc3QgPSAwO1xyXG4gICAgICAgIHRoaXMubW92X2Jvb3N0ID0gMDtcclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgJiBFbnRpdHlTdGF0dXMuUG9pc29uZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5hdGtfYm9vc3QtLTtcclxuICAgICAgICAgICAgdGhpcy5kZWZfYm9vc3QtLTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZfYm9vc3QtLTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc3RhdHVzICYgRW50aXR5U3RhdHVzLldpc3BlZCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0a19ib29zdCsrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHNldFN0YXR1cyhzdGF0dXM6IEVudGl0eVN0YXR1cykge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzIHw9IHN0YXR1cztcclxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXR1cygpO1xyXG4gICAgfVxyXG4gICAgY2xlYXJTdGF0dXMoc3RhdHVzOiBFbnRpdHlTdGF0dXMpIHtcclxuICAgICAgICB0aGlzLnN0YXR1cyAmPSB+c3RhdHVzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzKCk7XHJcbiAgICB9XHJcbiAgICBnZXRQb3dlckVzdGltYXRlKHBvc2l0aW9uOiBQb3MsIG1hcDogTWFwKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigodGhpcy5yYW5rICsgdGhpcy5kYXRhLmF0ayArIHRoaXMuZGF0YS5kZWYgKyBtYXAuZ2V0RGVmQXQocG9zaXRpb24sIHRoaXMudHlwZSkpICogdGhpcy5oZWFsdGgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVN0YXRlKHN0YXRlOiBFbnRpdHlTdGF0ZSwgc2hvdzogYm9vbGVhbikge1xyXG5cclxuICAgICAgICB0aGlzLnN0YXRlID0gc3RhdGU7XHJcblxyXG4gICAgICAgIGlmIChzdGF0ZSA9PSBFbnRpdHlTdGF0ZS5EZWFkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLmxvYWRUZXh0dXJlKFwidG9tYnN0b25lXCIsIDApO1xyXG4gICAgICAgICAgICB0aGlzLnNldEZyYW1lcyhbMF0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLmxvYWRUZXh0dXJlKFwidW5pdF9pY29uc19cIiArICg8bnVtYmVyPiB0aGlzLmFsbGlhbmNlKSwgKDxudW1iZXI+IHRoaXMudHlwZSkpO1xyXG4gICAgICAgICAgICB0aGlzLnNldEZyYW1lcyhbdGhpcy50eXBlLCB0aGlzLnR5cGUgKyBBbmNpZW50RW1waXJlcy5FTlRJVElFUy5sZW5ndGhdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBzaG93X2ljb24gPSAoc2hvdyAmJiBzdGF0ZSA9PSBFbnRpdHlTdGF0ZS5Nb3ZlZCk7XHJcblxyXG4gICAgICAgIHRoaXMuaWNvbl9tb3ZlZC54ID0gdGhpcy5zcHJpdGUueCArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDc7XHJcbiAgICAgICAgdGhpcy5pY29uX21vdmVkLnkgPSB0aGlzLnNwcml0ZS55ICsgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gNztcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQudmlzaWJsZSA9IHNob3dfaWNvbjtcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQuYnJpbmdUb1RvcCgpO1xyXG4gICAgfVxyXG4gICAgc3RhcnRBbmltYXRpb24oYW5pbWF0aW9uOiBFbnRpdHlBbmltYXRpb24pIHtcclxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcclxuICAgIH1cclxuICAgIG1vdmUodGFyZ2V0OiBQb3MsIGxpbmU6IExpbmVQYXJ0W10sIGRlbGVnYXRlOiBFbnRpdHlNYW5hZ2VyRGVsZWdhdGUpIHtcclxuICAgICAgICB0aGlzLnBhdGggPSB7XHJcbiAgICAgICAgICAgIHByb2dyZXNzOiAwLFxyXG4gICAgICAgICAgICBsaW5lOiBsaW5lLFxyXG4gICAgICAgICAgICBkZWxlZ2F0ZTogZGVsZWdhdGUsXHJcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyID0gMSkge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIGlmICghIXRoaXMucGF0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnBhdGgucHJvZ3Jlc3MgKz0gc3RlcHM7XHJcblxyXG4gICAgICAgICAgICAvLyBmaXJzdCBjaGVjayBpcyBzbyB3ZSBjYW4gc3RheSBhdCB0aGUgc2FtZSBwbGFjZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXRoLmxpbmUubGVuZ3RoID4gMCAmJiB0aGlzLnBhdGgucHJvZ3Jlc3MgPj0gdGhpcy5wYXRoLmxpbmVbMF0ubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGgucHJvZ3Jlc3MgLT0gdGhpcy5wYXRoLmxpbmVbMF0ubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wYXRoLmxpbmUuc2hpZnQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5wYXRoLmxpbmUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGRpZmYgPSBuZXcgUG9zKDAsIDApLm1vdmUodGhpcy5wYXRoLmxpbmVbMF0uZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29ybGRfcG9zaXRpb24ueCA9IHRoaXMucGF0aC5saW5lWzBdLnBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgKyBkaWZmLnggKiB0aGlzLnBhdGgucHJvZ3Jlc3M7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkX3Bvc2l0aW9uLnkgPSB0aGlzLnBhdGgubGluZVswXS5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgZGlmZi55ICogdGhpcy5wYXRoLnByb2dyZXNzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHRoaXMucGF0aC50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkX3Bvc2l0aW9uID0gdGhpcy5wYXRoLnRhcmdldC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGVsZWdhdGUgPSB0aGlzLnBhdGguZGVsZWdhdGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBhdGggPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgZGVsZWdhdGUuZW50aXR5RGlkTW92ZSh0aGlzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmICghIXRoaXMuYW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uLnJ1bihzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgfVxyXG4gICAgc2V0SGVhbHRoKGhlYWx0aDogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5oZWFsdGggPSBoZWFsdGg7XHJcbiAgICAgICAgaWYgKGhlYWx0aCA+IDkgfHwgaGVhbHRoIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGguZnJhbWUgPSAyNyArIChoZWFsdGggLSAxKTtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLnggPSB0aGlzLnNwcml0ZS54O1xyXG4gICAgICAgIHRoaXMuaWNvbl9oZWFsdGgueSA9IHRoaXMuc3ByaXRlLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA3O1xyXG4gICAgfVxyXG4gICAgcmFpc2UoYWxsaWFuY2U6IEFsbGlhbmNlKSB7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5VHlwZS5Ta2VsZXRvbjtcclxuICAgICAgICB0aGlzLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgdGhpcy5yYW5rID0gMDtcclxuICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICB0aGlzLmRlYXRoX2NvdW50ID0gMDtcclxuICAgICAgICB0aGlzLnNldEhlYWx0aCgxMCk7XHJcbiAgICAgICAgdGhpcy5jbGVhclN0YXR1cyhFbnRpdHlTdGF0dXMuUG9pc29uZWQpO1xyXG4gICAgICAgIHRoaXMuY2xlYXJTdGF0dXMoRW50aXR5U3RhdHVzLldpc3BlZCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0ZShFbnRpdHlTdGF0ZS5Nb3ZlZCwgdHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TW92ZW1lbnQoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhLm1vdiArIHRoaXMubW92X2Jvb3N0O1xyXG4gICAgfVxyXG4gICAgc2hvdWxkQ291bnRlcih0YXJnZXQ6IFBvcyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5oZWFsdGggPiAwICYmIHRoaXMucG9zaXRpb24uZGlzdGFuY2VUbyh0YXJnZXQpIDwgMiAmJiB0aGlzLmRhdGEubWluIDwgMik7XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLmljb25faGVhbHRoLmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLmljb25fbW92ZWQuZGVzdHJveSgpO1xyXG4gICAgICAgIHN1cGVyLmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQoKTogSUVudGl0eSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdHlwZTogdGhpcy50eXBlLFxyXG4gICAgICAgICAgICBhbGxpYW5jZTogdGhpcy5hbGxpYW5jZSxcclxuICAgICAgICAgICAgeDogdGhpcy5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICB5OiB0aGlzLnBvc2l0aW9uLnksXHJcbiAgICAgICAgICAgIHJhbmsgOiB0aGlzLnJhbmssXHJcbiAgICAgICAgICAgIGVwOiB0aGlzLmVwLFxyXG4gICAgICAgICAgICBzdGF0ZTogdGhpcy5zdGF0ZSxcclxuICAgICAgICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcclxuICAgICAgICAgICAgaGVhbHRoOiB0aGlzLmhlYWx0aCxcclxuICAgICAgICAgICAgZGVhdGhfY291bnQ6IHRoaXMuZGVhdGhfY291bnRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBJV2F5cG9pbnQge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGNvc3Q6IG51bWJlcjtcclxuICAgIGZvcm06IG51bWJlcjtcclxuICAgIHBhcmVudDogSVdheXBvaW50O1xyXG59XHJcbmludGVyZmFjZSBMaW5lUGFydCB7XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XHJcbiAgICBsZW5ndGg6IG51bWJlcjtcclxufVxyXG5lbnVtIEVudGl0eVJhbmdlVHlwZSB7XHJcbiAgICBOb25lLFxyXG4gICAgTW92ZSxcclxuICAgIEF0dGFjayxcclxuICAgIFJhaXNlXHJcbn1cclxuY2xhc3MgRW50aXR5UmFuZ2Uge1xyXG5cclxuICAgIHdheXBvaW50czogSVdheXBvaW50W107XHJcbiAgICBtYXA6IE1hcDtcclxuXHJcbiAgICB0eXBlOiBFbnRpdHlSYW5nZVR5cGU7XHJcblxyXG4gICAgcmFuZ2VfbGlnaHRlbjogYm9vbGVhbjtcclxuICAgIHJhbmdlX3Byb2dyZXNzOiBudW1iZXI7XHJcblxyXG4gICAgbGluZTogTGluZVBhcnRbXTtcclxuICAgIGxpbmVfb2Zmc2V0OiBudW1iZXI7XHJcbiAgICBsaW5lX2VuZF9wb3NpdGlvbjogUG9zO1xyXG4gICAgbGluZV9zbG93OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBleHRyYV9jdXJzb3I6IFNwcml0ZTtcclxuXHJcbiAgICBwcml2YXRlIHRhcmdldHNfeDogRW50aXR5W107XHJcbiAgICBwcml2YXRlIHRhcmdldHNfeTogRW50aXR5W107XHJcblxyXG4gICAgcHJpdmF0ZSB0YXJnZXQ6IEVudGl0eTtcclxuXHJcblxyXG4gICAgc3RhdGljIGZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbjogUG9zLCB3YXlwb2ludHM6IElXYXlwb2ludFtdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2Ygd2F5cG9pbnRzKXtcclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkgeyByZXR1cm4gd2F5cG9pbnQ7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0TGluZVRvV2F5cG9pbnQod2F5cG9pbnQ6IElXYXlwb2ludCk6IExpbmVQYXJ0W10ge1xyXG4gICAgICAgIGxldCBsaW5lOiBMaW5lUGFydFtdID0gW107XHJcbiAgICAgICAgd2hpbGUgKHdheXBvaW50LnBhcmVudCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGxldCBuZXh0ID0gd2F5cG9pbnQ7XHJcbiAgICAgICAgICAgIHdheXBvaW50ID0gd2F5cG9pbnQucGFyZW50O1xyXG5cclxuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbiA9IHdheXBvaW50LnBvc2l0aW9uLmdldERpcmVjdGlvblRvKG5leHQucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAwICYmIGxpbmVbMF0uZGlyZWN0aW9uID09IGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgbGluZVswXS5wb3NpdGlvbiA9IHdheXBvaW50LnBvc2l0aW9uO1xyXG4gICAgICAgICAgICAgICAgbGluZVswXS5sZW5ndGgrKztcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxpbmUudW5zaGlmdCh7cG9zaXRpb246IHdheXBvaW50LnBvc2l0aW9uLCBkaXJlY3Rpb246IGRpcmVjdGlvbiwgbGVuZ3RoOiAxfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsaW5lO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogTWFwKSB7XHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy50eXBlID0gRW50aXR5UmFuZ2VUeXBlLk5vbmU7XHJcbiAgICB9XHJcbiAgICBpbml0KGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvciA9IG5ldyBTcHJpdGUoKTtcclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5pbml0KHt4OiAwLCB5OiAwfSwgZ3JvdXAsIFwiY3Vyc29yXCIsIFs0XSk7XHJcbiAgICAgICAgdGhpcy5leHRyYV9jdXJzb3IuaGlkZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFdheXBvaW50QXQocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIHJldHVybiBFbnRpdHlSYW5nZS5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIHRoaXMud2F5cG9pbnRzKTtcclxuICAgIH1cclxuICAgIHNvcnQoKSB7XHJcbiAgICAgICAgdGhpcy53YXlwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgaWYgKGEucG9zaXRpb24ueCA9PSBiLnBvc2l0aW9uLngpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBhLnBvc2l0aW9uLnkgLSBiLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVSYW5nZSh0eXBlOiBFbnRpdHlSYW5nZVR5cGUsIGVudGl0eTogRW50aXR5LCB0YXJnZXRzOiBFbnRpdHlbXSkge1xyXG5cclxuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG5cclxuICAgICAgICB0aGlzLnRhcmdldHNfeCA9IHRhcmdldHM7XHJcbiAgICAgICAgdGhpcy50YXJnZXRzX3kgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gbnVsbDtcclxuXHJcbiAgICAgICAgdGhpcy5yYW5nZV9saWdodGVuID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yYW5nZV9wcm9ncmVzcyA9IDEwMDtcclxuXHJcbiAgICAgICAgdGhpcy5saW5lX2VuZF9wb3NpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5saW5lX3Nsb3cgPSAwO1xyXG4gICAgICAgIHRoaXMubGluZV9vZmZzZXQgPSAwO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuUmFpc2U6XHJcbiAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cyA9IFtcclxuICAgICAgICAgICAgICAgICAgICB7cG9zaXRpb246IGVudGl0eS5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5VcCksIGNvc3Q6IDAsIGZvcm06IERpcmVjdGlvbi5BbGwsIHBhcmVudDogbnVsbH0sXHJcbiAgICAgICAgICAgICAgICAgICAge3Bvc2l0aW9uOiBlbnRpdHkucG9zaXRpb24uY29weShEaXJlY3Rpb24uUmlnaHQpLCBjb3N0OiAwLCBmb3JtOiBEaXJlY3Rpb24uQWxsLCBwYXJlbnQ6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtwb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkRvd24pLCBjb3N0OiAwLCBmb3JtOiBEaXJlY3Rpb24uQWxsLCBwYXJlbnQ6IG51bGx9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtwb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkxlZnQpLCBjb3N0OiAwLCBmb3JtOiBEaXJlY3Rpb24uQWxsLCBwYXJlbnQ6IG51bGx9XHJcbiAgICAgICAgICAgICAgICBdO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3IuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5UmFuZ2VUeXBlLkF0dGFjazpcclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgbWluID0gZW50aXR5LmRhdGEubWluO1xyXG4gICAgICAgICAgICAgICAgbGV0IG1heCA9IGVudGl0eS5kYXRhLm1heDtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLndheXBvaW50cyA9IHRoaXMuY2FsY3VsYXRlV2F5cG9pbnRzKGVudGl0eS5wb3NpdGlvbiwgZW50aXR5LmFsbGlhbmNlLCBlbnRpdHkudHlwZSwgbWF4LCBmYWxzZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIGFsbCB3YXlwb2ludHMgdGhhdCBhcmUgbmVhcmVyIHRoYW4gbWluaW11bSByYW5nZVxyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMud2F5cG9pbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHdheXBvaW50ID0gdGhpcy53YXlwb2ludHNbaV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdheXBvaW50LmNvc3QgPCBtaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YXlwb2ludHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkRm9ybSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldEZyYW1lcyhbMiwgM10pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2V0T2Zmc2V0KC0xLCAtMSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zaG93KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuTW92ZTpcclxuICAgICAgICAgICAgICAgIHRoaXMud2F5cG9pbnRzID0gdGhpcy5jYWxjdWxhdGVXYXlwb2ludHMoZW50aXR5LnBvc2l0aW9uLCBlbnRpdHkuYWxsaWFuY2UsIGVudGl0eS50eXBlLCBlbnRpdHkuZ2V0TW92ZW1lbnQoKSwgIWVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbkZseSkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGb3JtKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5leHRyYV9jdXJzb3Iuc2V0RnJhbWVzKFs0XSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRPZmZzZXQoLTEsIC00KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNob3coKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZXh0VGFyZ2V0SW5SYW5nZShkaXJlY3Rpb246IERpcmVjdGlvbik6IEVudGl0eSB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0c194Lmxlbmd0aCA8IDEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghdGhpcy50YXJnZXRzX3kpIHtcclxuICAgICAgICAgICAgdGhpcy5zb3J0VGFyZ2V0cygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlyZWN0aW9uID09IERpcmVjdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBwb3MgPSBuZXcgUG9zKDAsIDApLm1vdmUoZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgaWYgKHBvcy54ICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGluZGV4X3ggPSB0aGlzLnRhcmdldHNfeC5pbmRleE9mKHRoaXMudGFyZ2V0KTtcclxuICAgICAgICAgICAgaW5kZXhfeCArPSBwb3MueDtcclxuICAgICAgICAgICAgaWYgKGluZGV4X3ggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleF94ID0gdGhpcy50YXJnZXRzX3gubGVuZ3RoIC0gMTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKGluZGV4X3ggPj0gdGhpcy50YXJnZXRzX3gubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleF94ID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRhcmdldCA9IHRoaXMudGFyZ2V0c194W2luZGV4X3hdO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHBvcy55ICE9IDBcclxuICAgICAgICBsZXQgaW5kZXhfeSA9IHRoaXMudGFyZ2V0c195LmluZGV4T2YodGhpcy50YXJnZXQpO1xyXG4gICAgICAgIGluZGV4X3kgKz0gcG9zLnk7XHJcbiAgICAgICAgaWYgKGluZGV4X3kgPCAwKSB7XHJcbiAgICAgICAgICAgIGluZGV4X3kgPSB0aGlzLnRhcmdldHNfeS5sZW5ndGggLSAxO1xyXG4gICAgICAgIH1lbHNlIGlmIChpbmRleF95ID49IHRoaXMudGFyZ2V0c195Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICBpbmRleF95ID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnRhcmdldHNfeVtpbmRleF95XTtcclxuICAgICAgICByZXR1cm4gdGhpcy50YXJnZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0VGFyZ2V0KGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmdldFdheXBvaW50QXQoZW50aXR5LnBvc2l0aW9uKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICB0aGlzLnRhcmdldCA9IGVudGl0eTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzb3J0VGFyZ2V0cygpIHtcclxuICAgICAgICB0aGlzLnRhcmdldHNfeSA9IHRoaXMudGFyZ2V0c194LnNsaWNlKCk7XHJcblxyXG4gICAgICAgIHRoaXMudGFyZ2V0c194LnNvcnQoKGE6IEVudGl0eSwgYjogRW50aXR5KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChhLnBvc2l0aW9uLnggPT0gYi5wb3NpdGlvbi54KSB7IHJldHVybiBhLnBvc2l0aW9uLnkgLSBiLnBvc2l0aW9uLnk7IH1cclxuICAgICAgICAgICAgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRhcmdldHNfeS5zb3J0KChhOiBFbnRpdHksIGI6IEVudGl0eSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYS5wb3NpdGlvbi55ID09IGIucG9zaXRpb24ueSkgeyByZXR1cm4gYS5wb3NpdGlvbi54IC0gYi5wb3NpdGlvbi54OyB9XHJcbiAgICAgICAgICAgIHJldHVybiBhLnBvc2l0aW9uLnkgLSBiLnBvc2l0aW9uLnk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIHRha2UgdGhlIGVudGl0eSBtb3N0IHJpZ2h0XHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSB0aGlzLnRhcmdldHNfeC5sZW5ndGggPiAwID8gdGhpcy50YXJnZXRzX3hbdGhpcy50YXJnZXRzX3gubGVuZ3RoIC0gMV0gOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGRyYXcocmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcykge1xyXG5cclxuICAgICAgICBsZXQgY29sb3I6IG51bWJlcjtcclxuICAgICAgICBzd2l0Y2ggKHRoaXMudHlwZSkge1xyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5Nb3ZlOlxyXG4gICAgICAgICAgICBjYXNlIEVudGl0eVJhbmdlVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIGNvbG9yID0gMHhmZmZmZmY7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrOlxyXG4gICAgICAgICAgICAgICAgY29sb3IgPSAweGZmMDAwMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICByYW5nZV9ncmFwaGljcy5iZWdpbkZpbGwoY29sb3IpO1xyXG4gICAgICAgIGZvciAobGV0IHdheXBvaW50IG9mIHRoaXMud2F5cG9pbnRzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHdheXBvaW50LnBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKTtcclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLlVwKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZV9ncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmFuZ2VfZ3JhcGhpY3MuZHJhd1JlY3QocG9zaXRpb24ueCArIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDQsIHBvc2l0aW9uLnksIDQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh3YXlwb2ludC5mb3JtICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgICAgIHJhbmdlX2dyYXBoaWNzLmRyYXdSZWN0KHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSA0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIDQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgod2F5cG9pbnQuZm9ybSAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICByYW5nZV9ncmFwaGljcy5kcmF3UmVjdChwb3NpdGlvbi54LCBwb3NpdGlvbi55LCA0LCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJhbmdlX2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MsIGFuaW1fc3RhdGU6IG51bWJlciwgcmFuZ2VfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgbGluZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk5vbmUpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMucmFuZ2VfbGlnaHRlbikge1xyXG4gICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yYW5nZV9wcm9ncmVzcyA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMucmFuZ2VfcHJvZ3Jlc3MgLT0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJhbmdlX3Byb2dyZXNzIDw9IDQwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX3Byb2dyZXNzID0gNDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlX2xpZ2h0ZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmV4dHJhX2N1cnNvci5zZXRGcmFtZShhbmltX3N0YXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFjdXJzb3JfcG9zaXRpb24ubWF0Y2godGhpcy5saW5lX2VuZF9wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgdGhpcy5saW5lX2VuZF9wb3NpdGlvbiA9IGN1cnNvcl9wb3NpdGlvbi5jb3B5KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZW5kcG9pbnQgPSB0aGlzLmdldFdheXBvaW50QXQoY3Vyc29yX3Bvc2l0aW9uKTtcclxuICAgICAgICAgICAgaWYgKCEhZW5kcG9pbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oY3Vyc29yX3Bvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmUgPSBFbnRpdHlSYW5nZS5nZXRMaW5lVG9XYXlwb2ludChlbmRwb2ludCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLk1vdmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGluZV9zbG93ICs9IHN0ZXBzO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5saW5lX3Nsb3cgPj0gNSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5saW5lX3Nsb3cgLT0gNTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0IC09IDE7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lX29mZnNldCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HIC0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4ZmZmZmZmKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgcGFydCBvZiB0aGlzLmxpbmUpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRyYXdTZWdtZW50KGxpbmVfZ3JhcGhpY3MsIHBhcnQsIHRoaXMubGluZV9vZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbmVfb2Zmc2V0ID0gKHRoaXMubGluZV9vZmZzZXQgKyBwYXJ0Lmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkgJSAoQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbGluZV9ncmFwaGljcy5lbmRGaWxsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGdyZXkgPSB0aGlzLnJhbmdlX3Byb2dyZXNzIC8gMTAwICogMHhGRiB8IDA7XHJcbiAgICAgICAgcmFuZ2VfZ3JhcGhpY3MudGludCA9IChncmV5IDw8IDE2KSB8IChncmV5IDw8IDgpIHwgZ3JleTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhcihyYW5nZV9ncmFwaGljczogUGhhc2VyLkdyYXBoaWNzLCBsaW5lX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MpIHtcclxuICAgICAgICB0aGlzLnR5cGUgPSBFbnRpdHlSYW5nZVR5cGUuTm9uZTtcclxuICAgICAgICB0aGlzLndheXBvaW50cyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZXh0cmFfY3Vyc29yLmhpZGUoKTtcclxuICAgICAgICByYW5nZV9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIGxpbmVfZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBjYWxjdWxhdGVXYXlwb2ludHMocG9zaXRpb246IFBvcywgZW50aXR5X2FsbGlhbmNlOiBBbGxpYW5jZSwgZW50aXR5X3R5cGU6IEVudGl0eVR5cGUsIG1heF9jb3N0OiBudW1iZXIsIHVzZV90ZXJyYWluOiBib29sZWFuKTogSVdheXBvaW50W10ge1xyXG4gICAgICAgIC8vIGNvc3QgZm9yIG9yaWdpbiBwb2ludCBpcyBhbHdheXMgMVxyXG4gICAgICAgIGxldCBvcGVuOiBJV2F5cG9pbnRbXSA9IFt7cG9zaXRpb246IHBvc2l0aW9uLCBjb3N0OiAodXNlX3RlcnJhaW4gPyAxIDogMCksIGZvcm06IDAsIHBhcmVudDogbnVsbH1dO1xyXG4gICAgICAgIGxldCBjbG9zZWQ6IElXYXlwb2ludFtdID0gW107XHJcbiAgICAgICAgd2hpbGUgKG9wZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IG9wZW4uc2hpZnQoKTtcclxuICAgICAgICAgICAgY2xvc2VkLnB1c2goY3VycmVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYWRqYWNlbnRfcG9zaXRpb25zID0gdGhpcy5tYXAuZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChjdXJyZW50LnBvc2l0aW9uKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgcCBvZiBhZGphY2VudF9wb3NpdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tQb3NpdGlvbihwLCBjdXJyZW50LCBvcGVuLCBjbG9zZWQsIG1heF9jb3N0LCB1c2VfdGVycmFpbiwgZW50aXR5X2FsbGlhbmNlLCBlbnRpdHlfdHlwZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGNsb3NlZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGNoZWNrUG9zaXRpb24ocG9zaXRpb246IFBvcywgcGFyZW50OiBJV2F5cG9pbnQsIG9wZW46IElXYXlwb2ludFtdLCBjbG9zZWQ6IElXYXlwb2ludFtdLCBtYXhfY29zdDogbnVtYmVyLCB1c2VfdGVycmFpbjogYm9vbGVhbiwgZW50aXR5X2FsbGlhbmNlOiBBbGxpYW5jZSwgZW50aXR5X3R5cGU6IEVudGl0eVR5cGUpOiBib29sZWFuIHtcclxuXHJcbiAgICAgICAgLy8gYWxyZWFkeSBpcyB0aGUgbG93ZXN0IHBvc3NpYmxlXHJcbiAgICAgICAgaWYgKCEhRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCBjbG9zZWQpKSB7IHJldHVybiBmYWxzZTsgfVxyXG5cclxuICAgICAgICBpZiAodXNlX3RlcnJhaW4pIHtcclxuICAgICAgICAgICAgbGV0IGlzX29jY3VwaWVkID0gdGhpcy5tYXAuZ2V0RW50aXR5QXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZiAoISFpc19vY2N1cGllZCAmJiAhaXNfb2NjdXBpZWQuaXNEZWFkKCkgJiYgaXNfb2NjdXBpZWQuYWxsaWFuY2UgIT0gZW50aXR5X2FsbGlhbmNlKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHRpbGVfY29zdCA9IDE7XHJcbiAgICAgICAgaWYgKHVzZV90ZXJyYWluKSB7XHJcbiAgICAgICAgICAgIHRpbGVfY29zdCA9IHRoaXMubWFwLmdldENvc3RBdChwb3NpdGlvbiwgZW50aXR5X3R5cGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG5ld19jb3N0ID0gcGFyZW50LmNvc3QgKyB0aWxlX2Nvc3Q7XHJcbiAgICAgICAgaWYgKG5ld19jb3N0ID4gbWF4X2Nvc3QpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgIGxldCBpbl9vcGVuID0gRW50aXR5UmFuZ2UuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCBvcGVuKTtcclxuICAgICAgICAvLyBjaGVjayBpZiBpbiBvcGVuIHN0YWNrIGFuZCB3ZSBhcmUgbG93ZXJcclxuICAgICAgICBpZiAoISFpbl9vcGVuKSB7XHJcbiAgICAgICAgICAgIGlmIChpbl9vcGVuLmNvc3QgPD0gbmV3X2Nvc3QpIHsgcmV0dXJuIGZhbHNlOyB9XHJcbiAgICAgICAgICAgIGluX29wZW4uY29zdCA9IG5ld19jb3N0O1xyXG4gICAgICAgICAgICBpbl9vcGVuLnBhcmVudCA9IHBhcmVudDtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9wZW4ucHVzaCh7cG9zaXRpb246IHBvc2l0aW9uLCBwYXJlbnQ6IHBhcmVudCwgZm9ybTogMCwgY29zdDogbmV3X2Nvc3R9KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYWRkRm9ybSgpIHtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB0aGlzLndheXBvaW50cykge1xyXG4gICAgICAgICAgICB3YXlwb2ludC5mb3JtID0gMDtcclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnkgPiAwICYmICF0aGlzLmdldFdheXBvaW50QXQod2F5cG9pbnQucG9zaXRpb24uY29weShEaXJlY3Rpb24uVXApKSkgeyB3YXlwb2ludC5mb3JtICs9IDE7IH1cclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnggPCB0aGlzLm1hcC53aWR0aCAtIDEgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5SaWdodCkpKSB7IHdheXBvaW50LmZvcm0gKz0gMjsgfVxyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueSA8IHRoaXMubWFwLmhlaWdodCAtIDEgJiYgIXRoaXMuZ2V0V2F5cG9pbnRBdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5Eb3duKSkpIHsgd2F5cG9pbnQuZm9ybSArPSA0OyB9XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi54ID4gMCAmJiAhdGhpcy5nZXRXYXlwb2ludEF0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkxlZnQpKSkgeyB3YXlwb2ludC5mb3JtICs9IDg7IH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdTZWdtZW50KGdyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIHBhcnQ6IExpbmVQYXJ0LCBvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHBhcnQubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgIGxldCB4ID0gKHBhcnQucG9zaXRpb24ueCArIDAuNSkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgbGV0IHkgPSAocGFydC5wb3NpdGlvbi55ICsgMC41KSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuXHJcbiAgICAgICAgd2hpbGUgKGRpc3RhbmNlID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSDtcclxuICAgICAgICAgICAgaWYgKG9mZnNldCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aCAtPSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IGxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbGVuZ3RoID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAocGFydC5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlVwOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHggLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCB5IC0gbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgsIGxlbmd0aCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB5IC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxlbmd0aCA+IDApIHsgZ3JhcGhpY3MuZHJhd1JlY3QoeCwgeSAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIGxlbmd0aCwgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHggKz0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IGdyYXBoaWNzLmRyYXdSZWN0KHggLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCB5LCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgsIGxlbmd0aCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB5ICs9IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uTGVmdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyBncmFwaGljcy5kcmF3UmVjdCh4IC0gbGVuZ3RoLCB5IC0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1dJRFRIIC8gMiwgbGVuZ3RoLCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgpOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgeCAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkaXN0YW5jZSAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cImVudGl0eS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHlyYW5nZS50c1wiIC8+XHJcblxyXG5lbnVtIFRpbGUge1xyXG4gICAgUGF0aCxcclxuICAgIEdyYXNzLFxyXG4gICAgRm9yZXN0LFxyXG4gICAgSGlsbCxcclxuICAgIE1vdW50YWluLFxyXG4gICAgV2F0ZXIsXHJcbiAgICBCcmlkZ2UsXHJcbiAgICBIb3VzZSxcclxuICAgIENhc3RsZVxyXG59XHJcbmludGVyZmFjZSBCdWlsZGluZyB7XHJcbiAgICBjYXN0bGU6IGJvb2xlYW47XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG59XHJcbmludGVyZmFjZSBJQnVpbGRpbmcge1xyXG4gICAgeDogbnVtYmVyO1xyXG4gICAgeTogbnVtYmVyO1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG59XHJcblxyXG5jbGFzcyBNYXAge1xyXG5cclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIHdpZHRoOiBudW1iZXI7XHJcbiAgICBoZWlnaHQ6IG51bWJlcjtcclxuXHJcbiAgICBlbnRpdGllczogRW50aXR5W107XHJcbiAgICBlbnRpdHlfcmFuZ2U6IEVudGl0eVJhbmdlO1xyXG5cclxuICAgIHByaXZhdGUgdGlsZXM6IFRpbGVbXVtdO1xyXG4gICAgcHJpdmF0ZSBidWlsZGluZ3M6IEJ1aWxkaW5nW107XHJcblxyXG4gICAgc3RhdGljIGdldFRpbGVGb3JDb2RlKGNvZGU6IG51bWJlcik6IFRpbGUge1xyXG4gICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5USUxFU19QUk9QW2NvZGVdO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBzdGF0aWMgZ2V0Q29zdEZvclRpbGUodGlsZTogVGlsZSwgZW50aXR5X3R5cGU6IEVudGl0eVR5cGUpOiBudW1iZXIge1xyXG5cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLldhdGVyICYmIGVudGl0eV90eXBlID09IEVudGl0eVR5cGUuTGl6YXJkKSB7XHJcbiAgICAgICAgICAgIC8vIExpemFyZCBvbiB3YXRlclxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb3N0ID0gMDtcclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluIHx8IHRpbGUgPT0gVGlsZS5XYXRlcikge1xyXG4gICAgICAgICAgICBjb3N0ID0gMztcclxuICAgICAgICB9IGVsc2UgaWYgKHRpbGUgPT0gVGlsZS5Gb3Jlc3QgfHwgdGlsZSA9PSBUaWxlLkhpbGwpIHtcclxuICAgICAgICAgICAgY29zdCA9IDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29zdCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlbnRpdHlfdHlwZSA9PSBFbnRpdHlUeXBlLkxpemFyZCkge1xyXG4gICAgICAgICAgICAvLyBMaXphcmQgZm9yIGV2ZXJ5dGhpbmcgZXhjZXB0IHdhdGVyXHJcbiAgICAgICAgICAgIHJldHVybiBjb3N0ICogMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb3N0O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldERlZkZvclRpbGUodGlsZTogVGlsZSwgZW50aXR5X3R5cGU/OiBFbnRpdHlUeXBlKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluIHx8IHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7IHJldHVybiAzOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Gb3Jlc3QgfHwgdGlsZSA9PSBUaWxlLkhpbGwpIHsgcmV0dXJuIDI7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLldhdGVyICYmIHR5cGVvZiBlbnRpdHlfdHlwZSAhPSBcInVuZGVmaW5lZFwiICYmIGVudGl0eV90eXBlID09IEVudGl0eVR5cGUuTGl6YXJkKSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5HcmFzcykgeyByZXR1cm4gMTsgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UgPSBuZXcgRW50aXR5UmFuZ2UodGhpcyk7XHJcbiAgICAgICAgdGhpcy5sb2FkKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuXHJcbiAgICAgICAgLSBEQVRBIE9QRVJBVElPTlNcclxuXHJcbiAgICAgKi9cclxuXHJcbiAgICBsb2FkKCkge1xyXG4gICAgICAgIGlmICghQW5jaWVudEVtcGlyZXMuZ2FtZS5jYWNoZS5jaGVja0JpbmFyeUtleSh0aGlzLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ291bGQgbm90IGZpbmQgbWFwOiBcIiArIHRoaXMubmFtZSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmdzID0gW107XHJcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IFtdO1xyXG4gICAgICAgIHRoaXMudGlsZXMgPSBbXTtcclxuXHJcbiAgICAgICAgbGV0IGJ1ZmZlcjogQXJyYXlCdWZmZXIgPSBBbmNpZW50RW1waXJlcy5nYW1lLmNhY2hlLmdldEJpbmFyeSh0aGlzLm5hbWUpO1xyXG4gICAgICAgIGxldCBkYXRhID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0O1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZGF0YS5nZXRVaW50MzIoaW5kZXgpO1xyXG4gICAgICAgIGluZGV4ICs9IDQ7XHJcblxyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGlsZXNbeF0gPSBbXTtcclxuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgY29kZSA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGlsZSA9IE1hcC5nZXRUaWxlRm9yQ29kZShjb2RlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudGlsZXNbeF1beV0gPSB0aWxlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWlsZGluZ3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc3RsZTogKHRpbGUgPT0gVGlsZS5DYXN0bGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjogbmV3IFBvcyh4LCB5KSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsaWFuY2U6IDxBbGxpYW5jZT4gTWF0aC5mbG9vcigoY29kZSAtIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUykgLyAzKVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2tpcCA9IGRhdGEuZ2V0VWludDMyKGluZGV4KTtcclxuICAgICAgICBpbmRleCArPSA0ICsgc2tpcCAqIDQ7XHJcblxyXG4gICAgICAgIGxldCBudW1iZXJfb2ZfZW50aXRpZXMgPSBkYXRhLmdldFVpbnQzMihpbmRleCk7XHJcbiAgICAgICAgaW5kZXggKz0gNDtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJfb2ZfZW50aXRpZXM7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgZGVzYyA9IGRhdGEuZ2V0VWludDgoaW5kZXgrKyk7XHJcbiAgICAgICAgICAgIGxldCB0eXBlOiBFbnRpdHlUeXBlID0gZGVzYyAlIDExO1xyXG4gICAgICAgICAgICBsZXQgYWxsaWFuY2U6IEFsbGlhbmNlID0gTWF0aC5mbG9vcihkZXNjIC8gMTEpICsgMTtcclxuXHJcbiAgICAgICAgICAgIGxldCB4ID0gTWF0aC5mbG9vcihkYXRhLmdldFVpbnQxNihpbmRleCkgLyAxNik7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcbiAgICAgICAgICAgIGxldCB5ID0gTWF0aC5mbG9vcihkYXRhLmdldFVpbnQxNihpbmRleCkgLyAxNik7XHJcbiAgICAgICAgICAgIGluZGV4ICs9IDI7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVudGl0aWVzLnB1c2gobmV3IEVudGl0eSh0eXBlLCBhbGxpYW5jZSwgbmV3IFBvcyh4LCB5KSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGltcG9ydEVudGl0aWVzKGVudGl0aWVzOiBJRW50aXR5W10pIHtcclxuICAgICAgICB0aGlzLmVudGl0aWVzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIGVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGxldCBlID0gdGhpcy5jcmVhdGVFbnRpdHkoZW50aXR5LnR5cGUsIGVudGl0eS5hbGxpYW5jZSwgbmV3IFBvcyhlbnRpdHkueCwgZW50aXR5LnkpKTtcclxuICAgICAgICAgICAgZS5oZWFsdGggPSBlbnRpdHkuaGVhbHRoO1xyXG4gICAgICAgICAgICBlLnN0YXRlID0gZW50aXR5LnN0YXRlO1xyXG4gICAgICAgICAgICBlLnN0YXR1cyA9IGVudGl0eS5zdGF0dXM7XHJcbiAgICAgICAgICAgIGUuZXAgPSBlbnRpdHkuZXA7XHJcbiAgICAgICAgICAgIGUucmFuayA9IGVudGl0eS5yYW5rO1xyXG4gICAgICAgICAgICBlLmRlYXRoX2NvdW50ID0gZW50aXR5LmRlYXRoX2NvdW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGltcG9ydEJ1aWxkaW5ncyhidWlsZGluZ3M6IElCdWlsZGluZ1tdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgYnVpbGRpbmdzKSB7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaCA9IHRoaXMuZ2V0QnVpbGRpbmdBdChuZXcgUG9zKGJ1aWxkaW5nLngsIGJ1aWxkaW5nLnkpKTtcclxuICAgICAgICAgICAgaWYgKCFtYXRjaCkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBtYXRjaC5hbGxpYW5jZSA9IGJ1aWxkaW5nLmFsbGlhbmNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGV4cG9ydEVudGl0aWVzKCk6IElFbnRpdHlbXSB7XHJcbiAgICAgICAgbGV0IGV4cDogSUVudGl0eVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgZXhwLnB1c2goZW50aXR5LmV4cG9ydCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGV4cDtcclxuICAgIH1cclxuICAgIGV4cG9ydEJ1aWxkaW5ncygpOiBJQnVpbGRpbmdbXSB7XHJcbiAgICAgICAgbGV0IGV4cDogSUJ1aWxkaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncykge1xyXG4gICAgICAgICAgICBpZiAoYnVpbGRpbmcuYWxsaWFuY2UgPT0gQWxsaWFuY2UuTm9uZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBleHAucHVzaCh7XHJcbiAgICAgICAgICAgICAgICB4OiBidWlsZGluZy5wb3NpdGlvbi54LFxyXG4gICAgICAgICAgICAgICAgeTogYnVpbGRpbmcucG9zaXRpb24ueSxcclxuICAgICAgICAgICAgICAgIGFsbGlhbmNlOiBidWlsZGluZy5hbGxpYW5jZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGV4cDtcclxuICAgIH1cclxuXHJcbiAgICAvKlxyXG5cclxuICAgICAgICBFTlRJVFkgT1BFUkFUSU9OU1xyXG5cclxuICAgICAqL1xyXG5cclxuICAgIGNyZWF0ZUVudGl0eSh0eXBlOiBFbnRpdHlUeXBlLCBhbGxpYW5jZTogQWxsaWFuY2UsIHBvc2l0aW9uOiBQb3MpOiBFbnRpdHkge1xyXG4gICAgICAgIGxldCBlbnRpdHkgPSBuZXcgRW50aXR5KHR5cGUsIGFsbGlhbmNlLCBwb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5lbnRpdGllcy5wdXNoKGVudGl0eSk7XHJcbiAgICAgICAgcmV0dXJuIGVudGl0eTtcclxuICAgIH1cclxuICAgIHJlbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbnRpdGllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5ID09IHRoaXMuZW50aXRpZXNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZW50aXRpZXMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZW50aXR5LmRlc3Ryb3koKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRFbnRpdHlBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbnRpdHk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0S2luZ1Bvc2l0aW9uKGFsbGlhbmNlOiBBbGxpYW5jZSk6IFBvcyB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSA9PSBhbGxpYW5jZSAmJiBlbnRpdHkudHlwZSA9PSBFbnRpdHlUeXBlLktpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVudGl0aWVzV2l0aChhbGxpYW5jZTogQWxsaWFuY2UsIHN0YXRlPzogRW50aXR5U3RhdGUsIHR5cGU/OiBFbnRpdHlUeXBlKTogRW50aXR5W10ge1xyXG4gICAgICAgIGxldCByZXQ6IEVudGl0eVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSAhPSBhbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHR5cGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbnRpdHkudHlwZSAhPSB0eXBlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RhdGUgIT0gXCJ1bmRlZmluZWRcIiAmJiBlbnRpdHkuc3RhdGUgIT0gc3RhdGUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZSA9PSBcInVuZGVmaW5lZFwiICYmIGVudGl0eS5zdGF0ZSA9PSBFbnRpdHlTdGF0ZS5EZWFkKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIHJldC5wdXNoKGVudGl0eSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgY291bnRFbnRpdGllc1dpdGgoYWxsaWFuY2U6IEFsbGlhbmNlLCBzdGF0ZT86IEVudGl0eVN0YXRlLCB0eXBlPzogRW50aXR5VHlwZSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RW50aXRpZXNXaXRoKGFsbGlhbmNlLCBzdGF0ZSwgdHlwZSkubGVuZ3RoO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRUdXJuKGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSB0aGlzLmVudGl0aWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgIGxldCBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkuZGVhdGhfY291bnQrKztcclxuICAgICAgICAgICAgICAgIGlmIChlbnRpdHkuZGVhdGhfY291bnQgPj0gQW5jaWVudEVtcGlyZXMuREVBVEhfQ09VTlQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGVudGl0eS5hbGxpYW5jZSA9PSBhbGxpYW5jZSkge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LnN0YXRlID0gRW50aXR5U3RhdGUuUmVhZHk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5nZXRBbGxpYW5jZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5oID0gTWF0aC5taW4oZW50aXR5LmhlYWx0aCArIDIsIDEwKTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkuc2V0SGVhbHRoKG5oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zdGF0ZSA9IEVudGl0eVN0YXRlLk1vdmVkO1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LmNsZWFyU3RhdHVzKEVudGl0eVN0YXR1cy5Qb2lzb25lZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHNob3cgPSAoZW50aXR5LmFsbGlhbmNlID09IGFsbGlhbmNlKTtcclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZVN0YXRlKGVudGl0eS5zdGF0ZSwgc2hvdyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcblxyXG4gICAgICAgIC0gVElMRSBPUEVSQVRJT05TXHJcblxyXG4gICAgICovXHJcblxyXG4gICAgZ2V0VGlsZUF0KHBvc2l0aW9uOiBQb3MpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1twb3NpdGlvbi54XVtwb3NpdGlvbi55XTtcclxuICAgIH1cclxuICAgIGdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbjogUG9zKTogVGlsZVtdIHtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAgcG9zaXRpb24ueSA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgLSAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA8IHRoaXMud2lkdGggLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwb3NpdGlvbi54ICsgMSwgcG9zaXRpb24ueSkpIDogLTEsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uLnkgPCB0aGlzLmhlaWdodCAtIDEgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkgKyAxKSkgOiAtMSxcclxuICAgICAgICAgICAgcG9zaXRpb24ueCA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHBvc2l0aW9uLnggLSAxLCBwb3NpdGlvbi55KSkgOiAtMVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChwOiBQb3MpOiBQb3NbXSB7XHJcbiAgICAgICAgbGV0IHJldDogUG9zW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XHJcbiAgICAgICAgaWYgKHAueSA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSAtIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPCB0aGlzLndpZHRoIC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCArIDEsIHAueSkpOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMuaGVpZ2h0IC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCwgcC55ICsgMSkpOyB9XHJcbiAgICAgICAgaWYgKHAueCA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggLSAxLCBwLnkpKTsgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgc2V0QWxsaWFuY2VBdChwb3NpdGlvbjogUG9zLCBhbGxpYW5jZTogQWxsaWFuY2UpOiBib29sZWFuIHtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIGJ1aWxkaW5nLmFsbGlhbmNlID0gYWxsaWFuY2U7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBnZXRCdWlsZGluZ0F0KHBvc2l0aW9uOiBQb3MpOiBCdWlsZGluZyB7XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgdGhpcy5idWlsZGluZ3Mpe1xyXG4gICAgICAgICAgICBpZiAoYnVpbGRpbmcucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYnVpbGRpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBnZXRBbGxpYW5jZUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICBsZXQgYnVpbGRpbmcgPSB0aGlzLmdldEJ1aWxkaW5nQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghIWJ1aWxkaW5nKSB7IHJldHVybiBidWlsZGluZy5hbGxpYW5jZTsgfVxyXG4gICAgICAgIHJldHVybiBBbGxpYW5jZS5Ob25lO1xyXG4gICAgfVxyXG4gICAgZ2V0T2NjdXBpZWRIb3VzZXMoKTogQnVpbGRpbmdbXSB7XHJcbiAgICAgICAgbGV0IGhvdXNlczogQnVpbGRpbmdbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKXtcclxuICAgICAgICAgICAgaWYgKCFidWlsZGluZy5jYXN0bGUgJiYgYnVpbGRpbmcuYWxsaWFuY2UgIT0gQWxsaWFuY2UuTm9uZSkge1xyXG4gICAgICAgICAgICAgICAgaG91c2VzLnB1c2goYnVpbGRpbmcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBob3VzZXM7XHJcbiAgICB9XHJcbiAgICBnZXROZWFyZXN0SG91c2VGb3JFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBCdWlsZGluZyB7XHJcbiAgICAgICAgbGV0IG1pbl9kaXN0ID0gLTE7XHJcbiAgICAgICAgbGV0IG1pbl9idWlsZGluZzogQnVpbGRpbmcgPSBudWxsO1xyXG4gICAgICAgIGZvciAobGV0IGJ1aWxkaW5nIG9mIHRoaXMuYnVpbGRpbmdzKSB7XHJcbiAgICAgICAgICAgIGlmIChidWlsZGluZy5jYXN0bGUpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gTWF0aC5hYnMoYnVpbGRpbmcucG9zaXRpb24ueCAtIGVudGl0eS5wb3NpdGlvbi54KSArIE1hdGguYWJzKGJ1aWxkaW5nLnBvc2l0aW9uLnkgLSBlbnRpdHkucG9zaXRpb24ueSk7XHJcbiAgICAgICAgICAgIGlmIChtaW5fZGlzdCA+PSAwICYmIGRpc3RhbmNlID49IG1pbl9kaXN0KSB7IGNvbnRpbnVlOyB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRNYXAoKSA9PSAyIHx8IChlbnRpdHkudHlwZSA9PSBFbnRpdHlUeXBlLlNvbGRpZXIgJiYgYnVpbGRpbmcuYWxsaWFuY2UgIT0gZW50aXR5LmFsbGlhbmNlKSB8fCAoZW50aXR5LnR5cGUgIT0gRW50aXR5VHlwZS5Tb2xkaWVyICYmIGJ1aWxkaW5nLmFsbGlhbmNlID09IGVudGl0eS5hbGxpYW5jZSkpIHtcclxuICAgICAgICAgICAgICAgIG1pbl9kaXN0ID0gZGlzdGFuY2U7XHJcbiAgICAgICAgICAgICAgICBtaW5fYnVpbGRpbmcgPSBidWlsZGluZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWluX2J1aWxkaW5nO1xyXG4gICAgfVxyXG4gICAgZ2V0R29sZEdhaW5Gb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBnYWluID0gMDtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncykge1xyXG4gICAgICAgICAgICBpZiAoYnVpbGRpbmcuYWxsaWFuY2UgIT0gYWxsaWFuY2UpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgZ2FpbiArPSBidWlsZGluZy5jYXN0bGUgPyA1MCA6IDMwO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZ2FpbjtcclxuICAgIH1cclxuICAgIGdldENvc3RBdChwb3NpdGlvbjogUG9zLCBlbnRpdHlfdHlwZTogRW50aXR5VHlwZSkge1xyXG4gICAgICAgIHJldHVybiBNYXAuZ2V0Q29zdEZvclRpbGUodGhpcy5nZXRUaWxlQXQocG9zaXRpb24pLCBlbnRpdHlfdHlwZSk7XHJcbiAgICB9XHJcbiAgICBnZXREZWZBdChwb3NpdGlvbjogUG9zLCBlbnRpdHlfdHlwZTogRW50aXR5VHlwZSkge1xyXG4gICAgICAgIHJldHVybiBNYXAuZ2V0RGVmRm9yVGlsZSh0aGlzLmdldFRpbGVBdChwb3NpdGlvbiksIGVudGl0eV90eXBlKTtcclxuICAgIH1cclxuICAgIGlzQ2FtcGFpZ24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubmFtZS5jaGFyQXQoMCkgPT0gXCJtXCI7XHJcbiAgICB9XHJcbiAgICBnZXRNYXAoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gcGFyc2VJbnQodGhpcy5uYW1lLmNoYXJBdCgxKSwgMTApO1xyXG4gICAgfVxyXG5cclxuXHJcblxyXG4gICAgZ2V0RW50aXR5T3B0aW9ucyhlbnRpdHk6IEVudGl0eSwgbW92ZWQ6IGJvb2xlYW4gPSBmYWxzZSk6IEFjdGlvbltdIHtcclxuXHJcbiAgICAgICAgaWYgKGVudGl0eS5zdGF0ZSAhPSBFbnRpdHlTdGF0ZS5SZWFkeSkge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmdldEVudGl0eUF0KGVudGl0eS5wb3NpdGlvbikgIT0gZW50aXR5KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbQWN0aW9uLk1PVkVdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG9wdGlvbnM6IEFjdGlvbltdID0gW107XHJcblxyXG4gICAgICAgIGlmICghbW92ZWQgJiYgZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FuQnV5KSAmJiB0aGlzLmdldFRpbGVBdChlbnRpdHkucG9zaXRpb24pID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMucHVzaChBY3Rpb24uQlVZKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghZW50aXR5Lmhhc0ZsYWcoRW50aXR5RmxhZ3MuQ2FudEF0dGFja0FmdGVyTW92aW5nKSB8fCAhbW92ZWQpIHtcclxuICAgICAgICAgICAgbGV0IGF0dGFja190YXJnZXRzID0gdGhpcy5nZXRBdHRhY2tUYXJnZXRzKGVudGl0eSk7XHJcbiAgICAgICAgICAgIGlmIChhdHRhY2tfdGFyZ2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLkFUVEFDSyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5SYWlzZSkpIHtcclxuICAgICAgICAgICAgbGV0IHJhaXNlX3RhcmdldHMgPSB0aGlzLmdldFJhaXNlVGFyZ2V0cyhlbnRpdHkpO1xyXG4gICAgICAgICAgICBpZiAocmFpc2VfdGFyZ2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLlJBSVNFKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZ2V0QWxsaWFuY2VBdChlbnRpdHkucG9zaXRpb24pICE9IGVudGl0eS5hbGxpYW5jZSAmJiAoKGVudGl0eS5oYXNGbGFnKEVudGl0eUZsYWdzLkNhbk9jY3VweUhvdXNlKSAmJiB0aGlzLmdldFRpbGVBdChlbnRpdHkucG9zaXRpb24pID09IFRpbGUuSG91c2UpIHx8IChlbnRpdHkuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5PY2N1cHlDYXN0bGUpICYmIHRoaXMuZ2V0VGlsZUF0KGVudGl0eS5wb3NpdGlvbikgPT0gVGlsZS5DYXN0bGUpKSkge1xyXG4gICAgICAgICAgICBvcHRpb25zLnB1c2goQWN0aW9uLk9DQ1VQWSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAobW92ZWQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5FTkRfTU9WRSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5wdXNoKEFjdGlvbi5NT1ZFKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgLypcclxuXHJcbiAgICAgICAgUkFOR0VcclxuXHJcbiAgICAgKi9cclxuXHJcbiAgICBnZXRBdHRhY2tUYXJnZXRzKGVudGl0eTogRW50aXR5LCBwb3NpdGlvbj86IFBvcykge1xyXG4gICAgICAgIGxldCB0YXJnZXRzOiBFbnRpdHlbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGVuZW15IG9mIHRoaXMuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVuZW15LmFsbGlhbmNlID09IGVudGl0eS5hbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoZW5lbXkuaXNEZWFkKCkpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgbGV0IGRpc3RhbmNlID0gZW50aXR5LmdldERpc3RhbmNlVG9FbnRpdHkoZW5lbXkpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHBvc2l0aW9uICE9IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gcG9zaXRpb24uZGlzdGFuY2VUbyhlbmVteS5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gZW50aXR5LmRhdGEubWF4KSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IGVudGl0eS5kYXRhLm1pbikgeyBjb250aW51ZTsgfVxyXG5cclxuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKGVuZW15KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldHM7XHJcbiAgICB9XHJcbiAgICBnZXRSYWlzZVRhcmdldHMoZW50aXR5OiBFbnRpdHksIHBvc2l0aW9uPzogUG9zKSB7XHJcbiAgICAgICAgbGV0IHRhcmdldHM6IEVudGl0eVtdID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgZGVhZCBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmICghZGVhZC5pc0RlYWQoKSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBlbnRpdHkuZ2V0RGlzdGFuY2VUb0VudGl0eShkZWFkKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBwb3NpdGlvbiAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IHBvc2l0aW9uLmRpc3RhbmNlVG8oZGVhZC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlICE9IDEpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgdGFyZ2V0cy5wdXNoKGRlYWQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGFyZ2V0cztcclxuICAgIH1cclxuICAgIHJlc2V0V2lzcChhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5lbnRpdGllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50aXR5LmFsbGlhbmNlICE9IGFsbGlhbmNlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIGVudGl0eS5jbGVhclN0YXR1cyhFbnRpdHlTdGF0dXMuV2lzcGVkKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFzV2lzcEluUmFuZ2UoZW50aXR5KSkge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LnNldFN0YXR1cyhFbnRpdHlTdGF0dXMuV2lzcGVkKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGhhc1dpc3BJblJhbmdlKGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgd2lzcCBvZiB0aGlzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmICh3aXNwLmFsbGlhbmNlICE9IGVudGl0eS5hbGxpYW5jZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoIXdpc3AuaGFzRmxhZyhFbnRpdHlGbGFncy5DYW5XaXNwKSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAod2lzcC5pc0RlYWQoKSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBsZXQgZGlzdGFuY2UgPSBlbnRpdHkuZ2V0RGlzdGFuY2VUb0VudGl0eSh3aXNwKTtcclxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDwgMSB8fCBkaXN0YW5jZSA+IDIpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93UmFuZ2UodHlwZTogRW50aXR5UmFuZ2VUeXBlLCBlbnRpdHk6IEVudGl0eSk6IEVudGl0eVJhbmdlIHtcclxuXHJcbiAgICAgICAgbGV0IHRhcmdldHM6IEVudGl0eVtdID0gbnVsbDtcclxuICAgICAgICBpZiAodHlwZSA9PSBFbnRpdHlSYW5nZVR5cGUuQXR0YWNrIHx8IHR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLlJhaXNlKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09IEVudGl0eVJhbmdlVHlwZS5BdHRhY2spIHtcclxuICAgICAgICAgICAgICAgIHRhcmdldHMgPSB0aGlzLmdldEF0dGFja1RhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgfWVsc2UgaWYgKHR5cGUgPT0gRW50aXR5UmFuZ2VUeXBlLlJhaXNlKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXRzID0gdGhpcy5nZXRSYWlzZVRhcmdldHMoZW50aXR5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfcmFuZ2UuY3JlYXRlUmFuZ2UodHlwZSwgZW50aXR5LCB0YXJnZXRzKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdHlfcmFuZ2U7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHksIHRhcmdldDogUG9zLCBkZWxlZ2F0ZTogRW50aXR5TWFuYWdlckRlbGVnYXRlLCBhbmltYXRlOiBib29sZWFuID0gdHJ1ZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICBlbnRpdHkucG9zaXRpb24gPSB0YXJnZXQ7XHJcbiAgICAgICAgICAgIGVudGl0eS5zZXRXb3JsZFBvc2l0aW9uKHRhcmdldC5nZXRXb3JsZFBvc2l0aW9uKCkpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEhdGhpcy5nZXRFbnRpdHlBdCh0YXJnZXQpICYmICF0YXJnZXQubWF0Y2goZW50aXR5LnBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAvLyBDYW50IG1vdmUgd2hlcmUgYW5vdGhlciB1bml0IGlzXHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHdheXBvaW50ID0gdGhpcy5lbnRpdHlfcmFuZ2UuZ2V0V2F5cG9pbnRBdCh0YXJnZXQpO1xyXG4gICAgICAgIGlmICghd2F5cG9pbnQpIHtcclxuICAgICAgICAgICAgLy8gdGFyZ2V0IG5vdCBpbiByYW5nZVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBsaW5lID0gRW50aXR5UmFuZ2UuZ2V0TGluZVRvV2F5cG9pbnQod2F5cG9pbnQpO1xyXG4gICAgICAgIGVudGl0eS5tb3ZlKHRhcmdldCwgbGluZSwgZGVsZWdhdGUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRUYXJnZXRJblJhbmdlKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogRW50aXR5IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdHlfcmFuZ2UubmV4dFRhcmdldEluUmFuZ2UoZGlyZWN0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RUYXJnZXRJblJhbmdlKGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5X3JhbmdlLnNlbGVjdFRhcmdldChlbnRpdHkpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFR5cGVPZlJhbmdlKCk6IEVudGl0eVJhbmdlVHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5X3JhbmdlLnR5cGU7XHJcbiAgICB9XHJcbn1cclxuIiwiZW51bSBBbGxpYW5jZSB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIEJsdWUgPSAxLFxyXG4gICAgUmVkID0gMlxyXG59XHJcbmNsYXNzIFRpbGVNYW5hZ2VyIHtcclxuXHJcbiAgICBtYXA6IE1hcDtcclxuICAgIHdhdGVyU3RhdGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgdGlsZW1hcDogUGhhc2VyLlRpbGVtYXA7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGJhY2tncm91bmRMYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuICAgIGJ1aWxkaW5nTGF5ZXI6IFBoYXNlci5UaWxlbWFwTGF5ZXI7XHJcblxyXG4gICAgd2F0ZXJUaW1lcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBzdGF0aWMgZG9lc1RpbGVDdXRHcmFzcyh0aWxlOiBUaWxlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0aWxlID09IFRpbGUuUGF0aCB8fCB0aWxlID09IFRpbGUuV2F0ZXIgfHwgdGlsZSA9PSBUaWxlLkJyaWRnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGU6IFRpbGUpOiBudW1iZXIge1xyXG5cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCkge1xyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5IaWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5OVU1CRVJfT0ZfVElMRVMgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEJhc2VJbWFnZUluZGV4Rm9yVGlsZSh0aWxlOiBUaWxlKTogbnVtYmVyIHtcclxuICAgICAgICBzd2l0Y2ggKHRpbGUpIHtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDIxO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQnJpZGdlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIHJldHVybiAxODtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhpbGw6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhvdXNlOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQ2FzdGxlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFRpbGVNYW5hZ2VyLmdldEltYWdlSW5kZXhGb3JPYmplY3RUaWxlKHRpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gMztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgdGlsZW1hcDogUGhhc2VyLlRpbGVtYXAsIHRpbGVtYXBfZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcCA9IHRpbGVtYXA7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IHRpbGVtYXBfZ3JvdXA7XHJcblxyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJ0aWxlczBcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIDApO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMFwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTKTtcclxuICAgICAgICB0aGlzLnRpbGVtYXAuYWRkVGlsZXNldEltYWdlKFwiYnVpbGRpbmdzXzFcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIG51bGwsIG51bGwsIEFuY2llbnRFbXBpcmVzLk5VTUJFUl9PRl9USUxFUyArIDMpO1xyXG4gICAgICAgIHRoaXMudGlsZW1hcC5hZGRUaWxlc2V0SW1hZ2UoXCJidWlsZGluZ3NfMlwiLCBudWxsLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgbnVsbCwgbnVsbCwgQW5jaWVudEVtcGlyZXMuTlVNQkVSX09GX1RJTEVTICsgNik7XHJcblxyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExheWVyID0gdGhpcy50aWxlbWFwLmNyZWF0ZShcImJhY2tncm91bmRcIiwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMuZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZExheWVyLnJlc2l6ZVdvcmxkKCk7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmdMYXllciA9IHRoaXMudGlsZW1hcC5jcmVhdGVCbGFua0xheWVyKFwiYnVpbGRpbmdcIiwgdGhpcy5tYXAud2lkdGgsIHRoaXMubWFwLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMuZ3JvdXApO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGhpcy5tYXAud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHRoaXMubWFwLmhlaWdodDsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdUaWxlQXQobmV3IFBvcyh4LCB5KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy53YXRlclRpbWVyICs9IHN0ZXBzO1xyXG4gICAgICAgIGlmICh0aGlzLndhdGVyVGltZXIgPiAzMCkge1xyXG4gICAgICAgICAgICB0aGlzLndhdGVyVGltZXIgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVdhdGVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVXYXRlcigpIHtcclxuICAgICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLndhdGVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy53YXRlclN0YXRlID0gMSAtIHRoaXMud2F0ZXJTdGF0ZTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlbWFwLnJlcGxhY2UoMjEgKyBvbGRTdGF0ZSwgMjEgKyB0aGlzLndhdGVyU3RhdGUsIDAsIDAsIHRoaXMubWFwLndpZHRoLCB0aGlzLm1hcC5oZWlnaHQsIHRoaXMuYmFja2dyb3VuZExheWVyKTtcclxuICAgIH1cclxuXHJcbiAgICBkcmF3VGlsZUF0KHBvc2l0aW9uOiBQb3MpIHtcclxuICAgICAgICB0aGlzLnRpbGVtYXAucHV0VGlsZSh0aGlzLmdldEltYWdlSW5kZXhGb3JCYWNrZ3JvdW5kQXQocG9zaXRpb24pLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCB0aGlzLmJhY2tncm91bmRMYXllcik7XHJcbiAgICAgICAgbGV0IHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBvYmogPSBUaWxlTWFuYWdlci5nZXRJbWFnZUluZGV4Rm9yT2JqZWN0VGlsZSh0aWxlKTtcclxuICAgICAgICBpZiAob2JqID49IDApIHtcclxuICAgICAgICAgICAgaWYgKHRpbGUgPT0gVGlsZS5Ib3VzZSB8fCB0aWxlID09IFRpbGUuQ2FzdGxlKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgYWxsaWFuY2UgPSB0aGlzLm1hcC5nZXRBbGxpYW5jZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICAgICAgICAgIG9iaiArPSBhbGxpYW5jZSAqIDM7XHJcbiAgICAgICAgICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkNhc3RsZSAmJiBwb3NpdGlvbi55ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHJvb2Ygb2YgY2FzdGxlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUob2JqICsgMSwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSAtIDEsIHRoaXMuYnVpbGRpbmdMYXllcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aWxlbWFwLnB1dFRpbGUob2JqLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55LCB0aGlzLmJ1aWxkaW5nTGF5ZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGdldEltYWdlSW5kZXhGb3JCYWNrZ3JvdW5kQXQocG9zaXRpb246IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLm1hcC5nZXRUaWxlQXQocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIC8vIFdhdGVyXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjE7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICAvLyBCcmlkZ2VcclxuICAgICAgICAgICAgICAgIGxldCBhZGogPSB0aGlzLm1hcC5nZXRBZGphY2VudFRpbGVzQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFkalswXSAhPSBUaWxlLldhdGVyIHx8IGFkalsyXSAhPSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDIwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDE5O1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuUGF0aDpcclxuICAgICAgICAgICAgICAgIC8vIFBhdGhcclxuICAgICAgICAgICAgICAgIHJldHVybiAxODtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkdyYXNzOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkZvcmVzdDpcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbWFnZUluZGV4Rm9yR3Jhc3NBdChwb3NpdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfVxyXG4gICAgZ2V0SW1hZ2VJbmRleEZvckdyYXNzQXQocG9zaXRpb246IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGFkaiA9IHRoaXMubWFwLmdldEFkamFjZW50VGlsZXNBdChwb3NpdGlvbik7XHJcbiAgICAgICAgbGV0IGN1dCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZGoubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY3V0ICs9IE1hdGgucG93KDIsIGkpICogKFRpbGVNYW5hZ2VyLmRvZXNUaWxlQ3V0R3Jhc3MoYWRqW2ldKSA/IDEgOiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGN1dCA9PSA4ICsgNCArIDIgKyAxKSB7IHJldHVybiAzOyB9IC8vIGFsbCAtIG5vdCBzdXBwbGllZFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDQgKyAxKSB7IHJldHVybiAxNjsgfSAvLyB0b3AgYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDggKyA0ICsgMikgeyByZXR1cm4gMTA7IH0gLy8gcmlnaHQgYm90dG9tIGxlZnRcclxuICAgICAgICBpZiAoY3V0ID09IDQgKyAyICsgMSkgeyByZXR1cm4gMTc7IH0gLy8gdG9wIHJpZ2h0IGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gOCArIDIgKyAxKSB7IHJldHVybiAxNDsgfSAvLyB0b3AgcmlnaHQgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSArIDgpIHsgcmV0dXJuIDEyOyB9IC8vIHRvcCBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0ICsgOCkgeyByZXR1cm4gODsgfSAvLyBib3R0b20gbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gMiArIDQpIHsgcmV0dXJuIDk7IH0gLy8gcmlnaHQgYm90dG9tXHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgMikgeyByZXR1cm4gMTM7IH0gLy8gdG9wIHJpZ2h0XHJcbiAgICAgICAgaWYgKGN1dCA9PSAxICsgNCkgeyByZXR1cm4gMTU7IH0gLy8gdG9wIGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMiArIDgpIHsgcmV0dXJuIDY7IH0gLy8gcmlnaHQgbGVmdFxyXG4gICAgICAgIGlmIChjdXQgPT0gOCkgeyByZXR1cm4gNDsgfSAvLyBsZWZ0XHJcbiAgICAgICAgaWYgKGN1dCA9PSA0KSB7IHJldHVybiA3OyB9IC8vIGJvdHRvbVxyXG4gICAgICAgIGlmIChjdXQgPT0gMikgeyByZXR1cm4gNTsgfSAvLyByaWdodFxyXG4gICAgICAgIGlmIChjdXQgPT0gMSkgeyByZXR1cm4gMTE7IH0gLy8gdG9wXHJcbiAgICAgICAgcmV0dXJuIDM7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEVudGl0eU1hbmFnZXJEZWxlZ2F0ZSB7XHJcbiAgICBlbnRpdHlEaWRNb3ZlKGVudGl0eTogRW50aXR5KTogdm9pZDtcclxuICAgIGVudGl0eURpZEFuaW1hdGlvbihlbnRpdHk6IEVudGl0eSk6IHZvaWQ7XHJcbn1cclxuXHJcbmNsYXNzIEVudGl0eU1hbmFnZXIge1xyXG5cclxuICAgIGRlbGVnYXRlOiBFbnRpdHlNYW5hZ2VyRGVsZWdhdGU7XHJcblxyXG4gICAgcHJpdmF0ZSBtYXA6IE1hcDtcclxuXHJcbiAgICBwcml2YXRlIGFuaW1faWRsZV9zdGF0ZTogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgZW50aXR5X2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIHNlbGVjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBpbnRlcmFjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBhbmltX2dyb3VwOiBQaGFzZXIuR3JvdXA7XHJcblxyXG4gICAgcHJpdmF0ZSBzZWxlY3Rpb25fZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgaW50ZXJhY3Rpb25fZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgc2hvd19yYW5nZTogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgZW50aXR5X2dyb3VwOiBQaGFzZXIuR3JvdXAsIHNlbGVjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwLCBpbnRlcmFjdGlvbl9ncm91cDogUGhhc2VyLkdyb3VwLCBhbmltX2dyb3VwOiBQaGFzZXIuR3JvdXAsIGRlbGVnYXRlOiBFbnRpdHlNYW5hZ2VyRGVsZWdhdGUpIHtcclxuXHJcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAgPSBlbnRpdHlfZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25fZ3JvdXAgPSBzZWxlY3Rpb25fZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbl9ncm91cCA9IGludGVyYWN0aW9uX2dyb3VwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9ncm91cCA9IGFuaW1fZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGlvbl9ncmFwaGljcyA9IHNlbGVjdGlvbl9ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCBzZWxlY3Rpb25fZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JhcGhpY3MgPSBpbnRlcmFjdGlvbl9ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCBpbnRlcmFjdGlvbl9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9pZGxlX3N0YXRlID0gMDtcclxuICAgICAgICB0aGlzLm1hcC5lbnRpdHlfcmFuZ2UuaW5pdCh0aGlzLmludGVyYWN0aW9uX2dyb3VwKTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMubWFwLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyBtb3ZlIHNlbGVjdGVkIGVudGl0eSBpbiBhIGhpZ2hlciBncm91cFxyXG4gICAgICAgIHRoaXMuZW50aXR5X2dyb3VwLnJlbW92ZShlbnRpdHkuc3ByaXRlKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5yZW1vdmUoZW50aXR5Lmljb25faGVhbHRoKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLmFkZChlbnRpdHkuc3ByaXRlKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uX2dyb3VwLmFkZChlbnRpdHkuaWNvbl9oZWFsdGgpO1xyXG4gICAgfVxyXG4gICAgZGVzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICAvLyBtb3ZlIHNlbGVjdGVkIGVudGl0eSBiYWNrIHRvIGFsbCBvdGhlciBlbnRpdGllc1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAucmVtb3ZlKGVudGl0eS5zcHJpdGUpO1xyXG4gICAgICAgIHRoaXMuaW50ZXJhY3Rpb25fZ3JvdXAucmVtb3ZlKGVudGl0eS5pY29uX2hlYWx0aCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfZ3JvdXAuYWRkQXQoZW50aXR5Lmljb25faGVhbHRoLCAwKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9ncm91cC5hZGRBdChlbnRpdHkuc3ByaXRlLCAwKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93UmFuZ2UoKSB7XHJcbiAgICAgICAgdGhpcy5zaG93X3JhbmdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm1hcC5lbnRpdHlfcmFuZ2UuZHJhdyh0aGlzLnNlbGVjdGlvbl9ncmFwaGljcyk7XHJcbiAgICB9XHJcbiAgICBoaWRlUmFuZ2UoKSB7XHJcbiAgICAgICAgdGhpcy5zaG93X3JhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5tYXAuZW50aXR5X3JhbmdlLmNsZWFyKHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzLCB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzKTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciwgY3Vyc29yX3Bvc2l0aW9uOiBQb3MsIGFuaW1fc3RhdGU6IG51bWJlcikge1xyXG5cclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgdGhpcy5tYXAuZW50aXRpZXMpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYW5pbV9pZGxlX3N0YXRlICE9IGFuaW1fc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIGVudGl0eS5zZXRGcmFtZSh0aGlzLmFuaW1faWRsZV9zdGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW50aXR5LnVwZGF0ZShzdGVwcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbV9pZGxlX3N0YXRlID0gYW5pbV9zdGF0ZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd19yYW5nZSkge1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5lbnRpdHlfcmFuZ2UudXBkYXRlKHN0ZXBzLCBjdXJzb3JfcG9zaXRpb24sIGFuaW1fc3RhdGUsIHRoaXMuc2VsZWN0aW9uX2dyYXBoaWNzLCB0aGlzLmludGVyYWN0aW9uX2dyYXBoaWNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8qXHJcblxyXG4gICAgICAgIC0tLS0tIFJBTkdFXHJcblxyXG4gICAgICovXHJcblxyXG4gICAgYW5pbWF0aW9uRGlkRW5kKGFuaW1hdGlvbjogRW50aXR5QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgYW5pbWF0aW9uLmVudGl0eS5hbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHN3aXRjaCAoYW5pbWF0aW9uLnR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlBbmltYXRpb25UeXBlLkF0dGFjazpcclxuICAgICAgICAgICAgICAgIGxldCBhdHRhY2sgPSA8QXR0YWNrQW5pbWF0aW9uPiBhbmltYXRpb247XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFjay5maXJzdCAmJiBhdHRhY2suZW50aXR5LnNob3VsZENvdW50ZXIoYXR0YWNrLmF0dGFja2VyLnBvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0YWNrRW50aXR5KGF0dGFjay5lbnRpdHksIGF0dGFjay5hdHRhY2tlciwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgYXR0YWNrZXIgPSBhdHRhY2suZmlyc3QgPyBhdHRhY2suYXR0YWNrZXIgOiBhdHRhY2suZW50aXR5O1xyXG4gICAgICAgICAgICAgICAgbGV0IHRhcmdldCA9IGF0dGFjay5maXJzdCA/IGF0dGFjay5lbnRpdHkgOiBhdHRhY2suYXR0YWNrZXI7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2tlci5oYXNGbGFnKEVudGl0eUZsYWdzLkNhblBvaXNvbikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc2V0U3RhdHVzKEVudGl0eVN0YXR1cy5Qb2lzb25lZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnN0YXR1c19hbmltYXRpb24gPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VyLnNob3VsZFJhbmtVcCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYXR0YWNrZXIuc3RhdHVzX2FuaW1hdGlvbiA9IDI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0LnNob3VsZFJhbmtVcCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnN0YXR1c19hbmltYXRpb24gPSAyO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2tlci5pc0RlYWQoKSB8fCBhdHRhY2tlci5zdGF0dXNfYW5pbWF0aW9uID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBhdHRhY2tlci5zdGFydEFuaW1hdGlvbihuZXcgU3RhdHVzQW5pbWF0aW9uKGF0dGFja2VyLCB0aGlzLCB0aGlzLmFuaW1fZ3JvdXAsIGF0dGFja2VyLmlzRGVhZCgpID8gLTEgOiBhdHRhY2tlci5zdGF0dXNfYW5pbWF0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0LmlzRGVhZCgpIHx8IHRhcmdldC5zdGF0dXNfYW5pbWF0aW9uID49IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQuc3RhcnRBbmltYXRpb24obmV3IFN0YXR1c0FuaW1hdGlvbih0YXJnZXQsIHRoaXMsIHRoaXMuYW5pbV9ncm91cCwgdGFyZ2V0LmlzRGVhZCgpID8gLTEgOiB0YXJnZXQuc3RhdHVzX2FuaW1hdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0ZS5lbnRpdHlEaWRBbmltYXRpb24oYXR0YWNrLmVudGl0eSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBFbnRpdHlBbmltYXRpb25UeXBlLlN0YXR1czpcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5lbnRpdHkuc3RhdHVzX2FuaW1hdGlvbiA9IC0xO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRW50aXR5QW5pbWF0aW9uVHlwZS5SYWlzZTpcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVsZWdhdGUuZW50aXR5RGlkQW5pbWF0aW9uKGFuaW1hdGlvbi5lbnRpdHkpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dXaXNwZWQoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZW50aXR5IG9mIHRoaXMubWFwLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkuc3RhdHVzICE9IEVudGl0eVN0YXR1cy5XaXNwZWQpIHsgY29udGludWU7IH1cclxuICAgICAgICAgICAgaWYgKCEhZW50aXR5LmFuaW1hdGlvbikgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBlbnRpdHkuc3RhcnRBbmltYXRpb24obmV3IFN0YXR1c0FuaW1hdGlvbihlbnRpdHksIHRoaXMsIHRoaXMuYW5pbV9ncm91cCwgMSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhdHRhY2tFbnRpdHkoYXR0YWNrZXI6IEVudGl0eSwgdGFyZ2V0OiBFbnRpdHksIGZpcnN0OiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGF0dGFja2VyLmF0dGFjayh0YXJnZXQsIHRoaXMubWFwKTtcclxuICAgICAgICB0YXJnZXQuc3RhcnRBbmltYXRpb24obmV3IEF0dGFja0FuaW1hdGlvbih0YXJnZXQsIHRoaXMsIHRoaXMuYW5pbV9ncm91cCwgYXR0YWNrZXIsIGZpcnN0KSk7XHJcbiAgICB9XHJcbiAgICByYWlzZUVudGl0eSh3aXphcmQ6IEVudGl0eSwgdG9tYjogRW50aXR5KSB7XHJcbiAgICAgICAgdG9tYi5zdGFydEFuaW1hdGlvbihuZXcgUmFpc2VBbmltYXRpb24odG9tYiwgdGhpcywgdGhpcy5hbmltX2dyb3VwLCB3aXphcmQuYWxsaWFuY2UpKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICBlbnRpdHkuaW5pdCh0aGlzLmVudGl0eV9ncm91cCk7XHJcbiAgICB9XHJcbn1cclxuIiwiY2xhc3MgU21va2UgZXh0ZW5kcyBTcHJpdGUge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBQb3MsIGdyb3VwOiBQaGFzZXIuR3JvdXAsIG5hbWU6IHN0cmluZywgZnJhbWVzOiBudW1iZXJbXSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgICAgIHN1cGVyLmluaXQobmV3IFBvcyhwb3NpdGlvbi54ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFICsgMTYsIHBvc2l0aW9uLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpLCBncm91cCwgbmFtZSwgZnJhbWVzKTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwic21va2UudHNcIiAvPlxyXG5cclxuY2xhc3MgU21va2VNYW5hZ2VyIHtcclxuICAgIHNtb2tlOiBTbW9rZVtdO1xyXG4gICAgbWFwOiBNYXA7XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGFuaW1fc2xvdzogbnVtYmVyO1xyXG4gICAgYW5pbV9zdGF0ZTogbnVtYmVyO1xyXG4gICAgYW5pbV9vZmZzZXQ6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihtYXA6IE1hcCwgZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBncm91cDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgPSAwO1xyXG4gICAgICAgIHRoaXMuYW5pbV9zdGF0ZSA9IDA7XHJcbiAgICAgICAgdGhpcy5hbmltX29mZnNldCA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuc21va2UgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBob3VzZSBvZiBtYXAuZ2V0T2NjdXBpZWRIb3VzZXMoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVNtb2tlKGhvdXNlLnBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jcmVhdGVTbW9rZShuZXcgUG9zKDMsIDEzKSk7XHJcbiAgICB9XHJcbiAgICBjcmVhdGVTbW9rZShwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgdGhpcy5zbW9rZS5wdXNoKG5ldyBTbW9rZShwb3NpdGlvbiwgdGhpcy5ncm91cCwgXCJiX3Ntb2tlXCIsIFswLCAxLCAyLCAzXSkpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX3Nsb3cgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbV9zbG93IDwgNSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYW5pbV9zbG93ID0gMDtcclxuXHJcbiAgICAgICAgdGhpcy5hbmltX29mZnNldCsrO1xyXG4gICAgICAgIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMjcpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMDtcclxuICAgICAgICAgICAgdGhpcy5hbmltX29mZnNldCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMjIgJiYgdGhpcy5hbmltX3N0YXRlID09IDMpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gNDtcclxuICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFuaW1fb2Zmc2V0ID4gMTcgJiYgdGhpcy5hbmltX3N0YXRlID09IDIpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMztcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYW5pbV9vZmZzZXQgPiAxMiAmJiB0aGlzLmFuaW1fc3RhdGUgPT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fc3RhdGUgPSAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hbmltX29mZnNldCA+IDcgJiYgdGhpcy5hbmltX3N0YXRlID09IDApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX3N0YXRlID0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZvciAobGV0IHNtb2tlIG9mIHRoaXMuc21va2UpIHtcclxuICAgICAgICAgICAgc21va2Uuc2V0RnJhbWUodGhpcy5hbmltX3N0YXRlKTtcclxuICAgICAgICAgICAgc21va2Uud29ybGRfcG9zaXRpb24ueSA9IHNtb2tlLnBvc2l0aW9uLnkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSB0aGlzLmFuaW1fb2Zmc2V0IC0gMjtcclxuICAgICAgICAgICAgc21va2UudXBkYXRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZnJhbWUudHNcIiAvPlxyXG5cclxuY2xhc3MgRnJhbWVNYW5hZ2VyIGltcGxlbWVudHMgRnJhbWVEZWxlZ2F0ZSB7XHJcbiAgICBmcmFtZXM6IEZyYW1lW107XHJcbiAgICBncm91cDogUGhhc2VyLkdyb3VwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyb3VwOiBQaGFzZXIuR3JvdXApIHtcclxuICAgICAgICB0aGlzLmdyb3VwID0gZ3JvdXA7XHJcbiAgICAgICAgdGhpcy5mcmFtZXMgPSBbXTtcclxuICAgIH1cclxuICAgIGFkZEZyYW1lKGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIGZyYW1lLmRlbGVnYXRlID0gdGhpcztcclxuICAgICAgICB0aGlzLmZyYW1lcy5wdXNoKGZyYW1lKTtcclxuICAgIH1cclxuICAgIHJlbW92ZUZyYW1lKGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5mcmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGZyYW1lID09IHRoaXMuZnJhbWVzW2ldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZyYW1lcy5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgZm9yIChsZXQgZnJhbWUgb2YgdGhpcy5mcmFtZXMpIHtcclxuICAgICAgICAgICAgZnJhbWUudXBkYXRlKHN0ZXBzKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBmcmFtZVdpbGxEZXN0cm95KGZyYW1lOiBGcmFtZSkge1xyXG4gICAgICAgIHRoaXMucmVtb3ZlRnJhbWUoZnJhbWUpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJmcmFtZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhZWZvbnQudHNcIiAvPlxyXG5cclxuaW50ZXJmYWNlIE1lbnVEZWxlZ2F0ZSB7XHJcbiAgICBvcGVuTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpOiB2b2lkO1xyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCk6IHZvaWQ7XHJcbn1cclxuY2xhc3MgTWVudUdvbGRJbmZvIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIGdvbGRfYW1vdW50OiBBRUZvbnQ7XHJcbiAgICBoZWFkX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBoZWFkX2ljb246IFBoYXNlci5JbWFnZTtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDY0LCA0MCwgZ3JvdXAsIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCwgRGlyZWN0aW9uLlJpZ2h0KTtcclxuICAgICAgICAvLyBkcmF3IGNvbnRlbnRcclxuICAgICAgICB0aGlzLmRyYXdDb250ZW50KCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KGFsbGlhbmNlOiBBbGxpYW5jZSwgZ29sZDogbnVtYmVyKSB7XHJcbiAgICAgICAgLy8gdXBkYXRlIGluZm9ybWF0aW9uIGluc2lkZSBtZW51XHJcblxyXG4gICAgICAgIGxldCBjb2xvcjogbnVtYmVyO1xyXG4gICAgICAgIGxldCBmcmFtZTogbnVtYmVyO1xyXG4gICAgICAgIGxldCB4OiBudW1iZXI7XHJcbiAgICAgICAgaWYgKGFsbGlhbmNlID09IEFsbGlhbmNlLkJsdWUpIHtcclxuICAgICAgICAgICAgY29sb3IgPSAweDAwMDBmZjtcclxuICAgICAgICAgICAgZnJhbWUgPSAwO1xyXG4gICAgICAgICAgICB4ID0gMDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb2xvciA9IDB4ZmYwMDAwO1xyXG4gICAgICAgICAgICBmcmFtZSA9IDE7XHJcbiAgICAgICAgICAgIHggPSAyNTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5iZWdpbkZpbGwoY29sb3IpO1xyXG4gICAgICAgIHRoaXMuaGVhZF9ncmFwaGljcy5kcmF3UmVjdCgwLCAxNywgdGhpcy53aWR0aCAtIDYsIDE3KTtcclxuICAgICAgICB0aGlzLmhlYWRfZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG5cclxuICAgICAgICB0aGlzLmhlYWRfaWNvbi5mcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uLnggPSB4O1xyXG5cclxuICAgICAgICB0aGlzLmdvbGRfYW1vdW50LnNldFRleHQoZ29sZC50b1N0cmluZygpKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgLy8gaW5pdGlhbGl6ZSBjb250ZW50IChzcHJpdGVzLCB0ZXh0IGV0YylcclxuXHJcbiAgICAgICAgdGhpcy5oZWFkX2dyYXBoaWNzID0gdGhpcy5ncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDIsIDIsIFwiZ29sZFwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuaGVhZF9pY29uID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgwLCAxNiwgXCJwb3J0cmFpdFwiLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIGxldCBoZWFkX2Nyb3AgPSBuZXcgUGhhc2VyLlJlY3RhbmdsZSgwLCAxMCwgdGhpcy5oZWFkX2ljb24ud2lkdGgsIDE4KTtcclxuICAgICAgICB0aGlzLmhlYWRfaWNvbi5jcm9wKGhlYWRfY3JvcCk7XHJcblxyXG4gICAgICAgIHRoaXMuZ29sZF9hbW91bnQgPSBuZXcgQUVGb250KDI4LCA1LCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQpO1xyXG5cclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWVudURlZkluZm8gZXh0ZW5kcyBGcmFtZSB7XHJcbiAgICBwcml2YXRlIHRpbGVfaWNvbjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBkZWZfYW1vdW50OiBBRUZvbnQ7XHJcbiAgICBwcml2YXRlIGVudGl0eV9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHN0YXR1c19pY29uczogUGhhc2VyLkltYWdlW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoZ3JvdXA6IFBoYXNlci5Hcm91cCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSg0MCwgNTIsIGdyb3VwLCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5SaWdodCwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgLy8gZHJhdyBjb250ZW50XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudChwb3NpdGlvbjogUG9zLCBtYXA6IE1hcCkge1xyXG4gICAgICAgIC8vIHVwZGF0ZSBpbmZvcm1hdGlvbiBpbnNpZGUgbWVudVxyXG5cclxuICAgICAgICBsZXQgdGlsZSA9IG1hcC5nZXRUaWxlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGxldCBlbnRpdHkgPSBtYXAuZ2V0RW50aXR5QXQocG9zaXRpb24pO1xyXG5cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHtcclxuICAgICAgICAgICAgbGV0IGFsbGlhbmNlID0gbWFwLmdldEFsbGlhbmNlQXQocG9zaXRpb24pO1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aWxlX2ljb24ua2V5ICE9IFwiYnVpbGRpbmdzX1wiICsgKDxudW1iZXI+IGFsbGlhbmNlKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlX2ljb24ubG9hZFRleHR1cmUoXCJidWlsZGluZ3NfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnRpbGVfaWNvbi5mcmFtZSA9IHRpbGUgPT0gVGlsZS5Ib3VzZSA/IDAgOiAxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbGVfaWNvbi5rZXkgIT0gXCJ0aWxlczBcIikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50aWxlX2ljb24ubG9hZFRleHR1cmUoXCJ0aWxlczBcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy50aWxlX2ljb24uZnJhbWUgPSBUaWxlTWFuYWdlci5nZXRCYXNlSW1hZ2VJbmRleEZvclRpbGUodGlsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRlZl9hbW91bnQuc2V0VGV4dChNYXAuZ2V0RGVmRm9yVGlsZSh0aWxlLCBlbnRpdHkgPyBlbnRpdHkudHlwZSA6IHVuZGVmaW5lZCkudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIGlmICghIWVudGl0eSAmJiAhZW50aXR5LmlzRGVhZCgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2l6ZSg2OCwgNTIpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5lbnRpdHlfaWNvbi5rZXkgIT0gXCJ1bml0X2ljb25zX1wiICsgZW50aXR5LmFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLmxvYWRUZXh0dXJlKFwidW5pdF9pY29uc19cIiArIGVudGl0eS5hbGxpYW5jZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi5mcmFtZSA9IGVudGl0eS50eXBlO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlU2l6ZSg0MCwgNTIpO1xyXG4gICAgICAgICAgICB0aGlzLmVudGl0eV9pY29uLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0dXNJY29ucyhlbnRpdHkpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuICAgICAgICAvLyBpbml0aWFsaXplIGNvbnRlbnQgKHNwcml0ZXMsIHRleHQgZXRjKVxyXG5cclxuICAgICAgICBsZXQgdGlsZV9ncmFwaGljcyA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aWxlX2dyYXBoaWNzLmxpbmVTdHlsZSgxLCAweDAwMDAwMCk7XHJcbiAgICAgICAgdGlsZV9ncmFwaGljcy5kcmF3UmVjdCg2LCAyLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAxLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgLSAxKTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlX2ljb24gPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDcsIDMsIFwidGlsZXMwXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgbGV0IHRpbGVfY3JvcCA9IG5ldyBQaGFzZXIuUmVjdGFuZ2xlKDEsIDEsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDIsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSAtIDIpO1xyXG4gICAgICAgIHRoaXMudGlsZV9pY29uLmNyb3AodGlsZV9jcm9wKTtcclxuXHJcbiAgICAgICAgbGV0IGRlZl9mb250ID0gbmV3IEFFRm9udCg3LCAyOCwgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuICAgICAgICBkZWZfZm9udC5zZXRUZXh0KFwiREVGXCIpO1xyXG5cclxuICAgICAgICB0aGlzLmRlZl9hbW91bnQgPSBuZXcgQUVGb250KDE0LCAzNywgdGhpcy5jb250ZW50X2dyb3VwLCBBRUZvbnRTdHlsZS5Cb2xkKTtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaWNvbiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMzUsIDIsIFwidW5pdF9pY29uc18xXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaWNvbi52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zID0gW1xyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDMxLCAyMiwgXCJzdGF0dXNcIiwgMiwgdGhpcy5jb250ZW50X2dyb3VwKSxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgzOSwgMjIsIFwic3RhdHVzXCIsIDIsIHRoaXMuY29udGVudF9ncm91cCksXHJcbiAgICAgICAgICAgIHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNDcsIDIyLCBcInN0YXR1c1wiLCAyLCB0aGlzLmNvbnRlbnRfZ3JvdXApLFxyXG4gICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDMxLCAzMiwgXCJzdGF0dXNcIiwgMCwgdGhpcy5jb250ZW50X2dyb3VwKSxcclxuICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg0NiwgMzIsIFwic3RhdHVzXCIsIDEsIHRoaXMuY29udGVudF9ncm91cClcclxuICAgICAgICBdO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdHVzSWNvbnMobnVsbCk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHNldFN0YXR1c0ljb25zKGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXNfaWNvbnNbMF0udmlzaWJsZSA9IChlbnRpdHkgJiYgZW50aXR5LnJhbmsgPiAwKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICB0aGlzLnN0YXR1c19pY29uc1sxXS52aXNpYmxlID0gKGVudGl0eSAmJiBlbnRpdHkucmFuayA+IDEpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzJdLnZpc2libGUgPSAoZW50aXR5ICYmIGVudGl0eS5yYW5rID4gMikgPyB0cnVlIDogZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzNdLnZpc2libGUgPSAoZW50aXR5ICYmIGVudGl0eS5zdGF0dXMgIT0gRW50aXR5U3RhdHVzLk5vbmUpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc3RhdHVzX2ljb25zWzNdLmZyYW1lID0gKGVudGl0eSAmJiAoZW50aXR5LnN0YXR1cyAmIEVudGl0eVN0YXR1cy5Qb2lzb25lZCkgIT0gMCkgPyAwIDogMTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGF0dXNfaWNvbnNbNF0udmlzaWJsZSA9IChlbnRpdHkgJiYgZW50aXR5LnN0YXR1cyA9PSAoRW50aXR5U3RhdHVzLldpc3BlZCB8IEVudGl0eVN0YXR1cy5Qb2lzb25lZCkpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcbmVudW0gQWN0aW9uIHtcclxuICAgIE5vbmUsXHJcbiAgICBNQUlOX01FTlUsXHJcbiAgICBNT1ZFLFxyXG4gICAgQVRUQUNLLFxyXG4gICAgQlVZLFxyXG4gICAgRU5EX01PVkUsXHJcbiAgICBDQU5DRUwsXHJcbiAgICBFTkRfVFVSTixcclxuICAgIE9DQ1VQWSxcclxuICAgIFJBSVNFLFxyXG4gICAgTUFQLFxyXG4gICAgT0JKRUNUSVZFLFxyXG4gICAgTkVXX0dBTUUsXHJcbiAgICBTRUxFQ1RfTEVWRUwsXHJcbiAgICBTQVZFX0dBTUUsXHJcbiAgICBMT0FEX0dBTUUsXHJcbiAgICBTS0lSTUlTSCxcclxuICAgIFNFVFRJTkdTLFxyXG4gICAgSU5TVFJVQ1RJT05TLFxyXG4gICAgQUJPVVQsXHJcbiAgICBFWElUXHJcbn1cclxuY2xhc3MgTWVudU9wdGlvbnMgZXh0ZW5kcyBGcmFtZSB7XHJcblxyXG4gICAgc2VsZWN0ZWQ6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIG9wdGlvbnM6IEFjdGlvbltdO1xyXG4gICAgcHJpdmF0ZSBmb250czogUGhhc2VyLkJpdG1hcFRleHRbXTtcclxuICAgIHByaXZhdGUgcG9pbnRlcjogUGhhc2VyLkltYWdlO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc2xvdzogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgbWVudV9kZWxlZ2F0ZTogTWVudURlbGVnYXRlO1xyXG5cclxuICAgIHN0YXRpYyBnZXRNYWluTWVudU9wdGlvbnMoaW5nYW1lOiBib29sZWFuKTogQWN0aW9uW10ge1xyXG4gICAgICAgIGxldCBvcHRpb25zOiBBY3Rpb25bXTtcclxuICAgICAgICBpZiAoaW5nYW1lKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSBbQWN0aW9uLlNBVkVfR0FNRSwgQWN0aW9uLkxPQURfR0FNRSwgQWN0aW9uLklOU1RSVUNUSU9OUywgQWN0aW9uLkFCT1VULCBBY3Rpb24uRVhJVF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IFtBY3Rpb24uTkVXX0dBTUUsIEFjdGlvbi5MT0FEX0dBTUUsIEFjdGlvbi5TS0lSTUlTSCwgQWN0aW9uLklOU1RSVUNUSU9OUywgQWN0aW9uLkFCT1VULCBBY3Rpb24uRVhJVF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvcHRpb25zO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE9mZk1lbnVPcHRpb25zKCk6IEFjdGlvbltdIHtcclxuICAgICAgICByZXR1cm4gW0FjdGlvbi5FTkRfVFVSTiwgQWN0aW9uLk1BUCwgQWN0aW9uLk9CSkVDVElWRSwgQWN0aW9uLk1BSU5fTUVOVV07XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbjogQWN0aW9uKTogc3RyaW5nIHtcclxuICAgICAgICBpZiAob3B0aW9uID09IEFjdGlvbi5Ob25lKSB7IHJldHVybiBcIlwiOyB9XHJcbiAgICAgICAgaWYgKG9wdGlvbiA+PSAxMikge1xyXG4gICAgICAgICAgICByZXR1cm4gQW5jaWVudEVtcGlyZXMuTEFOR1soPG51bWJlcj4gb3B0aW9uIC0gMTIgKyAxKV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBBbmNpZW50RW1waXJlcy5MQU5HWzI2ICsgPG51bWJlcj4gb3B0aW9uXTtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yIChncm91cDogUGhhc2VyLkdyb3VwLCBhbGlnbjogRGlyZWN0aW9uLCBvcHRpb25zOiBBY3Rpb25bXSwgZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZSwgYW5pbV9kaXJlY3Rpb24/OiBEaXJlY3Rpb24pIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICBpZiAoIWFuaW1fZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGFuaW1fZGlyZWN0aW9uID0gYWxpZ247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1lbnVfZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gMDtcclxuXHJcbiAgICAgICAgbGV0IG1heF9sZW5ndGggPSAwO1xyXG4gICAgICAgIGZvciAobGV0IG9wdGlvbiBvZiB0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IHRleHQgPSBNZW51T3B0aW9ucy5nZXRPcHRpb25TdHJpbmcob3B0aW9uKTtcclxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gbWF4X2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbWF4X2xlbmd0aCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMubGVuZ3RoICogMTMgKyAxNjtcclxuICAgICAgICBsZXQgd2lkdGggPSBtYXhfbGVuZ3RoICogNyArIDMxICsgMTM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSh3aWR0aCwgaGVpZ2h0LCBncm91cCwgYWxpZ24sIERpcmVjdGlvbi5BbGwgJiB+YWxpZ24sIGFuaW1fZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgbGV0IHkgPSA1O1xyXG4gICAgICAgIHRoaXMuZm9udHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBvcHRpb24gb2YgdGhpcy5vcHRpb25zKSB7XHJcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gTWVudU9wdGlvbnMuZ2V0T3B0aW9uU3RyaW5nKG9wdGlvbik7XHJcbiAgICAgICAgICAgIGxldCBmb250ID0gdGhpcy5ncm91cC5nYW1lLmFkZC5iaXRtYXBUZXh0KDI1LCB5LCBcImZvbnQ3XCIsIHRleHQsIDcsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9udHMucHVzaChmb250KTtcclxuICAgICAgICAgICAgeSArPSAxMztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlciA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoNCwgNCwgXCJwb2ludGVyXCIsIG51bGwsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMjtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdyA9IDA7XHJcblxyXG4gICAgfVxyXG4gICAgaGlkZShhbmltYXRlOiBib29sZWFuID0gZmFsc2UsIGRlc3Ryb3lfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UsIHVwZGF0ZV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUuY2xvc2VNZW51KElucHV0Q29udGV4dC5PcHRpb25zKTsgfVxyXG4gICAgICAgIHN1cGVyLmhpZGUoYW5pbWF0ZSwgZGVzdHJveV9vbl9maW5pc2gsIHVwZGF0ZV9vbl9maW5pc2gpO1xyXG4gICAgfVxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UsIG9mZnNldF95OiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShJbnB1dENvbnRleHQuT3B0aW9ucyk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUsIG9mZnNldF95KTtcclxuICAgIH1cclxuICAgIG5leHQoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCsrO1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkID49IHRoaXMub3B0aW9ucy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJldigpIHtcclxuICAgICAgICB0aGlzLnNlbGVjdGVkLS07XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSB0aGlzLm9wdGlvbnMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRTZWxlY3RlZCgpOiBBY3Rpb24ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnNbdGhpcy5zZWxlY3RlZF07XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zbG93Kys7XHJcbiAgICAgICAgaWYgKHRoaXMucG9pbnRlcl9zbG93ID4gMTApIHtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJfc3RhdGUgPSAyIC0gdGhpcy5wb2ludGVyX3N0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnkgPSA0ICsgdGhpcy5zZWxlY3RlZCAqIDEzO1xyXG4gICAgICAgIHRoaXMucG9pbnRlci54ID0gNCArIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWVudVNlbGVjdCBleHRlbmRzIEZyYW1lIHtcclxuXHJcbiAgICBzZWxlY3RlZDogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgb3B0aW9uczogc3RyaW5nW107XHJcbiAgICBwcml2YXRlIGZvbnRzOiBQaGFzZXIuQml0bWFwVGV4dFtdO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc3RhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcG9pbnRlcl9zbG93OiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGU7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKG9wdGlvbnM6IHN0cmluZ1tdLCBncm91cDogUGhhc2VyLkdyb3VwLCBkZWxlZ2F0ZTogTWVudURlbGVnYXRlLCBhbGlnbjogRGlyZWN0aW9uLCBhbmltX2RpcmVjdGlvbj86IERpcmVjdGlvbikge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMubWVudV9kZWxlZ2F0ZSA9IGRlbGVnYXRlO1xyXG5cclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSAwO1xyXG5cclxuICAgICAgICBsZXQgbWF4X2xlbmd0aCA9IDA7XHJcbiAgICAgICAgZm9yIChsZXQgdGV4dCBvZiB0aGlzLm9wdGlvbnMpIHtcclxuICAgICAgICAgICAgaWYgKHRleHQubGVuZ3RoID4gbWF4X2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgbWF4X2xlbmd0aCA9IHRleHQubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLm9wdGlvbnMubGVuZ3RoICogMTMgKyAxNjtcclxuICAgICAgICBsZXQgd2lkdGggPSBtYXhfbGVuZ3RoICogNyArIDMxICsgMTM7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSh3aWR0aCwgaGVpZ2h0LCBncm91cCwgYWxpZ24sIERpcmVjdGlvbi5BbGwgJiB+YWxpZ24sIGFuaW1fZGlyZWN0aW9uKTtcclxuXHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgZHJhd0NvbnRlbnQoKSB7XHJcbiAgICAgICAgbGV0IHkgPSA1O1xyXG4gICAgICAgIHRoaXMuZm9udHMgPSBbXTtcclxuICAgICAgICBmb3IgKGxldCB0ZXh0IG9mIHRoaXMub3B0aW9ucykge1xyXG4gICAgICAgICAgICBsZXQgZm9udCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgyNSwgeSwgXCJmb250N1wiLCB0ZXh0LCA3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgICAgICB0aGlzLmZvbnRzLnB1c2goZm9udCk7XHJcbiAgICAgICAgICAgIHkgKz0gMTM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXIgPSB0aGlzLmdyb3VwLmdhbWUuYWRkLmltYWdlKDQsIDQsIFwicG9pbnRlclwiLCBudWxsLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zdGF0ZSA9IDI7XHJcbiAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG5cclxuICAgIH1cclxuICAgIGhpZGUoYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBkZXN0cm95X29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlLCB1cGRhdGVfb25fZmluaXNoOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLmNsb3NlTWVudShJbnB1dENvbnRleHQuT3B0aW9ucyk7IH1cclxuICAgICAgICBzdXBlci5oaWRlKGFuaW1hdGUsIGRlc3Ryb3lfb25fZmluaXNoLCB1cGRhdGVfb25fZmluaXNoKTtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlLCBvZmZzZXRfeTogbnVtYmVyID0gMCkge1xyXG4gICAgICAgIGlmICghIXRoaXMubWVudV9kZWxlZ2F0ZSkgeyB0aGlzLm1lbnVfZGVsZWdhdGUub3Blbk1lbnUoSW5wdXRDb250ZXh0Lk9wdGlvbnMpOyB9XHJcbiAgICAgICAgc3VwZXIuc2hvdyhhbmltYXRlLCBvZmZzZXRfeSk7XHJcbiAgICB9XHJcbiAgICBuZXh0KCkge1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQrKztcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA+PSB0aGlzLm9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWQgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByZXYoKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZC0tO1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkIDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkID0gdGhpcy5vcHRpb25zLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0U2VsZWN0ZWQoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25zW3RoaXMuc2VsZWN0ZWRdO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlci51cGRhdGUoc3RlcHMpO1xyXG5cclxuICAgICAgICB0aGlzLnBvaW50ZXJfc2xvdysrO1xyXG4gICAgICAgIGlmICh0aGlzLnBvaW50ZXJfc2xvdyA+IDEwKSB7XHJcbiAgICAgICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3N0YXRlID0gMiAtIHRoaXMucG9pbnRlcl9zdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlci55ID0gNCArIHRoaXMuc2VsZWN0ZWQgKiAxMztcclxuICAgICAgICB0aGlzLnBvaW50ZXIueCA9IDQgKyB0aGlzLnBvaW50ZXJfc3RhdGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIE5vdGlmaWNhdGlvbiBleHRlbmRzIEZyYW1lIHtcclxuICAgIHByaXZhdGUgZm9udDogUGhhc2VyLkJpdG1hcFRleHQ7XHJcbiAgICBwcml2YXRlIG1lbnVfZGVsZWdhdGU6IE1lbnVEZWxlZ2F0ZTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoZ3JvdXA6IFBoYXNlci5Hcm91cCwgdGV4dDogc3RyaW5nLCBkZWxlZ2F0ZTogTWVudURlbGVnYXRlKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuXHJcbiAgICAgICAgdGhpcy5tZW51X2RlbGVnYXRlID0gZGVsZWdhdGU7XHJcblxyXG4gICAgICAgIHRoaXMuZm9udCA9IGdyb3VwLmdhbWUuYWRkLmJpdG1hcFRleHQoOSwgNSwgXCJmb250N1wiLCB0ZXh0LCA3KTtcclxuICAgICAgICB0aGlzLmZvbnQudXBkYXRlVHJhbnNmb3JtKCk7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5mb250LnRleHRXaWR0aCArIDMwO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZSh3aWR0aCwgMjksIGdyb3VwLCBEaXJlY3Rpb24uTm9uZSwgRGlyZWN0aW9uLkFsbCwgRGlyZWN0aW9uLk5vbmUpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncm91cC5hZGQodGhpcy5mb250KTtcclxuICAgIH1cclxuICAgIHNob3coYW5pbWF0ZTogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5vcGVuTWVudShJbnB1dENvbnRleHQuV2FpdCk7IH1cclxuICAgICAgICBzdXBlci5zaG93KGFuaW1hdGUpO1xyXG4gICAgfVxyXG4gICAgcHJvdGVjdGVkIGFuaW1hdGlvbkRpZEVuZChhbmltYXRpb246IEZyYW1lQW5pbWF0aW9uKSB7XHJcbiAgICAgICAgaWYgKChhbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5TaG93KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKHRydWUsIHRydWUpO1xyXG4gICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICB9ZWxzZSBpZiAoKGFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkRlc3Ryb3kpICE9IDApIHtcclxuICAgICAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5jbG9zZU1lbnUoSW5wdXRDb250ZXh0LldhaXQpOyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBNZW51U2hvcFVuaXRzIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIHNlbGVjdGVkOiBudW1iZXI7XHJcbiAgICBtZW51X2RlbGVnYXRlOiBNZW51RGVsZWdhdGU7XHJcblxyXG4gICAgcHJpdmF0ZSBlbnRpdHlfaW1hZ2VzOiBQaGFzZXIuSW1hZ2VbXTtcclxuICAgIHByaXZhdGUgbWFza3M6IFBoYXNlci5JbWFnZVtdO1xyXG4gICAgcHJpdmF0ZSBwb2ludGVyOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHBvaW50ZXJfc3RhdGU6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcG9pbnRlcl9zbG93OiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IgKGdyb3VwOiBQaGFzZXIuR3JvdXAsIGRlbGVnYXRlOiBNZW51RGVsZWdhdGUpIHtcclxuICAgICAgICBzdXBlcigpO1xyXG5cclxuICAgICAgICB0aGlzLnNlbGVjdGVkID0gMDtcclxuICAgICAgICB0aGlzLm1lbnVfZGVsZWdhdGUgPSBkZWxlZ2F0ZTtcclxuXHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplKDY0LCBncm91cC5nYW1lLmhlaWdodCAtIDQwLCBncm91cCwgRGlyZWN0aW9uLlJpZ2h0IHwgRGlyZWN0aW9uLkRvd24sIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICAgICAgLy8gZHJhdyBjb250ZW50XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudCgpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlQ29udGVudChhbGxpYW5jZTogQWxsaWFuY2UsIGdvbGQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpbWFnZSBvZiB0aGlzLmVudGl0eV9pbWFnZXMpIHtcclxuICAgICAgICAgICAgbGV0IGNvc3QgPSBBbmNpZW50RW1waXJlcy5FTlRJVElFU1tpXS5jb3N0O1xyXG4gICAgICAgICAgICBpbWFnZS5sb2FkVGV4dHVyZShcInVuaXRfaWNvbnNfXCIgKyAoPG51bWJlcj4gYWxsaWFuY2UpLCBpbWFnZS5mcmFtZSk7XHJcbiAgICAgICAgICAgIHRoaXMubWFza3NbaV0udmlzaWJsZSA9IGNvc3QgPiBnb2xkO1xyXG4gICAgICAgICAgICBpKys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0U2VsZWN0ZWQoKTogRW50aXR5VHlwZSB7XHJcbiAgICAgICAgcmV0dXJuIDxFbnRpdHlUeXBlPiB0aGlzLnNlbGVjdGVkO1xyXG4gICAgfVxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoISF0aGlzLm1lbnVfZGVsZWdhdGUpIHsgdGhpcy5tZW51X2RlbGVnYXRlLm9wZW5NZW51KElucHV0Q29udGV4dC5TaG9wKTsgfVxyXG4gICAgICAgIHN1cGVyLnNob3coYW5pbWF0ZSk7XHJcbiAgICB9XHJcbiAgICBoaWRlKGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSwgZGVzdHJveV9vbl9maW5pc2g6IGJvb2xlYW4gPSBmYWxzZSwgdXBkYXRlX29uX2ZpbmlzaDogYm9vbGVhbiA9IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKCEhdGhpcy5tZW51X2RlbGVnYXRlKSB7IHRoaXMubWVudV9kZWxlZ2F0ZS5jbG9zZU1lbnUoSW5wdXRDb250ZXh0LlNob3ApOyB9XHJcbiAgICAgICAgc3VwZXIuaGlkZShhbmltYXRlLCBkZXN0cm95X29uX2ZpbmlzaCwgdXBkYXRlX29uX2ZpbmlzaCk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zbG93Kys7XHJcbiAgICAgICAgaWYgKHRoaXMucG9pbnRlcl9zbG93ID4gMTApIHtcclxuICAgICAgICAgICAgdGhpcy5wb2ludGVyX3Nsb3cgPSAwO1xyXG4gICAgICAgICAgICB0aGlzLnBvaW50ZXJfc3RhdGUgPSAyIC0gdGhpcy5wb2ludGVyX3N0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5wb2ludGVyLnkgPSA1ICsgTWF0aC5mbG9vcih0aGlzLnNlbGVjdGVkIC8gMikgKiAyOTtcclxuICAgICAgICB0aGlzLnBvaW50ZXIueCA9IC05ICsgKHRoaXMuc2VsZWN0ZWQgJSAyKSAqIDI4ICsgdGhpcy5wb2ludGVyX3N0YXRlO1xyXG4gICAgfVxyXG4gICAgcHJldih2ZXJ0aWNhbDogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh2ZXJ0aWNhbCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkIC09IDI7XHJcbiAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkIC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZCA8IDApIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCArPSB0aGlzLmVudGl0eV9pbWFnZXMubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIG5leHQodmVydGljYWw6IGJvb2xlYW4pIHtcclxuICAgICAgICBpZiAodmVydGljYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCArPSAyO1xyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZCArKztcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQgPj0gdGhpcy5lbnRpdHlfaW1hZ2VzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkIC09IHRoaXMuZW50aXR5X2ltYWdlcy5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudCgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5lbnRpdHlfaW1hZ2VzID0gW107XHJcbiAgICAgICAgdGhpcy5tYXNrcyA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGF0YSA9IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTW2ldO1xyXG5cclxuICAgICAgICAgICAgaWYgKGRhdGEuY29zdCA+IDEwMDApIHsgY29udGludWU7IH1cclxuXHJcbiAgICAgICAgICAgIGxldCB4ID0gKGkgJSAyKSAqIDI3ICsgMztcclxuICAgICAgICAgICAgbGV0IHkgPSBNYXRoLmZsb29yKGkgLyAyKSAqIDI5ICsgNTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpbWFnZSA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJ1bml0X2ljb25zXzFcIiwgaSwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfaW1hZ2VzLnB1c2goaW1hZ2UpO1xyXG4gICAgICAgICAgICBsZXQgbWFzayA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoeCwgeSwgXCJtYXNrXCIsIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFza3MucHVzaChtYXNrKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5wb2ludGVyID0gdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSg0LCA0LCBcInBvaW50ZXJcIiwgbnVsbCwgdGhpcy5jb250ZW50X2dyb3VwKTtcclxuICAgICAgICB0aGlzLnBvaW50ZXJfc3RhdGUgPSAyO1xyXG4gICAgICAgIHRoaXMucG9pbnRlcl9zbG93ID0gMDtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTWVudVNob3BJbmZvIGV4dGVuZHMgRnJhbWUge1xyXG5cclxuICAgIHByaXZhdGUgdW5pdF9pY29uOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHVuaXRfbmFtZTogUGhhc2VyLkJpdG1hcFRleHQ7XHJcbiAgICBwcml2YXRlIHVuaXRfY29zdDogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X2F0azogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X2RlZjogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X21vdjogQUVGb250O1xyXG4gICAgcHJpdmF0ZSB1bml0X3RleHQ6IFBoYXNlci5CaXRtYXBUZXh0O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGdyb3VwOiBQaGFzZXIuR3JvdXAsIGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZShncm91cC5nYW1lLndpZHRoIC0gNjQsIGdyb3VwLmdhbWUuaGVpZ2h0LCBncm91cCwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uTGVmdCk7XHJcbiAgICAgICAgdGhpcy5kcmF3Q29udGVudChhbGxpYW5jZSk7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb250ZW50KHR5cGU6IEVudGl0eVR5cGUpIHtcclxuICAgICAgICBsZXQgZGF0YTogRW50aXR5RGF0YSA9IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTWyg8bnVtYmVyPiB0eXBlKV07XHJcbiAgICAgICAgdGhpcy51bml0X2ljb24uZnJhbWUgPSA8bnVtYmVyPiB0eXBlO1xyXG4gICAgICAgIHRoaXMudW5pdF9uYW1lLnNldFRleHQoZGF0YS5uYW1lLnRvVXBwZXJDYXNlKCkpO1xyXG4gICAgICAgIHRoaXMudW5pdF9jb3N0LnNldFRleHQoZGF0YS5jb3N0LnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMudW5pdF9hdGsuc2V0VGV4dChkYXRhLmF0ay50b1N0cmluZygpKTtcclxuICAgICAgICB0aGlzLnVuaXRfZGVmLnNldFRleHQoZGF0YS5kZWYudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgdGhpcy51bml0X21vdi5zZXRUZXh0KGRhdGEubW92LnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIHRoaXMudW5pdF90ZXh0LnNldFRleHQoQW5jaWVudEVtcGlyZXMuTEFOR1s3NSArICg8bnVtYmVyPiB0eXBlKV0pO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBkcmF3Q29udGVudChhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICB0aGlzLnVuaXRfaWNvbiA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuaW1hZ2UoMiwgMiwgXCJ1bml0X2ljb25zX1wiICsgKGFsbGlhbmNlID09IEFsbGlhbmNlLkJsdWUgPyAxIDogMiksIDAsIHRoaXMuY29udGVudF9ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMudW5pdF9uYW1lID0gdGhpcy5ncm91cC5nYW1lLmFkZC5iaXRtYXBUZXh0KDI5LCA0LCBcImZvbnQ3XCIsIFwiXCIsIDcsIHRoaXMuY29udGVudF9ncm91cCk7XHJcbiAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5pbWFnZSgyOCwgMTMsIFwiZ29sZFwiLCAwLCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMudW5pdF9jb3N0ID0gbmV3IEFFRm9udCg1NCwgMTYsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJcIik7XHJcblxyXG4gICAgICAgIG5ldyBBRUZvbnQoMiwgMzMsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJBVEtcIik7XHJcbiAgICAgICAgdGhpcy51bml0X2F0ayA9IG5ldyBBRUZvbnQoOTUsIDMzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiXCIpO1xyXG4gICAgICAgIG5ldyBBRUZvbnQoMiwgNDMsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJERUZcIik7XHJcbiAgICAgICAgdGhpcy51bml0X2RlZiA9IG5ldyBBRUZvbnQoOTUsIDQzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiXCIpO1xyXG4gICAgICAgIG5ldyBBRUZvbnQoMiwgNTMsIHRoaXMuY29udGVudF9ncm91cCwgQUVGb250U3R5bGUuQm9sZCwgXCJNT1ZcIik7XHJcbiAgICAgICAgdGhpcy51bml0X21vdiA9IG5ldyBBRUZvbnQoOTUsIDUzLCB0aGlzLmNvbnRlbnRfZ3JvdXAsIEFFRm9udFN0eWxlLkJvbGQsIFwiXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnVuaXRfdGV4dCA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCg2LCA2OSwgXCJmb250N1wiLCBcIlwiLCA3LCB0aGlzLmNvbnRlbnRfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMudW5pdF90ZXh0Lm1heFdpZHRoID0gdGhpcy5ncm91cC5nYW1lLndpZHRoIC0gNjQgLSAxODtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiaW5wdXQudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwicGxheWVyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImFpLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cIm1hcC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ0aWxlbWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJlbnRpdHltYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNtb2tlbWFuYWdlci50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJmcmFtZW1hbmFnZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWVudS50c1wiIC8+XHJcblxyXG5lbnVtIElucHV0Q29udGV4dCB7XHJcbiAgICBXYWl0LFxyXG4gICAgU2hvcCxcclxuICAgIE9wdGlvbnMsXHJcbiAgICBNYXAsXHJcbiAgICBTZWxlY3Rpb24sXHJcbiAgICBBbmltYXRpb24sXHJcbiAgICBBY2ssXHJcbiAgICBJbnN0cnVjdGlvbnNcclxufVxyXG5pbnRlcmZhY2UgR2FtZVNhdmUge1xyXG4gICAgY2FtcGFpZ246IGJvb2xlYW47XHJcbiAgICBtYXA6IG51bWJlcjtcclxuICAgIHBsYXllcnM6IGJvb2xlYW5bXTtcclxuXHJcbiAgICB0dXJuPzogQWxsaWFuY2U7XHJcbiAgICBnb2xkPzogbnVtYmVyW107XHJcbiAgICBidWlsZGluZ3M/OiBJQnVpbGRpbmdbXTtcclxuICAgIGVudGl0aWVzPzogSUVudGl0eVtdO1xyXG4gICAgY3Vyc29ycz86IElQb3NbXTtcclxufVxyXG5jbGFzcyBHYW1lQ29udHJvbGxlciBleHRlbmRzIFBoYXNlci5TdGF0ZSBpbXBsZW1lbnRzIEVudGl0eU1hbmFnZXJEZWxlZ2F0ZSwgSW50ZXJhY3Rpb25EZWxlZ2F0ZSwgTWVudURlbGVnYXRlIHtcclxuXHJcbiAgICBtYXA6IE1hcDtcclxuXHJcbiAgICB0aWxlX21hbmFnZXI6IFRpbGVNYW5hZ2VyO1xyXG4gICAgZW50aXR5X21hbmFnZXI6IEVudGl0eU1hbmFnZXI7XHJcbiAgICBzbW9rZV9tYW5hZ2VyOiBTbW9rZU1hbmFnZXI7XHJcbiAgICBmcmFtZV9tYW5hZ2VyOiBGcmFtZU1hbmFnZXI7XHJcblxyXG4gICAgZnJhbWVfZ29sZF9pbmZvOiBNZW51R29sZEluZm87XHJcbiAgICBmcmFtZV9kZWZfaW5mbzogTWVudURlZkluZm87XHJcblxyXG4gICAgdHVybjogQWxsaWFuY2U7XHJcbiAgICBnb2xkOiBudW1iZXJbXTtcclxuXHJcbiAgICBwbGF5ZXJzOiBJbnRlcmFjdGlvbltdO1xyXG5cclxuICAgIGN1cnNvcl90YXJnZXQ6IFBvcztcclxuICAgIGN1cnNvcjogU3ByaXRlO1xyXG4gICAgY3Vyc29yX3N0aWxsOiBib29sZWFuO1xyXG4gICAgY2FtZXJhX3N0aWxsOiBib29sZWFuO1xyXG5cclxuICAgIGdhbWVfb3ZlcjogYm9vbGVhbjtcclxuXHJcbiAgICBwcml2YXRlIGFjYzogbnVtYmVyID0gMDtcclxuICAgIHByaXZhdGUgbGFzdF9jdXJzb3JfcG9zaXRpb246IFBvcztcclxuXHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3N0YXRlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIGFuaW1fY3Vyc29yX3Nsb3c6IG51bWJlcjtcclxuXHJcbiAgICBwcml2YXRlIHNlbGVjdGVkX2VudGl0eTogRW50aXR5O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdChzYXZlOiBHYW1lU2F2ZSkge1xyXG4gICAgICAgIHRoaXMubWFwID0gbmV3IE1hcCgoc2F2ZS5jYW1wYWlnbiA/IFwibVwiIDogXCJzXCIpICsgc2F2ZS5tYXApO1xyXG4gICAgICAgIHRoaXMucGxheWVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZ2FtZV9vdmVyID0gZmFsc2U7XHJcblxyXG4gICAgICAgIGxldCBrZXlzOiBJbnB1dDtcclxuICAgICAgICBsZXQgYWxsaWFuY2UgPSBBbGxpYW5jZS5CbHVlO1xyXG4gICAgICAgIGZvciAobGV0IHAgb2Ygc2F2ZS5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgIGlmIChwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWtleXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBrZXlzID0gbmV3IElucHV0KHRoaXMuZ2FtZS5pbnB1dCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXllcnMucHVzaChuZXcgUGxheWVyKGFsbGlhbmNlLCB0aGlzLm1hcCwgdGhpcywga2V5cykpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzLnB1c2gobmV3IEFJKGFsbGlhbmNlLCB0aGlzLm1hcCwgdGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFsbGlhbmNlID0gPEFsbGlhbmNlPiAoPG51bWJlcj4gYWxsaWFuY2UgKyAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMudHVybiA9IHNhdmUudHVybjtcclxuICAgICAgICAgICAgdGhpcy5nb2xkID0gc2F2ZS5nb2xkO1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5pbXBvcnRCdWlsZGluZ3Moc2F2ZS5idWlsZGluZ3MpO1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5pbXBvcnRFbnRpdGllcyhzYXZlLmVudGl0aWVzKTtcclxuXHJcbiAgICAgICAgICAgIGxldCBpID0gMDtcclxuICAgICAgICAgICAgZm9yIChsZXQgdGFyZ2V0IG9mIHNhdmUuY3Vyc29ycykge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGF5ZXJzW2ldLmN1cnNvcl9wb3NpdGlvbiA9IG5ldyBQb3ModGFyZ2V0LngsIHRhcmdldC55KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1jYXRjaCAoZSkge1xyXG4gICAgICAgICAgICB0aGlzLnR1cm4gPSBBbGxpYW5jZS5CbHVlO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5nb2xkID0gW107XHJcbiAgICAgICAgICAgIGlmIChzYXZlLmNhbXBhaWduKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRbMF0gPSAzMDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRbMV0gPSAzMDA7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdvbGRbMF0gPSAxMDAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5nb2xkWzFdID0gMTAwMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUoKSB7XHJcblxyXG4gICAgICAgIGxldCB0aWxlbWFwID0gdGhpcy5nYW1lLmFkZC50aWxlbWFwKCk7XHJcbiAgICAgICAgbGV0IHRpbGVtYXBfZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IHNtb2tlX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBzZWxlY3Rpb25fZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGVudGl0eV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgaW50ZXJhY3Rpb25fZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgbGV0IGN1cnNvcl9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBsZXQgYW5pbWF0aW9uX2dyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGxldCBmcmFtZV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBmcmFtZV9ncm91cC5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIgPSBuZXcgVGlsZU1hbmFnZXIodGhpcy5tYXAsIHRpbGVtYXAsIHRpbGVtYXBfZ3JvdXApO1xyXG5cclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyID0gbmV3IEVudGl0eU1hbmFnZXIodGhpcy5tYXAsIGVudGl0eV9ncm91cCwgc2VsZWN0aW9uX2dyb3VwLCBpbnRlcmFjdGlvbl9ncm91cCwgYW5pbWF0aW9uX2dyb3VwLCB0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy5zbW9rZV9tYW5hZ2VyID0gbmV3IFNtb2tlTWFuYWdlcih0aGlzLm1hcCwgc21va2VfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlciA9IG5ldyBGcmFtZU1hbmFnZXIoZnJhbWVfZ3JvdXApO1xyXG5cclxuXHJcbiAgICAgICAgdGhpcy50aWxlX21hbmFnZXIuZHJhdygpO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvID0gbmV3IE1lbnVEZWZJbmZvKGZyYW1lX2dyb3VwKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5mcmFtZV9kZWZfaW5mbyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9kZWZfaW5mby5zaG93KHRydWUpO1xyXG5cclxuICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mbyA9IG5ldyBNZW51R29sZEluZm8oZnJhbWVfZ3JvdXApO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLmZyYW1lX2dvbGRfaW5mbyk7XHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8uc2hvdyh0cnVlKTtcclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3IgPSBuZXcgU3ByaXRlKCk7XHJcbiAgICAgICAgdGhpcy5jdXJzb3IuaW5pdCh7eDogMCwgeTogMH0sIGN1cnNvcl9ncm91cCwgXCJjdXJzb3JcIiwgWzAsIDFdKTtcclxuICAgICAgICB0aGlzLmN1cnNvci5zZXRPZmZzZXQoLTEsIC0xKTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmEueCA9IHRoaXMuZ2V0T2Zmc2V0WCh0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54KTtcclxuICAgICAgICB0aGlzLmNhbWVyYS55ID0gdGhpcy5nZXRPZmZzZXRZKHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnkpO1xyXG5cclxuICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlID0gMDtcclxuICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3Nsb3cgPSAwO1xyXG5cclxuICAgICAgICB0aGlzLnN0YXJ0VHVybih0aGlzLnR1cm4pO1xyXG5cclxuICAgICAgICB0aGlzLnNob3dNZXNzYWdlKFwiR0FNRSBMT0FERURcIik7XHJcblxyXG4gICAgfVxyXG4gICAgdXBkYXRlKCkge1xyXG4gICAgICAgIC8vIDEgc3RlcCBpcyAxLzYwIHNlY1xyXG5cclxuICAgICAgICB0aGlzLmFjYyArPSB0aGlzLnRpbWUuZWxhcHNlZDtcclxuICAgICAgICBsZXQgc3RlcHMgPSBNYXRoLmZsb29yKHRoaXMuYWNjIC8gMTYpO1xyXG4gICAgICAgIGlmIChzdGVwcyA8PSAwKSB7IHJldHVybjsgfVxyXG4gICAgICAgIHRoaXMuYWNjIC09IHN0ZXBzICogMTY7XHJcbiAgICAgICAgaWYgKHN0ZXBzID4gMikgeyBzdGVwcyA9IDI7IH1cclxuXHJcbiAgICAgICAgbGV0IGN1cnNvcl9wb3NpdGlvbiA9IHRoaXMuY3Vyc29yX3RhcmdldC5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgbGV0IGRpZmZfeCA9IGN1cnNvcl9wb3NpdGlvbi54IC0gdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueDtcclxuICAgICAgICBsZXQgZGlmZl95ID0gY3Vyc29yX3Bvc2l0aW9uLnkgLSB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi55O1xyXG5cclxuICAgICAgICBsZXQgZHggPSAwO1xyXG4gICAgICAgIGxldCBkeSA9IDA7XHJcblxyXG4gICAgICAgIHRoaXMuY3Vyc29yX3N0aWxsID0gZGlmZl94ID09IDAgJiYgZGlmZl95ID09IDA7XHJcbiAgICAgICAgaWYgKGRpZmZfeCAhPSAwKSB7XHJcbiAgICAgICAgICAgIGR4ID0gTWF0aC5mbG9vcihkaWZmX3ggLyA0KTtcclxuICAgICAgICAgICAgaWYgKGR4IDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgLTQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1pbihkeCwgLTEpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1pbihkeCwgNCk7XHJcbiAgICAgICAgICAgICAgICBkeCA9IE1hdGgubWF4KGR4LCAxKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmN1cnNvci5zZXRXb3JsZFBvc2l0aW9uKHt4OiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54ICsgZHgsIHk6IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnkgKyBkeX0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGlmZl95ICE9IDApIHtcclxuICAgICAgICAgICAgZHkgPSBNYXRoLmZsb29yKGRpZmZfeSAvIDQpO1xyXG4gICAgICAgICAgICBpZiAoZHkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWF4KGR5LCAtNCk7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWluKGR5LCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWluKGR5LCA0KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yLnNldFdvcmxkUG9zaXRpb24oe3g6IHRoaXMuY3Vyc29yLndvcmxkX3Bvc2l0aW9uLnggKyBkeCwgeTogdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueSArIGR5fSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIHRyYWNrIG1vdmluZyBlbnRpdHksIG90aGVyd2lzZSBjdXJzb3JcclxuICAgICAgICB0aGlzLnVwZGF0ZU9mZnNldEZvclBvc2l0aW9uKCEhdGhpcy5zZWxlY3RlZF9lbnRpdHkgJiYgISF0aGlzLnNlbGVjdGVkX2VudGl0eS5wYXRoID8gdGhpcy5zZWxlY3RlZF9lbnRpdHkud29ybGRfcG9zaXRpb24gOiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbik7XHJcblxyXG4gICAgICAgIC8vIGlucHV0XHJcblxyXG4gICAgICAgIHRoaXMuY2hlY2tXaW5Mb3NlKCk7XHJcblxyXG4gICAgICAgIGlmICghdGhpcy5nYW1lX292ZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5wbGF5ZXJzWyg8bnVtYmVyPiB0aGlzLnR1cm4gLSAxKV0ucnVuKCk7XHJcbiAgICAgICAgICAgIHRoaXMucGxheWVyc1soPG51bWJlcj4gdGhpcy50dXJuIC0gMSldLnNldEN1cnNvclBvc2l0aW9uKHRoaXMuY3Vyc29yX3RhcmdldCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXRoaXMuY3Vyc29yX3RhcmdldC5tYXRjaCh0aGlzLmxhc3RfY3Vyc29yX3Bvc2l0aW9uKSkge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RfY3Vyc29yX3Bvc2l0aW9uID0gdGhpcy5jdXJzb3JfdGFyZ2V0LmNvcHkoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIHVwZGF0ZSBkZWYgaW5mb1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnVwZGF0ZUNvbnRlbnQodGhpcy5jdXJzb3JfdGFyZ2V0LCB0aGlzLm1hcCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIudXBkYXRlKHN0ZXBzKTtcclxuXHJcbiAgICAgICAgLy8gUGF1c2UgQU5JTUFUSU9OXHJcblxyXG4gICAgICAgIHRoaXMuYW5pbV9jdXJzb3Jfc2xvdyArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy5hbmltX2N1cnNvcl9zbG93ID4gMzApIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltX2N1cnNvcl9zbG93IC09IDMwO1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1fY3Vyc29yX3N0YXRlID0gMSAtIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuY3Vyc29yLnNldEZyYW1lKHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIHRoaXMudGlsZV9tYW5hZ2VyLnVwZGF0ZShzdGVwcyk7XHJcbiAgICAgICAgdGhpcy5zbW9rZV9tYW5hZ2VyLnVwZGF0ZShzdGVwcyk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIudXBkYXRlKHN0ZXBzLCB0aGlzLmN1cnNvcl90YXJnZXQsIHRoaXMuYW5pbV9jdXJzb3Jfc3RhdGUpO1xyXG5cclxuICAgICAgICBsZXQgaW5mb19pc19yaWdodCA9ICh0aGlzLmZyYW1lX2dvbGRfaW5mby5hbGlnbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMDtcclxuICAgICAgICBpZiAoIWluZm9faXNfcmlnaHQgJiYgdGhpcy5jdXJzb3Iud29ybGRfcG9zaXRpb24ueCAtIDEgLSB0aGlzLmNhbWVyYS54IDw9IHRoaXMuZ2FtZS53aWR0aCAvIDIgLSAyNCAtIDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uTGVmdCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uUmlnaHQsIHRydWUpO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uUmlnaHQsIERpcmVjdGlvbi5MZWZ0IHwgRGlyZWN0aW9uLlVwLCBEaXJlY3Rpb24uUmlnaHQsIHRydWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaW5mb19pc19yaWdodCAmJiB0aGlzLmN1cnNvci53b3JsZF9wb3NpdGlvbi54ICsgMSAtIHRoaXMuY2FtZXJhLnggPj0gdGhpcy5nYW1lLndpZHRoIC8gMiArIDEyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLnVwZGF0ZURpcmVjdGlvbnMoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkxlZnQsIERpcmVjdGlvbi5SaWdodCB8IERpcmVjdGlvbi5Eb3duLCBEaXJlY3Rpb24uTGVmdCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlRGlyZWN0aW9ucyhEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQgfCBEaXJlY3Rpb24uVXAsIERpcmVjdGlvbi5MZWZ0LCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gLS0tLSBNRU5VIERFTEVHQVRFIC0tLS1cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgb3Blbk1lbnUoY29udGV4dDogSW5wdXRDb250ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzxudW1iZXI+IHRoaXMudHVybiAtIDFdLm9wZW5NZW51KGNvbnRleHQpO1xyXG4gICAgfVxyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIGZvciAobGV0IHBsYXllciBvZiB0aGlzLnBsYXllcnMpIHtcclxuICAgICAgICAgICAgcGxheWVyLmNsb3NlTWVudShjb250ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gLS0tLSBFTlRJVFkgTUFOQUdFUiBERUxFR0FURSAtLS0tXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBlbnRpdHlEaWRNb3ZlKGVudGl0eTogRW50aXR5KSB7XHJcbiAgICAgICAgdGhpcy5wbGF5ZXJzWzxudW1iZXI+IHRoaXMudHVybiAtIDFdLmVudGl0eURpZE1vdmUoZW50aXR5KTtcclxuICAgIH1cclxuICAgIGVudGl0eURpZEFuaW1hdGlvbihlbnRpdHk6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMucGxheWVyc1s8bnVtYmVyPiB0aGlzLnR1cm4gLSAxXS5lbnRpdHlEaWRBbmltYXRpb24oZW50aXR5KTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIC0tLS0gTUVOVSAtLS0tXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgIHNob3dNZXNzYWdlKHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBtZW51ID0gbmV3IE5vdGlmaWNhdGlvbih0aGlzLmZyYW1lX21hbmFnZXIuZ3JvdXAsIHRleHQsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZShtZW51KTtcclxuICAgICAgICBtZW51LnNob3codHJ1ZSk7XHJcbiAgICB9XHJcbiAgICBzaG93SW5mbyhhbGw6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLmZyYW1lX2RlZl9pbmZvLnNob3codHJ1ZSk7XHJcbiAgICAgICAgaWYgKGFsbCkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX2dvbGRfaW5mby5zaG93KHRydWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGhpZGVJbmZvKGFsbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8uaGlkZSh0cnVlKTtcclxuICAgICAgICBpZiAoYWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZ29sZF9pbmZvLmhpZGUodHJ1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIC0tLS0gTE9BRCAvIFNBVkUgLS0tLVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBsb2FkR2FtZSgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIU1haW5NZW51LmxvYWRHYW1lKHRoaXMuZ2FtZSkpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93TWVzc2FnZShBbmNpZW50RW1waXJlcy5MQU5HWzQzXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBzYXZlR2FtZSgpIHtcclxuXHJcbiAgICAgICAgbGV0IGN1cnNvcnM6IElQb3NbXSA9IFtdO1xyXG4gICAgICAgIGxldCBwbGF5ZXJzOiBib29sZWFuW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBwbGF5ZXIgb2YgdGhpcy5wbGF5ZXJzKSB7XHJcbiAgICAgICAgICAgIGN1cnNvcnMucHVzaChwbGF5ZXIuZ2V0Q3Vyc29yUG9zaXRpb24oKSk7XHJcbiAgICAgICAgICAgIHBsYXllcnMucHVzaChwbGF5ZXIuaXNQbGF5ZXIoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgc2F2ZTogR2FtZVNhdmUgPSB7XHJcbiAgICAgICAgICAgIGNhbXBhaWduOiB0aGlzLm1hcC5pc0NhbXBhaWduKCksXHJcbiAgICAgICAgICAgIG1hcDogdGhpcy5tYXAuZ2V0TWFwKCksXHJcbiAgICAgICAgICAgIHR1cm46IHRoaXMudHVybixcclxuICAgICAgICAgICAgZ29sZDogdGhpcy5nb2xkLFxyXG4gICAgICAgICAgICBwbGF5ZXJzOiBwbGF5ZXJzLFxyXG4gICAgICAgICAgICBlbnRpdGllczogdGhpcy5tYXAuZXhwb3J0RW50aXRpZXMoKSxcclxuICAgICAgICAgICAgYnVpbGRpbmdzOiB0aGlzLm1hcC5leHBvcnRCdWlsZGluZ3MoKSxcclxuICAgICAgICAgICAgY3Vyc29yczogY3Vyc29yc1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2F2ZS5yc1wiLCBKU09OLnN0cmluZ2lmeShzYXZlKSk7XHJcbiAgICAgICAgdGhpcy5zaG93TWVzc2FnZShBbmNpZW50RW1waXJlcy5MQU5HWzQxXSk7XHJcbiAgICB9XHJcbiAgICBleGl0R2FtZSgpIHtcclxuICAgICAgICB0aGlzLmdhbWUuc3RhdGUuc3RhcnQoXCJNYWluTWVudVwiLCB0cnVlLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAvLyAtLS0tIEdFTkVSQUwgLS0tLVxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBjaGVja1dpbkxvc2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZV9vdmVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMubWFwLmNvdW50RW50aXRpZXNXaXRoKEFsbGlhbmNlLkJsdWUsIEVudGl0eVN0YXRlLkRlYWQsIEVudGl0eVR5cGUuS2luZykgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoQW5jaWVudEVtcGlyZXMuTEFOR1szOF0pO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVfb3ZlciA9IHRydWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLm1hcC5jb3VudEVudGl0aWVzV2l0aChBbGxpYW5jZS5SZWQsIEVudGl0eVN0YXRlLkRlYWQsIEVudGl0eVR5cGUuS2luZykgPiAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd01lc3NhZ2UoQW5jaWVudEVtcGlyZXMuTEFOR1syNF0pO1xyXG4gICAgICAgICAgICB0aGlzLmdhbWVfb3ZlciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5leHRUdXJuKCkge1xyXG5cclxuICAgICAgICB0aGlzLnNob3dNZXNzYWdlKEFuY2llbnRFbXBpcmVzLkxBTkdbNDBdKTtcclxuXHJcbiAgICAgICAgbGV0IG5leHRfdHVybiA9IEFsbGlhbmNlLkJsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMudHVybiA9PSBBbGxpYW5jZS5CbHVlKSB7XHJcbiAgICAgICAgICAgIG5leHRfdHVybiA9IEFsbGlhbmNlLlJlZDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCF0aGlzLnBsYXllcnNbPG51bWJlcj4gbmV4dF90dXJuIC0gMV0uaXNBY3RpdmUoKSkge1xyXG4gICAgICAgICAgICBuZXh0X3R1cm4gPSB0aGlzLnR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdvbGRbbmV4dF90dXJuID09IEFsbGlhbmNlLkJsdWUgPyAwIDogMV0gKz0gdGhpcy5tYXAuZ2V0R29sZEdhaW5Gb3JBbGxpYW5jZShuZXh0X3R1cm4pO1xyXG4gICAgICAgIHRoaXMubWFwLm5leHRUdXJuKG5leHRfdHVybik7XHJcbiAgICAgICAgdGhpcy5zdGFydFR1cm4obmV4dF90dXJuKTtcclxuICAgIH1cclxuICAgIGdldEdvbGRGb3JBbGxpYW5jZShhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuICAgICAgICBzd2l0Y2ggKGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuQmx1ZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdvbGRbMF07XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuUmVkOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ29sZFsxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG4gICAgc2V0R29sZEZvckFsbGlhbmNlKGFsbGlhbmNlOiBBbGxpYW5jZSwgYW1vdW50OiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgYWxsaWFuY2VfaWQ6IG51bWJlcjtcclxuICAgICAgICBzd2l0Y2ggKGFsbGlhbmNlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWxsaWFuY2UuQmx1ZTpcclxuICAgICAgICAgICAgICAgIGFsbGlhbmNlX2lkID0gMDtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFsbGlhbmNlLlJlZDpcclxuICAgICAgICAgICAgICAgIGFsbGlhbmNlX2lkID0gMTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmdvbGRbYWxsaWFuY2VfaWRdID0gYW1vdW50O1xyXG4gICAgICAgIGlmICh0aGlzLnR1cm4gPT0gYWxsaWFuY2UpIHtcclxuICAgICAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlQ29udGVudChhbGxpYW5jZSwgYW1vdW50KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gLS0tLSBFTlRJVElUWSAtLS0tXHJcbiAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBidXlFbnRpdHkoa2luZzogRW50aXR5LCB0eXBlOiBFbnRpdHlUeXBlKTogRW50aXR5IHtcclxuICAgICAgICBsZXQgZGF0YSA9IEFuY2llbnRFbXBpcmVzLkVOVElUSUVTWzxudW1iZXI+IHR5cGVdO1xyXG4gICAgICAgIGxldCBnb2xkID0gdGhpcy5nZXRHb2xkRm9yQWxsaWFuY2Uoa2luZy5hbGxpYW5jZSkgLSBkYXRhLmNvc3Q7XHJcbiAgICAgICAgaWYgKGdvbGQgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNldEdvbGRGb3JBbGxpYW5jZShraW5nLmFsbGlhbmNlLCBnb2xkKTtcclxuICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5tYXAuY3JlYXRlRW50aXR5KHR5cGUsIGtpbmcuYWxsaWFuY2UsIGtpbmcucG9zaXRpb24uY29weSgpKTtcclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLmNyZWF0ZUVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgIHJldHVybiBlbnRpdHk7XHJcbiAgICB9XHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoISF0aGlzLnNlbGVjdGVkX2VudGl0eSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gZW50aXR5O1xyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2VsZWN0RW50aXR5KGVudGl0eSk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICBtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5LCB0YXJnZXQ6IFBvcywgYW5pbWF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICh0aGlzLm1hcC5tb3ZlRW50aXR5KGVudGl0eSwgdGFyZ2V0LCB0aGlzLCBhbmltYXRlKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVSYW5nZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgb2NjdXB5KHBvc2l0aW9uOiBQb3MsIGFsbGlhbmNlOiBBbGxpYW5jZSkge1xyXG4gICAgICAgIHRoaXMubWFwLnNldEFsbGlhbmNlQXQocG9zaXRpb24sIGFsbGlhbmNlKTtcclxuICAgICAgICB0aGlzLnRpbGVfbWFuYWdlci5kcmF3VGlsZUF0KHBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLnNob3dNZXNzYWdlKEFuY2llbnRFbXBpcmVzLkxBTkdbMzldKTtcclxuICAgIH1cclxuICAgIHNob3dSYW5nZSh0eXBlOiBFbnRpdHlSYW5nZVR5cGUsIGVudGl0eTogRW50aXR5KTogRW50aXR5UmFuZ2Uge1xyXG4gICAgICAgIHRoaXMubWFwLnNob3dSYW5nZSh0eXBlLCBlbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuc2hvd1JhbmdlKCk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwLmVudGl0eV9yYW5nZTtcclxuICAgIH1cclxuICAgIGhpZGVSYW5nZSgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLmhpZGVSYW5nZSgpO1xyXG4gICAgfVxyXG4gICAgYXR0YWNrRW50aXR5KGVudGl0eTogRW50aXR5LCB0YXJnZXQ6IEVudGl0eSkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuYXR0YWNrRW50aXR5KGVudGl0eSwgdGFyZ2V0KTtcclxuICAgIH1cclxuICAgIHJhaXNlRW50aXR5KHdpemFyZDogRW50aXR5LCBkZWFkOiBFbnRpdHkpIHtcclxuICAgICAgICB0aGlzLmVudGl0eV9tYW5hZ2VyLnJhaXNlRW50aXR5KHdpemFyZCwgZGVhZCk7XHJcbiAgICB9XHJcbiAgICBkZXNlbGVjdEVudGl0eShjaGFuZ2VkOiBib29sZWFuKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdGVkX2VudGl0eSkgeyByZXR1cm47IH1cclxuXHJcbiAgICAgICAgdGhpcy5jdXJzb3JfdGFyZ2V0ID0gdGhpcy5zZWxlY3RlZF9lbnRpdHkucG9zaXRpb24uY29weSgpO1xyXG4gICAgICAgIHRoaXMuaGlkZVJhbmdlKCk7XHJcblxyXG4gICAgICAgIHRoaXMuZW50aXR5X21hbmFnZXIuZGVzZWxlY3RFbnRpdHkodGhpcy5zZWxlY3RlZF9lbnRpdHkpO1xyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWRfZW50aXR5ID0gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gaWYgc29tZXRoaW5nIGNoYW5nZWRcclxuICAgICAgICBpZiAoY2hhbmdlZCkge1xyXG4gICAgICAgICAgICB0aGlzLm1hcC5yZXNldFdpc3AodGhpcy50dXJuKTtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHlfbWFuYWdlci5zaG93V2lzcGVkKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfZGVmX2luZm8udXBkYXRlQ29udGVudCh0aGlzLmN1cnNvcl90YXJnZXQsIHRoaXMubWFwKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIC0tLS0gUFJJVkFURSBHRU5FUkFMIC0tLS1cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICBwcml2YXRlIHN0YXJ0VHVybihhbGxpYW5jZTogQWxsaWFuY2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy50dXJuID0gYWxsaWFuY2U7XHJcblxyXG4gICAgICAgIGxldCBwbGF5ZXIgPSB0aGlzLnBsYXllcnNbPG51bWJlcj4gYWxsaWFuY2UgLSAxXTtcclxuICAgICAgICBwbGF5ZXIuc3RhcnQoKTtcclxuICAgICAgICB0aGlzLmN1cnNvcl90YXJnZXQgPSBwbGF5ZXIuZ2V0Q3Vyc29yUG9zaXRpb24oKTtcclxuXHJcbiAgICAgICAgbGV0IHdwID0gdGhpcy5jdXJzb3JfdGFyZ2V0LmdldFdvcmxkUG9zaXRpb24oKTtcclxuICAgICAgICB0aGlzLmN1cnNvci5zZXRXb3JsZFBvc2l0aW9uKHdwKTtcclxuXHJcbiAgICAgICAgdGhpcy5mcmFtZV9nb2xkX2luZm8udXBkYXRlQ29udGVudChhbGxpYW5jZSwgdGhpcy5nZXRHb2xkRm9yQWxsaWFuY2UoYWxsaWFuY2UpKTtcclxuXHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHVwZGF0ZU9mZnNldEZvclBvc2l0aW9uKHBvc2l0aW9uOiBJUG9zKSB7XHJcbiAgICAgICAgbGV0IHggPSBwb3NpdGlvbi54ICsgMC41ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgIGxldCB5ID0gcG9zaXRpb24ueSArIDAuNSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoeCwgeSk7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIHVwZGF0ZU9mZnNldCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBvZmZzZXRfeCA9IHRoaXMuZ2V0T2Zmc2V0WCh4KTtcclxuICAgICAgICBsZXQgb2Zmc2V0X3kgPSB0aGlzLmdldE9mZnNldFkoeSk7XHJcblxyXG4gICAgICAgIGxldCBkaWZmX3ggPSBvZmZzZXRfeCAtIHRoaXMuY2FtZXJhLng7XHJcbiAgICAgICAgbGV0IGRpZmZfeSA9IG9mZnNldF95IC0gdGhpcy5jYW1lcmEueTtcclxuXHJcbiAgICAgICAgdGhpcy5jYW1lcmFfc3RpbGwgPSBkaWZmX3ggPT0gMCAmJiBkaWZmX3kgPT0gMDtcclxuICAgICAgICBpZiAoZGlmZl94ICE9IDApIHtcclxuICAgICAgICAgICAgbGV0IGR4ID0gTWF0aC5mbG9vcihkaWZmX3ggLyAxMik7XHJcbiAgICAgICAgICAgIGlmIChkeCA8IDApIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5tYXgoZHgsIC00KTtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIC0xKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGR4ID0gTWF0aC5taW4oZHgsIDQpO1xyXG4gICAgICAgICAgICAgICAgZHggPSBNYXRoLm1heChkeCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYW1lcmEueCArPSBkeDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGRpZmZfeSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGxldCBkeSA9IE1hdGguZmxvb3IoZGlmZl95IC8gMTIpO1xyXG4gICAgICAgICAgICBpZiAoZHkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWF4KGR5LCAtNCk7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWluKGR5LCAtMSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkeSA9IE1hdGgubWluKGR5LCA0KTtcclxuICAgICAgICAgICAgICAgIGR5ID0gTWF0aC5tYXgoZHksIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY2FtZXJhLnkgKz0gZHk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRPZmZzZXRYKHg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IG9mZnNldF94ID0geCAtIHRoaXMuZ2FtZS53aWR0aCAvIDI7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS53aWR0aCA8IHRoaXMud29ybGQud2lkdGgpIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3ggPSBNYXRoLm1heChvZmZzZXRfeCwgMCk7XHJcbiAgICAgICAgICAgIG9mZnNldF94ID0gTWF0aC5taW4ob2Zmc2V0X3gsIHRoaXMud29ybGQud2lkdGggLSB0aGlzLmdhbWUud2lkdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG9mZnNldF94ID0gKHRoaXMuZ2FtZS53aWR0aCAtIHRoaXMud29ybGQud2lkdGgpIC8gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9mZnNldF94O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBnZXRPZmZzZXRZKHk6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IG9mZnNldF95ID0geSAtIHRoaXMuZ2FtZS5oZWlnaHQgLyAyO1xyXG4gICAgICAgIGlmICh0aGlzLmdhbWUuaGVpZ2h0IDwgdGhpcy53b3JsZC5oZWlnaHQpIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3kgPSBNYXRoLm1heChvZmZzZXRfeSwgMCk7XHJcbiAgICAgICAgICAgIG9mZnNldF95ID0gTWF0aC5taW4ob2Zmc2V0X3ksIHRoaXMud29ybGQuaGVpZ2h0IC0gdGhpcy5nYW1lLmhlaWdodCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb2Zmc2V0X3kgPSAodGhpcy5nYW1lLmhlaWdodCAtIHRoaXMud29ybGQuaGVpZ2h0KSAvIDI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvZmZzZXRfeTtcclxuICAgIH1cclxufVxyXG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2FtZWNvbnRyb2xsZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWVudS50c1wiIC8+XHJcblxyXG5lbnVtIEFjdGl2ZU1lbnVUeXBlIHtcclxuICAgIENhbXBhaWduTWFwcyxcclxuICAgIFNraXJtaXNoTWFwcyxcclxuICAgIFNraXJtaXNoUGxheWVyc1xyXG59XHJcblxyXG5jbGFzcyBNYWluTWVudSBleHRlbmRzIFBoYXNlci5TdGF0ZSBpbXBsZW1lbnRzIE1lbnVEZWxlZ2F0ZSB7XHJcblxyXG4gICAgcHJpdmF0ZSBrbmlnaHRzOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHRpdGxlOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICBwcml2YXRlIHRpdGxlX21hc2s6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgaW50cm86IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGludHJvX2FjYzogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBpbnRyb19wcm9ncmVzczogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgbWFpbjogTWVudU9wdGlvbnM7XHJcbiAgICBwcml2YXRlIG1lbnVfc2VsZWN0OiBNZW51U2VsZWN0O1xyXG5cclxuICAgIHByaXZhdGUgZnJhbWVfbWFuYWdlcjogRnJhbWVNYW5hZ2VyO1xyXG4gICAgcHJpdmF0ZSBub3RpZmljYXRpb25fc2hvd246IGJvb2xlYW47XHJcblxyXG4gICAgcHJpdmF0ZSBrZXlzOiBJbnB1dDtcclxuXHJcbiAgICBwcml2YXRlIGFjdGl2ZV9hYm91dDogUGhhc2VyLkdyb3VwO1xyXG4gICAgcHJpdmF0ZSBhY3RpdmVfaW5zdHJ1Y3Rpb25zOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGFjdGl2ZV9pbnN0cnVjdGlvbl9ucjogbnVtYmVyO1xyXG5cclxuICAgIHByaXZhdGUgYWN0aXZlX3NlbGVjdDogQWN0aXZlTWVudVR5cGU7XHJcbiAgICBwcml2YXRlIGFjdGl2ZV9za2lybWlzaDogbnVtYmVyO1xyXG5cclxuICAgIHN0YXRpYyBkcmF3VHJhbnNpdGlvbihwcm9ncmVzczogbnVtYmVyLCBtYXhfcHJvZ3Jlc3M6IG51bWJlciwgZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcywgaW1hZ2Vfd2lkdGg6IG51bWJlciwgaW1hZ2VfaGVpZ2h0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IG1heF9zZWdtZW50X3dpZHRoID0gTWF0aC5jZWlsKGltYWdlX3dpZHRoIC8gNCk7XHJcbiAgICAgICAgbGV0IG1heF9zZWdtZW50X2hlaWdodCA9IE1hdGguY2VpbChpbWFnZV9oZWlnaHQgLyAyKTtcclxuXHJcbiAgICAgICAgbGV0IHVudGlsX2FsbCA9IG1heF9wcm9ncmVzcyAtIDY7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCA0OyB4KyspIHtcclxuICAgICAgICAgICAgbGV0IHNob3cgPSBNYXRoLmZsb29yKHByb2dyZXNzIC0geCAqIDIpO1xyXG4gICAgICAgICAgICBpZiAoc2hvdyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRyYXcgYWZ0ZXIgdGhpcyBwb2ludFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHdpZHRoOiBudW1iZXI7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICAgICAgaWYgKHNob3cgPj0gdW50aWxfYWxsKSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IG1heF9zZWdtZW50X3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gbWF4X3NlZ21lbnRfaGVpZ2h0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHNob3cgKiBtYXhfc2VnbWVudF93aWR0aCAvIHVudGlsX2FsbCk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmZsb29yKHNob3cgKiBtYXhfc2VnbWVudF9oZWlnaHQgLyB1bnRpbF9hbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5feCA9IE1hdGguZmxvb3IoKG1heF9zZWdtZW50X3dpZHRoIC0gd2lkdGgpIC8gMik7XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5feSA9IE1hdGguZmxvb3IoKG1heF9zZWdtZW50X2hlaWdodCAtIGhlaWdodCkgLyAyKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldF94ID0geCAqIG1heF9zZWdtZW50X3dpZHRoICsgbWFyZ2luX3g7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgMjsgeSArKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldF95ID0geSAqIG1heF9zZWdtZW50X2hlaWdodCArIG1hcmdpbl95O1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3Qob2Zmc2V0X3gsIG9mZnNldF95LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGxvYWRHYW1lKGdhbWU6IFBoYXNlci5HYW1lKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHNhdmU6IEdhbWVTYXZlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRhID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzYXZlLnJzXCIpO1xyXG4gICAgICAgICAgICBzYXZlID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFzYXZlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZ2FtZS5zdGF0ZS5zdGFydChcIkdhbWVcIiwgdHJ1ZSwgZmFsc2UsIHNhdmUpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgICBzdGF0aWMgc3RhcnRHYW1lKGdhbWU6IFBoYXNlci5HYW1lLCBjYW1wYWlnbjogYm9vbGVhbiwgbWFwOiBudW1iZXIsIHBsYXllcnM6IGJvb2xlYW5bXSA9IFt0cnVlLCBmYWxzZV0pIHtcclxuICAgICAgICBsZXQgc2F2ZTogR2FtZVNhdmUgPSB7XHJcbiAgICAgICAgICAgIGNhbXBhaWduOiBjYW1wYWlnbixcclxuICAgICAgICAgICAgbWFwOiBtYXAsXHJcbiAgICAgICAgICAgIHBsYXllcnM6IHBsYXllcnNcclxuICAgICAgICB9O1xyXG4gICAgICAgIGdhbWUuc3RhdGUuc3RhcnQoXCJHYW1lXCIsIHRydWUsIGZhbHNlLCBzYXZlKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0Fib3V0KGdhbWU6IFBoYXNlci5HYW1lKTogUGhhc2VyLkdyb3VwIHtcclxuICAgICAgICBsZXQgZ3JvdXAgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIGdyb3VwLmZpeGVkVG9DYW1lcmEgPSB0cnVlO1xyXG5cclxuICAgICAgICBsZXQgYmFja2dyb3VuZCA9IGdhbWUuYWRkLmdyYXBoaWNzKDAsIDAsIGdyb3VwKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmJlZ2luRmlsbCgweGZmZmZmZik7XHJcbiAgICAgICAgYmFja2dyb3VuZC5kcmF3UmVjdCgwLCAwLCBnYW1lLndpZHRoLCBnYW1lLmhlaWdodCk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5lbmRGaWxsKCk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5iZWdpbkZpbGwoMHgwMDAwMDApO1xyXG4gICAgICAgIGJhY2tncm91bmQuZHJhd1JlY3QoMCwgMzcsIGdhbWUud2lkdGgsIDEpO1xyXG4gICAgICAgIGJhY2tncm91bmQuZW5kRmlsbCgpO1xyXG5cclxuICAgICAgICBnYW1lLmFkZC5iaXRtYXBUZXh0KDEwLCAyNiwgXCJmb250N1wiLCBBbmNpZW50RW1waXJlcy5MQU5HWzhdLCA3LCBncm91cCk7XHJcbiAgICAgICAgbGV0IHRleHQgPSBnYW1lLmFkZC5iaXRtYXBUZXh0KDEwLCA0MiwgXCJmb250N1wiLCBBbmNpZW50RW1waXJlcy5MQU5HWzBdICsgQW5jaWVudEVtcGlyZXMuTEFOR1sxNF0sIDcsIGdyb3VwKTtcclxuICAgICAgICB0ZXh0Lm1heFdpZHRoID0gZ2FtZS53aWR0aCAtIDIwO1xyXG4gICAgICAgIHJldHVybiBncm91cDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0luc3RydWN0aW9ucyhncm91cDogUGhhc2VyLkdyb3VwLCBwYWdlOiBudW1iZXIgPSAwKSB7XHJcbiAgICAgICAgZ3JvdXAucmVtb3ZlQ2hpbGRyZW4oKTtcclxuXHJcbiAgICAgICAgbGV0IGJhY2tncm91bmQgPSBncm91cC5nYW1lLmFkZC5ncmFwaGljcygwLCAwLCBncm91cCk7XHJcbiAgICAgICAgYmFja2dyb3VuZC5iZWdpbkZpbGwoMHhmZmZmZmYpO1xyXG4gICAgICAgIGJhY2tncm91bmQuZHJhd1JlY3QoMCwgMCwgZ3JvdXAuZ2FtZS53aWR0aCwgZ3JvdXAuZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgIGJhY2tncm91bmQuZW5kRmlsbCgpO1xyXG4gICAgICAgIGJhY2tncm91bmQuYmVnaW5GaWxsKDB4MDAwMDAwKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmRyYXdSZWN0KDAsIDM3LCBncm91cC5nYW1lLndpZHRoLCAxKTtcclxuICAgICAgICBiYWNrZ3JvdW5kLmVuZEZpbGwoKTtcclxuXHJcbiAgICAgICAgZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgxMCwgMjYsIFwiZm9udDdcIiwgQW5jaWVudEVtcGlyZXMuTEFOR1s3XSArIChwYWdlID4gMCA/IChcIiAtIFwiICsgcGFnZSkgOiBcIlwiKSwgNywgZ3JvdXApO1xyXG4gICAgICAgIGxldCB0ZXh0ID0gZ3JvdXAuZ2FtZS5hZGQuYml0bWFwVGV4dCgxMCwgNDIsIFwiZm9udDdcIiwgQW5jaWVudEVtcGlyZXMuTEFOR1twYWdlID4gMCA/ICg4NiArIHBhZ2UpIDogMTNdLCA3LCBncm91cCk7XHJcbiAgICAgICAgdGV4dC5tYXhXaWR0aCA9IGdyb3VwLmdhbWUud2lkdGggLSAyMDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBvcGVuTWVudShjb250ZXh0OiBJbnB1dENvbnRleHQpIHtcclxuICAgICAgICBpZiAoY29udGV4dCA9PSBJbnB1dENvbnRleHQuV2FpdCkge1xyXG4gICAgICAgICAgICB0aGlzLm5vdGlmaWNhdGlvbl9zaG93biA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgY2xvc2VNZW51KGNvbnRleHQ6IElucHV0Q29udGV4dCkge1xyXG4gICAgICAgIGlmIChjb250ZXh0ID09IElucHV0Q29udGV4dC5XYWl0KSB7XHJcbiAgICAgICAgICAgIHRoaXMubm90aWZpY2F0aW9uX3Nob3duID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZSAoKSB7XHJcbiAgICAgICAgLy8gdGhpcy5sb2FkTWFwKFwiczBcIik7XHJcblxyXG4gICAgICAgIHRoaXMubm90aWZpY2F0aW9uX3Nob3duID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5pbnRybyA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5pbnRyb19hY2MgPSAwO1xyXG4gICAgICAgIHRoaXMuaW50cm9fcHJvZ3Jlc3MgPSAxMDA7XHJcblxyXG4gICAgICAgIHRoaXMuZ2FtZS5hZGQuaW1hZ2UoMCwgMCwgXCJzcGxhc2hiZ1wiKTtcclxuICAgICAgICB0aGlzLmtuaWdodHMgPSB0aGlzLmdhbWUuYWRkLmltYWdlKDAsIDI2LCBcInNwbGFzaGZnXCIpO1xyXG5cclxuICAgICAgICB0aGlzLnRpdGxlID0gdGhpcy5nYW1lLmFkZC5pbWFnZSgwLCA4LCBcInNwbGFzaFwiKTtcclxuICAgICAgICB0aGlzLnRpdGxlLnggPSBNYXRoLmZsb29yKCh0aGlzLmdhbWUud2lkdGggLSB0aGlzLnRpdGxlLndpZHRoKSAvIDIpO1xyXG4gICAgICAgIHRoaXMudGl0bGUudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLnRpdGxlX21hc2sgPSB0aGlzLmdhbWUuYWRkLmdyYXBoaWNzKHRoaXMudGl0bGUueCwgdGhpcy50aXRsZS55KTtcclxuICAgICAgICB0aGlzLnRpdGxlLm1hc2sgPSB0aGlzLnRpdGxlX21hc2s7XHJcblxyXG4gICAgICAgIGxldCBmcmFtZV9ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIgPSBuZXcgRnJhbWVNYW5hZ2VyKGZyYW1lX2dyb3VwKTtcclxuXHJcbiAgICAgICAgdGhpcy5rZXlzID0gbmV3IElucHV0KHRoaXMuZ2FtZS5pbnB1dCk7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZSgpIHtcclxuXHJcbiAgICAgICAgaWYgKCF0aGlzLmludHJvKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmtleXMudXBkYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci51cGRhdGUoMSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5ub3RpZmljYXRpb25fc2hvd24pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMua2V5cy5pc0tleVByZXNzZWQoS2V5LlVwKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5rZXlzLmNsZWFyS2V5UHJlc3NlZChLZXkuVXApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5tZW51X3NlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudV9zZWxlY3QucHJldigpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW4ucHJldigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRG93bikpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkRvd24pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5tZW51X3NlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudV9zZWxlY3QubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1haW4ubmV4dCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuRW50ZXIpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5FbnRlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLmFjdGl2ZV9hYm91dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2Fib3V0LmRlc3Ryb3kodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfYWJvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghIXRoaXMuYWN0aXZlX2luc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXh0ID0gdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25fbnIgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0IDw9IDE3KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yID0gbmV4dDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMsIHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEhdGhpcy5tZW51X3NlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0Q2hvaWNlKHRoaXMubWVudV9zZWxlY3Quc2VsZWN0ZWQpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgYWN0aW9uID0gdGhpcy5tYWluLmdldFNlbGVjdGVkKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5leGVjdXRlQWN0aW9uKGFjdGlvbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1lbHNlIGlmICh0aGlzLmtleXMuaXNLZXlQcmVzc2VkKEtleS5Fc2MpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLmFjdGl2ZV9hYm91dCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2Fib3V0LmRlc3Ryb3kodHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfYWJvdXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghIXRoaXMuYWN0aXZlX2luc3RydWN0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2luc3RydWN0aW9ucy5kZXN0cm95KHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2luc3RydWN0aW9ucyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCEhdGhpcy5tZW51X3NlbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudV9zZWxlY3QuaGlkZShmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluLnNob3codHJ1ZSwgNzIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuUmlnaHQpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmtleXMuY2xlYXJLZXlQcmVzc2VkKEtleS5SaWdodCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoISF0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbmV4dCA9IHRoaXMuYWN0aXZlX2luc3RydWN0aW9uX25yICsgMTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCA8PSAxNykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9uciA9IG5leHQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1haW5NZW51LnNob3dJbnN0cnVjdGlvbnModGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zLCB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9ucik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9ZWxzZSBpZiAodGhpcy5rZXlzLmlzS2V5UHJlc3NlZChLZXkuTGVmdCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMua2V5cy5jbGVhcktleVByZXNzZWQoS2V5LkxlZnQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXYgPSB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9uciAtIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHByZXYgPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9uciA9IHByZXY7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1haW5NZW51LnNob3dJbnN0cnVjdGlvbnModGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zLCB0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbl9uciApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnRyb19hY2MrKztcclxuICAgICAgICBpZiAodGhpcy5pbnRyb19hY2MgPCAyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pbnRyb19hY2MgPSAwO1xyXG4gICAgICAgIHRoaXMuaW50cm9fcHJvZ3Jlc3MrKztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW50cm9fcHJvZ3Jlc3MgPD0gMzApIHtcclxuICAgICAgICAgICAgdGhpcy5rbmlnaHRzLnkgPSAyNiAtIHRoaXMuaW50cm9fcHJvZ3Jlc3M7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmludHJvX3Byb2dyZXNzIDw9IDYwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGUudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVfbWFzay5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLnRpdGxlX21hc2suYmVnaW5GaWxsKCk7XHJcbiAgICAgICAgICAgIE1haW5NZW51LmRyYXdUcmFuc2l0aW9uKE1hdGguY2VpbCgodGhpcy5pbnRyb19wcm9ncmVzcyAtIDMwKSAvIDIpLCAxNSwgdGhpcy50aXRsZV9tYXNrLCB0aGlzLnRpdGxlLndpZHRoLCB0aGlzLnRpdGxlLmhlaWdodCk7XHJcbiAgICAgICAgICAgIHRoaXMudGl0bGVfbWFzay5lbmRGaWxsKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50aXRsZV9tYXNrLmNsZWFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFpbiA9IG5ldyBNZW51T3B0aW9ucyh0aGlzLmZyYW1lX21hbmFnZXIuZ3JvdXAsIERpcmVjdGlvbi5Ob25lLCBNZW51T3B0aW9ucy5nZXRNYWluTWVudU9wdGlvbnMoZmFsc2UpLCB0aGlzLCBEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lX21hbmFnZXIuYWRkRnJhbWUodGhpcy5tYWluKTtcclxuICAgICAgICAgICAgdGhpcy5tYWluLnNob3codHJ1ZSwgNzIpO1xyXG4gICAgICAgICAgICB0aGlzLmludHJvID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dNZXNzYWdlKHRleHQ6IHN0cmluZykge1xyXG4gICAgICAgIGxldCBtZW51ID0gbmV3IE5vdGlmaWNhdGlvbih0aGlzLmZyYW1lX21hbmFnZXIuZ3JvdXAsIHRleHQsIHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZShtZW51KTtcclxuICAgICAgICBtZW51LnNob3codHJ1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZXhlY3V0ZUFjdGlvbihhY3Rpb246IEFjdGlvbikge1xyXG4gICAgICAgIHN3aXRjaCAoYWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aW9uLkxPQURfR0FNRTpcclxuICAgICAgICAgICAgICAgIGlmIChNYWluTWVudS5sb2FkR2FtZSh0aGlzLmdhbWUpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYWluLmhpZGUoZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3dNZXNzYWdlKEFuY2llbnRFbXBpcmVzLkxBTkdbNDNdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5ORVdfR0FNRTpcclxuICAgICAgICAgICAgICAgIHRoaXMubWFpbi5oaWRlKGZhbHNlKTtcclxuICAgICAgICAgICAgICAgIE1haW5NZW51LnN0YXJ0R2FtZSh0aGlzLmdhbWUsIGZhbHNlLCAwKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5TRUxFQ1RfTEVWRUw6XHJcbiAgICAgICAgICAgICAgICBsZXQgbWFwczogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFwcy5wdXNoKEFuY2llbnRFbXBpcmVzLkxBTkdbNDkgKyBpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1haW4uaGlkZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9zZWxlY3QgPSBBY3RpdmVNZW51VHlwZS5DYW1wYWlnbk1hcHM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVfc2VsZWN0ID0gbmV3IE1lbnVTZWxlY3QobWFwcywgdGhpcy5mcmFtZV9tYW5hZ2VyLmdyb3VwLCB0aGlzLCBEaXJlY3Rpb24uTm9uZSwgRGlyZWN0aW9uLlVwKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZnJhbWVfbWFuYWdlci5hZGRGcmFtZSh0aGlzLm1lbnVfc2VsZWN0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWVudV9zZWxlY3Quc2hvdyh0cnVlLCA3Mik7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uU0tJUk1JU0g6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1haW4uaGlkZShmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZV9zZWxlY3QgPSBBY3RpdmVNZW51VHlwZS5Ta2lybWlzaE1hcHM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVfc2VsZWN0ID0gbmV3IE1lbnVTZWxlY3QoW1wiSXNsYW5kIENyb3NzXCIsIFwiUm9ja3kgQmF5XCJdLCB0aGlzLmZyYW1lX21hbmFnZXIuZ3JvdXAsIHRoaXMsIERpcmVjdGlvbi5Ob25lLCBEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMubWVudV9zZWxlY3QpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5zaG93KHRydWUsIDcyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGlvbi5BQk9VVDpcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX2Fib3V0ID0gTWFpbk1lbnUuc2hvd0Fib3V0KHRoaXMuZ2FtZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBBY3Rpb24uSU5TVFJVQ1RJT05TOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25zID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfaW5zdHJ1Y3Rpb25fbnIgPSAwO1xyXG4gICAgICAgICAgICAgICAgTWFpbk1lbnUuc2hvd0luc3RydWN0aW9ucyh0aGlzLmFjdGl2ZV9pbnN0cnVjdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdENob2ljZShjaG9pY2U6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMubWVudV9zZWxlY3QuaGlkZShmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5tZW51X3NlbGVjdCA9IG51bGw7XHJcblxyXG4gICAgICAgIHN3aXRjaCAodGhpcy5hY3RpdmVfc2VsZWN0KSB7XHJcbiAgICAgICAgICAgIGNhc2UgQWN0aXZlTWVudVR5cGUuQ2FtcGFpZ25NYXBzOlxyXG4gICAgICAgICAgICAgICAgTWFpbk1lbnUuc3RhcnRHYW1lKHRoaXMuZ2FtZSwgdHJ1ZSwgY2hvaWNlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGl2ZU1lbnVUeXBlLlNraXJtaXNoTWFwczpcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlX3NraXJtaXNoID0gY2hvaWNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVfc2VsZWN0ID0gQWN0aXZlTWVudVR5cGUuU2tpcm1pc2hQbGF5ZXJzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdCA9IG5ldyBNZW51U2VsZWN0KFtcIjEgUExBWUVSXCIsIFwiMiBQTEFZRVJcIiwgXCJBSSBPTkxZXCJdLCB0aGlzLmZyYW1lX21hbmFnZXIuZ3JvdXAsIHRoaXMsIERpcmVjdGlvbi5Ob25lLCBEaXJlY3Rpb24uVXApO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcmFtZV9tYW5hZ2VyLmFkZEZyYW1lKHRoaXMubWVudV9zZWxlY3QpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tZW51X3NlbGVjdC5zaG93KHRydWUsIDcyKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIEFjdGl2ZU1lbnVUeXBlLlNraXJtaXNoUGxheWVyczpcclxuICAgICAgICAgICAgICAgIGxldCBwbGF5ZXJzOiBib29sZWFuW10gPSBbY2hvaWNlICE9IDIsIGNob2ljZSA9PSAxXTtcclxuICAgICAgICAgICAgICAgIE1haW5NZW51LnN0YXJ0R2FtZSh0aGlzLmdhbWUsIGZhbHNlLCB0aGlzLmFjdGl2ZV9za2lybWlzaCwgcGxheWVycyk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJ1dGlsLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNwcml0ZS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJsb2FkZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwibWFpbm1lbnUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZ2FtZWNvbnRyb2xsZXIudHNcIiAvPlxyXG5jbGFzcyBBbmNpZW50RW1waXJlcyB7XHJcblxyXG4gICAgc3RhdGljIFRJTEVfU0laRTogbnVtYmVyID0gMjQ7XHJcbiAgICBzdGF0aWMgTUlOSV9TSVpFOiBudW1iZXIgPSAxMDtcclxuICAgIHN0YXRpYyBFTlRJVElFUzogRW50aXR5RGF0YVtdO1xyXG5cclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfTEVOR1RIID0gMTA7XHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX1dJRFRIID0gNDtcclxuICAgIHN0YXRpYyBMSU5FX1NFR01FTlRfU1BBQ0lORyA9IDI7XHJcbiAgICBzdGF0aWMgREVBVEhfQ09VTlQgPSAzO1xyXG5cclxuICAgIHN0YXRpYyBOVU1CRVJfT0ZfVElMRVM6IG51bWJlciA9IDIzO1xyXG4gICAgc3RhdGljIFRJTEVTX1BST1A6IFRpbGVbXTtcclxuICAgIHN0YXRpYyBMQU5HOiBzdHJpbmdbXTtcclxuXHJcbiAgICBzdGF0aWMgZ2FtZTogUGhhc2VyLkdhbWU7XHJcbiAgICBsb2FkZXI6IExvYWRlcjtcclxuICAgIG1haW5NZW51OiBNYWluTWVudTtcclxuICAgIGNvbnRyb2xsZXI6IEdhbWVDb250cm9sbGVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXIgPSAxNzY7XHJcbiAgICBoZWlnaHQ6IG51bWJlciA9ICAyMDQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGl2X2lkOiBzdHJpbmcpIHtcclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBQaGFzZXIuQVVUTywgZGl2X2lkLCB0aGlzKTtcclxuICAgICAgICB0aGlzLmxvYWRlciA9IG5ldyBMb2FkZXIoKTtcclxuICAgICAgICB0aGlzLm1haW5NZW51ID0gbmV3IE1haW5NZW51KCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKCk7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiTG9hZGVyXCIsIHRoaXMubG9hZGVyKTtcclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLnN0YXRlLmFkZChcIk1haW5NZW51XCIsIHRoaXMubWFpbk1lbnUpO1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiR2FtZVwiLCB0aGlzLmNvbnRyb2xsZXIpO1xyXG5cclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lLnN0YXRlLnN0YXJ0KFwiTG9hZGVyXCIpO1xyXG5cclxuICAgIH1cclxuXHJcblxyXG59XHJcbiIsImVudW0gU2NyZWVuVHJhbnNpdGlvbiB7XHJcbiAgICBOb25lLFxyXG4gICAgSGlkZSxcclxuICAgIFNob3dcclxufVxyXG5jbGFzcyBBdHRhY2tTY3JlZW4ge1xyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uOiBTY3JlZW5UcmFuc2l0aW9uO1xyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uX3Byb2dyZXNzOiBudW1iZXI7XHJcblxyXG4gICAgcHJpdmF0ZSBiYWNrZ3JvdW5kX2dyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBwcml2YXRlIGNvbnRlbnRfZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuICAgIHByaXZhdGUgdHJhbnNpdGlvbl9tYXNrOiBQaGFzZXIuR3JhcGhpY3M7XHJcbiAgICBwcml2YXRlIGF0dGFja2VyOiBFbnRpdHk7XHJcbiAgICBwcml2YXRlIHRhcmdldDogRW50aXR5O1xyXG4gICAgcHJpdmF0ZSBtYXA6IE1hcDtcclxuXHJcbiAgICBzdGF0aWMgZHJhd1RyYW5zaXRpb24ocHJvZ3Jlc3M6IG51bWJlciwgbWF4X3Byb2dyZXNzOiBudW1iZXIsIGdyYXBoaWNzOiBQaGFzZXIuR3JhcGhpY3MsIHNjcmVlbl93aWR0aDogbnVtYmVyLCBzY3JlZW5faGVpZ2h0OiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IG1heF9zZWdtZW50X3dpZHRoID0gTWF0aC5mbG9vcihzY3JlZW5fd2lkdGggLyA0KSArIDE7XHJcbiAgICAgICAgbGV0IG1heF9zZWdtZW50X2hlaWdodCA9IE1hdGguZmxvb3Ioc2NyZWVuX2hlaWdodCAvIDQpICsgMTtcclxuXHJcbiAgICAgICAgbGV0IHVudGlsX2FsbCA9IG1heF9wcm9ncmVzcyAtIDY7XHJcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCA0OyB4KyspIHtcclxuICAgICAgICAgICAgbGV0IHNob3cgPSBNYXRoLmZsb29yKHByb2dyZXNzIC0geCAqIDIpO1xyXG4gICAgICAgICAgICBpZiAoc2hvdyA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBub3RoaW5nIHRvIGRyYXcgYWZ0ZXIgdGhpcyBwb2ludFxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGV0IHdpZHRoOiBudW1iZXI7XHJcbiAgICAgICAgICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcclxuICAgICAgICAgICAgaWYgKHNob3cgPj0gdW50aWxfYWxsKSB7XHJcbiAgICAgICAgICAgICAgICB3aWR0aCA9IG1heF9zZWdtZW50X3dpZHRoO1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0ID0gbWF4X3NlZ21lbnRfaGVpZ2h0O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKHNob3cgKiBtYXhfc2VnbWVudF93aWR0aCAvIHVudGlsX2FsbCk7XHJcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBNYXRoLmZsb29yKHNob3cgKiBtYXhfc2VnbWVudF9oZWlnaHQgLyB1bnRpbF9hbGwpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5feCA9IE1hdGguZmxvb3IoKG1heF9zZWdtZW50X3dpZHRoIC0gd2lkdGgpIC8gMik7XHJcbiAgICAgICAgICAgIGxldCBtYXJnaW5feSA9IE1hdGguZmxvb3IoKG1heF9zZWdtZW50X2hlaWdodCAtIGhlaWdodCkgLyAyKTtcclxuICAgICAgICAgICAgbGV0IG9mZnNldF94ID0geCAqIG1heF9zZWdtZW50X3dpZHRoICsgbWFyZ2luX3g7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgNDsgeSArKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldF95ID0geSAqIG1heF9zZWdtZW50X2hlaWdodCArIG1hcmdpbl95O1xyXG4gICAgICAgICAgICAgICAgZ3JhcGhpY3MuZHJhd1JlY3Qob2Zmc2V0X3gsIG9mZnNldF95LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0QmFja2dyb3VuZFByZWZpeEZvclRpbGUodGlsZTogVGlsZSk6IHN0cmluZyB7XHJcbiAgICAgICAgc3dpdGNoICh0aWxlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Gb3Jlc3Q6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ3b29kc1wiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSGlsbDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImhpbGxcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLk1vdW50YWluOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwibW91bnRhaW5cIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLldhdGVyOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwid2F0ZXJcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkJyaWRnZTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcImJyaWRnZVwiO1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuSG91c2U6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5DYXN0bGU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ0b3duXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE5hbWVGb3JUaWxlKHRpbGU6IFRpbGUpOiBzdHJpbmcge1xyXG4gICAgICAgIHN3aXRjaCAodGlsZSkge1xyXG4gICAgICAgICAgICBjYXNlIFRpbGUuR3Jhc3M6XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5IaWxsOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuRm9yZXN0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiZ3Jhc3NcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLlBhdGg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJyb2FkXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5Nb3VudGFpbjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIm1vdW50YWluXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5XYXRlcjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIndhdGVyXCI7XHJcbiAgICAgICAgICAgIGNhc2UgVGlsZS5CcmlkZ2U6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJicmlkZ2VcIjtcclxuICAgICAgICAgICAgY2FzZSBUaWxlLkhvdXNlOlxyXG4gICAgICAgICAgICBjYXNlIFRpbGUuQ2FzdGxlOlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwidG93blwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIGNvbnN0cnVjdG9yKGdhbWU6IFBoYXNlci5HYW1lLCBhdHRhY2tlcjogRW50aXR5LCB0YXJnZXQ6IEVudGl0eSwgbWFwOiBNYXApIHtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MgPSBnYW1lLmFkZC5ncmFwaGljcygwLCAwKTtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBnYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuZml4ZWRUb0NhbWVyYSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcyA9IHRoaXMuZ3JvdXAuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5ncm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbl9tYXNrID0gZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCk7XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX21hc2suY2xlYXIoKTtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5maXhlZFRvQ2FtZXJhID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdGhpcy5ncm91cC5tYXNrID0gdGhpcy50cmFuc2l0aW9uX21hc2s7XHJcblxyXG4gICAgICAgIHRoaXMuYXR0YWNrZXIgPSBhdHRhY2tlcjtcclxuICAgICAgICB0aGlzLnRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uID0gU2NyZWVuVHJhbnNpdGlvbi5Ob25lO1xyXG4gICAgfVxyXG4gICAgc2hvdygpIHtcclxuICAgICAgICAvLyBzdGFydCB0cmFuc2l0aW9uXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzID0gMDtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLkhpZGU7XHJcbiAgICB9XHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGxldCBhdHRhY2tlcl90aWxlID0gdGhpcy5tYXAuZ2V0VGlsZUF0KHRoaXMuYXR0YWNrZXIucG9zaXRpb24pO1xyXG4gICAgICAgIGxldCB0YXJnZXRfdGlsZSA9IHRoaXMubWFwLmdldFRpbGVBdCh0aGlzLnRhcmdldC5wb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5kcmF3QmFja2dyb3VuZEhhbGYoYXR0YWNrZXJfdGlsZSwgMCk7XHJcbiAgICAgICAgdGhpcy5kcmF3QmFja2dyb3VuZEhhbGYodGFyZ2V0X3RpbGUsIDEpO1xyXG4gICAgICAgIHRoaXMuZ3JvdXAuYnJpbmdUb1RvcCh0aGlzLmNvbnRlbnRfZ3JhcGhpY3MpO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5iZWdpbkZpbGwoMHgwMDAwMDApO1xyXG4gICAgICAgIHRoaXMuY29udGVudF9ncmFwaGljcy5kcmF3UmVjdChNYXRoLmZsb29yKHRoaXMuZ3JvdXAuZ2FtZS53aWR0aCAvIDIpIC0gMSwgMCwgMiwgdGhpcy5ncm91cC5nYW1lLmhlaWdodCk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50X2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgIH1cclxuICAgIGRyYXdCYWNrZ3JvdW5kSGFsZih0aWxlOiBUaWxlLCBoYWxmOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgaGFsZl93aWR0aCA9IE1hdGguZmxvb3IodGhpcy5ncm91cC5nYW1lLndpZHRoIC8gMik7XHJcbiAgICAgICAgbGV0IGhhbGZfaGVpZ2h0ID0gdGhpcy5ncm91cC5nYW1lLmhlaWdodDtcclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSBoYWxmICogaGFsZl93aWR0aDtcclxuXHJcbiAgICAgICAgbGV0IGJnX2ltYWdlID0gQXR0YWNrU2NyZWVuLmdldEJhY2tncm91bmRQcmVmaXhGb3JUaWxlKHRpbGUpO1xyXG4gICAgICAgIGxldCBiZ19oZWlnaHQgPSAwO1xyXG4gICAgICAgIGlmIChiZ19pbWFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGJnX2hlaWdodCA9IDQ4O1xyXG4gICAgICAgICAgICBsZXQgYmdfdGlsZXNfeCA9IE1hdGguY2VpbChoYWxmX3dpZHRoIC8gKDIgKiA4OCkpO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJnX3RpbGVzX3g7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC5nYW1lLmFkZC5zcHJpdGUob2Zmc2V0X3ggKyBpICogODgsIDAsIGJnX2ltYWdlICsgXCJfYmdcIiwgMCwgdGhpcy5ncm91cCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IHRpbGVzX3ggPSBNYXRoLmNlaWwoaGFsZl93aWR0aCAvIDI0KTtcclxuICAgICAgICBsZXQgdGlsZXNfeSA9IE1hdGguY2VpbCgoaGFsZl9oZWlnaHQgLSBiZ19oZWlnaHQpIC8gMjQpO1xyXG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgdGlsZXNfeDsgeCsrKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGlsZXNfeTsgeSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmFuZCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKTtcclxuICAgICAgICAgICAgICAgIGxldCB2YXJpYW50ID0gcmFuZCA+PSA5ID8gMiA6IChyYW5kID49IDggPyAxIDogMCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VwLmdhbWUuYWRkLnNwcml0ZShvZmZzZXRfeCArIHggKiAyNCwgYmdfaGVpZ2h0ICsgeSAqIDI0LCBBdHRhY2tTY3JlZW4uZ2V0TmFtZUZvclRpbGUodGlsZSksIHZhcmlhbnQsIHRoaXMuZ3JvdXApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy50cmFuc2l0aW9uID09IFNjcmVlblRyYW5zaXRpb24uTm9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb24gPT0gU2NyZWVuVHJhbnNpdGlvbi5IaWRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLmJhY2tncm91bmRfZ3JhcGhpY3MuYmVnaW5GaWxsKDB4MDAwMDAwKTtcclxuICAgICAgICAgICAgQXR0YWNrU2NyZWVuLmRyYXdUcmFuc2l0aW9uKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcywgMzAsIHRoaXMuYmFja2dyb3VuZF9ncmFwaGljcywgdGhpcy5ncm91cC5nYW1lLndpZHRoLCB0aGlzLmdyb3VwLmdhbWUuaGVpZ2h0KTtcclxuICAgICAgICAgICAgdGhpcy5iYWNrZ3JvdW5kX2dyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5iZWdpbkZpbGwoKTtcclxuICAgICAgICAgICAgQXR0YWNrU2NyZWVuLmRyYXdUcmFuc2l0aW9uKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcywgMzAsIHRoaXMudHJhbnNpdGlvbl9tYXNrLCB0aGlzLmdyb3VwLmdhbWUud2lkdGgsIHRoaXMuZ3JvdXAuZ2FtZS5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25fbWFzay5lbmRGaWxsKCk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zaXRpb25fcHJvZ3Jlc3MgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gdHJhbnNpdGlvbiBtYXNrIG11c3QgaGF2ZSBhIGRyYXdSZWN0IGNhbGwgdG8gYmUgYSBtYXNrLCBvdGhlcndpc2UgZXZlcnl0aGluZyBpcyBzaG93blxyXG4gICAgICAgICAgICAgICAgdGhpcy5ncm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHJhbnNpdGlvbl9wcm9ncmVzcyA+PSAzMCkge1xyXG4gICAgICAgICAgICBsZXQgdHJhbnNpdGlvbiA9IHRoaXMudHJhbnNpdGlvbjtcclxuICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uID0gU2NyZWVuVHJhbnNpdGlvbi5Ob25lO1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zaXRpb25EaWRFbmQodHJhbnNpdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzKys7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSB0cmFuc2l0aW9uRGlkRW5kKHRyYW5zaXRpb246IFNjcmVlblRyYW5zaXRpb24pIHtcclxuICAgICAgICBpZiAodHJhbnNpdGlvbiA9PSBTY3JlZW5UcmFuc2l0aW9uLlNob3cpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGaW5pc2hlZFwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmRyYXcoKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2l0aW9uX3Byb2dyZXNzID0gMDtcclxuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBTY3JlZW5UcmFuc2l0aW9uLlNob3c7XHJcbiAgICB9XHJcbn1cclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
