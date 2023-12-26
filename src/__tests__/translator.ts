import { translator } from '../SlashCommands/students/src/archive/translator';

describe('Translator for the archive', () => {
    it('should return the translated string', () => {
        expect(translator('lab', 'fr')).toBe('tp');
    });

    it('should throw an error when the key is not valid', () => {
        expect(() => translator('invalid', 'fr')).toThrow();
    });
});
