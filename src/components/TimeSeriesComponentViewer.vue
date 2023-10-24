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
                variant="outlined"
                density="compact"
                size="x-large"
                color="primary"
                @click="randomSeed"/>
        </div>

        <v-text-field v-for="(o, key) in options" :key="component.id + '_' + o"
            v-model.number="o.value"
            :label="key"
            type="number"
            :min="o.min"
            :max="o.max"
            :step="o.step"
            :rules="[v => o.isValid(v) || 'invalid value']"
            density="compact"
            @update:modelValue="setOption(key)"/>
    </v-sheet>
</template>

<script setup>

    import { ref, reactive, watch } from 'vue';

    const props = defineProps({
        component: {
            type: Object,
            required: true
        },
    });

    const seed = ref(props.component.generator.seeds[0])
    const options = reactive({});
    for (const oKey in props.component.generator.options) {
        options[oKey] = props.component.generator.options[oKey].copy();
    }

    function setOption(key) {
        props.component.generator.setOpt(key, options[key].value);
        update();
    }
    function update() {
        if (props.component.isValid()) {
            props.component.update();
        }
    }

    function setSeed() {
        props.component.setSeed(seed.value);
        update();
    }
    function randomSeed() {
        props.component.randomSeed();
        update();
    }

    watch(() => props.component.generator.seeds, function(newseeds) {
        if (newseeds[0] !== seed.value) {
            seed.value = newseeds[0];
        }
    }, { deep: true })

</script>