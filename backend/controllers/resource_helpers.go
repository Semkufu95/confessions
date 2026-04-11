package controllers

import (
	"github.com/Semkufu95/confessions/Backend/config"
	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func confessionExists(confessionID uuid.UUID) (bool, error) {
	var count int64
	if err := config.DB.Model(&models.Confession{}).Where("id = ?", confessionID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func commentExists(commentID uuid.UUID) (bool, error) {
	var count int64
	if err := config.DB.Model(&models.Comment{}).Where("id = ?", commentID).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func deleteConfessionTree(confessionID uuid.UUID) error {
	return config.DB.Transaction(func(tx *gorm.DB) error {
		commentIDsSubquery := tx.Model(&models.Comment{}).
			Select("id").
			Where("confession_id = ?", confessionID)

		if err := tx.Where("comment_id IN (?)", commentIDsSubquery).Delete(&models.Reaction{}).Error; err != nil {
			return err
		}
		if err := tx.Where("comment_id IN (?)", commentIDsSubquery).Delete(&models.Reply{}).Error; err != nil {
			return err
		}
		if err := tx.Where("confession_id = ?", confessionID).Delete(&models.Comment{}).Error; err != nil {
			return err
		}
		if err := tx.Where("confession_id = ?", confessionID).Delete(&models.Reaction{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&models.Confession{}, "id = ?", confessionID).Error; err != nil {
			return err
		}
		return nil
	})
}

func deleteCommentTree(commentID uuid.UUID) (uuid.UUID, error) {
	var confessionID uuid.UUID

	err := config.DB.Transaction(func(tx *gorm.DB) error {
		var comment models.Comment
		if err := tx.First(&comment, "id = ?", commentID).Error; err != nil {
			return err
		}
		confessionID = comment.ConfessionID

		if err := tx.Where("comment_id = ?", commentID).Delete(&models.Reaction{}).Error; err != nil {
			return err
		}
		if err := tx.Where("comment_id = ?", commentID).Delete(&models.Reply{}).Error; err != nil {
			return err
		}
		if err := tx.Delete(&comment).Error; err != nil {
			return err
		}
		return nil
	})

	return confessionID, err
}
