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

class EntityManager {

    selected: Entity;

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
    private move_sprite: Sprite;

    private selection: EntityRange;

    private anim_selection_progress: number;
    private anim_selection_inc: boolean;

    private anim_selection_pos: Pos;
    private anim_selection_line: LinePart[];
    private anim_selection_offset: number;
    private anim_selection_slow: number;

    constructor(map: Map, entity_group: Phaser.Group, selection_group: Phaser.Group, interaction_group: Phaser.Group) {

        this.map = map;
        this.entity_group = entity_group;
        this.selection_group = selection_group;
        this.interaction_group = interaction_group;
        this.interaction_group.visible = false;

        this.selection_graphics = selection_group.game.add.graphics(0, 0, selection_group);
        this.interaction_graphics = interaction_group.game.add.graphics(0, 0, interaction_group);

        this.selected = null;
        this.moving = null;

        this.anim_idle_counter = 0;
        this.anim_idle_state = 0;

        this.entities = [];
        for (let entity of map.getStartEntities()) {
            this.createEntity(entity.type, entity.alliance, entity.position);
        }
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

    update(steps: number, cursor_position: Pos, anim_state: number) {

        if (anim_state != this.anim_idle_state) {
            this.anim_idle_state = anim_state;
            for (let entity of this.entities) {
                entity.setFrame(this.anim_idle_state);
            }
        }

        if (!!this.selection) {
            this.animateSelectionLayer(steps);
            this.animateSelectionLine(steps, cursor_position);
        }

        if (!!this.moving) {
            this.animateMovingEntity(steps);
        }

    }

    selectEntity(entity: Entity): boolean {
        if (!!this.selected) {
            this.deselectEntity();
        }
        this.selected = entity;
        this.showSelection();

        return true;
    }
    deselectEntity(): boolean {
        if (!this.selected) {
            return false;
        }
        this.hideSelection();
        this.selected = null;
        return true;
    }
    showSelection() {

        this.interaction_group.visible = true;
        if (!this.move_sprite) {
            this.move_sprite = new Sprite({x: 0, y: 0}, this.interaction_group, "cursor", [4]);
        }

        this.entity_group.remove(this.selected.sprite);
        this.interaction_group.add(this.selected.sprite);

        this.selection = new EntityRange(this.selected, this.map, this);

        this.anim_selection_progress = 100;
        this.anim_selection_inc = false;
        this.drawSelection();

        this.anim_selection_slow = 0;
        this.anim_selection_offset = 0;
        this.anim_selection_pos = null;
        this.anim_selection_line = null;

    }
    hideSelection() {
        this.interaction_group.remove(this.selected.sprite);
        this.entity_group.add(this.selected.sprite);

        this.interaction_graphics.clear();
        this.interaction_group.visible = false;

        this.selection = null;
        this.selection_graphics.clear();

    }
    drawSelection() {
        this.selection_graphics.beginFill(0xffffff);
        for (let waypoint of this.selection.waypoints) {
            let position = waypoint.position.getWorldPosition();
            if ((waypoint.form & Direction.Up) != 0) {
                this.selection_graphics.drawRect(position.x, position.y, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Right) != 0) {
                this.selection_graphics.drawRect(position.x + AncientEmpires.TILE_SIZE - 4, position.y, 4, AncientEmpires.TILE_SIZE);
            }
            if ((waypoint.form & Direction.Down) != 0) {
                this.selection_graphics.drawRect(position.x, position.y + AncientEmpires.TILE_SIZE - 4, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Left) != 0) {
                this.selection_graphics.drawRect(position.x, position.y, 4, AncientEmpires.TILE_SIZE);
            }
        }
        this.selection_graphics.endFill();
    }

    moveSelectedEntity(target: Pos): boolean {
        if (!!this.getEntityAt(target)) {
            // entity at place
            return false;
        }
        let waypoint = this.selection.getWaypointAt(target);
        if (!waypoint) {
            // target not in range
            return false;
        }
        let line = EntityRange.getLineToWaypoint(waypoint);
        this.moving = {
            entity: this.selected,
            target: target,
            line: line,
            progress: 0
        };
        this.deselectEntity();
        return true;
    }

    animateMovingEntity(steps: number) {
        let move = this.moving;
        let entity = move.entity;

        move.progress += steps;

        if (move.progress >= move.line[0].length * AncientEmpires.TILE_SIZE) {
            move.progress -= move.line[0].length * AncientEmpires.TILE_SIZE;
            move.line.shift();
        }
        if (move.line.length > 0) {
            let diff = new Pos(0, 0).move(move.line[0].direction);
            entity.worldPosition.x = move.line[0].position.x * AncientEmpires.TILE_SIZE + diff.x * move.progress;
            entity.worldPosition.y = move.line[0].position.y * AncientEmpires.TILE_SIZE + diff.y * move.progress;
        } else {
            entity.position = move.target;
            entity.worldPosition = move.target.getWorldPosition();
            this.moving = null;
        }
        entity.update(steps);
    }

    animateSelectionLayer(steps: number) {
        let value = this.anim_selection_progress / 100 * 0xFF | 0;
        this.selection_graphics.tint = (value << 16) | (value << 8) | value;

        if (this.anim_selection_inc) {
            this.anim_selection_progress += steps;
            if (this.anim_selection_progress >= 100) {
                this.anim_selection_progress = 100;
                this.anim_selection_inc = false;
            }
        } else {
            this.anim_selection_progress -= steps;
            if (this.anim_selection_progress <= 40) {
                this.anim_selection_progress = 40;
                this.anim_selection_inc = true;
            }
        }
    }

    private animateSelectionLine(steps: number, cursor_position: Pos) {
        if (!cursor_position.match(this.anim_selection_pos)) {
            this.anim_selection_pos = cursor_position;
            let waypoint = this.selection.getWaypointAt(cursor_position);
            if (!!waypoint) {
                // update line if a way to cursor position exists
                this.move_sprite.setWorldPosition({x: (cursor_position.x * AncientEmpires.TILE_SIZE - 1), y: (cursor_position.y * AncientEmpires.TILE_SIZE - 1)});
                this.anim_selection_line = EntityRange.getLineToWaypoint(waypoint);
            }
        }
        if (!this.anim_selection_line) { return; }
        this.anim_selection_slow += steps;
        if (this.anim_selection_slow < 5) { return; }
        this.anim_selection_slow -= 5;

        this.interaction_graphics.clear();
        this.interaction_graphics.beginFill(0xffffff);

        for (let part of this.anim_selection_line){
            this.addSegmentsForLinePart(part, this.anim_selection_offset);
            this.anim_selection_offset = (this.anim_selection_offset + part.length * AncientEmpires.TILE_SIZE) % (AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING);
        }
        this.interaction_graphics.endFill();
        this.anim_selection_offset -= 1;
        if (this.anim_selection_offset < 0) {
            this.anim_selection_offset = AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING - 1;
        }
    }

    private addSegmentsForLinePart(part: LinePart, offset: number) {
        let distance = part.length * AncientEmpires.TILE_SIZE;
        let x = (part.position.x + 0.5) * AncientEmpires.TILE_SIZE;
        let y = (part.position.y + 0.5) * AncientEmpires.TILE_SIZE;

        while (distance > 0) {
            let length = AncientEmpires.LINE_SEGMENT_LENGTH;
            if (offset > 0) {
                length -= offset;
                offset = 0;
            }
            if (distance < length) { length = distance; }


            switch (part.direction) {
                case Direction.Up:
                    if (length > 0) { this.interaction_graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y - length, AncientEmpires.LINE_SEGMENT_WIDTH, length); }
                    y -= length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Right:
                    if (length > 0) { this.interaction_graphics.drawRect(x, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length, AncientEmpires.LINE_SEGMENT_WIDTH); }
                    x += length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Down:
                    if (length > 0) { this.interaction_graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y, AncientEmpires.LINE_SEGMENT_WIDTH, length); }
                    y += length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Left:
                    if (length > 0) { this.interaction_graphics.drawRect(x - length, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length, AncientEmpires.LINE_SEGMENT_WIDTH); }
                    x -= length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
            }

            distance -= length + AncientEmpires.LINE_SEGMENT_SPACING;
        }
    }
}
