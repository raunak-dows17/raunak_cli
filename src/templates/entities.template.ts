import Fields from "../interfaces/fields";
import StringsUtils from "../utils/strings.utils";
import MapToFields from "../utils/map_to_fields";

export default class EntityTemplate {
    #stringUtils = new StringsUtils();
    getEntityTemplate(name: string, fields: Fields[]) {
        const className = this.#stringUtils.capitalize(name);
        const base = `id?: string;\n`;

        const props = fields.map((field) => ` ${field.name}: ${MapToFields.mapToTSType((field.type))}`).join("\n");

        return `export interface ${className} {
            ${base}${props}
            createdAt?: Date;
            updatedAt?: Date;
        }`;
    }

    getModelTemplate(name: string, fields: Fields[]) {
        const className = this.#stringUtils.capitalize(name);

        const schemaFields = fields.map((f) => {
            const isUnique = f.other === 'unique' ? "unique: true" : f.name.includes('email') ? "unique: true" : "";
            return ` ${f.name}: {type: ${MapToFields.mapToMongooseType(f.type)}, required: ${f.other === 'required'}, ${isUnique}}`;
        });

        return `
            import {Schema, model} from 'mongoose';
            import {${className}} from "../../domain/entities/${name}.entity";
            
            const ${this.#stringUtils.camelCase(className)}Schema = new Schema({
                ${schemaFields}
            }, {timestamps: true});
            
            export const ${this.#stringUtils.capitalize(className)}Model = model<${className}>('${className}', ${className}Schema);
        `
    }
}

