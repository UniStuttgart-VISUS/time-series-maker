<template>
    <div>
        <v-tabs v-model="tab" grow height="30" density="compact" color="primary" bg-color="grey-lighten-4">
            <v-tab value="settings">settings</v-tab>
            <v-tab value="data">data</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-2 ml-1 mr-1">

            <v-window-item key="settings" value="settings">
                <div class="text-caption mb-2"><i>export the settings of the timeseries collection to a JSON file that can be imported again</i></div>
                <ExportSettings :collection="collection" class="mb-2"/>
            </v-window-item>

            <v-window-item key="data" value="data">
                <div class="text-caption mb-2"><i>export the timeseries collection as a CSV file</i></div>
                <ExportData :collection="collection" class="mb-2"/>
            </v-window-item>

        </v-window>
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    import TimeSeriesCollection from '@/use/timeseries-collection';
    import ExportData from '@/components/ExportData.vue';
    import ExportSettings from '@/components/ExportSettings.vue';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })

    const tab = ref("settings")

</script>