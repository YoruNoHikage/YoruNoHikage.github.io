import React from 'react';

export default async function headTags() {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=UA-49971705-2`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-49971705-2');
          `,
        }}
      />
    </>
  );
}
