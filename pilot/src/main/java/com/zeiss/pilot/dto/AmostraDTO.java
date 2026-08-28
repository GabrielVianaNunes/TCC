package com.zeiss.pilot.dto;

import com.zeiss.pilot.entity.Amostra;
import com.zeiss.pilot.validation.Nome;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AmostraDTO {

    private Long id;

    @NotNull(message = "Data do recebimento é obrigatória.")
    private LocalDate dataEntrada;

    @NotBlank(message = "Horário do recebimento é obrigatório.")
    private String horario;

    // Autopreenchido pelo service a partir de responsavelId — não é mais
    // entrada direta do usuário, mantido só para exibir texto legado de
    // registros anteriores a este vínculo.
    private String responsavel;

    private Long responsavelId;

    @Pattern(regexp = "^$|Pessoalmente|Entregadora|Correios|Motoboy|Outro",
            message = "Forma de recebimento inválida.")
    private String formaRecebimento;

    // Autopreenchido pelo service a partir de clienteId — mesmo motivo acima.
    private String cliente;

    private Long clienteId;

    @Nome
    private String respEnvio;

    private String telEmail;
    private String servicoRef;
    private String obsRecebimento;
    private String codigoCEM;
    private String codigoCliente;

    @NotBlank(message = "Descrição da peça é obrigatória.")
    private String descricao;

    @Min(value = 1, message = "Quantidade deve ser no mínimo 1.")
    private int quantidade;

    @NotBlank(message = "Unidade é obrigatória.")
    private String unidade;

    private LocalDate dataDevPrevista;
    private boolean temDesenho;
    private boolean temCAD;
    private boolean temTolerancia;
    private boolean temInstrucao;
    private String obsTecnicas;
    private List<String> servicos;
    private String objetivoCliente;
    private Map<String, @Pattern(regexp = "^$|SIM|NÃO|N/A", message = "Valor de condição inválido.") String> condicao;
    private String obsCondicao;
    private Map<String, @Pattern(regexp = "^$|SIM|NÃO", message = "Valor de registro fotográfico inválido.") String> fotos;
    private String pathFotos;
    private String codigoAtribuido;
    private String formaIdentificacao;
    private String localArmazenamento;

    @Nome
    private String respArmazenamento;

    @Pattern(regexp = "^$|Não|Sim", message = "Condição ambiental inválida.")
    private String condicaoAmbiental;
    private String condicaoRequerida;
    private boolean fragil;
    private boolean cortante;
    private boolean embalagemEspecial;
    private boolean identifPreservada;
    private String obsArmazenamento;

    @Pattern(regexp = "^$|Não|Sim", message = "Houve divergência inválido.")
    private String houveDivergencia;

    @Pattern(regexp = "^$|Quantidade incorreta|Dano de transporte|Peça errada|Documentação ausente|Embalagem danificada|Outro",
            message = "Tipo de divergência inválido.")
    private String tipoDivergencia;

    private String descDivergencia;

    @Pattern(regexp = "^$|Não|Sim", message = "Impacto técnico inválido.")
    private String impactoTecnico;

    @Nome
    private String respTecnico;

    @Pattern(regexp = "^$|Aceito com ressalva|Aceito normalmente|Aguardando decisão|Devolver ao cliente",
            message = "Decisão técnica inválida.")
    private String decisaoTecnica;

    @Pattern(regexp = "^$|Não|Sim", message = "Abrir NC inválido.")
    private String abrirNC;

    private String justificativa;

    @Pattern(regexp = "^$|Sim|Não", message = "Cliente comunicado inválido.")
    private String clienteComunicado;

    @Pattern(regexp = "^$|E-mail|Telefone|WhatsApp|Presencial", message = "Forma de comunicação inválida.")
    private String formaComunicacao;

    private LocalDate dataComunicacao;

    @Nome
    private String respContato;

    @Pattern(regexp = "^$|Sim|Não|N/A", message = "Autorizou ressalva inválido.")
    private String autorizouRessalva;

    @Pattern(regexp = "^$|Aceito|Aceito com ressalva|Recusado", message = "Classificação inválida.")
    private String classificacao;

    private String justificativaAceite;

    @Pattern(regexp = "^$|Sim|Não", message = "Será devolvida inválido.")
    private String seraDevolvida;

    @Pattern(regexp = "^$|Sim|Não", message = "Será retida inválido.")
    private String seraRetida;

    @Pattern(regexp = "^$|Retirada pelo cliente|Entregadora|Correios|Motoboy", message = "Forma de devolução inválida.")
    private String formaDevolucao;

    @Nome
    private String respDevolucao;

    private String obsDevolucao;

    @Nome
    private String assRecebimento;

    private LocalDate assRecebimentoData;

    @Nome
    private String assTecnico;

    private LocalDate assTecnicoData;

    @Nome
    private String assAprovacao;

    private LocalDate assAprovacaoData;
    private String observacao;
    private String status;
    private LocalDate dataDevRealizada;
    private Object termoAnexo;

    public AmostraDTO() {}

    public static AmostraDTO fromEntity(Amostra e) {
        AmostraDTO dto = new AmostraDTO();
        dto.setId(e.getId());
        dto.setDataEntrada(e.getDataEntrada());
        dto.setHorario(e.getHorario());
        dto.setResponsavel(e.getResponsavel());
        dto.setResponsavelId(e.getResponsavelUsuario() != null ? e.getResponsavelUsuario().getId() : null);
        dto.setFormaRecebimento(e.getFormaRecebimento());
        dto.setCliente(e.getCliente());
        dto.setClienteId(e.getClienteEntidade() != null ? e.getClienteEntidade().getId() : null);
        dto.setRespEnvio(e.getRespEnvio());
        dto.setTelEmail(e.getTelEmail());
        dto.setServicoRef(e.getServicoRef());
        dto.setObsRecebimento(e.getObsRecebimento());
        dto.setCodigoCEM(e.getCodigoCEM());
        dto.setCodigoCliente(e.getCodigoCliente());
        dto.setDescricao(e.getDescricao());
        dto.setQuantidade(e.getQuantidade());
        dto.setUnidade(e.getUnidade());
        dto.setDataDevPrevista(e.getDataDevPrevista());
        dto.setTemDesenho(e.isTemDesenho());
        dto.setTemCAD(e.isTemCAD());
        dto.setTemTolerancia(e.isTemTolerancia());
        dto.setTemInstrucao(e.isTemInstrucao());
        dto.setObsTecnicas(e.getObsTecnicas());
        dto.setServicos(e.getServicos());
        dto.setObjetivoCliente(e.getObjetivoCliente());

        Map<String, String> condicao = new HashMap<>();
        condicao.put("pecaConforme", e.getCondPecaConforme());
        condicao.put("quantidadeCorreta", e.getCondQuantidadeCorreta());
        condicao.put("embalagemIntegra", e.getCondEmbalagemIntegra());
        condicao.put("semDanoTransporte", e.getCondSemDanoTransporte());
        condicao.put("pecaLimpa", e.getCondPecaLimpa());
        condicao.put("semContaminacao", e.getCondSemContaminacao());
        condicao.put("identificacao", e.getCondIdentificacao());
        condicao.put("documentos", e.getCondDocumentos());
        condicao.put("permiteExecucao", e.getCondPermiteExecucao());
        dto.setCondicao(condicao);
        dto.setObsCondicao(e.getObsCondicao());

        Map<String, String> fotos = new HashMap<>();
        fotos.put("embalagem", e.getFotoEmbalagem());
        fotos.put("pecaAntes", e.getFotoPecaAntes());
        fotos.put("etiqueta", e.getFotoEtiqueta());
        fotos.put("danos", e.getFotoDanos());
        dto.setFotos(fotos);
        dto.setPathFotos(e.getPathFotos());

        dto.setCodigoAtribuido(e.getCodigoAtribuido());
        dto.setFormaIdentificacao(e.getFormaIdentificacao());
        dto.setLocalArmazenamento(e.getLocalArmazenamento());
        dto.setRespArmazenamento(e.getRespArmazenamento());
        dto.setCondicaoAmbiental(e.getCondicaoAmbiental());
        dto.setCondicaoRequerida(e.getCondicaoRequerida());
        dto.setFragil(e.isFragil());
        dto.setCortante(e.isCortante());
        dto.setEmbalagemEspecial(e.isEmbalagemEspecial());
        dto.setIdentifPreservada(e.isIdentifPreservada());
        dto.setObsArmazenamento(e.getObsArmazenamento());
        dto.setHouveDivergencia(e.getHouveDivergencia());
        dto.setTipoDivergencia(e.getTipoDivergencia());
        dto.setDescDivergencia(e.getDescDivergencia());
        dto.setImpactoTecnico(e.getImpactoTecnico());
        dto.setRespTecnico(e.getRespTecnico());
        dto.setDecisaoTecnica(e.getDecisaoTecnica());
        dto.setAbrirNC(e.getAbrirNC());
        dto.setJustificativa(e.getJustificativa());
        dto.setClienteComunicado(e.getClienteComunicado());
        dto.setFormaComunicacao(e.getFormaComunicacao());
        dto.setDataComunicacao(e.getDataComunicacao());
        dto.setRespContato(e.getRespContato());
        dto.setAutorizouRessalva(e.getAutorizouRessalva());
        dto.setClassificacao(e.getClassificacao());
        dto.setJustificativaAceite(e.getJustificativaAceite());
        dto.setSeraDevolvida(e.getSeraDevolvida());
        dto.setSeraRetida(e.getSeraRetida());
        dto.setFormaDevolucao(e.getFormaDevolucao());
        dto.setRespDevolucao(e.getRespDevolucao());
        dto.setObsDevolucao(e.getObsDevolucao());
        dto.setAssRecebimento(e.getAssRecebimento());
        dto.setAssRecebimentoData(e.getAssRecebimentoData());
        dto.setAssTecnico(e.getAssTecnico());
        dto.setAssTecnicoData(e.getAssTecnicoData());
        dto.setAssAprovacao(e.getAssAprovacao());
        dto.setAssAprovacaoData(e.getAssAprovacaoData());
        dto.setObservacao(e.getObservacao());
        dto.setStatus(e.getStatus());
        dto.setDataDevRealizada(e.getDataDevRealizada());
        dto.setTermoAnexo(e.getTermoAnexo());
        return dto;
    }

    public Amostra toEntity() {
        Amostra e = new Amostra();
        e.setDataEntrada(this.dataEntrada);
        e.setHorario(this.horario);
        e.setFormaRecebimento(this.formaRecebimento);
        e.setRespEnvio(this.respEnvio);
        e.setTelEmail(this.telEmail);
        e.setServicoRef(this.servicoRef);
        e.setObsRecebimento(this.obsRecebimento);
        e.setCodigoCEM(this.codigoCEM);
        e.setCodigoCliente(this.codigoCliente);
        e.setDescricao(this.descricao);
        e.setQuantidade(this.quantidade);
        e.setUnidade(this.unidade);
        e.setDataDevPrevista(this.dataDevPrevista);
        e.setTemDesenho(this.temDesenho);
        e.setTemCAD(this.temCAD);
        e.setTemTolerancia(this.temTolerancia);
        e.setTemInstrucao(this.temInstrucao);
        e.setObsTecnicas(this.obsTecnicas);
        if (this.servicos != null) e.setServicos(this.servicos);
        e.setObjetivoCliente(this.objetivoCliente);

        if (this.condicao != null) {
            e.setCondPecaConforme(this.condicao.get("pecaConforme"));
            e.setCondQuantidadeCorreta(this.condicao.get("quantidadeCorreta"));
            e.setCondEmbalagemIntegra(this.condicao.get("embalagemIntegra"));
            e.setCondSemDanoTransporte(this.condicao.get("semDanoTransporte"));
            e.setCondPecaLimpa(this.condicao.get("pecaLimpa"));
            e.setCondSemContaminacao(this.condicao.get("semContaminacao"));
            e.setCondIdentificacao(this.condicao.get("identificacao"));
            e.setCondDocumentos(this.condicao.get("documentos"));
            e.setCondPermiteExecucao(this.condicao.get("permiteExecucao"));
        }
        e.setObsCondicao(this.obsCondicao);

        if (this.fotos != null) {
            e.setFotoEmbalagem(this.fotos.get("embalagem"));
            e.setFotoPecaAntes(this.fotos.get("pecaAntes"));
            e.setFotoEtiqueta(this.fotos.get("etiqueta"));
            e.setFotoDanos(this.fotos.get("danos"));
        }
        e.setPathFotos(this.pathFotos);
        e.setCodigoAtribuido(this.codigoAtribuido);
        e.setFormaIdentificacao(this.formaIdentificacao);
        e.setLocalArmazenamento(this.localArmazenamento);
        e.setRespArmazenamento(this.respArmazenamento);
        e.setCondicaoAmbiental(this.condicaoAmbiental);
        e.setCondicaoRequerida(this.condicaoRequerida);
        e.setFragil(this.fragil);
        e.setCortante(this.cortante);
        e.setEmbalagemEspecial(this.embalagemEspecial);
        e.setIdentifPreservada(this.identifPreservada);
        e.setObsArmazenamento(this.obsArmazenamento);
        e.setHouveDivergencia(this.houveDivergencia);
        e.setTipoDivergencia(this.tipoDivergencia);
        e.setDescDivergencia(this.descDivergencia);
        e.setImpactoTecnico(this.impactoTecnico);
        e.setRespTecnico(this.respTecnico);
        e.setDecisaoTecnica(this.decisaoTecnica);
        e.setAbrirNC(this.abrirNC);
        e.setJustificativa(this.justificativa);
        e.setClienteComunicado(this.clienteComunicado);
        e.setFormaComunicacao(this.formaComunicacao);
        e.setDataComunicacao(this.dataComunicacao);
        e.setRespContato(this.respContato);
        e.setAutorizouRessalva(this.autorizouRessalva);
        e.setClassificacao(this.classificacao);
        e.setJustificativaAceite(this.justificativaAceite);
        e.setSeraDevolvida(this.seraDevolvida);
        e.setSeraRetida(this.seraRetida);
        e.setFormaDevolucao(this.formaDevolucao);
        e.setRespDevolucao(this.respDevolucao);
        e.setObsDevolucao(this.obsDevolucao);
        e.setAssRecebimento(this.assRecebimento);
        e.setAssRecebimentoData(this.assRecebimentoData);
        e.setAssTecnico(this.assTecnico);
        e.setAssTecnicoData(this.assTecnicoData);
        e.setAssAprovacao(this.assAprovacao);
        e.setAssAprovacaoData(this.assAprovacaoData);
        e.setObservacao(this.observacao);
        e.setStatus(this.status != null ? this.status : "Em custódia");
        e.setDataDevRealizada(this.dataDevRealizada);
        return e;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDate dataEntrada) { this.dataEntrada = dataEntrada; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public Long getResponsavelId() { return responsavelId; }
    public void setResponsavelId(Long responsavelId) { this.responsavelId = responsavelId; }
    public String getFormaRecebimento() { return formaRecebimento; }
    public void setFormaRecebimento(String formaRecebimento) { this.formaRecebimento = formaRecebimento; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public String getRespEnvio() { return respEnvio; }
    public void setRespEnvio(String respEnvio) { this.respEnvio = respEnvio; }
    public String getTelEmail() { return telEmail; }
    public void setTelEmail(String telEmail) { this.telEmail = telEmail; }
    public String getServicoRef() { return servicoRef; }
    public void setServicoRef(String servicoRef) { this.servicoRef = servicoRef; }
    public String getObsRecebimento() { return obsRecebimento; }
    public void setObsRecebimento(String obsRecebimento) { this.obsRecebimento = obsRecebimento; }
    public String getCodigoCEM() { return codigoCEM; }
    public void setCodigoCEM(String codigoCEM) { this.codigoCEM = codigoCEM; }
    public String getCodigoCliente() { return codigoCliente; }
    public void setCodigoCliente(String codigoCliente) { this.codigoCliente = codigoCliente; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public int getQuantidade() { return quantidade; }
    public void setQuantidade(int quantidade) { this.quantidade = quantidade; }
    public String getUnidade() { return unidade; }
    public void setUnidade(String unidade) { this.unidade = unidade; }
    public LocalDate getDataDevPrevista() { return dataDevPrevista; }
    public void setDataDevPrevista(LocalDate dataDevPrevista) { this.dataDevPrevista = dataDevPrevista; }
    public boolean isTemDesenho() { return temDesenho; }
    public void setTemDesenho(boolean temDesenho) { this.temDesenho = temDesenho; }
    public boolean isTemCAD() { return temCAD; }
    public void setTemCAD(boolean temCAD) { this.temCAD = temCAD; }
    public boolean isTemTolerancia() { return temTolerancia; }
    public void setTemTolerancia(boolean temTolerancia) { this.temTolerancia = temTolerancia; }
    public boolean isTemInstrucao() { return temInstrucao; }
    public void setTemInstrucao(boolean temInstrucao) { this.temInstrucao = temInstrucao; }
    public String getObsTecnicas() { return obsTecnicas; }
    public void setObsTecnicas(String obsTecnicas) { this.obsTecnicas = obsTecnicas; }
    public List<String> getServicos() { return servicos; }
    public void setServicos(List<String> servicos) { this.servicos = servicos; }
    public String getObjetivoCliente() { return objetivoCliente; }
    public void setObjetivoCliente(String objetivoCliente) { this.objetivoCliente = objetivoCliente; }
    public Map<String, String> getCondicao() { return condicao; }
    public void setCondicao(Map<String, String> condicao) { this.condicao = condicao; }
    public String getObsCondicao() { return obsCondicao; }
    public void setObsCondicao(String obsCondicao) { this.obsCondicao = obsCondicao; }
    public Map<String, String> getFotos() { return fotos; }
    public void setFotos(Map<String, String> fotos) { this.fotos = fotos; }
    public String getPathFotos() { return pathFotos; }
    public void setPathFotos(String pathFotos) { this.pathFotos = pathFotos; }
    public String getCodigoAtribuido() { return codigoAtribuido; }
    public void setCodigoAtribuido(String codigoAtribuido) { this.codigoAtribuido = codigoAtribuido; }
    public String getFormaIdentificacao() { return formaIdentificacao; }
    public void setFormaIdentificacao(String formaIdentificacao) { this.formaIdentificacao = formaIdentificacao; }
    public String getLocalArmazenamento() { return localArmazenamento; }
    public void setLocalArmazenamento(String localArmazenamento) { this.localArmazenamento = localArmazenamento; }
    public String getRespArmazenamento() { return respArmazenamento; }
    public void setRespArmazenamento(String respArmazenamento) { this.respArmazenamento = respArmazenamento; }
    public String getCondicaoAmbiental() { return condicaoAmbiental; }
    public void setCondicaoAmbiental(String condicaoAmbiental) { this.condicaoAmbiental = condicaoAmbiental; }
    public String getCondicaoRequerida() { return condicaoRequerida; }
    public void setCondicaoRequerida(String condicaoRequerida) { this.condicaoRequerida = condicaoRequerida; }
    public boolean isFragil() { return fragil; }
    public void setFragil(boolean fragil) { this.fragil = fragil; }
    public boolean isCortante() { return cortante; }
    public void setCortante(boolean cortante) { this.cortante = cortante; }
    public boolean isEmbalagemEspecial() { return embalagemEspecial; }
    public void setEmbalagemEspecial(boolean embalagemEspecial) { this.embalagemEspecial = embalagemEspecial; }
    public boolean isIdentifPreservada() { return identifPreservada; }
    public void setIdentifPreservada(boolean identifPreservada) { this.identifPreservada = identifPreservada; }
    public String getObsArmazenamento() { return obsArmazenamento; }
    public void setObsArmazenamento(String obsArmazenamento) { this.obsArmazenamento = obsArmazenamento; }
    public String getHouveDivergencia() { return houveDivergencia; }
    public void setHouveDivergencia(String houveDivergencia) { this.houveDivergencia = houveDivergencia; }
    public String getTipoDivergencia() { return tipoDivergencia; }
    public void setTipoDivergencia(String tipoDivergencia) { this.tipoDivergencia = tipoDivergencia; }
    public String getDescDivergencia() { return descDivergencia; }
    public void setDescDivergencia(String descDivergencia) { this.descDivergencia = descDivergencia; }
    public String getImpactoTecnico() { return impactoTecnico; }
    public void setImpactoTecnico(String impactoTecnico) { this.impactoTecnico = impactoTecnico; }
    public String getRespTecnico() { return respTecnico; }
    public void setRespTecnico(String respTecnico) { this.respTecnico = respTecnico; }
    public String getDecisaoTecnica() { return decisaoTecnica; }
    public void setDecisaoTecnica(String decisaoTecnica) { this.decisaoTecnica = decisaoTecnica; }
    public String getAbrirNC() { return abrirNC; }
    public void setAbrirNC(String abrirNC) { this.abrirNC = abrirNC; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }
    public String getClienteComunicado() { return clienteComunicado; }
    public void setClienteComunicado(String clienteComunicado) { this.clienteComunicado = clienteComunicado; }
    public String getFormaComunicacao() { return formaComunicacao; }
    public void setFormaComunicacao(String formaComunicacao) { this.formaComunicacao = formaComunicacao; }
    public LocalDate getDataComunicacao() { return dataComunicacao; }
    public void setDataComunicacao(LocalDate dataComunicacao) { this.dataComunicacao = dataComunicacao; }
    public String getRespContato() { return respContato; }
    public void setRespContato(String respContato) { this.respContato = respContato; }
    public String getAutorizouRessalva() { return autorizouRessalva; }
    public void setAutorizouRessalva(String autorizouRessalva) { this.autorizouRessalva = autorizouRessalva; }
    public String getClassificacao() { return classificacao; }
    public void setClassificacao(String classificacao) { this.classificacao = classificacao; }
    public String getJustificativaAceite() { return justificativaAceite; }
    public void setJustificativaAceite(String justificativaAceite) { this.justificativaAceite = justificativaAceite; }
    public String getSeraDevolvida() { return seraDevolvida; }
    public void setSeraDevolvida(String seraDevolvida) { this.seraDevolvida = seraDevolvida; }
    public String getSeraRetida() { return seraRetida; }
    public void setSeraRetida(String seraRetida) { this.seraRetida = seraRetida; }
    public String getFormaDevolucao() { return formaDevolucao; }
    public void setFormaDevolucao(String formaDevolucao) { this.formaDevolucao = formaDevolucao; }
    public String getRespDevolucao() { return respDevolucao; }
    public void setRespDevolucao(String respDevolucao) { this.respDevolucao = respDevolucao; }
    public String getObsDevolucao() { return obsDevolucao; }
    public void setObsDevolucao(String obsDevolucao) { this.obsDevolucao = obsDevolucao; }
    public String getAssRecebimento() { return assRecebimento; }
    public void setAssRecebimento(String assRecebimento) { this.assRecebimento = assRecebimento; }
    public LocalDate getAssRecebimentoData() { return assRecebimentoData; }
    public void setAssRecebimentoData(LocalDate assRecebimentoData) { this.assRecebimentoData = assRecebimentoData; }
    public String getAssTecnico() { return assTecnico; }
    public void setAssTecnico(String assTecnico) { this.assTecnico = assTecnico; }
    public LocalDate getAssTecnicoData() { return assTecnicoData; }
    public void setAssTecnicoData(LocalDate assTecnicoData) { this.assTecnicoData = assTecnicoData; }
    public String getAssAprovacao() { return assAprovacao; }
    public void setAssAprovacao(String assAprovacao) { this.assAprovacao = assAprovacao; }
    public LocalDate getAssAprovacaoData() { return assAprovacaoData; }
    public void setAssAprovacaoData(LocalDate assAprovacaoData) { this.assAprovacaoData = assAprovacaoData; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDataDevRealizada() { return dataDevRealizada; }
    public void setDataDevRealizada(LocalDate dataDevRealizada) { this.dataDevRealizada = dataDevRealizada; }
    public Object getTermoAnexo() { return termoAnexo; }
    public void setTermoAnexo(Object termoAnexo) { this.termoAnexo = termoAnexo; }
}
