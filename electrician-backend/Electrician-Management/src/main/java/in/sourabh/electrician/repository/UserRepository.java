package in.sourabh.electrician.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import in.sourabh.electrician.entites.User;

public interface UserRepository extends JpaRepository<User,Long>{

    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);
}
