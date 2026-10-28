const TOPIC_KEYWORDS: Record<string, string[]> = {
  projects: ['project', 'vault', 'momorybox', 'video platform', 'trello', 'pmt', 'trelloomcp', 'case study', 'built'],
  skills: ['skill', 'react', 'node', 'javascript', 'typescript', 'tech stack', 'technolog', 'frontend', 'backend', 'stack'],
  experience: ['experience', 'work', 'job', 'intern', 'company', 'role', 'career'],
  education: ['education', 'study', 'degree', 'college', 'university', 'bsc', 'csit', 'learn'],
  availability: ['available', 'hire', 'freelance', 'contact', 'reach'],
};

interface TopicCount {
  name: string;
  count: number;
}

interface AnalyticsStore {
  total: number;
  errors: number;
  durations: number[];
  topics: Record<string, number>;
}

const store: AnalyticsStore = {
  total: 0,
  errors: 0,
  durations: [],
  topics: {},
};

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(): string {
  return new Date().toISOString().slice(0, 7);
}

const dailyCounts = new Map<string, number>();
const monthlyCounts = new Map<string, number>();

export function detectTopic(message: string): string | null {
  const text = message.toLowerCase();
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return topic;
  }
  return null;
}

export function recordAnalytics(message: string, options: { ok: boolean; durationMs: number }): void {
  store.total += 1;
  store.durations.push(options.durationMs);
  if (store.durations.length > 1000) store.durations.shift();
  if (!options.ok) store.errors += 1;

  const topic = detectTopic(message);
  if (topic) store.topics[topic] = (store.topics[topic] ?? 0) + 1;

  dailyCounts.set(todayKey(), (dailyCounts.get(todayKey()) ?? 0) + 1);
  monthlyCounts.set(monthKey(), (monthlyCounts.get(monthKey()) ?? 0) + 1);
}

export interface AnalyticsSummary {
  total: number;
  questionsToday: number;
  questionsThisMonth: number;
  avgResponseTimeMs: number;
  errorRate: number;
  popularTopics: TopicCount[];
}

export function getAnalytics(): AnalyticsSummary {
  const avg =
    store.durations.length > 0
      ? Math.round(store.durations.reduce((a, b) => a + b, 0) / store.durations.length)
      : 0;
  const errorRate = store.total > 0 ? store.errors / store.total : 0;

  const popularTopics = Object.entries(store.topics)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: store.total,
    questionsToday: dailyCounts.get(todayKey()) ?? 0,
    questionsThisMonth: monthlyCounts.get(monthKey()) ?? 0,
    avgResponseTimeMs: avg,
    errorRate,
    popularTopics,
  };
}

export function resetAnalytics(): void {
  store.total = 0;
  store.errors = 0;
  store.durations = [];
  store.topics = {};
  dailyCounts.clear();
  monthlyCounts.clear();
}