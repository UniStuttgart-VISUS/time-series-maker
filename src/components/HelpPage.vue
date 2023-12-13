<template>
    <div class="d-flex flex-column pa-2" style="width: 100%; max-height: 99vh; overflow-y: auto;">

        <b class="text-subcaption">Component Panel</b>
        <div class="d-flex flex-wrap ma-2">
            <div class="text-caption mt-2">
                <div>Modify a component</div>
                <video autoplay loop :width="width" src="tutorial/components.mp4" controls></video>
            </div>
        </div>

        <b class="text-subcaption">Operation Tree</b>
        <div class="d-flex flex-wrap ma-2">
            <div class="text-caption mt-2">
                <div>Switch between operators</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-ops.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>Adjust where the tree is expanded</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-extend.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>Replace a component</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-replace.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>Swap two components</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-swap.mp4" controls></video>
            </div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        width: {
            type: Number,
            default: 500
        }
    })
</script>