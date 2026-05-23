import { TILE_COLLISION_BOUNDS } from './TileCollisionBounds';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TileMapCollisionBuilder extends cc.Component {
    @property
    solidLayerNames: string = '*';

    @property
    ignoredLayerNames: string = 'no collide';

    @property
    vineLayerNames: string = 'vines';

    @property
    enableTopOnlyLayers: boolean = false;

    @property
    topOnlyLayerNames: string = '';

    @property
    solidColliderTag: number = 0;

    @property
    vineColliderTag: number = 1001;

    @property
    vineSensorExtraHeight: number = 16;

    @property
    alphaBoundsPadding: number = 0;

    @property
    topOnlyColliderHeight: number = 3;

    @property
    smoothTopOnlyComponents: boolean = true;

    @property
    smoothSurfaceHeightTolerance: number = 16;

    @property
    emitLevelReady: boolean = true;

    private readonly generatedRootName = '__TileMapColliders';
    private readonly gidMask = 0x1fffffff;
    private readonly flipHorizontal = 0x80000000;
    private readonly flipVertical = 0x40000000;

    onLoad() {
        this.scheduleOnce(() => this.rebuild(), 0);
    }

    rebuild() {
        const tileMap = this.getComponent(cc.TiledMap);
        if (!tileMap) {
            cc.warn('[TileMapCollisionBuilder] This node has no cc.TiledMap component.');
            return;
        }

        const oldRoot = this.node.getChildByName(this.generatedRootName);
        if (oldRoot) {
            oldRoot.destroy();
        }

        const root = new cc.Node(this.generatedRootName);
        root.parent = this.node;
        root.setPosition(0, 0);

        const ignoredNames = this.parseNameList(this.ignoredLayerNames);
        const vineNames = this.parseNameList(this.vineLayerNames);
        const topOnlyNames = this.enableTopOnlyLayers ? this.parseNameList(this.topOnlyLayerNames) : [];
        const solidNames = this.parseNameList(this.solidLayerNames);
        const useAllSolidLayers = solidNames.length === 0 || solidNames[0] === '*';
        const layers = tileMap.getLayers();

        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (!layer || !layer.node || !layer.node.active) {
                continue;
            }

            const layerName = layer.node.name;
            if (this.containsName(ignoredNames, layerName)) {
                continue;
            }

            if (this.containsName(vineNames, layerName)) {
                this.buildLayerColliders(tileMap, layer, root, true, false, this.vineColliderTag);
                continue;
            }

            if (useAllSolidLayers || this.containsName(solidNames, layerName)) {
                this.buildLayerColliders(
                    tileMap,
                    layer,
                    root,
                    false,
                    this.enableTopOnlyLayers && this.containsName(topOnlyNames, layerName),
                    this.solidColliderTag
                );
            }
        }

        if (this.emitLevelReady) {
            cc.systemEvent.emit('level-ready');
        }
    }

    private buildLayerColliders(
        tileMap: cc.TiledMap,
        layer: cc.TiledLayer,
        root: cc.Node,
        isSensor: boolean,
        isTopOnly: boolean,
        tag: number
    ) {
        const layerSize = layer.getLayerSize();
        const tileSize = tileMap.getTileSize();
        const rowRuns = [];

        if (isTopOnly && this.smoothTopOnlyComponents) {
            this.buildSmoothTopOnlyColliders(tileMap, layer, root, tag);
            return;
        }

        for (let y = 0; y < layerSize.height; y++) {
            let x = 0;

            while (x < layerSize.width) {
                const rawGid = layer.getTileGIDAt(x, y);
                if (rawGid === 0) {
                    x++;
                    continue;
                }

                const bounds = this.getTileBounds(rawGid, tileSize, isSensor, isTopOnly);
                if (!bounds) {
                    x++;
                    continue;
                }

                let runLength = 1;
                while (x + runLength < layerSize.width) {
                    const nextRawGid = layer.getTileGIDAt(x + runLength, y);
                    if (nextRawGid === 0) {
                        break;
                    }

                    const nextBounds = this.getTileBounds(nextRawGid, tileSize, isSensor, isTopOnly);
                    if (!nextBounds || !this.sameBounds(bounds, nextBounds)) {
                        break;
                    }

                    runLength++;
                }

                rowRuns.push({
                    tileX: x,
                    tileY: y,
                    runLength,
                    rowSpan: 1,
                    bounds
                });
                x += runLength;
            }
        }

        const mergedRuns = this.mergeVerticalRuns(rowRuns, tileSize);
        for (let i = 0; i < mergedRuns.length; i++) {
            const run = mergedRuns[i];
            this.createTileRunCollider(
                tileMap,
                layer.node.name,
                root,
                run.tileX,
                run.tileY,
                run.runLength,
                run.rowSpan,
                run.bounds,
                tileSize,
                isSensor,
                tag
            );
        }
    }

    private createTileRunCollider(
        tileMap: cc.TiledMap,
        layerName: string,
        root: cc.Node,
        tileX: number,
        tileY: number,
        runLength: number,
        rowSpan: number,
        bounds: [number, number, number, number],
        tileSize: cc.Size,
        isSensor: boolean,
        tag: number
    ) {
        const mapSize = tileMap.getMapSize();
        const mapWidth = mapSize.width * tileSize.width;
        const mapHeight = mapSize.height * tileSize.height;
        const width = bounds[2] + tileSize.width * (runLength - 1);
        const height = bounds[3] + tileSize.height * (rowSpan - 1);
        const x = tileX * tileSize.width + bounds[0] + width * 0.5 - mapWidth * this.node.anchorX;
        const y = mapHeight * (1 - this.node.anchorY) - tileY * tileSize.height - bounds[1] - height * 0.5;

        const colliderNode = new cc.Node((isSensor ? 'Vine' : 'Solid') + '_' + layerName);
        colliderNode.parent = root;
        colliderNode.setPosition(x, y);
        colliderNode.setContentSize(width, height);

        const body = colliderNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        const collider = colliderNode.addComponent(cc.PhysicsBoxCollider);
        collider.tag = tag;
        collider.sensor = isSensor;
        collider.size = cc.size(width, height);
        collider.apply();
    }

    private getTileBounds(
        rawGid: number,
        tileSize: cc.Size,
        isSensor: boolean,
        isTopOnly: boolean
    ): [number, number, number, number] | null {
        const unsignedGid = rawGid >>> 0;
        const cleanGid = rawGid & this.gidMask;
        const stored = TILE_COLLISION_BOUNDS[cleanGid] || [0, 0, tileSize.width, tileSize.height];
        let x = stored[0];
        let y = stored[1];
        let width = stored[2];
        let height = stored[3];

        if (unsignedGid & this.flipHorizontal) {
            x = tileSize.width - x - width;
        }
        if (unsignedGid & this.flipVertical) {
            y = tileSize.height - y - height;
        }

        if (this.alphaBoundsPadding > 0 && !isSensor) {
            x = Math.max(0, x - this.alphaBoundsPadding);
            y = Math.max(0, y - this.alphaBoundsPadding);
            width = Math.min(tileSize.width - x, width + this.alphaBoundsPadding * 2);
            height = Math.min(tileSize.height - y, height + this.alphaBoundsPadding * 2);
        }

        if (isSensor && this.vineSensorExtraHeight > 0) {
            const centerY = y + height * 0.5;
            height += this.vineSensorExtraHeight;
            y = centerY - height * 0.5;
        }

        if (isTopOnly) {
            height = Math.min(height, this.topOnlyColliderHeight);
        }

        if (width <= 0 || height <= 0) {
            return null;
        }

        return [x, y, width, height];
    }

    private sameBounds(a: [number, number, number, number], b: [number, number, number, number]) {
        return a[0] === b[0]
            && a[1] === b[1]
            && a[2] === b[2]
            && a[3] === b[3];
    }

    private mergeVerticalRuns(runs: any[], tileSize: cc.Size) {
        const merged = [];

        for (let i = 0; i < runs.length; i++) {
            const run = runs[i];
            let mergedIntoPrevious = false;

            if (run.bounds[1] === 0 && run.bounds[3] === tileSize.height) {
                for (let j = merged.length - 1; j >= 0; j--) {
                    const previous = merged[j];
                    if (
                        previous.tileX === run.tileX
                        && previous.runLength === run.runLength
                        && previous.tileY + previous.rowSpan === run.tileY
                        && this.sameBounds(previous.bounds, run.bounds)
                    ) {
                        previous.rowSpan++;
                        mergedIntoPrevious = true;
                        break;
                    }
                }
            }

            if (!mergedIntoPrevious) {
                merged.push(run);
            }
        }

        return merged;
    }

    private buildSmoothTopOnlyColliders(
        tileMap: cc.TiledMap,
        layer: cc.TiledLayer,
        root: cc.Node,
        tag: number
    ) {
        const layerSize = layer.getLayerSize();
        const tileSize = tileMap.getTileSize();
        const visited: boolean[] = [];

        for (let y = 0; y < layerSize.height; y++) {
            for (let x = 0; x < layerSize.width; x++) {
                const index = y * layerSize.width + x;
                if (visited[index] || layer.getTileGIDAt(x, y) === 0) {
                    continue;
                }

                const component = this.collectComponent(layer, x, y, visited);
                this.createSmoothSurfaceColliders(tileMap, layer, root, component, tileSize, tag);
            }
        }
    }

    private collectComponent(layer: cc.TiledLayer, startX: number, startY: number, visited: boolean[]) {
        const layerSize = layer.getLayerSize();
        const queue = [{ x: startX, y: startY }];
        const component = [];
        visited[startY * layerSize.width + startX] = true;

        for (let i = 0; i < queue.length; i++) {
            const current = queue[i];
            component.push(current);

            this.tryQueueComponentTile(layer, current.x + 1, current.y, visited, queue);
            this.tryQueueComponentTile(layer, current.x - 1, current.y, visited, queue);
            this.tryQueueComponentTile(layer, current.x, current.y + 1, visited, queue);
            this.tryQueueComponentTile(layer, current.x, current.y - 1, visited, queue);
        }

        return component;
    }

    private tryQueueComponentTile(layer: cc.TiledLayer, x: number, y: number, visited: boolean[], queue: any[]) {
        const layerSize = layer.getLayerSize();
        if (x < 0 || y < 0 || x >= layerSize.width || y >= layerSize.height) {
            return;
        }

        const index = y * layerSize.width + x;
        if (visited[index] || layer.getTileGIDAt(x, y) === 0) {
            return;
        }

        visited[index] = true;
        queue.push({ x, y });
    }

    private createSmoothSurfaceColliders(
        tileMap: cc.TiledMap,
        layer: cc.TiledLayer,
        root: cc.Node,
        component: any[],
        tileSize: cc.Size,
        tag: number
    ) {
        const columnTops: { [tileX: number]: number } = {};
        const mapSize = tileMap.getMapSize();
        const mapHeight = mapSize.height * tileSize.height;

        for (let i = 0; i < component.length; i++) {
            const tile = component[i];
            const rawGid = layer.getTileGIDAt(tile.x, tile.y);
            const bounds = this.getTileBounds(rawGid, tileSize, false, false);
            if (!bounds) {
                continue;
            }

            const top = mapHeight * (1 - this.node.anchorY) - tile.y * tileSize.height - bounds[1];
            if (columnTops[tile.x] === undefined || top > columnTops[tile.x]) {
                columnTops[tile.x] = top;
            }
        }

        const columns = Object.keys(columnTops).map(value => Number(value)).sort((a, b) => a - b);
        let groupStartIndex = 0;

        while (groupStartIndex < columns.length) {
            let groupEndIndex = groupStartIndex;
            let minTop = columnTops[columns[groupStartIndex]];
            let maxTop = minTop;

            while (groupEndIndex + 1 < columns.length && columns[groupEndIndex + 1] === columns[groupEndIndex] + 1) {
                const nextTop = columnTops[columns[groupEndIndex + 1]];
                const nextMin = Math.min(minTop, nextTop);
                const nextMax = Math.max(maxTop, nextTop);
                if (nextMax - nextMin > this.smoothSurfaceHeightTolerance) {
                    break;
                }

                groupEndIndex++;
                minTop = nextMin;
                maxTop = nextMax;
            }

            this.createTopSurfaceCollider(
                tileMap,
                layer.node.name,
                root,
                columns[groupStartIndex],
                columns[groupEndIndex],
                maxTop,
                tileSize,
                tag
            );
            groupStartIndex = groupEndIndex + 1;
        }
    }

    private createTopSurfaceCollider(
        tileMap: cc.TiledMap,
        layerName: string,
        root: cc.Node,
        startTileX: number,
        endTileX: number,
        top: number,
        tileSize: cc.Size,
        tag: number
    ) {
        const mapSize = tileMap.getMapSize();
        const mapWidth = mapSize.width * tileSize.width;
        const width = (endTileX - startTileX + 1) * tileSize.width;
        const height = this.topOnlyColliderHeight;
        const x = startTileX * tileSize.width + width * 0.5 - mapWidth * this.node.anchorX;
        const y = top - height * 0.5;

        const colliderNode = new cc.Node('Surface_' + layerName);
        colliderNode.parent = root;
        colliderNode.setPosition(x, y);
        colliderNode.setContentSize(width, height);

        const body = colliderNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Static;

        const collider = colliderNode.addComponent(cc.PhysicsBoxCollider);
        collider.tag = tag;
        collider.size = cc.size(width, height);
        collider.apply();
    }

    private parseNameList(value: string) {
        if (!value) {
            return [];
        }

        return value
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }

    private containsName(names: string[], target: string) {
        const normalizedTarget = target.toLowerCase();
        return names.some(name => name.toLowerCase() === normalizedTarget);
    }
}
