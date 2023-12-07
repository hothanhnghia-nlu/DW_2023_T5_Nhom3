import './App.css';
import Header from "./components/Header";
import WeatherDetail from "./components/WeatherDetail";
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import WeatherForecast from "./components/WeatherForecast";

function App() {
    const id = 2;

    return (
        <div>
            <Router>
                <Header/>
                <Routes>
                    <Route exact path='/' element={<WeatherDetail id={id}/>}/>
                </Routes>
                <WeatherForecast id={id}/>
            </Router>
        </div>
    );
}

export default App;
