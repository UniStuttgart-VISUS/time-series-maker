<template>
    <div class="op-tree" ref="wrapper">
        <div style="max-width: 100%; overflow: auto;">
            <div class="d-flex justify-center">

                <v-sheet class="pa-2 mr-4 text-caption d-flex flex-column align-center" style="max-width: 33%;" color="#f1f1f1" rounded="sm">
                    <v-icon icon="mdi-rectangle-outline" color="#ff69b4" density="compact" size="x-large"/>
                    <span>indicates where new components will be added</span>
                    <span>
                        changed via
                        <v-icon icon="mdi-tree" color="#ff69b4" density="compact" size="large"/>
                        button
                    </span>
                </v-sheet>

                <v-sheet class="pa-2 mr-4" style="text-align: center;" color="#f1f1f1" rounded="sm">
                    <div class="text-caption pa-1"><b>operators:</b></div>
                    <div class="d-flex justify-center pa-1">
                        <div>
                            <v-icon class="mr-2" color="primary">{{ operatorToIcon(OPERATOR.ADD) }}</v-icon>
                            <svg width="25" height="6">
                                <path d="M 0,3 l 25,0" stroke="black" stroke-width="2"></path>
                            </svg>
                        </div>
                        <v-divider vertical class="ml-2 mr-2"></v-divider>
                        <div>
                            <v-icon class="mr-2" color="primary">{{ operatorToIcon(OPERATOR.MULTIPLY) }}</v-icon>
                            <svg width="25" height="6">
                                <path d="M 0,3 l 25,0" stroke="black" stroke-width="2" stroke-dasharray="2,2"></path>
                            </svg>
                        </div>
                        <v-divider vertical class="ml-2 mr-2"></v-divider>
                        <div>
                            <v-icon class="mr-2" color="primary">{{ operatorToIcon(OPERATOR.SUBTRACT) }}</v-icon>
                            <svg width="25" height="6">
                                <path d="M 0,1 l 25,0" stroke="black" stroke-width="2" stroke-dasharray="6,2,6,2"></path>
                            </svg>
                        </div>
                    </div>
                </v-sheet>

                <v-sheet class="pa-2 text-caption d-flex flex-column align-center" style="max-width: 33%;" color="#f1f1f1" rounded="sm">
                    <v-icon icon="mdi-rectangle-outline" color="#00ced1" density="compact" size="x-large"/>
                    <span>indicates which component will be replaced</span>
                    <span>
                        changed via
                        <v-icon icon="mdi-swap-horizontal" color="#00ced1" density="compact" size="large"/>
                        button
                    </span>
                </v-sheet>
            </div>

            <v-divider class="mt-5 mb-5" thickness="1"></v-divider>

            <div style="max-height: 63vh; min-height: 400px; overflow-y: auto;">
                <svg ref="el" :width="realWidth" :height="realHeight"></svg>
            </div>
        </div>

        <div v-if="selected" class="op-picker" :style="{ top: opY+'px', left: opX+'px' }">
            <v-btn-toggle :model-value="selectedValue"
                divided mandatory border
                density="compact"
                elevation="4"
                class="mt-1 mb-1">
                <v-btn :icon="operatorToIcon(OPERATOR.ADD)" :value="OPERATOR.ADD"
                    @click="setOperator(OPERATOR.ADD)"/>
                <v-btn :icon="operatorToIcon(OPERATOR.MULTIPLY)" :value="OPERATOR.MULTIPLY"
                    @click="setOperator(OPERATOR.MULTIPLY)"/>
                <v-btn :icon="operatorToIcon(OPERATOR.SUBTRACT)" :value="OPERATOR.SUBTRACT"
                    @click="setOperator(OPERATOR.SUBTRACT)"/>
            </v-btn-toggle>
        </div>

        <div class="action-picker" :style="{ top: actionY+'px', left: (actionX-62)+'px', display: hovered ? 'block' : 'none' }">
            <v-tooltip text="add new components here" open-delay="500" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="outlined" elevation="0" class="mr-1" icon="mdi-tree" rounded="sm" density="compact" color="#ff69b4" @click="selectComp"/>
                </template>
            </v-tooltip>
            <v-tooltip text="replace this component" open-delay="500" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="outlined" elevation="0" class="mr-1" icon="mdi-swap-horizontal" rounded="sm" density="compact" color="#00ced1" @click="replaceComp"/>
                </template>
            </v-tooltip>
            <v-tooltip text="delete this component" open-delay="500" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="outlined" elevation="0" class="mr-1" icon="mdi-delete" rounded="sm" density="compact" color="error" @click="deleteComp"/>
                </template>
            </v-tooltip>
            <v-tooltip text="cancel" open-delay="500" location="bottom">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="outlined" elevation="0" icon="mdi-close" rounded="sm" density="compact" color="warning" @click="hovered = ''"/>
                </template>
            </v-tooltip>
        </div>
    </div>
