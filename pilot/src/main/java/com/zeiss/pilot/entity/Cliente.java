package com.zeiss.pilot.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import com.zeiss.pilot.security.CryptoConverter;

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Convert(converter = CryptoConverter.class)
    @Column(name = "cpf_ou_cnpj", nullable = false)
    private String cpfOuCnpj;

    @Column(name = "cpf_ou_cnpj_hash", nullable = false, length = 64)
    private String cpfOuCnpjHash;

    @Convert(converter = CryptoConverter.class)
    @Column(columnDefinition = "TEXT")
    private String endereco;

    private String telefone;

    private String email;

    @Column(name = "data_cadastro", nullable = false)
    private LocalDate dataCadastro;

    public Cliente() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpfOuCnpj() { return cpfOuCnpj; }
    public void setCpfOuCnpj(String cpfOuCnpj) { this.cpfOuCnpj = cpfOuCnpj; }

    public String getCpfOuCnpjHash() { return cpfOuCnpjHash; }
    public void setCpfOuCnpjHash(String cpfOuCnpjHash) { this.cpfOuCnpjHash = cpfOuCnpjHash; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }
}
