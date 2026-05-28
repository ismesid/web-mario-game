const { ccclass } = cc._decorator;

declare const firebase: any;

export interface GameRunRecord {
    score: number;
    coins: number;
    playTimeSec: number;
    timeLeft: number;
    world: string;
    cleared: boolean;
}

export interface GameRunViewRecord extends GameRunRecord {
    id?: string;
    uid?: string;
    email?: string;
    createdAt?: any;
    rank?: number;
}

@ccclass
export default class FirebaseService extends cc.Component {
    private static readonly sdkVersion = '10.12.5';
    private static readonly firebaseConfig = {
        apiKey: 'AIzaSyBIScXrZWZ9btlnUtHbXbFXrMBxOw9QQzE',
        authDomain: 'web-mario-game.firebaseapp.com',
        projectId: 'web-mario-game',
        storageBucket: 'web-mario-game.firebasestorage.app',
        messagingSenderId: '201502773087',
        appId: '1:201502773087:web:18cbf34ab0552b9996b0ea'
    };

    private static initializePromise: Promise<void> = null;

    public static initialize() {
        if (FirebaseService.isReady()) {
            return Promise.resolve();
        }

        if (FirebaseService.initializePromise) {
            return FirebaseService.initializePromise;
        }

        FirebaseService.initializePromise = FirebaseService.loadSdk().then(() => {
            const app = FirebaseService.getFirebase();
            if (!app) {
                throw new Error('Firebase SDK is not available.');
            }

            if (!app.apps || app.apps.length === 0) {
                app.initializeApp(FirebaseService.firebaseConfig);
            }
        }).catch((err: Error) => {
            FirebaseService.initializePromise = null;
            cc.warn('[FirebaseService] Failed to initialize Firebase.', err);
            throw err;
        });

        return FirebaseService.initializePromise;
    }

    public static signUp(email: string, password: string) {
        return FirebaseService.initialize().then(() => {
            return firebase.auth().createUserWithEmailAndPassword(email, password);
        }).then((credential: any) => {
            return FirebaseService.touchUserProfile(credential.user, true).then(() => credential.user);
        });
    }

    public static signIn(email: string, password: string) {
        return FirebaseService.initialize().then(() => {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        }).then((credential: any) => {
            return FirebaseService.touchUserProfile(credential.user, false).then(() => credential.user);
        });
    }

    public static signInOrRegister(email: string, password: string): Promise<{ user: any; registered: boolean }> {
        return FirebaseService.signIn(email, password).catch((signInError: any) => {
            const code = signInError && signInError.code ? signInError.code : '';
            if (code !== 'auth/user-not-found' && code !== 'auth/invalid-credential') {
                throw signInError;
            }

            return FirebaseService.signUp(email, password).catch((signUpError: any) => {
                const signUpCode = signUpError && signUpError.code ? signUpError.code : '';
                if (signUpCode === 'auth/email-already-in-use') {
                    throw signInError;
                }

                throw signUpError;
            }).then((user: any) => {
                return { user: user, registered: true };
            });
        }).then((result: any) => {
            if (result && typeof result.registered === 'boolean') {
                return result;
            }

            return { user: result, registered: false };
        });
    }

    public static signOut() {
        return FirebaseService.initialize().then(() => {
            return firebase.auth().signOut();
        });
    }

    public static getCurrentUser() {
        const app = FirebaseService.getFirebase();
        if (!app || !app.auth) {
            return null;
        }

        return app.auth().currentUser || null;
    }

    public static saveRun(record: GameRunRecord) {
        return FirebaseService.initialize().then(() => {
            const user = firebase.auth().currentUser;
            if (!user) {
                return false;
            }

            return firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('runs')
                .add({
                    uid: user.uid,
                    email: user.email || '',
                    score: Math.max(0, Math.floor(record.score || 0)),
                    coins: Math.max(0, Math.floor(record.coins || 0)),
                    playTimeSec: Math.max(0, record.playTimeSec || 0),
                    timeLeft: Math.max(0, record.timeLeft || 0),
                    world: record.world || '1',
                    cleared: !!record.cleared,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                })
                .then(() => true);
        });
    }

