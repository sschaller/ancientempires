class PNGWaiter {

    awaiting: boolean;
    counter: number;
    callback: Function;
    constructor(callback: Function) {
        this.counter = 0;
        this.awaiting = false;

        this.callback = callback;

    }
    await() {
        this.awaiting = true;
        if (this.counter <= 0) {
            // if img.onload is synchronous
            this.callback();
        }
    }
    add() {
        this.counter++;
    }
    ret = () => {
        this.counter--;
        if (this.counter > 0 || !this.awaiting) {
            return;
        }

        this.callback();

    };
}
class PNGLoader {
    static bufferToBase64(buf: Uint8Array) {
        let binstr = Array.prototype.map.call(buf, function (ch: number) {
            return String.fromCharCode(ch);
        }).join("");
        return btoa(binstr);
    }

    static loadSpriteSheet(waiter: PNGWaiter, name: string, tile_width?: number, tile_height?: number, number_of_tiles?: number, variation?: number) {

        let spritesheet_name = name;

        if (typeof tile_width == "undefined" || typeof tile_height == "undefined" || typeof number_of_tiles == "undefined") {
            let buffer: ArrayBuffer = AncientEmpires.game.cache.getBinary(name + ".sprite");
            let data: DataView = new DataView(buffer);
            let index = 0;

            if (typeof number_of_tiles == "undefined") { number_of_tiles = data.getUint8(index++); }
            if (typeof tile_width == "undefined") { tile_width = data.getUint8(index++); }
            if (typeof tile_height == "undefined") { tile_height = data.getUint8(index++); }
        }

        if (AncientEmpires.game.cache.checkBinaryKey(name + ".png")) {
            // all tiles are in one file
            let png_buffer: ArrayBuffer = AncientEmpires.game.cache.getBinary(name + ".png");
            if (typeof variation != "undefined") {
                png_buffer = PNGLoader.createVariation(png_buffer, variation);
                spritesheet_name += "_" + variation;
            }

            let img = new Image();

            waiter.add();
            img.onload = () => {
                AncientEmpires.game.cache.addSpriteSheet(spritesheet_name, null, img, tile_width, tile_height);
                waiter.ret();
            };
            img.src = "data:image/png;base64," + PNGLoader.bufferToBase64(new Uint8Array(png_buffer));

        } else {
            // tiles are in multiple files with names name_00.png, name_01.png, ...

            waiter.add();
            let inner_waiter = new PNGWaiter(waiter.ret);

            let square = Math.ceil(Math.sqrt(number_of_tiles));
            let spritesheet = AncientEmpires.game.add.bitmapData(square * tile_width, square * tile_height);
            for (let i = 0; i < number_of_tiles; i++) {
                let idx: string = i < 10 ? ("_0" + i) : ("_" + i);
                let png_buffer: ArrayBuffer = AncientEmpires.game.cache.getBinary(name + idx + ".png");
                if (typeof variation != "undefined") {
                    png_buffer = PNGLoader.createVariation(png_buffer, variation);
                    spritesheet_name += "_" + variation;
                }
                let img = new Image();
                inner_waiter.add();
                img.onload = () => {
                    spritesheet.ctx.drawImage(img, (i % square) * tile_width, Math.floor(i / square) * tile_height);
                    inner_waiter.ret();
                };
                img.src = "data:image/png;base64," + PNGLoader.bufferToBase64(new Uint8Array(png_buffer));


            }

            inner_waiter.await();

            AncientEmpires.game.cache.addSpriteSheet(spritesheet_name, null, spritesheet.canvas, tile_width, tile_height, number_of_tiles);

        }
    }

    static createVariation(buffer: ArrayBuffer, variation: number): ArrayBuffer {
        buffer = buffer.slice(0); // copy buffer (otherwise we modify original data, same as in cache)
        let data = new DataView(buffer);

        let index = 0;
        let start_plte = 0;

        for (; index < data.byteLength - 3; index++) {
            if (data.getUint8(index) != 80 || data.getUint8(index + 1) != 76 || data.getUint8(index + 2) != 84) { continue; }
            start_plte = index - 4;
            break;
        }
        index = start_plte;

        let length_plte = data.getUint32(index);

        index += 4;
        let crc = -1; // 32 bit
        for (let i = 0; i < 4; i++) {
            crc = PNGLoader.updatePNGCRC(data.getUint8(index + i), crc);
        }

        index += 4;
        for (let i = index; i < index + length_plte; i += 3) {
            let red: number = data.getUint8(i);
            let green: number = data.getUint8(i + 1);
            let blue: number = data.getUint8(i + 2);

            if (blue > red && blue > green) {
                // blue color
                if (variation == 1) {
                    // change to red color
                    let tmp = red;
                    red = blue;
                    blue = tmp;
                    green /= 2;
                }else if (variation == 2) {
                    // decolorize
                    red = blue;
                    green = blue;
                }
                data.setUint8(i, red);
                data.setUint8(i + 1, green);
                data.setUint8(i + 2, blue);
            }

            crc = PNGLoader.updatePNGCRC(data.getUint8(i), crc);
            crc = PNGLoader.updatePNGCRC(data.getUint8(i + 1), crc);
            crc = PNGLoader.updatePNGCRC(data.getUint8(i + 2), crc);

        }

        // update crc field
        crc ^= -1;
        let index_crc = start_plte + 8 + length_plte;
        data.setUint32(index_crc, crc);

        return buffer;
    }
    static updatePNGCRC(value: number, crc: number): number {
        crc ^= value & 255; // bitwise or (without and)
        for (let j = 0; j < 8; j++) {
            if ((crc & 1) != 0) {
                crc = crc >>> 1 ^ -306674912;
                continue;
            }
            crc >>>= 1;
        }
        return crc;
    }
}
