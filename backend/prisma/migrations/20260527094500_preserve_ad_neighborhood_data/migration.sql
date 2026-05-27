SET @has_neighborhood = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ads'
    AND COLUMN_NAME = 'neighborhood'
);

SET @has_neighbourhood = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ads'
    AND COLUMN_NAME = 'neighbourhood'
);

SET @sql = CASE
  WHEN @has_neighborhood > 0 AND @has_neighbourhood = 0 THEN
    'ALTER TABLE `ads` RENAME COLUMN `neighborhood` TO `neighbourhood`'
  WHEN @has_neighborhood = 0 AND @has_neighbourhood = 0 THEN
    'ALTER TABLE `ads` ADD COLUMN `neighbourhood` VARCHAR(255) NOT NULL DEFAULT '''' AFTER `city`'
  WHEN @has_neighborhood > 0 AND @has_neighbourhood > 0 THEN
    'UPDATE `ads` SET `neighbourhood` = `neighborhood` WHERE (`neighbourhood` IS NULL OR `neighbourhood` = '''') AND `neighborhood` IS NOT NULL AND `neighborhood` <> '''''
  ELSE
    'SELECT 1'
END;

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_neighborhood = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ads'
    AND COLUMN_NAME = 'neighborhood'
);

SET @has_neighbourhood = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'ads'
    AND COLUMN_NAME = 'neighbourhood'
);

SET @sql = IF(
  @has_neighborhood > 0 AND @has_neighbourhood > 0,
  'ALTER TABLE `ads` DROP COLUMN `neighborhood`',
  'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
