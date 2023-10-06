// Utilities
import { defineStore } from 'pinia'
import * as d3 from 'd3';

export const useApp = defineStore('app', {
  state: () => ({
    lineChartZoom: d3.zoomIdentity
  }),

  actions: {

    setLineChartZoom(transform) {
      this.lineChartZoom = transform;
    }

  }
})
