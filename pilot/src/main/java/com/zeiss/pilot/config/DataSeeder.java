package com.zeiss.pilot.config;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.context.annotation.Configuration;

import com.zeiss.pilot.dto.AgendamentoMaquinaDTO;
import com.zeiss.pilot.dto.AmostraDTO;
import com.zeiss.pilot.dto.AvaliacaoDTO;
import com.zeiss.pilot.dto.ClienteDTO;
import com.zeiss.pilot.dto.EditalDTO;
import com.zeiss.pilot.dto.EstagiarioDTO;
import com.zeiss.pilot.dto.EventoDTO;
import com.zeiss.pilot.dto.ItemAlmoxarifadoDTO;
import com.zeiss.pilot.dto.KanbanCardDTO;
import com.zeiss.pilot.dto.ManutencaoMaquinaDTO;
import com.zeiss.pilot.dto.MovimentacaoAlmoxarifadoDTO;
import com.zeiss.pilot.dto.NotaEstagiarioDTO;
import com.zeiss.pilot.dto.ProjetoDTO;
import com.zeiss.pilot.dto.ServicoDTO;
import com.zeiss.pilot.dto.SessaoMaquinaDTO;
import com.zeiss.pilot.dto.VerificacaoAmbientalDTO;
import com.zeiss.pilot.dto.VisitaTecnicaDTO;
import com.zeiss.pilot.entity.Estagiario;
import com.zeiss.pilot.entity.Evento;
import com.zeiss.pilot.entity.Usuario;
import com.zeiss.pilot.repository.ClienteRepository;
import com.zeiss.pilot.repository.EstagiarioRepository;
import com.zeiss.pilot.repository.EventoRepository;
import com.zeiss.pilot.repository.KanbanCardRepository;
import com.zeiss.pilot.repository.UsuarioRepository;
import com.zeiss.pilot.service.AlmoxarifadoService;
import com.zeiss.pilot.service.AmostraService;
import com.zeiss.pilot.service.AvaliacaoService;
import com.zeiss.pilot.service.ClienteService;
import com.zeiss.pilot.service.EditalService;
import com.zeiss.pilot.service.EstagiarioService;
import com.zeiss.pilot.service.EventoService;
import com.zeiss.pilot.service.KanbanCardService;
import com.zeiss.pilot.service.MaquinaService;
import com.zeiss.pilot.service.NotaEstagiarioService;
import com.zeiss.pilot.service.ProjetoService;
import com.zeiss.pilot.service.ServicoService;
import com.zeiss.pilot.service.UsuarioService;
import com.zeiss.pilot.service.VerificacaoAmbientalService;
import com.zeiss.pilot.service.VisitaTecnicaService;

import jakarta.annotation.PostConstruct;

/**
 * Seeder de dados de avaliação (dev local). Roda uma única vez — pula se já
 * existir algum Cliente, então é seguro reiniciar a aplicação várias vezes.
 * Passa por Service (nunca grava direto via SQL) para que hashing de senha,
 * criptografia de CPF/CNPJ/endereço (CryptoConverter) e geração de código OS
 * aconteçam exatamente como aconteceriam via a UI.
 */
@Configuration
public class DataSeeder {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstagiarioRepository estagiarioRepository;
    private final EventoRepository eventoRepository;
    private final KanbanCardRepository kanbanCardRepository;

    private final UsuarioService usuarioService;
    private final ClienteService clienteService;
    private final ServicoService servicoService;
    private final EstagiarioService estagiarioService;
    private final AmostraService amostraService;
    private final VisitaTecnicaService visitaTecnicaService;
    private final EventoService eventoService;
    private final ProjetoService projetoService;
    private final EditalService editalService;
    private final KanbanCardService kanbanCardService;
    private final NotaEstagiarioService notaEstagiarioService;
    private final AvaliacaoService avaliacaoService;
    private final AlmoxarifadoService almoxarifadoService;
    private final MaquinaService maquinaService;
    private final VerificacaoAmbientalService verificacaoAmbientalService;

    public DataSeeder(ClienteRepository clienteRepository, UsuarioRepository usuarioRepository,
            EstagiarioRepository estagiarioRepository, EventoRepository eventoRepository,
            KanbanCardRepository kanbanCardRepository,
            UsuarioService usuarioService, ClienteService clienteService, ServicoService servicoService,
            EstagiarioService estagiarioService, AmostraService amostraService,
            VisitaTecnicaService visitaTecnicaService, EventoService eventoService, ProjetoService projetoService,
            EditalService editalService, KanbanCardService kanbanCardService,
            NotaEstagiarioService notaEstagiarioService, AvaliacaoService avaliacaoService,
            AlmoxarifadoService almoxarifadoService, MaquinaService maquinaService,
            VerificacaoAmbientalService verificacaoAmbientalService) {
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.estagiarioRepository = estagiarioRepository;
        this.eventoRepository = eventoRepository;
        this.kanbanCardRepository = kanbanCardRepository;
        this.usuarioService = usuarioService;
        this.clienteService = clienteService;
        this.servicoService = servicoService;
        this.estagiarioService = estagiarioService;
        this.amostraService = amostraService;
        this.visitaTecnicaService = visitaTecnicaService;
        this.eventoService = eventoService;
        this.projetoService = projetoService;
        this.editalService = editalService;
        this.kanbanCardService = kanbanCardService;
        this.notaEstagiarioService = notaEstagiarioService;
        this.avaliacaoService = avaliacaoService;
        this.almoxarifadoService = almoxarifadoService;
        this.maquinaService = maquinaService;
        this.verificacaoAmbientalService = verificacaoAmbientalService;
    }

