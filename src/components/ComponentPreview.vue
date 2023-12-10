<template>
    <div class="d-flex flex-column align-center" :style="{ 'max-width': (width+10)+'px' }" @click="emit('click')">
        <span class="text-caption preview-title" :style="{ 'max-width': width+'px' }">{{ title }}</span>
        <svg class="pa-1" ref="el" :width="width" :height="height"></svg>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, onMounted, watch } from 'vue';


    const props = defineProps({
        data: {
            type: Array,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ":("
        },
        width: {
            type: Number,
            default: 200
        },
        height: {
            type: Number,
            default: 100
        },
        color: {
            type: String,
            default: "steelblue"
        },
        backgroundColor: {
            type: String,
            default: "white"
        },
    })
    const emit = defineEmits(["click"])

    const el = ref(null);

    function draw() {
        const svg = d3.select(el.value);
        svg.selectAll("*").remove();

        const x = d3.scalePoint()
            .domain(d3.range(props.data.length))
            .range([0, props.width-5])
        const y = d3.scaleLinear()
            .domain(d3.extent(props.data))
            .range([props.height-5, 5])

        if (y.domain()[1] <= y.domain()[0]) {
            y.domain([props.data[0]-0.25, props.data[0]+0.25])
        } else {
            const extra = (y.domain()[1] - y.domain()[0]) * 0.1
            const yd = y.domain()
            y.domain([yd[0]-extra, yd[1]+extra])
        }

        const line = d3.line()
            .curve(d3.curveMonotoneX)
            .x((_, i) => x(i))
            .y(d => y(d))


        svg.style("background-color", props.backgroundColor);

        svg.append("path")
            .attr("d", line(props.data))
            .attr("stroke", props.color)
            .attr("stroke-width", 2)
            .attr("fill", "none")
    }

    onMounted(draw);

    watch(props, draw, { deep: true});
</script>

<style scoped>
.preview-title {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}
</style>