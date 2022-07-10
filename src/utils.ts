// Methos copied from zeitgeist-apps plasmUtil
// TODO move to common library

import { AxiosRequestConfig } from 'axios';

export const getDateUTC = (date: Date) => {
    const utcDate = Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
    );

    return new Date(utcDate);
};

export const getDateYyyyMmDd = (date: Date) => {
    return date.toISOString().split('T')[0];
};

export const getSubscanOption = () => {
    const apiKey = String(process.env.SUBSCAN_API_KEY);
    const options: AxiosRequestConfig = {};
    if (apiKey) {
        options.headers = { 'X-API-Key': apiKey };
    }

    return options;
};
