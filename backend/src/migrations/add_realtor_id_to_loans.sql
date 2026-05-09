DROP PROCEDURE IF EXISTS _add_col;

DELIMITER //
CREATE PROCEDURE _add_col(IN tbl VARCHAR(100), IN col VARCHAR(100), IN def TEXT)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', def);
        PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
    END IF;
END //
DELIMITER ;

CALL _add_col('loans', 'realtor_id', 'INT DEFAULT NULL');

DROP PROCEDURE IF EXISTS _add_col;
