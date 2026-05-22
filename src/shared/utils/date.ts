const MS_PER_DAY = 1000 * 60 * 60 * 24;
type DateInput = string | number | Date;

export const addMonths = (date: DateInput, months: number): Date => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

export const getExpirationDate = (createdAt: DateInput): string => addMonths(createdAt, 6).toISOString();

export const getRemainingDays = (expirationDate: DateInput, now: Date = new Date()): number => {
  return Math.ceil((new Date(expirationDate).getTime() - now.getTime()) / MS_PER_DAY);
};

export const isExpiringWithinDays = (
  expirationDate: DateInput,
  days: number,
  now: Date = new Date(),
): boolean => {
  const remainingDays = getRemainingDays(expirationDate, now);
  return remainingDays > 0 && remainingDays <= days;
};

export const formatDate = (dateString: DateInput, locale: Intl.LocalesArgument = 'es-ES'): string => {
  return new Date(dateString).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const toDateInputValue = (date: DateInput): string => new Date(date).toISOString().slice(0, 10);

export const fromDateInputValue = (dateValue?: string): string => {
  if (!dateValue) return '';
  return new Date(`${dateValue}T23:59:59`).toISOString();
};