    public static getRunHistory(limit: number = 20): Promise<GameRunViewRecord[]> {
        return FirebaseService.getSignedInUser().then((user: any) => {
            if (!user) {
                return [];
            }

            return firebase.firestore()
                .collection('users')
                .doc(user.uid)
                .collection('runs')
                .orderBy('createdAt', 'desc')
                .limit(Math.max(1, Math.floor(limit)))
                .get()
                .then((snapshot: any) => {
                    const records: GameRunViewRecord[] = [];
                    snapshot.forEach((doc: any) => {
                        const data = doc.data() || {};
                        data.id = doc.id;
                        data.uid = data.uid || user.uid;
                        data.email = data.email || user.email || '';
                        (data as any).playerName = FirebaseService.getPlayerName(data.email || user.email || user.uid);
                        records.push(data);
                    });
                    return records;
                });
        });
    }

    public static getCompletedLeaderboard(limit: number = 5): Promise<GameRunViewRecord[]> {
        return FirebaseService.fetchAllCompletedRuns().then((records: GameRunViewRecord[]) => {
            FirebaseService.sortLeaderboardRecords(records);
            return records.slice(0, Math.max(1, Math.floor(limit)));
        });
    }

    public static getBestCompletedRunWithRank(): Promise<GameRunViewRecord> {
        return FirebaseService.getSignedInUser().then((user: any) => {
            if (!user) {
                return null;
            }

            return FirebaseService.fetchAllCompletedRuns().then((records: GameRunViewRecord[]) => {
                FirebaseService.sortLeaderboardRecords(records);
                for (let i = 0; i < records.length; i++) {
                    records[i].rank = i + 1;
                }

                const ownRecords = records.filter((record: GameRunViewRecord) => record.uid === user.uid);
                return ownRecords.length > 0 ? ownRecords[0] : null;
            });
        });
    }

    private static touchUserProfile(user: any, isNewUser: boolean) {
        if (!user) {
            return Promise.resolve();
        }

        const now = firebase.firestore.FieldValue.serverTimestamp();
        const data: any = {
            email: user.email || '',
            lastLoginAt: now
        };

        if (isNewUser) {
            data.createdAt = now;
        }

        return firebase.firestore()
            .collection('users')
            .doc(user.uid)
            .set(data, { merge: true });
    }

    private static getSignedInUser(): Promise<any> {
        return FirebaseService.initialize().then(() => {
            const auth = firebase.auth();
            if (auth.currentUser) {
                return auth.currentUser;
            }

            return new Promise<any>((resolve) => {
                let done = false;
                const unsubscribe = auth.onAuthStateChanged((user: any) => {
                    if (done) {
                        return;
                    }

                    done = true;
                    unsubscribe();
                    resolve(user || null);
                });

                setTimeout(() => {
                    if (done) {
                        return;
                    }

                    done = true;
                    unsubscribe();
                    resolve(auth.currentUser || null);
                }, 1500);
            });
        });
    }

    private static fetchAllCompletedRuns(): Promise<GameRunViewRecord[]> {
        return FirebaseService.getSignedInUser().then((user: any) => {
            if (!user) {
                return [];
            }

            return firebase.firestore()
                .collection('users')
                .get()
                .then((usersSnapshot: any) => {
                    const runPromises: Promise<GameRunViewRecord[]>[] = [];
                    usersSnapshot.forEach((userDoc: any) => {
                        const userData = userDoc.data() || {};
                        const uid = userDoc.id;
                        const profileEmail = userData.email || (uid === user.uid ? (user.email || '') : '');
                        runPromises.push(
                            userDoc.ref.collection('runs')
                                .where('cleared', '==', true)
                                .get()
                                .then((runsSnapshot: any) => {
                                    const records: GameRunViewRecord[] = [];
                                    runsSnapshot.forEach((runDoc: any) => {
                                        const data = runDoc.data() || {};
                                        data.id = runDoc.id;
                                        data.uid = uid;
                                        data.email = FirebaseService.pickDisplayEmail(profileEmail, data.email || '', uid === user.uid ? (user.email || '') : '');
                                        data.playerName = FirebaseService.getPlayerName(data.email || uid);
                                        records.push(data);
                                    });
                                    return records;
                                })
                        );
                    });

                    return Promise.all(runPromises).then((recordGroups: GameRunViewRecord[][]) => {
                        const records: GameRunViewRecord[] = [];
                        for (let i = 0; i < recordGroups.length; i++) {
                            for (let j = 0; j < recordGroups[i].length; j++) {
                                records.push(recordGroups[i][j]);
                            }
                        }

                        return records;
                    });
                });
        });
    }

