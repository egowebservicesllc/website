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
import LandingPage, { ServicePage } from '@/pages/LandingPage';
import ThankYou from '@/pages/ThankYou';
import Checkout from '@/pages/Checkout';
import Portal from '@/pages/Portal';
import Affiliates from '@/pages/Affiliates';
import AffiliateDashboard from '@/pages/AffiliateDashboard';
import { Privacy, Terms } from '@/pages/Legal';
import { BlogIndex, BlogPostPage } from '@/pages/Blog';
import { SolutionsIndex, SolutionPage } from '@/pages/Solutions';
import { FreeCostReview, FreeWebsiteCheck, MigrationChecklist } from '@/pages/FreeOffers';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ConsentBanner } from '@/components/ConsentBanner';
import { EngagePrompt } from '@/components/EngagePrompt';
import CloudPage from '@/pages/CloudPage';
import { CLOUD_PAGES } from '@/lib/cloud';

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
      <Route path="/checkout" component={Checkout} />
      <Route path="/portal" component={Portal} />
      <Route path="/affiliates" component={Affiliates} />
      <Route path="/affiliates/dashboard" component={AffiliateDashboard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/solutions" component={SolutionsIndex} />
      <Route path="/solutions/:slug" component={SolutionPage} />
      <Route path="/free-cloud-cost-review" component={FreeCostReview} />
      <Route path="/free-website-check" component={FreeWebsiteCheck} />
      <Route path="/cloud-migration-checklist" component={MigrationChecklist} />
      <Route path="/lp/:slug" component={LandingPage} />
      <Route path="/hosting" component={ServicePage} />
      <Route path="/web-development" component={ServicePage} />
      <Route path="/mobile-app-development" component={ServicePage} />
      <Route path="/branding-design" component={ServicePage} />
      <Route path="/digital-marketing" component={ServicePage} />
      {CLOUD_PAGES.map((p) => (
        <Route key={p.path} path={p.path}>
          <CloudPage path={p.path} />
        </Route>
      ))}
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
          <EngagePrompt />
          <WhatsAppButton />
        </WouterRouter>
        <Toaster />
        <TawkToWidget />
        <ConsentBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
