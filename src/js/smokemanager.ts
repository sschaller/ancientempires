/// <reference path="smoke.ts" />

class SmokeManager {
    smoke: Smoke[];
    map: Map;
    group: Phaser.Group;

    anim_slow: number;
    anim_state: number;
    anim_offset: number;

    constructor(map: Map, group: Phaser.Group) {
        this.map = map;
        this.group = group;

        this.anim_slow = 0;
        this.anim_state = 0;
        this.anim_offset = 0;

        this.smoke = [];
        for (let house of map.getOccupiedHouses()) {
            this.createSmoke(house.position);
        }
        this.createSmoke(new Pos(3, 13));
    }
    createSmoke(position: Pos) {
        this.smoke.push(new Smoke(position, this.group, "b_smoke", [0, 1, 2, 3]));
    }
    update(steps: number) {

        this.anim_slow += steps;
        if (this.anim_slow < 5) {
            return;
        }
        this.anim_slow = 0;

        this.anim_offset++;
        if (this.anim_offset > 27) {
            this.anim_state = 0;
            this.anim_offset = 0;
            this.group.visible = true;
        } else if (this.anim_offset > 22 && this.anim_state == 3) {
            this.anim_state = 4;
            this.group.visible = false;
        } else if (this.anim_offset > 17 && this.anim_state == 2) {
            this.anim_state = 3;
        } else if (this.anim_offset > 12 && this.anim_state == 1) {
            this.anim_state = 2;
        } else if (this.anim_offset > 7 && this.anim_state == 0) {
            this.anim_state = 1;
        }

        for (let smoke of this.smoke) {
            smoke.setFrame(this.anim_state);
            smoke.world_position.y = smoke.position.y * AncientEmpires.TILE_SIZE - this.anim_offset - 2;
            smoke.update();
        }
    }

}
