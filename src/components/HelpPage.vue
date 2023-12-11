<template>
    <div class="d-flex flex-column pa-2" style="width: 100%; max-height: 99vh; overflow-y: auto;">

        <span class="mb-4">
            This page provides a few videos showcasing different functionalities.
            Double-click a video to set it to fullscreen.
        </span>

        <b class="text-subcaption">Component Panel</b>
        <div class="d-flex flex-wrap ma-2">
            <div class="text-caption mt-2">
                <div>How to change the settings</div>
                <video autoplay loop :width="width" src="tutorial/comps-settings.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>How to modify a component</div>
                <video autoplay loop :width="width" src="tutorial/comps-modify.mp4" controls></video>
            </div>
        </div>

        <b class="text-subcaption">Operation Tree</b>
        <div class="d-flex flex-wrap ma-2">
            <div class="text-caption mt-2">
                <div>How to change an operator</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-ops.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>How to adjust where the tree gets expanded</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-extend.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>How to replace a component</div>
                <video autoplay loop :width="width" src="tutorial/op-tree-replace.mp4" controls></video>
            </div>

            <v-divider vertical class="ml-2 mr-2"></v-divider>

            <div class="text-caption mt-2">
                <div>How to swap two components</div>
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