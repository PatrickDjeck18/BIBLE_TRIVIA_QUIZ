import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LevelProgress {
    levelId: string;
    completed: boolean;
    highScore: number;
    stars: number; // 0-3 stars based on performance
    attempts: number;
}

export interface GameState {
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
    lastPlayDate: string | null;
    lastRewardDate: string | null;
    dailyRewardClaimed: boolean;
    levelsProgress: Record<string, LevelProgress>;
    unlockedLevels: string[];
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
}

type GameAction =
    | { type: 'LOAD_STATE'; payload: GameState }
    | { type: 'ADD_POINTS'; payload: number }
    | { type: 'COMPLETE_LEVEL'; payload: { levelId: string; score: number; correctAnswers: number; totalQuestions: number } }
    | { type: 'CLAIM_DAILY_REWARD'; payload: { points: number; date: string } }
    | { type: 'UPDATE_STREAK'; payload: { currentStreak: number; longestStreak: number } }
    | { type: 'RECORD_ANSWERS'; payload: { total: number; correct: number } }
    | { type: 'RESET_PROGRESS' };

const initialState: GameState = {
    totalPoints: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: null,
    lastRewardDate: null,
    dailyRewardClaimed: false,
    levelsProgress: {},
    unlockedLevels: ['gen'], // Genesis is unlocked by default
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
};

const STORAGE_KEY = '@quiz_biblique_game_state';

function calculateStars(correctAnswers: number, totalQuestions: number): number {
    const percentage = (correctAnswers / totalQuestions) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
}

function gameReducer(state: GameState, action: GameAction): GameState {
    switch (action.type) {
        case 'LOAD_STATE':
            return { ...action.payload };

        case 'ADD_POINTS':
            return {
                ...state,
                totalPoints: state.totalPoints + action.payload,
            };

        case 'COMPLETE_LEVEL': {
            const { levelId, score, correctAnswers, totalQuestions } = action.payload;
            const stars = calculateStars(correctAnswers, totalQuestions);
            const existingProgress = state.levelsProgress[levelId];
            const isNewHighScore = !existingProgress || score > existingProgress.highScore;
            const newStars = Math.max(stars, existingProgress?.stars || 0);

            // Unlock next level if score >= 50%
            const levelIndex = parseInt(levelId.replace(/\D/g, ''), 10) || 0;
            const nextLevelId = getNextLevelId(levelId);
            const shouldUnlockNext = score >= 50 && nextLevelId && !state.unlockedLevels.includes(nextLevelId);

            return {
                ...state,
                levelsProgress: {
                    ...state.levelsProgress,
                    [levelId]: {
                        levelId,
                        completed: true,
                        highScore: isNewHighScore ? score : existingProgress.highScore,
                        stars: newStars,
                        attempts: (existingProgress?.attempts || 0) + 1,
                    },
                },
                unlockedLevels: shouldUnlockNext
                    ? [...state.unlockedLevels, nextLevelId]
                    : state.unlockedLevels,
            };
        }

        case 'CLAIM_DAILY_REWARD':
            return {
                ...state,
                totalPoints: state.totalPoints + action.payload.points,
                lastRewardDate: action.payload.date,
                dailyRewardClaimed: true,
            };

        case 'UPDATE_STREAK':
            return {
                ...state,
                currentStreak: action.payload.currentStreak,
                longestStreak: action.payload.longestStreak,
                lastPlayDate: new Date().toISOString().split('T')[0],
            };

        case 'RECORD_ANSWERS':
            return {
                ...state,
                totalQuestionsAnswered: state.totalQuestionsAnswered + action.payload.total,
                totalCorrectAnswers: state.totalCorrectAnswers + action.payload.correct,
            };

        case 'RESET_PROGRESS':
            return initialState;

        default:
            return state;
    }
}

function getNextLevelId(currentLevelId: string): string | null {
    const levelOrder = [
        'gen', 'exo', 'lev', 'num', 'deu', 'jos', 'jdg', 'rut', '1sa', '2sa',
        '1ki', '2ki', '1ch', '2ch', 'ezr', 'neh', 'est', 'job', 'psa', 'pro',
        'ecc', 'sng', 'isa', 'jer', 'lam', 'ezk', 'dan', 'hos', 'jol', 'amo',
        'oba', 'jon', 'mic', 'nah', 'hab', 'zep', 'hag', 'zec', 'mal',
        'mat', 'mar', 'luk', 'jhn', 'act', 'rom', '1co', '2co', 'gal', 'eph',
        'phi', 'col', '1th', '2th', '1ti', '2ti', 'tit', 'phm', 'heb', 'jas',
        '1pe', '2pe', '1jn', '2jn', '3jn', 'jud', 'rev'
    ];
    const currentIndex = levelOrder.indexOf(currentLevelId);
    if (currentIndex === -1 || currentIndex >= levelOrder.length - 1) return null;
    return levelOrder[currentIndex + 1];
}

interface GameContextType {
    state: GameState;
    addPoints: (points: number) => void;
    completeLevel: (levelId: string, score: number, correctAnswers: number, totalQuestions: number) => void;
    claimDailyReward: () => { claimed: boolean; points: number; streakBonus: number };
    recordAnswers: (total: number, correct: number) => void;
    getLevelProgress: (levelId: string) => LevelProgress | undefined;
    isLevelUnlocked: (levelId: string) => boolean;
    resetProgress: () => void;
    checkDailyStreak: () => { streakMaintained: boolean; streakBroken: boolean };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    // Load state from AsyncStorage on mount
    useEffect(() => {
        loadState();
    }, []);

    // Save state to AsyncStorage whenever it changes
    useEffect(() => {
        saveState(state);
    }, [state]);

    const loadState = async () => {
        try {
            const savedState = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                // Check if daily reward should be reset
                const today = new Date().toISOString().split('T')[0];
                if (parsed.lastRewardDate !== today) {
                    parsed.dailyRewardClaimed = false;
                }
                dispatch({ type: 'LOAD_STATE', payload: parsed });
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    };

    const saveState = async (state: GameState) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    };

    const addPoints = (points: number) => {
        dispatch({ type: 'ADD_POINTS', payload: points });
    };

    const completeLevel = (levelId: string, score: number, correctAnswers: number, totalQuestions: number) => {
        dispatch({ type: 'COMPLETE_LEVEL', payload: { levelId, score, correctAnswers, totalQuestions } });
    };

    const checkDailyStreak = (): { streakMaintained: boolean; streakBroken: boolean } => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        if (state.lastPlayDate === today) {
            return { streakMaintained: true, streakBroken: false };
        }

        if (state.lastPlayDate === yesterday) {
            // Streak continues
            const newStreak = state.currentStreak + 1;
            dispatch({
                type: 'UPDATE_STREAK',
                payload: {
                    currentStreak: newStreak,
                    longestStreak: Math.max(state.longestStreak, newStreak),
                },
            });
            return { streakMaintained: true, streakBroken: false };
        }

        if (state.lastPlayDate && state.lastPlayDate !== today && state.lastPlayDate !== yesterday) {
            // Streak broken
            dispatch({
                type: 'UPDATE_STREAK',
                payload: { currentStreak: 1, longestStreak: state.longestStreak },
            });
            return { streakMaintained: false, streakBroken: true };
        }

        // First time playing
        dispatch({
            type: 'UPDATE_STREAK',
            payload: { currentStreak: 1, longestStreak: state.longestStreak },
        });
        return { streakMaintained: true, streakBroken: false };
    };

    const claimDailyReward = (): { claimed: boolean; points: number; streakBonus: number } => {
        const today = new Date().toISOString().split('T')[0];

        if (state.dailyRewardClaimed) {
            return { claimed: false, points: 0, streakBonus: 0 };
        }

        // Check and update streak first
        checkDailyStreak();

        // Base daily reward
        const baseReward = 100;

        // Streak bonus (increases with streak)
        const streakBonus = Math.min(state.currentStreak * 10, 100);

        const totalReward = baseReward + streakBonus;

        dispatch({
            type: 'CLAIM_DAILY_REWARD',
            payload: { points: totalReward, date: today },
        });

        return { claimed: true, points: baseReward, streakBonus };
    };

    const recordAnswers = (total: number, correct: number) => {
        dispatch({ type: 'RECORD_ANSWERS', payload: { total, correct } });
    };

    const getLevelProgress = (levelId: string): LevelProgress | undefined => {
        return state.levelsProgress[levelId];
    };

    const isLevelUnlocked = (levelId: string): boolean => {
        return state.unlockedLevels.includes(levelId);
    };

    const resetProgress = () => {
        dispatch({ type: 'RESET_PROGRESS' });
    };

    return (
        <GameContext.Provider
            value={{
                state,
                addPoints,
                completeLevel,
                claimDailyReward,
                recordAnswers,
                getLevelProgress,
                isLevelUnlocked,
                resetProgress,
                checkDailyStreak,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}