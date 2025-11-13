// Healthcheck: GET /api/health
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }
  res.status(200).json({ ok: true, status: 'healthy' });
}
