import React, { useState } from 'react';
import {
  FileDown,
  Printer,
  Copy,
  Check,
  Server,
  Layers,
  ShieldCheck,
  Database,
  Cloud,
  Smartphone,
  Cpu,
  BookOpen,
} from 'lucide-react';
import { Button } from './UI/Button.tsx';

export const ArquiteturaDocModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = () => {
    // Generate an HTML-based document file that Microsoft Word / LibreOffice natively opens as a DOCX/DOC document
    const htmlContent = `
<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Documento de Arquitetura - UniControl</title>
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; }
    h1 { color: #1e3a8a; font-size: 20pt; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
    h2 { color: #1e40af; font-size: 14pt; margin-top: 18pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
    h3 { color: #2563eb; font-size: 12pt; margin-top: 12pt; }
    table { width: 100%; border-collapse: collapse; margin-top: 10pt; margin-bottom: 15pt; }
    th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
    .badge { background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
    .header-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
    code { background-color: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 10pt; }
    ul { margin-top: 4px; margin-bottom: 10px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="header-box">
    <h1>Documento de Arquitetura de Software</h1>
    <p><strong>Projeto:</strong> UniControl - Sistema de Controle de Empréstimo de Equipamentos</p>
    <p><strong>Versão:</strong> 2.4 | <strong>Padrão Arquitetural:</strong> Full-Stack Desacoplado (SPA + REST API + Cloud Native)</p>
    <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
  </div>

  <h2>1. Visão Geral da Arquitetura</h2>
  <p>O <strong>Sistema de Controle de Empréstimo de Equipamentos (UniControl)</strong> foi concebido seguindo os princípios de uma <strong>Arquitetura Full-Stack Moderna, Desacoplada e Orientada a Serviços (RESTful)</strong>, estabelecendo uma separação estrita entre a camada de apresentação (SPA/PWA), a camada de serviços e regras de negócio (API Backend) e a camada de persistência estruturada com integridade referencial.</p>

  <h2>2. Tecnologias Escolhidas e Justificativas Técnicas</h2>

  <h3>2.1. Camada de Apresentação (Front-end Web & Mobile)</h3>
  <ul>
    <li><strong>React 18 (com TypeScript):</strong> Arquitetura modular orientada a componentes funcionais e hooks, gerenciamento reativo de estado via Context API e tipagem estática rigorosa que previne erros em tempo de desenvolvimento.</li>
    <li><strong>Vite:</strong> Bundler de última geração com suporte a ES Modules, fornecendo compilação ultra-rápida, otimização de assets e empacotamento estático para produção.</li>
    <li><strong>Tailwind CSS v4 (Tema "Sleek Interface"):</strong> Framework utilitário com paleta institucional (Slate/Blue/Emerald/Red), tipografia otimizada, design tokens e grid flexível para alta legibilidade.</li>
    <li><strong>Lucide React:</strong> Biblioteca de ícones vetoriais padronizados para sinalização de estados operacionais, status de devoluções e recibos.</li>
  </ul>

  <h3>2.2. Experiência Mobile & Responsividade</h3>
  <ul>
    <li><strong>Design Mobile-First:</strong> Interface adaptativa compatível com monitores desktop, tablets/iPads e smartphones (Android/iOS).</li>
    <li><strong>Menu Lateral Retrátil (Drawer):</strong> Menu responsivo com transições suaves que se recolhe em telas menores.</li>
    <li><strong>Alvos de Toque Ergonômicos:</strong> Botões e campos com dimensão mínima de 44px para facilidade de uso em campo.</li>
  </ul>

  <h3>2.3. Camada de Aplicação e Servidor (Back-end)</h3>
  <ul>
    <li><strong>Node.js com Express (TypeScript):</strong> Runtime assíncrono de alta performance com arquitetura RESTful não bloqueante.</li>
    <li><strong>Autenticação & Autorização RBAC (Role-Based Access Control):</strong> Sessões gerenciadas via JSON Web Tokens (JWT) com verificação estrita de perfis (Administrador, Docente, Aluno) nos middlewares do servidor.</li>
    <li><strong>Motor de Regras de Negócio:</strong> Verificação automática de atrasos com bloqueio preventivo, validação de dígitos verificadores de CPF/CNPJ, controle de unicidade de número de série e fluxo de vistoria com apontamento de avarias.</li>
  </ul>

  <h3>2.4. Camada de Banco de Dados e Persistência</h3>
  <ul>
    <li><strong>Modelo Estruturado Relacional:</strong> Entidades bem definidas (Pessoas PF, Fornecedores PJ, Equipamentos, Empréstimos e Itens Pivot).</li>
    <li><strong>Integridade Referencial & Concorrência:</strong> Prevenção de empréstimos duplicados simultâneos do mesmo item e garantia de consistência de inventário através de operações atômicas.</li>
  </ul>

  <h3>2.5. Infraestrutura, Nuvem e Deploy</h3>
  <ul>
    <li><strong>Google Cloud Platform (GCP) / Cloud Run:</strong> Containers gerenciados OCI/Docker com escalabilidade serverless automática e isolamento de processos.</li>
    <li><strong>Nginx Reverse Proxy:</strong> Roteamento seguro de tráfego HTTPS na porta 3000.</li>
    <li><strong>Pipeline de Build Unificado:</strong> Produção automatizada gerando bundle Node.js CommonJS compilado via <code>esbuild</code> e arquivos estáticos da SPA via <code>vite build</code>.</li>
  </ul>

  <h2>3. Tabela Resumo da Pilha Tecnológica (Tech Stack)</h2>
  <table>
    <thead>
      <tr>
        <th>Camada</th>
        <th>Tecnologia Principal</th>
        <th>Papel no Sistema</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Front-end</strong></td>
        <td>React 18 + TypeScript</td>
        <td>Interface de usuário declarativa, reativa e tipada</td>
      </tr>
      <tr>
        <td><strong>Estilização</strong></td>
        <td>Tailwind CSS v4</td>
        <td>Design System institucional ("Sleek Interface")</td>
      </tr>
      <tr>
        <td><strong>Build Tool</strong></td>
        <td>Vite</td>
        <td>Compilação, empacotamento e otimização de assets</td>
      </tr>
      <tr>
        <td><strong>Back-end</strong></td>
        <td>Node.js + Express</td>
        <td>API RESTful, autorização RBAC e motor de regras</td>
      </tr>
      <tr>
        <td><strong>Autenticação</strong></td>
        <td>JWT (JSON Web Tokens)</td>
        <td>Controle de sessão e validação de permissões</td>
      </tr>
      <tr>
        <td><strong>Banco de Dados</strong></td>
        <td>Estruturado / Relacional</td>
        <td>Persistência de cadastros, empréstimos e histórico</td>
      </tr>
      <tr>
        <td><strong>Nuvem & Servidores</strong></td>
        <td>Google Cloud (Cloud Run)</td>
        <td>Hospedagem em containers e escalabilidade automática</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Arquitetura_UniControl_Sistema_Emprestimos.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const markdownContent = `# Documento de Arquitetura de Software: Sistema UniControl

## 1. Visão Geral da Arquitetura
O Sistema de Controle de Empréstimo de Equipamentos (UniControl) segue o padrão de Arquitetura Full-Stack Moderna, Desacoplada e Orientada a Serviços (RESTful).

## 2. Tecnologias Escolhidas e Justificativas Técnicas

### 2.1. Camada de Apresentação (Front-end Web)
- React 18 com TypeScript
- Vite
- Tailwind CSS v4 (Tema "Sleek Interface")
- Lucide React

### 2.2. Experiência Mobile & Responsividade
- Design Mobile-First (responsivo para smartphones, tablets e desktops)
- Menu lateral retrátil e tabelas com rolagem adaptativa
- Alvos de toque ergonômicos (>= 44px)

### 2.3. Camada de Servidor & API (Back-end)
- Node.js com Express e TypeScript
- Autenticação e Autorização via JWT com RBAC (Administrador, Docente, Aluno)
- Motor de regras de negócio com bloqueio preventivo por atrasos e verificação de avarias

### 2.4. Banco de Dados e Persistência
- Banco de Dados Estruturado com Integridade Relacional (PF, PJ, Equipamentos, Empréstimos e Itens)
- Transições atômicas de status e controle rigoroso de concorrência

### 2.5. Infraestrutura e Nuvem
- Google Cloud Platform (GCP) / Cloud Run com containers gerenciados
- Nginx Reverse Proxy
- Pipeline com esbuild e Vite`;

    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Documento de Arquitetura de Software</h3>
              <p className="text-xs text-slate-500">Explicativo de tecnologias, banco de dados, frameworks e nuvem</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
              onClick={handlePrint}
              title="Imprimir ou Salvar como PDF"
            >
              <span className="hidden sm:inline">Imprimir / Salvar PDF</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FileDown className="w-4 h-4" />}
              onClick={handleDownloadDocx}
              title="Baixar em formato Word (.DOC / .DOCX)"
            >
              Baixar Word (.doc)
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body - Printable Section */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-800 text-sm leading-relaxed printable-document">
          {/* Box institucional */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Documentação Técnica Oficial
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">UniControl — Sistema de Empréstimos</h2>
              <p className="text-xs text-slate-500">Padrão Arquitetural: Full-Stack Desacoplado (SPA + REST API + Cloud Native)</p>
            </div>
            <div className="text-right text-xs text-slate-400 hidden sm:block">
              <p>Versão: 2.4</p>
              <p>Data: {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Seção 1 */}
          <div className="space-y-3">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              1. Visão Geral da Arquitetura
            </h4>
            <p className="text-slate-600">
              O sistema foi construído sobre uma <strong>arquitetura desacoplada em três camadas</strong>: Apresentação (SPA/PWA reativa), Aplicação (API RESTful com validação no servidor) e Persistência de Dados Relacional. Esse formato proporciona escalabilidade independente, alta segurança e rápida resposta aos usuários em campo.
            </p>
          </div>

          {/* Grid de Cards de Tecnologias */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front-end */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Layers className="w-4 h-4" />
                <span>Front-end & Web Framework</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>React 18 + TypeScript:</strong> Componentização moderna, reatividade com Hooks e segurança estática de tipos.</li>
                <li><strong>Vite:</strong> Bundler de alta velocidade com suporte a Hot Module Reload e otimização para produção.</li>
                <li><strong>Tailwind CSS v4:</strong> Design system institucional ("Sleek Interface") com paleta de alto contraste.</li>
                <li><strong>Lucide React:</strong> Biblioteca de ícones vetoriais consistentes e acessíveis.</li>
              </ul>
            </div>

            {/* Mobile */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Experiência Mobile & Responsividade</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Layout Mobile-First:</strong> Adaptabilidade fluida para smartphones, tablets e monitores widescreen.</li>
                <li><strong>Menu Lateral Retrátil (Drawer):</strong> Navegação com toque ergonômico e transições leves.</li>
                <li><strong>Alvos de Toque Otimizados:</strong> Botões e campos dimensionados em ≥ 44px para operação em trânsito.</li>
                <li><strong>Tabelas com Scroll Adaptativo:</strong> Visualização de patrimônio sem corte de informações.</li>
              </ul>
            </div>

            {/* Back-end */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm">
                <Server className="w-4 h-4" />
                <span>Back-end & Regras de Negócio</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Node.js + Express (TypeScript):</strong> Servidor RESTful assíncrono e não-bloqueante.</li>
                <li><strong>Segurança RBAC (JWT):</strong> Permissões estritas por perfil (Administrador, Docente, Aluno).</li>
                <li><strong>Motor de Prazos e Avarias:</strong> Bloqueio automático de usuários inadimplentes e encaminhamento a reparo.</li>
                <li><strong>Validação no Servidor:</strong> Checagem de CPF/CNPJ válidos e número de série único.</li>
              </ul>
            </div>

            {/* Banco de dados e Nuvem */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Cloud className="w-4 h-4" />
                <span>Banco de Dados & Nuvem</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-600 list-disc list-inside">
                <li><strong>Persistência Estruturada:</strong> Modelagem relacional com integridade referencial e tabela pivot de itens.</li>
                <li><strong>Google Cloud (Cloud Run):</strong> Hospedagem em containers Docker/OCI com escalabilidade serverless.</li>
                <li><strong>Nginx Proxy Reverso:</strong> Roteamento seguro de requisições HTTPS na porta 3000.</li>
                <li><strong>Controle de Concorrência:</strong> Bloqueio atômico de empréstimos duplicados do mesmo item.</li>
              </ul>
            </div>
          </div>

          {/* Tabela Comparativa */}
          <div className="space-y-3 pt-2">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Database className="w-4 h-4 text-blue-600" />
              2. Matriz Resumo da Pilha Tecnológica
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Camada</th>
                    <th className="p-3">Tecnologia</th>
                    <th className="p-3">Papel no Sistema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Front-end</td>
                    <td className="p-3 font-mono text-blue-600">React 18 + TypeScript</td>
                    <td className="p-3">Interface reativa, tipada e declarativa</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Estilização</td>
                    <td className="p-3 font-mono text-blue-600">Tailwind CSS v4</td>
                    <td className="p-3">Design System institucional ("Sleek Interface")</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Build & Tooling</td>
                    <td className="p-3 font-mono text-blue-600">Vite</td>
                    <td className="p-3">Compilação e empacotamento rápido</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Back-end</td>
                    <td className="p-3 font-mono text-purple-600">Node.js + Express</td>
                    <td className="p-3">API RESTful e motor de regras de negócio</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Autenticação</td>
                    <td className="p-3 font-mono text-purple-600">JWT (JSON Web Token)</td>
                    <td className="p-3">Controle de acesso baseado em papéis (RBAC)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Banco de Dados</td>
                    <td className="p-3 font-mono text-amber-600">Estruturado / Relacional</td>
                    <td className="p-3">Persistência atômica com integridade referencial</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Nuvem / Servidores</td>
                    <td className="p-3 font-mono text-emerald-600">Google Cloud (Cloud Run)</td>
                    <td className="p-3">Containers gerenciados e escalabilidade serverless</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Markdown Copiado!' : 'Copiar em Markdown'}
            </button>
            <span className="text-xs text-slate-400 hidden sm:inline">• Dica: no diálogo de impressão, escolha "Salvar como PDF"</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={onClose} className="w-full sm:w-auto">
              Fechar
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FileDown className="w-4 h-4" />}
              onClick={handleDownloadDocx}
              className="w-full sm:w-auto"
            >
              Baixar Word (.doc)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
