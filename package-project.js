
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Verificar dependências e instalar se necessário
async function checkDependencies() {
  console.log('🔍 Verificando dependências...');
  
  try {
    // Verificar se archiver está instalado
    require.resolve('archiver');
    console.log('✅ Dependência "archiver" já está instalada');
  } catch (e) {
    console.log('⚠️ Dependência "archiver" não encontrada, instalando...');
    runCommand('npm install archiver --save');
  }
  
  try {
    // Verificar se @google-cloud/storage está instalado
    require.resolve('@google-cloud/storage');
    console.log('✅ Dependência "@google-cloud/storage" já está instalada');
  } catch (e) {
    console.log('⚠️ Dependência "@google-cloud/storage" não encontrada, instalando...');
    runCommand('npm install @google-cloud/storage --save');
  }
}

// Empacotar projeto em um arquivo ZIP
async function packageProject() {
  console.log('\n📦 Empacotando projeto...');
  runCommand('node zipProject.js');
}

// Fazer upload do pacote para o Storage
async function uploadPackage() {
  console.log('\n☁️ Fazendo upload do pacote...');
  runCommand('node uploadToStorage.js');
}

// Sincronizar com GitHub se fornecidos os parâmetros
async function syncWithGitHub() {
  // Obter argumentos da linha de comando
  const [,, REPO_URL, TOKEN] = process.argv;
  
  if (REPO_URL) {
    console.log('\n🔄 Sincronizando com GitHub...');
    if (TOKEN) {
      runCommand(`node github-sync.js "${REPO_URL}" "${TOKEN}"`);
    } else {
      runCommand(`node github-sync.js "${REPO_URL}"`);
    }
  } else {
    console.log('\n⚠️ URL do GitHub não fornecida, pulando sincronização.');
    console.log('Para sincronizar com o GitHub, execute:');
    console.log('node package-project.js <URL_GITHUB> [TOKEN_GITHUB]');
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando processo de empacotamento e publicação do projeto Já Comprei...\n');
  
  // Executar passos em sequência
  await checkDependencies();
  await packageProject();
  await uploadPackage();
  await syncWithGitHub();
  
  console.log('\n✨ Processo concluído com sucesso!');
}

// Executar função principal
main().catch(error => {
  console.error('❌ Erro no processo:', error.message);
});
