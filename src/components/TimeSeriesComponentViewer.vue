<template>
    <v-sheet>
        <div v-if="component.generator.seedRequired" class="d-flex align-center mb-2">
            <v-text-field v-model.number="seed"
                label="random generator seed"
                type="number"
                hide-details
                density="compact"
                min="1"
                max="2147483646"
                @update:modelValue="setSeed"/>

            <v-tooltip text="reroll random seed" open-delay="200">
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props"
                        class="ml-2 mt-2"
                        icon="mdi-dice-6"
                        rounded="sm"
                        variant="text"
                        density="compact"
                        size="x-large"
                        @click="randomSeed"/>
                </template>
            </v-tooltip>
        </div>

        <v-text-field v-for="(o, key) in options" :key="component.id + '_' + key"
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

    import { ref, reactive, watch, onMounted } from 'vue';

    const props = defineProps({
        component: {
            type: Object,
            required: true
        },
    });

    const seed = ref(props.component.generator.seeds[0])
    const options = reactive({});

    function setOption(key) {
        if (options[key].value !== props.component.generator.getOpt(key)) {
            if (options[key].isValid()) {
                props.component.generator.setOpt(key, options[key].value);
                update();
            }
        }
    }
    function readOptions() {
        for (const key in options){
            if (options.hasOwnProperty(key)){
                delete options[key];
            }
        }
        for (const key in props.component.generator.options) {
            options[key] = props.component.generator.options[key].copy();
        }
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

    onMounted(readOptions)

    watch(() => props.component.generator.seeds, function(newseeds) {
        if (newseeds[0] !== seed.value) {
            seed.value = newseeds[0];
        }
    }, { deep: true })
    watch(() => props.component.lastUpdate, readOptions)

</script>