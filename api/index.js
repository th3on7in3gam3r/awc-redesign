// Vercel Serverless Function wrapper for Express app
import express from 'express';

export default async function handler(req, res) {
    try {
        const { default: app } = await import('../awc-admin/index.js');
        return app(req, res);
    } catch (error) {
        console.error('Vercel Bootstrap Error:', error);
        res.status(500).json({
            error: 'VERCEL_BOOTSTRAP_ERROR',
            message: error.message,
            stack: error.stack,
            env_check: {
                DATABASE_URL: !!process.env.DATABASE_URL,
                VITE_YOUTUBE_API_KEY: !!process.env.VITE_YOUTUBE_API_KEY,
                VITE_YOUTUBE_CHANNEL_ID: !!process.env.VITE_YOUTUBE_CHANNEL_ID
            }
        });
    }
}
