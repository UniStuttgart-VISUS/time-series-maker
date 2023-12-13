<template>
    <div class="ts-settings">

        <TimeSeriesCollectionSettings :collection="timeseries._tsc" collapsible/>
        <TimeSeriesSettings ref="tsSettings" :timeseries="timeseries" collapsible/>

        <v-expansion-panels v-model="selectedComponents"
            class="mt-2 mb-4 comp-panels"
            rounded="sm" variant="accordion"
            multiple @update:model-value="setSelected">

            <v-expansion-panel v-for="c in timeseries.components" :key="c.id" :value="c.id" elevation="2">

                <v-expansion-panel-title>
                    <TimeSeriesComponentTitle :component="c" @remove="removeComponent"/>
                </v-expansion-panel-title>

                <v-expansion-panel-text>
                    <TimeSeriesComponentViewer :component="c"/>
                </v-expansion-panel-text>

            </v-expansion-panel>
        </v-expansion-panels>

    </div>

</template>

<script setup>
    import { ref, watch } from 'vue';

    import TimeSeries from '@/use/time-series.js';
    import TimeSeriesComponentViewer from './TimeSeriesComponentViewer.vue';
    import TimeSeriesComponentTitle from './TimeSeriesComponentTitle.vue';
    import TimeSeriesCollectionSettings from './TimeSeriesCollectionSettings.vue';
    import TimeSeriesSettings from './TimeSeriesSettings.vue';

    import { useApp } from '@/store/app';
    import { useComms } from '@/store/comms';

    const app = useApp()
    const comms = useComms();

    const selectedComponents = ref([]);
    const tsSettings = ref(null)

    const props = defineProps({
        timeseries: {
            type: TimeSeries,
            required: true,
        }
    })

    function removeComponent(id) {
        try {
            props.timeseries.removeComponent(id);
            if (app.isSelectedComponent(id)) {
                selectedComponents.value.splice(selectedComponents.value.indexOf(id))
                app.removeSelectedComponent(id);
            }
        } catch(e) {
            comms.error("remove component error: " + e.toString());
        }
    }

    function readSelected() {
        selectedComponents.value = Array.from(app.selectedComps.values());
        if (tsSettings.value) {
            tsSettings.value.readVisibility()
        }
    }
    function setSelected() {
        app.setSelectedComponents(selectedComponents.value);
    }

    watch(() => app.selectedComps, readSelected, { deep: true })

</script>