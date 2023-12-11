import React, {useState} from "react";
import Dropdown from "./Dropdown";
import {apiUrl} from "../config/APIConfig";

const HomePage = () => {
    const [selected, setSelected] = useState("Chọn Tỉnh/Thành phố");
    return (
        <header>
            <Dropdown apiUrl={apiUrl} selected={selected} setSelected={setSelected}/>
        </header>
    )
}

export default HomePage;