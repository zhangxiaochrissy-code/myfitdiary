import React, { useState, useMemo } from "react";
import { OOTDRecord, ClothingItem, AccessoryItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Tag,
  Grid,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  PlusCircle,
  TrendingUp,
  Heart,
  ChevronRight,
  Info,
  Check,
} from "lucide-react";

interface VirtualClosetProps {
  records: OOTDRecord[];
  onSelectLook: (date: string) => void;
}

interface ClosetItem {
  id: string; // unique key: color_type_detail
  type: string;
  color: string;
  detail: string;
  category: "top" | "bottom" | "dress" | "shoes" | "bag" | "accessory";
  usageCount: number;
  dates: string[];
  associatedRecords: OOTDRecord[];
}

export default function VirtualCloset({ records, onSelectLook }: VirtualClosetProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "top" | "bottom" | "dress" | "shoes" | "bag" | "accessory"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemDetail, setSelectedItemDetail] = useState<ClosetItem | null>(null);

  // Parse all records to extract distinct garments and categorize them
  const closetItems = useMemo(() => {
    const itemsMap: Record<string, ClosetItem> = {};

    const addOrUpdateItem = (
      item: ClothingItem | AccessoryItem | undefined,
      category: ClosetItem["category"],
      record: OOTDRecord
    ) => {
      if (!item || !item.type) return;
      
      const typeStr = item.type.trim();
      const colorStr = item.color ? item.color.trim() : "无色";
      const detailStr = item.detail ? item.detail.trim() : "";
      
      // Unique grouping key
      const key = `${category}_${colorStr}_${typeStr}_${detailStr}`;

      if (itemsMap[key]) {
        itemsMap[key].usageCount += 1;
        if (!itemsMap[key].dates.includes(record.date)) {
          itemsMap[key].dates.push(record.date);
          itemsMap[key].associatedRecords.push(record);
        }
      } else {
        itemsMap[key] = {
          id: key,
          type: typeStr,
          color: colorStr,
          detail: detailStr,
          category,
          usageCount: 1,
          dates: [record.date],
          associatedRecords: [record],
        };
      }
    };

    records.forEach((record) => {
      const items = record.items;
      if (!items) return;

      // Detect Dresses (连衣裙)
      // Usually entered in top or bottom with names containing "连衣裙", "长裙", "吊带裙", "连身裙", "沙滩裙", "礼裙", "半身裙" is bottoms, but general "裙子"
      const isTopDress = /连衣裙|长裙|吊带裙|连身裙|沙滩裙|礼裙|公主裙/.test(items.top?.type || "");
      const isBottomDress = /连衣裙|长裙|吊带裙|连身裙|沙滩裙|礼裙|公主裙/.test(items.bottom?.type || "");

      // 1. Top
      if (items.top && items.top.type) {
        if (isTopDress) {
          addOrUpdateItem(items.top, "dress", record);
        } else {
          addOrUpdateItem(items.top, "top", record);
        }
      }

      // 2. Bottom
      if (items.bottom && items.bottom.type) {
        if (isBottomDress) {
          addOrUpdateItem(items.bottom, "dress", record);
        } else {
          addOrUpdateItem(items.bottom, "bottom", record);
        }
      }

      // 3. Shoes
      if (items.shoes && items.shoes.type) {
        addOrUpdateItem(items.shoes, "shoes", record);
      }

      // 4. Accessories (partition bag and accessories)
      if (items.accessories && Array.isArray(items.accessories)) {
        items.accessories.forEach((acc) => {
          const isBag = /包|手提|手袋|托特|皮包|提包|斜挎|双肩|背包|腋下/.test(acc.type || "");
          if (isBag) {
            addOrUpdateItem(acc, "bag", record);
          } else {
            addOrUpdateItem(acc, "accessory", record);
          }
        });
      }
    });

    // Convert map to list and sort by usage count desc
    return Object.values(itemsMap).sort((a, b) => b.usageCount - a.usageCount);
  }, [records]);

  // Dynamic summary information
  const categoryCounts = useMemo(() => {
    const counts = {
      all: closetItems.length,
      top: 0,
      bottom: 0,
      dress: 0,
      shoes: 0,
      bag: 0,
      accessory: 0,
    };
    closetItems.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, [closetItems]);

  // Filter items based on selected category and search query
  const filteredItems = useMemo(() => {
    return closetItems.filter((item) => {
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [closetItems, selectedCategory, searchQuery]);

  // Find most loved pieces
  const mostLovedItems = useMemo(() => {
    return [...closetItems]
      .filter((i) => i.usageCount > 1)
      .slice(0, 3);
  }, [closetItems]);

  // Color suggestions for user based on their garments
  const smartTips = useMemo(() => {
    const tips: string[] = [];
    const colors = closetItems.map((i) => i.color);
    const countOfColor = (c: string) => colors.filter((x) => x.includes(c)).length;

    if (countOfColor("粉") > 1) {
      tips.push("🌸 你的衣橱富含粉色系，不妨搭配冷白或浅蓝单品，完美演绎多巴胺的元气甜酷！");
    }
    if (countOfColor("白") > 2 || countOfColor("奶白") > 1) {
      tips.push("🕊️ 白/米白色系单品充足。推荐尝试 Clean Fit 的顺色（Tone-on-Tone）玩法，显得高级优雅。");
    }
    if (countOfColor("黑") > 2) {
      tips.push("🖤 拥有稳定的黑色极简基盘，推荐尝试辅以一件超饱和色（如克莱因蓝、勃艮第红）饰品进行撞色！");
    }
    if (categoryCounts.dress > 1) {
      tips.push("🩰 优雅连衣裙已注册，非常合适配合罗马织带鞋或珍珠发饰，穿出当下爆红的 Balletcore 氛围。");
    }
    if (categoryCounts.shoes === 0) {
      tips.push("💡 点击右上角或日历，多增加几次 OOTD 留影，衣橱鞋帽信息将自动同步哦。");
    }
    if (tips.length === 0) {
      tips.push("✨ 随时记录穿搭即可解锁属于你的色彩撞色方案与高频鞋配诊断！");
    }
    return tips;
  }, [closetItems, categoryCounts]);

  const categoryTabList = [
    { key: "all", label: "全部单品", icon: "✨", color: "bg-stone-100 text-stone-800" },
    { key: "top", label: "时髦上衣", icon: "👚", color: "bg-amber-100/70 text-amber-800" },
    { key: "bottom", label: "宽松下装", icon: "👖", color: "bg-sky-100/70 text-sky-800" },
    { key: "dress", label: "连衣裙款", icon: "👗", color: "bg-rose-100/70 text-rose-800" },
    { key: "shoes", label: "百搭鞋履", icon: "👟", color: "bg-emerald-100/70 text-emerald-800" },
    { key: "bag", label: "质感包包", icon: "👜", color: "bg-purple-100/70 text-purple-800" },
    { key: "accessory", label: "精巧配饰", icon: "💍", color: "bg-pink-100/70 text-pink-800" },
  ] as const;

  return (
    <div className="bg-white rounded-3xl border border-stone-200 p-5 md:p-6 shadow-sm flex flex-col gap-6">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-stone-900 flex items-center gap-2">
            👚 云端智能衣橱 <span className="text-xs bg-stone-900 text-white font-mono font-bold px-2 py-0.5 rounded-full">CLOSET</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            基于你日常穿搭打卡自动生成的智能分类衣橱。穿透日期检索，知晓你喜爱的配色与闲置服饰。
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜单品、颜色或设计细节..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-2xs py-2 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-stone-500 focus:bg-white focus:outline-none transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 font-bold text-xs"
            >
              消除
            </button>
          )}
        </div>
      </div>

      {/* Grid of Categories statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
        {categoryTabList.map((tab) => {
          const isActive = selectedCategory === tab.key;
          return (
            <button
              id={`closet-tab-${tab.key}`}
              key={tab.key}
              onClick={() => {
                setSelectedCategory(tab.key);
                setSelectedItemDetail(null);
              }}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-300 relative cursor-pointer ${
                isActive
                  ? "border-stone-900 bg-stone-900 text-white shadow-md scale-102"
                  : "border-stone-100 bg-stone-50/50 text-stone-700 hover:bg-stone-50 hover:border-stone-250"
              }`}
            >
              <span className="text-xl mb-1">{tab.icon}</span>
              <span className="text-[11px] font-bold tracking-tight block">{tab.label}</span>
              <span
                className={`text-[9px] font-semibold px-2 py-0.2 rounded-full mt-1.5 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-stone-200 text-stone-700 font-mono"
                }`}
              >
                {categoryCounts[tab.key]} 件
              </span>
            </button>
          );
        })}
      </div>

      {/* Smart styling insights & stats layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Left main: Garments inventory cards list */}
        <div className="md:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-stone-400" />
              正在检索：
              <span className="text-stone-900 font-extrabold normal-case">
                {categoryTabList.find((t) => t.key === selectedCategory)?.label}
              </span>
              {searchQuery && ` (匹配 "${searchQuery}")`}
            </span>

            <span className="text-[10px] text-stone-400 font-medium">
              共筛选出 {filteredItems.length} 款
            </span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-3 bg-stone-50/20">
              <span className="text-3xl">👗</span>
              <p className="text-xs text-stone-500 font-medium max-w-sm leading-relaxed">
                衣橱该分类目前空空如也。点击右上角“记录新 Look”，添加衣服类别和颜色，AI 就会马上给你自动归入云端整理！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {filteredItems.map((item) => {
                const badgeColor = categoryTabList.find((t) => t.key === item.category)?.color || "bg-stone-100 text-stone-800";
                const isSelected = selectedItemDetail?.id === item.id;

                return (
                  <div
                    id={`closet-item-card-${item.id}`}
                    key={item.id}
                    onClick={() => {
                      setSelectedItemDetail(isSelected ? null : item);
                    }}
                    className={`bg-stone-50/50 rounded-2xl border p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:bg-white flex flex-col justify-between group relative ${
                      isSelected
                        ? "border-pink-300 ring-4 ring-pink-50"
                        : "border-stone-200/60"
                    }`}
                  >
                    <div>
                      {/* upper tags */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${badgeColor}`}>
                          {item.color}
                        </span>
                        
                        {item.usageCount > 1 && (
                          <span className="bg-rose-50 text-rose-600 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            🔥 {item.usageCount} 次穿搭
                          </span>
                        )}
                      </div>

                      {/* Main description */}
                      <h4 className="text-[13px] font-bold text-stone-950 group-hover:text-pink-600 transition-colors">
                        {item.type}
                      </h4>
                      
                      {item.detail ? (
                        <p className="text-[10px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.detail}
                        </p>
                      ) : (
                        <p className="text-[9px] text-stone-400 mt-1 italic">
                          (暂无特有纹理/版型标注)
                        </p>
                      )}
                    </div>

                    <div className="mt-3.5 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        首录 {item.dates[item.dates.length - 1]}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isSelected ? "rotate-90 text-pink-500" : ""}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side panel: Selected Garment Detail Drawer OR Love List & Tips */}
        <div className="bg-stone-50/30 rounded-3xl border border-stone-200 p-4.5 flex flex-col gap-4.5 md:col-span-4">
          <AnimatePresence mode="wait">
            {selectedItemDetail ? (
              <motion.div
                key="detail-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                {/* Details of a specific item */}
                <div className="border-b border-stone-200/60 pb-3 flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">单品名片 CARD</span>
                    <h3 className="text-sm font-extrabold text-stone-950 mt-0.5">
                      {selectedItemDetail.color} {selectedItemDetail.type}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedItemDetail(null)}
                    className="text-stone-400 hover:text-stone-600 text-xs font-bold bg-white border border-stone-200 px-2 py-1 rounded-lg"
                  >
                    关闭
                  </button>
                </div>

                {/* Stat pills */}
                <div className="grid grid-cols-2 gap-2 bg-white/70 p-3 rounded-2xl border border-stone-150">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-stone-400 font-semibold mb-0.5">衣服功勋榜</span>
                    <span className="text-sm font-black text-rose-600">{selectedItemDetail.usageCount} 次</span>
                  </div>
                  <div className="flex flex-col items-center border-l border-stone-150">
                    <span className="text-[10px] text-stone-400 font-semibold mb-0.5">常配流派 / Vibe</span>
                    <span className="text-xs font-extrabold text-pink-600">
                      {selectedItemDetail.category === "top" ? "日常穿搭" : 
                       selectedItemDetail.category === "bottom" ? "街拍必备" :
                       selectedItemDetail.category === "dress" ? "约会法式" : "心动单品"}
                    </span>
                  </div>
                </div>

                {/* Specific descriptions */}
                {selectedItemDetail.detail && (
                  <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-3">
                    <span className="text-[10px] text-amber-800 font-extrabold block mb-1">🔍 材质与设计细节</span>
                    <p className="text-[11px] text-stone-600 leading-relaxed">
                      {selectedItemDetail.detail}
                    </p>
                  </div>
                )}

                {/* History Wear History */}
                <div>
                  <span className="text-[10.5px] font-extrabold text-stone-500 block mb-2">📅 曾出场穿搭历史记录</span>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {selectedItemDetail.associatedRecords.map((rec) => {
                      const hasImage = rec.imageBase64 && !rec.imageBase64.startsWith("gradient-");
                      return (
                        <div
                          key={rec.id}
                          onClick={() => onSelectLook(rec.date)}
                          className="bg-white hover:bg-pink-50/20 border border-stone-200/60 p-2.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer hover:border-pink-200 transition-all group"
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Small preview thumbnail */}
                            <div className="w-10 h-12 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 flex-shrink-0 flex items-center justify-center">
                              {hasImage ? (
                                <img
                                  src={rec.imageBase64}
                                  alt="OOTD Preview"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-base">{rec.mood || "✨"}</span>
                              )}
                            </div>
                            
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-stone-900 group-hover:text-pink-600 transition-colors">
                                {rec.date}
                              </span>
                              <span className="text-[10px] text-stone-500 line-clamp-1 max-w-[140px]">
                                {rec.scenes ? rec.scenes.join("/") : "日常"} 搭配
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center text-[10px] font-extrabold text-stone-400 group-hover:text-pink-600 transition-colors">
                            查看 OOTD
                            <ChevronRight className="w-3 h-3 ml-0.5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="summary-panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4.5"
              >
                {/* Loved list */}
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <h3 className="text-xs font-extrabold text-stone-900 uppercase tracking-wider">高频爱穿单品 Top 3</h3>
                  </div>

                  {mostLovedItems.length === 0 ? (
                    <div className="bg-white/80 border border-stone-150 rounded-2xl p-3 py-4 text-center">
                      <p className="text-[10px] text-stone-400 font-medium">暂时没有被重复穿搭的衣服哦</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {mostLovedItems.map((item, index) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItemDetail(item)}
                          className="bg-white hover:bg-stone-50 border border-stone-200/60 p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black w-4.5 h-4.5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-mono">
                              {index + 1}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-stone-900">
                                {item.color} {item.type}
                              </span>
                              <span className="text-[9px] text-stone-400 uppercase font-semibold">
                                {categoryTabList.find((t) => t.key === item.category)?.label}
                              </span>
                            </div>
                          </div>

                          <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-md">
                            穿搭 {item.usageCount} 次
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Live advisory and color tips */}
                <div className="bg-gradient-to-br from-amber-50 to-pink-50/60 rounded-2xl p-4 border border-amber-100/50 flex flex-col gap-2.5 shadow-2xs">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-extrabold text-amber-850 tracking-wide">衣橱撞色与购买避雷建议</span>
                  </div>
                  
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                    {smartTips.map((tip, idx) => (
                      <div key={idx} className="bg-white/90 border border-amber-100/35 p-2 rounded-xl text-[10.5px] leading-relaxed text-stone-700 flex items-start gap-1.5 shadow-2xs">
                        <p className="flex-1 font-medium">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Helpful guides */}
                <div className="bg-white/60 rounded-xl p-3 border border-stone-200/50 flex gap-2 items-start text-stone-500">
                  <Info className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-relaxed font-semibold">
                    提示：在下方卡片中点击“立即发起社交流行大诊断”或直接上传新照片后，AI 都会更敏锐地识别衣柜的高阶搭配哦！
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
