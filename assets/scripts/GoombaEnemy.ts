import PlayerController from './PlayerController';
import GameAudio from './GameAudio';
import GamePause from './GamePause';

const { ccclass } = cc._decorator;

type GoombaState = 'idle' | 'chase' | 'lost' | 'return' | 'defeated';

@ccclass
export default class GoombaEnemy extends cc.Component {
    private player: cc.Node = null;
    private visualNode: cc.Node = null;
    private sprite: cc.Sprite = null;
    private collider: cc.PhysicsBoxCollider = null;
    private body: cc.RigidBody = null;
    private walkFrame: cc.SpriteFrame = null;
    private squashedFrame: cc.SpriteFrame = null;
    private angelFrames: cc.SpriteFrame[] = [];
    private state: GoombaState = 'idle';
    private initialX = 0;
    private surfaceY = 0;
    private platformLeft = 0;
    private platformRight = 0;
    private activationDelay = 0.5;
    private lostPlayerReturnDelay = 2;
    private samePlaneToleranceY = 8;
    private chaseSpeed = 55;
    private returnSpeed = 45;
    private walkFps = 6;
    private stompBounceSpeed = 260;
    private squashDuration = 0.18;
    private flyDuration = 0.8;
    private flyRise = 48;
    private scoreValue = 200;
    private coinColliderTag = 2002;
    private stompSfxPath = 'audio/stomp';
    private sfxVolume = 100;
    private samePlaneTimer = 0;
    private lostPlayerTimer = 0;
    private moveDirection = 1;
    private obstacleTurnCooldown = 0;
    private walkTimer = 0;
    private angelTimer = 0;
    private angelAnimating = false;

    setup(
        player: cc.Node,
        visualNode: cc.Node,
        walkFrame: cc.SpriteFrame,
        squashedFrame: cc.SpriteFrame,
        angelFrames: cc.SpriteFrame[],
        initialX: number,
        surfaceY: number,
        platformLeft: number,
        platformRight: number,
        activationDelay: number,
        lostPlayerReturnDelay: number,
        samePlaneToleranceY: number,
        chaseSpeed: number,
        returnSpeed: number,
        walkFps: number,
        stompBounceSpeed: number,
        squashDuration: number,
        flyDuration: number,
        flyRise: number,
        scoreValue: number,
        coinColliderTag: number,
        stompSfxPath: string = 'audio/stomp',
        sfxVolume: number = 100
    ) {
        this.player = player;
        this.visualNode = visualNode;
        this.sprite = visualNode ? visualNode.getComponent(cc.Sprite) : null;
        this.collider = this.getComponent(cc.PhysicsBoxCollider);
        this.body = this.getComponent(cc.RigidBody);
        this.walkFrame = walkFrame;
        this.squashedFrame = squashedFrame || walkFrame;
        this.angelFrames = angelFrames || [];
        this.initialX = initialX;
        this.surfaceY = surfaceY;
        this.platformLeft = platformLeft;
        this.platformRight = platformRight;
        this.activationDelay = activationDelay;
        this.lostPlayerReturnDelay = lostPlayerReturnDelay;
        this.samePlaneToleranceY = samePlaneToleranceY;
        this.chaseSpeed = chaseSpeed;
        this.returnSpeed = returnSpeed;
        this.walkFps = walkFps;
        this.stompBounceSpeed = stompBounceSpeed;
        this.squashDuration = squashDuration;
        this.flyDuration = flyDuration;
        this.flyRise = flyRise;
        this.scoreValue = scoreValue;
        this.coinColliderTag = coinColliderTag;
        this.stompSfxPath = stompSfxPath || this.stompSfxPath;
        this.sfxVolume = sfxVolume;

        this.node.x = this.initialX;
        this.node.y = this.surfaceY;
        this.setWalkFrame(false);
    }

