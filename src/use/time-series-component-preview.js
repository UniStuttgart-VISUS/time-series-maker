import Generator from "./generator";

export default function makePreview(type, nOrValues) {
    const g = new Generator(type);
    return g.generate(nOrValues)
}