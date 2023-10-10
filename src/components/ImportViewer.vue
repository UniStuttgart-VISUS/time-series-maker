<template>
    <div>
        <v-file-input v-model="files"
            accept="application/json"
            label="settings file"
            @update:model-value="loadFile"/>
    </div>
</template>

<script setup>

    import { ref } from 'vue';

    const files = ref([])
    const emit = defineEmits(["loaded"]);

    function loadFile() {

        if (files.value.length > 0) {
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                const data = JSON.parse(reader.result)
                emit("loaded", data);
                files.value = [];
            });
            reader.readAsText(files.value[0]);
        }
    }
</script>