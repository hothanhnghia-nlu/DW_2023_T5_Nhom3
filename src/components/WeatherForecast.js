import React from "react";

class WeatherForecast extends React.Component {
    render() {
        return (
            <div id="weather-forecast" className="container pt-3">
                <div className="row row-cols-5">
                    <div className="col-12 col-md-12">
                        <div className="row">
                            <div className="col">
                                <article className="forecast shadow">
                                    <div className="location-weather">
                                        <div className="card mb-3">
                                            <a className="info" href="/">
                                                <h3 className="card-city-title">Thứ ba</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/rainy.png" alt="rainy" title="Rainy"
                                                         width="50"
                                                         height="50"/>
                                                </div>
                                                
                                                <div className="card-city-footer">
                                                    <p title="Hiện tại">28&deg;C</p>
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
                                                <h3 className="card-city-title">Thứ tư</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/sunny.png" alt="rainy" title="Rainy"
                                                         width="50"
                                                         height="50"/>
                                                </div>
                                                
                                                <div className="card-city-footer">
                                                    <p title="Hiện tại">31&deg;C</p>
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
                                                <h3 className="card-city-title">Thứ năm</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/mostly_cloudy.png" alt="rainy" title="Rainy"
                                                         width="50"
                                                         height="50"/>
                                                </div>
                                                
                                                <div className="card-city-footer">
                                                    <p title="Hiện tại">27&deg;C</p>
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
                                                <h3 className="card-city-title">Thứ sáu</h3>
                                                <div className="card-city-body">
                                                    <img src="assets/images/weather-icons/sunny.png" alt="rainy" title="Rainy"
                                                         width="50"
                                                         height="50"/>
                                                </div>
                                                
                                                <div className="card-city-footer">
                                                    <p title="Hiện tại">31&deg;C</p>
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
                                                <h3 className="card-city-title">Thứ bảy</h3>
                                                <div class="card-city-body">
                                                    <img src="assets/images/weather-icons/thunderstorm.png" alt="rainy" title="Rainy"
                                                         width="50"
                                                         height="50"/>
                                                </div>
                                                
                                                <div class="card-city-footer">
                                                    <p title="Hiện tại">30&deg;C</p>
                                                </div>
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default WeatherForecast;