    update(dt: number) {
        if (GamePause.paused) {
            this.stopMoving();
            return;
        }

        if (this.state === 'defeated') {
            this.updateAngelAnimation(dt);
            return;
        }
        this.obstacleTurnCooldown = Math.max(0, this.obstacleTurnCooldown - dt);

        const samePlane = this.isPlayerOnSamePlatform();
        if (this.state === 'idle') {
            this.stopMoving();
            this.updateActivationTimer(dt, samePlane);
            return;
        }

        if (this.state === 'chase') {
            if (!samePlane) {
                this.state = 'lost';
                this.lostPlayerTimer = 0;
                return;
            }

            const playerX = this.getPlayerCenterX();
            this.rememberDirectionTo(playerX);
            this.moveToward(playerX, this.chaseSpeed, dt);
            return;
        }

        if (this.state === 'lost') {
            if (samePlane) {
                this.state = 'chase';
                this.lostPlayerTimer = 0;
                return;
            }

            this.lostPlayerTimer += dt;
            if (this.lostPlayerTimer >= this.lostPlayerReturnDelay) {
                this.state = 'return';
                this.samePlaneTimer = 0;
                return;
            }

            this.moveInDirection(this.moveDirection, this.chaseSpeed, dt);
            return;
        }

        if (this.state === 'return') {
            if (samePlane) {
                this.state = 'chase';
                this.lostPlayerTimer = 0;
                return;
            }

            if (this.moveToward(this.initialX, this.returnSpeed, dt)) {
                this.state = 'idle';
                this.samePlaneTimer = 0;
                this.setWalkFrame(false);
            }
        }
    }

