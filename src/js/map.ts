/// <reference path="entity.ts" />
/// <reference path="entityrange.ts" />

enum Tile {
    Path,
    Grass,
    Forest,
    Hill,
    Mountain,
    Water,
    Bridge,
    House,
    Castle
}
interface Building {
    castle: boolean;
    position: Pos;
    alliance: Alliance;
}
interface IBuilding {
    x: number;
    y: number;
    alliance: Alliance;
}

class Map {

    name: string;
    width: number;
    height: number;

    entities: Entity[];
    entity_range: EntityRange;

    private tiles: Tile[][];
    private buildings: Building[];

    static getTileForCode(code: number): Tile {
        return AncientEmpires.TILES_PROP[code];
    }


    static getCostForTile(tile: Tile, entity_type: EntityType): number {

        if (tile == Tile.Water && entity_type == EntityType.Lizard) {
            // Lizard on water
            return 1;
        }

        let cost = 0;
        if (tile == Tile.Mountain || tile == Tile.Water) {
            cost = 3;
        } else if (tile == Tile.Forest || tile == Tile.Hill) {
            cost = 2;
        } else {
            cost = 1;
        }
        if (entity_type == EntityType.Lizard) {
            // Lizard for everything except water
            return cost * 2;
        }

        return cost;
    }
    static getDefForTile(tile: Tile, entity_type?: EntityType): number {
        if (tile == Tile.Mountain || tile == Tile.House || tile == Tile.Castle) { return 3; }
        if (tile == Tile.Forest || tile == Tile.Hill) { return 2; }
        if (tile == Tile.Water && typeof entity_type != "undefined" && entity_type == EntityType.Lizard) { return 2; }
        if (tile == Tile.Grass) { return 1; }
        return 0;
    }

    constructor(name: string) {
        this.name = name;
        this.entity_range = new EntityRange(this);
        this.load();
    }

    /*

        - DATA OPERATIONS

     */

    load() {
        if (!AncientEmpires.game.cache.checkBinaryKey(this.name)) {
            console.log("Could not find map: " + this.name);
            return false;
        }

        this.buildings = [];
        this.entities = [];
        this.tiles = [];

        let buffer: ArrayBuffer = AncientEmpires.game.cache.getBinary(this.name);
        let data = new DataView(buffer);
        let index = 0;

        this.width = data.getUint32(index);
        index += 4;
        this.height = data.getUint32(index);
        index += 4;

        for (let x = 0; x < this.width; x++) {
            this.tiles[x] = [];
            for (let y = 0; y < this.height; y++) {
                let code = data.getUint8(index++);
                let tile = Map.getTileForCode(code);
                this.tiles[x][y] = tile;
                if (tile == Tile.House || tile == Tile.Castle) {
                    this.buildings.push({
                        castle: (tile == Tile.Castle),
                        position: new Pos(x, y),
                        alliance: <Alliance> Math.floor((code - AncientEmpires.NUMBER_OF_TILES) / 3)
                    });
                }
            }
        }

        let skip = data.getUint32(index);
        index += 4 + skip * 4;

        let number_of_entities = data.getUint32(index);
        index += 4;

        for (let i = 0; i < number_of_entities; i++) {
            let desc = data.getUint8(index++);
            let type: EntityType = desc % 11;
            let alliance: Alliance = Math.floor(desc / 11) + 1;

            let x = Math.floor(data.getUint16(index) / 16);
            index += 2;
            let y = Math.floor(data.getUint16(index) / 16);
            index += 2;

            this.entities.push(new Entity(type, alliance, new Pos(x, y)));
        }
    }
    importEntities(entities: IEntity[]) {
        this.entities = [];
        for (let entity of entities) {
            let e = this.createEntity(entity.type, entity.alliance, new Pos(entity.x, entity.y));
            e.health = entity.health;
            e.state = entity.state;
            e.status = entity.status;
            e.ep = entity.ep;
            e.rank = entity.rank;
            e.death_count = entity.death_count;
        }
    }
    importBuildings(buildings: IBuilding[]) {
        for (let building of buildings) {
            let match = this.getBuildingAt(new Pos(building.x, building.y));
            if (!match) { continue; }
            match.alliance = building.alliance;
        }
    }
    exportEntities(): IEntity[] {
        let exp: IEntity[] = [];
        for (let entity of this.entities) {
            exp.push(entity.export());
        }
        return exp;
    }
    exportBuildings(): IBuilding[] {
        let exp: IBuilding[] = [];
        for (let building of this.buildings) {
            if (building.alliance == Alliance.None) { continue; }
            exp.push({
                x: building.position.x,
                y: building.position.y,
                alliance: building.alliance
            });
        }
        return exp;
    }

    /*

        ENTITY OPERATIONS

     */

