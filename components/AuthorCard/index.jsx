import React from 'react';
import { Remarkable } from 'remarkable';

const md = new Remarkable();

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
        <p
          style={{ margin: '0' }}
          dangerouslySetInnerHTML={{
            __html: md.render(children).match(/<p>([^]+)<\/p>/)[1],
          }}
        />
      </div>
    </div>
  );
}
