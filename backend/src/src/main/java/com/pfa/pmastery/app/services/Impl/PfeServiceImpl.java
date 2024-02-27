package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.PfeEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.PfeRepository;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.services.PfeService;
import com.pfa.pmastery.app.shared.dto.PfeDto;
import com.pfa.pmastery.app.shared.dto.UserDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PfeServiceImpl implements PfeService {

    @Autowired
    PfeRepository pfeRepository;
    @Autowired
    private UserRepository userRepository;

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


}
