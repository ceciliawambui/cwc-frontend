import { useEffect, useState } from "react";

function App() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/courses/")
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-6">Tutorial Courses</h1>
      <ul className="space-y-4 w-full max-w-xl">
        {courses.map(course => (
          <li key={course.id} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-gray-600">{course.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
