<template>
    <div>
        <div>
            <v-btn icon="mdi-minus"
                rounded="sm"
                density="compact"
                @click="resetZoom"/>
        </div>
        <svg ref="el" :width="width" :height="height"></svg>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, watch, onMounted } from 'vue';
    import { useApp } from '@/store/app'

    const props = defineProps({
        data: {
            type: Array,
            required: true
        },
        width: {
            type: Number,
            default: 600
        },
        height: {
            type: Number,
            default: 300
        },
        idAttr: {
            type: String,
            default: "id"
        },
        xAttr: {
            type: String,
            default: "x"
        },
        yAttr: {
            type: String,
            default: "y"
        },
        colorAttr: {
            type: String,
            default: "color"
        },
        xDomain: {
            type: Array,
            required: false
        },
        yDomain: {
            type: Array,
            required: false
        },
    });

    const el = ref(null);

    const x = d => d[props.xAttr]
    const y = d => d[props.yAttr]
    const color = d => d[props.colorAttr]
    const id = d => d[props.idAttr]

    let xScale, yScale, paths, zoom;

    const app = useApp();

    function draw() {
        const svg = d3.select(el.value);

        svg.selectAll("*").remove();

        if (props.data.length === 0) return;

        const xDomain = props.xDomain ? props.xDomain : [
                d3.min(props.data, d => d3.min(d.values, dd => x(dd))),
                d3.max(props.data, d => d3.max(d.values, dd => x(dd))),
            ]
        const yDomain = props.yDomain ? props.yDomain : [
                Math.min(0, d3.min(props.data, d => d3.min(d.values, dd => y(dd)))),
                d3.max(props.data, d => d3.max(d.values, dd => y(dd))),
            ]

        if (yDomain[0] === yDomain[1]) {
            yDomain[1] = yDomain[0] + 0.5
            yDomain[0] -= 0.5
        }

        const yDiff = yDomain[1] - yDomain[0]
        yDomain[0] -= yDiff * 0.05
        yDomain[1] += yDiff * 0.05

        xScale = d3.scaleTime()
            .domain(xDomain)
            .range([35, props.width - 10])

        yScale = d3.scaleLinear()
            .domain(yDomain)
            .range([props.height - 25, 10])

        const line = d3.line()
            .curve(d3.curveMonotoneX)
            .x(d => xScale(x(d)))
            .y(d => yScale(y(d)))

        const zeroLine = svg.append("line")
            .attr("x1", xScale(xDomain[0]))
            .attr("x2", xScale(xDomain[1]))
            .attr("y1", yScale(0))
            .attr("y2", yScale(0))
            .attr("stroke", "black")
            .attr("stroke-width", 1)

        paths = svg.append("g")
            .selectAll("path")
            .data(props.data)
            .join("path")
            .attr("d", d => line(d.values))
            .attr("stroke", d => app.colorScale(color(d)))
            .attr("stroke-opacity", d => d.opacity)
            .attr("stroke-width", 2)
            .attr("fill", "none")

        const xAxis = svg.append("g")
            .attr("transform", `translate(0,${props.height-25})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b")))

        const yAxis = svg.append("g")
            .attr("transform", "translate(35,0)")
            .call(d3.axisLeft(yScale))

        function zoomed({ transform }) {
            const xz = transform.rescaleX(xScale);
            const yz = transform.rescaleY(yScale);

            line
                .x(d => xz(x(d)))
                .y(d => yz(y(d)))

            paths.attr("d", d => line(d.values))

            xAxis.call(d3.axisBottom(xz).tickFormat(d3.timeFormat("%b")))
            yAxis.call(d3.axisLeft(yz))

            zeroLine
                .attr("x1", xz(xDomain[0]))
                .attr("x2", xz(xDomain[1]))
                .attr("y1", yz(0))
                .attr("y2", yz(0))

            app.setLineChartZoom(transform);
        }

        zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [props.width, props.height]])
            .on("zoom", zoomed)

        svg.call(zoom)
            .on("dblclick.zoom", resetZoom)

        svg.transition()
            .duration(500)
            .call(zoom.transform, app.lineChartZoom)

        highlight()
    }

    function resetZoom() {
        const svg = d3.select(el.value);
        svg.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity)
    }

    function highlight() {
        paths.attr("stroke-opacity", d => app.isSelected(id(d)) ? 1 : d.opacity)
    }

    onMounted(draw);

    watch(() => props.data, draw, { deep: true })
    watch(() => [props.width, props.height, props.xDomain, props.yDomain], draw, { deep: true })
    watch(() => app.selected, highlight, { deep: true })
</script>