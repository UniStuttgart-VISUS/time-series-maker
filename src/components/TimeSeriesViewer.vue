<template>

    <div>
        <div class="d-flex align-center mt-2">
            <v-btn icon="mdi-dice-6"
                class="mr-2"
                rounded="sm"
                density="compact"
                size="x-large"
                variant="outlined"
                @click="randomSeed"/>

            <v-autocomplete v-model="generatorType"
                :items="GENERATOR_DEFAULT_NAMES"
                label="component type"
                item-title="title"
                item-value="key"
                hide-details
                hide-no-data
                density="compact"
                @update:model-value="addComponent"/>
        </div>

        <v-expansion-panels v-model="selectedComponents" class="mt-4 mb-4" rounded="sm" variant="accordion" multiple @update:model-value="setSelected">

            <v-expansion-panel v-for="c in timeseries.components" :key="c.id" :value="c.id">

                <v-expansion-panel-title>
                    <TimeSeriesComponentTitle :component="c" @remove="removeComponent" @rename="update"/>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                    <TimeSeriesComponentViewer :component="c" @update="update(true)"/>
                </v-expansion-panel-text>

            </v-expansion-panel>
        </v-expansion-panels>
    </div>

</template>

<script setup>
    import { ref, watch } from 'vue';

    import TimeSeries from '@/use/time-series';
    import TimeSeriesComponentViewer from './TimeSeriesComponentViewer.vue';
    import TimeSeriesComponentTitle from './TimeSeriesComponentTitle.vue';

    import { GENERATOR_DEFAULT_NAMES } from '@/use/generator-defaults';
    import { useApp } from '@/store/app';

    const app = useApp()
    const selectedComponents = ref([]);

    const props = defineProps({
        timeseries: {
            type: TimeSeries,
            required: true,
        }
    })

    const generatorType = ref(GENERATOR_DEFAULT_NAMES[0].key)

    let lineData = ref([]);


    function addComponent() {
        props.timeseries.addComponent(generatorType.value);
    }
    function removeComponent(id) {
        props.timeseries.removeComponent(id);
    }

    function randomSeed() {
        props.timeseries.randomSeed();
    }

    function update(generate=false) {
        if (props.timeseries.size === 0) {
            lineData.value = []
        } else {
            if (generate === true) {
                props.timeseries.generate();
            }
            lineData.value = props.timeseries.toChartData()
        }
    }

    function readSelected() {
        selectedComponents.value = Array.from(app.selectedComps.values());
    }
    function setSelected() {
        app.setSelectedComponents(selectedComponents.value);
    }

    watch(() => props.timeseries.lastUpdate, update);
    watch(() => app.selectedComps, readSelected, { deep: true })
</script>