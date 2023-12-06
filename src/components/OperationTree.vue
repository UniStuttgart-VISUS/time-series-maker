<template>
    <div>
        <div class="d-flex justify-space-between">
            <svg ref="el" :width="realWidth" :height="realHeight"></svg>
            <v-divider vertical class="ml-2 mr-2"></v-divider>
            <div class="d-flex flex-column align-end ma-4">
                <span class="mb-1 text-caption">operators:</span>
                <div>
                    <v-icon class="mr-4" color="primary">{{ operatorToIcon(OPERATOR.ADD) }}</v-icon>
                    <svg width="25" height="6">
                        <path d="M 0,3 l 25,0" stroke="black" stroke-width="2"></path>
                    </svg>
                </div>
                <div>
                    <v-icon class="mr-4" color="primary">{{ operatorToIcon(OPERATOR.MULTIPLY) }}</v-icon>
                    <svg width="25" height="6">
                        <path d="M 0,3 l 25,0" stroke="black" stroke-width="2" stroke-dasharray="2,2"></path>
                    </svg>
                </div>
                <div>
                    <v-icon class="mr-4" color="primary">{{ operatorToIcon(OPERATOR.SUBTRACT) }}</v-icon>
                    <svg width="25" height="6">
                        <path d="M 0,1 l 25,0" stroke="black" stroke-width="2" stroke-dasharray="6,2,6,2"></path>
                    </svg>
                </div>
            </div>
        </div>

        <div v-if="selected" class="op-picker" :style="{ top: mouseY+'px', left: mouseX+'px' }">
            <v-btn-toggle :model-value="selectedValue"
                divided mandatory border
                density="compact"
                class="mt-1 mb-1">
                <v-btn :icon="operatorToIcon(OPERATOR.SUBTRACT)" :value="OPERATOR.SUBTRACT"
                    @click="setOperator(OPERATOR.SUBTRACT)"/>
                <v-btn :icon="operatorToIcon(OPERATOR.ADD)" :value="OPERATOR.ADD"
                    @click="setOperator(OPERATOR.ADD)"/>
                <v-btn :icon="operatorToIcon(OPERATOR.MULTIPLY)" :value="OPERATOR.MULTIPLY"
                    @click="setOperator(OPERATOR.MULTIPLY)"/>

            </v-btn-toggle>
        </div>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, onMounted, watch, computed } from 'vue';
    import { OPERATOR } from '@/use/compositor.js';
    import { useApp } from '@/store/app';

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
        width: {
            type: Number,
            default: 800
        },
        levelHeight: {
            type: Number,
            default: 100
        },
    })
    const emit = defineEmits(["update", "switch"])

    const app = useApp();

    const el = ref(null)
    const selected = ref(null);
    const selectedValue = ref("");

    const sourceID = ref("")
    const targetID = ref("")

    const mouseX = ref(0);
    const mouseY = ref(0);

    const minPadding = 20;
    const maxDepth = computed(() => d3.max(props.nodes, d => d.depth));
    const maxLeafIndex = computed(() => d3.max(props.nodes, d => maxIndex(d)));
    const realWidth = computed(() => props.width / maxLeafIndex.value < 100 ? maxLeafIndex.value * 100 : props.width)
    const realHeight = computed(() => (props.levelHeight + minPadding) * maxDepth.value)

    let dragOffsetX = 0, dragOffsetY = 0;

    function operatorToIcon(name) {
        switch (name) {
            default:
            case OPERATOR.ADD: return "mdi-plus";
            case OPERATOR.SUBTRACT: return "mdi-minus";
            case OPERATOR.MULTIPLY: return "mdi-close";
        }
    }
    function setOperator(op) {
        if (selected.value) {
            emit("update", selected.value, op)
            selected.value = null;
            selectedValue.value = "";
        }
    }

    function minIndex(d) {
        return d.index !== undefined ? d.index : d.minIndex
    }
    function maxIndex(d) {
        return d.index !== undefined ? d.index : d.maxIndex
    }

    function draw() {

        const svg = d3.select(el.value);
        svg.selectAll("*").remove();

        const x = d3.scaleBand()
            .domain(d3.range(0, maxLeafIndex.value + 1))
            .range([5, realWidth.value - 5])
            .paddingInner(0.1)

        const y = d3.scaleBand()
            .domain(d3.range(maxDepth.value, -1, -1))
            .range([25, realHeight.value - 5])
            .paddingInner(0.1)


        function dragstarted(event, d) {
            sourceID.value = d.id;
            const [mx, my] = d3.pointer(event, this)
            dragOffsetX = mx;
            dragOffsetY = my;
        }
        function dragged(event) {
            d3.select(this).attr("transform", `translate(${event.x-dragOffsetX},${event.y-dragOffsetY})`)
        }
        function dragended(event, datum) {

            let id;
            const [mx, my] = d3.pointer(event, document.body)

            gs.each(function(d) {
                if (id !== undefined || d.id === sourceID.value || d.index === undefined) return;
                const rect = this.getBoundingClientRect();
                if (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom) {
                    id = d.id
                };
            });

            if (id !== undefined) {
                targetID.value = id;
                if (sourceID.value !== targetID.value) {
                    emit("switch", sourceID.value, targetID.value)
                }
            } else {
                // reset item
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("transform", `translate(${x(minIndex(datum))},${y(datum.depth)})`)
            }

            sourceID.value = "";
            targetID.value = "";
        }
        const drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        const gs = svg.selectAll("g")
            .data(props.nodes.filter(d => minIndex(d) !== undefined), d => d.id)
            .join("g")
            .attr("transform", d => `translate(${x(minIndex(d))},${y(d.depth)})`)

        gs.call(drag)

        gs.filter(d => d.index !== undefined)
            .classed("dragable", true)
            .on("mouseenter", function(_, d) {
                d3.select(this).selectChild(".bg").attr("fill", app.getColor(d.color))
            })
            .on("mouseleave", function() {
                d3.select(this).selectChild(".bg").attr("fill", "none")
            })
            .append("rect")
            .attr("fill", "none")
            .attr("fill-opacity", 0.1)
            .attr("width", d => (maxIndex(d) !== minIndex(d) ? x(maxIndex(d)) : 0) + x.bandwidth())
            .attr("height", y.bandwidth())
            .classed("bg", true)

        gs.append("line")
            .attr("x1", 0)
            .attr("y1", y.bandwidth() * 0.5)
            .attr("x2", d => (maxIndex(d) !== minIndex(d) ? x(maxIndex(d)) : 0) + x.bandwidth())
            .attr("y2", y.bandwidth() * 0.5)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.5)


        const xdomain = d3.extent(props.xValues);

        const xs = {};
        const ys = {};
        const line = {};

        props.nodes.forEach(d => {
            if (!d.values) return;

            const single = Array.isArray(d.values);
            const extent = single ? d3.extent(d.values) : [Infinity, -Infinity]
            if (!single) {
                Object.values(d.values).forEach(array => {
                    const e = d3.extent(array);
                    extent[0] = Math.min(extent[0], e[0]);
                    extent[1] = Math.max(extent[1], e[1]);
                });
            }

            xs[d.id] = d3.scaleLinear()
                .domain(xdomain)
                .range([0, (maxIndex(d) !== minIndex(d) ? x(maxIndex(d)) : 0) + x.bandwidth()])

            ys[d.id] = d3.scaleLinear()
                .domain(extent)
                .range([y.bandwidth(), 0])

            line[d.id] = d3.line()
                .curve(d3.curveMonotoneX)
                .x((_, i) => xs[d.id](props.xValues[i]))
                .y(dd => ys[d.id](dd))
        });

        const lines = gs.filter(d => line[d.id] !== undefined)
            .append("g")
            .attr("fill", "none")
            .attr("stroke-width", 2)
            .selectAll("path")
            .data(d => {
                return Array.isArray(d.values) ?
                    [{ id: d.id, color: d.color, values: d.values, opacity: 1 }] :
                    Object.entries(d.values).map(([key, vals]) => {
                        return {
                            id: d.id, values: vals,
                            key: key, data: d.data,
                            opacity: d.data === key ? 1 : 0.33
                        }
                    })
            })
            .join("path")
            .attr("d", d => line[d.id](d.values))
            .attr("stroke", d => d.color ? app.getColor(d.color) : 'black')
            .attr("stroke-opacity", d => d.opacity)
            .attr("stroke-dasharray", d => {
                switch(d.key) {
                    default:
                    case OPERATOR.ADD: return ""
                    case OPERATOR.MULTIPLY: return "2,2"
                    case OPERATOR.SUBTRACT: return "6,2,6,2"
                }
            })

        lines.filter(d => d.key !== undefined)
            .on("mouseenter", function(_, d) {
                d3.select(this)
                    .attr("stroke", "#1867c0")
                    .attr("stroke-width", 3)
                    .attr("stroke-opacity", 1)
            })
            .on("mouseleave", function(_, d) {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", 2)
                    .attr("stroke-opacity", d.opacity)
            })
            .on("click", (_, d) => {
                emit("update", d.id, d.key)
            })

        lines.filter(d => d.opacity === 1).raise()

        const opGroup = gs.filter(d => d.index === undefined)
            .append("g")
            .attr("transform", d => `translate(${(x(maxIndex(d)) + x.bandwidth()) * 0.5},${y.bandwidth() * 0.5})`)
            .on("mouseenter", function() {
                d3.select(this)
                    .selectAll("circle")
                    .transition()
                    .duration(250)
                    .attr("fill", "#1867c0")
                    .attr("r", 10)
            })
            .on("mouseleave", function() {
                d3.select(this)
                    .selectAll("circle")
                    .transition()
                    .duration(250)
                    .attr("fill", "black")
                    .attr("r", 8)
            })
            .on("click", function(event, d) {
                if (selected.value === d.id) {
                    selected.value = null;
                    selectedValue.value = "";
                } else {
                    const [mx, my] = d3.pointer(event, document.body)
                    mouseX.value = mx - 42;
                    mouseY.value = my - 52;

                    selectedValue.value = d.data;
                    selected.value = d.id;
                }
            })

        opGroup.append("circle")
            .attr("r", 8)
            .attr("fill", "black")
            .style("cursor", "pointer")

        opGroup.append("path")
            .attr("d", d => {
                switch(d.data) {
                    case OPERATOR.ADD: return d3.symbol(d3.symbolPlus)()
                    case OPERATOR.MULTIPLY: return d3.symbol(d3.symbolTimes)()
                    case OPERATOR.SUBTRACT: return "M -8,0 l 16,0"
                }
            })
            .attr("stroke", "white")
            .attr("stroke-width", 2)

        gs.filter(d => d.index !== undefined)
            .append("text")
            .attr("transform", `translate(${x.bandwidth()*0.5}, -10)`)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .text(d => d.data)

    }

    onMounted(draw);

    watch(props, draw, { deep: true })
</script>

<style scoped>
.op-picker {
    position: absolute;
    top: 0;
    left: 0;
}
</style>