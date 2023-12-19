const VALIDATORS = Object.freeze({
    EXCLUSIVE_0_1: value => value > 0 && value < 1,
    NOT_ZERO: value => value !== 0,
    POSITIVE: value => value > 0,
    INTEGER: value => Number.isInteger(value)
});
const VALIDATOR_IDS = Object.keys(VALIDATORS);

const DEFAULT_OPTIONS_NUM = {
    min: -Infinity,
    max: Infinity,
    step: 0.1,
    validators: [],
}
const DEFAULT_OPTIONS_CAT = {
    options: [],
    validators: [],
}

function rangeToString(min, max, validators) {

    let minVal = min;
    let maxVal = max;
    let left = Number.isFinite(min) ? "[" : "(";
    let right = Number.isFinite(max) ? "]" : ")";

    if (validators.includes("EXCLUSIVE_0_1")) {
        left = "(";
        right = ")";
        minVal = Math.max(minVal, 0);
        maxVal = Math.min(maxVal, 1);
    } else if (validators.includes("POSITIVE")) {
        left = "(";
        minVal = Math.max(minVal, 0);
    }
    if (!Number.isFinite(minVal)) { minVal = "-&infin;" }
    if (!Number.isFinite(maxVal)) { maxVal = "+&infin;" }

    return `x &isinv; ${left}${minVal}, ${maxVal}${right}`
}
function validatorsToString(validators) {
    return validators.map(v => {
        switch(v) {
            case "NOT_ZERO": {
                return validators.includes("EXCLUSIVE_0_1") || validators.includes("POSITIVE") ?
                    "x > 0" : "x &ne; 0"
            }
            case "INTEGER": return validators.includes("POSITIVE") ? "x &isinv; Z\\{ 0 }" : "x &isinv; Z"
        }
    }).filter(d => d)
}

class GeneratorOption {

    constructor(name, value, generator=null) {
        this.name = name;
        this.value = value;
        this.generator = generator;
    }

    setGenerator(generator) {
        this.generator = generator;
    }

    copy() {
        throw "called abstract method"
    }

    toJSON() {
        throw "called abstract method"
    }

    static fromJSON(json) {
        throw "called abstract method"
    }

    toString(includeName=true) {
        throw "called abstract method"
    }

    matchesValidators(value=this.value) {
        throw "called abstract method"
    }

    isValid(value=this.value) {
        throw "called abstract method"
    }
}

class NumericGeneratorOption extends GeneratorOption {

    constructor(name, value, options={}, generator=null) {

        options = Object.assign(Object.assign({}, DEFAULT_OPTIONS_NUM), options);
        super(name, value, generator);
        this.title = options.title ? options.title : name;
        this.min = options.min;
        this.max = options.max;
        this.step = options.step;
        this.validators = options.validators;
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
            },
            this.generator
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
        const vals = validatorsToString(this.validators).join(" | ");
        if (vals.length > 0) {
            return includeName ? `${this.name}: { ${rstr} | ${vals} }` : `{ ${rstr} | ${vals} }`
        }
        return includeName ? `${this.name}: { ${rstr} }` : `{ ${rstr} }`
    }

    matchesValidators(value=this.value) {
        let valid = true;
        if (this.generator !== null && (this.name === "xMin" || this.name === "xMax")) {
            const other = this.generator.getOpt(this.name === "xMin" ? "xMax" : "xMin");
            if (other !== undefined && other !== null) {
                valid = this.name === "xMin" ? value < other : value > other;
            }
        }
        return valid && !this.validators.some(d => !VALIDATORS[d](value))
    }

    isValid(value=this.value) {
        return !Number.isNaN(value) && this.matchesValidators(value) &&
            (Number.isNaN(this.min) || value >= this.min) &&
            (Number.isNaN(this.max) || value <= this.max) &&
            ((Number.isNaN(this.min) || Number.isNaN(this.max)) || this.min < this.max)
    }
}

class CategoricGeneratorOption extends GeneratorOption {

    constructor(name, value, options={}, generator=null) {

        options = Object.assign(Object.assign({}, DEFAULT_OPTIONS_CAT), options);
        super(name, value, generator);
        this.title = options.title ? options.title : name;
        this.options = options.options.length === 0 ? [this.value] : options.options;
        this.validators = options.validators;
    }

    copy() {
        return new GeneratorOption(
            this.name,
            this.value,
            {
                title: this.title,
                options: this.options,
                validators: this.validators,
            },
            this.generator
        )
    }

    toJSON() {
        return {
            name: this.name,
            value: this.value,
            title: this.title,
            options: this.options,
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
        const vals = validatorsToString(this.validators).join(" | ");
        if (vals.length > 0) {
            return includeName ? `${this.name}: { ${rstr} | ${vals} }` : `{ ${rstr} | ${vals} }`
        }
        return includeName ? `${this.name}: { ${rstr} }` : `{ ${rstr} }`
    }

    matchesValidators(value=this.value) {
        let valid = true;
        if (this.generator !== null && (this.name === "xMin" || this.name === "xMax")) {
            const other = this.generator.getOpt(this.name === "xMin" ? "xMax" : "xMin");
            if (other !== undefined && other !== null) {
                valid = this.name === "xMin" ? value < other : value > other;
            }
        }
        return valid && !this.validators.some(d => !VALIDATORS[d](value))
    }

    isValid(value=this.value) {
        return !Number.isNaN(value) && this.matchesValidators(value) &&
            (Number.isNaN(this.min) || value >= this.min) &&
            (Number.isNaN(this.max) || value <= this.max) &&
            ((Number.isNaN(this.min) || Number.isNaN(this.max)) || this.min < this.max)
    }
}

export { NumericGeneratorOption, VALIDATOR_IDS }