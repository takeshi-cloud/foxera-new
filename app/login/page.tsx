"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function Login() {
const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const router = useRouter()

// 🔥 すでにログイン済みならHOMEへ
useEffect(() => {
const checkUser = async () => {
const { data } = await supabase.auth.getUser()
if (data.user) {
router.push("/")
}
}
checkUser()
}, [])

// 🔥 ログイン
const login = async () => {
const { error } = await supabase.auth.signInWithPassword({
email,
password,
})


if (error) {
  alert(error.message)
} else {
  router.push("/")
}

}

// 🔥 新規登録
const signup = async () => {
const { error } = await supabase.auth.signUp({
email,
password,
})

if (error) {
  alert(error.message)
} else {
  alert("登録成功")
  await supabase.auth.signInWithPassword({ email, password })
  router.push("/")
}

}

return (
<div style={{
display: "flex",
justifyContent: "center",
alignItems: "center",
height: "100vh",
background: "#0f172a",
color: "white"
}}>
<div style={{
background: "#1e293b",
padding: 40,
borderRadius: 12,
width: 320,
boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
}}>
<h1 style={{ fontSize: 24, marginBottom: 20 }}>Foxera Login</h1>
   <input
      placeholder="Email"
      onChange={(e) => setEmail(e.target.value)}
      style={{
        width: "100%",
        padding: 12,
        fontSize: 16,
        marginBottom: 15,
        borderRadius: 6,
        border: "none"
      }}
    />

    <input
      type="password"
      placeholder="Password"
      onChange={(e) => setPassword(e.target.value)}
      style={{
        width: "100%",
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        borderRadius: 6,
        border: "none"
      }}
    />

    <button
      onClick={login}
      style={{
        width: "100%",
        padding: 12,
        fontSize: 16,
        marginBottom: 10,
        borderRadius: 6,
        background: "#3b82f6",
        color: "white",
        border: "none",
        cursor: "pointer"
      }}
    >
      ログイン
    </button>

    <button
      onClick={signup}
      style={{
        width: "100%",
        padding: 12,
        fontSize: 16,
        borderRadius: 6,
        background: "#22c55e",
        color: "white",
        border: "none",
        cursor: "pointer"
      }}
    >
      新規登録
    </button>
  </div>
</div>


)
}
