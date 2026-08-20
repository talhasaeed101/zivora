export default function JsonLd({ data }) {
  if (!data) {
    return null;
  }

  const payload = Array.isArray(data) ? data : [data];

  return (
    <>
      {payload.map((item, index) => (
        <script
          // JSON-LD is generated from app-controlled objects, not unsanitized HTML.
          key={item['@type'] ? `${item['@type']}-${index}` : `ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
