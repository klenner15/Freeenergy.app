const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Criar um arquivo de saída para o arquivo zip
const output = fs.createWriteStream(path.join(__dirname, 'jacomprei-projeto.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Nível de compressão máxima
});

// Escutar por erros
archive.on('error', function(err) {
  throw err;
});

// Pipe de saída do arquivo para o arquivo zip
archive.pipe(output);

// Adicionar arquivos ao arquivo zip
const directories = [
  'client',
  'server',
  'shared',
];

const files = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'theme.json',
  '.gitignore',
  'drizzle.config.ts'
];

// Adicionar diretórios completos
directories.forEach(dir => {
  archive.directory(dir, dir);
});

// Adicionar arquivos individuais
files.forEach(file => {
  archive.file(file, { name: file });
});

// Finalizar o arquivo e fechar
archive.finalize();

console.log('Criando arquivo zip do projeto...');

output.on('close', function() {
  console.log(`Arquivo zip criado com sucesso: jacomprei-projeto.zip (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
  console.log('Você pode baixar este arquivo agora!');
});