import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como o FreelanceFlow coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://freelanceflow.com.br/privacidade' },
}

const UPDATED_AT = '19 de junho de 2026'
const CONTACT_EMAIL = 'privacidade@freelanceflow.com.br'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900">
            Freelance<span className="text-green-600">Flow</span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← Voltar ao site
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Política de Privacidade</h1>
          <p className="text-sm text-gray-500">Última atualização: {UPDATED_AT}</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-10">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Quem somos</h2>
            <p className="text-gray-600 leading-relaxed">
              O <strong>FreelanceFlow</strong> é uma plataforma de criação e gestão de propostas comerciais
              para freelancers brasileiros, disponível em{' '}
              <a href="https://freelanceflow.com.br" className="text-green-600 hover:underline">
                freelanceflow.com.br
              </a>
              . Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
              seus dados pessoais, em conformidade com a{' '}
              <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Dados que coletamos</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Coletamos apenas os dados necessários para o funcionamento do serviço:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-800 mb-1">Dados de cadastro</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Nome completo e nome do negócio</li>
                  <li>Endereço de e-mail</li>
                  <li>Senha (armazenada de forma criptografada, nunca em texto plano)</li>
                  <li>Foto de perfil / logotipo (quando enviado)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-1">Dados profissionais</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>CPF ou CNPJ (opcional, para inclusão no PDF da proposta)</li>
                  <li>Telefone, endereço, redes sociais e site/portfólio</li>
                  <li>Dados de clientes cadastrados (nome, e-mail, telefone)</li>
                  <li>Conteúdo das propostas criadas na plataforma</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-1">Dados de uso</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Logs de acesso (IP, data/hora, navegador)</li>
                  <li>Registro de abertura de propostas por clientes (rastreamento via token único)</li>
                  <li>Interações dentro da plataforma (propostas criadas, enviadas, aceitas)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-1">Dados de pagamento</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>
                    Dados de cartão de crédito <strong>não são armazenados pelo FreelanceFlow</strong>.
                    O processamento é realizado integralmente pelo Stripe, certificado PCI-DSS nível 1.
                    Armazenamos apenas o identificador de assinatura e o status do plano.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Como usamos seus dados</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm leading-relaxed">
              <li>Criar e manter sua conta na plataforma</li>
              <li>Gerar, enviar e rastrear suas propostas comerciais</li>
              <li>Enviar notificações por e-mail (proposta visualizada, aceita, recusada, follow-ups)</li>
              <li>Processar pagamentos e gerenciar sua assinatura</li>
              <li>Responder mensagens de suporte</li>
              <li>Melhorar o produto com base em dados agregados e anonimizados</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins de marketing.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Base legal (LGPD)</h2>
            <p className="text-gray-600 leading-relaxed text-sm mb-3">
              O tratamento dos seus dados é fundamentado nas seguintes bases legais previstas na LGPD:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
              <li><strong>Execução de contrato</strong> — para fornecer o serviço contratado (art. 7º, V)</li>
              <li><strong>Consentimento</strong> — para envio de comunicações de marketing (art. 7º, I)</li>
              <li><strong>Interesse legítimo</strong> — para melhoria do produto e prevenção de fraudes (art. 7º, IX)</li>
              <li><strong>Cumprimento de obrigação legal</strong> — quando exigido por lei (art. 7º, II)</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Compartilhamento de dados</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Compartilhamos dados estritamente com os fornecedores necessários para o funcionamento da plataforma:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3 border border-gray-200 font-medium text-gray-700">Fornecedor</th>
                    <th className="text-left p-3 border border-gray-200 font-medium text-gray-700">Finalidade</th>
                    <th className="text-left p-3 border border-gray-200 font-medium text-gray-700">Dados compartilhados</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr>
                    <td className="p-3 border border-gray-200 font-medium">Supabase</td>
                    <td className="p-3 border border-gray-200">Banco de dados e autenticação</td>
                    <td className="p-3 border border-gray-200">Todos os dados da conta</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 border border-gray-200 font-medium">Stripe</td>
                    <td className="p-3 border border-gray-200">Processamento de pagamentos</td>
                    <td className="p-3 border border-gray-200">E-mail, dados de faturamento</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200 font-medium">Resend</td>
                    <td className="p-3 border border-gray-200">Envio de e-mails transacionais</td>
                    <td className="p-3 border border-gray-200">E-mail e nome do destinatário</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-3 border border-gray-200 font-medium">Google</td>
                    <td className="p-3 border border-gray-200">Autenticação via Google (opcional)</td>
                    <td className="p-3 border border-gray-200">Nome e e-mail da conta Google</td>
                  </tr>
                  <tr>
                    <td className="p-3 border border-gray-200 font-medium">Vercel</td>
                    <td className="p-3 border border-gray-200">Hospedagem da plataforma</td>
                    <td className="p-3 border border-gray-200">Logs de acesso (IP, requisições)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Todos os fornecedores acima possuem suas próprias políticas de privacidade e medidas de segurança adequadas.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Armazenamento e segurança</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
              <li>Dados armazenados em servidores com criptografia em repouso (AES-256)</li>
              <li>Comunicação protegida por TLS/HTTPS em todas as rotas</li>
              <li>Senhas armazenadas com hash seguro (bcrypt) — nunca em texto plano</li>
              <li>Acesso ao banco de dados restrito por políticas de segurança em nível de linha (RLS)</li>
              <li>Tokens de proposta únicos e não adivinháveis para controle de acesso público</li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Seus dados são armazenados em servidores localizados nos <strong>Estados Unidos</strong> (AWS/Supabase).
              A transferência internacional está amparada em cláusulas contratuais padrão compatíveis com a LGPD.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retenção de dados</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
              <li>Dados de conta: mantidos enquanto a conta estiver ativa</li>
              <li>Após exclusão da conta: dados removidos em até <strong>30 dias</strong>, salvo obrigação legal de retenção</li>
              <li>Logs de acesso: retidos por até 12 meses</li>
              <li>Dados de faturamento: retidos pelo período exigido pela legislação fiscal brasileira (5 anos)</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Seus direitos (LGPD)</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Como titular dos dados, você tem os seguintes direitos garantidos pela LGPD:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
              <li><strong>Confirmação e acesso</strong> — saber quais dados temos sobre você</li>
              <li><strong>Correção</strong> — atualizar dados incompletos ou desatualizados</li>
              <li><strong>Anonimização ou eliminação</strong> — para dados desnecessários ou excessivos</li>
              <li><strong>Portabilidade</strong> — exportar seus dados em formato legível</li>
              <li><strong>Revogação do consentimento</strong> — a qualquer momento, sem prejuízo</li>
              <li><strong>Exclusão da conta</strong> — encerrar o uso e solicitar remoção dos dados</li>
              <li><strong>Oposição</strong> — contestar tratamento que considere irregular</li>
            </ul>
            <p className="text-gray-600 text-sm mt-4">
              Para exercer qualquer direito, envie uma solicitação para{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 hover:underline">
                {CONTACT_EMAIL}
              </a>
              . Respondemos em até <strong>15 dias úteis</strong>.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Cookies</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Utilizamos cookies estritamente necessários para o funcionamento da plataforma, como manutenção
              de sessão autenticada. Não utilizamos cookies de rastreamento para publicidade de terceiros.
              Ao usar o FreelanceFlow, você concorda com o uso desses cookies essenciais.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Menores de idade</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              O FreelanceFlow é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente
              dados de menores de idade. Se identificarmos tal situação, os dados serão excluídos imediatamente.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Alterações nesta política</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Quando houver alterações
              relevantes, notificaremos por e-mail ou por aviso na plataforma. O uso continuado do
              serviço após a notificação implica aceite das alterações.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contato e encarregado (DPO)</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Para dúvidas, solicitações ou reclamações relacionadas à privacidade dos seus dados:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 space-y-1">
              <p><strong>FreelanceFlow</strong></p>
              <p>
                E-mail:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-green-600 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>Site: <a href="https://freelanceflow.com.br" className="text-green-600 hover:underline">freelanceflow.com.br</a></p>
            </div>
            <p className="text-gray-500 text-xs mt-3">
              Você também pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD)
              em{' '}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                gov.br/anpd
              </a>
              .
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} FreelanceFlow · Todos os direitos reservados ·{' '}
            <Link href="/privacidade" className="hover:text-gray-600 transition-colors">Política de Privacidade</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
