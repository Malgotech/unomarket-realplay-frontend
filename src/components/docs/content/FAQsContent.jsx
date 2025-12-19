import React from 'react';

const FAQsContent = ({ isDarkMode }) => {
  const faqs = [
    {
      question: "How does Soundbet differ from traditional polling?",
      answer: "Traditional polling relies on surveys to gauge public opinion, often limited by sample size and bias. Soundbet's prediction market, however, uses real-time trading of shares in USDC to reflect collective user predictions on event outcomes. Prices (1–100 cents) indicate probabilities, driven by financial stakes, making Soundbet more dynamic and potentially more accurate due to the \"wisdom of crowds.\" Unlike polls, Soundbet incentivizes informed predictions, offering a transparent, market-based alternative for forecasting events like elections or sports."
    },
    {
      question: "How do prediction markets like Soundbet confirm news or events?",
      answer: "Prediction markets like Soundbet act as a real-time barometer for event outcomes by aggregating user trades into share prices that reflect probabilities. For example, a sudden price surge for a \"Yes\" outcome may signal emerging news or sentiment before official confirmation. Soundbet's peer-to-peer trading, backed by trusted resolution sources, validates news by aligning market outcomes with verified results, providing a crowdsourced method to anticipate and confirm events with higher accuracy than traditional news cycles."
    },
    {
      question: "How can I contact Soundbet support?",
      answer: "Soundbet offers dedicated support through its official Discord server. Users can join the server via a link on the Soundbet website, access the support channel, and submit queries or issues. The support team responds promptly to questions about account management, trading, disputes, or technical issues. For urgent matters, users can also email support through the platform's helpdesk, ensuring accessible and responsive assistance."
    },
    {
      question: "Is my money safe on Soundbet?",
      answer: "Soundbet prioritizes user fund safety within its centralized platform. Funds in USDC/USDT are held in secure, audited wallets, protected by robust encryption and two-factor authentication (2FA). The platform's peer-to-peer trading model ensures Soundbet does not take positions against users, reducing risk. However, users should use secure wallets, enable 2FA, and verify wallet addresses during deposits/withdrawals to minimize errors. Soundbet is not responsible for losses due to user errors or external bridge platform issues. Note: To reduce this risk of value loss due reasons like de-pegging, we manage funds in proportions of 40% in USDC, 40% USDT, 20% in Bitcoin, Ethereum and Solana. Please note that any value accretion shall not be passed to the users, however if there is a value loss in any of these assets, the loss shall be passed on to the users."
    },
    {
      question: "Can I trade on Soundbet from any country?",
      answer: "Soundbet is accessible globally, provided users have a compatible cryptocurrency wallet and internet access. However, users must comply with their local regulations regarding cryptocurrency trading and prediction markets. Soundbet's centralized platform ensures a consistent user experience worldwide, but it's the user's responsibility to verify legal compliance in their jurisdiction before participating."
    },
    {
      question: "What happens if a market event is canceled or postponed?",
      answer: "If an event is canceled or postponed beyond the market's resolution date, Soundbet follows predefined rules outlined in the market's terms. Typically, markets may resolve as \"void,\" with shares refunded at their purchase price, or extended to a new resolution date if the event is rescheduled. Users are notified of any changes, and clarifications are provided via the market page to ensure transparency."
    },
    {
      question: "How does Soundbet ensure fair market creation?",
      answer: "Soundbet uses AI validation to ensure markets have balanced probabilities (at least 10%-15% per outcome) and clear resolution criteria. User-suggested markets are vetted for feasibility and relevance, preventing biased or unviable markets. This process, combined with trusted sources for resolution, ensures fairness and encourages active, competitive trading across all markets."
    }
  ];

  return (
    <div className="prose max-w-none">
      <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
        Frequently Asked Questions
      </h1>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className={`p-6 rounded-lg ${isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-50 border border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-[#C5C5C5]' : 'text-zinc-800'}`}>
              {index + 1}. {faq.question}
            </h3>
            <p className={`text-base leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>


    </div>
  );
};

export default FAQsContent;