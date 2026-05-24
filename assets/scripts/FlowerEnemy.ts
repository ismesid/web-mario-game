const { ccclass } = cc._decorator;

type FlowerState = 'hidden' | 'playing' | 'cooldown';

@ccclass
export default class FlowerEnemy extends cc.Component {
    private player: cc.Node = null;
    private frames: cc.SpriteFrame[] = [];
    private sprite: cc.Sprite = null;
    private collider: cc.PhysicsBoxCollider = null;
    private state: FlowerState = 'hidden';
    private hiddenY = 0;
    private visibleY = 0;
    private detectRangeX = 96;
    private detectRangeY = 64;
    private emergeDuration = 0.35;
    private mouthFps = 8;
    private mouthCycles = 2;
    private retractDuration = 0.35;
    private cooldownDuration = 1;
    private cooldownTimer = 0;
    private mouthAnimating = false;
    private mouthTimer = 0;

    setup(
        player: cc.Node,
        frames: cc.SpriteFrame[],
        hiddenY: number,
        visibleY: number,
        detectRangeX: number,
        detectRangeY: number,
        emergeDuration: number,
        mouthFps: number,
        mouthCycles: number,
        retractDuration: number,
        cooldownDuration: number
    ) {
        this.player = player;
        this.frames = frames || [];
        this.hiddenY = hiddenY;
        this.visibleY = visibleY;
        this.detectRangeX = detectRangeX;
        this.detectRangeY = detectRangeY;
        this.emergeDuration = emergeDuration;
        this.mouthFps = mouthFps;
        this.mouthCycles = mouthCycles;
        this.retractDuration = retractDuration;
        this.cooldownDuration = cooldownDuration;

        this.sprite = this.getComponent(cc.Sprite);
        this.collider = this.getComponent(cc.PhysicsBoxCollider);
        if (this.sprite && this.frames.length > 0) {
            this.sprite.spriteFrame = this.frames[0];
        }
        if (this.collider) {
            this.collider.enabled = false;
        }

        this.node.y = this.hiddenY;
    }

    update(dt: number) {
        this.updateMouthAnimation(dt);

        if (this.state === 'cooldown') {
            this.cooldownTimer -= dt;
            if (this.cooldownTimer <= 0) {
                this.state = 'hidden';
            }
            return;
        }

        if (this.state !== 'hidden' || !this.player || !cc.isValid(this.player)) {
            return;
        }

        const playerWorld = this.player.convertToWorldSpaceAR(cc.v2(0, 0));
        const flowerWorld = this.node.parent
            ? this.node.parent.convertToWorldSpaceAR(cc.v2(this.node.x, this.visibleY))
            : this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const dx = Math.abs(playerWorld.x - flowerWorld.x);
        const dy = Math.abs(playerWorld.y - flowerWorld.y);
        if (dx <= this.detectRangeX && dy <= this.detectRangeY) {
            this.playAttackSequence();
        }
    }

    private playAttackSequence() {
        if (this.state !== 'hidden') {
            return;
        }

        this.state = 'playing';
        this.setColliderEnabled(true);
        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.moveTo(this.emergeDuration, this.node.x, this.visibleY).easing(cc.easeSineOut()),
            cc.callFunc(() => this.playMouthAnimation()),
            cc.delayTime(this.getMouthDuration()),
            cc.callFunc(() => this.stopMouthAnimation()),
            cc.moveTo(this.retractDuration, this.node.x, this.hiddenY).easing(cc.easeSineIn()),
            cc.callFunc(() => {
                this.setColliderEnabled(false);
                this.state = 'cooldown';
                this.cooldownTimer = this.cooldownDuration;
            })
        ));
    }

    private playMouthAnimation() {
        if (!this.sprite || this.frames.length === 0) {
            return;
        }

        this.mouthAnimating = true;
        this.mouthTimer = 0;
        this.sprite.spriteFrame = this.frames[0];
    }

    private stopMouthAnimation() {
        if (!this.sprite || this.frames.length === 0) {
            return;
        }

        this.mouthAnimating = false;
        this.mouthTimer = 0;
        this.sprite.spriteFrame = this.frames[0];
    }

    private updateMouthAnimation(dt: number) {
        if (!this.mouthAnimating || !this.sprite || this.frames.length === 0) {
            return;
        }

        this.mouthTimer += dt;
        const interval = 1 / Math.max(1, this.mouthFps);
        const frameIndex = Math.floor(this.mouthTimer / interval) % this.frames.length;
        this.sprite.spriteFrame = this.frames[frameIndex];
    }

    private getMouthDuration() {
        return Math.max(1, this.mouthCycles * this.frames.length) / Math.max(1, this.mouthFps);
    }

    private setColliderEnabled(enabled: boolean) {
        if (!this.collider) {
            return;
        }

        this.collider.enabled = enabled;
        this.collider.apply();
    }

}
