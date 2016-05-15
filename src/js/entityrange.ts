interface IWaypoint {
    position: Pos;
    cost: number;
    form: number;
    parent: IWaypoint;
}
enum EntityRangeType {
    None,
    Move,
    Attack,
    Raise
}
class EntityRange {

    waypoints: IWaypoint[];
    map: Map;
    entity_manager: EntityManager;

    type: EntityRangeType;

    range_lighten: boolean;
    range_progress: number;

    line: LinePart[];
    line_offset: number;
    line_end_position: Pos;
    line_slow: number;

    private extra_cursor: Sprite;


    static findPositionInList(position: Pos, waypoints: IWaypoint[]) {
        for (let waypoint of waypoints){
            if (waypoint.position.match(position)) { return waypoint; }
        }
        return null;
    }
    static getLineToWaypoint(waypoint: IWaypoint): LinePart[] {
        let line: LinePart[] = [];
        while (waypoint.parent != null) {
            let next = waypoint;
            waypoint = waypoint.parent;

            let direction = waypoint.position.getDirectionTo(next.position);
            if (line.length > 0 && line[0].direction == direction) {
                line[0].position = waypoint.position;
                line[0].length++;
                continue;
            }
            line.unshift({position: waypoint.position, direction: direction, length: 1});
        }
        return line;
    }

    constructor(map: Map, entity_manager: EntityManager, group: Phaser.Group) {
        this.map = map;
        this.entity_manager = entity_manager;
        this.type = EntityRangeType.None;

        this.extra_cursor = new Sprite({x: 0, y: 0}, group, "cursor", [4]);
    }

    getWaypointAt(position: Pos) {
        return EntityRange.findPositionInList(position, this.waypoints);
    }

    createRange(type: EntityRangeType, entity: Entity, range_graphics: Phaser.Graphics) {

        this.type = type;

        this.range_lighten = false;
        this.range_progress = 100;

        this.line_end_position = null;
        this.line_slow = 0;
        this.line_offset = 0;

        switch (type) {
            case EntityRangeType.Raise:
                this.waypoints = [
                    {position: entity.position.copy(Direction.Up), cost: 0, form: Direction.All, parent: null},
                    {position: entity.position.copy(Direction.Right), cost: 0, form: Direction.All, parent: null},
                    {position: entity.position.copy(Direction.Down), cost: 0, form: Direction.All, parent: null},
                    {position: entity.position.copy(Direction.Left), cost: 0, form: Direction.All, parent: null}
                ];
                this.extra_cursor.hide();
                break;
            case EntityRangeType.Attack:

                let min = entity.data.min;
                let max = entity.data.max;

                this.waypoints = this.calculateWaypoints(entity, max, false);

                // remove all waypoints that are nearer than minimum range
                for (let i = this.waypoints.length - 1; i >= 0; i--) {
                    let waypoint = this.waypoints[i];
                    if (waypoint.cost < min) {
                        this.waypoints.splice(i, 1);
                    }
                }
                this.addForm();

                this.extra_cursor.setFrames([2, 3]);
                this.extra_cursor.setOffset(-1, -1);
                this.extra_cursor.show();
                break;
            case EntityRangeType.Move:
                this.waypoints = this.calculateWaypoints(entity, entity.getMovement(), !entity.hasFlag(EntityFlags.CanFly));
                this.addForm();

                this.extra_cursor.setFrames([4]);
                this.extra_cursor.setOffset(-1, -4);
                this.extra_cursor.show();
                break;
        }

        this.draw(range_graphics);

    }

    update(steps: number, cursor_position: Pos, anim_state: number, range_graphics: Phaser.Graphics, line_graphics: Phaser.Graphics) {

        if (this.type == EntityRangeType.None) {
            return;
        }

        if (this.range_lighten) {
            this.range_progress += steps;
            if (this.range_progress >= 100) {
                this.range_progress = 100;
                this.range_lighten = false;
            }
        } else {
            this.range_progress -= steps;
            if (this.range_progress <= 40) {
                this.range_progress = 40;
                this.range_lighten = true;
            }
        }

        this.extra_cursor.setFrame(anim_state);

        if (!cursor_position.match(this.line_end_position)) {
            this.line_end_position = cursor_position.copy();

            let endpoint = this.getWaypointAt(cursor_position);
            if (!!endpoint) {
                this.extra_cursor.setWorldPosition(cursor_position.getWorldPosition());
                this.line = EntityRange.getLineToWaypoint(endpoint);
            }
        }

        if (this.type == EntityRangeType.Move) {

            this.line_slow += steps;
            if (this.line_slow >= 5) {
                this.line_slow -= 5;

                this.line_offset -= 1;
                if (this.line_offset < 0) {
                    this.line_offset = AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING - 1;
                }

                if (this.line) {
                    line_graphics.clear();
                    line_graphics.beginFill(0xffffff);

                    for (let part of this.line){
                        this.drawSegment(line_graphics, part, this.line_offset);
                        this.line_offset = (this.line_offset + part.length * AncientEmpires.TILE_SIZE) % (AncientEmpires.LINE_SEGMENT_LENGTH + AncientEmpires.LINE_SEGMENT_SPACING);
                    }
                    line_graphics.endFill();
                }
            }


        }
        let grey = this.range_progress / 100 * 0xFF | 0;
        range_graphics.tint = (grey << 16) | (grey << 8) | grey;
    }

