const { ccclass, property } = cc._decorator;

@ccclass
export default class SceneChanger extends cc.Component {
    goToLevelSelect() {
        cc.director.loadScene('LevelSelectScene');
    }

    goToMainGame() {
        cc.director.loadScene('MainGameScene');
    }

    goToStart() {
        cc.director.loadScene('StartScene');
    }
}