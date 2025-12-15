interface FormatterOptions {
  precision?: number;
  full?: boolean;
  thousandSeparator?: string;
  decimalSeparator?: string;
  suffix?: string;
  prefix?: string;
}

const defaultOptions: Required<FormatterOptions> = {
  precision: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
  suffix: '',
  prefix: '',
  full: true,
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const formatThousandNumber = (value: number) => {
  if (value >= 1000) {
    return `${formatDecimal(value / 1000)}K`;
  }
  return formatDecimal(value).toString();
};

export function formatDecimal(value: number | string, options?: FormatterOptions): string {
  const currentValue = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(currentValue)) {
    throw new Error(
      'Invalid value. Please provide a valid number or string representation of a number.'
    );
  }

  const { precision, thousandSeparator, decimalSeparator, prefix, suffix } = {
    ...defaultOptions,
    ...options,
  };

  const parts = currentValue.toFixed(precision).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
  const decimalPart = parts[1];

  return `${prefix}${integerPart}`
    .concat(decimalPart ? `${decimalSeparator}${decimalPart}` : '')
    .concat(suffix);
}

export const calculateGrowth = (input1: number, input2: number): number => {
  if (input2 === 0) return 0; // Avoid division by zero

  const growth = (1 - (input2 - input1) / input2) * 100;
  return parseFloat(growth.toFixed(2));
};

export function formatInt(value: number | string, options?: FormatterOptions) {
  return formatDecimal(value, { ...options, precision: 0 });
}

export function formatPercentage(value: number | string, options?: FormatterOptions): string {
  return formatDecimal(value, { ...options, suffix: '%' });
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = '$',
  options?: FormatterOptions
): string {
  const safeValue = value ?? 0;
  return formatDecimal(safeValue, { ...options, prefix: currency });
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function randomInt({ min, max }: { min: number; max: number }) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
