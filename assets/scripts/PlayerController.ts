const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property
    moveSpeed: number = 180;

    @property
    jumpSpeed: number = 520;

    @property
    climbSpeed: number = 120;

    @property
    mapNodePath: string = 'Canvas/World/Map/mario map';

    @property
    startObjectGroupName: string = 'start point';

    @property
    marioAtlasPath: string = 'player/mario_grouped_small';

    @property
    vineColliderTag: number = 1001;

    @property
    autoSetColliderSize: boolean = true;

    @property
    autoStartDelay: number = 0.2;

    @property
    forceDynamicBody: boolean = true;

    @property
    jumpAnimationLockTime: number = 0.25;

    @property
    climbThroughPlatformBottoms: boolean = true;

    @property
    colliderWidth: number = 18;

    @property
    colliderHeight: number = 18;

    private body: cc.RigidBody = null;
    private movingLeft = false;
    private movingRight = false;
    private movingUp = false;
    private movingDown = false;
    private jumpHeld = false;
    private jumpQueued = false;
    private jumpAnimationTimer = 0;
    private jumpStartedWithForwardSpeed = false;
    private groundColliders: cc.Collider[] = [];
    private vineColliders: cc.Collider[] = [];
    private climbPassThroughColliders: cc.Collider[] = [];
    private facingRight = true;
    private sprite: cc.Sprite = null;
    private marioAtlas: cc.SpriteAtlas = null;
    private animationTimer = 0;
    private currentAnimationKey = '';
    private isLevelReady = true;
    private isClimbing = false;
    private spawnPosition: cc.Vec2 = null;
    private defaultGravityScale = 1;
    private readonly groundCheckTolerance = 8;
    private readonly climbThroughNormalY = 0.35;
    private readonly climbExitClearance = 2;

    private readonly idleFrames = ['idle_0.png'];
    private readonly walkFrames = ['walk_0.png', 'walk_1.png', 'walk_2.png', 'walk_3.png'];
    private readonly jumpForwardFrames = ['jump_forward_0.png', 'jump_forward_1.png', 'jump_forward_2.png', 'jump_forward_3.png'];
    private readonly jumpUpFrames = ['jump_up_0.png', 'jump_up_1.png', 'jump_up_2.png', 'jump_up_3.png'];
    private readonly climbFrames = ['climb_0.png', 'climb_1.png', 'climb_2.png'];

    onLoad() {
        this.setupPhysics();
        this.loadMarioFrames();
        this.spawnPosition = this.getSpawnPositionFromTileMap() || cc.v2(this.node.x, this.node.y);
        this.ensurePlayerRendersAboveMap();
        this.configureSpriteSize();
        this.node.opacity = 255;

        this.body = this.getComponent(cc.RigidBody);
        this.sprite = this.getComponent(cc.Sprite);

        if (this.body) {
            if (this.forceDynamicBody) {
                this.body.type = cc.RigidBodyType.Dynamic;
            }
            this.defaultGravityScale = this.body.gravityScale;
            this.node.setPosition(this.spawnPosition);
            this.body.enabled = true;
            this.body.fixedRotation = true;
            this.body.enabledContactListener = true;
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
        }

        this.configureCollider();

        cc.systemEvent.on('level-intro-start', this.lockPlayer, this);
        cc.systemEvent.on('level-ready', this.onLevelReady, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        if (this.autoStartDelay >= 0) {
            this.scheduleOnce(() => {
                if (!this.isLevelReady) {
                    this.onLevelReady();
                }
            }, this.autoStartDelay);
        }
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

        if (this.jumpAnimationTimer > 0) {
            this.jumpAnimationTimer = Math.max(0, this.jumpAnimationTimer - cc.director.getDeltaTime());
        }

        if (this.canClimb() && (this.movingUp || this.movingDown)) {
            this.startClimbing();
        }

        if (this.isClimbing) {
            this.updateClimbing();
            return;
        }

        this.updateNormalMovement();
    }

    private updateNormalMovement() {
        const velocity = this.body.linearVelocity;
        const velocityX = this.getInputVelocityX(this.moveSpeed);
        let velocityY = velocity.y;

        this.applyFacing(velocityX);

        if (this.jumpQueued && this.isGrounded()) {
            velocityY = this.jumpSpeed;
            this.jumpAnimationTimer = this.jumpAnimationLockTime;
            this.jumpStartedWithForwardSpeed = Math.abs(velocityX) > 20 || this.movingLeft || this.movingRight;
        }
        this.jumpQueued = false;

        this.body.linearVelocity = cc.v2(velocityX, velocityY);
        this.updateMarioFrame(velocityX, velocityY);
    }

    private updateClimbing() {
        if (!this.canClimb()) {
            this.stopClimbing(false);
            return;
        }

        const velocityX = this.getInputVelocityX(this.moveSpeed * 0.5);
        let velocityY = 0;

        if (this.movingUp) {
            velocityY += this.climbSpeed;
        }
        if (this.movingDown) {
            velocityY -= this.climbSpeed;
        }

        this.applyFacing(velocityX);

        if (this.jumpQueued) {
            this.stopClimbing(true);
            this.jumpQueued = false;
            this.jumpAnimationTimer = this.jumpAnimationLockTime;
            this.jumpStartedWithForwardSpeed = Math.abs(velocityX) > 20 || this.movingLeft || this.movingRight;
            this.body.linearVelocity = cc.v2(velocityX, this.jumpSpeed);
            this.updateMarioFrame(velocityX, this.jumpSpeed);
            return;
        }

        this.body.linearVelocity = cc.v2(velocityX, velocityY);
        this.setAnimationFrame('climb', this.climbFrames, 8, Math.abs(velocityY) > 1);
    }

    private getInputVelocityX(speed: number) {
        let velocityX = 0;

        if (this.movingLeft) {
            velocityX -= speed;
        }
        if (this.movingRight) {
            velocityX += speed;
        }

        return velocityX;
    }

    private applyFacing(velocityX: number) {
        if (velocityX === 0) {
            return;
        }

        this.facingRight = velocityX > 0;
        const scale = Math.abs(this.node.scaleX);
        this.node.scaleX = this.facingRight ? scale : -scale;
    }

    private startClimbing() {
        if (this.isClimbing || !this.body) {
            return;
        }

        this.isClimbing = true;
        this.groundColliders = [];
        this.climbPassThroughColliders = [];
        this.body.gravityScale = 0;
        this.body.linearVelocity = cc.v2(0, 0);
    }

    private stopClimbing(keepVelocity: boolean) {
        if (!this.isClimbing || !this.body) {
            return;
        }

        this.isClimbing = false;
        this.body.gravityScale = this.defaultGravityScale;

        if (!keepVelocity) {
            this.body.linearVelocity = cc.v2(this.body.linearVelocity.x, 0);
        }
    }

    private lockPlayer() {
        this.isLevelReady = false;
        this.node.setPosition(this.spawnPosition);
        this.node.opacity = 0;
        this.groundColliders = [];
        this.vineColliders = [];
        this.climbPassThroughColliders = [];
        if (!this.body) {
            return;
        }

        this.stopClimbing(false);
        this.body.linearVelocity = cc.v2(0, 0);
        this.body.angularVelocity = 0;
        this.body.enabled = false;
    }

    private onLevelReady() {
        this.isLevelReady = true;
        this.node.setPosition(this.spawnPosition);
        this.node.opacity = 255;
        this.groundColliders = [];
        this.vineColliders = [];
        this.climbPassThroughColliders = [];

        if (this.body) {
            this.body.enabled = true;
            this.body.gravityScale = this.defaultGravityScale;
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

    private ensurePlayerRendersAboveMap() {
        this.node.zIndex = 1000;
        if (this.node.parent) {
            this.node.parent.zIndex = 1000;
        }
    }

    private configureSpriteSize() {
        this.node.setContentSize(this.colliderWidth, this.colliderHeight);
    }

    private configureCollider() {
        if (!this.autoSetColliderSize) {
            return;
        }

        const collider = this.getComponent(cc.PhysicsBoxCollider);
        if (!collider) {
            return;
        }

        collider.size = cc.size(this.colliderWidth, this.colliderHeight);
        collider.friction = 0;
        collider.apply();
    }

    private getSpawnPositionFromTileMap(): cc.Vec2 {
        const mapNode = cc.find(this.mapNodePath);
        if (!mapNode) {
            cc.warn('[PlayerController] Cannot find tile map node: ' + this.mapNodePath);
            return null;
        }

        const tileMap = mapNode.getComponent(cc.TiledMap);
        if (!tileMap) {
            cc.warn('[PlayerController] Tile map node has no cc.TiledMap component: ' + this.mapNodePath);
            return null;
        }

        const objectGroup = tileMap.getObjectGroup(this.startObjectGroupName);
        if (!objectGroup) {
            cc.warn('[PlayerController] Cannot find tile map object group: ' + this.startObjectGroupName);
            return null;
        }

        const objects = objectGroup.getObjects();
        if (!objects || objects.length === 0) {
            cc.warn('[PlayerController] Tile map object group has no objects: ' + this.startObjectGroupName);
            return null;
        }

        const startObject: any = objects[0];
        const objectX = Number(startObject.x);
        const objectY = Number(startObject.y);

        if (isNaN(objectX) || isNaN(objectY)) {
            cc.warn('[PlayerController] Start object has invalid x/y values.');
            return null;
        }

        const mapSize = tileMap.getMapSize();
        const tileSize = tileMap.getTileSize();
        const mapWidth = mapSize.width * tileSize.width;
        const mapHeight = mapSize.height * tileSize.height;
        const mapLocalPosition = cc.v2(
            objectX - mapWidth * mapNode.anchorX,
            mapHeight * (1 - mapNode.anchorY) - objectY
        );
        const worldPosition = mapNode.convertToWorldSpaceAR(mapLocalPosition);

        if (!this.node.parent) {
            return worldPosition;
        }

        return this.node.parent.convertToNodeSpaceAR(worldPosition);
    }

    private loadMarioFrames() {
        cc.loader.loadRes(this.marioAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(this.node)) {
                cc.warn('[PlayerController] Cannot load Mario atlas: ' + this.marioAtlasPath);
                return;
            }

            this.marioAtlas = atlas;
            this.setMarioFrame('idle_0.png');
            this.configureSpriteSize();
        });
    }

    private updateMarioFrame(velocityX: number, velocityY: number) {
        if (!this.marioAtlas || !this.sprite) {
            return;
        }

        if (this.jumpAnimationTimer > 0 || (Math.abs(velocityY) > 20 && !this.isGrounded())) {
            const hasForwardSpeed = this.jumpAnimationTimer > 0
                ? this.jumpStartedWithForwardSpeed
                : Math.abs(velocityX) > 20 || this.movingLeft || this.movingRight;
            this.setAnimationFrame(
                hasForwardSpeed ? 'jumpForward' : 'jumpUp',
                hasForwardSpeed ? this.jumpForwardFrames : this.jumpUpFrames,
                10,
                true
            );
            return;
        }

        if (Math.abs(velocityX) < 1) {
            this.setAnimationFrame('idle', this.idleFrames, 1, false);
            return;
        }

        this.setAnimationFrame('walk', this.walkFrames, 12, true);
    }

    private setAnimationFrame(key: string, frames: string[], fps: number, animate: boolean) {
        if (!frames || frames.length === 0) {
            return;
        }

        if (this.currentAnimationKey !== key) {
            this.currentAnimationKey = key;
            this.animationTimer = 0;
        }

        if (animate) {
            this.animationTimer += cc.director.getDeltaTime();
        }

        const frameIndex = animate ? Math.floor(this.animationTimer * fps) % frames.length : 0;
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
        if (this.isVineCollider(otherCollider)) {
            this.addUniqueCollider(this.vineColliders, otherCollider);
            return;
        }

        if (this.isStandingOn(otherCollider)) {
            this.addUniqueCollider(this.groundColliders, otherCollider);
        }
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.shouldPassThroughWhileClimbing(contact, selfCollider, otherCollider)) {
            contact.disabledOnce = true;
        }
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isVineCollider(otherCollider)) {
            this.removeCollider(this.vineColliders, otherCollider);
            if (!this.canClimb()) {
                this.stopClimbing(false);
            }
            return;
        }

        this.removeCollider(this.climbPassThroughColliders, otherCollider);
        this.removeCollider(this.groundColliders, otherCollider);
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
            case cc.macro.KEY.up:
                if (!this.movingUp) {
                    this.movingUp = true;
                    if (!this.canClimb()) {
                        this.queueJump();
                    }
                }
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.movingDown = true;
                break;
            case cc.macro.KEY.space:
                this.queueJump();
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
            case cc.macro.KEY.w:
            case cc.macro.KEY.up:
                this.movingUp = false;
                this.jumpHeld = false;
                break;
            case cc.macro.KEY.s:
            case cc.macro.KEY.down:
                this.movingDown = false;
                break;
            case cc.macro.KEY.space:
                this.jumpHeld = false;
                break;
        }
    }

    private queueJump() {
        if (this.jumpHeld) {
            return;
        }

        this.jumpHeld = true;
        this.jumpQueued = true;
    }

    private canClimb() {
        return this.vineColliders.length > 0;
    }

    private isGrounded() {
        return this.groundColliders.length > 0;
    }

    private isVineCollider(otherCollider: cc.Collider) {
        return otherCollider && otherCollider.tag === this.vineColliderTag;
    }

    private addUniqueCollider(colliders: cc.Collider[], collider: cc.Collider) {
        if (colliders.indexOf(collider) === -1) {
            colliders.push(collider);
        }
    }

    private removeCollider(colliders: cc.Collider[], collider: cc.Collider) {
        const index = colliders.indexOf(collider);
        if (index !== -1) {
            colliders.splice(index, 1);
        }
    }

    private isStandingOn(otherCollider: cc.Collider) {
        if (!otherCollider || !otherCollider.node || otherCollider.node === this.node) {
            return false;
        }

        const selfCollider = this.getComponent(cc.PhysicsBoxCollider);
        if (!selfCollider) {
            return false;
        }

        const selfRect = this.getWorldRect(selfCollider);
        const otherRect = this.getWorldRect(otherCollider);
        const overlapsX = selfRect.left < otherRect.right && selfRect.right > otherRect.left;
        const bottomNearTop = selfRect.bottom >= otherRect.top - this.groundCheckTolerance
            && selfRect.bottom <= otherRect.top + this.groundCheckTolerance;

        return overlapsX && bottomNearTop;
    }

    private shouldPassThroughWhileClimbing(
        contact: cc.PhysicsContact,
        selfCollider: cc.Collider,
        otherCollider: cc.Collider
    ) {
        if (!this.climbThroughPlatformBottoms) {
            return false;
        }

        if (this.isVineCollider(otherCollider)) {
            return false;
        }

        if (this.climbPassThroughColliders.indexOf(otherCollider) !== -1) {
            if (this.hasClearedPlatformTop(selfCollider, otherCollider)) {
                this.removeCollider(this.climbPassThroughColliders, otherCollider);
                return false;
            }

            return true;
        }

        if (!this.isClimbing || !this.movingUp) {
            return false;
        }

        const normal = contact.getWorldManifold().normal;
        const normalFromSelfToOther = contact.colliderA === selfCollider ? normal : cc.v2(-normal.x, -normal.y);

        if (normalFromSelfToOther.y > this.climbThroughNormalY) {
            this.addUniqueCollider(this.climbPassThroughColliders, otherCollider);
            return true;
        }

        const selfRect = this.getWorldRect(selfCollider);
        const otherRect = this.getWorldRect(otherCollider);
        const playerBelowOther = selfRect.top <= otherRect.top && selfRect.bottom < otherRect.bottom;

        if (playerBelowOther && selfRect.centerY < otherRect.centerY) {
            this.addUniqueCollider(this.climbPassThroughColliders, otherCollider);
            return true;
        }

        return false;
    }

    private hasClearedPlatformTop(selfCollider: cc.Collider, otherCollider: cc.Collider) {
        const selfRect = this.getWorldRect(selfCollider);
        const otherRect = this.getWorldRect(otherCollider);

        return selfRect.bottom >= otherRect.top + this.climbExitClearance;
    }

    private getWorldRect(collider: cc.Collider) {
        const node = collider.node;
        const offset = (collider as any).offset || cc.v2(0, 0);
        const size = (collider as any).size || node.getContentSize();
        const bottomLeft = node.convertToWorldSpaceAR(cc.v2(
            offset.x - size.width * 0.5,
            offset.y - size.height * 0.5
        ));
        const topRight = node.convertToWorldSpaceAR(cc.v2(
            offset.x + size.width * 0.5,
            offset.y + size.height * 0.5
        ));
        const left = Math.min(bottomLeft.x, topRight.x);
        const right = Math.max(bottomLeft.x, topRight.x);
        const bottom = Math.min(bottomLeft.y, topRight.y);
        const top = Math.max(bottomLeft.y, topRight.y);

        return {
            left,
            right,
            bottom,
            top,
            centerY: (bottom + top) * 0.5
        };
    }
}
