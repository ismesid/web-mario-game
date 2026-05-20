const { ccclass, property } = cc._decorator;

@ccclass
export default class IntroTextSwitcher extends cc.Component {
    @property(cc.Label)
    label: cc.Label = null;

    @property
    initialText: string = 'LEVEL 1';

    @property
    readyText: string = 'GET READY';

    onLoad() {
        this.setText(this.initialText);
        cc.systemEvent.on('level-intro-visual-ready', this.onVisualReady, this);
    }

    onDestroy() {
        cc.systemEvent.off('level-intro-visual-ready', this.onVisualReady, this);
    }

    private onVisualReady() {
        this.setText(this.readyText);
    }

    private setText(text: string) {
        const targetLabel = this.label || this.getComponent(cc.Label);
        if (targetLabel) {
            targetLabel.string = text;
        }
    }
}
