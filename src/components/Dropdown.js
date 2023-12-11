import React, {useEffect, useState} from "react";
import axios from "axios";
import {weatherAPI} from "../config/APIConfig";
import WeatherDetail from "./WeatherDetail";
import WeatherForecast from "./WeatherForecast";

function Dropdown({apiUrl, selected, setSelected}) {
    const [isActive, setIsActive] = useState(false);
    const [options, setOptions] = useState([]);
    const [weatherData, setWeatherData] = useState([]);
    const [selectedId, setSelectedId] = useState(2);

    const fetchData = async () => {
        try {
            const response = await axios.get(apiUrl);
            setOptions(response.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [apiUrl]);

    const getWeatherInfo = async (selectedId) => {
        try {
            const response = await axios.get(weatherAPI.weather(selectedId));
            setWeatherData(response.data);
        } catch (error) {
            console.error('Error fetching weather data: ', error);
        }
    };

    useEffect(() => {
        if (selectedId) {
            getWeatherInfo(selectedId);
        }
    }, [selectedId]);

    return (
        <>
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
                                    setSelectedId(option.ID);
                                    setSelected(option.province);
                                    setIsActive(false);
                                    getWeatherInfo(option.ID);
                                }}
                                className="dropdown-item" key={option.ID}>
                                {option.province}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <WeatherDetail apiUrl={apiUrl} id={selectedId} />

            <WeatherForecast apiUrl={weatherAPI.weather(selectedId)} id={selectedId}/>

        </>
);
}

export default Dropdown;