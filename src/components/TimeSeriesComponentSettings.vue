<template>
    <v-sheet>
        <v-form>
            <v-select v-model="generator"
                :items="GEN_TYPES"
                label="component type"
                item-title="title"
                item-value="key"
                hide-details
                density="compact"
                @update:model-value="setGenerator"/>

            <v-text-field v-for="(_, o) in options" :key="component.id + '_' + o"
                v-model.number="options[o].value"
                :label="o"
                type="number"
                :min="options[o].min"
                :max="options[o].max"
                :step="options[o].step"
                :rules="[v => options[o].validator(v) || 'invalid value']"
                density="compact"
                hide-details
                @update:modelValue="update"/>

            <!-- <v-text-field v-model="seed"
                label="generator seed"
                type="number"
                hide-details
                density="compact"/>

            <v-text-field v-model="minValue"
                label="minimum value"
                type="number"
                hide-details
                density="compact"/> -->
        </v-form>
    </v-sheet>
</template>

<script setup>

    import { ref, computed } from 'vue';
    import Generator from '@/use/generators';
    import { GEN_TYPES } from '@/use/generator_default';

    const props = defineProps({
        component: {
            type: Object,
            required: true
        },
    });

    const generator = ref(props.component.generator.key);
    const options = computed(() => props.component.generator.options);

    const emit = defineEmits(["update"])

    function update() {
        props.component.generate();
        emit("update", props.component.id);
    }

    function setGenerator(generator) {
        props.component.setGenerator(new Generator(generator))
        emit("update", props.component.id);
    }

</script>