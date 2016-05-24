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
interface IBuilding {
    castle: boolean;
    position: Pos;
    alliance: Alliance;
}
interface BuildingSave {
    x: number;
    y: number;
    alliance: Alliance;
}

class Map {

    name: string;
    width: number;
    height: number;
    start_entities: IEntity[];

    private tiles: Tile[][];
    private buildings: IBuilding[];

    static getTileForCode(code: number): Tile {
        return AncientEmpires.TILES_PROP[code];
    }


    static getCostForTile(tile: Tile, entity: Entity): number {

        if (tile == Tile.Water && entity.type == EntityType.Lizard) {
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
        if (entity.type == EntityType.Lizard) {
            // Lizard for everything except water
            return cost * 2;
        }

        return cost;
    }
    static getDefForTile(tile: Tile, entity: Entity): number {
        if (tile == Tile.Mountain || tile == Tile.House || tile == Tile.Castle) { return 3; }
        if (tile == Tile.Forest || tile == Tile.Hill) { return 2; }
        if (tile == Tile.Water && entity && entity.type == EntityType.Lizard) { return 2; }
        if (tile == Tile.Grass) { return 1; }
        return 0;
    }

    constructor(name: string) {
        this.name = name;
        this.load();
    }
    load() {
        if (!AncientEmpires.game.cache.checkBinaryKey(this.name)) {
            console.log("Could not find map: " + this.name);
            return false;
        }

        this.buildings = [];
        this.start_entities = [];
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

            this.start_entities.push({
                type: type,
                alliance: alliance,
                x: x,
                y: y
            });
        }
    }
    importEntities(entities: IEntity[]) {
        this.start_entities = entities;
    }
    importBuildings(buildings: BuildingSave[]) {
        for (let building of buildings) {
            let match = this.getBuildingAt(new Pos(building.x, building.y));
            if (!match) { continue; }
            match.alliance = building.alliance;
        }
    }
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
    getBuildingAt(position: Pos): IBuilding {
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
    getOccupiedHouses(): IBuilding[] {
        let houses: IBuilding[] = [];
        for (let building of this.buildings){
            if (!building.castle && building.alliance != Alliance.None) {
                houses.push(building);
            }
        }
        return houses;
    }
    getStartEntities(): IEntity[] {
        return this.start_entities;
    }
    getCostAt(position: Pos, entity: Entity) {
        return Map.getCostForTile(this.getTileAt(position), entity);
    }
    getDefAt(position: Pos, entity: Entity) {
        return Map.getDefForTile(this.getTileAt(position), entity);
    }
    exportBuildingAlliances(): BuildingSave[] {
        let exp: BuildingSave[] = [];
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
    isCampaign(): boolean {
        return this.name.charAt(0) == "m";
    }
    getMap(): number {
        return parseInt(this.name.charAt(1), 10);
    }
}
