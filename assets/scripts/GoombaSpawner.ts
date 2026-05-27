import GoombaEnemy from './GoombaEnemy';

const { ccclass, property } = cc._decorator;

interface PlatformBounds {
    left: number;
    right: number;
}

@ccclass
export default class GoombaSpawner extends cc.Component {
    @property
    objectGroupName: string = 'enimes1';

    @property
    goombaAtlasPath: string = 'enemies/Goomba';

    @property
    playerNodePath: string = 'Canvas/World/Player/mario_grouped_small.plist';

    @property
    walkFrameName: string = 'Goomba_0.png';

    @property
    squashedFrameName: string = 'Goomba_1.png';

    @property
    angelFrameNames: string = 'Goomba_2.png,Goomba_3.png';

    @property
    ignoredLayerNames: string = 'background,no collide';

    @property
    vineLayerNames: string = 'vines';

    @property
    goombaWidth: number = 20;

    @property
    goombaHeight: number = 24;

    @property
    colliderWidth: number = 12;

    @property
    colliderHeight: number = 18;

    @property
    colliderOffsetY: number = 9;

    @property
    enemyColliderTag: number = 3002;

    @property
    coinColliderTag: number = 2002;

    @property
    activationDelay: number = 0.5;

    @property
    lostPlayerReturnDelay: number = 2;

    @property
    samePlaneToleranceY: number = 8;

    @property
    chaseSpeed: number = 55;

    @property
    returnSpeed: number = 45;

    @property
    walkFps: number = 6;

    @property
    stompBounceSpeed: number = 260;

    @property
    squashDuration: number = 0.18;

    @property
    flyDuration: number = 0.8;

    @property
    flyRise: number = 48;

    @property
    scoreValue: number = 200;

    @property
    platformEdgePadding: number = 4;

    @property
    surfaceProbeOffsetY: number = 1;

    @property
    surfaceSearchRows: number = 2;

    @property
    zIndex: number = 2000;

    @property
    stompSfxPath: string = 'audio/stomp';

    @property
    sfxVolume: number = 100;

    private readonly generatedRootName = '__Goombas';
    private readonly gidMask = 0x1fffffff;

    onLoad() {
        this.scheduleOnce(() => this.rebuild(), 0);
    }

