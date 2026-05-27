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

    onLoad() {
        this.targetNode = cc.find(this.targetNodePath);
        this.mapNode = cc.find(this.mapNodePath);
        this.initialPosition = cc.v2(this.node.x, this.node.y);
        this.yHomePosition = this.initialPosition.y;
        this.camera = this.getComponent(cc.Camera);
        this.applyCameraZoom();
    }

    start() {
        const nextPosition = this.getNextCameraPosition(false);
        if (nextPosition) {
            this.node.setPosition(nextPosition);
            this.yHomePosition = nextPosition.y;
        }
    }

    lateUpdate(dt: number) {
        this.applyCameraZoom();

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
                const minX = bounds.left + viewSize.width * 0.5;
                const maxX = bounds.right - viewSize.width * 0.5;
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

    private getVisibleWorldSize() {
        if (!this.useCameraVisibleSize || !this.camera || this.camera.zoomRatio <= 0) {
            return cc.size(this.viewWidth, this.viewHeight);
        }

        const visibleSize = cc.size(
            this.node.width || cc.view.getVisibleSize().width,
            this.node.height || cc.view.getVisibleSize().height
        );
        return cc.size(
            visibleSize.width / this.camera.zoomRatio,
            visibleSize.height / this.camera.zoomRatio
        );
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
