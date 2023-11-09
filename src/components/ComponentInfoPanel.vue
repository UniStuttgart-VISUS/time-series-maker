<template>
    <v-sheet v-if="visible" :style="style" class="pa-2 ma-2 comp-hint" color="grey-lighten-3" rounded>
        <span class="text-subcaption">{{ GENERATOR_DEFAULTS[component].title }}</span>
        <v-divider class="mt-1 mb-2"></v-divider>
        <p v-for="(o, name) in options" class="text-caption">
            <b>{{ name }}</b>: <span v-html="o"></span>
        </p>
        <v-divider class="mt-1 mb-2"></v-divider>
        <p class="text-caption" v-html="GENERATOR_DESCRIPTIONS[component]" style="overflow-y: auto;"></p>
    </v-sheet>
</template>

<script setup>

    import GENERATOR_DESCRIPTIONS from '@/use/generator-descriptions';
    import GENERATOR_DEFAULTS from '@/use/generator-defaults';
    import { computed } from 'vue';

    const props = defineProps({
        component: {
            type: String,
            default: ""
        },
        height: {
            type: Number,
            default: 200
        },
    })

    const visible = computed(() => GENERATOR_DEFAULTS[props.component] !== undefined)
    const options = computed(() => {
        if (!visible.value) {
            return {};
        }

        const result = {};
        const opts = GENERATOR_DEFAULTS[props.component].options;
        for (const o in opts) {
            result[o] = opts[o].toString(false);
        }
        return result
    })

    const style = computed(() => {
        return {
            maxWidth: (props.height * 1.8) + 'px',
            height: props.height + 'px',
            bottom: props.height + 'px',
            left: 0
        };
    })

</script>

<style scoped>
.comp-hint {
    position: fixed;
    z-index: 2999;
}
</style>