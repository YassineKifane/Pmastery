package com.pfa.pmastery.app.controllers;

import com.pfa.pmastery.app.responses.SoutnanceResponse;
import com.pfa.pmastery.app.responses.SoutnanceResponseExtract;
import com.pfa.pmastery.app.services.SoutnanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/soutnance")
public class SoutnanceController {
    @Autowired
    SoutnanceService soutnanceService;

    @PutMapping(path="/initializeDate/{userId}")
    public ResponseEntity<?> initializeDate(@PathVariable String userId,
                                            @RequestParam("startDate") @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate startDate,
                                            @RequestParam("finalDate") @DateTimeFormat(pattern = "dd/MM/yyyy") LocalDate finalDate,
                                            @RequestParam("year") int year) {
        String initializeDate = soutnanceService.initializeDate(userId, startDate, finalDate, year);
        return ResponseEntity.status(HttpStatus.OK).body(initializeDate);
    }

    @GetMapping(path="/getInitializeDate/{userId}")
    public ResponseEntity<List<LocalDate>> getInitializeDate(@PathVariable String userId ,
                                               @RequestParam("year") int year,
                                               @RequestParam("affiliationCode") String affiliationCode){

        List<LocalDate> initializeDate = soutnanceService.getInitializeDate(userId,year,affiliationCode);
        return new ResponseEntity<List<LocalDate>>(initializeDate, HttpStatus.OK);
    }

    @PostMapping(path="/proposeDates/{userId}")
    public ResponseEntity<?> proposeDate(@PathVariable String userId ,
                                         @RequestBody List<LocalDate> proposeDates,
                                         @RequestParam("year") int year){

        String initializeDate = soutnanceService.proposeDate(userId,proposeDates,year);
        return ResponseEntity.status(HttpStatus.OK)
                .body(initializeDate);
    }

    @GetMapping(path="/getProposeDates/{userId}")
    public ResponseEntity<List<LocalDate>> getProposeDates(@PathVariable String userId){

        List<LocalDate> initializeDate = soutnanceService.getProposeDate(userId);
        return new ResponseEntity<List<LocalDate>>(initializeDate, HttpStatus.OK);
    }

    @PostMapping(path="/assignDate/{adminId}/{studentId}")
    public ResponseEntity<?> assignDate(@PathVariable String adminId,
                                        @PathVariable String studentId,
                                        @RequestBody Map<String, Object> requestBody,
                                        @RequestParam("year") int year){

        String affectedDateString = (String) requestBody.get("affectedDate");
        List<String> juryMembers = (List<String>) requestBody.get("juryMembers");

        // Parse the affectedDateString using DateTimeFormatter
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime affectedDateTime;
        try {
            affectedDateTime = LocalDateTime.parse(affectedDateString, formatter);
        } catch (DateTimeParseException e) {
            // Handle the parsing error
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid date format");
        }

        // Convert LocalDateTime to Date object
        Date affectedDate = Date.from(affectedDateTime.atZone(ZoneId.systemDefault()).toInstant());

        String assignDate = soutnanceService.assignDate(adminId,studentId,year,affectedDate,juryMembers);
        return ResponseEntity.status(HttpStatus.OK)
                .body(assignDate);
    }

    @PutMapping(path="/publishSoutnances/{adminId}")
    public String publishSoutnances(@PathVariable String adminId,
                                    @RequestParam("year") int year){
        String publishSoutnance = soutnanceService.publishSoutnances(adminId,year);
        return publishSoutnance;
    }

    @GetMapping(path="/getAssignedSoutnance/{userId}")
    public ResponseEntity<SoutnanceResponseExtract> getAssignedSoutnance(@PathVariable String userId){

        SoutnanceResponseExtract soutnanceResponseExtract = soutnanceService.getSoutnanceDetails(userId);
        return new ResponseEntity<SoutnanceResponseExtract>(soutnanceResponseExtract, HttpStatus.OK);
    }

    @GetMapping(path="/getAllSoutnances")
    public ResponseEntity<List<SoutnanceResponse>> getAllSoutnances(@RequestParam("affiliationCode") String affiliationCode,
                                                                    @RequestParam("year") int year){

        List<SoutnanceResponse> allStudentResponses = soutnanceService.getAllSoutnances(affiliationCode, year);
        return new ResponseEntity<List<SoutnanceResponse>>(allStudentResponses, HttpStatus.OK);
    }

    @GetMapping(path="/getAllSoutnancesToSupervisors/{userId}")
    public ResponseEntity<List<SoutnanceResponse>> getAllSoutnancesToSupervisors(@PathVariable String userId,
                                                                                 @RequestParam("year") int year){

        List<SoutnanceResponse> allStudentResponses = soutnanceService.getAllSoutnancesToSupervisors(userId, year);
        return new ResponseEntity<List<SoutnanceResponse>>(allStudentResponses, HttpStatus.OK);
    }
    @GetMapping("/getAllSoutnancesJuryToSupervisors/{userId}")
    public  ResponseEntity<List<SoutnanceResponse>> getAllSoutnancesJuryToSupervisors(@PathVariable String userId,
                                                                                      @RequestParam("year") int year){
        List<SoutnanceResponse> soutnances = soutnanceService.getAllSoutnancesJuryToSupervisors(userId,year);
        return new ResponseEntity<List<SoutnanceResponse>>(soutnances, HttpStatus.OK);
    }

    // @GetMapping("/hasSoutnance/{userId}")
    // public ResponseEntity<Boolean> hasSoutnance(@PathVariable String userId) {
    //     boolean hasSoutnance = soutnanceService.userHasSoutnance(userId);
    //     return ResponseEntity.ok().body(hasSoutnance);
    // }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> anySoutenanceExists() {
        boolean exists = soutnanceService.anySoutenanceExists();
        return ResponseEntity.ok().body(exists);
    }

    @GetMapping("/exists/{userId}/{publish}")
    public ResponseEntity<Boolean> existsSoutnance(
            @PathVariable String userId,
            @PathVariable boolean publish) {
        boolean exists = soutnanceService.existsByUserIdAndPublish(userId, publish);
        System.out.println("userId: " + userId + ", publish: " + publish);
        return ResponseEntity.ok().body(exists);
    }    

    @GetMapping("/exists/{userId}/hasPropositionDates")
    public ResponseEntity<Boolean> hasPropositionDates(@PathVariable String userId) {
        return ResponseEntity.ok(soutnanceService.hasPropositionDates(userId));
    }

    @GetMapping("/exists/{userId}/hasAffectedDate")
    public ResponseEntity<Boolean> hasAffectedDate(@PathVariable String userId) {
        boolean hasDate = soutnanceService.hasAffectedDate(userId);
        return ResponseEntity.ok().body(hasDate);
    }

    @GetMapping("/exists/{fullName}/isUserJuryMember")
    public ResponseEntity<Boolean> isUserJuryMember(@PathVariable String fullName) {
        boolean inJuryMember = soutnanceService.isUserJuryMember(fullName);
        return ResponseEntity.ok().body(inJuryMember);
    }

}
