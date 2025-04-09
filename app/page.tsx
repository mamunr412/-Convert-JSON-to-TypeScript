"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import {
  Copy,
  FileJson,
  FileType2,
  Clipboard,
  AlertCircle,
  Check,
  FileCode,
  Trash2,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { debounce } from "lodash";
import AdBanner from "@/components/AdBanner";

// Function to convert JSON to TypeScript interface
function jsonToTypeScript(json: string): string {
  try {
    const obj = JSON.parse(json);
    if (Array.isArray(obj)) {
      const itemType = generateTypeScriptInterface(obj[0], "Root");
      return `export type RootType = Root[];\n\n${itemType}`;
    }
    return generateTypeScriptInterface(obj, "RootType");
  } catch (error) {
    throw new Error("Invalid JSON");
  }
}

function generateTypeScriptInterface(obj: any, interfaceName: string): string {
  let output = `export interface ${interfaceName} {\n`;
  const nestedInterfaces: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const { type, nested } = getType(value, key);
    output += `  ${key}${type.endsWith("?") ? "" : ":"} ${type};\n`;
    nestedInterfaces.push(...nested);
  }

  output += "}\n\n";
  output += nestedInterfaces.join("\n");
  return output.trim();
}

function getType(value: any, key: string): { type: string; nested: string[] } {
  if (value === null) return { type: "null", nested: [] };
  if (Array.isArray(value)) {
    if (value.length === 0) return { type: "any[]", nested: [] };
    const { type, nested } = getType(value[0], `${key}Item`);
    return { type: `${type}[]`, nested };
  }
  if (typeof value === "object") {
    const interfaceName = key.charAt(0).toUpperCase() + key.slice(1);
    const nestedInterface = generateTypeScriptInterface(value, interfaceName);
    return { type: interfaceName, nested: [nestedInterface] };
  }
  const tsType = typeof value;
  return { type: tsType === "undefined" ? `${tsType}?` : tsType, nested: [] };
}

export default function JsonConverter() {
  const [jsonInput, setJsonInput] = useState("");
  const [tsOutput, setTsOutput] = useState("");
  const [isValidJson, setIsValidJson] = useState(true);
  const editorRef = useRef<any>(null);
  const [isCopied, setIsCopied] = useState(false);

  const validateAndConvertJSON = useCallback((input: string) => {
    try {
      if (!input.trim()) {
        setIsValidJson(true);
        setTsOutput("");
        return;
      }
      const parsed = JSON.parse(input);
      const formattedJson = JSON.stringify(parsed, null, 2);
      setJsonInput(formattedJson);
      setIsValidJson(true);
      const converted = jsonToTypeScript(formattedJson);
      setTsOutput(converted);
    } catch (e) {
      setIsValidJson(false);
      setTsOutput("");
    }
  }, []);

  const debouncedValidateAndConvert = useCallback(
    debounce(validateAndConvertJSON, 300),
    []
  );

  const handleJsonChange = (value: string | undefined) => {
    const newValue = value || "";
    setJsonInput(newValue);
    debouncedValidateAndConvert(newValue);
  };

  const handlePaste = async () => {
    try {
      if (editorRef.current) {
        const selection = editorRef.current.getSelection();
        editorRef.current.executeEdits("paste", [
          {
            range: selection,
            text: await navigator.clipboard.readText(),
            forceMoveMarkers: true,
          },
        ]);
        const newValue = editorRef.current.getValue();
        setJsonInput(newValue);
        validateAndConvertJSON(newValue);
      }
      toast.success("JSON pasted");
    } catch (error) {
      toast.error("Failed to paste from clipboard");
    }
  };

  const handleFormat = () => {
    validateAndConvertJSON(jsonInput);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const loadExample = () => {
    const example = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "isActive": true,
  "hobbies": ["reading", "swimming"],
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "country": "USA"
  }
}`;
    setJsonInput(example);
    validateAndConvertJSON(example);
    if (editorRef.current) {
      editorRef.current.setValue(example);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4 md:p-8">
      <div>
        <AdBanner />{" "}
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              JSON to TypeScript Converter
            </h1>
            <p className="text-slate-400">
              Convert JSON to TypeScript type definitions instantly
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-700 p-4">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-blue-400" />
                  <h2 className="font-semibold text-white">JSON Input</h2>
                  {!isValidJson && jsonInput && (
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  )}
                  {isValidJson && jsonInput && (
                    <Check className="h-5 w-5 text-green-400" />
                  )}
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={handlePaste}
                        >
                          <Clipboard className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Paste JSON</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={handleFormat}
                        >
                          <FileCode className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Format JSON</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={loadExample}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Load Example</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => {
                            setJsonInput("");
                            setTsOutput("");
                            setIsValidJson(true);
                            if (editorRef.current) {
                              editorRef.current.setValue("");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear input</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="p-0">
                <Editor
                  height="500px"
                  defaultLanguage="json"
                  theme="vs-dark"
                  value={jsonInput}
                  onChange={handleJsonChange}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 16, bottom: 16 },
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                  onMount={(editor) => {
                    editorRef.current = editor;
                  }}
                />
              </div>
            </Card>

            <Card className="border-slate-700 bg-slate-900/50 backdrop-blur">
              <div className="flex items-center justify-between border-b border-slate-700 p-4">
                <div className="flex items-center gap-2">
                  <FileType2 className="h-5 w-5 text-green-400" />
                  <h2 className="font-semibold text-white">
                    TypeScript Definition
                  </h2>
                </div>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => handleCopy(tsOutput)}
                          disabled={!tsOutput}
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCopied ? "Copied!" : "Copy TypeScript"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="p-0">
                <Editor
                  height="500px"
                  defaultLanguage="typescript"
                  theme="vs-dark"
                  value={tsOutput}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: "on",
                    readOnly: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 16, bottom: 16 },
                  }}
                />
              </div>
            </Card>
          </div>
        </div>{" "}
        <AdBanner />{" "}
      </div>
    </div>
  );
}
