import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // URL parametresini al
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parametresi gerekli' });
    }

    // API isteğini yap
    const response = await axios.get(url);

    // Yanıtı döndür
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'API isteği başarısız oldu' });
  }
} 