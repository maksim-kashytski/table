import React from "react";
import { Table } from "antd";
import { data } from "./mock";
import { GroupFilterButtons } from "./group-filter-buttons/group-filter-buttons";
import {
  saveGroupFilterState,
  loadGroupFilterState,
  saveGroupOrder,
  loadGroupOrder,
  saveGroupExpandedState,
  loadGroupExpandedState,
} from "./services/group-filter-storage";
import { generateColumns } from "./utils";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';

import "antd/dist/reset.css";
import "./style.scss";

const getAllGroups = (data: any[]): string[] => {
  const groups = new Set<string>();
  const traverse = (items: any[]) => {
    items.forEach((item) => {
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
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>(
    () => loadGroupExpandedState(allGroups)
  );
  const [activeGroups, setActiveGroups] = React.useState<
    Record<string, boolean>
  >(() => loadGroupFilterState(allGroups));
  const [groupOrder, setGroupOrder] = React.useState<string[]>(() =>
    loadGroupOrder(allGroups),
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // DnD обработчик для колонок (групп)
  const handleGroupColumnDragEnd = (event: any) => {
    const { active, over } = event;
    if (active?.id && over?.id && active.id !== over.id) {
      const oldIndex = groupOrder.indexOf(active.id);
      const newIndex = groupOrder.indexOf(over.id);
      setGroupOrder((prev) => arrayMove(prev, oldIndex, newIndex));
    }
  };

  // Сохраняем фильтр в localStorage при изменении
  React.useEffect(() => {
    saveGroupFilterState(activeGroups);
  }, [activeGroups]);

  // Сохраняем порядок групп при изменении
  React.useEffect(() => {
    saveGroupOrder(groupOrder);
  }, [groupOrder]);

  // Сохраняем состояние раскрытости групп при изменении
  React.useEffect(() => {
    saveGroupExpandedState(expandedGroups);
  }, [expandedGroups]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const handleGroupFilter = (group: string) => {
    setActiveGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Drag & drop reorder handler
  const handleGroupDragEnd = (from: number, to: number) => {
    setGroupOrder((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(from, 1);
      updated.splice(to, 0, removed);
      return updated;
    });
  };

  // Фильтруем dataSource по активным группам
  const filterData = (items: any[]): any[] => {
    return items.map((item) => {
      let filtered = { ...item };
      if (filtered.currencies) {
        filtered.currencies = filtered.currencies.filter(
          (c: any) => activeGroups[c.group],
        );
        // Сортируем currencies по groupOrder
        filtered.currencies.sort(
          (a: any, b: any) =>
            groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group),
        );
      }
      if (filtered.children) {
        filtered.children = filterData(filtered.children);
      }
      return filtered;
    });
  };

  const filteredData = React.useMemo(
    () => filterData(dataSource),
    [activeGroups, groupOrder],
  );

  // Используем groupOrder для порядка колонок
  const orderedColumns = React.useMemo(() => {
    // Передаём groupOrder в generateColumns через filteredData
    // generateColumns уже использует порядок currencies в data, поэтому сортируем их выше
    return generateColumns(filteredData, expandedGroups, toggleGroup, groupOrder, true);
  }, [expandedGroups, filteredData, groupOrder]);

  // Кнопки в порядке groupOrder
  const orderedGroups = groupOrder;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        width: "100%",
      }}
    >
      <GroupFilterButtons
        groups={orderedGroups}
        activeGroups={activeGroups}
        onToggle={handleGroupFilter}
        onDragEnd={handleGroupDragEnd}
      />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleGroupColumnDragEnd}
      >
        <SortableContext items={orderedGroups} strategy={horizontalListSortingStrategy}>
          <Table
            columns={orderedColumns}
            dataSource={filteredData}
            pagination={false}
            bordered
            size="middle"
            scroll={{ x: 1200 }}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SimpleTable;
