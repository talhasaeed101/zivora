import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AccountShell from '../../../components/account/AccountShell.jsx';
import Reveal from '../../../components/Reveal.jsx';
import { loyaltyApi } from '../../../services/api.js';
import { toast } from '../../../context/ToastContext.jsx';
import { usePrivatePageSeo } from '../../../hooks/useSEO.js';
import {
  REDEMPTION_MIN_POINTS,
  REDEMPTION_PKR_PER_POINT,
  createLoyaltyRedeemIdempotencyKey,
  formatLoyaltyDate,
  formatLoyaltyPoints,
  formatLoyaltyPkr,
  formatLoyaltySource,
  getLoyaltyRedeemValidationError,
  getLoyaltyTierProgress,
  parseLoyaltyRedeemInput,
} from '../../../utils/loyaltyDisplay.js';
import './DashboardLoyalty.css';

const HISTORY_PAGE_SIZE = 10;

const EARN_GUIDES = [
  {
    id: 'signup',
    icon: '🎉',
    title: 'Join Zivora',
    copy: 'Get 100 points when you create your account.',
  },
  {
    id: 'review',
    icon: '⭐',
    title: 'Review a Purchase',
    copy: 'Earn 50 points when you submit a product review.',
  },
  {
    id: 'order',
    icon: '💎',
    title: 'Complete a Purchase',
    copy: 'Earn 10 points for every 1,000 PKR of eligible merchandise spent after discounts.',
  },
];

function mapRedeemApiError(err) {
  const status = err?.status;
  const raw = String(err?.message || '').toLowerCase();

  if (status === 401 || status === 403) {
    return 'Please sign in again to redeem points.';
  }

  if (
    raw.includes('insufficient') ||
    raw.includes('not enough') ||
    raw.includes('balance')
  ) {
    return 'Insufficient loyalty points.';
  }

  if (
    status === 400 ||
    raw.includes('between') ||
    raw.includes('minimum') ||
    raw.includes('maximum') ||
    raw.includes('points') ||
    raw.includes('integer') ||
    raw.includes('idempotency')
  ) {
    return 'Enter between 100 and 5,000 points.';
  }

  return 'Unable to redeem points right now. Please try again.';
}

function isUncertainRedeemError(err) {
  if (!err) {
    return false;
  }

  if (err.name === 'AbortError') {
    return true;
  }

  if (!err.status) {
    return true;
  }

  return err.status >= 500;
}

function LoyaltySkeleton() {
  return (
    <div className="loyalty-skeleton" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your rewards</span>
      <div className="loyalty-skeleton-hero" />
      <div className="loyalty-skeleton-row">
        <span />
        <span />
      </div>
      <div className="loyalty-skeleton-block" />
      <div className="loyalty-skeleton-block" />
    </div>
  );
}

