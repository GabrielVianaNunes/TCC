package com.zeiss.pilot.validation;

public final class CpfOuCnpjUtil {

    private CpfOuCnpjUtil() {}

    /** Aceita com ou sem máscara — remove tudo que não for dígito antes de validar. */
    public static boolean valido(String valor) {
        if (valor == null) return false;
        String digitos = valor.replaceAll("[^0-9]", "");
        if (digitos.length() == 11) return cpfValido(digitos);
        if (digitos.length() == 14) return cnpjValido(digitos);
        return false;
    }

    private static boolean todosIguais(String digitos) {
        char primeiro = digitos.charAt(0);
        for (int i = 1; i < digitos.length(); i++) {
            if (digitos.charAt(i) != primeiro) return false;
        }
        return true;
    }

    private static int calcularDigito(String base, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (base.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    private static boolean cpfValido(String cpf) {
        if (todosIguais(cpf)) return false;
        int digito1 = calcularDigito(cpf, new int[]{10, 9, 8, 7, 6, 5, 4, 3, 2});
        int digito2 = calcularDigito(cpf.substring(0, 9) + digito1, new int[]{11, 10, 9, 8, 7, 6, 5, 4, 3, 2});
        return cpf.equals(cpf.substring(0, 9) + digito1 + digito2);
    }

    private static boolean cnpjValido(String cnpj) {
        if (todosIguais(cnpj)) return false;
        int digito1 = calcularDigito(cnpj, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        int digito2 = calcularDigito(cnpj.substring(0, 12) + digito1, new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        return cnpj.equals(cnpj.substring(0, 12) + digito1 + digito2);
    }
}
