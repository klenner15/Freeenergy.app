
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Iniciando empacotamento do projeto...');

// Criar arquivo de saída
const outputPath = 'jacomprei-projeto.zip';
const output = fs.createWriteStream(outputPath);

// Inicializar archiver
const archive = archiver('zip', {
  zlib: { level: 9 } // Nível máximo de compressão
});

// Escutar eventos do archiver
output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Arquivo ZIP criado com sucesso: ${outputPath}`);
  console.log(`   Tamanho total: ${sizeInMB} MB`);
});

archive.on('warning', (err) => {
  if (err.code === 'ENOENT') {
    console.warn(`⚠️ Aviso: ${err.message}`);
  } else {
    throw err;
  }
});

archive.on('error', (err) => {
  console.error(`❌ Erro ao criar arquivo ZIP: ${err.message}`);
  throw err;
});

// Diretórios e arquivos a excluir
const excludeDirs = ['.git', 'node_modules', 'dist'];
const excludeFiles = ['.replit', '.gitignore', 'jacomprei-projeto.zip'];

// Função para verificar se um item deve ser excluído
function shouldExclude(name) {
  return excludeDirs.includes(name) || excludeFiles.includes(name);
}

// Conectar archiver ao output stream
archive.pipe(output);

// Adicionar arquivos e diretórios ao arquivo ZIP
const rootDir = './';
const files = fs.readdirSync(rootDir);

files.forEach((file) => {
  const filePath = path.join(rootDir, file);
  const stat = fs.statSync(filePath);
  
  // Verificar se o item deve ser excluído
  if (shouldExclude(file)) {
    return;
  }
  
  if (stat.isDirectory()) {
    console.log(`📁 Adicionando diretório: ${file}`);
    archive.directory(filePath, file);
  } else {
    console.log(`📄 Adicionando arquivo: ${file}`);
    archive.file(filePath, { name: file });
  }
});

// Finalizar o arquivo
archive.finalize();
