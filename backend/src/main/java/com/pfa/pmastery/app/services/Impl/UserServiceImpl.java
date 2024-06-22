package com.pfa.pmastery.app.services.Impl;

import com.pfa.pmastery.app.entities.ConfirmationToken;
import com.pfa.pmastery.app.entities.PfeEntity;
import com.pfa.pmastery.app.entities.UserEntity;
import com.pfa.pmastery.app.repositories.ConfirmationTokenRepository;
import com.pfa.pmastery.app.repositories.PfeRepository;
import com.pfa.pmastery.app.repositories.UserRepository;
import com.pfa.pmastery.app.services.EmailSenderService;
import com.pfa.pmastery.app.services.UserService;
import com.pfa.pmastery.app.shared.Utils;
import com.pfa.pmastery.app.shared.dto.PfeDto;
import com.pfa.pmastery.app.shared.dto.UserDto;
import org.modelmapper.ModelMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;
import java.util.logging.Logger;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UserServiceImpl implements UserService {


    @Autowired
    UserRepository userRepository;
    @Autowired
    PfeRepository pfeRepository;
    @Autowired
    ConfirmationTokenRepository confirmationTokenRepository;
    @Autowired
    EmailSenderService emailSenderService;
    @Autowired
    Utils utils;
    @Autowired
    BCryptPasswordEncoder bCryptPasswordEncoder;




    @Override
    public UserDto addUser(String role , UserDto user) throws MessagingException, IOException {

        if(!role.equals("STUDENT") && user.getPfe() != null) throw new RuntimeException("Vous n'êtes pas autorisé(e) à remplir les champs de PFE.");

        UserEntity checkUser = userRepository.findByEmail(user.getEmail());
        if(checkUser != null) throw new RuntimeException("L'utilisateur existe déjà.");

        if(!role.equals("ADMIN")){
            UserEntity checkCode = userRepository.findByAffiliationCodeAndRole(user.getAffiliationCode(),"ADMIN");
            if(checkCode == null)throw new RuntimeException("Aucun espace n'est associé à ce code d'affiliation. Veuillez vérifier le code et réessayer.");
            if(user.getSector() != null) throw new RuntimeException("Vous n'êtes pas autorisé(e) à remplir le champ Secteur.");
        }

        ModelMapper modelMapper = new ModelMapper();
        UserEntity userEntity = modelMapper.map(user,UserEntity.class);
        userEntity.setRole(role);
        userEntity.setUserId(utils.generateStringId(32));
        userEntity.setEncryptedPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        if(!role.equals("ADMIN")){
            UserEntity sector = userRepository.findByAffiliationCodeAndRole(user.getAffiliationCode(),"ADMIN");
            //userEntity.setAnnouncementMsg(sector.getAnnouncementMsg());
            userEntity.setSector(sector.getSector());
        }
        if (role.equals("ADMIN")){
            if (user.getSector() == null) throw new RuntimeException("Le champ Secteur ne doit pas être vide.");
            userEntity.setSector(user.getSector());
            userEntity.setAffiliationCode(utils.generateStringId(6));
        }

        UserEntity newUser = userRepository.save(userEntity);
        UserDto userDto = modelMapper.map(newUser , UserDto.class);
        userDto.setUserId(newUser.getUserId());
        //Add Sending Email  Verification Function
        ConfirmationToken confirmationToken = new ConfirmationToken(newUser);
        confirmationTokenRepository.save(confirmationToken);

        String msg="To confirm your account, please click here : "
                +"http://localhost:8083/user/confirmEmail?token="+confirmationToken.getConfirmationToken();
        String subject = "Complete Registration!";
        emailSenderService.sendEmail(userEntity.getEmail(),
                subject,
                msg);
        return userDto;
    }

    @Override
    public List<UserDto> getUsersByVerificationStatus(String affiliationCode, boolean isVerified) {
        List<UserDto> userDtoList = new ArrayList<>();
        List<UserEntity> userList = userRepository.findByIsVerifiedAndAffiliationCodeContainingAndIsEmailVerifiedTrue(isVerified,affiliationCode);

        for(UserEntity userEntity : userList){
            ModelMapper modelMapper = new ModelMapper();
            UserDto userDto = modelMapper.map(userEntity, UserDto.class);

            userEntity.setPfe(null);
            UserDto userWithoutPfe = modelMapper.map(userEntity, UserDto.class);

            List<PfeDto> pfeDtoList = userDto.getPfe();
            for(int i = 0; i < pfeDtoList.size(); i++){
                pfeDtoList.get(i).setUsers(null);
                pfeDtoList.get(i).setUser(userWithoutPfe);
            }

            userDto.setPfe(pfeDtoList);
            userDtoList.add(userDto);
        }

        return userDtoList;
    }

    @Override
    public List<UserDto> getUsersByPfeIdAndRole(String pfeId, String role) {

        List<UserDto> userDto = new ArrayList<>();
        List<UserEntity> users = userRepository.findByPfeIdAndRole(pfeId,role);

        for(UserEntity userEntity : users){

            ModelMapper modelMapper = new ModelMapper();
            UserDto user = modelMapper.map(userEntity, UserDto.class);

            userDto.add(user);
        }
        return userDto;
    }

    @Override
    public UserDto updateUser(String userId, UserDto user) {

        UserEntity userEntity = userRepository.findByUserId(userId);
        if (userEntity == null) throw new UsernameNotFoundException(userId);
        if (userEntity.getEmailVerified() == false) throw new RuntimeException("Veuillez Verifier Votre Email! ");


        userEntity.setFirstName(user.getFirstName());
        userEntity.setLastName(user.getLastName());
        UserEntity updatedUser = userRepository.save(userEntity);

        ModelMapper modelMapper = new ModelMapper();
        UserDto userDto = modelMapper.map(updatedUser , UserDto.class);

        return userDto;
    }

    @Override
    public void selectPfe(String userId, List<String> pfeId) {

        UserEntity userEntity = userRepository.findByUserId(userId);
        if (userEntity == null) throw new UsernameNotFoundException(userId);
        if (userEntity.getEmailVerified() == false) throw new RuntimeException("Veuillez Verifier Votre Email!");

        List<PfeEntity> pfeEntities=userEntity.getPfe();

        List<PfeEntity> pfeEntitiesWithApprovedTrue = new ArrayList<>();
        for(int i=0 ; i<pfeEntities.size() ; i++){
            if(pfeEntities.get(i).getApproved()==true){
                pfeEntitiesWithApprovedTrue.add(pfeEntities.get(i));
            }
        }


        for (int i=0 ; i< pfeId.size() ; i++){
            PfeEntity pfeEntity = pfeRepository.findByPfeId(pfeId.get(i));
            if (pfeEntity == null) throw new UsernameNotFoundException(pfeId.get(i));

            if(!pfeEntitiesWithApprovedTrue.contains(pfeEntity)){
                pfeEntitiesWithApprovedTrue.add(pfeEntity);
            }
        }
        userEntity.setPfe(pfeEntitiesWithApprovedTrue);

        userRepository.save(userEntity);
    }

    @Override
    public UserDto addAnnouncementMsg(String affiliationCode, List<String> roles, String announcementMsg) {

        ModelMapper modelMapper = new ModelMapper();
        List<UserDto> userDtos = new ArrayList<>();


        UserEntity admin = userRepository.findByAffiliationCodeAndRole(affiliationCode, "ADMIN");
        admin.setAnnouncementMsg(announcementMsg);

        UserEntity adminEntity = userRepository.save(admin);
        UserDto adminDto =modelMapper.map(adminEntity,UserDto.class);

        for (String role : roles) {
            if (!role.equals("STUDENT") && !role.equals("SUPERVISOR")) {
                throw new IllegalArgumentException("Rôle invalide: " + role);
            }

            List<UserEntity> userEntities = userRepository.findAllByAffiliationCodeAndRole(affiliationCode, role);
            for (UserEntity userEntity : userEntities) {
                userEntity.setAnnouncementMsg(announcementMsg);
                UserEntity userWithAnnouncementMsg = userRepository.save(userEntity);

                UserDto userDtoWithAnnouncementMsg = modelMapper.map(userWithAnnouncementMsg, UserDto.class);
                userDtos.add(userDtoWithAnnouncementMsg);
            }
        }

        return adminDto;
    }

    @Override
    public String getAnnouncementMsg(String userId) {
        UserEntity userEntity=userRepository.findByUserId(userId);
        return userEntity.getAnnouncementMsg();
    }


    @Override
    public void acceptRequest(String userId) {
        UserEntity userEntity = userRepository.findByUserId(userId);
        if (userEntity == null) throw new UsernameNotFoundException(userId);
        if (userEntity.getEmailVerified() == false) throw new RuntimeException(userEntity.getFirstName()+" "+userEntity.getLastName()+
                "email n'a pas encore été validé!");

        userEntity.setVerified(true);
        userRepository.save(userEntity);
        // Send email to the accepted user
        sendAcceptanceEmail(userEntity.getEmail(), userEntity.getFirstName());
    }
    @Override
    public void sendAcceptanceEmail(String userEmail, String userName) {
        String subject = "Your request has been accepted";
        String message = "Dear " + userName + ",\n\nYour request has been accepted in P-Mastery by your sector leader. Welcome aboard!\n\nBest regards. ";

        emailSenderService.sendEmail(userEmail, subject, message);
    }
    @Override
    public void confirmEmail(String confirmationToken) {
        try {
            ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);

            if (token != null) {
                UserEntity user = userRepository.findByEmail(token.getUserEntity().getEmail());
                String userRole = user.getRole(); // Fetch user's role
                if (userRole.equals("ADMIN")) {
                    user.setVerified(true);
                }
                user.setEmailVerified(true);
                userRepository.save(user);
            } else {
                throw new IllegalArgumentException("Le lien est invalide!");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Utilisateur introuvable!", e);
        }
    }


    @Override
    public void forgotPassword(String email) {

        UserEntity user = userRepository.findByEmail(email);
        if (user == null) throw new RuntimeException("Utilisateur introuvable!");
        if (user.getEmailVerified() == false) throw new RuntimeException("Veuillez d'abord confirmez votre Email!");


        ConfirmationToken confirmationToken = new ConfirmationToken(user);
        confirmationTokenRepository.save(confirmationToken);

        String msg="Code de confirmation pour la réinitialisation du mot de passe : "+confirmationToken.getConfirmationToken();
        String subject = "Reset password";
        emailSenderService.sendEmail(user.getEmail(),
                subject,
                msg);
    }

    @Override
    public void resetPassword(String confirmationToken, String newPassword) {
        String passwordPattern = "(?=^.{8,}$)((?=.*\\d)|(?=.*\\W+))(?![.\\n])(?=.*[A-Z])(?=.*[a-z]).*$";
        try {
            ConfirmationToken token = confirmationTokenRepository.findByConfirmationToken(confirmationToken);

            if (token != null) {

                Date currentDate = new Date();
                long tokenAgeInMillis = currentDate.getTime() - token.getCreatedDate().getTime();
                long fiveMinutesInMillis = 5 * 60 * 1000; // 5 minutes in milliseconds

                if (isSameDay(currentDate, token.getCreatedDate()) && tokenAgeInMillis <= fiveMinutesInMillis) {
                    if (Pattern.matches(passwordPattern, newPassword)) {
                        UserEntity user = userRepository.findByEmail(token.getUserEntity().getEmail());

                        user.setEncryptedPassword(bCryptPasswordEncoder.encode(newPassword));
                        userRepository.save(user);
                    } else {
                        throw new IllegalArgumentException("Le mot de passe ne respecte pas le modèle requis!");
                    }
                } else {
                    throw new IllegalArgumentException("Le token de confirmation a expiré!");
                }
            } else {
                throw new IllegalArgumentException("Le Code est invalide!");
            }
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Utilisateur introuvable!", e);
        }
    }
    private boolean isSameDay(Date date1, Date date2) {
        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(date1);
        cal2.setTime(date2);

        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR)
                && cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH)
                && cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }




    @Override
    @Transactional
    public void deleteUser(String userId, String role) {

        UserEntity user = userRepository.findByUserId(userId);

        if (user == null) {
            throw new RuntimeException("Utilisateur introuvable avec l'ID: " + userId);
        }

        // Supprimer les tokens de confirmation associés à l'utilisateur
        for (ConfirmationToken token : user.getConfirmationTokens()) {
            confirmationTokenRepository.delete(token);
        }

        // Supprimer toutes les associations restantes de l'utilisateur
        user.getSentMessages().clear();
        user.getReceivedMessages().clear();

        // Récupérer les PFEs associés à l'utilisateur
        List<PfeEntity> pfeEntities = user.getPfe();

        // Si l'utilisateur est un étudiant, supprimer l'utilisateur et son PFE
        if ("STUDENT".equals(role)) {
            for (PfeEntity pfe : pfeEntities) {
                // Supprimer le PFE
                pfeRepository.delete(pfe);

                // Retirer le PFE de la liste des PFEs encadrés des superviseurs
                for (UserEntity supervisor : pfe.getUsers()) {
                    if ("SUPERVISOR".equals(supervisor.getRole())) {
                        supervisor.getPfe().remove(pfe);
                        userRepository.save(supervisor); // Sauvegarder les modifications au superviseur
                    }
                }
            }
        }
        else if ("SUPERVISOR".equals(role)) {
            // Si l'utilisateur est un superviseur, supprimer uniquement l'entité utilisateur
            for (PfeEntity pfe : pfeEntities) {
                pfe.getUsers().remove(user);
                pfeRepository.save(pfe);
            }
        }

        // Enfin, supprimer l'entité utilisateur elle-même
        userRepository.delete(user);
    }




    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        UserEntity userEntity = userRepository.findByEmail(email);

        if(userEntity == null) throw new UsernameNotFoundException(email);

        return new User(userEntity.getEmail() , userEntity.getEncryptedPassword() , new ArrayList<>());
    }

    @Override
    public UserDto getUser(String email) {
        UserEntity userEntity = userRepository.findByEmail(email);

        if(userEntity == null) throw new UsernameNotFoundException(email);

        UserDto userDto = new UserDto();

        BeanUtils.copyProperties(userEntity, userDto);

        return userDto;

    }

    @Override
    public UserDto getUserByEmailAndPassword(String email,String password) {
        final Logger logger = Logger.getLogger(getClass().getName());
        UserEntity userEntity = userRepository.findByEmail(email);
        logger.info("Retrieved user entity: " + userEntity);
        if(userEntity == null) return null;

        // Check if the entered password matches the password in the database
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        if(!bCryptPasswordEncoder.matches(password, userEntity.getEncryptedPassword())) {
            return null;
        }
        UserDto userDto = new UserDto();
        BeanUtils.copyProperties(userEntity, userDto);
        logger.info("Converted user entity to user dto: " + userDto);
        return userDto;

    }

    @Override
    public List<UserDto> getStudentWithPfe(String affiliationCode) {
        String role = "student";
        List<UserEntity> users = userRepository.findAllByAffiliationCodeAndRoleAndPfeIsNotNull(affiliationCode, role);
        List<UserDto> userDtoList = new ArrayList<>();

        ModelMapper modelMapper = new ModelMapper();

        for(UserEntity userEntity : users){
            UserDto userDto = modelMapper.map(userEntity, UserDto.class);

            UserDto userWithoutPfe = modelMapper.map(userEntity, UserDto.class);
            userWithoutPfe.setPfe(null);

            List<PfeDto> pfeDtoList = userDto.getPfe();

            for(int i = 0; i < pfeDtoList.size(); i++){
                pfeDtoList.get(i).setUsers(null);
                pfeDtoList.get(i).setUser(userWithoutPfe);
            }
            userDto.setPfe(pfeDtoList);
            userDtoList.add(userDto);
        }

        return userDtoList;
    }

    @Override
    public List<UserDto> userWithCurrentPfeAndApproved(String role, String affiliationCode, int year) {
        List<UserDto> userListDto = new ArrayList<>();
        List<UserEntity> supervisorsList = userRepository.findUserWithApprovedPfe(role, affiliationCode, year);

        for (UserEntity userEntity : supervisorsList) {
            ModelMapper modelMapper = new ModelMapper();
            UserDto userDto = modelMapper.map(userEntity, UserDto.class);

            // Ensure PFE information is included
            List<PfeDto> pfeDtoList = new ArrayList<>();
            for (PfeEntity pfeEntity : userEntity.getPfe()) {
                PfeDto pfeDto = modelMapper.map(pfeEntity, PfeDto.class);
                pfeDtoList.add(pfeDto);
            }
            userDto.setPfe(pfeDtoList);

            userListDto.add(userDto);
        }
        return userListDto;
    }
}
