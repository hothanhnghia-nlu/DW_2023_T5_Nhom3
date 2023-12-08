-- 1.Connect to DB staging, control, data warehouse
use staging;
use control;
use datawarehouse;

-- Insert Table log(control):time:now, process:4,status:start 
-- INSERT INTO control.log (time, process_id, status)
-- VALUES (NOW(), 3, 'successful');
-- INSERT INTO control.log (time, process_id, status)
-- VALUES (NOW(), 4, 'start'); 

DROP PROCEDURE IF EXISTS CheckAndAct;

DELIMITER //

CREATE PROCEDURE CheckAndAct()
BEGIN
    DECLARE recordCount INT;
		DECLARE runningCount INT;

 SELECT COUNT(*)
INTO recordCount
FROM control.log
WHERE process_id = 3
    AND status = 'successful'
    AND time >= DATE_SUB(NOW(), INTERVAL 1 HOUR);
		
		 SELECT COUNT(*)
INTO runningCount
FROM control.log
WHERE process_id = 4
    AND status = 'start'
    AND time >= DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- 2.Check exist in log table has log: process_id: 3, status: successful, time: now - interval 1 hour
    IF recordCount > 0 AND runningCount = 0 THEN
-- 		3. Insert Table log(control):time:now, process:4,status:start 
		INSERT INTO control.log (time, process_id, status)
VALUES (NOW(), 4, 'start');

		
        DROP TABLE IF EXISTS temp_data_province;
DROP TABLE IF EXISTS temp_data_weather;
DROP TABLE IF EXISTS temp_data_main_table;

-- 5. Create temporary table temp_data_province, temp_data_weather, temp_data_main_table to save data from second-table
CREATE TEMPORARY TABLE IF NOT EXISTS temp_data_province (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    province TEXT
);

CREATE TEMPORARY TABLE IF NOT EXISTS temp_data_weather (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    weather TEXT
);

CREATE TEMPORARY TABLE IF NOT EXISTS temp_data_main_table (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    time DATETIME,
    province_id INT,
    weather_id INT,
    temperature INT,
    humidity INT,
    t1 INT,
    t2 INT,
    t3 INT,
    t4 INT,
    t5 INT
);

-- Lấy giá trị lớn nhất từ bảng dim_province
SET @max_province_id = (SELECT MAX(ID) FROM datawarehouse.dim_province);
SET @sql = CONCAT('ALTER TABLE temp_data_province AUTO_INCREMENT = ', IFNULL(@max_province_id, 0) + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @max_weather_id = (SELECT MAX(ID) FROM datawarehouse.dim_weather);
SET @sql_weather = CONCAT('ALTER TABLE temp_data_weather AUTO_INCREMENT = ', IFNULL(@max_weather_id, 0) + 1);
PREPARE stmt_weather FROM @sql_weather;
EXECUTE stmt_weather;
DEALLOCATE PREPARE stmt_weather;

SET @max_main_table_id = (SELECT MAX(ID) FROM datawarehouse.fact_main_table);
SET @sql_main_table = CONCAT('ALTER TABLE temp_data_main_table AUTO_INCREMENT = ', IFNULL(@max_main_table_id, 0) + 1);
PREPARE stmt_main_table FROM @sql_main_table;
EXECUTE stmt_main_table;
DEALLOCATE PREPARE stmt_main_table;


-- 6.Change data type column, caculate and insert data from second-table to temporary tables
INSERT INTO temp_data_province (province)
SELECT DISTINCT province FROM staging.second_table;

INSERT INTO temp_data_weather (weather)
SELECT DISTINCT weather FROM staging.second_table;

INSERT INTO temp_data_main_table (time, province_id, weather_id, temperature, humidity, t1, t2, t3, t4, t5)
SELECT
    STR_TO_DATE(st.time, '%H:%i:%s %d:%m:%Y'),
    tp.ID AS province_id,
    tw.ID AS weather_id,
    AVG(CAST(st.temperature AS INT)) AS temperature,
    AVG(CAST(st.humidity AS INT)) AS humidity,
    AVG(CAST(st.t1 AS INT)) AS t1,
    AVG(CAST(st.t2 AS INT)) AS t2,
    AVG(CAST(st.t3 AS INT)) AS t3,
    AVG(CAST(st.t4 AS INT)) AS t4,
    AVG(CAST(st.t5 AS INT)) AS t5
FROM
    staging.second_table st
    JOIN temp_data_province tp ON st.province = tp.province
    JOIN temp_data_weather tw ON st.weather = tw.weather
GROUP BY
    st.time,
    tp.ID,
    tw.ID
ON DUPLICATE KEY UPDATE
    temperature = VALUES(temperature),
    humidity = VALUES(humidity),
    t1 = VALUES(t1),
    t2 = VALUES(t2),
    t3 = VALUES(t3),
    t4 = VALUES(t4),
    t5 = VALUES(t5);
		
		
		
-- 7.Inserttemp_data_province, temp_data_weather, temp_data_main_table into to table dim_province, table dim_weather, table fact_main_table 
INSERT INTO datawarehouse.dim_province (ID, province, es_date, ee_date)
SELECT 
		tp.ID,
    tp.province,
    NOW() AS es_date,
    STR_TO_DATE('31-12-9999 23:59:59', '%d-%m-%Y %H:%i:%s') AS ee_date
FROM temp_data_province tp
LEFT JOIN datawarehouse.dim_province dp ON tp.province = dp.province
WHERE dp.ID IS NULL
ORDER BY tp.ID;
-- Làm tương tự cho bảng datawarehouse.dim_weather
INSERT INTO datawarehouse.dim_weather (ID, weather, es_date, ee_date)
SELECT 
		tw.ID,
    tw.weather,
    NOW() AS es_date,
    STR_TO_DATE('31-12-9999 23:59:59', '%d-%m-%Y %H:%i:%s') AS ee_date
FROM temp_data_weather tw
LEFT JOIN datawarehouse.dim_weather dw ON tw.weather = dw.weather
WHERE dw.ID IS NULL
ORDER BY tw.ID;

INSERT INTO datawarehouse.fact_main_table (ID, time, province_id, weather_id, temperature, humidity, t1, t2, t3, t4, t5)
SELECT 
    t1.ID,
    t1.time,
    COALESCE(dp.ID, (SELECT ID FROM datawarehouse.dim_province WHERE province = t2.province)) as province_id,
    COALESCE(dw.ID, (SELECT ID FROM datawarehouse.dim_weather WHERE weather = t3.weather)) as weather_id,
    t1.temperature,
    t1.humidity,
    t1.t1,
    t1.t2,
    t1.t3,
    t1.t4,
    t1.t5
FROM 
    temp_data_main_table t1
    JOIN temp_data_province t2 ON t1.province_id = t2.ID
    JOIN temp_data_weather t3 ON t1.weather_id = t3.ID
    LEFT JOIN datawarehouse.dim_province dp ON t2.province = dp.province
    LEFT JOIN datawarehouse.dim_weather dw ON t3.weather = dw.weather
ORDER BY t1.ID;



-- 8.Insert Table log(control):time:now, process_id: 4, status:successful 
INSERT INTO control.log (time, process_id, status)
VALUES (NOW(), 4, 'successful ');
    ELSE
-- 		4.Insert Table log(control):time:now, process:4,status:failed 
        INSERT INTO control.log (time, process_id, status)
        VALUES (NOW(), 4, 'failed');
    END IF;
END //
DELIMITER ;
CALL CheckAndAct();







