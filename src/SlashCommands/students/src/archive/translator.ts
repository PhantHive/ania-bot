import archive from '../../../../assets/translation/archive.json';

export const translator = (toTranslate: string, lang: string) => {
    try {
        return archive[toTranslate][lang];
    } catch {
        throw new Error(
            'Error: translator.ts\ntranslator function\n' +
                toTranslate +
                ' is not a valid key'
        );
    }
};
