"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mark } from "@/lib/brand";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(false);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      setErr(true);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form onSubmit={submit} className="card p-8 w-full max-w-sm text-center">
        <div className="flex justify-center mb-4">
          <Mark size={44} />
        </div>
        <h1 className="font-display font-semibold text-2xl">akrono · Admin</h1>
        <p className="text-sm text-neutral-500 mt-1 mb-6">Panel de gestión</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Contraseña"
          className="field mb-3"
          autoFocus
        />
        {err && <p className="text-sm text-[var(--clay)] mb-3">Contraseña incorrecta</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
          {loading ? "…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
