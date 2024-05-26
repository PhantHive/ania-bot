import { collectDefaultMetrics, Counter, Registry } from 'prom-client';
import { format } from 'date-fns';

export const categoryCounters = {
    mp: new Counter({
        name: 'mp_usage_total',
        help: 'Total number of times MP was accessed',
        labelNames: ['month'],
    }),
    lab: new Counter({
        name: 'lab_usage_total',
        help: 'Total number of times Lab was accessed',
        labelNames: ['month'],
    }),
    sheet: new Counter({
        name: 'sheet_usage_total',
        help: 'Total number of times Sheet was accessed',
        labelNames: ['month'],
    }),
    donation: new Counter({
        name: 'donation_usage_total',
        help: 'Total number of times Donation was accessed',
        labelNames: ['month'],
    }),
};

const registry = new Registry();
collectDefaultMetrics({ register: registry });

const getMonthLabel = () => format(new Date(), 'yyyy-MM');

export const archiveCommandCounter = new Counter({
    name: 'archive_command_usage_total',
    help: 'Total number of times the archive command was used',
    labelNames: ['month'],
});

export const incrementArchiveCommandCounter = () => {
    const monthLabel = getMonthLabel();
    archiveCommandCounter.labels(monthLabel).inc();
};

registry.registerMetric(archiveCommandCounter);

export const incrementCategoryCounter = (
    category: keyof typeof categoryCounters
) => {
    const monthLabel = getMonthLabel();
    categoryCounters[category].labels(monthLabel).inc();
};

registry.registerMetric(archiveCommandCounter);
Object.values(categoryCounters).forEach((counter) =>
    registry.registerMetric(counter)
);

export default registry;
