import GamePause from './GamePause';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    @property
    targetNodePath: string = 'Canvas/World/Player/mario_grouped_small.plist';

    @property
    mapNodePath: string = 'Canvas/World/Map/mario map';

    @property
    viewWidth: number = 640;

    @property
    viewHeight: number = 426.67;

    @property
    zoomRatio: number = 1.5;

    @property
    useCameraVisibleSize: boolean = true;

    @property
    showSideLetterbox: boolean = true;

    @property
    letterboxDesignWidth: number = 960;

    @property
    letterboxColor: cc.Color = cc.color(0, 0, 0, 255);

    @property
    letterboxZIndex: number = 100000;

    @property
    leftBoundsInset: number = 0;

    @property
    rightBoundsInset: number = 0;

    @property
    followX: boolean = true;

    @property
    followY: boolean = true;

    @property
    verticalOffset: number = 0;

    @property
    yDeadZone: number = 80;

    @property
    smoothTime: number = 0.08;

    @property
    ySmoothTime: number = 0.14;

    private targetNode: cc.Node = null;
    private mapNode: cc.Node = null;
    private initialPosition: cc.Vec2 = null;
    private camera: cc.Camera = null;
    private yHomePosition = 0;
    private leftLetterbox: cc.Node = null;
    private rightLetterbox: cc.Node = null;

    onLoad() {
        this.targetNode = cc.find(this.targetNodePath);
        this.mapNode = cc.find(this.mapNodePath);
        this.initialPosition = cc.v2(this.node.x, this.node.y);
        this.yHomePosition = this.initialPosition.y;
        this.camera = this.getComponent(cc.Camera);
        this.applyCameraZoom();
        this.applyCameraViewport();
    }

    start() {
        const nextPosition = this.getNextCameraPosition(false);
        if (nextPosition) {
            this.node.setPosition(nextPosition);
            this.yHomePosition = nextPosition.y;
        }
        this.updateSideLetterbox();
    }

    lateUpdate(dt: number) {
        this.applyCameraZoom();
        this.applyCameraViewport();
        this.updateSideLetterbox();

        if (GamePause.paused) {
            return;
        }

        const nextPosition = this.getNextCameraPosition(true);
        if (!nextPosition) {
            return;
        }

        const xT = this.smoothTime <= 0 ? 1 : Math.min(1, dt / this.smoothTime);
        const yT = this.ySmoothTime <= 0 ? 1 : Math.min(1, dt / this.ySmoothTime);
        this.node.x = this.node.x + (nextPosition.x - this.node.x) * xT;
        this.node.y = this.node.y + (nextPosition.y - this.node.y) * yT;
    }

    private getNextCameraPosition(useDeadZone: boolean) {
        if (!this.targetNode || !cc.isValid(this.targetNode)) {
            this.targetNode = cc.find(this.targetNodePath);
        }
        if (!this.mapNode || !cc.isValid(this.mapNode)) {
            this.mapNode = cc.find(this.mapNodePath);
        }
        if (!this.targetNode || !this.node.parent) {
            return null;
        }

        const targetWorld = this.targetNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const targetLocal = this.node.parent.convertToNodeSpaceAR(targetWorld);
        let nextX = this.followX ? targetLocal.x : this.initialPosition.x;
        let nextY = this.followY ? this.getDeadZoneY(targetLocal.y + this.verticalOffset, useDeadZone) : this.initialPosition.y;

        if (this.mapNode) {
            const bounds = this.getMapBoundsInCameraParent();
            if (bounds) {
                const viewSize = this.getVisibleWorldSize();
                const left = bounds.left + Math.max(0, this.leftBoundsInset);
                const right = bounds.right - Math.max(0, this.rightBoundsInset);
                const minX = left + viewSize.width * 0.5;
                const maxX = right - viewSize.width * 0.5;
                const minY = bounds.bottom + viewSize.height * 0.5;
                const maxY = bounds.top - viewSize.height * 0.5;

                nextX = this.clampToRange(nextX, minX, maxX);
                nextY = this.followY ? this.clampToRange(nextY, minY, maxY) : this.initialPosition.y;
            }
        }

        return cc.v2(nextX, nextY);
    }

    private getDeadZoneY(targetY: number, useDeadZone: boolean) {
        if (!useDeadZone || this.yDeadZone <= 0) {
            return targetY;
        }

        if (targetY > this.yHomePosition + this.yDeadZone) {
            return targetY - this.yDeadZone;
        }
        if (targetY < this.yHomePosition - this.yDeadZone) {
            return targetY + this.yDeadZone;
        }

        return this.yHomePosition;
    }

    private applyCameraZoom() {
        if (!this.camera) {
            this.camera = this.getComponent(cc.Camera);
        }
        if (this.camera && this.camera.zoomRatio !== this.zoomRatio) {
            this.camera.zoomRatio = this.zoomRatio;
        }
    }

    private applyCameraViewport() {
        if (!this.camera) {
            this.camera = this.getComponent(cc.Camera);
        }
        if (!this.camera) {
            return;
        }

        const frameSize = cc.view.getFrameSize();
        const shouldLetterbox = this.showSideLetterbox
            && this.letterboxDesignWidth > 0
            && frameSize.width > this.letterboxDesignWidth;
        const width = shouldLetterbox ? this.letterboxDesignWidth / frameSize.width : 1;
        const x = shouldLetterbox ? (1 - width) * 0.5 : 0;

        if (
            Math.abs(this.camera.rect.x - x) > 0.0001
            || Math.abs(this.camera.rect.width - width) > 0.0001
            || this.camera.rect.y !== 0
            || this.camera.rect.height !== 1
        ) {
            this.camera.rect = cc.rect(x, 0, width, 1);
        }
    }

    private updateSideLetterbox() {
        if (!this.showSideLetterbox || !this.camera || this.letterboxDesignWidth <= 0) {
            this.setLetterboxActive(false);
            return;
        }

        const visibleSize = this.getEffectiveVisibleSize();
        const zoom = this.camera.zoomRatio > 0 ? this.camera.zoomRatio : 1;
        const extraScreenWidth = Math.max(0, visibleSize.width - this.letterboxDesignWidth);
        const barWorldWidth = extraScreenWidth * 0.5 / zoom;

        if (barWorldWidth <= 0.5) {
            this.setLetterboxActive(false);
            return;
        }

        const visibleWorldWidth = visibleSize.width / zoom;
        const visibleWorldHeight = visibleSize.height / zoom;
        const paddedWidth = barWorldWidth + 2 / zoom;
        const paddedHeight = visibleWorldHeight + 4 / zoom;

        this.leftLetterbox = this.drawLetterbox(
            this.leftLetterbox,
            'LeftLetterbox',
            -visibleWorldWidth * 0.5 + barWorldWidth * 0.5,
            0,
            paddedWidth,
            paddedHeight
        );
        this.rightLetterbox = this.drawLetterbox(
            this.rightLetterbox,
            'RightLetterbox',
            visibleWorldWidth * 0.5 - barWorldWidth * 0.5,
            0,
            paddedWidth,
            paddedHeight
        );
    }

    private drawLetterbox(node: cc.Node, name: string, x: number, y: number, width: number, height: number) {
        if (!node || !cc.isValid(node)) {
            node = new cc.Node(name);
            node.parent = this.node;
            node.zIndex = this.letterboxZIndex;
            node.addComponent(cc.Graphics);
        }

        node.active = true;
        node.zIndex = this.letterboxZIndex;
        node.setPosition(x, y);

        const graphics = node.getComponent(cc.Graphics);
        graphics.clear();
        graphics.fillColor = this.letterboxColor || cc.color(0, 0, 0, 255);
        graphics.rect(-width * 0.5, -height * 0.5, width, height);
        graphics.fill();

        return node;
    }

    private setLetterboxActive(active: boolean) {
        if (this.leftLetterbox && cc.isValid(this.leftLetterbox)) {
            this.leftLetterbox.active = active;
        }
        if (this.rightLetterbox && cc.isValid(this.rightLetterbox)) {
            this.rightLetterbox.active = active;
        }
    }

    private getVisibleWorldSize() {
        if (!this.useCameraVisibleSize || !this.camera || this.camera.zoomRatio <= 0) {
            return cc.size(this.viewWidth, this.viewHeight);
        }

        const visibleSize = this.getEffectiveVisibleSize();
        return cc.size(
            visibleSize.width / this.camera.zoomRatio,
            visibleSize.height / this.camera.zoomRatio
        );
    }

    private getEffectiveVisibleSize() {
        const visibleSize = cc.view.getVisibleSize();
        if (this.showSideLetterbox && this.letterboxDesignWidth > 0) {
            return cc.size(Math.min(visibleSize.width, this.letterboxDesignWidth), visibleSize.height);
        }

        return visibleSize;
    }

    private getMapBoundsInCameraParent() {
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

    private clampToRange(value: number, min: number, max: number) {
        if (min > max) {
            return (min + max) * 0.5;
        }

        return Math.min(max, Math.max(min, value));
    }
}
