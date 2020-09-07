import React from 'react';

export default function AuthorCard({
  name,
  username,
  avatar,
  twitterLink,
  children,
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <img
        style={{ marginRight: '20px' }}
        src={avatar}
        width="75"
        height="75"
        alt={username}
      />
      <div>
        <strong>{name}</strong> - @
        <a href={twitterLink} title={`${username} on Twitter`}>
          {username}
        </a>
        <p style={{ margin: 0 }}>{children}</p>
      </div>
    </div>
  );
}
