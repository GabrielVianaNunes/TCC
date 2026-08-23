package com.zeiss.pilot.validation;

import java.util.regex.Pattern;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NomeValidator implements ConstraintValidator<Nome, String> {

    private static final Pattern PADRAO = Pattern.compile("^[\\p{L} '.&-]+$");

    @Override
    public boolean isValid(String valor, ConstraintValidatorContext context) {
        if (valor == null || valor.isBlank()) {
            return true;
        }
        return PADRAO.matcher(valor).matches();
    }
}
