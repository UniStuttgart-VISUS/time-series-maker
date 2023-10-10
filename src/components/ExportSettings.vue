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
        if (filename.value.endsWith(".json")) {
            return filename.value;
        }
        return filename.value + ".json"
    }

    function exportData() {
        const file = new File(
            [JSON.stringify(props.timeseries.toJSON(), null, 2)],
            makeFilename(),
            { type: "application/json" }
        )
        FileSaver.saveAs(file)
    }
</script>