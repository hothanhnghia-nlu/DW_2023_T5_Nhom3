import React, {useState} from "react";

function Dropdown({selected, setSelected}) {
    const [isActive, setIsActive] = useState(false);
    const options = ['Hà Nội', 'TP.Hồ Chí Minh', 'Đồng Nai']

    return (
        <div className="dropdown">
            <div className="dropdown-btn" onClick={(e) =>
            setIsActive(!isActive)}>
                {selected}
                <span className="fa fa-caret-down"></span>
            </div>
            {isActive && (
                <div className="dropdown-content">
                    {options.map((option) => (
                        <div
                            onClick={(e) => {
                                setSelected(option);
                                setIsActive(false);
                            }}
                            className="dropdown-item">
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dropdown;