    @PostConstruct
    public void seed() {
        if (clienteRepository.count() > 0) {
            return; // já semeado
        }

        Usuario admin = usuarioRepository.findByEmail("admin@zeiss.com")
                .orElseThrow(() -> new IllegalStateException("Admin de bootstrap não encontrado."));

        Usuario gestor = criarUsuario("Camila Duarte", "gestor.camila@zeiss.com", "GESTOR", admin);
        Usuario tecnicoRafael = criarUsuario("Rafael Nogueira", "tecnico.rafael@zeiss.com", "TECNICO", admin);
        Usuario tecnicoBeatriz = criarUsuario("Beatriz Lima", "tecnico.beatriz@zeiss.com", "TECNICO", admin);
        Usuario usuarioLucas = criarUsuario("Lucas Tavares", "estagiario.lucas@zeiss.com", "ESTAGIARIO", admin);
        Usuario usuarioMarina = criarUsuario("Marina Alves", "estagiario.marina@zeiss.com", "ESTAGIARIO", admin);

        Estagiario estagiarioLucas = criarEstagiario("Lucas Tavares", "Metrologia Dimensional", "Manhã",
                "Prof. Eduardo Castilho", "estagiario.lucas@zeiss.com", usuarioLucas);
        Estagiario estagiarioMarina = criarEstagiario("Marina Alves", "Qualidade e Metrologia", "Tarde",
                "Profa. Helena Brandão", "estagiario.marina@zeiss.com", usuarioMarina);

        Long cliRoberto = criarCliente("Roberto Castro Andrade", cpfValido(123456789),
                "Rua das Acácias, 245 - Vila Mariana, São Paulo/SP", "(11) 98211-3344", "roberto.andrade@gmail.com");
        Long cliFernanda = criarCliente("Fernanda Souza Ribeiro", cpfValido(234567890),
                "Av. Getúlio Vargas, 1120 - Centro, Joinville/SC", "(47) 99123-5566", "fernanda.ribeiro@outlook.com");
        Long cliWeg = criarCliente("WEG Equipamentos Elétricos S.A.", cnpjValido(84429740L),
                "Av. Prefeito Waldemar Grubba, 3000 - Jaraguá do Sul/SC", "(47) 3276-4000", "compras@weg.net");
        Long cliBosello = criarCliente("Metalúrgica Bosello Ltda", cnpjValido(61526944L),
                "Rua Industrial, 500 - Distrito Industrial, Sorocaba/SP", "(15) 3223-7788", "contato@bosello.com.br");
        Long cliRomi = criarCliente("Indústrias Romi S.A.", cnpjValido(56594696L),
                "Av. Doutor Theodureto de Almeida Camargo, 1600 - Santa Bárbara d'Oeste/SP", "(19) 3455-9000",
                "suprimentos@romi.com");

        // Serviços (pipeline comercial de OS) — status seguem o CHECK da tabela.
        criarServico(cliRoberto, 1L, 4L, 1, "Venda finalizada", "Rafael Nogueira",
                new BigDecimal("3200.00"), LocalDate.now().minusDays(20), LocalDate.now().minusDays(15),
                "Calibração concluída dentro do prazo, laudo entregue ao cliente.");
        criarServico(cliFernanda, 2L, 8L, 1, "Negociação", "Beatriz Lima",
                new BigDecimal("2750.00"), LocalDate.now().plusDays(5), null,
                "Cliente avaliando proposta para digitalização 3D de peça única.");
        criarServico(cliWeg, 3L, 12L, 3, "Venda finalizada", "Rafael Nogueira",
                new BigDecimal("18900.00"), LocalDate.now().minusDays(10), LocalDate.now().minusDays(6),
                "Lote de 3 peças fundidas — tomografia computadorizada, sem porosidade crítica.");
        criarServico(cliBosello, 1L, 1L, 2, "Elaboração de proposta", "Beatriz Lima",
                new BigDecimal("4500.00"), LocalDate.now().plusDays(12), null,
                "Aguardando definição de norma de referência com o cliente.");
        criarServico(cliRomi, 4L, 4L, 1, "Visita", "Rafael Nogueira",
                new BigDecimal("6200.00"), LocalDate.now().plusDays(3), null,
                "Verificação geométrica GD&T em componente de usinagem de precisão.");
        criarServico(cliWeg, 2L, 9L, 5, "Venda finalizada", "Beatriz Lima",
                new BigDecimal("9800.00"), LocalDate.now().minusDays(30), LocalDate.now().minusDays(25),
                "Digitalização 3D de série de peças para engenharia reversa.");
        criarServico(cliRoberto, 3L, 15L, 1, "1º Contato", "Rafael Nogueira",
                new BigDecimal("5400.00"), LocalDate.now().plusDays(20), null,
                "Primeiro contato — análise de porosidade em peça de fundição.");
        criarServico(cliRomi, 1L, 2L, 1, "Desistiu", "Beatriz Lima",
                new BigDecimal("2100.00"), LocalDate.now().minusDays(8), null,
                "Cliente optou por realizar o serviço internamente.");

        // Amostras (cadeia de custódia)
        criarAmostra(gestor, cliRoberto, "Bloco padrão 50mm classe 1 para verificação de CMM", 2, "unidade",
                "Em custódia", "Entregadora", "Roberto Andrade", "roberto.andrade@gmail.com",
                List.of("Calibração de padrões dimensionais"));
        criarAmostra(tecnicoRafael, cliWeg, "Carcaça de motor elétrico fundida, lote piloto", 3, "unidade",
                "Em custódia", "Motoboy", "Setor de Qualidade WEG", "qualidade@weg.net",
                List.of("Análise de porosidade e inclusões"));
        criarAmostra(tecnicoBeatriz, cliBosello, "Engrenagem usinada para verificação GD&T", 5, "unidade",
                "Devolvida", "Pessoalmente", "Marcos Bosello", "contato@bosello.com.br",
                List.of("Verificação dimensional e geométrica (GD&T)"));
        criarAmostra(usuarioLucas, cliRomi,
                "Componente prismático para digitalização óptica", 1, "unidade", "Em custódia", "Correios",
                "Setor de Engenharia Romi", "suprimentos@romi.com", List.of("Digitalização 3D de peças"));

        // Visitas técnicas
        criarVisita(gestor, true, null, LocalDate.now().minusDays(15), LocalDate.now().minusDays(10), true, 25,
                "Auditório do CEM SENAI Zeiss", "(11) 4002-8922", "Visita de turma técnica do SENAI.");
        criarVisita(tecnicoRafael, false, cliWeg, LocalDate.now().minusDays(5), LocalDate.now().minusDays(2), true,
                4, "Planta WEG - Jaraguá do Sul/SC", "(47) 3276-4000", "Apresentação de capacidade de CT.");
        criarVisita(gestor, true, null, LocalDate.now().plusDays(7), null, false, 15,
                "Auditório do CEM SENAI Zeiss", "(11) 4002-8922", "Visita agendada de escola parceira.");
        criarVisita(tecnicoBeatriz, false, cliRomi, LocalDate.now().plusDays(10), null, false, 3,
                "Planta Romi - Santa Bárbara d'Oeste/SP", "(19) 3455-9000", "Visita técnica para prospecção de contrato.");

        // Eventos institucionais
        criarEvento(gestor, "Semana da Metrologia 2026", "Palestras e demonstrações práticas de CMM e CT.",
                LocalDate.now().minusDays(40), "09:00", "Auditório do CEM SENAI Zeiss", 80, 62,
                "Evento com boa adesão do público técnico local.");
        criarEvento(gestor, "Workshop de Tomografia Industrial", "Workshop prático com fabricantes parceiros.",
                LocalDate.now().minusDays(15), "14:00", "Laboratório de CT", 30, 27,
                "Participantes elogiaram o conteúdo técnico.");
        criarEvento(gestor, "Feira de Estágios SENAI", "Divulgação do CEM para futuros estagiários.",
                LocalDate.now().plusDays(20), "10:00", "Pátio Central SENAI", 200, 0,
                "Evento futuro — inscrições em andamento.");
        criarEvento(gestor, "Visita técnica ABNT", "Reunião de alinhamento de normas técnicas.",
                LocalDate.now().minusDays(60), "13:30", "Sala de Reuniões CEM", 12, 10,
                "Discussão sobre atualização de normas de calibração.");

        // Projetos internos
        criarProjeto(gestor, "Expansão do laboratório de CT", "Aumentar capacidade de tomografia computadorizada",
                "Aquisição de equipamento, treinamento de equipe, validação de processo", "Alta",
                new BigDecimal("450000.00"), new BigDecimal("780000.00"), "Em andamento",
                LocalDate.now().minusMonths(3), LocalDate.now().plusMonths(9), null,
                "Projeto prioritário para 2026, aprovado em comitê.");
        criarProjeto(gestor, "Certificação ISO 17025 - escopo CMM", "Ampliar escopo de acreditação",
                "Documentação de procedimentos, auditoria interna, auditoria externa", "Alta",
                new BigDecimal("120000.00"), new BigDecimal("300000.00"), "Pendente autorização",
                LocalDate.now().plusMonths(1), LocalDate.now().plusMonths(10), null,
                "Aguardando aprovação orçamentária da diretoria.");
        criarProjeto(gestor, "Programa de capacitação de estagiários", "Padronizar treinamento técnico inicial",
                "Criação de trilha de aprendizagem, material didático, avaliações", "Média",
                new BigDecimal("35000.00"), new BigDecimal("60000.00"), "Concluído",
                LocalDate.now().minusMonths(8), LocalDate.now().minusMonths(2), LocalDate.now().minusMonths(2),
                "Programa implantado com sucesso, primeira turma formada.");

        // Editais
        criarEdital("Edital FINEP Inovação Industrial 2026", "FINEP", "SENAI Nacional", "Em execução",
                new BigDecimal("890000.00"), "Recursos para modernização do parque de metrologia.");
        criarEdital("Edital SEBRAE Tecnologia para Indústria", "SEBRAE", null, "Aguardando resultado",
                new BigDecimal("150000.00"), "Submetido em parceria com associação de indústrias local.");
        criarEdital("Edital FAPESP Equipamentos Multiusuário", "FAPESP", "Universidade Parceira", "Concluído",
                new BigDecimal("620000.00"), "Recurso já liberado, equipamento em processo de instalação.");

        // Kanban — atividades de estagiário, técnico e gestor. Coluna e
        // prioridade usam os slugs do board (backlog/em-andamento/revisao/
        // concluido, baixa/media/alta/urgente) — não os rótulos exibidos.
        criarCardEstagiario(estagiarioLucas.getId(), "Organizar arquivo de laudos de CMM",
                "Reorganizar pasta digital de laudos emitidos no último trimestre.", "backlog", "media",
                LocalDate.now().plusDays(5), List.of("organização"), admin);
        criarCardEstagiario(estagiarioMarina.getId(), "Apoiar recebimento de amostras",
                "Auxiliar o técnico responsável no recebimento e registro de amostras.", "em-andamento", "alta",
                LocalDate.now().plusDays(2), List.of("amostras", "recebimento"), admin);
        criarCardUsuario(tecnicoRafael.getId(), "Calibrar CMM Duramax HTG",
                "Executar calibração programada da máquina 1.", "em-andamento", "alta", LocalDate.now().plusDays(1),
                List.of("calibração"), admin);
        criarCardUsuario(tecnicoBeatriz.getId(), "Revisar laudo de tomografia WEG",
                "Revisão técnica final antes do envio ao cliente.", "backlog", "alta", LocalDate.now().plusDays(3),
                List.of("laudo", "revisão"), admin);
        criarCardUsuario(gestor.getId(), "Preparar apresentação para diretoria",
                "Consolidar indicadores do trimestre para reunião de diretoria.", "backlog", "media",
                LocalDate.now().plusDays(7), List.of("gestão"), admin);
        criarCardEstagiario(estagiarioLucas.getId(), "Atualizar planilha de estoque do almoxarifado",
                "Conferir quantidades físicas e atualizar sistema.", "concluido", "baixa",
                LocalDate.now().minusDays(3), List.of("almoxarifado"), admin);

        // Notas de estagiário (escala 1 a 5, conforme o modal "Nota do Diretor")
        criarNota(estagiarioLucas.getId(), null, 5, "Muito proativo no apoio às atividades de calibração.",
                "Rafael Nogueira", LocalDate.now().minusDays(10));
        criarNota(estagiarioMarina.getId(), null, 4, "Boa organização no recebimento de amostras.",
                "Beatriz Lima", LocalDate.now().minusDays(5));
        criarNota(estagiarioLucas.getId(), null, 5, "Excelente atenção a detalhes em relatórios técnicos.",
                "Camila Duarte", LocalDate.now().minusDays(1));

        // Avaliações públicas (NPS)
        criarAvaliacao("Cliente", "Sim", "Calibração de CMM", 10,
                "Excelente atendimento, equipe muito atenciosa e prazo cumprido à risca.",
                LocalDateTime.now().minusDays(12));
        criarAvaliacao("Cliente", "Sim", "Tomografia computadorizada", 9,
                "Ótimo serviço, recomendo para análise de porosidade.", LocalDateTime.now().minusDays(8));
        criarAvaliacao("Visitante", "Não respondeu", "", 8,
                "Achei o laboratório muito bem equipado, parabéns pela estrutura.",
                LocalDateTime.now().minusDays(20));
        criarAvaliacao("Cliente", "Sim", "Verificação dimensional", 4,
                "Tive um problema de demora na entrega do laudo, poderia ser mais rápido.",
                LocalDateTime.now().minusDays(3));
        criarAvaliacao("Estudante do sistema S", "Não respondeu", "", 9,
                "Visita técnica muito esclarecedora, sugiro incluir mais demonstrações práticas.",
                LocalDateTime.now().minusDays(30));
        criarAvaliacao("Colaborador da Zeiss", "Não", "", 7, "", LocalDateTime.now().minusDays(1));

        // Almoxarifado
        Long itemLuva = criarItemAlmoxarifado("Luva de procedimento nitrílica", "EPI", "caixa", 40, 10,
                "Armário A1", "Uso obrigatório no manuseio de peças.");
        Long itemPano = criarItemAlmoxarifado("Pano microfibra antiestático", "Consumíveis", "unidade", 60, 20,
                "Armário A2", "Usado na limpeza de peças antes de medição.");
        Long itemEsfera = criarItemAlmoxarifado("Esfera de referência 25mm", "Padrões", "unidade", 8, 2,
                "Cofre de padrões", "Padrão rastreável RBC.");
        criarItemAlmoxarifado("Álcool isopropílico 99%", "Consumíveis", "litro", 15, 5, "Armário Químico",
                "Uso restrito a técnicos treinados.");
        criarItemAlmoxarifado("Etiqueta de identificação de amostra", "Consumíveis", "pacote", 25, 5,
                "Gaveta B3", "Etiquetas com QR code para rastreabilidade.");

        registrarMovimentacao(itemLuva, "entrada", 20, "Beatriz Lima", "Reposição mensal de estoque",
                LocalDateTime.now().minusDays(25));
        registrarMovimentacao(itemLuva, "saida", 8, "Rafael Nogueira", "Uso em recebimento de amostras",
                LocalDateTime.now().minusDays(5));
        registrarMovimentacao(itemPano, "entrada", 30, "Beatriz Lima", "Reposição trimestral", LocalDateTime.now().minusDays(40));
        registrarMovimentacao(itemPano, "saida", 10, "Marina Alves", "Limpeza de peças para CMM", LocalDateTime.now().minusDays(2));
        registrarMovimentacao(itemEsfera, "saida", 1, "Rafael Nogueira", "Verificação de calibração", LocalDateTime.now().minusDays(15));

        // Máquinas — sessões, manutenções e agendamentos (máquinas 1 a 4 já existem)
        criarSessaoMaquina(1L, "Rafael Nogueira", LocalDateTime.now().minusDays(20).withHour(8),
                LocalDateTime.now().minusDays(20).withHour(12), 4.0, "Calibração programada");
        criarSessaoMaquina(2L, "Beatriz Lima", LocalDateTime.now().minusDays(6).withHour(9),
                LocalDateTime.now().minusDays(6).withHour(17), 8.0, "Digitalização 3D de lote");
        criarSessaoMaquina(3L, "Rafael Nogueira", LocalDateTime.now().minusDays(10).withHour(8),
                LocalDateTime.now().minusDays(10).withHour(14), 6.0, "Tomografia de peças WEG");

        criarManutencaoMaquina(1L, "Revisão Geral", "Rafael Nogueira", LocalDate.now().minusMonths(2),
                LocalDate.now().plusMonths(4), "Concluída", "Revisão preventiva semestral.");
        criarManutencaoMaquina(4L, "Revisão de Ponteiras", "Beatriz Lima", LocalDate.now().minusDays(3), null,
                "Em andamento", "Substituição de ponteiras de contato.");
        criarManutencaoMaquina(2L, "Limpeza", "Marina Alves", LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(15), "Concluída", "Limpeza padrão de sensores ópticos.");

        criarAgendamentoMaquina(1L, "Rafael Nogueira", LocalDateTime.now().plusDays(2).withHour(8),
                LocalDateTime.now().plusDays(2).withHour(12), "Calibração de cliente WEG", true);
        criarAgendamentoMaquina(3L, "Beatriz Lima", LocalDateTime.now().plusDays(5).withHour(13),
                LocalDateTime.now().plusDays(5).withHour(17), "Tomografia de lote Romi", false);

        // Verificações ambientais
        criarVerificacaoAmbiental("Rafael Nogueira", "Manhã", 20.5, true, 45.0, true, "Ligado", null, "Nenhuma", false);
        criarVerificacaoAmbiental("Beatriz Lima", "Tarde", 21.2, true, 48.0, true, "Ligado", null, "Nenhuma", false);
        criarVerificacaoAmbiental("Marina Alves", "Noite", 23.8, false, 55.0, false, "Desligado",
                "Temperatura acima do limite ao final do expediente.", "Nenhuma", true);

        System.out.println("=".repeat(60));
        System.out.println("[SEED] Dados de avaliação criados com sucesso.");
        System.out.println("[SEED] Contas de teste (senha para todas: Senha@123):");
        System.out.println("[SEED]   Gestor:     gestor.camila@zeiss.com");
        System.out.println("[SEED]   Tecnico:    tecnico.rafael@zeiss.com / tecnico.beatriz@zeiss.com");
        System.out.println("[SEED]   Estagiario: estagiario.lucas@zeiss.com / estagiario.marina@zeiss.com");
        System.out.println("=".repeat(60));
    }

