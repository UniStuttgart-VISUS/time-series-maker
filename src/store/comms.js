import { defineStore } from 'pinia'

export const TOAST_TYPE = Object.freeze({
    DEFAULT: "default",
    INFO: "info",
    SUCCESS: "success",
    WARNING: "warn",
    ERROR: "error",
})
export const useComms = defineStore('comms', {
    state: () => ({
        messages: [],
        timestamp: Date.now(),
    }),

    getters: {
        size: state => state.messages.length
    },

    actions: {

        pop() {
            return this.messages.pop();
        },

        toast(msg, type=TOAST_TYPE.DEFAULT, options=null) {
            this.messages.push({
                type: type,
                content: msg,
                options: options
            });
            this.timestamp = Date.now();
        },

        info(msg, options=null) {
            this.toast(msg, TOAST_TYPE.INFO, options);
        },
        success(msg, options=null) {
            this.toast(msg, TOAST_TYPE.SUCCESS, options);
        },
        warning(msg, options=null) {
            this.toast(msg, TOAST_TYPE.WARNING, options);
        },
        error(msg, options=null) {
            this.toast(msg, TOAST_TYPE.ERROR, options);
        },

    }
});