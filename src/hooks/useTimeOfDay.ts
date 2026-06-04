import { useState, useEffect } from 'react';

export enum TimeOfDay {
    Morning = 'Morning',
    Afternoon = 'Afternoon',
    Evening = 'Evening',
    Night = 'Night',
}

export const useTimeOfDay = () => {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.Morning);

    useEffect(() => {
        const checkTime = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) {
                setTimeOfDay(TimeOfDay.Morning);
            } else if (hour >= 12 && hour < 17) {
                setTimeOfDay(TimeOfDay.Afternoon);
            } else if (hour >= 17 && hour < 21) {
                setTimeOfDay(TimeOfDay.Evening);
            } else {
                setTimeOfDay(TimeOfDay.Night);
            }
        };

        checkTime();
        const interval = setInterval(checkTime, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    return timeOfDay;
};
