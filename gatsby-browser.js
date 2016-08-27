import ReactGA from 'react-ga';
ReactGA.initialize('UA-49971705-2');

exports.onRouteUpdate = (state, page, pages) => {
  ReactGA.pageview(state.pathname);
};
