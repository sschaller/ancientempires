interface EntityData {
    name: string;
    cost: number;
    atk: number;
    def: number;
    mov: number;
    min: number;
    max: number;
    tile: number;
    desc: string;
}
interface EntityStart {
    alliance: Alliance;
    type: EntityType;
    x: number;
    y: number;
}
interface EntityPath {
    entity: Entity;
    target: Pos;
    line: LinePart[];
    progress: number;
}
enum EntityType {
    King,
    Soldier,
    Archer,
    Lizard,
    Wizard,
    Wisp,
    Spider,
    Golem,
    Catapult,
    Wyvern,
    Skeleton
}
enum EntityStatus {
    None = 0,
    Poisoned = 1 << 0,
    Wisped = 1 << 1
}
enum EntityState {
    Ready = 0,
    Moved = 1,
    Dead = 2
}

class Entity extends Sprite {

    static animTimer: number = 0;
    static all: Entity[];
    static group: Phaser.Group;
    static pathfinder: Pathfinder;
    static moving: EntityPath;

    alliance: Alliance;
    type: EntityType;
    position: Pos;
    data: EntityData;

    health: number;
    rank: number;
    ep: number;

    status: EntityStatus;
    state: EntityState;

    atk_boost: number = 0;
    def_boost: number = 0;
    mov_boost: number = 0;

    static update(steps: number = 1) {
        Entity.animTimer += steps;
        if (Entity.animTimer >= 25) {
            Entity.animTimer = 0;
            for (let entity of Entity.all) {
                entity.nextFrame();
            }
        }
        if (!!Entity.moving) {
            Entity.moving.entity.update(steps);
        }
    }
    static getEntityAt(position: Pos): Entity {
        for (let entity of Entity.all){
            if (entity.position.match(position)) {
                return entity;
            }
        }
        return null;
    }
    static loadEntities(entities: EntityStart[]) {
        for (let start of entities) {
            Entity.all.push(
                new Entity(start.alliance, start.type, new Pos(start.x, start.y))
            );
        }
    }

    constructor(alliance: Alliance, type: EntityType, position: Pos, health: number = 10) {
        super(position.getWorldPosition(), Entity.group, {names: [], ids: [AncientEmpires.ENTITIES[type].tile + AncientEmpires.ENTITY_ALLIANCE_DIFF * (alliance - 1)]});

        this.data = AncientEmpires.ENTITIES[type];
        this.alliance = alliance;
        this.type = type;
        this.position = position;
        this.health = health;
        this.rank = 0;
        this.ep = 0;
        this.status = 0;
        this.state = EntityState.Ready;
    }
    loadSprite() {
        this.sprite = Sprite.game.add.sprite(this.worldPosition.x, this.worldPosition.y, "tileset", this.frames.ids[0]);
    }
    nextFrame() {
        this.currentFrame = 1 - this.currentFrame;
        this.sprite.frame = this.frames.ids[0] + this.currentFrame;
    }
    didRankUp(): boolean {
        if (this.rank < 3 && this.ep >= 75 << this.rank) {
            this.ep = 0;
            this.rank++;
            return true;
        }
        return false;
    }
    attack(target: Entity) {

        let n: number;

        // get base damage
        let atk = this.data.atk + this.atk_boost;

        if (this.type == EntityType.Archer && target.type == EntityType.Wyvern) {
            atk += 2;
        }

        if (this.type == EntityType.Wisp && target.type == EntityType.Skeleton) {
            atk += 3;
        }

        n = Math.floor(Math.random() * 20) + this.rank;
        if (n > 19) {
            atk += 2;
        }else if (n >= 17) {
            atk += 1;
        }else if (n <= -19) {
            atk -= 2;
        }else if (n <= -17) {
            atk -= 1;
        }

        let def = target.data.def + target.def_boost;

        n = Math.floor(Math.random() * 20) + target.rank;

        if (n > 19) {
            def += 2;
        }else if (n >= 17) {
            def += 1;
        }else if (n <= -19) {
            def -= 2;
        }else if (n <= -17) {
            def -= 1;
        }

        let red_health = Math.floor((atk - (def + Entity.pathfinder.getDefAt(target.position, target)) * (2 / 3)) * this.health / 10);
        if (red_health > target.health) {
            red_health = target.health;
        }
        target.health = target.health - red_health;
        this.ep += (target.data.atk + target.data.def) * red_health;
    }
    updateStatus() {
        this.atk_boost = 0;
        this.def_boost = 0;
        this.mov_boost = 0;
        if (this.status & EntityStatus.Poisoned) {
            this.atk_boost--;
            this.def_boost--;
            this.mov_boost--;
        }
        if (this.status & EntityStatus.Wisped) {
            this.atk_boost++;
        }
    }
    setStatus(status: EntityStatus) {
        this.status |= status;
        this.updateStatus();
    }
    clearStatus(status: EntityStatus) {
        this.status &= ~status;
        this.updateStatus();
    }
    getInfo() {
        return this.data.name + ", alliance " + this.alliance + ": " + this.position.x + " - " + this.position.y;
    }
    move(target: Pos, line: LinePart[]) {
        this.sprite.bringToTop();
        Entity.moving = {
            entity: this,
            target: target,
            line: line,
            progress: 0
        };
    }
    update(steps: number = 1) {
        if (Entity.moving.entity == this) {
            let current = Entity.moving.line[0];
            let diff = new Pos(0, 0).move(current.direction);

            Entity.moving.progress += steps;

            this.worldPosition.x = current.position.x * AncientEmpires.TILE_SIZE + diff.x * Entity.moving.progress;
            this.worldPosition.y = current.position.y * AncientEmpires.TILE_SIZE + diff.y * Entity.moving.progress;

            if (Entity.moving.progress >= current.length * AncientEmpires.TILE_SIZE) {
                Entity.moving.line.shift();
                Entity.moving.progress -= current.length * AncientEmpires.TILE_SIZE;
            }
            if (Entity.moving.line.length < 1) {
                // how to undo?
                this.position = Entity.moving.target;
                this.worldPosition.x = this.position.x * AncientEmpires.TILE_SIZE;
                this.worldPosition.y = this.position.y * AncientEmpires.TILE_SIZE;

                Entity.moving = null;
            }
            super.update();
        }
    }
}
