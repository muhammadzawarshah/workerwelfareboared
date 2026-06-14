"use client";

import { useState } from "react";
import type { ModalContent } from "@/src/types";

/** Lightweight modal controller shared across feature screens. */
export function useModal() {
  const [modal, setModal] = useState<ModalContent | null>(null);
  return {
    modal,
    open: (content: ModalContent) => setModal(content),
    close: () => setModal(null),
  };
}
