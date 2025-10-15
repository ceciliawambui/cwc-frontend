import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

/* Minimal but modern landing — fetches languages (courses) */
export default function LandingPage() {
  const [items] = useState([
    { id: 1, name: "React", color: "from-indigo-500 to-pink-500" },
    { id: 2, name: "Django", color: "from-green-400 to-teal-400" },
    { id: 3, name: "UI/UX", color: "from-yellow-400 to-orange-400" },
  ]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <div className="relative z-10 container mx-auto px-6 py-24">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
            Knowledge Hub
          </h1>
          <div>
          <ThemeToggle />
            <Link to="/login" className="mr-4 text-sm text-gray-800 dark:text-gray-200">
              Admin
            </Link>
            <Link to="/register" className="text-sm text-indigo-600">
              Sign up
            </Link>
          </div>
        </header>

        <main className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article
              key={it.id}
              className={`rounded-2xl p-6 glass-effect hover:scale-105 transform transition`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">{it.name}</h3>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${it.color} opacity-90`} />
              </div>
              <p className="mt-3 text-sm text-gray-300">Curated notes & examples.</p>
              <div className="mt-4">
                <a className="text-indigo-200 hover:underline" href="#">
                  Explore →
                </a>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
