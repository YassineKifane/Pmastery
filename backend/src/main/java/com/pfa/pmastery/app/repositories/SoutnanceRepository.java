package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.SoutnanceEntity;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SoutnanceRepository extends CrudRepository<SoutnanceEntity,Long> {
    SoutnanceEntity findByUserEntityUserId(String userId);
    SoutnanceEntity findByUserEntityUserIdAndYear(String userId, int year);

    boolean existsByUserEntityUserId(String userId);

}
