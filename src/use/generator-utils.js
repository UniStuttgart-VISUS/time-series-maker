import { DateTime } from "luxon";

function specificDate(values, target, value, accessor) {
    return values.map(d => {
        const num = DateTime.fromJSDate(d)[accessor]
        return num === target ? value : 0
    });
}

function specificDateChange(values, value, accessor) {
    let tmp = -1;
    return values.map(d => {
        const num = DateTime.fromJSDate(d)[accessor]
        if (num !== tmp) {
            tmp = num;
            return value
        }
        return 0;
    });
}

export { specificDate, specificDateChange };