// src/RouteLoader.jsx
import React, { useState, useLayoutEffect, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';

const FullPageLoader = () => (
  <div className="fixed inset-0 bg-white/75 z-50 flex items-center justify-center">
    <Loader className="w-12 h-12 animate-spin text-blue-600" />
  </div>
);

export default function RouteLoader() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // start loader immediately on location change
  useLayoutEffect(() => {
    setLoading(true);
  }, [location]);

  // stop loader after render complete
  useEffect(() => {
    setLoading(false);
  }, [location]);

  return loading ? <FullPageLoader /> : null;
}
