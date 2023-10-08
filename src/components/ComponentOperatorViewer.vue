<template>
    <div class="d-flex flex-column justify-start align-center">
        <div v-for="(item, index) in compositor.flat" :key="index">
            <v-chip v-if="item.type === NODE_TYPE.DATA">{{ item.name }}</v-chip>

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
    import Compositor, { NODE_TYPE, OPERATOR } from '@/use/compositor';

    const props = defineProps({
        compositor: {
            type: Compositor,
            required: true
        },
    });
    const emit = defineEmits(["update"])

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

</script>