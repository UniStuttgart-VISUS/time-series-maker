<template>
    <svg ref="el" :width="width" :height="height"></svg>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, onMounted, watch } from 'vue';
    import { NODE_TYPE } from '@/use/compositor';

    const props = defineProps({
        nodes: {
            type: Array,
            required: true
        },
        links: {
            type: Array,
            required: true
        },
        xValues: {
            type: Array,
            required: true
        },
        maxDepth: {
            type: Number,
            required: true
        },
        numLeaves: {
            type: Number,
            required: true
        },
        width: {
            type: Number,
            default: 300
        },
        height: {
            type: Number,
            default: 500
        },
    })

    const el = ref(null)

    function getNode(id) {
        return props.nodes.find(d => d.id === id);
    }

    function draw() {
        const svg = d3.select(el.value);
        svg.selectAll("*").remove();

        const x = d3.scaleBand()
            .domain(d3.range(0, props.numLeaves))
            .range([0, props.width])

        const y = d3.scalePoint()
            .domain(d3.range(d3.min(props.nodes, d => d.index), d3.max(props.nodes, d => d.index)+1))
            .range([0, props.height])

        svg.append("g")
            .attr("stroke-width", 2)
            .selectAll("line")
            .data(props.nodes)
            .join("line")
                .attr("x1", d => x(d.depth) + x.bandwidth() * 0.5)
                .attr("y1", d => y(d.index) + y.step() * 0.5)
                .attr("x2", d => x(d.depth) + x.bandwidth())
                .attr("y2", d => y(d.index) + y.step() * 0.5)
                .attr("stroke", "red")

        const line = {};

        const xdomain = d3.extent(props.xValues);
        const ys = d3.scaleLinear()
            .domain(xdomain)
            .range([0, y.step()])

        const xs = {};

        props.nodes.forEach(d => {
            if (!d.values) return;
            ys[d.id] = d3.scaleLinear()
                .domain(d3.extent(d.values))
                .range([0, x.bandwidth() * 0.5])

            line[d.id] = d3.line()
                .curve(d3.curveMonotoneX)
                .x(dd => ys[d.id](dd))
                .y((_, i) => xs(props.xValues[i]))
        });

        svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1)
            .selectAll("path")
            .data(props.nodes.filter(d => line[d.id]))
            .join("path")
                .attr("transform", d => `translate(${x(d.depth)},${y(d.index)})`)
                .attr("d", d => line[d.id](d.values))
                .attr("stroke", "black")
    }

    onMounted(draw);

    watch(props, draw, { deep: true })
</script>