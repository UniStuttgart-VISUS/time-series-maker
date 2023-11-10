<template>
    <div>
        <div class="text-caption mb-2">
            <span class="mr-1">#instances:</span>
            <v-sheet color="grey-lighten-4 d-inline pa-1" rounded="sm">
                <input v-model.number="instances"
                    style="max-width: 50px;"
                    type="number"
                    min="0"
                    step="1"
                    @change="setInstances"/>
            </v-sheet>
        </div>

        <div class="d-flex align-center justify-space-between">

        <v-icon :icon="app.selectedTs === timeseries.id ? 'mdi-circle-slice-8' : 'mdi-circle-outline'"
            :class="app.selectedTs !== timeseries.id ? 'clickable-blink' : 'not-clickable'"
            @click="app.selectTimeSeries(timeseries.id)"
            :color="tsColor"/>

        <v-sheet class="ml-2 pa-1" color="grey-lighten-4" rounded="sm">
            <input ref="nameInput" v-model="name"
                class="mr-2"
                style="vertical-align: middle; max-width: 165px;"
                type="text"
                :readonly="!editName"
                @keyup="editKeyUp"/>
            <v-icon :icon="editName ? 'mdi-check' : 'mdi-pencil'" @click.stop="toggleEdit()"/>
        </v-sheet>

        <div>
            <v-btn class="mr-2"
                icon="mdi-content-copy"
                rounded="sm"
                density="compact"
                variant="text"
                @click.stop="copy"/>

            <v-btn class="mr-2"
                icon="mdi-dice-6"
                rounded="sm"
                density="compact"
                variant="text"
                @click.stop="randomize"/>

            <v-btn class="mr-2"
                icon="mdi-delete"
                color="error"
                rounded="sm"
                density="compact"
                variant="text"
                @click.stop="remove"/>
        </div>
        </div>

    </div>
</template>

<script setup>
    import { ref, computed, watch } from 'vue';
    import { useApp } from '@/store/app';
    import TimeSeries from '@/use/time-series.js';

    const props = defineProps({
        timeseries: {
            type: TimeSeries,
            required: true
        }
    });
    const emit = defineEmits(["rename", "copy", "remove"])
    const app = useApp();

    const nameInput = ref(null);

    const instances = ref(props.timeseries.instances);
    const name = ref(props.timeseries.name);
    const editName = ref(false);
    const tsColor = computed(() => app.tscColorScale(props.timeseries.id))

    function toggleEdit() {
        if (editName.value) {
            props.timeseries.setName(name.value)
            nameInput.value.blur();
            emit("rename", props.timeseries.name);
        } else {
            nameInput.value.focus();
            nameInput.value.select();
        }
        editName.value = !editName.value;
    }
    function editKeyUp(event) {
        if (editName.value && event.key === "Enter") {
            toggleEdit();
        }
    }
    function setInstances() {
        if (instances.value !== props.timeseries.instances) {
            props.timeseries.setInstances(instances.value);
        }
    }

    function copy() { emit("copy", props.timeseries.id); }
    function randomize() { props.timeseries.randomSeed() }
    function remove() { emit("remove", props.timeseries.id); }

    watch(() => props.timeseries.lastUpdate, function() {
        if (props.timeseries.instances !== instances.value) {
            instances.value = props.timeseries.instances;
        }
        if (props.timeseries.name !== name.value) {
            name.value = props.timeseries.name;
        }
    })
</script>