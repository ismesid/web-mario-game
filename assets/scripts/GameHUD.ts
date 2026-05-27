import GameAudio from './GameAudio';
import GamePause from './GamePause';
import SceneChanger from './SceneChanger';

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameHUD extends cc.Component {
    @property
    worldText: string = '1';

    @property
    lives: number = 4;

    @property
    startTime: number = 284;

    @property
    score: number = 0;

    @property
    scorePerCoin: number = 100;

    @property
    scorePerEnemy: number = 200;

    @property
    topMargin: number = 14;

    @property
    leftMargin: number = 16;

    @property
    rowScale: number = 2;

    @property
    iconTextGap: number = 8;

    @property
    labelYOffset: number = -7;

    @property
    labelFontSize: number = 32;

    @property
    coinLabelExtraOffsetX: number = 18;

    @property
    scoreRightPadding: number = 16;

    @property
    worldSpritePath: string = 'pictures/world';

    @property
    lifeSpritePath: string = 'pictures/life';

    @property
    multipleSpritePath: string = 'pictures/multiple';

    @property
    timerSpritePath: string = 'pictures/timer';

    @property
    coinTexturePath: string = 'coins/coin_spin';

    @property
    whiteFontPath: string = 'fonts/white_font';

    @property
    yellowFontPath: string = 'fonts/yellow_font';

    @property
    continueCoinCost: number = 10;

    @property
    continueReviveLives: number = 3;

    @property
    continueButtonSfxPath: string = 'audio/reserve';

    @property
    continueButtonSfxVolume: number = 100;

    @property
    gameOverSfxPath: string = 'audio/Game Over';

    @property
    gameOverSfxVolume: number = 100;

    @property
    gameOverDuration: number = 6;

    @property
    gameOverMarioAtlasPath: string = 'player/mario_grouped_small';

    @property
    gameOverFontSize: number = 150;

    @property
    continueTitleFontSize: number = 76;

    @property
    continueCostFontSize: number = 52;

    @property
    continueButtonFontSize: number = 42;

    @property
    levelClearSfxPath: string = 'audio/levelClear';

    @property
    levelClearSfxVolume: number = 100;

    @property
    levelClearDuration: number = 6;

    @property
    levelClearTailSilenceDuration: number = 1.5;

    @property
    victoryMarioAtlasPath: string = 'player/mario_grouped_small';

    @property
    victoryText: string = 'LEVEL CLEAR';

    @property
    victoryFontSize: number = 128;

    private timeLeft = 0;
    private coinCount = 0;
    private timerRunning = true;
    private defeatFlowActive = false;
    private gameOverStarted = false;
    private victoryStarted = false;
    private worldLabel: cc.Label = null;
    private livesLabel: cc.Label = null;
    private timeLabel: cc.Label = null;
    private coinLabel: cc.Label = null;
    private scoreLabel: cc.Label = null;
    private whiteFont: cc.BitmapFont = null;
    private yellowFont: cc.BitmapFont = null;
    private hudRoot: cc.Node = null;
    private continueOverlay: cc.Node = null;
    private gameOverOverlay: cc.Node = null;
    private victoryOverlay: cc.Node = null;

    onLoad() {
        this.timeLeft = this.startTime;
        this.hudRoot = new cc.Node('HUDRoot');
        this.hudRoot.parent = this.node.parent || this.node;
        this.hudRoot.zIndex = 10000;
        this.loadFontsAndBuild();
        cc.systemEvent.on('coin-collected', this.onCoinCollected, this);
        cc.systemEvent.on('enemy-defeated', this.onEnemyDefeated, this);
        cc.systemEvent.on('player-damaged', this.onPlayerDamaged, this);
        cc.systemEvent.on('player-defeat-finished', this.onPlayerDefeatFinished, this);
        cc.systemEvent.on('player-victory-finished', this.onPlayerVictoryFinished, this);
        cc.systemEvent.on('level-ready', this.onLevelReady, this);
        GameAudio.preloadSfx(this.continueButtonSfxPath);
        GameAudio.preloadSfx(this.gameOverSfxPath);
        GameAudio.preloadSfx(this.levelClearSfxPath);
    }

    onDestroy() {
        cc.systemEvent.off('coin-collected', this.onCoinCollected, this);
        cc.systemEvent.off('enemy-defeated', this.onEnemyDefeated, this);
        cc.systemEvent.off('player-damaged', this.onPlayerDamaged, this);
        cc.systemEvent.off('player-defeat-finished', this.onPlayerDefeatFinished, this);
        cc.systemEvent.off('player-victory-finished', this.onPlayerVictoryFinished, this);
        cc.systemEvent.off('level-ready', this.onLevelReady, this);
        GamePause.resume();
    }

    update(dt: number) {
        if (!GamePause.paused && this.timerRunning && this.timeLeft > 0) {
            this.timeLeft = Math.max(0, this.timeLeft - dt);
            this.refreshText();
        }
    }

    lateUpdate() {
        this.pinToCameraView();
        this.pinOverlayToCamera(this.continueOverlay);
        this.pinOverlayToCamera(this.gameOverOverlay);
        this.pinOverlayToCamera(this.victoryOverlay);
    }

    private loadFontsAndBuild() {
        let pending = 2;
        const done = () => {
            pending--;
            if (pending === 0) {
                this.buildHud();
            }
        };

        cc.loader.loadRes(this.whiteFontPath, cc.BitmapFont, (err: Error, font: cc.BitmapFont) => {
            if (!err && font) {
                this.whiteFont = font;
            }
            done();
        });

        cc.loader.loadRes(this.yellowFontPath, cc.BitmapFont, (err: Error, font: cc.BitmapFont) => {
            if (!err && font) {
                this.yellowFont = font;
            }
            done();
        });
    }

    private buildHud() {
        if (!this.hudRoot || !cc.isValid(this.hudRoot)) {
            return;
        }

        this.hudRoot.removeAllChildren();

        this.worldLabel = this.createLabel('WorldText', this.getWorldDisplayText(), this.layoutX(0), this.getLabelY(), this.yellowFont);

        const lifeIcon = this.createSprite('LifeIcon', this.lifeSpritePath, this.layoutX(190), 0, 13, 7);
        const multipleIcon = this.createSprite('MultipleIcon', this.multipleSpritePath, lifeIcon.x + this.layoutX(30), 0, 7, 8);
        this.livesLabel = this.createLabel('LivesText', String(this.lives), 0, 0, this.whiteFont);
        this.placeLabelAfterIcon(this.livesLabel, multipleIcon);

        const timerIcon = this.createSprite('TimerIcon', this.timerSpritePath, this.layoutX(408), 0, 14, 16);
        this.timeLabel = this.createLabel('TimeText', this.formatNumber(Math.ceil(this.timeLeft), 3), 0, 0, this.whiteFont);
        this.placeLabelAfterIcon(this.timeLabel, timerIcon);

        const coinIcon = this.createCoinIcon(this.layoutX(610), 0);
        this.coinLabel = this.createLabel('CoinText', this.formatNumber(this.coinCount, 2), 0, 0, this.whiteFont);
        this.placeLabelAfterIcon(this.coinLabel, coinIcon);
        this.coinLabel.node.x += this.coinLabelExtraOffsetX;

        this.scoreLabel = this.createLabel('ScoreText', this.formatNumber(this.score, 7), 0, 0, this.whiteFont);
        this.scoreLabel.node.anchorX = 1;

        this.layoutScore();
        this.refreshText();
        this.pinToCameraView();
    }

    private createSprite(name: string, path: string, x: number, y: number, width: number, height: number) {
        const node = new cc.Node(name);
        node.parent = this.hudRoot;
        node.setPosition(x, y);
        node.setAnchorPoint(0, 0.5);
        node.setContentSize(width, height);

        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        cc.loader.loadRes(path, cc.SpriteFrame, (err: Error, frame: cc.SpriteFrame) => {
            if (!err && frame && cc.isValid(node)) {
                sprite.spriteFrame = frame;
            }
        });

        return node;
    }

    private createCoinIcon(x: number, y: number) {
        const node = new cc.Node('CoinIcon');
        node.parent = this.hudRoot;
        node.setPosition(x, y);
        node.setAnchorPoint(0, 0.5);
        node.setContentSize(16, 16);

        const sprite = node.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        cc.loader.loadRes(this.coinTexturePath, cc.Texture2D, (err: Error, texture: cc.Texture2D) => {
            if (!err && texture && cc.isValid(node)) {
                sprite.spriteFrame = new cc.SpriteFrame(texture, cc.rect(0, 0, 16, 16));
            }
        });

        return node;
    }

    private createLabel(name: string, text: string, x: number, y: number, font: cc.BitmapFont) {
        const node = new cc.Node(name);
        node.parent = this.hudRoot;
        node.setPosition(x, y);
        node.setAnchorPoint(0, 0.5);
        node.setContentSize(120, 16);

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = this.labelFontSize;
        label.lineHeight = this.labelFontSize;
        label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        if (font) {
            label.font = font;
        }

        return label;
    }

    private placeLabelAfterIcon(label: cc.Label, iconNode: cc.Node) {
        if (!label || !iconNode) {
            return;
        }

        const iconWidth = iconNode.getContentSize().width;
        label.node.x = iconNode.x + iconWidth + this.layoutX(this.iconTextGap);
        label.node.y = this.getLabelY(iconNode.y);
    }

    private onCoinCollected() {
        this.coinCount++;
        this.score += this.scorePerCoin;
        this.refreshText();
    }

    private onEnemyDefeated(scoreValue: number) {
        this.score += typeof scoreValue === 'number' ? scoreValue : this.scorePerEnemy;
        this.refreshText();
    }

    private onPlayerDamaged() {
        if (this.defeatFlowActive || this.gameOverStarted || this.victoryStarted) {
            return;
        }

        this.lives = Math.max(0, this.lives - 1);
        this.refreshText();

        if (this.lives <= 0) {
            this.startDefeatFlow();
        }
    }

    private onLevelReady() {
        if (this.defeatFlowActive || this.gameOverStarted || this.victoryStarted) {
            return;
        }

        this.timerRunning = true;
    }

    private startDefeatFlow() {
        this.defeatFlowActive = true;
        this.timerRunning = false;
        GamePause.pause();
        SceneChanger.pauseBgm();
        cc.systemEvent.emit('player-out-of-lives');
    }

    private onPlayerDefeatFinished() {
        if (!this.defeatFlowActive || this.gameOverStarted) {
            return;
        }

        if (this.coinCount >= this.continueCoinCost) {
            this.showContinueDialog();
            return;
        }

        this.beginGameOverTransition();
    }

    private showContinueDialog() {
        this.removeContinueOverlay();
        this.continueOverlay = this.createScreenOverlay('ContinueDialog', 210);

        const title = this.createOverlayLabel(this.continueOverlay, 'ContinueTitle', 'CONTINUE?', 0, 92, this.continueTitleFontSize, this.yellowFont);
        title.node.setContentSize(620, 96);
        const cost = this.createOverlayLabel(
            this.continueOverlay,
            'ContinueCost',
            String(this.continueCoinCost) + ' COINS',
            0,
            24,
            this.continueCostFontSize,
            this.whiteFont
        );
        cost.node.setContentSize(520, 70);

        this.createOverlayButton(this.continueOverlay, 'YES', -90, -66, () => this.continueWithCoins());
        this.createOverlayButton(this.continueOverlay, 'NO', 90, -66, () => {
            this.playContinueButtonSfx();
            this.beginGameOverTransition();
        });
        this.pinOverlayToCamera(this.continueOverlay);
    }

    private continueWithCoins() {
        this.playContinueButtonSfx();
        if (this.coinCount < this.continueCoinCost) {
            this.beginGameOverTransition();
            return;
        }

        this.coinCount -= this.continueCoinCost;
        this.lives = Math.max(1, Math.floor(this.continueReviveLives));
        this.defeatFlowActive = false;
        this.timerRunning = true;
        GamePause.resume();
        this.removeContinueOverlay();
        this.refreshText();
        SceneChanger.resumeBgmForCurrentScene();
        cc.systemEvent.emit('player-continue');
    }

    private beginGameOverTransition() {
        if (this.gameOverStarted) {
            return;
        }

        this.gameOverStarted = true;
        this.defeatFlowActive = true;
        this.timerRunning = false;
        GamePause.pause();
        SceneChanger.pauseBgm();
        this.removeContinueOverlay();
        GameAudio.getSfxDuration(this.gameOverSfxPath, this.gameOverDuration, (duration: number) => {
            if (!this.gameOverStarted || !cc.isValid(this.node)) {
                return;
            }

            const safeDuration = Math.max(0.1, duration);
            this.gameOverOverlay = this.createGameOverOverlay(safeDuration);
            this.pinOverlayToCamera(this.gameOverOverlay);
            GameAudio.playSfx(this.gameOverSfxPath, this.gameOverSfxVolume);

            this.scheduleOnce(() => {
                GamePause.resume();
                cc.director.loadScene('LevelSelectScene');
            }, safeDuration);
        });
    }

    private onPlayerVictoryFinished() {
        if (this.victoryStarted || this.gameOverStarted) {
            return;
        }

        this.beginVictoryTransition();
    }

    private beginVictoryTransition() {
        if (this.victoryStarted) {
            return;
        }

        this.victoryStarted = true;
        this.timerRunning = false;
        GamePause.pause();
        SceneChanger.pauseBgm();
        this.removeContinueOverlay();
        GameAudio.getSfxDuration(this.levelClearSfxPath, this.levelClearDuration, (duration: number) => {
            if (!this.victoryStarted || !cc.isValid(this.node)) {
                return;
            }

            const safeDuration = this.getLevelClearActiveDuration(duration);
            this.victoryOverlay = this.createVictoryOverlay(safeDuration);
            this.pinOverlayToCamera(this.victoryOverlay);
            GameAudio.playSfx(this.levelClearSfxPath, this.levelClearSfxVolume);

            this.scheduleOnce(() => {
                GamePause.resume();
                cc.director.loadScene('LevelSelectScene');
            }, safeDuration);
        });
    }

    private getLevelClearActiveDuration(duration: number) {
        const safeDuration = typeof duration === 'number' && !isNaN(duration) ? duration : this.levelClearDuration;
        const tailSilence = typeof this.levelClearTailSilenceDuration === 'number' && !isNaN(this.levelClearTailSilenceDuration)
            ? this.levelClearTailSilenceDuration
            : 0;
        return Math.max(0.1, safeDuration - Math.max(0, tailSilence));
    }

    private createGameOverOverlay(animationDuration: number) {
        const overlay = this.createScreenOverlay('GameOverTransition', 255);
        const row = new cc.Node('GameOverContent');
        row.parent = overlay;
        row.setAnchorPoint(0.5, 0.5);
        row.setPosition(0, 0);
        row.setContentSize(780, 220);

        this.createGameOverMario(row, animationDuration);
        const label = this.createOverlayLabel(row, 'GameOverText', 'GAME OVER', 135, -70, this.gameOverFontSize, this.yellowFont);
        label.node.setContentSize(640, 180);
        return overlay;
    }

    private createGameOverMario(parent: cc.Node, animationDuration: number) {
        const marioNode = new cc.Node('DefeatMario');
        marioNode.parent = parent;
        marioNode.setAnchorPoint(0.5, 0.5);
        marioNode.setPosition(-220, 0);
        marioNode.setContentSize(18, 18);
        marioNode.scale = 7;

        const sprite = marioNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        cc.loader.loadRes(this.gameOverMarioAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(marioNode)) {
                cc.warn('[GameHUD] Cannot load game over Mario atlas: ' + this.gameOverMarioAtlasPath);
                return;
            }

            const frames = [
                this.getAtlasFrame(atlas, 'defeat_0.png'),
                this.getAtlasFrame(atlas, 'defeat_1.png'),
                this.getAtlasFrame(atlas, 'defeat_2.png')
            ].filter(frame => !!frame);

            if (frames.length === 0) {
                return;
            }

            sprite.spriteFrame = frames[0];
            marioNode.runAction(this.createSpriteFrameSequence(sprite, frames, animationDuration));
        });
    }

    private createVictoryOverlay(animationDuration: number) {
        const overlay = this.createScreenOverlay('VictoryTransition', 255);
        const row = new cc.Node('VictoryContent');
        row.parent = overlay;
        row.setAnchorPoint(0.5, 0.5);
        row.setPosition(0, 0);
        row.setContentSize(820, 220);

        this.createVictoryMario(row, animationDuration);
        const label = this.createOverlayLabel(row, 'VictoryText', this.victoryText, 150, -60, this.victoryFontSize, this.yellowFont);
        label.node.setContentSize(680, 180);
        return overlay;
    }

    private createVictoryMario(parent: cc.Node, animationDuration: number) {
        const marioNode = new cc.Node('VictoryMario');
        marioNode.parent = parent;
        marioNode.setAnchorPoint(0.5, 0.5);
        marioNode.setPosition(-230, 0);
        marioNode.setContentSize(18, 18);
        marioNode.scale = 7;

        const sprite = marioNode.addComponent(cc.Sprite);
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;

        cc.loader.loadRes(this.victoryMarioAtlasPath, cc.SpriteAtlas, (err: Error, atlas: cc.SpriteAtlas) => {
            if (err || !atlas || !cc.isValid(marioNode)) {
                cc.warn('[GameHUD] Cannot load victory Mario atlas: ' + this.victoryMarioAtlasPath);
                return;
            }

            const frames = [
                this.getAtlasFrame(atlas, 'victory_0.png'),
                this.getAtlasFrame(atlas, 'victory_1.png')
            ].filter(frame => !!frame);

            if (frames.length === 0) {
                return;
            }

            sprite.spriteFrame = frames[0];
            marioNode.runAction(this.createSpriteFrameSequence(sprite, frames, animationDuration));
        });
    }

    private createSpriteFrameSequence(sprite: cc.Sprite, frames: cc.SpriteFrame[], duration: number) {
        const actions: cc.FiniteTimeAction[] = [];
        const frameDurations = this.getGameOverFrameDurations(duration, frames.length);

        for (let i = 0; i < frames.length; i++) {
            const frame = frames[i];
            actions.push(cc.callFunc(() => {
                if (cc.isValid(sprite)) {
                    sprite.spriteFrame = frame;
                }
            }));
            actions.push(cc.delayTime(frameDurations[i]));
        }

        return cc.sequence(actions);
    }

    private getGameOverFrameDurations(duration: number, frameCount: number) {
        const safeFrameCount = Math.max(1, frameCount);
        const safeDuration = Math.max(0.1, duration);
        if (safeFrameCount !== 3) {
            const evenDuration = Math.max(0.05, safeDuration / safeFrameCount);
            const durations = [];
            for (let i = 0; i < safeFrameCount; i++) {
                durations.push(evenDuration);
            }
            return durations;
        }

        const firstFrameDuration = safeDuration / 6;
        const remainingFrameDuration = (safeDuration - firstFrameDuration) / 2;
        return [
            Math.max(0.05, firstFrameDuration),
            Math.max(0.05, remainingFrameDuration),
            Math.max(0.05, remainingFrameDuration)
        ];
    }

    private createScreenOverlay(name: string, alpha: number) {
        const parent = this.hudRoot ? this.hudRoot.parent : (this.node.parent || this.node);
        const overlay = new cc.Node(name);
        overlay.parent = parent || this.node;
        overlay.zIndex = 99999;
        overlay.setAnchorPoint(0.5, 0.5);
        overlay.setContentSize(cc.winSize);
        overlay.addComponent(cc.BlockInputEvents);

        const graphics = overlay.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(0, 0, 0, alpha);
        graphics.fillRect(-cc.winSize.width * 0.5, -cc.winSize.height * 0.5, cc.winSize.width, cc.winSize.height);
        return overlay;
    }

    private createOverlayLabel(
        parent: cc.Node,
        name: string,
        text: string,
        x: number,
        y: number,
        fontSize: number,
        font: cc.BitmapFont
    ) {
        const node = new cc.Node(name);
        node.parent = parent;
        node.setAnchorPoint(0.5, 0.5);
        node.setPosition(x, y);
        node.setContentSize(360, 72);

        const label = node.addComponent(cc.Label);
        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize;
        label.horizontalAlign = cc.Label.HorizontalAlign.CENTER;
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;
        if (font) {
            label.font = font;
        }

        return label;
    }

    private createOverlayButton(parent: cc.Node, text: string, x: number, y: number, onClick: Function) {
        const buttonNode = new cc.Node(text + 'Button');
        buttonNode.parent = parent;
        buttonNode.setAnchorPoint(0.5, 0.5);
        buttonNode.setPosition(x, y);
        buttonNode.setContentSize(124, 54);

        const graphics = buttonNode.addComponent(cc.Graphics);
        graphics.fillColor = new cc.Color(28, 28, 28, 245);
        graphics.fillRect(-62, -27, 124, 54);
        graphics.lineWidth = 3;
        graphics.strokeColor = new cc.Color(255, 224, 72, 255);
        graphics.rect(-62, -27, 124, 54);
        graphics.stroke();

        this.createOverlayLabel(buttonNode, text + 'Label', text, 0, -12, this.continueButtonFontSize, this.whiteFont);
        buttonNode.on(cc.Node.EventType.TOUCH_END, () => {
            onClick();
        }, this);
        return buttonNode;
    }

    private pinOverlayToCamera(overlay: cc.Node) {
        if (!overlay || !cc.isValid(overlay)) {
            return;
        }

        const camera = this.getComponent(cc.Camera);
        const zoom = camera ? camera.zoomRatio : 1;
        overlay.scale = 1 / zoom;
        overlay.setPosition(this.node.x, this.node.y);
    }

    private removeContinueOverlay() {
        if (this.continueOverlay && cc.isValid(this.continueOverlay)) {
            this.continueOverlay.destroy();
        }
        this.continueOverlay = null;
    }

    private playContinueButtonSfx() {
        GameAudio.playSfx(this.continueButtonSfxPath, this.continueButtonSfxVolume);
    }

    private getAtlasFrame(atlas: cc.SpriteAtlas, name: string) {
        return atlas.getSpriteFrame(name) || atlas.getSpriteFrame(name.replace('.png', ''));
    }

    private refreshText() {
        if (this.worldLabel) {
            this.worldLabel.string = this.getWorldDisplayText();
        }
        if (this.livesLabel) {
            this.livesLabel.string = String(this.lives);
        }
        if (this.timeLabel) {
            this.timeLabel.string = this.formatNumber(Math.ceil(this.timeLeft), 3);
        }
        if (this.coinLabel) {
            this.coinLabel.string = this.formatNumber(this.coinCount, 2);
        }
        if (this.scoreLabel) {
            this.scoreLabel.string = this.formatNumber(this.score, 7);
        }
    }

    private pinToCameraView() {
        const camera = this.getComponent(cc.Camera);
        if (!this.hudRoot || !cc.isValid(this.hudRoot)) {
            return;
        }

        const zoom = camera ? camera.zoomRatio : 1;
        const size = cc.winSize;
        this.hudRoot.scale = this.rowScale / zoom;
        this.hudRoot.setPosition(
            this.node.x - size.width * 0.5 / zoom + this.leftMargin / zoom,
            this.node.y + size.height * 0.5 / zoom - this.topMargin / zoom
        );
        this.hudRoot.zIndex = 10000;
        this.layoutScore();
    }

    private layoutScore() {
        if (!this.scoreLabel) {
            return;
        }

        const size = cc.winSize;
        this.scoreLabel.node.x = (size.width - this.leftMargin - this.scoreRightPadding) / this.rowScale;
        this.scoreLabel.node.y = this.getLabelY();
    }

    private layoutX(screenX: number) {
        return screenX / this.rowScale;
    }

    private getLabelY(baseY: number = 0) {
        return baseY + this.layoutX(this.labelYOffset);
    }

    private getWorldDisplayText() {
        return 'WORLD' + this.worldText;
    }

    private formatNumber(value: number, digits: number) {
        const rounded = Math.max(0, Math.floor(value));
        const text = String(rounded);
        if (text.length >= digits) {
            return text;
        }

        return new Array(digits - text.length + 1).join('0') + text;
    }
}
