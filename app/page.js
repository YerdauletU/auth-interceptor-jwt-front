"use client";

import axios from "axios";

import { getAsd } from "./hooks/papka";

import { useState } from "react";

import Image from "next/image";
import styles from "./page.module.css";

const getReg = async (name, password) => {
  let reqUser = await axios.post("http://localhost:8080/api/signup", {
    name,
    password,
  });
  console.log(reqUser.data);
};

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

    if (error.response.status === 404) console.log("error");

    console.log(error.config);

    // Проверяем, была ли ошибка из-за истекшего access token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      console.log(error.config);

      let accessToken = error.response.data.access;

      try {
        console.log("access: " + accessToken);
        // Отправляем запрос на обновление access token на сервер
        const response = await axios.post(
          "http://localhost:8080/api/refresh",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        // Сохраняем новый access token в localStorage
        saveAccessTokenToLocalStorage(response.data.accessToken);

        // Повторяем оригинальный запрос с новым access token
        // return instance(originalRequest);
        return response;
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

export default function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div>
      <p>auth</p>
      <input
        type="text"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          // console.log(name);
        }}
      />
      <br />
      <input
        type="text"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          // console.log(password);
        }}
      />
      <br />
      <button
        onClick={() => {
          login({ name, password });
          // console.log("jfnjsncs");
        }}
      >
        auth
      </button>
    </div>
  );
}
