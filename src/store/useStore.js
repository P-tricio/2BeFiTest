import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
    persist(
        (set, get) => ({
            // User Profile
            user: {
                name: '',
                age: '',
                gender: '',
                restingHeartRate: '',
                level: 'general', // 'adapted', 'general', 'advanced'
                uid: null, // Firebase Auth UID
                email: null,
            },
            setUser: (data) => set((state) => ({ user: { ...state.user, ...data } })),
            setAuthUser: (authUser) => {
                set((state) => ({
                    user: {
                        ...state.user,
                        uid: authUser?.uid || null,
                        email: authUser?.email || null,
                        name: authUser?.displayName || state.user.name
                    }
                }));

                // Fetch Profile & PAR-Q if logged in
                if (authUser?.uid) {
                    import('../lib/firebase').then(async ({ db }) => {
                        const { doc, getDoc } = await import('firebase/firestore');
                        const docRef = doc(db, 'users', authUser.uid);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            const data = docSnap.data();
                            set((state) => ({
                                parq: data.parq ? { ...state.parq, ...data.parq } : state.parq,
                                user: { ...state.user, ...data.profile } // If we saved profile there too
                            }));
                        }
                    });
                }
            },
            headerTitle: '',
            setHeaderTitle: (title) => set({ headerTitle: title }),

            setLevel: (level) => set((state) => ({ user: { ...state.user, level } })),

            // Safety / Onboarding
            parq: {
                completed: false,
                passed: false, // true if NO to critical questions and HR < 100
                disclaimerAccepted: false,
            },
            setParqObj: (data) => {
                set({ parq: { ...data } });
                // Cloud Sync
                const state = get();
                if (state.user.uid) {
                    import('../lib/firebase').then(async ({ db }) => {
                        const { doc, setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'users', state.user.uid), { parq: data }, { merge: true });
                    });
                }
            },
            acceptDisclaimer: () => {
                set((state) => ({ parq: { ...state.parq, disclaimerAccepted: true } }));
                // Cloud Sync
                const state = get();
                if (state.user.uid) {
                    import('../lib/firebase').then(async ({ db }) => {
                        const { doc, setDoc } = await import('firebase/firestore');
                        await setDoc(doc(db, 'users', state.user.uid), { parq: { ...state.parq, disclaimerAccepted: true } }, { merge: true });
                    });
                }
            },

            // Test Results
            results: {
                cardio: null, // { type: 'rockport' | 'step' | 'burpee' | 'ruffier', value: ..., score: ... }
                strength: {
                    squat: null,
                    plank: null,
                    pushup: null,
                },
                agility: { // Now displayed as "Control"
                    tapping: null, // { right: 0, left: 0, asymmetry: 0 }
                    hops: null,
                    blindStork: null,
                },
                mobility: {
                    shoulder: null,
                    overheadSquat: null,
                },
                composition: null, // { weight, waist, height(from user), bmi, ica }
            },
            setTestResult: async (category, testName, data) => {
                // Update Local State AND inject Level
                set((state) => {
                    const dataWithLevel = { ...data, level: state.user.level };

                    if (testName) {
                        return {
                            results: {
                                ...state.results,
                                [category]: {
                                    ...state.results[category],
                                    [testName]: dataWithLevel
                                }
                            }
                        };
                    } else if (category === 'composition') {
                        return {
                            results: {
                                ...state.results,
                                composition: { ...state.results.composition, ...dataWithLevel }
                            }
                        };
                    } else {
                        return {
                            results: {
                                ...state.results,
                                [category]: dataWithLevel
                            }
                        };
                    }
                });

                // Sync to Firestore if User is Logged In
                const state = get();
                if (state.user.uid) {
                    try {
                        const { db } = await import('../lib/firebase');
                        const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');

                        await addDoc(collection(db, 'results'), {
                            uid: state.user.uid,
                            level: state.user.level, // Save context
                            category,
                            test: testName || category,
                            data: { ...data, level: state.user.level },
                            timestamp: serverTimestamp()
                        });
                        console.log("Result saved to Firestore");
                    } catch (e) {
                        console.error("Error saving to Firestore", e);
                    }
                }
            },

            resetApp: () => set({
                user: { name: '', age: '', gender: '', restingHeartRate: '', level: 'general', uid: null, email: null },
                parq: { completed: false, passed: false },
                results: { cardio: null, strength: { squat: null, plank: null }, agility: { tapping: null }, mobility: { shoulder: null, overheadSquat: null } }
            }),
        }),
        {
            name: 'fitness-app-storage', // unique name
        }
    )
);

export default useStore;
