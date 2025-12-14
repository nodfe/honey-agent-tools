// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet, show_window, hide_window, toggle_window_visibility])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
