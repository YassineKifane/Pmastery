package com.pfa.pmastery.app.services;

import com.pfa.pmastery.app.entities.DemandeDeStageEntity;
import com.pfa.pmastery.app.requests.DemandeDeStageRequest;

import java.util.List;

public interface DemandeDeStageService {
    DemandeDeStageEntity createDemande(DemandeDeStageRequest demandeDeStageRequest);
    List<DemandeDeStageEntity> getDemandes(String chefFiliereId);
    boolean hasDemand(String userId);
    void deleteDemande(String userId);
}
