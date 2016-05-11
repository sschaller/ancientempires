interface LinePart {
    position: Pos;
    direction: Direction;
    length: number;
}
interface EntityMove {
    entity: Entity;
    target: Pos;
    line: LinePart[];
    progress: number;
}
interface EntityManagerDelegate {
    entityDidMove(entity: Entity): void;
}

class EntityManager {

    private entities: Entity[];
    private map: Map;

    private moving: EntityMove;

    private anim_idle_counter: number;
    private anim_idle_state: number;

    private entity_group: Phaser.Group;
    private selection_group: Phaser.Group;
    private interaction_group: Phaser.Group;

    private selection_graphics: Phaser.Graphics;
    private interaction_graphics: Phaser.Graphics;

    private entity_range: EntityRange;

    private delegate: EntityManagerDelegate;

    constructor(map: Map, entity_group: Phaser.Group, selection_group: Phaser.Group, interaction_group: Phaser.Group, delegate: EntityManagerDelegate) {

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
        for (let entity of map.getStartEntities()) {
            this.createEntity(entity.type, entity.alliance, entity.position);
        }

        this.entity_range = new EntityRange(this.map, this, this.interaction_group);

    }
    createEntity(type: EntityType, alliance: Alliance, position: Pos) {
        this.entities.push(new Entity(type, alliance, position, this.entity_group));
    }
    getEntityAt(position: Pos) {
        for (let entity of this.entities) {
            if (entity.position.match(position)) {
                return entity;
            }
        }
        return null;
    }

    startTurn(alliance: Alliance) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            let entity = this.entities[i];
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
            } else {
                entity.state = EntityState.Moved;
            }
            let show = (entity.alliance == alliance);
            entity.updateState(entity.state, show);
        }
    }

    getAttackTargets(entity: Entity) {
        let targets: Entity[] = [];
        for (let enemy of this.entities) {
            if (enemy.alliance == entity.alliance) { continue; }
            let distance = entity.getDistanceToEntity(enemy);
            if (distance > entity.data.max) { continue; }
            if (distance < entity.data.min) { continue; }

            targets.push(enemy);
        }
        return targets;
    }
    getRaiseTargets(entity: Entity) {
        let targets: Entity[] = [];
        for (let dead of this.entities) {
            if (!dead.isDead()) { continue; }
            let distance = entity.getDistanceToEntity(dead);
            if (distance != 1) { continue; }
            targets.push(dead);
        }
        return targets;
    }

    update(steps: number, cursor_position: Pos, anim_state: number) {

        if (anim_state != this.anim_idle_state) {
            this.anim_idle_state = anim_state;
            for (let entity of this.entities) {
                entity.setFrame(this.anim_idle_state);
            }
        }

        this.entity_range.update(steps, cursor_position, anim_state, this.selection_graphics, this.interaction_graphics);
        this.animateMovingEntity(steps);

    }

    getEntityOptions(entity: Entity, moved: boolean = false): Action[] {

        if (entity.state != EntityState.Ready) {
            return [];
        }

        let options: Action[] = [];

        if (!moved && entity.hasFlag(EntityFlags.CanBuy) && this.map.getTileAt(entity.position) == Tile.Castle) {
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

        if (this.map.getAllianceAt(entity.position) != entity.alliance && ((entity.hasFlag(EntityFlags.CanOccupyHouse) && this.map.getTileAt(entity.position) == Tile.House) || (entity.hasFlag(EntityFlags.CanOccupyCastle) && this.map.getTileAt(entity.position) == Tile.Castle))) {
            options.push(Action.OCCUPY);
        }

        if (moved) {
            options.push(Action.END_MOVE);
        } else {
            options.push(Action.MOVE);
        }
        return options;
    }

    selectEntity(entity: Entity) {
        // move selected entity in a higher group
        this.entity_group.remove(entity.sprite);
        this.interaction_group.add(entity.sprite);
    }
    deselectEntity(entity: Entity) {
        // move selected entity back to all other entities
        this.interaction_group.remove(entity.sprite);
        this.entity_group.addAt(entity.sprite, 0);
    }

    showRange(type: EntityRangeType, entity: Entity) {
        this.entity_range.createRange(type, entity, this.selection_graphics);
    }

    hideRange() {
        this.entity_range.clear(this.selection_graphics, this.interaction_graphics);
    }

    moveEntity(entity: Entity, target: Pos): boolean {
        if (!!this.getEntityAt(target)) {
            // entity at place
            return false;
        }
        let waypoint = this.entity_range.getWaypointAt(target);
        if (!waypoint) {
            // target not in range
            return false;
        }
        let line = EntityRange.getLineToWaypoint(waypoint);
        this.moving = {
            entity: entity,
            target: target,
            line: line,
            progress: 0
        };
        this.hideRange();
        return true;
    }

    getKingPosition(alliance: Alliance): Pos {
        for (let entity of this.entities) {
            if (entity.alliance == alliance && entity.type == EntityType.King) {
                return entity.position.copy();
            }
        }
        return new Pos(0, 0);
    }

    private animateMovingEntity(steps: number) {
        if (!this.moving) { return; }

        let move = this.moving;
        let entity = move.entity;

        move.progress += steps;

        if (move.progress >= move.line[0].length * AncientEmpires.TILE_SIZE) {
            move.progress -= move.line[0].length * AncientEmpires.TILE_SIZE;
            move.line.shift();
        }
        if (move.line.length > 0) {
            let diff = new Pos(0, 0).move(move.line[0].direction);
            entity.world_position.x = move.line[0].position.x * AncientEmpires.TILE_SIZE + diff.x * move.progress;
            entity.world_position.y = move.line[0].position.y * AncientEmpires.TILE_SIZE + diff.y * move.progress;
        } else {
            entity.position = move.target;
            entity.world_position = move.target.getWorldPosition();
            this.moving = null;
            this.delegate.entityDidMove(entity);
        }
        entity.update(steps);
    }
}
