package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.PfeEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.PfeRepository;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.services.PfeService;
import com.pfa.pmastery.app.shared.Utils;

import com.pfa.pmastery.app.shared.dto.PfeDto;
import com.pfa.pmastery.app.shared.dto.UserDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PfeServiceImpl implements PfeService {


    @Autowired
    PfeRepository pfeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    Utils utils;
    @Override
    public PfeDto addPfe(PfeDto pfeDto, UserDto userDto) {
        // Create a new PfeEntity
        PfeEntity pfeEntity = new PfeEntity();

        // Check if pfeId is not set, then generate a new one
        if (pfeDto.getPfeId() == null || pfeDto.getPfeId().isEmpty()) {
            pfeDto.setPfeId(utils.generateStringId(32));
        }

        // Map fields from PfeDto to PfeEntity
        pfeEntity.setPfeId(pfeDto.getPfeId());
        pfeEntity.setCity(pfeDto.getCity());
        pfeEntity.setCompany(pfeDto.getCompany());
        pfeEntity.setSubject(pfeDto.getSubject());
        pfeEntity.setSupervisorEmail(pfeDto.getSupervisorEmail());
        pfeEntity.setUsedTechnologies(pfeDto.getUsedTechnologies());

        List<UserEntity> users = new ArrayList<>();

        UserEntity userEntity = userRepository.findByUserId(userDto.getUserId());
        users.add(userEntity);

        pfeEntity.setUsers(users);


        // Save the PfeEntity to the database
        PfeEntity addedPfeEntity = pfeRepository.save(pfeEntity);

        // Map the addedPfeEntity back to PfeDto and return
        PfeDto addedPfeDto = new PfeDto();
        addedPfeDto.setPfeId(addedPfeEntity.getPfeId());
        addedPfeDto.setCity(addedPfeEntity.getCity());
        addedPfeDto.setCompany(addedPfeEntity.getCompany());
        addedPfeDto.setSubject(addedPfeEntity.getSubject());
        addedPfeDto.setApproved(false);
        addedPfeDto.setUser(userDto);
        addedPfeDto.setSupervisorEmail(addedPfeEntity.getSupervisorEmail());
        addedPfeDto.setUsedTechnologies(addedPfeEntity.getUsedTechnologies());

        return addedPfeDto;
    }

    @Override
    public List<PfeDto> getPfeByYear(int year , String code) {

        List<PfeDto> pfeDto = new ArrayList<>();
        List<PfeEntity> pfes = pfeRepository.findByYear(year);

        for(PfeEntity pfeEntity : pfes){

            if(!pfeEntity.getUsers().isEmpty() && pfeEntity.getUsers().get(0).getAffiliationCode().equals(code)){
                ModelMapper modelMapper = new ModelMapper();
                PfeDto pfe = modelMapper.map(pfeEntity, PfeDto.class);

                pfeDto.add(pfe);
            }
        }
        return pfeDto;
    }

    @Override
    public List<PfeDto> getPfeWithStatus(int year, String code , boolean isApproved) {
        List<PfeDto> pfeDto = new ArrayList<>();
        List<PfeEntity> pfeRequests = pfeRepository.getPfeWithStatus(year, code , isApproved);
        for (PfeEntity pfeEntity : pfeRequests) {
            ModelMapper modelMapper = new ModelMapper();
            PfeDto pfe = modelMapper.map(pfeEntity, PfeDto.class);
            pfeDto.add(pfe);
        }
        return pfeDto;
    }



    @Override
    public PfeDto getPfeByPfeId(String pfeId) {

        PfeEntity pfe = pfeRepository.findByPfeId(pfeId);

        ModelMapper modelMapper = new ModelMapper();
        PfeDto pfeDto = modelMapper.map(pfe,PfeDto.class);

        return pfeDto;
    }
    @Override
    public List<PfeDto> getPfeByUserId(String userId , String role) {

        List<PfeDto> pfeDto = new ArrayList<>();

        List<PfeEntity> projects = pfeRepository.findByUserId(userId,role);
        for (PfeEntity pfeEntity : projects){

            ModelMapper modelMapper = new ModelMapper();
            PfeDto pfe = modelMapper.map(pfeEntity , PfeDto.class);

            UserDto userDto = modelMapper.map(pfeEntity.getUsers().get(0) , UserDto.class);
            pfe.setUser(userDto);

            pfeDto.add(pfe);

        }

        return pfeDto;
    }


    @Override
    public PfeDto updatePfe(String pfeId, PfeDto pfe) {

        PfeEntity pfeEntity = pfeRepository.findByPfeId(pfeId);
        if (pfeEntity == null) throw new UsernameNotFoundException(pfeId);

        pfeEntity.setCity(pfe.getCity());
        pfeEntity.setCompany(pfe.getCompany());
        pfeEntity.setSubject(pfe.getSubject());
        pfeEntity.setSupervisorEmail(pfe.getSupervisorEmail());
        pfeEntity.setUsedTechnologies(pfe.getUsedTechnologies());
        PfeEntity updatePfe = pfeRepository.save(pfeEntity);

        ModelMapper modelMapper = new ModelMapper();
        PfeDto pfeDto = modelMapper.map(updatePfe,PfeDto.class);

        return pfeDto;
    }

    @Override
    public PfeDto approvePfeToSupervisors(String pfeId, List<String> userIds) {

        PfeEntity pfeEntity = pfeRepository.findByPfeId(pfeId);
        if (pfeEntity == null) throw new UsernameNotFoundException(pfeId);

        List<UserEntity> userEntities=userRepository.findByPfeIdAndRole(pfeId,"STUDENT");
        if(userEntities == null) throw new UsernameNotFoundException(pfeId);
        UserEntity pfeOwner = userEntities.get(0);
        pfeOwner.setPfe(null);

        pfeEntity.setUsers(null);

        pfeEntity.setUsers(new ArrayList<>());
        pfeEntity.getUsers().add(pfeOwner);

        for (int i=0 ;i<userIds.size();i++ ){
            UserEntity userEntity=userRepository.findByUserId(userIds.get(i));
            if(userEntity.getRole().equals("STUDENT")) throw new RuntimeException("Non autorisé pour les utilisateurs ÉTUDIANT.");
            pfeEntity.getUsers().add(userEntity);
        }

        pfeEntity.setApproved(true);

        PfeEntity approvedPfe = pfeRepository.save(pfeEntity);

        ModelMapper modelMapper = new ModelMapper();
        PfeDto pfeDto = modelMapper.map(approvedPfe,PfeDto.class);

        return pfeDto;
    }

    @Override
    public boolean hasPFE(String userId) {
        // Query the database to check if there are any PFEs associated with the given userId
        List<PfeEntity> pfeList = pfeRepository.findByUserId(userId);

        // If the list is not empty, it means the user already has a PFE
        return !pfeList.isEmpty();
    }
    @Override
    public boolean hasStudentPfe() {
        // Query the database for PFEs associated with the role STUDENT
        List<PfeEntity> pfeList = pfeRepository.findByRole("STUDENT");

        // Return true if the list is not empty, indicating at least one PFE exists for students
        return !pfeList.isEmpty();
    }
    @Override
    public boolean isUserInJoinTable(String userId) {
        return pfeRepository.existsByUserIdInJoinTable(userId);
    }

    @Override
    public boolean existsUnapprovedPfe() {
        return pfeRepository.existsUnapprovedPfe();
    }
    @Override
    public boolean hasSupervisorEmail(String pfeId) {
        PfeEntity pfe = pfeRepository.findByPfeId(pfeId);

        if (pfe == null) {
            throw new UsernameNotFoundException("PFE with ID " + pfeId + " not found.");
        }

        return pfe.getSupervisorEmail() != null;
    }

    @Override
    public List<Integer> pfeYearsList(String affiliationCode) {
        return pfeRepository.findAllPfeYears(affiliationCode);
    }

    @Transactional
    public void updateNote(String userId, Double note) {
        List<PfeEntity> pfeEntities = pfeRepository.findByUserId(userId, "STUDENT");
        pfeEntities.get(0).setNote(note);
        pfeRepository.save(pfeEntities.get(0));
    }

}