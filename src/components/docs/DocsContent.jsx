import React from 'react';
import OverviewContent from './content/OverviewContent';
import SignupContent from './content/SignupContent';
import DepositsContent from './content/DepositsContent';
import DepositProcessContent from './content/DepositProcessContent';
import MarketOverviewContent from './content/MarketOverviewContent';
import MarketCreationContent from './content/MarketCreationContent';
import MarketPricingContent from './content/MarketPricingContent';
import LimitOrdersContent from './content/LimitOrdersContent';
import MarketOrdersContent from './content/MarketOrdersContent';
import OrderBookContent from './content/OrderBookContent';
import ResolutionOverviewContent from './content/ResolutionOverviewContent';
import ProposeResolutionContent from './content/ProposeResolutionContent';
import SelfResolutionContent from './content/SelfResolutionContent';
import DisputeResolutionContent from './content/DisputeResolutionContent';
import FAQsContent from './content/FAQsContent';

const DocsContent = ({ activeSection, isDarkMode }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewContent isDarkMode={isDarkMode} />;
      case 'signup':
        return <SignupContent isDarkMode={isDarkMode} />;
      case 'deposits':
        return <DepositsContent isDarkMode={isDarkMode} />;
      case 'deposit-process':
        return <DepositProcessContent isDarkMode={isDarkMode} />;
      case 'market-overview':
        return <MarketOverviewContent isDarkMode={isDarkMode} />;
      case 'market-creation':
        return <MarketCreationContent isDarkMode={isDarkMode} />;
      case 'market-pricing':
        return <MarketPricingContent isDarkMode={isDarkMode} />;
      case 'limit-orders':
        return <LimitOrdersContent isDarkMode={isDarkMode} />;
      case 'market-orders':
        return <MarketOrdersContent isDarkMode={isDarkMode} />;
      case 'order-book':
        return <OrderBookContent isDarkMode={isDarkMode} />;
      case 'resolution-overview':
        return <ResolutionOverviewContent isDarkMode={isDarkMode} />;
      case 'propose-resolution':
        return <ProposeResolutionContent isDarkMode={isDarkMode} />;
      case 'self-resolution':
        return <SelfResolutionContent isDarkMode={isDarkMode} />;
      case 'dispute-resolution':
        return <DisputeResolutionContent isDarkMode={isDarkMode} />;
      case 'faqs':
        return <FAQsContent isDarkMode={isDarkMode} />;
      default:
        return <OverviewContent isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`flex-1 ${isDarkMode ? 'bg-[#141414]' : 'bg-white'} rounded-lg border ${isDarkMode ? 'border-zinc-700' : 'border-gray-200'} p-8`}>
      {renderContent()}
    </div>
  );
};

export default DocsContent;