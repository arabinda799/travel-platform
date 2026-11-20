import { describe, it, expect } from 'vitest';
import {
  calculatePresetRange,
  DATE_RANGE_PRESETS,
  formatDisplayDate,
  formatRangeString,
} from './date-range-preset';

describe('DateRangePresets calculation', () => {
  const refDate = new Date(2026, 10, 19, 14, 30); // 19 Nov 2026 (month is 0-indexed: 10 = Nov)

  it('should calculate Today correctly', () => {
    const [start, end] = calculatePresetRange('today', refDate);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(10);
    expect(start.getDate()).toBe(19);
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(23);
  });

  it('should calculate Yesterday correctly', () => {
    const [start, end] = calculatePresetRange('yesterday', refDate);
    expect(start.getDate()).toBe(18);
    expect(end.getDate()).toBe(18);
  });

  it('should calculate Last 7 Days correctly (6 days ago to today)', () => {
    const [start, end] = calculatePresetRange('last7days', refDate);
    expect(start.getDate()).toBe(13);
    expect(end.getDate()).toBe(19);
  });

  it('should calculate Last 30 Days correctly', () => {
    const [start, end] = calculatePresetRange('last30days', refDate);
    expect(end.getDate()).toBe(19);
    // 30 days inclusive from 19 Nov is 21 Oct
    expect(start.getMonth()).toBe(9); // Oct
    expect(start.getDate()).toBe(21);
  });

  it('should calculate This Month correctly', () => {
    const [start, end] = calculatePresetRange('thisMonth', refDate);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(10);
    expect(end.getDate()).toBe(30); // Nov has 30 days
  });

  it('should calculate Last Month correctly', () => {
    const [start, end] = calculatePresetRange('lastMonth', refDate);
    expect(start.getMonth()).toBe(9); // Oct
    expect(start.getDate()).toBe(1);
    expect(end.getMonth()).toBe(9);
    expect(end.getDate()).toBe(31); // Oct has 31 days
  });

  it('should calculate This Financial Year (Apr 1 to Mar 31) correctly in Nov', () => {
    const [start, end] = calculatePresetRange('thisFinancialYear', refDate);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(3); // April
    expect(start.getDate()).toBe(1);
    expect(end.getFullYear()).toBe(2027);
    expect(end.getMonth()).toBe(2); // March
    expect(end.getDate()).toBe(31);
  });

  it('should calculate This Financial Year correctly when in Jan/Feb/Mar', () => {
    const janDate = new Date(2026, 0, 15); // 15 Jan 2026
    const [start, end] = calculatePresetRange('thisFinancialYear', janDate);
    expect(start.getFullYear()).toBe(2025);
    expect(start.getMonth()).toBe(3); // April 2025
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(2); // March 2026
  });

  it('should calculate This Year correctly (Jan 1 to Dec 31)', () => {
    const [start, end] = calculatePresetRange('thisYear', refDate);
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(1);
    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(11);
    expect(end.getDate()).toBe(31);
  });

  it('should have all 8 presets plus custom range defined', () => {
    expect(DATE_RANGE_PRESETS.length).toBe(9);
    const ids = DATE_RANGE_PRESETS.map((p) => p.id);
    expect(ids).toContain('today');
    expect(ids).toContain('yesterday');
    expect(ids).toContain('last7days');
    expect(ids).toContain('last30days');
    expect(ids).toContain('thisMonth');
    expect(ids).toContain('lastMonth');
    expect(ids).toContain('thisFinancialYear');
    expect(ids).toContain('thisYear');
    expect(ids).toContain('custom');
  });

  it('should format range strings cleanly', () => {
    const d1 = new Date(2026, 10, 5);
    const d2 = new Date(2026, 10, 12);
    expect(formatRangeString(d1, d2)).toBe('05 Nov 2026 - 12 Nov 2026');
    expect(formatRangeString(d1, d1)).toBe('05 Nov 2026');
  });
});
