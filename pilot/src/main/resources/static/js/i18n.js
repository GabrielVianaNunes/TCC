/**
 * i18n.js — ZEISS·PILOT — pt-BR · en · de
 * O text-node walker traduz qualquer string conhecida na página inteira
 * sem precisar de data-i18n em cada elemento.
 */
(function () {
  'use strict';

  const LANGS   = ['pt-BR', 'en', 'de'];
  const DEFAULT = 'pt-BR';

  /* ═══════════════════════════════════════════════════════════════════
     DICIONÁRIO COMPLETO
     Chave = texto exato em pt-BR (facilita manutenção)
  ═══════════════════════════════════════════════════════════════════ */
  const T = {

    // ── Marca / Brand ───────────────────────────────────────────────
    'Metrologia SENAI':                { 'pt-BR':'Metrologia SENAI',                'en':'SENAI Metrology',                     'de':'SENAI Metrologie'                      },
    'ZEISS·PILOT':                     { 'pt-BR':'ZEISS·PILOT',                     'en':'ZEISS·PILOT',                         'de':'ZEISS·PILOT'                           },

    // ── Seções sidebar ──────────────────────────────────────────────
    'Principal':                       { 'pt-BR':'Principal',                       'en':'Main',                                'de':'Hauptmenü'                             },
    'Atendimento':                     { 'pt-BR':'Atendimento',                     'en':'Services',                            'de':'Dienste'                               },
    'Gestão':                          { 'pt-BR':'Gestão',                          'en':'Management',                          'de':'Verwaltung'                            },
    'Laboratório':                     { 'pt-BR':'Laboratório',                     'en':'Laboratory',                          'de':'Labor'                                 },
    'Relatórios':                      { 'pt-BR':'Relatórios',                      'en':'Reports',                             'de':'Berichte'                              },
    'Qualidade':                       { 'pt-BR':'Qualidade',                       'en':'Quality',                             'de':'Qualität'                              },
    'Estagiários':                     { 'pt-BR':'Estagiários',                     'en':'Interns',                             'de':'Praktikanten'                          },
    'Administração':                   { 'pt-BR':'Administração',                   'en':'Administration',                      'de':'Administration'                        },

    // ── Itens sidebar ───────────────────────────────────────────────
    'Dashboard':                       { 'pt-BR':'Dashboard',                       'en':'Dashboard',                           'de':'Dashboard'                             },
    'Serviços (OS)':                   { 'pt-BR':'Serviços (OS)',                   'en':'Services (WO)',                       'de':'Dienste (AO)'                          },
    'Amostras':                        { 'pt-BR':'Amostras',                        'en':'Samples',                             'de':'Proben'                                },
    'Visitas Técnicas':                { 'pt-BR':'Visitas Técnicas',                'en':'Technical Visits',                    'de':'Technische Besuche'                    },
    'Projetos':                        { 'pt-BR':'Projetos',                        'en':'Projects',                            'de':'Projekte'                              },
    'Eventos':                         { 'pt-BR':'Eventos',                         'en':'Events',                              'de':'Veranstaltungen'                       },
    'Editais':                         { 'pt-BR':'Editais',                         'en':'Tenders',                             'de':'Ausschreibungen'                       },
    'Documentos PDF':                  { 'pt-BR':'Documentos PDF',                  'en':'PDF Documents',                       'de':'PDF-Dokumente'                         },
    'Máquinas':                        { 'pt-BR':'Máquinas',                        'en':'Machines',                            'de':'Maschinen'                             },
    'Almoxarifado':                    { 'pt-BR':'Almoxarifado',                    'en':'Warehouse',                           'de':'Lager'                                 },
    'Verificação CEM':                 { 'pt-BR':'Verificação CEM',                 'en':'CEM Verification',                    'de':'CEM-Prüfung'                           },
    'Relatório Serviços':              { 'pt-BR':'Relatório Serviços',              'en':'Services Report',                     'de':'Dienstbericht'                         },
    'Dashboard Eventos':               { 'pt-BR':'Dashboard Eventos',               'en':'Events Dashboard',                    'de':'Veranstaltungs-Dashboard'              },
    'Avaliação':                       { 'pt-BR':'Avaliação',                       'en':'Evaluation',                          'de':'Bewertung'                             },
    'Dashboard Avaliações':            { 'pt-BR':'Dashboard Avaliações',            'en':'Evaluations Dashboard',               'de':'Bewertungs-Dashboard'                  },
    'QR Code Avaliação':               { 'pt-BR':'QR Code Avaliação',               'en':'QR Code Evaluation',                  'de':'QR-Code Bewertung'                     },
    'Kanban Atividades':               { 'pt-BR':'Kanban Atividades',               'en':'Kanban Board',                        'de':'Kanban-Board'                          },
    'Dashboard Estagiários':           { 'pt-BR':'Dashboard Estagiários',           'en':'Interns Dashboard',                   'de':'Praktikanten-Dashboard'                },
    'Usuários':                        { 'pt-BR':'Usuários',                        'en':'Users',                               'de':'Benutzer'                              },

    // ── Topbar / user menu ──────────────────────────────────────────
    'Gerenciar Usuários':              { 'pt-BR':'Gerenciar Usuários',              'en':'Manage Users',                        'de':'Benutzer verwalten'                    },
    'Sair':                            { 'pt-BR':'Sair',                            'en':'Sign out',                            'de':'Abmelden'                              },
    'Alternar tema':                   { 'pt-BR':'Alternar tema',                   'en':'Toggle theme',                        'de':'Design wechseln'                       },
    'Abrir menu de navegação':         { 'pt-BR':'Abrir menu de navegação',         'en':'Open navigation menu',                'de':'Navigationsmenü öffnen'                },
    'Recolher menu':                   { 'pt-BR':'Recolher menu',                   'en':'Collapse menu',                       'de':'Menü einklappen'                       },
    'Menu do usuário':                 { 'pt-BR':'Menu do usuário',                 'en':'User menu',                           'de':'Benutzermenü'                          },

    // ── Botões comuns ───────────────────────────────────────────────
    'Salvar':                          { 'pt-BR':'Salvar',                          'en':'Save',                                'de':'Speichern'                             },
    'Salvando...':                     { 'pt-BR':'Salvando...',                     'en':'Saving...',                           'de':'Speichern...'                          },
    'Enviando...':                     { 'pt-BR':'Enviando...',                     'en':'Sending...',                          'de':'Senden...'                             },
    'Salvar Evento':                   { 'pt-BR':'Salvar Evento',                   'en':'Save Event',                          'de':'Veranstaltung speichern'               },
    'Salvar OS':                       { 'pt-BR':'Salvar OS',                       'en':'Save WO',                             'de':'AO speichern'                          },
    'Salvar Usuário':                  { 'pt-BR':'Salvar Usuário',                  'en':'Save User',                           'de':'Benutzer speichern'                    },
    'Salvar Projeto':                  { 'pt-BR':'Salvar Projeto',                  'en':'Save Project',                        'de':'Projekt speichern'                     },
    'Salvar Edital':                   { 'pt-BR':'Salvar Edital',                   'en':'Save Tender',                         'de':'Ausschreibung speichern'               },
    'Salvar Visita':                   { 'pt-BR':'Salvar Visita',                   'en':'Save Visit',                          'de':'Besuch speichern'                      },
    'Cancelar':                        { 'pt-BR':'Cancelar',                        'en':'Cancel',                              'de':'Abbrechen'                             },
    'Fechar':                          { 'pt-BR':'Fechar',                          'en':'Close',                               'de':'Schließen'                             },
    'Editar':                          { 'pt-BR':'Editar',                          'en':'Edit',                                'de':'Bearbeiten'                            },
    'Excluir':                         { 'pt-BR':'Excluir',                         'en':'Delete',                              'de':'Löschen'                               },
    'Limpar':                          { 'pt-BR':'Limpar',                          'en':'Clear',                               'de':'Löschen'                               },
    'Limpar filtros':                  { 'pt-BR':'Limpar filtros',                  'en':'Clear filters',                       'de':'Filter zurücksetzen'                   },
    'Filtrar':                         { 'pt-BR':'Filtrar',                         'en':'Filter',                              'de':'Filtern'                               },
    'Buscar':                          { 'pt-BR':'Buscar',                          'en':'Search',                              'de':'Suchen'                                },
    'Exportar':                        { 'pt-BR':'Exportar',                        'en':'Export',                              'de':'Exportieren'                           },
    'Exportar CSV':                    { 'pt-BR':'Exportar CSV',                    'en':'Export CSV',                          'de':'CSV exportieren'                       },
    'Imprimir':                        { 'pt-BR':'Imprimir',                        'en':'Print',                               'de':'Drucken'                               },
    'Confirmar':                       { 'pt-BR':'Confirmar',                       'en':'Confirm',                             'de':'Bestätigen'                            },
    'Voltar':                          { 'pt-BR':'Voltar',                          'en':'Back',                                'de':'Zurück'                                },
    'Enviar':                          { 'pt-BR':'Enviar',                          'en':'Submit',                              'de':'Absenden'                              },
    'Anexar':                          { 'pt-BR':'Anexar',                          'en':'Attach',                              'de':'Anhängen'                              },
    'Ver Detalhes':                    { 'pt-BR':'Ver Detalhes',                    'en':'View Details',                        'de':'Details anzeigen'                      },
    'Ver Todos':                       { 'pt-BR':'Ver Todos',                       'en':'View All',                            'de':'Alle anzeigen'                         },
    'Ir ao Dashboard':                 { 'pt-BR':'Ir ao Dashboard',                 'en':'Go to Dashboard',                     'de':'Zum Dashboard'                         },
    'Abrir Formulário':                { 'pt-BR':'Abrir Formulário',                'en':'Open Form',                           'de':'Formular öffnen'                       },

    // ── Paginação ───────────────────────────────────────────────────
    '‹ Anterior':                      { 'pt-BR':'‹ Anterior',                      'en':'‹ Previous',                          'de':'‹ Zurück'                              },
    'Próxima ›':                       { 'pt-BR':'Próxima ›',                       'en':'Next ›',                              'de':'Weiter ›'                              },
    'Próxima':                         { 'pt-BR':'Próxima',                         'en':'Next',                                'de':'Weiter'                                },
    'Anterior':                        { 'pt-BR':'Anterior',                        'en':'Previous',                            'de':'Zurück'                                },

    // ── Filtros comuns ──────────────────────────────────────────────
    'Todos':                           { 'pt-BR':'Todos',                           'en':'All',                                 'de':'Alle'                                  },
    'Todas':                           { 'pt-BR':'Todas',                           'en':'All',                                 'de':'Alle'                                  },
    'Nenhum':                          { 'pt-BR':'Nenhum',                          'en':'None',                                'de':'Keine'                                 },
    'Selecione...':                    { 'pt-BR':'Selecione...',                    'en':'Select...',                           'de':'Auswählen...'                          },
    'Selecione…':                      { 'pt-BR':'Selecione…',                      'en':'Select…',                             'de':'Auswählen…'                            },
    'Opcional':                        { 'pt-BR':'Opcional',                        'en':'Optional',                            'de':'Optional'                              },
    'Período:':                        { 'pt-BR':'Período:',                        'en':'Period:',                             'de':'Zeitraum:'                             },
    'até':                             { 'pt-BR':'até',                             'en':'to',                                  'de':'bis'                                   },
    'Cargo:':                          { 'pt-BR':'Cargo:',                          'en':'Role:',                               'de':'Rolle:'                                },
    'Validade:':                       { 'pt-BR':'Validade:',                       'en':'Expiry:',                             'de':'Ablauf:'                               },
    'Todos os status':                 { 'pt-BR':'Todos os status',                 'en':'All statuses',                        'de':'Alle Status'                           },
    'Todas as categorias':             { 'pt-BR':'Todas as categorias',             'en':'All categories',                      'de':'Alle Kategorien'                       },

    // ── Títulos de página ───────────────────────────────────────────
    'Ordens de Serviço':               { 'pt-BR':'Ordens de Serviço',               'en':'Work Orders',                         'de':'Arbeitsaufträge'                       },
    'Calendário de Eventos':           { 'pt-BR':'Calendário de Eventos',           'en':'Events Calendar',                     'de':'Veranstaltungskalender'                },
    'Dashboard Executivo':             { 'pt-BR':'Dashboard Executivo',             'en':'Executive Dashboard',                 'de':'Führungs-Dashboard'                    },
    'Dashboard de Avaliações':         { 'pt-BR':'Dashboard de Avaliações',         'en':'Evaluations Dashboard',               'de':'Bewertungs-Dashboard'                  },
    'Dashboard de Eventos':            { 'pt-BR':'Dashboard de Eventos',            'en':'Events Dashboard',                    'de':'Veranstaltungs-Dashboard'              },
    'Relatório de Serviços':           { 'pt-BR':'Relatório de Serviços',           'en':'Services Report',                     'de':'Dienstbericht'                         },
    'Amostras de Clientes':            { 'pt-BR':'Amostras de Clientes',            'en':'Customer Samples',                    'de':'Kundenproben'                          },
    'Máquinas & Scanners':             { 'pt-BR':'Máquinas & Scanners',             'en':'Machines & Scanners',                 'de':'Maschinen & Scanner'                   },
    'Usuários do Sistema':             { 'pt-BR':'Usuários do Sistema',             'en':'System Users',                        'de':'Systembenutzer'                        },
    'Verificação Ambiental CEM':       { 'pt-BR':'Verificação Ambiental CEM',       'en':'CEM Environmental Check',             'de':'CEM-Umgebungscheck'                    },
    'Página não encontrada':           { 'pt-BR':'Página não encontrada',           'en':'Page not found',                      'de':'Seite nicht gefunden'                  },

    // ── Subtítulos ──────────────────────────────────────────────────
    'Visão geral operacional':         { 'pt-BR':'Visão geral operacional',         'en':'Operational overview',                'de':'Betriebsübersicht'                     },

    // ── Dashboard KPIs ──────────────────────────────────────────────
    'Ordens de Serviço Abertas':       { 'pt-BR':'Ordens de Serviço Abertas',       'en':'Open Work Orders',                    'de':'Offene Arbeitsaufträge'                },
    'Projetos Ativos':                 { 'pt-BR':'Projetos Ativos',                 'en':'Active Projects',                     'de':'Aktive Projekte'                       },
    'Visitas Agendadas':               { 'pt-BR':'Visitas Agendadas',               'en':'Scheduled Visits',                    'de':'Geplante Besuche'                      },
    'Documentos Ativos':               { 'pt-BR':'Documentos Ativos',               'en':'Active Documents',                    'de':'Aktive Dokumente'                      },

    // ── Dashboard cards / feed labels ───────────────────────────────
    'Agendada':                        { 'pt-BR':'Agendada',                        'en':'Scheduled',                           'de':'Geplant'                               },
    'Sem data':                        { 'pt-BR':'Sem data',                        'en':'No date',                             'de':'Kein Datum'                            },
    'visitante(s)':                    { 'pt-BR':'visitante(s)',                    'en':'visitor(s)',                          'de':'Besucher'                              },
    'Término previsto':                { 'pt-BR':'Término previsto',                'en':'Expected end',                        'de':'Voraussichtliches Ende'                },
    'A Vencer':                        { 'pt-BR':'A Vencer',                        'en':'Expiring',                            'de':'Läuft ab'                              },
    'Expirados':                       { 'pt-BR':'Expirados',                       'en':'Expired',                             'de':'Abgelaufen'                            },
    'total':                           { 'pt-BR':'total',                           'en':'total',                               'de':'gesamt'                                },
    'documento(s)':                    { 'pt-BR':'documento(s)',                    'en':'document(s)',                         'de':'Dokument(e)'                           },
    'documento(s) expirado(s)':        { 'pt-BR':'documento(s) expirado(s)',        'en':'expired document(s)',                 'de':'abgelaufenes/e Dokument(e)'            },
    'vencendo em <30 dias':            { 'pt-BR':'vencendo em <30 dias',            'en':'expiring in <30 days',                'de':'läuft in <30 Tagen ab'                 },
    'requerem atenção imediata.':      { 'pt-BR':'requerem atenção imediata.',      'en':'require immediate attention.',        'de':'erfordern sofortige Aufmerksamkeit.'   },
    'Atenção — seus documentos têm alertas': { 'pt-BR':'Atenção — seus documentos têm alertas', 'en':'Warning — your documents have alerts', 'de':'Achtung — Ihre Dokumente haben Warnungen' },
    'Revisar agora':                   { 'pt-BR':'Revisar agora',                   'en':'Review now',                         'de':'Jetzt prüfen'                          },

    // ── Dashboard empty / error states ──────────────────────────────
    'Nenhuma OS registrada ainda.':    { 'pt-BR':'Nenhuma OS registrada ainda.',    'en':'No work orders registered yet.',      'de':'Noch keine Arbeitsaufträge registriert.' },
    'Erro ao carregar dados do gráfico.': { 'pt-BR':'Erro ao carregar dados do gráfico.', 'en':'Error loading chart data.', 'de':'Fehler beim Laden der Diagrammdaten.' },
    'Nenhuma visita pendente agendada.': { 'pt-BR':'Nenhuma visita pendente agendada.', 'en':'No pending visits scheduled.',  'de':'Keine ausstehenden Besuche geplant.'   },
    'Nenhum projeto em andamento.':    { 'pt-BR':'Nenhum projeto em andamento.',    'en':'No projects in progress.',            'de':'Keine Projekte in Bearbeitung.'        },
    'Não foi possível carregar os dados.': { 'pt-BR':'Não foi possível carregar os dados.', 'en':'Could not load the data.', 'de':'Daten konnten nicht geladen werden.'   },
    'Sem dados de receita ainda.':     { 'pt-BR':'Sem dados de receita ainda.',     'en':'No revenue data yet.',                'de':'Noch keine Umsatzdaten.'               },
    'Sem dados de projetos.':          { 'pt-BR':'Sem dados de projetos.',          'en':'No project data.',                    'de':'Keine Projektdaten.'                   },
    'Nenhum evento registrado.':       { 'pt-BR':'Nenhum evento registrado.',       'en':'No events registered.',               'de':'Keine Veranstaltungen registriert.'    },
    'Nenhum dado de distribuição.':    { 'pt-BR':'Nenhum dado de distribuição.',    'en':'No distribution data.',               'de':'Keine Verteilungsdaten.'               },
    'Erro ao carregar dashboard de eventos.': { 'pt-BR':'Erro ao carregar dashboard de eventos.', 'en':'Error loading events dashboard.', 'de':'Fehler beim Laden des Veranstaltungs-Dashboards.' },
    'evento':                          { 'pt-BR':'evento',                          'en':'event',                               'de':'Veranstaltung'                         },
    'eventos':                         { 'pt-BR':'eventos',                         'en':'events',                              'de':'Veranstaltungen'                       },
    'mais':                            { 'pt-BR':'mais',                            'en':'more',                                'de':'mehr'                                  },
    'Sem dados':                       { 'pt-BR':'Sem dados',                       'en':'No data',                             'de':'Keine Daten'                           },
    'Gerenciamento de serviços e pipeline de vendas': { 'pt-BR':'Gerenciamento de serviços e pipeline de vendas', 'en':'Service management and sales pipeline', 'de':'Dienstverwaltung und Vertriebspipeline' },
    'Acompanhe todos os eventos e visitas do SENAI': { 'pt-BR':'Acompanhe todos os eventos e visitas do SENAI', 'en':'Track all SENAI events and visits', 'de':'Alle SENAI-Veranstaltungen verfolgen' },
    'Custódia de peças enviadas por clientes para serviços de medição': { 'pt-BR':'Custódia de peças enviadas por clientes para serviços de medição', 'en':'Custody of parts sent by clients for measurement services', 'de':'Verwahrung von Kundenteilen für Messdienste' },
    'Gestão de documentos institucionais com controle de validade (ISO 17025)': { 'pt-BR':'Gestão de documentos institucionais com controle de validade (ISO 17025)', 'en':'Institutional document management with expiry control (ISO 17025)', 'de':'Institutionelle Dokumentenverwaltung mit Ablaufkontrolle (ISO 17025)' },
    'Gerenciamento de estoque — ponteiras, ferramentas, materiais e insumos': { 'pt-BR':'Gerenciamento de estoque — ponteiras, ferramentas, materiais e insumos', 'en':'Inventory management — tips, tools, materials and supplies', 'de':'Lagerverwaltung — Spitzen, Werkzeuge, Materialien und Verbrauchsmittel' },
    'Gerenciamento de contas de acesso ao sistema': { 'pt-BR':'Gerenciamento de contas de acesso ao sistema', 'en':'System access account management', 'de':'Systemzugangskontenverwaltung' },
    'Controle de uso, manutenções, agendamentos e retirada de equipamentos': { 'pt-BR':'Controle de uso, manutenções, agendamentos e retirada de equipamentos', 'en':'Equipment usage, maintenance, scheduling and retrieval control', 'de':'Nutzungs-, Wartungs-, Planungs- und Ausrüstungskontrolle' },

    // ── Cabeçalhos de tabela ────────────────────────────────────────
    'Título / Nome':                   { 'pt-BR':'Título / Nome',                   'en':'Title / Name',                        'de':'Titel / Name'                          },
    'Descrição':                       { 'pt-BR':'Descrição',                       'en':'Description',                         'de':'Beschreibung'                          },
    'Data':                            { 'pt-BR':'Data',                            'en':'Date',                                'de':'Datum'                                 },
    'Horário':                         { 'pt-BR':'Horário',                         'en':'Time',                                'de':'Uhrzeit'                               },
    'Local':                           { 'pt-BR':'Local',                           'en':'Location',                            'de':'Ort'                                   },
    'Responsável':                     { 'pt-BR':'Responsável',                     'en':'Responsible',                         'de':'Verantwortlich'                        },
    'Participantes':                   { 'pt-BR':'Participantes',                   'en':'Participants',                        'de':'Teilnehmer'                            },
    'Ações':                           { 'pt-BR':'Ações',                           'en':'Actions',                             'de':'Aktionen'                              },
    'Cliente':                         { 'pt-BR':'Cliente',                         'en':'Client',                              'de':'Kunde'                                 },
    'Solicitação':                     { 'pt-BR':'Solicitação',                     'en':'Request',                             'de':'Anfrage'                               },
    'Técnico':                         { 'pt-BR':'Técnico',                         'en':'Technician',                          'de':'Techniker'                             },
    'Status':                          { 'pt-BR':'Status',                          'en':'Status',                              'de':'Status'                                },
    'Valor':                           { 'pt-BR':'Valor',                           'en':'Amount',                              'de':'Betrag'                                },
    'Nome':                            { 'pt-BR':'Nome',                            'en':'Name',                                'de':'Name'                                  },
    'E-mail':                          { 'pt-BR':'E-mail',                          'en':'Email',                               'de':'E-Mail'                                },
    'Cargo':                           { 'pt-BR':'Cargo',                           'en':'Role',                                'de':'Rolle'                                 },
    'Data de Criação':                 { 'pt-BR':'Data de Criação',                 'en':'Creation Date',                       'de':'Erstellungsdatum'                      },
    'Arquivo':                         { 'pt-BR':'Arquivo',                         'en':'File',                                'de':'Datei'                                 },
    'Data de Upload':                  { 'pt-BR':'Data de Upload',                  'en':'Upload Date',                         'de':'Upload-Datum'                          },
    'Validade':                        { 'pt-BR':'Validade',                        'en':'Expiry',                              'de':'Ablauf'                                },
    'Situação':                        { 'pt-BR':'Situação',                        'en':'Situation',                           'de':'Zustand'                               },
    'Item':                            { 'pt-BR':'Item',                            'en':'Item',                                'de':'Artikel'                               },
    'Categoria':                       { 'pt-BR':'Categoria',                       'en':'Category',                            'de':'Kategorie'                             },
    'Localização':                     { 'pt-BR':'Localização',                     'en':'Location',                            'de':'Standort'                              },
    'Qtd. Atual':                      { 'pt-BR':'Qtd. Atual',                      'en':'Current Qty.',                        'de':'Akt. Menge'                            },
    'Qtd.':                            { 'pt-BR':'Qtd.',                            'en':'Qty.',                                'de':'Menge'                                 },
    'Mín.':                            { 'pt-BR':'Mín.',                            'en':'Min.',                                'de':'Min.'                                  },
    'Vínculo':                         { 'pt-BR':'Vínculo',                         'en':'Affiliation',                         'de':'Zugehörigkeit'                         },
    'Realizou Serviço':                { 'pt-BR':'Realizou Serviço',                'en':'Used Service',                        'de':'Dienst genutzt'                        },
    'NPS':                             { 'pt-BR':'NPS',                             'en':'NPS',                                 'de':'NPS'                                   },
    'Data Prevista':                   { 'pt-BR':'Data Prevista',                   'en':'Expected Date',                       'de':'Geplantes Datum'                       },
    'Observação':                      { 'pt-BR':'Observação',                      'en':'Note',                                'de':'Anmerkung'                             },
    'Observações':                     { 'pt-BR':'Observações',                     'en':'Notes',                               'de':'Anmerkungen'                           },
    'Mês':                             { 'pt-BR':'Mês',                             'en':'Month',                               'de':'Monat'                                 },
    'Receita':                         { 'pt-BR':'Receita',                         'en':'Revenue',                             'de':'Umsatz'                                },
    'Ticket Médio (R$)':               { 'pt-BR':'Ticket Médio (R$)',               'en':'Avg. Ticket (R$)',                    'de':'Durchschn. Ticket (R$)'                },
    'Usuário':                         { 'pt-BR':'Usuário',                         'en':'User',                                'de':'Benutzer'                              },
    'Ligada em':                       { 'pt-BR':'Ligada em',                       'en':'Started on',                          'de':'Gestartet am'                          },
    'Desligada em':                    { 'pt-BR':'Desligada em',                    'en':'Stopped on',                          'de':'Gestoppt am'                           },
    'Horas':                           { 'pt-BR':'Horas',                           'en':'Hours',                               'de':'Stunden'                               },
    'Motivo':                          { 'pt-BR':'Motivo',                          'en':'Reason',                              'de':'Grund'                                 },
    'Tipo':                            { 'pt-BR':'Tipo',                            'en':'Type',                                'de':'Typ'                                   },
    'Data/Hora':                       { 'pt-BR':'Data/Hora',                       'en':'Date/Time',                           'de':'Datum/Uhrzeit'                         },
    'Obs.':                            { 'pt-BR':'Obs.',                            'en':'Note',                                'de':'Bem.'                                  },

    // ── Status / valores de select ──────────────────────────────────
    'Em andamento':                    { 'pt-BR':'Em andamento',                    'en':'In progress',                         'de':'In Bearbeitung'                        },
    'Em Andamento':                    { 'pt-BR':'Em Andamento',                    'en':'In Progress',                         'de':'In Bearbeitung'                        },
    'Em análise':                      { 'pt-BR':'Em análise',                      'en':'Under review',                        'de':'In Prüfung'                            },
    'Aguardando cliente':              { 'pt-BR':'Aguardando cliente',              'en':'Awaiting client',                     'de':'Warte auf Kunden'                      },
    'Venda finalizada':                { 'pt-BR':'Venda finalizada',                'en':'Sale completed',                      'de':'Verkauf abgeschlossen'                 },
    'Venda Finalizada':                { 'pt-BR':'Venda Finalizada',                'en':'Sale Completed',                      'de':'Verkauf Abgeschlossen'                 },
    'Cancelada':                       { 'pt-BR':'Cancelada',                       'en':'Cancelled',                           'de':'Storniert'                             },
    'Elaboração de proposta':          { 'pt-BR':'Elaboração de proposta',          'en':'Proposal drafting',                   'de':'Angebotserstellung'                    },
    'Elaboração de Proposta':          { 'pt-BR':'Elaboração de Proposta',          'en':'Proposal Drafting',                   'de':'Angebotserstellung'                    },
    'Negociação':                      { 'pt-BR':'Negociação',                      'en':'Negotiation',                         'de':'Verhandlung'                           },
    'Desistiu':                        { 'pt-BR':'Desistiu',                        'en':'Dropped out',                         'de':'Abgebrochen'                           },
    'Concluída':                       { 'pt-BR':'Concluída',                       'en':'Completed',                           'de':'Abgeschlossen'                         },
    'Concluído':                       { 'pt-BR':'Concluído',                       'en':'Done',                                'de':'Erledigt'                              },
    'Concluídas':                      { 'pt-BR':'Concluídas',                      'en':'Completed',                           'de':'Abgeschlossen'                         },
    'Em Campo':                        { 'pt-BR':'Em Campo',                        'en':'On Site',                             'de':'Vor Ort'                               },
    'Finalizado':                      { 'pt-BR':'Finalizado',                      'en':'Finished',                            'de':'Abgeschlossen'                         },
    'Ativo':                           { 'pt-BR':'Ativo',                           'en':'Active',                              'de':'Aktiv'                                 },
    'Inativo':                         { 'pt-BR':'Inativo',                         'en':'Inactive',                            'de':'Inaktiv'                               },
    'Prestes a Vencer':                { 'pt-BR':'Prestes a Vencer',                'en':'Expiring Soon',                       'de':'Läuft bald ab'                         },
    'Expirado':                        { 'pt-BR':'Expirado',                        'en':'Expired',                             'de':'Abgelaufen'                            },
    'Em custódia':                     { 'pt-BR':'Em custódia',                     'en':'In custody',                          'de':'In Verwahrung'                         },
    'Vencendo':                        { 'pt-BR':'Vencendo',                        'en':'Expiring',                            'de':'Läuft ab'                              },
    'Devolvida':                       { 'pt-BR':'Devolvida',                       'en':'Returned',                            'de':'Zurückgegeben'                         },
    'Extraviada':                      { 'pt-BR':'Extraviada',                      'en':'Lost',                                'de':'Verloren'                              },
    'Aprovado':                        { 'pt-BR':'Aprovado',                        'en':'Approved',                            'de':'Genehmigt'                             },
    'Reprovado':                       { 'pt-BR':'Reprovado',                       'en':'Rejected',                            'de':'Abgelehnt'                             },
    'Aguardando aprovação':            { 'pt-BR':'Aguardando aprovação',            'en':'Awaiting approval',                   'de':'Warte auf Genehmigung'                 },
    'Aguardando Aprovação':            { 'pt-BR':'Aguardando Aprovação',            'en':'Awaiting Approval',                   'de':'Warte auf Genehmigung'                 },
    'Prestação de Contas':             { 'pt-BR':'Prestação de Contas',             'en':'Accounting',                          'de':'Abrechnung'                            },
    'A Iniciar':                       { 'pt-BR':'A Iniciar',                       'en':'To Start',                            'de':'Zu Beginnen'                           },
    'Pendente Autorização':            { 'pt-BR':'Pendente Autorização',            'en':'Pending Authorization',               'de':'Genehmigung ausstehend'                },
    'Atrasado':                        { 'pt-BR':'Atrasado',                        'en':'Delayed',                             'de':'Verzögert'                             },
    'Descontinuado':                   { 'pt-BR':'Descontinuado',                   'en':'Discontinued',                        'de':'Eingestellt'                           },
    'Realizada':                       { 'pt-BR':'Realizada',                       'en':'Completed',                           'de':'Durchgeführt'                          },
    'Pendente':                        { 'pt-BR':'Pendente',                        'en':'Pending',                             'de':'Ausstehend'                            },
    'OK':                              { 'pt-BR':'OK',                              'en':'OK',                                  'de':'OK'                                    },
    'Crítico':                         { 'pt-BR':'Crítico',                         'en':'Critical',                            'de':'Kritisch'                              },

    // ── Cargos ──────────────────────────────────────────────────────
    'DIRETOR_CEM':                     { 'pt-BR':'DIRETOR_CEM',                     'en':'CEM DIRECTOR',                        'de':'CEM-DIREKTOR'                          },
    'GESTOR':                          { 'pt-BR':'GESTOR',                          'en':'MANAGER',                             'de':'LEITER'                                },
    'ESTAGIARIO':                      { 'pt-BR':'ESTAGIARIO',                      'en':'INTERN',                              'de':'PRAKTIKANT'                            },
    'Diretor do CEM':                  { 'pt-BR':'Diretor do CEM',                  'en':'CEM Director',                        'de':'CEM-Direktor'                          },
    'Gestor':                          { 'pt-BR':'Gestor',                          'en':'Manager',                             'de':'Leiter'                                },
    'Estagiário':                      { 'pt-BR':'Estagiário',                      'en':'Intern',                              'de':'Praktikant'                            },

    // ── Novos botões (por página) ───────────────────────────────────
    'Nova OS':                         { 'pt-BR':'Nova OS',                         'en':'New WO',                              'de':'Neuer AO'                              },
    'Novo Evento':                     { 'pt-BR':'Novo Evento',                     'en':'New Event',                           'de':'Neue Veranstaltung'                    },
    'Novo Usuário':                    { 'pt-BR':'Novo Usuário',                    'en':'New User',                            'de':'Neuer Benutzer'                        },
    'Nova Amostra':                    { 'pt-BR':'Nova Amostra',                    'en':'New Sample',                          'de':'Neue Probe'                            },
    'Nova Visita Técnica':             { 'pt-BR':'Nova Visita Técnica',             'en':'New Technical Visit',                 'de':'Neuer Technischer Besuch'              },
    'Agendar Visita Técnica':          { 'pt-BR':'Agendar Visita Técnica',          'en':'Schedule Technical Visit',            'de':'Technischen Besuch planen'             },
    'Editar Visita Técnica':           { 'pt-BR':'Editar Visita Técnica',           'en':'Edit Technical Visit',                'de':'Technischen Besuch bearbeiten'         },
    'Novo Item':                       { 'pt-BR':'Novo Item',                       'en':'New Item',                            'de':'Neuer Artikel'                         },
    'Editar Item':                     { 'pt-BR':'Editar Item',                     'en':'Edit Item',                           'de':'Artikel bearbeiten'                    },
    'Novo Edital':                     { 'pt-BR':'Novo Edital',                     'en':'New Tender',                          'de':'Neue Ausschreibung'                    },
    'Novo Projeto':                    { 'pt-BR':'Novo Projeto',                    'en':'New Project',                         'de':'Neues Projekt'                         },
    'Novo Agendamento':                { 'pt-BR':'Novo Agendamento',                'en':'New Appointment',                     'de':'Neuer Termin'                          },
    'Editar Agendamento':              { 'pt-BR':'Editar Agendamento',              'en':'Edit Appointment',                    'de':'Termin bearbeiten'                     },
    'Nova Manutenção':                 { 'pt-BR':'Nova Manutenção',                 'en':'New Maintenance',                     'de':'Neue Wartung'                          },
    'Registrar Uso':                   { 'pt-BR':'Registrar Uso',                   'en':'Register Use',                        'de':'Nutzung registrieren'                  },
    'Desligar Máquina':                { 'pt-BR':'Desligar Máquina',                'en':'Turn Off Machine',                    'de':'Maschine ausschalten'                  },
    'Registrar Ligação':               { 'pt-BR':'Registrar Ligação',               'en':'Register Start',                      'de':'Start registrieren'                    },

    // ── Amostras (cabeçalhos / contagem / placeholders) ────────────
    'Registro de Amostras':            { 'pt-BR':'Registro de Amostras',            'en':'Sample Records',                      'de':'Probenaufzeichnungen'                  },
    'OS / Referência':                 { 'pt-BR':'OS / Referência',                 'en':'WO / Reference',                      'de':'AO / Referenz'                         },
    'Dev. Prevista':                   { 'pt-BR':'Dev. Prevista',                   'en':'Exp. Return',                         'de':'Gep. Rückgabe'                         },
    'registro(s)':                     { 'pt-BR':'registro(s)',                     'en':'record(s)',                           'de':'Eintrag/Einträge'                      },
    'Buscar cliente, descrição ou OS...': { 'pt-BR':'Buscar cliente, descrição ou OS...', 'en':'Search client, description or WO...', 'de':'Kunde, Beschreibung oder AO suchen...' },
    'Nenhuma amostra encontrada':      { 'pt-BR':'Nenhuma amostra encontrada',      'en':'No samples found',                    'de':'Keine Proben gefunden'                 },
    'Ajuste os filtros ou cadastre uma nova amostra.': { 'pt-BR':'Ajuste os filtros ou cadastre uma nova amostra.', 'en':'Adjust the filters or register a new sample.', 'de':'Filter anpassen oder neue Probe registrieren.' },
    'Gerar Termo de Custódia':         { 'pt-BR':'Gerar Termo de Custódia',         'en':'Generate Custody Form',               'de':'Verwahrungsformular erstellen'         },
    'Registrar devolução':             { 'pt-BR':'Registrar devolução',             'en':'Register return',                     'de':'Rückgabe registrieren'                 },
    'Anexar termo assinado':           { 'pt-BR':'Anexar termo assinado',           'en':'Attach signed form',                  'de':'Unterzeichnetes Formular anhängen'     },
    'Editar Amostra':                  { 'pt-BR':'Editar Amostra',                  'en':'Edit Sample',                         'de':'Probe bearbeiten'                      },
    'Editar Evento':                   { 'pt-BR':'Editar Evento',                   'en':'Edit Event',                          'de':'Veranstaltung bearbeiten'              },
    'Editar Edital':                   { 'pt-BR':'Editar Edital',                   'en':'Edit Tender',                         'de':'Ausschreibung bearbeiten'              },
    'Editar OS':                       { 'pt-BR':'Editar OS',                       'en':'Edit WO',                             'de':'AO bearbeiten'                         },
    'Nova Ordem de Serviço':           { 'pt-BR':'Nova Ordem de Serviço',           'en':'New Work Order',                      'de':'Neuer Arbeitsauftrag'                  },
    'Buscar cliente...':               { 'pt-BR':'Buscar cliente...',               'en':'Search client...',                    'de':'Kunde suchen...'                       },
    'Nenhum cliente encontrado.':      { 'pt-BR':'Nenhum cliente encontrado.',      'en':'No client found.',                    'de':'Kein Kunde gefunden.'                  },
    'Máquina':                         { 'pt-BR':'Máquina',                         'en':'Machine',                             'de':'Maschine'                              },
    'Buscar máquina...':               { 'pt-BR':'Buscar máquina...',               'en':'Search machine...',                   'de':'Maschine suchen...'                    },
    'Nenhuma máquina encontrada.':     { 'pt-BR':'Nenhuma máquina encontrada.',     'en':'No machine found.',                   'de':'Keine Maschine gefunden.'              },
    'Buscar tipo de serviço...':       { 'pt-BR':'Buscar tipo de serviço...',       'en':'Search service type...',              'de':'Diensttyp suchen...'                   },
    'Selecione uma máquina primeiro.': { 'pt-BR':'Selecione uma máquina primeiro.', 'en':'Select a machine first.',             'de':'Wählen Sie zuerst eine Maschine.'      },
    'Descrição original (OS legada):':{ 'pt-BR':'Descrição original (OS legada):', 'en':'Original description (legacy OS):',   'de':'Ursprüngliche Beschreibung (Alt-OS):'  },
    'Documento':                       { 'pt-BR':'Documento',                       'en':'Document',                            'de':'Dokument'                              },
    'Vencido em':                      { 'pt-BR':'Vencido em',                      'en':'Expired on',                          'de':'Abgelaufen am'                         },
    'Vence em':                        { 'pt-BR':'Vence em',                        'en':'Expires on',                          'de':'Läuft ab am'                           },
    'Estoque atual':                   { 'pt-BR':'Estoque atual',                   'en':'Current stock',                       'de':'Aktueller Bestand'                     },
    'mínimo':                          { 'pt-BR':'mínimo',                          'en':'minimum',                             'de':'Minimum'                               },
    'Nenhum registro para exportar.':  { 'pt-BR':'Nenhum registro para exportar.',  'en':'No records to export.',               'de':'Keine Einträge zum Exportieren.'       },
    'registros exportados.':           { 'pt-BR':'registros exportados.',           'en':'records exported.',                   'de':'Einträge exportiert.'                  },
    'Erro ao carregar dados':          { 'pt-BR':'Erro ao carregar dados',          'en':'Error loading data',                  'de':'Fehler beim Laden der Daten'           },
    'Verifique a conexão com o servidor.': { 'pt-BR':'Verifique a conexão com o servidor.', 'en':'Check the server connection.', 'de':'Serververbindung prüfen.'              },

    // ── Contadores dinâmicos ────────────────────────────────────────
    'Exibindo':                        { 'pt-BR':'Exibindo',                        'en':'Showing',                             'de':'Anzeige'                               },
    'de':                              { 'pt-BR':'de',                              'en':'of',                                  'de':'von'                                   },
    'evento(s) encontrado(s)':         { 'pt-BR':'evento(s) encontrado(s)',         'en':'event(s) found',                      'de':'Veranstaltung(en) gefunden'            },
    'usuário(s) encontrado(s)':        { 'pt-BR':'usuário(s) encontrado(s)',        'en':'user(s) found',                       'de':'Benutzer gefunden'                     },
    'documento(s) encontrado(s)':      { 'pt-BR':'documento(s) encontrado(s)',      'en':'document(s) found',                   'de':'Dokument(e) gefunden'                  },
    'item(s)':                         { 'pt-BR':'item(s)',                         'en':'item(s)',                             'de':'Artikel'                               },
    'projeto(s)':                      { 'pt-BR':'projeto(s)',                      'en':'project(s)',                          'de':'Projekt(e)'                            },

    // ── Estados vazios (EmptyState) ─────────────────────────────────
    'Nenhum evento encontrado':        { 'pt-BR':'Nenhum evento encontrado',        'en':'No events found',                     'de':'Keine Veranstaltungen gefunden'        },
    'Crie um novo evento ou ajuste os filtros.': { 'pt-BR':'Crie um novo evento ou ajuste os filtros.', 'en':'Create a new event or adjust the filters.', 'de':'Neue Veranstaltung erstellen oder Filter anpassen.' },
    'Nenhuma visita encontrada':       { 'pt-BR':'Nenhuma visita encontrada',       'en':'No visits found',                     'de':'Keine Besuche gefunden'                },
    'Agende uma nova visita ou ajuste os filtros.': { 'pt-BR':'Agende uma nova visita ou ajuste os filtros.', 'en':'Schedule a new visit or adjust the filters.', 'de':'Neuen Besuch planen oder Filter anpassen.' },
    'Nenhum edital encontrado':        { 'pt-BR':'Nenhum edital encontrado',        'en':'No tenders found',                    'de':'Keine Ausschreibungen gefunden'        },
    'Crie um novo edital ou ajuste os filtros.': { 'pt-BR':'Crie um novo edital ou ajuste os filtros.', 'en':'Create a new tender or adjust the filters.', 'de':'Neue Ausschreibung erstellen oder Filter anpassen.' },
    'Nenhum registro encontrado':      { 'pt-BR':'Nenhum registro encontrado',      'en':'No records found',                    'de':'Keine Einträge gefunden'               },
    'Utilize o botão acima para adicionar um novo item.': { 'pt-BR':'Utilize o botão acima para adicionar um novo item.', 'en':'Use the button above to add a new item.', 'de':'Verwenden Sie die Schaltfläche oben, um einen neuen Eintrag hinzuzufügen.' },
    'Nenhum item encontrado':          { 'pt-BR':'Nenhum item encontrado',          'en':'No items found',                      'de':'Keine Artikel gefunden'                },
    'Ajuste os filtros ou cadastre um novo item.': { 'pt-BR':'Ajuste os filtros ou cadastre um novo item.', 'en':'Adjust filters or register a new item.', 'de':'Filter anpassen oder neuen Artikel registrieren.' },
    'Nenhum documento encontrado':     { 'pt-BR':'Nenhum documento encontrado',     'en':'No documents found',                  'de':'Keine Dokumente gefunden'              },
    'Envie documentos usando o botão acima.': { 'pt-BR':'Envie documentos usando o botão acima.', 'en':'Upload documents using the button above.', 'de':'Dokumente über die Schaltfläche oben hochladen.' },
    'Nenhum usuário encontrado':       { 'pt-BR':'Nenhum usuário encontrado',       'en':'No users found',                      'de':'Keine Benutzer gefunden'               },
    'Crie um novo usuário ou ajuste os filtros.': { 'pt-BR':'Crie um novo usuário ou ajuste os filtros.', 'en':'Create a new user or adjust the filters.', 'de':'Neuen Benutzer erstellen oder Filter anpassen.' },
    'Nenhum evento neste dia.':        { 'pt-BR':'Nenhum evento neste dia.',        'en':'No events on this day.',              'de':'Keine Veranstaltungen an diesem Tag.'  },
    'Nenhum evento próximo.':          { 'pt-BR':'Nenhum evento próximo.',          'en':'No upcoming events.',                 'de':'Keine bevorstehenden Veranstaltungen.' },
    'Nenhum documento anexado.':       { 'pt-BR':'Nenhum documento anexado.',       'en':'No documents attached.',              'de':'Keine Dokumente angehängt.'            },
    'Nenhum item para exportar.':      { 'pt-BR':'Nenhum item para exportar.',      'en':'No items to export.',                 'de':'Keine Artikel zum Exportieren.'        },
    'Nenhum / Não aplicável':          { 'pt-BR':'Nenhum / Não aplicável',          'en':'None / Not applicable',               'de':'Keine / Nicht zutreffend'              },
    'Registro removido.':              { 'pt-BR':'Registro removido.',              'en':'Record removed.',                     'de':'Eintrag entfernt.'                     },

    // ── Campos de formulário específicos ────────────────────────────
    'Nova Senha (opcional)':           { 'pt-BR':'Nova Senha (opcional)',            'en':'New Password (optional)',             'de':'Neues Passwort (optional)'             },
    'Deixe em branco para manter a senha atual.': { 'pt-BR':'Deixe em branco para manter a senha atual.', 'en':'Leave blank to keep the current password.', 'de':'Leer lassen, um das aktuelle Passwort zu behalten.' },
    'Informe a data/hora de desligamento.': { 'pt-BR':'Informe a data/hora de desligamento.', 'en':'Enter the shutdown date/time.', 'de':'Datum/Uhrzeit der Abschaltung eingeben.' },
    'Informe o nome do usuário.':        { 'pt-BR':'Informe o nome do usuário.',       'en':'Enter the user name.',                'de':'Benutzernamen eingeben.'               },
    'Informe a data de expiração.':      { 'pt-BR':'Informe a data de expiração.',     'en':'Enter the expiration date.',          'de':'Ablaufdatum eingeben.'                 },
    'Selecione um arquivo PDF.':         { 'pt-BR':'Selecione um arquivo PDF.',        'en':'Select a PDF file.',                  'de':'PDF-Datei auswählen.'                  },
    'visita(s) encontrada(s)':           { 'pt-BR':'visita(s) encontrada(s)',          'en':'visit(s) found',                      'de':'Besuch/Besuche gefunden'               },
    'Remover este registro de uso?':     { 'pt-BR':'Remover este registro de uso?',    'en':'Remove this usage record?',           'de':'Diesen Nutzungseintrag entfernen?'     },
    'Remover este registro de manutenção?': { 'pt-BR':'Remover este registro de manutenção?', 'en':'Remove this maintenance record?', 'de':'Diesen Wartungseintrag entfernen?' },
    'Não foi possível carregar o edital.': { 'pt-BR':'Não foi possível carregar o edital.', 'en':'Could not load the tender.', 'de':'Ausschreibung konnte nicht geladen werden.' },
    'Erro ao salvar edital.':          { 'pt-BR':'Erro ao salvar edital.',           'en':'Error saving tender.',                'de':'Fehler beim Speichern der Ausschreibung.' },
    'Erro ao salvar visita.':          { 'pt-BR':'Erro ao salvar visita.',           'en':'Error saving visit.',                 'de':'Fehler beim Speichern des Besuchs.'    },

    // ── Títulos de modal ────────────────────────────────────────────
    'Movimentar Estoque':              { 'pt-BR':'Movimentar Estoque',              'en':'Stock Movement',                      'de':'Lagerbewegung'                         },
    'Registrar Devolução':             { 'pt-BR':'Registrar Devolução',             'en':'Register Return',                     'de':'Rückgabe registrieren'                 },
    'Anexar Termo Assinado':           { 'pt-BR':'Anexar Termo Assinado',           'en':'Attach Signed Term',                  'de':'Unterzeichnetes Dokument anhängen'     },
    'Enviar Documento PDF':            { 'pt-BR':'Enviar Documento PDF',            'en':'Upload PDF Document',                 'de':'PDF-Dokument hochladen'                },
    'Editar Usuário':                  { 'pt-BR':'Editar Usuário',                  'en':'Edit User',                           'de':'Benutzer bearbeiten'                   },
    'Excluir Item':                    { 'pt-BR':'Excluir Item',                    'en':'Delete Item',                         'de':'Artikel löschen'                       },
    'Excluir Amostra':                 { 'pt-BR':'Excluir Amostra',                 'en':'Delete Sample',                       'de':'Probe löschen'                         },
    'Excluir Tarefa':                  { 'pt-BR':'Excluir Tarefa',                  'en':'Delete Task',                         'de':'Aufgabe löschen'                       },
    'Nova Tarefa':                     { 'pt-BR':'Nova Tarefa',                     'en':'New Task',                            'de':'Neue Aufgabe'                          },
    'Editar Tarefa':                   { 'pt-BR':'Editar Tarefa',                   'en':'Edit Task',                           'de':'Aufgabe bearbeiten'                    },
    'Salvar Tarefa':                   { 'pt-BR':'Salvar Tarefa',                   'en':'Save Task',                           'de':'Aufgabe speichern'                     },
    'Tipo de atividade':               { 'pt-BR':'Tipo de atividade',               'en':'Activity type',                       'de':'Aktivitätstyp'                         },
    'Selecione a quem atribuir a tarefa.': { 'pt-BR':'Selecione a quem atribuir a tarefa.', 'en':'Select who to assign the task to.', 'de':'Wählen Sie aus, wem die Aufgabe zugewiesen wird.' },
    'Erro ao mover tarefa.':           { 'pt-BR':'Erro ao mover tarefa.',           'en':'Error moving task.',                  'de':'Fehler beim Verschieben der Aufgabe.'  },
    'Nota do Diretor':                 { 'pt-BR':'Nota do Diretor',                 'en':"Director's Note",                     'de':'Notiz des Direktors'                   },
    'Salvar Nota':                     { 'pt-BR':'Salvar Nota',                     'en':'Save Note',                           'de':'Notiz speichern'                       },
    'Adicionar Nota':                  { 'pt-BR':'Adicionar Nota',                  'en':'Add Note',                            'de':'Notiz hinzufügen'                      },

    // ── Labels de formulário ────────────────────────────────────────
    'Título da tarefa':                { 'pt-BR':'Título da tarefa',                'en':'Task title',                          'de':'Aufgabentitel'                         },
    'Coluna':                          { 'pt-BR':'Coluna',                          'en':'Column',                              'de':'Spalte'                                },
    'Prioridade':                      { 'pt-BR':'Prioridade',                      'en':'Priority',                            'de':'Priorität'                             },
    'Prazo':                           { 'pt-BR':'Prazo',                           'en':'Deadline',                            'de':'Frist'                                 },
    'Tags':                            { 'pt-BR':'Tags',                            'en':'Tags',                                'de':'Tags'                                  },
    'Comentário':                      { 'pt-BR':'Comentário',                      'en':'Comment',                             'de':'Kommentar'                             },
    'Nota (1 a 5)':                    { 'pt-BR':'Nota (1 a 5)',                    'en':'Rating (1 to 5)',                     'de':'Bewertung (1 bis 5)'                   },
    'Serviço de referência (opcional)':{ 'pt-BR':'Serviço de referência (opcional)','en':'Reference service (optional)',        'de':'Referenzdienst (optional)'             },
    'Nome completo':                   { 'pt-BR':'Nome completo',                   'en':'Full name',                           'de':'Vollständiger Name'                    },
    'Nome do cliente':                 { 'pt-BR':'Nome do cliente',                 'en':'Client name',                        'de':'Kundenname'                            },
    'Nome do técnico':                 { 'pt-BR':'Nome do técnico',                 'en':'Technician name',                    'de':'Techniker-Name'                        },
    'Nome do usuário':                 { 'pt-BR':'Nome do usuário',                 'en':'Username',                            'de':'Benutzername'                          },
    'Nome ou empresa':                 { 'pt-BR':'Nome ou empresa',                 'en':'Name or company',                    'de':'Name oder Unternehmen'                 },
    'Nome / Descrição do Arquivo':     { 'pt-BR':'Nome / Descrição do Arquivo',     'en':'File Name / Description',             'de':'Dateiname / Beschreibung'              },
    'CPF ou CNPJ':                     { 'pt-BR':'CPF ou CNPJ',                     'en':'Tax ID',                              'de':'Steuernummer'                          },
    'Endereço completo':               { 'pt-BR':'Endereço completo',               'en':'Full address',                        'de':'Vollständige Adresse'                  },
    'Data de Entrada':                 { 'pt-BR':'Data de Entrada',                 'en':'Entry Date',                          'de':'Eingabedatum'                          },
    'Devolução Prevista':              { 'pt-BR':'Devolução Prevista',              'en':'Expected Return',                     'de':'Geplante Rückgabe'                     },
    'Data de Devolução':               { 'pt-BR':'Data de Devolução',               'en':'Return Date',                         'de':'Rückgabedatum'                         },
    'Responsável pelo Recebimento':    { 'pt-BR':'Responsável pelo Recebimento',    'en':'Receiving Responsible',               'de':'Empfangsverantwortlicher'              },
    'Responsável pela Devolução':      { 'pt-BR':'Responsável pela Devolução',      'en':'Return Responsible',                  'de':'Rückgabeverantwortlicher'              },
    'OS / Referência do Serviço':      { 'pt-BR':'OS / Referência do Serviço',      'en':'WO / Service Reference',              'de':'AO / Dienstreferenz'                   },
    'Descrição das Peças':             { 'pt-BR':'Descrição das Peças',             'en':'Parts Description',                   'de':'Teilebeschreibung'                     },
    'Arquivo do Termo Assinado (PDF)': { 'pt-BR':'Arquivo do Termo Assinado (PDF)','en':'Signed Term File (PDF)',               'de':'Unterzeichnetes Dokument (PDF)'        },
    'Tipo de Documento':               { 'pt-BR':'Tipo de Documento',               'en':'Document Type',                       'de':'Dokumenttyp'                          },
    'Tipo de movimentação':            { 'pt-BR':'Tipo de movimentação',            'en':'Movement type',                       'de':'Bewegungstyp'                          },
    'Nome do Item':                    { 'pt-BR':'Nome do Item',                    'en':'Item Name',                           'de':'Artikelname'                           },
    'Estoque Mínimo':                  { 'pt-BR':'Estoque Mínimo',                  'en':'Minimum Stock',                       'de':'Mindestbestand'                        },
    'Unidade':                         { 'pt-BR':'Unidade',                         'en':'Unit',                                'de':'Einheit'                               },
    'Quantidade':                      { 'pt-BR':'Quantidade',                      'en':'Quantity',                            'de':'Menge'                                 },
    'Data do Documento':               { 'pt-BR':'Data do Documento',               'en':'Document Date',                       'de':'Dokumentdatum'                         },
    'Data de Validade':                { 'pt-BR':'Data de Validade',                'en':'Expiry Date',                         'de':'Ablaufdatum'                           },
    'Senha':                           { 'pt-BR':'Senha',                           'en':'Password',                            'de':'Passwort'                              },
    'Entrada':                         { 'pt-BR':'Entrada',                         'en':'Input',                               'de':'Eingang'                               },
    'Saída':                           { 'pt-BR':'Saída',                           'en':'Output',                              'de':'Ausgang'                               },
    'Estagiário responsável':          { 'pt-BR':'Estagiário responsável',          'en':'Responsible intern',                  'de':'Zuständiger Praktikant'                },
    'Comentário da avaliação':         { 'pt-BR':'Comentário da avaliação',         'en':'Evaluation comment',                  'de':'Bewertungskommentar'                   },
    'Avaliação do Estagiário':         { 'pt-BR':'Avaliação do Estagiário',         'en':'Intern Evaluation',                   'de':'Praktikantenbewertung'                 },

    // ── Tipos de documento ──────────────────────────────────────────
    'Certificado de Treinamento':      { 'pt-BR':'Certificado de Treinamento',      'en':'Training Certificate',                'de':'Schulungszertifikat'                   },
    'Termo de Confidencialidade':      { 'pt-BR':'Termo de Confidencialidade',      'en':'Confidentiality Agreement',           'de':'Vertraulichkeitsvereinbarung'          },
    'Formulário de Avaliação':         { 'pt-BR':'Formulário de Avaliação',         'en':'Evaluation Form',                     'de':'Bewertungsformular'                    },
    'Atestado Médico':                 { 'pt-BR':'Atestado Médico',                 'en':'Medical Certificate',                 'de':'Ärztliches Attest'                     },
    'Outro':                           { 'pt-BR':'Outro',                           'en':'Other',                               'de':'Sonstiges'                             },

    // ── Tipos de manutenção ─────────────────────────────────────────
    'Limpeza':                         { 'pt-BR':'Limpeza',                         'en':'Cleaning',                            'de':'Reinigung'                             },
    'Troca de Componente':             { 'pt-BR':'Troca de Componente',             'en':'Component Replacement',               'de':'Komponentenaustausch'                  },
    'Calibração':                      { 'pt-BR':'Calibração',                      'en':'Calibration',                         'de':'Kalibrierung'                          },

    // ── KPI / Dashboard labels ──────────────────────────────────────
    'Total de Itens':                  { 'pt-BR':'Total de Itens',                  'en':'Total Items',                         'de':'Artikel gesamt'                        },
    'Estoque Crítico':                 { 'pt-BR':'Estoque Crítico',                 'en':'Critical Stock',                      'de':'Kritischer Bestand'                    },
    'Entradas Hoje':                   { 'pt-BR':'Entradas Hoje',                   'en':'Entries Today',                       'de':'Eingänge heute'                        },
    'Saídas Hoje':                     { 'pt-BR':'Saídas Hoje',                     'en':'Outputs Today',                       'de':'Ausgänge heute'                        },
    'Total de Amostras':               { 'pt-BR':'Total de Amostras',               'en':'Total Samples',                       'de':'Proben gesamt'                         },
    'Em Custódia':                     { 'pt-BR':'Em Custódia',                     'en':'In Custody',                          'de':'In Verwahrung'                         },
    'Devolução Vencendo':              { 'pt-BR':'Devolução Vencendo',              'en':'Return Expiring',                     'de':'Rückgabe läuft ab'                     },
    'Devolvidas':                      { 'pt-BR':'Devolvidas',                      'en':'Returned',                            'de':'Zurückgegeben'                         },
    'NPS Score':                       { 'pt-BR':'NPS Score',                       'en':'NPS Score',                           'de':'NPS-Wert'                              },
    'Total Respostas':                 { 'pt-BR':'Total Respostas',                 'en':'Total Responses',                     'de':'Antworten gesamt'                      },
    'Total de Eventos':                { 'pt-BR':'Total de Eventos',               'en':'Total Events',                        'de':'Veranstaltungen gesamt'                },
    'Adesão Média':                    { 'pt-BR':'Adesão Média',                    'en':'Avg. Attendance',                     'de':'Durchschnittl. Teilnahme'              },
    'Total de OS':                     { 'pt-BR':'Total de OS',                     'en':'Total WOs',                           'de':'AO gesamt'                             },
    'Receita Total':                   { 'pt-BR':'Receita Total',                   'en':'Total Revenue',                       'de':'Gesamtumsatz'                          },
    'Próximas Visitas':                { 'pt-BR':'Próximas Visitas',                'en':'Upcoming Visits',                     'de':'Bevorstehende Besuche'                 },
    'Projetos em Andamento':           { 'pt-BR':'Projetos em Andamento',           'en':'Ongoing Projects',                    'de':'Laufende Projekte'                     },
    'Estagiários Ativos':              { 'pt-BR':'Estagiários Ativos',              'en':'Active Interns',                      'de':'Aktive Praktikanten'                   },
    'Total de Tarefas':                { 'pt-BR':'Total de Tarefas',                'en':'Total Tasks',                         'de':'Aufgaben gesamt'                       },
    'Taxa de Conclusão':               { 'pt-BR':'Taxa de Conclusão',               'en':'Completion Rate',                     'de':'Abschlussquote'                        },
    'Nota Média Geral':                { 'pt-BR':'Nota Média Geral',                'en':'Overall Avg. Rating',                 'de':'Gesamtdurchschnitt'                    },
    'Tarefas por Estagiário':          { 'pt-BR':'Tarefas por Estagiário',          'en':'Tasks by Intern',                     'de':'Aufgaben pro Praktikant'               },
    'Últimas Notas':                   { 'pt-BR':'Últimas Notas',                   'en':'Latest Notes',                        'de':'Letzte Notizen'                        },
    'Desempenho Individual':           { 'pt-BR':'Desempenho Individual',           'en':'Individual Performance',              'de':'Individuelle Leistung'                 },

    // ── Kanban ──────────────────────────────────────────────────────
    'Kanban de Atividades':            { 'pt-BR':'Kanban de Atividades',            'en':'Activities Kanban',                   'de':'Aktivitäten-Kanban'                    },
    'Atribua e acompanhe atividades de Estagiários, Técnicos e Gestores em tempo real': { 'pt-BR':'Atribua e acompanhe atividades de Estagiários, Técnicos e Gestores em tempo real', 'en':'Assign and track activities for Interns, Technicians and Managers in real time', 'de':'Aktivitäten für Praktikanten, Techniker und Manager zuweisen und verfolgen' },
    'Ver Desempenho':                  { 'pt-BR':'Ver Desempenho',                  'en':'View Performance',                    'de':'Leistung ansehen'                      },
    'Abrir Kanban':                    { 'pt-BR':'Abrir Kanban',                    'en':'Open Kanban',                         'de':'Kanban öffnen'                         },
    'Estagiário:':                     { 'pt-BR':'Estagiário:',                     'en':'Intern:',                             'de':'Praktikant:'                           },
    'Prioridade:':                     { 'pt-BR':'Prioridade:',                     'en':'Priority:',                           'de':'Priorität:'                            },
    'Urgente':                         { 'pt-BR':'Urgente',                         'en':'Urgent',                              'de':'Dringend'                              },
    'Alta':                            { 'pt-BR':'Alta',                            'en':'High',                                'de':'Hoch'                                  },
    'Média':                           { 'pt-BR':'Média',                           'en':'Medium',                              'de':'Mittel'                                },
    'Baixa':                           { 'pt-BR':'Baixa',                           'en':'Low',                                 'de':'Niedrig'                               },
    'Em Revisão':                      { 'pt-BR':'Em Revisão',                      'en':'In Review',                           'de':'In Überprüfung'                        },
    'Nenhuma tarefa aqui':             { 'pt-BR':'Nenhuma tarefa aqui',             'en':'No tasks here',                       'de':'Keine Aufgaben hier'                   },
    'Mover para Backlog':              { 'pt-BR':'Mover para Backlog',              'en':'Move to Backlog',                     'de':'Nach Rückstand verschieben'            },
    'Mover para Em Andamento':         { 'pt-BR':'Mover para Em Andamento',         'en':'Move to In Progress',                 'de':'Nach In Bearbeitung verschieben'       },
    'Mover para Em Revisão':           { 'pt-BR':'Mover para Em Revisão',           'en':'Move to In Review',                   'de':'Nach Überprüfung verschieben'          },
    'Mover para Concluído':            { 'pt-BR':'Mover para Concluído',            'en':'Move to Done',                        'de':'Nach Erledigt verschieben'             },
    'Tarefas':                         { 'pt-BR':'Tarefas',                         'en':'Tasks',                               'de':'Aufgaben'                              },
    'tarefa':                          { 'pt-BR':'tarefa',                          'en':'task',                                'de':'Aufgabe'                               },
    'tarefas':                         { 'pt-BR':'tarefas',                         'en':'tasks',                               'de':'Aufgaben'                              },
    'visíveis':                        { 'pt-BR':'visíveis',                        'en':'visible',                             'de':'sichtbar'                              },
    'Área':                            { 'pt-BR':'Área',                            'en':'Area',                                'de':'Bereich'                               },
    'Vencidas':                        { 'pt-BR':'Vencidas',                        'en':'Overdue',                             'de':'Überfällig'                            },
    'Taxa':                            { 'pt-BR':'Taxa',                            'en':'Rate',                                'de':'Quote'                                 },
    'Nota Média':                      { 'pt-BR':'Nota Média',                      'en':'Avg. Rating',                         'de':'Durchschnittsnote'                     },
    'Avaliar':                         { 'pt-BR':'Avaliar',                         'en':'Evaluate',                            'de':'Bewerten'                              },
    'em estágio':                      { 'pt-BR':'em estágio',                      'en':'in internship',                       'de':'im Praktikum'                          },
    'concluídas':                      { 'pt-BR':'concluídas',                      'en':'completed',                           'de':'abgeschlossen'                         },
    'geral do time':                   { 'pt-BR':'geral do time',                   'en':'overall team',                        'de':'Team-Gesamt'                           },
    'avaliações do diretor':           { 'pt-BR':'avaliações do diretor',           'en':'director evaluations',                'de':'Direktorbewertungen'                   },

    // ── Dashboard de estagiários ────────────────────────────────────
    'Dashboard de Estagiários':        { 'pt-BR':'Dashboard de Estagiários',        'en':'Interns Dashboard',                   'de':'Praktikanten-Dashboard'                },
    'Desempenho, tarefas e notas do diretor em tempo real': { 'pt-BR':'Desempenho, tarefas e notas do diretor em tempo real', 'en':'Performance, tasks and director notes in real time', 'de':'Leistung, Aufgaben und Bewertungen in Echtzeit' },

    // ── Login ───────────────────────────────────────────────────────
    'Bem-vindo':                       { 'pt-BR':'Bem-vindo',                       'en':'Welcome',                             'de':'Willkommen'                            },
    'Insira suas credenciais para acessar o sistema.': { 'pt-BR':'Insira suas credenciais para acessar o sistema.', 'en':'Enter your credentials to access the system.', 'de':'Geben Sie Ihre Anmeldedaten ein.' },
    'E-mail institucional':            { 'pt-BR':'E-mail institucional',            'en':'Institutional email',                 'de':'Institutionelle E-Mail'                },
    'Entrar no Sistema':               { 'pt-BR':'Entrar no Sistema',               'en':'Sign In',                             'de':'Anmelden'                              },
    'Entrando…':                       { 'pt-BR':'Entrando…',                       'en':'Signing in…',                         'de':'Anmeldung…'                            },
    'Acesso Seguro':                   { 'pt-BR':'Acesso Seguro',                   'en':'Secure Access',                       'de':'Sicherer Zugang'                       },
    'Credenciais inválidas.':          { 'pt-BR':'Credenciais inválidas.',          'en':'Invalid credentials.',                'de':'Ungültige Anmeldedaten.'               },
    'Verifique seu e-mail e senha e tente novamente.': { 'pt-BR':'Verifique seu e-mail e senha e tente novamente.', 'en':'Check your email and password and try again.', 'de':'Überprüfen Sie E-Mail und Passwort.' },

    // ── Máquinas ────────────────────────────────────────────────────
    'Máquinas do Laboratório':         { 'pt-BR':'Máquinas do Laboratório',         'en':'Laboratory Machines',                 'de':'Labormaschinen'                        },
    'Visão Geral':                     { 'pt-BR':'Visão Geral',                     'en':'Overview',                            'de':'Übersicht'                             },
    'Registros de Uso':                { 'pt-BR':'Registros de Uso',                'en':'Usage Records',                       'de':'Nutzungsaufzeichnungen'                },
    'Manutenção':                      { 'pt-BR':'Manutenção',                      'en':'Maintenance',                         'de':'Wartung'                               },
    'Agendamentos':                    { 'pt-BR':'Agendamentos',                    'en':'Appointments',                        'de':'Termine'                               },
    'Equipamentos CMM':                { 'pt-BR':'Equipamentos CMM',                'en':'CMM Equipment',                       'de':'CMM-Ausrüstung'                        },
    'Scanners 3D':                     { 'pt-BR':'Scanners 3D',                     'en':'3D Scanners',                         'de':'3D-Scanner'                            },
    'Carregando máquinas…':            { 'pt-BR':'Carregando máquinas…',            'en':'Loading machines…',                   'de':'Maschinen werden geladen…'             },
    'Histórico de Uso':                { 'pt-BR':'Histórico de Uso',                'en':'Usage History',                       'de':'Nutzungsverlauf'                       },
    'Registros de Manutenção':         { 'pt-BR':'Registros de Manutenção',         'en':'Maintenance Records',                 'de':'Wartungsaufzeichnungen'                },
    'Itens em Estoque':                { 'pt-BR':'Itens em Estoque',                'en':'Items in Stock',                      'de':'Lagerartikel'                          },

    // ── Tipos de medição (Máquinas) ───────────────────────────────────
    'Medição por Coordenadas (CMM)':   { 'pt-BR':'Medição por Coordenadas (CMM)',   'en':'Coordinate Measurement (CMM)',        'de':'Koordinatenmessung (KMG)'              },
    'Multi-sensor Óptico':             { 'pt-BR':'Multi-sensor Óptico',             'en':'Optical Multi-sensor',                'de':'Optischer Multisensor'                 },
    'Tomografia Computadorizada (CT)': { 'pt-BR':'Tomografia Computadorizada (CT)', 'en':'Computed Tomography (CT)',            'de':'Computertomographie (CT)'              },

    // ── Calendário / eventos ────────────────────────────────────────
    'Próximos eventos':                { 'pt-BR':'Próximos eventos',                'en':'Upcoming events',                     'de':'Nächste Veranstaltungen'               },
    'Hoje':                            { 'pt-BR':'Hoje',                            'en':'Today',                               'de':'Heute'                                 },

    // ── Miscellaneous UI ────────────────────────────────────────────
    'Informações Principais':          { 'pt-BR':'Informações Principais',          'en':'Main Information',                    'de':'Hauptinformationen'                    },
    'Dados do usuário':                { 'pt-BR':'Dados do usuário',                'en':'User data',                           'de':'Benutzerdaten'                         },
    'Permissões':                      { 'pt-BR':'Permissões',                      'en':'Permissions',                         'de':'Berechtigungen'                        },
    'Documentos':                      { 'pt-BR':'Documentos',                      'en':'Documents',                           'de':'Dokumente'                             },
    'Criar registros':                 { 'pt-BR':'Criar registros',                 'en':'Create records',                      'de':'Einträge erstellen'                    },
    'Editar registros':                { 'pt-BR':'Editar registros',                'en':'Edit records',                        'de':'Einträge bearbeiten'                   },
    'Excluir registros':               { 'pt-BR':'Excluir registros',               'en':'Delete records',                      'de':'Einträge löschen'                      },
    'Ações gerais':                    { 'pt-BR':'Ações gerais',                    'en':'General actions',                     'de':'Allgemeine Aktionen'                   },
    'Módulos':                         { 'pt-BR':'Módulos',                         'en':'Modules',                             'de':'Module'                                },
    'Dados financeiros':               { 'pt-BR':'Dados financeiros',               'en':'Financial data',                      'de':'Finanzdaten'                           },
    'Histórico:':                      { 'pt-BR':'Histórico:',                      'en':'History:',                            'de':'Verlauf:'                              },
    'Mínimo 6 caracteres.':            { 'pt-BR':'Mínimo 6 caracteres.',            'en':'Minimum 6 characters.',               'de':'Mindestens 6 Zeichen.'                 },
    'Será usado para login no sistema.': { 'pt-BR':'Será usado para login no sistema.', 'en':'Will be used to log in to the system.', 'de':'Wird für die Anmeldung verwendet.' },
    'O cargo define as permissões padrão. Ajuste-as na aba Permissões.': { 'pt-BR':'O cargo define as permissões padrão. Ajuste-as na aba Permissões.', 'en':'The role defines default permissions. Adjust them in the Permissions tab.', 'de':'Die Rolle definiert die Standardberechtigungen. Passen Sie diese im Tab Berechtigungen an.' },
    'Deixe em branco se não tiver prazo de vencimento.': { 'pt-BR':'Deixe em branco se não tiver prazo de vencimento.', 'en':'Leave blank if there is no expiry date.', 'de':'Leer lassen, wenn kein Ablaufdatum vorhanden.' },
    'Máximo 20 MB. Somente arquivos PDF.': { 'pt-BR':'Máximo 20 MB. Somente arquivos PDF.', 'en':'Maximum 20 MB. PDF files only.', 'de':'Maximal 20 MB. Nur PDF-Dateien.' },
    'Carregando...':                   { 'pt-BR':'Carregando...',                   'en':'Loading...',                          'de':'Wird geladen...'                       },
    'Sim':                             { 'pt-BR':'Sim',                             'en':'Yes',                                 'de':'Ja'                                    },
    'Não':                             { 'pt-BR':'Não',                             'en':'No',                                  'de':'Nein'                                  },
    'Voltar aos Editais':              { 'pt-BR':'Voltar aos Editais',              'en':'Back to Tenders',                     'de':'Zurück zu Ausschreibungen'             },
    'Voltar à Lista':                  { 'pt-BR':'Voltar à Lista',                  'en':'Back to List',                        'de':'Zurück zur Liste'                      },
    'Edital não encontrado':           { 'pt-BR':'Edital não encontrado',           'en':'Tender not found',                    'de':'Ausschreibung nicht gefunden'          },
    'Acessar Editais':                 { 'pt-BR':'Acessar Editais',                 'en':'Access Tenders',                      'de':'Ausschreibungen öffnen'                },
    'Acessar Documentos PDF':          { 'pt-BR':'Acessar Documentos PDF',          'en':'Access PDF Documents',                'de':'PDF-Dokumente öffnen'                  },
    'Ver valores, custos e retornos financeiros': { 'pt-BR':'Ver valores, custos e retornos financeiros', 'en':'View values, costs and financial returns', 'de':'Werte, Kosten und Erträge anzeigen' },
    'Mostrar/ocultar senha':           { 'pt-BR':'Mostrar/ocultar senha',           'en':'Show/hide password',                  'de':'Passwort anzeigen/verbergen'           },

    // ── Relatório impresso ──────────────────────────────────────────
    'Relatório de Desempenho':         { 'pt-BR':'Relatório de Desempenho',         'en':'Performance Report',                  'de':'Leistungsbericht'                      },
    'Emitido em':                      { 'pt-BR':'Emitido em',                      'en':'Issued on',                           'de':'Ausgestellt am'                        },
    'Tarefas Atribuídas':              { 'pt-BR':'Tarefas Atribuídas',              'en':'Assigned Tasks',                      'de':'Zugewiesene Aufgaben'                  },
    'Notas do Diretor':                { 'pt-BR':'Notas do Diretor',                'en':"Director's Notes",                    'de':'Notizen des Direktors'                 },

    // ── Toasts — sucesso ────────────────────────────────────────────
    'Item cadastrado com sucesso!':    { 'pt-BR':'Item cadastrado com sucesso!',    'en':'Item registered successfully!',       'de':'Artikel erfolgreich registriert!'      },
    'Item atualizado.':                { 'pt-BR':'Item atualizado.',                'en':'Item updated.',                       'de':'Artikel aktualisiert.'                 },
    'Item excluído.':                  { 'pt-BR':'Item excluído.',                  'en':'Item deleted.',                       'de':'Artikel gelöscht.'                     },
    'Amostra cadastrada com sucesso!': { 'pt-BR':'Amostra cadastrada com sucesso!', 'en':'Sample registered successfully!',     'de':'Probe erfolgreich registriert!'        },
    'Amostra atualizada.':             { 'pt-BR':'Amostra atualizada.',             'en':'Sample updated.',                     'de':'Probe aktualisiert.'                   },
    'Devolução registrada com sucesso!': { 'pt-BR':'Devolução registrada com sucesso!', 'en':'Return registered successfully!', 'de':'Rückgabe erfolgreich registriert!'     },
    'Registro excluído.':              { 'pt-BR':'Registro excluído.',              'en':'Record deleted.',                     'de':'Eintrag gelöscht.'                     },
    'Documento enviado com sucesso!':  { 'pt-BR':'Documento enviado com sucesso!',  'en':'Document uploaded successfully!',     'de':'Dokument erfolgreich hochgeladen!'     },
    'Documento excluído.':             { 'pt-BR':'Documento excluído.',             'en':'Document deleted.',                   'de':'Dokument gelöscht.'                    },
    'Documento anexado!':              { 'pt-BR':'Documento anexado!',              'en':'Document attached!',                  'de':'Dokument angehängt!'                   },
    'Documento atualizado!':           { 'pt-BR':'Documento atualizado!',           'en':'Document updated!',                   'de':'Dokument aktualisiert!'                },
    'Documento removido.':             { 'pt-BR':'Documento removido.',             'en':'Document removed.',                   'de':'Dokument entfernt.'                    },
    'Evento atualizado com sucesso!':  { 'pt-BR':'Evento atualizado com sucesso!',  'en':'Event updated successfully!',         'de':'Veranstaltung erfolgreich aktualisiert!' },
    'Evento criado com sucesso!':      { 'pt-BR':'Evento criado com sucesso!',      'en':'Event created successfully!',         'de':'Veranstaltung erfolgreich erstellt!'   },
    'Evento excluído.':                { 'pt-BR':'Evento excluído.',                'en':'Event deleted.',                      'de':'Veranstaltung gelöscht.'               },
    'Edital atualizado com sucesso!':  { 'pt-BR':'Edital atualizado com sucesso!',  'en':'Tender updated successfully!',        'de':'Ausschreibung erfolgreich aktualisiert!' },
    'Edital criado com sucesso!':      { 'pt-BR':'Edital criado com sucesso!',      'en':'Tender created successfully!',        'de':'Ausschreibung erfolgreich erstellt!'   },
    'Edital excluído.':                { 'pt-BR':'Edital excluído.',                'en':'Tender deleted.',                     'de':'Ausschreibung gelöscht.'               },
    'Projeto atualizado!':             { 'pt-BR':'Projeto atualizado!',             'en':'Project updated!',                    'de':'Projekt aktualisiert!'                 },
    'Projeto criado!':                 { 'pt-BR':'Projeto criado!',                 'en':'Project created!',                    'de':'Projekt erstellt!'                     },
    'Projeto excluído.':               { 'pt-BR':'Projeto excluído.',               'en':'Project deleted.',                    'de':'Projekt gelöscht.'                     },
    'Visita atualizada com sucesso!':  { 'pt-BR':'Visita atualizada com sucesso!',  'en':'Visit updated successfully!',         'de':'Besuch erfolgreich aktualisiert!'      },
    'Visita agendada com sucesso!':    { 'pt-BR':'Visita agendada com sucesso!',    'en':'Visit scheduled successfully!',       'de':'Besuch erfolgreich geplant!'           },
    'Visita excluída.':                { 'pt-BR':'Visita excluída.',                'en':'Visit deleted.',                      'de':'Besuch gelöscht.'                      },
    'Usuário atualizado com sucesso!': { 'pt-BR':'Usuário atualizado com sucesso!', 'en':'User updated successfully!',          'de':'Benutzer erfolgreich aktualisiert!'    },
    'Usuário criado com sucesso!':     { 'pt-BR':'Usuário criado com sucesso!',     'en':'User created successfully!',          'de':'Benutzer erfolgreich erstellt!'        },
    'Usuário excluído.':               { 'pt-BR':'Usuário excluído.',               'en':'User deleted.',                       'de':'Benutzer gelöscht.'                    },
    'Ordem de Serviço atualizada com sucesso!': { 'pt-BR':'Ordem de Serviço atualizada com sucesso!', 'en':'Work Order updated successfully!', 'de':'Arbeitsauftrag erfolgreich aktualisiert!' },
    'Ordem de Serviço criada com sucesso!': { 'pt-BR':'Ordem de Serviço criada com sucesso!', 'en':'Work Order created successfully!', 'de':'Arbeitsauftrag erfolgreich erstellt!' },
    'OS excluída com sucesso.':        { 'pt-BR':'OS excluída com sucesso.',        'en':'Work Order deleted successfully.',    'de':'Arbeitsauftrag erfolgreich gelöscht.'  },
    'Nota salva com sucesso!':         { 'pt-BR':'Nota salva com sucesso!',         'en':'Note saved successfully!',            'de':'Notiz erfolgreich gespeichert!'        },
    'Nota do diretor salva!':          { 'pt-BR':'Nota do diretor salva!',          'en':"Director's note saved!",              'de':'Notiz des Direktors gespeichert!'      },
    'Máquina desligada com sucesso.':  { 'pt-BR':'Máquina desligada com sucesso.',  'en':'Machine turned off successfully.',    'de':'Maschine erfolgreich ausgeschaltet.'   },
    'Manutenção atualizada.':          { 'pt-BR':'Manutenção atualizada.',          'en':'Maintenance updated.',                'de':'Wartung aktualisiert.'                 },
    'Manutenção registrada.':          { 'pt-BR':'Manutenção registrada.',          'en':'Maintenance registered.',             'de':'Wartung registriert.'                  },
    'Manutenção atualizada!':          { 'pt-BR':'Manutenção atualizada!',          'en':'Maintenance updated!',                'de':'Wartung aktualisiert!'                 },
    'Manutenção registrada!':          { 'pt-BR':'Manutenção registrada!',          'en':'Maintenance registered!',             'de':'Wartung registriert!'                  },
    'Manutenção excluída.':            { 'pt-BR':'Manutenção excluída.',            'en':'Maintenance deleted.',                'de':'Wartung gelöscht.'                     },
    'Agendamento atualizado.':         { 'pt-BR':'Agendamento atualizado.',         'en':'Appointment updated.',                'de':'Termin aktualisiert.'                  },
    'Agendamento criado.':             { 'pt-BR':'Agendamento criado.',             'en':'Appointment created.',                'de':'Termin erstellt.'                      },
    'Tarefa atualizada!':              { 'pt-BR':'Tarefa atualizada!',              'en':'Task updated!',                       'de':'Aufgabe aktualisiert!'                 },
    'Tarefa criada!':                  { 'pt-BR':'Tarefa criada!',                  'en':'Task created!',                      'de':'Aufgabe erstellt!'                     },
    'Tarefa excluída.':                { 'pt-BR':'Tarefa excluída.',                'en':'Task deleted.',                       'de':'Aufgabe gelöscht.'                     },
    'Verificação ambiental registrada com sucesso!': { 'pt-BR':'Verificação ambiental registrada com sucesso!', 'en':'Environmental check registered successfully!', 'de':'Umgebungscheck erfolgreich registriert!' },
    'Retirada registrada com sucesso!':{ 'pt-BR':'Retirada registrada com sucesso!','en':'Withdrawal registered successfully!', 'de':'Entnahme erfolgreich registriert!'     },

    // ── Toasts — erro ───────────────────────────────────────────────
    'Preencha todos os campos obrigatórios.': { 'pt-BR':'Preencha todos os campos obrigatórios.', 'en':'Fill in all required fields.', 'de':'Füllen Sie alle Pflichtfelder aus.' },
    'Erro ao carregar eventos.':       { 'pt-BR':'Erro ao carregar eventos.',       'en':'Error loading events.',               'de':'Fehler beim Laden der Veranstaltungen.' },
    'Erro ao excluir evento.':         { 'pt-BR':'Erro ao excluir evento.',         'en':'Error deleting event.',               'de':'Fehler beim Löschen der Veranstaltung.' },
    'Não foi possível carregar o evento.': { 'pt-BR':'Não foi possível carregar o evento.', 'en':'Could not load the event.', 'de':'Veranstaltung konnte nicht geladen werden.' },
    'Erro ao carregar OS.':            { 'pt-BR':'Erro ao carregar OS.',            'en':'Error loading work orders.',          'de':'Fehler beim Laden der Arbeitsaufträge.' },
    'Erro ao salvar OS.':              { 'pt-BR':'Erro ao salvar OS.',              'en':'Error saving work order.',            'de':'Fehler beim Speichern des Arbeitsauftrags.' },
    'Erro ao excluir OS.':             { 'pt-BR':'Erro ao excluir OS.',             'en':'Error deleting work order.',          'de':'Fehler beim Löschen des Arbeitsauftrags.' },
    'Erro ao carregar serviços.':      { 'pt-BR':'Erro ao carregar serviços.',      'en':'Error loading services.',             'de':'Fehler beim Laden der Dienste.'        },
    'Erro ao salvar nota.':            { 'pt-BR':'Erro ao salvar nota.',            'en':'Error saving note.',                  'de':'Fehler beim Speichern der Notiz.'      },
    'Erro ao carregar dados do dashboard.': { 'pt-BR':'Erro ao carregar dados do dashboard.', 'en':'Error loading dashboard data.', 'de':'Fehler beim Laden der Dashboard-Daten.' },
    'Erro ao salvar tarefa.':          { 'pt-BR':'Erro ao salvar tarefa.',          'en':'Error saving task.',                  'de':'Fehler beim Speichern der Aufgabe.'    },
    'Erro ao excluir tarefa.':         { 'pt-BR':'Erro ao excluir tarefa.',         'en':'Error deleting task.',                'de':'Fehler beim Löschen der Aufgabe.'      },
    'Erro ao carregar editais.':       { 'pt-BR':'Erro ao carregar editais.',       'en':'Error loading tenders.',              'de':'Fehler beim Laden der Ausschreibungen.' },
    'Erro ao excluir edital.':         { 'pt-BR':'Erro ao excluir edital.',         'en':'Error deleting tender.',              'de':'Fehler beim Löschen der Ausschreibung.' },
    'Erro ao excluir documento.':      { 'pt-BR':'Erro ao excluir documento.',      'en':'Error deleting document.',            'de':'Fehler beim Löschen des Dokuments.'    },
    'Erro ao carregar documentos.':    { 'pt-BR':'Erro ao carregar documentos.',    'en':'Error loading documents.',            'de':'Fehler beim Laden der Dokumente.'      },
    'Apenas arquivos PDF são aceitos.':{ 'pt-BR':'Apenas arquivos PDF são aceitos.','en':'Only PDF files are accepted.',        'de':'Nur PDF-Dateien werden akzeptiert.'    },
    'Somente arquivos PDF são aceitos':{ 'pt-BR':'Somente arquivos PDF são aceitos','en':'Only PDF files are accepted',         'de':'Nur PDF-Dateien werden akzeptiert'     },
    'Erro ao carregar visitas técnicas.': { 'pt-BR':'Erro ao carregar visitas técnicas.', 'en':'Error loading technical visits.', 'de':'Fehler beim Laden der Besuche.'      },
    'Não foi possível carregar a visita.': { 'pt-BR':'Não foi possível carregar a visita.', 'en':'Could not load the visit.', 'de':'Besuch konnte nicht geladen werden.'    },
    'Erro ao excluir visita.':         { 'pt-BR':'Erro ao excluir visita.',         'en':'Error deleting visit.',               'de':'Fehler beim Löschen des Besuchs.'      },
    'Este e-mail já está em uso por outro usuário.': { 'pt-BR':'Este e-mail já está em uso por outro usuário.', 'en':'This email is already in use by another user.', 'de':'Diese E-Mail wird bereits von einem anderen Benutzer verwendet.' },
    'Já existe um usuário com este e-mail.': { 'pt-BR':'Já existe um usuário com este e-mail.', 'en':'A user with this email already exists.', 'de':'Ein Benutzer mit dieser E-Mail existiert bereits.' },
    'Você não pode excluir o próprio usuário.': { 'pt-BR':'Você não pode excluir o próprio usuário.', 'en':'You cannot delete your own user.', 'de':'Sie können Ihren eigenen Benutzer nicht löschen.' },
    'Usuário não encontrado.':         { 'pt-BR':'Usuário não encontrado.',         'en':'User not found.',                     'de':'Benutzer nicht gefunden.'              },
    'Informe o título da tarefa.':     { 'pt-BR':'Informe o título da tarefa.',     'en':'Please enter the task title.',        'de':'Bitte Aufgabentitel eingeben.'         },
    'Selecione um estagiário.':        { 'pt-BR':'Selecione um estagiário.',        'en':'Please select an intern.',            'de':'Bitte einen Praktikanten auswählen.'   },
    'Informe o prazo.':                { 'pt-BR':'Informe o prazo.',                'en':'Please enter the deadline.',          'de':'Bitte Frist eingeben.'                 },
    'Selecione o estagiário.':         { 'pt-BR':'Selecione o estagiário.',         'en':'Select an intern.',                   'de':'Praktikanten auswählen.'               },
    'Selecione uma nota (1-5).':       { 'pt-BR':'Selecione uma nota (1-5).',       'en':'Select a rating (1-5).',              'de':'Bewertung (1-5) auswählen.'            },
    'Informe um comentário.':          { 'pt-BR':'Informe um comentário.',          'en':'Please enter a comment.',             'de':'Bitte Kommentar eingeben.'             },
    'Selecione um cargo.':             { 'pt-BR':'Selecione um cargo.',             'en':'Select a role.',                      'de':'Rolle auswählen.'                      },
    'Informe uma senha para o novo usuário.': { 'pt-BR':'Informe uma senha para o novo usuário.', 'en':'Enter a password for the new user.', 'de':'Passwort für neuen Benutzer eingeben.' },
    'Selecione o tipo de documento.':  { 'pt-BR':'Selecione o tipo de documento.',  'en':'Select the document type.',           'de':'Dokumenttyp auswählen.'                },
    'Informe a data do documento.':    { 'pt-BR':'Informe a data do documento.',    'en':'Enter the document date.',            'de':'Dokumentdatum eingeben.'               },
    'Selecione o tipo de movimentação.': { 'pt-BR':'Selecione o tipo de movimentação.', 'en':'Select the movement type.', 'de':'Bewegungstyp auswählen.'                   },
    'Informe uma quantidade válida.':  { 'pt-BR':'Informe uma quantidade válida.',  'en':'Enter a valid quantity.',             'de':'Gültige Menge eingeben.'               },
    'Informe o responsável.':          { 'pt-BR':'Informe o responsável.',          'en':'Enter the responsible person.',       'de':'Verantwortlichen eingeben.'            },
    'Informe a data de devolução.':    { 'pt-BR':'Informe a data de devolução.',    'en':'Enter the return date.',              'de':'Rückgabedatum eingeben.'               },
    'Selecione um arquivo para anexar.': { 'pt-BR':'Selecione um arquivo para anexar.', 'en':'Select a file to attach.', 'de':'Datei zum Anhängen auswählen.'              },
    'Nenhum estagiário ativo encontrado.': { 'pt-BR':'Nenhum estagiário ativo encontrado.', 'en':'No active interns found.', 'de':'Keine aktiven Praktikanten gefunden.'    },
    'Nenhuma nota registrada ainda.':  { 'pt-BR':'Nenhuma nota registrada ainda.',  'en':'No notes recorded yet.',              'de':'Noch keine Notizen vorhanden.'         },

    // ── Toast — títulos do sistema ──────────────────────────────────
    'Sucesso':                         { 'pt-BR':'Sucesso',                         'en':'Success',                             'de':'Erfolg'                                },
    'Erro':                            { 'pt-BR':'Erro',                            'en':'Error',                               'de':'Fehler'                                },
    'Atenção':                         { 'pt-BR':'Atenção',                         'en':'Warning',                             'de':'Achtung'                               },
    'Informação':                      { 'pt-BR':'Informação',                      'en':'Information',                         'de':'Information'                           },
    // ── Tema ────────────────────────────────────────────────────────
    'Modo Claro':                      { 'pt-BR':'Modo Claro',                      'en':'Light Mode',                          'de':'Helles Design'                         },
    'Modo Escuro':                     { 'pt-BR':'Modo Escuro',                     'en':'Dark Mode',                           'de':'Dunkles Design'                        },

    // ── Erros de API / rede ─────────────────────────────────────────
    'Tempo de resposta esgotado. Verifique sua conexão.': { 'pt-BR':'Tempo de resposta esgotado. Verifique sua conexão.', 'en':'Request timed out. Check your connection.', 'de':'Zeitüberschreitung. Überprüfen Sie Ihre Verbindung.' },
    'Sessão expirada.':                { 'pt-BR':'Sessão expirada.',                'en':'Session expired.',                    'de':'Sitzung abgelaufen.'                   },
    'Sem permissão para esta ação.':   { 'pt-BR':'Sem permissão para esta ação.',   'en':'You do not have permission for this action.', 'de':'Keine Berechtigung für diese Aktion.' },
    'Recurso não encontrado.':         { 'pt-BR':'Recurso não encontrado.',         'en':'Resource not found.',                 'de':'Ressource nicht gefunden.'             },

    // ── Kanban — entradas novas ─────────────────────────────────────
    'Mover para A Fazer':              { 'pt-BR':'Mover para A Fazer',              'en':'Move to To Do',                       'de':'Zu Zu erledigen verschieben'           },
    'Mover para Revisão':              { 'pt-BR':'Mover para Revisão',              'en':'Move to Review',                      'de':'Zu Überprüfung verschieben'            },

    // ── Dashboard Estagiários — página e modal ──────────────────────
    'destag.title':                    { 'pt-BR':'Dashboard de Estagiários',        'en':'Intern Dashboard',                    'de':'Praktikanten-Dashboard'                },
    'destag.subtitle':                 { 'pt-BR':'Desempenho, tarefas e notas do diretor em tempo real', 'en':'Performance, tasks and director notes in real time', 'de':'Leistung, Aufgaben und Direktionsnotizen in Echtzeit' },
    'destag.openKanban':               { 'pt-BR':'Abrir Kanban',                   'en':'Open Kanban',                         'de':'Kanban öffnen'                         },
    'destag.perf':                     { 'pt-BR':'Desempenho Individual',           'en':'Individual Performance',              'de':'Individuelle Leistung'                 },
    'destag.addNota':                  { 'pt-BR':'Adicionar Nota',                  'en':'Add Note',                            'de':'Notiz hinzufügen'                      },
    'destag.col.intern':               { 'pt-BR':'Estagiário',                      'en':'Intern',                              'de':'Praktikant'                            },
    'destag.col.area':                 { 'pt-BR':'Área',                            'en':'Area',                                'de':'Bereich'                               },
    'destag.col.tasks':                { 'pt-BR':'Tarefas',                         'en':'Tasks',                               'de':'Aufgaben'                              },
    'destag.col.done':                 { 'pt-BR':'Concluídas',                      'en':'Completed',                           'de':'Abgeschlossen'                         },
    'destag.col.ongoing':              { 'pt-BR':'Em Andamento',                    'en':'Ongoing',                             'de':'In Bearbeitung'                        },
    'destag.col.late':                 { 'pt-BR':'Vencidas',                        'en':'Overdue',                             'de':'Überfällig'                            },
    'destag.col.rate':                 { 'pt-BR':'Taxa',                            'en':'Rate',                                'de':'Rate'                                  },
    'destag.col.avgNota':              { 'pt-BR':'Nota Média',                      'en':'Avg. Grade',                          'de':'Durchschnittsnote'                     },
    'destag.col.actions':              { 'pt-BR':'Ações',                           'en':'Actions',                             'de':'Aktionen'                              },
    'destag.chart':                    { 'pt-BR':'Tarefas por Estagiário',          'en':'Tasks by Intern',                     'de':'Aufgaben nach Praktikant'              },
    'destag.lastNotas':                { 'pt-BR':'Últimas Notas',                   'en':'Latest Notes',                        'de':'Neueste Notizen'                       },
    'destag.notaModal':                { 'pt-BR':'Nota do Diretor',                 'en':"Director's Note",                     'de':'Direktionsnotiz'                       },
    'destag.lbl.intern':               { 'pt-BR':'Estagiário',                      'en':'Intern',                              'de':'Praktikant'                            },
    'destag.lbl.nota':                 { 'pt-BR':'Nota (1 a 5)',                    'en':'Grade (1 to 5)',                       'de':'Note (1 bis 5)'                        },
    'destag.lbl.comment':              { 'pt-BR':'Comentário',                      'en':'Comment',                             'de':'Kommentar'                             },
    'destag.lbl.commentPh':            { 'pt-BR':'Descreva o desempenho observado no serviço...', 'en':'Describe the observed performance in the service...', 'de':'Beschreiben Sie die beobachtete Leistung im Dienst...' },
    'destag.lbl.service':              { 'pt-BR':'Serviço de referência (opcional)','en':'Reference service (optional)',         'de':'Referenzdienst (optional)'             },
    'destag.saveNota':                 { 'pt-BR':'Salvar Nota',                     'en':'Save Note',                           'de':'Notiz speichern'                       },
    'destag.empty':                    { 'pt-BR':'Nenhum estagiário ativo encontrado.', 'en':'No active interns found.',        'de':'Keine aktiven Praktikanten gefunden.'  },
    'destag.noNotes':                  { 'pt-BR':'Nenhuma nota registrada ainda.',  'en':'No notes recorded yet.',              'de':'Noch keine Notizen vorhanden.'         },

    // ── Dashboard Estagiários — KPIs dinâmicos ──────────────────────
    'destag.kpi.ativos':               { 'pt-BR':'Estagiários Ativos',              'en':'Active Interns',                      'de':'Aktive Praktikanten'                   },
    'destag.kpi.emEstag':              { 'pt-BR':'em estágio',                      'en':'in internship',                       'de':'im Praktikum'                          },
    'destag.kpi.tarefas':              { 'pt-BR':'Total de Tarefas',                'en':'Total Tasks',                         'de':'Gesamtaufgaben'                        },
    'destag.kpi.conc':                 { 'pt-BR':'concluídas',                      'en':'completed',                           'de':'abgeschlossen'                         },
    'destag.kpi.taxa':                 { 'pt-BR':'Taxa de Conclusão',               'en':'Completion Rate',                     'de':'Abschlussrate'                         },
    'destag.kpi.doTime':               { 'pt-BR':'geral do time',                   'en':'overall team',                        'de':'gesamt Team'                           },
    'destag.kpi.nota':                 { 'pt-BR':'Nota Média Geral',                'en':'Overall Avg. Grade',                  'de':'Gesamtdurchschnittsnote'               },
    'destag.kpi.avalDir':              { 'pt-BR':'avaliações do diretor',           'en':"director's evaluations",              'de':'Direktionsbewertungen'                 },
    'destag.btn.eval':                 { 'pt-BR':'Avaliar',                         'en':'Evaluate',                            'de':'Bewerten'                              },
    'destag.btn.print':                { 'pt-BR':'Imprimir relatório',              'en':'Print report',                        'de':'Bericht drucken'                       },

    // ── Relatório de desempenho (PDF/print) ─────────────────────────
    'report.title':                    { 'pt-BR':'Relatório de Desempenho',         'en':'Performance Report',                  'de':'Leistungsbericht'                      },
    'report.issued':                   { 'pt-BR':'Emitido em',                      'en':'Issued on',                           'de':'Ausgestellt am'                        },
    'report.tasks':                    { 'pt-BR':'Tarefas Atribuídas',              'en':'Assigned Tasks',                      'de':'Zugewiesene Aufgaben'                  },
    'report.notes':                    { 'pt-BR':'Notas do Diretor',                'en':"Director's Notes",                    'de':'Direktionsnotizen'                     },
    'report.printBtn':                 { 'pt-BR':'Imprimir / Salvar PDF',           'en':'Print / Save PDF',                    'de':'Drucken / PDF speichern'               },

    // ── Datas relativas ─────────────────────────────────────────────
    'agora mesmo':                     { 'pt-BR':'agora mesmo',                     'en':'just now',                            'de':'gerade eben'                           },
    'há %d min':                       { 'pt-BR':'há %d min',                       'en':'%d min ago',                          'de':'vor %d Min.'                           },
    'há %dh':                          { 'pt-BR':'há %dh',                          'en':'%dh ago',                             'de':'vor %dh'                               },
    'há %dd':                          { 'pt-BR':'há %dd',                          'en':'%dd ago',                             'de':'vor %d T.'                             },

    // ── Alias de botões usados via data-i18n ────────────────────────
    'btn.cancel':                      { 'pt-BR':'Cancelar',                        'en':'Cancel',                              'de':'Abbrechen'                             },
    'btn.save':                        { 'pt-BR':'Salvar',                          'en':'Save',                                'de':'Speichern'                             },
    'btn.edit':                        { 'pt-BR':'Editar',                          'en':'Edit',                                'de':'Bearbeiten'                            },
    'btn.delete':                      { 'pt-BR':'Excluir',                         'en':'Delete',                              'de':'Löschen'                               },
    'btn.print':                       { 'pt-BR':'Imprimir',                        'en':'Print',                               'de':'Drucken'                               },
    'btn.export':                      { 'pt-BR':'Exportar',                        'en':'Export',                              'de':'Exportieren'                           },
    'btn.confirm':                     { 'pt-BR':'Confirmar',                       'en':'Confirm',                             'de':'Bestätigen'                            },
    'btn.close':                       { 'pt-BR':'Fechar',                          'en':'Close',                               'de':'Schließen'                             },
    'btn.back':                        { 'pt-BR':'Voltar',                          'en':'Back',                                'de':'Zurück'                                },

    // ── Almoxarifado — status e botões ──────────────────────────────
    'Reabastecimento rápido':          { 'pt-BR':'Reabastecimento rápido',          'en':'Quick restock',                       'de':'Schnelle Auffüllung'                   },
    'Movimentar':                      { 'pt-BR':'Movimentar',                      'en':'Move stock',                          'de':'Lager bewegen'                         },
    'Histórico':                       { 'pt-BR':'Histórico',                       'en':'History',                             'de':'Verlauf'                               },
    'estoque atual:':                  { 'pt-BR':'estoque atual:',                  'en':'current stock:',                      'de':'aktueller Bestand:'                    },
    'Disponível:':                     { 'pt-BR':'Disponível:',                     'en':'Available:',                          'de':'Verfügbar:'                            },
    'registrada! Novo estoque:':       { 'pt-BR':'registrada! Novo estoque:',       'en':'registered! New stock:',              'de':'registriert! Neuer Bestand:'           },
    'Reabastecimento de emergência':   { 'pt-BR':'Reabastecimento de emergência',   'en':'Emergency restock',                   'de':'Notauffüllung'                         },
    'Quantidade insuficiente. Estoque atual:': { 'pt-BR':'Quantidade insuficiente. Estoque atual:', 'en':'Insufficient quantity. Current stock:', 'de':'Unzureichende Menge. Aktueller Bestand:' },
    'itens exportados com sucesso.':   { 'pt-BR':'itens exportados com sucesso.',   'en':'items exported successfully.',        'de':'Artikel erfolgreich exportiert.'       },
    'Verifique sua conexão e tente novamente.': { 'pt-BR':'Verifique sua conexão e tente novamente.', 'en':'Check your connection and try again.', 'de':'Verbindung prüfen und erneut versuchen.' },
    'Termo assinado anexado':          { 'pt-BR':'Termo assinado anexado',          'en':'Signed term attached',                'de':'Unterzeichnetes Dokument angehängt'    },
    'Termo de custódia enviado para impressão.': { 'pt-BR':'Termo de custódia enviado para impressão.', 'en':'Custody form sent for printing.', 'de':'Verwahrungsformular zum Drucken gesendet.' },
    'Desligar':                        { 'pt-BR':'Desligar',                        'en':'Turn off',                            'de':'Ausschalten'                           },
    'Remover':                         { 'pt-BR':'Remover',                         'en':'Remove',                              'de':'Entfernen'                             },
    'está com estoque crítico':        { 'pt-BR':'está com estoque crítico',        'en':'has critical stock',                  'de':'hat kritischen Bestand'                },
    // ── Mensagens de validação (avaliacao.js) ───────────────────────
    'Selecione seu vínculo com o CEM (Pergunta 1).': { 'pt-BR':'Selecione seu vínculo com o CEM (Pergunta 1).', 'en':'Select your relationship with the CEM (Question 1).', 'de':'Wählen Sie Ihre Verbindung zum CEM (Frage 1).' },
    'Informe sua nota de recomendação (Pergunta 4).': { 'pt-BR':'Informe sua nota de recomendação (Pergunta 4).', 'en':'Enter your recommendation score (Question 4).', 'de':'Geben Sie Ihre Empfehlungsnote ein (Frage 4).' },
    'Descreva brevemente o serviço realizado (Pergunta 3).': { 'pt-BR':'Descreva brevemente o serviço realizado (Pergunta 3).', 'en':'Briefly describe the service performed (Question 3).', 'de':'Beschreiben Sie kurz den durchgeführten Dienst (Frage 3).' },
    // ── Avaliação — sucesso e botão ─────────────────────────────────
    'Avaliação enviada! Obrigado.':   { 'pt-BR':'Avaliação enviada! Obrigado.',   'en':'Evaluation submitted! Thank you.',       'de':'Bewertung gesendet! Danke.'                },
    'Enviar Avaliação':               { 'pt-BR':'Enviar Avaliação',               'en':'Submit Evaluation',                      'de':'Bewertung absenden'                        },
    // ── Notificações ────────────────────────────────────────────────
    'Nenhuma notificação no momento.':{ 'pt-BR':'Nenhuma notificação no momento.','en':'No notifications at the moment.',         'de':'Keine Benachrichtigungen.'                 },
    'Carregando…':                    { 'pt-BR':'Carregando…',                    'en':'Loading…',                               'de':'Wird geladen…'                             },
    'Ver detalhes':                   { 'pt-BR':'Ver detalhes',                   'en':'View details',                           'de':'Details anzeigen'                          },
    'Ver documentos':                 { 'pt-BR':'Ver documentos',                 'en':'View documents',                         'de':'Dokumente anzeigen'                        },
    'Ver almoxarifado':               { 'pt-BR':'Ver almoxarifado',               'en':'View warehouse',                         'de':'Lager anzeigen'                            },
    'Ver máquinas':                   { 'pt-BR':'Ver máquinas',                   'en':'View machines',                          'de':'Maschinen anzeigen'                        },
    'Documentos expirados requerem atenção imediata.': { 'pt-BR':'Documentos expirados requerem atenção imediata.', 'en':'Expired documents require immediate attention.', 'de':'Abgelaufene Dokumente erfordern sofortige Aufmerksamkeit.' },
    'Renove antes do vencimento para manter a conformidade.': { 'pt-BR':'Renove antes do vencimento para manter a conformidade.', 'en':'Renew before expiry to maintain compliance.', 'de':'Erneuern Sie vor Ablauf zur Konformitätssicherung.' },
    'vencido':                        { 'pt-BR':'vencido',                        'en':'expired',                                'de':'abgelaufen'                                },
    'vencidos':                       { 'pt-BR':'vencidos',                       'en':'expired',                                'de':'abgelaufen'                                },
    'vence em 30 dias':               { 'pt-BR':'vence em 30 dias',               'en':'expires in 30 days',                     'de':'läuft in 30 Tagen ab'                      },
    'vencem em 30 dias':              { 'pt-BR':'vencem em 30 dias',              'en':'expire in 30 days',                      'de':'laufen in 30 Tagen ab'                     },
    'com estoque crítico':            { 'pt-BR':'com estoque crítico',            'en':'with critical stock',                    'de':'mit kritischem Bestand'                    },
    'em manutenção':                  { 'pt-BR':'em manutenção',                  'en':'under maintenance',                      'de':'in Wartung'                                },
    'máquina':                        { 'pt-BR':'máquina',                        'en':'machine',                                'de':'Maschine'                                  },
    // ── Detalhes Edital ─────────────────────────────────────────────
    'Nenhuma observação registrada.': { 'pt-BR':'Nenhuma observação registrada.', 'en':'No notes registered.',                   'de':'Keine Anmerkungen registriert.'            },

    // ── Mensagens de estado vazio (dashboardAvaliacao, dashboardServicos) ──
    'Sem dados.':                        { 'pt-BR':'Sem dados.',                        'en':'No data.',                                'de':'Keine Daten.'                                },
    'Nenhum dado para o período selecionado.': { 'pt-BR':'Nenhum dado para o período selecionado.', 'en':'No data for the selected period.', 'de':'Keine Daten für den ausgewählten Zeitraum.' },
    'Nenhuma resposta encontrada':       { 'pt-BR':'Nenhuma resposta encontrada',       'en':'No responses found',                      'de':'Keine Antworten gefunden'                    },
    'As avaliações aparecerão aqui após o envio do formulário.': { 'pt-BR':'As avaliações aparecerão aqui após o envio do formulário.', 'en':'Evaluations will appear here after the form is submitted.', 'de':'Bewertungen erscheinen hier nach dem Absenden des Formulars.' },
    'Sem movimentações registradas':     { 'pt-BR':'Sem movimentações registradas',     'en':'No movements recorded',                   'de':'Keine Bewegungen aufgezeichnet'              },
    'Movimentações futuras aparecerão aqui.': { 'pt-BR':'Movimentações futuras aparecerão aqui.', 'en':'Future movements will appear here.', 'de':'Zukünftige Bewegungen erscheinen hier.' },
    'Nenhuma manutenção registrada':     { 'pt-BR':'Nenhuma manutenção registrada',     'en':'No maintenance records',                  'de':'Keine Wartungsaufzeichnungen'                },
    'Registre a primeira manutenção para este scanner.': { 'pt-BR':'Registre a primeira manutenção para este scanner.', 'en':'Register the first maintenance for this scanner.', 'de':'Registrieren Sie die erste Wartung für diesen Scanner.' },
    'Registre a retirada de um scanner.': { 'pt-BR':'Registre a retirada de um scanner.', 'en':'Register the withdrawal of a scanner.', 'de':'Registrieren Sie die Entnahme eines Scanners.' },

    // ── Mensagens de erro (kanban, dashboard, servicos, scanners) ────
    'Erro ao carregar dados do Kanban.': { 'pt-BR':'Erro ao carregar dados do Kanban.', 'en':'Error loading Kanban data.',               'de':'Fehler beim Laden der Kanban-Daten.'         },
    'Erro ao carregar relatório de serviços.': { 'pt-BR':'Erro ao carregar relatório de serviços.', 'en':'Error loading services report.', 'de':'Fehler beim Laden des Dienstberichts.'      },
    'Registro não encontrado.':          { 'pt-BR':'Registro não encontrado.',          'en':'Record not found.',                       'de':'Datensatz nicht gefunden.'                   },

    // ── Títulos de confirmação ───────────────────────────────────────
    'Excluir Evento':                    { 'pt-BR':'Excluir Evento',                    'en':'Delete Event',                            'de':'Veranstaltung löschen'                       },
    'Excluir Edital':                    { 'pt-BR':'Excluir Edital',                    'en':'Delete Tender',                           'de':'Ausschreibung löschen'                       },
    'Excluir Documento':                 { 'pt-BR':'Excluir Documento',                 'en':'Delete Document',                         'de':'Dokument löschen'                            },
    'Excluir Visita':                    { 'pt-BR':'Excluir Visita',                    'en':'Delete Visit',                            'de':'Besuch löschen'                              },
    'Excluir Projeto':                   { 'pt-BR':'Excluir Projeto',                   'en':'Delete Project',                          'de':'Projekt löschen'                             },
    'Excluir Registro':                  { 'pt-BR':'Excluir Registro',                  'en':'Delete Record',                           'de':'Datensatz löschen'                           },
    'Excluir Manutenção':                { 'pt-BR':'Excluir Manutenção',                'en':'Delete Maintenance',                      'de':'Wartung löschen'                             },
    'Excluir Agendamento':               { 'pt-BR':'Excluir Agendamento',               'en':'Delete Appointment',                      'de':'Termin löschen'                              },
    'Excluir Ordem de Serviço':          { 'pt-BR':'Excluir Ordem de Serviço',          'en':'Delete Work Order',                       'de':'Arbeitsauftrag löschen'                      },
    'Excluir Usuário':                   { 'pt-BR':'Excluir Usuário',                   'en':'Delete User',                             'de':'Benutzer löschen'                            },
    'Remover Documento':                 { 'pt-BR':'Remover Documento',                 'en':'Remove Document',                         'de':'Dokument entfernen'                          },

    // ── Mensagens de confirmação ─────────────────────────────────────
    'Esta ação não pode ser desfeita. Confirmar exclusão?': { 'pt-BR':'Esta ação não pode ser desfeita. Confirmar exclusão?', 'en':'This action cannot be undone. Confirm deletion?', 'de':'Diese Aktion kann nicht rückgängig gemacht werden. Löschen bestätigen?' },
    'Deseja realmente excluir este projeto?': { 'pt-BR':'Deseja realmente excluir este projeto?', 'en':'Are you sure you want to delete this project?', 'de':'Möchten Sie dieses Projekt wirklich löschen?' },
    'O arquivo será removido permanentemente. Confirmar?': { 'pt-BR':'O arquivo será removido permanentemente. Confirmar?', 'en':'The file will be permanently removed. Confirm?', 'de':'Die Datei wird dauerhaft entfernt. Bestätigen?' },
    'O usuário perderá acesso imediatamente. Confirmar?': { 'pt-BR':'O usuário perderá acesso imediatamente. Confirmar?', 'en':'The user will lose access immediately. Confirm?', 'de':'Der Benutzer verliert sofort den Zugang. Bestätigen?' },
    'Confirmar remoção deste documento?': { 'pt-BR':'Confirmar remoção deste documento?', 'en':'Confirm removal of this document?', 'de':'Entfernung dieses Dokuments bestätigen?' },
    'Confirmar exclusão deste registro?': { 'pt-BR':'Confirmar exclusão deste registro?', 'en':'Confirm deletion of this record?', 'de':'Löschen dieses Datensatzes bestätigen?' },
    'Confirmar exclusão?':               { 'pt-BR':'Confirmar exclusão?',               'en':'Confirm deletion?',                       'de':'Löschen bestätigen?'                         },
    'Esta ação é permanente. Deseja realmente excluir esta OS?': { 'pt-BR':'Esta ação é permanente. Deseja realmente excluir esta OS?', 'en':'This action is permanent. Are you sure you want to delete this work order?', 'de':'Diese Aktion ist dauerhaft. Möchten Sie diesen Arbeitsauftrag wirklich löschen?' },

    // ── Scanners — mensagens de validação ────────────────────────────
    'Selecione o scanner.':              { 'pt-BR':'Selecione o scanner.',              'en':'Select the scanner.',                     'de':'Scanner auswählen.'                          },
    'Informe a data/hora de retirada.':  { 'pt-BR':'Informe a data/hora de retirada.', 'en':'Enter the withdrawal date/time.',         'de':'Datum/Uhrzeit der Entnahme eingeben.'        },
    'Data de retorno não pode ser anterior à retirada.': { 'pt-BR':'Data de retorno não pode ser anterior à retirada.', 'en':'Return date cannot be before the withdrawal date.', 'de':'Rückgabedatum kann nicht vor dem Entnahmedatum liegen.' },
    'Selecione o tipo de manutenção.':   { 'pt-BR':'Selecione o tipo de manutenção.',  'en':'Select the maintenance type.',            'de':'Wartungstyp auswählen.'                      },
    'Informe a data realizada.':         { 'pt-BR':'Informe a data realizada.',         'en':'Enter the actual date.',                  'de':'Tatsächliches Datum eingeben.'               },
    'Informe o usuário.':                { 'pt-BR':'Informe o usuário.',                'en':'Enter the user name.',                    'de':'Benutzernamen eingeben.'                     },
    'Informe a data/hora de início.':    { 'pt-BR':'Informe a data/hora de início.',   'en':'Enter the start date/time.',              'de':'Startdatum/-uhrzeit eingeben.'               },
    'Informe a data/hora de fim.':       { 'pt-BR':'Informe a data/hora de fim.',      'en':'Enter the end date/time.',                'de':'Enddatum/-uhrzeit eingeben.'                 },
    'A data de fim deve ser após o início.': { 'pt-BR':'A data de fim deve ser após o início.', 'en':'The end date must be after the start date.', 'de':'Das Enddatum muss nach dem Startdatum liegen.' },

    // ── Scanners — toasts de sucesso ─────────────────────────────────
    'Registro atualizado!':              { 'pt-BR':'Registro atualizado!',              'en':'Record updated!',                         'de':'Datensatz aktualisiert!'                     },
    'Agendamento atualizado!':           { 'pt-BR':'Agendamento atualizado!',           'en':'Appointment updated!',                    'de':'Termin aktualisiert!'                        },
    'Agendamento criado!':               { 'pt-BR':'Agendamento criado!',               'en':'Appointment created!',                    'de':'Termin erstellt!'                            },

    // ── Scanners — títulos de modal ──────────────────────────────────
    'Registrar Retirada de Scanner':     { 'pt-BR':'Registrar Retirada de Scanner',    'en':'Register Scanner Withdrawal',             'de':'Scanner-Entnahme registrieren'               },
    'Editar Registro':                   { 'pt-BR':'Editar Registro',                  'en':'Edit Record',                             'de':'Datensatz bearbeiten'                        },
    'Registrar Manutenção':              { 'pt-BR':'Registrar Manutenção',             'en':'Register Maintenance',                    'de':'Wartung registrieren'                        },

    // ── detalhes-edital.js — partes de template ──────────────────────
    'Edital':                            { 'pt-BR':'Edital',                            'en':'Tender',                                  'de':'Ausschreibung'                               },
    'não encontrado.':                   { 'pt-BR':'não encontrado.',                   'en':'not found.',                              'de':'nicht gefunden.'                             },

    // ── CSV headers ─────────────────────────────────────────────────

    // ── Títulos de modal — CRUD ──────────────────────────────────────

    // ── Toasts — sucesso CRUD ────────────────────────────────────────
    'Agendamento excluído.':           { 'pt-BR':'Agendamento excluído.',           'en':'Appointment deleted.',                'de':'Termin gelöscht.'                      },
    'Agendamento cancelado.':          { 'pt-BR':'Agendamento cancelado.',          'en':'Appointment cancelled.',              'de':'Termin abgesagt.'                      },
    'Uso registrado com sucesso.':     { 'pt-BR':'Uso registrado com sucesso.',     'en':'Usage registered successfully.',      'de':'Nutzung erfolgreich registriert.'      },

    // ── Toasts — erro CRUD ───────────────────────────────────────────
    'Erro ao carregar projetos.':      { 'pt-BR':'Erro ao carregar projetos.',      'en':'Error loading projects.',             'de':'Fehler beim Laden der Projekte.'       },
    'Erro ao salvar evento.':          { 'pt-BR':'Erro ao salvar evento.',          'en':'Error saving event.',                 'de':'Fehler beim Speichern der Veranstaltung.'},
    'Erro ao enviar documento.':       { 'pt-BR':'Erro ao enviar documento.',       'en':'Error sending document.',             'de':'Fehler beim Senden des Dokuments.'     },

    // ── Validações ───────────────────────────────────────────────────
    'Preencha os campos obrigatórios.':      { 'pt-BR':'Preencha os campos obrigatórios.',      'en':'Please fill in the required fields.',    'de':'Bitte füllen Sie die Pflichtfelder aus.' },
    'Informe o nome do arquivo.':      { 'pt-BR':'Informe o nome do arquivo.',      'en':'Enter the file name.',                'de':'Dateinamen eingeben.'                  },
    'Cancelar este agendamento?':      { 'pt-BR':'Cancelar este agendamento?',      'en':'Cancel this appointment?',            'de':'Diesen Termin absagen?'                },

    // ── Empty states ─────────────────────────────────────────────────
    'Nenhum registro de uso encontrado.': { 'pt-BR':'Nenhum registro de uso encontrado.', 'en':'No usage records found.', 'de':'Keine Nutzungseinträge gefunden.'           },
    'Nenhuma sessão ativa encontrada.':{ 'pt-BR':'Nenhuma sessão ativa encontrada.','en':'No active sessions found.',           'de':'Keine aktiven Sitzungen gefunden.'      },

    // ── Contadores inline ────────────────────────────────────────────

    // ── Status Badges ────────────────────────────────────────────────

    // ── Máquinas / Scanners ──────────────────────────────────────────
    'Dados do Equipamento':            { 'pt-BR':'Dados do Equipamento',            'en':'Equipment Data',                      'de':'Gerätedaten'                           },
    'Modelo':                          { 'pt-BR':'Modelo',                          'en':'Model',                               'de':'Modell'                                },
    'Fabricante':                      { 'pt-BR':'Fabricante',                      'en':'Manufacturer',                        'de':'Hersteller'                            },
    'Patrimônio':                      { 'pt-BR':'Patrimônio',                      'en':'Asset No.',                           'de':'Inventarnr.'                           },
    'Usando desde':                    { 'pt-BR':'Usando desde',                    'en':'In use since',                        'de':'In Betrieb seit'                       },
    'Ano instalação':                  { 'pt-BR':'Ano instalação',                  'en':'Installation year',                   'de':'Installationsjahr'                     },
    'Volume de medição':               { 'pt-BR':'Volume de medição',               'en':'Measurement volume',                  'de':'Messvolumen'                           },
    'Tipo de medida':                  { 'pt-BR':'Tipo de medida',                  'en':'Measurement type',                    'de':'Messtyp'                               },
    'Horas de uso total':              { 'pt-BR':'Horas de uso total',              'en':'Total usage hours',                   'de':'Gesamtnutzungsstunden'                 },
    'Horas totais':                    { 'pt-BR':'Horas totais',                    'en':'Total hours',                         'de':'Gesamtstunden'                         },
    'Total de sessões':                { 'pt-BR':'Total de sessões',                'en':'Total sessions',                      'de':'Sitzungen gesamt'                      },
    'Total agendamentos':              { 'pt-BR':'Total agendamentos',              'en':'Total appointments',                  'de':'Termine gesamt'                        },
    'Próxima manutenção':              { 'pt-BR':'Próxima manutenção',              'en':'Next maintenance',                    'de':'Nächste Wartung'                       },
    'Próximo agendamento':             { 'pt-BR':'Próximo agendamento',             'en':'Next appointment',                    'de':'Nächster Termin'                       },
    'Última manutenção':               { 'pt-BR':'Última manutenção',               'en':'Last maintenance',                    'de':'Letzte Wartung'                        },
    'Manutenções':                     { 'pt-BR':'Manutenções',                     'en':'Maintenance',                         'de':'Wartungen'                             },
    'Sessões':                         { 'pt-BR':'Sessões',                         'en':'Sessions',                            'de':'Sitzungen'                             },
    'Manutenções registradas':         { 'pt-BR':'Manutenções registradas',         'en':'Registered maintenance',              'de':'Registrierte Wartungen'                },
    'Uso & Manutenção':                { 'pt-BR':'Uso & Manutenção',               'en':'Usage & Maintenance',                 'de':'Nutzung & Wartung'                     },
    'Ligada':                          { 'pt-BR':'Ligada',                          'en':'On',                                  'de':'Eingeschaltet'                         },
    'Desligada':                       { 'pt-BR':'Desligada',                       'en':'Off',                                 'de':'Ausgeschaltet'                         },
    'Ligar':                           { 'pt-BR':'Ligar',                           'en':'Turn on',                             'de':'Einschalten'                           },
    'Máquina livre — nenhum usuário no momento': { 'pt-BR':'Máquina livre — nenhum usuário no momento', 'en':'Machine free — no user at the moment', 'de':'Maschine frei — kein Benutzer im Moment' },

    // ── Painel de notificações ───────────────────────────────────────
    'Notificações':                    { 'pt-BR':'Notificações',                    'en':'Notifications',                       'de':'Benachrichtigungen'                    },

    // ── Misc ─────────────────────────────────────────────────────────
    'Aviso':                           { 'pt-BR':'Aviso',                           'en':'Notice',                              'de':'Hinweis'                               },
    'Ativos':                          { 'pt-BR':'Ativos',                          'en':'Active',                              'de':'Aktiv'                                 },
    'Dashboards':                      { 'pt-BR':'Dashboards',                      'en':'Dashboards',                          'de':'Dashboards'                            },

    // ── Status variants (lowercase — server returns these) ──────────
    'Prestação de contas':    { 'pt-BR':'Prestação de Contas',    'en':'Accountability',            'de':'Rechenschaftspflicht'           },
    'Atrasada':               { 'pt-BR':'Atrasada',               'en':'Delayed',                   'de':'Verzögert'                      },
    'Ativa':                  { 'pt-BR':'Ativa',                  'en':'Active',                    'de':'Aktiv'                          },
    'Em Manutenção':          { 'pt-BR':'Em Manutenção',          'en':'In Maintenance',            'de':'In Wartung'                     },
    'Confirmado':             { 'pt-BR':'Confirmado',             'en':'Confirmed',                 'de':'Bestätigt'                      },

    // ── Machine locations ────────────────────────────────────────────
    'Em Campo (fora do laboratório)': { 'pt-BR':'Em Campo (fora do laboratório)', 'en':'In Field (outside lab)', 'de':'Im Feld (außerhalb des Labors)' },

    // ── Visitas filter options ───────────────────────────────────────
    'Pendentes':              { 'pt-BR':'Pendentes',              'en':'Pending',                   'de':'Ausstehend'                     },
    'Realizadas':             { 'pt-BR':'Realizadas',             'en':'Completed',                 'de':'Durchgeführt'                   },
    'Não (Pendente)':         { 'pt-BR':'Não (Pendente)',         'en':'No (Pending)',              'de':'Nein (Ausstehend)'              },
    'Sim (Realizada)':        { 'pt-BR':'Sim (Realizada)',        'en':'Yes (Completed)',           'de':'Ja (Durchgeführt)'              },

    // ── Almoxarifado categories ──────────────────────────────────────
    'EPI / Segurança':        { 'pt-BR':'EPI / Segurança',        'en':'PPE / Safety',              'de':'PSA / Sicherheit'               },
    'Eng. Mecânica':          { 'pt-BR':'Eng. Mecânica',          'en':'Mech. Engineering',         'de':'Mech. Technik'                  },
    'Ferramentas':            { 'pt-BR':'Ferramentas',            'en':'Tools',                     'de':'Werkzeuge'                      },
    'Limpeza de Máquinas':    { 'pt-BR':'Limpeza de Máquinas',    'en':'Machine Cleaning',          'de':'Maschinenreinigung'             },
    'Metrologia':             { 'pt-BR':'Metrologia',             'en':'Metrology',                 'de':'Metrologie'                     },
    'Papelaria':              { 'pt-BR':'Papelaria',              'en':'Stationery',                'de':'Schreibwaren'                   },
    'Ponteiras':              { 'pt-BR':'Ponteiras',              'en':'Tips / Probes',             'de':'Spitzen / Taster'               },
    'Estoque Mín.':           { 'pt-BR':'Estoque Mín.',           'en':'Min. Stock',                'de':'Mindestbestand'                 },

    // ── Usuários roles & document types ─────────────────────────────
    'Currículo':              { 'pt-BR':'Currículo',              'en':'Resume / CV',               'de':'Lebenslauf'                     },
    'ISO 17025 — Competência': { 'pt-BR':'ISO 17025 — Competência', 'en':'ISO 17025 — Competence', 'de':'ISO 17025 — Kompetenz'          },

    // ── Amostras statuses ────────────────────────────────────────────

    // ── Kanban ───────────────────────────────────────────────────────
    'Backlog':                { 'pt-BR':'Backlog',                'en':'Backlog',                   'de':'Backlog'                        },

    // ── Missing module strings ───────────────────────────────────────
    'Relatório':              { 'pt-BR':'Relatório',              'en':'Report',                    'de':'Bericht'                        },
    'documento':              { 'pt-BR':'documento',              'en':'document',                  'de':'Dokument'                       },
    'Editar Manutenção':      { 'pt-BR':'Editar Manutenção',      'en':'Edit Maintenance',          'de':'Wartung bearbeiten'             },
    'Nenhum registro de manutenção encontrado.': { 'pt-BR':'Nenhum registro de manutenção encontrado.', 'en':'No maintenance records found.', 'de':'Keine Wartungseinträge gefunden.' },
    'Nenhum agendamento.':    { 'pt-BR':'Nenhum agendamento.',    'en':'No appointments.',          'de':'Keine Termine.'                 },
    'Clique em':              { 'pt-BR':'Clique em',              'en':'Click',                     'de':'Klicken Sie auf'                },
    'para reservar.':         { 'pt-BR':'para reservar.',         'en':'to book.',                  'de':'zum Buchen.'                    },
    'Nenhum registro de uso.': { 'pt-BR':'Nenhum registro de uso.', 'en':'No usage records.',      'de':'Keine Nutzungseinträge.'        },
    'Nenhum registro de manutenção.': { 'pt-BR':'Nenhum registro de manutenção.', 'en':'No maintenance records.', 'de':'Keine Wartungseinträge.' },

    // ── Maintenance types (mock server) ─────────────────────────────
    'Revisão Geral':          { 'pt-BR':'Revisão Geral',          'en':'General Review',            'de':'Allgemeine Überprüfung'         },
    'Revisão de Ponteiras':   { 'pt-BR':'Revisão de Ponteiras',   'en':'Probe Tip Review',          'de':'Tasterspitzen-Überprüfung'      },
    'Corretiva':              { 'pt-BR':'Corretiva',              'en':'Corrective',                'de':'Korrektiv'                      },
    'Preventiva':             { 'pt-BR':'Preventiva',             'en':'Preventive',                'de':'Vorbeugend'                     },

    // ── Stock movement types ─────────────────────────────────────────
    'entrada':                { 'pt-BR':'Entrada',                'en':'Entry',                     'de':'Eingang'                        },
    'saida':                  { 'pt-BR':'Saída',                  'en':'Output',                    'de':'Ausgang'                        },

    // ── Scanner types ────────────────────────────────────────────────
    'Scanner 3D Portátil a Laser':    { 'pt-BR':'Scanner 3D Portátil a Laser',    'en':'Portable 3D Laser Scanner',    'de':'Tragbarer 3D-Laserscanner'      },
    'Scanner 3D de Luz Estruturada':  { 'pt-BR':'Scanner 3D de Luz Estruturada',  'en':'Structured Light 3D Scanner',  'de':'3D-Streifenlichtscanner'         },

    // ── Scanner availability ─────────────────────────────────────────
    'Em uso / Fora do Lab':   { 'pt-BR':'Em uso / Fora do Lab',   'en':'In Use / Out of Lab',       'de':'In Betrieb / Außerhalb des Labors' },
    'Disponível':             { 'pt-BR':'Disponível',             'en':'Available',                 'de':'Verfügbar'                      },

    // ── Login — validações ───────────────────────────────────────────
    'Informe seu e-mail institucional.':          { 'pt-BR':'Informe seu e-mail institucional.',          'en':'Please enter your institutional email.',        'de':'Bitte geben Sie Ihre institutionelle E-Mail ein.'   },
    'Formato de e-mail inválido.':                { 'pt-BR':'Formato de e-mail inválido.',                'en':'Invalid email format.',                         'de':'Ungültiges E-Mail-Format.'                         },
    'Informe sua senha.':                         { 'pt-BR':'Informe sua senha.',                         'en':'Please enter your password.',                   'de':'Bitte geben Sie Ihr Passwort ein.'                  },
    'A senha deve ter pelo menos 6 caracteres.':  { 'pt-BR':'A senha deve ter pelo menos 6 caracteres.',  'en':'Password must be at least 6 characters.',       'de':'Das Passwort muss mindestens 6 Zeichen haben.'      },
    'E-mail ou senha incorretos.':                { 'pt-BR':'E-mail ou senha incorretos.',                'en':'Incorrect email or password.',                  'de':'Falsche E-Mail oder falsches Passwort.'             },
    'Logout realizado com sucesso.':              { 'pt-BR':'Logout realizado com sucesso.',              'en':'Logged out successfully.',                      'de':'Erfolgreich abgemeldet.'                           },

    // ── QR Code Avaliação ────────────────────────────────────────────
    'Avalie nosso atendimento':                   { 'pt-BR':'Avalie nosso atendimento',                   'en':'Rate our service',                              'de':'Bewerten Sie unseren Service'                      },
    'Centro de Excelência em Metrologia SENAI ZEISS': { 'pt-BR':'Centro de Excelência em Metrologia SENAI ZEISS', 'en':'SENAI ZEISS Metrology Excellence Center', 'de':'SENAI ZEISS Exzellenzzentrum für Metrologie'   },
    'ZEISS·PILOT — Sistema de Gestão Metrologia SENAI': { 'pt-BR':'ZEISS·PILOT — Sistema de Gestão Metrologia SENAI', 'en':'ZEISS·PILOT — SENAI Metrology Management System', 'de':'ZEISS·PILOT — SENAI Metrologie-Managementsystem' },
    'Baixar QR Code':                             { 'pt-BR':'Baixar QR Code',                             'en':'Download QR Code',                              'de':'QR-Code herunterladen'                             },

    // ── Formulário verificação ambiental ─────────────────────────────
    'Outra':                                      { 'pt-BR':'Outra',                                      'en':'Other',                                         'de':'Andere'                                            },
    'Nova Verificação':                           { 'pt-BR':'Nova Verificação',                           'en':'New Verification',                              'de':'Neue Verifizierung'                                },
    'Lista de verificação das condições ambientais do laboratório de metrologia': { 'pt-BR':'Lista de verificação das condições ambientais do laboratório de metrologia', 'en':'Checklist of environmental conditions of the metrology laboratory', 'de':'Checkliste der Umgebungsbedingungen des Metrologie-Labors' },
    'Lista de Verificação — Condições Ambientais CEM': { 'pt-BR':'Lista de Verificação — Condições Ambientais CEM', 'en':'Checklist — CEM Environmental Conditions', 'de':'Checkliste — CEM-Umgebungsbedingungen'              },
    'Preencha todas as perguntas obrigatórias antes de enviar.': { 'pt-BR':'Preencha todas as perguntas obrigatórias antes de enviar.', 'en':'Fill in all required fields before submitting.', 'de':'Füllen Sie alle Pflichtfelder aus, bevor Sie absenden.' },
    'Nome do responsável pelo registro:':         { 'pt-BR':'Nome do responsável pelo registro:',         'en':'Name of the person responsible for the record:', 'de':'Name der für den Eintrag verantwortlichen Person:'  },
    'Período do dia:':                            { 'pt-BR':'Período do dia:',                            'en':'Time of day:',                                  'de':'Tageszeit:'                                        },
    'Manhã':                                      { 'pt-BR':'Manhã',                                      'en':'Morning',                                       'de':'Morgen'                                            },
    'Tarde':                                      { 'pt-BR':'Tarde',                                      'en':'Afternoon',                                     'de':'Nachmittag'                                        },
    'Dia todo':                                   { 'pt-BR':'Dia todo',                                   'en':'All day',                                       'de':'Ganzer Tag'                                        },
    'Temperatura atual (°C):':                    { 'pt-BR':'Temperatura atual (°C):',                    'en':'Current temperature (°C):',                     'de':'Aktuelle Temperatur (°C):'                         },
    '(Padrão: 20 ± 2 °C)':                       { 'pt-BR':'(Padrão: 20 ± 2 °C)',                        'en':'(Standard: 20 ± 2 °C)',                         'de':'(Standard: 20 ± 2 °C)'                             },
    'Dentro do padrão':                           { 'pt-BR':'Dentro do padrão',                           'en':'Within standard',                               'de':'Im Normbereich'                                    },
    'Verificações (7 dias)':                      { 'pt-BR':'Verificações (7 dias)',                      'en':'Verifications (7 days)',                         'de':'Verifizierungen (7 Tage)'                          },
    'Conformes':                                  { 'pt-BR':'Conformes',                                  'en':'Compliant',                                     'de':'Konform'                                           },
    'Não Conformes':                              { 'pt-BR':'Não Conformes',                              'en':'Non-Compliant',                                 'de':'Nicht konform'                                     },
    'Última Leitura (T°)':                        { 'pt-BR':'Última Leitura (T°)',                        'en':'Last Reading (T°)',                              'de':'Letzte Ablesung (T°)'                              },
    'Histórico de Temperatura e Umidade':         { 'pt-BR':'Histórico de Temperatura e Umidade',         'en':'Temperature and Humidity History',               'de':'Temperatur- und Luftfeuchtigkeitsverlauf'          },
    'Temperatura (°C)':                           { 'pt-BR':'Temperatura (°C)',                           'en':'Temperature (°C)',                              'de':'Temperatur (°C)'                                   },
    'Umidade (%)':                                { 'pt-BR':'Umidade (%)',                                'en':'Humidity (%)',                                   'de':'Luftfeuchtigkeit (%)'                              },
    'Conformidade':                               { 'pt-BR':'Conformidade',                               'en':'Compliance',                                    'de':'Konformität'                                       },
    'Resultado':                                  { 'pt-BR':'Resultado',                                  'en':'Result',                                        'de':'Ergebnis'                                          },

    // ── Dashboard Avaliações ─────────────────────────────────────────
    'Índice de desempenho NPS · Reclamações · Satisfação dos clientes': { 'pt-BR':'Índice de desempenho NPS · Reclamações · Satisfação dos clientes', 'en':'NPS performance index · Complaints · Customer satisfaction', 'de':'NPS-Leistungsindex · Beschwerden · Kundenzufriedenheit' },
    'Promotores (9–10)':                          { 'pt-BR':'Promotores (9–10)',                          'en':'Promoters (9–10)',                               'de':'Promotoren (9–10)'                                 },
    'Neutros (7–8)':                              { 'pt-BR':'Neutros (7–8)',                              'en':'Neutral (7–8)',                                  'de':'Neutral (7–8)'                                     },
    'Detratores (0–6)':                           { 'pt-BR':'Detratores (0–6)',                           'en':'Detractors (0–6)',                               'de':'Detraktoren (0–6)'                                 },
    'Promotores':                                 { 'pt-BR':'Promotores',                                 'en':'Promoters',                                     'de':'Promotoren'                                        },
    'Neutros':                                    { 'pt-BR':'Neutros',                                    'en':'Neutral',                                       'de':'Neutral'                                           },
    'Detratores':                                 { 'pt-BR':'Detratores',                                 'en':'Detractors',                                    'de':'Detraktoren'                                       },
    'NPS por Mês':                                { 'pt-BR':'NPS por Mês',                                'en':'NPS by Month',                                  'de':'NPS nach Monat'                                    },
    'Respostas por Vínculo':                      { 'pt-BR':'Respostas por Vínculo',                      'en':'Responses by Affiliation',                      'de':'Antworten nach Zugehörigkeit'                      },
    'Comentários':                                { 'pt-BR':'Comentários',                                'en':'Comments',                                      'de':'Kommentare'                                        },
    'Reclamações':                                { 'pt-BR':'Reclamações',                                'en':'Complaints',                                    'de':'Beschwerden'                                       },
    'Sugestões':                                  { 'pt-BR':'Sugestões',                                  'en':'Suggestions',                                   'de':'Vorschläge'                                        },
    'Elogios':                                    { 'pt-BR':'Elogios',                                    'en':'Compliments',                                   'de':'Lob'                                               },
    'Reclamação':                                 { 'pt-BR':'Reclamação',                                 'en':'Complaint',                                     'de':'Beschwerde'                                        },
    'Sugestão':                                   { 'pt-BR':'Sugestão',                                   'en':'Suggestion',                                    'de':'Vorschlag'                                         },
    'Elogio':                                     { 'pt-BR':'Elogio',                                     'en':'Compliment',                                    'de':'Lob'                                               },
    'Últimas Respostas':                          { 'pt-BR':'Últimas Respostas',                          'en':'Latest Responses',                              'de':'Neueste Antworten'                                 },
    'Zona de Excelência':                         { 'pt-BR':'Zona de Excelência',                         'en':'Excellence Zone',                               'de':'Exzellenzzone'                                     },
    'Zona de Qualidade':                          { 'pt-BR':'Zona de Qualidade',                          'en':'Quality Zone',                                  'de':'Qualitätszone'                                     },
    'Zona de Melhoria':                           { 'pt-BR':'Zona de Melhoria',                           'en':'Improvement Zone',                              'de':'Verbesserungszone'                                 },
    'Zona Crítica':                               { 'pt-BR':'Zona Crítica',                               'en':'Critical Zone',                                 'de':'Kritische Zone'                                    },

    // ── Dashboard Serviços ───────────────────────────────────────────
    'Análise mensal de ordens de serviço — receita e volume': { 'pt-BR':'Análise mensal de ordens de serviço — receita e volume', 'en':'Monthly work order analysis — revenue and volume', 'de':'Monatliche Auftragsanalyse — Umsatz und Volumen' },
    'Média Mensal (OS)':                          { 'pt-BR':'Média Mensal (OS)',                          'en':'Monthly Average (WO)',                          'de':'Monatlicher Durchschnitt (AO)'                     },
    'Mês de Maior Volume':                        { 'pt-BR':'Mês de Maior Volume',                        'en':'Highest Volume Month',                          'de':'Monat mit höchstem Volumen'                        },
    'Receita por Mês (R$)':                       { 'pt-BR':'Receita por Mês (R$)',                       'en':'Revenue by Month (R$)',                         'de':'Umsatz nach Monat (R$)'                            },
    'Quantidade de OS por Mês':                   { 'pt-BR':'Quantidade de OS por Mês',                   'en':'WO Count by Month',                             'de':'AO-Anzahl nach Monat'                              },
    'Detalhamento Mensal':                        { 'pt-BR':'Detalhamento Mensal',                        'en':'Monthly Breakdown',                             'de':'Monatliche Aufschlüsselung'                        },
    'Qtd. OS':                                    { 'pt-BR':'Qtd. OS',                                    'en':'WO Qty.',                                       'de':'AO-Menge'                                          },
    'Receita (R$)':                               { 'pt-BR':'Receita (R$)',                               'en':'Revenue (R$)',                                  'de':'Umsatz (R$)'                                       },
    'Participação':                               { 'pt-BR':'Participação',                               'en':'Share',                                         'de':'Anteil'                                            },
    'TOTAL':                                      { 'pt-BR':'TOTAL',                                      'en':'TOTAL',                                         'de':'GESAMT'                                            },

    // ── Dashboard Eventos ────────────────────────────────────────────
    'Visão geral da participação e distribuição mensal de eventos': { 'pt-BR':'Visão geral da participação e distribuição mensal de eventos', 'en':'Overview of participation and monthly event distribution', 'de':'Übersicht der Teilnahme und monatlichen Veranstaltungsverteilung' },
    'participantes / convidados':                 { 'pt-BR':'participantes / convidados',                 'en':'participants / invitees',                       'de':'Teilnehmer / Eingeladene'                          },
    'Mês Mais Ativo':                             { 'pt-BR':'Mês Mais Ativo',                             'en':'Most Active Month',                             'de':'Aktivster Monat'                                   },
    'Meses com Eventos':                          { 'pt-BR':'Meses com Eventos',                          'en':'Months with Events',                            'de':'Monate mit Veranstaltungen'                        },
    'de 12 meses':                                { 'pt-BR':'de 12 meses',                                'en':'of 12 months',                                  'de':'von 12 Monaten'                                    },
    'Eventos por Mês':                            { 'pt-BR':'Eventos por Mês',                            'en':'Events by Month',                               'de':'Veranstaltungen nach Monat'                        },
    'Distribuição Mensal':                        { 'pt-BR':'Distribuição Mensal',                        'en':'Monthly Distribution',                          'de':'Monatliche Verteilung'                             },
    'Proporção de eventos por mês':               { 'pt-BR':'Proporção de eventos por mês',               'en':'Proportion of events per month',                'de':'Anteil der Veranstaltungen pro Monat'               },
    'Detalhamento por Mês':                       { 'pt-BR':'Detalhamento por Mês',                       'en':'Breakdown by Month',                            'de':'Aufschlüsselung nach Monat'                        },

    // ── Kanban placeholders ──────────────────────────────────────────
    'Buscar tarefa...':                           { 'pt-BR':'Buscar tarefa...',                           'en':'Search task...',                                'de':'Aufgabe suchen...'                                 },
    'Ex: Calibrar CMM Zeiss Contura':             { 'pt-BR':'Ex: Calibrar CMM Zeiss Contura',             'en':'E.g.: Calibrate CMM Zeiss Contura',             'de':'z.B.: CMM Zeiss Contura kalibrieren'               },
    'Detalhes sobre a tarefa...':                 { 'pt-BR':'Detalhes sobre a tarefa...',                 'en':'Task details...',                               'de':'Aufgabendetails...'                                },
    'Ex: calibração, cmm, laudo':                 { 'pt-BR':'Ex: calibração, cmm, laudo',                 'en':'E.g.: calibration, cmm, report',                'de':'z.B.: Kalibrierung, CMM, Bericht'                  },

    // ── Dashboards — subtítulos dinâmicos ────────────────────────────
    'Visão geral operacional · Carregando...':    { 'pt-BR':'Visão geral operacional · Carregando...', 'en':'Operational overview · Loading...', 'de':'Betriebsübersicht · Wird geladen...' },
    'Acompanhamento gerencial':                   { 'pt-BR':'Acompanhamento gerencial',               'en':'Management tracking',              'de':'Managementverfolgung'                },
    'Distribuição NPS':                           { 'pt-BR':'Distribuição NPS',                       'en':'NPS Distribution',                 'de':'NPS-Verteilung'                      },
    'Distribuição atual do pipeline de OS':       { 'pt-BR':'Distribuição atual do pipeline de OS',   'en':'Current WO pipeline distribution', 'de':'Aktuelle AO-Pipeline-Verteilung'     },
    'Distribuição do portfólio':                  { 'pt-BR':'Distribuição do portfólio',              'en':'Portfolio distribution',           'de':'Portfolio-Verteilung'                },
    'Monitoramento de expiração':                 { 'pt-BR':'Monitoramento de expiração',             'en':'Expiry monitoring',                'de':'Ablaufüberwachung'                   },
    'Registros de Verificação':                   { 'pt-BR':'Registros de Verificação',               'en':'Verification Records',             'de':'Verifizierungsaufzeichnungen'        },
    'Últimas verificações registradas':           { 'pt-BR':'Últimas verificações registradas',       'en':'Latest recorded verifications',    'de':'Letzte aufgezeichnete Verifizierungen' },
    'Gráfico indisponível — biblioteca D3 não carregada.': { 'pt-BR':'Gráfico indisponível — biblioteca D3 não carregada.', 'en':'Chart unavailable — D3 library not loaded.', 'de':'Diagramm nicht verfügbar — D3-Bibliothek nicht geladen.' },
    'Registros insuficientes para gráfico (mínimo 2).':    { 'pt-BR':'Registros insuficientes para gráfico (mínimo 2).', 'en':'Insufficient records for chart (minimum 2).', 'de':'Zu wenig Einträge für Diagramm (mindestens 2).' },

    // ── Status labels (tabelas / badges) ────────────────────────────
    'Inativa':                   { 'pt-BR':'Inativa',                   'en':'Inactive',                'de':'Inaktiv'                    },
    'A iniciar':                 { 'pt-BR':'A iniciar',                 'en':'To start',                'de':'Zu beginnen'                },
    'Em uso':                    { 'pt-BR':'Em uso',                    'en':'In use',                  'de':'In Verwendung'              },
    'Pendente autorização':      { 'pt-BR':'Pendente autorização',      'en':'Pending authorization',   'de':'Genehmigung ausstehend'     },
    'Cancelado':                 { 'pt-BR':'Cancelado',                 'en':'Cancelled',               'de':'Storniert'                  },

    // ── Status de máquinas/scanners ─────────────────────────────────

    // ── Períodos (verificação ambiental) ────────────────────────────

    // ── Conformidade (verificação ambiental) ────────────────────────
    'Conforme':                  { 'pt-BR':'Conforme',                  'en':'Compliant',               'de':'Konform'                    },
    'Não conforme':              { 'pt-BR':'Não conforme',              'en':'Non-compliant',           'de':'Nicht konform'              },
    'Desligadas':                { 'pt-BR':'Desligadas',                'en':'Switched off',            'de':'Ausgeschaltet'              },
    'Alguma ligada':             { 'pt-BR':'Alguma ligada',             'en':'Some still on',           'de':'Einige noch an'             },
    'Fora do padrão':            { 'pt-BR':'Fora do padrão',            'en':'Out of standard',         'de':'Außerhalb der Norm'         },
    'Todos desligados':          { 'pt-BR':'Todos desligados',          'en':'All switched off',        'de':'Alle ausgeschaltet'         },

    // ── Zonas NPS / avaliação ───────────────────────────────────────

    // ── Tipos de feedback ───────────────────────────────────────────

    // ── Perfis de usuário ───────────────────────────────────────────
    'ADMIN':                     { 'pt-BR':'ADMIN',                     'en':'ADMIN',                   'de':'ADMIN'                      },
    'OPERADOR':                  { 'pt-BR':'OPERADOR',                  'en':'OPERATOR',                'de':'BEDIENER'                   },
    'VISITANTE':                 { 'pt-BR':'VISITANTE',                 'en':'VISITOR',                 'de':'BESUCHER'                   },
    'ESTAGIÁRIO':                { 'pt-BR':'ESTAGIÁRIO',                'en':'INTERN',                  'de':'PRAKTIKANT'                 },

    // ── Estados de kanban ───────────────────────────────────────────
    'A Fazer':                   { 'pt-BR':'A Fazer',                   'en':'To Do',                   'de':'Zu erledigen'               },
    'Em Progresso':              { 'pt-BR':'Em Progresso',              'en':'In Progress',             'de':'In Bearbeitung'             },

    // ── Carregamento / estados vazios genéricos ─────────────────────
    'Nenhum registro encontrado.': { 'pt-BR':'Nenhum registro encontrado.', 'en':'No records found.',   'de':'Keine Einträge gefunden.'   },
    'Nenhuma nota registrada.':  { 'pt-BR':'Nenhuma nota registrada.',  'en':'No notes registered.',    'de':'Keine Notizen registriert.' },
    'Nenhum dado disponível.':   { 'pt-BR':'Nenhum dado disponível.',   'en':'No data available.',      'de':'Keine Daten verfügbar.'     },

    // ── Mensagens de empty state por módulo ─────────────────────────
    'Sem avaliações no período.':       { 'pt-BR':'Sem avaliações no período.',        'en':'No evaluations in this period.','de':'Keine Bewertungen im Zeitraum.'         },

    // ── Ações em tabelas (JS) ───────────────────────────────────────
    'Clique para ordenar':       { 'pt-BR':'Clique para ordenar',       'en':'Click to sort',           'de':'Zum Sortieren klicken'      },

    // ── Mensagens de ação (Toast / JS) ──────────────────────────────
    'Verificação registrada! (modo demo)':    { 'pt-BR':'Verificação registrada! (modo demo)',    'en':'Check registered! (demo mode)',          'de':'Prüfung registriert! (Demo)'             },
    'Recebimento registrado com sucesso!':    { 'pt-BR':'Recebimento registrado com sucesso!',    'en':'Reception registered successfully!',    'de':'Empfang erfolgreich registriert!'        },
    'Registro atualizado.':                   { 'pt-BR':'Registro atualizado.',                   'en':'Record updated.',                       'de':'Eintrag aktualisiert.'                   },
    'Preencha os campos obrigatórios (etapa 1).': { 'pt-BR':'Preencha os campos obrigatórios (etapa 1).', 'en':'Fill in the required fields (step 1).', 'de':'Pflichtfelder ausfüllen (Schritt 1).' },
    'Informe a data do recebimento.':         { 'pt-BR':'Informe a data do recebimento.',         'en':'Enter the reception date.',             'de':'Empfangsdatum eingeben.'                 },
    'Informe o responsável pelo recebimento.': { 'pt-BR':'Informe o responsável pelo recebimento.', 'en':'Enter the responsible for reception.', 'de':'Empfangsverantwortlichen eingeben.'     },
    'Informe o cliente / empresa.':           { 'pt-BR':'Informe o cliente / empresa.',           'en':'Enter the client / company.',           'de':'Kunden / Unternehmen eingeben.'          },
    'Informe a descrição da peça.':           { 'pt-BR':'Informe a descrição da peça.',           'en':'Enter the part description.',           'de':'Teilebeschreibung eingeben.'             },
    'Informe a unidade.':                     { 'pt-BR':'Informe a unidade.',                     'en':'Enter the unit.',                       'de':'Einheit eingeben.'                       },

    // ── Termos do termo de custódia ─────────────────────────────────
    'Novo Recebimento de Peças':       { 'pt-BR':'Novo Recebimento de Peças',       'en':'New Part Reception',           'de':'Neuer Teileempfang'           },
    'Editar Recebimento':              { 'pt-BR':'Editar Recebimento',              'en':'Edit Reception',               'de':'Empfang bearbeiten'           },
    'SENAI · Centro de Metrologia':    { 'pt-BR':'SENAI · Centro de Metrologia',   'en':'SENAI · Metrology Center',     'de':'SENAI · Metrologie-Zentrum'   },
    'TERMO DE CUSTÓDIA DE AMOSTRAS':   { 'pt-BR':'TERMO DE CUSTÓDIA DE AMOSTRAS',  'en':'SAMPLE CUSTODY TERM',          'de':'PROBENVERWAHRUNGS-DOKUMENT'   },

    // ── Navegação de etapas (stepper) ───────────────────────────────
    'Etapa':                     { 'pt-BR':'Etapa',                     'en':'Step',                    'de':'Schritt'                    },

    // ── Meses ───────────────────────────────────────────────────────
    'Janeiro':    { 'pt-BR':'Janeiro',    'en':'January',    'de':'Januar'    },
    'Fevereiro':  { 'pt-BR':'Fevereiro',  'en':'February',   'de':'Februar'   },
    'Março':      { 'pt-BR':'Março',      'en':'March',      'de':'März'      },
    'Abril':      { 'pt-BR':'Abril',      'en':'April',      'de':'April'     },
    'Maio':       { 'pt-BR':'Maio',       'en':'May',        'de':'Mai'       },
    'Junho':      { 'pt-BR':'Junho',      'en':'June',       'de':'Juni'      },
    'Julho':      { 'pt-BR':'Julho',      'en':'July',       'de':'Juli'      },
    'Agosto':     { 'pt-BR':'Agosto',     'en':'August',     'de':'August'    },
    'Setembro':   { 'pt-BR':'Setembro',   'en':'September',  'de':'September' },
    'Outubro':    { 'pt-BR':'Outubro',    'en':'October',    'de':'Oktober'   },
    'Novembro':   { 'pt-BR':'Novembro',   'en':'November',   'de':'November'  },
    'Dezembro':   { 'pt-BR':'Dezembro',   'en':'December',   'de':'Dezember'  },

    // ── Dias da semana ──────────────────────────────────────────────
    'Dom':  { 'pt-BR':'Dom', 'en':'Sun', 'de':'So' },
    'Seg':  { 'pt-BR':'Seg', 'en':'Mon', 'de':'Mo' },
    'Ter':  { 'pt-BR':'Ter', 'en':'Tue', 'de':'Di' },
    'Qua':  { 'pt-BR':'Qua', 'en':'Wed', 'de':'Mi' },
    'Qui':  { 'pt-BR':'Qui', 'en':'Thu', 'de':'Do' },
    'Sex':  { 'pt-BR':'Sex', 'en':'Fri', 'de':'Fr' },
    'Sáb':  { 'pt-BR':'Sáb', 'en':'Sat', 'de':'Sa' },

    // ── Ações de formulário / botões ────────────────────────────────
    'Confirmar e Enviar':          { 'pt-BR':'Confirmar e Enviar',          'en':'Confirm & Send',           'de':'Bestätigen & Senden'        },
    'Enviando…':                   { 'pt-BR':'Enviando…',                   'en':'Sending…',                 'de':'Senden…'                    },
    'Opções':                      { 'pt-BR':'Opções',                      'en':'Options',                  'de':'Optionen'                   },
    'Dispensar':                   { 'pt-BR':'Dispensar',                   'en':'Dismiss',                  'de':'Schließen'                  },

    // ── Kanban / status de coluna ────────────────────────────────────
    'Revisão':                     { 'pt-BR':'Revisão',                     'en':'Review',                   'de':'Überprüfung'                },

    // ── Estados vazios ───────────────────────────────────────────────
    'Nenhuma':                             { 'pt-BR':'Nenhuma',                             'en':'None',                             'de':'Keine'                              },
    'Nenhuma tarefa atribuída.':           { 'pt-BR':'Nenhuma tarefa atribuída.',           'en':'No tasks assigned.',               'de':'Keine Aufgaben zugewiesen.'         },
    'Nenhum comentário encontrado.':       { 'pt-BR':'Nenhum comentário encontrado.',       'en':'No comments found.',               'de':'Keine Kommentare gefunden.'         },
    'Nenhum agendamento encontrado.':      { 'pt-BR':'Nenhum agendamento encontrado.',      'en':'No appointments found.',           'de':'Keine Termine gefunden.'            },
    'Crie o primeiro agendamento para este scanner.': { 'pt-BR':'Crie o primeiro agendamento para este scanner.', 'en':'Create the first appointment for this scanner.', 'de':'Ersten Termin für diesen Scanner erstellen.' },
    'para adicionar certificados e documentos.':      { 'pt-BR':'para adicionar certificados e documentos.',      'en':'to add certificates and documents.',              'de':'um Zertifikate und Dokumente hinzuzufügen.'  },


    /* ═══ Texto estatico dos templates (auditoria 2026-08-16) ═══ */
    // ── 404 ──
    'A página que você está procurando não existe, foi movida ou você não tem permissão para acessá-la.': { 'pt-BR':'A página que você está procurando não existe, foi movida ou você não tem permissão para acessá-la.', 'en':'The page you are looking for does not exist, has been moved, or you do not have permission to access it.', 'de':'Die gesuchte Seite existiert nicht, wurde verschoben oder Sie haben keine Zugriffsberechtigung.' },

    // ── Amostras — formulário de recebimento ──
    '1. Identificação do Recebimento': { 'pt-BR':'1. Identificação do Recebimento', 'en':'1. Receipt Identification', 'de':'1. Wareneingang – Identifikation' },
    '2. Identificação da Peça / Item Recebido': { 'pt-BR':'2. Identificação da Peça / Item Recebido', 'en':'2. Part / Received Item Identification', 'de':'2. Identifikation des Bauteils / Wareneingangs' },
    '3. Serviço Solicitado': { 'pt-BR':'3. Serviço Solicitado', 'en':'3. Requested Service', 'de':'3. Angeforderte Dienstleistung' },
    '4. Condição da Peça no Recebimento': { 'pt-BR':'4. Condição da Peça no Recebimento', 'en':'4. Part Condition on Receipt', 'de':'4. Zustand des Bauteils bei Anlieferung' },
    '5. Registro Fotográfico': { 'pt-BR':'5. Registro Fotográfico', 'en':'5. Photographic Record', 'de':'5. Fotodokumentation' },
    '6. Identificação, Rastreabilidade e Armazenamento': { 'pt-BR':'6. Identificação, Rastreabilidade e Armazenamento', 'en':'6. Identification, Traceability and Storage', 'de':'6. Kennzeichnung, Rückverfolgbarkeit und Lagerung' },
    '7. Divergências Identificadas no Recebimento': { 'pt-BR':'7. Divergências Identificadas no Recebimento', 'en':'7. Discrepancies Identified on Receipt', 'de':'7. Bei Anlieferung festgestellte Abweichungen' },
    '8. Comunicação com o Cliente e Aceite': { 'pt-BR':'8. Comunicação com o Cliente e Aceite', 'en':'8. Customer Communication and Acceptance', 'de':'8. Kundenkommunikation und Annahme' },
    '9. Devolução, Retenção ou Destinação da Peça': { 'pt-BR':'9. Devolução, Retenção ou Destinação da Peça', 'en':'9. Return, Retention or Disposal of the Part', 'de':'9. Rückgabe, Einbehaltung oder Verbleib des Bauteils' },
    '10. Responsáveis': { 'pt-BR':'10. Responsáveis', 'en':'10. Responsible Parties', 'de':'10. Verantwortliche' },
    'A Peça Será Devolvida ao Cliente?': { 'pt-BR':'A Peça Será Devolvida ao Cliente?', 'en':'Will the Part Be Returned to the Customer?', 'de':'Wird das Bauteil an den Kunden zurückgegeben?' },
    'A Peça Será Retida Temporariamente?': { 'pt-BR':'A Peça Será Retida Temporariamente?', 'en':'Will the Part Be Temporarily Retained?', 'de':'Wird das Bauteil vorübergehend einbehalten?' },
    'Abrir Registro de Não Conformidade?': { 'pt-BR':'Abrir Registro de Não Conformidade?', 'en':'Open Nonconformity Record?', 'de':'Abweichungsbericht eröffnen?' },
    'Aprovação / Coordenação': { 'pt-BR':'Aprovação / Coordenação', 'en':'Approval / Coordination', 'de':'Freigabe / Koordination' },
    'Autorizou Continuidade com Ressalva?': { 'pt-BR':'Autorizou Continuidade com Ressalva?', 'en':'Authorized Continuation with Reservation?', 'de':'Fortsetzung unter Vorbehalt genehmigt?' },
    'Caminho da pasta com fotos / evidências': { 'pt-BR':'Caminho da pasta com fotos / evidências', 'en':'Path to folder with photos / evidence', 'de':'Pfad zum Ordner mit Fotos / Nachweisen' },
    'Características Especiais': { 'pt-BR':'Características Especiais', 'en':'Special Characteristics', 'de':'Besondere Merkmale' },
    'Classificação do Recebimento': { 'pt-BR':'Classificação do Recebimento', 'en':'Receipt Classification', 'de':'Klassifizierung des Wareneingangs' },
    'Cliente / Empresa': { 'pt-BR':'Cliente / Empresa', 'en':'Customer / Company', 'de':'Kunde / Unternehmen' },
    'Cliente Comunicado?': { 'pt-BR':'Cliente Comunicado?', 'en':'Customer Notified?', 'de':'Kunde benachrichtigt?' },
    'Código do Cliente / TAG / Part Number': { 'pt-BR':'Código do Cliente / TAG / Part Number', 'en':'Customer Code / TAG / Part Number', 'de':'Kundennummer / TAG / Teilenummer' },
    'Código Interno Atribuído': { 'pt-BR':'Código Interno Atribuído', 'en':'Assigned Internal Code', 'de':'Zugewiesener interner Code' },
    'Código Interno CEM': { 'pt-BR':'Código Interno CEM', 'en':'CEM Internal Code', 'de':'CEM-interner Code' },
    'Conclusão': { 'pt-BR':'Conclusão', 'en':'Conclusion', 'de':'Abschluss' },
    'Condição & Fotos': { 'pt-BR':'Condição & Fotos', 'en':'Condition & Photos', 'de':'Zustand & Fotos' },
    'Condição permite execução do serviço': { 'pt-BR':'Condição permite execução do serviço', 'en':'Condition allows the service to be performed', 'de':'Zustand lässt die Durchführung zu' },
    'Condição Requerida': { 'pt-BR':'Condição Requerida', 'en':'Required Condition', 'de':'Erforderliche Bedingung' },
    'Confirmar Devolução': { 'pt-BR':'Confirmar Devolução', 'en':'Confirm Return', 'de':'Rückgabe bestätigen' },
    'Data da Comunicação': { 'pt-BR':'Data da Comunicação', 'en':'Communication Date', 'de':'Datum der Mitteilung' },
    'Data do Recebimento': { 'pt-BR':'Data do Recebimento', 'en':'Receipt Date', 'de':'Eingangsdatum' },
    'Decisão Técnica': { 'pt-BR':'Decisão Técnica', 'en':'Technical Decision', 'de':'Technische Entscheidung' },
    'Descrição da Divergência': { 'pt-BR':'Descrição da Divergência', 'en':'Discrepancy Description', 'de':'Beschreibung der Abweichung' },
    'Divergências': { 'pt-BR':'Divergências', 'en':'Discrepancies', 'de':'Abweichungen' },
    'Documentação Técnica': { 'pt-BR':'Documentação Técnica', 'en':'Technical Documentation', 'de':'Technische Dokumentation' },
    'Documentos técnicos recebidos': { 'pt-BR':'Documentos técnicos recebidos', 'en':'Technical documents received', 'de':'Technische Unterlagen erhalten' },
    'Embalagem íntegra': { 'pt-BR':'Embalagem íntegra', 'en':'Packaging intact', 'de':'Verpackung unbeschädigt' },
    'Etapa 1 de 6': { 'pt-BR':'Etapa 1 de 6', 'en':'Step 1 of 6', 'de':'Schritt 1 von 6' },
    'Forma de Comunicação': { 'pt-BR':'Forma de Comunicação', 'en':'Communication Method', 'de':'Art der Mitteilung' },
    'Forma de Devolução': { 'pt-BR':'Forma de Devolução', 'en':'Return Method', 'de':'Art der Rückgabe' },
    'Forma de Identificação Aplicada': { 'pt-BR':'Forma de Identificação Aplicada', 'en':'Identification Method Applied', 'de':'Angewandte Kennzeichnung' },
    'Forma de Recebimento': { 'pt-BR':'Forma de Recebimento', 'en':'Delivery Method', 'de':'Art der Anlieferung' },
    'Formatos aceitos: PDF, JPG, PNG': { 'pt-BR':'Formatos aceitos: PDF, JPG, PNG', 'en':'Accepted formats: PDF, JPG, PNG', 'de':'Zulässige Formate: PDF, JPG, PNG' },
    'Foto da embalagem': { 'pt-BR':'Foto da embalagem', 'en':'Photo of the packaging', 'de':'Foto der Verpackung' },
    'Foto da peça antes do manuseio': { 'pt-BR':'Foto da peça antes do manuseio', 'en':'Photo of the part before handling', 'de':'Foto des Bauteils vor der Handhabung' },
    'Foto de danos, avarias ou irregularidades': { 'pt-BR':'Foto de danos, avarias ou irregularidades', 'en':'Photo of damage or irregularities', 'de':'Foto von Schäden oder Unregelmäßigkeiten' },
    'Foto de etiqueta / TAG / identificação': { 'pt-BR':'Foto de etiqueta / TAG / identificação', 'en':'Photo of label / TAG / identification', 'de':'Foto von Etikett / TAG / Kennzeichnung' },
    'Há CAD / modelo 3D?': { 'pt-BR':'Há CAD / modelo 3D?', 'en':'Is there a CAD / 3D model?', 'de':'Liegt ein CAD-/3D-Modell vor?' },
    'Há desenho técnico?': { 'pt-BR':'Há desenho técnico?', 'en':'Is there a technical drawing?', 'de':'Liegt eine technische Zeichnung vor?' },
    'Há especificação de tolerância?': { 'pt-BR':'Há especificação de tolerância?', 'en':'Is there a tolerance specification?', 'de':'Liegt eine Toleranzangabe vor?' },
    'Há instrução especial de manuseio?': { 'pt-BR':'Há instrução especial de manuseio?', 'en':'Are there special handling instructions?', 'de':'Gibt es besondere Handhabungshinweise?' },
    'Horário do Recebimento': { 'pt-BR':'Horário do Recebimento', 'en':'Receipt Time', 'de':'Uhrzeit des Eingangs' },
    'Houve Alguma Divergência?': { 'pt-BR':'Houve Alguma Divergência?', 'en':'Were There Any Discrepancies?', 'de':'Gab es Abweichungen?' },
    'Identificação': { 'pt-BR':'Identificação', 'en':'Identification', 'de':'Kennzeichnung' },
    'Identificação do cliente preservada': { 'pt-BR':'Identificação do cliente preservada', 'en':'Customer identification preserved', 'de':'Kundenkennzeichnung erhalten' },
    'Identificação preservada durante a permanência': { 'pt-BR':'Identificação preservada durante a permanência', 'en':'Identification preserved while stored', 'de':'Kennzeichnung während der Lagerung erhalten' },
    'Impacta o Resultado Técnico?': { 'pt-BR':'Impacta o Resultado Técnico?', 'en':'Does It Affect the Technical Result?', 'de':'Beeinflusst es das technische Ergebnis?' },
    'Justificativa / Ações Definidas': { 'pt-BR':'Justificativa / Ações Definidas', 'en':'Justification / Defined Actions', 'de':'Begründung / Festgelegte Maßnahmen' },
    'Local de Armazenamento Inicial': { 'pt-BR':'Local de Armazenamento Inicial', 'en':'Initial Storage Location', 'de':'Anfänglicher Lagerort' },
    'Necessita Condição Ambiental Específica?': { 'pt-BR':'Necessita Condição Ambiental Específica?', 'en':'Requires Specific Environmental Conditions?', 'de':'Erfordert besondere Umgebungsbedingungen?' },
    'Necessita embalagem especial': { 'pt-BR':'Necessita embalagem especial', 'en':'Requires special packaging', 'de':'Erfordert Spezialverpackung' },
    'Nº da Proposta / Orçamento / OS': { 'pt-BR':'Nº da Proposta / Orçamento / OS', 'en':'Quote / Estimate / Work Order No.', 'de':'Angebots-/Kostenvoranschlags-/Auftragsnr.' },
    'Nome / Descrição da Peça': { 'pt-BR':'Nome / Descrição da Peça', 'en':'Part Name / Description', 'de':'Bauteilname / -beschreibung' },
    'Objetivo Informado pelo Cliente': { 'pt-BR':'Objetivo Informado pelo Cliente', 'en':'Objective Stated by the Customer', 'de':'Vom Kunden angegebenes Ziel' },
    'Observação sobre condição': { 'pt-BR':'Observação sobre condição', 'en':'Note on condition', 'de':'Anmerkung zum Zustand' },
    'Observações de Devolução / Retenção': { 'pt-BR':'Observações de Devolução / Retenção', 'en':'Return / Retention Notes', 'de':'Anmerkungen zu Rückgabe / Einbehaltung' },
    'Observações de Preservação / Armazenamento': { 'pt-BR':'Observações de Preservação / Armazenamento', 'en':'Preservation / Storage Notes', 'de':'Anmerkungen zu Konservierung / Lagerung' },
    'Observações do Recebimento': { 'pt-BR':'Observações do Recebimento', 'en':'Receipt Notes', 'de':'Anmerkungen zum Wareneingang' },
    'Observações Gerais': { 'pt-BR':'Observações Gerais', 'en':'General Notes', 'de':'Allgemeine Anmerkungen' },
    'Observações Técnicas da Peça': { 'pt-BR':'Observações Técnicas da Peça', 'en':'Technical Notes on the Part', 'de':'Technische Anmerkungen zum Bauteil' },
    'Orientação / Justificativa do Aceite': { 'pt-BR':'Orientação / Justificativa do Aceite', 'en':'Acceptance Guidance / Justification', 'de':'Hinweis / Begründung der Annahme' },
    'Peça cortante / pesada / com risco': { 'pt-BR':'Peça cortante / pesada / com risco', 'en':'Sharp / heavy / hazardous part', 'de':'Scharfes / schweres / gefährliches Bauteil' },
    'Peça frágil': { 'pt-BR':'Peça frágil', 'en':'Fragile part', 'de':'Zerbrechliches Bauteil' },
    'Peça limpa / adequada para manuseio': { 'pt-BR':'Peça limpa / adequada para manuseio', 'en':'Part clean / suitable for handling', 'de':'Bauteil sauber / handhabbar' },
    'Peça recebida conforme descrição do cliente': { 'pt-BR':'Peça recebida conforme descrição do cliente', 'en':'Part received as described by the customer', 'de':'Bauteil wie vom Kunden beschrieben erhalten' },
    'Peça sem dano aparente de transporte': { 'pt-BR':'Peça sem dano aparente de transporte', 'en':'Part with no apparent transport damage', 'de':'Bauteil ohne sichtbaren Transportschaden' },
    'Peça sem risco de contaminação ao laboratório': { 'pt-BR':'Peça sem risco de contaminação ao laboratório', 'en':'Part poses no contamination risk to the lab', 'de':'Bauteil ohne Kontaminationsrisiko für das Labor' },
    'Próximo': { 'pt-BR':'Próximo', 'en':'Next', 'de':'Weiter' },
    'Quantidade recebida conforme informado': { 'pt-BR':'Quantidade recebida conforme informado', 'en':'Quantity received as stated', 'de':'Erhaltene Menge wie angegeben' },
    'Rastreabilidade': { 'pt-BR':'Rastreabilidade', 'en':'Traceability', 'de':'Rückverfolgbarkeit' },
    'Recebido Por': { 'pt-BR':'Recebido Por', 'en':'Received By', 'de':'Angenommen von' },
    'Responsável pelo Armazenamento': { 'pt-BR':'Responsável pelo Armazenamento', 'en':'Storage Responsible', 'de':'Verantwortlich für Lagerung' },
    'Responsável pelo Contato': { 'pt-BR':'Responsável pelo Contato', 'en':'Contact Responsible', 'de':'Verantwortlich für Kontakt' },
    'Responsável pelo Envio': { 'pt-BR':'Responsável pelo Envio', 'en':'Shipping Responsible', 'de':'Verantwortlich für Versand' },
    'Responsável Técnico': { 'pt-BR':'Responsável Técnico', 'en':'Technical Manager', 'de':'Technischer Leiter' },
    'Responsável Técnico Consultado': { 'pt-BR':'Responsável Técnico Consultado', 'en':'Technical Manager Consulted', 'de':'Technischer Leiter konsultiert' },
    'Salvar Anexo': { 'pt-BR':'Salvar Anexo', 'en':'Save Attachment', 'de':'Anhang speichern' },
    'Salvar Registro': { 'pt-BR':'Salvar Registro', 'en':'Save Record', 'de':'Datensatz speichern' },
    'Serviços': { 'pt-BR':'Serviços', 'en':'Services', 'de':'Dienstleistungen' },
    'Telefone / E-mail do Responsável': { 'pt-BR':'Telefone / E-mail do Responsável', 'en':'Contact Phone / E-mail', 'de':'Telefon / E-Mail des Ansprechpartners' },
    'Tem certeza que deseja excluir o registro de': { 'pt-BR':'Tem certeza que deseja excluir o registro de', 'en':'Are you sure you want to delete the record of', 'de':'Möchten Sie den Datensatz wirklich löschen von' },
    'Tipo Principal de Divergência': { 'pt-BR':'Tipo Principal de Divergência', 'en':'Main Discrepancy Type', 'de':'Hauptart der Abweichung' },
    '? Esta ação não pode ser desfeita.': { 'pt-BR':'? Esta ação não pode ser desfeita.', 'en':'? This action cannot be undone.', 'de':'? Diese Aktion kann nicht rückgängig gemacht werden.' },

    // ── Almoxarifado ──
    'Alerta quando quantidade ≤ este valor': { 'pt-BR':'Alerta quando quantidade ≤ este valor', 'en':'Alert when quantity ≤ this value', 'de':'Warnung, wenn Menge ≤ diesem Wert' },
    'Motivo / Observação': { 'pt-BR':'Motivo / Observação', 'en':'Reason / Note', 'de':'Grund / Anmerkung' },
    'Qtd': { 'pt-BR':'Qtd', 'en':'Qty', 'de':'Menge' },
    'Quantidade Inicial': { 'pt-BR':'Quantidade Inicial', 'en':'Initial Quantity', 'de':'Anfangsbestand' },
    'Tem certeza que deseja excluir': { 'pt-BR':'Tem certeza que deseja excluir', 'en':'Are you sure you want to delete', 'de':'Möchten Sie wirklich löschen' },

    // ── Verificação ambiental ──
    '(Padrão: 45–65 %)': { 'pt-BR':'(Padrão: 45–65 %)', 'en':'(Standard: 45–65 %)', 'de':'(Sollwert: 45–65 %)' },
    'A Prismo está sendo utilizada ou será utilizada em até 48 horas?': { 'pt-BR':'A Prismo está sendo utilizada ou será utilizada em até 48 horas?', 'en':'Is the Prismo in use or will it be used within 48 hours?', 'de':'Wird die Prismo genutzt oder innerhalb von 48 Stunden genutzt?' },
    'Algum permanece ligado': { 'pt-BR':'Algum permanece ligado', 'en':'Some remain switched on', 'de':'Einige bleiben eingeschaltet' },
    'Campos obrigatórios': { 'pt-BR':'Campos obrigatórios', 'en':'Required fields', 'de':'Pflichtfelder' },
    'Caso tenha ocorrido alguma não conformidade, descreva-a detalhadamente.': { 'pt-BR':'Caso tenha ocorrido alguma não conformidade, descreva-a detalhadamente.', 'en':'If a nonconformity occurred, describe it in detail.', 'de':'Falls eine Abweichung aufgetreten ist, beschreiben Sie diese ausführlich.' },
    'Confirmar envio': { 'pt-BR':'Confirmar envio', 'en':'Confirm submission', 'de':'Übermittlung bestätigen' },
    'Descreva a não conformidade observada (se houver):': { 'pt-BR':'Descreva a não conformidade observada (se houver):', 'en':'Describe the nonconformity observed (if any):', 'de':'Beschreiben Sie die festgestellte Abweichung (falls vorhanden):' },
    'Enviar Verificação': { 'pt-BR':'Enviar Verificação', 'en':'Submit Check', 'de':'Prüfung absenden' },
    'Não se aplica': { 'pt-BR':'Não se aplica', 'en':'Not applicable', 'de':'Nicht zutreffend' },
    'Os ar-condicionados estão funcionando corretamente?': { 'pt-BR':'Os ar-condicionados estão funcionando corretamente?', 'en':'Is the air conditioning working properly?', 'de':'Funktionieren die Klimaanlagen einwandfrei?' },
    'Período': { 'pt-BR':'Período', 'en':'Period', 'de':'Zeitraum' },
    'Revise os dados antes de confirmar o envio da verificação ambiental.': { 'pt-BR':'Revise os dados antes de confirmar o envio da verificação ambiental.', 'en':'Review the data before confirming the environmental check submission.', 'de':'Prüfen Sie die Daten, bevor Sie die Umgebungsprüfung absenden.' },
    'Temperatura °C': { 'pt-BR':'Temperatura °C', 'en':'Temperature °C', 'de':'Temperatur °C' },
    'Umidade %': { 'pt-BR':'Umidade %', 'en':'Humidity %', 'de':'Luftfeuchte %' },
    'Umidade relativa atual (%):': { 'pt-BR':'Umidade relativa atual (%):', 'en':'Current relative humidity (%):', 'de':'Aktuelle relative Luftfeuchte (%):' },

    // ── Kanban ──
    '(separadas por vírgula)': { 'pt-BR':'(separadas por vírgula)', 'en':'(comma-separated)', 'de':'(durch Komma getrennt)' },

    // ── Login ──
    '7 módulos de gestão operacional': { 'pt-BR':'7 módulos de gestão operacional', 'en':'7 operational management modules', 'de':'7 Module für das Betriebsmanagement' },
    'Aguarde alguns minutos e tente novamente.': { 'pt-BR':'Aguarde alguns minutos e tente novamente.', 'en':'Please wait a few minutes and try again.', 'de':'Bitte warten Sie einige Minuten und versuchen Sie es erneut.' },
    'Dashboards executivos em tempo real': { 'pt-BR':'Dashboards executivos em tempo real', 'en':'Real-time executive dashboards', 'de':'Executive-Dashboards in Echtzeit' },
    'Gestão de': { 'pt-BR':'Gestão de', 'en':'Management of', 'de':'Verwaltung von' },
    'Gestão de documentos e calibrações': { 'pt-BR':'Gestão de documentos e calibrações', 'en':'Document and calibration management', 'de':'Dokumenten- und Kalibrierverwaltung' },
    'Muitas tentativas de login.': { 'pt-BR':'Muitas tentativas de login.', 'en':'Too many login attempts.', 'de':'Zu viele Anmeldeversuche.' },
    'Rastreabilidade e controle de qualidade': { 'pt-BR':'Rastreabilidade e controle de qualidade', 'en':'Traceability and quality control', 'de':'Rückverfolgbarkeit und Qualitätskontrolle' },
    'Sistema Operacional': { 'pt-BR':'Sistema Operacional', 'en':'Operating System', 'de':'Betriebssystem' },

    // ── Avaliação (NPS) ──
    'A sua empresa ou o(a) senhor(a) realizou algum tipo de serviço com o Centro de Excelência em Metrologia Senai Zeiss?': { 'pt-BR':'A sua empresa ou o(a) senhor(a) realizou algum tipo de serviço com o Centro de Excelência em Metrologia Senai Zeiss?', 'en':'Have you or your company used any service from the SENAI Zeiss Metrology Center of Excellence?', 'de':'Haben Sie oder Ihr Unternehmen eine Dienstleistung des SENAI-Zeiss-Kompetenzzentrums für Messtechnik in Anspruch genommen?' },
    'Colaborador da Zeiss': { 'pt-BR':'Colaborador da Zeiss', 'en':'Zeiss employee', 'de':'Zeiss-Mitarbeiter' },
    'Colaborador do sistema S': { 'pt-BR':'Colaborador do sistema S', 'en':'S System employee', 'de':'Mitarbeiter des S-Systems' },
    'Estudante do sistema S': { 'pt-BR':'Estudante do sistema S', 'en':'S System student', 'de':'Studierender des S-Systems' },
    'Extremamente provável': { 'pt-BR':'Extremamente provável', 'en':'Extremely likely', 'de':'Äußerst wahrscheinlich' },
    'Formulário de satisfação — Centro de Excelência em Metrologia SENAI ZEISS': { 'pt-BR':'Formulário de satisfação — Centro de Excelência em Metrologia SENAI ZEISS', 'en':'Satisfaction form — SENAI ZEISS Metrology Center of Excellence', 'de':'Zufriedenheitsformular — SENAI ZEISS Kompetenzzentrum für Messtechnik' },
    'Nada provável': { 'pt-BR':'Nada provável', 'en':'Not at all likely', 'de':'Überhaupt nicht wahrscheinlich' },
    'Nova avaliação': { 'pt-BR':'Nova avaliação', 'en':'New review', 'de':'Neue Bewertung' },
    'O Centro de Excelência em Metrologia SENAI ZEISS busca sempre melhorar, escutando nossos clientes, visitantes, colaboradores e toda a comunidade. Você poderia nos ajudar nessa missão de melhoria contínua? Caso tenha, registre aqui alguma observação / reclamação / sugestão ou outro tipo de comentário adicional.': { 'pt-BR':'O Centro de Excelência em Metrologia SENAI ZEISS busca sempre melhorar, escutando nossos clientes, visitantes, colaboradores e toda a comunidade. Você poderia nos ajudar nessa missão de melhoria contínua? Caso tenha, registre aqui alguma observação / reclamação / sugestão ou outro tipo de comentário adicional.', 'en':'The SENAI ZEISS Metrology Center of Excellence is always striving to improve by listening to our customers, visitors, staff and the wider community. Could you help us in this continuous improvement effort? If you have any, please leave a remark, complaint, suggestion or other additional comment here.', 'de':'Das SENAI ZEISS Kompetenzzentrum für Messtechnik verbessert sich stetig, indem es Kunden, Besuchern, Mitarbeitenden und der Gemeinschaft zuhört. Möchten Sie uns dabei unterstützen? Hinterlassen Sie hier gerne eine Anmerkung, Beschwerde, Anregung oder einen sonstigen Kommentar.' },
    'Obrigado pela sua avaliação. Sua opinião é fundamental para melhorarmos continuamente nossos serviços.': { 'pt-BR':'Obrigado pela sua avaliação. Sua opinião é fundamental para melhorarmos continuamente nossos serviços.', 'en':'Thank you for your feedback. Your opinion is essential for us to continuously improve our services.', 'de':'Vielen Dank für Ihre Bewertung. Ihre Meinung ist entscheidend, damit wir unsere Leistungen laufend verbessern können.' },
    'Pergunta 1': { 'pt-BR':'Pergunta 1', 'en':'Question 1', 'de':'Frage 1' },
    'Pergunta 2': { 'pt-BR':'Pergunta 2', 'en':'Question 2', 'de':'Frage 2' },
    'Pergunta 3': { 'pt-BR':'Pergunta 3', 'en':'Question 3', 'de':'Frage 3' },
    'Pergunta 4': { 'pt-BR':'Pergunta 4', 'en':'Question 4', 'de':'Frage 4' },
    'Pergunta 5': { 'pt-BR':'Pergunta 5', 'en':'Question 5', 'de':'Frage 5' },
    'Qual é a probabilidade de você nos recomendar a um amigo ou a um colega os serviços prestados pelo Centro de Excelência em Metrologia Senai Zeiss?': { 'pt-BR':'Qual é a probabilidade de você nos recomendar a um amigo ou a um colega os serviços prestados pelo Centro de Excelência em Metrologia Senai Zeiss?', 'en':'How likely are you to recommend the services of the SENAI Zeiss Metrology Center of Excellence to a friend or colleague?', 'de':'Wie wahrscheinlich würden Sie die Leistungen des SENAI-Zeiss-Kompetenzzentrums für Messtechnik einem Freund oder Kollegen weiterempfehlen?' },
    'Qual seu vínculo com o Centro de Excelência em Metrologia Senai Zeiss?': { 'pt-BR':'Qual seu vínculo com o Centro de Excelência em Metrologia Senai Zeiss?', 'en':'What is your relationship with the SENAI Zeiss Metrology Center of Excellence?', 'de':'In welcher Beziehung stehen Sie zum SENAI-Zeiss-Kompetenzzentrum für Messtechnik?' },
    'Quando você enviar este formulário, ele não coletará automaticamente seus detalhes, como nome e endereço de e-mail, a menos que você mesmo o forneça.': { 'pt-BR':'Quando você enviar este formulário, ele não coletará automaticamente seus detalhes, como nome e endereço de e-mail, a menos que você mesmo o forneça.', 'en':'When you submit this form, it will not automatically collect your details, such as name and e-mail address, unless you provide them yourself.', 'de':'Beim Absenden dieses Formulars werden Ihre Daten wie Name und E-Mail-Adresse nicht automatisch erfasst, sofern Sie sie nicht selbst angeben.' },
    'Resposta enviada com sucesso!': { 'pt-BR':'Resposta enviada com sucesso!', 'en':'Response submitted successfully!', 'de':'Antwort erfolgreich übermittelt!' },
    'Sobre qual serviço deseja avaliar? (Descrição breve do serviço realizado)': { 'pt-BR':'Sobre qual serviço deseja avaliar? (Descrição breve do serviço realizado)', 'en':'Which service would you like to review? (Brief description of the service performed)', 'de':'Welche Leistung möchten Sie bewerten? (Kurze Beschreibung der erbrachten Leistung)' },
    'Ver Dashboard': { 'pt-BR':'Ver Dashboard', 'en':'View Dashboard', 'de':'Dashboard ansehen' },
    'Ver resultados': { 'pt-BR':'Ver resultados', 'en':'View results', 'de':'Ergebnisse ansehen' },

    // ── Visitas técnicas ──
    'Agendamento e controle de visitas ao laboratório': { 'pt-BR':'Agendamento e controle de visitas ao laboratório', 'en':'Scheduling and control of laboratory visits', 'de':'Planung und Kontrolle von Laborbesuchen' },
    'Agendar Visita': { 'pt-BR':'Agendar Visita', 'en':'Schedule Visit', 'de':'Besuch planen' },
    'Data Agendada': { 'pt-BR':'Data Agendada', 'en':'Scheduled Date', 'de':'Geplantes Datum' },
    'Data Solicitada': { 'pt-BR':'Data Solicitada', 'en':'Requested Date', 'de':'Angefragtes Datum' },
    'Empresa': { 'pt-BR':'Empresa', 'en':'Company', 'de':'Unternehmen' },
    'Quantidade de Pessoas': { 'pt-BR':'Quantidade de Pessoas', 'en':'Number of People', 'de':'Personenanzahl' },
    'Situação:': { 'pt-BR':'Situação:', 'en':'Status:', 'de':'Status:' },
    'Telefone(s)': { 'pt-BR':'Telefone(s)', 'en':'Phone(s)', 'de':'Telefon(e)' },
    'Visita Realizada?': { 'pt-BR':'Visita Realizada?', 'en':'Visit Completed?', 'de':'Besuch durchgeführt?' },

    // ── Dashboard executivo ──
    'Agendamentos pendentes': { 'pt-BR':'Agendamentos pendentes', 'en':'Pending appointments', 'de':'Ausstehende Termine' },
    'Documentos — Controle de Validade': { 'pt-BR':'Documentos — Controle de Validade', 'en':'Documents — Expiry Control', 'de':'Dokumente — Gültigkeitskontrolle' },
    'Ordens de Serviço por Status': { 'pt-BR':'Ordens de Serviço por Status', 'en':'Work Orders by Status', 'de':'Aufträge nach Status' },
    'Projetos por Status': { 'pt-BR':'Projetos por Status', 'en':'Projects by Status', 'de':'Projekte nach Status' },
    'Receita por Serviços (últimos 6 meses)': { 'pt-BR':'Receita por Serviços (últimos 6 meses)', 'en':'Revenue by Services (last 6 months)', 'de':'Umsatz nach Leistungen (letzte 6 Monate)' },
    'Valor total das ordens finalizadas': { 'pt-BR':'Valor total das ordens finalizadas', 'en':'Total value of completed orders', 'de':'Gesamtwert der abgeschlossenen Aufträge' },
    'Ver OS': { 'pt-BR':'Ver OS', 'en':'View Work Orders', 'de':'Aufträge ansehen' },
    'Ver Todas': { 'pt-BR':'Ver Todas', 'en':'View All', 'de':'Alle ansehen' },

    // ── Máquinas ──
    'Anexar Documento': { 'pt-BR':'Anexar Documento', 'en':'Attach Document', 'de':'Dokument anhängen' },
    'Calibrações, manuais, laudos técnicos e certificados vinculados a este equipamento.': { 'pt-BR':'Calibrações, manuais, laudos técnicos e certificados vinculados a este equipamento.', 'en':'Calibrations, manuals, technical reports and certificates linked to this equipment.', 'de':'Kalibrierungen, Handbücher, Gutachten und Zertifikate zu diesem Gerät.' },
    'Confirmado?': { 'pt-BR':'Confirmado?', 'en':'Confirmed?', 'de':'Bestätigt?' },
    'Data / Hora de Retirada': { 'pt-BR':'Data / Hora de Retirada', 'en':'Checkout Date / Time', 'de':'Datum / Uhrzeit der Entnahme' },
    'Data / Hora de Retorno': { 'pt-BR':'Data / Hora de Retorno', 'en':'Return Date / Time', 'de':'Datum / Uhrzeit der Rückgabe' },
    'Data / hora desligada': { 'pt-BR':'Data / hora desligada', 'en':'Date / time switched off', 'de':'Datum / Uhrzeit ausgeschaltet' },
    'Data / hora fim': { 'pt-BR':'Data / hora fim', 'en':'End date / time', 'de':'Enddatum / -uhrzeit' },
    'Data / hora início': { 'pt-BR':'Data / hora início', 'en':'Start date / time', 'de':'Startdatum / -uhrzeit' },
    'Data / hora ligada': { 'pt-BR':'Data / hora ligada', 'en':'Date / time switched on', 'de':'Datum / Uhrzeit eingeschaltet' },
    'Data realizada': { 'pt-BR':'Data realizada', 'en':'Date performed', 'de':'Durchführungsdatum' },
    'Deixe em branco se o documento não expira.': { 'pt-BR':'Deixe em branco se o documento não expira.', 'en':'Leave blank if the document does not expire.', 'de':'Leer lassen, wenn das Dokument nicht abläuft.' },
    'Devolvidos': { 'pt-BR':'Devolvidos', 'en':'Returned', 'de':'Zurückgegeben' },
    'Documentos da Máquina': { 'pt-BR':'Documentos da Máquina', 'en':'Machine Documents', 'de':'Maschinendokumente' },
    'Duração': { 'pt-BR':'Duração', 'en':'Duration', 'de':'Dauer' },
    'Local de Utilização': { 'pt-BR':'Local de Utilização', 'en':'Place of Use', 'de':'Einsatzort' },
    'Motivo / Peças': { 'pt-BR':'Motivo / Peças', 'en':'Reason / Parts', 'de':'Grund / Teile' },
    'Preencha somente ao registrar a devolução.': { 'pt-BR':'Preencha somente ao registrar a devolução.', 'en':'Fill in only when recording the return.', 'de':'Nur beim Erfassen der Rückgabe ausfüllen.' },
    'Registrar Retirada': { 'pt-BR':'Registrar Retirada', 'en':'Record Checkout', 'de':'Entnahme erfassen' },
    'Responsável pela retirada': { 'pt-BR':'Responsável pela retirada', 'en':'Checkout responsible', 'de':'Verantwortlich für Entnahme' },
    'Retirada': { 'pt-BR':'Retirada', 'en':'Checkout', 'de':'Entnahme' },
    'Retorno': { 'pt-BR':'Retorno', 'en':'Return', 'de':'Rückgabe' },
    'Scanner': { 'pt-BR':'Scanner', 'en':'Scanner', 'de':'Scanner' },
    'Somente arquivos PDF são aceitos.': { 'pt-BR':'Somente arquivos PDF são aceitos.', 'en':'Only PDF files are accepted.', 'de':'Es werden nur PDF-Dateien akzeptiert.' },
    'Upload': { 'pt-BR':'Upload', 'en':'Upload', 'de':'Hochladen' },
    'Usuário responsável': { 'pt-BR':'Usuário responsável', 'en':'Responsible user', 'de':'Verantwortlicher Benutzer' },

    // ── Documentos ──
    'Arquivo PDF': { 'pt-BR':'Arquivo PDF', 'en':'PDF File', 'de':'PDF-Datei' },
    'Arraste um arquivo PDF aqui ou': { 'pt-BR':'Arraste um arquivo PDF aqui ou', 'en':'Drag a PDF file here or', 'de':'PDF-Datei hierher ziehen oder' },
    'clique para selecionar': { 'pt-BR':'clique para selecionar', 'en':'click to select', 'de':'zum Auswählen klicken' },
    'Data de Expiração': { 'pt-BR':'Data de Expiração', 'en':'Expiry Date', 'de':'Ablaufdatum' },
    'Data de validade do documento (ISO 17025).': { 'pt-BR':'Data de validade do documento (ISO 17025).', 'en':'Document validity date (ISO 17025).', 'de':'Gültigkeitsdatum des Dokuments (ISO 17025).' },
    'Enviar Documento': { 'pt-BR':'Enviar Documento', 'en':'Upload Document', 'de':'Dokument hochladen' },

    // ── Usuários ──
    'As permissões abaixo são preenchidas automaticamente ao selecionar o cargo. Você pode personalizar individualmente.': { 'pt-BR':'As permissões abaixo são preenchidas automaticamente ao selecionar o cargo. Você pode personalizar individualmente.', 'en':'The permissions below are filled in automatically when a role is selected. You can customize them individually.', 'de':'Die folgenden Berechtigungen werden bei Auswahl der Position automatisch gesetzt. Sie können sie einzeln anpassen.' },
    'Certificados, termos e documentos vinculados a este usuário.': { 'pt-BR':'Certificados, termos e documentos vinculados a este usuário.', 'en':'Certificates, agreements and documents linked to this user.', 'de':'Zertifikate, Vereinbarungen und Dokumente zu diesem Benutzer.' },
    'Nome Completo': { 'pt-BR':'Nome Completo', 'en':'Full Name', 'de':'Vollständiger Name' },

    // ── Projetos ──
    'Atividades': { 'pt-BR':'Atividades', 'en':'Activities', 'de':'Aktivitäten' },
    'Custo Anual Previsto (R$)': { 'pt-BR':'Custo Anual Previsto (R$)', 'en':'Expected Annual Cost (R$)', 'de':'Erwartete Jahreskosten (R$)' },
    'Custo Previsto': { 'pt-BR':'Custo Previsto', 'en':'Expected Cost', 'de':'Erwartete Kosten' },
    'Data Real de Finalização': { 'pt-BR':'Data Real de Finalização', 'en':'Actual Completion Date', 'de':'Tatsächliches Abschlussdatum' },
    'Finalização Real': { 'pt-BR':'Finalização Real', 'en':'Actual Completion', 'de':'Tatsächlicher Abschluss' },
    'Nome do Projeto': { 'pt-BR':'Nome do Projeto', 'en':'Project Name', 'de':'Projektname' },
    'Objetivo': { 'pt-BR':'Objetivo', 'en':'Objective', 'de':'Ziel' },
    'Portfólio de projetos e acompanhamento de execução': { 'pt-BR':'Portfólio de projetos e acompanhamento de execução', 'en':'Project portfolio and execution tracking', 'de':'Projektportfolio und Ausführungsverfolgung' },
    'Prev. Início': { 'pt-BR':'Prev. Início', 'en':'Est. Start', 'de':'Vsl. Beginn' },
    'Prev. Término': { 'pt-BR':'Prev. Término', 'en':'Est. End', 'de':'Vsl. Ende' },
    'Previsão de Início': { 'pt-BR':'Previsão de Início', 'en':'Estimated Start', 'de':'Geplanter Beginn' },
    'Previsão de Término': { 'pt-BR':'Previsão de Término', 'en':'Estimated End', 'de':'Geplantes Ende' },
    'Projeto': { 'pt-BR':'Projeto', 'en':'Project', 'de':'Projekt' },
    'Responsável:': { 'pt-BR':'Responsável:', 'en':'Responsible:', 'de':'Verantwortlich:' },
    'Retorno Previsto': { 'pt-BR':'Retorno Previsto', 'en':'Expected Return', 'de':'Erwarteter Ertrag' },
    'Retorno Previsto (R$)': { 'pt-BR':'Retorno Previsto (R$)', 'en':'Expected Return (R$)', 'de':'Erwarteter Ertrag (R$)' },

    // ── Eventos ──
    'Calendário': { 'pt-BR':'Calendário', 'en':'Calendar', 'de':'Kalender' },
    'Controle e agendamento de eventos institucionais': { 'pt-BR':'Controle e agendamento de eventos institucionais', 'en':'Control and scheduling of institutional events', 'de':'Steuerung und Planung institutioneller Veranstaltungen' },
    'Lista': { 'pt-BR':'Lista', 'en':'List', 'de':'Liste' },
    'Nº de Participantes': { 'pt-BR':'Nº de Participantes', 'en':'No. of Participants', 'de':'Teilnehmerzahl' },
    'Novo evento neste dia': { 'pt-BR':'Novo evento neste dia', 'en':'New event on this day', 'de':'Neue Veranstaltung an diesem Tag' },

    // ── Serviços (OS) ──
    'CPF / CNPJ': { 'pt-BR':'CPF / CNPJ', 'en':'Tax ID (CPF / CNPJ)', 'de':'Steuernummer (CPF / CNPJ)' },
    'Data de Execução Prevista': { 'pt-BR':'Data de Execução Prevista', 'en':'Planned Execution Date', 'de':'Geplantes Ausführungsdatum' },
    'Data de Execução Realizada': { 'pt-BR':'Data de Execução Realizada', 'en':'Actual Execution Date', 'de':'Tatsächliches Ausführungsdatum' },
    'Descrição do Serviço': { 'pt-BR':'Descrição do Serviço', 'en':'Service Description', 'de':'Leistungsbeschreibung' },
    'Endereço': { 'pt-BR':'Endereço', 'en':'Address', 'de':'Adresse' },
    'Excluir OS': { 'pt-BR':'Excluir OS', 'en':'Delete Work Order', 'de':'Auftrag löschen' },
    'Técnico Responsável': { 'pt-BR':'Técnico Responsável', 'en':'Responsible Technician', 'de':'Zuständiger Techniker' },

    // ── Estagiários ──
    'Dashboard de Desempenho': { 'pt-BR':'Dashboard de Desempenho', 'en':'Performance Dashboard', 'de':'Leistungs-Dashboard' },

    // ── Editais ──
    'Detalhes': { 'pt-BR':'Detalhes', 'en':'Details', 'de':'Details' },
    'Gestão de editais e convênios institucionais': { 'pt-BR':'Gestão de editais e convênios institucionais', 'en':'Management of public calls and institutional agreements', 'de':'Verwaltung von Ausschreibungen und institutionellen Vereinbarungen' },
    'Inst. Fornecedora': { 'pt-BR':'Inst. Fornecedora', 'en':'Funding Inst.', 'de':'Fördernde Inst.' },
    'Inst. Parceira': { 'pt-BR':'Inst. Parceira', 'en':'Partner Inst.', 'de':'Partnerinst.' },
    'Instituição Fornecedora': { 'pt-BR':'Instituição Fornecedora', 'en':'Funding Institution', 'de':'Fördernde Institution' },
    'Instituição Parceira': { 'pt-BR':'Instituição Parceira', 'en':'Partner Institution', 'de':'Partnerinstitution' },
    'Nome / Título': { 'pt-BR':'Nome / Título', 'en':'Name / Title', 'de':'Name / Titel' },
    'Nome do Edital': { 'pt-BR':'Nome do Edital', 'en':'Call Name', 'de':'Name der Ausschreibung' },
    'Status Atual': { 'pt-BR':'Status Atual', 'en':'Current Status', 'de':'Aktueller Status' },
    'Status:': { 'pt-BR':'Status:', 'en':'Status:', 'de':'Status:' },
    'Valor (R$)': { 'pt-BR':'Valor (R$)', 'en':'Amount (R$)', 'de':'Betrag (R$)' },
    'Valor do Edital': { 'pt-BR':'Valor do Edital', 'en':'Call Amount', 'de':'Betrag der Ausschreibung' },

    /* ═══ Valores vindos do banco e opcoes de formulario (auditoria 2026-08-16) ═══ */
    // ── Serviços de amostra ──
    'Medição dimensional':                               { 'pt-BR':'Medição dimensional', 'en':'Dimensional measurement', 'de':'Dimensionelle Messung' },
    'Digitalização 3D':                                  { 'pt-BR':'Digitalização 3D', 'en':'3D scanning', 'de':'3D-Digitalisierung' },
    'Engenharia reversa':                                { 'pt-BR':'Engenharia reversa', 'en':'Reverse engineering', 'de':'Reverse Engineering' },
    'Comparação peça x CAD':                             { 'pt-BR':'Comparação peça x CAD', 'en':'Part vs. CAD comparison', 'de':'Bauteil-CAD-Vergleich' },
    'Tomografia / Raio X Bosello':                       { 'pt-BR':'Tomografia / Raio X Bosello', 'en':'Tomography / Bosello X-ray', 'de':'Tomografie / Bosello-Röntgen' },
    'Análise de falha':                                  { 'pt-BR':'Análise de falha', 'en':'Failure analysis', 'de':'Fehleranalyse' },
    'Inspeção visual':                                   { 'pt-BR':'Inspeção visual', 'en':'Visual inspection', 'de':'Sichtprüfung' },
    'Validação dimensional ZEISS':                       { 'pt-BR':'Validação dimensional ZEISS', 'en':'ZEISS dimensional validation', 'de':'ZEISS Dimensionsvalidierung' },
    'Elaboração de relatório técnico':                   { 'pt-BR':'Elaboração de relatório técnico', 'en':'Technical report preparation', 'de':'Erstellung des technischen Berichts' },
    'Criação de biblioteca digital':                     { 'pt-BR':'Criação de biblioteca digital', 'en':'Digital library creation', 'de':'Aufbau der digitalen Bibliothek' },

    // ── Unidades de medida ──
    'un':                                                { 'pt-BR':'un', 'en':'pcs', 'de':'Stk' },
    'lote':                                              { 'pt-BR':'lote', 'en':'batch', 'de':'Charge' },
    'peça(s)':                                           { 'pt-BR':'peça(s)', 'en':'piece(s)', 'de':'Stück' },
    'caixa':                                             { 'pt-BR':'caixa', 'en':'box', 'de':'Karton' },
    'kit':                                               { 'pt-BR':'kit', 'en':'kit', 'de':'Set' },
    'litro':                                             { 'pt-BR':'litro', 'en':'liter', 'de':'Liter' },
    'resma':                                             { 'pt-BR':'resma', 'en':'ream', 'de':'Ries' },
    'rolo':                                              { 'pt-BR':'rolo', 'en':'roll', 'de':'Rolle' },

    // ── Forma de recebimento / contato ──
    'Correios':                                          { 'pt-BR':'Correios', 'en':'Postal service', 'de':'Post' },
    'Entregadora':                                       { 'pt-BR':'Entregadora', 'en':'Courier company', 'de':'Lieferdienst' },
    'Motoboy':                                           { 'pt-BR':'Motoboy', 'en':'Motorcycle courier', 'de':'Motorradkurier' },
    'Pessoalmente':                                      { 'pt-BR':'Pessoalmente', 'en':'In person', 'de':'Persönlich' },
    'Presencial':                                        { 'pt-BR':'Presencial', 'en':'In person', 'de':'Vor Ort' },
    'Telefone':                                          { 'pt-BR':'Telefone', 'en':'Phone', 'de':'Telefon' },
    'WhatsApp':                                          { 'pt-BR':'WhatsApp', 'en':'WhatsApp', 'de':'WhatsApp' },

    // ── Motivos de uso de máquina ──
    'Calibração de rotina':                              { 'pt-BR':'Calibração de rotina', 'en':'Routine calibration', 'de':'Routinekalibrierung' },
    'Escaneamento de amostra':                           { 'pt-BR':'Escaneamento de amostra', 'en':'Sample scanning', 'de':'Probenscan' },
    'Medição de OS em andamento':                        { 'pt-BR':'Medição de OS em andamento', 'en':'Measurement for ongoing work order', 'de':'Messung für laufenden Auftrag' },
    'Verificação de repetibilidade':                     { 'pt-BR':'Verificação de repetibilidade', 'en':'Repeatability check', 'de':'Wiederholbarkeitsprüfung' },
    'Treinamento de operação':                           { 'pt-BR':'Treinamento de operação', 'en':'Operation training', 'de':'Bedienschulung' },

    // ── Motivos de movimentação de estoque ──
    'Ajuste de inventário':                              { 'pt-BR':'Ajuste de inventário', 'en':'Inventory adjustment', 'de':'Bestandskorrektur' },
    'Compra de fornecedor':                              { 'pt-BR':'Compra de fornecedor', 'en':'Supplier purchase', 'de':'Lieferantenkauf' },
    'Consumo em treinamento':                            { 'pt-BR':'Consumo em treinamento', 'en':'Used in training', 'de':'Verbrauch in Schulung' },
    'Reposição de estoque':                              { 'pt-BR':'Reposição de estoque', 'en':'Stock replenishment', 'de':'Bestandsauffüllung' },
    'Uso em calibração':                                 { 'pt-BR':'Uso em calibração', 'en':'Used in calibration', 'de':'Verbrauch bei Kalibrierung' },
    'Uso em serviço':                                    { 'pt-BR':'Uso em serviço', 'en':'Used in service', 'de':'Verbrauch im Service' },

    // ── Tipos de documento de máquina ──
    'Certificado':                                       { 'pt-BR':'Certificado', 'en':'Certificate', 'de':'Zertifikat' },
    'Ficha Técnica':                                     { 'pt-BR':'Ficha Técnica', 'en':'Data sheet', 'de':'Datenblatt' },
    'Laudo':                                             { 'pt-BR':'Laudo', 'en':'Technical opinion', 'de':'Gutachten' },
    'Manual':                                            { 'pt-BR':'Manual', 'en':'Manual', 'de':'Handbuch' },
    'Certificado de Calibração':                         { 'pt-BR':'Certificado de Calibração', 'en':'Calibration Certificate', 'de':'Kalibrierschein' },
    'Certificado de Garantia':                           { 'pt-BR':'Certificado de Garantia', 'en':'Warranty Certificate', 'de':'Garantieurkunde' },
    'Laudo Técnico':                                     { 'pt-BR':'Laudo Técnico', 'en':'Technical Report', 'de':'Technisches Gutachten' },
    'Manual do Equipamento':                             { 'pt-BR':'Manual do Equipamento', 'en':'Equipment Manual', 'de':'Gerätehandbuch' },
    'Relatório de Manutenção':                           { 'pt-BR':'Relatório de Manutenção', 'en':'Maintenance Report', 'de':'Wartungsbericht' },
    'NR-12 (Segurança em Máquinas)':                     { 'pt-BR':'NR-12 (Segurança em Máquinas)', 'en':'NR-12 (Machine Safety)', 'de':'NR-12 (Maschinensicherheit)' },

    // ── Diálogos, KPIs e rótulos remanescentes (auditoria de JS sem _t) ──
    'Confirmar ação':   { 'pt-BR':'Confirmar ação',   'en':'Confirm action',   'de':'Aktion bestätigen'   },
    'Deseja continuar?':{ 'pt-BR':'Deseja continuar?','en':'Do you want to continue?','de':'Möchten Sie fortfahren?' },
    'Não respondeu':    { 'pt-BR':'Não respondeu',    'en':'Did not answer',   'de':'Keine Angabe'        },
    'Média NPS':        { 'pt-BR':'Média NPS',        'en':'NPS average',      'de':'NPS-Durchschnitt'    },
    'do total':         { 'pt-BR':'do total',         'en':'of total',         'de':'vom Gesamtwert'      },
    'comentário(s)':    { 'pt-BR':'comentário(s)',    'en':'comment(s)',       'de':'Kommentar(e)'        },
    'Registrar Retorno':{ 'pt-BR':'Registrar Retorno','en':'Record Return',    'de':'Rückgabe erfassen'   },
    '⚠ O scanner sairá dos domínios do laboratório. Certifique-se de que o transporte está autorizado.': { 'pt-BR':'⚠ O scanner sairá dos domínios do laboratório. Certifique-se de que o transporte está autorizado.', 'en':'⚠ The scanner will leave the laboratory premises. Make sure transport is authorized.', 'de':'⚠ Der Scanner verlässt das Laborgelände. Stellen Sie sicher, dass der Transport genehmigt ist.' },

    // ── Textos longos / com entidade HTML (chave = texto já decodificado) ──
    'Plataforma integrada de controle operacional para o laboratório de metrologia, alinhada às normas ISO 17025 e ISO 9001.': { 'pt-BR':'Plataforma integrada de controle operacional para o laboratório de metrologia, alinhada às normas ISO 17025 e ISO 9001.', 'en':'Integrated operational control platform for the metrology laboratory, aligned with the ISO 17025 and ISO 9001 standards.', 'de':'Integrierte Plattform zur Betriebssteuerung des Messtechniklabors, ausgerichtet an den Normen ISO 17025 und ISO 9001.' },
    'Se for final do dia, confirme que todos os aparelhos de ar condicionado, luzes e as 04 máquinas (Prismo, Duramax, O-inspect e Bosello) estão desligadas:': { 'pt-BR':'Se for final do dia, confirme que todos os aparelhos de ar condicionado, luzes e as 04 máquinas (Prismo, Duramax, O-inspect e Bosello) estão desligadas:', 'en':'If this is the end of the day, confirm that all air conditioners, lights and the 4 machines (Prismo, Duramax, O-Inspect and Bosello) are switched off:', 'de':'Bestätigen Sie am Tagesende, dass alle Klimaanlagen, Lichter und die 4 Maschinen (Prismo, Duramax, O-Inspect und Bosello) ausgeschaltet sind:' },
    '✓ Logout realizado com sucesso.': { 'pt-BR':'✓ Logout realizado com sucesso.', 'en':'✓ Signed out successfully.', 'de':'✓ Erfolgreich abgemeldet.' },
    'Avaliação — Centro de Excelência SENAI ZEISS': { 'pt-BR':'Avaliação — Centro de Excelência SENAI ZEISS', 'en':'Review — SENAI ZEISS Center of Excellence', 'de':'Bewertung — SENAI ZEISS Kompetenzzentrum' },
    'arquivo.pdf': { 'pt-BR':'arquivo.pdf', 'en':'file.pdf', 'de':'datei.pdf' },

    // ── Rótulos da ficha de estagiário ──
    'Turno':                                             { 'pt-BR':'Turno', 'en':'Shift', 'de':'Schicht' },
    'Orientador':                                        { 'pt-BR':'Orientador', 'en':'Supervisor', 'de':'Betreuer' },
    'Início':                                            { 'pt-BR':'Início', 'en':'Start', 'de':'Beginn' },

    // ── Áreas e turnos de estagiário ──
    'Metrologia Dimensional':                            { 'pt-BR':'Metrologia Dimensional', 'en':'Dimensional Metrology', 'de':'Dimensionelle Messtechnik' },
    'Qualidade e Calibração':                            { 'pt-BR':'Qualidade e Calibração', 'en':'Quality and Calibration', 'de':'Qualität und Kalibrierung' },

    // ── Tipos de evento ──
    'Geral':                                             { 'pt-BR':'Geral', 'en':'General', 'de':'Allgemein' },
    'Parceria com a Zeiss':                              { 'pt-BR':'Parceria com a Zeiss', 'en':'Partnership with Zeiss', 'de':'Partnerschaft mit Zeiss' },

    // ── Categorias de almoxarifado ──
    'EPI':                                               { 'pt-BR':'EPI', 'en':'PPE', 'de':'PSA' },

    // ── Tags do Kanban (minúsculas, como gravadas) ──
    'almoxarifado':                                      { 'pt-BR':'almoxarifado', 'en':'storeroom', 'de':'Lager' },
    'calibração':                                        { 'pt-BR':'calibração', 'en':'calibration', 'de':'Kalibrierung' },
    'documentação':                                      { 'pt-BR':'documentação', 'en':'documentation', 'de':'Dokumentation' },
    'inspeção':                                          { 'pt-BR':'inspeção', 'en':'inspection', 'de':'Prüfung' },
    'laboratório':                                       { 'pt-BR':'laboratório', 'en':'laboratory', 'de':'Labor' },
    'organização':                                       { 'pt-BR':'organização', 'en':'organization', 'de':'Organisation' },
    'treinamento':                                       { 'pt-BR':'treinamento', 'en':'training', 'de':'Schulung' },
    'urgente':                                           { 'pt-BR':'urgente', 'en':'urgent', 'de':'dringend' },

    // ── Vínculos de avaliação ──
    'Colaborador':                                       { 'pt-BR':'Colaborador', 'en':'Employee', 'de':'Mitarbeiter' },
    'Parceiro':                                          { 'pt-BR':'Parceiro', 'en':'Partner', 'de':'Partner' },
    'Visitante':                                         { 'pt-BR':'Visitante', 'en':'Visitor', 'de':'Besucher' },

    // ── Status de serviço (funil comercial) ──
    '1º Contato':                                        { 'pt-BR':'1º Contato', 'en':'1st Contact', 'de':'Erstkontakt' },
    'Visita':                                            { 'pt-BR':'Visita', 'en':'Visit', 'de':'Besuch' },

    // ── Status / classificação de amostra ──
    'Aceito':                                            { 'pt-BR':'Aceito', 'en':'Accepted', 'de':'Angenommen' },
    'Aceito normalmente':                                { 'pt-BR':'Aceito normalmente', 'en':'Accepted normally', 'de':'Regulär angenommen' },
    'Aceito com ressalva':                               { 'pt-BR':'Aceito com ressalva', 'en':'Accepted with reservation', 'de':'Mit Vorbehalt angenommen' },
    'Aguardando decisão':                                { 'pt-BR':'Aguardando decisão', 'en':'Awaiting decision', 'de':'Entscheidung ausstehend' },
    'Recusado':                                          { 'pt-BR':'Recusado', 'en':'Rejected', 'de':'Abgelehnt' },
    'Devolver ao cliente':                               { 'pt-BR':'Devolver ao cliente', 'en':'Return to customer', 'de':'An Kunden zurücksenden' },
    'Retirada pelo cliente':                             { 'pt-BR':'Retirada pelo cliente', 'en':'Picked up by customer', 'de':'Vom Kunden abgeholt' },
    'Dano de transporte':                                { 'pt-BR':'Dano de transporte', 'en':'Transport damage', 'de':'Transportschaden' },
    'Documentação ausente':                              { 'pt-BR':'Documentação ausente', 'en':'Missing documentation', 'de':'Fehlende Dokumentation' },
    'Embalagem danificada':                              { 'pt-BR':'Embalagem danificada', 'en':'Damaged packaging', 'de':'Beschädigte Verpackung' },
    'Peça errada':                                       { 'pt-BR':'Peça errada', 'en':'Wrong part', 'de':'Falsches Bauteil' },
    'Quantidade incorreta':                              { 'pt-BR':'Quantidade incorreta', 'en':'Incorrect quantity', 'de':'Falsche Menge' },
    'N/A':                                               { 'pt-BR':'N/A', 'en':'N/A', 'de':'k. A.' },
    'SIM':                                               { 'pt-BR':'SIM', 'en':'YES', 'de':'JA' },
    'NÃO':                                               { 'pt-BR':'NÃO', 'en':'NO', 'de':'NEIN' },

    // ── Mensagens de erro e feedback ──
    'Erro ao carregar amostra.':                         { 'pt-BR':'Erro ao carregar amostra.', 'en':'Error loading sample.', 'de':'Fehler beim Laden der Probe.' },
    'Erro ao salvar amostra.':                           { 'pt-BR':'Erro ao salvar amostra.', 'en':'Error saving sample.', 'de':'Fehler beim Speichern der Probe.' },
    'Erro ao excluir amostra.':                          { 'pt-BR':'Erro ao excluir amostra.', 'en':'Error deleting sample.', 'de':'Fehler beim Löschen der Probe.' },
    'Erro ao registrar devolução.':                      { 'pt-BR':'Erro ao registrar devolução.', 'en':'Error recording return.', 'de':'Fehler beim Erfassen der Rückgabe.' },
    'Erro ao carregar histórico':                        { 'pt-BR':'Erro ao carregar histórico', 'en':'Error loading history', 'de':'Fehler beim Laden des Verlaufs' },
    'Erro ao salvar item.':                              { 'pt-BR':'Erro ao salvar item.', 'en':'Error saving item.', 'de':'Fehler beim Speichern des Artikels.' },
    'Erro ao excluir item.':                             { 'pt-BR':'Erro ao excluir item.', 'en':'Error deleting item.', 'de':'Fehler beim Löschen des Artikels.' },
    'Erro ao registrar movimentação.':                   { 'pt-BR':'Erro ao registrar movimentação.', 'en':'Error recording stock movement.', 'de':'Fehler beim Erfassen der Buchung.' },
    'Erro ao carregar usuários.':                        { 'pt-BR':'Erro ao carregar usuários.', 'en':'Error loading users.', 'de':'Fehler beim Laden der Benutzer.' },
    'Erro ao salvar usuário.':                           { 'pt-BR':'Erro ao salvar usuário.', 'en':'Error saving user.', 'de':'Fehler beim Speichern des Benutzers.' },
    'Erro ao excluir usuário.':                          { 'pt-BR':'Erro ao excluir usuário.', 'en':'Error deleting user.', 'de':'Fehler beim Löschen des Benutzers.' },
    'Erro ao remover documento.':                        { 'pt-BR':'Erro ao remover documento.', 'en':'Error removing document.', 'de':'Fehler beim Entfernen des Dokuments.' },
    'Erro ao registrar verificação. Tente novamente.':   { 'pt-BR':'Erro ao registrar verificação. Tente novamente.', 'en':'Error recording check. Please try again.', 'de':'Fehler beim Erfassen der Prüfung. Bitte erneut versuchen.' },
    'Documento anexado com sucesso!':                    { 'pt-BR':'Documento anexado com sucesso!', 'en':'Document attached successfully!', 'de':'Dokument erfolgreich angehängt!' },
    'Nenhum documento anexado a esta máquina.':          { 'pt-BR':'Nenhum documento anexado a esta máquina.', 'en':'No documents attached to this machine.', 'de':'Keine Dokumente an dieser Maschine angehängt.' },
    'Nenhuma não conformidade observada.':               { 'pt-BR':'Nenhuma não conformidade observada.', 'en':'No nonconformities observed.', 'de':'Keine Abweichungen festgestellt.' },
    'Você não tem permissão para editar esse usuário.':  { 'pt-BR':'Você não tem permissão para editar esse usuário.', 'en':'You do not have permission to edit this user.', 'de':'Sie haben keine Berechtigung, diesen Benutzer zu bearbeiten.' },
    'Você não tem permissão para excluir esse usuário.': { 'pt-BR':'Você não tem permissão para excluir esse usuário.', 'en':'You do not have permission to delete this user.', 'de':'Sie haben keine Berechtigung, diesen Benutzer zu löschen.' },
    'Página':                                            { 'pt-BR':'Página', 'en':'Page', 'de':'Seite' },
    'Mover para ':                                       { 'pt-BR':'Mover para ', 'en':'Move to ', 'de':'Verschieben nach ' },
    'edital(is) encontrado(s)':                          { 'pt-BR':'edital(is) encontrado(s)', 'en':'call(s) found', 'de':'Ausschreibung(en) gefunden' },
    'Selecione o scanner…':                              { 'pt-BR':'Selecione o scanner…', 'en':'Select the scanner…', 'de':'Scanner auswählen…' },

    // ── Clientes ──
    'Clientes':                        { 'pt-BR':'Clientes',                        'en':'Clients',                             'de':'Kunden'                                },
    'Novo Cliente':                    { 'pt-BR':'Novo Cliente',                    'en':'New Client',                          'de':'Neuer Kunde'                           },
    'Clientes cadastrados':            { 'pt-BR':'Clientes cadastrados',            'en':'Registered clients',                  'de':'Registrierte Kunden'                   },
    'Receita por Cliente':             { 'pt-BR':'Receita por Cliente',             'en':'Revenue by Client',                   'de':'Umsatz nach Kunde'                     },
    'Receita (mês)':                   { 'pt-BR':'Receita (mês)',                   'en':'Revenue (month)',                     'de':'Umsatz (Monat)'                        },
    'Receita (ano)':                   { 'pt-BR':'Receita (ano)',                   'en':'Revenue (year)',                      'de':'Umsatz (Jahr)'                         },
    'OS (mês)':                        { 'pt-BR':'OS (mês)',                        'en':'Orders (month)',                      'de':'Aufträge (Monat)'                      },
    'OS (ano)':                        { 'pt-BR':'OS (ano)',                        'en':'Orders (year)',                       'de':'Aufträge (Jahr)'                       },
    'Nenhum cliente cadastrado ainda.':{ 'pt-BR':'Nenhum cliente cadastrado ainda.','en':'No clients registered yet.',          'de':'Noch keine Kunden registriert.'        },
    'Nenhum dado de receita ainda.':   { 'pt-BR':'Nenhum dado de receita ainda.',   'en':'No revenue data yet.',                'de':'Noch keine Umsatzdaten.'               },
    'Erro ao carregar clientes.':      { 'pt-BR':'Erro ao carregar clientes.',      'en':'Error loading clients.',              'de':'Fehler beim Laden der Kunden.'         },
    'Erro ao carregar o ranking.':     { 'pt-BR':'Erro ao carregar o ranking.',     'en':'Error loading the ranking.',          'de':'Fehler beim Laden der Rangliste.'      },
    'Cliente salvo.':                  { 'pt-BR':'Cliente salvo.',                  'en':'Client saved.',                       'de':'Kunde gespeichert.'                    },
    'Cliente excluído.':               { 'pt-BR':'Cliente excluído.',               'en':'Client deleted.',                     'de':'Kunde gelöscht.'                       },
    'Tem certeza que deseja excluir este cliente?': { 'pt-BR':'Tem certeza que deseja excluir este cliente?', 'en':'Are you sure you want to delete this client?', 'de':'Möchten Sie diesen Kunden wirklich löschen?' },
    'Não foi possível excluir este cliente.': { 'pt-BR':'Não foi possível excluir este cliente.', 'en':'This client could not be deleted.', 'de':'Dieser Kunde konnte nicht gelöscht werden.' },
    'Não foi possível salvar este cliente.':  { 'pt-BR':'Não foi possível salvar este cliente.',  'en':'This client could not be saved.',   'de':'Dieser Kunde konnte nicht gespeichert werden.' },
  };

  /* ═══════════════════════════════════════════════════════════════════
     MOTOR
  ═══════════════════════════════════════════════════════════════════ */

  // Mapa reverso: qualquer texto (qualquer idioma) → chave pt-BR
  const REVERSE = {};
  for (const [key, vals] of Object.entries(T)) {
    for (const txt of Object.values(vals)) {
      if (txt && !REVERSE[txt]) REVERSE[txt] = key;
    }
  }

  let currentLang = localStorage.getItem('zeiss_lang') || DEFAULT;

  function t(key, lang) {
    const entry = T[key];
    if (!entry) return key;
    return entry[lang || currentLang] || entry[DEFAULT] || key;
  }

  function tAny(text, lang) {
    if (!text) return null;
    const key = REVERSE[text.trim()];
    if (!key) return null;
    // Não comparar tr com key aqui: como toda chave do dicionário É o texto
    // pt-BR, t(key, 'pt-BR') quase sempre é idêntico a key — um "tr !== key"
    // fazia essa função devolver null sempre que o idioma de destino fosse
    // pt-BR, mesmo quando o texto atual na tela estava em outro idioma e
    // precisava mudar. Quem chama já decide se precisa atualizar o DOM
    // comparando com o texto atual (não com a chave) — ver walkTextNodes.
    return t(key, lang || currentLang);
  }

  // ── Text-node walker ─────────────────────────────────────────────
  const SKIP_TAGS = new Set([
    'SCRIPT','STYLE','PATH','CIRCLE','LINE','POLYLINE',
    'RECT','POLYGON','ELLIPSE','DEFS','CODE','PRE','OPTION',
  ]);

  function walkTextNodes(root, lang) {
    const iter = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        let p = node.parentElement;
        while (p && p !== root) {
          if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
          p = p.parentElement;
        }
        return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      },
    });
    let node;
    while ((node = iter.nextNode())) {
      const raw = node.textContent;
      const trimmed = raw.trim();
      const tr = tAny(trimmed, lang);
      if (tr && tr !== trimmed) {
        node.textContent = raw.replace(trimmed, tr);
      }
    }
  }

  // ── <option> elements (select) ───────────────────────────────────
  function walkOptions(lang) {
    document.querySelectorAll('option').forEach(opt => {
      const txt = opt.textContent.trim();
      if (!txt) return;
      const tr = tAny(txt, lang);
      if (tr) opt.textContent = tr;
    });
  }

  // ── Atributos ────────────────────────────────────────────────────
  function walkAttributes(lang) {
    document.querySelectorAll('[placeholder]').forEach(el => {
      const tr = tAny(el.getAttribute('placeholder'), lang);
      if (tr) el.setAttribute('placeholder', tr);
    });
    document.querySelectorAll('[title]:not(link)').forEach(el => {
      const tr = tAny(el.getAttribute('title'), lang);
      if (tr) el.setAttribute('title', tr);
    });
    document.querySelectorAll('[aria-label]').forEach(el => {
      const tr = tAny(el.getAttribute('aria-label'), lang);
      if (tr) el.setAttribute('aria-label', tr);
    });
  }

  // ── data-i18n explícito ──────────────────────────────────────────
  function applyDataI18n(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key  = el.dataset.i18n;
      const attr = el.dataset.i18nAttr;
      const val  = t(key, lang) !== key ? t(key, lang) : (tAny(key, lang) || key);
      if (attr) {
        el.setAttribute(attr, val);
      } else {
        const svg = el.querySelector('svg');
        if (svg) {
          el.childNodes.forEach(n => {
            if (n.nodeType === Node.TEXT_NODE && n.textContent.trim())
              n.textContent = n.textContent.replace(n.textContent.trim(), val);
          });
        } else {
          el.textContent = val;
        }
      }
    });
  }

  /** Aplica idioma a toda a página */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('zeiss_lang', lang);
    document.documentElement.lang = lang;
    applyDataI18n(lang);
    walkTextNodes(document.body, lang);
    walkOptions(lang);
    walkAttributes(lang);
    _updateSwitcherUI(lang);
    // Notify all modules so they can re-render dynamic content
    document.dispatchEvent(new CustomEvent('zeiss:langchange', { detail: { lang } }));
  }

  /* ═══════════════════════════════════════════════════════════════════
     SWITCHER — badges coloridos (sem emojis de bandeira)
  ═══════════════════════════════════════════════════════════════════ */
  const LANG_META = {
    // #16A34A dava só 3.3:1 com o texto branco por cima; #15803D sobe para 5:1.
    'pt-BR': { short:'PT', full:'Português (BR)', color:'#15803D' },
    'en':    { short:'EN', full:'English',         color:'#1D4ED8' },
    'de':    { short:'DE', full:'Deutsch',          color:'#DC2626' },
  };

  function _badge(lang) {
    const m = LANG_META[lang];
    return `<span style="width:22px;height:22px;border-radius:50%;background:${m.color};
      color:#fff;font-size:10px;font-weight:800;display:inline-flex;align-items:center;
      justify-content:center;flex-shrink:0">${m.short}</span>`;
  }

  function _updateSwitcherUI(lang) {
    const lbl = document.getElementById('_langBtnLabel');
    if (lbl) lbl.innerHTML = _badge(lang);
    document.querySelectorAll('._lang-opt').forEach(opt => {
      const active = opt.dataset.lang === lang;
      opt.style.background = active ? 'var(--bg-hover,rgba(0,0,0,.06))' : '';
      const chk = opt.querySelector('._lang-chk');
      if (chk) chk.style.display = active ? 'inline-flex' : 'none';
    });
  }

  function _injectSwitcher() {
    // Telas autenticadas têm topbar; o login não tem, e por isso usa uma
    // âncora própria (#_langMount) — senão não haveria como trocar de idioma
    // antes de entrar no sistema.
    const topbarRight = document.querySelector('.topbar__right') || document.getElementById('_langMount');
    if (!topbarRight || document.getElementById('_langSwitcher')) return;

    const globeIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
    </svg>`;

    const checkIcon = `<svg class="_lang-chk" width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      style="display:none;margin-left:auto;color:var(--color-primary,#2563eb)">
      <polyline points="20 6 9 17 4 12"/>
    </svg>`;

    const opts = LANGS.map(l => `
      <button class="_lang-opt" data-lang="${l}"
        style="display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;
               background:none;border:none;border-radius:8px;cursor:pointer;
               font-size:13px;color:var(--text-primary,#111);text-align:left;transition:background .12s">
        ${_badge(l)}
        <span style="font-weight:700;min-width:26px;font-size:12px">${LANG_META[l].short}</span>
        <span style="color:var(--text-muted,#666);font-size:12px">${LANG_META[l].full}</span>
        ${checkIcon}
      </button>`).join('');

    const wrap = document.createElement('div');
    wrap.id = '_langSwitcher';
    wrap.style.cssText = 'position:relative;display:inline-flex;align-items:center';
    wrap.innerHTML = `
      <button class="topbar__icon-btn" id="_langBtn"
        title="Language / Idioma / Sprache"
        style="display:flex;align-items:center;gap:5px;padding:0 10px;height:36px"
        aria-haspopup="true" aria-expanded="false">
        ${globeIcon}
        <span id="_langBtnLabel" style="display:inline-flex;align-items:center"></span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.6;margin-left:1px">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>`;

    // Dropdown fixo ao viewport — fundo sólido, nunca sobrepõe conteúdo
    const dropdown = document.createElement('div');
    dropdown.id = '_langDropdown';
    dropdown.style.cssText = [
      'display:none',
      'position:fixed',
      'background:var(--bg-surface,#ffffff)',
      'border:1.5px solid var(--border-color,#e0e0e0)',
      'border-radius:12px',
      'box-shadow:0 12px 40px rgba(0,0,0,.18),0 2px 8px rgba(0,0,0,.08)',
      'overflow:hidden',
      'min-width:210px',
      'z-index:99999',
    ].join(';');
    dropdown.innerHTML = `
      <div style="padding:10px 14px 9px;border-bottom:1px solid var(--border-color,#e0e0e0);
                  display:flex;align-items:center;gap:7px">
        ${globeIcon.replace('currentColor','var(--text-muted,#888)').replace('14px','13px').replace('14px','13px')}
        <span style="font-size:10px;font-weight:700;color:var(--text-muted,#888);
                     text-transform:uppercase;letter-spacing:.08em">Idioma / Language</span>
      </div>
      <div style="padding:6px">${opts}</div>`;
    document.body.appendChild(dropdown);

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      const div = document.createElement('div');
      div.className = 'topbar__divider';
      topbarRight.insertBefore(div, themeBtn);
      topbarRight.insertBefore(wrap, div);
    } else {
      topbarRight.prepend(wrap);
    }

    const btn = document.getElementById('_langBtn');
    function position() {
      const r = btn.getBoundingClientRect();
      dropdown.style.top   = (r.bottom + 6) + 'px';
      dropdown.style.right = (window.innerWidth - r.right) + 'px';
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const open = dropdown.style.display !== 'none';
      if (!open) { position(); dropdown.style.display = 'block'; }
      else        { dropdown.style.display = 'none'; }
      btn.setAttribute('aria-expanded', String(!open));
    });

    dropdown.querySelectorAll('._lang-opt').forEach(opt => {
      opt.addEventListener('mouseover', () => {
        if (opt.dataset.lang !== currentLang) opt.style.background = 'var(--bg-hover,rgba(0,0,0,.05))';
      });
      opt.addEventListener('mouseout', () => {
        opt.style.background = opt.dataset.lang === currentLang ? 'var(--bg-hover,rgba(0,0,0,.06))' : '';
      });
      opt.addEventListener('click', () => {
        applyLang(opt.dataset.lang);
        dropdown.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!wrap.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    window.addEventListener('resize', () => { if (dropdown.style.display !== 'none') position(); });
  }

  /* ═══════════════════════════════════════════════════════════════════
     MUTATION OBSERVER — traduz conteúdo dinâmico de qualquer módulo
     Disparado quando JS adiciona nós ao DOM (tabelas, modais, etc.)
  ═══════════════════════════════════════════════════════════════════ */
  let _mutTimer = null;

  const _observer = new MutationObserver(mutations => {
    if (currentLang === DEFAULT) return; // pt-BR: nada a fazer
    // Filtra mutações irrelevantes (só processa addedNodes com conteúdo)
    const hasNew = mutations.some(m => m.addedNodes.length > 0);
    if (!hasNew) return;
    clearTimeout(_mutTimer);
    _mutTimer = setTimeout(() => {
      // Re-aplica apenas walkers leves — sem re-injetar o switcher
      applyDataI18n(currentLang);
      walkTextNodes(document.body, currentLang);
      walkOptions(currentLang);
      walkAttributes(currentLang);
    }, 60);
  });

  /* ═══════════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    _injectSwitcher();
    _updateSwitcherUI(currentLang);
    if (currentLang !== DEFAULT) applyLang(currentLang);

    // Observa toda adição de nós ao body (renderizações de módulos JS)
    _observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false, // texto direto não re-dispara loop
    });
  });

  window.I18n = { t, tAny, applyLang, lang: () => currentLang };

})();
