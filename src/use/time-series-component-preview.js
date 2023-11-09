import Generator from "./generator";

export default function makePreview(type, n) {
    const g = new Generator(type);
    return g.generate(n)
}