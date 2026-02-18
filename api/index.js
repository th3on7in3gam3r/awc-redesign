// Vercel Serverless Function wrapper for Express app
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
            stack: error.stack
        });
    }
}
