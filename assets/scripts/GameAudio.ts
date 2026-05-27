const { ccclass } = cc._decorator;

@ccclass
export default class GameAudio extends cc.Component {
    private static clipCache: { [path: string]: cc.AudioClip } = {};
    private static pendingCallbacks: { [path: string]: Function[] } = {};

    private static maxSfxEngineVolume = 0.1;

    public static preloadSfx(path: string) {
        if (!path || GameAudio.clipCache[path] || GameAudio.pendingCallbacks[path]) {
            return;
        }

        GameAudio.pendingCallbacks[path] = [];
        GameAudio.loadSfx(path);
    }

    public static playSfx(path: string, volume: number = 100) {
        if (!path) {
            return;
        }

        const safeVolume = typeof volume === 'number' && !isNaN(volume) ? volume : 100;
        const clampedVolume = GameAudio.toEngineVolume(safeVolume);
        GameAudio.playSfxWithEngineVolume(path, clampedVolume);
    }

    public static playSfxWithEngineVolume(path: string, volume: number) {
        if (!path) {
            return;
        }

        const safeVolume = typeof volume === 'number' && !isNaN(volume) ? volume : GameAudio.maxSfxEngineVolume;
        const clampedVolume = Math.max(0, Math.min(1, safeVolume));
        const cachedClip = GameAudio.clipCache[path];
        if (cachedClip) {
            GameAudio.playClip(cachedClip, clampedVolume);
            return;
        }

        if (GameAudio.pendingCallbacks[path]) {
            GameAudio.pendingCallbacks[path].push((clip: cc.AudioClip) => {
                GameAudio.playClip(clip, clampedVolume);
            });
            return;
        }

        GameAudio.pendingCallbacks[path] = [
            (clip: cc.AudioClip) => {
                GameAudio.playClip(clip, clampedVolume);
            }
        ];

        GameAudio.loadSfx(path);
    }

    private static loadSfx(path: string) {
        cc.loader.loadRes(path, cc.AudioClip, (err: Error, clip: cc.AudioClip) => {
            const callbacks = GameAudio.pendingCallbacks[path] || [];
            delete GameAudio.pendingCallbacks[path];

            if (err || !clip) {
                cc.warn('[GameAudio] Cannot load SFX: ' + path);
                return;
            }

            GameAudio.clipCache[path] = clip;
            for (let i = 0; i < callbacks.length; i++) {
                callbacks[i](clip);
            }
        });
    }

    private static playClip(clip: cc.AudioClip, volume: number) {
        cc.audioEngine.play(clip, false, volume);
    }

    private static toEngineVolume(volume: number) {
        if (volume <= 1) {
            return Math.max(0, Math.min(GameAudio.maxSfxEngineVolume, volume));
        }

        return Math.max(0, Math.min(1, GameAudio.maxSfxEngineVolume * volume / 100));
    }
}
