import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { getDB } from './src/server/db.ts';
import { authRouter } from './src/server/routes/auth.ts';
import { pessoasRouter } from './src/server/routes/pessoas.ts';
import { fornecedoresRouter } from './src/server/routes/fornecedores.ts';
import { equipamentosRouter } from './src/server/routes/equipamentos.ts';
import { emprestimosRouter } from './src/server/routes/emprestimos.ts';
import { devolucoesRouter } from './src/server/routes/devolucoes.ts';
import { notificacoesRouter } from './src/server/routes/notificacoes.ts';
import { dashboardRouter } from './src/server/routes/dashboard.ts';
import { historicoRouter } from './src/server/routes/historico.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Inicializa banco de dados e verifica atrasos na inicialização
  try {
    const db = getDB();
    console.log(`[Database] Inicializado com ${db.pessoas.length} usuários, ${db.equipamentos.length} equipamentos, ${db.emprestimos.length} empréstimos.`);
  } catch (err) {
    console.error('[Database] Erro ao inicializar banco de dados:', err);
  }

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // REST API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/pessoas', pessoasRouter);
  app.use('/api/fornecedores', fornecedoresRouter);
  app.use('/api/equipamentos', equipamentosRouter);
  app.use('/api/emprestimos', emprestimosRouter);
  app.use('/api/devolucoes', devolucoesRouter);
  app.use('/api/notificacoes', notificacoesRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/historico', historicoRouter);

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Servidor] Sistema de Controle de Empréstimos rodando na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Falha fatal ao iniciar o servidor:', err);
});
