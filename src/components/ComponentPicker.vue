
<template>
    <v-sheet>
        <v-tabs v-model="tab" density="compact">
            <v-tab v-for="(_, name) in comps"
                :value="name"
                :key="'tab'+name"
                :color="app.getColor(name)">
                {{ name }} <v-icon :color="app.getColor(name)" class="ml-1" size="sm">mdi-circle</v-icon>
            </v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item v-for="(cat, name) in comps" :value="name" :key="'window'+name"
                transition="slide-y-reverse-transition"
                reverse-transition="slide-y-reverse-transition">

                <div :class="['d-flex', horizontal ? 'flex-row' : 'flex-column']">
                    <ComponentPreview v-for="c in cat" :key="c.key"
                        v-ripple
                        class="ma-1 clickable"
                        :data="c.values"
                        :title="c.title"
                        :width="100"
                        :height="100"
                        :color="app.getColor(name)"
                        background-color="#f5f5f5"
                        @click="emit('click', c.key)"
                        @mouseenter="setDescription(c.key)"
                        @mouseleave="setDescription()"/>
                </div>

            </v-window-item>
        </v-window>

        <ComponentInfoPanel :component="description"/>
    </v-sheet>
</template>

<script setup>
    import { ref, reactive } from 'vue';
    import ComponentPreview from '@/components/ComponentPreview.vue';
    import GENERATOR_DEFAULTS from '@/use/generator-defaults';
    import makePreview from '@/use/time-series-component-preview';
    import GENERATOR_TYPES from '@/use/generator-types';
    import { useApp } from '@/store/app';
    import ComponentInfoPanel from '@/components/ComponentInfoPanel.vue';

    const props = defineProps({
        horizontal: {
            type: Boolean,
            default: false
        },
    })

    const app = useApp()
    const tab = ref(GENERATOR_TYPES.PREFAB)
    const description = ref("")

    const comps = reactive({});
    for (const t in GENERATOR_DEFAULTS) {
        const g = GENERATOR_DEFAULTS[t];
        if (comps[g.type] === undefined) {
            comps[g.type] = {};
        }
        comps[g.type][g.key] = {
            key: g.key,
            name: g.name,
            title: g.title,
            values: Array.from(makePreview(g.key, 35)[0])
        };
    }

    const emit = defineEmits(["click"])

    function setDescription(name="") {
        description.value = name;
    }

</script>
