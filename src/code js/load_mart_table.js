const mysql = require('mysql2/promise');

async function isDataExists(connection) {
  try {
    const [rows] = await connection.query(`
      SELECT COUNT(*) AS rowCount
      FROM control.log
      WHERE process_id = 4 AND status = 'successful' AND time >= NOW() - INTERVAL 1 HOUR;
    `);

    const rowCount = rows[0].rowCount;
    return rowCount > 0;
  } catch (error) {
    throw error;
  }
}

async function isRunning(connection) {
  try {
    const [rows] = await connection.query(`
      SELECT COUNT(*) AS rowCount
      FROM control.log
      WHERE process_id = 5 AND status = 'start' AND time >= NOW() - INTERVAL 1 HOUR;
    `);

    const rowCount = rows[0].rowCount;
    return rowCount == 0;
  } catch (error) {
    throw error;
  }
}

async function isSuccessful(connection) {
  try {
    const [rows] = await connection.query(`
            SELECT COUNT(*) AS rowSuccessful
            FROM control.log
            WHERE process_id = 5 AND status = 'successful' AND time >= NOW() - INTERVAL 1 HOUR;
        `);

    const rowSuccessful = rows[0].rowSuccessful;
    return rowSuccessful == 0;
  } catch (error) {
    throw error;
  }
}

async function disableForeignKeyChecks(connection) {
  try {
    await connection.query("SET foreign_key_checks = 0");
    console.log("Foreign key checks disabled.");
  } catch (error) {
    throw error;
  }
}

async function enableForeignKeyChecks(connection) {
  try {
    await connection.query("SET foreign_key_checks = 1");
    console.log("Foreign key checks enabled.");
  } catch (error) {
    throw error;
  }
}

async function truncateTableIfExists(tableName, connection) {
  try {
    await disableForeignKeyChecks(connection);

    const [rows] = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
    if (rows.length > 0) {
      await connection.query(`TRUNCATE TABLE ${tableName}`);
      console.log(`${tableName} table truncated.`);
      await enableForeignKeyChecks(connection);
      return {success: true, tableName};
    } else {
      console.log(`${tableName} does not exist. No action taken.`);
      await enableForeignKeyChecks(connection);
      return {success: false, tableName, error: "Table does not exist"};
    }
  } catch (error) {
    console.error(`Error while truncating ${tableName} table:`, error);
    await enableForeignKeyChecks(connection);
    return {success: false, tableName, error: "Failed to truncate table"};
  }
}

async function truncateTables(connection) {
  const results = [];

  try {
    results.push(await truncateTableIfExists("dim_province", connection));
    results.push(await truncateTableIfExists("dim_weather", connection));
    results.push(await truncateTableIfExists("fact_main_table", connection));
  } catch (error) {
    console.error("Error while truncating tables:", error);
  }

  return results;
}

async function connectToDatamart() {
  try {
    const connectionDatamart = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "datamart"
    });

    console.log('Đã kết nối đến cơ sở dữ liệu Datamart');
    return connectionDatamart;
  } catch (error) {
    console.error('Lỗi kết nối đến cơ sở dữ liệu Datamart:', error);
    throw error; // Chuyển tiếp lỗi để báo hiệu rằng kết nối đã thất bại
  }
}

async function connectToDataWarehouse() {
  try {
    const connectionDatawarehouse = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "datawarehouse"
    });

    console.log('Đã kết nối đến cơ sở dữ liệu DataWarehouse');
    return connectionDatawarehouse;
  } catch (error) {
    console.error('Lỗi kết nối đến cơ sở dữ liệu Datawarehouse:', error);
    throw error; // Chuyển tiếp lỗi để báo hiệu rằng kết nối đã thất bại
  }
}

async function insertDataToMart(
    connection,
    sourceTable,
    destinationTable
) {
  let success = false;

  try {
    // Insert data from source table to destination table
    await connection.query(`
      INSERT INTO ${destinationTable} SELECT * FROM ${sourceTable}
    `);

    console.log(
        `Data insert for ${sourceTable} to ${destinationTable} completed successfully.`
    );

    success = true; // Đặt biến success thành true nếu insert thành công
  } catch (error) {
    console.error(
        `Error during data insert from ${sourceTable} to ${destinationTable}:`,
        error
    );
    // Nếu thất bại, không thay đổi giá trị của biến success
  }

  return success;
}

