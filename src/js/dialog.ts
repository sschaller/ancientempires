interface FrameData {
    frame: Frame;
    content: FrameContent[];
}
interface FrameContent {
    name: string;
    object: any; // Sprite or BitmapText
}

class Dialog {

    static game: Phaser.Game;

    static frameMoney: FrameData;

    static showMoney(alliance: Alliance, gold: number) {

        let goldIcon: Phaser.Image;
        let goldAmount: Phaser.BitmapText;

        if (!Dialog.frameMoney) {

            let frame = Frame.add(64, 40, Direction.Up | Direction.Right, Direction.Down | Direction.Left, Direction.Right);
            let contentGroup = frame.getContentGroup();
            let content: FrameContent[] = [];

            goldIcon = Dialog.game.add.sprite(0, 0, "sprites", null, contentGroup);
            goldIcon.frameName = "gold";
            content.push({name: "icon", object: goldIcon});

            goldAmount = Dialog.game.add.bitmapText(35, 5, "aefont", null, null, contentGroup);

            Dialog.frameMoney = {frame: frame, content: content};
        } else {
            goldIcon = Dialog.getObjectFromFrameData("icon", Dialog.frameMoney);
            goldAmount = Dialog.getObjectFromFrameData("amount", Dialog.frameMoney);
        }

        goldAmount.text = gold.toString();

    }
    static getObjectFromFrameData(name: string, data: FrameData) {
        for (let obj of data.content) {
            if (obj.name == name) {
                return obj.object;
            }
        }
        return null;
    }

}
