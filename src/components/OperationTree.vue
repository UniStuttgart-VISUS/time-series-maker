<template>
    <div>
        <svg ref="el" :width="realWidth" :height="realHeight"></svg>
        <div v-if="selected" class="op-picker" :style="{ top: mouseY+'px', left: mouseX+'px' }">
            <v-btn-toggle :model-value="selectedValue"
                divided mandatory
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
            default: 300
        },
        height: {
            type: Number,
            default: 800
        },
    })
    const emit = defineEmits(["update"])

    const el = ref(null)
    const selected = ref(null);
    const selectedValue = ref("");

    const mouseX = ref(0);
    const mouseY = ref(0);

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

    const maxDepth = computed(() => d3.max(props.nodes, d => d.depth));
    const maxLeafIndex = computed(() => d3.max(props.nodes, d => maxIndex(d)));
    const realHeight = computed(() => props.height / maxLeafIndex.value < 100 ? maxLeafIndex.value * 100 : props.height)
    const realWidth = computed(() => {
        const aspectRatio = props.width / (realHeight.value / maxLeafIndex.value)
        return aspectRatio > 1 ? (realHeight.value / maxLeafIndex.value) : props.width
    })

    function draw() {

        const svg = d3.select(el.value);
        svg.selectAll("*").remove();

        if (props.nodes.length < 3) return;

        const x = d3.scaleBand()
            .domain(d3.range(0, maxDepth.value + 1))
            .range([25, realWidth.value])
            .paddingInner(0.1)

        const y = d3.scaleBand()
            .domain(d3.range(0, maxLeafIndex.value + 1))
            .range([0, realHeight.value])
            .paddingInner(0.1)

        const gs = svg.selectAll("g")
            .data(props.nodes.filter(d => minIndex(d) !== undefined))
            .join("g")
            .attr("transform", d => `translate(${x(d.depth)},${y(minIndex(d))})`)


        gs.append("line")
            .attr("x1", x.bandwidth() * 0.5)
            .attr("y1", 0)
            .attr("x2", x.bandwidth() * 0.5)
            .attr("y2", d => (maxIndex(d) !== minIndex(d) ? y(maxIndex(d)) : 0) + y.bandwidth())
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.5)


        const xdomain = d3.extent(props.xValues);

        const xs = {};
        const ys = {};
        const line = {};

        props.nodes.forEach(d => {
            if (!d.values) return;

            xs[d.id] = d3.scaleLinear()
                .domain(d3.extent(d.values))
                .range([0, x.bandwidth()])

            ys[d.id] = d3.scaleLinear()
                .domain(xdomain)
                .range([0, (maxIndex(d) !== minIndex(d) ? y(maxIndex(d)) : 0) + y.bandwidth()])

            line[d.id] = d3.line()
                .curve(d3.curveMonotoneY)
                .x(dd => xs[d.id](dd))
                .y((_, i) => ys[d.id](props.xValues[i]))
        });

        gs.filter(d => line[d.id])
            .append("path")
            .attr("d", d => line[d.id](d.values))
            .attr("stroke", "black")
            .attr("fill", "none")
            .attr("stroke-width", 1)

        gs.filter(d => d.index === undefined)
            .append("circle")
            .attr("transform", d => `translate(${x.bandwidth()*0.5},${(y(maxIndex(d)) + y.bandwidth()) * 0.5})`)
            .attr("r", 10)
            .attr("fill", "black")
            .style("cursor", "pointer")
            .on("click", function(event, d) {
                const [mx, my] = d3.pointer(event, document.body)
                mouseX.value = mx - 42;
                mouseY.value = my - 22;

                selectedValue.value = d.data;
                selected.value = d.id;
            })
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