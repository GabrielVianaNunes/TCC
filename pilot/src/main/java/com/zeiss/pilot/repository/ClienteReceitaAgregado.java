package com.zeiss.pilot.repository;

import java.math.BigDecimal;

public interface ClienteReceitaAgregado {
    Long getClienteId();
    BigDecimal getReceita();
    Long getQtd();
}
