import React from 'react';

export default function Gallery({ images }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
      }}
    >
      {images.map(({ image, caption }, i) => (
        <figure key={i}>
          <div>{image}</div>

          <figcaption>{caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