    rebuild() {
        const tileMap = this.getComponent(cc.TiledMap);
        if (!tileMap) {
            cc.warn('[GoombaSpawner] This node has no cc.TiledMap component.');
            return;
        }

        const objectGroup = tileMap.getObjectGroup(this.objectGroupName);
        if (!objectGroup) {
            cc.warn('[GoombaSpawner] Cannot find object group: ' + this.objectGroupName);
            return;
        }

        cc.loader.loadRes(this.goombaAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(this.node)) {
                cc.warn('[GoombaSpawner] Cannot load Goomba atlas: ' + this.goombaAtlasPath);
                return;
            }

            const walkFrame = this.getFrame(atlas, this.walkFrameName);
            const squashedFrame = this.getFrame(atlas, this.squashedFrameName);
            const angelFrames = this.getFrames(atlas, this.angelFrameNames);
            if (!walkFrame) {
                cc.warn('[GoombaSpawner] Cannot find walk frame: ' + this.walkFrameName);
                return;
            }

            this.buildGoombas(tileMap, objectGroup, walkFrame, squashedFrame, angelFrames);
        });
    }

    private buildGoombas(
        tileMap: cc.TiledMap,
        objectGroup: cc.TiledObjectGroup,
        walkFrame: cc.SpriteFrame,
        squashedFrame: cc.SpriteFrame,
        angelFrames: cc.SpriteFrame[]
    ) {
        const oldRoot = this.getExistingRoot();
        if (oldRoot) {
            oldRoot.destroy();
        }

        const root = new cc.Node(this.generatedRootName);
        root.parent = this.node.parent || this.node;
        root.setPosition(root.parent === this.node ? cc.v2(0, 0) : this.node.getPosition());
        root.zIndex = this.zIndex;

        const player = cc.find(this.playerNodePath);
        if (!player) {
            cc.warn('[GoombaSpawner] Cannot find player node: ' + this.playerNodePath);
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
            const localX = centerX - mapWidth * this.node.anchorX;
            const localY = mapHeight * (1 - this.node.anchorY) - bottomY;
            const platform = this.findPlatformBounds(tileMap, centerX, bottomY, localX, mapWidth);
            const goombaNode = this.createGoombaNode(root, object.id || String(i), localX, localY, walkFrame);

            const enemy = goombaNode.addComponent(GoombaEnemy);
            const halfWidth = this.colliderWidth * 0.5;
            enemy.setup(
                player,
                goombaNode.getChildByName('Visual'),
                walkFrame,
                squashedFrame,
                angelFrames,
                localX,
                localY,
                platform.left + halfWidth + this.platformEdgePadding,
                platform.right - halfWidth - this.platformEdgePadding,
                this.activationDelay,
                this.lostPlayerReturnDelay,
                this.samePlaneToleranceY,
                this.chaseSpeed,
                this.returnSpeed,
                this.walkFps,
                this.stompBounceSpeed,
                this.squashDuration,
                this.flyDuration,
                this.flyRise,
                this.scoreValue,
                this.coinColliderTag,
                this.stompSfxPath,
                this.sfxVolume
            );
        }

        this.enforceTopRenderOrder(root);
    }

    private createGoombaNode(
        root: cc.Node,
        id: string,
        localX: number,
        localY: number,
        walkFrame: cc.SpriteFrame
    ) {
        const goombaNode = new cc.Node('Goomba_' + id);
        goombaNode.parent = root;
        goombaNode.zIndex = this.zIndex;
        goombaNode.setContentSize(this.goombaWidth, this.goombaHeight);
        goombaNode.setAnchorPoint(0.5, 0);
        goombaNode.setPosition(localX, localY);

        const visualNode = new cc.Node('Visual');
        visualNode.parent = goombaNode;
        visualNode.zIndex = this.zIndex;
        visualNode.setContentSize(this.goombaWidth, this.goombaHeight);
        visualNode.setAnchorPoint(0.5, 0);
        visualNode.setPosition(0, 0);

        const sprite = visualNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        sprite.trim = false;
        sprite.spriteFrame = walkFrame;

        const body = goombaNode.addComponent(cc.RigidBody);
        body.type = cc.RigidBodyType.Kinematic;
        body.enabledContactListener = true;
        body.fixedRotation = true;

        const collider = goombaNode.addComponent(cc.PhysicsBoxCollider);
        collider.tag = this.enemyColliderTag;
        collider.sensor = false;
        collider.offset = cc.v2(0, this.colliderOffsetY);
        collider.size = cc.size(this.colliderWidth, this.colliderHeight);
        collider.friction = 0;
        collider.apply();

        return goombaNode;
    }

    private enforceTopRenderOrder(root: cc.Node) {
        root.zIndex = this.zIndex;
        root.setSiblingIndex(root.parent.childrenCount - 1);
        this.scheduleOnce(() => {
            if (cc.isValid(root)) {
                root.zIndex = this.zIndex;
                root.setSiblingIndex(root.parent.childrenCount - 1);
            }
        }, 0);
    }

    private getExistingRoot() {
        const currentRoot = this.node.getChildByName(this.generatedRootName);
        if (currentRoot) {
            return currentRoot;
        }

        return this.node.parent ? this.node.parent.getChildByName(this.generatedRootName) : null;
    }

    private findPlatformBounds(
        tileMap: cc.TiledMap,
        centerX: number,
        bottomY: number,
        fallbackLocalX: number,
        mapWidth: number
    ): PlatformBounds {
        const tileSize = tileMap.getTileSize();
        const mapSize = tileMap.getMapSize();
        const centerCol = this.clampInt(Math.floor(centerX / tileSize.width), 0, mapSize.width - 1);
        const rowInfo = this.findSurfaceRow(tileMap, centerCol, bottomY);

        if (!rowInfo) {
            const fallbackHalfWidth = tileSize.width * 2;
            return {
                left: fallbackLocalX - fallbackHalfWidth,
                right: fallbackLocalX + fallbackHalfWidth
            };
        }

        let startCol = centerCol;
        let endCol = centerCol;
        while (startCol > 0 && this.hasWalkableTileAt(tileMap, startCol - 1, rowInfo.row, rowInfo.requireSurface)) {
            startCol--;
        }
        while (endCol < mapSize.width - 1 && this.hasWalkableTileAt(tileMap, endCol + 1, rowInfo.row, rowInfo.requireSurface)) {
            endCol++;
        }

        return {
            left: startCol * tileSize.width - mapWidth * this.node.anchorX,
            right: (endCol + 1) * tileSize.width - mapWidth * this.node.anchorX
        };
    }

    private findSurfaceRow(tileMap: cc.TiledMap, centerCol: number, bottomY: number) {
        const tileSize = tileMap.getTileSize();
        const mapSize = tileMap.getMapSize();
        const startRow = this.clampInt(
            Math.floor((bottomY + this.surfaceProbeOffsetY) / tileSize.height),
            0,
            mapSize.height - 1
        );

        for (let offset = 0; offset <= this.surfaceSearchRows; offset++) {
            const rows = offset === 0 ? [startRow] : [startRow + offset, startRow - offset];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (row < 0 || row >= mapSize.height) {
                    continue;
                }
                if (this.hasSurfaceAt(tileMap, centerCol, row)) {
                    return { row, requireSurface: true };
                }
            }
        }

        for (let offset = 0; offset <= this.surfaceSearchRows; offset++) {
            const rows = offset === 0 ? [startRow] : [startRow + offset, startRow - offset];
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                if (row < 0 || row >= mapSize.height) {
                    continue;
                }
                if (this.hasSolidTileAt(tileMap, centerCol, row)) {
                    return { row, requireSurface: false };
                }
            }
        }

        return null;
    }

    private hasWalkableTileAt(tileMap: cc.TiledMap, col: number, row: number, requireSurface: boolean) {
        return requireSurface ? this.hasSurfaceAt(tileMap, col, row) : this.hasSolidTileAt(tileMap, col, row);
    }

    private hasSurfaceAt(tileMap: cc.TiledMap, col: number, row: number) {
        return this.hasSolidTileAt(tileMap, col, row) && !this.hasSolidTileAt(tileMap, col, row - 1);
    }

    private hasSolidTileAt(tileMap: cc.TiledMap, col: number, row: number) {
        if (row < 0) {
            return false;
        }

        const ignoredNames = this.parseNameList(this.ignoredLayerNames);
        const vineNames = this.parseNameList(this.vineLayerNames);
        const layers = tileMap.getLayers();
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            if (!layer || !layer.node || !layer.node.active) {
                continue;
            }

            const layerName = layer.node.name;
            if (this.containsName(ignoredNames, layerName) || this.containsName(vineNames, layerName)) {
                continue;
            }

            if ((layer.getTileGIDAt(col, row) & this.gidMask) !== 0) {
                return true;
            }
        }

        return false;
    }

    private getFrame(atlas: cc.SpriteAtlas, name: string) {
        return atlas.getSpriteFrame(name) || atlas.getSpriteFrame(name.replace('.png', ''));
    }

    private getFrames(atlas: cc.SpriteAtlas, namesText: string) {
        const names = this.parseNameList(namesText);
        const frames: cc.SpriteFrame[] = [];
        for (let i = 0; i < names.length; i++) {
            const frame = this.getFrame(atlas, names[i]);
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

    private parseNameList(text: string) {
        if (!text) {
            return [];
        }

        return text
            .split(',')
            .map(name => name.trim())
            .filter(name => name.length > 0);
    }

    private containsName(names: string[], name: string) {
        return names.indexOf(name) !== -1;
    }

    private clampInt(value: number, min: number, max: number) {
        return Math.max(min, Math.min(max, Math.floor(value)));
    }
}
