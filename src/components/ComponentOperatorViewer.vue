<template>
    <div class="d-flex flex-column justify-start align-center" style="min-width: 150px;">
        <div v-for="item in compositor.flat" :key="item.id">
            <v-chip v-if="item.type === NODE_TYPE.DATA"
                :color="app.colorScale(item.genType)"
                draggable
                @dragover.prevent
                @drop="onDrop(item.id)"
                @dragstart="dragSrc = item.id">
                {{ item.name }}
            </v-chip>

            <v-btn-toggle v-else :model-value="item.name" divided density="compact" class="mt-1 mb-1" mandatory>
                <v-btn :icon="operatorToIcon(OPERATOR.SUBTRACT)" :value="OPERATOR.SUBTRACT"
                    @click="setOperator(item.id, OPERATOR.SUBTRACT)"/>
                <v-btn :icon="operatorToIcon(OPERATOR.ADD)" :value="OPERATOR.ADD"
                    @click="setOperator(item.id, OPERATOR.ADD)"/>
                <v-btn :icon="operatorToIcon(OPERATOR.MULTIPLY)" :value="OPERATOR.MULTIPLY"
                    @click="setOperator(item.id, OPERATOR.MULTIPLY)"/>
            </v-btn-toggle>
        </div>
    </div>
</template>

<script setup>
    import { useApp } from '@/store/app';
    import Compositor, { NODE_TYPE, OPERATOR } from '@/use/compositor';
    import { ref } from 'vue';

    const props = defineProps({
        compositor: {
            type: Compositor,
            required: true
        },
    });
    const emit = defineEmits(["update", "switch"])

    const app = useApp();
    const dragSrc = ref(0);

    function operatorToIcon(name) {
        switch (name) {
            default:
            case OPERATOR.ADD: return "mdi-plus";
            case OPERATOR.SUBTRACT: return "mdi-minus";
            case OPERATOR.MULTIPLY: return "mdi-close";
        }
    }

    function setOperator(id, op) {
        props.compositor.setOperator(id, op);
        emit("update");
    }

    function onDrop(id) {
        if (dragSrc.value !== id) {
            emit("switch", dragSrc.value, id);
        }
    }

</script>