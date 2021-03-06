// The code here is IE 11 compatible, and only works if Next.js polyfills are included
const React = require('react');
const mdxReact = require('@mdx-js/react');

const MDXProvider = mdxReact.MDXProvider;

function MdxRemote(props) {
  const { source, scope = {}, components } = props;

  const src = source + 'return MDXContent;'; // eslint-disable-line prefer-template
  const getContent = Function('mdxReact', 'React', ...Object.keys(scope), src); // eslint-disable-line no-new-func
  const MDXContent = getContent(mdxReact, React, ...Object.values(scope))
    .default;

  return React.createElement(
    MDXProvider,
    { components },
    React.createElement(MDXContent, props)
  );
}

module.exports = React.memo(MdxRemote);
