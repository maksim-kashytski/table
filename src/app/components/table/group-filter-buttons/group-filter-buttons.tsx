import React from 'react';;
import { Space, Button } from 'antd';
import './style.scss';

export const GroupFilterButtons: React.FC<{
  groups: string[];
  activeGroups: Record<string, boolean>;
  onToggle: (group: string) => void;
  onDragEnd: (from: number, to: number) => void;
}> = ({ groups, activeGroups, onToggle, onDragEnd }) => {
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);

  return (
    <Space className="table-report-currency-buttons">
      {groups.map((group, idx) => (
        <Button
          key={group}
          type={activeGroups[group] ? 'primary' : 'default'}
          draggable
          onDragStart={() => setDraggedIdx(idx)}
          onDragOver={e => e.preventDefault()}
          onDrop={() => {
            if (draggedIdx !== null && draggedIdx !== idx) {
              onDragEnd(draggedIdx, idx);
            }
            setDraggedIdx(null);
          }}
          onDragEnd={() => setDraggedIdx(null)}
          onClick={() => onToggle(group)}
          style={{ opacity: draggedIdx === idx ? 0.5 : 1, cursor: 'grab' }}
        >
          {group}
        </Button>
      ))}
    </Space>
  );
};