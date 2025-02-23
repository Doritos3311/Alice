// my-next-app\src\app\routes\test\page.tsx
"use client";

import Test from "@/components/ChatPanel/ChatPanel";

export default function ComponenteTest() {
  return <Test isIAOpen={false} setIsIAOpen={function (isOpen: boolean): void {
    throw new Error("Function not implemented.");
  } } />;
}