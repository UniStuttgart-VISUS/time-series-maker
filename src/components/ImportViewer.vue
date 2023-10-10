<template>
    <div>
        <v-file-input v-model="files"
            accept="application/json"
            label="json file"
            @update:model-value="loadFile"/>
    </div>
</template>

<script setup>

    import { MAIN_TABS, useApp } from '@/store/app';
    import { ref } from 'vue';

    const app = useApp();
    const files = ref([]);

    const emit = defineEmits(["loaded"]);

    function loadFile() {

        if (files.value.length > 0) {
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                const data = JSON.parse(reader.result)
                setTimeout(() => {
                    files.value = [];
                    app.goToTab(MAIN_TABS.TSC);
                    console.log(data)
                    emit("loaded", data);
                }, 50);
            });
            reader.readAsText(files.value[0]);
        }
    }
</script>