import React from 'react';

export default function Gallery({ images }) {
  console.log(image)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
      {images.map(({ full, thumbnail, caption }) => (
        <figure key={full}>
          <div>
            <a href={full}>
              <img src={thumbnail.src} srcSet={thumbnail.srcSet} alt="" />
            </a>
          </div>

          <figcaption>{caption}</figcaption>
        </figure>
      ))}
    </div>
  );
}
