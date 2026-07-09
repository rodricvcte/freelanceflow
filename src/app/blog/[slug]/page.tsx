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
            <strong>Seja específico no escopo.</strong> Evite termos vagos como &quot;criação de conteúdo&quot; ou
            &quot;suporte técnico&quot;. Defina quantidade, formato, canais e limites de revisão.
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
          <li><strong>Não detalhar o que está fora do escopo.</strong> &quot;Revisões ilimitadas&quot; é um convite para projetos que nunca terminam.</li>
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
            &quot;Oi [nome], tudo bem? Passei para confirmar que enviei a proposta e ver se chegou certinho.
            Qualquer dúvida, me chame. Estou à disposição!&quot;
          </p>
        </blockquote>

        <p><strong>Follow-up 2 — principal (3–5 dias):</strong></p>
        <blockquote>
          <p>
            &quot;Oi [nome], passando para ver se conseguiu dar uma olhada na proposta que enviei.
            Se tiver alguma pergunta sobre o escopo ou valores, fico feliz em conversar.
            Me conta como estão as coisas aí?&quot;
          </p>
        </blockquote>

        <p><strong>Follow-up 3 — fechamento do ciclo (7–10 dias):</strong></p>
        <blockquote>
          <p>
            &quot;Oi [nome], só para deixar registrado: a proposta tem validade até [data]. Se fizer sentido
            avançar, é só me dar um sinal e a gente marca uma conversa rápida para alinhar os próximos
            passos. Se o projeto ficou para depois, tudo bem também — qualquer coisa, estarei por aqui!&quot;
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
  {
    slug: 'como-cobrar-cliente-inadimplente',
    title: 'Como Cobrar Cliente Inadimplente Sendo Freelancer',
    description:
      'Guia prático para cobrar de cliente inadimplente sendo freelancer: mensagens prontas, multa, juros e como agir quando o cliente some sem pagar.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Como cobrar de cliente inadimplente sendo freelancer</h1>

        <p>
          O prazo de pagamento passou, você já entregou o trabalho e a resposta do cliente é
          silêncio. Esse é um dos problemas mais comuns na vida de quem trabalha como freelancer —
          e também um dos que mais geram ansiedade, porque cobrar dinheiro de quem te contratou
          parece, para muita gente, mais desconfortável do que deveria ser.
        </p>

        <p>
          A boa notícia é que <strong>cobrar cliente inadimplente</strong> é um processo, não uma
          cena de constrangimento. Com a mensagem certa, o prazo definido e, se necessário, o
          respaldo contratual, você recupera o pagamento na maioria dos casos sem precisar recorrer
          à Justiça.
        </p>

        <h2>O que fazer no primeiro dia de atraso</h2>

        <p>
          Antes de qualquer cobrança mais firme, confirme que não houve um erro simples — boleto
          que não chegou, chave PIX errada, data confusa na proposta. Isso resolve uma boa parte
          dos casos sem nenhum desgaste:
        </p>

        <ul>
          <li>
            <strong>Confira os dados de pagamento enviados.</strong> Erro de digitação na chave PIX
            ou no link de pagamento é mais comum do que parece.
          </li>
          <li>
            <strong>Mande uma mensagem simples e neutra</strong> perguntando se está tudo certo
            para o pagamento. Sem cobrança, só confirmação.
          </li>
          <li>
            <strong>Registre a data de vencimento e a data desse primeiro contato.</strong> Você
            vai precisar disso se o atraso continuar.
          </li>
          <li>
            <strong>Evite tom acusatório nessa etapa.</strong> Na maioria dos casos é só
            esquecimento — trate assim até que o histórico mostre o contrário.
          </li>
        </ul>

        <h2>Mensagens de cobrança para cliente inadimplente (prontas para usar)</h2>

        <p>
          O tom da cobrança deve ficar mais firme conforme o atraso aumenta. Veja três modelos por
          estágio:
        </p>

        <p><strong>No dia do vencimento — lembrete neutro:</strong></p>
        <blockquote>
          <p>
            &quot;Oi [nome], tudo bem? Passando para lembrar que o pagamento do projeto vence hoje.
            Segue novamente a chave PIX/link, caso precise: [dado]. Qualquer coisa, me avisa!&quot;
          </p>
        </blockquote>

        <p><strong>3 a 5 dias de atraso — cobrança direta:</strong></p>
        <blockquote>
          <p>
            &quot;Oi [nome], vi que o pagamento combinado para o dia [data] ainda não caiu por aqui.
            Pode verificar se ficou pendente por algum motivo? Preciso organizar meu financeiro e
            fico no aguardo do retorno.&quot;
          </p>
        </blockquote>

        <p><strong>7 dias ou mais de atraso — cobrança formal:</strong></p>
        <blockquote>
          <p>
            &quot;Oi [nome], até o momento não recebi o pagamento referente ao projeto entregue em
            [data], com vencimento em [data]. Conforme combinado na proposta, peço a regularização
            até [novo prazo]. Caso haja algum imprevisto, me avise para alinharmos juntos.&quot;
          </p>
        </blockquote>

        <p>
          Reforçar que o valor e o prazo estavam registrados na proposta — e não só combinados de
          boca — muda o peso da mensagem. O cliente sabe que existe um documento por trás da
          cobrança, não só a sua palavra.
        </p>

        <h2>Multa, juros e o que diz a lei sobre atraso de pagamento</h2>

        <p>
          Se o contrato ou a proposta não definiu nada sobre atraso, a lei brasileira ainda garante
          alguns direitos ao freelancer:
        </p>

        <ul>
          <li>
            <strong>Multa por atraso:</strong> quando prevista em contrato, é comum praticar entre
            2% e 10% do valor da parcela em aberto. Sem previsão contratual, não há multa automática
            — por isso vale deixar essa cláusula escrita já na proposta.
          </li>
          <li>
            <strong>Juros de mora:</strong> mesmo sem cláusula específica, o Código Civil (art. 406)
            garante juros de 1% ao mês sobre o valor em atraso.
          </li>
          <li>
            <strong>Correção monetária:</strong> para atrasos longos, pode ser aplicada com base em
            um índice como o IPCA, para o valor não perder poder de compra.
          </li>
          <li>
            <strong>Sem contrato ou proposta formal, fica mais difícil cobrar multa e juros</strong> —
            porque não há o que apresentar como prova do combinado.
          </li>
        </ul>

        <h2>Quando escalar a cobrança (e quando deixar para lá)</h2>

        <p>
          Se as mensagens não resolverem, existem caminhos antes de desistir do valor:
        </p>

        <ul>
          <li>
            <strong>Notificação extrajudicial:</strong> um e-mail ou carta formal, cobrando o valor
            com um prazo final claro, antes de qualquer medida judicial.
          </li>
          <li>
            <strong>Negociação com parcelamento:</strong> às vezes o cliente não some por má-fé, só
            não tem o valor todo disponível. Receber parcelado é melhor do que não receber nada.
          </li>
          <li>
            <strong>Juizado Especial Cível:</strong> para causas de até 40 salários mínimos, e sem
            necessidade de advogado até 20 salários mínimos. Processo relativamente rápido e
            gratuito para abrir.
          </li>
        </ul>

        <p>
          Para valores pequenos, avalie o custo-benefício de escalar — o tempo e o desgaste de um
          processo às vezes superam o que está em jogo. Para valores maiores, ter a proposta e as
          mensagens de cobrança documentadas facilita muito o processo, caso ele seja necessário.
        </p>

        <h2>Como evitar cliente inadimplente na próxima proposta</h2>

        <p>
          A forma mais eficiente de lidar com cliente inadimplente é reduzir a chance de isso
          acontecer de novo. Cobrar uma entrada antes de começar o projeto, deixar a cláusula de
          multa e juros explícita na proposta e ter o aceite do cliente registrado com data e hora
          são práticas simples que já eliminam boa parte do problema.
        </p>

        <p>
          O FreelanceFlow gera automaticamente um Certificado em PDF com data, hora e IP do aceite
          da proposta — o registro que faltava para embasar uma cobrança quando o cliente diz que
          &quot;não lembra&quot; dos termos combinados. Você monta a proposta com as condições de
          pagamento já claras, envia por link e tem prova do que foi aceito, sem esforço extra.
        </p>
      </article>
    ),
  },
  {
    slug: 'como-fazer-proposta-comercial',
    title: 'Como Fazer Proposta Comercial Freelancer (Rápido)',
    description:
      'Aprenda como fazer proposta comercial freelancer em poucos passos: modelo pronto, o que incluir e erros que fazem o cliente sumir.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Como fazer proposta comercial freelancer em 15 minutos</h1>

        <p>
          O cliente pediu um orçamento agora e você travou na frente da tela, sem saber por onde
          começar. Isso acontece porque a maioria dos freelancers monta a proposta do zero toda
          vez, reescrevendo as mesmas seções com palavras diferentes. Com uma estrutura fixa e um
          modelo para preencher, dá para montar uma proposta comercial freelancer completa em
          15 minutos — sem perder qualidade.
        </p>

        <h2>O que uma proposta comercial freelancer precisa ter (checklist rápido)</h2>

        <p>
          Antes de escrever qualquer linha, tenha esses pontos resolvidos — é isso que separa uma
          proposta profissional de um orçamento avulso:
        </p>

        <ul>
          <li><strong>Nome do cliente e do projeto</strong> — personalização mínima que já eleva a percepção de cuidado.</li>
          <li><strong>Resumo do problema</strong> — uma frase mostrando que você entendeu o que o cliente precisa.</li>
          <li><strong>Escopo</strong> — o que está incluso, em itens, sem parágrafo corrido.</li>
          <li><strong>Prazo</strong> — data de entrega ou marcos, se o projeto for longo.</li>
          <li><strong>Valor e forma de pagamento</strong> — total, parcelas e política de reajuste.</li>
          <li><strong>Validade</strong> — até quando aquele preço vale.</li>
          <li><strong>Botão ou link de aceite</strong> — quanto menor o atrito para aprovar, maior a conversão.</li>
        </ul>

        <h2>Modelo de proposta comercial freelancer para preencher agora</h2>

        <p>
          Use essa estrutura como ponto de partida. Copie, substitua o que está entre colchetes e
          ajuste o tom para o seu cliente:
        </p>

        <ol>
          <li><strong>Abertura:</strong> &quot;Oi [nome], segue a proposta para [projeto], conforme conversamos.&quot;</li>
          <li><strong>Entendimento:</strong> &quot;Pelo que você me passou, o objetivo é [resumo do problema em uma frase].&quot;</li>
          <li><strong>Escopo:</strong> liste 3 a 6 itens do que será entregue.</li>
          <li><strong>Prazo:</strong> &quot;O prazo estimado é de [X dias/semanas], com entrega em [data].&quot;</li>
          <li><strong>Investimento:</strong> &quot;O valor total é de R$ [valor], podendo ser dividido em [condições].&quot;</li>
          <li><strong>Fechamento:</strong> &quot;Essa proposta é válida até [data]. Qualquer dúvida, me chama!&quot;</li>
        </ol>

        <h2>Exemplos rápidos de proposta comercial freelancer por área</h2>

        <p>
          O modelo acima funciona para qualquer nicho, mas o escopo muda bastante dependendo da
          área. Alguns exemplos de como preencher a seção de escopo:
        </p>

        <ul>
          <li><strong>Design gráfico:</strong> &quot;3 propostas de logo, 2 rodadas de revisão, entrega em PNG, SVG e PDF.&quot;</li>
          <li><strong>Redação/copywriting:</strong> &quot;5 textos de blog de 800 palavras, com otimização básica de SEO.&quot;</li>
          <li><strong>Social media:</strong> &quot;12 posts mensais, calendário editorial e relatório de desempenho.&quot;</li>
          <li><strong>Fotografia:</strong> &quot;Cobertura de 4 horas, 40 fotos editadas em alta resolução.&quot;</li>
          <li><strong>Consultoria:</strong> &quot;Diagnóstico inicial + 3 sessões de acompanhamento mensais.&quot;</li>
        </ul>

        <h2>Erros que fazem a proposta comercial freelancer ser ignorada</h2>

        <p>
          Mesmo com um bom modelo, alguns erros continuam afastando clientes:
        </p>

        <ul>
          <li><strong>Mandar em texto corrido pelo WhatsApp</strong>, sem nenhuma formatação ou separação visual.</li>
          <li><strong>Não colocar prazo de validade</strong>, deixando a proposta em aberto indefinidamente.</li>
          <li><strong>Ser vago no escopo</strong>, o que gera discussão sobre o que estava incluso depois que o projeto já começou.</li>
          <li><strong>Demorar dias para enviar</strong> depois da conversa inicial — o interesse do cliente esfria rápido.</li>
        </ul>

        <p>
          Ter um modelo pronto resolve o maior gargalo, que é o tempo entre o cliente pedir o
          orçamento e você conseguir enviar algo profissional. Quanto mais rápido e mais organizado
          for esse envio, maior a chance de fechar antes que o cliente peça orçamento a outro
          freelancer.
        </p>

        <p>
          O FreelanceFlow já vem com modelos de proposta comercial por nicho prontos para adaptar —
          você preenche os campos, envia por link e recebe notificação assim que o cliente abrir.
          Sem precisar montar layout nem formatar PDF na mão toda vez que fecha um projeto novo.
        </p>
      </article>
    ),
  },
  {
    slug: 'como-precificar-servicos-freelancer',
    title: 'Quanto Cobrar Pelo Meu Trabalho Sendo Freelancer',
    description:
      'Quanto cobrar pelo meu trabalho freelancer? Aprenda a calcular seu valor-hora, precificar por projeto e reajustar sem perder cliente.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Quanto cobrar pelo seu trabalho sendo freelancer</h1>

        <p>
          Você olha para uma proposta de projeto e não sabe se R$ 500 é pouco, R$ 2.000 é caro ou
          se está deixando dinheiro na mesa. Esse é provavelmente o problema mais comum entre
          freelancers no Brasil: ninguém ensina a calcular preço, então cada um chuta um número e
          espera que o cliente não reclame.
        </p>

        <p>
          A resposta para &quot;quanto cobrar pelo meu trabalho freelancer&quot; não é um valor
          fixo — é uma conta. E depois de fazer essa conta uma vez, você para de precificar no
          feeling e passa a ter um número que realmente cobre suas contas e ainda sobra margem.
        </p>

        <h2>Por que cobrar barato &quot;pra pegar experiência&quot; quebra sua carreira</h2>

        <p>
          Cobrar abaixo do necessário no início parece uma estratégia razoável para conseguir os
          primeiros clientes, mas cria dois problemas que aparecem mais tarde: você atrai clientes
          acostumados com preço baixo, que reagem mal quando você tenta reajustar, e você
          normaliza um padrão de vida que não sustenta o trabalho como freelancer no médio prazo.
          O caminho mais seguro é precificar certo desde o início e negociar escopo, não preço,
          quando o orçamento do cliente for menor.
        </p>

        <h2>Como calcular seu valor-hora antes de precificar qualquer projeto</h2>

        <p>
          Para saber quanto cobrar pelo seu trabalho freelancer, comece calculando o valor-hora —
          mesmo que depois você cobre por projeto fechado. A conta básica:
        </p>

        <ul>
          <li><strong>Custos fixos mensais</strong> — moradia, internet, equipamentos, softwares, impostos.</li>
          <li><strong>Custo de vida desejado</strong> — o quanto você quer sobrar livre por mês.</li>
          <li><strong>Horas produtivas por mês</strong> — não são as horas trabalhadas, são as horas efetivamente faturáveis (geralmente 100–140h, não 160h+).</li>
          <li><strong>Margem de segurança</strong> — 20 a 30% a mais, para cobrir meses fracos, retrabalho e imposto.</li>
        </ul>

        <p>
          Some os custos fixos com o custo de vida desejado, divida pelas horas produtivas e
          acrescente a margem. Esse número é o piso do seu valor-hora — abaixo dele, você está
          trabalhando no prejuízo, mesmo que pareça estar ganhando dinheiro.
        </p>

        <h2>Precificação por projeto vs. por hora: quando usar cada uma</h2>

        <p>
          Depois de saber seu valor-hora, decida o formato de cobrança:
        </p>

        <ul>
          <li>
            <strong>Por hora:</strong> funciona bem para projetos com escopo indefinido ou
            consultoria contínua, onde é difícil estimar o tempo total antecipadamente.
          </li>
          <li>
            <strong>Por projeto fechado:</strong> funciona melhor para escopo bem definido —
            transmite mais confiança ao cliente e evita que ele fique acompanhando cada hora
            registrada. Estime as horas, aplique seu valor-hora e arredonde para um número fechado.
          </li>
        </ul>

        <h2>Referência de preços por nicho no Brasil em 2026</h2>

        <p>
          Esses valores variam por região, experiência e complexidade, mas servem como ponto de
          partida:
        </p>

        <ul>
          <li><strong>Design gráfico (identidade visual completa):</strong> R$ 800 a R$ 3.500</li>
          <li><strong>Redação/copywriting (artigo de blog):</strong> R$ 150 a R$ 600 por texto</li>
          <li><strong>Social media (gestão mensal):</strong> R$ 800 a R$ 3.000</li>
          <li><strong>Fotografia de evento (diária):</strong> R$ 800 a R$ 4.000</li>
          <li><strong>Criação de site institucional:</strong> R$ 1.500 a R$ 8.000</li>
        </ul>

        <h2>Como reajustar preço sem perder o cliente</h2>

        <p>
          Se você já está cobrando abaixo do que deveria, o reajuste precisa ser comunicado com
          antecedência — nunca em cima da hora, na renovação de um projeto recorrente. Avise com
          30 dias, explique o motivo em uma frase (custo de vida, demanda, especialização) e
          ofereça a chance de conversar caso o valor novo não caiba no orçamento do cliente. Quem
          valoriza seu trabalho normalmente entende; quem só ficava pelo preço baixo tende a sair —
          e está tudo bem.
        </p>

        <p>
          Uma proposta bem estruturada ajuda a justificar o valor cobrado, mostrando escopo,
          entregáveis e prazo de forma clara — em vez de só um número solto no WhatsApp. O
          FreelanceFlow te ajuda a montar essa proposta com o valor já organizado por seção, envia
          por link e avisa quando o cliente abre. Menos negociação no escuro, mais clareza sobre o
          que está sendo cobrado.
        </p>
      </article>
    ),
  },
  {
    slug: 'como-fazer-follow-up-proposta',
    title: 'Como Perguntar se Cliente Aprovou a Proposta',
    description:
      'Como perguntar se o cliente aprovou a proposta sem parecer chato. Frases prontas para WhatsApp, e-mail e ligação.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Como perguntar se o cliente aprovou a proposta sem parecer chato</h1>

        <p>
          Você enviou a proposta, o cliente visualizou e depois disso, nada. Nesse momento bate a
          dúvida: pergunto se ele aprovou ou espero mais um pouco para não parecer ansioso? A
          maioria dos freelancers trava exatamente aqui — e acaba deixando a negociação esfriar por
          medo de incomodar.
        </p>

        <p>
          Perguntar se o cliente aprovou a proposta não é chato quando feito do jeito certo. O
          problema não é perguntar, é como e quando isso é feito.
        </p>

        <h2>Por que ficar esperando calado é pior do que perguntar</h2>

        <p>
          Muitos freelancers evitam perguntar porque associam a cobrança de resposta a
          desespero. Na prática, é o contrário: clientes lidam com dezenas de mensagens e
          fornecedores diferentes, e a proposta que você enviou pode simplesmente ter descido na
          lista de prioridades. Uma pergunta objetiva e educada não passa desespero — passa
          organização. Quem não pergunta é quem realmente perde a venda, não quem pergunta.
        </p>

        <h2>Como formular a pergunta certa</h2>

        <p>
          Evite perguntas genéricas como &quot;e aí, vai fechar?&quot; — elas soam informais demais
          e colocam o cliente numa posição de responder sim ou não sem contexto. Prefira perguntas
          que reabrem a conversa sobre o projeto, não só sobre a decisão:
        </p>

        <ul>
          <li>Pergunte sobre dúvidas específicas do escopo, não só sobre &quot;aprovação&quot;.</li>
          <li>Ofereça ajustar algo, em vez de só cobrar resposta.</li>
          <li>Dê um motivo real para a pergunta (organização de agenda, fila de projetos).</li>
        </ul>

        <h2>Frases prontas para perguntar sobre aprovação em diferentes canais</h2>

        <p><strong>Por WhatsApp (tom leve):</strong></p>
        <blockquote>
          <p>
            &quot;Oi [nome], passando para saber se você já teve a chance de olhar a proposta.
            Ficou alguma dúvida sobre o escopo ou valor?&quot;
          </p>
        </blockquote>

        <p><strong>Por e-mail (tom mais formal):</strong></p>
        <blockquote>
          <p>
            &quot;Olá [nome], escrevo para confirmar se a proposta enviada em [data] atende às
            expectativas do projeto. Estou à disposição para ajustar qualquer ponto antes de
            avançarmos.&quot;
          </p>
        </blockquote>

        <p><strong>Em ligação ou áudio (tom direto):</strong></p>
        <blockquote>
          <p>
            &quot;Queria entender se ainda faz sentido a gente seguir com o projeto — se precisar de
            mais tempo ou tiver alguma objeção, me conta que a gente resolve.&quot;
          </p>
        </blockquote>

        <h2>O que fazer quando a resposta for &quot;ainda estou avaliando&quot;</h2>

        <p>
          Essa resposta não é um não — mas também não pode virar um limbo sem prazo. Uma boa saída
          é perguntar diretamente o que falta para a decisão (orçamento, aprovação interna, outras
          cotações) e propor um novo prazo de retorno. Isso transforma uma resposta vaga em um
          próximo passo concreto, com data definida.
        </p>

        <h2>Quando parar de perguntar e seguir em frente</h2>

        <p>
          Depois de dois ou três follow-ups sem resposta nenhuma — nem &quot;ainda estou vendo&quot;
          — é hora de deixar a porta aberta e focar em outros clientes. Uma última mensagem
          educada, mencionando que a proposta continua disponível caso o projeto volte a fazer
          sentido, fecha o ciclo sem queimar a relação.
        </p>

        <p>
          Saber o momento certo de perguntar fica muito mais fácil quando você sabe se o cliente
          já abriu a proposta ou não. O FreelanceFlow notifica você assim que o cliente visualiza o
          link — em vez de perguntar no escuro, você pergunta sabendo que a proposta já foi lida.
        </p>
      </article>
    ),
  },
  {
    slug: 'contrato-freelancer-modelo',
    title: 'Contrato para Freelancer: Modelo Pronto para Usar',
    description:
      'Modelo de contrato para freelancer com as cláusulas essenciais: escopo, prazo, pagamento, revisões e rescisão. Pronto para adaptar.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Contrato para freelancer: modelo pronto para usar</h1>

        <p>
          Você fechou o projeto só com uma troca de mensagens e um &quot;combinado&quot; verbal — e
          agora o cliente quer mudar o escopo sem pagar a mais, ou some no meio do projeto sem
          justificativa. Sem contrato, você não tem muito o que fazer além de tentar negociar. Um
          contrato para freelancer simples resolve os dois problemas antes que eles aconteçam.
        </p>

        <h2>Por que só a proposta comercial não te protege juridicamente</h2>

        <p>
          A proposta comercial é ótima para vender o projeto, mas normalmente não tem a força de um
          documento contratual completo — faltam cláusulas de rescisão, confidencialidade,
          responsabilidade por atrasos e propriedade intelectual. Para projetos pequenos e rápidos,
          a proposta com aceite registrado já costuma bastar. Para projetos maiores ou de longo
          prazo, vale ter um contrato para freelancer separado, assinado antes de começar.
        </p>

        <h2>Cláusulas que não podem faltar no contrato para freelancer</h2>

        <ul>
          <li><strong>Identificação das partes</strong> — nome completo ou razão social, CPF/CNPJ e endereço de ambos.</li>
          <li><strong>Objeto do contrato</strong> — descrição clara do serviço prestado.</li>
          <li><strong>Escopo e entregáveis</strong> — o que está incluso, formatos e quantidade de revisões.</li>
          <li><strong>Prazo</strong> — data de início, marcos e data final.</li>
          <li><strong>Valor e forma de pagamento</strong> — total, parcelas, datas e o que acontece em caso de atraso.</li>
          <li><strong>Propriedade intelectual</strong> — quando os direitos passam para o cliente (normalmente só após o pagamento total).</li>
          <li><strong>Confidencialidade</strong> — se o projeto envolve informações sensíveis do cliente.</li>
          <li><strong>Rescisão</strong> — condições para cancelar o contrato e o que acontece com valores já pagos ou trabalho já feito.</li>
        </ul>

        <h2>Modelo de contrato para freelancer por seção</h2>

        <p>
          Estrutura básica para adaptar ao seu projeto:
        </p>

        <ol>
          <li><strong>Preâmbulo:</strong> &quot;Pelo presente instrumento, [seu nome/razão social] e [nome do cliente] firmam o presente contrato de prestação de serviços.&quot;</li>
          <li><strong>Cláusula 1 — Objeto:</strong> descreva o serviço em uma ou duas frases.</li>
          <li><strong>Cláusula 2 — Escopo e entregáveis:</strong> liste os itens, igual você faria na proposta.</li>
          <li><strong>Cláusula 3 — Prazo:</strong> data de início e de entrega, com marcos se necessário.</li>
          <li><strong>Cláusula 4 — Valor e pagamento:</strong> valor total, parcelas, forma e multa por atraso.</li>
          <li><strong>Cláusula 5 — Rescisão:</strong> regras de cancelamento por qualquer uma das partes.</li>
          <li><strong>Assinaturas:</strong> local, data e assinatura de ambas as partes (pode ser digital).</li>
        </ol>

        <h2>Contrato simples vs. contrato registrado em cartório</h2>

        <p>
          Para a maioria dos projetos freelancer, um contrato assinado digitalmente (por e-mail,
          por uma ferramenta de assinatura eletrônica ou até com aceite registrado por escrito) já
          tem validade jurídica no Brasil e é suficiente. Registro em cartório só costuma ser
          necessário para projetos de valor muito alto ou quando o cliente exige por política
          interna da empresa — não é padrão para o freelancer comum.
        </p>

        <h2>Erros que invalidam ou enfraquecem um contrato de freelancer</h2>

        <ul>
          <li><strong>Deixar o escopo genérico</strong> — &quot;desenvolvimento do projeto conforme combinado&quot; não define nada em caso de disputa.</li>
          <li><strong>Não definir o que acontece com o pagamento em caso de cancelamento.</strong></li>
          <li><strong>Esquecer de identificar as partes corretamente</strong> — CPF/CNPJ errado pode gerar problemas de validade.</li>
          <li><strong>Nunca revisar o modelo</strong> — um contrato genérico da internet pode ter cláusulas que não fazem sentido para o seu tipo de serviço.</li>
        </ul>

        <p>
          Para projetos menores, uma alternativa mais rápida é caprichar na proposta comercial e
          garantir que o aceite do cliente fique registrado com data, hora e os termos completos —
          já funciona como prova do que foi combinado. O FreelanceFlow gera esse registro
          automaticamente em um Certificado de aceite, então mesmo sem um contrato formal você tem
          respaldo caso precise cobrar ou esclarecer o que foi acordado.
        </p>
      </article>
    ),
  },
  {
    slug: 'proposta-comercial-design-grafico',
    title: 'Proposta Comercial para Design Gráfico (Modelo)',
    description:
      'Modelo de proposta comercial para design gráfico: escopo, formatos de entrega, revisões e precificação por tipo de projeto.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Proposta comercial para design gráfico: o que incluir</h1>

        <p>
          Cliente pediu um &quot;logo bonito&quot; e você mandou um valor solto no WhatsApp — aí
          vieram 8 rodadas de revisão de graça porque nada disso estava escrito em lugar nenhum.
          Uma proposta comercial para design gráfico bem estruturada evita exatamente esse tipo de
          projeto sem fim, porque define desde o início quantas revisões estão inclusas e em quais
          formatos o material será entregue.
        </p>

        <h2>O que diferencia uma proposta comercial de design gráfico das genéricas</h2>

        <p>
          Design tem particularidades que uma proposta genérica não cobre: formatos de arquivo,
          quantidade de conceitos iniciais, número de rodadas de revisão e direitos de uso da peça
          final. Sem essas informações explícitas, o cliente assume que tudo está incluso — e é
          exatamente aí que o projeto vira uma fonte infinita de ajustes não pagos.
        </p>

        <h2>Estrutura da proposta comercial para design gráfico</h2>

        <ul>
          <li><strong>Briefing entendido</strong> — resuma o que o cliente pediu, no seu vocabulário, para confirmar alinhamento.</li>
          <li><strong>Conceitos iniciais</strong> — quantas opções de criação serão apresentadas (ex: 2 a 3 propostas de logo).</li>
          <li><strong>Rodadas de revisão</strong> — número exato incluso no valor (ex: até 2 rodadas de ajustes).</li>
          <li><strong>Formatos de entrega</strong> — arquivos finais em quais extensões (PNG, SVG, PDF, AI, PSD).</li>
          <li><strong>Direitos de uso</strong> — se a peça pode ser usada em qualquer mídia ou só nas combinadas.</li>
          <li><strong>Prazo</strong> — da apresentação dos conceitos até a entrega final.</li>
          <li><strong>Investimento</strong> — valor total e forma de pagamento.</li>
        </ul>

        <h2>Como precificar por tipo de projeto de design gráfico</h2>

        <p>
          Referência de mercado para ajudar a calibrar sua proposta comercial de design gráfico:
        </p>

        <ul>
          <li><strong>Logo simples (sem manual de marca):</strong> R$ 400 a R$ 1.200</li>
          <li><strong>Identidade visual completa (logo + manual + aplicações):</strong> R$ 1.500 a R$ 5.000</li>
          <li><strong>Peças para redes sociais (pacote mensal):</strong> R$ 500 a R$ 2.000</li>
          <li><strong>Design de embalagem:</strong> R$ 800 a R$ 3.000 por peça</li>
          <li><strong>Apresentação institucional (slides):</strong> R$ 400 a R$ 1.500</li>
        </ul>

        <h2>Cláusula de direitos de uso e revisões: onde a maioria erra</h2>

        <p>
          O erro mais comum em proposta comercial de design gráfico é escrever &quot;revisões
          inclusas&quot; sem número — isso é um convite para ajustes intermináveis. Defina um
          número fixo (2 é o mais comum) e deixe claro que revisões extras têm um valor adicional
          por rodada. Da mesma forma, especifique que os direitos de uso da peça final só passam
          para o cliente após o pagamento completo — isso evita o uso do material antes da
          quitação.
        </p>

        <p>
          Ter uma proposta comercial para design gráfico já estruturada com essas cláusulas
          significa não precisar reescrever isso a cada projeto novo. O FreelanceFlow tem modelo
          pronto para design gráfico, com as seções de escopo, revisões e formatos já organizadas —
          você personaliza os detalhes do cliente, envia por link e acompanha quando ele abre.
        </p>
      </article>
    ),
  },
  {
    slug: 'como-vender-site-para-pequenas-empresas',
    title: 'Como Vender Site para Pequenas Empresas',
    description:
      'Como vender site para pequenas empresas: como abordar sem parecer spam, argumentos que funcionam e como estruturar a proposta.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Como vender site para pequenas empresas sem parecer vendedor chato</h1>

        <p>
          Você passa na frente de uma padaria, um salão de beleza ou uma clínica pequena, procura
          o nome no Google e não encontra site nenhum — só uma página do Instagram desatualizada.
          Isso não é falta de sorte, é a regra: a maioria das pequenas empresas no Brasil ainda não
          tem site. E isso é oportunidade, não coincidência.
        </p>

        <h2>Por que pequenas empresas ainda não têm site (e como isso é sua oportunidade)</h2>

        <p>
          Donos de pequenos negócios geralmente não têm site por três motivos: acham que é caro,
          não sabem por onde começar ou já tentaram um serviço genérico que não trouxe resultado.
          Nenhum desses motivos é resolvido com um discurso técnico sobre HTML ou hospedagem — eles
          são resolvidos mostrando resultado prático: mais clientes encontrando o negócio, mais
          credibilidade e menos dependência de indicação boca a boca.
        </p>

        <h2>Como abordar pequenas empresas sem parecer spam</h2>

        <p>
          A forma mais eficaz de vender site para pequenas empresas é a abordagem pessoal e local,
          não mensagem em massa. Algumas táticas que funcionam:
        </p>

        <ul>
          <li><strong>Visite o negócio pessoalmente</strong> ou mande mensagem citando algo específico do estabelecimento — mostra que não é copy-paste em massa.</li>
          <li><strong>Mostre, não conte.</strong> Leve um exemplo real ou um mockup rápido de como o site do negócio poderia ficar.</li>
          <li><strong>Fale de resultado, não de tecnologia.</strong> &quot;Cliente te encontra no Google&quot; converte muito mais que &quot;site responsivo com SEO otimizado&quot;.</li>
          <li><strong>Comece pela dor específica do nicho.</strong> Uma clínica quer agendamento facilitado; um restaurante quer cardápio e localização visíveis.</li>
        </ul>

        <h2>Argumentos de venda que funcionam com donos de pequenos negócios</h2>

        <p>
          Alguns argumentos que costumam converter melhor do que discurso técnico:
        </p>

        <ul>
          <li>&quot;Seu concorrente já aparece no Google e você não — isso está custando cliente todo mês.&quot;</li>
          <li>&quot;Um site profissional custa menos do que parece e se paga com 1 ou 2 clientes novos.&quot;</li>
          <li>&quot;Diferente do Instagram, o site é seu — não depende de algoritmo para ser visto.&quot;</li>
          <li>&quot;Dá para ter pronto em poucas semanas, sem complicação para você administrar.&quot;</li>
        </ul>

        <h2>Como estruturar a proposta comercial de site para fechar mais rápido</h2>

        <p>
          Depois que o dono do negócio topa conversar, a proposta precisa ser simples de entender —
          evite termos técnicos. Estruture com: quantidade de páginas, funcionalidades incluídas
          (formulário de contato, botão de WhatsApp, localização no mapa), prazo de entrega e
          valor. Ofereça um pacote de manutenção mensal como item opcional — muitas pequenas
          empresas preferem pagar um valor fixo para não se preocupar com atualizações depois.
        </p>

        <p>
          Ter uma proposta pronta, com linguagem simples e visual profissional, muda a percepção do
          dono do pequeno negócio sobre o seu trabalho — passa a impressão de uma empresa
          organizada, não de um freelancer avulso. O FreelanceFlow tem modelo de proposta para
          criação de sites já pronto: você adapta ao negócio do cliente, envia por link e recebe
          aviso assim que ele visualizar.
        </p>
      </article>
    ),
  },
  {
    slug: 'como-fazer-orcamento-fotografia',
    title: 'Como Fazer Orçamento de Fotografia para Evento',
    description:
      'Orçamento fotografia evento: o que incluir além da hora de trabalho, como calcular edição e deslocamento, e modelos por tipo de evento.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Como fazer orçamento de fotografia para evento</h1>

        <p>
          Você cobrou só pelas horas de cobertura do evento e esqueceu de incluir o tempo de
          edição, o deslocamento e o desgaste do equipamento — no fim do mês, percebeu que ganhou
          bem menos do que parecia na hora de fechar o orçamento. Isso é comum entre fotógrafos que
          calculam o valor só pensando no dia do evento, sem contar tudo o que vem depois.
        </p>

        <h2>O que incluir no orçamento de fotografia para evento além da hora de trabalho</h2>

        <p>
          Um orçamento de fotografia para evento completo precisa cobrir muito mais do que as horas
          no local:
        </p>

        <ul>
          <li><strong>Horas de cobertura</strong> — tempo efetivo no evento, incluindo chegada antecipada para preparação.</li>
          <li><strong>Deslocamento</strong> — combustível, pedágio ou transporte até o local.</li>
          <li><strong>Edição e seleção</strong> — o tempo gasto depois do evento é, em geral, igual ou maior do que o tempo de cobertura.</li>
          <li><strong>Desgaste de equipamento</strong> — depreciação de câmera, lentes e flashes.</li>
          <li><strong>Backup e armazenamento</strong> — espaço em nuvem ou HD para entregar e guardar as fotos.</li>
          <li><strong>Segundo fotógrafo</strong> — se o evento exigir cobertura de mais de um ângulo simultâneo.</li>
        </ul>

        <h2>Como calcular o valor considerando edição, deslocamento e equipamento</h2>

        <p>
          Uma forma prática de montar o orçamento de fotografia para evento:
        </p>

        <ol>
          <li>Defina seu valor-hora de cobertura (com base no seu custo de vida e experiência).</li>
          <li>Multiplique pelas horas de cobertura contratadas.</li>
          <li>Adicione o tempo estimado de edição, calculado no mesmo valor-hora ou em um valor por foto entregue.</li>
          <li>Some deslocamento e custos extras (aluguel de equipamento, assistente, segundo fotógrafo).</li>
          <li>Aplique uma margem de 15 a 20% para imprevistos do dia do evento.</li>
        </ol>

        <h2>Modelo de orçamento de fotografia por tipo de evento</h2>

        <p>
          Referência de mercado para calibrar seu orçamento de fotografia de evento:
        </p>

        <ul>
          <li><strong>Casamento (cobertura completa, 8h+):</strong> R$ 2.500 a R$ 8.000</li>
          <li><strong>Evento corporativo (4h):</strong> R$ 800 a R$ 2.500</li>
          <li><strong>Aniversário/festa infantil (3h):</strong> R$ 500 a R$ 1.500</li>
          <li><strong>Ensaio + evento pequeno (2h):</strong> R$ 400 a R$ 1.200</li>
          <li><strong>Ensaio corporativo/perfil profissional:</strong> R$ 300 a R$ 900</li>
        </ul>

        <h2>Erros que fazem o fotógrafo perder dinheiro no orçamento</h2>

        <ul>
          <li><strong>Não cobrar a edição separadamente</strong> — tratando como se fosse &quot;de brinde&quot; junto com a cobertura.</li>
          <li><strong>Esquecer o deslocamento</strong> em eventos fora da cidade ou em horários que exigem transporte especial.</li>
          <li><strong>Não definir a quantidade de fotos entregues</strong> — abre espaço para o cliente pedir a edição de centenas de fotos extras sem custo adicional.</li>
          <li><strong>Não cobrar entrada</strong> — em fotografia de evento, o não comparecimento do cliente no dia gera prejuízo total sem sinal pago antecipadamente.</li>
        </ul>

        <p>
          Um orçamento de fotografia para evento bem estruturado, com todos esses itens separados,
          evita que o cliente questione o valor total depois — porque cada parte do preço está
          justificada. O FreelanceFlow ajuda a montar esse orçamento em formato de proposta
          profissional, com escopo, valores e condições de pagamento organizados, pronta para
          enviar por link antes de fechar a data do evento.
        </p>
      </article>
    ),
  },
  {
    slug: 'proposta-comercial-redes-sociais',
    title: 'Proposta Comercial para Redes Sociais: O Que Incluir e Como Fechar',
    description:
      'Saiba o que incluir numa proposta comercial de redes sociais, como montar pacotes e como apresentar o valor do seu trabalho ao cliente.',
    date: '9 de julho de 2026',
    content: (
      <article className="prose prose-gray max-w-none">
        <h1>Proposta comercial para redes sociais: o que incluir e como fechar</h1>

        <p>
          Você manda uma proposta comercial de redes sociais com &quot;12 posts por mês&quot; e o
          cliente some. Não é o preço que espantou — é que ele não entendeu o que aquilo vai fazer
          pelo negócio dele. Uma boa proposta comercial de social media não vende quantidade de
          post, vende resultado. E é isso que muda a taxa de fechamento.
        </p>

        <h2>O que o cliente de social media realmente quer saber</h2>

        <p>
          Quando o cliente pede uma proposta de social media, ele não está comparando quem entrega
          mais posts por mês. Ele está tentando entender uma coisa: isso vai trazer mais clientes
          ou não? Uma proposta comercial de redes sociais que lista só &quot;quantidade de posts,
          stories e reels&quot; sem explicar o resultado esperado soa igual a de qualquer
          concorrente — e vira decisão só por preço.
        </p>

        <p>
          O ajuste é simples: para cada entregável, explique o efeito esperado no negócio.
          &quot;4 reels por mês&quot; vira &quot;4 reels por mês para aumentar alcance e atrair
          seguidores qualificados para o perfil&quot;. Isso muda completamente como o cliente lê a
          proposta comercial de social media — ele passa a enxergar investimento, não gasto.
        </p>

        <h2>O que não pode faltar na proposta</h2>

        <p>
          Uma proposta comercial de redes sociais completa precisa deixar claro, sem ambiguidade:
        </p>

        <ul>
          <li>
            <strong>Escopo detalhado</strong> — número de posts, formatos (feed, stories, reels) e
            quais plataformas estão cobertas (Instagram, TikTok, LinkedIn etc.).
          </li>
          <li>
            <strong>Frequência de publicação e calendário</strong> — quantas vezes por semana em
            cada formato, e se existe um calendário editorial mensal para aprovação prévia.
          </li>
          <li>
            <strong>Processo de aprovação de conteúdo</strong> — quantos dias de antecedência o
            conteúdo é enviado, quantas rodadas de ajuste estão inclusas e qual o prazo de resposta
            esperado do cliente.
          </li>
          <li>
            <strong>O que está fora do escopo</strong> — tráfego pago, criação de vídeo do zero,
            fotografia profissional e qualquer serviço que normalmente é cobrado à parte.
          </li>
          <li>
            <strong>Prazo de contrato</strong> — social media é trabalho de resultado no médio
            prazo, então o mínimo recomendado é 3 meses. Contratos mês a mês tendem a ser
            cancelados antes de mostrar resultado real.
          </li>
          <li>
            <strong>Condições de reajuste</strong> — deixe escrito desde o início quando e como o
            valor pode ser revisado, para não parecer surpresa depois.
          </li>
        </ul>

        <h2>Como apresentar pacotes sem parecer tabela de preço</h2>

        <p>
          Chamar os pacotes de &quot;Básico, Intermediário e Premium&quot; transforma sua proposta
          comercial de social media numa comparação fria de quantidade por preço. Uma alternativa
          que funciona melhor é nomear os pacotes pelo objetivo do cliente:
        </p>

        <ul>
          <li><strong>Presença</strong> — para quem ainda não tem constância nas redes e precisa organizar o básico.</li>
          <li><strong>Crescimento</strong> — para quem já publica, mas quer aumentar alcance e seguidores qualificados.</li>
          <li><strong>Autoridade</strong> — para quem quer se posicionar como referência no nicho, com conteúdo mais estratégico e frequente.</li>
        </ul>

        <p>
          O mais importante é mostrar o que muda entre os pacotes em termos de resultado esperado —
          não só a quantidade de posts. Uma proposta social media que mostra a evolução em impacto,
          e não só em volume, justifica o salto de preço entre os pacotes de forma muito mais
          natural.
        </p>

        <h2>Como enviar a proposta e acompanhar a resposta</h2>

        <p>
          Mandar a proposta em PDF por e-mail e esperar é abrir mão do controle sobre o processo de
          venda. Você não sabe se o cliente abriu, se leu até o fim ou se está comparando com outro
          orçamento nesse momento — e sem essa informação, o follow-up vira um chute no escuro.
        </p>

        <p>
          Saber quando o cliente abriu a proposta, e quantas vezes, muda completamente o timing do
          seu contato. Um cliente que abriu o modelo de proposta comercial de social media três
          vezes na mesma tarde está claramente em dúvida entre fechar com você ou com outro
          profissional — esse é o momento certo para uma mensagem, não daqui a uma semana.
        </p>

        <p>
          É exatamente isso que o FreelanceFlow resolve — você envia um link, sabe quando o cliente
          abriu e recebe alerta para fazer follow-up na hora certa. Sem PDF perdido no e-mail, sem
          adivinhar se a proposta social media ainda está sendo avaliada.{' '}
          <Link href="/cadastro">Crie sua proposta grátis</Link>.
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
