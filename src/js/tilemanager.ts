/// <reference path="vendor/phaser.d.ts" />
enum Tile {
    Water,
    Bridge,
    Path,
    Grass,
    Hill,
    Forest,
    Mountain,
    House,
    Castle
}
enum Alliance {
    None,
    Blue,
    Red
}
interface Building {
    castle: boolean;
    position: Pos;
    alliance: Alliance;
}
interface BuildingStart {
    x: number;
    y: number;
    alliance: Alliance;
}
enum TintAnimation {
    None,
    Increasing,
    Decreasing
}
class TileManager {

    static game: Phaser.Game;
    static tileMap: Phaser.Tilemap;

    width: number;
    height: number;
    map: string;
    buildings: Building[];
    waterState: number = 0;

    game: Phaser.Game;
    tilemap: Phaser.Tilemap;
    backgroundLayer: Phaser.TilemapLayer;
    objectLayer: Phaser.TilemapLayer;
    interactionLayer: Phaser.TilemapLayer;

    interactionLayerTintAnimation: TintAnimation = TintAnimation.None;
    interactionLayerTintProgress: number = 100;

    waterTimer: number = 0;

    static doesTileCutGrass(tile: Tile): boolean {
        return (tile == Tile.Path || tile == Tile.Water || tile == Tile.Bridge);
    }
    static getIndexForForm(fbit: number): number {
        if (fbit == 8 + 4 + 2 + 1) { return 15; }
        if (fbit == 8 + 4 + 1) { return 14; }
        if (fbit == 8 + 4 + 2) { return 13; }
        if (fbit == 4 + 2 + 1) { return 12; }
        if (fbit == 8 + 2 + 1) { return 11; }
        if (fbit == 1 + 8) { return 10; }
        if (fbit == 4 + 8) { return 9; }
        if (fbit == 2 + 4) { return 8; }
        if (fbit == 1 + 2) { return 7; }
        if (fbit == 1 + 4) { return 6; }
        if (fbit == 2 + 8) { return 5; }
        if (fbit == 8) { return 4; }
        if (fbit == 4) { return 3; }
        if (fbit == 2) { return 2; }
        if (fbit == 1) { return 1; }
        return 0;
    }

    constructor(map: string, buildings: BuildingStart[], width: number, height: number) {
        this.map = map;
        this.width = width;
        this.height = height;

        this.buildings = [];
        for (let building of buildings) {
            let pos = new Pos(building.x, building.y);
            this.buildings.push({castle: this.getTileAt(pos) == Tile.Castle, position: pos, alliance: building.alliance});
        }

        this.backgroundLayer = TileManager.tileMap.create("background", this.width, this.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.backgroundLayer.resizeWorld();
        this.objectLayer = TileManager.tileMap.createBlankLayer("object", this.width, this.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);
        this.interactionLayer = TileManager.tileMap.createBlankLayer("interaction", this.width, this.height, AncientEmpires.TILE_SIZE, AncientEmpires.TILE_SIZE);

    }

    draw() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.drawTileAt(new Pos(x, y));
            }
        }
    }

    update(steps: number) {

        this.waterTimer += steps;
        if (this.waterTimer > 30) {
            this.waterTimer = 0;
            this.updateWater();
        }

        if (this.interactionLayerTintAnimation != TintAnimation.None) {
            this.updateInteractionLayer(steps);
        }

    }

    updateInteractionLayer(steps: number) {
        let value = this.interactionLayerTintProgress / 100 * 0xFF | 0;
        this.interactionLayer.tint = (value << 16) | (value << 8) | value;

        if (this.interactionLayerTintAnimation == TintAnimation.Increasing) {
            this.interactionLayerTintProgress += steps;
            if (this.interactionLayerTintProgress >= 100) {
                this.interactionLayerTintProgress = 100;
                this.interactionLayerTintAnimation = TintAnimation.Decreasing;
            }
        } else {
            this.interactionLayerTintProgress -= steps;
            if (this.interactionLayerTintProgress <= 40) {
                this.interactionLayerTintProgress = 40;
                this.interactionLayerTintAnimation = TintAnimation.Increasing;
            }
        }
    }

    getTileAt(p: Pos): Tile {
        return +this.map.charAt(p.y * this.width + p.x);
    }
    getObjectAt(p: Pos): number {
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
    }

    updateWater() {
        let oldState = this.waterState;
        this.waterState = 1 - this.waterState;

        TileManager.tileMap.replace(oldState, this.waterState, 0, 0, this.width, this.height, this.backgroundLayer);
    }

    drawTileAt(p: Pos) {
        TileManager.tileMap.putTile(this.getBackgroundAt(p), p.x, p.y, this.backgroundLayer);

        let tile = this.getTileAt(p);
        let obj = this.getObjectAt(p);
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
    }
    getBackgroundAt(p: Pos): number {
        switch (this.getTileAt(p)) {
            case 0:
                // Water
                return 0;
            case 1:
                // Bridge
                let adj = this.getAdjacentTilesAt(p);
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
    getAdjacentTilesAt(p: Pos): Tile[] {

        return [
            p.y > 0 ? this.getTileAt(new Pos(p.x, p.y - 1)) : -1,
            p.x < this.width - 1 ? this.getTileAt(new Pos(p.x + 1, p.y)) : -1,
            p.y < this.height - 1 ? this.getTileAt(new Pos(p.x, p.y + 1)) : -1,
            p.x > 0 ? this.getTileAt(new Pos(p.x - 1, p.y)) : -1
        ];

    }
    getIndexForGrassAt(p: Pos): number {
        let adj = this.getAdjacentTilesAt(p);
        let cut = 0;
        for (let i = 0; i < adj.length; i++) {
            cut += Math.pow(2, i) * (TileManager.doesTileCutGrass(adj[i]) ? 1 : 0);
        }
        return 5 + TileManager.getIndexForForm(cut);
    }
    showWalkRange(waypoints: Waypoint[]) {
        for (let waypoint of waypoints) {
            TileManager.tileMap.putTile(33 + TileManager.getIndexForForm(waypoint.form), waypoint.position.x, waypoint.position.y, this.interactionLayer);
        }
        this.interactionLayerTintProgress = 100;
        this.interactionLayerTintAnimation = TintAnimation.Decreasing;
    }
    hideWalkRange(waypoints: Waypoint[]) {
        this.interactionLayerTintAnimation = TintAnimation.None;
        for (let waypoint of waypoints) {
            TileManager.tileMap.removeTile(waypoint.position.x, waypoint.position.y, this.interactionLayer);
        }
    }
    getAllianceAt(p: Pos): Alliance {
        for (let building of this.buildings){
            if (p.match(building.position)) {
                return building.alliance;
            }
        }
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
}
