interface InteractionDelegate {

    game: Phaser.Game;

    frame_manager: FrameManager;
    cursor_still: boolean;
    camera_still: boolean;
    cursor_target: Pos;
    cursor: Sprite;

    buyEntity(king: Entity, type: EntityType): Entity;
    nextTurn(): void;
    getGoldForAlliance(alliance: Alliance): number;
    setGoldForAlliance(alliance: Alliance, gold: number): void;
    selectEntity(entity: Entity): boolean;
    deselectEntity(changed: boolean): void;
    showRange(type: EntityRangeType, entity: Entity): EntityRange;
    hideRange(): void;

    moveEntity(entity: Entity, target: Pos, animate: boolean): boolean;
    occupy(position: Pos, alliance: Alliance): void;
    attackEntity(entity: Entity, target: Entity): void;
    raiseEntity(wizard: Entity, dead: Entity): void;
    showInfo(all: boolean): void;
    hideInfo(all: boolean): void;

    loadGame(): boolean;
    saveGame(): void;
    exitGame(): void;
}

class Interaction implements EntityManagerDelegate, MenuDelegate {
    cursor_position: Pos;

    protected alliance: Alliance;
    protected map: Tilemap;
    protected delegate: InteractionDelegate;

    protected selected_entity: Entity;

    constructor(alliance: Alliance, map: Tilemap, delegate: InteractionDelegate) {
        this.alliance = alliance;
        this.map = map;
        this.delegate = delegate;
    }
    isPlayer(): boolean {
        return false;
    }
    isActive(): boolean {
        return !!this.getCursorPosition();
    }
    setCursorPosition(position: Pos) {
        this.cursor_position = position.copy();
    }
    getCursorPosition(): Pos {
        if (!!this.cursor_position) {
            return this.cursor_position.copy();
        }
        let king = this.map.getKingPosition(this.alliance);
        if (!!king) {
            return king.copy();
        }
        let own_entities = this.map.getEntitiesWith(this.alliance);
        if (own_entities.length > 0) {
            return own_entities[0].position;
        }
        return null;
    }
    start() {
        // implement
    }
    run() {
        // implemented
    }
    entityDidMove(entity: Entity) {
        // implement
    }
    entityDidAnimation(entity: Entity) {
        // implement
    }
    openMenu(context: InputContext) {
        // implement
    }
    closeMenu(context: InputContext) {
        // implement
    }
}

class NoAI extends Interaction {
    run() {
        this.delegate.nextTurn();
    }
}
