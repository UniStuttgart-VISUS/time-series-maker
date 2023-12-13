<template>
    <div class="pl-4 pr-4 pt-2 pb-2" style="width: 100%; max-width: 100%;">
        <div class="text-title mb-4" style="text-align: center;">EXPORT PREVIEW</div>
        <VueJsonPretty v-if="type === 'json'" :data="data"></VueJsonPretty>
        <div v-else class="text-caption">
            <div v-if="'header' in data" class="row header">{{ format(data.header, data.separator) }}</div>
            <v-divider class="mt-2 mb-2"></v-divider>
            <div v-if="'data' in data">
                <div v-for="(d, i) in data.data" :key="i" class="mb-1 row">
                    {{ format(d, data.separator) }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { format } from '@/use/csv-formatter';

    import VueJsonPretty from 'vue-json-pretty';
    import 'vue-json-pretty/lib/styles.css';

    const props = defineProps({
        data: {
            type: Object,
            required: true,
        },
        type: {
            type: String,
            required: true
        }
    });

</script>

<style scoped>
.header {
    font-weight: bold;
}
.row {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
</style>