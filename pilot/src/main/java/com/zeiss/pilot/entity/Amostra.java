package com.zeiss.pilot.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "amostras")
public class Amostra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Seção 1 — Recebimento
    private LocalDate dataEntrada;
    private String horario;
    private String responsavel;
    private String formaRecebimento;
    private String cliente;
    private String respEnvio;
    private String telEmail;
    private String servicoRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavelUsuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente clienteEntidade;

    @Column(length = 1000)
    private String obsRecebimento;

    // Seção 2 — Identificação da Peça
    private String codigoCEM;
    private String codigoCliente;
    @Column(length = 1000)
    private String descricao;
    private int quantidade;
    private String unidade;
    private LocalDate dataDevPrevista;
    private boolean temDesenho;
    private boolean temCAD;
    private boolean temTolerancia;
    private boolean temInstrucao;
    @Column(length = 1000)
    private String obsTecnicas;

    // Seção 3 — Serviços
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "amostra_servicos", joinColumns = @JoinColumn(name = "amostra_id"))
    @Column(name = "servico")
    private List<String> servicos = new ArrayList<>();
    @Column(length = 1000)
    private String objetivoCliente;

    // Seção 4 — Condição
    private String condPecaConforme;
    private String condQuantidadeCorreta;
    private String condEmbalagemIntegra;
    private String condSemDanoTransporte;
    private String condPecaLimpa;
    private String condSemContaminacao;
    private String condIdentificacao;
    private String condDocumentos;
    private String condPermiteExecucao;
    @Column(length = 1000)
    private String obsCondicao;

    // Seção 5 — Fotos
    private String fotoEmbalagem;
    private String fotoPecaAntes;
    private String fotoEtiqueta;
    private String fotoDanos;
    private String pathFotos;

    // Seção 6 — Armazenamento
    private String codigoAtribuido;
    private String formaIdentificacao;
    private String localArmazenamento;
    private String respArmazenamento;
    private String condicaoAmbiental;
    private String condicaoRequerida;
    private boolean fragil;
    private boolean cortante;
    private boolean embalagemEspecial;
    private boolean identifPreservada;
    @Column(length = 1000)
    private String obsArmazenamento;

    // Seção 7 — Divergências
    private String houveDivergencia;
    private String tipoDivergencia;
    @Column(length = 1000)
    private String descDivergencia;
    @Column(length = 1000)
    private String impactoTecnico;
    private String respTecnico;
    private String decisaoTecnica;
    private String abrirNC;
    @Column(length = 1000)
    private String justificativa;

    // Seção 8 — Comunicação
    private String clienteComunicado;
    private String formaComunicacao;
    private LocalDate dataComunicacao;
    private String respContato;
    private String autorizouRessalva;
    private String classificacao;
    @Column(length = 1000)
    private String justificativaAceite;

    // Seção 9 — Devolução
    private String seraDevolvida;
    private String seraRetida;
    private String formaDevolucao;
    private String respDevolucao;
    @Column(length = 1000)
    private String obsDevolucao;

    // Seção 10 — Assinaturas
    private String assRecebimento;
    private LocalDate assRecebimentoData;
    private String assTecnico;
    private LocalDate assTecnicoData;
    private String assAprovacao;
    private LocalDate assAprovacaoData;
    @Column(length = 2000)
    private String observacao;

    // Status
    private String status;
    private LocalDate dataDevRealizada;
    @Column(columnDefinition = "TEXT")
    private String termoAnexo;

    public Amostra() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDataEntrada() { return dataEntrada; }
    public void setDataEntrada(LocalDate dataEntrada) { this.dataEntrada = dataEntrada; }
    public String getHorario() { return horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public String getResponsavel() { return responsavel; }
    public void setResponsavel(String responsavel) { this.responsavel = responsavel; }
    public String getFormaRecebimento() { return formaRecebimento; }
    public void setFormaRecebimento(String formaRecebimento) { this.formaRecebimento = formaRecebimento; }
    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }
    public String getRespEnvio() { return respEnvio; }
    public void setRespEnvio(String respEnvio) { this.respEnvio = respEnvio; }
    public String getTelEmail() { return telEmail; }
    public void setTelEmail(String telEmail) { this.telEmail = telEmail; }
    public String getServicoRef() { return servicoRef; }
    public void setServicoRef(String servicoRef) { this.servicoRef = servicoRef; }
    public Usuario getResponsavelUsuario() { return responsavelUsuario; }
    public void setResponsavelUsuario(Usuario responsavelUsuario) { this.responsavelUsuario = responsavelUsuario; }
    public Cliente getClienteEntidade() { return clienteEntidade; }
    public void setClienteEntidade(Cliente clienteEntidade) { this.clienteEntidade = clienteEntidade; }
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
    public String getCondPecaConforme() { return condPecaConforme; }
    public void setCondPecaConforme(String v) { this.condPecaConforme = v; }
    public String getCondQuantidadeCorreta() { return condQuantidadeCorreta; }
    public void setCondQuantidadeCorreta(String v) { this.condQuantidadeCorreta = v; }
    public String getCondEmbalagemIntegra() { return condEmbalagemIntegra; }
    public void setCondEmbalagemIntegra(String v) { this.condEmbalagemIntegra = v; }
    public String getCondSemDanoTransporte() { return condSemDanoTransporte; }
    public void setCondSemDanoTransporte(String v) { this.condSemDanoTransporte = v; }
    public String getCondPecaLimpa() { return condPecaLimpa; }
    public void setCondPecaLimpa(String v) { this.condPecaLimpa = v; }
    public String getCondSemContaminacao() { return condSemContaminacao; }
    public void setCondSemContaminacao(String v) { this.condSemContaminacao = v; }
    public String getCondIdentificacao() { return condIdentificacao; }
    public void setCondIdentificacao(String v) { this.condIdentificacao = v; }
    public String getCondDocumentos() { return condDocumentos; }
    public void setCondDocumentos(String v) { this.condDocumentos = v; }
    public String getCondPermiteExecucao() { return condPermiteExecucao; }
    public void setCondPermiteExecucao(String v) { this.condPermiteExecucao = v; }
    public String getObsCondicao() { return obsCondicao; }
    public void setObsCondicao(String obsCondicao) { this.obsCondicao = obsCondicao; }
    public String getFotoEmbalagem() { return fotoEmbalagem; }
    public void setFotoEmbalagem(String v) { this.fotoEmbalagem = v; }
    public String getFotoPecaAntes() { return fotoPecaAntes; }
    public void setFotoPecaAntes(String v) { this.fotoPecaAntes = v; }
    public String getFotoEtiqueta() { return fotoEtiqueta; }
    public void setFotoEtiqueta(String v) { this.fotoEtiqueta = v; }
    public String getFotoDanos() { return fotoDanos; }
    public void setFotoDanos(String v) { this.fotoDanos = v; }
    public String getPathFotos() { return pathFotos; }
    public void setPathFotos(String pathFotos) { this.pathFotos = pathFotos; }
    public String getCodigoAtribuido() { return codigoAtribuido; }
    public void setCodigoAtribuido(String v) { this.codigoAtribuido = v; }
    public String getFormaIdentificacao() { return formaIdentificacao; }
    public void setFormaIdentificacao(String v) { this.formaIdentificacao = v; }
    public String getLocalArmazenamento() { return localArmazenamento; }
    public void setLocalArmazenamento(String v) { this.localArmazenamento = v; }
    public String getRespArmazenamento() { return respArmazenamento; }
    public void setRespArmazenamento(String v) { this.respArmazenamento = v; }
    public String getCondicaoAmbiental() { return condicaoAmbiental; }
    public void setCondicaoAmbiental(String v) { this.condicaoAmbiental = v; }
    public String getCondicaoRequerida() { return condicaoRequerida; }
    public void setCondicaoRequerida(String v) { this.condicaoRequerida = v; }
    public boolean isFragil() { return fragil; }
    public void setFragil(boolean fragil) { this.fragil = fragil; }
    public boolean isCortante() { return cortante; }
    public void setCortante(boolean cortante) { this.cortante = cortante; }
    public boolean isEmbalagemEspecial() { return embalagemEspecial; }
    public void setEmbalagemEspecial(boolean v) { this.embalagemEspecial = v; }
    public boolean isIdentifPreservada() { return identifPreservada; }
    public void setIdentifPreservada(boolean v) { this.identifPreservada = v; }
    public String getObsArmazenamento() { return obsArmazenamento; }
    public void setObsArmazenamento(String v) { this.obsArmazenamento = v; }
    public String getHouveDivergencia() { return houveDivergencia; }
    public void setHouveDivergencia(String v) { this.houveDivergencia = v; }
    public String getTipoDivergencia() { return tipoDivergencia; }
    public void setTipoDivergencia(String v) { this.tipoDivergencia = v; }
    public String getDescDivergencia() { return descDivergencia; }
    public void setDescDivergencia(String v) { this.descDivergencia = v; }
    public String getImpactoTecnico() { return impactoTecnico; }
    public void setImpactoTecnico(String v) { this.impactoTecnico = v; }
    public String getRespTecnico() { return respTecnico; }
    public void setRespTecnico(String v) { this.respTecnico = v; }
    public String getDecisaoTecnica() { return decisaoTecnica; }
    public void setDecisaoTecnica(String v) { this.decisaoTecnica = v; }
    public String getAbrirNC() { return abrirNC; }
    public void setAbrirNC(String v) { this.abrirNC = v; }
    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String v) { this.justificativa = v; }
    public String getClienteComunicado() { return clienteComunicado; }
    public void setClienteComunicado(String v) { this.clienteComunicado = v; }
    public String getFormaComunicacao() { return formaComunicacao; }
    public void setFormaComunicacao(String v) { this.formaComunicacao = v; }
    public LocalDate getDataComunicacao() { return dataComunicacao; }
    public void setDataComunicacao(LocalDate v) { this.dataComunicacao = v; }
    public String getRespContato() { return respContato; }
    public void setRespContato(String v) { this.respContato = v; }
    public String getAutorizouRessalva() { return autorizouRessalva; }
    public void setAutorizouRessalva(String v) { this.autorizouRessalva = v; }
    public String getClassificacao() { return classificacao; }
    public void setClassificacao(String v) { this.classificacao = v; }
    public String getJustificativaAceite() { return justificativaAceite; }
    public void setJustificativaAceite(String v) { this.justificativaAceite = v; }
    public String getSeraDevolvida() { return seraDevolvida; }
    public void setSeraDevolvida(String v) { this.seraDevolvida = v; }
    public String getSeraRetida() { return seraRetida; }
    public void setSeraRetida(String v) { this.seraRetida = v; }
    public String getFormaDevolucao() { return formaDevolucao; }
    public void setFormaDevolucao(String v) { this.formaDevolucao = v; }
    public String getRespDevolucao() { return respDevolucao; }
    public void setRespDevolucao(String v) { this.respDevolucao = v; }
    public String getObsDevolucao() { return obsDevolucao; }
    public void setObsDevolucao(String v) { this.obsDevolucao = v; }
    public String getAssRecebimento() { return assRecebimento; }
    public void setAssRecebimento(String v) { this.assRecebimento = v; }
    public LocalDate getAssRecebimentoData() { return assRecebimentoData; }
    public void setAssRecebimentoData(LocalDate v) { this.assRecebimentoData = v; }
    public String getAssTecnico() { return assTecnico; }
    public void setAssTecnico(String v) { this.assTecnico = v; }
    public LocalDate getAssTecnicoData() { return assTecnicoData; }
    public void setAssTecnicoData(LocalDate v) { this.assTecnicoData = v; }
    public String getAssAprovacao() { return assAprovacao; }
    public void setAssAprovacao(String v) { this.assAprovacao = v; }
    public LocalDate getAssAprovacaoData() { return assAprovacaoData; }
    public void setAssAprovacaoData(LocalDate v) { this.assAprovacaoData = v; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getDataDevRealizada() { return dataDevRealizada; }
    public void setDataDevRealizada(LocalDate dataDevRealizada) { this.dataDevRealizada = dataDevRealizada; }
    public String getTermoAnexo() { return termoAnexo; }
    public void setTermoAnexo(String termoAnexo) { this.termoAnexo = termoAnexo; }
}
