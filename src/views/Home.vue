<template>
    <div ref="wrapper" style="width: 100%; height: 100vh; overflow: auto;">

        <v-btn v-if="mainTab === MAIN_TABS.TSC"
            class="mr-2 mt-2" icon="mdi-help" rounded="1" size="small"
            density="comfortable" color="primary"
            style="position: absolute; top:0; right: 0;" @click="startTutorial"/>

        <div :class="'d-flex align-start ' + (mainTab === MAIN_TABS.TS ? 'justify-space-between' : 'justify-start')"
            style="height: 100%;">

            <v-sheet width="400" class="ma-2" rounded="sm" color="grey-lighten-5" density="compact">

                <v-tabs v-model="mainTab" color="primary" class="main-tabs" mandatory center-active>
                    <v-tab class="tab-home" :value="MAIN_TABS.TSC"><v-icon size="large">mdi-home</v-icon></v-tab>
                    <v-tab class="tab-ts" :value="MAIN_TABS.TS"><v-icon size="large">mdi-format-list-group</v-icon></v-tab>
                    <v-tab class="tab-export" :value="MAIN_TABS.EXPORT"><v-icon size="large">mdi-download</v-icon></v-tab>
                    <v-tab class="tab-import" :value="MAIN_TABS.IMPORT"><v-icon size="large">mdi-upload</v-icon></v-tab>
                    <v-tab class="tab-help" :value="MAIN_TABS.HELP"><v-icon size="large">mdi-help</v-icon></v-tab>
                </v-tabs>

                <v-window v-model="mainTab">

                    <v-window-item :key="MAIN_TABS.TSC" :value="MAIN_TABS.TSC" class="mt-2 ml-2 mr-2">
                        <TimeSeriesCollectionViewer :collection="tsc"/>
                    </v-window-item>

                    <v-window-item :key="MAIN_TABS.TS" :value="MAIN_TABS.TS" class="mt-2 ml-2 mr-2">
                        <TimeSeriesViewer v-if="ts" :timeseries="ts"/>
                    </v-window-item>

                    <v-window-item :key="MAIN_TABS.EXPORT" :value="MAIN_TABS.EXPORT" class="mt-2 ml-2 mr-2">
                        <ExportViewer ref="expView" :collection="tsc" @update="readExportData"/>
                    </v-window-item>

                    <v-window-item :key="MAIN_TABS.IMPORT" :value="MAIN_TABS.IMPORT" class="mt-2 ml-2 mr-2">
                        <ImportViewer @loaded="importData"/>
                    </v-window-item>

                    <v-window-item :key="MAIN_TABS.HELP" :value="MAIN_TABS.HELP" class="mt-2 ml-2 mr-2">
                        <div class="pa-2">
                            This page provides a few videos showcasing different functionalities.
                            Double-click a video to set it to fullscreen.
                        </div>
                    </v-window-item>

                </v-window>
            </v-sheet>

            <v-sheet class="ma-2 d-flex flex-column align-center"
                :style="{ 'overflow-x': 'auto', 'max-height': '99vh', 'width': (chartWidth+200)+'px'}"
                color="grey-lighten-5" rounded="sm">

                <div class="ma-1 mt-2 pa-1">
                    <KeepAlive>
                        <LineChart v-if="mainTab !== MAIN_TABS.HELP"
                            :data="lineData"
                            :width="chartWidth-150"
                            :height="300"
                            x-attr="0" y-attr="1"
                            :color-scale="mainTab === MAIN_TABS.TS && ts ? app.tsColorScale : app.tscColorScale"
                            :y-domain="tsc.dynamicRange ? null : [tsc.min, tsc.max]"/>
                    </KeepAlive>
                </div>

                <v-divider v-if="mainTab !== MAIN_TABS.HELP" class="mt-2 mb-2" thickness="2" style="width: 100%"></v-divider>

                <div class="ma-1 mt-2 pa-1" style="max-width: 100%;">
                    <KeepAlive>
                        <OperationTree v-if="mainTab === MAIN_TABS.TS && tree && tree.maxDepth > 0"
                            :data="tree.root"
                            :max-depth="tree.maxDepth"
                            :num-leaves="tree.numLeaves"
                            :add-node-id="tree.addNodeID"
                            :replace-node-id="replaceCompID"
                            :x-values="tsc.dataX"
                            :width="chartWidth"
                            @update="updateCompositor"
                            @switch="switchComponents"
                            @replace="replaceComponent"
                            @select="selectNode"
                            @delete="deleteComponent"/>
                    </KeepAlive>
                </div>

                <HelpPage v-if="mainTab === MAIN_TABS.HELP" :width="700"/>

                <ExportPreview v-if="mainTab === MAIN_TABS.EXPORT" :data="exportData.data" :type="exportData.type"/>

            </v-sheet>

            <div class="ma-2 pa-1 comp-wrapper">
                <KeepAlive>
                    <v-sheet v-if="mainTab === MAIN_TABS.TS" class="comp-footer" color="grey-lighten-5" rounded="sm">
                        <ComponentPicker @click="addComponent" :n="40"/>
                    </v-sheet >
                </KeepAlive>
            </div>

            <ToastHandler/>

        </div>

        <TutorialManager ref="tutorial"
            :tsID="tsc.size > 0 ? tsc.series[0].id : null"
            :size="tsc.size > 0 ? tsc.series[0].size : 0"
            @addComponent="addComponent"/>
    </div>

</template>

