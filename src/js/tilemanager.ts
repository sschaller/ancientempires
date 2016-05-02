enum Alliance {
    None = 0,
    Blue = 1,
    Red = 2
}
class TileManager {

    map: Map;
    waterState: number = 0;

    tilemap: Phaser.Tilemap;
    group: Phaser.Group;

    backgroundLayer: Phaser.TilemapLayer;
    buildingLayer: Phaser.TilemapLayer;

    waterTimer: number = 0;

    static doesTileCutGrass(tile: Tile): boolean {
        return (tile == Tile.Path || tile == Tile.Water || tile == Tile.Bridge);
    }

    static getImageIndexForObjectTile(tile: Tile): number {

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
    }

    static getBaseImageIndexForTile(tile: Tile): number {
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
    }

    constructor(map: Map, tilemap: Phaser.Tilemap, tilemap_group: Phaser.Group) {
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

    draw() {
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
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

    }

    updateWater() {
        let oldState = this.waterState;
        this.waterState = 1 - this.waterState;

        this.tilemap.replace(21 + oldState, 21 + this.waterState, 0, 0, this.map.width, this.map.height, this.backgroundLayer);
    }

    drawTileAt(position: Pos) {
        this.tilemap.putTile(this.getImageIndexForBackgroundAt(position), position.x, position.y, this.backgroundLayer);
        let tile = this.map.getTileAt(position);
        let obj = TileManager.getImageIndexForObjectTile(tile);
        if (obj >= 0) {
            if (tile == Tile.House || tile == Tile.Castle) {
                let alliance = this.map.getAllianceAt(position);
                obj += alliance * 3;
                if (tile == Tile.Castle && position.y > 0) {
                    // roof of castle
                    this.tilemap.putTile(obj + 1, position.x, position.y - 1, this.buildingLayer);
                }
            }
            this.tilemap.putTile(obj, position.x, position.y, this.buildingLayer);
        }
    }
    getImageIndexForBackgroundAt(position: Pos): number {
        switch (this.map.getTileAt(position)) {
            case Tile.Water:
                // Water
                return 21;
            case Tile.Bridge:
                // Bridge
                let adj = this.map.getAdjacentTilesAt(position);
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
    }
    getImageIndexForGrassAt(position: Pos): number {
        let adj = this.map.getAdjacentTilesAt(position);
        let cut = 0;
        for (let i = 0; i < adj.length; i++) {
            cut += Math.pow(2, i) * (TileManager.doesTileCutGrass(adj[i]) ? 1 : 0);
        }
        if (cut == 8 + 4 + 2 + 1) { return 3; } // all - not supplied
        if (cut == 8 + 4 + 1) { return 16; } // top bottom left
        if (cut == 8 + 4 + 2) { return 10; } // right bottom left
        if (cut == 4 + 2 + 1) { return 17; } // top right bottom
        if (cut == 8 + 2 + 1) { return 14; } // top right left
        if (cut == 1 + 8) { return 12; } // top left
        if (cut == 4 + 8) { return 8; } // bottom left
        if (cut == 2 + 4) { return 9; } // right bottom
        if (cut == 1 + 2) { return 13; } // top right
        if (cut == 1 + 4) { return 15; } // top bottom
        if (cut == 2 + 8) { return 6; } // right left
        if (cut == 8) { return 4; } // left
        if (cut == 4) { return 7; } // bottom
        if (cut == 2) { return 5; } // right
        if (cut == 1) { return 11; } // top
        return 3;
    }
}
