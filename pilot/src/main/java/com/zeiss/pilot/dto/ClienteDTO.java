package com.zeiss.pilot.dto;

import java.time.LocalDate;

import com.zeiss.pilot.entity.Cliente;
import com.zeiss.pilot.validation.CpfOuCnpj;
import com.zeiss.pilot.validation.Nome;
import com.zeiss.pilot.validation.Telefone;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ClienteDTO {

    private Long id;

    @NotBlank(message = "Nome é obrigatório.")
    @Nome
    private String nome;

    @NotBlank(message = "CPF ou CNPJ é obrigatório.")
    @CpfOuCnpj
    private String cpfOuCnpj;

    @NotBlank(message = "Endereço é obrigatório.")
    private String endereco;

    @NotBlank(message = "Telefone é obrigatório.")
    @Telefone
    private String telefone;

    @Email(message = "E-mail inválido.")
    private String email;

    private LocalDate dataCadastro;

    public ClienteDTO() {}

    public static ClienteDTO fromEntity(Cliente c) {
        ClienteDTO dto = new ClienteDTO();
        dto.setId(c.getId());
        dto.setNome(c.getNome());
        dto.setCpfOuCnpj(c.getCpfOuCnpj());
        dto.setEndereco(c.getEndereco());
        dto.setTelefone(c.getTelefone());
        dto.setEmail(c.getEmail());
        dto.setDataCadastro(c.getDataCadastro());
        return dto;
    }

    // hash e dataCadastro nunca vêm do cliente da API — são calculados/atribuídos no service.
    public Cliente toEntity() {
        Cliente c = new Cliente();
        c.setNome(this.nome);
        c.setCpfOuCnpj(this.cpfOuCnpj);
        c.setEndereco(this.endereco);
        c.setTelefone(this.telefone);
        c.setEmail(this.email);
        return c;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getCpfOuCnpj() { return cpfOuCnpj; }
    public void setCpfOuCnpj(String cpfOuCnpj) { this.cpfOuCnpj = cpfOuCnpj; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public LocalDate getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDate dataCadastro) { this.dataCadastro = dataCadastro; }
}
