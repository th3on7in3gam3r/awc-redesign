import { prisma } from '../server/lib/prisma.js';

export default async function handler(req, res) {
  try {
    console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('🔍 Prisma client available:', !!prisma);

    const { published, search, type, series, speaker, year } = req.query;
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'pastor');

    // Build Prisma where clause
    const where = {};

    // Filter by published status
    if (!isAdmin || published === 'true') {
      where.is_published = true;
    } else if (published === 'false') {
      where.is_published = false;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { scripture: { contains: search, mode: 'insensitive' } },
        { speaker: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    // Series filter
    if (series && series !== 'all') {
      where.series = series;
    }

    // Speaker filter
    if (speaker && speaker !== 'all') {
      where.speaker = speaker;
    }

    // Year filter
    if (year && year !== 'all') {
      const yearInt = parseInt(year);
      where.preached_at = {
        gte: new Date(`${yearInt}-01-01`),
        lt: new Date(`${yearInt + 1}-01-01`)
      };
    }

    const sermons = await prisma.sermons.findMany({
      where,
      orderBy: { preached_at: 'desc' }
    });

    return res.status(200).json(sermons);
  } catch (error) {
    console.error('❌ Sermons API Error:', error);
    return res.status(500).json({
      error: 'SERMONS_API_ERROR',
      message: error.message
    });
  }
}
