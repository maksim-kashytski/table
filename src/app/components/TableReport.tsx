'use client'

import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Drawer, Skeleton } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import 'antd/dist/reset.css';
import { ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import './style.scss';
import * as currencyStorage from './currencyStorageService';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title } = Typography;

// Пример валют
const currencies = ['BYN', 'USD', 'EUR', 'RUB', 'CNY'];

// Drag handle for currency columns
const DraggableCurrencyHeader: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

const TableReport: React.FC = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrencies, setSelectedCurrenciesState] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = currencyStorage.getSelectedCurrencies();
      return saved.length ? saved : ['USD'];
    }
    return ['USD'];
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>(() => tableData.map(row => row.key));
  const [expandedCurrencies, setExpandedCurrencies] = useState<string[]>([]);
  const [currencyOrder, setCurrencyOrder] = useState<string[]>(currencies);

  // Обёртка для обновления и сохранения выбранных валют
  const setSelectedCurrencies = (updater: ((prev: string[]) => string[]) | string[]) => {
    setSelectedCurrenciesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      currencyStorage.setSelectedCurrencies(next);
      return next;
    });
  };

  // Восстанавливаем выбранные валюты при монтировании (для SSR/Next.js)
  useEffect(() => {
    const saved = currencyStorage.getSelectedCurrencies();
    if (saved.length) setSelectedCurrenciesState(saved);
  }, []);

  // useEffect для загрузки данных с бэкенда
  useEffect(() => {
    setLoading(true);
    fetch('/api/table-data')
      .then(res => res.json())
      .then(data => {
        setTableData(data);
        setExpandedRowKeys(data.map((row: any) => row.key));
      })
      .catch(() => {
        setTableData([]);
        setExpandedRowKeys([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Синхронизируем порядок валют с выбранными
    setCurrencyOrder((prev) => prev.filter((c) => selectedCurrencies.includes(c)));
  }, [selectedCurrencies]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = currencyOrder.indexOf(active.id);
      const newIndex = currencyOrder.indexOf(over.id);
      const newOrder = arrayMove(currencyOrder, oldIndex, newIndex);
      setCurrencyOrder(newOrder);
      // Сохраняем порядок валют в выбранных
      setSelectedCurrencies((prev) => {
        // Сохраняем только выбранные валюты, но в новом порядке
        return newOrder.filter((c) => prev.includes(c));
      });
    }
  };

  // Получаем список всех валют и всех интервалов из данных
  const allCurrencies = React.useMemo(() => {
    const set = new Set<string>();
    tableData.forEach(row => {
      row.currencies?.forEach((c: any) => set.add(c.code));
      row.children?.forEach((child: any) => child.currencies?.forEach((c: any) => set.add(c.code)));
    });
    return Array.from(set);
  }, [tableData]);

  const allIntervalsByCurrency = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    tableData.forEach(row => {
      row.currencies?.forEach((c: any) => {
        if (!map[c.code]) map[c.code] = [];
        c.intervals?.forEach((intv: any) => {
          if (!map[c.code].includes(intv.label)) map[c.code].push(intv.label);
        });
      });
      row.children?.forEach((child: any) => {
        child.currencies?.forEach((c: any) => {
          if (!map[c.code]) map[c.code] = [];
          c.intervals?.forEach((intv: any) => {
            if (!map[c.code].includes(intv.label)) map[c.code].push(intv.label);
          });
        });
      });
    });
    return map;
  }, [tableData]);

  // Формируем колонки для одной таблицы
  const columns: ColumnsType<any> = [
    {
      title: 'СТАТЬЯ',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
    },
  ];

  let scrollX = 300;

  (currencyOrder.length ? currencyOrder : selectedCurrencies).forEach((cur) => {
    const intervals = allIntervalsByCurrency[cur] || [];
    const visibleIntervals = expandedCurrencies.includes(cur) ? intervals : intervals.slice(0, 1);
    columns.push({
      title: (
        <DraggableCurrencyHeader id={cur}>
          <span>{cur}</span>
          <Button
            shape="circle"
            size="small"
            icon={expandedCurrencies.includes(cur) ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
            style={{ marginLeft: 8 }}
            onClick={e => {
              e.stopPropagation();
              setExpandedCurrencies(expandedCurrencies.includes(cur)
                ? expandedCurrencies.filter(c => c !== cur)
                : [...expandedCurrencies, cur]);
            }}
          />
        </DraggableCurrencyHeader>
      ),
      children: visibleIntervals.map((intervalLabel) => ({
        title: intervalLabel,
        children: [
          {
            title: 'Остаток',
            dataIndex: `${cur}_${intervalLabel}_value`,
            key: `${cur}_${intervalLabel}_value`,
            align: 'right' as const,
            render: (_: any, record: any) => {
              const currency = record.currencies?.find((c: any) => c.code === cur);
              const interval = currency?.intervals?.find((i: any) => i.label === intervalLabel);
              return interval?.value !== undefined ? interval.value.toLocaleString() : '';
            },
          },
          {
            title: '%СТ',
            dataIndex: `${cur}_${intervalLabel}_percent`,
            key: `${cur}_${intervalLabel}_percent`,
            align: 'right' as const,
            render: (_: any, record: any) => {
              const currency = record.currencies?.find((c: any) => c.code === cur);
              const interval = currency?.intervals?.find((i: any) => i.label === intervalLabel);
              return interval?.percent !== undefined ? interval.percent.toFixed(2) + ' %' : '';
            },
          },
        ],
      })),
    });
    scrollX += visibleIntervals.length * 2 * 120;
  });

  return (
    <div className="table-report-root">
      <Title level={5} className="table-report-title">Управленческий баланс / Отчёт</Title>
      <Space className="table-report-currency-buttons">
        {currencies.map((cur) => (
          <Button
            key={cur}
            type={selectedCurrencies.includes(cur) ? 'primary' : 'default'}
            onClick={() => setSelectedCurrencies((prev) => prev.includes(cur) ? prev.filter(c => c !== cur) : [...prev, cur])}
          >
            {cur}
          </Button>
        ))}
      </Space>
      <div style={{ width: '100%', flex: 1, minHeight: 0, overflow: 'auto' }}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={currencyOrder} strategy={verticalListSortingStrategy}>
            {loading ? (
              <Skeleton
                active
                paragraph={{ rows: 8 }}
                title={false}
                className="table-report-main-table"
                style={{ minWidth: 600 }}
              />
            ) : (
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                bordered
                scroll={{ x: scrollX, y: '100%' }}
                className="table-report-main-table"
                loading={loading}
                expandable={{
                  expandedRowKeys,
                  onExpand: (expanded, record) => {
                    setExpandedRowKeys(prev => {
                      if (expanded) return [...prev, record.key];
                      return prev.filter(k => k !== record.key);
                    });
                  },
                }}
              />
            )}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default TableReport; 