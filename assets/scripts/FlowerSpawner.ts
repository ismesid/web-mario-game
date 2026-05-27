import FlowerEnemy from './FlowerEnemy';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FlowerSpawner extends cc.Component {
    @property
    objectGroupName: string = 'flowers';

    @property
    flowerAtlasPath: string = 'enemies/Flower';

    @property
    playerNodePath: string = 'Canvas/World/Player/mario_grouped_small.plist';

    @property
    frameNames: string = 'flower_0.png,flower_1.png';

    @property
    flowerWidth: number = 16;

    @property
    flowerHeight: number = 28;

    @property
    detectRangeX: number = 96;

    @property
    detectRangeY: number = 64;

    @property
    emergeDuration: number = 0.35;

    @property
    mouthFps: number = 8;

    @property
    mouthCycles: number = 2;

    @property
    retractDuration: number = 0.35;

    @property
    cooldownDuration: number = 1;

    @property
    enemyColliderTag: number = 3001;

    @property
    colliderWidth: number = 12;

    @property
    colliderHeight: number = 18;

    @property
    colliderOffsetY: number = 11;

    @property
    hiddenOffsetY: number = 2;

    @property
    zIndex: number = 480;

    private readonly generatedRootName = '__Flowers';

    onLoad() {
        this.scheduleOnce(() => this.rebuild(), 0);
    }

    rebuild() {
        const tileMap = this.getComponent(cc.TiledMap);
        if (!tileMap) {
            cc.warn('[FlowerSpawner] This node has no cc.TiledMap component.');
            return;
        }

        const objectGroup = tileMap.getObjectGroup(this.objectGroupName);
        if (!objectGroup) {
            cc.warn('[FlowerSpawner] Cannot find object group: ' + this.objectGroupName);
            return;
        }

        cc.loader.loadRes(this.flowerAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(this.node)) {
                cc.warn('[FlowerSpawner] Cannot load flower atlas: ' + this.flowerAtlasPath);
                return;
            }

            const frames = this.getFrames(atlas);
            if (frames.length === 0) {
                cc.warn('[FlowerSpawner] Flower atlas has no usable frames.');
                return;
            }

            this.buildFlowers(tileMap, objectGroup, frames);
        });
    }

    private buildFlowers(tileMap: cc.TiledMap, objectGroup: cc.TiledObjectGroup, frames: cc.SpriteFrame[]) {
        const oldRoot = this.node.getChildByName(this.generatedRootName);
        if (oldRoot) {
            oldRoot.destroy();
        }

        const root = new cc.Node(this.generatedRootName);
        root.parent = this.node;
        root.setPosition(0, 0);
        root.zIndex = this.zIndex;

        const player = cc.find(this.playerNodePath);
        if (!player) {
            cc.warn('[FlowerSpawner] Cannot find player node: ' + this.playerNodePath);
        }

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

            const centerX = this.getObjectCenterX(object, objectX);
            const bottomY = this.getObjectBottomY(object, objectY);
            const visibleY = mapHeight * (1 - this.node.anchorY) - bottomY;
            const hiddenY = visibleY - this.flowerHeight + this.hiddenOffsetY;
            const flowerNode = new cc.Node('Flower_' + object.id);
            flowerNode.parent = root;
            flowerNode.setContentSize(this.flowerWidth, this.flowerHeight);
            flowerNode.setAnchorPoint(0.5, 0);
            flowerNode.setPosition(centerX - mapWidth * this.node.anchorX, hiddenY);

            const sprite = flowerNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.trim = false;
            sprite.spriteFrame = frames[0];

            this.addFlowerCollider(flowerNode);

            const flower = flowerNode.addComponent(FlowerEnemy);
            flower.setup(
                player,
                frames,
                hiddenY,
                visibleY,
                this.detectRangeX,
                this.detectRangeY,
                this.emergeDuration,
                this.mouthFps,
                this.mouthCycles,
                this.retractDuration,
                this.cooldownDuration
            );
        }
    }

    private addFlowerCollider(flowerNode: cc.Node) {
        const body = flowerNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Kinematic;
        body.enabledContactListener = true;

        const collider = flowerNode.addComponent(cc.PhysicsBoxCollider);
        collider.tag = this.enemyColliderTag;
        collider.sensor = false;
        collider.offset = cc.v2(0, this.colliderOffsetY);
        collider.size = cc.size(this.colliderWidth, this.colliderHeight);
        collider.enabled = false;
        collider.apply();
    }

    private getFrames(atlas: cc.SpriteAtlas) {
        const names = this.frameNames
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        const frames: cc.SpriteFrame[] = [];

        for (let i = 0; i < names.length; i++) {
            const frame = atlas.getSpriteFrame(names[i]) || atlas.getSpriteFrame(names[i].replace('.png', ''));
            if (frame) {
                frames.push(frame);
            }
        }

        return frames;
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
