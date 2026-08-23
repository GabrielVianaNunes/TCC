package com.zeiss.pilot.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Nome de pessoa ou razão social de empresa — aceita letra (com acento),
 * espaço, hífen, apóstrofo, ponto e "&"; rejeita dígito e qualquer outro
 * símbolo. Mesmo campo serve os dois casos (ex.: Cliente.nome), por isso não
 * se chama @NomePessoa.
 */
@Documented
@Constraint(validatedBy = NomeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface Nome {
    String message() default "deve conter apenas letras, espaço, hífen, apóstrofo, ponto ou &";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
