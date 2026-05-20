const { ccclass, property } = cc._decorator;

@ccclass
export default class GroundGenerator extends cc.Component {
    static readonly LEVEL_READY_EVENT = 'level-ready';

    @property
    sampleTileName: string = 'tiles_272';

    @property
    screenCount: number = 12;

    @property
    screenWidth: number = 960;

    @property
    tileScale: number = 3;

    @property
    colliderHeight: number = 48;

    @property
    waitForIntroReady: boolean = true;

    private readonly sourceTileSize = 16;
    private readonly generatedNodeName = 'GeneratedGround';
    private hasGenerated = false;
    private sampleTile: cc.Node = null;

    onLoad() {
        this.sampleTile = this.findSampleTile();
        if (this.sampleTile) {
            this.sampleTile.active = false;
        }

        if (this.waitForIntroReady) {
            cc.systemEvent.on('level-intro-ready', this.generateGround, this);
            return;
        }

        this.generateGround();
    }

    onDestroy() {
        cc.systemEvent.off('level-intro-ready', this.generateGround, this);
    }

    private generateGround() {
        if (this.hasGenerated) {
            return;
        }
        this.hasGenerated = true;

        const sampleTile = this.sampleTile || this.findSampleTile();
        if (!sampleTile) {
            cc.warn('[GroundGenerator] Cannot find sample tile: ' + this.sampleTileName);
            return;
        }

        const container = sampleTile.parent || this.node;
        const oldGround = container.getChildByName(this.generatedNodeName);
        if (oldGround) {
            oldGround.destroy();
        }

        const startX = sampleTile.x;
        const startY = sampleTile.y;
        sampleTile.active = false;

        const ground = new cc.Node(this.generatedNodeName);
        ground.parent = container;

        const step = this.sourceTileSize * this.tileScale;
        const tileCount = Math.max(3, Math.ceil((this.screenCount * this.screenWidth) / step));
        this.createGroundCollider(ground, startX, startY, tileCount, step);

        cc.loader.loadRes('tiles/tiles', cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(container)) {
                cc.warn('[GroundGenerator] Cannot load tiles atlas.');
                cc.systemEvent.emit(GroundGenerator.LEVEL_READY_EVENT);
                return;
            }

            const leftFrame = this.getAtlasFrame(atlas, 'tiles_271.png');
            const middleFrame = this.getAtlasFrame(atlas, 'tiles_272.png');
            const rightFrame = this.getAtlasFrame(atlas, 'tiles_273.png');

            if (!leftFrame || !middleFrame || !rightFrame) {
                cc.warn('[GroundGenerator] Missing ground tile frames.');
                cc.systemEvent.emit(GroundGenerator.LEVEL_READY_EVENT);
                return;
            }

            for (let i = 0; i < tileCount; i++) {
                const frame = i === 0 ? leftFrame : i === tileCount - 1 ? rightFrame : middleFrame;
                this.createTile(ground, frame, startX + i * step, startY);
            }

            cc.systemEvent.emit(GroundGenerator.LEVEL_READY_EVENT);
        });
    }

    private createTile(parent: cc.Node, frame: cc.SpriteFrame, x: number, y: number) {
        const tile = new cc.Node(frame.name || 'GroundTile');
        tile.parent = parent;
        tile.setPosition(x, y);
        tile.setScale(this.tileScale);

        const sprite = tile.addComponent(cc.Sprite);
        sprite.spriteFrame = frame;
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    private createGroundCollider(parent: cc.Node, startX: number, startY: number, tileCount: number, step: number) {
        const colliderNode = new cc.Node('GroundCollider');
        colliderNode.parent = parent;

        const width = tileCount * step;
        colliderNode.setPosition(startX + (tileCount - 1) * step * 0.5, startY);
        colliderNode.setContentSize(width, this.colliderHeight);

        const body = colliderNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        const collider = colliderNode.addComponent(cc.PhysicsBoxCollider);
        collider.size = cc.size(width, this.colliderHeight);
        collider.apply();
    }

    private getAtlasFrame(atlas: cc.SpriteAtlas, name: string) {
        return atlas.getSpriteFrame(name) || atlas.getSpriteFrame(name.replace('.png', ''));
    }

    private findSampleTile() {
        const searchRoot = this.node.parent || this.node;
        return this.findChildByName(searchRoot, this.sampleTileName);
    }

    private findChildByName(root: cc.Node, name: string): cc.Node {
        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.childrenCount; i++) {
            const found = this.findChildByName(root.children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}
