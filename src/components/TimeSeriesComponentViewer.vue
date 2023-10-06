<template>
    <v-sheet>
        <div v-if="component.generator.seedRequired" class="d-flex align-center mb-2">
            <v-text-field v-model.number="seed"
                label="generator seed"
                type="number"
                hide-details
                density="compact"
                min="1"
                max="2147483646"
                @update:modelValue="setSeed"/>
            <v-btn class="ml-2"
                icon="mdi-dice-6"
                rounded="sm"
                variant="text"
                density="compact"
                size="x-large"
                color="success"
                @click="randomSeed"/>
        </div>

        <v-text-field v-for="(_, o) in options" :key="component.id + '_' + o"
            v-model.number="options[o].value"
            :label="o"
            type="number"
            :min="options[o].min"
            :max="options[o].max"
            :step="options[o].step"
            :rules="[v => options[o].isValid(v) || 'invalid value']"
            density="compact"
            @update:modelValue="update"/>
    </v-sheet>
</template>

<script setup>

    import { ref, computed, watch } from 'vue';

    const props = defineProps({
        component: {
            type: Object,
            required: true
        },
    });

    const seed = ref(props.component.generator.seed)
    const options = computed(() => props.component.generator.options);

    const emit = defineEmits(["update"])

    function update() {
        props.component.generate();
        emit("update", props.component.id);
    }

    function setSeed() {
        props.component.generator.seed = seed.value;
        update();
    }
    function randomSeed() {
        props.component.randomSeed();
        emit("update", props.component.id);
    }

    watch(() => props.component.generator.seed, function(newseed) {
        if (newseed !== seed.value) {
            seed.value = newseed;
        }
    })

</script>