import StringsUtils from "../utils/strings.utils";
import Fields from "../interfaces/fields";
import MapToRules from "../utils/map_to_rules";

export default function getValidatorTemplate(name: string, fields: Fields[]) {
    const stringUtils = new StringsUtils();

    console.log(`Fields: ${fields}`)

    const className = stringUtils.camelCase(name);
    const rules = fields.map((field) => {
        const base = `"${field.name}": z.${MapToRules.mapZodRule(field.name.includes("name") ? "name" : field.name.includes("email") ? "email" : field.type)}${field.other == 'required' && field.name.includes("email") ? "" : ".optional()"}`
        return `  ${base}`
    }).join(",\n");

    return `
import { z } from "zod";

export const ${className}Validator = z.object({
    ${rules},
    "createdAt": z.date().optional(),
    "updatedAt": z.date().optional()
})
    `;
}
