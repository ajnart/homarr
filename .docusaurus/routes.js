import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '92d'),
    exact: true,
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'cbf'),
    exact: true,
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'bb6'),
    exact: true,
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'b8b'),
    exact: true,
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '755'),
    exact: true,
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', 'be9'),
    exact: true,
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', 'ae8'),
    exact: true,
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', '662'),
    exact: true,
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', 'f93'),
    exact: true,
  },
  {
    path: '/blog/documentation-migration',
    component: ComponentCreator('/blog/documentation-migration', '929'),
    exact: true,
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', 'e41'),
    exact: true,
  },
  {
    path: '/blog/tags/documentation',
    component: ComponentCreator('/blog/tags/documentation', 'd08'),
    exact: true,
  },
  {
    path: '/blog/tags/migration',
    component: ComponentCreator('/blog/tags/migration', '2ef'),
    exact: true,
  },
  {
    path: '/docs/tags',
    component: ComponentCreator('/docs/tags', '5e4'),
    exact: true,
  },
  {
    path: '/docs/tags/background',
    component: ComponentCreator('/docs/tags/background', '57e'),
    exact: true,
  },
  {
    path: '/docs/tags/basics',
    component: ComponentCreator('/docs/tags/basics', '6a3'),
    exact: true,
  },
  {
    path: '/docs/tags/calendar',
    component: ComponentCreator('/docs/tags/calendar', '400'),
    exact: true,
  },
  {
    path: '/docs/tags/colors',
    component: ComponentCreator('/docs/tags/colors', 'd62'),
    exact: true,
  },
  {
    path: '/docs/tags/custom',
    component: ComponentCreator('/docs/tags/custom', '4d3'),
    exact: true,
  },
  {
    path: '/docs/tags/customization',
    component: ComponentCreator('/docs/tags/customization', '388'),
    exact: true,
  },
  {
    path: '/docs/tags/date',
    component: ComponentCreator('/docs/tags/date', '069'),
    exact: true,
  },
  {
    path: '/docs/tags/design',
    component: ComponentCreator('/docs/tags/design', '099'),
    exact: true,
  },
  {
    path: '/docs/tags/development',
    component: ComponentCreator('/docs/tags/development', '87f'),
    exact: true,
  },
  {
    path: '/docs/tags/discord',
    component: ComponentCreator('/docs/tags/discord', '2ba'),
    exact: true,
  },
  {
    path: '/docs/tags/donate',
    component: ComponentCreator('/docs/tags/donate', '942'),
    exact: true,
  },
  {
    path: '/docs/tags/faq',
    component: ComponentCreator('/docs/tags/faq', 'bce'),
    exact: true,
  },
  {
    path: '/docs/tags/forecast',
    component: ComponentCreator('/docs/tags/forecast', 'f31'),
    exact: true,
  },
  {
    path: '/docs/tags/frequently-asked-questions',
    component: ComponentCreator('/docs/tags/frequently-asked-questions', '935'),
    exact: true,
  },
  {
    path: '/docs/tags/geolocation',
    component: ComponentCreator('/docs/tags/geolocation', 'da7'),
    exact: true,
  },
  {
    path: '/docs/tags/getting-started',
    component: ComponentCreator('/docs/tags/getting-started', '0fd'),
    exact: true,
  },
  {
    path: '/docs/tags/help',
    component: ComponentCreator('/docs/tags/help', 'e30'),
    exact: true,
  },
  {
    path: '/docs/tags/installation',
    component: ComponentCreator('/docs/tags/installation', '681'),
    exact: true,
  },
  {
    path: '/docs/tags/integration',
    component: ComponentCreator('/docs/tags/integration', '65a'),
    exact: true,
  },
  {
    path: '/docs/tags/localization',
    component: ComponentCreator('/docs/tags/localization', '955'),
    exact: true,
  },
  {
    path: '/docs/tags/maintenance',
    component: ComponentCreator('/docs/tags/maintenance', '364'),
    exact: true,
  },
  {
    path: '/docs/tags/modules',
    component: ComponentCreator('/docs/tags/modules', '562'),
    exact: true,
  },
  {
    path: '/docs/tags/service-management',
    component: ComponentCreator('/docs/tags/service-management', 'b31'),
    exact: true,
  },
  {
    path: '/docs/tags/support',
    component: ComponentCreator('/docs/tags/support', 'ea0'),
    exact: true,
  },
  {
    path: '/docs/tags/time',
    component: ComponentCreator('/docs/tags/time', 'd87'),
    exact: true,
  },
  {
    path: '/docs/tags/title',
    component: ComponentCreator('/docs/tags/title', '394'),
    exact: true,
  },
  {
    path: '/docs/tags/weather',
    component: ComponentCreator('/docs/tags/weather', '051'),
    exact: true,
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', 'e7d'),
    routes: [
      {
        path: '/docs/about',
        component: ComponentCreator('/docs/about', '99a'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/advanced-features/custom-icons',
        component: ComponentCreator('/docs/advanced-features/custom-icons', 'e89'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/advanced-features/environment-variables',
        component: ComponentCreator('/docs/advanced-features/environment-variables', '9ea'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/advanced-features/integrations',
        component: ComponentCreator('/docs/advanced-features/integrations', 'f8a'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/advanced-features/key-shortcuts',
        component: ComponentCreator('/docs/advanced-features/key-shortcuts', '0d1'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/advanced-features/multiple-configurations',
        component: ComponentCreator('/docs/advanced-features/multiple-configurations', '3ee'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/community/donate',
        component: ComponentCreator('/docs/community/donate', '5b1'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/community/frequently-asked-questions',
        component: ComponentCreator('/docs/community/frequently-asked-questions', '68a'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/community/get-in-touch',
        component: ComponentCreator('/docs/community/get-in-touch', '784'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/community/license',
        component: ComponentCreator('/docs/community/license', '170'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/customizations/',
        component: ComponentCreator('/docs/customizations/', '83f'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/customizations/custom-background',
        component: ComponentCreator('/docs/customizations/custom-background', '6a9'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/customizations/custom-colors',
        component: ComponentCreator('/docs/customizations/custom-colors', '010'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/customizations/custom-search-engine',
        component: ComponentCreator('/docs/customizations/custom-search-engine', '4d4'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/customizations/custom-title',
        component: ComponentCreator('/docs/customizations/custom-title', '2a6'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/customizations/dark-mode',
        component: ComponentCreator('/docs/customizations/dark-mode', '0fc'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/',
        component: ComponentCreator('/docs/modules/', 'd49'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/built-in-modules/',
        component: ComponentCreator('/docs/modules/built-in-modules/', '7c5'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/built-in-modules/module-calendar',
        component: ComponentCreator('/docs/modules/built-in-modules/module-calendar', 'c00'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/built-in-modules/module-clock',
        component: ComponentCreator('/docs/modules/built-in-modules/module-clock', '896'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/built-in-modules/module-search',
        component: ComponentCreator('/docs/modules/built-in-modules/module-search', '2c8'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/built-in-modules/module-torrent',
        component: ComponentCreator('/docs/modules/built-in-modules/module-torrent', '67f'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/built-in-modules/module-weather',
        component: ComponentCreator('/docs/modules/built-in-modules/module-weather', '10f'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/modules/making-own-module',
        component: ComponentCreator('/docs/modules/making-own-module', '371'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/quick-start/',
        component: ComponentCreator('/docs/quick-start/', '0bc'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
      {
        path: '/docs/quick-start/manage-services',
        component: ComponentCreator('/docs/quick-start/manage-services', 'ed9'),
        exact: true,
        sidebar: 'tutorialSidebar',
      },
    ],
  },
  {
    path: '/',
    component: ComponentCreator('/', '946'),
    exact: true,
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
