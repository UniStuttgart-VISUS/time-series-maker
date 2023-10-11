<template></template>

<script setup>
    import { watch } from 'vue';
    import { useComms, TOAST_TYPE } from '@/store/comms';
    import { toast } from 'vue3-toastify';
    import 'vue3-toastify/dist/index.css';

    const comms = useComms();

    function showToast() {
        const msg = comms.pop();
        switch (msg.type) {
            default:
            case TOAST_TYPE.DEFAULT:
                toast(msg.content, msg.options);
                break;
            case TOAST_TYPE.INFO:
                toast.info(msg.content, msg.options);
                break;
            case TOAST_TYPE.SUCCESS:
                toast.success(msg.content, msg.options);
                break;
            case TOAST_TYPE.WARNING:
                toast.warn(msg.content, msg.options);
                break;
            case TOAST_TYPE.ERROR:
                toast.error(msg.content, msg.options);
                break;
        }
    }

    watch(() => comms.timestamp, showToast)
</script>