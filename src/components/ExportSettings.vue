<template>
    <div>
        <v-text-field v-model="filename"
            label="filename"
            density="compact"
            hide-details/>
        <v-btn color="primary"
            class="mt-2"
            size="small"
            variant="outlined"
            @click="exportData">
            export
        </v-btn>
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    import FileSaver from 'file-saver';
    import TimeSeriesCollection from '@/use/timeseries-collection';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })

    const filename = ref("tsc");

    function makeFilename() {
        if (filename.value.endsWith(".json")) {
            return filename.value;
        }
        return filename.value + ".json"
    }

    function exportData() {
        const file = new File(
            [JSON.stringify(props.collection.toJSON(), null, 2)],
            makeFilename(),
            { type: "application/json" }
        )
        FileSaver.saveAs(file)
    }
</script>