    createEntity(type: EntityType, alliance: Alliance, position: Pos): Entity {
        let entity = new Entity(type, alliance, position);
        this.entities.push(entity);
        return entity;
    }
    removeEntity(entity: Entity) {
        for (let i = 0; i < this.entities.length; i++) {
            if (entity == this.entities[i]) {
                this.entities.splice(i, 1);
                break;
            }
        }
        entity.destroy();
    }

    getEntityAt(position: Pos) {
        for (let entity of this.entities) {
            if (entity.position.match(position)) {
                return entity;
            }
        }
        return null;
    }

    getKingPosition(alliance: Alliance): Pos {
        for (let entity of this.entities) {
            if (entity.alliance == alliance && entity.type == EntityType.King) {
                return entity.position.copy();
            }
        }
        return null;
    }

    getEntitiesWith(alliance: Alliance, state?: EntityState, type?: EntityType): Entity[] {
        let ret: Entity[] = [];
        for (let entity of this.entities) {
            if (entity.alliance != alliance) { continue; }
            if (typeof type != "undefined" && entity.type != type) { continue; }
            if (typeof state != "undefined" && entity.state != state) { continue; }
            if (typeof state == "undefined" && entity.state == EntityState.Dead) { continue; }
            ret.push(entity);
        }
        return ret;
    }

    countEntitiesWith(alliance: Alliance, state?: EntityState, type?: EntityType): number {
        return this.getEntitiesWith(alliance, state, type).length;
    }

