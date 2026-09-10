import { CompareIcon } from './icons';
import { useCompare } from '../context/CompareContext.jsx';
import './CompareButton.css';

export default function CompareButton({
  productId,
  className = '',
  activeClassName = '',
  iconClassName = 'w-4 h-4',
  showLabel = false,
  stopPropagation = true,
}) {
  const { isInCompare, toggle } = useCompare();
  const active = isInCompare(productId);

  const handleClick = (event) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!productId) {
      return;
    }

    toggle(productId);
  };

  return (
    <button
      type="button"
      className={`${className} ${active ? activeClassName : ''}`}
      aria-label={active ? 'Remove from compare' : 'Add to compare'}
      aria-pressed={active}
      onClick={handleClick}
    >
      <CompareIcon className={iconClassName} filled={active} />
      {showLabel ? <span>{active ? 'In compare' : 'Compare'}</span> : null}
    </button>
  );
}
