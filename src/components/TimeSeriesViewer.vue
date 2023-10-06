<template>
    <div class="d-flex justify-center align-start">

        <v-sheet width="400" class="ma-2" rounded="sm">
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
                <v-btn icon="mdi-dice-6"
                    class="mr-2"
                    rounded="sm"
                    color="success"
                    density="compact"
                    size="x-large"
                    variant="text"
                    @click="randomSeed"/>
                <div class="d-flex">
                    <v-select v-model="generatorType"
                        :items="GENERATOR_DEFAULT_NAMES"
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
                        density="compact"
                        size="x-large"
                        variant="text"
                        @click="addComponent"/>
                </div>
            </div>

            <v-expansion-panels v-model="selectedComponents" class="mt-4" variant="accordion" multiple @update:model-value="setSelected">
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
                        <TimeSeriesComponentViewer :component="c" @update="update(true)"/>
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
    import TimeSeriesComponentViewer from './TimeSeriesComponentViewer.vue';
    import { GENERATOR_DEFAULT_NAMES } from '@/use/generator-defaults';
    import { useApp } from '@/store/app';
    import { storeToRefs } from 'pinia';

    const app = useApp()
    const timeseries = reactive(new TimeSeries());
    const selectedComponents = ref([])

    const numSamples = ref(timeseries.samples);
    const start = ref(timeseries.start);
    const end = ref(timeseries.end);
    const min = ref(timeseries.min);
    const max = ref(timeseries.max);
    const generatorType = ref(GENERATOR_DEFAULT_NAMES[0].key)

    let lineData = ref([]);

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

    function randomSeed() {
        timeseries.randomSeed();
        if (timeseries.components.length > 0) {
            lineData.value = timeseries.toChartData()
        }
    }

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

    function setSelected() {
        app.setSelected(selectedComponents.value.map(i => timeseries.components[i].id));
    }

    onMounted(() => update(true))
</script>