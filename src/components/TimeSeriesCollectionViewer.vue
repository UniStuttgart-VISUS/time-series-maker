<template>
    <div>
        <TimeSeriesCollectionSettings :collection="collection" @update="updateSettings"/>

        <v-sheet v-for="ts in collection.series" :key="ts.id" class="mb-2 pa-2" rounded="sm" border>
            <TimeSeriesTitle :timeseries="ts"
                @remove="remove"
                @copy="copy"/>
        </v-sheet>
    </div>

</template>

<script setup>
    import TimeSeriesCollection from '@/use/timeseries-collection';
    import TimeSeriesTitle from '@/components/TimeSeriesTitle.vue';
    import TimeSeriesCollectionSettings from '@/components/TimeSeriesCollectionSettings.vue';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    });

    function updateSettings(payload) {
        props.collection.setOption(payload.key, payload.value);
    }
    function remove(id) {
        props.collection.removeTimeSeries(id);
    }
    function copy(id) {
        const ts = props.collection.getTimeSeries(id);
        if (ts) {
            // tsCopy.randomSeed();
            props.collection.addTimeSeries(ts.copy());
        }
    }
</script>