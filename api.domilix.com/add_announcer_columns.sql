-- Ajouter les colonnes bio et contact à la table announcers
ALTER TABLE `announcers` 
ADD COLUMN `bio` TEXT NULL AFTER `presentation`,
ADD COLUMN `contact` VARCHAR(255) NULL AFTER `bio`;
