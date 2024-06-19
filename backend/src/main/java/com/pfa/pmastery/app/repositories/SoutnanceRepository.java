package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.SoutnanceEntity;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface SoutnanceRepository extends CrudRepository<SoutnanceEntity,Long> {
    SoutnanceEntity findByUserEntityUserId(String userId);
    SoutnanceEntity findByUserEntityUserIdAndYear(String userId, int year);
    @Query("SELECT COUNT(s) > 0 FROM soutnance s")
    boolean existsAny();
    boolean existsByUserEntityUserId(String userId);
    boolean existsByUserEntityUserIdAndPublish(String userId, boolean publish);
   
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM soutnance s WHERE s.userEntity.userId = :userId AND SIZE(s.propositionDates) > 0")
    boolean hasPropositionDates(@Param("userId") String userId);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM soutnance s WHERE s.userEntity.userId = :userId AND s.affectedDate IS NOT NULL")
    boolean hasAffectedDate(@Param("userId") String userId);

    @Query("SELECT COUNT(s) > 0 FROM soutnance s JOIN s.juryMembers jm WHERE jm = :fullName")
    boolean existsByUserIdInJuryMembers(@Param("fullName") String fullName);


}
