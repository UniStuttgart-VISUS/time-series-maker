import Generator from "./generator";

export default function makePreview(type, nOrValues) {
    const g = new Generator(type);
    const n = Array.isArray(nOrValues) ? nOrValues.length : nOrValues;
    switch (type) {
        case "WAVE_BARTLETT_PULSE": {
            if (g.getOpt("duration") > n) {
                g.setOpt("duration", n);
                g.setOpt("period", n);
            }
            break;
        }
    }
    return g.generate(nOrValues)[0]
}