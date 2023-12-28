<template>
    <div class="mb-1">
        <div v-if="collapsible" @click="collapsed=!collapsed" class="text-caption clickable">
            <v-icon :icon="collapsed ? 'mdi-menu-right' : 'mdi-menu-down'" size="large"/>
            time series settings
        </div>

        <div v-if="!collapsed">

            <div class="d-flex justify-center ml-1 mr-1">
                <v-tooltip text="whether to clamp the values to a minimum" open-delay="500" location="top">
                    <template v-slot:activator="{ props }">
                        <v-checkbox v-bind="props"
                            v-model="timeseries.clampMin"
                            density="compact"
                            hide-details
                            label="clamp min"
                            color="primary"
                            @update:model-value="timeseries.generate()"/>
                    </template>
                </v-tooltip>

                <v-tooltip text="whether to clamp the values to a maximum" open-delay="500" location="top">
                    <template v-slot:activator="{ props }">
                        <v-checkbox v-bind="props"
                            v-model="timeseries.clampMax"
                            density="compact"
                            hide-details
                            label="clamp max"
                            color="primary"
                            @update:model-value="timeseries.generate()"/>
                    </template>
                </v-tooltip>
            </div>

            <div class="d-flex align-center">

                <v-text-field v-model.number="clampMin"
                    label="minimum value"
                    class="mb-1 mt-1 ml-1"
                    type="number"
                    :max="1"
                    :rules="[v => timeseries.setClampMin(v) || 'invalid value']"
                    density="compact"
                    hide-details
                    @update:model-value="timeseries.setClampMin(clampMin)"/>

                <v-text-field v-model.number="clampMax"
                    label="maximum value"
                    class="mb-1 mt-1 ml-1"
                    type="number"
                    :max="1"
                    :rules="[v => timeseries.setClampMax(v) || 'invalid value']"
                    density="compact"
                    hide-details
                    @update:model-value="timeseries.setClampMax(clampMax)"/>

            </div>
            <div class="d-flex">

                <v-text-field v-model.number="tsOpacity"
                    label="line opacity"
                    class="mb-1 mt-1"
                    type="number"
                    :min="0.01"
                    :max="1"
                    :step="0.01"
                    density="compact"
                    hide-details
                    @update:model-value="timeseries.update()"/>

                <v-tooltip text="show/hide all components in the line chart" open-delay="300" location="top">
                    <template v-slot:activator="{ props }">
                        <v-btn v-bind="props"
                            v-model="showAll"
                            class="ml-2 mt-2"
                            :icon="showAll ? 'mdi-eye' : 'mdi-eye-off'"
                            rounded="sm"
                            variant="text"
                            density="compact"
                            size="x-large"
                            @click="toggleVisibility"/>
                    </template>
                </v-tooltip>

                <v-tooltip text="reroll new seeds for all random components" open-delay="300" location="top">
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
        </div>
    </div>
</template>

<script setup>
    import { ref, watch } from 'vue';
    import { storeToRefs } from 'pinia';
    import { useApp } from '@/store/app';
    import TimeSeries from '@/use/time-series';

    const app = useApp()
    const { tsOpacity } = storeToRefs(app)

    const props = defineProps({
        timeseries: {
            type: TimeSeries,
            required: true
        },
        collapsible: {
            type: Boolean,
            default: false,
        }
    });

    const collapsed = ref(false);
    const showAll = ref(true);
    const clampMin = ref(props.timeseries.clampMinValue)
    const clampMax = ref(props.timeseries.clampMaxValue)

    function toggleVisibility() {
        showAll.value = !showAll.value;
        props.timeseries.components.forEach(c => c.visible = showAll.value)
        props.timeseries.update();
    }

    function randomSeed() {
        props.timeseries.randomSeed();
    }

    function readClampValues() {
        if (props.timeseries.clampMinValue !== clampMin.value) {
            clampMin.value = props.timeseries.clampMinValue;
        }
        if (props.timeseries.clampMaxValue !== clampMax.value) {
            clampMax.value = props.timeseries.clampMaxValue;
        }
    }

    function readVisibility() {
        let changes = false;
        props.timeseries.components.forEach(c => {
            if (!c.visible && app.isSelectedComponent(c.id)) {
                c.visible = true;
                changes = true;
            } else if (c.visible !== showAll.value && !app.isSelectedComponent(c.id)) {
                c.setVisible(showAll.value)
                changes = true;
            }
        })
        if (changes) {
            props.timeseries.update()
        }
    }

    watch(() => props.timeseries.size, readVisibility)
    watch(() => [props.timeseries.clampMinValue, props.timeseries.clampMaxValue], readClampValues, { deep: true });

    defineExpose({ readVisibility })

</script>