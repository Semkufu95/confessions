package controllers

import (
	"time"

	"github.com/Semkufu95/confessions/Backend/models"
	"github.com/google/uuid"
)

type publicUserResponse struct {
	ID        uuid.UUID `json:"id"`
	Username  string    `json:"username"`
	CreatedAt string    `json:"created_at"`
}

type publicReplyResponse struct {
	ID        uuid.UUID          `json:"id"`
	Content   string             `json:"content"`
	Likes     int                `json:"likes"`
	CreatedAt string             `json:"created_at"`
	UpdatedAt string             `json:"updated_at"`
	Author    publicUserResponse `json:"author"`
}

type publicCommentResponse struct {
	ID           uuid.UUID             `json:"id"`
	ConfessionID uuid.UUID             `json:"confession_id"`
	Content      string                `json:"content"`
	Likes        int                   `json:"likes"`
	Boos         int                   `json:"boos"`
	CreatedAt    string                `json:"created_at"`
	UpdatedAt    string                `json:"updated_at"`
	Author       publicUserResponse    `json:"author"`
	Replies      []publicReplyResponse `json:"replies,omitempty"`
}

func formatTimestamp(value time.Time) string {
	if value.IsZero() {
		return ""
	}
	return value.UTC().Format(time.RFC3339)
}

func mapPublicUser(user models.User) publicUserResponse {
	return publicUserResponse{
		ID:        user.ID,
		Username:  user.Username,
		CreatedAt: formatTimestamp(user.CreatedAt),
	}
}

func mapPublicReply(reply models.Reply) publicReplyResponse {
	return publicReplyResponse{
		ID:        reply.ID,
		Content:   reply.Content,
		Likes:     reply.Likes,
		CreatedAt: formatTimestamp(reply.CreatedAt),
		UpdatedAt: formatTimestamp(reply.UpdatedAt),
		Author:    mapPublicUser(reply.Author),
	}
}

func mapPublicComment(comment models.Comment) publicCommentResponse {
	replies := make([]publicReplyResponse, 0, len(comment.Replies))
	for _, reply := range comment.Replies {
		replies = append(replies, mapPublicReply(reply))
	}

	return publicCommentResponse{
		ID:           comment.ID,
		ConfessionID: comment.ConfessionID,
		Content:      comment.Content,
		Likes:        comment.Likes,
		Boos:         comment.Boos,
		CreatedAt:    formatTimestamp(comment.CreatedAt),
		UpdatedAt:    formatTimestamp(comment.UpdatedAt),
		Author:       mapPublicUser(comment.Author),
		Replies:      replies,
	}
}

func mapPublicComments(comments []models.Comment) []publicCommentResponse {
	response := make([]publicCommentResponse, 0, len(comments))
	for _, comment := range comments {
		response = append(response, mapPublicComment(comment))
	}
	return response
}
