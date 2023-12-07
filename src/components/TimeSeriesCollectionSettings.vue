<template>
    <div class="tsc-settings">
        <div class="d-flex mb-1">
            <v-text-field v-model="start"
                label="start date"
                type="date"
                hide-details
                class="mr-1"
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
        </div>

        <v-switch v-model="dynamicRange"
            class="d-flex justify-center"
            label="dynamic range"
            color="primary"
            density="compact"
            @update:model-value="setDynamicRange"/>

        <div class="d-flex mb-1">
            <v-text-field v-model.number="numSamples"
                label="# samples"
                type="number"
                density="compact"
                class="mr-1"
                hide-details
                min="3"
                step="1"
                :rules="[v => v > 2 && Number.isInteger(v) ? true : 'must be an integer >3']"
                @update:modelValue="setSamples"/>

            <v-text-field v-if="!dynamicRange"
                v-model.number="min"
                label="minimum value"
                type="number"
                step="0.01"
                density="compact"
                hide-details
                class="mr-1"
                :rules="[v => v < max ? true : 'must be smaller than maximum']"
                @update:modelValue="setMin"/>

            <v-text-field v-if="!dynamicRange"
                v-model.number="max"
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

    import TimeSeriesCollection from '@/use/timeseries-collection.js';
    import { ref } from 'vue';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })
    const emit = defineEmits(["update"])

    const numSamples = ref(props.collection.samples);
    const start = ref(props.collection.start);
    const end = ref(props.collection.end);
    const min = ref(props.collection.min);
    const max = ref(props.collection.max);
    const dynamicRange = ref(props.collection.dynamicRange);

    function setMin() {
        props.collection.min = min.value;
    }
    function setMax() {
        props.collection.max = max.value;
    }
    function setStart() {
        props.collection.start = start.value;
        emit("update", { key: "start", value: start.value });
    }
    function setEnd() {
        props.collection.end = end.value;
        emit("update", { key: "end", value: end.value });
    }
    function setSamples() {
        if (numSamples.value > 2 && Number.isInteger(numSamples.value)) {
            props.collection.samples = numSamples.value;
            emit("update", { key: "samples", value: numSamples.value });
        }
    }
    function setDynamicRange() {
        props.collection.dynamicRange = dynamicRange.value;
        emit("update", { key: "dynamicRange", value: dynamicRange.value });
    }
</script>