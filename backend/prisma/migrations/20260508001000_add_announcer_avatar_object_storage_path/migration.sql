ALTER TABLE `announcers`
  ADD COLUMN `avatar_bucket` VARCHAR(255) NULL,
  ADD COLUMN `avatar_path` VARCHAR(1024) NULL;
