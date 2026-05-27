import GameAudio from './GameAudio';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneChanger extends cc.Component {
    @property
    bgmVolume: number = 100;

    @property
    sceneBgmPath: string = '';

    @property
    defaultBgmPath: string = 'audio/bgm_1';

    @property
    gameBgmPath: string = 'audio/bgm_3';

    @property
    gameSceneName: string = 'MainGameScene';

    @property
    buttonSfxPath: string = 'audio/reserve';

    @property
    buttonSfxVolume: number = 100;

    @property
    mainGameTransitionDuration: number = 2;

    @property
    transitionMarioAtlasPath: string = 'player/mario_grouped_small';

    @property
    transitionWorldText: string = 'WORLD1';

    @property
    transitionYellowFontPath: string = 'fonts/yellow_font';

    @property
    transitionWorldFontSize: number = 192;

    @property
    transitionWorldYOffset: number = -60;

    private static currentBgmPath = '';
    private static targetBgmPath = '';
    private static loadingBgmPath = '';
    private static currentBgmClip: cc.AudioClip = null;
    private static bgmVolume = 100;
    private static maxBgmEngineVolume = 0.06;
    private static defaultBgmPath = 'audio/bgm_1';
    private static gameBgmPath = 'audio/bgm_3';
    private static gameSceneName = 'MainGameScene';
    private static hasSceneLaunchListener = false;
    private static hasAudioUnlockListener = false;
    private isTransitioning = false;
    private mainGameScenePreloaded = false;
    private mainGameTransitionTimeDone = false;

    onLoad() {
        SceneChanger.configureBgm(this.bgmVolume, this.defaultBgmPath, this.gameBgmPath, this.gameSceneName);
        SceneChanger.registerSceneLaunchListener();
        SceneChanger.registerAudioUnlockListener();
        GameAudio.preloadSfx(this.buttonSfxPath);
        SceneChanger.playBgmForScene(this.getCurrentSceneName(), this.sceneBgmPath);
    }

    goToLevelSelect() {
        this.playButtonSfx();
        this.loadSceneWithBgm('LevelSelectScene');
    }

    goToMainGame() {
        this.playButtonSfx();
        this.playMainGameTransition();
    }

    goToStart() {
        this.playButtonSfx();
        this.loadSceneWithBgm('StartScene');
    }

    public setVolume(volume: number) {
        SceneChanger.setBgmVolume(volume);
    }

    public static setBgmVolume(volume: number) {
        const safeVolume = typeof volume === 'number' && !isNaN(volume) ? volume : SceneChanger.bgmVolume;
        SceneChanger.bgmVolume = Math.max(0, Math.min(100, safeVolume));
        cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
    }

    private loadSceneWithBgm(sceneName: string) {
        cc.director.loadScene(sceneName, () => {
            SceneChanger.playBgmForScene(sceneName);
        });
    }

    private playButtonSfx() {
        GameAudio.playSfx(this.buttonSfxPath, this.buttonSfxVolume);
    }

    private playMainGameTransition() {
        if (this.isTransitioning) {
            return;
        }

        this.isTransitioning = true;
        this.mainGameScenePreloaded = false;
        this.mainGameTransitionTimeDone = false;
        SceneChanger.stopBgm();
        const overlay = this.createTransitionOverlay();
        cc.director.preloadScene('MainGameScene', null, (err: Error) => {
            if (err) {
                cc.warn('[SceneChanger] Cannot preload MainGameScene.');
            }

            this.mainGameScenePreloaded = true;
            this.tryFinishMainGameTransition(overlay);
        });
        this.scheduleOnce(() => {
            this.mainGameTransitionTimeDone = true;
            this.tryFinishMainGameTransition(overlay);
        }, Math.max(0.1, this.mainGameTransitionDuration));
    }

    private tryFinishMainGameTransition(overlay: cc.Node) {
        if (!this.isTransitioning || !this.mainGameScenePreloaded || !this.mainGameTransitionTimeDone) {
            return;
        }

        if (overlay && cc.isValid(overlay)) {
            overlay.destroy();
        }
        this.loadSceneWithBgm('MainGameScene');
    }

    private createTransitionOverlay() {
        const canvas = cc.find('Canvas') || this.node.parent;
        const overlay = new cc.Node('MainGameTransition');
        overlay.parent = canvas || this.node;
        overlay.zIndex = 99999;
        overlay.setAnchorPoint(0.5, 0.5);
        overlay.setContentSize(cc.winSize);
        overlay.setPosition(0, 0);
        overlay.addComponent(cc.BlockInputEvents);

        const graphics = overlay.addComponent(cc.Graphics);
        graphics.fillColor = cc.Color.BLACK;
        graphics.fillRect(-cc.winSize.width * 0.5, -cc.winSize.height * 0.5, cc.winSize.width, cc.winSize.height);

        const row = this.createTransitionRow(overlay);
        this.createTransitionMario(row);
        this.createTransitionWorldText(row);
        return overlay;
    }

    private createTransitionRow(parent: cc.Node) {
        const row = new cc.Node('TransitionContent');
        row.parent = parent;
        row.setAnchorPoint(0.5, 0.5);
        row.setPosition(0, 0);
        row.setContentSize(780, 220);
        return row;
    }

    private createTransitionWorldText(parent: cc.Node) {
        const labelNode = new cc.Node('WorldText');
        labelNode.parent = parent;
        labelNode.setAnchorPoint(0.5, 0.5);
        labelNode.setPosition(85, this.transitionWorldYOffset);
        labelNode.setContentSize(620, 220);

        const label = labelNode.addComponent(cc.Label);
        label.string = this.transitionWorldText;
        label.fontSize = this.transitionWorldFontSize;
        label.lineHeight = this.transitionWorldFontSize;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        labelNode.color = cc.Color.WHITE;

        cc.loader.loadRes(this.transitionYellowFontPath, cc.BitmapFont, (err: Error, font: cc.BitmapFont) => {
            if (!err && font && cc.isValid(labelNode)) {
                label.font = font;
            }
        });
    }

    private createTransitionMario(parent: cc.Node) {
        const marioNode = new cc.Node('RunningMario');
        marioNode.parent = parent;
        marioNode.setAnchorPoint(0.5, 0.5);
        marioNode.setPosition(-190, 0);
        marioNode.setContentSize(18, 18);
        marioNode.scale = 7;

        const sprite = marioNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        cc.loader.loadRes(this.transitionMarioAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(marioNode)) {
                cc.warn('[SceneChanger] Cannot load transition Mario atlas: ' + this.transitionMarioAtlasPath);
                return;
            }

            const frames = [
                atlas.getSpriteFrame('walk_0.png') || atlas.getSpriteFrame('walk_0'),
                atlas.getSpriteFrame('walk_1.png') || atlas.getSpriteFrame('walk_1'),
                atlas.getSpriteFrame('walk_2.png') || atlas.getSpriteFrame('walk_2'),
                atlas.getSpriteFrame('walk_3.png') || atlas.getSpriteFrame('walk_3')
            ].filter(frame => !!frame);

            if (frames.length === 0) {
                cc.warn('[SceneChanger] Cannot find transition Mario walk frames.');
                return;
            }

            let frameIndex = 0;
            sprite.spriteFrame = frames[0];
            marioNode.runAction(cc.repeatForever(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(() => {
                    if (!cc.isValid(sprite)) {
                        return;
                    }
                    frameIndex = (frameIndex + 1) % frames.length;
                    sprite.spriteFrame = frames[frameIndex];
                })
            )));
        });
    }

    private getCurrentSceneName() {
        const scene = cc.director.getScene();
        return scene ? scene.name : '';
    }

    private static configureBgm(volume: number, defaultBgmPath: string, gameBgmPath: string, gameSceneName: string) {
        SceneChanger.setBgmVolume(volume);
        SceneChanger.defaultBgmPath = defaultBgmPath || SceneChanger.defaultBgmPath;
        SceneChanger.gameBgmPath = gameBgmPath || SceneChanger.gameBgmPath;
        SceneChanger.gameSceneName = gameSceneName || SceneChanger.gameSceneName;
    }

    private static registerSceneLaunchListener() {
        if (SceneChanger.hasSceneLaunchListener) {
            return;
        }

        SceneChanger.hasSceneLaunchListener = true;
        cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, SceneChanger.onSceneLaunched, SceneChanger);
    }

    private static onSceneLaunched() {
        const scene = cc.director.getScene();
        SceneChanger.playBgmForScene(scene ? scene.name : '');
    }

    public static playBgmForScene(sceneName: string, overridePath: string = '') {
        const bgmPath = overridePath || (sceneName === SceneChanger.gameSceneName
            ? SceneChanger.gameBgmPath
            : SceneChanger.defaultBgmPath);
        SceneChanger.playBgm(bgmPath);
    }

    public static playBgmForCurrentScene() {
        const scene = cc.director.getScene();
        const sceneName = scene ? scene.name : '';
        const bgmPath = sceneName === SceneChanger.gameSceneName
            ? SceneChanger.gameBgmPath
            : SceneChanger.defaultBgmPath;
        SceneChanger.playBgm(bgmPath, true);
    }

    public static resumeBgmForCurrentScene() {
        const scene = cc.director.getScene();
        const sceneName = scene ? scene.name : '';
        const bgmPath = sceneName === SceneChanger.gameSceneName
            ? SceneChanger.gameBgmPath
            : SceneChanger.defaultBgmPath;

        if (SceneChanger.currentBgmPath === bgmPath && SceneChanger.currentBgmClip) {
            cc.audioEngine.resumeMusic();
            cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
            return;
        }

        SceneChanger.playBgm(bgmPath);
    }

    private static playBgm(bgmPath: string, forceRestart: boolean = false) {
        if (!bgmPath) {
            return;
        }

        SceneChanger.targetBgmPath = bgmPath;
        if (forceRestart && SceneChanger.currentBgmPath === bgmPath && SceneChanger.currentBgmClip) {
            SceneChanger.restartCurrentBgm();
            return;
        }

        if (!forceRestart && SceneChanger.currentBgmPath === bgmPath) {
            SceneChanger.loadingBgmPath = '';
            cc.audioEngine.resumeMusic();
            cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
            return;
        }

        if (SceneChanger.loadingBgmPath === bgmPath) {
            cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
            return;
        }

        SceneChanger.loadingBgmPath = bgmPath;
        cc.loader.loadRes(bgmPath, cc.AudioClip, (err: Error, clip: cc.AudioClip) => {
            if (SceneChanger.loadingBgmPath !== bgmPath) {
                return;
            }

            SceneChanger.loadingBgmPath = '';
            if (err || !clip) {
                cc.warn('[SceneChanger] Cannot load BGM: ' + bgmPath);
                return;
            }

            cc.audioEngine.stopMusic();
            SceneChanger.currentBgmPath = bgmPath;
            SceneChanger.currentBgmClip = clip;
            cc.audioEngine.playMusic(clip, true);
            cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
        });
    }

    private static restartCurrentBgm() {
        if (!SceneChanger.currentBgmClip) {
            return;
        }

        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(SceneChanger.currentBgmClip, true);
        cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
    }

    public static stopBgm() {
        SceneChanger.loadingBgmPath = '';
        cc.audioEngine.stopMusic();
    }

    public static pauseBgm() {
        SceneChanger.loadingBgmPath = '';
        cc.audioEngine.pauseMusic();
    }

    private static getEngineBgmVolume() {
        if (SceneChanger.bgmVolume <= 1) {
            return Math.max(0, Math.min(1, SceneChanger.bgmVolume));
        }

        return SceneChanger.maxBgmEngineVolume * SceneChanger.bgmVolume / 100;
    }

    private static registerAudioUnlockListener() {
        if (SceneChanger.hasAudioUnlockListener || typeof document === 'undefined') {
            return;
        }

        SceneChanger.hasAudioUnlockListener = true;
        document.addEventListener('pointerdown', SceneChanger.unlockAudioByUserGesture, true);
        document.addEventListener('mousedown', SceneChanger.unlockAudioByUserGesture, true);
        document.addEventListener('touchstart', SceneChanger.unlockAudioByUserGesture, true);
        document.addEventListener('keydown', SceneChanger.unlockAudioByUserGesture, true);
    }

    private static unlockAudioByUserGesture() {
        cc.audioEngine.resumeMusic();
        if (SceneChanger.targetBgmPath) {
            SceneChanger.playBgm(SceneChanger.targetBgmPath, true);
        }

        if (typeof document !== 'undefined') {
            document.removeEventListener('pointerdown', SceneChanger.unlockAudioByUserGesture, true);
            document.removeEventListener('mousedown', SceneChanger.unlockAudioByUserGesture, true);
            document.removeEventListener('touchstart', SceneChanger.unlockAudioByUserGesture, true);
            document.removeEventListener('keydown', SceneChanger.unlockAudioByUserGesture, true);
        }
    }
}