    private static sortLeaderboardRecords(records: GameRunViewRecord[]) {
        records.sort((a: GameRunViewRecord, b: GameRunViewRecord) => {
            const scoreDiff = Math.floor(b.score || 0) - Math.floor(a.score || 0);
            if (scoreDiff !== 0) {
                return scoreDiff;
            }

            const timeDiff = (a.playTimeSec || 0) - (b.playTimeSec || 0);
            if (timeDiff !== 0) {
                return timeDiff;
            }

            return Math.floor(b.coins || 0) - Math.floor(a.coins || 0);
        });
    }

    private static attachMissingEmails(records: GameRunViewRecord[]): Promise<GameRunViewRecord[]> {
        const missingUidMap: { [uid: string]: boolean } = {};
        for (let i = 0; i < records.length; i++) {
            if (!records[i].email && records[i].uid) {
                missingUidMap[records[i].uid] = true;
            }
        }

        const uids = Object.keys(missingUidMap);
        if (uids.length === 0) {
            return Promise.resolve(records);
        }

        const profilePromises = uids.map((uid: string) => {
            return firebase.firestore().collection('users').doc(uid).get().then((doc: any) => {
                const data = doc.exists ? (doc.data() || {}) : {};
                return { uid: uid, email: data.email || '' };
            }).catch(() => {
                return { uid: uid, email: '' };
            });
        });

        return Promise.all(profilePromises).then((profiles: any[]) => {
            const emailMap: { [uid: string]: string } = {};
            for (let i = 0; i < profiles.length; i++) {
                emailMap[profiles[i].uid] = profiles[i].email;
            }

            for (let i = 0; i < records.length; i++) {
                if (!records[i].email && records[i].uid) {
                    records[i].email = emailMap[records[i].uid] || '';
                }
            }

            return records;
        });
    }

    private static getUidFromRunDoc(doc: any) {
        if (!doc || !doc.ref || !doc.ref.parent || !doc.ref.parent.parent) {
            return '';
        }

        return doc.ref.parent.parent.id || '';
    }

    private static getPlayerName(value: string) {
        const text = value || 'PLAYER';
        const atIndex = text.indexOf('@');
        return atIndex > 0 ? text.substring(0, atIndex) : text;
    }

    private static pickDisplayEmail(profileEmail: string, runEmail: string, currentUserEmail: string) {
        if (FirebaseService.isEmail(profileEmail)) {
            return profileEmail;
        }

        if (FirebaseService.isEmail(runEmail)) {
            return runEmail;
        }

        if (FirebaseService.isEmail(currentUserEmail)) {
            return currentUserEmail;
        }

        return runEmail || profileEmail || currentUserEmail || '';
    }

    private static isEmail(value: string) {
        return typeof value === 'string' && value.indexOf('@') > 0;
    }

    private static isReady() {
        const app = FirebaseService.getFirebase();
        return !!app && !!app.auth && !!app.firestore && !!app.apps && app.apps.length > 0;
    }

    private static getFirebase() {
        if (typeof window === 'undefined') {
            return null;
        }

        return (window as any).firebase || (typeof firebase !== 'undefined' ? firebase : null);
    }

    private static loadSdk() {
        if (typeof document === 'undefined') {
            return Promise.reject(new Error('Firebase can only be loaded in a browser.'));
        }

        const baseUrl = 'https://www.gstatic.com/firebasejs/' + FirebaseService.sdkVersion;
        return FirebaseService.loadScript('firebase-app-compat', baseUrl + '/firebase-app-compat.js')
            .then(() => FirebaseService.loadScript('firebase-auth-compat', baseUrl + '/firebase-auth-compat.js'))
            .then(() => FirebaseService.loadScript('firebase-firestore-compat', baseUrl + '/firebase-firestore-compat.js'));
    }

    private static loadScript(id: string, src: string) {
        return new Promise<void>((resolve, reject) => {
            const existingScript = document.getElementById(id) as HTMLScriptElement;
            if (existingScript) {
                if ((existingScript as any).__firebaseLoaded) {
                    resolve();
                    return;
                }

                existingScript.addEventListener('load', () => resolve());
                existingScript.addEventListener('error', () => reject(new Error('Failed to load ' + src)));
                return;
            }

            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.async = true;
            script.onload = () => {
                (script as any).__firebaseLoaded = true;
                resolve();
            };
            script.onerror = () => reject(new Error('Failed to load ' + src));
            document.head.appendChild(script);
        });
    }
}
