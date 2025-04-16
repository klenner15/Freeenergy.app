
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

async function uploadToStorage() {
  try {
    // Verificar se o arquivo existe
    const fileName = 'jacomprei-projeto.zip';
    if (!fs.existsSync(fileName)) {
      console.error(`❌ Arquivo ${fileName} não encontrado. Execute primeiro o script zipProject.js`);
      return;
    }

    // Verificar se o ID do bucket está configurado
    const configFile = fs.existsSync('.replit') ? fs.readFileSync('.replit', 'utf8') : '';
    const bucketIdMatch = configFile.match(/defaultBucketID\s*=\s*"([^"]+)"/);
    
    if (!bucketIdMatch) {
      console.error('❌ ID do bucket do Replit não encontrado no arquivo .replit');
      return;
    }
    
    const bucketId = bucketIdMatch[1];
    console.log(`📋 Usando bucket Replit: ${bucketId}`);

    // Inicializar cliente do Storage
    const storage = new Storage();
    const bucket = storage.bucket(bucketId);
    
    // Nome do arquivo no bucket (usar timestamp para evitar conflitos)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const destinationName = `jacomprei-projeto-${timestamp}.zip`;
    
    console.log(`🔄 Iniciando upload para ${destinationName}...`);
    
    // Fazer upload do arquivo
    await bucket.upload(fileName, {
      destination: destinationName,
      metadata: {
        contentType: 'application/zip',
      },
    });
    
    console.log('✅ Upload concluído com sucesso!');
    console.log(`📦 Arquivo disponível em: gs://${bucketId}/${destinationName}`);
    
    // Gerar URL pública (válida por 1 semana)
    const [url] = await bucket.file(destinationName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 semana
    });
    
    console.log('🌐 URL para download (válida por 1 semana):');
    console.log(url);
    
  } catch (error) {
    console.error('❌ Erro ao fazer upload para o Storage:', error.message);
  }
}

// Executar a função
uploadToStorage();
