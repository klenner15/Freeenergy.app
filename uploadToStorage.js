
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

async function uploadToStorage() {
  try {
    // Verificar se o arquivo existe
    const fileName = 'jacomprei-app.zip';
    if (!fs.existsSync(fileName)) {
      console.error(`❌ Arquivo ${fileName} não encontrado. Execute primeiro o script zipProject.js`);
      return;
    }

    // Verificar se o ID do bucket está configurado
    const configFile = fs.readFileSync('.replit', 'utf8');
    const bucketIdMatch = configFile.match(/defaultBucketID\s*=\s*"([^"]+)"/);
    
    if (!bucketIdMatch) {
      console.error('❌ ID do bucket não encontrado no arquivo .replit');
      console.error('👉 Crie um bucket no painel do Object Storage do Replit primeiro');
      return;
    }
    
    const bucketId = bucketIdMatch[1];
    console.log(`📦 Usando bucket: ${bucketId}`);

    // Configurar o cliente de storage
    const storage = new Storage();
    const bucket = storage.bucket(bucketId);
    
    // Iniciar o upload
    console.log(`🚀 Iniciando upload de ${fileName}...`);
    
    await bucket.upload(fileName, {
      destination: fileName,
      metadata: {
        contentType: 'application/zip',
      },
    });
    
    console.log(`✅ Upload concluído com sucesso!`);
    console.log(`🔗 O arquivo está disponível no Object Storage do seu Repl`);
    console.log(`📝 Você pode acessá-lo pela aba "Object Storage" no painel do Replit`);
    
  } catch (error) {
    console.error('❌ Erro durante o upload:', error.message);
  }
}

uploadToStorage();
