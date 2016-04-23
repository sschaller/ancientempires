class AEFont {
    x: number;
    y: number;
    text: string;
    group: Phaser.Group;
    letters: Phaser.Image[];
    static getFontIndex(char: number): number {
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
            console.log("Don't recognize char code " + char);
            return 0;
        }
    }
    constructor(x: number, y: number, text: string, group: Phaser.Group) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.group = group;
        this.letters = [];
        this.draw();
    }
    draw() {
        let l: Phaser.Image[] = [];
        let x = this.x;
        for (let i = 0; i < this.text.length; i++) {
            let char = this.text.charCodeAt(i);
            let index = AEFont.getFontIndex(char);

            let image: Phaser.Image;
            if (this.letters.length > 0) {
                image = this.letters.shift();
            }else {
                image = AncientEmpires.game.add.image(x, this.y, "");
            }


        }
    }
}
