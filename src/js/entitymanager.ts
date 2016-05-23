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
    entityDidAnimation(entity: Entity): void;
}

class EntityManager {

    delegate: EntityManagerDelegate;

    entities: Entity[];
    private map: Map;

    private moving: EntityMove;

    private anim_idle_state: number;

    private entity_group: Phaser.Group;
    private selection_group: Phaser.Group;
    private interaction_group: Phaser.Group;
    private anim_group: Phaser.Group;

    private selection_graphics: Phaser.Graphics;
    private interaction_graphics: Phaser.Graphics;

    private entity_range: EntityRange;


    private selection_targets_x: Entity[];
    private selection_targets_y: Entity[];
    private selection_index_x: number;
    private selection_index_y: number;

    constructor(map: Map, entity_group: Phaser.Group, selection_group: Phaser.Group, interaction_group: Phaser.Group, anim_group: Phaser.Group, delegate: EntityManagerDelegate) {

        this.map = map;
        this.entity_group = entity_group;
        this.selection_group = selection_group;
        this.interaction_group = interaction_group;
        this.anim_group = anim_group;
        this.delegate = delegate;

        this.selection_graphics = selection_group.game.add.graphics(0, 0, selection_group);
        this.interaction_graphics = interaction_group.game.add.graphics(0, 0, interaction_group);

        this.moving = null;

        this.anim_idle_state = 0;

        this.entities = [];
        for (let entity of map.getStartEntities()) {
            this.createEntity(entity.type, entity.alliance, entity.position);
        }

        this.entity_range = new EntityRange(this.map, this, this.interaction_group);

    }

    createEntity(type: EntityType, alliance: Alliance, position: Pos): Entity {
        let entity = new Entity(type, alliance, position, this.entity_group);
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
        return new Pos(0, 0);
    }

