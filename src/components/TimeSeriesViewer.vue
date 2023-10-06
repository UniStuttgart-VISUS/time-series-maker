<template>
    <div class="d-flex">
        <v-sheet width="400" class="ma-2" rounded="sm">
            <v-form>
                <v-text-field v-model.number="numSamples"
                    label="number of samples"
                    type="number"
                    hide-details
                    density="compact"
                    min="2" step="1"
                    @update:modelValue="setSamples"/>

                <v-text-field v-model="start"
                    label="start date"
                    type="datetime-local"
                    hide-details
                    density="compact"
                    @update:modelValue="setStart"/>

                <v-text-field v-model="end"
                    label="start date"
                    type="datetime-local"
                    hide-details
                    density="compact"
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

                <div class="d-flex justify-space-between align-center mt-2">
                    <v-btn icon="mdi-refresh"
                        class="mr-2"
                        rounded="sm"
                        color="green"
                        @click="timeseries.generate()"/>
                    <div class="d-flex">
                        <v-select v-model="generatorType"
                            :items="GEN_TYPES"
                            style="width: 250px;"
                            class="mr-2"
                            label="component type"
                            item-title="title"
                            item-value="key"
                            hide-details
                            hide-no-data
                            density="compact"/>
                        <v-btn icon="mdi-plus"
                            class="mr-1"
                            rounded="sm"
                            @click="addComponent"/>
                    </div>
                </div>

            </v-form>
            <v-expansion-panels class="mt-4" variant="accordion">
                <v-expansion-panel v-for="c in timeseries.components" :key="c.id">
                    <v-expansion-panel-title>
                        <div class="d-flex justify-space-between align-center" style="width: 100%;">
                            <span class="mr-2">{{ c.id }}</span>
                            <v-btn class="mr-2"
                                icon="mdi-delete"
                                color="error"
                                rounded="sm"
                                density="compact"
                                variant="text"
                                @click.stop="removeComponent(c.id)"/>
                        </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <TimeSeriesComponentSettings :component="c" @update="update(true)"/>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-sheet>
        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <LineChart :data="lineData" x-attr="0" y-attr="1" :y-domain="[min, max]"/>
        </v-sheet>
    </div>

</template>

<script setup>
    import { ref, reactive, onMounted } from 'vue';
    import TimeSeries from '@/use/time-series';
    import LineChart from '@/components/LineChart.vue';
    import TimeSeriesComponentSettings from '@/components/TimeSeriesComponentSettings.vue';
    import { GEN_TYPES } from '@/use/generator_default';

    const timeseries = reactive(new TimeSeries());

    const numSamples = ref(timeseries.samples);
    const start = ref(timeseries.start);
    const end = ref(timeseries.end);
    const min = ref(timeseries.min);
    const max = ref(timeseries.max);
    const generatorType = ref(GEN_TYPES[0].key)

    function setMin() { timeseries.min = min.value; }
    function setMax() { timeseries.max = max.value; }
    function setStart() {
        timeseries.start = start.value;
        update(true);
    }
    function setEnd() {
        timeseries.end = end.value;
        update(true);
    }
    function setSamples() {
        if (numSamples.value > 0) {
            timeseries.samples = numSamples.value;
            update(true);
        }
    }
    function addComponent() {
        timeseries.addComponent(generatorType.value);
        update(true)
    }
    function removeComponent(id) {
        timeseries.removeComponent(id);
        update(true);
    }

    let lineData = ref([]);
    function update(generate=false) {
        if (timeseries.components.length === 0) {
            lineData.value = []
        } else {
            if (generate) {
                timeseries.generate()
            }
            lineData.value = timeseries.toChartData()
        }
    }

    onMounted(() => update(true))
</script>