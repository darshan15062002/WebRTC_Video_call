import { ElementType } from "react";
import "./CallControlButton.css";

const CallControlButton = ({
    onClick,
    Icon,
    active = true,
    className = ""
}) => {
    return (
        <button
            onClick={onClick}
            className={`call-control-button ${active ? 'active' : 'inactive'} ${className}`}
        >
            <Icon size={20} />
        </button>
    );
};

export default CallControlButton;