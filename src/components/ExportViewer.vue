<template>
    <div>
        <v-tabs v-model="tab" grow height="30" density="compact" color="primary" bg-color="grey-lighten-4" @update:model-value="emit('update')">
            <v-tab value="settings">settings</v-tab>
            <v-tab value="data">data</v-tab>
        </v-tabs>

        <v-window v-model="tab" class="mt-2 mb-2 ml-1 mr-1">

            <v-window-item key="settings" value="settings">
                <div class="text-caption mb-2">export the settings of the timeseries collection to a JSON file that can be imported again</div>
                <ExportSettings ref="settingsC" :collection="collection" class="mb-2" @update="emit('update')"/>
            </v-window-item>

            <v-window-item key="data" value="data">
                <div class="text-caption mb-2">export the timeseries collection as a CSV file</div>
                <ExportData ref="dataC" :collection="collection" class="mb-2" @update="emit('update')"/>
            </v-window-item>

        </v-window>
    </div>
</template>

<script setup>
    import { ref } from 'vue';

    import TimeSeriesCollection from '@/use/timeseries-collection.js';
    import ExportData from '@/components/ExportData.vue';
    import ExportSettings from '@/components/ExportSettings.vue';

    const props = defineProps({
        collection: {
            type: TimeSeriesCollection,
            required: true
        }
    })
    const emit = defineEmits(["update"])

    const tab = ref("settings")

    const dataC = ref(null);
    const settingsC = ref(null);

    function getData() {
        if (tab.value === "settings") {
            return settingsC.value ? settingsC.value.getData() : {}
        } else if (dataC.value) {
            return dataC.value ? dataC.value.getData() : []
        }
        return []
    }

    function getType() {
        return tab.value === "settings" ? "json" : "csv"
    }

    defineExpose({ getData, getType });

</script>