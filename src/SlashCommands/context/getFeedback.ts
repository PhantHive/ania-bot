import { ContextMenuCommand } from '../../structures/SlashCommand';
import { openFeedback } from '../../events/guild/feedback/ffeFeedback';

exports.default = new ContextMenuCommand({
    name: 'feedback',
    targetType: 'User',
    run: async ({ interaction }) => {
        await openFeedback(interaction);
    },
});
