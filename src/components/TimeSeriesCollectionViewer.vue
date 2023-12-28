<template>
    <div>
        <TimeSeriesCollectionSettings :collection="collection" collapsible/>

        <v-btn rounded="sm" color="primary" @click="add" style="width: 100%;" class="mb-1 new-ts" elevation="0">
            <v-icon icon="mdi-plus"/> new time series
        </v-btn>

        <div>
            <v-text-field v-model.number="tscOpacity"
                label="line opacity"
                class="mb-2"
                type="number"
                :min="0.01"
                :max="1"
                :step="0.01"
                density="compact"
                hide-details
                @update:model-value="collection.update()"/>
        </div>

        <div v-for="(ts, index) in collection.series" :key="ts.id" class="mb-2">
            <v-sheet class="pa-2" rounded>
                <TimeSeriesTitle :timeseries="ts" :key="ts.id"
                    @remove="remove"
                    @copy="copy"/>
            </v-sheet>
            <v-divider v-if="index < collection.size-1" class="mt-2 border-opacity-100" color="primary"></v-divider>
        </div>
    </div>

</template>

<script setup>
    import TimeSeriesCollection from '@/use/timeseries-collection.js';
    import TimeSeriesTitle from '@/components/TimeSeriesTitle.vue';
    import TimeSeriesCollectionSettings from '@/components/TimeSeriesCollectionSettings.vue';
    import { useComms } from '@/store/comms';
    import { useApp } from '@/store/app';
    import { storeToRefs } from 'pinia';

    const comms = useComms();
    const app = useApp();

    const { tscOpacity } = storeToRefs(app);

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    });

    function add() {
        try {
            props.collection.addTimeSeries();
        } catch(e) {
            comms.error(e.toString());
        }
    }
    function remove(id) {
        try {
            props.collection.removeTimeSeries(id);
        } catch(e) {
            comms.error(e.toString());
        }
    }
    function copy(id) {
        const ts = props.collection.getTimeSeries(id);
        if (ts) {
            try {
                // tsCopy.randomSeed();
                props.collection.addTimeSeries(ts.copy());
            } catch(e) {
                comms.error(e.toString());
            }
        }
    }
</script>