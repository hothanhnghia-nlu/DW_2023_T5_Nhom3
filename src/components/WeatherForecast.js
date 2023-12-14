import React, {useEffect, useState} from "react";
import axios from "axios";
import {weatherAPI} from "../config/APIConfig";

const WeatherForecast = ({apiUrl, id}) => {
    const [data, setData] = useState([]);
    const [date, setDate] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(apiUrl);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    const fetchDate = async () => {
        try {
            const response = await axios.get(weatherAPI.date(id));
            setDate(response.data);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    // Get weather icon
    const getWeatherIcon = (item) => {
        switch (item.weather) {
            case 'Bầu trời quang đãng':
                return <img src="assets/images/weather-icons/sunny.png" alt="sunny" width="50"
                            height="50"/>;

            case 'Mây rải rác':
                return <img src="assets/images/weather-icons/mid_sunshine.png" alt="mild sunshine" width="50"
                            height="50"/>;

            case 'Mây thưa':
                return <img src="assets/images/weather-icons/cloudy.png" alt="cloudy" width="50"
                            height="50"/>;

            case 'Mây cụm':
                return <img src="assets/images/weather-icons/mostly_cloudy.png" alt="mostly cloudy" width="50"
                            height="50"/>;

            case 'Mây đen u ám':
                return <img src="assets/images/weather-icons/mostly_cloudy.png" alt="mostly cloudy" width="50"
                            height="50"/>;

            case 'Mưa vừa':
                return <img src="assets/images/weather-icons/rainy.png" alt="rainy" width="50"
                            height="50"/>;

            case 'Mưa nhẹ':
                return <img src="assets/images/weather-icons/rainy.png" alt="rainy" width="50"
                            height="50"/>;

            case 'Mưa dông':
                return <img src="assets/images/weather-icons/thunderstorm.png" alt="thunderstorm" width="50"
                            height="50"/>;
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

    useEffect(() => {
        if (id) {
            fetchDate(id);
        }
    }, [id]);

    return (
        <div id="weather-forecast" className="container pt-3">
            <div className="row row-cols-5">
                <div className="col-12 col-md-12">
                    {data.map((item) => (
                        <div key={item.id} className="row">
                            {date.map((day, index) => (
                                <>
                                    <div key={index} className="col">
                                        <article className="forecast shadow">
                                            <div className="location-weather">
                                                <div className="card mb-2">
                                                    <a className="info">
                                                        <h3 className="card-city-title">{formatDay(day.next_day_1)}</h3>
                                                        <div className="card-city-body">
                                                            {getWeatherIcon(item)}
                                                        </div>

                                                        <div className="card-city-footer">
                                                            <p title="Hiện tại">{item.t1}&deg;C</p>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    </div>

                                    <div className="col">
                                        <article className="forecast shadow">
                                            <div className="location-weather">
                                                <div className="card mb-2">
                                                    <a className="info">
                                                        <h3 className="card-city-title">{formatDay(day.next_day_2)}</h3>
                                                        <div className="card-city-body">
                                                            {getWeatherIcon(item)}
                                                        </div>

                                                        <div className="card-city-footer">
                                                            <p title="Hiện tại">{item.t2}&deg;C</p>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    </div>

                                    <div className="col">
                                        <article className="forecast shadow">
                                            <div className="location-weather">
                                                <div className="card mb-2">
                                                    <a className="info">
                                                        <h3 className="card-city-title">{formatDay(day.next_day_3)}</h3>
                                                        <div className="card-city-body">
                                                            {getWeatherIcon(item)}
                                                        </div>

                                                        <div className="card-city-footer">
                                                            <p title="Hiện tại">{item.t3}&deg;C</p>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    </div>

                                    <div className="col">
                                        <article className="forecast shadow">
                                            <div className="location-weather">
                                                <div className="card mb-2">
                                                    <a className="info">
                                                        <h3 className="card-city-title">{formatDay(day.next_day_4)}</h3>
                                                        <div className="card-city-body">
                                                            {getWeatherIcon(item)}
                                                        </div>

                                                        <div className="card-city-footer">
                                                            <p title="Hiện tại">{item.t4}&deg;C</p>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    </div>

                                    <div className="col">
                                        <article className="forecast shadow">
                                            <div className="location-weather">
                                                <div className="card mb-2">
                                                    <a className="info">
                                                        <h3 className="card-city-title">{formatDay(day.next_day_5)}</h3>
                                                        <div className="card-city-body">
                                                            {getWeatherIcon(item)}
                                                        </div>

                                                        <div className="card-city-footer">
                                                            <p title="Hiện tại">{item.t5}&deg;C</p>
                                                        </div>
                                                    </a>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                </>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeatherForecast;