var AEFont = (function () {
    function AEFont(x, y, text, group) {
        this.x = x;
        this.y = y;
        this.text = text;
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
                image = AncientEmpires.game.add.image(x, this.y, "");
            }
        }
    };
    return AEFont;
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
    MainMenu.prototype.preload = function () {
        this.game.load.spritesheet("tileset", "img/map.png", AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.game.load.atlasJSONHash("sprites", "img/test.png", "img/test.json");
        this.game.load.json("entities", "data/entities.json");
    };
    MainMenu.prototype.create = function () {
        AncientEmpires.ENTITIES = this.game.cache.getJSON("entities");
        Frame.game = this.game;
        this.loadMap("skirmish_island_cross");
    };
    MainMenu.prototype.loadMap = function (name) {
        this.game.state.start("Game", false, false, name);
    };
    MainMenu.prototype.loadComplete = function (file) {
        return;
    };
    MainMenu.prototype.update = function () {
        return;
    };
    return MainMenu;
}(Phaser.State));

var Pos = (function () {
    function Pos(x, y) {
        this.x = x;
        this.y = y;
    }
    Pos.prototype.match = function (p) {
        return (!!p && this.x == p.x && this.y == p.y);
    };
    Pos.prototype.copy = function (direction) {
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

var Sprite = (function () {
    function Sprite(position, group, frames) {
        this.worldPosition = position;
        this.frames = frames;
        this.currentFrame = 0;
        this.loadSprite();
        group.add(this.sprite);
    }
    Sprite.prototype.loadSprite = function () {
        this.sprite = Sprite.game.add.sprite(this.worldPosition.x, this.worldPosition.y, "sprites");
        this.sprite.frameName = this.frames.names[0];
    };
    Sprite.prototype.nextFrame = function () {
        if (this.frames.names.length > 1) {
            this.currentFrame++;
            if (this.currentFrame >= this.frames.names.length) {
                this.currentFrame = 0;
            }
            this.sprite.frameName = this.frames.names[this.currentFrame];
            return;
        }
        if (this.frames.ids.length > 1) {
            this.currentFrame++;
            if (this.currentFrame >= this.frames.ids.length) {
                this.currentFrame = 0;
            }
            this.sprite.frame = this.frames.ids[this.currentFrame];
        }
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
var EntityType;
(function (EntityType) {
    EntityType[EntityType["King"] = 0] = "King";
    EntityType[EntityType["Soldier"] = 1] = "Soldier";
    EntityType[EntityType["Archer"] = 2] = "Archer";
    EntityType[EntityType["Lizard"] = 3] = "Lizard";
    EntityType[EntityType["Wizard"] = 4] = "Wizard";
    EntityType[EntityType["Wisp"] = 5] = "Wisp";
    EntityType[EntityType["Spider"] = 6] = "Spider";
    EntityType[EntityType["Golem"] = 7] = "Golem";
    EntityType[EntityType["Catapult"] = 8] = "Catapult";
    EntityType[EntityType["Wyvern"] = 9] = "Wyvern";
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
    function Entity(alliance, type, position, health) {
        if (health === void 0) { health = 10; }
        _super.call(this, position.getWorldPosition(), Entity.group, { names: [], ids: [AncientEmpires.ENTITIES[type].tile + AncientEmpires.ENTITY_ALLIANCE_DIFF * (alliance - 1)] });
        this.atk_boost = 0;
        this.def_boost = 0;
        this.mov_boost = 0;
        this.data = AncientEmpires.ENTITIES[type];
        this.alliance = alliance;
        this.type = type;
        this.position = position;
        this.health = health;
        this.rank = 0;
        this.ep = 0;
        this.status = 0;
        this.state = EntityState.Ready;
    }
    Entity.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        Entity.animTimer += steps;
        if (Entity.animTimer >= 25) {
            Entity.animTimer = 0;
            for (var _i = 0, _a = Entity.all; _i < _a.length; _i++) {
                var entity = _a[_i];
                entity.nextFrame();
            }
        }
        if (!!Entity.moving) {
            Entity.moving.entity.update(steps);
        }
    };
    Entity.getEntityAt = function (position) {
        for (var _i = 0, _a = Entity.all; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.position.match(position)) {
                return entity;
            }
        }
        return null;
    };
    Entity.loadEntities = function (entities) {
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var start = entities_1[_i];
            Entity.all.push(new Entity(start.alliance, start.type, new Pos(start.x, start.y)));
        }
    };
    Entity.prototype.loadSprite = function () {
        this.sprite = Sprite.game.add.sprite(this.worldPosition.x, this.worldPosition.y, "tileset", this.frames.ids[0]);
    };
    Entity.prototype.nextFrame = function () {
        this.currentFrame = 1 - this.currentFrame;
        this.sprite.frame = this.frames.ids[0] + this.currentFrame;
    };
    Entity.prototype.didRankUp = function () {
        if (this.rank < 3 && this.ep >= 75 << this.rank) {
            this.ep = 0;
            this.rank++;
            return true;
        }
        return false;
    };
    Entity.prototype.attack = function (target) {
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
        var red_health = Math.floor((atk - (def + Entity.pathfinder.getDefAt(target.position, target)) * (2 / 3)) * this.health / 10);
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
    Entity.prototype.move = function (target, line) {
        this.sprite.bringToTop();
        Entity.moving = {
            entity: this,
            target: target,
            line: line,
            progress: 0
        };
    };
    Entity.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        if (Entity.moving.entity == this) {
            var current = Entity.moving.line[0];
            var diff = new Pos(0, 0).move(current.direction);
            Entity.moving.progress += steps;
            this.worldPosition.x = current.position.x * AncientEmpires.TILE_SIZE + diff.x * Entity.moving.progress;
            this.worldPosition.y = current.position.y * AncientEmpires.TILE_SIZE + diff.y * Entity.moving.progress;
            if (Entity.moving.progress >= current.length * AncientEmpires.TILE_SIZE) {
                Entity.moving.line.shift();
                Entity.moving.progress -= current.length * AncientEmpires.TILE_SIZE;
            }
            if (Entity.moving.line.length < 1) {
                // how to undo?
                this.position = Entity.moving.target;
                this.worldPosition.x = this.position.x * AncientEmpires.TILE_SIZE;
                this.worldPosition.y = this.position.y * AncientEmpires.TILE_SIZE;
                Entity.moving = null;
            }
            _super.prototype.update.call(this);
        }
    };
    Entity.animTimer = 0;
    return Entity;
}(Sprite));

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Smoke = (function (_super) {
    __extends(Smoke, _super);
    function Smoke(position) {
        _super.call(this, new Pos(position.x * AncientEmpires.TILE_SIZE + 16, position.y * AncientEmpires.TILE_SIZE), Smoke.group, { names: ["b_smoke/0", "b_smoke/1", "b_smoke/2", "b_smoke/3"], ids: [] });
        this.position = position;
    }
    Smoke.loadHouses = function (houses) {
        for (var _i = 0, houses_1 = houses; _i < houses_1.length; _i++) {
            var house = houses_1[_i];
            if (house.alliance == Alliance.None) {
                continue;
            }
            if (house.castle) {
                continue;
            }
            Smoke.addSmokeAt(house.position);
        }
    };
    Smoke.getSmokeAt = function (position) {
        for (var _i = 0, _a = Smoke.all; _i < _a.length; _i++) {
            var smoke = _a[_i];
            if (smoke.position.match(position)) {
                return smoke;
            }
            return null;
        }
    };
    Smoke.addSmokeAt = function (position) {
        var smoke = Smoke.getSmokeAt(position);
        if (!!smoke) {
            return false;
        }
        Smoke.all.push(new Smoke(position));
    };
    Smoke.removeSmokeAt = function (position) {
        for (var i = 0; i < Smoke.all.length; i++) {
            if (!Smoke.all[i].position.match(position)) {
                continue;
            }
            Smoke.all[i].destroy();
            Smoke.all.splice(i, 1);
            return true;
        }
        return false;
    };
    Smoke.update = function (steps) {
        Smoke.smokeTimer += steps;
        if (Smoke.smokeTimer < 5) {
            return;
        }
        Smoke.smokeTimer = 0;
        var nf = false;
        Smoke.offset += 1;
        if (Smoke.offset > 27) {
            Smoke.offset = 0;
            Smoke.group.visible = true;
        }
        else if (Smoke.offset > 22) {
            if (Smoke.frame == 3) {
                Smoke.group.visible = false;
                Smoke.frame = 0;
                nf = true;
            }
        }
        else if (Smoke.offset > 17) {
            if (Smoke.frame == 2) {
                Smoke.frame = 3;
                nf = true;
            }
        }
        else if (Smoke.offset > 12) {
            if (Smoke.frame == 1) {
                Smoke.frame = 2;
                nf = true;
            }
        }
        else if (Smoke.offset > 7) {
            if (Smoke.frame == 0) {
                Smoke.frame = 1;
                nf = true;
            }
        }
        for (var _i = 0, _a = Smoke.all; _i < _a.length; _i++) {
            var smoke = _a[_i];
            if (nf) {
                smoke.nextFrame();
            }
            smoke.update();
        }
    };
    Smoke.prototype.update = function (steps) {
        if (steps === void 0) { steps = 1; }
        this.worldPosition.y = this.position.y * AncientEmpires.TILE_SIZE - Smoke.offset - 2;
        _super.prototype.update.call(this);
    };
    Smoke.offset = 0;
    Smoke.frame = 0;
    Smoke.smokeTimer = 0;
    return Smoke;
}(Sprite));

/// <reference path="vendor/phaser.d.ts" />
var Tile;
(function (Tile) {
    Tile[Tile["Water"] = 0] = "Water";
    Tile[Tile["Bridge"] = 1] = "Bridge";
    Tile[Tile["Path"] = 2] = "Path";
    Tile[Tile["Grass"] = 3] = "Grass";
    Tile[Tile["Hill"] = 4] = "Hill";
    Tile[Tile["Forest"] = 5] = "Forest";
    Tile[Tile["Mountain"] = 6] = "Mountain";
    Tile[Tile["House"] = 7] = "House";
    Tile[Tile["Castle"] = 8] = "Castle";
})(Tile || (Tile = {}));
var Alliance;
(function (Alliance) {
    Alliance[Alliance["None"] = 0] = "None";
    Alliance[Alliance["Blue"] = 1] = "Blue";
    Alliance[Alliance["Red"] = 2] = "Red";
})(Alliance || (Alliance = {}));
var TintAnimation;
(function (TintAnimation) {
    TintAnimation[TintAnimation["None"] = 0] = "None";
    TintAnimation[TintAnimation["Increasing"] = 1] = "Increasing";
    TintAnimation[TintAnimation["Decreasing"] = 2] = "Decreasing";
})(TintAnimation || (TintAnimation = {}));
var TileManager = (function () {
    function TileManager(map, buildings, width, height) {
        this.waterState = 0;
        this.interactionLayerTintAnimation = TintAnimation.None;
        this.interactionLayerTintProgress = 100;
        this.waterTimer = 0;
        this.map = map;
        this.width = width;
        this.height = height;
        this.buildings = [];
        for (var _i = 0, buildings_1 = buildings; _i < buildings_1.length; _i++) {
            var building = buildings_1[_i];
            var pos = new Pos(building.x, building.y);
            this.buildings.push({ castle: this.getTileAt(pos) == Tile.Castle, position: pos, alliance: building.alliance });
        }
        this.backgroundLayer = TileManager.tileMap.create("background", this.width, this.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.backgroundLayer.resizeWorld();
        this.objectLayer = TileManager.tileMap.createBlankLayer("object", this.width, this.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.interactionLayer = TileManager.tileMap.createBlankLayer("interaction", this.width, this.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
    }
    TileManager.doesTileCutGrass = function (tile) {
        return (tile == Tile.Path || tile == Tile.Water || tile == Tile.Bridge);
    };
    TileManager.getIndexForForm = function (fbit) {
        if (fbit == 8 + 4 + 2 + 1) {
            return 15;
        }
        if (fbit == 8 + 4 + 1) {
            return 14;
        }
        if (fbit == 8 + 4 + 2) {
            return 13;
        }
        if (fbit == 4 + 2 + 1) {
            return 12;
        }
        if (fbit == 8 + 2 + 1) {
            return 11;
        }
        if (fbit == 1 + 8) {
            return 10;
        }
        if (fbit == 4 + 8) {
            return 9;
        }
        if (fbit == 2 + 4) {
            return 8;
        }
        if (fbit == 1 + 2) {
            return 7;
        }
        if (fbit == 1 + 4) {
            return 6;
        }
        if (fbit == 2 + 8) {
            return 5;
        }
        if (fbit == 8) {
            return 4;
        }
        if (fbit == 4) {
            return 3;
        }
        if (fbit == 2) {
            return 2;
        }
        if (fbit == 1) {
            return 1;
        }
        return 0;
    };
    TileManager.prototype.draw = function () {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
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
        if (this.interactionLayerTintAnimation != TintAnimation.None) {
            this.updateInteractionLayer(steps);
        }
    };
    TileManager.prototype.updateInteractionLayer = function (steps) {
        var value = this.interactionLayerTintProgress / 100 * 0xFF | 0;
        this.interactionLayer.tint = (value << 16) | (value << 8) | value;
        if (this.interactionLayerTintAnimation == TintAnimation.Increasing) {
            this.interactionLayerTintProgress += steps;
            if (this.interactionLayerTintProgress >= 100) {
                this.interactionLayerTintProgress = 100;
                this.interactionLayerTintAnimation = TintAnimation.Decreasing;
            }
        }
        else {
            this.interactionLayerTintProgress -= steps;
            if (this.interactionLayerTintProgress <= 40) {
                this.interactionLayerTintProgress = 40;
                this.interactionLayerTintAnimation = TintAnimation.Increasing;
            }
        }
    };
    TileManager.prototype.getTileAt = function (p) {
        return +this.map.charAt(p.y * this.width + p.x);
    };
    TileManager.prototype.getObjectAt = function (p) {
        switch (this.getTileAt(p)) {
            case 4:
                return 21;
            case 5:
                return 22;
            case 6:
                return 23;
            case 7:
                return 24;
            case 8:
                return 27;
        }
        return -1;
    };
    TileManager.prototype.updateWater = function () {
        var oldState = this.waterState;
        this.waterState = 1 - this.waterState;
        TileManager.tileMap.replace(oldState, this.waterState, 0, 0, this.width, this.height, this.backgroundLayer);
    };
    TileManager.prototype.drawTileAt = function (p) {
        TileManager.tileMap.putTile(this.getBackgroundAt(p), p.x, p.y, this.backgroundLayer);
        var tile = this.getTileAt(p);
        var obj = this.getObjectAt(p);
        if (obj >= 0) {
            if (tile == Tile.House || tile == Tile.Castle) {
                if (tile == Tile.Castle && p.y > 0) {
                    // Add roof to castle on above tile
                    TileManager.tileMap.putTile(30 + this.getAllianceAt(p), p.x, p.y - 1, this.objectLayer);
                }
                obj += this.getAllianceAt(p);
            }
            TileManager.tileMap.putTile(obj, p.x, p.y, this.objectLayer);
        }
    };
    TileManager.prototype.getBackgroundAt = function (p) {
        switch (this.getTileAt(p)) {
            case 0:
                // Water
                return 0;
            case 1:
                // Bridge
                var adj = this.getAdjacentTilesAt(p);
                if (adj[0] != Tile.Water || adj[2] != Tile.Water) {
                    return 3;
                }
                return 4;
            case 2:
                // Path
                return 2;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
                return this.getIndexForGrassAt(p);
        }
        return 2;
    };
    TileManager.prototype.getAdjacentPositionsAt = function (p) {
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
    TileManager.prototype.getAdjacentTilesAt = function (p) {
        return [
            p.y > 0 ? this.getTileAt(new Pos(p.x, p.y - 1)) : -1,
            p.x < this.width - 1 ? this.getTileAt(new Pos(p.x + 1, p.y)) : -1,
            p.y < this.height - 1 ? this.getTileAt(new Pos(p.x, p.y + 1)) : -1,
            p.x > 0 ? this.getTileAt(new Pos(p.x - 1, p.y)) : -1
        ];
    };
    TileManager.prototype.getIndexForGrassAt = function (p) {
        var adj = this.getAdjacentTilesAt(p);
        var cut = 0;
        for (var i = 0; i < adj.length; i++) {
            cut += Math.pow(2, i) * (TileManager.doesTileCutGrass(adj[i]) ? 1 : 0);
        }
        return 5 + TileManager.getIndexForForm(cut);
    };
    TileManager.prototype.showWalkRange = function (waypoints) {
        for (var _i = 0, waypoints_1 = waypoints; _i < waypoints_1.length; _i++) {
            var waypoint = waypoints_1[_i];
            TileManager.tileMap.putTile(33 + TileManager.getIndexForForm(waypoint.form), waypoint.position.x, waypoint.position.y, this.interactionLayer);
        }
        this.interactionLayerTintProgress = 100;
        this.interactionLayerTintAnimation = TintAnimation.Decreasing;
    };
    TileManager.prototype.hideWalkRange = function (waypoints) {
        this.interactionLayerTintAnimation = TintAnimation.None;
        for (var _i = 0, waypoints_2 = waypoints; _i < waypoints_2.length; _i++) {
            var waypoint = waypoints_2[_i];
            TileManager.tileMap.removeTile(waypoint.position.x, waypoint.position.y, this.interactionLayer);
        }
    };
    TileManager.prototype.getAllianceAt = function (p) {
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (p.match(building.position)) {
                return building.alliance;
            }
        }
        return Alliance.None;
    };
    TileManager.prototype.getOccupiedHouses = function () {
        var houses = [];
        for (var _i = 0, _a = this.buildings; _i < _a.length; _i++) {
            var building = _a[_i];
            if (!building.castle && building.alliance != Alliance.None) {
                houses.push(building);
            }
        }
        return houses;
    };
    return TileManager;
}());

var Pathfinder = (function () {
    function Pathfinder(tileManager) {
        this.tileManager = tileManager;
    }
    Pathfinder.findPositionInList = function (position, waypoints) {
        for (var _i = 0, waypoints_1 = waypoints; _i < waypoints_1.length; _i++) {
            var waypoint = waypoints_1[_i];
            if (waypoint.position.match(position)) {
                return waypoint;
            }
        }
        return null;
    };
    Pathfinder.getLineToWaypoint = function (waypoint) {
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
    Pathfinder.costForTile = function (tile, entity) {
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
    Pathfinder.getDefForTile = function (tile, entity) {
        if (tile == Tile.Mountain || tile == Tile.House || tile == Tile.Castle) {
            return 3;
        }
        if (tile == Tile.Forest || tile == Tile.Hill) {
            return 2;
        }
        if (tile == Tile.Water && entity.type == EntityType.Lizard) {
            return 2;
        }
        if (tile == Tile.Grass) {
            return 1;
        }
        return 0;
    };
    Pathfinder.prototype.getDefAt = function (position, entity) {
        return Pathfinder.getDefForTile(this.tileManager.getTileAt(position), entity);
    };
    Pathfinder.prototype.getReachableWaypointsForEntity = function (entity) {
        // cost for origin point is always 1
        var open = [{ position: entity.position, cost: 1, form: 0, parent: null }];
        var closed = [];
        while (open.length > 0) {
            var current = open.shift();
            closed.push(current);
            var adjacent_positions = this.tileManager.getAdjacentPositionsAt(current.position);
            for (var _i = 0, adjacent_positions_1 = adjacent_positions; _i < adjacent_positions_1.length; _i++) {
                var position = adjacent_positions_1[_i];
                this.checkPosition(position, current, open, closed, entity);
            }
        }
        this.addForm(closed);
        return closed;
    };
    Pathfinder.prototype.checkPosition = function (position, parent, open, closed, entity) {
        if (!!Pathfinder.findPositionInList(position, closed)) {
            return false;
        }
        var occupied = Entity.getEntityAt(position);
        if (!!occupied && occupied.alliance != entity.alliance) {
            return false;
        }
        var new_cost = parent.cost + Pathfinder.costForTile(this.tileManager.getTileAt(position), entity);
        if (new_cost > entity.data.mov) {
            return false;
        }
        var in_open = Pathfinder.findPositionInList(position, open);
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
    Pathfinder.prototype.checkAlready = function (pos, queue) {
        return null;
    };
    Pathfinder.prototype.addForm = function (waypoints) {
        for (var _i = 0, waypoints_2 = waypoints; _i < waypoints_2.length; _i++) {
            var waypoint = waypoints_2[_i];
            waypoint.form = 0;
            if (waypoint.position.y > 0 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Up), waypoints)) {
                waypoint.form += 1;
            }
            if (waypoint.position.x < this.tileManager.width - 1 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Right), waypoints)) {
                waypoint.form += 2;
            }
            if (waypoint.position.y < this.tileManager.height - 1 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Down), waypoints)) {
                waypoint.form += 4;
            }
            if (waypoint.position.x > 0 && !Pathfinder.findPositionInList(waypoint.position.copy(Direction.Left), waypoints)) {
                waypoint.form += 8;
            }
        }
    };
    return Pathfinder;
}());

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Direction;
(function (Direction) {
    Direction[Direction["None"] = 0] = "None";
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["Down"] = 4] = "Down";
    Direction[Direction["Left"] = 8] = "Left";
})(Direction || (Direction = {}));
var Cursor = (function (_super) {
    __extends(Cursor, _super);
    function Cursor(clickCallback, clickContext) {
        _super.call(this, new Pos(0, 0), Cursor.cursorGroup, { names: ["cursor/0", "cursor/1"], ids: [] });
        this.way = null;
        this.line = null;
        this.wayTimer = 0;
        this.clickCallback = clickCallback;
        this.clickContext = clickContext || this;
        this.graphics = Sprite.game.add.graphics(0, 0, Cursor.interactionGroup);
        Sprite.game.input.onDown.add(this.onDown, this);
    }
    Cursor.prototype.update = function (steps) {
        var pos = this.getActivePos();
        if (!pos.match(this.lastPos)) {
            this.lastPos = pos;
            this.worldPosition = pos.getWorldPosition();
            if (!!this.way) {
                if (this.updateLine(pos)) {
                    if (!this.moveCursor) {
                        this.moveCursor = new Sprite(this.worldPosition, Cursor.cursorGroup, { names: ["cursor/4"], ids: [] });
                    }
                    else {
                        this.moveCursor.worldPosition = this.worldPosition;
                    }
                    this.moveCursor.update(steps);
                }
            }
            _super.prototype.update.call(this, steps);
        }
        if (!!this.line) {
            this.wayTimer += steps;
            if (this.wayTimer <= 5) {
                return;
            }
            this.wayTimer = 0;
            this.graphics.clear();
            this.graphics.beginFill(0xffffff);
            var offset = Cursor.lineOffset;
            for (var _i = 0, _a = this.line; _i < _a.length; _i++) {
                var part = _a[_i];
                this.addSegmentsForLinePart(part, offset);
                offset = (offset + part.length * AncientEmpires.TILE_SIZE) % (AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING);
            }
            this.graphics.endFill();
            Cursor.lineOffset -= 1;
            if (Cursor.lineOffset < 0) {
                Cursor.lineOffset = AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING - 1;
            }
        }
    };
    Cursor.prototype.addSegmentsForLinePart = function (part, offset) {
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
                        this.graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y - length_1, AncientEmpires.LINE_SEGMENT_WIDTH, length_1);
                    }
                    y -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Right:
                    if (length_1 > 0) {
                        this.graphics.drawRect(x, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length_1, AncientEmpires.LINE_SEGMENT_WIDTH);
                    }
                    x += length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Down:
                    if (length_1 > 0) {
                        this.graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y, AncientEmpires.LINE_SEGMENT_WIDTH, length_1);
                    }
                    y += length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Left:
                    if (length_1 > 0) {
                        this.graphics.drawRect(x - length_1, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length_1, AncientEmpires.LINE_SEGMENT_WIDTH);
                    }
                    x -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
            }
            distance -= length_1 + AncientEmpires.LINE_SEGMENT_SPACING;
        }
    };
    Cursor.prototype.getActivePos = function () {
        // pos always inside canvas
        var x = Math.floor(Sprite.game.input.activePointer.x / AncientEmpires.TILE_SIZE);
        var y = Math.floor(Sprite.game.input.activePointer.y / AncientEmpires.TILE_SIZE);
        return new Pos(x, y);
    };
    Cursor.prototype.onDown = function () {
        // differentiate on what we clicked
        var pos = this.getActivePos();
        this.clickCallback.call(this.clickContext, pos);
    };
    Cursor.prototype.showWay = function (waypoints) {
        this.way = waypoints;
        this.updateLine(this.getActivePos());
    };
    Cursor.prototype.hideWay = function () {
        this.way = null;
        this.line = null;
        if (!!this.moveCursor) {
            this.moveCursor.destroy();
        }
        this.moveCursor = null;
        this.graphics.clear();
    };
    Cursor.prototype.updateLine = function (end) {
        var waypoint = Pathfinder.findPositionInList(end, this.way);
        if (!waypoint) {
            return false;
        } // end is not in range
        this.line = Pathfinder.getLineToWaypoint(waypoint);
        return true;
    };
    Cursor.lineOffset = 0;
    return Cursor;
}(Sprite));

