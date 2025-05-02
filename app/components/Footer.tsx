"use client";

import Link from "next/link";

const footerCategories = [
  {
    title: "Games",
    links: [
      { label: "Fortnite", href: "/games/fortnite" },
      { label: "Fall Guys", href: "/games/fall-guys" },
      { label: "Rocket League", href: "/games/rocket-league" },
      { label: "Unreal Tournament", href: "/games/unreal-tournament" },
      { label: "Infinity Blade", href: "/games/infinity-blade" },
      { label: "Shadow Complex", href: "/games/shadow-complex" },
      { label: "Robo Recall", href: "/games/robo-recall" }
    ]
  },
  {
    title: "Marketplaces",
    links: [
      { label: "Epic Games Store", href: "/store" },
      { label: "Fab", href: "/fab" },
      { label: "SketchFab", href: "/sketchfab" },
      { label: "ArtStation", href: "/artstation" },
      { label: "Store Refund Policy", href: "/store-refund-policy" },
      { label: "Store EULA", href: "/store-eula" }
    ]
  },
  {
    title: "Tools",
    links: [
      { label: "Unreal Engine", href: "/unreal-engine" },
      { label: "UEFN", href: "/uefn" },
      { label: "MetaHuman", href: "/metahuman" },
      { label: "Twinmotion", href: "/twinmotion" },
      { label: "Megascans", href: "/megascans" },
      { label: "RealityScan", href: "/realityscan" },
      { label: "Rad Game Tools", href: "/rad-game-tools" }
    ]
  },
  {
    title: "Online Services",
    links: [
      { label: "Epic Online Services", href: "/epic-online-services" },
      { label: "Kids Web Services", href: "/kids-web-services" },
      { label: "Services Agreement", href: "/services-agreement" },
      { label: "Acceptable Use Policy", href: "/acceptable-use-policy" },
      { label: "Trust Statement", href: "/trust-statement" },
      { label: "Subprocessor List", href: "/subprocessor-list" }
    ]
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Newsroom", href: "/newsroom" },
      { label: "Careers", href: "/careers" },
      { label: "Students", href: "/students" },
      { label: "UX Research", href: "/ux-research" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Our Community", href: "/our-community" },
      { label: "MegaGrants", href: "/megagrants" },
      { label: "Support-A-Creator", href: "/support-a-creator" },
      { label: "Creator Agreement", href: "/creator-agreement" },
      { label: "Distribute on Epic Games", href: "/distribute" },
      { label: "Unreal Engine Branding Guidelines", href: "/unreal-engine-branding-guidelines" },
      { label: "Fan Art Policy", href: "/fan-art-policy" },
      { label: "Community Rules", href: "/community-rules" },
      { label: "EU Digital Services Act Inquiries", href: "/eu-dsa-inquiries" },
      { label: "Epic Pro Support", href: "/epic-pro-support" }
    ]
  }
];

const Footer = () => {
  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <footer className="bg-[#121212] text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <Link 
            href="/" 
            className="text-white font-bold"
            tabIndex={0}
            aria-label="Epic Games Store"
          >
            STORE
          </Link>
          <div className="flex space-x-4">
            <Link 
              href="https://facebook.com/epicgames" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400"
              tabIndex={0}
              aria-label="Epic Games Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
              </svg>
            </Link>
            <Link 
              href="https://twitter.com/epicgames" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400"
              tabIndex={0}
              aria-label="Epic Games Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
              </svg>
            </Link>
            <Link 
              href="https://youtube.com/epicgamesinc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-400"
              tabIndex={0}
              aria-label="Epic Games YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5-6-3.5v7z"/>
              </svg>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {footerCategories.map((category, index) => (
            <div key={index}>
              <h3 className="text-white font-medium mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-gray-400 hover:text-white"
                      tabIndex={0}
                      aria-label={link.label}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-6 text-xs text-gray-500">
          <p className="mb-4">
            © 2023, Epic Games, Inc. All rights reserved. Epic, Epic Games, the Epic Games logo, Fortnite, the Fortnite logo, Unreal, Unreal Engine, the Unreal Engine logo, Unreal Tournament, and the Unreal Tournament logo are trademarks or registered trademarks of Epic Games, Inc. in the United States of America and elsewhere. Other brands or product names are the trademarks of their respective owners. Non-US transactions through Epic Games International, S.à r.l. Our website may contain links to other sites and resources provided by third parties. These links are provided for your convenience only. Epic Games has no control over the contents of those sites or resources, and accepts no responsibility for them or for any loss or damage that may arise from your use of them.
          </p>
          <div className="flex flex-wrap gap-6 mb-6">
            <Link 
              href="/terms-of-service" 
              className="text-gray-400 hover:text-white"
              tabIndex={0}
              aria-label="Terms of service"
            >
              Terms of service
            </Link>
            <Link 
              href="/privacy-policy" 
              className="text-gray-400 hover:text-white"
              tabIndex={0}
              aria-label="Privacy policy"
            >
              Privacy policy
            </Link>
            <Link 
              href="/safety-security" 
              className="text-gray-400 hover:text-white"
              tabIndex={0}
              aria-label="Safety & security"
            >
              Safety & security
            </Link>
            <Link 
              href="/store-refund-policy" 
              className="text-gray-400 hover:text-white"
              tabIndex={0}
              aria-label="Store refund policy"
            >
              Store refund policy
            </Link>
            <Link 
              href="/publisher-index" 
              className="text-gray-400 hover:text-white"
              tabIndex={0}
              aria-label="Publisher index"
            >
              Publisher index
            </Link>
          </div>
        </div>

        <div className="text-right">
          <button 
            onClick={handleBackToTop}
            className="inline-flex items-center text-sm text-gray-400 hover:text-white"
            tabIndex={0}
            aria-label="Back to top"
          >
            Back to top
            <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 