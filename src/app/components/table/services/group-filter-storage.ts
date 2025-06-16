// --- LocalStorage сервис для фильтра групп ---
const GROUP_FILTER_KEY = 'table-group-filter';
const GROUP_ORDER_KEY = 'table-group-order';

export function saveGroupFilterState(state: Record<string, boolean>) {
  try {
    localStorage.setItem(GROUP_FILTER_KEY, JSON.stringify(state));
  } catch {}
}

export function loadGroupFilterState(allGroups: string[]): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(GROUP_FILTER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Гарантируем, что все группы присутствуют (новые группы по умолчанию true)
      return Object.fromEntries(
        allGroups.map(g => [g, parsed[g] !== undefined ? parsed[g] : true])
      );
    }
  } catch {}
  // По умолчанию все включены
  return Object.fromEntries(allGroups.map(g => [g, true]));
}

export function saveGroupOrder(order: string[]) {
  try {
    localStorage.setItem(GROUP_ORDER_KEY, JSON.stringify(order));
  } catch {}
}

export function loadGroupOrder(defaultOrder: string[]): string[] {
  try {
    const raw = localStorage.getItem(GROUP_ORDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Гарантируем, что все группы присутствуют (новые добавляем в конец)
      const missing = defaultOrder.filter(g => !parsed.includes(g));
      return [...parsed, ...missing];
    }
  } catch {}
  return defaultOrder;
} 