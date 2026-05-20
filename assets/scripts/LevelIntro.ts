const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelIntro extends cc.Component {
    @property(cc.Node)
    introRoot: cc.Node = null;

    @property
    minDisplayTime: number = 1.2;

    @property
    fadeDuration: number = 0.35;

    @property
    startLevelImmediately: boolean = false;

    private startTime = 0;
    private isLevelReady = false;

    onLoad() {
        this.startTime = Date.now() / 1000;
        this.showIntro();
        cc.systemEvent.emit('level-intro-start');
        if (this.startLevelImmediately) {
            cc.systemEvent.emit('level-intro-ready');
        }
        cc.systemEvent.on('level-ready', this.onLevelReady, this);
    }

    onDestroy() {
        cc.systemEvent.off('level-ready', this.onLevelReady, this);
    }

    private showIntro() {
        const root = this.getIntroRoot();
        if (!root) {
            cc.warn('[LevelIntro] introRoot is not assigned and LevelIntroUI was not found.');
            return;
        }

        root.active = true;
        root.opacity = 255;
        root.zIndex = 9999;
        root.setPosition(0, 0);
        const canvas = cc.find('Canvas') || root.parent || this.node;
        root.setContentSize(canvas.width || 960, canvas.height || 640);
        this.introRoot = root;
    }

    private onLevelReady() {
        if (this.isLevelReady) {
            return;
        }

        this.isLevelReady = true;
        const elapsed = Date.now() / 1000 - this.startTime;
        const remaining = Math.max(0, this.minDisplayTime - elapsed);
        this.scheduleOnce(() => this.hideIntro(), remaining);
    }

    private hideIntro() {
        const root = this.getIntroRoot();
        if (!root) {
            return;
        }

        cc.tween(root)
            .to(this.fadeDuration, { opacity: 0 })
            .call(() => {
                root.active = false;
                root.opacity = 255;
            })
            .start();
    }

    private getIntroRoot() {
        if (this.introRoot && cc.isValid(this.introRoot)) {
            return this.introRoot;
        }

        return cc.find('Canvas/LevelIntroUI') || cc.find('LevelIntroUI');
    }
}
