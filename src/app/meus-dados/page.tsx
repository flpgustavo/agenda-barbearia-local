'use client';

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function MeusDados() {
  const [Page, setPage] = useState<React.ComponentType | null>(null);

  useEffect(() => {
    import("./MeusDadosPage").then((mod) => setPage(() => mod.default));
  }, []);

  if (!Page) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pb-24 p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <Page />;
}
