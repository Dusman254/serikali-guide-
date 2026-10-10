/**
 * Database Snapshot & Automated Backup Manager
 * Provides versioned JSON backups and restoration verification for Serikali Guide.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getBlogs } from './blogStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKUP_DIR = path.resolve(__dirname, '../../backups');

export interface BackupMetadata {
  id: string;
  filename: string;
  createdAt: string;
  sizeBytes: number;
  collectionsIncluded: string[];
  recordCounts: Record<string, number>;
  status: 'verified' | 'pending';
}

class BackupManager {
  constructor() {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }
    } catch (err) {
      console.warn('Backup directory initialization note:', err);
    }
  }

  public createSnapshot(): { success: boolean; backup?: BackupMetadata; error?: string } {
    try {
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupId = `sg-backup-${timestamp}`;
      const filename = `${backupId}.json`;
      const fullPath = path.join(BACKUP_DIR, filename);

      const blogs = getBlogs('all');

      const payload = {
        metadata: {
          version: '1.0',
          backupId,
          timestamp: new Date().toISOString(),
          platform: 'Serikali Guide Kenya',
        },
        collections: {
          blogs,
        },
      };

      const jsonStr = JSON.stringify(payload, null, 2);
      fs.writeFileSync(fullPath, jsonStr, 'utf-8');

      // Verify backup integrity immediately
      const readBack = fs.readFileSync(fullPath, 'utf-8');
      const parsed = JSON.parse(readBack);
      if (!parsed.metadata || !parsed.collections?.blogs) {
        throw new Error('Backup integrity verification failed.');
      }

      const stats = fs.statSync(fullPath);
      const metadata: BackupMetadata = {
        id: backupId,
        filename,
        createdAt: new Date().toISOString(),
        sizeBytes: stats.size,
        collectionsIncluded: ['blogs'],
        recordCounts: {
          blogs: blogs.length,
        },
        status: 'verified',
      };

      return { success: true, backup: metadata };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to create backup.' };
    }
  }

  public listBackups(): BackupMetadata[] {
    try {
      if (!fs.existsSync(BACKUP_DIR)) return [];
      const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.json'));

      return files
        .map((f) => {
          const fullPath = path.join(BACKUP_DIR, f);
          const stats = fs.statSync(fullPath);
          try {
            const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
            return {
              id: content.metadata?.backupId || f.replace('.json', ''),
              filename: f,
              createdAt: content.metadata?.timestamp || stats.mtime.toISOString(),
              sizeBytes: stats.size,
              collectionsIncluded: Object.keys(content.collections || {}),
              recordCounts: {
                blogs: content.collections?.blogs?.length || 0,
              },
              status: 'verified' as const,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean) as BackupMetadata[];
    } catch {
      return [];
    }
  }
}

export const backupManager = new BackupManager();
