/* eslint-disable no-unused-vars */
import React, { useState} from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const UniversalCodeRunner = ({ code = "", language = "javascript" }) => {
  const [currentCode, setCurrentCode] = useState(code);
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  // Run code depending on language
  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    try {
      if (language === "javascript") {
        // JS code runner (with input simulated)
        const consoleLogs = [];
        const customConsole = { log: (...args) => consoleLogs.push(args.join(" ")) };
        const userInput = input.split("\n");
        const prompt = () => userInput.shift() || "";
        const func = new Function("console", "prompt", currentCode);
        func(customConsole, prompt);
        setOutput(consoleLogs.join("\n") || "✅ Code executed successfully!");
      } else if (language === "python") {
        // Call external API (Python sandbox)
        const res = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language: "python3",
            version: "3.10.0",
            files: [{ content: currentCode }],
            stdin: input,
          }),
        });
        const data = await res.json();
        setOutput(data.run.output || "✅ Code executed successfully!");
      } else if (language === "html") {
        const newWindow = window.open("", "_blank");
        newWindow.document.write(currentCode);
        newWindow.document.close();
        setOutput("🌐 Opened HTML preview in a new tab!");
      } else {
        setOutput("⚠️ Language not supported yet.");
      }

      toast.success("Execution complete!");
    } catch (error) {
      setOutput(`❌ Error: ${error.message}`);
      toast.error("Execution failed");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <motion.div
      className="my-6 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          🧠 {language.toUpperCase()} Runner
        </span>
        <button
          onClick={runCode}
          disabled={isRunning}
          className={`px-3 py-1.5 text-sm rounded-md font-medium ${
            isRunning
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isRunning ? "Running..." : "Run ▶"}
        </button>
      </div>

      {/* Editor */}
      <Editor
        height="300px"
        defaultLanguage={language}
        value={currentCode}
        theme="vs-dark"
        onChange={(val) => setCurrentCode(val)}
      />

      {/* Input + Output Console */}
      <div className="grid md:grid-cols-2 border-t border-gray-200 dark:border-gray-700">
        {/* Input */}
        <div className="p-4 border-r border-gray-200 dark:border-gray-700">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Input (stdin)
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="mt-2 w-full h-24 p-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter input values..."
          />
        </div>

        {/* Output */}
        <div className="p-4 bg-black text-green-400 font-mono text-sm overflow-auto rounded-br-xl">
          <span className="block text-xs font-semibold text-gray-400 uppercase mb-1">Output</span>
          <pre>{output}</pre>
        </div>
      </div>
    </motion.div>
  );
};

export default UniversalCodeRunner;
