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

    import TimeSeries from '@/use/time-series';
    import FileSaver from 'file-saver';

    const props = defineProps({
        timeseries: {
            type: TimeSeries,
            required: true
        }
    })

    const filename = ref("timeseries");

    function makeFilename() {
        if (filename.value.endsWith(".csv")) {
            return filename.value;
        }
        return filename.value + ".csv"
    }

    function exportData() {
        console.log(props.timeseries.toCSV())
        const file = new File(
            [d3.csvFormat(props.timeseries.toCSV(), props.timeseries.toCSVHeader())],
            makeFilename(),
            { type: "text/csv" }
        )
        FileSaver.saveAs(file)
    }

</script>