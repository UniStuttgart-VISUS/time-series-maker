<template>
    <div>
        <v-text-field v-model.number="numSamples"
            label="number of samples"
            type="number"
            hide-details
            density="compact"
            min="3"
            step="1"
            @update:modelValue="setSamples"/>

        <v-text-field v-model="start"
            label="start date"
            type="datetime-local"
            hide-details
            density="compact"
            :rules="[v => v < end ? true : 'must be earlier than end']"
            @update:modelValue="setStart"/>

        <v-text-field v-model="end"
            label="start date"
            type="datetime-local"
            hide-details
            density="compact"
            :rules="[v => v > start ? true : 'must be later than start']"
            @update:modelValue="setEnd"/>

        <v-text-field v-model.number="min"
            label="minimum value"
            type="number"
            step="0.01"
            density="compact"
            hide-details
            :rules="[v => v < max ? true : 'must be smaller than maximum']"
            @update:modelValue="setMin"/>

        <v-text-field v-model.number="max"
            label="maximum value"
            type="number"
            step="0.01"
            density="compact"
            hide-details
            :rules="[v => v > min ? true : 'must be larger than minimum']"
            @update:modelValue="setMax"/>
    </div>
</template>

<script setup>

    import TimeSeries from '@/use/time-series';
    import { ref } from 'vue';

    const props = defineProps({
        timeseries: {
            type: TimeSeries,
            required: true
        }
    })

    const numSamples = ref(props.timeseries.samples);
    const start = ref(props.timeseries.start);
    const end = ref(props.timeseries.end);
    const min = ref(props.timeseries.min);
    const max = ref(props.timeseries.max);

    function setMin() {
        props.timeseries.min = min.value;
    }
    function setMax() {
        props.timeseries.max = max.value;
    }
    function setStart() {
        props.timeseries.start = start.value;
        emit("update", { start: start.value });
    }
    function setEnd() {
        props.timeseries.end = end.value;
        emit("update", { end: end.value });
    }
    function setSamples() {
        if (numSamples.value > 0) {
            props.timeseries.samples = numSamples.value;
            emit("update", { samples: numSamples.value });
        }
    }
</script>