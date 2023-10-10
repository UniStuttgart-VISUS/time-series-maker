// Utilities
import { defineStore } from 'pinia'
import * as d3 from 'd3';

export const useApp = defineStore('app', {
    state: () => ({
        selectedTs: null,
        selectedComps: new Set(),
        lineChartZoom: d3.zoomIdentity,

        tscDomain: [],
        tscColorScale: d3.scaleOrdinal(d3.schemeCategory10),

        tsDomain: [],
        tsColorScale: d3.scaleOrdinal(["#000"].concat(d3.schemeCategory10)),
    }),

    actions: {

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
        },

        deselectTimeSeries() {
            this.selectedTs = null;
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
