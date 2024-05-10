package com.pfa.pmastery.app.controllers;


import com.pfa.pmastery.app.entities.DemandeDeStageEntity;
import com.pfa.pmastery.app.repositories.DemandeDeStageRepository;
import com.pfa.pmastery.app.requests.DemandeDeStageRequest;
import com.pfa.pmastery.app.services.Impl.DemandeDeStageServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/demande")
public class DemandeDeStageController {
    private final DemandeDeStageServiceImpl demandeDeStageServiceImpl;
    @Autowired
    DemandeDeStageRepository demandeDeStageRepository;


    @Autowired
    public DemandeDeStageController(DemandeDeStageServiceImpl demandeDeStageService){
        this.demandeDeStageServiceImpl = demandeDeStageService;
    }

    @PostMapping("/create")
    public ResponseEntity<String> createDemande(@RequestBody DemandeDeStageRequest request) {
        try {
            demandeDeStageServiceImpl.createDemande(request);
            return ResponseEntity.ok("Demande de stage créée avec succès.");
        } catch (Error e) {
            return ResponseEntity.badRequest().body("Erreur lors de la création de la demande de stage: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<DemandeDeStageEntity>> getDemandes(@RequestParam(value = "userId") String userId) {
        List<DemandeDeStageEntity> demandes = demandeDeStageServiceImpl.getDemandes(userId);
        return ResponseEntity.ok(demandes);
    }

    @GetMapping("/hasDemand")
    public ResponseEntity<?> hasDemand(@RequestParam(value = "userId") String userId) {
        try {
            boolean hasDemand = demandeDeStageServiceImpl.hasDemand(userId);
            return ResponseEntity.ok().body(hasDemand);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to check demand status: " + e.getMessage());
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<String> deleteDemande(@PathVariable String userId) {
        try {
            demandeDeStageServiceImpl.deleteDemande(userId);
            return ResponseEntity.ok("Demande de stage supprimée avec succès.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur lors de la suppression de la demande de stage: " + e.getMessage());
        }
    }

}
