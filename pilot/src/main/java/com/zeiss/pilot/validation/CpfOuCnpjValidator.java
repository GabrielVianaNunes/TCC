package com.zeiss.pilot.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CpfOuCnpjValidator implements ConstraintValidator<CpfOuCnpj, String> {

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext context) {
        if (valor == null || valor.isBlank()) {
            return true;
        }
        // Só aceita os separadores da própria máscara (. - /) ou dígitos —
        // qualquer letra ou outro símbolo já reprova aqui, antes mesmo de
        // calcular o dígito verificador.
        if (!valor.matches("^[0-9./-]+$")) {
            return false;
        }
        return CpfOuCnpjUtil.valido(valor);
    }
}
