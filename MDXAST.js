const visit = require('unist-util-visit');
const remark = require('remark');
const mdx = require('remark-mdx');

const renderToString = require('./render-to-string')

const content = `
import MyComp from './mycomp';

# Hello, world!

![Alternate](./bidule.png)

![Alternate](./autreimage.png)

\`\`\`jsx
const bidule = require('./bidule.png');

const machin = <Test><Pwet prop={require('./bidule.png')} /></Test>
\`\`\`

<MyComp>
  <Yes prop={require('./bidule.png')} />
  <Yes prop={require('./machin.png')} />
</MyComp>
`;

const content2 = `
# Hello, world!

<MyComp />
`;

(async () => {
  // let importedImages = [];

  // const { contents } = await remark()
  //   .use(mdx)
  //   .use(() => (tree) => {
  //     visit(tree, 'jsx', (node) => {
  //       const requiredFilePathRE = /require\(["']([^"']+)["']?\)/;

  //       node.value = node.value
  //         .split(requiredFilePathRE)
  //         .map((value, i) => {
  //           if (i % 2 === 0) return value;

  //           const imageName = `MDX_FILE_LOADER_IMAGE_${importedImages.length}`;

  //           importedImages.push(value);

  //           return imageName;
  //         })
  //         .join('');

  //       console.log(node.value);
  //     });

  //     visit(tree, 'image', (node) => {
  //       // TODO: if url not local, ignore
  //       // TODO: if url duplicated, use same var as before
  //       const imageName = `MDX_FILE_LOADER_IMAGE_${importedImages.length}`;

  //       importedImages.push(node.url);

  //       node.url = imageName;
  //     });
  //   })
  //   .process(content);

  // console.log(`
  // ${importedImages
  //   .map(
  //     (path, i) =>
  //       `const MDX_FILE_LOADER_IMAGE_${i} = require(${JSON.stringify(path)});`
  //   )
  //   .join('\n')}
  // module.exports = ${JSON.stringify(contents)
  //   .split(/(MDX_FILE_LOADER_IMAGE_\d+)/)
  //   .map((value, i) => {
  //     if (i % 2 === 0) return value;

  //     return `" + ${value} + "`;
  //   }).join('')};
  // `);

  // ====================
  const result = await renderToString(content2, {components: {
    MyComp: () => '',
  }});

  console.log(result.compiledSource);
})();
