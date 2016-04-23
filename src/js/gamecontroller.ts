/// <reference path="vendor/phaser.d.ts" />

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

interface StartObject {
    entities: EntityStart[];
    buildings: BuildingStart[];
    turn: Alliance;
}

interface DataObject {
    name: string;
    size: number;
    start: StartObject;
    map: string;
}

class GameController extends Phaser.State {

    map: Phaser.Tilemap;
    data: DataObject;
    mapName: string;

    tileManager: TileManager;
    pathfinder: Pathfinder;

    turn: Alliance;
    selected: Entity = null;

    cursor: Cursor;
    activeWaypoints: Waypoint[];

    anim_state: number = 0;
    acc: number = 0;

    constructor() {
        super();
    }

    init(name: string) {
        this.mapName = name;
    }
    preload() {
        this.game.load.json("map", "data/" + this.mapName + ".json");
    }
    create() {

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
    }
    click(position: Pos) {

        let prev_selected = this.selected;
        let entity = Entity.getEntityAt(position);

        if (this.selected) {
            if (!entity && Pathfinder.findPositionInList(position, this.activeWaypoints) != null) {
                // we are able to walk there
                console.log("walk to: " + position.getInfo());
                let waypoint = Pathfinder.findPositionInList(position, this.activeWaypoints);
                this.selected.move(position, Pathfinder.getLineToWaypoint(waypoint));
            }
            this.deselectEntity();
        }

        if (!!entity && entity.alliance == this.turn && (!prev_selected || !position.match(prev_selected.position))) {
            this.selectEntity(entity);
        }

    }
    selectEntity(entity: Entity) {

        console.log("selected entity: " + entity.getInfo());

        this.selected = entity;
        let waypoints = this.pathfinder.getReachableWaypointsForEntity(entity);
        this.activeWaypoints = waypoints;
        this.tileManager.showWalkRange(waypoints);
        this.cursor.showWay(waypoints);
    }
    deselectEntity() {
        this.tileManager.hideWalkRange(this.activeWaypoints);
        this.cursor.hideWay();
        this.activeWaypoints = null;
        this.selected = null;
    }
    update() {
        // 1 step is 1/60 sec

        this.acc += this.time.elapsed;
        let steps = Math.floor(this.acc / 16);
        if (steps <= 0) { return; }
        this.acc -= steps * 16;
        if (steps > 2) { steps = 2; }

        Entity.update(steps);
        this.cursor.update(steps);
        Smoke.update(steps);
        this.tileManager.update(steps);
        Frame.update(steps);
    }
}
