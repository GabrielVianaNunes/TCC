package com.zeiss.pilot.config;

import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.repository.MaquinaRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MaquinaDataInitializer {

    @Autowired
    private MaquinaRepository maquinaRepository;

    @PostConstruct
    public void initMachines() {
        if (maquinaRepository.count() > 0) return;

        maquinaRepository.save(build(
            "Zeiss Duramax HTG", "Duramax HTG", "Medição por Coordenadas (CMM)",
            "700 x 700 x 600 mm", "Carl Zeiss", 2019, "CMM-001", "Ativa"
        ));
        maquinaRepository.save(build(
            "Zeiss O-Inspect 863", "O-Inspect", "Multi-sensor Óptico",
            "300 x 200 x 200 mm", "Carl Zeiss", 2021, "CMM-002", "Ativa"
        ));
        maquinaRepository.save(build(
            "Zeiss Bosello MAX", "Bosello MAX", "Tomografia Computadorizada (CT)",
            "Ø 520 x 1.200 mm", "Carl Zeiss", 2022, "CT-001", "Ativa"
        ));
        maquinaRepository.save(build(
            "Zeiss Prismo Standard", "Prismo Standard", "Medição por Coordenadas (CMM)",
            "700 x 1.000 x 600 mm", "Carl Zeiss", 2020, "CMM-003", "Manutenção"
        ));

        System.out.println("[INIT] 4 máquinas cadastradas.");
    }

    private Maquina build(String nome, String modelo, String tipoMedida,
                          String volume, String fabricante, int ano,
                          String patrimonio, String status) {
        Maquina m = new Maquina();
        m.setNome(nome);
        m.setModelo(modelo);
        m.setTipoMedida(tipoMedida);
        m.setVolumeMedicao(volume);
        m.setFabricante(fabricante);
        m.setAnoInstalacao(ano);
        m.setPatrimonioId(patrimonio);
        m.setStatus(status);
        m.setLigada(false);
        return m;
    }
}
