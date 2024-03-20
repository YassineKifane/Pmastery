package com.pfa.pmastery.app.controllers;

import com.pfa.pmastery.app.exceptions.UserException;
import com.pfa.pmastery.app.requests.UserRequest;
import com.pfa.pmastery.app.responses.ErrorMessages;
import com.pfa.pmastery.app.responses.UserResponse;
import com.pfa.pmastery.app.responses.UserResponseWithoutPfe;
import com.pfa.pmastery.app.services.UserService;
import com.pfa.pmastery.app.shared.dto.UserDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.mail.MessagingException;
import javax.validation.Valid;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {


    @Autowired
    UserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> addUser(@RequestParam (value = "role") String role , @RequestBody @Valid UserRequest userRequest) throws MessagingException {

        //Example of Exception handler case
        if(userRequest.getFirstName().isEmpty()) throw new UserException(ErrorMessages.MISSING_REQUIRED_FIELD.getErrorMessage());

        ModelMapper modelMapper = new ModelMapper();

        UserDto userDto = modelMapper.map(userRequest,UserDto.class);

        UserDto addedUser = userService.addUser(role,userDto);

        UserResponse userResponse = modelMapper.map(addedUser,UserResponse.class);

        return new ResponseEntity<>(userResponse, HttpStatus.CREATED);
    }

    @GetMapping
    public String getUser(){
        return "getUser was called";
    }

    @GetMapping(path = "/allUsers")
    public ResponseEntity<List<UserResponse>> getAllUsersByVerificationStatus(@RequestParam(value = "affiliationCode") String affiliationCode,
                                                                              @RequestParam(value = "isVerified") boolean isVerified) {
        List<UserResponse> userResponses = new ArrayList<>();
        List<UserDto> users = userService.getUsersByVerificationStatus(affiliationCode, isVerified);

        for (UserDto userDto : users) {
            ModelMapper modelMapper = new ModelMapper();
            UserResponse user = modelMapper.map(userDto, UserResponse.class);
            userResponses.add(user);
        }

        return new ResponseEntity<List<UserResponse>>(userResponses, HttpStatus.OK);
    }

    @GetMapping(path="/nbRequests")
    public int getNumberOfRequests(@RequestParam (value = "affiliationCode") String affiliationCode){
        List<UserDto> users = userService.getUsersByVerificationStatus(affiliationCode,false);
        return users.size();
    }

    @GetMapping(path="/pfe/{pfeId}")
    public ResponseEntity<List<UserResponseWithoutPfe>> getUsersByPfeId(@PathVariable String pfeId,
                                                           @RequestParam(value="role") String role){
        List<UserResponseWithoutPfe> userResponses = new ArrayList<>();
        List<UserDto> users = userService.getUsersByPfeIdAndRole(pfeId,role);

        for(UserDto userDto : users) {

            ModelMapper modelMapper = new ModelMapper();
            UserResponseWithoutPfe userResponse = modelMapper.map(userDto, UserResponseWithoutPfe.class);
            userResponses.add(userResponse);
        }

        return new ResponseEntity<List<UserResponseWithoutPfe>>(userResponses, HttpStatus.OK);
    }

    @GetMapping(path="/announcementMsg")
    public ResponseEntity<String> getAnnouncementMsg(@RequestParam(value="userId") String userId){
        String announcementMsg=userService.getAnnouncementMsg(userId);
        return new ResponseEntity<String>(announcementMsg, HttpStatus.OK);
    }

    @PutMapping(path="/{userId}")
    public ResponseEntity<UserResponseWithoutPfe> updateUser(@PathVariable String userId, @RequestBody UserRequest userRequest){

        ModelMapper modelMapper = new ModelMapper();
        UserDto userDto = modelMapper.map(userRequest , UserDto.class);

        UserDto updatedUser = userService.updateUser(userId , userDto);

        UserResponseWithoutPfe userResponse=modelMapper.map(updatedUser , UserResponseWithoutPfe.class);

        return new ResponseEntity<UserResponseWithoutPfe>(userResponse , HttpStatus.ACCEPTED);
    }

    @PutMapping(path="/selectPfe/{userId}")
    public ResponseEntity<Object> selectPfe(@PathVariable String userId, @RequestParam List<String> pfeId){

        userService.selectPfe(userId,pfeId);

        return new ResponseEntity<>(HttpStatus.ACCEPTED);
    }

    @PutMapping(path = "/accept/{userId}")
    public ResponseEntity<Object> acceptRequest(@PathVariable String userId){
        userService.acceptRequest(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping(path = "/confirmEmail")
    public ModelAndView confirmEmail(@RequestParam("token")String confirmationToken){
        userService.confirmEmail(confirmationToken);

        ModelAndView modelAndView = new ModelAndView("redirect:http://localhost:3000");

        return modelAndView;
    }

    @PutMapping(path="/forgotPassword")
    public ResponseEntity<Object> forgotPassword(@RequestParam("email") String email){
        userService.forgotPassword(email);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping(path="/resetPassword")
    public ResponseEntity<Object> resetPassword(@RequestParam("token")String confirmationToken,
                                                @RequestBody String newPasword){
        userService.resetPassword(confirmationToken,newPasword);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping(path="/addAnnouncement")
    public ResponseEntity<UserResponseWithoutPfe> addAnnouncement(@RequestParam String affiliationCode,
                                                        @RequestParam List<String> roles,
                                                        @RequestParam String announcementMsg){
        ModelMapper modelMapper = new ModelMapper();
        //List<UserResponseWithoutPfe> userResponse = new ArrayList<>();

        UserDto userWithAnoncementMsg=userService.addAnnouncementMsg(affiliationCode,roles,announcementMsg);
//        for (int i=0;i<userWithAnoncementMsg.size();i++){
//            UserResponseWithoutPfe user=modelMapper.map(userWithAnoncementMsg.get(i) , UserResponseWithoutPfe.class);
//            userResponse.add(user);
//        }

        UserResponseWithoutPfe userResponse = modelMapper.map(userWithAnoncementMsg,UserResponseWithoutPfe.class);

        return new ResponseEntity<UserResponseWithoutPfe>(userResponse , HttpStatus.ACCEPTED);
    }

    @DeleteMapping(path="/{userId}")
    public ResponseEntity<Object> deleteUser(@PathVariable String userId){
        userService.deleteUser(userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
