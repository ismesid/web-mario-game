const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimatedTileBackground extends cc.Component {
    @property(cc.Node)
    introRoot: cc.Node = null;

    @property
    atlasPath: string = 'tiles/tiles';

    @property
    frameNames: string = 'tiles_570.png,tiles_571.png,tiles_572.png,tiles_573.png';

    @property
    tileScale: number = 3;

    @property
    frameInterval: number = 0.12;

    @property
    fillWidth: number = 960;

    @property
    fillHeight: number = 640;

    @property
    hideParentOnLevelReady: boolean = true;

    @property
    minDisplayTime: number = 1.2;

    @property
    fadeDuration: number = 0.35;

    @property
    startLevelWhenReady: boolean = true;

    private frames: cc.SpriteFrame[] = [];
    private sprites: cc.Sprite[] = [];
    private elapsed = 0;
    private frameIndex = 0;
    private startTime = 0;
    private isLevelReady = false;

    onLoad() {
        this.startTime = Date.now() / 1000;
        this.node.zIndex = 0;
        if (this.node.parent) {
            this.node.setSiblingIndex(0);
        }
        this.prepareIntroRoot();
        this.node.setContentSize(this.fillWidth, this.fillHeight);
        this.loadFrames();
        cc.systemEvent.emit('level-intro-start');
        cc.systemEvent.on('level-ready', this.onLevelReady, this);
    }

    onDestroy() {
        cc.systemEvent.off('level-ready', this.onLevelReady, this);
    }

    update(dt: number) {
        if (this.frames.length === 0 || this.sprites.length === 0) {
            return;
        }

        this.elapsed += dt;
        if (this.elapsed < this.frameInterval) {
            return;
        }

        this.elapsed = 0;
        this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        const frame = this.frames[this.frameIndex];

        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].spriteFrame = frame;
        }
    }

    private loadFrames() {
        cc.loader.loadRes(this.atlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(this.node)) {
                cc.warn('[AnimatedTileBackground] Cannot load atlas: ' + this.atlasPath);
                return;
            }

            this.frames = this.frameNames
                .split(',')
                .map(name => name.trim())
                .filter(name => name.length > 0)
                .map(name => this.getAtlasFrame(atlas, name))
                .filter(frame => !!frame);

            if (this.frames.length === 0) {
                cc.warn('[AnimatedTileBackground] No valid frames found.');
                return;
            }

            this.buildTiles();
            cc.systemEvent.emit('level-intro-visual-ready');
            if (this.startLevelWhenReady) {
                cc.systemEvent.emit('level-intro-ready');
            }
        });
    }

    private buildTiles() {
        this.node.removeAllChildren();
        this.sprites = [];

        const tileSize = 16 * this.tileScale;
        const columns = Math.ceil(this.fillWidth / tileSize) + 1;
        const rows = Math.ceil(this.fillHeight / tileSize) + 1;
        const startX = -this.fillWidth * 0.5 + tileSize * 0.5;
        const startY = this.fillHeight * 0.5 - tileSize * 0.5;

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const tile = new cc.Node('AnimatedWaterTile');
                tile.parent = this.node;
                tile.zIndex = 0;
                tile.setPosition(startX + column * tileSize, startY - row * tileSize);
                tile.setScale(this.tileScale);

                const sprite = tile.addComponent(cc.Sprite);
                sprite.spriteFrame = this.frames[0];
                sprite.sizeMode = cc.Sprite.SizeMode.RAW;
                this.sprites.push(sprite);
            }
        }
    }

    private prepareIntroRoot() {
        const root = this.getIntroRoot();
        if (!root) {
            return;
        }

        root.active = true;
        root.opacity = 255;
        root.zIndex = 9999;
        root.setPosition(0, 0);
        root.setContentSize(this.fillWidth, this.fillHeight);
    }

    private onLevelReady() {
        if (!this.hideParentOnLevelReady || this.isLevelReady) {
            return;
        }

        this.isLevelReady = true;
        const elapsed = Date.now() / 1000 - this.startTime;
        const remaining = Math.max(0, this.minDisplayTime - elapsed);
        this.scheduleOnce(() => this.hideIntroRoot(), remaining);
    }

    private hideIntroRoot() {
        const root = this.getIntroRoot();
        if (!root || !cc.isValid(root)) {
            return;
        }

        cc.tween(root)
            .to(this.fadeDuration, { opacity: 0 })
            .call(() => {
                root.active = false;
                root.opacity = 255;
            })
            .start();
    }

    private getIntroRoot() {
        if (this.introRoot && cc.isValid(this.introRoot)) {
            return this.introRoot;
        }

        if (this.node.name === 'LevelIntroUI') {
            return this.node;
        }

        if (this.node.parent && this.node.parent.name === 'LevelIntroUI') {
            return this.node.parent;
        }

        return cc.find('Canvas/LevelIntroUI');
    }

    private getAtlasFrame(atlas: cc.SpriteAtlas, name: string) {
        return atlas.getSpriteFrame(name) || atlas.getSpriteFrame(name.replace('.png', ''));
    }
}
