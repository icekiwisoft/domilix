CREATE TABLE `maps_pro_subscriptions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `active` BOOLEAN NOT NULL DEFAULT true,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 5000.00,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `maps_pro_subscriptions_user_id_foreign` (`user_id`),
  CONSTRAINT `maps_pro_subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
