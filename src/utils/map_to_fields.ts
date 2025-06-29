export default class MapToFields {
    static mapToTSType(type: string): string {
        switch (type) {
            case "string":
            case "boolean":
            case "number":
            case "Date":
                return type;
            default:
                return "any";
        }
    }

    static mapToMongooseType(type: string): string {
        switch (type) {
            case "string": return "String";
            case "number": return "Number";
            case "boolean": return "Boolean";
            case "Date": return "Date";
            default: return "Schema.Types.Mixed";
        }
    }
}
