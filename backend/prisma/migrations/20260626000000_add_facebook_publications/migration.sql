CREATE TABLE `facebook_publications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ad_id` VARCHAR(255) NOT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'draft',
  `message` TEXT NOT NULL,
  `media_ids` JSON NULL,
  `include_videos` BOOLEAN NOT NULL DEFAULT false,
  `facebook_post_id` VARCHAR(255) NULL,
  `facebook_url` VARCHAR(1024) NULL,
  `error` TEXT NULL,
  `published_at` TIMESTAMP(0) NULL,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `facebook_publications_ad_id_idx` (`ad_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
