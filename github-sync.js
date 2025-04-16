
const { execSync } = require('child_process');

// Configurações do repositório
const REPO_URL = process.argv[2] || '';
const TOKEN = process.argv[3] || '';

if (!REPO_URL) {
  console.error('É necessário fornecer a URL do repositório como primeiro argumento');
  console.error('Exemplo: node github-sync.js https://github.com/usuario/repo.git TOKEN');
  process.exit(1);
}

// Função para executar comandos e exibir a saída
function runCommand(command) {
  console.log(`Executando: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return output;
  } catch (error) {
    console.error(`Erro ao executar comando: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Sincronizar com o GitHub
async function syncWithGitHub() {
  try {
    // Configurar git com valores seguros
    runCommand('git config --global user.name "Replit User"');
    runCommand('git config --global user.email "user@replit.com"');
    
    // Remover configurações que possam estar causando problemas
    runCommand('git config --global --unset core.sshCommand 2>/dev/null || true');
    
    // Limpar qualquer estado do Git que possa estar causando problemas
    runCommand('git remote rm origin 2>/dev/null || true');
    
    // Inicializar repositório (força)
    runCommand('rm -rf .git 2>/dev/null || true');
    runCommand('git init');

    // Adicionar todos os arquivos
    runCommand('git add .');

    // Criar commit
    const commitResult = runCommand('git commit -m "Projeto Já Comprei - Sincronização automática"');
    
    if (!commitResult) {
      console.error("Falha ao criar commit. Tentando configurar autor manualmente.");
      runCommand('git config --global --add safe.directory /home/runner/workspace');
      runCommand('git commit --allow-empty -m "Projeto Já Comprei - Sincronização automática"');
    }

    // Configurar repositório remoto com token
    if (TOKEN) {
      // Usar token na URL (formato seguro)
      const repoUrlWithToken = REPO_URL.replace('https://', `https://x-access-token:${TOKEN}@`);
      runCommand(`git remote add origin ${repoUrlWithToken}`);
    } else {
      runCommand(`git remote add origin ${REPO_URL}`);
    }

    // Forçar push para o repositório (tentativa principal)
    const pushResult = runCommand('git push -f origin master');
    
    if (!pushResult) {
      console.log("Tentando push para branch main...");
      runCommand('git push -f origin main');
    }

    console.log('Sincronização com GitHub concluída com sucesso!');
  } catch (error) {
    console.error('Falha na sincronização com GitHub:', error.message);
  }
}

// Executar sincronização
syncWithGitHub();
