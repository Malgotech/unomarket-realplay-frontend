import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = "UNOMARKET | Prediction Market | Money Predicts the World Better",
  description = "UNOMARKET is a prediction market where you can trade on the outcome of real-world events. Buy and sell event contracts in sports, politics, economics and more.",
  keywords = "prediction market, trading, future events, sports betting, political predictions, economic forecasts, UAE fintech",
  image = "/soundbet-mail-logo.png",
  url = "https://soundbet.online",
  type = "website"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://soundbet.online/#organization",
        "name": "UNOMARKET",
        "url": "https://soundbet.online",
        "logo": {
          "@type": "ImageObject",
          "url": "https://soundbet.online/soundbet-mail-logo.png",
        },
        "description": "UNOMARKET is a prediction market where you can trade on the outcome of real-world events.",
        "foundingDate": "2025",
        "foundingLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "AE",
            "addressRegion": "UAE"
          }
        },
        "sameAs": [
          "https://x.com/soundbetofficial",
          "https://www.instagram.com/soundbetofficial/",
          "https://tiktok.com/soundbetofficial"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "English"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://soundbet.online/#website",
        "url": "https://soundbet.online",
        "name": "UNOMARKET",
        "description": "Prediction Market for Trading the Future",
        "publisher": {
          "@id": "https://soundbet.online/#organization"
        },
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://soundbet.online/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "WebPage",
        "@id": url + "#webpage",
        "url": url,
        "name": title,
        "description": description,
        "isPartOf": {
          "@id": "https://soundbet.online/#website"
        },
        "about": {
          "@id": "https://soundbet.online/#organization"
        },
        "inLanguage": "en-US"
      },
      {
        "@type": "FinancialService",
        "name": "UNOMARKET Prediction Market",
        "description": "A prediction market platform for trading on future events",
        "provider": {
          "@id": "https://soundbet.online/#organization"
        },
        "areaServed": {
          "@type": "Country",
          "name": "United Arab Emirates"
        },
        "serviceType": "Prediction Market Trading",
        "url": "https://soundbet.online"
      }
    ]
  };

  return (
    <Helmet>
      {/* Title */}
      <title>{title}</title>
      
      {/* Meta Tags */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default SEO;
