import Vue from 'vue'
import VueRouter from 'vue-router'
import PlayVideo from '../components/PlayVideo.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'VideoPlayer',
    component: PlayVideo
  },
  {
    path: '/playvideo',
    namne: 'VideoPlayer',
    component: PlayVideo
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: process.env.IS_ELECTRON ? 'hash' : 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
