import React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';
import { TypographyStyle, GoogleFont } from 'react-typography';

import typography from '../utils/typography';

import { GA_TRACKING_ID } from '../lib/gtag';

export default class extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            var host = window.location.hostname;
            if(host != "localhost")
            {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_TRACKING_ID}', {
                page_path: window.location.pathname,
              });
            }
            else {
              window.gtag = () => {}
            }
          `,
            }}
          />
        </Head>
        <body>
          <Main />
          <TypographyStyle typography={typography} />
          <GoogleFont typography={typography} />
          <NextScript />
        </body>
      </Html>
    );
  }
}
