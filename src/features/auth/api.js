// // import axios from "axios";

// // export const API_BASE = import.meta.env.VITE_API_BASE;

// // const client = axios.create({
// //   baseURL: API_BASE,
// //   headers: { "Content-Type": "application/json" },
// // });

// // client.interceptors.request.use((config) => {
// //   try {
// //     const auth = JSON.parse(localStorage.getItem("auth"));
// //     const token = auth?.access;
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //   } catch (err) {
// //     console.warn("No token found:", err);
// //   }
// //   return config;
// // });

// // client.interceptors.response.use(
// //   (res) => res,
// //   async (error) => {
// //     if (error.response?.status === 401) {
// //       const auth = JSON.parse(localStorage.getItem("auth"));
// //       const refresh = auth?.refresh;

// //       if (refresh) {
// //         try {
// //           const { data } = await axios.post("https://devhaven.onrender.com/token/refresh/", {
// //             refresh,
// //           });
// //           const updatedAuth = { ...auth, access: data.access };
// //           localStorage.setItem("auth", JSON.stringify(updatedAuth));
// //           error.config.headers.Authorization = `Bearer ${data.access}`;
// //           return axios(error.config);
// //         } catch (refreshErr) {
// //           console.error("Token refresh failed:", refreshErr);
// //           localStorage.removeItem("auth");
// //           localStorage.removeItem("user");
// //           window.location.href = "/login";
// //         }
// //       }
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// // export async function loginRequest({ email, password }) {
// //   return client.post("https://devhaven.onrender.com/login/", { username: email, password });
// // }

// // export async function registerRequest(payload) {
// //   return client.post("https://devhaven.onrender.com/register/", payload);
// // }

// // export default client;
// import axios from "axios";

// export const API_BASE = import.meta.env.VITE_API_BASE;

// const client = axios.create({
//   baseURL: API_BASE, // Example: https://devhaven.onrender.com/api/
//   headers: { "Content-Type": "application/json" },
// });

// // ---------- REQUEST INTERCEPTOR ----------
// client.interceptors.request.use((config) => {
//   try {
//     const auth = JSON.parse(localStorage.getItem("auth"));
//     const token = auth?.access;

//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   } catch (err) {
//     console.warn("No token found:", err);
//   }

//   return config;
// });

// // ---------- RESPONSE INTERCEPTOR ----------
// client.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     if (error.response?.status === 401) {
//       const auth = JSON.parse(localStorage.getItem("auth"));
//       const refresh = auth?.refresh;

//       if (refresh) {
//         try {
//           const { data } = await axios.post(`${API_BASE}/token/refresh/`, {
//             refresh,
//           });

//           const updatedAuth = { ...auth, access: data.access };
//           localStorage.setItem("auth", JSON.stringify(updatedAuth));

//           // retry the original request
//           error.config.headers.Authorization = `Bearer ${data.access}`;
//           return axios(error.config);
//         } catch (refreshErr) {
//           console.error("Token refresh failed:", refreshErr);

//           localStorage.removeItem("auth");
//           localStorage.removeItem("user");
//           window.location.href = "/login";
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// // ----------------------------------------
// //             AUTH REQUESTS
// // ----------------------------------------

// export async function loginRequest({ email, password }) {
//   const res = await client.post("/login/", {
//     username: email,
//     password,
//   });

//   const { access, refresh, user } = res.data;

//   // Save login data
//   localStorage.setItem("auth", JSON.stringify({ access, refresh }));
//   localStorage.setItem("user", JSON.stringify(user));

//   return res;
// }

// export async function registerRequest(payload) {
//   return client.post("/register/", payload);
// }
// export const refreshRequest = async () => {
//   return axios.post("/auth/refresh/");
// };

// export default client;


import axios from "axios";

// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_BASE = "http://127.0.0.1:8000";


// Create axios instance
const client = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

// ---------- REQUEST INTERCEPTOR ----------
client.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth?.access;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("No token found:", err);
  }

  return config;
});

