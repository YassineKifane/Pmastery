
package com.pfa.pmastery.app.services.Impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfa.pmastery.app.entities.ChatRoomEntity;
import com.pfa.pmastery.app.repositories.ChatRoomRepository;
import com.pfa.pmastery.app.services.ChatRoomService;


import java.util.Optional;

@Service
public class ChatRoomServiceImpl implements ChatRoomService{

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public Optional<String> getChatRoomId(String senderId, String recipientId, boolean createNewRoomIfNotExists) {
        Optional<String> chatIdOptional = chatRoomRepository
                .findBySenderIdAndRecipientId(senderId, recipientId)
                .map(ChatRoomEntity::getChatId);

        if (chatIdOptional.isPresent()) {
            return chatIdOptional;
        } else {
            if (createNewRoomIfNotExists) {
                String chatId = createChatId(senderId, recipientId);
                return Optional.of(chatId);
            } else {
                return Optional.empty();
            }
        }
    }


    public String createChatId(String senderId, String recipientId) {
        String chatId = String.format("%s_%s", senderId, recipientId);

        ChatRoomEntity senderRecipient = new ChatRoomEntity(chatId, senderId, recipientId);
        ChatRoomEntity recipientSender = new ChatRoomEntity(chatId, recipientId , senderId);

        chatRoomRepository.save(senderRecipient);
        chatRoomRepository.save(recipientSender);

        return chatId;
    }
}

