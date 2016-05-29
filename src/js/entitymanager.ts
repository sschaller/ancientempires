interface EntityManagerDelegate {
    entityDidMove(entity: Entity): void;
    entityDidAnimation(entity: Entity): void;
}

class EntityManager {

    delegate: EntityManagerDelegate;

    private map: Map;

    private anim_idle_state: number;

    private entity_group: Phaser.Group;
    private selection_group: Phaser.Group;
    private interaction_group: Phaser.Group;
    private anim_group: Phaser.Group;

    private selection_graphics: Phaser.Graphics;
    private interaction_graphics: Phaser.Graphics;
    private show_range: boolean;

    constructor(map: Map, entity_group: Phaser.Group, selection_group: Phaser.Group, interaction_group: Phaser.Group, anim_group: Phaser.Group, delegate: EntityManagerDelegate) {

        this.map = map;
        this.entity_group = entity_group;
        this.selection_group = selection_group;
        this.interaction_group = interaction_group;
        this.anim_group = anim_group;
        this.delegate = delegate;

        this.selection_graphics = selection_group.game.add.graphics(0, 0, selection_group);
        this.interaction_graphics = interaction_group.game.add.graphics(0, 0, interaction_group);

        this.anim_idle_state = 0;
        this.map.entity_range.init(this.interaction_group);

        for (let entity of this.map.entities) {
            this.createEntity(entity);
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

    showRange() {
        this.show_range = true;
        this.map.entity_range.draw(this.selection_graphics);
    }
    hideRange() {
        this.show_range = false;
        this.map.entity_range.clear(this.selection_graphics, this.interaction_graphics);
    }

    update(steps: number, cursor_position: Pos, anim_state: number) {

        for (let entity of this.map.entities) {
            if (this.anim_idle_state != anim_state) {
                entity.setFrame(this.anim_idle_state);
            }
            entity.update(steps);
        }
        this.anim_idle_state = anim_state;

        if (this.show_range) {
            this.map.entity_range.update(steps, cursor_position, anim_state, this.selection_graphics, this.interaction_graphics);
        }

    }

    /*

        ----- RANGE

     */

    animationDidEnd(animation: EntityAnimation) {
        animation.entity.animation = null;
        switch (animation.type) {
            case EntityAnimationType.Attack:
                let attack = <AttackAnimation> animation;

                if (attack.first && attack.entity.shouldCounter(attack.attacker.position)) {
                    this.attackEntity(attack.entity, attack.attacker, false);
                    return;
                }

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
                this.delegate.entityDidAnimation(attack.entity);
                break;
            case EntityAnimationType.Status:
                animation.entity.status_animation = -1;
                break;
            case EntityAnimationType.Raise:
                this.delegate.entityDidAnimation(animation.entity);
                break;
        }
    }

    showWisped() {
        for (let entity of this.map.entities) {
            if (entity.status != EntityStatus.Wisped) { continue; }
            if (!!entity.animation) { continue; }
            entity.startAnimation(new StatusAnimation(entity, this, this.anim_group, 1));
        }
    }

    attackEntity(attacker: Entity, target: Entity, first: boolean = true) {
        attacker.attack(target, this.map);
        target.startAnimation(new AttackAnimation(target, this, this.anim_group, attacker, first));
    }
    raiseEntity(wizard: Entity, tomb: Entity) {
        tomb.startAnimation(new RaiseAnimation(tomb, this, this.anim_group, wizard.alliance));
    }

    createEntity(entity: Entity) {
        entity.init(this.entity_group);
    }
}
