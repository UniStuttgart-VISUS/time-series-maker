<template>

    <div class="d-flex justify-center align-start">

        <v-sheet width="350" class="ma-2" rounded="sm">

            <TimeSeriesSettings :timeseries="timeseries" @update="updateSettings"/>

            <div class="d-flex align-center mt-2">
                <v-btn icon="mdi-dice-6"
                    class="mr-2"
                    rounded="sm"
                    color="success"
                    density="compact"
                    size="x-large"
                    variant="outlined"
                    @click="randomSeed"/>
                <v-select v-model="generatorType"
                    :items="GENERATOR_DEFAULT_NAMES"
                    style="width: 250px;"
                    label="component type"
                    item-title="title"
                    item-value="key"
                    hide-details
                    hide-no-data
                    density="compact"/>
                <v-btn icon="mdi-plus"
                    class="ml-2"
                    rounded="sm"
                    density="compact"
                    size="x-large"
                    variant="outlined"
                    @click="addComponent"/>
            </div>

            <v-expansion-panels v-model="selectedComponents" class="mt-4" variant="accordion" multiple @update:model-value="setSelected">
                <v-expansion-panel v-for="c in timeseries.components" :key="c.id">

                    <v-expansion-panel-title>
                        <TimeSeriesComponentTitle :component="c" @remove="removeComponent" @rename="update"/>
                    </v-expansion-panel-title>

                    <v-expansion-panel-text>
                        <TimeSeriesComponentViewer :component="c" @update="update(true)"/>
                    </v-expansion-panel-text>

                </v-expansion-panel>
            </v-expansion-panels>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <LineChart :data="lineData" x-attr="0" y-attr="1" :y-domain="timeseries.dynamicRange ? null : [timeseries.min, timeseries.max]"/>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <ComponentOperatorViewer :compositor="timeseries.compositor" @update="update(true)" @switch="switchComponents"/>
        </v-sheet>
    </div>

</template>

<script setup>
    import { ref, reactive, onMounted, watch } from 'vue';

    import TimeSeries from '@/use/time-series';
    import LineChart from '@/components/LineChart.vue';
    import TimeSeriesComponentViewer from './TimeSeriesComponentViewer.vue';
    import TimeSeriesComponentTitle from './TimeSeriesComponentTitle.vue';
    import TimeSeriesSettings from './TimeSeriesSettings.vue';
    import ComponentOperatorViewer from './ComponentOperatorViewer.vue';

    import { GENERATOR_DEFAULT_NAMES } from '@/use/generator-defaults';
    import { useApp } from '@/store/app';

    const app = useApp()
    const timeseries = reactive(new TimeSeries());
    const selectedComponents = ref([])

    const generatorType = ref(GENERATOR_DEFAULT_NAMES[0].key)

    let lineData = ref([]);


    function addComponent() {
        timeseries.addComponent(generatorType.value);
    }
    function removeComponent(id) {
        timeseries.removeComponent(id);
    }
    function switchComponents(from, to) {
        timeseries.switchComponents(from, to);
    }

    function randomSeed() {
        timeseries.randomSeed();
    }
    function updateSettings(payload) {
        timeseries.setOption(payload.key, payload.value);
    }

    function update(generate=false) {
        if (timeseries.size === 0) {
            lineData.value = []
        } else {
            if (generate === true) {
                timeseries.generate();
            }
            lineData.value = timeseries.toChartData()
        }
    }

    function setSelected() {
        app.setSelected(selectedComponents.value.map(i => timeseries.components[i].id));
    }

    onMounted(() => update())

    watch(() => timeseries.lastUpdate, update);
</script>