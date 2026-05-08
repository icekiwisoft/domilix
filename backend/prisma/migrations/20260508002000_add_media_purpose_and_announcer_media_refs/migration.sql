ALTER TABLE `media`
  ADD COLUMN `purpose` VARCHAR(50) NOT NULL DEFAULT 'ad_media',
  ADD COLUMN `size` INT NULL,
  ADD COLUMN `original_name` VARCHAR(255) NULL;

ALTER TABLE `announcers`
  ADD COLUMN `avatar_media_id` CHAR(36) NULL,
  ADD COLUMN `presentation_media_id` CHAR(36) NULL;
