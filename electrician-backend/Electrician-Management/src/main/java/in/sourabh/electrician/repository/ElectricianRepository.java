package in.sourabh.electrician.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import in.sourabh.electrician.entites.Electrician;

public interface ElectricianRepository extends JpaRepository<Electrician,Long>{

    boolean existsByEmail(String email);

    Optional<Electrician> findByEmail(String email);
    
}
