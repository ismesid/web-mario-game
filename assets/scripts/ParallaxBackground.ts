const { ccclass, property } = cc._decorator;

@ccclass
export default class ParallaxBackground extends cc.Component {
    @property
    backgroundSpritePath: string = 'pictures/map_background';

    @property
    mapNodePath: string = 'Canvas/World/Map/mario map';

    @property
    scrollFactorX: number = 0.16;

    @property
    scrollFactorY: number = 1;

    @property
    extraScale: number = 1.05;

    @property
    repeatHorizontally: boolean = true;

    @property
    followCameraY: boolean = true;

    @property
    verticalOffset: number = 0;

    @property
    opacity: number = 255;

    @property
    zIndex: number = -10000;

    private backgroundNode: cc.Node = null;
    private spriteFrame: cc.SpriteFrame = null;
    private camera: cc.Camera = null;
    private mapNode: cc.Node = null;
    private tileNodes: cc.Node[] = [];
    private tileWidth = 0;
    private tileHeight = 0;

    onLoad() {
        this.camera = this.getComponent(cc.Camera);
        this.mapNode = cc.find(this.mapNodePath);
        this.createBackgroundNode();
        this.loadBackground();
    }

    onDestroy() {
        if (this.backgroundNode && cc.isValid(this.backgroundNode)) {
            this.backgroundNode.destroy();
        }
    }

    lateUpdate() {
        if (!this.backgroundNode || !this.spriteFrame) {
            return;
        }

        this.updateBackgroundSize();
        this.updateBackgroundPosition();
    }

    private createBackgroundNode() {
        const parent = this.node.parent;
        if (!parent) {
            return;
        }

        this.backgroundNode = new cc.Node('ParallaxBackground');
        this.backgroundNode.parent = parent;
        this.backgroundNode.zIndex = this.zIndex;
        this.backgroundNode.opacity = this.opacity;
        this.backgroundNode.setAnchorPoint(0.5, 0.5);
    }

    private loadBackground() {
        cc.resources.load(this.backgroundSpritePath, cc.SpriteFrame, (error, spriteFrame: cc.SpriteFrame) => {
            if (error) {
                cc.warn('[ParallaxBackground] Cannot load background: ' + this.backgroundSpritePath);
                return;
            }

            this.spriteFrame = spriteFrame;
            this.updateBackgroundSize();
            this.updateBackgroundPosition();
        });
    }

    private updateBackgroundSize() {
        const visibleSize = this.getVisibleWorldSize();
        const bounds = this.getMapBoundsInCameraParent();
        const rawSize = this.getSpriteRawSize();
        if (!rawSize) {
            return;
        }

        const mapWidth = bounds ? bounds.right - bounds.left : visibleSize.width;
        const mapHeight = bounds ? bounds.top - bounds.bottom : visibleSize.height;
        const requiredHeight = this.followCameraY ? visibleSize.height : Math.max(mapHeight, visibleSize.height);
        const scale = requiredHeight / rawSize.height * this.extraScale;
        this.tileWidth = rawSize.width * scale;
        this.tileHeight = rawSize.height * scale;

        const requiredWidth = this.repeatHorizontally
            ? mapWidth + visibleSize.width * 2 + this.tileWidth * 2
            : Math.max(visibleSize.width, this.tileWidth);
        const tileCount = this.repeatHorizontally
            ? Math.max(1, Math.ceil(requiredWidth / this.tileWidth))
            : 1;
        const totalWidth = this.tileWidth * tileCount;

        this.ensureTileNodes(tileCount);
        this.backgroundNode.setContentSize(totalWidth, this.tileHeight);

        const left = -totalWidth * 0.5;
        for (let i = 0; i < this.tileNodes.length; i++) {
            const tileNode = this.tileNodes[i];
            tileNode.setContentSize(this.tileWidth, this.tileHeight);
            tileNode.setPosition(left + this.tileWidth * (i + 0.5), 0);
        }
    }

