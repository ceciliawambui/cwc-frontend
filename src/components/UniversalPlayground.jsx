/* UniversalPlayground.jsx */
import React, { useState, useRef } from "react";
import axios from "axios";
import { Play, Copy, RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";

export default function UniversalPlayground({ language = "javascript", code = "", runApi = `${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"}/api/run-code/` }) {
  const iframeRef = useRef(null);
  const [userCode, setUserCode] = useState(code || "");
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState("");

  const runClientSide = () => {
    // For JS simple preview (dangerous if code touches DOM), so prefer server-run.
    try {
      const safeSrcDoc = `<!doctype html><html><head><meta charset="utf-8"/></head><body><pre id="out"></pre><script>try{ ${userCode} }catch(e){ document.getElementById('out').innerText = 'Error: '+e;}</script></body></html>`;
      if (iframeRef.current) iframeRef.current.srcdoc = safeSrcDoc;
    } catch (e) {
      console.error(e);
    }
  };

  const runServer = async () => {
    setRunning(true);
    setOutput("");
    try {
      const res = await axios.post(runApi, { code: userCode, language }, { timeout: 30000 });
      setOutput(res.data.output || res.data.error || "No output");
    } catch (err) {
      console.error(err);
      setOutput(err.response?.data?.error || err.message || "Failed to run");
    } finally {
      setRunning(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(userCode);
    toast.success("Code copied");
  };

  const reset = () => setUserCode(code || "");

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="flex justify-between items-center px-3 py-2 bg-gray-50 border-b">
        <span className="text-sm font-medium">{language.toUpperCase()}</span>
        <div className="flex gap-2">
          <button onClick={runServer} className="px-3 py-1 bg-indigo-600 text-white text-sm rounded flex items-center gap-2" disabled={running}>
            <Play size={14}/> {running ? "Running..." : "Run"}
          </button>
          <button onClick={reset} className="p-2 rounded hover:bg-gray-100"><RefreshCcw size={14}/></button>
          <button onClick={copy} className="p-2 rounded hover:bg-gray-100">Copy</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 p-3">
        <textarea value={userCode} onChange={(e) => setUserCode(e.target.value)} className="font-mono text-sm border rounded p-3 min-h-[200px] bg-gray-900 text-green-100"/>
        <div className="border rounded p-2 min-h-[200px]">
          {/* Server output */}
          <div className="mb-3">
            <h4 className="text-sm font-semibold">Output</h4>
            <pre className="whitespace-pre-wrap text-sm bg-black text-white p-2 rounded min-h-[100px]">{output}</pre>
          </div>
          {/* Optional client-run iframe (for JS only) */}
          <div className="mt-3">
            <h4 className="text-sm font-semibold">Client Preview (JS)</h4>
            <iframe ref={iframeRef} title="preview" className="w-full h-40 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
