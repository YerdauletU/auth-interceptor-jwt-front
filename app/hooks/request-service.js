import api from "./api";
import TokenService from "./token.service";

// Функция для входа пользователя
const login = async (credentials) => {
  try {
    // Отправляем запрос на сервер для аутентификации
    const response = await instance.post("/login", credentials);
    // Сохраняем полученный access token в localStorage
    saveAccessTokenToLocalStorage(response.data.accessToken);
    // Возвращаем ответ сервера
    return response;
  } catch (error) {
    // Обработка ошибок
    return Promise.reject(error);
  }
};

const signup = async (credentials) => {
  try {
    // Отправляем запрос на сервер для аутентификации
    const response = await axios.post(
      "http://localhost:8080/api/signup",
      credentials
    );
    // Сохраняем полученный access token в localStorage
    saveAccessTokenToLocalStorage(response.data.accessToken);
    // Возвращаем ответ сервера
    return response;
  } catch (error) {
    // Обработка ошибок
    return Promise.reject(error);
  }
};

const logout = () => {
  TokenService.removeUser();
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

const RequestService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default RequestService;
