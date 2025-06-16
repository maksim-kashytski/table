'use client'

import React from 'react';
import { Table, Space, Button } from 'antd';
import { data } from './mock';
import { GroupToggleButton } from './group-toggle-button/group-toggle-button';
import { GroupFilterButtons } from './group-filter-buttons/group-filter-buttons';
import { saveGroupFilterState, loadGroupFilterState, saveGroupOrder, loadGroupOrder } from './services/group-filter-storage';

import 'antd/dist/reset.css';
import './style.scss';

// Генерация columns динамически на основе структуры data
const generateColumns = (
  data: any[],
  expandedGroups: Record<string, boolean>,
  toggleGroup: (group: string) => void
) => {
  if (!data || data.length === 0) return [];
  const currencies = data[0].currencies;
  if (!currencies) return [{ title: 'Наименование', dataIndex: 'name', key: 'name' }];

  // Первая колонка — наименование
  const columns: any[] = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 200,
    },
  ];

  currencies.forEach((currency: any) => {
    currency.parts.forEach((part: any) => {
      // Показываем только isPrimary если группа закрыта
      if (!expandedGroups[currency.group] && !part.isPrimary) return;

      columns.push({
        title: (
          <span className="table-header-title">
            {part.title}
            {part.isPrimary && (
              <GroupToggleButton
                expanded={!!expandedGroups[currency.group]}
                onClick={e => {
                  e.stopPropagation();
                  toggleGroup(currency.group);
                }}
              />
            )}
          </span>
        ),
        align: 'center',
        className: expandedGroups[currency.group] && !part.isPrimary ? 'expanded-header' : undefined,
        children: part.columns.map((col: any) => ({
          title: col.title,
          dataIndex: [currency.group, part.title, col.title].join('__'),
          key: [currency.group, part.title, col.title].join('__'),
          align: typeof col.value === 'number' ? 'right' : 'left',
          width: 120,
          className: expandedGroups[currency.group] && !part.isPrimary ? 'expanded-cell' : undefined,
          render: (_: any, record: any) => {
            const curr = record.currencies?.find((c: any) => c.group === currency.group);
            const partObj = curr?.parts?.find((p: any) => p.title === part.title);
            const colObj = partObj?.columns?.find((c: any) => c.title === col.title);
            return colObj ? colObj.value : null;
          },
        }))
      });
    });
  });

  return columns;
};

const getAllGroups = (data: any[]): string[] => {
  const groups = new Set<string>();
  const traverse = (items: any[]) => {
    items.forEach(item => {
      if (item.currencies) {
        item.currencies.forEach((c: any) => groups.add(c.group));
      }
      if (item.children) traverse(item.children);
    });
  };
  traverse(data);
  return Array.from(groups);
};

const dataSource = data;

const SimpleTable: React.FC = () => {
  const allGroups = React.useMemo(() => getAllGroups(data), []);
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [activeGroups, setActiveGroups] = React.useState<Record<string, boolean>>(
    () => loadGroupFilterState(allGroups)
  );
  const [groupOrder, setGroupOrder] = React.useState<string[]>(() => loadGroupOrder(allGroups));

  // Сохраняем фильтр в localStorage при изменении
  React.useEffect(() => {
    saveGroupFilterState(activeGroups);
  }, [activeGroups]);

  // Сохраняем порядок групп при изменении
  React.useEffect(() => {
    saveGroupOrder(groupOrder);
  }, [groupOrder]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const handleGroupFilter = (group: string) => {
    setActiveGroups(prev => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Drag & drop reorder handler
  const handleGroupDragEnd = (from: number, to: number) => {
    setGroupOrder(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return updated;
    });
  };

  // Фильтруем dataSource по активным группам
  const filterData = (items: any[]): any[] => {
    return items.map(item => {
      let filtered = { ...item };
      if (filtered.currencies) {
        filtered.currencies = filtered.currencies.filter((c: any) => activeGroups[c.group]);
        // Сортируем currencies по groupOrder
        filtered.currencies.sort((a: any, b: any) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group));
      }
      if (filtered.children) {
        filtered.children = filterData(filtered.children);
      }
      return filtered;
    });
  };
  const filteredData = React.useMemo(() => filterData(dataSource), [activeGroups, groupOrder]);

  // Используем groupOrder для порядка колонок
  const orderedColumns = React.useMemo(() => {
    // Передаём groupOrder в generateColumns через filteredData
    // generateColumns уже использует порядок currencies в data, поэтому сортируем их выше
    return generateColumns(filteredData, expandedGroups, toggleGroup);
  }, [expandedGroups, filteredData]);

  // Кнопки в порядке groupOrder
  const orderedGroups = groupOrder;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
      <GroupFilterButtons
        groups={orderedGroups}
        activeGroups={activeGroups}
        onToggle={handleGroupFilter}
        onDragEnd={handleGroupDragEnd}
      />
      <Table
        columns={orderedColumns}
        dataSource={filteredData}
        pagination={false}
        bordered
        scroll={{ x: 1200 }}
        size="middle"
      />
    </div>
  );
};

export default SimpleTable;
