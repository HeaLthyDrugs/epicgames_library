"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Game } from "../services/rawg-api";
import { useLibrary } from "../context/LibraryContext";

type ModalState = "checkout" | "processing" | "confirmation";

interface PurchaseModalProps {
  game: Game;
  onClose: () => void;
}

const PurchaseModal = ({ game, onClose }: PurchaseModalProps) => {
  const [modalState, setModalState] = useState<ModalState>("checkout");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const { addGameToLibrary } = useLibrary();
  const [isPrivacyConsent, setIsPrivacyConsent] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  // Generate a random order number when the component mounts
  useEffect(() => {
    const randomOrderNumber = `F${Math.floor(Math.random() * 10000000000000000)}`;
    setOrderNumber(randomOrderNumber);
  }, []);

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setModalState("processing");
      
      // Simulate processing delay
      setTimeout(() => {
        addGameToLibrary(game);
        setModalState("confirmation");
      }, 2000);
    }, 1500);
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Handle clicking outside to close only in confirmation state
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && modalState === "confirmation") {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {modalState === "checkout" && (
        <div 
          className="bg-white rounded-lg w-full max-w-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-[#202020] text-white p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">CHECKOUT</h2>
            <div className="flex items-center space-x-2">
              <div className="h-1 w-24 bg-[#0074e4]"></div>
              <div className="text-sm font-medium">ORDER SUMMARY</div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Close"
              tabIndex={0}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row">
            <div className="bg-[#F5F5F5] p-6 w-full md:w-2/3">
              <h3 className="text-xl font-semibold mb-6">REVIEW AND PLACE ORDER</h3>
              
              <div className="mb-8">
                <div className="text-sm text-gray-600 mb-2">Verify your information and click Place Order</div>
              </div>
            </div>
            
            <div className="bg-white p-6 w-full md:w-1/3 border-l border-gray-200">
              <h3 className="text-xl font-semibold mb-4">ORDER SUMMARY</h3>
              
              <div className="flex items-start mb-4">
                <div className="w-20 h-20 relative mr-4 flex-shrink-0">
                  <Image
                    src={game.background_image || "https://placehold.co/400x225/121212/cccccc?text=No+Image"}
                    alt={game.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{game.name}</h4>
                  <p className="text-sm text-gray-500">COGNOSPHERE PTE. LTD.</p>
                </div>
              </div>
              
              <div className="border-t border-b border-gray-200 py-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span>Price</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="privacy-consent"
                    checked={isPrivacyConsent}
                    onChange={() => setIsPrivacyConsent(!isPrivacyConsent)}
                    className="mt-1 mr-2"
                    tabIndex={0}
                  />
                  <label htmlFor="privacy-consent" className="text-xs text-gray-600">
                    Click here to agree to share your email with COGNOSPHERE PTE. LTD. COGNOSPHERE PTE. 
                    LTD. will use your email address provided for marketing purposes.
                    As detailed in the <a href="#" className="text-blue-600">privacy policy</a>, 
                    we encourage you to read it.
                  </label>
                </div>
              </div>
              
              <button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder}
                className="w-full bg-[#0074e4] text-white py-3 rounded font-medium hover:bg-[#0066cc] transition-colors relative disabled:opacity-80"
                tabIndex={0}
              >
                {isPlacingOrder ? (
                  <>
                    <span className="opacity-0">PLACE ORDER</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </>
                ) : (
                  "PLACE ORDER"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState === "processing" && (
        <div className="flex flex-col items-center justify-center bg-transparent">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-[#0074e4] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-white text-xl font-medium">Processing - Please Wait.</div>
          <div className="text-white/70 text-sm mt-2">This window will close automatically once completed.</div>
        </div>
      )}

      {modalState === "confirmation" && (
        <div 
          className="bg-[#121212] rounded-lg overflow-hidden w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 flex flex-col items-center">
            <div className="mb-6">
              <Image
                src="/images/purchase-success.svg"
                alt="Purchase Success"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            
            <div className="text-gray-400 text-sm mb-2">Order number {orderNumber}</div>
            <h2 className="text-white text-2xl font-bold mb-4">Thanks for your order!</h2>
            <div className="text-white mb-8">Ready to install your product?</div>
            
            <div className="flex space-x-4 w-full">
              <button
                onClick={onClose}
                className="flex-1 bg-[#202020] hover:bg-[#2a2a2a] text-white py-3 px-6 rounded"
                tabIndex={0}
              >
                Continue Browsing
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-[#0074e4] hover:bg-[#0066cc] text-white py-3 px-6 rounded"
                tabIndex={0}
              >
                Download Launcher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseModal; 