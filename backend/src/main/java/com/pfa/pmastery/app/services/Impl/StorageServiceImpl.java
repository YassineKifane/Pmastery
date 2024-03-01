package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.PfeEntity;
import com.pfa.pmastery.app.entities.ReportData;
import com.pfa.pmastery.app.entities.SoutnanceEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.PfeRepository;
import com.pfa.pmastery.app.repositories.ReportDataRepository;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.responses.ReportResponse;
import com.pfa.pmastery.app.responses.SoutnanceResponse;
import com.pfa.pmastery.app.services.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@Service
public class StorageServiceImpl implements StorageService {

    @Autowired
    ReportDataRepository reportDataRepository;

    @Autowired
    UserRepository userRepository;
    @Autowired
    PfeRepository pfeRepository;

    //Method to get the relatif path to our folder
    private static String getFolderPath() {
        Path currentPath = Paths.get("").toAbsolutePath();
        //Path parentPath = currentPath.getParent();
        //Path folderPath = parentPath.resolve("reports");
        Path folderPath = currentPath.resolve("reports");
        return folderPath.toString();
    }

    private static final String FOLDER_PATH = getFolderPath();

    @Override
    public String uploadReportToFileSystem(String userId,MultipartFile file) throws IOException {

        UserEntity userEntity=userRepository.findByUserId(userId);
        if(userEntity == null){throw new RuntimeException("Utilisateur introuvable!");}
        List<PfeEntity> pfeEntity=pfeRepository.findByUserId(userEntity.getUserId(),"STUDENT");
        if(pfeEntity == null){throw new RuntimeException("Utilisateur introuvable!");}


        // Check if the user already has a report file
        if (reportDataRepository.existsByPfeEntity(pfeEntity.get(0))) {
            throw new RuntimeException("Un fichier de rapport existe déjà pour cet utilisateur.");
        }

        String filePath=FOLDER_PATH+"\\"+file.getOriginalFilename();

        if (file.getContentType() == null || !file.getContentType().equalsIgnoreCase("application/pdf")) {
            throw new IllegalArgumentException("Type de fichier invalide. Seuls les fichiers PDF sont autorisés.");
        }

        File existingFile = new File(filePath);
        if (existingFile.exists()) {
            throw new RuntimeException("Le fichier existe déjà : " + filePath);
        }


        ReportData reportData = ReportData.builder()
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .filePath(filePath)
                .pfeEntity(pfeEntity.get(0))
                .build();

        try {
            ReportData fileData=reportDataRepository.save(reportData);

            file.transferTo(new File(filePath));

            if (fileData != null) {
                return "File uploaded successfully : " + filePath;
            }
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors du téléchargement du fichier : " + e.getMessage(), e);
        }

        return null;
    }

    @Override
    public byte[] downloadReportFromFileSystem(String userId) throws IOException {

        UserEntity userEntity=userRepository.findByUserId(userId);
        List<PfeEntity> pfeEntity=pfeRepository.findByUserId(userEntity.getUserId(),"STUDENT");
        if(userEntity == null || pfeEntity == null){throw new RuntimeException("Utilisateur introuvable!");}

        ReportData fileData = reportDataRepository.findByPfeEntityPfeId(pfeEntity.get(0).getPfeId());
        if (fileData == null) {throw new RuntimeException("Rapport de "+userEntity.getLastName()+" "+userEntity.getFirstName()+" introuvable!");}

        String filePath=fileData.getFilePath();
        if (filePath == null) {throw new RuntimeException("Le chemin du votre rapport est nul !");}

        try {
            byte[] images = Files.readAllBytes(new File(filePath).toPath());
            return images;
        } catch (IOException e) {
            throw new RuntimeException("Impossible de lire le rapport de: " +userEntity.getFirstName()+" "+userEntity.getLastName(), e);
        }
    }

    @Override
    public List<ReportResponse> reportStatus(String affiliationCode, int year) {
        List<ReportResponse> reportResponse=new ArrayList<>();
        List<UserEntity> allStudents=userRepository.findAllByAffiliationCodeAndRoleAndYear(affiliationCode,"STUDENT",year);

        for(int i=0;i< allStudents.size();i++){
            ReportResponse studentReport = new ReportResponse();
            ReportData reportData=reportDataRepository.findByPfeEntityPfeId(allStudents.get(i).getPfe().get(0).getPfeId());

            if(reportData != null){
                studentReport.setSubmitedd(true);
                studentReport.setDate(reportData.getCreatedDate());

            } else {
                studentReport.setSubmitedd(false);
                studentReport.setDate(null);
            }
            studentReport.setFullName(allStudents.get(i).getLastName()+" "+allStudents.get(i).getFirstName());
            studentReport.setUserId(allStudents.get(i).getUserId());


            reportResponse.add(studentReport);
        }

        return reportResponse;
    }

    @Override
    public List<ReportResponse> reportStatusToSupervisor(String userId, int year) {

        List<ReportResponse> reportResponse=new ArrayList<>();

        UserEntity user=userRepository.findByUserId(userId);
        List<PfeEntity> allPfes= pfeRepository.findByUserIdAndYear(userId,"SUPERVISOR",year);

        for (int i=0;i<allPfes.size();i++){
            ReportResponse reportStudent = new ReportResponse();
            ReportData reportData = reportDataRepository.findByPfeEntityPfeId(allPfes.get(i).getPfeId());

            List<UserEntity> userEntity=userRepository.findByPfeIdAndRole(allPfes.get(i).getPfeId(),"STUDENT");
            UserEntity student=userEntity.get(0);

            if (reportData != null){
                reportStudent.setSubmitedd(true);
                reportStudent.setDate(reportData.getCreatedDate());
            } else {
                reportStudent.setSubmitedd(false);
                reportStudent.setDate(null);
            }
            reportStudent.setUserId(student.getUserId());
            reportStudent.setFullName(student.getFirstName()+" "+student.getLastName());
            reportResponse.add(reportStudent);

        }

        return reportResponse;
    }
}
