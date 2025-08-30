import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import moment from 'jalali-moment';

export default function LiveClock() {
    // Set the locale to Farsi for Jalali-Moment
    moment.locale('fa');

    const [dateTime, setDateTime] = useState(moment()); // Use local time, no .tz()

    useEffect(() => {
        // Set up a timer to update the clock every second
        const timerId = setInterval(() => {
            setDateTime(moment()); // Use local time, no .tz()
        }, 1000);

        // Clean up the timer when the component is unmounted to prevent memory leaks
        return () => {
            clearInterval(timerId);
        };
    }, []);

    // Format the date and time string based on the user's local time
    const formattedDateTime = dateTime.format('dddd، jD jMMMM jYYYY - ساعت HH:mm:ss');

    return (
        <Typography
            variant="subtitle1"
            noWrap
            component="div"
            sx={{
                fontWeight: 300,
                letterSpacing: '0.5px',
                textAlign: 'center',
            }}
        >
            {formattedDateTime}
        </Typography>
    );
}