// ---------- RESPONSE INTERCEPTOR ----------
client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    // if (error.response?.status === 401 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/token/refresh/")
    ) {
    

      try {
        const auth = JSON.parse(localStorage.getItem("auth"));
        const refresh = auth?.refresh;

        if (!refresh) {
          throw new Error("No refresh token available");
        }

        // Try to refresh the token
        const { data } = await axios.post(`${API_BASE}/api/auth/token/refresh/`, {
          refresh,
        });

        const updatedAuth = { ...auth, access: data.access };
        localStorage.setItem("auth", JSON.stringify(updatedAuth));

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        // return axios(originalRequest);
        return client(originalRequest);
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);

        // Clear auth data and redirect to login
        localStorage.removeItem("auth");
        localStorage.removeItem("user");
        window.location.href = "/login";

        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

// ========================================================================
// Authentication API
// ========================================================================

/**
 * Login user with email/username and password
 * @param {Object} credentials - { email, password }
 * @returns {Promise} Response with tokens and user data
 */
export async function loginRequest({ email, password }) {
  try {
    // JWT TokenObtainPairView always expects 'username' field,
    // even when USERNAME_FIELD is 'email'. The serializer maps it internally.
    const loginPayload = {
      username: email.trim(),  // Always use 'username' for JWT
      password: password,
    };
    
    console.log("Login request payload:", loginPayload);
    
    const res = await client.post("/auth/login/", loginPayload);

    const { access, refresh, user } = res.data;

    if (!access || !refresh) {
      throw new Error("Invalid response from server - missing tokens");
    }

    if (!user) {
      throw new Error("Invalid response from server - missing user data");
    }

    // Save auth data
    localStorage.setItem("auth", JSON.stringify({ access, refresh }));
    localStorage.setItem("user", JSON.stringify(user));

    console.log("Login successful:", { user: user.email, role: user.role });

    return res;
  } catch (error) {
    console.error("Login API Error:", error.response?.data);
    console.error("Request data sent:", error.config?.data);
    throw error;
  }
}

/**
 * Register new user
 * @param {Object} payload - User registration data
 * @returns {Promise} Response with user data
 */
export async function registerRequest(payload) {
  try {
    // Ensure payload matches backend expectations
    const registrationData = {
      username: payload.username || payload.email, // Use email as username if username not provided
      email: payload.email,
      password: payload.password,
      password_confirm: payload.password_confirm, // Match backend field name
      name: payload.name || "",
      role: payload.role || "learner", // Default role
    };

    console.log("Sending registration data:", registrationData);
    
    const res = await client.post("/auth/register/", registrationData);
    return res;
  } catch (error) {
    console.error("Registration API Error:", error.response?.data);
    throw error;
  }
}

/**
 * Refresh access token
 * @returns {Promise} Response with new access token
 */
export async function refreshRequest() {
  const auth = JSON.parse(localStorage.getItem("auth"));
  return client.post("/auth/token/refresh/", {
    refresh: auth?.refresh,
  });
}

/**
 * Get current user profile
 * @returns {Promise} User profile data
 */
export async function getCurrentUser() {
  const response = await client.get("/users/me/");
  return response.data;
}

// ========================================================================
// Course API
// ========================================================================

/**
 * Get all courses
 * @param {Object} params - Query parameters (e.g., category)
 * @returns {Promise} List of courses
 */
export async function getCourses(params = {}) {
  const response = await client.get("/courses/", { params });
  return response.data;
}

/**
 * Get course by slug
 * @param {string} slug - Course slug
 * @returns {Promise} Course details
 */
export async function getCourseBySlug(slug) {
  const response = await client.get(`/courses/${slug}/`);
  return response.data;
}

/**
 * Create new course (admin only)
 * @param {Object} courseData - Course data
 * @returns {Promise} Created course
 */
export async function createCourse(courseData) {
  const response = await client.post("/courses/", courseData);
  return response.data;
}

/**
 * Update course (admin only)
 * @param {string} slug - Course slug
 * @param {Object} courseData - Updated course data
 * @returns {Promise} Updated course
 */
export async function updateCourse(slug, courseData) {
  const response = await client.patch(`/courses/${slug}/`, courseData);
  return response.data;
}

/**
 * Delete course (admin only)
 * @param {string} slug - Course slug
 * @returns {Promise}
 */
export async function deleteCourse(slug) {
  const response = await client.delete(`/courses/${slug}/`);
  return response.data;
}

// ========================================================================
// Topic API
// ========================================================================

/**
 * Get all topics
 * @param {string} courseId - Optional course ID to filter
 * @returns {Promise} List of topics
 */
export async function getTopics(courseId = null) {
  const params = courseId ? { course: courseId } : {};
  const response = await client.get("/topics/", { params });
  return response.data;
}

/**
 * Get topic by slug
 * @param {string} slug - Topic slug
 * @returns {Promise} Topic details
 */
export async function getTopicBySlug(slug) {
  const response = await client.get(`/topics/by-slug/${slug}/`);
  return response.data;
}

/**
 * Create new topic (admin only)
 * @param {Object} topicData - Topic data
 * @returns {Promise} Created topic
 */
export async function createTopic(topicData) {
  const response = await client.post("/topics/", topicData);
  return response.data;
}

/**
 * Update topic (admin only)
 * @param {string} id - Topic ID
 * @param {Object} topicData - Updated topic data
 * @returns {Promise} Updated topic
 */
export async function updateTopic(id, topicData) {
  const response = await client.patch(`/topics/${id}/`, topicData);
  return response.data;
}

/**
 * Delete topic (admin only)
 * @param {string} id - Topic ID
 * @returns {Promise}
 */
export async function deleteTopic(id) {
  const response = await client.delete(`/topics/${id}/`);
  return response.data;
}

/**
 * Get recommended topics for a topic
 * @param {string} topicId - Topic ID
 * @returns {Promise} List of recommended topics
 */
export async function getRecommendedTopics(topicId) {
  const response = await client.get(`/topics/${topicId}/recommended/`);
  return response.data;
}

// ========================================================================
// Code Execution API
// ========================================================================

/**
 * Execute code in sandbox
 * @param {string} code - Code to execute
 * @param {string} language - Programming language (python/javascript)
 * @returns {Promise} Execution result
 */
export async function runCode(code, language = "python") {
  const response = await client.post("/code/run/", {
    code,
    language,
  });
  return response.data;
}

// ========================================================================
// File Upload API
// ========================================================================

/**
 * Upload image for editor
 * @param {File} file - Image file
 * @returns {Promise} Uploaded file URL
 */
export async function uploadEditorImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await client.post("/uploads/editor-image/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Upload generic file
 * @param {File} file - File to upload
 * @returns {Promise} Uploaded file URL
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await client.post("/uploads/file/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

// ========================================================================
// User Management API
// ========================================================================

/**
 * Get all users (admin only)
 * @param {Object} params - Query parameters (e.g., role)
 * @returns {Promise} List of users
 */
export async function getUsers(params = {}) {
  const response = await client.get("/users/", { params });
  return response.data;
}

/**
 * Get user by ID (admin only)
 * @param {number} userId - User ID
 * @returns {Promise} User details
 */
export async function getUserById(userId) {
  const response = await client.get(`/users/${userId}/`);
  return response.data;
}

/**
 * Update user (admin only)
 * @param {number} userId - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise} Updated user
 */
export async function updateUser(userId, userData) {
  const response = await client.patch(`/users/${userId}/`, userData);
  return response.data;
}

/**
 * Delete user (admin only)
 * @param {number} userId - User ID
 * @returns {Promise}
 */
export async function deleteUser(userId) {
  const response = await client.delete(`/users/${userId}/`);
  return response.data;
}

// ========================================================================
// Admin Dashboard API
// ========================================================================

/**
 * Get dashboard statistics (admin only)
 * @returns {Promise} Dashboard stats
 */
export async function getDashboardStats() {
  const response = await client.get("/admin/dashboard/stats/");
  return response.data;
}

// ========================================================================
// Payment API
// ========================================================================

/**
 * Initiate support payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise} Payment initialization response
 */
export async function initiatePayment(paymentData) {
  const response = await client.post("/payments/initiate/", paymentData);
  return response.data;
}

/**
 * Get all payments (admin only)
 * @returns {Promise} List of payments
 */
export async function getPayments() {
  const response = await client.get("/payments/");
  return response.data;
}

/**
 * Verify payment
 * @param {string} reference - Payment reference
 * @returns {Promise} Payment verification result
 */
export async function verifyPayment(reference) {
  const response = await client.get(`/payments/verify/${reference}/`);
  return response.data;
}

export default client;