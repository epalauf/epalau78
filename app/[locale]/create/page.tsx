import { Suspense } from "react";
import Editor from "@/components/editor/Editor";

export default function CreatePage() {
  return (
    <Suspense fallback={null}>
      <Editor />
    </Suspense>
  );
}
