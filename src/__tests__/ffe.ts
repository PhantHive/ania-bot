import { getFiles } from '../SlashCommands/students/src/archive/ffe';
import { ButtonInteraction } from 'discord.js';

describe('ffe system', () => {
    let mockInteraction: ButtonInteraction;

    beforeAll(() => {
        // mock an interaction
        mockInteraction = {
            guild: '1510455451101455',
            update: jest.fn(),
            deferReply: jest.fn(),
            editReply: jest.fn(),
            followUp: jest.fn(),
        } as unknown as ButtonInteraction;
    });

    it('Should throw an error if directory is not valid', async () => {
        await expect(
            getFiles(mockInteraction, 'invalid directory')
        ).rejects.toThrow();
    });
});
