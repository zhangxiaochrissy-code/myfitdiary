import React from "react";
import { OOTDRecord } from "../types";
import { Shirt, Footprints, Palette, Compass, SunDim, Smile } from "lucide-react";

interface ClosetStatsProps {
  records: OOTDRecord[];
}

export default function ClosetStats({ records }: ClosetStatsProps) {
  // 1. Gather all statistical data
  const totalLookCount = records.length;

  const topColorFreq: { [key: string]: number } = {};
  const sceneFreq: { [key: string]: number } = {};
  const topTypeFreq: { [key: string]: number } = {};
  const bottomTypeFreq: { [key: string]: number } = {};
  const shoesTypeFreq: { [key: string]: number } = {};
  const accessoriesFreq: { [key: string]: number } = {};
  const moodFreq: { [key: string]: number } = {};

  records.forEach((r) => {
    // Colors helper
    const colors = [r.items.top.color, r.items.bottom.color, r.items.shoes.color];
    colors.forEach((c) => {
      if (!c) return;
      // Normalise and clean
      const cleaned = c.replace("经典", "").replace("纯", "").trim();
      topColorFreq[cleaned] = (topColorFreq[cleaned] || 0) + 1;
    });

    // Top categories
    if (r.items.top.type) {
      topTypeFreq[r.items.top.type] = (topTypeFreq[r.items.top.type] || 0) + 1;
    }
    // Bottom categories
    if (r.items.bottom.type) {
      bottomTypeFreq[r.items.bottom.type] = (bottomTypeFreq[r.items.bottom.type] || 0) + 1;
    }
    // Shoes categories
    if (r.items.shoes.type) {
      shoesTypeFreq[r.items.shoes.type] = (shoesTypeFreq[r.items.shoes.type] || 0) + 1;
    }

    // Scenes
    r.scenes.forEach((s) => {
      sceneFreq[s] = (sceneFreq[s] || 0) + 1;
    });

    // Accessories
    r.items.accessories.forEach((a) => {
      accessoriesFreq[a.type] = (accessoriesFreq[a.type] || 0) + 1;
    });

    // Moods
    if (r.mood) {
      moodFreq[r.mood] = (moodFreq[r.mood] || 0) + 1;
    }
  });

  // Sort helper
  const getSortedItems = (freqObj: { [key: string]: number }, max: number = 4) => {
    return Object.entries(freqObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max);
  };

  const topColors = getSortedItems(topColorFreq, 5);
  const topScenes = getSortedItems(sceneFreq, 4);
  const topAccessories = getSortedItems(accessoriesFreq, 3);
  const topTops = getSortedItems(topTypeFreq, 3);
  const topBottoms = getSortedItems(bottomTypeFreq, 3);

  // Helper to color palette tags
  const getColorBadgeStyle = (colorName: string) => {
    const map: { [key: string]: string } = {
      "白": "bg-stone-50 border-stone-300 text-stone-800",
      "白色": "bg-stone-50 border-stone-300 text-stone-800",
      "牛仔白": "bg-stone-50 border-stone-300 text-stone-800",
      "黑": "bg-stone-900 border-stone-950 text-white",
      "黑色": "bg-stone-900 border-stone-950 text-white",
      "经典黑": "bg-stone-900 border-stone-950 text-white",
      "浅蓝": "bg-sky-50 border-sky-300 text-sky-700",
      "粉色": "bg-pink-50 border-pink-300 text-pink-700",
      "杏粉色": "bg-pink-50 border-pink-200 text-pink-600",
      "棕色": "bg-amber-900 border-amber-950 text-amber-50",
      "奶茶棕": "bg-amber-100 border-amber-300 text-amber-900",
      "奶白色": "bg-amber-50/55 border-amber-200 text-stone-800",
      "燕麦色": "bg-stone-100 border-stone-300 text-stone-800",
      "灰": "bg-stone-200 border-stone-300 text-stone-700",
      "墨绿": "bg-emerald-950 border-emerald-950 text-emerald-100",
    };
    return map[colorName] || "bg-stone-50 border-stone-200 text-stone-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Cards: OOTD Total & Summary */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-stone-400 uppercase tracking-widest block">Summary stats</span>
          <h3 className="text-stone-900 text-lg font-semibold mt-1 flex items-center gap-2">
            🏷️ 穿衣搭配面板
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            由 AI 智能解析你拍摄的所有穿搭相片整合而成的个人着装风格统计。
          </p>
        </div>

        <div className="my-5 flex items-baseline gap-2">
          <span className="text-5xl font-mono font-bold text-stone-900">{totalLookCount}</span>
          <span className="text-sm text-stone-500 font-medium">套已记录 Look</span>
        </div>

        <div className="border-t border-stone-100 pt-3 flex items-center justify-between text-xs text-stone-500">
          <span>📅 数据跨度: 过去 30 天</span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">● 正常更新中</span>
        </div>
      </div>

      {/* Bento Item: Top Scenes & Occasions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-stone-400 uppercase tracking-widest block">Vibe & Scenes</span>
          <h3 className="text-stone-900 text-base font-semibold mt-1 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-stone-600" />
            热门穿着场景
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">你的衣橱搭配常在哪些场合亮相？</p>
        </div>

        <div className="my-4 flex flex-col gap-2.5">
          {topScenes.length > 0 ? (
            topScenes.map(([name, count]) => {
              const perc = Math.round((count / totalLookCount) * 100);
              return (
                <div key={name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs text-stone-700 font-medium pb-0.5">
                    <span className="flex items-center gap-1">📍 {name}</span>
                    <span>{count} 次 ({perc}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-stone-950 h-full rounded-full transition-all duration-500"
                      style={{ width: `${perc}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-xs text-stone-400">暂无场景穿搭数据，快去记录新Look吧！</div>
          )}
        </div>
      </div>

      {/* Bento Item: Color Chemistry Palette */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono font-medium text-stone-400 uppercase tracking-widest block">Color Chemistry</span>
          <h3 className="text-stone-900 text-base font-semibold mt-1 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-stone-600" />
            衣橱色彩偏好
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">AI 分析显示你在衣服、鞋底中的颜色频次。</p>
        </div>

        <div className="my-3 flex flex-wrap gap-2">
          {topColors.length > 0 ? (
            topColors.map(([color, count]) => (
              <div
                key={color}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${getColorBadgeStyle(
                  color
                )}`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-stone-300/40 opacity-90 block" style={{
                  backgroundColor: color === "浅蓝" ? "#bae6fd" : color === "粉色" || color === "杏粉色" ? "#fbcfe8" : color === "黑色" || color === "经典黑" ? "#171717" : color === "奶茶棕" ? "#d97706" : color === "白" || color === "白色" ? "#f5f5f4" : "#a8a29e"
                }}></span>
                {color}
                <span className="opacity-55 font-mono text-[10px]">({count})</span>
              </div>
            ))
          ) : (
            <div className="text-center w-full py-6 text-xs text-stone-400">尚无匹配色彩库</div>
          )}
        </div>

        <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 flex items-center gap-2 text-[11px] text-stone-600 mt-1">
          <span className="text-xs shrink-0">💡</span>
          <p className="line-clamp-2">
            你的穿衣色系主要偏向于{" "}
            <strong>{topColors[0]?.[0] || '基础'} 色调</strong> 与{" "}
            <strong>{topColors[1]?.[0] || '柔和'} 色调</strong>，多采用简约冷淡顺色法，尽显干练松弛。
          </p>
        </div>
      </div>

      {/* Bento Item: Category Silhouette Distribution */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 md:p-6 shadow-sm flex flex-col md:col-span-2 lg:col-span-3">
        <h3 className="text-stone-900 text-base font-semibold flex items-center gap-1.5 border-b border-stone-100 pb-3">
          <Shirt className="w-4.5 h-4.5 text-stone-700" />
          衣帽单品频次解析
          <span className="ml-auto font-mono text-[11px] text-stone-400 bg-stone-50 px-2 py-0.5 rounded border">Item categories</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Top category */}
          <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              👚 上装类 Top Items
            </h4>
            <div className="flex flex-col gap-2 mt-1">
              {topTops.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-stone-200/50">
                  <span className="text-stone-850 font-medium">{type}</span>
                  <span className="font-mono text-stone-500 bg-stone-50 px-2 py-0.5 rounded text-[10px]">{count} 次</span>
                </div>
              ))}
              {topTops.length === 0 && <span className="text-xs text-stone-400 py-3 text-center">暂无数据</span>}
            </div>
          </div>

          {/* Bottom category */}
          <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              👖 下装类 Bottoms
            </h4>
            <div className="flex flex-col gap-2 mt-1">
              {topBottoms.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-stone-200/50">
                  <span className="text-stone-850 font-medium">{type}</span>
                  <span className="font-mono text-stone-500 bg-stone-50 px-2 py-0.5 rounded text-[10px]">{count} 次</span>
                </div>
              ))}
              {topBottoms.length === 0 && <span className="text-xs text-stone-400 py-3 text-center">暂无数据</span>}
            </div>
          </div>

          {/* Accessories & Footwear category */}
          <div className="bg-stone-50/50 rounded-2xl p-4 border border-stone-100 flex flex-col gap-2">
            <h4 className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1">
              👜 配饰及随身物 Accessories
            </h4>
            <div className="flex flex-col gap-2 mt-1">
              {topAccessories.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs bg-white p-2 rounded-xl border border-stone-200/50">
                  <span className="text-stone-850 font-medium">{type}</span>
                  <span className="font-mono text-stone-500 bg-stone-50 px-2 py-0.5 rounded text-[10px]">{count} 次</span>
                </div>
              ))}
              {topAccessories.length === 0 && <span className="text-xs text-stone-400 py-3 text-center">暂无数据</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
