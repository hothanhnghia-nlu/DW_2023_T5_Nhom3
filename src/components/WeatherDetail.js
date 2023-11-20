import React from "react";

class WeatherDetail extends React.Component {
    render() {
        return (
            <div id="wrapper" className="col">
                <div className="container">
                    <div className="row weather-status">
                        <div id="date" className="row-cols-1">
                            <h3>Ho Chi Minh</h3>
                            <h3>Thứ hai</h3>
                        </div>

                        <div id="status">
                            <img src="assets/images/weather-icons/cloudy.png" alt="weather forecast" width="200" height="200"/>
                            <p className="text-center">Nhiều mây</p>
                        </div>
                    </div>

                    <div className="row weather-temp">
                        <ul className="col">
                            <li className="row-3">
                                <h3 className="title text-center">Nhiệt độ</h3>
                                <h1 className="value col row">29&deg;
                                    <img src="assets/images/temperature.png" alt="temperature" width="80" height="80"/>
                                </h1>
                            </li>

                            <li className="row-3 weather-humidity">
                                <h3 className="title text-center">Độ ẩm</h3>
                                <h3 className="value humidity">89 %
                                    <img src="assets/images/water.png" alt="temperature" width="40" height="40"/>
                                </h3>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

export default WeatherDetail;