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

    import * as d3 from 'd3';
    import { ref } from 'vue';

    import TimeSeriesCollection from '@/use/timeseries-collection';
    import FileSaver from 'file-saver';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })

    const filename = ref("tsc");

    function makeFilename() {
        if (filename.value.endsWith(".csv")) {
            return filename.value;
        }
        return filename.value + ".csv"
    }

    function exportData() {
        const file = new File(
            [d3.csvFormat(props.collection.toCSV(), props.collection.toCSVHeader())],
            makeFilename(),
            { type: "text/csv" }
        )
        FileSaver.saveAs(file)
    }

</script>