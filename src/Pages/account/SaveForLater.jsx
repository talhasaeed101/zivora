import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AccountShell from '../../components/account/AccountShell.jsx';
import SavedCartItem from '../../components/cart/SavedCartItem.jsx';
import Reveal from '../../components/Reveal.jsx';
import { usePrivatePageSeo } from '../../hooks/useSEO.js';
import { useCart } from '../../context/CartContext.jsx';
import { mapCartItemForUi } from '../../utils/products.js';
import { toast } from '../../context/ToastContext.jsx';
import { ROUTES } from '../../utils/navigation';
import '../../Pages/CartPage.css';
import './SaveForLater.css';

export default function SaveForLater() {
  usePrivatePageSeo({ title: 'Saved for Later', path: '/account/saved' });

  const { savedItems: rawSaved, moveSavedToCart, removeSavedItem, loading } = useCart();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const items = useMemo(
    () => (Array.isArray(rawSaved) ? rawSaved.map((item) => mapCartItemForUi(item)) : []),
    [rawSaved]
  );

  const handleMove = async (item) => {
    if (!item?.id || busyId) return;
    setBusyId(item.id);
    setError('');
    try {
      await moveSavedToCart(item.id);
      toast.success('Moved to cart.');
    } catch (err) {
      setError(err?.message || 'Unable to move item to cart.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (item) => {
    if (!item?.id || busyId) return;
    setBusyId(item.id);
    setError('');
    try {
      await removeSavedItem(item.id);
      toast.success('Removed from saved items.');
    } catch (err) {
      setError(err?.message || 'Unable to remove saved item.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AccountShell
      active="saved"
      title="Saved for Later"
      description="Items you moved out of your bag — still ready when you are."
      countLabel={loading ? undefined : `${items.length} saved`}
    >
      <div className="save-for-later-page">
        {error ? (
          <p className="save-for-later-error" role="alert">
            {error}
          </p>
        ) : null}

        {!loading && items.length === 0 ? (
          <div className="save-for-later-empty">
            <p className="save-for-later-empty-title">No saved items yet</p>
            <p className="save-for-later-empty-copy">
              On your cart, choose “Save for later” to keep an item here without losing your
              selection.
            </p>
            <Link to={ROUTES.cart} className="save-for-later-cart-link">
              Go to cart
            </Link>
          </div>
        ) : null}

        {items.length > 0 ? (
          <ul className="save-for-later-list">
            {items.map((item, index) => (
              <Reveal key={item.id} as="li" variant="fade-up" delay={Math.min(index * 40, 200)}>
                <SavedCartItem
                  item={item}
                  busy={busyId === item.id}
                  onMoveToCart={handleMove}
                  onRemove={handleRemove}
                />
              </Reveal>
            ))}
          </ul>
        ) : null}
      </div>
    </AccountShell>
  );
}