    public isHarmless() {
        return this.state === 'defeated';
    }

    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isCoinCollider(otherCollider) || this.state === 'defeated') {
            return;
        }

        if (this.isInvinciblePlayer(otherCollider)) {
            return;
        }

        if (this.tryDefeatFromPlayer(otherCollider)) {
            return;
        }

        this.turnAwayFromObstacle(contact, selfCollider, otherCollider);
    }

    onPreSolve(contact: cc.PhysicsContact, selfCollider: cc.Collider, otherCollider: cc.Collider) {
        if (this.isCoinCollider(otherCollider) || this.state === 'defeated') {
            contact.disabledOnce = true;
            return;
        }

        if (this.isInvinciblePlayer(otherCollider)) {
            contact.disabledOnce = true;
            return;
        }

        if (this.tryDefeatFromPlayer(otherCollider)) {
            contact.disabledOnce = true;
            return;
        }

        this.turnAwayFromObstacle(contact, selfCollider, otherCollider);
    }

    private updateActivationTimer(dt: number, samePlane: boolean) {
        if (!samePlane) {
            this.samePlaneTimer = 0;
            return;
        }

        this.samePlaneTimer += dt;
        if (this.samePlaneTimer >= this.activationDelay) {
            this.rememberDirectionTo(this.getPlayerCenterX());
            this.state = 'chase';
        }
    }

    private moveToward(targetX: number, speed: number, dt: number) {
        const dx = targetX - this.node.x;
        if (Math.abs(dx) <= 1) {
            this.node.x = targetX;
            this.stopMoving();
            this.syncBody();
            return true;
        }

        const direction = dx > 0 ? 1 : -1;
        this.moveDirection = direction;
        return this.moveInDirection(direction, speed, dt, targetX);
    }

    private moveInDirection(direction: number, speed: number, dt: number, targetX: number = null) {
        direction = direction >= 0 ? 1 : -1;
        const nextX = this.clamp(this.node.x + direction * speed * dt, this.platformLeft, this.platformRight);
        this.node.x = nextX;
        this.node.y = this.surfaceY;
        if (this.body) {
            this.body.linearVelocity = cc.v2(direction * speed, 0);
        }
        this.updateWalkAnimation(dt);
        this.syncBody();

        if (nextX <= this.platformLeft || nextX >= this.platformRight) {
            this.moveDirection *= -1;
        }

        return targetX !== null && Math.abs(targetX - this.node.x) <= 1;
    }

    private rememberDirectionTo(targetX: number) {
        const dx = targetX - this.node.x;
        if (Math.abs(dx) > 1) {
            this.moveDirection = dx > 0 ? 1 : -1;
        }
    }

    private stopMoving() {
        if (this.body) {
            this.body.linearVelocity = cc.v2(0, 0);
        }
    }

    private updateWalkAnimation(dt: number) {
        if (!this.visualNode || !this.sprite || !this.walkFrame) {
            return;
        }

        this.walkTimer += dt;
        this.sprite.spriteFrame = this.walkFrame;
        const flip = Math.floor(this.walkTimer * this.walkFps) % 2 === 0;
        this.visualNode.scaleX = flip ? 1 : -1;
    }

    private setWalkFrame(resetTimer: boolean) {
        if (resetTimer) {
            this.walkTimer = 0;
        }
        if (this.sprite && this.walkFrame) {
            this.sprite.spriteFrame = this.walkFrame;
        }
        if (this.visualNode) {
            this.visualNode.scaleX = 1;
        }
    }

    private tryDefeatFromPlayer(otherCollider: cc.Collider) {
        if (this.state === 'defeated' || !otherCollider || !otherCollider.node) {
            return false;
        }

        const player = otherCollider.node.getComponent(PlayerController);
        if (!player || player.isInvincible()) {
            return false;
        }

        if (!this.isStompedBy(otherCollider)) {
            return false;
        }

        this.defeat(otherCollider.node);
        return true;
    }

    private isStompedBy(playerCollider: cc.Collider) {
        const playerBody = playerCollider.node.getComponent(cc.RigidBody);
        if (playerBody && playerBody.linearVelocity.y > 100) {
            return false;
        }

        const playerRect = this.getWorldRect(playerCollider);
        const selfRect = this.getWorldRect(this.collider);
        const overlapsX = playerRect.left < selfRect.right - 2 && playerRect.right > selfRect.left + 2;
        const playerAbove = playerRect.centerY > selfRect.centerY;
        const bottomNearTop = playerRect.bottom >= selfRect.top - 10 && playerRect.bottom <= selfRect.top + 12;

        return overlapsX && playerAbove && bottomNearTop;
    }

    private defeat(playerNode: cc.Node) {
        this.state = 'defeated';
        this.samePlaneTimer = 0;
        this.stopMoving();
        this.disableCollider();
        this.bouncePlayer(playerNode);
        GameAudio.playSfx(this.stompSfxPath, this.sfxVolume);
        cc.systemEvent.emit('enemy-defeated', this.scoreValue);

        if (this.sprite) {
            this.sprite.spriteFrame = this.squashedFrame;
        }
        if (this.visualNode) {
            this.visualNode.scaleX = 1;
        }

        this.node.stopAllActions();
        this.node.runAction(cc.sequence(
            cc.delayTime(this.squashDuration),
            cc.callFunc(() => this.startAngelFly()),
            cc.spawn(
                cc.moveBy(this.flyDuration, 0, this.flyRise).easing(cc.easeSineOut()),
                cc.fadeOut(this.flyDuration)
            ),
            cc.callFunc(() => {
                if (cc.isValid(this.node)) {
                    this.node.destroy();
                }
            })
        ));
    }

    private bouncePlayer(playerNode: cc.Node) {
        const playerBody = playerNode ? playerNode.getComponent(cc.RigidBody) : null;
        if (!playerBody) {
            return;
        }

        playerBody.linearVelocity = cc.v2(playerBody.linearVelocity.x, this.stompBounceSpeed);
    }

    private startAngelFly() {
        this.angelAnimating = true;
        this.angelTimer = 0;
        this.setAngelFrame(0);
    }

    private updateAngelAnimation(dt: number) {
        if (!this.angelAnimating || this.angelFrames.length === 0) {
            return;
        }

        this.angelTimer += dt;
        const index = Math.floor(this.angelTimer * this.walkFps) % this.angelFrames.length;
        this.setAngelFrame(index);
    }

    private setAngelFrame(index: number) {
        if (!this.sprite || this.angelFrames.length === 0) {
            return;
        }

        this.sprite.spriteFrame = this.angelFrames[index % this.angelFrames.length];
    }

    private disableCollider() {
        if (this.collider) {
            this.collider.enabled = false;
            this.collider.sensor = true;
            this.collider.apply();
        }
        if (this.body) {
            this.body.enabled = false;
        }
    }

    private turnAwayFromObstacle(
        contact: cc.PhysicsContact,
        selfCollider: cc.Collider,
        otherCollider: cc.Collider
    ) {
        if (
            this.obstacleTurnCooldown > 0
            || this.state === 'idle'
            || this.state === 'return'
            || !contact
            || !selfCollider
            || !otherCollider
            || otherCollider.node.getComponent(PlayerController)
        ) {
            return;
        }

        const normal = contact.getWorldManifold().normal;
        const normalFromSelfToOther = contact.colliderA === selfCollider ? normal : cc.v2(-normal.x, -normal.y);
        if (Math.abs(normalFromSelfToOther.x) <= Math.abs(normalFromSelfToOther.y)) {
            return;
        }

        if (
            (normalFromSelfToOther.x > 0 && this.moveDirection > 0)
            || (normalFromSelfToOther.x < 0 && this.moveDirection < 0)
        ) {
            this.moveDirection *= -1;
            this.obstacleTurnCooldown = 0.2;
        }
    }

    private isPlayerOnSamePlatform() {
        if (!this.player || !cc.isValid(this.player) || !this.node.parent) {
            return false;
        }

        const playerCollider = this.player.getComponent(cc.PhysicsBoxCollider);
        if (!playerCollider) {
            return false;
        }

        const rect = this.getColliderRectInParent(playerCollider);
        const withinPlatform = rect.centerX >= this.platformLeft && rect.centerX <= this.platformRight;
        const onSurface = Math.abs(rect.bottom - this.surfaceY) <= this.samePlaneToleranceY;

        return withinPlatform && onSurface;
    }

    private getPlayerCenterX() {
        if (!this.player || !cc.isValid(this.player) || !this.node.parent) {
            return this.initialX;
        }

        const world = this.player.convertToWorldSpaceAR(cc.v2(0, 0));
        return this.node.parent.convertToNodeSpaceAR(world).x;
    }

    private isCoinCollider(otherCollider: cc.Collider) {
        return otherCollider && otherCollider.tag === this.coinColliderTag;
    }

    private isInvinciblePlayer(otherCollider: cc.Collider) {
        if (!otherCollider || !otherCollider.node) {
            return false;
        }

        const player = otherCollider.node.getComponent(PlayerController);
        return !!(player && player.isInvincible());
    }

    private getColliderRectInParent(collider: cc.Collider) {
        const rect = this.getWorldRect(collider);
        const bottomLeft = this.node.parent.convertToNodeSpaceAR(cc.v2(rect.left, rect.bottom));
        const topRight = this.node.parent.convertToNodeSpaceAR(cc.v2(rect.right, rect.top));
        const left = Math.min(bottomLeft.x, topRight.x);
        const right = Math.max(bottomLeft.x, topRight.x);
        const bottom = Math.min(bottomLeft.y, topRight.y);
        const top = Math.max(bottomLeft.y, topRight.y);

        return {
            left,
            right,
            bottom,
            top,
            centerX: (left + right) * 0.5
        };
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
            centerX: (left + right) * 0.5,
            centerY: (bottom + top) * 0.5
        };
    }

    private syncBody() {
        if (this.body) {
            this.body.syncPosition(true);
        }
    }

    private clamp(value: number, min: number, max: number) {
        return Math.max(min, Math.min(max, value));
    }
}
