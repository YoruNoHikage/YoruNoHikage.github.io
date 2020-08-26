import React from 'react';

export default function Video({ children }) {
  return (
    <video
      style={{ display: 'block', margin: 'auto' }}
      width="640"
      height="427"
      preload="metadata"
      controls="controls"
    >
      {children}
    </video>
  );
}
