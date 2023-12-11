<template></template>

<script setup>

    import { onMounted } from 'vue';
    import { MAIN_TABS, useApp } from '@/store/app';
    import GENERATOR_DEFAULTS from '@/use/generator-defaults';

    import introJs from 'intro.js'
    import 'intro.js/introjs.css';

    const props = defineProps({
        tsID: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        }
    })
    const emit = defineEmits(["addComponent"]);

    const app = useApp();
    const once = {};

    let tutorial = introJs();

    function init() {
        const steps = [{
            title: 'Welcome',
            intro: 'This is a short tutorial to get you started!'
        },{
            element: '.main-tabs',
            title: 'Tabs',
            intro: 'These tabs let you switch between the five available pages'
        },{
        //     element: '.tab-home',
        //     title: 'Home',
        //     intro: 'On the "Home" page, you can manage your time series collection, e.g. by adding a new time series or selecting a different one.'
        // },{
        //     element: '.tab-ts',
        //     title: 'Time Series',
        //     intro: 'On the "Time Series" page, you can modify your selected time series.'
        // },{
        //     element: '.tab-export',
        //     title: 'Export',
        //     intro: 'On the "Export" page, you can download your time series (collection) generation settings as JSON or data as CSV.'
        // },{
        //     element: '.tab-import',
        //     title: 'Import',
        //     intro: 'On the "Import" page, you can import previously exported time series (collection) generation settings stored in a JSON file.'
        // },{
            element: '.tsc-settings',
            title: 'Collection Settings',
            intro: 'Here you can adjust the settings for all time series in your collection, like the number of samples or the time range it should cover.'
        },{
            element: '.new-ts',
            title: 'New Timeseries',
            intro: 'Add a new time series by clicking on this button.'
        },{
            element: '.ts-icon',
            title: 'Selection',
            intro: 'Click on the circle icon of a time series to select it.'
        },{
            element: '.comp-wrapper',
            title: 'Components',
            intro: 'There are many types of components you can add to your time series. Click on a chart to add one!'
        }, {
            element: ".ts-settings",
            title: 'Components',
            intro: 'Here you can change the settings of your components'
        },{
            element: ".op-tree",
            title: 'Operation Tree',
            intro: "Here you can adjust how components are combined, <b>swap</b> components by dragging and more. Hover over a component node to ssee more actions."
        }];

        tutorial.setOptions({
            dontShowAgain: true,
            showBullets: false,
            showProgress: true,
            steps: steps
        });

        tutorial
            .onbeforechange(async () => {
                switch (tutorial._currentStep) {
                    case 1: return new Promise((resolve) => {
                        if (app.mainTab !== MAIN_TABS.TSC) {
                            app.goToTab(MAIN_TABS.TSC)
                        }
                        setTimeout(resolve, 20);
                    });
                    case 5: return new Promise((resolve) => {
                        app.selectTimeSeries(props.tsID)
                        setTimeout(resolve,50);
                    });
                    case 6: return new Promise((resolve) => {
                        if (props.size === 0) {
                            emit("addComponent", GENERATOR_DEFAULTS.TREND.key);
                        }
                        setTimeout(resolve, 50);
                    });
                }
            })
            .onafterchange(() => {
                const step = tutorial._currentStep;
                switch (step) {
                    case 5:
                    case 6: {
                        if (!once[step]) {
                            tutorial.refresh(true)
                            once[step] = true;
                        }
                        break;
                    }
                }
            })

        start();
    }

    function start() {
        tutorial.start();
    }

    defineExpose({ start })

    onMounted(init);
</script>
