const mysql = require('mysql2');
// Import thư viện axios
const axios = require('axios');
// Import thư viện fs để đọc file
const fs = require('fs');
const cheerio = require('cheerio');
const { title } = require('process');
const readline = require('readline');
const path = require('path');


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

function nameFile1() {
    const now = new Date();
    const hours = now.getHours();

    const currentTime = `${hours}-nchmfgov`;
    return currentTime;
}

function nameFile2() {
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
            console.error('Lỗi kết nối DB control:', err);
            main();
            return;
        }else{
            const querycheckLog1 = 'SELECT COUNT(id) as count FROM log WHERE status = ?'
            const querycheckLog2 = 'SELECT COUNT(id) as count FROM log WHERE process = ? and status = ? and HOUR(time) = ? and DAYOFMONTH(time) = ? and MONTH(time) = ? and YEAR(time) = ?';
            const querycheckLog3 = 'SELECT COUNT(id) as count FROM log WHERE process = ? and status = ? and HOUR(time) = ? and DAYOFMONTH(time) = ? and MONTH(time) = ? and YEAR(time) = ?';
            
            var rowCount1 = 0;
            var status1 = 'start';

            var rowCount2 = 0;
            var rowCount3 = 0;

            var process1 = '1';
            var process2 = '2';

            const now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth() + 1; // Lưu ý: Tháng trong JavaScript bắt đầu từ 0, nên cần +1 để đúng tháng hiện tại.
            var day = now.getDate();
            var hours = now.getHours();

            var status = 'successful';

            // 3. Check all process haven't status start
            connection.query(querycheckLog1, [status1], function(err, result) {
                if (err) throw err;
                rowCount1 = result[0].count;
                console.log('rowCount1: '+rowCount1);

                if(rowCount1!=0){
                    // 4. Close connect DB: control
                    connection.end();
                }else{
                    // 5. Check process 1 in same hour have status sucessful
                    connection.query(querycheckLog2,[process1,status,hours,day,month,year], function(err, result){
                        if (err) throw err;
                        rowCount2 = result[0].count;
                        console.log('rowCount2: '+rowCount2);
                        
                        if(rowCount2!=1){
                            // 6. Close connect DB: control
                            connection.end();
                        }else{
                            // 7. Check process 2 in same hour have status sucessful
                            connection.query(querycheckLog3,[process2,status,hours,day,month,year], function(err, result){
                                if(err) throw err;
                                rowCount3 = result[0].count;
                                console.log('rowCount3: '+rowCount3);

                                if(rowCount3!=1){
                                    // 8. Close connect DB: control
                                    connection.end();
                                }else{
                                    // 9. Insert Table log(control):time:now, process:3,status:start 
                                    const queryLog = 'INSERT INTO log VALUES ?';
                                    var time = new Date();
                                    var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+ time.getMinutes() + time.getSeconds();
                                    var process = '3';
                                    var statuss = 'start';
                                    const valueLog = [[id,time, process, statuss]];

                                    connection.query(queryLog, [valueLog], function(err, result) {
                                        if (err) throw err;
                                        console.log('Insert log start process 3');
                                    });

                                    // Create 1 variable folder_data_path and set variable from query: select folder_data_path from config where id = 2
                                        var folder_data_path = '';

                                        var sql = "SELECT url, folder_data_path FROM config WHERE id = 2";
                                        connection.query(sql, function(err, result) {
                                        if (err) throw err;
                                        
                                        // Lấy giá trị url và folder_data_path
                                        folder_data_path = result[0].folder_data_path;

                                        // 10. Connect DB: staging
                                    const connection2 = mysql.createConnection({
                                        host: configData.host,
                                        user: configData.user,
                                        password: configData.password,
                                        database: configData.databasestaging
                                    });

                                    connection2.connect((err) =>{
                                        if (err) {
                                            console.error('Lỗi kết nối DB staging:', err);
                                            // 11. Close connect DB: control
                                            connection.end();
                                            return;
                                        }else{
                                            // 12. Write SQL command to delete all data in second table
                                            const querytruncate = 'TRUNCATE TABLE `second-table`';
                                            // 13. Run SQL command
                                            connection2.query(querytruncate,[],function(err, result){
                                                if (err){
                                                    // 14. Update Table log(control): time:now, status: failed
                                                    var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                                    var process = '3';
                                                    var staus = 'failed';
                                                    var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                                    connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                                    if (err) throw err;
                                                    console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                                                    // 15. Close connect DB: control
                                                    connection.end();
                                                    });
                                                }else{
                                                    // 16. Create variable newestFileUrl1, newestFileUrl2
                                                    var newestFileUrl1;
                                                    var newestFileUrl2;

                                                    // 17. Assign value to newestFileUrl1 with path file hh-nchmfgov.json and newestFileUrl2 with path file hh-nchmfgov.json, hh-thoitietedu.json
                                                    const folder = folder_data_path;
                                                    const subFolder = `${nameFolder()}`;
                                                    const FilePath1 = `${nameFile1()}.json`;
                                                    const outputFilePath1 = path.join(folder, subFolder, FilePath1);
                                                    console.log(outputFilePath1);

                                                    const FilePath2 = `${nameFile2()}.json`;
                                                    const outputFilePath2 = path.join(folder, subFolder, FilePath2);
                                                    console.log(outputFilePath2);

                                                    newestFileUrl1 = outputFilePath1;
                                                    newestFileUrl2 = outputFilePath2;

                                                    const jsonData1 = JSON.parse(fs.readFileSync(newestFileUrl1, 'utf8'));
                                                    const jsonData2 = JSON.parse(fs.readFileSync(newestFileUrl2, 'utf8'));

                                                    // 18. Insert json data from file with path: newestFileUrl1 and newestFileUrl2 with corresponding columns in second-table in DB staging
                                                    const query = 'INSERT INTO `second-table` (time, province, temperature, weather, humidity, t1, t2, t3, t4, t5, source) VALUES ?';
                                                    var source1 = 'https://nchmf.gov.vn/kttv/';
                                                    var source2 = 'https://thoitiet.edu.vn';
                                                    const values1 = jsonData1.map(item => [time, item.province, item.temperature, item.weather, item.humidity, item.T[0], item.T[1], item.T[2], item.T[3], item.T[4], source1]);
                                                    const values2 = jsonData2.map(item => [time, item.province, item.temperature, item.weather, item.humidity, item.T[0], item.T[1], item.T[2], item.T[3], item.T[4], source2]);
                                                    var values = values1.map((item, index) => [...item, ...values2[index]]);
      
                                                    connection2.query(query, [values], (err, result) => {
                                                        if (err) {
                                                            console.error('Lỗi thêm dữ liệu:', err);
                                                           // 19. Update Table log(control): time:now, status: failed
                                                           var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                                           var process = '3';
                                                           var staus = 'failed';
                                                           var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                                           connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                                           if (err) throw err;
                                                           })
                                                           // 20. Close connect DB: control, staging
                                                           connection.end();
                                                           connection2.end();
                                                            return;
                                                        }
                                                        console.log(`${result.affectedRows} bản ghi đã được thêm vào cơ sở dữ liệu`);
                                                        
                                                        // 21. Update Table log(control): time:now, status: successful
                                                        var id = ''+ time.getFullYear() + time.getMonth() + time.getDate() + time.getHours()+'%';
                                                        var process = '3';
                                                        var staus = 'successful';
                                                        var sql = `UPDATE log SET time = ?, status = ? WHERE id LIKE ? AND process = ?`;

                                                        connection.query(sql, [new Date(), staus, id, process], function(err, result) {
                                                        if (err) throw err;
                                                        console.log(`Đã cập nhật ${result.affectedRows} hàng`);
                                                        console.log('Record inserted:', result);
                                                        })
                                                        // Close connect DB: control, staging
                                                        connection2.end();
                                                        connection.end();
                                                    });
                                                };
                                            })
                                        }
                                    })
                                })}
                            })
                        }
                    })
                }})

            }
    });
     
}

// Chạy chương trình chính
main();
