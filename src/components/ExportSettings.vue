<template>
    <div class="d-flex flex-column">
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
    import { ref } from 'vue';

    import FileSaver from 'file-saver';
    import TimeSeriesCollection from '@/use/timeseries-collection';
    import { useApp } from '@/store/app';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })
    const app = useApp();

    const filename = ref("tsc_settings");
    const exportWhich = ref("tsc");

    function makeFilename() {
        if (filename.value.endsWith(".json")) {
            return filename.value;
        }
        return filename.value + ".json"
    }

    function exportData() {

        const data = exportWhich.value === "ts" && app.hasSelectedTimeSeries() ?
            props.collection.getTimeSeries(app.selectedTs).toJSON() :
            props.collection.toJSON()

        const file = new File(
            [JSON.stringify(data, null, 2)],
            makeFilename(),
            { type: "application/json" }
        )
        FileSaver.saveAs(file)
    }
</script>