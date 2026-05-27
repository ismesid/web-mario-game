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
        this.loadSceneWithBgm('MainGameScene');
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

    private static playBgmForScene(sceneName: string, overridePath: string = '') {
        const bgmPath = overridePath || (sceneName === SceneChanger.gameSceneName
            ? SceneChanger.gameBgmPath
            : SceneChanger.defaultBgmPath);
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