    startTurn(alliance: Alliance) {
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
                if (this.map.getAllianceAt(entity.position) == entity.alliance) {
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

    selectEntity(entity: Entity) {
        // move selected entity in a higher group
        this.entity_group.remove(entity.sprite);
        this.entity_group.remove(entity.icon_health);
        this.interaction_group.add(entity.sprite);
        this.interaction_group.add(entity.icon_health);
    }
    deselectEntity(entity: Entity) {
        // move selected entity back to all other entities
        this.interaction_group.remove(entity.sprite);
        this.interaction_group.remove(entity.icon_health);
        this.entity_group.addAt(entity.icon_health, 0);
        this.entity_group.addAt(entity.sprite, 0);
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

    update(steps: number, cursor_position: Pos, anim_state: number) {

        for (let entity of this.entities) {
            if (this.anim_idle_state != anim_state) {
                entity.setFrame(this.anim_idle_state);
            }
            entity.update(steps);
        }

        this.entity_range.update(steps, cursor_position, anim_state, this.selection_graphics, this.interaction_graphics);
        this.animateMovingEntity(steps);

    }

    /*

        ----- RANGE

     */

    showRange(type: EntityRangeType, entity: Entity) {

        if (type == EntityRangeType.Attack || type == EntityRangeType.Raise) {
            let targets_x: Entity[];
            let targets_y: Entity[];
            if (type == EntityRangeType.Attack) {
                targets_x = this.getAttackTargets(entity);
            }else if (type == EntityRangeType.Raise) {
                targets_x = this.getRaiseTargets(entity);
            }

            targets_y = targets_x.slice();

            targets_x.sort((a: Entity, b: Entity) => {
                if (a.position.x == b.position.x) { return a.position.y - b.position.y; }
                return a.position.x - b.position.x;
            });
            targets_y.sort((a: Entity, b: Entity) => {
                if (a.position.y == b.position.y) { return a.position.x - b.position.x; }
                return a.position.y - b.position.y;
            });
            this.selection_targets_x = targets_x;
            this.selection_targets_y = targets_y;

            this.selection_index_x = 0;
            this.selection_index_y = 0;
        }

        this.entity_range.createRange(type, entity, this.selection_graphics);
    }

    hideRange() {
        this.selection_targets_x = null;
        this.selection_targets_y = null;
        this.entity_range.clear(this.selection_graphics, this.interaction_graphics);
    }

    nextTargetInRange(direction: Direction): Entity {
        if (!this.selection_targets_x || !this.selection_targets_y) {
            return null;
        }

        let pos = new Pos(0, 0).move(direction);

        if (pos.x != 0) {
            this.selection_index_x += pos.x;
            if (this.selection_index_x < 0) {
                this.selection_index_x = this.selection_targets_x.length - 1;
            } else if (this.selection_index_x >= this.selection_targets_x.length) {
                this.selection_index_x = 0;
            }
            return this.selection_targets_x[this.selection_index_x];
        }
        this.selection_index_y += pos.y;
        if (this.selection_index_y < 0) {
            this.selection_index_y = this.selection_targets_y.length - 1;
        } else if (this.selection_index_y >= this.selection_targets_y.length) {
            this.selection_index_y = 0;
        }
        return this.selection_targets_y[this.selection_index_y];
    }

    getTypeOfRange(): EntityRangeType {
        return this.entity_range.type;
    }

    getAttackTargets(entity: Entity) {
        let targets: Entity[] = [];
        for (let enemy of this.entities) {
            if (enemy.alliance == entity.alliance) { continue; }
            if (enemy.isDead()) { continue; }
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

    animationDidEnd(animation: EntityAnimation) {
        animation.entity.animation = null;
        switch (animation.type) {
            case EntityAnimationType.Attack:
                let attack = <AttackAnimation> animation;

                if (attack.first && this.shouldCounter(attack.entity, attack.attacker)) {
                    this.attackEntity(attack.entity, attack.attacker, false);
                    return;
                }
                this.delegate.entityDidAnimation(attack.entity);

                let attacker = attack.first ? attack.attacker : attack.entity;
                let target = attack.first ? attack.entity : attack.attacker;


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
                break;
            case EntityAnimationType.Status:
                animation.entity.status_animation = -1;
                break;
            case EntityAnimationType.Raise:
                this.delegate.entityDidAnimation(animation.entity);
                break;
        }
    }

    attackEntity(attacker: Entity, target: Entity, first: boolean = true) {
        attacker.attack(target, this.map);
        target.startAnimation(new AttackAnimation(target, this, this.anim_group, attacker, first));
    }
    raiseEntity(wizard: Entity, tomb: Entity) {
        tomb.startAnimation(new RaiseAnimation(tomb, this, this.anim_group, wizard.alliance));
    }
    shouldCounter(attacker: Entity, target: Entity): boolean {
        if (attacker.health > 0 && attacker.getDistanceToEntity(target) < 2 && attacker.data.min < 2) {
            return true;
        }
        return false;
    }

    /*

        ----- MOVE ENTITY

     */

    moveEntity(entity: Entity, target: Pos, animate: boolean = true): boolean {
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
        this.moving = {
            entity: entity,
            target: target,
            line: line,
            progress: 0
        };
        this.hideRange();
        return true;
    }

    resetWisp(alliance: Alliance, show: boolean) {
        for (let entity of this.entities) {
            if (entity.alliance != alliance) { continue; }
            entity.clearStatus(EntityStatus.Wisped);
            if (this.hasWispInRange(entity)) {
                entity.setStatus(EntityStatus.Wisped);
                if (show) { entity.startAnimation(new StatusAnimation(entity, this, this.anim_group, 1)); }
            }
        }
    }

    exportEntities(): EntitySave[] {
        let exp: EntitySave[] = [];
        for (let entity of this.entities) {
            exp.push(entity.export());
        }
        return exp;
    }

    private animateMovingEntity(steps: number) {
        if (!this.moving) { return; }

        let move = this.moving;
        let entity = move.entity;

        move.progress += steps;

        // first check is so we can stay at the same place
        if (move.line.length > 0 && move.progress >= move.line[0].length * AncientEmpires.TILE_SIZE) {
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

    private hasWispInRange(entity: Entity): boolean {
        for (let wisp of this.entities) {
            if (wisp.alliance != entity.alliance) { continue; }
            if (!wisp.hasFlag(EntityFlags.CanWisp)) { continue; }
            let distance = entity.getDistanceToEntity(wisp);
            if (distance < 1 || distance > 2) { continue; }
            return true;
        }
        return false;
    }
}
