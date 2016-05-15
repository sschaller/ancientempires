interface DataEntry {
    name: string;
    size: number;
}

class Loader extends Phaser.State {

    constructor() {
        super();
    }

    preload() {
        this.game.load.bitmapFont("font7", "data/font.png", "data/font.xml");
        this.game.load.binary("data", "data/1.pak", function(key: string, data: any): Uint8Array {
            return new Uint8Array(data);
        });
        this.game.load.binary("lang", "data/lang.dat", function(key: string, data: any): Uint8Array {
            return new Uint8Array(data);
        });
    }

    create() {
        this.unpackResourceData();
        this.loadEntityData();
        this.loadMapTilesProp();
        this.unpackLangData();

        let waiter = new PNGWaiter(() => {
            this.game.state.start("MainMenu", false, false, name);
        });

        PNGLoader.loadSpriteSheet(waiter, "tiles0", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 0);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 1);
        PNGLoader.loadSpriteSheet(waiter, "buildings", 24, 24, 3, 2);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons", 24, 24, 0, 1);
        PNGLoader.loadSpriteSheet(waiter, "unit_icons", 24, 24, 0, 2);
        PNGLoader.loadSpriteSheet(waiter, "cursor", 26, 26);
        PNGLoader.loadSpriteSheet(waiter, "b_smoke");
        PNGLoader.loadSpriteSheet(waiter, "menu");
        PNGLoader.loadSpriteSheet(waiter, "portrait");
        PNGLoader.loadSpriteSheet(waiter, "chars");
        PNGLoader.loadImage(waiter, "gold");
        PNGLoader.loadImage(waiter, "pointer");
        PNGLoader.loadSpriteSheet(waiter, "redspark");
        PNGLoader.loadSpriteSheet(waiter, "spark");
        PNGLoader.loadSpriteSheet(waiter, "smoke");



        PNGLoader.loadSpriteSheet(waiter, "road", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "grass", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "mountain", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "water", 24, 24);
        PNGLoader.loadSpriteSheet(waiter, "town", 24, 24);
        PNGLoader.loadImage(waiter, "woods_bg");
        PNGLoader.loadImage(waiter, "hill_bg");
        PNGLoader.loadImage(waiter, "mountain_bg");
        PNGLoader.loadImage(waiter, "bridge_bg");
        PNGLoader.loadImage(waiter, "town_bg");
        PNGLoader.loadImage(waiter, "tombstone");

        waiter.await();


    }

    private unpackResourceData() {
        let array: Uint8Array = this.game.cache.getBinary("data");
        let data = new DataView(array.buffer);

        let index = 2; // does not seem important
        let number_of_entries = data.getUint16(index);
        index += 2;

        let entries: DataEntry[] = [];

        for (let i = 0; i < number_of_entries; i++) {
            let str_len = data.getUint16(index);
            index += 2;
            let name = "";
            for (let j = 0; j < str_len; j++) {
                name += String.fromCharCode(data.getUint8(index++));
            }
            index += 4; // does not seem important
            let size = data.getUint16(index);
            index += 2;
            entries.push({name: name, size: size});
        }

        for (let entry of entries) {
            let entry_data: ArrayBuffer = array.buffer.slice(index, index + entry.size);
            this.game.cache.addBinary(entry.name, entry_data);
            index += entry.size;
        }
    }
    private loadEntityData() {
        let buffer: ArrayBuffer = this.game.cache.getBinary("units.bin");

        let data: DataView = new DataView(buffer);
        let index = 0;

        AncientEmpires.ENTITIES = [];
        let names = ["Soldier", "Archer", "Lizard", "Wizard", "Wisp", "Spider", "Golem", "Catapult", "Wyvern", "King", "Skeleton"];

        for (let i = 0; i < names.length; i++) {
            let entity: EntityData = {
                name: names[i],
                mov: data.getUint8(index++),
                atk: data.getUint8(index++),
                def: data.getUint8(index++),
                max: data.getUint8(index++),
                min: data.getUint8(index++),
                cost: data.getUint16(index),
                battle_positions: [],
                flags: EntityFlags.None
            };
            index += 2;

            let number_pos = data.getUint8(index++);
            for (let j = 0; j < number_pos; j++) {
                entity.battle_positions.push({x: data.getUint8(index++), y: data.getUint8(index++)});
            }
            let number_flags = data.getUint8(index++);
            for (let j = 0; j < number_flags; j++) {
                entity.flags |= 1 << data.getUint8(index++);
            }
            AncientEmpires.ENTITIES.push(entity);
        }
    }
    private loadMapTilesProp() {
        let buffer: ArrayBuffer = this.game.cache.getBinary("tiles0.prop");
        let data: DataView = new DataView(buffer);
        let index = 0;

        let length = data.getUint16(index);
        index += 4; // 2 are unrelevant

        AncientEmpires.TILES_PROP = [];
        for (let i = 0; i < length; i++) {
            AncientEmpires.TILES_PROP.push(<Tile> data.getUint8(index++));
        }

    }
    private unpackLangData() {
        let array: Uint8Array = this.game.cache.getBinary("lang");
        let data: DataView = new DataView(array.buffer);

        let index = 0;

        let number = data.getUint32(index);
        index += 4;

        AncientEmpires.LANG = [];

        for (let i = 0; i < number; i++){
            let len = data.getUint16(index);
            index += 2;

            let text = "";
            for (let j = 0; j < len; j++) {
                text += String.fromCharCode(data.getUint8(index++));
            }
            AncientEmpires.LANG.push(text);
        }

    }
}
