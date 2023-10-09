// Utilities
import { defineStore } from 'pinia'
import * as d3 from 'd3';
import GENERATOR_TYPES from '@/use/generator-types';

export const useApp = defineStore('app', {
    state: () => ({
        selected: new Set(),
        lineChartZoom: d3.zoomIdentity,
        colorScale: d3.scaleOrdinal(["#000"].concat(d3.schemeSet1.slice(0, 9))).domain(["result"].concat(Object.values(GENERATOR_TYPES))),
    }),

    actions: {

        setLineChartZoom(transform) {
            this.lineChartZoom = transform;
        },

        setSelected(names) {
            this.selected.clear();
            names.forEach(n => this.selected.add(n));
        },

        addSelected(name) {
            this.selected.add(name);
        },

        removeSelected(name) {
            this.selected.delete(name);
        },

        isSelected(name) {
            return this.selected.has(name);
        },

    }
})
