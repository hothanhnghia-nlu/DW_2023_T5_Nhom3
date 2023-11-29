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
        const list_url = $('div.item-link a').map(function () {
            return url+$(this).attr('href')+'/7-ngay-toi';
        }).get();

        const promises = list_url.map(href => {
            return axios.get(href)
                .then(response => {
                    const $ = cheerio.load(response.data);

                    const temperature = $('span.current-temperature').text()+'C';
                    const wea = $('span.summary-description-detail:first').text().trim();    
                    const humidity = $('span.text-white.op-8.fw-bold').eq(1).text().replace('%','');
                    const temp_bright_arr = [];
                    const temp1min = $('span.summary-temperature-min').eq(1).text().trim().replace('°','');
                    const temp2min = $('span.summary-temperature-min').eq(2).text().trim().replace('°','');
                    const temp3min = $('span.summary-temperature-min').eq(3).text().trim().replace('°','');
                    const temp4min = $('span.summary-temperature-min').eq(4).text().trim().replace('°','');
                    const temp5min = $('span.summary-temperature-min').eq(5).text().trim().replace('°','');

                    const temp1max = $('span.summary-temperature-max-value').eq(1).text().trim().replace('°','');
                    const temp2max = $('span.summary-temperature-max-value').eq(2).text().trim().replace('°','');
                    const temp3max = $('span.summary-temperature-max-value').eq(3).text().trim().replace('°','');
                    const temp4max = $('span.summary-temperature-max-value').eq(4).text().trim().replace('°','');
                    const temp5max = $('span.summary-temperature-max-value').eq(5).text().trim().replace('°','');

                    const temp1 = Math.round((Number(temp1min)+Number(temp1max))/2);
                    const temp2 = Math.round((Number(temp2min)+Number(temp2max))/2);
                    const temp3 = Math.round((Number(temp3min)+Number(temp3max))/2);
                    const temp4 = Math.round((Number(temp4min)+Number(temp4max))/2);
                    const temp5 = Math.round((Number(temp5min)+Number(temp5max))/2);

                    temp_bright_arr.push(temp1);
                    temp_bright_arr.push(temp2);
                    temp_bright_arr.push(temp3);
                    temp_bright_arr.push(temp4);
                    temp_bright_arr.push(temp5);

                    const data = {
                        province: $('li.breadcrumb-item:nth-child(2) a').text(),
                        temperature: temperature,
                        weather: wea,
                        humidity: humidity,
                        T: temp_bright_arr
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

    const currentTime = `${hours}-thoitietedu`;
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

// Hàm đọc file cấu hình
function readConfigFile(configFilePath) {
    try {
        // Đọc nội dung file cấu hình
        const configFileContent = fs.readFileSync(configFilePath, 'utf8');
        // Parse nội dung file thành đối tượng JSON
        const configData = JSON.parse(configFileContent);
        return configData;
    } catch (error) {
        console.error('Lỗi khi đọc file cấu hình:', error);
        return null;
    }
}

// Hàm chính
async function main() {

    // Đường dẫn tới file cấu hình
    const configFilePath = 'config.json';

    // 1. Read all info from config.json in same folder with file hh-thoitietedu.js
    const configData = readConfigFile(configFilePath);
    if (!configData) {
        console.error('Không thể đọc file cấu hình. Dừng chương trình.');
        return;
    }

    // 2. Connect DB: control
    const connection = mysql.createConnection({
        host: configData.host,
        user: configData.user,
        password: configData.password,
        database: configData.database
    });

    connection.connect((err) => {
        if (err) {
            console.error('Lỗi kết nối MySQL:', err);
            main();
            return;
        }else{
            const querycheckLog = 'SELECT COUNT(id) as count FROM log WHERE status = ? and process != ?'
            var rowCount = 0;
            var status = 'start';
            var process = '1';

            // 3. Check all process haven't status start except process 1
            connection.query(querycheckLog, [status,process], function(err, result) {
                if (err) throw err;
                rowCount = result[0].count;

                if(rowCount!=0){
                    // 4. Close connect DB: control
                    connection.end();
                }else{
                    // 5. Insert Table log(control):time:now, process:2,status:start 
            const queryLog = 'INSERT INTO log VALUES ?';
            var time = new Date();
            var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+ time.getMinutes() + time.getSeconds();
            var process = '2';
            var statuss = 'start';
            const valueLog = [[id,time, process, statuss]];

            connection.query(queryLog, [valueLog], function(err, result) {
                if (err) throw err;
                console.log('Insert log start process 2');
            });

            // 6. Create 2 variable url and folder_data_path and set variable from query: select url, folder_data_path from config where id = 2
            var url = '';
            var folder_data_path = '';

            var sql = "SELECT url, folder_data_path FROM config WHERE id = 2";
            connection.query(sql, function(err, result) {
              if (err) throw err;
              
              // Lấy giá trị url và folder_data_path
              url = result[0].url;
              folder_data_path = result[0].folder_data_path;
              // 7. Create variable data and Read the html source code from https://thoitiet.edu.vn
                //and save to data the values as the file structure sheet at https://docs.google.com/spreadsheets/d/1rhwfdbb1XzzXN7vASu7-i6Ne-WMouGYbEyskzo-7bcs/edit?usp=sharing
                
                var count = 0;
                fetchDataFromWeb(url).then(data => {
                    console.log('Dữ liệu từ web:', data);
                    count++;
                    // 9. n<50
                    if(count>50){
                        // 10. Close connect DB: control
                        connection.end();
                    }else if(data == null){
                        // 8. Update Table log(control): time:now, status: failed
                        var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                        var process = '2';
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
                        // 11. Check folder YY-MM-DD in folder_data_path exist
                        if (!fs.existsSync(folderPath)) {
                            // 12. Create folder YY-MM-DD in folder_data_path
                            fs.mkdirSync(folderPath);
                            console.log('Đã tạo thư mục mới!');
                        } else {
                            console.log('Thư mục đã tồn tại!');
                        }
                        const outputFilePath = path.join(folder, subFolder, FilePath);

                        // 15. n<50
                        for(var i=0;i<50;i++){
                            // 13. Save data in folder YY-MM-DD with name hh-nchmfgov.json
                            var check = saveDataToFile(data, outputFilePath);
                            if(check){
                                // 17. Update Table log(control): time:now, status: successful
                                    var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                    var process = '2';
                                    var staus = 'successful';
                                    var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                    connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                    if (err) throw err;
                                    console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                                    // 18. Close connect DB: control
                                    connection.end();
                                    });
                                break;
                            }else{
                                // 14. Update Table log(control): time:now, status: failed
                                    var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                    var process = '2';
                                    var staus = 'failed';
                                    var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                    connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                    if (err) throw err;
                                    console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                                    // 16. Close connect DB: control
                                    connection.end();
                                    });
                            }
                        }
                        
                    }
              
            });
        })
                }
            });
            
            }
    });
     
}

// Chạy chương trình chính
main();