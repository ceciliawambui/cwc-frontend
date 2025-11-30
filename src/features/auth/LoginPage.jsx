// import React from "react";
// import AuthLayout from "./AuthLayout";
// import AuthForm from "./AuthForm";
// import { useNavigate } from "react-router-dom";
// import useAuth from "../../hooks/useAuth";

// export default function LoginPage() {
//   const nav = useNavigate();
//   const { user } = useAuth();

//   React.useEffect(() => {
//     if (!user) return; 

//     if (user.is_admin || user.role === "admin") {
//       nav("/admin");
//     } else {
//       nav("/");
//     }
//   }, [user, nav]);

//   console.log(JSON.parse(localStorage.getItem("user")));


//   return (
//     <AuthLayout title="Sign in to Your Account">
//       <AuthForm
//         mode="login"
//         onSuccess={(userData) =>
//           setTimeout(() => {
//             if (userData.role === "admin" || userData.is_admin) {
//               nav("/admin");
//             } else {
//               nav("/");
//             }
//           }, 400)
//         }
//       />
//       <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
//         New here?{" "}
//         <a href="/register" className="text-indigo-500 hover:underline">
//           Create an account
//         </a>
//       </p>
//     </AuthLayout>
//   );
// }

import React, { useEffect } from "react";
import AuthLayout from "./AuthLayout";
import AuthForm from "./AuthForm";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function LoginPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    if (user.is_admin || user.role === "admin") {
      nav("/admin");
    } else {
      nav("/");
    }
  }, [user, nav]);

  return (
    <AuthLayout title="Sign in to Your Account">
      <AuthForm
        mode="login"
        onSuccess={(userData) =>
          setTimeout(() => {
            if (userData.is_admin || userData.role === "admin") {
              nav("https://devhaven.onrender.com/admin");
            } else {
              nav("https://devhaven.onrender.com/");
            }
          }, 400)
        }
      />
      <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        New here?{" "}
        <a href="https://devhaven.onrender.com/register" className="text-indigo-500 hover:underline">
          Create an account
        </a>
      </p>
    </AuthLayout>
  );
}
