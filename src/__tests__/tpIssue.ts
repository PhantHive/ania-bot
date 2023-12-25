import { ButtonInteraction } from 'discord.js';
import { showTps } from '../SlashCommands/students/src/archive/archiveTp';

describe('showTps function', () => {
    it('should throw an error when guild is null', async () => {
        // Create a mock interaction object
        let mockInteraction = {
            guild: null,
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showTps(mockInteraction)).rejects.toThrow();
    });
});