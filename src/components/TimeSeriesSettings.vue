<template>
    <div>
        <v-text-field v-model="start"
            label="start date"
            type="date"
            hide-details
            density="compact"
            :rules="[v => v < end ? true : 'must be earlier than end']"
            @update:modelValue="setStart"/>

        <v-text-field v-model="end"
            label="end date"
            type="date"
            hide-details
            density="compact"
            :rules="[v => v > start ? true : 'must be later than start']"
            @update:modelValue="setEnd"/>

        <v-text-field v-model.number="numSamples"
            label="number of samples"
            type="number"
            density="compact"
            hide-details
            min="3"
            step="1"
            :rules="[v => v > 2 && Number.isInteger(v) ? true : 'must be an integer >3']"
            @update:modelValue="setSamples"/>

        <v-switch v-model="dynamicRange"
            class="d-flex justify-center"
            label="dynamic range"
            color="primary"
            density="compact"
            @update:model-value="setDynamicRange"/>

        <div v-if="!dynamicRange" class="d-flex">

            <v-text-field v-model.number="min"
                label="minimum value"
                type="number"
                step="0.01"
                density="compact"
                hide-details
                class="mr-1"
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
    const emit = defineEmits(["update"])

    const numSamples = ref(props.timeseries.samples);
    const start = ref(props.timeseries.start);
    const end = ref(props.timeseries.end);
    const min = ref(props.timeseries.min);
    const max = ref(props.timeseries.max);
    const dynamicRange = ref(props.timeseries.dynamicRange);

    function setMin() {
        props.timeseries.min = min.value;
    }
    function setMax() {
        props.timeseries.max = max.value;
    }
    function setStart() {
        props.timeseries.start = start.value;
        emit("update", { key: "start", value: start.value });
    }
    function setEnd() {
        props.timeseries.end = end.value;
        emit("update", { key: "end", value: end.value });
    }
    function setSamples() {
        if (numSamples.value > 2 && Number.isInteger(numSamples.value)) {
            props.timeseries.samples = numSamples.value;
            emit("update", { key: "samples", value: numSamples.value });
        }
    }
    function setDynamicRange() {
        props.timeseries.dynamicRange = dynamicRange.value;
        emit("update", { key: "dynamicRange", value: dynamicRange.value });
    }
</script>