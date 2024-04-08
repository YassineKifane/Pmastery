
package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.mappers.ChatMapperImpl;
import com.pfa.pmastery.app.mappers.UserMapperImpl;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.services.ChatRoomService;
import com.pfa.pmastery.app.services.UserService;
import com.pfa.pmastery.app.shared.dto.ChatMessageDto;
import com.pfa.pmastery.app.shared.dto.ChatUserDto;
import com.pfa.pmastery.app.shared.dto.UserDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pfa.pmastery.app.entities.ChatMessageEntity;
import com.pfa.pmastery.app.repositories.ChatMessageRepository;
import com.pfa.pmastery.app.services.ChatMessageService;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class ChatMessageServiceImpl implements ChatMessageService{
    @Autowired
    private ChatMessageRepository repository;

    @Autowired
    private ChatRoomService chatRoomService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapperImpl userMapper;

    @Autowired
    private ChatMapperImpl chatMapper;

    public ChatMessageDto save(ChatMessageDto chatMessageDto) {

        ModelMapper modelMapper = new ModelMapper();

        Optional<String> optionalChatId = chatRoomService.getChatRoomId(chatMessageDto.getSender().getUserId(), chatMessageDto.getRecipient().getUserId(), true);

        UserEntity senderEntity = userRepository.findByUserId(chatMessageDto.getSender().getUserId());
        UserEntity recipientEntity = userRepository.findByUserId(chatMessageDto.getRecipient().getUserId());


        ChatMessageEntity chatMessageEntity = chatMapper.fromChatMessageDto(chatMessageDto);

        if (optionalChatId.isPresent()) {
            String chatId = optionalChatId.get();
            chatMessageEntity.setSender(senderEntity);
            chatMessageEntity.setRecipient(recipientEntity);
            chatMessageEntity.setChatId(chatId);

            ChatMessageEntity savedMsg =  repository.save(chatMessageEntity);

            ChatMessageDto savedChatMsgDto =  chatMapper.fromChatMessageEntity(savedMsg);

            System.out.println(savedChatMsgDto.getSender().getFirstName());

            return savedChatMsgDto;
        } else {
            throw new RuntimeException("ChatRoom not found");
        }
    }

    public ChatMessageDto updateNotifiedStatus(Long messageId, boolean isNotified) {
        Optional<ChatMessageEntity> optionalMessage = repository.findById(messageId);

        if (optionalMessage.isPresent()) {
            ChatMessageEntity message = optionalMessage.get();
            message.setNotified(isNotified);
            ChatMessageEntity updatedMessage = repository.save(message);
            return chatMapper.fromChatMessageEntity(updatedMessage);
        } else {
            throw new RuntimeException("Message not found");
        }
    }

    public List<ChatMessageDto> findChatMessages(String senderId, String recipientId) {
        Optional<String> chatIdOptional = chatRoomService.getChatRoomId(senderId, recipientId, false);

        if (chatIdOptional.isPresent()) {
            String chatId = chatIdOptional.get();

            List<ChatMessageEntity> chatMessages = repository.findByChatId(chatId);

            List<ChatMessageDto> chatMessageDtos = new ArrayList<>();

            for (ChatMessageEntity chatMessage : chatMessages) {
                ChatMessageDto chatMessageDto = chatMapper.fromChatMessageEntity(chatMessage);
                chatMessageDtos.add(chatMessageDto);
            }

            return chatMessageDtos;
        } else {
            return Collections.emptyList();
        }
    }


    public List<ChatMessageDto> findMessagesByRecipientAndNotified(String recipientId, boolean isNotified) {
        List<ChatMessageEntity> chatMessages = repository.findByRecipientUserIdAndNotified(recipientId, isNotified);


        List<ChatMessageDto> chatMessageDtos = new ArrayList<>();

        for (ChatMessageEntity chatMessage : chatMessages) {
            ChatMessageDto chatMessageDto = chatMapper.fromChatMessageEntity(chatMessage);
            chatMessageDtos.add(chatMessageDto);
        }

        return chatMessageDtos;
    }

}
