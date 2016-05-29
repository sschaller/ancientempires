/// <reference path="gamecontroller.ts" />
/// <reference path="menu.ts" />

enum ActiveMenuType {
    CampaignMaps,
    SkirmishMaps,
    SkirmishPlayers
}

class MainMenu extends Phaser.State implements MenuDelegate {

    private knights: Phaser.Image;
    private title: Phaser.Image;
    private title_mask: Phaser.Graphics;
    private intro: boolean;
    private intro_acc: number;
    private intro_progress: number;

    private main: MenuOptions;
    private menu_select: MenuSelect;

    private frame_manager: FrameManager;
    private notification_shown: boolean;

    private keys: Input;

    private active_about: Phaser.Group;
    private active_instructions: Phaser.Group;
    private active_instruction_nr: number;

    private active_select: ActiveMenuType;
    private active_skirmish: number;

    static drawTransition(progress: number, max_progress: number, graphics: Phaser.Graphics, image_width: number, image_height: number) {

        let max_segment_width = Math.ceil(image_width / 4);
        let max_segment_height = Math.ceil(image_height / 2);

        let until_all = max_progress - 6;
        for (let x = 0; x < 4; x++) {
            let show = Math.floor(progress - x * 2);
            if (show <= 0) {
                // nothing to draw after this point
                break;
            }
            let width: number;
            let height: number;
            if (show >= until_all) {
                width = max_segment_width;
                height = max_segment_height;
            } else {
                width = Math.floor(show * max_segment_width / until_all);
                height = Math.floor(show * max_segment_height / until_all);
            }
            let margin_x = Math.floor((max_segment_width - width) / 2);
            let margin_y = Math.floor((max_segment_height - height) / 2);
            let offset_x = x * max_segment_width + margin_x;
            for (let y = 0; y < 2; y ++) {
                let offset_y = y * max_segment_height + margin_y;
                graphics.drawRect(offset_x, offset_y, width, height);
            }
        }

    }

    static loadGame(game: Phaser.Game): boolean {
        let save: GameSave;
        try {
            let data = localStorage.getItem("save.rs");
            save = JSON.parse(data);
        } catch (e) {
            return false;
        }
        if (!save) {
            return false;
        }
        game.state.start("Game", true, false, save);
        return true;
    }

     static startGame(game: Phaser.Game, campaign: boolean, map: number, players: boolean[] = [true, false]) {
        let save: GameSave = {
            campaign: campaign,
            map: map,
            players: players
        };
        game.state.start("Game", true, false, save);
    }

    static showAbout(game: Phaser.Game): Phaser.Group {
        let group = game.add.group();
        group.fixedToCamera = true;

        let background = game.add.graphics(0, 0, group);
        background.beginFill(0xffffff);
        background.drawRect(0, 0, game.width, game.height);
        background.endFill();
        background.beginFill(0x000000);
        background.drawRect(0, 37, game.width, 1);
        background.endFill();

        game.add.bitmapText(10, 26, "font7", AncientEmpires.LANG[8], 7, group);
        let text = game.add.bitmapText(10, 42, "font7", AncientEmpires.LANG[0] + AncientEmpires.LANG[14], 7, group);
        text.maxWidth = game.width - 20;
        return group;
    }

    static showInstructions(group: Phaser.Group, page: number = 0) {
        group.removeChildren();

        let background = group.game.add.graphics(0, 0, group);
        background.beginFill(0xffffff);
        background.drawRect(0, 0, group.game.width, group.game.height);
        background.endFill();
        background.beginFill(0x000000);
        background.drawRect(0, 37, group.game.width, 1);
        background.endFill();

        group.game.add.bitmapText(10, 26, "font7", AncientEmpires.LANG[7] + (page > 0 ? (" - " + page) : ""), 7, group);
        let text = group.game.add.bitmapText(10, 42, "font7", AncientEmpires.LANG[page > 0 ? (86 + page) : 13], 7, group);
        text.maxWidth = group.game.width - 20;
    }

    constructor () {
        super();
    }

    openMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.notification_shown = true;
        }
    }
    closeMenu(context: InputContext) {
        if (context == InputContext.Wait) {
            this.notification_shown = false;
        }
    }

    create () {
        // this.loadMap("s0");

        this.notification_shown = false;
        this.intro = true;
        this.intro_acc = 0;
        this.intro_progress = 0;

        this.game.add.image(0, 0, "splashbg");
        this.knights = this.game.add.image(0, 26, "splashfg");

        this.title = this.game.add.image(0, 8, "splash");
        this.title.x = Math.floor((this.game.width - this.title.width) / 2);
        this.title.visible = false;

        this.title_mask = this.game.add.graphics(this.title.x, this.title.y);
        this.title.mask = this.title_mask;

        let frame_group = this.game.add.group();
        this.frame_manager = new FrameManager(frame_group);

        this.keys = new Input(this.game.input);

    }

    update() {

        if (!this.intro) {

            this.keys.update();
            this.frame_manager.update(1);

            if (this.notification_shown) {
                return;
            }

            if (this.keys.isKeyPressed(Key.Up)) {
                this.keys.clearKeyPressed(Key.Up);
                if (!!this.menu_select) {
                    this.menu_select.prev();
                } else {
                    this.main.prev();
                }
            }else if (this.keys.isKeyPressed(Key.Down)) {
                this.keys.clearKeyPressed(Key.Down);
                if (!!this.menu_select) {
                    this.menu_select.next();
                } else {
                    this.main.next();
                }
            }else if (this.keys.isKeyPressed(Key.Enter)) {
                this.keys.clearKeyPressed(Key.Enter);
                if (!!this.active_about) {
                    this.active_about.destroy(true);
                    this.active_about = null;
                } else if (!!this.active_instructions) {
                    let next = this.active_instruction_nr + 1;
                    if (next <= 17) {
                        this.active_instruction_nr = next;
                        MainMenu.showInstructions(this.active_instructions, this.active_instruction_nr);
                    }
                } else if (!!this.menu_select) {
                    this.selectChoice(this.menu_select.selected);
                } else {
                    let action = this.main.getSelected();
                    this.executeAction(action);
                }
            }else if (this.keys.isKeyPressed(Key.Esc)) {
                if (!!this.active_about) {
                    this.active_about.destroy(true);
                    this.active_about = null;
                } else if (!!this.active_instructions) {
                    this.active_instructions.destroy(true);
                    this.active_instructions = null;
                } else if (!!this.menu_select) {
                    this.menu_select.hide(false, true);
                    this.menu_select = null;
                    this.main.show(true, 72);
                }
            }else if (this.keys.isKeyPressed(Key.Right)) {
                this.keys.clearKeyPressed(Key.Right);
                if (!!this.active_instructions) {
                    let next = this.active_instruction_nr + 1;
                    if (next <= 17) {
                        this.active_instruction_nr = next;
                        MainMenu.showInstructions(this.active_instructions, this.active_instruction_nr);
                    }
                }
            }else if (this.keys.isKeyPressed(Key.Left)) {
                this.keys.clearKeyPressed(Key.Left);
                if (!!this.active_instructions) {
                    let prev = this.active_instruction_nr - 1;
                    if (prev >= 0) {
                        this.active_instruction_nr = prev;
                        MainMenu.showInstructions(this.active_instructions, this.active_instruction_nr );
                    }
                }
            }

            return;
        }

        this.intro_acc++;
        if (this.intro_acc < 2) {
            return;
        }
        this.intro_acc = 0;
        this.intro_progress++;

        if (this.intro_progress <= 30) {
            this.knights.y = 26 - this.intro_progress;
        } else if (this.intro_progress <= 60) {
            this.title.visible = true;
            this.title_mask.clear();
            this.title_mask.beginFill();
            MainMenu.drawTransition(Math.ceil((this.intro_progress - 30) / 2), 15, this.title_mask, this.title.width, this.title.height);
            this.title_mask.endFill();
        } else {
            this.title_mask.clear();
            this.main = new MenuOptions(this.frame_manager.group, Direction.None, MenuOptions.getMainMenuOptions(false), this, Direction.Up);
            this.frame_manager.addFrame(this.main);
            this.main.show(true, 72);
            this.intro = false;
        }
    }

    showMessage(text: string) {
        let menu = new Notification(this.frame_manager.group, text, this);
        this.frame_manager.addFrame(menu);
        menu.show(true);
    }

    executeAction(action: Action) {
        switch (action) {
            case Action.LOAD_GAME:
                if (MainMenu.loadGame(this.game)) {
                    this.main.hide(false);
                } else {
                    this.showMessage(AncientEmpires.LANG[43]);
                }
                break;
            case Action.NEW_GAME:
                this.main.hide(false);
                MainMenu.startGame(this.game, false, 0);
                break;
            case Action.SELECT_LEVEL:
                let maps: string[] = [];
                for (let i = 0; i < 7; i++) {
                    maps.push(AncientEmpires.LANG[49 + i]);
                }
                this.main.hide(false);
                this.active_select = ActiveMenuType.CampaignMaps;
                this.menu_select = new MenuSelect(maps, this.frame_manager.group, this, Direction.None, Direction.Up);
                this.frame_manager.addFrame(this.menu_select);
                this.menu_select.show(true, 72);
                break;
            case Action.SKIRMISH:
                this.main.hide(false);
                this.active_select = ActiveMenuType.SkirmishMaps;
                this.menu_select = new MenuSelect(["Island Cross", "Rocky Bay"], this.frame_manager.group, this, Direction.None, Direction.Up);
                this.frame_manager.addFrame(this.menu_select);
                this.menu_select.show(true, 72);
                break;
            case Action.ABOUT:
                this.active_about = MainMenu.showAbout(this.game);
                break;
            case Action.INSTRUCTIONS:
                this.active_instructions = this.game.add.group();
                this.active_instruction_nr = 0;
                MainMenu.showInstructions(this.active_instructions);
                break;
        }
    }

    selectChoice(choice: number) {
        this.menu_select.hide(false, true);
        this.menu_select = null;

        switch (this.active_select) {
            case ActiveMenuType.CampaignMaps:
                MainMenu.startGame(this.game, true, choice);
                break;
            case ActiveMenuType.SkirmishMaps:
                this.active_skirmish = choice;
                this.active_select = ActiveMenuType.SkirmishPlayers;
                this.menu_select = new MenuSelect(["1 PLAYER", "2 PLAYER", "AI ONLY"], this.frame_manager.group, this, Direction.None, Direction.Up);
                this.frame_manager.addFrame(this.menu_select);
                this.menu_select.show(true, 72);
                break;
            case ActiveMenuType.SkirmishPlayers:
                let players: boolean[] = [choice != 2, choice == 1];
                MainMenu.startGame(this.game, false, this.active_skirmish, players);
                break;
        }
    }
}
