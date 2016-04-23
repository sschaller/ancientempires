class Smoke extends Sprite {
    // +2 px - 1
    // +7 px - 2
    // +12 px - 3
    // +17 px - 4
    // +22 px - 0

    static group: Phaser.Group;
    static offset: number = 0;
    static frame: number = 0;
    static all: Smoke[];
    static smokeTimer: number = 0;

    position: Pos;

    static loadHouses(houses: Building[]) {
        for (let house of houses) {
            if (house.alliance == Alliance.None) { continue; }
            if (house.castle) { continue; }
            Smoke.addSmokeAt(house.position);
        }
    }

    static getSmokeAt(position: Pos) {
        for (let smoke of Smoke.all) {
            if (smoke.position.match(position)) {
                return smoke;
            }
            return null;
        }
    }

    static addSmokeAt(position: Pos): boolean {
        let smoke = Smoke.getSmokeAt(position);
        if (!!smoke) { return false; }
        Smoke.all.push(
            new Smoke(position)
        );
    }

    static removeSmokeAt(position: Pos): boolean {
        for (let i = 0; i < Smoke.all.length; i++) {
            if (!Smoke.all[i].position.match(position)) { continue; }
            Smoke.all[i].destroy();
            Smoke.all.splice(i, 1);
            return true;
        }
        return false;
    }

    static update(steps: number) {

        Smoke.smokeTimer += steps;
        if (Smoke.smokeTimer < 5) { return; }
        Smoke.smokeTimer = 0;

        let nf = false;
        Smoke.offset += 1;
        if (Smoke.offset > 27) {
            Smoke.offset = 0;
            Smoke.group.visible = true;
        }else if (Smoke.offset > 22) {
            if (Smoke.frame == 3) {
                Smoke.group.visible = false;
                Smoke.frame = 0;
                nf = true;
            }
        }else if (Smoke.offset > 17) {
            if (Smoke.frame == 2) {
                Smoke.frame = 3;
                nf = true;
            }
        }else if (Smoke.offset > 12) {
            if (Smoke.frame == 1) {
                Smoke.frame = 2;
                nf = true;
            }
        }else if (Smoke.offset > 7) {
            if (Smoke.frame == 0) {
                Smoke.frame = 1;
                nf = true;
            }
        }

        for (let smoke of Smoke.all) {
            if (nf) { smoke.nextFrame(); }
            smoke.update();
        }
    }

    constructor(position: Pos) {
        super(new Pos(position.x * AncientEmpires.TILE_SIZE + 16, position.y * AncientEmpires.TILE_SIZE), Smoke.group, {names: ["b_smoke/0", "b_smoke/1", "b_smoke/2", "b_smoke/3"], ids: []});
        this.position = position;
    }

    update(steps: number = 1) {
        this.worldPosition.y = this.position.y * AncientEmpires.TILE_SIZE - Smoke.offset - 2;
        super.update();
    }

}
