const mysql = require("mysql2/promise");

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
  let retryCount = 0;
  const maxRetries = 50;

  while (retryCount < maxRetries) {
    try {
      await disableForeignKeyChecks(connection);

      const [rows] = await connection.query(`SHOW TABLES LIKE '${tableName}'`);
      if (rows.length > 0) {
        await connection.query(`TRUNCATE TABLE ${tableName}`);
        console.log(`${tableName} table truncated.`);
        await enableForeignKeyChecks(connection);
        return { success: true, tableName };
      } else {
        console.log(`${tableName} does not exist. No action taken.`);
        await enableForeignKeyChecks(connection);
        return { success: false, tableName, error: "Table does not exist" };
      }
    } catch (error) {
      console.error(`Error while truncating ${tableName} table:`, error);
      retryCount++;
      if (retryCount === maxRetries) {
        console.error(
          `Failed to truncate ${tableName} table after ${maxRetries} retries.`
        );
        return { success: false, tableName, error: "Max retries exceeded" };
      }
    }
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


async function migrateData(
  connectionDataWarehouse,
  sourceTable,
  destinationTable
) {
  let retryCount = 0;
  const maxRetries = 50;
  // 15. ReInsertDataToMart if fail
  while (retryCount < maxRetries) {
    try {
      // Insert data from source table to destination table
      await connectionDataWarehouse.query(`
        INSERT INTO ${destinationTable} SELECT * FROM ${sourceTable}
      `);

      console.log(
        `Data migration for ${sourceTable} to ${destinationTable} completed successfully.`
      );
      return true; // Trả về true nếu insert thành công
    } catch (error) {
      console.error(
        `Error during data migration from ${sourceTable} to ${destinationTable}:`,
        error
      );
      retryCount++;
      // 16. Check maxRetries  = 50
      if (retryCount === maxRetries) {
        console.error(
          `Failed to migrate data from ${sourceTable} to ${destinationTable} after ${maxRetries} retries.`
        );
        throw error; // Nếu đã thử đủ số lần, ném lỗi
      }
    }
  }
  // 17. Return false
  return false; // Trả về false nếu không thành công sau số lần retry quy định
}


async function main() {
  try {
    // 1. Connect to DB Control
    const connectionControl = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "control",
    });

    console.log('Đã kết nối đến MySQL "control"!');

    // Gọi hàm kiểm tra và xử lý kết quả
    const dataExists = await isDataExists(connectionControl);
    const dataRunning = await isRunning(connectionControl);
    // 2.Check exist in log table has log: process_id: 4, status: successful, time: now - interval 1 hour 
    // and not exist process_id: 5, status: start time: now - interval 1 hour
    if (dataExists && dataRunning) {
      console.log("Dữ liệu tồn tại.");
      // 5.Insert Table log(control):time:now, process_id:5,status:start
      const queryLog =
        "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
      var process_id = "5";
      var status = "start";
      const valuesLog = [process_id, status];
      connectionControl.query(queryLog, valuesLog, (error, results) => {
        if (error) throw error;
        console.log("Insert log process: 5");
      });

      // 6. Connect to DB DataMart
      const connectionDataMart = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "datamart",
      });

      console.log('Đã kết nối đến MySQL "datamart"!');
      let successMessageDisplayed = false;
    

      try {
        // 8. Call function to truncate all data in all tables of datamart
        const truncateData = await truncateTables(connectionDataMart);

        // 9. Run function truncate
        truncateData.forEach(async (result) => {
          if (result.success) {
            if (!successMessageDisplayed) {
              console.log(`Xóa thành công`);
              successMessageDisplayed = true;

              // 12. Connect to DB DataWarehouse
              const connectionDataWarehouse = await mysql.createConnection({
                host: "localhost",
                user: "root",
                password: "",
                database: "datawarehouse",
              });
              try {
                // 14. Run function table dim_province, dime_weather, fact_main_table to mart
                const dimProvinceMigrationResult = await migrateData(
                  connectionDataWarehouse,
                  "datawarehouse.dim_province",
                  "datamart.dim_province"
                );

                const dimWeatherMigrationResult = await migrateData(
                  connectionDataWarehouse,
                  "datawarehouse.dim_weather",
                  "datamart.dim_weather"
                );

                const factMainTableMigrationResult = await migrateData(
                  connectionDataWarehouse,
                  "datawarehouse.fact_main_table",
                  "datamart.fact_main_table"
                );

                // 18. Check insert table dim_province, dime_weather, fact_main_table are true
                if (
                  dimProvinceMigrationResult &&
                  dimWeatherMigrationResult &&
                  factMainTableMigrationResult
                ) {
                  console.log("Dữ liệu chuyển đổi thành công.");
                  // 21.Insert Table log(control):time:now, process_id:5,status:successful
                  var process_id1 = "5";
                  var status1 = "successful";
                  const valuesLog1 = [process_id1, status1];
                  connectionControl.query(
                    queryLog,
                    valuesLog1,
                    (error, results) => {
                      if (error) {
                        console.error("Error inserting log process: 5", error);
                      } else {
                        console.log("Insert log process: 5");
                      }
                    }
                  );
                  // 22. Close connect to DB Control, DB DataMart, DB DataWarehouse
                  connectionDataWarehouse.end();
                  console.log("đã đóng connectionDataWarehouse");
                  connectionDataMart.end();
                  console.log("đã đóng connectionDataMart");
                  connectionControl.end();
                  console.log("đã đóng connectionControl");
                } else {
                  console.log("Dữ liệu chuyển đổi thất bại.");
                  // 19.Insert Table log(control):time:now, process_id:5,status:failed 
                  var process_id1 = "5";
                  var status1 = "failed";
                  const valuesLog1 = [process_id1, status1];
                  connectionControl.query(
                    queryLog,
                    valuesLog1,
                    (error, results) => {
                      if (error) {
                        console.error("Error inserting log process: 5", error);
                      } else {
                        console.log("Insert log process: 5");
                      }

                      
                    }
                  );
                  // 20. Close connect to DB Control, DB DataMart, DB DataWarehouse
                  connectionDataWarehouse.end();
                  console.log("đã đóng connectionDataWarehouse");
                  connectionDataMart.end();
                  console.log("đã đóng connectionDataMart");
                  connectionControl.end();
                  console.log("đã đóng connectionControl");
                }
              } catch (error) {
                console.error("Error during migration:", error);

                const queryLog =
                  "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
                var process_id = "5";
                var status = "failed";
                const valuesLog = [process_id, status];
                connectionControl.query(
                  queryLog,
                  valuesLog,
                  (error, results) => {
                    if (error) {
                      console.error("Error inserting log process: 5", error);
                    } else {
                      console.log("Insert log process: 5");
                    }
                  }
                );
                // Đảm bảo đóng kết nối sau khi hoàn thành công việc
                connectionDataWarehouse.end();
                console.log("đã đóng connectionDataWarehouse");
                connectionDataMart.end();
                console.log("đã đóng connectionDataMart");
                connectionControl.end();
                console.log("đã đóng connectionControl");
              } 
            }
          } else {
            // Truncate failed

            // 10.Insert Table log(control):time:now, process_id:5,status:failed 
            const queryLog =
              "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
            var process_id = "5";
            var status = "failed";
            const valuesLog = [process_id, status];
            connectionControl.query(queryLog, valuesLog, (error, results) => {
              if (error) throw err;
              console.log("Insert log process: 5");
            });

            // 11. Close connect to DB Control, DB DataMart
            connectionDataMart.end();
            console.log("đã đóng connectionDataMart");
            connectionControl.end();
            console.log("đã đóng connectionControl");
            
          }
        });
      } catch (error) {
        console.error("Error during truncation:", error);
      } 
    

      // Đóng kết nối sau khi hoàn thành công việc
      // connectionControl.end();
    } else {
      console.log("Dữ liệu không tồn tại.");
      // 3.Insert Table log(control):time:now, process_id:5,status:failed 
      const queryLog =
        "INSERT INTO control.log (time, process_id, status) VALUES (NOW(), ?, ?)";
      var process_id = "5";
      var status = "failed";
      const valuesLog = [process_id, status];
      connectionControl.query(queryLog, valuesLog, (error, results) => {
        if (error) {
          console.error("Error inserting log process: 5", error);
        } else {
          console.log("Insert log process: 5");
        }
        
      });
      // 4. Close connect to DB Control
      connectionControl.end();
    }
  } catch (error) {
    console.error("Lỗi chung:", error);
  }
}

// Gọi hàm main để bắt đầu quá trình
main();