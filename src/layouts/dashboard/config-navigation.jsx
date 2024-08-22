import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  // {
  //   title: 'login',
  //   path: '/',
  //   icon: icon('ic_lock'),
  // },
   {
    title: 'dashboard',
    path: '/dashboard',
    icon: icon('ic_analytics'),
  },
  // {
  //   title: 'user',
  //   path: '/user',
  //   icon: icon('ic_user'),
  // },
  {
    title: 'Courses',
    path: '/products',
    icon: icon('ic_cart'),
  },
  // {
  //   title: 'blog',
  //   path: '/blog',
  //   icon: icon('ic_blog'),
  // },
 
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
