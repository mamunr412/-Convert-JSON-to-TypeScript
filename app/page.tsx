"use client";

import { useState } from "react";
import { Trash2, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function JsonConverter() {
  const [jsonInput, setJsonInput] = useState("");
  const [typeOutput, setTypeOutput] = useState(
    "// TypeScript definitions will appear here..."
  );

  // Convert JSON to TypeScript type definitions
  const convertToTypeScript = (json: string): string => {
    try {
      const parsed = JSON.parse(json);
      return generateTypeDefinition(parsed);
    } catch (error) {
      return "// Error: Invalid JSON input";
    }
  };

  // Generate TypeScript type definition recursively
  const generateTypeDefinition = (
    obj: any,
    interfaceName = "RootType"
  ): string => {
    if (Array.isArray(obj)) {
      const sample = obj[0];
      if (sample && typeof sample === "object") {
        return generateTypeDefinition(sample, interfaceName) + "[]";
      }
      return `${typeof sample}[]`;
    }

    if (typeof obj === "object" && obj !== null) {
      const properties = Object.entries(obj)
        .map(([key, value]) => {
          const type =
            typeof value === "object" && value !== null
              ? Array.isArray(value)
                ? `${generateTypeDefinition(value, capitalize(key))}`
                : capitalize(key)
              : typeof value;
          return `  ${key}: ${type};`;
        })
        .join("\n");

      const interfaces = Object.entries(obj)
        .filter(
          ([_, value]) =>
            typeof value === "object" && value !== null && !Array.isArray(value)
        )
        .map(([key, value]) => generateTypeDefinition(value, capitalize(key)))
        .join("\n\n");

      return `interface ${interfaceName} {\n${properties}\n}\n\n${interfaces}`.trim();
    }

    return typeof obj;
  };

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handle JSON input changes
  const handleInputChange = (value: string) => {
    setJsonInput(value);
    if (value.trim()) {
      setTypeOutput(convertToTypeScript(value));
    } else {
      setTypeOutput("// TypeScript definitions will appear here...");
    }
  };

  // Load example JSON
  const loadExample = () => {
    const example = JSON.stringify(
      {
        name: "John Doe",
        age: 30,
        isActive: true,
        address: {
          street: "123 Main St",
          city: "Boston",
          country: "USA",
        },
        hobbies: ["reading", "gaming", "coding"],
      },
      null,
      2
    );
    handleInputChange(example);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">JSON to TypeScript</h1>
          <p className="text-slate-400">
            Convert JSON to TypeScript type definitions instantly
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base font-medium text-white">
                JSON Input
              </CardTitle>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadExample}
                  className="text-white"
                >
                  <FileCode2 className="w-4 h-4 mr-2" />
                  Load Example
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleInputChange("")}
                  className="text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your JSON here..."
                className="min-h-[500px] font-mono bg-slate-950 border-slate-800 text-white"
                value={jsonInput}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-medium text-white">
                TypeScript Definition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="min-h-[500px] p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm overflow-auto text-white">
                {typeOutput}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
