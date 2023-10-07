<template>
    <div class="d-flex justify-space-between align-center" style="width: 100%;">
        <div class="d-flex">
            <v-icon icon="mdi-circle" class="mr-2" :color="app.colorScale(component.generator.type)"/>
            <div>
                <input ref="idInput" v-model="id"
                    class="mr-2"
                    style="vertical-align: middle;"
                    type="text"
                    :readonly="!editID"
                    @keyup="editKeyUp">
                <v-icon :icon="editID ? 'mdi-check' : 'mdi-pencil'" @click.stop="toggleEdit()"/>
            </div>
        </div>
        <v-btn class="mr-2"
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
    const idInput = ref(null);

    const id = ref(props.component.id);
    const editID = ref(false);

    function toggleEdit() {
        if (editID.value) {
            props.component.setID(id.value)
            emit("rename", props.component.id);
        } else {
            idInput.value.focus();
            idInput.value.select();
        }
        editID.value = !editID.value;
    }
    function editKeyUp(event) {
        if (editID.value && event.key === "Enter") {
            toggleEdit();
        }
    }

    function removeComponent() {
        emit("remove", props.component.id);
    }

</script>