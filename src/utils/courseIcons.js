export const ICONS = {
    // ───────────────── Frontend ─────────────────
    html: "https://cdn.simpleicons.org/html5",
    css: "https://cdn.simpleicons.org/css",
    sass: "https://cdn.simpleicons.org/sass",
    tailwind: "https://cdn.simpleicons.org/tailwindcss",
    bootstrap: "https://cdn.simpleicons.org/bootstrap",
    javascript: "https://cdn.simpleicons.org/javascript",
    typescript: "https://cdn.simpleicons.org/typescript",
    react: "https://cdn.simpleicons.org/react",
    next: "https://cdn.simpleicons.org/nextdotjs",
    vue: "https://cdn.simpleicons.org/vuedotjs",
    angular: "https://cdn.simpleicons.org/angular",
    svelte: "https://cdn.simpleicons.org/svelte",
    vite: "https://cdn.simpleicons.org/vite",
    webpack: "https://cdn.simpleicons.org/webpack",
  
    // ───────────────── Backend ─────────────────
    node: "https://cdn.simpleicons.org/nodedotjs",
    express: "https://cdn.simpleicons.org/express",
    nest: "https://cdn.simpleicons.org/nestjs",
    django: "https://cdn.simpleicons.org/django",
    flask: "https://cdn.simpleicons.org/flask",
    fastapi: "https://cdn.simpleicons.org/fastapi",
    laravel: "https://cdn.simpleicons.org/laravel",
    spring: "https://cdn.simpleicons.org/spring",
    rails: "https://cdn.simpleicons.org/rubyonrails",
    dotnet: "https://cdn.simpleicons.org/dotnet",
  
    // ───────────────── Languages ─────────────────
    python: "https://cdn.simpleicons.org/python",
    java: "https://cdn.simpleicons.org/java",
    php: "https://cdn.simpleicons.org/php",
    ruby: "https://cdn.simpleicons.org/ruby",
    go: "https://cdn.simpleicons.org/go",
    rust: "https://cdn.simpleicons.org/rust",
    csharp: "https://cdn.simpleicons.org/csharp",
    cpp: "https://cdn.simpleicons.org/cplusplus",
  
    // ───────────────── Databases ─────────────────
    postgres: "https://cdn.simpleicons.org/postgresql",
    mysql: "https://cdn.simpleicons.org/mysql",
    mongodb: "https://cdn.simpleicons.org/mongodb",
    redis: "https://cdn.simpleicons.org/redis",
    sqlite: "https://cdn.simpleicons.org/sqlite",
    firebase: "https://cdn.simpleicons.org/firebase",
    supabase: "https://cdn.simpleicons.org/supabase",
  
    // ───────────────── DevOps & Cloud ─────────────────
    docker: "https://cdn.simpleicons.org/docker",
    kubernetes: "https://cdn.simpleicons.org/kubernetes",
    nginx: "https://cdn.simpleicons.org/nginx",
    apache: "https://cdn.simpleicons.org/apache",
    aws: "https://cdn.simpleicons.org/amazonaws",
    azure: "https://cdn.simpleicons.org/microsoftazure",
    gcp: "https://cdn.simpleicons.org/googlecloud",
    vercel: "https://cdn.simpleicons.org/vercel",
    netlify: "https://cdn.simpleicons.org/netlify",
    terraform: "https://cdn.simpleicons.org/terraform",
  
    // ───────────────── Version Control & Tooling ─────────────────
    git: "https://cdn.simpleicons.org/git",
    github: "https://cdn.simpleicons.org/github",
    gitlab: "https://cdn.simpleicons.org/gitlab",
    bitbucket: "https://cdn.simpleicons.org/bitbucket",
    jira: "https://cdn.simpleicons.org/jira",
    figma: "https://cdn.simpleicons.org/figma",
    postman: "https://cdn.simpleicons.org/postman",
    vscode: "https://cdn.simpleicons.org/visualstudiocode",
  
    // ───────────────── Mobile ─────────────────
    android: "https://cdn.simpleicons.org/android",
    ios: "https://cdn.simpleicons.org/apple",
    flutter: "https://cdn.simpleicons.org/flutter",
    reactnative: "https://cdn.simpleicons.org/react",
  
    // ───────────────── AI / ML / Data ─────────────────
    ai: "https://cdn.simpleicons.org/openai",
    openai: "https://cdn.simpleicons.org/openai",
    tensorflow: "https://cdn.simpleicons.org/tensorflow",
    pytorch: "https://cdn.simpleicons.org/pytorch",
    pandas: "https://cdn.simpleicons.org/pandas",
    numpy: "https://cdn.simpleicons.org/numpy",
    jupyter: "https://cdn.simpleicons.org/jupyter",
  };
  
  
  export function resolveCourseIcon(title = "") {
    const key = title.toLowerCase();
  
    for (const tech in ICONS) {
      if (key.includes(tech)) return { type: "image", value: ICONS[tech] };
    }
  
    if (key.includes("api")) return { type: "lucide", value: "Webhook" };
    if (key.includes("database") || key.includes("sql"))
      return { type: "lucide", value: "Database" };
    if (key.includes("devops") || key.includes("deploy"))
      return { type: "lucide", value: "Server" };
    if (key.includes("algorithm") || key.includes("data"))
      return { type: "lucide", value: "Binary" };
    if (key.includes("design"))
      return { type: "lucide", value: "Palette" };
  
    return { type: "lucide", value: "BookOpen" };
  }
  