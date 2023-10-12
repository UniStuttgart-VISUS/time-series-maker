<template>
    <div class="d-flex justify-space-between align-center" style="width: 100%;">
        <v-icon icon="mdi-circle" class="mr-2" :color="app.tsColorScale(component.generator.type)"/>
        <v-sheet class="pa-1" color="grey-lighten-4" rounded="sm">
            <input ref="nameInput" v-model="name"
                class="mr-2"
                style="vertical-align: middle; max-width: 90%;"
                type="text"
                :readonly="!editName"
                @keyup="editKeyUp">
            <v-icon :icon="editName ? 'mdi-check' : 'mdi-pencil'" @click.stop="toggleEdit()"/>
        </v-sheet>
        <v-btn class="ml-1 mr-1"
            :icon="component.visible ? 'mdi-eye' : 'mdi-eye-off'"
            rounded="sm"
            density="compact"
            variant="text"
            @click.stop="setVisible(!component.visible)"/>
        <v-btn class="mr-1"
            icon="mdi-delete"
            color="error"
            rounded="sm"
            density="compact"
            variant="text"
            @click.stop="removeComponent()"/>
    </div>
</template>

<script setup>
    import { ref } from 'vue';
    import { useApp } from '@/store/app';

    const props = defineProps({
        component: {
            type: Object,
            required: true
        }
    })
    const emit = defineEmits(["remove", "rename"])

    const app = useApp();
    const nameInput = ref(null);

    const editName = ref(false);
    const name = ref(props.component.name);

    function toggleEdit() {
        if (editName.value) {
            props.component.setName(name.value)
            nameInput.value.blur();
            emit("rename", props.component.name);
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

    function removeComponent() {
        emit("remove", props.component.id);
    }
    function setVisible(value) {
        props.component.setVisible(value)
        props.component.update();
    }

</script>