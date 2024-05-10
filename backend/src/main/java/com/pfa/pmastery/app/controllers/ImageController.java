package com.pfa.pmastery.app.controllers;

import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.services.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/image")
public class ImageController {
    @Autowired
    ImageService imageService;
    @Autowired
    UserRepository userRepository;


    @PostMapping
    public ResponseEntity<?> uploadImage( @RequestParam("image") MultipartFile image,
                                          @RequestParam(value = "userId") String userId) throws IOException {
        UserEntity userEntity = userRepository.findByUserId(userId);
        if (userEntity == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found for userId: " + userId);
        }
        String uploadImage = imageService.uploadImage(image, userEntity);
        return ResponseEntity.status(HttpStatus.OK).body(uploadImage);
    }

    @GetMapping
    public ResponseEntity<?> downloadImage(String affiliationCode){
        UserEntity chefFiliere = userRepository.findByAffiliationCodeAndRole(affiliationCode, "ADMIN");
        byte[]  imageData =imageService.downloadImage(chefFiliere.getId());
        return ResponseEntity.status(HttpStatus.OK).contentType(MediaType.valueOf("image/png"))
                .body(imageData);

    }
}
