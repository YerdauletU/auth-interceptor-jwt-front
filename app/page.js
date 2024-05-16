"use client";

import axios from "axios";

import { useState } from "react";

import getName from "./hooks/papka";

import { getStorage, setStorage, removeStorage } from "./hooks/storage-service";

import styles from "./page.module.css";

// Создаем экземпляр Axios
const instance = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Функция для сохранения access token в localStorage
const saveAccessTokenToLocalStorage = (accessToken) => {
  localStorage.setItem("accessToken", accessToken);
};

// Добавляем интерцептор запросов
instance.interceptors.request.use(
  async function (config) {
    // console.log(config.headers);
    let access;
    if (config.headers.Authorization) {
      access = config.headers.Authorization.split(" ")[1];
      // console.log("unic: " + access);
      // console.log("unic: " + typeof access);
    } else if (localStorage.getItem("accessToken")) {
      access = localStorage.getItem("accessToken");
    } else {
      access = undefined;
    }

    // Проверяем наличие access token
    if (access) {
      // Если есть access token, добавляем его в заголовок Authorization
      config.headers["Authorization"] = `Bearer ${access}`;
    }
    console.log(config.headers);
    console.log("==============");
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
    console.log("success");
    return response;
  },
  async function (error) {
    console.log("status" + error.response.status);
    const originalRequest = error.config;

    if (error.response.status === 404) console.log("error");

    console.log("--+--" + error.config.headers);
    // console.log(error.config._retry);

    // Проверяем, была ли ошибка из-за истекшего access token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log("++-++" + error.config.headers);
      // console.log(error.config._retry);

      let access = error.response.data.access;

      try {
        // Отправляем запрос на обновление access token на сервер
        const response = await axios.post(
          "http://localhost:8080/api/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${access}`,
            },
          }
        );

        // Сохраняем новый access token в localStorage
        saveAccessTokenToLocalStorage(response.data.access);
        // console.log("==========================");
        // console.log("NEW ACCESS: " + response.data.access);
        // Обновление заголовка для текущего запроса
        console.log("first: " + originalRequest.headers);
        originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
        // console.log("==========================");
        console.log("second: " + originalRequest.headers);
        // Повторяем оригинальный запрос с новым access token
        return instance(originalRequest);

        // return response;
      } catch (error) {
        // Если запрос на обновление токена тоже завершился ошибкой, перенаправляем пользователя на страницу авторизации
        console.error("Ошибка обновления токена:", error);
        // Здесь можно добавить код для перенаправления пользователя на страницу авторизации
        return Promise.reject(error);
      }
    }
    // Возвращаем ошибку, если она не связана с авторизацией
    console.log("super success");
    console.log(response);
    // return response;
    // return Promise.reject(error);
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

let qwe = "accessToken";
let zxc = "xxXxx";

export default function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <h1
        onClick={() => {
          setStorage(qwe, zxc);
          console.log(`created: ${qwe}-` + getStorage(qwe));
        }}
      >
        setStorage
      </h1>
      <h1 onClick={() => console.log("local: " + getStorage(qwe))}>
        getStorage
      </h1>
      <h1
        onClick={() => {
          console.log(`deleted: ${qwe}`);
          removeStorage(qwe);
        }}
      >
        removeStorage
      </h1>
      <p onClick={getName}>auth</p>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <br />
      <input
        type="text"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
        }}
      />
      <br />
      <button
        onClick={() => {
          login({ name, password });
        }}
      >
        auth
      </button>
      <button
        onClick={() => {
          signup({ name, password });
        }}
      >
        reg
      </button>
    </div>
  );
}
