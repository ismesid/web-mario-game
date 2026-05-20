const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property
    moveSpeed: number = 180;

    @property
    jumpSpeed: number = 520;

    private body: cc.RigidBody = null;
    private movingLeft = false;
    private movingRight = false;
    private jumpQueued = false;
    private groundContacts = 0;
    private facingRight = true;
    private sprite: cc.Sprite = null;
    private marioAtlas: cc.SpriteAtlas = null;
    private walkTimer = 0;
    private isLevelReady = false;
    private spawnPosition: cc.Vec2 = null;

    onLoad() {
        this.setupPhysics();
        this.loadMarioFrames();
        this.spawnPosition = cc.v2(this.node.x, this.node.y);
        this.node.opacity = 0;

        this.body = this.getComponent(cc.RigidBody);

        if (this.body) {
            this.node.setPosition(this.spawnPosition);
            this.body.enabled = false;
            this.body.fixedRotation = true;
            this.body.enabledContactListener = true;
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
        }

        this.sprite = this.getComponent(cc.Sprite);

        cc.systemEvent.on('level-intro-start', this.lockPlayer, this);
        cc.systemEvent.on('level-ready', this.onLevelReady, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        cc.systemEvent.off('level-intro-start', this.lockPlayer, this);
        cc.systemEvent.off('level-ready', this.onLevelReady, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    update() {
        if (!this.body || !this.isLevelReady) {
            return;
        }

        const velocity = this.body.linearVelocity;
        let velocityX = 0;

        if (this.movingLeft) {
            velocityX -= this.moveSpeed;
        }
        if (this.movingRight) {
            velocityX += this.moveSpeed;
        }

        if (velocityX !== 0) {
            this.facingRight = velocityX > 0;
            const scale = Math.abs(this.node.scaleX);
            this.node.scaleX = this.facingRight ? scale : -scale;
        }

        let velocityY = velocity.y;
        if (this.jumpQueued && this.isGrounded()) {
            velocityY = this.jumpSpeed;
        }
        this.jumpQueued = false;

        this.body.linearVelocity = cc.v2(velocityX, velocityY);
        this.updateMarioFrame(velocityX, velocityY);
    }

    private lockPlayer() {
        this.isLevelReady = false;
        if (!this.body) {
            return;
        }

        this.node.setPosition(this.spawnPosition);
        this.node.opacity = 0;
        this.body.linearVelocity = cc.v2(0, 0);
        this.body.angularVelocity = 0;
        this.body.enabled = false;
    }

    private onLevelReady() {
        this.isLevelReady = true;

        if (this.body) {
            this.node.setPosition(this.spawnPosition);
            this.node.opacity = 255;
            this.body.enabled = true;
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
            this.body.syncPosition(true);
        }
    }

    private setupPhysics() {
        const physics = cc.director.getPhysicsManager();
        physics.enabled = true;
        physics.gravity = cc.v2(0, -1000);
    }

    private loadMarioFrames() {
        cc.loader.loadRes('player/mario_small', cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(this.node)) {
                return;
            }
            this.marioAtlas = atlas;
            this.setMarioFrame('mario_small_18.png');
        });
    }

    private updateMarioFrame(velocityX: number, velocityY: number) {
        if (!this.marioAtlas || !this.sprite) {
            return;
        }

        if (Math.abs(velocityY) > 20 && !this.isGrounded()) {
            this.setMarioFrame('mario_small_7.png');
            return;
        }

        if (Math.abs(velocityX) < 1) {
            this.walkTimer = 0;
            this.setMarioFrame('mario_small_18.png');
            return;
        }

        this.walkTimer += cc.director.getDeltaTime();
        const frames = ['mario_small_18.png', 'mario_small_22.png', 'mario_small_25.png', 'mario_small_4.png'];
        const frameIndex = Math.floor(this.walkTimer * 12) % frames.length;
        this.setMarioFrame(frames[frameIndex]);
    }

    private setMarioFrame(name: string) {
        if (!this.marioAtlas || !this.sprite) {
            return;
        }

        const frame = this.marioAtlas.getSpriteFrame(name) || this.marioAtlas.getSpriteFrame(name.replace('.png', ''));
        if (frame) {
            this.sprite.spriteFrame = frame;
        }
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isStandingOn(otherCollider)) {
            this.groundContacts += 1;
        }
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isStandingOn(otherCollider)) {
            this.groundContacts = Math.max(0, this.groundContacts - 1);
        }
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.movingLeft = true;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.movingRight = true;
                break;
            case cc.macro.KEY.w:
            case cc.macro.KEY.space:
                this.jumpQueued = true;
                break;
        }
    }

    private onKeyUp(event: cc.Event.EventKeyboard) {
        switch (event.keyCode) {
            case cc.macro.KEY.a:
            case cc.macro.KEY.left:
                this.movingLeft = false;
                break;
            case cc.macro.KEY.d:
            case cc.macro.KEY.right:
                this.movingRight = false;
                break;
        }
    }

    private isGrounded() {
        return this.groundContacts > 0;
    }

    private isStandingOn(otherCollider: cc.Collider) {
        const otherNode = otherCollider.node;
        return otherNode && otherNode !== this.node && this.node.y >= otherNode.y;
    }
}
