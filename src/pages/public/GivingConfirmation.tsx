import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { HandHeart, Loader2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { fetchGivingStatus } from '../../services/givingService';

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const GivingConfirmation: React.FC = () => {
  const [params] = useSearchParams();
  const ref = params.get('ref') || '';
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(!!ref);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) return;
    fetchGivingStatus(ref)
      .then(setStatus)
      .catch(() => setError('We could not load your giving reference. Your provider may still have processed your gift.'))
      .finally(() => setLoading(false));
  }, [ref]);

  const isCompleted = status?.status === 'COMPLETED';
  const isFailed = status?.status === 'FAILED' || status?.status === 'CANCELED';

  return (
    <div className="bg-stone-50 min-h-screen py-16 px-6">
      <div className="max-w-lg mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-church-burgundy/10 mb-6">
          {loading ? (
            <Loader2 className="w-7 h-7 text-church-burgundy animate-spin" />
          ) : isCompleted ? (
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          ) : isFailed ? (
            <AlertCircle className="w-7 h-7 text-red-600" />
          ) : (
            <Clock className="w-7 h-7 text-church-burgundy" />
          )}
        </div>

        <h1 className="text-2xl font-serif font-bold text-church-burgundy mb-2">
          {isCompleted ? 'Thank you for giving!' : isFailed ? 'Gift not completed' : 'Thank you'}
        </h1>

        {loading ? (
          <p className="text-slate-600">Loading your giving status…</p>
        ) : error ? (
          <p className="text-slate-600">{error}</p>
        ) : (
          <>
            <p className="text-slate-600 mb-6">{status?.message}</p>
            {ref && (
              <p className="text-xs text-slate-500 mb-4">
                Reference: <span className="font-mono font-semibold">{ref}</span>
              </p>
            )}
            {status?.providerName && (
              <p className="text-sm text-slate-700">Provider: {status.providerName}</p>
            )}
            {status?.fundName && (
              <p className="text-sm text-slate-700">Fund: {status.fundName}</p>
            )}
            {status?.amountCents != null && (
              <p className="text-sm text-slate-700 mt-1">
                Amount: {formatCents(status.amountCents)}
                {!status.amountConfirmed && (
                  <span className="text-slate-500"> (pending confirmation)</span>
                )}
              </p>
            )}
          </>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/giving"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-church-burgundy text-white font-semibold rounded-xl"
          >
            <HandHeart className="w-5 h-5" />
            Give again
          </Link>
          <Link to="/" className="text-church-burgundy font-medium hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GivingConfirmation;
