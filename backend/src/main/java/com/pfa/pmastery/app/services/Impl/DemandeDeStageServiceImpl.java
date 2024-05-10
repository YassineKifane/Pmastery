package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.DemandeDeStageEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.DemandeDeStageRepository;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.requests.DemandeDeStageRequest;
import com.pfa.pmastery.app.services.DemandeDeStageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DemandeDeStageServiceImpl implements DemandeDeStageService {
    private final DemandeDeStageRepository demandeDeStageRepository;
    private final UserRepository userRepository;

    @Autowired
    public DemandeDeStageServiceImpl(DemandeDeStageRepository demandeDeStageRepository, UserRepository userRepository){
        this.demandeDeStageRepository = demandeDeStageRepository;
        this.userRepository = userRepository;
    }


    @Override
    public DemandeDeStageEntity createDemande(DemandeDeStageRequest request) {
        UserEntity chefFiliere = userRepository.findByAffiliationCodeAndRole(request.getAffiliationCode(), "ADMIN");

        if(chefFiliere != null){
            DemandeDeStageEntity demande = new DemandeDeStageEntity();
            demande.setChefFiliereId(chefFiliere.getUserId());
            demande.setStudentId(request.getStudentId());
            DemandeDeStageEntity savedDemande = demandeDeStageRepository.save(demande);
            return savedDemande;
        } else {
            throw new Error("Chef de filière non trouvé");
        }
    }
    @Override
    public List<DemandeDeStageEntity> getDemandes(String chefFiliereId) {
        List<DemandeDeStageEntity> demandes = demandeDeStageRepository.findByChefFiliereId(chefFiliereId);
        return demandes;
    }


    @Override
    public boolean hasDemand(String userId) {
        DemandeDeStageEntity demand = demandeDeStageRepository.findByStudentId(userId);
        return demand != null;
    }

    @Override
    public void deleteDemande(String userId) {
        DemandeDeStageEntity demandeId = demandeDeStageRepository.findByStudentId(userId);
        demandeDeStageRepository.deleteById(demandeId.getId());
    }
}
