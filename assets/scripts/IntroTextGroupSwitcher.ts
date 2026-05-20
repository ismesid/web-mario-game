const { ccclass, property } = cc._decorator;

@ccclass
export default class IntroTextGroupSwitcher extends cc.Component {
    @property(cc.Node)
    initialGroup: cc.Node = null;

    @property(cc.Node)
    readyGroup: cc.Node = null;

    @property
    textZIndex: number = 100;

    onLoad() {
        this.prepareTextGroups();
        this.showInitialGroup();
        cc.systemEvent.on('level-intro-visual-ready', this.showReadyGroup, this);
    }

    onDestroy() {
        cc.systemEvent.off('level-intro-visual-ready', this.showReadyGroup, this);
    }

    private showInitialGroup() {
        this.prepareTextGroups();

        if (this.initialGroup) {
            this.initialGroup.active = true;
        }

        if (this.readyGroup) {
            this.readyGroup.active = false;
        }
    }

    private showReadyGroup() {
        this.prepareTextGroups();

        if (this.initialGroup) {
            this.initialGroup.active = false;
        }

        if (this.readyGroup) {
            this.readyGroup.active = true;
        }
    }

    private prepareTextGroups() {
        this.setTextGroupOnTop(this.initialGroup);
        this.setTextGroupOnTop(this.readyGroup);
    }

    private setTextGroupOnTop(group: cc.Node) {
        if (!group || !cc.isValid(group)) {
            return;
        }

        group.zIndex = this.textZIndex;
        if (group.parent) {
            group.setSiblingIndex(group.parent.childrenCount - 1);
        }
    }
}
