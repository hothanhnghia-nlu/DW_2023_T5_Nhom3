export const apiUrl = 'http://localhost:5000/api/data';

export const weatherAPI = {
    weather: (id) => `${apiUrl}/${id}`,
    date: (id) => `${apiUrl}/date/${id}`,

}