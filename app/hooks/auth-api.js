import axios from "axios";

// Создаем экземпляр Axios
const instance = axios.create({
  baseURL: "https://your-api-domain.com/api",
});

// Функция для сохранения access token в localStorage
const saveAccessTokenToLocalStorage = (accessToken) => {
  localStorage.setItem("accessToken", accessToken);
};

// Добавляем интерцептор запросов
instance.interceptors.request.use(
  async function (config) {
    // Получаем access token из localStorage
    const accessToken = localStorage.getItem("accessToken");

    // Проверяем наличие access token
    if (accessToken) {
      // Если есть access token, добавляем его в заголовок Authorization
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Возвращаем конфигурацию запроса
    return config;
  },
  function (error) {
    // Обработка ошибок
    return Promise.reject(error);
  }
);

// Добавляем интерцептор ответов для обработки ошибок авторизации
instance.interceptors.response.use(
  function (response) {
    // Обработка успешного ответа
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Проверяем, была ли ошибка из-за истекшего access token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Отправляем запрос на обновление access token на сервер
        const response = await axios.post(
          "https://your-api-domain.com/api/refresh"
        );

        // Сохраняем новый access token в localStorage
        saveAccessTokenToLocalStorage(response.data.accessToken);

        // Повторяем оригинальный запрос с новым access token
        return instance(originalRequest);
      } catch (error) {
        // Если запрос на обновление токена тоже завершился ошибкой, перенаправляем пользователя на страницу авторизации
        console.error("Ошибка обновления токена:", error);
        // Здесь можно добавить код для перенаправления пользователя на страницу авторизации
        return Promise.reject(error);
      }
    }

    // Возвращаем ошибку, если она не связана с авторизацией
    return Promise.reject(error);
  }
);

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

export { instance, login };
