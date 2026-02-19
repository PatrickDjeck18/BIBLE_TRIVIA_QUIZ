import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export function useNotifications() {
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();
    const router = useRouter();

    useEffect(() => {
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
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
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
            name: 'Quiz Biblique',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#39FF14',
        });
    }

    return true;
}

async function scheduleDailyNotifications() {
    // Cancel existing scheduled notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Morning notification at 8:00 AM
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Quiz Biblique - Bonjour!  sunrise',
            body: 'Commencez votre journée avec un quiz biblique! Testez vos connaissances et gagnez des points.',
            data: { type: 'morning_reminder' },
            sound: 'default',
        },
        trigger: {
            hour: 8,
            minute: 0,
            repeats: true,
        } as Notifications.DailyTriggerInput,
    });

    // Evening notification at 6:00 PM (18:00)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Quiz Biblique - Bonsoir!  evening',
            body: 'N\'oubliez pas votre quiz quotidien! Votre récompense quotidienne vous attend.',
            data: { type: 'evening_reminder' },
            sound: 'default',
        },
        trigger: {
            hour: 18,
            minute: 0,
            repeats: true,
        } as Notifications.DailyTriggerInput,
    });

    console.log('Daily notifications scheduled for 8:00 AM and 6:00 PM');
}

async function cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
}

// Function to get all scheduled notifications (for debugging)
export async function getScheduledNotifications() {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('Scheduled notifications:', scheduled);
    return scheduled;
}