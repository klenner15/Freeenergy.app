
const { execSync } = require('child_process');
const fs = require('fs');

// Obter argumentos da linha de comando
const [,, REPO_URL, TOKEN] = process.argv;

// Verificar se os argumentos necessários foram fornecidos
if (!REPO_URL) {
  console.error('❌ URL do repositório não fornecida.');
  console.error('Uso: node github-sync.js <URL_REPOSITORIO> [TOKEN_GITHUB]');
  console.error('Exemplo: node github-sync.js https://github.com/usuario/repo.git TOKEN_GITHUB');
  process.exit(1);
}

// Função para executar comandos e exibir a saída
function runCommand(command, hideOutput = false) {
  console.log(`Executando: ${command}`);
  try {
    const options = { encoding: 'utf8', stdio: hideOutput ? 'pipe' : 'inherit' };
    const output = execSync(command, options);
    if (hideOutput && output) {
      console.log('✅ Comando executado com sucesso');
    }
    return output;
  } catch (error) {
    console.error(`❌ Erro ao executar comando: ${command}`);
    console.error(error.message);
    return null;
  }
}

// Sincronizar com o GitHub
async function syncWithGitHub() {
  try {
    console.log('🔄 Iniciando sincronização com GitHub...');
    
    // Configurar git com valores seguros
    runCommand('git config --global user.name "Replit User"');
    runCommand('git config --global user.email "user@replit.com"');
    
    // Verificar se o diretório .git existe
    const gitExists = fs.existsSync('.git');
    
    if (!gitExists) {
      console.log('📁 Inicializando repositório Git...');
      runCommand('git init');
    }

    // Adicionar todos os arquivos
    console.log('📋 Adicionando arquivos ao Git...');
    runCommand('git add .');

    // Criar commit
    console.log('💾 Criando commit...');
    const commitResult = runCommand('git commit -m "Projeto Já Comprei - Sincronização automática"', true);
    
    if (!commitResult) {
      console.log("⚠️ Não há alterações para commit ou houve um problema. Tentando configurar autor manualmente.");
      runCommand('git config --global --add safe.directory "$(pwd)"');
      runCommand('git commit --allow-empty -m "Projeto Já Comprei - Sincronização automática"', true);
    }

    // Configurar repositório remoto com token
    console.log('🔗 Configurando repositório remoto...');
    runCommand('git remote rm origin 2>/dev/null || true');
    
    if (TOKEN) {
      // Usar token na URL (formato seguro)
      const repoUrlWithToken = REPO_URL.replace('https://', `https://x-access-token:${TOKEN}@`);
      runCommand(`git remote add origin ${repoUrlWithToken}`, true);
    } else {
      runCommand(`git remote add origin ${REPO_URL}`);
    }

    // Forçar push para o repositório
    console.log('⬆️ Enviando alterações para GitHub...');
    try {
      runCommand('git push -f origin main', true);
    } catch (error) {
      console.log("⚠️ Push para 'main' falhou. Tentando push para branch 'master'...");
      runCommand('git push -f origin master', true);
    }

    console.log('✅ Sincronização com GitHub concluída com sucesso!');
  } catch (error) {
    console.error('❌ Falha na sincronização com GitHub:', error.message);
  }
}

// Executar a sincronização
syncWithGitHub();
