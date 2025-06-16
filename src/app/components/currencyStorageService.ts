// Сервис для работы с выбранными валютами в localStorage

const STORAGE_KEY = 'selectedCurrencies';

export function getSelectedCurrencies(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    // ignore
  }
  return [];
}

export function setSelectedCurrencies(currencies: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
  } catch (e) {
    // ignore
  }
} 