
<template>
    <div :class="horizontal ? '' : 'd-flex'">
        <v-tabs v-model="tab" density="compact" :direction="horizontal ? 'horizontal' : 'vertical'">
            <v-tab v-for="(_, name) in comps"
                :value="name"
                :key="'tab'+name"
                :color="app.getColor(name)">
                <v-icon :color="app.getColor(name)" class="mr-1" size="sm">mdi-circle</v-icon> {{ name }}
            </v-tab>
        </v-tabs>

        <v-window v-model="tab">
            <v-window-item v-for="(cat, name) in comps" :value="name" :key="'window'+name"
                transition="slide-x-reverse-transition"
                reverse-transition="slide-x-reverse-transition">

                <div :class="['d-flex pr-1', horizontal ? 'flex-row' : 'flex-column']" style="max-height: 98vh; overflow-y: auto;">
                    <ComponentPreview v-for="c in cat" :key="c.key"
                        v-ripple
                        class="ma-1 clickable-wobble"
                        :data="c.values"
                        :title="c.title"
                        :width="100"
                        :height="100"
                        :color="app.getColor(name)"
                        background-color="#f1f1f1"
                        @click="emit('click', c.key)"
                        @mouseenter="e => setDescription(e, c.key, name)"
                        @mouseleave="setDescription()"/>
                </div>

            </v-window-item>
        </v-window>

        <ComponentInfoPanel :x-pos="xPos" :y-pos="yPos" :component="description" :color="color"/>
    </div>
</template>

<script setup>
    import { ref, reactive } from 'vue';
    import { useApp } from '@/store/app';

    import ComponentPreview from '@/components/ComponentPreview.vue';
    import ComponentInfoPanel from '@/components/ComponentInfoPanel.vue';

    import datespace from '@stdlib/array/datespace';

    import GENERATOR_TYPES from '@/use/generator-types';
    import GENERATOR_DEFAULTS from '@/use/generator-defaults';
    import makePreview from '@/use/time-series-component-preview';
    import { TSC_DEFAULTS } from '@/use/timeseries-collection';

    const props = defineProps({
        horizontal: {
            type: Boolean,
            default: false
        },
        start: {
            type: String,
            required: false
        },
        end: {
            type: String,
            required: false
        },
        n: {
            type: Number,
            default: 30
        }
    })

    const app = useApp()
    const tab = ref(GENERATOR_TYPES.SPECIAL)
    const description = ref("")
    const xPos = ref(0)
    const yPos = ref(0)
    const color = ref("#f1f1f1")

    const comps = reactive({});

    const dataX = props.start && props.end ?
        datespace(props.start, props.end, props.n) :
        datespace(TSC_DEFAULTS.start, TSC_DEFAULTS.end, props.n);

    for (const t in GENERATOR_DEFAULTS) {
        const g = GENERATOR_DEFAULTS[t];
        if (comps[g.type] === undefined) {
            comps[g.type] = {};
        }
        comps[g.type][g.key] = {
            key: g.key,
            name: g.name,
            title: g.title,
            values: Array.from(makePreview(g.key, dataX))
        };
    }

    const emit = defineEmits(["click"])

    function setDescription(event=null, key="", name="") {
        if (event) {
            const rect = event.target.getBoundingClientRect();
            xPos.value = rect.x - 25;
            yPos.value = rect.y - 10 + rect.height * 0.5;
            color.value = app.getColor(name)
        }
        description.value = key;
    }

</script>
