/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { WhatsAppOTPMockModal } from './components/common/WhatsAppOTPMockModal';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { AuthLandingScreen } from './components/auth/AuthLandingScreen';

import { CustomerHome } from './components/customer/CustomerHome';
import { StoreDetailModal } from './components/customer/StoreDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { LiveOrderTrackingModal } from './components/customer/LiveOrderTrackingModal';
import { SendPackageModal } from './components/customer/SendPackageModal';
import { DigitalPPOBModal } from './components/customer/DigitalPPOBModal';
import { CustomerOrdersView } from './components/customer/CustomerOrdersView';
import { CustomerProfileView } from './components/customer/CustomerProfileView';
import { CustomerChatSupportModal } from './components/customer/CustomerChatSupportModal';

import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { CourierDashboard } from './components/courier/CourierDashboard';
import { AdminFounderDashboard } from './components/admin/AdminFounderDashboard';
import { Store, Order } from './types';

function MainAppContent() {
  const { currentRole, activeOrder, setActiveOrder, orders, isAuthenticated } = useApp();

  // Modals and tabs
  const [customerNavTab, setCustomerNavTab] = useState<'home' | 'orders' | 'chat' | 'account'>('home');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [isSendPackageOpen, setIsSendPackageOpen] = useState(false);
  const [isPPOBOpen, setIsPPOBOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatSupportOpen, setIsChatSupportOpen] = useState(false);

  // Active orders badge
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  const handleOpenStore = (store: Store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(true);
  };

  const handleOpenTracking = (order: Order) => {
    setActiveOrder(order);
    setIsTrackingModalOpen(true);
  };

  const handleBottomNavChange = (tab: 'home' | 'orders' | 'chat' | 'account') => {
    if (tab === 'chat') {
      setIsChatSupportOpen(true);
      return;
    }
    setCustomerNavTab(tab);
  };

  // Requirement: Primary screen when not logged in is the stunning AuthLandingScreen!
  if (!isAuthenticated) {
    return (
      <>
        <PWAInstallBanner />
        <AuthLandingScreen onLoginSuccess={() => setCustomerNavTab('home')} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <PWAInstallBanner />

      {/* Persistent Header */}
      <Header
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Role-Based Views */}
      <main className="flex-1">
        {currentRole === 'customer' && (
          <>
            {customerNavTab === 'home' && (
              <CustomerHome
                onSelectStore={handleOpenStore}
                onOpenSendPackage={() => setIsSendPackageOpen(true)}
                onOpenPPOB={() => setIsPPOBOpen(true)}
                onOpenCart={() => setIsCartOpen(true)}
                onOpenOrders={() => setCustomerNavTab('orders')}
              />
            )}

            {customerNavTab === 'orders' && (
              <CustomerOrdersView
                onBackToHome={() => setCustomerNavTab('home')}
                onOpenTracking={handleOpenTracking}
              />
            )}

            {customerNavTab === 'account' && (
              <CustomerProfileView
                onOpenRoleModal={() => setIsRoleModalOpen(true)}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            )}

            {/* Bottom Nav for customer */}
            <BottomNav
              activeTab={customerNavTab}
              onChangeTab={handleBottomNavChange}
              ordersBadgeCount={activeOrdersCount}
            />
          </>
        )}

        {currentRole === 'merchant' && (
          <MerchantDashboard onOpenRoleModal={() => setIsRoleModalOpen(true)} />
        )}

        {currentRole === 'courier' && (
          <CourierDashboard onOpenRoleModal={() => setIsRoleModalOpen(true)} />
        )}

        {currentRole === 'admin' && (
          <AdminFounderDashboard onOpenRoleModal={() => setIsRoleModalOpen(true)} />
        )}
      </main>

      {/* Modals */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      <WhatsAppOTPMockModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <StoreDetailModal
        store={selectedStore}
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={() => {
          setIsTrackingModalOpen(true);
        }}
      />

      <LiveOrderTrackingModal
        order={activeOrder}
        isOpen={isTrackingModalOpen}
        onClose={() => setIsTrackingModalOpen(false)}
      />

      <SendPackageModal
        isOpen={isSendPackageOpen}
        onClose={() => setIsSendPackageOpen(false)}
        onSuccess={() => setIsTrackingModalOpen(true)}
      />

      <DigitalPPOBModal
        isOpen={isPPOBOpen}
        onClose={() => setIsPPOBOpen(false)}
      />

      <CustomerChatSupportModal
        isOpen={isChatSupportOpen}
        onClose={() => setIsChatSupportOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
