package com.zeiss.pilot.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TelefoneValidator implements ConstraintValidator<Telefone, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext context) {
        if (valor == null || valor.isBlank()) {
            return true;
        }
        // Só aceita os separadores da própria máscara — parênteses, espaço e
        // hífen — ou dígitos; qualquer letra ou outro símbolo já reprova aqui.
        if (!valor.matches("^[0-9() -]+$")) {
            return false;
        }
        String digitos = valor.replaceAll("[^0-9]", "");
        return digitos.length() == 10 || digitos.length() == 11;
    }
}
