"use client";

import axios from "axios";

import { useState } from "react";

import Image from "next/image";
import styles from "./page.module.css";

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
      <input type="text" 
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          // console.log(password);
        }}/>
      <br />
      <button onClick={() => {console.log("asd");}}>auth</button>
    </div>
  );
}
