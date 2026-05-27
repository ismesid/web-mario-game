import GameAudio from './GameAudio';
import GamePause from './GamePause';

const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayerController extends cc.Component {
    @property
    moveSpeed: number = 180;

    @property
    jumpSpeed: number = 450;

    @property
    longJumpHorizontalSpeed: number = 280;

    @property
    runUpTimeForLongJump: number = 0.35;

    @property
    climbSpeed: number = 120;

    @property
    mapNodePath: string = 'Canvas/World/Map/mario map';

    @property
    boundsMapNodePath: string = 'Canvas/World/Map/mario map';

    @property
    startObjectGroupName: string = 'start point';

    @property
    marioAtlasPath: string = 'player/mario_grouped_small';

    @property
    vineColliderTag: number = 1001;

    @property
    coinColliderTag: number = 2002;

    @property
    flowerEnemyColliderTag: number = 3001;

    @property
    goombaEnemyColliderTag: number = 3002;

    @property
    hazardTerrainColliderTag: number = 4001;

    @property
    damageInvincibleDuration: number = 2;

    @property
    invincibleBlinkInterval: number = 0.1;

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
    enforceMapBounds: boolean = true;

    @property
    vineTopSensorExtraHeight: number = 16;

    @property
    vineTopJumpTolerance: number = 8;

    @property
    colliderWidth: number = 18;

    @property
    colliderHeight: number = 18;

    @property
    jumpSfxPath: string = 'audio/jump';

    @property
    climbSfxPath: string = 'audio/climb';

    @property
    sfxVolume: number = 100;

    @property
    climbSfxInterval: number = 0.25;

    @property
    loseOneLifeSfxPath: string = 'audio/loseOneLife';

    @property
    defeatSfxVolume: number = 100;

    @property
    defeatRise: number = 140;

    @property
    defeatDuration: number = 2.238;

    @property
    defeatRiseDuration: number = 0.45;

    @property
    respawnGroundProbeUp: number = 48;

    @property
    respawnGroundProbeDown: number = 220;

    @property
    respawnGroundOffset: number = 0.5;

    @property
    respawnIdleLockDuration: number = 0.25;

    @property
    victoryFrameDuration: number = 1;

    @property
    finishDoorTileX: number = 233;

    @property
    finishDoorTileY: number = 35;

    @property
    finishDoorTileHeight: number = 2;

    @property
    finishDoorLeftOffset: number = 16;

    @property
    finishDoorTriggerWidth: number = 16;

    @property
    finishDoorMaxPlayerY: number = 160;

    private body: cc.RigidBody = null;
    private movingLeft = false;
    private movingRight = false;
    private movingUp = false;
    private movingDown = false;
    private jumpHeld = false;
    private jumpQueued = false;
    private jumpAnimationTimer = 0;
    private jumpStartedWithForwardSpeed = false;
    private groundRunTime = 0;
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
    private isDamageInvincible = false;
    private invincibleTimer = 0;
    private blinkTimer = 0;
    private climbSfxTimer = 0;
    private spawnPosition: cc.Vec2 = null;
    private defaultGravityScale = 1;
    private isDefeatSequence = false;
    private isVictorySequence = false;
    private holdingDefeatPosition = false;
    private defeatHoldPosition: cc.Vec2 = null;
    private respawnIdleLockTimer = 0;
    private finishDoorTriggerRect: { left: number; right: number; bottom: number; top: number } = null;
    private readonly groundCheckTolerance = 8;
    private readonly groundContactNormalY = -0.35;
    private readonly climbThroughNormalY = 0.35;
    private readonly climbExitClearance = 2;
    private readonly damageTint = cc.color(255, 32, 32);
    private readonly damageBlinkOpacity = 35;
    private readonly groundRayNormalY = 0.5;

    private readonly idleFrames = ['idle_0.png'];
    private readonly walkFrames = ['walk_0.png', 'walk_1.png', 'walk_2.png', 'walk_3.png'];
    private readonly jumpForwardFrames = ['jump_forward_0.png', 'jump_forward_1.png', 'jump_forward_2.png', 'jump_forward_3.png'];
    private readonly jumpUpFrames = ['jump_up_0.png', 'jump_up_1.png', 'jump_up_2.png', 'jump_up_3.png'];
    private readonly climbFrames = ['climb_0.png', 'climb_1.png', 'climb_2.png'];
    private readonly defeatFrames = ['defeat_0.png', 'defeat_1.png', 'defeat_2.png'];
    private readonly victoryFrames = ['victory_0.png', 'victory_1.png'];

    onLoad() {
        this.setupPhysics();
        this.loadMarioFrames();
        this.spawnPosition = this.getSpawnPositionFromTileMap() || cc.v2(this.node.x, this.node.y);
        this.finishDoorTriggerRect = this.getFinishDoorTriggerRectFromTileMap();
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
        cc.systemEvent.on('player-out-of-lives', this.playDefeatSequence, this);
        cc.systemEvent.on('player-continue', this.onPlayerContinue, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        GameAudio.preloadSfx(this.loseOneLifeSfxPath);

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
        cc.systemEvent.off('player-out-of-lives', this.playDefeatSequence, this);
        cc.systemEvent.off('player-continue', this.onPlayerContinue, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    update() {
        const dt = cc.director.getDeltaTime();
        this.updateDamageInvincibility(dt);

        if (this.isDefeatSequence) {
            this.holdDefeatPosition();
            return;
        }

        if (this.isVictorySequence) {
            return;
        }

        if (GamePause.paused) {
            return;
        }

        if (!this.body || !this.isLevelReady) {
            return;
        }

        if (this.jumpAnimationTimer > 0) {
            this.jumpAnimationTimer = Math.max(0, this.jumpAnimationTimer - dt);
        }
        if (this.respawnIdleLockTimer > 0) {
            this.respawnIdleLockTimer = Math.max(0, this.respawnIdleLockTimer - dt);
        }

        if (this.shouldForwardJumpFromUpInput() || this.shouldJumpFromVineTop()) {
            this.queueJump();
        } else if (this.canClimb() && (this.movingUp || this.movingDown)) {
            this.startClimbing();
        }

        if (this.isClimbing) {
            this.updateClimbing(dt);
            this.enforceMapBoundary();
            this.checkFinishReached();
            return;
        }

        this.updateNormalMovement();
        this.enforceMapBoundary();
        this.checkFinishReached();
    }

    private updateNormalMovement() {
        const velocity = this.body.linearVelocity;
        let velocityX = this.getNormalVelocityX(velocity.x);
        let velocityY = velocity.y;
        const grounded = this.isGrounded();

        this.applyFacing(velocityX);

        if (this.jumpQueued && grounded) {
            velocityY = this.jumpSpeed;
            velocityX = this.getJumpVelocityX(velocityX);
            this.jumpAnimationTimer = this.jumpAnimationLockTime;
            this.jumpStartedWithForwardSpeed = Math.abs(velocityX) > 20 || this.movingLeft || this.movingRight;
            this.groundRunTime = 0;
            this.playJumpSfx();
        } else {
            this.updateRunUpTimer(velocityX, grounded);
        }
        this.jumpQueued = false;

        this.body.linearVelocity = cc.v2(velocityX, velocityY);
        this.updateMarioFrame(velocityX, velocityY);
    }

    private updateClimbing(dt: number) {
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
            this.playJumpSfx();
            this.updateMarioFrame(velocityX, this.jumpSpeed);
            return;
        }

        this.body.linearVelocity = cc.v2(velocityX, velocityY);
        this.updateClimbSfx(dt, Math.abs(velocityY) > 1);
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

    private getNormalVelocityX(currentVelocityX: number) {
        const inputVelocityX = this.getInputVelocityX(this.moveSpeed);
        if (this.isGrounded() || inputVelocityX === 0 || Math.abs(currentVelocityX) <= this.moveSpeed) {
            return inputVelocityX;
        }

        if ((currentVelocityX > 0 && inputVelocityX > 0) || (currentVelocityX < 0 && inputVelocityX < 0)) {
            return currentVelocityX;
        }

        return inputVelocityX;
    }

    private updateRunUpTimer(velocityX: number, grounded: boolean) {
        if (grounded && Math.abs(velocityX) > 1 && this.hasHorizontalInput()) {
            this.groundRunTime += cc.director.getDeltaTime();
            return;
        }

        this.groundRunTime = 0;
    }

    private getJumpVelocityX(velocityX: number) {
        if (!this.hasHorizontalInput()) {
            return velocityX;
        }

        let direction = 0;
        if (this.movingRight && !this.movingLeft) {
            direction = 1;
        } else if (this.movingLeft && !this.movingRight) {
            direction = -1;
        } else if (velocityX > 0) {
            direction = 1;
        } else if (velocityX < 0) {
            direction = -1;
        }

        if (direction === 0) {
            return velocityX;
        }

        const runUpRatio = this.runUpTimeForLongJump <= 0
            ? 1
            : Math.min(1, this.groundRunTime / this.runUpTimeForLongJump);
        const jumpSpeedX = this.moveSpeed + (this.longJumpHorizontalSpeed - this.moveSpeed) * runUpRatio;

        return direction * jumpSpeedX;
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
        this.climbSfxTimer = 0;
        this.body.gravityScale = this.defaultGravityScale;

        if (!keepVelocity) {
            this.body.linearVelocity = cc.v2(this.body.linearVelocity.x, 0);
        }
    }

    private lockPlayer() {
        this.isLevelReady = false;
        this.node.setPosition(this.spawnPosition);
        this.stopDamageInvincibility(0);
        this.node.opacity = 0;
        this.node.color = cc.Color.WHITE;
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
        this.isDefeatSequence = false;
        this.isVictorySequence = false;
        this.holdingDefeatPosition = false;
        this.defeatHoldPosition = null;
        this.isLevelReady = true;
        this.node.stopAllActions();
        this.node.setPosition(this.getRespawnPositionOnGround());
        this.stopDamageInvincibility(255);
        this.node.opacity = 255;
        this.node.color = cc.Color.WHITE;
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
        this.setPlayerColliderEnabled(true);
        this.resetToIdleFrame();
        this.respawnIdleLockTimer = this.respawnIdleLockDuration;
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

    private enforceMapBoundary() {
        if (!this.enforceMapBounds || !this.body) {
            return;
        }

        const selfCollider = this.getComponent(cc.PhysicsBoxCollider);
        const bounds = this.getMapWorldBounds();
        if (!selfCollider || !bounds) {
            return;
        }

        const selfRect = this.getWorldRect(selfCollider);
        let offsetX = 0;
        let offsetY = 0;

        if (selfRect.left < bounds.left) {
            offsetX = bounds.left - selfRect.left;
        } else if (selfRect.right > bounds.right) {
            offsetX = bounds.right - selfRect.right;
        }

        if (selfRect.top > bounds.top) {
            offsetY = bounds.top - selfRect.top;
        }

        if (offsetX === 0 && offsetY === 0) {
            return;
        }

        const currentWorld = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const clampedWorld = cc.v2(currentWorld.x + offsetX, currentWorld.y + offsetY);
        const nextLocal = this.node.parent
            ? this.node.parent.convertToNodeSpaceAR(clampedWorld)
            : clampedWorld;
        const velocity = this.body.linearVelocity;

        this.node.setPosition(nextLocal);
        let nextVelocityX = velocity.x;
        let nextVelocityY = velocity.y;
        if ((offsetX < 0 && velocity.x > 0) || (offsetX > 0 && velocity.x < 0)) {
            nextVelocityX = 0;
        }
        if (offsetY < 0 && velocity.y > 0) {
            nextVelocityY = 0;
        }
        this.body.linearVelocity = cc.v2(nextVelocityX, nextVelocityY);
        this.body.syncPosition(true);
    }

    private playJumpSfx() {
        GameAudio.playSfx(this.jumpSfxPath, this.sfxVolume);
    }

    private updateClimbSfx(dt: number, isMovingVertically: boolean) {
        if (!isMovingVertically) {
            this.climbSfxTimer = 0;
            return;
        }

        this.climbSfxTimer -= dt;
        if (this.climbSfxTimer > 0) {
            return;
        }

        GameAudio.playSfx(this.climbSfxPath, this.sfxVolume);
        this.climbSfxTimer = Math.max(0.05, this.climbSfxInterval);
    }

    private getMapWorldBounds() {
        const mapNode = cc.find(this.boundsMapNodePath);
        if (!mapNode) {
            return null;
        }

        const tileMap = mapNode.getComponent(cc.TiledMap);
        if (!tileMap) {
            return null;
        }

        const mapSize = tileMap.getMapSize();
        const tileSize = tileMap.getTileSize();
        const mapWidth = mapSize.width * tileSize.width;
        const mapHeight = mapSize.height * tileSize.height;
        const left = -mapWidth * mapNode.anchorX;
        const right = mapWidth * (1 - mapNode.anchorX);
        const top = mapHeight * (1 - mapNode.anchorY);
        const bottom = -mapHeight * mapNode.anchorY;
        const bottomLeft = mapNode.convertToWorldSpaceAR(cc.v2(left, bottom));
        const topRight = mapNode.convertToWorldSpaceAR(cc.v2(right, top));

        return {
            left: Math.min(bottomLeft.x, topRight.x),
            right: Math.max(bottomLeft.x, topRight.x),
            bottom: Math.min(bottomLeft.y, topRight.y),
            top: Math.max(bottomLeft.y, topRight.y)
        };
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

        if (this.respawnIdleLockTimer > 0 && !this.hasHorizontalInput() && Math.abs(velocityX) < 1) {
            this.setAnimationFrame('idle', this.idleFrames, 1, false);
            return;
        }

        const airborne = !this.isGrounded();
        if (airborne) {
            if (this.jumpStartedWithForwardSpeed) {
                this.setAnimationFrame('jumpForwardAirborne', this.jumpForwardFrames, 1, false);
                return;
            }

            this.setAnimationFrame('jumpUp', this.jumpUpFrames, 10, true);
            return;
        }

        if (this.jumpAnimationTimer > 0 || Math.abs(velocityY) > 20) {
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
        if (GamePause.paused || this.isDefeatSequence || this.isVictorySequence) {
            return;
        }

        if (this.isHazardTerrainCollider(otherCollider)) {
            return;
        }

        if (this.isEnemyCollider(otherCollider)) {
            if (!this.shouldIgnoreEnemyContact(otherCollider)) {
                this.takeDamage();
            }
            return;
        }

        if (this.isVineCollider(otherCollider)) {
            this.addUniqueCollider(this.vineColliders, otherCollider);
            return;
        }

        if (this.isCoinCollider(otherCollider)) {
            return;
        }

        this.refreshGroundContact(contact, selfCollider, otherCollider);
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (GamePause.paused || this.isDefeatSequence || this.isVictorySequence) {
            contact.disabledOnce = true;
            return;
        }

        if (this.isHazardTerrainCollider(otherCollider)) {
            this.refreshHazardGroundContact(contact, selfCollider, otherCollider);
            if (!this.isStandingOnSafeGround(selfCollider)) {
                this.takeDamage();
            }
            return;
        }

        if (this.isEnemyCollider(otherCollider)) {
            if (this.isDamageInvincible) {
                contact.disabledOnce = true;
                return;
            }

            if (this.shouldIgnoreEnemyContact(otherCollider)) {
                return;
            }

            this.takeDamage();
            contact.disabledOnce = true;
            return;
        }

        if (this.isCoinCollider(otherCollider)) {
            return;
        }

        if (this.shouldPassThroughWhileClimbing(contact, selfCollider, otherCollider)) {
            contact.disabledOnce = true;
            return;
        }

        this.refreshGroundContact(contact, selfCollider, otherCollider);
    }

    onEndContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (GamePause.paused || this.isDefeatSequence || this.isVictorySequence) {
            return;
        }

        if (this.isHazardTerrainCollider(otherCollider)) {
            this.removeCollider(this.groundColliders, otherCollider);
            return;
        }

        if (this.isEnemyCollider(otherCollider)) {
            this.removeCollider(this.groundColliders, otherCollider);
            return;
        }

        if (this.isVineCollider(otherCollider)) {
            this.removeCollider(this.vineColliders, otherCollider);
            if (!this.canClimb()) {
                this.stopClimbing(false);
            }
            return;
        }

        if (this.isCoinCollider(otherCollider)) {
            return;
        }

        this.removeCollider(this.climbPassThroughColliders, otherCollider);
        this.removeCollider(this.groundColliders, otherCollider);
    }

    private onKeyDown(event: cc.Event.EventKeyboard) {
        if (GamePause.paused || this.isDefeatSequence || this.isVictorySequence) {
            return;
        }

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
                    if (!this.canClimb() || (this.hasHorizontalInput() && this.isGrounded())) {
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

    private shouldJumpFromVineTop() {
        return !this.isClimbing && this.movingUp && this.canClimb() && this.isGrounded() && this.isStandingAtVineTop();
    }

    private shouldForwardJumpFromUpInput() {
        return this.movingUp && this.hasHorizontalInput() && (this.isGrounded() || this.isClimbing);
    }

    private hasHorizontalInput() {
        return this.movingLeft || this.movingRight;
    }

    private isStandingAtVineTop() {
        const selfCollider = this.getComponent(cc.PhysicsBoxCollider);
        if (!selfCollider) {
            return false;
        }

        const selfRect = this.getWorldRect(selfCollider);
        for (let i = 0; i < this.vineColliders.length; i++) {
            const vineRect = this.getWorldRect(this.vineColliders[i]);
            const effectiveVineTop = vineRect.top - this.vineTopSensorExtraHeight;
            const overlapsX = selfRect.left < vineRect.right && selfRect.right > vineRect.left;

            if (overlapsX && selfRect.bottom >= effectiveVineTop - this.vineTopJumpTolerance) {
                return true;
            }
        }

        return false;
    }

    private isVineCollider(otherCollider: cc.Collider) {
        return otherCollider && otherCollider.tag === this.vineColliderTag;
    }

    private isCoinCollider(otherCollider: cc.Collider) {
        return otherCollider && otherCollider.tag === this.coinColliderTag;
    }

    private isEnemyCollider(otherCollider: cc.Collider) {
        return otherCollider
            && (otherCollider.tag === this.flowerEnemyColliderTag || otherCollider.tag === this.goombaEnemyColliderTag);
    }

    private isHazardTerrainCollider(otherCollider: cc.Collider) {
        return otherCollider && otherCollider.tag === this.hazardTerrainColliderTag;
    }

    public isInvincible() {
        return this.isDamageInvincible;
    }

    private shouldIgnoreEnemyContact(otherCollider: cc.Collider) {
        if (this.isDamageInvincible) {
            return true;
        }

        if (this.isHarmlessGoomba(otherCollider)) {
            return true;
        }

        return otherCollider
            && otherCollider.tag === this.goombaEnemyColliderTag
            && this.isStompingEnemy(otherCollider);
    }

    private takeDamage() {
        if (this.isDamageInvincible || GamePause.paused || this.isDefeatSequence || this.isVictorySequence) {
            return;
        }

        cc.systemEvent.emit('player-damaged');
        if (this.isDefeatSequence || this.isVictorySequence || GamePause.paused) {
            return;
        }

        this.startDamageInvincibility();
    }

    private playDefeatSequence() {
        if (this.isDefeatSequence || this.isVictorySequence) {
            return;
        }

        this.isDefeatSequence = true;
        this.holdingDefeatPosition = false;
        this.defeatHoldPosition = null;
        this.isLevelReady = false;
        this.clearInputState();
        this.stopDamageInvincibility(255);
        this.stopClimbing(false);
        this.groundColliders = [];
        this.vineColliders = [];
        this.climbPassThroughColliders = [];
        this.node.opacity = 255;
        this.node.color = cc.Color.WHITE;
        this.node.stopAllActions();
        this.setMarioFrame(this.defeatFrames[0]);

        if (this.body) {
            this.body.gravityScale = 0;
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
            this.body.enabled = false;
        }
        this.setPlayerColliderEnabled(false);

        const targetPosition = this.getDefeatTargetPosition();
        const duration = Math.max(0.1, this.defeatRiseDuration);
        this.node.runAction(cc.sequence(
            cc.moveTo(duration, targetPosition).easing(cc.easeSineOut()),
            cc.callFunc(() => {
                this.startHoldingDefeatPosition(targetPosition);
                this.playDefeatAudioAnimation();
            })
        ));
    }

    private onPlayerContinue() {
        this.isDefeatSequence = false;
        this.holdingDefeatPosition = false;
        this.defeatHoldPosition = null;
        this.clearInputState();
        this.onLevelReady();
    }

    private checkFinishReached() {
        if (this.isVictorySequence || this.isDefeatSequence) {
            return;
        }

        const collider = this.getComponent(cc.PhysicsBoxCollider);
        if (!collider) {
            return;
        }

        const playerRect = this.getWorldRect(collider);
        if (this.isInsideFinishDoorTrigger(playerRect)) {
            this.playVictorySequence();
        }
    }

    private isInsideFinishDoorTrigger(playerRect: any) {
        return !!this.finishDoorTriggerRect
            && playerRect.left <= this.finishDoorTriggerRect.right
            && playerRect.right >= this.finishDoorTriggerRect.left
            && playerRect.bottom <= this.finishDoorTriggerRect.top
            && playerRect.top >= this.finishDoorTriggerRect.bottom;
    }

    private playVictorySequence() {
        if (this.isVictorySequence || this.isDefeatSequence) {
            return;
        }

        this.isVictorySequence = true;
        this.isLevelReady = false;
        this.clearInputState();
        this.stopDamageInvincibility(255);
        this.stopClimbing(false);
        this.groundColliders = [];
        this.vineColliders = [];
        this.climbPassThroughColliders = [];
        this.node.stopAllActions();
        this.node.opacity = 255;
        this.node.color = cc.Color.WHITE;
        this.setPlayerColliderEnabled(false);

        if (this.body) {
            this.body.gravityScale = 0;
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
            this.body.enabled = false;
        }

        GamePause.pause();
        this.node.runAction(cc.sequence(
            this.createEvenFrameAction(this.victoryFrames, this.victoryFrames.length * Math.max(0.1, this.victoryFrameDuration)),
            cc.callFunc(() => {
                cc.systemEvent.emit('player-victory-finished');
            })
        ));
    }

    private clearInputState() {
        this.movingLeft = false;
        this.movingRight = false;
        this.movingUp = false;
        this.movingDown = false;
        this.jumpHeld = false;
        this.jumpQueued = false;
        this.jumpAnimationTimer = 0;
        this.jumpStartedWithForwardSpeed = false;
        this.groundRunTime = 0;
        this.climbSfxTimer = 0;
    }

    private getDefeatTargetPosition() {
        const currentWorld = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        const bounds = this.getMapWorldBounds();
        let targetWorldY = currentWorld.y + this.defeatRise;

        if (bounds) {
            targetWorldY = Math.min(targetWorldY, bounds.top - this.colliderHeight * 0.5 - 2);
        }

        targetWorldY = Math.max(currentWorld.y, targetWorldY);
        const targetWorld = cc.v2(currentWorld.x, targetWorldY);
        return this.node.parent ? this.node.parent.convertToNodeSpaceAR(targetWorld) : targetWorld;
    }

    private getRespawnPositionOnGround() {
        if (!this.spawnPosition) {
            return this.node.getPosition();
        }

        const snappedPosition = this.findGroundedPosition(this.spawnPosition);
        return snappedPosition || this.spawnPosition;
    }

    private findGroundedPosition(localPosition: cc.Vec2) {
        if (!this.node.parent) {
            return null;
        }

        const localStart = cc.v2(localPosition.x, localPosition.y + Math.max(0, this.respawnGroundProbeUp));
        const localEnd = cc.v2(localPosition.x, localPosition.y - Math.max(1, this.respawnGroundProbeDown));
        const worldStart = this.node.parent.convertToWorldSpaceAR(localStart);
        const worldEnd = this.node.parent.convertToWorldSpaceAR(localEnd);
        const results = cc.director.getPhysicsManager().rayCast(worldStart, worldEnd, cc.RayCastType.All);
        if (!results || results.length === 0) {
            return null;
        }

        let bestPoint: cc.Vec2 = null;
        let bestFraction = Number.POSITIVE_INFINITY;
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (!this.isRespawnGroundResult(result)) {
                continue;
            }

            if (result.fraction < bestFraction) {
                bestFraction = result.fraction;
                bestPoint = result.point;
            }
        }

        if (!bestPoint) {
            return null;
        }

        const collider = this.getComponent(cc.PhysicsBoxCollider);
        const offset = collider ? collider.offset || cc.v2(0, 0) : cc.v2(0, 0);
        const size = collider ? collider.size || cc.size(this.colliderWidth, this.colliderHeight) : cc.size(this.colliderWidth, this.colliderHeight);
        const targetWorld = cc.v2(
            worldStart.x,
            bestPoint.y + size.height * 0.5 - offset.y + this.respawnGroundOffset
        );
        return this.node.parent.convertToNodeSpaceAR(targetWorld);
    }

    private getFinishDoorTriggerRectFromTileMap() {
        const mapNode = cc.find(this.boundsMapNodePath) || cc.find(this.mapNodePath);
        if (!mapNode) {
            return null;
        }

        const tileMap = mapNode.getComponent(cc.TiledMap);
        if (!tileMap) {
            return null;
        }

        const mapSize = tileMap.getMapSize();
        const tileSize = tileMap.getTileSize();
        const mapWidth = mapSize.width * tileSize.width;
        const mapHeight = mapSize.height * tileSize.height;
        const doorLeftRawX = Math.max(0, this.finishDoorTileX) * tileSize.width;
        const triggerLeftRawX = doorLeftRawX - Math.max(0, this.finishDoorLeftOffset);
        const triggerRightRawX = triggerLeftRawX + Math.max(1, this.finishDoorTriggerWidth);
        const doorBottomRawY = (mapSize.height - Math.max(0, this.finishDoorTileY + this.finishDoorTileHeight)) * tileSize.height;
        const triggerBottomRawY = Math.max(0, doorBottomRawY - tileSize.height);
        const triggerTopRawY = Math.max(triggerBottomRawY + 1, this.finishDoorMaxPlayerY);
        const left = triggerLeftRawX - mapWidth * mapNode.anchorX;
        const right = triggerRightRawX - mapWidth * mapNode.anchorX;
        const bottom = triggerBottomRawY - mapHeight * mapNode.anchorY;
        const top = triggerTopRawY - mapHeight * mapNode.anchorY;
        const bottomLeft = mapNode.convertToWorldSpaceAR(cc.v2(left, bottom));
        const topRight = mapNode.convertToWorldSpaceAR(cc.v2(right, top));

        return {
            left: Math.min(bottomLeft.x, topRight.x),
            right: Math.max(bottomLeft.x, topRight.x),
            bottom: Math.min(bottomLeft.y, topRight.y),
            top: Math.max(bottomLeft.y, topRight.y)
        };
    }

    private isRespawnGroundResult(result: cc.PhysicsRayCastResult) {
        if (!result || !result.collider || !result.collider.node || result.collider.node === this.node) {
            return false;
        }

        const collider: any = result.collider;
        if (collider.sensor || collider.tag !== 0) {
            return false;
        }

        return result.normal && result.normal.y >= this.groundRayNormalY;
    }

    private resetToIdleFrame() {
        this.currentAnimationKey = '';
        this.animationTimer = 0;
        this.jumpAnimationTimer = 0;
        this.jumpStartedWithForwardSpeed = false;
        this.groundRunTime = 0;
        this.setAnimationFrame('idle', this.idleFrames, 1, false);
    }

    private startHoldingDefeatPosition(position: cc.Vec2) {
        this.defeatHoldPosition = cc.v2(position.x, position.y);
        this.holdingDefeatPosition = true;
        this.holdDefeatPosition();
    }

    private holdDefeatPosition() {
        if (!this.holdingDefeatPosition || !this.defeatHoldPosition) {
            return;
        }

        this.node.setPosition(this.defeatHoldPosition);
        if (this.body) {
            this.body.gravityScale = 0;
            this.body.linearVelocity = cc.v2(0, 0);
            this.body.angularVelocity = 0;
            this.body.enabled = false;
        }
    }

    private playDefeatAudioAnimation() {
        GameAudio.getSfxDuration(this.loseOneLifeSfxPath, this.defeatDuration, (duration: number) => {
            if (!cc.isValid(this.node) || !this.isDefeatSequence) {
                return;
            }

            const safeDuration = Math.max(0.1, duration);
            GameAudio.playSfx(this.loseOneLifeSfxPath, this.defeatSfxVolume);
            this.node.stopAllActions();
            this.node.runAction(cc.sequence(
                this.createEvenFrameAction(this.defeatFrames, safeDuration),
                cc.callFunc(() => {
                    cc.systemEvent.emit('player-defeat-finished');
                })
            ));
        });
    }

    private createEvenFrameAction(frames: string[], duration: number) {
        const safeFrames = frames && frames.length > 0 ? frames : this.defeatFrames;
        const frameDuration = Math.max(0.05, duration / safeFrames.length);
        const actions: cc.FiniteTimeAction[] = [];

        for (let i = 0; i < safeFrames.length; i++) {
            const frameName = safeFrames[i];
            actions.push(cc.callFunc(() => {
                this.setMarioFrame(frameName);
            }));
            actions.push(cc.delayTime(frameDuration));
        }

        return cc.sequence(actions);
    }

    private setPlayerColliderEnabled(enabled: boolean) {
        const collider = this.getComponent(cc.PhysicsBoxCollider);
        if (!collider) {
            return;
        }

        collider.enabled = enabled;
        collider.apply();
    }

    private startDamageInvincibility() {
        this.isDamageInvincible = true;
        this.invincibleTimer = this.damageInvincibleDuration;
        this.blinkTimer = 0;
        this.node.opacity = 255;
        this.node.color = this.damageTint;
    }

    private stopDamageInvincibility(opacity: number = 255) {
        this.isDamageInvincible = false;
        this.invincibleTimer = 0;
        this.blinkTimer = 0;
        this.node.opacity = opacity;
        this.node.color = cc.Color.WHITE;
    }

    private updateDamageInvincibility(dt: number) {
        if (!this.isDamageInvincible || this.isDefeatSequence) {
            return;
        }

        this.invincibleTimer -= dt;
        if (this.invincibleTimer <= 0) {
            this.stopDamageInvincibility();
            return;
        }

        this.blinkTimer += dt;
        if (this.blinkTimer >= this.invincibleBlinkInterval) {
            this.blinkTimer = 0;
            const showDamageTint = this.node.opacity >= 200;
            this.node.opacity = showDamageTint ? this.damageBlinkOpacity : 255;
            this.node.color = showDamageTint ? cc.Color.WHITE : this.damageTint;
        }
    }

    private isStompingEnemy(enemyCollider: cc.Collider) {
        if (!enemyCollider) {
            return false;
        }

        if (this.body && this.body.linearVelocity.y > 100) {
            return false;
        }

        const selfCollider = this.getComponent(cc.PhysicsBoxCollider);
        if (!selfCollider) {
            return false;
        }

        const selfRect = this.getWorldRect(selfCollider);
        const enemyRect = this.getWorldRect(enemyCollider);
        const overlapsX = selfRect.left < enemyRect.right - 2 && selfRect.right > enemyRect.left + 2;
        const selfAboveEnemy = selfRect.centerY > enemyRect.centerY;
        const bottomNearTop = selfRect.bottom >= enemyRect.top - this.groundCheckTolerance
            && selfRect.bottom <= enemyRect.top + this.groundCheckTolerance + 4;

        return overlapsX && selfAboveEnemy && bottomNearTop;
    }

    private isHarmlessGoomba(enemyCollider: cc.Collider) {
        if (!enemyCollider || enemyCollider.tag !== this.goombaEnemyColliderTag || !enemyCollider.node) {
            return false;
        }

        const goomba = enemyCollider.node.getComponent('GoombaEnemy') as any;
        return !!(goomba && typeof goomba.isHarmless === 'function' && goomba.isHarmless());
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

    private isStandingOnSafeGround(selfCollider: cc.Collider) {
        if (!selfCollider) {
            return false;
        }

        for (let i = 0; i < this.groundColliders.length; i++) {
            const collider = this.groundColliders[i];
            if (!collider || !collider.node || !cc.isValid(collider.node)) {
                continue;
            }

            if (
                this.isHazardTerrainCollider(collider)
                || this.isEnemyCollider(collider)
                || this.isVineCollider(collider)
                || this.isCoinCollider(collider)
            ) {
                continue;
            }

            if (this.isStandingOn(collider)) {
                return true;
            }
        }

        return false;
    }

    private refreshGroundContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isVineCollider(otherCollider)) {
            return;
        }

        if (this.isHazardTerrainCollider(otherCollider)) {
            return;
        }

        if (this.isStandingOn(otherCollider) || this.hasGroundContactNormal(contact, selfCollider, otherCollider)) {
            this.addUniqueCollider(this.groundColliders, otherCollider);
        }
    }

    private refreshHazardGroundContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isStandingOn(otherCollider) || this.hasGroundContactNormal(contact, selfCollider, otherCollider)) {
            this.addUniqueCollider(this.groundColliders, otherCollider);
        }
    }

    private hasGroundContactNormal(
        contact: cc.PhysicsContact,
        selfCollider: cc.Collider,
        otherCollider: cc.Collider
    ) {
        if (!contact || !selfCollider || !otherCollider || !otherCollider.node || otherCollider.node === this.node) {
            return false;
        }

        const selfRect = this.getWorldRect(selfCollider);
        const otherRect = this.getWorldRect(otherCollider);
        const overlapsX = selfRect.left < otherRect.right && selfRect.right > otherRect.left;
        const selfAboveOther = selfRect.centerY >= otherRect.centerY;
        if (!overlapsX || !selfAboveOther) {
            return false;
        }

        const normal = contact.getWorldManifold().normal;
        const normalFromSelfToOther = contact.colliderA === selfCollider ? normal : cc.v2(-normal.x, -normal.y);

        return normalFromSelfToOther.y < this.groundContactNormalY;
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
