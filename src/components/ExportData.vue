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
            :disabled="!app.hasSelectedTimeSeries()"
            @update:model-value="update"/>

        <v-select v-model="dateFormat"
            :items="dateOptions"
            item-title="key"
            item-value="value"
            density="compact"
            hide-details
            label="date format"
            @update:model-value="update"/>

        <v-select v-model="separator"
            :items="[',', ';']"
            density="compact"
            hide-details
            label="separator"
            @update:model-value="update"/>

        <v-btn color="primary"
            class="mt-2"
            size="small"
            variant="flat"
            @click="exportData">
            export
        </v-btn>
    </div>
</template>

<script setup>

    import { ref, onMounted } from 'vue';

    import TimeSeriesCollection from '@/use/timeseries-collection.js';
    import FileSaver from 'file-saver';
    import { useComms } from '@/store/comms';
    import { useApp } from '@/store/app';
    import { DateTime } from 'luxon';
    import { formatAll } from '@/use/csv-formatter';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })
    const emit = defineEmits(["update"]);

    const app = useApp();
    const comms = useComms()

    const filename = ref("tsc_data");
    const exportWhich = ref("tsc");
    const dateFormat = ref(DateTime.DATETIME_SHORT);
    const separator = ref(",");

    const dateOptions = [
        { key: "short datetime", value: DateTime.DATETIME_SHORT },
        { key: "medium datetime", value: DateTime.DATETIME_MED },
        { key: "full datetime", value: DateTime.DATETIME_FULL },
        { key: "short date", value: DateTime.DATE_SHORT },
        { key: "medium date", value: DateTime.DATE_MED },
        { key: "full date", value: DateTime.DATE_FULL },
        { key: "milliseconds", value: "milliseconds" },
    ]

    function makeFilename() {
        if (filename.value.endsWith(".csv")) {
            return filename.value;
        }
        return filename.value + ".csv"
    }

    function exportData() {

        const { header, data } = getData()

        const file = new File(
            [formatAll(header, data, separator.value)],
            makeFilename(),
            { type: "text/csv" }
        )
        FileSaver.saveAs(file)
        comms.success("exported data to "+filename.value)
    }

    function getData() {
        const data = exportWhich.value === "ts" && app.hasSelectedTimeSeries() ?
            props.collection.getTimeSeries(app.selectedTs).toCSV() :
            props.collection.toCSV();

        return {
            header: props.collection.toCSVHeader(dateFormat.value),
            data: data,
            separator: separator.value,
        }
    }

    defineExpose({ getData });

    function update() { emit('update'); }

    onMounted(update)

</script>