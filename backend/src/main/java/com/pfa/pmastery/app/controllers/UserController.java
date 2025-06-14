package com.pfa.pmastery.app.controllers;


import com.pfa.pmastery.app.exceptions.UserException;
import com.pfa.pmastery.app.repositories.ImageRepository;
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
import java.util.Set;
import java.util.HashSet;


@RestController
@RequestMapping("/user")
public class UserController {




    @Autowired
    UserService userService;

    @Autowired
    ImageRepository imageRepository;

    @PostMapping
    public ResponseEntity<UserResponse> addUser(@RequestParam (value = "role") String role , @RequestBody @Valid UserRequest userRequest) throws MessagingException, IOException, IOException {
        if(userRequest.getFirstName().isEmpty()) throw new UserException(ErrorMessages.MISSING_REQUIRED_FIELD.getErrorMessage());
        ModelMapper modelMapper = new ModelMapper();
        UserDto userDto = modelMapper.map(userRequest,UserDto.class);
        UserDto addedUser = userService.addUser(role, userDto);
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

        ModelAndView modelAndView = new ModelAndView("redirect:http://77.37.124.70:3001/");

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

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable String userId, @RequestParam String role) {
        try {
            userService.deleteUser(userId, role);
            return ResponseEntity.ok("Utilisateur supprimé avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression de l'utilisateur: " + e.getMessage());
        }
    }


    @GetMapping("/studentsWithPfe")
    public ResponseEntity<List<UserDto>> getStudentsWithPfe(@RequestParam String affiliationCode) {
        List<UserDto> studentsWithPfe = userService.getStudentWithPfe(affiliationCode);
        return new ResponseEntity<>(studentsWithPfe, HttpStatus.OK);
    }

    @GetMapping(path = "/usersWithCurrentPfeAndApproved")
    public ResponseEntity<List<UserResponse>> supervisorWithCurrentPfeAndApproved(@RequestParam("year") int year,
                                                                                  @RequestParam("affiliationCode") String affiliationCode,
                                                                                  @RequestParam("role") String role){

        Set<String> userIds = new HashSet<>();
        List<UserResponse> userResponses = new ArrayList<>();
        List<UserDto> supervisorlist = userService.userWithCurrentPfeAndApproved(role,affiliationCode ,year);

        for (UserDto userDto : supervisorlist) {
            if (!userIds.contains(userDto.getUserId())) {
                ModelMapper modelMapper = new ModelMapper();
                UserResponse user = modelMapper.map(userDto, UserResponse.class);
                userResponses.add(user);
                userIds.add(userDto.getUserId());
            }
        }

        return new ResponseEntity<List<UserResponse>>(userResponses, HttpStatus.OK);
    }


}
