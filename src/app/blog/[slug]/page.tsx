import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import NavHeader from '@/components/NavHeader'

const BASE = 'https://freelanceflow.com.br'

type Article = {
  slug: string
  title: string
  description: string
  date: string
  content: React.ReactNode
}

const articles: Article[] = [
  {
    slug: 'como-fazer-proposta-comercial-freelancer',
    title: 'Como Fazer Proposta Comercial para Freelancer (Guia Completo 2026)',
    description:
      'Aprenda como fazer uma proposta comercial para freelancer que convence o cliente a fechar. Estrutura completa, exemplos práticos e erros a evitar.',
    date: '28 de junho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Como fazer uma proposta comercial para freelancer que o cliente aceita</h1>

        <p>
          Saber <strong>como fazer uma proposta comercial para freelancer</strong> é uma das habilidades
          mais importantes para quem vive de trabalho autônomo. Não importa se você é designer, desenvolvedor,
          redator ou gestor de tráfego — a proposta comercial é o documento que transforma uma conversa em
          projeto fechado. E a maioria dos freelancers ainda erra feio nisso.
        </p>

        <p>
          Uma proposta comercial mal estruturada gera dúvidas, abre espaço para negociação de preço e faz o
          cliente sumir sem dar retorno. Uma boa proposta, por outro lado, demonstra profissionalismo, antecipa
          objeções e conduz o cliente ao aceite de forma natural.
        </p>

        <h2>O que é uma proposta comercial para freelancer</h2>

        <p>
          A proposta comercial para freelancer é um documento formal que apresenta ao cliente o escopo do
          trabalho, os valores cobrados, os prazos estimados e as condições de contratação. Ela vai muito além
          de um simples orçamento — é uma ferramenta de venda e de proteção jurídica ao mesmo tempo.
        </p>

        <p>
          Diferente de uma cotação informal enviada pelo WhatsApp, a proposta comercial organiza as informações
          de forma que o cliente entende exatamente o que está contratando. Isso reduz conflitos depois do
          projeto iniciado e aumenta a taxa de conversão no momento do fechamento.
        </p>

        <h2>O que não pode faltar na proposta comercial para freelancer</h2>

        <p>
          Antes de aprender como fazer, você precisa saber o que incluir. Uma proposta comercial para freelancer
          completa deve conter:
        </p>

        <ul>
          <li><strong>Apresentação profissional</strong> — quem você é, sua especialidade e por que é a escolha certa para aquele projeto.</li>
          <li><strong>Entendimento do problema</strong> — demonstre que você leu o briefing e entendeu o que o cliente precisa. Esse item sozinho já diferencia você de 90% dos concorrentes.</li>
          <li><strong>Escopo detalhado</strong> — liste o que está e o que não está incluso. O que não está escrito não existe.</li>
          <li><strong>Entregáveis</strong> — quais arquivos, telas, páginas ou conteúdos serão entregues ao final.</li>
          <li><strong>Prazo estimado</strong> — com marcos intermediários quando o projeto for longo.</li>
          <li><strong>Investimento</strong> — valor total ou por etapa, forma de pagamento e política de reajuste.</li>
          <li><strong>Validade da proposta</strong> — deixe claro até quando aquele preço e condições são válidos.</li>
          <li><strong>Próximos passos</strong> — o que o cliente precisa fazer para contratar.</li>
        </ul>

        <h2>Como fazer uma proposta comercial para freelancer em 5 passos</h2>

        <p>
          Agora que você sabe o que incluir, veja o passo a passo para montar sua proposta comercial do zero:
        </p>

        <ol>
          <li>
            <strong>Faça uma reunião ou troca de mensagens antes.</strong> Não envie proposta para quem não
            te deu um briefing mínimo. Quanto mais você entender o projeto, mais personalizada e convincente
            será sua proposta.
          </li>
          <li>
            <strong>Use um modelo de proposta com identidade visual.</strong> Propostas com logo, cores da
            sua marca e layout limpo passam muito mais credibilidade do que um PDF gerado no Word sem formatação.
          </li>
          <li>
            <strong>Comece pelo problema do cliente, não pelo seu serviço.</strong> O primeiro parágrafo deve
            mostrar que você entendeu a dor do cliente. Só então apresente a solução.
          </li>
          <li>
            <strong>Seja específico no escopo.</strong> Evite termos vagos como "criação de conteúdo" ou
            "suporte técnico". Defina quantidade, formato, canais e limites de revisão.
          </li>
          <li>
            <strong>Facilite o aceite.</strong> Inclua um botão ou link para o cliente aprovar com um clique.
            Quanto mais atrito no processo de aceite, menor a taxa de conversão.
          </li>
        </ol>

        <h2>Erros comuns que freelancers cometem na proposta comercial</h2>

        <p>
          Conhecer os erros é tão importante quanto saber como fazer a proposta comercial para freelancer corretamente:
        </p>

        <ul>
          <li><strong>Enviar por WhatsApp em formato de texto corrido.</strong> Isso passa falta de profissionalismo e dificulta o cliente de ter um documento de referência.</li>
          <li><strong>Não colocar validade.</strong> Proposta sem prazo de validade pode ser aceita meses depois, com custos e contexto completamente diferentes.</li>
          <li><strong>Não detalhar o que está fora do escopo.</strong> "Revisões ilimitadas" é um convite para projetos que nunca terminam.</li>
          <li><strong>Não fazer follow-up.</strong> Menos de 30% dos clientes respondem na primeira vez. O retorno faz parte do processo de venda.</li>
          <li><strong>Copiar e colar da proposta anterior sem personalizar.</strong> O cliente percebe quando a proposta é genérica. Personalize pelo menos o problema e o escopo.</li>
        </ul>

        <h2>Como enviar sua proposta comercial e acompanhar o retorno</h2>

        <p>
          Criar a proposta é metade do trabalho. Enviar da forma certa e acompanhar a reação do cliente é o
          que realmente fecha o negócio. Hoje já existem ferramentas que permitem enviar a proposta por link —
          sem precisar baixar PDF — e receber notificação quando o cliente abrir o documento.
        </p>

        <p>
          Saber o momento exato em que o cliente visualizou a proposta muda completamente a abordagem do
          follow-up. Em vez de mandar mensagem no escuro, você entra em contato quando o interesse está
          no pico — logo depois da primeira leitura.
        </p>

        <p>
          O FreelanceFlow foi criado exatamente para isso: você monta sua proposta comercial com editor por
          seções, envia por link ou WhatsApp, recebe notificação de abertura e o cliente aprova com um clique —
          sem criar conta. O aceite gera automaticamente um Certificado em PDF com validade jurídica.
        </p>
      </article>
    ),
  },
  {
    slug: 'follow-up-proposta-comercial',
    title: 'Follow-up de Proposta Comercial: Como Fazer sem Ser Inconveniente',
    description:
      'Guia completo sobre follow-up de proposta comercial. Saiba quando cobrar resposta, como escrever a mensagem certa e como automatizar o processo.',
    date: '28 de junho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Follow-up de proposta comercial: o guia para freelancers</h1>

        <p>
          Você enviou a <strong>proposta comercial</strong> e o cliente sumiu. Isso acontece com praticamente
          todo freelancer — e a diferença entre os que fecham mais projetos e os que ficam esperando está
          justamente no <strong>follow-up de proposta comercial</strong>. Saber cobrar resposta sem parecer
          inconveniente é uma habilidade de venda tão importante quanto montar uma boa proposta.
        </p>

        <p>
          A maioria das propostas que fica sem resposta não foi rejeitada — o cliente simplesmente ficou
          ocupado, esqueceu de responder ou está esperando uma segunda mensagem para se sentir à vontade
          para dizer sim. O follow-up é esse empurrão.
        </p>

        <h2>Por que o follow-up de proposta comercial é essencial para freelancers</h2>

        <p>
          Estudos de vendas B2B mostram que mais de 80% dos negócios são fechados após o quinto contato.
          No universo do freelancer, a realidade não é diferente. A maioria dos clientes não toma uma
          decisão imediata — especialmente quando o valor envolvido é significativo ou quando há outras
          prioridades do dia a dia competindo pela atenção.
        </p>

        <p>
          Sem o follow-up de proposta comercial, você está basicamente entregando seu esforço de vendas
          na metade do caminho. O pior cenário: o cliente foi comprar do concorrente que simplesmente deu
          o retorno que você não deu.
        </p>

        <p>
          Além disso, o follow-up bem feito demonstra interesse genuíno no projeto do cliente — o que
          diferencia o freelancer profissional do que apenas manda cotações e espera. Clientes percebem
          quem está comprometido antes mesmo de assinar.
        </p>

        <h2>Quando fazer o follow-up da proposta comercial</h2>

        <p>
          O timing do follow-up de proposta comercial importa tanto quanto o conteúdo da mensagem.
          Uma sequência recomendada:
        </p>

        <ul>
          <li>
            <strong>24–48h após o envio:</strong> mensagem curta confirmando o recebimento e se ficou
            alguma dúvida. Nada de pressão — só presença.
          </li>
          <li>
            <strong>3–5 dias após o envio (sem resposta):</strong> follow-up principal. Aqui você pode
            reforçar um ou dois pontos da proposta e perguntar diretamente se o cliente conseguiu
            avaliar.
          </li>
          <li>
            <strong>7–10 dias após o envio (ainda sem resposta):</strong> último contato nesse ciclo.
            Mencione a validade da proposta e deixe a porta aberta.
          </li>
        </ul>

        <p>
          Se você sabe exatamente quando o cliente abriu a proposta, pode ajustar esse timing. Um
          cliente que abriu três vezes nos últimos dois dias está claramente interessado — esse é o
          momento certo para o follow-up, não um dia pré-definido no calendário.
        </p>

        <h2>Como escrever a mensagem de follow-up de proposta comercial</h2>

        <p>
          A mensagem de follow-up de proposta comercial precisa ser curta, direta e sem pressão. Veja
          três modelos que funcionam:
        </p>

        <p><strong>Follow-up 1 — confirmação de recebimento (24h):</strong></p>
        <blockquote>
          <p>
            "Oi [nome], tudo bem? Passei para confirmar que enviei a proposta e ver se chegou certinho.
            Qualquer dúvida, me chame. Estou à disposição!"
          </p>
        </blockquote>

        <p><strong>Follow-up 2 — principal (3–5 dias):</strong></p>
        <blockquote>
          <p>
            "Oi [nome], passando para ver se conseguiu dar uma olhada na proposta que enviei.
            Se tiver alguma pergunta sobre o escopo ou valores, fico feliz em conversar.
            Me conta como estão as coisas aí?"
          </p>
        </blockquote>

        <p><strong>Follow-up 3 — fechamento do ciclo (7–10 dias):</strong></p>
        <blockquote>
          <p>
            "Oi [nome], só para deixar registrado: a proposta tem validade até [data]. Se fizer sentido
            avançar, é só me dar um sinal e a gente marca uma conversa rápida para alinhar os próximos
            passos. Se o projeto ficou para depois, tudo bem também — qualquer coisa, estarei por aqui!"
          </p>
        </blockquote>

        <h2>Como automatizar o follow-up de proposta comercial</h2>

        <p>
          Fazer o follow-up manualmente funciona quando você tem poucas propostas abertas. Quando o
          volume aumenta, fica impossível controlar quem abriu, quem não respondeu e qual é o próximo
          passo de cada negociação.
        </p>

        <p>
          A solução é usar uma ferramenta que rastreia a abertura da proposta e avisa automaticamente
          quando o cliente visualizou — e que também dispara lembretes automáticos de follow-up quando
          uma proposta fica sem resposta por mais de X dias.
        </p>

        <p>
          O FreelanceFlow faz exatamente isso: você envia a proposta, o sistema monitora a abertura e
          notifica você no momento certo. E se o cliente não abrir em alguns dias, o follow-up automático
          entra em ação — sem você precisar lembrar de mandar mensagem. Você foca em trabalhar enquanto
          o sistema cuida da parte chata do processo comercial.
        </p>
      </article>
    ),
  },
  {
    slug: 'modelo-proposta-comercial-criador-de-sites',
    title: 'Modelo de Proposta Comercial para Criador de Sites (Pronto para Usar)',
    description:
      'Modelo de proposta comercial para criador de sites com estrutura completa: escopo, entregáveis, precificação e cláusulas. Pronto para adaptar e enviar.',
    date: '28 de junho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Modelo de proposta comercial para criador de sites: estrutura completa</h1>

        <p>
          Usar um bom <strong>modelo de proposta comercial para criador de sites</strong> é o que separa
          o freelancer que perde tempo reescrevendo orçamento do zero do que fecha projetos de forma
          consistente e profissional. Neste artigo, você vai ver a estrutura completa, o que incluir em
          cada seção e como adaptar o modelo ao seu cliente sem partir do zero toda vez.
        </p>

        <p>
          Criar um site para um cliente envolve muito mais do que desenvolver telas — envolve briefing,
          levantamento de requisitos, definição de escopo, prazos e condições de pagamento. Tudo isso
          precisa estar na proposta antes do projeto começar, para evitar conflitos e retrabalho depois.
        </p>

        <h2>Por que o modelo de proposta comercial para criador de sites importa</h2>

        <p>
          Muitos criadores de sites ainda enviam orçamentos por WhatsApp em formato de texto ou por
          e-mail sem nenhuma formatação. Isso funciona para projetos simples e clientes que já te
          conhecem — mas afasta clientes novos que estão comparando você com outros profissionais.
        </p>

        <p>
          Uma proposta estruturada mostra que você é organizado, pensa nos detalhes e vai tocar o
          projeto com a mesma atenção que está mostrando na proposta. Para o cliente, isso reduz o
          risco percebido de contratar alguém que ele não conhece. Para você, isso justifica um
          ticket mais alto.
        </p>

        <p>
          O modelo de proposta para criador de sites também te protege juridicamente. Quando o escopo
          está escrito, aprovado e registrado, fica muito mais difícil para o cliente pedir mudanças
          sem custo ou discutir o que foi combinado.
        </p>

        <h2>Seções obrigatórias no modelo de proposta comercial para criador de sites</h2>

        <p>
          Uma proposta comercial completa para quem cria sites precisa cobrir:
        </p>

        <ul>
          <li>
            <strong>Apresentação e contexto:</strong> quem você é, sua experiência com criação de sites
            e projetos similares que você já fez. Inclua link do portfólio se tiver.
          </li>
          <li>
            <strong>Entendimento do projeto:</strong> mostre que leu o briefing. Descreva com suas
            palavras o que o cliente precisa — tipo de site, público-alvo, objetivo principal.
          </li>
          <li>
            <strong>Escopo detalhado:</strong> número de páginas, funcionalidades incluídas
            (formulário de contato, blog, área de login, integração com WhatsApp, etc.) e o que
            não está incluso.
          </li>
          <li>
            <strong>Entregáveis:</strong> o que você vai entregar — arquivos fonte, acesso ao painel,
            treinamento de uso, manual básico.
          </li>
          <li>
            <strong>Prazo:</strong> data de início, marcos do projeto (wireframe, design, desenvolvimento,
            revisão, publicação) e data de entrega final.
          </li>
          <li>
            <strong>Investimento:</strong> valor total, forma de pagamento (ex: 50% entrada + 50%
            na entrega) e o que acontece com revisões extras.
          </li>
          <li>
            <strong>Cláusulas importantes:</strong> prazo de validade da proposta, política de revisões,
            responsabilidade pelo conteúdo e imagens, hospedagem e domínio.
          </li>
        </ul>

        <h2>Precificação na proposta comercial para criador de sites</h2>

        <p>
          A parte que mais gera dúvida no modelo de proposta para criador de sites é o valor. Algumas
          referências de precificação para o mercado brasileiro em 2026:
        </p>

        <ul>
          <li><strong>Site institucional (até 5 páginas, sem CMS):</strong> R$ 1.500 a R$ 4.000</li>
          <li><strong>Site com WordPress + páginas personalizadas:</strong> R$ 3.000 a R$ 8.000</li>
          <li><strong>Landing page focada em conversão:</strong> R$ 800 a R$ 2.500</li>
          <li><strong>E-commerce simples (até 50 produtos):</strong> R$ 4.000 a R$ 12.000</li>
          <li><strong>Site com área de membros ou login:</strong> R$ 6.000 a R$ 20.000+</li>
        </ul>

        <p>
          Esses valores variam bastante dependendo da sua experiência, do mercado em que você atua e da
          complexidade do projeto. O mais importante é que sua proposta justifique o valor — mostrando
          o que está incluso, o prazo e a sua experiência com projetos similares.
        </p>

        <h2>Como usar o modelo de proposta comercial de site na prática</h2>

        <p>
          O maior erro de quem usa um modelo de proposta para criador de sites é copiar e colar sem
          personalizar. O cliente precisa sentir que a proposta foi escrita para ele, não para qualquer
          um. Você não precisa reescrever tudo — mas o entendimento do projeto e o escopo precisam
          estar específicos para aquele cliente.
        </p>

        <p>
          Uma forma de agilizar esse processo é usar uma ferramenta com templates por tipo de projeto.
          Você começa com a estrutura pronta, preenche as informações do cliente e do escopo, e envia
          por link — sem precisar baixar PDF ou anexar arquivo. O cliente aprova com um clique e você
          recebe o aceite com registro de data e hora.
        </p>

        <p>
          O FreelanceFlow tem modelos prontos de proposta para criação de sites e outros nichos.
          Você adapta em minutos, envia por WhatsApp ou e-mail e sabe exatamente quando o cliente
          abriu. Menos tempo montando proposta, mais tempo desenvolvendo projetos.
        </p>
      </article>
    ),
  },
]

