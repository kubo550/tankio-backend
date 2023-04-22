import _ from "lodash";

const methodNames = {
    info: 'info',
    error: 'error',
    warn: 'warn',
    debug: 'debug',
    trace: 'trace',
} as const

export class Logger {
    static info(message: string, data?: any) {
        this.log('info', {message, data})
    }

    static error(message: string, data?: any) {
        this.log('error', {message, data})
    }

    static warn(message: string, data?: any) {
        this.log('warn', {message, data})
    }

    static debug(message: string, data?: any) {
        this.log('debug', {message, data})
    }

    static trace(message: string, data?: any) {
        this.log('trace', {message, data})
    }


    static log(level: keyof typeof methodNames, data: any & { message: string }) {
        const methodName = methodNames[level];
        const date = new Date().toISOString();
        _.isEmpty(data.data) ? console[methodName](date, level, data.message) : console[methodName](date, level, data.message, data.data);
    }

}