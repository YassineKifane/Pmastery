package com.pfa.pmastery.app.services;

import com.pfa.pmastery.app.shared.dto.UserDto;
import org.springframework.security.core.userdetails.UserDetailsService;

import javax.mail.MessagingException;
import java.util.List;

public interface UserService extends UserDetailsService {

    UserDto addUser(String role , UserDto userDto) throws MessagingException;
    UserDto getUser(String email);
    UserDto getUserByEmailAndPassword(String email,String password);
    List<UserDto> getUsersByPfeIdAndRole(String pfeId , String role);
    List<UserDto> getUsersByVerificationStatus(String affiliationCode, boolean isVerified);
    UserDto updateUser(String userId , UserDto userDto);
    void selectPfe(String userId , List<String> pfeId);
    UserDto addAnnouncementMsg(String affiliationCode,List<String> roles,String announcementMsg);
    String getAnnouncementMsg(String userId);
    void acceptRequest(String userId);

    void sendAcceptanceEmail(String userEmail, String userName);

    void confirmEmail(String confirmationToken);
    void forgotPassword(String email);
    void resetPassword(String confirmationToken,String newPassword);
    void deleteUser(String userId);
}
