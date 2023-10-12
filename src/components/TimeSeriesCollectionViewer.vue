<template>
    <div>
        <TimeSeriesCollectionSettings :collection="collection" @update="updateSettings"/>

        <v-btn rounded="sm" variant="outlined" @click="add" style="width: 100%;" class="mb-1">
            <v-icon icon="mdi-plus"/> new time series
        </v-btn>

        <div v-for="(ts, index) in collection.series" :key="ts.id" class="mb-2">
            <v-sheet class="pa-2" rounded>
                <TimeSeriesTitle :timeseries="ts"
                    @remove="remove"
                    @copy="copy"/>
            </v-sheet>
            <v-divider v-if="index < collection.size-1" class="mt-2 border-opacity-100" color="primary"></v-divider>
        </div>
    </div>

</template>

<script setup>
    import TimeSeriesCollection from '@/use/timeseries-collection';
    import TimeSeriesTitle from '@/components/TimeSeriesTitle.vue';
    import TimeSeriesCollectionSettings from '@/components/TimeSeriesCollectionSettings.vue';
    import { useComms } from '@/store/comms';

    const comms = useComms();
    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    });

    function updateSettings(payload) {
        props.collection.setOption(payload.key, payload.value);
    }
    function add() {
        try {
            props.collection.addTimeSeries();
        } catch(e) {
            comms.error(e.message);
        }
    }
    function remove(id) {
        try {
            props.collection.removeTimeSeries(id);
        } catch(e) {
            comms.error(e.message);
        }
    }
    function copy(id) {
        const ts = props.collection.getTimeSeries(id);
        if (ts) {
            try {
                // tsCopy.randomSeed();
                props.collection.addTimeSeries(ts.copy());
            } catch(e) {
                comms.error(e.message);
            }
        }
    }
</script>