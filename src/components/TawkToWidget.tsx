import React, { useEffect } from 'react';

const TAWK_SCRIPT_ID = 'tawk-to-embed-script';

const TawkToWidget: React.FC = () => {
  useEffect(() => {
    // Tawk.to manages a global singleton; injecting it more than once (e.g. on
    // React dev double-mounts or route remounts) throws inside its own script,
    // so only ever inject it once and never remove it afterwards.
    if (document.getElementById(TAWK_SCRIPT_ID)) {
      return;
    }

    const s1 = document.createElement("script");
    s1.id = TAWK_SCRIPT_ID;
    s1.async = true;
    s1.src = 'https://embed.tawk.to/5dd5b86b43be710e1d1e57f1/1jpd814d5';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    const s0 = document.getElementsByTagName("script")[0];
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  }, []);

  return null;
};

export default TawkToWidget;
