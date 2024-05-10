
package com.pfa.pmastery.app.mappers;

import com.pfa.pmastery.app.entities.ChatMessageEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.shared.dto.ChatMessageDto;
import com.pfa.pmastery.app.shared.dto.ChatUserDto;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class ChatMapperImpl {
    public ChatMessageDto fromChatMessageEntity(ChatMessageEntity chatMessageEntity){
        ChatMessageDto chatMessageDto = new ChatMessageDto();
        BeanUtils.copyProperties(chatMessageEntity, chatMessageDto);

        chatMessageDto.setSender(mapToChatUserDto(chatMessageEntity.getSender()));
        chatMessageDto.setRecipient(mapToChatUserDto(chatMessageEntity.getRecipient()));

        return chatMessageDto;
    }

    public ChatMessageEntity fromChatMessageDto(ChatMessageDto chatMessageDto){
        ChatMessageEntity chatMessageEntity = new ChatMessageEntity();
        BeanUtils.copyProperties(chatMessageDto,chatMessageEntity);

        chatMessageEntity.setSender(mapToChatUserEntity(chatMessageDto.getSender()));
        chatMessageEntity.setRecipient(mapToChatUserEntity(chatMessageDto.getRecipient()));

        return chatMessageEntity;
    }

    private ChatUserDto mapToChatUserDto(UserEntity userEntity) {
        ChatUserDto chatUserDto = new ChatUserDto();
        BeanUtils.copyProperties(userEntity, chatUserDto);
        return chatUserDto;
    }

    private UserEntity mapToChatUserEntity(ChatUserDto chatUserDto) {
        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(chatUserDto, userEntity);
        return userEntity;
    }
}
