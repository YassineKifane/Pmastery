package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.PfeEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PfeRepository extends PagingAndSortingRepository<PfeEntity,Long> {
//   List<PfeEntity> findByYear(int year);


    @Query("SELECT DISTINCT p FROM pfe p JOIN p.users u WHERE p.year = :year and u.isEmailVerified=true")
    List<PfeEntity> findByYear(@Param("year") int year);

    @Query("SELECT DISTINCT p FROM pfe p JOIN p.users u WHERE p.year = :year and u.affiliationCode=:code and p.isApproved =:isApproved and u.isVerified=true and u.isEmailVerified=true")
    List<PfeEntity> getPfeWithStatus(@Param("year") int year, @Param("code") String code,@Param("isApproved") boolean isApproved);

    PfeEntity findByPfeId(String pfeId);
    //Page<PfeEntity> findByPfeId(Pageable pageable , String pfeId);

    @Query("SELECT p FROM pfe p JOIN p.users u WHERE u.userId = :userId and u.role=:role and u.isEmailVerified=true")
    List<PfeEntity> findByUserId(@Param("userId") String userId ,@Param("role") String role );

    @Query("SELECT p FROM pfe p JOIN p.users u WHERE u.userId = :userId and u.role=:role and u.isEmailVerified=true and p.year=:year")
    List<PfeEntity> findByUserIdAndYear(@Param("userId") String userId ,@Param("role") String role, @Param("year") int year);

}
