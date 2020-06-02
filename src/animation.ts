enum EntityAnimationType {
    Attack,
    Status,
    Raise
}
interface EntityAnimationDelegate {
    animationDidEnd(animation: EntityAnimation): void;
}
class EntityAnimation {

    type: EntityAnimationType;
    entity: Entity;

    protected delegate: EntityAnimationDelegate;

    private progress: number;
    private current_step: number;
    private steps: number[];
    private acc: number;

    constructor(steps: number[], entity: Entity, delegate: EntityAnimationDelegate) {
        this.progress = 0;
        this.current_step = -1;
        this.steps = steps;
        this.acc = 0;

        this.delegate = delegate;
        this.entity = entity;
    }
    step(init: boolean, step: number, progress: number) {
        // return true if we should continue, false if we should stop execution
    }
    run(steps: number) {

        this.acc += steps;
        if (this.acc < 5) {
            return;
        }
        this.acc -= 5;

        let step = 0;
        while (step < this.steps.length) {
            if (this.progress < this.steps[step]) {
                break;
            }
            step++;
        }
        let init = false;
        if (step > this.current_step) {
            this.current_step = step;
            init = true;
        }
        let progress = this.current_step > 0 ? this.progress - this.steps[(this.current_step - 1)] : this.progress;
        this.progress++;
        this.step(init, this.current_step, progress);
    }
}
class AttackAnimation extends EntityAnimation {

    first: boolean;
    attacker: Entity;

    private group: Phaser.Group;
    private image: Phaser.Image;

    constructor(entity: Entity, delegate: EntityAnimationDelegate, group: Phaser.Group, attacker: Entity, first: boolean) {
        super([6, 8], entity, delegate);

        this.type = EntityAnimationType.Attack;

        this.first = first;
        this.attacker = attacker;

        this.group = group;
    }
    step(init: boolean, step: number, progress: number) {
        let middle = this.entity.position.getWorldPosition();

        switch (step) {
            case 0:
                if (init) {
                    this.image = this.group.game.add.image(middle.x, middle.y, "redspark", 0, this.group);
                }
                this.image.frame = progress % 3;
                this.entity.setWorldPosition({x: middle.x + 2 - progress % 2 * 4, y: middle.y}); // 0 - 2px right, 1 - 2px left, 2 - 2px right
                break;
            case 1:
                if (init) {
                    this.image.visible = false;
                }
                this.entity.setWorldPosition({x: middle.x + 2 - progress % 2 * 4, y: middle.y}); // 7 - 2px left, 8 - 2px right
                break;
            case 2:
                this.entity.setWorldPosition(this.entity.position.getWorldPosition());
                this.image.destroy();
                this.delegate.animationDidEnd(this);
        }
    }
}
class StatusAnimation extends EntityAnimation {
    status: number;

    private group: Phaser.Group;
    private image: Phaser.Image;
    private image2: Phaser.Image;

    constructor(entity: Entity, delegate: EntityAnimationDelegate, group: Phaser.Group, status: number) {
        super(status == 1 ? [0, 6, 14] : [10, 16, 24], entity, delegate);
        this.type = EntityAnimationType.Status;

        this.status = status;
        this.group = group;
    }
    step(init: boolean, step: number, progress: number) {
        let middle = this.entity.position.getWorldPosition();
        switch (step) {
            case 0:
                // wait
                break;
            case 1:
                if (init) {
                    if (this.status == 0 || this.status == 2) {
                        this.image2 = this.group.game.add.image(middle.x + 4, middle.y + 4, "status", this.status, this.group);
                    }
                    this.image = this.group.game.add.image(middle.x, middle.y, "spark", 0, this.group);
                }
                this.image.frame = progress;
                break;
            case 2:
                if (this.status < 0) {
                    if (init) {
                        this.image.loadTexture("smoke", 0);
                        // replace with tomb graphic
                        this.entity.updateState(EntityState.Dead, true);
                    }
                    this.image.y = middle.y - progress * 3; // 0, 3, 6
                    this.image.frame = Math.floor(progress / 2);
                } else {
                    if (init) {
                        this.image.destroy();
                    }
                }
                break;
            case 3:
                if (this.status < 0) {
                    this.image.destroy();
                }else if (this.status == 0 || this.status == 2) {
                    this.image2.destroy();
                }
                this.delegate.animationDidEnd(this);
                this.delegate.animationDidEnd(this);
        }
    }
}
class RaiseAnimation extends EntityAnimation {
    new_alliance: Alliance;

    private group: Phaser.Group;
    private images: Phaser.Image[];

    constructor(entity: Entity, delegate: EntityAnimationDelegate, group: Phaser.Group, new_alliance: Alliance) {
        super([8, 18], entity, delegate);
        this.type = EntityAnimationType.Raise;

        this.group = group;
        this.new_alliance = new_alliance;
        this.images = [];

    }
    step(init: boolean, step: number, progress: number) {
        let middle = this.entity.position.getWorldPosition();
        switch (step) {
            case 0:
                if (init) {
                    this.images.push(this.group.game.add.image(middle.x - 8, middle.y - 8, "spark", 0, this.group));
                    this.images.push(this.group.game.add.image(middle.x + 8, middle.y - 8, "spark", 0, this.group));
                    this.images.push(this.group.game.add.image(middle.x - 8, middle.y + 8, "spark", 0, this.group));
                    this.images.push(this.group.game.add.image(middle.x + 8, middle.y + 8, "spark", 0, this.group));
                }
                let d = 8 - progress;

                this.images[0].frame = progress % 6;
                this.images[0].x = middle.x - d;
                this.images[0].y = middle.y - d;

                this.images[1].frame = progress % 6;
                this.images[1].x = middle.x + d;
                this.images[1].y = middle.y - d;

                this.images[2].frame = progress % 6;
                this.images[2].x = middle.x - d;
                this.images[2].y = middle.y + d;

                this.images[3].frame = progress % 6;
                this.images[3].x = middle.x + d;
                this.images[3].y = middle.y + d;

                break;
            case 1:
                if (init) {
                    this.entity.raise(this.new_alliance);
                }
                let d2 = -progress;

                this.images[0].frame = (progress + 2) % 6;
                this.images[0].x = middle.x - d2;
                this.images[0].y = middle.y - d2;

                this.images[1].frame = (progress + 2) % 6;
                this.images[1].x = middle.x + d2;
                this.images[1].y = middle.y - d2;

                this.images[2].frame = (progress + 2) % 6;
                this.images[2].x = middle.x - d2;
                this.images[2].y = middle.y + d2;

                this.images[3].frame = (progress + 2) % 6;
                this.images[3].x = middle.x + d2;
                this.images[3].y = middle.y + d2;
                break;
            case 2:
                this.images[0].destroy();
                this.images[1].destroy();
                this.images[2].destroy();
                this.images[3].destroy();
                this.delegate.animationDidEnd(this);
        }
    }
}
