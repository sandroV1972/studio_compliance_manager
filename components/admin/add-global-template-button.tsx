"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GlobalTemplateForm } from "./global-template-form";

export function AddGlobalTemplateButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nuovo Template
      </Button>

      <GlobalTemplateForm
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
