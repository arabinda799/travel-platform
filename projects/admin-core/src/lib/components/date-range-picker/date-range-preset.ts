/**
 * Date Range Presets and calculation utilities.
 */

export type DateRangePresetId =
  | 'today'
  | 'yesterday'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisFinancialYear'
  | 'thisYear'
  | 'custom';

export interface DateRangePreset {
  id: DateRangePresetId;
  label: string;
  icon?: string;
  calculate: (now?: Date) => [Date, Date];
  getPreview: (now?: Date) => string;
}

export interface DateRangeSelection {
  preset: string;
  presetId: DateRangePresetId;
  startDate: Date | null;
  endDate: Date | null;
  formattedRange: string;
}

function startOfDay(d: Date): Date {
  const res = new Date(d);
  res.setHours(0, 0, 0, 0);
  return res;
}

function endOfDay(d: Date): Date {
  const res = new Date(d);
  res.setHours(23, 59, 59, 999);
  return res;
}

export function formatDisplayDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatShortDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  return `${day} ${month}`;
}

export function formatRangeString(start: Date | null, end: Date | null): string {
  if (!start && !end) return '';
  if (start && !end) return formatDisplayDate(start);
  if (!start && end) return formatDisplayDate(end);
  if (start && end) {
    if (start.getTime() === end.getTime() ||
        (start.getFullYear() === end.getFullYear() &&
         start.getMonth() === end.getMonth() &&
         start.getDate() === end.getDate())) {
      return formatDisplayDate(start);
    }
    return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
  }
  return '';
}

export function calculatePresetRange(id: DateRangePresetId, referenceDate = new Date()): [Date, Date] {
  const now = referenceDate;
  switch (id) {
    case 'today':
      return [startOfDay(now), endOfDay(now)];

    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      return [startOfDay(y), endOfDay(y)];
    }

    case 'last7days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      return [startOfDay(start), endOfDay(now)];
    }

    case 'last30days': {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      return [startOfDay(start), endOfDay(now)];
    }

    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [startOfDay(start), endOfDay(end)];
    }

    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfDay(start), endOfDay(end)];
    }

    case 'thisFinancialYear': {
      // April 1 to March 31
      const currentMonth = now.getMonth(); // 0 = Jan, 3 = April
      let fyStartYear: number;
      let fyEndYear: number;
      if (currentMonth >= 3) {
        fyStartYear = now.getFullYear();
        fyEndYear = now.getFullYear() + 1;
      } else {
        fyStartYear = now.getFullYear() - 1;
        fyEndYear = now.getFullYear();
      }
      const start = new Date(fyStartYear, 3, 1);
      const end = new Date(fyEndYear, 2, 31);
      return [startOfDay(start), endOfDay(end)];
    }

    case 'thisYear': {
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return [startOfDay(start), endOfDay(end)];
    }

    case 'custom':
    default:
      return [startOfDay(now), endOfDay(now)];
  }
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    id: 'today',
    label: 'Today',
    icon: 'today',
    calculate: (now) => calculatePresetRange('today', now),
    getPreview: (now) => formatDisplayDate(calculatePresetRange('today', now)[0]),
  },
  {
    id: 'yesterday',
    label: 'Yesterday',
    icon: 'history',
    calculate: (now) => calculatePresetRange('yesterday', now),
    getPreview: (now) => formatDisplayDate(calculatePresetRange('yesterday', now)[0]),
  },
  {
    id: 'last7days',
    label: 'Last 7 Days',
    icon: 'date_range',
    calculate: (now) => calculatePresetRange('last7days', now),
    getPreview: (now) => {
      const [s, e] = calculatePresetRange('last7days', now);
      return `${formatShortDate(s)} - ${formatShortDate(e)}`;
    },
  },
  {
    id: 'last30days',
    label: 'Last 30 Days',
    icon: 'calendar_month',
    calculate: (now) => calculatePresetRange('last30days', now),
    getPreview: (now) => {
      const [s, e] = calculatePresetRange('last30days', now);
      return `${formatShortDate(s)} - ${formatShortDate(e)}`;
    },
  },
  {
    id: 'thisMonth',
    label: 'This Month',
    icon: 'calendar_today',
    calculate: (now) => calculatePresetRange('thisMonth', now),
    getPreview: (now) => {
      const [s, e] = calculatePresetRange('thisMonth', now);
      return `${formatShortDate(s)} - ${formatShortDate(e)}`;
    },
  },
  {
    id: 'lastMonth',
    label: 'Last Month',
    icon: 'calendar_today',
    calculate: (now) => calculatePresetRange('lastMonth', now),
    getPreview: (now) => {
      const [s, e] = calculatePresetRange('lastMonth', now);
      return `${formatShortDate(s)} - ${formatShortDate(e)}`;
    },
  },
  {
    id: 'thisFinancialYear',
    label: 'This Financial Year',
    icon: 'account_balance',
    calculate: (now) => calculatePresetRange('thisFinancialYear', now),
    getPreview: (now) => {
      const [s, e] = calculatePresetRange('thisFinancialYear', now);
      return `Apr ${s.getFullYear()} - Mar ${e.getFullYear()}`;
    },
  },
  {
    id: 'thisYear',
    label: 'This Year',
    icon: 'event_note',
    calculate: (now) => calculatePresetRange('thisYear', now),
    getPreview: (now) => {
      const [s] = calculatePresetRange('thisYear', now);
      return `${s.getFullYear()}`;
    },
  },
  {
    id: 'custom',
    label: 'Custom Range',
    icon: 'edit_calendar',
    calculate: (now) => calculatePresetRange('custom', now),
    getPreview: () => 'Pick 2 dates',
  },
];
