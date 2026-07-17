"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function AgendaMensal() {
  const [Page, setPage] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("./AgendaMensalPage").then((mod) => setPage(() => mod.default));
  }, []);

  if (!Page) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Page />;
}
