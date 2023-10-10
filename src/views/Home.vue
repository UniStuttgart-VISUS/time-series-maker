<template>

    <div class="d-flex justify-center align-start">
        <v-sheet width="400" class="ma-2" rounded="sm" color="grey-lighten-5">
            <v-tabs v-model="tab" color="primary">
                <v-tab value="ts">timeseries</v-tab>
                <v-tab value="export"><v-icon size="x-large">mdi-download</v-icon></v-tab>
                <v-tab value="import"><v-icon size="x-large">mdi-upload</v-icon></v-tab>
            </v-tabs>
            <v-window v-model="tab">

                <v-window-item key="ts" value="ts" class="mt-2 ml-2 mr-2">
                    <TimeSeriesViewer :timeseries="ts"/>
                </v-window-item>

                <v-window-item key="export" value="export" class="mt-2 ml-2 mr-2">
                    <ExportViewer :timeseries="ts"/>
                </v-window-item>

                <v-window-item key="import" value="import" class="mt-2 ml-2 mr-2">
                    <ImportViewer @loaded="importData"/>
                </v-window-item>

            </v-window>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <LineChart :data="lineData"
                x-attr="0" y-attr="1"
                :y-domain="ts.dynamicRange ? null : [ts.min, ts.max]"/>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <ComponentOperatorViewer :compositor="ts.compositor" @update="update(true)" @switch="switchComponents"/>
        </v-sheet>
    </div>

</template>

<script setup>
    import { ref, reactive, onMounted, watch } from 'vue';

    import TimeSeries from '@/use/time-series';
    import LineChart from '@/components/LineChart.vue';
    import ComponentOperatorViewer from '@/components/ComponentOperatorViewer.vue';
    import TimeSeriesViewer from '@/components/TimeSeriesViewer.vue';
    import ExportViewer from '@/components/ExportViewer.vue';
    import ImportViewer from '@/components/ImportViewer.vue';

    const ts = reactive(new TimeSeries());

    const tab = ref("ts")
    let lineData = ref([]);

    function switchComponents(from, to) {
        ts.switchComponents(from, to);
    }

    function update(generate=false) {
        if (ts.size === 0) {
            lineData.value = []
        } else {
            if (generate === true) {
                ts.generate();
            }
            lineData.value = ts.toChartData()
        }
    }

    function importData(data) {
        if (data.type === "timeseries") {
            ts.fromJSON(data);
            update(true)
        }
    }

    onMounted(() => update(true))

    watch(() => ts.lastUpdate, update);
</script>