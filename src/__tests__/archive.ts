import { ButtonInteraction } from 'discord.js';
import { showTps } from '../SlashCommands/students/src/archive/archiveLab';
import { showMps } from '../SlashCommands/students/src/archive/archiveMp';
import { showTopics } from '../SlashCommands/students/src/archive/archiveTopics';
import { showFiches } from '../SlashCommands/students/src/archive/archiveSheet';

describe('showTps function', () => {
    it('should throw an error when guild is null', async () => {
        // Create a mock interaction object
        const mockInteraction = {
            guild: null,
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showTps(mockInteraction)).rejects.toThrow();
    });

    it('should not throw an error when guild is not null', async () => {
        // Create a mock interaction object
        const mockInteraction = {
            guild: '1510455451101455',
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showTps(mockInteraction)).resolves.not.toThrow();
    });
});

describe('showMps function', () => {
    it('should throw an error when guild is null', async () => {
        // Create a mock interaction object
        const mockInteraction: ButtonInteraction = {
            guild: null,
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showMps(mockInteraction)).rejects.toThrow();
    });

    it('should not throw an error when guild is not null', async () => {
        // Create a mock interaction object
        const mockInteraction: ButtonInteraction = {
            guild: '1510455451101455',
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showMps(mockInteraction)).resolves.not.toThrow();
    });
});

describe('showFiches function', () => {
    it('should throw an error when guild is null', async () => {
        // Create a mock interaction object
        const mockInteraction: ButtonInteraction = {
            guild: null,
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showFiches(mockInteraction)).rejects.toThrow();
    });

    it('should not throw an error when guild is not null', async () => {
        // Create a mock interaction object
        const mockInteraction: ButtonInteraction = {
            guild: '1510455451101455',
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(showFiches(mockInteraction)).resolves.not.toThrow();
    });
});

describe('showTopics function', () => {
    it('should throw an error when guild is null', async () => {
        // Create a mock interaction object
        const mockInteraction: ButtonInteraction = {
            guild: null,
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(
            showTopics(mockInteraction, '1510455451101455')
        ).rejects.toThrow();
    });

    it('should not throw an error when guild is not null and field is not empty', async () => {
        // Create a mock interaction object
        const mockInteraction: ButtonInteraction = {
            guild: '1510455451101455',
            update: jest.fn(),
        } as unknown as ButtonInteraction;

        // We expect the function to throw an error
        await expect(
            showTopics(mockInteraction, 'maths')
        ).resolves.not.toThrow();
    });
});
