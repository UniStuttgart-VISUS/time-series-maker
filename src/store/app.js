// Utilities
import { defineStore } from 'pinia'
import * as d3 from 'd3';

export const MAIN_TABS = Object.freeze({
    TSC: "tsc",
    TS: "ts",
    EXPORT: "exp",
    IMPORT: "imp"
});

export const useApp = defineStore('app', {
    state: () => ({

        mainTab: MAIN_TABS.TSC,

        selectedTs: null,
        selectedComps: new Set(),
        lineChartZoom: d3.zoomIdentity,

        tscDomain: [],
        tscColorScale: d3.scaleOrdinal(d3.schemeCategory10),

        tsDomain: [],
        tsColorScale: d3.scaleOrdinal(["#000"].concat(d3.schemeCategory10)),
    }),

    actions: {

        goToTab(name) {
            switch(name) {
                case MAIN_TABS.TSC:
                case MAIN_TABS.TS:
                case MAIN_TABS.EXPORT:
                case MAIN_TABS.IMPORT:
                    this.mainTab = name;
                    break;
            }
        },

        setTSCDomain(domain) {
            this.tscDomain = domain;
            this.tscColorScale.domain(domain);
        },

        setTSDomain(domain) {
            this.tsDomain = domain;
            this.tsColorScale.domain(domain);
        },

        setLineChartZoom(transform) {
            this.lineChartZoom = transform;
        },

        selectTimeSeries(id) {
            this.selectedComps.clear();
            this.selectedTs = id;
            this.goToTab(MAIN_TABS.TS)
            console.log()
        },

        deselectTimeSeries() {
            this.selectedTs = null;
            if (this.mainTab === MAIN_TABS.TS) {
                this.goToTab(MAIN_TABS.TSC)
            }
        },

        hasSelectedTimeSeries() {
            return this.selectedTs !== null;
        },

        isSelectedTimeSeries(id) {
            return this.selectedTs === id;
        },

        setSelectedComponents(names) {
            this.selectedComps.clear();
            names.forEach(n => this.selectedComps.add(n));
        },

        addSelectedComponent(name) {
            this.selectedComps.add(name);
        },

        removeSelectedComponent(name) {
            this.selectedComps.delete(name);
        },

        isSelectedComponent(name) {
            return this.selectedComps.has(name);
        },

    }
})
