
package com.pfa.pmastery.app.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pfa.pmastery.app.entities.ChatRoomEntity;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoomEntity, Long> {
    Optional<ChatRoomEntity> findBySenderIdAndRecipientId(String senderId, String recipientId);
}
