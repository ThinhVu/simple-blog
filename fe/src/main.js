import {createApp} from 'vue';
import {createRouter, createWebHistory} from 'vue-router';
import App from './App.vue';
import {userAPI} from './logic/api';
import Desktop from '@/components/SubPage/Desktop';
import FeedPage from '@/components/SubPage/FeedPage';
import PostPage from '@/components/SubPage/PostPage';

async function initApp() {
  let token = window.localStorage.getItem('token')
  if (token)
    await userAPI.auth(token);

  const router = createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', component: Desktop },
      { path: '/newfeed', component: FeedPage },
      { path: '/post/:id', component: PostPage },
    ]
  }, { default: '/' })
  window.$router = router;

  const app = createApp(App);
  app.use(router);
  await router.isReady();
  app.mount('#app');
}

initApp().then(() => console.log('app ready'));
