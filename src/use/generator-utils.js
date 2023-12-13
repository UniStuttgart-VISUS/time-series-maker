import { DateTime } from "luxon";

function specificDate(values, target, value, accessor) {
    let count = 0;
    return values.map(d => {
        const num = DateTime.fromJSDate(d)[accessor]
        return num === target ? value : 0
    });
}

function specificDateChange(values, value, width, distance, unit) {

    let count = 0;
    let tmp = DateTime.fromJSDate(values[0]);

    return values.map(d => {
        const other = DateTime.fromJSDate(d)
        const diff = Math.floor(other.diff(tmp, unit).toObject()[unit])

        if (diff === distance) {
            tmp = other;
            count = 1;
            return value
        }

        if (count < width) {
            count++;
            return value;
        }

        return 0;
    });
}

export { specificDate, specificDateChange };