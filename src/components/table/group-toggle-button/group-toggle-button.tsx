import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "antd";
import "./style.scss";

export const GroupToggleButton: React.FC<{
  expanded: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}> = ({ expanded, onClick }) => (
  <Button
    className="group-toggle-btn"
    shape="circle"
    size="small"
    icon={expanded ? <ArrowLeftOutlined /> : <ArrowRightOutlined />}
    style={{ marginLeft: 8 }}
    onClick={onClick}
  />
);
