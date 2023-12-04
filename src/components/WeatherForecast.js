import React, {useEffect, useState} from "react";
import axios from "axios";

const WeatherForecast = () => {
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
        <div id="weather-forecast" className="container pt-3">
            <div className="row row-cols-5">
                <div className="col-12 col-md-12">
                    {data.map((item) => (
                        <div key={item.id} className="row">
                            <div className="col">
                                <article className="forecast shadow">
                                    <div className="location-weather">
                                        <div className="card mb-3">
                                            <a className="info" href="/">
                                                <h3 className="card-city-title">{item.day_of_week}</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/rainy.png" alt="rainy"
                                                         title="Rainy"
                                                         width="50"
                                                         height="50"/>
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
                                        <div className="card mb-3">
                                            <a className="info" href="/">
                                                <h3 className="card-city-title">{item.day_of_week}</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/rainy.png" alt="rainy"
                                                         title="Rainy"
                                                         width="50"
                                                         height="50"/>
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
                                        <div className="card mb-3">
                                            <a className="info" href="/">
                                                <h3 className="card-city-title">{item.day_of_week}</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/rainy.png" alt="rainy"
                                                         title="Rainy"
                                                         width="50"
                                                         height="50"/>
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
                                        <div className="card mb-3">
                                            <a className="info" href="/">
                                                <h3 className="card-city-title">{item.day_of_week}</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/rainy.png" alt="rainy"
                                                         title="Rainy"
                                                         width="50"
                                                         height="50"/>
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
                                        <div className="card mb-3">
                                            <a className="info" href="/">
                                                <h3 className="card-city-title">{item.day_of_week}</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/rainy.png" alt="rainy"
                                                         title="Rainy"
                                                         width="50"
                                                         height="50"/>
                                                </div>

                                                <div className="card-city-footer">
                                                    <p title="Hiện tại">{item.t5}&deg;C</p>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default WeatherForecast;