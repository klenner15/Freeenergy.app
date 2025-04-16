
const { spawn } = require('child_process');

console.log('🔍 Iniciando processo de empacotamento do projeto JáComprei.app');

// Função para executar um comando de forma assíncrona
function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Executando: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, { stdio: 'inherit' });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`O comando falhou com código ${code}`));
      }
    });
    
    process.on('error', (err) => {
      reject(err);
    });
  });
}

async function packageProject() {
  try {
    // Passo 1: Criar o arquivo ZIP
    console.log('📦 Criando arquivo ZIP do projeto...');
    await runCommand('node', ['zipProject.js']);
    
    // Passo 2: Fazer upload para o Object Storage
    console.log('☁️ Fazendo upload para o Object Storage...');
    await runCommand('node', ['uploadToStorage.js']);
    
    console.log('✅ Processo concluído com sucesso!');
    console.log('👉 O arquivo ZIP está disponível no Object Storage do seu Repl');
    console.log('👉 Acesse a aba "Object Storage" no painel do Replit para gerenciar seus arquivos');
    
  } catch (error) {
    console.error('❌ Erro durante o processo:', error.message);
  }
}

packageProject();
