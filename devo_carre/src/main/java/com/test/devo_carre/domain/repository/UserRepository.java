package com.test.devo_carre.domain.repository;

import com.test.devo_carre.domain.model.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    Optional<User> findByEmail(String email);

    Optional<User> findById(UUID id);

    boolean existsByEmail(String email);

    User save(User user);

    void deleteAll();
}