    private updateBackgroundPosition() {
        const visibleSize = this.getVisibleWorldSize();
        const bounds = this.getMapBoundsInCameraParent();
        const cameraPosition = cc.v2(this.node.x, this.node.y);

        if (!bounds || !this.repeatHorizontally) {
            this.backgroundNode.setPosition(cameraPosition.x, cameraPosition.y + this.verticalOffset);
            return;
        }

        const minCameraX = bounds.left + visibleSize.width * 0.5;
        const bgSize = this.backgroundNode.getContentSize();
        const cameraTravelX = Math.max(0, cameraPosition.x - minCameraX);
        const startLeft = bounds.left;
        const x = startLeft + bgSize.width * 0.5 + cameraTravelX * this.clamp01(this.scrollFactorX);
        const y = this.followCameraY
            ? cameraPosition.y
            : this.getParallaxCenter(
                cameraPosition.y,
                bounds.bottom + visibleSize.height * 0.5,
                bounds.top - visibleSize.height * 0.5,
                bounds.bottom + bgSize.height * 0.5,
                bounds.top - bgSize.height * 0.5,
                this.scrollFactorY
            );

        this.backgroundNode.setPosition(x, y + this.verticalOffset);
    }

    private ensureTileNodes(tileCount: number) {
        while (this.tileNodes.length < tileCount) {
            const tileNode = new cc.Node('BackgroundTile');
            tileNode.parent = this.backgroundNode;
            tileNode.setAnchorPoint(0.5, 0.5);

            const sprite = tileNode.addComponent(cc.Sprite);
            sprite.type = cc.Sprite.Type.SIMPLE;
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            sprite.spriteFrame = this.spriteFrame;

            this.tileNodes.push(tileNode);
        }

        while (this.tileNodes.length > tileCount) {
            const tileNode = this.tileNodes.pop();
            if (tileNode && cc.isValid(tileNode)) {
                tileNode.destroy();
            }
        }

        for (let i = 0; i < this.tileNodes.length; i++) {
            const sprite = this.tileNodes[i].getComponent(cc.Sprite);
            if (sprite && sprite.spriteFrame !== this.spriteFrame) {
                sprite.spriteFrame = this.spriteFrame;
            }
        }
    }

    private getParallaxCenter(
        cameraValue: number,
        minCamera: number,
        maxCamera: number,
        minBackground: number,
        maxBackground: number,
        scrollFactor: number
    ) {
        if (minCamera >= maxCamera) {
            return cameraValue;
        }

        const t = this.clamp01((cameraValue - minCamera) / (maxCamera - minCamera));
        const parallaxT = t * this.clamp01(scrollFactor);
        return minBackground + (maxBackground - minBackground) * parallaxT;
    }

    private getVisibleWorldSize() {
        const viewSize = cc.view.getVisibleSize();
        const zoom = this.camera && this.camera.zoomRatio > 0 ? this.camera.zoomRatio : 1;
        return cc.size(viewSize.width / zoom, viewSize.height / zoom);
    }

    private getMapBoundsInCameraParent() {
        if (!this.mapNode || !cc.isValid(this.mapNode)) {
            this.mapNode = cc.find(this.mapNodePath);
        }
        if (!this.mapNode || !this.node.parent) {
            return null;
        }

        const tileMap = this.mapNode.getComponent(cc.TiledMap);
        if (!tileMap) {
            return null;
        }

        const mapSize = tileMap.getMapSize();
        const tileSize = tileMap.getTileSize();
        const width = mapSize.width * tileSize.width;
        const height = mapSize.height * tileSize.height;
        const left = -width * this.mapNode.anchorX;
        const right = width * (1 - this.mapNode.anchorX);
        const bottom = -height * this.mapNode.anchorY;
        const top = height * (1 - this.mapNode.anchorY);
        const bottomLeft = this.node.parent.convertToNodeSpaceAR(this.mapNode.convertToWorldSpaceAR(cc.v2(left, bottom)));
        const topRight = this.node.parent.convertToNodeSpaceAR(this.mapNode.convertToWorldSpaceAR(cc.v2(right, top)));

        return {
            left: Math.min(bottomLeft.x, topRight.x),
            right: Math.max(bottomLeft.x, topRight.x),
            bottom: Math.min(bottomLeft.y, topRight.y),
            top: Math.max(bottomLeft.y, topRight.y)
        };
    }

    private getSpriteRawSize() {
        if (!this.spriteFrame) {
            return null;
        }

        const rect = this.spriteFrame.getRect();
        return cc.size(rect.width, rect.height);
    }

    private clamp01(value: number) {
        return Math.max(0, Math.min(1, value));
    }
}
