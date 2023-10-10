<template>

    <div class="d-flex justify-center align-start">

        <v-sheet width="400" class="ma-2" rounded="sm" color="grey-lighten-5" density="compact">

            <v-tabs v-model="tab" color="primary" grow @update:model-value="readTab">
                <v-tab value="tsc"><v-icon size="x-large">mdi-card-multiple</v-icon></v-tab>
                <v-tab value="ts"><v-icon size="x-large">mdi-cog</v-icon></v-tab>
                <v-tab value="export"><v-icon size="x-large">mdi-download</v-icon></v-tab>
                <v-tab value="import"><v-icon size="x-large">mdi-upload</v-icon></v-tab>
            </v-tabs>

            <v-window v-model="tab">

                <v-window-item key="tsc" value="tsc" class="mt-2 ml-2 mr-2">
                    <TimeSeriesCollectionViewer :collection="tsc"/>
                </v-window-item>

                <v-window-item key="ts" value="ts" class="mt-2 ml-2 mr-2">
                    <TimeSeriesViewer v-if="ts" :timeseries="ts"/>
                </v-window-item>

                <v-window-item key="export" value="export" class="mt-2 ml-2 mr-2">
                    <ExportViewer :collection="tsc"/>
                </v-window-item>

                <v-window-item key="import" value="import" class="mt-2 ml-2 mr-2">
                    <ImportViewer @loaded="importData"/>
                </v-window-item>

            </v-window>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <LineChart
                :data="lineData"
                x-attr="0" y-attr="1"
                :color-scale="tab === 'ts' && ts ? app.tsColorScale : app.tscColorScale"
                :y-domain="tsc.dynamicRange ? null : [tsc.min, tsc.max]"/>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm" style="min-width: 150px;">
            <ComponentOperatorViewer v-if="tab === 'ts' && ts"
                :compositor="ts.compositor"
                @update="update(true)"
                @switch="switchComponents"/>
        </v-sheet>
    </div>

</template>

<script setup>
    import { ref, reactive, watch, computed, onMounted } from 'vue';
    import { useApp } from '@/store/app';

    import TimeSeriesCollection from '@/use/timeseries-collection';
    import GENERATOR_TYPES from '@/use/generator-types';

    import LineChart from '@/components/LineChart.vue';
    import ComponentOperatorViewer from '@/components/ComponentOperatorViewer.vue';
    import TimeSeriesViewer from '@/components/TimeSeriesViewer.vue';
    import ExportViewer from '@/components/ExportViewer.vue';
    import ImportViewer from '@/components/ImportViewer.vue';
    import TimeSeriesCollectionViewer from '@/components/TimeSeriesCollectionViewer.vue';

    const app = useApp();

    const tab = ref("tsc")
    let lineData = ref([]);

    const tsc = reactive(new TimeSeriesCollection());
    const ts = computed(() => {
        if (tsc.size > 0 && app.hasSelectedTimeSeries()) {
            return tsc.getTimeSeries(app.selectedTs);
        }
        return null;
    });


    function switchComponents(from, to) {
        if (ts.value) {
            ts.value.switchComponents(from, to);
        }
    }

    function update(generate=false) {
        if (tab.value === "ts" && ts.value) {
            lineData.value = []
            if (generate === true) {
                ts.value.generate();
            }
            lineData.value = ts.value.toChartData()
        } else {
            lineData.value = []
            app.setTSCDomain(tsc.series.map(d => d.id));
            if (generate === true) {
                tsc.generate();
            }
            lineData.value = tsc.toChartData()
        }
    }

    function importData(data) {
        if (data.type === "timeseries-collection") {
            app.deselectTimeSeries();
            tsc.fromJSON(data);
            update(true)
        }
    }

    function readTab() {
        if (tab.value === "ts" || tab.value === "tsc") {
            update(true)
        }
    }
    function setTab() {
        tab.value = app.hasSelectedTimeSeries() ? "ts" : "tsc";
        update(true)
    }

    onMounted(function() {
        app.setTSDomain(tsc.series.map(d => d.id));
        app.setTSDomain(["result"].concat(Object.values(GENERATOR_TYPES)))
        update();
    })

    watch(() => tsc.lastUpdate, update);
    watch(() => app.selectedTs, setTab)
</script>