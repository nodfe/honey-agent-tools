// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[tauri::command]
async fn show_window(window: tauri::Window) -> Result<(), String> {
    println!("🎯 [TAURI命令] show_window 命令被调用");
    println!("🎯 [TAURI命令] 尝试显示窗口...");
    match window.show() {
        Ok(_) => {
            println!("✅ [TAURI命令] 窗口显示成功");
            Ok(())
        },
        Err(e) => {
            println!("❌ [TAURI命令] 窗口显示失败: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn hide_window(window: tauri::Window) -> Result<(), String> {
    println!("🎯 [TAURI命令] hide_window 命令被调用");
    println!("🎯 [TAURI命令] 尝试隐藏窗口...");
    match window.hide() {
        Ok(_) => {
            println!("✅ [TAURI命令] 窗口隐藏成功");
            Ok(())
        },
        Err(e) => {
            println!("❌ [TAURI命令] 窗口隐藏失败: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn toggle_window_visibility(window: tauri::Window) -> Result<(), String> {
    println!("🎯 [TAURI命令] toggle_window_visibility 命令被调用");
    
    println!("🔍 [TAURI命令] 检查当前窗口状态...");
    match window.is_visible() {
        Ok(is_visible) => {
            println!("🔍 [TAURI命令] 当前窗口状态: {}", if is_visible { "可见" } else { "隐藏" });
            
            if is_visible {
                println!("📤 [TAURI命令] 窗口可见，执行隐藏操作...");
                match window.hide() {
                    Ok(_) => {
                        println!("✅ [TAURI命令] 窗口隐藏成功");
                        Ok(())
                    },
                    Err(e) => {
                        println!("❌ [TAURI命令] 窗口隐藏失败: {}", e);
                        Err(e.to_string())
                    }
                }
            } else {
                println!("📥 [TAURI命令] 窗口隐藏，执行显示操作...");
                match window.show() {
                    Ok(_) => {
                        println!("✅ [TAURI命令] 窗口显示成功");
                        Ok(())
                    },
                    Err(e) => {
                        println!("❌ [TAURI命令] 窗口显示失败: {}", e);
                        Err(e.to_string())
                    }
                }
            }
        }
        Err(e) => {
            println!("❌ [TAURI命令] 检查窗口状态失败: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
async fn set_window_size(window: tauri::Window, width: f64, height: f64) -> Result<(), String> {
    println!("🎯 [TAURI命令] set_window_size 命令被调用: width={}, height={}", width, height);
    
    use tauri::Size;
    use tauri::LogicalSize;
    
    let size = Size::Logical(LogicalSize { width, height });
    
    match window.set_size(size) {
        Ok(_) => {
            println!("✅ [TAURI命令] 窗口尺寸设置成功");
            Ok(())
        },
        Err(e) => {
            println!("❌ [TAURI命令] 窗口尺寸设置失败: {}", e);
            Err(e.to_string())
        }
    }
}

use serde::{Deserialize, Serialize};
use tauri::{Emitter, Manager};

#[derive(Serialize, Deserialize, Clone, Debug)]
struct PluginData {
    plugin_id: String,
    plugin_name: String,
    input: String,
    result: serde_json::Value,
}

#[tauri::command]
async fn create_plugin_window(
    app: tauri::AppHandle,
    data: PluginData,
) -> Result<(), String> {
    println!("🎯 [TAURI命令] create_plugin_window 命令被调用: {:?}", data);
    
    // 不隐藏主窗口，只是失去焦点
    // 这样用户再次呼出时不会空白
    
    // 检查插件窗口是否已存在
    if let Some(existing_window) = app.get_webview_window("plugin-window") {
        println!("⚠️ [TAURI命令] 插件窗口已存在，先关闭旧窗口");
        existing_window.close().map_err(|e| e.to_string())?;
    }

    // 创建插件窗口
    println!("🪟 [TAURI命令] 创建新的插件窗口...");
    let plugin_window = tauri::WebviewWindowBuilder::new(
        &app,
        "plugin-window",
       tauri::WebviewUrl::App("/plugin-result.html".into())
    )
    .title(&data.plugin_name)
    .inner_size(600.0, 400.0)
    .center()
    .resizable(true)
    .decorations(true)
    .always_on_top(true)
    .build()
    .map_err(|e| {
        println!("❌ [TAURI命令] 创建插件窗口失败: {}", e);
        e.to_string()
    })?;

    println!("✅ [TAURI命令] 插件窗口创建成功");

    // 克隆数据以便在异步任务中使用
    let data_clone = data.clone();
    let window_clone = plugin_window.clone();
    
    // 延迟发送数据，等待窗口完全加载
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(300));
        println!("📨 [TAURI命令] 延迟发送插件数据到窗口...");
        
        if let Err(e) = window_clone.emit("plugin-data", &data_clone) {
            println!("❌ [TAURI命令] 发送数据失败: {}", e);
        } else {
            println!("✅ [TAURI命令] 插件数据已发送");
        }
    });

    Ok(())
}

#[tauri::command]
async fn close_plugin_window(app: tauri::AppHandle) -> Result<(), String> {
    println!("🎯 [TAURI命令] close_plugin_window 命令被调用");
    
    // 关闭插件窗口
    if let Some(plugin_window) = app.get_webview_window("plugin-window") {
        println!("🔒 [TAURI命令] 关闭插件窗口...");
        plugin_window.close().map_err(|e| e.to_string())?;
        println!("✅ [TAURI命令] 插件窗口已关闭");
    } else {
        println!("⚠️ [TAURI命令] 插件窗口不存在");
    }

    // 聚焦主窗口（不需要显示，因为我们没有隐藏它）
    if let Some(main_window) = app.get_webview_window("main") {
        println!("📥 [TAURI命令] 聚焦主窗口...");
        main_window.set_focus().map_err(|e| e.to_string())?;
        println!("✅ [TAURI命令] 主窗口已聚焦");
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            show_window, 
            hide_window, 
            toggle_window_visibility,
            set_window_size,
            create_plugin_window,
            close_plugin_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
