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

    private timeLeft = 0;
    private coinCount = 0;
    private timerRunning = true;
    private worldLabel: cc.Label = null;
    private livesLabel: cc.Label = null;
    private timeLabel: cc.Label = null;
    private coinLabel: cc.Label = null;
    private scoreLabel: cc.Label = null;
    private whiteFont: cc.BitmapFont = null;
    private yellowFont: cc.BitmapFont = null;
    private hudRoot: cc.Node = null;

    onLoad() {
        this.timeLeft = this.startTime;
        this.hudRoot = new cc.Node('HUDRoot');
        this.hudRoot.parent = this.node.parent || this.node;
        this.hudRoot.zIndex = 10000;
        this.loadFontsAndBuild();
        cc.systemEvent.on('coin-collected', this.onCoinCollected, this);
        cc.systemEvent.on('level-ready', this.onLevelReady, this);
    }

    onDestroy() {
        cc.systemEvent.off('coin-collected', this.onCoinCollected, this);
        cc.systemEvent.off('level-ready', this.onLevelReady, this);
    }

    update(dt: number) {
        if (this.timerRunning && this.timeLeft > 0) {
            this.timeLeft = Math.max(0, this.timeLeft - dt);
            this.refreshText();
        }
    }

    lateUpdate() {
        this.pinToCameraView();
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

    private onLevelReady() {
        this.timerRunning = true;
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
