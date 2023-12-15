import React, {useEffect, useState} from "react";
import axios from "axios";
import {weatherAPI} from "../config/APIConfig";

const WeatherDetail = ({apiUrl, id, weatherData}) => {
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(weatherAPI.weather(id));
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    // Get weather icon
    const getWeatherIcon = (item) => {
        switch (item.weather) {
            case 'Bầu trời quang đãng':
                return <img src="assets/images/weather-icons/sunny.png" alt="sunny" width="180"
                            height="180"/>;

            case 'Mây rải rác':
                return <img src="assets/images/weather-icons/mild_sunshine.png" alt="mild sunshine" width="200"
                            height="200"/>;

            case 'Mây thưa':
                return <img src="assets/images/weather-icons/cloudy.png" alt="cloudy" width="200"
                            height="200"/>;

            case 'Mây cụm':
                return <img src="assets/images/weather-icons/mostly_cloudy.png" alt="mostly cloudy" width="200"
                            height="200"/>;

            case 'Mây đen u ám':
                return <img src="assets/images/weather-icons/mostly_cloudy.png" alt="mostly cloudy" width="200"
                            height="200"/>;

            case 'Mưa vừa':
                return <img src="assets/images/weather-icons/rainy.png" alt="rainy" width="200"
                            height="200"/>;

            case 'Mưa nhẹ':
                return <img src="assets/images/weather-icons/rainy.png" alt="rainy" width="200"
                            height="200"/>;

            case 'Mưa dông':
                return <img src="assets/images/weather-icons/thunderstorm.png" alt="thunderstorm" width="200"
                            height="200"/>;

            case 'Đêm có mây':
                return <img src="assets/images/weather-icons/moon_cloudy.png" alt="thunderstorm" width="200"
                            height="200"/>;
        }
    }

    // Format datetime
    const formatDay = (date) => {
        try {
            const options = { weekday: 'long' };
            return new Intl.DateTimeFormat('vi-VN', options).format(new Date(date));
        } catch (error) {
            console.error('Error parsing date: ', error);
            return 'Invalid date';
        }
    }

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [apiUrl, id]);

    return (
        <div id="wrapper" className="col">
            {data.map((item) => (
                <div key={item.id} className="container">
                    <div className="row weather-status">
                        <div id="date" className="row-cols-1">
                            <h3>{item.province}</h3>
                            <h3>{formatDay(item.time)}</h3>
                        </div>

                        <div id="status">
                            {getWeatherIcon(item)}
                            <p className="text-center">{item.weather}</p>
                        </div>
                    </div>

                    <div className="row weather-temp">
                        <ul className="col">
                            <li className="row-3">
                                <h3 className="title text-center">Nhiệt độ</h3>
                                <h1 className="value col row">{item.temperature}&deg;
                                    <img src="assets/images/temperature.png" alt="temperature" width="80"
                                         height="80"/>
                                </h1>

                            </li>

                            <li className="row-3 weather-humidity">
                                <h3 className="title text-center">Độ ẩm</h3>
                                <h3 className="value humidity">{item.humidity} %
                                    <img src="assets/images/water.png" alt="temperature" width="40" height="40"/>
                                </h3>
                            </li>
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default WeatherDetail;