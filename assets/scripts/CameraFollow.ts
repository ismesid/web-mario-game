const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraFollow extends cc.Component {
    @property
    targetNodePath: string = 'Canvas/World/Player/mario_grouped_small.plist';

    @property
    mapNodePath: string = 'Canvas/World/Map/mario map';

    @property
    viewWidth: number = 960;

    @property
    viewHeight: number = 640;

    @property
    followX: boolean = true;

    @property
    followY: boolean = false;

    @property
    smoothTime: number = 0.08;

    private targetNode: cc.Node = null;
    private mapNode: cc.Node = null;
    private initialPosition: cc.Vec2 = null;

    onLoad() {
        this.targetNode = cc.find(this.targetNodePath);
        this.mapNode = cc.find(this.mapNodePath);
        this.initialPosition = cc.v2(this.node.x, this.node.y);
    }

    lateUpdate(dt: number) {
        if (!this.targetNode || !cc.isValid(this.targetNode)) {
            this.targetNode = cc.find(this.targetNodePath);
        }
        if (!this.mapNode || !cc.isValid(this.mapNode)) {
            this.mapNode = cc.find(this.mapNodePath);
        }
        if (!this.targetNode || !this.node.parent) {
            return;
        }

        const targetWorld = this.targetNode.convertToWorldSpaceAR(cc.v2(0, 0));
        const targetLocal = this.node.parent.convertToNodeSpaceAR(targetWorld);
        let nextX = this.followX ? targetLocal.x : this.initialPosition.x;
        let nextY = this.followY ? targetLocal.y : this.initialPosition.y;

        if (this.mapNode) {
            const bounds = this.getMapBoundsInCameraParent();
            if (bounds) {
                const minX = bounds.left + this.viewWidth * 0.5;
                const maxX = bounds.right - this.viewWidth * 0.5;
                const minY = bounds.bottom + this.viewHeight * 0.5;
                const maxY = bounds.top - this.viewHeight * 0.5;

                nextX = this.clampToRange(nextX, minX, maxX);
                nextY = this.followY ? this.clampToRange(nextY, minY, maxY) : this.initialPosition.y;
            }
        }

        const t = this.smoothTime <= 0 ? 1 : Math.min(1, dt / this.smoothTime);
        this.node.x = this.node.x + (nextX - this.node.x) * t;
        this.node.y = this.node.y + (nextY - this.node.y) * t;
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
