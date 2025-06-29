export default class MapToRules {
    static mapZodRule(type: string): string {
        switch (type) {
            case "string": return `string().min(1)`;
            case "email": return `string().email()`;
            case "name": return `string().min(3)`;
            case "number": return `number()`;
            case "boolean": return `boolean()`;
            case "Date": return `date()`;
            default: return `any()`;
        }
    }
}
