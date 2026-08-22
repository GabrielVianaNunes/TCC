package com.zeiss.pilot.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zeiss.pilot.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByCpfOuCnpjHash(String cpfOuCnpjHash);
}