    /**
     * Enriquece Kanban de Atividades e Dashboard de Estagiários com mais
     * volume, cobrindo as 4 colunas reais do board (backlog/em-andamento/
     * revisao/concluido) para cada papel, e mais notas do diretor para os
     * dois estagiários. Guarda própria (independente de seed()) para poder
     * rodar mesmo já com clientes cadastrados.
     */
    @PostConstruct
    public void seedKanbanEnriquecido() {
        if (kanbanCardRepository.count() >= 12) {
            return; // já enriquecido
        }

        Usuario admin = usuarioRepository.findByEmail("admin@zeiss.com").orElseThrow();
        Usuario gestor = usuarioRepository.findByEmail("gestor.camila@zeiss.com").orElseThrow();
        Usuario tecnicoRafael = usuarioRepository.findByEmail("tecnico.rafael@zeiss.com").orElseThrow();
        Usuario tecnicoBeatriz = usuarioRepository.findByEmail("tecnico.beatriz@zeiss.com").orElseThrow();
        Usuario usuarioLucas = usuarioRepository.findByEmail("estagiario.lucas@zeiss.com").orElseThrow();
        Usuario usuarioMarina = usuarioRepository.findByEmail("estagiario.marina@zeiss.com").orElseThrow();
        Estagiario estagiarioLucas = estagiarioRepository.findByUsuarioId(usuarioLucas.getId()).orElseThrow();
        Estagiario estagiarioMarina = estagiarioRepository.findByUsuarioId(usuarioMarina.getId()).orElseThrow();

        // Lucas — cobre as 4 colunas, incluindo uma atrasada (prazo no passado, fora de "concluido")
        criarCardEstagiario(estagiarioLucas.getId(), "Auditar rastreabilidade de padrões dimensionais",
                "Conferir certificados de calibração dos blocos padrão em uso.", "revisao", "alta",
                LocalDate.now().minusDays(2), List.of("padrões", "auditoria"), admin);
        criarCardEstagiario(estagiarioLucas.getId(), "Fotografar peças recebidas para o relatório mensal",
                "Padronizar registro fotográfico de amostras recebidas.", "backlog", "baixa",
                LocalDate.now().plusDays(9), List.of("amostras"), admin);
        criarCardEstagiario(estagiarioLucas.getId(), "Apoiar calibração de CMM com técnico Rafael",
                "Acompanhar e registrar procedimento de calibração.", "concluido", "media",
                LocalDate.now().minusDays(6), List.of("calibração"), admin);

        // Marina — cobre as 4 colunas
        criarCardEstagiario(estagiarioMarina.getId(), "Atualizar planilha de amostras em custódia",
                "Conferir prazos de devolução e sinalizar pendências.", "backlog", "urgente",
                LocalDate.now().plusDays(1), List.of("amostras"), admin);
        criarCardEstagiario(estagiarioMarina.getId(), "Revisar etiquetas de identificação do almoxarifado",
                "Conferir se todas as etiquetas têm QR code legível.", "revisao", "baixa",
                LocalDate.now().plusDays(4), List.of("almoxarifado"), admin);
        criarCardEstagiario(estagiarioMarina.getId(), "Apoiar organização do Workshop de Tomografia",
                "Auxiliar montagem de sala e materiais do evento.", "concluido", "media",
                LocalDate.now().minusDays(15), List.of("eventos"), admin);

        // Técnico Rafael
        criarCardUsuario(tecnicoRafael.getId(), "Emitir laudo de calibração — cliente Romi",
                "Preparar e revisar laudo técnico para envio.", "backlog", "alta", LocalDate.now().plusDays(4),
                List.of("laudo"), admin);
        criarCardUsuario(tecnicoRafael.getId(), "Verificar rastreabilidade da esfera de referência",
                "Conferir certificado RBC antes do próximo uso.", "revisao", "media", LocalDate.now().minusDays(1),
                List.of("padrões"), admin);
        criarCardUsuario(tecnicoRafael.getId(), "Calibração programada — máquina Bosello MAX",
                "Executar checklist padrão de calibração trimestral.", "concluido", "alta",
                LocalDate.now().minusDays(12), List.of("calibração"), admin);

        // Técnico Beatriz
        criarCardUsuario(tecnicoBeatriz.getId(), "Revisar digitalização 3D — lote WEG",
                "Conferir malha digitalizada antes da comparação com CAD.", "em-andamento", "alta",
                LocalDate.now().plusDays(2), List.of("digitalização"), admin);
        criarCardUsuario(tecnicoBeatriz.getId(), "Treinamento de nova estagiária na CMM",
                "Acompanhar Marina em primeira operação assistida.", "concluido", "media",
                LocalDate.now().minusDays(20), List.of("treinamento"), admin);

        // Gestor Camila
        criarCardUsuario(gestor.getId(), "Revisar proposta comercial — cliente Bosello",
                "Validar valores e prazo antes do envio ao cliente.", "em-andamento", "urgente",
                LocalDate.now().plusDays(1), List.of("comercial"), admin);
        criarCardUsuario(gestor.getId(), "Fechar indicadores do trimestre para diretoria",
                "Consolidar KPIs de OS, amostras e eventos.", "concluido", "alta", LocalDate.now().minusDays(4),
                List.of("gestão"), admin);

        // Mais notas do diretor para os dois estagiários (escala 1 a 5)
        criarNota(estagiarioLucas.getId(), 1L, 5, "Ótimo apoio na auditoria de padrões dimensionais.",
                "Beatriz Lima", LocalDate.now().minusDays(6));
        criarNota(estagiarioLucas.getId(), null, 4, "Precisa melhorar a organização dos registros fotográficos.",
                "Camila Duarte", LocalDate.now().minusDays(15));
        criarNota(estagiarioMarina.getId(), null, 5, "Excelente apoio na organização do workshop.",
                "Rafael Nogueira", LocalDate.now().minusDays(14));
        criarNota(estagiarioMarina.getId(), 6L, 4, "Boa atenção às pendências de devolução de amostras.",
                "Camila Duarte", LocalDate.now().minusDays(2));

        System.out.println("[SEED] Kanban de Atividades e Dashboard de Estagiários enriquecidos.");
    }

