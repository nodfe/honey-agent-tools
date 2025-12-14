import { register, unregisterAll } from "@tauri-apps/plugin-global-shortcut";
import { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../store/appStore";
import { useShortcutStore } from "../store/shortcutStore";

// 全局单例模式 - 确保快捷键只被注册一次
const globalShortcutManager = {
  isRegistered: false,
  registrationId: null as number | null,
  cleanup: null as (() => Promise<void>) | null,
};

// 按键状态机 - 追踪每个快捷键的按下/松开状态
// true = 已按下（下次触发是松开），false = 已松开（下次触发是按下）
const keyPressState = new Map<string, boolean>();

// 注册计数器 - 追踪注册次数
let registrationCounter = 0;

export const useShortcut = () => {
  const shortcuts = useShortcutStore((state) => state.shortcuts);

  // 使用 ref 跟踪注册状态，防止在开发模式下重复注册
  const registrationId = useRef<number | null>(null);
  const isInitializing = useRef(false);
  const lastRegisteredShortcuts = useRef<string>("");
  const isRegistered = useRef(false);
  const managerRef = useRef(globalShortcutManager);

  // 清理函数
  const cleanupShortcuts = useCallback(async () => {
    console.log("🔧 [快捷键系统] 开始清理快捷键...");
    try {
      await unregisterAll();
      console.log("✅ [快捷键系统] 快捷键清理成功");
    } catch (error) {
      console.error("❌ [快捷键系统] 快捷键清理失败:", error);
    }

    // 重置全局单例状态
    managerRef.current.isRegistered = false;
    managerRef.current.registrationId = null;
    managerRef.current.cleanup = null;

    // 重置本地状态
    registrationId.current = null;
    isInitializing.current = false;
    lastRegisteredShortcuts.current = "";
    isRegistered.current = false;
  }, []);

  // 注册函数
  const registerShortcuts = useCallback(async () => {
    console.log(
      "🔧 [注册函数] 开始注册，当前 managerRef.current:",
      managerRef.current
    );

    // 检查全局单例是否已经注册过
    if (managerRef.current.isRegistered) {
      console.log("🔧 [快捷键系统] 全局快捷键已经注册过，跳过重复注册");
      return;
    }

    // 防止重复初始化
    if (isInitializing.current) {
      console.log("🔧 [快捷键系统] 正在初始化，跳过重复调用");
      return;
    }

    // 生成当前快捷键配置的字符串表示
    const toggleKey = shortcuts.toggleWindow;
    const toggleAccelerator = `${toggleKey.modifiers.join("+")}+${
      toggleKey.key
    }`;
    const settingsKey = shortcuts.openSettings;
    const settingsAccelerator = `${settingsKey.modifiers.join("+")}+${
      settingsKey.key
    }`;
    const currentShortcutsString = `${toggleAccelerator}:${settingsAccelerator}`;

    // 如果快捷键配置没有变化且已经注册过，则跳过
    if (
      lastRegisteredShortcuts.current === currentShortcutsString &&
      registrationId.current !== null
    ) {
      console.log("🔧 [快捷键系统] 快捷键配置未变化，跳过重新注册");
      return;
    }

    isInitializing.current = true;
    console.log("🔧 [快捷键系统] 开始注册全局快捷键...", shortcuts);

    try {
      // 先清理现有的快捷键
      await cleanupShortcuts();

      // 注册新的快捷键 - 使用注册去重机制
      registrationCounter++;
      console.log(
        `🔧 [快捷键系统] 注册切换窗口快捷键: ${toggleAccelerator} (第${registrationCounter}次注册)`
      );

      // 创建唯一的注册ID，确保每个快捷键只注册一次
      const registrationKey = `registered_${toggleAccelerator}`;
      if ((window as any)[registrationKey]) {
        console.log(
          `🔧 [注册去重] 快捷键 ${toggleAccelerator} 已经注册过，跳过`
        );
        return;
      }
      (window as any)[registrationKey] = true;

      await register(toggleAccelerator, async () => {
        const triggerId = Date.now()
        console.log(`🔧 [调试] 进入快捷键回调函数，触发ID:`, triggerId)
        
        // 状态机逻辑：交替处理按下和松开事件
        // 获取当前状态，默认为false（未按下）
        const isCurrentlyPressed = keyPressState.get(toggleAccelerator) || false
        
        if (isCurrentlyPressed) {
          // 当前是按下状态，这次触发是松开事件，忽略
          console.log(`🚀 [快捷键触发] 检测到松开事件，忽略: ${toggleAccelerator}`)
          keyPressState.set(toggleAccelerator, false) // 标记为已松开
          return
        }
        
        // 当前是松开状态，这次触发是按下事件，执行
        keyPressState.set(toggleAccelerator, true) // 标记为已按下
        console.log(`🚀 [快捷键触发] 检测到按下事件: ${toggleAccelerator}`)
        console.log('🚀 [快捷键触发] 准备调用 toggleWindow...')
        
        try {
          await useAppStore.getState().toggleWindow()
          console.log('🚀 [快捷键触发] toggleWindow 调用完成')
        } catch (error) {
          console.error('❌ [快捷键触发] toggleWindow 调用失败:', error)
        }
      });

      console.log(`🔧 [快捷键系统] 注册设置快捷键: ${settingsAccelerator}`)
      await register(settingsAccelerator, async () => {
        const triggerId = Date.now()
        console.log(`🔧 [调试] 进入快捷键回调函数，触发ID:`, triggerId)
        
        // 状态机逻辑：交替处理按下和松开事件
        // 获取当前状态，默认为false（未按下）
        const isCurrentlyPressed = keyPressState.get(settingsAccelerator) || false
        
        if (isCurrentlyPressed) {
          // 当前是按下状态，这次触发是松开事件，忽略
          console.log(`🚀 [快捷键触发] 检测到松开事件，忽略: ${settingsAccelerator}`)
          keyPressState.set(settingsAccelerator, false) // 标记为已松开
          return
        }
        
        // 当前是松开状态，这次触发是按下事件，执行
        keyPressState.set(settingsAccelerator, true) // 标记为已按下
        console.log(`🔧 [快捷键触发] 检测到按下事件: ${settingsAccelerator}`)
        console.log('🔧 [快捷键触发] 准备调用 toggleSettings...')
        
        try {
          await useAppStore.getState().toggleSettings()
          console.log('🚀 [快捷键触发] toggleSettings 调用完成')
        } catch (error) {
          console.error('❌ [快捷键触发] toggleSettings 调用失败:', error)
        }
      })

      console.log("✅ [快捷键系统] 所有快捷键注册成功:", {
        toggleWindow: toggleAccelerator,
        openSettings: settingsAccelerator,
      });

      // 更新全局单例状态
      managerRef.current.isRegistered = true;
      managerRef.current.registrationId = Date.now();
      managerRef.current.cleanup = cleanupShortcuts;
      console.log("✅ [注册函数] 成功设置全局单例:", managerRef.current);

      // 更新本地状态
      lastRegisteredShortcuts.current = currentShortcutsString;
      registrationId.current = Date.now();
      isRegistered.current = true;
    } catch (error) {
      console.error("❌ [快捷键系统] 快捷键注册失败:", error);
      await cleanupShortcuts();
    } finally {
      isInitializing.current = false;
    }
  }, [shortcuts, cleanupShortcuts]);

  useEffect(() => {
    let timeoutId: number;

    console.log("🔧 [useEffect] useEffect 被调用，依赖:", {
      registerShortcuts: registerShortcuts.toString().length,
      cleanupShortcuts: cleanupShortcuts.toString().length,
    });

    const initializeShortcuts = () => {
      // 使用 setTimeout 延迟注册，防止 React.StrictMode 的双重渲染问题
      timeoutId = window.setTimeout(() => {
        console.log("🔧 [useEffect] 执行 registerShortcuts 调用");
        registerShortcuts();
      }, 100);
    };

    console.log("🔧 [useEffect] 准备调用 initializeShortcuts");
    initializeShortcuts();

    return () => {
      console.log("🔧 [useEffect] 清理 useEffect");
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      cleanupShortcuts();
    };
  }, [registerShortcuts, cleanupShortcuts]);
};