    clear(range_graphics: Phaser.Graphics, line_graphics: Phaser.Graphics) {
        this.type = EntityRangeType.None;
        this.waypoints = [];
        this.extra_cursor.hide();
        range_graphics.clear();
        line_graphics.clear();
    }

    private draw(graphics: Phaser.Graphics) {

        let color: number;
        switch (this.type) {
            case EntityRangeType.Move:
            case EntityRangeType.Raise:
                color = 0xffffff;
                break;
            case EntityRangeType.Attack:
                color = 0xff0000;
                break;
        }

        graphics.clear();
        graphics.beginFill(color);
        for (let waypoint of this.waypoints) {
            let position = waypoint.position.getWorldPosition();
            if ((waypoint.form & Direction.Up) != 0) {
                graphics.drawRect(position.x, position.y, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Right) != 0) {
                graphics.drawRect(position.x + AncientEmpires.TILE_SIZE - 4, position.y, 4, AncientEmpires.TILE_SIZE);
            }
            if ((waypoint.form & Direction.Down) != 0) {
                graphics.drawRect(position.x, position.y + AncientEmpires.TILE_SIZE - 4, AncientEmpires.TILE_SIZE, 4);
            }
            if ((waypoint.form & Direction.Left) != 0) {
                graphics.drawRect(position.x, position.y, 4, AncientEmpires.TILE_SIZE);
            }
        }
        graphics.endFill();
    }

    private calculateWaypoints(entity: Entity, max_cost: number, use_terrain: boolean): IWaypoint[] {
        // cost for origin point is always 1
        let open: IWaypoint[] = [{position: entity.position, cost: (use_terrain ? 1 : 0), form: 0, parent: null}];
        let closed: IWaypoint[] = [];
        while (open.length > 0) {
            let current = open.shift();
            closed.push(current);

            let adjacent_positions = this.map.getAdjacentPositionsAt(current.position);
            for (let position of adjacent_positions) {
                this.checkPosition(position, current, open, closed, max_cost, use_terrain, entity);
            }
        }
        return closed;
    }

    private checkPosition(position: Pos, parent: IWaypoint, open: IWaypoint[], closed: IWaypoint[], max_cost: number, use_terrain: boolean, entity: Entity): boolean {

        // already is the lowest possible
        if (!!EntityRange.findPositionInList(position, closed)) { return false; }

        if (use_terrain) {
            let is_occupied = this.entity_manager.getEntityAt(position);
            if (!!is_occupied && is_occupied.alliance != entity.alliance) { return false; }
        }

        let tile_cost = 1;
        if (use_terrain) {
            tile_cost = this.map.getCostAt(position, entity);
        }

        let new_cost = parent.cost + tile_cost;
        if (new_cost > max_cost) { return false; }

        let in_open = EntityRange.findPositionInList(position, open);
        // check if in open stack and we are lower
        if (!!in_open) {
            if (in_open.cost <= new_cost) { return false; }
            in_open.cost = new_cost;
            in_open.parent = parent;
            return true;
        }
        open.push({position: position, parent: parent, form: 0, cost: new_cost});
        return true;
    }
    private addForm() {
        for (let waypoint of this.waypoints) {
            waypoint.form = 0;
            if (waypoint.position.y > 0 && !this.getWaypointAt(waypoint.position.copy(Direction.Up))) { waypoint.form += 1; }
            if (waypoint.position.x < this.map.width - 1 && !this.getWaypointAt(waypoint.position.copy(Direction.Right))) { waypoint.form += 2; }
            if (waypoint.position.y < this.map.height - 1 && !this.getWaypointAt(waypoint.position.copy(Direction.Down))) { waypoint.form += 4; }
            if (waypoint.position.x > 0 && !this.getWaypointAt(waypoint.position.copy(Direction.Left))) { waypoint.form += 8; }
        }
    }
    private drawSegment(graphics: Phaser.Graphics, part: LinePart, offset: number) {
        let distance = part.length * AncientEmpires.TILE_SIZE;
        let x = (part.position.x + 0.5) * AncientEmpires.TILE_SIZE;
        let y = (part.position.y + 0.5) * AncientEmpires.TILE_SIZE;

        while (distance > 0) {
            let length = AncientEmpires.LINE_SEGMENT_LENGTH;
            if (offset > 0) {
                length -= offset;
                offset = 0;
            }
            if (distance < length) {
                length = distance;
            }

            switch (part.direction) {
                case Direction.Up:
                    if (length > 0) { graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y - length, AncientEmpires.LINE_SEGMENT_WIDTH, length); }
                    y -= length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Right:
                    if (length > 0) { graphics.drawRect(x, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length, AncientEmpires.LINE_SEGMENT_WIDTH); }
                    x += length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Down:
                    if (length > 0) { graphics.drawRect(x - AncientEmpires.LINE_SEGMENT_WIDTH / 2, y, AncientEmpires.LINE_SEGMENT_WIDTH, length); }
                    y += length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
                case Direction.Left:
                    if (length > 0) { graphics.drawRect(x - length, y - AncientEmpires.LINE_SEGMENT_WIDTH / 2, length, AncientEmpires.LINE_SEGMENT_WIDTH); }
                    x -= length + AncientEmpires.LINE_SEGMENT_SPACING;
                    break;
            }
            distance -= length + AncientEmpires.LINE_SEGMENT_SPACING;
        }
    }
}
