export default class StringsUtils {
    capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    camelCase(str: string): string {
        return str
            .split('-')
            .map((word) => this.capitalize(word))
            .join('');
    }
}
