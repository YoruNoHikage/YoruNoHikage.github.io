import React from 'react';
import Helmet from 'react-helmet';
import { prefixLink } from 'gatsby-helpers';

const BUILD_TIME = new Date().getTime();

module.exports = React.createClass({
  displayName: 'HTML',
  propTypes: {
    body: React.PropTypes.string,
  },
  render() {
    const { body } = this.props;
    const { title } = Helmet.rewind();
    const fonts = [
      'https://fonts.googleapis.com/css?family=Roboto:400,400italic,500,700&subset=latin',
      'https://fonts.googleapis.com/css?family=Inconsolata:400,700&subset=latin-ext',
    ];
    let css;
    if (process.env.NODE_ENV === 'production') {
      // eslint-disable-next-line import/no-webpack-loader-syntax
      css = <style dangerouslySetInnerHTML={{ __html: require('!raw!./public/styles.css') }} />;
    }

    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <meta name="google-site-verification" content="agg-_LnRFJMMGBybCnFKLeLAisX9Mwv9v0aD4p_Byrw" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0 maximum-scale=5.0" />
          { title.toComponent() }
          <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
          <link rel="shortcut icon" href="/favicon.png" type="image/png" />
          { fonts.map(link => <link href={link} rel="stylesheet" type="text/css" />) }
          { css }
        </head>
        <body>
          <div id="react-mount" dangerouslySetInnerHTML={{ __html: this.props.body }} />
          <script src={prefixLink(`/bundle.js?t=${BUILD_TIME}`)} />
        </body>
      </html>
    );
  },
});
