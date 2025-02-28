import { type RouteRecordRaw } from 'vue-router';
import bindQuery from '../utils/router-query-bind';

export default [
  /* {
    path: '/',
    name: 'landing-page',
    component: () => import('@/views/landing-page/Home.vue'),
  }, */
  {
    path: '/',
    redirect: { name: 'catalog' },
    meta: { requiresAuth: true },
  },
  {
    path: '/catalog',
    name: 'catalog',
    component: () => import('@/views/catalog/Catalog.vue'),
    children: [
      {
        path: 'corpus',
        name: 'corpus',
        component: () => import('@/views/catalog/Corpus.vue'),
        meta: {
          parent: 'corpus',
        },
        props: bindQuery(),
      },
      {
        path: 'corpus/:id',
        name: 'corpus-details',
        component: () => import('@/views/catalog/Details.vue'),
        meta: {
          parent: 'corpus',
        },
      },
      {
        path: 'services',
        name: 'services',
        component: () => import('@/views/catalog/Services.vue'),
        meta: {
          parent: 'services',
        },
        props: bindQuery(),
      },
      {
        path: 'services/:id',
        name: 'services-details',
        component: () => import('@/views/catalog/Details.vue'),
        meta: {
          parent: 'services',
        },
      },
      {
        path: 'models',
        name: 'models',
        component: () => import('@/views/catalog/Models.vue'),
        meta: {
          parent: 'models',
        },
        props: bindQuery(),
      },
      {
        path: 'models/:id',
        name: 'models-details',
        component: () => import('@/views/catalog/Details.vue'),
        meta: {
          parent: 'models',
        },
      },
      {
        path: 'lexical-resources',
        name: 'lexical-resources',
        component: () => import('@/views/catalog/LexicalResources.vue'),
        meta: {
          parent: 'lexical-resources',
        },
        props: bindQuery(),
      },
      {
        path: 'lexical-resources/:id',
        name: 'lexical-resources-details',
        component: () => import('@/views/catalog/Details.vue'),
        meta: {
          parent: 'lexical-resources',
        },
      },
      {
        path: 'console',
        name: 'console',
        component: () => import('@/views/console/Console.vue'),
        redirect: { name: 'overview' },
        children: [
          {
            path: 'overview',
            name: 'overview',
            component: () => import('@/views/console/Overview.vue'),
            meta: {
              parent: 'console',
              submenu: true,
              requiresAuth: true
            },
          },
          {
            path: 'assets',
            name: 'assets',
            component: () => import('@/views/console/Assets.vue'),
            meta: {
              parent: 'console',
              submenu: true,
              requiresAuth: true
            },
            children: [
              {
                path: 'edit/:type/:id',
                name: 'asset-edit',
                component: () => import('@/views/console/AssetDetails.vue'),
                meta: {
                  parent: 'console',
                  hideDefaultHeader: true,
                  requiresAuth: true
                },
              },
              {
                path: 'new/:type',
                name: 'asset-create',
                component: () => import('@/views/console/AssetDetails.vue'),
                meta: {
                  parent: 'console',
                  hideDefaultHeader: true,
                  requiresAuth: true
                },
              },
            ],
          },
          {
            path: 'contracts',
            name: 'contracts',
            component: () => import('@/views/console/Contracts.vue'),
            meta: {
              parent: 'console',
              submenu: true,
              requiresAuth: true
            },
          },
          {
            path: 'negotiations',
            name: 'negotiations',
            component: () => import('@/views/console/Negotiations.vue'),
            meta: {
              parent: 'console',
              submenu: true,
              requiresAuth: true
            },
          },
          {
            path: 'transfer-history',
            name: 'transfer-history',
            component: () => import('@/views/console/Transfers.vue'),
            meta: {
              parent: 'console',
              submenu: true,
              requiresAuth: true
            },
          },
        ],
        meta: { requiresAuth: true },
      },

      {
        path: 'account',
        name: 'account',
        component: () => import('@/views/account/Account.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
] as RouteRecordRaw[];
