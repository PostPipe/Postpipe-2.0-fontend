"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Code,
  Eye,
  Heading1,
  Type,
  Mail,
  MessageSquare,
  CheckSquare,
} from "lucide-react";

type FormField = {
  id: number;
  type: "text" | "email" | "textarea" | "checkbox";
  label: string;
};

const fieldTypes = [
  { type: "text", label: "Text Input", icon: <Type /> },
  { type: "email", label: "Email Input", icon: <Mail /> },
  { type: "textarea", label: "Text Area", icon: <MessageSquare /> },
  { type: "checkbox", label: "Checkbox", icon: <CheckSquare /> },
];

export function FormBuilder() {
  const [fields, setFields] = useState<FormField[]>([]);

  const addField = (type: FormField["type"]) => {
    const newField: FormField = {
      id: Date.now(),
      type,
      label: `New ${type} field`,
    };
    setFields([...fields, newField]);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="font-headline">Form Canvas</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2" /> Preview
          </Button>
          <Button size="sm">
            <Code className="mr-2" /> Get Code
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="col-span-1">
            <h3 className="mb-4 font-semibold">Form Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {fieldTypes.map((fieldType) => (
                <Button
                  key={fieldType.type}
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => addField(fieldType.type as FormField["type"])}
                >
                  {fieldType.icon}
                  {fieldType.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 md:col-span-2 min-h-[300px]">
            <div className="space-y-4">
              {fields.length === 0 && (
                <div className="flex h-full min-h-[250px] items-center justify-center text-muted-foreground">
                  <p>Add elements from the left panel to build your form.</p>
                </div>
              )}
              {fields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={String(field.id)}>{field.label}</Label>
                  {field.type === "text" && <Input id={String(field.id)} />}
                  {field.type === "email" && <Input type="email" id={String(field.id)} />}
                  {field.type === "textarea" && <Textarea id={String(field.id)} />}
                  {field.type === "checkbox" && (
                    <div className="flex items-center space-x-2">
                        <Input type="checkbox" id={String(field.id)} className="size-4" />
                        <Label htmlFor={String(field.id)}>Accept terms</Label>
                    </div>
                  )}
                </div>
              ))}
               {fields.length > 0 && (
                   <Button className="mt-4 bg-accent hover:bg-accent/90">Submit</Button>
               )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
