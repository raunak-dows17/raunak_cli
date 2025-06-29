import Fields from "../interfaces/fields";

export default function parseFields(input?: string): Fields[] {
    if (!input) return [];

    return input.split(",").map<Fields>(pair => {
        const [name, type, other] = pair.split(":");
        return {
            name: name.trim(),
            type: type.trim(),
            other: other?.trim() as 'required' | 'unique',
        };
    });
}
