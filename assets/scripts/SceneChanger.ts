import GameAudio from './GameAudio';
import FirebaseService, { GameRunViewRecord } from './FirebaseService';

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

    @property
    startSceneName: string = 'StartScene';

    @property
    showLoginButtonOnStart: boolean = true;

    @property
    loginButtonText: string = 'LOGIN';

    @property
    loginButtonOffsetY: number = -110;

    @property
    loginButtonSpritePath: string = 'pictures/button_blue';

    @property
    loginButtonPressedSpritePath: string = 'pictures/button_blue_press';

    @property
    loginButtonHoverSpritePath: string = 'pictures/button_blue_hover';

    @property
    loginPopupButtonWidth: number = 210;

    @property
    loginPopupButtonHeight: number = 64;

    @property
    loginPopupFontSize: number = 90;

    @property
    loginPopupTitleFontSize: number = 90;

    @property
    levelSelectSceneName: string = 'LevelSelectScene';

    @property
    levelSelectBackButtonText: string = 'BACK';

    @property
    popupTimerSpritePath: string = 'pictures/timer';

    @property
    popupCoinTexturePath: string = 'coins/coin_spin';

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
    private static hasLoginInputStyle = false;
    private static readonly bgmVolumeStorageKey = 'webMarioGame.bgmVolume';
    private static readonly sfxVolumeStorageKey = 'webMarioGame.sfxVolume';
    private isTransitioning = false;
    private mainGameScenePreloaded = false;
    private mainGameTransitionTimeDone = false;
    private loginOverlay: cc.Node = null;
    private loginStatusRow: cc.Node = null;
    private loginEmailEditBox: cc.EditBox = null;
    private loginPasswordEditBox: cc.EditBox = null;
    private loginEmailPlaceholderLabel: cc.Label = null;
    private loginPasswordPlaceholderLabel: cc.Label = null;
    private loginEmailValueLabel: cc.Label = null;
    private loginPasswordValueLabel: cc.Label = null;
    private loginEmailInput: HTMLInputElement = null;
    private loginPasswordInput: HTMLInputElement = null;
    private loginEmailInputNode: cc.Node = null;
    private loginPasswordInputNode: cc.Node = null;
    private loginEmailValue = '';
    private loginPasswordValue = '';
    private levelSelectUiRoot: cc.Node = null;
    private levelSelectPopupOverlay: cc.Node = null;
    private historyButton: cc.Button = null;
    private startButtonLabelStyle: {
        font: cc.BitmapFont;
        fontSize: number;
        lineHeight: number;
        enableWrapText: boolean;
        horizontalAlign: number;
        verticalAlign: number;
        overflow: number;
        color: cc.Color;
    } = null;

    onLoad() {
        const storedBgmVolume = SceneChanger.getStoredVolume(SceneChanger.bgmVolumeStorageKey, this.bgmVolume);
        const storedSfxVolume = SceneChanger.getStoredVolume(SceneChanger.sfxVolumeStorageKey, GameAudio.getMasterSfxVolume());
        SceneChanger.configureBgm(storedBgmVolume, this.defaultBgmPath, this.gameBgmPath, this.gameSceneName);
        GameAudio.setMasterSfxVolume(storedSfxVolume);
        SceneChanger.registerSceneLaunchListener();
        SceneChanger.registerAudioUnlockListener();
        GameAudio.preloadSfx(this.buttonSfxPath);
        const sceneName = this.getCurrentSceneName();
        SceneChanger.playBgmForScene(sceneName, this.sceneBgmPath);
        if (this.showLoginButtonOnStart && sceneName === this.startSceneName) {
            FirebaseService.initialize().catch(() => {
                cc.warn('[SceneChanger] Firebase is not ready for login yet.');
            });
            this.scheduleOnce(() => this.createStartLoginButton(), 0);
        }
        if (sceneName === this.levelSelectSceneName) {
            FirebaseService.initialize().catch(() => {
                cc.warn('[SceneChanger] Firebase is not ready for level select data yet.');
            });
            this.scheduleOnce(() => this.createLevelSelectUi(), 0);
        }
    }

    update() {
        this.refreshLoginEditBoxVisuals();
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

    public openLoginDialog() {
        this.playButtonSfx();
        this.showLoginDialog();
    }

    public static setBgmVolume(volume: number) {
        const safeVolume = typeof volume === 'number' && !isNaN(volume) ? volume : SceneChanger.bgmVolume;
        SceneChanger.bgmVolume = Math.max(0, Math.min(100, safeVolume));
        cc.audioEngine.setMusicVolume(SceneChanger.getEngineBgmVolume());
        SceneChanger.storeVolume(SceneChanger.bgmVolumeStorageKey, SceneChanger.bgmVolume);
    }

    public static getBgmVolume() {
        return SceneChanger.bgmVolume;
    }

    public static setSfxVolume(volume: number) {
        GameAudio.setMasterSfxVolume(volume);
        SceneChanger.storeVolume(SceneChanger.sfxVolumeStorageKey, GameAudio.getMasterSfxVolume());
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

    private createLevelSelectUi() {
        const canvas = cc.find('Canvas') || this.node.parent;
        const oldUi = cc.find('Canvas/LevelSelectExtraUi');
        if (oldUi) {
            oldUi.destroy();
        }

        const level1Button = cc.find('Canvas/Level1Button');
        if (!canvas) {
            return;
        }

        if (level1Button) {
            this.captureStartButtonLabelStyle(level1Button);
        }

        this.levelSelectUiRoot = new cc.Node('LevelSelectExtraUi');
        this.levelSelectUiRoot.parent = canvas;
        this.levelSelectUiRoot.zIndex = 200;
        this.levelSelectUiRoot.setAnchorPoint(0.5, 0.5);
        this.levelSelectUiRoot.setContentSize(cc.winSize);
        this.levelSelectUiRoot.setPosition(0, 0);

        const backX = level1Button ? level1Button.x : 0;
        const backY = level1Button ? level1Button.y - 198 : -118;
        this.createBlueButton(this.levelSelectUiRoot, 'LevelSelectBackButton', this.levelSelectBackButtonText, backX, backY, 118, 42, () => this.signOutAndGoToStart());

        this.createLevelSelectMenuArea(this.levelSelectUiRoot);
    }

    private createLevelSelectMenuArea(parent: cc.Node) {
        const area = new cc.Node('LevelSelectMenuArea');
        area.parent = parent;
        area.setAnchorPoint(0.5, 0.5);
        area.setContentSize(212, 154);
        area.setPosition(-360, -236);

        const signedIn = !!FirebaseService.getCurrentUser();
        const historyNode = this.createBlueButton(area, 'HistoryButton', 'HISTORY', 0, 48, 176, 38, () => this.showHistoryPopup(), {
            normalPath: signedIn ? this.loginButtonSpritePath : 'pictures/button_gray',
            pressedPath: signedIn ? this.loginButtonPressedSpritePath : 'pictures/button_gray',
            hoverPath: signedIn ? this.loginButtonHoverSpritePath : 'pictures/button_gray',
            tint: cc.Color.WHITE,
            interactable: signedIn
        });
        this.historyButton = historyNode.getComponent(cc.Button);

        this.createBlueButton(area, 'LeaderboardButton', 'LEADERBOARD', 0, 0, 176, 38, () => this.showLeaderboardPopup(), {
            normalPath: 'pictures/button_orange',
            pressedPath: 'pictures/button_oriange_press',
            hoverPath: 'pictures/button_orange_hover',
            tint: cc.Color.WHITE
        });
        this.createBlueButton(area, 'SettingButton', 'SETTING', 0, -48, 176, 38, () => this.showSettingPopup(), {
            normalPath: this.loginButtonSpritePath,
            pressedPath: this.loginButtonPressedSpritePath,
            hoverPath: this.loginButtonHoverSpritePath,
            tint: cc.Color.WHITE
        });
    }

    private signOutAndGoToStart() {
        this.playButtonSfx();
        FirebaseService.signOut().catch((err: Error) => {
            cc.warn('[SceneChanger] Failed to sign out.', err);
        }).then(() => {
            this.loadSceneWithBgm('StartScene');
        });
    }

    private showHistoryPopup() {
        this.playButtonSfx();
        const content = this.showLevelSelectPopup('HistoryPopup', 'HISTORY', cc.color(18, 42, 70, 245));
        this.createPopupWords(content, 'HistoryLoading', ['LOADING'], -270, 70, 34, cc.Color.WHITE, 12);

        FirebaseService.getRunHistory(3).then((runs: GameRunViewRecord[]) => {
            if (!content || !cc.isValid(content)) {
                return;
            }

            content.removeAllChildren();
            this.createPopupWords(content, 'HistorySubTitle', ['LATEST', '3', 'RECORDS'], -292, 120, 66, cc.color(255, 244, 145), 12);
            if (runs.length === 0) {
                this.createPopupWords(content, 'NoHistory', ['NO', 'RECORDS', 'YET'], -292, 68, 66, cc.Color.WHITE, 12);
            } else {
                for (let i = 0; i < runs.length; i++) {
                    this.createHistoryRecordRow(content, runs[i], i + 1, 78 - i * 58);
                }
            }

            const bestRow = new cc.Node('BestClear');
            bestRow.parent = content;
            bestRow.setPosition(-292, -106);
            bestRow.setContentSize(620, 220);
            this.createPopupWords(bestRow, 'BestClearLoading', ['BEST', 'CLEAR', 'LOADING'], 0, 0, 58, cc.color(145, 223, 255), 10);
            FirebaseService.getBestCompletedRunWithRank().then((best: GameRunViewRecord) => {
                if (!content || !cc.isValid(content)) {
                    return;
                }

                const bestNode = content.getChildByName('BestClear');
                if (!bestNode) {
                    return;
                }

                bestNode.removeAllChildren();
                if (best) {
                    this.createPopupText(bestNode, 'BestLabel', 'BEST', 0, 0, 58, cc.color(145, 223, 255), 100);
                    this.createPopupText(bestNode, 'BestRank', String(best.rank), 112, 0, 58, cc.Color.WHITE, 52);
                    this.createScoreField(bestNode, 'BestScore', 178, 0, best.score, 58);
                    this.createCoinField(bestNode, 'BestCoin', 326, 0, best.coins, 1.25, 58);
                    this.createTimeField(bestNode, 'BestTime', 476, 0, best.playTimeSec, 1.25, 58);
                } else {
                    this.createPopupWords(bestNode, 'BestNone', ['BEST', 'CLEAR', 'NONE'], 0, 0, 58, cc.color(145, 223, 255), 10);
                }
            }).catch((err: any) => {
                cc.warn('[SceneChanger] Failed to load best clear rank.', err);
                if (content && cc.isValid(content)) {
                    const bestNode = content.getChildByName('BestClear');
                    if (bestNode) {
                        bestNode.removeAllChildren();
                        this.createPopupWords(bestNode, 'BestFailed', ['BEST', 'CLEAR', 'LOAD', 'FAILED'], 0, 0, 58, cc.color(255, 145, 145), 10);
                    }
                }
            });
        }).catch((err: any) => {
            cc.warn('[SceneChanger] Failed to load history.', err);
            this.showPopupError(content, err);
        });
    }

    private showLeaderboardPopup() {
        this.playButtonSfx();
        const content = this.showLevelSelectPopup('LeaderboardPopup', 'LEADERBOARD', cc.color(92, 50, 22, 245), {
            borderColor: cc.color(122, 78, 42, 255),
            closeButtonStyle: 'orange'
        });
        this.createPopupWords(content, 'LeaderboardLoading', ['LOADING'], -270, 70, 34, cc.Color.WHITE, 12);

        FirebaseService.getCompletedLeaderboard(5).then((records: GameRunViewRecord[]) => {
            if (!content || !cc.isValid(content)) {
                return;
            }

            content.removeAllChildren();
            this.createLeaderboardHeader(content);
            if (!records || records.length === 0) {
                this.createPopupWords(content, 'NoLeaderboard', ['NO', 'CLEARED', 'RECORDS', 'YET'], -292, 68, 62, cc.Color.WHITE, 10);
                return;
            }

            for (let i = 0; i < records.length; i++) {
                records[i].rank = i + 1;
                this.createLeaderboardRecordRow(content, records[i], 78 - i * 56);
            }
        }).catch((err: any) => {
            cc.warn('[SceneChanger] Failed to load leaderboard.', err);
            this.showPopupError(content, err);
        });
    }

    private showSettingPopup() {
        this.playButtonSfx();
        const content = this.showLevelSelectPopup('SettingPopup', 'SETTING', cc.color(20, 48, 76, 245));
        this.createVolumeSlider(content, 'BGM', 0, 62, SceneChanger.getBgmVolume(), (value: number) => {
            SceneChanger.setBgmVolume(value);
        });
        this.createVolumeSlider(content, 'SFX', 0, -36, GameAudio.getMasterSfxVolume(), (value: number) => {
            SceneChanger.setSfxVolume(value);
        });
    }

    private showLevelSelectPopup(name: string, title: string, panelColor: cc.Color, options: { borderColor?: cc.Color; closeButtonStyle?: string } = {}) {
        this.removeLevelSelectPopup();

        const canvas = cc.find('Canvas') || this.node.parent;
        this.levelSelectPopupOverlay = new cc.Node(name);
        this.levelSelectPopupOverlay.parent = canvas || this.node;
        this.levelSelectPopupOverlay.zIndex = 99997;
        this.levelSelectPopupOverlay.setAnchorPoint(0.5, 0.5);
        this.levelSelectPopupOverlay.setContentSize(cc.winSize);
        this.levelSelectPopupOverlay.setPosition(0, 0);
        this.levelSelectPopupOverlay.addComponent(cc.BlockInputEvents);

        const dim = this.levelSelectPopupOverlay.addComponent(cc.Graphics);
        dim.fillColor = cc.color(0, 0, 0, 160);
        dim.fillRect(-cc.winSize.width * 0.5, -cc.winSize.height * 0.5, cc.winSize.width, cc.winSize.height);

        const panel = new cc.Node(name + 'Panel');
        panel.parent = this.levelSelectPopupOverlay;
        panel.setAnchorPoint(0.5, 0.5);
        panel.setContentSize(650, 430);
        panel.setPosition(0, 0);

        const panelGraphics = panel.addComponent(cc.Graphics);
        panelGraphics.fillColor = panelColor;
        panelGraphics.roundRect(-325, -215, 650, 430, 8);
        panelGraphics.fill();
        panelGraphics.strokeColor = options.borderColor || cc.color(80, 145, 255, 255);
        panelGraphics.lineWidth = 4;
        panelGraphics.roundRect(-325, -215, 650, 430, 8);
        panelGraphics.stroke();

        this.createLoginLabel(panel, name + 'Title', title, 0, 150, 82, cc.Color.WHITE, true, false, 620, 150);
        const closeButtonOptions = options.closeButtonStyle === 'orange'
            ? {
                normalPath: 'pictures/button_orange',
                pressedPath: 'pictures/button_oriange_press',
                hoverPath: 'pictures/button_orange_hover',
                tint: cc.Color.WHITE
            }
            : {};
        this.createBlueButton(panel, name + 'CloseButton', 'BACK', 0, -178, 130, 42, () => {
            this.playButtonSfx();
            this.removeLevelSelectPopup();
        }, closeButtonOptions);

        const content = new cc.Node(name + 'Content');
        content.parent = panel;
        content.zIndex = 40;
        content.setAnchorPoint(0.5, 0.5);
        content.setContentSize(660, 360);
        content.setPosition(0, 10);
        return content;
    }

    private removeLevelSelectPopup() {
        if (this.levelSelectPopupOverlay && cc.isValid(this.levelSelectPopupOverlay)) {
            this.levelSelectPopupOverlay.destroy();
        }

        this.levelSelectPopupOverlay = null;
    }

    private createVolumeSlider(parent: cc.Node, labelText: string, x: number, y: number, value: number, onChange: (value: number) => void) {
        const row = new cc.Node(labelText + 'SliderRow');
        row.parent = parent;
        row.setAnchorPoint(0.5, 0.5);
        row.setContentSize(620, 120);
        row.setPosition(x, y);

        this.createPopupText(row, labelText, labelText, -272, 28, 64, cc.color(255, 244, 145), 150);
        const valueLabel = this.createPopupText(row, labelText + 'Value', Math.round(value) + '', 260, 28, 60, cc.Color.WHITE, 120);

        const track = new cc.Node(labelText + 'Track');
        track.parent = row;
        track.setAnchorPoint(0.5, 0.5);
        track.setContentSize(300, 16);
        track.setPosition(0, 16);

        const trackGraphics = track.addComponent(cc.Graphics);
        trackGraphics.fillColor = cc.color(8, 18, 28, 255);
        trackGraphics.roundRect(-150, -8, 300, 16, 8);
        trackGraphics.fill();

        const fill = new cc.Node(labelText + 'Fill');
        fill.parent = track;
        fill.setAnchorPoint(0, 0.5);
        fill.setContentSize(300 * Math.max(0, Math.min(100, value)) / 100, 16);
        fill.setPosition(-150, 0);
        const fillGraphics = fill.addComponent(cc.Graphics);

        const knob = new cc.Node(labelText + 'Knob');
        knob.parent = track;
        knob.setAnchorPoint(0.5, 0.5);
        knob.setContentSize(28, 28);
        const knobGraphics = knob.addComponent(cc.Graphics);
        knobGraphics.fillColor = cc.color(255, 255, 255, 255);
        knobGraphics.circle(0, 0, 14);
        knobGraphics.fill();

        const applyValue = (nextValue: number) => {
            const clamped = Math.max(0, Math.min(100, nextValue));
            const fillWidth = 300 * clamped / 100;
            fill.setContentSize(fillWidth, 16);
            fillGraphics.clear();
            fillGraphics.fillColor = cc.color(85, 204, 255, 255);
            fillGraphics.roundRect(0, -8, fillWidth, 16, 8);
            fillGraphics.fill();
            knob.x = -150 + fillWidth;
            valueLabel.string = Math.round(clamped) + '';
            onChange(clamped);
        };

        const setFromTouch = (event: cc.Event.EventTouch) => {
            const location = event.getLocation();
            const local = track.convertToNodeSpaceAR(location);
            applyValue((local.x + 150) / 300 * 100);
        };

        track.on(cc.Node.EventType.TOUCH_START, setFromTouch, this);
        track.on(cc.Node.EventType.TOUCH_MOVE, setFromTouch, this);
        knob.on(cc.Node.EventType.TOUCH_START, setFromTouch, this);
        knob.on(cc.Node.EventType.TOUCH_MOVE, setFromTouch, this);
        applyValue(value);
    }

    private createPlainLabel(parent: cc.Node, name: string, text: string, x: number, y: number, fontSize: number, color: cc.Color, width: number, height: number) {
        const label = this.createLoginLabel(
            parent,
            name,
            text,
            x,
            y,
            fontSize,
            color,
            true,
            false,
            Math.max(width, 760),
            Math.max(height, fontSize + 34)
        );
        label.node.zIndex = 80;
        label.overflow = cc.Label.Overflow.SHRINK;
        label.enableWrapText = false;
        return label;
    }

    private showPopupError(content: cc.Node, err: any) {
        if (!content || !cc.isValid(content)) {
            return;
        }

        content.removeAllChildren();
        const code = err && err.code ? String(err.code) : '';
        const words = code.indexOf('permission-denied') >= 0
            ? ['FIREBASE', 'RULES', 'NEED', 'READ', 'ACCESS']
            : ['LOAD', 'FAILED'];
        this.createPopupWords(content, 'PopupError', words, -292, 30, 62, cc.color(255, 145, 145), 10);
    }

    private createHistoryRecordRow(parent: cc.Node, record: GameRunViewRecord, index: number, y: number) {
        const row = this.createPopupRow(parent, 'HistoryRow' + index, -292, y);
        const status = record && record.cleared ? 'CLEAR' : 'FAIL';
        this.createPopupText(row, 'Rank', String(index), 0, 0, 62, cc.Color.WHITE, 54);
        this.createPopupText(row, 'Status', status, 56, 0, 62, record && record.cleared ? cc.color(145, 223, 255) : cc.color(255, 170, 170), 136);
        this.createScoreField(row, 'Score', 190, 0, record && record.score, 62);
        this.createCoinField(row, 'Coin', 330, 0, record && record.coins, 1.45, 62);
        this.createTimeField(row, 'Time', 460, 0, record && record.playTimeSec, 1.45, 62);
    }

    private createLeaderboardHeader(parent: cc.Node) {
        const header = this.createPopupRow(parent, 'LeaderboardHeader', -292, 120);
        this.createPopupText(header, 'RankHead', 'RANK', 0, 0, 50, cc.color(255, 244, 145), 80);
        this.createPopupText(header, 'PlayerHead', 'PLAYER', 72, 0, 50, cc.color(255, 244, 145), 158);
        this.createPopupText(header, 'ScoreHead', 'SCORE', 224, 0, 50, cc.color(255, 244, 145), 110);
        this.createPopupText(header, 'TimeHead', 'TIME', 342, 0, 50, cc.color(255, 244, 145), 120);
        this.createPopupText(header, 'CoinHead', 'COIN', 484, 0, 50, cc.color(255, 244, 145), 112);
    }

    private createLeaderboardRecordRow(parent: cc.Node, record: GameRunViewRecord, y: number) {
        const row = this.createPopupRow(parent, 'LeaderboardRow' + record.rank, -292, y);
        const anyRecord: any = record || {};
        const name = this.formatPlayerName(anyRecord.playerName || anyRecord.email || anyRecord.uid || 'PLAYER');
        this.createPopupText(row, 'Rank', String(record.rank), 0, 0, 56, cc.Color.WHITE, 62);
        this.createPopupText(row, 'Player', name, 72, 0, 56, cc.Color.WHITE, 142);
        this.createPopupText(row, 'Score', String(this.safeInt(record && record.score)), 224, 0, 56, cc.Color.WHITE, 118);
        this.createTimeField(row, 'Time', 342, 0, record && record.playTimeSec, 1.3, 56);
        this.createCoinField(row, 'Coin', 484, 0, record && record.coins, 1.3, 56);
    }

    private createPopupRow(parent: cc.Node, name: string, x: number, y: number) {
        const row = new cc.Node(name);
        row.parent = parent;
        row.zIndex = 80;
        row.setAnchorPoint(0, 0.5);
        row.setContentSize(650, 240);
        row.setPosition(x, y);
        return row;
    }

    private createScoreField(parent: cc.Node, name: string, x: number, y: number, score: number, fontSize: number) {
        this.createPopupText(parent, name + 'Label', 'S', x, y, fontSize, cc.color(255, 244, 145), 42);
        this.createPopupText(parent, name + 'Value', String(this.safeInt(score)), x + 34, y, fontSize, cc.Color.WHITE, 126);
    }

    private createCoinField(parent: cc.Node, name: string, x: number, y: number, coins: number, iconScale: number, fontSize: number) {
        this.createPopupIcon(parent, name + 'Icon', this.popupCoinTexturePath, x, y, 16, 16, true, iconScale);
        this.createPopupText(parent, name + 'Value', String(this.safeInt(coins)), x + 58, y, fontSize, cc.Color.WHITE, 118);
    }

    private createTimeField(parent: cc.Node, name: string, x: number, y: number, timeSec: number, iconScale: number, fontSize: number) {
        this.createPopupIcon(parent, name + 'Icon', this.popupTimerSpritePath, x, y, 14, 16, false, iconScale);
        this.createPopupText(parent, name + 'Value', this.formatSeconds(timeSec), x + 38, y, fontSize, cc.Color.WHITE, 154);
    }

    private createPopupWords(parent: cc.Node, name: string, words: string[], x: number, y: number, fontSize: number, color: cc.Color, gap: number) {
        const row = this.createPopupRow(parent, name, x, y);
        let currentX = 0;
        for (let i = 0; i < words.length; i++) {
            const width = Math.max(48, words[i].length * fontSize * 0.48);
            this.createPopupText(row, 'Word' + i, words[i], currentX, 0, fontSize, color, width);
            currentX += width + gap;
        }
        return row;
    }

    private createPopupText(parent: cc.Node, name: string, text: string, x: number, y: number, fontSize: number, color: cc.Color, width: number) {
        const node = new cc.Node(name);
        node.parent = parent;
        node.zIndex = 80;
        node.setAnchorPoint(0, 0.5);
        node.setContentSize(width, Math.max(260, fontSize * 3));
        node.setPosition(x, y - 26);
        node.color = color;

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize * 2;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
        label.enableWrapText = false;
        if (this.startButtonLabelStyle && this.startButtonLabelStyle.font) {
            label.font = this.startButtonLabelStyle.font;
        }
        return label;
    }

    private createPopupIcon(parent: cc.Node, name: string, path: string, x: number, y: number, width: number, height: number, textureFrame: boolean, scale: number) {
        const node = new cc.Node(name);
        node.parent = parent;
        node.zIndex = 80;
        node.setAnchorPoint(0, 0.5);
        node.setContentSize(width, height);
        node.setPosition(x, y);
        node.scale = scale;

        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        if (textureFrame) {
            cc.loader.loadRes(path, cc.Texture2D, (err: Error, texture: cc.Texture2D) => {
                if (!err && texture && cc.isValid(node)) {
                    sprite.spriteFrame = new cc.SpriteFrame(texture, cc.rect(0, 0, width, height));
                }
            });
        } else {
            cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
                if (!err && frame && cc.isValid(node)) {
                    sprite.spriteFrame = frame;
                }
            });
        }

        return node;
    }

    private formatPlayerName(name: string) {
        let text = name || 'PLAYER';
        if ((text === '1' || text === 'PLAYER') && FirebaseService.getCurrentUser() && FirebaseService.getCurrentUser().email) {
            text = FirebaseService.getCurrentUser().email;
        }
        const atIndex = text.indexOf('@');
        const baseName = atIndex > 0 ? text.substring(0, atIndex) : text;
        const visibleName = baseName.toUpperCase();
        return visibleName.length > 10 ? visibleName.substring(0, 10) : visibleName;
    }

    private formatSeconds(value: number) {
        const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
        return (Math.round(safeValue * 10) / 10).toFixed(1) + 'S';
    }

    private safeInt(value: number) {
        return Math.max(0, Math.floor(value || 0));
    }

    private createStartLoginButton() {
        const canvas = cc.find('Canvas') || this.node.parent;
        const startButton = cc.find('Canvas/StartButton');
        if (!canvas || !startButton || cc.find('Canvas/LoginButton')) {
            return;
        }

        const startButtonSize = startButton.getContentSize();
        this.captureStartButtonLabelStyle(startButton);
        const buttonNode = this.createBlueButton(
            canvas,
            'LoginButton',
            this.loginButtonText,
            startButton.x,
            startButton.y + this.loginButtonOffsetY,
            startButtonSize.width,
            startButtonSize.height,
            () => this.openLoginDialog()
        );
        buttonNode.zIndex = startButton.zIndex + 1;
        this.applyStartButtonLabelStyle(buttonNode.getChildByName('LoginButtonLabel'));
    }

    private showLoginDialog() {
        this.removeLoginDialog();

        const canvas = cc.find('Canvas') || this.node.parent;
        if (!canvas) {
            return;
        }

        this.loginOverlay = new cc.Node('LoginOverlay');
        this.loginOverlay.parent = canvas;
        this.loginOverlay.zIndex = 99998;
        this.loginOverlay.setAnchorPoint(0.5, 0.5);
        this.loginOverlay.setContentSize(cc.winSize);
        this.loginOverlay.setPosition(0, 0);
        this.loginOverlay.addComponent(cc.BlockInputEvents);

        const dim = this.loginOverlay.addComponent(cc.Graphics);
        dim.fillColor = cc.color(0, 0, 0, 190);
        dim.fillRect(-cc.winSize.width * 0.5, -cc.winSize.height * 0.5, cc.winSize.width, cc.winSize.height);

        const panel = new cc.Node('LoginPanel');
        panel.parent = this.loginOverlay;
        panel.setAnchorPoint(0.5, 0.5);
        panel.setContentSize(520, 360);
        panel.setPosition(0, 0);

        const panelGraphics = panel.addComponent(cc.Graphics);
        panelGraphics.fillColor = cc.color(18, 32, 58, 245);
        panelGraphics.roundRect(-260, -180, 520, 360, 8);
        panelGraphics.fill();
        panelGraphics.strokeColor = cc.color(80, 145, 255, 255);
        panelGraphics.lineWidth = 4;
        panelGraphics.roundRect(-260, -180, 520, 360, 8);
        panelGraphics.stroke();

        this.createLoginLabel(panel, 'LoginTitle', 'LOGIN', 0, 96, this.loginPopupTitleFontSize, cc.Color.WHITE, true, true, 460, 130);
        this.loginEmailEditBox = this.createLoginEditBox(panel, 'EmailInput', 'EMAIL', 0, 48, false);
        this.loginPasswordEditBox = this.createLoginEditBox(panel, 'PasswordInput', 'PASSWORD', 0, -30, true);
        this.loginStatusRow = this.createLoginTextRow(panel, 'LoginStatusRow', [], 0, -104, 56, cc.color(255, 244, 145), 500, 88);

        this.createBlueButton(panel, 'LoginSubmitButton', 'OK', -98, -137, 102, 62, () => this.submitLoginDialog());
        this.createBlueButton(panel, 'LoginCancelButton', 'CANCEL', 98, -137, 102, 62, () => {
            this.playButtonSfx();
            this.removeLoginDialog();
        });

        const user = FirebaseService.getCurrentUser();
        if (user && user.email) {
            this.setLoginStatus(['SIGNED', 'IN']);
        }
    }

    private submitLoginDialog() {
        this.playButtonSfx();
        const email = this.getLoginEmailValue().trim();
        const password = this.getLoginPasswordValue();

        if (!email || !password) {
            this.setLoginStatus(['EMAIL', 'PASSWORD', 'REQUIRED']);
            return;
        }

        if (password.length < 6) {
            this.setLoginStatus(['PASSWORD', 'NEEDS', '6+', 'CHARS']);
            return;
        }

        this.setLoginStatus(['CONNECTING']);
        FirebaseService.signInOrRegister(email, password).then((result: { user: any; registered: boolean }) => {
            this.setLoginStatus(result.registered ? ['REGISTER', 'SUCCESS'] : ['SIGNED', 'IN']);
            this.scheduleOnce(() => {
                this.removeLoginDialog();
                this.loadSceneWithBgm('LevelSelectScene');
            }, 1.2);
        }).catch((err: any) => {
            this.setLoginStatus(this.getLoginErrorMessage(err));
        });
    }

    private removeLoginDialog() {
        if (this.loginOverlay && cc.isValid(this.loginOverlay)) {
            this.loginOverlay.destroy();
        }

        this.loginOverlay = null;
        this.loginStatusRow = null;
        this.removeLoginDomInputs();
        this.loginEmailEditBox = null;
        this.loginPasswordEditBox = null;
        this.loginEmailPlaceholderLabel = null;
        this.loginPasswordPlaceholderLabel = null;
        this.loginEmailValueLabel = null;
        this.loginPasswordValueLabel = null;
        this.loginEmailValue = '';
        this.loginPasswordValue = '';
    }

    private createBlueButton(
        parent: cc.Node,
        name: string,
        text: string,
        x: number,
        y: number,
        width: number,
        height: number,
        onClick: Function,
        options: {
            normalPath?: string;
            pressedPath?: string;
            hoverPath?: string;
            tint?: cc.Color;
            disabledTint?: cc.Color;
            interactable?: boolean;
        } = {}
    ) {
        const buttonNode = new cc.Node(name);
        buttonNode.parent = parent;
        buttonNode.setAnchorPoint(0.5, 0.5);
        buttonNode.setContentSize(width, height);
        buttonNode.setPosition(x, y);
        buttonNode.color = options.tint || cc.Color.WHITE;

        const sprite = buttonNode.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SLICED;
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

        const button = buttonNode.addComponent(cc.Button);
        button.transition = cc.Button.Transition.SPRITE;
        button.target = buttonNode;
        button.duration = 0.1;
        button.zoomScale = 1.05;
        button.clickEvents = [];
        button.interactable = options.interactable !== false;
        button.enableAutoGrayEffect = false;
        buttonNode.on('click', () => {
            if (!button.interactable) {
                return;
            }
            if (onClick) {
                onClick();
            }
        }, this);

        if (!button.interactable && options.disabledTint) {
            buttonNode.color = options.disabledTint;
        }
        this.loadButtonSpriteFrames(button, sprite, options.normalPath, options.pressedPath, options.hoverPath);
        const isDialogButton = buttonNode.name === 'LoginSubmitButton' || buttonNode.name === 'LoginCancelButton';
        const isSmallButton = !isDialogButton && height <= 50;
        const labelSize = buttonNode.name === 'LoginCancelButton' ? 60 : (isDialogButton ? 72 : this.getStartButtonFontSize());
        const smallTextScale = isSmallButton && text.length > 8 ? 0.9 : 1;
        const finalLabelSize = isSmallButton ? Math.floor(Math.min(52, Math.max(38, height + 6)) * smallTextScale) : labelSize;
        const labelY = isSmallButton ? -Math.max(14, height * 0.28) : (buttonNode.name === 'LoginCancelButton' ? -20 : (isDialogButton ? -24 : -32));
        const labelWidth = isSmallButton ? Math.max(width * 3.2, 380) : (isDialogButton ? 340 : 460);
        const labelHeight = isSmallButton ? Math.max(height * 3.2, 150) : (isDialogButton ? 110 : 130);
        this.createLoginLabel(buttonNode, name + 'Label', text, 0, labelY, finalLabelSize, cc.Color.WHITE, true, false, labelWidth, labelHeight);
        return buttonNode;
    }

    private captureStartButtonLabelStyle(startButton: cc.Node) {
        const startBackground = startButton.getChildByName('Background');
        const startLabelNode = startBackground ? startBackground.getChildByName('Label') : null;
        if (!startLabelNode) {
            return;
        }

        const startLabel = startLabelNode.getComponent(cc.Label);
        if (!startLabel) {
            return;
        }

        this.startButtonLabelStyle = {
            font: startLabel.font,
            fontSize: startLabel.fontSize,
            lineHeight: startLabel.lineHeight,
            enableWrapText: startLabel.enableWrapText,
            horizontalAlign: startLabel.horizontalAlign,
            verticalAlign: startLabel.verticalAlign,
            overflow: startLabel.overflow,
            color: startLabelNode.color
        };
    }

    private applyStartButtonLabelStyle(labelNode: cc.Node, copySize: boolean = true) {
        if (!labelNode || !this.startButtonLabelStyle) {
            return;
        }

        const label = labelNode.getComponent(cc.Label);
        if (!label) {
            return;
        }

        const currentFontSize = label.fontSize;
        const currentLineHeight = label.lineHeight;
        label.font = this.startButtonLabelStyle.font;
        if (copySize) {
            label.fontSize = this.startButtonLabelStyle.fontSize;
            label.lineHeight = this.startButtonLabelStyle.lineHeight;
        } else {
            label.fontSize = currentFontSize;
            label.lineHeight = currentLineHeight;
        }
        label.enableWrapText = false;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
    }

    private getStartButtonFontSize() {
        return this.startButtonLabelStyle ? this.startButtonLabelStyle.fontSize : 90;
    }

    private loadButtonSpriteFrames(button: cc.Button, sprite: cc.Sprite, normalPath: string = '', pressedPath: string = '', hoverPath: string = '') {
        const finalNormalPath = normalPath || this.loginButtonSpritePath;
        const finalPressedPath = pressedPath || this.loginButtonPressedSpritePath;
        const finalHoverPath = hoverPath || this.loginButtonHoverSpritePath;
        cc.loader.loadRes(finalNormalPath, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (!err && frame && cc.isValid(sprite.node)) {
                sprite.spriteFrame = frame;
                button.normalSprite = frame;
            }
        });
        cc.loader.loadRes(finalPressedPath, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (!err && frame && cc.isValid(sprite.node)) {
                button.pressedSprite = frame;
            }
        });
        cc.loader.loadRes(finalHoverPath, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (!err && frame && cc.isValid(sprite.node)) {
                button.hoverSprite = frame;
            }
        });
    }

    private createLoginEditBox(parent: cc.Node, name: string, placeholder: string, x: number, y: number, password: boolean) {
        const node = new cc.Node(name);
        node.parent = parent;
        node.setAnchorPoint(0.5, 0.5);
        node.setContentSize(360, 54);
        node.setPosition(x, y);

        const graphics = node.addComponent(cc.Graphics);
        graphics.fillColor = cc.color(255, 255, 255, 245);
        graphics.roundRect(-180, -27, 360, 54, 6);
        graphics.fill();

        const input = this.createLoginDomInput(node, placeholder, password);
        if (password) {
            this.loginPasswordInput = input;
            this.loginPasswordInputNode = node;
        } else {
            this.loginEmailInput = input;
            this.loginEmailInputNode = node;
        }
        return null;
    }

    private configureEditBoxLabels(editBox: cc.EditBox) {
        if (!editBox || !cc.isValid(editBox.node)) {
            return;
        }

        const anyEditBox: any = editBox;
        this.hideNativeEditBoxLabel(anyEditBox.textLabel);
        this.hideNativeEditBoxLabel(anyEditBox.placeholderLabel);

        const inputElement = anyEditBox._impl && (anyEditBox._impl._edTxt || anyEditBox._impl._input || anyEditBox._impl._elem);
        if (inputElement && inputElement.style) {
            SceneChanger.ensureLoginInputStyle();
            inputElement.classList.add('mario-login-input');
            inputElement.placeholder = editBox.placeholder || '';
            inputElement.style.color = 'rgb(25, 25, 25)';
            inputElement.style.textAlign = 'left';
            inputElement.style.fontFamily = 'Arial, sans-serif';
            inputElement.style.fontSize = '34px';
            inputElement.style.height = '54px';
            inputElement.style.lineHeight = '54px';
            inputElement.style.padding = '0 16px';
            inputElement.style.boxSizing = 'border-box';
        }
    }

    private hideNativeEditBoxLabel(label: cc.Label) {
        if (!label || !cc.isValid(label.node)) {
            return;
        }

        label.node.active = false;
    }

    private createEditBoxPlaceholder(parent: cc.Node, text: string) {
        const node = new cc.Node(text + 'Placeholder');
        node.parent = parent;
        node.zIndex = 20;
        node.setAnchorPoint(0.5, 0.5);
        node.setContentSize(360, 54);
        node.setPosition(16, 0);
        node.color = cc.color(120, 120, 120);

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = 34;
        label.lineHeight = 54;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
        return label;
    }

    private createEditBoxValueLabel(parent: cc.Node) {
        const node = new cc.Node('ValueLabel');
        node.parent = parent;
        node.zIndex = 18;
        node.setAnchorPoint(0.5, 0.5);
        node.setContentSize(328, 54);
        node.setPosition(16, 0);
        node.color = cc.color(25, 25, 25);

        const label = node.addComponent(cc.Label);
        label.string = '';
        label.fontSize = 34;
        label.lineHeight = 54;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.CLAMP;
        return label;
    }

    private createLoginDomInput(node: cc.Node, placeholder: string, password: boolean) {
        if (typeof document === 'undefined') {
            return null;
        }

        SceneChanger.ensureLoginInputStyle();
        const input = document.createElement('input');
        input.className = 'mario-login-input';
        input.type = password ? 'password' : 'email';
        input.placeholder = placeholder;
        input.autocomplete = password ? 'current-password' : 'email';
        input.spellcheck = false;
        input.value = '';
        input.addEventListener('input', () => {
            if (password) {
                this.loginPasswordValue = input.value;
            } else {
                this.loginEmailValue = input.value;
            }
        });

        document.body.appendChild(input);
        this.positionLoginDomInput(input, node);
        return input;
    }

    private removeLoginDomInputs() {
        this.removeLoginDomInput(this.loginEmailInput);
        this.removeLoginDomInput(this.loginPasswordInput);
        this.loginEmailInput = null;
        this.loginPasswordInput = null;
        this.loginEmailInputNode = null;
        this.loginPasswordInputNode = null;
    }

    private removeLoginDomInput(input: HTMLInputElement) {
        if (input && input.parentElement) {
            input.parentElement.removeChild(input);
        }
    }

    private positionLoginDomInput(input: HTMLInputElement, node: cc.Node) {
        if (!input || !node || !cc.isValid(node) || typeof document === 'undefined') {
            return;
        }

        const canvas = cc.game && cc.game.canvas ? cc.game.canvas : document.querySelector('canvas');
        if (!canvas) {
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const visibleSize = cc.view.getVisibleSize();
        const world = node.convertToWorldSpaceAR(cc.v2(0, 0));
        const width = node.width * rect.width / visibleSize.width;
        const height = node.height * rect.height / visibleSize.height;
        const left = rect.left + world.x * rect.width / visibleSize.width - width * 0.5;
        const top = rect.top + (visibleSize.height - world.y) * rect.height / visibleSize.height - height * 0.5;

        input.style.left = left + 'px';
        input.style.top = top + 'px';
        input.style.width = width + 'px';
        input.style.height = height + 'px';
        input.style.lineHeight = height + 'px';
    }

    private static ensureLoginInputStyle() {
        if (SceneChanger.hasLoginInputStyle || typeof document === 'undefined') {
            return;
        }

        SceneChanger.hasLoginInputStyle = true;
        const style = document.createElement('style');
        style.id = 'mario-login-input-style';
        style.textContent = [
            '.mario-login-input {',
            '  position: fixed !important;',
            '  z-index: 2147483647 !important;',
            '  display: block !important;',
            '  pointer-events: auto !important;',
            '  color: rgb(25, 25, 25) !important;',
            '  text-align: left !important;',
            '  font-family: Arial, sans-serif !important;',
            '  font-size: 34px !important;',
            '  background: rgba(255, 255, 255, 0.01) !important;',
            '  border: 0 !important;',
            '  outline: none !important;',
            '  margin: 0 !important;',
            '  padding: 0 16px !important;',
            '  box-sizing: border-box !important;',
            '}',
            '.mario-login-input::placeholder {',
            '  color: rgb(110, 110, 110) !important;',
            '  opacity: 1 !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    private refreshLoginEditBoxVisuals() {
        if (!this.loginOverlay || !cc.isValid(this.loginOverlay)) {
            return;
        }

        this.configureEditBoxLabels(this.loginEmailEditBox);
        this.configureEditBoxLabels(this.loginPasswordEditBox);
        this.positionLoginDomInput(this.loginEmailInput, this.loginEmailInputNode);
        this.positionLoginDomInput(this.loginPasswordInput, this.loginPasswordInputNode);
        this.cacheLoginEditBoxValues();
        this.refreshEditBoxDisplay(this.loginEmailEditBox, this.loginEmailPlaceholderLabel, this.loginEmailValueLabel, false);
        this.refreshEditBoxDisplay(this.loginPasswordEditBox, this.loginPasswordPlaceholderLabel, this.loginPasswordValueLabel, true);
    }

    private cacheLoginEditBoxValues() {
        const email = this.getEditBoxCurrentValue(this.loginEmailEditBox);
        const password = this.getEditBoxCurrentValue(this.loginPasswordEditBox);
        if (email.length > 0) {
            this.loginEmailValue = email;
        }
        if (password.length > 0) {
            this.loginPasswordValue = password;
        }
    }

    private getLoginEmailValue() {
        return this.loginEmailInput ? this.loginEmailInput.value : this.loginEmailValue;
    }

    private getLoginPasswordValue() {
        return this.loginPasswordInput ? this.loginPasswordInput.value : this.loginPasswordValue;
    }

    private getEditBoxCurrentValue(editBox: cc.EditBox) {
        if (editBox === this.loginEmailEditBox && this.loginEmailInput) {
            return this.loginEmailInput.value;
        }
        if (editBox === this.loginPasswordEditBox && this.loginPasswordInput) {
            return this.loginPasswordInput.value;
        }
        if (!editBox) {
            return '';
        }

        const anyEditBox: any = editBox;
        const inputElement = anyEditBox._impl && (anyEditBox._impl._edTxt || anyEditBox._impl._input || anyEditBox._impl._elem);
        if (inputElement && typeof inputElement.value === 'string') {
            return inputElement.value;
        }

        return String(editBox.string || '');
    }

    private refreshEditBoxDisplay(editBox: cc.EditBox, placeholderLabel: cc.Label, valueLabel: cc.Label, password: boolean) {
        if (!editBox || !cc.isValid(editBox.node)) {
            return;
        }

        const text = password ? this.getLoginPasswordValue() : this.getLoginEmailValue();
        const focused = editBox.isFocused && editBox.isFocused();
        if (placeholderLabel && cc.isValid(placeholderLabel.node)) {
            placeholderLabel.node.active = !focused && text.length === 0;
        }
        if (valueLabel && cc.isValid(valueLabel.node)) {
            valueLabel.node.active = !focused && text.length > 0;
            valueLabel.string = password ? this.maskPassword(text) : text;
        }
    }

    private maskPassword(text: string) {
        let masked = '';
        for (let i = 0; i < text.length; i++) {
            masked += '*';
        }
        return masked;
    }

    private createLoginLabel(
        parent: cc.Node,
        name: string,
        text: string,
        x: number,
        y: number,
        fontSize: number,
        color: cc.Color,
        useStartFont: boolean = false,
        copyStartFontSize: boolean = true,
        width: number = 440,
        height: number = 80
    ) {
        const node = new cc.Node(name);
        node.parent = parent;
        node.setAnchorPoint(0.5, 0.5);
        node.setContentSize(width, Math.max(height, fontSize + 16));
        node.setPosition(x, y);
        node.color = color;

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize + 8;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        label.overflow = cc.Label.Overflow.NONE;
        if (useStartFont) {
            this.applyStartButtonLabelStyle(node, copyStartFontSize);
        }
        return label;
    }

    private createLoginTextRow(parent: cc.Node, name: string, words: string[], x: number, y: number, fontSize: number, color: cc.Color, width: number, height: number) {
        const row = new cc.Node(name);
        row.parent = parent;
        row.setAnchorPoint(0.5, 0.5);
        row.setContentSize(width, height);
        row.setPosition(x, y);
        this.setLoginTextRowWords(row, words, fontSize, color);
        return row;
    }

    private setLoginStatus(words: string[]) {
        if (this.loginStatusRow && cc.isValid(this.loginStatusRow)) {
            this.setLoginTextRowWords(this.loginStatusRow, words, 56, cc.color(255, 244, 145));
        }
    }

    private setLoginTextRowWords(row: cc.Node, words: string[], fontSize: number, color: cc.Color) {
        row.removeAllChildren();
        if (!words || words.length === 0) {
            return;
        }

        const width = words.length > 2 ? 140 : 150;
        const gap = words.length > 2 ? 4 : 18;
        const totalWidth = width * words.length + gap * (words.length - 1);
        let currentX = -totalWidth * 0.5;
        for (let i = 0; i < words.length; i++) {
            this.createLoginLabel(row, 'Word' + i, words[i], currentX + width * 0.5, 0, fontSize, color, true, false, width, row.height);
            currentX += width + gap;
        }
    }

    private getLoginErrorMessage(err: any) {
        const code = err && err.code ? err.code : '';
        switch (code) {
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                return ['WRONG', 'PASSWORD'];
            case 'auth/invalid-email':
                return ['INVALID', 'EMAIL'];
            case 'auth/weak-password':
                return ['PASSWORD', 'TOO', 'WEAK'];
            case 'auth/network-request-failed':
                return ['NETWORK', 'ERROR'];
            default:
                return ['LOGIN', 'FAILED'];
        }
    }

    private getCurrentSceneName() {
        const scene = cc.director.getScene();
        return scene ? scene.name : '';
    }

    private static getStoredVolume(key: string, fallback: number) {
        if (typeof localStorage === 'undefined') {
            return fallback;
        }

        const value = Number(localStorage.getItem(key));
        if (isNaN(value)) {
            return fallback;
        }

        return Math.max(0, Math.min(100, value));
    }

    private static storeVolume(key: string, value: number) {
        if (typeof localStorage === 'undefined') {
            return;
        }

        localStorage.setItem(key, String(Math.max(0, Math.min(100, value))));
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
