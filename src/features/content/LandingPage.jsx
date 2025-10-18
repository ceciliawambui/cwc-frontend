import React, { useState } from "react";
import AnimatedBackground from "../../components/AnimatedBackground";
import { Link } from "react-router-dom";
import ThemeToggle from "../../components/ThemeToggle";

export default function LandingPage() {
  const [items] = useState([
    { id: 1, name: "React", color: "from-indigo-500 to-pink-500" },
    { id: 2, name: "Django", color: "from-green-400 to-teal-400" },
    { id: 3, name: "UI/UX", color: "from-yellow-400 to-orange-400" },
  ]);

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-700 ease-in-out">
      <AnimatedBackground />

      <div className="relative z-10 container mx-auto px-6 py-24">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">Knowledge Hub</h1>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link to="/login" className="text-sm text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400">Admin</Link>
            <Link to="/register" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Sign up</Link>
          </div>
        </header>

        <main className="mt-12 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.id} className="rounded-2xl p-6 glass-effect hover:scale-105 transform transition-transform duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{it.name}</h3>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${it.color} opacity-95`} />
              </div>

              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">Curated notes & examples.</p>

              <div className="mt-4">
                <a className="text-indigo-600 dark:text-indigo-400 hover:underline" href="#">Explore →</a>
              </div>
            </article>
          ))}
        </main>
      </div>
    </div>
  );
}
