package com.pfa.pmastery.app.repositories;

import com.pfa.pmastery.app.entities.ConfirmationToken;
import org.springframework.data.repository.CrudRepository;
import com.pfa.pmastery.app.entities.UserEntity;
import java.util.List;

public interface ConfirmationTokenRepository extends CrudRepository<ConfirmationToken, String> {
    ConfirmationToken findByConfirmationToken(String confirmationToken);
    void deleteByUserEntity(UserEntity userEntity);
    List<ConfirmationToken> findByUserEntity(UserEntity userEntity);
}
