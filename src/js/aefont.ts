enum AEFontStyle {
    Bold,
    Large
}
class AEFont {
    x: number;
    y: number;
    text: string;
    group: Phaser.Group;
    letters: Phaser.Image[];
    private style: AEFontStyle;

    static getWidth(style: AEFontStyle, length: number) {
        if (style == AEFontStyle.Bold) {
            return 7 * length;
        }
        return 10 * length;
    }
    static getFontIndex(style: AEFontStyle, char: number): number {

        if (style == AEFontStyle.Large) {
            // large font
            if (char >= 48 && char <= 57) {
                return char - 48;
            }
            console.log("Don't recognize char code " + char + " for font large");
            return 0;
        }

        // bold font

        if (char >= 65 && char < 90) { // capital letters without Z
            return char - 65;
        }else if (char >= 49 && char <= 57) { // all numbers without 0
            return char - 49 + 27;
        }else if (char == 48) { // 0
            return 14; // return O
        }else if (char == 45) { // -
            return 25;
        }else if (char == 43) { // +
            return 26;
        }else {
            console.log("Don't recognize char code " + char + " for font bold");
            return 0;
        }
    }
    constructor(x: number, y: number, group: Phaser.Group, style: AEFontStyle, text?: string) {
        this.x = x;
        this.y = y;
        this.style = style;
        this.text = text || "";
        this.group = group;
        this.letters = [];
        this.draw();
    }
    setText(text: string) {
        this.text = text;
        this.draw();
    }
    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;

        for (let letter of this.letters) {
            letter.x = x;
            letter.y = y;
            x += letter.width;
        }

    }
    setVisibility(visible: boolean) {
        for (let letter of this.letters) {
            letter.visible = visible;
        }
    }
    private draw() {
        let l: Phaser.Image[] = [];
        let x = this.x;
        for (let i = 0; i < this.text.length; i++) {
            let char = this.text.charCodeAt(i);
            let index = AEFont.getFontIndex(this.style, char);

            if (index < 0) {
                x += AEFont.getWidth(this.style, 1);
                continue;
            }

            let font_name: string;
            if (this.style == AEFontStyle.Bold) {
                font_name = "chars";
            } else if (this.style == AEFontStyle.Large) {
                font_name = "lchars";
            }

            let image: Phaser.Image;
            if (this.letters.length > 0) {
                image = this.letters.shift();
            }else {
                image = AncientEmpires.game.add.image(x, this.y, font_name, null, this.group);
            }
            image.frame = index;
            l.push(image);
            x += image.width;
        }
        while (this.letters.length > 0) {
            let letter = this.letters.shift();
            letter.destroy();
        }
        this.letters = l;
    }
}
