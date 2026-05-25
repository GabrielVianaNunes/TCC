package com.zeiss.pilot.service;

import com.zeiss.pilot.dto.AgendamentoMaquinaDTO;
import com.zeiss.pilot.dto.ManutencaoMaquinaDTO;
import com.zeiss.pilot.dto.MaquinaDTO;
import com.zeiss.pilot.dto.SessaoMaquinaDTO;
import com.zeiss.pilot.entity.AgendamentoMaquina;
import com.zeiss.pilot.entity.Maquina;
import com.zeiss.pilot.entity.ManutencaoMaquina;
import com.zeiss.pilot.entity.SessaoMaquina;
import com.zeiss.pilot.repository.AgendamentoMaquinaRepository;
import com.zeiss.pilot.repository.MaquinaRepository;
import com.zeiss.pilot.repository.ManutencaoMaquinaRepository;
import com.zeiss.pilot.repository.SessaoMaquinaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaquinaService {

    @Autowired
    private MaquinaRepository maquinaRepository;
    @Autowired
    private SessaoMaquinaRepository sessaoRepository;
    @Autowired
    private ManutencaoMaquinaRepository manutencaoRepository;
    @Autowired
    private AgendamentoMaquinaRepository agendamentoRepository;

    public List<MaquinaDTO> listar() {
        return maquinaRepository.findAll().stream()
                .map(MaquinaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public MaquinaDTO buscarPorId(Long id) {
        return MaquinaDTO.fromEntity(maquinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Máquina não encontrada: " + id)));
    }

    public MaquinaDTO salvar(MaquinaDTO dto) {
        return MaquinaDTO.fromEntity(maquinaRepository.save(dto.toEntity()));
    }

    public MaquinaDTO atualizar(Long id, MaquinaDTO dto) {
        maquinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Máquina não encontrada: " + id));
        Maquina entity = dto.toEntity();
        entity.setId(id);
        return MaquinaDTO.fromEntity(maquinaRepository.save(entity));
    }

    public void deletar(Long id) {
        maquinaRepository.deleteById(id);
    }

    // Sessões

    public List<SessaoMaquinaDTO> listarSessoes(Long maquinaId) {
        return sessaoRepository.findByMaquinaId(maquinaId).stream()
                .map(SessaoMaquinaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public SessaoMaquinaDTO criarSessao(Long maquinaId, SessaoMaquinaDTO dto) {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Máquina não encontrada: " + maquinaId));
        SessaoMaquina s = new SessaoMaquina();
        s.setMaquina(maquina);
        s.setUsuario(dto.getUsuario());
        s.setDataLigada(dto.getDataLigada());
        s.setDataDesligada(dto.getDataDesligada());
        s.setHorasUso(dto.getHorasUso());
        s.setMotivo(dto.getMotivo());
        s.setObservacao(dto.getObservacao());
        return SessaoMaquinaDTO.fromEntity(sessaoRepository.save(s));
    }

    public SessaoMaquinaDTO atualizarSessao(Long id, SessaoMaquinaDTO dto) {
        SessaoMaquina existing = sessaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sessão não encontrada: " + id));
        existing.setUsuario(dto.getUsuario());
        existing.setDataLigada(dto.getDataLigada());
        existing.setDataDesligada(dto.getDataDesligada());
        existing.setHorasUso(dto.getHorasUso());
        existing.setMotivo(dto.getMotivo());
        existing.setObservacao(dto.getObservacao());
        return SessaoMaquinaDTO.fromEntity(sessaoRepository.save(existing));
    }

    public void deletarSessao(Long id) {
        sessaoRepository.deleteById(id);
    }

    // Manutenções

    public List<ManutencaoMaquinaDTO> listarManutencoes(Long maquinaId) {
        return manutencaoRepository.findByMaquinaId(maquinaId).stream()
                .map(ManutencaoMaquinaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ManutencaoMaquinaDTO criarManutencao(Long maquinaId, ManutencaoMaquinaDTO dto) {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Máquina não encontrada: " + maquinaId));
        ManutencaoMaquina m = new ManutencaoMaquina();
        m.setMaquina(maquina);
        m.setTipo(dto.getTipo());
        m.setResponsavel(dto.getResponsavel());
        m.setData(dto.getData());
        m.setProximaData(dto.getProximaData());
        m.setStatus(dto.getStatus());
        m.setObservacao(dto.getObservacao());
        return ManutencaoMaquinaDTO.fromEntity(manutencaoRepository.save(m));
    }

    public ManutencaoMaquinaDTO atualizarManutencao(Long id, ManutencaoMaquinaDTO dto) {
        ManutencaoMaquina existing = manutencaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Manutenção não encontrada: " + id));
        existing.setTipo(dto.getTipo());
        existing.setResponsavel(dto.getResponsavel());
        existing.setData(dto.getData());
        existing.setProximaData(dto.getProximaData());
        existing.setStatus(dto.getStatus());
        existing.setObservacao(dto.getObservacao());
        return ManutencaoMaquinaDTO.fromEntity(manutencaoRepository.save(existing));
    }

    public void deletarManutencao(Long id) {
        manutencaoRepository.deleteById(id);
    }

    // Agendamentos

    public List<AgendamentoMaquinaDTO> listarAgendamentos(Long maquinaId) {
        return agendamentoRepository.findByMaquinaId(maquinaId).stream()
                .map(AgendamentoMaquinaDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public AgendamentoMaquinaDTO criarAgendamento(Long maquinaId, AgendamentoMaquinaDTO dto) {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Máquina não encontrada: " + maquinaId));
        AgendamentoMaquina a = new AgendamentoMaquina();
        a.setMaquina(maquina);
        a.setUsuario(dto.getUsuario());
        a.setDataInicio(dto.getDataInicio());
        a.setDataFim(dto.getDataFim());
        a.setMotivo(dto.getMotivo());
        a.setConfirmado(dto.isConfirmado());
        return AgendamentoMaquinaDTO.fromEntity(agendamentoRepository.save(a));
    }

    public AgendamentoMaquinaDTO atualizarAgendamento(Long id, AgendamentoMaquinaDTO dto) {
        AgendamentoMaquina existing = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado: " + id));
        existing.setUsuario(dto.getUsuario());
        existing.setDataInicio(dto.getDataInicio());
        existing.setDataFim(dto.getDataFim());
        existing.setMotivo(dto.getMotivo());
        existing.setConfirmado(dto.isConfirmado());
        return AgendamentoMaquinaDTO.fromEntity(agendamentoRepository.save(existing));
    }

    public void deletarAgendamento(Long id) {
        agendamentoRepository.deleteById(id);
    }
}
