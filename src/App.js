import './App.css';
import Header from "./components/Header";
import WeatherDetail from "./components/WeatherDetail";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import WeatherForecast from "./components/WeatherForecast";

function App() {
    return (
        <div>
            <Router>
                <Header/>
                <Routes>
                    <Route exact path='/' element={<WeatherDetail/>}/>
                </Routes>
                <WeatherForecast/>
            </Router>
        </div>
    );
}

export default App;
