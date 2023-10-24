<template>
    <div>
        <v-text-field v-model="filename"
            label="filename"
            density="compact"
            hide-details/>

        <v-select v-model="exportWhich"
            :items="[{ title: 'Collection', value: 'tsc' }, { title: 'Timeseries', value: 'ts' }]"
            item-title="title"
            item-value="value"
            density="compact"
            hide-details
            label="which data to export"
            :disabled="!app.hasSelectedTimeSeries()"/>

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

    import TimeSeriesCollection from '@/use/timeseries-collection.js';
    import FileSaver from 'file-saver';
    import { useComms } from '@/store/comms';
    import { useApp } from '@/store/app';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })

    const app = useApp();
    const comms = useComms()

    const filename = ref("tsc_data");
    const exportWhich = ref("tsc");

    function makeFilename() {
        if (filename.value.endsWith(".csv")) {
            return filename.value;
        }
        return filename.value + ".csv"
    }

    function exportData() {

        const data = exportWhich.value === "ts" && app.hasSelectedTimeSeries() ?
            [props.collection.getTimeSeries(app.selectedTs).toCSV()] :
            props.collection.toCSV()

        const file = new File(
            [d3.csvFormatRows([props.collection.toCSVHeader()]) + "\n" + d3.csvFormatRows(data)],
            makeFilename(),
            { type: "text/csv" }
        )
        FileSaver.saveAs(file)
        comms.success("exported data to "+filename.value)
    }

</script>