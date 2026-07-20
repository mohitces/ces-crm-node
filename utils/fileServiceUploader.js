const FormData = require('form-data');
const fetchFn = require('node-fetch');

const uploadToFileService = async (buffer, originalname, project = 'default', folder = 'misc') => {
  try {
    const form = new FormData();
    form.append('image', buffer, { filename: originalname || 'image.jpg' });

    const fileServiceUrlBase = process.env.FILE_SERVICE_URL || 'http://localhost:4000/api/upload';
    const fileServiceUrl = `${fileServiceUrlBase}?project=${encodeURIComponent(project)}&folder=${encodeURIComponent(folder)}`;
    const apiKey = process.env.FILE_SERVICE_API_KEY || 'ces_file_service_secret_key_123';

    const response = await fetchFn(fileServiceUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        ...form.getHeaders()
      },
      body: form
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[FILE_SERVICE] Error response:', text);
      throw new Error(`File service responded with ${response.status}: ${text}`);
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error('File Service Upload failed:', error);
    throw error;
  }
};

module.exports = {
  uploadToFileService,
};
