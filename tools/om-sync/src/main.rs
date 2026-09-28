use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

/// OasisMind content sync scanner
#[derive(Parser)]
#[command(name = "om-sync")]
#[command(about = "Scan content directories and emit NDJSON records", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Scan a directory for files and parse frontmatter
    Scan {
        /// Directory to scan
        dir: PathBuf,

        /// File extension to match (e.g. .md)
        #[arg(long, default_value = ".md")]
        ext: String,

        /// Output format: ndjson or json
        #[arg(long, default_value = "ndjson")]
        format: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncRecord {
    pub slug: String,
    pub mtime_ms: i64,
    pub data: PostData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PostData {
    pub slug: String,
    pub title: String,
    pub content: String,
    pub excerpt: Option<String>,
    pub published: bool,
    pub category: Option<String>,
    pub tags: String,
}

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Scan { dir, ext, format } => {
            let records = scan_dir(&dir, &ext)?;
            match format.as_str() {
                "json" => {
                    let out = serde_json::to_string_pretty(&records)?;
                    println!("{}", out);
                }
                _ => {
                    for record in records {
                        let line = serde_json::to_string(&record)?;
                        println!("{}", line);
                    }
                }
            }
        }
    }
    Ok(())
}

fn scan_dir(dir: &Path, ext: &str) -> Result<Vec<SyncRecord>> {
    let mut records = Vec::new();
    let entries = get_files_recursive(dir, ext);

    for file_path in entries {
        match parse_markdown_file(dir, &file_path) {
            Ok(Some(record)) => records.push(record),
            Ok(None) => {}
            Err(e) => {
                eprintln!("parse failed {}: {}", file_path.display(), e);
            }
        }
    }

    Ok(records)
}

fn get_files_recursive(dir: &Path, ext: &str) -> Vec<PathBuf> {
    let ignore_dirs = ["images", "public", "assets", ".trash"];

    WalkDir::new(dir)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            if e.file_type().is_dir() && e.depth() > 0 {
                let name = e.file_name().to_string_lossy();
                if name.starts_with('.') || name.starts_with('_') {
                    return false;
                }
                if ignore_dirs.iter().any(|d| name == *d) {
                    return false;
                }
            }
            true
        })
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .filter(|e| {
            let name = e.file_name().to_string_lossy();
            !name.starts_with('_') && name.ends_with(ext)
        })
        .map(|e| e.path().to_path_buf())
        .collect()
}

fn parse_markdown_file(content_dir: &Path, file_path: &Path) -> Result<Option<SyncRecord>> {
    let slug = file_path_to_slug(content_dir, file_path)?;
    let mtime_ms = get_file_mtime_ms(file_path)?;
    let raw = fs::read_to_string(file_path)
        .with_context(|| format!("read file {}", file_path.display()))?;

    let (data, content) = extract_frontmatter(&raw);

    let title = data
        .get("title")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .unwrap_or_else(|| slug.clone());

    let category = data
        .get("category")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let excerpt = data
        .get("excerpt")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let published = data
        .get("published")
        .and_then(|v| v.as_bool())
        .unwrap_or(true);

    let tags = match data.get("tags") {
        Some(serde_json::Value::Array(arr)) => arr
            .iter()
            .filter_map(|v| v.as_str())
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>()
            .join(","),
        Some(serde_json::Value::String(s)) => s.clone(),
        _ => String::new(),
    };

    Ok(Some(SyncRecord {
        slug: slug.clone(),
        mtime_ms,
        data: PostData {
            slug,
            title,
            content,
            excerpt,
            published,
            category,
            tags,
        },
    }))
}

fn file_path_to_slug(content_dir: &Path, file_path: &Path) -> Result<String> {
    let relative = file_path.strip_prefix(content_dir).with_context(|| {
        format!(
            "{} not under {}",
            file_path.display(),
            content_dir.display()
        )
    })?;
    let mut slug = relative.to_string_lossy().replace('\\', "/");
    if let Some(pos) = slug.rfind('.') {
        slug.truncate(pos);
    }
    Ok(slug)
}

fn get_file_mtime_ms(file_path: &Path) -> Result<i64> {
    let metadata = fs::metadata(file_path)?;
    let mtime = metadata
        .modified()
        .with_context(|| format!("get mtime {}", file_path.display()))?;
    let duration = mtime.duration_since(std::time::UNIX_EPOCH)?;
    Ok(duration.as_millis() as i64)
}

