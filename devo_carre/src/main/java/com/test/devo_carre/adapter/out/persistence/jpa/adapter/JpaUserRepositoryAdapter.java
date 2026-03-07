package com.test.devo_carre.adapter.out.persistence.jpa.adapter;

import com.test.devo_carre.adapter.out.persistence.jpa.entity.UserEntity;
import com.test.devo_carre.adapter.out.persistence.jpa.repository.SpringDataUserRepository;
import com.test.devo_carre.domain.model.User;
import com.test.devo_carre.domain.repository.UserRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class JpaUserRepositoryAdapter implements UserRepository {

    private final SpringDataUserRepository repository;

    public JpaUserRepositoryAdapter(SpringDataUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmailIgnoreCase(email).map(this::toDomain);
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmailIgnoreCase(email);
    }

    @Override
    public User save(User user) {
        return toDomain(repository.save(toEntity(user)));
    }

    @Override
    public void deleteAll() {
        repository.deleteAllInBatch();
    }

    private User toDomain(UserEntity entity) {
        return new User(entity.getId(), entity.getEmail(), entity.getPasswordHash(), entity.getCreatedAt());
    }

    private UserEntity toEntity(User user) {
        var entity = new UserEntity();
        entity.setId(user.id());
        entity.setEmail(user.email());
        entity.setPasswordHash(user.passwordHash());
        entity.setCreatedAt(user.createdAt());
        return entity;
    }
}
