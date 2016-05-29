/// <reference path="interaction.ts" />

enum AIState {
    None,
    Select,
    Moving,
    Action,
    Attack,
    Raise,
    Deselect
}

class AI extends Interaction {

    private entity_selected: Entity;
    private entity_attack: Entity;
    private entity_raise: Entity;
    private entity_target: Pos;

    private soldiers: Entity[];
    private nearest_house: Building;

    private state: AIState;
    private pause: boolean;
    private test: EntityType[];

    static getTileScore(tile: Tile) {
        switch (tile) {
            case Tile.Forest:
            case Tile.Hill:
                return 2;
            case Tile.Mountain:
            case Tile.Water:
                return 3;
        }
        return 1;
    }

    constructor(alliance: Alliance, map: Map, delegate: InteractionDelegate) {
        super(alliance, map, delegate);

        this.state = AIState.None;
        this.pause = false;
        this.test = [EntityType.Wizard, EntityType.Lizard];
    }

    openMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.pause = true;
        }
    }
    closeMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.pause = false;
        }
    }

    entityDidMove(entity: Entity) {
        this.state = AIState.Action;
    }
    entityDidAnimation(entity: Entity) {
        this.delegate.cursor.show();
        this.state = AIState.Deselect;
    }
    run() {

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
                    } else {
                        this.delegate.cursor_target = this.entity_target.copy();
                    }
                    break;
                case AIState.Action:
                    if (!!this.entity_attack) {
                        if (this.delegate.cursor_target.match(this.entity_attack.position)) {
                            this.delegate.attackEntity(this.selected_entity, this.entity_attack);
                            this.state = AIState.Attack;
                        } else {
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
                        } else {
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

        for (let entity of this.map.entities) {
            if (entity.alliance != this.alliance || entity.state != EntityState.Ready) { continue; }
            if (entity.type == 9) {

                // king always last
                if (this.map.countEntitiesWith(this.alliance, EntityState.Ready) != 1) { continue; }

                if (this.map.getTileAt(entity.position) == Tile.Castle && this.map.getAllianceAt(entity.position) == entity.alliance) {
                    // king is in castle owned by him

                    if (this.map.countEntitiesWith(this.alliance, undefined, EntityType.Soldier) < 2 && this.checkCostAndSpace(entity.position, EntityType.Soldier)) {
                        // if less than two soldiers, buy one if enough cost and space around castle
                        entity = this.delegate.buyEntity(entity, EntityType.Soldier);
                    } else if (this.test.length > 0) {
                        if (this.delegate.getGoldForAlliance(this.alliance) >= AncientEmpires.ENTITIES[this.test[0]].cost) {
                            entity = this.delegate.buyEntity(entity, this.test[0]);
                            this.test.shift();
                        }
                    } else {
                        let possible: EntityType[] = [];
                        for (let type = 1; type < AncientEmpires.ENTITIES.length; type++) {
                            if (this.map.countEntitiesWith(this.alliance, undefined, <EntityType> type) >= 1 && AncientEmpires.ENTITIES[type].cost < 600) {
                                continue;
                            }
                            if (!this.checkCostAndSpace(entity.position, <EntityType> type)) {
                                continue;
                            }
                            possible.push(<EntityType> type);
                        }
                        if (possible.length > 0) {
                            let choice = possible[Math.floor(Math.random() * possible.length)];
                            entity = this.delegate.buyEntity(entity, choice);
                        }
                    }
                }
            }
            this.delegate.cursor_target = entity.position.copy();

            this.state = AIState.Select;
            this.entity_selected = entity;
            this.selectEntity(entity);
            let entity_range = this.delegate.showRange(EntityRangeType.Move, entity);
            entity_range.sort();

            this.soldiers = this.map.getEntitiesWith(this.alliance, undefined, EntityType.Soldier);
            this.nearest_house = this.map.getNearestHouseForEntity(entity);
            let best_move_score = 0;

            for (let waypoint of entity_range.waypoints) {
                let e = this.map.getEntityAt(waypoint.position);
                if (!!e && e != entity) { continue; }

                if (!entity.hasFlag(EntityFlags.CantAttackAfterMoving) || e == entity) {
                    let targets = this.map.getAttackTargets(entity, waypoint.position);
                    for (let target of targets) {
                        let score = this.getScore(entity, waypoint.position, target, null);
                        if (score <= best_move_score) { continue; }
                        best_move_score = score;
                        this.entity_raise = null;
                        this.entity_attack = target;
                        this.entity_target = waypoint.position.copy();
                    }
                }
                if (entity.hasFlag(EntityFlags.CanRaise)) {
                    let targets = this.map.getRaiseTargets(entity, waypoint.position);
                    for (let target of targets) {
                        let score = this.getScore(entity, waypoint.position, null, target);
                        if (score <= best_move_score) { continue; }
                        best_move_score = score;
                        this.entity_attack = null;
                        this.entity_raise = target;
                        this.entity_target = waypoint.position.copy();
                    }
                }
                let score = this.getScore(entity, waypoint.position, null, null);
                if (score <= best_move_score) { continue; }
                best_move_score = score;
                this.entity_attack = null;
                this.entity_raise = null;
                this.entity_target = waypoint.position.copy();
            }
            return;
        }
        this.soldiers = null;
        this.delegate.nextTurn();
    }

    private selectEntity(entity: Entity) {
        this.selected_entity = entity;
        this.delegate.selectEntity(entity);
    }

    private checkCostAndSpace(position: Pos, type: EntityType): boolean {

        // check for enough gold
        if (this.delegate.getGoldForAlliance(this.alliance) < AncientEmpires.ENTITIES[<number> type].cost) { return false; }

        // check for empty space around castle
        let waypoints = this.map.entity_range.calculateWaypoints(position, this.alliance, type, AncientEmpires.ENTITIES[<number> type].mov, true);
        // cant be on castle -> min 2 waypoints
        if (waypoints.length < 2) { return false; }
        return true;
    }
    private getScore(entity: Entity, position: Pos, attack: Entity, raise: Entity) {
        let score = 0;
        switch (entity.type) {
            case EntityType.Soldier:

                // move towards nearest house (unoccupied for soldiers)
                if (!!this.map.getKingPosition(this.alliance) && !!this.nearest_house) {
                    let score_house = this.map.width + this.map.height - position.distanceTo(this.nearest_house.position);
                    score += score_house * score_house;
                }

                // give advantages to certain tiles (stay away from difficult terrain)
                if (AI.getTileScore(this.map.getTileAt(position)) <= 1) {
                    score += 5;
                }

                // spread soldiers
                for (let soldier of this.soldiers) {
                    if (soldier == entity) { continue; }
                    let score_soldiers = entity.getDistanceToEntity(soldier);
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
            } else {
                score += entity.getPowerEstimate(position, this.map) * 2;
            }
            if (attack.type == EntityType.King) {
                score += 10;
            }
        }

        score += this.map.getDefAt(position, entity.type) * 2;
        let enemy_king_pos = this.map.getKingPosition(this.alliance == Alliance.Red ? Alliance.Blue : Alliance.Red);
        if (!!enemy_king_pos) {
            score += (this.map.width + this.map.height - position.distanceTo(enemy_king_pos)) * 2;
        }


        // get score if injured on house (healing effect)
        if (this.map.getTileAt(position) == Tile.House && this.map.getAllianceAt(position) == entity.alliance) {
            score += (10 - entity.health) * 2;
        }

        // if injured, move towards next house
        if (entity.health < 5 && entity.type != EntityType.Soldier && !!this.nearest_house) {
            let score_inj = this.map.width + this.map.height - position.distanceTo(this.nearest_house.position);
            score += score_inj * score_inj;
        }

        if (this.map.getMap() == 2 && !!this.nearest_house) {
            let dx = Math.abs(this.nearest_house.position.x - position.x) - 1;
            let dy = Math.abs(this.nearest_house.position.y - position.y) - 3;
            if (dx < 0) {
                dx = 0;
            }
            if (dy < 0) {
                dy = 0;
            }
            let score_m2 = this.map.width + this.map.height - 2 * (dx + dy);
            score += score_m2 * score_m2;
        }
        score += 10 * entity.position.distanceTo(position) / (entity.data.mov - 1);
        return Math.floor(score);
    }
}
