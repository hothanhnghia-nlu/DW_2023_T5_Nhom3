import React, {useState} from "react";
import Dropdown from "./Dropdown";

function Header() {
    const [selected, setSelected] = useState("Chọn Tỉnh/Thành phố");
    return (
        <header>
            <div className="container">
                <Dropdown selected={selected} setSelected={setSelected}/>
            </div>
        </header>
    )
}

export default Header;