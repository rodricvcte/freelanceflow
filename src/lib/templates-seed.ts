// Static seed data for system proposal templates.
// Used by: /api/admin/seed-templates (DB insert) and /modelos page (card display).

type TextSection = {
  id: string; type: 'text'; title: string; content: string
}
type ContemplasSection = {
  id: string; type: 'contempla'; title: string; items: string[]
}
type TimelineSection = {
  id: string; type: 'timeline'; title: string
  items: Array<{ title: string; description: string }>
}
type CustomTableSection = {
  id: string; type: 'custom_table'; title: string
  columns: string[]; rows: string[][]
}

type TemplateSection = TextSection | ContemplasSection | TimelineSection | CustomTableSection

export type TemplateSeed = {
  template_nicho: string
  template_icon:  string
  title:          string
  status:         string
  is_template:    true
  user_id:        null
  version:        number
  sections:       TemplateSection[]
  /** Preview bullets shown on the /modelos cards — NOT stored in DB */
  preview_bullets: string[]
}

export const TEMPLATES: TemplateSeed[] = [
  {
    template_nicho:  'Gestor de Tráfego Pago',
    template_icon:   '📊',
    title:           'Gestão de Tráfego Pago — [Nome do Cliente]',
    status:          'rascunho',
    is_template:     true,
    user_id:         null,
    version:         1,
    preview_bullets: [
      'Gestão de Meta Ads e Google Ads',
      'Relatório mensal de resultados',
      'Otimização contínua das campanhas',
    ],
    sections: [
      {
        id: 'gt-s1', type: 'text', title: 'Apresentação',
        content: 'Olá! Segue abaixo a proposta para gestão estratégica dos seus anúncios pagos com foco em geração de leads qualificados e redução do custo por aquisição.',
      },
      {
        id: 'gt-s2', type: 'contempla', title: 'O que está incluso',
        items: [
          'Configuração e auditoria das campanhas',
          'Gestão de Meta Ads (Facebook e Instagram)',
          'Gestão de Google Ads',
          'Criação e teste de públicos',
          'Relatório mensal de resultados',
          'Reunião mensal de alinhamento',
          'Otimização contínua das campanhas',
          'Suporte via WhatsApp em horário comercial',
        ],
      },
      {
        id: 'gt-s3', type: 'timeline', title: 'Cronograma',
        items: [
          { title: 'Semana 1',        description: 'Onboarding e auditoria das campanhas atuais' },
          { title: 'Semana 2',        description: 'Reestruturação e lançamento das campanhas' },
          { title: 'Semana 3 e 4',    description: 'Otimização com base nos primeiros dados' },
          { title: 'Mês 2 em diante', description: 'Gestão contínua com relatórios mensais' },
        ],
      },
      {
        id: 'gt-s4', type: 'text', title: 'Condições',
        content: 'Contrato mínimo de 3 meses. Pagamento mensal antecipado. Verba de mídia não inclusa.',
      },
    ],
  },
  {
    template_nicho:  'Designer Freelancer',
    template_icon:   '🎨',
    title:           'Identidade Visual — [Nome do Cliente]',
    status:          'rascunho',
    is_template:     true,
    user_id:         null,
    version:         1,
    preview_bullets: [
      'Logotipo em variações completas',
      'Manual de marca (brandbook simplificado)',
      'Arquivos em AI, PDF e PNG',
    ],
    sections: [
      {
        id: 'df-s1', type: 'text', title: 'Apresentação',
        content: 'Segue proposta para criação da identidade visual completa da sua marca, com foco em transmitir profissionalismo e atrair o público certo.',
      },
      {
        id: 'df-s2', type: 'contempla', title: 'O que está incluso',
        items: [
          'Logotipo em variações (principal, reduzida, monocromática)',
          'Paleta de cores oficial',
          'Tipografia da marca',
          'Manual de marca (brandbook simplificado)',
          'Cartão de visita (arte final)',
          'Assinatura de e-mail',
          'Arquivos em AI, PDF e PNG',
        ],
      },
      {
        id: 'df-s3', type: 'timeline', title: 'Cronograma',
        items: [
          { title: 'Dias 1–3',  description: 'Briefing e pesquisa de referências' },
          { title: 'Dias 4–7',  description: 'Apresentação de 2 conceitos' },
          { title: 'Dias 8–10', description: 'Refinamento do conceito escolhido' },
          { title: 'Dias 11–14', description: 'Entrega final e arquivos' },
        ],
      },
      {
        id: 'df-s4', type: 'text', title: 'Condições',
        content: 'Inclui até 2 rodadas de ajustes. Pagamento: 50% na aprovação, 50% na entrega. Prazo a combinar após briefing.',
      },
    ],
  },
  {
    template_nicho:  'Dev Freelancer',
    template_icon:   '💻',
    title:           'Desenvolvimento de Site/Sistema — [Nome do Cliente]',
    status:          'rascunho',
    is_template:     true,
    user_id:         null,
    version:         1,
    preview_bullets: [
      'Design de telas + desenvolvimento completo',
      'Deploy e configuração de hospedagem',
      'Suporte pós-entrega por 30 dias',
    ],
    sections: [
      {
        id: 'dev-s1', type: 'text', title: 'Apresentação',
        content: 'Proposta para desenvolvimento do projeto conforme briefing alinhado. Entrega com código limpo, documentado e hospedagem configurada.',
      },
      {
        id: 'dev-s2', type: 'contempla', title: 'O que está incluso',
        items: [
          'Levantamento de requisitos',
          'Design das telas (UI)',
          'Desenvolvimento front-end',
          'Desenvolvimento back-end',
          'Integração com APIs necessárias',
          'Testes e ajustes',
          'Deploy e configuração de hospedagem',
          'Suporte pós-entrega por 30 dias',
        ],
      },
      {
        id: 'dev-s3', type: 'custom_table', title: 'Escopo do Projeto',
        columns: ['Página/Módulo', 'Descrição', 'Status'],
        rows: [['', '', ''], ['', '', ''], ['', '', '']],
      },
      {
        id: 'dev-s4', type: 'timeline', title: 'Cronograma',
        items: [
          { title: 'Semana 1',    description: 'Levantamento de requisitos e wireframes' },
          { title: 'Semanas 2–3', description: 'Desenvolvimento' },
          { title: 'Semana 4',    description: 'Testes, ajustes e deploy' },
        ],
      },
      {
        id: 'dev-s5', type: 'text', title: 'Condições',
        content: 'Pagamento: 50% no início, 50% na entrega. Alterações fora do escopo serão orçadas separadamente.',
      },
    ],
  },
  {
    template_nicho:  'Social Media',
    template_icon:   '📱',
    title:           'Gestão de Redes Sociais — [Nome do Cliente]',
    status:          'rascunho',
    is_template:     true,
    user_id:         null,
    version:         1,
    preview_bullets: [
      'Planejamento e design de conteúdo mensal',
      'Agendamento e publicação',
      'Relatório mensal de métricas',
    ],
    sections: [
      {
        id: 'sm-s1', type: 'text', title: 'Apresentação',
        content: 'Proposta para gestão estratégica e criação de conteúdo para as redes sociais, com foco em crescimento de audiência e geração de engajamento real.',
      },
      {
        id: 'sm-s2', type: 'contempla', title: 'O que está incluso',
        items: [
          'Planejamento mensal de conteúdo',
          'X posts por semana (feed)',
          'X stories por semana',
          'Design de todos os posts',
          'Legendas e hashtags otimizadas',
          'Agendamento das publicações',
          'Relatório mensal de métricas',
          'Resposta a comentários e DMs',
        ],
      },
      {
        id: 'sm-s3', type: 'timeline', title: 'Cronograma',
        items: [
          { title: 'Semana 1',          description: 'Briefing, análise de perfil e planejamento' },
          { title: 'Semana 2',          description: 'Criação do calendário editorial do primeiro mês' },
          { title: 'Semana 3 em diante', description: 'Publicação e gestão contínua' },
        ],
      },
      {
        id: 'sm-s4', type: 'text', title: 'Condições',
        content: 'Contrato mínimo de 3 meses. Pagamento mensal antecipado. Impulsionamentos não inclusos.',
      },
    ],
  },
  {
    template_nicho:  'Copywriter',
    template_icon:   '✍️',
    title:           'Copy e Conteúdo Estratégico — [Nome do Cliente]',
    status:          'rascunho',
    is_template:     true,
    user_id:         null,
    version:         1,
    preview_bullets: [
      'Copy da página de vendas + sequência de e-mails',
      'Copy para anúncios (Meta e Google)',
      '2 rodadas de revisão incluídas',
    ],
    sections: [
      {
        id: 'cw-s1', type: 'text', title: 'Apresentação',
        content: 'Proposta para criação de copy estratégico com foco em conversão, autoridade e conexão com o público-alvo.',
      },
      {
        id: 'cw-s2', type: 'contempla', title: 'O que está incluso',
        items: [
          'Briefing estratégico da marca/produto',
          'Pesquisa de público e concorrência',
          'Copy da página de vendas (VSL ou carta)',
          'Sequência de e-mails (até 7 e-mails)',
          'Copy para anúncios (Meta e Google)',
          '2 rodadas de revisão incluídas',
        ],
      },
      {
        id: 'cw-s3', type: 'timeline', title: 'Cronograma',
        items: [
          { title: 'Dias 1–2',  description: 'Briefing e pesquisa' },
          { title: 'Dias 3–5',  description: 'Criação do copy principal' },
          { title: 'Dias 6–7',  description: 'E-mails e anúncios' },
          { title: 'Dias 8–10', description: 'Revisões e entrega final' },
        ],
      },
      {
        id: 'cw-s4', type: 'text', title: 'Condições',
        content: 'Pagamento: 50% no início, 50% na entrega. Prazo conta a partir do briefing aprovado.',
      },
    ],
  },
]