async function main() {
  try {
    // 1. Connect to DB Control
    const connectionControl = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "control"
    });
    // Gọi hàm kiểm tra dữ liệu
    try {
      // Gọi hàm kiểm tra và xử lý kết quả
      const dataExists = await isDataExists(connectionControl);
      const dataRunning = await isRunning(connectionControl);
      const dataSuccessful = await isSuccessful(connectionControl);
      // 2.Check exist in log table has log: process_id: 4, status: successful, in the same hour
      if (dataExists) {
        // 5.Check not exist in log table has log: process_id: 5, status: start in the same hour
        if (dataRunning) {
          // 8.Check not exist in log table has log: process_id: 5, status: successful in the same hour
          if (dataSuccessful) {
            // 11.Insert Table log(control):time:now, process_id:5,status:start
            const queryLog =
                "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
            const process_id = "5";
            const status = "start";
            const valuesLog = [process_id, status];
            connectionControl.query(queryLog, valuesLog, (error, results) => {
              if (error) throw error;
              console.log("Insert log process: 5");
            });
            try {
              // 12. Connect to DB DataMart
              const connectionDatamart = await connectToDatamart();

              console.log("Đã kết nối DB Mart");

              let successMessageDisplayed = false;
              try {
                // 14. Call function to truncate all data in all tables of datamart
                const truncateData = await truncateTables(connectionDatamart);
                // 17. Check result of function truncate
                for (const result of truncateData) {
                  if (result.success) {
                    if (!successMessageDisplayed) {
                      console.log('Xóa thành công');
                      successMessageDisplayed = true;
                      try {
                        // 20. Connect to DB DataWarehouse
                        const connectionDatawarehouse = await connectToDataWarehouse();

                        console.log("Đã kết nối DB Warehouse");
                        try {
                          // 22. Call to run function insert table dim_province, dim_weather, fact_main_table to mart
                          const dimProvinceInsertResult =
                              await insertDataToMart(
                                  connectionDatawarehouse,
                                  "datawarehouse.dim_province",
                                  "datamart.dim_province"
                              );

                          const dimWeatherInsertResult = await insertDataToMart(
                              connectionDatawarehouse,
                              "datawarehouse.dim_weather",
                              "datamart.dim_weather"
                          );

                          const factMainTableInsertResult =
                              await insertDataToMart(
                                  connectionDatawarehouse,
                                  "datawarehouse.fact_main_table",
                                  "datamart.fact_main_table"
                              );
                          // 25. Check result insert table dim_province, dime_weather, fact_main_table
                          if (
                              dimProvinceInsertResult &&
                              dimWeatherInsertResult &&
                              factMainTableInsertResult
                          ) {
                            console.log('Chuyển thành công');
                            // 28.Update Table log(control):time:now, process_id:5,status:successful
                            const queryLogSuccess =
                                "UPDATE control.log SET time = NOW(), status = ? WHERE id = (SELECT id FROM control.log WHERE process_id = 5 AND status = 'start' and time >= NOW() - INTERVAL 1 HOUR)";
                            const status = "successful";
                            const valuesLogSuccess = [status];
                            connectionControl.query(queryLogSuccess, valuesLogSuccess, (error, results) => {
                              if (error) throw error;
                              console.log("Update log process: 5");
                            });
                            // 29. Close connect to DB DataWarehouse, DB DataMart, DB Control
                            await connectionDatawarehouse.end();
                            await connectionDatamart.end();
                            await connectionControl.end();
                          } else {
                            console.log('Chuyển thất bại');
                            // 26.Update Table log(control):time:now, process_id:5,status:failed
                            const queryLogFail =
                                "UPDATE control.log SET time = NOW(), status = ? WHERE id = (SELECT id FROM control.log WHERE process_id = 5 AND status = 'start' and time >= NOW() - INTERVAL 1 HOUR)";
                            const status = "failed";
                            const valuesLogFail = [status];
                            connectionControl.query(queryLogFail, valuesLogFail, (error, results) => {
                              if (error) throw error;
                              console.log("Update log process: 5");
                            });


                            // 27. Close connect to DB DataWarehouse, DB DataMart, DB Control
                            await connectionDatawarehouse.end();
                            await connectionDatamart.end();
                            await connectionControl.end();
                          }

                        } catch (error) {
                          console.error("Error during migration:", error);
                          // 23.Update Table log(control):time:now, process_id:5,status:failed
                          const queryLogFail1 =
                              "UPDATE control.log SET time = NOW(), status = ? WHERE id = (SELECT id FROM control.log WHERE process_id = 5 AND status = 'start' and time >= NOW() - INTERVAL 1 HOUR)";
                          const status = "failed";
                          const valuesLogFail1 = [status];
                          connectionControl.query(queryLogFail1, valuesLogFail1, (error, results) => {
                            if (error) throw error;
                            console.log("Update log process: 5");
                          });
                          // // Đảm bảo đóng kết nối sau khi hoàn thành công việc
                          // 24. Close connect to DB DataWarehouse, DB DataMart, DB Control
                          await connectionDatawarehouse.end();
                          await connectionDatamart.end();
                          await connectionControl.end();
                        }


                        // Đóng kết nối Datamart
                        await connectionDatawarehouse.end();
                      } catch (datawarehouseError) {
                        console.error('Lỗi trong quá trình làm việc với DataWarehouse:', datawarehouseError);
                        // Xử lý lỗi khi kết nối đến Datawarehouse thất bại
                        // 21. Close connect to DB DataMart, DB Control
                        await connectionDatamart.end();
                        await connectionControl.end();
                      }

                    }
                  } else {
                    console.log(`Xóa lỗi cho bảng ${result.tableName}: ${result.error}`);
                    // 18.Update Table log(control):time:now, process_id:5,status:failed
                    const queryLogFail =
                        "UPDATE control.log SET time = NOW(), status = ? WHERE id = (SELECT id FROM control.log WHERE process_id = 5 AND status = 'start' and time >= NOW() - INTERVAL 1 HOUR)";
                    const status = "failed";
                    const valuesLogFail = [status];
                    connectionControl.query(queryLogFail, valuesLogFail, (error, results) => {
                      if (error) throw error;
                      console.log("Update log process: 5");
                    });
                    // 19. Close connect to DB DataMart, DB Control
                    await connectionDatamart.end();
                    await connectionControl.end();
                  }
                }
              } catch (error) {
                console.error("Error during truncation:", error);
                // 15.Update Table log(control):time:now, process_id:5,status:failed
                const queryLogFail =
                    "UPDATE control.log SET time = NOW(), status = ? WHERE id = (SELECT id FROM control.log WHERE process_id = 5 AND status = 'start' and time >= NOW() - INTERVAL 1 HOUR)";
                const status = "failed";
                const valuesLogFail = [status];
                connectionControl.query(queryLogFail, valuesLogFail, (error, results) => {
                  if (error) throw error;
                  console.log("Update log process: 5");
                });
                // 16. Close connect to DB DataMart, DB Control
                await connectionDatamart.end();
                await connectionControl.end();
              }

              // Đóng kết nối Datamart
              await connectionDatamart.end();
            } catch (datamartError) {
              console.error('Lỗi trong quá trình làm việc với Datamart:', datamartError);
              // Xử lý lỗi khi kết nối đến Datamart thất bại
              // 13. Close connect to DB Control
              await connectionControl.end();
            }
          } else {
            console.log('Chương trình load_mart đã thực hiện thành công');
            // 9.Insert Table log(control):time:now, process_id:5,status:failed
            const queryLog =
                "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
            const process_id = "5";
            const status = "failed";
            const valuesLog = [process_id, status];
            connectionControl.query(queryLog, valuesLog, (error, results) => {
              if (error) throw error;
              console.log("Insert log process: 5");
            });
            // 10. Close connect to DB Control
            await connectionControl.end();
          }
        } else {
          console.log('Đang có chương trình load_mart đang chạy');
          // 6.Insert Table log(control):time:now, process_id:5,status:failed
          const queryLog =
              "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
          const process_id = "5";
          const status = "failed";
          const valuesLog = [process_id, status];
          connectionControl.query(queryLog, valuesLog, (error, results) => {
            if (error) throw error;
            console.log("Insert log process: 5");
          });
          // 7. Close connect to DB Control
          await connectionControl.end();
        }
      } else {
        console.log('Chương trình load_main chưa hoàn thành');
        // 3.Insert Table log(control):time:now, process_id:5,status:failed
        const queryLog =
            "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
        const process_id = "5";
        const status = "failed";
        const valuesLog = [process_id, status];
        connectionControl.query(queryLog, valuesLog, (error, results) => {
          if (error) throw error;
          console.log("Insert log process: 5");
        });
        // 4. Close connect to DB Control
        await connectionControl.end();
      }

    } catch (error) {
      console.error('Lỗi trong quá trình kiểm tra dữ liệu:', error);
    }
  } catch (error) {
    console.error('Lỗi trong quá trình kết nối:', error);
  }
}

// Gọi hàm main để bắt đầu quá trình kiểm tra dữ liệu
main();
