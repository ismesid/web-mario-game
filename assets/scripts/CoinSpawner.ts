import CoinCollectible from './CoinCollectible';
import GameAudio from './GameAudio';
import GamePause from './GamePause';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CoinSpawner extends cc.Component {
    @property
    objectGroupName: string = 'coins';

    @property
    coinTexturePath: string = 'coins/coin_spin';

    @property
    collectEffectAtlasPath: string = 'tiles/effects';

    @property
    collectEffectFrameName: string = 'effects_1.png';

    @property
    coinWidth: number = 16;

    @property
    coinHeight: number = 16;

    @property
    frameCount: number = 4;

    @property
    framesPerSecond: number = 8;

    @property
    zIndex: number = 500;

    @property
    coinColliderTag: number = 2002;

    @property
    collectEffectDuration: number = 0.35;

    @property
    collectEffectRise: number = 12;

    @property
    coinSfxPath: string = 'audio/coin';

    @property
    sfxVolume: number = 100;

    @property
    coinSfxBoost: number = 1.5;

    @property
    coinSfxEngineVolume: number = 0.2;

    private readonly generatedRootName = '__Coins';
    private coinSprites: cc.Sprite[] = [];
    private frames: cc.SpriteFrame[] = [];
    private collectEffectFrame: cc.SpriteFrame = null;
    private animationTimer = 0;
    private pendingSpawns: { centerX: number; bottomY: number; name: string }[] = [];

    onLoad() {
        GameAudio.preloadSfx(this.coinSfxPath);
        this.scheduleOnce(() => this.rebuild(), 0);
    }

    update(dt: number) {
        if (GamePause.paused) {
            return;
        }

        if (this.frames.length === 0 || this.coinSprites.length === 0) {
            return;
        }

        this.animationTimer += dt;
        const frameIndex = Math.floor(this.animationTimer * this.framesPerSecond) % this.frames.length;
        const frame = this.frames[frameIndex];

        for (let i = 0; i < this.coinSprites.length; i++) {
            if (cc.isValid(this.coinSprites[i])) {
                this.coinSprites[i].spriteFrame = frame;
            }
        }
    }

    rebuild() {
        const tileMap = this.getComponent(cc.TiledMap);
        if (!tileMap) {
            cc.warn('[CoinSpawner] This node has no cc.TiledMap component.');
            return;
        }

        const objectGroup = tileMap.getObjectGroup(this.objectGroupName);
        if (!objectGroup) {
            cc.warn('[CoinSpawner] Cannot find object group: ' + this.objectGroupName);
            return;
        }

        cc.loader.loadRes(this.coinTexturePath, cc.Texture2D, (err: Error, texture: cc.Texture2D) => {
            if (err || !texture || !cc.isValid(this.node)) {
                cc.warn('[CoinSpawner] Cannot load coin texture: ' + this.coinTexturePath);
                return;
            }

            this.frames = this.createFrames(texture);
            this.buildCoins(tileMap, objectGroup);
            this.flushPendingSpawns();
        });
        this.loadCollectEffectFrame();
    }

    private createFrames(texture: cc.Texture2D) {
        const frames: cc.SpriteFrame[] = [];
        for (let i = 0; i < this.frameCount; i++) {
            const frame = new cc.SpriteFrame(
                texture,
                cc.rect(i * this.coinWidth, 0, this.coinWidth, this.coinHeight)
            );
            frames.push(frame);
        }

        return frames;
    }

    private buildCoins(tileMap: cc.TiledMap, objectGroup: cc.TiledObjectGroup) {
        const oldRoot = this.node.getChildByName(this.generatedRootName);
        if (oldRoot) {
            oldRoot.destroy();
        }

        this.coinSprites = [];
        const root = new cc.Node(this.generatedRootName);
        root.parent = this.node;
        root.setPosition(0, 0);
        root.zIndex = this.zIndex;

        const mapSize = tileMap.getMapSize();
        const tileSize = tileMap.getTileSize();
        const mapWidth = mapSize.width * tileSize.width;
        const mapHeight = mapSize.height * tileSize.height;
        const objects = this.getObjectsFromTmxXml(tileMap) || objectGroup.getObjects();

        for (let i = 0; i < objects.length; i++) {
            const object: any = objects[i];
            const objectX = Number(object.x);
            const objectY = Number(object.y);
            if (isNaN(objectX) || isNaN(objectY)) {
                continue;
            }

            const coinCenterX = this.getObjectCenterX(object, objectX);
            const coinBottomY = this.getObjectBottomY(object, objectY);
            const coinNode = new cc.Node('Coin_' + object.id);
            coinNode.parent = root;
            coinNode.setContentSize(this.coinWidth, this.coinHeight);
            coinNode.setAnchorPoint(0.5, 0.5);
            coinNode.setPosition(
                coinCenterX - mapWidth * this.node.anchorX,
                mapHeight * (1 - this.node.anchorY) - coinBottomY + this.coinHeight * 0.5
            );

            const sprite = coinNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
            sprite.spriteFrame = this.frames[0];
            this.coinSprites.push(sprite);

            this.addCoinCollider(coinNode);
        }
    }

    collectCoin(coinNode: cc.Node) {
        if (!cc.isValid(coinNode)) {
            return;
        }

        cc.systemEvent.emit('coin-collected');
        GameAudio.playSfxWithEngineVolume(this.coinSfxPath, this.getCoinSfxEngineVolume());
        this.playCollectEffect(coinNode.getPosition());
        this.removeCoinSprite(coinNode.getComponent(cc.Sprite));
        coinNode.destroy();
    }

    spawnCoinAtLocalBottom(centerX: number, bottomY: number, name: string = 'Coin_Dynamic') {
        if (this.frames.length === 0) {
            this.pendingSpawns.push({ centerX, bottomY, name });
            return null;
        }

        const root = this.getOrCreateRoot();
        const coinNode = new cc.Node(name);
        coinNode.parent = root;
        coinNode.setContentSize(this.coinWidth, this.coinHeight);
        coinNode.setAnchorPoint(0.5, 0.5);
        coinNode.setPosition(centerX, bottomY + this.coinHeight * 0.5);

        const sprite = coinNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        const frameIndex = Math.floor(this.animationTimer * this.framesPerSecond) % this.frames.length;
        sprite.spriteFrame = this.frames[frameIndex] || this.frames[0];
        this.coinSprites.push(sprite);

        this.addCoinCollider(coinNode);
        return coinNode;
    }

    private flushPendingSpawns() {
        if (this.pendingSpawns.length === 0) {
            return;
        }

        const spawns = this.pendingSpawns.slice();
        this.pendingSpawns = [];
        for (let i = 0; i < spawns.length; i++) {
            const spawn = spawns[i];
            this.spawnCoinAtLocalBottom(spawn.centerX, spawn.bottomY, spawn.name);
        }
    }

    private loadCollectEffectFrame() {
        cc.loader.loadRes(this.collectEffectAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(this.node)) {
                cc.warn('[CoinSpawner] Cannot load collect effect atlas: ' + this.collectEffectAtlasPath);
                return;
            }

            this.collectEffectFrame = atlas.getSpriteFrame(this.collectEffectFrameName)
                || atlas.getSpriteFrame(this.collectEffectFrameName.replace('.png', ''));
            if (!this.collectEffectFrame) {
                cc.warn('[CoinSpawner] Cannot find collect effect frame: ' + this.collectEffectFrameName);
            }
        });
    }

    private addCoinCollider(coinNode: cc.Node) {
        const body = coinNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;
        body.enabledContactListener = true;

        const collider = coinNode.addComponent(cc.PhysicsBoxCollider);
        collider.tag = this.coinColliderTag;
        collider.sensor = true;
        collider.size = cc.size(this.coinWidth, this.coinHeight);
        collider.apply();

        const collectible = coinNode.addComponent(CoinCollectible);
        collectible.setup(this);
    }

    private playCollectEffect(position: cc.Vec2) {
        if (!this.collectEffectFrame) {
            return;
        }

        const root = this.node.getChildByName(this.generatedRootName) || this.node;
        const effectNode = new cc.Node('CoinCollectEffect');
        effectNode.parent = root;
        effectNode.zIndex = this.zIndex + 1;
        effectNode.setPosition(position);
        effectNode.setContentSize(this.coinWidth, this.coinHeight);
        effectNode.setAnchorPoint(0.5, 0.5);

        const sprite = effectNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        sprite.spriteFrame = this.collectEffectFrame;

        effectNode.runAction(cc.sequence(
            cc.spawn(
                cc.fadeOut(this.collectEffectDuration),
                cc.moveBy(this.collectEffectDuration, 0, this.collectEffectRise)
            ),
            cc.callFunc(() => {
                if (cc.isValid(effectNode)) {
                    effectNode.destroy();
                }
            })
        ));
    }

    private removeCoinSprite(sprite: cc.Sprite) {
        const index = this.coinSprites.indexOf(sprite);
        if (index !== -1) {
            this.coinSprites.splice(index, 1);
        }
    }

    private getCoinSfxEngineVolume() {
        if (typeof this.coinSfxEngineVolume === 'number' && !isNaN(this.coinSfxEngineVolume) && this.coinSfxEngineVolume > 0) {
            return Math.max(0, Math.min(1, this.coinSfxEngineVolume));
        }

        const volume = typeof this.sfxVolume === 'number' && !isNaN(this.sfxVolume) ? this.sfxVolume : 100;
        const boost = typeof this.coinSfxBoost === 'number' && !isNaN(this.coinSfxBoost) && this.coinSfxBoost > 0
            ? this.coinSfxBoost
            : 1.5;

        return Math.max(0, Math.min(1, 0.1 * volume * boost / 100));
    }

    private getOrCreateRoot() {
        let root = this.node.getChildByName(this.generatedRootName);
        if (!root) {
            root = new cc.Node(this.generatedRootName);
            root.parent = this.node;
            root.setPosition(0, 0);
        }

        root.zIndex = this.zIndex;
        return root;
    }

    private getObjectCenterX(object: any, fallbackX: number) {
        const width = Number(object.width);
        if (!isNaN(width) && width > 0) {
            return fallbackX + width * 0.5;
        }

        return fallbackX;
    }

    private getObjectBottomY(object: any, fallbackY: number) {
        const height = Number(object.height);
        if (!isNaN(height) && height > 0) {
            return fallbackY + height;
        }

        return fallbackY;
    }

    private getObjectsFromTmxXml(tileMap: cc.TiledMap) {
        const tmxAsset: any = tileMap.tmxAsset;
        const tmxXmlStr = tmxAsset && (tmxAsset.tmxXmlStr || tmxAsset._tmxXmlStr);
        if (!tmxXmlStr || typeof DOMParser === 'undefined') {
            return null;
        }

        const xml = new DOMParser().parseFromString(tmxXmlStr, 'text/xml');
        const groups = xml.getElementsByTagName('objectgroup');
        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            if (group.getAttribute('name') !== this.objectGroupName) {
                continue;
            }

            const objects = group.getElementsByTagName('object');
            const result: any[] = [];
            for (let j = 0; j < objects.length; j++) {
                const object = objects[j];
                result.push({
                    id: object.getAttribute('id') || String(j),
                    x: object.getAttribute('x'),
                    y: object.getAttribute('y'),
                    width: object.getAttribute('width'),
                    height: object.getAttribute('height')
                });
            }

            return result;
        }

        return null;
    }
}
