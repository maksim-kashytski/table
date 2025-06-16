import { NextResponse } from 'next/server';

const data = [
  {
    key: '1',
    name: 'АКТИВ',
    currencies: [
      {
        code: 'USD',
        intervals: [
          { label: 'До востребования', value: 554434728, percent: 4.01 },
          { label: 'До 30 дней', value: 144548728, percent: 0.15 },
          { label: 'До 6 месяцев', value: 100000000, percent: 0.1 },
        ],
      },
      {
        code: 'EUR',
        intervals: [
          { label: 'До востребования', value: 554434728, percent: 4.01 },
          { label: 'До 30 дней', value: 144548728, percent: 0.15 },
          { label: 'До 6 месяцев', value: 100000000, percent: 0.1 },
        ],
      },
      {
        code: 'RUB',
        intervals: [
          { label: 'До востребования', value: 554434728, percent: 4.01 },
          { label: 'До 30 дней', value: 144548728, percent: 0.15 },
          { label: 'До 6 месяцев', value: 100000000, percent: 0.1 },
        ],
      },
    ],
    children: [
      {
        key: '1.1',
        name: 'item ipsum',
        currencies: [
          {
            code: 'USD',
            intervals: [
              { label: 'До востребования', value: 210000000, percent: 5.01 },
              { label: 'До 30 дней', value: 110000000, percent: 0.1 },
              { label: 'До 6 месяцев', value: 80000000, percent: 0.1 },
            ],
          },
          {
            code: 'EUR',
            intervals: [
              { label: 'До востребования', value: 210000000, percent: 5.01 },
              { label: 'До 30 дней', value: 110000000, percent: 0.1 },
              { label: 'До 6 месяцев', value: 80000000, percent: 0.1 },
            ],
          },
        ],
      },
      {
        key: '1.2',
        name: 'dolor amet',
        currencies: [
          {
            code: 'USD',
            intervals: [
              { label: 'До востребования', value: 310000000, percent: 3.11 },
              { label: 'До 30 дней', value: 120000000, percent: 0.1 },
              { label: 'До 6 месяцев', value: 90000000, percent: 0.1 },
            ],
          },
        ],
      },
    ],
  },
  {
    key: '2',
    name: 'ПАССИВ',
    currencies: [
      {
        code: 'USD',
        intervals: [
          { label: 'До востребования', value: 354434728, percent: 3.98 },
          { label: 'До 30 дней', value: 244548728, percent: 0.15 },
          { label: 'До 6 месяцев', value: 200000000, percent: 0.1 },
        ],
      },
      {
        code: 'EUR',
        intervals: [
          { label: 'До востребования', value: 354434728, percent: 3.98 },
          { label: 'До 30 дней', value: 244548728, percent: 0.15 },
          { label: 'До 6 месяцев', value: 200000000, percent: 0.1 },
        ],
      },
    ],
    children: [
      {
        key: '2.1',
        name: 'item ipsum',
        currencies: [
          {
            code: 'USD',
            intervals: [
              { label: 'До востребования', value: 110000000, percent: 5.01 },
              { label: 'До 30 дней', value: 10000000, percent: 0.1 },
              { label: 'До 6 месяцев', value: 8000000, percent: 0.1 },
            ],
          },
        ],
      },
      {
        key: '2.2',
        name: 'dolor amet',
        currencies: [
          {
            code: 'USD',
            intervals: [
              { label: 'До востребования', value: 210000000, percent: 5.01 },
              { label: 'До 30 дней', value: 110000000, percent: 0.1 },
              { label: 'До 6 месяцев', value: 80000000, percent: 0.1 },
            ],
          },
        ],
      },
    ],
  },
];

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return NextResponse.json(data);
} 