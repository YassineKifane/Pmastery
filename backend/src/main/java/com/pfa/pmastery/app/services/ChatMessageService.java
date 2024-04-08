
package com.pfa.pmastery.app.services;

import java.util.List;

import com.pfa.pmastery.app.entities.ChatMessageEntity;
import com.pfa.pmastery.app.shared.dto.ChatMessageDto;
import com.pfa.pmastery.app.shared.dto.ChatUserDto;

public interface ChatMessageService {

    public ChatMessageDto save(ChatMessageDto chatMessageDto);

    public List<ChatMessageDto> findChatMessages(String senderId, String recipientId);

    ChatMessageDto updateNotifiedStatus(Long messageId, boolean isNotified);

    public List<ChatMessageDto> findMessagesByRecipientAndNotified(String recipientId, boolean isNotified);

}
