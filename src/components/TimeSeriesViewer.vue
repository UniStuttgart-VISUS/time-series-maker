<template>

    <div>
        <div class="d-flex">
            <v-text-field v-model.number="tscOpacity"
                label="line opacity"
                class="mb-1 mt-1"
                type="number"
                :min="0.01"
                :max="1"
                :step="0.01"
                density="compact"
                hide-details
                @update:model-value="timeseries.update()"/>

            <v-tooltip text="reroll new seeds for all random components" open-delay="200">
                <template v-slot:activator="{ props }">
                <v-btn v-bind="props"
                    class="ml-2 mt-2"
                    icon="mdi-dice-6"
                    rounded="sm"
                    variant="text"
                    density="compact"
                    size="x-large"
                    @click="randomSeed"/>
                </template>
            </v-tooltip>
        </div>

        <v-expansion-panels v-model="selectedComponents" class="mt-4 mb-4" rounded="sm" variant="accordion" multiple @update:model-value="setSelected">

            <v-expansion-panel v-for="c in timeseries.components" :key="c.id" :value="c.id">

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

    import { useApp } from '@/store/app';
    import { useComms } from '@/store/comms';
    import { storeToRefs } from 'pinia';

    const app = useApp()
    const comms = useComms();
    const { tscOpacity } = storeToRefs(app)

    const selectedComponents = ref([]);

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
                app.setSelectedComponents(selectedComponents.value);
            }
        } catch(e) {
            comms.error(e.message);
        }
    }

    function randomSeed() {
        props.timeseries.randomSeed();
    }

    function readSelected() {
        selectedComponents.value = Array.from(app.selectedComps.values());
    }
    function setSelected() {
        app.setSelectedComponents(selectedComponents.value);
    }

    watch(() => app.selectedComps, readSelected, { deep: true })
</script>