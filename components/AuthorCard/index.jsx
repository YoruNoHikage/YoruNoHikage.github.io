import React, { Component } from 'react';
import { prefixLink } from 'gatsby-helpers';
import markdown from 'markdown-it';

export default class AuthorCard extends Component {
  render() {
    const { name, username, avatar, twitterLink, children } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        <img
          style={{ margin: '20px' }}
          src={prefixLink(avatar)}
          width="75"
          height="75"
          alt={username}
        />
        <div style={{ flex: '1' }}>
          <strong>{name}</strong>
          {' '}
          - @
          <a href={twitterLink} title={`${username} on Twitter`}>{username}</a>
          <p
            style={{ margin: '0' }}
            dangerouslySetInnerHTML={{
              __html: markdown().render(children).match(/<p>([^]+)<\/p>/)[1],
            }}
          />
        </div>
      </div>
    );
  }
}
