interface EntityData {
    name: string;
    mov: number;
    atk: number;
    def: number;
    max: number;
    min: number;
    cost: number;
    battle_positions: IPos[];
    flags: EntityFlags;
}
enum EntityFlags {
    None = 0, // Golem, Skeleton
    CanFly = 1,
    WaterBoost = 2,
    CanBuy = 4,
    CanOccupyHouse = 8,
    CanOccupyCastle = 16,
    CanRaise = 32,
    AntiFlying = 64,
    CanPoison = 128,
    CanWisp = 256,
    CantAttackAfterMoving = 512
}
interface IEntity {
    type: EntityType;
    alliance: Alliance;
    position: Pos;
}
enum EntityType {
    Soldier,
    Archer,
    Lizard,
    Wizard,
    Wisp,
    Spider,
    Golem,
    Catapult,
    Wyvern,
    King,
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

    type: EntityType;
    alliance: Alliance;
    position: Pos;
    data: EntityData;

    health: number;
    rank: number;
    ep: number;

    death_count: number;

    status: EntityStatus;
    state: EntityState;
    icon_moved: Phaser.Image;

    atk_boost: number = 0;
    def_boost: number = 0;
    mov_boost: number = 0;

    constructor(type: EntityType, alliance: Alliance, position: Pos, group: Phaser.Group) {
        super(position.getWorldPosition(), group, "unit_icons_" + (<number> alliance), [type, type + AncientEmpires.ENTITIES.length]);

        this.data = AncientEmpires.ENTITIES[type];
        this.alliance = alliance;
        this.type = type;
        this.position = position;

        this.death_count = 0;

        this.health = 10;
        this.rank = 0;
        this.ep = 0;
        this.status = 0;
        this.state = EntityState.Ready;

        this.icon_moved = group.game.add.image(0, 0, "chars", 4, group);
        this.icon_moved.visible = false;
    }
    isDead(): boolean {
        return this.health == 0;
    }
    hasFlag(flag: EntityFlags) {
        return (this.data.flags & flag) != 0;
    }
    getDistanceToEntity(entity: Entity): number {
        return Math.abs(entity.position.x - this.position.x) + Math.abs(entity.position.y - this.position.y);
    }
    didRankUp(): boolean {
        if (this.rank < 3 && this.ep >= 75 << this.rank) {
            this.ep = 0;
            this.rank++;
            return true;
        }
        return false;
    }
    attack(target: Entity, map: Map) {

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

        let red_health = Math.floor((atk - (def + map.getDefAt(target.position, target)) * (2 / 3)) * this.health / 10);
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

    updateState(state: EntityState, show: boolean) {

        this.state = state;

        let show_icon = (show && state == EntityState.Moved);

        this.icon_moved.x = this.sprite.x + AncientEmpires.TILE_SIZE - 7;
        this.icon_moved.y = this.sprite.y + AncientEmpires.TILE_SIZE - 7;
        this.icon_moved.visible = show_icon;
        this.icon_moved.bringToTop();
    }

    getMovement(): number {
        // if poisoned, less -> apply here
        return this.data.mov;
    }
}
