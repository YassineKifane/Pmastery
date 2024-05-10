package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.UserEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface UserRepository extends PagingAndSortingRepository<UserEntity,Long> {

    UserEntity findByEmail(String email);
    UserEntity findByUserId(String userId);

    @Query("SELECT u FROM users u JOIN u.pfe p WHERE p.pfeId = :pfeId AND u.role = :role AND u.isEmailVerified = true")
    List<UserEntity> findByPfeIdAndRole(@Param("pfeId") String pfeId, @Param("role") String role);
    UserEntity findByAffiliationCodeAndRole(String AffiliationCode,String role);
    List<UserEntity> findAllByAffiliationCodeAndRole(String affiliationCode, String role);
    List<UserEntity> findByIsVerifiedAndAffiliationCodeContainingAndIsEmailVerifiedTrue(boolean isVerified, String affiliationCode);

    @Query("SELECT u FROM users u JOIN u.pfe p WHERE u.affiliationCode = :affiliationCode AND u.role = :role AND p.year = :year")
    List<UserEntity> findAllByAffiliationCodeAndRoleAndYear(@Param("affiliationCode") String affiliationCode,
                                                            @Param("role") String role,
                                                            @Param("year") int year);

    List<UserEntity> findAllByAffiliationCodeAndRoleAndPfeIsNotNull(String affiliationCode, String role);

}
