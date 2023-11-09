const VALIDATORS = Object.freeze({
    EXCLUSIVE_0_1: value => value > 0 && value < 1,
    NOT_ZERO: value => value !== 0,
    POSITIVE: value => value > 0,
    INTEGER: value => Number.isInteger(value)
});
const VALIDATOR_IDS = Object.keys(VALIDATORS);

const DEFAULT_OPTIONS = {
    min: NaN,
    max: NaN,
    step: 0.001,
    validators: [],
}

function rangeToString(min, max, validators) {

    let minVal = min;
    let maxVal = max;
    let left = Number.isNaN(min) ? "(" : "[";
    let right = Number.isNaN(max) ? ")" : "]";

    if (validators.includes("EXCLUSIVE_0_1")) {
        left = "(";
        right = ")";
        minVal = Math.max(minVal, 0);
        maxVal = Math.min(maxVal, 1);
    } else if (validators.includes("POSITIVE")) {
        left = "(";
        minVal = Math.max(minVal, 0);
    }

    if (Number.isNaN(min)) { minVal = "-&infin;" }
    if (Number.isNaN(max)) { maxVal = "+&infin;" }

    return `x &isinv; ${left}${minVal}, ${maxVal}${right}`
}
function validatorToString(validator) {
    switch(validator) {
        case "NOT_ZERO": return "x &ne; 0"
        case "INTEGER": return "x &isinv; Z"
    }
}

class GeneratorOption {

    constructor(name, value, options=DEFAULT_OPTIONS) {
        this.name = name;
        this.value = value;
        this.title = options.title ? options.title : name;
        this.min = options.min ? options.min : DEFAULT_OPTIONS.min;
        this.max = options.max ? options.max : DEFAULT_OPTIONS.max;
        this.step = options.step ? options.step : DEFAULT_OPTIONS.step;
        this.validators = options.validators ? options.validators : DEFAULT_OPTIONS.validators;
    }

    copy() {
        return new GeneratorOption(
            this.name,
            this.value,
            {
                min: this.min,
                max: this.max,
                step: this.step,
                validators: this.validators,
                title: this.title,
            }
        )
    }

    toJSON() {
        return {
            name: this.name,
            value: this.value,
            title: this.title,
            min: this.min,
            max: this.max,
            step: this.step,
            validators: this.validators,
        }
    }

    static fromJSON(json) {
        return new GeneratorOption(
            json["name"],
            json["value"],
            json
        )
    }

    toString(includeName=true) {
        const rstr = rangeToString(this.min, this.max, this.validators);
        const vals = this.validators.map(validatorToString).filter(d => d).join(" | ");
        if (vals.length > 0) {
            return includeName ? `${this.name}: { ${rstr} | ${vals} }` : `{ ${rstr} | ${vals} }`
        }
        return includeName ? `${this.name}: { ${rstr} }` : `{ ${rstr} }`
    }

    isValid(value=this.value) {
        return !Number.isNaN(value) &&
            (this.validators.length === 0 || !this.validators.some(d => !VALIDATORS[d](value))) &&
            (Number.isNaN(this.min) || value >= this.min) &&
            (Number.isNaN(this.max) || value <= this.max) &&
            ((Number.isNaN(this.min) || Number.isNaN(this.max)) || this.min < this.max)
    }
}

export { GeneratorOption as default, VALIDATOR_IDS }