export default function DashboardLoyalty() {
  usePrivatePageSeo({
    title: 'Loyalty & Rewards',
    description: 'Your Zivora Rewards balance, tier, and points history. Private account page.',
    path: '/account/loyalty',
  });

  const [account, setAccount] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [redeemInput, setRedeemInput] = useState('');
  const [redeemFieldError, setRedeemFieldError] = useState('');
  const [redeemSubmitting, setRedeemSubmitting] = useState(false);
  const [lastRedeemResult, setLastRedeemResult] = useState(null);

  const redeemAttemptRef = useRef(null);
  const redeemInFlightRef = useRef(false);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [accountResponse, summaryResponse] = await Promise.all([
        loyaltyApi.getAccount(),
        loyaltyApi.getSummary(),
      ]);
      setAccount(accountResponse.data || null);
      setSummary(summaryResponse.data || null);
    } catch (err) {
      setAccount(null);
      setSummary(null);
      setError(err.message || 'Unable to load your rewards.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (nextPage) => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const response = await loyaltyApi.getHistory({
        page: nextPage,
        limit: HISTORY_PAGE_SIZE,
      });
      setHistory(response.data?.transactions || []);
      setPagination(response.data?.pagination || null);
      setPage(nextPage);
    } catch (err) {
      setHistory([]);
      setPagination(null);
      setHistoryError(err.message || 'Unable to load points history.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const refreshAfterRedeem = useCallback(async () => {
    const [accountResponse, summaryResponse] = await Promise.all([
      loyaltyApi.getAccount(),
      loyaltyApi.getSummary(),
    ]);
    setAccount(accountResponse.data || null);
    setSummary(summaryResponse.data || null);
    await loadHistory(1);
  }, [loadHistory]);

  useEffect(() => {
    loadAccount();
  }, [loadAccount, reloadToken]);

  useEffect(() => {
    if (!account) {
      return;
    }
    loadHistory(1);
  }, [account, loadHistory]);

  const handleRetry = () => {
    setReloadToken((value) => value + 1);
  };

  const balance = account?.balance ?? 0;
  const lifetimeEarned = account?.lifetimeEarned ?? 0;
  const lifetimeRedeemed = account?.lifetimeRedeemed ?? 0;
  const tier = account?.tier || 'Bronze';
  const progress = getLoyaltyTierProgress(lifetimeEarned, tier);
  const hasPrev = Boolean(pagination?.hasPrevPage);
  const hasNext = Boolean(pagination?.hasNextPage);
  const canRedeemByBalance = balance >= REDEMPTION_MIN_POINTS;

  const parsedRedeem = useMemo(() => parseLoyaltyRedeemInput(redeemInput), [redeemInput]);

  const redeemPreviewPoints =
    parsedRedeem.ok && parsedRedeem.points != null ? parsedRedeem.points : null;

  const redeemValidationError = useMemo(() => {
    if (!canRedeemByBalance) {
      return 'You need at least 100 points to redeem.';
    }

    if (!parsedRedeem.ok) {
      return parsedRedeem.error;
    }

    if (parsedRedeem.points == null) {
      return '';
    }

    return getLoyaltyRedeemValidationError(parsedRedeem.points, balance);
  }, [balance, canRedeemByBalance, parsedRedeem]);

  const discountPreview =
    redeemPreviewPoints != null ? redeemPreviewPoints * REDEMPTION_PKR_PER_POINT : null;

  const canSubmitRedeem =
    canRedeemByBalance &&
    !redeemSubmitting &&
    parsedRedeem.ok &&
    parsedRedeem.points != null &&
    !getLoyaltyRedeemValidationError(parsedRedeem.points, balance);

  const handleRedeemInputChange = (event) => {
    const next = event.target.value;
    setRedeemInput(next);
    setRedeemFieldError('');
    setLastRedeemResult(null);

    const nextParsed = parseLoyaltyRedeemInput(next);
    if (
      redeemAttemptRef.current &&
      (!nextParsed.ok || nextParsed.points !== redeemAttemptRef.current.points)
    ) {
      // Amount changed or cleared — next submit is a new attempt
      redeemAttemptRef.current = null;
    }
  };

  const handleRedeemSubmit = async (event) => {
    event.preventDefault();

    if (redeemInFlightRef.current || redeemSubmitting) {
      return;
    }

    if (!canRedeemByBalance) {
      setRedeemFieldError('You need at least 100 points to redeem.');
      return;
    }

    const parsed = parseLoyaltyRedeemInput(redeemInput);
    if (!parsed.ok) {
      setRedeemFieldError(parsed.error);
      return;
    }

    const validationError = getLoyaltyRedeemValidationError(parsed.points, balance);
    if (validationError) {
      setRedeemFieldError(validationError);
      return;
    }

    const points = parsed.points;
    let attempt = redeemAttemptRef.current;
    if (!attempt || attempt.points !== points) {
      attempt = {
        points,
        key: createLoyaltyRedeemIdempotencyKey(),
      };
      redeemAttemptRef.current = attempt;
    }

    redeemInFlightRef.current = true;
    setRedeemSubmitting(true);
    setRedeemFieldError('');

    try {
      const response = await loyaltyApi.redeem({
        points,
        idempotencyKey: attempt.key,
      });

      const data = response.data || {};
      const redeemedPoints = Number(data.redeemedPoints) || points;
      const discountValue = Number.isFinite(Number(data.discountValue))
        ? Number(data.discountValue)
        : redeemedPoints * REDEMPTION_PKR_PER_POINT;

      setLastRedeemResult({
        redeemedPoints,
        discountValue,
        replayed: Boolean(data.replayed),
      });
      setRedeemInput('');
      redeemAttemptRef.current = null;

      toast.success(
        `${formatLoyaltyPoints(redeemedPoints)} points redeemed successfully. You have ${formatLoyaltyPkr(discountValue)} in loyalty discount value.`
      );

      try {
        await refreshAfterRedeem();
      } catch {
        if (typeof data.balance === 'number') {
          setAccount((prev) => (prev ? { ...prev, balance: data.balance } : prev));
        }
      }
    } catch (err) {
      const message = mapRedeemApiError(err);
      setRedeemFieldError(message);
      toast.error(message);

      // Keep the same idempotency key only for uncertain failures (retry-safe).
      if (!isUncertainRedeemError(err)) {
        redeemAttemptRef.current = null;
      }
    } finally {
      redeemInFlightRef.current = false;
      setRedeemSubmitting(false);
    }
  };

  return (
    <AccountShell
      active="loyalty"
      title="Zivora Rewards"
      description="Earn points, unlock higher tiers, and enjoy more rewards."
    >
      <div className="loyalty-page">
        {loading ? <LoyaltySkeleton /> : null}

        {!loading && error ? (
          <div className="loyalty-state loyalty-state-error" role="alert">
            <h2 className="loyalty-state-title">Unable to load your rewards.</h2>
            <p className="loyalty-state-copy">Please try again in a moment.</p>
            <button type="button" className="loyalty-state-btn" onClick={handleRetry}>
              Try Again
            </button>
          </div>
        ) : null}

        {!loading && !error && account ? (
          <>
            <Reveal className="loyalty-tier-card" variant="fade-up">
              <div className="loyalty-tier-card-main">
                <p className="loyalty-tier-eyebrow">Current tier</p>
                <h2 className="loyalty-tier-name">{tier}</h2>
                <p className="loyalty-tier-balance">
                  <span className="loyalty-tier-balance-value">{formatLoyaltyPoints(balance)}</span>
                  <span className="loyalty-tier-balance-label">Points</span>
                </p>
                <div className="loyalty-tier-meta">
                  <span>Lifetime earned: {formatLoyaltyPoints(lifetimeEarned)}</span>
                  <span>Lifetime redeemed: {formatLoyaltyPoints(lifetimeRedeemed)}</span>
                </div>
              </div>

              <div className="loyalty-available-card" aria-label="Points available">
                <p className="loyalty-available-value">{formatLoyaltyPoints(balance)}</p>
                <p className="loyalty-available-label">Points available</p>
              </div>
            </Reveal>

            <Reveal className="loyalty-progress-card" variant="fade-up" delay={40}>
              <div className="loyalty-progress-head">
                <h3 className="loyalty-section-title">Tier progress</h3>
                <p className="loyalty-progress-message">{progress.message}</p>
              </div>
              <div
                className="loyalty-progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.progressPercent}
                aria-label={progress.message}
              >
                <span
                  className="loyalty-progress-fill"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>
              <div className="loyalty-progress-scale">
                <span>{tier}</span>
                <span>{progress.isMaxTier ? 'Platinum' : progress.nextTier}</span>
              </div>
            </Reveal>

            <Reveal className="loyalty-stats-grid" variant="fade-up" delay={60}>
              <div className="loyalty-stat">
                <p className="loyalty-stat-label">Lifetime earned</p>
                <p className="loyalty-stat-value">{formatLoyaltyPoints(lifetimeEarned)}</p>
              </div>
              <div className="loyalty-stat">
                <p className="loyalty-stat-label">Lifetime redeemed</p>
                <p className="loyalty-stat-value">{formatLoyaltyPoints(lifetimeRedeemed)}</p>
              </div>
              <div className="loyalty-stat">
                <p className="loyalty-stat-label">Current balance</p>
                <p className="loyalty-stat-value">{formatLoyaltyPoints(balance)}</p>
              </div>
              <div className="loyalty-stat">
                <p className="loyalty-stat-label">Current tier</p>
                <p className="loyalty-stat-value">{tier}</p>
              </div>
            </Reveal>

            {summary?.transactionCount != null ? (
              <p className="loyalty-summary-note">
                {summary.transactionCount === 1
                  ? '1 rewards activity recorded'
                  : `${formatLoyaltyPoints(summary.transactionCount)} rewards activities recorded`}
                {summary.lastTransactionAt
                  ? ` · Last activity ${formatLoyaltyDate(summary.lastTransactionAt)}`
                  : ''}
              </p>
            ) : null}

            <Reveal className="loyalty-redeem-card" variant="fade-up" delay={70}>
              <div className="loyalty-redeem-head">
                <h3 className="loyalty-section-title">Redeem Points</h3>
                <p className="loyalty-redeem-copy">
                  Convert points into loyalty discount value. 1 point = Rs.1.
                </p>
              </div>

              <div className="loyalty-redeem-meta">
                <div>
                  <p className="loyalty-redeem-meta-label">Available Points</p>
                  <p className="loyalty-redeem-meta-value">
                    {formatLoyaltyPoints(balance)} points
                  </p>
                </div>
                <div>
                  <p className="loyalty-redeem-meta-label">Current Tier</p>
                  <p className="loyalty-redeem-meta-value">{tier}</p>
                </div>
              </div>

              {!canRedeemByBalance ? (
                <p className="loyalty-redeem-hint" role="status">
                  You need at least 100 points to redeem.
                </p>
              ) : (
                <form className="loyalty-redeem-form" onSubmit={handleRedeemSubmit} noValidate>
                  <label className="loyalty-redeem-label" htmlFor="loyalty-redeem-points">
                    Redeem
                  </label>
                  <div className="loyalty-redeem-row">
                    <input
                      id="loyalty-redeem-points"
                      className="loyalty-redeem-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="off"
                      placeholder="500"
                      value={redeemInput}
                      disabled={redeemSubmitting}
                      aria-invalid={Boolean(redeemFieldError || redeemValidationError)}
                      aria-describedby="loyalty-redeem-help loyalty-redeem-error"
                      onChange={handleRedeemInputChange}
                    />
                    <button
                      type="submit"
                      className="loyalty-redeem-btn"
                      disabled={!canSubmitRedeem}
                    >
                      {redeemSubmitting ? 'Redeeming…' : 'Redeem Points'}
                    </button>
                  </div>

                  <p id="loyalty-redeem-help" className="loyalty-redeem-preview">
                    You&apos;ll receive:{' '}
                    <strong>
                      {discountPreview != null
                        ? `${formatLoyaltyPkr(discountPreview)} discount`
                        : '—'}
                    </strong>
                  </p>

                  {(redeemFieldError ||
                    (redeemInput.trim() && redeemValidationError)) && (
                    <p
                      id="loyalty-redeem-error"
                      className="loyalty-redeem-error"
                      role="alert"
                    >
                      {redeemFieldError || redeemValidationError}
                    </p>
                  )}

                  {lastRedeemResult ? (
                    <p className="loyalty-redeem-success" role="status">
                      {formatLoyaltyPoints(lastRedeemResult.redeemedPoints)} points redeemed.
                      Discount value: {formatLoyaltyPkr(lastRedeemResult.discountValue)}.
                    </p>
                  ) : null}
                </form>
              )}
            </Reveal>

            <section className="loyalty-section" aria-labelledby="loyalty-earn-heading">
              <h3 id="loyalty-earn-heading" className="loyalty-section-title">
                How to earn points
              </h3>
              <div className="loyalty-earn-grid">
                {EARN_GUIDES.map((guide, index) => (
                  <Reveal
                    key={guide.id}
                    className="loyalty-earn-card"
                    variant="fade-up"
                    delay={70 + Math.min(index, 2) * 30}
                  >
                    <span className="loyalty-earn-icon" aria-hidden="true">
                      {guide.icon}
                    </span>
                    <h4 className="loyalty-earn-title">{guide.title}</h4>
                    <p className="loyalty-earn-copy">{guide.copy}</p>
                  </Reveal>
                ))}
              </div>
            </section>

            <section className="loyalty-section" aria-labelledby="loyalty-history-heading">
              <div className="loyalty-history-head">
                <h3 id="loyalty-history-heading" className="loyalty-section-title">
                  Recent points history
                </h3>
              </div>

              {historyError ? (
                <div className="loyalty-state loyalty-state-inline" role="alert">
                  <p className="loyalty-state-copy">{historyError}</p>
                  <button
                    type="button"
                    className="loyalty-state-btn"
                    onClick={() => loadHistory(page)}
                  >
                    Try Again
                  </button>
                </div>
              ) : null}

              {historyLoading && !historyError ? (
                <div className="loyalty-history-loading" aria-busy="true">
                  <span className="sr-only">Loading points history</span>
                  <div className="loyalty-skeleton-block" />
                </div>
              ) : null}

              {!historyLoading && !historyError && history.length === 0 ? (
                <div className="loyalty-state loyalty-state-empty">
                  <h4 className="loyalty-state-title">No rewards activity yet.</h4>
                  <p className="loyalty-state-copy">
                    Complete purchases and reviews to start earning points.
                  </p>
                </div>
              ) : null}

              {!historyError && history.length > 0 ? (
                <>
                  <div className="loyalty-history-table-wrap">
                    <table className="loyalty-history-table">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Description</th>
                          <th scope="col">Source</th>
                          <th scope="col">Points</th>
                          <th scope="col">Balance after</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((row) => {
                          const points = Number(row.points) || 0;
                          const positive = points > 0;
                          return (
                            <tr key={row.id}>
                              <td>{formatLoyaltyDate(row.createdAt)}</td>
                              <td>{row.description || formatLoyaltySource(row.source)}</td>
                              <td>{formatLoyaltySource(row.source)}</td>
                              <td>
                                <span
                                  className={`loyalty-points-delta${
                                    positive ? ' is-earn' : ' is-spend'
                                  }`}
                                >
                                  {positive ? '+' : ''}
                                  {formatLoyaltyPoints(points)}
                                </span>
                              </td>
                              <td>{formatLoyaltyPoints(row.balanceAfter)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <ul className="loyalty-history-cards">
                    {history.map((row) => {
                      const points = Number(row.points) || 0;
                      const positive = points > 0;
                      return (
                        <li key={`card-${row.id}`} className="loyalty-history-card">
                          <div className="loyalty-history-card-top">
                            <span>{formatLoyaltyDate(row.createdAt)}</span>
                            <span
                              className={`loyalty-points-delta${
                                positive ? ' is-earn' : ' is-spend'
                              }`}
                            >
                              {positive ? '+' : ''}
                              {formatLoyaltyPoints(points)}
                            </span>
                          </div>
                          <p className="loyalty-history-card-desc">
                            {row.description || formatLoyaltySource(row.source)}
                          </p>
                          <div className="loyalty-history-card-meta">
                            <span>{formatLoyaltySource(row.source)}</span>
                            <span>Balance {formatLoyaltyPoints(row.balanceAfter)}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="loyalty-pagination">
                    <button
                      type="button"
                      className="loyalty-page-btn"
                      disabled={!hasPrev || historyLoading}
                      onClick={() => loadHistory(page - 1)}
                    >
                      Previous
                    </button>
                    <span className="loyalty-page-status">
                      Page {pagination?.page || page}
                      {pagination?.totalPages ? ` of ${pagination.totalPages}` : ''}
                    </span>
                    <button
                      type="button"
                      className="loyalty-page-btn"
                      disabled={!hasNext || historyLoading}
                      onClick={() => loadHistory(page + 1)}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </AccountShell>
  );
}
