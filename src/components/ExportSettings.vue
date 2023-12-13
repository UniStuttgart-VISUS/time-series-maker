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
    import { ref, onMounted, watch } from 'vue';

    import FileSaver from 'file-saver';
    import TimeSeriesCollection from '@/use/timeseries-collection.js';
    import { useComms } from '@/store/comms';
    import { useApp } from '@/store/app';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })
    const emit = defineEmits(["update"]);

    const app = useApp();
    const comms = useComms();

    const filename = ref("tsc_settings");
    const exportWhich = ref("tsc");

    function makeFilename() {
        if (filename.value.endsWith(".json")) {
            return filename.value;
        }
        return filename.value + ".json"
    }

    function exportData() {

        const data = getData();

        const file = new File(
            [JSON.stringify(data, null, 2)],
            makeFilename(),
            { type: "application/json" }
        )
        FileSaver.saveAs(file)
        comms.success("exported settings to "+filename.value)
    }

    function getData() {
        return exportWhich.value === "ts" && app.hasSelectedTimeSeries() ?
            props.collection.getTimeSeries(app.selectedTs).toJSON() :
            props.collection.toJSON()
    }

    defineExpose({ getData });

    function update() { emit('update'); }

    onMounted(function() {
        filename.value = exportWhich.value === "ts" ? app.selectedTs : "collection"
        update();
    })

    watch(() => [app.selectedTs, exportWhich.value], function() {
        if (exportWhich.value === "ts" && app.selectedTs) {
            filename.value = app.selectedTs
        } else if (exportWhich.value === "tsc") {
            filename.value = "collection"
        }
    })

</script>