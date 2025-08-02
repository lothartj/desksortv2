const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');

const FILE_TYPES = {
  documents: ['.pdf', '.docx', '.txt', '.odt', '.rtf'],
  spreadsheets: ['.xls', '.xlsx', '.csv', '.ods'],
  presentations: ['.pptx', '.odp', '.key'],
  images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
  videos: ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv'],
  audio: ['.mp3', '.wav', '.aac', '.ogg', '.flac'],
  archives: ['.zip', '.rar', '.7z', '.tar.gz', '.tar', '.gz'],
  code: ['.js', '.py', '.rs', '.cpp', '.html', '.css', '.json', '.ts'],
  executables: ['.exe', '.msi', '.sh', '.bat', '.AppImage'],
};

class FileSorter {
  constructor(db) {
    this.db = db;
  }

  async scanDesktop() {
    const desktopPath = app.getPath('desktop');
    try {
      const items = await fs.readdir(desktopPath);
      const fileStats = await Promise.all(
        items.map(async (item) => {
          const fullPath = path.join(desktopPath, item);
          const stats = await fs.stat(fullPath);
          return {
            name: item,
            path: fullPath,
            isDirectory: stats.isDirectory(),
            extension: path.extname(item).toLowerCase(),
          };
        })
      );
      return fileStats;
    } catch (error) {
      console.error('Error scanning desktop:', error);
      throw error;
    }
  }

  async sortFiles(rules) {
    const desktopPath = app.getPath('desktop');
    const files = await this.scanDesktop();
    const results = {
      processed: 0,
      skipped: 0,
      errors: [],
    };

    for (const file of files) {
      try {
        if (file.isDirectory) {
          results.skipped++;
          continue;
        }

        const rule = rules.find((r) => {
          if (!r.enabled) return false;
          const extensions = r.extensions.split(',').map(ext => ext.trim().toLowerCase());
          return extensions.includes(file.extension);
        });

        if (!rule) {
          results.skipped++;
          continue;
        }

        await fs.ensureDir(rule.destination);

        const destPath = await this.getUniqueDestPath(
          path.join(rule.destination, file.name)
        );

        await fs.move(file.path, destPath);
        
        await this.logOperation({
          source_path: file.path,
          destination_path: destPath,
          rule_id: rule.id,
          success: true,
        });

        results.processed++;
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.errors.push({
          file: file.name,
          error: error.message,
        });
        
        await this.logOperation({
          source_path: file.path,
          destination_path: '',
          rule_id: rule?.id,
          success: false,
          error_message: error.message,
        });
      }
    }

    return results;
  }

  async getUniqueDestPath(destPath) {
    const ext = path.extname(destPath);
    const base = path.basename(destPath, ext);
    const dir = path.dirname(destPath);
    let newPath = destPath;
    let counter = 1;

    while (await fs.pathExists(newPath)) {
      newPath = path.join(dir, `${base}_${counter}${ext}`);
      counter++;
    }

    return newPath;
  }

  async logOperation(operation) {
    const stmt = this.db.prepare(`
      INSERT INTO sort_history 
      (source_path, destination_path, rule_id, success, error_message)
      VALUES (@source_path, @destination_path, @rule_id, @success, @error_message)
    `);
    return stmt.run(operation);
  }
}

module.exports = FileSorter; 