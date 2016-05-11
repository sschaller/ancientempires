enum Key {
    None = 0,
    Up = 1,
    Right = 2,
    Down = 4,
    Left = 8,
    Enter = 16,
    Esc = 32
};
class Input {
    public all_keys: Key;

    private key_up: Phaser.Key;
    private key_right: Phaser.Key;
    private key_down: Phaser.Key;
    private key_left: Phaser.Key;
    private key_enter: Phaser.Key;
    private key_esc: Phaser.Key;

    private last_keys: Key;

    constructor(input: Phaser.Input) {

        this.all_keys = Key.None;

        this.key_up = input.keyboard.addKey(Phaser.Keyboard.UP);
        this.key_down = input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.key_right = input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.key_left = input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.key_enter = input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.key_esc = input.keyboard.addKey(Phaser.Keyboard.ESC);
    }

    isKeyPressed(key: Key) {
        return (this.all_keys & key) != 0;
    }
    clearKeyPressed(key: Key) {
        this.all_keys &= ~key;
    }

    update() {
        let current_keys: Key = Key.None;
        current_keys |= this.updateKey(Key.Up, this.key_up.isDown);
        current_keys |= this.updateKey(Key.Right, this.key_right.isDown);
        current_keys |= this.updateKey(Key.Down, this.key_down.isDown);
        current_keys |= this.updateKey(Key.Left, this.key_left.isDown);
        current_keys |= this.updateKey(Key.Enter, this.key_enter.isDown);
        current_keys |= this.updateKey(Key.Esc, this.key_esc.isDown);
        this.last_keys = current_keys;
    }
    private setKey(key: Key, yes: boolean) {
        this.all_keys ^= (-yes ^ this.all_keys) & key;
    }
    private wasKeyPressed(key: Key) {
        return (this.last_keys & key) != 0;
    }
    private updateKey(key: Key, is_down: boolean): Key {
        if (is_down != this.wasKeyPressed(key)) {
            this.setKey(key, is_down);
        }
        return is_down ? key : 0;
    }
}
