import React, {useEffect, useState} from "react";
import axios from "axios";

function Dropdown({selected, setSelected}) {
    const [isActive, setIsActive] = useState(false);
    const [options, setOptions] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/api/data`);
            setOptions(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                                setSelected(option.province);
                                setIsActive(false);
                            }}
                            className="dropdown-item">
                            {option.province}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dropdown;