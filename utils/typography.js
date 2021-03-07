import Typography from 'typography';
import theme from 'typography-theme-ocean-beach';

theme.googleFonts.push(
  {
    name: 'M+PLUS+1p',
    styles: ['400'],
  },
  {
    name: 'Noto+Sans+JP',
    styles: ['400'],
  }
);

theme.headerFontFamily = ['Roboto Slab', 'M PLUS 1p', 'sans-serif'];

theme.bodyFontFamily = ['Roboto', 'Noto Sans JP', 'sans-serif'];

theme.overrideThemeStyles = () => ({
  a: {
    'text-decoration': 'underline',
    'text-decoration-thickness': '0.1em',
    'background-image': 'none',
    color: '#222',
    'text-shadow': 'none',
  },
  'a:hover': {
    'text-decoration': 'none',
  },
  blockquote: {
    'border-left-width': '0.5rem',
    'border-left-color': 'inherit',
    'margin-left': '-1.5rem',
  },

  'p code': {
    'font-size': '1rem',
    'line-height': '1.5',
  },
  'li code': {
    'font-size': '1rem',
    'line-height': '1.5',
  },
  pre: {
    'margin-left': '-1.3125em',
    'margin-right': '-1.3125em',
    'line-height': '1.5',
  },
});

const typography = new Typography(theme);

export default typography;
