
package com.pfa.pmastery.app.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pfa.pmastery.app.entities.ChatMessageEntity;



public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {
    List<ChatMessageEntity> findByChatId(String chatId);
    List<ChatMessageEntity> findByChatIdAndNotified(String chatId, boolean isNotified);

    List<ChatMessageEntity> findByRecipientUserIdAndNotified(String recipientId, boolean isNotified);
}
