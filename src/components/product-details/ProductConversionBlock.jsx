import { Link } from 'react-router-dom';
import {
  buildWhyYoullLoveIt,
  buildPdpConversionAssurances,
} from '../../utils/conversionFacts.js';
import { ROUTES } from '../../utils/navigation.js';
import {
  DELIVERY_REASSURANCE,
  RETURNS_REASSURANCE,
} from '../../constants/storefrontCopy.js';

/**
 * Additive PDP conversion block — facts from product data + soft storefront assurances.
 */
export default function ProductConversionBlock({ product }) {
  const lovePoints = buildWhyYoullLoveIt(product);
  const assurances = buildPdpConversionAssurances(product);

  if (!lovePoints.length && !assurances.length) {
    return null;
  }

  return (
    <section className="pd-conversion-block" aria-label="Product details and reassurance">
      {lovePoints.length > 0 ? (
        <div className="pd-why-love">
          <h2 className="pd-conversion-heading">Why you&apos;ll love it</h2>
          <ul className="pd-why-love-list">
            {lovePoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="pd-conversion-assurances">
        <h2 className="pd-conversion-heading">Good to know</h2>
        <p className="pd-conversion-note">{DELIVERY_REASSURANCE}</p>
        <ul className="pd-trust-list pd-conversion-trust">
          {assurances.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="pd-conversion-returns">
          {RETURNS_REASSURANCE}{' '}
          <Link to={ROUTES.supportTickets} className="pd-conversion-link">
            Open Support
          </Link>
          {' · '}
          <Link to={ROUTES.contact} className="pd-conversion-link">
            Contact
          </Link>
        </p>
      </div>
    </section>
  );
}
