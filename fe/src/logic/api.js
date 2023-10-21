import axios from 'axios';
import notification from '@/components/UiLib/Api/notification';
import {API_URL} from '@/constants';
import {user} from '@/appState';

function getRespData({data, error}) {
  if (error) {
    throw error
  }
  if (typeof (data) === 'object' && data.data) {
    return data.data
  }
  return data
}

async function exec(asyncFn) {
  try {
    const rs = getRespData(await asyncFn())
    if (window.__debug)
      console.log(rs)
    return rs;
  } catch (e) {
    console.log(e)
  }
}

let axiosOpts = {};

async function _saveAuthSession({token}) {
  axiosOpts = {headers: {Authorization: `bearer ${token}`}};
  window.localStorage.setItem('token', token);
  user.value = await userAPI.about('me');
}

export const userAPI = {
  about: async (userId) => exec(() => axios.get(`${API_URL}/user/about/${userId}`, axiosOpts)),
  update: async (change) => exec(() => axios.put(`${API_URL}/user/update-profile`, change, axiosOpts)),
  signUp: async (email, password) => {
    try {
      const rs = await axios.post(`${API_URL}/user/sign-up`, {email: email, password: password})
      const {data} = rs.data;
      if (data.token) {
        _saveAuthSession(data);
      } else {
        console.error('Token missed!');
      }
      return data.token;
    } catch (e) {
      notification.err(e)
    }
  },
  signIn: async (email, password) => {
    try {
      const rs = await axios.post(`${API_URL}/user/sign-in`, {email, password})
      const {data} = rs.data;
      if (data.token) {
        _saveAuthSession(data);
      } else {
        console.log('signIn failed')
      }
      return data.token;
    } catch (e) {
      notification.err(e)
    }
  },
  auth: async token => {
    try {
      const {data} = (await axios.get(`${API_URL}/user/auth`, {headers: {Authorization: `bearer ${token}`}})).data;
      if (data.token) {
        await _saveAuthSession(data);
      } else {
        console.log('Auth failed')
      }
      return data.token;
    } catch (e) {
      return null;
    }
  },
}

export const categoryAPI = {
  gets: async (uid) => exec(() => axios.get(`${API_URL}/category/${uid}`)),
  create: async (payload) => exec(() => axios.post(`${API_URL}/category/`, payload, axiosOpts)),
  update: async (_id, change) => exec(() => axios.put(`${API_URL}/category/${_id}`, change, axiosOpts)),
  remove: async (_id) => exec(() => axios.delete(`${API_URL}/category/${_id}`)),
}

export const postAPI = {
  gets: async (uid, cid, page = 1) => exec(() => axios.get(`${API_URL}/post?uid=${uid}&cid=${cid}&p=${page}`)),
  get: async (pid) => exec(() => axios.get(`${API_URL}/post/${pid}`)),
  update: async (pid, change) => exec(() => axios.put(`${API_URL}/post/${pid}`, change, axiosOpts)),
  create: async payload => exec((() => axios.post(`${API_URL}/post`, payload, axiosOpts))),
  remove: async _id => exec(() => axios.delete(`${API_URL}/post/${_id}`, axiosOpts)),
  react: async (postId, reactType) => exec((() => axios.put(`${API_URL}/post/react/${postId}?reactType=${reactType}`, {}, axiosOpts))),
  unReact: async postId => exec((() => axios.put(`${API_URL}/post/un-react/${postId}`, {}, axiosOpts))),
  getComments: async (postId, page) => exec(() => axios.get(`${API_URL}/post/comments/${postId}?page=${page}`))
}
