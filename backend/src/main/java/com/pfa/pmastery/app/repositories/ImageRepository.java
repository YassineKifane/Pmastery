package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.ImageData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ImageRepository extends JpaRepository<ImageData, Long> {
    Optional<ImageData> findByUserId(Long idChefFiliere);
}
