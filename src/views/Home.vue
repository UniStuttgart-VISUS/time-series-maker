<template>

    <div class="d-flex justify-center align-start" style="overflow-y: auto;">

        <v-sheet width="400" class="ma-2" rounded="sm" color="grey-lighten-5" density="compact">

            <v-tabs v-model="mainTab" color="primary" grow>
                <v-tab :value="MAIN_TABS.TSC"><v-icon size="x-large">mdi-home</v-icon></v-tab>
                <v-tab :value="MAIN_TABS.TS"><v-icon size="x-large">mdi-format-list-group</v-icon></v-tab>
                <v-tab :value="MAIN_TABS.EXPORT"><v-icon size="x-large">mdi-download</v-icon></v-tab>
                <v-tab :value="MAIN_TABS.IMPORT"><v-icon size="x-large">mdi-upload</v-icon></v-tab>
            </v-tabs>

            <v-window v-model="mainTab">

                <v-window-item :key="MAIN_TABS.TSC" :value="MAIN_TABS.TSC" class="mt-2 ml-2 mr-2">
                    <TimeSeriesCollectionViewer :collection="tsc"/>
                </v-window-item>

                <v-window-item :key="MAIN_TABS.TS" :value="MAIN_TABS.TS" class="mt-2 ml-2 mr-2">
                    <TimeSeriesViewer v-if="ts" :timeseries="ts"/>
                </v-window-item>

                <v-window-item :key="MAIN_TABS.EXPORT" :value="MAIN_TABS.EXPORT" class="mt-2 ml-2 mr-2">
                    <ExportViewer :collection="tsc"/>
                </v-window-item>

                <v-window-item :key="MAIN_TABS.IMPORT" :value="MAIN_TABS.IMPORT" class="mt-2 ml-2 mr-2">
                    <ImportViewer @loaded="importData"/>
                </v-window-item>

            </v-window>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm">
            <LineChart
                :data="lineData"
                x-attr="0" y-attr="1"
                :color-scale="mainTab === MAIN_TABS.TS && ts ? app.tsColorScale : app.tscColorScale"
                :y-domain="tsc.dynamicRange ? null : [tsc.min, tsc.max]"/>
        </v-sheet>

        <v-sheet class="ma-1 mt-2 pa-1" color="grey-lighten-5" rounded="sm" style="min-width: 150px;">
            <KeepAlive>
                <OperationTree v-if="mainTab === MAIN_TABS.TS && tree"
                    :nodes="tree.nodes"
                    :links="tree.links"
                    :x-values="tsc.dataX"
                    @update="updateCompositor"/>
            </KeepAlive>
                <!-- <ComponentOperatorViewer v-if="mainTab === MAIN_TABS.TS && ts"
                    :compositor="ts.compositor"
                    @update="update(true)"
                    @switch="switchComponents"/> -->
        </v-sheet>
        <ToastHandler/>
    </div>

    <v-footer app elevation="4">
        <KeepAlive>
            <v-sheet v-if="mainTab === MAIN_TABS.TS" class="comp-footer">
                <ComponentPicker @click="addComponent" horizontal :values="tsc.dataX"/>
            </v-sheet >
        </KeepAlive>
    </v-footer>

</template>

<script setup>
    import { ref, reactive, watch, computed, onMounted } from 'vue';
    import { useApp, MAIN_TABS } from '@/store/app';
    import { storeToRefs } from 'pinia';
    import { useComms } from '@/store/comms';

    import TimeSeriesCollection from '@/use/timeseries-collection';
    import GENERATOR_TYPES from '@/use/generator-types';

    import LineChart from '@/components/LineChart.vue';
    import ComponentOperatorViewer from '@/components/ComponentOperatorViewer.vue';
    import TimeSeriesViewer from '@/components/TimeSeriesViewer.vue';
    import ExportViewer from '@/components/ExportViewer.vue';
    import ImportViewer from '@/components/ImportViewer.vue';
    import TimeSeriesCollectionViewer from '@/components/TimeSeriesCollectionViewer.vue';
    import TimeSeries from '@/use/time-series';
    import ToastHandler from '@/components/ToastHandler.vue';
    import ComponentPicker from '@/components/ComponentPicker.vue';
    import OperationTree from '@/components/OperationTree.vue';

    const app = useApp();
    const comms = useComms();

    const { mainTab } = storeToRefs(app)

    let lineData = ref([]);
    let tree = ref(null)

    const tsc = reactive(new TimeSeriesCollection());

    try {
        tsc.addTimeSeries();
        update();
    } catch(e) {
        comms.error(e.message);
    }

    const ts = computed(() => {
        if (tsc.size > 0 && app.hasSelectedTimeSeries()) {
            return tsc.getTimeSeries(app.selectedTs);
        }
        return null;
    });

    function addComponent(type) {
        if (ts.value) {
            try {
                ts.value.addComponent(type);
            } catch(e) {
                comms.error(e.message);
            }
        }
    }

    function updateCompositor(id, op) {
        if (ts.value) {
            try {
                ts.value.compositor.setOperator(id, op);
                update(true);
            } catch(e) {
                comms.error(e.message);
            }
        }
    }

    function switchComponents(from, to) {
        if (ts.value) {
            try {
                ts.value.switchComponents(from, to);
            } catch(e) {
                comms.error(e.message);
            }
        }
    }

    function update(generate=false) {
        if (mainTab.value === MAIN_TABS.TS && ts.value) {
            if (generate === true) {
                try {
                    ts.value.generate();
                } catch(e) {
                    comms.error(e.message);
                }
            }
            tree.value = ts.value.tree;
            lineData.value = ts.value.toChartData(true, app.tscOpacity)
        } else {
            app.setTSCDomain(tsc.series.map(d => d.id));
            if (generate === true) {
                try {
                    tsc.generate();
                } catch(e) {
                    comms.error(e.message);
                }
            }
            tree.value = null
            lineData.value = tsc.toChartData(app.tsOpacity)
        }
    }

    function importData(json) {
        if (json.type === "timeseries") {
            app.deselectTimeSeries();
            try {
                tsc.addTimeSeries(TimeSeries.fromJSON(tsc, json))
            } catch(e) {
                comms.error(e.message);
            }
            update(true)
        } else if (json.type === "timeseries-collection") {
            app.deselectTimeSeries();
            try {
                tsc.fromJSON(json);
            } catch(e) {
                comms.error(e);
            }
            update(true)
        }
    }

    function readTab() {
        if (mainTab.value === MAIN_TABS.TS || mainTab.value === MAIN_TABS.TSC) {
            update(true)
        }
    }

    onMounted(function() {
        app.setTSDomain(tsc.series.map(d => d.id));
        app.setTSDomain(["result"].concat(Object.values(GENERATOR_TYPES)))
        update();
    })

    watch(() => tsc.lastUpdate, update);
    watch(mainTab, readTab)
</script>

<style scoped>
.comp-footer {
    overflow-x: auto;
    width: 100%;
    z-index: 1999;
}
</style>