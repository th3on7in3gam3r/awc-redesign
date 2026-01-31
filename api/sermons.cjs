const { prisma } = require('./_prisma.cjs');

// Force Node.js runtime (not Edge)
exports.runtime = "nodejs";

module.exports = async function handler(req, res) {
  try {
    console.log('🔍 DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('🔍 Prisma client available:', !!prisma);

    const sermons = await prisma.sermons.findMany({
      where: { is_published: true },
      orderBy: { preached_at: 'desc' }
    });

    res.status(200).json(sermons);
  } catch (error) {
    console.error('❌ Sermons API Error:', error);
    res.status(500).json({
      error: 'SERMONS_API_ERROR',
      message: error.message
    });
  }
};
