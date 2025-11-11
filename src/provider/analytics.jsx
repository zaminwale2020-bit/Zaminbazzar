"use client";

import Script from "next/script";

const CHAT_BOT_ID = process.env.NEXT_PUBLIC_CHAT_BOT_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_TAG_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_TAG_ID;

export default function Analytics() {
  return (
    <>
      {/* ✅ Google Tag Manager */}
      {GTM_ID && (
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
      )}

      {/* ✅ Google Analytics */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      {/* ✅ Chatbot Script */}
      {CHAT_BOT_ID && (
        <Script
          id="collect-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w, d) { 
                w.CollectId = "${CHAT_BOT_ID}"; 
                var h = d.head || d.getElementsByTagName("head")[0]; 
                var s = d.createElement("script"); 
                s.setAttribute("type", "text/javascript");
                s.async = true;
                s.setAttribute("src", "https://collectcdn.com/launcher.js"); 
                h.appendChild(s); 
              })(window, document);
            `,
          }}
        />
      )}
    </>
  );
}