const articleMap = Object.fromEntries(articles.map(a => [a.slug, a]))

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = articleMap[slug]
  if (!article) return {}
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `${BASE}/blog/${slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      url: `${BASE}/blog/${slug}`,
      type: 'article',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = articleMap[slug]
  if (!article) notFound()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <NavHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">
        <div className="mb-8">
          <Link href="/blog" className="text-sm text-[#1D9E75] hover:underline">
            ← Voltar para o blog
          </Link>
        </div>

        <time className="text-xs text-gray-400 font-medium">{article.date}</time>

        <div className="mt-4 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:leading-tight [&_h1]:mb-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-10 [&_h2]:mb-4 [&_p]:text-gray-600 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul_li]:text-gray-600 [&_ul_li]:leading-relaxed [&_ul_li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol_li]:text-gray-600 [&_ol_li]:leading-relaxed [&_ol_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[#1D9E75]/40 [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote_p]:text-gray-500 [&_blockquote_p]:italic [&_strong]:text-gray-800">
          {article.content}
        </div>

        <div className="mt-16 rounded-2xl bg-[#1D9E75]/8 border border-[#1D9E75]/20 p-8 text-center">
          <p className="text-gray-700 font-medium mb-2">
            Crie sua primeira proposta profissional em minutos.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Grátis para começar. Sem cartão de crédito.
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center px-6 py-3 bg-[#1D9E75] text-white font-medium rounded-lg hover:bg-[#188f68] transition-colors text-sm"
          >
            Criar conta grátis
          </Link>
        </div>
      </main>

      <footer className="py-8 px-4 sm:px-6 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-base font-bold text-[#1D9E75]">FreelanceFlow</Link>
          <span className="text-sm text-gray-400">© 2026 FreelanceFlow · Para freelancers brasileiros</span>
          <Link href="/privacidade" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  )
}