/// Extract frontmatter and content, matching TS parseMarkdownFile behavior
fn extract_frontmatter(raw: &str) -> (HashMap<String, serde_json::Value>, String) {
    let (frontmatter, content) = split_frontmatter(raw).unwrap_or((None, raw.to_string()));

    // Strip nested frontmatter from content up to 5 times (matches stripLeadingMarkdownFrontmatter)
    let mut content = content;
    for _ in 0..5 {
        let trimmed = content.trim_start();
        if let Some((_, next)) = split_frontmatter(trimmed) {
            content = next;
        } else {
            content = trimmed.to_string();
            break;
        }
    }
    let content = content.trim_start_matches(['\r', '\n']).to_string();

    let data = frontmatter
        .and_then(|s| serde_yaml::from_str::<HashMap<String, serde_json::Value>>(&s).ok())
        .unwrap_or_default();

    (data, content)
}

/// Split a markdown string into frontmatter and content
fn split_frontmatter(text: &str) -> Option<(Option<String>, String)> {
    let text = text.strip_prefix('\u{FEFF}').unwrap_or(text);
    let text = text.trim_start();
    if !text.starts_with("---") {
        return None;
    }

    let first_line_end = text.find('\n')?;
    if text[..first_line_end].trim() != "---" {
        return None;
    }

    let rest = &text[first_line_end + 1..];
    let close_pos = rest.find("\n---")?;
    let frontmatter = rest[..close_pos].trim().to_string();

    // Skip past the closing "---" line
    let close_start = close_pos + 1;
    let after_close = &rest[close_start..];
    let content = after_close[3..].to_string();

    Some((Some(frontmatter), content))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_file_path_to_slug() {
        let content_dir = Path::new("content/posts");
        let file_path = Path::new("content/posts/a/b.md");
        assert_eq!(file_path_to_slug(content_dir, file_path).unwrap(), "a/b");
    }

    #[test]
    fn test_split_frontmatter() {
        let raw = "---\ntitle: Hello\n---\n# Content";
        let (fm, content) = split_frontmatter(raw).unwrap();
        assert_eq!(fm.unwrap(), "title: Hello");
        assert_eq!(content, "\n# Content");
    }

    #[test]
    fn test_extract_frontmatter() {
        let raw = "---\ntitle: Hello\ntags: [a, b]\n---\n# Content";
        let (data, content) = extract_frontmatter(raw);
        assert_eq!(data["title"].as_str().unwrap(), "Hello");
        assert_eq!(content, "# Content");
    }

    #[test]
    fn test_nested_frontmatter() {
        let raw = "---\ntitle: A\n---\n---\ntitle: B\n---\nBody";
        let (data, content) = extract_frontmatter(raw);
        assert_eq!(data["title"].as_str().unwrap(), "A");
        assert_eq!(content, "Body");
    }

    #[test]
    fn test_parse_markdown_file() -> Result<()> {
        let temp_dir = tempfile::tempdir()?;
        let file_path = temp_dir.path().join("test.md");
        let mut f = fs::File::create(&file_path)?;
        write!(
            f,
            "---\ntitle: Test Post\ntags: [rust, sync]\npublished: true\n---\nHello world"
        )?;
        drop(f);

        let record = parse_markdown_file(temp_dir.path(), &file_path)?.unwrap();
        assert_eq!(record.slug, "test");
        assert_eq!(record.data.title, "Test Post");
        assert_eq!(record.data.content, "Hello world");
        assert_eq!(record.data.tags, "rust,sync");
        assert!(record.data.published);
        Ok(())
    }

    #[test]
    fn test_get_files_recursive_ignores_dirs() {
        let temp_dir = tempfile::tempdir().unwrap();
        let ignored = temp_dir.path().join(".trash");
        fs::create_dir(&ignored).unwrap();
        fs::write(ignored.join("a.md"), "x").unwrap();
        fs::write(temp_dir.path().join("b.md"), "y").unwrap();

        let files = get_files_recursive(temp_dir.path(), ".md");
        assert_eq!(files.len(), 1);
        assert_eq!(files[0].file_name().unwrap(), "b.md");
    }
}