<script setup>
    import { ref, reactive, watch, computed, onMounted } from 'vue';
    import { useApp, MAIN_TABS } from '@/store/app';
    import { storeToRefs } from 'pinia';
    import { useComms } from '@/store/comms';

    import TimeSeriesCollection from '@/use/timeseries-collection';
    import GENERATOR_TYPES from '@/use/generator-types';

    import LineChart from '@/components/LineChart.vue';
    import TimeSeriesViewer from '@/components/TimeSeriesViewer.vue';
    import ExportViewer from '@/components/ExportViewer.vue';
    import ExportPreview from '@/components/ExportPreview.vue';
    import ImportViewer from '@/components/ImportViewer.vue';
    import TimeSeriesCollectionViewer from '@/components/TimeSeriesCollectionViewer.vue';
    import TimeSeries from '@/use/time-series';
    import ToastHandler from '@/components/ToastHandler.vue';
    import ComponentPicker from '@/components/ComponentPicker.vue';
    import OperationTree from '@/components/OperationTree.vue';
    import TutorialManager from '@/components/TutorialManager.vue';
    import HelpPage from '@/components/HelpPage.vue';
    import { useElementSize } from '@vueuse/core';

    const app = useApp();
    const comms = useComms();

    const wrapper = ref(null);
    const tutorial = ref(null);
    const expView = ref(null);

    const { mainTab } = storeToRefs(app)

    const wrapperSize = reactive(useElementSize(wrapper))
    const chartWidth = computed(() => {
        return Math.max(
            500,
            Math.min(
                wrapperSize.width*0.6,
                Math.min(wrapperSize.width-350, 900)
            )
        )
    });

    const replaceCompID = ref("");
    const lineData = ref([]);
    const exportData = reactive({
        data: {},
        type: "json"
    });
    const tree = reactive({});

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

    function startTutorial() {
        if (tutorial.value) {
            tutorial.value.start();
        }
    }

    function addComponent(type) {
        if (ts.value) {
            try {
                if (replaceCompID.value.length > 0) {
                    ts.value.replaceComponent(replaceCompID.value, type);
                } else {
                    ts.value.addComponent(type);
                }
            } catch(e) {
                comms.error("add component error: " + e.toString());
            }
        }
    }
    function deleteComponent(id) {
        if (ts.value) {
            try {
                ts.value.removeComponent(id);
                if (app.isSelectedComponent(id)) {
                    app.removeSelectedComponent(id)
                }
            } catch(e) {
                comms.error("remove component error: " + e.toString());
            }
        }
    }
    function replaceComponent(id) {
        if (ts.value) {
            replaceCompID.value = id;
        }
    }

    function selectNode(id) {
        if (ts.value) {
            try {
                if (ts.value.compositor.setLastNode(id)) {
                    ts.value.tree.addNodeID = id;
                    tree.addNodeID = id;
                    replaceCompID.value = "";
                } else {
                    comms.info("action was not possible")
                }
            } catch(e) {
                comms.error("select error: " + e.toString());
            }
        }
    }

    function updateCompositor(id, op) {
        if (ts.value) {
            try {
                ts.value.compositor.setOperator(id, op);
                update(true);
            } catch(e) {
                comms.error("update compositor error: " + e.toString());
            }
        }
    }

    function switchComponents(from, to) {
        if (ts.value) {
            try {
                ts.value.switchComponents(from, to);
            } catch(e) {
                comms.error("switch components error: " + e.toString());
            }
        }
    }

    function update(generate=false) {
        if (mainTab.value === MAIN_TABS.TS && ts.value) {
            if (generate === true) {
                try {
                    ts.value.generate();
                } catch(e) {
                    comms.error("update timeseries error: " + e.toString());
                }
            }

            if (replaceCompID.value.length > 0 && !ts.value.hasComponent(replaceCompID.value)) {
                replaceCompID.value = "";
            }

            tree.root = ts.value.tree.root;
            tree.maxDepth = ts.value.tree.maxDepth;
            tree.numLeaves = ts.value.tree.numLeaves;
            tree.addNodeID = ts.value.tree.addNodeID;
            lineData.value = ts.value.toChartData(true, app.tscOpacity)
        } else {
            app.setTSCDomain(tsc.series.map(d => d.id));
            if (generate === true) {
                try {
                    tsc.generate();
                } catch(e) {
                    comms.error("update collection error: " + e.toString());
                }
            }
            tree.root = {}
            tree.maxDepth = 0;
            tree.numLeaves = 0;
            tree.addNodeID = "";
            lineData.value = tsc.toChartData(app.tsOpacity)
        }
    }

    function importData(json) {

        if (json.type === "timeseries") {
            app.deselectTimeSeries();
            replaceCompID.value = "";
            try {
                tsc.addTimeSeries(TimeSeries.fromJSON(tsc, json))
                update(true)
            } catch(e) {
                comms.error("import timeseries error: " + e.toString());
            }
        } else if (json.type === "timeseries-collection") {
            app.deselectTimeSeries();
            replaceCompID.value = "";
            try {
                tsc.fromJSON(json);
                update(true)
            } catch(e) {
                comms.error("import collection error: " + e.toString());
            }
        }
    }

    function readExportData() {
        if (expView.value) {
            exportData.data = expView.value.getData();
            exportData.type = expView.value.getType();
        }
    }
    function readTab() {
        if (mainTab.value === MAIN_TABS.TS || mainTab.value === MAIN_TABS.TSC) {
            update(true)
        } else if (mainTab.value === MAIN_TABS.EXPORT) {
            readExportData();
        }
    }

    onMounted(function() {
        app.setTSCDomain(tsc.series.map(d => d.id));
        app.setTSDomain(["result"].concat(Object.values(GENERATOR_TYPES)))
        update();
    })

    watch(() => tsc.lastUpdate, update);
    watch(mainTab, readTab)
    watch(expView, (_, prevVal) => {
        if (prevVal === null) {
            readExportData();
        }
    })
</script>

<style scoped>
.comp-footer {
    overflow-x: auto;
    width: 100%;
    z-index: 1999;
}
</style>