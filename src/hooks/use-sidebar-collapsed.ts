"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bpa_sidebar_collapsed";

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setCollapsed(stored === "1");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
  }, [collapsed, ready]);

  return {
    collapsed,
    ready,
    toggle: () => setCollapsed((value) => !value),
    setCollapsed,
  };
}
