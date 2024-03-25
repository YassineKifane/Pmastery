package com.pfa.pmastery.app.controllers;

import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.requests.PfeRequest;
import com.pfa.pmastery.app.responses.*;
import com.pfa.pmastery.app.services.PfeService;
import com.pfa.pmastery.app.services.StorageService;
import com.pfa.pmastery.app.services.UserService;
import com.pfa.pmastery.app.shared.dto.PfeDto;
import com.pfa.pmastery.app.shared.dto.UserDto;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.modelmapper.convention.MatchingStrategies;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import javax.validation.Valid;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;

@RestController
@RequestMapping("/pfe")
public class PfeController {

    @Autowired
    PfeService pfeService;
    @Autowired
    StorageService storageService;
    @Autowired
    UserRepository userRepository;
    @PostMapping
    public ResponseEntity<?> addPfe(@RequestParam(value = "userId") String userId, @Valid @RequestBody PfeRequest pfeRequest) {

        // Proceed with adding the PFE if the request is valid
        try {
            // Retrieve the user based on userId
            UserEntity userEntity = userRepository.findByUserId(userId);
            if (userEntity == null) {
                // If user not found, return an error response
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found for userId: " + userId);
            }
           ModelMapper modelMapper=new ModelMapper();
            // Convert PfeRequest to PfeDto
            PfeDto pfeDto = modelMapper.map(pfeRequest, PfeDto.class);

            // Convert UserEntity to UserDto
            UserDto userDto = modelMapper.map(userEntity, UserDto.class);

            // Add PFE and associate it with the user
            PfeDto addedPfe = pfeService.addPfe(pfeDto, userDto);
            return new ResponseEntity<>(addedPfe, HttpStatus.CREATED);
        } catch (Exception e) {
            // If an exception occurs during the addition process, return an internal server error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to add PFE: " + e.getMessage());
        }
    }


    @GetMapping
    public ResponseEntity<List<PfeResponseWithoutUser>> getPfeByYear(@RequestParam (value = "year") int year,
                                                                     @RequestParam (value = "affiliationCode") String code){
        List<PfeResponseWithoutUser> pfeResponses = new ArrayList<>();
        List<PfeDto> pfes = pfeService.getPfeByYear(year , code);

        for(PfeDto pfeDto : pfes) {

            ModelMapper modelMapper = new ModelMapper();
            PfeResponseWithoutUser pfe = modelMapper.map(pfeDto , PfeResponseWithoutUser.class);

            pfeResponses.add(pfe);
        }

        return new ResponseEntity<List<PfeResponseWithoutUser>>(pfeResponses, HttpStatus.OK);
    }

    @GetMapping(path = "/process")
    public ResponseEntity<List<PfeResponseWithoutUser>> getPfeWithStatus(
            @RequestParam(value = "year") int year,
            @RequestParam(value = "affiliationCode") String code,
            @RequestParam(value = "isApproved") boolean isApproved) {

        List<PfeResponseWithoutUser> pfeResponses = new ArrayList<>();
        List<PfeDto> pfes = pfeService.getPfeWithStatus(year, code , isApproved);

        for (PfeDto pfeDto : pfes) {
            ModelMapper modelMapper = new ModelMapper();
            PfeResponseWithoutUser pfe = modelMapper.map(pfeDto , PfeResponseWithoutUser.class);
            pfeResponses.add(pfe);
        }

        return new ResponseEntity<List<PfeResponseWithoutUser>>(pfeResponses, HttpStatus.OK);
    }


    @GetMapping(path="/{pfeId}")
    public ResponseEntity<PfeResponseWithoutUser> getPfeByPfeId(@PathVariable String pfeId){

        PfeDto pfe = pfeService.getPfeByPfeId(pfeId);

        ModelMapper modelMapper = new ModelMapper();
        PfeResponseWithoutUser pfeResponses = modelMapper.map(pfe,PfeResponseWithoutUser.class);

        return new ResponseEntity<PfeResponseWithoutUser>(pfeResponses, HttpStatus.OK);
    }



    @GetMapping(path="/user/{userId}")
    public ResponseEntity<List<PfeResponseWithoutUser>> getPfeByUserId(@PathVariable String userId,
                                                                       @RequestParam (value="role") String role){

        List<PfeResponseWithoutUser> pfeResponses = new ArrayList<>();
        List<PfeDto> pfes = pfeService.getPfeByUserId(userId,role);

        for(PfeDto pfeDto : pfes) {

            ModelMapper modelMapper = new ModelMapper();

            PfeResponseWithoutUser pfeResponse = modelMapper.map(pfeDto, PfeResponseWithoutUser.class);

            pfeResponses.add(pfeResponse);
        }

        return new ResponseEntity<List<PfeResponseWithoutUser>>(pfeResponses, HttpStatus.OK);
    }

    @PutMapping(path ="/{pfeId}")
    public ResponseEntity<PfeResponseWithoutUser> updatePfe(@PathVariable String pfeId , @RequestBody @Valid PfeRequest pfeRequest){

        ModelMapper modelMapper = new ModelMapper();
        PfeDto pfeDto = modelMapper.map(pfeRequest,PfeDto.class);

        PfeDto updatedPfe = pfeService.updatePfe(pfeId,pfeDto);

        PfeResponseWithoutUser pfeResponse=modelMapper.map(updatedPfe,PfeResponseWithoutUser.class);

        return new ResponseEntity<PfeResponseWithoutUser>(pfeResponse,HttpStatus.ACCEPTED);
    }

    @PutMapping(path ="/approve/{pfeId}")
    public ResponseEntity<PfeResponse> approvePfeToSupervisors(@PathVariable String pfeId ,
                                                               @RequestParam List<String> userIds){

        ModelMapper modelMapper = new ModelMapper();

        PfeDto approvedPfe = pfeService.approvePfeToSupervisors(pfeId,userIds);

        PfeResponse pfeResponse=modelMapper.map(approvedPfe,PfeResponse.class);

        return new ResponseEntity<PfeResponse>(pfeResponse,HttpStatus.ACCEPTED);
    }

    @PostMapping(path="/addReport/{userId}")
    public ResponseEntity<?> addReportToFIleSystem(@PathVariable String userId,
                                                   @RequestParam("report") MultipartFile report) throws IOException {
        String uploadImage = storageService.uploadReportToFileSystem(userId,report);
        return ResponseEntity.status(HttpStatus.OK)
                .body(uploadImage);
    }

    @GetMapping("report/{userId}")
    public ResponseEntity<?> downloadReportFromFileSystem(@PathVariable String userId) throws IOException {
        byte[] imageData=storageService.downloadReportFromFileSystem(userId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("inline").filename(userId).build());

        return ResponseEntity.ok()
                .headers(headers)
                .body(imageData);

    }

    @GetMapping("/allReportsStatus")
    public ResponseEntity<List<ReportResponse>> allReportsStatus(@RequestParam("affiliationCode") String affiliationCode,
                                                                 @RequestParam("year") int year){
        List<ReportResponse> reportResponses = storageService.reportStatus(affiliationCode,year);
        return new ResponseEntity<List<ReportResponse>>(reportResponses, HttpStatus.OK);
    }

    @GetMapping("/allReportsStatusToSupervisor/{userId}")
    public ResponseEntity<List<ReportResponse>> allReportsStatusToSupervisor(@PathVariable String userId,
                                                                             @RequestParam("year") int year){
        List<ReportResponse> reportResponses = storageService.reportStatusToSupervisor(userId,year);
        return new ResponseEntity<List<ReportResponse>>(reportResponses, HttpStatus.OK);
    }
}