var FrameAnimation;
(function (FrameAnimation) {
    FrameAnimation[FrameAnimation["None"] = 0] = "None";
    FrameAnimation[FrameAnimation["Show"] = 1] = "Show";
    FrameAnimation[FrameAnimation["Hide"] = 2] = "Hide";
    FrameAnimation[FrameAnimation["Change"] = 4] = "Change";
    FrameAnimation[FrameAnimation["Wire"] = 8] = "Wire";
})(FrameAnimation || (FrameAnimation = {}));
var Frame = (function () {
    function Frame(width, height, align, border, anim_dir) {
        this.fid = 0;
        this.reuse_tiles = [];
        this.align = align;
        this.animation_direction = !!anim_dir ? anim_dir : align;
        this.border = border;
        this.contentGroup = Frame.game.add.group();
        this.contentGroup.visible = false;
        this.borderGroup = Frame.game.add.group();
        this.borderGroup.visible = false;
        this.graphics = Frame.game.add.graphics(0, 0, this.borderGroup);
        this.animation = FrameAnimation.None;
        this.width = width;
        this.height = height;
    }
    Frame.getTileNameForDirection = function (dir) {
        // suffix of the tile name is already the int value of dir
        return "menu/" + dir;
    };
    Frame.add = function (width, height, align, border, anim_dir) {
        var frame = new Frame(width, height, align, border, anim_dir);
        frame.fid = Frame.fid;
        Frame.fid++;
        Frame.all.push(frame);
        return frame;
    };
    Frame.destroy = function (frame) {
        frame.destroy();
        for (var i = 0; i < Frame.all.length; i++) {
            if (Frame.all[i].fid === frame.fid) {
                Frame.all.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Frame.update = function (steps) {
        for (var _i = 0, _a = Frame.all; _i < _a.length; _i++) {
            var frame = _a[_i];
            frame.update(steps);
        }
    };
    Frame.getRect = function (x, y, width, height) {
        return { x: x, y: y, width: width, height: height };
    };
    Frame.copyRect = function (fr) {
        return { x: fr.x, y: fr.y, width: fr.width, height: fr.height };
    };
    Frame.prototype.getContentGroup = function () {
        return this.contentGroup;
    };
    Frame.prototype.show = function (animate) {
        if (animate === void 0) { animate = false; }
        this.target = Frame.getRect(0, 0, this.width, this.height);
        // calculate the offset using the alignment
        if ((this.align & Direction.Left) != 0) {
            this.target.x = 0;
        }
        else if ((this.align & Direction.Right) != 0) {
            this.target.x = Frame.game.width - this.target.width;
        }
        else {
            this.target.x = Math.floor((Frame.game.width - this.target.width) / 2);
        }
        if ((this.align & Direction.Up) != 0) {
            this.target.y = 0;
        }
        else if ((this.align & Direction.Down) != 0) {
            this.target.y = Frame.game.height - this.target.height;
        }
        else {
            this.target.y = Math.floor((Frame.game.height - this.target.height) / 2);
        }
        this.current = Frame.copyRect(this.target);
        if (animate) {
            // calculate starting offset using the anim_direction
            this.animation = FrameAnimation.Show;
            if ((this.animation_direction & Direction.Left) != 0) {
                this.current.x = -this.current.width;
            }
            if ((this.animation_direction & Direction.Right) != 0) {
                this.current.x = Frame.game.width;
            }
            if ((this.animation_direction & Direction.Up) != 0) {
                this.current.y = -this.current.height;
            }
            if ((this.animation_direction & Direction.Down) != 0) {
                this.current.y = Frame.game.height;
            }
            if (this.animation_direction == Direction.None) {
                this.animation |= FrameAnimation.Wire;
                this.current.x = Math.floor(Frame.game.width / 2);
                this.current.y = Math.floor(Frame.game.height / 2);
                this.current.width = 0;
                this.current.height = 0;
            }
            this.calculateSpeed();
        }
        this.updateOffset();
        if ((this.animation & FrameAnimation.Wire) == 0) {
            this.updateFrame(this.target.width, this.target.height);
            this.contentGroup.visible = true;
        }
        Frame.game.world.bringToTop(this.contentGroup);
        Frame.game.world.bringToTop(this.borderGroup);
        this.borderGroup.visible = true;
    };
    Frame.prototype.hide = function (animate) {
        if (animate === void 0) { animate = false; }
        if (!animate) {
            this.borderGroup.visible = false;
            this.contentGroup.visible = false;
            this.removeTiles();
            return;
        }
        // calculate the target position using the animation direction
        this.animation = FrameAnimation.Hide;
        this.target = Frame.copyRect(this.current);
        if ((this.animation_direction & Direction.Left) != 0) {
            this.target.x = -this.target.width;
        }
        if ((this.animation_direction & Direction.Right) != 0) {
            this.target.x = Frame.game.width;
        }
        if ((this.animation_direction & Direction.Up) != 0) {
            this.target.y = -this.target.height;
        }
        if ((this.animation_direction & Direction.Down) != 0) {
            this.target.y = Frame.game.height;
        }
        if (this.animation_direction == Direction.None) {
            this.animation |= FrameAnimation.Wire;
            this.removeTiles();
            this.target.x = Math.floor(Frame.game.width / 2);
            this.target.y = Math.floor(Frame.game.height / 2);
            this.target.width = 0;
            this.target.height = 0;
        }
        this.calculateSpeed();
    };
    Frame.prototype.updateSize = function (width, height, animate) {
        // fuck
        // adjust offset if alignment is top or left, so no difference at first notice
        if (animate === void 0) { animate = false; }
        this.width = width;
        this.height = height;
        if (animate) {
            this.animation = FrameAnimation.Change;
            if (this.animation_direction == Direction.None) {
                this.animation |= FrameAnimation.Wire;
            }
            else {
                // take the biggest rect possible
                width = Math.max(width, this.current.width);
                height = Math.max(height, this.current.height);
            }
        }
        // calculate the offset using the alignment
        if ((this.align & Direction.Left) != 0) {
            this.current.x -= width - this.current.width;
            this.target.x -= width - this.width;
        }
        else if ((this.align & Direction.Right) != 0) {
            this.target.x = Frame.game.width - this.width;
        }
        else {
            this.target.x = Math.floor((Frame.game.width - this.width) / 2);
        }
        if ((this.align & Direction.Up) != 0) {
            this.current.y -= height - this.current.height;
            this.target.y -= height - this.height;
        }
        else if ((this.align & Direction.Down) != 0) {
            this.target.y = Frame.game.height - this.height;
        }
        else {
            this.target.y = Math.floor((Frame.game.height - this.height) / 2);
        }
        if ((this.animation & FrameAnimation.Wire) == 0) {
            this.current.width = width;
            this.current.height = height;
        }
        this.target.width = width;
        this.target.height = height;
        console.log(width + " - " + height);
        console.log(this.current);
        console.log(this.target);
        if (animate) {
            this.calculateSpeed();
        }
        else {
            this.current.x = this.target.x;
            this.current.y = this.target.y;
        }
        this.updateOffset();
        if ((this.animation & FrameAnimation.Wire) == 0) {
            this.updateFrame(width, height);
        }
        else {
            this.removeTiles();
        }
    };
    Frame.prototype.update = function (steps) {
        if (this.animation == FrameAnimation.None) {
            return;
        }
        var finished_x = this.addGain("x", steps);
        var finished_y = this.addGain("y", steps);
        console.log((finished_x ? 1 : 0) + " - " + (finished_y ? 1 : 0));
        var finished_width = true;
        var finished_height = true;
        if ((this.animation & FrameAnimation.Wire) != 0) {
            // only change size with the wire animation
            finished_width = this.addGain("width", steps);
            finished_height = this.addGain("height", steps);
        }
        if (finished_x && finished_y && finished_width && finished_height) {
            console.log("finished");
            if ((this.animation & FrameAnimation.Wire) != 0) {
                this.graphics.clear();
                if ((this.animation & FrameAnimation.Hide) == 0) {
                    this.updateFrame(this.target.width, this.target.height);
                    this.contentGroup.visible = true;
                }
            }
            if ((this.animation & FrameAnimation.Change) != 0) {
                // TODO: remove tiles out of sight
                this.current.width = this.width;
                this.current.height = this.height;
                if ((this.align & Direction.Left) != 0) {
                    this.current.x = 0;
                }
                if ((this.align & Direction.Up) != 0) {
                    this.current.y = 0;
                }
                this.target = Frame.copyRect(this.current);
                this.updateOffset();
                this.updateFrame(this.width, this.height);
            }
            if ((this.animation & FrameAnimation.Hide) != 0) {
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
        this.contentGroup.destroy(true);
        this.borderGroup.destroy(true);
    };
    Frame.prototype.updateOffset = function () {
        var x = this.current.x;
        var y = this.current.y;
        var c_x = 0;
        var c_y = 0;
        if ((this.border & Direction.Left) != 0) {
            c_x += 6;
        }
        if ((this.border & Direction.Up) != 0) {
            c_y += 6;
        }
        this.borderGroup.x = x;
        this.borderGroup.y = y;
        this.contentGroup.x = c_x;
        this.contentGroup.y = c_y;
    };
    Frame.prototype.updateFrame = function (width, height) {
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
        this.contentGroup.width = c_width;
        this.contentGroup.height = c_height;
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
    Frame.prototype.drawBorderTile = function (x, y, direction) {
        var reuse;
        if (this.reuse_tiles.length > 0) {
            reuse = this.reuse_tiles.shift();
            reuse.bringToTop();
            reuse.x = x;
            reuse.y = y;
        }
        else {
            reuse = Frame.game.add.image(x, y, "sprites", null, this.borderGroup);
        }
        reuse.tint = 0xffffff * Math.random();
        reuse.frameName = Frame.getTileNameForDirection(direction);
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
    Frame.fid = 0;
    return Frame;
}());

var Dialog = (function () {
    function Dialog() {
    }
    Dialog.showMoney = function (alliance, gold) {
        var goldIcon;
        var goldAmount;
        if (!Dialog.frameMoney) {
            var frame = Frame.add(64, 40, Direction.Up | Direction.Right, Direction.Down | Direction.Left, Direction.Right);
            var contentGroup = frame.getContentGroup();
            var content = [];
            goldIcon = Dialog.game.add.sprite(0, 0, "sprites", null, contentGroup);
            goldIcon.frameName = "gold";
            content.push({ name: "icon", object: goldIcon });
            goldAmount = Dialog.game.add.bitmapText(35, 5, "aefont", null, null, contentGroup);
            Dialog.frameMoney = { frame: frame, content: content };
        }
        else {
            goldIcon = Dialog.getObjectFromFrameData("icon", Dialog.frameMoney);
            goldAmount = Dialog.getObjectFromFrameData("amount", Dialog.frameMoney);
        }
        goldAmount.text = gold.toString();
    };
    Dialog.getObjectFromFrameData = function (name, data) {
        for (var _i = 0, _a = data.content; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.name == name) {
                return obj.object;
            }
        }
        return null;
    };
    return Dialog;
}());

/// <reference path="vendor/phaser.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="ancientempires.ts" />
/// <reference path="util.ts" />
/// <reference path="sprite.ts" />
/// <reference path="entity.ts" />
/// <reference path="smoke.ts" />
/// <reference path="tilemanager.ts" />
/// <reference path="pathfinder.ts" />
/// <reference path="cursor.ts" />
/// <reference path="frame.ts" />
/// <reference path="dialog.ts" />
var GameController = (function (_super) {
    __extends(GameController, _super);
    function GameController() {
        _super.call(this);
        this.selected = null;
        this.anim_state = 0;
        this.acc = 0;
    }
    GameController.prototype.init = function (name) {
        this.mapName = name;
    };
    GameController.prototype.preload = function () {
        this.game.load.json("map", "data/" + this.mapName + ".json");
    };
    GameController.prototype.create = function () {
        Sprite.game = this.game;
        TileManager.game = this.game;
        Frame.game = this.game;
        Dialog.game = this.game;
        this.data = this.game.cache.getJSON("map");
        this.data.map = this.data.map.replace(/\s/g, "");
        this.turn = this.data.start.turn || Alliance.Blue;
        TileManager.tileMap = this.game.add.tilemap();
        TileManager.tileMap.addTilesetImage("tileset", null, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.tileManager = new TileManager(this.data.map, this.data.start.buildings, this.data.size, this.data.size);
        this.pathfinder = new Pathfinder(this.tileManager);
        Cursor.interactionGroup = this.game.add.group();
        Smoke.all = [];
        Smoke.group = this.game.add.group();
        Smoke.loadHouses(this.tileManager.getOccupiedHouses());
        Entity.all = [];
        Entity.group = this.game.add.group();
        Entity.pathfinder = this.pathfinder;
        Entity.loadEntities(this.data.start.entities);
        Frame.all = [];
        Cursor.cursorGroup = this.game.add.group();
        this.cursor = new Cursor(this.click, this);
        this.tileManager.draw();
    };
    GameController.prototype.click = function (position) {
        var prev_selected = this.selected;
        var entity = Entity.getEntityAt(position);
        if (this.selected) {
            if (!entity && Pathfinder.findPositionInList(position, this.activeWaypoints) != null) {
                // we are able to walk there
                console.log("walk to: " + position.getInfo());
                var waypoint = Pathfinder.findPositionInList(position, this.activeWaypoints);
                this.selected.move(position, Pathfinder.getLineToWaypoint(waypoint));
            }
            this.deselectEntity();
        }
        if (!!entity && entity.alliance == this.turn && (!prev_selected || !position.match(prev_selected.position))) {
            this.selectEntity(entity);
        }
    };
    GameController.prototype.selectEntity = function (entity) {
        console.log("selected entity: " + entity.getInfo());
        this.selected = entity;
        var waypoints = this.pathfinder.getReachableWaypointsForEntity(entity);
        this.activeWaypoints = waypoints;
        this.tileManager.showWalkRange(waypoints);
        this.cursor.showWay(waypoints);
    };
    GameController.prototype.deselectEntity = function () {
        this.tileManager.hideWalkRange(this.activeWaypoints);
        this.cursor.hideWay();
        this.activeWaypoints = null;
        this.selected = null;
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
        Entity.update(steps);
        this.cursor.update(steps);
        Smoke.update(steps);
        this.tileManager.update(steps);
        Frame.update(steps);
    };
    return GameController;
}(Phaser.State));

/// <reference path="vendor/phaser.d.ts" />
/// <reference path="mainmenu.ts" />
/// <reference path="gamecontroller.ts" />
var AncientEmpires = (function () {
    function AncientEmpires(div_id) {
        this.width = 360;
        this.height = 360;
        AncientEmpires.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, div_id, this);
        this.mainMenu = new MainMenu();
        this.controller = new GameController();
        AncientEmpires.game.state.add("MainMenu", this.mainMenu);
        AncientEmpires.game.state.add("Game", this.controller);
        AncientEmpires.game.state.start("MainMenu");
    }
    AncientEmpires.TILE_SIZE = 24;
    AncientEmpires.WATER_INTERVAL_MS = 400;
    AncientEmpires.ANIM_INT = 250;
    AncientEmpires.ENTITY_ALLIANCE_DIFF = 22;
    AncientEmpires.LINE_SEGMENT_LENGTH = 10;
    AncientEmpires.LINE_SEGMENT_WIDTH = 4;
    AncientEmpires.LINE_SEGMENT_SPACING = 2;
    return AncientEmpires;
}());
window.onload = function () {
    new AncientEmpires("content");
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFlZm9udC50cyIsIm1haW5tZW51LnRzIiwidXRpbC50cyIsInNwcml0ZS50cyIsImVudGl0eS50cyIsInNtb2tlLnRzIiwidGlsZW1hbmFnZXIudHMiLCJwYXRoZmluZGVyLnRzIiwiY3Vyc29yLnRzIiwiZnJhbWUudHMiLCJkaWFsb2cudHMiLCJnYW1lY29udHJvbGxlci50cyIsImFuY2llbnRlbXBpcmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0lBc0JJLGdCQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsSUFBWSxFQUFFLEtBQW1CO1FBQy9ELElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ1gsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDWCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEIsQ0FBQztJQXZCTSxtQkFBWSxHQUFuQixVQUFvQixJQUFZO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXO1FBQzFCLENBQUM7UUFBQSxJQUFJ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Q0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNoQixHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBQUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDakIsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFRCxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRTdDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBRWpELEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ1QsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEIsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNiLENBQUM7UUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNqQixHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUFBLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pCLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDYixDQUFDO1FBRUQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEdB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SUFDTSwyQkFBZSxHQUF0QixVQUF1QixJQUFZO1FBQy9CLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUFDLENBQUM7UUFDekMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFBQyxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsRUFBRSxDQUFDO1FBQUMsQ0FBQztRQUNyQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUFDLENBQUM7UUFDckMsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFBQyxDQUFDO1FBQ3JDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFBQyxDQUFDO1FBQ2pDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDNUIsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUM1QixFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQzVCLEVBQUUsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDNUIsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFvQkQsMEJBQUksR0FBSjtRQUNJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ25DLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNsQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxD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LElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUNqRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFBQyxDQUFDO1FBQzlELEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFDL0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFakQsTUFBTSxDQUFDLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFDRCx3Q0FBa0IsR0FBbEIsVUFBbUIsQ0FBTTtRQUVyQixNQUFNLENBQUM7WUFDSCxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRCxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFL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QUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztZQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QyxDQUFDO1FBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ2xELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDcEUsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDL0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUMsQ0FBQztRQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNwRCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNqQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQzFCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUU1QixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDcEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFekIsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsQ0FBQztJQUVMLENBQUM7SUFDRCxzQkFBTSxHQUFOLFVBQU8sS0FBYTtRQUVoQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLE1BQU0sQ0FBQztRQUNYLENBQUM7UUFFRCxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUxQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFakUsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzFCLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQztRQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUMsMkNBQTJDO1lBQzNDLGNBQWMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QyxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELEVBQUUsQ0FBQyxDQUFDLFVBQVUsSUFBSSxVQUFVLElBQUksY0FBYyxJQUFJLGVBQWUsQ0FBQyxDQUFDLENBQUM7WUFDaEUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN4QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3RCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN4RCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ3JDLENBQUM7WUFDTCxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxrQ0FBa0M7Z0JBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2dCQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QixDQUFDO2dCQUNELElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQztRQUN6QyxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlDLHNFQUFzRTtZQUN0RSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0QsdUJBQU8sR0FBUDtRQUNJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFDTyw0QkFBWSxHQUFwQjtRQUNJLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRXZCLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztRQUNaLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUVELElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO1FBQzFCLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztJQUM5QixDQUFDO0lBQ08sMkJBQVcsR0FBbkIsVUFBb0IsS0FBYSxFQUFFLE1BQWM7UUFFN0MsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQztRQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsT0FBTyxJQUFJLENBQUMsQ0FBQztRQUNqQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLENBQUM7UUFDakIsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwQyxRQUFRLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUM7UUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsUUFBUSxJQUFJLENBQUMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztRQUVwQyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFN0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRXhCLElBQUksS0FBSyxHQUFtQixFQUFFLENBQUM7UUFFL0IsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNqQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9ELENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFDRCxRQUFRLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQyxDQUFDO1FBRUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNqQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFlBQVksRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3BDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLENBQUM7WUFDRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUNoQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQzFGLENBQUM7WUFDRCxRQUFRLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQztRQUNsQyxDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4RCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEgsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN6RCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEgsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxRCxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3SSxDQUFDO1FBRUQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzdCLENBQUM7SUFDTyw4QkFBYyxHQUF0QixVQUF1QixDQUFTLEVBQUUsQ0FBUyxFQUFFLFNBQW9CO1FBQzdELElBQUksS0FBbUIsQ0FBQztRQUV4QixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2pDLEtBQUssQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUNuQixLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNaLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQ0QsS0FBSyxDQUFDLElBQUksR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3RDLEtBQUssQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUNPLHVCQUFPLEdBQWYsVUFBZ0IsUUFBZ0IsRUFBRSxLQUFhO1FBQzNDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFBQyxDQUFDO1FBRS9DLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFLLENBQUM7UUFFbkQsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFBQSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFDTyw4QkFBYyxHQUF0QjtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pRLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBQ08sMkJBQVcsR0FBbkI7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ2pDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ25CLENBQUM7SUFDTCxDQUFDO0lBemFNLGlCQUFXLEdBQVcsRUFBRSxDQUFDO0lBQ3pCLGdCQUFVLEdBQVcsRUFBRSxDQUFDO0lBRXhCLFNBQUcsR0FBVyxDQUFDLENBQUM7SUF1YTNCLFlBQUM7QUFBRCxDQTVhQSxBQTRhQyxJQUFBOztBQ2piRDtJQUFBO0lBeUNBLENBQUM7SUFuQ1UsZ0JBQVMsR0FBaEIsVUFBaUIsUUFBa0IsRUFBRSxJQUFZO1FBRTdDLElBQUksUUFBc0IsQ0FBQztRQUMzQixJQUFJLFVBQTZCLENBQUM7UUFFbEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztZQUVyQixJQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEgsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzNDLElBQUksT0FBTyxHQUFtQixFQUFFLENBQUM7WUFFakMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDdkUsUUFBUSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUM7WUFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7WUFFL0MsVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBRW5GLE1BQU0sQ0FBQyxVQUFVLEdBQUcsRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQztRQUN6RCxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixRQUFRLEdBQUcsTUFBTSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDcEUsVUFBVSxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzVFLENBQUM7UUFFRCxVQUFVLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUV0QyxDQUFDO0lBQ00sNkJBQXNCLEdBQTdCLFVBQThCLElBQVksRUFBRSxJQUFlO1FBQ3ZELEdBQUcsQ0FBQyxDQUFZLFVBQVksRUFBWixLQUFBLElBQUksQ0FBQyxPQUFPLEVBQVosY0FBWSxFQUFaLElBQVksQ0FBQztZQUF4QixJQUFJLEdBQUcsU0FBQTtZQUNSLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUM7WUFDdEIsQ0FBQztTQUNKO1FBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUwsYUFBQztBQUFELENBekNBLEFBeUNDLElBQUE7O0FDbERELDJDQUEyQzs7Ozs7O0FBRTNDLDBDQUEwQztBQUMxQyxnQ0FBZ0M7QUFDaEMsa0NBQWtDO0FBQ2xDLGtDQUFrQztBQUNsQyxpQ0FBaUM7QUFDakMsdUNBQXVDO0FBQ3ZDLHNDQUFzQztBQUN0QyxrQ0FBa0M7QUFDbEMsaUNBQWlDO0FBQ2pDLGtDQUFrQztBQWVsQztJQUE2QixrQ0FBWTtJQWtCckM7UUFDSSxpQkFBTyxDQUFDO1FBVFosYUFBUSxHQUFXLElBQUksQ0FBQztRQUt4QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBQ3ZCLFFBQUcsR0FBVyxDQUFDLENBQUM7SUFJaEIsQ0FBQztJQUVELDZCQUFJLEdBQUosVUFBSyxJQUFZO1FBQ2IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUNELGdDQUFPLEdBQVA7UUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFDRCwrQkFBTSxHQUFOO1FBRUksTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3hCLFdBQVcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUM3QixLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdkIsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBRXhCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQztRQUVsRCxXQUFXLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzlDLFdBQVcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFekcsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3RyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUVuRCxNQUFNLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFaEQsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDZixLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7UUFFdkQsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDaEIsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNyQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDcEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUU5QyxLQUFLLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUVmLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTNDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUNELDhCQUFLLEdBQUwsVUFBTSxRQUFhO1FBRWYsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNsQyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRTFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLDRCQUE0QjtnQkFDNUIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7Z0JBQzlDLElBQUksUUFBUSxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUM3RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDekUsQ0FBQztZQUNELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUMxQixDQUFDO1FBRUQsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLGFBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsQ0FBQztJQUVMLENBQUM7SUFDRCxxQ0FBWSxHQUFaLFVBQWEsTUFBYztRQUV2QixPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBRXBELElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLGVBQWUsR0FBRyxTQUFTLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUNELHVDQUFjLEdBQWQ7UUFDSSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztJQUN6QixDQUFDO0lBQ0QsK0JBQU0sR0FBTjtRQUNJLHFCQUFxQjtRQUVyQixJQUFJLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0QyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQztRQUFDLENBQUM7UUFDM0IsSUFBSSxDQUFDLEdBQUcsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUFDLENBQUM7UUFFN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxQixLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQy9CLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDeEIsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FsSEEsQUFrSEMsQ0FsSDRCLE1BQU0sQ0FBQyxLQUFLLEdBa0h4Qzs7QUM1SUQsMkNBQTJDO0FBQzNDLG9DQUFvQztBQUNwQywwQ0FBMEM7QUFFMUM7SUFtQkksd0JBQVksTUFBYztRQUgxQixVQUFLLEdBQVcsR0FBRyxDQUFDO1FBQ3BCLFdBQU0sR0FBWSxHQUFHLENBQUM7UUFHbEIsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzFGLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFFdkMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDekQsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdkQsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRWhELENBQUM7SUEzQk0sd0JBQVMsR0FBVyxFQUFFLENBQUM7SUFDdkIsZ0NBQWlCLEdBQVcsR0FBRyxDQUFDO0lBQ2hDLHVCQUFRLEdBQVcsR0FBRyxDQUFDO0lBRXZCLG1DQUFvQixHQUFHLEVBQUUsQ0FBQztJQUUxQixrQ0FBbUIsR0FBRyxFQUFFLENBQUM7SUFDekIsaUNBQWtCLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLG1DQUFvQixHQUFHLENBQUMsQ0FBQztJQXNCcEMscUJBQUM7QUFBRCxDQWhDQSxBQWdDQyxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUNaLElBQUksY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQUVGb250IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIHRleHQ6IHN0cmluZztcclxuICAgIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBsZXR0ZXJzOiBQaGFzZXIuSW1hZ2VbXTtcclxuICAgIHN0YXRpYyBnZXRGb250SW5kZXgoY2hhcjogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoY2hhciA+PSA2NSAmJiBjaGFyIDwgOTApIHsgLy8gY2FwaXRhbCBsZXR0ZXJzIHdpdGhvdXQgWlxyXG4gICAgICAgICAgICByZXR1cm4gY2hhciAtIDY1O1xyXG4gICAgICAgIH1lbHNlIGlmIChjaGFyID49IDQ5ICYmIGNoYXIgPD0gNTcpIHsgLy8gYWxsIG51bWJlcnMgd2l0aG91dCAwXHJcbiAgICAgICAgICAgIHJldHVybiBjaGFyIC0gNDkgKyAyNztcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0OCkgeyAvLyAwXHJcbiAgICAgICAgICAgIHJldHVybiAxNDsgLy8gcmV0dXJuIE9cclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0NSkgeyAvLyAtXHJcbiAgICAgICAgICAgIHJldHVybiAyNTtcclxuICAgICAgICB9ZWxzZSBpZiAoY2hhciA9PSA0MykgeyAvLyArXHJcbiAgICAgICAgICAgIHJldHVybiAyNjtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRG9uJ3QgcmVjb2duaXplIGNoYXIgY29kZSBcIiArIGNoYXIpO1xyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgdGV4dDogc3RyaW5nLCBncm91cDogUGhhc2VyLkdyb3VwKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMudGV4dCA9IHRleHQ7XHJcbiAgICAgICAgdGhpcy5ncm91cCA9IGdyb3VwO1xyXG4gICAgICAgIHRoaXMubGV0dGVycyA9IFtdO1xyXG4gICAgICAgIHRoaXMuZHJhdygpO1xyXG4gICAgfVxyXG4gICAgZHJhdygpIHtcclxuICAgICAgICBsZXQgbDogUGhhc2VyLkltYWdlW10gPSBbXTtcclxuICAgICAgICBsZXQgeCA9IHRoaXMueDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudGV4dC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY2hhciA9IHRoaXMudGV4dC5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgICAgICBsZXQgaW5kZXggPSBBRUZvbnQuZ2V0Rm9udEluZGV4KGNoYXIpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGltYWdlOiBQaGFzZXIuSW1hZ2U7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxldHRlcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSB0aGlzLmxldHRlcnMuc2hpZnQoKTtcclxuICAgICAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBBbmNpZW50RW1waXJlcy5nYW1lLmFkZC5pbWFnZSh4LCB0aGlzLnksIFwiXCIpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJhbmNpZW50ZW1waXJlcy50c1wiIC8+XHJcbmNsYXNzIE1haW5NZW51IGV4dGVuZHMgUGhhc2VyLlN0YXRlIHtcclxuXHJcbiAgICBjb25zdHJ1Y3RvciAoKSB7XHJcbiAgICAgICAgc3VwZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwcmVsb2FkICgpIHtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5zcHJpdGVzaGVldChcInRpbGVzZXRcIiwgXCJpbWcvbWFwLnBuZ1wiLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICAgICAgdGhpcy5nYW1lLmxvYWQuYXRsYXNKU09OSGFzaChcInNwcml0ZXNcIiwgXCJpbWcvdGVzdC5wbmdcIiwgXCJpbWcvdGVzdC5qc29uXCIpO1xyXG4gICAgICAgIHRoaXMuZ2FtZS5sb2FkLmpzb24oXCJlbnRpdGllc1wiLCBcImRhdGEvZW50aXRpZXMuanNvblwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGUgKCkge1xyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLkVOVElUSUVTID0gdGhpcy5nYW1lLmNhY2hlLmdldEpTT04oXCJlbnRpdGllc1wiKTtcclxuXHJcbiAgICAgICAgRnJhbWUuZ2FtZSA9IHRoaXMuZ2FtZTtcclxuXHJcbiAgICAgICAgdGhpcy5sb2FkTWFwKFwic2tpcm1pc2hfaXNsYW5kX2Nyb3NzXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIGxvYWRNYXAgKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuZ2FtZS5zdGF0ZS5zdGFydChcIkdhbWVcIiwgZmFsc2UsIGZhbHNlLCBuYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBsb2FkQ29tcGxldGUgKGZpbGU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG59XHJcbiIsImNsYXNzIFBvcyB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgIH1cclxuICAgIG1hdGNoKHA6IFBvcykge1xyXG4gICAgICAgIHJldHVybiAoISFwICYmIHRoaXMueCA9PSBwLnggJiYgdGhpcy55ID09IHAueSk7XHJcbiAgICB9XHJcbiAgICBjb3B5KGRpcmVjdGlvbjogRGlyZWN0aW9uKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55IC0gMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQb3ModGhpcy54ICsgMSwgdGhpcy55KTtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgUG9zKHRoaXMueCwgdGhpcy55ICsgMSk7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggLSAxLCB0aGlzLnkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLngsIHRoaXMueSk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKGRpcmVjdGlvbjogRGlyZWN0aW9uKTogUG9zIHtcclxuICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5VcDpcclxuICAgICAgICAgICAgICAgIHRoaXMueS0tO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlJpZ2h0OlxyXG4gICAgICAgICAgICAgICAgdGhpcy54Kys7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgIHRoaXMueSsrO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLkxlZnQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLngtLTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxuXHJcbiAgICBnZXREaXJlY3Rpb25UbyAocDogUG9zKTogRGlyZWN0aW9uIHtcclxuICAgICAgICBpZiAocC54ID4gdGhpcy54KSB7IHJldHVybiBEaXJlY3Rpb24uUmlnaHQ7IH1cclxuICAgICAgICBpZiAocC54IDwgdGhpcy54KSB7IHJldHVybiBEaXJlY3Rpb24uTGVmdDsgfVxyXG4gICAgICAgIGlmIChwLnkgPiB0aGlzLnkpIHsgcmV0dXJuIERpcmVjdGlvbi5Eb3duOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMueSkgeyByZXR1cm4gRGlyZWN0aW9uLlVwOyB9XHJcbiAgICAgICAgcmV0dXJuIERpcmVjdGlvbi5Ob25lO1xyXG4gICAgfVxyXG4gICAgZ2V0V29ybGRQb3NpdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh0aGlzLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUsIHRoaXMueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSk7XHJcbiAgICB9XHJcbiAgICBnZXRJbmZvKCkge1xyXG4gICAgICAgIHJldHVybiBcInt4OiBcIiArIHRoaXMueCArIFwiLCB5OiBcIiArIHRoaXMueSArIFwifVwiO1xyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBTcHJpdGVGcmFtZXMge1xyXG4gICAgbmFtZXM6IHN0cmluZ1tdO1xyXG4gICAgaWRzOiBudW1iZXJbXTtcclxufVxyXG5jbGFzcyBTcHJpdGUge1xyXG5cclxuICAgIHN0YXRpYyBnYW1lOiBQaGFzZXIuR2FtZTtcclxuXHJcbiAgICBmcmFtZXM6IFNwcml0ZUZyYW1lcztcclxuICAgIGN1cnJlbnRGcmFtZTogbnVtYmVyO1xyXG5cclxuICAgIHNwcml0ZTogUGhhc2VyLlNwcml0ZTtcclxuICAgIHdvcmxkUG9zaXRpb246IFBvcztcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogUG9zLCBncm91cDogUGhhc2VyLkdyb3VwLCBmcmFtZXM6IFNwcml0ZUZyYW1lcykge1xyXG5cclxuICAgICAgICB0aGlzLndvcmxkUG9zaXRpb24gPSBwb3NpdGlvbjtcclxuICAgICAgICB0aGlzLmZyYW1lcyA9IGZyYW1lcztcclxuXHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xyXG4gICAgICAgIHRoaXMubG9hZFNwcml0ZSgpO1xyXG5cclxuICAgICAgICBncm91cC5hZGQodGhpcy5zcHJpdGUpO1xyXG5cclxuICAgIH1cclxuICAgIGxvYWRTcHJpdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBTcHJpdGUuZ2FtZS5hZGQuc3ByaXRlKHRoaXMud29ybGRQb3NpdGlvbi54LCB0aGlzLndvcmxkUG9zaXRpb24ueSwgXCJzcHJpdGVzXCIpO1xyXG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lTmFtZSA9IHRoaXMuZnJhbWVzLm5hbWVzWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIG5leHRGcmFtZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5mcmFtZXMubmFtZXMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZSsrO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50RnJhbWUgPj0gdGhpcy5mcmFtZXMubmFtZXMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWVOYW1lID0gdGhpcy5mcmFtZXMubmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmZyYW1lcy5pZHMubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRGcmFtZSsrO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50RnJhbWUgPj0gdGhpcy5mcmFtZXMuaWRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lID0gdGhpcy5mcmFtZXMuaWRzW3RoaXMuY3VycmVudEZyYW1lXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoc3RlcHM6IG51bWJlciA9IDEpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdGhpcy53b3JsZFBvc2l0aW9uLng7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUueSA9IHRoaXMud29ybGRQb3NpdGlvbi55O1xyXG4gICAgfVxyXG4gICAgZGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLnNwcml0ZS5kZXN0cm95KCk7XHJcbiAgICB9XHJcbn1cclxuIiwiaW50ZXJmYWNlIEVudGl0eURhdGEge1xyXG4gICAgbmFtZTogc3RyaW5nO1xyXG4gICAgY29zdDogbnVtYmVyO1xyXG4gICAgYXRrOiBudW1iZXI7XHJcbiAgICBkZWY6IG51bWJlcjtcclxuICAgIG1vdjogbnVtYmVyO1xyXG4gICAgbWluOiBudW1iZXI7XHJcbiAgICBtYXg6IG51bWJlcjtcclxuICAgIHRpbGU6IG51bWJlcjtcclxuICAgIGRlc2M6IHN0cmluZztcclxufVxyXG5pbnRlcmZhY2UgRW50aXR5U3RhcnQge1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxufVxyXG5pbnRlcmZhY2UgRW50aXR5UGF0aCB7XHJcbiAgICBlbnRpdHk6IEVudGl0eTtcclxuICAgIHRhcmdldDogUG9zO1xyXG4gICAgbGluZTogTGluZVBhcnRbXTtcclxuICAgIHByb2dyZXNzOiBudW1iZXI7XHJcbn1cclxuZW51bSBFbnRpdHlUeXBlIHtcclxuICAgIEtpbmcsXHJcbiAgICBTb2xkaWVyLFxyXG4gICAgQXJjaGVyLFxyXG4gICAgTGl6YXJkLFxyXG4gICAgV2l6YXJkLFxyXG4gICAgV2lzcCxcclxuICAgIFNwaWRlcixcclxuICAgIEdvbGVtLFxyXG4gICAgQ2F0YXB1bHQsXHJcbiAgICBXeXZlcm4sXHJcbiAgICBTa2VsZXRvblxyXG59XHJcbmVudW0gRW50aXR5U3RhdHVzIHtcclxuICAgIE5vbmUgPSAwLFxyXG4gICAgUG9pc29uZWQgPSAxIDw8IDAsXHJcbiAgICBXaXNwZWQgPSAxIDw8IDFcclxufVxyXG5lbnVtIEVudGl0eVN0YXRlIHtcclxuICAgIFJlYWR5ID0gMCxcclxuICAgIE1vdmVkID0gMSxcclxuICAgIERlYWQgPSAyXHJcbn1cclxuXHJcbmNsYXNzIEVudGl0eSBleHRlbmRzIFNwcml0ZSB7XHJcblxyXG4gICAgc3RhdGljIGFuaW1UaW1lcjogbnVtYmVyID0gMDtcclxuICAgIHN0YXRpYyBhbGw6IEVudGl0eVtdO1xyXG4gICAgc3RhdGljIGdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBzdGF0aWMgcGF0aGZpbmRlcjogUGF0aGZpbmRlcjtcclxuICAgIHN0YXRpYyBtb3Zpbmc6IEVudGl0eVBhdGg7XHJcblxyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG4gICAgdHlwZTogRW50aXR5VHlwZTtcclxuICAgIHBvc2l0aW9uOiBQb3M7XHJcbiAgICBkYXRhOiBFbnRpdHlEYXRhO1xyXG5cclxuICAgIGhlYWx0aDogbnVtYmVyO1xyXG4gICAgcmFuazogbnVtYmVyO1xyXG4gICAgZXA6IG51bWJlcjtcclxuXHJcbiAgICBzdGF0dXM6IEVudGl0eVN0YXR1cztcclxuICAgIHN0YXRlOiBFbnRpdHlTdGF0ZTtcclxuXHJcbiAgICBhdGtfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBkZWZfYm9vc3Q6IG51bWJlciA9IDA7XHJcbiAgICBtb3ZfYm9vc3Q6IG51bWJlciA9IDA7XHJcblxyXG4gICAgc3RhdGljIHVwZGF0ZShzdGVwczogbnVtYmVyID0gMSkge1xyXG4gICAgICAgIEVudGl0eS5hbmltVGltZXIgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKEVudGl0eS5hbmltVGltZXIgPj0gMjUpIHtcclxuICAgICAgICAgICAgRW50aXR5LmFuaW1UaW1lciA9IDA7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGVudGl0eSBvZiBFbnRpdHkuYWxsKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkubmV4dEZyYW1lKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEhRW50aXR5Lm1vdmluZykge1xyXG4gICAgICAgICAgICBFbnRpdHkubW92aW5nLmVudGl0eS51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRFbnRpdHlBdChwb3NpdGlvbjogUG9zKTogRW50aXR5IHtcclxuICAgICAgICBmb3IgKGxldCBlbnRpdHkgb2YgRW50aXR5LmFsbCl7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGxvYWRFbnRpdGllcyhlbnRpdGllczogRW50aXR5U3RhcnRbXSkge1xyXG4gICAgICAgIGZvciAobGV0IHN0YXJ0IG9mIGVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIEVudGl0eS5hbGwucHVzaChcclxuICAgICAgICAgICAgICAgIG5ldyBFbnRpdHkoc3RhcnQuYWxsaWFuY2UsIHN0YXJ0LnR5cGUsIG5ldyBQb3Moc3RhcnQueCwgc3RhcnQueSkpXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKGFsbGlhbmNlOiBBbGxpYW5jZSwgdHlwZTogRW50aXR5VHlwZSwgcG9zaXRpb246IFBvcywgaGVhbHRoOiBudW1iZXIgPSAxMCkge1xyXG4gICAgICAgIHN1cGVyKHBvc2l0aW9uLmdldFdvcmxkUG9zaXRpb24oKSwgRW50aXR5Lmdyb3VwLCB7bmFtZXM6IFtdLCBpZHM6IFtBbmNpZW50RW1waXJlcy5FTlRJVElFU1t0eXBlXS50aWxlICsgQW5jaWVudEVtcGlyZXMuRU5USVRZX0FMTElBTkNFX0RJRkYgKiAoYWxsaWFuY2UgLSAxKV19KTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gQW5jaWVudEVtcGlyZXMuRU5USVRJRVNbdHlwZV07XHJcbiAgICAgICAgdGhpcy5hbGxpYW5jZSA9IGFsbGlhbmNlO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuaGVhbHRoID0gaGVhbHRoO1xyXG4gICAgICAgIHRoaXMucmFuayA9IDA7XHJcbiAgICAgICAgdGhpcy5lcCA9IDA7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgPSAwO1xyXG4gICAgICAgIHRoaXMuc3RhdGUgPSBFbnRpdHlTdGF0ZS5SZWFkeTtcclxuICAgIH1cclxuICAgIGxvYWRTcHJpdGUoKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUgPSBTcHJpdGUuZ2FtZS5hZGQuc3ByaXRlKHRoaXMud29ybGRQb3NpdGlvbi54LCB0aGlzLndvcmxkUG9zaXRpb24ueSwgXCJ0aWxlc2V0XCIsIHRoaXMuZnJhbWVzLmlkc1swXSk7XHJcbiAgICB9XHJcbiAgICBuZXh0RnJhbWUoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50RnJhbWUgPSAxIC0gdGhpcy5jdXJyZW50RnJhbWU7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWUgPSB0aGlzLmZyYW1lcy5pZHNbMF0gKyB0aGlzLmN1cnJlbnRGcmFtZTtcclxuICAgIH1cclxuICAgIGRpZFJhbmtVcCgpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5yYW5rIDwgMyAmJiB0aGlzLmVwID49IDc1IDw8IHRoaXMucmFuaykge1xyXG4gICAgICAgICAgICB0aGlzLmVwID0gMDtcclxuICAgICAgICAgICAgdGhpcy5yYW5rKys7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBhdHRhY2sodGFyZ2V0OiBFbnRpdHkpIHtcclxuXHJcbiAgICAgICAgbGV0IG46IG51bWJlcjtcclxuXHJcbiAgICAgICAgLy8gZ2V0IGJhc2UgZGFtYWdlXHJcbiAgICAgICAgbGV0IGF0ayA9IHRoaXMuZGF0YS5hdGsgKyB0aGlzLmF0a19ib29zdDtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFbnRpdHlUeXBlLkFyY2hlciAmJiB0YXJnZXQudHlwZSA9PSBFbnRpdHlUeXBlLld5dmVybikge1xyXG4gICAgICAgICAgICBhdGsgKz0gMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRW50aXR5VHlwZS5XaXNwICYmIHRhcmdldC50eXBlID09IEVudGl0eVR5cGUuU2tlbGV0b24pIHtcclxuICAgICAgICAgICAgYXRrICs9IDM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgdGhpcy5yYW5rO1xyXG4gICAgICAgIGlmIChuID4gMTkpIHtcclxuICAgICAgICAgICAgYXRrICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgYXRrICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGF0ayAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBhdGsgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBkZWYgPSB0YXJnZXQuZGF0YS5kZWYgKyB0YXJnZXQuZGVmX2Jvb3N0O1xyXG5cclxuICAgICAgICBuID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjApICsgdGFyZ2V0LnJhbms7XHJcblxyXG4gICAgICAgIGlmIChuID4gMTkpIHtcclxuICAgICAgICAgICAgZGVmICs9IDI7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPj0gMTcpIHtcclxuICAgICAgICAgICAgZGVmICs9IDE7XHJcbiAgICAgICAgfWVsc2UgaWYgKG4gPD0gLTE5KSB7XHJcbiAgICAgICAgICAgIGRlZiAtPSAyO1xyXG4gICAgICAgIH1lbHNlIGlmIChuIDw9IC0xNykge1xyXG4gICAgICAgICAgICBkZWYgLT0gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCByZWRfaGVhbHRoID0gTWF0aC5mbG9vcigoYXRrIC0gKGRlZiArIEVudGl0eS5wYXRoZmluZGVyLmdldERlZkF0KHRhcmdldC5wb3NpdGlvbiwgdGFyZ2V0KSkgKiAoMiAvIDMpKSAqIHRoaXMuaGVhbHRoIC8gMTApO1xyXG4gICAgICAgIGlmIChyZWRfaGVhbHRoID4gdGFyZ2V0LmhlYWx0aCkge1xyXG4gICAgICAgICAgICByZWRfaGVhbHRoID0gdGFyZ2V0LmhlYWx0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGFyZ2V0LmhlYWx0aCA9IHRhcmdldC5oZWFsdGggLSByZWRfaGVhbHRoO1xyXG4gICAgICAgIHRoaXMuZXAgKz0gKHRhcmdldC5kYXRhLmF0ayArIHRhcmdldC5kYXRhLmRlZikgKiByZWRfaGVhbHRoO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlU3RhdHVzKCkge1xyXG4gICAgICAgIHRoaXMuYXRrX2Jvb3N0ID0gMDtcclxuICAgICAgICB0aGlzLmRlZl9ib29zdCA9IDA7XHJcbiAgICAgICAgdGhpcy5tb3ZfYm9vc3QgPSAwO1xyXG4gICAgICAgIGlmICh0aGlzLnN0YXR1cyAmIEVudGl0eVN0YXR1cy5Qb2lzb25lZCkge1xyXG4gICAgICAgICAgICB0aGlzLmF0a19ib29zdC0tO1xyXG4gICAgICAgICAgICB0aGlzLmRlZl9ib29zdC0tO1xyXG4gICAgICAgICAgICB0aGlzLm1vdl9ib29zdC0tO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5zdGF0dXMgJiBFbnRpdHlTdGF0dXMuV2lzcGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYXRrX2Jvb3N0Kys7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0U3RhdHVzKHN0YXR1czogRW50aXR5U3RhdHVzKSB7XHJcbiAgICAgICAgdGhpcy5zdGF0dXMgfD0gc3RhdHVzO1xyXG4gICAgICAgIHRoaXMudXBkYXRlU3RhdHVzKCk7XHJcbiAgICB9XHJcbiAgICBjbGVhclN0YXR1cyhzdGF0dXM6IEVudGl0eVN0YXR1cykge1xyXG4gICAgICAgIHRoaXMuc3RhdHVzICY9IH5zdGF0dXM7XHJcbiAgICAgICAgdGhpcy51cGRhdGVTdGF0dXMoKTtcclxuICAgIH1cclxuICAgIGdldEluZm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YS5uYW1lICsgXCIsIGFsbGlhbmNlIFwiICsgdGhpcy5hbGxpYW5jZSArIFwiOiBcIiArIHRoaXMucG9zaXRpb24ueCArIFwiIC0gXCIgKyB0aGlzLnBvc2l0aW9uLnk7XHJcbiAgICB9XHJcbiAgICBtb3ZlKHRhcmdldDogUG9zLCBsaW5lOiBMaW5lUGFydFtdKSB7XHJcbiAgICAgICAgdGhpcy5zcHJpdGUuYnJpbmdUb1RvcCgpO1xyXG4gICAgICAgIEVudGl0eS5tb3ZpbmcgPSB7XHJcbiAgICAgICAgICAgIGVudGl0eTogdGhpcyxcclxuICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXQsXHJcbiAgICAgICAgICAgIGxpbmU6IGxpbmUsXHJcbiAgICAgICAgICAgIHByb2dyZXNzOiAwXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyID0gMSkge1xyXG4gICAgICAgIGlmIChFbnRpdHkubW92aW5nLmVudGl0eSA9PSB0aGlzKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0gRW50aXR5Lm1vdmluZy5saW5lWzBdO1xyXG4gICAgICAgICAgICBsZXQgZGlmZiA9IG5ldyBQb3MoMCwgMCkubW92ZShjdXJyZW50LmRpcmVjdGlvbik7XHJcblxyXG4gICAgICAgICAgICBFbnRpdHkubW92aW5nLnByb2dyZXNzICs9IHN0ZXBzO1xyXG5cclxuICAgICAgICAgICAgdGhpcy53b3JsZFBvc2l0aW9uLnggPSBjdXJyZW50LnBvc2l0aW9uLnggKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUgKyBkaWZmLnggKiBFbnRpdHkubW92aW5nLnByb2dyZXNzO1xyXG4gICAgICAgICAgICB0aGlzLndvcmxkUG9zaXRpb24ueSA9IGN1cnJlbnQucG9zaXRpb24ueSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSArIGRpZmYueSAqIEVudGl0eS5tb3ZpbmcucHJvZ3Jlc3M7XHJcblxyXG4gICAgICAgICAgICBpZiAoRW50aXR5Lm1vdmluZy5wcm9ncmVzcyA+PSBjdXJyZW50Lmxlbmd0aCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSkge1xyXG4gICAgICAgICAgICAgICAgRW50aXR5Lm1vdmluZy5saW5lLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBFbnRpdHkubW92aW5nLnByb2dyZXNzIC09IGN1cnJlbnQubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChFbnRpdHkubW92aW5nLmxpbmUubGVuZ3RoIDwgMSkge1xyXG4gICAgICAgICAgICAgICAgLy8gaG93IHRvIHVuZG8/XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBvc2l0aW9uID0gRW50aXR5Lm1vdmluZy50YXJnZXQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndvcmxkUG9zaXRpb24ueCA9IHRoaXMucG9zaXRpb24ueCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuICAgICAgICAgICAgICAgIHRoaXMud29ybGRQb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG5cclxuICAgICAgICAgICAgICAgIEVudGl0eS5tb3ZpbmcgPSBudWxsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN1cGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJjbGFzcyBTbW9rZSBleHRlbmRzIFNwcml0ZSB7XHJcbiAgICAvLyArMiBweCAtIDFcclxuICAgIC8vICs3IHB4IC0gMlxyXG4gICAgLy8gKzEyIHB4IC0gM1xyXG4gICAgLy8gKzE3IHB4IC0gNFxyXG4gICAgLy8gKzIyIHB4IC0gMFxyXG5cclxuICAgIHN0YXRpYyBncm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgc3RhdGljIG9mZnNldDogbnVtYmVyID0gMDtcclxuICAgIHN0YXRpYyBmcmFtZTogbnVtYmVyID0gMDtcclxuICAgIHN0YXRpYyBhbGw6IFNtb2tlW107XHJcbiAgICBzdGF0aWMgc21va2VUaW1lcjogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG5cclxuICAgIHN0YXRpYyBsb2FkSG91c2VzKGhvdXNlczogQnVpbGRpbmdbXSkge1xyXG4gICAgICAgIGZvciAobGV0IGhvdXNlIG9mIGhvdXNlcykge1xyXG4gICAgICAgICAgICBpZiAoaG91c2UuYWxsaWFuY2UgPT0gQWxsaWFuY2UuTm9uZSkgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICBpZiAoaG91c2UuY2FzdGxlKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIFNtb2tlLmFkZFNtb2tlQXQoaG91c2UucG9zaXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0U21va2VBdChwb3NpdGlvbjogUG9zKSB7XHJcbiAgICAgICAgZm9yIChsZXQgc21va2Ugb2YgU21va2UuYWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChzbW9rZS5wb3NpdGlvbi5tYXRjaChwb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzbW9rZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFkZFNtb2tlQXQocG9zaXRpb246IFBvcyk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBzbW9rZSA9IFNtb2tlLmdldFNtb2tlQXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghIXNtb2tlKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICAgIFNtb2tlLmFsbC5wdXNoKFxyXG4gICAgICAgICAgICBuZXcgU21va2UocG9zaXRpb24pXHJcbiAgICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgcmVtb3ZlU21va2VBdChwb3NpdGlvbjogUG9zKTogYm9vbGVhbiB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBTbW9rZS5hbGwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCFTbW9rZS5hbGxbaV0ucG9zaXRpb24ubWF0Y2gocG9zaXRpb24pKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIFNtb2tlLmFsbFtpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIFNtb2tlLmFsbC5zcGxpY2UoaSwgMSk7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIFNtb2tlLnNtb2tlVGltZXIgKz0gc3RlcHM7XHJcbiAgICAgICAgaWYgKFNtb2tlLnNtb2tlVGltZXIgPCA1KSB7IHJldHVybjsgfVxyXG4gICAgICAgIFNtb2tlLnNtb2tlVGltZXIgPSAwO1xyXG5cclxuICAgICAgICBsZXQgbmYgPSBmYWxzZTtcclxuICAgICAgICBTbW9rZS5vZmZzZXQgKz0gMTtcclxuICAgICAgICBpZiAoU21va2Uub2Zmc2V0ID4gMjcpIHtcclxuICAgICAgICAgICAgU21va2Uub2Zmc2V0ID0gMDtcclxuICAgICAgICAgICAgU21va2UuZ3JvdXAudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgfWVsc2UgaWYgKFNtb2tlLm9mZnNldCA+IDIyKSB7XHJcbiAgICAgICAgICAgIGlmIChTbW9rZS5mcmFtZSA9PSAzKSB7XHJcbiAgICAgICAgICAgICAgICBTbW9rZS5ncm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBTbW9rZS5mcmFtZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBuZiA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9ZWxzZSBpZiAoU21va2Uub2Zmc2V0ID4gMTcpIHtcclxuICAgICAgICAgICAgaWYgKFNtb2tlLmZyYW1lID09IDIpIHtcclxuICAgICAgICAgICAgICAgIFNtb2tlLmZyYW1lID0gMztcclxuICAgICAgICAgICAgICAgIG5mID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1lbHNlIGlmIChTbW9rZS5vZmZzZXQgPiAxMikge1xyXG4gICAgICAgICAgICBpZiAoU21va2UuZnJhbWUgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgU21va2UuZnJhbWUgPSAyO1xyXG4gICAgICAgICAgICAgICAgbmYgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfWVsc2UgaWYgKFNtb2tlLm9mZnNldCA+IDcpIHtcclxuICAgICAgICAgICAgaWYgKFNtb2tlLmZyYW1lID09IDApIHtcclxuICAgICAgICAgICAgICAgIFNtb2tlLmZyYW1lID0gMTtcclxuICAgICAgICAgICAgICAgIG5mID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChsZXQgc21va2Ugb2YgU21va2UuYWxsKSB7XHJcbiAgICAgICAgICAgIGlmIChuZikgeyBzbW9rZS5uZXh0RnJhbWUoKTsgfVxyXG4gICAgICAgICAgICBzbW9rZS51cGRhdGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IocG9zaXRpb246IFBvcykge1xyXG4gICAgICAgIHN1cGVyKG5ldyBQb3MocG9zaXRpb24ueCAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSArIDE2LCBwb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKSwgU21va2UuZ3JvdXAsIHtuYW1lczogW1wiYl9zbW9rZS8wXCIsIFwiYl9zbW9rZS8xXCIsIFwiYl9zbW9rZS8yXCIsIFwiYl9zbW9rZS8zXCJdLCBpZHM6IFtdfSk7XHJcbiAgICAgICAgdGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyID0gMSkge1xyXG4gICAgICAgIHRoaXMud29ybGRQb3NpdGlvbi55ID0gdGhpcy5wb3NpdGlvbi55ICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFIC0gU21va2Uub2Zmc2V0IC0gMjtcclxuICAgICAgICBzdXBlci51cGRhdGUoKTtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbmVudW0gVGlsZSB7XHJcbiAgICBXYXRlcixcclxuICAgIEJyaWRnZSxcclxuICAgIFBhdGgsXHJcbiAgICBHcmFzcyxcclxuICAgIEhpbGwsXHJcbiAgICBGb3Jlc3QsXHJcbiAgICBNb3VudGFpbixcclxuICAgIEhvdXNlLFxyXG4gICAgQ2FzdGxlXHJcbn1cclxuZW51bSBBbGxpYW5jZSB7XHJcbiAgICBOb25lLFxyXG4gICAgQmx1ZSxcclxuICAgIFJlZFxyXG59XHJcbmludGVyZmFjZSBCdWlsZGluZyB7XHJcbiAgICBjYXN0bGU6IGJvb2xlYW47XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgYWxsaWFuY2U6IEFsbGlhbmNlO1xyXG59XHJcbmludGVyZmFjZSBCdWlsZGluZ1N0YXJ0IHtcclxuICAgIHg6IG51bWJlcjtcclxuICAgIHk6IG51bWJlcjtcclxuICAgIGFsbGlhbmNlOiBBbGxpYW5jZTtcclxufVxyXG5lbnVtIFRpbnRBbmltYXRpb24ge1xyXG4gICAgTm9uZSxcclxuICAgIEluY3JlYXNpbmcsXHJcbiAgICBEZWNyZWFzaW5nXHJcbn1cclxuY2xhc3MgVGlsZU1hbmFnZXIge1xyXG5cclxuICAgIHN0YXRpYyBnYW1lOiBQaGFzZXIuR2FtZTtcclxuICAgIHN0YXRpYyB0aWxlTWFwOiBQaGFzZXIuVGlsZW1hcDtcclxuXHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBtYXA6IHN0cmluZztcclxuICAgIGJ1aWxkaW5nczogQnVpbGRpbmdbXTtcclxuICAgIHdhdGVyU3RhdGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgZ2FtZTogUGhhc2VyLkdhbWU7XHJcbiAgICB0aWxlbWFwOiBQaGFzZXIuVGlsZW1hcDtcclxuICAgIGJhY2tncm91bmRMYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuICAgIG9iamVjdExheWVyOiBQaGFzZXIuVGlsZW1hcExheWVyO1xyXG4gICAgaW50ZXJhY3Rpb25MYXllcjogUGhhc2VyLlRpbGVtYXBMYXllcjtcclxuXHJcbiAgICBpbnRlcmFjdGlvbkxheWVyVGludEFuaW1hdGlvbjogVGludEFuaW1hdGlvbiA9IFRpbnRBbmltYXRpb24uTm9uZTtcclxuICAgIGludGVyYWN0aW9uTGF5ZXJUaW50UHJvZ3Jlc3M6IG51bWJlciA9IDEwMDtcclxuXHJcbiAgICB3YXRlclRpbWVyOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHN0YXRpYyBkb2VzVGlsZUN1dEdyYXNzKHRpbGU6IFRpbGUpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gKHRpbGUgPT0gVGlsZS5QYXRoIHx8IHRpbGUgPT0gVGlsZS5XYXRlciB8fCB0aWxlID09IFRpbGUuQnJpZGdlKTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRJbmRleEZvckZvcm0oZmJpdDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAoZmJpdCA9PSA4ICsgNCArIDIgKyAxKSB7IHJldHVybiAxNTsgfVxyXG4gICAgICAgIGlmIChmYml0ID09IDggKyA0ICsgMSkgeyByZXR1cm4gMTQ7IH1cclxuICAgICAgICBpZiAoZmJpdCA9PSA4ICsgNCArIDIpIHsgcmV0dXJuIDEzOyB9XHJcbiAgICAgICAgaWYgKGZiaXQgPT0gNCArIDIgKyAxKSB7IHJldHVybiAxMjsgfVxyXG4gICAgICAgIGlmIChmYml0ID09IDggKyAyICsgMSkgeyByZXR1cm4gMTE7IH1cclxuICAgICAgICBpZiAoZmJpdCA9PSAxICsgOCkgeyByZXR1cm4gMTA7IH1cclxuICAgICAgICBpZiAoZmJpdCA9PSA0ICsgOCkgeyByZXR1cm4gOTsgfVxyXG4gICAgICAgIGlmIChmYml0ID09IDIgKyA0KSB7IHJldHVybiA4OyB9XHJcbiAgICAgICAgaWYgKGZiaXQgPT0gMSArIDIpIHsgcmV0dXJuIDc7IH1cclxuICAgICAgICBpZiAoZmJpdCA9PSAxICsgNCkgeyByZXR1cm4gNjsgfVxyXG4gICAgICAgIGlmIChmYml0ID09IDIgKyA4KSB7IHJldHVybiA1OyB9XHJcbiAgICAgICAgaWYgKGZiaXQgPT0gOCkgeyByZXR1cm4gNDsgfVxyXG4gICAgICAgIGlmIChmYml0ID09IDQpIHsgcmV0dXJuIDM7IH1cclxuICAgICAgICBpZiAoZmJpdCA9PSAyKSB7IHJldHVybiAyOyB9XHJcbiAgICAgICAgaWYgKGZiaXQgPT0gMSkgeyByZXR1cm4gMTsgfVxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKG1hcDogc3RyaW5nLCBidWlsZGluZ3M6IEJ1aWxkaW5nU3RhcnRbXSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMuYnVpbGRpbmdzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgYnVpbGRpbmdzKSB7XHJcbiAgICAgICAgICAgIGxldCBwb3MgPSBuZXcgUG9zKGJ1aWxkaW5nLngsIGJ1aWxkaW5nLnkpO1xyXG4gICAgICAgICAgICB0aGlzLmJ1aWxkaW5ncy5wdXNoKHtjYXN0bGU6IHRoaXMuZ2V0VGlsZUF0KHBvcykgPT0gVGlsZS5DYXN0bGUsIHBvc2l0aW9uOiBwb3MsIGFsbGlhbmNlOiBidWlsZGluZy5hbGxpYW5jZX0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kTGF5ZXIgPSBUaWxlTWFuYWdlci50aWxlTWFwLmNyZWF0ZShcImJhY2tncm91bmRcIiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICB0aGlzLmJhY2tncm91bmRMYXllci5yZXNpemVXb3JsZCgpO1xyXG4gICAgICAgIHRoaXMub2JqZWN0TGF5ZXIgPSBUaWxlTWFuYWdlci50aWxlTWFwLmNyZWF0ZUJsYW5rTGF5ZXIoXCJvYmplY3RcIiwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRSwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uTGF5ZXIgPSBUaWxlTWFuYWdlci50aWxlTWFwLmNyZWF0ZUJsYW5rTGF5ZXIoXCJpbnRlcmFjdGlvblwiLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBkcmF3KCkge1xyXG4gICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kcmF3VGlsZUF0KG5ldyBQb3MoeCwgeSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIHRoaXMud2F0ZXJUaW1lciArPSBzdGVwcztcclxuICAgICAgICBpZiAodGhpcy53YXRlclRpbWVyID4gMzApIHtcclxuICAgICAgICAgICAgdGhpcy53YXRlclRpbWVyID0gMDtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVXYXRlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRBbmltYXRpb24gIT0gVGludEFuaW1hdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSW50ZXJhY3Rpb25MYXllcihzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVJbnRlcmFjdGlvbkxheWVyKHN0ZXBzOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmludGVyYWN0aW9uTGF5ZXJUaW50UHJvZ3Jlc3MgLyAxMDAgKiAweEZGIHwgMDtcclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uTGF5ZXIudGludCA9ICh2YWx1ZSA8PCAxNikgfCAodmFsdWUgPDwgOCkgfCB2YWx1ZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRBbmltYXRpb24gPT0gVGludEFuaW1hdGlvbi5JbmNyZWFzaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRQcm9ncmVzcyArPSBzdGVwcztcclxuICAgICAgICAgICAgaWYgKHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRQcm9ncmVzcyA+PSAxMDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRQcm9ncmVzcyA9IDEwMDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRBbmltYXRpb24gPSBUaW50QW5pbWF0aW9uLkRlY3JlYXNpbmc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmludGVyYWN0aW9uTGF5ZXJUaW50UHJvZ3Jlc3MgLT0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmludGVyYWN0aW9uTGF5ZXJUaW50UHJvZ3Jlc3MgPD0gNDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW50ZXJhY3Rpb25MYXllclRpbnRQcm9ncmVzcyA9IDQwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbnRlcmFjdGlvbkxheWVyVGludEFuaW1hdGlvbiA9IFRpbnRBbmltYXRpb24uSW5jcmVhc2luZztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRUaWxlQXQocDogUG9zKTogVGlsZSB7XHJcbiAgICAgICAgcmV0dXJuICt0aGlzLm1hcC5jaGFyQXQocC55ICogdGhpcy53aWR0aCArIHAueCk7XHJcbiAgICB9XHJcbiAgICBnZXRPYmplY3RBdChwOiBQb3MpOiBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAodGhpcy5nZXRUaWxlQXQocCkpIHtcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDIxO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjI7XHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgIHJldHVybiAyMztcclxuICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI0O1xyXG4gICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMjc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVXYXRlcigpIHtcclxuICAgICAgICBsZXQgb2xkU3RhdGUgPSB0aGlzLndhdGVyU3RhdGU7XHJcbiAgICAgICAgdGhpcy53YXRlclN0YXRlID0gMSAtIHRoaXMud2F0ZXJTdGF0ZTtcclxuXHJcbiAgICAgICAgVGlsZU1hbmFnZXIudGlsZU1hcC5yZXBsYWNlKG9sZFN0YXRlLCB0aGlzLndhdGVyU3RhdGUsIDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCB0aGlzLmJhY2tncm91bmRMYXllcik7XHJcbiAgICB9XHJcblxyXG4gICAgZHJhd1RpbGVBdChwOiBQb3MpIHtcclxuICAgICAgICBUaWxlTWFuYWdlci50aWxlTWFwLnB1dFRpbGUodGhpcy5nZXRCYWNrZ3JvdW5kQXQocCksIHAueCwgcC55LCB0aGlzLmJhY2tncm91bmRMYXllcik7XHJcblxyXG4gICAgICAgIGxldCB0aWxlID0gdGhpcy5nZXRUaWxlQXQocCk7XHJcbiAgICAgICAgbGV0IG9iaiA9IHRoaXMuZ2V0T2JqZWN0QXQocCk7XHJcbiAgICAgICAgaWYgKG9iaiA+PSAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuSG91c2UgfHwgdGlsZSA9PSBUaWxlLkNhc3RsZSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aWxlID09IFRpbGUuQ2FzdGxlICYmIHAueSA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgcm9vZiB0byBjYXN0bGUgb24gYWJvdmUgdGlsZVxyXG4gICAgICAgICAgICAgICAgICAgIFRpbGVNYW5hZ2VyLnRpbGVNYXAucHV0VGlsZSgzMCArIHRoaXMuZ2V0QWxsaWFuY2VBdChwKSwgcC54LCBwLnkgLSAxLCB0aGlzLm9iamVjdExheWVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBvYmogKz0gdGhpcy5nZXRBbGxpYW5jZUF0KHApO1xyXG5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBUaWxlTWFuYWdlci50aWxlTWFwLnB1dFRpbGUob2JqLCBwLngsIHAueSwgdGhpcy5vYmplY3RMYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0QmFja2dyb3VuZEF0KHA6IFBvcyk6IG51bWJlciB7XHJcbiAgICAgICAgc3dpdGNoICh0aGlzLmdldFRpbGVBdChwKSkge1xyXG4gICAgICAgICAgICBjYXNlIDA6XHJcbiAgICAgICAgICAgICAgICAvLyBXYXRlclxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIC8vIEJyaWRnZVxyXG4gICAgICAgICAgICAgICAgbGV0IGFkaiA9IHRoaXMuZ2V0QWRqYWNlbnRUaWxlc0F0KHApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFkalswXSAhPSBUaWxlLldhdGVyIHx8IGFkalsyXSAhPSBUaWxlLldhdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gNDtcclxuICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgLy8gUGF0aFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDI7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgY2FzZSA3OlxyXG4gICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJbmRleEZvckdyYXNzQXQocCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAyO1xyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRQb3NpdGlvbnNBdChwOiBQb3MpOiBQb3NbXSB7XHJcbiAgICAgICAgbGV0IHJldDogUG9zW10gPSBbXTtcclxuXHJcbiAgICAgICAgLy8gdG9wLCByaWdodCwgYm90dG9tLCBsZWZ0XHJcbiAgICAgICAgaWYgKHAueSA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLngsIHAueSAtIDEpKTsgfVxyXG4gICAgICAgIGlmIChwLnggPCB0aGlzLndpZHRoIC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCArIDEsIHAueSkpOyB9XHJcbiAgICAgICAgaWYgKHAueSA8IHRoaXMuaGVpZ2h0IC0gMSkgeyByZXQucHVzaChuZXcgUG9zKHAueCwgcC55ICsgMSkpOyB9XHJcbiAgICAgICAgaWYgKHAueCA+IDApIHsgcmV0LnB1c2gobmV3IFBvcyhwLnggLSAxLCBwLnkpKTsgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmV0O1xyXG4gICAgfVxyXG4gICAgZ2V0QWRqYWNlbnRUaWxlc0F0KHA6IFBvcyk6IFRpbGVbXSB7XHJcblxyXG4gICAgICAgIHJldHVybiBbXHJcbiAgICAgICAgICAgIHAueSA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHAueCwgcC55IC0gMSkpIDogLTEsXHJcbiAgICAgICAgICAgIHAueCA8IHRoaXMud2lkdGggLSAxID8gdGhpcy5nZXRUaWxlQXQobmV3IFBvcyhwLnggKyAxLCBwLnkpKSA6IC0xLFxyXG4gICAgICAgICAgICBwLnkgPCB0aGlzLmhlaWdodCAtIDEgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHAueCwgcC55ICsgMSkpIDogLTEsXHJcbiAgICAgICAgICAgIHAueCA+IDAgPyB0aGlzLmdldFRpbGVBdChuZXcgUG9zKHAueCAtIDEsIHAueSkpIDogLTFcclxuICAgICAgICBdO1xyXG5cclxuICAgIH1cclxuICAgIGdldEluZGV4Rm9yR3Jhc3NBdChwOiBQb3MpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBhZGogPSB0aGlzLmdldEFkamFjZW50VGlsZXNBdChwKTtcclxuICAgICAgICBsZXQgY3V0ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFkai5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjdXQgKz0gTWF0aC5wb3coMiwgaSkgKiAoVGlsZU1hbmFnZXIuZG9lc1RpbGVDdXRHcmFzcyhhZGpbaV0pID8gMSA6IDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gNSArIFRpbGVNYW5hZ2VyLmdldEluZGV4Rm9yRm9ybShjdXQpO1xyXG4gICAgfVxyXG4gICAgc2hvd1dhbGtSYW5nZSh3YXlwb2ludHM6IFdheXBvaW50W10pIHtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB3YXlwb2ludHMpIHtcclxuICAgICAgICAgICAgVGlsZU1hbmFnZXIudGlsZU1hcC5wdXRUaWxlKDMzICsgVGlsZU1hbmFnZXIuZ2V0SW5kZXhGb3JGb3JtKHdheXBvaW50LmZvcm0pLCB3YXlwb2ludC5wb3NpdGlvbi54LCB3YXlwb2ludC5wb3NpdGlvbi55LCB0aGlzLmludGVyYWN0aW9uTGF5ZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmludGVyYWN0aW9uTGF5ZXJUaW50UHJvZ3Jlc3MgPSAxMDA7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbkxheWVyVGludEFuaW1hdGlvbiA9IFRpbnRBbmltYXRpb24uRGVjcmVhc2luZztcclxuICAgIH1cclxuICAgIGhpZGVXYWxrUmFuZ2Uod2F5cG9pbnRzOiBXYXlwb2ludFtdKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcmFjdGlvbkxheWVyVGludEFuaW1hdGlvbiA9IFRpbnRBbmltYXRpb24uTm9uZTtcclxuICAgICAgICBmb3IgKGxldCB3YXlwb2ludCBvZiB3YXlwb2ludHMpIHtcclxuICAgICAgICAgICAgVGlsZU1hbmFnZXIudGlsZU1hcC5yZW1vdmVUaWxlKHdheXBvaW50LnBvc2l0aW9uLngsIHdheXBvaW50LnBvc2l0aW9uLnksIHRoaXMuaW50ZXJhY3Rpb25MYXllcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0QWxsaWFuY2VBdChwOiBQb3MpOiBBbGxpYW5jZSB7XHJcbiAgICAgICAgZm9yIChsZXQgYnVpbGRpbmcgb2YgdGhpcy5idWlsZGluZ3Mpe1xyXG4gICAgICAgICAgICBpZiAocC5tYXRjaChidWlsZGluZy5wb3NpdGlvbikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBidWlsZGluZy5hbGxpYW5jZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gQWxsaWFuY2UuTm9uZTtcclxuICAgIH1cclxuICAgIGdldE9jY3VwaWVkSG91c2VzKCk6IEJ1aWxkaW5nW10ge1xyXG4gICAgICAgIGxldCBob3VzZXM6IEJ1aWxkaW5nW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBidWlsZGluZyBvZiB0aGlzLmJ1aWxkaW5ncyl7XHJcbiAgICAgICAgICAgIGlmICghYnVpbGRpbmcuY2FzdGxlICYmIGJ1aWxkaW5nLmFsbGlhbmNlICE9IEFsbGlhbmNlLk5vbmUpIHtcclxuICAgICAgICAgICAgICAgIGhvdXNlcy5wdXNoKGJ1aWxkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaG91c2VzO1xyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBXYXlwb2ludCB7XHJcbiAgICBwb3NpdGlvbjogUG9zO1xyXG4gICAgY29zdDogbnVtYmVyO1xyXG4gICAgZm9ybTogbnVtYmVyO1xyXG4gICAgcGFyZW50OiBXYXlwb2ludDtcclxufVxyXG5jbGFzcyBQYXRoZmluZGVyIHtcclxuICAgIHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcclxuICAgIHN0YXRpYyBmaW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb246IFBvcywgd2F5cG9pbnRzOiBXYXlwb2ludFtdKSB7XHJcbiAgICAgICAgZm9yIChsZXQgd2F5cG9pbnQgb2Ygd2F5cG9pbnRzKXtcclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLm1hdGNoKHBvc2l0aW9uKSkgeyByZXR1cm4gd2F5cG9pbnQ7IH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0TGluZVRvV2F5cG9pbnQod2F5cG9pbnQ6IFdheXBvaW50KTogTGluZVBhcnRbXSB7XHJcbiAgICAgICAgbGV0IGxpbmU6IExpbmVQYXJ0W10gPSBbXTtcclxuICAgICAgICB3aGlsZSAod2F5cG9pbnQucGFyZW50ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSB3YXlwb2ludDtcclxuICAgICAgICAgICAgd2F5cG9pbnQgPSB3YXlwb2ludC5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gd2F5cG9pbnQucG9zaXRpb24uZ2V0RGlyZWN0aW9uVG8obmV4dC5wb3NpdGlvbik7XHJcbiAgICAgICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDAgJiYgbGluZVswXS5kaXJlY3Rpb24gPT0gZGlyZWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLnBvc2l0aW9uID0gd2F5cG9pbnQucG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICBsaW5lWzBdLmxlbmd0aCsrO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbGluZS51bnNoaWZ0KHtwb3NpdGlvbjogd2F5cG9pbnQucG9zaXRpb24sIGRpcmVjdGlvbjogZGlyZWN0aW9uLCBsZW5ndGg6IDF9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGxpbmU7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgY29zdEZvclRpbGUodGlsZTogVGlsZSwgZW50aXR5OiBFbnRpdHkpOiBudW1iZXIge1xyXG5cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLldhdGVyICYmIGVudGl0eS50eXBlID09IEVudGl0eVR5cGUuTGl6YXJkKSB7XHJcbiAgICAgICAgICAgIC8vIExpemFyZCBvbiB3YXRlclxyXG4gICAgICAgICAgICByZXR1cm4gMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjb3N0ID0gMDtcclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLk1vdW50YWluIHx8IHRpbGUgPT0gVGlsZS5XYXRlcikge1xyXG4gICAgICAgICAgICBjb3N0ID0gMztcclxuICAgICAgICB9IGVsc2UgaWYgKHRpbGUgPT0gVGlsZS5Gb3Jlc3QgfHwgdGlsZSA9PSBUaWxlLkhpbGwpIHtcclxuICAgICAgICAgICAgY29zdCA9IDI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29zdCA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChlbnRpdHkudHlwZSA9PSBFbnRpdHlUeXBlLkxpemFyZCkge1xyXG4gICAgICAgICAgICAvLyBMaXphcmQgZm9yIGV2ZXJ5dGhpbmcgZXhjZXB0IHdhdGVyXHJcbiAgICAgICAgICAgIHJldHVybiBjb3N0ICogMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb3N0O1xyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldERlZkZvclRpbGUodGlsZTogVGlsZSwgZW50aXR5OiBFbnRpdHkpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuTW91bnRhaW4gfHwgdGlsZSA9PSBUaWxlLkhvdXNlIHx8IHRpbGUgPT0gVGlsZS5DYXN0bGUpIHsgcmV0dXJuIDM7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkZvcmVzdCB8fCB0aWxlID09IFRpbGUuSGlsbCkgeyByZXR1cm4gMjsgfVxyXG4gICAgICAgIGlmICh0aWxlID09IFRpbGUuV2F0ZXIgJiYgZW50aXR5LnR5cGUgPT0gRW50aXR5VHlwZS5MaXphcmQpIHsgcmV0dXJuIDI7IH1cclxuICAgICAgICBpZiAodGlsZSA9PSBUaWxlLkdyYXNzKSB7IHJldHVybiAxOyB9XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3RydWN0b3IodGlsZU1hbmFnZXI6IFRpbGVNYW5hZ2VyKSB7XHJcbiAgICAgICAgdGhpcy50aWxlTWFuYWdlciA9IHRpbGVNYW5hZ2VyO1xyXG4gICAgfVxyXG4gICAgZ2V0RGVmQXQocG9zaXRpb246IFBvcywgZW50aXR5OiBFbnRpdHkpIHtcclxuICAgICAgICByZXR1cm4gUGF0aGZpbmRlci5nZXREZWZGb3JUaWxlKHRoaXMudGlsZU1hbmFnZXIuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgIH1cclxuICAgIGdldFJlYWNoYWJsZVdheXBvaW50c0ZvckVudGl0eShlbnRpdHk6IEVudGl0eSk6IFdheXBvaW50W10ge1xyXG4gICAgICAgIC8vIGNvc3QgZm9yIG9yaWdpbiBwb2ludCBpcyBhbHdheXMgMVxyXG4gICAgICAgIGxldCBvcGVuOiBXYXlwb2ludFtdID0gW3twb3NpdGlvbjogZW50aXR5LnBvc2l0aW9uLCBjb3N0OiAxLCBmb3JtOiAwLCBwYXJlbnQ6IG51bGx9XTtcclxuICAgICAgICBsZXQgY2xvc2VkOiBXYXlwb2ludFtdID0gW107XHJcbiAgICAgICAgd2hpbGUgKG9wZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudCA9IG9wZW4uc2hpZnQoKTtcclxuICAgICAgICAgICAgY2xvc2VkLnB1c2goY3VycmVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgYWRqYWNlbnRfcG9zaXRpb25zID0gdGhpcy50aWxlTWFuYWdlci5nZXRBZGphY2VudFBvc2l0aW9uc0F0KGN1cnJlbnQucG9zaXRpb24pO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBwb3NpdGlvbiBvZiBhZGphY2VudF9wb3NpdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hlY2tQb3NpdGlvbihwb3NpdGlvbiwgY3VycmVudCwgb3BlbiwgY2xvc2VkLCBlbnRpdHkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYWRkRm9ybShjbG9zZWQpO1xyXG4gICAgICAgIHJldHVybiBjbG9zZWQ7XHJcbiAgICB9XHJcbiAgICBjaGVja1Bvc2l0aW9uKHBvc2l0aW9uOiBQb3MsIHBhcmVudDogV2F5cG9pbnQsIG9wZW46IFdheXBvaW50W10sIGNsb3NlZDogV2F5cG9pbnRbXSwgZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoISFQYXRoZmluZGVyLmZpbmRQb3NpdGlvbkluTGlzdChwb3NpdGlvbiwgY2xvc2VkKSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICBsZXQgb2NjdXBpZWQgPSBFbnRpdHkuZ2V0RW50aXR5QXQocG9zaXRpb24pO1xyXG4gICAgICAgIGlmICghIW9jY3VwaWVkICYmIG9jY3VwaWVkLmFsbGlhbmNlICE9IGVudGl0eS5hbGxpYW5jZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuXHJcbiAgICAgICAgbGV0IG5ld19jb3N0ID0gcGFyZW50LmNvc3QgKyBQYXRoZmluZGVyLmNvc3RGb3JUaWxlKHRoaXMudGlsZU1hbmFnZXIuZ2V0VGlsZUF0KHBvc2l0aW9uKSwgZW50aXR5KTtcclxuICAgICAgICBpZiAobmV3X2Nvc3QgPiBlbnRpdHkuZGF0YS5tb3YpIHsgcmV0dXJuIGZhbHNlOyB9XHJcblxyXG4gICAgICAgIGxldCBpbl9vcGVuID0gUGF0aGZpbmRlci5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIG9wZW4pO1xyXG4gICAgICAgIGlmICghIWluX29wZW4pIHtcclxuICAgICAgICAgICAgaWYgKGluX29wZW4uY29zdCA8PSBuZXdfY29zdCkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgICAgICAgaW5fb3Blbi5jb3N0ID0gbmV3X2Nvc3Q7XHJcbiAgICAgICAgICAgIGluX29wZW4ucGFyZW50ID0gcGFyZW50O1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3Blbi5wdXNoKHtwb3NpdGlvbjogcG9zaXRpb24sIHBhcmVudDogcGFyZW50LCBmb3JtOiAwLCBjb3N0OiBuZXdfY29zdH0pO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgY2hlY2tBbHJlYWR5KHBvczogUG9zLCBxdWV1ZTogUG9zW10pOiBXYXlwb2ludCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgICBhZGRGb3JtKHdheXBvaW50czogV2F5cG9pbnRbXSkge1xyXG4gICAgICAgIGZvciAobGV0IHdheXBvaW50IG9mIHdheXBvaW50cykge1xyXG4gICAgICAgICAgICB3YXlwb2ludC5mb3JtID0gMDtcclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnkgPiAwICYmICFQYXRoZmluZGVyLmZpbmRQb3NpdGlvbkluTGlzdCh3YXlwb2ludC5wb3NpdGlvbi5jb3B5KERpcmVjdGlvbi5VcCksIHdheXBvaW50cykpIHsgd2F5cG9pbnQuZm9ybSArPSAxOyB9XHJcbiAgICAgICAgICAgIGlmICh3YXlwb2ludC5wb3NpdGlvbi54IDwgdGhpcy50aWxlTWFuYWdlci53aWR0aCAtIDEgJiYgIVBhdGhmaW5kZXIuZmluZFBvc2l0aW9uSW5MaXN0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLlJpZ2h0KSwgd2F5cG9pbnRzKSkgeyB3YXlwb2ludC5mb3JtICs9IDI7IH1cclxuICAgICAgICAgICAgaWYgKHdheXBvaW50LnBvc2l0aW9uLnkgPCB0aGlzLnRpbGVNYW5hZ2VyLmhlaWdodCAtIDEgJiYgIVBhdGhmaW5kZXIuZmluZFBvc2l0aW9uSW5MaXN0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkRvd24pLCB3YXlwb2ludHMpKSB7IHdheXBvaW50LmZvcm0gKz0gNDsgfVxyXG4gICAgICAgICAgICBpZiAod2F5cG9pbnQucG9zaXRpb24ueCA+IDAgJiYgIVBhdGhmaW5kZXIuZmluZFBvc2l0aW9uSW5MaXN0KHdheXBvaW50LnBvc2l0aW9uLmNvcHkoRGlyZWN0aW9uLkxlZnQpLCB3YXlwb2ludHMpKSB7IHdheXBvaW50LmZvcm0gKz0gODsgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCJlbnVtIERpcmVjdGlvbiB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFVwID0gMSxcclxuICAgIFJpZ2h0ID0gMixcclxuICAgIERvd24gPSA0LFxyXG4gICAgTGVmdCA9IDhcclxufVxyXG5pbnRlcmZhY2UgTGluZVBhcnQge1xyXG4gICAgcG9zaXRpb246IFBvcztcclxuICAgIGRpcmVjdGlvbjogRGlyZWN0aW9uO1xyXG4gICAgbGVuZ3RoOiBudW1iZXI7XHJcbn1cclxuY2xhc3MgQ3Vyc29yIGV4dGVuZHMgU3ByaXRlIHtcclxuXHJcbiAgICBzdGF0aWMgY3Vyc29yR3JvdXA6IFBoYXNlci5Hcm91cDtcclxuICAgIHN0YXRpYyBpbnRlcmFjdGlvbkdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBzdGF0aWMgbGluZU9mZnNldDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBncmFwaGljczogUGhhc2VyLkdyYXBoaWNzO1xyXG4gICAgbW92ZUN1cnNvcjogU3ByaXRlO1xyXG5cclxuICAgIGNsaWNrQ2FsbGJhY2s6IEZ1bmN0aW9uO1xyXG4gICAgY2xpY2tDb250ZXh0OiBhbnk7XHJcbiAgICBsYXN0UG9zOiBQb3M7XHJcblxyXG4gICAgd2F5OiBXYXlwb2ludFtdID0gbnVsbDtcclxuICAgIGxpbmU6IExpbmVQYXJ0W10gPSBudWxsO1xyXG5cclxuICAgIHdheVRpbWVyOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKGNsaWNrQ2FsbGJhY2s6IEZ1bmN0aW9uLCBjbGlja0NvbnRleHQ/OiBhbnkpIHtcclxuICAgICAgICBzdXBlcihuZXcgUG9zKDAsIDApLCBDdXJzb3IuY3Vyc29yR3JvdXAsIHtuYW1lczogW1wiY3Vyc29yLzBcIiwgXCJjdXJzb3IvMVwiXSwgaWRzOiBbXX0pO1xyXG5cclxuICAgICAgICB0aGlzLmNsaWNrQ2FsbGJhY2sgPSBjbGlja0NhbGxiYWNrO1xyXG4gICAgICAgIHRoaXMuY2xpY2tDb250ZXh0ID0gY2xpY2tDb250ZXh0IHx8IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JhcGhpY3MgPSBTcHJpdGUuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgQ3Vyc29yLmludGVyYWN0aW9uR3JvdXApO1xyXG4gICAgICAgIFNwcml0ZS5nYW1lLmlucHV0Lm9uRG93bi5hZGQodGhpcy5vbkRvd24sIHRoaXMpO1xyXG4gICAgfVxyXG4gICAgdXBkYXRlKHN0ZXBzOiBudW1iZXIpIHtcclxuXHJcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuZ2V0QWN0aXZlUG9zKCk7XHJcbiAgICAgICAgaWYgKCFwb3MubWF0Y2godGhpcy5sYXN0UG9zKSkge1xyXG4gICAgICAgICAgICB0aGlzLmxhc3RQb3MgPSBwb3M7XHJcbiAgICAgICAgICAgIHRoaXMud29ybGRQb3NpdGlvbiA9IHBvcy5nZXRXb3JsZFBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIGlmICghIXRoaXMud2F5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy51cGRhdGVMaW5lKHBvcykpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoaXMubW92ZUN1cnNvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IgPSBuZXcgU3ByaXRlKHRoaXMud29ybGRQb3NpdGlvbiwgQ3Vyc29yLmN1cnNvckdyb3VwLCB7bmFtZXM6IFtcImN1cnNvci80XCJdLCBpZHM6IFtdfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlQ3Vyc29yLndvcmxkUG9zaXRpb24gPSB0aGlzLndvcmxkUG9zaXRpb247XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZUN1cnNvci51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN1cGVyLnVwZGF0ZShzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoISF0aGlzLmxpbmUpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMud2F5VGltZXIgKz0gc3RlcHM7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLndheVRpbWVyIDw9IDUpIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgICAgIHRoaXMud2F5VGltZXIgPSAwO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbCgweGZmZmZmZik7XHJcblxyXG4gICAgICAgICAgICBsZXQgb2Zmc2V0ID0gQ3Vyc29yLmxpbmVPZmZzZXQ7XHJcbiAgICAgICAgICAgIGZvciAobGV0IHBhcnQgb2YgdGhpcy5saW5lKXtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkU2VnbWVudHNGb3JMaW5lUGFydChwYXJ0LCBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gKG9mZnNldCArIHBhcnQubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKSAlIChBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfTEVOR1RIICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuZW5kRmlsbCgpO1xyXG4gICAgICAgICAgICBDdXJzb3IubGluZU9mZnNldCAtPSAxO1xyXG4gICAgICAgICAgICBpZiAoQ3Vyc29yLmxpbmVPZmZzZXQgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICBDdXJzb3IubGluZU9mZnNldCA9IEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9MRU5HVEggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORyAtIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBhZGRTZWdtZW50c0ZvckxpbmVQYXJ0KHBhcnQ6IExpbmVQYXJ0LCBvZmZzZXQ6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkaXN0YW5jZSA9IHBhcnQubGVuZ3RoICogQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFO1xyXG4gICAgICAgIGxldCB4ID0gKHBhcnQucG9zaXRpb24ueCArIDAuNSkgKiBBbmNpZW50RW1waXJlcy5USUxFX1NJWkU7XHJcbiAgICAgICAgbGV0IHkgPSAocGFydC5wb3NpdGlvbi55ICsgMC41KSAqIEFuY2llbnRFbXBpcmVzLlRJTEVfU0laRTtcclxuXHJcbiAgICAgICAgd2hpbGUgKGRpc3RhbmNlID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX0xFTkdUSDtcclxuICAgICAgICAgICAgaWYgKG9mZnNldCA+IDApIHtcclxuICAgICAgICAgICAgICAgIGxlbmd0aCAtPSBvZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8IGxlbmd0aCkgeyBsZW5ndGggPSBkaXN0YW5jZTsgfVxyXG5cclxuXHJcbiAgICAgICAgICAgIHN3aXRjaCAocGFydC5kaXJlY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgRGlyZWN0aW9uLlVwOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsZW5ndGggPiAwKSB7IHRoaXMuZ3JhcGhpY3MuZHJhd1JlY3QoeCAtIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCAvIDIsIHkgLSBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCwgbGVuZ3RoKTsgfVxyXG4gICAgICAgICAgICAgICAgICAgIHkgLT0gbGVuZ3RoICsgQW5jaWVudEVtcGlyZXMuTElORV9TRUdNRU5UX1NQQUNJTkc7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5SaWdodDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KHgsIHkgLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB4ICs9IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uRG93bjpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KHggLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCB5LCBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEgsIGxlbmd0aCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB5ICs9IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uTGVmdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAobGVuZ3RoID4gMCkgeyB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KHggLSBsZW5ndGgsIHkgLSBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfV0lEVEggLyAyLCBsZW5ndGgsIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9XSURUSCk7IH1cclxuICAgICAgICAgICAgICAgICAgICB4IC09IGxlbmd0aCArIEFuY2llbnRFbXBpcmVzLkxJTkVfU0VHTUVOVF9TUEFDSU5HO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkaXN0YW5jZSAtPSBsZW5ndGggKyBBbmNpZW50RW1waXJlcy5MSU5FX1NFR01FTlRfU1BBQ0lORztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRBY3RpdmVQb3MoKTogUG9zIHtcclxuICAgICAgICAvLyBwb3MgYWx3YXlzIGluc2lkZSBjYW52YXNcclxuICAgICAgICBsZXQgeCA9IE1hdGguZmxvb3IoU3ByaXRlLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci54IC8gQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICBsZXQgeSA9IE1hdGguZmxvb3IoU3ByaXRlLmdhbWUuaW5wdXQuYWN0aXZlUG9pbnRlci55IC8gQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFKTtcclxuICAgICAgICByZXR1cm4gbmV3IFBvcyh4LCB5KTtcclxuICAgIH1cclxuICAgIG9uRG93bigpIHtcclxuICAgICAgICAvLyBkaWZmZXJlbnRpYXRlIG9uIHdoYXQgd2UgY2xpY2tlZFxyXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmdldEFjdGl2ZVBvcygpO1xyXG4gICAgICAgIHRoaXMuY2xpY2tDYWxsYmFjay5jYWxsKHRoaXMuY2xpY2tDb250ZXh0LCBwb3MpO1xyXG4gICAgfVxyXG4gICAgc2hvd1dheSh3YXlwb2ludHM6IFdheXBvaW50W10pIHtcclxuICAgICAgICB0aGlzLndheSA9IHdheXBvaW50cztcclxuICAgICAgICB0aGlzLnVwZGF0ZUxpbmUodGhpcy5nZXRBY3RpdmVQb3MoKSk7XHJcbiAgICB9XHJcbiAgICBoaWRlV2F5KCkge1xyXG4gICAgICAgIHRoaXMud2F5ID0gbnVsbDtcclxuICAgICAgICB0aGlzLmxpbmUgPSBudWxsO1xyXG4gICAgICAgIGlmICghIXRoaXMubW92ZUN1cnNvcikge1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVDdXJzb3IuZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm1vdmVDdXJzb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZUxpbmUoZW5kOiBQb3MpOiBib29sZWFuIHtcclxuICAgICAgICBsZXQgd2F5cG9pbnQgPSBQYXRoZmluZGVyLmZpbmRQb3NpdGlvbkluTGlzdChlbmQsIHRoaXMud2F5KTtcclxuICAgICAgICBpZiAoIXdheXBvaW50KSB7IHJldHVybiBmYWxzZTsgfS8vIGVuZCBpcyBub3QgaW4gcmFuZ2VcclxuICAgICAgICB0aGlzLmxpbmUgPSBQYXRoZmluZGVyLmdldExpbmVUb1dheXBvaW50KHdheXBvaW50KTtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiaW50ZXJmYWNlIEZyYW1lUmVjdCB7XHJcbiAgICB4OiBudW1iZXI7XHJcbiAgICB5OiBudW1iZXI7XHJcbiAgICB3aWR0aDogbnVtYmVyO1xyXG4gICAgaGVpZ2h0OiBudW1iZXI7XHJcbiAgICBba2V5OiBzdHJpbmddOiBudW1iZXI7XHJcbn1cclxuZW51bSBGcmFtZUFuaW1hdGlvbiB7XHJcbiAgICBOb25lID0gMCxcclxuICAgIFNob3cgPSAxLFxyXG4gICAgSGlkZSA9IDIsXHJcbiAgICBDaGFuZ2UgPSA0LFxyXG4gICAgV2lyZSA9IDhcclxufVxyXG5jbGFzcyBGcmFtZSB7XHJcbiAgICBzdGF0aWMgZ2FtZTogUGhhc2VyLkdhbWU7XHJcbiAgICBzdGF0aWMgQk9SREVSX1NJWkU6IG51bWJlciA9IDI0O1xyXG4gICAgc3RhdGljIEFOSU1fU1RFUFM6IG51bWJlciA9IDE1O1xyXG4gICAgc3RhdGljIGFsbDogRnJhbWVbXTtcclxuICAgIHN0YXRpYyBmaWQ6IG51bWJlciA9IDA7XHJcblxyXG4gICAgY29udGVudEdyb3VwOiBQaGFzZXIuR3JvdXA7XHJcbiAgICBib3JkZXJHcm91cDogUGhhc2VyLkdyb3VwO1xyXG4gICAgZ3JhcGhpY3M6IFBoYXNlci5HcmFwaGljcztcclxuXHJcbiAgICByZXVzZV90aWxlczogUGhhc2VyLkltYWdlW107XHJcblxyXG4gICAgYWxpZ246IERpcmVjdGlvbjtcclxuICAgIGFuaW1hdGlvbl9kaXJlY3Rpb246IERpcmVjdGlvbjtcclxuICAgIGJvcmRlcjogRGlyZWN0aW9uO1xyXG5cclxuICAgIGFuaW1hdGlvbjogRnJhbWVBbmltYXRpb247XHJcblxyXG4gICAgd2lkdGg6IG51bWJlcjtcclxuICAgIGhlaWdodDogbnVtYmVyO1xyXG5cclxuICAgIGN1cnJlbnQ6IEZyYW1lUmVjdDtcclxuICAgIHRhcmdldDogRnJhbWVSZWN0O1xyXG4gICAgc3BlZWQ6IEZyYW1lUmVjdDtcclxuICAgIGFjYzogRnJhbWVSZWN0O1xyXG5cclxuICAgIGZpZDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBzdGF0aWMgZ2V0VGlsZU5hbWVGb3JEaXJlY3Rpb24oZGlyOiBEaXJlY3Rpb24pOiBzdHJpbmcge1xyXG4gICAgICAgIC8vIHN1ZmZpeCBvZiB0aGUgdGlsZSBuYW1lIGlzIGFscmVhZHkgdGhlIGludCB2YWx1ZSBvZiBkaXJcclxuICAgICAgICByZXR1cm4gXCJtZW51L1wiICsgZGlyO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhZGQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFsaWduOiBEaXJlY3Rpb24sIGJvcmRlcjogRGlyZWN0aW9uLCBhbmltX2Rpcj86IERpcmVjdGlvbikge1xyXG4gICAgICAgIGxldCBmcmFtZSA9IG5ldyBGcmFtZSh3aWR0aCwgaGVpZ2h0LCBhbGlnbiwgYm9yZGVyLCBhbmltX2Rpcik7XHJcbiAgICAgICAgZnJhbWUuZmlkID0gRnJhbWUuZmlkO1xyXG4gICAgICAgIEZyYW1lLmZpZCsrO1xyXG4gICAgICAgIEZyYW1lLmFsbC5wdXNoKGZyYW1lKTtcclxuICAgICAgICByZXR1cm4gZnJhbWU7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZGVzdHJveShmcmFtZTogRnJhbWUpOiBib29sZWFuIHtcclxuICAgICAgICBmcmFtZS5kZXN0cm95KCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBGcmFtZS5hbGwubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKEZyYW1lLmFsbFtpXS5maWQgPT09IGZyYW1lLmZpZCkge1xyXG4gICAgICAgICAgICAgICAgRnJhbWUuYWxsLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHN0YXRpYyB1cGRhdGUoc3RlcHM6IG51bWJlcikge1xyXG4gICAgICAgIGZvciAobGV0IGZyYW1lIG9mIEZyYW1lLmFsbCkge1xyXG4gICAgICAgICAgICBmcmFtZS51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHN0YXRpYyBnZXRSZWN0KHg6IG51bWJlciwgeTogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcik6IEZyYW1lUmVjdCB7XHJcbiAgICAgICAgcmV0dXJuIHt4OiB4LCB5OiB5LCB3aWR0aDogd2lkdGgsIGhlaWdodDogaGVpZ2h0fTtcclxuICAgIH1cclxuICAgIHN0YXRpYyBjb3B5UmVjdChmcjogRnJhbWVSZWN0KTogRnJhbWVSZWN0IHtcclxuICAgICAgICByZXR1cm4ge3g6IGZyLngsIHk6IGZyLnksIHdpZHRoOiBmci53aWR0aCwgaGVpZ2h0OiBmci5oZWlnaHR9O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBhbGlnbjogRGlyZWN0aW9uLCBib3JkZXI6IERpcmVjdGlvbiwgYW5pbV9kaXI/OiBEaXJlY3Rpb24pIHtcclxuXHJcbiAgICAgICAgdGhpcy5yZXVzZV90aWxlcyA9IFtdO1xyXG5cclxuICAgICAgICB0aGlzLmFsaWduID0gYWxpZ247XHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25fZGlyZWN0aW9uID0gISFhbmltX2RpciA/IGFuaW1fZGlyIDogYWxpZ247XHJcbiAgICAgICAgdGhpcy5ib3JkZXIgPSBib3JkZXI7XHJcblxyXG4gICAgICAgIHRoaXMuY29udGVudEdyb3VwID0gRnJhbWUuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICB0aGlzLmNvbnRlbnRHcm91cC52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYm9yZGVyR3JvdXAgPSBGcmFtZS5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmdyYXBoaWNzID0gRnJhbWUuZ2FtZS5hZGQuZ3JhcGhpY3MoMCwgMCwgdGhpcy5ib3JkZXJHcm91cCk7XHJcblxyXG4gICAgICAgIHRoaXMuYW5pbWF0aW9uID0gRnJhbWVBbmltYXRpb24uTm9uZTtcclxuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGdldENvbnRlbnRHcm91cCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jb250ZW50R3JvdXA7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdyhhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuXHJcbiAgICAgICAgdGhpcy50YXJnZXQgPSBGcmFtZS5nZXRSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuXHJcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBvZmZzZXQgdXNpbmcgdGhlIGFsaWdubWVudFxyXG4gICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnggPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueCA9IEZyYW1lLmdhbWUud2lkdGggLSB0aGlzLnRhcmdldC53aWR0aDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC54ID0gTWF0aC5mbG9vcigoRnJhbWUuZ2FtZS53aWR0aCAtIHRoaXMudGFyZ2V0LndpZHRoKSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueSA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnkgPSBGcmFtZS5nYW1lLmhlaWdodCAtIHRoaXMudGFyZ2V0LmhlaWdodDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gTWF0aC5mbG9vcigoRnJhbWUuZ2FtZS5oZWlnaHQgLSB0aGlzLnRhcmdldC5oZWlnaHQpIC8gMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBGcmFtZS5jb3B5UmVjdCh0aGlzLnRhcmdldCk7XHJcbiAgICAgICAgaWYgKGFuaW1hdGUpIHtcclxuICAgICAgICAgICAgLy8gY2FsY3VsYXRlIHN0YXJ0aW5nIG9mZnNldCB1c2luZyB0aGUgYW5pbV9kaXJlY3Rpb25cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5TaG93O1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQueCA9IC10aGlzLmN1cnJlbnQud2lkdGg7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uUmlnaHQpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC54ID0gRnJhbWUuZ2FtZS53aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LnkgPSAtdGhpcy5jdXJyZW50LmhlaWdodDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5Eb3duKSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQueSA9IEZyYW1lLmdhbWUuaGVpZ2h0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uIHw9IEZyYW1lQW5pbWF0aW9uLldpcmU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQueCA9IE1hdGguZmxvb3IoRnJhbWUuZ2FtZS53aWR0aCAvIDIpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LnkgPSBNYXRoLmZsb29yKEZyYW1lLmdhbWUuaGVpZ2h0IC8gMik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQud2lkdGggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50LmhlaWdodCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVTcGVlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVPZmZzZXQoKTtcclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUZyYW1lKHRoaXMudGFyZ2V0LndpZHRoLCB0aGlzLnRhcmdldC5oZWlnaHQpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRHcm91cC52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEZyYW1lLmdhbWUud29ybGQuYnJpbmdUb1RvcCh0aGlzLmNvbnRlbnRHcm91cCk7XHJcbiAgICAgICAgRnJhbWUuZ2FtZS53b3JsZC5icmluZ1RvVG9wKHRoaXMuYm9yZGVyR3JvdXApO1xyXG4gICAgICAgIHRoaXMuYm9yZGVyR3JvdXAudmlzaWJsZSA9IHRydWU7XHJcblxyXG4gICAgfVxyXG4gICAgaGlkZShhbmltYXRlOiBib29sZWFuID0gZmFsc2UpIHtcclxuICAgICAgICBpZiAoIWFuaW1hdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5ib3JkZXJHcm91cC52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudEdyb3VwLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgdGFyZ2V0IHBvc2l0aW9uIHVzaW5nIHRoZSBhbmltYXRpb24gZGlyZWN0aW9uXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5IaWRlO1xyXG4gICAgICAgIHRoaXMudGFyZ2V0ID0gRnJhbWUuY29weVJlY3QodGhpcy5jdXJyZW50KTtcclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5MZWZ0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnggPSAtdGhpcy50YXJnZXQud2lkdGg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb25fZGlyZWN0aW9uICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LnggPSBGcmFtZS5nYW1lLndpZHRoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gLXRoaXMudGFyZ2V0LmhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gJiBEaXJlY3Rpb24uRG93bikgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gRnJhbWUuZ2FtZS5oZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbl9kaXJlY3Rpb24gPT0gRGlyZWN0aW9uLk5vbmUpIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uV2lyZTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVUaWxlcygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueCA9IE1hdGguZmxvb3IoRnJhbWUuZ2FtZS53aWR0aCAvIDIpO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC55ID0gTWF0aC5mbG9vcihGcmFtZS5nYW1lLmhlaWdodCAvIDIpO1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC53aWR0aCA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMudGFyZ2V0LmhlaWdodCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuY2FsY3VsYXRlU3BlZWQoKTtcclxuICAgIH1cclxuICAgIHVwZGF0ZVNpemUod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIGFuaW1hdGU6IGJvb2xlYW4gPSBmYWxzZSkge1xyXG4gICAgICAgIC8vIGZ1Y2tcclxuICAgICAgICAvLyBhZGp1c3Qgb2Zmc2V0IGlmIGFsaWdubWVudCBpcyB0b3Agb3IgbGVmdCwgc28gbm8gZGlmZmVyZW5jZSBhdCBmaXJzdCBub3RpY2VcclxuXHJcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xyXG5cclxuICAgICAgICBpZiAoYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IEZyYW1lQW5pbWF0aW9uLkNoYW5nZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYW5pbWF0aW9uX2RpcmVjdGlvbiA9PSBEaXJlY3Rpb24uTm9uZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gfD0gRnJhbWVBbmltYXRpb24uV2lyZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIHRha2UgdGhlIGJpZ2dlc3QgcmVjdCBwb3NzaWJsZVxyXG4gICAgICAgICAgICAgICAgd2lkdGggPSBNYXRoLm1heCh3aWR0aCwgdGhpcy5jdXJyZW50LndpZHRoKTtcclxuICAgICAgICAgICAgICAgIGhlaWdodCA9IE1hdGgubWF4KGhlaWdodCwgdGhpcy5jdXJyZW50LmhlaWdodCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgb2Zmc2V0IHVzaW5nIHRoZSBhbGlnbm1lbnRcclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQueCAtPSB3aWR0aCAtIHRoaXMuY3VycmVudC53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueCAtPSB3aWR0aCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5SaWdodCkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLnRhcmdldC54ID0gRnJhbWUuZ2FtZS53aWR0aCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueCA9IE1hdGguZmxvb3IoKEZyYW1lLmdhbWUud2lkdGggLSB0aGlzLndpZHRoKSAvIDIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LnkgLT0gaGVpZ2h0IC0gdGhpcy5jdXJyZW50LmhlaWdodDtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueSAtPSBoZWlnaHQgLSB0aGlzLmhlaWdodDtcclxuICAgICAgICB9IGVsc2UgaWYgKCh0aGlzLmFsaWduICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueSA9IEZyYW1lLmdhbWUuaGVpZ2h0IC0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy50YXJnZXQueSA9IE1hdGguZmxvb3IoKEZyYW1lLmdhbWUuaGVpZ2h0IC0gdGhpcy5oZWlnaHQpIC8gMik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgPT0gMCkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50LmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy50YXJnZXQud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLnRhcmdldC5oZWlnaHQgPSBoZWlnaHQ7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHdpZHRoICsgXCIgLSBcIiArIGhlaWdodCk7XHJcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5jdXJyZW50KTtcclxuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnRhcmdldCk7XHJcblxyXG4gICAgICAgIGlmIChhbmltYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlU3BlZWQoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnQueCA9IHRoaXMudGFyZ2V0Lng7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudC55ID0gdGhpcy50YXJnZXQueTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLldpcmUpID09IDApIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVGcmFtZSh3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuICAgIHVwZGF0ZShzdGVwczogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGlvbiA9PSBGcmFtZUFuaW1hdGlvbi5Ob25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBmaW5pc2hlZF94ID0gdGhpcy5hZGRHYWluKFwieFwiLCBzdGVwcyk7XHJcbiAgICAgICAgbGV0IGZpbmlzaGVkX3kgPSB0aGlzLmFkZEdhaW4oXCJ5XCIsIHN0ZXBzKTtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coKGZpbmlzaGVkX3ggPyAxIDogMCkgKyBcIiAtIFwiICsgKGZpbmlzaGVkX3kgPyAxIDogMCkpO1xyXG5cclxuICAgICAgICBsZXQgZmluaXNoZWRfd2lkdGggPSB0cnVlO1xyXG4gICAgICAgIGxldCBmaW5pc2hlZF9oZWlnaHQgPSB0cnVlO1xyXG4gICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5XaXJlKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIHNpemUgd2l0aCB0aGUgd2lyZSBhbmltYXRpb25cclxuICAgICAgICAgICAgZmluaXNoZWRfd2lkdGggPSB0aGlzLmFkZEdhaW4oXCJ3aWR0aFwiLCBzdGVwcyk7XHJcbiAgICAgICAgICAgIGZpbmlzaGVkX2hlaWdodCA9IHRoaXMuYWRkR2FpbihcImhlaWdodFwiLCBzdGVwcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmluaXNoZWRfeCAmJiBmaW5pc2hlZF95ICYmIGZpbmlzaGVkX3dpZHRoICYmIGZpbmlzaGVkX2hlaWdodCkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcImZpbmlzaGVkXCIpO1xyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5jbGVhcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCh0aGlzLmFuaW1hdGlvbiAmIEZyYW1lQW5pbWF0aW9uLkhpZGUpID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZyYW1lKHRoaXMudGFyZ2V0LndpZHRoLCB0aGlzLnRhcmdldC5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudEdyb3VwLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgodGhpcy5hbmltYXRpb24gJiBGcmFtZUFuaW1hdGlvbi5DaGFuZ2UpICE9IDApIHtcclxuICAgICAgICAgICAgICAgIC8vIFRPRE86IHJlbW92ZSB0aWxlcyBvdXQgb2Ygc2lnaHRcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC53aWR0aCA9IHRoaXMud2lkdGg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnQuaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuYWxpZ24gJiBEaXJlY3Rpb24uTGVmdCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC54ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5hbGlnbiAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudC55ID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0ID0gRnJhbWUuY29weVJlY3QodGhpcy5jdXJyZW50KTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZyYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uSGlkZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBGcmFtZUFuaW1hdGlvbi5Ob25lO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYW5pbWF0aW9uICYgRnJhbWVBbmltYXRpb24uV2lyZSkgIT0gMCkge1xyXG4gICAgICAgICAgICAvLyBuaWNlIGFuaW1hdGlvbiBmb3IgZnJhbWUgd2l0aCBubyBhbGlnbm1lbnQgJiBubyBhbmltYXRpb24gZGlyZWN0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICAgICAgdGhpcy5ncmFwaGljcy5saW5lU3R5bGUoMSwgMHhmZmZmZmYpO1xyXG4gICAgICAgICAgICB0aGlzLmdyYXBoaWNzLmRyYXdSZWN0KDAsIDAsIHRoaXMuY3VycmVudC53aWR0aCwgdGhpcy5jdXJyZW50LmhlaWdodCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlT2Zmc2V0KCk7XHJcbiAgICB9XHJcbiAgICBkZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuY29udGVudEdyb3VwLmRlc3Ryb3kodHJ1ZSk7XHJcbiAgICAgICAgdGhpcy5ib3JkZXJHcm91cC5kZXN0cm95KHRydWUpO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVPZmZzZXQoKSB7XHJcbiAgICAgICAgbGV0IHggPSB0aGlzLmN1cnJlbnQueDtcclxuICAgICAgICBsZXQgeSA9IHRoaXMuY3VycmVudC55O1xyXG5cclxuICAgICAgICBsZXQgY194ID0gMDtcclxuICAgICAgICBsZXQgY195ID0gMDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY194ICs9IDY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uVXApICE9IDApIHtcclxuICAgICAgICAgICAgY195ICs9IDY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJvcmRlckdyb3VwLnggPSB4O1xyXG4gICAgICAgIHRoaXMuYm9yZGVyR3JvdXAueSA9IHk7XHJcbiAgICAgICAgdGhpcy5jb250ZW50R3JvdXAueCA9IGNfeDtcclxuICAgICAgICB0aGlzLmNvbnRlbnRHcm91cC55ID0gY195O1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSB1cGRhdGVGcmFtZSh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xyXG5cclxuICAgICAgICBsZXQgY193aWR0aCA9IHdpZHRoO1xyXG4gICAgICAgIGxldCBjX2hlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpICE9IDApIHtcclxuICAgICAgICAgICAgY193aWR0aCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLlJpZ2h0KSAhPSAwKSB7XHJcbiAgICAgICAgICAgIGNfd2lkdGggLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkgIT0gMCkge1xyXG4gICAgICAgICAgICBjX2hlaWdodCAtPSA2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkRvd24pICE9IDApIHtcclxuICAgICAgICAgICAgY19oZWlnaHQgLT0gNjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5jb250ZW50R3JvdXAud2lkdGggPSBjX3dpZHRoO1xyXG4gICAgICAgIHRoaXMuY29udGVudEdyb3VwLmhlaWdodCA9IGNfaGVpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgc2hvd190aWxlc194ID0gTWF0aC5jZWlsKHdpZHRoIC8gRnJhbWUuQk9SREVSX1NJWkUpIC0gMjtcclxuICAgICAgICBsZXQgc2hvd190aWxlc195ID0gTWF0aC5jZWlsKGhlaWdodCAvIEZyYW1lLkJPUkRFUl9TSVpFKSAtIDI7XHJcblxyXG4gICAgICAgIHRoaXMuZ3JhcGhpY3MuY2xlYXIoKTtcclxuICAgICAgICB0aGlzLmdyYXBoaWNzLmxpbmVTdHlsZSgwKTtcclxuICAgICAgICB0aGlzLmdyYXBoaWNzLmJlZ2luRmlsbCgweGNlYmVhNSk7XHJcbiAgICAgICAgdGhpcy5ncmFwaGljcy5kcmF3UmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgICB0aGlzLmdyYXBoaWNzLmVuZEZpbGwoKTtcclxuXHJcbiAgICAgICAgbGV0IHRpbGVzOiBQaGFzZXIuSW1hZ2VbXSA9IFtdO1xyXG5cclxuICAgICAgICBsZXQgb2Zmc2V0X3ggPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNob3dfdGlsZXNfeDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJvcmRlciAmIERpcmVjdGlvbi5VcCkge1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKG9mZnNldF94LCAwLCBEaXJlY3Rpb24uVXApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uRG93bikge1xyXG4gICAgICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKG9mZnNldF94LCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgRGlyZWN0aW9uLkRvd24pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvZmZzZXRfeCArPSBGcmFtZS5CT1JERVJfU0laRTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvZmZzZXRfeSA9IEZyYW1lLkJPUkRFUl9TSVpFO1xyXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2hvd190aWxlc195OyBqKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYm9yZGVyICYgRGlyZWN0aW9uLkxlZnQpIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSgwLCBvZmZzZXRfeSwgRGlyZWN0aW9uLkxlZnQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5ib3JkZXIgJiBEaXJlY3Rpb24uUmlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSh3aWR0aCAtIEZyYW1lLkJPUkRFUl9TSVpFLCBvZmZzZXRfeSwgRGlyZWN0aW9uLlJpZ2h0KSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb2Zmc2V0X3kgKz0gRnJhbWUuQk9SREVSX1NJWkU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5VcCB8IERpcmVjdGlvbi5MZWZ0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUoMCwgMCwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLkxlZnQpKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgodGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0KSkgIT0gMCkge1xyXG4gICAgICAgICAgICB0aWxlcy5wdXNoKHRoaXMuZHJhd0JvcmRlclRpbGUod2lkdGggLSBGcmFtZS5CT1JERVJfU0laRSwgMCwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0KSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoKHRoaXMuYm9yZGVyICYgKERpcmVjdGlvbi5Eb3duIHwgRGlyZWN0aW9uLkxlZnQpKSAhPSAwKSB7XHJcbiAgICAgICAgICAgIHRpbGVzLnB1c2godGhpcy5kcmF3Qm9yZGVyVGlsZSgwLCBoZWlnaHQgLSBGcmFtZS5CT1JERVJfU0laRSwgdGhpcy5ib3JkZXIgJiAoRGlyZWN0aW9uLkRvd24gfCBEaXJlY3Rpb24uTGVmdCkpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCh0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5SaWdodCkpICE9IDApIHtcclxuICAgICAgICAgICAgdGlsZXMucHVzaCh0aGlzLmRyYXdCb3JkZXJUaWxlKHdpZHRoIC0gRnJhbWUuQk9SREVSX1NJWkUsIGhlaWdodCAtIEZyYW1lLkJPUkRFUl9TSVpFLCB0aGlzLmJvcmRlciAmIChEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5SaWdodCkpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMucmVtb3ZlVGlsZXMoKTtcclxuICAgICAgICB0aGlzLnJldXNlX3RpbGVzID0gdGlsZXM7XHJcbiAgICB9XHJcbiAgICBwcml2YXRlIGRyYXdCb3JkZXJUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyLCBkaXJlY3Rpb246IERpcmVjdGlvbikge1xyXG4gICAgICAgIGxldCByZXVzZTogUGhhc2VyLkltYWdlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yZXVzZV90aWxlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldXNlID0gdGhpcy5yZXVzZV90aWxlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICByZXVzZS5icmluZ1RvVG9wKCk7XHJcbiAgICAgICAgICAgIHJldXNlLnggPSB4O1xyXG4gICAgICAgICAgICByZXVzZS55ID0geTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXVzZSA9IEZyYW1lLmdhbWUuYWRkLmltYWdlKHgsIHksIFwic3ByaXRlc1wiLCBudWxsLCB0aGlzLmJvcmRlckdyb3VwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV1c2UudGludCA9IDB4ZmZmZmZmICogTWF0aC5yYW5kb20oKTtcclxuICAgICAgICByZXVzZS5mcmFtZU5hbWUgPSBGcmFtZS5nZXRUaWxlTmFtZUZvckRpcmVjdGlvbihkaXJlY3Rpb24pO1xyXG4gICAgICAgIHJldHVybiByZXVzZTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgYWRkR2Fpbih2YXJfbmFtZTogc3RyaW5nLCBzdGVwczogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3BlZWRbdmFyX25hbWVdID09IDApIHsgcmV0dXJuIHRydWU7IH1cclxuXHJcbiAgICAgICAgdGhpcy5hY2NbdmFyX25hbWVdICs9IHRoaXMuc3BlZWRbdmFyX25hbWVdICogc3RlcHM7XHJcblxyXG4gICAgICAgIGxldCBkID0gTWF0aC5mbG9vcih0aGlzLmFjY1t2YXJfbmFtZV0pO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFt2YXJfbmFtZV0gKz0gZDtcclxuICAgICAgICB0aGlzLmFjY1t2YXJfbmFtZV0gLT0gZDtcclxuICAgICAgICBpZiAoZCA8IDAgJiYgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSA8IHRoaXMudGFyZ2V0W3Zhcl9uYW1lXSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID0gdGhpcy50YXJnZXRbdmFyX25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9ZWxzZSBpZiAoZCA+IDAgJiYgdGhpcy5jdXJyZW50W3Zhcl9uYW1lXSA+IHRoaXMudGFyZ2V0W3Zhcl9uYW1lXSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRbdmFyX25hbWVdID0gdGhpcy50YXJnZXRbdmFyX25hbWVdO1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVTcGVlZCgpIHtcclxuICAgICAgICB0aGlzLnNwZWVkID0gRnJhbWUuZ2V0UmVjdCgodGhpcy50YXJnZXQueCAtIHRoaXMuY3VycmVudC54KSAvIEZyYW1lLkFOSU1fU1RFUFMsICh0aGlzLnRhcmdldC55IC0gdGhpcy5jdXJyZW50LnkpIC8gRnJhbWUuQU5JTV9TVEVQUywgKHRoaXMudGFyZ2V0LndpZHRoIC0gdGhpcy5jdXJyZW50LndpZHRoKSAvIEZyYW1lLkFOSU1fU1RFUFMsICh0aGlzLnRhcmdldC5oZWlnaHQgLSB0aGlzLmN1cnJlbnQuaGVpZ2h0KSAvIEZyYW1lLkFOSU1fU1RFUFMpO1xyXG4gICAgICAgIHRoaXMuYWNjID0gRnJhbWUuZ2V0UmVjdCgwLCAwLCAwLCAwKTtcclxuICAgIH1cclxuICAgIHByaXZhdGUgcmVtb3ZlVGlsZXMoKSB7XHJcbiAgICAgICAgd2hpbGUgKHRoaXMucmV1c2VfdGlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsZXQgdGlsZSA9IHRoaXMucmV1c2VfdGlsZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgdGlsZS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiIsImludGVyZmFjZSBGcmFtZURhdGEge1xyXG4gICAgZnJhbWU6IEZyYW1lO1xyXG4gICAgY29udGVudDogRnJhbWVDb250ZW50W107XHJcbn1cclxuaW50ZXJmYWNlIEZyYW1lQ29udGVudCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBvYmplY3Q6IGFueTsgLy8gU3ByaXRlIG9yIEJpdG1hcFRleHRcclxufVxyXG5cclxuY2xhc3MgRGlhbG9nIHtcclxuXHJcbiAgICBzdGF0aWMgZ2FtZTogUGhhc2VyLkdhbWU7XHJcblxyXG4gICAgc3RhdGljIGZyYW1lTW9uZXk6IEZyYW1lRGF0YTtcclxuXHJcbiAgICBzdGF0aWMgc2hvd01vbmV5KGFsbGlhbmNlOiBBbGxpYW5jZSwgZ29sZDogbnVtYmVyKSB7XHJcblxyXG4gICAgICAgIGxldCBnb2xkSWNvbjogUGhhc2VyLkltYWdlO1xyXG4gICAgICAgIGxldCBnb2xkQW1vdW50OiBQaGFzZXIuQml0bWFwVGV4dDtcclxuXHJcbiAgICAgICAgaWYgKCFEaWFsb2cuZnJhbWVNb25leSkge1xyXG5cclxuICAgICAgICAgICAgbGV0IGZyYW1lID0gRnJhbWUuYWRkKDY0LCA0MCwgRGlyZWN0aW9uLlVwIHwgRGlyZWN0aW9uLlJpZ2h0LCBEaXJlY3Rpb24uRG93biB8IERpcmVjdGlvbi5MZWZ0LCBEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgICAgICAgICBsZXQgY29udGVudEdyb3VwID0gZnJhbWUuZ2V0Q29udGVudEdyb3VwKCk7XHJcbiAgICAgICAgICAgIGxldCBjb250ZW50OiBGcmFtZUNvbnRlbnRbXSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgZ29sZEljb24gPSBEaWFsb2cuZ2FtZS5hZGQuc3ByaXRlKDAsIDAsIFwic3ByaXRlc1wiLCBudWxsLCBjb250ZW50R3JvdXApO1xyXG4gICAgICAgICAgICBnb2xkSWNvbi5mcmFtZU5hbWUgPSBcImdvbGRcIjtcclxuICAgICAgICAgICAgY29udGVudC5wdXNoKHtuYW1lOiBcImljb25cIiwgb2JqZWN0OiBnb2xkSWNvbn0pO1xyXG5cclxuICAgICAgICAgICAgZ29sZEFtb3VudCA9IERpYWxvZy5nYW1lLmFkZC5iaXRtYXBUZXh0KDM1LCA1LCBcImFlZm9udFwiLCBudWxsLCBudWxsLCBjb250ZW50R3JvdXApO1xyXG5cclxuICAgICAgICAgICAgRGlhbG9nLmZyYW1lTW9uZXkgPSB7ZnJhbWU6IGZyYW1lLCBjb250ZW50OiBjb250ZW50fTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBnb2xkSWNvbiA9IERpYWxvZy5nZXRPYmplY3RGcm9tRnJhbWVEYXRhKFwiaWNvblwiLCBEaWFsb2cuZnJhbWVNb25leSk7XHJcbiAgICAgICAgICAgIGdvbGRBbW91bnQgPSBEaWFsb2cuZ2V0T2JqZWN0RnJvbUZyYW1lRGF0YShcImFtb3VudFwiLCBEaWFsb2cuZnJhbWVNb25leSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnb2xkQW1vdW50LnRleHQgPSBnb2xkLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgfVxyXG4gICAgc3RhdGljIGdldE9iamVjdEZyb21GcmFtZURhdGEobmFtZTogc3RyaW5nLCBkYXRhOiBGcmFtZURhdGEpIHtcclxuICAgICAgICBmb3IgKGxldCBvYmogb2YgZGF0YS5jb250ZW50KSB7XHJcbiAgICAgICAgICAgIGlmIChvYmoubmFtZSA9PSBuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqLm9iamVjdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcblxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiYW5jaWVudGVtcGlyZXMudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwidXRpbC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJzcHJpdGUudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiZW50aXR5LnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInNtb2tlLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInRpbGVtYW5hZ2VyLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cInBhdGhmaW5kZXIudHNcIiAvPlxyXG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwiY3Vyc29yLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImZyYW1lLnRzXCIgLz5cclxuLy8vIDxyZWZlcmVuY2UgcGF0aD1cImRpYWxvZy50c1wiIC8+XHJcblxyXG5pbnRlcmZhY2UgU3RhcnRPYmplY3Qge1xyXG4gICAgZW50aXRpZXM6IEVudGl0eVN0YXJ0W107XHJcbiAgICBidWlsZGluZ3M6IEJ1aWxkaW5nU3RhcnRbXTtcclxuICAgIHR1cm46IEFsbGlhbmNlO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgRGF0YU9iamVjdCB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBzaXplOiBudW1iZXI7XHJcbiAgICBzdGFydDogU3RhcnRPYmplY3Q7XHJcbiAgICBtYXA6IHN0cmluZztcclxufVxyXG5cclxuY2xhc3MgR2FtZUNvbnRyb2xsZXIgZXh0ZW5kcyBQaGFzZXIuU3RhdGUge1xyXG5cclxuICAgIG1hcDogUGhhc2VyLlRpbGVtYXA7XHJcbiAgICBkYXRhOiBEYXRhT2JqZWN0O1xyXG4gICAgbWFwTmFtZTogc3RyaW5nO1xyXG5cclxuICAgIHRpbGVNYW5hZ2VyOiBUaWxlTWFuYWdlcjtcclxuICAgIHBhdGhmaW5kZXI6IFBhdGhmaW5kZXI7XHJcblxyXG4gICAgdHVybjogQWxsaWFuY2U7XHJcbiAgICBzZWxlY3RlZDogRW50aXR5ID0gbnVsbDtcclxuXHJcbiAgICBjdXJzb3I6IEN1cnNvcjtcclxuICAgIGFjdGl2ZVdheXBvaW50czogV2F5cG9pbnRbXTtcclxuXHJcbiAgICBhbmltX3N0YXRlOiBudW1iZXIgPSAwO1xyXG4gICAgYWNjOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKCkge1xyXG4gICAgICAgIHN1cGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdChuYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLm1hcE5hbWUgPSBuYW1lO1xyXG4gICAgfVxyXG4gICAgcHJlbG9hZCgpIHtcclxuICAgICAgICB0aGlzLmdhbWUubG9hZC5qc29uKFwibWFwXCIsIFwiZGF0YS9cIiArIHRoaXMubWFwTmFtZSArIFwiLmpzb25cIik7XHJcbiAgICB9XHJcbiAgICBjcmVhdGUoKSB7XHJcblxyXG4gICAgICAgIFNwcml0ZS5nYW1lID0gdGhpcy5nYW1lO1xyXG4gICAgICAgIFRpbGVNYW5hZ2VyLmdhbWUgPSB0aGlzLmdhbWU7XHJcbiAgICAgICAgRnJhbWUuZ2FtZSA9IHRoaXMuZ2FtZTtcclxuICAgICAgICBEaWFsb2cuZ2FtZSA9IHRoaXMuZ2FtZTtcclxuXHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5nYW1lLmNhY2hlLmdldEpTT04oXCJtYXBcIik7XHJcbiAgICAgICAgdGhpcy5kYXRhLm1hcCA9IHRoaXMuZGF0YS5tYXAucmVwbGFjZSgvXFxzL2csIFwiXCIpO1xyXG4gICAgICAgIHRoaXMudHVybiA9IHRoaXMuZGF0YS5zdGFydC50dXJuIHx8IEFsbGlhbmNlLkJsdWU7XHJcblxyXG4gICAgICAgIFRpbGVNYW5hZ2VyLnRpbGVNYXAgPSB0aGlzLmdhbWUuYWRkLnRpbGVtYXAoKTtcclxuICAgICAgICBUaWxlTWFuYWdlci50aWxlTWFwLmFkZFRpbGVzZXRJbWFnZShcInRpbGVzZXRcIiwgbnVsbCwgQW5jaWVudEVtcGlyZXMuVElMRV9TSVpFLCBBbmNpZW50RW1waXJlcy5USUxFX1NJWkUpO1xyXG5cclxuICAgICAgICB0aGlzLnRpbGVNYW5hZ2VyID0gbmV3IFRpbGVNYW5hZ2VyKHRoaXMuZGF0YS5tYXAsIHRoaXMuZGF0YS5zdGFydC5idWlsZGluZ3MsIHRoaXMuZGF0YS5zaXplLCB0aGlzLmRhdGEuc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5wYXRoZmluZGVyID0gbmV3IFBhdGhmaW5kZXIodGhpcy50aWxlTWFuYWdlcik7XHJcblxyXG4gICAgICAgIEN1cnNvci5pbnRlcmFjdGlvbkdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG5cclxuICAgICAgICBTbW9rZS5hbGwgPSBbXTtcclxuICAgICAgICBTbW9rZS5ncm91cCA9IHRoaXMuZ2FtZS5hZGQuZ3JvdXAoKTtcclxuICAgICAgICBTbW9rZS5sb2FkSG91c2VzKHRoaXMudGlsZU1hbmFnZXIuZ2V0T2NjdXBpZWRIb3VzZXMoKSk7XHJcblxyXG4gICAgICAgIEVudGl0eS5hbGwgPSBbXTtcclxuICAgICAgICBFbnRpdHkuZ3JvdXAgPSB0aGlzLmdhbWUuYWRkLmdyb3VwKCk7XHJcbiAgICAgICAgRW50aXR5LnBhdGhmaW5kZXIgPSB0aGlzLnBhdGhmaW5kZXI7XHJcbiAgICAgICAgRW50aXR5LmxvYWRFbnRpdGllcyh0aGlzLmRhdGEuc3RhcnQuZW50aXRpZXMpO1xyXG5cclxuICAgICAgICBGcmFtZS5hbGwgPSBbXTtcclxuXHJcbiAgICAgICAgQ3Vyc29yLmN1cnNvckdyb3VwID0gdGhpcy5nYW1lLmFkZC5ncm91cCgpO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yID0gbmV3IEN1cnNvcih0aGlzLmNsaWNrLCB0aGlzKTtcclxuXHJcbiAgICAgICAgdGhpcy50aWxlTWFuYWdlci5kcmF3KCk7XHJcbiAgICB9XHJcbiAgICBjbGljayhwb3NpdGlvbjogUG9zKSB7XHJcblxyXG4gICAgICAgIGxldCBwcmV2X3NlbGVjdGVkID0gdGhpcy5zZWxlY3RlZDtcclxuICAgICAgICBsZXQgZW50aXR5ID0gRW50aXR5LmdldEVudGl0eUF0KHBvc2l0aW9uKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWQpIHtcclxuICAgICAgICAgICAgaWYgKCFlbnRpdHkgJiYgUGF0aGZpbmRlci5maW5kUG9zaXRpb25Jbkxpc3QocG9zaXRpb24sIHRoaXMuYWN0aXZlV2F5cG9pbnRzKSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAvLyB3ZSBhcmUgYWJsZSB0byB3YWxrIHRoZXJlXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIndhbGsgdG86IFwiICsgcG9zaXRpb24uZ2V0SW5mbygpKTtcclxuICAgICAgICAgICAgICAgIGxldCB3YXlwb2ludCA9IFBhdGhmaW5kZXIuZmluZFBvc2l0aW9uSW5MaXN0KHBvc2l0aW9uLCB0aGlzLmFjdGl2ZVdheXBvaW50cyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkLm1vdmUocG9zaXRpb24sIFBhdGhmaW5kZXIuZ2V0TGluZVRvV2F5cG9pbnQod2F5cG9pbnQpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmRlc2VsZWN0RW50aXR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoISFlbnRpdHkgJiYgZW50aXR5LmFsbGlhbmNlID09IHRoaXMudHVybiAmJiAoIXByZXZfc2VsZWN0ZWQgfHwgIXBvc2l0aW9uLm1hdGNoKHByZXZfc2VsZWN0ZWQucG9zaXRpb24pKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdEVudGl0eShlbnRpdHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9XHJcbiAgICBzZWxlY3RFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcclxuXHJcbiAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3RlZCBlbnRpdHk6IFwiICsgZW50aXR5LmdldEluZm8oKSk7XHJcblxyXG4gICAgICAgIHRoaXMuc2VsZWN0ZWQgPSBlbnRpdHk7XHJcbiAgICAgICAgbGV0IHdheXBvaW50cyA9IHRoaXMucGF0aGZpbmRlci5nZXRSZWFjaGFibGVXYXlwb2ludHNGb3JFbnRpdHkoZW50aXR5KTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdheXBvaW50cyA9IHdheXBvaW50cztcclxuICAgICAgICB0aGlzLnRpbGVNYW5hZ2VyLnNob3dXYWxrUmFuZ2Uod2F5cG9pbnRzKTtcclxuICAgICAgICB0aGlzLmN1cnNvci5zaG93V2F5KHdheXBvaW50cyk7XHJcbiAgICB9XHJcbiAgICBkZXNlbGVjdEVudGl0eSgpIHtcclxuICAgICAgICB0aGlzLnRpbGVNYW5hZ2VyLmhpZGVXYWxrUmFuZ2UodGhpcy5hY3RpdmVXYXlwb2ludHMpO1xyXG4gICAgICAgIHRoaXMuY3Vyc29yLmhpZGVXYXkoKTtcclxuICAgICAgICB0aGlzLmFjdGl2ZVdheXBvaW50cyA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RlZCA9IG51bGw7XHJcbiAgICB9XHJcbiAgICB1cGRhdGUoKSB7XHJcbiAgICAgICAgLy8gMSBzdGVwIGlzIDEvNjAgc2VjXHJcblxyXG4gICAgICAgIHRoaXMuYWNjICs9IHRoaXMudGltZS5lbGFwc2VkO1xyXG4gICAgICAgIGxldCBzdGVwcyA9IE1hdGguZmxvb3IodGhpcy5hY2MgLyAxNik7XHJcbiAgICAgICAgaWYgKHN0ZXBzIDw9IDApIHsgcmV0dXJuOyB9XHJcbiAgICAgICAgdGhpcy5hY2MgLT0gc3RlcHMgKiAxNjtcclxuICAgICAgICBpZiAoc3RlcHMgPiAyKSB7IHN0ZXBzID0gMjsgfVxyXG5cclxuICAgICAgICBFbnRpdHkudXBkYXRlKHN0ZXBzKTtcclxuICAgICAgICB0aGlzLmN1cnNvci51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIFNtb2tlLnVwZGF0ZShzdGVwcyk7XHJcbiAgICAgICAgdGhpcy50aWxlTWFuYWdlci51cGRhdGUoc3RlcHMpO1xyXG4gICAgICAgIEZyYW1lLnVwZGF0ZShzdGVwcyk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cInZlbmRvci9waGFzZXIuZC50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJtYWlubWVudS50c1wiIC8+XHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJnYW1lY29udHJvbGxlci50c1wiIC8+XHJcblxyXG5jbGFzcyBBbmNpZW50RW1waXJlcyB7XHJcblxyXG4gICAgc3RhdGljIFRJTEVfU0laRTogbnVtYmVyID0gMjQ7XHJcbiAgICBzdGF0aWMgV0FURVJfSU5URVJWQUxfTVM6IG51bWJlciA9IDQwMDtcclxuICAgIHN0YXRpYyBBTklNX0lOVDogbnVtYmVyID0gMjUwO1xyXG4gICAgc3RhdGljIEVOVElUSUVTOiBFbnRpdHlEYXRhW107XHJcbiAgICBzdGF0aWMgRU5USVRZX0FMTElBTkNFX0RJRkYgPSAyMjtcclxuXHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX0xFTkdUSCA9IDEwO1xyXG4gICAgc3RhdGljIExJTkVfU0VHTUVOVF9XSURUSCA9IDQ7XHJcbiAgICBzdGF0aWMgTElORV9TRUdNRU5UX1NQQUNJTkcgPSAyO1xyXG5cclxuICAgIHN0YXRpYyBnYW1lOiBQaGFzZXIuR2FtZTtcclxuICAgIG1haW5NZW51OiBNYWluTWVudTtcclxuICAgIGNvbnRyb2xsZXI6IEdhbWVDb250cm9sbGVyO1xyXG5cclxuICAgIHdpZHRoOiBudW1iZXIgPSAzNjA7XHJcbiAgICBoZWlnaHQ6IG51bWJlciA9ICAzNjA7XHJcblxyXG4gICAgY29uc3RydWN0b3IoZGl2X2lkOiBzdHJpbmcpIHtcclxuICAgICAgICBBbmNpZW50RW1waXJlcy5nYW1lID0gbmV3IFBoYXNlci5HYW1lKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCBQaGFzZXIuQVVUTywgZGl2X2lkLCB0aGlzKTtcclxuICAgICAgICB0aGlzLm1haW5NZW51ID0gbmV3IE1haW5NZW51KCk7XHJcbiAgICAgICAgdGhpcy5jb250cm9sbGVyID0gbmV3IEdhbWVDb250cm9sbGVyKCk7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuYWRkKFwiTWFpbk1lbnVcIiwgdGhpcy5tYWluTWVudSk7XHJcbiAgICAgICAgQW5jaWVudEVtcGlyZXMuZ2FtZS5zdGF0ZS5hZGQoXCJHYW1lXCIsIHRoaXMuY29udHJvbGxlcik7XHJcblxyXG4gICAgICAgIEFuY2llbnRFbXBpcmVzLmdhbWUuc3RhdGUuc3RhcnQoXCJNYWluTWVudVwiKTtcclxuXHJcbiAgICB9XHJcblxyXG5cclxufVxyXG5cclxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcclxuICAgIG5ldyBBbmNpZW50RW1waXJlcyhcImNvbnRlbnRcIik7XHJcbn07XHJcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
