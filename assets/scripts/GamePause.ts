export default class GamePause {
    public static paused = false;
    private static pausedActionTargets: any[] = [];

    public static pause() {
        if (GamePause.paused) {
            return;
        }

        GamePause.paused = true;
        const actionManager: any = cc.director.getActionManager();
        if (actionManager && actionManager.pauseAllRunningActions) {
            GamePause.pausedActionTargets = actionManager.pauseAllRunningActions() || [];
        }
    }

    public static resume() {
        const actionManager: any = cc.director.getActionManager();
        if (actionManager && actionManager.resumeTargets && GamePause.pausedActionTargets.length > 0) {
            actionManager.resumeTargets(GamePause.pausedActionTargets);
        }

        GamePause.pausedActionTargets = [];
        GamePause.paused = false;
    }
}
