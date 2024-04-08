
package com.pfa.pmastery.app.mappers;

import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.shared.dto.ChatUserDto;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
public class UserMapperImpl {

    public ChatUserDto fromUserEntity(UserEntity userEntity){
        ChatUserDto chatUserDto = new ChatUserDto();
        BeanUtils.copyProperties(userEntity, chatUserDto);
        return chatUserDto;
    }

    public UserEntity fromUserDto(ChatUserDto chatUserDto){
        UserEntity userEntity = new UserEntity();
        BeanUtils.copyProperties(chatUserDto,userEntity);
        return  userEntity;
    }


}
