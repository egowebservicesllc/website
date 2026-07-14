import React, { useEffect } from 'react';

export const CalendlyWidget: React.FC = () => {
  useEffect(() => {
    const containerId = 'calendly-inline-container';
    
    const initWidget = () => {
      const container = document.getElementById(containerId);
      if (container && (window as any).Calendly) {
        // Clear previous contents if any to avoid duplicating widget
        container.innerHTML = '';
        try {
          (window as any).Calendly.initInlineWidget({
            url: 'https://calendly.com/egowebservices/30min?background_color=ffffff&text_color=0f172a&primary_color=0060cc',
            parentElement: container,
            prefill: {},
            pageSettings: {}
          });
          console.log('Successfully manual-rendered Calendly widget.');
        } catch (error) {
          console.warn('Calendly manual-rendered exception:', error);
        }
      }
    };

    // Check if script is already present
    const scriptId = 'calendly-widget-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initWidget, 200);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(initWidget, 100);
    }

    // Set up a brief polling interval to catch delayed rendering
    const interval = setInterval(() => {
      const container = document.getElementById(containerId);
      if (container && container.innerHTML.trim() === '' && (window as any).Calendly) {
        initWidget();
      }
    }, 1000);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full mix-blend-normal rounded-3xl overflow-hidden border border-slate-200 bg-white relative shadow-lg h-[650px] md:h-[700px]">
      {/* Loading fallback inside matching container */}
      <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col items-center justify-center bg-slate-50 -z-10">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4"></div>
        <p className="text-sm font-medium text-slate-500 tracking-wide text-center">
          Loading the scheduler...
        </p>
      </div>
      
      <div 
        id="calendly-inline-container" 
        className="w-full h-full"
        style={{ minWidth: '320px', height: '100%' }}
      />
    </div>
  );
};