    nextTurn(alliance: Alliance) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            let entity = this.entities[i];
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
                    let nh = Math.min(entity.health + 2, 10);
                    entity.setHealth(nh);
                }
            } else {
                entity.state = EntityState.Moved;
                entity.clearStatus(EntityStatus.Poisoned);
            }
            let show = (entity.alliance == alliance);
            entity.updateState(entity.state, show);
        }
    }

    /*

        - TILE OPERATIONS

     */

    getTileAt(position: Pos): Tile {
        return this.tiles[position.x][position.y];
    }
    getAdjacentTilesAt(position: Pos): Tile[] {

        return [
            position.y > 0 ? this.getTileAt(new Pos(position.x, position.y - 1)) : -1,
            position.x < this.width - 1 ? this.getTileAt(new Pos(position.x + 1, position.y)) : -1,
            position.y < this.height - 1 ? this.getTileAt(new Pos(position.x, position.y + 1)) : -1,
            position.x > 0 ? this.getTileAt(new Pos(position.x - 1, position.y)) : -1
        ];

    }
    getAdjacentPositionsAt(p: Pos): Pos[] {
        let ret: Pos[] = [];

        // top, right, bottom, left
        if (p.y > 0) { ret.push(new Pos(p.x, p.y - 1)); }
        if (p.x < this.width - 1) { ret.push(new Pos(p.x + 1, p.y)); }
        if (p.y < this.height - 1) { ret.push(new Pos(p.x, p.y + 1)); }
        if (p.x > 0) { ret.push(new Pos(p.x - 1, p.y)); }

        return ret;
    }
    setAllianceAt(position: Pos, alliance: Alliance): boolean {
        for (let building of this.buildings){
            if (building.position.match(position)) {
                building.alliance = alliance;
                return true;
            }
        }
        return false;
    }
    getBuildingAt(position: Pos): Building {
        for (let building of this.buildings){
            if (building.position.match(position)) {
                return building;
            }
        }
        return null;
    }
    getAllianceAt(position: Pos) {
        let building = this.getBuildingAt(position);
        if (!!building) { return building.alliance; }
        return Alliance.None;
    }
    getOccupiedHouses(): Building[] {
        let houses: Building[] = [];
        for (let building of this.buildings){
            if (!building.castle && building.alliance != Alliance.None) {
                houses.push(building);
            }
        }
        return houses;
    }
    getNearestHouseForEntity(entity: Entity): Building {
        let min_dist = -1;
        let min_building: Building = null;
        for (let building of this.buildings) {
            if (building.castle) { continue; }
            let distance = Math.abs(building.position.x - entity.position.x) + Math.abs(building.position.y - entity.position.y);
            if (min_dist >= 0 && distance >= min_dist) { continue; }

            if (this.getMap() == 2 || (entity.type == EntityType.Soldier && building.alliance != entity.alliance) || (entity.type != EntityType.Soldier && building.alliance == entity.alliance)) {
                min_dist = distance;
                min_building = building;
            }
        }
        return min_building;
    }
    getGoldGainForAlliance(alliance: Alliance): number {
        let gain = 0;
        for (let building of this.buildings) {
            if (building.alliance != alliance) { continue; }
            gain += building.castle ? 50 : 30;
        }
        return gain;
    }
    getCostAt(position: Pos, entity_type: EntityType) {
        return Map.getCostForTile(this.getTileAt(position), entity_type);
    }
    getDefAt(position: Pos, entity_type: EntityType) {
        return Map.getDefForTile(this.getTileAt(position), entity_type);
    }
    isCampaign(): boolean {
        return this.name.charAt(0) == "m";
    }
    getMap(): number {
        return parseInt(this.name.charAt(1), 10);
    }



    getEntityOptions(entity: Entity, moved: boolean = false): Action[] {

        if (entity.state != EntityState.Ready) {
            return [];
        }
        if (this.getEntityAt(entity.position) != entity) {
            return [Action.MOVE];
        }

        let options: Action[] = [];

        if (!moved && entity.hasFlag(EntityFlags.CanBuy) && this.getTileAt(entity.position) == Tile.Castle) {
            options.push(Action.BUY);
        }

        if (!entity.hasFlag(EntityFlags.CantAttackAfterMoving) || !moved) {
            let attack_targets = this.getAttackTargets(entity);
            if (attack_targets.length > 0) {
                options.push(Action.ATTACK);
            }
        }

        if (entity.hasFlag(EntityFlags.CanRaise)) {
            let raise_targets = this.getRaiseTargets(entity);
            if (raise_targets.length > 0) {
                options.push(Action.RAISE);
            }
        }

        if (this.getAllianceAt(entity.position) != entity.alliance && ((entity.hasFlag(EntityFlags.CanOccupyHouse) && this.getTileAt(entity.position) == Tile.House) || (entity.hasFlag(EntityFlags.CanOccupyCastle) && this.getTileAt(entity.position) == Tile.Castle))) {
            options.push(Action.OCCUPY);
        }

        if (moved) {
            options.push(Action.END_MOVE);
        } else {
            options.push(Action.MOVE);
        }
        return options;
    }

    /*

        RANGE

     */

    getAttackTargets(entity: Entity, position?: Pos) {
        let targets: Entity[] = [];
        for (let enemy of this.entities) {
            if (enemy.alliance == entity.alliance) { continue; }
            if (enemy.isDead()) { continue; }
            let distance = entity.getDistanceToEntity(enemy);
            if (typeof position != "undefined") {
                distance = position.distanceTo(enemy.position);
            }
            if (distance > entity.data.max) { continue; }
            if (distance < entity.data.min) { continue; }

            targets.push(enemy);
        }
        return targets;
    }
    getRaiseTargets(entity: Entity, position?: Pos) {
        let targets: Entity[] = [];
        for (let dead of this.entities) {
            if (!dead.isDead()) { continue; }
            let distance = entity.getDistanceToEntity(dead);
            if (typeof position != "undefined") {
                distance = position.distanceTo(dead.position);
            }
            if (distance != 1) { continue; }
            targets.push(dead);
        }
        return targets;
    }
    resetWisp(alliance: Alliance) {
        for (let entity of this.entities) {
            if (entity.alliance != alliance) { continue; }
            entity.clearStatus(EntityStatus.Wisped);
            if (this.hasWispInRange(entity)) {
                entity.setStatus(EntityStatus.Wisped);
            }
        }
    }
    hasWispInRange(entity: Entity): boolean {
        for (let wisp of this.entities) {
            if (wisp.alliance != entity.alliance) { continue; }
            if (!wisp.hasFlag(EntityFlags.CanWisp)) { continue; }
            if (wisp.isDead()) { continue; }
            let distance = entity.getDistanceToEntity(wisp);
            if (distance < 1 || distance > 2) { continue; }
            return true;
        }
        return false;
    }

    showRange(type: EntityRangeType, entity: Entity): EntityRange {

        let targets: Entity[] = null;
        if (type == EntityRangeType.Attack || type == EntityRangeType.Raise) {
            if (type == EntityRangeType.Attack) {
                targets = this.getAttackTargets(entity);
            }else if (type == EntityRangeType.Raise) {
                targets = this.getRaiseTargets(entity);
            }
        }

        this.entity_range.createRange(type, entity, targets);
        return this.entity_range;

    }

    moveEntity(entity: Entity, target: Pos, delegate: EntityManagerDelegate, animate: boolean = true): boolean {
        if (!animate) {
            entity.position = target;
            entity.setWorldPosition(target.getWorldPosition());
            return true;
        }
        if (!!this.getEntityAt(target) && !target.match(entity.position)) {
            // Cant move where another unit is
            return false;
        }
        let waypoint = this.entity_range.getWaypointAt(target);
        if (!waypoint) {
            // target not in range
            return false;
        }
        let line = EntityRange.getLineToWaypoint(waypoint);
        entity.move(target, line, delegate);
        return true;
    }

    nextTargetInRange(direction: Direction): Entity {
        return this.entity_range.nextTargetInRange(direction);
    }

    selectTargetInRange(entity: Entity): boolean {
        return this.entity_range.selectTarget(entity);
    }

    getTypeOfRange(): EntityRangeType {
        return this.entity_range.type;
    }
}