</template>

<script setup>

    import * as d3 from 'd3';
    import { ref, onMounted, watch, computed } from 'vue';
    import { OPERATOR } from '@/use/compositor.js';
    import { useApp } from '@/store/app';
    import { storeToRefs } from 'pinia';

    const props = defineProps({
        data: {
            type: Object,
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
        addNodeId: {
            type: String,
            required: true
        },
        replaceNodeId: {
            type: String,
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
            default: 80
        },
        minPadding: {
            type: Number,
            default: 10
        },
        minChartWidth: {
            type: Number,
            default: 120
        },
        minChartHeight: {
            type: Number,
            default: 50
        },
    })
    const emit = defineEmits(["update", "switch", "select", "delete"])

    const app = useApp();
    const { lineStyle } = storeToRefs(app)

    const wrapper = ref(null);
    const el = ref(null)

    const hovered = ref("");
    const selected = ref(null);
    const selectedValue = ref("");

    const sourceID = ref("")
    const targetID = ref("")

    const opX = ref(0);
    const opY = ref(0);
    const actionX = ref(0);
    const actionY = ref(0);

    const realWidth = computed(() => {
        return props.width / props.numLeaves < props.minChartWidth ?
            props.numLeaves * (props.minChartWidth + props.minPadding) :
            props.width
    })
    const realHeight = computed(() => {
        const h = (props.levelHeight + props.minPadding) * (props.maxDepth + 1)
        const w = realWidth.value / (props.numLeaves + props.minPadding)
        const asp = w / h;
        if (asp < 1.7 || asp > 1.9) {
            return Math.max(props.minChartHeight + props.minPadding*2, Math.min(w / 1.8)) * (props.maxDepth + 1) + 25
        }
        return h;
    })

    let dragOffsetX = 0, dragOffsetY = 0;
    let labels, rects, gs, x, y;

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

    function draw() {

        const svg = d3.select(el.value);
        svg.selectAll("*").remove();

        hovered.value = "";
        selected.value = null;
        selectedValue.value = "";

        const root = d3.hierarchy(props.data).count()

        x = d3.scaleBand()
            .domain(d3.range(0, props.numLeaves))
            .range([5, realWidth.value - 5])
            .paddingInner(0.1)
            .paddingOuter(0.05)

        y = d3.scaleBand()
            .domain(d3.range(0, props.maxDepth + 1))
            .range([25, realHeight.value - 50])
            .paddingInner(0.2)
            .paddingOuter(0.05)

        function offset(d) {
            if (!d.parent) return 0;
            const first = d.parent.children[0].data.id === d.data.id;
            return offset(d.parent) + (first ? 0 : d.parent.children[0].value)
        }

        function dragstarted(event, d) {
            hovered.value = "";
            sourceID.value = d.data.id;
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
                if (id !== undefined || d.data.id === sourceID.value || d.children) return;
                const rect = this.getBoundingClientRect();
                if (mx >= rect.left && mx <= rect.right && my >= rect.top && my <= rect.bottom) {
                    id = d.data.id
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
                    .attr("transform", `translate(${x(offset(datum))},${y(datum.depth)})`)
            }

            sourceID.value = "";
            targetID.value = "";
        }
        const drag = d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);

        gs = svg.selectAll("g")
            .data(root.descendants(), d => d.data.id)
            .join("g")
            .attr("transform", d => `translate(${x(offset(d))},${y(d.depth)})`);

        gs.filter(d => !d.children).call(drag)

        rects = gs.filter(d => !d.children)
            .classed("dragable", true)
            .on("mouseenter", function(_, d) {
                d3.select(this).selectChild(".bg").attr("fill", app.getColor(d.data.color))
                hovered.value = d.data.id;
                const rect = this.getBoundingClientRect();
                actionX.value = rect.x + rect.width * 0.5;
                actionY.value = rect.y + rect.height + 5;
            })
            .on("mouseleave", function(_, d) {
                if (!app.isSelectedComponent(d.data.id)) {
                    d3.select(this).selectChild(".bg").attr("fill", "none")
                }
            })
            .on("click", function(_, d) {
                app.toggleSelectedComponent(d.data.id)
            })
            .append("rect")
            .attr("fill", "none")
            .attr("fill-opacity", 0.2)
            .attr("width", d => (d.children ? x(d.value-1) : 0) + x.bandwidth())
            .attr("height", y.bandwidth())
            .classed("bg", true)

        d3.select(wrapper.value).on("mouseleave", () => hovered.value = "")

        const xdomain = d3.extent(props.xValues);

        const xs = {};
        const ys = {};
        const line = {};

        root.each(d => {
            if (!d.data.values) return;

            const single = Array.isArray(d.data.values);
            const extent = single ? d3.extent(d.data.values) : [Infinity, -Infinity]
            if (!single) {
                Object.values(d.data.values).forEach(array => {
                    const e = d3.extent(array);
                    extent[0] = Math.min(extent[0], e[0]);
                    extent[1] = Math.max(extent[1], e[1]);
                });
            }

            xs[d.data.id] = d3.scaleLinear()
                .domain(xdomain)
                .range([0, (d.children ? x(d.value-1) : 0) + x.bandwidth()])

            ys[d.data.id] = d3.scaleLinear()
                .domain(extent)
                .range([y.bandwidth(), 0])

            line[d.data.id] = d3.line()
                .curve(lineStyle.value === "smooth" ? d3.curveMonotoneX : d3.curveLinear)
                .x((_, i) => xs[d.data.id](props.xValues[i]))
                .y(dd => ys[d.data.id](dd))
        });

        const lines = gs.filter(d => line[d.data.id] !== undefined)
            .append("g")
            .attr("fill", "none")
            .attr("stroke-width", x.bandwidth() < 150 ? 1 : 2)
            .selectAll("path")
            .data(d => {
                return Array.isArray(d.data.values) ?
                    [{ id: d.data.id, color: d.data.color, values: d.data.values, opacity: 1 }] :
                    Object.entries(d.data.values).map(([key, vals]) => {
                        return {
                            id: d.data.id, values: vals,
                            key: key, data: d.data.data,
                            opacity: d.data.data === key ? 1 : 0.2
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
            .on("mouseenter", function() {
                d3.select(this)
                    .attr("stroke", "#1867c0")
                    .attr("stroke-width", 3)
                    .attr("stroke-opacity", 1)
            })
            .on("mouseleave", function(_, d) {
                d3.select(this)
                    .attr("stroke", "black")
                    .attr("stroke-width", x.bandwidth() < 150 ? 1 : 2)
                    .attr("stroke-opacity", d.opacity)
            })
            .on("click", (_, d) => {
                emit("update", d.id, d.key)
            })

        lines.filter(d => d.opacity === 1).raise()

        const opGroup = gs.filter(d => d.children)
            .append("g")
            .attr("transform", d => `translate(${((d.children ? x(d.value-1) : 0) + x.bandwidth()) * 0.5},${-10})`)
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
                event.preventDefault()
                if (selected.value === d.data.id) {
                    selected.value = null;
                    selectedValue.value = "";
                } else {
                    const [mx, my] = d3.pointer(event, document.body)
                    opX.value = mx - 42;
                    opY.value = my - 55;

                    selectedValue.value = d.data.data;
                    selected.value = d.data.id;
                }
            })

        opGroup.append("circle")
            .attr("r", 8)
            .attr("fill", "black")
            .attr("stroke", "white")
            .style("cursor", "pointer")

        opGroup.append("path")
            .attr("d", d => {
                switch(d.data.data) {
                    case OPERATOR.ADD: return d3.symbol(d3.symbolPlus)()
                    case OPERATOR.MULTIPLY: return d3.symbol(d3.symbolTimes)()
                    case OPERATOR.SUBTRACT: return "M -8,0 l 16,0"
                }
            })
            .attr("stroke", "white")
            .attr("stroke-width", 2)

        labels = gs.filter(d => !d.children)
            .append("text")
            .attr("transform", d => `translate(${((d.children ? x(d.value-1) : 0) + x.bandwidth()) * 0.5}, ${y.bandwidth()+20})`)
            .attr("text-anchor", "middle")
            .attr("font-size", 12)
            .text(d => {
                const text = d.data.data;
                if (text.length * 7 > x.bandwidth()) {
                    return text.slice(0, Math.floor(text.length / (text.length * 7 / x.bandwidth()))) + ".."
                }
                return text
            })

        updateIndicators();
        highlight();
    }

    function highlight() {
        if (app.selectedComps.size === 0) {
            labels.attr("font-weight", "normal");
            rects.attr("fill", "none")
        } else {
            labels.attr("font-weight", d => app.isSelectedComponent(d.data.id) ? "bold" : "normal")
            rects.attr("fill", d => app.isSelectedComponent(d.data.id) ? app.getColor(d.data.color) : "none")
        }
    }

    function updateIndicators() {

        d3.select(el.value).selectAll(".indicator").remove()

        if (props.replaceNodeId.length > 0) {
            gs.filter(d => d.data.id === props.replaceNodeId)
                .append("rect")
                .classed("indicator", true)
                .attr("x", -0.5 * (x.step() - x.bandwidth()))
                .attr("y", -0.5 * (y.step() - y.bandwidth()))
                .attr("width", x.step())
                .attr("height", y.step())
                .attr("fill", "none")
                .attr("stroke", "#00ced1")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 1)
        } else {
            gs.filter(d => d.data.id === props.addNodeId)
                .append("rect")
                .classed("indicator", true)
                .attr("x", -0.5 * (x.step() - x.bandwidth()))
                .attr("y", -0.5 * (y.step() - y.bandwidth()))
                .attr("width", x.step())
                .attr("height", y.step())
                .attr("fill", "none")
                .attr("stroke", "#ff69b4")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 1)
        }
    }

    function selectComp() {
        if (hovered.value) {
            emit("select", hovered.value);
            hovered.value = "";
        }
    }
    function replaceComp() {
        if (hovered.value) {
            emit("replace", hovered.value);
            hovered.value = "";
        }
    }
    function deleteComp() {
        if (hovered.value) {
            emit("delete", hovered.value);
        }
        hovered.value = "";
    }

    onMounted(draw);

    watch(() => {
        props.data,
        props.maxDepth,
        props.numLeaves,
        props.xValues,
        props.levelHeight,
        props.minChartHeight,
        props.minChartWidth,
        props.minPadding,
        props.width,
        lineStyle.value
    }, draw, { deep: true })
    watch(() => [props.addNodeId, props.replaceNodeId], updateIndicators, { deep: true })
    watch(() => app.selectedComps, highlight, { deep: true });

</script>

<style scoped>
.action-picker,
.op-picker {
    position: absolute;
    top: 0;
    left: 0;
}

.action-picker {
    transition: all 0.5s ease-in-out;
}
</style>