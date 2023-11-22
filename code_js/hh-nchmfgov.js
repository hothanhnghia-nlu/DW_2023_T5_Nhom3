const mysql = require('mysql2');
// Import thư viện axios
const axios = require('axios');
// Import thư viện fs để đọc file
const fs = require('fs');
const cheerio = require('cheerio');
const { title } = require('process');
const readline = require('readline');
const path = require('path');

// Hàm lấy dữ liệu từ web
async function fetchDataFromWeb(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        // Sử dụng cheerio để phân tích mã HTML
        const $ = cheerio.load(html);

        // Lấy nội dung của phần tử có id hoặc class tương ứng
        const list_url = $('a.name-wt-city').map(function () {
            return $(this).attr('href');
        }).get();

        const promises = list_url.map(href => {
            return axios.get(href)
                .then(response => {
                    const $ = cheerio.load(response.data);

                    const temp = $('ul.list-info-wt.uk-list li:nth-child(1) div.uk-width-3-4').text().replace(": ", "");
                    const temperature = temp.substring(0, temp.indexOf(':'));
                    const wea = $('ul.list-info-wt.uk-list li:nth-child(2) div.uk-width-3-4').text().replace(": ", "");
                    const weather = wea.substring(0, wea.indexOf(':'));
                    const hum = $('ul.list-info-wt.uk-list li:nth-child(3) div.uk-width-3-4').text().replace(": ", "");
                    const humidity = hum.substring(0, hum.indexOf(':'));
                    const temp_bright_arr = $('span.large-temp').text().split("C");
                    let temp_bright = temp_bright_arr.map(item => item + "C");
                    temp_bright.pop();
                    temp_bright = temp_bright.slice(0, 5); // Lấy 5 phần tử đầu tiên
                    const data = {
                        province: $('h1.tt-news').text().replace("Thời tiết ", ""),
                        temperature: temperature,
                        weather: weather,
                        humidity: humidity,
                        T: temp_bright
                    }
                    return data;
                })
                .catch(error => {
                    console.log("Yêu cầu không thành công:", error.message);
                    return null;
                });
        });

        const data = await Promise.all(promises);
        return data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ web:', error);
        return null;
    }
}

// Hàm lưu dữ liệu vào file
function saveDataToFile(data, filePath) {
    try {
        // Chuyển đổi dữ liệu thành chuỗi JSON
        const updatedData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, updatedData, 'utf8');
        console.log('Dữ liệu đã được lưu vào file thành công.');
        return true;
    } catch (error) {
        console.error('Lỗi khi lưu dữ liệu vào file:', error);
        return false;
    }
}

// Lấy thời gian hiện tại
function getTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Lưu ý: Tháng trong JavaScript bắt đầu từ 0, nên cần +1 để đúng tháng hiện tại.
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const currentTime = `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    return currentTime;
}

function nameFile() {
    const now = new Date();
    const hours = now.getHours();

    const currentTime = `${hours}-nchmfgov`;
    return currentTime;
}

function nameFolder() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // Lưu ý: Tháng trong JavaScript bắt đầu từ 0, nên cần +1 để đúng tháng hiện tại.
    const day = now.getDate();

    const currentTime = `${day}-${month}-${year}`;
    return currentTime;
}

// Hàm chính
async function main() {

    // Connect DB: control
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'control'
    });

    connection.connect((err) => {
        if (err) {
            console.error('Lỗi kết nối MySQL:', err);
            main();
            return;
        }else{
            // Insert Table log(control):time:now, process:1,status:start 
            const queryLog = 'INSERT INTO log VALUES ?';
            var time = new Date();
            var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+ time.getMinutes() + time.getSeconds();
            var process = '1';
            var statuss = 'start';
            const valueLog = [[id,time, process, statuss]];

            connection.query(queryLog, [valueLog], function(err, result) {
                if (err) throw err;
                console.log('Insert log start process 1');
            });

            // Create 2 variable url and folder_data_path and set variable from query: select url, folder_data_path from config where id = 1
            var url = '';
            var folder_data_path = '';

            var sql = "SELECT url, folder_data_path FROM config WHERE id = 1";
            connection.query(sql, function(err, result) {
              if (err) throw err;
              
              // Lấy giá trị url và folder_data_path
              var url = result[0].url;
              var folder_data_path = result[0].folder_data_path;
              // Create variable data and Read the html source code from https://www.nchmf.gov.vn/kttv/
                //and save to data the values as the file structure sheet at https://docs.google.com/spreadsheets/d/1rhwfdbb1XzzXN7vASu7-i6Ne-WMouGYbEyskzo-7bcs/edit?usp=sharing
                
                var count = 0;
                fetchDataFromWeb(url).then(data => {
                    console.log('Dữ liệu từ web:', data);
                    count++;
                    if(count>50){
                        
                    }else if(data == null){
                        // Update Table log(control): time:now, status: failed
                        var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                        var process = '1';
                        var staus = 'falied';
                        var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;
  
                        connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                        if (err) throw err;
                        console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                        // Close connect DB: control
                        connection.end();
                        });
                    }else{
                        const folder = folder_data_path;
                        const subFolder = `${nameFolder()}`;
                        const FilePath = `${nameFile()}.json`;
                        const folderPath = path.join(folder,subFolder);
                        // Check folder YY-MM-DD in folder_data_path exist
                        if (!fs.existsSync(folderPath)) {
                            // Create folder YY-MM-DD in folder_data_path
                            fs.mkdirSync(folderPath);
                            console.log('Đã tạo thư mục mới!');
                        } else {
                            console.log('Thư mục đã tồn tại!');
                        }
                        const outputFilePath = path.join(folder, subFolder, FilePath);

                        // Save data in folder YY-MM-DD with name hh-nchmfgov.json
                        for(var i=0;i<50;i++){
                            var check = saveDataToFile(data, outputFilePath);
                            if(check){
                                // Update Table log(control): time:now, status: successful
                                    var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                    var process = '1';
                                    var staus = 'successful';
                                    var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                    connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                    if (err) throw err;
                                    console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                                    // Close connect DB: control
                                    connection.end();
                                    });
                                break;
                            }else{
                                // Update Table log(control): time:now, status: failed
                                    var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                    var process = '1';
                                    var staus = 'failed';
                                    var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                    connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                    if (err) throw err;
                                    console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                                    // Close connect DB: control
                                    connection.end();
                                    });
                            }
                        }
                        
                    }
              
            });
        })}
    });
     
}

// Chạy chương trình chính
main();