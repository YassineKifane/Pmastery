package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.DemandeDeStageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemandeDeStageRepository extends JpaRepository<DemandeDeStageEntity, Long> {
    DemandeDeStageEntity findByStudentId(String userId);
    List<DemandeDeStageEntity> findByChefFiliereId(String chefFiliereId);
}
