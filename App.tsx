import { useState } from 'react';

interface ModConfig {
  // Tab 1: Slots
  jokerSlotsGame: number;
  consumableSlotsGame: number;
  jokerSlotsShop: number;
  consumableSlotsShop: number;
  // Tab 2: Money
  startingMoney: number;
  interestCap: number;
  interestRate: number;
  dollarsPerInterest: number;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'slots' | 'money' | 'about'>('slots');
  const [config, setConfig] = useState<ModConfig>({
    jokerSlotsGame: 5,
    consumableSlotsGame: 2,
    jokerSlotsShop: 2,
    consumableSlotsShop: 2,
    startingMoney: 4,
    interestCap: 25,
    interestRate: 1,
    dollarsPerInterest: 5,
  });
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState('CustomSlotsMoney');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const tabs: ('slots' | 'money' | 'about')[] = ['slots', 'money', 'about'];
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    const currentIndex = tabs.indexOf(activeTab);
    
    if (isLeftSwipe && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
    if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const updateConfig = (key: keyof ModConfig, value: number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateLuaCode = () => {
    return `--- STEAMODDED HEADER
--- MOD_NAME: ${fileName}
--- MOD_ID: ${fileName}
--- MOD_AUTHOR: WinterWolf VN
--- MOD_DESCRIPTION: Mod chinh sua Joker Slots, Consumable Slots, Money
--- PREFIX: csm
--- VERSION: 1.0.0

----------------------------------------------
--          BALATRO MOD PACK v1.0           --
----------------------------------------------

-- ============================================
-- CAU HINH MOD - SLOTS
-- ============================================
local JOKER_SLOTS_GAME = ${config.jokerSlotsGame}
local CONSUMABLE_SLOTS_GAME = ${config.consumableSlotsGame}
local JOKER_SLOTS_SHOP = ${config.jokerSlotsShop}
local CONSUMABLE_SLOTS_SHOP = ${config.consumableSlotsShop}

-- ============================================
-- CAU HINH MOD - MONEY
-- ============================================
local STARTING_MONEY = ${config.startingMoney}
local INTEREST_CAP = ${config.interestCap}
local INTEREST_RATE = ${config.interestRate}
local DOLLARS_PER_INTEREST = ${config.dollarsPerInterest}

-- ============================================
-- CODE MOD - KHONG CAN CHINH SUA
-- ============================================

local mod_config = {
    joker_slots_game = JOKER_SLOTS_GAME,
    consumable_slots_game = CONSUMABLE_SLOTS_GAME,
    joker_slots_shop = JOKER_SLOTS_SHOP,
    consumable_slots_shop = CONSUMABLE_SLOTS_SHOP,
    starting_money = STARTING_MONEY,
    interest_cap = INTEREST_CAP,
    interest_rate = INTEREST_RATE,
    dollars_per_interest = DOLLARS_PER_INTEREST
}

-- Ap dung khi bat dau run
local game_start_run_ref = Game.start_run
function Game:start_run(args)
    local ret = game_start_run_ref(self, args)
    
    -- Ap dung Joker Slots
    if G.jokers then
        G.jokers.config.card_limit = mod_config.joker_slots_game
    end
    
    -- Ap dung Consumable Slots
    if G.consumeables then
        G.consumeables.config.card_limit = mod_config.consumable_slots_game
    end
    
    -- Ap dung Starting Money
    if G.GAME then
        G.GAME.dollars = mod_config.starting_money
        G.GAME.interest_cap = mod_config.interest_cap
    end
    
    return ret
end

-- Ap dung cho Shop
local shop_create_ref = G.UIDEF.shop
if shop_create_ref then
    G.UIDEF.shop = function()
        local ret = shop_create_ref()
        if G.shop_jokers then
            G.shop_jokers.config.card_limit = mod_config.joker_slots_shop
        end
        if G.shop_vouchers then
            G.shop_vouchers.config.card_limit = mod_config.consumable_slots_shop
        end
        return ret
    end
end

sendDebugMessage("${fileName} loaded!")
sendDebugMessage("Joker Slots: " .. mod_config.joker_slots_game)
sendDebugMessage("Starting Money: $" .. mod_config.starting_money)
`;
  };

  const downloadFile = () => {
    const content = generateLuaCode();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.lua`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateLuaCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-md border-b border-purple-500/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🃏</div>
            <div>
              <h1 className="text-3xl font-bold text-white">Balatro Mod Creator</h1>
              <p className="text-purple-300">
                Tương thích SMods - by WinterWolf VN
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-2 pt-4">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('slots')}
            className={`flex-1 py-2 px-2 rounded-t-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
              activeTab === 'slots'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <span className="text-base sm:text-lg">🎰</span>
            <span className="hidden sm:inline">SLOTS</span>
            <span className="sm:hidden">Slots</span>
          </button>
          <button
            onClick={() => setActiveTab('money')}
            className={`flex-1 py-2 px-2 rounded-t-lg font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
              activeTab === 'money'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            <span className="text-base sm:text-lg">💰</span>
            <span className="hidden sm:inline">MONEY</span>
            <span className="sm:hidden">Money</span>
          </button>
          <button
            onClick={() => setActiveTab