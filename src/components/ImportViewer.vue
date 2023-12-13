<template>
    <v-sheet class="pa-2 mb-2" color="grey-lighten-4">
        <div class="mb-2 text-caption">
            choose a previously exported JSON file
        </div>
        <v-file-input v-model="files"
            accept="application/json"
            label="json file"
            @update:model-value="loadFile"/>
    </v-sheet>
</template>

<script setup>

    import { MAIN_TABS, useApp } from '@/store/app';
    import { useComms } from '@/store/comms';
    import { ref } from 'vue';

    const app = useApp();
    const comms = useComms();
    const files = ref([]);

    const emit = defineEmits(["loaded"]);

    function loadFile() {

        if (files.value.length > 0) {
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                const data = JSON.parse(reader.result)
                setTimeout(() => {
                    const name = files.value[0].name;
                    files.value = [];
                    app.goToTab(MAIN_TABS.TSC);
                    emit("loaded", data);
                    comms.success("imported settings from " + name)
                }, 50);
            });
            reader.readAsText(files.value[0]);
        }
    }
</script>