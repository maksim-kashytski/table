import { GroupToggleButton } from "./group-toggle-button/group-toggle-button";
import { SortableGroupHeader } from "./sortable-group-header/sortable-group-header";

import "antd/dist/reset.css";
import "./style.scss";

const firstColumn = {
    title: "СТАТЬЯ",
    key: "statya-group",
    align: "center",
    fixed: "left",
    width: 250,
    dataIndex: "name",
    render: (_: any, record: any) => (
        <div style={{ display: "flex" }}>
            <div
                style={{
                    fontWeight: "bold",
                    minWidth: 60,
                    textAlign: "center",
                    borderRight: "1px solid #eee",
                    paddingRight: 8,
                    marginRight: 8,
                }}
            >
                {record.key}
            </div>
            <div style={{ flex: 1, paddingLeft: 8 }}>{record.name}</div>
        </div>
    ),
};

export const generateColumns = (
    data: any[],
    expandedGroups: Record<string, boolean>,
    toggleGroup: (group: string) => void,
    groupOrder: string[],
    enableGroupDnd: boolean = false
) => {
    if (!data || data.length === 0) return [];
    const currencies = data[0].currencies;
    if (!currencies)
        return [{ title: "СТАТЬЯ", dataIndex: "name", key: "name" }];

    // Первая колонка — наименование
    const columns: any[] = [
        firstColumn,
    ];

    // Сортируем currencies по groupOrder
    const orderedCurrencies = [...currencies].sort(
        (a: any, b: any) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group)
    );

    orderedCurrencies.forEach((currency: any) => {
        currency.parts.forEach((part: any) => {
            // Показываем только isPrimary если группа закрыта
            if (!expandedGroups[currency.group] && !part.isPrimary) return;

            // DnD-обёртка только для isPrimary (заголовка группы)
            let groupHeader = (
                <span className="table-header-title">
                    {part.title}
                    {part.isPrimary && (
                        <GroupToggleButton
                            expanded={!!expandedGroups[currency.group]}
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleGroup(currency.group);
                            }}
                        />
                    )}
                </span>
            );
            if (enableGroupDnd && part.isPrimary) {
                groupHeader = (
                    <SortableGroupHeader id={currency.group}>
                        {groupHeader}
                    </SortableGroupHeader>
                );
            }
            columns.push({
                title: groupHeader,
                align: "center",
                className:
                    expandedGroups[currency.group] && !part.isPrimary
                        ? "expanded-header"
                        : undefined,
                children: part.columns.map((col: any) => ({
                    title: col.title,
                    dataIndex: [currency.group, part.title, col.title].join("__"),
                    key: [currency.group, part.title, col.title].join("__"),
                    align: typeof col.value === "number" ? "right" : "left",
                    width: 120,
                    className:
                        expandedGroups[currency.group] && !part.isPrimary
                            ? "expanded-cell"
                            : undefined,
                    render: (_: any, record: any) => {
                        const curr = record.currencies?.find(
                            (c: any) => c.group === currency.group,
                        );
                        const partObj = curr?.parts?.find(
                            (p: any) => p.title === part.title,
                        );
                        const colObj = partObj?.columns?.find(
                            (c: any) => c.title === col.title,
                        );
                        return colObj ? colObj.value : null;
                    },
                })),
            });
        });
    });

    return columns;
};
