import { dsvFormat } from "d3"

function formatAll(header, data, separator=",") {
    const formatter = dsvFormat(separator)
    let str = formatter.formatRow(header) + "\n";

    if (data.length === 0) return str;

    if (Array.isArray(data[0])) {
        str += formatter.formatRows(data)
    } else {
        str += formatter.formatRow(data)
    }

    return str;
}

function format(data, separator=",") {
    if (data.length === 0) return "";

    const formatter = dsvFormat(separator)
    let str = "";

    if (Array.isArray(data[0])) {
        str += formatter.formatRows(data)
    } else {
        str += formatter.formatRow(data)
    }

    return str;
}

export { format, formatAll }