import React, {useEffect, useState} from "react";
import axios from "axios";

const WeatherDetail = () => {
    const [data, setData] = useState([]);
    const id = 2;

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/data/${id}`);
            setData(response.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    return (
        <div id="wrapper" className="col">
            {data.map((item) => (
                <div key={item.id} className="container">
                    <div className="row weather-status">
                        <div id="date" className="row-cols-1">
                            <h3>{item.province}</h3>
                            <h3>{item.day_of_week}</h3>
                        </div>

                        <div id="status">
                            <img src="assets/images/weather-icons/cloudy.png" alt="weather forecast" width="200"
                                 height="200"/>
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