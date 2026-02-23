import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Configure notification behavior (native only)
if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export function useNotifications() {
    const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);
    const router = useRouter();

    useEffect(() => {
        if (Platform.OS === 'web') return;

        // Request permissions on mount
        requestPermissions();

        // Listen for notifications received while app is foregrounded
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('Notification received:', notification);
        });

        // Listen for user tapping on notification
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('Notification response:', response);
            // Navigate to the app when user taps notification
            router.replace('/');
        });

        // Schedule daily notifications
        scheduleDailyNotifications();

        return () => {
            if (Platform.OS === 'web') return;
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        scheduleDailyNotifications,
        cancelAllNotifications,
        requestPermissions,
    };
}

async function requestPermissions() {
    if (Platform.OS === 'web') return false;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
    }

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'Bible Quiz',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#39FF14',
        });
    }

    return true;
}

async function scheduleDailyNotifications() {
    if (Platform.OS === 'web') return;

    // Cancel existing scheduled notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning notification at 8:00 AM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Bible Quiz - Good Morning! ☀️',
            body: 'Start your day with a Bible quiz! Test your knowledge and earn points.',
            data: { type: 'morning_reminder' },
            sound: 'default',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 8,
            minute: 0,
        },
    });

    // Evening notification at 6:00 PM (18:00)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Bible Quiz - Good Evening! 🌙',
            body: "Don't forget your daily quiz! Your daily reward is waiting for you.",
            data: { type: 'evening_reminder' },
            sound: 'default',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 18,
            minute: 0,
        },
    });

    console.log('Daily notifications scheduled for 8:00 AM and 6:00 PM');
}

async function cancelAllNotifications() {
    if (Platform.OS === 'web') return;
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
}

// Function to get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
    if (Platform.OS === 'web') return [];
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduled);
    return scheduled;
}