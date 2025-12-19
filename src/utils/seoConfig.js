// SEO configurations for different pages
export const seoConfig = {
  home: {
    title: "UNOMARKET | Prediction Market | Money Predicts the World Better",
    description: "Trade on real-world events with UNOMARKET's prediction market. Sports, politics, economics - predict the future and profit from your insights.",
    keywords: "prediction market, trading, sports betting, political predictions, event trading",
    url: "https://soundbet.online"
  },
  
  market: {
    title: "Markets - UNOMARKET Prediction Trading",
    description: "Explore active prediction markets on UNOMARKET. Trade on sports outcomes, political events, economic indicators and more real-world events.",
    keywords: "prediction markets, event trading, sports markets, political betting, economic predictions",
    url: "https://soundbet.online/market"
  },
  
  sports: {
    title: "Sports Prediction Markets - UNOMARKET",
    description: "Trade on sports outcomes with UNOMARKET's sports prediction markets. Football, basketball, tennis and more sports events to predict and trade.",
    keywords: "sports prediction, sports betting, football predictions, basketball trading, tennis markets",
    url: "https://soundbet.online/market/sports"
  },
  
  tech: {
    title: "Technology Prediction Markets - UNOMARKET",
    description: "Trade on technology and innovation outcomes with UNOMARKET. AI developments, tech stock predictions, cryptocurrency trends and more tech events.",
    keywords: "technology prediction, tech markets, AI predictions, cryptocurrency trading, innovation betting",
    url: "https://soundbet.online/market/tech"
  },
  
  economy: {
    title: "Economy Prediction Markets - UNOMARKET",
    description: "Trade on economic indicators and financial events with UNOMARKET. Stock market predictions, inflation rates, GDP forecasts and economic trends.",
    keywords: "economy prediction, economic markets, financial forecasting, stock predictions, economic indicators",
    url: "https://soundbet.online/market/economy"
  },
  
  business: {
    title: "Business Prediction Markets - UNOMARKET",
    description: "Trade on business outcomes and corporate events with UNOMARKET. Company earnings, mergers, acquisitions and business developments.",
    keywords: "business prediction, corporate events, earnings forecasts, merger predictions, business trading",
    url: "https://soundbet.online/market/business"
  },
  
  popCulture: {
    title: "Pop Culture Prediction Markets - UNOMARKET",
    description: "Trade on entertainment and pop culture events with UNOMARKET. Awards shows, celebrity news, movie releases and entertainment industry predictions.",
    keywords: "pop culture prediction, entertainment betting, awards predictions, celebrity news, movie forecasts",
    url: "https://soundbet.online/market/pop-culture"
  },
  
  documentation: {
    title: "Documentation - How to Use UNOMARKET",
    description: "Learn how to use UNOMARKET's prediction market platform. Guides on trading, deposits, market resolution and platform features.",
    keywords: "UNOMARKET guide, prediction market tutorial, trading documentation, platform help",
    url: "https://soundbet.online/documentation"
  },
  
  profile: {
    title: "Profile - UNOMARKET Account",
    description: "Manage your UNOMARKET prediction market account. View trading history, portfolio performance and account settings.",
    keywords: "UNOMARKET profile, trading account, portfolio management, account settings",
    url: "https://soundbet.online/dashboard"
  },
  
  activity: {
    title: "Activity Feed - UNOMARKET",
    description: "Stay updated with the latest activity on UNOMARKET. Market thoughts, predictions and community insights.",
    keywords: "UNOMARKET activity, market thoughts, predictions feed, community insights",
    url: "https://soundbet.online/activity"
  },
  
  privacy: {
    title: "Privacy Policy - UNOMARKET",
    description: "UNOMARKET's privacy policy outlines how we collect, use and protect your personal information on our prediction market platform.",
    keywords: "privacy policy, data protection, user privacy, UNOMARKET terms",
    url: "https://soundbet.online/privacy"
  },
  
  terms: {
    title: "Terms of Use - UNOMARKET",
    description: "Terms of use for UNOMARKET's prediction market platform. User agreements, trading rules and platform policies.",
    keywords: "terms of use, user agreement, trading terms, platform rules",
    url: "https://soundbet.online/terms"
  }
};

// Market-specific SEO generator
export const generateMarketSEO = (marketTitle, marketDescription) => ({
  title: `${marketTitle} - UNOMARKET Prediction Market`,
  description: `Trade on "${marketTitle}" with UNOMARKET. ${marketDescription || 'Predict the outcome and profit from your insights.'}`,
  keywords: `${marketTitle}, prediction market, event trading, UNOMARKET`,
  type: "article"
});

// User-specific SEO generator
export const generateUserSEO = (username) => ({
  title: `${username} - UNOMARKET Profile`,
  description: `View ${username}'s prediction market activity and insights on UNOMARKET.`,
  keywords: `${username}, UNOMARKET profile, prediction trader, market insights`,
  type: "profile"
});
