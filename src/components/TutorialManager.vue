<template></template>

<script setup>

    import { onMounted } from 'vue';
    import { useApp, MAIN_TABS } from '@/store/app';

    import introJs from 'intro.js'
    import 'intro.js/introjs.css';

    const props = defineProps({
        tsID: {
            type: String,
            required: true
        }
    })

    const app = useApp();

    const tutorial = introJs();

    function init() {
        tutorial.setOptions({
            dontShowAgain: true,
            steps: [{
                title: 'Welcome',
                intro: 'This is a short tutorial to get you started!'
            },{
                element: document.querySelector('.main-tabs'),
                title: 'Tabs',
                intro: 'These tabs let you switch between the four available pages'
            },{
                element: document.querySelector('.tab-home'),
                title: 'Home',
                intro: 'On the "Home" page, you can manage your time series collection, e.g. by adding a new time series or selecting a different one.'
            },{
                element: document.querySelector('.tab-ts'),
                title: 'Time Series',
                intro: 'On the "Time Series" page, you can modify your selected time series.'
            },{
                element: document.querySelector('.tab-export'),
                title: 'Export',
                intro: 'On the "Export" page, you can download your time series (collection) generation settings as JSON or data as CSV.'
            },{
                element: document.querySelector('.tab-import'),
                title: 'Import',
                intro: 'On the "Import" page, you can import previously exported time series (collection) generation settings stored in a JSON file.'
            },{
                element: document.querySelector('.tsc-settings'),
                title: 'Collection Settings',
                intro: 'Here you can adjust the settings for all time series in your collection, like the number of samples or the time range it should cover.'
            },{
                element: document.querySelector('.new-ts'),
                title: 'New Timeseries',
                intro: 'Add a new time series by clicking on this button.'
            },{
                element: document.querySelector('.ts-icon'),
                title: 'Selection',
                intro: 'Click on the circle icon of a time series to select it.'
            },{
                element: document.querySelector('.comp-wrapper'),
                title: 'Components',
                intro: 'There are many types of components you can add to your time series. Click on a chart to add one!'
            }]
        })

        tutorial.onbeforechange(async () => {
            switch (tutorial._currentStep) {
                case 9: return new Promise((resolve) => {
                    app.selectTimeSeries(props.tsID)
                    setTimeout(resolve, 50);
                });
            }
        });

        start();
    }

    function start() {
        tutorial.start();
    }

    onMounted(init);
</script>
