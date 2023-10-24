<template>
    <div>
        <div>
            <v-btn icon="mdi-minus"
                rounded="sm"
                density="compact"
                variant="outlined"
                @click="resetZoom"/>
        </div>
        <div style="position: relative;">
            <canvas ref="el" :width="width" :height="height"></canvas>
            <svg ref="overlay" :width="width" :height="height" class="overlay"></svg>
        </div>
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
        colorScale: {
            type: Function,
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
    const overlay = ref(null);

    const x = d => d[props.xAttr]
    const y = d => d[props.yAttr]
    const color = d => d[props.colorAttr]
    const id = d => d[props.idAttr]

    let ctx, line, zoom;
    let xScale, yScale;
    let xDomain, yDomain;

    const app = useApp();

    function draw() {
        ctx = el.value.getContext("2d")
        const svg = d3.select(overlay.value);
        svg.selectAll("*").remove();
        ctx.clearRect(0, 0, props.width, props.height);

        if (props.data.length === 0) return;

        xDomain = props.xDomain ? props.xDomain : [
                d3.min(props.data, d => d3.min(d.values, dd => x(dd))),
                d3.max(props.data, d => d3.max(d.values, dd => x(dd))),
            ]
        yDomain = props.yDomain ? props.yDomain : [
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

        line = d3.line()
            .context(ctx)
            .curve(d3.curveMonotoneX)
            .x(d => xScale(x(d)))
            .y(d => yScale(y(d)))

        highlight();

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

            highlight(xz, yz);

            xAxis.call(d3.axisBottom(xz).tickFormat(d3.timeFormat("%b")))
            yAxis.call(d3.axisLeft(yz))

            app.setLineChartZoom(transform);
        }

        function zoomEnd({ transform }) {
            // TODO: why do I have to do this manually?
            svg.node().__zoom = transform;
        }

        zoom = d3.zoom()
            .scaleExtent([1, 8])
            .translateExtent([[0, 0], [props.width, props.height]])
            .on("zoom", zoomed)
            .on("end", zoomEnd)

        svg.call(zoom).on("dblclick.zoom", resetZoom)

        svg.transition()
            .duration(500)
            .call(zoom.transform, app.lineChartZoom)
    }

    function resetZoom() {
        const svg = d3.select(el.value);
        svg.transition()
            .duration(500)
            .call(zoom.transform, d3.zoomIdentity)
    }

    function highlight(scaleX=xScale, scaleY=yScale) {
        ctx.clearRect(0, 0, props.width, props.height);

        ctx.lineWidth = 1;
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(scaleX(xDomain[0]), scaleY(0));
        ctx.lineTo(scaleX(xDomain[1]), scaleY(0));
        ctx.stroke()

        ctx.lineWidth = 2;
        props.data.forEach(d => {
            ctx.beginPath();
            ctx.globalAlpha = app.isSelectedComponent(id(d)) ? 1 : d.opacity;
            ctx.strokeStyle  = props.colorScale(color(d));
            line(d.values)
            ctx.stroke();
        });
    }

    onMounted(draw);

    watch(() => props.data, draw, { deep: true })
    watch(() => [props.width, props.height, props.xDomain, props.yDomain], draw, { deep: true })
    watch(() => app.selectedComps, () => highlight(), { deep: true })
</script>

<style scoped>
.overlay {
    position: absolute;
    top: 0;
    left: 0;
}
</style>