    // ---------------------------------------------------------------- Usuarios

    private Usuario criarUsuario(String nome, String email, String cargo, Usuario chamador) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha("Senha@123");
        u.setCargo(cargo);
        usuarioService.criarUsuario(u, chamador);
        return usuarioRepository.findByEmail(email).orElseThrow();
    }

    private Estagiario criarEstagiario(String nome, String area, String turno, String orientador, String email,
            Usuario usuarioVinculado) {
        EstagiarioDTO dto = new EstagiarioDTO();
        dto.setNome(nome);
        dto.setArea(area);
        dto.setTurno(turno);
        dto.setOrientador(orientador);
        dto.setInicioEstagio(LocalDate.now().minusMonths(4));
        dto.setEmail(email);
        dto.setAtivo(true);
        EstagiarioDTO salvo = estagiarioService.salvar(dto);
        Estagiario entidade = estagiarioRepository.findById(salvo.getId()).orElseThrow();
        entidade.setUsuario(usuarioVinculado);
        return estagiarioRepository.save(entidade);
    }

    // ----------------------------------------------------------------- Clientes

    private Long criarCliente(String nome, String cpfOuCnpj, String endereco, String telefone, String email) {
        ClienteDTO dto = new ClienteDTO();
        dto.setNome(nome);
        dto.setCpfOuCnpj(cpfOuCnpj);
        dto.setEndereco(endereco);
        dto.setTelefone(telefone);
        dto.setEmail(email);
        return clienteService.criar(dto).getId();
    }

    // ----------------------------------------------------------------- Servicos

    private void criarServico(Long clienteId, Long maquinaId, Long tipoServicoId, int quantidade, String status,
            String tecnicoResponsavel, BigDecimal valor, LocalDate dataPrevista, LocalDate dataRealizada,
            String observacao) {
        ServicoDTO dto = new ServicoDTO();
        dto.setClienteId(clienteId);
        dto.setMaquinaId(maquinaId);
        dto.setTipoServicoId(tipoServicoId);
        dto.setQuantidade(quantidade);
        dto.setStatus(status);
        dto.setTecnicoResponsavel(tecnicoResponsavel);
        dto.setValor(valor);
        dto.setDataPrevista(dataPrevista);
        dto.setDataRealizada(dataRealizada);
        dto.setObservacao(observacao);
        servicoService.criarServico(dto);
    }

    // ------------------------------------------------------------------ Amostra

    private void criarAmostra(Usuario responsavel, Long clienteId, String descricao, int quantidade, String unidade,
            String status, String formaRecebimento, String respEnvio, String telEmail, List<String> servicos) {
        AmostraDTO dto = new AmostraDTO();
        dto.setResponsavelId(responsavel.getId());
        dto.setClienteId(clienteId);
        dto.setDataEntrada(LocalDate.now().minusDays(7));
        dto.setHorario("09:30");
        dto.setFormaRecebimento(formaRecebimento);
        dto.setRespEnvio(respEnvio);
        dto.setTelEmail(telEmail);
        dto.setDescricao(descricao);
        dto.setQuantidade(quantidade);
        dto.setUnidade(unidade);
        dto.setDataDevPrevista(LocalDate.now().plusDays(10));
        dto.setTemDesenho(true);
        dto.setTemCAD(false);
        dto.setTemTolerancia(true);
        dto.setTemInstrucao(false);
        dto.setServicos(servicos);
        dto.setObjetivoCliente("Verificação de conformidade dimensional.");
        dto.setStatus(status);
        if ("Devolvida".equals(status)) {
            dto.setDataDevRealizada(LocalDate.now().minusDays(1));
        }
        amostraService.salvar(dto);
    }

    // ------------------------------------------------------------- VisitaTecnica

    private void criarVisita(Usuario responsavel, boolean interna, Long clienteId, LocalDate dataSolicitada,
            LocalDate dataAgendada, boolean realizada, int quantidadeVisitantes, String local, String telefones,
            String observacao) {
        VisitaTecnicaDTO dto = new VisitaTecnicaDTO();
        dto.setResponsavelId(responsavel.getId());
        dto.setVisitaInterna(interna);
        dto.setClienteId(interna ? null : clienteId);
        dto.setDataSolicitada(dataSolicitada);
        dto.setDataAgendada(dataAgendada);
        dto.setVisitaRealizada(realizada);
        dto.setQuantidadeVisitantes(quantidadeVisitantes);
        dto.setLocalVisita(local);
        dto.setTelefones(telefones);
        dto.setObservacao(observacao);
        visitaTecnicaService.criarVisita(dto);
    }

    // ------------------------------------------------------------------- Evento

    private void criarEvento(Usuario responsavel, String titulo, String descricao, LocalDate data, String horario,
            String local, int convidados, int presentes, String observacao) {
        EventoDTO dto = new EventoDTO();
        dto.setResponsavelId(responsavel.getId());
        dto.setTitulo(titulo);
        dto.setDescricao(descricao);
        dto.setData(data);
        dto.setHorario(horario);
        dto.setLocal(local);
        dto.setNumeroParticipantes(presentes);
        dto.setObservacao(observacao);
        EventoDTO salvo = eventoService.createEvento(dto);

        // numeroConvidados/numeroPresentes alimentam o cálculo de adesão do
        // relatório de eventos, mas o DTO/service do redesign não os expõe —
        // ajustamos direto na entidade para o dashboard mostrar dado real.
        Evento entidade = eventoRepository.findById(salvo.getId()).orElseThrow();
        entidade.setNumeroConvidados(convidados);
        entidade.setNumeroPresentes(presentes);
        eventoRepository.save(entidade);
    }

    // ------------------------------------------------------------------ Projeto

    private void criarProjeto(Usuario responsavel, String nomeProjeto, String objetivo, String atividades,
            String prioridade, BigDecimal custo, BigDecimal retorno, String status, LocalDate previsaoInicio,
            LocalDate previsaoTermino, LocalDate dataRealFinalizacao, String observacao) {
        ProjetoDTO dto = new ProjetoDTO();
        dto.setResponsavelId(responsavel.getId());
        dto.setNomeProjeto(nomeProjeto);
        dto.setObjetivo(objetivo);
        dto.setAtividades(atividades);
        dto.setPrioridade(prioridade);
        dto.setCustoAnualPrevisto(custo);
        dto.setRetornoPrevisto(retorno);
        dto.setStatus(status);
        dto.setPrevisaoInicio(previsaoInicio);
        dto.setPrevisaoTermino(previsaoTermino);
        dto.setDataRealFinalizacao(dataRealFinalizacao);
        dto.setObservacao(observacao);
        projetoService.criarProjeto(dto);
    }

    // ------------------------------------------------------------------- Edital

    private void criarEdital(String nome, String instituicaoFornecedora, String instituicaoParceira, String status,
            BigDecimal valor, String observacao) {
        EditalDTO dto = new EditalDTO();
        dto.setNomeEdital(nome);
        dto.setInstituicaoFornecedora(instituicaoFornecedora);
        dto.setInstituicaoParceira(instituicaoParceira);
        dto.setStatus(status);
        dto.setValor(valor);
        dto.setObservacao(observacao);
        editalService.criarEdital(dto);
    }

    // ------------------------------------------------------------------- Kanban

    private void criarCardEstagiario(Long estagiariaId, String titulo, String descricao, String coluna,
            String prioridade, LocalDate prazo, List<String> tags, Usuario chamador) {
        KanbanCardDTO dto = new KanbanCardDTO();
        dto.setEstagiariaId(estagiariaId);
        dto.setTitulo(titulo);
        dto.setDescricao(descricao);
        dto.setColuna(coluna);
        dto.setPrioridade(prioridade);
        dto.setPrazo(prazo);
        dto.setTags(tags);
        dto.setCriadoPor(chamador.getNome());
        dto.setCriadoEm(LocalDate.now());
        kanbanCardService.salvar(dto, chamador);
    }

    private void criarCardUsuario(Long usuarioId, String titulo, String descricao, String coluna, String prioridade,
            LocalDate prazo, List<String> tags, Usuario chamador) {
        KanbanCardDTO dto = new KanbanCardDTO();
        dto.setUsuarioId(usuarioId);
        dto.setTitulo(titulo);
        dto.setDescricao(descricao);
        dto.setColuna(coluna);
        dto.setPrioridade(prioridade);
        dto.setPrazo(prazo);
        dto.setTags(tags);
        dto.setCriadoPor(chamador.getNome());
        dto.setCriadoEm(LocalDate.now());
        kanbanCardService.salvar(dto, chamador);
    }

    // -------------------------------------------------------- NotaEstagiario

    private void criarNota(Long estagiariaId, Long servicoId, int nota, String comentario, String avaliadorNome,
            LocalDate data) {
        NotaEstagiarioDTO dto = new NotaEstagiarioDTO();
        dto.setEstagiariaId(estagiariaId);
        dto.setServicoId(servicoId);
        dto.setNota(nota);
        dto.setComentario(comentario);
        dto.setAvaliadorNome(avaliadorNome);
        dto.setData(data);
        notaEstagiarioService.salvar(dto);
    }

    // ------------------------------------------------------------------ Avaliacao

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_DATE_TIME;

    private void criarAvaliacao(String vinculo, String realizouServico, String descServico, int nps,
            String comentario, LocalDateTime data) {
        AvaliacaoDTO dto = new AvaliacaoDTO();
        dto.setVinculo(vinculo);
        dto.setRealizouServico(realizouServico);
        dto.setDescServico(descServico);
        dto.setNps(nps);
        dto.setComentario(comentario);
        dto.setTipoComentario(classificar(comentario));
        dto.setData(data.format(ISO));
        avaliacaoService.salvar(dto);
    }

    private String classificar(String texto) {
        if (texto == null || texto.isBlank()) return null;
        String t = texto.toLowerCase();
        if (t.matches(".*(reclama|problema|insatisf|demora|ruim|péssimo|horrível|lento|erro|falha|defeito).*")) {
            return "reclamacao";
        }
        if (t.matches(".*(sugiro|sugestão|sugere|poderia|melhoria|melhorar|implementar|adicionar|incluir).*")) {
            return "sugestao";
        }
        if (t.matches(".*(ótimo|excelente|parabéns|ótima|perfeito|muito bom|satisfeito|adorei|gostei|recomendo).*")) {
            return "elogio";
        }
        return "sugestao";
    }

    // -------------------------------------------------------------- Almoxarifado

    private Long criarItemAlmoxarifado(String nome, String categoria, String unidade, int quantidadeAtual,
            int estoqueMinimo, String localizacao, String observacao) {
        ItemAlmoxarifadoDTO dto = new ItemAlmoxarifadoDTO();
        dto.setNome(nome);
        dto.setCategoria(categoria);
        dto.setUnidade(unidade);
        dto.setQuantidadeAtual(quantidadeAtual);
        dto.setEstoqueMinimo(estoqueMinimo);
        dto.setLocalizacao(localizacao);
        dto.setObservacao(observacao);
        return almoxarifadoService.salvarItem(dto).getId();
    }

    private void registrarMovimentacao(Long itemId, String tipo, int quantidade, String responsavel, String motivo,
            LocalDateTime data) {
        MovimentacaoAlmoxarifadoDTO dto = new MovimentacaoAlmoxarifadoDTO();
        dto.setItemId(itemId);
        dto.setTipo(tipo);
        dto.setQuantidade(quantidade);
        dto.setResponsavel(responsavel);
        dto.setMotivo(motivo);
        dto.setData(data);
        almoxarifadoService.registrarMovimentacao(dto);
    }

    // ------------------------------------------------------------------ Maquina

    private void criarSessaoMaquina(Long maquinaId, String usuario, LocalDateTime ligada, LocalDateTime desligada,
            Double horasUso, String motivo) {
        SessaoMaquinaDTO dto = new SessaoMaquinaDTO();
        dto.setUsuario(usuario);
        dto.setDataLigada(ligada);
        dto.setDataDesligada(desligada);
        dto.setHorasUso(horasUso);
        dto.setMotivo(motivo);
        maquinaService.criarSessao(maquinaId, dto);
    }

    private void criarManutencaoMaquina(Long maquinaId, String tipo, String responsavel, LocalDate data,
            LocalDate proximaData, String status, String observacao) {
        ManutencaoMaquinaDTO dto = new ManutencaoMaquinaDTO();
        dto.setTipo(tipo);
        dto.setResponsavel(responsavel);
        dto.setData(data);
        dto.setProximaData(proximaData);
        dto.setStatus(status);
        dto.setObservacao(observacao);
        maquinaService.criarManutencao(maquinaId, dto);
    }

    private void criarAgendamentoMaquina(Long maquinaId, String usuario, LocalDateTime inicio, LocalDateTime fim,
            String motivo, boolean confirmado) {
        AgendamentoMaquinaDTO dto = new AgendamentoMaquinaDTO();
        dto.setUsuario(usuario);
        dto.setDataInicio(inicio);
        dto.setDataFim(fim);
        dto.setMotivo(motivo);
        dto.setConfirmado(confirmado);
        maquinaService.criarAgendamento(maquinaId, dto);
    }

    // ----------------------------------------------------- VerificacaoAmbiental

    private void criarVerificacaoAmbiental(String responsavel, String periodo, double temperatura,
            boolean tempConforme, double umidade, boolean umidConforme, String arCondicionado,
            String naoConformidade, String maquinasDesligadas, boolean prismoUso) {
        VerificacaoAmbientalDTO dto = new VerificacaoAmbientalDTO();
        dto.setResponsavel(responsavel);
        dto.setPeriodo(periodo);
        dto.setTemperatura(temperatura);
        dto.setTempConforme(tempConforme);
        dto.setUmidade(umidade);
        dto.setUmidConforme(umidConforme);
        dto.setArCondicionado(arCondicionado);
        dto.setNaoConformidade(naoConformidade);
        dto.setMaquinasDesligadas(maquinasDesligadas);
        dto.setPrismoUso(prismoUso);
        dto.setDataHora(LocalDateTime.now().format(ISO));
        verificacaoAmbientalService.salvar(dto);
    }

    // --------------------------------------------------------- CPF/CNPJ válidos

    /** Gera um CPF válido (dígitos verificadores corretos) a partir de uma base de 9 dígitos. */
    private static String cpfValido(long base9) {
        String b = String.format("%09d", base9);
        int d1 = digitoVerificador(b, new int[]{10, 9, 8, 7, 6, 5, 4, 3, 2});
        int d2 = digitoVerificador(b + d1, new int[]{11, 10, 9, 8, 7, 6, 5, 4, 3, 2});
        return b + d1 + d2;
    }

    /** Gera um CNPJ válido (dígitos verificadores corretos) a partir de uma base de 8 dígitos + "0001". */
    private static String cnpjValido(long base8) {
        String b = String.format("%08d", base8) + "0001";
        int d1 = digitoVerificador(b, new int[]{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        int d2 = digitoVerificador(b + d1, new int[]{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2});
        return b + d1 + d2;
    }

    private static int digitoVerificador(String base, int[] pesos) {
        int soma = 0;
        for (int i = 0; i < pesos.length; i++) {
            soma += (base.charAt(i) - '0') * pesos[i];
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
