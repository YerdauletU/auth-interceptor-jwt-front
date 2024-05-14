const getLocalAccessToken = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.accessToken;
};

const updateLocalAccessToken = (token) => {
  let user = JSON.parse(localStorage.getItem("user"));
  user.accessToken = token;
  localStorage.setItem("user", JSON.stringify(user));
};

export function getStorage(key) {
  return JSON.parse(localStorage.getItem(key));
};

export function setStorage(key, value) {
  return localStorage.setItem(key, JSON.stringify(value));
};

export function removeStorage(key) {
  return localStorage.removeItem(key);
};

// export default getAsd;

// const StorageService = {
//   getLocalRefreshToken,
//   getLocalAccessToken,
//   updateLocalAccessToken,
//   getUser,
//   setUser,
//   removeUser,
//   getAsd,
// };

// export default StorageService;
