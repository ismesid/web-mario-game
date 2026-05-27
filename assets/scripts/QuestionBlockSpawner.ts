import QuestionBlock from './QuestionBlock';
import CoinSpawner from './CoinSpawner';
import GameAudio from './GameAudio';

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuestionBlockSpawner extends cc.Component {
    @property
    objectGroupName: string = 'questions';

    @property
    questionTexturePath: string = 'question_blocks/question_spin';

    @property
    usedTexturePath: string = 'question_blocks/question_used';

    @property
    blockWidth: number = 16;

    @property
    blockHeight: number = 16;

    @property
    frameCount: number = 4;

    @property
    framesPerSecond: number = 7;

    @property
    zIndex: number = 450;

    @property
    bumpDistance: number = 4;

    @property
    bumpDuration: number = 0.08;

    @property
    hitHorizontalInset: number = 4;

    @property
    spawnCoinOnHit: boolean = true;

    @property
    coinSurfaceOffsetY: number = 0;

    @property
    maxSurfaceSearchHeight: number = 160;

    @property
    kickSfxPath: string = 'audio/kick';

    @property
    kickSfxVolume: number = 100;

    private readonly generatedRootName = '__QuestionBlocks';
    private readonly tileMapColliderRootName = '__TileMapColliders';
    private readonly surfaceEpsilon = 0.5;
    private questionFrames: cc.SpriteFrame[] = [];
    private usedFrame: cc.SpriteFrame = null;
    private activeSprites: cc.Sprite[] = [];
    private animationTimer = 0;
    private mapTopY = 0;

    onLoad() {
        GameAudio.preloadSfx(this.kickSfxPath);
        this.scheduleOnce(() => this.rebuild(), 0);
    }

    update(dt: number) {
        if (this.questionFrames.length === 0 || this.activeSprites.length === 0) {
            return;
        }

        this.animationTimer += dt;
        const frameIndex = Math.floor(this.animationTimer * this.framesPerSecond) % this.questionFrames.length;
        const frame = this.questionFrames[frameIndex];

        for (let i = 0; i < this.activeSprites.length; i++) {
            if (cc.isValid(this.activeSprites[i])) {
                this.activeSprites[i].spriteFrame = frame;
            }
        }
    }

    rebuild() {
        const tileMap = this.getComponent(cc.TiledMap);
        if (!tileMap) {
            cc.warn('[QuestionBlockSpawner] This node has no cc.TiledMap component.');
            return;
        }

        const objectGroup = tileMap.getObjectGroup(this.objectGroupName);
        if (!objectGroup) {
            cc.warn('[QuestionBlockSpawner] Cannot find object group: ' + this.objectGroupName);
            return;
        }

        let pending = 2;
        const done = () => {
            pending--;
            if (pending === 0 && cc.isValid(this.node)) {
                if (this.questionFrames.length === 0 || !this.usedFrame) {
                    cc.warn('[QuestionBlockSpawner] Missing question block frames.');
                    return;
                }

                this.buildBlocks(tileMap, objectGroup);
            }
        };

        cc.loader.loadRes(this.questionTexturePath, cc.Texture2D, (err: Error, texture: cc.Texture2D) => {
            if (err || !texture) {
                cc.warn('[QuestionBlockSpawner] Cannot load question texture: ' + this.questionTexturePath);
                done();
                return;
            }

            this.questionFrames = this.createFrames(texture);
            done();
        });

        cc.loader.loadRes(this.usedTexturePath, cc.Texture2D, (err: Error, texture: cc.Texture2D) => {
            if (err || !texture) {
                cc.warn('[QuestionBlockSpawner] Cannot load used texture: ' + this.usedTexturePath);
                done();
                return;
            }

            this.usedFrame = new cc.SpriteFrame(texture, cc.rect(0, 0, this.blockWidth, this.blockHeight));
            done();
        });
    }

    hitQuestionBlock(blockNode: cc.Node) {
        if (!cc.isValid(blockNode)) {
            return;
        }

        const sprite = blockNode.getComponent(cc.Sprite);
        this.removeActiveSprite(sprite);

        if (sprite && this.usedFrame) {
            sprite.spriteFrame = this.usedFrame;
        }

        const block = blockNode.getComponent(QuestionBlock);
        if (block) {
            block.markUsed();
        }

        if (this.spawnCoinOnHit && this.spawnCoinAboveBlock(blockNode)) {
            GameAudio.playSfx(this.kickSfxPath, this.kickSfxVolume);
        }

        this.playBump(blockNode);
    }

    private createFrames(texture: cc.Texture2D) {
        const frames: cc.SpriteFrame[] = [];
        for (let i = 0; i < this.frameCount; i++) {
            frames.push(new cc.SpriteFrame(
                texture,
                cc.rect(i * this.blockWidth, 0, this.blockWidth, this.blockHeight)
            ));
        }

        return frames;
    }

    private buildBlocks(tileMap: cc.TiledMap, objectGroup: cc.TiledObjectGroup) {
        const oldRoot = this.node.getChildByName(this.generatedRootName);
        if (oldRoot) {
            oldRoot.destroy();
        }

        this.activeSprites = [];
        const root = new cc.Node(this.generatedRootName);
        root.parent = this.node;
        root.setPosition(0, 0);
        root.zIndex = this.zIndex;

        const mapSize = tileMap.getMapSize();
        const tileSize = tileMap.getTileSize();
        const mapWidth = mapSize.width * tileSize.width;
        const mapHeight = mapSize.height * tileSize.height;
        this.mapTopY = mapHeight * (1 - this.node.anchorY);
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
            const blockNode = new cc.Node('QuestionBlock_' + object.id);
            blockNode.parent = root;
            blockNode.setContentSize(this.blockWidth, this.blockHeight);
            blockNode.setAnchorPoint(0.5, 0.5);
            blockNode.setPosition(
                centerX - mapWidth * this.node.anchorX,
                mapHeight * (1 - this.node.anchorY) - bottomY + this.blockHeight * 0.5
            );

            const sprite = blockNode.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.RAW;
            sprite.trim = false;
            sprite.spriteFrame = this.questionFrames[0];
            this.activeSprites.push(sprite);

            this.addBlockCollider(blockNode);
        }
    }

    private addBlockCollider(blockNode: cc.Node) {
        const body = blockNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;
        body.enabledContactListener = true;

        const collider = blockNode.addComponent(cc.PhysicsBoxCollider);
        collider.tag = 0;
        collider.sensor = false;
        collider.size = cc.size(this.blockWidth, this.blockHeight);
        collider.apply();

        const questionBlock = blockNode.addComponent(QuestionBlock);
        questionBlock.setup(this, this.hitHorizontalInset);
    }

    private playBump(blockNode: cc.Node) {
        const start = blockNode.getPosition();
        blockNode.stopAllActions();
        blockNode.runAction(cc.sequence(
            cc.moveTo(this.bumpDuration, start.x, start.y + this.bumpDistance),
            cc.moveTo(this.bumpDuration, start.x, start.y)
        ));
    }

    private spawnCoinAboveBlock(blockNode: cc.Node) {
        const coinSpawner = this.getComponent(CoinSpawner);
        if (!coinSpawner) {
            cc.warn('[QuestionBlockSpawner] Cannot spawn question coin without CoinSpawner on the same tile map node.');
            return false;
        }

        const blockTop = blockNode.y + this.blockHeight * 0.5;
        const maxCoinBottomY = this.mapTopY - coinSpawner.coinHeight - this.coinSurfaceOffsetY;
        const surfaceTop = this.findNearestSurfaceTop(blockNode.x, blockTop, blockNode, maxCoinBottomY);
        if (surfaceTop === null) {
            cc.warn('[QuestionBlockSpawner] Cannot spawn question coin inside map bounds: ' + blockNode.name);
            return false;
        }

        const coinBottomY = surfaceTop + this.coinSurfaceOffsetY;
        return !!coinSpawner.spawnCoinAtLocalBottom(blockNode.x, coinBottomY, 'QuestionCoin_' + blockNode.name);
    }

    private findNearestSurfaceTop(centerX: number, blockTop: number, sourceBlock: cc.Node, maxCoinBottomY: number) {
        const rects = this.collectSolidRects(sourceBlock, blockTop);
        const skipped: boolean[] = [];

        while (true) {
            let startIndex = -1;
            let bestSurfaceBottom = Number.POSITIVE_INFINITY;

            for (let i = 0; i < rects.length; i++) {
                const rect = rects[i];
                if (
                    skipped[i]
                    || centerX < rect.left - this.surfaceEpsilon
                    || centerX > rect.right + this.surfaceEpsilon
                    || rect.top <= blockTop + this.surfaceEpsilon
                    || rect.bottom < blockTop - this.surfaceEpsilon
                    || rect.bottom > blockTop + this.maxSurfaceSearchHeight
                    || rect.bottom >= bestSurfaceBottom
                ) {
                    continue;
                }

                startIndex = i;
                bestSurfaceBottom = rect.bottom;
            }

            if (startIndex === -1) {
                return blockTop <= maxCoinBottomY + this.surfaceEpsilon ? blockTop : null;
            }

            const component = this.collectConnectedComponent(rects, startIndex);
            const componentTop = this.getComponentTop(rects, component);
            if (componentTop <= maxCoinBottomY + this.surfaceEpsilon) {
                return componentTop;
            }

            for (let i = 0; i < component.length; i++) {
                skipped[component[i]] = true;
            }
        }
    }

    private getLocalColliderRect(collider: cc.PhysicsBoxCollider) {
        const node = collider.node;
        const offset = collider.offset || cc.v2(0, 0);
        const size = collider.size || node.getContentSize();
        const center = node.getPosition().add(offset);
        const left = center.x - size.width * 0.5;
        const right = center.x + size.width * 0.5;
        const bottom = center.y - size.height * 0.5;
        const top = center.y + size.height * 0.5;

        return { left, right, bottom, top };
    }

    private collectSolidRects(excludedNode: cc.Node, minTop: number) {
        const rects = [];
        this.collectSolidRectsFromRoot(this.tileMapColliderRootName, excludedNode, minTop, rects);
        this.collectSolidRectsFromRoot(this.generatedRootName, excludedNode, minTop, rects);
        return rects;
    }

    private collectSolidRectsFromRoot(rootName: string, excludedNode: cc.Node, minTop: number, rects: any[]) {
        const root = this.node.getChildByName(rootName);
        if (!root) {
            return;
        }

        for (let i = 0; i < root.children.length; i++) {
            const candidate = root.children[i];
            if (!candidate.active || candidate === excludedNode) {
                continue;
            }

            const collider = candidate.getComponent(cc.PhysicsBoxCollider);
            if (!collider || collider.sensor) {
                continue;
            }

            const rect = this.getLocalColliderRect(collider);
            if (rect.top > minTop + this.surfaceEpsilon) {
                rects.push(rect);
            }
        }
    }

    private collectConnectedComponent(rects: any[], startIndex: number) {
        const visited: boolean[] = [];
        const queue = [startIndex];
        visited[startIndex] = true;

        for (let i = 0; i < queue.length; i++) {
            const current = rects[queue[i]];

            for (let j = 0; j < rects.length; j++) {
                if (visited[j] || !this.rectsTouchOrOverlap(current, rects[j])) {
                    continue;
                }

                visited[j] = true;
                queue.push(j);
            }
        }

        return queue;
    }

    private getComponentTop(rects: any[], component: number[]) {
        let top = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < component.length; i++) {
            top = Math.max(top, rects[component[i]].top);
        }

        return top;
    }

    private rectsTouchOrOverlap(a: any, b: any) {
        return a.left <= b.right + this.surfaceEpsilon
            && b.left <= a.right + this.surfaceEpsilon
            && a.bottom <= b.top + this.surfaceEpsilon
            && b.bottom <= a.top + this.surfaceEpsilon;
    }

    private removeActiveSprite(sprite: cc.Sprite) {
        const index = this.activeSprites.indexOf(sprite);
        if (index !== -1) {
            this.activeSprites.splice(index, 1);
        }
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
