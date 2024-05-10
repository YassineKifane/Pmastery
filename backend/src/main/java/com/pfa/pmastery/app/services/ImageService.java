package com.pfa.pmastery.app.services;

import com.pfa.pmastery.app.entities.ImageData;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.ImageRepository;
import com.pfa.pmastery.app.shared.ImageUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.persistence.EntityManager;
import java.io.IOException;
import java.util.Optional;

@Service
public class ImageService {
    @Autowired
    private ImageRepository imageRepository;
    @Autowired
    private EntityManager entityManager;

    public String uploadImage(MultipartFile image, UserEntity userEntity) throws IOException {
        ImageData imageData = imageRepository.save(ImageData.builder()
                .name(image.getOriginalFilename())
                .type(image.getOriginalFilename())
                .imageData(ImageUtils.compressImage(image.getBytes()))
                .user(userEntity)
                .build());
        if(imageData != null){
            return "image uploaded successfully";
        }else{
            return null
                    ;
        }
    }


    public byte[] downloadImage(Long idChefFiliere){
        Optional<ImageData> dbImageData= imageRepository.findByUserId(idChefFiliere);
        byte[] images = ImageUtils.decompressImage(dbImageData.get().getImageData());
        return images;

    }
}
