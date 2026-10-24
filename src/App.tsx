import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Pricing from '@/pages/Pricing';
import Portfolio from '@/pages/Portfolio';
import About from '@/pages/About';
import Support from '@/pages/Support';
import Contact from '@/pages/Contact';
import NotFound from '@/pages/not-found';
import LandingPage from '@/pages/LandingPage';
import ThankYou from '@/pages/ThankYou';
import { Privacy, Terms } from '@/pages/Legal';
import { ConsentBanner } from '@/components/ConsentBanner';

import TawkToWidget from '@/components/TawkToWidget';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ScrollManager from '@/components/ScrollManager';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={Services} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/portfolio" component={Portfolio} />
      <Route path="/about" component={About} />
      <Route path="/support" component={Support} />
      <Route path="/contact" component={Contact} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/lp/:slug" component={LandingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

/** `ssrPath` is only passed by the build-time prerender (src/entry-server.tsx). */
function App({ ssrPath }: { ssrPath?: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')} ssrPath={ssrPath}>
          <GoogleAnalytics />
          <ScrollManager />
          <Router />
        </WouterRouter>
        <Toaster />
        <TawkToWidget />
        <ConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
